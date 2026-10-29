"""Execute the Europe PMC queries in a frozen plan with raw-page receipts.

Public anonymous metadata/abstract retrieval only. No benchmark access, screening,
full-text attestation, or edits to the frozen plan or upstream skill are performed.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import argparse
import hashlib
import html
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
TRIAL = ROOT / "research/retrieval-trial"
OUT = TRIAL / "europepmc"
OUT.mkdir(parents=True, exist_ok=True)
PLAN_BYTES = (TRIAL / "query-plan.json").read_bytes()
PLAN = json.loads(PLAN_BYTES)
BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
PAGE_SIZE = 1000
MAX_RECORDS = 1000


def now():
    return datetime.now(timezone.utc).isoformat()


def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def text(value):
    # Strip only known markup tags. A broad <...> expression deletes scientific
    # comparisons such as "<100 nm ... > control" and must not be used here.
    tags = r"</?(?:p|h[1-6]|i|b|em|strong|sup|sub|br|span|div|ul|ol|li|italic|bold|sc|xref|ext-link|u|sec|abstract|title)(?:\s+[^<>]*)?\s*/?>"
    return html.unescape(re.sub(tags, " ", value or "", flags=re.I)).strip()


def normalized(item, query_id):
    source, record_id = item.get("source", ""), item.get("id", "")
    pmid = item.get("pmid") or (record_id if source == "MED" else None)
    pmcid = item.get("pmcid")
    doi = item.get("doi")
    journal = item.get("journalInfo", {}).get("journal", {}).get("title")
    return {
        "id": f"EPMC:{source}:{record_id}", "source": "Europe PMC", "sourceDatabase": source,
        "sourceId": record_id, "pmid": pmid, "pmcid": pmcid, "doi": doi,
        "title": text(item.get("title")), "abstract": text(item.get("abstractText")),
        "year": item.get("pubYear"), "date": item.get("firstPublicationDate"),
        "pubType": item.get("pubTypeList", {}).get("pubType", []),
        "journal": journal, "authors": item.get("authorString"),
        "url": f"https://europepmc.org/article/{source}/{record_id}",
        "queryIds": [query_id], "readScope": "metadata_and_abstract_if_returned",
    }


def retrieve(query):
    query_id = query["id"]
    dest = OUT / query_id
    dest.mkdir(parents=True, exist_ok=True)
    receipt_path = dest / "retrieval.json"
    if receipt_path.exists():
        existing = json.loads(receipt_path.read_text(encoding="utf-8"))
        if existing.get("complete") and existing.get("plan_sha256") == hashlib.sha256(PLAN_BYTES).hexdigest():
            return existing, json.loads((dest / "records.json").read_text(encoding="utf-8"))
        raise RuntimeError(f"Preserve incomplete prior run: {receipt_path}")
    receipt = {"queryId": query_id, "query": query["query"], "purpose": query["purpose"],
               "endpoint": BASE, "started_at": now(), "plan_sha256": hashlib.sha256(PLAN_BYTES).hexdigest(),
               "page_size": PAGE_SIZE, "record_cap": MAX_RECORDS, "attempts": [], "pages": [],
               "total": None, "returned": 0, "complete": False}
    records, cursor, seen_cursors = [], "*", set()
    page_number = 0
    while cursor and cursor not in seen_cursors and len(records) < MAX_RECORDS:
        seen_cursors.add(cursor)
        page_number += 1
        params = {"query": query["query"], "format": "json", "resultType": "core",
                  "pageSize": str(min(PAGE_SIZE, MAX_RECORDS - len(records))), "cursorMark": cursor}
        url = BASE + "?" + urllib.parse.urlencode(params)
        response_bytes = None
        for attempt in range(1, 3):
            event = {"page": page_number, "attempt": attempt, "url": url, "started_at": now()}
            try:
                request = urllib.request.Request(url, headers={"User-Agent": "AcademicRetrievalTrial/1.0", "Accept": "application/json"})
                with urllib.request.urlopen(request, timeout=40) as response:
                    response_bytes = response.read()
                    event.update(status=response.status, bytes=len(response_bytes),
                                 content_type=response.headers.get("Content-Type"), final_url=response.url)
                event["finished_at"] = now()
                receipt["attempts"].append(event)
                break
            except Exception as exc:
                event.update(error=str(exc), status=getattr(exc, "code", None), finished_at=now())
                receipt["attempts"].append(event)
                save(receipt_path, receipt)
                if attempt == 1:
                    time.sleep(2)
        if response_bytes is None:
            receipt["stop_reason"] = "request_failed_after_two_attempts"
            break
        filename = f"page-{page_number:03d}.json"
        (dest / filename).write_bytes(response_bytes)
        data = json.loads(response_bytes)
        batch = data.get("resultList", {}).get("result", [])
        receipt["total"] = int(data.get("hitCount", 0))
        receipt["pages"].append({"file": filename, "sha256": hashlib.sha256(response_bytes).hexdigest(),
                                  "count": len(batch), "cursor": cursor, "next_cursor": data.get("nextCursorMark"),
                                  "request": params, "serverVersion": data.get("version")})
        records.extend(normalized(item, query_id) for item in batch)
        receipt["returned"] = len(records)
        save(dest / "records.json", records)
        save(receipt_path, receipt)
        print(json.dumps({"query": query_id, "page": page_number, "total": receipt["total"], "returned": len(records)}), flush=True)
        if len(records) >= receipt["total"]:
            receipt["complete"] = len(records) == receipt["total"]
            receipt["stop_reason"] = "all_reported_results_retrieved"
            break
        if not batch:
            receipt["stop_reason"] = "empty_page_before_reported_total"
            break
        cursor = data.get("nextCursorMark")
    if not receipt.get("stop_reason"):
        receipt["stop_reason"] = "record_cap" if len(records) >= MAX_RECORDS else "missing_or_repeated_cursor"
    receipt["finished_at"] = now()
    receipt["returned_unique_source_ids"] = len({row["id"] for row in records})
    receipt["complete"] = bool(receipt["complete"] and receipt["returned_unique_source_ids"] == receipt["returned"])
    save(dest / "records.json", records)
    save(receipt_path, receipt)
    return receipt, records


def main():
    global OUT, PLAN_BYTES, PLAN
    parser = argparse.ArgumentParser()
    parser.add_argument("--plan", default="research/retrieval-trial/query-plan.json",
                        help="Frozen plan path, relative to the project or absolute")
    parser.add_argument("--output-subdir", default="europepmc",
                        help="Separate result directory directly under research/retrieval-trial")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", args.output_subdir):
        raise SystemExit("Output subdirectory must be a single safe directory name.")
    plan_path = Path(args.plan)
    if not plan_path.is_absolute():
        plan_path = ROOT / plan_path
    PLAN_BYTES = plan_path.read_bytes()
    PLAN = json.loads(PLAN_BYTES)
    OUT = TRIAL / args.output_subdir
    OUT.mkdir(parents=True, exist_ok=True)
    queries = [q for q in PLAN["queries"] if q.get("source") == "Europe PMC REST"]
    if not queries:
        raise SystemExit("No Europe PMC REST query exists in the requested plan.")
    results = list(ThreadPoolExecutor(max_workers=2).map(retrieve, queries))
    merged = {}
    for _, records in results:
        for record in records:
            if record["id"] not in merged:
                merged[record["id"]] = record
            else:
                merged[record["id"]]["queryIds"] = sorted(set(merged[record["id"]]["queryIds"] + record["queryIds"]))
    save(OUT / "records.json", list(merged.values()))
    report = {"source": "Europe PMC REST", "endpoint": BASE, "plan_file": str(plan_path), "plan_sha256": hashlib.sha256(PLAN_BYTES).hexdigest(),
              "queries": [receipt for receipt, _ in results], "unique_records": len(merged),
              "boundary": "All records/abstracts returned for the frozen queries within the explicit cap. Europe PMC overlaps PubMed. Not full-text appraisal, screening, or a claim that all eligible literature exists in this index."}
    save(OUT / "retrieval.json", report)
    print(json.dumps({"queries": [{"id": r["queryId"], "total": r["total"], "returned": r["returned"], "complete": r["complete"]} for r, _ in results], "unique": len(merged)}), flush=True)


if __name__ == "__main__":
    main()
