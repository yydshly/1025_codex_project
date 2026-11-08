# 旧金山港月球星历与潮位数据

回放对应美国加州旧金山 NOAA CO-OPS 验潮站 9414290，纬度 37.806305°、经度 −122.46589°。2025 年 1 月 15 日 00:00 至 23:54 UTC，共 240 个间隔六分钟的时刻。当地对应 1 月 14 日 16:00 至 1 月 15 日 15:54 PST。[NOAA 验潮站主页](https://tidesandcurrents.noaa.gov/stationhome.html?id=9414290)

| 序列 | 来源和口径 |
| --- | --- |
| NOAA 实测 | `water_level` 已验证记录，240 笔均为 `q=v`，标记为 `0,0,0,0`。`sigmaM` 保存计算每笔水位时所用秒样本的标准差。 |
| NOAA 潮汐预报 | `predictions` 六分钟调和潮汐预报，240 笔。查询指定的历史时段，源响应不带单笔发布时间。 |
| NASA/JPL 月球星历 | Horizons 1.2、DE441。验潮站经纬度用于站心方向计算，参考高度取 0 km。方位自正北顺时针，高度采用无大气折射的视高度，保留负高度和源表受光比例。 |

两条潮位序列单位为米，采用当地平均较低低潮面 MLLW。负读数表示低于该基准。Horizons 这一年代的 UT 输出为 UTC，三条序列按时间戳精确匹配。地平线以 0° 为界。月出和月落只标注高度跨过 0° 的相邻记录。它们反映该参考位置的计算几何，实际可见性还受折射、地形、建筑与天气影响。[NOAA API 字段说明](https://api.tidesandcurrents.noaa.gov/api/prod/responseHelp.html) · [NOAA 潮位基准](https://tidesandcurrents.noaa.gov/datum_options.html) · [Horizons 手册](https://ssd.jpl.nasa.gov/horizons/manual.html)

| UTC | 月球视高度 | 实测潮位 | NOAA 预报潮位 |
| --- | --- | --- | --- |
| 02:00 · 实测最低样本 | −2.686229° | −0.383 m | −0.326 m |
| 09:36 · 月球最高样本 | 72.194744° | 1.497 m | 1.540 m |
| 16:48 · 落到地平线下的首个样本 | −0.010601° | 1.347 m | 1.363 m |
| 19:54 · 实测最高样本 | −27.683943° | 1.949 m | 1.890 m |

月出区间为 02:12–02:18 UTC，月落区间为 16:42–16:48 UTC，均以原始采样括定。极值为六分钟样本内的极值。并列的月球方向和潮位供同刻对照。预报与实测之间的差异需要结合气象、海况等信息才能归因。

## 复核

四个公开源的精确请求、HTTP 状态、响应大小、下载时间与 SHA-256 记录于 [下载清单](sources.json)，原始 JSON 响应在 `raw/`。每个样本保留原始序列中的 1 基序号。按 Horizons 报告中的天文单位换算常数生成千米距离，原始 AU 数值也保留。运行以下命令离线复核四个源文件、720 条样本和应用数据包。

```powershell
python research/dynamics/san-francisco-tide/process_tide.py --check
```
