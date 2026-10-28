# 010 · 发布说明与理解摘要

## 源库的价值与能力

addyosmani/agent-skills 把工程经验写成25份可由AI助手读取的工作规程，覆盖需求澄清、方案选择、规格与约束、规划与上下文、实现与接口、测试与调试、审查与安全、性能、版本与交付维护。它提供步骤、关键判断、产物和证据要求，行动仍依赖模型、工具和项目环境。

本项目以七类工作与五问总图组织理解：做什么、何时用、怎么做、交付与检查、如何配合。对我们的意义是遇到真实问题时选相关方法，学习如何用约束和可核对的结果控制落地；已有研究回查案例和自建Skill作为有限实践。讲解覆盖25项，逐项完整实测仍按需开展；没有量化收益对照。

## 发布边界

- 统一入口是使用地图，静态产物保留 app/ 层级；站点根页进入 app/overview.html。
- 只发布明确列出的页面、脚本、样式与四项图像；研究日志、Python工具、测试和原文在仓库阅读，不复制到网站。
- 相关资料链接改为本仓库本次发布commit的源码地址，保留上游固定版本与MIT许可。
- 公共版研究回查快照只从本次提交中的登记和README生成。历史本地演示涉及10个项目，公共首版快照含9个已提交项目；未提交的007项目不随本次发布进入远端。
- 浏览器判断保存在各自访问地址的本地存储。本地与线上不自动互通，可自行导出、导入备份；发布不读取或迁移已有浏览器内容。

## 验证与发布记录

2026-10-28 已发布：[统一入口](https://yydshly.github.io/1025_codex_project/010-agent-skills-engineering-lab/) · [完整汇总长图](https://yydshly.github.io/1025_codex_project/010-agent-skills-engineering-lab/app/overview-poster.html)。

首个发布提交为 `683cf5b65438edea2ef44c4f497211e8d8c8b94f`；[GitHub Actions 40690871041](https://github.com/yydshly/1025_codex_project/actions/runs/40690871041)的build与deploy均成功。只提交010及根索引、登记、发布清单和工作流；其余未提交内容保持原位。

线上逐项检查25个节点及完整五问，场景跳转、原理深链与刷新恢复通过；9项页面/脚本/图像请求均为HTTP200。回查数据与首次提交的Git blob逐字节一致（9项目，无007）。手机390×844视口下，内容宽375与滚动宽375一致；控制台未见错误或警告。

本地检查包含18项回查行为、22项Skill行为、7项发布隔离与4项总库发布测试；75条本地资源引用可解析。首次检出回查测试把项目数写死为10，修正为核对真实登记集合后通过，保留完整覆盖检查。

截图：[正式入口](../assets/images/deployment-2026-10-28/online-overview.jpg)、[手机检查](../assets/images/deployment-2026-10-28/online-mobile.jpg)。结构化记录见[deployment-verification.json](deployment-verification.json)。
