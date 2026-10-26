# 项目图片

`cover.svg` 是本项目原创的方法示意图，绘制日期为 2026-10-26。

图中以理解目标连接内容、视觉、讲解、操作和反馈，底部给出一个场景的探索顺序。它是方法配图，未使用 Every Joule 的截图或素材，也不表示已经完成应用原型。

`web-cover.png` 和 `web-expansion.png` 是 2026-10-26 在本地浏览器中拍摄的实际网页截图，分别展示首页与扩展方向。`web-mobile.png` 展示窄屏下的筛选工作台。它们展示本项目独立实现的网页，未使用参考站图片。

v2.0 的 `book-cover.png` 展示硬封书封面，`book-interaction.png` 展示第三章的展开控制，`book-worlds.png` 展示第四章的主题预览，`book-mobile.png` 展示窄屏上下排列的书页，均为本项目实际浏览器截图。

v2 时根目录 `projects.json` 使用 `assets/images/book-interaction.png` 作为封面；v3 已切换为 `assets/images/replica-stores.png`。修改后在总库运行 `npm run index:update` 和 `npm run check`。


## v3 · 真实 3D 效果研究

- `reference-stores.png`、`reference-contents.png`、`reference-ramp.png`、`reference-spring.png`、`reference-mobile.png`：原作实际浏览器截图，仅用于对照研究；版权属于 Techartist。
- `replica-stores.png`、`replica-ramp.png`、`replica-spring.png`、`replica-closeup.png`、`replica-orbit.png`、`replica-mobile.png`：本地独立实现的真实浏览器截图。
- `replica-hero.png`：点亮部分能量瓶后的轻微侧视图；`replica-tablet.png`：806 × 873 中屏全景。
- `replica-turn-*.png`、`replica-turn-sequence.png`：翻页过程记录，包含模型收起、纸张抬起等阶段；序列首帧可能仍处于初次载入的淡出期间。
- `replica-comparison.png`、`replica-detail-comparison.png`、`replica-mobile-comparison.png`：原作与本地的并列对照，不作为网页运行素材。

所有截图均采集于 2026-10-26。没有把截图当作 3D 模型使用。

## v3.1 · 视角与器材细节

`refined-overview.png`、`refined-experiment.png`、`refined-reading.png` 为三个视角；`refined-detail.png` 为双击器材后的近景；`refined-turn.png` 为卷页峰值；`refined-mobile.png`、`refined-mobile-reading.png`、`refined-tablet.png` 为不同屏幕实测；`refined-hero.png` 为点亮能量瓶后的实际展示。

`refined-comparison.png` 与 `refined-mobile-comparison.png` 是原站 / v3.1 的同尺寸并列对照；`refined-before-after.png` 对照 v3.0 与 v3.1 的局部细节。原站截图只用于研究，不是运行素材。

`refined-source-detail.png` 为原站与 v3.1 同区域器材裁切比较。v3.1 索引封面为 `refined-overview.png`。

## 阶段研究汇总

- `understanding-atlas.png`：3200×7450完整总览长图，精确中文图文排版，包含本项目真实样章效果、设计方法、预期价值、产品结构、布局与主题扩展以及复用边界。
- `understanding-atlas.svg`：同内容的可编辑版本，图片全部内嵌，无远程素材依赖；重建脚本为 `scripts/create-understanding-atlas.py`，使用Pillow及微软雅黑。
- `future-layout-concepts.png`：内置ImageGen生成的未来布局概念画面，六格依次为教材与实验并排、实验主屏、双屏协作、实验记录本、主题工作台、虚实实验台。不是当前产品截图或可用于计算的工程图。
- 完整提示词、素材身份和生成方式见 `research/summary-assets.json`。实际样章截图、概念画面和方法结构图在网页与总图中分别标注。
