# 检索环节归属审计

**三个检索脚本是本案例由 AI 新写的适配代码，不是原 skill 自带脚本。** 原库也不只有提示词：它同时包含检索规范、引文核验客户端，以及另一条真实的文献发现代码路径。此前网页把这些与本案例适配成果连续呈现，容易让人误以为都是原库直接完成的。

审计对象固定为 [`b8d050f`](https://github.com/Imbad0202/academic-research-skills/tree/b8d050f24f2e1c465c4410eace8634ea3af15930)。核对了本地[原始文件清单](upstream-manifest.json)（1,106 项）与原始 ZIP（仅本地保留，不随公开仓库提交），ZIP SHA256 为 `b602ba6aecf3bb142520564a65e29c503c6d63e083a5ee318b9415213c8edafd`。以下是静态归属审计，没有重新联网检索或重跑科研。

| 内容 | 原库提供什么 | 本案例实际如何使用 |
|---|---|---|
| 检索策略与筛选规范 | 要求列出数据库、关键词及同义词、布尔式、时间/语言/类型，记录各源命中数，先题目摘要再全文筛选。[原文 L56](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L56) | 由 AI 阅读规范，结合水生毒理学问题制定具体方案。原文没有直接给出本案例的三组词、具体查询式或三源组合。 |
| 遗漏与局限提示 | 有已给语料的主题缺口补搜、分布偏斜提示、检索局限报告。[主题缺口 L214](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L214)、[偏斜 L104](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/agents/bibliography_agent.md#L104) | 本例另外设计了五篇基准、去掉物种条件、引用追踪、别名/词根修复等实测检查；不能把这些具体动作说成原 skill 自动执行的内置完整性验证。 |
| 已知引文的身份核验代码 | 有原生 SemanticScholarClient、CrossrefClient、OpenAlexClient、ArxivClient，用 DOI/ID 或题名查询并交叉核对题名。[S2 L244](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/semantic_scholar_client.py#L244)、[Crossref L174](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/crossref_client.py#L174)、[OpenAlex L190](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/openalex_client.py#L190)、[arXiv L177](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/arxiv_client.py#L177) | 第一轮确实由新增的 [verify-citations.py](../scripts/verify-citations.py#L15) 导入并运行原 S2/Crossref 客户端；未运行原 OpenAlex/arXiv 客户端。结果是 Crossref 12/12 匹配，S2 2/12 匹配、10/12 不可用（429）。这是引文身份核验，不是主题查全。 |
| 原生文献发现代码 | `claim_standing_discovery.py` 有 S2、OpenAlex、Crossref、arXiv 搜索适配器；属于另一个 claim-standing 流程，有结果上限，不输出相关性或立场判断。文件头还明确称这些适配器在该版本尚未实网运行。[边界 L2](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/claim_standing_discovery.py#L2)、[四源 L397](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/claim_standing_discovery.py#L397) | 本案例没有运行它，不能把它算成本轮主题采集的执行引擎，也不能说原库没有检索代码。 |
| 原有 PubMed 使用 | 中文引文客户端有“已知无 DOI 引文”的期刊/年份/卷页坐标查找及后续身份核验。[协议 L85](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/deep-research/references/chinese_literature_api_protocol.md#L85)、[代码 L1049](https://github.com/Imbad0202/academic-research-skills/blob/b8d050f24f2e1c465c4410eace8634ea3af15930/scripts/chinese_literature_client.py#L1049) | 本例未调用。它与“输入水生毒理学主题，批量搜索论文”的新 PubMed 采集器不同。 |

## 三个新增采集器具体做了什么

| 本案例新增文件 | 技术与动作 | 原 ZIP / 清单中存在？ |
|---|---|---|
| [retrieve-pubmed.py](../scripts/retrieve-pubmed.py#L29) | Python 标准库 HTTP 请求；NCBI ESearch 搜索主题得到 PMID，再 EFetch 批量取 XML 题录/摘要，保存查询翻译、原响应和回执。 | 否 / 否 |
| [retrieve-europepmc.py](../scripts/retrieve-europepmc.py#L25) | Europe PMC REST，`TITLE_ABS` 查询，`resultType=core`，`cursorMark` 翻页；归一化题录/摘要并保存原响应和回执。 | 否 / 否 |
| [retrieve-openalex.py](../scripts/retrieve-openalex.py#L30) | 独立调用 OpenAlex works API；主题搜索、基础分页、摘要倒排索引重建，另做一跳前向/后向引用追踪。 | 否 / 否 |

**同样使用 OpenAlex 数据源，不等于复用了原 OpenAlexClient。** 新采集器自己发 HTTP 请求，未导入该客户端。`verify-citations.py` 也不在原 ZIP；它是调用原 S2/Crossref 代码的新增包装层，不能把包装层和被调用原代码混为一谈。

AI 还新增了[词表与方案冻结](../scripts/freeze-retrieval-plan.py#L13)、查询修订、跨源合并、机械初筛、漏检诊断、基准比较和网页导出；AI 复核由本案例组织，不是原库完整原生筛选流程的运行证明。原文的“题目摘要 → 全文”要求与本例完成度也要分开：本例主要做到候选题录/摘要筛选，保留条目尚不等于全文评估通过。

## 结果应该归给谁

[本轮报告](retrieval-trial/report.md)中的 **984 个合并候选、17 个保留、51 个待定，以及基准 3/5 → 4/5 → 5/5**，属于“原 skill 规则 + AI 的领域判断和协调 + 新增 API 适配与检查”的组合实测结果。它们不是原库开箱即用性能，也不是原库相对直接问 AI 的增益证据。

五篇基准参与了后续词表修复，5/5 是对已见基准的回归找回，不是独立留出验证，更不是全领域 100% 查全率。没有运行同条件的“有 skill / 无 skill”对照，因而无法量化原 skill 单独贡献了多少。真正可直接归给原库的是上面的规范和确实运行过的原客户端；真实 API 数据由外部数据库提供；本例的领域词表、适配、实验设计和结果由本例实施过程产生。
