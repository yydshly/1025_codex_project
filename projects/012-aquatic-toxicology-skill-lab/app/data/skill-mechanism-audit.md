# Skill怎样工作：目录、搜索、来源、遗漏与场景

固定源码与已有执行产物审计；未新增科学检索、重跑API或执行其他Skill。

日期：2026-10-29；固定提交：`b8d050f24f2e1c465c4410eace8634ea3af15930`。

把‘用了Skill’拆成可核对的动作：先认清5个工作流入口，再看主题如何变成检索式、实际用哪些来源，以及哪些检查能够发现漏检和误读。水生毒理学是本轮执行案例。

这里分别展示原始规范、程序实现和本轮执行。AI仍负责选择与理解；数据库权限、读取深度及外部验证决定我们能作多强的判断。

## 先分清四层

- **5个顶层Skill**：选择做研究、筛文献、写论文、审稿或管理全流程。 本轮：本轮装了4个；安装、选读规则、完整运行分别记录。
- **内部代理角色**：模型按角色说明执行拆题、书目、核查和综合；deep-research列出13个角色。 本轮：本轮由Codex主会话与子代理分工，不是13位独立专家。
- **程序工具**：API客户端、检索适配器与记录处理代码，负责具体可重复的操作。 本轮：本轮跑了Crossref和S2身份核验；其他代码存在不等于已用。
- **宿主与数据源**：模型、网页搜索、页面读取、数据库接口和访问权限决定实际能取到什么。 本轮：本轮主题发现靠宿主网页搜索，随后读取PubMed、PMC和出版商内容。

## 五个顶层Skill

### deep-research｜从主题到研究问题与证据综合

澄清研究问题，设计方法，检索与核查来源，跨文献综合并形成报告。 输入：模糊方向、明确研究问题、待核查论断或一组待研究材料。 产物：问题与范围、方法方案、书目与来源核查、证据矩阵和综合、报告与审查记录

已安装；主会话和子代理实际采用其中的问题、方法、书目、核验、综合、报告和审查角色规范，进行了有边界适配。未完整执行原生full流程。 边界：不提供自有文献数据库；搜索质量取决于实际工具、检索策略、访问范围和执行情况。

