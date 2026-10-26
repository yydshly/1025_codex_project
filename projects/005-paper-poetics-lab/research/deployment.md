# 005 · 纸间 GitHub Pages 发布记录

日期：2026-10-27（Asia/Shanghai）。首次发布提交：`1c901c1454087510502b2ce32c2661632d41cfdb`。

## 正式入口

- [站点总入口](https://yydshly.github.io/1025_codex_project/)
- [纸间首页](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/)
- [一图总览](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/map.html)
- [研究回顾](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/research.html)
- [AI影片](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/cinema.html)
- [独立重写的九章](https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original.html)

## 发布范围与验证

使用既有GitHub Pages站点，005的dist为公开目录，002作为构建依赖，其输出位于005/original/。现有其他项目的发布与登记均保留。独立发布工作区验证只纳入明确提交的源码，未将工作区未提交内容整体推送。

总入口引导图为 `assets/images/v1.4/research-map.png`，图片链接进入map.html，项目标题与“查看网页”进入005首页。在线PNG与用户确认原图SHA-256一致；保持纵向全图，支持放大阅读。

- [首次构建与部署工作流](https://github.com/yydshly/1025_codex_project/actions/runs/40368730500)：build、deploy均success。
- 干净依赖安装、总库索引、4项隔离发布测试、002／005检查与生产构建通过。隔离测试包含编号递增、目录边界、嵌套原演示、视频、引导图和非法引导页拒绝。
- 线上总入口可进入005总览，图内5项效果与9章链接全部解析在正确编号子路径。
- 实际点击莲花入口，iframe进入 `https://yydshly.github.io/1025_codex_project/005-paper-poetics-lab/original/#lotus`，可访问性树确认莲花章节已出现。
- AI影片实际播放：15.046秒、1920×1080、默认静音。不是静态首帧，也不依赖本机4176。
- 390×844窗口下总览无整页横向溢出（clientWidth与scrollWidth均390）；浏览器未观察到error／warn。
- 首轮根入口曾短时返回CDN旧缓存，刷新后已核对新图及完整摘要。正式入口无需查询参数。

源码中的账户余额已去除；私有备份、原始下载、母版和运行日志保留本地。公开研究记录保留生成参数、素材来源、实际264／预估180积分的差异及有限检查范围。

## 摘要定位

源效果是纸墨、画幅转换、自然微事件、文字与留白串起的多场景诗性叙事。未取得原作源码；我们的独立重写、实时练习、AI影片与实拍对照分别标明来源与边界。

研究价值是形成氛围组织方法、载体选型依据及可复用工程资产。扩展方向包括声画事件的连续后果、纸墨与写实融合和文化展陈入口；尚未验证商业收益、稳定情绪效果或成熟风格系统。

## 实景证据与限制

实景位于 `../assets/images/deployment-2026-10-27/`，包含线上影院、桌面与手机总览及总入口。此次验证不是全部设备、全部浏览器或完整无障碍合规验收；AI音轨听感与全片细节仍沿用研究记录中的待验状态。
