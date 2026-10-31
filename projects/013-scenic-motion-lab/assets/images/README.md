# 项目图片与派生关系

本目录保存研究所用的图像原件与项目封面；网页使用的压缩图、视频海报和参考分析图位于项目 `app/assets/images/`。当前仅供本地研究展示，没有提交或部署 GitHub。

文件来源、字节数、SHA-256、原件与派生关系统一记录在 [media-provenance.json](../../research/media-provenance.json)，以当前清单为准。本文说明图像职责，不用文件名或格式替代来源核对。

## 已有素材

| 本目录文件 | 来源与用途 | 网页派生 |
| --- | --- | --- |
| `keyframes/start.png` | 本轮 AI 生成的完整片起始图；骑车人接近低矮山脊 | `app/assets/images/keyframes/start.webp` |
| `keyframes/apex.png` | 本轮 AI 生成的目标最高点图；原计划用作 A 尾帧与 B 首帧 | `app/assets/images/keyframes/apex.webp` |
| `keyframes/end.png` | 本轮 AI 生成的接地续骑结束图 | `app/assets/images/keyframes/end.webp` |
| `motion-inputs/first-frame.png` | 较早接近与追随试验使用的首图，属于历史实际输入 | 保留 PNG，勿与完整片 start 混淆 |
| `motion-inputs/end-frame.png` | 较早接近与追随试验使用的尾图，属于历史实际输入 | 保留 PNG，勿与完整片 end 混淆 |
| `cover.webp` | 本轮 AI 结束图的项目索引封面，非第三方原片截图，也非浏览器实测截图 | 从 `app/assets/images/keyframes/end.webp` 字节一致复制，来源与哈希已记录 |

关键图与运动试验图的 PNG 作为原始图像副本保留；网页 WebP 是显示压缩派生，不是新一次 AI 生成。现有 keyframes 的记录为质量 88 的 WebP 压缩，像素尺寸不变；仍以每个文件的 provenance 条目为准。

首尾图代表制作时的目标。历史跃岭试验A的实际结尾没有严格实现 apex，不能把“有这张目标图”写成“生成视频已精确到达该姿态”。该次A/B的实际提示词可在网页影片参数中查看，对应数据在 `app/data/execution.js`。

## 七张新概念图：已归档

七张原始 PNG 位于 `assets/images/concepts-source/{id}.png`，网页 WebP 位于 `app/assets/images/concepts/{id}.webp`，使用相同概念 ID 对应：

- `inner-sea`
- `coastal-scroll`
- `pedal-city`
- `reflection-first`
- `seed-islands`
- `miniature-bay`
- `seasonal-gate`

原件、派生和哈希已归档，静态检查已完成；浏览器实测七张图均正常加载为 1672 × 941。逐图观察与限制记录在 `app/data/media.js`。实际生成指令可在网页“首图”标签页折叠区查看、复制，对应 `app/data/concept-generation.js`；四个通用提示词模板则是研究后新整理的内容，两者有明确区分。

季节门已将现有图像与后续视频脚本统一为“早夏 → 薄雪冬季”，旧设计差异保存在 [seasonal-design-revision.json](../../research/seasonal-design-revision.json)。《悬崖长卷》已有5秒模型对照和11.041667秒双片拼接实测，其他六项未生成视频；原设计的全部时序与运动要求仍不能据此宣告通过。静态检查不能证明物理接触或跨镜头连续性成立。

## 悬崖长卷：真实末帧续接与拼接证据

[观看当前双片拼接版](http://127.0.0.1:4333/?film=coastal-scroll-splice-v1#screening)。`coastal-scroll-splice-v1/a-last-frame.png` 是Kling 4.0 A任务1044781的真实第120帧，作为B任务1044794的首图；它是视频摘帧，不是重新生成的概念图。`b-submitted.jpg` 是提交界面证据，`actual-seam.jpg` 是最终成片接点前后的抽帧排版。

`local-review/coastal-scroll-kling4-b-v1/` 保存B全片半秒时间线、前1秒密集帧、首末帧和A末段／B开头对照；`local-review/coastal-scroll-splice-v1/timeline.jpg` 来自实际拼接成片。分析图不是新的AI生成，也不能替代正常速度与声音审查。

两原片均为1284×724、24fps。最终取A第0–119帧（5秒）和B全部145帧（6.041667秒），共265帧、11.041667秒、1280×720、24fps，于5.000秒硬切。从A剪除作为B首图的第120帧，避免相似边界姿态重复；没有循环、定格、变速或溶解。接缝基本承接但人物与花草轻微重绘，B后段明显拉远，不能声称严格无缝。当前B实际180积分，A最终费用未知；这与历史跃岭试验B费用未知是两条不同记录。音轨未听验。

## 本地浏览器截图与分析排版

`assets/images/local-review/` 已归档五张实际浏览器截图：

| 文件 | 内容 |
| --- | --- |
| `desktop-1280.jpg` | 1280 像素桌面总览 |
| `concepts-desktop-1280.jpg` | 桌面概念列表 |
| `concept-detail-1280.jpg` | 桌面概念详情 |
| `mobile-final-390.jpg` | 390 像素移动端成片页面 |
| `mobile-concept-390.jpg` | 390 像素移动端概念页面 |

同目录 `concept-contact-sheet.jpg` 是将七张概念图编排成一页的分析图，**不是浏览器截图，也不是新一次 AI 生成**。截图和分析排版均已列入 provenance。

首轮由主任务通过 Cua 实际浏览器完成播放、切换、筛选、搜索、复制、下载、深链接和键盘检查；390 与 1280 像素视口无横向溢出，未发现新的控制台错误。首轮完整研究 JSON 导出核对了当时的概念、视频与概念图实际生成指令，季节内容为冬季。后续短样和拼接记录继续追加，当前内容以网页目录和数据为准。历史检查范围与证据归属见[本地验证记录](../../research/local-verification.json)；本说明整理者未独立重跑浏览器检查。

## 参考分析图与视频海报

网页的 `app/assets/images/reference/` 保存第三方原作的分析时间轴及与本轮结果的对照图，署名为 Personality（@hi_personality），来源为[原帖](https://x.com/hi_personality/status/2115567493565825244)。这些是分析摘帧或合成对照，不是本轮 AI 首图。**第三方原片整段没有归档到网页。**

`app/assets/images/posters/` 是从本轮已有视频抽取的海报帧。它们用于展示对应原生或剪辑派生视频，不代表新一次图像生成；抽帧时间、缩放和来源视频哈希见 provenance。

## 权利与发布范围

本轮 AI 产物、第三方原作分析摘帧、研究文字及网页实现分别记录来源与权利。第三方素材权利仍归原权利人，许可状态未知；本项目不授予其新的 CC 或其他许可。公开可见与本地研究展示不构成再分发或商用授权。

网页当前仅本地展示，无公开演示地址，本轮没有提交或部署 GitHub。后续若提交或公开部署，应依据届时明确的范围处理素材；悬崖长卷接地与拼接偏差的修正、声音听验和其余六个方向的视频验证仍是后续工作。

## 研究总览图

`overview-v1.png` 是本轮内置 image_gen 生成并经定向画面校正的研究总览，实际尺寸 1024 × 1536，现用作项目索引配图。网页 `app/assets/images/overview-v1.png` 为逐字节副本，`overview-v1.webp` 为解码像素一致的无损派生。`cover.webp` 是此前入口图，继续保留。

图的内容、准确提示词、输入角色与校正记录见 `research/overview-v1-generation.json`、`overview-v1-edit.json`。七个创意及四类产品均按验证状态标注；长图不把产品构想写成已上线能力。
