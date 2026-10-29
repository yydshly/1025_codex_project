**独立综述派生检索基准｜2026-10-29**

本轮从独立综述及其参考文献清单自然形成 **5 篇**合格原始研究，不预设篇数。范围为2015-01-01至2026-10-29、斑马鱼（Danio rerio）实验、微/纳塑料与至少一种PFAS共暴露。含额外污染物的混合实验允许纳入并标注。这里的基准只服务于冻结检索结果的找回测试，不是领域全部合格论文的分母。

我没有读取现有 papers.json、search-log.json、网页data、主代理新主题检索结果或任何现成10篇清单。候选先由综述正文/参考清单给出，再回查原始题录与摘要。出版社存储的Crossref参考清单属于实际取得的参考文献证据；不能据此声称读过未取得的综述全文。

| ID | 原始研究题名 | 年份；标识符 | 独立来源与定位 |
|---|---|---|---|
| B01 | Polystyrene microplastics decrease F-53B bioaccumulation but induce inflammatory stress in larval zebrafish | 2020；[DOI](https://doi.org/10.1016/j.chemosphere.2020.127040)；[PMID 32416398](https://pubmed.ncbi.nlm.nih.gov/32416398/) | R01的第5节及参考[131]；R08 bb0725、R09 bib0105参考记录交叉支持 |
| B02 | Sorption of PFOS onto polystyrene microplastics potentiates synergistic toxic effects during zebrafish embryogenesis and neurodevelopment | 2024；[DOI](https://doi.org/10.1016/j.chemosphere.2024.143462)；[PMID 39368493](https://pubmed.ncbi.nlm.nih.gov/39368493/) | R04参考CR11及两个水生生物机制段落；R10 bib47、R11 e_1_3_7_37_1 |
| B03 | Exacerbated interfacial impacts of nanoplastics and 6:2 chlorinated polyfluorinated ether sulfonate by natural organic matter in adult zebrafish: Evidence through histopathology, gut microbiota, and transcriptomic analysis | 2024；[DOI](https://doi.org/10.1016/j.jhazmat.2024.135038)；[PMID 38941840](https://pubmed.ncbi.nlm.nih.gov/38941840/) | R04参考CR14；正文明确成鱼NPs/F-53B、有无天然有机质条件 |
| B04 | Combined exposure with microplastics increases the toxic effects of PFOS and its alternative F-53B in adult zebrafish | 2024；[DOI](https://doi.org/10.1016/j.scitotenv.2024.170948)；[PMID 38365036](https://pubmed.ncbi.nlm.nih.gov/38365036/) | R07实际返回的出版社索引段落[15]与Crossref ref_15；R10 bib56、R11 e_1_3_7_43_1 |
| B05 | Combined effects of microplastics and chemical contaminants on the organ toxicity of zebrafish (Danio rerio) | 2018；[DOI](https://doi.org/10.1016/j.envres.2017.12.019)；[PMID 29306661](https://pubmed.ncbi.nlm.nih.gov/29306661/) | R07 Crossref ref_114；R09 bib0077。原始出版社方法片段列出PFOA/PFNA/PFOSA/PFOS |

B01是幼鱼PS-MPs/F-53B共暴露，B02是胚胎/幼体PS-MPs/PFOS共暴露，B03是成鱼PS-NPs/F-53B实验，B04是雌性成鱼MPs与PFOS或F-53B共暴露。B05是饲喂吸附多污染物的LD-PE实验，PFAS与PCB/BFR/甲基汞同时存在；它满足本次暴露范围，但不能当作PFAS与塑料的二元特异效应研究。上述表格题名仅用于识别，不把题名中的毒性判断当成本次独立结论。

关键来源可复核：

- R01：[2022 Dai等综述，出版社全文及参考[131]](https://journal.hep.com.cn/fese/EN/10.1007/s11783-022-1571-2)。
- R04：[2026 Soares等综述，出版社页面](https://link.springer.com/article/10.1007/s10653-026-03419-x)及[Europe PMC原始XML（CR11/CR14）](https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13526050/fullTextXML)。
- R07：[2026 Brenckman等综述的出版社存储参考清单](https://api.crossref.org/works/10.3390/environments13010038)。完整出版社页面/XML/PDF遭403/429；只声称读过搜索返回的具体段落和此清单。
- R08：[2024 Yu等综述参考清单](https://api.crossref.org/works/10.1016/j.scitotenv.2024.175000)；R09：[2025综述参考清单](https://api.crossref.org/works/10.1016/j.hazadv.2025.100621)；R10：[2025 Jin等综述参考清单](https://api.crossref.org/works/10.1016/j.jhazmat.2025.140044)。
- R11：[2026系统综述/荟萃分析的参考清单](https://api.crossref.org/works/10.1080/10408444.2026.2686292)。实际取得112个DOI记录并逐一查元数据；重试后110个可解析，2个存储DOI仍404，未擅自修正。参考数组位置与键中的数字不一致，JSON保留原键，未把键内数字冒充印刷参考编号。

也检查了未贡献合格项目的综述。2025鱼类纳塑料系统综述的相关F-53B条目是Hainan medaka；2025 MP–PFAS Nexus综述未给出明确合格斑马鱼参考；2026卵巢毒性综述[194]的PFBA与PS纳塑料原始摘要明确是**大鼠**，故排除。另排除了跳虫PFAS/塑料混合研究、无斑马鱼暴露的吸附实验及不含PFAS的斑马鱼塑料实验。详细排除记录、13项来源的实际可读程度、全部搜索/访问和失败原因均在benchmark.json；未取得的综述参考没有冒充已读。

本轮记录15次web工具调用、24条实际查询、26个open请求和4个find请求，另保留135个Python HTTP请求记录（含重试、重复来源清单请求和失败）。搜索结果中返回的URL只是结果记录，不代表都另行打开。没有保存全文或整段摘要，只保存题录、定位和短转述。工具按批并行，未采集每个请求的精确时间戳。

方法边界需要保留：来源挑选是自适应的，没有预注册；综述发现检索偶然也返回了原始论文，只有后续取得明确综述引用链的论文才纳入。早期进度消息曾向主代理透露B01身份，之后才接到隐藏候选身份的要求，因此不能称严格盲法。主代理另行报告其主题检索计划已于2026-10-29T05:06:25Z冻结，SHA256为c8ee855cabc2e8193295d588c939848364d2f2dc3f2e060ddf27841d094252d4；我未打开该计划或检索输出。

基准受综述引用和检索截止时间、可访问性、参考题名筛查的影响，尤其不能据此断言2025–2026年没有合格论文。应报告“找回本独立综述派生基准的x/5”，并单独列漏检；即使5/5找回，也不能证明已找全领域。召回比对由主代理在主题检索完成后执行，本文件未执行比对、未汇总毒性结论。

