"""Publish a small, explicit whitelist of research artifacts to the static page."""
import csv
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / "research"
OUT = ROOT / "app" / "data"
OUT.mkdir(parents=True, exist_ok=True)
def read(name):
    return json.loads((RESEARCH / name).read_text(encoding="utf-8-sig"))
subprocess.run([sys.executable, str(ROOT / "scripts" / "build-skill-audit.py")], check=True)
subprocess.run([sys.executable, str(ROOT / "scripts" / "build-retrieval-trial.py")], check=True)
papers = read("phase2_investigation/papers.json")
methods = read("phase2_investigation/methods.json")
logs = read("phase2_investigation/search-log.json")
checks = []
events = []
for name in ("citation-verification.json", "citation-verification-additional.json"):
    path = RESEARCH / "phase2_investigation" / name
    if path.exists():
        report = json.loads(path.read_text(encoding="utf-8"))
        checks.extend(report["results"])
        events.extend(report["events"])
by_id = {row["id"]: row for row in checks}
for paper in papers:
    row = by_id.get(paper["id"], {})
    s2 = row.get("semantic_scholar", {}).get("status", "not_run")
    crossref = row.get("crossref", {}).get("status", "not_run")
    paper["verification"] = f"原始来源题录/摘要已定位；上游脚本 DOI+题名核验：Crossref {crossref}；Semantic Scholar {s2}。此状态不证明全文支持、实验真实性或创新性。"
    paper["status"] = {"abstract": "摘要级线索：全文方法未评估", "sections": "已读明确章节/片段：不是全文审读"}.get(paper["readScope"], paper["readScope"])
    if paper["id"] == "P06":
        paper["findings"] += " 逐终点相对PFOA单独暴露的方向仍为 not_resolvable（摘要不足以核对）。"

