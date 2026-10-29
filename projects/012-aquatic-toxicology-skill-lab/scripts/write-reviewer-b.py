"""Save the second AI's actual per-record reading decisions, not a classifier.

The numbered judgments below were supplied after reading every selected title
and abstract. The code only joins them to the reproducibly sampled source rows.
It does not read reviewer A, the benchmark, or automatically infer eligibility.
"""
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "research/retrieval-trial/screening"
sample_bytes = (OUT / "reviewer-b-sample.json").read_bytes()
sample = json.loads(sample_bytes)

# n: (decision, reason, evidence location within the visible source)
judgments = {
1: ("exclude", "原始实验对象为GIFT罗非鱼Oreochromis niloticus，非斑马鱼。", "title; abstract研究对象与急慢性暴露设计"),
2: ("exclude", "研究对象为黑鲪Sebastes schlegelii，非斑马鱼。", "title; abstract行为试验对象"),
3: ("retain", "成年斑马鱼PE微/纳塑料与PFOA共同暴露实验可识别；与MED40795757为同题重复候选，不能另计独立研究。", "title; abstract AMS暴露设计与联合处理"),
4: ("exclude", "Iowa河流多介质现场污染调查，未描述斑马鱼共同暴露实验。", "abstract州域采样、15站点与环境检出"),
5: ("exclude", "开发PEG-PFPE非离子含氟表面活性剂并用于斑马鱼机械测量，不是微/纳塑料与PFAS共同暴露实验。", "abstract材料合成、油水界面与mechanical force用途"),
6: ("exclude", "Passaic河鱼和蟹的污染物调查；PE用于被动采样器，不是斑马鱼塑料共暴露处理。", "abstract样品及low-density polyethylene passive samplers"),
7: ("exclude", "题录明确为Review，摘要汇总多种食品污染研究，无本篇斑马鱼共暴露原始实验。", "pubType=Review; abstract多类研究综述"),
8: ("exclude", "Lake Victoria四种商业鱼采样调查，物种与设计均不属于斑马鱼共暴露实验。", "abstract95份鱼样、四物种与微塑料检测"),
9: ("retain", "摘要明确斑马鱼仔鱼中PET微/纳塑料与PFOA的联合暴露及处理浓度。", "abstract研究设计与PET-MNP/PFOA处理"),
10: ("exclude", "PFOS与PE微塑料的吸附/解吸理化实验；使用模拟鱼肠液而非斑马鱼实验。", "abstract sorption kinetics与artificial gut fluid"),
11: ("exclude", "题录与摘要均明确为综述，非原始斑马鱼共暴露实验。", "pubType=Review; abstract综述目的"),
12: ("exclude", "会议专题编者按，非一项可纳入的原始共暴露实验。", "pubType=Editorial; abstract PRIMO会议与专题介绍"),
13: ("retain", "成年斑马鱼在微宇宙系统中接受PE微/纳塑料与PFOA共暴露，符合题名摘要筛选范围。", "abstract AMS处理设计与adult zebrafish"),
14: ("exclude", "TaOx/PFC-PEG纳米液滴用于小鼠肿瘤放疗，不是斑马鱼塑料-PFAS毒理共暴露。", "abstract mouse tumor model与RT sensitizer设计"),
15: ("exclude", "PS纳米颗粒-PFOA联合摄取实验对象为太平洋牡蛎Magallana gigas。", "abstract juvenile Pacific oysters暴露模型"),
16: ("exclude", "鱼类多世代影响综述，未报告本篇原始斑马鱼共同暴露实验。", "pubType=Review; abstract review范围"),
17: ("exclude", "PFOA与纳塑料联合处理对象为中华绒螯蟹Eriocheir sinensis。", "abstract28天应激试验研究模型"),
18: ("retain", "斑马鱼仔鱼分别及联合暴露于F-53B和PS微塑料7天，目标组合明确。", "abstract6 dpf仔鱼、F-53B/PS-MPs/mixture三类处理"),
19: ("retain", "摘要明确用斑马鱼胚胎和仔鱼研究PS微塑料与PFOS共同暴露。", "abstract embryo与larval combined exposure设计"),
20: ("exclude", "儿童医疗塑料污染的行动倡议与管理讨论，没有原始斑马鱼共暴露实验。", "title Call to action; abstract临床减塑策略"),
21: ("exclude", "食品污染物叙述性综述，非原始实验。", "pubType=Review; abstract narrative review范围"),
22: ("exclude", "PS微塑料-PFBS联合暴露研究对象为小鼠肝脏。", "title; abstract mouse liver处理设计"),
23: ("retain", "摘要明确包含斑马鱼仔鱼的PFOA/PFBA与纳塑料联合暴露研究；并有细胞模型。救援实验的鱼/细胞归属仍待全文，不能据此断言整鱼机制。", "abstract model systems与alone/in combination with NPs设计"),
24: ("exclude", "洗涤剂塑料制造厂空气排放与风险调查，无斑马鱼实验。", "abstract53个工厂点位和空气颗粒测量"),
25: ("exclude", "HDPE土工膜穿孔下PFAS渗透、吸附及有限元力学研究，无鱼类共同暴露。", "abstract geomembrane实验目标与FEM"),
26: ("exclude", "黑鲪Sebastes schlegelii的共暴露行为实验，不是斑马鱼。", "title; abstract物种"),
27: ("exclude", "PP纳塑料-PFAS吸附的分子计算，未开展斑马鱼暴露。", "abstract computational procedure与分子力学/DFT"),
28: ("exclude", "PFAS-微纳塑料多世代实验对象为海水轮虫Brachionus plicatilis。", "title; abstract marine rotifer实验设计"),
29: ("exclude", "塑料杯-酒精浸出物毒性实验对象为雄性大鼠，不是斑马鱼共暴露。", "abstract male rats与oral gavage"),
30: ("exclude", "全球海鱼产卵性状与污染观测整合建模，没有斑马鱼控制共暴露实验。", "abstract6327观测、992物种与全球整合设计"),
31: ("retain", "摘要明确斑马鱼PE微/纳塑料与PFOA共暴露，以及单独与联合处理。", "abstract targeted zebrafish organs与combined exposure groups"),
32: ("exclude", "PS纳塑料-PFOA联合暴露对象为食蚊鱼Gambusia affinis。", "title; abstract freshwater fish model"),
33: ("exclude", "PE微塑料-PFOS喂食试验对象为欧洲海鲈Dicentrarchus labrax。", "abstract物种与experimental diets"),
34: ("retain", "斑马鱼PS微塑料与PFOA单独和共同暴露28天，目标实验可识别。", "abstract individual and combined toxicity设计"),
35: ("uncertain", "摘要同时包含斑马鱼/海水青鳉以及多种预吸附污染物，需全文逐臂确认斑马鱼与PFOS-微塑料对应；保留待核，不能误排。", "abstract two species与PFOS/BP3/BaP多组处理，但未逐鱼种对应PFOS臂"),
36: ("exclude", "聚合物腕带监测60名研究生的PFAS个人暴露，不是斑马鱼塑料共同暴露。", "abstract60 postgraduates与HDPE/TPU wristbands"),
37: ("exclude", "PS微塑料-PFOA共同暴露对象为微藻Chlorella sorokiniana。", "abstract microalgae试验模型"),
38: ("exclude", "南海14种海鱼污染物出现与相关性调查，非斑马鱼控制共暴露实验。", "abstract occurrence调查与14 marine fish species"),
39: ("exclude", "联合暴露原始实验对象为中华绒螯蟹Eriocheir sinensis。", "title; abstract物种"),
40: ("exclude", "PET纳塑料-6:2 FTSA联合暴露为凤眼莲植物毒理研究。", "abstract Eichhornia crassipes与叶片响应"),
41: ("exclude", "杂合微塑料-PFAS联合研究对象为凤眼莲，不是斑马鱼。", "abstract floating macrophyte试验模型"),
42: ("retain", "斑马鱼PFOA单独或与不同尺寸PS颗粒共同暴露，符合范围。", "abstract zebrafish were exposed to PFOA alone or with PS设计"),
43: ("exclude", "土壤中弹尾虫Folsomia candida的混合物实验，非斑马鱼。", "abstract reproduction assay物种与Lufa soil"),
44: ("exclude", "PE颗粒吸附物的细菌和牡蛎胚胎毒性测试，没有斑马鱼模型。", "abstract Aliivibrio fischeri与Pacific oyster embryos"),
45: ("exclude", "纳塑料-PFOA/PFOS联合暴露对象为秀丽隐杆线虫Caenorhabditis elegans。", "abstract实验对象与多世代设计"),
46: ("exclude", "塑料-PFOS联合暴露为海水青鳉Oryzias melastigma实验，非斑马鱼。", "abstract embryos/larvae物种"),
47: ("exclude", "多种微塑料的污染物吸附理化研究，没有斑马鱼暴露。", "abstract20种微塑料与kaolin吸附比较"),
48: ("exclude", "环境样本库与Green Deal相关监测证据综述，非目标原始实验。", "pubType=Review; abstract review设计"),
49: ("exclude", "PS纳塑料-F-53B联合暴露对象为海南青鳉Oryzias curvinotus。", "abstract emerging freshwater fish model物种"),
50: ("retain", "成年雌性斑马鱼接受PFOS/F-53B与微塑料单独或组合处理14天，符合共暴露范围。", "abstract adult female zebrafish exposure design"),
51: ("retain", "斑马鱼胚胎中8 μm PE微塑料与PFOS分别及联合处理72小时，符合范围。", "abstract研究设计与combined exposures组"),
52: ("exclude", "凤眼莲微宇宙中PFAS-微塑料共污染对DOM的研究，无斑马鱼实验。", "abstract greenhouse实验与Eichhornia crassipes来源"),
53: ("retain", "修复后的完整摘要明确斑马鱼/胚胎中纳塑料-F-53B共暴露，并比较HA/BSA生态冠条件。", "repaired abstract7天斑马鱼设计与NFB/NFH/NFHB联合组"),
54: ("exclude", "Lake Victoria污染鱼健康风险系统综述，非原始斑马鱼实验。", "pubType=Systematic Review; abstract25年研究综合"),
55: ("exclude", "LIBS/LA-ICP-MS微塑料分析成像方法，无斑马鱼共暴露实验。", "abstract polymer identification与金属定量方法"),
56: ("exclude", "饮水PFAS离子交换树脂去除与再生实验，聚合物是处理介质。", "abstract IX resins treatment设计"),
57: ("exclude", "聚电解质纳滤膜PFAS去除的材料/水处理研究，非目标动物实验。", "abstract LBL NF membrane设计"),
58: ("retain", "斑马鱼胚胎和仔鱼的纳塑料-PFOS联合暴露实验，题名摘要明确。", "abstract life stages与NPs-PFOS TK-TD设计"),
59: ("exclude", "聚合物交联剂发展的Account，未报告目标斑马鱼共同暴露。", "abstract材料开发回顾与应用列表"),
60: ("exclude", "十年海洋老化塑料表面污染物和细菌指纹研究，没有斑马鱼暴露试验。", "abstract plastic sleeves、PIOM与环境采样"),
61: ("exclude", "受污染地下水暴露研究对象为黑头呆鱼和淡水贻贝；PE管为被动采样器，非斑马鱼塑料共暴露。", "abstract fathead minnows/mussels与PETS设计"),
62: ("exclude", "氟化微塑料光化学转化研究，没有斑马鱼实验；题录另标为Retracted Publication，仅记录该标记。", "abstract UV-A/H2O2理化过程; pubType撤稿标记"),
63: ("exclude", "sPS凝胶从水中去除PFOA的吸附研究，不是微/纳塑料斑马鱼共同暴露。", "abstract sPS wet gel吸附实验"),
64: ("exclude", "发光聚合物合成及HeLa细胞成像，非斑马鱼塑料-PFAS共同暴露。", "abstract材料合成与living HeLa cell应用"),
65: ("exclude", "纳塑料-F-53B实验对象为水生昆虫Chironomus kiinensis幼虫。", "abstract aquatic insect物种与处理"),
66: ("exclude", "可回收纸涂层材料研发，无目标斑马鱼共暴露。", "abstract CPLA/CPBAT纸涂层测试"),
67: ("exclude", "等离子体处理表面对水滴带电的物理研究，没有动物毒理实验。", "abstract slide electrification与表面处理设计"),
68: ("exclude", "Iowa农业河流多介质现场监测，没有斑马鱼共暴露实验；与AGR同题记录重复候选。", "abstract15站点采样设计"),
69: ("exclude", "明确为47项实验的系统综述/元分析，不是本篇原始斑马鱼共暴露实验。", "pubType=Meta-Analysis/Systematic Review; abstract综合设计"),
70: ("exclude", "污染与野生动物病毒感染的系统综述，非本篇原始共暴露实验。", "pubType=Review; abstract检索与162研究综合"),
71: ("exclude", "GenX-纳塑料联合暴露对象为斑点海鳟Cynoscion nebulosus，非斑马鱼。", "abstract adult spotted seatrout四处理组"),
72: ("exclude", "PFOB纳米囊超声造影剂及肿瘤靶向研发，非目标斑马鱼实验。", "abstract PLGA/PEG纳米囊与tumor targeting用途"),
73: ("exclude", "石墨烯纤维素传感器综述，非原始斑马鱼共暴露研究。", "pubType=Review; abstract review范围"),
74: ("exclude", "污泥土地应用健康风险范围综述，非原始斑马鱼共同暴露实验。", "pubType=Scoping Review; abstract方法"),
75: ("exclude", "预印本摘要自称PFAS综合综述，无原始斑马鱼共暴露实验；不按新实验计数。", "abstract This review介绍与证据综述范围"),
76: ("exclude", "预印本为水产食品污染风险叙述，不含本篇斑马鱼控制共同暴露实验。", "abstract营养、污染与治理讨论"),
77: ("exclude", "食品包装PFAS风险矩阵开发，无斑马鱼实验。", "abstract material-based risk matrix方法"),
78: ("exclude", "Texas/New Mexico环境暴露文献计量与文本挖掘，非动物暴露实验。", "abstract4936记录检索与191研究文献计量设计"),
79: ("exclude", "污水处理与移动遗传元件的minireview，非原始目标实验。", "pubType=Review; abstract minireview范围"),
80: ("exclude", "MPs/PFAS泌尿系统健康综述，非本篇原始斑马鱼共同暴露实验。", "pubType=Review; abstract review范围"),
81: ("exclude", "内分泌干扰物轮虫繁殖毒性综述，非目标原始研究。", "pubType=Review; abstract PRISMA review范围"),
82: ("exclude", "PFAS全球影响及治理综述，非原始斑马鱼共暴露实验。", "pubType=Review; abstract review范围"),
83: ("exclude", "水产食品污染风险与治理综述，非原始斑马鱼共同暴露研究。", "pubType=Review; abstract review定位"),
84: ("exclude", "人类生殖中EDC与新污染物机制综述，非目标原始斑马鱼实验。", "pubType=Review; abstract review三项贡献"),
85: ("exclude", "水生动物繁殖毒性叙述性综述，非本篇原始实验。", "pubType=Review; abstract narrative review方法"),
86: ("exclude", "细菌纤维素/聚合物复合材料研发，未描述目标动物共暴露。", "abstract BC/AESO复合材料制备和机械性能"),
87: ("exclude", "MP-PFAS Nexus综述，非原始斑马鱼共同暴露实验。", "pubType=Review; abstract review范围"),
88: ("exclude", "PFAS与其他污染物在水生生物中的混合毒性综述，非本篇原始共暴露研究。", "pubType=Review; abstract reviewed current literature"),
89: ("exclude", "水样31种PFAS的UPLC-MS/MS分析方法，PP为过滤膜，没有斑马鱼共暴露实验。", "abstract水样分析、direct injection与membrane过滤"),
}
assert set(judgments) == {r["reviewer_b_number"] for r in sample["records"]}
decisions = []
for record in sample["records"]:
    n = record["reviewer_b_number"]
    decision, reason, locator = judgments[n]
    decisions.append({"id": record["id"], "aliases": record["aliases"], "review_key": record["review_key"],
                      "reviewer_b_number": n, "doi": record.get("doi"), "pmid": record.get("pmid"),
                      "title": record["title"], "queryIds": record["queryIds"], "selection": record["selection"],
                      "decision": decision, "reason": reason, "evidence_locator": locator,
                      "evidence_url": record["url"], "readScope": "title_and_returned_abstract",
                      "abstract_characters": len(record["abstract"]),
                      "abstract_sha256": hashlib.sha256(record["abstract"].encode("utf-8")).hexdigest(),
                      "assessment": "AI reviewer B read the selected title and entire returned abstract; no first-review decision or benchmark was read."})
