"""Build the Dixie archive replay from the published ZIP and a registered USGS Topo export.

Dependencies: pyshp, shapely, pyproj, Pillow. The date in each original file
name is the replay key. The archive does not establish a flight time of day.
"""

import argparse
import hashlib
import io
import json
from datetime import date
from pathlib import Path
from zipfile import ZipFile

import shapefile
from PIL import Image, ImageDraw, ImageEnhance
from pyproj import Transformer
from shapely import make_valid
from shapely.geometry import GeometryCollection, shape
from shapely.ops import transform, unary_union


APP = Path(__file__).resolve().parents[1] / 'app'
ARCHIVE_MD5 = '098c12989f93d3c5f3f4c9edb3832bab'
BOUNDS = (-122.62, 39.59, -119.62, 40.79)
FIRE_VIEW = (-121.57, 39.80, -120.43, 40.65)
SIZE = (3000, 1200)
DATES = ('20210727', '20210728', '20210729', '20210730', '20210731', '20210801', '20210804', '20210805', '20210806')
TOPO = ('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/export'
        '?bbox=-122.62,39.59,-119.62,40.79&bboxSR=4326&imageSR=4326&size=3000,1200&format=jpg&f=pjson')
SOURCES = [
    {'name': '航空红外边界原档（Hatchett 整理自 NIFC）', 'url': 'https://zenodo.org/records/15492982'},
    {'name': 'CAL FIRE Dixie 事件档案', 'url': 'https://www.fire.ca.gov/incidents/2021/7/13/dixie-fire'},
    {'name': 'USGS The National Map 地形底图', 'url': TOPO},
    {'name': 'NWCG 火行为：天气、燃料、地形', 'url': 'https://training.nwcg.gov/dl/s290/s-290-student-workbook-all.pdf'},
]


def polygon_parts(geometry):
    if geometry.geom_type == 'Polygon':
        yield geometry
    elif geometry.geom_type in ('MultiPolygon', 'GeometryCollection'):
        for part in geometry.geoms:
            yield from polygon_parts(part)


def pixels(ring):
    west, south, east, north = BOUNDS
    return [((x-west)/(east-west)*(SIZE[0]-1), (north-y)/(north-south)*(SIZE[1]-1)) for x, y in ring.coords]


def fill_layer(image, geometry, color):
    mask = Image.new('L', SIZE)
    draw = ImageDraw.Draw(mask)
    for polygon in polygon_parts(geometry):
        draw.polygon(pixels(polygon.exterior), fill=color[3])
        for hole in polygon.interiors:
            draw.polygon(pixels(hole), fill=0)
    tint = Image.new('RGBA', SIZE, (*color[:3], 255))
    tint.putalpha(mask)
    image.alpha_composite(tint)


def outline(image, geometry, color, width):
    draw = ImageDraw.Draw(image)
    for polygon in polygon_parts(geometry):
        draw.line(pixels(polygon.exterior), fill=color, width=width)
        for hole in polygon.interiors:
            draw.line(pixels(hole), fill=color, width=width)


