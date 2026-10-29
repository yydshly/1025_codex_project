"""Publish bounded retrieval evidence; never execute network requests here."""
import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
T = ROOT / "research/retrieval-trial"
OUT = ROOT / "app/data"
ownership = json.loads((ROOT / "research/retrieval-ownership-audit.json").read_text(encoding="utf-8"))
def read(path):
    return json.loads((T / path).read_text(encoding="utf-8-sig"))
def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

plan = read("query-plan.json")
receipt = read("query-plan-receipt.json")
assert hashlib.sha256((T / "query-plan.json").read_bytes()).hexdigest() == receipt["sha256"]
pm = read("pubmed/retrieval.json")
ep = read("europepmc/retrieval.json")
oa = read("openalex/retrieval.json")
pm2 = read("pubmed-v2/retrieval.json")
ep2 = read("europepmc-v2/retrieval.json")
assert any(q["queryId"] == "OA-SUPPLEMENT-V2" and q.get("complete") for q in oa["queries"])
assert pm2["complete"] and ep2["queries"][0]["complete"]
benchmark = read("benchmark/benchmark.json")
records = read("screening/records.json")
pre = read("screening/prescreen.json")
a = read("screening/reviewer-a.json")
b = read("screening/reviewer-b.json")
c = read("screening/reviewer-c.json")
overrides = read("screening/adjudication-overrides.json")["overrides"]
repair = read("europepmc/normalization-repair.json")
by_id = {r["id"]: r for r in records}
proposals = {r["id"]: r for r in pre["records"]}
a_map = {r["id"]: r for r in a["records"]}
c_rows = c.get("records", c.get("decisions", []))
if isinstance(c_rows, dict):
    c_rows = list(c_rows.values())
c_map = {r["id"]: r for r in c_rows}
migrated = c.get("migrated_record_recheck", [])
if isinstance(migrated, dict):
    migrated = [migrated]
for r in migrated:
    if r.get("id"):
        c_map[r["id"]] = r
b_aliases = {}
for row in b["decisions"]:
    for key in [row.get("id"), *(row.get("aliases") or [])]:
        if key:
            b_aliases[key] = row
def second(row):
    return next((b_aliases[v] for v in row["sourceIds"] if v in b_aliases), None)
def label(review):
    return (review.get("decision", "未记录") + "：" + review.get("reason", "")) if review else "不在本轮独立复核子集；未复核"

public_records, disagreements, initial_comparisons = [], [], []
for row in records:
    first = a_map.get(row["id"]) or c_map.get(row["id"]) or proposals[row["id"]]
    other = second(row)
    final = dict(first)
    final_method = "primary_AI" if row["id"] in a_map else "targeted_AI" if row["id"] in c_map else "second_AI" if other else "automatic_rule"
    adjudication = "初筛/定点判断保留；没有升级为全文资格确认。"
    if other:
        initial_comparisons.append({"id": row["id"], "initial": first["decision"], "second": other["decision"], "selection": other.get("selection")})
        if first["decision"] != other["decision"]:
            disagreements.append({"id": row["id"], "title": row["title"], "initial": label(first), "second": label(other)})
        if row["id"] not in a_map and row["id"] not in c_map:
            final = dict(other)
            adjudication = "独立AI复核了这条自动初筛记录，采用其带理由判断。"
    for override in overrides:
        if (override.get("doi") and override["doi"] == row.get("doi")) or override.get("sourceId") in row["sourceIds"]:
            final = override
            final_method = "primary_AI_adjudication"
            adjudication = override["reason"] + " 依据：" + override["basis"]
    public_records.append({
        "id": row["id"], "title": row["title"], "year": row.get("year"), "doi": row.get("doi"),
        "url": "https://doi.org/" + row["doi"] if row.get("doi") else row.get("url"),
        "sources": row["sources"], "queries": row["queryIds"], "decision": final["decision"],
        "reason": final["reason"], "review1": label(first), "review2": label(other), "adjudication": adjudication,
        "isNew": False, "readScope": {"abstract": "摘要（未阅读全文）", "title": "题名", "title_and_complete_returned_abstract": "题名与完整返回摘要（不等于源站全文）", "title_and_returned_abstract": "题名与返回摘要", "TITLE_ONLY": "仅题名"}.get(final.get("readScope"), final.get("readScope", "题录/规则初筛，未逐条全文阅读")),
        "screenMethod": final_method,
    })
