"""Build registered Dixie overlays and Tonga survey panels from original archives.

Requires numpy, Pillow, pyshp, pyproj and shapely. Input URLs and rebuild
instructions are in research/dynamics/dixie-fire/README.md.
"""

import argparse
import base64
import csv
import hashlib
import io
import json
import runpy
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZipFile

import numpy as np
import shapefile
from PIL import Image, ImageDraw
from pyproj import Transformer
from shapely import contains_xy, make_valid
from shapely.geometry import GeometryCollection, LineString, Polygon, shape
from shapely.ops import nearest_points, transform, unary_union


REPLAY = runpy.run_path(str(Path(__file__).with_name('build-dixie-replay.py')))
APP, BOUNDS, SIZE = (REPLAY[k] for k in ('APP', 'BOUNDS', 'SIZE'))
STATIONS = (
    ('HMRC1', 'Humbug Summit', 40.1094, -121.3828, '#7ff5ed'),
    ('BOGC1', 'Bogard', 40.59, -121.08, '#a1d2ff'),
    ('HDVC1', 'Hidden Valley', 40.442, -120.623, '#c6f6ad'),
)
FUEL_LABELS = {
    11: '水域', 2027: '偏干混合针叶林', 2028: '较湿润混合针叶林',
    2031: '山地杰弗里松林', 2032: '加州红冷杉林', 2080: '大蒿灌丛',
    2098: '山地疏林与灌丛', 2270: '扰动地草地与灌丛',
}


def ramp(values, stops, colors):
    return np.stack([np.interp(values, stops, channel) for channel in np.array(colors).T], axis=-1)


def shaded(values, dx, dy, exaggeration=1):
    north, east = np.gradient(values)
    north, east = north / dy, -east / dx
    norm = np.sqrt(1 + (north**2 + east**2) * exaggeration**2)
    return np.clip(.67 + .44 * (.73 + .48 * (east + north) * exaggeration) / norm, .56, 1.27)


def as_image(colors, light):
    return Image.fromarray(np.uint8(np.clip(colors * light[..., None], 0, 255)))


def ground_grid(path):
    with Image.open(path) as image:
        tie = image.tag_v2[33922]
        scale = image.tag_v2[33550]
        if image.size != (1500, 600) or not np.allclose(tie[3:5], [BOUNDS[0], BOUNDS[3]]) or not np.allclose(scale[:2], .002):
            raise ValueError(f'Misaligned terrain raster {path}')
        return np.array(image)


def read_wind(path):
    records = {key: [] for key, *_ in STATIONS}
    with path.open(newline='', encoding='utf-8-sig') as source:
        for row in csv.DictReader(source):
            if row['station'] not in records or not row['USIRGZ'] or not row['UDIRGZ']:
                continue
            speed, direction = float(row['USIRGZ']), float(row['UDIRGZ'])
            if speed >= 0 and 0 <= direction <= 360:
                stamp = datetime.fromisoformat(row['utc_valid']).replace(tzinfo=timezone.utc)
                records[row['station']].append([stamp.strftime('%Y-%m-%dT%H:%M:%SZ'), speed, direction])
    if any(not values for values in records.values()):
        raise ValueError('Missing station series')
    return [dict(id=key, label=name, lat=lat, lon=lon, color=color, samples=sorted(records[key]))
            for key, name, lat, lon, color in STATIONS]


