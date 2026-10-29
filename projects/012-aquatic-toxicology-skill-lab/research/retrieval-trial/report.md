# 检索单独实测：过程、遗漏与修复

原始主检索只找回独立基准3/5；一跳追踪提高到4/5；修正别名与词根后，原生主题检索找回5/5。合并984个候选题录，保留17、待定51；这些是阅读候选，不是已通过全文评估的独立实验。

第二轮检索试验；采用固定版本bibliography规则，API采集器为本轮新增适配。来源记录、自动初筛、AI复核与全文资格分开。

## 先分清归属

三个主题采集脚本 retrieve-pubmed.py、retrieve-europepmc.py、retrieve-openalex.py 均为本案例新增，不在固定提交原始ZIP中。原库提供流程规范、引文核验客户端及另一套本例未运行的主题发现代码。具体词表、采集器、基准与漏检修复是本轮适配。成绩来自组合方案，不能单独归因原Skill。

详见归属审计：本地项目 research/retrieval-ownership-audit.md，网页下载 retrieval-ownership-audit.md。

原始方案SHA256：`c8ee855cabc2e8193295d588c939848364d2f2dc3f2e060ddf27841d094252d4`。

## 词怎样生成

从研究问题提取物种、塑料、PFAS三个概念块，块内OR、块间AND。
物种加入学名；塑料加入拼写变体与常见聚合物；PFAS加入缩写、替代物和词根。
不要求synergy、toxicity、coexposure、任何毒性方向或终点词，降低结果措辞造成的漏检。
按接口语法转译字段与日期；这是AI制定策略＋本轮脚本转译，不是上游自建数据库。
不按已知论文题名/DOI优化本轮原始主题查询；旧10篇只作回归检查，不当独立基准。

## 实际来源和检索式

### PM-PRIMARY · PubMed E-utilities

日期：2026-10-29T05:07:58.165903+00:00；17/17；success。

```text
(zebrafish[Title/Abstract] OR "Danio rerio"[Title/Abstract]) AND (microplastic*[Title/Abstract] OR nanoplastic*[Title/Abstract] OR "micro plastic*"[Title/Abstract] OR "nano plastic*"[Title/Abstract] OR polystyrene[Title/Abstract] OR polyethylene[Title/Abstract] OR "polyethylene terephthalate"[Title/Abstract] OR polypropylene[Title/Abstract] OR "polyvinyl chloride"[Title/Abstract] OR "polymethyl methacrylate"[Title/Abstract]) AND (PFAS[Title/Abstract] OR PFOS[Title/Abstract] OR PFOA[Title/Abstract] OR PFBA[Title/Abstract] OR PFHxS[Title/Abstract] OR PFBS[Title/Abstract] OR "F-53B"[Title/Abstract] OR "Cl-PFESA"[Title/Abstract] OR perfluoro*[Title/Abstract] OR polyfluoro*[Title/Abstract] OR fluorotelomer*[Title/Abstract]) AND ("2015/01/01"[Date - Publication] : "2026/10/29"[Date - Publication])
```

已取回全部接口命中；不代表已找齐领域文献。日期字段使用Publication Date。

### PM-REPAIRED · PubMed E-utilities

日期：2026-10-29T05:21:14.300479+00:00；19/19；success。

```text
(zebrafish[Title/Abstract] OR "Danio rerio"[Title/Abstract]) AND (microplastic*[Title/Abstract] OR nanoplastic*[Title/Abstract] OR "micro plastic*"[Title/Abstract] OR "nano plastic*"[Title/Abstract] OR polystyrene[Title/Abstract] OR polyethylene[Title/Abstract] OR "polyethylene terephthalate"[Title/Abstract] OR polypropylene[Title/Abstract] OR "polyvinyl chloride"[Title/Abstract] OR "polymethyl methacrylate"[Title/Abstract]) AND (PFAS[Title/Abstract] OR PFOS[Title/Abstract] OR PFOA[Title/Abstract] OR PFBA[Title/Abstract] OR PFNA[Title/Abstract] OR PFOSA[Title/Abstract] OR PFHxS[Title/Abstract] OR PFBS[Title/Abstract] OR "F-53B"[Title/Abstract] OR F53B[Title/Abstract] OR "Cl-PFESA"[Title/Abstract] OR "Cl-PFAES"[Title/Abstract] OR PFC[Title/Abstract] OR PFCs[Title/Abstract] OR perfluor*[Title/Abstract] OR polyfluor*[Title/Abstract] OR fluorotelomer*[Title/Abstract]) AND ("2015/01/01"[Date - Publication] : "2026/10/29"[Date - Publication])
```

