# 理解总览图：生成提示词

工具：内置 image_gen；用途：项目网页与可下载的中文理解总览图；新生成、非透明背景。此图是解释性信息图，不是实验结果图或原项目官方架构图。生成后另行记录实际文件与尺寸。

```text
Use case: infographic-diagram / scientific-educational
Create ONE polished Chinese editorial infographic, landscape 3:2, very high resolution, intended to be opened at full size and read. A research field-notes aesthetic: warm ivory paper, dark forest green typography, restrained burnt-orange highlights, thin rules, clean schematic icons, no photorealism, no fake app UI. Use an elegant Chinese sans serif, large readable headings, crisp accurate Simplified Chinese and English database names. Clear hierarchy and lots of breathing room. No logos or watermarks. A small line illustration of a zebrafish and water belongs in the title area only. This is an explanatory map about a research workflow, not proof that a research result is scientifically correct.

Exact main title: “这个研究 Skill，究竟提供什么？”
Exact subtitle: “academic-research-skills · 用水生毒理学理解能力、原理与边界”

TOP BAND — three concise cards, render these exact texts:
“能力：组织拆题、检索、核验、综合与审查”
“原理：规则文件 → AI执行 → 外部工具与数据库 → 证据记录”
“价值：减少临时拼流程；是否更全、更准，仍需对照验证”

OWNERSHIP BAND — visually distinguish two columns, green for original repository and orange for this case's additions. Exact text:
“原库提供：研究规范、角色分工、引文核验客户端、另一套主题发现代码”
“本轮新增：三个API采集器、具体词表、漏检测试、过程留痕与网页”
Small but readable note: “原S2/Crossref核验已运行；原主题发现模块未运行”

CENTER — six numbered connected cards, 2 rows by 3 columns, obvious directional arrows including a feedback arrow from 补漏 to 拟词. Exact card text:
“01 拆题” / “物种 × 污染物 × 暴露条件 × 研究终点” / “例：斑马鱼 × 微/纳塑料 × PFAS”
“02 拟词与选源” / “同义词、学名、缩写、旧称” / “块内OR，块间AND；按问题选择来源”
“03 检索与取回” / “官方API，或有权限的检索与导出” / “保存查询、日期、分页、原始响应与失败”
“04 合并与筛选” / “DOI/PMID去重；先题名摘要，再全文” / “保留、排除、待定，每项写理由”
“05 检查与补漏” / “基准论文、引文追踪、删条件、补别名” / “区分词漏、库漏、取回漏、误筛”
“06 分析” / “提取剂量、时间、终点、统计与读取范围” / “比较可比条件；结论逐项链接原文”

BOTTOM — a compact two-column source and acquisition legend with clear status badges. Exact texts, no extra source names:
“本例已实测”
“PubMed｜ESearch → EFetch → XML题录/摘要”
“Europe PMC｜REST＋游标分页 → JSON；与PubMed大量重叠”
“OpenAlex｜Works API → 主题检索＋前后向引文”
“值得补充，尚未在本例实测”
“WoS / Scopus｜跨学科文献；订阅检索/导出，API另看授权”
“ASFA / OpenASFA｜水生领域；中文库｜期刊与学位论文”
“Google Scholar｜人工补查；ECOTOX / eChemPortal｜实验与物质资料”
“OECD指南＋论文全文/补充材料｜核对方法与证据”

FOOTER — strongly readable boundary, exact text:
“本轮：984条候选；基准3/5 → 修词后5/5”
“组合方案结果；5篇已用于调词，5/5不等于查全，也不证明无人做过。”

Constraints: all content is a map of our understanding, not a claim of complete native execution. Never add “100%”, “自动查全”, “可靠性保证”, “已证明增益”, or any fabricated evidence or source. Clearly distinguish original repository, this case's implementation, and suggested future sources. Do not draw green PASS icons over untested sources. Keep text exact, avoid dense tiny text, no duplicated labels, no illegible glyphs.
```

## 定点修订提示词

```text
Edit this infographic with only three precise corrections. Preserve the entire composition, every other word, palette, line art and dimensions. 1) In the bottom-left source box the first line must read exactly: PubMed｜ESearch → EFetch → XML题录/摘要 . Include the initial E in ESearch; do not render Search alone. 2) In card 06 分析 the first body line must read exactly: 提取剂量、时间、终点、统计与读取范围 . In particular 读取 must be both correct Chinese characters, no missing or substituted characters. 3) In the top-right 价值 card the body must read exactly: 减少临时拼流程；是否更全、更准，仍需对照验证 . All other texts must remain unchanged and crisp. Do not add content, icons, decorations, new evidence or guarantees. Correct these text areas only.
```

## 最终文件与核对

- 使用内置 image_gen，生成并进行一次文字定点修订；没有使用CLI或另写API程序。
- 最终文件：`app/assets/understanding-map.png`，1536×1024，2,015,112字节。
- SHA-256：`77db9c8a099aa369a6df5669c17b47c4fcba62dcd56ac6da0b47df8c4919419e`。
- 最终图上PubMed用“Search”概括检索步骤，没有完整渲染“ESearch”；网页图注和来源卡给出精确的 `ESearch→EFetch`。图是解释性总览，接口和执行事实以文字记录与原始回执为准。
- 图中“已实测”指第二轮三个API；原文和OECD资料在首轮用过部分内容，完整全文和方法评估仍待进行。网页用不同状态分别标记。
- 输出已复制到本项目，原生成文件保留在默认生成目录；未删除或覆盖其他项目资产。