claims = [
 {"id":"C01","text":"PFAS 与微/纳塑料共暴露的斑马鱼毒性已存在多篇直接研究，宽泛组合本身不能作为新颖性依据。","status":"已找到前作","strength":"对本次已找到前作的存在性判断；不声称穷尽文献","evidenceIds":["P01","P02","P03","P05","P08","P09","P10"],"reason":"对应真实 DOI、题录与摘要，不能把本轮重新整理已有发现写成首次发现。"},
 {"id":"C02","text":"“塑料总会增强 PFAS 毒性”不符合本次证据。","status":"概括不成立","strength":"至少存在一篇直接研究报告阶段相关反向结果","evidenceIds":["P03"],"reason":"同一研究的胚胎窗口报告累积/孵化效应减弱，仔鱼窗口报告增强。该反例足以限制“总会”，却不能据此估计全领域发生比例。"},
 {"id":"C03","text":"方向需要按生命阶段、器官、时间和具体终点保留条件，不能压成每篇一个“协同”标签。","status":"有条件支持","strength":"作者摘要所报告的阶段/器官/时间条件性","evidenceIds":["P03","P05","P09"],"reason":"P03提供阶段对比；P05报告器官差异；P09报告7天和28天不同标签。后二者正式相互作用判据仍待全文核查，也未证明队列独立。"},
 {"id":"C04","text":"水中游离 PFAS 降低，不能直接当作鱼体负荷降低或整体风险降低。","status":"有条件支持","strength":"对应原研究的暴露与体内负荷观察","evidenceIds":["P01","P03"],"reason":"P01摘要报告游离浓度下降但肝/肠累积未变；P03强调阶段相关摄入过程。M02另列为方法指导，不作为本案毒性方向的实验依据。"},
 {"id":"C05","text":"菌群/组学关联与功能干预应分开评价；不能一律说该方向“没有机制验证”。","status":"分层判断","strength":"P10报告功能干预，但救援模型定位未核实","evidenceIds":["P01","P04","P08","P10"],"reason":"P01/P08提供菌群或通路相关解释；P10摘要报告PINK1过表达/药理激活与毒性缓解。由于同时有鱼和细胞模型，不能自动宣称整鱼机制已经救援验证。"},
 {"id":"C06","text":"目前材料不足以合并效应量、证明环境浓度下总体风险，或认证某个新题目无人做过。","status":"当前不能回答","strength":"本轮材料与研究范围的限制","evidenceIds":["P03","P07","P09"],"reason":"核心材料8篇摘要、2篇章节片段，没有核心全文审读；缺少统一浓度、实验单位与效应量数据，不能从片段拼成元分析。M01/M02仅为方法边界参考，未算作效应证据。"}
]
directions = [
 {"id":"D01","title":"围绕暴露条件收窄，而非重复“共暴露有毒”","question":"某一明确颗粒状态与暴露介质，是否改变同一PFAS的水相—内剂量—终点关系？","why":"这次找到的前作已经覆盖阶段转换和部分TK解释。后续问题需要限定材料与适用条件。","priorWorkIds":["P01","P03","P07","P09"],"increment":"待验证的可能增量：在明确材料/介质条件下测试已有解释的适用边界；不能把内剂量或阶段差异本身称为新概念。","design":"先取得P03/P07/P09全文与补充材料，列出它们已经控制的变量；再对拟选的颗粒老化/表面状态、介质与PFAS物种组合做定向查新。具备化学测量条件后，才考虑预先定义的比较设计。","risks":["核心前作已经做过相近TK/TD分析","当前未核实可用测量平台、实验预算和原始数据","不能把名义剂量不同的研究直接比较"],"priority":"优先查新与可行性核对","noveltyStatus":"未验证；是待查方向，不是已确认创新题目"},
 {"id":"D02","title":"把机制问题落到证据缺口的具体位置","question":"某个明确通路在特定模型与处理条件中的作用，已有干预验证到了哪一步？","why":"机制研究有多种证据层级；P10的功能干预使“只有相关性、无人验证”这个宽泛缺口不成立。","priorWorkIds":["P04","P08","P10"],"increment":"待验证的可能增量：补足同一问题中明确缺失的模型、时序或干预环节，而不是增加一批未关联因果的标志物。","design":"第一步是读取P10全文，定位过表达/药理救援属于细胞还是鱼、哪些单/共暴露处理；针对作者已回答和未回答的环节再检索。未完成这一步前不建议直接立项。","risks":["摘要不足以定位救援模型","指标变化不自动证明介导关系","需要专业实验条件与作者确认，本文没有执行新实验"],"priority":"先取关键全文","noveltyStatus":"未验证；现阶段不能认证整鱼机制空白"},
 {"id":"D03","title":"先做可复核的证据对照与再分析准备","question":"在可获得原始数据后，阶段/时间/器官差异能否在相同对照和相同效应指标下重现？","why":"目前最现实的起点是把可比和不可比项目分清，获得原始数据后再判断统计分析是否可行。","priorWorkIds":["P03","P05","P09"],"increment":"首先形成可复用的提取表与复核记录；是否具备论文贡献，需要继续对照已有综述和数据研究。P11/P12另列为设计背景，不是此方向的共暴露直接前作。","design":"用本页CSV联系和整理所需数据字段，核实同一队列、实验单位和相互作用模型；保留效应量/方差缺失项。满足条件后再制定正式综述或再分析方案。","risks":["当前不是完整数据库筛选","P05/P09队列独立性未知","不能承诺数据可获得或直接开展元分析"],"priority":"可立即开始资料复核","noveltyStatus":"工作起点可执行；发表新颖性仍未验证"}
]
summary_findings = [
 {"id":"F01","title":"这个组合已有研究，先把前作找齐","text":"已整理10篇直接共暴露研究。相关工作覆盖PFOS、PFOA、PFBA及F-53B，也包含多种颗粒材料。选题需要说清楚在这些前作上增加什么。","evidenceIds":["P01","P02","P03","P04","P05","P06","P07","P08","P09","P10"],"strength":"已有前作，不等同文献穷尽"},
 {"id":"F02","title":"不同条件下，结论要分别解释","text":"P03报告胚胎与仔鱼窗口出现不同方向；P05/P09分别提示器官和时间条件性。它们限制统一的增强叙事，但不能据此估计哪个条件独立导致差异。","evidenceIds":["P03","P05","P09"],"strength":"摘要级直接线索；正式交互模型待查"},
 {"id":"F03","title":"机制证据要分层，也要主动找反证","text":"一些研究以菌群/组学关联解释结果；P10则报告功能干预。下一步首先要确定干预发生在哪个模型，避免把细胞证据移植到整鱼。","evidenceIds":["P01","P04","P08","P10"],"strength":"模型边界明确保留"}
]

