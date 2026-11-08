# 015 · 观象公开发布

2026-11-08 已在 GitHub Pages 验收。[研究总览](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/) · [地球实测回放](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/app/index.html) · [构建和部署记录](https://github.com/yydshly/1025_codex_project/actions/runs/42483498063)。

总库卡片和项目总览使用同一张 1600 × 2440 研究引导图。项目总览解释研究起点、方法、公开范围与可复用价值，并提供地球、汤加和电芯入口。编号页下的 `app/index.html` 保留可分享的场景 hash。

公开版包含地月潮汐、台风、地震、火山、山火和河流的八个历史案例，以及 NASA B0005 电芯放电。吉林大学柴油机保留出处与本地复现步骤，原档和派生本地数据留在本地研究目录。现有历史资料用于教学、展陈和复盘，洪水、实际污染迁移和持续观测为后续方向。

`npm run build:site` 将导览与静态回放构建至 `dist/site`，校验媒体引用和当前 68 段 MP3。CI 运行回放测试与旁白核验。线上浏览器已检查总库入口、引导图、汤加 07:50 画面与曲线联动，以及潮汐中文旁白。390 像素宽的发布预览另核对了引导页和电芯入口。
