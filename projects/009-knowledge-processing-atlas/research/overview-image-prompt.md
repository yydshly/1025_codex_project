# 研究总览图生成记录

本图使用 Codex 内置 imagegen 工具生成，并在生成后针对箭头对应关系进行一次编辑。最终成品为 [research-overview.png](../assets/images/research-overview.png)。图为本项目的研究概念示意，不代表上游截图或实际运行结果。

## 初始生成提示词

```text
Use case: infographic-diagram. Create ONE finished, polished, highly legible Chinese information-graphic image for a GitHub research project about DeepTutor and the underlying systems that turn documents into usable AI knowledge. Portrait infographic, editorial information design, warm off-white and deep forest green, small warm terracotta accents, restrained precise line icons, polished typography, generous spacing, clean diagram arrows, professional museum-quality visual hierarchy, no gradients or photography. Use generous font sizes and high legibility, do not draw tiny pseudo-text. The graphic has 3 clearly separated numbered sections plus a narrow footer, with exact Simplified Chinese text and project names, no invented numbers. Use exactly these texts with faithful Chinese characters: Main title: '从资料到 AI 理解'; subtitle: '研究对象 · 底层方法 · 价值与规划'. Section 01 title: '研究对象'; show three distinct cards: 'DeepTutor / 开源学习工作台', 'NotebookLM / 托管资料问答', 'RAGFlow / 解析与检索平台'. Section 02 title: '底层能力'; depict an easy-to-read directional flow with five compact blocks: '资料' → '解析' → '表示与检索' → '关系与时间' → '答案与核验'. Within relevant blocks use exactly these supporting labels: 'MinerU · Docling / 文字与结构'; 'BGE-M3 · ColBERT / 语义与相关性'; 'Qdrant / 索引与过滤'; 'PageIndex / 章节定位'; 'Graphiti · GraphRAG / 时间与全局主题'. Make clear Qdrant is a database and BGE-M3 is a model, they are complementary. Section 03 title: '能力、价值与后续'; compact rows: '能力  读出内容 · 找回证据 · 追溯原文'; '本质  解析 + 检索 + 模型推理'; '价值  保留结构、时间与来源，判断投入是否值得'; '规划  虚构样本 → 验证解析 → 对比检索 → 核验时间'. Footer verbatim: '公开资料研究 · 示意非实测 · 后续演示待实施'. Ensure the entire diagram is one single cohesive image, exact spelling, no fake benchmarks, no random additional words, no watermarks, fully visible margins, optimized for reading in a project README.
```

## 定向修正提示词

```text
Edit this exact finished Chinese research infographic with a single precise correction. Remove ONLY all five thin vertical orange down arrows located in the gap between the dark-green process-flow blocks in section 02 and the five light tool cards below them; fill the removed arrows cleanly with the existing off-white background, so the tool cards are examples of complementary capabilities without misleading one-to-one mapping. Keep the horizontal orange arrows between the five dark-green process boxes. Preserve EVERYTHING else exactly, including canvas size, composition, all icons and all text; keep names DeepTutor, NotebookLM, RAGFlow, MinerU, Docling, BGE-M3, ColBERT, Qdrant, PageIndex, Graphiti, GraphRAG precisely unchanged. Do not reflow or paraphrase any text, do not add new elements.
```