workflow = [
 {"id":"W01","title":"获取并固定真实技能","role":"skill-installer / 主会话","input":"用户提供的GitHub仓库","actions":["使用系统安装脚本下载4个原始技能目录","补齐同一提交的shared/scripts/docs和许可","记录1106个文件的SHA-256，不嵌套.git"],"output":"固定提交b8d050f24f2e…；原始文件与适配器分开","artifact":["./data/upstream-manifest.json","./data/deep-research-SKILL.md","./data/upstream-LICENSE.txt"],"status":"已实际执行"},
 {"id":"W02","title":"把水生毒理学收窄为可调查的问题","role":"research_question_agent + research_architect_agent","input":"用户给出水生毒理学方向，没有原始实验数据","actions":["形成3个候选问题与暂定FINER判断","确定物种、PFAS、颗粒、比较对象和时间范围","按原始Devil’s Advocate规范审查范围；新颖性标为未验证"],"output":"研究问题、方法计划、范围审查；均待作者复核","artifact":["./data/rq-brief.md","./data/methodology.md","./data/checkpoint1-review.md"],"status":"已实际执行；未伪造人工确认"},
 {"id":"W03","title":"检索并记录实际遇到的候选","role":"bibliography_agent","input":"概念组、种子DOI和纳入/排除标准","actions":["执行37条正式网页查询，定位PubMed/PMC/出版社原始记录","按DOI和题名合并同一论文的多站记录","记录15个排除候选及停止原因；另保留主会话方法/定向补查"],"output":"10篇核心研究、2篇分开的背景研究；没有编造数据库总命中数","artifact":["./data/search-log.json","./data/bibliography.md"],"status":"已实际执行；非系统综述筛选"},
 {"id":"W04","title":"按真实阅读范围提取证据","role":"bibliography_agent + source_verification_agent","input":"真实摘要、可见章节与公开原始页面","actions":["提取物种、阶段、暴露、终点、作者结果和定位","把摘要未说明的浓度、统计与机制留为未知","记录403与无法获得全文；背景研究不混入核心分母"],"output":"10篇核心中8篇摘要、2篇章节片段；核心全文审读0篇","artifact":["./data/papers.json","./data/evidence.csv","./data/source-verification.md"],"status":"已实际执行；阅读限制公开"},
 {"id":"W05","title":"运行上游程序核对书目身份","role":"原始SemanticScholarClient + CrossrefClient","input":"12篇论文的DOI和题名","actions":["本地适配器调用固定版本原始客户端，未替换为测试桩","记录每条匹配、429限流和其他不可用情况","将存在性核验与正文支持、创新性分开"],"output":"实时API记录；成功/失败数量以下载文件为准","artifact":["./data/citation-verification.json"],"status":"已实际运行；按实际API结果记录"},
 {"id":"W06","title":"比较一致、分歧与最接近前作","role":"synthesis_agent","input":"有阅读范围与身份记录的研究集合","actions":["按生命阶段、器官、时间和暴露测量区分证据","保留非一致结果；不用篇数投票生成总体风险","区分作者的协同标签与本次可核实的交互判据"],"output":"文献矩阵、6条带依据判断、前作限制与候选方向","artifact":["./data/synthesis.md","./data/research.json"],"status":"见实际综合交付文件"},
 {"id":"W07","title":"审查、改写并呈现","role":"report_compiler_agent / Devil’s Advocate / editor / ethics","input":"综合结果与报告草稿","actions":["检查作者结果、模型层级和我们自己的推断是否混用","保留关键前作，移除未经证实的创新表述","按审查结果修改，生成网页与可下载研究报告"],"output":"最终研究报告、审查及修改记录、交互网页","artifact":["./data/report.md","./data/review.md","./data/process.md"],"status":"随最终审查结果更新"}
]
extras = [
 {"id":"N01","q":"zebrafish PFOS nanoplastics aged biofilm depuration toxicokinetic","source":"主会话定向网页补查","date":"2026-10-29","notes":"用于追查拟议扩展与相近前作；原始返回另留targeted-web-results.json，不以无匹配认证空白。"},
 {"id":"N02","q":"zebrafish PFOS microplastics gut microbiota transplantation causal","source":"主会话定向网页补查","date":"2026-10-29","notes":"用于机制证据补查，未将检索未覆盖等同无人做过。"},
 {"id":"N03","q":"zebrafish microplastics PFAS internal concentration toxicodynamic life stage","source":"主会话定向网页补查","date":"2026-10-29","notes":"再次定位P03；不能把已有TK/TD和生命阶段转换当新贡献。"},
 {"id":"M01-query","q":"site.oecd.org test no 236 fish embryo acute toxicity test guideline 236 2025","source":"OECD官方方法资料定位","date":"2026-10-29","notes":"只用于报告边界，不加入核心共暴露效应集合。"},
 {"id":"M02-query","q":"site.oecd.org guidance document aquatic toxicity testing difficult substances mixtures measured concentrations 23","source":"OECD官方方法资料定位","date":"2026-10-29","notes":"定位GD23及实测浓度相关段落。"}
]
review_path = RESEARCH / "phase5_review" / "review.json"
review = json.loads(review_path.read_text(encoding="utf-8")) if review_path.exists() else {"findings":[],"executionLimits":["最终报告角色复核仍在进行；当前网页为研究预览。"]}
if (RESEARCH / "phase3_analysis/synthesis.md").exists():
    workflow[5]["status"] = "已实际综合；3对张力仍待作者确认"
