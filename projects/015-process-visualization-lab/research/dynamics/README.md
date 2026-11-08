# 三个真实事件的同步回放资料

这组资料用已取得的卫星扫描和台站波形驱动地球图层，并让读数、图表与该条观测对应。它们都是历史案例，不是当前灾害监测。空间最近邻重投影、数值统计和显示映射属于加工过程；没有生成中间云图、理论震波或未经观测的三维灰浓度。

| 案例与应用清单 | 实际资料 | 回放时间（UTC） | 单位与取样 |
| --- | --- | --- | --- |
| [汤加喷发](../../app/data/volcano-dynamic.json) | JMA Himawari-8 AHI B13 红外，NOAA 开放档案 | 2022-01-15 03:50—07:50，25 帧 | 名义每10分钟；亮温 K，固定300公里邻域低温面积 km² |
| [日本东北地震](../../app/data/quake-dynamic.json) | EarthScope IU 网络六站 `00.BHZ` 原始计数，USGS 事件目录 | 原始窗2011-03-11 05:45:00—06:05:00；显示窗末05:45:01—06:05:00 | 原始20 Hz；每站1200个1秒窗；counts |
| [轩岚诺台风](../../app/data/storm-dynamic.json) | JMA Himawari-8 B13，加 JMA 事后最佳路径 | 2022-09-05 03:00—13:30，23 帧 | 实际所选间隔20—30分钟；亮温 K、低温区域 km²；分析风速 kt、气压 hPa |

## 时间、坐标与共同播放时钟

卫星 `timeUtc` 是 HSD 文件名的名义扫描时间线，**不是该区域的一次瞬时曝光**。每帧另保留所用分段的实际 `scanStartUtc`／`scanEndUtc`。例如汤加首帧名义03:50，实际所取分段为03:56:03.920—03:58:27.651；末帧名义07:50，实际为07:56:03.667—07:58:27.396。汤加还保留由原始行时间推算的区域扫描时间范围，该值只是估计范围。

应用按清单中实际帧逐张播放，影像加载成功后才同时提交时钟、图表和读数。卫星统计的时间标签沿用对应扫描的名义时间；这表示它们来自同一帧，不代表整个区域同一毫秒被观测。台风最佳路径有单独的分析时刻；在两次分析之间只引用不晚于回放时刻的最近记录，并显示其原时刻，不把它称为该云图时刻的直接实测。

汤加栅格的经度范围是展开后的 `[174,-29,193,-12]`：193°E 等于167°W。图层先在局部经度 `[-6,13]` 建立贴片，再绕地球Y轴旋转正180°，与原174—193°E一致；纹理横轴和原像元没有翻转。独立核对了角点、日界线及火山位置的球面向量；该计算一致性检验不是外部定位精度证明。高空云视差仍未校正。

汤加场景的「下潜到海底」从地球镜头飞近 NIWA 测绘区域。喷发前地形使用 2015–2017 年合成资料，喷发后地形取自 2022 年 4–5 月和 8 月航测。两套 50 米 DEM 在 UTM 1S 下配准到相同的 22 × 16 km 网格，以相同色标与 2.6 倍垂直比例渲染。缺测格点不生成三角面。剖面视图沿同一条东西向测线打开地形，左右图表和三维标记引用同一格点。靠近剖面中心的样点（E 668475，N 7726475）水深分别为 82.1 米和 856.5 米。测绘时段与红外逐帧时钟分列。

