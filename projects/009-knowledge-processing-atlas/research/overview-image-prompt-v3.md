# 引导图第三版

使用 Codex 内置 imagegen，以第二版为参考重新组织研究逻辑。成品：[research-overview-v3.png](../assets/images/research-overview-v3.png)。图像是研究整理，不是上游实验结果。网页公开图片与此文件逐字节一致。

## 提示词

```text
Use case: infographic-diagram. Substantially revise the reference research infographic into ONE comprehensive, extremely crisp Chinese editorial guide poster, portrait 2:3, ideally 2048x3072 or higher resolution, designed for full-size zoom reading. Keep the warm ivory, deep forest green and terracotta design language. Redesign the hierarchy to clearly tell the research story and practical value, rather than merely list names. Reduce decorative icons, use legible dark typography and generous rows, no microscopic text. Every named tool below must appear accurately. Copy exact text below without inventing performance numbers or adding unsupported claims. Layout five numbered full-width sections.
TITLE: '从资料到可核验的 AI 能力'; subtitle '研究起点 · 技术分工 · 具体价值 · 验证计划'.
01 '为什么研究？' Three compact product cards: 'DeepTutor：自建学习工作台'; 'NotebookLM：托管资料问答'; 'RAGFlow：解析检索平台'. Below: '建库耗时、功能重叠：新增收益是否值得？' Small conclusion: '关注度不等于活跃用户；集成深度不等于算法创新'.
02 '底层原理：各自解决什么？' Table-style rows with all these exact texts:
'读出文档' — 'MinerU：版面与公式｜Docling：结构与表格' and 'PaddleOCR：文字与坐标｜olmOCR：视觉页面转文本'.
'找到证据' — 'BGE-M3：稠密与稀疏表示｜ColBERT：词元级匹配' and 'Qdrant：向量与条件过滤｜OpenSearch：关键词与向量' and 'PageIndex：章节树导航'.
'关联变化' — 'Graphiti：事件与有效时间｜GraphRAG：社区摘要与全局主题'.
'学习建模' — 'OATutor：按掌握度选题｜pyBKT：贝叶斯追踪' and 'pyKT：模型评测｜Tutor MCP：教学与复习工具'.
'研究评估' — 'STORM：多视角提问｜OpenResearcher：研究轨迹与训练' and 'Ragas：检索与回答评估'.
'补充工具' — 'LlamaIndex：数据编排｜LightRAG：图与向量检索' and 'SQLite FTS5：全文基线｜Pyserini：检索实验' and 'OmniDocBench：文档解析评测'.
03 '本质与边界' Three short parallel statements: '原文是依据，索引是可重建的查找工具'; '检索模型 ≠ 数据库；相似 ≠ 事实；索引 ≠ 训练'; '模型决定生成上限，解析与召回决定证据是否到场'.
04 '对我们的具体价值' Three scenario cards: '论文与教材：查表格、解释概念、返回页码'; '个人记录：找回旧事、梳理变化、追溯原文'; '学习与研究：练习反馈、复习安排、带证据的专题整理'. Below: '先比较全文与关键词基线，再决定是否增加向量或图谱'.
05 '后期如何演示验证？' Four numbered rows: '1 虚构 PDF：对照文字、表格、顺序与页码'; '2 标注问题：比较关键词、语义、章节与来源召回'; '3 时间事件：核对过去与现在、关系与原文'; '4 同样本评估：人工核验，记录耗时、成本与失败'. Closing small line: '教学与研究训练按需扩展，不预设全部安装'. FOOTER: '公开资料研究｜原理与规划示意｜上游项目尚未安装或实测'.
Do not omit the practical-value section or replace it by generic slogans. Treat NotebookLM as a hosted product, Qdrant as a database, BGE-M3 as a model; these are complementary layers. Do not draw a mandatory pipeline requiring every tool. All text inside canvas, faithful Chinese spelling, correct Latin spelling, high contrast, no watermarks.
```
