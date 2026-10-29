"""Serialize the AI's item-by-item local title/returned-abstract screening.

This script contains manual eligibility decisions after reading all selected records.
It does not search, infer decisions from keyword rules, or read other reviewers.
The exact input hashes guard the ordinal-to-record mapping.
"""

from collections import Counter
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "research/retrieval-trial/screening"
INITIAL_READ_HASHES = {
    "records.json": "80912b73ee2ab76a78037efd70d7459cbf8475196cd92ff4f324bc9a2464bad7",
    "prescreen.json": "aaecef59a0aa8b4ed303631db2ce6b4751088d1a1f70ae35c40513858b83db8b",
}
EXPECTED = {
    "records.json": "fbb1829e9bd19032f74d1fde1e893672252737923f0d02eb43d0c7f85a4f0cd6",
    "prescreen.json": "9a7811742108548b984d6062a4092361f9296d25b6c78307d5d5db198bc8c5b5",
}
for filename, expected in EXPECTED.items():
    assert sha256((OUT / filename).read_bytes()).hexdigest() == expected, filename
records = json.loads((OUT / "records.json").read_text(encoding="utf-8"))
prescreen = {r["id"]: r for r in json.loads((OUT / "prescreen.json").read_text(encoding="utf-8"))["records"]}
selected = [r for r in records if prescreen[r["id"]]["rule"] in ("PRIORITY_REVIEW", "NO_ABSTRACT")
            and r.get("sources", [r.get("source")]) == ["OpenAlex"]]
priority = [r for r in selected if prescreen[r["id"]]["rule"] == "PRIORITY_REVIEW"]
title_only = [r for r in selected if prescreen[r["id"]]["rule"] == "NO_ABSTRACT"]
assert (len(records), len(priority), len(title_only)) == (984, 76, 167)
assert title_only[139]["id"] == "T92c678ff2" and title_only[140]["id"] == "T5cd1cd126"

