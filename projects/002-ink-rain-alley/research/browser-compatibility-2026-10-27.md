# 002 · 浏览器兼容处理

日期：2026-10-27（Asia/Shanghai）。002是独立重写的效果实现，005是关联它的研究与扩展入口；002构建后位于005的 `original/`，不是原作者源码。

## 问题与证据

用户的Chrome在 `new WebGLRenderer` 时报告上下文创建失败：`GL_VENDOR = Disabled`、`GL_RENDERER = Disabled`、`BindToCurrentSequence failed`。这发生在场景绘制之前；当前证据不支持把它归因为模型、字体、媒体缺失或部署路径错误，也不足以断定具体是浏览器设置、图形驱动还是策略导致。扩展产生的Adobe字体慢网提示不是本次WebGL错误。

旧版把全部初始化异常都显示为“需要显卡”，弹层挡住画面，正常导航也未完成绑定；因此用户即使只想查看已有实现也无法继续。

## 本轮处理

- WebGL 2上下文只请求一次，失败不再交给Three.js重复探测。成功后传入同一个上下文。使用默认功耗偏好、不启用最终画布抗锯齿，不能借此重新开启浏览器禁用的图形服务。
- 画布和合成目标以相同比例限制在1600×1100以内，保留宽高比。深链不再无条件提前构建雨巷与森林预览。
- 创建失败、运行中上下文丢失、场景初始化或绘制异常分别记录原因，切入独立的静态导航。停止动画循环、原交互监听和声音；不因context恢复自动刷新。
- 静态模式使用本项目v2.2的14张真实运行截图：封面与九章，以及四季。提供章节选择、前后章、季节切换、hash定位、原图链接与重试动态。
- 页面明确注明**截图非实时，图中旧控件不可操作，无自动翻页或声音**。原作者录屏没有作为本项目截图或运行素材使用。
- `?preview=static` 可主动进入兼容浏览。重试只移除 `preview`，保留其他参数和当前章节。005容器仅转发允许的静态参数与章节hash，初始iframe不抢先启动动态页。
- 总览顶部明确提供“002 · 原始效果实现”和独立的“原作录屏参考”入口。

## 复核记录

在独立发布工作区构建，未整体发布共享工作区的其他未提交文件。

- 002语法检查、21项Node测试、005语法与入口检查、005完整生产构建、总库索引检查、4项隔离发布测试通过。新增测试接入GitHub Actions。
- Node VM执行真实main入口的失败路径：模拟getContext返回null及Disabled诊断，确认只请求一次、不构造Renderer、保留 `#lotus` 与query、停止旧事件与声音。手动静态模式不请求WebGL。另覆盖异常、已丢失上下文、同context透传、尺寸比例、截图身份和导航边界。
- 实际IAB浏览器验证005容器的有hash／无hash静态入口；莲花→墨圈、章节选择到四季、冬景切换、雨巷与终章、浏览器返回历史、首末章禁用边界均正常。
- 在兼容页点击“重试动态模式”，同一浏览器成功回到动态四季，默认声音关闭。说明本轮没有以静态模式覆盖所有正常动态访问。
- 实际读取DOM确认雨巷图片已加载、旧画布与控件隐藏；390px窗口下静态页clientWidth与scrollWidth相同，没有整页横向溢出。
- 14张截图由Vite导入并随002产物复制至005的 `dist/original/assets/`，无需外部图片服务。

实景：

- [桌面莲花兼容页](../assets/images/compatibility-2026-10-27/static-lotus-desktop.png)
- [手机冬季兼容页](../assets/images/compatibility-2026-10-27/static-winter-mobile.png)
- [重试后的动态四季](../assets/images/compatibility-2026-10-27/dynamic-retry-seasons.png)

## 限制

本轮未更改用户Chrome、图形加速、驱动或安全设置，也没有在其失败的Chrome实例中验证图形服务恢复。浏览器UI测试使用可运行WebGL的IAB；创建失败通过Node VM模拟，未在浏览器中强制关闭GPU或主动触发运行中context丢失。代码审查确认丢失后旧监听不会恢复渲染或声音，不把审查等同于该设备实测。

兼容模式是浏览结果的保底，不提供实时雨、风、镜头、滚动开花或音频。动态模式仍须浏览器能够创建WebGL 2上下文。构建有约656.5kB引擎入口的体积提醒（gzip约176.0kB），未影响构建完成，后续可独立优化分包。

## 线上入口

- [002动态实现](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html)
- [002兼容浏览](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html?preview=static#rain)
- [005研究总览](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/map.html)

线上发布状态以对应GitHub Actions成功及实际页面核验为准；本记录不宣称所有浏览器或设备已验证。
