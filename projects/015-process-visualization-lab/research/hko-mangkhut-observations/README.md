# 2018 山竹：香港风与雨原始观测

已实际获取 2018-09-15—17 香港时间资料。供前端接入的文件是 `hong-kong-wind-rain.json`，没有插值、补零或从图片估读数据。

| 层 | 实际资料 | 适合怎样展示 |
| --- | --- | --- |
| 机场风 | NOAA NCEI 保存的 VHHH 原始报文：128 条 METAR、13 条 SPECI；另保留 16 条 SYNOP 原始记录 | 常规风每半小时采样；按原生 kt 转 km/h；缺报断线。SPECI 单独作为特别报告点 |
| 东区雨 | DATA.GOV.HK 官方档案 92 份 HKO RSS，去重后 41 个有明确起止时间的小时雨表 | 原表下限—上限的范围带；不是区平均，更不是鲗鱼涌站值 |

这 92 份快照全部在 9 月 15—17 日。原政府月归档 ZIP 为 1,406,175 字节，本目录只保留这三天 92 份 XML；源 ZIP 哈希和最终下载地址在 `rss-download-metadata.json`。同一雨窗的多份快照经检查数值一致，JSON 保留所有来源，发布时间取首次提供该雨窗的报文。

## 计划主窗：9 月 16 日 08:00—20:00 HKT

UTC 范围为 `2018-09-16T00:00:00Z`—`2018-09-16T12:00:00Z`。

- 风：20 条常规 METAR，10:30—20:00 HKT 每半小时一条。08:00、08:30、09:00、09:30、10:00 HKT 在此次官方档案中缺报；上一条是 07:00 HKT，不能用它补齐这段。
- 雨：12 个小时窗，结束时间 08:45—19:45 HKT。其中 17:45—18:45 HKT 原表未列东区，保留 `lowerMm:null, upperMm:null`。其余 11 窗有值。
- 风是机场观测，雨是东区范围；与鲗鱼涌潮位共享时间轴不等于三者来自同一地点。

可核验样本：

| 原始时间 / 窗口 | 数值 | 原始证据 |
| --- | --- | --- |
| 2018-09-16 13:00 HKT | 机场 60 kt，即 111.12 km/h；阵风 84 kt | `METAR VHHH 160500Z 07060G84KT ...`；源 JSON 第 81 个零基索引记录，WND 为 `070,1,N,0309,1` |
| 2018-09-16 11:45—12:45 HKT | 东区 2—48 mm | `raw-rss/20180916-1315-CurrentWeather.xml`；13:02 HKT 发布，13:15 HKT 归档 |
| 2018-09-16 16:45—17:45 HKT | 东区 3 mm | 原文是单值，转换为 `lowerMm:3,upperMm:3`，未扩大区间 |

## 前端字段与语义

`wind.records[]`：`timeUtc`、`windSpeedKt`、`windSpeedKmh`、`windSpeedMs`、`gustSpeedKt`、`gustSpeedKmh`、`windDirectionDeg`、`meanPeriodMinutes`、`qualityCode`、`rawWindGroup`、`rawMetar`、`sourceRecordIndex`。

`windSpeedKt` 来自原始 METAR 风组，`windSpeedKmh = kt × 1.852`。`windSpeedMs` 为 ISD WND 解码的 0.1 m/s 精度值，因此换算取整可能与原生 kt 不完全相等。全部常规风的 ISD 风速质量码为 `1`（通过全部质量控制检查）；这不能用来声称阵风也有独立的相同质量码。未报阵风是 `null`。

METAR/SPECI 的平均窗口按 ICAO Annex 3 为 10 分钟，期间有显著不连续变化时窗口可缩短；半小时是报文间隔，两者必须分别标注。站点坐标来自 2018 记录，表示机场站位置，不声称是具体风仪坐标。当前香港 AIP 只用于解释服务和报告机制，不能把当前三跑道风仪布置套用到 2018 年。

`rain.records[]`：`timeUtc`（等于窗口结束）、`windowStartUtc`、`windowEndUtc`、`lowerMm`、`upperMm`、`status`、`publishedAtUtc`、`sourceSnapshots[]`。每个来源保留原 XML 文件名、官方档案获取 URL、SHA-256。`status:district-not-listed` 表示本窗未列出东区，而非 0 mm。

三个时间不同：观测窗结束、HKO 发布时间、政府归档时间。历史观测回放可按窗结束对齐，但不能说这些数值在窗口结束那一刻已经公开。雨量应显示完整累计窗口，图线不可把累计量当瞬时雨强。不要将下上限取中点或相加生成东区总量。

## 可追溯性与复现

- `parse-observations.py` 只读取本地原始文件；重新运行可重建 JSON。
- `noaa-airport-sample.json` 是官方 API 的原始 157 条记录，未修改正文。API 无需凭证。
- `noaa-station-metadata.json` 摘录官方站表，确认 `45007099999 = HONG KONG INTL / VHHH`。
- `hko-all-district-rain-windows.json` 保留所有地区原数值，可后续扩展地区选择。
- `raw-file-integrity.json` 保存原文件长度及 SHA-256。
- NOAA SYNOP AA1 中部分非零值带 condition code `3`，其累计期语义未充分解决，未用于雨曲线。原报文仍完整保留。
- 检查已通过：128 条常规风、41 个雨窗、升序去重、kt 与 ISD m/s 一致性、60 kt/84 kt 样本、2—48 mm 样本、单值 3 mm、东区缺项保持 null。

## 官方来源

- [NOAA NCEI 原始观测查询](https://www.ncei.noaa.gov/access/services/data/v1?dataset=global-hourly&stations=45007099999&startDate=2018-09-14T16:00:00Z&endDate=2018-09-17T15:59:59Z&format=json&includeAttributes=true)
- [NOAA ISD 站表](https://www.ncei.noaa.gov/pub/data/noaa/isd-history.csv) / [ISD 字段说明官方云镜像](https://noaaisd.blob.core.windows.net/noaa-isd/pub/data/noaa/isd-format-document.pdf)
- [香港政府历史档案 API 说明](https://data.gov.hk/en/help/api-spec) / [13:15 HKT 原始 RSS 快照](https://app.data.gov.hk/v1/historical-archive/get-file?url=https%3A%2F%2Frss.weather.gov.hk%2Frss%2FCurrentWeather.xml&time=20180916-1315)
- [HKO METAR/SPECI 解码说明](https://www.hko.gov.hk/en/aviat/decode_metar.htm) / [ICAO 平均窗口规范](https://applications.icao.int/tools/ATMiKIT/story_content/external_files/story_content/external_files/Annex%203_cons.pdf)（Appendix 3 §4.1.3）
- [香港天文台山竹正式报告](https://www.hko.gov.hk/en/publica/tc/tc2018/section3_5rpt.html)

本次雨量是通过政府开放数据档案取得，署名应保留「香港天文台／香港特区政府；历史档案 DATA.GOV.HK」。[DATA.GOV.HK 条款](https://data.gov.hk/en/terms-and-conditions)允许在其条件下商业及非商业下载、复制和分发，并要求清楚标明来源和权属；HKO 其他网页图片另有[网站使用条款](https://www.hko.gov.hk/en/readme/readme.htm)，不能自动套用本数据的开放条件。