old = json.loads((ROOT / "research/phase2_investigation/papers.json").read_text(encoding="utf-8"))
old_core = [r for r in old if r["role"] == "core"]
old_dois = {r["doi"].lower() for r in old_core}
for row in public_records:
    row["isNew"] = row["decision"] in {"retain", "uncertain"} and bool(row.get("doi")) and row["doi"].lower() not in old_dois
public_records.sort(key=lambda r: ({"retain": 0, "uncertain": 1, "exclude": 2}[r["decision"]], not r["isNew"], r["id"]))
by_doi = {r["doi"].lower(): r for r in public_records if r.get("doi")}
counts = dict(Counter(r["decision"] for r in public_records))
native = {"PM-PRIMARY", "EPMC-PRIMARY"}
supplement = native | {"OA-SUPPLEMENT-V2"}
repaired = {"PM-REPAIRED", "EPMC-REPAIRED"}
def found(doi, stage):
    queries = set(by_doi.get(doi.lower(), {}).get("queries", []))
    if stage == "graph":
        return bool(queries & supplement or any(q.startswith("CITE-") for q in queries))
    return bool(queries & (native if stage == "original" else repaired if stage == "repaired" else supplement))
bench_rows = []
for item in benchmark["benchmark_items"]:
    provenance = item["review_provenance"][0]
    row = by_doi.get(item["doi"].lower(), {})
    bench_rows.append({"title": item["id"] + "｜" + item["title"], "doi": item["doi"],
        "found": found(item["doi"], "original"), "where": "；".join(row.get("queries", [])),
        "reason": f"原始主检索：{'找到' if found(item['doi'], 'original') else '漏检'}；加一跳图：{'找到' if found(item['doi'], 'graph') else '未找到'}；修订主检索：{'找到' if found(item['doi'], 'repaired') else '未找到'}。基准出处：{provenance['review_id']} / {provenance['locator']}"})
scores = {stage: sum(found(item["doi"], stage) for item in benchmark["benchmark_items"]) for stage in ["original", "supplement", "graph", "repaired"]}
old_rows = [{"title": p["id"] + "｜" + p["title"], "doi": p["doi"], "found": found(p["doi"], "original"), "where": "；".join(by_doi.get(p["doi"].lower(), {}).get("queries", [])), "reason": "旧10篇属于已知回归集，不是独立基准。"} for p in old_core]
graph_ops = [q for q in oa["queries"] if q["queryId"].startswith("CITE-")]
native_primary_union = {r["id"] for r in records if set(r["queryIds"]) & native}
extra_retained = [r for r in public_records if r["decision"] == "retain" and "EPMC-NO-ORGANISM" in r["queries"] and not set(r["queries"]) & native]
graph_retained = [r for r in public_records if r["decision"] == "retain" and any(q.startswith("CITE-") for q in r["queries"]) and not set(r["queries"]) & supplement]
new_retained = [r for r in public_records if r["decision"] == "retain" and r["isNew"]]
random_comparisons = [r for r in initial_comparisons if r.get("selection") == "seeded_random_remainder"]
retained_ids = {r["id"] for r in public_records if r["decision"] == "retain"}
retained_raw = [r for r in records if r["id"] in retained_ids]
year_counts = dict(Counter(str(r.get("year")) for r in retained_raw if r.get("year")))
journal_counts = dict(Counter(r["journal"] for r in retained_raw if r.get("journal")))
distribution = {"population": "17条保留候选记录；不作为独立实验数", "year": {"known_N": sum(year_counts.values()), "counts": year_counts}, "journal": {"known_N": sum(journal_counts.values()), "counts": journal_counts}, "method": "未系统提取具体实验设计，不从题录类型推测随机化或方法质量", "geography": "未系统提取，不从作者机构推测研究地点", "advisories": []}
for dimension in ["year", "journal"]:
    values = distribution[dimension]
    for name, count in values["counts"].items():
        if values["known_N"] and count / values["known_N"] >= .7:
            distribution["advisories"].append({"dimension": dimension, "value": name, "count": count, "known_N": values["known_N"]})

