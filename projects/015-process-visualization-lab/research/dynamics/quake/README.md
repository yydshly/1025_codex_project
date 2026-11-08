# 2011东北地震 · 六站真实波形

应用数据：[quake-dynamic.json](../../../app/data/quake-dynamic.json)。事件元数据来自[USGS东北地震](https://earthquake.usgs.gov/earthquakes/eventpage/usc0001xgp)，本次保存的首选解为2011-03-11 05:46:24.120 UTC、M9.1（mww）、深度29 km。源查询ID解析到`official20110311054624120_30`；保留整份GeoJSON及修订时间，不混用其他机构的初始解。

## 取得了什么

六个IU网络台站的`00.BHZ`垂直通道，UTC 05:45:00—06:05:00，原始采样率20 Hz，每站24,000个原始计数；本次所取时间窗无检测到的缺样或空窗。

| 台站 | 官方站名 | 纬度 | 经度 |
| --- | --- | ---: | ---: |
| IU.MAJO | Matsushiro, Japan | 36.54567 | 138.20406 |
| IU.INCN | Inchon, Republic of Korea | 37.4776 | 126.6239 |
| IU.TATO | Taipei, Taiwan | 24.9735 | 121.4971 |
| IU.YSS | Yuzhno Sakhalinsk, Russia | 46.9587 | 142.7604 |
| IU.GUMO | Guam, Mariana Islands | 13.5893 | 144.8684 |
| IU.ULN | Ulaanbaatar, Mongolia | 47.8651 | 107.0532 |

波形取自[EarthScope FDSN dataselect](https://service.earthscope.org/fdsnws/dataselect/1/)，每个请求明确`format=geocsv`，**未使用`scale=AUTO`**。返回头的`field_unit`为`UTC, Counts`。台站／通道元数据来自[EarthScope FDSN station](https://service.earthscope.org/fdsnws/station/1/)，坐标与每个波形段头逐一核对。通道灵敏度及输入单位m/s仅作为原始元数据保存，未用它直接替代完整响应校正；输出仍是数字仪器计数，绝非m/s或cm/s。

## 显示数据如何得到

先减去各站震前一分钟（05:45:00 ≤ UTC < 05:46:00）实际计数的中位数，使静态偏置不占据图形。然后将同一UTC时间窗按1秒分组：

- `timeUtc`是该窗的结束时刻，首条05:45:01、末条06:05:00；原采样时刻均在显示时钟之前。
- `min`／`max`是该窗实际原采样最小／最大值减同一个基线。
- `value`是该窗绝对偏离基线最大的**一个真实采样值**减去基线，不是平均值或插值。
- `peakTimeUtc`保留该样本微秒精度的原时标；`rawValue`与`sourceLine`可直接找回GeoCSV原行。`sampleCount`、首／末原样本时刻也保留。
- 空窗使用null，部分窗保留实际数量与状态；本事件六站均为每窗20个样本。处理器没有填补、滤波、理论波形或相位拾取。

每站`displayScaleMaxAbsCounts`是本窗该站最大绝对去基线计数，可供独立显示归一化。不同仪器灵敏度不同，**不能按counts或归一化图形比较不同台站实际震动强弱**。针柱长度、符号或圈径只是该站信号的视觉编码，不是地表位移、烈度、传播波前或影响范围。波形可以用于观察记录随时间出现的差异；本版没有自动把变化点认定为P／S波到时。

仪器可能包含长周期响应、漂移或削波，本次没有专业质量评估、响应反卷积或物理量标定。负值仅表示通道计数相对基线的符号。若后续需要地面速度或加速度，须取得完整响应并明确处理频带与质量检验后另生成产品，不能改一个单位标签。

## 文件、复现与来源

`raw/`保存六份未经改写的GeoCSV、官方通道／站名文本和USGS事件GeoJSON；`fetch-results.json`含请求URL、最终URL、获取时间、字节数、SHA-256。`process_waveforms.py`离线生成应用JSON与`processing-report.json`，`verify_waveforms.py`独立逐窗核对原数据和峰值来源，结果在`verification.json`。仅使用Python标准库，无额外科学库依赖。

```powershell
node research/dynamics/quake/fetch-waveforms.mjs
python research/dynamics/quake/process_waveforms.py
python research/dynamics/quake/verify_waveforms.py
```

首次取数曾发生DNS失败，保存在`sample-fetch-results.json`；随后对官方新域名重试成功。旧IRIS timeseries/ASCII处理服务已于2026-08-26退役，因此实际数据不依赖它。[官方迁移说明](https://ngf.earthscope.org/news/retirement-of-the-irisws-timeseries-web-service)

署名USGS、EarthScope、IU Global Seismograph Network及原数据贡献方；网络引用与数据使用说明见[FDSN IU网络页](https://www.fdsn.org/networks/detail/IU/)。公开接口可读取不等于本项目取得所有衍生媒体的统一商业授权。此次仅保存公开科学数值及元数据，没有向外发布服务。
