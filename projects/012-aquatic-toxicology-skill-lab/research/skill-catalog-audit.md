# 固定版本 Skill 目录与真实场景审计

2026-10-29；固定提交 `b8d050f24f2e1c465c4410eace8634ea3af15930`。只读核对已保存原始ZIP与本地源码，未新增科研检索、未改上游、未启动新的Skill工作流。完整结构化内容见 [skill-catalog-audit.json](skill-catalog-audit.json)。

原始ZIP中一级 `<目录>/SKILL.md` 共 **5个**，本轮安装 **4个**。`deep-research` 的 **13个代理角色**属于内部职责分工；Python客户端和宿主网页搜索又是不同层次，不能混算成更多独立Skill。

| 顶层Skill | 负责什么 | 本轮实际程度 |
|---|---|---|
| deep-research 2.12.1 | 从主题/问题到检索、核验、综合、报告 | 实际采用多个角色规范并适配执行；不是完整原生full流程 |
| sr-screener 1.0.0 | 对已有检索记录作协议化筛选与QC | 未安装、未运行；本次只从ZIP读原始说明 |
| academic-paper 3.3.1 | 将真实材料组织成稿件、引用和修订 | 已安装，选读写作参考；未运行其完整写作流程 |
| academic-paper-reviewer 1.11.1 | 按准则作多视角审查、再审或校准 | 已安装，借用评价准则；未运行五席面板 |
| academic-pipeline 3.24.0 | 调度阶段、交接、检查点与诚信核查 | 已安装并核对边界；未运行原生十阶段编排 |

来源：`README.zh-CN.md` 259–277行，各Skill frontmatter；`academic-pipeline/SKILL.md` 19行明确自身不执行实质研究。

真实场景应按任务选择入口：方向模糊用`deep-research / socratic`；调查已有工作用`deep-research`的相应研究模式；筛选已导出的记录用`sr-screener`；已有结果要写稿用`academic-paper`；审已有稿用`academic-paper-reviewer`；要跨阶段管理才用`academic-pipeline`。JSON列出六种场景的动作、产物和本轮边界。

特别需要区分两种遗漏：**检索遗漏**是相关论文没有进入记录集；**筛选遗漏**是已获得的记录被误排或遗失。`sr-screener`的种子检查、近似排除复查、与人工pilot标签对照，主要检查后一种。即使筛选QC通过，也不能据此证明前面的搜索已覆盖领域文献。原文还指出同一模型两次判断可能共享误读（`sr-screener/SKILL.md` 206行），不把双AI一致率当真实性证明。

本轮采用的来源、读取深度、API成败和修订证据分别保留在执行约定、检索日志、合并核验JSON和Phase 5审查文件。没有将安装、读规范、执行代码、完整运行Skill四件事混同。