# All 76 complete returned abstract fields were read; some are themselves short
# or visibly incomplete returns. Decisions are confined to that visible content.
P = {
1: ("exclude", "可见摘要为欧洲海鲈Dicentrarchus labrax的微塑料与汞试验；物种及联合污染物不符。"),
2: ("exclude", "返回摘要描述斑马鱼PFOS、F-53B和OBS的比较暴露，未描述微/纳塑料处理；当前可见设计不属目标组合。"),
3: ("exclude", "可见摘要研究日本青鳉Oryzias latipes的微塑料摄取/清除，非斑马鱼。"),
4: ("exclude", "可见摘要为斑马鱼18种PFAS混合暴露；列明的处理未包含塑料颗粒。"),
5: ("exclude", "可见摘要为中华绒螯蟹Eriocheir sinensis的扑草净试验，非目标物种及暴露组合。"),
6: ("exclude", "可见摘要为日本青鳉菌群建立研究；斑马鱼仅作比较背景，非目标共暴露实验。"),
7: ("exclude", "可见摘要列明斑马鱼塑料颗粒与石油组分/苯并[a]芘处理；联合污染物为PAHs，非PFAS。"),
8: ("exclude", "返回摘要明确自述为综述，非目标原始实验。"),
9: ("exclude", "可见摘要为贻贝Mytilus galloprovincialis幼体的PFOS与微塑料共暴露，物种不符。"),
10: ("exclude", "可见摘要为斑马鱼PFOS及磺酰胺类前体暴露/菌群实验，列明处理未包含微/纳塑料。"),
11: ("exclude", "可见摘要研究氢氧化铜纳米农药，不能将无机纳米颗粒视作纳塑料，亦未列明PFAS共暴露。"),
12: ("uncertain", "题名与一句返回摘要涉及斑马鱼胚胎、PSNP和PFOS，但未明确组合暴露分组；高度相关待核，不能据短摘要确认共暴露。"),
13: ("exclude", "可见摘要的斑马鱼纳塑料联合暴露物为36种PAHs的沉积物提取物，非PFAS。"),
14: ("exclude", "可见摘要为PFOS、PFHxS、PFOA和PFBA毒代动力学比较；列明设计未包含塑料。"),
15: ("exclude", "可见摘要研究有机磷阻燃剂TPhP的斑马鱼发育暴露，非PFAS与塑料共暴露。"),
16: ("exclude", "可见摘要列明PS纳塑料与防晒剂BMDBM联合暴露，所列共污染物不是PFAS。"),
17: ("exclude", "可见摘要研究六种苯并三唑紫外稳定剂的斑马鱼暴露，非目标PFAS与塑料组合。"),
18: ("exclude", "可见摘要列明PFOS浓度梯度及多组学设计，未列明塑料颗粒共处理。"),
19: ("exclude", "可见摘要为斑马鱼微/纳塑料成像与毒代动力学研究，列明处理仅有塑料颗粒，未见PFAS。"),
20: ("exclude", "可见摘要为PS纳塑料与膳食维生素D干预试验；列明组合不涉及PFAS。"),
21: ("exclude", "可见摘要明确列出PS纳塑料与6PPD-醌联合处理；6PPD-醌不是PFAS。"),
22: ("exclude", "可见摘要为多物种PFAS与升温的水-沉积物试验，列明设计没有微/纳塑料。"),
23: ("exclude", "可见摘要研究PS纳塑料显微注射后的斑马鱼中枢分布，未列明PFAS共处理。"),
24: ("exclude", "可见摘要为紫外稳定剂UV-328暴露，非目标PFAS与塑料共暴露。"),
25: ("exclude", "可见摘要比较20/100 nm PS纳塑料的斑马鱼效应，列明设计没有PFAS共处理。"),
26: ("exclude", "可见摘要为透析后不同表面电荷PS纳塑料的斑马鱼试验，未列明PFAS共处理。"),
27: ("exclude", "返回摘要列明PFOS/PFHxS及ppard拮抗剂GSK3787共处理，未列明塑料；不能将该拮抗剂视作塑料。"),
28: ("exclude", "可见摘要研究三种有机磷酸酯及qAOP，非PFAS与塑料共暴露。"),
29: ("exclude", "可见摘要为溴代阻燃剂HBCD与夜间人工光联合处理，非PFAS与塑料组合。"),
30: ("exclude", "可见摘要为鱼类孵化的神经激素调控原始研究，非污染物共暴露研究。"),
31: ("exclude", "可见摘要明确为PS纳塑料与多氯联苯PCBs联合处理，所列污染物不是PFAS。"),
32: ("exclude", "可见摘要为镉、铅、铜、锌的斑马鱼毒代/毒效模型，非PFAS与塑料组合。"),
33: ("exclude", "可见摘要为grin2B基因敲除与行为研究，非PFAS与塑料共暴露。"),
34: ("exclude", "返回摘要为斑马鱼PFAS毒代模型方法，未描述微/纳塑料共暴露。"),
35: ("exclude", "可见摘要研究微塑料残留的昼夜节律，列明暴露不含PFAS。"),
36: ("exclude", "可见摘要比较微塑料纤维和微珠的斑马鱼成像及动态效应，未列明PFAS共处理。"),
37: ("exclude", "可见摘要为不同表面修饰CdSe/ZnS量子点；量子点不等于纳塑料，亦未列明PFAS组合。"),
38: ("exclude", "可见摘要为杀菌剂苯醚甲环唑的斑马鱼全生命周期暴露，非目标组合。"),
39: ("exclude", "可见摘要为双酚AF的浓度梯度暴露，所列设计未包含塑料颗粒；不满足可见的目标共暴露条件。"),
40: ("exclude", "可见摘要研究日本青鳉的PS纳塑料及探针转运，非斑马鱼。"),
41: ("exclude", "可见摘要为PLA及光老化PLA微塑料的斑马鱼血液分布试验，列明处理未包含PFAS。"),
42: ("exclude", "可见摘要为小鼠胚胎干细胞中的PCL纳塑料与镉量子点试验，非目标物种及污染物。"),
43: ("exclude", "可见摘要为湖白鲑样本DNA降解对测序的影响，非斑马鱼共暴露试验。"),
44: ("exclude", "可见摘要为HFPO-TA、HFPO-TeA和PFOA的斑马鱼蓄积试验，列明处理未包含塑料。"),
45: ("exclude", "可见摘要为PFOS连续多代斑马鱼暴露及毒代模型，列明处理未包含塑料。"),
46: ("exclude", "可见摘要为草地贪夜蛾Spodoptera frugiperda的PE微塑料试验，非斑马鱼。"),
47: ("exclude", "可见摘要列明PFOA/PFOS与益生菌干预，所列共处理不是塑料。"),
48: ("exclude", "可见摘要为孔雀鱼Poecilia reticulata的消防泡沫暴露，非目标物种，也未列明塑料共暴露。"),
49: ("exclude", "可见摘要为不同粒径PS微塑料在斑马鱼中的摄取和肝脏试验，未列明PFAS共处理。"),
50: ("exclude", "可见摘要为不同粒径PS颗粒的斑马鱼肝脏免疫试验，列明设计未包含PFAS。"),
51: ("exclude", "返回摘要明确自述综述并总结多类水生生物，非独立原始共暴露实验。"),
52: ("exclude", "可见摘要为斑马鱼与河鲈的PS微塑料试验；背景提及疏水污染物不能证明实验有PFAS。"),
53: ("exclude", "可见摘要研究鲤鱼Cyprinus carpio的PS微塑料，非斑马鱼。"),
54: ("exclude", "可见摘要明确污染PE微塑料负载的是苯并[a]芘BaP，非PFAS。"),
55: ("exclude", "返回摘要明确为斑马鱼生态毒理模型综述，非原始共暴露实验。"),
56: ("exclude", "可见摘要为1/3 μm PS微塑料的斑马鱼胚胎试验，列明浓度与设计未包含PFAS。"),
57: ("exclude", "可见摘要为6:2 FTSA的急性斑马鱼暴露，列明设计未包含微/纳塑料。"),
58: ("uncertain", "可见摘要明确为斑马鱼PE微塑料与高效氯氟氰菊酯LCT联合处理，但未将LCT界定为PFAS；须按本任务PFAS结构/清单定义核对，不能仅凭农药类别排除。"),
59: ("exclude", "可见摘要研究黄颡鱼Pelteobagrus fulvidraco的微塑料与缺氧，非斑马鱼。"),
60: ("exclude", "可见摘要为大菱鲆Scophthalmus maximus的微塑料观察，非斑马鱼。"),
61: ("exclude", "可见摘要列明斑马鱼PS纳塑料与BDE-47共暴露；溴代阻燃剂不是PFAS。"),
62: ("exclude", "可见摘要为环境微塑料调查并有斑马鱼微塑料试验描述，未列明PFAS共暴露。"),
63: ("exclude", "可见摘要为鲤鱼Cyprinus carpio的三苯基锡及萝卜硫素试验，非目标物种及组合。"),
64: ("exclude", "可见摘要为南亚野鲮Labeo rohita的PLA微塑料饲喂试验，非斑马鱼。"),
65: ("uncertain", "可见摘要为红树林沉积物提取微塑料及微生物降解后的斑马鱼暴露，未指明PFAS或载污化学组成；不能确认目标共暴露。"),
66: ("exclude", "可见摘要明确为PS微塑料与镉交叉组合，联合污染物不是PFAS。"),
67: ("exclude", "可见摘要明确为F-53B与六价铬共暴露，所列共处理不是微/纳塑料。"),
68: ("exclude", "可见摘要为南亚野鲮Labeo rohita的PE试验及细菌降解，非斑马鱼。"),
69: ("retain", "可见摘要明确三种模型物含PFOS，吸附在PE微塑料后用于斑马鱼FET试验；满足题名/摘要级原始共暴露候选条件。"),
70: ("exclude", "返回摘要明确为汇总多项斑马鱼微塑料研究的综述；提及F-53B不构成本条原始实验。"),
71: ("exclude", "返回摘要明确自述为perspective，非原始实验。"),
72: ("retain", "学位论文返回摘要明确斑马鱼胚胎纳聚苯乙烯及PFOS共暴露，保留为原始数据来源候选；须与期刊论文核对实验重叠。"),
73: ("retain", "学位论文返回摘要明确三种模型污染物含PFOS，第二部分将三者负载微塑料用于斑马鱼多个阶段；保留候选并待核期刊版本重叠。"),
74: ("exclude", "完整返回字段为研究人员访谈及新兴污染物新闻叙述，非报告目标斑马鱼原始共暴露试验。"),
75: ("exclude", "返回摘要为人类健康/One Health概述与参考文献，未报告可识别的斑马鱼PFAS与塑料共暴露实验。"),
76: ("exclude", "可见摘要为PEG-PFPE表面活性剂合成及氟碳油液滴在斑马鱼中的力学测量；液滴/表活不能当作微/纳塑料共暴露。"),
}

