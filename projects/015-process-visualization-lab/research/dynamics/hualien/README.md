# 2024 年花莲地震波形来源与复核

震源采用 USGS 事件 `us7000m9g4`，发震时刻为 2024-04-02 23:58:12.173 UTC（台湾时间 4 月 3 日 07:58:12.173），矩震级 7.4 mww，深度 40 km。原始目录保留 USGS GeoJSON、EarthScope 台站与通道元数据，以及 IU 台网的三份 GeoCSV 波形。[USGS 事件](https://earthquake.usgs.gov/earthquakes/eventpage/us7000m9g4) · [EarthScope 波形查询](https://service.earthscope.org/fdsnws/dataselect/1/) · [IU 台网及数据引用](https://doi.org/10.7914/SN/IU)

三站取同一段 UTC 时间，从 2024-04-02 23:57:00 到次日 00:05:00。每个窗含起点且不含终点，页面时间标在窗终点。台北 TATO 和仁川 INCN 的原采样率各为 20 Hz，日本松代 MAJO 为 40 Hz。三站均为 BHZ 垂直通道。

每站用前 60 秒实测计数的中位数作为基线。每个窗保留去基线后的最小值和最大值，以及绝对偏差最大的带符号原始样本、样本时刻和源文件行号。每站分别缩放显示，计数没有做仪器响应校正，图上只比较同一台站随时间的变化。最大振幅时刻只表示所选时段的峰值，P 波、S 波到时未作判定。

从子项目目录离线生成并独立复核。需要更新官方归档时，先执行 `node research/dynamics/hualien/fetch-waveforms.mjs`，查询链接、HTTP 状态和下载文件 SHA-256 见 [fetch-results.json](fetch-results.json)。

```powershell
python research/dynamics/hualien/process_waveforms.py
python research/dynamics/hualien/verify_waveforms.py
```

本次复核匹配 6 份源文件、38,400 条原始样本和 1,440 个一秒窗，所选窗口均有完整采样。[复核结果](verification.json)
