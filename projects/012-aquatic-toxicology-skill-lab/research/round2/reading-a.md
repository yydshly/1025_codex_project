# 第二轮候选深入阅读 · A组（1–6）

实际日期：2026-10-29。1篇主文阅读全文、2篇局部章节、3篇摘要；未取得的全文明确保留。source records里的full_text只指主文，不代表补充数据重算。

## 新增判断

- 混合污染物和学位论文另列；核心结果按剂量、生命阶段及端点对照。
- 生态冠调节NP–F53B已有前作，选题不能只写首次加入NOM。
- 无显著急性效应与存在分子响应可以并存；高于单一暴露也不能自动叫协同。

## T248d7c42b · Combined effects of microplastics and chemical contaminants on the organ toxicity of zebrafish (Danio rerio).

DOI：10.1016/j.envres.2017.12.019；阅读：abstract；用途：mixture_context。

资格决定：降为mixture_context，保留阅读记录，不以PFAS独立实验纳入综合。

与第一轮对照：第一轮未纳入。补充早期（2018）多污染物饲料研究，但不加入PFAS特异的直接效应计数。

### 实际阅读过程

- [检索并打开PubMed](https://pubmed.ncbi.nlm.nih.gov/29306661/)：检索结果可核身份；一次打开仅返回极少正文，未据此声称全文。 定位：入口/摘要。
- [打开作者机构DTU记录](https://orbit.dtu.dk/en/publications/combined-effects-of-microplastics-and-chemical-contaminants-on-th/)：实际读到完整作者摘要和期刊身份；Access to Document仅指DOI，无作者稿下载。 定位：入口/摘要。
- [从DTU访问出版商入口](https://doi.org/10.1016/j.envres.2017.12.019)：抓取失败，未取得正文。 定位：入口/摘要。
- [精确PMID调用Europe PMC core API核对作者摘要与全文可用性](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID%3A29306661+AND+SRC%3AMED&resultType=core&format=json)：HTTP 200；inPMC=N，inEPMC=N，OA=N，仅列需订阅DOI。 定位：本轮API收据见reading-a-api-receipts.json。

### 提取的设计与证据

- model：斑马鱼（鱼龄/性别未由摘要确认）
- stage：器官研究；不能由本次摘要确认具体成鱼月龄
- particles：LD-PE，125–250 μm
- chemicals：PCBs、溴化阻燃剂、全氟化合物及甲基汞组成的混合物
- doses：含污染物的颗粒占饲料2%；各化学物剂量未知
- duration：3周
- groups：普通饲料、颗粒饲料、载混合污染物颗粒饲料、仅混合污染物饲料，共4类
- replication：未获取全文，缸数、个体数、实验单位未知
- statistics：摘要仅报告显著改变，统计检验、交互模型未知
- 作者报告：载混合污染物颗粒饲料的器官改变较突出，尤其肝脏；颗粒单独组在所测条件下未见明显效应。 [作者摘要，末段](https://orbit.dtu.dk/en/publications/combined-effects-of-microplastics-and-chemical-contaminants-on-th/)；证据层级：摘要级作者结果。
- 本次判断：这是多类污染物混合效应的情境证据，无法将损伤单独归因于PFAS或证明PFAS×塑料协同。 [作者摘要，4组饲料设计](https://orbit.dtu.dk/en/publications/combined-effects-of-microplastics-and-chemical-contaminants-on-th/)；证据层级：本次方法学推断。

### 局限

- 未取得正文，剂量、缸重复、随机化和盲法未知。
- 混合物含多类非PFAS污染物；缺少单一PFAS支路，PFAS特异效应不可分离。
- “组合组更明显”不是正式非加和/协同模型验证。

独立性：与本组其他文献非同一DOI；动物批次独立性未由原始数据确认。

全文尝试：出版商入口抓取失败；DTU未给出作者稿，Europe PMC无全文；检索未找到可确认的公开作者全文。

## T272e51c9c · Multi-Laboratory Hazard Assessment of Contaminated Microplastic Particles by Means of Enhanced Fish Embryo Test With the Zebrafish (Danio rerio)

DOI：10.3389/fenvs.2019.00135；阅读：full_text；用途：direct。

资格决定：direct：存在单独PE+PFOS支路；3POPs结果单列，不能替代PFOS特异结果。

与第一轮对照：第一轮未纳入。增加可核正文的阴性急性/行为结果和阳性分子终点，强化第一轮“不能统一增强”的判断，同时避免把阴性终点误读为全面无毒。

### 实际阅读过程

- [打开开放全文并逐段核对](https://www.frontiersin.org/journals/environmental-science/articles/10.3389/fenvs.2019.00135/full)：已读主文方法、表1–4、结果及图1–5图注、讨论、结论；补充材料只见入口未读审。 定位：正文Materials and Methods至Conclusions。
- [核对原文组别/统计/摘要差异](https://www.frontiersin.org/journals/environmental-science/articles/10.3389/fenvs.2019.00135/full)：确认PFOS单独预载支路和DMSO对照；核对cyp1a及n不一致。 定位：表2、3；图4注；Statistics。

### 提取的设计与证据

- model：斑马鱼胚胎/仔鱼，三实验室
- stage：不迟于4 hpf开始；FET至96 h；行为120 hpf
- particles：PE 11–13 μm，10或100 mg/L
- chemicals：单独预载PFOS、BaP、BP3；另有3POPs混合支路
- doses：颗粒PFOS负载70.22±12.41 μg/g；水相PFOS对照700 ng/L（按10 mg/L颗粒全脱附假设）；0.01%DMSO有溶剂对照
- duration：FET 96 h每日换液；生物转化另设3 h脉冲；行为5 dpf
- groups：纯颗粒、单化学物预载颗粒及3POPs、空白/阳性对照；只有Örebro加水相化学物支路（表3）
- replication：各实验室3次独立暴露；EROD 3×20，cyp1a方法3×15但图4注n=4，报告不一致；行为16–24/处理
- statistics：单因素ANOVA+Dunnett或非参数检验；行为重复测量ANOVA；未见正式二因素非加和模型
- 作者正文报告：所测预载PE（含PFOS支路）未显著改变FET急性、畸形及孵化终点，行为处理间也未显著不同。 [Results: Embryotoxic and Teratogenic Effects；Larval Behavior；图1、2、5](https://www.frontiersin.org/journals/environmental-science/articles/10.3389/fenvs.2019.00135/full)；证据层级：已读正文的条件限定结果。
- 作者正文报告：PFOS预载颗粒未改变EROD，但cyp1a有小幅上调（p=0.039）；生物标志物与急性终点不能合并为“均无效应”。 [Results: EROD Activity；Gene Transcription Analysis of Cyp1a；图3、4](https://www.frontiersin.org/journals/environmental-science/articles/10.3389/fenvs.2019.00135/full)；证据层级：已读正文；结果层级有限。
- 本次核对发现：摘要将cyp1a变化写为BP3/BaP，而正文及讨论为PFOS/BaP；按正文限定，并保留不一致。 [Abstract；Results: Gene Transcription Analysis of Cyp1a；Discussion: Cytochrome P450](https://www.frontiersin.org/journals/environmental-science/articles/10.3389/fenvs.2019.00135/full)；证据层级：本次文本核对。

### 局限

- 仅适用于所测粒径、负载、阶段和终点；无显著差异不能证明安全或等效。
- 较高颗粒浓度与有限早期暴露，不能直接代表长期环境风险。
- 水相对照不是所有实验室都有；三实验室并非同一完整析因矩阵。
- 摘要/正文cyp1a及方法/图注样本量不一致；补充材料未独立读审。

独立性：三实验室协议比较；不能当成3篇互相独立的论文。B组核对Cormier2020学位作者/项目重叠，但正文不可读，章与期刊重复尚未确认；不作为额外独立复制。

全文尝试：Frontiers主文HTML开放可读；full_text指主文阅读，不包含补充文件或原始实验数据重算。

## T4e6f9f4f2 · Development of Water Cluster-Secondary Ion Mass Spectrometry and Particle Induced X-ray Emission to Investigate Spatially Resolved Biological Responses to Nanopolystyrene in Zebrafish Larvae

DOI：10.15126/thesis.901942；阅读：sections；用途：thesis_context。

资格决定：thesis_context：保留灰色文献及方法线索，具体PFOS分支可用于限定解释；不重复计入期刊实验数。

与第一轮对照：第一轮未纳入。新增器官空间分布/方法学与端点限定反证，作为thesis_context展示，不与期刊直接研究等权计数。

### 实际阅读过程

- [打开学位论文机构记录](https://openresearch.surrey.ac.uk/esploro/outputs/doctoral/991089128802346)：确认作者、DOI、学位与开放许可；摘要不能代表共暴露实验细节。 定位：入口/摘要。
- [点击机构Download并下载PDF](https://openresearch.surrey.ac.uk/view/pdfCoverPage?download=true&filePid=13230289610002346&instCode=44SUR_INST)：HTTP200，196页，6,201,810字节；SHA256 814ec3112319984b2dc2000ce186de1eae93a913c2a2021e36a1a79d9e405c18；原文仅本地保存。 定位：印刷页52–54、97–103、113–129、171–175；未通读其他章节。
- [对照提取文本和PDF页面渲染](https://openresearch.surrey.ac.uk/view/pdfCoverPage?download=true&filePid=13230289610002346&instCode=44SUR_INST#page=135)：实际查看PDF135页图4.12与段落，确认作者“未放大Ca”对应范围。 定位：PDF135 / 印刷115。

### 提取的设计与证据

- model：AB斑马鱼胚胎，PIXE元素成像
- stage：约6 hpf开始，维持至4 dpf
- particles：PFOS共暴露分支为名义50 nm普通PS-NP，1 ppm；论文其他低ppt表面修饰分支为NP-only
- chemicals：PFOS 100 ppb（钾盐，作者在局限中讨论K贡献）
- doses：NP 1 ppm + PFOS 100 ppb；不同于摘要低ppt NP-only实验
- duration：约6 hpf至4 dpf；原文对pilot/1.5暴露路线描述前后有出入
- groups：对照、NP-only、PFOS-only、NP+PFOS；Ch4图4.1/图4.12呈水相比较
- replication：PFOS支路独立胚胎/暴露批次数未清楚给出；不能挪用表4.1的另一NP-only实验n=3
- statistics：PIXE处理列两尾异方差t检验；PFOS图主要成像比较，未见正式交互模型
- 作者报告：PFOS组及NP+PFOS组出现K分布变化；PFOS未额外放大NP心脏Ca扰动的成像模式。 [Ch4 §4.6.5，印刷页113–115；PDF页133–135；图4.11、4.12](https://openresearch.surrey.ac.uk/view/pdfCoverPage?download=true&filePid=13230289610002346&instCode=44SUR_INST)；证据层级：学位论文重点章节；成像/半定量线索。
- 本次判断：这只限制“所有端点都增强”的叙事，不能据此证明总体无协同、保护效应或疾病因果。 [Ch4 §4.6.5；§4.7；General abstract](https://openresearch.surrey.ac.uk/view/pdfCoverPage?download=true&filePid=13230289610002346&instCode=44SUR_INST)；证据层级：本次解释；未正式定量交互验证。

### 局限

- 196页论文只重点读相关章节，不标整篇通读；非期刊独立复现证据。
- PFOS钾盐、PIXE拓扑/厚度及归一化影响解释；作者承认方法半定量和检测限问题。
- Ch2/Ch4对PFOS暴露路线描述不完全一致；该分支重复数和交互统计未清楚定位。
- 低ppt成像发现来自其他NP-only分支，不能当作低ppt PFOS共暴露证据；长期生理后果未测。

独立性：Lau论文内多个实验/成像分支不能按多个独立发表研究计数；对应期刊发表版本和动物批次重叠尚未逐一查清。

全文尝试：合法机构PDF可得。读取与共暴露有关章节并核图；其余章节未通读，因此accessLevel=sections。

## T818c9b578 · MPs and PFOS single and combined exposure significantly alter genetic expressions of growth hormone and insulin growth factor-related biomarkers during zebrafish embryonic development.

DOI：10.1016/j.scitotenv.2024.174925；阅读：abstract；用途：direct。

资格决定：direct：有明确PFOS+PE胚胎共同暴露；结论仅按摘要级，不视为全文资格与质量通过。

与第一轮对照：第一轮未纳入。补充GH/IGF轴与时间序列线索，使“首次研究时间依赖”更难成立，但没有解除因果或交互验证缺口。

### 实际阅读过程

- [阅读PubMed作者摘要与全文入口](https://pubmed.ncbi.nlm.nih.gov/39043301/)：已读完整摘要，确认粒径、剂量、72h及表达峰；无PMC链接。 定位：Abstract。
- [访问PubMed出版商全文链接](https://linkinghub.elsevier.com/retrieve/pii/S0048-9697%2824%2905075-7)：403，未取得正文。 定位：入口/摘要。
- [尝试出版商摘要页并检索机构作者稿](https://www.sciencedirect.com/science/article/abs/pii/S0048969724050757)：直接抓取403；检索仅见摘要/片段，无可确认公开全文。 定位：入口/摘要。
- [精确PMID调用Europe PMC core API核对作者摘要与全文可用性](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID%3A39043301+AND+SRC%3AMED&resultType=core&format=json)：HTTP 200；inPMC=N，inEPMC=N，OA=N，仅列需订阅DOI。 定位：本轮API收据见reading-a-api-receipts.json。

### 提取的设计与证据

- model：斑马鱼胚胎，生长激素/IGF相关基因qRT-PCR
- stage：胚胎；具体起始hpf未由摘要确认
- particles：8 μm PE-MP
- chemicals：PFOS
- doses：PE 50或500 μg/L；PFOS 0.02或0.1 μg/L
- duration：72 h时间序列
- groups：单一与联合暴露；摘要列部分浓度组合，完整矩阵未知
- replication：摘要未报告，未知
- statistics：作者称显著/协同调节；全文交互项、重复测量/多重检验处理未知
- 作者报告：联合暴露的GH/IGF基因响应较单一暴露更明显且持续；早期表达峰提示时间点会影响判断。 [Abstract，暴露设计及联合响应段](https://pubmed.ncbi.nlm.nih.gov/39043301/)；证据层级：摘要级作者结果。
- 本次判断：分子表达改变不等于已证实生长障碍；摘要“协同”不能替代非加和统计证据。 [Abstract；全文未取得](https://pubmed.ncbi.nlm.nih.gov/39043301/)；证据层级：本次证据边界判断。

### 局限

- 未取得全文，完整剂量矩阵、生物重复、实际暴露浓度及统计模型未知。
- 未从本轮可读材料确认功能性生长终点；不能把基因表达直接转为群体风险。

独立性：与本组其他文献非同一DOI；动物批次独立性未由原始数据确认。

全文尝试：出版商全文/摘要页直接抓取403；Europe PMC无全文、需订阅；未发现合法机构全文。

## Ta1ebeeffb · Eco-corona enhanced the interactive effects of nanoplastics and 6:2 chlorinated polyfluorinated ether sulfonate in zebrafish embryos.

DOI：10.1016/j.scitotenv.2024.176223；阅读：sections；用途：direct。

资格决定：direct：NP+F53B支路可辨，但生态冠情境单独解释，按局部章节级，不宣称全文审读。

与第一轮对照：第一轮未纳入。新增NOM/生态冠已发表前作；相关方向须从“是否有影响”转为具体环境基质、内剂量和可识别的调节机制，并做进一步前作核验。

### 实际阅读过程

- [打开PubMed并检索该文作者摘要](https://pubmed.ncbi.nlm.nih.gov/39270866/)：一次直接打开正文极少；后续搜索得到完整作者摘要。 定位：NFB/NFH/NFHB段。
- [精确PMID调用Europe PMC core API核对作者摘要与全文可用性](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID%3A39270866+AND+SRC%3AMED&resultType=core&format=json)：HTTP 200；inPMC=N，inEPMC=N，OA=N，仅列需订阅DOI。 定位：本轮API收据见reading-a-api-receipts.json。
- [访问出版商并读取搜索返回的章节片段](https://www.sciencedirect.com/science/article/abs/pii/S0048969724063794)：页面直接403，但出版商索引返回Chemicals、生态冠表征与结论片段；仅据这些可见片段提取。 定位：Section snippets。
- [核对合法全文路径](https://doi.org/10.1016/j.scitotenv.2024.176223)：Europe PMC仅需订阅DOI；机构作者稿定向检索未得可确认全文。 定位：入口/摘要。

### 提取的设计与证据

- model：斑马鱼胚胎/早期发育，含转录组
- stage：题名胚胎；7天后已跨孵化阶段，实际分期与起始hpf待正文
- particles：80 nm荧光PS-NP（出版商Chemicals片段）；生态冠后水动力径发生变化
- chemicals：F-53B（6:2 Cl-PFESA）及HA/BSA
- doses：NP 1 mg/L、F-53B 200 μg/L、HA和/或BSA各10 mg/L
- duration：7 d
- groups：NP、F-53B、NP+F53B以及BSA/HA/HA+BSA生态冠组；完整control/溶剂矩阵未知
- replication：未知；未取得完整方法和SI
- statistics：摘要报告显著变化/DEGs；交互模型、DEG阈值和多重检验方法未知
- 作者报告：HA或HA+BSA生态冠的共暴露响应较BSA生态冠更强，说明NOM种类影响解释。 [Abstract，NFB/NFH/NFHB比较](https://pubmed.ncbi.nlm.nih.gov/39270866/)；证据层级：作者摘要级组间比较。
- 作者片段报告：生态冠形成伴水动力径变化；不能将80 nm初始粒径当作所有处理的真实分散粒径。 [Section snippets: Chemicals；Characteristics of eco-corona formation on PS-NPs](https://www.sciencedirect.com/science/article/abs/pii/S0048969724063794)；证据层级：出版商局部章节片段。
- 本次判断：这已是HA/BSA调节NP–F53B效应的前作；富集通路与DEG数不能证明具体疾病或机制因果。 [Abstract及局部Conclusions；未取得完整正文](https://pubmed.ncbi.nlm.nih.gov/39270866/)；证据层级：本次新颖性与机制边界判断。

### 局限

- 只读摘要及Chemicals、粒径表征、Discussion/Conclusions的公开片段；未读全文表图/SI。
- 溶剂控制、生物重复、终点数及实际F-53B/颗粒负荷尚不能审定。
- 荧光颗粒累积与化学物内剂量不同；DEG多少不是统一毒性严重度标尺。
- 部分结论片段的ROS方向需以完整比较对象复核，不能概括所有生态冠都增ROS。

独立性：与Junaid2024成鱼论文作者部分重合、生命阶段不同；是否共享材料批次/测量数据未知，不将相似方法当独立复现。

全文尝试：出版商403；公开检索只暴露章节片段；Europe PMC无全文/需订阅，无完整表图和SI。

## Tb2ee6eda0 · Exacerbated interfacial impacts of nanoplastics and 6:2 chlorinated polyfluorinated ether sulfonate by natural organic matter in adult zebrafish: Evidence through histopathology, gut microbiota, and transcriptomic analysis

DOI：10.1016/j.jhazmat.2024.135038；阅读：abstract；用途：direct。

资格决定：direct：NP+F53B支路存在，NOM四组分结果单独列；摘要级资格和结果不能替代全文质量评估。

与第一轮对照：第一轮未纳入。补充成鱼NOM条件变化和21d肝肠证据；加强“环境基质与阶段须单列”并限制以菌群/转录组宣称已证明机制。

### 实际阅读过程

- [阅读PubMed完整作者摘要](https://pubmed.ncbi.nlm.nih.gov/38941840/)：确认21d、80nm、四组分M以及两组分ANF等支路。 定位：Abstract。
- [访问出版商全文页面](https://www.sciencedirect.com/science/article/pii/S0304389424016170)：403；检索可读Highlights，不含完整方法/结果。 定位：入口/摘要。
- [尝试出版商摘要页面](https://www.sciencedirect.com/science/article/abs/pii/S0304389424016170)：403，无完整正文。 定位：入口/摘要。
- [精确PMID调用Europe PMC core API核对作者摘要与全文可用性](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID%3A38941840+AND+SRC%3AMED&resultType=core&format=json)：HTTP 200；inPMC=N，inEPMC=N，OA=N，仅列需订阅DOI。 定位：本轮API收据见reading-a-api-receipts.json。
- [定向查询合法机构作者稿](https://doi.org/10.1016/j.jhazmat.2024.135038)：未发现可确认公开全文；非等同不存在全文。 定位：入口/摘要。

### 提取的设计与证据

- model：成体斑马鱼，肝/肠组织病理、菌群和转录组
- stage：adult，性别/鱼龄未知
- particles：80 nm PS-NP，1 mg/L
- chemicals：F-53B 200 μg/L；HA和BSA各10 mg/L
- doses：见上；属作者称低水平，环境代表性未由本轮数据独立核验
- duration：21 d
- groups：AN(NP)、AF(F53B)、ANF(NP+F53B)、M(NP+F53B+HA+BSA)，并有control；完整析因矩阵未知
- replication：缸重复、样本合并方式未知
- statistics：摘要p值与转录组DEG数；正式交互模型及多重检验阈值未知
- 作者报告：含HA+BSA的四组分M组相对NP、F53B及两者组合出现更强肝肠组织损伤及氧化应激相关响应。 [Abstract，第2–4句](https://pubmed.ncbi.nlm.nih.gov/38941840/)；证据层级：作者摘要级比较。
- 作者报告：菌群和转录组随处理变化；本次判断这些是机制关联线索，尚不能证明菌群改变导致肝损伤。 [Abstract，microbiota/transcriptomic段](https://pubmed.ncbi.nlm.nih.gov/38941840/)；证据层级：结果为作者报告；因果限制为本次判断。

### 局限

- 未取得全文和SI，不能核对缸重复、实际内剂量、随机化/盲法或组织定量方案。
- HA+BSA一并加入，不能从M组差异拆出HA与BSA各自作用。
- 不能把DEG数量直接排序为毒性大小；富集和菌群相关不等于因果。
- 与同团队生态冠论文存在方法/作者关联，不能声称完全独立复现。

独立性：与Liu2024生态冠胚胎论文作者部分重合，成鱼21d与早期7d是不同设计；原始样本独立性未核定。

全文尝试：出版商抓取403，Europe PMC无全文并列需订阅；未找到可确认机构作者稿。
