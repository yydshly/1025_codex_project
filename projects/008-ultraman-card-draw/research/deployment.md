# 星光卡片基地 · 发布记录

## 发布目标

沿用总库 GitHub Pages，在固定编号子路径提供人物图鉴与随机抽卡体验，并通过生成的研究引导图进入总览页，说明目标、能力、效果、价值及动作和渲染扩展方向。

## 发布范围

- `app/index.html`：随机抽卡、图鉴、个人收藏与备份。
- `app/guide.html`：我们的研究理解、现有效果与后续扩展摘要。
- `app/` 内的样式、脚本、人物数据和展示素材；引导图副本与 `assets/images/project-overview-v1.png` 逐字节一致。
- `pages.config.json` 仅新增 008；`guidePage` 为 `guide.html`。已发布的其他项目保持远端原有配置，007 不在本轮提交或发布范围。

研究文档、测试工具及过程截图留在源码库，不复制到网页。用户的个人收藏来自浏览器本地存储，不读取、不打包、不上传。

## 首轮上线与验收

2026-10-27 已上线：[随机抽卡体验](https://yydshly.github.io/1025_codex_project/008-ultraman-card-draw/) · [研究与效果总览](https://yydshly.github.io/1025_codex_project/008-ultraman-card-draw/guide.html) · [总库入口](https://yydshly.github.io/1025_codex_project/)。

发布提交为 `5ac3100385e9537fa46e92f8b32c63d3052549ee`；[GitHub Actions 40451056010](https://github.com/yydshly/1025_codex_project/actions/runs/40451056010) 的 build、deploy 均成功。工作区其他项目未纳入提交，保留远端已有登记与发布设置。

- 本地登记检查通过；`check:pages` 的 4 项隔离测试通过；20 份应用脚本语法检查通过。
- 实际执行人物数据检查：874 条、ID 无重复、4 份精选人物配置、2 份透明前景，人物名和简介均非空。
- 构建总站 208 份文件，本项目公开 28 份文件；29 处本地页面资源与链接均能在产物内解析。
- 线上总入口与本项目 28 份静态文件全部返回 HTTP 200；人物图鉴显示 874，研究引导图链接进入 `guide.html`，体验入口进入抽卡页。
- 线上引导图 SHA-256 为 `d4927e0f641bbd96fca4bb4b5538ca4bdcd79682d4abae3523f2f7aa6277d9b4`，与生成原图一致。
- `/008-ultraman-card-draw/research/notes.md` 返回 404，研究文档未误入网页产物；文档仍可从公开源码库查看。
- 浏览器实测总入口 → 研究总览 → 抽卡体验 → 迪迦展示 → 大图；本地已验证继续随机抽取时切换到其他人物。线上页面未记录脚本错误。

线上检查发现透明前景尚在下载时原图会提前隐藏，已调整为成功加载前保留原图、加载后再切换透明前景；失败仍保留已有回退。使用隔离的 8 秒延迟 fixture 验证加载前后状态，不读取用户收藏。语音在该 fixture 中为测试替身，本轮没有实听各设备语音。

HTTP 资源证据见 [deployment-verification.json](deployment-verification.json)。浏览器窗口约 1265 × 712，未在实体手机验收；没有重新宣称逐项核对全部外链图片内容。

![线上研究总览](../assets/images/deployment-2026-10-27/01-live-guide.png)

![线上人物展示](../assets/images/deployment-2026-10-27/02-live-card.png)

## 使用边界

图鉴包含人物与形态，不能将 874 条解读为独立人物数或完整卡游实体卡目录。当前仅初代、迪迦使用透明静态前景，四位人物配有招式配置；后续动作和更丰富渲染仍需制作并接入。部分人物图片依赖外部网络，系统语音依赖设备支持。线上收藏与本地文件页收藏不跨地址同步，可自行导出和导入备份。
