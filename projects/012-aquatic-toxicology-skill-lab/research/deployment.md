# 012 发布与验收

2026-10-29 已上线并核验：[研究网页](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/) · [理解总览](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/#understanding) · [生成的引导图](https://yydshly.github.io/1025_codex_project/012-aquatic-toxicology-skill-lab/assets/understanding-map.png)。

总索引与首屏摘要说明库的能力、5个Skill（deep-research、sr-screener、academic-paper、academic-paper-reviewer、academic-pipeline）、选题/综述/核验/写作修订/审稿场景和流程复用价值。实际采用程度分别记录；原库规范、原有客户端、本轮三个采集器与补漏测试不混同。

引导图采用此前内置image_gen生成的1536×1024原文件；总索引封面副本与网页原图SHA-256均为 `77db9c8a099aa369a6df5669c17b47c4fcba62dcd56ac6da0b47df8c4919419e`。没有重新生成或裁切。

## 发布范围

- Pages公开目录为app，额外资源仅声明assets/images/understanding-map.png；本项目明确启用textExtensions的.md和.csv，使42份报告/数据/源码/图像下载全部进入站点，未扩大其他项目的文本发布范围。
- 原始上游1106份镜像与ZIP、批量论文摘要响应及含完整摘要的筛选输入仍在原工作区本地，不提交或发布；公开保留方案、题录、短转述、筛选理由、请求与哈希回执。
- 项目.gitattributes保持历史证据字节；CI运行check:public，仅依赖公开产物。完整check和build:data仍需本地完整材料。
- 从origin/main最新版本建立独立发布区，只纳入012、发布配置及必要的010回查快照依赖；没有带入其他未提交项目或进行磁盘清理。

## 构建与验收

首次成功发布提交为 `0ad81d36d287eb121adac13f495be7c9e8f72238`，[工作流40834394350](https://github.com/yydshly/1025_codex_project/actions/runs/40834394350)的build/deploy均成功。此前两次运行40833506842和40833937484停止在010快照一致性检查；新增012后刷新快照，并以Git提交的LF登记字节重新生成，未弱化校验或修改010业务逻辑。

本地完整研究检查、公开产物检查、总库登记检查、6项发布边界隔离测试通过；010的18项回查、22项Python技能和7项发布测试通过，纯Git字节隔离副本的快照检查也通过。

线上核对52个请求均200，含42个下载；公开research.json与本地结构化结果一致，生成图哈希完全一致。浏览器确认能力/5个Skill/场景/价值摘要、总入口生成图跳转、3项API实测来源筛选和391px视口无横向溢出。证据见[HTTP记录](validation/deployment-http.json)、[浏览器记录](validation/deployment-browser.json)、[实际截图](../assets/images/deployment-20261029/online-summary.jpg)。

上线只证明网页和公开记录可访问。984条候选与3/5→5/5仍为组合适配及样本内修复结果；不认证查全、科学正确性、新颖性或原Skill相对直接问AI的增益。

## 交付复查与补齐

用户追问是否有遗漏后，发现两处收尾问题：process.md保留了“未推送”和未获浏览器验证的file打开表述；公开process-walkthrough.md中的15条链接未从研究阶段目录转为发布目录。已修正交付状态，将12条链接指向公开文件，另3条首批/补批/审查JSON保持指向其各自固定提交源码，不混称为合并结果。

首次52个请求检查覆盖主资源和下载入口，没有覆盖下载Markdown正文内的所有链接。本次扩大公开检查，核对42条本地Markdown链接，并以旧错误路径作负例，确认检查能够拒绝此类回归。修改只涉及说明、导出路径与校验，不增加科研检索、全文阅读或新颖性判断。

## 第二轮候选后续阅读与综合更新

2026-10-29按用户指令继续17条候选：9条首轮重合、8条新增。实际主文全文1条、章节/图注6条、摘要10条；14条直接记录、1条多污染物、2条学位补充，不等同独立实验计数。加入逐条获取日志、设计字段、证据定位、局限、首轮对照、6条更新结论、5对有限分歧比较及收窄方向。原始全文副本留本地raw并被忽略，图注仅链接，不复制原图。

最新结果位于理解总览之前，首屏和侧栏优先进入；首轮证据/结论/方向保留历史标识。公开新增5份下载及嵌入JS、结果脚本与样式；此前42份下载及理解图保持。审查、修订和本地检查见round2/review.md及validation/round2-local-*.json。线上发布状态将在工作流结束和HTTP/浏览器实查后追加，不能把本段当作已经部署成功。

### 第二轮实际上线验收

研究更新提交c8b7d6828e62144311d42473bbdc30f68e8e3e8c；第一次工作流40846258639在010受管回查快照过期处停止，未发布。同步012 README的回查快照后提交bd2fce5f8d162b44ede11ca793083b2af8baaee2，[工作流40846572144](https://github.com/yydshly/1025_codex_project/actions/runs/40846572144)的build与deploy均成功。刷新只涉及010生成的recall-data与manifest；注册表和业务逻辑未改。

线上62个实际发布的非隐藏app文件全部HTTP200且逐字节SHA-256与本地相同，包括最新5份下载和原引导图。首次探测把本地.gitkeep占位也包含在63个路径内，得到预期404；发布器本就排除隐藏文件。线上收据明确保留这项排除及首次返回，未将其计为公开资源。此前本地63项HTTP检查含此本地占位；实际发布分母为62。见[线上HTTP回执](validation/round2-online-http.json)。

实际线上浏览器确认17/9/8/1规模、1/6/10读取深度、全文筛选、结论到R14自动清筛选并展开、Fig6/Fig7直接链接与最新结果导航。桌面1440px请求视口内容宽1425px且无横向溢出，手机391px请求视口内容宽376px的详情与日志另已实查。见[浏览器回执](validation/round2-online-browser.json)及[实际部署截图](../assets/images/round2-20261029/online-results.png)。主工作区012的完整检查同时验证1106份上游原始文件，公开检查、总库检查及发布/010相关测试通过。

科学结果已接入网页，但阅读材料限制没有因部署而消失：只有1条主文全文、6条章节/图注、10条摘要；模型定位有实质补充，正式统计、队列独立性及创新性仍待核。
