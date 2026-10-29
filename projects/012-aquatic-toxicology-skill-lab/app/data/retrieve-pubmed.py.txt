"""Run the frozen PubMed theme query and preserve every returned record."""
import hashlib
import argparse
import json
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRIAL = ROOT / "research/retrieval-trial"
parser = argparse.ArgumentParser()
parser.add_argument("--plan", default="query-plan.json")
parser.add_argument("--query-id", default="PM-PRIMARY")
parser.add_argument("--output-subdir", default="pubmed")
args = parser.parse_args()
OUT = TRIAL / args.output_subdir
OUT.mkdir(parents=True, exist_ok=True)
plan = json.loads((TRIAL / args.plan).read_text(encoding="utf-8"))
query = next(q for q in plan["queries"] if q["id"] == args.query_id)
events = []

def now():
    return datetime.now(timezone.utc).isoformat()

def fetch(endpoint, params, name):
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/" + endpoint + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, 4):
        event = {"url": url, "started_at": now(), "attempt": attempt, "file": name}
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "AcademicRetrievalTrial/1.0"}), timeout=30) as response:
                raw = response.read()
                event.update(status=response.status, bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())
            (OUT / name).write_bytes(raw)
            return raw
        except Exception as exc:
            event.update(status="error", error=str(exc))
            if attempt == 3:
                raise
            time.sleep(attempt)
        finally:
            event["finished_at"] = now()
            events.append(event)
            (OUT / "requests.json").write_text(json.dumps(events, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def value(element):
    return " ".join("".join(element.itertext()).split()) if element is not None else ""

report = {"query_id": query["id"], "source": query["source"], "query": query["query"], "started_at": now(), "complete": False}
records = []
try:
    raw = fetch("esearch.fcgi", {"db": "pubmed", "term": query["query"], "retmode": "json", "retmax": "9999"}, "esearch.json")
    data = json.loads(raw)["esearchresult"]
    if data.get("errorlist"):
        report["query_warnings"] = data["errorlist"]
    ids = data["idlist"]
    total = int(data["count"])
    report.update(total=total, returned_ids=len(ids), translation=data.get("querytranslation"), warnings=data.get("warninglist"))
    for offset in range(0, len(ids), 100):
        time.sleep(0.4)
        content = fetch("efetch.fcgi", {"db": "pubmed", "id": ",".join(ids[offset:offset + 100]), "retmode": "xml"}, f"efetch-{offset // 100 + 1:03}.xml")
        tree = ET.fromstring(content)
        for article in tree.findall(".//PubmedArticle"):
            citation = article.find("MedlineCitation")
            item = citation.find("Article")
            pmid = value(citation.find("PMID"))
            article_ids = {node.get("IdType"): value(node) for node in article.findall("PubmedData/ArticleIdList/ArticleId")}
            abstract = "\n".join((node.get("Label", "") + ": " if node.get("Label") else "") + value(node) for node in item.findall("Abstract/AbstractText"))
            pub_date = item.find("Journal/JournalIssue/PubDate")
            records.append({
                "id": "PMID:" + pmid, "source": "PubMed", "pmid": pmid,
                "pmcid": article_ids.get("pmc"), "doi": article_ids.get("doi", "").lower(),
                "title": value(item.find("ArticleTitle")), "abstract": abstract,
                "year": value(pub_date.find("Year")) or value(pub_date.find("MedlineDate"))[:4],
                "date": "-".join(value(pub_date.find(key)) for key in ["Year", "Month", "Day"] if value(pub_date.find(key))),
                "articleDates": [{"type": d.get("DateType"), "date": "-".join(value(d.find(k)) for k in ["Year", "Month", "Day"])} for d in item.findall("ArticleDate")],
                "pubType": [value(p) for p in item.findall("PublicationTypeList/PublicationType")],
                "journal": value(item.find("Journal/Title")), "url": "https://pubmed.ncbi.nlm.nih.gov/" + pmid + "/",
                "queryIds": [query["id"]], "raw_file": f"efetch-{offset // 100 + 1:03}.xml",
            })
    unique = {r["pmid"] for r in records}
    report.update(returned=len(records), unique=len(unique), complete=total == len(ids) == len(unique), status="success")
except Exception as exc:
    report.update(status="failed", error=str(exc), returned=len(records))
finally:
    report["finished_at"] = now()
    (OUT / "records.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "retrieval.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=True))
