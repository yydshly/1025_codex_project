"""Merge live-source records and produce transparent preliminary screening."""
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRIAL = ROOT / "research/retrieval-trial"
OUT = TRIAL / "screening"
OUT.mkdir(parents=True, exist_ok=True)
files = [TRIAL / "pubmed/records.json", TRIAL / "europepmc/records.json"]
if (TRIAL / "openalex/records.json").exists():
    files.append(TRIAL / "openalex/records.json")
for relative in ["pubmed-v2/records.json", "europepmc-v2/records.json", "diagnostics/records.json"]:
    if (TRIAL / relative).exists():
        files.append(TRIAL / relative)
records, aliases = [], {}
for path in files:
    for row in json.loads(path.read_text(encoding="utf-8")):
        doi = (row.get("doi") or "").lower().replace("https://doi.org/", "").strip()
        pmid = str(row.get("pmid") or "").strip()
        identifiers = (["doi:" + doi] if doi else []) + (["pmid:" + pmid] if pmid else [])
        identifiers.append(str(row.get("id")))
        existing = next((aliases[key] for key in identifiers if key in aliases), None)
        if existing is None:
            key = identifiers[0]
            existing = {**row, "id": "T" + hashlib.sha256(key.encode()).hexdigest()[:9], "doi": doi,
                        "sources": [], "queryIds": [], "sourceIds": [], "rawLocations": []}
            records.append(existing)
        for key in identifiers:
            aliases[key] = existing
        if row["source"] not in existing["sources"]:
            existing["sources"].append(row["source"])
        existing["queryIds"] = sorted(set(existing["queryIds"] + row.get("queryIds", [])))
        existing["sourceIds"].append(str(row.get("id")))
        if len(row.get("abstract") or "") > len(existing.get("abstract") or ""):
            existing["abstract"] = row["abstract"]
        for name in ["doi", "pmid", "pmcid", "journal", "year", "date", "OAid"]:
            if not existing.get(name) and row.get(name):
                existing[name] = row[name]

review_pattern = r"review|meta-analysis|editorial|comment|erratum|introductory|scoping review"
fish_pattern = r"fish|embryo|larva|zebrafish|danio"
proposals = []
for row in records:
    title = row.get("title") or ""
    abstract = row.get("abstract") or ""
    text = title + " " + abstract
    types = " ".join(row.get("pubType") or [])
    main = any(q in {"PM-PRIMARY", "EPMC-PRIMARY", "OA-SUPPLEMENT"} for q in row["queryIds"])
    risk = bool(re.search(fish_pattern, text, re.I))
    target = bool(re.search(r"zebrafish|danio\s+rerio", text, re.I))
    year = str(row.get("year") or "")[:4]
    if year.isdigit() and (int(year) < 2015 or int(year) > 2026):
        decision, reason, rule = "exclude", "题录年份超出2015—2026检索范围；引文追踪返回的历史记录仍保留。", "DATE"
    elif re.search(review_pattern, types, re.I) or re.search(r"\b(review|systematic review|meta-analysis)\b", title, re.I):
        decision, reason, rule = "exclude", "题录类型或题名明确为综述、评论或更正，不是目标原始实验。", "TYPE"
    elif not abstract:
        decision, reason, rule = "uncertain", "当前记录未返回摘要，无法核对物种与共暴露处理，保留待核。", "NO_ABSTRACT"
    elif main or risk:
        decision, reason, rule = "uncertain", "主检索或鱼/胚胎/仔体相关高风险项，须逐条AI核查可见题名摘要。", "PRIORITY_REVIEW"
    else:
        decision, reason, rule = "exclude", "自动题名摘要初筛：未出现目标物种或鱼/胚胎/仔体线索，暂排出本次目标阅读集；存在摘要未写物种的漏排风险。", "NO_ORGANISM_SIGNAL"
    proposals.append({"id": row["id"], "sourceIds": row["sourceIds"], "decision": decision, "reason": reason,
                      "method": "deterministic_prescreen", "rule": rule, "main": main, "risk": risk, "target": target})
by_title = {}
for row in records:
    normalized = re.sub(r"[^\w]", "", row["title"].lower())
    by_title.setdefault(normalized, []).append(row["id"])
version_candidates = [values for values in by_title.values() if len(values) > 1]
(OUT / "records.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(OUT / "prescreen.json").write_text(json.dumps({"records": proposals, "counts": dict(Counter(r["rule"] for r in proposals)), "version_candidates": version_candidates,
    "boundary": "Mechanical preliminary rules only. Missing organism terms are a risk flag, not proof that a paper lacks zebrafish. Audited samples and manual overrides must remain separate."}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"unique": len(records), "rules": dict(Counter(r["rule"] for r in proposals)), "version_candidates": version_candidates}))
