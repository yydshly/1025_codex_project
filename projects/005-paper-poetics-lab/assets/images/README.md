# 项目图片与来源

本目录已经保存实际浏览器截图、历史版本和影片抽帧。静态图片证明的是某一时刻的画面，不单独证明运动、声音、交互完成度或整段影片质量；实际检查范围见[当前验证记录](../../design-qa.md)。

## v1.0.0 · 实时初版

历史基准保存在 `v1-baseline/`，用于回顾纸底物件式构图的初次实现：

- [tea-1280.png](v1-baseline/tea-1280.png)：1280×800 的山间茶息浏览器截图，处于注水阶段。本次选作回顾页的初版代表图。
- [tea-before.png](v1-baseline/tea-before.png)：另一种窗口尺寸下的茶息初版实景，不能与1280图按像素直接比较。
- [moon-1280.png](v1-baseline/moon-1280.png)、[moon-before.png](v1-baseline/moon-before.png)：月下花庭的初版实景。
- `portal-desktop.png`、`portal-full.png`、`cover.jpg`：该目录内对应初版入口与封面。

这些是程序实时练习的截图，不是实拍，也不是AI影片。`tea-tone-test.png` 是调色过程证据，不作为初版最终画面。

## v1.1.0 · 透视空间重构

`v1.1/` 保留窗景茶席、月洞门庭院重构后的实际页面：

- [tea-production.png](v1.1/tea-production.png)、[moon-production.png](v1.1/moon-production.png)：两个实时练习的1280×800生产页面，本次用作回顾页的v1.1代表图。
- `tea-stage-1.png` 至 `tea-stage-3.png`、`moon-stage-1.png` 至 `moon-stage-3.png`：各自三幕的实景状态。
- `tea-action.png`、`moon-action.png`：操作回应时刻；`tea-paused-*.png`、`moon-paused-*.png`：暂停检查证据。
- `mobile-tea.png`、`mobile-tea-close.png`、`mobile-moon.png`、`mobile-moon-close.png`：手机画面；`tea-window.png`、`moon-window.png`：其他窗口比例。
- `portal-desktop.png`、`portal-full.png`、`final-preview.png`、`cover.jpg`：同一版本的入口与交付预览。

这一版仍是Three.js实时画面。三幕截图和更立体的模型不等于已经具备视频的时间叙事或环境事件，历史评价与限制见[1.1验证记录](../../research/design-qa-v1.1.md)。

## v1.2.0 · 影片主体验与实拍对照

`v1.2/` 记录影院页与新入口，须按素材类型分别理解：

- [tea-film-playing.png](v1.2/tea-film-playing.png)、[tea-film-mobile.png](v1.2/tea-film-mobile.png)：AI《雨窗茶寮》成片在浏览器中的实际播放截图。
- `film-frames/frame-0.jpg`、`frame-5.jpg`、`frame-10.jpg`、`frame-14.jpg` 与 [contact.jpg](v1.2/film-frames/contact.jpg)：实际返回MP4的抽帧及其合并检查。它们来自影片，不是新生成的单张图片。
- `cinema-pending-desktop.png`、`cinema-pending-mobile.png`：影片尚未可用时的首帧预览状态，不能标成视频播放证据。
- [rain-study-start.png](v1.2/rain-study-start.png)、[rain-study-playing.png](v1.2/rain-study-playing.png)、[rain-study-caption.png](v1.2/rain-study-caption.png)：有许可的实拍对照，不是AI茶寮成片。实拍画面与雨声来自不同来源，并非同步现场录音。
- `portal-desktop.png`、`portal-full.png`：本轮入口页面，包含不同来源的作品入口与说明。

影院现有配图沿用 `app/media/cinema/`：`rain-window-tea.jpg` 是AI生成首帧；`rain-window-study.jpg` 是实拍对照的既有配图。两者没有复制到本次研究缩略图目录。生成、作者、许可、音画合成与验收边界以[项目README](../../README.md)及[生成记录](../../research/cinema/generation-record.json)为准。

## v1.3 · 研究回顾

- [research-desktop.png](v1.3/research-desktop.png)、[research-full.png](v1.3/research-full.png)：研究回顾默认全效果状态的桌面首屏与完整页面，使用当前样片首帧作预览封面。
- [research-mobile.png](v1.3/research-mobile.png)、[research-mobile-films.png](v1.3/research-mobile-films.png)：390×844窗口中的阅读入口与影片筛选状态；正文可用宽度含滚动条影响。
- [research-journey.png](v1.3/research-journey.png)：四轮探索的实际页面。
- `v1.3/portal-desktop.png` 与 `portal-full.png`：加入研究入口后的首页；根目录入口截图及 `cover.jpg` 已同步更新，旧版仍保留于版本目录。

这些是内容整理后的网页截图，不是新生成的场景、视频或原作画面。研究页内主动播放使用现有AI成片，具体播放与筛选检查见[验证记录](../../design-qa.md)。

## v1.4 · 一图总览

- `v1.4/research-map.svg` 与 `research-map.png`：2400×4339总览原件。SVG保留相对节点链接，PNG是静态图；通过网站的SVG下载按钮可导出适配当前页面地址的链接。
- `research-map-browser.png`：直接打开网页SVG后保存的2400×4339浏览器整图；`map-desktop.png`、`map-mobile.png`、`map-short-mobile.png` 为交互阅读器；`map-lotus-link.png` 为图中直达章节的证据。
- 图中上方四帧来自Bee原始演示录屏的1.8、15.2、21.4、24.0秒，并注明来源；它们不同于下方我们的独立重写截图，不是可自由复用素材的许可声明。
- 五项实践配图复用项目已有截图或首帧；图中未创建新AI场景或视频。
- [内容记录](../../research/overview-map-content.json)与[来源记录](../../research/overview-map-sources.json)保存图的文字、直接来源和抽帧定位。

## 回顾页缩略图

可浏览的缩略图位于 `app/media/research/`，全部来自已有真实文件：

| 文件 | 直接来源 | 版本与处理 |
| --- | --- | --- |
| [tea-first.jpg](../../app/media/research/tea-first.jpg) | `v1-baseline/tea-1280.png` | v1.0初版；等比缩至960×600，JPEG质量85 |
| [tea.jpg](../../app/media/research/tea.jpg) | `v1.1/tea-production.png` | v1.1茶息；等比缩至960×600，JPEG质量85 |
| [moon.jpg](../../app/media/research/moon.jpg) | `v1.1/moon-production.png` | v1.1花庭；等比缩至960×600，JPEG质量85 |
| [original.jpg](../../app/media/research/original.jpg) | `app/media/original.jpg` | 既有002演示预览；1200×675，逐字节原样复制 |

逐项源路径、版本依据、尺寸、处理方式和SHA-256记录于 [SOURCES.json](../../app/media/research/SOURCES.json)。没有裁切、补绘、拼接、增加文字或生成新视觉。

## 来源边界

- `style-source-original.png` 与入口原演示配图展示的是项目002的独立重写演示，用于风格参考；不是Bee原视频截帧，不是原作源码，也不是005新主题成果。
- 根目录未带版本文件夹的 `tea-*`、`moon-*` 和旧入口图包含早期发布或中间迭代，不能仅凭文件名里的 `production` 或 `final` 就当作当前版本。版本回顾优先使用明确的归档目录与对应验证记录。
- 封面索引仍由根目录 `projects.json` 的 `cover` 管理；更新总索引使用 `npm run index:update`，不要手改外层README生成区块。
