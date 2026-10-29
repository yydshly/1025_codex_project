# 多个 Web 项目的部署约定

[返回首页](../README.md)

## 008 · 星光卡片基地

2026-10-27 已上线并核验：[随机抽卡体验](https://yydshly.github.io/1025_codex_project/008-ultraman-card-draw/) · [研究与效果总览](https://yydshly.github.io/1025_codex_project/008-ultraman-card-draw/guide.html)。

008 采用 `publicDirectory: app`，无需安装前端依赖；总入口使用本次生成的 `assets/images/project-overview-v1.png`，`guidePage: guide.html` 让点击引导图进入研究总览，项目名称和“查看网页”进入随机抽卡体验。引导图在 `app/assets/images/` 有逐字节一致的网页副本，支持本地打开与编号子路径发布。

研究总览说明 874 条人物与形态资料、人物演出配置、卡片舞台和随机亲子展示，并区分现有的静态前景、页面光效、设备朗读与后续动作、渲染扩展。只发布 `app/` 中的静态页面、人物数据及展示素材；研究笔记、截图和测试工具不进入网站。正式地址与上线验收以 [008 发布记录](../projects/008-ultraman-card-draw/research/deployment.md)为准。

个人收藏使用浏览器本地存储。本地文件页和线上地址的数据互不共享，切换入口时可先导出备份再在目标地址导入；发布不会读取或上传原浏览器收藏。

本库通过 GitHub Actions 构建 GitHub Pages，一个站点下按编号子路径组织多个项目。当前发布清单为 [pages.config.json](../pages.config.json)，首个接入项目是 [001 · 早期方向档案](../projects/001-early-directions-atlas/README.md)。

2026-10-27 首次发布成功，已验证[站点总入口](https://yydshly.github.io/1025_codex_project/)与[001 在线网页](https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/)。具体工作流和验收记录见[项目发布记录](../projects/001-early-directions-atlas/research/deployment.md)。

同日接入并验证 [004 · BaoCut 能力、原理与效果研究](https://yydshly.github.io/1025_codex_project/004-baocut-effects-atlas/)，总库使用我们生成的能力总览图引导阅读。发布范围和验收见 [004 上线记录](../projects/004-baocut-effects-atlas/research/deployment.md)。

## 发布范围

站点总入口介绍研究档案，并为每个公开项目提供引导图、摘要与网页链接。

- 公开项目必须先登记在 `projects.json`，再明确列入 `pages.config.json`。
- `publicDirectory` 指定该项目可公开的静态目录；框架项目需要先构建出静态结果。
- `extraAssets` 只复制逐项声明的 `assets/` 资源。001 额外复制生成的方向引导图；004 先生成 `dist/site`，其公开素材随该目录发布。
- 项目名称、摘要及封面来自项目登记。封面也必须存在于公开资源中。
- 构建器拒绝链接、路径跳转和重复产物目录，跳过隐藏文件。没有声明发布的项目、研究笔记和仓库其他文件不进入站点。

源码与网站产物分开管理。公开 GitHub 仓库中提交的源码仍可通过仓库访问；“未进入站点”不等于仓库文件私密。

## 本地构建与验证

需要 Node.js 22+，根目录工具无第三方依赖：

```powershell
npm.cmd run index:update
npm.cmd run check
npm.cmd run check:pages
npm.cmd --prefix projects/004-baocut-effects-atlas run build:site
npm.cmd run build:pages
python -m http.server 4327 --bind 127.0.0.1 --directory dist/pages
```

默认产物为 `dist/pages/`，在本地访问总入口和编号子路径，核对图片、脚本、筛选、详情 hash 与刷新。构建器要求新产物目录；重复构建可指定另一个空目录：

```powershell
node scripts/build-pages.mjs --out dist/pages-review
```

`check:pages` 使用独立临时目录验证项目创建、编号递增、索引生成与发布边界，不修改真实登记。

## GitHub Pages 发布

工作流为 [.github/workflows/pages.yml](../.github/workflows/pages.yml)。

1. 仓库 Pages 的发布方式设为 GitHub Actions（API 中 `build_type: workflow`）。
2. 向 `main` 推送发布范围内的变化，或手动触发工作流。
3. 构建作业检查登记、发布边界和项目脚本，再生成 `dist/pages`，上传 Pages artifact。
4. 部署作业使用 `github-pages` 环境和官方 `actions/deploy-pages` 部署，输出网站地址。
5. 工作流成功后，实际访问根入口、编号子路径、引导图和脚本，检查详情刷新与移动端。
6. 验证通过后，才在 `projects.json` 的 `demoUrl` 登记真实地址，并重新生成 README。

部署只提交本次授权的项目及必要的发布配置。其他正在整理的工作区内容可以保持未提交，不能因部署而一并纳入远端。

## 后续增加项目

### 005 · 纸间：纸墨叙事与氛围网页研究

2026-10-27已完成发布并核对[纸间首页](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/)与[可点击总览](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/map.html)，总入口使用已生成的研究总览图。首次Actions运行40368730500的build／deploy均成功；完整实测与边界见[005发布记录](../projects/005-paper-poetics-lab/research/deployment.md)。

005使用 `dist/` 作为公开目录，002作为构建依赖，其完整产物复制在005的 `original/` 子目录，不另建公开站点。005的工作流步骤安装并构建002／005；其他项目仍以发布清单逐项声明，不自动上线未声明的本地研究。

站点总入口的引导图使用用户确认的 `assets/images/v1.4/research-map.png`，完整保留纵向图解；`guidePage: "map.html"` 让点图与“放大阅读引导图”进入可交互版本，项目名称及“查看网页”进入005首页。原图作为逐项声明的 `extraAssets` 公开，源稿、生成任务记录与原始下载不因发布目录而自动进入网站。

新增发布项需要先安装依赖，再执行 `npm --prefix projects/005-paper-poetics-lab run build`。该步骤自行构建002，随后根目录 `build:pages` 复制005的静态产物和声明的引导图。子路径链接、iframe章节hash及SVG导出地址需要在最终Pages地址复核，验证通过后再登记 `demoUrl`。

`pages.config.json` 中的目录必须是登记的固定编号目录，例如：

```json
{
  "schemaVersion": 1,
  "projects": [
    {
      "directory": "001-early-directions-atlas",
      "publicDirectory": "app",
      "extraAssets": ["assets/images/directions-map-v1.png"]
    }
  ]
}
```

同时更新工作流的 `paths`，让后续项目变动触发站点构建。资源引用采用相对路径；有客户端详情或路由时，优先使用 hash，避免静态托管中的深层路径刷新问题。部署需要的构建步骤随项目添加，不自动运行或上线所有子项目。

## 004 · BaoCut 研究页

004 的本地页面位于 `app/`，媒体位于同级的 `assets/`。`npm --prefix projects/004-baocut-effects-atlas run build:site` 会校验研究数据与 24 份原始提示，将媒体地址改为编号子路径内的相对地址，生成 `dist/site/`。原始提示文本保持不变；研究说明和原始文件入口改为固定版本或本库的 GitHub 链接。

该目录只包含静态界面、目录数据、20 组官方预览与封面、我们的 PNG / SVG 能力总览图、署名与许可证。构建器不复制研究笔记、验收文件或运行脚本，也不自动清理既有目录。总库封面使用 `assets/images/capability-map.png`。

## 需要后端的项目

GitHub Pages 只能提供静态内容。模型服务、采集任务、密钥和持久化数据需另行托管；不得把服务端凭据打包到网页。

## 官方参考

- [使用自定义 GitHub Actions 工作流发布 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)

## 003 · 连续主题体验的发布准备

003采用 `publicDirectory: public`。CI先执行 `npm --prefix projects/003-unified-learning-design run prepare:pages`，由项目脚本创建新的派生目录，再交给总库发布器。编号根入口直接显示研究总览，`app/index.html`保留三维样章，`app/handbook.html`保留方法手册。

发布准备仅复制静态应用、六项明确图像及当前映射的13段MiniMax音频；不发布旧音频、语音生成工具、配置或本地依赖。研究文档链接改指同仓库对应源码。既有 `understanding-atlas.png` 作为项目登记和网页引导图，发布时逐字节保留。`test:publication`在独立目录检查根入口路径、文档改写、资源白名单和越界／链接拒绝。

2026-10-27已上线并核验：[研究总览](https://yydshly.github.io/1025_codex_project/003-unified-learning-design/) · [三维样章](https://yydshly.github.io/1025_codex_project/003-unified-learning-design/app/index.html)。工作流、资源检查与浏览器截图见[003发布记录](../projects/003-unified-learning-design/research/deployment.md)。


## 009 · 资料理解与检索研究

2026-10-28已上线并核验：[研究网页](https://yydshly.github.io/1025_codex_project/009-knowledge-processing-atlas/)。从DeepTutor与NotebookLM的资料学习场景出发，解释建库与模型依赖，展示19个重点项目/模型及5项延伸工具的原理、区别与价值，并规划可追溯阅读、跨日回顾、经验复用和自适应学习能力。

009使用 `publicDirectory: app`，无需前端构建依赖；第三版引导图的网页副本与原图逐字节一致。新增009路径触发与脚本语法检查，发布清单保持已有项目。线上图像、资源、19项原理展开、搜索筛选和手机布局已核对。[完整发布与验收记录](../projects/009-knowledge-processing-atlas/research/deployment.md)。

网页是研究展示，底层算法演示仍待实施，不能把上线视为上游项目能力已经实测。

同日补全并再次发布：统一26项搜索、定位与并排比较，增加5个算法专题、可点击文字路线、场景选型、6题虚构材料和实验协议。总索引摘要同时说明教材/资料学习场景、代表库、来源与时间等底层价值，以及阅读溯源、跨日回顾、经验复用和自适应复习。JSON与CSV格式文本在app/data/发布，模板通过download属性保存为.csv，保持现有发布白名单。[本轮正式验收](../projects/009-knowledge-processing-atlas/research/deployment-revision2.md)含成功工作流、资源和桌面/手机截图。

## 010 · Agent Skills 能力、场景与按需使用

2026-10-28 已发布并核验：[统一使用入口](https://yydshly.github.io/1025_codex_project/010-agent-skills-engineering-lab/) · [完整汇总图](https://yydshly.github.io/1025_codex_project/010-agent-skills-engineering-lab/app/overview-poster.html)。源库把工程经验整理成25份AI工作规程；本研究通过七类工作、五问总图说明能力、场景、步骤与约束、产物与检查、技能衔接。对我们的意义是按真实需求选择方法，学习用约束、证据和检查控制落地，逐步形成自己的能力。全量讲解已完成，逐项完整实测仍按需开展。

010使用 `publicDirectory: dist/site`、`guidePage: app/overview.html`。`scripts/build-site.mjs`只复制26个运行文件和4项图像；保留app层级，根页进入总图，原文与研究记录跳到本次提交的GitHub源码。CI验证40份固定快照、25项总图与场景、回查快照及18/22/7项测试，再生成发布文件。首次工作流[40690871041](https://github.com/yydshly/1025_codex_project/actions/runs/40690871041)的构建和部署均成功。

线上25项五问、场景到原理的跳转与刷新、PNG/SVG资源、手机布局及源码固定提交链接已核对。公共回查快照只含本次已提交的9个项目，保留本地历史演示10项目的说明；浏览器判断不自动跨地址同步。详见[010发布与验收记录](../projects/010-agent-skills-engineering-lab/research/deployment.md)。

## 012 · 学术研究 Skill：能力、场景与水生毒理学实测

2026-10-29 已部署并核验：[研究网页](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/)。摘要列出5个Skill、研究能力、选题/综述/核验/写作修订/审稿场景和流程复用价值；总入口使用我们生成的理解总览图，原图字节保持一致。

012使用publicDirectory: app，仅声明生成图额外资源，并用本项目textExtensions: [".md", ".csv"]发布报告和筛选表；其他项目默认范围不变。42个下载及52个线上请求均200，来源筛选和窄屏布局已验证。原始摘要批量响应、上游ZIP/镜像保留本地，CI使用公开产物检查；研究性能与科学结论的限制继续明确记录。[完整发布记录](../projects/012-aquatic-toxicology-skill-lab/research/deployment.md)。

新增登记同时更新010的受管回查快照；以实际提交的登记字节生成，防止Windows/Linux换行差异导致哈希失配。首次成功工作流为[40834394350](https://github.com/yydshly/1025_codex_project/actions/runs/40834394350)。