queries = []
for report in [pm, pm2]:
    queries.append({"id": report["query_id"], "source": "PubMed E-utilities", "purpose": "原始主检索" if report["query_id"] == "PM-PRIMARY" else "基准诊断后的词汇修复", "query": report["query"], "url": "https://pubmed.ncbi.nlm.nih.gov/?term=" + __import__('urllib.parse', fromlist=['quote']).quote(report["query"]), "at": report["started_at"], "total": report.get("total"), "returned": report["returned"], "complete": report["complete"], "status": report["status"], "translation": report.get("translation"), "notes": "已取回全部接口命中；不代表已找齐领域文献。日期字段使用Publication Date。"})
for report in [ep, ep2]:
    for q in report["queries"]:
        queries.append({"id": q["queryId"], "source": "Europe PMC REST", "purpose": q["purpose"], "query": q["query"], "url": q["attempts"][-1]["url"], "at": q["started_at"], "total": q.get("total", q.get("hitCount")), "returned": q.get("returned"), "complete": q["complete"], "status": "完整取回" if q["complete"] else "未完整", "notes": "与PubMed大量重叠，不能当独立复制；日期字段为First Publication Date。重试事件见下载回执。"})
for q in oa["queries"]:
    if q["queryId"].startswith("CITE-"):
        continue
    queries.append({"id": q["queryId"], "source": "OpenAlex works", "purpose": q.get("purpose"), "query": q.get("parameters", {}).get("search.title_and_abstract.exact", ""), "url": q.get("attempts", [{}])[-1].get("url", "https://api.openalex.org/works"), "at": q["started_at"], "total": q.get("total"), "returned": q.get("returned"), "complete": q["complete"], "status": "完整取回" if q["complete"] else "HTTP400；保留失败", "notes": "V1被接口拒绝带空格的通配短语；V2在独立登记后展开单复数，返回32条。搜索记录不等于阅读全文。"})

