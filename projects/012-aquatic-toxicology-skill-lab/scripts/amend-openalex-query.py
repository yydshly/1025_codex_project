"""Preserve the rejected query; freeze a syntax-only OpenAlex amendment."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

trial = Path(__file__).resolve().parents[1] / "research/retrieval-trial"
target = trial / "amendment-openalex-v2.json"
if target.exists():
    raise SystemExit("Amendment already frozen")
data = json.loads((trial / "amendment-openalex.json").read_text(encoding="utf-8"))
data["at"] = datetime.now(timezone.utc).isoformat()
data["query_id"] = "OA-SUPPLEMENT-V2"
data["reason"] = "Syntax-only repair after HTTP400 for wildcard inside a quoted multiword phrase. No benchmark read; original failed query is preserved."
data["query"] = data["query"].replace('"micro plastic*"', '("micro plastic" OR "micro plastics")').replace('"nano plastic*"', '("nano plastic" OR "nano plastics")')
raw = (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode()
target.write_bytes(raw)
(trial / "amendment-openalex-v2-receipt.json").write_text(json.dumps({"at": data["at"], "sha256": hashlib.sha256(raw).hexdigest()}, indent=2), encoding="utf-8")
print(json.dumps({"query_id": data["query_id"], "at": data["at"]}))
