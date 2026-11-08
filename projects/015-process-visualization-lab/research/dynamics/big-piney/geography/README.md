# Big Piney 河段地图来源

- 影像来自 USGS The National Map 的 USGSImageryOnly 地图服务。按 EPSG:4326 导出，边界为 `[-92.109, 37.777, -92.037, 37.851]`，尺寸为 1440×1480。影像提供地理背景，日期采用地图服务的底图版本。[源影像查询](https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/export?bbox=-92.109%2C37.777%2C-92.037%2C37.851&bboxSR=4326&imageSR=4326&size=1440%2C1480&format=jpg&f=image)
- `nhd-flowlines.geojson` 保留 USGS National Hydrography Dataset 大比例尺图层的原始响应。请求选取覆盖监测断面的空间范围，按名称 `Big Piney River` 筛选。返回 15 条河道线段，供影像定位与影像无法载入时的地图背景使用。[源图层](https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/6)
- 监测位置取自 USGS 示踪实验数据中的六个荧光计坐标。图上两岸间的短线标识配对断面。色环、柱高和读数各自只对应当前时刻的单台仪器，六台共用同一显示尺度。缩放采用 `sqrt(ppb / 250)`，并保留原始 ppb 数字。[示踪数据说明](../README.md)

`node research/dynamics/big-piney/geography/build-map.mjs` 从原始 GeoJSON 生成客户端地理配置。`--check` 同时核对原始响应、影像哈希和生成配置。