if review.get("findings") and all(item.get("status") == "resolved_verified" for item in review["findings"]):
    workflow[6]["status"] = "5项修正已定点复查；专业判断仍待作者核查"
execution_limits = [
 "这是Codex按原始技能文件执行的适配研究；未运行Claude原生插件hooks、原生Task编排或完整诚信闸门。",
 "同一模型家族的角色分工，非独立专家共识；没有同模型有/无此库的对照实验，不能证明效率或准确率提升。",
 "10篇核心均未完成全文审读；8篇仅摘要、2篇含明确章节片段，不能评定全部方法、统计或原始数据真实性。",
 "37条正式网页查询加5条主会话补查；不是原生PubMed/Scopus/WoS完整检索，没有PRISMA穷尽性声明。",
 "15个排除记录是本轮人工整理的遇到候选，不是所有检索返回结果的完整筛选分母。",
 "P05与P09队列独立性未知；论文数不等于独立实验重复数。",
 "候选研究方向未获创新性认证；全文获取和定向前作核查是下一步，不以检索缺失证明无人做过。",
 "本次无新增动物实验或用户原始数据，不推导环境安全阈值或人体健康结论。"
]
review["executionLimits"] = execution_limits + review.get("executionLimits", [])
data = {
 "meta":{"title":"学术研究 Skill，\n从理解到可追溯研究","subtitle":"研究这个库的能力、5个Skill、适用场景与价值，以水生毒理学展示拆题、检索、筛选、补漏与分析；原库、本轮适配和未验证部分分别记录。","date":"2026-10-29","skillVersion":"deep-research 2.12.1 / suite 3.24.0","upstreamCommit":"b8d050f24f2e1c465c4410eace8634ea3af15930","mode":"一次真实研究过程","executionNote":"由Codex主会话与子代理读取原始规范、手动编排并运行原始核验客户端。任务委派以产物为依据整理成摘要；不是原始逐字提示词日志，也未运行Claude原生完整插件流程。"},
 "scope":{"question":"微/纳塑料共暴露相对同条件PFAS单独暴露的斑马鱼毒性，如何随生命阶段与暴露条件变化？","population":"Danio rerio；阶段与器官分别记录","exposure":"微/纳塑料与PFOS、PFOA、PFBA、F-53B；化学物种分开","comparison":"同实验、同条件的PFAS单独暴露；不把相对空白组的变化冒充联合效应","outcomes":"暴露/体内负荷、发育、行为、器官与机制证据；按原研究终点保留条件","timeRange":"2015-01-01 至 2026-10-29；实际核心样本发表于2024–2026","reviewType":"有范围限制的叙述性证据调查","assumptions":["具体案例由代理从宽泛领域中选择，未当作用户已确认的论文题目","无用户实验数据，先完成前作和证据调查"],"limits":execution_limits[:5]},
 "summary":{"lead":"本轮核心材料为8篇摘要、2篇章节片段，全文审读0篇。已报道结果不支持“塑料总会增强PFAS毒性”，也让“首次研究生命阶段或时间差异”失去直接依据。下一步应核实具体暴露、模型和机制环节；当前材料不足以认证新颖性或合并风险。","findings":summary_findings},
 "papers":papers+methods,"workflow":workflow,"claims":claims,"directions":directions,"review":review,
 "search":{"queries":logs["queries"]+extras,"counts":{"核心研究":10,"背景研究":2,"方法资料":2,"正式查询":len(logs["queries"]),"主会话补查":len(extras),"记录的排除候选":len(logs["exclusions"])},"exclusions":logs["exclusions"],"selectionNotes":logs["selectionNotes"]},"artifacts":[]
}
exports = [
 ("skill-mechanism-audit.md","skill-mechanism-audit.md","Skill拆解：搜索、来源、遗漏与场景","md"),
 ("skill-mechanism-audit.json","skill-mechanism-audit.json","Skill拆解与原始文件定位","json"),
 ("../scripts/verify-citations.py","verify-citations.py.txt","本次调用原始客户端的适配器代码","txt"),
 ("phase2_investigation/programmatic-verification-summary.md","programmatic-verification-summary.md","最终实时程序核验摘要","md"),
 ("process-walkthrough.md","process-walkthrough.md","这次怎样做：过程导览","md"),
 ("process-walkthrough.json","process-walkthrough.json","过程、转折与分工数据","json"),
 ("phase6_final/report.md","report.md","研究报告","md"),
 ("phase3_analysis/synthesis.md","synthesis.md","证据综合与前作比较","md"),
 ("phase5_review/review.md","review.md","审查与修订记录","md"),
 ("process.md","process.md","实际执行过程","md"),
 ("phase1_scoping/rq-brief.md","rq-brief.md","研究问题与范围","md"),
 ("phase1_scoping/methodology.md","methodology.md","方法计划","md"),
 ("phase1_scoping/checkpoint1-review.md","checkpoint1-review.md","范围反方审查","md"),
 ("phase2_investigation/bibliography.md","bibliography.md","注释书目","md"),
 ("phase2_investigation/source-verification.md","source-verification.md","来源核验报告","md"),
 ("phase2_investigation/search-log.json","search-log.json","检索/排除/去重记录","json"),
 ("upstream-manifest.json","upstream-manifest.json","技能固定版本与哈希","json"),
 ("upstream/deep-research/SKILL.md","deep-research-SKILL.md","本次采用的原始SKILL","md"),
 ("upstream/LICENSE","upstream-LICENSE.txt","上游CC BY-NC许可","txt"),
 ("execution-contract.md","execution-contract.md","执行环境与适配约定","md")
]
for source, destination, label, kind in exports:
    path=RESEARCH/source
    if path.exists():
        shutil.copyfile(path,OUT/destination)
        data["artifacts"].append({"title":label,"url":"./data/"+destination,"kind":kind})
