"""Freeze the benchmark-informed vocabulary repair as a separate experiment."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

trial = Path(__file__).resolve().parents[1] / "research/retrieval-trial"
target = trial / "query-plan-v2.json"
if target.exists():
    raise SystemExit("Vocabulary amendment already frozen")
plan = json.loads((trial / "query-plan.json").read_text(encoding="utf-8"))
plan["amended_at"] = datetime.now(timezone.utc).isoformat()
plan["schema"] = "retrieval-trial-plan/1.1"
plan["reason"] = "Independent benchmark first scored 3/5 for native primary searches, 4/5 after graph expansion. Exact-ID diagnosis found F53B/Cl-PFAES and PFCs/perfluorinated vocabulary gaps. This is benchmark-informed repair, not untouched validation."
plan["original_plan_sha256"] = json.loads((trial / "query-plan-receipt.json").read_text())["sha256"]
plan["blocks"]["pfas"] = ["PFAS", "PFOS", "PFOA", "PFBA", "PFNA", "PFOSA", "PFHxS", "PFBS", '"F-53B"', "F53B", '"Cl-PFESA"', '"Cl-PFAES"', "PFC", "PFCs", "perfluor*", "polyfluor*", "fluorotelomer*"]
plan["generation"].append("V2依据已知漏检修复：增加F53B、Cl-PFAES、PFC/PFCs与PFNA/PFOSA；perfluoro*/polyfluoro*缩短为perfluor*/polyfluor*以覆盖perfluorinated/polyfluorinated拼写。其余概念块保持一致。")
def block(name, source):
    return "(" + " OR ".join(term + "[Title/Abstract]" if source == "PM" else "TITLE_ABS:" + term for term in plan["blocks"][name]) + ")"
plan["queries"] = [
    {"id": "PM-REPAIRED", "source": "PubMed E-utilities", "purpose": "基准诊断后的词汇修订检索", "query": " AND ".join([block(k, "PM") for k in plan["blocks"]] + ['("2015/01/01"[Date - Publication] : "2026/10/29"[Date - Publication])'])},
    {"id": "EPMC-REPAIRED", "source": "Europe PMC REST", "purpose": "基准诊断后的词汇修订检索", "query": " AND ".join([block(k, "EPMC") for k in plan["blocks"]] + ["FIRST_PDATE:[2015-01-01 TO 2026-10-29]"])},
]
raw = (json.dumps(plan, ensure_ascii=False, indent=2) + "\n").encode()
target.write_bytes(raw)
(trial / "query-plan-v2-receipt.json").write_text(json.dumps({"amended_at": plan["amended_at"], "sha256": hashlib.sha256(raw).hexdigest(), "boundary": "In-sample repair after original benchmark was revealed."}, indent=2), encoding="utf-8")
print(json.dumps({"amended_at": plan["amended_at"], "queries": [q["id"] for q in plan["queries"]]}))
