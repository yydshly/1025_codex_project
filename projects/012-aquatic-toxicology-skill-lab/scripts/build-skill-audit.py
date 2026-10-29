"""Compose a source-pinned explanation of the suite, without rerunning research."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / "research"
catalog = json.loads((RESEARCH / "skill-catalog-audit.json").read_text(encoding="utf-8"))
search = json.loads((RESEARCH / "search-mechanism-audit.json").read_text(encoding="utf-8"))
COMMIT = catalog["commit"]
assert COMMIT == search["upstreamCommit"]
BASE = f"https://github.com/Imbad0202/academic-research-skills/blob/{COMMIT}/"
exports = {
    "phase1_scoping/methodology.md": "methodology.md",
    "phase2_investigation/search-log.json": "search-log.json",
    "phase2_investigation/source-verification.md": "source-verification.md",
    "phase2_investigation/programmatic-verification-summary.md": "programmatic-verification-summary.md",
    "scripts/verify-citations.py": "verify-citations.py.txt",
}


def ref(item):
    if item.get("kind", "upstream") == "upstream":
        url = BASE + item["path"] + f"#L{item['line']}"
    else:
        url = "./data/" + exports.get(item["path"], "process.md")
    return {"label": item.get("label", item["path"]), "url": url,
            "path": item["path"], "line": item.get("line")}


def refs(ids):
    return [ref(search["sources"][key]) for key in ids]


layers = [
    {"name": "5个顶层Skill", "description": "选择做研究、筛文献、写论文、审稿或管理全流程。",
     "actual": "本轮装了4个；安装、选读规则、完整运行分别记录。"},
    {"name": "内部代理角色", "description": "模型按角色说明执行拆题、书目、核查和综合；deep-research列出13个角色。",
     "actual": "本轮由Codex主会话与子代理分工，不是13位独立专家。"},
    {"name": "程序工具", "description": "API客户端、检索适配器与记录处理代码，负责具体可重复的操作。",
     "actual": "本轮跑了Crossref和S2身份核验；其他代码存在不等于已用。"},
    {"name": "宿主与数据源", "description": "模型、网页搜索、页面读取、数据库接口和访问权限决定实际能取到什么。",
     "actual": "本轮主题发现靠宿主网页搜索，随后读取PubMed、PMC和出版商内容。"},
]

items = []
for skill in catalog["skills"]:
    source = dict(skill["sourceRefs"][0])
    source["label"] = f"{skill['id']}/SKILL.md · v{skill['version']}"
    items.append({"id": skill["id"], "name": f"{skill['id']}｜{skill['label']}",
                  "description": skill["purpose"] + " 输入：" + skill["input"] + " 产物：" + "、".join(skill["outputs"]),
                  "installed": skill["id"] != "sr-screener",
                  "usage": skill["thisRun"] + " 边界：" + skill["boundary"],
                  "source": ref(source), "modes": skill["modes"]})

inputs = ["用户只给出水生毒理学方向，没有实验数据或明确论文问题。",
          "暂定的研究问题、纳入排除条件、可用搜索工具和访问权限。",
          "网页返回的候选记录和可访问的原始页面。",
          "已经找到的12篇论文的DOI和题名；不再是宽泛主题。",
          "问题的子主题、文献分布、未决项和当前阅读深度。"]
examples = [
    "水生毒理学 → 斑马鱼 × 微/纳塑料 × PFAS。再限定比较对象为同条件PFAS单独暴露。该收窄由AI选择，尚待作者确认。",
    'Q01：zebrafish PFAS microplastics nanoplastics PFOS PFOA coexposure toxicity。随后有PFOS/PFOA窄组合，也有题名/DOI定位；选词与迭代由AI按规则完成。',
    'Q08只搜“41027221”得到无关数字记录，未作证据。Q24用P09的精确DOI加site:pubmed.ncbi.nlm.nih.gov定位题录。这两个查询对应不同论文，不是同一论文的连续重试。',
    "Crossref匹配12/12；S2匹配P03、P09，其他10条因429不可用。失败如实保留，不写成论文不存在。原始时间和逐条状态可下载。",
    "核心样本10/10发表于2024—2026，8/10在Elsevier期刊，10/10为实验研究；这是需要解释的集中分布。P06逐终点方向、P10救援模型归属继续留为未知。",
]
limits = ["这只是所选子题，不是整个水生毒理领域的完整图景。",
          "37条是查询动作数，包含已知论文定位；无法当覆盖率。原生PubMed/WoS/Scopus主题检索没有执行。",
          "未完成上游要求的第二轮全文筛选。摘要级记录只能作受限线索；15个排除候选不是全部检索结果的筛选分母。",
          "题录真实不等于论断被原文支持；这个动作没有检查尚未找到的论文，也没有阅读全文。",
          "本轮在10篇核心、2篇背景后按任务规模停止，没有通过独立漏检测试。没有得到总体召回率或理解准确率。",
]
steps = []
for i, step in enumerate(search["steps"]):
    steps.append({"id": step["id"], "title": step["title"], "input": inputs[i],
                  "rule": step["originalRule"], "action": step["actualAction"],
                  "example": examples[i], "output": step["output"],
                  "limitation": limits[i], "sources": refs(step["sources"])})

sources = [
    {"name": "宿主网页搜索", "category": "本次主题发现", "status": "实际使用",
     "capability": "按关键词发现网页与论文线索，随后由AI选取、筛选和读取。",
     "access": "Codex当时提供的web.run搜索工具；不是该库自建的搜索引擎。",
     "actual": "37条正式查询＋5条补查。包括主题发现、题名定位、DOI核对和方法资料搜索；不能全部算作扩展覆盖。",
     "source": refs(["A02"])[0]},
    {"name": "PubMed / PMC / 出版商", "category": "本次内容读取", "status": "实际访问；深度受限",
     "capability": "PubMed提供题录和摘要；PMC提供开放文章；ScienceDirect、RSC等提供出版商内容。",
     "access": "网页搜索后读取官方页面或可见搜索内容。site:pubmed…的域名限定不等于原生数据库检索。",
     "actual": "核心8篇摘要、2篇部分章节、0篇全文审读。部分ScienceDirect、RSC全文请求403，未绕过访问限制。",
     "source": refs(["A03"])[0]},
    {"name": "Crossref / Semantic Scholar", "category": "本次运行的原始程序", "status": "实时身份核验",
     "capability": "输入已知DOI/题名，检查返回的题录是否对应；支持题名后备匹配。",
     "access": "本地适配器调用原始CrossrefClient和SemanticScholarClient。题名后备只取少量候选，非主题穷尽搜索。",
     "actual": "12篇都尝试。Crossref匹配12；S2匹配2，另外10条429不可用。没有因此增加全文读取深度。",
     "source": refs(["A05"])[0]},
    {"name": "OpenAlex / arXiv / 中文引文核验", "category": "库中其他核验代码", "status": "本轮未运行这些客户端",
     "capability": "按已知论文坐标解析题录。中文核验协议另有注册机构和PubMed坐标分支。",
     "access": "需由运行环境实际调用各客户端，满足其网络与输入条件。",
     "actual": "曾遇到OpenAlex题录网页线索，但未运行OpenAlexClient；arXiv和中文核验客户端均未运行。",
     "source": refs(["U13"])[0]},
    {"name": "四索引关键词发现代码", "category": "独立的claim-standing路径", "status": "本轮未运行",
     "capability": "claim_standing_discovery.py实现S2、OpenAlex、Crossref、arXiv的关键词候选发现。",
     "access": "输入单独的query plan；单页、有返回上限，不自动穷尽翻页；不负责判定相关性或结论立场。",
     "actual": "不参与本轮37条查询。固定源码自述该实现当时尚未live验证，不能当成熟覆盖检测器。",
     "source": refs(["U16"])[0]},
    {"name": "WoS / Scopus / Scholar / CNKI等", "category": "规范中的按需选项", "status": "没有原生主题检索回执",
     "capability": "原始资料按情境讨论跨库补查、中文来源和引文监测；bibliography的DATABASES字段由执行者填写。",
     "access": "依赖账号、订阅、接口和宿主能力。Skill里出现数据库名称不会自动接通数据库。",
     "actual": "本轮未原生执行这些数据库的主题检索，也未设置持续监测。不能把建议清单当实际搜索范围。",
     "source": refs(["U12"])[0]},
]

next_actions = [
    "先由研究者确认问题边界；按实际数据库语法检查同义词、字段、时间和语言限制，保存完整结果。",
    "如果使用个人文献库，先清点输入记录与子主题；对未覆盖项单列补查，不用‘主题已有一篇’推断查全。",
    "解释集中是否源于题目；必要时扩充年代、语言、数据库或文献类型，并记录新增结果。不能为了均衡而纳入不相关论文。",
    "保留未核验状态并在服务可用时补查。另行做主题发现的覆盖测试，不将身份核验成功率当召回率。",
    "另取独立来源的合格论文清单测试原始主题检索式，逐条解释漏检；测试集找回比例仅适用于该样本。",
    "保存逐库导出、去重和筛选记录；追踪关键论文的参考文献与被引文献，公开新增研究及停止依据。",
]
checks = []
for i, control in enumerate(search["omissionControls"]):
    checks.append({"title": control["name"], "risk": control["mechanism"],
                   "upstream": control["origin"] + "。" + control["cannotProve"],
                   "actual": control["actualState"], "next": next_actions[i],
                   "verdict": ["部分执行", "条件流程未运行", "已记录；非查全证明", "已运行；仅身份核验", "未执行独立测试", "未完成全量追踪"][i],
                   "sources": refs(control["sources"])})
sr = next(item for item in items if item["id"] == "sr-screener")
checks.extend([
    {"title": "区分搜索漏检与筛选误排", "risk": "论文根本没进入候选集，与已取得的论文被误排，是两类风险。",
     "upstream": "sr-screener提供种子、近似排除复查与pilot标签对照，检查已得到记录的筛选过程。它不能检查自己从未收到的全部论文。",
     "actual": "本轮未安装、未运行sr-screener；原ZIP中的能力说明不算执行成绩。",
     "next": "完整导出记录后，确认筛选标准，以人工标注的pilot样本测试，并核查排除及批次计数。",
     "verdict": "未运行sr-screener", "sources": [sr["source"]]},
    {"title": "核对理解、推断与原文支持", "risk": "误读对照、单位、实验模型，把作者推断升级成因果，或将不同研究的终点直接拼接。",
     "upstream": "原始角色要求标明读取范围、定位依据，不能在仅读摘要时推断方法缺陷；复核角色负责质疑与修订。",
     "actual": "P06逐终点方向未知、P10救援模型归属未知；同类AI复核改了5处问题。没有独立盲提取、人工领域复核或准确率测量。",
     "next": "取得关键全文与补充材料，逐条记录图表/页码、处理与对照、剂量、效应和统计；由第二位审核者独立提取，记录并解决分歧。",
     "verdict": "局部复核；关键项待核", "sources": refs(["U05", "A03"])},
])

scenarios = []
for i, item in enumerate(catalog["scenarios"]):
    scenario = {"title": item["request"], "input": item["request"], "route": item["route"],
                "actions": item["actions"], "deliverable": item["deliverable"],
                "boundary": item["thisRun"], "status": "用法示例；本轮未执行"}
    if i == 0:
        scenario["status"] = "本轮只做了暂定收窄"
    if i == 1:
        scenario["status"] = "本轮实际采用的任务类型"
    if i == 3:
        scenario["status"] = "本轮做了部分定向核查"
        scenario["route"][0] = "deep-research（定向前作任务，非独立模式）"
    if i == 5:
        scenario["route"][3] = "诚信核查阶段（非新Skill）"
    scenarios.append(scenario)

audit = {
    "schema": "skill-mechanism-explainer/1.0", "date": "2026-10-29", "commit": COMMIT,
    "auditBoundary": "固定源码与已有执行产物审计；未新增科学检索、重跑API或执行其他Skill。",
    "intro": "把‘用了Skill’拆成可核对的动作：先认清5个工作流入口，再看主题如何变成检索式、实际用哪些来源，以及哪些检查能够发现漏检和误读。水生毒理学是本轮执行案例。",
    "verdict": "这里分别展示原始规范、程序实现和本轮执行。AI仍负责选择与理解；数据库权限、读取深度及外部验证决定我们能作多强的判断。",
    "layers": layers,
    "catalog": {"total": 5, "installed": 4,
                "note": "固定版本有5个顶层Skill。13个代理角色属于deep-research内部；Python客户端和宿主搜索另算。展开查看用途、输入、产物及这轮使用程度。", "items": items},
    "searchSteps": steps, "sources": sources, "checks": checks, "scenarios": scenarios,
    "takeaway": "检查一个Skill时，逐项追问：接收什么输入、规定谁做什么、实际调用哪个工具和来源、怎样发现失败、留下什么证据。覆盖测试与逐条原文核验应有自己的执行记录，不能由流程说明代替。",
    "sourceAudits": ["research/skill-catalog-audit.json", "research/search-mechanism-audit.json"],
    "deepResearchRoles": catalog["deepResearchRoles"],
    "sourceIndex": {key: ref(value) for key, value in search["sources"].items()},
}
(RESEARCH / "skill-mechanism-audit.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def md_links(values):
    return "；".join(f"[{v['label']}]({v['url'].replace('./data/', './')})" for v in values)


lines = ["# Skill怎样工作：目录、搜索、来源、遗漏与场景", "", audit["auditBoundary"],
         "", f"日期：{audit['date']}；固定提交：`{COMMIT}`。", "", audit["intro"], "", audit["verdict"],
         "", "## 先分清四层", ""]
for layer in layers:
    lines.extend([f"- **{layer['name']}**：{layer['description']} 本轮：{layer['actual']}"])
lines.extend(["", "## 五个顶层Skill", ""])
for item in items:
    lines.extend([f"### {item['name']}", "", item["description"], "", item["usage"], "", md_links([item["source"]]), ""])
lines.extend(["## 从主题到搜索", ""])
for step in steps:
    lines.extend([f"### {step['id']} {step['title']}", ""])
    for label, key in [("输入", "input"), ("上游规则", "rule"), ("实际动作", "action"), ("具体例子", "example"), ("产物", "output"), ("限制", "limitation")]:
        lines.append(f"- **{label}**：{step[key]}")
    lines.extend(["", md_links(step["sources"]), ""])
lines.extend(["## 来源和工具：建议、实现、执行分开", ""])
for item in sources:
    lines.extend([f"### {item['name']}（{item['status']}）", "", f"- 能力：{item['capability']}", f"- 访问：{item['access']}", f"- 本轮：{item['actual']}", "", md_links([item["source"]]), ""])
lines.extend(["## 怎样发现遗漏和误读", ""])
for item in checks:
    lines.extend([f"### {item['title']}（{item['verdict']}）", "", f"- 风险/机制：{item['risk']}", f"- 上游：{item['upstream']}", f"- 本轮：{item['actual']}", f"- 下一步验证：{item['next']}", "", md_links(item["sources"]), ""])
lines.extend(["## 场景路由", ""])
for item in scenarios:
    lines.extend([f"### {item['title']}（{item['status']}）", "", "路径：" + " → ".join(item["route"]), ""])
    lines.extend("- " + action for action in item["actions"])
    lines.extend(["", "产物：" + item["deliverable"], "", "本轮边界：" + item["boundary"], ""])
lines.extend(["## 解释边界", "", audit["takeaway"], "", "本次未运行的功能仅依据固定源码说明，不代表经过端到端实测；角色分工不代表独立专家评审。", ""])
(RESEARCH / "skill-mechanism-audit.md").write_text("\n".join(lines), encoding="utf-8")
print(json.dumps({"skills": len(items), "search_steps": len(steps), "source_groups": len(sources), "checks": len(checks), "scenarios": len(scenarios)}))
