"""Prepare a reproducible second-AI review subset, without first-review labels."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import random
import re

ROOT = Path(__file__).resolve().parents[1]
TRIAL = ROOT / "research/retrieval-trial"
OUT = TRIAL / "screening"
OUT.mkdir(parents=True, exist_ok=True)
source_paths = [TRIAL / "europepmc/records.json", TRIAL / "pubmed/records.json"]
merged, sources = {}, []
for path in source_paths:
    raw = path.read_bytes()
    sources.append({"path": str(path.relative_to(ROOT)).replace("\\", "/"), "sha256": hashlib.sha256(raw).hexdigest()})
    for record in json.loads(raw):
        key = "doi:" + record["doi"].lower().removeprefix("https://doi.org/") if record.get("doi") else "pmid:" + record["pmid"] if record.get("pmid") else record["id"]
        if key not in merged:
            record["review_key"] = key
            record["aliases"] = [record["id"]]
            merged[key] = record
        else:
            prior = merged[key]
            prior["aliases"] = sorted(set(prior["aliases"] + [record["id"]]))
            prior["queryIds"] = sorted(set(prior["queryIds"] + record["queryIds"]))
            if not prior.get("abstract") and record.get("abstract"):
                prior["abstract"] = record["abstract"]
records = sorted(merged.values(), key=lambda record: record["review_key"])
pattern = r"\bfish(?:es)?\b|\bembryo\w*|\blarva\w*|\bzebrafish\b|\bdanio\b"
primary = [record for record in records if any("PRIMARY" in query for query in record["queryIds"])]
primary_keys = {record["review_key"] for record in primary}
risk = [record for record in records if record["review_key"] not in primary_keys and re.search(pattern, record.get("title", "") + " " + record.get("abstract", ""), re.I)]
risk_keys = {record["review_key"] for record in risk}
remainder = [record for record in records if record["review_key"] not in primary_keys | risk_keys]
sampled = random.Random(20261029).sample(remainder, min(40, len(remainder)))
chosen_keys = primary_keys | risk_keys | {record["review_key"] for record in sampled}
chosen = [record for record in records if record["review_key"] in chosen_keys]
for index, record in enumerate(chosen, 1):
    record["reviewer_b_number"] = index
    record["selection"] = "all_primary" if record["review_key"] in primary_keys else "all_high_risk_extra" if record["review_key"] in risk_keys else "random_remainder"
sampler = {"created_at": datetime.now(timezone.utc).isoformat(), "seed": 20261029,
           "pattern": pattern, "sources": sources,
           "pool_counts": {"raw_europepmc": 580, "raw_pubmed": 17, "deduplicated_union": len(records), "all_primary": len(primary), "high_risk_extra": len(risk), "remainder": len(remainder), "random_selected": len(sampled), "total_selected": len(chosen)},
           "selectedIDs": [record["id"] for record in chosen], "selectedKeys": [record["review_key"] for record in chosen],
           "boundary": "Second AI saw records and frozen criteria, not first-review decisions. All primary and all high-risk extra records plus seeded sample of remainder. Not an independent human audit or full-text screening."}
(OUT / "reviewer-b-sample.json").write_text(json.dumps({"sampler": sampler, "records": chosen}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(sampler["pool_counts"]))
