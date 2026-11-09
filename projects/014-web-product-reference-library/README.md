# 014 · 50 个网站的产品能力与实现参考库

从小樱分享的清单出发，按能力整理 50 个网站。每条记录都把具体入口、效果证据、可借鉴的机制和实现条件对应起来。历史截图用于核对当时的界面，实际操作以原站为准。公开浏览版保留 01–50 编号、八类能力、可搜索卡片、效果入口和借鉴机制，也保留五个优先方向与十个待验证方案。原帖配视频单列。

[在线浏览 50 站](https://yydshly.github.io/1025_codex_project/014-web-product-reference-library/) · [原始清单与地月配视频](https://x.com/xiaoying_eth/status/2116389253060190271) · [研究方法与五个产品方向](research/notes.md) · [返回总索引](../../README.md#项目索引)

## 公开媒体与复现

页内媒体限于已经逐件核对的原始发布版本。包括 USGS 1906 年地震模拟、NASA Artemis II 银河照片、美国国会图书馆《Migrant Mother》、Europeana 2020 年官方界面、Rijksmuseum《倒牛奶的女仆》和 The Met《神奈川冲浪里》。[公开目录](publication/catalog.json)保留每项的原始 URL、署名、权利说明与文件校验值。其余效果保留原站对应链接，本地研究截图及未确认权利的素材留在本机。

在未生成 `dist/site/` 的检出目录中使用 Node.js 22 或更高版本执行 `npm run build:site`，从 `dist/site/` 提供静态网页。`npm run check:public` 检查编号覆盖、链接和媒体来源记录。

## 如何使用这份研究

先选一个用户问题，例如「怎样用可追溯的数据讲清一次事件」。再找能支持这个问题的公开数据、时间控制、画面和出处展示机制，并用小样本验证它们能否配合。原帖中的地月视频单独用作视觉参考，作者和实现工具待确认。

015「观象」沿着科普解释和数据叙事这条线做了一个可运行案例。它把地球观测、事件画面、曲线和讲解接到同一时间轴上，供课堂、展陈和历史复盘使用。[观象研究说明](../015-process-visualization-lab/README.md) · [观象在线体验](https://yydshly.github.io/1025_codex_project/015-process-visualization-lab/)
