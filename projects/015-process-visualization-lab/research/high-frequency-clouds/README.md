# 山竹真实高频红外影像

本目录记录 2018 年山竹的 Himawari-8 AHI 第 13 波段资料处理与核验。原始 HSD 来自 [NOAA/JMA 公共档案](https://registry.opendata.aws/noaa-himawari/)，对象键、下载地址及原始文件 SHA-256 保存在清单中；不是模拟云图或 AI 生成图。

## 覆盖与图像含义

- 时间：2018-09-16 **00:00—12:00 UTC**，即香港时间 08:00—20:00。73 个十分钟刻度中，官方目录缺少 **02:40 UTC**，实际交付 72 帧；缺档不补图、不插值。
- `timeUtc` 是名义扫描时刻。每帧另存 HSD 原始扫描起止时间；全圆盘扫描历时数分钟。区域扫描起止是根据逐行时间插值得到的估计，不能当作精确逐像元曝光时刻。
- 输出为 EPSG:4326 区域图，固定外边界 `[105, 5, 140, 35]`（西、南、东、北），1024×878 像素，行从北到南，按像元中心取样。该矩形之外没有本图层观测，不能拉伸为全球贴图。
- 原始第 13 波段中心波长为 10.4073 μm，星下点分辨率约 2 km。按 HSD 第 5 头块的系数将原始计数转换为辐亮度，再按普朗克公式及修正系数换算亮温；未另外施加 GSICS 修正。
- 使用原始导航参数从归一化静止卫星投影重投影到经纬网，采用空间最近邻采样，**没有时间补帧**。固定显示色标为 180 K 白、310 K 黑；范围外截断。RGBA 的透明度仅区分有效与缺测像元，不是云掩膜。
- 亮温不是自然色、降雨、风速或精确云高。云视差未经校正，仍有仪器定位误差；坐标转换的数值一致性不能证明同等绝对地理精度。

格式、时间和标定依据为 [JMA HSD v1.3 用户指南](https://www.data.jma.go.jp/mscweb/en/himawari89/space_segment/hsd_sample/HS_D_users_guide_en_v13.pdf)。程序对非零操作质量标志、未实现的导航修正和错误行中止处理，避免静默输出。

## 交付文件与复用

网页使用的 72 张 RGBA 图位于 `../../app/assets/events/himawari8-b13/`，约 50.4 MB，由 `../../app/data/mangkhut-synchronized.json` 接入页面。本目录 `frames/` 保留逐帧元数据与 16 位亮温 PNG；后者乘以 0.01 得到 K，0 表示缺测。

`himawari-b13-manifest.json` 保留**预处理时的目录布局**：其中 `frames/*.png` 是生成流程的原始相对路径，不代表最终网页部署路径。交付的显示图已放入上述 app 目录；不能直接拿研究清单的相对路径作为网页入口。

`half-day-objects.json` 与 S3 XML 记录真实可用对象，`missing-observations.json` 记录缺档，`source-assessment.json` 记录来源评估，`validation-report.json` 保存全量校验及独立科学复核结果。原始 HSD 共 1,742,759,961 字节，**只保留在 D staging，不随项目重复复制到 E，也不随网页发布**。用于旁证的 CIRA GIF 同样不包含在交付包中，复现不依赖它。

NOAA 的数据登记说明允许其公开分发 JMA 资料，要求使用时署名，且不得暗示官方背书。建议署名：**JMA Himawari-8 / NOAA Open Data Dissemination；本项目完成区域标定、重投影与灰阶呈现**。这些处理后的图片不能称为未经修改的原始影像。

## 复现

需要 Python 3.10 或更新版本、`numpy`、`Pillow`；下载脚本需要 PowerShell 7 和访问官方 S3 的网络。解压使用 Python 标准库 `bz2`。请在有约 2 GB 以上可用空间的工作副本运行，下载限定为这半日、这个波段。

在本目录运行：

```powershell
python -m pip install numpy Pillow
pwsh -File ./fetch_half_day.ps1
python ./process_himawari.py
python ./verify_frames.py
```

下载脚本按已核验目录获取 72 个单波段文件，校对字节数，最多并发 3 个请求；2018 年这些 HSD 是未分段文件，因此需要下载该波段全圆盘后裁取区域。处理逐帧执行，生成研究目录下的显示图、数值图和清单，再将显示图交付到 app 目录。

`verify_frames.py` 会重新读取原始 HSD 并核对其哈希，同时核对预处理布局中的显示图和数值图。因此**仅凭精简交付包不能重跑此完整校验**：须先按以上步骤重新下载原始资料并生成 `frames/*.png`；留存的验证报告不是重新运行后的结果。