# The research guide uses stage-relative paths; its public copy lives flat in data/.
# Keep the three distinct verification/review receipts linked to their original
# committed files rather than relabeling them as the merged public summary.
walkthrough_links = {
    "phase1_scoping/rq-brief.md": "rq-brief.md",
    "phase1_scoping/methodology.md": "methodology.md",
    "phase1_scoping/checkpoint1-review.md": "checkpoint1-review.md",
    "phase2_investigation/search-log.json": "search-log.json",
    "phase2_investigation/bibliography.md": "bibliography.md",
    "phase2_investigation/papers.json": "papers.json",
    "phase2_investigation/source-verification.md": "source-verification.md",
    "phase2_investigation/citation-verification-combined.json": "citation-verification.json",
    "../scripts/verify-citations.py": "verify-citations.py.txt",
    "phase3_analysis/synthesis.md": "synthesis.md",
    "phase6_final/report.md": "report.md",
    "phase5_review/review.md": "review.md",
}
published_source = "https://github.com/yydshly/1025_codex_project/blob/13c81cc0dedb1386fa231549b560a3fae8ef23f3/projects/012-aquatic-toxicology-skill-lab/research/"
for source in ["phase2_investigation/citation-verification.json", "phase2_investigation/citation-verification-additional.json", "phase5_review/review.json"]:
    walkthrough_links[source] = published_source + source
walkthrough_public = (OUT / "process-walkthrough.md").read_text(encoding="utf-8")
for source, target in walkthrough_links.items():
    walkthrough_public = walkthrough_public.replace("](" + source + ")", "](" + target + ")")