# Manual title-only decisions: a title that omits PFAS or plastic is insufficient
# to establish absence. Unclear scope remains uncertain, with no full-text claim.
U = {
2:"题名为斑马鱼微塑料试验，未指明PFAS；无摘要，不能确认或排除目标共暴露。",
3:"题名为不同形状微塑料的斑马鱼试验，未指明PFAS；无摘要待核。",
8:"题名为仔斑马鱼PE微塑料试验，未指明PFAS；无摘要待核。",
9:"题名为原生PE碎片的斑马鱼试验，未指明PFAS；原生颗粒不排除另加溶解态污染物的可能，无摘要待核。",
13:"题名为PFOS及替代物的斑马鱼试验，未指明塑料；无摘要待核。",
14:"题名宽泛涉及微塑料来源与威胁，不能确定是否含目标原始实验；无摘要待核。",
15:"题名为F-53B甲状腺研究，物种与微/纳塑料共暴露均不明确；无摘要待核。",
16:"题名为商业/真实PS微塑料的斑马鱼试验，未指明PFAS或载污成分；无摘要待核。",
17:"题名含摇蚊与斑马鱼的原生聚酰胺微塑料，未指明PFAS；多物种题名不足以确定目标组合。",
26:"题名为F-53B在仔斑马鱼中的摄取/清除，未指明塑料；无摘要待核。",
27:"题名为F-53B的斑马鱼免疫研究，未指明塑料；无摘要待核。",
31:"题名为斑马鱼受载污微塑料影响，未指明吸附污染物是否PFAS；无摘要必须待核。",
32:"题名为PFOS的仔斑马鱼单细胞研究，未指明塑料；无摘要待核。",
34:"题名含PFAS与微塑料，但未明确斑马鱼、实验类型及组合分组；无摘要待核。",
37:"题名为dimefluthrin的斑马鱼研究，未指明塑料；化学范围与共暴露信息均需核对，无摘要待核。",
38:"题名为斑马鱼微塑料与轮胎颗粒共暴露，未指明PFAS或颗粒化学组成；无摘要待核。",
41:"题名为斑马鱼胚胎膜与微/纳塑料，未指明PFAS；无摘要待核。",
44:"题名为早期斑马鱼纳塑料研究，未指明PFAS；无摘要待核。",
55:"题名含微塑料载运PFAS的环境归趋，但未明确斑马鱼及原始共暴露实验；无摘要待核。",
65:"题名仅比较纳塑料与天然有机质，不能确定物种、PFAS或原始实验范围；无摘要待核。",
67:"题名为微塑料相关污染物的温度依赖模型，未指明污染物身份及物种；无摘要待核。",
70:"题名为PS微塑料的成体斑马鱼代谢研究，未指明PFAS；无摘要待核。",
74:"题名为PE纳/微塑料的成体斑马鱼研究，未指明PFAS；无摘要待核。",
75:"题名为斑马鱼摄食微塑料行为，未明确PFAS或完整暴露设计；无摘要待核。",
77:"题名为PFAS生物蓄积的理论/实验研究，未明确物种或塑料；无摘要待核。",
78:"题名宽泛涉及鱼类微/纳塑料，无法确定原始实验、斑马鱼或PFAS组合；无摘要待核。",
80:"题名为升温与PS纳塑料的斑马鱼试验，未明确PFAS及完整分组；无摘要待核。",
81:"题名为单一/混合PFAS的斑马鱼试验，未指明塑料；无摘要待核。",
82:"题名为轮胎磨损颗粒的斑马鱼试验，未指明PFAS或颗粒化学组成；无摘要待核。",
85:"题名为斑马鱼肝细胞PFOA暴露，未指明塑料，亦需核实是否符合整体动物实验范围；无摘要待核。",
87:"题名为早期PFOA的斑马鱼研究，未指明塑料；无摘要待核。",
95:"题名为F-53B斑马鱼胚胎研究，未指明塑料；无摘要待核。",
98:"题名为F-53B早期斑马鱼急性研究，未指明塑料；无摘要待核。",
103:"题名为F-53B成体斑马鱼毒代/效应，未指明塑料；无摘要待核。",
109:"题名为纳/微塑料肾脏研究，未明确物种及PFAS；无摘要待核。",
110:"题名为微胶质细胞吞噬PS微塑料，未明确体内物种及PFAS；无摘要待核。",
121:"题名列出PFOS、F-53B及OBS的斑马鱼研究，未指明塑料；无摘要待核。",
124:"题名为鱼类/海产品微纳塑料组学应用，未明确是否原始实验及PFAS组合；无摘要待核。",
125:"题名为HFPO-TA/HFPO-DA/PFOA的斑马鱼研究，未指明塑料；无摘要待核。",
126:"题名为斑马鱼PE微塑料与penthiopyrad联合处理；未明确该含氟农药是否属本任务PFAS定义，不能仅凭农药类别排除，无摘要待核。",
128:"题名为PS微塑料的雌雄斑马鱼比较，未指明PFAS；无摘要待核。",
138:"题名为食品级无纺袋释放微/纳塑料的毒性评估，未明确物种或PFAS；无摘要待核。",
140:"题名为生物基塑料的斑马鱼免疫研究，未指明PFAS；无摘要待核。",
141:"题名高度相关：成年斑马鱼、纳塑料、6:2 Cl-PFESA及天然有机质；无摘要，不能据题名确认实际共暴露分组。",
154:"题名含PFAS与共污染物的联合毒性，未指明塑料、斑马鱼或原始实验类型；无摘要待核。",
155:"题名为UVC老化PS微塑料的斑马鱼研究，未指明PFAS；无摘要待核。",
157:"预印本题名为生物基/石油基塑料的仔斑马鱼比较，未指明PFAS；无摘要待核，并需核对与期刊版本的实验重叠。",
168:"预印本题名高度相关：斑马鱼胚胎、MPs和PFOS；无摘要，不能据题名确认共暴露分组，亦需核对期刊版本。",
}

