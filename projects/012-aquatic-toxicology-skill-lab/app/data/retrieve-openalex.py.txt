"""Execute the disclosed OpenAlex amendment and one-hop citation expansion.

Anonymous public metadata queries, bounded basic paging, raw HTTP receipts.
This tool does not screen relevance, read full texts, access the benchmark, or
modify the frozen original plan. Existing operations are reused, never erased.
"""
import argparse
from datetime import datetime, timezone
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
OUT = TRIAL / "openalex"
OUT.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--amendment", default="amendment-openalex.json", help="Frozen amendment filename under retrieval-trial")
parser.add_argument("--query-only", action="store_true", help="Run only its disclosed topic query and merge the separate receipt")
ARGS = parser.parse_args()
AMENDMENT_BYTES = (TRIAL / ARGS.amendment).read_bytes()
AMENDMENT = json.loads(AMENDMENT_BYTES)
AMENDMENT_HASH = hashlib.sha256(AMENDMENT_BYTES).hexdigest()
BASE = "https://api.openalex.org/works"
PAGE_SIZE = 100
CAP = int(AMENDMENT.get("cap", 1000))
FIELDS = "id,doi,ids,title,abstract_inverted_index,publication_year,publication_date,type,primary_location,referenced_works,cited_by_count"


def now():
    return datetime.now(timezone.utc).isoformat()


def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def plain(value):
    return html.unescape(re.sub(r"<[^>]+>", " ", value or "")).strip()


def identifier(value):
    return str(value or "").rstrip("/").rsplit("/", 1)[-1]


def doi_key(value):
    return re.sub(r"^https?://(?:dx\.)?doi\.org/", "", str(value or "").strip(), flags=re.I).lower()


def abstract_text(index):
    if not isinstance(index, dict):
        return ""
    words = {}
    for token, positions in index.items():
        if not isinstance(token, str) or not isinstance(positions, list):
            continue
        for position in positions:
            if isinstance(position, int) and 0 <= position < 20000:
                words.setdefault(position, token)
    return " ".join(words[position] for position in sorted(words))


def normalize(item, query_id):
    ids = item.get("ids") or {}
    location = item.get("primary_location") or {}
    journal = location.get("source") or {}
    oa_id = item.get("id")
    doi = doi_key(item.get("doi")) or None
    return {
        "id": "OA:" + identifier(oa_id), "source": "OpenAlex", "OAid": oa_id,
        "doi": doi, "pmid": identifier(ids.get("pmid")) or None,
        "pmcid": identifier(ids.get("pmcid")) or None,
        "title": plain(item.get("title")), "abstract": abstract_text(item.get("abstract_inverted_index")),
        "year": item.get("publication_year"), "date": item.get("publication_date"),
        "pubType": [item.get("type")] if item.get("type") else [],
        "journal": journal.get("display_name"),
        "url": location.get("landing_page_url") or ("https://doi.org/" + doi if doi else oa_id),
        "queryIds": [query_id], "readScope": "metadata_and_abstract_if_returned",
        "cited_by_count": item.get("cited_by_count"),
    }


def request_json(url, dest, stem, receipt):
    """Save every live attempt, including error response bodies; no credentials."""
    for attempt in range(1, 3):
        event = {"url": url, "started_at": now(), "attempt": attempt}
        body = None
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "AcademicRetrievalTrial/1.0", "Accept": "application/json"})
            with urllib.request.urlopen(request, timeout=45) as response:
                body = response.read()
                event.update(status=response.status, final_url=response.url, content_type=response.headers.get("Content-Type"))
            path = dest / f"{stem}.json"
            path.write_bytes(body)
            event.update(file=path.name, bytes=len(body), sha256=hashlib.sha256(body).hexdigest())
            data = json.loads(body)
            event["finished_at"] = now()
            receipt["attempts"].append(event)
            save(dest / "retrieval.json", receipt)
            return data, event
        except urllib.error.HTTPError as exc:
            body = exc.read()
            path = dest / f"{stem}-attempt-{attempt}-error.txt"
            path.write_bytes(body)
            event.update(status=exc.code, error=str(exc), file=path.name,
                         bytes=len(body), sha256=hashlib.sha256(body).hexdigest())
        except Exception as exc:
            event.update(error=str(exc), status=None)
        event["finished_at"] = now()
        receipt["attempts"].append(event)
        save(dest / "retrieval.json", receipt)
        # Retry transient service/rate errors once; never change identity or key.
        if attempt == 1 and event.get("status") in (None, 429, 500, 502, 503, 504):
            time.sleep(3)
        else:
            break
    return None, event


