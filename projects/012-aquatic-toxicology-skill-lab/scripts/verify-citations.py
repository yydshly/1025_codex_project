"""Run the pinned upstream clients against the actual collected bibliography.

Only DOI/title metadata is sent. No fixtures, judge stubs, or invented matches.
The adapter records provenance; it does not modify upstream code or paper findings.
"""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = ROOT / "research" / "upstream" / "scripts"
sys.path.insert(0, str(UPSTREAM))
# Run public anonymous index lookups, without ambient account identifiers.
os.environ.pop("S2_API_KEY", None)
os.environ.pop("CROSSREF_POLITE_EMAIL", None)
from semantic_scholar_client import SemanticScholarClient
from crossref_client import CrossrefClient

def now():
    return datetime.now(timezone.utc).isoformat()

class RecordedS2(SemanticScholarClient):
    def __init__(self, events):
        super().__init__()
        self.events = events
    def _request(self, path):
        event = {"index": "Semantic Scholar", "path": path, "started_at": now()}
        try:
            data = super()._request(path)
            event.update(status="response", paperId=data.get("paperId"), title=data.get("title"), year=data.get("year"))
            return data
        except Exception as exc:
            event.update(status="unavailable", error=str(exc))
            raise
        finally:
            event["finished_at"] = now()
            self.events.append(event)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="research/phase2_investigation/papers.json")
    parser.add_argument("--output", default="research/phase2_investigation/citation-verification.json")
    args = parser.parse_args()
    papers = json.loads((ROOT / args.input).read_text(encoding="utf-8-sig"))
    events, results = [], []
    s2, crossref = RecordedS2(events), CrossrefClient()
    report = {"started_at": now(), "upstream_commit": "b8d050f24f2e1c465c4410eace8634ea3af15930",
              "execution": "live upstream SemanticScholarClient + CrossrefClient", "results": results, "events": events}
    destination = ROOT / args.output
    destination.parent.mkdir(parents=True, exist_ok=True)
    def save():
        destination.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for paper in papers:
        row = {"id": paper["id"], "title": paper["title"], "doi": paper.get("doi"), "year": paper.get("year")}
        try:
            result = s2.lookup(paper)
            row["semantic_scholar"] = {"status": "matched" if result.get("matched") else "not_found", **result}
        except Exception as exc:
            row["semantic_scholar"] = {"status": "unavailable", "reason": str(exc)}
        started = now()
        try:
            data = crossref.doi_lookup_with_title_check(paper["doi"], paper["title"]) if paper.get("doi") else None
            if not data:
                data = crossref.title_search(paper["title"], paper.get("year"))
            row["crossref"] = {"status": "matched" if data else "not_found"}
            if data:
                for key in ("DOI", "title", "container-title", "issued", "published", "published-online", "published-print", "type", "relation", "update-to", "is-referenced-by-count"):
                    if key in data:
                        row["crossref"][key] = data[key]
        except Exception as exc:
            row["crossref"] = {"status": "unavailable", "reason": str(exc)}
        events.append({"index": "Crossref", "doi": paper.get("doi"), "started_at": started, "finished_at": now(), "status": row["crossref"]["status"]})
        results.append(row)
        save()
        print(json.dumps({"id": row["id"], "s2": row["semantic_scholar"]["status"], "crossref": row["crossref"]["status"]}), flush=True)
    report["finished_at"] = now()
    save()

if __name__ == "__main__":
    main()