checks = [
    {"id": "V01", "title": "接口结果是否取全", "status": "主查询完整；图扩展有缺口", "denominator": "每条接口返回的total/hitCount", "result": "PubMed 17/17→19/19；Europe PMC 18/18、580/580→20/20；OpenAlex修订语法后32/32。",
     "method": "保存每页原始响应和URL/UTC/HTTP/SHA，核对计数与源ID；不根据搜索引擎摘要估算命中总数。", "limitations": "只证明接口所报告的结果没有在下载阶段被截断；不能证明数据库覆盖充分或检索式正确。", "rows": []},
    {"id": "V02", "title": "独立综述派生基准：先暴露漏检，再修复", "status": "原始3/5；图4/5；修订5/5", "denominator": "另一代理独立从13项综述来源形成的5篇合格原始研究", "result": f"原始原生主检索{scores['original']}/5；加OpenAlex主题仍{scores['supplement']}/5；加一轮图{scores['graph']}/5；词汇修订主检索{scores['repaired']}/5。",
     "method": "先冻结原检索式；基准收集者不读旧清单或新检索结果。比对后用精确ID定位失败原因，诊断请求不算原查询命中。", "limitations": "基准是5篇样本，不是领域分母；曾在进度中透露1篇身份，非严格盲法。修订已使用这5篇信息，5/5仅为样本内修复，尚无新的未见验证集。", "rows": bench_rows},
    {"id": "V03", "title": "旧10篇回归：检查数据库来源差异", "status": "原始9/10；加OpenAlex 10/10", "denominator": "第一轮已知的10个核心DOI", "result": f"原始原生检索{sum(found(p['doi'], 'original') for p in old_core)}/10；增加OpenAlex主题后{sum(found(p['doi'], 'supplement') for p in old_core)}/10。RSC论文在原生两接口中未出现。",
     "method": "用冻结主题查询的返回集合按DOI比对，不用已知DOI定位请求充当主题命中。", "limitations": "这是已知集回归，不是独立覆盖率。找到题录也不等于通过全文资格判断。", "rows": old_rows},
    {"id": "V04", "title": "去掉物种块，是否发现被挡住的研究", "status": "580条取回；定点与抽样复核", "denominator": "扩展580条，原始主检索并集18条；额外562条", "result": f"本轮初筛与复核中新增确认保留项{len(extra_retained)}条。没有据此宣称其余562条全部经人工式逐条核验。",
     "method": "原计划预先登记去掉物种块。机械初筛后，对额外风险31条全部、其余531条固定种子抽40条由另一AI读返回摘要。", "limitations": "这项只能检查物种块风险，不能发现PFAS词根遗漏；两个漏检案例恰好仍被PFAS块挡住。未出现物种词的机器排除仍可能误排。", "rows": []},
    {"id": "V05", "title": "一跳前后向引文追踪", "status": "6/8方向完整；2处盲区", "denominator": "4个公开种子 × 前后2方向", "result": f"取得442条引用路径记录。筛选后有{len(graph_retained)}条保留候选没有被原始三源主题搜索取得；不得回填成原检索命中。",
     "method": "种子DOI及查询在amendment-openalex.json登记；后向按referenced_works解析，前向用cites过滤并分页。", "limitations": "第三种子前向连接失败，分母未知；第四种子后向只解析35/36，缺W6770502304。只追4个种子、一跳，不是整张引文网络。",
     "rows": [{"title": q["queryId"] + "｜" + q.get("seed_doi", "公开种子"), "found": True if q.get("complete") else None, "where": "OpenAlex", "reason": f"返回{q.get('returned', 0)}/{q.get('total') if q.get('total') is not None else '未知'}；{q.get('stop_reason')}"} for q in graph_ops]},
    {"id": "V06", "title": "独立AI复核：筛选中有没有误排或误纳", "status": "89条复核；保留分歧", "denominator": "原始两接口580并集中的89条（18主检索＋31风险＋40随机）", "result": f"与初筛/主代理定点决定比较，{len(disagreements)}条决定不同；已逐条留裁决。多物种多处理论文改为待定，重复题录不另算研究。",
     "method": "第二AI在未读A决定、未读基准的情况下看题名和完整返回摘要；新OpenAlex候选另由C作定点筛选。", "limitations": "不是独立人类专家或金标准准确率。C筛选不是对所有新记录再做第二遍；未随机复核的记录继续标明。",
     "rows": [{"title": r["title"], "found": None, "where": r["id"], "reason": "初判：" + r["initial"] + "；复核：" + r["second"]} for r in disagreements]},
    {"id": "V07", "title": "输入文本是否在解析时丢失", "status": "发现22条解析错误并修复", "denominator": "原Europe PMC 580个源记录；22条文字发生修复", "result": "数学比较号被宽泛HTML正则误删；使用保留的原始JSON重建，0次新网络请求。例：39270866摘要由773字符恢复至1899字符。",
     "method": "保留修复前后文件/hash与逐条长度；样本89个ID前后不变，对受影响的3条复核样本重读。", "limitations": "这是本轮新增适配器的错误，不是原论文或上游Skill错误；修复这个错误不等于其他解析与理解错误均已排除。", "rows": []},
    {"id": "V08", "title": "文献分布是否提示需要继续补查", "status": "年份/期刊已查；方法与地域未评估", "denominator": f"保留候选17条；已知年份{distribution['year']['known_N']}条，期刊/来源名{distribution['journal']['known_N']}条", "result": "年份分布：" + str(year_counts) + "。期刊/来源分布：" + str(journal_counts) + f"。达到单值70%提示的维度项{len(distribution['advisories'])}个。",
     "method": "按上游Step4.6，只统计实际已有字段；每个维度用自己的known_N。具体实验方法与研究地点没有系统提取，不填猜测值。", "limitations": "未触发集中提示不证明没有漏检；候选集、期刊名和实验单位不同。方法和地域两个维度的检查尚无足够提取数据。", "rows": []},
]

for check in checks:
    check["statusColumn"] = "原始主检索" if check["id"] in {"V02", "V03"} else "本项完成状态"

