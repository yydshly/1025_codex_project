# 上游能力清单与实现边界

## 版本与研究范围

- 上游：[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)，固定提交 [`aeac41d4d005999432bb7312f7ff06383a91d59d`](https://github.com/addyosmani/agent-skills/tree/aeac41d4d005999432bb7312f7ff06383a91d59d)，2026-10-28 核对 `main` 指向该提交；分析对应这份快照，而不是保证上游此后不变。
- [Codex 插件清单](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/.codex-plugin/plugin.json)记载插件版本 `0.6.13`，声明技能目录为 `./skills/`。
- 该提交的 `skills/` 有 25 份 `SKILL.md` 和 7 个技能内支持文件（包括一个 shell 脚本）；仓库根目录另有 7 份 `references/` 清单。参见 [Git 树](https://github.com/addyosmani/agent-skills/tree/aeac41d4d005999432bb7312f7ff06383a91d59d/skills) 和 [共享参考资料](https://github.com/addyosmani/agent-skills/tree/aeac41d4d005999432bb7312f7ff06383a91d59d/references)。单个 Skill 除 `SKILL.md` 外可能还有自己的参考资料，不能只按主文件计数来推断已获取完整目录。
- [许可证](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/LICENSE)为 MIT：复制或分发时保留版权和许可声明，原文含免责声明。技能文本和脚本作为上游材料保存；研究不代表运行或安装脚本。

## 25 项技能

以下是对上游声明的概括，属于设计用途，**不是本项目对全部技能的实测结果**。每一项上游源码可通过对应目录打开，例如 [`debugging-and-error-recovery`](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/debugging-and-error-recovery/SKILL.md)。

| 阶段 | 技能目录 | 作用 |
| --- | --- | --- |
| 路由 | `using-agent-skills` | 根据任务选择工作流程并整理共通做法。 |
| 定义 | `interview-me` | 通过逐步提问厘清用户需求。 |
| 定义 | `idea-refine` | 扩展、比较并收敛模糊想法。 |
| 定义 | `spec-driven-development` | 编写需求、边界和验证标准，再推进实施。 |
| 定义 | `constraint-driven-development` | 定义项目质量底线，考虑能自动检查的约束。 |
| 规划 | `planning-and-task-breakdown` | 把规格分解为可验证、考虑依赖顺序的任务。 |
| 实现 | `incremental-implementation` | 按小范围功能切片逐步实现和验证。 |
| 实现 | `test-driven-development` | 以测试明确行为，按失败、通过、重构的循环工作。 |
| 实现 | `context-engineering` | 组织规则、上下文和资料，向助手提供任务所需信息。 |
| 实现 | `source-driven-development` | 核对官方资料及版本，明确有依据与未经验证的决策。 |
| 实现 | `doubt-driven-development` | 对重要结论或方案引入独立质疑并核对反馈。 |
| 实现 | `frontend-ui-engineering` | 指导界面、组件、响应式设计与可访问性。 |
| 实现 | `api-and-interface-design` | 设计接口契约、边界校验和错误语义。 |
| 验证 | `browser-testing-with-devtools` | 借助浏览器工具检查页面、网络、控制台和运行表现。 |
| 验证 | `debugging-and-error-recovery` | 保留证据，复现、定位、缩小、修复并验证问题。 |
| 审查 | `code-review-and-quality` | 从多个质量维度审查变更并标注问题。 |
| 审查 | `code-simplification` | 保持行为的同时降低代码复杂度。 |
| 审查 | `security-and-hardening` | 检查输入、认证、密钥和常见安全风险。 |
| 审查 | `performance-optimization` | 先测量并定位瓶颈，再选择优化方法。 |
| 交付 | `git-workflow-and-versioning` | 组织版本、分支和提交。 |
| 交付 | `ci-cd-and-automation` | 设计自动构建、测试及交付质量关卡。 |
| 交付 | `deprecation-and-migration` | 规划旧能力退役、迁移与过渡。 |
| 交付 | `documentation-and-adrs` | 记录使用方法和架构决定背后的原因。 |
| 交付 | `observability-and-instrumentation` | 规划日志、指标、追踪与告警。 |
| 交付 | `shipping-and-launch` | 检查上线准备、发布、监控和回退。 |

## 工作原理与能力边界

每个技能的 `SKILL.md` 用 `name` 和 `description` 标记用途，正文给助手提供步骤、风险提示和验证要求；有些还引用附加参考资料。它主要是**可供助手遵循的文本工作流**，不是新的基础模型，也不能单凭安装保证质量。读到步骤不等于真实运行工具、检查网页或测试成功；是否能执行取决于宿主、可用工具、任务上下文和权限。测试与对照的结论应以各实验实际证据为准，不能把技能的目标当成实测收益。

[上游 Codex 说明](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/docs/codex-setup.md)称 Codex 插件直接读取共享 `skills/`，按技能名称与描述发现，再按需加载正文。该说明提到需要 Codex CLI v0.122 或更新版本；这是上游的兼容声明，本研究不因此声称已经在当前环境安装或验证了原生插件。Claude Code 的斜杠命令和角色不直接变成 Codex 命令；上游还说明 `SessionStart` 脚本没有接入这两个插件，且不建议将完整元路由预加载进 `AGENTS.md`。

[上游 README](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/README.md)提醒：单独安装某个技能时，仓库根目录的 `references/` 不会随之复制，指向共享清单的链接可能缺失。完整性需要连同实际安装方式和文件路径核对。

技能中某些工作方式（例如频繁提交、人工审批节点或测试流程）是上游的工程偏好，不自动覆盖用户指令、本仓库约定或 ReflectFlow 保护规则。应依据任务风险和现有能力选择；不能把这些通用规则用于绕过数据保护、权限或已有项目流程。
