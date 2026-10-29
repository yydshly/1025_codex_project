"""Export our reading notes and synthesis; never export raw paper copies."""
import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "research/round2"
OUT = ROOT / "app/data"

def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))

def write(path, value):
    path.write_text(value, encoding="utf-8", newline="\n")

trial = read(OUT / "retrieval-trial.json")
retained = [p for p in trial["records"] if p["decision"] == "retain"]
first = read(OUT / "research.json")
old = {p["doi"].lower(): p["id"] for p in first["papers"]}
papers = []
inputs = [SRC / f"reading-{letter}.json" for letter in "abc"]
for file in inputs:
    batch = read(file)
    papers.extend(batch if isinstance(batch, list) else batch.get("papers", batch.get("records", [])))
assert len(papers) == 17 and {p["id"] for p in papers} == {p["id"] for p in retained}
by_id = {p["id"]: p for p in papers}
papers = [by_id[p["id"]] for p in retained]
for index, paper in enumerate(papers, 1):
    source = retained[index - 1]
    assert source["doi"].lower() == paper["doi"].lower(), paper["id"]
    assert paper.get("priorId") == old.get(paper["doi"].lower()), paper["id"]
    paper["shortLabel"] = f"R{index:02}"
    paper["candidateTitle"] = source["title"]
    for log in paper["readingLog"]:
        if isinstance(log["readParts"], list):
            log["readParts"] = "；".join(log["readParts"])
        log["readParts"] = log["readParts"] or "未读取正文"
        log["locator"] = log["locator"] or ("仅入口访问；无正文定位" if log["readParts"] == "未读取正文" else log["readParts"])

data = read(SRC / "synthesis.json")
data.update({
    "schemaVersion": 1,
    "date": "2026-10-29",
    "upstreamCommit": first["meta"]["upstreamCommit"],
    "corpus": {"candidateCount": 17, "overlapFirstRound": 9, "newRecords": 8,
               "firstRoundOnly": ["P04"],
               "readingLevels": dict(Counter(p["accessLevel"] for p in papers)),
               "eligibility": dict(Counter(p["eligibility"] for p in papers)),
               "boundary": "17 records, not 17 independent experiments. P04 retained in first-round archive only."},
    "papers": papers,
})
counts = data["corpus"]["readingLevels"]
data["readingSummary"] = f"实际阅读：期刊主文全文{counts.get('full_text', 0)}条、章节/图注{counts.get('sections', 0)}条、摘要{counts.get('abstract', 0)}条。主文全文统计不表示已独立审读全部补充材料或复核原始数据。"
data["inputManifest"] = [{"file": str(p.relative_to(ROOT)).replace("\\", "/"),
    "sha256": hashlib.sha256(p.read_bytes()).hexdigest()} for p in inputs + [SRC / "synthesis.json", SRC / "protocol.md", SRC / "review.md"]]
write(OUT / "round2.json", json.dumps(data, ensure_ascii=False, indent=2) + "\n")
write(OUT / "round2-data.js", "window.ROUND2_DATA = " + json.dumps(data, ensure_ascii=False) + ";\n")

labels = {"full_text": "全文审读", "sections": "部分章节", "abstract": "摘要阅读", "metadata": "仅题录"}
role_labels = {"direct": "直接共暴露证据", "mixture_context": "多污染物背景", "thesis_context": "学位论文补充", "unresolved": "资格未决"}
lines = ["# 第二轮17条候选：阅读、首轮对照与更新结论", "", "日期：2026-10-29。", "", data["lead"], "", data["boundary"], "", "## 阅读分母", "",
    "; ".join(f"{labels[k]} {v}条" for k, v in data["corpus"]["readingLevels"].items()) + "。9条重合、8条新增；首轮P04未在17条中，本轮不宣称重新审读。", "", "## 实际过程", ""]
for row in data["process"]:
    lines.extend(["### " + row["title"], "", row["text"], ""])
lines.extend(["## 更新结论", ""])
for c in data["conclusions"]:
    refs = "、".join(by_id[i]["shortLabel"] for i in c["evidenceIds"])
    lines.extend(["### " + c["title"], "", c["text"], "", "依据：" + refs + "。" + c["limit"], ""])