gaps = [
    "本轮是检索与初筛试验。保留项仅是后续阅读候选；没有新增核心全文审读，不认证毒性、因果、统计或论文创新性。",
    "5篇独立构建基准已被用于调词；修订5/5不是新的未见验证成绩，也不是全领域召回率或Skill准确率。",
    "PubMed和Europe PMC高度重叠；OpenAlex另有索引与缺摘要问题。没有原生检索WoS、Scopus、CNKI或所有学位论文库。",
    "机械预筛包括‘题名摘要无目标物种线索’规则。89条复核及C定点判断没有覆盖所有记录的全文，仍有误排风险。",
    "无摘要或返回片段不足、学位论文/预印本与正式论文的实验重叠、多物种与多处理对应关系，保持待核；记录数不等于独立实验数。",
    "引用网络限4个种子的一跳，仍有一个前向方向失败和一个后向ID未解析；来源数量不能抵消这些缺口。",
    "第一轮37条网页查询和10篇核心保留在主网页的历史章节（http://127.0.0.1:4332/#workflow）；本报告记录第二轮实测，两个阶段的分母不同。",
    "本轮新增的API脚本由Codex编写，按原始bibliography规则执行；不是宣称上游已经自动实现这些全部操作，也没有有/无Skill对照。",
]
term_blocks = [
    {"name": "研究对象", "why": "从问题提取物种，并加入学名；不要求结果方向或毒性终点。", "terms": plan["blocks"]["organism"]},
    {"name": "塑料颗粒", "why": "加入微/纳名称、拼写变体与常见聚合物。某些仅有缩写的摘要仍可能漏检。", "terms": plan["blocks"]["plastic"]},
    {"name": "PFAS：原式与修订", "why": "原式perfluoro*/polyfluoro*漏掉perfluorinated/polyfluorinated；基准诊断后增加无连字符F53B、Cl-PFAES及旧称PFC/PFCs。块内OR、块间AND。", "terms": read("query-plan-v2.json")["blocks"]["pfas"]},
]
timeline = [
    {"at": plan["frozen_at"], "action": "先冻结检索方案", "output": receipt["sha256"], "impact": "先写范围、词块、来源和检查方法，再检索；本地冻结不冒充外部预注册。"},
    {"at": ep["queries"][0]["started_at"], "action": "执行原生主题与物种块扩展检索", "output": "PubMed17；Europe PMC18与580；均完整取回", "impact": "获得可计算的接口分母与候选记录，不再用查询次数表示覆盖。"},
    {"at": repair["repaired_at"], "action": "发现并修复摘要解析错误", "output": "22条修复、原始页及旧版本保留", "impact": "先修输入，再做筛选；检查读取深度和来源文字完整性。"},
    {"at": read("amendment-openalex.json")["at"], "action": "增加OpenAlex并登记4个引文种子", "output": "V1 HTTP400；语法修订V2 32/32；一跳图保留未完成方向", "impact": "建议的接口语法经实测仍会失败；修订不覆盖原失败。"},
    {"at": benchmark["completed_at_utc"], "action": "另一代理完成独立综述基准收集", "output": "13项来源→5篇基准，收集者未读检索清单", "impact": "此时仅表示收集完成，不表示主代理已经揭盲或比对。"},
    {"at": next(q["finished_at"] for q in oa["queries"] if q["queryId"] == "OA-SUPPLEMENT-V2") + " 至 " + read("diagnostics/B03-receipt.json")["started_at"] + "（时间界限）", "action": "主题检索完成后揭盲与比对", "output": "原始主题3/5、图4/5；具体别名和词根漏检进入诊断", "impact": "确切揭盲时刻未独立记时；以上为完成主题检索之后、精确ID诊断之前的界限，不冒充精确时间戳。"},
    {"at": read("query-plan-v2.json")["amended_at"], "action": "登记词汇修订并重新主题检索", "output": "PubMed19/19；Europe PMC20/20；基准5/5", "impact": "修复了已知案例，成绩单列为样本内修复，未称查全。"},
    {"at": b["completed_at"], "action": "比对筛选复核与裁决", "output": f"89条独立AI复核；{len(disagreements)}条决定不同；新图候选另行定点筛查", "impact": "多物种处理组对应不足保持待定；重复题录关联，不作独立实验。"},
]
timeline.sort(key=lambda r: str(r["at"]).replace(" ", "T"))
downloads = [{"label": label, "url": "./data/" + name, "kind": kind} for name, label, kind in [
    ("retrieval-ownership-audit.md", "原Skill与本轮新增：归属审计", "MD"),
    ("retrieval-ownership-audit.json", "归属证据与固定版本源码定位", "JSON"),
    ("retrieve-pubmed.py.txt", "本轮新增：PubMed采集器源码", "PY/TXT"),
    ("retrieve-europepmc.py.txt", "本轮新增：Europe PMC采集器源码", "PY/TXT"),
    ("retrieve-openalex.py.txt", "本轮新增：OpenAlex采集器源码", "PY/TXT"),
    ("retrieval-trial-report.md", "检索实测过程与结果", "MD"),
    ("retrieval-trial.json", "结构化实测数据", "JSON"),
    ("retrieval-screening.csv", "逐条初筛与复核决定", "CSV"),
    ("retrieval-query-plan.json", "原始冻结方案", "JSON"),
    ("retrieval-query-plan-v2.json", "词汇修订方案", "JSON"),
    ("retrieval-request-receipts.json", "真实请求与分页回执", "JSON"),
    ("retrieval-benchmark.json", "独立基准与来源定位", "JSON"),
    ("retrieval-normalization-repair.json", "解析错误与修复回执", "JSON"),
    ("retrieval-screening-audit.json", "筛选复核、裁决与漏检诊断", "JSON"),
    ("retrieval-source-manifest.json", "本地原始产物哈希清单", "JSON"),
]]
trial = {
    "meta": {"title": "检索单独实测：把遗漏找出来", "startedAt": plan["frozen_at"], "planHash": receipt["sha256"], "status": "主要检索与漏检测试已执行；部分检查仍受限", "boundary": "第二轮检索试验；采用固定版本bibliography规则，API采集器为本轮新增适配。来源记录、自动初筛、AI复核与全文资格分开。"},
    "summary": {"lead": f"原始主检索只找回独立基准3/5；一跳追踪提高到4/5；修正别名与词根后，原生主题检索找回5/5。合并{len(records)}个候选题录，保留{counts.get('retain',0)}、待定{counts.get('uncertain',0)}；这些是阅读候选，不是已通过全文评估的独立实验。", "metrics": [
        {"value": "3/5 → 5/5", "label": "基准找回", "detail": "原始成绩→样本内修复；不代表全领域覆盖率"},
        {"value": len(records), "label": "合并候选题录", "detail": "DOI/PMID去重；同题无ID和版本关系另留提示"},
        {"value": 89, "label": "独立AI复核记录", "detail": "全部主检索与高风险项＋固定随机样本；非人工金标准"},
        {"value": len(new_retained), "label": "上一轮未收录的保留项", "detail": "可含学位论文与实验重叠，不能直接当独立实验篇数"},
    ]},
    "ownership": ownership, "termBlocks": term_blocks, "queries": queries,
    "flow": [{"label": "原始主检索并集", "count": len(native_primary_union), "detail": "PubMed17＋Europe PMC18有重叠"}, {"label": "合并所有候选", "count": len(records), "detail": "含扩展、OpenAlex、一跳图、修订；不等于全部合格文献"}, *[{"label": {"retain": "保留为阅读候选", "exclude": "初筛排除", "uncertain": "待全文/来源核实"}[k], "count": counts.get(k,0), "detail": "逐条决定与判断方式见下表"} for k in ["retain", "exclude", "uncertain"]]],
    "checks": checks, "records": public_records, "timeline": timeline, "gaps": gaps, "downloads": downloads,
    "audit": {"benchmarkScores": scores, "screenCounts": counts, "initialRules": pre["counts"], "reviewBCoverage": b["sampler"]["pool_counts"], "disagreements": disagreements, "distribution": distribution, "sourceAuditBoundary": "Software provenance validation is separate from scientific correctness."},
}
save(T / "trial.json", trial)
save(OUT / "retrieval-trial.json", trial)
save(OUT / "retrieval-ownership-audit.json", ownership)
for script in ["retrieve-pubmed.py", "retrieve-europepmc.py", "retrieve-openalex.py"]:
    (OUT / (script + ".txt")).write_bytes((ROOT / "scripts" / script).read_bytes())
