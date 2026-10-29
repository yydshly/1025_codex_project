"""Rebuild normalization from immutable raw pages; never repeat API requests."""
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "research/retrieval-trial/europepmc"
spec = importlib.util.spec_from_file_location("retrieval_europepmc_local", ROOT / "scripts/retrieve-europepmc.py")
client = importlib.util.module_from_spec(spec)
spec.loader.exec_module(client)
report = json.loads((OUT / "retrieval.json").read_text(encoding="utf-8"))
receipt_path = OUT / "normalization-repair.json"
if receipt_path.exists():
    raise SystemExit("Repair already recorded; preserve prior versions.")
merged, versions, changed = {}, [], []
for query in report["queries"]:
    folder = OUT / query["queryId"]
    path = folder / "records.json"
    before = path.read_bytes()
    old = {row["id"]: row for row in json.loads(before)}
    snapshot = folder / "records-before-normalization-repair.json"
    snapshot.write_bytes(before)
    rows = []
    for page in query["pages"]:
        raw = (folder / page["file"]).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == page["sha256"]
        rows.extend(client.normalized(item, query["queryId"]) for item in json.loads(raw)["resultList"]["result"])
    for row in rows:
        prior = old[row["id"]]
        if row["title"] != prior["title"] or row["abstract"] != prior["abstract"]:
            changed.append({"queryId": query["queryId"], "id": row["id"], "doi": row["doi"],
                            "title": row["title"], "before_abstract_characters": len(prior["abstract"]),
                            "after_abstract_characters": len(row["abstract"]),
                            "before_title_characters": len(prior["title"]), "after_title_characters": len(row["title"]),
                            "cause": "Adapter v1 stripped broad angle-bracket spans, confusing mathematical comparison signs with HTML tags. Not missing text in the paper/API raw response."})
        if row["id"] not in merged:
            merged[row["id"]] = row
        else:
            merged[row["id"]]["queryIds"] = sorted(set(merged[row["id"]]["queryIds"] + row["queryIds"]))
    client.save(path, rows)
    versions.append({"path": str(path.relative_to(ROOT)).replace("\\", "/"),
                     "before_sha256": hashlib.sha256(before).hexdigest(),
                     "after_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                     "preserved_before": str(snapshot.relative_to(ROOT)).replace("\\", "/")})
path = OUT / "records.json"
before = path.read_bytes()
snapshot = OUT / "records-before-normalization-repair.json"
snapshot.write_bytes(before)
client.save(path, list(merged.values()))
versions.append({"path": str(path.relative_to(ROOT)).replace("\\", "/"),
                 "before_sha256": hashlib.sha256(before).hexdigest(), "after_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                 "preserved_before": str(snapshot.relative_to(ROOT)).replace("\\", "/")})
client.save(receipt_path, {"repaired_at": datetime.now(timezone.utc).isoformat(), "network_requests": 0,
                           "cause": "This trial's new normalization adapter error; upstream skill and original articles were not at fault.",
                           "change": "Only known HTML tag names are stripped; angle-bracket comparisons are preserved.",
                           "raw_pages_unchanged": True, "record_ids_unchanged": set(merged) == {row["id"] for row in json.loads(before)},
                           "changed_unique_record_count": len({item["id"] for item in changed}),
                           "versions": versions, "changed_records_by_query": changed})
print(json.dumps({"changed_unique_records": len({item["id"] for item in changed}), "change_events": len(changed), "records": len(merged), "network_requests": 0}))