已取回全部接口命中；不代表已找齐领域文献。日期字段使用Publication Date。

### EPMC-PRIMARY · Europe PMC REST

日期：2026-10-29T05:07:29.189422+00:00；18/18；完整取回。

```text
(TITLE_ABS:zebrafish OR TITLE_ABS:"Danio rerio") AND (TITLE_ABS:microplastic* OR TITLE_ABS:nanoplastic* OR TITLE_ABS:"micro plastic*" OR TITLE_ABS:"nano plastic*" OR TITLE_ABS:polystyrene OR TITLE_ABS:polyethylene OR TITLE_ABS:"polyethylene terephthalate" OR TITLE_ABS:polypropylene OR TITLE_ABS:"polyvinyl chloride" OR TITLE_ABS:"polymethyl methacrylate") AND (TITLE_ABS:PFAS OR TITLE_ABS:PFOS OR TITLE_ABS:PFOA OR TITLE_ABS:PFBA OR TITLE_ABS:PFHxS OR TITLE_ABS:PFBS OR TITLE_ABS:"F-53B" OR TITLE_ABS:"Cl-PFESA" OR TITLE_ABS:perfluoro* OR TITLE_ABS:polyfluoro* OR TITLE_ABS:fluorotelomer*) AND FIRST_PDATE:[2015-01-01 TO 2026-10-29]
```

与PubMed大量重叠，不能当独立复制；日期字段为First Publication Date。重试事件见下载回执。

### EPMC-NO-ORGANISM · Europe PMC REST

日期：2026-10-29T05:07:29.189422+00:00；580/580；完整取回。

```text
(TITLE_ABS:microplastic* OR TITLE_ABS:nanoplastic* OR TITLE_ABS:"micro plastic*" OR TITLE_ABS:"nano plastic*" OR TITLE_ABS:polystyrene OR TITLE_ABS:polyethylene OR TITLE_ABS:"polyethylene terephthalate" OR TITLE_ABS:polypropylene OR TITLE_ABS:"polyvinyl chloride" OR TITLE_ABS:"polymethyl methacrylate") AND (TITLE_ABS:PFAS OR TITLE_ABS:PFOS OR TITLE_ABS:PFOA OR TITLE_ABS:PFBA OR TITLE_ABS:PFHxS OR TITLE_ABS:PFBS OR TITLE_ABS:"F-53B" OR TITLE_ABS:"Cl-PFESA" OR TITLE_ABS:perfluoro* OR TITLE_ABS:polyfluoro* OR TITLE_ABS:fluorotelomer*) AND FIRST_PDATE:[2015-01-01 TO 2026-10-29]
```

与PubMed大量重叠，不能当独立复制；日期字段为First Publication Date。重试事件见下载回执。

### EPMC-REPAIRED · Europe PMC REST

日期：2026-10-29T05:22:16.590129+00:00；20/20；完整取回。