def build(archive, topo, registration):
    archive_bytes = archive.read_bytes()
    if hashlib.md5(archive_bytes).hexdigest() != ARCHIVE_MD5:
        raise ValueError('Source archive differs from the published Zenodo checksum.')
    info = json.loads(registration.read_text(encoding='utf-8-sig'))
    extent = info['extent']
    if extent['spatialReference']['wkid'] != 4326 or (info['width'], info['height']) != SIZE:
        raise ValueError('Unexpected USGS map registration.')
    if any(abs(extent[k]-v)>1e-7 for k,v in zip(('xmin','ymin','xmax','ymax'), BOUNDS)):
        raise ValueError('USGS map bbox differs from the fire replay bbox.')
    with Image.open(topo) as source:
        if source.size != SIZE:
            raise ValueError('USGS map image dimensions do not match its metadata.')
        base = ImageEnhance.Color(source.convert('RGB')).enhance(.68).convert('RGBA')
    area_projection = Transformer.from_crs(4326, 5070, always_xy=True).transform
    geographic = Transformer.from_crs(5070, 4326, always_xy=True).transform
    output = APP / 'assets/events/dixie-fire'
    output.mkdir(parents=True, exist_ok=True)
    frames = []
    previous = None
    with ZipFile(io.BytesIO(archive_bytes)) as source:
        for stamp in DATES:
            filename, = (name for name in source.namelist() if name.startswith(stamp) and name.endswith('.shp'))
            if 'GCS_WGS_1984' not in source.read(filename[:-3]+'prj').decode():
                raise ValueError(f'Unexpected source projection in {filename}')
            raw = source.read(filename)
            with shapefile.Reader(shp=io.BytesIO(raw)) as reader:
                projected = [make_valid(transform(area_projection, shape(item.__geo_interface__))) for item in reader.shapes()]
            current = unary_union([part for value in projected for part in polygon_parts(value)])
            if current.is_empty or current.area <= 0:
                raise ValueError(f'Empty perimeter in {filename}')
            added = current.difference(previous) if previous is not None else GeometryCollection()
            outside = previous.difference(current) if previous is not None else GeometryCollection()
            image = base.copy()
            fill_layer(image, transform(geographic, outside), (73, 125, 169, 150))
            fill_layer(image, transform(geographic, current), (150, 69, 46, 110))
            fill_layer(image, transform(geographic, added), (242, 85, 28, 193))
            if previous is not None:
                outline(image, transform(geographic, previous), '#7cbded', 2)
            outline(image, transform(geographic, current), '#7d321b', 5)
            outline(image, transform(geographic, current), '#ffcf75', 2)
            archive_date = date(int(stamp[:4]), int(stamp[4:6]), int(stamp[6:])).isoformat()
            file = output / (stamp + '.jpg')
            image.convert('RGB').save(file, quality=89, optimize=True)
            frames.append({
                'archiveDate': archive_date, 'timeUtc': archive_date+'T00:00:00Z',
                'url': file.relative_to(APP).as_posix(), 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(),
                'sourceFile': filename, 'sourceGeometrySha256': hashlib.sha256(raw).hexdigest(),
                'width': SIZE[0], 'height': SIZE[1],
                'mappedKm2': round(current.area/1e6, 2),
                'addedKm2': round(added.area/1e6, 2) if previous is not None else None,
                'outsideKm2': round(outside.area/1e6, 2) if previous is not None else None,
            })
            previous = current

    metrics = [
        ('mappedKm2', '当前制图边界内面积', '#ffce84', '将本期原档多边形合并后，以等面积投影计算。'),
        ('addedKm2', '比上一期多划入的面积', '#ff9a61', '当前边界范围减去上一可用记录范围。记录间隔有长有短。'),
    ]
    bundle = {
        'schemaVersion': 1, 'id': 'dixie-2021-airborne-ir', 'kind': 'wildfire',
        'title': '2021 Dixie 山火 · 航空红外边界',
        'description': '用九期原档比较火区的边界怎样从羽毛河峡谷一带向外扩展。',
        'subtitle': '美国加州北部 · 2021-07-27 至 2021-08-06 · 九期档案',
        'dateBasis': '原档文件名日期。内部 ISO 键用于排序，档案未提供可核实的具体测绘时刻。',
        'focus': {'lon': (FIRE_VIEW[0]+FIRE_VIEW[2])/2, 'lat': (FIRE_VIEW[1]+FIRE_VIEW[3])/2},
        'viewBounds': FIRE_VIEW,
        'bbox': BOUNDS, 'startUtc': frames[0]['timeUtc'], 'endUtc': frames[-1]['timeUtc'],
        'archive': {'md5': ARCHIVE_MD5, 'sha256': hashlib.sha256(archive_bytes).hexdigest()},
        'basemap': {'sha256': hashlib.sha256(topo.read_bytes()).hexdigest(), 'request': TOPO, 'extent': extent},
        'frames': frames, 'sources': SOURCES,
        'series': [{'id': key, 'label': label, 'unit': 'km²', 'color': color, 'method': method,
                    'samples': [{'timeUtc': frame['timeUtc'], 'value': frame[key]} for frame in frames]}
                   for key, label, color, method in metrics],
        'limitations': [
            '档案日期按原文件名显示。8 月 2 日和 3 日无对应边界，地图直接切到 8 月 4 日，差集覆盖整个间隔。',
            '边界范围包含内部未燃斑块及测绘修订。范围差集用于比较两期制图结果，逐点起火时刻、燃烧强度与致因需其他证据。',
            'USGS 地形底图供地名和地形定位，火区范围来自事件档案。',
        ],
    }
    target = APP / 'data/wildfire-dixie-dynamic.json'
    target.write_text(json.dumps(bundle, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    for frame in frames:
        print(frame['archiveDate'], frame['mappedKm2'], frame['addedKm2'], frame['outsideKm2'])


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('topo', type=Path)
    parser.add_argument('registration', type=Path)
    args = parser.parse_args()
    build(args.archive, args.topo, args.registration)
