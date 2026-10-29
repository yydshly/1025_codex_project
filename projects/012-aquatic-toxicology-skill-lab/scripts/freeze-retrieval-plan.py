"""Freeze the prospective search plan before checking independent benchmarks."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "research/retrieval-trial"
OUT.mkdir(parents=True, exist_ok=True)
target = OUT / "query-plan.json"
if target.exists():
    raise SystemExit("Plan already exists; preserve it and use a separately labelled amendment.")
blocks = {
    "organism": ["zebrafish", '"Danio rerio"'],
    "plastic": ["microplastic*", "nanoplastic*", '"micro plastic*"', '"nano plastic*"', "polystyrene", "polyethylene", '"polyethylene terephthalate"', "polypropylene", '"polyvinyl chloride"', '"polymethyl methacrylate"'],
    "pfas": ["PFAS", "PFOS", "PFOA", "PFBA", "PFHxS", "PFBS", '"F-53B"', '"Cl-PFESA"', "perfluoro*", "polyfluoro*", "fluorotelomer*"],
}
def pubmed(name):
    return "(" + " OR ".join(term + "[Title/Abstract]" for term in blocks[name]) + ")"
def epmc(name):
    return "(" + " OR ".join("TITLE_ABS:" + term for term in blocks[name]) + ")"
pub_date = '("2015/01/01"[Date - Publication] : "2026/10/29"[Date - Publication])'
epmc_date = "FIRST_PDATE:[2015-01-01 TO 2026-10-29]"
plan = {
    "schema": "retrieval-trial-plan/1.0", "frozen_at": datetime.now(timezone.utc).isoformat(),
    "skill_commit": "b8d050f24f2e1c465c4410eace8634ea3af15930",
    "scope": "斑马鱼实验中的微/纳塑料与PFAS共暴露原始研究；只测试检索与题名摘要筛选，不据此评价毒性、统计或创新性。",
    "date_range": ["2015-01-01", "2026-10-29"], "language_filter": "none",
    "generation": [
        "从研究问题提取物种、塑料、PFAS三个概念块，块内OR、块间AND。",
        "物种加入学名；塑料加入拼写变体与常见聚合物；PFAS加入缩写、替代物和词根。",
        "不要求synergy、toxicity、coexposure、任何毒性方向或终点词，降低结果措辞造成的漏检。",
        "按接口语法转译字段与日期；这是AI制定策略＋本轮脚本转译，不是上游自建数据库。",
        "不按已知论文题名/DOI优化本轮原始主题查询；旧10篇只作回归检查，不当独立基准。",
    ],
    "blocks": blocks,
    "queries": [
        {"id": "PM-PRIMARY", "source": "PubMed E-utilities", "purpose": "主检索", "query": " AND ".join([pubmed(k) for k in blocks] + [pub_date])},
        {"id": "EPMC-PRIMARY", "source": "Europe PMC REST", "purpose": "互补接口主检索（与PubMed有大量重叠）", "query": " AND ".join([epmc(k) for k in blocks] + [epmc_date])},
        {"id": "EPMC-NO-ORGANISM", "source": "Europe PMC REST", "purpose": "预先设定的概念块遗漏检查：去掉物种块，筛查主检索可能漏掉的相关研究", "query": " AND ".join([epmc("plastic"), epmc("pfas"), epmc_date])},
    ],
    "pagination": "主检索取回所有接口报告的记录并核对count；任一查询超过1000条时保留边界，另行登记处理，不假称全取。",
    "screening": {
        "retain": "原始斑马鱼实验，塑料为微/纳颗粒且与明确PFAS共同暴露；题名摘要足以识别组合。",
        "exclude": ["非原始研究/综述", "无斑马鱼实验", "无塑料共暴露", "无范围内PFAS", "非微/纳颗粒", "超出日期"],
        "uncertain": "摘要缺失、混合模型或处理组描述不足时保留待全文核实，不按缺失内容猜测排除。",
        "unit": "文献记录，不等于独立实验；DOI优先去重，PMID/题名辅助，版本关联单列。",
        "second_review": "第二AI在未见第一轮决定的情况下筛选同一记录，保留分歧和裁决；不是独立人类领域复核。",
    },
    "validation": [
        "独立综述派生基准：另一代理不读取旧10篇或新检索集；主检索冻结后再比对；不是严格外部盲法或全领域分母。",
        "旧10篇已知论文回归检查，与独立基准分开报告。",
        "去掉物种块的扩展检索：检查是否出现主检索漏检；原始与修订查询成绩分开。",
        "对原始主检索保留项做一轮前后向引文追踪，记录可访问分母、返回上限和新增研究；复核发现不得回填为原检索命中。",
        "对排除和待定项进行第二次独立AI筛选，记录误排、分歧及处理。",
        "按已知元数据检查年份/期刊/方法分布；集中分布仅为提示，不是文献缺失证据。",
    ],
    "stopping": "完成冻结查询的可取得结果、独立基准比对、一轮引文追踪和筛选复查后停止本轮测试；不按获得10篇停止，不宣称检索穷尽。",
    "access": "匿名公开接口和公开页面；不创建账号、不使用私人凭据、不绕过全文访问限制。",
}
raw = (json.dumps(plan, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
target.write_bytes(raw)
receipt = {"sha256": hashlib.sha256(raw).hexdigest(), "frozen_at": plan["frozen_at"], "file": "query-plan.json", "boundary": "Local prospective plan, not external preregistration."}
(OUT / "query-plan-receipt.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
print(json.dumps(receipt))