def wildfire(args):
    dem, fuel = ground_grid(args.dem), ground_grid(args.fuel)
    with shapefile.Reader(dbf=str(args.fuel_table), encoding='latin1') as table:
        names = {row['Value']: row['EVT_FUEL_N'] for row in table.records()}
    def category_label(code):
        return dict(code=code, label=FUEL_LABELS.get(code, names[code]), officialName=names[code])
    rows, cols = np.indices(dem.shape)
    x = BOUNDS[0] + (cols+.5)*.002
    y = BOUNDS[3] - (rows+.5)*.002
    dx = 222.64*np.cos(np.deg2rad(y))
    dy = 222.26
    slope_y, slope_x = np.gradient(dem)
    slope = np.degrees(np.arctan(np.hypot(slope_x/dx, slope_y/dy)))
    light = shaded(dem, dx, dy, 2.3)
    relief_colors = ramp(dem, [0, 500, 1100, 1700, 2300, 3100],
                         [(17, 47, 50), (47, 83, 70), (86, 110, 83), (123, 130, 98), (163, 149, 117), (223, 211, 186)])
    # Distinguish mapped categories by hue. Codes are identifiers, not an ordered risk scale.
    codes = np.unique(fuel)
    focus = (x >= -121.65) & (x <= -120.48) & (y >= 39.76) & (y <= 40.64)
    local_codes, local_counts = np.unique(fuel[focus], return_counts=True)
    featured = [int(code) for code in local_codes[np.argsort(-local_counts)] if code >= 2000][:6]
    palette = ['#78a774', '#4e9c9e', '#b5a468', '#8586c3', '#b17f76', '#8eacbc']
    colors = dict(zip(featured, palette))
    colors[11] = '#376c8d'
    other = '#51605c'
    rgb = lambda color: [int(color[i:i+2], 16) for i in (1, 3, 5)]
    lut = np.tile(rgb(other), (max(codes)+1, 1))
    for code, color in colors.items():
        lut[code] = rgb(color)
    bases = {
        'terrain': as_image(relief_colors, light).resize(SIZE, Image.Resampling.BILINEAR).convert('RGBA'),
        'fuel': as_image(lut[fuel], .76+.24*light).resize(SIZE, Image.Resampling.NEAREST).convert('RGBA'),
    }
    to_area = Transformer.from_crs(4326, 5070, always_xy=True).transform
    to_geo = Transformer.from_crs(5070, 4326, always_xy=True).transform
    event = json.loads((APP / 'data/wildfire-dixie-dynamic.json').read_text(encoding='utf-8'))
    previous = None
    frames = {}
    archive = args.archive.read_bytes()
    if hashlib.md5(archive).hexdigest() != REPLAY['ARCHIVE_MD5']:
        raise ValueError('Wrong Dixie archive checksum')
    with ZipFile(io.BytesIO(archive)) as source:
        for frame in event['frames']:
            raw = source.read(frame['sourceFile'])
            if hashlib.sha256(raw).hexdigest() != frame['sourceGeometrySha256']:
                raise ValueError(f"Wrong perimeter {frame['sourceFile']}")
            with shapefile.Reader(shp=io.BytesIO(raw)) as reader:
                polygons = [make_valid(transform(to_area, shape(item.__geo_interface__))) for item in reader.shapes()]
            current = unary_union([part for value in polygons for part in REPLAY['polygon_parts'](value)])
            added = current.difference(previous) if previous is not None else GeometryCollection()
            outside = previous.difference(current) if previous is not None else GeometryCollection()
            result = {'layers': {}, 'sectors': []}
            for mode, base in bases.items():
                image = base.copy()
                fill, edge = REPLAY['fill_layer'], REPLAY['outline']
                fill(image, transform(to_geo, outside), (67, 132, 191, 150))
                fill(image, transform(to_geo, current), (174, 86, 40, 44))
                fill(image, transform(to_geo, added), (248, 91, 31, 122))
                if previous is not None:
                    edge(image, transform(to_geo, previous), '#6ba9dc', 2)
                edge(image, transform(to_geo, current), '#402516', 4)
                edge(image, transform(to_geo, current), '#ffce76', 2)
                file = APP / frame['url'].replace('.jpg', f'-{mode}.jpg')
                image.convert('RGB').save(file, quality=89, optimize=True)
                result['layers'][mode] = file.relative_to(APP).as_posix()
            if frame['archiveDate'] == '2021-08-06':
                geographic = make_valid(transform(to_geo, previous))
                center = transform(to_geo, previous.centroid)
                lon, lat = center.coords[0]
                added_geo = make_valid(transform(to_geo, added))
                result['sectorCenter'] = [lon, lat]
                for name, bearing in [('北侧', 0), ('东侧', 90), ('南侧', 180), ('西侧', 270)]:
                    angles = np.deg2rad([bearing-45, bearing+45])
                    rays = [(lon+3*np.sin(a)/np.cos(np.deg2rad(lat)), lat+3*np.cos(a)) for a in angles]
                    sector = added_geo.intersection(Polygon([(lon, lat), *rays]))
                    part = max(REPLAY['polygon_parts'](sector), key=lambda p: transform(to_area, p).area, default=None)
                    arrow = {}
                    if part is not None and transform(to_area, part).area >= 1e6:
                        point = part.representative_point()
                        ray = LineString([center, point])
                        crossing = ray.intersection(geographic.boundary)
                        anchor, _ = nearest_points(crossing if not crossing.is_empty else geographic.boundary, point)
                        arrow = dict(start=list(anchor.coords[0]), end=list(point.coords[0]))
                    mask = contains_xy(sector, x, y)
                    categories, pixels = np.unique(fuel[mask], return_counts=True)
                    dominant = np.argsort(-pixels)[:3]
                    result['sectors'].append(dict(
                        name=name, **arrow,
                        areaKm2=round(transform(to_area, sector).area/1e6, 1),
                        medianSlope=round(float(np.median(slope[mask])), 1) if mask.any() else None,
                        fuel=[dict(**category_label(int(categories[i])), pct=round(100*float(pixels[i])/int(mask.sum())))
                              for i in dominant]))
            frames[frame['archiveDate']] = result
            previous = current
    result = dict(
        stations=read_wind(args.wind), frames=frames,
        fuelKey=[dict(**category_label(code), color=color) for code, color in colors.items()], fuelOther=other,
        inputSha256={key: hashlib.sha256(getattr(args, key).read_bytes()).hexdigest() for key in ('wind', 'dem', 'fuel', 'fuel_table')},
    )
    (APP / 'data/dixie-context.json').write_text(json.dumps(result, ensure_ascii=False, allow_nan=False, separators=(',', ':'))+'\n', encoding='utf-8')