def cached_operation(dest):
    existing_path = dest / "retrieval.json"
    if not existing_path.exists():
        return None
    existing = json.loads(existing_path.read_text(encoding="utf-8"))
    if existing.get("amendment_sha256") != AMENDMENT_HASH:
        raise RuntimeError(f"Existing operation belongs to another amendment: {dest}")
    records_path = dest / "records.json"
    if not records_path.exists() or not existing.get("finished_at"):
        raise RuntimeError(f"Preserve interrupted operation and inspect before retry: {dest}")
    return existing, json.loads(records_path.read_text(encoding="utf-8"))


def retrieve_list(query_id, parameters, purpose):
    dest = OUT / query_id
    dest.mkdir(parents=True, exist_ok=True)
    cached = cached_operation(dest)
    if cached:
        return cached
    receipt = {"queryId": query_id, "purpose": purpose, "endpoint": BASE, "parameters": parameters,
               "started_at": now(), "amendment_sha256": AMENDMENT_HASH, "page_size": PAGE_SIZE,
               "record_cap": CAP, "attempts": [], "pages": [], "total": None,
               "returned": 0, "complete": False}
    rows = []
    page = 1
    while len(rows) < CAP:
        params = {**parameters, "per_page": str(min(PAGE_SIZE, CAP - len(rows))), "page": str(page), "select": FIELDS}
        url = BASE + "?" + urllib.parse.urlencode(params)
        data, event = request_json(url, dest, f"page-{page:03d}", receipt)
        if data is None:
            receipt["stop_reason"] = "request_failed"; break
        batch = data.get("results", [])
        receipt["total"] = int((data.get("meta") or {}).get("count", 0))
        receipt["pages"].append({"file": event["file"], "sha256": event["sha256"], "page": page,
                                 "count": len(batch), "total_at_page": receipt["total"], "url": url})
        rows.extend(normalize(item, query_id) for item in batch)
        receipt["returned"] = len(rows)
        save(dest / "records.json", rows)
        save(dest / "retrieval.json", receipt)
        print(json.dumps({"query": query_id, "page": page, "total": receipt["total"], "returned": len(rows)}), flush=True)
        if len(rows) >= receipt["total"]:
            receipt["stop_reason"] = "all_reported_results_retrieved"; break
        if not batch:
            receipt["stop_reason"] = "empty_page_before_reported_total"; break
        page += 1
        time.sleep(1.1)
    if not receipt.get("stop_reason"):
        receipt["stop_reason"] = "record_cap"
    receipt["returned_unique_source_ids"] = len({row["id"] for row in rows})
    receipt["complete"] = (receipt["stop_reason"] == "all_reported_results_retrieved"
                           and receipt["returned_unique_source_ids"] == receipt["returned"] == receipt["total"])
    receipt["finished_at"] = now()
    save(dest / "records.json", rows)
    save(dest / "retrieval.json", receipt)
    return receipt, rows