lines.extend(["## 第一轮对照", ""])
for c in data["comparison"]:
    lines.extend(["### " + c["topic"], "", "首轮：" + c["before"], "", c["status"] + "：" + c["after"], "", c["evidence"], ""])
lines.extend(["## 逐条阅读与证据", ""])
for p in papers:
    lines.extend([f"### {p['shortLabel']} · {p['title']}", "", f"标识：{p['id']}；首轮：{p.get('priorId') or '未纳入'}；{p['documentType']}；{labels[p['accessLevel']]}；{role_labels[p['eligibility']]}。", "", f"[DOI与原始来源](https://doi.org/{p['doi']})", "", "资格：" + p["decisionRationale"], "", "独立性：" + p["independence"], ""])
    for key, value in p["design"].items():
        lines.extend([f"- {key}：{value}"])
    lines.extend(["", "证据：", ""])
    for f in p["findings"]:
        lines.extend([f"- {f['statement']} [{f['locator']}]({f['sourceUrl']})；{f['strength']}"])
    lines.extend(["", "局限：", ""] + ["- " + l for l in p["limitations"]])
    lines.extend(["", "首轮对照：" + p["firstRoundComparison"], "", "获取与实际阅读：", ""])
    for log in p["readingLog"]:
        lines.extend([f"- [{log['action']}]({log['url']}) → {log['result']}；实际阅读：{log['readParts']}；定位：{log['locator']}；访问：{log['accessedAt']}。"])
    lines.extend(["", "全文获取：" + p["fullTextAttempt"]["status"] + "；" + p["fullTextAttempt"]["reason"], "", "已读来源与范围：", ""])
    lines.extend([f"- [{s['type']}]({s['url']})：{s['readScope']}" for s in p["sources"]])
    lines.append("")
lines.extend(["## 跨文献分歧清单", ""])
for t in data["tensions"]:
    lines.extend([f"- {t['pair']} · {t['assessment']}：{t['text']}；定位：{t['locators']}；研究者确认：pending。"])
lines.extend(["", data["tensionCoverage"], "", "## 局限", ""] + ["- " + x for x in data["limitations"]])
lines.extend(["", "## 后续研究方向", ""])
for n in data["nextSteps"]:
    lines.extend(["### " + n["title"], "", n["text"], ""])
lines.extend([data["reviewNote"], ""])
write(OUT / "round2-report.md", "\n".join(lines))
write(SRC / "report.md", "\n".join(lines))
for source, destination in [("protocol.md", "round2-protocol.md"), ("review.md", "round2-review.md")]:
    write(OUT / destination, (SRC / source).read_text(encoding="utf-8-sig"))
with (OUT / "round2-evidence.csv").open("w", encoding="utf-8-sig", newline="") as handle:
    fields = ["label", "id", "priorId", "doi", "title", "documentType", "accessLevel", "eligibility", "independence", "model", "stage", "particles", "chemicals", "doses", "duration", "groups", "replication", "statistics", "findings", "limitations", "firstRoundComparison", "fullTextAttempt", "readingLog", "sources"]
    writer = csv.DictWriter(handle, fieldnames=fields)
    writer.writeheader()
    for p in papers:
        row = {key: p.get(key, "") for key in fields if key not in ("label", "findings", "limitations", "fullTextAttempt", "readingLog", "sources")}
        row.update(p["design"])
        row.update({"label": p["shortLabel"], "findings": " | ".join(f"{x['statement']} [{x['locator']}] {x['sourceUrl']}" for x in p["findings"]), "limitations": " | ".join(p["limitations"]), "fullTextAttempt": json.dumps(p["fullTextAttempt"], ensure_ascii=False), "readingLog": json.dumps(p["readingLog"], ensure_ascii=False)})
        row["sources"] = json.dumps(p["sources"], ensure_ascii=False)
        writer.writerow(row)
print(json.dumps({"result": "exported", "corpus": data["corpus"]}, ensure_ascii=False))