[deep-research/SKILL.md · v2.12.1](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/SKILL.md#L124)

### sr-screener｜对已有检索记录做有规则的筛选

按确认的纳入排除标准筛选题名摘要与全文，保留分歧、排除理由和筛选计数。 输入：研究方案或纳入标准，以及RIS、PubMed .nbib、Web of Science、CSV导出记录或全文。 产物：筛选协议、双AI决定与第三方裁决、种子和近似排除复查、与研究团队pilot标签的对照、PRISMA计数和文献集交接

本轮未安装、未执行。此次只从固定ZIP读取其原始SKILL说明，用于解释能力边界。 边界：可以发现已经获取的记录在筛选阶段被漏掉或误排；不能据此证明搜索阶段没有漏掉未进入记录集的论文。原文也明确同一模型的两次判断可能共享误读。

[sr-screener/SKILL.md · v1.0.0](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/sr-screener/SKILL.md#L18)

### academic-paper｜将已有证据组织成论文及修订材料

组织论文结构、论证、正文、引用与格式，或对已有稿件进行修订和回复检查。 输入：问题、可信文献、作者材料、真实实验结果或已有稿件与审稿意见；具体输入随模式变化。 产物：大纲和论证结构、论文草稿、修订路线图、引用检查与AI使用披露、依环境可用工具生成排版产物

已安装，选读了写作质量等参考规范；没有运行其完整论文撰写工作流。本轮研究报告由deep-research的report_compiler角色规范适配完成。 边界：写作不能补造未做的实验、缺失的数据或未经核查的机制；篇章完整不等于科学证据充分。

[academic-paper/SKILL.md · v3.3.1](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/academic-paper/SKILL.md#L3)

### academic-paper-reviewer｜按准则审查已有稿件

围绕期刊适配、方法、领域和核心论证组织多视角审查，并回查修订。 输入：待审稿件及适用的目标期刊、研究设计或评价准则。校准模式另需gold set。 产物：角色分开的审查意见、编辑决定和修改路线图、定点再审、校准候选产物

已安装，借用了经验研究评价准则参考；没有运行五席审查面板。此次5项复核来自deep-research审查角色的有边界合并适配。 边界：原文明确角色分离不代表错误过程独立；live review仍为NOT_CALIBRATED。不能把AI评审意见当独立专家结论。

[academic-paper-reviewer/SKILL.md · v1.11.1](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/academic-paper-reviewer/SKILL.md#L3)

### academic-pipeline｜调度研究、写作、审查和修订

识别项目阶段，选择并派发其他Skill，管理状态、交接、检查点和诚信核查。 输入：端到端论文目标，或已有研究/稿件/审稿意见及当前进度。 产物：阶段状态、跨Skill交接、诚信检查记录、修订追踪、过程记录

已安装并核对执行边界；没有启动原生编排器、完整Material Passport或正式机器诚信闸门，未完成其十阶段流程。 边界：原文说明它是轻量调度器，本身不执行实质研究。它的十阶段也不是十个新Skill。

[academic-pipeline/SKILL.md · v3.24.0](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/academic-pipeline/SKILL.md#L19)

## 从主题到搜索

### S01 先把主题变成可检索的问题

- **输入**：用户只给出水生毒理学方向，没有实验数据或明确论文问题。
- **上游规则**：拆主题、生成候选问题，明确研究对象、范围和子问题；方法角色选择数据库、时间、数据与有效性标准。
- **实际动作**：把宽泛的水生毒理学暂定为斑马鱼—微/纳塑料—PFAS共暴露比较。该范围由AI选择，仍是provisional，不是研究者已确认题目。
- **具体例子**：水生毒理学 → 斑马鱼 × 微/纳塑料 × PFAS。再限定比较对象为同条件PFAS单独暴露。该收窄由AI选择，尚待作者确认。
- **产物**：RQ Brief、方法计划、纳入排除条件和提取字段。
- **限制**：这只是所选子题，不是整个水生毒理领域的完整图景。

[主题拆分、范围与子问题](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/research_question_agent.md#L47)；[数据策略与分析有效性](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/research_architect_agent.md#L87)；[本轮方法计划，不冒充已执行](./methodology.md)

### S02 拟定检索源与检索式

- **输入**：暂定的研究问题、纳入排除条件、可用搜索工具和访问权限。
- **上游规则**：先填写数据库、关键词与同义词、布尔组合、时间、语言和文献类型；逐数据库记录日期与命中数。DATABASES是需要填的字段，并非已接通的服务清单。
- **实际动作**：本轮采用宿主web.run网页搜索，包含广泛关键词查询、窄组合和已知题名/DOI定位；没有运行原生PubMed、WoS、Scopus或Google Scholar主题检索。
- **具体例子**：Q01：zebrafish PFAS microplastics nanoplastics PFOS PFOA coexposure toxicity。随后有PFOS/PFOA窄组合，也有题名/DOI定位；选词与迭代由AI按规则完成。
- **产物**：37条有日期和用途说明的网页查询；不具备数据库全量命中或筛选分母。
- **限制**：37条是查询动作数，包含已知论文定位；无法当覆盖率。原生PubMed/WoS/Scopus主题检索没有执行。

[检索参数、逐库执行记录](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L56)；[实际渠道、读取范围、停止边界](./search-log.json)

### S03 筛选、去重、标记实际阅读范围

- **输入**：网页返回的候选记录和可访问的原始页面。
- **上游规则**：按预先标准进行题名/摘要和全文两轮筛选；S2 ID辅助去重，服务不可用时降级；没有正文不得推断方法缺陷。
- **实际动作**：以DOI/题名折叠重复记录，区分10篇核心、2篇背景和2份方法资料；核心阅读是8篇摘要、2篇部分章节、0篇全文。完整第二轮全文筛选未完成。
- **具体例子**：Q08只搜“41027221”得到无关数字记录，未作证据。Q24用P09的精确DOI加site:pubmed.ncbi.nlm.nih.gov定位题录。这两个查询对应不同论文，不是同一论文的连续重试。
- **产物**：文献矩阵、阅读范围与15个遇到的排除候选；这15个不是全量排除总数。
- **限制**：未完成上游要求的第二轮全文筛选。摘要级记录只能作受限线索；15个排除候选不是全部检索结果的筛选分母。

[两轮筛选与S2去重](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L75)；[方法弱点与阅读范围约束](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L143)；[实际渠道、读取范围、停止边界](./search-log.json)；[实际复核范围和未决项](./source-verification.md)

### S04 验证已找到的论文身份

- **输入**：已经找到的12篇论文的DOI和题名；不再是宽泛主题。
- **上游规则**：DOI优先解析，题名检索作后备；书目身份匹配和论断核实是不同任务，服务降级需记录。
- **实际动作**：本地adapter调用未改写的两份原始客户端，对12篇已收集论文做实时网络请求。Crossref匹配12条；S2匹配P03/P09，10条429重试耗尽。
- **具体例子**：Crossref匹配12/12；S2匹配P03、P09，其他10条因429不可用。失败如实保留，不写成论文不存在。原始时间和逐条状态可下载。
- **产物**：逐篇状态、时间、请求和返回元数据；没有由此得到全文、漏检率或科学结论正确率。
- **限制**：题录真实不等于论断被原文支持；这个动作没有检查尚未找到的论文，也没有阅读全文。

[引文存在性核验与降级](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/source_verification_agent.md#L107)；[S2 DOI核验和题名前5后备](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/semantic_scholar_client.py#L244)；[Crossref DOI核验和题名前5后备](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/crossref_client.py#L174)；[本轮真实客户端adapter](./verify-citations.py.txt)；[最终实时核验状态](./programmatic-verification-summary.md)

### S05 检查覆盖信号并保持未知项

- **输入**：问题的子主题、文献分布、未决项和当前阅读深度。
- **上游规则**：已有用户文献时比较RQ子主题和已覆盖主题并补缺；检查年份、地域、方法、期刊等分布偏斜；报告检索局限。
- **实际动作**：记录了核心论文集中在2024—2026年、实验研究和Elsevier期刊的偏斜，以及P06比较方向、P10救援模型归属等未知。没有独立已知论文测试集，也没有完整前后向引文追踪回执。
- **具体例子**：核心样本10/10发表于2024—2026，8/10在Elsevier期刊，10/10为实验研究；这是需要解释的集中分布。P06逐终点方向、P10救援模型归属继续留为未知。
- **产物**：局限和后续核查事项；没有生成可信的总体覆盖率。
- **限制**：本轮在10篇核心、2篇背景后按任务规模停止，没有通过独立漏检测试。没有得到总体召回率或理解准确率。

[非阻断分布偏斜提示](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L104)；[用户文献优先和search-fills-gap](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L180)；[实际渠道、读取范围、停止边界](./search-log.json)；[实际复核范围和未决项](./source-verification.md)

## 来源和工具：建议、实现、执行分开

### 宿主网页搜索（实际使用）

- 能力：按关键词发现网页与论文线索，随后由AI选取、筛选和读取。
- 访问：Codex当时提供的web.run搜索工具；不是该库自建的搜索引擎。
- 本轮：37条正式查询＋5条补查。包括主题发现、题名定位、DOI核对和方法资料搜索；不能全部算作扩展覆盖。

[实际渠道、读取范围、停止边界](./search-log.json)

### PubMed / PMC / 出版商（实际访问；深度受限）

- 能力：PubMed提供题录和摘要；PMC提供开放文章；ScienceDirect、RSC等提供出版商内容。
- 访问：网页搜索后读取官方页面或可见搜索内容。site:pubmed…的域名限定不等于原生数据库检索。
- 本轮：核心8篇摘要、2篇部分章节、0篇全文审读。部分ScienceDirect、RSC全文请求403，未绕过访问限制。

[实际复核范围和未决项](./source-verification.md)

### Crossref / Semantic Scholar（实时身份核验）

- 能力：输入已知DOI/题名，检查返回的题录是否对应；支持题名后备匹配。
- 访问：本地适配器调用原始CrossrefClient和SemanticScholarClient。题名后备只取少量候选，非主题穷尽搜索。
- 本轮：12篇都尝试。Crossref匹配12；S2匹配2，另外10条429不可用。没有因此增加全文读取深度。

[最终实时核验状态](./programmatic-verification-summary.md)

### OpenAlex / arXiv / 中文引文核验（本轮未运行这些客户端）

- 能力：按已知论文坐标解析题录。中文核验协议另有注册机构和PubMed坐标分支。
- 访问：需由运行环境实际调用各客户端，满足其网络与输入条件。
- 本轮：曾遇到OpenAlex题录网页线索，但未运行OpenAlexClient；arXiv和中文核验客户端均未运行。

[OpenAlex已知题录核验](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/openalex_client.py#L190)

### 四索引关键词发现代码（本轮未运行）

- 能力：claim_standing_discovery.py实现S2、OpenAlex、Crossref、arXiv的关键词候选发现。
- 访问：输入单独的query plan；单页、有返回上限，不自动穷尽翻页；不负责判定相关性或结论立场。
- 本轮：不参与本轮37条查询。固定源码自述该实现当时尚未live验证，不能当成熟覆盖检测器。

[单独的关键词发现路径；单页上限见370行附近](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/claim_standing_discovery.py#L1)

### WoS / Scopus / Scholar / CNKI等（没有原生主题检索回执）

- 能力：原始资料按情境讨论跨库补查、中文来源和引文监测；bibliography的DATABASES字段由执行者填写。
- 访问：依赖账号、订阅、接口和宿主能力。Skill里出现数据库名称不会自动接通数据库。
- 本轮：本轮未原生执行这些数据库的主题检索，也未设置持续监测。不能把建议清单当实际搜索范围。

[WoS、Scopus、Scholar、S2引文追踪](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/references/literature_monitoring_strategies.md#L157)

## 怎样发现遗漏和误读

### 同义词、布尔组合与范围声明（部分执行）

- 风险/机制：扩大概念表达覆盖并公开时间、语言、文献类型限制。
- 上游：上游明写。检索式写得详细不等于所有相关研究都被命中。
- 本轮：部分执行：多种关键词及窄组合已记录，核心实际仅英文；没有全量数据库导出。
- 下一步验证：先由研究者确认问题边界；按实际数据库语法检查同义词、字段、时间和语言限制，保存完整结果。

[检索参数、逐库执行记录](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L56)；[实际渠道、读取范围、停止边界](./search-log.json)

### 用户文献先筛，再按未覆盖子主题补查（条件流程未运行）

- 风险/机制：uncovered_topics = RQ子主题减去用户文献已覆盖主题；不可静默跳过用户文献，若用户限定仅用自己的库则公开缺口。
- 上游：上游明写，存在输入条件。主题已被若干论文覆盖，不代表该主题全部研究都已找到；分主题本身仍可能遗漏。
- 本轮：未按Material Passport流程运行：本轮用户没有交付完整个人文献库。
- 下一步验证：如果使用个人文献库，先清点输入记录与子主题；对未覆盖项单列补查，不用‘主题已有一篇’推断查全。

[用户文献优先和search-fills-gap](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L180)；[本轮方法计划，不冒充已执行](./methodology.md)

### 分布偏斜提示（已记录；非查全证明）

- 风险/机制：已知条目的某一属性值占比达到70%时提示年份、地域、方法或期刊等集中。分母是该维度有已知值的known_N。
- 上游：上游明写，非阻断提示。分布均衡不证明没有漏文献；集中也可能正是题目限定的结果。
- 本轮：本轮已记录年份、实验设计与出版商集中；没有把集中等同质量差。
- 下一步验证：解释集中是否源于题目；必要时扩充年代、语言、数据库或文献类型，并记录新增结果。不能为了均衡而纳入不相关论文。

[非阻断分布偏斜提示](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L104)；[实际渠道、读取范围、停止边界](./search-log.json)

### 多索引核验与去重（已运行；仅身份核验）

- 风险/机制：多源核查已找到论文的身份、减少重复题录和虚构引文。
- 上游：上游明写，原始代码部分运行。12/12题录匹配只说明这些记录身份得到支持；没有测试未找到的论文。不能当召回率100%。
- 本轮：DOI去重已做；S2/Crossref已运行，S2大部分请求不可用。
- 下一步验证：保留未核验状态并在服务可用时补查。另行做主题发现的覆盖测试，不将身份核验成功率当召回率。

[两轮筛选与S2去重](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L75)；[引文存在性核验与降级](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/source_verification_agent.md#L107)；[最终实时核验状态](./programmatic-verification-summary.md)

### 独立已知论文测试集（未执行独立测试）

- 风险/机制：从独立综述/专家清单收集确定合格的论文，测试主题检索式是否找回并分析漏检原因。
- 上游：本轮后续建议；未在所审bibliography主流程中发现自动实施机制。即使测试集全部找回，也只证明通过该样本；总体分母仍未知。
- 本轮：未执行。现有题名或DOI定位不能充当独立测试。
- 下一步验证：另取独立来源的合格论文清单测试原始主题检索式，逐条解释漏检；测试集找回比例仅适用于该样本。

[实际渠道、读取范围、停止边界](./search-log.json)

### 完整数据库筛选与前后向引文追踪（未完成全量追踪）

- 风险/机制：保存各库结果，去重筛选；对关键文献的参考文献和被引文献进行有记录追踪，记录新增合格文献。
- 上游：本轮方法计划包含追踪；上游监测资料另有引文追踪指导。数量目标或重复遇到已知论文不是充分覆盖的证明，也不能据此说无人做过。
- 本轮：没有完整原生数据库筛选分母和追踪回执；本轮在10篇核心、2篇背景后按委派规模停止。
- 下一步验证：保存逐库导出、去重和筛选记录；追踪关键论文的参考文献与被引文献，公开新增研究及停止依据。

[WoS、Scopus、Scholar、S2引文追踪](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/references/literature_monitoring_strategies.md#L157)；[本轮方法计划，不冒充已执行](./methodology.md)；[实际渠道、读取范围、停止边界](./search-log.json)

### 区分搜索漏检与筛选误排（未运行sr-screener）

- 风险/机制：论文根本没进入候选集，与已取得的论文被误排，是两类风险。
- 上游：sr-screener提供种子、近似排除复查与pilot标签对照，检查已得到记录的筛选过程。它不能检查自己从未收到的全部论文。
- 本轮：本轮未安装、未运行sr-screener；原ZIP中的能力说明不算执行成绩。
- 下一步验证：完整导出记录后，确认筛选标准，以人工标注的pilot样本测试，并核查排除及批次计数。

[sr-screener/SKILL.md · v1.0.0](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/sr-screener/SKILL.md#L18)

### 核对理解、推断与原文支持（局部复核；关键项待核）

- 风险/机制：误读对照、单位、实验模型，把作者推断升级成因果，或将不同研究的终点直接拼接。
- 上游：原始角色要求标明读取范围、定位依据，不能在仅读摘要时推断方法缺陷；复核角色负责质疑与修订。
- 本轮：P06逐终点方向未知、P10救援模型归属未知；同类AI复核改了5处问题。没有独立盲提取、人工领域复核或准确率测量。
- 下一步验证：取得关键全文与补充材料，逐条记录图表/页码、处理与对照、剂量、效应和统计；由第二位审核者独立提取，记录并解决分歧。

[方法弱点与阅读范围约束](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L143)；[实际复核范围和未决项](./source-verification.md)

## 场景路由

### 我想做水生毒理学，但还没有明确题目（本轮只做了暂定收窄）

路径：deep-research / socratic → research_question_agent → research_architect_agent

- 澄清关注的污染物、物种、终点、已有条件和目标
- 提出几个边界清楚的问题并与作者讨论
- 选择一个问题后形成检索与提取方案

产物：候选研究问题、选择依据、范围和方法计划。

本轮边界：本轮由AI先选了斑马鱼/微纳塑料/PFAS作为演示案例；没有完成与作者逐步确认的socratic流程，具体题目仍是暂定。

### 我想知道微纳塑料与PFAS共暴露已有研究做到了什么（本轮实际采用的任务类型）

路径：deep-research / lit-review 或明确问题下的full → bibliography_agent → source_verification_agent → synthesis_agent

- 按物种、颗粒、化学物种与共暴露概念构造检索
- 记录实际来源、查询、访问失败、去重和排除理由
- 以匹配对照和逐终点结果建立证据表
- 比较已有前作、反向结果和未决项

产物：检索日志、分层书目、证据矩阵和有边界的研究现状。

本轮边界：实际做了这一类探索性调查；37条正式网页查询，10篇核心记录，8篇摘要/2篇章节片段/0篇全文审读，不是完成原生full或系统综述。

### 我已经从数据库导出一批文献，哪些符合我的综述（用法示例；本轮未执行）

路径：sr-screener / protocol → pilot → ta-screen → ft-screen → adjudicate → audit / report

- 确认纳入标准并解析导出记录、去重
- 用种子研究及团队独立标注样本做pilot
- 分别作出筛选决定，保留冲突并裁决
- 复查近似排除和随机样本，导出逐条理由与计数

产物：可追溯筛选决定、QC、排除理由和筛选流程计数。

本轮边界：未执行；不能用已有15个遇到的排除候选冒充完整筛选，也不能用37次网页查询冒充导出记录总数。

### 我担心这个选题别人已经做过（本轮做了部分定向核查）

路径：deep-research（定向前作任务，非独立模式） → source_verification_agent → synthesis_agent → devils_advocate_agent

- 拆分拟创新点对应的对象、暴露、终点、方法和机制
- 寻找最接近的原始论文，逐项比较
- 检索支持与反对新颖性判断的前作
- 对未覆盖来源和未取得全文保持未决状态

产物：最近前作对照表，以及在已记录范围内发现了什么、尚未确认什么。

本轮边界：P03已报道阶段相关方向转换和TK/TD内容，因此不能把这些宽泛表述直接当成新颖性；没有认证任何方向为首次。

### 我已有真实实验结果，需要写论文并改稿（用法示例；本轮未执行）

路径：academic-paper / plan 或full → academic-paper-reviewer / full 或methodology-focus → academic-paper / revision → academic-paper-reviewer / re-review

- 核对作者材料和证据需求
- 形成大纲和论证，再写入已有结果
- 按适用准则找问题并列修订计划
- 回查每项修改是否落实

产物：稿件、审查意见、修订路线图及回查记录。

本轮边界：没有作者原始实验结果，不适用实证论文结果撰写；本轮只形成文献调查报告。

### 我要从研究主题一路推进到论文定稿（用法示例；本轮未执行）

路径：academic-pipeline → deep-research → academic-paper → 诚信核查阶段（非新Skill） → academic-paper-reviewer → 修订与再审

- 判断起点和缺失材料
- 按阶段派发工作并保留交接状态
- 执行声明范围内的诚信核查和作者检查点
- 完成修订追踪和过程记录

产物：贯穿多个Skill的项目状态和阶段产物。

本轮边界：本轮没有启动原生端到端编排。不能将网页的七步过程导览称为完整十阶段pipeline的完成回执。

## 解释边界

检查一个Skill时，逐项追问：接收什么输入、规定谁做什么、实际调用哪个工具和来源、怎样发现失败、留下什么证据。覆盖测试与逐条原文核验应有自己的执行记录，不能由流程说明代替。

本次未运行的功能仅依据固定源码说明，不代表经过端到端实测；角色分工不代表独立专家评审。
