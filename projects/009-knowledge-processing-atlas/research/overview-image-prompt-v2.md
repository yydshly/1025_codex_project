# 研究总览图第二版生成记录

使用 Codex 内置 imagegen 工具，以 [第一版图片](../assets/images/research-overview.png) 为参考生成扩充版本，再进行一次文字纠正。最终图片为 [research-overview-v2.png](../assets/images/research-overview-v2.png)。图是研究与计划示意，不是对上游项目的实测。

## 扩充提示词

```text
Use case: infographic-diagram. Edit and expand the referenced finished Chinese research infographic into ONE new, complete portrait-format research map. Preserve its elegant deep forest green, warm ivory, terracotta visual identity, refined Chinese editorial typography, and clean structured layout, but redesign the content to be more comprehensive. Output one tall, high-resolution poster with wide margins and LARGE legible Chinese and Latin text. This must be a comprehensive concise research atlas, not a mockup or photograph. Include all 21 names correctly, clearly distinguish categories, and keep explanations concise so that all text is readable at original resolution. Exact text to display in Chinese, no other tiny placeholder text:
TITLE: '从资料到 AI 理解' with subtitle '研究对象 · 底层原理 · 价值与验证'.
SECTION 01 '目标与相关应用': three items 'DeepTutor｜学习工作台', 'NotebookLM｜托管资料问答', 'RAGFlow｜解析检索平台'.
SECTION 02 '底层库：原理与区别': use six clean horizontal category rows, exact labels and their short meaning; use consistent two-column list per row:
'文档解析' → 'MinerU｜版面与公式' · 'Docling｜结构与表格' · 'PaddleOCR｜文字识别' · 'olmOCR｜页面转文本'
'表示与检索' → 'BGE-M3｜语义表示' · 'ColBERT｜词元匹配' · 'Qdrant｜向量数据库' · 'OpenSearch｜混合检索' · 'PageIndex｜章节导航'
'关系与时间' → 'Graphiti｜事件与时间' · 'GraphRAG｜全局主题'
'学习建模' → 'OATutor｜自适应练习' · 'pyKT｜知识追踪评测' · 'pyBKT｜贝叶斯追踪' · 'Tutor MCP｜教学引擎'
'研究与评估' → 'STORM｜多视角研究' · 'OpenResearcher｜研究轨迹训练' · 'Ragas｜检索回答评估'.
SECTION 03 '对我们的价值': exact three lines '读对资料：保留文字、结构与原文位置'; '找对证据：对照关键词、语义与章节'; '理解变化：区分事件时间、来源与推断'. Include small clear boundary line '索引不是训练；相似不等于事实；图谱需要核验'.
SECTION 04 '后续演示计划': exact three short steps '01 虚构 PDF → 验证文字、表格与页码'; '02 虚构记录 → 比较关键词与语义检索'; '03 时间事件 → 核对关系、原文与变化'. Small footer '公开资料研究｜未安装 · 未实测｜计划待实施'.
All 21 named tools must appear correctly at least once with their correct category and concise individual purpose. NotebookLM is a hosted service, not an open source project. Treat Qdrant as a database, not an embedding model. The educational model libraries are separate from document parsing. Do not invent benchmarks or performance claims. Typography must not be fake Chinese or random symbols. Keep all poster text within the canvas and readable; reduce decorative icons to reserve room for content. Do not use arrows suggesting a mandatory pipeline.
```

## 定向文字修正提示词

```text
Make ONLY two precise text corrections to this exact Chinese infographic, keeping all remaining pixels, project names, layout, icons, background, typography, colors and resolution exactly as they are. First, in section 02, the OATutor card currently says under '自适应练习' two lines '根据资料生成' and '个性化练习'. Replace those TWO lines with exactly '根据答题记录' and '选择合适练习', to accurately describe knowledge tracing and selection rather than generative questions. Second, in the dark green left label box titled '表示与检索', its two smaller lines currently say '将内容表示为向量' and '并进行检索与匹配'. Replace those lines with exactly '使用不同方法查找' and '并匹配相关内容' because PageIndex and lexical search do not require vectors. Change no other text anywhere, and especially preserve all 21 project names precisely. No new elements.
```
