# Phase 2 注释书目与检索记录

研究问题：微/纳塑料是否一致增强 PFAS 对斑马鱼的毒性？差异与生命阶段、暴露条件和证据类型有何关系？

本文件只交付来源筛选、逐篇注释与读取边界，不交付跨研究综合或新颖性结论。来源时间范围为 2015 年至 2026-10-29；实际检索日为 2026-10-29。纳入 10 篇直接相关原始研究，另列 2 篇边界背景研究。记录总数并非研究总体的估计。

## 检索与选择

使用 `web.run` 网络检索发现文献，再读取官方 PubMed、PMC 或出版社页面的可访问内容。没有执行原生 PubMed、Scopus、Web of Science 或 Google Scholar 数据库检索；域名限定网页检索也不称为数据库检索。37 条实际执行查询、15 个遇到的科学文献排除候选、去重及访问情况见 [search-log.json](search-log.json)。不填造数据库命中总数，不提供 PRISMA 流程或穷尽性声明。

主要概念为 zebrafish/Danio rerio、PFAS/PFOS/PFOA/PFBA/F-53B、microplastics/nanoplastics/PS/PE/PET、coexposure/combined toxicity。核心纳入标准为时限内、斑马鱼、选定 PFAS 与微/纳塑料共同暴露、原始实验研究；综述、单污染物及其他物种不计入核心。P11/P12 为预先明确的背景例外。

同一 DOI 的出版社、PubMed、ZFIN、OpenAlex 等记录合并一次；以下是 10 个不同 DOI 的出版物，并不据此保证 10 个独立实验队列。P05/P09 作者和实验体系存在重叠，队列独立性尚不能由摘要确认。引用年采用正式卷期年，另保留提前在线日期。

## 读取范围和质量边界

8 篇核心仅完成完整摘要读取；P05 另读出版社 Introduction 片段，P07 另读材料、急性毒性结果、结论等片段，均标为 `sections`。P03、P09、P10 官方全文入口已尝试，ScienceDirect 直接请求返回 403；P04 RSC 直接页面也返回 403。可见的官方搜索缓存不等于全文。**本轮没有任何核心研究被标记为已读全文。**

`papers.json` 中的 `verification: pending` 指等待主代理另行运行上游书目核验工具；这里已人工核对所述官方题名、作者、DOI、卷期及可读摘要。网页元数据吻合不等于全文真实性或方法质量已经完整核验。

证据层级参考已读的 source_quality_hierarchy；这些是与问题直接相关的受控暴露实验，不机械套用人类临床 RCT 等级或给出未经全文支持的整体 A/B 等级。摘要未报告的方法信息记为“未提取/未评估”，不称为作者没有做。片段研究仅按 empirical 六项表检查已读范围；详见 JSON 的 limitations 和 locator。以下每条注释均为转述，无直接引文。

DISTRIBUTIONAL_SKEW_ADVISORY（核心 10 篇）：

- 方法：受控实验 10/10；这是本问题的纳入设计要求。
- 时间：2024–2026 年 10/10；已执行回溯年份检索，不能由未发现早年核心推出早年不存在研究。
- 出版社：Elsevier 8/10；仅提示覆盖集中，不作为可靠性评分。
- 地理与未核实方法维度不推断。达到本轮 10 篇核心上限后停止扩展。

## 核心原始研究

### P01 — 成年雌鱼，PFOS/F-53B 与 MPs