下载两个 GeoTIFF 后运行 `python scripts/build-event-terrain.py hunga <pre.tif> <post.tif>`。脚本核对原档 MD5，按最近邻取样到统一网格，再以分米量化，输出两套高程与 SHA-256。渲染器将网格中心和网格东方向映射到同一地球。为露出海底起伏，局部显示基准稍抬高，剖面、深度与差值均来自网格原始比例。[NIWA 原始测深](https://zenodo.org/records/7456324)

「测深差值」以喷发后地形为基准，按同一格点的喷发前高程减去喷发后高程着色。正值加深，负值变浅。140,800 格中有 139,907 格可比较，另有 893 格缺少喷发后测深，使用已知的喷发前高程绘制灰纹表示缺测。两期都缺测的位置留空。分段色标突出近零差值，右侧剖面下方的色带使用同一色标。两期测绘来源、精度和配准差异会影响小差值的解释。

地震显示时刻是**刚结束的1秒窗末**。每个 `value` 为该窗内绝对偏离震前基线最大的一条真实原始采样；`peakTimeUtc`、原始行号、min/max与样本数量都保留。没有把峰值挪到比它更早的时钟点。

## 各案例的数值与显示边界

**汤加。** 25帧只取原盘第7、8段，显示分辨率1024×916。官方火山目录位置为20.5532°S、175.3841°W。两条曲线在固定300公里大圆邻域内统计：亮温小于220 K的像元面积，以及按球面像元面积加权的亮温第10百分位。统计直接读取交付的uint16亮温数据；该邻域不是喷发云边界，低温像元也不是已识别的火山灰。区域外的扩展不计入，区域内的气象云仍被保留。25帧无缺帧、无缺失像元；[独立验证](volcano/validation-report.json)包括200个原始DN像元的独立定位与Planck重算、全部图像哈希、全像元显示映射及曲线核对。[来源与处理细节](volcano/source-notes.json)。

**东北地震。** 六站为IU.MAJO、INCN、TATO、YSS、GUMO、ULN。每站24,000条原始20 Hz计数，扣除各站震前一分钟中位数后，生成每秒实际峰值与min/max包络。本次六站没有检测到缺样或空窗；通用处理规则是空窗null，不填补。未做完整仪器响应反卷积，counts不是地面速度、加速度或位移。地球上的针柱、圈和波形条带仅为各站自身信号的显示编码；按各站独立尺度归一化，不能跨站比较实际震动强弱，也不是台站之间的传播波前。[完整说明](quake/README.md)、[逐窗核验](quake/verification.json)。

**轩岚诺。** 栅格固定窗口为 `[112,22,140,43]`，1024×768。亮温第10百分位按窗口有效像元计数；≤235 K面积按球面经纬网面积求和。它们取自该帧定标后的浮点亮温场，留存的uint16副本量化到0.01 K；阈值附近的复算应使用原始定标值，不能从8位灰度色彩反推。窗口含其他天气系统，指标不是风暴云体识别、降雨面积或灾害范围。JMA原始分析仅有03/06/09/12 UTC四条；风速为10分钟平均的最大持续风速，气压为事后分析。

轩岚诺的10:00原始扫描在官方目录缺档；所选序列使用真实09:50、10:10，故间隔20—30分钟，没有10:00伪造帧。原计划14:00—15:00候选段存在太阳相关退化或日食操作标志，最终截止13:30，全部交付段的操作标志为0。23帧中无缺失像元。[质量选择](storm/quality-selection.json)、[验证报告](storm/validation-report.json)。

## 影像颜色、透明度与立体感

两组卫星显示PNG都以180 K为白、310 K为黑，超出范围的显示值截断，但数值资料保留实际亮温。透明度只区分有效数据与缺失，不是云掩膜。地球融合模式另外采用固定的温度透明度映射、边缘淡化与同帧纹理光照；这些只是为了看清结构，不代表云量、光学厚度、辐射反演或测得高度。灰阶核对模式保留同一帧的完整派生图。

不要把单通道亮温直接换成喷发高度。NASA对汤加喷发的高度研究使用双星几何关系；本项目没有复现双星立体测高。图表连线只是帮助读离散记录，读数不使用连线推算中间观测值。

## 来源、文件与复现

- 卫星原始资料与再利用条件：[JMA/NOAA开放档案](https://registry.opendata.aws/noaa-himawari/)、[JMA HSD说明](https://www.data.jma.go.jp/mscweb/en/himawari89/space_segment/hsd_sample/HS_D_users_guide_en_v13.pdf)。加工后图像需明确为派生产品，不暗示JMA/NOAA背书。
- 汤加事件背景：[NASA连续红外与立体测高说明](https://science.nasa.gov/earth/earth-observatory/tonga-volcano-plume-reached-the-mesosphere-149474/)、[Smithsonian火山目录](https://volcano.si.edu/volcano.cfm?vn=243040)。
- 地震：[USGS事件](https://earthquake.usgs.gov/earthquakes/eventpage/usc0001xgp)、[EarthScope波形](https://service.earthscope.org/fdsnws/dataselect/1/)、[台站元数据](https://service.earthscope.org/fdsnws/station/1/)。
- 台风：[JMA最佳路径档案](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html)、[字段说明](https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/e_format_bst.html)。

应用使用 `app/data/*-dynamic.json` 与 `app/assets/events/{volcano,storm}-dynamic/`。研究子目录保存来源URL、原文件哈希、获取时间、处理元数据和核验结果。本地研究项目保留原始HSD与数值资料用于离线复现；网页按需加载显示PNG，不读取原始卫星文件；如果离线核验环境没有原始文件，需先按明确日期、波段和分段重新获取。汤加显示图15,100,366字节，轩岚诺显示图12,489,879字节；两组显示图不是完整原盘文件。

在项目根目录执行；下载需要网络，已具备原始文件时处理和验证可离线运行。卫星处理需要Python3.10+、NumPy、Pillow和项目已有导航模块；地震处理仅依赖Python标准库，抓取脚本使用Node。PowerShell下载脚本需要PowerShell7。

```powershell
# 汤加：严格25帧、B13、第7/8段
pwsh -NoProfile -File research/dynamics/volcano/fetch-tonga.ps1
python research/dynamics/volcano/process_volcano.py
python research/dynamics/volcano/verify_volcano.py

# 东北地震：六站原始20Hz计数与官方台站信息
node research/dynamics/quake/fetch-waveforms.mjs
python research/dynamics/quake/process_waveforms.py
python research/dynamics/quake/verify_waveforms.py

# 轩岚诺：有界扫描集合及JMA最佳路径原文
pwsh -NoProfile -File research/dynamics/storm/fetch_bounded.ps1
python research/dynamics/storm/process_storm.py
python research/dynamics/storm/verify_storm.py
```

记录本次实际交付范围的文件优先于早期样例清单。`sample`、被排除质量候选或失败下载记录是研究证据，不代表已纳入应用播放。

## v16 球面变化标注

`derive-observed-features.py`从原有48帧uint16厘开尔文数值PNG生成`app/data/observed-change-features.json`。每8×8块选实际中心像元，不平均、不生成新时刻；四邻接阈值区域提取格网边线，合并共线段。汤加仅原300公里统计邻域内<220 K，轩岚诺为原窗口≤235 K。参考轮廓不是完整像元边界；采样格最大对角分别23.09和33.17公里，不代表误差上界。云视差仍未校正。

每帧锚点从合格的原始数值像元选取，只帮助找到本帧低温区，没有跨帧目标跟踪或云移速估计；区域P10不解释为锚点的测温。生成说明、输入SHA、扫描时间和核验保存在`observed-features-notes.json`、`observed-features-report.json`。运行`python research/dynamics/derive-observed-features.py`可重新提取；现有测试逐帧重读数值图，核对输入SHA、阈值、边线网格、区域范围与相邻统计差。

汤加融合呈现另有400公里内原权重、400—600公里平滑渐隐的空间聚焦，仅乘在显示不透明度上；原始亮温模式绕过此聚焦，原PNG、温标、扫描时间和300公里统计不变。实现与边界见`volcano-display-focus.json`。纹理光照仅增强同帧层次，不是测得云高。