def bathymetry(args):
    output = APP / 'assets/events/hunga-terrain'
    output.mkdir(parents=True, exist_ok=True)
    # Common UTM Zone 1S map extent, 22 × 16 km. Raster origins differ.
    west, east, south, north = 657450, 679450, 7718500, 7734500
    x = np.arange(west+25, east, 50)
    y = np.arange(north-25, south, -50)
    transect = int(np.argmin(abs(y-7726466)))
    profiles = {}
    to_geo = Transformer.from_crs(32701, 4326, always_xy=True)
    center_x, center_y = (west+east)/2, (south+north)/2
    terrain = dict(
        grid=dict(cols=len(x), rows=len(y), stepM=50, transect=transect, crs='EPSG:32701', bounds=[west,south,east,north]),
        anchor=to_geo.transform(center_x, center_y), east=to_geo.transform(center_x+1000, center_y),
        samples=[dict(id=key, col=int(np.argmin(abs(x-point)))) for key, point in
                 [('west', 663475), ('crater', 668475), ('east', 673475)]],
        surveys={},
    )
    for key, checksum in [('pre', '74e40db60cbe1bfefc147221896ecdd3'), ('post', 'bea1413433d77e6360775a29a05fc955')]:
        path = getattr(args, key)
        if hashlib.md5(path.read_bytes()).hexdigest() != checksum:
            raise ValueError(f'Incorrect NIWA survey checksum for {key}')
        with Image.open(path) as image:
            ox, oy = image.tag_v2[33922][3:5]
            if image.tag_v2[33550][:2] != (50., 50.):
                raise ValueError('Unexpected bathymetry grid size')
            values = np.array(image)[np.floor((oy-y)/50).astype(int)[:, None], np.floor((x-ox)/50).astype(int)]
        valid = values > -9000
        binary = np.full(values.shape, -32768, dtype='<i2')
        decimeters = np.rint(values[valid]*10)
        if np.any(abs(decimeters) > 32767):
            raise ValueError('Elevation is outside the signed decimeter range')
        binary[valid] = decimeters
        raw = binary.tobytes()
        tile = output / f'{key}-elevation.json'
        tile.write_text(json.dumps(base64.b64encode(raw).decode('ascii'))+'\n', encoding='utf-8')
        terrain['surveys'][key] = dict(url=tile.relative_to(APP).as_posix(), sourceMd5=checksum,
                                       sha256=hashlib.sha256(raw).hexdigest())
        profiles[key] = values[transect]
        filled = np.where(valid, values, -1700)
        light = shaded(filled, 50, 50, 1.7)
        colors = ramp(filled, [-1700, -1000, -600, -300, -100, 0, 150],
                      [(8, 32, 65), (20, 66, 110), (36, 114, 145), (60, 161, 174), (128, 207, 194), (201, 226, 175), (219, 182, 121)])
        colors[~valid] = (18, 29, 39)
        light[~valid] = 1
        img = as_image(colors, light).resize((880, 640), Image.Resampling.BILINEAR)
        draw = ImageDraw.Draw(img)
        cut = 2*transect+1
        for col in range(34, 846, 14):
            draw.line((col, cut, col+7, cut), fill='#f8ebca', width=2)
        draw.text((12, cut-5), 'A', fill='#f8ebca')
        draw.text((853, cut-5), "A'", fill='#f8ebca')
        draw.line((36, 594, 236, 594), fill='#f5fbff', width=4)
        draw.text((36, 604), '5 km', fill='#f5fbff')
        draw.line((830, 65, 830, 33), fill='#f5fbff', width=3)
        draw.polygon([(830, 24), (823, 37), (837, 37)], fill='#f5fbff')
        draw.text((826, 69), 'N', fill='#f5fbff')
        img.save(output / f'{key}.webp', quality=93)
    lines = []
    height = lambda z: 18+(100-z)/1600*98
    for z in (0, -500, -1000, -1500):
        py = height(z)
        lines.append(f'<path d="M55 {py:.1f}H782" stroke="#405866" stroke-width=".75"/><text x="49" y="{py+4:.1f}" text-anchor="end">{z:,}</text>')
    for key, color in [('pre', '#7ce6db'), ('post', '#ffd68b')]:
        path = []
        prior = False
        for index, z in enumerate(profiles[key]):
            if z < -9000:
                prior = False
                continue
            px = 55 + (index+.5)/len(x)*727
            path.append(f'{"L" if prior else "M"}{px:.1f} {height(z):.1f}')
            prior = True
        lines.append(f'<path d="{" ".join(path)}" fill="none" stroke="{color}" stroke-width="2"/>')
    lines.append('<text x="55" y="137">A · 0 km</text><text x="782" y="137" text-anchor="end">A′ · 22 km</text><text x="18" y="12">m</text>')
    chart = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 145" font-family="sans-serif" font-size="12" fill="#bbccd9" aria-label="NIWA pre and post eruption elevation transects">' + ''.join(lines) + '</svg>'
    (output / 'transect.svg').write_text(chart, encoding='utf-8')
    (APP / 'data/hunga-terrain.json').write_text(json.dumps(terrain, indent=2)+'\n', encoding='utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='event', required=True)
    fire = commands.add_parser('dixie')
    for name in ('archive', 'dem', 'fuel', 'wind', 'fuel_table'):
        fire.add_argument(name, type=Path)
    hunga = commands.add_parser('hunga')
    hunga.add_argument('pre', type=Path)
    hunga.add_argument('post', type=Path)
    args = parser.parse_args()
    (wildfire if args.event == 'dixie' else bathymetry)(args)
