# 轩岚诺真实红外动态资料

交付的是 **2022-09-05 03:00—13:30 UTC** 的 23 帧真实葵花八号 AHI B13 扫描选帧，以及 4 条 JMA 事后最佳路径记录。影像进入同一个地球的经纬纹理层，不是独立视频，也没有模拟云纹理、形变、旋转或时间补帧。

网页入口资料为 `app/data/storm-dynamic.json` 和 `app/assets/events/storm-dynamic/`。23 张显示 PNG 共 **12,489,879 字节**；固定 EPSG:4326 外边界为 `[112,22,140,43]`，1024×768，行从北向南，像元中心采用半格偏移。B13 星下点标称分辨率约 2 km；输出网格不是新增的观测精度。

## 时间与质量选择

主要选择半小时扫描。NOAA 官方目录没有 10:00 UTC 数据，因此选用实际存在的 **09:50、10:10**，使整个序列间隔为 20 或 30 分钟。`frameIntervalSeconds` 为 `null`；应使用每帧自己的 `timeUtc`，不能按数组索引制造等间隔时钟。原目录证据保留在 `s3-hour-09.xml`、`s3-hour-10.xml` 和 `s3-hour-11.xml`。

`timeUtc` 是名义扫描时间。`scanStartUtc/scanEndUtc` 是构成本图的第 2、3 源分段的扫描时间包络，约 104 秒，不是瞬时曝光，也不是完整圆盘扫描的时长。每段原始逐行时间另存于对应帧元数据。

早期评估曾取到 18:00；但 14:00—15:00 的分段具有非零 operation flag：64 表示可能太阳相关降质，1 表示日食，65 同时包含两者。因此最终展示窗止于 13:30，没有把这些候选图静默当作无质量标记数据。`quality-selection.json` 保留原始标志。交付的 **46 个源分段全部 operation flag 0、错误行数 0、导航修正为 0**。这不等于卫星数据没有仪器误差。

## 定标与数值定义

依据 [JMA HSD v1.3 指南](https://www.data.jma.go.jp/mscweb/en/himawari89/space_segment/hsd_sample/HS_D_users_guide_en_v13.pdf)，读取第 5 头块的计数—辐亮度系数、普朗克常数与亮温修正系数；读取第 3 头块的归一化静止卫星导航参数，按空间最近邻采样到经纬网。未额外施加 GSICS 修正，也未做云视差校正。

固定显示编码为 **180 K 白、310 K 黑**，超出色标范围截断。RGBA 的 alpha 为有效像元 255、缺测 0，**不是云掩膜**。`frames/*-bt-centikelvin.png` 保存 uint16 数值，乘以 0.01 为 K，0 是缺测；超过显示色标的数值仍保留。

`series` 提供两类不同证据：

- 同帧推导量：固定窗口亮温第 10 百分位；亮温 ≤235 K 像元的球面投影面积。后者使用半径 6371.0088 km 的经纬格面积，包含窗口内其他天气系统，不是台风识别结果、降雨面积或灾害范围。
- JMA 原始分析：03、06、09、12 UTC 的中心位置、中心气压与最大持续风速（10 分钟平均）。风速为 85、80、80、75 kt，气压为 945、950、950、955 hPa。仅保留原始三小时记录，不生成中间风速、气压或中心坐标。云图时刻之间引用最近的分析时，应同时显示其实际分析时刻。

JMA 原始固定宽度事件段及全部 69 条记录保存在 `hinnamnor-jma-source.txt`、`hinnamnor-jma-full.json`，源修订日期为 2022-11-24。字段依据 [JMA 最佳路径格式](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/e_format_bst.html)，风速定义见 [RSMC 说明](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/advisory.html)。最佳路径是事后分析，不是每个位置均有仪器直接测得的数值。

## 核验与复现

`validation-report.json` 已通过全部核验：23 个不同显示哈希、0 缺测像元、全部扫描 UTC 与原始 JMA 字段一致；从源计数独立使用标量普朗克公式核查 **2,760 个地理采样点**，与保留数值最大差 **0.004992 K**（0.01 K 量化范围内）。坐标往返误差约 `2.27e-13°`，仅说明变换实现的数值一致性，不能当作实际导航精度。

在项目根目录执行，需 PowerShell 7、Python、numpy、Pillow：

```powershell
pwsh -NoProfile -File research/dynamics/storm/fetch_bounded.ps1
python research/dynamics/storm/process_storm.py
python research/dynamics/storm/verify_storm.py
```

投影算法复用已有 `research/high-frequency-clouds/wide-v10/process_himawari.py` 的导航函数；新解析器按 HSD 分段首行号选择源像元，不读取整幅全球 B13。最终所用 46 段共 **114,220,782 字节**；含初期评估的其他候选，本地研究目录留存 64 段、156,471,237 字节。本次本地研究项目同时保留原始HSD、uint16亮温和核验脚本，便于独立复现；这些研究文件不由页面自动加载。本轮未发布公网。

资料来自 [JMA/NOAA 开放档案](https://registry.opendata.aws/noaa-himawari/) 和 [JMA 最佳路径档案](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html)。署名应保留 JMA、NOAA，并明确本项目完成了区域裁取、定标、重投影与显示；不得称处理后的图片为未经修改原图，也不得暗示官方背书。
