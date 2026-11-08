# 实际产品截图

2026-11-04在本机浏览器运行015产品后取得，无AI生成替代图。

- `scene-orbital-v2.jpg`：NASA地球模型、月球与地球视角月相小窗，采用已确认完成加载的390×844实拍。
- `scene-volcano-v2.jpg`：独立三维火山剖面、岩浆与喷出物过程示意。
- `scene-quake-v2.jpg`：均匀介质地块、震源和P/S波。
- `scene-typhoon-v2.jpg`：理想风场的连续体积云与固定模型点位。
- `scene-river-v2.jpg`：一维输运模型的三维地形表达、排口与下游测站。
- `scene-battery-v2.jpg`：简化电热模型的工业电池剖面。
- `mobile-orbital-v2.jpg`、`mobile-focused-river-v2.jpg`：390×844视口下实际页面与专注观看。
- `audit-before.jpg`：用户反馈后记录的旧Canvas版本，作为重做问题依据，不是当前展示。

截图中的主场景由本产品程序运行；天体贴图/模型来自NASA，来源见research/asset-sources.json。截图不代表全部科学模型经过专业验证或接入了实时数据。

首张普通面板天体截图处于资源加载阶段，已拒绝作为成品封面，留在 `audit-orbital-loading-v2.jpg`；当前封面使用本轮随后确认渲染完成的移动端实拍。

## v3 统一地球实机图

2026-11-04 在本地浏览器捕获并检查：globe-overview-v3.png 为同一地球总览，globe-orbital-v3.png 为完整地月取景，globe-volcano-v3.png、globe-quake-v3.png、globe-river-v3.png 为地球主题视图；globe-mobile-v3.png 为 390px 窄屏台风界面。全部为实际产品截图，底图来源见 research/asset-sources.json，效果是教学模型独立实现。


## v4 动态效果与图表实机图

2026-11-04在本机产品中捕获：

- globe-typhoon-v4.png：风眼、云团、金色测点及对应径向风速图和时间曲线。
- globe-volcano-before-v4.png、globe-volcano-v4.png：喷发前后，灰柱与喷出物状态差异。
- globe-quake-v4.png：青色P波、紫色S波，前沿标签与曲线读数对应。
- globe-overview-v4.png：统一地球与三个过程各自的当前曲线。
- globe-mobile-v4.png：390px窄屏界面。

均为实际产品截图；NASA地表底图叠加独立教学模型效果，不是真实灾害观测。

## v5 呈现优化实机图

2026-11-04捕获并检查9张实际产品图：台风、火山、最大灰柱、地震、总览、地月、河流、电池和390px窄屏。文件名为globe-主题-v5.png，完整列表见research/verification-v5.json。海洋反光、大气和过程均为教学呈现，底图来源保持NASA Blue Marble；未用生成式效果图替换实机结果。


## v16 球面变化解读实机图

2026-11-05在本地1440×1000与390×844视口捕获并检查。observed-earth-v16为完整地球，observed-close-v16为汤加真实云区特写，observed-narration-v16为MiniMax讲解，observed-storm-v16、observed-quake-v16、observed-mangkhut-v16分别为真实事件与同刻指标，observed-mobile-v16为窄屏讲解。均来自实际产品；NASA地表底图叠加有出处的观测及阅读用标注，未用生成式图片代替实机。轮廓精度、云视差与显示增强边界见research/verification-v16.json。


## v17 implementation report captures

implementation-v17.png and implementation-scene-v17.png were captured from the actual local report at1440x1000. The report distinguishes first-batch implemented repairs from seven planned real-data scene specifications. These are planning/report screenshots, not new scientific process effects.

## v23 旧金山港实机图

2026-11-05 在本地浏览器 1440×1200 视口捕获：`san-francisco-harbor-v23.jpg` 为 02:18 UTC 月心刚升出几何地平线；`san-francisco-tide-high-v23.jpg` 为 19:54 UTC 实测最高水位。港口由程序绘制，水位变化按显示比例放大；实测、调和预报与星历的原始来源和处理口径见 [潮汐数据说明](../../research/dynamics/san-francisco-tide/README.md)。
