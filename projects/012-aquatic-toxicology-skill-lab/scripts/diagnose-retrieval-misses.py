"""Exact-ID diagnostics after benchmark scoring; never count these as discovery."""
import hashlib
import json
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "research/retrieval-trial/diagnostics"
OUT.mkdir(parents=True, exist_ok=True)
benchmark = json.loads((ROOT / "research/retrieval-trial/benchmark/benchmark.json").read_text(encoding="utf-8"))
records = []
for item in benchmark["benchmark_items"]:
    if item["id"] not in {"B03", "B05"}:
        continue
    url = "https://www.ebi.ac.uk/europepmc/webservices/rest/search?" + urllib.parse.urlencode({"query": f"EXT_ID:{item['pmid']} AND SRC:MED", "format": "json", "resultType": "core"})
    event = {"id": item["id"], "url": url, "started_at": datetime.now(timezone.utc).isoformat(), "purpose": "Exact-PMID diagnosis after independent test; not topic-query recovery"}
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            raw = response.read()
            event.update(status=response.status, sha256=hashlib.sha256(raw).hexdigest())
        (OUT / (item["id"] + ".json")).write_bytes(raw)
        data = json.loads(raw)
        for row in data.get("resultList", {}).get("result", []):
            parser = HTMLParser(convert_charrefs=True)
            parts = []
            parser.handle_data = parts.append
            parser.feed(row.get("abstractText", ""))
            records.append({"id": "DIAG:" + item["id"], "source": "Europe PMC exact-ID diagnostic", "pmid": row.get("id"), "doi": row.get("doi", "").lower(), "title": row.get("title"), "abstract": " ".join(parts), "year": row.get("pubYear"), "date": row.get("firstPublicationDate"), "pubType": row.get("pubTypeList", {}).get("pubType", []), "journal": row.get("journalInfo", {}).get("journal", {}).get("title"), "url": "https://pubmed.ncbi.nlm.nih.gov/" + str(row.get("id")) + "/", "queryIds": ["DIAGNOSTIC-" + item["id"]]})
    except Exception as exc:
        event.update(status="failed", error=str(exc))
    event["finished_at"] = datetime.now(timezone.utc).isoformat()
    (OUT / (item["id"] + "-receipt.json")).write_text(json.dumps(event, indent=2) + "\n", encoding="utf-8")
(OUT / "records.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(records, ensure_ascii=True, indent=2))