```text
(TITLE_ABS:zebrafish OR TITLE_ABS:"Danio rerio") AND (TITLE_ABS:microplastic* OR TITLE_ABS:nanoplastic* OR TITLE_ABS:"micro plastic*" OR TITLE_ABS:"nano plastic*" OR TITLE_ABS:polystyrene OR TITLE_ABS:polyethylene OR TITLE_ABS:"polyethylene terephthalate" OR TITLE_ABS:polypropylene OR TITLE_ABS:"polyvinyl chloride" OR TITLE_ABS:"polymethyl methacrylate") AND (TITLE_ABS:PFAS OR TITLE_ABS:PFOS OR TITLE_ABS:PFOA OR TITLE_ABS:PFBA OR TITLE_ABS:PFNA OR TITLE_ABS:PFOSA OR TITLE_ABS:PFHxS OR TITLE_ABS:PFBS OR TITLE_ABS:"F-53B" OR TITLE_ABS:F53B OR TITLE_ABS:"Cl-PFESA" OR TITLE_ABS:"Cl-PFAES" OR TITLE_ABS:PFC OR TITLE_ABS:PFCs OR TITLE_ABS:perfluor* OR TITLE_ABS:polyfluor* OR TITLE_ABS:fluorotelomer*) AND FIRST_PDATE:[2015-01-01 TO 2026-10-29]
```

与PubMed大量重叠，不能当独立复制；日期字段为First Publication Date。重试事件见下载回执。

### OA-SUPPLEMENT · OpenAlex works

日期：2026-10-29T05:13:17.856581+00:00；0/未知；HTTP400；保留失败。

```text
(zebrafish OR "Danio rerio") AND (microplastic* OR nanoplastic* OR "micro plastic*" OR "nano plastic*" OR polystyrene OR polyethylene OR "polyethylene terephthalate" OR polypropylene OR "polyvinyl chloride" OR "polymethyl methacrylate") AND (PFAS OR PFOS OR PFOA OR PFBA OR PFHxS OR PFBS OR "F-53B" OR "Cl-PFESA" OR perfluoro* OR polyfluoro* OR fluorotelomer*)
```

V1被接口拒绝带空格的通配短语；V2在独立登记后展开单复数，返回32条。搜索记录不等于阅读全文。

### OA-SUPPLEMENT-V2 · OpenAlex works

日期：2026-10-29T05:17:28.153323+00:00；32/32；完整取回。

```text
(zebrafish OR "Danio rerio") AND (microplastic* OR nanoplastic* OR ("micro plastic" OR "micro plastics") OR ("nano plastic" OR "nano plastics") OR polystyrene OR polyethylene OR "polyethylene terephthalate" OR polypropylene OR "polyvinyl chloride" OR "polymethyl methacrylate") AND (PFAS OR PFOS OR PFOA OR PFBA OR PFHxS OR PFBS OR "F-53B" OR "Cl-PFESA" OR perfluoro* OR polyfluoro* OR fluorotelomer*)
```

V1被接口拒绝带空格的通配短语；V2在独立登记后展开单复数，返回32条。搜索记录不等于阅读全文。

## 筛选怎么进行

合并984条；初始机械规则：{'TYPE': 231, 'PRIORITY_REVIEW': 115, 'NO_ORGANISM_SIGNAL': 442, 'DATE': 29, 'NO_ABSTRACT': 167}。主代理定点审查37条；另一AI独立复核89条；新增OpenAlex候选由C定点阅读。机器排除和读过摘要的判断在CSV中分别标记。

最终决定：{'retain': 17, 'uncertain': 51, 'exclude': 916}。保留不等于全文通过、记录数不等于独立实验数。

## 漏检与质量检查

### 接口结果是否取全

PubMed 17/17→19/19；Europe PMC 18/18、580/580→20/20；OpenAlex修订语法后32/32。

分母：每条接口返回的total/hitCount

方法：保存每页原始响应和URL/UTC/HTTP/SHA，核对计数与源ID；不根据搜索引擎摘要估算命中总数。

限制：只证明接口所报告的结果没有在下载阶段被截断；不能证明数据库覆盖充分或检索式正确。


### 独立综述派生基准：先暴露漏检，再修复

原始原生主检索3/5；加OpenAlex主题仍3/5；加一轮图4/5；词汇修订主检索5/5。

分母：另一代理独立从13项综述来源形成的5篇合格原始研究

方法：先冻结原检索式；基准收集者不读旧清单或新检索结果。比对后用精确ID定位失败原因，诊断请求不算原查询命中。

限制：基准是5篇样本，不是领域分母；曾在进度中透露1篇身份，非严格盲法。修订已使用这5篇信息，5/5仅为样本内修复，尚无新的未见验证集。