def retrieve_seed(doi, number):
    seed_id = f"SEED-{number:02d}"
    dest = OUT / seed_id
    dest.mkdir(parents=True, exist_ok=True)
    receipt_path = dest / "retrieval.json"
    raw_path = dest / "seed.json"
    if receipt_path.exists():
        prior = json.loads(receipt_path.read_text(encoding="utf-8"))
        if prior.get("amendment_sha256") != AMENDMENT_HASH:
            raise RuntimeError("Existing seed receipt has another amendment")
        return prior, json.loads(raw_path.read_text(encoding="utf-8")) if prior.get("matched") and raw_path.exists() else None
    receipt = {"queryId": seed_id, "seed_doi": doi, "started_at": now(), "attempts": [], "amendment_sha256": AMENDMENT_HASH}
    url = BASE + "/https://doi.org/" + urllib.parse.quote(doi, safe="/")
    data, event = request_json(url, dest, "seed", receipt)
    receipt["matched"] = bool(data and doi_key(data.get("doi")) == doi_key(doi))
    receipt["OAid"] = data.get("id") if receipt["matched"] else None
    receipt["finished_at"] = now()
    if data and not receipt["matched"]:
        receipt["failure"] = "returned_doi_does_not_match_seed"
    save(receipt_path, receipt)
    return receipt, data if receipt["matched"] else None


def retrieve_backward(seed, number):
    query_id = f"CITE-BACK-{number:02d}"
    dest = OUT / query_id
    dest.mkdir(parents=True, exist_ok=True)
    cached = cached_operation(dest)
    if cached:
        return cached
    refs = list(dict.fromkeys(seed.get("referenced_works") or []))
    selected = refs[:CAP]
    receipt = {"queryId": query_id, "purpose": "One-hop backward references; no relevance filtering",
               "seed_OAid": seed.get("id"), "seed_doi": doi_key(seed.get("doi")),
               "started_at": now(), "amendment_sha256": AMENDMENT_HASH,
               "total": len(refs), "requested_ids": selected, "record_cap": CAP,
               "attempts": [], "pages": [], "returned": 0, "complete": False}
    rows = []
    for batch_number, offset in enumerate(range(0, len(selected), PAGE_SIZE), 1):
        batch_ids = selected[offset:offset + PAGE_SIZE]
        params = {"filter": "openalex:" + "|".join(identifier(value) for value in batch_ids), "per_page": "100", "select": FIELDS}
        url = BASE + "?" + urllib.parse.urlencode(params)
        data, event = request_json(url, dest, f"batch-{batch_number:03d}", receipt)
        if data is None:
            receipt["stop_reason"] = "batch_request_failed"; break
        batch = data.get("results") or []
        receipt["pages"].append({"file": event["file"], "sha256": event["sha256"], "batch": batch_number,
                                 "requested_count": len(batch_ids), "returned": len(batch),
                                 "reported_count": (data.get("meta") or {}).get("count"), "url": url})
        rows.extend(normalize(item, query_id) for item in batch)
        receipt["returned"] = len(rows)
        save(dest / "records.json", rows)
        save(dest / "retrieval.json", receipt)
        time.sleep(0.3)
    returned_ids = {row["OAid"] for row in rows}
    receipt["missing_requested_ids"] = sorted(set(selected) - returned_ids)
    receipt["returned_unique_source_ids"] = len(returned_ids)
    receipt["complete"] = len(refs) <= CAP and not receipt["missing_requested_ids"] and len(returned_ids) == len(refs)
    if not receipt.get("stop_reason"):
        receipt["stop_reason"] = "all_seed_reference_ids_resolved" if receipt["complete"] else "cap_or_unresolved_reference_ids"
    receipt["finished_at"] = now()
    save(dest / "records.json", rows)
    save(dest / "retrieval.json", receipt)
    print(json.dumps({"query": query_id, "total": len(refs), "returned": len(rows), "complete": receipt["complete"]}), flush=True)
    return receipt, rows