ownership_md = (ROOT / "research/retrieval-ownership-audit.md").read_text(encoding="utf-8")
ownership_md = ownership_md.replace("[原始 ZIP](upstream-source.zip)", "原始 ZIP（本地 `research/upstream-source.zip`，未发布到网页）")
ownership_md = ownership_md.replace("(retrieval-trial/report.md)", "(retrieval-trial-report.md)")
for script, line in [("verify-citations.py", 15), ("retrieve-pubmed.py", 29), ("retrieve-europepmc.py", 25), ("retrieve-openalex.py", 30)]:
    ownership_md = ownership_md.replace(f"(../scripts/{script}#L{line})", f"({script}.txt)")
ownership_md = ownership_md.replace("[词表与方案冻结](../scripts/freeze-retrieval-plan.py#L13)", "词表与方案冻结（本地 `scripts/freeze-retrieval-plan.py`）")
(OUT / "retrieval-ownership-audit.md").write_text(ownership_md + "\n\n网页副本仅调整本地相对链接；原始审计与完整源码保留在本地项目中。\n", encoding="utf-8")
receipts = {"pubmed": pm, "europepmc": ep, "openalex": oa, "pubmed_v2": pm2, "europepmc_v2": ep2, "pubmed_requests": read("pubmed/requests.json"), "pubmed_v2_requests": read("pubmed-v2/requests.json")}
save(OUT / "retrieval-request-receipts.json", receipts)
save(OUT / "retrieval-query-plan.json", plan)
save(OUT / "retrieval-query-plan-v2.json", read("query-plan-v2.json"))
save(OUT / "retrieval-benchmark.json", benchmark)
save(OUT / "retrieval-normalization-repair.json", repair)
save(OUT / "retrieval-screening-audit.json", {"reviewer_a": a, "reviewer_b": b, "reviewer_c": c, "adjudication": overrides, "literal_diagnostics": read("diagnostics/block-test.json"), "benchmark_scores": scores})
manifest = []
for folder in ["pubmed", "europepmc", "openalex", "pubmed-v2", "europepmc-v2", "benchmark", "diagnostics", "screening"]:
    for path in sorted((T / folder).rglob("*")):
        if path.is_file() and path.suffix in {".json", ".xml"}:
            raw = path.read_bytes()
            manifest.append({"path": path.relative_to(ROOT).as_posix(), "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()})
save(OUT / "retrieval-source-manifest.json", {"files": manifest, "boundary": "Files remain in the local research project; the web download contains hashes, not full copyrighted abstracts."})
with (OUT / "retrieval-screening.csv").open("w", encoding="utf-8-sig", newline="") as handle:
    fields = ["id", "title", "year", "doi", "decision", "reason", "sources", "queries", "review1", "review2", "adjudication", "readScope", "screenMethod"]
    writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for row in public_records:
        writer.writerow({**row, "sources": "; ".join(row["sources"]), "queries": "; ".join(row["queries"])})
lines = ["# 检索单独实测：过程、遗漏与修复", "", trial["summary"]["lead"], "", trial["meta"]["boundary"], "", "## 先分清归属", "", "三个主题采集脚本 retrieve-pubmed.py、retrieve-europepmc.py、retrieve-openalex.py 均为本案例新增，不在固定提交原始ZIP中。原库提供流程规范、引文核验客户端及另一套本例未运行的主题发现代码。具体词表、采集器、基准与漏检修复是本轮适配。成绩来自组合方案，不能单独归因原Skill。", "", "详见归属审计：本地项目 research/retrieval-ownership-audit.md，网页下载 retrieval-ownership-audit.md。", "", f"原始方案SHA256：`{receipt['sha256']}`。", "", "## 词怎样生成", "", *plan["generation"], "", "## 实际来源和检索式", ""]
for q in queries:
    lines += [f"### {q['id']} · {q['source']}", "", f"日期：{q['at']}；{q['returned']}/{q['total'] if q['total'] is not None else '未知'}；{q['status']}。", "", "```text", q["query"], "```", "", q["notes"], ""]
lines += ["## 筛选怎么进行", "", f"合并{len(records)}条；初始机械规则：{pre['counts']}。主代理定点审查37条；另一AI独立复核89条；新增OpenAlex候选由C定点阅读。机器排除和读过摘要的判断在CSV中分别标记。", "", f"最终决定：{counts}。保留不等于全文通过、记录数不等于独立实验数。", "", "## 漏检与质量检查", ""]
for check in checks:
    lines += [f"### {check['title']}", "", check["result"], "", "分母：" + check["denominator"], "", "方法：" + check["method"], "", "限制：" + check["limitations"], ""]
    for row in check["rows"]:
        title = f"[{row['title']}](https://doi.org/{row['doi']})" if row.get("doi") else row["title"]
        lines.append("- " + title + "：" + row["reason"])
    lines.append("")
lines += ["## 仍然存在的盲区", "", *("- " + gap for gap in gaps), "", "## 复跑与本地原始记录", "", "`scripts/retrieve-pubmed.py`、`retrieve-europepmc.py`、`retrieve-openalex.py`只在明确运行时发起网络请求。网页构建只读已保存产物。冻结、修订、原始响应、复核与诊断文件在`research/retrieval-trial/`。", ""]
report = "\n".join(lines)
(T / "report.md").write_text(report, encoding="utf-8")
(OUT / "retrieval-trial-report.md").write_text(report, encoding="utf-8")
print(json.dumps({"records": len(records), "decisions": counts, "benchmark": scores, "new_retained": len(new_retained), "disagreements": len(disagreements), "C_records": len(c_rows)}))