E = {
1:"题名明确为多地点环境现场测量，非目标斑马鱼共暴露试验。",
4:"题名明确实验物种为红罗非鱼Oreochromis niloticus，非斑马鱼。",
5:"题名明确为海域沉积物微塑料污染调查，非目标动物共暴露试验。",
6:"题名为罐头沙丁鱼/黍鲱微塑料污染，非目标斑马鱼试验。",
7:"题名明确联合污染物为菲phenanthrene，非PFAS。",
10:"题名明确为海水青鳉与菲联合污染，物种/共污染物不符。",
11:"题名明确为厚壳贻贝与兽用抗生素，非目标物种/污染物。",
12:"题名明确为淡水湖微塑料发生分布调查，非目标动物共暴露实验。",
18:"题名明确为纳塑料与多溴联苯醚，所列共污染物非PFAS。",
19:"题名明确研究扑草净prometryn，非PFAS与塑料组合。",
20:"题名明确为PS微塑料与毒死蜱，所列共污染物非PFAS。",
21:"题名明确为海水青鳉Oryzias melastigma的微塑料与菲，物种/污染物不符。",
22:"题名明确为锌与镉暴露，非PFAS与塑料组合。",
23:"题名明确为氯化汞暴露，非PFAS与塑料组合。",
24:"题名明确为铜绿微囊藻暴露，非PFAS与塑料组合。",
25:"题名明确为凡纳滨对虾肠道的脂多糖注射，非目标物种/组合。",
28:"题名明确为小鼠阿特拉津试验，非目标物种/组合。",
29:"题名明确为阿米替林暴露，非PFAS与塑料组合。",
30:"题名明确为鄱阳湖野生鱼的PFOS替代物调查，非目标斑马鱼共暴露试验。",
33:"题名明确为纤维微塑料与十溴二苯乙烷，所列共污染物非PFAS。",
35:"题名明确物种为小鼠，即使含GenX与塑料也不符合斑马鱼范围。",
36:"题名明确物种为海水青鳉，非斑马鱼。",
39:"题名为电子烟蒸汽暴露，非明确PFAS与塑料组合。",
40:"元数据为书籍章节且题名概述环境/生态影响，非目标原始实验报告。",
42:"题名明确为轮虫破碎微塑料，非斑马鱼共暴露试验。",
43:"题名明确为人工湿地氮转化与微生物系统，非斑马鱼共暴露试验。",
45:"题名明确为纳塑料与微囊藻毒素-LR，所列共污染物非PFAS。",
46:"题名明确为人肺/肠细胞，非斑马鱼。",
47:"题名明确为微塑料与双酚类似物，所列共污染物非PFAS。",
48:"题名明确物种为大口黑鲈且共污染物为DEHP，非目标物种/组合。",
49:"题名明确为炊具释放Teflon颗粒的拉曼鉴定，非斑马鱼PFAS与塑料共暴露试验。",
50:"题名明确为藻类的纳塑料与镉，非目标物种/组合。",
51:"题名明确研究银纳米颗粒，无机颗粒不能当作纳塑料，非目标组合。",
52:"题名明确为流域PFAS分布/来源调查，非目标斑马鱼共暴露试验。",
53:"题名明确为PS微塑料与汞，所列共污染物非PFAS。",
54:"题名明确为纳塑料与TDCIPP，所列有机磷阻燃剂非PFAS。",
56:"题名明确研究谷氨酸棒杆菌代谢调控，非斑马鱼共暴露试验。",
57:"题名明确为抗抑郁药文拉法辛，非PFAS与塑料组合。",
58:"题名明确为氧化石墨烯与磷酸三苯酯，非PFAS与塑料组合。",
59:"题名明确为微/纳塑料与TDCIPP，所列有机磷阻燃剂非PFAS。",
60:"题名明确为海水青鳉及双酚A，非目标物种/组合。",
61:"题名明确为PS微塑料与银纳米颗粒，所列共污染物非PFAS。",
62:"题名明确为稀有鮈鲫Gobiocypris rarus且联合汞，非目标物种/组合。",
63:"题名明确为铜锌混合物，非PFAS与塑料组合。",
64:"题名明确为金纳米颗粒，不能当作纳塑料，非目标组合。",
66:"题名明确为TPhP与纳塑料，所列有机磷阻燃剂非PFAS。",
68:"题名明确为矿泉水包装颗粒释放/分析，非斑马鱼共暴露试验。",
69:"题名明确为鲤鱼Cyprinus carpio，非斑马鱼。",
71:"题名明确为邻苯二甲酸二丁酯，非PFAS与塑料组合。",
72:"题名明确为酱油发酵的细菌群落，非目标物种/试验。",
73:"题名明确为氧化铝纳米颗粒及离子，不能当作纳塑料，非目标组合。",
76:"题名明确为微囊藻释放腐殖样物质抵御微塑料，非斑马鱼试验。",
79:"题名明确为PS微塑料与氯氰菊酯，所列共污染物非PFAS。",
83:"题名明确物种为凡纳滨对虾，非斑马鱼。",
84:"题名明确为DON脱氧雪腐镰刀菌烯醇，非PFAS与塑料组合。",
86:"题名明确为重楼药材的斑马鱼/细胞/大鼠比较，非目标PFAS与塑料组合。",
88:"题名明确为南亚野鲮Labeo rohita的三唑磷试验，非目标物种/组合。",
89:"题名明确物种为小鼠，非斑马鱼。",
90:"题名明确物种为小鼠，非斑马鱼。",
91:"题名明确为中华绒螯蟹Eriocheir sinensis，非斑马鱼。",
92:"题名明确为大气输送与偏远地区微塑料沉降，非目标动物共暴露试验。",
93:"题名明确物种为小鼠Mus musculus，非斑马鱼。",
94:"题名明确为水相镉暴露，非PFAS与塑料组合。",
96:"题名明确为双酚S/F/A，非PFAS与塑料组合。",
97:"题名明确为栉孔扇贝及BDE-209，非目标物种/组合。",
99:"题名明确为海洋浮游动物及壬基酚/4-MBC，非目标物种/组合。",
100:"题名明确为三氯卡班，非PFAS与塑料组合。",
101:"题名明确为氯菊酯，非PFAS与塑料组合。",
102:"题名明确物种为淡水藻Scenedesmus obliquus，非斑马鱼。",
104:"题名明确为双酚S，非PFAS与塑料组合。",
105:"题名明确为乙草胺，非PFAS与塑料组合。",
106:"题名明确为LED光条件的斑马鱼免疫研究，所列处理非目标组合。",
107:"题名明确物种为小鼠，非斑马鱼。",
108:"题名明确物种为小鼠，非斑马鱼。",
111:"题名明确物种为小鼠，非斑马鱼。",
112:"题名明确物种为黄颡鱼Pseudobagrus fulvidraco，非斑马鱼。",
113:"题名明确为石油烃在微塑料上的吸脱附，所列污染物非PFAS且非动物共暴露。",
114:"题名明确研究对象为浮游动物，非斑马鱼。",
115:"题名明确为金属氧化物/PAHs与纳塑料，所列共污染物非PFAS。",
116:"题名明确为微塑料与病毒介导的鱼死亡，所列生物胁迫因子非PFAS。",
117:"题名明确为台湾沿海牡蛎微塑料调查，非目标斑马鱼共暴露试验。",
118:"题名明确物种为鸡，非斑马鱼。",
119:"题名明确物种为尼罗罗非鱼，非斑马鱼。",
120:"题名明确为吡虫啉与微塑料，所列共污染物非PFAS。",
122:"题名明确为PE微塑料与土霉素，所列抗生素非PFAS。",
123:"题名明确为新证据与perspective，非可识别的目标原始试验报告。",
127:"题名明确物种为雌性小鼠，非斑马鱼。",
129:"题名明确物种为青鳉，非斑马鱼。",
130:"题名明确物种为空心菜Ipomoea aquatica，非斑马鱼。",
131:"题名明确为废水染料去除膜材料，非目标动物共暴露实验。",
132:"题名明确物种为小鼠，非斑马鱼。",
133:"题名明确物种为小鼠，非斑马鱼。",
134:"题名明确为PET与阿维菌素，所列共污染物非PFAS。",
135:"题名明确为微/纳塑料与双酚的perspective，非目标原始PFAS试验。",
136:"题名明确为多壁碳纳米管与联苯菊酯；碳纳米管不是微/纳塑料，所列材料组合不符。",
137:"题名明确物种为褶皱臂尾轮虫且联合雌二醇，非目标物种/组合。",
139:"题名明确为舒尼替尼/索拉非尼，所列药物非PFAS与塑料组合。",
142:"题名明确为纳塑料的太阳界面蒸发去除方法，非目标动物共暴露实验。",
143:"题名明确为人神经类器官，非斑马鱼。",
144:"题名明确物种为尖吻鲈且共污染物为BaP，非目标物种/组合。",
145:"题名明确物种为黑斑蛙且共污染物为左氧氟沙星，非目标物种/组合。",
146:"题名明确为GIFT罗非鱼，即使纳塑料与F-53B相关也不符合斑马鱼范围。",
147:"题名明确为微塑料与次氯酸钠消毒，所列处理非PFAS。",
148:"题名明确物种为稀有鮈鲫Gobiocypris rarus，非斑马鱼。",
149:"题名明确物种为微藻且共污染物为吡唑醚菌酯/嘧菌酯，非目标物种/组合。",
150:"题名明确物种为镜鲤Cyprinus carpio nudus，非斑马鱼。",
151:"题名明确物种为大鲵Andrias davidianus，非斑马鱼。",
152:"题名明确物种为黄颡鱼Pseudobagrus fulvidraco，非斑马鱼。",
153:"题名明确为禽蛋PFAS发生与风险调查，非目标斑马鱼共暴露试验。",
156:"预印本题名明确为6PPD暴露，该化合物非PFAS，也未列出塑料组合。",
158:"元数据为书籍章节，非目标原始实验报告。",
159:"预印本题名明确为PS微塑料与镉，所列共污染物非PFAS；同题版本不能视作独立实验。",
160:"预印本题名明确物种为黄颡鱼，非斑马鱼。",
161:"预印本题名明确为PS微塑料与镉，所列共污染物非PFAS；同题版本不能视作独立实验。",
162:"预印本题名明确为四溴双酚A与PE微塑料，所列共污染物非PFAS。",
163:"预印本题名明确为PS微塑料与镉，所列共污染物非PFAS；同题版本不能视作独立实验。",
164:"题名明确为离子液体[C8mim]Br与PMMA，所列共污染物非PFAS；多物种模拟生态系统也不能自动归到斑马鱼。",
165:"题名明确为铅铜联合暴露，非PFAS与塑料组合。",
166:"元数据为书籍章节，非目标原始实验报告。",
167:"题名明确为尼罗罗非鱼与铬/PE微塑料，非目标物种/组合。",
}
assert set(P) == set(range(1, 77))
assert not set(U) & set(E)
assert set(U) | set(E) == set(range(1, 169))