def main():
    operations, all_records, seeds = [], [], []
    query = {AMENDMENT["parameter"]: AMENDMENT["query"], "filter": AMENDMENT["filter"]}
    receipt, records = retrieve_list(AMENDMENT["query_id"], query, "Disclosed cross-disciplinary supplementary topic search")
    if ARGS.query_only:
        prior_path = OUT / "retrieval.json"
        prior = json.loads(prior_path.read_text(encoding="utf-8")) if prior_path.exists() else {"queries": [], "seeds": []}
        existing_queries = {item["queryId"]: item for item in prior.get("queries", [])}
        existing_queries[receipt["queryId"]] = receipt
        prior["queries"] = list(existing_queries.values())
        prior.setdefault("supplement_amendments", [])
        amendment_note = {"file": ARGS.amendment, "sha256": AMENDMENT_HASH, "queryId": receipt["queryId"]}
        if amendment_note not in prior["supplement_amendments"]:
            prior["supplement_amendments"].append(amendment_note)
        records_path = OUT / "records.json"
        previous = json.loads(records_path.read_text(encoding="utf-8")) if records_path.exists() else []
        merged = {row["id"]: row for row in previous}
        for row in records:
            if row["id"] not in merged:
                merged[row["id"]] = row
            else:
                merged[row["id"]]["queryIds"] = sorted(set(merged[row["id"]]["queryIds"] + row["queryIds"]))
        prior["unique_records"] = len(merged)
        prior["finished_at"] = now()
        save(records_path, list(merged.values()))
        save(prior_path, prior)
        print(json.dumps({"query": receipt["queryId"], "total": receipt.get("total"), "returned": receipt.get("returned"), "complete": receipt.get("complete"), "merged_unique": len(merged)}), flush=True)
        return
    operations.append(receipt); all_records.extend(records)
    save(OUT / "retrieval.json", {"queries": operations, "seeds": seeds, "amendment_sha256": AMENDMENT_HASH})
    for number, doi in enumerate(AMENDMENT["citation_seeds"], 1):
        seed_receipt, seed = retrieve_seed(doi, number)
        seeds.append(seed_receipt)
        if seed:
            receipt, records = retrieve_backward(seed, number)
            operations.append(receipt); all_records.extend(records)
            receipt, records = retrieve_list(f"CITE-FWD-{number:02d}", {"filter": "cites:" + identifier(seed.get("id"))}, "One-hop forward citations; no relevance filtering or date restriction")
            receipt["seed_doi"] = doi; receipt["seed_OAid"] = seed.get("id")
            save(OUT / f"CITE-FWD-{number:02d}" / "retrieval.json", receipt)
            operations.append(receipt); all_records.extend(records)
        else:
            for direction in ("BACK", "FWD"):
                operations.append({"queryId": f"CITE-{direction}-{number:02d}", "seed_doi": doi,
                                   "total": None, "returned": 0, "complete": False,
                                   "stop_reason": "seed_could_not_be_resolved", "attempts": []})
        merged = {}
        for row in all_records:
            if row["id"] not in merged:
                merged[row["id"]] = row.copy()
            else:
                merged[row["id"]]["queryIds"] = sorted(set(merged[row["id"]]["queryIds"] + row["queryIds"]))
        save(OUT / "records.json", list(merged.values()))
        report = {"source": "OpenAlex works API", "endpoint": BASE, "amendment_sha256": AMENDMENT_HASH,
                  "queries": operations, "seeds": seeds, "unique_records": len(merged), "finished_at": now(),
                  "boundary": "Anonymous actual API calls with bounded basic paging. Topic search and one-hop references/citations are separate paths. Citation edges do not establish relevance, support for a claim, full-text reading, or complete literature coverage. Graph candidates outside the topic date window remain for later transparent screening."}
        save(OUT / "retrieval.json", report)
    print(json.dumps({"queries": [{"id": item["queryId"], "total": item.get("total"), "returned": item.get("returned"), "complete": item.get("complete")} for item in operations], "unique": len(merged)}), flush=True)


if __name__ == "__main__":
    main()
