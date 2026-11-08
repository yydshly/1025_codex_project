// Generated from the project registry and allowlisted README files.
globalThis.RECALL_CORPUS = {
  "schemaVersion": 1,
  "generatedAt": "2026-11-08T14:03:34.373Z",
  "registrySha256": "b468fdbe3ad5e0ed6a2f803a7fad0b09df5424395354a6f913718a930983e7dd",
  "projects": [
    {
      "id": "001",
      "slug": "early-directions-atlas",
      "name": "早期方向档案",
      "summary": "把早期的 12 个产品、工具与创作方向整理成一张地图。可查每个想法做到哪一步、为何继续或暂停，以及接下来要验证什么。",
      "source": "https://github.com/yydshly/1025_codex_project",
      "status": "completed",
      "tags": [
        "早期思考",
        "遗留方向",
        "AI产品",
        "创作",
        "历史回溯"
      ],
      "createdAt": "2026-10-26",
      "readmePath": "projects/001-early-directions-atlas/README.md",
      "readmeSha256": "0709e2c74d2a60ec0eb61f1fc40fa4342d544f5f3fad5019ff84161e2ed8dd60",
      "readmeText": "# 001 · 早期方向档案\n\n> 用 AI 做有价值的作品，找到真实需求，逐步形成产品和经营能力。\n\n这是我们早期思考、讨论和尝试留下的十二个方向。遗留包含候选、方案与原型、阶段作品，以及研究后主动停止的选择；逐项保存想法、进展与待验证问题，供下一轮取舍参考。\n\n[在线阅读](https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/) · [返回总索引](../../README.md#项目索引) · [网页文件](app/index.html) · [一图总览](assets/images/directions-map-v1.png) · [完整文字快照](research/archive-snapshot.md) · [整理与验证记录](research/notes.md)\n\n![早期思考与方向地图引导图](assets/images/directions-map-v1.png)\n\n图：我们在 2026-10-26 生成的方向总图，现作为网页与总索引的引导图。先看三条探索脉络，再通过网页目录查看十二个方向的原始想法、历史进展与验证问题。历史进展不代表当前验收。\n\n## 这是什么\n\n把本次对话中找回的早期方向整理成可浏览的档案。保留目标、历史进展、待验证问题、停止理由和原始入口，同时区分历史事实与后续建议。\n\n| 项目 | 内容 |\n| --- | --- |\n| 编号 | `001` |\n| 整理日期 | 2026-10-26，北京时间 |\n| 历史状态口径 | 用户在 2026-10-25 对话中提供的回溯材料 |\n| 资料来源 | 本次对话，未重新读取完整历史对话 |\n| 源码位置 | 本研究总库原创子项目，无独立上游代码仓库 |\n| 所属仓库 | https://github.com/yydshly/1025_codex_project |\n| 当前状态 | 档案整理与网页已完成；不代表十二个方向全部完成 |\n| 公开部署 | [GitHub Pages 在线网页](https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/)，2026-10-27 已验证 |\n| 依赖 | 无第三方依赖；可选本地服务需要 Node.js 22+ |\n\n## 一图理解想法与方向\n\n完整图已放在本文与网页开头，作为阅读引导。产品与变现四项、工具实践六项、创作表达两项，都按各自阶段记录。\n\n图：2026-10-26 使用内置 ImageGen 生成，依据本页内容数据整理。三个分支表示探索脉络，不表示项目依赖或开发先后。底部是共同的验证循环，历史进展不代表当前验收。可[查看原图](assets/images/directions-map-v1.png)或[完整生成提示词](research/project-map-prompt.txt)。\n\n## 收录内容\n\n共十二个主要方向、三类探索脉络、九个历史入口。\n\n| 分类 | 方向 |\n| --- | --- |\n| 产品与变现（4） | 真实需求研究与商业机会筛选；个人 IP、技术内容与 SEO；四个轻量产品候选；小票、PDF 与供应商价格册 |\n| 产品与工具（6） | 音频与音乐局部修改；咖啡全过程 3D；共想室；岗位变化观察站；跨设备互联；论文研究工作台 |\n| 创作与表达（2） | 艺术、审美与动态视觉系列；原创 AI 室友短剧 |\n\n补充保留 3D 场景、小龙动态形象、儿童内容与互动的探索线索，以及游戏支线的历史登记口径。四个轻量候选、价格资料方向的停止项、两部艺术作品和短剧各集在详情中分别记录。\n\n## 网页功能\n\n- 按分类、阶段、有无历史入口组合筛选，支持跨目标、进展、分项内容的关键词搜索。\n- 每个方向提供已知进展、尚未验证、分项取舍、下一份证据与来源说明。\n- 方向详情支持 hash 地址，例如 `#direction/paper-workbench`；关闭弹窗保留原筛选状态。\n- 支持完整 Markdown、结构化 JSON 导出，以及单条记录复制；剪贴板不可用时改为下载单条 Markdown。\n- 桌面、平板、手机自适应；提供键盘焦点、跳转链接、Esc 关闭和减少动态效果支持。\n\n## 本地运行\n\n`app/` 为纯静态 HTML、CSS、JavaScript，资源均使用相对路径，不需要 API 密钥、登录或安装依赖。可用浏览器打开 `app/index.html`；本次内置浏览器仅允许 HTTP/HTTPS，因此实际交互验收通过下面的本地服务完成，未验证 `file://` 模式。\n\n推荐在当前子项目目录运行：\n\n```powershell\ncd E:\\codex_project\\1025_codex_project\\projects\\001-early-directions-atlas\nnpm.cmd run dev\n```\n\n启动后访问 http://127.0.0.1:4317/ 。服务仅监听本机，用 Ctrl+C 停止。端口被占用时可在本次终端中设置 `$env:PORT = '4318'` 后重试。\n\n检查命令：\n\n```powershell\nnpm.cmd run check\n```\n\n仓库根目录另执行 `npm.cmd run check`，验证项目登记与总索引一致。\n\n## 资料与维护\n\n```text\napp/\n  index.html           页面结构\n  data.js              十二个方向、来源与建议的内容数据\n  app.js               筛选、详情、深链接和导出\n  styles.css           响应式样式\n  favicon.svg          原创站点标识\nserve.mjs              仅用于本地预览的静态服务\nresearch/\n  notes.md             整理原则、验证记录与限制\n  archive-snapshot.md  浏览器实际导出的完整文字快照\nassets/images/\n  cover.jpg            桌面首屏\n  catalog.jpg          方向目录\n  mobile-detail.jpg    手机详情\n```\n\n以后增补内容以 `app/data.js` 为准。修改方向数量或分类后，同时检查页面静态文案、目录导航计数和 README；重新导出并更新文字快照。候选是否立项、作品是否验收、建议是否接受，分别依据新增证据更新，不能由整理日期自动推断。\n\n部署按根目录 [Web 部署约定](../../docs/DEPLOYMENT.md) 执行：`pages.config.json` 声明公开项目，构建时仅复制 `app/` 和指定的引导图，GitHub Actions 将它们挂载到编号子路径。研究笔记、提示词和其他截图不会进入网站产物。\n\n## 边界与来源\n\n- 所有项目进展依据用户提供的回溯材料，不将资料页、方案页或短测试描述为完整产品。\n- 岗位站的 403、最后成功采集日期与游戏 45 款／99 入口均保留历史日期，未作为当前运行状态重新确认。\n- 页面中的“下一份证据”和“下一步”是本次整理及上一轮讨论建议，尚未确认立项。\n- 本页面未复制上游代码或外部媒体。主引导图使用内置 ImageGen 生成，站点标识由本项目 SVG 绘制，截图来自本项目预览。\n- 总库尚未选择统一开源许可证；历史入口指向的作品、仓库与素材沿用各自权利和授权，不因被本页收录而改变。\n\n![方向目录实际截图](assets/images/catalog.jpg)\n\n图：分类、阶段筛选与历史进展卡片。更多验证记录见 [research/notes.md](research/notes.md)。\n",
      "passages": [
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 001 · 早期方向档案"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "> 用 AI 做有价值的作品，找到真实需求，逐步形成产品和经营能力。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "这是我们早期思考、讨论和尝试留下的十二个方向。遗留包含候选、方案与原型、阶段作品，以及研究后主动停止的选择；逐项保存想法、进展与待验证问题，供下一轮取舍参考。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 7,
          "endLine": 7,
          "text": "[在线阅读](https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/) · [返回总索引](../../README.md#项目索引) · [网页文件](app/index.html) · [一图总览](assets/images/directions-map-v1.png) · [完整文字快照](research/archive-snapshot.md) · [整理与验证记录](research/notes.md)"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "![早期思考与方向地图引导图](assets/images/directions-map-v1.png)"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 11,
          "endLine": 11,
          "text": "图：我们在 2026-10-26 生成的方向总图，现作为网页与总索引的引导图。先看三条探索脉络，再通过网页目录查看十二个方向的原始想法、历史进展与验证问题。历史进展不代表当前验收。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 13,
          "endLine": 13,
          "text": "## 这是什么"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 15,
          "endLine": 15,
          "text": "把本次对话中找回的早期方向整理成可浏览的档案。保留目标、历史进展、待验证问题、停止理由和原始入口，同时区分历史事实与后续建议。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 17,
          "endLine": 24,
          "text": "| 项目 | 内容 |\n| --- | --- |\n| 编号 | `001` |\n| 整理日期 | 2026-10-26，北京时间 |\n| 历史状态口径 | 用户在 2026-10-25 对话中提供的回溯材料 |\n| 资料来源 | 本次对话，未重新读取完整历史对话 |\n| 源码位置 | 本研究总库原创子项目，无独立上游代码仓库 |\n| 所属仓库 | https://github.com/yydshly/1025_codex_project |"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 25,
          "endLine": 27,
          "text": "| 当前状态 | 档案整理与网页已完成；不代表十二个方向全部完成 |\n| 公开部署 | [GitHub Pages 在线网页](https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/)，2026-10-27 已验证 |\n| 依赖 | 无第三方依赖；可选本地服务需要 Node.js 22+ |"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 29,
          "endLine": 29,
          "text": "## 一图理解想法与方向"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 31,
          "endLine": 31,
          "text": "完整图已放在本文与网页开头，作为阅读引导。产品与变现四项、工具实践六项、创作表达两项，都按各自阶段记录。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 33,
          "endLine": 33,
          "text": "图：2026-10-26 使用内置 ImageGen 生成，依据本页内容数据整理。三个分支表示探索脉络，不表示项目依赖或开发先后。底部是共同的验证循环，历史进展不代表当前验收。可[查看原图](assets/images/directions-map-v1.png)或[完整生成提示词](research/project-map-prompt.txt)。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "## 收录内容"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 37,
          "endLine": 37,
          "text": "共十二个主要方向、三类探索脉络、九个历史入口。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 39,
          "endLine": 43,
          "text": "| 分类 | 方向 |\n| --- | --- |\n| 产品与变现（4） | 真实需求研究与商业机会筛选；个人 IP、技术内容与 SEO；四个轻量产品候选；小票、PDF 与供应商价格册 |\n| 产品与工具（6） | 音频与音乐局部修改；咖啡全过程 3D；共想室；岗位变化观察站；跨设备互联；论文研究工作台 |\n| 创作与表达（2） | 艺术、审美与动态视觉系列；原创 AI 室友短剧 |"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 45,
          "endLine": 45,
          "text": "补充保留 3D 场景、小龙动态形象、儿童内容与互动的探索线索，以及游戏支线的历史登记口径。四个轻量候选、价格资料方向的停止项、两部艺术作品和短剧各集在详情中分别记录。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 47,
          "endLine": 47,
          "text": "## 网页功能"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 49,
          "endLine": 53,
          "text": "- 按分类、阶段、有无历史入口组合筛选，支持跨目标、进展、分项内容的关键词搜索。\n- 每个方向提供已知进展、尚未验证、分项取舍、下一份证据与来源说明。\n- 方向详情支持 hash 地址，例如 `#direction/paper-workbench`；关闭弹窗保留原筛选状态。\n- 支持完整 Markdown、结构化 JSON 导出，以及单条记录复制；剪贴板不可用时改为下载单条 Markdown。\n- 桌面、平板、手机自适应；提供键盘焦点、跳转链接、Esc 关闭和减少动态效果支持。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 55,
          "endLine": 55,
          "text": "## 本地运行"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 57,
          "endLine": 57,
          "text": "`app/` 为纯静态 HTML、CSS、JavaScript，资源均使用相对路径，不需要 API 密钥、登录或安装依赖。可用浏览器打开 `app/index.html`；本次内置浏览器仅允许 HTTP/HTTPS，因此实际交互验收通过下面的本地服务完成，未验证 `file://` 模式。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 59,
          "endLine": 59,
          "text": "推荐在当前子项目目录运行："
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 61,
          "endLine": 64,
          "text": "```powershell\ncd E:\\codex_project\\1025_codex_project\\projects\\001-early-directions-atlas\nnpm.cmd run dev\n```"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 66,
          "endLine": 66,
          "text": "启动后访问 http://127.0.0.1:4317/ 。服务仅监听本机，用 Ctrl+C 停止。端口被占用时可在本次终端中设置 `$env:PORT = '4318'` 后重试。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 68,
          "endLine": 68,
          "text": "检查命令："
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 70,
          "endLine": 72,
          "text": "```powershell\nnpm.cmd run check\n```"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 74,
          "endLine": 74,
          "text": "仓库根目录另执行 `npm.cmd run check`，验证项目登记与总索引一致。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 76,
          "endLine": 76,
          "text": "## 资料与维护"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 78,
          "endLine": 85,
          "text": "```text\napp/\n  index.html           页面结构\n  data.js              十二个方向、来源与建议的内容数据\n  app.js               筛选、详情、深链接和导出\n  styles.css           响应式样式\n  favicon.svg          原创站点标识\nserve.mjs              仅用于本地预览的静态服务"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 86,
          "endLine": 93,
          "text": "research/\n  notes.md             整理原则、验证记录与限制\n  archive-snapshot.md  浏览器实际导出的完整文字快照\nassets/images/\n  cover.jpg            桌面首屏\n  catalog.jpg          方向目录\n  mobile-detail.jpg    手机详情\n```"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 95,
          "endLine": 95,
          "text": "以后增补内容以 `app/data.js` 为准。修改方向数量或分类后，同时检查页面静态文案、目录导航计数和 README；重新导出并更新文字快照。候选是否立项、作品是否验收、建议是否接受，分别依据新增证据更新，不能由整理日期自动推断。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 97,
          "endLine": 97,
          "text": "部署按根目录 [Web 部署约定](../../docs/DEPLOYMENT.md) 执行：`pages.config.json` 声明公开项目，构建时仅复制 `app/` 和指定的引导图，GitHub Actions 将它们挂载到编号子路径。研究笔记、提示词和其他截图不会进入网站产物。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 99,
          "endLine": 99,
          "text": "## 边界与来源"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 101,
          "endLine": 105,
          "text": "- 所有项目进展依据用户提供的回溯材料，不将资料页、方案页或短测试描述为完整产品。\n- 岗位站的 403、最后成功采集日期与游戏 45 款／99 入口均保留历史日期，未作为当前运行状态重新确认。\n- 页面中的“下一份证据”和“下一步”是本次整理及上一轮讨论建议，尚未确认立项。\n- 本页面未复制上游代码或外部媒体。主引导图使用内置 ImageGen 生成，站点标识由本项目 SVG 绘制，截图来自本项目预览。\n- 总库尚未选择统一开源许可证；历史入口指向的作品、仓库与素材沿用各自权利和授权，不因被本页收录而改变。"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 107,
          "endLine": 107,
          "text": "![方向目录实际截图](assets/images/catalog.jpg)"
        },
        {
          "path": "projects/001-early-directions-atlas/README.md",
          "startLine": 109,
          "endLine": 109,
          "text": "图：分类、阶段筛选与历史进展卡片。更多验证记录见 [research/notes.md](research/notes.md)。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 5,
        "endLine": 23,
        "text": "    {\n      \"id\": \"001\",\n      \"slug\": \"early-directions-atlas\",\n      \"name\": \"早期方向档案\",\n      \"summary\": \"把早期的 12 个产品、工具与创作方向整理成一张地图。可查每个想法做到哪一步、为何继续或暂停，以及接下来要验证什么。\",\n      \"source\": \"https://github.com/yydshly/1025_codex_project\",\n      \"sourceName\": \"本库原创档案（无上游源库）\",\n      \"status\": \"completed\",\n      \"tags\": [\n        \"早期思考\",\n        \"遗留方向\",\n        \"AI产品\",\n        \"创作\",\n        \"历史回溯\"\n      ],\n      \"cover\": \"assets/images/directions-map-v1.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/\",\n      \"createdAt\": \"2026-10-26\"\n    },"
      }
    },
    {
      "id": "002",
      "slug": "ink-rain-alley",
      "name": "未完 · 水墨叙事",
      "summary": "参考 Bee 的录屏独立实现九段滚动水墨叙事。看雨巷、四季湖景与莲花如何用画幅、遮罩、微动和声音串起来。公开演示收在 005「纸间」。",
      "source": "https://x.com/thtbee_/status/2114030630887641448",
      "status": "completed",
      "tags": [
        "Three.js",
        "WebGL",
        "水墨叙事",
        "程序生成",
        "交互动画"
      ],
      "createdAt": "2026-10-26",
      "readmePath": "projects/002-ink-rain-alley/README.md",
      "readmeSha256": "ea7958c55dfa97c786e110c8eae94a92dfa825df15e09e232999b3f3487ebe90",
      "readmeText": "# 002 · 未完 · 水墨叙事（NOT YET）\n\n> 拼贴封面与九章动态故事，由 Three.js、Canvas 与着色器绘制，支持滚动叙事、自动游览、四季切换、磁带翻面和合成环境音。2.2.0 精修夏景、冬景与莲花，加入原创氛围配乐、独立混音和更清楚的操作控件。\n\n[返回总索引](../../README.md#项目索引) · [研究笔记](research/notes.md) · [视觉与交互验证](design-qa.md)\n\n![完整故事的本地截图总览](assets/images/story-overview.jpg)\n\n图：2.2.0 实际浏览器截图，包含封面、九章与四季中的多个状态。\n\n[本轮夏景／冬景／莲花前后对照](assets/images/v2.2-before-after.jpg)。\n\n功能齐全不等于视觉已经贴合原作。本项目依据录屏独立重写，尚未取得原演示源码；花瓣轮廓、镜头运动和墨迹流动仍有差异。可查看[参考与当前实现对照](assets/images/story-comparison.jpg)判断画面，而不把章节数量或交互通过作为视觉一致的证明。\n\n\n[纸间 · 风格入口与两个新主题](../005-paper-poetics-lab/README.md) 将本演示作为参考练习关联，并整理共同方法。\n\n## 2.1.0 视觉调整\n\n- 玫瑰改用连续螺旋曲面形成卷曲叠瓣；莲花使用分层曲面与柔光着色，减轻硬边和深色背面。\n- 森林改为向上收束的密集黑色枝干，保留深红天空和下方纸白过渡。\n- 湖景调整为暖色山谷、日落与集中在太阳下方的金色倒影；弯曲草叶、蒲公英、春季薰衣草、秋日红色山坡和冬季雪松分别构成前景。雪松纹理由 Canvas 绘制。\n- 墨圈与笑脸采用更厚的浓墨轮廓、粗糙边缘和干笔留白；纸面颗粒、撕纸纤维与缝线更明显，底部控件减少对画面的遮挡。\n\n这些调整仍是程序化近似。动态模式没有使用外部照片、参考视频或预先渲染的场景图片；兼容模式使用本项目已有的真实运行截图。\n\n## 2.2.0 · 画面与声音\n\n- 夏景改为不规则草丛、孤立茎叶和少量蒲公英，保留更大的水面空隙。\n- 冬景改用 6 种具有深色树冠与零碎积雪的程序松树纹理，远近树群分开布局。\n- 莲花由竖直花苞渐变为三层杯形花瓣；低雾移到花朵下方，保留花瓣正反面的明暗。\n- 四季和全局控件增加字号及操作面积，窄屏页脚分成两行。\n- 新增《纸上归途》原创程序配乐：54 BPM、约 71 秒循环，柔和钢琴音色与长音，无鼓点、无人声。音色不是实际钢琴录音，旋律和合成过程可追溯。\n\n先点击“声音 关”开启，或打开“调音”。可选“配乐与环境”或“只听环境”，总音量、配乐和环境三个音量独立调整。配乐保持连续，风、雨、水声随章节淡入淡出；暂停动态或切到后台时，声音一起淡出并暂停，继续后恢复。\n\n[36 秒配乐试听](assets/audio/paper-home-preview.mp3) · [音符、来源与重生成方法](assets/audio/README.md)。实际运行只在用户开启后加载约 370 KB 的本地 OGG 音轨，试听与 WAV 母带不参与网页加载。运行时没有音乐生成服务或外部音频请求。\n\n常规动画绘制限制到约 60 FPS；增加 `?inspect=1` 可显示当前浏览器的 FPS、p95 帧间隔和 CPU 提交时间，例如 `http://127.0.0.1:4174/?inspect=1#seasons`。它是本机观察窗口，不代表 GPU 耗时或实体手机性能保证，普通浏览不显示。\n\n## 浏览器兼容与线上入口 · 2026-10-27\n\n**002 是本项目的效果实现，005 是关联它的研究与扩展入口。** [打开002九章重写](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html)；构建产物嵌入005的 `original/` 子路径，没有另建重复项目。\n\n动态模式需要可创建的 WebGL 2 上下文。用户提供的 `GL_VENDOR = Disabled / GL_RENDERER = Disabled / BindToCurrentSequence failed` 日志发生在上下文创建阶段，尚未开始绘制场景；它不表示部署资源缺失，也不能单凭这段日志判断具体是设置、驱动还是策略导致。\n\n- 创建失败、上下文中断或场景绘制异常时，自动切换为明确标注的**静态章节浏览**，停止原渲染与声音，不再自动刷新重试。\n- 兼容浏览包含封面与九章、四季切换、当前章节hash定位及原图放大。素材来自本项目v2.2实际运行截图，**不是实时动画，也不是原作者录屏**；截图里的旧控件不可操作。\n- [直接打开兼容浏览](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html?preview=static#rain)。本地可用 `http://127.0.0.1:4174/?preview=static#rain`。重试入口移除 `preview` 参数并保留章节；图形服务仍不可用时会再次回到截图浏览。\n- WebGL只探测一次，成功后复用同一上下文；关闭不必要的最终画布抗锯齿，采用默认功耗偏好，画布与合成目标按同一比例限制在1600×1100以内。这些降低资源要求，不能替浏览器启用已禁用的图形服务。\n\n排查范围、检查与截图见[兼容处理记录](research/browser-compatibility-2026-10-27.md)。\n\n## 本地运行\n\n需要 Node.js 22.12 或更新版本，以及支持 WebGL 2 的浏览器。\n\n```powershell\ncd E:\\codex_project\\1025_codex_project\\projects\\002-ink-rain-alley\nnpm ci\nnpm run dev\n```\n\n打开 [http://127.0.0.1:4174/](http://127.0.0.1:4174/)。也可双击 `start-local.cmd`。\n\n当前交付预览已经在后台使用 **4174** 端口运行，直接打开链接即可。若同时启动开发环境，请使用另一个端口：\n\n```powershell\nnpm.cmd run dev -- --port=4175\n```\n\n安装依赖后，渲染引擎、字体和全部场景都从本机加载，不需要 API Key、模型服务或远程图片/视频。请通过本地服务器访问，直接双击 HTML 文件不能加载模块。\n\n## 场景与交互\n\n| 章节 | 动态内容 | 可以操作什么 |\n| --- | --- | --- |\n| 00 序 · 尚未 | 撕纸拼贴、实时雨巷与森林画幅、玫瑰、磁带、拍立得、莲花和蝴蝶 | 展开旅程；点击画面中的雨巷、森林、玫瑰、磁带或莲花进入对应章节 |\n| 01 雨巷 | 街道纵深、撑伞人影、雨线、涟漪、湿地倒影与墨迹边框 | 雨量 0–100；鼠标视差 |\n| 02 口袋里的回声 | 拍立得、车票、伞线稿、磁带卷轴与推进式近景 | 点击磁带或按钮翻转 A/B 面 |\n| 03 尚未盛开 | 连续螺旋玫瑰曲面、弯曲花茎、叶片、纸墨分界 | 随浏览进度变化的花朵与视角 |\n| 04 抬头 | 密集程序分叉树、深红天空、纸白过渡与仰视镜头 | 滚动推进仰视视角；B 面使用另一种天空色调 |\n| 05 四季来信 | 远山、日落、波光、风动草叶、蒲公英、秋树、雪松与雪粒 | 春夏秋冬连续演变；可手动锁定季节，再选择“随故事”恢复 |\n| 06 在暗处生长 | 黑色山坡、孤树、地下根系、流动墨雾 | 随进度生长、平移与轻微摇摆 |\n| 07 泥中之莲 | 多层莲花开合、蝴蝶振翅、墨雾、远处亭塔与近处薄雾 | 浏览进度控制开花；鼠标影响轻微视角与蝴蝶位置 |\n| 08 一笔，归来 | 浓墨轮廓、干笔留白与不规则笔丝逐步画出的墨圈 | “再画一圈”可重播笔触 |\n| 09 仍在这里 | 星夜、月亮、墨迹笑脸与海报文字 | 翻带转场回到雨巷，进入另一面；或从封面重新开始 |\n\n全局操作：\n\n- 滚轮 / 触摸滚动推进故事；右侧节点和“全部章节”目录可跳转。\n- “自动游览”按章节节奏推进；手动滚动会接管并停止自动游览。\n- “暂停动态”冻结场景；“继续动态”恢复。暂停期间仍可跳转章节。\n- 底部进度条可直接定位整个故事；“上一章 / 下一章”切换章节。\n- 方向键与 Page Up / Page Down 切换章节，Home / End 到封面 / 终章，空格暂停动态（焦点不在输入框或按钮内时）。\n- “声音 开 / 关”控制原创配乐和本地合成的雨、风、水声；“调音”内可切换纯环境模式及三个音量。默认静音，须主动点击。\n- 系统偏好减少动态效果时默认暂停；浏览器切到后台时暂停绘制和音频。\n\nB 面复用同一组场景，改变磁带面、雨巷色调、森林天空和四季顺序；它没有额外九章新内容。\n\n## 构建与检查\n\n```powershell\nnpm run check\nnpm test\nnpm run build\n```\n\n输出位于 `dist/`。若 4174 端口空闲，可运行 `npm run preview` 检查构建产物。当前交付使用构建产物预览，页面没有开发热更新连接。\n\n## 实现结构\n\n```text\napp/\n  main.js          时间轴、渲染调度、章节导航、转场与交互\n  story-data.js    封面 / 九章的文案、时长和定位数据\n  story-scenes.js  各章场景组织、森林、山坡、墨圈和终章\n  botanicals.js    螺旋玫瑰、分层莲花、花瓣材质与花茎\n  landscape.js     四季山谷、湖面倒影、草叶与程序植物纹理\n  scene.js         雨巷、人物、雨线、涟漪及反射地面\n  compositor.js    双场景合成、墨迹转场、纸纹与雨巷边框\n  audio.js         用户点击后加载原创循环配乐，合成并混合场景环境音\n  frame-stats.js   仅 ?inspect=1 启用的本机帧率与 CPU 观察窗口\n  paper.js         固定种子随机数、纸纹和花枝\n  shaders.js       雨线、涟漪与共享顶点着色器\n  index.html       文案容器、目录、语义与控制项\n  style.css        本地字体、章节排版和窄屏适配\n```\n\n普通播放只渲染当前场景，转场时渲染相邻两幕。封面和磁带拼贴中的小画幅使用低分辨率实时纹理。树枝、草叶与部分花草使用实例化绘制；冬季松针和积雪绘制为程序纹理。设备像素比和离屏尺寸设有上限。没有后端、账号或数据库。\n\n## 参考与授权\n\n- 视觉参考：[用户提供的转述帖](https://x.com/laopai1990/status/2114146772155294099)、[Bee 的原始演示](https://x.com/thtbee_/status/2114030630887641448)。按录屏中可见的场景与操作重新编写。\n- 未取得原演示源码。场景几何、镜头、文案细节和合成声音为本项目实现，与原演示存在差异；声音没有使用原作录音；2.2.0 新增本项目原创的程序配乐，音符与渲染脚本见 assets/audio/。\n- 玫瑰的连续曲面数学构造参考 Zhaoxu Liu / slandarer 的 [How To Draw A Rose Ball In MATLAB](https://www.mathworks.com/matlabcentral/discussions/tips/847771-how-to-draw-a-rose-ball-in-matlab)，在本项目中以 Three.js 网格重新实现，并调整比例、着色与动态；该来源不是原演示的花朵源码。\n- `reference-rain-alley.png` 与 `reference-storyboard-*.jpg` 为研究用原视频截帧，版权归原作者；`story-comparison.jpg` 将参考截帧与实现并列用于检查。它们不参与运行时渲染。\n- Three.js `0.186.1`：MIT；[引擎仓库](https://github.com/mrdoob/three.js)。总索引的“源库”关联 Bee 的原始演示并注明未取得源库；Three.js 是本实现的运行依赖。\n- Vite `8.3.5`：MIT。Cormorant Garamond，通过 `@fontsource/cormorant-garamond` `5.3.0` 本地加载：OFL-1.1。中文使用系统字体。\n- 本总库尚未选择统一许可证；各依赖保留自身许可证。\n\n版本：2.2.0。收录与验证日期：2026-10-26。\n",
      "passages": [
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 002 · 未完 · 水墨叙事（NOT YET）"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "> 拼贴封面与九章动态故事，由 Three.js、Canvas 与着色器绘制，支持滚动叙事、自动游览、四季切换、磁带翻面和合成环境音。2.2.0 精修夏景、冬景与莲花，加入原创氛围配乐、独立混音和更清楚的操作控件。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "[返回总索引](../../README.md#项目索引) · [研究笔记](research/notes.md) · [视觉与交互验证](design-qa.md)"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 7,
          "endLine": 7,
          "text": "![完整故事的本地截图总览](assets/images/story-overview.jpg)"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "图：2.2.0 实际浏览器截图，包含封面、九章与四季中的多个状态。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 11,
          "endLine": 11,
          "text": "[本轮夏景／冬景／莲花前后对照](assets/images/v2.2-before-after.jpg)。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 13,
          "endLine": 13,
          "text": "功能齐全不等于视觉已经贴合原作。本项目依据录屏独立重写，尚未取得原演示源码；花瓣轮廓、镜头运动和墨迹流动仍有差异。可查看[参考与当前实现对照](assets/images/story-comparison.jpg)判断画面，而不把章节数量或交互通过作为视觉一致的证明。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 16,
          "endLine": 16,
          "text": "[纸间 · 风格入口与两个新主题](../005-paper-poetics-lab/README.md) 将本演示作为参考练习关联，并整理共同方法。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 18,
          "endLine": 18,
          "text": "## 2.1.0 视觉调整"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 20,
          "endLine": 23,
          "text": "- 玫瑰改用连续螺旋曲面形成卷曲叠瓣；莲花使用分层曲面与柔光着色，减轻硬边和深色背面。\n- 森林改为向上收束的密集黑色枝干，保留深红天空和下方纸白过渡。\n- 湖景调整为暖色山谷、日落与集中在太阳下方的金色倒影；弯曲草叶、蒲公英、春季薰衣草、秋日红色山坡和冬季雪松分别构成前景。雪松纹理由 Canvas 绘制。\n- 墨圈与笑脸采用更厚的浓墨轮廓、粗糙边缘和干笔留白；纸面颗粒、撕纸纤维与缝线更明显，底部控件减少对画面的遮挡。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 25,
          "endLine": 25,
          "text": "这些调整仍是程序化近似。动态模式没有使用外部照片、参考视频或预先渲染的场景图片；兼容模式使用本项目已有的真实运行截图。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 27,
          "endLine": 27,
          "text": "## 2.2.0 · 画面与声音"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 29,
          "endLine": 33,
          "text": "- 夏景改为不规则草丛、孤立茎叶和少量蒲公英，保留更大的水面空隙。\n- 冬景改用 6 种具有深色树冠与零碎积雪的程序松树纹理，远近树群分开布局。\n- 莲花由竖直花苞渐变为三层杯形花瓣；低雾移到花朵下方，保留花瓣正反面的明暗。\n- 四季和全局控件增加字号及操作面积，窄屏页脚分成两行。\n- 新增《纸上归途》原创程序配乐：54 BPM、约 71 秒循环，柔和钢琴音色与长音，无鼓点、无人声。音色不是实际钢琴录音，旋律和合成过程可追溯。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "先点击“声音 关”开启，或打开“调音”。可选“配乐与环境”或“只听环境”，总音量、配乐和环境三个音量独立调整。配乐保持连续，风、雨、水声随章节淡入淡出；暂停动态或切到后台时，声音一起淡出并暂停，继续后恢复。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 37,
          "endLine": 37,
          "text": "[36 秒配乐试听](assets/audio/paper-home-preview.mp3) · [音符、来源与重生成方法](assets/audio/README.md)。实际运行只在用户开启后加载约 370 KB 的本地 OGG 音轨，试听与 WAV 母带不参与网页加载。运行时没有音乐生成服务或外部音频请求。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 39,
          "endLine": 39,
          "text": "常规动画绘制限制到约 60 FPS；增加 `?inspect=1` 可显示当前浏览器的 FPS、p95 帧间隔和 CPU 提交时间，例如 `http://127.0.0.1:4174/?inspect=1#seasons`。它是本机观察窗口，不代表 GPU 耗时或实体手机性能保证，普通浏览不显示。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 41,
          "endLine": 41,
          "text": "## 浏览器兼容与线上入口 · 2026-10-27"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 43,
          "endLine": 43,
          "text": "**002 是本项目的效果实现，005 是关联它的研究与扩展入口。** [打开002九章重写](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html)；构建产物嵌入005的 `original/` 子路径，没有另建重复项目。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 45,
          "endLine": 45,
          "text": "动态模式需要可创建的 WebGL 2 上下文。用户提供的 `GL_VENDOR = Disabled / GL_RENDERER = Disabled / BindToCurrentSequence failed` 日志发生在上下文创建阶段，尚未开始绘制场景；它不表示部署资源缺失，也不能单凭这段日志判断具体是设置、驱动还是策略导致。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 47,
          "endLine": 50,
          "text": "- 创建失败、上下文中断或场景绘制异常时，自动切换为明确标注的**静态章节浏览**，停止原渲染与声音，不再自动刷新重试。\n- 兼容浏览包含封面与九章、四季切换、当前章节hash定位及原图放大。素材来自本项目v2.2实际运行截图，**不是实时动画，也不是原作者录屏**；截图里的旧控件不可操作。\n- [直接打开兼容浏览](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html?preview=static#rain)。本地可用 `http://127.0.0.1:4174/?preview=static#rain`。重试入口移除 `preview` 参数并保留章节；图形服务仍不可用时会再次回到截图浏览。\n- WebGL只探测一次，成功后复用同一上下文；关闭不必要的最终画布抗锯齿，采用默认功耗偏好，画布与合成目标按同一比例限制在1600×1100以内。这些降低资源要求，不能替浏览器启用已禁用的图形服务。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 52,
          "endLine": 52,
          "text": "排查范围、检查与截图见[兼容处理记录](research/browser-compatibility-2026-10-27.md)。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 54,
          "endLine": 54,
          "text": "## 本地运行"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 56,
          "endLine": 56,
          "text": "需要 Node.js 22.12 或更新版本，以及支持 WebGL 2 的浏览器。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 58,
          "endLine": 62,
          "text": "```powershell\ncd E:\\codex_project\\1025_codex_project\\projects\\002-ink-rain-alley\nnpm ci\nnpm run dev\n```"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 64,
          "endLine": 64,
          "text": "打开 [http://127.0.0.1:4174/](http://127.0.0.1:4174/)。也可双击 `start-local.cmd`。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 66,
          "endLine": 66,
          "text": "当前交付预览已经在后台使用 **4174** 端口运行，直接打开链接即可。若同时启动开发环境，请使用另一个端口："
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 68,
          "endLine": 70,
          "text": "```powershell\nnpm.cmd run dev -- --port=4175\n```"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 72,
          "endLine": 72,
          "text": "安装依赖后，渲染引擎、字体和全部场景都从本机加载，不需要 API Key、模型服务或远程图片/视频。请通过本地服务器访问，直接双击 HTML 文件不能加载模块。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 74,
          "endLine": 74,
          "text": "## 场景与交互"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 76,
          "endLine": 83,
          "text": "| 章节 | 动态内容 | 可以操作什么 |\n| --- | --- | --- |\n| 00 序 · 尚未 | 撕纸拼贴、实时雨巷与森林画幅、玫瑰、磁带、拍立得、莲花和蝴蝶 | 展开旅程；点击画面中的雨巷、森林、玫瑰、磁带或莲花进入对应章节 |\n| 01 雨巷 | 街道纵深、撑伞人影、雨线、涟漪、湿地倒影与墨迹边框 | 雨量 0–100；鼠标视差 |\n| 02 口袋里的回声 | 拍立得、车票、伞线稿、磁带卷轴与推进式近景 | 点击磁带或按钮翻转 A/B 面 |\n| 03 尚未盛开 | 连续螺旋玫瑰曲面、弯曲花茎、叶片、纸墨分界 | 随浏览进度变化的花朵与视角 |\n| 04 抬头 | 密集程序分叉树、深红天空、纸白过渡与仰视镜头 | 滚动推进仰视视角；B 面使用另一种天空色调 |\n| 05 四季来信 | 远山、日落、波光、风动草叶、蒲公英、秋树、雪松与雪粒 | 春夏秋冬连续演变；可手动锁定季节，再选择“随故事”恢复 |"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 84,
          "endLine": 87,
          "text": "| 06 在暗处生长 | 黑色山坡、孤树、地下根系、流动墨雾 | 随进度生长、平移与轻微摇摆 |\n| 07 泥中之莲 | 多层莲花开合、蝴蝶振翅、墨雾、远处亭塔与近处薄雾 | 浏览进度控制开花；鼠标影响轻微视角与蝴蝶位置 |\n| 08 一笔，归来 | 浓墨轮廓、干笔留白与不规则笔丝逐步画出的墨圈 | “再画一圈”可重播笔触 |\n| 09 仍在这里 | 星夜、月亮、墨迹笑脸与海报文字 | 翻带转场回到雨巷，进入另一面；或从封面重新开始 |"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 89,
          "endLine": 89,
          "text": "全局操作："
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 91,
          "endLine": 97,
          "text": "- 滚轮 / 触摸滚动推进故事；右侧节点和“全部章节”目录可跳转。\n- “自动游览”按章节节奏推进；手动滚动会接管并停止自动游览。\n- “暂停动态”冻结场景；“继续动态”恢复。暂停期间仍可跳转章节。\n- 底部进度条可直接定位整个故事；“上一章 / 下一章”切换章节。\n- 方向键与 Page Up / Page Down 切换章节，Home / End 到封面 / 终章，空格暂停动态（焦点不在输入框或按钮内时）。\n- “声音 开 / 关”控制原创配乐和本地合成的雨、风、水声；“调音”内可切换纯环境模式及三个音量。默认静音，须主动点击。\n- 系统偏好减少动态效果时默认暂停；浏览器切到后台时暂停绘制和音频。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 99,
          "endLine": 99,
          "text": "B 面复用同一组场景，改变磁带面、雨巷色调、森林天空和四季顺序；它没有额外九章新内容。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 101,
          "endLine": 101,
          "text": "## 构建与检查"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 103,
          "endLine": 107,
          "text": "```powershell\nnpm run check\nnpm test\nnpm run build\n```"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 109,
          "endLine": 109,
          "text": "输出位于 `dist/`。若 4174 端口空闲，可运行 `npm run preview` 检查构建产物。当前交付使用构建产物预览，页面没有开发热更新连接。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 111,
          "endLine": 111,
          "text": "## 实现结构"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 113,
          "endLine": 120,
          "text": "```text\napp/\n  main.js          时间轴、渲染调度、章节导航、转场与交互\n  story-data.js    封面 / 九章的文案、时长和定位数据\n  story-scenes.js  各章场景组织、森林、山坡、墨圈和终章\n  botanicals.js    螺旋玫瑰、分层莲花、花瓣材质与花茎\n  landscape.js     四季山谷、湖面倒影、草叶与程序植物纹理\n  scene.js         雨巷、人物、雨线、涟漪及反射地面"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 121,
          "endLine": 128,
          "text": "  compositor.js    双场景合成、墨迹转场、纸纹与雨巷边框\n  audio.js         用户点击后加载原创循环配乐，合成并混合场景环境音\n  frame-stats.js   仅 ?inspect=1 启用的本机帧率与 CPU 观察窗口\n  paper.js         固定种子随机数、纸纹和花枝\n  shaders.js       雨线、涟漪与共享顶点着色器\n  index.html       文案容器、目录、语义与控制项\n  style.css        本地字体、章节排版和窄屏适配\n```"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 130,
          "endLine": 130,
          "text": "普通播放只渲染当前场景，转场时渲染相邻两幕。封面和磁带拼贴中的小画幅使用低分辨率实时纹理。树枝、草叶与部分花草使用实例化绘制；冬季松针和积雪绘制为程序纹理。设备像素比和离屏尺寸设有上限。没有后端、账号或数据库。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 132,
          "endLine": 132,
          "text": "## 参考与授权"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 134,
          "endLine": 140,
          "text": "- 视觉参考：[用户提供的转述帖](https://x.com/laopai1990/status/2114146772155294099)、[Bee 的原始演示](https://x.com/thtbee_/status/2114030630887641448)。按录屏中可见的场景与操作重新编写。\n- 未取得原演示源码。场景几何、镜头、文案细节和合成声音为本项目实现，与原演示存在差异；声音没有使用原作录音；2.2.0 新增本项目原创的程序配乐，音符与渲染脚本见 assets/audio/。\n- 玫瑰的连续曲面数学构造参考 Zhaoxu Liu / slandarer 的 [How To Draw A Rose Ball In MATLAB](https://www.mathworks.com/matlabcentral/discussions/tips/847771-how-to-draw-a-rose-ball-in-matlab)，在本项目中以 Three.js 网格重新实现，并调整比例、着色与动态；该来源不是原演示的花朵源码。\n- `reference-rain-alley.png` 与 `reference-storyboard-*.jpg` 为研究用原视频截帧，版权归原作者；`story-comparison.jpg` 将参考截帧与实现并列用于检查。它们不参与运行时渲染。\n- Three.js `0.186.1`：MIT；[引擎仓库](https://github.com/mrdoob/three.js)。总索引的“源库”关联 Bee 的原始演示并注明未取得源库；Three.js 是本实现的运行依赖。\n- Vite `8.3.5`：MIT。Cormorant Garamond，通过 `@fontsource/cormorant-garamond` `5.3.0` 本地加载：OFL-1.1。中文使用系统字体。\n- 本总库尚未选择统一许可证；各依赖保留自身许可证。"
        },
        {
          "path": "projects/002-ink-rain-alley/README.md",
          "startLine": 142,
          "endLine": 142,
          "text": "版本：2.2.0。收录与验证日期：2026-10-26。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 24,
        "endLine": 42,
        "text": "    {\n      \"id\": \"002\",\n      \"slug\": \"ink-rain-alley\",\n      \"name\": \"未完 · 水墨叙事\",\n      \"summary\": \"参考 Bee 的录屏独立实现九段滚动水墨叙事。看雨巷、四季湖景与莲花如何用画幅、遮罩、微动和声音串起来。公开演示收在 005「纸间」。\",\n      \"source\": \"https://x.com/thtbee_/status/2114030630887641448\",\n      \"sourceName\": \"Bee 原演示（未取得源库）\",\n      \"status\": \"completed\",\n      \"tags\": [\n        \"Three.js\",\n        \"WebGL\",\n        \"水墨叙事\",\n        \"程序生成\",\n        \"交互动画\"\n      ],\n      \"cover\": \"assets/images/cover.jpg\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html\",\n      \"createdAt\": \"2026-10-26\"\n    },"
      }
    },
    {
      "id": "003",
      "slug": "unified-learning-design",
      "name": "连续主题体验设计",
      "summary": "体验三课可翻页、可调参的三维物理书。实验状态同时驱动模型、数值、镜头和 MiniMax 导览，适合参考互动教材怎样组织内容和反馈。",
      "source": "https://github.com/iamtechartist/every-joule-lesson1",
      "status": "completed",
      "tags": [
        "Three.js",
        "3D书籍",
        "效果复刻",
        "交互学习",
        "方法论"
      ],
      "createdAt": "2026-10-26",
      "readmePath": "projects/003-unified-learning-design/README.md",
      "readmeSha256": "34b369fc6dfbf4750cc3c5645516ccddfc4fc33928fcf707daf65f940d092493",
      "readmeText": "# 003 · 连续主题体验设计\n\n**一个主题，一个合适的载体，相互关联的章节，持续一致的风格，每页都有新的发现。**\n\n这是以 Every Joule 为参照的独立研究与三课可运行样章：把课文、立体实验、物理计算和中文有声讲解组织在同一本三维书里，并从中提炼连续主题体验的设计方法。本阶段研究已完成，成果保留为后续相关产品的理解与复用参考。\n\n| 看什么 | 本项目具体提供什么 |\n| --- | --- |\n| **效果** | 可翻页、掀盖和环视的三维物理书；纸页、瓶架、轨道与弹簧装置处于同一场景，能量变化用液位、颜色和数值呈现。 |\n| **能力** | 三课物理实验、参数操作、预测与结果反馈、MiniMax逐句导览、镜头取景和对象高亮、局部文字放大、七段连续阅读，以及暂停、回退和阅读前后状态恢复。 |\n| **原理** | Three.js构建曲面纸页与立体器材；在明确假设下计算滚动、耗散、弹簧发射与接触；共享状态联动物体、数值、镜头、语音与解释，让阅读和实验保持上下文。 |\n| **价值** | 提供可运行的交互样章与内容、展示、讲解、操作和反馈统一设计的方法，供互动教材、产品原理说明、主题展览及实验平台选题参考。实际学习效果仍需受众验证。 |\n\n当前实现为三课独立样章。教材与实验并排、双屏协作、实验记录本、主题工作台及虚实实验台等均标为后续设想；现有样章尚未形成可直接换题的通用实验引擎。\n\n[研究汇总网页](app/research-summary.html) · [一张图看全貌](assets/images/understanding-atlas.png) · [可编辑总览图](assets/images/understanding-atlas.svg) · [返回总索引](../../README.md#项目索引) · [3D 复刻样章](app/index.html) · [方法总览](app/handbook.html) · [书页关联图](experience-map.md) · [完整方法](method.md) · [扩展方向](expansion.md)\n\n**在线访问：[研究总览](https://yydshly.github.io/1025_codex_project/003-unified-learning-design/) · [三维物理样章](https://yydshly.github.io/1025_codex_project/003-unified-learning-design/app/index.html)。** 已于2026-10-27通过GitHub Pages部署并核验；[发布记录与截图](research/deployment.md)。\n\n![连续主题体验研究总览：产品思路、意义与价值、真实样章效果、设计方法和未来呈现形态](assets/images/understanding-atlas.png)\n\n引导图：本阶段生成的完整研究总览，点击可查看原图。真实效果截图均来自本项目独立样章；未来呈现画面为AI概念图，和已实现能力分别标注。[可编辑SVG](assets/images/understanding-atlas.svg) · [制作与提示词记录](research/summary-assets.json)。\n\n## 本阶段汇总与后续复用\n\n本阶段完成了从原作观察、独立样章实现到通用方法与产品方向的整理。现阶段成果用于理解、演示和后续项目参考；遇到具体产品时，再按真实用户、知识关系与使用场景选择载体和交互。\n\n- [研究汇总网页](app/research-summary.html)：研究路径、核心认识、意义与预期价值、真实样章效果、六层协同与体验流程、教材／实验／讲解／记录的联动、七种呈现形态、八类产品方向、跨主题复用与边界。\n- [完整总览长图 PNG](assets/images/understanding-atlas.png) · [可编辑 SVG](assets/images/understanding-atlas.svg)：同一张图汇总方法、当前成果、产品思路和未来扩展，可下载并放大查看。\n- 未来呈现效果使用[概念图](assets/images/future-layout-concepts.png)说明，和真实样章截图分别标注。概念画面由内置ImageGen生成，提示词及素材来源保存在[制作记录](research/summary-assets.json)。\n- 重建总览图：`python scripts/create-understanding-atlas.py`。当前实现模块、设计方法和未来产品设想分别保留，不把概念布局或预期价值当作已上线能力、通用引擎或已证实学习效果。\n\n## 先复刻原站的 3D 核心效果\n\n当前默认入口是基于 Three.js 独立实现的三课样章，以 Every Joule 的实际画面为参照。桌面、纸页、书芯、瓶架、轨道和发射装置都处于同一个三维场景中，支持拖动视角、靠近模型、纸张弯曲翻页和立体解释翻盖。\n\n![3D 书页和实验装置的实际浏览器截图](assets/images/optimized-overview.png)\n\nv4.4 在 **物理接触、逐句导演和预测反馈** 的基础上补齐连续阅读：可固定当前段落、按目录切段，并在阅读后回到原来的实验或讲解状态。当前13段讲解继续使用 MiniMax 配音。默认从斜侧方观察，能看见书页厚度和器材之间的距离。点击“开始有声导览”，会按 9 个段落走过三个场景：先指出观察对象，选出预测，再执行实验、停在关键点解释和对照判断，最后完成一个小挑战。\n\n- 第一课：八件物品与能量类型关联。瓶子是图例，不再给未测量的物品填写任意焦耳数。\n- 第二课：先选预测，再松手验证；镜头按“看小球 → 看动能／内能瓶 → 核对总量”逐句推进。回退重新恢复同样的初始条件，纸页预测与导览选择同步。\n- 第三课：导槽、圆角槽口、球、底座与软垫共享几何参数。低压缩量可沿槽口返回，接触哪个表面就按该表面处理。势能以底座为参考，垫上停球保留少量势能；最后比较 0.18 m／0.36 m 压缩的弹性势能。\n- 导演：自动取景、对象圈选、同步中文语音与字幕；在谷底、最高点、落地等真实状态停下。导览慢放 ×0.55，可暂停、重播、静音、回退和退出。暂停时可拖动环视、滚轮缩放，实验状态保持冻结；继续时恢复导演镜头。阅读进入导览自动收起阅读面板；翻页期间暂停和后台暂停均保留。\n- 自由探索：全景／实验／阅读、拖动视角、双击靠近、参数滑块、翻页和阅读面板保留。页面中明确给出下一步按钮。\n\n![逐句镜头指向能量瓶，字幕、预测反馈和数值对应](assets/images/optimized-energy-cue.png)\n\n### 书页文字放大镜与连续阅读\n\n桌面默认开启：把鼠标移到正文、公式、关键词、预测题、解释、挑战或图注上，会同时出现 **2.15×圆形局部画面放大** 和对应区块的 **大字阅读卡**。放大层使用本项目自己的画面与课文，书本和实验仍留在原位置。\n\n- 按 **M** 或点击工具栏放大镜，会固定当前或最近查看的段落，进入时保持镜头位置。鼠标悬停放大默认可用，工具栏入口用于固定阅读。\n- 固定卡提供 **正文 → 公式 → 关键词 → 预测 → 解释 → 挑战 → 图注** 七段目录，以及“上一段／下一段”。焦点在阅读卡内时，可用 **←／→** 或 **PageUp／PageDown** 切段；下拉目录保留原生键盘操作。解释盖板未揭开时，目录中的解释项仍只显示提示。\n- 阅读期间暂停物理运动与 MiniMax 讲解，并收起导演面板、实验控件和手机阅读入口，为可滚动正文留出空间。按 **Esc** 或点卡片上的返回按钮退出：进入前在播放就继续原来的讲解或实验，进入前已暂停则保持暂停。切段不会覆盖首次进入时保存的状态。\n- 自由探索时，拖动视角、滚轮缩放、翻页或恢复导演镜头会清理悬停放大层；被器材遮住的纸面不会穿透读取。\n- 触摸／笔支持约 **460 ms长按**，保持按住后可滑动切换阅读区块；这条路径已实现，尚未在真实触屏或笔设备验证。\n\n![书页局部圆镜和对应大字阅读卡](assets/images/magnifier-hover.png)\n\n[桌面固定公式阅读](assets/images/reading-v4.4/02-fixed-formula.png) · [手机公式阅读](assets/images/reading-v4.4/04-mobile-formula.png)。v4.4 浏览器验证中，手机正文可滚动区域高度由约79.56 px增至196 px；进入阅读再返回，所比较的图书区域像素差为0。37项测试通过，详细记录见[验证记录](design-qa.md)。本次完善连续阅读、正文空间和阅读前后状态衔接；按段语音、更多物理功能与进度保存留待后续。\n\n这是三课核心效果的独立复刻与教学交互迭代，**不是原站十课内容的完整复制或逐像素一致版本**。声音由 MiniMax speech-2.8-hd 的“温柔学姐”系统音色生成，未复制原作配音。音频预先生成并在本地播放，浏览器不读取密钥或调用语音API。物理采用明确的理想化模型，不含完整材料形变、空气阻力、刚体碰撞或持久存档。[模型与依据](research/physics-models.md) · [验证记录](design-qa.md)。\n\n上一版“种子”主题书仍保存在 [seed-book.html](app/seed-book.html)，[方法总览](app/handbook.html)继续保留筛选实验、扩展方向和规划工具。\n\n### 本地运行\n\n```powershell\nnpm.cmd ci\nnpm.cmd run assets\nnpm.cmd run dev\n```\n\n打开 [本地预览](http://127.0.0.1:4183/app/)。已包含准备好的 `app/vendor/` 静态依赖，直接预览时也可双击 `start-local.cmd`。保持服务窗口开启，停止用 `Ctrl+C`；端口占用可用 `npm.cmd run dev -- --port=4184`。\n\n需要 Node.js 22 或更新版本运行服务，浏览器需要 WebGL。运行不请求远程脚本、字体或原作素材；Three.js 和字体均在本地。无需框架构建。`npm run check` 检查应用与工具脚本语法，`npm test` 运行物理边界、导演状态、语音及阅读区域验证；`npm run voice` 通过 MiniMax 生成并缓存中文音频，默认读取外部 `F:/codex_project/.env.minimax`；其他位置使用 `npm run voice -- --env-file \u003c路径>`。配置不复制进项目；已有相同文本与音色的音频会复用，`--force` 才重新生成。生成阶段需要网络和有效 MiniMax 配额，播放只读取本地音频。总库 `npm run check` 检查索引。\n\n### 静态网页发布\n\n线上地址与发布核验见 [research/deployment.md](research/deployment.md)。本项目按总库的[多项目部署约定](../../docs/DEPLOYMENT.md)接入GitHub Pages。\n\n在子项目执行 `npm.cmd run prepare:pages` 准备派生发布目录 `public/`，再由总库发布工具按清单打包。`public/` 是生成结果，内容修改应回到 `app/`、明确公开的资源及原始文档；公开网页中的研究文档入口转到GitHub仓库。发布准备复用已经生成的本地配音文件，不调用MiniMax API，也不读取或打包外部配音凭据。\n\n## 从这里开始\n\n| 你要做什么 | 使用哪个文件 | 做完应得到什么 |\n| --- | --- | --- |\n| 对照原作的空间效果 | [3D 复刻样章](app/index.html) · [复刻记录](research/replica-notes.md) | 查看真实三维书本、立体实验与形变翻页 |\n| 体验上一版主题关联 | [种子主题书](app/seed-book.html) · [书页关联图](experience-map.md) | 感受同一对象如何连接四个章节 |\n| 理解方法 | [完整方法](method.md) | 知道怎样把一个主题组织成可探索的体验 |\n| 浏览交互与扩展方向 | [方法总览](app/handbook.html) · [扩展说明](expansion.md) | 体验一次同步反馈，选择下一步实践方向 |\n| 开始一个新主题 | [主题规划模板](templates/topic-brief.md) | 一份包含目标、风格、章节和交互的具体方案 |\n| 参考实际写法 | [跨主题示例](examples.md) | 节奏、编程筛选和历史叙事三种迁移方式 |\n| 让 AI 按此方法协作 | [AI 协作提示词](templates/ai-brief.md) | 可直接复制的任务说明 |\n| 检查方案是否成立 | [验收清单](review-checklist.md) | 能指出哪段讲解、展示或操作没有接上 |\n\n以后可以直接提出：**“按 003 方法，把某个主题做成一套统一的互动体验方案。”** 先填主题模板中的目标和一个场景，走通后再扩展章节。\n\n## 方法的核心\n\n每个场景都回答同一组问题：\n\n| 层面 | 需要回答的问题 |\n| --- | --- |\n| 内容 | 用户要理解哪一个关系？ |\n| 视觉 | 用什么对象和变化把这个关系表现出来？ |\n| 讲解 | 此刻指着哪个对象，解释哪件事？ |\n| 操作 | 用户改变什么条件，能帮助他理解？ |\n| 反馈 | 结果如何变化，为什么会这样？ |\n| 检验 | 换一个例子，用户还能判断吗？ |\n\n例如讲编程中的筛选：展示一组卡片，让用户改变筛选条件，卡片的保留结果与条件判断同步变化，随后解释原因。所有表达都指向同一个概念。\n\n## 项目状态和使用方式\n\n- 编号：003；版本：v4.4；本次整理更新：2026-10-27。\n- 本阶段研究完成，已有三课3D独立样章、完整研究网页与总览图；原先的连续主题书、方法总览、筛选示例及规划工具全部保留，后续按具体产品需求选择性复用。\n- 本地网页与GitHub Pages正式站点均可访问；线上地址、部署结果与核验范围见[发布记录](research/deployment.md)。交互验证不等于教学效果验证，真实受众试用仍待进行。\n- 在子项目运行 `npm run check` 检查脚本语法，`npm test` 检查物理、导演、语音与阅读区域；在总库根目录运行 `npm run check` 检查索引。\n\n## 灵感来源和授权\n\n灵感来自 Techartist 的 [Every Joule](https://iamtechartist.com/every-joule/) 及其[教师说明](https://iamtechartist.com/Apps/every-joule/teachers.html)。其中的物理课本把概念、立体图示、预测、操作和解释组织在一起；本项目据此提出跨主题的设计工作方法。\n\n总索引的“源库”关联作者公开的 [every-joule-lesson1](https://github.com/iamtechartist/every-joule-lesson1) 发布仓库，便于回到原始研究对象；本项目的方法与三课样章在本研究总库中独立实现。截至 2026-10-26，该发布仓库没有声明开源许可证。本项目没有引入其发布代码或运行素材；`reference-*.png` 为仅用于视觉研究的原站截图，版权属于原作者。\n\n运行依赖 Three.js 0.180.0 使用 MIT 许可证，Source Serif 4 与 Caveat 字体使用 OFL；许可文本随静态依赖保留在 `app/vendor/`。具体版本见 `package-lock.json`。方法文档与独立实现未额外声明统一开源许可证。\n",
      "passages": [
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 003 · 连续主题体验设计"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "**一个主题，一个合适的载体，相互关联的章节，持续一致的风格，每页都有新的发现。**"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "这是以 Every Joule 为参照的独立研究与三课可运行样章：把课文、立体实验、物理计算和中文有声讲解组织在同一本三维书里，并从中提炼连续主题体验的设计方法。本阶段研究已完成，成果保留为后续相关产品的理解与复用参考。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 7,
          "endLine": 12,
          "text": "| 看什么 | 本项目具体提供什么 |\n| --- | --- |\n| **效果** | 可翻页、掀盖和环视的三维物理书；纸页、瓶架、轨道与弹簧装置处于同一场景，能量变化用液位、颜色和数值呈现。 |\n| **能力** | 三课物理实验、参数操作、预测与结果反馈、MiniMax逐句导览、镜头取景和对象高亮、局部文字放大、七段连续阅读，以及暂停、回退和阅读前后状态恢复。 |\n| **原理** | Three.js构建曲面纸页与立体器材；在明确假设下计算滚动、耗散、弹簧发射与接触；共享状态联动物体、数值、镜头、语音与解释，让阅读和实验保持上下文。 |\n| **价值** | 提供可运行的交互样章与内容、展示、讲解、操作和反馈统一设计的方法，供互动教材、产品原理说明、主题展览及实验平台选题参考。实际学习效果仍需受众验证。 |"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 14,
          "endLine": 14,
          "text": "当前实现为三课独立样章。教材与实验并排、双屏协作、实验记录本、主题工作台及虚实实验台等均标为后续设想；现有样章尚未形成可直接换题的通用实验引擎。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 16,
          "endLine": 16,
          "text": "[研究汇总网页](app/research-summary.html) · [一张图看全貌](assets/images/understanding-atlas.png) · [可编辑总览图](assets/images/understanding-atlas.svg) · [返回总索引](../../README.md#项目索引) · [3D 复刻样章](app/index.html) · [方法总览](app/handbook.html) · [书页关联图](experience-map.md) · [完整方法](method.md) · [扩展方向](expansion.md)"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 18,
          "endLine": 18,
          "text": "**在线访问：[研究总览](https://yydshly.github.io/1025_codex_project/003-unified-learning-design/) · [三维物理样章](https://yydshly.github.io/1025_codex_project/003-unified-learning-design/app/index.html)。** 已于2026-10-27通过GitHub Pages部署并核验；[发布记录与截图](research/deployment.md)。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 20,
          "endLine": 20,
          "text": "![连续主题体验研究总览：产品思路、意义与价值、真实样章效果、设计方法和未来呈现形态](assets/images/understanding-atlas.png)"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 22,
          "endLine": 22,
          "text": "引导图：本阶段生成的完整研究总览，点击可查看原图。真实效果截图均来自本项目独立样章；未来呈现画面为AI概念图，和已实现能力分别标注。[可编辑SVG](assets/images/understanding-atlas.svg) · [制作与提示词记录](research/summary-assets.json)。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 24,
          "endLine": 24,
          "text": "## 本阶段汇总与后续复用"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 26,
          "endLine": 26,
          "text": "本阶段完成了从原作观察、独立样章实现到通用方法与产品方向的整理。现阶段成果用于理解、演示和后续项目参考；遇到具体产品时，再按真实用户、知识关系与使用场景选择载体和交互。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 28,
          "endLine": 31,
          "text": "- [研究汇总网页](app/research-summary.html)：研究路径、核心认识、意义与预期价值、真实样章效果、六层协同与体验流程、教材／实验／讲解／记录的联动、七种呈现形态、八类产品方向、跨主题复用与边界。\n- [完整总览长图 PNG](assets/images/understanding-atlas.png) · [可编辑 SVG](assets/images/understanding-atlas.svg)：同一张图汇总方法、当前成果、产品思路和未来扩展，可下载并放大查看。\n- 未来呈现效果使用[概念图](assets/images/future-layout-concepts.png)说明，和真实样章截图分别标注。概念画面由内置ImageGen生成，提示词及素材来源保存在[制作记录](research/summary-assets.json)。\n- 重建总览图：`python scripts/create-understanding-atlas.py`。当前实现模块、设计方法和未来产品设想分别保留，不把概念布局或预期价值当作已上线能力、通用引擎或已证实学习效果。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 33,
          "endLine": 33,
          "text": "## 先复刻原站的 3D 核心效果"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "当前默认入口是基于 Three.js 独立实现的三课样章，以 Every Joule 的实际画面为参照。桌面、纸页、书芯、瓶架、轨道和发射装置都处于同一个三维场景中，支持拖动视角、靠近模型、纸张弯曲翻页和立体解释翻盖。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 37,
          "endLine": 37,
          "text": "![3D 书页和实验装置的实际浏览器截图](assets/images/optimized-overview.png)"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 39,
          "endLine": 39,
          "text": "v4.4 在 **物理接触、逐句导演和预测反馈** 的基础上补齐连续阅读：可固定当前段落、按目录切段，并在阅读后回到原来的实验或讲解状态。当前13段讲解继续使用 MiniMax 配音。默认从斜侧方观察，能看见书页厚度和器材之间的距离。点击“开始有声导览”，会按 9 个段落走过三个场景：先指出观察对象，选出预测，再执行实验、停在关键点解释和对照判断，最后完成一个小挑战。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 41,
          "endLine": 45,
          "text": "- 第一课：八件物品与能量类型关联。瓶子是图例，不再给未测量的物品填写任意焦耳数。\n- 第二课：先选预测，再松手验证；镜头按“看小球 → 看动能／内能瓶 → 核对总量”逐句推进。回退重新恢复同样的初始条件，纸页预测与导览选择同步。\n- 第三课：导槽、圆角槽口、球、底座与软垫共享几何参数。低压缩量可沿槽口返回，接触哪个表面就按该表面处理。势能以底座为参考，垫上停球保留少量势能；最后比较 0.18 m／0.36 m 压缩的弹性势能。\n- 导演：自动取景、对象圈选、同步中文语音与字幕；在谷底、最高点、落地等真实状态停下。导览慢放 ×0.55，可暂停、重播、静音、回退和退出。暂停时可拖动环视、滚轮缩放，实验状态保持冻结；继续时恢复导演镜头。阅读进入导览自动收起阅读面板；翻页期间暂停和后台暂停均保留。\n- 自由探索：全景／实验／阅读、拖动视角、双击靠近、参数滑块、翻页和阅读面板保留。页面中明确给出下一步按钮。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 47,
          "endLine": 47,
          "text": "![逐句镜头指向能量瓶，字幕、预测反馈和数值对应](assets/images/optimized-energy-cue.png)"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 49,
          "endLine": 49,
          "text": "### 书页文字放大镜与连续阅读"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 51,
          "endLine": 51,
          "text": "桌面默认开启：把鼠标移到正文、公式、关键词、预测题、解释、挑战或图注上，会同时出现 **2.15×圆形局部画面放大** 和对应区块的 **大字阅读卡**。放大层使用本项目自己的画面与课文，书本和实验仍留在原位置。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 53,
          "endLine": 57,
          "text": "- 按 **M** 或点击工具栏放大镜，会固定当前或最近查看的段落，进入时保持镜头位置。鼠标悬停放大默认可用，工具栏入口用于固定阅读。\n- 固定卡提供 **正文 → 公式 → 关键词 → 预测 → 解释 → 挑战 → 图注** 七段目录，以及“上一段／下一段”。焦点在阅读卡内时，可用 **←／→** 或 **PageUp／PageDown** 切段；下拉目录保留原生键盘操作。解释盖板未揭开时，目录中的解释项仍只显示提示。\n- 阅读期间暂停物理运动与 MiniMax 讲解，并收起导演面板、实验控件和手机阅读入口，为可滚动正文留出空间。按 **Esc** 或点卡片上的返回按钮退出：进入前在播放就继续原来的讲解或实验，进入前已暂停则保持暂停。切段不会覆盖首次进入时保存的状态。\n- 自由探索时，拖动视角、滚轮缩放、翻页或恢复导演镜头会清理悬停放大层；被器材遮住的纸面不会穿透读取。\n- 触摸／笔支持约 **460 ms长按**，保持按住后可滑动切换阅读区块；这条路径已实现，尚未在真实触屏或笔设备验证。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 59,
          "endLine": 59,
          "text": "![书页局部圆镜和对应大字阅读卡](assets/images/magnifier-hover.png)"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 61,
          "endLine": 61,
          "text": "[桌面固定公式阅读](assets/images/reading-v4.4/02-fixed-formula.png) · [手机公式阅读](assets/images/reading-v4.4/04-mobile-formula.png)。v4.4 浏览器验证中，手机正文可滚动区域高度由约79.56 px增至196 px；进入阅读再返回，所比较的图书区域像素差为0。37项测试通过，详细记录见[验证记录](design-qa.md)。本次完善连续阅读、正文空间和阅读前后状态衔接；按段语音、更多物理功能与进度保存留待后续。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 63,
          "endLine": 63,
          "text": "这是三课核心效果的独立复刻与教学交互迭代，**不是原站十课内容的完整复制或逐像素一致版本**。声音由 MiniMax speech-2.8-hd 的“温柔学姐”系统音色生成，未复制原作配音。音频预先生成并在本地播放，浏览器不读取密钥或调用语音API。物理采用明确的理想化模型，不含完整材料形变、空气阻力、刚体碰撞或持久存档。[模型与依据](research/physics-models.md) · [验证记录](design-qa.md)。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 65,
          "endLine": 65,
          "text": "上一版“种子”主题书仍保存在 [seed-book.html](app/seed-book.html)，[方法总览](app/handbook.html)继续保留筛选实验、扩展方向和规划工具。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 67,
          "endLine": 67,
          "text": "### 本地运行"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 69,
          "endLine": 73,
          "text": "```powershell\nnpm.cmd ci\nnpm.cmd run assets\nnpm.cmd run dev\n```"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 75,
          "endLine": 75,
          "text": "打开 [本地预览](http://127.0.0.1:4183/app/)。已包含准备好的 `app/vendor/` 静态依赖，直接预览时也可双击 `start-local.cmd`。保持服务窗口开启，停止用 `Ctrl+C`；端口占用可用 `npm.cmd run dev -- --port=4184`。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 77,
          "endLine": 77,
          "text": "需要 Node.js 22 或更新版本运行服务，浏览器需要 WebGL。运行不请求远程脚本、字体或原作素材；Three.js 和字体均在本地。无需框架构建。`npm run check` 检查应用与工具脚本语法，`npm test` 运行物理边界、导演状态、语音及阅读区域验证；`npm run voice` 通过 MiniMax 生成并缓存中文音频，默认读取外部 `F:/codex_project/.env.minimax`；其他位置使用 `npm run voice -- --env-file \u003c路径>`。配置不复制进项目；已有相同文本与音色的音频会复用，`--force` 才重新生成。生成阶段需要网络和有效 MiniMax 配额，播放只读取本地音频。总库 `npm run check` 检查索引。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 79,
          "endLine": 79,
          "text": "### 静态网页发布"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 81,
          "endLine": 81,
          "text": "线上地址与发布核验见 [research/deployment.md](research/deployment.md)。本项目按总库的[多项目部署约定](../../docs/DEPLOYMENT.md)接入GitHub Pages。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 83,
          "endLine": 83,
          "text": "在子项目执行 `npm.cmd run prepare:pages` 准备派生发布目录 `public/`，再由总库发布工具按清单打包。`public/` 是生成结果，内容修改应回到 `app/`、明确公开的资源及原始文档；公开网页中的研究文档入口转到GitHub仓库。发布准备复用已经生成的本地配音文件，不调用MiniMax API，也不读取或打包外部配音凭据。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 85,
          "endLine": 85,
          "text": "## 从这里开始"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 87,
          "endLine": 94,
          "text": "| 你要做什么 | 使用哪个文件 | 做完应得到什么 |\n| --- | --- | --- |\n| 对照原作的空间效果 | [3D 复刻样章](app/index.html) · [复刻记录](research/replica-notes.md) | 查看真实三维书本、立体实验与形变翻页 |\n| 体验上一版主题关联 | [种子主题书](app/seed-book.html) · [书页关联图](experience-map.md) | 感受同一对象如何连接四个章节 |\n| 理解方法 | [完整方法](method.md) | 知道怎样把一个主题组织成可探索的体验 |\n| 浏览交互与扩展方向 | [方法总览](app/handbook.html) · [扩展说明](expansion.md) | 体验一次同步反馈，选择下一步实践方向 |\n| 开始一个新主题 | [主题规划模板](templates/topic-brief.md) | 一份包含目标、风格、章节和交互的具体方案 |\n| 参考实际写法 | [跨主题示例](examples.md) | 节奏、编程筛选和历史叙事三种迁移方式 |"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 95,
          "endLine": 96,
          "text": "| 让 AI 按此方法协作 | [AI 协作提示词](templates/ai-brief.md) | 可直接复制的任务说明 |\n| 检查方案是否成立 | [验收清单](review-checklist.md) | 能指出哪段讲解、展示或操作没有接上 |"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 98,
          "endLine": 98,
          "text": "以后可以直接提出：**“按 003 方法，把某个主题做成一套统一的互动体验方案。”** 先填主题模板中的目标和一个场景，走通后再扩展章节。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 100,
          "endLine": 100,
          "text": "## 方法的核心"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 102,
          "endLine": 102,
          "text": "每个场景都回答同一组问题："
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 104,
          "endLine": 111,
          "text": "| 层面 | 需要回答的问题 |\n| --- | --- |\n| 内容 | 用户要理解哪一个关系？ |\n| 视觉 | 用什么对象和变化把这个关系表现出来？ |\n| 讲解 | 此刻指着哪个对象，解释哪件事？ |\n| 操作 | 用户改变什么条件，能帮助他理解？ |\n| 反馈 | 结果如何变化，为什么会这样？ |\n| 检验 | 换一个例子，用户还能判断吗？ |"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 113,
          "endLine": 113,
          "text": "例如讲编程中的筛选：展示一组卡片，让用户改变筛选条件，卡片的保留结果与条件判断同步变化，随后解释原因。所有表达都指向同一个概念。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 115,
          "endLine": 115,
          "text": "## 项目状态和使用方式"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 117,
          "endLine": 120,
          "text": "- 编号：003；版本：v4.4；本次整理更新：2026-10-27。\n- 本阶段研究完成，已有三课3D独立样章、完整研究网页与总览图；原先的连续主题书、方法总览、筛选示例及规划工具全部保留，后续按具体产品需求选择性复用。\n- 本地网页与GitHub Pages正式站点均可访问；线上地址、部署结果与核验范围见[发布记录](research/deployment.md)。交互验证不等于教学效果验证，真实受众试用仍待进行。\n- 在子项目运行 `npm run check` 检查脚本语法，`npm test` 检查物理、导演、语音与阅读区域；在总库根目录运行 `npm run check` 检查索引。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 122,
          "endLine": 122,
          "text": "## 灵感来源和授权"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 124,
          "endLine": 124,
          "text": "灵感来自 Techartist 的 [Every Joule](https://iamtechartist.com/every-joule/) 及其[教师说明](https://iamtechartist.com/Apps/every-joule/teachers.html)。其中的物理课本把概念、立体图示、预测、操作和解释组织在一起；本项目据此提出跨主题的设计工作方法。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 126,
          "endLine": 126,
          "text": "总索引的“源库”关联作者公开的 [every-joule-lesson1](https://github.com/iamtechartist/every-joule-lesson1) 发布仓库，便于回到原始研究对象；本项目的方法与三课样章在本研究总库中独立实现。截至 2026-10-26，该发布仓库没有声明开源许可证。本项目没有引入其发布代码或运行素材；`reference-*.png` 为仅用于视觉研究的原站截图，版权属于原作者。"
        },
        {
          "path": "projects/003-unified-learning-design/README.md",
          "startLine": 128,
          "endLine": 128,
          "text": "运行依赖 Three.js 0.180.0 使用 MIT 许可证，Source Serif 4 与 Caveat 字体使用 OFL；许可文本随静态依赖保留在 `app/vendor/`。具体版本见 `package-lock.json`。方法文档与独立实现未额外声明统一开源许可证。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 43,
        "endLine": 60,
        "text": "    {\n      \"id\": \"003\",\n      \"slug\": \"unified-learning-design\",\n      \"name\": \"连续主题体验设计\",\n      \"summary\": \"体验三课可翻页、可调参的三维物理书。实验状态同时驱动模型、数值、镜头和 MiniMax 导览，适合参考互动教材怎样组织内容和反馈。\",\n      \"source\": \"https://github.com/iamtechartist/every-joule-lesson1\",\n      \"status\": \"completed\",\n      \"tags\": [\n        \"Three.js\",\n        \"3D书籍\",\n        \"效果复刻\",\n        \"交互学习\",\n        \"方法论\"\n      ],\n      \"cover\": \"assets/images/understanding-atlas.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/003-unified-learning-design/\",\n      \"createdAt\": \"2026-10-26\"\n    },"
      }
    },
    {
      "id": "004",
      "slug": "baocut-effects-atlas",
      "name": "BaoCut · 能力、原理与效果研究",
      "summary": "从 20 段预览和 24 个方向看 BaoCut 怎样把代码动效、AI 静图运镜和素材剪辑组合成可编辑的视频。记录了人工接手的位置，效率收益待实测。",
      "source": "https://github.com/JimLiu/baocut",
      "status": "researching",
      "tags": [
        "BaoCut",
        "视频制作",
        "代码动画",
        "素材剪辑",
        "工作流研究"
      ],
      "createdAt": "2026-10-26",
      "readmePath": "projects/004-baocut-effects-atlas/README.md",
      "readmeSha256": "b80b3699dd1c0608982e70ec97350696e16ae344273fb6fe74cc511d79818f03",
      "readmeText": "# 004 · BaoCut · 能力、原理与效果研究\n\n> BaoCut 是 AI 可操作的视频编辑器与制作工作流。它以代码动画、AI 静图运镜和已有素材剪辑组合成片，支持字幕、配音、检索与可编辑工程；增量价值主要在工具集成、反复修改和人工接手。本研究用一张总览图、24 个场景方向与 20 段官方预览解释效果、能力、原理和价值，尚未对照实测效率收益。\n\n**[在线网页](https://yydshly.github.io/1025_codex_project/004-baocut-effects-atlas/)** · **[在线一图总览](https://yydshly.github.io/1025_codex_project/004-baocut-effects-atlas/#overview)** · [本地网页](app/index.html) · **[SVG 完整图](assets/images/capability-map.svg)** · [总览文字与依据](research/overview.md) · **[实现原理与逐条分类](research/implementation.md)** · [修改与复现建议](research/guide.md) · [全部场景清单](research/scenes.md) · [上线验收](research/deployment.md) · [原始仓库 JimLiu/baocut](https://github.com/JimLiu/baocut) · [返回总索引](../../README.md#项目索引)\n\n![我们整理的 BaoCut 能力、制作原理、效果与价值总览引导图](assets/images/capability-map.png)\n\n引导图由我们的讨论与固定版本资料整理；图中六张封面、视频与缩略图来自 Jim Liu / BaoCut 官方模板。**本研究尚未安装 BaoCut 或复现样片；页面展示和官方能力说明分别标注证据。**\n\n## 四个问题说明白\n\n| 问题 | 本研究的结论 |\n| --- | --- |\n| **效果是什么？** | 五类用途：图形动效、讲解教学、产品推广、素材剪辑、故事氛围。24 个方向、20 段约 15 秒的官方预览节选；五类用途可以混用制作方法。 |\n| **能力是什么？** | 组织画面、声音和文稿，提供时间线剪辑、字幕、转写翻译、配音、素材检索与工程导出。转写、配音、语义与画面检索等能力需要对应模型、服务或索引。 |\n| **原理是什么？** | 实际画面主要来自代码逐帧绘制、AI 静图配代码取景运动、已有素材裁切重排。AI 负责规划、写代码或调用模型，BaoCut 组织编辑项目与任务，FFmpeg / FFprobe 参与媒体准备和输出。固定研究版本没有 AI 视频生成。 |\n| **价值是什么？** | 将已有制作技术接入同一可编辑工程，支持事务、撤销、版本检查、按对象修改与人工接手。对一次性代码效果，新增收益可能有限；多素材、多轮修改和交接场景更值得验证。没有实测质量、成本或效率优势。 |\n\nSkill 的价值主要是简报、分镜、风格、样段和验收方法；BaoCut 软件的价值主要是执行环境、编辑器与持久化工程。继续研究的关键，是用同一任务对比多轮修改和交接成本，而非把更多模板数量当作新技术。\n\n## 一图整理我们的理解\n\n网页新增 `#overview`，把整体定位、五类用途、三条画面制作路径、具体技巧、配套能力、可编辑工程、价值与边界放在一张连续的图中。五类是用途，同一用途可以组合多条路径；24 个场景方向不代表 24 种独立技术。\n\n- **方法与软件分开**：Skill 提供简报、分镜、风格、样段和验收方法；BaoCut 提供编辑器、时间线、任务与项目状态。\n- **画面与配套分开**：代码动画、AI 静图运镜、已有素材剪辑是三条实际画面路径；转写、字幕、翻译、配音、检索和混音是共同能力，注明模型与索引条件。\n- **技术能力与工程价值分开**：代码与 FFmpeg 可以完成同类效果。BaoCut 的增量主要在工具衔接、项目管理、反复修改与人工接手；尚未对照实测质量、成本或效率。\n- **证据分开**：样片路径依据制作记录；通用能力依据固定版本官方文档；对我们的适用性为研究判断。没有将官方文档写成已在本机验证的功能。\n\n图中的五类用途与三条路径可跳转至筛选结果，六个封面直接打开现有样片及做法说明。另提供可下载的 [SVG 完整图](assets/images/capability-map.svg)，内嵌六张官方封面，无外部图片依赖；网页图与 SVG 共享 `app/overview.json`，由 `node scripts/build-data.mjs` 同步生成数据、图片和[文字整理](research/overview.md)。\n\n已核对五类用途、三条路径和六个样片入口，实际检查 643 / 1280 像素浏览器视口，无横向溢出；独立 SVG 的 127 段文字与 6 张图片没有交叠。[PNG 完整图](assets/images/capability-map.png)是 SVG 的浏览器实际渲染。[验收记录](research/overview-verification.json)区分页面、数据、隔离构建与本机未验证项。\n\n![网页中的能力总览入口与用途分类](assets/images/overview.png)\n\n## 先看哪些效果\n\n| 场景 | 可以先看的样片 | 方向 / 有预览 |\n| --- | --- | --- |\n| 图形与动效 | 动效设计展示、排版动效、混沌归于秩序、小球物理动画、节奏舞蹈 | 5 / 5 |\n| 讲解与教学 | 月相知识讲解、数据故事、分步教程；另有热点趣闻、AI 快评、技术简史模板 | 6 / 3 |\n| 产品与推广 | 新品发布、产品展示、软件演示、推广短片、白色界面风格发布 | 5 / 5 |\n| 素材与剪辑 | 创意混剪、活动回顾、Vlog；另有口播精华模板 | 4 / 3 |\n| 故事与氛围 | 电影感场景、史诗氛围、原创游戏预告、故事短片 | 4 / 4 |\n\n首屏提供六种代表效果切换；下方可分类、搜索、打开样片详情。详情显示视频、效果方向、需要的输入、默认画幅与时长、制作提示、官方验证记录。\n\n## 效果具体怎样实现\n\n网页已加入三条制作路径的原理、按实际做法筛选、每个场景的画面来源、动作机制、AI 分工、声音与拼接方式，并列出模板要求与实际实现的差异。依据是各条官方制作记录，不只看标题或提示词。\n\n| 按画面主要来源分类 | 方向数 | 代表做法 |\n| --- | --- | --- |\n| 代码画面 | 14 | 排版、图表、机制图、虚构 UI、物理模拟；AI 写代码，程序计算并渲染画面 |\n| AI 静图＋代码运镜 | 5 | 电影感、产品片、故事片；AI 先生成图，代码再裁切、推拉、平移和叠字 |\n| 已有素材＋剪辑包装 | 5 | Vlog、混剪、活动、照片广告、口播选段；重排原素材并添加包装 |\n| 已记录的 AI 视频生成 | 0 | 节奏舞蹈模板虽然要求生成视频，实际降级为代码机器人 |\n\n以上统计覆盖 24 份制作记录，其中 4 个方向没有公开视频。声音独立判断：知识讲解用了 Gemini TTS，小球碰撞音效由代码合成，混剪和 Vlog 使用已有音乐或现场声。具体记录中的绘图库、生图模型或物理引擎名称没有给出时，保留未知，不根据视觉猜测。\n\n旧样片有大量“本机脚本先渲染、再导入”的做法，部分字幕与包装已烘焙进视频。固定版本制作说明另外提供代码包实时预览、确认后烘焙的流程；网页分别说明，未将旧样片写成已经采用新流程。\n\n![网页中新增的实现原理与实际路径分类](assets/images/implementation.png)\n\n24 条分类均核对了对应制作记录的原文摘录；三类筛选、组合筛选、清空筛选和代表场景详情已在浏览器验证。见[本轮核验记录](research/implementation-verification.json)。\n\n20 段预览都是约 15 秒的节选，不能当作完整成片。16 个预览文件没有音轨，4 个含音轨；页面逐条标明。官方模板记录中有 6 项标记为 `pass`、18 项为 `partial`；部分样片仍有素材、声音或内容准确性等缺项，原记录在详情中保留。模板方向、公开预览和稳定复现是不同层面的证据。\n\n## 本地打开\n\n本研究网页已于 **2026-10-27** 发布到 GitHub Pages。正式地址、发布范围、工作流与验收记录见[上线说明](research/deployment.md)。部署的是研究展示页，BaoCut 软件和模型服务没有在网页中运行。\n\n展示页不需要 API 密钥、模型或 BaoCut。视频、图片、目录、原始提示与研究注释都保存在子项目中；`app/data.js` 打包了 24 个场景的数据，浏览时不再依赖 JSON 网络请求。\n\n在本项目目录执行：\n\n```powershell\nnode scripts/serve.mjs\n```\n\n打开 `http://127.0.0.1:8054/app/`。本地 HTTP 预览需 Node.js 22+，不需要安装第三方依赖。筛选条件、具体样片与详情页签会写入地址，可刷新恢复；例如 `?scene=knowledge-explainer&tab=guide`。\n\n也已采用普通脚本和打包数据准备直接打开 `app/index.html` 的离线方式，素材仍使用相对路径。**内置浏览器安全策略仅允许 HTTP / HTTPS，阻止了本轮 `file:` 验收**；因此本轮只确认 HTTP 访问可用，直接双击的兼容性尚未完成浏览器验证。\n\n## 继续补全：从看效果到准备试做\n\n- **动手理解**：共用一个 6 秒滑块，对比代码绘图、静图取景与已有镜头切换，能播放、暂停，也能用键盘调节。明确标为本研究的教学示意，不是官方样片复现。\n- **分层阅读**：详情分成“效果与做法 / 修改与复现 / 原始记录”，保留视频，并支持上一条、下一条和键盘切换页签。\n- **24 条复现建议**：逐条说明先注意什么，按路径列可修改内容、修改位置、准备材料、小样步骤和验收点。建议与官方记录分开标明，没有声称已经试做成功。\n- **按预览条件选择**：除了场景与实现方式，还能筛选有视频、含音轨和仅有记录的方向；卡片标明是否含音轨。\n- **原始提示页内阅读**：24 份官方提示可直接展开，来源链接与原始文件均保留。\n- **入口恢复**：刷新后保留筛选、样片和详情页签；“复制当前入口”保留对应场景。本地服务链接仅限本机，正式站点链接可分享。\n\n更新数据后运行 `node scripts/build-data.mjs` 重新打包。下载同步脚本也会执行此步骤；提交版本、24 条原文证据和指导数据覆盖不一致时会拒绝打包。未新增任何外部服务或模型调用。\n\n![本研究制作的三种机制交互示意，时间滑块可控制绘图、取景与镜头切换](assets/images/learning.png)\n\n本轮检查见 [learning-verification.json](research/learning-verification.json)：24 个场景、24 份原始提示与 24 条指导均完整打包；播放、暂停、键盘调节、页签、连续浏览、筛选与刷新恢复已检查，未自动改动剪贴板。\n\n## 本次范围与验证\n\n- 已完成：效果网页、五类场景筛选、搜索与空结果提示、播放与进度跳转、模板说明和官方验收记录、总库登记。\n- 原始素材：固定版本下载 89 个文件，逐个核对 Git blob SHA 与文件大小，另记录 SHA-256；20 个 MP4 全部通过 FFmpeg 完整解码。\n- 浏览器：实际检查首屏、分类、搜索、无预览提示、代表样片播放与进度跳转，详见 [verification.json](research/verification.json)。\n- 未做：运行 BaoCut、调用模型、生产新成片、同素材效果对照。小屏有响应式样式，没有手机实机验收。\n\n## 来源与保留文件\n\n研究日期：2026-10-26（北京时间）。固定上游提交：[`228c6aecf91ee2e3235b72a93223b0dd7cbb92fa`](https://github.com/JimLiu/baocut/commit/228c6aecf91ee2e3235b72a93223b0dd7cbb92fa)。\n\n- [官方效果页](https://baocut.com/zh-hans/)；[固定模板目录](https://github.com/JimLiu/baocut/tree/228c6aecf91ee2e3235b72a93223b0dd7cbb92fa/templates)。\n- `assets/official/`：20 组上游原始预览与封面，合计约 7.3 MiB；没有改变视频内容。\n- `research/upstream/templates/`：24 份原始 `template.json` 和 `prompt.md`，保持原始字节。\n- [原许可证](research/upstream/LICENSE.txt)：BaoCut Community License 1.0；[引用与修改说明](NOTICE.md)。\n- [制作说明文本快照](research/upstream/video-production-SKILL.md)和[原始链接](https://github.com/JimLiu/baocut/blob/228c6aecf91ee2e3235b72a93223b0dd7cbb92fa/skills/baocut/built-in-skills/video-production/SKILL.md)补充说明代码包与生成能力；逐条研究注释独立保存在 `app/implementation.json`，原始模板不改动。\n- [来源清单](research/upstream-manifest.json)、[完整性记录](research/asset-integrity.json)、[媒体解码记录](research/media-verification.json)。这是所选研究材料快照，不是 BaoCut 全仓备份。\n\n重新获取同一版本并校验：安装 Python 3.10+ 与 FFprobe 后运行 `python scripts/sync_upstream.py`。只读取固定清单中的公开文件，不运行上游代码，不删除既有文件。\n",
      "passages": [
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 004 · BaoCut · 能力、原理与效果研究"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "> BaoCut 是 AI 可操作的视频编辑器与制作工作流。它以代码动画、AI 静图运镜和已有素材剪辑组合成片，支持字幕、配音、检索与可编辑工程；增量价值主要在工具集成、反复修改和人工接手。本研究用一张总览图、24 个场景方向与 20 段官方预览解释效果、能力、原理和价值，尚未对照实测效率收益。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "**[在线网页](https://yydshly.github.io/1025_codex_project/004-baocut-effects-atlas/)** · **[在线一图总览](https://yydshly.github.io/1025_codex_project/004-baocut-effects-atlas/#overview)** · [本地网页](app/index.html) · **[SVG 完整图](assets/images/capability-map.svg)** · [总览文字与依据](research/overview.md) · **[实现原理与逐条分类](research/implementation.md)** · [修改与复现建议](research/guide.md) · [全部场景清单](research/scenes.md) · [上线验收](research/deployment.md) · [原始仓库 JimLiu/baocut](https://github.com/JimLiu/baocut) · [返回总索引](../../README.md#项目索引)"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 7,
          "endLine": 7,
          "text": "![我们整理的 BaoCut 能力、制作原理、效果与价值总览引导图](assets/images/capability-map.png)"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "引导图由我们的讨论与固定版本资料整理；图中六张封面、视频与缩略图来自 Jim Liu / BaoCut 官方模板。**本研究尚未安装 BaoCut 或复现样片；页面展示和官方能力说明分别标注证据。**"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 11,
          "endLine": 11,
          "text": "## 四个问题说明白"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 13,
          "endLine": 18,
          "text": "| 问题 | 本研究的结论 |\n| --- | --- |\n| **效果是什么？** | 五类用途：图形动效、讲解教学、产品推广、素材剪辑、故事氛围。24 个方向、20 段约 15 秒的官方预览节选；五类用途可以混用制作方法。 |\n| **能力是什么？** | 组织画面、声音和文稿，提供时间线剪辑、字幕、转写翻译、配音、素材检索与工程导出。转写、配音、语义与画面检索等能力需要对应模型、服务或索引。 |\n| **原理是什么？** | 实际画面主要来自代码逐帧绘制、AI 静图配代码取景运动、已有素材裁切重排。AI 负责规划、写代码或调用模型，BaoCut 组织编辑项目与任务，FFmpeg / FFprobe 参与媒体准备和输出。固定研究版本没有 AI 视频生成。 |\n| **价值是什么？** | 将已有制作技术接入同一可编辑工程，支持事务、撤销、版本检查、按对象修改与人工接手。对一次性代码效果，新增收益可能有限；多素材、多轮修改和交接场景更值得验证。没有实测质量、成本或效率优势。 |"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 20,
          "endLine": 20,
          "text": "Skill 的价值主要是简报、分镜、风格、样段和验收方法；BaoCut 软件的价值主要是执行环境、编辑器与持久化工程。继续研究的关键，是用同一任务对比多轮修改和交接成本，而非把更多模板数量当作新技术。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 22,
          "endLine": 22,
          "text": "## 一图整理我们的理解"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 24,
          "endLine": 24,
          "text": "网页新增 `#overview`，把整体定位、五类用途、三条画面制作路径、具体技巧、配套能力、可编辑工程、价值与边界放在一张连续的图中。五类是用途，同一用途可以组合多条路径；24 个场景方向不代表 24 种独立技术。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 26,
          "endLine": 29,
          "text": "- **方法与软件分开**：Skill 提供简报、分镜、风格、样段和验收方法；BaoCut 提供编辑器、时间线、任务与项目状态。\n- **画面与配套分开**：代码动画、AI 静图运镜、已有素材剪辑是三条实际画面路径；转写、字幕、翻译、配音、检索和混音是共同能力，注明模型与索引条件。\n- **技术能力与工程价值分开**：代码与 FFmpeg 可以完成同类效果。BaoCut 的增量主要在工具衔接、项目管理、反复修改与人工接手；尚未对照实测质量、成本或效率。\n- **证据分开**：样片路径依据制作记录；通用能力依据固定版本官方文档；对我们的适用性为研究判断。没有将官方文档写成已在本机验证的功能。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 31,
          "endLine": 31,
          "text": "图中的五类用途与三条路径可跳转至筛选结果，六个封面直接打开现有样片及做法说明。另提供可下载的 [SVG 完整图](assets/images/capability-map.svg)，内嵌六张官方封面，无外部图片依赖；网页图与 SVG 共享 `app/overview.json`，由 `node scripts/build-data.mjs` 同步生成数据、图片和[文字整理](research/overview.md)。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 33,
          "endLine": 33,
          "text": "已核对五类用途、三条路径和六个样片入口，实际检查 643 / 1280 像素浏览器视口，无横向溢出；独立 SVG 的 127 段文字与 6 张图片没有交叠。[PNG 完整图](assets/images/capability-map.png)是 SVG 的浏览器实际渲染。[验收记录](research/overview-verification.json)区分页面、数据、隔离构建与本机未验证项。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "![网页中的能力总览入口与用途分类](assets/images/overview.png)"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 37,
          "endLine": 37,
          "text": "## 先看哪些效果"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 39,
          "endLine": 45,
          "text": "| 场景 | 可以先看的样片 | 方向 / 有预览 |\n| --- | --- | --- |\n| 图形与动效 | 动效设计展示、排版动效、混沌归于秩序、小球物理动画、节奏舞蹈 | 5 / 5 |\n| 讲解与教学 | 月相知识讲解、数据故事、分步教程；另有热点趣闻、AI 快评、技术简史模板 | 6 / 3 |\n| 产品与推广 | 新品发布、产品展示、软件演示、推广短片、白色界面风格发布 | 5 / 5 |\n| 素材与剪辑 | 创意混剪、活动回顾、Vlog；另有口播精华模板 | 4 / 3 |\n| 故事与氛围 | 电影感场景、史诗氛围、原创游戏预告、故事短片 | 4 / 4 |"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 47,
          "endLine": 47,
          "text": "首屏提供六种代表效果切换；下方可分类、搜索、打开样片详情。详情显示视频、效果方向、需要的输入、默认画幅与时长、制作提示、官方验证记录。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 49,
          "endLine": 49,
          "text": "## 效果具体怎样实现"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 51,
          "endLine": 51,
          "text": "网页已加入三条制作路径的原理、按实际做法筛选、每个场景的画面来源、动作机制、AI 分工、声音与拼接方式，并列出模板要求与实际实现的差异。依据是各条官方制作记录，不只看标题或提示词。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 53,
          "endLine": 58,
          "text": "| 按画面主要来源分类 | 方向数 | 代表做法 |\n| --- | --- | --- |\n| 代码画面 | 14 | 排版、图表、机制图、虚构 UI、物理模拟；AI 写代码，程序计算并渲染画面 |\n| AI 静图＋代码运镜 | 5 | 电影感、产品片、故事片；AI 先生成图，代码再裁切、推拉、平移和叠字 |\n| 已有素材＋剪辑包装 | 5 | Vlog、混剪、活动、照片广告、口播选段；重排原素材并添加包装 |\n| 已记录的 AI 视频生成 | 0 | 节奏舞蹈模板虽然要求生成视频，实际降级为代码机器人 |"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 60,
          "endLine": 60,
          "text": "以上统计覆盖 24 份制作记录，其中 4 个方向没有公开视频。声音独立判断：知识讲解用了 Gemini TTS，小球碰撞音效由代码合成，混剪和 Vlog 使用已有音乐或现场声。具体记录中的绘图库、生图模型或物理引擎名称没有给出时，保留未知，不根据视觉猜测。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 62,
          "endLine": 62,
          "text": "旧样片有大量“本机脚本先渲染、再导入”的做法，部分字幕与包装已烘焙进视频。固定版本制作说明另外提供代码包实时预览、确认后烘焙的流程；网页分别说明，未将旧样片写成已经采用新流程。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 64,
          "endLine": 64,
          "text": "![网页中新增的实现原理与实际路径分类](assets/images/implementation.png)"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 66,
          "endLine": 66,
          "text": "24 条分类均核对了对应制作记录的原文摘录；三类筛选、组合筛选、清空筛选和代表场景详情已在浏览器验证。见[本轮核验记录](research/implementation-verification.json)。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 68,
          "endLine": 68,
          "text": "20 段预览都是约 15 秒的节选，不能当作完整成片。16 个预览文件没有音轨，4 个含音轨；页面逐条标明。官方模板记录中有 6 项标记为 `pass`、18 项为 `partial`；部分样片仍有素材、声音或内容准确性等缺项，原记录在详情中保留。模板方向、公开预览和稳定复现是不同层面的证据。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 70,
          "endLine": 70,
          "text": "## 本地打开"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 72,
          "endLine": 72,
          "text": "本研究网页已于 **2026-10-27** 发布到 GitHub Pages。正式地址、发布范围、工作流与验收记录见[上线说明](research/deployment.md)。部署的是研究展示页，BaoCut 软件和模型服务没有在网页中运行。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 74,
          "endLine": 74,
          "text": "展示页不需要 API 密钥、模型或 BaoCut。视频、图片、目录、原始提示与研究注释都保存在子项目中；`app/data.js` 打包了 24 个场景的数据，浏览时不再依赖 JSON 网络请求。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 76,
          "endLine": 76,
          "text": "在本项目目录执行："
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 78,
          "endLine": 80,
          "text": "```powershell\nnode scripts/serve.mjs\n```"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 82,
          "endLine": 82,
          "text": "打开 `http://127.0.0.1:8054/app/`。本地 HTTP 预览需 Node.js 22+，不需要安装第三方依赖。筛选条件、具体样片与详情页签会写入地址，可刷新恢复；例如 `?scene=knowledge-explainer&tab=guide`。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 84,
          "endLine": 84,
          "text": "也已采用普通脚本和打包数据准备直接打开 `app/index.html` 的离线方式，素材仍使用相对路径。**内置浏览器安全策略仅允许 HTTP / HTTPS，阻止了本轮 `file:` 验收**；因此本轮只确认 HTTP 访问可用，直接双击的兼容性尚未完成浏览器验证。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 86,
          "endLine": 86,
          "text": "## 继续补全：从看效果到准备试做"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 88,
          "endLine": 93,
          "text": "- **动手理解**：共用一个 6 秒滑块，对比代码绘图、静图取景与已有镜头切换，能播放、暂停，也能用键盘调节。明确标为本研究的教学示意，不是官方样片复现。\n- **分层阅读**：详情分成“效果与做法 / 修改与复现 / 原始记录”，保留视频，并支持上一条、下一条和键盘切换页签。\n- **24 条复现建议**：逐条说明先注意什么，按路径列可修改内容、修改位置、准备材料、小样步骤和验收点。建议与官方记录分开标明，没有声称已经试做成功。\n- **按预览条件选择**：除了场景与实现方式，还能筛选有视频、含音轨和仅有记录的方向；卡片标明是否含音轨。\n- **原始提示页内阅读**：24 份官方提示可直接展开，来源链接与原始文件均保留。\n- **入口恢复**：刷新后保留筛选、样片和详情页签；“复制当前入口”保留对应场景。本地服务链接仅限本机，正式站点链接可分享。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 95,
          "endLine": 95,
          "text": "更新数据后运行 `node scripts/build-data.mjs` 重新打包。下载同步脚本也会执行此步骤；提交版本、24 条原文证据和指导数据覆盖不一致时会拒绝打包。未新增任何外部服务或模型调用。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 97,
          "endLine": 97,
          "text": "![本研究制作的三种机制交互示意，时间滑块可控制绘图、取景与镜头切换](assets/images/learning.png)"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 99,
          "endLine": 99,
          "text": "本轮检查见 [learning-verification.json](research/learning-verification.json)：24 个场景、24 份原始提示与 24 条指导均完整打包；播放、暂停、键盘调节、页签、连续浏览、筛选与刷新恢复已检查，未自动改动剪贴板。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 101,
          "endLine": 101,
          "text": "## 本次范围与验证"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 103,
          "endLine": 106,
          "text": "- 已完成：效果网页、五类场景筛选、搜索与空结果提示、播放与进度跳转、模板说明和官方验收记录、总库登记。\n- 原始素材：固定版本下载 89 个文件，逐个核对 Git blob SHA 与文件大小，另记录 SHA-256；20 个 MP4 全部通过 FFmpeg 完整解码。\n- 浏览器：实际检查首屏、分类、搜索、无预览提示、代表样片播放与进度跳转，详见 [verification.json](research/verification.json)。\n- 未做：运行 BaoCut、调用模型、生产新成片、同素材效果对照。小屏有响应式样式，没有手机实机验收。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 108,
          "endLine": 108,
          "text": "## 来源与保留文件"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 110,
          "endLine": 110,
          "text": "研究日期：2026-10-26（北京时间）。固定上游提交：[`228c6aecf91ee2e3235b72a93223b0dd7cbb92fa`](https://github.com/JimLiu/baocut/commit/228c6aecf91ee2e3235b72a93223b0dd7cbb92fa)。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 112,
          "endLine": 117,
          "text": "- [官方效果页](https://baocut.com/zh-hans/)；[固定模板目录](https://github.com/JimLiu/baocut/tree/228c6aecf91ee2e3235b72a93223b0dd7cbb92fa/templates)。\n- `assets/official/`：20 组上游原始预览与封面，合计约 7.3 MiB；没有改变视频内容。\n- `research/upstream/templates/`：24 份原始 `template.json` 和 `prompt.md`，保持原始字节。\n- [原许可证](research/upstream/LICENSE.txt)：BaoCut Community License 1.0；[引用与修改说明](NOTICE.md)。\n- [制作说明文本快照](research/upstream/video-production-SKILL.md)和[原始链接](https://github.com/JimLiu/baocut/blob/228c6aecf91ee2e3235b72a93223b0dd7cbb92fa/skills/baocut/built-in-skills/video-production/SKILL.md)补充说明代码包与生成能力；逐条研究注释独立保存在 `app/implementation.json`，原始模板不改动。\n- [来源清单](research/upstream-manifest.json)、[完整性记录](research/asset-integrity.json)、[媒体解码记录](research/media-verification.json)。这是所选研究材料快照，不是 BaoCut 全仓备份。"
        },
        {
          "path": "projects/004-baocut-effects-atlas/README.md",
          "startLine": 119,
          "endLine": 119,
          "text": "重新获取同一版本并校验：安装 Python 3.10+ 与 FFprobe 后运行 `python scripts/sync_upstream.py`。只读取固定清单中的公开文件，不运行上游代码，不删除既有文件。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 61,
        "endLine": 78,
        "text": "    {\n      \"id\": \"004\",\n      \"slug\": \"baocut-effects-atlas\",\n      \"name\": \"BaoCut · 能力、原理与效果研究\",\n      \"summary\": \"从 20 段预览和 24 个方向看 BaoCut 怎样把代码动效、AI 静图运镜和素材剪辑组合成可编辑的视频。记录了人工接手的位置，效率收益待实测。\",\n      \"source\": \"https://github.com/JimLiu/baocut\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"BaoCut\",\n        \"视频制作\",\n        \"代码动画\",\n        \"素材剪辑\",\n        \"工作流研究\"\n      ],\n      \"cover\": \"assets/images/capability-map.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/004-baocut-effects-atlas/\",\n      \"createdAt\": \"2026-10-26\"\n    },"
      }
    },
    {
      "id": "005",
      "slug": "paper-poetics-lab",
      "name": "纸间 · 诗性风格实验室",
      "summary": "用水墨重写、实时茶庭和 AI 雨窗样片比较三种氛围表达方式。图解说明何时选网页交互、实时场景或生成视频，并记录各自的制作条件。",
      "source": "https://x.com/thtbee_/status/2114030630887641448",
      "status": "researching",
      "tags": [
        "视频氛围",
        "AI视频",
        "Three.js",
        "风格研究",
        "交互叙事"
      ],
      "createdAt": "2026-10-26",
      "readmePath": "projects/005-paper-poetics-lab/README.md",
      "readmeSha256": "18a160b5f246876115393fb0c2db98288cafd0586286176b724688fe83de0f50",
      "readmeText": "# 005 · 纸间 · 诗性风格实验室\n\n> 一个研究诗性网页叙事的可运行项目。1.4.0 用可点击、可导出的研究总览图，连接源效果观察、氛围理解、本地实现、五项演示与证据边界。\n\n- **源效果是什么**：据 [Bee 的演示录屏](https://x.com/thtbee_/status/2114030630887641448)，纸墨、多场景与画幅变化，结合雨水、开花等自然微事件、文字和留白，组成诗性叙事。未取得原作源码，无法确认其内部技术与全部交互。\n- **我们做了什么、留下什么**：002 独立重写、两项原创实时练习、AI 单幕影片与有许可的实拍对照，共同形成可运行的比较材料。研究价值在于氛围组织方法、实时与影片载体的选型依据，以及场景、播放器、声音与验证记录等工程资产；不宣称与源作 1:1。\n- **还可往哪里扩展**：继续验证声画事件的前后关系、纸墨与写实影像的融合及更多具体场景；也可试作展览或文化内容入口。这些是待检验的潜力，尚未证明商业效果。\n\n## 线上访问 · 2026-10-27\n\n[项目首页](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/) · [可点击研究总览](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/map.html) · [研究回顾](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/research.html) · [AI雨窗茶寮](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/cinema.html) · [原有九章](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html)\n\n**002 是效果实现，005 是研究与扩展入口。** 总览图顶部的“002 · 原始效果实现”直接进入最初的002重写作品；旁边“原作录屏参考”链接作者的原演示，二者分别标注。图内卡片和九章直达入口继续保留，演示页可直接返回总览图。\n\n002在WebGL无法创建、上下文中断或绘制失败时，自动进入真实运行截图浏览，提供十个章节及四季切换，明确标注非实时且默认无声。[直接进入兼容浏览](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html?preview=static#rain)；`original.html` 仅透传允许的 `preview=static` 和章节hash。详细边界见[002兼容处理记录](../002-ink-rain-alley/research/browser-compatibility-2026-10-27.md)。\n\n已通过GitHub Actions发布并核对线上入口、指定引导图、图内链接、莲花章节和影片实际播放。部署过程与检查范围见[发布记录](research/deployment.md)。引导图使用用户确认的现有研究总览图，未重新生成。\n\n[返回总索引](../../README.md#项目索引) · [研究笔记](research/notes.md) · [验证记录](design-qa.md) · [已有演示项目](../002-ink-rain-alley/README.md)\n\n![纸间研究总览图：源效果、氛围与技术、五项实践、价值与边界](assets/images/v1.4/research-map.png)\n\n## 1.4.0 · 一图总览\n\n[打开可交互研究总览图](http://127.0.0.1:4176/map.html)。首页主按钮旁及研究回顾顶部导航均可进入。\n\n- 2400×4339图解：原参考四组实际抽帧 → 氛围／技术两线 → 五项本地实践及九章链接 → 可复用价值与工程资产 → 制作流程与证据边界。\n- 技术均标为本地实现或复现路径，未取得原作源码，不将Three.js、WebGL或视频认定为原作内部方案。\n- 原参考四帧注明作者与演示链接；我们的五项演示使用已有真实截图或首帧。完整来源见 `research/overview-map-sources.json`，整理文本见 `research/overview-map-content.json`。\n- 网页内联SVG保留节点链接，支持缩放、滚动与鼠标拖动；SVG下载按当前网页地址保留完整链接，PNG为静态图。原演示容器现在可接受有效章节hash以直达相应章节。\n- SVG与PNG原件同时保留在 `app/media/` 与 `assets/images/v1.4/`，没有新增AI生成或费用。\n\n需要修改并重新导出图时，可选运行 `python tools/render-research-map.py`。工具使用Pillow、resvg-py与Windows系统中文字体；常规 `npm run build` 直接使用已有成品，不依赖Python。\n\n公开版本保留运行用视频、图片、音频、准确提示词、来源和脱敏核验记录。未压缩母版、原始下载、账户余额及操作日志保留本地，不是网页构建依赖；浏览网页不会调用生成服务。\n\n## 1.3.0 · 研究回顾\n\n[打开研究回顾](http://127.0.0.1:4176/research.html)。首页导航与主按钮旁、两项影片页顶部和原演示容器均可进入，回顾页可直接返回各个演示。\n\n- 按真实来源区分原参考录屏、002独立重写、两项实时主题、AI影片与实拍对照；五项本地演示可按载体筛选。\n- 四轮探索与v1.0／v1.1茶息实际截图说明方向如何变化，不将功能检查通过等同于氛围成熟。\n- 整理可延续的方法、制作分工、主题扩展问题和下一轮检验标准；研究判断、创作目标与已验证事实分别标注。\n- 可主动播放现有AI样片，默认静音、不自动播放，不调用生成服务。影片来源、有限画面检查、待试听状态以及预估180／实际264积分在页面中保留。\n- 网页使用既有真实截图，来源清单为 `app/media/research/SOURCES.json`，没有新增生成任务。信息来源为本项目研究笔记、生成记录和验证记录。\n\n![研究回顾页的实际浏览器截图](assets/images/v1.3/research-desktop.png)\n\n## 1.2.0 · 雨窗茶寮\n\n本轮改为先做好一幕视频主导的氛围体验：从暖灯窗内望向雨中的远村，让檐雨、山雾、河面灯影与近处一盏茶共同构成连续镜头。影院页使用浏览器原生视频播放，不经过旧版 Three.js 后期，不把低频的模型位移当作影片运动，也不叠加旧电子配乐。\n\n### 素材与当前状态\n\n- 原创首帧由内置 imagegen 创建，保存为 `app/media/cinema/rain-window-tea.jpg`。\n- 配套 AI 镜头已由 ChatArt 的 **Kling V3 任务1040462** 生成并接入本地影院。实际文件为 **15.046秒、1920×1080、24fps、H.264视频与AAC音轨**。\n- 本次确认时的本地估算为 **180 credits**，实际消耗已确认为 **264 credits**，余额净变动与服务返回一致。估算与实际不能混用，差异原因尚未确认。详情见[生成记录](research/cinema/generation-record.json)。\n- 首次 Seedance2.0 任务 **1040430** 服务端失败，未返回视频，查询到余额前后未变；历史记录见 [generation-record-seedance2.json](research/cinema/generation-record-seedance2.json)。Kling 任务经用户另行确认，不是自动重试。\n- 失败或超时不会自动重新提交、切换模型或产生下一次生成费用。\n\n当前 AI 影院已是 `ready` 状态，播放的是实际 MP4，不是首帧的缩放动画。生成前的 `pending` 首帧模式继续作为机制保留：没有影片时不请求 MP4，明确显示首帧预览并禁用播放操作。真正的文件加载失败仍显示失败状态与重试入口。\n\n生成完成、媒体验证和本地构建已完成。当前人工检查只覆盖部分抽帧与浏览器播放；技术检查确认音轨存在且非静音，尚未试听内容，不声称画面、情绪或声音已全部验收。\n\n相关记录：[首帧提示词](research/cinema/tea-keyframe-prompt.txt) · [视频提示词](research/cinema/tea-video-prompt.txt) · [源片运动与氛围分析](research/cinema/source-motion-notes.md)。网页短字幕独立于视频内容，并没有烧录进原片。\n\n本轮取得的是一幕约 15 秒的连续镜头；它不等于完成了 30 秒或更长的完整故事。抽帧中可见雨水、茶烟和取景变化，杯、窗框与远村基本稳定；镜头位移比提示词要求的极小漂移更明显。风、竹叶与茶烟之间的完整因果、全片稳定性和听感仍需人工检查。\n\n## 保留的实时练习\n\n两个主题从物件陈列式构图改为具有前后关系的透视场景，镜头随三幕进度靠近主体。\n\n- **山间茶息**：窗景茶台、青灰釉茶器、石席与窗外山雾；倾壶注水带来水线、茶面波纹和蒸汽，后段转向杯口近景。\n- **月下花庭**：月洞门、台阶、庭树与水平反射水面构成庭院层次；月影、曲面玉兰和萤光随进度与操作变化。\n- **共用渲染**：HDR 离屏目标、ACES 风格色调映射、PCF 阴影与程序环境反射，用于保留高光、接触关系和物件表面层次。它们不等于完整的光照或水面物理模拟。\n- **画面让位**：收小主题文案，去掉常驻说明，让空间和动作承担更多表达。背景配乐沿用上一版，没有新增两首独立录音。\n\n旧版的按钮、导航和声音检查通过，不代表视觉质量已经达到预期。历史记录见 [1.0.0 验证](research/design-qa-v1.0.md)与 [1.1.0 验证](research/design-qa-v1.1.md)；视频主体验的实际画面、检查结果与剩余问题以[当前验证记录](design-qa.md)为准，不沿用旧版的视觉结论。\n\n## 当前入口\n\n- [纸间入口](http://127.0.0.1:4176/)：影院主体验、保留作品入口、风格方法、固定／变化对照和扩展流程。\n- [研究回顾](http://127.0.0.1:4176/research.html)：参考观察、效果筛选、四轮迭代、研究价值、证据边界、素材出处和下一步问题。\n- [一图总览](http://127.0.0.1:4176/map.html)：可点击、放大阅读、下载PNG／SVG的完整研究图解。\n- [雨窗茶寮 · AI影片](http://127.0.0.1:4176/cinema.html)：已接入实际 Kling 生成影片，15.046秒，默认静音观看。\n- [雨窗 · 实拍对照](http://127.0.0.1:4176/rain-study.html)：另一个有许可的实拍样片，雨滴沿玻璃滑落、窗外灯光虚焦；雨声来自另源合成，不是 AI 茶寮成片，也不是同步现场录音。\n- [山间茶息 · 实时练习](http://127.0.0.1:4176/theme.html?theme=tea)：候山 → 注水 → 回甘；从窗景茶台靠近杯口，观看倾壶、水线、茶面波纹与蒸汽。\n- [月下花庭 · 实时练习](http://127.0.0.1:4176/theme.html?theme=moon)：入夜 → 绽放 → 随光；月洞门内外的庭院、月影水面、玉兰与萤光回应。\n- [原有九章演示](http://127.0.0.1:4176/original.html)：在本入口同一站点中打开 002 的构建产物，外层提供返回入口。\n\n上列为本机开发预览地址，正式线上地址见文首。当前4176保留后台生产预览。原有 4174 地址可以继续独立使用，新入口的原演示链接不依赖 4174 服务是否开启。\n\n## 本地运行\n\n构建需要 Node.js 22.12+。影院页需要支持 MP4 视频播放的现代浏览器，实时练习另需 WebGL 2。首次运行，从仓库根目录安装两个子项目自己的依赖：\n\n```powershell\nnpm --prefix projects/002-ink-rain-alley ci\nnpm --prefix projects/005-paper-poetics-lab ci\ncd projects/005-paper-poetics-lab\nnpm run build\nnpm run preview\n```\n\n打开 `http://127.0.0.1:4176/`。安装后也可双击 `start-local.cmd`。如果该端口已有本次交付的后台服务，请直接访问，或用 `npm run preview -- --port 4177` 启动另一端口。\n\n构建会先构建 002，再将其 `dist/` 复制到本项目 `dist/original/`，与入口、AI 影院、实拍对照和实时练习一起提供。影院素材按指定名单复制：\n\n```text\napp/media/cinema/rain-window-tea.jpg → dist/media/cinema/rain-window-tea.jpg\napp/media/cinema/rain-window-tea.mp4 → dist/media/cinema/rain-window-tea.mp4\napp/media/cinema/rain-window-study.jpg → dist/media/cinema/rain-window-study.jpg\napp/media/cinema/rain-window-study.mp4 → dist/media/cinema/rain-window-study.mp4\n```\n\n文件存在时才复制，保留运行时相对路径；构建不会发起视频生成。不会迁移或删除 002 源文件，也不清空其他项目输出。开发时可运行 `npm run dev`；开发服务器将 `/original/` 映射到 002 的已有构建产物。\n\n## 入口中沉淀的理解\n\n- **留白**：一幕有一个注意力中心；空白和密集画面承担不同的叙事作用。\n- **材质**：弱纸粒、哑光物件、浓淡与不规则边缘共同组成画面，而不是给所有内容覆盖同一层滤镜。\n- **动作**：进入、变化、停留都有意义。注水会带来水线、波纹、热气；夜花与微光会回应操作。\n- **文字**：短句与场景一起表达，说明和控制项保持清楚；文字不取代真实的画面变化。\n- **声音**：AI 影院只播放生成影片自身的音轨，默认静音；实拍对照片播放另源合成的雨声；实时练习仍沿用简短音乐动机与分主题环境声。不同来源分别标注，不用同一段电子配乐覆盖所有体验。\n\n固定规则与可变项在网页中对照呈现。扩展流程为：选择可感知的日常 → 确定一个主体和一种变化 → 排成三个不同的时刻 → 放入真实浏览路径并验证。\n\n## 影院观看\n\n以下是影院页提供的观看方式。实际播放已经检查，其余逐项检查范围见验证记录，不将功能实现视为全部验收：\n\n- 影片载入后默认静音自动播放一次，结束后停留，可播放／暂停、从头重看和拖动细进度条；不硬循环。\n- 手机默认在暗背景中保留完整 16:9 画面，避免裁掉茶杯或雨村；“铺满”可主动切换，边缘会被裁切。全屏与铺满是两个独立操作。\n- 偏好减少动态时初始保留静止画面，由用户主动播放。切到后台会暂停，返回后需要自行续播。\n- 空格播放／暂停，M 切换静音，左右方向键前后移动约两秒；焦点在按钮、滑杆等操作项上时保留其自身行为。\n- 字幕只在短时间窗出现，可在“创作说明”里关闭；控件在播放时淡出，移动指针或轻触可唤出。\n- “声音”开关不启动 Three.js 练习的旧配乐。AI 片使用生成文件中的非静音 AAC 音轨，尚未完成主观试听；实拍对照片的声音是单独雨声素材的合成。\n\n## 实时练习操作\n\n- 三幕按钮和底部滑杆定位；滚轮或触摸滑动推进。\n- 默认自动浏览三幕，结束时停止；手动滚动或定位会接管，也可点击「停止浏览」。系统偏好减少动态时不自动推进。带 `p=` 的定位链接保留指定画面。\n- 「暂停动态」冻结画面，也暂停声音；继续后恢复。\n- 茶息的「注一盏茶」可在任何一幕触发一次倾壶；注水一幕也由进度驱动该动作。\n- 花庭的「唤起萤光」使花瓣、涟漪和萤光短暂回应。\n- 「声音 关／开」切换背景音乐与主题环境声。音乐复用 002 原创《纸上归途》，不是新增两首独立录音。\n- 方向键／Page Up、Page Down 切幕；空格暂停，输入框和按钮保留自身键盘行为。\n\n## 实现结构\n\n```text\napp/index.html       风格入口、作品与理解总结\napp/portal.js        入口交互、作品与风格方法切换\napp/research.html    可浏览的研究回顾、证据与来源\napp/research.css     纸面阅读布局、对照图与响应式排版\napp/research.js      效果筛选、内容渲染与主动视频预览\napp/research-data.js 五项演示、四轮探索、研究判断与待验问题\napp/map.html         单图总览的缩放、链接与导出入口\napp/map.js           内联SVG、相对链接适配与阅读控制\ntools/render-research-map.py 从研究文本及真实配图导出中文SVG与PNG\napp/cinema.html      雨窗茶寮原生视频容器与少量观看操作\napp/cinema.css       影院布局、完整画幅、短字幕与克制控件\napp/cinema.js        素材状态、播放、字幕时间、静音与降级\napp/rain-study.html  有许可的实拍对照，复用影院播放器并标注音画来源\napp/theme.html       共用三幕体验容器\napp/viewer.js        进度、导航、动作、声音与键盘\napp/data.js          两个主题的内容、文案、动作与风格说明\napp/engine.js        HDR 离屏、色调映射、环境反射、深度虚化、纸边与绘制调度\napp/scenes/tea.js    透视窗景茶台、釉器、石席、山雾、注水与杯口镜头\napp/scenes/moon.js   月洞门、台阶、Reflector 水面、玉兰、庭树与萤光\napp/scenes/utils.js  材质、曲线、噪声与资源释放\napp/ambience.js      共用旋律与分主题环境声\napp/original.html    原演示容器与返回入口\n```\n\n影院页由浏览器直接解码视频，不创建旧 Three.js 场景、HDR 目标或环境反射。AI 成片与实拍对照片均已保存到项目中，通过本地媒体文件播放，不依赖远程视频热链。\n\n保留的实时预览按 30 FPS 上限调度，滚出视口后暂停；实时主题页按 60 FPS 上限调度，尺寸与像素比设有限制。这些是调度设置，不是设备性能保证。实时画面仍由 Three.js、Canvas 和着色器生成，环境反射由程序房间提供，没有新增远程模型。\n\n浏览网站本身没有账号、数据库或外部 API，也不需要生成服务的密钥；ChatArt 用于制作阶段的素材生成，不在观看时提交生成任务。\n\n## 验证与配图\n\n运行 `npm run check` 做全部 JS 模块语法和入口存在性检查，`npm run build` 构建两个关联项目。具体执行结果、浏览器检查与限制见 [design-qa.md](design-qa.md)。不以构建成功替代画面判断。\n\n项目引导图使用本轮生成的 `assets/images/v1.4/research-map.png`，交互版见一图总览；`assets/images/cover.jpg` 与 `assets/images/portal-desktop.png` 保留入口实景。1.3.0研究回顾与更新入口的实景证据保存于 `assets/images/v1.3/`；1.2.0影院实景与窄屏证据保留于 `assets/images/v1.2/`。实际捕获状态、播放结果和对应文件以本轮验证记录为准，不将首帧截图当作视频播放证据。\n\n保留的实时练习及历史配图：\n\n- `assets/images/v1.1/tea-production.png`、`assets/images/v1.1/moon-production.png`：1.1.0 两个主题的生产页面。\n- `assets/images/v1.1/tea-stage-1.png` 至 `tea-stage-3.png`：茶息三幕。\n- `assets/images/v1.1/moon-stage-1.png` 至 `moon-stage-3.png`：花庭三幕。\n- `assets/images/v1.1/mobile-tea.png`、`assets/images/v1.1/mobile-moon.png`：1.1.0 窄屏画面。\n- `assets/images/style-source-original.png`：002 的风格参考，不能作为 005 新主题截图。\n\n目录中旧版的 `tea-production.png`、`moon-production.png`、`tea-art-final.png`、`moon-art-final.png` 和旧手机截图保留用于对照，不作为视频主体验已通过的证据。\n\n当前仍为创作原型。AI 影片已返回并能播放，声音与完整视觉质量尚待人工验收；实时练习的器物、花瓣和水汽仍具有程序生成特征，注水、反射与声场不是完整物理模拟。没有可视化编辑器、内容保存或一键视频导出。视觉完成度和设备表现仍需结合本轮实际画面判断，不宣称与参考原作 1:1，也不据此保证实体手机或多种 GPU 的长时间表现。\n\n## 来源与版本\n\n- 当前源码位于本总库，版本 **1.4.0**；源码已提交总库并通过GitHub Pages发布，正式地址见文首；本机预览端口仍为4176。\n- 《雨窗茶寮》的首帧由内置 imagegen 创建；首次 Seedance2.0 生成失败，随后经另行确认的 Kling V3 生成已完成。实际消耗264 credits，本地提交前估算180 credits，保留两者记录。\n- 实拍对照的视频来自 [Mixkit《Window on a rainy day》](https://mixkit.co/free-stock-video/window-on-a-rainy-day-2846/)，按 [Stock Video Free License](https://mixkit.co/license/#videoFree) 使用；雨声来自 [Shizhao《SV100344.ogg》](https://commons.wikimedia.org/wiki/File:SV100344.ogg#Licensing)，标记为 PD-author。两者经过裁剪与合成，音画不是同步现场录制。\n- 原有演示来自项目 002 v2.2.0，是参考 [Bee 的录屏](https://x.com/thtbee_/status/2114030630887641448) 独立重写的练习；未取得原作源码，不声称完整一致。\n- 山间茶息、月下花庭的主题、文案与画面为本次原创扩展练习。\n- 两个实时练习的旋律复用 002 原创程序配乐，生成过程见 [音频说明](../002-ink-rain-alley/assets/audio/README.md)。影院页不混入这段配乐。\n- Three.js 0.186.1、Vite 8.3.5：MIT；Cormorant Garamond 字体由 @fontsource/cormorant-garamond 5.3.0 本地提供：OFL-1.1。中文使用系统字体。\n- 本总库尚未选择统一许可证，各依赖保留自身许可证。\n\n\u003c!-- follow-video-task-1040462 -->\n## 后续本地接入结果\n\n2026-10-26T12:56:27.253274+00:00：已批准的 Kling 任务 1040462 返回影片，文件已下载、检查并接入本地影院页，关联构建已完成。片长15.046秒，实际消耗264 credits。本段保留自动接入记录；随后已进行局部抽帧与浏览器播放检查，完整视觉、情绪与音轨听感尚待人工验收。详见 `research/cinema/follow-status.json` 及本轮验证记录。\n",
      "passages": [
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 005 · 纸间 · 诗性风格实验室"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "> 一个研究诗性网页叙事的可运行项目。1.4.0 用可点击、可导出的研究总览图，连接源效果观察、氛围理解、本地实现、五项演示与证据边界。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 5,
          "endLine": 7,
          "text": "- **源效果是什么**：据 [Bee 的演示录屏](https://x.com/thtbee_/status/2114030630887641448)，纸墨、多场景与画幅变化，结合雨水、开花等自然微事件、文字和留白，组成诗性叙事。未取得原作源码，无法确认其内部技术与全部交互。\n- **我们做了什么、留下什么**：002 独立重写、两项原创实时练习、AI 单幕影片与有许可的实拍对照，共同形成可运行的比较材料。研究价值在于氛围组织方法、实时与影片载体的选型依据，以及场景、播放器、声音与验证记录等工程资产；不宣称与源作 1:1。\n- **还可往哪里扩展**：继续验证声画事件的前后关系、纸墨与写实影像的融合及更多具体场景；也可试作展览或文化内容入口。这些是待检验的潜力，尚未证明商业效果。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "## 线上访问 · 2026-10-27"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 11,
          "endLine": 11,
          "text": "[项目首页](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/) · [可点击研究总览](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/map.html) · [研究回顾](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/research.html) · [AI雨窗茶寮](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/cinema.html) · [原有九章](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html)"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 13,
          "endLine": 13,
          "text": "**002 是效果实现，005 是研究与扩展入口。** 总览图顶部的“002 · 原始效果实现”直接进入最初的002重写作品；旁边“原作录屏参考”链接作者的原演示，二者分别标注。图内卡片和九章直达入口继续保留，演示页可直接返回总览图。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 15,
          "endLine": 15,
          "text": "002在WebGL无法创建、上下文中断或绘制失败时，自动进入真实运行截图浏览，提供十个章节及四季切换，明确标注非实时且默认无声。[直接进入兼容浏览](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html?preview=static#rain)；`original.html` 仅透传允许的 `preview=static` 和章节hash。详细边界见[002兼容处理记录](../002-ink-rain-alley/research/browser-compatibility-2026-10-27.md)。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 17,
          "endLine": 17,
          "text": "已通过GitHub Actions发布并核对线上入口、指定引导图、图内链接、莲花章节和影片实际播放。部署过程与检查范围见[发布记录](research/deployment.md)。引导图使用用户确认的现有研究总览图，未重新生成。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 19,
          "endLine": 19,
          "text": "[返回总索引](../../README.md#项目索引) · [研究笔记](research/notes.md) · [验证记录](design-qa.md) · [已有演示项目](../002-ink-rain-alley/README.md)"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 21,
          "endLine": 21,
          "text": "![纸间研究总览图：源效果、氛围与技术、五项实践、价值与边界](assets/images/v1.4/research-map.png)"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 23,
          "endLine": 23,
          "text": "## 1.4.0 · 一图总览"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 25,
          "endLine": 25,
          "text": "[打开可交互研究总览图](http://127.0.0.1:4176/map.html)。首页主按钮旁及研究回顾顶部导航均可进入。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 27,
          "endLine": 31,
          "text": "- 2400×4339图解：原参考四组实际抽帧 → 氛围／技术两线 → 五项本地实践及九章链接 → 可复用价值与工程资产 → 制作流程与证据边界。\n- 技术均标为本地实现或复现路径，未取得原作源码，不将Three.js、WebGL或视频认定为原作内部方案。\n- 原参考四帧注明作者与演示链接；我们的五项演示使用已有真实截图或首帧。完整来源见 `research/overview-map-sources.json`，整理文本见 `research/overview-map-content.json`。\n- 网页内联SVG保留节点链接，支持缩放、滚动与鼠标拖动；SVG下载按当前网页地址保留完整链接，PNG为静态图。原演示容器现在可接受有效章节hash以直达相应章节。\n- SVG与PNG原件同时保留在 `app/media/` 与 `assets/images/v1.4/`，没有新增AI生成或费用。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 33,
          "endLine": 33,
          "text": "需要修改并重新导出图时，可选运行 `python tools/render-research-map.py`。工具使用Pillow、resvg-py与Windows系统中文字体；常规 `npm run build` 直接使用已有成品，不依赖Python。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "公开版本保留运行用视频、图片、音频、准确提示词、来源和脱敏核验记录。未压缩母版、原始下载、账户余额及操作日志保留本地，不是网页构建依赖；浏览网页不会调用生成服务。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 37,
          "endLine": 37,
          "text": "## 1.3.0 · 研究回顾"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 39,
          "endLine": 39,
          "text": "[打开研究回顾](http://127.0.0.1:4176/research.html)。首页导航与主按钮旁、两项影片页顶部和原演示容器均可进入，回顾页可直接返回各个演示。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 41,
          "endLine": 45,
          "text": "- 按真实来源区分原参考录屏、002独立重写、两项实时主题、AI影片与实拍对照；五项本地演示可按载体筛选。\n- 四轮探索与v1.0／v1.1茶息实际截图说明方向如何变化，不将功能检查通过等同于氛围成熟。\n- 整理可延续的方法、制作分工、主题扩展问题和下一轮检验标准；研究判断、创作目标与已验证事实分别标注。\n- 可主动播放现有AI样片，默认静音、不自动播放，不调用生成服务。影片来源、有限画面检查、待试听状态以及预估180／实际264积分在页面中保留。\n- 网页使用既有真实截图，来源清单为 `app/media/research/SOURCES.json`，没有新增生成任务。信息来源为本项目研究笔记、生成记录和验证记录。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 47,
          "endLine": 47,
          "text": "![研究回顾页的实际浏览器截图](assets/images/v1.3/research-desktop.png)"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 49,
          "endLine": 49,
          "text": "## 1.2.0 · 雨窗茶寮"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 51,
          "endLine": 51,
          "text": "本轮改为先做好一幕视频主导的氛围体验：从暖灯窗内望向雨中的远村，让檐雨、山雾、河面灯影与近处一盏茶共同构成连续镜头。影院页使用浏览器原生视频播放，不经过旧版 Three.js 后期，不把低频的模型位移当作影片运动，也不叠加旧电子配乐。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 53,
          "endLine": 53,
          "text": "### 素材与当前状态"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 55,
          "endLine": 59,
          "text": "- 原创首帧由内置 imagegen 创建，保存为 `app/media/cinema/rain-window-tea.jpg`。\n- 配套 AI 镜头已由 ChatArt 的 **Kling V3 任务1040462** 生成并接入本地影院。实际文件为 **15.046秒、1920×1080、24fps、H.264视频与AAC音轨**。\n- 本次确认时的本地估算为 **180 credits**，实际消耗已确认为 **264 credits**，余额净变动与服务返回一致。估算与实际不能混用，差异原因尚未确认。详情见[生成记录](research/cinema/generation-record.json)。\n- 首次 Seedance2.0 任务 **1040430** 服务端失败，未返回视频，查询到余额前后未变；历史记录见 [generation-record-seedance2.json](research/cinema/generation-record-seedance2.json)。Kling 任务经用户另行确认，不是自动重试。\n- 失败或超时不会自动重新提交、切换模型或产生下一次生成费用。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 61,
          "endLine": 61,
          "text": "当前 AI 影院已是 `ready` 状态，播放的是实际 MP4，不是首帧的缩放动画。生成前的 `pending` 首帧模式继续作为机制保留：没有影片时不请求 MP4，明确显示首帧预览并禁用播放操作。真正的文件加载失败仍显示失败状态与重试入口。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 63,
          "endLine": 63,
          "text": "生成完成、媒体验证和本地构建已完成。当前人工检查只覆盖部分抽帧与浏览器播放；技术检查确认音轨存在且非静音，尚未试听内容，不声称画面、情绪或声音已全部验收。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 65,
          "endLine": 65,
          "text": "相关记录：[首帧提示词](research/cinema/tea-keyframe-prompt.txt) · [视频提示词](research/cinema/tea-video-prompt.txt) · [源片运动与氛围分析](research/cinema/source-motion-notes.md)。网页短字幕独立于视频内容，并没有烧录进原片。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 67,
          "endLine": 67,
          "text": "本轮取得的是一幕约 15 秒的连续镜头；它不等于完成了 30 秒或更长的完整故事。抽帧中可见雨水、茶烟和取景变化，杯、窗框与远村基本稳定；镜头位移比提示词要求的极小漂移更明显。风、竹叶与茶烟之间的完整因果、全片稳定性和听感仍需人工检查。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 69,
          "endLine": 69,
          "text": "## 保留的实时练习"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 71,
          "endLine": 71,
          "text": "两个主题从物件陈列式构图改为具有前后关系的透视场景，镜头随三幕进度靠近主体。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 73,
          "endLine": 76,
          "text": "- **山间茶息**：窗景茶台、青灰釉茶器、石席与窗外山雾；倾壶注水带来水线、茶面波纹和蒸汽，后段转向杯口近景。\n- **月下花庭**：月洞门、台阶、庭树与水平反射水面构成庭院层次；月影、曲面玉兰和萤光随进度与操作变化。\n- **共用渲染**：HDR 离屏目标、ACES 风格色调映射、PCF 阴影与程序环境反射，用于保留高光、接触关系和物件表面层次。它们不等于完整的光照或水面物理模拟。\n- **画面让位**：收小主题文案，去掉常驻说明，让空间和动作承担更多表达。背景配乐沿用上一版，没有新增两首独立录音。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 78,
          "endLine": 78,
          "text": "旧版的按钮、导航和声音检查通过，不代表视觉质量已经达到预期。历史记录见 [1.0.0 验证](research/design-qa-v1.0.md)与 [1.1.0 验证](research/design-qa-v1.1.md)；视频主体验的实际画面、检查结果与剩余问题以[当前验证记录](design-qa.md)为准，不沿用旧版的视觉结论。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 80,
          "endLine": 80,
          "text": "## 当前入口"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 82,
          "endLine": 89,
          "text": "- [纸间入口](http://127.0.0.1:4176/)：影院主体验、保留作品入口、风格方法、固定／变化对照和扩展流程。\n- [研究回顾](http://127.0.0.1:4176/research.html)：参考观察、效果筛选、四轮迭代、研究价值、证据边界、素材出处和下一步问题。\n- [一图总览](http://127.0.0.1:4176/map.html)：可点击、放大阅读、下载PNG／SVG的完整研究图解。\n- [雨窗茶寮 · AI影片](http://127.0.0.1:4176/cinema.html)：已接入实际 Kling 生成影片，15.046秒，默认静音观看。\n- [雨窗 · 实拍对照](http://127.0.0.1:4176/rain-study.html)：另一个有许可的实拍样片，雨滴沿玻璃滑落、窗外灯光虚焦；雨声来自另源合成，不是 AI 茶寮成片，也不是同步现场录音。\n- [山间茶息 · 实时练习](http://127.0.0.1:4176/theme.html?theme=tea)：候山 → 注水 → 回甘；从窗景茶台靠近杯口，观看倾壶、水线、茶面波纹与蒸汽。\n- [月下花庭 · 实时练习](http://127.0.0.1:4176/theme.html?theme=moon)：入夜 → 绽放 → 随光；月洞门内外的庭院、月影水面、玉兰与萤光回应。\n- [原有九章演示](http://127.0.0.1:4176/original.html)：在本入口同一站点中打开 002 的构建产物，外层提供返回入口。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 91,
          "endLine": 91,
          "text": "上列为本机开发预览地址，正式线上地址见文首。当前4176保留后台生产预览。原有 4174 地址可以继续独立使用，新入口的原演示链接不依赖 4174 服务是否开启。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 93,
          "endLine": 93,
          "text": "## 本地运行"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 95,
          "endLine": 95,
          "text": "构建需要 Node.js 22.12+。影院页需要支持 MP4 视频播放的现代浏览器，实时练习另需 WebGL 2。首次运行，从仓库根目录安装两个子项目自己的依赖："
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 97,
          "endLine": 103,
          "text": "```powershell\nnpm --prefix projects/002-ink-rain-alley ci\nnpm --prefix projects/005-paper-poetics-lab ci\ncd projects/005-paper-poetics-lab\nnpm run build\nnpm run preview\n```"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 105,
          "endLine": 105,
          "text": "打开 `http://127.0.0.1:4176/`。安装后也可双击 `start-local.cmd`。如果该端口已有本次交付的后台服务，请直接访问，或用 `npm run preview -- --port 4177` 启动另一端口。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 107,
          "endLine": 107,
          "text": "构建会先构建 002，再将其 `dist/` 复制到本项目 `dist/original/`，与入口、AI 影院、实拍对照和实时练习一起提供。影院素材按指定名单复制："
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 109,
          "endLine": 114,
          "text": "```text\napp/media/cinema/rain-window-tea.jpg → dist/media/cinema/rain-window-tea.jpg\napp/media/cinema/rain-window-tea.mp4 → dist/media/cinema/rain-window-tea.mp4\napp/media/cinema/rain-window-study.jpg → dist/media/cinema/rain-window-study.jpg\napp/media/cinema/rain-window-study.mp4 → dist/media/cinema/rain-window-study.mp4\n```"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 116,
          "endLine": 116,
          "text": "文件存在时才复制，保留运行时相对路径；构建不会发起视频生成。不会迁移或删除 002 源文件，也不清空其他项目输出。开发时可运行 `npm run dev`；开发服务器将 `/original/` 映射到 002 的已有构建产物。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 118,
          "endLine": 118,
          "text": "## 入口中沉淀的理解"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 120,
          "endLine": 124,
          "text": "- **留白**：一幕有一个注意力中心；空白和密集画面承担不同的叙事作用。\n- **材质**：弱纸粒、哑光物件、浓淡与不规则边缘共同组成画面，而不是给所有内容覆盖同一层滤镜。\n- **动作**：进入、变化、停留都有意义。注水会带来水线、波纹、热气；夜花与微光会回应操作。\n- **文字**：短句与场景一起表达，说明和控制项保持清楚；文字不取代真实的画面变化。\n- **声音**：AI 影院只播放生成影片自身的音轨，默认静音；实拍对照片播放另源合成的雨声；实时练习仍沿用简短音乐动机与分主题环境声。不同来源分别标注，不用同一段电子配乐覆盖所有体验。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 126,
          "endLine": 126,
          "text": "固定规则与可变项在网页中对照呈现。扩展流程为：选择可感知的日常 → 确定一个主体和一种变化 → 排成三个不同的时刻 → 放入真实浏览路径并验证。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 128,
          "endLine": 128,
          "text": "## 影院观看"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 130,
          "endLine": 130,
          "text": "以下是影院页提供的观看方式。实际播放已经检查，其余逐项检查范围见验证记录，不将功能实现视为全部验收："
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 132,
          "endLine": 137,
          "text": "- 影片载入后默认静音自动播放一次，结束后停留，可播放／暂停、从头重看和拖动细进度条；不硬循环。\n- 手机默认在暗背景中保留完整 16:9 画面，避免裁掉茶杯或雨村；“铺满”可主动切换，边缘会被裁切。全屏与铺满是两个独立操作。\n- 偏好减少动态时初始保留静止画面，由用户主动播放。切到后台会暂停，返回后需要自行续播。\n- 空格播放／暂停，M 切换静音，左右方向键前后移动约两秒；焦点在按钮、滑杆等操作项上时保留其自身行为。\n- 字幕只在短时间窗出现，可在“创作说明”里关闭；控件在播放时淡出，移动指针或轻触可唤出。\n- “声音”开关不启动 Three.js 练习的旧配乐。AI 片使用生成文件中的非静音 AAC 音轨，尚未完成主观试听；实拍对照片的声音是单独雨声素材的合成。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 139,
          "endLine": 139,
          "text": "## 实时练习操作"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 141,
          "endLine": 147,
          "text": "- 三幕按钮和底部滑杆定位；滚轮或触摸滑动推进。\n- 默认自动浏览三幕，结束时停止；手动滚动或定位会接管，也可点击「停止浏览」。系统偏好减少动态时不自动推进。带 `p=` 的定位链接保留指定画面。\n- 「暂停动态」冻结画面，也暂停声音；继续后恢复。\n- 茶息的「注一盏茶」可在任何一幕触发一次倾壶；注水一幕也由进度驱动该动作。\n- 花庭的「唤起萤光」使花瓣、涟漪和萤光短暂回应。\n- 「声音 关／开」切换背景音乐与主题环境声。音乐复用 002 原创《纸上归途》，不是新增两首独立录音。\n- 方向键／Page Up、Page Down 切幕；空格暂停，输入框和按钮保留自身键盘行为。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 149,
          "endLine": 149,
          "text": "## 实现结构"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 151,
          "endLine": 158,
          "text": "```text\napp/index.html       风格入口、作品与理解总结\napp/portal.js        入口交互、作品与风格方法切换\napp/research.html    可浏览的研究回顾、证据与来源\napp/research.css     纸面阅读布局、对照图与响应式排版\napp/research.js      效果筛选、内容渲染与主动视频预览\napp/research-data.js 五项演示、四轮探索、研究判断与待验问题\napp/map.html         单图总览的缩放、链接与导出入口"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 159,
          "endLine": 166,
          "text": "app/map.js           内联SVG、相对链接适配与阅读控制\ntools/render-research-map.py 从研究文本及真实配图导出中文SVG与PNG\napp/cinema.html      雨窗茶寮原生视频容器与少量观看操作\napp/cinema.css       影院布局、完整画幅、短字幕与克制控件\napp/cinema.js        素材状态、播放、字幕时间、静音与降级\napp/rain-study.html  有许可的实拍对照，复用影院播放器并标注音画来源\napp/theme.html       共用三幕体验容器\napp/viewer.js        进度、导航、动作、声音与键盘"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 167,
          "endLine": 174,
          "text": "app/data.js          两个主题的内容、文案、动作与风格说明\napp/engine.js        HDR 离屏、色调映射、环境反射、深度虚化、纸边与绘制调度\napp/scenes/tea.js    透视窗景茶台、釉器、石席、山雾、注水与杯口镜头\napp/scenes/moon.js   月洞门、台阶、Reflector 水面、玉兰、庭树与萤光\napp/scenes/utils.js  材质、曲线、噪声与资源释放\napp/ambience.js      共用旋律与分主题环境声\napp/original.html    原演示容器与返回入口\n```"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 176,
          "endLine": 176,
          "text": "影院页由浏览器直接解码视频，不创建旧 Three.js 场景、HDR 目标或环境反射。AI 成片与实拍对照片均已保存到项目中，通过本地媒体文件播放，不依赖远程视频热链。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 178,
          "endLine": 178,
          "text": "保留的实时预览按 30 FPS 上限调度，滚出视口后暂停；实时主题页按 60 FPS 上限调度，尺寸与像素比设有限制。这些是调度设置，不是设备性能保证。实时画面仍由 Three.js、Canvas 和着色器生成，环境反射由程序房间提供，没有新增远程模型。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 180,
          "endLine": 180,
          "text": "浏览网站本身没有账号、数据库或外部 API，也不需要生成服务的密钥；ChatArt 用于制作阶段的素材生成，不在观看时提交生成任务。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 182,
          "endLine": 182,
          "text": "## 验证与配图"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 184,
          "endLine": 184,
          "text": "运行 `npm run check` 做全部 JS 模块语法和入口存在性检查，`npm run build` 构建两个关联项目。具体执行结果、浏览器检查与限制见 [design-qa.md](design-qa.md)。不以构建成功替代画面判断。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 186,
          "endLine": 186,
          "text": "项目引导图使用本轮生成的 `assets/images/v1.4/research-map.png`，交互版见一图总览；`assets/images/cover.jpg` 与 `assets/images/portal-desktop.png` 保留入口实景。1.3.0研究回顾与更新入口的实景证据保存于 `assets/images/v1.3/`；1.2.0影院实景与窄屏证据保留于 `assets/images/v1.2/`。实际捕获状态、播放结果和对应文件以本轮验证记录为准，不将首帧截图当作视频播放证据。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 188,
          "endLine": 188,
          "text": "保留的实时练习及历史配图："
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 190,
          "endLine": 194,
          "text": "- `assets/images/v1.1/tea-production.png`、`assets/images/v1.1/moon-production.png`：1.1.0 两个主题的生产页面。\n- `assets/images/v1.1/tea-stage-1.png` 至 `tea-stage-3.png`：茶息三幕。\n- `assets/images/v1.1/moon-stage-1.png` 至 `moon-stage-3.png`：花庭三幕。\n- `assets/images/v1.1/mobile-tea.png`、`assets/images/v1.1/mobile-moon.png`：1.1.0 窄屏画面。\n- `assets/images/style-source-original.png`：002 的风格参考，不能作为 005 新主题截图。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 196,
          "endLine": 196,
          "text": "目录中旧版的 `tea-production.png`、`moon-production.png`、`tea-art-final.png`、`moon-art-final.png` 和旧手机截图保留用于对照，不作为视频主体验已通过的证据。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 198,
          "endLine": 198,
          "text": "当前仍为创作原型。AI 影片已返回并能播放，声音与完整视觉质量尚待人工验收；实时练习的器物、花瓣和水汽仍具有程序生成特征，注水、反射与声场不是完整物理模拟。没有可视化编辑器、内容保存或一键视频导出。视觉完成度和设备表现仍需结合本轮实际画面判断，不宣称与参考原作 1:1，也不据此保证实体手机或多种 GPU 的长时间表现。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 200,
          "endLine": 200,
          "text": "## 来源与版本"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 202,
          "endLine": 209,
          "text": "- 当前源码位于本总库，版本 **1.4.0**；源码已提交总库并通过GitHub Pages发布，正式地址见文首；本机预览端口仍为4176。\n- 《雨窗茶寮》的首帧由内置 imagegen 创建；首次 Seedance2.0 生成失败，随后经另行确认的 Kling V3 生成已完成。实际消耗264 credits，本地提交前估算180 credits，保留两者记录。\n- 实拍对照的视频来自 [Mixkit《Window on a rainy day》](https://mixkit.co/free-stock-video/window-on-a-rainy-day-2846/)，按 [Stock Video Free License](https://mixkit.co/license/#videoFree) 使用；雨声来自 [Shizhao《SV100344.ogg》](https://commons.wikimedia.org/wiki/File:SV100344.ogg#Licensing)，标记为 PD-author。两者经过裁剪与合成，音画不是同步现场录制。\n- 原有演示来自项目 002 v2.2.0，是参考 [Bee 的录屏](https://x.com/thtbee_/status/2114030630887641448) 独立重写的练习；未取得原作源码，不声称完整一致。\n- 山间茶息、月下花庭的主题、文案与画面为本次原创扩展练习。\n- 两个实时练习的旋律复用 002 原创程序配乐，生成过程见 [音频说明](../002-ink-rain-alley/assets/audio/README.md)。影院页不混入这段配乐。\n- Three.js 0.186.1、Vite 8.3.5：MIT；Cormorant Garamond 字体由 @fontsource/cormorant-garamond 5.3.0 本地提供：OFL-1.1。中文使用系统字体。\n- 本总库尚未选择统一许可证，各依赖保留自身许可证。"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 211,
          "endLine": 212,
          "text": "\u003c!-- follow-video-task-1040462 -->\n## 后续本地接入结果"
        },
        {
          "path": "projects/005-paper-poetics-lab/README.md",
          "startLine": 214,
          "endLine": 214,
          "text": "2026-10-26T12:56:27.253274+00:00：已批准的 Kling 任务 1040462 返回影片，文件已下载、检查并接入本地影院页，关联构建已完成。片长15.046秒，实际消耗264 credits。本段保留自动接入记录；随后已进行局部抽帧与浏览器播放检查，完整视觉、情绪与音轨听感尚待人工验收。详见 `research/cinema/follow-status.json` 及本轮验证记录。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 79,
        "endLine": 97,
        "text": "    {\n      \"id\": \"005\",\n      \"slug\": \"paper-poetics-lab\",\n      \"name\": \"纸间 · 诗性风格实验室\",\n      \"summary\": \"用水墨重写、实时茶庭和 AI 雨窗样片比较三种氛围表达方式。图解说明何时选网页交互、实时场景或生成视频，并记录各自的制作条件。\",\n      \"source\": \"https://x.com/thtbee_/status/2114030630887641448\",\n      \"sourceName\": \"Bee 原演示（未取得源库）\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"视频氛围\",\n        \"AI视频\",\n        \"Three.js\",\n        \"风格研究\",\n        \"交互叙事\"\n      ],\n      \"cover\": \"assets/images/v1.4/research-map.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/\",\n      \"createdAt\": \"2026-10-26\"\n    },"
      }
    },
    {
      "id": "006",
      "slug": "prompthub-ai-assets",
      "name": "PromptHub · AI 工作资产与复用",
      "summary": "研究 PromptHub 如何管理提示词、Skills、MCP、插件与规则。档案记录把反复验证的工作经验整理成可复用资产的方法，笔记提炼与回写待接入。",
      "source": "https://github.com/legeling/PromptHub",
      "status": "completed",
      "tags": [
        "PromptHub",
        "AI工作流",
        "Skill",
        "提示词管理",
        "笔记到工具"
      ],
      "createdAt": "2026-10-27",
      "readmePath": "projects/006-prompthub-ai-assets/README.md",
      "readmeSha256": "5c194286137e13b74d1945bcc39652cdae3fabaac507e06c74ef8d54d8c61b16",
      "readmeText": "# 006 · PromptHub · AI 工作资产与复用\n\n> PromptHub 集中管理提示词、Skills、MCP、插件与规则，通过模板、技能分发和配置适配供 AI 复用。对我的价值是借鉴其方法，把每日笔记中验证有效的经验沉淀为工作资产，减少重复说明与跨工具配置；笔记自动提炼和结果回写需另接入。\n\n[返回总索引](../../README.md#项目索引) · [原始仓库](https://github.com/legeling/PromptHub) · [放大引导图](assets/images/prompthub-capabilities-overview.png) · [研究依据与验证记录](research/notes.md)\n\n[![PromptHub 能力与价值全景图：五类资产、复用方式、配套能力及对每日笔记的意义](assets/images/prompthub-capabilities-overview.png)](assets/images/prompthub-capabilities-overview.png)\n\n图：本次对话于 2026-10-26 使用内置 ImageGen 生成、由用户选定的中文信息图，原图为 1536 × 1024。上半部分整理仓库已有能力，下半部分是我们结合每日笔记软件提出的产品方向。它是研究引导图，非软件界面截图，也不表示已经与每日笔记软件接通。\n\n| 项目 | 内容 |\n| --- | --- |\n| 编号与收录日期 | `006` · 2026-10-27，北京时间 |\n| 上游 | [legeling/PromptHub](https://github.com/legeling/PromptHub) |\n| 研究快照 | [`de98c0da569b2fede19fa4c4e577b11f5b4bf698`](https://github.com/legeling/PromptHub/tree/de98c0da569b2fede19fa4c4e577b11f5b4bf698)；提交时间为 2026-10-23 |\n| 快照版本口径 | README 标记稳定版 `0.6.1`、主分支开发版 `0.6.2`；本文以固定快照为准 |\n| 上游许可证 | [GNU AGPL-3.0](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/LICENSE) |\n| 本次成果 | 说明与核心代码阅读、价值判断、能力引导图；已总结 |\n| 实践与部署状态 | 未安装运行上游，未验证模型调用、实际分发或同步；本子项目无运行服务和在线演示 |\n\n## 它的能力到底是什么\n\n它把我们给 AI 的要求、工作方法及工具配置集中保管，并提供导入、修改、测试、分发和恢复入口。实际执行任务的仍是相应 AI 工具、模型和连接的外部服务。\n\n| 管理对象 | 用普通话解释 | 可以复用成什么 |\n| --- | --- | --- |\n| 提示词 Prompt | 一段反复使用的要求，例如写作格式、审查清单；可分类、搜索、加变量、保留版本 | 填入本次主题后复制使用，或调用配置好的模型测试 |\n| 技能 Skill | 工作流程，加上需要的脚本、参考资料等文件；可从商店、仓库或本地导入 | 安装到支持的 AI 工具，让工具加载并使用这套方法 |\n| 规则 Rules | 长期要求与项目规范，例如 `AGENTS.md`、`CLAUDE.md` 等文件 | 放在目标工具会读取的位置，作为任务约束 |\n| MCP 连接配置 | AI 工具访问外部服务所需的连接参数 | 适配并写入目标工具配置，供该工具连接服务 |\n| 插件 Plugin | 可以安装的扩展包；支持市场导入、版本与来源更新 | 分发到支持的平台，按目标工具的安装机制使用 |\n\n配套能力包括版本与差异管理、回滚、来源更新检查、AI 生成和润色、多模型比较，以及全局和项目资源管理。数据默认保存在本机，还提供同步、完整备份、独立 CLI 和自部署 Web 等入口。不同资源和平台的支持程度有差异，不能将某一入口的全部能力套用到其他入口。\n\n## “被 AI 复用”具体怎样发生\n\n1. **提示词：填内容，再使用。** 保存 `请为 {{读者}} 写一篇关于 {{主题}} 的文章`，下次只填写读者和主题，随后复制使用或发给已配置的模型测试。\n2. **技能：把完整文件包安装到目标目录。** `Copy` 给每个工具一份独立副本；`Symlink` 让工具指向同一份技能目录，共享后续修改。完整包可以包含 `SKILL.md`、脚本和参考资料；某些环境无法建立链接时会回退为复制。安装记录与内容指纹用于识别本地修改和冲突。\n3. **规则与 MCP：维护目标工具会加载的文件。** 规则作为要求由工具读取；MCP 则通过 JSON、TOML 等配置适配目标平台。保存了配置，还需要相应工具和服务能够正常工作。\n4. **插件：按支持的平台安装。** 插件分发和生效方式取决于目标平台，扩展包的跨平台使用需要相应工具支持。\n\n因此，普通笔记交给 AI 也可以复用。PromptHub 增加的便利在于组织资产、适配目录和配置、分发安装，以及持续维护和恢复这些内容。\n\n## 对我的价值是什么\n\n### 可以借鉴：让日常经验形成可复用的工作方法\n\n每日笔记积累的是事实、经历、感受和资料。其中一部分会逐渐形成反复有效的方法，例如每周复盘、整理资料、写文章或检查代码的流程。\n\n我们可以从这些记录中提炼出模板、技能和规则，交给 AI 在后续任务中使用。这是本次讨论中“从记录笔记，进一步沉淀工具”的具体含义；这里的工具可能只是一个模板，也可能是包含脚本和资料的完整技能包。\n\n例如，我们可以把“每周复盘”整理为：\n\n> 阅读本周提供的日记 → 提取重要事件 → 找出反复出现的问题 → 给出下周行动。\n\n先由人整理，或另接 AI 协助提炼，再把经过使用验证的流程保存和维护起来。以后提供新的日记材料，就能重复使用这套方法，减少每次重新说明步骤的成本。\n\n### 什么时候值得使用\n\n- **只收藏少量提示词时：** 与现有每日笔记的分类、搜索和记录功能重叠较多，新增价值有限。\n- **方法和技能越来越多时：** 版本、更新检查、差异和恢复可以降低长期维护成本。\n- **同时使用多个 AI 工具时：** 同一套技能、规则和连接配置可以集中管理，减少复制文件与重复配置。\n\n对我最有价值的借鉴是“日常记录 → 提炼有效方法 → 形成工作资产 → 交给 AI 复用”。这是一条可考虑的产品延伸方向，本次整理不代表已决定开发，也没有改变现有笔记软件或数据。\n\n## 需要保留的理解边界\n\n- 仓库未承诺已接通我的每日笔记：自动检索日记、自动提炼技能、执行后回写结果，都需要另外接入和验证。\n- 技能安装成功之后，仍需要目标 AI 工具加载并支持相应内容；执行质量取决于流程本身、工具及模型。\n- AI 生成、翻译和测试需要配置模型服务；相关请求内容会交给所配置的服务处理。普通本地整理与这些模型调用是不同操作。\n- README 明确说明私密文件夹提供应用内隐藏，本地文件本身不加密。\n- 在线同步与自托管备份用途不同：WebDAV/S3 用于同步；自托管 Web 的桌面自动备份上传恢复快照，恢复需显式触发。本机扫描和向本机 AI 工具分发主要由桌面端与 CLI 负责。\n\n## 实现线索与研究范围\n\n桌面端采用 Electron、React 和 TypeScript；共享核心负责资源管理、文件分发与配置适配，数据层结合 SQLite 和文件系统。AI 功能通过配置好的模型 API 发起请求。关键代码及其能证明的范围记录在[研究笔记](research/notes.md#关键阅读依据)中。\n\n本次完成的是阅读与概念整理，没有实机验收上游产品，也没有复制上游源码、嵌套上游 `.git` 或接触每日笔记数据。引导图帮助阅读，不作为功能运行成功的证据。\n\n## 本地阅读与上游运行说明\n\n本子项目为 Markdown 文档与图片，直接打开本页即可阅读。`app/` 保留总库模板要求的占位目录，没有应用依赖、构建命令或待部署网页。\n\n如后续需要实测上游，应在本研究总库之外的独立目录准备 Node.js ≥ 24、pnpm 9，再按固定快照运行。下面是依据上游 README 整理的步骤，本次未执行：\n\n```powershell\ngit clone https://github.com/legeling/PromptHub.git\ncd PromptHub\ngit checkout de98c0da569b2fede19fa4c4e577b11f5b4bf698\npnpm install\npnpm electron:dev\n```\n\n研究总库的索引校验在根目录执行：\n\n```powershell\nnpm.cmd run check\n```\n\n## 图片、来源与授权\n\n- 引导图：[能力与价值全景图](assets/images/prompthub-capabilities-overview.png)，为本次对话生成并选定的说明图，完整保留原图；[图片来源记录](assets/images/README.md)记载制作方式和用途。\n- 能力与实现依据：[固定版本 README](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/README.md)及研究笔记列出的核心代码。\n- 对每日笔记的意义、适用条件与可能延伸，属于本次讨论形成的判断，未作为上游已经实现的功能。\n- 上游代码沿用其 AGPL-3.0 许可证。本子项目未复制上游代码或软件截图；原创研究说明与生成配图不改变上游授权，总库当前未选择统一开源许可证。\n",
      "passages": [
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 006 · PromptHub · AI 工作资产与复用"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "> PromptHub 集中管理提示词、Skills、MCP、插件与规则，通过模板、技能分发和配置适配供 AI 复用。对我的价值是借鉴其方法，把每日笔记中验证有效的经验沉淀为工作资产，减少重复说明与跨工具配置；笔记自动提炼和结果回写需另接入。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "[返回总索引](../../README.md#项目索引) · [原始仓库](https://github.com/legeling/PromptHub) · [放大引导图](assets/images/prompthub-capabilities-overview.png) · [研究依据与验证记录](research/notes.md)"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 7,
          "endLine": 7,
          "text": "[![PromptHub 能力与价值全景图：五类资产、复用方式、配套能力及对每日笔记的意义](assets/images/prompthub-capabilities-overview.png)](assets/images/prompthub-capabilities-overview.png)"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "图：本次对话于 2026-10-26 使用内置 ImageGen 生成、由用户选定的中文信息图，原图为 1536 × 1024。上半部分整理仓库已有能力，下半部分是我们结合每日笔记软件提出的产品方向。它是研究引导图，非软件界面截图，也不表示已经与每日笔记软件接通。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 11,
          "endLine": 18,
          "text": "| 项目 | 内容 |\n| --- | --- |\n| 编号与收录日期 | `006` · 2026-10-27，北京时间 |\n| 上游 | [legeling/PromptHub](https://github.com/legeling/PromptHub) |\n| 研究快照 | [`de98c0da569b2fede19fa4c4e577b11f5b4bf698`](https://github.com/legeling/PromptHub/tree/de98c0da569b2fede19fa4c4e577b11f5b4bf698)；提交时间为 2026-10-23 |\n| 快照版本口径 | README 标记稳定版 `0.6.1`、主分支开发版 `0.6.2`；本文以固定快照为准 |\n| 上游许可证 | [GNU AGPL-3.0](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/LICENSE) |\n| 本次成果 | 说明与核心代码阅读、价值判断、能力引导图；已总结 |"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 19,
          "endLine": 19,
          "text": "| 实践与部署状态 | 未安装运行上游，未验证模型调用、实际分发或同步；本子项目无运行服务和在线演示 |"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 21,
          "endLine": 21,
          "text": "## 它的能力到底是什么"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 23,
          "endLine": 23,
          "text": "它把我们给 AI 的要求、工作方法及工具配置集中保管，并提供导入、修改、测试、分发和恢复入口。实际执行任务的仍是相应 AI 工具、模型和连接的外部服务。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 25,
          "endLine": 31,
          "text": "| 管理对象 | 用普通话解释 | 可以复用成什么 |\n| --- | --- | --- |\n| 提示词 Prompt | 一段反复使用的要求，例如写作格式、审查清单；可分类、搜索、加变量、保留版本 | 填入本次主题后复制使用，或调用配置好的模型测试 |\n| 技能 Skill | 工作流程，加上需要的脚本、参考资料等文件；可从商店、仓库或本地导入 | 安装到支持的 AI 工具，让工具加载并使用这套方法 |\n| 规则 Rules | 长期要求与项目规范，例如 `AGENTS.md`、`CLAUDE.md` 等文件 | 放在目标工具会读取的位置，作为任务约束 |\n| MCP 连接配置 | AI 工具访问外部服务所需的连接参数 | 适配并写入目标工具配置，供该工具连接服务 |\n| 插件 Plugin | 可以安装的扩展包；支持市场导入、版本与来源更新 | 分发到支持的平台，按目标工具的安装机制使用 |"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 33,
          "endLine": 33,
          "text": "配套能力包括版本与差异管理、回滚、来源更新检查、AI 生成和润色、多模型比较，以及全局和项目资源管理。数据默认保存在本机，还提供同步、完整备份、独立 CLI 和自部署 Web 等入口。不同资源和平台的支持程度有差异，不能将某一入口的全部能力套用到其他入口。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "## “被 AI 复用”具体怎样发生"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 37,
          "endLine": 40,
          "text": "1. **提示词：填内容，再使用。** 保存 `请为 {{读者}} 写一篇关于 {{主题}} 的文章`，下次只填写读者和主题，随后复制使用或发给已配置的模型测试。\n2. **技能：把完整文件包安装到目标目录。** `Copy` 给每个工具一份独立副本；`Symlink` 让工具指向同一份技能目录，共享后续修改。完整包可以包含 `SKILL.md`、脚本和参考资料；某些环境无法建立链接时会回退为复制。安装记录与内容指纹用于识别本地修改和冲突。\n3. **规则与 MCP：维护目标工具会加载的文件。** 规则作为要求由工具读取；MCP 则通过 JSON、TOML 等配置适配目标平台。保存了配置，还需要相应工具和服务能够正常工作。\n4. **插件：按支持的平台安装。** 插件分发和生效方式取决于目标平台，扩展包的跨平台使用需要相应工具支持。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 42,
          "endLine": 42,
          "text": "因此，普通笔记交给 AI 也可以复用。PromptHub 增加的便利在于组织资产、适配目录和配置、分发安装，以及持续维护和恢复这些内容。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 44,
          "endLine": 44,
          "text": "## 对我的价值是什么"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 46,
          "endLine": 46,
          "text": "### 可以借鉴：让日常经验形成可复用的工作方法"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 48,
          "endLine": 48,
          "text": "每日笔记积累的是事实、经历、感受和资料。其中一部分会逐渐形成反复有效的方法，例如每周复盘、整理资料、写文章或检查代码的流程。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 50,
          "endLine": 50,
          "text": "我们可以从这些记录中提炼出模板、技能和规则，交给 AI 在后续任务中使用。这是本次讨论中“从记录笔记，进一步沉淀工具”的具体含义；这里的工具可能只是一个模板，也可能是包含脚本和资料的完整技能包。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 52,
          "endLine": 52,
          "text": "例如，我们可以把“每周复盘”整理为："
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 54,
          "endLine": 54,
          "text": "> 阅读本周提供的日记 → 提取重要事件 → 找出反复出现的问题 → 给出下周行动。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 56,
          "endLine": 56,
          "text": "先由人整理，或另接 AI 协助提炼，再把经过使用验证的流程保存和维护起来。以后提供新的日记材料，就能重复使用这套方法，减少每次重新说明步骤的成本。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 58,
          "endLine": 58,
          "text": "### 什么时候值得使用"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 60,
          "endLine": 62,
          "text": "- **只收藏少量提示词时：** 与现有每日笔记的分类、搜索和记录功能重叠较多，新增价值有限。\n- **方法和技能越来越多时：** 版本、更新检查、差异和恢复可以降低长期维护成本。\n- **同时使用多个 AI 工具时：** 同一套技能、规则和连接配置可以集中管理，减少复制文件与重复配置。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 64,
          "endLine": 64,
          "text": "对我最有价值的借鉴是“日常记录 → 提炼有效方法 → 形成工作资产 → 交给 AI 复用”。这是一条可考虑的产品延伸方向，本次整理不代表已决定开发，也没有改变现有笔记软件或数据。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 66,
          "endLine": 66,
          "text": "## 需要保留的理解边界"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 68,
          "endLine": 72,
          "text": "- 仓库未承诺已接通我的每日笔记：自动检索日记、自动提炼技能、执行后回写结果，都需要另外接入和验证。\n- 技能安装成功之后，仍需要目标 AI 工具加载并支持相应内容；执行质量取决于流程本身、工具及模型。\n- AI 生成、翻译和测试需要配置模型服务；相关请求内容会交给所配置的服务处理。普通本地整理与这些模型调用是不同操作。\n- README 明确说明私密文件夹提供应用内隐藏，本地文件本身不加密。\n- 在线同步与自托管备份用途不同：WebDAV/S3 用于同步；自托管 Web 的桌面自动备份上传恢复快照，恢复需显式触发。本机扫描和向本机 AI 工具分发主要由桌面端与 CLI 负责。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 74,
          "endLine": 74,
          "text": "## 实现线索与研究范围"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 76,
          "endLine": 76,
          "text": "桌面端采用 Electron、React 和 TypeScript；共享核心负责资源管理、文件分发与配置适配，数据层结合 SQLite 和文件系统。AI 功能通过配置好的模型 API 发起请求。关键代码及其能证明的范围记录在[研究笔记](research/notes.md#关键阅读依据)中。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 78,
          "endLine": 78,
          "text": "本次完成的是阅读与概念整理，没有实机验收上游产品，也没有复制上游源码、嵌套上游 `.git` 或接触每日笔记数据。引导图帮助阅读，不作为功能运行成功的证据。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 80,
          "endLine": 80,
          "text": "## 本地阅读与上游运行说明"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 82,
          "endLine": 82,
          "text": "本子项目为 Markdown 文档与图片，直接打开本页即可阅读。`app/` 保留总库模板要求的占位目录，没有应用依赖、构建命令或待部署网页。"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 84,
          "endLine": 84,
          "text": "如后续需要实测上游，应在本研究总库之外的独立目录准备 Node.js ≥ 24、pnpm 9，再按固定快照运行。下面是依据上游 README 整理的步骤，本次未执行："
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 86,
          "endLine": 92,
          "text": "```powershell\ngit clone https://github.com/legeling/PromptHub.git\ncd PromptHub\ngit checkout de98c0da569b2fede19fa4c4e577b11f5b4bf698\npnpm install\npnpm electron:dev\n```"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 94,
          "endLine": 94,
          "text": "研究总库的索引校验在根目录执行："
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 96,
          "endLine": 98,
          "text": "```powershell\nnpm.cmd run check\n```"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 100,
          "endLine": 100,
          "text": "## 图片、来源与授权"
        },
        {
          "path": "projects/006-prompthub-ai-assets/README.md",
          "startLine": 102,
          "endLine": 105,
          "text": "- 引导图：[能力与价值全景图](assets/images/prompthub-capabilities-overview.png)，为本次对话生成并选定的说明图，完整保留原图；[图片来源记录](assets/images/README.md)记载制作方式和用途。\n- 能力与实现依据：[固定版本 README](https://github.com/legeling/PromptHub/blob/de98c0da569b2fede19fa4c4e577b11f5b4bf698/README.md)及研究笔记列出的核心代码。\n- 对每日笔记的意义、适用条件与可能延伸，属于本次讨论形成的判断，未作为上游已经实现的功能。\n- 上游代码沿用其 AGPL-3.0 许可证。本子项目未复制上游代码或软件截图；原创研究说明与生成配图不改变上游授权，总库当前未选择统一开源许可证。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 98,
        "endLine": 115,
        "text": "    {\n      \"id\": \"006\",\n      \"slug\": \"prompthub-ai-assets\",\n      \"name\": \"PromptHub · AI 工作资产与复用\",\n      \"summary\": \"研究 PromptHub 如何管理提示词、Skills、MCP、插件与规则。档案记录把反复验证的工作经验整理成可复用资产的方法，笔记提炼与回写待接入。\",\n      \"source\": \"https://github.com/legeling/PromptHub\",\n      \"status\": \"completed\",\n      \"tags\": [\n        \"PromptHub\",\n        \"AI工作流\",\n        \"Skill\",\n        \"提示词管理\",\n        \"笔记到工具\"\n      ],\n      \"cover\": \"assets/images/prompthub-capabilities-overview.png\",\n      \"demoUrl\": \"\",\n      \"createdAt\": \"2026-10-27\"\n    },"
      }
    },
    {
      "id": "007",
      "slug": "pelican-bicycle",
      "name": "鹈鹕的单车日和",
      "summary": "体验一只在海边骑车的鹈鹕。SVG 画角色与景物，CSS 做轮转和微动，可暂停、调速，支持减少动态效果设置。适合参考轻量网页动画的实现。",
      "source": "https://github.com/yydshly/1025_codex_project",
      "status": "building",
      "tags": [
        "网页动画",
        "插画",
        "交互"
      ],
      "createdAt": "2026-10-27",
      "readmePath": "projects/007-pelican-bicycle/README.md",
      "readmeSha256": "b8a8d14becc2f0e3f628da89b49984cb3ede636c356d3b443b8c1249f81c6248",
      "readmeText": "# 007 · 鹈鹕的单车日和\n\n一只戴着小帽子的鹈鹕骑车经过海边：这是一个用原生 SVG、CSS 和少量 JavaScript 制作的轻量互动动画。\n\n[在线体验](https://yydshly.github.io/1025_codex_project/007-pelican-bicycle/) · [返回总索引](../../README.md#项目索引) · [实现笔记](research/notes.md)\n\n## 体验\n\n打开页面即可看到车轮转动、骑手轻轻起伏、云朵和花草随风摆动。页面提供暂停和调整速度的按钮，并适配手机屏幕；系统启用减少动态效果时，页面会从暂停状态开始。\n\n## 本地运行\n\n无需安装依赖或构建。直接在浏览器中打开 [app/index.html](app/index.html)，即可体验。所有插画均为项目内的 SVG，无需联网加载资源。\n\n## 实现说明\n\n画面由 SVG 绘制，车轮、曲柄、骑手和背景使用 CSS 动画，按钮通过 JavaScript 控制动画的暂停和速度。动画以插画表现为主，并非精确的自行车机械运动模拟。\n\n## 来源与授权\n\n本项目为本库原创实践，没有外部上游项目或素材。项目文件适用本仓库的授权约定。\n",
      "passages": [
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 007 · 鹈鹕的单车日和"
        },
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "一只戴着小帽子的鹈鹕骑车经过海边：这是一个用原生 SVG、CSS 和少量 JavaScript 制作的轻量互动动画。"
        },
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "[在线体验](https://yydshly.github.io/1025_codex_project/007-pelican-bicycle/) · [返回总索引](../../README.md#项目索引) · [实现笔记](research/notes.md)"
        },
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 7,
          "endLine": 7,
          "text": "## 体验"
        },
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "打开页面即可看到车轮转动、骑手轻轻起伏、云朵和花草随风摆动。页面提供暂停和调整速度的按钮，并适配手机屏幕；系统启用减少动态效果时，页面会从暂停状态开始。"
        },
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 11,
          "endLine": 11,
          "text": "## 本地运行"
        },
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 13,
          "endLine": 13,
          "text": "无需安装依赖或构建。直接在浏览器中打开 [app/index.html](app/index.html)，即可体验。所有插画均为项目内的 SVG，无需联网加载资源。"
        },
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 15,
          "endLine": 15,
          "text": "## 实现说明"
        },
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 17,
          "endLine": 17,
          "text": "画面由 SVG 绘制，车轮、曲柄、骑手和背景使用 CSS 动画，按钮通过 JavaScript 控制动画的暂停和速度。动画以插画表现为主，并非精确的自行车机械运动模拟。"
        },
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 19,
          "endLine": 19,
          "text": "## 来源与授权"
        },
        {
          "path": "projects/007-pelican-bicycle/README.md",
          "startLine": 21,
          "endLine": 21,
          "text": "本项目为本库原创实践，没有外部上游项目或素材。项目文件适用本仓库的授权约定。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 116,
        "endLine": 132,
        "text": "    {\n      \"id\": \"007\",\n      \"slug\": \"pelican-bicycle\",\n      \"name\": \"鹈鹕的单车日和\",\n      \"summary\": \"体验一只在海边骑车的鹈鹕。SVG 画角色与景物，CSS 做轮转和微动，可暂停、调速，支持减少动态效果设置。适合参考轻量网页动画的实现。\",\n      \"source\": \"https://github.com/yydshly/1025_codex_project\",\n      \"sourceName\": \"本库原创（无上游源库）\",\n      \"status\": \"building\",\n      \"tags\": [\n        \"网页动画\",\n        \"插画\",\n        \"交互\"\n      ],\n      \"cover\": \"\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/007-pelican-bicycle/\",\n      \"createdAt\": \"2026-10-27\"\n    },"
      }
    },
    {
      "id": "008",
      "slug": "ultraman-card-draw",
      "name": "奥特曼卡片抽卡器",
      "summary": "从 874 条人物与形态资料中抽卡，结合招式光效与设备讲解做亲子探索。研究记录了人物素材、演出配置和卡片舞台如何分层。",
      "source": "https://github.com/yydshly/1025_codex_project",
      "status": "building",
      "tags": [
        "卡片收藏",
        "抽卡",
        "亲子"
      ],
      "createdAt": "2026-10-27",
      "readmePath": "projects/008-ultraman-card-draw/README.md",
      "readmeSha256": "f29c5ad3b9f0bc1947e0105972e08f9fd5403469cba89266418ec1493fa522e7",
      "readmeText": "# 008 · 星光卡片基地\n\n一个面向亲子探索的人物图鉴、随机卡片展示与网页演出实践。[返回总索引](../../README.md#项目索引) · [研究总览网页](app/guide.html) · [抽卡体验](app/index.html) · [实现笔记](research/notes.md)\n\n## 研究与效果总览\n\n![星光卡片基地：从人物图鉴到孩子的随机探索剧场](assets/images/project-overview-v1.png)\n\n项目的目标是把已收集的人物形象、简介与来源变成可随机演示的亲子素材，让孩子看形象、听介绍、继续探索。整体分为人物素材库、人物演出配置、卡片展示舞台和随机演示体验；家长无需先逐张录入才能使用人物图鉴。\n\n当前已有 874 条人物与形态资料、4 位精选角色的代表招式配置、2 位角色的透明前景，以及搜索、随机抽取、大图、页面光效和设备语音讲解。后续可在这套基础上增加标志姿态、互动动作和招式短动画，并丰富分层、光线粒子、镜头与音画节奏，再接入同一随机展示流程。动作素材、播放控制和具体渲染仍需逐项制作与接入，图中的后续扩展尚未实现。\n\n图中人物和卡片是基于现有页面与风格化人物素材生成的效果示意；资料条目包含不同形态，不代表完整卡游实体卡目录。图片使用内置 imagegen 工具制作，人物权利归相应权利人；[生成提示词](research/overview-image-prompt-2026-10-27.txt)与[制作记录](research/overview-image-2026-10-27.md)随项目保存。\n\n## 使用方法\n\n正式网页：[随机抽卡体验](https://yydshly.github.io/1025_codex_project/008-ultraman-card-draw/) · [研究与效果总览](https://yydshly.github.io/1025_codex_project/008-ultraman-card-draw/guide.html)。部署范围、实测与边界见[发布记录](research/deployment.md)。\n\n直接在浏览器中打开 [app/index.html](app/index.html)，无需安装依赖。人物数据随项目保存，部分人物图片和资料链接需联网。也可以从项目目录启动本地静态服务器：`python -m http.server 8000 --directory app`，然后访问 `http://localhost:8000/`。\n\n首页点击“抽一张卡”可随机展示人物图鉴中的角色及其介绍；也可切换抽取范围为“我的收藏”或两者合并。人物图鉴现有 874 条人物和形态，可按名称和类别筛选，点击卡片查看介绍及资料来源。已收录人物可直接使用，无需录入；这个目录是人物主题卡，并非完整的卡游实体卡编号或卡面图鉴。\n\n抽中人物后，可以点击卡片上的按钮触发星光或招式光效，并点击“听人物讲解”由设备朗读介绍；再次点击可停止。朗读使用设备的合成语音，是原创讲解，并非角色原声或原作台词；设备不支持时仍可阅读文字。初代、迪迦、赛罗和泽塔配有已核对的代表性招式，初代和迪迦还使用原创风格化人物前景；其他人物与自己的收藏使用通用舞台效果。动作光效是页面演绎，不是角色实际视频。系统开启减少动态效果时动画会减弱。\n\n透明人物前景加载成功前继续显示原人物图，成功后再切换；加载失败则保留原图或已有回退，避免慢网时卡面空白。\n\n人物卡上可直接“再抽一张”或“查看大图”。连续抽取在候选人物超过一位时避开上一条；从图鉴选择人物会直接定位到卡片。大图支持关闭按钮和 Escape 键，切卡、打开大图或离开页面时会停止语音。\n\n下方“我的卡片收藏”仍可按名字、卡号、版本或类别筛选。点“添加卡片”填写角色名称、类别、卡号、版本和人物介绍，也可上传照片。录入名称与图鉴人物完全一致时，空白介绍会预填该角色的简介，可自行修改。重复角色、不同版本和重复收藏可分别录入。点击收藏卡片可查看，卡片下方可编辑或删除。\n\n个人收藏中的初始卡片为**角色示例**，不代表家里已经拥有这些实体卡片，也不包含虚构的卡号和版本。人物图鉴与个人收藏分开保存，升级时不会覆盖已有收藏。人物资料来源见每张主题卡的“资料来源”；人物形象包含圆谷图鉴或国际对战卡牌图片、万代手办图片与第三方图鉴图片。在线图片需联网加载，版权属于相应权利人；未加载成功时显示提示，其中八位角色可以回退到本地 AI 风格化插画。\n\n## 保存与备份\n\n收藏及图片只保存在当前浏览器的本地存储，不会自动同步到其他浏览器或设备。清除浏览器数据、换设备或使用不同的本地地址可能造成数据不可见或丢失。建议在录入后定期点击“导出备份”，妥善保存 JSON 文件。导入先校验格式并要求确认；确认后会**替换**当前全部收藏，不会合并，建议先导出当前数据。\n\n浏览器存储空间有限，上传图片会先压缩。空间不足或保存失败时页面会提示，原有收藏不应被更改。私密照片和备份文件请自行妥善保管。\n\n## 实现和来源\n\n使用原生 HTML、CSS 与 JavaScript；人物数据随项目保存，部分外部图片和资料链接需要联网。`app/profiles.js` 按人物 ID 存放精选角色的舞台颜色、招式、讲解和可选前景；没有配置的角色自动使用通用舞台，人物数据和个人收藏仍分别保存。人物介绍为简短概述，不是完整百科，也没有声称为真实收藏或全量卡游实体卡。项目为本库原创实践，非官方产品；奥特曼及相关角色属于其权利人。网页已通过本库 GitHub Pages 发布。\n",
      "passages": [
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 008 · 星光卡片基地"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "一个面向亲子探索的人物图鉴、随机卡片展示与网页演出实践。[返回总索引](../../README.md#项目索引) · [研究总览网页](app/guide.html) · [抽卡体验](app/index.html) · [实现笔记](research/notes.md)"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "## 研究与效果总览"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 7,
          "endLine": 7,
          "text": "![星光卡片基地：从人物图鉴到孩子的随机探索剧场](assets/images/project-overview-v1.png)"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "项目的目标是把已收集的人物形象、简介与来源变成可随机演示的亲子素材，让孩子看形象、听介绍、继续探索。整体分为人物素材库、人物演出配置、卡片展示舞台和随机演示体验；家长无需先逐张录入才能使用人物图鉴。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 11,
          "endLine": 11,
          "text": "当前已有 874 条人物与形态资料、4 位精选角色的代表招式配置、2 位角色的透明前景，以及搜索、随机抽取、大图、页面光效和设备语音讲解。后续可在这套基础上增加标志姿态、互动动作和招式短动画，并丰富分层、光线粒子、镜头与音画节奏，再接入同一随机展示流程。动作素材、播放控制和具体渲染仍需逐项制作与接入，图中的后续扩展尚未实现。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 13,
          "endLine": 13,
          "text": "图中人物和卡片是基于现有页面与风格化人物素材生成的效果示意；资料条目包含不同形态，不代表完整卡游实体卡目录。图片使用内置 imagegen 工具制作，人物权利归相应权利人；[生成提示词](research/overview-image-prompt-2026-10-27.txt)与[制作记录](research/overview-image-2026-10-27.md)随项目保存。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 15,
          "endLine": 15,
          "text": "## 使用方法"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 17,
          "endLine": 17,
          "text": "正式网页：[随机抽卡体验](https://yydshly.github.io/1025_codex_project/008-ultraman-card-draw/) · [研究与效果总览](https://yydshly.github.io/1025_codex_project/008-ultraman-card-draw/guide.html)。部署范围、实测与边界见[发布记录](research/deployment.md)。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 19,
          "endLine": 19,
          "text": "直接在浏览器中打开 [app/index.html](app/index.html)，无需安装依赖。人物数据随项目保存，部分人物图片和资料链接需联网。也可以从项目目录启动本地静态服务器：`python -m http.server 8000 --directory app`，然后访问 `http://localhost:8000/`。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 21,
          "endLine": 21,
          "text": "首页点击“抽一张卡”可随机展示人物图鉴中的角色及其介绍；也可切换抽取范围为“我的收藏”或两者合并。人物图鉴现有 874 条人物和形态，可按名称和类别筛选，点击卡片查看介绍及资料来源。已收录人物可直接使用，无需录入；这个目录是人物主题卡，并非完整的卡游实体卡编号或卡面图鉴。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 23,
          "endLine": 23,
          "text": "抽中人物后，可以点击卡片上的按钮触发星光或招式光效，并点击“听人物讲解”由设备朗读介绍；再次点击可停止。朗读使用设备的合成语音，是原创讲解，并非角色原声或原作台词；设备不支持时仍可阅读文字。初代、迪迦、赛罗和泽塔配有已核对的代表性招式，初代和迪迦还使用原创风格化人物前景；其他人物与自己的收藏使用通用舞台效果。动作光效是页面演绎，不是角色实际视频。系统开启减少动态效果时动画会减弱。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 25,
          "endLine": 25,
          "text": "透明人物前景加载成功前继续显示原人物图，成功后再切换；加载失败则保留原图或已有回退，避免慢网时卡面空白。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 27,
          "endLine": 27,
          "text": "人物卡上可直接“再抽一张”或“查看大图”。连续抽取在候选人物超过一位时避开上一条；从图鉴选择人物会直接定位到卡片。大图支持关闭按钮和 Escape 键，切卡、打开大图或离开页面时会停止语音。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 29,
          "endLine": 29,
          "text": "下方“我的卡片收藏”仍可按名字、卡号、版本或类别筛选。点“添加卡片”填写角色名称、类别、卡号、版本和人物介绍，也可上传照片。录入名称与图鉴人物完全一致时，空白介绍会预填该角色的简介，可自行修改。重复角色、不同版本和重复收藏可分别录入。点击收藏卡片可查看，卡片下方可编辑或删除。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 31,
          "endLine": 31,
          "text": "个人收藏中的初始卡片为**角色示例**，不代表家里已经拥有这些实体卡片，也不包含虚构的卡号和版本。人物图鉴与个人收藏分开保存，升级时不会覆盖已有收藏。人物资料来源见每张主题卡的“资料来源”；人物形象包含圆谷图鉴或国际对战卡牌图片、万代手办图片与第三方图鉴图片。在线图片需联网加载，版权属于相应权利人；未加载成功时显示提示，其中八位角色可以回退到本地 AI 风格化插画。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 33,
          "endLine": 33,
          "text": "## 保存与备份"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "收藏及图片只保存在当前浏览器的本地存储，不会自动同步到其他浏览器或设备。清除浏览器数据、换设备或使用不同的本地地址可能造成数据不可见或丢失。建议在录入后定期点击“导出备份”，妥善保存 JSON 文件。导入先校验格式并要求确认；确认后会**替换**当前全部收藏，不会合并，建议先导出当前数据。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 37,
          "endLine": 37,
          "text": "浏览器存储空间有限，上传图片会先压缩。空间不足或保存失败时页面会提示，原有收藏不应被更改。私密照片和备份文件请自行妥善保管。"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 39,
          "endLine": 39,
          "text": "## 实现和来源"
        },
        {
          "path": "projects/008-ultraman-card-draw/README.md",
          "startLine": 41,
          "endLine": 41,
          "text": "使用原生 HTML、CSS 与 JavaScript；人物数据随项目保存，部分外部图片和资料链接需要联网。`app/profiles.js` 按人物 ID 存放精选角色的舞台颜色、招式、讲解和可选前景；没有配置的角色自动使用通用舞台，人物数据和个人收藏仍分别保存。人物介绍为简短概述，不是完整百科，也没有声称为真实收藏或全量卡游实体卡。项目为本库原创实践，非官方产品；奥特曼及相关角色属于其权利人。网页已通过本库 GitHub Pages 发布。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 133,
        "endLine": 149,
        "text": "    {\n      \"id\": \"008\",\n      \"slug\": \"ultraman-card-draw\",\n      \"name\": \"奥特曼卡片抽卡器\",\n      \"summary\": \"从 874 条人物与形态资料中抽卡，结合招式光效与设备讲解做亲子探索。研究记录了人物素材、演出配置和卡片舞台如何分层。\",\n      \"source\": \"https://github.com/yydshly/1025_codex_project\",\n      \"sourceName\": \"本库原创（无上游源库）\",\n      \"status\": \"building\",\n      \"tags\": [\n        \"卡片收藏\",\n        \"抽卡\",\n        \"亲子\"\n      ],\n      \"cover\": \"assets/images/project-overview-v1.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/008-ultraman-card-draw/\",\n      \"createdAt\": \"2026-10-27\"\n    },"
      }
    },
    {
      "id": "009",
      "slug": "knowledge-processing-atlas",
      "name": "资料理解与检索研究",
      "summary": "比较 26 个资料处理工具或方案，拆解文档解析、分块、检索与时间关系。可查看同题样例和选型协议，研究目标是能带出处读资料和跨日回顾。",
      "source": "https://github.com/HKUDS/DeepTutor",
      "status": "researching",
      "tags": [
        "文档解析",
        "知识检索",
        "RAG",
        "时间关系",
        "研究对比"
      ],
      "createdAt": "2026-10-28",
      "readmePath": "projects/009-knowledge-processing-atlas/README.md",
      "readmeSha256": "92388f9403687d714a6a6250015baa749f95ee3469b0083d97e82bdc2a1a9239",
      "readmeText": "# 009 · 资料理解与检索研究\n\n从 DeepTutor 与 NotebookLM 的资料学习场景出发，判断额外建库和维护是否值得。对照26个研究对象，拆解解析、分块、表示、检索、关系与时间的原理；用同题样例和实验协议，规划可追溯阅读、跨日回顾、经验复用、自适应复习和专题研究。\n\n[返回总索引](../../README.md#项目索引) · [打开研究网页](app/index.html) · [研究笔记](research/notes.md)\n\n| 项目 | 内容 |\n| --- | --- |\n| 编号 | `009` |\n| 收录日期 | 2026-10-28 |\n| 研究范围 | DeepTutor、NotebookLM 对照，以及 19 个重点开源项目/模型和 5 项框架、基线与评测延伸工具 |\n| 上游版本 | 以 2026-10-28 查阅的公开主页和文档为依据；未锁定上游提交或统一版本，后续应重新核对 |\n| 研究状态 | 桌面研究与展示；后续演示待实施 |\n| 在线演示 | [正式研究网页](https://yydshly.github.io/1025_codex_project/009-knowledge-processing-atlas/) |\n\n## 本地查看\n\n用现代浏览器打开 [app/index.html](app/index.html)。该页面用于展示本项目的研究内容；查看网页不需要安装上游研究对象或下载模型。\n\n## 研究问题\n\n1. 文档中的文字、表格、版面、来源和时间，如何转换为可供检索的内容？\n2. 关键词、向量、章节树和知识图谱分别解决什么问题，又会丢失什么信息？\n3. 模型、数据库、解析器、完整应用分别承担什么职责？\n4. 怎样用虚构样本和可追溯证据评估结果，避免把演示当作结论？\n\n## 当前认识\n\n- 索引可以方便查找原始资料，并不等于训练模型。小型资料集也可能适合直接阅读或全文搜索，RAG 不是唯一选择。\n- 解析、召回和生成是不同环节。资料未被正确解析或检索到，模型就可能缺少关键依据；检索到正确资料也不保证生成结论正确。\n- 业务界面与展示不是知识处理本身，但业务目标会影响系统需要保留的结构、时间和引用位置。\n- DeepTutor 与 NotebookLM 在资料问答、练习和内容生成方面重叠。前者是可自行部署和扩展的学习工作台；后者是 Google 托管的独立产品，不是开源库。Google 于 2026 年将 NotebookLM 更名为 Gemini Notebook。\n- 不同项目处在不同层次，不能只按 Star、功能数量或技术名称比较优劣。研究对比与局限见[研究笔记](research/notes.md)。\n\n## 项目对比与具体价值\n\n| 方向 | 研究对象 | 对我们最直接的价值 |\n| --- | --- | --- |\n| 文档解析 | MinerU、Docling、PaddleOCR、olmOCR | 检查扫描件、中文文字、阅读顺序、表格和页面出处能否保留。 |\n| 表示与检索 | BGE-M3、ColBERT、Qdrant、OpenSearch、PageIndex | 比较语义、关键词、章节定位和筛选，确定哪些资料需要建立什么索引。 |\n| 关系与时间 | Graphiti、Microsoft GraphRAG | 分析原始证据、事件前后变化及跨文档主题，评估额外建图成本。 |\n| 完整系统 | RAGFlow；另有研究起点 DeepTutor、托管产品对照 NotebookLM | 判断完整产品的配置和维护成本是否换来所需收益。 |\n| 教学建模 | OATutor、pyKT、pyBKT、Tutor MCP | 了解基于答题历史的技能估计与复习安排，区分模型预测和实际教学效果。 |\n| 研究与评估 | STORM、OpenResearcher、Ragas | 研究多视角提问、研究轨迹训练，以及回答与来源的核验。 |\n| 框架与基线 | LlamaIndex、LightRAG、SQLite FTS5、Pyserini、OmniDocBench | 对照模块编排、图与向量、全文基线，以及检索/解析评测方法。 |\n\n解析器、检索模型、数据库和评估框架位于不同环节，不能简单按功能或 Star 排名。详细的原理、限制及来源见[项目对比](research/notes.md#项目对比同一链路中的不同角色)。\n\n## 可扩展能力与取舍\n\n- 论文/教材：定位表格、解释概念、返回原页，先与直接阅读比较。\n- 跨日记录：找回前后原话、梳理观点与状态变化；仅用虚构记录开展测试。\n- 经验复用：检索成功案例，人工审核后沉淀为知识卡、操作步骤或提示词；自动转成工具仍需额外实现。\n- 学习与研究：将技能掌握估计与讲解生成分工，整理多视角、可追溯的专题材料。\n\n网页的统一目录覆盖26个对象，均可搜索、按角色筛选、直接定位和展开原理；可选2–3项并排比较职责、机制、价值、依赖和验证任务。19项为重点研究，另7项为5种延伸工具及2种应用对照，角色不同，不作为同类强弱榜。\n\n底层库可借鉴的核心价值是：结构与来源的保留、可替换的表示/检索方法、关系与时间表达，以及可复查的评估。我们可进一步沉淀统一来源字段、模块接口、可重建索引与可审查生成记录，为多个业务界面复用。业务中的掌握估计、选题与反馈同样需要独立设计，不能只视作展示。\n\n## 本轮补全\n\n- 5个算法专题：解析模式、结构分块、关键词/稠密/词元检索、融合与重排、关系与时间。每项包含过程、失败例、研究问题和官方依据；比较精确到引擎/模式/版本，不按库名固定划分算法。\n- 可点击文字路线与场景选型表：说明同层替换、跨层组合和可跳过的环节；保留第三版总览原图。\n- [同题虚构材料和人工答案](app/data/scenario-v1.json)：表格、同义表达、历史状态、乱序导入、对象混淆和无答案共6题；没有工具运行结果，也不是已经生成/解析的PDF。\n- [实验协议](research/experiment-protocol.md)和[CSV空记录模板](app/data/experiment-record-template.csv.txt)：固定条件、改变项、验收依据，以及首次导入、增量更新、查询和维护成本分别记录。\n\n## 后续演示规划\n\n计划先用虚构、不含私人内容的材料，对照简单基线，分别检查文档解析、中文检索和时间关系。每次明确固定条件与改变项；完成逐题输出、来源和失败记录后再决定是否扩展。每一步只在真实运行后记录版本、模型、费用与结果。详细输入、对照方式与验收条件见[实验协议](research/experiment-protocol.md)。\n\n**目前没有安装或运行这些上游项目，也没有下载模型、实测性能或声称取得演示结果。** 研究阶段不连接、不导入和不修改 ReflectFlow 正式库、编辑缓存或任何其他私人资料。后续实施前应明确测试环境、模型来源和数据处理方式，遵守工作区保护约定。\n\n## 图片与来源\n\n![资料理解与检索研究总览](assets/images/research-overview-v3.png)\n\n图：本研究整理的总览示意，汇集目标应用、底层解析与检索能力、价值边界及后续规划；不是上游截图，也不代表工具已安装、运行或实测。[打开完整图片](assets/images/research-overview-v3.png)。\n\n网页中的示意图和例子用于解释概念，不是工具的实测结果；以后如添加上游截图，应核对授权，并注明来源、版本及其为上游示例还是个人复现。\n\n来源、上游许可入口和项目状态见[研究笔记](research/notes.md#来源与许可核对)。本项目不包含上述项目的代码或模型，若今后引入，需分别核对相应版本的代码、模型权重和素材许可。\n\n## 发布核验\n\n2026-10-28网页已上线。见[发布与验收记录](research/deployment.md)。网页发布不代表底层算法演示已实施。\n\n同日完成研究补全和第二轮发布；26项统一目录、并排对比、同题样例及下载均已核对。见[本轮发布验收](research/deployment-revision2.md)。\n",
      "passages": [
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 009 · 资料理解与检索研究"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "从 DeepTutor 与 NotebookLM 的资料学习场景出发，判断额外建库和维护是否值得。对照26个研究对象，拆解解析、分块、表示、检索、关系与时间的原理；用同题样例和实验协议，规划可追溯阅读、跨日回顾、经验复用、自适应复习和专题研究。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "[返回总索引](../../README.md#项目索引) · [打开研究网页](app/index.html) · [研究笔记](research/notes.md)"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 7,
          "endLine": 14,
          "text": "| 项目 | 内容 |\n| --- | --- |\n| 编号 | `009` |\n| 收录日期 | 2026-10-28 |\n| 研究范围 | DeepTutor、NotebookLM 对照，以及 19 个重点开源项目/模型和 5 项框架、基线与评测延伸工具 |\n| 上游版本 | 以 2026-10-28 查阅的公开主页和文档为依据；未锁定上游提交或统一版本，后续应重新核对 |\n| 研究状态 | 桌面研究与展示；后续演示待实施 |\n| 在线演示 | [正式研究网页](https://yydshly.github.io/1025_codex_project/009-knowledge-processing-atlas/) |"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 16,
          "endLine": 16,
          "text": "## 本地查看"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 18,
          "endLine": 18,
          "text": "用现代浏览器打开 [app/index.html](app/index.html)。该页面用于展示本项目的研究内容；查看网页不需要安装上游研究对象或下载模型。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 20,
          "endLine": 20,
          "text": "## 研究问题"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 22,
          "endLine": 25,
          "text": "1. 文档中的文字、表格、版面、来源和时间，如何转换为可供检索的内容？\n2. 关键词、向量、章节树和知识图谱分别解决什么问题，又会丢失什么信息？\n3. 模型、数据库、解析器、完整应用分别承担什么职责？\n4. 怎样用虚构样本和可追溯证据评估结果，避免把演示当作结论？"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 27,
          "endLine": 27,
          "text": "## 当前认识"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 29,
          "endLine": 33,
          "text": "- 索引可以方便查找原始资料，并不等于训练模型。小型资料集也可能适合直接阅读或全文搜索，RAG 不是唯一选择。\n- 解析、召回和生成是不同环节。资料未被正确解析或检索到，模型就可能缺少关键依据；检索到正确资料也不保证生成结论正确。\n- 业务界面与展示不是知识处理本身，但业务目标会影响系统需要保留的结构、时间和引用位置。\n- DeepTutor 与 NotebookLM 在资料问答、练习和内容生成方面重叠。前者是可自行部署和扩展的学习工作台；后者是 Google 托管的独立产品，不是开源库。Google 于 2026 年将 NotebookLM 更名为 Gemini Notebook。\n- 不同项目处在不同层次，不能只按 Star、功能数量或技术名称比较优劣。研究对比与局限见[研究笔记](research/notes.md)。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "## 项目对比与具体价值"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 37,
          "endLine": 44,
          "text": "| 方向 | 研究对象 | 对我们最直接的价值 |\n| --- | --- | --- |\n| 文档解析 | MinerU、Docling、PaddleOCR、olmOCR | 检查扫描件、中文文字、阅读顺序、表格和页面出处能否保留。 |\n| 表示与检索 | BGE-M3、ColBERT、Qdrant、OpenSearch、PageIndex | 比较语义、关键词、章节定位和筛选，确定哪些资料需要建立什么索引。 |\n| 关系与时间 | Graphiti、Microsoft GraphRAG | 分析原始证据、事件前后变化及跨文档主题，评估额外建图成本。 |\n| 完整系统 | RAGFlow；另有研究起点 DeepTutor、托管产品对照 NotebookLM | 判断完整产品的配置和维护成本是否换来所需收益。 |\n| 教学建模 | OATutor、pyKT、pyBKT、Tutor MCP | 了解基于答题历史的技能估计与复习安排，区分模型预测和实际教学效果。 |\n| 研究与评估 | STORM、OpenResearcher、Ragas | 研究多视角提问、研究轨迹训练，以及回答与来源的核验。 |"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 45,
          "endLine": 45,
          "text": "| 框架与基线 | LlamaIndex、LightRAG、SQLite FTS5、Pyserini、OmniDocBench | 对照模块编排、图与向量、全文基线，以及检索/解析评测方法。 |"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 47,
          "endLine": 47,
          "text": "解析器、检索模型、数据库和评估框架位于不同环节，不能简单按功能或 Star 排名。详细的原理、限制及来源见[项目对比](research/notes.md#项目对比同一链路中的不同角色)。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 49,
          "endLine": 49,
          "text": "## 可扩展能力与取舍"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 51,
          "endLine": 54,
          "text": "- 论文/教材：定位表格、解释概念、返回原页，先与直接阅读比较。\n- 跨日记录：找回前后原话、梳理观点与状态变化；仅用虚构记录开展测试。\n- 经验复用：检索成功案例，人工审核后沉淀为知识卡、操作步骤或提示词；自动转成工具仍需额外实现。\n- 学习与研究：将技能掌握估计与讲解生成分工，整理多视角、可追溯的专题材料。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 56,
          "endLine": 56,
          "text": "网页的统一目录覆盖26个对象，均可搜索、按角色筛选、直接定位和展开原理；可选2–3项并排比较职责、机制、价值、依赖和验证任务。19项为重点研究，另7项为5种延伸工具及2种应用对照，角色不同，不作为同类强弱榜。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 58,
          "endLine": 58,
          "text": "底层库可借鉴的核心价值是：结构与来源的保留、可替换的表示/检索方法、关系与时间表达，以及可复查的评估。我们可进一步沉淀统一来源字段、模块接口、可重建索引与可审查生成记录，为多个业务界面复用。业务中的掌握估计、选题与反馈同样需要独立设计，不能只视作展示。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 60,
          "endLine": 60,
          "text": "## 本轮补全"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 62,
          "endLine": 65,
          "text": "- 5个算法专题：解析模式、结构分块、关键词/稠密/词元检索、融合与重排、关系与时间。每项包含过程、失败例、研究问题和官方依据；比较精确到引擎/模式/版本，不按库名固定划分算法。\n- 可点击文字路线与场景选型表：说明同层替换、跨层组合和可跳过的环节；保留第三版总览原图。\n- [同题虚构材料和人工答案](app/data/scenario-v1.json)：表格、同义表达、历史状态、乱序导入、对象混淆和无答案共6题；没有工具运行结果，也不是已经生成/解析的PDF。\n- [实验协议](research/experiment-protocol.md)和[CSV空记录模板](app/data/experiment-record-template.csv.txt)：固定条件、改变项、验收依据，以及首次导入、增量更新、查询和维护成本分别记录。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 67,
          "endLine": 67,
          "text": "## 后续演示规划"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 69,
          "endLine": 69,
          "text": "计划先用虚构、不含私人内容的材料，对照简单基线，分别检查文档解析、中文检索和时间关系。每次明确固定条件与改变项；完成逐题输出、来源和失败记录后再决定是否扩展。每一步只在真实运行后记录版本、模型、费用与结果。详细输入、对照方式与验收条件见[实验协议](research/experiment-protocol.md)。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 71,
          "endLine": 71,
          "text": "**目前没有安装或运行这些上游项目，也没有下载模型、实测性能或声称取得演示结果。** 研究阶段不连接、不导入和不修改 ReflectFlow 正式库、编辑缓存或任何其他私人资料。后续实施前应明确测试环境、模型来源和数据处理方式，遵守工作区保护约定。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 73,
          "endLine": 73,
          "text": "## 图片与来源"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 75,
          "endLine": 75,
          "text": "![资料理解与检索研究总览](assets/images/research-overview-v3.png)"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 77,
          "endLine": 77,
          "text": "图：本研究整理的总览示意，汇集目标应用、底层解析与检索能力、价值边界及后续规划；不是上游截图，也不代表工具已安装、运行或实测。[打开完整图片](assets/images/research-overview-v3.png)。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 79,
          "endLine": 79,
          "text": "网页中的示意图和例子用于解释概念，不是工具的实测结果；以后如添加上游截图，应核对授权，并注明来源、版本及其为上游示例还是个人复现。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 81,
          "endLine": 81,
          "text": "来源、上游许可入口和项目状态见[研究笔记](research/notes.md#来源与许可核对)。本项目不包含上述项目的代码或模型，若今后引入，需分别核对相应版本的代码、模型权重和素材许可。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 83,
          "endLine": 83,
          "text": "## 发布核验"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 85,
          "endLine": 85,
          "text": "2026-10-28网页已上线。见[发布与验收记录](research/deployment.md)。网页发布不代表底层算法演示已实施。"
        },
        {
          "path": "projects/009-knowledge-processing-atlas/README.md",
          "startLine": 87,
          "endLine": 87,
          "text": "同日完成研究补全和第二轮发布；26项统一目录、并排对比、同题样例及下载均已核对。见[本轮发布验收](research/deployment-revision2.md)。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 150,
        "endLine": 167,
        "text": "    {\n      \"id\": \"009\",\n      \"slug\": \"knowledge-processing-atlas\",\n      \"name\": \"资料理解与检索研究\",\n      \"summary\": \"比较 26 个资料处理工具或方案，拆解文档解析、分块、检索与时间关系。可查看同题样例和选型协议，研究目标是能带出处读资料和跨日回顾。\",\n      \"source\": \"https://github.com/HKUDS/DeepTutor\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"文档解析\",\n        \"知识检索\",\n        \"RAG\",\n        \"时间关系\",\n        \"研究对比\"\n      ],\n      \"cover\": \"assets/images/research-overview-v3.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/009-knowledge-processing-atlas/\",\n      \"createdAt\": \"2026-10-28\"\n    },"
      }
    },
    {
      "id": "010",
      "slug": "agent-skills-engineering-lab",
      "name": "Agent Skills · 全景理解与实践",
      "summary": "把上游的 25 项工程 Skills 按需求、计划、实现、验证、审查和交付等环节整理成地图。可对照应用场景、产物和检查项，并查看本库的研究回查实测。",
      "source": "https://github.com/addyosmani/agent-skills",
      "status": "researching",
      "tags": [
        "Agent Skills",
        "AI编程",
        "工程流程",
        "实验验证"
      ],
      "createdAt": "2026-10-28",
      "readmePath": "projects/010-agent-skills-engineering-lab/README.md",
      "readmeSha256": "8a7517c8106d0c935c78ee663a18e3c930311ec5a0ac64ab2d92e7d024f7c665",
      "readmeText": "# 010 · Agent Skills · 全景理解与实践\n\n[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) 提供 25 份工程 Skill，把需求、规格、规划、实现、验证与交付中的经验写成 AI 助手可以读取和遵循的工作规程。它的价值在于明确每类任务该如何推进、守住什么约束、留下什么产物，以及用什么证据判断完成；实际行动仍由助手结合项目和可用工具执行。\n\n本项目把全部 25 项能力整理为七类工作：选择方法、明确目标与底线、准备执行、实现功能、验证纠错、改善质量、交付维护。通过一张入口总图，逐项解释做什么、什么时候用、怎么做、交付与检查、如何配合，并关联具体场景和固定版原文。\n\n对我们的意义是建立一份按需查阅的工程方法库：以后从真实需求出发，选择相关 Skill 实际使用、核对效果，再分析其设计。学习重点是如何用步骤、约束、产物和检查控制落地，并把有效做法沉淀为自己的能力。25 项介绍与原理解读已覆盖；逐项完整实测尚未完成，固定源码、教学示例、有限实验与自建 Skill 的证据分别保留。\n\n已上线：[统一入口](https://yydshly.github.io/1025_codex_project/010-agent-skills-engineering-lab/) · [完整汇总长图](https://yydshly.github.io/1025_codex_project/010-agent-skills-engineering-lab/app/overview-poster.html)。发布范围和线上验证见[发布记录](research/deployment.md)。\n\n[入口总图：25个Skill与使用场景](app/overview.html) · [完整汇总长图](app/overview-poster.html) · [25项场景详解](app/scenarios.html) · [实现原理导览](app/index.html) · [真实需求实践](app/real-case.html) · [使用研究回查](app/recall.html) · [创建研究回查Skill实录](app/scenarios.html?lesson=1#build-skill) · [完整文字版](research/learning-guide.md) · [返回总索引](../../README.md#项目索引)\n\n| 项目 | 内容 |\n| --- | --- |\n| 上游版本 | [`aeac41d4d005999432bb7312f7ff06383a91d59d`](https://github.com/addyosmani/agent-skills/tree/aeac41d4d005999432bb7312f7ff06383a91d59d)；2026-10-28 核对 |\n| 上游许可 | MIT；原始版权与许可见[本地副本](research/upstream/LICENSE) |\n| 已获取 | 25 个 `SKILL.md`、7 个技能内支持文件、7 份共享参考资料及许可证，共 40 文件 |\n| 状态 | 25 项原文解读与教学示例、3 项有限实验；新增真实研究回查工具与六步实践导览，采用与未触发能力分别记录 |\n| 安装状态 | 上游材料只读研究，未安装上游插件；本项目自建 research-recall 技能的安装与验证另见下方记录 |\n\n## 统一查阅入口：25项能力与使用地图\n\n[可点击总图](app/overview.html)按七类工作展示全部25项。每项统一回答五个问题：做什么、什么时候用、怎么做（含关键判断与约束）、交付什么与怎样检查、怎么配合。图中先看名称与用途，点击后查看完整说明，并可继续打开具体场景、实现原理与固定版原文。\n\n[完整汇总长图](app/overview-poster.html)将25项与五问放在同一张图中，可按原尺寸放大阅读；保留 [PNG](assets/images/skills-field-guide.png) 与可搜索文字的 [SVG](assets/images/skills-field-guide.svg)。内容来自本项目固定版本原文和场景说明，使用项目已有的字体与色彩，场景保持条件式表述。生成命令为 `node scripts/build-overview.mjs`；检查命令加 `--check`。PNG通过本地浏览器从同一SVG导出，无新增第三方依赖。生成SVG后需同步重新导出PNG。\n\n当前学习停留在全量理解和查阅；后续遇到真实需求，再选相关Skill实际使用、检查效果和分析实现。讲解覆盖25项不表示25项已经逐一完整实测。内容、交互与图片检查见[总图验证记录](research/overview-verification.json)。\n\n[![25项Skill能力、使用场景与协作引导图](assets/images/skills-field-guide.png)](app/overview.html)\n\n## 需要更多细节：25项使用场景全景\n\n[全量场景页](app/scenarios.html)承接总图的逐项阅读：以七类工作组织全部25项，每项提供触发条件、近期项目中的条件式例子、可以直接提出的任务、应得产物、验收方式、不适用情况、落地风险与技能衔接。支持展开全部案例和按技能直接定位。\n\n学习顺序：**全部使用场景 → 单项实现原理 → 真实需求实践**。场景说明已覆盖25项，原文解读已覆盖25项；25项逐一完整实测尚未完成。研究回查案例采用部分相关方法，不能作为全部能力的独立实测证明。\n\n场景结合现有项目构造，使用“当/如果/准备”等条件表达；不声称用户已提出这些新增需求、项目已出现这些故障，或已执行例子中的改动。来源与覆盖检查见[场景验证记录](research/scenarios-verification.md)。\n\n## 从真实需求学习落地控制\n\n本案例来自本聊天最初的真实问题：“这个库我们以前研究过吗？”用户选择以“跨项目检索、查看出处、保存判断”开展实际演示。现有 10 个研究项目的登记信息和 README 被保存为可核对的快照，形成一个可用的[研究回查入口](app/recall.html)。\n\n- 按仓库链接、库名、关键词与研究阶段查询；结果带原文段落、行号、来源哈希。\n- 展示当前总库快照的研究记录；未命中只表示此快照没找到，登记为已总结不代表上游已实测。\n- 个人判断存于当前浏览器，可生成或下载 JSON 备份、粘贴备份合并；格式错误、未知版本和冲突拒绝写入。\n- 草稿切换有保护；保存前检查其他页面是否已更新记录。它不是多人协作服务，没有跨设备同步。\n\n[真实需求实践页](app/real-case.html)按六步组织需求、约束、任务、实现、修复和交付；每步关联 Skill、产物和回顾问题。25 项覆盖表区分采用的方法与未触发能力，不把完整覆盖讲解当成全部技能的实测证明。\n\n已发生的行为失败和修复、浏览器使用流程与验证边界统一记录在[验收记录](research/real-case/verification.md)。核心逻辑有 18 项行为测试；此前三个有限实验继续保留，均无无技能独立对照，未量化技能收益。\n\n使用笔记功能请通过 HTTP 打开：在本子项目目录运行 `node scripts/serve.mjs`，访问 \u003chttp://127.0.0.1:8010/app/real-case.html>。从实践页进入回查工具。浏览器的本地保存跟随访问地址；需要保留记录时导出备份。直接打开文件的存储行为未验收。\n\n数据输入限总库登记和各项目 README，不扫描私人资料，也不连接 ReflectFlow。快照通过 `node scripts/build-recall.mjs` 更新；其他项目更新说明后需要重建。这个早期网页案例没有安装全局技能或增加模型服务；后续自建 Skill 见下面的独立章节。\n\n![真实需求实践学习页](assets/images/real-case/learning-desktop.png)\n\n## 创建真正可用的研究回查 Skill\n\n[六步创建实录](app/scenarios.html?lesson=1#build-skill)从能力契约开始，逐步说明流程、技能规程、脚本、独立试用与安装调用。每步都有设计理由、实际产物、验收方法和证据。初始教学草案作为历史示例保留；正式入口是 [research-recall/SKILL.md](skill/research-recall/SKILL.md)。\n\n该技能用 Python 3.10+ 标准库读取明确根目录的项目登记，以及登记项目的 README 和 research Markdown，排除上游副本和生成记录。提供 search、read、verify、save：返回带行号和哈希的原文，核对完整 GitHub 仓库身份，保存判断前重新验证证据，独占创建新文件。判断记录与浏览器笔记独立保存。\n\n- [第一步能力契约](research/skill-creation/contract.md)\n- [每一步设计与验证说明](research/skill-creation/walkthrough.md)\n- [实际检查与安装记录](research/skill-creation/verification.json)\n- [独立试用答复与证据](research/skill-creation/forward-test.json)\n- [脚本行为测试](tests/skill-recall.test.py)\n\n在研究总库根目录运行只读查询：\n\n```powershell\npython -X utf8 projects/010-agent-skills-engineering-lab/skill/research-recall/scripts/recall.py search --root . --query \"https://github.com/addyosmani/agent-skills\"\n```\n\n安装后，在助手中可提出：`$research-recall 在当前研究总库回查 Agent Skills 的用途和适用场景，给出原文出处，并区分已有研究与未实测判断。`\n\n查询读取当前资料；它不是任意语义问答、联网搜索或私人日记接入。验证证明来源与引用一致，不自动证明解释正确。安装副本及测试覆盖以验证记录为准，尚未进行有／无 Skill 收益对照。\n\n## 从整体到细节的阅读路径\n\n1. **整体结构**：先理解技能文件、AI 助手、执行工具与实际产物的关系；再看需求、规划、实现、验证、审查和维护的主线，以及跨阶段能力。\n2. **25 项完整目录**：按阶段或关键词查找。每项解释适用场景、所需输入、执行步骤、输出、为什么这样安排、相关技能和能力边界。\n3. **相近技能区别**：对照需求访谈与想法细化；规格、质量约束与计划；测试、浏览器检查与调试等 8 组差异。\n4. **共同案例串联**：用“虚构资料检索小工具”的发展过程串起全部技能，说明各项何时进入、怎样交接、哪些可并行。路径和单项示例均为教学解释，未据此实施完整产品。\n5. **证据与原文**：每项可打开本地或固定版 GitHub 原文。已有三个实验放在独立证据区，不再用它们代替整个仓库的能力说明。\n\n[学习导览](app/index.html)无需安装依赖，采用本地脚本数据，不请求模型或外部 API；可直接用浏览器打开该 HTML。需要 HTTP 预览时，在本子项目目录运行 `node scripts/serve.mjs`，访问 \u003chttp://127.0.0.1:8010/app/index.html>。页面提供搜索、阶段筛选、逐项阅读、技能关联跳转、相近能力对照及详情刷新恢复；没有执行技能的后台服务。\n\n![学习导览桌面实景](assets/images/guide-verification/desktop-overview.png)\n\n图：本轮实际浏览器截图。交互检查和边界见[导览验收记录](research/guide-verification.md)。\n\n![Agent Skills 的 25 项能力总览](assets/images/skills-overview.png)\n\n图：我们用 AI 制作的能力整理图，展示上游声明的用途，不是各项技能的实测结果。[价值与使用示意图](assets/images/value-and-use.png)同样为本研究整理。\n\n## 场景实验\n\n| 实验 | 真实执行的工作 | 观察和边界 |\n| --- | --- | --- |\n| [跨日搜索调试](experiment-batch/research/experiments/experiment-debug/README.md) | 用虚构记录和人为植入的索引故障，按调试技能复现、定位、修复及检查。 | 故障版 3/5 检查通过，修复版 5/5；这是最小模型，不是真实 ReflectFlow 故障。 |\n| [检索需求规格](experiment-batch/research/experiments/experiment-spec/README.md) | 对虚构资料关键词检索场景，参照规格技能写出目标、边界及 5 条验收条件，并检查结构。 | 规格结构检查通过；未实现检索工具，检查不证明规格或功能正确。 |\n| [卡片收藏备份审查](experiment-batch/research/experiments/experiment-review/README.md) | 只读审查 008 项目备份处理代码，用虚构输入和内存存储运行实际函数。 | 所选输入与存储失败检查通过；未做真实浏览器流程或全面安全审计。 |\n\n这些实验是阅读技能后由助手实际执行或产出材料，并非插件自动执行。实验均没有无技能独立对照，不能量化它们是否更快或更准确。实验输入为虚构数据，不读取、连接或修改 ReflectFlow 正式库及编辑缓存；审查只读访问 008 源码，未接触真实浏览器收藏。详细输入、命令和限制见各实验说明。\n\n## 本地复查\n\n需要 Node.js 22+ 和 Python 3；无需安装第三方依赖。在本子项目目录执行：\n\n```powershell\npython scripts/verify-snapshot.py\npython scripts/build-guide.py\nnode scripts/build-scenarios.mjs\nnode scripts/build-scenarios.mjs --check\nnode scripts/build-recall.mjs\nnode scripts/build-recall.mjs --check\nnode --test tests/recall.test.mjs\nnode scripts/verify-real-case.mjs\npython -X utf8 -B tests/skill-recall.test.py\npython experiment-batch/research/experiments/experiment-spec/check-spec.py\nnode experiment-batch/research/experiments/experiment-debug/verify.mjs before\nnode experiment-batch/research/experiments/experiment-debug/verify.mjs after\nnode experiment-batch/research/experiments/experiment-review/check-backup.cjs\n```\n\n调试实验的 `before` 因故障预期返回非零；`after` 应通过。快照校验只证明本地文件与本次保存的清单一致，不是独立上游真实性证明。需要重新获取时，可在**不存在 `research/upstream` 的新副本**运行 `python scripts/fetch-upstream.py`；脚本拒绝覆盖已有快照，不执行上游内容。\n\n## 对我们的价值与取舍\n\n用好这个库，从一个实际问题开始：先在总图中找到相关场景，读该 Skill 的步骤与边界，再把它用于当前项目，核对产物和失败证据。直接可借鉴的做法包括：将需求写成可验收的行为、调试前保留复现材料、让重要假设接受独立检查、交付前实际走通用户路径。\n\n学习其优点，要追问每条要求如何影响执行：靠文字提醒、由工具检查，还是作为进入下一步的门槛。研究回查案例和自建 `research-recall` 用来观察这种落地控制；后续扩展以真实需要和实际结果为依据。技能指导不能替代运行工具或测试，也不自动保证质量。部分方法与现有 Codex 技能重叠，应按当前问题和风险选用；用户指令、本仓库约定和 ReflectFlow 保护要求始终优先。\n\n上游内容和许可保留在 `research/upstream/`，文件清单见 [manifest.json](research/upstream/manifest.json)。三份 `app/data-*.json` 是我们的中文解读，`scripts/build-guide.py` 校验覆盖、字段和关联，并生成浏览器数据与完整文字版。页面和中文解读不属于上游原文；此前两张生成图片仅作概览。上游插件不安装到当前环境；后续用户明确要求创建可用 Skill，因此另行实现并部署自建 research-recall，具体文件与状态见安装记录。\n",
      "passages": [
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 010 · Agent Skills · 全景理解与实践"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) 提供 25 份工程 Skill，把需求、规格、规划、实现、验证与交付中的经验写成 AI 助手可以读取和遵循的工作规程。它的价值在于明确每类任务该如何推进、守住什么约束、留下什么产物，以及用什么证据判断完成；实际行动仍由助手结合项目和可用工具执行。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "本项目把全部 25 项能力整理为七类工作：选择方法、明确目标与底线、准备执行、实现功能、验证纠错、改善质量、交付维护。通过一张入口总图，逐项解释做什么、什么时候用、怎么做、交付与检查、如何配合，并关联具体场景和固定版原文。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 7,
          "endLine": 7,
          "text": "对我们的意义是建立一份按需查阅的工程方法库：以后从真实需求出发，选择相关 Skill 实际使用、核对效果，再分析其设计。学习重点是如何用步骤、约束、产物和检查控制落地，并把有效做法沉淀为自己的能力。25 项介绍与原理解读已覆盖；逐项完整实测尚未完成，固定源码、教学示例、有限实验与自建 Skill 的证据分别保留。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "已上线：[统一入口](https://yydshly.github.io/1025_codex_project/010-agent-skills-engineering-lab/) · [完整汇总长图](https://yydshly.github.io/1025_codex_project/010-agent-skills-engineering-lab/app/overview-poster.html)。发布范围和线上验证见[发布记录](research/deployment.md)。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 11,
          "endLine": 11,
          "text": "[入口总图：25个Skill与使用场景](app/overview.html) · [完整汇总长图](app/overview-poster.html) · [25项场景详解](app/scenarios.html) · [实现原理导览](app/index.html) · [真实需求实践](app/real-case.html) · [使用研究回查](app/recall.html) · [创建研究回查Skill实录](app/scenarios.html?lesson=1#build-skill) · [完整文字版](research/learning-guide.md) · [返回总索引](../../README.md#项目索引)"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 13,
          "endLine": 19,
          "text": "| 项目 | 内容 |\n| --- | --- |\n| 上游版本 | [`aeac41d4d005999432bb7312f7ff06383a91d59d`](https://github.com/addyosmani/agent-skills/tree/aeac41d4d005999432bb7312f7ff06383a91d59d)；2026-10-28 核对 |\n| 上游许可 | MIT；原始版权与许可见[本地副本](research/upstream/LICENSE) |\n| 已获取 | 25 个 `SKILL.md`、7 个技能内支持文件、7 份共享参考资料及许可证，共 40 文件 |\n| 状态 | 25 项原文解读与教学示例、3 项有限实验；新增真实研究回查工具与六步实践导览，采用与未触发能力分别记录 |\n| 安装状态 | 上游材料只读研究，未安装上游插件；本项目自建 research-recall 技能的安装与验证另见下方记录 |"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 21,
          "endLine": 21,
          "text": "## 统一查阅入口：25项能力与使用地图"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 23,
          "endLine": 23,
          "text": "[可点击总图](app/overview.html)按七类工作展示全部25项。每项统一回答五个问题：做什么、什么时候用、怎么做（含关键判断与约束）、交付什么与怎样检查、怎么配合。图中先看名称与用途，点击后查看完整说明，并可继续打开具体场景、实现原理与固定版原文。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 25,
          "endLine": 25,
          "text": "[完整汇总长图](app/overview-poster.html)将25项与五问放在同一张图中，可按原尺寸放大阅读；保留 [PNG](assets/images/skills-field-guide.png) 与可搜索文字的 [SVG](assets/images/skills-field-guide.svg)。内容来自本项目固定版本原文和场景说明，使用项目已有的字体与色彩，场景保持条件式表述。生成命令为 `node scripts/build-overview.mjs`；检查命令加 `--check`。PNG通过本地浏览器从同一SVG导出，无新增第三方依赖。生成SVG后需同步重新导出PNG。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 27,
          "endLine": 27,
          "text": "当前学习停留在全量理解和查阅；后续遇到真实需求，再选相关Skill实际使用、检查效果和分析实现。讲解覆盖25项不表示25项已经逐一完整实测。内容、交互与图片检查见[总图验证记录](research/overview-verification.json)。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 29,
          "endLine": 29,
          "text": "[![25项Skill能力、使用场景与协作引导图](assets/images/skills-field-guide.png)](app/overview.html)"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 31,
          "endLine": 31,
          "text": "## 需要更多细节：25项使用场景全景"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 33,
          "endLine": 33,
          "text": "[全量场景页](app/scenarios.html)承接总图的逐项阅读：以七类工作组织全部25项，每项提供触发条件、近期项目中的条件式例子、可以直接提出的任务、应得产物、验收方式、不适用情况、落地风险与技能衔接。支持展开全部案例和按技能直接定位。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "学习顺序：**全部使用场景 → 单项实现原理 → 真实需求实践**。场景说明已覆盖25项，原文解读已覆盖25项；25项逐一完整实测尚未完成。研究回查案例采用部分相关方法，不能作为全部能力的独立实测证明。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 37,
          "endLine": 37,
          "text": "场景结合现有项目构造，使用“当/如果/准备”等条件表达；不声称用户已提出这些新增需求、项目已出现这些故障，或已执行例子中的改动。来源与覆盖检查见[场景验证记录](research/scenarios-verification.md)。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 39,
          "endLine": 39,
          "text": "## 从真实需求学习落地控制"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 41,
          "endLine": 41,
          "text": "本案例来自本聊天最初的真实问题：“这个库我们以前研究过吗？”用户选择以“跨项目检索、查看出处、保存判断”开展实际演示。现有 10 个研究项目的登记信息和 README 被保存为可核对的快照，形成一个可用的[研究回查入口](app/recall.html)。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 43,
          "endLine": 46,
          "text": "- 按仓库链接、库名、关键词与研究阶段查询；结果带原文段落、行号、来源哈希。\n- 展示当前总库快照的研究记录；未命中只表示此快照没找到，登记为已总结不代表上游已实测。\n- 个人判断存于当前浏览器，可生成或下载 JSON 备份、粘贴备份合并；格式错误、未知版本和冲突拒绝写入。\n- 草稿切换有保护；保存前检查其他页面是否已更新记录。它不是多人协作服务，没有跨设备同步。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 48,
          "endLine": 48,
          "text": "[真实需求实践页](app/real-case.html)按六步组织需求、约束、任务、实现、修复和交付；每步关联 Skill、产物和回顾问题。25 项覆盖表区分采用的方法与未触发能力，不把完整覆盖讲解当成全部技能的实测证明。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 50,
          "endLine": 50,
          "text": "已发生的行为失败和修复、浏览器使用流程与验证边界统一记录在[验收记录](research/real-case/verification.md)。核心逻辑有 18 项行为测试；此前三个有限实验继续保留，均无无技能独立对照，未量化技能收益。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 52,
          "endLine": 52,
          "text": "使用笔记功能请通过 HTTP 打开：在本子项目目录运行 `node scripts/serve.mjs`，访问 \u003chttp://127.0.0.1:8010/app/real-case.html>。从实践页进入回查工具。浏览器的本地保存跟随访问地址；需要保留记录时导出备份。直接打开文件的存储行为未验收。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 54,
          "endLine": 54,
          "text": "数据输入限总库登记和各项目 README，不扫描私人资料，也不连接 ReflectFlow。快照通过 `node scripts/build-recall.mjs` 更新；其他项目更新说明后需要重建。这个早期网页案例没有安装全局技能或增加模型服务；后续自建 Skill 见下面的独立章节。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 56,
          "endLine": 56,
          "text": "![真实需求实践学习页](assets/images/real-case/learning-desktop.png)"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 58,
          "endLine": 58,
          "text": "## 创建真正可用的研究回查 Skill"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 60,
          "endLine": 60,
          "text": "[六步创建实录](app/scenarios.html?lesson=1#build-skill)从能力契约开始，逐步说明流程、技能规程、脚本、独立试用与安装调用。每步都有设计理由、实际产物、验收方法和证据。初始教学草案作为历史示例保留；正式入口是 [research-recall/SKILL.md](skill/research-recall/SKILL.md)。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 62,
          "endLine": 62,
          "text": "该技能用 Python 3.10+ 标准库读取明确根目录的项目登记，以及登记项目的 README 和 research Markdown，排除上游副本和生成记录。提供 search、read、verify、save：返回带行号和哈希的原文，核对完整 GitHub 仓库身份，保存判断前重新验证证据，独占创建新文件。判断记录与浏览器笔记独立保存。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 64,
          "endLine": 68,
          "text": "- [第一步能力契约](research/skill-creation/contract.md)\n- [每一步设计与验证说明](research/skill-creation/walkthrough.md)\n- [实际检查与安装记录](research/skill-creation/verification.json)\n- [独立试用答复与证据](research/skill-creation/forward-test.json)\n- [脚本行为测试](tests/skill-recall.test.py)"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 70,
          "endLine": 70,
          "text": "在研究总库根目录运行只读查询："
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 72,
          "endLine": 74,
          "text": "```powershell\npython -X utf8 projects/010-agent-skills-engineering-lab/skill/research-recall/scripts/recall.py search --root . --query \"https://github.com/addyosmani/agent-skills\"\n```"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 76,
          "endLine": 76,
          "text": "安装后，在助手中可提出：`$research-recall 在当前研究总库回查 Agent Skills 的用途和适用场景，给出原文出处，并区分已有研究与未实测判断。`"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 78,
          "endLine": 78,
          "text": "查询读取当前资料；它不是任意语义问答、联网搜索或私人日记接入。验证证明来源与引用一致，不自动证明解释正确。安装副本及测试覆盖以验证记录为准，尚未进行有／无 Skill 收益对照。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 80,
          "endLine": 80,
          "text": "## 从整体到细节的阅读路径"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 82,
          "endLine": 86,
          "text": "1. **整体结构**：先理解技能文件、AI 助手、执行工具与实际产物的关系；再看需求、规划、实现、验证、审查和维护的主线，以及跨阶段能力。\n2. **25 项完整目录**：按阶段或关键词查找。每项解释适用场景、所需输入、执行步骤、输出、为什么这样安排、相关技能和能力边界。\n3. **相近技能区别**：对照需求访谈与想法细化；规格、质量约束与计划；测试、浏览器检查与调试等 8 组差异。\n4. **共同案例串联**：用“虚构资料检索小工具”的发展过程串起全部技能，说明各项何时进入、怎样交接、哪些可并行。路径和单项示例均为教学解释，未据此实施完整产品。\n5. **证据与原文**：每项可打开本地或固定版 GitHub 原文。已有三个实验放在独立证据区，不再用它们代替整个仓库的能力说明。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 88,
          "endLine": 88,
          "text": "[学习导览](app/index.html)无需安装依赖，采用本地脚本数据，不请求模型或外部 API；可直接用浏览器打开该 HTML。需要 HTTP 预览时，在本子项目目录运行 `node scripts/serve.mjs`，访问 \u003chttp://127.0.0.1:8010/app/index.html>。页面提供搜索、阶段筛选、逐项阅读、技能关联跳转、相近能力对照及详情刷新恢复；没有执行技能的后台服务。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 90,
          "endLine": 90,
          "text": "![学习导览桌面实景](assets/images/guide-verification/desktop-overview.png)"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 92,
          "endLine": 92,
          "text": "图：本轮实际浏览器截图。交互检查和边界见[导览验收记录](research/guide-verification.md)。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 94,
          "endLine": 94,
          "text": "![Agent Skills 的 25 项能力总览](assets/images/skills-overview.png)"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 96,
          "endLine": 96,
          "text": "图：我们用 AI 制作的能力整理图，展示上游声明的用途，不是各项技能的实测结果。[价值与使用示意图](assets/images/value-and-use.png)同样为本研究整理。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 98,
          "endLine": 98,
          "text": "## 场景实验"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 100,
          "endLine": 104,
          "text": "| 实验 | 真实执行的工作 | 观察和边界 |\n| --- | --- | --- |\n| [跨日搜索调试](experiment-batch/research/experiments/experiment-debug/README.md) | 用虚构记录和人为植入的索引故障，按调试技能复现、定位、修复及检查。 | 故障版 3/5 检查通过，修复版 5/5；这是最小模型，不是真实 ReflectFlow 故障。 |\n| [检索需求规格](experiment-batch/research/experiments/experiment-spec/README.md) | 对虚构资料关键词检索场景，参照规格技能写出目标、边界及 5 条验收条件，并检查结构。 | 规格结构检查通过；未实现检索工具，检查不证明规格或功能正确。 |\n| [卡片收藏备份审查](experiment-batch/research/experiments/experiment-review/README.md) | 只读审查 008 项目备份处理代码，用虚构输入和内存存储运行实际函数。 | 所选输入与存储失败检查通过；未做真实浏览器流程或全面安全审计。 |"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 106,
          "endLine": 106,
          "text": "这些实验是阅读技能后由助手实际执行或产出材料，并非插件自动执行。实验均没有无技能独立对照，不能量化它们是否更快或更准确。实验输入为虚构数据，不读取、连接或修改 ReflectFlow 正式库及编辑缓存；审查只读访问 008 源码，未接触真实浏览器收藏。详细输入、命令和限制见各实验说明。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 108,
          "endLine": 108,
          "text": "## 本地复查"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 110,
          "endLine": 110,
          "text": "需要 Node.js 22+ 和 Python 3；无需安装第三方依赖。在本子项目目录执行："
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 112,
          "endLine": 119,
          "text": "```powershell\npython scripts/verify-snapshot.py\npython scripts/build-guide.py\nnode scripts/build-scenarios.mjs\nnode scripts/build-scenarios.mjs --check\nnode scripts/build-recall.mjs\nnode scripts/build-recall.mjs --check\nnode --test tests/recall.test.mjs"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 120,
          "endLine": 126,
          "text": "node scripts/verify-real-case.mjs\npython -X utf8 -B tests/skill-recall.test.py\npython experiment-batch/research/experiments/experiment-spec/check-spec.py\nnode experiment-batch/research/experiments/experiment-debug/verify.mjs before\nnode experiment-batch/research/experiments/experiment-debug/verify.mjs after\nnode experiment-batch/research/experiments/experiment-review/check-backup.cjs\n```"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 128,
          "endLine": 128,
          "text": "调试实验的 `before` 因故障预期返回非零；`after` 应通过。快照校验只证明本地文件与本次保存的清单一致，不是独立上游真实性证明。需要重新获取时，可在**不存在 `research/upstream` 的新副本**运行 `python scripts/fetch-upstream.py`；脚本拒绝覆盖已有快照，不执行上游内容。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 130,
          "endLine": 130,
          "text": "## 对我们的价值与取舍"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 132,
          "endLine": 132,
          "text": "用好这个库，从一个实际问题开始：先在总图中找到相关场景，读该 Skill 的步骤与边界，再把它用于当前项目，核对产物和失败证据。直接可借鉴的做法包括：将需求写成可验收的行为、调试前保留复现材料、让重要假设接受独立检查、交付前实际走通用户路径。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 134,
          "endLine": 134,
          "text": "学习其优点，要追问每条要求如何影响执行：靠文字提醒、由工具检查，还是作为进入下一步的门槛。研究回查案例和自建 `research-recall` 用来观察这种落地控制；后续扩展以真实需要和实际结果为依据。技能指导不能替代运行工具或测试，也不自动保证质量。部分方法与现有 Codex 技能重叠，应按当前问题和风险选用；用户指令、本仓库约定和 ReflectFlow 保护要求始终优先。"
        },
        {
          "path": "projects/010-agent-skills-engineering-lab/README.md",
          "startLine": 136,
          "endLine": 136,
          "text": "上游内容和许可保留在 `research/upstream/`，文件清单见 [manifest.json](research/upstream/manifest.json)。三份 `app/data-*.json` 是我们的中文解读，`scripts/build-guide.py` 校验覆盖、字段和关联，并生成浏览器数据与完整文字版。页面和中文解读不属于上游原文；此前两张生成图片仅作概览。上游插件不安装到当前环境；后续用户明确要求创建可用 Skill，因此另行实现并部署自建 research-recall，具体文件与状态见安装记录。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 168,
        "endLine": 184,
        "text": "    {\n      \"id\": \"010\",\n      \"slug\": \"agent-skills-engineering-lab\",\n      \"name\": \"Agent Skills · 全景理解与实践\",\n      \"summary\": \"把上游的 25 项工程 Skills 按需求、计划、实现、验证、审查和交付等环节整理成地图。可对照应用场景、产物和检查项，并查看本库的研究回查实测。\",\n      \"source\": \"https://github.com/addyosmani/agent-skills\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"Agent Skills\",\n        \"AI编程\",\n        \"工程流程\",\n        \"实验验证\"\n      ],\n      \"cover\": \"assets/images/skills-field-guide.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/010-agent-skills-engineering-lab/\",\n      \"createdAt\": \"2026-10-28\"\n    },"
      }
    },
    {
      "id": "011",
      "slug": "pose-look-creation-atlas",
      "name": "姿势与衣装参考 · 能力、作用与产品探索",
      "summary": "用姿势与衣装两个图库研究多参考生图。公开九格组合实测和六张写真候选，可看同一虚构人物怎样更换动作与衣装，以及哪些细节容易偏离。",
      "source": "https://x.com/leo_xiaolei/status/2114971707962536302",
      "status": "researching",
      "tags": [
        "姿势参考",
        "衣装参考",
        "多参考生图",
        "系列写真",
        "产品研究"
      ],
      "createdAt": "2026-10-29",
      "readmePath": "projects/011-pose-look-creation-atlas/README.md",
      "readmeSha256": "ff19f849d434f8fd134b21d7be0bb679a1c237c177f94931b1fe70353e9081f3",
      "readmeText": "# 011 · 姿势与衣装参考 · 能力、作用与产品探索\n\n> 两个来源分别承担“表达怎么摆姿势”和“表达穿什么”的作用。POSE-DB-01 提供 1,439 张静态姿势参考；COSTUME-DB-01 提供 1,407 套虚构衣装参考。两套原图分别在私有仓库备份，当前已用三套衣装与三个姿势完成同一虚构人物的九张组合候选。生成由外部模型完成，我们在网页中区分原库事实、实际小样和产品设想。\n\n> **网页内容**：[研究总览](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/#overview) · [九格衣装与姿势组合实测](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/#matrix) · [系列写真与五个方向](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/#series) · [两个来源的详细研究](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/#understanding)。公开版保留生成小样、选片、备注和方案导出；[本地版](http://127.0.0.1:8011/app/#gallery)另提供原图浏览、五视角、收藏与私人素材记忆图。\n\n[返回总索引](../../README.md#项目索引) · [在线原库研究](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/) · [本地网页](app/index.html) · [研究笔记](research/notes.md) · [私有原图备份](https://github.com/yydshly/pose-look-reference-backup)\n\n![姿势与衣装参考的能力、作用与产品目标](assets/images/research-overview-public-v3.png)\n\n图：保留用户选定的 2026-10-29 引导图，不改写旧图。衣装“预告”是当时的状态，最新数量和组合实测以本页 2026-10-30 说明为准。沿用素材回忆图版式和已有探索效果。公开版将源库姿势线稿与衣装预告缩略换为原创几何示意；含原素材的完整记忆图继续放在本地私人入口。姿势与服装示意不是原库图片，精确输入以记录为准。[公开引导图编辑记录](app/media/research-overview-v3/manifest.json)。图中底部原图许可提醒适用于原库图像数据，当前公开图的源库图形已替换为示意。\n\n| 来源 | 已确认能力 | 对创作的作用 | 资源状态 |\n| --- | --- | --- | --- |\n| POSE-DB-01 姿势图库 | 分类检索、静态 PNG、同组已有视角对照 | 将身体动作、重心和构图方向变成外部 AI 可参考的图片 | 1,439 张原图、288 组已保存到本地与私有备份；原图不公开再分发 |\n| COSTUME-DB-01 衣装图库 | 1,407 套虚构衣装、八类检索、预览与单张原尺寸 PNG | 表达款式、主色与搭配目标，配合人物和姿势生成造型候选 | 1,407 张原图和对应缩略图已保存至独立私有库；未备份插件代码，原图不公开再分发 |\n\n两者提供素材条件；它们自身不运行生图模型。人物身份、服装细节和姿势跟随取决于外部模型及流程。中文 GitHub 镜像增加汉化与检索，代码许可不自动覆盖原图。\n\n| 项目 | 内容 |\n| --- | --- |\n| 编号 | 011 |\n| 收录与核对日期 | 2026-10-29 收录；2026-10-30 更新衣装资源和组合实测，Asia/Shanghai |\n| 当前阶段 | 两套原库已私有备份；六张写真、九张衣装组合候选及五个产品方向已接入，商品保真、稳定性与真人还原仍待验证 |\n| 实现 | 无第三方依赖的 HTML / CSS / JavaScript；无需构建 |\n| 上游研究版本 | 10 个项目固定 commit，见[快照清单](app/archive/manifest.json) |\n| 原图资源 | 姿势 1,439 张 / 288 组；衣装 1,407 张原图及 1,407 张缩略图 / 八类；不放入公开研究库 |\n| 源库资料 | 28 份说明、许可与少量导出实现，合计 530.2 KiB |\n| 授权 | 代码、原图、模型和附加人物分别核对；保留原文许可 |\n| 在线演示 | 已发布并核验：[原库研究主线](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/) |\n\n## 网页结构\n\n**一图总览（#overview）**\n\n[打开本地图解](http://127.0.0.1:8011/app/#overview) · [下载 PNG](app/media/research-overview-v1/overview.png) · [完整生成指令与资料依据](app/media/research-overview-v1/manifest.json)\n\n![姿势参考库：资源、能力与产品方向](app/media/research-overview-v1/overview.png)\n\n以“资源 → 参考如何起作用 → 产品目标”汇总原库理解：区分当时已保存的姿势原图、当时仅有预告的服装资源、外部生成模型与工作流，以及五个方向的实际进度。图中说明价值目标、视频与真实 3D 的缺口、许可边界和验证方法。上图为 1536×1024 的文字总览 v1，图标为示意图形，未复制原库图片。\n\n**本地默认新增「素材与效果版 v2」**：在图中嵌入 P015 扶腰原素材、衣装预告片段、对应庭院站姿结果和早期婚纱小样，便于回忆研究对象与探索。婚纱明确标为独立分支。该 v2 图记录 10 月 29 日衣装库尚未确认的状态；10 月 30 日已找到完整站并完成备份。AI 排版的缩略细节可能重绘，网页提供当前窗口切换查看各张原始资料与结果的入口。[本地查看](http://127.0.0.1:8011/app/#overview) · [输入、指令与哈希记录](app/media/research-overview-v2/manifest.json)。\n\n含原素材的合成图仅保存于 Git 忽略的 `.local/research-overview-v2/overview.png`，不放入公开 app 或公开截图。只有本机专用路由 `/local-media/research-overview-v2.png` 可展示；路由逐次核对 PNG、字节、尺寸和 SHA-256。无私人本地文件时，网页显示公开版 v3 总览。网页均支持放大、滚动阅读与下载。v2 首次排版完成，第二次补坐姿因网络失败没有返回结果；交付图为 1448×1086，未包含坐姿补充。该段是 v2 制作时的历史记录；含原素材的图继续不进入公开远端。\n\n**本地原图与创作方案（新增默认入口）**\n\n- 通过本机服务只读挂载已保存的 1,439 张原图、288 组姿势；不重复复制图片，不下载新资源。\n- 分类、中文与日文搜索、卡片内直接点选五视角、按需放大、原图另存、来源与哈希、收藏及五个自编专题。每张卡片独立切换，加入方案沿用当前视角；原站缺项会禁用标记。\n- 98 组姿势提供人工中文译名；其他保留原名与中文分类。动作特征标签由原始名称规则整理，不是图像识别结果。\n- 创作方案板支持按视角选图、排序、备注、草稿持久化、JSON 导出/合并导入和制作说明导出。\n- 三个可操作的产品流程原型：创作参考方案包、角色系列图制作计划、分镜与机位方案板。方案板本身不调用模型；另有使用真实原库输入生成的三姿势小样，尚未验证真实用户效率或付费价值。\n- 原库生成实测：默认亚洲女性手机随拍版，保留前两轮插画与摄影风格；可切换版本、放大人物基准/原姿势/结果，回查全部输入、指令、哈希和偏差。展示的是已保存结果，没有网页实时生图接口。\n\n方案保存图片引用、出处、哈希与备注，不内嵌原图。完整源索引通过本地接口读取，不进入公开 app 目录。包含原图的本次本地截图位于 `assets/images/local-v5/`，已排除 Git 跟踪；后续远端处理需区分工具代码、方案元数据与原图资产。\n\n**系列创作（#series）**\n\n- 五个方向：主题写真、穿搭与 Lookbook、婚纱造型、生活方式图文故事、职业与个人品牌；分别说明价值假设、交付物、输入、固定条件、变化、缺口和验证任务。\n- 《庭院午后》六镜头：环境开场、全身主图、半身表情、坐姿变化、动作变化、侧身结束。延续同一虚构成年亚洲女性、白 T 恤、牛仔裤、庭院与手机随拍视觉方向。\n- 新增三次生成，另三张引用手机随拍 v3 的原有文件；未重复复制。保留全部结果，开场与结束景别偏近的问题明确列为返修项。\n- 点击图片在当前窗口对照人物、原库姿势和结果，可连续切图，查看指令与来源；支持候选勾选、备注、浏览器保存、JSON 导出/导入和 Markdown 镜头说明导出。\n- 当前网页展示已生成结果，未接入实时生图；穿搭商品保真、真人还原、视频与 3D 没有因此得到验证。\n\n**主页面：原库研究**\n\n- 原始对象：两条分享各自指向什么，日文原站、中文转述与镜像的关系。\n- 保存状态：姿势与衣装全量原图、早期预告历史、本地路径与两个私有远端入口，以及保留原站关联的原因。\n- 原库盘点与扩展研究：真实索引的分类、视角和尺寸统计；七个方向的交付、证据、缺口、验证方法与优先级。\n- 作者演示：人物、服装与姿势参考分别发挥什么作用，生成由哪一层执行。\n- 能力与价值：原库提供的素材/检索，外部模型和相关工具的边界，已确认事实和未验证效果。\n- 来源与备份：原帖、原站、条款、固定版本资料和私人原图备份。\n\n**独立分支：已有思路与实验**\n\n- 思路理解：通用参考生图原理，以及图片、视频、3D 的交付区别。\n- 自建实验：原有换装、庭院场景、姿势编辑对照，保留完整图片、指令、输入关联和偏差。\n- 产品场景：婚纱、换装、摄影、衣橱与店铺等八类方案。\n\n独立分支的交互脚本不在主页面加载；引导图用婚纱缩略效果记忆该分支，并明确标注。公开版默认进入研究总览，本地版默认 #gallery 展示原图与方案，#series 展示写真系列与五个应用方向，#matrix 展示九格衣装与姿势组合实测，#products 定位原有方案板方向。旧的 #effects 与 #scenarios 链接会跳转至 branch.html；#understanding 仍指向原库研究。\n\n## 主线判断与证据边界\n\n原始姿势库提供静态、多角度、可筛选的参考 PNG；中文镜像增加汉化和检索。服装帖是早期预告；2026-10-30 已确认完整衣装站，提供 1,407 套虚构衣装 PNG。作者演示与我们的九格实测都由外部图像模型组合多张参考图，原站本身不生成图片。\n\n原库的价值应从找图效率、目标表达、多角度参考和素材复用来判断。姿势跟随、身份保持、服装保真与成功率属于外部模型及工作流程的结果。目前已完成同一虚构人物的三姿势小样、六张主题写真候选，以及三套衣装 × 三种动作的九张候选；尚未做纯文字对照、多次重复、数值身份相似度或真人身份还原验证，不能据此估计稳定成功率。\n\n自建婚纱图片和产品方案是另一层探索。它们已移入分支，不能替代原库效果、资源可用性或授权的核对。\n\n## 原库盘点与实际扩展研究\n\n本次对已保存的索引、清单及原图目录做只读盘点，不安装检测器、不下载权重，也不重新生图。[资源盘点](research/resource-audit-v4.json)记录了字段、分组、视角、尺寸和清单哈希；[扩展研究](research/extension-directions-v4.json)记录每个方向的依据与验收方法。网页中可直接展开阅读，也可下载[汇总 JSON](app/resource-research.json)。\n\n[保存状态的网页截图](assets/images/resources-status-v4.jpg) · [本次网页核验](research/resource-research-v4-checks.json)\n\n- 1,439 张原图全部为 900×1200；288 组中，287 组有五个视角，一组有四个视角。缺项是原索引的“全身1人・セクシー系 / P018 / 下から”，不是下载遗漏。\n- 1,439 个图像哈希各不相同，但同组的不同视角不等于不同姿势。\n- 原索引八个字段提供分类、名称、视角与图片地址，没有关节点坐标、相机标定或动作时序。\n- v4 为资源保存状态快照；当前本地版通过服务只读挂载原图，已经可直接浏览和做方案。原站链接继续用于溯源与核对条款。\n\n| 优先级 | 方向 | 当前判断 |\n| --- | --- | --- |\n| P0 | 私有本地图册、项目收藏与备注 | 本地原型已实现；仍需比对现成镜像和文件夹的找图效率 |\n| P1 | 原库参考效果对照评测 | 已做三姿势小样；保留全部输出与偏差，严格对照和多次重复未执行 |\n| P1 | 姿势控制图和可复用模板 | 官方技术路线存在；灰色线稿、手部及双人检测质量未验证 |\n| P1 | 虚构角色和插画构图方案 | 可利用多角度与标签；需验证能否减少选图和沟通成本 |\n| P2 | 3D 摆姿、机位与跨软件交付 | 需要外部模型、骨架与导出流程；原库本身不含真实 3D |\n| P2 | 分镜、关键画面与视频延伸 | 静态图能辅助规划；连续动作与视频需额外数据及验证 |\n| 暂不推进 | 公开原图镜像、素材转售或训练包 | 图片再分发受限；训练用途未确认，不能从代码许可推断 |\n\n这些是研究方向，不是已上线功能或已证明的商业机会。真人婚纱、换装等继续放在分支，并应更换为适当授权的参考素材。\n\n## 来源与许可\n\n起点是[中文姿势库转述](https://x.com/leo_xiaolei/status/2114971707962536302)与[原作者服装库预告](https://x.com/giaaibusi/status/2115431641766359244)。[日文姿势库原站](https://ai-pose-gallery.pages.dev/)提供原尺寸 PNG；[中文镜像](https://github.com/anhao/ai-pose-gallery-zh)主要增加中文检索和整理。\n\n- 原站允许免费使用，允许符合条款的作品制作商用、编辑与参考；禁止图片数据本身的再分发、转载和转售，原尺寸及加工后图片都在其范围内。\n- 原站另写有“不要用于表达实际人物或未成年人的用途”等限制。真人婚纱/换装应使用自己的或适当授权的姿势参考，不能自动套用这套图库。\n- 中文镜像的 MIT 只适用于代码，明确排除图片和原始数据；镜像又声明素材不得商用。不能把仓库标签当作整包素材的授权。\n- [衣装原站](https://ai-costume-gallery.pages.dev/)已确认为完整入口，现有 1,407 套；早期约 1,000 张只是制作预告。原作者允许在条款内参考创作和作品商用，但禁止原图及加工素材再分发，实际人物与未成年人用途受限制。第三方 [ComfyUI_Costume-Gallery_ZH](https://github.com/Stone-dielianhua/ComfyUI_Costume-Gallery_ZH) 的 MIT 明确排除图片及数据，不能据此认定衣装素材可任意商用。\n- 源码许可不覆盖所有检查点、数据、人物资产、示例模型和服务。各上游原文随快照保留，快照不扩大授权。\n\n原图只在本人可访问的私有仓库保存，不通过本研究库、GitHub Pages、Releases 或公开图库再次分发。个人备份不产生新的使用权。\n\n## 原库三姿势实测 · 亚洲女性手机随拍版\n\n[本地对照页](http://127.0.0.1:8011/app/#pilot) · [当前手机随拍版完整输入与指令](app/media/pose-pilot-v3/manifest.json) · [前轮摄影版](app/media/pose-pilot-v2/manifest.json) · [插画旧版记录](app/media/pose-pilot-v1/manifest.json) · [观察与范围](research/pose-pilot-review.md)\n\n使用原库 `full_single_P015_front`、`full_single_P019_front`、`full_single_P012_front`，分别测试扶腰、双臂上伸和坐姿托腮。每一版生成一张人物基准，再各自从相同基准与对应原图生成三个结果；每个配置一次。按用户反馈，先后保留插画版、自然光摄影版，并新增成年亚洲女性的日常庭院手机随拍方向：白 T 恤、牛仔裤、普通光线和手持构图。三版共 12 次内置 ImageGen 调用、12 张 PNG；模型版本和随机种子未由工具报告。\n\n定性目测：主要动作与支撑关系可辨，人物特征、衣服类型与主色延续；腰胯、脚尖、袖口、口袋、鞋形和面部细节仍有重绘。全部结果保留，不按三张小样推断稳定成功率。\n\n人物基准和图片均由 AI 生成，没有真人照片，也不是实际手机拍摄。手机随拍是视觉方向；需要具体人物还原时，应准备其本人照片与适当授权的姿势素材，再独立检查身份与身体特征。本次没有生成视频、3D 或进行真实商品试穿验收。\n\n## 六张《庭院午后》系列 · 2026-10-29\n\n[本地展示](http://127.0.0.1:8011/app/#series) · [逐张输入、完整指令与哈希](app/media/courtyard-series-v1/manifest.json) · [研究与观察](research/courtyard-series-v1.md)\n\n![六张写真系列的本地创作页](assets/images/courtyard-series-v1-overview.png)\n\n从手机随拍 v3 的三张动作结果向系列内容延伸，新增环境开场、半身表情、侧身结束三张。新增资产 3 张、3 次内置 ImageGen 调用；其余 3 张和人物基准直接引用 v3 文件。未生成视频或 3D；此次发布公开展示这些已保存结果。\n\n这组支持“姿势参考 + 镜头目的 + 固定人物和场景”的流程探索；目前可见动作、景别和观看节奏的变化。开场人物约占画面一半，未达到约三分之一的目标；结束图也仍偏近。背景几何、面部、手指和服装细节没有逐点锁定，不能当作稳定身份保持、真实机位控制或商业成片质量的证明。\n\n选片草稿使用独立浏览器存储，不改动原图库的创作方案。导出包含图片路径、姿势出处、哈希、指令和备注，不包含原图字节。各方向的收益仍是待验证假设。\n\n## 三套衣装 × 三种动作 · 九格组合实测 · 2026-10-30\n\n[在线九格展示](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/#matrix) · [本地原图同窗对照](http://127.0.0.1:8011/app/#matrix) · [逐张提示词、输入编号与哈希](app/media/costume-matrix-v1/manifest.json) · [研究与扩展目标](research/pose-costume-matrix-v1.md) · [私有完整记录](https://github.com/yydshly/costume-reference-backup/tree/cfa78a98b97db97825382d92d2f34f12ba7675d3/experiments/pose-costume-matrix-v1)\n\n![同一虚构人物的三套衣装与三种动作组合实测](assets/images/pose-costume-matrix-v1-public.jpg)\n\n沿用已生成的虚构成年亚洲女性基准、庭院与手机随拍方向；每张独立输入同一人物、一张衣装原图和一张姿势原图。衣装是 SPR-0001、SUM-0162、AUT-0001，动作是 P015 正面扶腰、P019 正面伸展、P017 侧身回望。帽子、包和首饰统一不带，只看主服装和鞋子。\n\n内置 ImageGen 共 10 次请求、9 张保存结果；原计划短裙坐姿组合被平台拒绝一次，第三列对三套衣装统一换成侧身回望。每个最终配置仅一次，不据此计算稳定成功率。九张均 1086×1448，共 29,580,257 字节；未报告模型版本或随机种子。\n\n人物特征、主服装色块和主要动作可以辨认；衣料纹理、手指、缝线与侧身角度仍有重绘。春装伸展图手指接近上边缘，侧身结果不等同于原图精确角度。适合作为穿搭比较、主题写真和 Lookbook 的候选素材，尚不能证明商品细节保真、实际合身或真人还原。\n\n网页支持九格浏览、同窗逐张放大、前后切换、PNG 下载、完整提示词与 JSON 记录导出。公开版展示生成结果、人物基准及原图编号/链接；本地服务核验私有目录中的三张衣装原图，配合已挂载的姿势原图显示对照。没有实时生图接口。\n\n## 备份与可恢复性\n\n- 姿势本地原图：E:/PersonalBackups/PoseLookReferences/pose-db-20261029\n- 衣装本地原图：E:/PersonalBackups/CostumeReferences/costume-db-20261030；[私有远端](https://github.com/yydshly/costume-reference-backup)，1,407 原图与 1,407 缩略图均逐文件匹配上游固定版本的大小、SHA-256 和 Git blob。[远端核验](https://github.com/yydshly/costume-reference-backup/actions/runs/41045762114)已成功。该备份不包含 ComfyUI 插件代码。\n- 私有远端：[yydshly/pose-look-reference-backup](https://github.com/yydshly/pose-look-reference-backup)。需要仓库权限，无权限可能显示 404。\n- [备份摘要](research/original-backup-summary.json)只含数量、来源、清单哈希、私有仓库链接及核验状态，没有原图。\n- 私有目录含逐文件 SHA-256、大小、尺寸、原始 URL、日文索引、抓取时原站 HTML，以及服装预告拼图的来源与哈希。\n- 私有仓库的 research-project/ 同时保存本研究网页、笔记、截图与脚本快照；research-project-snapshot.json 记录逐文件 SHA-256。网页展示的固定提交是原图核验版本，研究快照在 main 中继续保留。\n- 资料快照按固定 commit 保存，文件追加 .txt 后缀供静态查看；内容字节不变，原路径和 SHA-256 在清单中。\n\n校验全部本地原图：\n\n~~~powershell\npython -X utf8 scripts/verify-originals.py E:/PersonalBackups/PoseLookReferences/pose-db-20261029\n~~~\n\n核对远端私有 Git 树及每个 blob 与本地字节是否一致（需要已登录的 GitHub CLI，不下载另一份完整图片）：\n\n~~~powershell\npython -X utf8 scripts/verify-private-remote.py E:/PersonalBackups/PoseLookReferences/pose-db-20261029\n~~~\n\n恢复时从私有仓库克隆，再运行其中的 verify-originals.py。不要把它改为公开仓库或发布原图。备份脚本不安装/运行上游软件，不下载权重；抓取脚本只用于明确授权的私人备份，重复执行会复用已存在的有效 PNG。来源数量变化会停止抓取，需先核对。\n\n## 本地使用与检查\n\n原图工作台需要 Node.js 22+ 的本地服务；双击静态 HTML 无法访问原图目录。前台启动：\n\n~~~powershell\ncd E:/codex_project/1025_codex_project/projects/011-pose-look-creation-atlas\nnpm.cmd run dev\n~~~\n\n打开 http://127.0.0.1:8011/app/#gallery 。无需安装依赖，仅绑定 127.0.0.1。默认读取 E:/PersonalBackups/PoseLookReferences/pose-db-20261029，可在启动前设置 POSE_LOOK_LIBRARY 为另一份完整备份根目录；POSE_LOOK_PORT 可指定端口。九格对照另默认读取 E:/PersonalBackups/CostumeReferences/costume-db-20261030；可设置 POSE_LOOK_COSTUMES 指向另一份完整衣装备份。只挂载本次用到的三张衣装原图，每次加载核对记录、字节、尺寸和 SHA-256。\n\nWindows 后台启动/停止（只管理本工作台进程，不注册系统自启动）：\n\n~~~powershell\nnpm.cmd run start:local\nnpm.cmd run stop:local\n~~~\n\n启动脚本、日志和进程记录仅在本项目 `.local/`，此目录不进入 Git。重复启动会复用已有服务。其他机器需要先取得有权限的原图备份，再指定目录；公开静态站不会自动得到本机图片。\n\n~~~powershell\nnpm.cmd run check\nnpm.cmd run archive:verify\nnpm.cmd run test:local\n~~~\n\n根目录另运行 npm.cmd run check。交互结果见[网页核验](research/web-verification.json)。本轮网页接入复用已经生成的九张输出，没有再次生图或安装模型/插件。\n\n本轮本地工作台的目标和产品判断见[本地版记录](research/local-workspace-v5.md)，交互、实际导出文件及访问边界见[核验记录](research/local-workspace-v5-checks.json)。这是当时的本地阶段记录；当前已发布公开研究与生成候选，原图继续私有保存。\n\n## 有限实测与限制\n\n此前的[导出实验记录](app/evidence/export-experiment.json)：Mannequin GLB 为网格层级，0 蒙皮/动画/相机；MPFB + Blender 测试 GLB 含 1 蒙皮、1 动画、1 相机，回读得到 53 骨骼且顶点随动画变化。只证明同一 Blender 的有限回读。焦距数值变化，视场角是否等价尚未核对；未证明其他 DCC 或游戏引擎兼容。\n\n其余工具主要是文档与选定代码调研。新增的小样本说明参考编辑可用于表达换装、场景与动作目标；不能据此推断真实商品还原率、稳定成功率或商业收益。\n\n## 扩展分支\n\n[思路理解、生图实验与产品场景](research/extension-branch.md)已单独保存，在[在线分支页](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/branch.html#thinking)查看。既有 7 次 ImageGen 调用、8 张输入/结果图、自绘姿势源文件、完整提示词与偏差记录保持不变。\n\n",
      "passages": [
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 011 · 姿势与衣装参考 · 能力、作用与产品探索"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "> 两个来源分别承担“表达怎么摆姿势”和“表达穿什么”的作用。POSE-DB-01 提供 1,439 张静态姿势参考；COSTUME-DB-01 提供 1,407 套虚构衣装参考。两套原图分别在私有仓库备份，当前已用三套衣装与三个姿势完成同一虚构人物的九张组合候选。生成由外部模型完成，我们在网页中区分原库事实、实际小样和产品设想。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "> **网页内容**：[研究总览](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/#overview) · [九格衣装与姿势组合实测](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/#matrix) · [系列写真与五个方向](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/#series) · [两个来源的详细研究](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/#understanding)。公开版保留生成小样、选片、备注和方案导出；[本地版](http://127.0.0.1:8011/app/#gallery)另提供原图浏览、五视角、收藏与私人素材记忆图。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 7,
          "endLine": 7,
          "text": "[返回总索引](../../README.md#项目索引) · [在线原库研究](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/) · [本地网页](app/index.html) · [研究笔记](research/notes.md) · [私有原图备份](https://github.com/yydshly/pose-look-reference-backup)"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "![姿势与衣装参考的能力、作用与产品目标](assets/images/research-overview-public-v3.png)"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 11,
          "endLine": 11,
          "text": "图：保留用户选定的 2026-10-29 引导图，不改写旧图。衣装“预告”是当时的状态，最新数量和组合实测以本页 2026-10-30 说明为准。沿用素材回忆图版式和已有探索效果。公开版将源库姿势线稿与衣装预告缩略换为原创几何示意；含原素材的完整记忆图继续放在本地私人入口。姿势与服装示意不是原库图片，精确输入以记录为准。[公开引导图编辑记录](app/media/research-overview-v3/manifest.json)。图中底部原图许可提醒适用于原库图像数据，当前公开图的源库图形已替换为示意。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 13,
          "endLine": 16,
          "text": "| 来源 | 已确认能力 | 对创作的作用 | 资源状态 |\n| --- | --- | --- | --- |\n| POSE-DB-01 姿势图库 | 分类检索、静态 PNG、同组已有视角对照 | 将身体动作、重心和构图方向变成外部 AI 可参考的图片 | 1,439 张原图、288 组已保存到本地与私有备份；原图不公开再分发 |\n| COSTUME-DB-01 衣装图库 | 1,407 套虚构衣装、八类检索、预览与单张原尺寸 PNG | 表达款式、主色与搭配目标，配合人物和姿势生成造型候选 | 1,407 张原图和对应缩略图已保存至独立私有库；未备份插件代码，原图不公开再分发 |"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 18,
          "endLine": 18,
          "text": "两者提供素材条件；它们自身不运行生图模型。人物身份、服装细节和姿势跟随取决于外部模型及流程。中文 GitHub 镜像增加汉化与检索，代码许可不自动覆盖原图。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 20,
          "endLine": 27,
          "text": "| 项目 | 内容 |\n| --- | --- |\n| 编号 | 011 |\n| 收录与核对日期 | 2026-10-29 收录；2026-10-30 更新衣装资源和组合实测，Asia/Shanghai |\n| 当前阶段 | 两套原库已私有备份；六张写真、九张衣装组合候选及五个产品方向已接入，商品保真、稳定性与真人还原仍待验证 |\n| 实现 | 无第三方依赖的 HTML / CSS / JavaScript；无需构建 |\n| 上游研究版本 | 10 个项目固定 commit，见[快照清单](app/archive/manifest.json) |\n| 原图资源 | 姿势 1,439 张 / 288 组；衣装 1,407 张原图及 1,407 张缩略图 / 八类；不放入公开研究库 |"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 28,
          "endLine": 30,
          "text": "| 源库资料 | 28 份说明、许可与少量导出实现，合计 530.2 KiB |\n| 授权 | 代码、原图、模型和附加人物分别核对；保留原文许可 |\n| 在线演示 | 已发布并核验：[原库研究主线](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/) |"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 32,
          "endLine": 32,
          "text": "## 网页结构"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 34,
          "endLine": 34,
          "text": "**一图总览（#overview）**"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 36,
          "endLine": 36,
          "text": "[打开本地图解](http://127.0.0.1:8011/app/#overview) · [下载 PNG](app/media/research-overview-v1/overview.png) · [完整生成指令与资料依据](app/media/research-overview-v1/manifest.json)"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 38,
          "endLine": 38,
          "text": "![姿势参考库：资源、能力与产品方向](app/media/research-overview-v1/overview.png)"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 40,
          "endLine": 40,
          "text": "以“资源 → 参考如何起作用 → 产品目标”汇总原库理解：区分当时已保存的姿势原图、当时仅有预告的服装资源、外部生成模型与工作流，以及五个方向的实际进度。图中说明价值目标、视频与真实 3D 的缺口、许可边界和验证方法。上图为 1536×1024 的文字总览 v1，图标为示意图形，未复制原库图片。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 42,
          "endLine": 42,
          "text": "**本地默认新增「素材与效果版 v2」**：在图中嵌入 P015 扶腰原素材、衣装预告片段、对应庭院站姿结果和早期婚纱小样，便于回忆研究对象与探索。婚纱明确标为独立分支。该 v2 图记录 10 月 29 日衣装库尚未确认的状态；10 月 30 日已找到完整站并完成备份。AI 排版的缩略细节可能重绘，网页提供当前窗口切换查看各张原始资料与结果的入口。[本地查看](http://127.0.0.1:8011/app/#overview) · [输入、指令与哈希记录](app/media/research-overview-v2/manifest.json)。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 44,
          "endLine": 44,
          "text": "含原素材的合成图仅保存于 Git 忽略的 `.local/research-overview-v2/overview.png`，不放入公开 app 或公开截图。只有本机专用路由 `/local-media/research-overview-v2.png` 可展示；路由逐次核对 PNG、字节、尺寸和 SHA-256。无私人本地文件时，网页显示公开版 v3 总览。网页均支持放大、滚动阅读与下载。v2 首次排版完成，第二次补坐姿因网络失败没有返回结果；交付图为 1448×1086，未包含坐姿补充。该段是 v2 制作时的历史记录；含原素材的图继续不进入公开远端。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 46,
          "endLine": 46,
          "text": "**本地原图与创作方案（新增默认入口）**"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 48,
          "endLine": 53,
          "text": "- 通过本机服务只读挂载已保存的 1,439 张原图、288 组姿势；不重复复制图片，不下载新资源。\n- 分类、中文与日文搜索、卡片内直接点选五视角、按需放大、原图另存、来源与哈希、收藏及五个自编专题。每张卡片独立切换，加入方案沿用当前视角；原站缺项会禁用标记。\n- 98 组姿势提供人工中文译名；其他保留原名与中文分类。动作特征标签由原始名称规则整理，不是图像识别结果。\n- 创作方案板支持按视角选图、排序、备注、草稿持久化、JSON 导出/合并导入和制作说明导出。\n- 三个可操作的产品流程原型：创作参考方案包、角色系列图制作计划、分镜与机位方案板。方案板本身不调用模型；另有使用真实原库输入生成的三姿势小样，尚未验证真实用户效率或付费价值。\n- 原库生成实测：默认亚洲女性手机随拍版，保留前两轮插画与摄影风格；可切换版本、放大人物基准/原姿势/结果，回查全部输入、指令、哈希和偏差。展示的是已保存结果，没有网页实时生图接口。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 55,
          "endLine": 55,
          "text": "方案保存图片引用、出处、哈希与备注，不内嵌原图。完整源索引通过本地接口读取，不进入公开 app 目录。包含原图的本次本地截图位于 `assets/images/local-v5/`，已排除 Git 跟踪；后续远端处理需区分工具代码、方案元数据与原图资产。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 57,
          "endLine": 57,
          "text": "**系列创作（#series）**"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 59,
          "endLine": 63,
          "text": "- 五个方向：主题写真、穿搭与 Lookbook、婚纱造型、生活方式图文故事、职业与个人品牌；分别说明价值假设、交付物、输入、固定条件、变化、缺口和验证任务。\n- 《庭院午后》六镜头：环境开场、全身主图、半身表情、坐姿变化、动作变化、侧身结束。延续同一虚构成年亚洲女性、白 T 恤、牛仔裤、庭院与手机随拍视觉方向。\n- 新增三次生成，另三张引用手机随拍 v3 的原有文件；未重复复制。保留全部结果，开场与结束景别偏近的问题明确列为返修项。\n- 点击图片在当前窗口对照人物、原库姿势和结果，可连续切图，查看指令与来源；支持候选勾选、备注、浏览器保存、JSON 导出/导入和 Markdown 镜头说明导出。\n- 当前网页展示已生成结果，未接入实时生图；穿搭商品保真、真人还原、视频与 3D 没有因此得到验证。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 65,
          "endLine": 65,
          "text": "**主页面：原库研究**"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 67,
          "endLine": 72,
          "text": "- 原始对象：两条分享各自指向什么，日文原站、中文转述与镜像的关系。\n- 保存状态：姿势与衣装全量原图、早期预告历史、本地路径与两个私有远端入口，以及保留原站关联的原因。\n- 原库盘点与扩展研究：真实索引的分类、视角和尺寸统计；七个方向的交付、证据、缺口、验证方法与优先级。\n- 作者演示：人物、服装与姿势参考分别发挥什么作用，生成由哪一层执行。\n- 能力与价值：原库提供的素材/检索，外部模型和相关工具的边界，已确认事实和未验证效果。\n- 来源与备份：原帖、原站、条款、固定版本资料和私人原图备份。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 74,
          "endLine": 74,
          "text": "**独立分支：已有思路与实验**"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 76,
          "endLine": 78,
          "text": "- 思路理解：通用参考生图原理，以及图片、视频、3D 的交付区别。\n- 自建实验：原有换装、庭院场景、姿势编辑对照，保留完整图片、指令、输入关联和偏差。\n- 产品场景：婚纱、换装、摄影、衣橱与店铺等八类方案。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 80,
          "endLine": 80,
          "text": "独立分支的交互脚本不在主页面加载；引导图用婚纱缩略效果记忆该分支，并明确标注。公开版默认进入研究总览，本地版默认 #gallery 展示原图与方案，#series 展示写真系列与五个应用方向，#matrix 展示九格衣装与姿势组合实测，#products 定位原有方案板方向。旧的 #effects 与 #scenarios 链接会跳转至 branch.html；#understanding 仍指向原库研究。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 82,
          "endLine": 82,
          "text": "## 主线判断与证据边界"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 84,
          "endLine": 84,
          "text": "原始姿势库提供静态、多角度、可筛选的参考 PNG；中文镜像增加汉化和检索。服装帖是早期预告；2026-10-30 已确认完整衣装站，提供 1,407 套虚构衣装 PNG。作者演示与我们的九格实测都由外部图像模型组合多张参考图，原站本身不生成图片。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 86,
          "endLine": 86,
          "text": "原库的价值应从找图效率、目标表达、多角度参考和素材复用来判断。姿势跟随、身份保持、服装保真与成功率属于外部模型及工作流程的结果。目前已完成同一虚构人物的三姿势小样、六张主题写真候选，以及三套衣装 × 三种动作的九张候选；尚未做纯文字对照、多次重复、数值身份相似度或真人身份还原验证，不能据此估计稳定成功率。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 88,
          "endLine": 88,
          "text": "自建婚纱图片和产品方案是另一层探索。它们已移入分支，不能替代原库效果、资源可用性或授权的核对。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 90,
          "endLine": 90,
          "text": "## 原库盘点与实际扩展研究"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 92,
          "endLine": 92,
          "text": "本次对已保存的索引、清单及原图目录做只读盘点，不安装检测器、不下载权重，也不重新生图。[资源盘点](research/resource-audit-v4.json)记录了字段、分组、视角、尺寸和清单哈希；[扩展研究](research/extension-directions-v4.json)记录每个方向的依据与验收方法。网页中可直接展开阅读，也可下载[汇总 JSON](app/resource-research.json)。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 94,
          "endLine": 94,
          "text": "[保存状态的网页截图](assets/images/resources-status-v4.jpg) · [本次网页核验](research/resource-research-v4-checks.json)"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 96,
          "endLine": 99,
          "text": "- 1,439 张原图全部为 900×1200；288 组中，287 组有五个视角，一组有四个视角。缺项是原索引的“全身1人・セクシー系 / P018 / 下から”，不是下载遗漏。\n- 1,439 个图像哈希各不相同，但同组的不同视角不等于不同姿势。\n- 原索引八个字段提供分类、名称、视角与图片地址，没有关节点坐标、相机标定或动作时序。\n- v4 为资源保存状态快照；当前本地版通过服务只读挂载原图，已经可直接浏览和做方案。原站链接继续用于溯源与核对条款。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 101,
          "endLine": 108,
          "text": "| 优先级 | 方向 | 当前判断 |\n| --- | --- | --- |\n| P0 | 私有本地图册、项目收藏与备注 | 本地原型已实现；仍需比对现成镜像和文件夹的找图效率 |\n| P1 | 原库参考效果对照评测 | 已做三姿势小样；保留全部输出与偏差，严格对照和多次重复未执行 |\n| P1 | 姿势控制图和可复用模板 | 官方技术路线存在；灰色线稿、手部及双人检测质量未验证 |\n| P1 | 虚构角色和插画构图方案 | 可利用多角度与标签；需验证能否减少选图和沟通成本 |\n| P2 | 3D 摆姿、机位与跨软件交付 | 需要外部模型、骨架与导出流程；原库本身不含真实 3D |\n| P2 | 分镜、关键画面与视频延伸 | 静态图能辅助规划；连续动作与视频需额外数据及验证 |"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 109,
          "endLine": 109,
          "text": "| 暂不推进 | 公开原图镜像、素材转售或训练包 | 图片再分发受限；训练用途未确认，不能从代码许可推断 |"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 111,
          "endLine": 111,
          "text": "这些是研究方向，不是已上线功能或已证明的商业机会。真人婚纱、换装等继续放在分支，并应更换为适当授权的参考素材。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 113,
          "endLine": 113,
          "text": "## 来源与许可"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 115,
          "endLine": 115,
          "text": "起点是[中文姿势库转述](https://x.com/leo_xiaolei/status/2114971707962536302)与[原作者服装库预告](https://x.com/giaaibusi/status/2115431641766359244)。[日文姿势库原站](https://ai-pose-gallery.pages.dev/)提供原尺寸 PNG；[中文镜像](https://github.com/anhao/ai-pose-gallery-zh)主要增加中文检索和整理。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 117,
          "endLine": 121,
          "text": "- 原站允许免费使用，允许符合条款的作品制作商用、编辑与参考；禁止图片数据本身的再分发、转载和转售，原尺寸及加工后图片都在其范围内。\n- 原站另写有“不要用于表达实际人物或未成年人的用途”等限制。真人婚纱/换装应使用自己的或适当授权的姿势参考，不能自动套用这套图库。\n- 中文镜像的 MIT 只适用于代码，明确排除图片和原始数据；镜像又声明素材不得商用。不能把仓库标签当作整包素材的授权。\n- [衣装原站](https://ai-costume-gallery.pages.dev/)已确认为完整入口，现有 1,407 套；早期约 1,000 张只是制作预告。原作者允许在条款内参考创作和作品商用，但禁止原图及加工素材再分发，实际人物与未成年人用途受限制。第三方 [ComfyUI_Costume-Gallery_ZH](https://github.com/Stone-dielianhua/ComfyUI_Costume-Gallery_ZH) 的 MIT 明确排除图片及数据，不能据此认定衣装素材可任意商用。\n- 源码许可不覆盖所有检查点、数据、人物资产、示例模型和服务。各上游原文随快照保留，快照不扩大授权。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 123,
          "endLine": 123,
          "text": "原图只在本人可访问的私有仓库保存，不通过本研究库、GitHub Pages、Releases 或公开图库再次分发。个人备份不产生新的使用权。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 125,
          "endLine": 125,
          "text": "## 原库三姿势实测 · 亚洲女性手机随拍版"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 127,
          "endLine": 127,
          "text": "[本地对照页](http://127.0.0.1:8011/app/#pilot) · [当前手机随拍版完整输入与指令](app/media/pose-pilot-v3/manifest.json) · [前轮摄影版](app/media/pose-pilot-v2/manifest.json) · [插画旧版记录](app/media/pose-pilot-v1/manifest.json) · [观察与范围](research/pose-pilot-review.md)"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 129,
          "endLine": 129,
          "text": "使用原库 `full_single_P015_front`、`full_single_P019_front`、`full_single_P012_front`，分别测试扶腰、双臂上伸和坐姿托腮。每一版生成一张人物基准，再各自从相同基准与对应原图生成三个结果；每个配置一次。按用户反馈，先后保留插画版、自然光摄影版，并新增成年亚洲女性的日常庭院手机随拍方向：白 T 恤、牛仔裤、普通光线和手持构图。三版共 12 次内置 ImageGen 调用、12 张 PNG；模型版本和随机种子未由工具报告。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 131,
          "endLine": 131,
          "text": "定性目测：主要动作与支撑关系可辨，人物特征、衣服类型与主色延续；腰胯、脚尖、袖口、口袋、鞋形和面部细节仍有重绘。全部结果保留，不按三张小样推断稳定成功率。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 133,
          "endLine": 133,
          "text": "人物基准和图片均由 AI 生成，没有真人照片，也不是实际手机拍摄。手机随拍是视觉方向；需要具体人物还原时，应准备其本人照片与适当授权的姿势素材，再独立检查身份与身体特征。本次没有生成视频、3D 或进行真实商品试穿验收。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 135,
          "endLine": 135,
          "text": "## 六张《庭院午后》系列 · 2026-10-29"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 137,
          "endLine": 137,
          "text": "[本地展示](http://127.0.0.1:8011/app/#series) · [逐张输入、完整指令与哈希](app/media/courtyard-series-v1/manifest.json) · [研究与观察](research/courtyard-series-v1.md)"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 139,
          "endLine": 139,
          "text": "![六张写真系列的本地创作页](assets/images/courtyard-series-v1-overview.png)"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 141,
          "endLine": 141,
          "text": "从手机随拍 v3 的三张动作结果向系列内容延伸，新增环境开场、半身表情、侧身结束三张。新增资产 3 张、3 次内置 ImageGen 调用；其余 3 张和人物基准直接引用 v3 文件。未生成视频或 3D；此次发布公开展示这些已保存结果。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 143,
          "endLine": 143,
          "text": "这组支持“姿势参考 + 镜头目的 + 固定人物和场景”的流程探索；目前可见动作、景别和观看节奏的变化。开场人物约占画面一半，未达到约三分之一的目标；结束图也仍偏近。背景几何、面部、手指和服装细节没有逐点锁定，不能当作稳定身份保持、真实机位控制或商业成片质量的证明。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 145,
          "endLine": 145,
          "text": "选片草稿使用独立浏览器存储，不改动原图库的创作方案。导出包含图片路径、姿势出处、哈希、指令和备注，不包含原图字节。各方向的收益仍是待验证假设。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 147,
          "endLine": 147,
          "text": "## 三套衣装 × 三种动作 · 九格组合实测 · 2026-10-30"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 149,
          "endLine": 149,
          "text": "[在线九格展示](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/#matrix) · [本地原图同窗对照](http://127.0.0.1:8011/app/#matrix) · [逐张提示词、输入编号与哈希](app/media/costume-matrix-v1/manifest.json) · [研究与扩展目标](research/pose-costume-matrix-v1.md) · [私有完整记录](https://github.com/yydshly/costume-reference-backup/tree/cfa78a98b97db97825382d92d2f34f12ba7675d3/experiments/pose-costume-matrix-v1)"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 151,
          "endLine": 151,
          "text": "![同一虚构人物的三套衣装与三种动作组合实测](assets/images/pose-costume-matrix-v1-public.jpg)"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 153,
          "endLine": 153,
          "text": "沿用已生成的虚构成年亚洲女性基准、庭院与手机随拍方向；每张独立输入同一人物、一张衣装原图和一张姿势原图。衣装是 SPR-0001、SUM-0162、AUT-0001，动作是 P015 正面扶腰、P019 正面伸展、P017 侧身回望。帽子、包和首饰统一不带，只看主服装和鞋子。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 155,
          "endLine": 155,
          "text": "内置 ImageGen 共 10 次请求、9 张保存结果；原计划短裙坐姿组合被平台拒绝一次，第三列对三套衣装统一换成侧身回望。每个最终配置仅一次，不据此计算稳定成功率。九张均 1086×1448，共 29,580,257 字节；未报告模型版本或随机种子。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 157,
          "endLine": 157,
          "text": "人物特征、主服装色块和主要动作可以辨认；衣料纹理、手指、缝线与侧身角度仍有重绘。春装伸展图手指接近上边缘，侧身结果不等同于原图精确角度。适合作为穿搭比较、主题写真和 Lookbook 的候选素材，尚不能证明商品细节保真、实际合身或真人还原。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 159,
          "endLine": 159,
          "text": "网页支持九格浏览、同窗逐张放大、前后切换、PNG 下载、完整提示词与 JSON 记录导出。公开版展示生成结果、人物基准及原图编号/链接；本地服务核验私有目录中的三张衣装原图，配合已挂载的姿势原图显示对照。没有实时生图接口。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 161,
          "endLine": 161,
          "text": "## 备份与可恢复性"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 163,
          "endLine": 169,
          "text": "- 姿势本地原图：E:/PersonalBackups/PoseLookReferences/pose-db-20261029\n- 衣装本地原图：E:/PersonalBackups/CostumeReferences/costume-db-20261030；[私有远端](https://github.com/yydshly/costume-reference-backup)，1,407 原图与 1,407 缩略图均逐文件匹配上游固定版本的大小、SHA-256 和 Git blob。[远端核验](https://github.com/yydshly/costume-reference-backup/actions/runs/41045762114)已成功。该备份不包含 ComfyUI 插件代码。\n- 私有远端：[yydshly/pose-look-reference-backup](https://github.com/yydshly/pose-look-reference-backup)。需要仓库权限，无权限可能显示 404。\n- [备份摘要](research/original-backup-summary.json)只含数量、来源、清单哈希、私有仓库链接及核验状态，没有原图。\n- 私有目录含逐文件 SHA-256、大小、尺寸、原始 URL、日文索引、抓取时原站 HTML，以及服装预告拼图的来源与哈希。\n- 私有仓库的 research-project/ 同时保存本研究网页、笔记、截图与脚本快照；research-project-snapshot.json 记录逐文件 SHA-256。网页展示的固定提交是原图核验版本，研究快照在 main 中继续保留。\n- 资料快照按固定 commit 保存，文件追加 .txt 后缀供静态查看；内容字节不变，原路径和 SHA-256 在清单中。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 171,
          "endLine": 171,
          "text": "校验全部本地原图："
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 173,
          "endLine": 175,
          "text": "~~~powershell\npython -X utf8 scripts/verify-originals.py E:/PersonalBackups/PoseLookReferences/pose-db-20261029\n~~~"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 177,
          "endLine": 177,
          "text": "核对远端私有 Git 树及每个 blob 与本地字节是否一致（需要已登录的 GitHub CLI，不下载另一份完整图片）："
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 179,
          "endLine": 181,
          "text": "~~~powershell\npython -X utf8 scripts/verify-private-remote.py E:/PersonalBackups/PoseLookReferences/pose-db-20261029\n~~~"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 183,
          "endLine": 183,
          "text": "恢复时从私有仓库克隆，再运行其中的 verify-originals.py。不要把它改为公开仓库或发布原图。备份脚本不安装/运行上游软件，不下载权重；抓取脚本只用于明确授权的私人备份，重复执行会复用已存在的有效 PNG。来源数量变化会停止抓取，需先核对。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 185,
          "endLine": 185,
          "text": "## 本地使用与检查"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 187,
          "endLine": 187,
          "text": "原图工作台需要 Node.js 22+ 的本地服务；双击静态 HTML 无法访问原图目录。前台启动："
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 189,
          "endLine": 192,
          "text": "~~~powershell\ncd E:/codex_project/1025_codex_project/projects/011-pose-look-creation-atlas\nnpm.cmd run dev\n~~~"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 194,
          "endLine": 194,
          "text": "打开 http://127.0.0.1:8011/app/#gallery 。无需安装依赖，仅绑定 127.0.0.1。默认读取 E:/PersonalBackups/PoseLookReferences/pose-db-20261029，可在启动前设置 POSE_LOOK_LIBRARY 为另一份完整备份根目录；POSE_LOOK_PORT 可指定端口。九格对照另默认读取 E:/PersonalBackups/CostumeReferences/costume-db-20261030；可设置 POSE_LOOK_COSTUMES 指向另一份完整衣装备份。只挂载本次用到的三张衣装原图，每次加载核对记录、字节、尺寸和 SHA-256。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 196,
          "endLine": 196,
          "text": "Windows 后台启动/停止（只管理本工作台进程，不注册系统自启动）："
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 198,
          "endLine": 201,
          "text": "~~~powershell\nnpm.cmd run start:local\nnpm.cmd run stop:local\n~~~"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 203,
          "endLine": 203,
          "text": "启动脚本、日志和进程记录仅在本项目 `.local/`，此目录不进入 Git。重复启动会复用已有服务。其他机器需要先取得有权限的原图备份，再指定目录；公开静态站不会自动得到本机图片。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 205,
          "endLine": 209,
          "text": "~~~powershell\nnpm.cmd run check\nnpm.cmd run archive:verify\nnpm.cmd run test:local\n~~~"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 211,
          "endLine": 211,
          "text": "根目录另运行 npm.cmd run check。交互结果见[网页核验](research/web-verification.json)。本轮网页接入复用已经生成的九张输出，没有再次生图或安装模型/插件。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 213,
          "endLine": 213,
          "text": "本轮本地工作台的目标和产品判断见[本地版记录](research/local-workspace-v5.md)，交互、实际导出文件及访问边界见[核验记录](research/local-workspace-v5-checks.json)。这是当时的本地阶段记录；当前已发布公开研究与生成候选，原图继续私有保存。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 215,
          "endLine": 215,
          "text": "## 有限实测与限制"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 217,
          "endLine": 217,
          "text": "此前的[导出实验记录](app/evidence/export-experiment.json)：Mannequin GLB 为网格层级，0 蒙皮/动画/相机；MPFB + Blender 测试 GLB 含 1 蒙皮、1 动画、1 相机，回读得到 53 骨骼且顶点随动画变化。只证明同一 Blender 的有限回读。焦距数值变化，视场角是否等价尚未核对；未证明其他 DCC 或游戏引擎兼容。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 219,
          "endLine": 219,
          "text": "其余工具主要是文档与选定代码调研。新增的小样本说明参考编辑可用于表达换装、场景与动作目标；不能据此推断真实商品还原率、稳定成功率或商业收益。"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 221,
          "endLine": 221,
          "text": "## 扩展分支"
        },
        {
          "path": "projects/011-pose-look-creation-atlas/README.md",
          "startLine": 223,
          "endLine": 223,
          "text": "[思路理解、生图实验与产品场景](research/extension-branch.md)已单独保存，在[在线分支页](https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/branch.html#thinking)查看。既有 7 次 ImageGen 调用、8 张输入/结果图、自绘姿势源文件、完整提示词与偏差记录保持不变。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 185,
        "endLine": 203,
        "text": "    {\n      \"id\": \"011\",\n      \"slug\": \"pose-look-creation-atlas\",\n      \"name\": \"姿势与衣装参考 · 能力、作用与产品探索\",\n      \"summary\": \"用姿势与衣装两个图库研究多参考生图。公开九格组合实测和六张写真候选，可看同一虚构人物怎样更换动作与衣装，以及哪些细节容易偏离。\",\n      \"source\": \"https://x.com/leo_xiaolei/status/2114971707962536302\",\n      \"sourceName\": \"POSE-DB-01姿势图库与COSTUME-DB-01衣装图库\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"姿势参考\",\n        \"衣装参考\",\n        \"多参考生图\",\n        \"系列写真\",\n        \"产品研究\"\n      ],\n      \"cover\": \"assets/images/research-overview-public-v3.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/011-pose-look-creation-atlas/\",\n      \"createdAt\": \"2026-10-29\"\n    },"
      }
    },
    {
      "id": "012",
      "slug": "aquatic-toxicology-skill-lab",
      "name": "学术研究 Skill · 能力与水生毒理学实测",
      "summary": "以水生毒理学试题走一遍拆题、检索、文献筛选和证据分析，比较五种学术研究流程。公开报告、筛选表和核验记录，检索查全率与实际增益待验证。",
      "source": "https://github.com/Imbad0202/academic-research-skills",
      "status": "researching",
      "tags": [
        "水生毒理学",
        "学术研究",
        "Skill实测",
        "证据综合"
      ],
      "createdAt": "2026-10-29",
      "readmePath": "projects/012-aquatic-toxicology-skill-lab/README.md",
      "readmeSha256": "0c466b6b1641e966fcdee4d4889b4ee3b5fd47f06b76067036e5452ff3309663",
      "readmeText": "# 012 · 学术研究 Skill：能力、场景与水生毒理学实测\n\n研究 [academic-research-skills](https://github.com/Imbad0202/academic-research-skills) 如何把拆题、检索、来源核验、综合、写作与审查组织成可执行流程。原理是规则文件与角色分工由AI结合外部工具落实；价值在于复用研究规范和检查要求，让过程与判断可追溯，尚未证明相对直接问AI的准确率、查全率或效率增益。\n\n适用于选题探索、综述与前作调查、证据核验、已有材料整理成稿、论文修订、审稿准备和阶段交接。以“微/纳塑料—PFAS—斑马鱼共暴露”为适配案例展示完整过程；课题由AI从宽泛领域中收窄，尚非作者确认的论文题目，没有新增实验。\n\n| Skill | 主要能力 | 本例采用程度 |\n|---|---|---|\n| deep-research | 拆题、方法、检索核验与证据综合 | 采用多个角色规范并适配，未完整执行原生流程 |\n| sr-screener | 已有文献记录的题名摘要/全文筛选 | 未安装、未运行 |\n| academic-paper | 依据证据组织论文和修订材料 | 已安装并选读规范，未完整运行 |\n| academic-paper-reviewer | 稿件审查、修改建议与再审 | 已安装并选读准则，未运行完整面板 |\n| academic-pipeline | 阶段判断、技能调度与交接检查 | 已安装，未运行原生完整调度 |\n\n![我们生成的研究Skill能力与过程引导图](assets/images/understanding-map.png)\n\n[总索引](../../README.md) · [在线研究网页](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/) · [首轮历史报告](research/phase6_final/report.md) · [实际过程](research/process.md)\n\n![实际网页桌面截图](assets/images/process-walkthrough.jpg)\n\n## 最新研究结果：17条候选的后续阅读\n\n[直接打开最新结果](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/#round2-results) · [更新研究报告](research/round2/report.md) · [执行协议](research/round2/protocol.md) · [阅读矩阵CSV](app/data/round2-evidence.csv) · [审查与修订](research/round2/review.md)\n\n17条候选已逐条复核：9条首轮重合、8条新增；实际读取为期刊主文全文1条、章节/图注6条、摘要10条。14条直接共暴露记录、1条多污染物情境、2条学位论文补充，不等同17项独立实验。未取得全文、统计和实验单位未知项逐条列出。\n\n更新综合纳入更早PFOS/F-53B前作、终点限定的不显著/未放大结果、生态冠已有研究和PINK1干预模型定位（细胞过表达、整鱼MTK458药理处理）。不显著不证明安全，图注不替代全部方法，队列独立性与正式协同仍待核。首轮报告、结论及阅读范围作为历史对照保留；首屏和侧栏优先进入最新结果。\n\n三个阅读任务、定点内容审查和实现审查均为同模型家族适配，不是独立专家或原生全流程。原始阅读副本被Git忽略；公开自己转述、原文定位、访问日志及输入哈希。新增五份公开下载；检索阶段42份下载保持原样。构建最新结果运行 `npm run build:round2`，公开验证运行 `npm run check:public`。完整 `build:data` 仍需本地历史原始产物，随后也会构建第二轮阅读结果。\n\n## 我们的理解总览\n\n[打开理解总览网页](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/#understanding) · [总结说明](research/understanding-summary.md) · [结构化总结](research/understanding-summary.json) · [总览图 PNG](app/assets/understanding-map.png) · [生成及修订提示词](research/understanding-image-prompt.md)\n\n总结库的能力、原理和价值主张，分清原库规则/代码、本轮新增采集器/测试与后续建议。按拆题、拟词选源、取回、筛选、补漏、分析六步解释输入、动作、产物和检查点；11类来源分别说明用途、获取权限、处理方式与实际使用状态。只有PubMed、Europe PMC、OpenAlex属于第二轮API实测；原文/OECD首轮部分阅读与其他来源建议分开标明。\n\n信息图使用内置image_gen生成并修订，1536×1024；是本案例的理解说明，非原库官方架构图或科学可靠性认证。图中PubMed以Search概括，精确接口为ESearch→EFetch。984条与3/5→5/5仍为组合方案和已见样本修复，不证明原Skill单独增益。此轮只汇总既有研究和核对官方获取说明，没有重跑科研检索或新增全文审读。\n\n## 检索单独实测（第二轮）\n\n[打开检索实测网页](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/#retrieval-trial) · [过程与验证报告](research/retrieval-trial/report.md) · [冻结方案](research/retrieval-trial/query-plan.json) · [实际请求与原始产物](research/retrieval-trial/)\n\n![检索实测的实际网页](assets/images/retrieval-trial.jpg)\n\n沿用斑马鱼 × 微/纳塑料 × PFAS，按真实bibliography规范冻结概念块、检索式、筛选规则和验证方案，再用本轮新增API采集器执行。没有将新增适配器冒称原库自带功能。\n\n**检索能力归属：三个采集脚本均为本案例新写。** 原库提供检索/筛选规范、引文身份核验客户端，以及本例未运行的另一套四源主题发现代码；本轮的领域词表、三源采集器、基准、漏检修复和网页为额外适配。第一轮实际调用了未改写的原S2/Crossref客户端；本轮OpenAlex采集器没有调用原OpenAlexClient。[归属逐项审计](research/retrieval-ownership-audit.md)附固定提交链接及ZIP比对证据。984条候选与3/5→5/5是组合结果，未证明原Skill单独贡献或相对直接问AI的增益。\n\n| 来源/检查 | 实际结果 |\n|---|---|\n| PubMed原生E-utilities | 原式17/17；词汇修订19/19 |\n| Europe PMC REST | 原式18/18；去物种块580/580；词汇修订20/20。与PubMed高度重叠 |\n| OpenAlex主题检索 | V1 HTTP400；独立语法修订后32/32 |\n| 4种子一跳引文追踪 | 6/8方向完整；一方向连接失败，另一后向35/36 |\n| 独立综述派生基准 | 原生主检索3/5；加图4/5；词汇修订后5/5 |\n| 筛选 | 合并984条，保留17、排除916、待定51；包括程序预筛、主代理定点判断、89条独立AI复核及243条新增OpenAlex候选定点筛选 |\n\n检索遗漏实际来自F53B无连字符写法、Cl-PFAES、PFCs旧称和perfluoro*/polyfluoro*截断不当；原始成绩、诊断、修订和重跑分别留痕。5篇基准已用于修复，修订5/5不是新的未见验证或全领域召回率。保留17是阅读候选；其中8条上一轮未收录，含学位论文和潜在实验重叠，不等于8项独立新实验。\n\n复核发现本轮新解析器误删数学比较号之间的文字，影响22条记录；从保留的原始JSON重建，保存前后版本/hash。另保留2项筛选分歧与裁决、多物种处理臂对应不足的待定项、无摘要项和引用访问盲区。年份/期刊分布按已知字段统计；方法与地域没有足够提取数据，未编造评估。\n\n采集脚本为[scripts/retrieve-pubmed.py](scripts/retrieve-pubmed.py)、[retrieve-europepmc.py](scripts/retrieve-europepmc.py)、[retrieve-openalex.py](scripts/retrieve-openalex.py)。它们只有显式运行时才联网；`build:data`只读已保存产物。新一轮复跑请使用新的输出子目录/方案，保留本轮冻结快照。没有本轮新增核心全文审读、科学准确率测试或无Skill对照。\n\n## 实际完成（第一轮历史记录）\n\n10篇核心、2篇分开的背景、2份OECD方法资料；37条正式网页查询、5条主会话补查、15个实际遇到的排除候选。它们不是完整数据库命中数或系统筛选分母。原始客户端实时核验12篇：Crossref DOI/题名匹配12条；Semantic Scholar匹配P03/P09两条，10条429限流。\n\n输出文献矩阵、6条判断及来源关联、3对待研究者确认的跨论文张力、3类待查方向。5项角色复核问题已修改并定点回查。\n\n**首轮核心读取范围：8篇摘要、2篇章节片段、0篇全文审读。** 主要结论旁直接显示；不由摘要补造全文方法、统计、原始数据或创新性。\n\n## 实质结果\n\n[P03](https://doi.org/10.1016/j.watres.2025.124658)报告胚胎/仔鱼条件的不同方向，限制“一律增强”叙事，也使“首次研究阶段转换或TK/TD”不能直接作创新依据。[P05](https://doi.org/10.1016/j.etap.2025.104907)与[P09](https://doi.org/10.1016/j.aquatox.2025.107534)提供器官/时间相关标签，正式交互模型和队列独立性仍待核。[P10](https://doi.org/10.1016/j.envint.2026.110102)有功能干预线索，但鱼/细胞救援归属未明，不能转为整鱼因果证明。\n\n下一步优先取得关键全文与补充材料，核对模型、对照、实验单位和队列，再结合实际污染物、物种、仪器与预算确定课题。候选方向未获原创认证，不合并效应量或推导人群风险。\n\n## 技能来源、版本及执行环境\n\n源库：[Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills)。固定提交：[b8d050f24f2e1c465c4410eace8634ea3af15930](https://github.com/Imbad0202/academic-research-skills/commit/b8d050f24f2e1c465c4410eace8634ea3af15930)；suite发布标识3.24.0，deep-research 2.12.1；2026-10-29获取。\n\n使用系统 skill-installer 获取4个原始技能目录，补齐同提交 shared/scripts/docs 与许可，保留源ZIP和[1106份文件哈希](research/upstream-manifest.json)，没有嵌套.git。原始镜像与ZIP保留在本地；远端原文见[固定提交源码](https://github.com/Imbad0202/academic-research-skills/tree/b8d050f24f2e1c465c4410eace8634ea3af15930)。\n\n主会话及子代理实际采用研究问题、方法、书目、核验、综合、报告、反方、编辑和诚信角色规范。[verify-citations.py](scripts/verify-citations.py)调用未改写的原始 SemanticScholarClient 与 CrossrefClient，不是匹配测试桩。\n\n这是Codex分阶段适配，未运行Claude原生hooks/Task、完整Material Passport与机器诚信闸门，不声称原生full pipeline完整复现或PASS。角色分工不代表独立专家共识；没有同模型有/无技能对照，不能量化准确率或效率收益。详见[执行约定](research/execution-contract.md)。\n\n## 先看我们的过程\n\n本轮展示进一步改为过程主线：任务输入 → 采用规则 → 实际动作 → 真实例子 → 产物 → 判断变化 → 失败与处理。新增[过程导览](research/process-walkthrough.md)及[过程结构化数据](research/process-walkthrough.json)，区分Skill原始规范、AI/主会话适配与程序动作。任务委派仅是依据产物整理的摘要，不冒充逐字提示词日志；本轮展示调整未新增科学检索或重跑API。\n\n## 网页与运行\n\n新增[Skill拆解](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/#skill-map)：固定版本5个顶层Skill、13个内部角色与工具/宿主分开解释；5个搜索步骤、6组来源和工具、8项漏检或误读检查、6种场景用法。每项区分原始规范、代码实现与本轮实际状态，并链接固定提交文件或执行记录。详见[拆解报告](research/skill-mechanism-audit.md)和[数据](research/skill-mechanism-audit.json)。\n\n这轮补充仅审计固定源码和已有执行产物，没有新增科学检索、重跑API或执行未使用的Skill。目录清点包含保留ZIP中的sr-screener；本轮没有安装或运行它。原始目录审计与搜索审计分别见[skill-catalog-audit.json](research/skill-catalog-audit.json)、[search-mechanism-audit.json](research/search-mechanism-audit.json)。\n\n静态HTML/CSS/JS，无第三方前端依赖。支持理解总览、来源使用状态筛选、信息图查看下载、Skill拆解标签页、检索归属对照、文献关键词/角色/读取深度筛选、论文详情、判断到来源、步骤展开、方向比较和42份文件下载（包括三个新增采集器源码）。\n\n从总库根目录运行：\n\n    npm.cmd --prefix projects/012-aquatic-toxicology-skill-lab run build:data\n    npm.cmd --prefix projects/012-aquatic-toxicology-skill-lab run check\n    npm.cmd --prefix projects/012-aquatic-toxicology-skill-lab run serve\n\n访问 http://127.0.0.1:4332/ 。入口为[app/index.html](app/index.html)。离线JS与HTTP JSON保持一致；浏览器实测仅HTTP，内置浏览器不允许file协议，未声称离线浏览器已验证。已通过GitHub Pages发布并验证，详见[部署记录](research/deployment.md)。\n\n本地完整检查覆盖ID/DOI、来源角色/读取范围、证据关联、下载、12条核验记录、1106份上游哈希和JS语法/数据一致性。公开副本/CI运行 `npm run check:public`，只读已提交网页数据，检查归属、计数、资源、图片字节与语法。完整 `check` 与 `build:data` 需要本地保留的原始资料；公开仓库不含这些原始响应，不能声称克隆后能完整重建历史采集。检查不等于科学准确率验证。浏览器证据见[validation](research/validation)。\n\n## 研究文件\n\n| 阶段 | 文件 |\n|---|---|\n| 范围 | [问题](research/phase1_scoping/rq-brief.md)、[方法](research/phase1_scoping/methodology.md)、[范围审查](research/phase1_scoping/checkpoint1-review.md) |\n| 调查 | [书目](research/phase2_investigation/bibliography.md)、[日志](research/phase2_investigation/search-log.json)、[来源](research/phase2_investigation/source-verification.md)、[最终API](research/phase2_investigation/programmatic-verification-summary.md) |\n| 综合 | [矩阵与张力](research/phase3_analysis/synthesis.md) |\n| 修订 | [草稿](research/phase4_draft/report.md)、[审查复核](research/phase5_review/review.md)、[首轮历史报告](research/phase6_final/report.md) |\n| 网页数据 | [JSON](app/data/research.json)、[CSV](app/data/evidence.csv) |\n\n## 许可与图片\n\n上游为[CC BY-NC 4.0](app/data/upstream-LICENSE.txt)，保留作者Cheng-I Wu署名，当前用于非商业研究。文献只展示题录、链接、短转述和定位，不批量镜像正文。配图见[图片说明](assets/images/README.md)。源码提交和站点只包含公开摘要、方案、筛选结果、哈希/请求回执、我们编写的代码与生成图；含完整论文摘要的原始批量响应、筛选输入以及上游镜像/ZIP保留在本地，不纳入提交。\n\n本次已按用户要求部署GitHub Pages并推送远端main；总库摘要和首屏说明能力、5个Skill、使用场景及价值，引导图沿用生成原图。没有清理磁盘或访问ReflectFlow数据。\n\n",
      "passages": [
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 012 · 学术研究 Skill：能力、场景与水生毒理学实测"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "研究 [academic-research-skills](https://github.com/Imbad0202/academic-research-skills) 如何把拆题、检索、来源核验、综合、写作与审查组织成可执行流程。原理是规则文件与角色分工由AI结合外部工具落实；价值在于复用研究规范和检查要求，让过程与判断可追溯，尚未证明相对直接问AI的准确率、查全率或效率增益。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "适用于选题探索、综述与前作调查、证据核验、已有材料整理成稿、论文修订、审稿准备和阶段交接。以“微/纳塑料—PFAS—斑马鱼共暴露”为适配案例展示完整过程；课题由AI从宽泛领域中收窄，尚非作者确认的论文题目，没有新增实验。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 7,
          "endLine": 13,
          "text": "| Skill | 主要能力 | 本例采用程度 |\n|---|---|---|\n| deep-research | 拆题、方法、检索核验与证据综合 | 采用多个角色规范并适配，未完整执行原生流程 |\n| sr-screener | 已有文献记录的题名摘要/全文筛选 | 未安装、未运行 |\n| academic-paper | 依据证据组织论文和修订材料 | 已安装并选读规范，未完整运行 |\n| academic-paper-reviewer | 稿件审查、修改建议与再审 | 已安装并选读准则，未运行完整面板 |\n| academic-pipeline | 阶段判断、技能调度与交接检查 | 已安装，未运行原生完整调度 |"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 15,
          "endLine": 15,
          "text": "![我们生成的研究Skill能力与过程引导图](assets/images/understanding-map.png)"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 17,
          "endLine": 17,
          "text": "[总索引](../../README.md) · [在线研究网页](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/) · [首轮历史报告](research/phase6_final/report.md) · [实际过程](research/process.md)"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 19,
          "endLine": 19,
          "text": "![实际网页桌面截图](assets/images/process-walkthrough.jpg)"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 21,
          "endLine": 21,
          "text": "## 最新研究结果：17条候选的后续阅读"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 23,
          "endLine": 23,
          "text": "[直接打开最新结果](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/#round2-results) · [更新研究报告](research/round2/report.md) · [执行协议](research/round2/protocol.md) · [阅读矩阵CSV](app/data/round2-evidence.csv) · [审查与修订](research/round2/review.md)"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 25,
          "endLine": 25,
          "text": "17条候选已逐条复核：9条首轮重合、8条新增；实际读取为期刊主文全文1条、章节/图注6条、摘要10条。14条直接共暴露记录、1条多污染物情境、2条学位论文补充，不等同17项独立实验。未取得全文、统计和实验单位未知项逐条列出。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 27,
          "endLine": 27,
          "text": "更新综合纳入更早PFOS/F-53B前作、终点限定的不显著/未放大结果、生态冠已有研究和PINK1干预模型定位（细胞过表达、整鱼MTK458药理处理）。不显著不证明安全，图注不替代全部方法，队列独立性与正式协同仍待核。首轮报告、结论及阅读范围作为历史对照保留；首屏和侧栏优先进入最新结果。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 29,
          "endLine": 29,
          "text": "三个阅读任务、定点内容审查和实现审查均为同模型家族适配，不是独立专家或原生全流程。原始阅读副本被Git忽略；公开自己转述、原文定位、访问日志及输入哈希。新增五份公开下载；检索阶段42份下载保持原样。构建最新结果运行 `npm run build:round2`，公开验证运行 `npm run check:public`。完整 `build:data` 仍需本地历史原始产物，随后也会构建第二轮阅读结果。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 31,
          "endLine": 31,
          "text": "## 我们的理解总览"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 33,
          "endLine": 33,
          "text": "[打开理解总览网页](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/#understanding) · [总结说明](research/understanding-summary.md) · [结构化总结](research/understanding-summary.json) · [总览图 PNG](app/assets/understanding-map.png) · [生成及修订提示词](research/understanding-image-prompt.md)"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "总结库的能力、原理和价值主张，分清原库规则/代码、本轮新增采集器/测试与后续建议。按拆题、拟词选源、取回、筛选、补漏、分析六步解释输入、动作、产物和检查点；11类来源分别说明用途、获取权限、处理方式与实际使用状态。只有PubMed、Europe PMC、OpenAlex属于第二轮API实测；原文/OECD首轮部分阅读与其他来源建议分开标明。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 37,
          "endLine": 37,
          "text": "信息图使用内置image_gen生成并修订，1536×1024；是本案例的理解说明，非原库官方架构图或科学可靠性认证。图中PubMed以Search概括，精确接口为ESearch→EFetch。984条与3/5→5/5仍为组合方案和已见样本修复，不证明原Skill单独增益。此轮只汇总既有研究和核对官方获取说明，没有重跑科研检索或新增全文审读。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 39,
          "endLine": 39,
          "text": "## 检索单独实测（第二轮）"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 41,
          "endLine": 41,
          "text": "[打开检索实测网页](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/#retrieval-trial) · [过程与验证报告](research/retrieval-trial/report.md) · [冻结方案](research/retrieval-trial/query-plan.json) · [实际请求与原始产物](research/retrieval-trial/)"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 43,
          "endLine": 43,
          "text": "![检索实测的实际网页](assets/images/retrieval-trial.jpg)"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 45,
          "endLine": 45,
          "text": "沿用斑马鱼 × 微/纳塑料 × PFAS，按真实bibliography规范冻结概念块、检索式、筛选规则和验证方案，再用本轮新增API采集器执行。没有将新增适配器冒称原库自带功能。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 47,
          "endLine": 47,
          "text": "**检索能力归属：三个采集脚本均为本案例新写。** 原库提供检索/筛选规范、引文身份核验客户端，以及本例未运行的另一套四源主题发现代码；本轮的领域词表、三源采集器、基准、漏检修复和网页为额外适配。第一轮实际调用了未改写的原S2/Crossref客户端；本轮OpenAlex采集器没有调用原OpenAlexClient。[归属逐项审计](research/retrieval-ownership-audit.md)附固定提交链接及ZIP比对证据。984条候选与3/5→5/5是组合结果，未证明原Skill单独贡献或相对直接问AI的增益。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 49,
          "endLine": 56,
          "text": "| 来源/检查 | 实际结果 |\n|---|---|\n| PubMed原生E-utilities | 原式17/17；词汇修订19/19 |\n| Europe PMC REST | 原式18/18；去物种块580/580；词汇修订20/20。与PubMed高度重叠 |\n| OpenAlex主题检索 | V1 HTTP400；独立语法修订后32/32 |\n| 4种子一跳引文追踪 | 6/8方向完整；一方向连接失败，另一后向35/36 |\n| 独立综述派生基准 | 原生主检索3/5；加图4/5；词汇修订后5/5 |\n| 筛选 | 合并984条，保留17、排除916、待定51；包括程序预筛、主代理定点判断、89条独立AI复核及243条新增OpenAlex候选定点筛选 |"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 58,
          "endLine": 58,
          "text": "检索遗漏实际来自F53B无连字符写法、Cl-PFAES、PFCs旧称和perfluoro*/polyfluoro*截断不当；原始成绩、诊断、修订和重跑分别留痕。5篇基准已用于修复，修订5/5不是新的未见验证或全领域召回率。保留17是阅读候选；其中8条上一轮未收录，含学位论文和潜在实验重叠，不等于8项独立新实验。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 60,
          "endLine": 60,
          "text": "复核发现本轮新解析器误删数学比较号之间的文字，影响22条记录；从保留的原始JSON重建，保存前后版本/hash。另保留2项筛选分歧与裁决、多物种处理臂对应不足的待定项、无摘要项和引用访问盲区。年份/期刊分布按已知字段统计；方法与地域没有足够提取数据，未编造评估。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 62,
          "endLine": 62,
          "text": "采集脚本为[scripts/retrieve-pubmed.py](scripts/retrieve-pubmed.py)、[retrieve-europepmc.py](scripts/retrieve-europepmc.py)、[retrieve-openalex.py](scripts/retrieve-openalex.py)。它们只有显式运行时才联网；`build:data`只读已保存产物。新一轮复跑请使用新的输出子目录/方案，保留本轮冻结快照。没有本轮新增核心全文审读、科学准确率测试或无Skill对照。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 64,
          "endLine": 64,
          "text": "## 实际完成（第一轮历史记录）"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 66,
          "endLine": 66,
          "text": "10篇核心、2篇分开的背景、2份OECD方法资料；37条正式网页查询、5条主会话补查、15个实际遇到的排除候选。它们不是完整数据库命中数或系统筛选分母。原始客户端实时核验12篇：Crossref DOI/题名匹配12条；Semantic Scholar匹配P03/P09两条，10条429限流。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 68,
          "endLine": 68,
          "text": "输出文献矩阵、6条判断及来源关联、3对待研究者确认的跨论文张力、3类待查方向。5项角色复核问题已修改并定点回查。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 70,
          "endLine": 70,
          "text": "**首轮核心读取范围：8篇摘要、2篇章节片段、0篇全文审读。** 主要结论旁直接显示；不由摘要补造全文方法、统计、原始数据或创新性。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 72,
          "endLine": 72,
          "text": "## 实质结果"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 74,
          "endLine": 74,
          "text": "[P03](https://doi.org/10.1016/j.watres.2025.124658)报告胚胎/仔鱼条件的不同方向，限制“一律增强”叙事，也使“首次研究阶段转换或TK/TD”不能直接作创新依据。[P05](https://doi.org/10.1016/j.etap.2025.104907)与[P09](https://doi.org/10.1016/j.aquatox.2025.107534)提供器官/时间相关标签，正式交互模型和队列独立性仍待核。[P10](https://doi.org/10.1016/j.envint.2026.110102)有功能干预线索，但鱼/细胞救援归属未明，不能转为整鱼因果证明。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 76,
          "endLine": 76,
          "text": "下一步优先取得关键全文与补充材料，核对模型、对照、实验单位和队列，再结合实际污染物、物种、仪器与预算确定课题。候选方向未获原创认证，不合并效应量或推导人群风险。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 78,
          "endLine": 78,
          "text": "## 技能来源、版本及执行环境"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 80,
          "endLine": 80,
          "text": "源库：[Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills)。固定提交：[b8d050f24f2e1c465c4410eace8634ea3af15930](https://github.com/Imbad0202/academic-research-skills/commit/b8d050f24f2e1c465c4410eace8634ea3af15930)；suite发布标识3.24.0，deep-research 2.12.1；2026-10-29获取。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 82,
          "endLine": 82,
          "text": "使用系统 skill-installer 获取4个原始技能目录，补齐同提交 shared/scripts/docs 与许可，保留源ZIP和[1106份文件哈希](research/upstream-manifest.json)，没有嵌套.git。原始镜像与ZIP保留在本地；远端原文见[固定提交源码](https://github.com/Imbad0202/academic-research-skills/tree/b8d050f24f2e1c465c4410eace8634ea3af15930)。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 84,
          "endLine": 84,
          "text": "主会话及子代理实际采用研究问题、方法、书目、核验、综合、报告、反方、编辑和诚信角色规范。[verify-citations.py](scripts/verify-citations.py)调用未改写的原始 SemanticScholarClient 与 CrossrefClient，不是匹配测试桩。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 86,
          "endLine": 86,
          "text": "这是Codex分阶段适配，未运行Claude原生hooks/Task、完整Material Passport与机器诚信闸门，不声称原生full pipeline完整复现或PASS。角色分工不代表独立专家共识；没有同模型有/无技能对照，不能量化准确率或效率收益。详见[执行约定](research/execution-contract.md)。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 88,
          "endLine": 88,
          "text": "## 先看我们的过程"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 90,
          "endLine": 90,
          "text": "本轮展示进一步改为过程主线：任务输入 → 采用规则 → 实际动作 → 真实例子 → 产物 → 判断变化 → 失败与处理。新增[过程导览](research/process-walkthrough.md)及[过程结构化数据](research/process-walkthrough.json)，区分Skill原始规范、AI/主会话适配与程序动作。任务委派仅是依据产物整理的摘要，不冒充逐字提示词日志；本轮展示调整未新增科学检索或重跑API。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 92,
          "endLine": 92,
          "text": "## 网页与运行"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 94,
          "endLine": 94,
          "text": "新增[Skill拆解](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/#skill-map)：固定版本5个顶层Skill、13个内部角色与工具/宿主分开解释；5个搜索步骤、6组来源和工具、8项漏检或误读检查、6种场景用法。每项区分原始规范、代码实现与本轮实际状态，并链接固定提交文件或执行记录。详见[拆解报告](research/skill-mechanism-audit.md)和[数据](research/skill-mechanism-audit.json)。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 96,
          "endLine": 96,
          "text": "这轮补充仅审计固定源码和已有执行产物，没有新增科学检索、重跑API或执行未使用的Skill。目录清点包含保留ZIP中的sr-screener；本轮没有安装或运行它。原始目录审计与搜索审计分别见[skill-catalog-audit.json](research/skill-catalog-audit.json)、[search-mechanism-audit.json](research/search-mechanism-audit.json)。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 98,
          "endLine": 98,
          "text": "静态HTML/CSS/JS，无第三方前端依赖。支持理解总览、来源使用状态筛选、信息图查看下载、Skill拆解标签页、检索归属对照、文献关键词/角色/读取深度筛选、论文详情、判断到来源、步骤展开、方向比较和42份文件下载（包括三个新增采集器源码）。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 100,
          "endLine": 100,
          "text": "从总库根目录运行："
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 102,
          "endLine": 104,
          "text": "    npm.cmd --prefix projects/012-aquatic-toxicology-skill-lab run build:data\n    npm.cmd --prefix projects/012-aquatic-toxicology-skill-lab run check\n    npm.cmd --prefix projects/012-aquatic-toxicology-skill-lab run serve"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 106,
          "endLine": 106,
          "text": "访问 http://127.0.0.1:4332/ 。入口为[app/index.html](app/index.html)。离线JS与HTTP JSON保持一致；浏览器实测仅HTTP，内置浏览器不允许file协议，未声称离线浏览器已验证。已通过GitHub Pages发布并验证，详见[部署记录](research/deployment.md)。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 108,
          "endLine": 108,
          "text": "本地完整检查覆盖ID/DOI、来源角色/读取范围、证据关联、下载、12条核验记录、1106份上游哈希和JS语法/数据一致性。公开副本/CI运行 `npm run check:public`，只读已提交网页数据，检查归属、计数、资源、图片字节与语法。完整 `check` 与 `build:data` 需要本地保留的原始资料；公开仓库不含这些原始响应，不能声称克隆后能完整重建历史采集。检查不等于科学准确率验证。浏览器证据见[validation](research/validation)。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 110,
          "endLine": 110,
          "text": "## 研究文件"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 112,
          "endLine": 118,
          "text": "| 阶段 | 文件 |\n|---|---|\n| 范围 | [问题](research/phase1_scoping/rq-brief.md)、[方法](research/phase1_scoping/methodology.md)、[范围审查](research/phase1_scoping/checkpoint1-review.md) |\n| 调查 | [书目](research/phase2_investigation/bibliography.md)、[日志](research/phase2_investigation/search-log.json)、[来源](research/phase2_investigation/source-verification.md)、[最终API](research/phase2_investigation/programmatic-verification-summary.md) |\n| 综合 | [矩阵与张力](research/phase3_analysis/synthesis.md) |\n| 修订 | [草稿](research/phase4_draft/report.md)、[审查复核](research/phase5_review/review.md)、[首轮历史报告](research/phase6_final/report.md) |\n| 网页数据 | [JSON](app/data/research.json)、[CSV](app/data/evidence.csv) |"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 120,
          "endLine": 120,
          "text": "## 许可与图片"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 122,
          "endLine": 122,
          "text": "上游为[CC BY-NC 4.0](app/data/upstream-LICENSE.txt)，保留作者Cheng-I Wu署名，当前用于非商业研究。文献只展示题录、链接、短转述和定位，不批量镜像正文。配图见[图片说明](assets/images/README.md)。源码提交和站点只包含公开摘要、方案、筛选结果、哈希/请求回执、我们编写的代码与生成图；含完整论文摘要的原始批量响应、筛选输入以及上游镜像/ZIP保留在本地，不纳入提交。"
        },
        {
          "path": "projects/012-aquatic-toxicology-skill-lab/README.md",
          "startLine": 124,
          "endLine": 124,
          "text": "本次已按用户要求部署GitHub Pages并推送远端main；总库摘要和首屏说明能力、5个Skill、使用场景及价值，引导图沿用生成原图。没有清理磁盘或访问ReflectFlow数据。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 204,
        "endLine": 220,
        "text": "    {\n      \"id\": \"012\",\n      \"slug\": \"aquatic-toxicology-skill-lab\",\n      \"name\": \"学术研究 Skill · 能力与水生毒理学实测\",\n      \"summary\": \"以水生毒理学试题走一遍拆题、检索、文献筛选和证据分析，比较五种学术研究流程。公开报告、筛选表和核验记录，检索查全率与实际增益待验证。\",\n      \"source\": \"https://github.com/Imbad0202/academic-research-skills\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"水生毒理学\",\n        \"学术研究\",\n        \"Skill实测\",\n        \"证据综合\"\n      ],\n      \"cover\": \"assets/images/understanding-map.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/\",\n      \"createdAt\": \"2026-10-29\"\n    },"
      }
    },
    {
      "id": "013",
      "slug": "scenic-motion-lab",
      "name": "景观奇旅 · AI影像创作实验室",
      "summary": "观看 11.04 秒海湾骑行试片和两段原片，追踪首图、角色动作、运镜、环境响应与接缝。总结了可复用的导演方法，长片连续性待验证。",
      "source": "https://x.com/hi_personality/status/2115567493565825244",
      "status": "researching",
      "tags": [
        "AI影像",
        "景观叙事",
        "图生视频",
        "运镜设计",
        "创作实验"
      ],
      "createdAt": "2026-10-31",
      "readmePath": "projects/013-scenic-motion-lab/README.md",
      "readmeSha256": "e81d21a79271e817b1167daaacad71357b84cca619ea896b5a871933e6edd0e9",
      "readmeText": "# 013 · 景观奇旅 · AI 影像创作实验室\n\n从一条奇幻海湾骑行参考出发，记录我们如何从“让漂亮图片动起来”，转向设计摄影路径、人物行动、景观揭示和完整结尾。这里展示实际试验、效果偏差与可复用方法，也收录七个新方向。其中《悬崖长卷》已完成11.041667秒、由两条真实源片拼接的实测；接缝仍有轻微重绘，其余六项尚未生成视频。\n\n[返回总索引](../../README.md#项目索引) · [详细研究记录](research/notes.md) · [参考原作](https://x.com/hi_personality/status/2115567493565825244)\n\n| 项目 | 内容 |\n| --- | --- |\n| 编号 / 收录日期 | 013 / 2026-10-31 |\n| 项目性质 | 原创研究网页；没有上游源码仓库或可对应的 commit/tag |\n| 研究对象 | Personality（@hi_personality）的《grassland special》及本轮个人生成试验 |\n| 当前状态 | researching；网页已发布，创作方法继续验证 |\n| 当前拼接实测 | 《悬崖长卷》，11.041667 秒，1280 × 720，24 fps；两条源片于5.000秒硬切 |\n| 历史完整试验 | 《越过山脊，看见海湾》，8.375 秒，1280 × 720，24 fps；继续保留 |\n| 新方向状态 | 七个概念图已归档；悬崖长卷已做双片拼接，接地、匀距与接缝仍有偏差；其余六项视频未生成 |\n| 在线演示 | [完整研究与试片](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/) · [生成引导图](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/overview.html) |\n\n## 这次研究回答什么\n\n- 为什么同样有蓝天、海湾、奇幻建筑与骑车人，生成结果仍像一张在动的壁纸？\n- 如何用接近、追随、转弯和近远视差，让相机真正带观众穿行空间？\n- 如何让一次动作揭示新景观，并包含发生、落地和继续前行？\n- 哪些效果来自生成，哪些来自剪辑变速，哪些仍然没有做好？\n\n页面包含参考分析、沟通过程、试验对照、创作原则、可复制提示词、验收标准与七个新方向。四个通用模板是研究后新整理的内容；A/B 的历史实际提示词可在影片参数中查看，七张新图的实际指令可在“首图”标签页折叠区查看、复制，数据分别保存在 `app/data/execution.js` 和 `app/data/concept-generation.js`。\n\n## 已经得到的结论\n\n**美景是主舞台，人物负责带路，动作应该换来新的观看收获。** 骑行、跳跃、蓝绿橙配色、HDR、60 fps 或某个视频模型都是可选手段，不是这类作品的固定配方。\n\n最初的固定广角、低运动方案保护了构图，也限制了摄影路径。随后提高到 1080p 增加了清晰度，但没有自动修正镜头与动作。取得完整参考后，对约 6.97 秒、60 fps 的时间过程做分析，才明确了接近主体、地形遮挡、追随转向与近远视差的作用。\n\n此前的完整跃岭试验使用两段 Seedance 2.0 视频，按实际动作重新剪接：A 已自行完成起跳和落地，因此舍弃 B 开头重复的腾空与落地；A 腾空中段做了 2× 变速，最终在约 4.083 秒处明确换机位。成片有可辨认的“接近—跃起—景观打开—落地—继续前行”，但仍有地理与色调跳变、跳得过高、起跳蓄力与落地吸震不足等问题。它是研究样片，不是精确物理控制的证明。\n\n随后《悬崖长卷》用两条 Kling 4.0 源片验证至少10秒的真实拼接：A的真实末帧作为B首图，最终取A前5秒与B全部6.041667秒，在5.000秒硬切。人物、脚踏相位和主要地理基本承接，但共享边界图仍不保证相同速度或完全相同的下一帧；接点有轻微重绘，B后段明显拉远。这个结果验证了本次双片制作与接缝审查流程，不代表原10秒分镜每项都精确达成。\n\n## 理解、价值与能力\n\n网页新增[理解与能力总结](app/index.html#understanding)，引导页继续使用专门生成的 [overview-v1.png](assets/images/overview-v1.png)，保留原图并在旁边补充11秒进展。动态奇观由世界与首图、人物行动、摄影路径、环境响应、时间剪辑、审查迭代共同构成；图生视频生成时序画面，并不意味着已经重建可交互3D世界。\n\n当前做到的是图像到动作／摄影，再到真实双片拼接、接缝检查和证据归档。价值在景观探索体验与可复用导演方法；漂亮图、模型版本和分辨率都不自动保证效果。首尾接力仍需检查姿态、脚踏、速度、路线与光色，不能称精确骨骼或路径控制、自动长片系统或通用模型排名。\n\n近期可试验系列景观旅程和品牌／文旅概念样片；动作摄影模板与首尾接力已有手工方法，仍待产品化；互动创作工作台是待建假设。这些方向需要分别验证体验、可复用性和修正效率，不是已上线商业成品，也不承诺收益。主站提供简明连续性方法、失败信号，以及首图／视频提示词骨架，再链接到完整流程和可复制模板。\n\n## 参考与证据边界\n\n作者在[回复中确认了 DaVinci Resolve 的调色与 HDR 处理](https://x.com/hi_personality/status/2115573454628106332)。本片具体的视频生成模型、ComfyUI 节点和完整流程未知；作者另一条旧视频提到 ComfyUI，不能据此认定这条片也使用同一流程。HDR 也不能简单等同于高饱和度。\n\n本轮完整原视频用于人工分析。我们实际向生成服务提供的是图片与文字；不能声称模型看过或复刻了完整原片。首尾图表达目标状态，实际成片仍可能偏离。CLI 按首尾模式构造并提交，后续服务端存储核对因网络错误未完成，因此不推断模型内部如何解释输入。\n\n## 一图理解\n\n[打开本地长图阅读页](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/overview.html) · [PNG 原图](assets/images/overview-v1.png) · [实际生成与校正记录](research/overview-v1-generation.json)\n\n总览图串起核心理解、图像与文字条件生成视频的工作流程、视差与身体接触等可信依据、本轮实测、七个创意和四类产品假设。图中的实测流程画面是依据本轮素材的视觉示意，不冒充逐帧原件；四类产品尚未做产品与商业验证。\n\n长图由内置 image_gen 生成，并定向校正了实测流程缩略图。原图实际为 1024 × 1536；网页 WebP 仅作无损编码，解码像素与 PNG 一致。长图保留为首轮研究快照；此后新增的运动短样以最新影片目录和制作记录为准。原作者具体模型仍未知。\n\n## 悬崖长卷 · 11秒双片拼接实测\n\n[观看当前拼接版](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/?film=coastal-scroll-splice-v1#screening) · [制作设计](research/coastal-scroll-splice-v1-design.json) · [实际剪辑记录](research/coastal-scroll-splice-v1-edit.json) · [实际接缝对照](assets/images/coastal-scroll-splice-v1/actual-seam.jpg)\n\n两条源片均为Kling 4.0、720p档原生1284×724、24fps。A任务1044781原有121帧；第120帧作为B任务1044794的实际首图，交付中从A剪除这帧，以免相似边界姿态重复。成片取A第0–119帧（5秒）与B第0–144帧（6.041667秒），共265帧、11.041667秒，在5.000秒真实硬切；两源仅归一至1280×720，没有循环、定格、变速或溶解。\n\n接缝前后人物位置、尺度、朝向和脚踏相位基本承接，未见明显动作倒回或地理跳位；人物与花草仍有轻微重绘、柔化。A仍略微靠近，B后段明显拉远并把注意力留给海湾，不能称严格匀距、精确速度匹配或完全无缝。B确认实际180积分，A最终费用未知，实际总额不补推。音频未听验，数值检查不等于听觉通过。B原件与结果见[B交付记录](research/coastal-scroll-kling4-b-v1-delivery.json)，声音检查范围见[音频记录](research/coastal-scroll-splice-v1-audio-check.json)。\n\n## 悬崖长卷 · 历史5秒模型对照\n\n[观看 Seedance 2.0 对照](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/?film=coastal-scroll-seedance2-v1#screening) · [准确运动提示词](research/coastal-scroll-trial-v1-prompt.txt) · [设计与实际参数](research/coastal-scroll-trial-v1-design.json) · [交付与审片](research/coastal-scroll-seedance2-v1-delivery.json)\n\n[观看 Kling 4.0 新版](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/?film=coastal-scroll-kling4-v1#screening) · [新版交付与审片记录](research/coastal-scroll-kling4-v1-delivery.json)\n\nKling4.0新版也已交付：720p档原生输出实际1284×724，121帧、24fps、5.041667秒，保留原速与音轨。相较本次Seedance样片，人物尺度更稳定，近花石快移、远海岸慢移的视差可辨认，风景仍占主导；约0.75–2.5秒轮胎被花草遮挡，全程沿路接地尚未严验。网页预估150积分、提交后余额相应减少150；任务查询成本字段N/A，最终消耗仍未确认。声音未听验，两条具体样本也不能构成模型普遍排名。\n\n采用现有概念图作视觉参考，设计右向骑行、侧后方平行跟拍、近花石快移与远崖慢移。原片体现了横向跟拍和视差，但约0.25–1秒跨向路外花坡、0.5秒附近短暂浮起，机位也逐渐靠近；不能把“有5秒视频”写成完整方案已验收。原片保留原速，无剪辑、变速或插帧；视频轨121帧、24fps、5.041667秒，含音轨文件5.088秒，实际75积分。声音未听验。\n\n用户随后要求新版模型优先。当前官方自动生成工具的公开代码尚无Kling4.0/Seedance2.5注册项；因此从现有ChatArt网页核实新版、准备图片与准确指令，用户登录现有账户后提交任务1044781，并通过官方查询工具取回原片。过程见[新版模型执行记录](research/coastal-scroll-higher-model-plan.json)。原Seedance2.0和新版任务的漫长等待均不能当成生成失败，也不能把网页的新版入口等同于旧工具已支持。没有接入Runway、没有提交KlingV3或额外的Seedance2.5任务。\n\n## 本地运行\n\n需要 Node.js 22+ / npm 运行 `check`，以及 Python 3 提供 `serve` 的静态服务。从研究总库根目录进入本项目运行：\n\n```powershell\ncd projects/013-scenic-motion-lab\nnpm run serve\n```\n\n本地入口为 [http://localhost:4333](http://localhost:4333)，静态站点根目录是 `app/`。这是本机预览地址，不是公开演示。\n\n验证项目与外层索引：\n\n```powershell\n# 本项目目录\nnpm run check\n\n# 外层研究总库\ncd ../..\nnpm run check\n```\n\n`check` 验证网页及资料组织，不替代对视频动作、画面连续性和声音的审查。首轮浏览器实测已覆盖播放、筛选、搜索、复制、下载、深链接与键盘交互；七张概念图均正常加载为 1672 × 941，390 和 1280 像素视口无横向溢出，未发现新的控制台错误。首轮完整研究 JSON 导出验证包含当时的概念、视频及概念图实际生成指令；后续短样和拼接版继续纳入当前目录，历史检查范围见[本地验证记录](research/local-verification.json)。\n\n## 文件与素材说明\n\n| 位置 | 用途 |\n| --- | --- |\n| `app/` | 本地研究网页与展示素材 |\n| `app/data/research.js` | 研究原则、沟通过程、方法、模板、验收和来源信息 |\n| `app/data/execution.js`、`app/data/concept-generation.js` | 历史视频实际指令与七张新图实际生成指令 |\n| `app/data/media.js` | 媒体目录、逐图观察与限制 |\n| `research/notes.md` | 事实、判断、试验参数、偏差与证据位置 |\n| `assets/images/concepts-source/`、`app/assets/images/concepts/` | 七张概念图的原始 PNG 与网页 WebP |\n| `assets/images/local-review/` | 浏览器实测截图、概念图分析排版、视频时间线与密集审片图 |\n| `research/media-provenance.json` | 素材来源、哈希与派生记录，包括封面；以当前清单为准 |\n\n七个方向已完成概念图原件归档、静态检查和网页显示核对，逐图限制见 `app/data/media.js`。《悬崖长卷》已从5秒单片对照推进到11.041667秒双片拼接实测，仍保留接地、匀距与接缝限制；其余六项尚未生成视频。概念图可能已经展示高潮，后续视频起始帧需按各方向的起始状态另行制作或确认。季节门的图像与后续脚本已统一为“早夏 → 薄雪冬季”，旧版本差异保留在 [seasonal-design-revision.json](research/seasonal-design-revision.json)。首轮浏览器截图与概念图分析排版已归档，后续短样和拼接证据另行追加；分析排版不是浏览器截图，也不是新一次 AI 生成。素材职责详见[图片说明](assets/images/README.md)。\n\n## 来源与授权\n\n- **研究文字与网页实现**：本项目原创整理，没有上游源码许可证可沿用；本项目未在此另行授予素材或代码许可。\n- **原作视频及其分析帧**：来源为 [@hi_personality 原帖](https://x.com/hi_personality/status/2115567493565825244)，权利归原权利人。公开可访问不等于获准再分发或商用；分析帧保留原作署名与来源，完整原视频通过原帖访问；原作的制作工程和再分发许可均未取得。\n- **本轮生成图像与视频**：来自会话内的图像生成工具与 ChatArt / Seedance、Kling 试验。保留原件、任务记录和派生关系；适用服务条款、素材输入权利与发布用途需分别核对，不能直接继承参考视频的授权。\n- **本地记忆**：创作准则已整理为“景观驱动的动态奇观”；本网页将其展开为可理解、可审查的方法，动作控制和商业应用效果仍需后续实验验证。\n\n后续先修正当前样片的接地与接缝偏差，或选择其余方向的单一机制做短样，再决定是否提高分辨率或延长。网站已于2026-10-31发布并完成访问核验，发布产物与本地完整证据分别管理；见[发布与验收记录](research/deployment.md)。\n\n## 静态发布范围\n\n网站入口是`app/`中的静态HTML、CSS、JavaScript与展示素材，可通过编号子路径部署；引导入口为`overview.html`，使用现有生成总览图。正式部署遵循研究总库的部署约定。余额、提交及登录准备等服务界面证据仅留本地；公开副本的素材清单由发布流程过滤，不能把本地完整归档描述为全部公开。\n",
      "passages": [
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 013 · 景观奇旅 · AI 影像创作实验室"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "从一条奇幻海湾骑行参考出发，记录我们如何从“让漂亮图片动起来”，转向设计摄影路径、人物行动、景观揭示和完整结尾。这里展示实际试验、效果偏差与可复用方法，也收录七个新方向。其中《悬崖长卷》已完成11.041667秒、由两条真实源片拼接的实测；接缝仍有轻微重绘，其余六项尚未生成视频。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "[返回总索引](../../README.md#项目索引) · [详细研究记录](research/notes.md) · [参考原作](https://x.com/hi_personality/status/2115567493565825244)"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 7,
          "endLine": 14,
          "text": "| 项目 | 内容 |\n| --- | --- |\n| 编号 / 收录日期 | 013 / 2026-10-31 |\n| 项目性质 | 原创研究网页；没有上游源码仓库或可对应的 commit/tag |\n| 研究对象 | Personality（@hi_personality）的《grassland special》及本轮个人生成试验 |\n| 当前状态 | researching；网页已发布，创作方法继续验证 |\n| 当前拼接实测 | 《悬崖长卷》，11.041667 秒，1280 × 720，24 fps；两条源片于5.000秒硬切 |\n| 历史完整试验 | 《越过山脊，看见海湾》，8.375 秒，1280 × 720，24 fps；继续保留 |"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 15,
          "endLine": 16,
          "text": "| 新方向状态 | 七个概念图已归档；悬崖长卷已做双片拼接，接地、匀距与接缝仍有偏差；其余六项视频未生成 |\n| 在线演示 | [完整研究与试片](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/) · [生成引导图](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/overview.html) |"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 18,
          "endLine": 18,
          "text": "## 这次研究回答什么"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 20,
          "endLine": 23,
          "text": "- 为什么同样有蓝天、海湾、奇幻建筑与骑车人，生成结果仍像一张在动的壁纸？\n- 如何用接近、追随、转弯和近远视差，让相机真正带观众穿行空间？\n- 如何让一次动作揭示新景观，并包含发生、落地和继续前行？\n- 哪些效果来自生成，哪些来自剪辑变速，哪些仍然没有做好？"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 25,
          "endLine": 25,
          "text": "页面包含参考分析、沟通过程、试验对照、创作原则、可复制提示词、验收标准与七个新方向。四个通用模板是研究后新整理的内容；A/B 的历史实际提示词可在影片参数中查看，七张新图的实际指令可在“首图”标签页折叠区查看、复制，数据分别保存在 `app/data/execution.js` 和 `app/data/concept-generation.js`。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 27,
          "endLine": 27,
          "text": "## 已经得到的结论"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 29,
          "endLine": 29,
          "text": "**美景是主舞台，人物负责带路，动作应该换来新的观看收获。** 骑行、跳跃、蓝绿橙配色、HDR、60 fps 或某个视频模型都是可选手段，不是这类作品的固定配方。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 31,
          "endLine": 31,
          "text": "最初的固定广角、低运动方案保护了构图，也限制了摄影路径。随后提高到 1080p 增加了清晰度，但没有自动修正镜头与动作。取得完整参考后，对约 6.97 秒、60 fps 的时间过程做分析，才明确了接近主体、地形遮挡、追随转向与近远视差的作用。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 33,
          "endLine": 33,
          "text": "此前的完整跃岭试验使用两段 Seedance 2.0 视频，按实际动作重新剪接：A 已自行完成起跳和落地，因此舍弃 B 开头重复的腾空与落地；A 腾空中段做了 2× 变速，最终在约 4.083 秒处明确换机位。成片有可辨认的“接近—跃起—景观打开—落地—继续前行”，但仍有地理与色调跳变、跳得过高、起跳蓄力与落地吸震不足等问题。它是研究样片，不是精确物理控制的证明。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "随后《悬崖长卷》用两条 Kling 4.0 源片验证至少10秒的真实拼接：A的真实末帧作为B首图，最终取A前5秒与B全部6.041667秒，在5.000秒硬切。人物、脚踏相位和主要地理基本承接，但共享边界图仍不保证相同速度或完全相同的下一帧；接点有轻微重绘，B后段明显拉远。这个结果验证了本次双片制作与接缝审查流程，不代表原10秒分镜每项都精确达成。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 37,
          "endLine": 37,
          "text": "## 理解、价值与能力"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 39,
          "endLine": 39,
          "text": "网页新增[理解与能力总结](app/index.html#understanding)，引导页继续使用专门生成的 [overview-v1.png](assets/images/overview-v1.png)，保留原图并在旁边补充11秒进展。动态奇观由世界与首图、人物行动、摄影路径、环境响应、时间剪辑、审查迭代共同构成；图生视频生成时序画面，并不意味着已经重建可交互3D世界。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 41,
          "endLine": 41,
          "text": "当前做到的是图像到动作／摄影，再到真实双片拼接、接缝检查和证据归档。价值在景观探索体验与可复用导演方法；漂亮图、模型版本和分辨率都不自动保证效果。首尾接力仍需检查姿态、脚踏、速度、路线与光色，不能称精确骨骼或路径控制、自动长片系统或通用模型排名。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 43,
          "endLine": 43,
          "text": "近期可试验系列景观旅程和品牌／文旅概念样片；动作摄影模板与首尾接力已有手工方法，仍待产品化；互动创作工作台是待建假设。这些方向需要分别验证体验、可复用性和修正效率，不是已上线商业成品，也不承诺收益。主站提供简明连续性方法、失败信号，以及首图／视频提示词骨架，再链接到完整流程和可复制模板。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 45,
          "endLine": 45,
          "text": "## 参考与证据边界"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 47,
          "endLine": 47,
          "text": "作者在[回复中确认了 DaVinci Resolve 的调色与 HDR 处理](https://x.com/hi_personality/status/2115573454628106332)。本片具体的视频生成模型、ComfyUI 节点和完整流程未知；作者另一条旧视频提到 ComfyUI，不能据此认定这条片也使用同一流程。HDR 也不能简单等同于高饱和度。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 49,
          "endLine": 49,
          "text": "本轮完整原视频用于人工分析。我们实际向生成服务提供的是图片与文字；不能声称模型看过或复刻了完整原片。首尾图表达目标状态，实际成片仍可能偏离。CLI 按首尾模式构造并提交，后续服务端存储核对因网络错误未完成，因此不推断模型内部如何解释输入。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 51,
          "endLine": 51,
          "text": "## 一图理解"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 53,
          "endLine": 53,
          "text": "[打开本地长图阅读页](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/overview.html) · [PNG 原图](assets/images/overview-v1.png) · [实际生成与校正记录](research/overview-v1-generation.json)"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 55,
          "endLine": 55,
          "text": "总览图串起核心理解、图像与文字条件生成视频的工作流程、视差与身体接触等可信依据、本轮实测、七个创意和四类产品假设。图中的实测流程画面是依据本轮素材的视觉示意，不冒充逐帧原件；四类产品尚未做产品与商业验证。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 57,
          "endLine": 57,
          "text": "长图由内置 image_gen 生成，并定向校正了实测流程缩略图。原图实际为 1024 × 1536；网页 WebP 仅作无损编码，解码像素与 PNG 一致。长图保留为首轮研究快照；此后新增的运动短样以最新影片目录和制作记录为准。原作者具体模型仍未知。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 59,
          "endLine": 59,
          "text": "## 悬崖长卷 · 11秒双片拼接实测"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 61,
          "endLine": 61,
          "text": "[观看当前拼接版](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/?film=coastal-scroll-splice-v1#screening) · [制作设计](research/coastal-scroll-splice-v1-design.json) · [实际剪辑记录](research/coastal-scroll-splice-v1-edit.json) · [实际接缝对照](assets/images/coastal-scroll-splice-v1/actual-seam.jpg)"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 63,
          "endLine": 63,
          "text": "两条源片均为Kling 4.0、720p档原生1284×724、24fps。A任务1044781原有121帧；第120帧作为B任务1044794的实际首图，交付中从A剪除这帧，以免相似边界姿态重复。成片取A第0–119帧（5秒）与B第0–144帧（6.041667秒），共265帧、11.041667秒，在5.000秒真实硬切；两源仅归一至1280×720，没有循环、定格、变速或溶解。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 65,
          "endLine": 65,
          "text": "接缝前后人物位置、尺度、朝向和脚踏相位基本承接，未见明显动作倒回或地理跳位；人物与花草仍有轻微重绘、柔化。A仍略微靠近，B后段明显拉远并把注意力留给海湾，不能称严格匀距、精确速度匹配或完全无缝。B确认实际180积分，A最终费用未知，实际总额不补推。音频未听验，数值检查不等于听觉通过。B原件与结果见[B交付记录](research/coastal-scroll-kling4-b-v1-delivery.json)，声音检查范围见[音频记录](research/coastal-scroll-splice-v1-audio-check.json)。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 67,
          "endLine": 67,
          "text": "## 悬崖长卷 · 历史5秒模型对照"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 69,
          "endLine": 69,
          "text": "[观看 Seedance 2.0 对照](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/?film=coastal-scroll-seedance2-v1#screening) · [准确运动提示词](research/coastal-scroll-trial-v1-prompt.txt) · [设计与实际参数](research/coastal-scroll-trial-v1-design.json) · [交付与审片](research/coastal-scroll-seedance2-v1-delivery.json)"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 71,
          "endLine": 71,
          "text": "[观看 Kling 4.0 新版](https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/?film=coastal-scroll-kling4-v1#screening) · [新版交付与审片记录](research/coastal-scroll-kling4-v1-delivery.json)"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 73,
          "endLine": 73,
          "text": "Kling4.0新版也已交付：720p档原生输出实际1284×724，121帧、24fps、5.041667秒，保留原速与音轨。相较本次Seedance样片，人物尺度更稳定，近花石快移、远海岸慢移的视差可辨认，风景仍占主导；约0.75–2.5秒轮胎被花草遮挡，全程沿路接地尚未严验。网页预估150积分、提交后余额相应减少150；任务查询成本字段N/A，最终消耗仍未确认。声音未听验，两条具体样本也不能构成模型普遍排名。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 75,
          "endLine": 75,
          "text": "采用现有概念图作视觉参考，设计右向骑行、侧后方平行跟拍、近花石快移与远崖慢移。原片体现了横向跟拍和视差，但约0.25–1秒跨向路外花坡、0.5秒附近短暂浮起，机位也逐渐靠近；不能把“有5秒视频”写成完整方案已验收。原片保留原速，无剪辑、变速或插帧；视频轨121帧、24fps、5.041667秒，含音轨文件5.088秒，实际75积分。声音未听验。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 77,
          "endLine": 77,
          "text": "用户随后要求新版模型优先。当前官方自动生成工具的公开代码尚无Kling4.0/Seedance2.5注册项；因此从现有ChatArt网页核实新版、准备图片与准确指令，用户登录现有账户后提交任务1044781，并通过官方查询工具取回原片。过程见[新版模型执行记录](research/coastal-scroll-higher-model-plan.json)。原Seedance2.0和新版任务的漫长等待均不能当成生成失败，也不能把网页的新版入口等同于旧工具已支持。没有接入Runway、没有提交KlingV3或额外的Seedance2.5任务。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 79,
          "endLine": 79,
          "text": "## 本地运行"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 81,
          "endLine": 81,
          "text": "需要 Node.js 22+ / npm 运行 `check`，以及 Python 3 提供 `serve` 的静态服务。从研究总库根目录进入本项目运行："
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 83,
          "endLine": 86,
          "text": "```powershell\ncd projects/013-scenic-motion-lab\nnpm run serve\n```"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 88,
          "endLine": 88,
          "text": "本地入口为 [http://localhost:4333](http://localhost:4333)，静态站点根目录是 `app/`。这是本机预览地址，不是公开演示。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 90,
          "endLine": 90,
          "text": "验证项目与外层索引："
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 92,
          "endLine": 94,
          "text": "```powershell\n# 本项目目录\nnpm run check"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 96,
          "endLine": 99,
          "text": "# 外层研究总库\ncd ../..\nnpm run check\n```"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 101,
          "endLine": 101,
          "text": "`check` 验证网页及资料组织，不替代对视频动作、画面连续性和声音的审查。首轮浏览器实测已覆盖播放、筛选、搜索、复制、下载、深链接与键盘交互；七张概念图均正常加载为 1672 × 941，390 和 1280 像素视口无横向溢出，未发现新的控制台错误。首轮完整研究 JSON 导出验证包含当时的概念、视频及概念图实际生成指令；后续短样和拼接版继续纳入当前目录，历史检查范围见[本地验证记录](research/local-verification.json)。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 103,
          "endLine": 103,
          "text": "## 文件与素材说明"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 105,
          "endLine": 112,
          "text": "| 位置 | 用途 |\n| --- | --- |\n| `app/` | 本地研究网页与展示素材 |\n| `app/data/research.js` | 研究原则、沟通过程、方法、模板、验收和来源信息 |\n| `app/data/execution.js`、`app/data/concept-generation.js` | 历史视频实际指令与七张新图实际生成指令 |\n| `app/data/media.js` | 媒体目录、逐图观察与限制 |\n| `research/notes.md` | 事实、判断、试验参数、偏差与证据位置 |\n| `assets/images/concepts-source/`、`app/assets/images/concepts/` | 七张概念图的原始 PNG 与网页 WebP |"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 113,
          "endLine": 114,
          "text": "| `assets/images/local-review/` | 浏览器实测截图、概念图分析排版、视频时间线与密集审片图 |\n| `research/media-provenance.json` | 素材来源、哈希与派生记录，包括封面；以当前清单为准 |"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 116,
          "endLine": 116,
          "text": "七个方向已完成概念图原件归档、静态检查和网页显示核对，逐图限制见 `app/data/media.js`。《悬崖长卷》已从5秒单片对照推进到11.041667秒双片拼接实测，仍保留接地、匀距与接缝限制；其余六项尚未生成视频。概念图可能已经展示高潮，后续视频起始帧需按各方向的起始状态另行制作或确认。季节门的图像与后续脚本已统一为“早夏 → 薄雪冬季”，旧版本差异保留在 [seasonal-design-revision.json](research/seasonal-design-revision.json)。首轮浏览器截图与概念图分析排版已归档，后续短样和拼接证据另行追加；分析排版不是浏览器截图，也不是新一次 AI 生成。素材职责详见[图片说明](assets/images/README.md)。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 118,
          "endLine": 118,
          "text": "## 来源与授权"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 120,
          "endLine": 123,
          "text": "- **研究文字与网页实现**：本项目原创整理，没有上游源码许可证可沿用；本项目未在此另行授予素材或代码许可。\n- **原作视频及其分析帧**：来源为 [@hi_personality 原帖](https://x.com/hi_personality/status/2115567493565825244)，权利归原权利人。公开可访问不等于获准再分发或商用；分析帧保留原作署名与来源，完整原视频通过原帖访问；原作的制作工程和再分发许可均未取得。\n- **本轮生成图像与视频**：来自会话内的图像生成工具与 ChatArt / Seedance、Kling 试验。保留原件、任务记录和派生关系；适用服务条款、素材输入权利与发布用途需分别核对，不能直接继承参考视频的授权。\n- **本地记忆**：创作准则已整理为“景观驱动的动态奇观”；本网页将其展开为可理解、可审查的方法，动作控制和商业应用效果仍需后续实验验证。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 125,
          "endLine": 125,
          "text": "后续先修正当前样片的接地与接缝偏差，或选择其余方向的单一机制做短样，再决定是否提高分辨率或延长。网站已于2026-10-31发布并完成访问核验，发布产物与本地完整证据分别管理；见[发布与验收记录](research/deployment.md)。"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 127,
          "endLine": 127,
          "text": "## 静态发布范围"
        },
        {
          "path": "projects/013-scenic-motion-lab/README.md",
          "startLine": 129,
          "endLine": 129,
          "text": "网站入口是`app/`中的静态HTML、CSS、JavaScript与展示素材，可通过编号子路径部署；引导入口为`overview.html`，使用现有生成总览图。正式部署遵循研究总库的部署约定。余额、提交及登录准备等服务界面证据仅留本地；公开副本的素材清单由发布流程过滤，不能把本地完整归档描述为全部公开。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 221,
        "endLine": 239,
        "text": "    {\n      \"id\": \"013\",\n      \"slug\": \"scenic-motion-lab\",\n      \"name\": \"景观奇旅 · AI影像创作实验室\",\n      \"summary\": \"观看 11.04 秒海湾骑行试片和两段原片，追踪首图、角色动作、运镜、环境响应与接缝。总结了可复用的导演方法，长片连续性待验证。\",\n      \"source\": \"https://x.com/hi_personality/status/2115567493565825244\",\n      \"sourceName\": \"Personality 原参考视频（非源码仓库）\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"AI影像\",\n        \"景观叙事\",\n        \"图生视频\",\n        \"运镜设计\",\n        \"创作实验\"\n      ],\n      \"cover\": \"assets/images/overview-v1.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/013-scenic-motion-lab/\",\n      \"createdAt\": \"2026-10-31\"\n    },"
      }
    },
    {
      "id": "014",
      "slug": "web-product-reference-library",
      "name": "50 个网站的产品能力与实现参考库",
      "summary": "把 50 个网站按能力整理，逐站记录入口、效果证据、可借鉴机制和实现条件。研究摘要列出五个优先验证的产品方向，完整交互索引保留在本地。",
      "source": "https://x.com/xiaoying_eth/status/2116389253060190271",
      "status": "researching",
      "tags": [
        "产品研究",
        "能力分类",
        "交互机制",
        "数据接口",
        "实现条件"
      ],
      "createdAt": "2026-11-01",
      "readmePath": "projects/014-web-product-reference-library/README.md",
      "readmeSha256": "c1ba9571c09f485baef28182aa194fccaf948f5d33a1c10b512f00ebc3369019",
      "readmeText": "# 014 · 50 个网站的产品能力与实现参考库\n\n从小樱分享的清单出发，按能力整理 50 个网站。每条记录都把具体入口、效果证据、可借鉴的机制和实现条件对应起来。历史截图用于核对当时的界面，实际操作以原站为准。这里公开研究摘要和选题结论，完整筛选网页和预览素材保留在本地。\n\n[原始清单与地月配视频](https://x.com/xiaoying_eth/status/2116389253060190271) · [研究方法与五个产品方向](research/notes.md) · [返回总索引](../../README.md#项目索引)\n\n## 如何使用这份研究\n\n先选一个用户问题，例如「怎样用可追溯的数据讲清一次事件」。再找能支持这个问题的公开数据、时间控制、画面和出处展示机制，并用小样本验证它们能否配合。原帖中的地月视频单独用作视觉参考，作者和实现工具待确认。\n\n015「观象」沿着科普解释和数据叙事这条线做了一个可运行案例。它把地球观测、事件画面、曲线和讲解接到同一时间轴上，供课堂、展陈和历史复盘使用。[观象研究说明](../015-process-visualization-lab/README.md) · [观象在线体验](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/)\n",
      "passages": [
        {
          "path": "projects/014-web-product-reference-library/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 014 · 50 个网站的产品能力与实现参考库"
        },
        {
          "path": "projects/014-web-product-reference-library/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "从小樱分享的清单出发，按能力整理 50 个网站。每条记录都把具体入口、效果证据、可借鉴的机制和实现条件对应起来。历史截图用于核对当时的界面，实际操作以原站为准。这里公开研究摘要和选题结论，完整筛选网页和预览素材保留在本地。"
        },
        {
          "path": "projects/014-web-product-reference-library/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "[原始清单与地月配视频](https://x.com/xiaoying_eth/status/2116389253060190271) · [研究方法与五个产品方向](research/notes.md) · [返回总索引](../../README.md#项目索引)"
        },
        {
          "path": "projects/014-web-product-reference-library/README.md",
          "startLine": 7,
          "endLine": 7,
          "text": "## 如何使用这份研究"
        },
        {
          "path": "projects/014-web-product-reference-library/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "先选一个用户问题，例如「怎样用可追溯的数据讲清一次事件」。再找能支持这个问题的公开数据、时间控制、画面和出处展示机制，并用小样本验证它们能否配合。原帖中的地月视频单独用作视觉参考，作者和实现工具待确认。"
        },
        {
          "path": "projects/014-web-product-reference-library/README.md",
          "startLine": 11,
          "endLine": 11,
          "text": "015「观象」沿着科普解释和数据叙事这条线做了一个可运行案例。它把地球观测、事件画面、曲线和讲解接到同一时间轴上，供课堂、展陈和历史复盘使用。[观象研究说明](../015-process-visualization-lab/README.md) · [观象在线体验](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/)"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 240,
        "endLine": 258,
        "text": "    {\n      \"id\": \"014\",\n      \"slug\": \"web-product-reference-library\",\n      \"name\": \"50 个网站的产品能力与实现参考库\",\n      \"summary\": \"把 50 个网站按能力整理，逐站记录入口、效果证据、可借鉴机制和实现条件。研究摘要列出五个优先验证的产品方向，完整交互索引保留在本地。\",\n      \"source\": \"https://x.com/xiaoying_eth/status/2116389253060190271\",\n      \"sourceName\": \"小樱 50 个网站清单与各站官方资料\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"产品研究\",\n        \"能力分类\",\n        \"交互机制\",\n        \"数据接口\",\n        \"实现条件\"\n      ],\n      \"cover\": \"\",\n      \"demoUrl\": \"\",\n      \"createdAt\": \"2026-11-01\"\n    },"
      }
    },
    {
      "id": "015",
      "slug": "process-visualization-lab",
      "name": "观象 · 地球过程与真实事件",
      "summary": "用同一时间轴联动原理、真实资料、画面、曲线和中文讲解。公开八个地球历史案例及 NASA B0005 放电实验，可追溯关键时刻的观测来源。",
      "source": "https://x.com/xiaoying_eth/status/2116389253060190271",
      "status": "building",
      "tags": [
        "交互地球",
        "过程可视化",
        "真实事件",
        "资料溯源"
      ],
      "createdAt": "2026-11-04",
      "readmePath": "projects/015-process-visualization-lab/README.md",
      "readmeSha256": "3eccb003b02bdfd202466698985e782d7eadab8483c270b3f9ae8e5b7195a562",
      "readmeText": "# 015 · 观象 · 地球过程与真实事件\n\n![观象研究总览：原库、探索流程、产品实拍和扩展方向](assets/images/guanxiang-research-overview.png)\n\n[线上研究总览](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/) · [地球实测回放](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html) · [发布与验收记录](research/deployment.md)\n\n本研究从 50 站参考库和[原帖地月视频](https://x.com/xiaoying_eth/status/2116389253060190271)出发，探索如何用固定空间参照、共同时间轴和可追溯证据解释变化。先看原理示意，再用真实资料定格比较。地球、位置批注、读数、曲线与讲解对应同一观测时刻，观测与预报分别标注。\n\n**研究价值与边界。** 可复用于课堂、展陈和历史事件复盘。洪水、污染迁移和持续观测是延伸方向，依赖可定位、有时间和单位、可核查来源并标明缺测的资料。公开网页提供八个地球案例和 NASA B0005 电芯实验，柴油机案例保留论文和本地导入说明。总览图记录了包括本机柴油机实验在内的完整探索。\n\n**复现资料。** 仓库保存运行文件、来源与处理记录。大型科学原件、部分历史帧和本机导入数据随各案例的复现说明获取。完整资料校验需要相应原档。公开构建执行 `npm run build:site`，校验运行资料及 68 段压缩旁白。\n\n「地球过程」包含地月潮汐、台风、地震、火山、山火和河流。「实验与设备」公开提供 B0005 电芯近景与实测回放，吉林大学柴油机提供[本地复现说明](research/dynamics/jlu-diesel/README.md)。两个入口各有场景目录，共用回放时间轴和图表联动。[地球过程](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-tide-san-francisco) · [实验与设备](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#lab)\n\n**首版功能验收（桌面本地）**。六类地球过程共八个实测案例，另有两个设备实验。十个案例均实机核对了关键时刻跳转、主画面和图表的时刻一致、来源入口，以及对应导览章节。地球案例使用 MiniMax 旁白，设备用同步字幕。另抽查了山竹播放暂停、潮汐暂停后跳时刻再续讲、官方目录搜索及地球与设备分区切换。\n\n首版范围为已有资料的历史复盘。事件目录可搜索保存的官方快照，各案例展示各自的数据覆盖。真实洪水、实际污染事件和持续更新的观测流按新增能力另行验收。\n\n手机触摸时间轴时，松手后加载目标时刻。慢网下画面和读数按观测时刻对齐，载入失败可按「重试观测加载」。小屏讲解为当前画面留出空间，播放期间可暂停、拖动并续讲。[手机端讲解实拍](assets/images/mobile-guided-playback.png)\n\n手机回放按 390 × 844 的 Chromium 触屏模拟、约 1.5 Mbps 下行和 420 ms 延迟验收。另在 360 × 740、约 640 kbps 下行模拟潮汐讲解、触摸跳时刻后续讲，以及观测加载失败后的重试。手机真机与公开部署环境另行验收。\n\nMiniMax 原始 WAV 用于核验，浏览器优先播放同源 MP3。重新生成原音轨后，运行 `node scripts/compress-narration.mjs` 更新压缩版（需要 FFmpeg），再运行 `npm run check:narration`。\n\n**引导讲解。** 从一个能用观测回答的问题开始。先用动态示意说明现象与影响，再用真实案例回答“哪里变了、怎么变、用什么证据判断”。示意、观测、预报和解释分别标注。真实回放的镜头、批注和图表指向同一条记录，来源与缺测可查。新案例沿用这套顺序，场景目录同时提供「引导讲解」和直接回放。地球案例配 MiniMax 语音，设备使用同步字幕。\n\n山竹和轩岚诺的「台风形成」开篇用侧视和俯视动画讲解雷雨扰动、暖湿空气上升、凝结放热、低层汇入与北半球的逆时针环流。四个阶段可直接跳转，也可进入各自的卫星回放。[台风形成导览实拍](assets/images/storm-formation-guide.png) · [NOAA 原理说明](https://oceanservice.noaa.gov/facts/how-hurricanes-form.html)\n\n日本东北和花莲的「地震原理」开篇从断层锁住和应力积累讲到突然滑动，再同步推进纵波、横波与两条示意波形。[地震导览截图](assets/images/quake-formation-guide.png)\n\n汤加导览从地球定位洪阿火山，再进入三维剖面。镜头和批注随 MiniMax 旁白依次聚焦板块俯冲、释水与部分熔融、岩浆上升、减压起泡和喷发。可暂停跳到某一步，也可切换剖面角度。原理段结束后直接接入 NIWA 实测海底地形，随后回放 Himawari-8 红外扫描。三维剖面标为原理示意，两期测绘日期与卫星观测时刻分别标注。[汤加三维导览截图](assets/images/volcano-3d-primer.png)\n\n**在主画面看实测变化。** 点击「MiniMax 边播边讲」，两侧图表与主画面沿同一观测时钟推进。汤加、轩岚诺和山竹的关键扫描会放大并逐帧慢放，同一段保持固定地理取景。位置标注移到侧边，空间不足时移到画面下方。缩放、旋转或选测点时旁白继续，拖动时间轴可从新时刻继续。\n\n**Dixie 山火边界复盘。** 同一地球播放器按档案日期切换九期航空红外边界。橙色显示本期新划入的范围，蓝色填充显示前一期划入而本期未划入的范围。地图、制图面积和 MiniMax 讲解随档案日期推进。附近测站风按当地小时核对，可切换高程阴影、火前燃料植被和地名地图。8 月 2 日与 3 日在所用档案中缺失。[打开 Dixie 复盘](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-wildfire-dixie) · [来源与复现](research/dynamics/dixie-fire/README.md)\n\n**讲完后回看证据。** Dixie 在同一组航空红外边界上切换新增范围、测站风、坡度和火前植被。轩岚诺可以点回东海起点、缺档前后的两幅原始扫描和末帧的强度分析。点卡片时，主画面和两侧图表跟随对应记录；继续拖时间轴会保留回看面板。[Dixie 坡度回看实拍](assets/images/dixie-evidence-recap.png)\n\n- [汤加火山](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-volcano)、[轩岚诺](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-storm)和[山竹](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#typhoon-real)：当前真实红外云图上叠加上一幅的低温边缘（金色）和本幅新增的低温区（青色）。汤加使用亮温低于 220 K，两个台风使用亮温不高于 235 K。两幅扫描时刻在图例列出。缺帧断开比较；「原始亮温」可查看不含这层对照的当前扫描。亮温变化可由云带移动、扩展或冷却造成，不能反推云高或灰浓度。\n- [日本东北地震](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-quake)和[花莲地震](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-quake-hualien)：台站旁的正负刻线显示当前一秒窗的范围，画面内的近 60 秒记录和峰值条把同站震前与当前放在固定刻度上比较。单位是原档仪器计数。\n- [Big Piney 河](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-river-big-piney)：两岸实测点的浓度弧会随样本变大或缩小。画面内的三个断面依次显示首次持续信号及相对释放时刻，可直接点选断面。弧线大小只编码测点读数，测点之间没有推算染料分布。\n\n**v22 · 吉林大学柴油机 ETC 台架。** [查看本地复现说明](research/dynamics/jlu-diesel/README.md)\n\n从「实验与设备」打开柴油机，即可观看通用共轨柴油机的单缸剖面。曲轴和活塞随实测转速做慢放示意。首播 30–90 秒：38.5 秒扭矩首笔为零，转速仍有 3,197 rpm；85.6 秒转速降至 753 rpm。左侧显示当前读数和附近 12 秒的变化，右侧给出整段工况与同刻游标。点击剖面旁的仪表可突出对应图表。\n\n完整 18,000 笔记录可按 0.1 秒逐笔查看。转速和扭矩为台架实测，轨压显示原档 RP（hPa 换算为 MPa），档案未说明是传感器反馈还是控制设定。剖面只作结构示意。原档仅供本地研究回放；[来源、校验与导入步骤](research/dynamics/jlu-diesel/README.md)。\n\n![柴油机剖面、38.5 秒同刻台架仪表和两侧曲线](assets/images/jlu-diesel-v22.jpg)\n\n**v21 · NASA B0005 首次放电。** [打开 B0005 实测回放](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-battery-b0005)\n\n打开 B0005 便进入电芯近景，外壳打开后露出典型圆柱电芯的卷绕结构示意。外部仪表、两侧读数和三条曲线使用同一笔 NASA 采样。电流保留原始符号，外部电流指示的亮度反映实测电流幅值，温度只对应实验记录的单点数值。\n\n197 笔记录覆盖原档经过时间 00:00:00.000 至 01:01:30.234。关键时刻可直达约 −2 A 的首笔、端电压最低点、电流回近零和记录末点。原档缺少时区与实验台坐标，回放以原始经过时间为轴。[NASA 数据目录](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets) · [原始档案与逐条复核](research/dynamics/b0005/README.md)\n\n![B0005 的电芯结构示意、同刻实测仪表和采样曲线](assets/images/b0005-discharge-v21.jpg)\n\n**v23 · 从地月全景飞到旧金山港。** [打开旧金山港回放](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-tide-san-francisco)\n\n打开先看到完整地球、月球和 NOAA 9414290 验潮站。「在地球上看潮汐」在同一三维场景叠加理想海面的两处隆起。地球自转时，示意海岸点和旁边的相对水位曲线同步变化。随后在同一场景旁用海岸剖面对照浅滩和航道的涨落。月球大小、距离和海面高差均按教学比例放大。[NOAA 潮汐原理](https://oceanservice.noaa.gov/facts/moon-tide.html)\n\n「直接看港口实测」从地月全景飞向旧金山，通过 USGS 港湾航拍定位，再淡入岸边视角。月升、月落时自动聚焦 0° 几何地平线，月面由地平线遮挡。月球图像、距离和近地平线的仰角变化采用显示比例。\n\n码头、桩柱和水尺为固定示意，青色水线只随 NOAA 实测潮位升降，垂直变化放大。金色虚线预报保留在右侧图表，和实测共用 MLLW 基准。两组潮位记录与 JPL 月球星历各有 240 个六分钟采样，跟随同一 UTC 时间轴，另列港口当地时间。拖动时间轴或跳到关键时刻后，可从当前时刻继续讲解。[数据来源与逐条复核](research/dynamics/san-francisco-tide/README.md) · [USGS 航拍底图](https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer)\n\n讲解播放时可以旋转地球、切换视角、缩放港口、点击标注或打开读数。手动操作镜头后，点播放器上的「回到讲解镜头」即可恢复自动取景。拖动潮汐时间轴时，松开会从对应章节和语音位置继续；原本暂停则继续保持暂停。\n\n![旧金山港视角下的月升、岸边水线与两侧同刻图表](assets/images/san-francisco-harbor-v23.jpg)\n\n[潮峰实机截图：19:54 UTC，岸边水线达到当天最高采样](assets/images/san-francisco-tide-high-v23.jpg)\n\n**v19 · Big Piney 河实地示踪。** [打开实测回放](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-river-big-piney)\n\n镜头从完整地球飞入密苏里州 Big Piney 河段。航拍影像与 USGS 河道中心线提供定位，六个实测点上的浓度柱和光环随读数变化。左侧比较三个断面，右侧显示所选断面两岸的曲线。自动观察会随三个左岸持续信号切换断面。点击地图标注、左侧断面或关键时刻可以自己核对。\n\n自动观察覆盖释放参考时刻前 10 分钟至后 6 小时，时间轴可拖至完整记录。左岸在三个断面的持续信号时刻为 +00:58:30、+02:07:30、+03:34:30。判据取连续三次达到 3 ppb 的首笔记录，峰值单独标明。档案保留相对时钟和本地钟，缺测留空。柱高使用统一平方根尺度，实际浓度读数和曲线保留 ppb。测点之间的河段只提供地理背景。[原始数据和逐行复核](research/dynamics/big-piney/README.md) · [航拍与河道来源](research/dynamics/big-piney/geography/README.md)\n\n![Big Piney 断面 1 的两岸读数、同刻游标和地理位置](assets/images/big-piney-observation-v19.jpg)\n\n**v18 · 从地球定位进入实测回放。** [轩岚诺台风](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-storm) · [日本东北地震](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-quake) · [花莲地震](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-quake-hualien) · [山竹复盘](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#typhoon-real)\n\n轩岚诺和两个地震案例先展示完整地球，再靠近观测区域。可以暂停或点击关键时刻。台风默认对照固定窗口的低温面积和 JMA 最大持续风速，分别标注卫星扫描时间与分析时间。地震默认显示所选台站的波形，球面放大所选站最近 60 秒的轨迹。展开「全部读数与曲线」查看辅助指标。\n\n轩岚诺的「开始台风导览」依次定位云系、观察北移、辨认缺档和核对强度。近景白线取自 Natural Earth 1:5000 万海岸线（4.1.0，公有领域），用济州岛和朝鲜半岛南岸作为固定参照。末帧实拍同时显示 13:30 UTC 红外扫描、12:00 UTC 的 JMA 事后中心分析和同一回放时钟下的曲线。[实拍](assets/images/hinnamnor-evidence.png) · [海岸线来源](https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-coastline/)\n\n花莲与东北地震共用播放、台站切换、图表和导出。花莲三个 BHZ 垂直通道各有 480 个实测一秒窗，章节点是各站在该时段的峰值窗。两场地震均提供 MiniMax 旁白和同步字幕。[花莲来源与复核](research/dynamics/hualien/README.md)\n\n汤加、轩岚诺、山竹香港同步观测、两场地震和 Big Piney 均可边听边查看画面、标注和图表。拖动时间轴后，讲解定位到对应章节的进度，画面与两侧图表一起提交该时刻。原本播放时松手续播，原本暂停时保持暂停。\n\n![花莲地震台北站峰值的地球标注和实测波形](assets/images/hualien-observation-v18.jpg)\n\n下一批场景已取回并核对官方数据样本，当前用于确定接入方式。\n\n| 方向 | 已核对的记录与第一版呈现 |\n| --- | --- |\n| 地月与港口潮位 | 旧金山 9414290 站 2025-01-15 00:00–01:00 UTC 有 11 个与月球星历匹配的六分钟刻度。地球呈现站点视角下的月球方位和高度，侧边对照实测和预报潮位，单位 m、基准 MLLW。[NOAA 实测查询](https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=20250115&end_date=20250115&station=9414290&datum=MLLW&time_zone=gmt&units=metric&application=web_services&format=json&product=water_level) · [NOAA 预报查询](https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=20250115&end_date=20250115&station=9414290&datum=MLLW&time_zone=gmt&units=metric&application=web_services&format=json&product=predictions&interval=6) · [JPL 月球星历查询](https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=%27301%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27OBSERVER%27&CENTER=%27coord%40399%27&COORD_TYPE=%27GEODETIC%27&SITE_COORD=%27-122.46589%2C37.806305%2C0.0%27&START_TIME=%272025-01-15%2000%3A00%27&STOP_TIME=%272025-01-15%2001%3A00%27&STEP_SIZE=%276%20m%27&QUANTITIES=%274%2C10%2C20%27&CSV_FORMAT=%27YES%27&TIME_TYPE=%27UT%27) |\n| 河流迁移 | USGS Big Piney 河实地染料示踪。左岸在下游 1,485、2,650、3,670 米的浓度峰值，分别出现在释放后 1.17、2.43、4.16 小时。按释放后的时间播放三个断面的实测读数，可对照左右岸。现场试验的观测范围限于测点。[USGS 实验与原始数据](https://www.usgs.gov/data/situ-measurements-rhodamine-wt-dye-concentration-and-turbidity-made-during-a-tracer-experiment) |\n| 发动机 | 吉林大学 2.7 L 四缸柴油机 ETC 台架：18,000 笔，0.1 秒采样。转速和扭矩为实测，轨压为原档 RP；本机研究回放。[论文及图 1](https://scis.scichina.com/en/2019/077201.pdf) |\n| 电池 | NASA B0005 首次放电 197 条记录，包含端电压、电流和电池温度。相对起点约 1,796 秒的观测为 3.5299 V、−2.0148 A、32.87 °C。原始日期缺少时区，第一版使用放电经过时间。[NASA 档案](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets) |\n\n**v17：先修复失败状态与证据导出，再按七方向规格扩展。** [查看 v17 历史规划源码](research/implementation-plan.html) · [打开真实过程](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-storm)。\n\n本批修复末帧重播失败仍进入播放、失败提示被覆盖，以及语音清单首次失败无法重试的问题。参考轮廓加载失败时显示明确状态与重试入口；重试保持原观测时钟，轮廓按事件ID及真实帧时间对应。原36段MiniMax音轨与四个真实案例保留。\n\n动态导出升级为schemaVersion 2，保留原有观测，同时记录请求、提交、实际显示时刻与加载状态。导出包括亮温显示、融合/光照、汤加空间聚焦和当前参考轮廓的来源版本、阈值、数值输入SHA及显示状态；影像失败时不把旧读数标成当前已显示画面。\n\n七方向的用户问题、动态对象、镜头顺序、最多两项主指标、最终成果与完成分级已写入[场景规格](research/scenario-specifications.json)；时空、来源独立更新、派生版本与MiniMax讲解流程见[运行合同](research/operating-contracts.json)。规划改为各方向独立数据准入，共用呈现使用已有代表资料直接启动。新增真实场景仍待逐项接入，规格完成不计为能力完成。验收见[验证记录](research/verification-v17.json)。下方保留历次说明。\n\n**v16：在地球上看变化，MiniMax讲解、关键位置和图表共用真实时钟。** [打开真实地球过程](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-volcano)，点击“MiniMax 边播边讲”。播放结束继续停留在地球，前后图片对照保留为手动核对入口。\n\n![真实地球过程、球面变化标注与同刻图表](assets/images/observed-earth-v16.png)\n\n| 过程 | 地球上的动态与解读 |\n| --- | --- |\n| 汤加喷发 | 25次真实红外扫描逐帧变化；同帧数值亮温提取低温阈值参考轮廓，配合原固定300公里统计圈、面积与区域P10曲线。关键时刻可一键定位 |\n| 东北地震 | 六台站实测针柱与波形继续由同秒记录驱动；标明所选台站和震中，点击台站标注对应当前真实计数与局部波形 |\n| 轩岚诺 | 23次真实扫描与低温阈值参考轮廓随时钟更新；同时标明当前可用及上一次JMA分析位置，区分扫描时间与官方分析时间 |\n| 山竹复盘 | 原72张云图、亮温变化、风、雨、海水位保留；机场与鲗鱼涌标注显示实际记录时刻，点击对应曲线，缺报不填零 |\n\n标注直接注册到原有球面及相机。点击地球标注会突出对应读数和图表；MiniMax旁白沿真实观测时刻驱动过程。现有36段音频及脚本保持不变，未重复调用生成API。汤加融合显示在400—600公里间逐渐减弱周边图层，突出过程并减弱方形边缘；原始亮温模式保留完整资料窗口，原统计范围与数据不变。\n\n轮廓来自原有48帧uint16数值亮温，每8×8格取实际中心样本后提取阈值边线；汤加220 K、轩岚诺235 K，与原统计口径对应。采样格最大对角约23.09／33.17公里，只用于粗略定位，未校正云视差，不是精确云边界、火山灰识别或云高。区域P10是整个固定区域的统计量，标注位置指向该帧实际低温像元，不把区域值冒充单点测温。台站counts未转换为位移；两次分析位置的连线不解释为实际行进路线或风场。\n\nv16 验收时使用本地原型。截图均取自实际网页；参考原视频的中央地球、两侧证据与位置引线表达，未取得原作源码，不声称复刻其渲染。验收见[验证记录](research/verification-v16.json)，轮廓与显示复现见[动态资料说明](research/dynamics/README.md)。下方保留历史版本说明。\n\n**v15：四个真实事件配套演示，加入可操作的前后对照。** [打开产品](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#overview)，在“选一个问题，直接看真实变化”中选择事件。约17秒沿真实记录推进，结束后自动切换前后对照；可以回到A、查看B、重播，或在原时间轴自己观察。\n\n![汤加真实扫描前后对照与同刻统计](assets/images/demo-volcano-v15.png)\n\n| 配套演示 | 看什么、怎样验证 |\n| --- | --- |\n| 汤加喷发 | 同一区域两张实际红外亮温派生图可拖动分隔线核对；固定300 km内低于220 K区域由0到约69711 km²，不解释为火山灰云或受灾面积 |\n| 东北地震 | 松代台站震前05:46到05:49:20 UTC；前后各30秒实测计数记录用共同纵轴，保留窗内极值，不用符号反转解释强度增幅 |\n| 轩岚诺 | 对照实际云系及风速、气压；13:30 UTC的B分别显示卫星扫描与12:00官方分析，分析亮点画在实际记录时刻 |\n| 山竹 | 香港12:00到13:00；机场风79.636→111.12 km/h，站点海水位3.51→3.70 m，雨量保留两组地区范围及累计窗口 |\n\n“地球动态”和“真实前后对照”在同一观察区切换，共用当前B时刻与原两侧图表。对照窗是实际记录的读图视图：卫星A/B沿同一地理窗口及180–310 K映射显示，地震使用同站同尺度的波形。不是另行播放的视频。图表中的青色A线固定起点，金色B线保留共同时间。\n\n下方“前后到底变了多少”显示A、当前B及可比较数值的差；展开证据可核对真实扫描窗、实际分析时间、台站源行/峰值采样与雨量累计口径。雨量范围不取中点、不计算假单站增量；云图区缺帧时不沿用旧图。手动调到A以前，会清除旧比较依据并明确提示。切换台站重新比较同一台站的A/B，切换主题退出旧任务。\n\nMiniMax原36段旁白、四类真实案例、官方事件目录、六类原理动画与山竹完整复盘继续可用。“听当前事件讲解”可进入已接入的中文语音导览。本轮没有生成新音轨或增加观测数据；重点改进演示组织、前后可见差别和证据验证。\n\n`npm test`覆盖播放区间、慢帧等待、退出、手动时间漂移后重新定位、缺测断线及无效比较清理。验收与截图见[验证记录](research/verification-v15.json)。v15 验收时使用本地原型。\n\n\n**v14：一键中文讲解，让地球、真实时间和证据一起讲清楚。** [打开产品](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#overview)，点击右上角“▶ 一键讲解”，约3分钟自动走过总览、汤加喷发、日本东北地震、轩岚诺和山竹，再进入来源说明。“讲解当前内容”则讲当前事件或原理。\n\n![MiniMax旁白带动真实过程与同刻图表](assets/images/narration-v14.png)\n\n讲解直接操作现有地球与真实记录，逐章定位视角、推进观测时刻、高亮对应图表。8章总览之外，四个实测事件各有4章、六类原理各有2章，共11套导览、36段旁白。章节按钮、上一章、下一章、暂停、继续、声音开关和退出均可操作；用户手动拖动时间或切换内容即退出自动讲解。离开页面时暂停，失败观测可重试，不代入其他帧；慢帧期间语音与讲解计时一起等待。退出后保留当前观察位置供继续探索。\n\n| 讲解流程 | 当前画面与内容 |\n| --- | --- |\n| 认识界面 | 完整地球定位、共同时间、两侧读图方式；明确总览是教学示意 |\n| 汤加 | 较早红外扫描→四小时实际云团变化→同帧300 km邻域统计 |\n| 东北地震 | 选松代实测台站，波形与同秒仪器counts一起起伏 |\n| 轩岚诺 | 早期云系→实际扫描推进→区分卫星与官方分析时刻 |\n| 山竹 | 香港12:00→13:00的云图、风、雨与海水位，保留各项实际时间与基准 |\n| 自由探索 | 打开资料来源，继续选事件、拖时钟、核对观测 |\n\n声音使用 **MiniMax speech-2.8-hd / 温柔学姐 / 0.95语速**，按本项目中文脚本预生成36个32 kHz单声道WAV。总览音轨149.60秒，另有章节停留与加载时间；全套旁白666.696秒。网页播放本地音频，不重复请求生成API。音频不可用时明确显示字幕模式。凭据只由生成脚本读取外部配置，不进入前端或交付文件。\n\n前端文案与音轨通过文字、WAV结构、时长、非静音和SHA校验。`npm run check:narration`独立复核36段，`npm test`覆盖讲解切换、迟到异步结果、慢帧暂停、数据时刻及原有过程回归；具体交付验收见[验证记录](research/verification-v14.json)。音色、生成与复现说明见[MiniMax旁白资料](research/narration/README.md)。\n\n讲解沿用已有实测数据与显示边界：红外亮温不等于云高/灰浓度，counts不等于地面位移，站点海水位不等于风暴潮增水。山竹复盘、四类实测事件和六类原理入口全部保留。本地运行，未发布公网。下方保留历次迭代记录。\n\n\n**v13：三类真实动态过程已经进入同一地球。** [打开真实过程](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-volcano)，选择汤加喷发、日本东北地震或轩岚诺。默认完整地球，可切换“过程特写”；支持播放、逐帧、拖动、原始亮温核对及带来源导出。[山竹同步复盘](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#typhoon-real)完整保留。\n\n![汤加喷发真实云团与同帧统计](assets/images/dynamic-volcano-v13.png)\n\n| 真实过程 | 接入资料与时窗（UTC） | 地球与两侧如何对应 |\n| --- | --- | --- |\n| 2022汤加喷发 | 2022-01-15 03:50—07:50，25次十分钟Himawari-8 B13扫描 | 实际亮温栅格注册到球面，逐次呈现喷发附近云团扩展；左侧同帧亮温图，右侧固定300km内低温区域面积与面积加权P10亮温 |\n| 2011东北地震 | 2011-03-11 05:45—06:05原始20Hz波形，六站共144000样本，汇成7200个1秒窗 | 地球上的台站波形条带与针柱、左侧六站包络、右侧所选台站波形采用相同窗末时刻；保留窗内最大绝对振幅的实际样本、min/max与源行 |\n| 2022轩岚诺 | 2022-09-05 03:00—13:30，23次20–30分钟扫描；4条三小时JMA分析 | 实际云系形态变化与固定区域亮温/低温像元面积曲线同帧；中心位置、风速、气压只引用当时或更早原始分析，另列实际分析时间 |\n\n动态图层不是独立播放器：共用同一场景、相机和时间选择。影像就绪后才提交地球/读数/图表的共同时间；快速切换、迟到影像、失败帧和缺测有明确处理。卫星名义扫描时刻与实际所选分段扫描起止分别保留；非均匀帧间隔按UTC比例推进。统计曲线横轴使用真实时间，JMA稀疏分析画离散观测点。\n\n显示边界：红外亮温不是云高、灰浓度、降雨量或风场；汤加低温区域未区分气象云与火山云。纹理光照仅改善同帧层次，可关闭或切回固定亮温映射。地震保留去震前基线的仪器counts，未校正响应，按各站自身峰值独立归一化；针柱和60秒波形条带的尺寸是读图排版，不是地面位移或台站之间的波前。\n\n轩岚诺10:00扫描缺档，采用真实09:50/10:10扫描并保留20分钟间隔；14:00—15:00存在太阳杂散光/日食质量标记，因此本次展示止于13:30。原始文件、数值16bit亮温、统计方法、SHA256、实际扫描时窗、原始台站波形及独立核验结果保存在`research/dynamics/`。可运行`npm run check:dynamics`核对48张显示/数值图及同刻指标；各事件完整复现步骤见[动态资料说明](research/dynamics/README.md)。\n\n本轮具体界面与回归验收见[验证记录](research/verification-v13.json)。v13 验收时使用本地原型。以下保留v12及更早的阶段记录。\n\n\n**v12：完整地球 + 可更新事件目录 + 六类过程入口。** 默认打开[地球事件](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#events)，可筛选、检索 USGS 地震、USGS 火山状态通报与 NASA EONET 热带气旋报告；“更新官方资料”从公开接口获取最新目录并保留获取时间。默认视角和复位按窗口宽高显示完整球体，局部近看需单独选择。山竹同步回放与原有六类原理动画继续可用。\n\n![完整地球上的真实事件目录](assets/images/events-globe-v12.png)\n\n## v12：从可看的效果到可用的信息\n\n| 入口 | 用户能做什么 | 当前边界 |\n| --- | --- | --- |\n| 地球事件 | 按类型、名称或事件ID找资料；定位真实坐标；查看时刻、震级／深度或火山通报状态；打开官方证据、导出记录 | 地震目录点与火山定位符号不是震波、喷发灰柱或影响范围 |\n| 地震发生顺序 | 选“地震”后沿实际发生时刻回放，已发生点逐个出现，图表突出同一条记录 | 不生成观测之间的波形、震动动画或虚构零值 |\n| 火山通报 | 查看 USGS 当前较高警戒级别目录中的官方状态、通报发布时间和火山目录位置 | 单次通报不是连续监测；较早 EONET 开放报告默认隐藏，可明确勾选查看；跨来源可能是同一火山的不同记录 |\n| 气旋报告 | 回放 EONET 已报告坐标和日期，核对来源 | 不是当前高频云图、完整风场或预报；日期级记录不解释为精确仪器时刻 |\n| 更多能力与接入 | 直接打开地月、火山、地震、台风、河流、电池原理动画；查看每个方向还需要哪些真实数据 | 已接入实地染料示踪、电芯放电和柴油机台架记录；模型只说明设备内部结构 |\n| 山竹复盘 | 使用原72张云图、70组亮温变化、风雨潮位及A/B对比理解一次完整事件 | 历史案例用于复盘，不作为当前天气 |\n\n本次保存的官方快照获取于 **2026-11-04 14:15:36 UTC**，包含720条地震、2个热带气旋、3条USGS火山通报，以及32条较早EONET开放火山记录。默认近期入口显示725条资料，较早火山记录需勾选；这些计数是来源记录数，不是全球灾害总数。网页按钮刷新只替换当前会话资料；持久更新项目快照运行`npm run data:update`。任一来源失败保留上次完整资料及其原获取时间，不把失败或空白当作平静无事。\n\n资料获取与原始字节可追溯：共享浏览器/Node适配器在`app/live-event-feed.js`，更新器在`scripts/update-earth-events.mjs`，原始响应、SHA256、CORS验证与离线复现在`research/live-events/`。正式更新前不会混合不同尝试；本轮没有新增付费服务、密钥或后台定时任务。\n\n扩展所需数据、模型边界和用户价值见[六类扩展方向](research/extension-directions-v12.md)。本轮验收和实际页面截图见[验证记录](research/verification-v12.json)。原始资料、云图与观测时序均保留；v11及更早说明如下。\n\n\n用同一个地球组织过程原理与有出处的事件资料，帮助用户看懂“发生在哪里、怎样变化、判断依据是什么”。**v11 增加同帧纹理光照、云带特写视角，以及由相邻真实数值资料计算的“10分钟变化”叠加，让云系层次和变化更容易辨认**。山竹云图、香港机场风、东区小时降雨范围、鲗鱼涌海水位仍使用同一回放时钟。默认真实事件入口打开2018年9月16日08:00—20:00（北京时间）同步观测；全程路径对比与原理演示可在同页切换。原有六类效果、局部放大、A/B结论和补充资料均保留；其他五类尚未接入真实事件数据。\n\n产品面向科普作者、教师、新闻解读与事件复盘。地球负责空间定位，时间线负责选取真实时刻，图表负责展示变化，原始资料负责核对结论。用户可以比较山竹穿越吕宋前后的中心强度，再查看香港天文台对强风和风暴潮的解释。仅凭中心路径与中心风速不能推出香港每个地点的实际受灾程度。\n\n[地球过程全景 · 主入口](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#overview) · [当前地球中的真实山竹](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#typhoon-real) · [完整事件资料 · 补充页面](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/real-event.html) · [事件扩展合同](research/real-events/extension-contract.md) · [返回研究总库](../../README.md#项目索引)\n\n![同一真实红外帧的纹理光照与云带特写](assets/images/cloud-relief-v11.png)\n\n## v11：看清纹理与十分钟变化\n\n融合模式默认开启“立体光照”，从当前同一帧的空间纹理生成显示用明暗层次，不位移球面像元、不增加时间帧。它不是云高反演、实测阴影或光学厚度，按钮可关闭。“云带特写”只改变观察距离与视角，便于查看已有影像细节，不增加数据分辨率。\n\n“10分钟变化”默认关闭。开启后，在当前真实云图上叠加**同一地理格点亮温相对前十分钟的差值**：青色表示降低，金色表示升高。70组有效配对直接由保留的16位、0.01 K刻度亮温资料离线计算，没有从8位显示灰度反算；两份输入和结果各保留哈希与实际扫描时窗。仅在两帧均有效、任一帧低于265 K的位置呈现，差值绝对值超过4 K后逐渐显色，到12 K达到约0.65不透明度。这些阈值是显示选择，不是云分类或置信度。固定格点差值可以包含云体移入／移出等因素，不表示同一个云团的冷却、风向、风速或降雨变化。\n\n08:00没有前帧、10:40当前帧缺档、10:50前帧缺档（北京时间），均不显示变化，不跨过缺档配对。“原始亮温”模式关闭纹理光照与变化叠加，便于核对同一张未融合显示图。自动播放准备真实云图及已开启的变化图后再提交共同时间；当前变化对的起止时刻、加载状态和方法随JSON导出。风、雨、海水位和JMA曲线继续使用原来的观测与分析记录、采样口径和缺测规则。\n\n![相邻真实扫描在同一格点上的亮温降低与升高](assets/images/cloud-change-v11.png)\n\nv11已通过88项自动化测试、资料完整性检查和实际浏览器验收；上图取自交付页面。桌面／小屏、缺帧、2×完整回放、原始模式、A/B与原理模式切换及导出均已核对。实施与测试边界见[迭代记录](research/iteration-v11.md)和[验收记录](research/verification-v11.json)；v10历史验收仍保留在[原记录](research/verification-v10.json)。\n\n## v10：真实云系融入地球\n\n默认“云系融合”采用固定亮温色表突出较冷区域，保留同一帧中的纹理层次；暖区逐渐透明，让历史海陆底图可见。285 K及以上不显示该层，从285 K降至240 K时逐渐增加展示不透明度，240 K及以下达到0.94的不透明度；覆盖边缘另按经纬度3°平滑减弱。这些是阅读用的显示参数，不是实测云量、云分类结果或光学厚度。扩大覆盖范围与边缘柔化共同弱化矩形贴片的硬边，不改变云的位置、高度或时间。\n\n“原始亮温”关闭融合色表与边缘柔化，按180 K白、310 K黑显示同一张灰度图，保留覆盖边界和原有无效像元。这里的“原始”指未做融合的亮温显示图：它已经过HSD标定、区域重投影与8位灰度编码，不是未经处理的HSD文件，也不是完整精度的数值栅格。融合阈值由显示灰度近似反推亮温，仅用于呈现；原始HSD及独立的uint16厘开尔文亮温栅格仍保留用于数值核对。\n\n新增前后10分钟按钮，可逐刻度检查同一真实扫描帧及对应读数。自动播放先准备下一张真实帧，准备期间保留当前画面、时钟和读数，准备好后一起切换；缓存命中时直接绑定，不先清空地球。手动选择尚未加载的帧会显示加载状态，旧帧不会冒充新时刻。预加载失败会在对应时刻隐藏云图并重试一次，再次失败则明确显示失败；已知缺档仍留空。没有时间插帧、跨帧混合、程序旋转云团或额外生成的云层。\n\n## 同一地球、同一时钟的真实观测\n\n进入“真实事件 · 山竹”后默认打开“香港同步观测”。时间轴包含73个十分钟刻度，云图、两侧四条图表和地球上的真实测站标记读取同一时钟。曲线的金色虚线表示回放时钟，亮点表示实际记录；没有新采样时明确显示原记录时间和时间差，不插出不存在的观测。默认13:00，可核对机场风111.12 km/h、东区11:45—12:45累计范围2—48 mm、鲗鱼涌13:00海水位3.70 m（UHSLC站点零点）。这是按观测时间进行的历史复盘，不是模拟当时已经发布的信息：上述雨量公报实际在13:02发布，报告另列发布时间。\n\n| 资料 | 已接入的实际范围 | 时间与数值口径 |\n| --- | --- | --- |\n| 葵花八号 AHI B13 | 72张扩大范围的区域红外帧，2018-09-16 00:00—12:00 UTC，2048×1664；唯一缺档02:40 UTC | 复用同一批72个原始HSD对象，按EPSG:4326重投影至bbox=[85,-10,165,55]，没有增加观测时刻。10分钟名义扫描；每帧另保留实际扫描起止。未融合灰度图为180 K白、310 K黑；不是自然色或降雨图 |\n| 香港国际机场风 | 三天存档128条常规METAR；主窗20条半小时记录 | 原生kt按1.852换算km/h；通常10分钟平均风，半小时是报文间隔。主窗08:00—10:00缺报，不沿用07:00读数 |\n| 东区一小时雨量 | 92份官方历史RSS，41个原始小时窗口；主窗12个窗口 | 地区内测站最小—最大累计量，保留上下限，不取中点。17:45—18:45窗口未列东区，显示缺测。发布时间、归档时间另存，不称即时发布 |\n| 鲗鱼涌海水位 | UHSLC研究质量329B序列，271条原始整点记录；主窗13条 | 整点1分钟平均，每小时一条，单位m·UHSLC站点零点。没有施加海图基准面换算，不是风暴潮增水 |\n\n卫星缺档10:40（北京时间）显示历史底图和缺帧说明，其他观测继续按自身时间读取。现用72张显示PNG合计208,624,292字节；浏览器只缓存最多4张纹理，并预加载最多3张邻帧。快速拖动或切模式时，过期请求失效。v9的1024×878、bbox=[105,5,140,35]影像保留归档；v10当前显示使用扩大范围的新影像，两个版本来自同一批原始观测，不能合计成更多扫描帧。\n\n观测取时采用“该时刻或更早的最近原始记录”，风最多30分钟、雨窗结束最多60分钟、海水位最多60分钟；超出或遇到明确缺测记录就留空。雨图每个块的横向长度是累计窗口、纵向范围是地区测站上下限。JMA中心点及中心风曲线仍是6小时事后分析，注明最近分析时刻，不画成十分钟实测中心。\n\n同步JSON导出包含共同时间、卫星选择/实际显示状态、融合或原始亮温模式、影像覆盖范围、各观测原始字段、缺测时的最近源记录、站点、垂直基准和来源；TXT/复制结论附实际观测窗和可核对的历史公报链接。原来的“全程路径对比”继续提供A/B比较。\n\n来源：[NOAA/JMA Himawari开放档案](https://registry.opendata.aws/noaa-himawari/)、[NOAA NCEI机场原报文](https://www.ncei.noaa.gov/access/services/data/v1?dataset=global-hourly&stations=45007099999&startDate=2018-09-14T16:00:00Z&endDate=2018-09-17T15:59:59Z&format=json&includeAttributes=true)、[香港政府原始天气公报快照示例](https://app.data.gov.hk/v1/historical-archive/get-file?url=https%3A%2F%2Frss.weather.gov.hk%2Frss%2FCurrentWeather.xml&time=20180916-1315)、[UHSLC鲗鱼涌329B](https://uhslc.soest.hawaii.edu/data/csv/rqds/pacific/hourly/h329b.csv)。署名JMA/NOAA、香港天文台／香港特区政府、DATA.GOV.HK、UHSLC/JASL。\n\n云图标定与导航经过独立像元重算核验；这不等于外部地理定位精度认证，高云视差未校正。B13图显示区域内的红外亮温，有云时主要反映云顶，晴空像元也包含地表或海面信息；有效像元不等于云掩膜。UHSLC同站同版本的另一接口有一条1 mm数值差异，原因未确认，保留主CSV并记录差异，未混补。整点采样最大3.73 m（UHSLC站点零点）与天文台报告的事件最高海水位3.88 m（海图基准面以上）在采样与基准说明上不同，不能直接互相替换。\n\n## 保留的事件比较与解读\n\n在“全程路径对比”中，点击“对比9/14→9/16”可比较山竹2018年9月14日14:00与9月16日14:00（北京时间）：中心最大持续风速110→75 kt、中心气压905→960 hPa。A、B同时显示在地球与两条曲线上，用户可固定当前记录为A，再移动时间轴选择B。从同步观测切到路径对比时，B沿用同步时钟选中的最近一次JMA分析，不一定是该预设终点。预设两条中心坐标距香港参照点约1358.4→96.5 km，这一距离由坐标计算，不是当地测站风速、实测影响范围，也不能用来验证香港天文台报告的精确最接近时间。\n\n“开始事件解读”按抵近吕宋、靠近香港、进入内陆三个问题回放真实记录，每段到关键时刻自动停下，用户阅读对比后再继续。手动选择记录会退出引导；过程中不补造缺测数据。导出结论包含原始值、差值、时区、源行号、修订日期、方法与官方链接，可用于科普备稿、课堂讨论和事件复盘。倒序选择只比较数值，同一记录提示另选时刻。\n\n“看真实动态影像”提供NASA SVS官方山竹视频：2018年9月12–13日IMERG降水估计与GPM雷达三维结构。原生播放器读取NASA远程媒体，需联网，不与地球所选六小时时刻同步；播放失败时保留官方页面入口。另提供CIRA增强红外高频档案的官方Loop入口；高频区域影像在同步观测页签中直接贴到地球，这些独立视频仅作为补充来源。\n\n动态资料出处：[NASA SVS 4682](https://svs.gsfc.nasa.gov/4682)，署名NASA Scientific Visualization Studio，数据NASA/JAXA GPM；[CIRA/RAMMB 4 km Mercator增强红外档案](https://rammb-data.cira.colostate.edu/tc_realtime/archive.asp?product=4kmirimg&storm_identifier=wp262018)。CIRA仅保留外部核对入口；同步观测实际使用有完整导航与扫描时间头的NOAA/JMA原始HSD文件。\n\n## 保留的同地球双模式\n\n台风的“原理演示”允许改变假设参数，查看理想云系与模型指标；“真实山竹”使用实际记录、单位与资料时间，不开放假设参数。切换后，中央地球、左侧解释、右侧读数与曲线、时间轴及来源说明一起变化。通过模式按钮返回原理演示时恢复之前保存的台风参数与进度。\n\n真实事件内有“香港同步观测”和“全程路径对比”两个页签。同步观测按十分钟共同回放时钟选取各自最近的有效原始资料；路径对比可选记录点、阶段或卫星日期，NASA日合成按可用日期加载，路径与风压按每六小时原始分析记录选择。NASA 原图、香港风速与潮位峰值、官方雷达链接可在当前页面的证据窗口查看。\n\n`index.html` 与 `globe.html` 是内容一致的统一入口；`real-event.html` 保留完整来源和独立阅读布局，属于补充资料页，主要操作不需要离开当前地球。真实资料缺失或加载失败时显示状态，不拿模拟值补作观测。\n\n## 路径对比与补充资料\n\n| 内容 | 实际范围 | 可以怎样使用 |\n| --- | --- | --- |\n| JMA 山竹最佳路径 | 46 条原始记录，每 6 小时一条；2018-09-06 12:00 UTC 至 2018-09-17 18:00 UTC | 按实际记录定位台风中心，对比中心气压、最大持续风速；图表与地球读取同一条记录 |\n| 中心强度 | 风速单位 kt，10 分钟平均；气压单位 hPa；39 条有数值风速、7 条风速留空 | 解释记录中的加强与减弱；110 kt 为本资料峰值，905 hPa 为最低中心气压 |\n| NASA 真实影像 | 2018-09-14 的官方局部影像；2018-09-12—17 共 6 幅 GIBS 全球日合成，每幅 4096×2048；来源和 SHA-256 见媒体清单 | 查看真实云系与地理背景；日合成影像不代表某一个瞬间，不能与 6 小时路径声称同刻采集 |\n| 官方效果入口 | 香港天文台山竹专题中的卫星、雷达动画及事件图表链接 | 查阅真实雷达回波、站点风、潮位和风暴潮资料 |\n| 来源与原始行 | 原始固定列文本、解析 JSON、字段说明、修订日期、下载时间、SHA-256 | 核对数值出处，复现解析，区分来源版本 |\n\n记录范围包括热带低压阶段，早于部分以命名风暴为起点的专题日期。JMA 的 `000` 风速保守留为 `null`，保留原 token，不解释为静风、不填成零、不生成补点。显示时间转换为北京时间 UTC+8，保存值继续使用 UTC。风速换算为 km/h 时采用 `1 kt = 1.852 km/h`，并注明换算。\n\n**真实资料也有类型区别：JMA 数据是官方事后分析，不是每个路径点上的仪器直接测量，也不是当时发布的预报。** 来源机构之间的估计与风速平均时长可能不同，不能将 JMA、香港天文台和 JTWC 的风速混成同一条曲线。\n\n## 画面与数据的边界\n\n- 全程路径对比按原始六小时分析记录逐条播放；同步观测按十分钟回放时钟选取资料，JMA中心仍只使用最近一次原始分析。记录间连线用于阅读路径或曲线，不代表期间新增观测，也不赋予线段之间的每一像素观测含义。\n- 地球表面的 NASA Blue Marble 素材是已有地理底图，不能当作 2018 年山竹同期卫星画面。观察角度、光照与标记大小服务于阅读，不是事件观测量。\n- 融合层的暖区透明、冷区色表和3°覆盖边缘柔化均是展示处理，不是实测云掩膜或新增观测。切换原始亮温模式不更换帧或时间；数值核对使用独立亮温数据和来源，不从融合后的颜色反求精确温度。\n- 全程路径对比页签中的 GIBS 日合成展示一天内获得的影像拼接，不能当作连续瞬时云图。路径每 6 小时一条与影像逐日更新属于不同时间分辨率；缺少日期影像时回到地理底图，不补帧。\n- NASA 局部图片保持原图查看入口；没有全球投影信息的裁切图片不能直接贴满地球。官方雷达／卫星视频是独立资料，未声称与本地时间线逐帧同步。\n- 同步观测已接入机场风、东区小时雨量范围和鲗鱼涌海水位；不是全香港完整观测网，没有从图片估读数值或提供风暴潮残差曲线。\n- JMA 最长／最短风圈半径只描述风圈摘要，不能据此冒充完整观测风场、云层厚度、降雨分布或城市受灾范围。\n- 当前用于历史事件解读和产品研究，不提供实时告警、灾害预测或设备运行决策。尚未验证用户理解收益与商业需求。\n\n## 保留的原理实验室\n\n`app/index.html` 与 `app/globe.html` 提供地月、火山、地震、理想台风和河流输运五类地球原理，并可切换到山竹实测档案。`app/detail.html` 保留局部过程视图与电池放电教学模型。教学场景使用可调参数，结果由模型计算。\n\n旧模型有明确显示缩放和假设：地震波、理想台风风场及路径曾作 8 倍表现性放大；2 km 河段约放大 1000 倍；设施中的电池为假想 2 Ah 单体。真实山竹档案不把这些模型输出带入记录曲线。旧模型细节和历史验收见 [模型说明](research/notes.md)、[v5 验收](research/verification-v5.json) 与 [v5 迭代记录](research/iteration-v5.md)。\n\n## 本地运行与检查\n\nNode.js 22 及以上。浏览器渲染使用仓库内的 Three.js 0.180.0，无需安装第三方依赖。\n\n```powershell\ncd E:\\codex_project\\1025_codex_project\\projects\\015-process-visualization-lab\nnpm.cmd run preview\n```\n\n默认首页从完整地球和月球开始，随后靠近旧金山港并回放同刻星历、验潮站实测和调和预报。潮汐讲解按五段 MiniMax 旁白推进，拖动时间轴后可从新的位置继续。页顶「地球事件」打开官方事件目录，「实验与设备」直接进入设备回放。浏览器访问 `http://127.0.0.1:4175/app/index.html`。服务只监听 `127.0.0.1`；按 Ctrl+C 停止。ES 模块需要 HTTP 预览。已归档的数据与地理底图可离线读取，外部官方入口需要联网；无法访问时展示失败状态和来源链接。\n\n```powershell\nnpm.cmd run check\nnpm.cmd test\n```\n\n检查脚本覆盖统一入口内容一致、原有50个控件与新增模式入口保留、新旧模块语法、事件 JSON 与 JMA 原始行和应用副本对应关系、6 幅日合成影像的实际尺寸／字节数／SHA-256 及源 WMS 参数，以及72张B13显示帧的尺寸／SHA-256／扫描时窗、73个时钟刻度、缺帧和三类地面序列数量。测试保留旧模型与事件对比回归，覆盖同步取时与缺测、地区累计范围、共同图表时钟、云图UV与异步竞争、纹理缓存和测站标记；v10增加灰度映射、地理羽化宽度、原图模式、切换不改变源帧和缓存同步绑定检查。完整模式切换和参数恢复需另做浏览器验收；这些检查不等于卫星配准精度认证或专业科学验证。\n\n## 文件与实现\n\n- `app/globe-app.js`：统一地球的原理／真实事件模式、时间、面板、参数快照与证据窗口；同步播放先准备下一帧，再统一提交时钟、画面和读数。\n- `app/globe-engine.js` 与 `app/archive-globe-layer.js`：复用同一渲染器，在原理效果与官方记录路径、真实影像之间切换。\n- `app/typhoon-archive.js`：真实档案加载校验、阶段说明、读数／图表模板与 `historical-event-archive` 导出。\n- `app/sync-timeline.js`：共同UTC时钟、原始记录取时、有效时限、缺测和资料包校验。\n- `app/sync-cloud-layer.js`与`sync-station-layer.js`：球面区域云图、融合／原图呈现、同帧纹理光照、地理边缘柔化、4帧缓存和真实测站标记。\n- `app/sync-change-data.js`与`sync-change-layer.js`：完整十分钟配对、网格和来源哈希校验，以及独立RGBA变化叠加；变化图另保留最多2帧缓存，原始亮温模式不显示。\n- `research/high-frequency-clouds/change-v11/`：由原16位亮温生成70张派生变化图的处理器、清单、方法说明和逐像元验证记录；应用读取`app/data/mangkhut-cloud-changes.json`。\n- `app/sync-observation-view.js`与`sync-observations.css`：四条共同时间轴曲线、地区雨量范围、读数与同步报告。\n- `app/data/mangkhut-synchronized.json`：卫星与地面观测的可追溯接入包；`scripts/build-sync-bundle.py`可从研究资料重建。\n- `research/high-frequency-clouds/`：HSD转换器、原始对象清单、处理参数和校验记录；`wide-v10/`保存扩大范围的处理配置、清单和数值亮温。大型原始HSD下载留在D盘工作区，项目不重复复制约1.75GB源档，URL及SHA完整保留。\n- `app/assets/events/himawari8-b13-wide/`：v10的2048×1664显示PNG；v9的1024×878显示PNG继续保留在`app/assets/events/himawari8-b13/`，对应原研究目录中的数值亮温与清单。\n- `research/hko-mangkhut-observations/`与`research/real-events/hong-kong-sea-level/`：原始报文、CSV、解析器、逐条来源及口径说明。\n- `app/archive-mode.css`：同地球模式切换、影像日期与证据窗口样式。\n- `app/event-comparison.js`、`comparison-report.js`与`comparison-view.js`：原始记录比较、可追溯结论和A/B表格。\n- `app/event-analysis.css`、`real-motion.js`与`real-motion.css`：解读流程、结论窗口与官方动态媒体播放。\n- `app/real-event-app.js` 与 `app/real-event-earth.js`：补充资料页的独立阅读布局和地球视图。\n- `app/real-event-data.js`：无补点的数据校验、真实记录选择、指标序列及 UTC+8 时间格式。\n- `research/real-events/mangkhut-jma-source.txt`：JMA 原始单事件固定列记录，保留头部与全部 46 行。\n- `research/real-events/mangkhut-jma.json`：数据、单位、下载及修订信息、来源和解释边界。\n- `app/data/imagery-manifest.json`：2018-09-12—17 六幅全球影像的日期、投影、获取 URL、尺寸、字节数与 SHA-256；原始覆盖缺口保留。\n- `research/real-events/parse-mangkhut-jma.mjs`：从已提取单事件文本重新生成 JSON，不需要重新下载历史总档。\n- `research/real-events/extension-contract.md`：新增真实事件包的字段、证据、缺失值和媒体验收规则；为扩展设计，不表示各类数据源已经接通。\n\n## 如何继续扩展\n\n先在已接入的半日同步回放上补充更多日期和香港观测地点，再复用相同资料包接入更多台风。之后接入地震目录与测站波形、火山报告与卫星观测、河流水质站与流量，最后加入获得授权的设备遥测。每一步先定义用户问题、时间范围与证据，再选画面。设备从地球上的设施入口进入局部视图，不把内部机理画成全球自然过程。\n\n事件包必须声明几何与坐标系、时间和时区、指标与单位、媒体时间与投影、来源和许可、缺测与修订，以及哪些值来自观测、事后分析或计算。完整约定见 [事件扩展合同](research/real-events/extension-contract.md)。\n\n## 来源与权利\n\nJMA 数据从 [RSMC 最佳路径下载页](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html) 提取；[固定列格式](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/e_format_bst.html) 定义 UTC、经纬度、气压、风速及风圈半径；[气旋信息说明](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/advisory.html) 说明 10 分钟平均风速。读取的单事件修订日期为 2018-10-26，下载于 2026-11-04。\n\nJMA 网站 [使用条款](https://www.jma.go.jp/jma/en/copyright.html) 要求来源署名和加工说明；有特别权利说明的内容按特别说明处理。本产品对原始数据进行了提取、解析、换算与可视化，不是 JMA 官方产品。香港天文台的 [山竹专题](https://www.hko.gov.hk/en/informtc/mangkhut18/mangkhut.htm) 以官方入口呈现，未宣称获得其中第三方卫星图像或视频的再分发授权。\n\n应用和教学模型由本库独立实现；Three.js 使用 MIT 许可，副本见 `app/vendor`。已有 NASA 地理底图、地球模型和月面素材来源见 `research/asset-sources.json`；事件影像按新增媒体清单记录来源、日期与处理。原始呈现启发来自 [原帖地月视频](https://x.com/xiaoying_eth/status/2116389253060190271)，原视频制作来源仍未确认，不能将本产品归属于原作者。本项目没有新增统一商业许可声明。\n\n当前为 **12.0 本地研究原型，未公开部署**。\n\n",
      "passages": [
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 1,
          "endLine": 1,
          "text": "# 015 · 观象 · 地球过程与真实事件"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 3,
          "endLine": 3,
          "text": "![观象研究总览：原库、探索流程、产品实拍和扩展方向](assets/images/guanxiang-research-overview.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 5,
          "endLine": 5,
          "text": "[线上研究总览](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/) · [地球实测回放](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html) · [发布与验收记录](research/deployment.md)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 7,
          "endLine": 7,
          "text": "本研究从 50 站参考库和[原帖地月视频](https://x.com/xiaoying_eth/status/2116389253060190271)出发，探索如何用固定空间参照、共同时间轴和可追溯证据解释变化。先看原理示意，再用真实资料定格比较。地球、位置批注、读数、曲线与讲解对应同一观测时刻，观测与预报分别标注。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 9,
          "endLine": 9,
          "text": "**研究价值与边界。** 可复用于课堂、展陈和历史事件复盘。洪水、污染迁移和持续观测是延伸方向，依赖可定位、有时间和单位、可核查来源并标明缺测的资料。公开网页提供八个地球案例和 NASA B0005 电芯实验，柴油机案例保留论文和本地导入说明。总览图记录了包括本机柴油机实验在内的完整探索。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 11,
          "endLine": 11,
          "text": "**复现资料。** 仓库保存运行文件、来源与处理记录。大型科学原件、部分历史帧和本机导入数据随各案例的复现说明获取。完整资料校验需要相应原档。公开构建执行 `npm run build:site`，校验运行资料及 68 段压缩旁白。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 13,
          "endLine": 13,
          "text": "「地球过程」包含地月潮汐、台风、地震、火山、山火和河流。「实验与设备」公开提供 B0005 电芯近景与实测回放，吉林大学柴油机提供[本地复现说明](research/dynamics/jlu-diesel/README.md)。两个入口各有场景目录，共用回放时间轴和图表联动。[地球过程](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-tide-san-francisco) · [实验与设备](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#lab)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 15,
          "endLine": 15,
          "text": "**首版功能验收（桌面本地）**。六类地球过程共八个实测案例，另有两个设备实验。十个案例均实机核对了关键时刻跳转、主画面和图表的时刻一致、来源入口，以及对应导览章节。地球案例使用 MiniMax 旁白，设备用同步字幕。另抽查了山竹播放暂停、潮汐暂停后跳时刻再续讲、官方目录搜索及地球与设备分区切换。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 17,
          "endLine": 17,
          "text": "首版范围为已有资料的历史复盘。事件目录可搜索保存的官方快照，各案例展示各自的数据覆盖。真实洪水、实际污染事件和持续更新的观测流按新增能力另行验收。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 19,
          "endLine": 19,
          "text": "手机触摸时间轴时，松手后加载目标时刻。慢网下画面和读数按观测时刻对齐，载入失败可按「重试观测加载」。小屏讲解为当前画面留出空间，播放期间可暂停、拖动并续讲。[手机端讲解实拍](assets/images/mobile-guided-playback.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 21,
          "endLine": 21,
          "text": "手机回放按 390 × 844 的 Chromium 触屏模拟、约 1.5 Mbps 下行和 420 ms 延迟验收。另在 360 × 740、约 640 kbps 下行模拟潮汐讲解、触摸跳时刻后续讲，以及观测加载失败后的重试。手机真机与公开部署环境另行验收。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 23,
          "endLine": 23,
          "text": "MiniMax 原始 WAV 用于核验，浏览器优先播放同源 MP3。重新生成原音轨后，运行 `node scripts/compress-narration.mjs` 更新压缩版（需要 FFmpeg），再运行 `npm run check:narration`。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 25,
          "endLine": 25,
          "text": "**引导讲解。** 从一个能用观测回答的问题开始。先用动态示意说明现象与影响，再用真实案例回答“哪里变了、怎么变、用什么证据判断”。示意、观测、预报和解释分别标注。真实回放的镜头、批注和图表指向同一条记录，来源与缺测可查。新案例沿用这套顺序，场景目录同时提供「引导讲解」和直接回放。地球案例配 MiniMax 语音，设备使用同步字幕。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 27,
          "endLine": 27,
          "text": "山竹和轩岚诺的「台风形成」开篇用侧视和俯视动画讲解雷雨扰动、暖湿空气上升、凝结放热、低层汇入与北半球的逆时针环流。四个阶段可直接跳转，也可进入各自的卫星回放。[台风形成导览实拍](assets/images/storm-formation-guide.png) · [NOAA 原理说明](https://oceanservice.noaa.gov/facts/how-hurricanes-form.html)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 29,
          "endLine": 29,
          "text": "日本东北和花莲的「地震原理」开篇从断层锁住和应力积累讲到突然滑动，再同步推进纵波、横波与两条示意波形。[地震导览截图](assets/images/quake-formation-guide.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 31,
          "endLine": 31,
          "text": "汤加导览从地球定位洪阿火山，再进入三维剖面。镜头和批注随 MiniMax 旁白依次聚焦板块俯冲、释水与部分熔融、岩浆上升、减压起泡和喷发。可暂停跳到某一步，也可切换剖面角度。原理段结束后直接接入 NIWA 实测海底地形，随后回放 Himawari-8 红外扫描。三维剖面标为原理示意，两期测绘日期与卫星观测时刻分别标注。[汤加三维导览截图](assets/images/volcano-3d-primer.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 33,
          "endLine": 33,
          "text": "**在主画面看实测变化。** 点击「MiniMax 边播边讲」，两侧图表与主画面沿同一观测时钟推进。汤加、轩岚诺和山竹的关键扫描会放大并逐帧慢放，同一段保持固定地理取景。位置标注移到侧边，空间不足时移到画面下方。缩放、旋转或选测点时旁白继续，拖动时间轴可从新时刻继续。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 35,
          "endLine": 35,
          "text": "**Dixie 山火边界复盘。** 同一地球播放器按档案日期切换九期航空红外边界。橙色显示本期新划入的范围，蓝色填充显示前一期划入而本期未划入的范围。地图、制图面积和 MiniMax 讲解随档案日期推进。附近测站风按当地小时核对，可切换高程阴影、火前燃料植被和地名地图。8 月 2 日与 3 日在所用档案中缺失。[打开 Dixie 复盘](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-wildfire-dixie) · [来源与复现](research/dynamics/dixie-fire/README.md)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 37,
          "endLine": 37,
          "text": "**讲完后回看证据。** Dixie 在同一组航空红外边界上切换新增范围、测站风、坡度和火前植被。轩岚诺可以点回东海起点、缺档前后的两幅原始扫描和末帧的强度分析。点卡片时，主画面和两侧图表跟随对应记录；继续拖时间轴会保留回看面板。[Dixie 坡度回看实拍](assets/images/dixie-evidence-recap.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 39,
          "endLine": 41,
          "text": "- [汤加火山](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-volcano)、[轩岚诺](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-storm)和[山竹](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#typhoon-real)：当前真实红外云图上叠加上一幅的低温边缘（金色）和本幅新增的低温区（青色）。汤加使用亮温低于 220 K，两个台风使用亮温不高于 235 K。两幅扫描时刻在图例列出。缺帧断开比较；「原始亮温」可查看不含这层对照的当前扫描。亮温变化可由云带移动、扩展或冷却造成，不能反推云高或灰浓度。\n- [日本东北地震](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-quake)和[花莲地震](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-quake-hualien)：台站旁的正负刻线显示当前一秒窗的范围，画面内的近 60 秒记录和峰值条把同站震前与当前放在固定刻度上比较。单位是原档仪器计数。\n- [Big Piney 河](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-river-big-piney)：两岸实测点的浓度弧会随样本变大或缩小。画面内的三个断面依次显示首次持续信号及相对释放时刻，可直接点选断面。弧线大小只编码测点读数，测点之间没有推算染料分布。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 43,
          "endLine": 43,
          "text": "**v22 · 吉林大学柴油机 ETC 台架。** [查看本地复现说明](research/dynamics/jlu-diesel/README.md)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 45,
          "endLine": 45,
          "text": "从「实验与设备」打开柴油机，即可观看通用共轨柴油机的单缸剖面。曲轴和活塞随实测转速做慢放示意。首播 30–90 秒：38.5 秒扭矩首笔为零，转速仍有 3,197 rpm；85.6 秒转速降至 753 rpm。左侧显示当前读数和附近 12 秒的变化，右侧给出整段工况与同刻游标。点击剖面旁的仪表可突出对应图表。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 47,
          "endLine": 47,
          "text": "完整 18,000 笔记录可按 0.1 秒逐笔查看。转速和扭矩为台架实测，轨压显示原档 RP（hPa 换算为 MPa），档案未说明是传感器反馈还是控制设定。剖面只作结构示意。原档仅供本地研究回放；[来源、校验与导入步骤](research/dynamics/jlu-diesel/README.md)。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 49,
          "endLine": 49,
          "text": "![柴油机剖面、38.5 秒同刻台架仪表和两侧曲线](assets/images/jlu-diesel-v22.jpg)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 51,
          "endLine": 51,
          "text": "**v21 · NASA B0005 首次放电。** [打开 B0005 实测回放](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-battery-b0005)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 53,
          "endLine": 53,
          "text": "打开 B0005 便进入电芯近景，外壳打开后露出典型圆柱电芯的卷绕结构示意。外部仪表、两侧读数和三条曲线使用同一笔 NASA 采样。电流保留原始符号，外部电流指示的亮度反映实测电流幅值，温度只对应实验记录的单点数值。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 55,
          "endLine": 55,
          "text": "197 笔记录覆盖原档经过时间 00:00:00.000 至 01:01:30.234。关键时刻可直达约 −2 A 的首笔、端电压最低点、电流回近零和记录末点。原档缺少时区与实验台坐标，回放以原始经过时间为轴。[NASA 数据目录](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets) · [原始档案与逐条复核](research/dynamics/b0005/README.md)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 57,
          "endLine": 57,
          "text": "![B0005 的电芯结构示意、同刻实测仪表和采样曲线](assets/images/b0005-discharge-v21.jpg)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 59,
          "endLine": 59,
          "text": "**v23 · 从地月全景飞到旧金山港。** [打开旧金山港回放](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-tide-san-francisco)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 61,
          "endLine": 61,
          "text": "打开先看到完整地球、月球和 NOAA 9414290 验潮站。「在地球上看潮汐」在同一三维场景叠加理想海面的两处隆起。地球自转时，示意海岸点和旁边的相对水位曲线同步变化。随后在同一场景旁用海岸剖面对照浅滩和航道的涨落。月球大小、距离和海面高差均按教学比例放大。[NOAA 潮汐原理](https://oceanservice.noaa.gov/facts/moon-tide.html)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 63,
          "endLine": 63,
          "text": "「直接看港口实测」从地月全景飞向旧金山，通过 USGS 港湾航拍定位，再淡入岸边视角。月升、月落时自动聚焦 0° 几何地平线，月面由地平线遮挡。月球图像、距离和近地平线的仰角变化采用显示比例。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 65,
          "endLine": 65,
          "text": "码头、桩柱和水尺为固定示意，青色水线只随 NOAA 实测潮位升降，垂直变化放大。金色虚线预报保留在右侧图表，和实测共用 MLLW 基准。两组潮位记录与 JPL 月球星历各有 240 个六分钟采样，跟随同一 UTC 时间轴，另列港口当地时间。拖动时间轴或跳到关键时刻后，可从当前时刻继续讲解。[数据来源与逐条复核](research/dynamics/san-francisco-tide/README.md) · [USGS 航拍底图](https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 67,
          "endLine": 67,
          "text": "讲解播放时可以旋转地球、切换视角、缩放港口、点击标注或打开读数。手动操作镜头后，点播放器上的「回到讲解镜头」即可恢复自动取景。拖动潮汐时间轴时，松开会从对应章节和语音位置继续；原本暂停则继续保持暂停。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 69,
          "endLine": 69,
          "text": "![旧金山港视角下的月升、岸边水线与两侧同刻图表](assets/images/san-francisco-harbor-v23.jpg)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 71,
          "endLine": 71,
          "text": "[潮峰实机截图：19:54 UTC，岸边水线达到当天最高采样](assets/images/san-francisco-tide-high-v23.jpg)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 73,
          "endLine": 73,
          "text": "**v19 · Big Piney 河实地示踪。** [打开实测回放](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-river-big-piney)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 75,
          "endLine": 75,
          "text": "镜头从完整地球飞入密苏里州 Big Piney 河段。航拍影像与 USGS 河道中心线提供定位，六个实测点上的浓度柱和光环随读数变化。左侧比较三个断面，右侧显示所选断面两岸的曲线。自动观察会随三个左岸持续信号切换断面。点击地图标注、左侧断面或关键时刻可以自己核对。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 77,
          "endLine": 77,
          "text": "自动观察覆盖释放参考时刻前 10 分钟至后 6 小时，时间轴可拖至完整记录。左岸在三个断面的持续信号时刻为 +00:58:30、+02:07:30、+03:34:30。判据取连续三次达到 3 ppb 的首笔记录，峰值单独标明。档案保留相对时钟和本地钟，缺测留空。柱高使用统一平方根尺度，实际浓度读数和曲线保留 ppb。测点之间的河段只提供地理背景。[原始数据和逐行复核](research/dynamics/big-piney/README.md) · [航拍与河道来源](research/dynamics/big-piney/geography/README.md)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 79,
          "endLine": 79,
          "text": "![Big Piney 断面 1 的两岸读数、同刻游标和地理位置](assets/images/big-piney-observation-v19.jpg)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 81,
          "endLine": 81,
          "text": "**v18 · 从地球定位进入实测回放。** [轩岚诺台风](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-storm) · [日本东北地震](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-quake) · [花莲地震](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-quake-hualien) · [山竹复盘](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#typhoon-real)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 83,
          "endLine": 83,
          "text": "轩岚诺和两个地震案例先展示完整地球，再靠近观测区域。可以暂停或点击关键时刻。台风默认对照固定窗口的低温面积和 JMA 最大持续风速，分别标注卫星扫描时间与分析时间。地震默认显示所选台站的波形，球面放大所选站最近 60 秒的轨迹。展开「全部读数与曲线」查看辅助指标。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 85,
          "endLine": 85,
          "text": "轩岚诺的「开始台风导览」依次定位云系、观察北移、辨认缺档和核对强度。近景白线取自 Natural Earth 1:5000 万海岸线（4.1.0，公有领域），用济州岛和朝鲜半岛南岸作为固定参照。末帧实拍同时显示 13:30 UTC 红外扫描、12:00 UTC 的 JMA 事后中心分析和同一回放时钟下的曲线。[实拍](assets/images/hinnamnor-evidence.png) · [海岸线来源](https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-coastline/)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 87,
          "endLine": 87,
          "text": "花莲与东北地震共用播放、台站切换、图表和导出。花莲三个 BHZ 垂直通道各有 480 个实测一秒窗，章节点是各站在该时段的峰值窗。两场地震均提供 MiniMax 旁白和同步字幕。[花莲来源与复核](research/dynamics/hualien/README.md)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 89,
          "endLine": 89,
          "text": "汤加、轩岚诺、山竹香港同步观测、两场地震和 Big Piney 均可边听边查看画面、标注和图表。拖动时间轴后，讲解定位到对应章节的进度，画面与两侧图表一起提交该时刻。原本播放时松手续播，原本暂停时保持暂停。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 91,
          "endLine": 91,
          "text": "![花莲地震台北站峰值的地球标注和实测波形](assets/images/hualien-observation-v18.jpg)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 93,
          "endLine": 93,
          "text": "下一批场景已取回并核对官方数据样本，当前用于确定接入方式。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 95,
          "endLine": 100,
          "text": "| 方向 | 已核对的记录与第一版呈现 |\n| --- | --- |\n| 地月与港口潮位 | 旧金山 9414290 站 2025-01-15 00:00–01:00 UTC 有 11 个与月球星历匹配的六分钟刻度。地球呈现站点视角下的月球方位和高度，侧边对照实测和预报潮位，单位 m、基准 MLLW。[NOAA 实测查询](https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=20250115&end_date=20250115&station=9414290&datum=MLLW&time_zone=gmt&units=metric&application=web_services&format=json&product=water_level) · [NOAA 预报查询](https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=20250115&end_date=20250115&station=9414290&datum=MLLW&time_zone=gmt&units=metric&application=web_services&format=json&product=predictions&interval=6) · [JPL 月球星历查询](https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=%27301%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27OBSERVER%27&CENTER=%27coord%40399%27&COORD_TYPE=%27GEODETIC%27&SITE_COORD=%27-122.46589%2C37.806305%2C0.0%27&START_TIME=%272025-01-15%2000%3A00%27&STOP_TIME=%272025-01-15%2001%3A00%27&STEP_SIZE=%276%20m%27&QUANTITIES=%274%2C10%2C20%27&CSV_FORMAT=%27YES%27&TIME_TYPE=%27UT%27) |\n| 河流迁移 | USGS Big Piney 河实地染料示踪。左岸在下游 1,485、2,650、3,670 米的浓度峰值，分别出现在释放后 1.17、2.43、4.16 小时。按释放后的时间播放三个断面的实测读数，可对照左右岸。现场试验的观测范围限于测点。[USGS 实验与原始数据](https://www.usgs.gov/data/situ-measurements-rhodamine-wt-dye-concentration-and-turbidity-made-during-a-tracer-experiment) |\n| 发动机 | 吉林大学 2.7 L 四缸柴油机 ETC 台架：18,000 笔，0.1 秒采样。转速和扭矩为实测，轨压为原档 RP；本机研究回放。[论文及图 1](https://scis.scichina.com/en/2019/077201.pdf) |\n| 电池 | NASA B0005 首次放电 197 条记录，包含端电压、电流和电池温度。相对起点约 1,796 秒的观测为 3.5299 V、−2.0148 A、32.87 °C。原始日期缺少时区，第一版使用放电经过时间。[NASA 档案](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets) |"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 102,
          "endLine": 102,
          "text": "**v17：先修复失败状态与证据导出，再按七方向规格扩展。** [查看 v17 历史规划源码](research/implementation-plan.html) · [打开真实过程](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-storm)。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 104,
          "endLine": 104,
          "text": "本批修复末帧重播失败仍进入播放、失败提示被覆盖，以及语音清单首次失败无法重试的问题。参考轮廓加载失败时显示明确状态与重试入口；重试保持原观测时钟，轮廓按事件ID及真实帧时间对应。原36段MiniMax音轨与四个真实案例保留。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 106,
          "endLine": 106,
          "text": "动态导出升级为schemaVersion 2，保留原有观测，同时记录请求、提交、实际显示时刻与加载状态。导出包括亮温显示、融合/光照、汤加空间聚焦和当前参考轮廓的来源版本、阈值、数值输入SHA及显示状态；影像失败时不把旧读数标成当前已显示画面。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 108,
          "endLine": 108,
          "text": "七方向的用户问题、动态对象、镜头顺序、最多两项主指标、最终成果与完成分级已写入[场景规格](research/scenario-specifications.json)；时空、来源独立更新、派生版本与MiniMax讲解流程见[运行合同](research/operating-contracts.json)。规划改为各方向独立数据准入，共用呈现使用已有代表资料直接启动。新增真实场景仍待逐项接入，规格完成不计为能力完成。验收见[验证记录](research/verification-v17.json)。下方保留历次说明。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 110,
          "endLine": 110,
          "text": "**v16：在地球上看变化，MiniMax讲解、关键位置和图表共用真实时钟。** [打开真实地球过程](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-volcano)，点击“MiniMax 边播边讲”。播放结束继续停留在地球，前后图片对照保留为手动核对入口。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 112,
          "endLine": 112,
          "text": "![真实地球过程、球面变化标注与同刻图表](assets/images/observed-earth-v16.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 114,
          "endLine": 119,
          "text": "| 过程 | 地球上的动态与解读 |\n| --- | --- |\n| 汤加喷发 | 25次真实红外扫描逐帧变化；同帧数值亮温提取低温阈值参考轮廓，配合原固定300公里统计圈、面积与区域P10曲线。关键时刻可一键定位 |\n| 东北地震 | 六台站实测针柱与波形继续由同秒记录驱动；标明所选台站和震中，点击台站标注对应当前真实计数与局部波形 |\n| 轩岚诺 | 23次真实扫描与低温阈值参考轮廓随时钟更新；同时标明当前可用及上一次JMA分析位置，区分扫描时间与官方分析时间 |\n| 山竹复盘 | 原72张云图、亮温变化、风、雨、海水位保留；机场与鲗鱼涌标注显示实际记录时刻，点击对应曲线，缺报不填零 |"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 121,
          "endLine": 121,
          "text": "标注直接注册到原有球面及相机。点击地球标注会突出对应读数和图表；MiniMax旁白沿真实观测时刻驱动过程。现有36段音频及脚本保持不变，未重复调用生成API。汤加融合显示在400—600公里间逐渐减弱周边图层，突出过程并减弱方形边缘；原始亮温模式保留完整资料窗口，原统计范围与数据不变。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 123,
          "endLine": 123,
          "text": "轮廓来自原有48帧uint16数值亮温，每8×8格取实际中心样本后提取阈值边线；汤加220 K、轩岚诺235 K，与原统计口径对应。采样格最大对角约23.09／33.17公里，只用于粗略定位，未校正云视差，不是精确云边界、火山灰识别或云高。区域P10是整个固定区域的统计量，标注位置指向该帧实际低温像元，不把区域值冒充单点测温。台站counts未转换为位移；两次分析位置的连线不解释为实际行进路线或风场。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 125,
          "endLine": 125,
          "text": "v16 验收时使用本地原型。截图均取自实际网页；参考原视频的中央地球、两侧证据与位置引线表达，未取得原作源码，不声称复刻其渲染。验收见[验证记录](research/verification-v16.json)，轮廓与显示复现见[动态资料说明](research/dynamics/README.md)。下方保留历史版本说明。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 127,
          "endLine": 127,
          "text": "**v15：四个真实事件配套演示，加入可操作的前后对照。** [打开产品](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#overview)，在“选一个问题，直接看真实变化”中选择事件。约17秒沿真实记录推进，结束后自动切换前后对照；可以回到A、查看B、重播，或在原时间轴自己观察。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 129,
          "endLine": 129,
          "text": "![汤加真实扫描前后对照与同刻统计](assets/images/demo-volcano-v15.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 131,
          "endLine": 136,
          "text": "| 配套演示 | 看什么、怎样验证 |\n| --- | --- |\n| 汤加喷发 | 同一区域两张实际红外亮温派生图可拖动分隔线核对；固定300 km内低于220 K区域由0到约69711 km²，不解释为火山灰云或受灾面积 |\n| 东北地震 | 松代台站震前05:46到05:49:20 UTC；前后各30秒实测计数记录用共同纵轴，保留窗内极值，不用符号反转解释强度增幅 |\n| 轩岚诺 | 对照实际云系及风速、气压；13:30 UTC的B分别显示卫星扫描与12:00官方分析，分析亮点画在实际记录时刻 |\n| 山竹 | 香港12:00到13:00；机场风79.636→111.12 km/h，站点海水位3.51→3.70 m，雨量保留两组地区范围及累计窗口 |"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 138,
          "endLine": 138,
          "text": "“地球动态”和“真实前后对照”在同一观察区切换，共用当前B时刻与原两侧图表。对照窗是实际记录的读图视图：卫星A/B沿同一地理窗口及180–310 K映射显示，地震使用同站同尺度的波形。不是另行播放的视频。图表中的青色A线固定起点，金色B线保留共同时间。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 140,
          "endLine": 140,
          "text": "下方“前后到底变了多少”显示A、当前B及可比较数值的差；展开证据可核对真实扫描窗、实际分析时间、台站源行/峰值采样与雨量累计口径。雨量范围不取中点、不计算假单站增量；云图区缺帧时不沿用旧图。手动调到A以前，会清除旧比较依据并明确提示。切换台站重新比较同一台站的A/B，切换主题退出旧任务。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 142,
          "endLine": 142,
          "text": "MiniMax原36段旁白、四类真实案例、官方事件目录、六类原理动画与山竹完整复盘继续可用。“听当前事件讲解”可进入已接入的中文语音导览。本轮没有生成新音轨或增加观测数据；重点改进演示组织、前后可见差别和证据验证。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 144,
          "endLine": 144,
          "text": "`npm test`覆盖播放区间、慢帧等待、退出、手动时间漂移后重新定位、缺测断线及无效比较清理。验收与截图见[验证记录](research/verification-v15.json)。v15 验收时使用本地原型。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 147,
          "endLine": 147,
          "text": "**v14：一键中文讲解，让地球、真实时间和证据一起讲清楚。** [打开产品](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#overview)，点击右上角“▶ 一键讲解”，约3分钟自动走过总览、汤加喷发、日本东北地震、轩岚诺和山竹，再进入来源说明。“讲解当前内容”则讲当前事件或原理。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 149,
          "endLine": 149,
          "text": "![MiniMax旁白带动真实过程与同刻图表](assets/images/narration-v14.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 151,
          "endLine": 151,
          "text": "讲解直接操作现有地球与真实记录，逐章定位视角、推进观测时刻、高亮对应图表。8章总览之外，四个实测事件各有4章、六类原理各有2章，共11套导览、36段旁白。章节按钮、上一章、下一章、暂停、继续、声音开关和退出均可操作；用户手动拖动时间或切换内容即退出自动讲解。离开页面时暂停，失败观测可重试，不代入其他帧；慢帧期间语音与讲解计时一起等待。退出后保留当前观察位置供继续探索。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 153,
          "endLine": 160,
          "text": "| 讲解流程 | 当前画面与内容 |\n| --- | --- |\n| 认识界面 | 完整地球定位、共同时间、两侧读图方式；明确总览是教学示意 |\n| 汤加 | 较早红外扫描→四小时实际云团变化→同帧300 km邻域统计 |\n| 东北地震 | 选松代实测台站，波形与同秒仪器counts一起起伏 |\n| 轩岚诺 | 早期云系→实际扫描推进→区分卫星与官方分析时刻 |\n| 山竹 | 香港12:00→13:00的云图、风、雨与海水位，保留各项实际时间与基准 |\n| 自由探索 | 打开资料来源，继续选事件、拖时钟、核对观测 |"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 162,
          "endLine": 162,
          "text": "声音使用 **MiniMax speech-2.8-hd / 温柔学姐 / 0.95语速**，按本项目中文脚本预生成36个32 kHz单声道WAV。总览音轨149.60秒，另有章节停留与加载时间；全套旁白666.696秒。网页播放本地音频，不重复请求生成API。音频不可用时明确显示字幕模式。凭据只由生成脚本读取外部配置，不进入前端或交付文件。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 164,
          "endLine": 164,
          "text": "前端文案与音轨通过文字、WAV结构、时长、非静音和SHA校验。`npm run check:narration`独立复核36段，`npm test`覆盖讲解切换、迟到异步结果、慢帧暂停、数据时刻及原有过程回归；具体交付验收见[验证记录](research/verification-v14.json)。音色、生成与复现说明见[MiniMax旁白资料](research/narration/README.md)。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 166,
          "endLine": 166,
          "text": "讲解沿用已有实测数据与显示边界：红外亮温不等于云高/灰浓度，counts不等于地面位移，站点海水位不等于风暴潮增水。山竹复盘、四类实测事件和六类原理入口全部保留。本地运行，未发布公网。下方保留历次迭代记录。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 169,
          "endLine": 169,
          "text": "**v13：三类真实动态过程已经进入同一地球。** [打开真实过程](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#dynamic-volcano)，选择汤加喷发、日本东北地震或轩岚诺。默认完整地球，可切换“过程特写”；支持播放、逐帧、拖动、原始亮温核对及带来源导出。[山竹同步复盘](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#typhoon-real)完整保留。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 171,
          "endLine": 171,
          "text": "![汤加喷发真实云团与同帧统计](assets/images/dynamic-volcano-v13.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 173,
          "endLine": 177,
          "text": "| 真实过程 | 接入资料与时窗（UTC） | 地球与两侧如何对应 |\n| --- | --- | --- |\n| 2022汤加喷发 | 2022-01-15 03:50—07:50，25次十分钟Himawari-8 B13扫描 | 实际亮温栅格注册到球面，逐次呈现喷发附近云团扩展；左侧同帧亮温图，右侧固定300km内低温区域面积与面积加权P10亮温 |\n| 2011东北地震 | 2011-03-11 05:45—06:05原始20Hz波形，六站共144000样本，汇成7200个1秒窗 | 地球上的台站波形条带与针柱、左侧六站包络、右侧所选台站波形采用相同窗末时刻；保留窗内最大绝对振幅的实际样本、min/max与源行 |\n| 2022轩岚诺 | 2022-09-05 03:00—13:30，23次20–30分钟扫描；4条三小时JMA分析 | 实际云系形态变化与固定区域亮温/低温像元面积曲线同帧；中心位置、风速、气压只引用当时或更早原始分析，另列实际分析时间 |"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 179,
          "endLine": 179,
          "text": "动态图层不是独立播放器：共用同一场景、相机和时间选择。影像就绪后才提交地球/读数/图表的共同时间；快速切换、迟到影像、失败帧和缺测有明确处理。卫星名义扫描时刻与实际所选分段扫描起止分别保留；非均匀帧间隔按UTC比例推进。统计曲线横轴使用真实时间，JMA稀疏分析画离散观测点。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 181,
          "endLine": 181,
          "text": "显示边界：红外亮温不是云高、灰浓度、降雨量或风场；汤加低温区域未区分气象云与火山云。纹理光照仅改善同帧层次，可关闭或切回固定亮温映射。地震保留去震前基线的仪器counts，未校正响应，按各站自身峰值独立归一化；针柱和60秒波形条带的尺寸是读图排版，不是地面位移或台站之间的波前。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 183,
          "endLine": 183,
          "text": "轩岚诺10:00扫描缺档，采用真实09:50/10:10扫描并保留20分钟间隔；14:00—15:00存在太阳杂散光/日食质量标记，因此本次展示止于13:30。原始文件、数值16bit亮温、统计方法、SHA256、实际扫描时窗、原始台站波形及独立核验结果保存在`research/dynamics/`。可运行`npm run check:dynamics`核对48张显示/数值图及同刻指标；各事件完整复现步骤见[动态资料说明](research/dynamics/README.md)。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 185,
          "endLine": 185,
          "text": "本轮具体界面与回归验收见[验证记录](research/verification-v13.json)。v13 验收时使用本地原型。以下保留v12及更早的阶段记录。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 188,
          "endLine": 188,
          "text": "**v12：完整地球 + 可更新事件目录 + 六类过程入口。** 默认打开[地球事件](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#events)，可筛选、检索 USGS 地震、USGS 火山状态通报与 NASA EONET 热带气旋报告；“更新官方资料”从公开接口获取最新目录并保留获取时间。默认视角和复位按窗口宽高显示完整球体，局部近看需单独选择。山竹同步回放与原有六类原理动画继续可用。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 190,
          "endLine": 190,
          "text": "![完整地球上的真实事件目录](assets/images/events-globe-v12.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 192,
          "endLine": 192,
          "text": "## v12：从可看的效果到可用的信息"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 194,
          "endLine": 201,
          "text": "| 入口 | 用户能做什么 | 当前边界 |\n| --- | --- | --- |\n| 地球事件 | 按类型、名称或事件ID找资料；定位真实坐标；查看时刻、震级／深度或火山通报状态；打开官方证据、导出记录 | 地震目录点与火山定位符号不是震波、喷发灰柱或影响范围 |\n| 地震发生顺序 | 选“地震”后沿实际发生时刻回放，已发生点逐个出现，图表突出同一条记录 | 不生成观测之间的波形、震动动画或虚构零值 |\n| 火山通报 | 查看 USGS 当前较高警戒级别目录中的官方状态、通报发布时间和火山目录位置 | 单次通报不是连续监测；较早 EONET 开放报告默认隐藏，可明确勾选查看；跨来源可能是同一火山的不同记录 |\n| 气旋报告 | 回放 EONET 已报告坐标和日期，核对来源 | 不是当前高频云图、完整风场或预报；日期级记录不解释为精确仪器时刻 |\n| 更多能力与接入 | 直接打开地月、火山、地震、台风、河流、电池原理动画；查看每个方向还需要哪些真实数据 | 已接入实地染料示踪、电芯放电和柴油机台架记录；模型只说明设备内部结构 |\n| 山竹复盘 | 使用原72张云图、70组亮温变化、风雨潮位及A/B对比理解一次完整事件 | 历史案例用于复盘，不作为当前天气 |"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 203,
          "endLine": 203,
          "text": "本次保存的官方快照获取于 **2026-11-04 14:15:36 UTC**，包含720条地震、2个热带气旋、3条USGS火山通报，以及32条较早EONET开放火山记录。默认近期入口显示725条资料，较早火山记录需勾选；这些计数是来源记录数，不是全球灾害总数。网页按钮刷新只替换当前会话资料；持久更新项目快照运行`npm run data:update`。任一来源失败保留上次完整资料及其原获取时间，不把失败或空白当作平静无事。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 205,
          "endLine": 205,
          "text": "资料获取与原始字节可追溯：共享浏览器/Node适配器在`app/live-event-feed.js`，更新器在`scripts/update-earth-events.mjs`，原始响应、SHA256、CORS验证与离线复现在`research/live-events/`。正式更新前不会混合不同尝试；本轮没有新增付费服务、密钥或后台定时任务。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 207,
          "endLine": 207,
          "text": "扩展所需数据、模型边界和用户价值见[六类扩展方向](research/extension-directions-v12.md)。本轮验收和实际页面截图见[验证记录](research/verification-v12.json)。原始资料、云图与观测时序均保留；v11及更早说明如下。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 210,
          "endLine": 210,
          "text": "用同一个地球组织过程原理与有出处的事件资料，帮助用户看懂“发生在哪里、怎样变化、判断依据是什么”。**v11 增加同帧纹理光照、云带特写视角，以及由相邻真实数值资料计算的“10分钟变化”叠加，让云系层次和变化更容易辨认**。山竹云图、香港机场风、东区小时降雨范围、鲗鱼涌海水位仍使用同一回放时钟。默认真实事件入口打开2018年9月16日08:00—20:00（北京时间）同步观测；全程路径对比与原理演示可在同页切换。原有六类效果、局部放大、A/B结论和补充资料均保留；其他五类尚未接入真实事件数据。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 212,
          "endLine": 212,
          "text": "产品面向科普作者、教师、新闻解读与事件复盘。地球负责空间定位，时间线负责选取真实时刻，图表负责展示变化，原始资料负责核对结论。用户可以比较山竹穿越吕宋前后的中心强度，再查看香港天文台对强风和风暴潮的解释。仅凭中心路径与中心风速不能推出香港每个地点的实际受灾程度。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 214,
          "endLine": 214,
          "text": "[地球过程全景 · 主入口](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#overview) · [当前地球中的真实山竹](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html#typhoon-real) · [完整事件资料 · 补充页面](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/real-event.html) · [事件扩展合同](research/real-events/extension-contract.md) · [返回研究总库](../../README.md#项目索引)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 216,
          "endLine": 216,
          "text": "![同一真实红外帧的纹理光照与云带特写](assets/images/cloud-relief-v11.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 218,
          "endLine": 218,
          "text": "## v11：看清纹理与十分钟变化"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 220,
          "endLine": 220,
          "text": "融合模式默认开启“立体光照”，从当前同一帧的空间纹理生成显示用明暗层次，不位移球面像元、不增加时间帧。它不是云高反演、实测阴影或光学厚度，按钮可关闭。“云带特写”只改变观察距离与视角，便于查看已有影像细节，不增加数据分辨率。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 222,
          "endLine": 222,
          "text": "“10分钟变化”默认关闭。开启后，在当前真实云图上叠加**同一地理格点亮温相对前十分钟的差值**：青色表示降低，金色表示升高。70组有效配对直接由保留的16位、0.01 K刻度亮温资料离线计算，没有从8位显示灰度反算；两份输入和结果各保留哈希与实际扫描时窗。仅在两帧均有效、任一帧低于265 K的位置呈现，差值绝对值超过4 K后逐渐显色，到12 K达到约0.65不透明度。这些阈值是显示选择，不是云分类或置信度。固定格点差值可以包含云体移入／移出等因素，不表示同一个云团的冷却、风向、风速或降雨变化。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 224,
          "endLine": 224,
          "text": "08:00没有前帧、10:40当前帧缺档、10:50前帧缺档（北京时间），均不显示变化，不跨过缺档配对。“原始亮温”模式关闭纹理光照与变化叠加，便于核对同一张未融合显示图。自动播放准备真实云图及已开启的变化图后再提交共同时间；当前变化对的起止时刻、加载状态和方法随JSON导出。风、雨、海水位和JMA曲线继续使用原来的观测与分析记录、采样口径和缺测规则。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 226,
          "endLine": 226,
          "text": "![相邻真实扫描在同一格点上的亮温降低与升高](assets/images/cloud-change-v11.png)"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 228,
          "endLine": 228,
          "text": "v11已通过88项自动化测试、资料完整性检查和实际浏览器验收；上图取自交付页面。桌面／小屏、缺帧、2×完整回放、原始模式、A/B与原理模式切换及导出均已核对。实施与测试边界见[迭代记录](research/iteration-v11.md)和[验收记录](research/verification-v11.json)；v10历史验收仍保留在[原记录](research/verification-v10.json)。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 230,
          "endLine": 230,
          "text": "## v10：真实云系融入地球"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 232,
          "endLine": 232,
          "text": "默认“云系融合”采用固定亮温色表突出较冷区域，保留同一帧中的纹理层次；暖区逐渐透明，让历史海陆底图可见。285 K及以上不显示该层，从285 K降至240 K时逐渐增加展示不透明度，240 K及以下达到0.94的不透明度；覆盖边缘另按经纬度3°平滑减弱。这些是阅读用的显示参数，不是实测云量、云分类结果或光学厚度。扩大覆盖范围与边缘柔化共同弱化矩形贴片的硬边，不改变云的位置、高度或时间。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 234,
          "endLine": 234,
          "text": "“原始亮温”关闭融合色表与边缘柔化，按180 K白、310 K黑显示同一张灰度图，保留覆盖边界和原有无效像元。这里的“原始”指未做融合的亮温显示图：它已经过HSD标定、区域重投影与8位灰度编码，不是未经处理的HSD文件，也不是完整精度的数值栅格。融合阈值由显示灰度近似反推亮温，仅用于呈现；原始HSD及独立的uint16厘开尔文亮温栅格仍保留用于数值核对。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 236,
          "endLine": 236,
          "text": "新增前后10分钟按钮，可逐刻度检查同一真实扫描帧及对应读数。自动播放先准备下一张真实帧，准备期间保留当前画面、时钟和读数，准备好后一起切换；缓存命中时直接绑定，不先清空地球。手动选择尚未加载的帧会显示加载状态，旧帧不会冒充新时刻。预加载失败会在对应时刻隐藏云图并重试一次，再次失败则明确显示失败；已知缺档仍留空。没有时间插帧、跨帧混合、程序旋转云团或额外生成的云层。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 238,
          "endLine": 238,
          "text": "## 同一地球、同一时钟的真实观测"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 240,
          "endLine": 240,
          "text": "进入“真实事件 · 山竹”后默认打开“香港同步观测”。时间轴包含73个十分钟刻度，云图、两侧四条图表和地球上的真实测站标记读取同一时钟。曲线的金色虚线表示回放时钟，亮点表示实际记录；没有新采样时明确显示原记录时间和时间差，不插出不存在的观测。默认13:00，可核对机场风111.12 km/h、东区11:45—12:45累计范围2—48 mm、鲗鱼涌13:00海水位3.70 m（UHSLC站点零点）。这是按观测时间进行的历史复盘，不是模拟当时已经发布的信息：上述雨量公报实际在13:02发布，报告另列发布时间。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 242,
          "endLine": 247,
          "text": "| 资料 | 已接入的实际范围 | 时间与数值口径 |\n| --- | --- | --- |\n| 葵花八号 AHI B13 | 72张扩大范围的区域红外帧，2018-09-16 00:00—12:00 UTC，2048×1664；唯一缺档02:40 UTC | 复用同一批72个原始HSD对象，按EPSG:4326重投影至bbox=[85,-10,165,55]，没有增加观测时刻。10分钟名义扫描；每帧另保留实际扫描起止。未融合灰度图为180 K白、310 K黑；不是自然色或降雨图 |\n| 香港国际机场风 | 三天存档128条常规METAR；主窗20条半小时记录 | 原生kt按1.852换算km/h；通常10分钟平均风，半小时是报文间隔。主窗08:00—10:00缺报，不沿用07:00读数 |\n| 东区一小时雨量 | 92份官方历史RSS，41个原始小时窗口；主窗12个窗口 | 地区内测站最小—最大累计量，保留上下限，不取中点。17:45—18:45窗口未列东区，显示缺测。发布时间、归档时间另存，不称即时发布 |\n| 鲗鱼涌海水位 | UHSLC研究质量329B序列，271条原始整点记录；主窗13条 | 整点1分钟平均，每小时一条，单位m·UHSLC站点零点。没有施加海图基准面换算，不是风暴潮增水 |"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 249,
          "endLine": 249,
          "text": "卫星缺档10:40（北京时间）显示历史底图和缺帧说明，其他观测继续按自身时间读取。现用72张显示PNG合计208,624,292字节；浏览器只缓存最多4张纹理，并预加载最多3张邻帧。快速拖动或切模式时，过期请求失效。v9的1024×878、bbox=[105,5,140,35]影像保留归档；v10当前显示使用扩大范围的新影像，两个版本来自同一批原始观测，不能合计成更多扫描帧。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 251,
          "endLine": 251,
          "text": "观测取时采用“该时刻或更早的最近原始记录”，风最多30分钟、雨窗结束最多60分钟、海水位最多60分钟；超出或遇到明确缺测记录就留空。雨图每个块的横向长度是累计窗口、纵向范围是地区测站上下限。JMA中心点及中心风曲线仍是6小时事后分析，注明最近分析时刻，不画成十分钟实测中心。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 253,
          "endLine": 253,
          "text": "同步JSON导出包含共同时间、卫星选择/实际显示状态、融合或原始亮温模式、影像覆盖范围、各观测原始字段、缺测时的最近源记录、站点、垂直基准和来源；TXT/复制结论附实际观测窗和可核对的历史公报链接。原来的“全程路径对比”继续提供A/B比较。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 255,
          "endLine": 255,
          "text": "来源：[NOAA/JMA Himawari开放档案](https://registry.opendata.aws/noaa-himawari/)、[NOAA NCEI机场原报文](https://www.ncei.noaa.gov/access/services/data/v1?dataset=global-hourly&stations=45007099999&startDate=2018-09-14T16:00:00Z&endDate=2018-09-17T15:59:59Z&format=json&includeAttributes=true)、[香港政府原始天气公报快照示例](https://app.data.gov.hk/v1/historical-archive/get-file?url=https%3A%2F%2Frss.weather.gov.hk%2Frss%2FCurrentWeather.xml&time=20180916-1315)、[UHSLC鲗鱼涌329B](https://uhslc.soest.hawaii.edu/data/csv/rqds/pacific/hourly/h329b.csv)。署名JMA/NOAA、香港天文台／香港特区政府、DATA.GOV.HK、UHSLC/JASL。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 257,
          "endLine": 257,
          "text": "云图标定与导航经过独立像元重算核验；这不等于外部地理定位精度认证，高云视差未校正。B13图显示区域内的红外亮温，有云时主要反映云顶，晴空像元也包含地表或海面信息；有效像元不等于云掩膜。UHSLC同站同版本的另一接口有一条1 mm数值差异，原因未确认，保留主CSV并记录差异，未混补。整点采样最大3.73 m（UHSLC站点零点）与天文台报告的事件最高海水位3.88 m（海图基准面以上）在采样与基准说明上不同，不能直接互相替换。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 259,
          "endLine": 259,
          "text": "## 保留的事件比较与解读"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 261,
          "endLine": 261,
          "text": "在“全程路径对比”中，点击“对比9/14→9/16”可比较山竹2018年9月14日14:00与9月16日14:00（北京时间）：中心最大持续风速110→75 kt、中心气压905→960 hPa。A、B同时显示在地球与两条曲线上，用户可固定当前记录为A，再移动时间轴选择B。从同步观测切到路径对比时，B沿用同步时钟选中的最近一次JMA分析，不一定是该预设终点。预设两条中心坐标距香港参照点约1358.4→96.5 km，这一距离由坐标计算，不是当地测站风速、实测影响范围，也不能用来验证香港天文台报告的精确最接近时间。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 263,
          "endLine": 263,
          "text": "“开始事件解读”按抵近吕宋、靠近香港、进入内陆三个问题回放真实记录，每段到关键时刻自动停下，用户阅读对比后再继续。手动选择记录会退出引导；过程中不补造缺测数据。导出结论包含原始值、差值、时区、源行号、修订日期、方法与官方链接，可用于科普备稿、课堂讨论和事件复盘。倒序选择只比较数值，同一记录提示另选时刻。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 265,
          "endLine": 265,
          "text": "“看真实动态影像”提供NASA SVS官方山竹视频：2018年9月12–13日IMERG降水估计与GPM雷达三维结构。原生播放器读取NASA远程媒体，需联网，不与地球所选六小时时刻同步；播放失败时保留官方页面入口。另提供CIRA增强红外高频档案的官方Loop入口；高频区域影像在同步观测页签中直接贴到地球，这些独立视频仅作为补充来源。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 267,
          "endLine": 267,
          "text": "动态资料出处：[NASA SVS 4682](https://svs.gsfc.nasa.gov/4682)，署名NASA Scientific Visualization Studio，数据NASA/JAXA GPM；[CIRA/RAMMB 4 km Mercator增强红外档案](https://rammb-data.cira.colostate.edu/tc_realtime/archive.asp?product=4kmirimg&storm_identifier=wp262018)。CIRA仅保留外部核对入口；同步观测实际使用有完整导航与扫描时间头的NOAA/JMA原始HSD文件。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 269,
          "endLine": 269,
          "text": "## 保留的同地球双模式"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 271,
          "endLine": 271,
          "text": "台风的“原理演示”允许改变假设参数，查看理想云系与模型指标；“真实山竹”使用实际记录、单位与资料时间，不开放假设参数。切换后，中央地球、左侧解释、右侧读数与曲线、时间轴及来源说明一起变化。通过模式按钮返回原理演示时恢复之前保存的台风参数与进度。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 273,
          "endLine": 273,
          "text": "真实事件内有“香港同步观测”和“全程路径对比”两个页签。同步观测按十分钟共同回放时钟选取各自最近的有效原始资料；路径对比可选记录点、阶段或卫星日期，NASA日合成按可用日期加载，路径与风压按每六小时原始分析记录选择。NASA 原图、香港风速与潮位峰值、官方雷达链接可在当前页面的证据窗口查看。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 275,
          "endLine": 275,
          "text": "`index.html` 与 `globe.html` 是内容一致的统一入口；`real-event.html` 保留完整来源和独立阅读布局，属于补充资料页，主要操作不需要离开当前地球。真实资料缺失或加载失败时显示状态，不拿模拟值补作观测。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 277,
          "endLine": 277,
          "text": "## 路径对比与补充资料"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 279,
          "endLine": 285,
          "text": "| 内容 | 实际范围 | 可以怎样使用 |\n| --- | --- | --- |\n| JMA 山竹最佳路径 | 46 条原始记录，每 6 小时一条；2018-09-06 12:00 UTC 至 2018-09-17 18:00 UTC | 按实际记录定位台风中心，对比中心气压、最大持续风速；图表与地球读取同一条记录 |\n| 中心强度 | 风速单位 kt，10 分钟平均；气压单位 hPa；39 条有数值风速、7 条风速留空 | 解释记录中的加强与减弱；110 kt 为本资料峰值，905 hPa 为最低中心气压 |\n| NASA 真实影像 | 2018-09-14 的官方局部影像；2018-09-12—17 共 6 幅 GIBS 全球日合成，每幅 4096×2048；来源和 SHA-256 见媒体清单 | 查看真实云系与地理背景；日合成影像不代表某一个瞬间，不能与 6 小时路径声称同刻采集 |\n| 官方效果入口 | 香港天文台山竹专题中的卫星、雷达动画及事件图表链接 | 查阅真实雷达回波、站点风、潮位和风暴潮资料 |\n| 来源与原始行 | 原始固定列文本、解析 JSON、字段说明、修订日期、下载时间、SHA-256 | 核对数值出处，复现解析，区分来源版本 |"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 287,
          "endLine": 287,
          "text": "记录范围包括热带低压阶段，早于部分以命名风暴为起点的专题日期。JMA 的 `000` 风速保守留为 `null`，保留原 token，不解释为静风、不填成零、不生成补点。显示时间转换为北京时间 UTC+8，保存值继续使用 UTC。风速换算为 km/h 时采用 `1 kt = 1.852 km/h`，并注明换算。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 289,
          "endLine": 289,
          "text": "**真实资料也有类型区别：JMA 数据是官方事后分析，不是每个路径点上的仪器直接测量，也不是当时发布的预报。** 来源机构之间的估计与风速平均时长可能不同，不能将 JMA、香港天文台和 JTWC 的风速混成同一条曲线。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 291,
          "endLine": 291,
          "text": "## 画面与数据的边界"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 293,
          "endLine": 300,
          "text": "- 全程路径对比按原始六小时分析记录逐条播放；同步观测按十分钟回放时钟选取资料，JMA中心仍只使用最近一次原始分析。记录间连线用于阅读路径或曲线，不代表期间新增观测，也不赋予线段之间的每一像素观测含义。\n- 地球表面的 NASA Blue Marble 素材是已有地理底图，不能当作 2018 年山竹同期卫星画面。观察角度、光照与标记大小服务于阅读，不是事件观测量。\n- 融合层的暖区透明、冷区色表和3°覆盖边缘柔化均是展示处理，不是实测云掩膜或新增观测。切换原始亮温模式不更换帧或时间；数值核对使用独立亮温数据和来源，不从融合后的颜色反求精确温度。\n- 全程路径对比页签中的 GIBS 日合成展示一天内获得的影像拼接，不能当作连续瞬时云图。路径每 6 小时一条与影像逐日更新属于不同时间分辨率；缺少日期影像时回到地理底图，不补帧。\n- NASA 局部图片保持原图查看入口；没有全球投影信息的裁切图片不能直接贴满地球。官方雷达／卫星视频是独立资料，未声称与本地时间线逐帧同步。\n- 同步观测已接入机场风、东区小时雨量范围和鲗鱼涌海水位；不是全香港完整观测网，没有从图片估读数值或提供风暴潮残差曲线。\n- JMA 最长／最短风圈半径只描述风圈摘要，不能据此冒充完整观测风场、云层厚度、降雨分布或城市受灾范围。\n- 当前用于历史事件解读和产品研究，不提供实时告警、灾害预测或设备运行决策。尚未验证用户理解收益与商业需求。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 302,
          "endLine": 302,
          "text": "## 保留的原理实验室"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 304,
          "endLine": 304,
          "text": "`app/index.html` 与 `app/globe.html` 提供地月、火山、地震、理想台风和河流输运五类地球原理，并可切换到山竹实测档案。`app/detail.html` 保留局部过程视图与电池放电教学模型。教学场景使用可调参数，结果由模型计算。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 306,
          "endLine": 306,
          "text": "旧模型有明确显示缩放和假设：地震波、理想台风风场及路径曾作 8 倍表现性放大；2 km 河段约放大 1000 倍；设施中的电池为假想 2 Ah 单体。真实山竹档案不把这些模型输出带入记录曲线。旧模型细节和历史验收见 [模型说明](research/notes.md)、[v5 验收](research/verification-v5.json) 与 [v5 迭代记录](research/iteration-v5.md)。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 308,
          "endLine": 308,
          "text": "## 本地运行与检查"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 310,
          "endLine": 310,
          "text": "Node.js 22 及以上。浏览器渲染使用仓库内的 Three.js 0.180.0，无需安装第三方依赖。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 312,
          "endLine": 315,
          "text": "```powershell\ncd E:\\codex_project\\1025_codex_project\\projects\\015-process-visualization-lab\nnpm.cmd run preview\n```"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 317,
          "endLine": 317,
          "text": "默认首页从完整地球和月球开始，随后靠近旧金山港并回放同刻星历、验潮站实测和调和预报。潮汐讲解按五段 MiniMax 旁白推进，拖动时间轴后可从新的位置继续。页顶「地球事件」打开官方事件目录，「实验与设备」直接进入设备回放。浏览器访问 `http://127.0.0.1:4175/app/index.html`。服务只监听 `127.0.0.1`；按 Ctrl+C 停止。ES 模块需要 HTTP 预览。已归档的数据与地理底图可离线读取，外部官方入口需要联网；无法访问时展示失败状态和来源链接。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 319,
          "endLine": 322,
          "text": "```powershell\nnpm.cmd run check\nnpm.cmd test\n```"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 324,
          "endLine": 324,
          "text": "检查脚本覆盖统一入口内容一致、原有50个控件与新增模式入口保留、新旧模块语法、事件 JSON 与 JMA 原始行和应用副本对应关系、6 幅日合成影像的实际尺寸／字节数／SHA-256 及源 WMS 参数，以及72张B13显示帧的尺寸／SHA-256／扫描时窗、73个时钟刻度、缺帧和三类地面序列数量。测试保留旧模型与事件对比回归，覆盖同步取时与缺测、地区累计范围、共同图表时钟、云图UV与异步竞争、纹理缓存和测站标记；v10增加灰度映射、地理羽化宽度、原图模式、切换不改变源帧和缓存同步绑定检查。完整模式切换和参数恢复需另做浏览器验收；这些检查不等于卫星配准精度认证或专业科学验证。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 326,
          "endLine": 326,
          "text": "## 文件与实现"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 328,
          "endLine": 335,
          "text": "- `app/globe-app.js`：统一地球的原理／真实事件模式、时间、面板、参数快照与证据窗口；同步播放先准备下一帧，再统一提交时钟、画面和读数。\n- `app/globe-engine.js` 与 `app/archive-globe-layer.js`：复用同一渲染器，在原理效果与官方记录路径、真实影像之间切换。\n- `app/typhoon-archive.js`：真实档案加载校验、阶段说明、读数／图表模板与 `historical-event-archive` 导出。\n- `app/sync-timeline.js`：共同UTC时钟、原始记录取时、有效时限、缺测和资料包校验。\n- `app/sync-cloud-layer.js`与`sync-station-layer.js`：球面区域云图、融合／原图呈现、同帧纹理光照、地理边缘柔化、4帧缓存和真实测站标记。\n- `app/sync-change-data.js`与`sync-change-layer.js`：完整十分钟配对、网格和来源哈希校验，以及独立RGBA变化叠加；变化图另保留最多2帧缓存，原始亮温模式不显示。\n- `research/high-frequency-clouds/change-v11/`：由原16位亮温生成70张派生变化图的处理器、清单、方法说明和逐像元验证记录；应用读取`app/data/mangkhut-cloud-changes.json`。\n- `app/sync-observation-view.js`与`sync-observations.css`：四条共同时间轴曲线、地区雨量范围、读数与同步报告。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 336,
          "endLine": 343,
          "text": "- `app/data/mangkhut-synchronized.json`：卫星与地面观测的可追溯接入包；`scripts/build-sync-bundle.py`可从研究资料重建。\n- `research/high-frequency-clouds/`：HSD转换器、原始对象清单、处理参数和校验记录；`wide-v10/`保存扩大范围的处理配置、清单和数值亮温。大型原始HSD下载留在D盘工作区，项目不重复复制约1.75GB源档，URL及SHA完整保留。\n- `app/assets/events/himawari8-b13-wide/`：v10的2048×1664显示PNG；v9的1024×878显示PNG继续保留在`app/assets/events/himawari8-b13/`，对应原研究目录中的数值亮温与清单。\n- `research/hko-mangkhut-observations/`与`research/real-events/hong-kong-sea-level/`：原始报文、CSV、解析器、逐条来源及口径说明。\n- `app/archive-mode.css`：同地球模式切换、影像日期与证据窗口样式。\n- `app/event-comparison.js`、`comparison-report.js`与`comparison-view.js`：原始记录比较、可追溯结论和A/B表格。\n- `app/event-analysis.css`、`real-motion.js`与`real-motion.css`：解读流程、结论窗口与官方动态媒体播放。\n- `app/real-event-app.js` 与 `app/real-event-earth.js`：补充资料页的独立阅读布局和地球视图。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 344,
          "endLine": 349,
          "text": "- `app/real-event-data.js`：无补点的数据校验、真实记录选择、指标序列及 UTC+8 时间格式。\n- `research/real-events/mangkhut-jma-source.txt`：JMA 原始单事件固定列记录，保留头部与全部 46 行。\n- `research/real-events/mangkhut-jma.json`：数据、单位、下载及修订信息、来源和解释边界。\n- `app/data/imagery-manifest.json`：2018-09-12—17 六幅全球影像的日期、投影、获取 URL、尺寸、字节数与 SHA-256；原始覆盖缺口保留。\n- `research/real-events/parse-mangkhut-jma.mjs`：从已提取单事件文本重新生成 JSON，不需要重新下载历史总档。\n- `research/real-events/extension-contract.md`：新增真实事件包的字段、证据、缺失值和媒体验收规则；为扩展设计，不表示各类数据源已经接通。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 351,
          "endLine": 351,
          "text": "## 如何继续扩展"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 353,
          "endLine": 353,
          "text": "先在已接入的半日同步回放上补充更多日期和香港观测地点，再复用相同资料包接入更多台风。之后接入地震目录与测站波形、火山报告与卫星观测、河流水质站与流量，最后加入获得授权的设备遥测。每一步先定义用户问题、时间范围与证据，再选画面。设备从地球上的设施入口进入局部视图，不把内部机理画成全球自然过程。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 355,
          "endLine": 355,
          "text": "事件包必须声明几何与坐标系、时间和时区、指标与单位、媒体时间与投影、来源和许可、缺测与修订，以及哪些值来自观测、事后分析或计算。完整约定见 [事件扩展合同](research/real-events/extension-contract.md)。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 357,
          "endLine": 357,
          "text": "## 来源与权利"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 359,
          "endLine": 359,
          "text": "JMA 数据从 [RSMC 最佳路径下载页](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html) 提取；[固定列格式](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/e_format_bst.html) 定义 UTC、经纬度、气压、风速及风圈半径；[气旋信息说明](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/advisory.html) 说明 10 分钟平均风速。读取的单事件修订日期为 2018-10-26，下载于 2026-11-04。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 361,
          "endLine": 361,
          "text": "JMA 网站 [使用条款](https://www.jma.go.jp/jma/en/copyright.html) 要求来源署名和加工说明；有特别权利说明的内容按特别说明处理。本产品对原始数据进行了提取、解析、换算与可视化，不是 JMA 官方产品。香港天文台的 [山竹专题](https://www.hko.gov.hk/en/informtc/mangkhut18/mangkhut.htm) 以官方入口呈现，未宣称获得其中第三方卫星图像或视频的再分发授权。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 363,
          "endLine": 363,
          "text": "应用和教学模型由本库独立实现；Three.js 使用 MIT 许可，副本见 `app/vendor`。已有 NASA 地理底图、地球模型和月面素材来源见 `research/asset-sources.json`；事件影像按新增媒体清单记录来源、日期与处理。原始呈现启发来自 [原帖地月视频](https://x.com/xiaoying_eth/status/2116389253060190271)，原视频制作来源仍未确认，不能将本产品归属于原作者。本项目没有新增统一商业许可声明。"
        },
        {
          "path": "projects/015-process-visualization-lab/README.md",
          "startLine": 365,
          "endLine": 365,
          "text": "当前为 **12.0 本地研究原型，未公开部署**。"
        }
      ],
      "registryPassage": {
        "path": "projects.json",
        "startLine": 259,
        "endLine": 276,
        "text": "    {\n      \"id\": \"015\",\n      \"slug\": \"process-visualization-lab\",\n      \"name\": \"观象 · 地球过程与真实事件\",\n      \"summary\": \"用同一时间轴联动原理、真实资料、画面、曲线和中文讲解。公开八个地球历史案例及 NASA B0005 放电实验，可追溯关键时刻的观测来源。\",\n      \"source\": \"https://x.com/xiaoying_eth/status/2116389253060190271\",\n      \"sourceName\": \"研究起点 · 50 站清单与地月配视频\",\n      \"status\": \"building\",\n      \"tags\": [\n        \"交互地球\",\n        \"过程可视化\",\n        \"真实事件\",\n        \"资料溯源\"\n      ],\n      \"cover\": \"assets/images/guanxiang-research-overview.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/\",\n      \"createdAt\": \"2026-11-04\"\n    }"
      }
    }
  ]
};
