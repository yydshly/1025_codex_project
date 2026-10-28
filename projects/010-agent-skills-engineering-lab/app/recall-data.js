// Generated from the project registry and allowlisted README files.
globalThis.RECALL_CORPUS = {
  "schemaVersion": 1,
  "generatedAt": "2026-10-28T13:01:49.082Z",
  "registrySha256": "bda61e22f94da243e282ad77646198d3f214b11365448f846656c0ea5ac92ab3",
  "projects": [
    {
      "id": "001",
      "slug": "early-directions-atlas",
      "name": "早期方向档案",
      "summary": "我们早期思考与尝试留下的十二个方向：需求与变现、内容获客、轻量产品、价格册、音频局部修改、3D咖啡、共想室、岗位观察、跨设备、论文、艺术短片与AI室友。按候选、方案、原型、阶段作品及停止项保存进展、依据和待验证问题。",
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
        "text": "    {\n      \"id\": \"001\",\n      \"slug\": \"early-directions-atlas\",\n      \"name\": \"早期方向档案\",\n      \"summary\": \"我们早期思考与尝试留下的十二个方向：需求与变现、内容获客、轻量产品、价格册、音频局部修改、3D咖啡、共想室、岗位观察、跨设备、论文、艺术短片与AI室友。按候选、方案、原型、阶段作品及停止项保存进展、依据和待验证问题。\",\n      \"source\": \"https://github.com/yydshly/1025_codex_project\",\n      \"sourceName\": \"本库原创档案（无上游源库）\",\n      \"status\": \"completed\",\n      \"tags\": [\n        \"早期思考\",\n        \"遗留方向\",\n        \"AI产品\",\n        \"创作\",\n        \"历史回溯\"\n      ],\n      \"cover\": \"assets/images/directions-map-v1.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/\",\n      \"createdAt\": \"2026-10-26\"\n    },"
      }
    },
    {
      "id": "002",
      "slug": "ink-rain-alley",
      "name": "未完 · 水墨叙事",
      "summary": "依据Bee录屏独立重写纸墨九章叙事：雨巷、拼贴、森林、四季湖景、莲花与墨圈，以滚动、画幅变化和自然微动组织观看。沉淀场景进度、遮罩与声音实现；未取得原作源码，视觉仍有差异。",
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
        "text": "    {\n      \"id\": \"002\",\n      \"slug\": \"ink-rain-alley\",\n      \"name\": \"未完 · 水墨叙事\",\n      \"summary\": \"依据Bee录屏独立重写纸墨九章叙事：雨巷、拼贴、森林、四季湖景、莲花与墨圈，以滚动、画幅变化和自然微动组织观看。沉淀场景进度、遮罩与声音实现；未取得原作源码，视觉仍有差异。\",\n      \"source\": \"https://x.com/thtbee_/status/2114030630887641448\",\n      \"sourceName\": \"Bee 原演示（未取得源库）\",\n      \"status\": \"completed\",\n      \"tags\": [\n        \"Three.js\",\n        \"WebGL\",\n        \"水墨叙事\",\n        \"程序生成\",\n        \"交互动画\"\n      ],\n      \"cover\": \"assets/images/cover.jpg\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html\",\n      \"createdAt\": \"2026-10-26\"\n    },"
      }
    },
    {
      "id": "003",
      "slug": "unified-learning-design",
      "name": "连续主题体验设计",
      "summary": "以 Every Joule 为参照独立实现三课三维物理书：翻页、立体器材与能量变化同屏呈现，支持调参实验、预测反馈、MiniMax逐句导览、文字放大和连续阅读。通过共享实验状态联动模型、数值、镜头与讲解，阅读后恢复原上下文。沉淀内容、展示、操作和解释统一设计的方法，供互动教材、原理说明与实验平台复用；扩展布局仍为设想。",
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
        "text": "    {\n      \"id\": \"003\",\n      \"slug\": \"unified-learning-design\",\n      \"name\": \"连续主题体验设计\",\n      \"summary\": \"以 Every Joule 为参照独立实现三课三维物理书：翻页、立体器材与能量变化同屏呈现，支持调参实验、预测反馈、MiniMax逐句导览、文字放大和连续阅读。通过共享实验状态联动模型、数值、镜头与讲解，阅读后恢复原上下文。沉淀内容、展示、操作和解释统一设计的方法，供互动教材、原理说明与实验平台复用；扩展布局仍为设想。\",\n      \"source\": \"https://github.com/iamtechartist/every-joule-lesson1\",\n      \"status\": \"completed\",\n      \"tags\": [\n        \"Three.js\",\n        \"3D书籍\",\n        \"效果复刻\",\n        \"交互学习\",\n        \"方法论\"\n      ],\n      \"cover\": \"assets/images/understanding-atlas.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/003-unified-learning-design/\",\n      \"createdAt\": \"2026-10-26\"\n    },"
      }
    },
    {
      "id": "004",
      "slug": "baocut-effects-atlas",
      "name": "BaoCut · 能力、原理与效果研究",
      "summary": "BaoCut 是 AI 可操作的视频编辑器与制作工作流。效果覆盖动效、讲解、产品片、混剪和故事；以代码动画、AI 静图运镜、已有素材剪辑组合成片，支持字幕、配音、检索与可编辑工程。价值主要在工具集成、反复修改和人工接手；附 24 个方向、20 段预览及原理说明，效率收益未实测。",
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
        "text": "    {\n      \"id\": \"004\",\n      \"slug\": \"baocut-effects-atlas\",\n      \"name\": \"BaoCut · 能力、原理与效果研究\",\n      \"summary\": \"BaoCut 是 AI 可操作的视频编辑器与制作工作流。效果覆盖动效、讲解、产品片、混剪和故事；以代码动画、AI 静图运镜、已有素材剪辑组合成片，支持字幕、配音、检索与可编辑工程。价值主要在工具集成、反复修改和人工接手；附 24 个方向、20 段预览及原理说明，效率收益未实测。\",\n      \"source\": \"https://github.com/JimLiu/baocut\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"BaoCut\",\n        \"视频制作\",\n        \"代码动画\",\n        \"素材剪辑\",\n        \"工作流研究\"\n      ],\n      \"cover\": \"assets/images/capability-map.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/004-baocut-effects-atlas/\",\n      \"createdAt\": \"2026-10-26\"\n    },"
      }
    },
    {
      "id": "005",
      "slug": "paper-poetics-lab",
      "name": "纸间 · 诗性风格实验室",
      "summary": "原参考以纸墨、画幅转换和自然微事件串起多场景诗性叙事。本研究用独立重写、实时茶庭与AI雨窗样片，沉淀氛围组织、载体选型和可复用工程方法；可扩展声画事件、纸墨与写实融合及文化展陈入口，仍需验证。",
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
        "text": "    {\n      \"id\": \"005\",\n      \"slug\": \"paper-poetics-lab\",\n      \"name\": \"纸间 · 诗性风格实验室\",\n      \"summary\": \"原参考以纸墨、画幅转换和自然微事件串起多场景诗性叙事。本研究用独立重写、实时茶庭与AI雨窗样片，沉淀氛围组织、载体选型和可复用工程方法；可扩展声画事件、纸墨与写实融合及文化展陈入口，仍需验证。\",\n      \"source\": \"https://x.com/thtbee_/status/2114030630887641448\",\n      \"sourceName\": \"Bee 原演示（未取得源库）\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"视频氛围\",\n        \"AI视频\",\n        \"Three.js\",\n        \"风格研究\",\n        \"交互叙事\"\n      ],\n      \"cover\": \"assets/images/v1.4/research-map.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/\",\n      \"createdAt\": \"2026-10-26\"\n    },"
      }
    },
    {
      "id": "006",
      "slug": "prompthub-ai-assets",
      "name": "PromptHub · AI 工作资产与复用",
      "summary": "集中管理提示词、Skills、MCP、插件与规则，通过模板、技能分发和配置适配供 AI 复用。对我的价值是借鉴其方法，把每日笔记中验证有效的经验沉淀为工作资产，减少重复说明与跨工具配置；笔记自动提炼和结果回写需另接入。",
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
        "text": "    {\n      \"id\": \"006\",\n      \"slug\": \"prompthub-ai-assets\",\n      \"name\": \"PromptHub · AI 工作资产与复用\",\n      \"summary\": \"集中管理提示词、Skills、MCP、插件与规则，通过模板、技能分发和配置适配供 AI 复用。对我的价值是借鉴其方法，把每日笔记中验证有效的经验沉淀为工作资产，减少重复说明与跨工具配置；笔记自动提炼和结果回写需另接入。\",\n      \"source\": \"https://github.com/legeling/PromptHub\",\n      \"status\": \"completed\",\n      \"tags\": [\n        \"PromptHub\",\n        \"AI工作流\",\n        \"Skill\",\n        \"提示词管理\",\n        \"笔记到工具\"\n      ],\n      \"cover\": \"assets/images/prompthub-capabilities-overview.png\",\n      \"demoUrl\": \"\",\n      \"createdAt\": \"2026-10-27\"\n    },"
      }
    },
    {
      "id": "008",
      "slug": "ultraman-card-draw",
      "name": "奥特曼卡片抽卡器",
      "summary": "以874条人物与形态资料为基础，随机展示奥特曼与怪兽，结合人物突出、招式光效和设备讲解开展亲子探索。沉淀素材、演出配置与卡片舞台分层，后续可增加人物动作和渲染，复用随机演示流程。",
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
        "startLine": 116,
        "endLine": 132,
        "text": "    {\n      \"id\": \"008\",\n      \"slug\": \"ultraman-card-draw\",\n      \"name\": \"奥特曼卡片抽卡器\",\n      \"summary\": \"以874条人物与形态资料为基础，随机展示奥特曼与怪兽，结合人物突出、招式光效和设备讲解开展亲子探索。沉淀素材、演出配置与卡片舞台分层，后续可增加人物动作和渲染，复用随机演示流程。\",\n      \"source\": \"https://github.com/yydshly/1025_codex_project\",\n      \"sourceName\": \"本库原创（无上游源库）\",\n      \"status\": \"building\",\n      \"tags\": [\n        \"卡片收藏\",\n        \"抽卡\",\n        \"亲子\"\n      ],\n      \"cover\": \"assets/images/project-overview-v1.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/008-ultraman-card-draw/\",\n      \"createdAt\": \"2026-10-27\"\n    },"
      }
    },
    {
      "id": "009",
      "slug": "knowledge-processing-atlas",
      "name": "资料理解与检索研究",
      "summary": "从 DeepTutor 与 NotebookLM 的教材问答和资料整理场景出发，比较 MinerU、Docling、BGE-M3、Qdrant、Graphiti 等26个对象。拆解结构解析、分块、检索与时间关系的本质，规划带出处阅读、跨日回顾、经验复用和自适应复习；附同题样例、场景选型、并排对比和实验协议，上游效果待验证。",
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
        "startLine": 133,
        "endLine": 150,
        "text": "    {\n      \"id\": \"009\",\n      \"slug\": \"knowledge-processing-atlas\",\n      \"name\": \"资料理解与检索研究\",\n      \"summary\": \"从 DeepTutor 与 NotebookLM 的教材问答和资料整理场景出发，比较 MinerU、Docling、BGE-M3、Qdrant、Graphiti 等26个对象。拆解结构解析、分块、检索与时间关系的本质，规划带出处阅读、跨日回顾、经验复用和自适应复习；附同题样例、场景选型、并排对比和实验协议，上游效果待验证。\",\n      \"source\": \"https://github.com/HKUDS/DeepTutor\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"文档解析\",\n        \"知识检索\",\n        \"RAG\",\n        \"时间关系\",\n        \"研究对比\"\n      ],\n      \"cover\": \"assets/images/research-overview-v3.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/009-knowledge-processing-atlas/\",\n      \"createdAt\": \"2026-10-28\"\n    },"
      }
    },
    {
      "id": "010",
      "slug": "agent-skills-engineering-lab",
      "name": "Agent Skills · 全景理解与实践",
      "summary": "研究 addyosmani/agent-skills 的25项工程规程：覆盖需求、规划、实现、验证、审查与交付维护，以七类工作和五问总图说明用途、场景、步骤、产物及协作。价值在于把工程经验变成AI可执行、结果可核对的流程；我们据此按真实需求选用，学习用约束、证据与检查控制落地，保留研究回查案例和自建Skill；全量讲解已完成，逐项实测待按需开展。",
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
        "startLine": 151,
        "endLine": 167,
        "text": "    {\n      \"id\": \"010\",\n      \"slug\": \"agent-skills-engineering-lab\",\n      \"name\": \"Agent Skills · 全景理解与实践\",\n      \"summary\": \"研究 addyosmani/agent-skills 的25项工程规程：覆盖需求、规划、实现、验证、审查与交付维护，以七类工作和五问总图说明用途、场景、步骤、产物及协作。价值在于把工程经验变成AI可执行、结果可核对的流程；我们据此按真实需求选用，学习用约束、证据与检查控制落地，保留研究回查案例和自建Skill；全量讲解已完成，逐项实测待按需开展。\",\n      \"source\": \"https://github.com/addyosmani/agent-skills\",\n      \"status\": \"researching\",\n      \"tags\": [\n        \"Agent Skills\",\n        \"AI编程\",\n        \"工程流程\",\n        \"实验验证\"\n      ],\n      \"cover\": \"assets/images/skills-field-guide.png\",\n      \"demoUrl\": \"https://yydshly.github.io/1025_codex_project/010-agent-skills-engineering-lab/\",\n      \"createdAt\": \"2026-10-28\"\n    }"
      }
    }
  ]
};