(OUT / "process-walkthrough.md").write_text(walkthrough_public, encoding="utf-8")
combined={"date":"2026-10-29","upstream_commit":data["meta"]["upstreamCommit"],"results":checks,"events":events,"counts":{"records":len(checks),"crossref_matched":sum(r.get("crossref",{}).get("status")=="matched" for r in checks),"s2_matched":sum(r.get("semantic_scholar",{}).get("status")=="matched" for r in checks),"s2_unavailable":sum(r.get("semantic_scholar",{}).get("status")=="unavailable" for r in checks)},"boundary":"DOI/title identity only. Not proof of claim support, experimental truth, or novelty."}
(OUT/"citation-verification.json").write_text(json.dumps(combined,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
(RESEARCH/"phase2_investigation/citation-verification-combined.json").write_text(json.dumps(combined,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
verification_note = "\n\n## 最终实时程序核验补充\n\n" + f"最终12篇论文均已尝试：Crossref DOI/题名匹配 {combined['counts']['crossref_matched']}/12；Semantic Scholar匹配 {combined['counts']['s2_matched']}/12（P03/P09），不可用 {combined['counts']['s2_unavailable']}/12。详见合并JSON的逐条状态与时间。正文前部是角色审查时的快照，不能当最终API分母。匹配不等于全文已读、实验真实或创新性确认；网络错误不等于论文不存在。\n"
original_source_report = RESEARCH / "phase2_investigation/source-verification.md"
if original_source_report.exists():
    (OUT/"source-verification.md").write_text(original_source_report.read_text(encoding="utf-8")+verification_note,encoding="utf-8")
(RESEARCH/"phase2_investigation/programmatic-verification-summary.md").write_text(verification_note.lstrip(),encoding="utf-8")
(OUT/"papers.json").write_text(json.dumps(papers+methods,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
with (OUT/"evidence.csv").open("w",encoding="utf-8-sig",newline="") as handle:
    fields=["id","title","authors","year","doi","role","readScope","stage","exposure","duration","endpoints","findings","limitations","locator","url","verification"]
    writer=csv.DictWriter(handle,fieldnames=fields,extrasaction="ignore")
    writer.writeheader(); writer.writerows(papers+methods)
for title,url,kind in [("结构化研究数据","research.json","json"),("文献对照表","evidence.csv","csv"),("上游脚本实时核验结果","citation-verification.json","json")]:
    data["artifacts"].append({"title":title,"url":"./data/"+url,"kind":kind})
data["walkthrough"] = read("process-walkthrough.json")
data["skillBreakdown"] = read("skill-mechanism-audit.json")
data["retrievalTrial"] = read("retrieval-trial/trial.json")
data["artifacts"].extend({"title": item["label"], "url": item["url"], "kind": item["kind"].lower()} for item in data["retrievalTrial"]["downloads"])
data["understandingSummary"] = read("understanding-summary.json")
for name in ["understanding-summary.json", "understanding-summary.md", "understanding-image-prompt.md"]:
    shutil.copyfile(RESEARCH / name, OUT / name)
data["artifacts"].extend([
    {"title": "我们的理解：能力、价值、原理与来源处理", "url": "./data/understanding-summary.md", "kind": "md"},
    {"title": "理解总结与来源获取方式", "url": "./data/understanding-summary.json", "kind": "json"},
    {"title": "研究Skill理解总览信息图", "url": "./assets/understanding-map.png", "kind": "png"},
    {"title": "理解总览信息图生成提示词", "url": "./data/understanding-image-prompt.md", "kind": "md"},
])
data["walkthrough"]["purpose"] = "两轮工作分别留痕：首轮探索形成研究报告；本轮沿用案例单独验证检索，实际发现词汇漏检、登记修订并重跑，保留原始与修复成绩。"
(OUT/"research.json").write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
(OUT/"research-data.js").write_text("window.RESEARCH_DATA = "+json.dumps(data,ensure_ascii=False)+";\n",encoding="utf-8")
print(json.dumps({"papers":len(data["papers"]),"core":sum(p["role"]=="core" for p in papers),"claims":len(claims),"queries":len(data["search"]["queries"]),"verification":combined["counts"],"artifacts":len(data["artifacts"])}))
