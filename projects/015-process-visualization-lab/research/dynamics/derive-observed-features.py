"""Observed uint16 brightness temperature -> approximate geographic threshold outlines.

No temporal interpolation, cloud tracking, optical classification or height inference.
Only NumPy/Pillow are required; outlines follow boundaries of sampled 8-pixel grid cells.
"""
from collections import defaultdict, deque
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import math
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
STEP = 8
RADIUS_KM = 6371.0088

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def stamp(value):
    if not isinstance(value, str) or not value.endswith('Z'):
        raise ValueError('Explicit UTC is required')
    return datetime.fromisoformat(value.replace('Z', '+00:00'))

def distance(lon, lat, center):
    phi, phi0 = np.deg2rad(lat), math.radians(center['lat'])
    delta = np.deg2rad(lon - center['lon'])
    a = np.sin((phi - phi0) / 2) ** 2 + np.cos(phi) * math.cos(phi0) * np.sin(delta / 2) ** 2
    return 2 * RADIUS_KM * np.arcsin(np.sqrt(np.clip(a, 0, 1)))

def components(mask):
    labels = np.zeros(mask.shape, dtype=np.int32)
    label = 0
    for row, col in zip(*np.nonzero(mask)):
        if labels[row, col]:
            continue
        label += 1
        labels[row, col] = label
        queue = deque([(int(row), int(col))])
        while queue:
            r, c = queue.popleft()
            for nr, nc in ((r-1, c), (r+1, c), (r, c-1), (r, c+1)):
                if 0 <= nr < mask.shape[0] and 0 <= nc < mask.shape[1] and mask[nr, nc] and not labels[nr, nc]:
                    labels[nr, nc] = label
                    queue.append((nr, nc))
    return labels, label

