# Dixie 山火边界复盘

使用 Benjamin Hatchett 整理自 NIFC 的航空红外制图边界。选取 2021-07-27 至 2021-08-06 可用的九份 `HeatPerimeter` 原档。文件名的日期是播放器时间键，具体测绘时刻未核实。`2021-08-02` 和 `2021-08-03` 在该存档中缺失。[源数据和下载](https://zenodo.org/records/15492982) · [CAL FIRE 事件档案](https://www.fire.ca.gov/incidents/2021/7/13/dixie-fire)

各期 WGS84 几何转换为等面积投影 EPSG:5070，修复无效拓扑后合并同一期多边形。橙色显示本期与前一期的差集，蓝色显示前一期与本期的差集。例：8 月 6 日制图边界内面积为 1,822.66 km²，与 8 月 5 日相比新划入 500.55 km²，前期划入而本期未划入 0.03 km²。两种差集的面积差对应总面积净变化，允许显示时的四舍五入误差。制图范围内可能存在未燃斑块。边界差异可同时反映实际扩展和档案修订，资料的日期粒度也限制了传播速度或起火时刻的解读。

## 风、地形与火前植被

- 风取 NWS HADS 经 Iowa Environmental Mesonet 归档的 Humbug Summit（HMRC1）、Bogard（BOGC1）及 Hidden Valley（HDVC1）站。保留原始 UTC 时间、英里每小时、来向角。地图显示风去向，读数换算为 km/h。界面按当地 PDT 小时筛选实际记录，图上的三站时刻可不同。制图日期只提供风记录的浏览区间。风箭头长度随本站风速变化，仅作符号显示。[风档案查询 CSV](https://mesonet.agron.iastate.edu/cgi-bin/request/hads.py?network=CA_DCP&year1=2021&month1=7&day1=27&hour1=7&minute1=0&year2=2021&month2=8&day2=7&hour2=7&minute2=0&what=txt&delim=comma&stations=HMRC1&stations=MSVC1&stations=BOGC1&stations=KRKC1&stations=HDVC1&stations=QYRC1&stations=HSRC1&stations=JBGC1) · [测站坐标](https://mesonet.agron.iastate.edu/geojson/network/CA_DCP.geojson) · [NOAA SHEF 变量代码](https://www.weather.gov/media/mdl/SHEF_CodeManual_5July2012.pdf)
- 地形使用 USGS 3DEP 高程与阴影渲染。坡度从显示范围内配准后的高程网格梯度计算，网格间距约 170–222 米。地名地图提供道路与水域名称。[USGS 3DEP GeoTIFF 导出](https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage?bbox=-122.62,39.59,-119.62,40.79&bboxSR=4326&imageSR=4326&size=1500,600&format=tiff&pixelType=F32&interpolation=RSP_BilinearInterpolation&f=image)
- 植被使用 LANDFIRE 2016 Remap Fuel Vegetation Type（FVT），各色代表分类，界面突出当地常见类别。FVT 是火前植被制图基线，2021 年火线附近的燃料湿度与地表负荷需要其他资料。[FVT 产品说明](https://landfire.gov/fuel/fvt) · [2016 FVT GeoTIFF 导出](https://lfps.usgs.gov/arcgis/rest/services/Landfire_LF2016/LF2016_FVT_CONUS/ImageServer/exportImage?bbox=-122.62,39.59,-119.62,40.79&bboxSR=4326&imageSR=4326&size=1500,600&format=tiff&pixelType=S16&interpolation=RSP_NearestNeighbor&f=image)

8 月 5 日至 6 日的 500.55 km² 新划入范围，以上期范围的等面积质心为中心划入北、东、南、西四个约 90° 扇区。北侧约 260.3 km²，东侧约 236.7 km²，西侧约 3.5 km²，南侧四舍五入为零。坡度中位数和植被分类比例由新增区内的栅格像元中心计算。虚线指出扇区内代表性新增区，与实测风箭头区分。8 月 5 日下午三个站多次记录到带东向分量的风，与东侧扩展方向相符。判定北侧扩展原因及各因素贡献需要更多近火线记录。[NWCG 风与火行为](https://www.nwcg.gov/publications/pms425-1/6-general-winds)

复现：下载 `DixieFire_2021_perimeters.zip`，以 [USGS 导出查询](https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/export?bbox=-122.62,39.59,-119.62,40.79&bboxSR=4326&imageSR=4326&size=3000,1200&format=jpg&f=pjson) 的 JSON 和它的 `href` 影像为底图输入。装有 `pyshp`、`shapely`、`pyproj`、`Pillow` 的 Python 环境中运行 `python scripts/build-dixie-replay.py <archive.zip> <topo.jpg> <topo.json>`。脚本核对发布档案 MD5 和底图配准。逐期原档文件名、几何与生成图哈希、底图范围和哈希保存于 [回放数据](../../../app/data/wildfire-dixie-dynamic.json)。`npm run check:dynamics` 检查素材与日期完整性、图表读数以及面积差集的平衡。

将上述风 CSV、高程 GeoTIFF 和植被 GeoTIFF 下载到本地。从 [LF 2016 FVT CONUS 压缩包](https://landfire.gov/data-downloads/CONUS_LF2016/LF2016_FVT_CONUS.zip) 提取 `Tif/LF2016_FVT_CONUS.tif.vat.dbf` 作为同版本类别表。此文件位于 ZIP 尾部，可用 HTTP Range 获取最后 256 KiB 再按中央目录读取。另安装 `numpy`，运行 `python scripts/build-event-terrain.py dixie <archive.zip> <dem.tif> <fvt.tif> <wind.csv> <fvt.vat.dbf>`。生成的 [证据数据](../../../app/data/dixie-context.json) 保留输入文件 SHA-256 和原始类别名。