- [B01｜Polystyrene microplastics decrease F-53B bioaccumulation but induce inflammatory stress in larval zebrafish](https://doi.org/10.1016/j.chemosphere.2020.127040)：原始主检索：找到；加一跳图：找到；修订主检索：找到。基准出处：R01 / Section 5, Combined toxicity of MPs and PFASs to aquatic organisms; reference [131] (Yang et al., 2020)
- [B02｜Sorption of PFOS onto polystyrene microplastics potentiates synergistic toxic effects during zebrafish embryogenesis and neurodevelopment](https://doi.org/10.1016/j.chemosphere.2024.143462)：原始主检索：找到；加一跳图：找到；修订主检索：找到。基准出处：R04 / Reference CR11 (Gupta et al., 2024); section Plant uptake, bioaccumulation, trophic transfer, and toxicity; section Bioaccumulation, toxicity, and ecological implications
- [B03｜Exacerbated interfacial impacts of nanoplastics and 6:2 chlorinated polyfluorinated ether sulfonate by natural organic matter in adult zebrafish: Evidence through histopathology, gut microbiota, and transcriptomic analysis](https://doi.org/10.1016/j.jhazmat.2024.135038)：原始主检索：漏检；加一跳图：找到；修订主检索：找到。基准出处：R04 / Reference CR14 (Junaid et al., 2024); section Plant uptake, bioaccumulation, trophic transfer, and toxicity; section Bioaccumulation, toxicity, and ecological implications
- [B04｜Combined exposure with microplastics increases the toxic effects of PFOS and its alternative F-53B in adult zebrafish](https://doi.org/10.1016/j.scitotenv.2024.170948)：原始主检索：找到；加一跳图：找到；修订主检索：找到。基准出处：R07 / Publisher-indexed paragraph beginning In an experiment conducted by Jian et al., citing [15]; Crossref ref_15 (array position 15) confirms title/DOI
- [B05｜Combined effects of microplastics and chemical contaminants on the organ toxicity of zebrafish (Danio rerio)](https://doi.org/10.1016/j.envres.2017.12.019)：原始主检索：漏检；加一跳图：未找到；修订主检索：找到。基准出处：R07 / Crossref ref_114, array position 114 (Rainieri et al., 2018)

### 旧10篇回归：检查数据库来源差异

原始原生检索9/10；增加OpenAlex主题后10/10。RSC论文在原生两接口中未出现。

分母：第一轮已知的10个核心DOI

方法：用冻结主题查询的返回集合按DOI比对，不用已知DOI定位请求充当主题命中。

限制：这是已知集回归，不是独立覆盖率。找到题录也不等于通过全文资格判断。

- [P01｜Combined exposure with microplastics increases the toxic effects of PFOS and its alternative F-53B in adult zebrafish](https://doi.org/10.1016/j.scitotenv.2024.170948)：旧10篇属于已知回归集，不是独立基准。
- [P02｜Sorption of PFOS onto polystyrene microplastics potentiates synergistic toxic effects during zebrafish embryogenesis and neurodevelopment](https://doi.org/10.1016/j.chemosphere.2024.143462)：旧10篇属于已知回归集，不是独立基准。
- [P03｜Developmental stage-dependent carrier effects of nanoplastics on PFOS bioaccumulation and toxicity in zebrafish: Insights from toxicokinetic-toxicodynamic perspective](https://doi.org/10.1016/j.watres.2025.124658)：旧10篇属于已知回归集，不是独立基准。
- [P04｜Proteomic and metabolic responses in zebrafish embryos exposed to polystyrene nanoparticles and perfluorooctane sulfonate](https://doi.org/10.1039/D5EN00231A)：旧10篇属于已知回归集，不是独立基准。
- [P05｜Combined toxicity of polyethylene micro/nanoplastics and PFOA in zebrafish (Danio rerio): Impacts on antioxidant, neurotransmission, and gut microbiota](https://doi.org/10.1016/j.etap.2025.104907)：旧10篇属于已知回归集，不是独立基准。
- [P06｜Co-exposure of polyethylene terephthalate micro- and nanoplastics with per- and polyfluoroalkyl substances triggers immune dysregulation, apoptotic activation, and neurotoxicity](https://doi.org/10.1007/s10646-025-03017-0)：旧10篇属于已知回归集，不是独立基准。
- [P07｜Polystyrene modulation of perfluorooctanoic acid toxicity in zebrafish: Transcriptomic and toxicological insights](https://doi.org/10.1016/j.jhazmat.2025.139951)：旧10篇属于已知回归集，不是独立基准。
- [P08｜Co-exposure to polystyrene microplastics and perfluorooctanoic acid can exacerbate lipid metabolism disorders and liver damage in adult zebrafish](https://doi.org/10.1016/j.jes.2025.10.001)：旧10篇属于已知回归集，不是独立基准。
- [P09｜The exploration of chronic combined toxic mechanisms of environmental PFOA and polyethylene micro/nanoplastics on adult zebrafish (Danio rerio), using aquatic microcosm systems](https://doi.org/10.1016/j.aquatox.2025.107534)：旧10篇属于已知回归集，不是独立基准。
- [P10｜Co-exposure to PFOA, PFBA and nanoplastics synergistically exacerbates neurotoxicity by impairing PINK1/Parkin-mediated mitophagy](https://doi.org/10.1016/j.envint.2026.110102)：旧10篇属于已知回归集，不是独立基准。

### 去掉物种块，是否发现被挡住的研究

本轮初筛与复核中新增确认保留项0条。没有据此宣称其余562条全部经人工式逐条核验。

分母：扩展580条，原始主检索并集18条；额外562条

方法：原计划预先登记去掉物种块。机械初筛后，对额外风险31条全部、其余531条固定种子抽40条由另一AI读返回摘要。

限制：这项只能检查物种块风险，不能发现PFAS词根遗漏；两个漏检案例恰好仍被PFAS块挡住。未出现物种词的机器排除仍可能误排。


### 一跳前后向引文追踪

取得442条引用路径记录。筛选后有1条保留候选没有被原始三源主题搜索取得；不得回填成原检索命中。

分母：4个公开种子 × 前后2方向

方法：种子DOI及查询在amendment-openalex.json登记；后向按referenced_works解析，前向用cites过滤并分页。

限制：第三种子前向连接失败，分母未知；第四种子后向只解析35/36，缺W6770502304。只追4个种子、一跳，不是整张引文网络。

- CITE-BACK-01｜10.1016/j.scitotenv.2024.170948：返回66/66；all_seed_reference_ids_resolved
- CITE-FWD-01｜10.1016/j.scitotenv.2024.170948：返回38/38；all_reported_results_retrieved
- CITE-BACK-02｜10.1016/j.watres.2025.124658：返回89/89；all_seed_reference_ids_resolved
- CITE-FWD-02｜10.1016/j.watres.2025.124658：返回4/4；all_reported_results_retrieved
- CITE-BACK-03｜10.1016/j.aquatox.2025.107534：返回52/52；all_seed_reference_ids_resolved
- CITE-FWD-03｜10.1016/j.aquatox.2025.107534：返回0/未知；request_failed
- CITE-BACK-04｜10.1016/j.chemosphere.2020.127040：返回35/36；cap_or_unresolved_reference_ids
- CITE-FWD-04｜10.1016/j.chemosphere.2020.127040：返回158/158；all_reported_results_retrieved

### 独立AI复核：筛选中有没有误排或误纳

与初筛/主代理定点决定比较，2条决定不同；已逐条留裁决。多物种多处理论文改为待定，重复题录不另算研究。

分母：原始两接口580并集中的89条（18主检索＋31风险＋40随机）

方法：第二AI在未读A决定、未读基准的情况下看题名和完整返回摘要；新OpenAlex候选另由C作定点筛选。

限制：不是独立人类专家或金标准准确率。C筛选不是对所有新记录再做第二遍；未随机复核的记录继续标明。

- Chronic feeding exposure to virgin and spiked microplastics disrupts essential biological functions in teleost fish.：初判：retain：题名及可见摘要明确包含斑马鱼与微/纳塑料、明确PFAS的共暴露；保留进入下一阶段，未验证全文对照/统计。；复核：uncertain：摘要同时包含斑马鱼/海水青鳉以及多种预吸附污染物，需全文逐臂确认斑马鱼与PFOS-微塑料对应；保留待核，不能误排。
- The exploration of chronic combined toxic mechanisms of environmental PFOA and polyethylene micro/nanoplastics on adult zebrafish (Danio rerio), using aquatic microcosm systems：初判：exclude：AGR记录与MED40795757题名及摘要对应，作重复题录候选关联，不另算研究。；复核：retain：成年斑马鱼PE微/纳塑料与PFOA共同暴露实验可识别；与MED40795757为同题重复候选，不能另计独立研究。

### 输入文本是否在解析时丢失

数学比较号被宽泛HTML正则误删；使用保留的原始JSON重建，0次新网络请求。例：39270866摘要由773字符恢复至1899字符。

分母：原Europe PMC 580个源记录；22条文字发生修复

方法：保留修复前后文件/hash与逐条长度；样本89个ID前后不变，对受影响的3条复核样本重读。

限制：这是本轮新增适配器的错误，不是原论文或上游Skill错误；修复这个错误不等于其他解析与理解错误均已排除。


### 文献分布是否提示需要继续补查

年份分布：{'2026': 6, '2025': 2, '2024': 5, '2020': 2, '2019': 1, '2018': 1}。期刊/来源分布：{'Journal of environmental sciences (China)': 1, 'Ecotoxicology (London, England)': 1, 'Environment international': 1, 'Environmental toxicology and pharmacology': 1, 'Journal of hazardous materials': 1, 'Water research': 1, 'Aquatic toxicology (Amsterdam, Netherlands)': 1, 'Chemosphere': 2, 'The Science of the total environment': 3, 'Journal of Hazardous Materials': 1, 'Frontiers in Environmental Science': 1, 'University of Surrey Open Research repository': 1, 'Environmental research': 1}。达到单值70%提示的维度项0个。

分母：保留候选17条；已知年份17条，期刊/来源名16条

方法：按上游Step4.6，只统计实际已有字段；每个维度用自己的known_N。具体实验方法与研究地点没有系统提取，不填猜测值。

限制：未触发集中提示不证明没有漏检；候选集、期刊名和实验单位不同。方法和地域两个维度的检查尚无足够提取数据。


## 仍然存在的盲区

- 本轮是检索与初筛试验。保留项仅是后续阅读候选；没有新增核心全文审读，不认证毒性、因果、统计或论文创新性。
- 5篇独立构建基准已被用于调词；修订5/5不是新的未见验证成绩，也不是全领域召回率或Skill准确率。
- PubMed和Europe PMC高度重叠；OpenAlex另有索引与缺摘要问题。没有原生检索WoS、Scopus、CNKI或所有学位论文库。
- 机械预筛包括‘题名摘要无目标物种线索’规则。89条复核及C定点判断没有覆盖所有记录的全文，仍有误排风险。
- 无摘要或返回片段不足、学位论文/预印本与正式论文的实验重叠、多物种与多处理对应关系，保持待核；记录数不等于独立实验数。
- 引用网络限4个种子的一跳，仍有一个前向方向失败和一个后向ID未解析；来源数量不能抵消这些缺口。
- 第一轮37条网页查询和10篇核心保留在主网页的历史章节（http://127.0.0.1:4332/#workflow）；本报告记录第二轮实测，两个阶段的分母不同。
- 本轮新增的API脚本由Codex编写，按原始bibliography规则执行；不是宣称上游已经自动实现这些全部操作，也没有有/无Skill对照。

## 复跑与本地原始记录

`scripts/retrieve-pubmed.py`、`retrieve-europepmc.py`、`retrieve-openalex.py`只在明确运行时发起网络请求。网页构建只读已保存产物。冻结、修订、原始响应、复核与诊断文件在`research/retrieval-trial/`。