duplicate_candidates = [
    {"ids": ["EPMC:AGR:IND609281060", "EPMC:MED:40795757"], "basis": "Normalized title and abstract agree; one publication, not independent experimental replication."},
    {"ids": ["EPMC:AGR:IND609246806", "EPMC:MED:40466994"], "basis": "Normalized title and abstract agree; both outside organism scope."},
    {"ids": ["EPMC:AGR:IND609294551", "EPMC:MED:40227795"], "basis": "Normalized title and abstract agree; both field monitoring outside scope."},
]
counts = Counter(row["decision"] for row in decisions)
report = {"schema": "retrieval-screening-reviewer-b/1.0", "completed_at": datetime.now(timezone.utc).isoformat(),
          "sampler": sample["sampler"], "sample_file_sha256": hashlib.sha256(sample_bytes).hexdigest(),
          "counts": dict(counts), "decisions": decisions, "duplicate_candidates": duplicate_candidates,
          "preprint_version_note": "Selected preprints 75/76 are non-original narrative material and were excluded on design. Similar published review entries were not counted as new experiments; exact version correspondence was not independently authenticated.",
          "input_quality_finding": "During this review, trial adapter v1's HTML stripping was found to remove text between mathematical comparison signs. All 89 records were reviewed against the repaired normalization; original pages and v1 snapshots remain. See europepmc/normalization-repair.json. This was our new adapter's error, not missing original-paper content.",
          "boundary": "89 source records reviewed, not 580 full-text studies. 18 primary + 31 high-risk extra + 40 random remainder. Same AI family, independently assessed decisions, not human domain experts. Reviewer A and independent benchmark were not read. Retain means potentially eligible at title/abstract level; full-text arms, comparators, and methods remain unverified."}
