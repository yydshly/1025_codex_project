# 项目图片

存放该项目的封面、流程截图和结果对比图。建议使用 `cover.png`、`workflow.png` 等清晰且无空格的名称。

在项目 README 中为图片添加替代文字、图注与来源。在根目录 `projects.json` 中设置 `cover` 为 `assets/images/实际文件名` 后，执行 `npm run index:update` 即可更新总索引的项目配图。

## 当前素材

- `project-overview-v1.png`：本次内置 imagegen 生成的研究与效果总览图，1672 × 941。项目 README、总库封面和线上引导页共同使用，生成记录见 `research/overview-image-2026-10-27.md`。
- `ux-2026-10-27/`：实际页面优化前后、大图查看和透明人物前景截图，检查范围见 `research/ux-optimization-2026-10-27.md`。

网页使用的引导图副本位于 `app/assets/images/project-overview-v1.png`，与这里的原图逐字节一致。双份路径适配直接本地打开和静态发布；Git 按相同内容复用图片对象。人物与参考图片权利归相应权利人。