Jian, M., Chen, X., Liu, S., Liu, Y., Liu, Y., Wang, Q., & Tu, W. (2024). Combined exposure with microplastics increases the toxic effects of PFOS and its alternative F-53B in adult zebrafish. *Science of the Total Environment, 920*, 170948. [https://doi.org/10.1016/j.scitotenv.2024.170948](https://doi.org/10.1016/j.scitotenv.2024.170948)

10 μg/L PFOS 或 F-53B、50 μg/L MPs 暴露 14 天；MPs 降低水中游离浓度，却未改变肝/肠累积。共同暴露的肝免疫/能量指标和菌群变化有增强表现，菌群解释为相关性。定位：[PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/38365036/)。读取：abstract；方法弱点未评估。

### P02 — 卵膜与发育/神经终点

Gupta, P., Mahapatra, A., Manna, B., Suman, A., Ray, S. S., Singhal, N., & Singh, R. K. (2024). Sorption of PFOS onto polystyrene microplastics potentiates synergistic toxic effects during zebrafish embryogenesis and neurodevelopment. *Chemosphere, 366*, 143462. [https://doi.org/10.1016/j.chemosphere.2024.143462](https://doi.org/10.1016/j.chemosphere.2024.143462)

分子模拟与卵膜显微观察支持相互作用/表面累积；共暴露加重孵化延迟、死亡、畸形及神经行为相关改变。“协同”为作者表述，数学判据未核对。定位：[PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/39368493/)。读取：abstract；生物暴露剂量/时程未从摘要提取，方法弱点未评估。

### P03 — 胚胎/仔鱼阶段比较与 TK–TD

Ma, J., Gao, N., Yuan, X., Yang, L., Zhu, L., & Feng, J. (2026). Developmental stage-dependent carrier effects of nanoplastics on PFOS bioaccumulation and toxicity in zebrafish: Insights from toxicokinetic-toxicodynamic perspective. *Water Research, 288*(Pt A), 124658. [https://doi.org/10.1016/j.watres.2025.124658](https://doi.org/10.1016/j.watres.2025.124658)

摘要明确区分 0–48 h 胚胎和 72–168 h 仔鱼：前者累积下降、孵化抑制减轻；后者累积和多层毒性增强。内部浓度 BBMD 未显示 NP 改变 PFOS 剂量反应，作者主要归于 TK 载体效应。定位：[PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/41005273/)。读取：abstract；模型/粒径/剂量方法未评估。正式卷期为 2026-01-01，在线 2025-09-22；第三作者名按 PubMed 为 Xiang Yuan。

### P04 — 蛋白组与代谢组

Gong, J., Wu, X., He, X., & Tan, F. (2025). Proteomic and metabolic responses in zebrafish embryos exposed to polystyrene nanoparticles and perfluorooctane sulfonate. *Environmental Science: Nano, 12*, 4042–4055. [https://doi.org/10.1039/D5EN00231A](https://doi.org/10.1039/D5EN00231A)

48 hpf 起，以 200 μg/L PSNPs、100 μg/L PFOS 单独/共同暴露 6 天。作者报告随时间出现加和/协同致死效应；差异蛋白/代谢物涉及能量及心肌等过程。定位：[RSC 摘要与 Article information](https://pubs.rsc.org/en/content/articlelanding/2025/en/d5en00231a)。读取：abstract；蛋白数量不作为效应量或因果证明，方法弱点未评估。

### P05 — PE-MP/NP 的器官特异性指标

Wang, X., Li, R., Cheng, B., Sun, Y., Yao, X., & Wang, C. (2026). Combined toxicity of polyethylene micro/nanoplastics and PFOA in zebrafish (Danio rerio): Impacts on antioxidant, neurotransmission, and gut microbiota. *Environmental Toxicology and Pharmacology, 121*, 104907. [https://doi.org/10.1016/j.etap.2025.104907](https://doi.org/10.1016/j.etap.2025.104907)

鳃、肠、肝氧化与神经标记及菌群受影响；作者依据 IBRv2 描述鳃/肝协同、肠拮抗。定位：[PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/41422984/)、[出版社 Introduction 片段](https://www.sciencedirect.com/science/article/pii/S1382668925002820)。读取：sections，仅摘要与成年鱼说明；六项方法检查均未完成。IBRv2 标签未等同独立剂量相加检验。2026 年卷期，在线 2025-12-19。

### P06 — PET-MNP 与 PFOA 仔鱼

Dharshan, S. S., Madesh, S., Rao, S. M., Ramamurthy, K., Rajagopal, R., Alfarhan, A., Choi, K. C., & Arockiaraj, J. (2026). Co-exposure of polyethylene terephthalate micro- and nanoplastics with per- and polyfluoroalkyl substances triggers immune dysregulation, apoptotic activation, and neurotoxicity. *Ecotoxicology, 35*(3), Article 42. [https://doi.org/10.1007/s10646-025-03017-0](https://doi.org/10.1007/s10646-025-03017-0)

PET-MNPs 250 μg/L 或 2.5 mg/L，PFOA 20 或 200 μg/L；报告粒子组织累积、氧化/免疫/凋亡及行为改变。作者称加和毒性。定位：[PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/41706329/)。读取：abstract；PFOA 载体解释、时程和相互作用模型待全文，方法弱点未评估。

### P07 — 粒径、急性毒性与转录组

Zhao, Y., Zhang, S., Liu, Y., Li, S., & Hou, J. (2025). Polystyrene modulation of perfluorooctanoic acid toxicity in zebrafish: Transcriptomic and toxicological insights. *Journal of Hazardous Materials, 498*, 139951. [https://doi.org/10.1016/j.jhazmat.2025.139951](https://doi.org/10.1016/j.jhazmat.2025.139951)

0.2、2、20 μm PS 对 PFOA 累积、存活及神经/代谢通路的影响不同。出版社片段给出单 PFOA 96 h LC50 为 72.64 mg/L。定位：[PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/41027221/)、[材料/急性结果/结论片段](https://www.sciencedirect.com/science/article/abs/pii/S0304389425028705)。读取：sections；外推限制为读者未检验推断：高剂量死亡结果本身不能建立环境浓度效应，其余方法项未全面检查。

### P08 — 28 天成年鱼肠/肝与脂代谢

Tian, S., Li, R., Zeng, Y., Qin, L., Long, C., Qing, T., Zhang, P., & Feng, B. (2026). Co-exposure to polystyrene microplastics and perfluorooctanoic acid can exacerbate lipid metabolism disorders and liver damage in adult zebrafish. *Journal of Environmental Sciences, 163*, 185–196. [https://doi.org/10.1016/j.jes.2025.10.001](https://doi.org/10.1016/j.jes.2025.10.001)

28 天共暴露比单暴露产生更重肠/肝损伤，伴随菌群及脂代谢通路改变。摘要未给正式相互作用模型，不将“更强效应”自动改写为协同。定位：[PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/41887838/)。读取：abstract；剂量、粒径与因果方法未评估。卷期为 2026 年 5 月，在线 2025-10-10。

### P09 — PE/PFOA 微宇宙的时间比较

Wu, W., Li, R., Zhang, Z., Liu, G., Sun, Y., & Wang, C. (2025). The exploration of chronic combined toxic mechanisms of environmental PFOA and polyethylene micro/nanoplastics on adult zebrafish (Danio rerio), using aquatic microcosm systems. *Aquatic Toxicology, 287*, 107534. [https://doi.org/10.1016/j.aquatox.2025.107534](https://doi.org/10.1016/j.aquatox.2025.107534)

作者报告第 7 天鳃/肝协同，第 28 天拮抗，另有肠病理、乙酰胆碱和菌群终点。定位：[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/40795757/)、[出版社完整摘要](https://www.sciencedirect.com/science/article/abs/pii/S0166445X2500298X)。读取：abstract；判定模型未核对。与 P05 是否共用实验队列不能由摘要确定，不称独立重复验证。

### P10 — PFOA/PFBA、线粒体自噬与功能实验

Cai, H., Luo, S., Zhou, Z., Chen, F., Ying, J., Wu, Q., Wu, Y., Chen, S., Yao, X., Xie, F., Xu, W., Xu, K., & Peng, R. (2026). Co-exposure to PFOA, PFBA and nanoplastics synergistically exacerbates neurotoxicity by impairing PINK1/Parkin-mediated mitophagy. *Environment International, 208*, 110102. [https://doi.org/10.1016/j.envint.2026.110102](https://doi.org/10.1016/j.envint.2026.110102)

使用仔鱼和 SH-SY5Y；NP 对 PFOA 的吸附高于 PFBA，共暴露加重神经相关效应。摘要提及 PINK1 过表达/药理激活救援，却未定位每项救援属于鱼或细胞。定位：[PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/41616538/)、[出版社摘要](https://www.sciencedirect.com/science/article/pii/S0160412026000607)。读取：abstract；不把细胞救援转为整鱼因果结论，方法弱点未评估。

## 明确分开的背景原始研究

### P11 — 非 PFAS：PAH 混合物与 PS-NP

Trevisan, R., Voy, C., Chen, S., & Di Giulio, R. T. (2019). Nanoplastics decrease the toxicity of a complex PAH mixture but impair mitochondrial energy production in developing zebrafish. *Environmental Science & Technology, 53*(14), 8405–8415. [https://doi.org/10.1021/acs.est.9b02003](https://doi.org/10.1021/acs.est.9b02003)

44 nm PS-NP 与 PAH 沉积物提取物自 6 hpf 静态共暴露；部分发育损伤减轻，同时线粒体能量终点受扰。它仅示范不同端点可分离，不能作为 PFAS 拮抗证据。定位：[PMC §2.1–2.5、Fig2、Fig5 与末段](https://pmc.ncbi.nlm.nih.gov/articles/PMC6660138/)。读取：sections；作者承认均一商品球形粒子的环境代表性有限，见末段。其余五项检查在已读范围未发现明确弱点；SI 未查。

### P12 — PFAS 单独/混合，无塑料

Haimbaugh, A., Wu, C.-C., Akemann, C., Meyer, D. N., Connell, M., Abdi, M., Khalaf, A., Johnson, D., & Baker, T. R. (2022). Multi- and transgenerational effects of developmental exposure to environmental levels of PFAS and PFAS mixture in zebrafish (Danio rerio). *Toxics, 10*(6), 334. [https://doi.org/10.3390/toxics10060334](https://doi.org/10.3390/toxics10060334)

F0 早期 5 天 ng/L 级 PFAS 暴露，追踪 F0–F2 行为/转录及繁殖相关终点。该研究不能说明塑料共暴露的跨代效应。定位：[PMC §2.2.3、§2.4–2.5、§3.2–3.3](https://pmc.ncbi.nlm.nih.gov/articles/PMC9228135/)。读取：sections；作者在 §3.2.5 承认 PFOA F1 性别比对照异常、停摆导致仅一队列，可能影响该终点；其余方法项未全面检查。

## 检索限制

网络索引覆盖、页面缓存、403 及有限读取范围限制了方法细节核对。本轮不根据摘要缺失推断盲法、随机化、重复数、浓度验证或吸附平衡控制缺失，也不声明无撤稿、无利益冲突或期刊已完成全面审计。后续比较应回到每条 locator；未提取的剂量、粒径和时程不进行补猜。