version_notes = {
    "T4e6f9f4f2": "学位论文；题名内容与PSNP/PFOS期刊候选相近，仅标记可能重叠，尚未核实实验对应关系。",
    "Tca0275c05": "学位论文；与多实验室载污PE/FET等候选可能存在实验/章节重叠，未据此合并为独立实验。",
    "T472e80f2a": "预印本与10.1016/j.jhazmat.2024.135846题名相近，版本/实验关系未核实。",
    "T2845ff034": "与10.1016/j.aqrep.2026.103526及另外两条同题预印本可能为版本关系。",
    "Ta632e3661": "与10.1016/j.aqrep.2026.103526及另外两条同题预印本可能为版本关系。",
    "Tac5d488a3": "与10.1016/j.aqrep.2026.103526及另外两条同题预印本可能为版本关系。",
    "T47ef37038": "预印本；保留待核，不当作已确认的独立实验或正式发表版本。",
}
output = []
record_positions = {r["id"]: i for i, r in enumerate(records)}
for rule, group, decisions in (("PRIORITY_REVIEW", priority, P), ("NO_ABSTRACT", title_only, None)):
    for ordinal, record in enumerate(group, 1):
        # Original NO_ABSTRACT #141 was subsequently abstract-enriched and now
        # has several sources. Preserve the original manual mapping for the
        # remaining records, and recheck that migrated record separately.
        original_ordinal = ordinal if rule == "PRIORITY_REVIEW" or ordinal < 141 else ordinal + 1
        if rule == "PRIORITY_REVIEW":
            decision, reason = decisions[ordinal]
            scope = "title_and_complete_returned_abstract"
            assert record.get("abstract", "").strip()
            fields = ["title", "abstract", "date", "pubType"]
        else:
            decision, reason = ("uncertain", U[original_ordinal]) if original_ordinal in U else ("exclude", E[original_ordinal])
            scope = "TITLE_ONLY"
            assert not record.get("abstract", "").strip()
            fields = ["title", "date", "pubType"]
        item = {
            "id": record["id"], "doi": record.get("doi"), "title": record["title"],
            "decision": decision, "reason": reason, "readScope": scope,
            "source": "OpenAlex", "sourceIds": record.get("sourceIds", []),
            "evidence_locator": {
                "file": "research/retrieval-trial/screening/records.json",
                "json_pointer": f"/{record_positions[record['id']]}",
                "fields_read": fields,
                "OpenAlex_work": record.get("OAid"),
                "complete_returned_abstract_read": rule == "PRIORITY_REVIEW",
                "returned_abstract_chars": len(record.get("abstract", "")),
            },
            "prescreen_rule": rule, "within_rule_read_ordinal": original_ordinal,
            "record_sha256": sha256(json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
            "abstract_availability_note": "已逐字读取整个返回abstract字段；不代表已读论文全文或源站完整摘要。" if rule == "PRIORITY_REVIEW" else "输入abstract为空，仅题名及基本书目信息；未读摘要或全文。",
        }
        if record["id"] in version_notes:
            item["version_note"] = version_notes[record["id"]]
        output.append(item)

selected_hash = sha256(json.dumps(selected, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
migrated = next(r for r in records if r["id"] == "Tb2ee6eda0")
migrated_recheck = {
    "id": migrated["id"], "doi": migrated["doi"], "decision": "retain",
    "reason": "初读时只有题名，判uncertain；补全后已读完整返回摘要，明确成年斑马鱼21天PS-NPs与F53B组合(ANF)及加NOM组合，满足目标共暴露候选条件。",
    "readScope": "title_and_complete_returned_abstract",
    "source": migrated["sources"], "sourceIds": migrated["sourceIds"],
    "evidence_locator": {"file": "research/retrieval-trial/screening/records.json", "json_pointer": f"/{record_positions[migrated['id']]}", "fields_read": ["title", "abstract", "date", "pubType"], "OpenAlex_work": migrated["OAid"], "returned_abstract_chars": len(migrated["abstract"]), "complete_returned_abstract_read": True},
    "scope_note": "此条已不属于当前only-OpenAlex集合，故单列补充复核，不计入243条当前范围统计。",
}
result = {
    "schema": "retrieval-screening-reviewer-c/1.0",
    "reviewer": "C / OpenAlex-only title-and-returned-abstract screening",
    "completed_at": datetime.now(timezone.utc).isoformat(),
    "eligibility_scope": "2015-01-01至2026-10-29，Danio rerio实验中微/纳塑料与明确PFAS共暴露的原始研究；仅检索筛选，不作毒性判断。",
    "input_hashes": {k: {"sha256": v, "bytes": (OUT / k).stat().st_size} for k,v in EXPECTED.items()},
    "initial_read_input_hashes": INITIAL_READ_HASHES,
    "input_delta_audit": {"initial_total_records": 983, "current_total_records": 984, "initial_selected": 244, "current_selected": 243, "selected_removed_after_source_enrichment": ["Tb2ee6eda0"], "new_unread_selected_records": [], "note": "76条PRIORITY_REVIEW的ID与顺序未变；167条当前NO_ABSTRACT为原168条移除原第141条。"},
    "input_snapshot_total_records": len(records),
    "selected_records_sha256_canonical_json": selected_hash,
    "selection": "完成快照中sources恰为[OpenAlex]，prescreen rule为PRIORITY_REVIEW或NO_ABSTRACT的全部243条；初读244条中1条补源补摘要后已移出，另作补充复核。未参考其他审阅者决定。",
    "counts": {"total": len(output), "by_rule": dict(Counter(x["prescreen_rule"] for x in output)),
               "by_decision": dict(Counter(x["decision"] for x in output)),
               "by_rule_and_decision": {rule: dict(Counter(x["decision"] for x in output if x["prescreen_rule"] == rule)) for rule in ("PRIORITY_REVIEW", "NO_ABSTRACT")}},
    "boundary": "只读本地records.json与prescreen.json中的题录/返回摘要；未检索网络、未读全文、未读取reviewer-a.json/reviewer-b.json或benchmark决定。元数据不足写uncertain，不声称全文缺陷；retain是检索候选，不是毒性结论或独立实验数。",
    "records": output,
    "migrated_record_recheck": migrated_recheck,
}
(OUT / "reviewer-c.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
lines = ["# OpenAlex新增候选定点筛选（审阅者C）", "", "筛选范围为2015-01-01至2026-10-29的斑马鱼微/纳塑料与明确PFAS共暴露原始研究；仅决定检索候选资格，不作毒性判断。", "",
         f"初读快照983条题录，覆盖244条。完成快照共有{len(records)}条题录；当前覆盖来源仅OpenAlex、规则PRIORITY_REVIEW的76条及NO_ABSTRACT的167条，共243条。76条逐条读完整个返回摘要字段；167条均标为TITLE_ONLY，只读题名与基本书目信息。原无摘要第141条补源补摘要后已离开only-OpenAlex集合，另作完整摘要复核。", "",
         "| 规则 | retain | exclude | uncertain |", "|---|---:|---:|---:|"]
for rule in ("PRIORITY_REVIEW", "NO_ABSTRACT"):
    c = result["counts"]["by_rule_and_decision"][rule]
    lines.append(f"| {rule} | {c.get('retain', 0)} | {c.get('exclude', 0)} | {c.get('uncertain', 0)} |")
lines += ["", "保留为题录/摘要级候选：", ""]
for item in output:
    if item["decision"] == "retain":
        lines.append(f"- {item['id']} / {item['doi']}：{item['reason']}")
lines += ["", "高度相关但元数据不足的待核项包括：10.1039/d5en00231a（一句返回摘要，未明确共暴露分组）与10.2139/ssrn.4764265（仅题名）。10.1016/j.jhazmat.2024.135038初读仅题名为uncertain，补全返回摘要后明确存在PS-NPs+F53B组合，补充复核retain；该项来源已扩展，单列migrated_record_recheck，不计入当前243条统计。载污或环境来源塑料未指明PFAS时保留uncertain；题名只出现塑料或PFAS时，未把另一项未提及当作确定不存在。", "",
          "学位论文、预印本与期刊论文均为文献记录；相似题名与内容只用于提醒潜在版本/实验重叠，未把它们算成已核实的独立实验。多物种/多污染物摘要按可见明确组合判断，不自动交叉归因。", "",
          "审阅边界：未做网络补检或全文阅读；未读取reviewer-a.json、reviewer-b.json或benchmark决定，未参考其他审阅者的筛选决定。返回摘要极短、起始截断或语句缺失仅描述输入字段状态，不能称为原论文全文缺陷。全部逐条决定、理由、阅读范围、source ID及JSON证据位置见reviewer-c.json。", "",
          "输入SHA256：", ""]
for filename, digest in EXPECTED.items():
    lines.append(f"- {filename}: `{digest}`")
lines += [f"- 当前243条所选记录的规范JSON: `{selected_hash}`", "", "初读输入SHA256：", ""]
for filename, digest in INITIAL_READ_HASHES.items():
    lines.append(f"- {filename}: `{digest}`")
lines += ["", "完成时已核对新增差额：总题录983→984，only-OpenAlex范围244→243；1条补源后移出，已单列复核；没有新增未读only-OpenAlex项。", ""]
(OUT / "reviewer-c-report.md").write_text("\n".join(lines), encoding="utf-8")
print(json.dumps(result["counts"], ensure_ascii=False))
