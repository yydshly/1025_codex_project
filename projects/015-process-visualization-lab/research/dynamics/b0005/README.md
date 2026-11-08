# NASA B0005 首次放电实测

NASA Ames 的 PCoE 电池老化数据记录了圆柱锂离子电芯的实验过程。这个回放使用原档 `B0005.mat` 中首个 `discharge` 记录，对应原档循环数组索引 1。该记录的环境温度为 24 °C，源日期为 2008 年 4 月 2 日 15:25:41.593，时区未知。档案将测试台归于 NASA Ames PCoE，测试台位置没有坐标字段。 [NASA 数据目录和字段说明](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets) · [NASA 原始档案](https://phm-datasets.s3.amazonaws.com/NASA/5.+Battery+Data+Set.zip)

| 回放通道 | MATLAB 字段 | 单位 |
| --- | --- | --- |
| 电芯端电压 | `Voltage_measured` | V |
| 电芯输出电流 | `Current_measured` | A |
| 电芯温度 | `Temperature_measured` | °C |

回放时间从原档 `Time` 数组读取，共 197 条，经过时间为 0 至 3690.234 秒。电流保留原档符号。数据包同时保存负载侧 `Current_load` 与 `Voltage_load`。剖面显示通用圆柱电芯结构，电芯温度采用实验的单一温度通道。电流加载标记采用首条电芯输出电流不高于 −1 A 的实测采样。

| 经过时间 | 端电压 | 输出电流 | 电芯温度 | 原档采样 |
| --- | --- | --- | --- | --- |
| 00:00.000 | 4.191 V | −0.005 A | 24.33 °C | 首条记录 |
| 00:35.703 | 3.975 V | −2.013 A | 24.39 °C | 已加载 |
| 30:52.391 | 3.523 V | −2.012 A | 32.98 °C | 记录时段中点附近 |
| 55:46.937 | 2.612 V | −2.013 A | 38.90 °C | 最低电压 |
| 56:06.781 | 2.998 V | −0.004 A | 38.98 °C | 最高温度，电流回到接近零 |
| 1:01:30.234 | 3.277 V | −0.007 A | 34.23 °C | 末条记录 |

表格按显示精度取舍，数据包保留 MATLAB 数值精度。

## 复核

[下载记录](source-receipt.json)记载原档请求范围、版本标记、两层成员校验和及 B0005 文件哈希。`fetch_b0005.py` 可重新获取原始档案成员。数据包可使用 SciPy 和归档的 MATLAB 文件离线重建与逐条核对。NASA 目录的许可证字段为未注明。 [NASA 数据目录](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets)

```powershell
python research/dynamics/b0005/process_battery.py
python research/dynamics/b0005/process_battery.py --check
```