(OUT / "reviewer-b.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
lines = ["# 第二AI筛选复核（Reviewer B）", "", "独立于第一轮决定阅读所选题名与全部返回摘要；未读取Reviewer A或基准集。", "",
         "## 抽样与分母", "", "Europe PMC 580条加PubMed17条，按DOI/PMID合并仍为580个来源记录。全部主检索18条；物种/胚胎/仔体风险词命中的额外31条；其余531条用seed=20261029抽40条，共89条。", "",
         "这是按风险全查加随机抽样的记录级复核，含尚待题名二次去重的AGR/MED重复候选；不是89项独立实验，更不是580篇全文已审。", "",
         "## 实际决定", "", f"保留{counts['retain']}条，排除{counts['exclude']}条，待定{counts['uncertain']}条。保留中有1对AGR/MED同题记录，不能重复计数。", "",
         "待定：10.1016/j.jhazmat.2021.125626同时包含斑马鱼、青鳉和多种预吸附污染物；摘要未逐一对应斑马鱼PFOS处理，需全文核实，故保留待定。", "",
         "## 输入质量发现", "", report["input_quality_finding"], "",
         "## 局限", "", report["boundary"], "", "逐条决定、短理由、证据位置、source ID、DOI和抽样清单见reviewer-b.json；此时尚未与第一轮决定比较。", ""]
(OUT / "reviewer-b-report.md").write_text("\n".join(lines), encoding="utf-8")
print(json.dumps({"reviewed": len(decisions), "counts": dict(counts), "abstracts_read": sum(bool(d["abstract_characters"]) for d in decisions)}))
