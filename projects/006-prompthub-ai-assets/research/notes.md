# PromptHub 研究依据与验证记录

[项目说明](../README.md) · [引导图](../assets/images/prompthub-capabilities-overview.png) · [上游固定快照](https://github.com/legeling/PromptHub/tree/de98c0da569b2fede19fa4c4e577b11f5b4bf698)

## 研究问题与最终理解

本次讨论从“这个库有什么能力、原理是什么”，逐步收敛到三个问题：它比记录笔记多做了什么，AI 怎样复用所保存的内容，以及这些能力对我的每日笔记软件有什么意义。

最终理解：PromptHub 将提示词、技能包、规则、连接配置和插件组织为可持续维护的 AI 工作资产，通过模板使用、文件分发、配置适配等方式交给模型或 AI 工具使用。实际任务仍由相关工具和模型执行。

普通笔记提供给 AI 后同样能够复用。新增价值主要来自跨工具的安装与配置、完整包管理、版本和更新维护；只保存少量提示词时，与现有笔记功能重叠较多。

## 研究口径

| 项目 | 记录 |
| --- | --- |
| 初次阅读 | 2026-10-25，本次对话读取 GitHub README、目录树及核心实现 |
| 固定 commit | `de98c0da569b2fede19fa4c4e577b11f5b4bf698` |
| commit 时间 | GitHub 返回 `2026-10-23T10:25:09Z`，即北京时间 2026-10-23 18:25:09 |
| 版本 | 此快照 README 与包配置标记开发版 `0.6.2`，README 标记稳定版 `0.6.1` |
| 引导图 | 2026-10-26 使用内置 ImageGen 生成；1536 × 1024，PNG |
| 入库整理 | 2026-10-27，再次核对固定 commit、README 与 LICENSE |
| 已核对许可证 | 上游 LICENSE 为 GNU Affero General Public License v3；README 标记 AGPL-3.0 |
| 未执行的验证 | 未安装上游，未调用模型 API，未实测技能安装、MCP 服务、同步、恢复或每日笔记联动 |

## 关键阅读依据

下列链接固定在同一 commit，便于后续复核。它们支持文档与实现层面的判断，不等同于实机运行验收。

| 来源 | 能支持的判断 |
| --- | --- |
| [README](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/README.md) | 能力范围、版本口径、桌面/Web/CLI 入口、同步备份区别、隐私说明及上游运行步骤 |
| [桌面端 package.json](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/apps/desktop/package.json) | Electron、React、TypeScript 技术栈和 Node.js 要求 |
| [核心数据库入口](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/packages/core/src/database.ts) | 共享数据层、迁移、资源与文件存储恢复入口；无法据此推断真实数据恢复已成功 |
| [技能平台服务](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/packages/core/src/skills/platform-service.ts) | 技能按完整目录复制或建立符号链接；目标目录适配、链接失败后的复制回退和安装状态记录 |
| [共享技能分发](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/packages/core/src/skill-distribution-targets.ts) | 安装回执与内容指纹、目标归属检查、本地修改和冲突状态；不是模型执行效果评测 |
| [Agent 资产聚合](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/packages/core/src/agent-management/asset-aggregation.ts) | Skill、MCP、Rule、Plugin 分域适配并聚合到平台视图；适配器可能返回不支持或失败 |
| [MCP 管理与配置适配](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/packages/core/src/mcp-library.ts) | JSON/TOML 目标配置适配、绑定、冲突与写入校验；不表示外部服务必然可用 |
| [AI 客户端](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/packages/core/src/ai-client.ts) | 依据模型地址、密钥、模型参数组装 HTTP 请求并解析结果；AI 能力来自所配置的模型服务 |
| [同步流程](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/packages/core/src/causal-sync/workflow.ts) | 内容哈希、共同基线与冲突审阅分支；不表示本次已经通过多设备同步测试 |

## 从记录到复用的概念演进

1. **记录：** 保存事实、资料和某次任务的做法。
2. **提炼：** 从多次实践里找出有效方法，明确输入、步骤和输出。
3. **形成资产：** 依复杂度整理为变量模板、规则，或包含脚本与参考资料的技能包。
4. **交给 AI：** 通过复制、目录安装或配置适配，让目标工具可以读取和使用。
5. **继续维护：** 根据实际效果修改版本，必要时回滚，更新后再验证。

其中“从我的每日笔记自动提炼”“自动获取相关日记”“执行后回写”是我们提出的可能延伸，没有发现可据以宣称已与我的每日笔记软件接通的证据。本次没有为这些想法立项或修改软件。

## 引导图的阅读方式

用户希望直接用图片看懂全貌。最终保留用户选定的生成图，上半部分按“沉淀什么 → 管理什么 → 如何复用 → 交给谁使用”展示五类资产；中间为配套能力；下半部分为每日笔记的可借鉴方向、直接价值和适用条件。

图是概念归纳，不能替代运行截图或验收记录。图中不同平台的标识用于解释目标工具类别，不表示这些工具支持所有同类功能。原始图片没有重新生成、裁切或修改；复制入库时核对 SHA-256。

## 本次入库验证

- 通过总库的 `npm run project:new -- ...` 分配 `006`，保留已有编号和其他项目的内容。
- 将选定引导图复制到本项目 `assets/images/`，以 SHA-256 核对与原图一致。
- 更新 `projects.json` 的摘要、状态和封面，再执行 `npm run index:update` 生成总索引。
- 提交前执行 `npm run check`，并在隔离发布快照中检查本次提交的登记、目录、配图及生成索引。
- 检查 Markdown 相对链接、占位内容和提交范围；远端仅提交本次 `006` 研究及其索引变更。

上述为研究文档与总库结构的验证，不将它们描述为 PromptHub 的端到端功能测试。执行结果与提交信息以本次 Git 记录和对话交付为准。

## 后续如需实测

可在独立目录中选一个不涉及私人日记或现用配置的最小样例，验证提示词模板、单个技能的复制/链接安装，以及目标工具实际加载后的表现。只有完成这些步骤，才适合补充实机效果结论。当前未执行这些操作。