def chains(edges):
    """Trace directed edges with cold cells to the right; do not connect across missing edges."""
    outgoing, incoming = defaultdict(list), defaultdict(int)
    for a, b in edges:
        outgoing[a].append(b)
        incoming[b] += 1
    remaining = set(edges)
    starts = sorted(edges, key=lambda edge: (incoming[edge[0]] != 0, edge))
    result = []
    direction = {(1, 0): 0, (0, 1): 1, (-1, 0): 2, (0, -1): 3}
    for first in starts:
        if first not in remaining:
            continue
        a, b = first
        path = [a, b]
        remaining.remove(first)
        while b != path[0]:
            candidates = [next_point for next_point in outgoing[b] if (b, next_point) in remaining]
            if not candidates:
                break
            d = direction[(b[0]-a[0], b[1]-a[1])]
            priority = [(d+1) % 4, d, (d+3) % 4, (d+2) % 4]
            next_point = min(candidates, key=lambda p: priority.index(direction[(p[0]-b[0], p[1]-b[1])]))
            remaining.remove((b, next_point))
            a, b = b, next_point
            path.append(b)
        if len(path) < 3:
            continue
        simplified = [path[0]]
        for index in range(1, len(path)-1):
            p, q, r = path[index-1], path[index], path[index+1]
            if (q[0]-p[0])*(r[1]-q[1]) != (q[1]-p[1])*(r[0]-q[0]):
                simplified.append(q)
        simplified.append(path[-1])
        if len(simplified) == 2:
            simplified.insert(1, path[len(path)//2])
        if len(simplified) >= 3:
            result.append(simplified)
    return result

def grid_definition(data):
    width, height = data['width'], data['height']
    west, south, east, north = data['bbox']
    dx, dy = (east-west)/width, (north-south)/height
    xe = np.append(np.arange(0, width, STEP), width)
    ye = np.append(np.arange(0, height, STEP), height)
    xi, yi = (xe[:-1]+xe[1:]-1)//2, (ye[:-1]+ye[1:]-1)//2
    lon, lat = np.meshgrid(west+(np.arange(width)+.5)*dx, north-(np.arange(height)+.5)*dy)
    area_rows = RADIUS_KM**2 * math.radians(dx) * (np.sin(np.deg2rad(north-np.arange(height)*dy))-np.sin(np.deg2rad(north-(np.arange(height)+1)*dy)))
    eligible = np.ones((len(yi), len(xi)), dtype=bool)
    region = data.get('statisticsRegion')
    if region:
        # Keep whole display cells within the existing analysis circle; do not draw an invented edge outside it.
        for xside, yside in ((xe[:-1], ye[:-1]), (xe[1:], ye[:-1]), (xe[:-1], ye[1:]), (xe[1:], ye[1:])):
            xlon, ylat = np.meshgrid(west+xside*dx, north-yside*dy)
            eligible &= distance(xlon, ylat, region['center']) <= region['radiusKm']
    latitude_nearest_equator = min(abs(south), abs(north)) if south*north > 0 else 0
    cell_width = RADIUS_KM*math.radians(STEP*dx)*math.cos(math.radians(latitude_nearest_equator))
    cell_height = RADIUS_KM*math.radians(STEP*dy)
    return {'xe': xe, 'ye': ye, 'xi': xi, 'yi': yi, 'lon': lon, 'lat': lat, 'areaRows': area_rows, 'eligible': eligible,
            'dx': dx, 'dy': dy, 'maxCellWidthKm': cell_width, 'maxCellHeightKm': cell_height, 'maxCellDiagonalKm': math.hypot(cell_width, cell_height)}

def geometry(mask, eligible, labels, count, grid, data, time_utc):
    edges_by_component = defaultdict(list)
    omitted = 0
    height, width = mask.shape
    for row, col in zip(*np.nonzero(mask)):
        row, col = int(row), int(col)
        sides = [((row-1, col), ((col, row), (col+1, row))),
                 ((row, col+1), ((col+1, row), (col+1, row+1))),
                 ((row+1, col), ((col+1, row+1), (col, row+1))),
                 ((row, col-1), ((col, row+1), (col, row)))]
        for (nr, nc), edge in sides:
            if not (0 <= nr < height and 0 <= nc < width) or not eligible[nr, nc]:
                omitted += 1
                continue  # No line along analysis-circle, nodata or image-window borders.
            if not mask[nr, nc]:
                edges_by_component[int(labels[row, col])].append(edge)
    west, south, east, north = data['bbox']
    lines = []
    for component in range(1, count+1):
        for index, path in enumerate(chains(edges_by_component[component])):
            coordinates = [[round(west+int(grid['xe'][x])*grid['dx'], 5), round(north-int(grid['ye'][y])*grid['dy'], 5)] for x, y in path]
            lines.append({'id': data['kind']+'-'+time_utc.replace(':', '').replace('-', '')+'-c'+str(component)+'-l'+str(index),
                          'coordinates': coordinates, 'closed': path[0] == path[-1], 'meaning': 'approximate-threshold-grid-boundary-not-cloud-tracking'})
    return lines, omitted

def anchor_point(full_mask, labels, grid, data, values):
    counts = np.bincount(labels.ravel())
    if len(counts) <= 1:
        return None
    # Rank coarse components by spherical cell area, then choose an ACTUAL cold source pixel.
    row_areas = np.array([grid['areaRows'][a:b].sum() for a, b in zip(grid['ye'][:-1], grid['ye'][1:])])
    coarse_areas = row_areas[:, None] * np.diff(grid['xe'])[None, :]
    component_areas = np.bincount(labels.ravel(), weights=coarse_areas.ravel())
    component_areas[0] = 0
    largest = int(component_areas.argmax())
    expanded_labels = labels[np.arange(values.shape[0])[:, None]//STEP, np.arange(values.shape[1])[None, :]//STEP]
    selected = full_mask & (expanded_labels == largest)
    rows, cols = np.nonzero(selected)
    if not len(rows):
        return None
    weights = grid['areaRows'][rows]
    lon, lat = grid['lon'][rows, cols], grid['lat'][rows, cols]
    phi, lam = np.deg2rad(lat), np.deg2rad(lon)
    xyz = np.column_stack((np.cos(phi)*np.cos(lam), np.cos(phi)*np.sin(lam), np.sin(phi)))
    center = (xyz * weights[:, None]).sum(axis=0)
    center /= np.linalg.norm(center)
    index = int(np.argmax(xyz @ center))
    row, col = int(rows[index]), int(cols[index])
    return {'lon': round(float(grid['lon'][row, col]), 6), 'lat': round(float(grid['lat'][row, col]), 6),
            'temperatureK': float(values[row, col])*.01, 'pixel': {'row': row, 'column': col},
            'method': 'actual-cold-pixel-near-largest-grid-component-area-centroid',
            'meaning': '仅为当前帧阈值区域的可见标注位置，不是火山灰中心、台风中心或跨帧跟踪对象。'}

def derive(kind):
    manifest_path = ROOT/'app/data'/f'{kind}-dynamic.json'
    data = json.loads(manifest_path.read_text(encoding='utf-8'))
    grid = grid_definition(data)
    threshold, operator = (22000, '<') if kind == 'volcano' else (23500, '<=')
    ids = ['coldAreaKm2', 'p10K'] if kind == 'volcano' else ['below235KAreaKm2', 'p10K']
    series = {item['id']: item for item in data['series']}
    missing_times = data.get('missingTimesUtc', [item['timeUtc'] for item in data.get('missingOriginalScans', [])])
    previous = None
    features = []
    for frame in data['frames']:
        now = stamp(frame['timeUtc'])
        if previous and now <= stamp(previous['timeUtc']):
            raise ValueError('Frames must be strictly ordered')
        numeric = frame['numericData']
        relative = numeric.get('url') or numeric['researchFile']
        path = ROOT/relative
        if sha(path) != numeric['sha256']:
            raise ValueError('Numeric SHA256 mismatch: '+relative)
        if numeric['scale'] != .01 or numeric['nodata'] != 0 or numeric['unit'] != 'K':
            raise ValueError('Unsupported numeric encoding')
        values = np.asarray(Image.open(path))
        if values.shape != (data['height'], data['width']) or not np.issubdtype(values.dtype, np.integer):
            raise ValueError('Numeric raster dimensions or type mismatch')
        valid = values != 0
        full_mask = valid & ((values < threshold) if operator == '<' else (values <= threshold))
        if data.get('statisticsRegion'):
            full_mask &= distance(grid['lon'], grid['lat'], data['statisticsRegion']['center']) <= data['statisticsRegion']['radiusKm']
        coarse_valid = np.zeros(grid['eligible'].shape, dtype=bool)
        for row, (top, bottom) in enumerate(zip(grid['ye'][:-1], grid['ye'][1:])):
            for col, (left, right) in enumerate(zip(grid['xe'][:-1], grid['xe'][1:])):
                coarse_valid[row, col] = bool(valid[top:bottom, left:right].all())
        eligible = grid['eligible'] & coarse_valid
        mask = full_mask[np.ix_(grid['yi'], grid['xi'])] & eligible
        labels, count = components(mask)
        lines, omitted = geometry(mask, eligible, labels, count, grid, data, frame['timeUtc'])
        metric_values = []
        for id in ids:
            sample = next((item for item in series[id]['samples'] if stamp(item['timeUtc']) == now), None)
            if not sample or not isinstance(sample['value'], (int, float)) or not math.isfinite(sample['value']):
                raise ValueError('No exact original series value at '+frame['timeUtc'])
            if sample['value'] != frame['stats'][id]:
                raise ValueError('Source series does not equal source frame statistics')
            metric_values.append({'id': id, 'label': series[id]['label'], 'unit': series[id]['unit'], 'value': sample['value']})
        delta = None
        if previous:
            crossed = [value for value in missing_times if stamp(previous['timeUtc']) < stamp(value) < now]
            delta = {'fromTimeUtc': previous['timeUtc'], 'intervalSeconds': (now-stamp(previous['timeUtc'])).total_seconds(),
                     'values': [{'id': item['id'], 'label': item['label'], 'unit': item['unit'], 'a': previous['metricValues'][i]['value'], 'b': item['value'], 'delta': item['value']-previous['metricValues'][i]['value']} for i, item in enumerate(metric_values)],
                     'spansKnownMissing': bool(crossed), 'missingTimesUtc': crossed,
                     'meaning': '仅相邻已提供记录的B减A，不是变化率、风速或中间过程重建。'}
        feature = {'timeUtc': frame['timeUtc'], 'scanStartUtc': frame['scanStartUtc'], 'scanEndUtc': frame['scanEndUtc'],
                   'lines': lines, 'anchor': anchor_point(full_mask, labels, grid, data, values), 'deltaMetrics': delta, 'metricValues': metric_values,
                   'sourceNumeric': {'path': relative, 'sha256': numeric['sha256'], 'width': data['width'], 'height': data['height'], 'scale': .01, 'unit': 'K', 'nodata': 0},
                   'counts': {'fullThresholdPixelsInRegion': int(full_mask.sum()), 'sampledColdCells': int(mask.sum()), 'sampledComponents': count, 'omittedBoundaryEdgesAtCoverageLimit': omitted,
                              'pixelsExactlyAtThresholdK': int(((values == threshold) & valid).sum())},
                   'notes': ['轮廓为当前真实亮温阈值的简化网格边界，不是识别出的火山灰或台风云体边界。',
                             '边缘接触统计范围、图像边界或缺测处时不补闭合线；细小区域可能因8像元取样被省略。',
                             '标注位置只描述当前帧，不跟踪云团；不能把相邻位置差理解为风向或速度。']}
        if delta and delta['spansKnownMissing']:
            feature['notes'].append('两端之间存在官方缺档，差值仍只比较实际两端；中间发生的过程未知。')
        features.append(feature)
        previous = feature
    return {'eventId': data['id'], 'kind': kind, 'bbox': data['bbox'], 'projection': 'EPSG:4326',
            'longitudeConvention': 'unwrapped east longitude; values greater than180 are equivalent west longitudes' if kind == 'volcano' else 'east longitude',
            'threshold': {'operator': operator, 'kelvin': threshold*.01, 'meaning': 'brightness-temperature display selection; not a cloud or ash mask'},
            'statisticsRegion': data.get('statisticsRegion', {'bbox': data['bbox']}), 'missingTimesUtc': missing_times,
            'grid': {'sourceWidth': data['width'], 'sourceHeight': data['height'], 'stepSourcePixels': STEP, 'sampleColumnIndices': grid['xi'].tolist(), 'sampleRowIndices': grid['yi'].tolist(),
                     'maximumCellWidthKm': grid['maxCellWidthKm'], 'maximumCellHeightKm': grid['maxCellHeightKm'], 'maximumCellDiagonalKm': grid['maxCellDiagonalKm'],
                     'resampling': 'one original centre-near pixel per8x8 block; no mean or interpolation',
                     'simplification': 'remove collinear boundary vertices only',
                     'errorMeaning': '格网分辨率量级，不是实地定位精度或全轮廓误差上界；细小/狭长阈值区可能漏绘，源云视差未校正。',
                     'regionalClipping': 'only full cells inside volcano300km circle; analysis/image/nodata border edges omitted'},
            'numericPrecision': {'quantizationK': .01, 'maximumRoundingErrorK': .005, 'note': 'storm原series由浮点亮温计算；数值PNG在235K附近的量化可能改变阈值归属。轮廓按留存PNG，指标差按原series，二者不得混称同一精确面积。'},
            'sourceManifest': {'path': 'app/data/'+kind+'-dynamic.json', 'sha256': sha(manifest_path)}, 'frames': features}

def verify(document):
    """Re-read numeric files and independently check hashes, anchors, coordinates, time and delta inputs."""
    frame_count = line_count = point_count = 0
    for kind, event in document['events'].items():
        source = json.loads((ROOT/event['sourceManifest']['path']).read_text(encoding='utf-8'))
        assert sha(ROOT/event['sourceManifest']['path']) == event['sourceManifest']['sha256']
        assert [frame['timeUtc'] for frame in event['frames']] == [frame['timeUtc'] for frame in source['frames']]
        west, south, east, north = event['bbox']
        for index, feature in enumerate(event['frames']):
            frame_count += 1
            numeric = feature['sourceNumeric']; path = ROOT/numeric['path']
            assert sha(path) == numeric['sha256']
            pixels = np.asarray(Image.open(path))
            anchor = feature['anchor']
            if anchor:
                row, col = anchor['pixel']['row'], anchor['pixel']['column']
                value = int(pixels[row, col])
                assert value > 0 and (value < 22000 if kind == 'volcano' else value <= 23500)
                assert abs(anchor['lon']-(west+(col+.5)*(east-west)/numeric['width'])) < .000001
                assert abs(anchor['lat']-(north-(row+.5)*(north-south)/numeric['height'])) < .000001
                if kind == 'volcano': assert float(distance(anchor['lon'], anchor['lat'], event['statisticsRegion']['center'])) <= 300.001
            if feature['counts']['fullThresholdPixelsInRegion'] == 0: assert anchor is None and not feature['lines']
            for line in feature['lines']:
                line_count += 1; point_count += len(line['coordinates'])
                assert len(line['coordinates']) >= 3
                for lon, lat in line['coordinates']:
                    assert west-.00001 <= lon <= east+.00001 and south-.00001 <= lat <= north+.00001
                    if kind == 'volcano': assert float(distance(lon, lat, event['statisticsRegion']['center'])) <= 300.002
            if index == 0: assert feature['deltaMetrics'] is None
            else:
                delta = feature['deltaMetrics']; before = event['frames'][index-1]
                assert delta['fromTimeUtc'] == before['timeUtc']
                assert delta['intervalSeconds'] == (stamp(feature['timeUtc'])-stamp(before['timeUtc'])).total_seconds()
                for metric in delta['values']:
                    series = next(item for item in source['series'] if item['id'] == metric['id'])
                    a = next(item['value'] for item in series['samples'] if item['timeUtc'] == before['timeUtc'])
                    b = next(item['value'] for item in series['samples'] if item['timeUtc'] == feature['timeUtc'])
                    assert metric['a'] == a and metric['b'] == b and metric['delta'] == b-a
    return {'passed': True, 'frames': frame_count, 'numericHashesChecked': frame_count, 'lines': line_count, 'points': point_count,
            'checks': ['independent file re-read SHA256/dimensions', 'exact source frame times and scan bounds', 'anchor is an actual qualifying numeric pixel inside the declared region',
                       'line vertex bounds,300km clipping and minimum3 vertices', 'deltas exactly equal adjacent original series values; source gaps explicitly retained'],
            'limitation': '轮廓是格网近似，不保证保留全部细小阈值区域；无灰云分类、云高反演、跨帧目标匹配或云移速。'}

def main():
    document = {'schemaVersion': 1, 'derivedAtUtc': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
                'method': 'current-frame threshold-grid outlines and actual numeric anchors; no temporal interpolation or feature tracking',
                'events': {kind: derive(kind) for kind in ('volcano', 'storm')}}
    report = verify(document)
    encoded = json.dumps(document, ensure_ascii=False, separators=(',', ':'))+'\n'
    if len(encoded.encode('utf-8')) >= 2_000_000:
        raise ValueError('Feature bundle must remain below2MB; review resolution before changing it')
    output = ROOT/'app/data/observed-change-features.json'
    output.write_text(encoded, encoding='utf-8')
    report.update({'bytes': output.stat().st_size, 'sha256': sha(output), 'processorSHA256': sha(Path(__file__)), 'events': {kind: {'frames': len(event['frames']), 'gridMaximumCellDiagonalKm': event['grid']['maximumCellDiagonalKm']} for kind, event in document['events'].items()}})
    (ROOT/'research/dynamics/observed-features-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
