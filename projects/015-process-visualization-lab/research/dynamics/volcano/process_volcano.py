"""Calibrate real segmented Himawari-8 B13 scans; never interpolate time or infer ash/height."""
from __future__ import annotations
import argparse
import bz2
import hashlib
import json
import struct
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[2]
sys.path.insert(0, str(PROJECT / 'research/high-frequency-clouds'))
from process_himawari import geo_to_native, native_to_geo, iso_mjd

BBOX = [174.0, -29.0, 193.0, -12.0]
WIDTH, HEIGHT = 1024, 916
FOCUS = {'lat': -20.5532, 'lon': -175.3841}
RADIUS_KM, COLD_K, EARTH_KM = 300.0, 220.0, 6371.0088
SOURCE = 'https://noaa-himawari8.s3.amazonaws.com/'
GUIDE = 'https://www.data.jma.go.jp/mscweb/en/himawari89/space_segment/hsd_sample/HS_D_users_guide_en_v13.pdf'
OUTPUT = PROJECT / 'app/assets/events/volcano-dynamic'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load_segment(path):
    raw = bz2.decompress(path.read_bytes())
    if raw[5] != 0 or raw[78] != 0:
        raise ValueError('Unsupported byte order or nonzero operational quality flag 1')
    blocks, offset = {}, 0
    for number in range(1, 12):
        if raw[offset] != number:
            raise ValueError('Unexpected HSD block order')
        length = struct.unpack_from('<I' if number == 10 else '<H', raw, offset + 1)[0]
        blocks[number] = raw[offset:offset + length]
        offset += length
    start, end, created, header_size, data_size = struct.unpack_from('<3d2I', blocks[1], 46)
    bits, columns, lines, compression = struct.unpack_from('<HHHB', blocks[2], 3)
    if header_size != offset or len(raw) != header_size + data_size or bits != 16 or compression != 0:
        raise ValueError('Unexpected HSD data/header lengths or compression')
    lon0, cfac, lfac, coff, loff, rs, req, rpol = struct.unpack_from('<dIIff3d', blocks[3], 3)
    band, wavelength, valid_bits, error_value, outside_value, *cal = struct.unpack_from('<HdHHH11d', blocks[5], 3)
    total, segment, first_line = struct.unpack_from('<BBH', blocks[7], 3)
    if band != 13 or total != 10 or segment not in (7, 8) or first_line != (segment - 1) * 550 + 1 or lines != 550:
        raise ValueError('Expected B13 segments 7/8 of ten with global first-line numbering')
    _, _, rotation, ncorrections = struct.unpack_from('<ffdH', blocks[8], 3)
    corrections = [struct.unpack_from('<Hff', blocks[8], 21 + i * 10) for i in range(ncorrections)]
    if rotation != 0 or any(x != 0 or y != 0 for _, x, y in corrections):
        raise ValueError('Nonzero navigation correction needs explicit processing')
    ntime = struct.unpack_from('<H', blocks[9], 3)[0]
    line_times = [struct.unpack_from('<Hd', blocks[9], 5 + i * 10) for i in range(ntime)]
    error_lines = struct.unpack_from('<H', blocks[10], 5)[0]
    if error_lines:
        raise ValueError('Reported error lines require explicit handling')
    projection = {'subLongitude': lon0, 'CFAC': cfac, 'LFAC': lfac, 'COFF': coff, 'LOFF': loff,
                  'satelliteDistanceFromEarthCenterKm': rs, 'equatorialRadiusKm': req, 'polarRadiusKm': rpol}
    calibration = {'band': band, 'wavelengthMicrometers': wavelength, 'validBits': valid_bits,
                   'invalidCountValues': [error_value, outside_value], 'gain': cal[0], 'offset': cal[1],
                   'c0': cal[2], 'c1': cal[3], 'c2': cal[4], 'speedOfLight': cal[8], 'planckConstant': cal[9], 'boltzmannConstant': cal[10]}
    metadata = {'satellite': blocks[1][6:22].decode('ascii').strip('\x00 '), 'formatVersion': blocks[1][82:114].decode('ascii').strip('\x00 '),
                'segment': segment, 'segmentsInFullDisk': total, 'firstGlobalLine1Based': first_line, 'columns': columns, 'lines': lines,
                'scanStartUtc': iso_mjd(start), 'scanEndUtc': iso_mjd(end), 'createdAtUtc': iso_mjd(created),
                'qualityFlags': list(blocks[1][78:82]), 'qualityInterpretation': 'flag1 must be zero; flag2 spare; flags3/4 processing-center use only per JMA HSD guide',
                'navigationCorrection': {'rotation': rotation, 'records': corrections}, 'errorLineCount': error_lines,
                'projection': projection, 'calibration': calibration,
                'lineTimes': [{'line': line, 'timeUtc': iso_mjd(time)} for line, time in line_times]}
    counts = np.frombuffer(raw, dtype='<u2', count=columns * lines, offset=header_size).reshape(lines, columns)
    return counts, metadata, line_times

def calibrate(dn, c):
    radiance = c['gain'] * dn + c['offset']
    valid = (~np.isin(dn, c['invalidCountValues'])) & (dn < 2 ** c['validBits']) & (radiance > 0)
    wavelength = c['wavelengthMicrometers'] * 1e-6
    with np.errstate(divide='ignore', invalid='ignore'):
        effective = (c['planckConstant'] * c['speedOfLight'] / (c['boltzmannConstant'] * wavelength)) / np.log1p(
            2 * c['planckConstant'] * c['speedOfLight'] ** 2 / (wavelength ** 5 * radiance * 1e6))
    temperature = c['c0'] + c['c1'] * effective + c['c2'] * effective ** 2
    valid &= np.isfinite(temperature) & (temperature > 0) & (temperature < 655.35)
    return temperature, valid

def grid():
    west, south, east, north = BBOX
    dx, dy = (east - west) / WIDTH, (north - south) / HEIGHT
    longitude = west + (np.arange(WIDTH) + .5) * dx
    latitude = north - (np.arange(HEIGHT) + .5) * dy
    lon, lat = np.meshgrid(longitude, latitude)
    dphi = np.deg2rad(lat - FOCUS['lat'])
    dlam = np.deg2rad(lon - FOCUS['lon'])
    haversine = np.sin(dphi / 2) ** 2 + np.cos(np.deg2rad(lat)) * np.cos(np.deg2rad(FOCUS['lat'])) * np.sin(dlam / 2) ** 2
    distance = 2 * EARTH_KM * np.arcsin(np.sqrt(np.clip(haversine, 0, 1)))
    area_rows = EARTH_KM ** 2 * np.deg2rad(dx) * (np.sin(np.deg2rad(latitude + dy / 2)) - np.sin(np.deg2rad(latitude - dy / 2)))
    areas = np.broadcast_to(area_rows[:, None], (HEIGHT, WIDTH))
    return lon, lat, distance <= RADIUS_KM, areas

def statistics(quantized, neighborhood, areas):
    temperature = quantized.astype(np.float64) * .01
    valid = quantized != 0
    roi = valid & neighborhood
    values, weights = temperature[roi], areas[roi]
    order = np.argsort(values, kind='stable')
    cumulative = np.cumsum(weights[order])
    p10 = values[order][np.searchsorted(cumulative, .1 * cumulative[-1])]
    return {'minK': float(temperature[valid].min()), 'maxK': float(temperature[valid].max()),
            'meanK': float(np.average(values, weights=weights)), 'p10K': float(p10), 'neighborhoodMinK': float(values.min()),
            'coldAreaKm2': float(areas[roi & (temperature < COLD_K)].sum()),
            'validNeighborhoodAreaKm2': float(weights.sum()), 'neighborhoodAreaKm2': float(areas[neighborhood].sum()),
            'validPixels': int(valid.sum()), 'missingPixels': int((~valid).sum()), 'statsRegion': 'fixed 300 km surface-distance neighborhood of volcano catalogue location'}

def process(hm):
    lon, lat, neighborhood, areas = grid()
    tb = np.full((HEIGHT, WIDTH), np.nan)
    provenance, segment_metadata, all_line_times = [], [], []
    checks = []
    for segment in (7, 8):
        filename = f'HS_H08_20220115_{hm}_B13_FLDK_R20_S{segment:02d}10.DAT.bz2'
        path = ROOT / 'raw' / filename
        counts, meta, line_times = load_segment(path)
        column, row, visible = geo_to_native(lon, lat, meta['projection'])
        ci = np.rint(column).astype(np.int64) - 1
        ri = np.rint(row).astype(np.int64) - meta['firstGlobalLine1Based']
        in_segment = visible & (ri >= 0) & (ri < counts.shape[0]) & (ci >= 0) & (ci < counts.shape[1])
        temperature, valid = calibrate(counts[ri[in_segment], ci[in_segment]].astype(np.float64), meta['calibration'])
        assigned = np.full(temperature.shape, np.nan); assigned[valid] = temperature[valid]
        tb[in_segment] = assigned
        for xlon, ylat in [(174, -29), (174, -12), (193, -29), (193, -12), (FOCUS['lon'] + 360, FOCUS['lat'])]:
            xcol, yrow, seen = geo_to_native(np.array(xlon), np.array(ylat), meta['projection'])
            inverse_lon, inverse_lat = native_to_geo(xcol, yrow, meta['projection'])
            longitude_error = abs((float(inverse_lon) - xlon + 180) % 360 - 180)
            error = max(longitude_error, abs(float(inverse_lat) - ylat))
            if not seen or error > 1e-7:
                raise ValueError('Navigation round-trip check failed; not an external geolocation-accuracy estimate')
            checks.append({'lon': xlon, 'lat': ylat, 'nativeColumn1Based': float(xcol), 'nativeLine1Based': float(yrow), 'roundTripErrorDegrees': error})
        source_url = SOURCE + f'AHI-L1b-FLDK/2022/01/15/{hm}/{filename}'
        provenance.append({'sourceUrl': source_url, 'rawFile': 'research/dynamics/volcano/raw/' + filename,
                           'rawSHA256': sha(path), 'rawBytes': path.stat().st_size,
                           'retrievedAtUtc': datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat().replace('+00:00', 'Z')})
        segment_metadata.append(meta); all_line_times.extend(line_times)
    quantized = np.rint(np.nan_to_num(tb, nan=0) * 100).astype(np.uint16)
    gray = np.rint(np.clip((310 - quantized.astype(float) * .01) / 130, 0, 1) * 255).astype(np.uint8)
    rgba = np.dstack((gray, gray, gray, (quantized != 0).astype(np.uint8) * 255))
    stem = f'tonga-b13-20220115T{hm}Z'
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (ROOT / 'numeric').mkdir(exist_ok=True); (ROOT / 'metadata').mkdir(exist_ok=True)
    png, numeric = OUTPUT / (stem + '.png'), ROOT / 'numeric' / (stem + '-bt-centikelvin.png')
    Image.fromarray(rgba).save(png, optimize=True)
    Image.fromarray(quantized).save(numeric, optimize=True)
    times = sorted(set(all_line_times))
    regional_start = np.interp(float(row.min()), [value[0] for value in times], [value[1] for value in times])
    regional_end = np.interp(float(row.max()), [value[0] for value in times], [value[1] for value in times])
    frame = {'timeUtc': f'2022-01-15T{hm[:2]}:{hm[2:]}:00Z', 'url': 'assets/events/volcano-dynamic/' + png.name,
             'scanStartUtc': min(item['scanStartUtc'] for item in segment_metadata), 'scanEndUtc': max(item['scanEndUtc'] for item in segment_metadata),
             'regionalScanStartUtcEstimate': iso_mjd(regional_start), 'regionalScanEndUtcEstimate': iso_mjd(regional_end),
             'sha256': sha(png), 'bytes': png.stat().st_size, 'width': WIDTH, 'height': HEIGHT,
             'stats': statistics(quantized, neighborhood, areas), 'sourceSegments': provenance,
             'numericData': {'url': 'research/dynamics/volcano/numeric/' + numeric.name, 'sha256': sha(numeric), 'bytes': numeric.stat().st_size, 'encoding': 'PNG uint16', 'scale': .01, 'unit': 'K', 'nodata': 0}}
    (ROOT / 'metadata' / (stem + '.json')).write_text(json.dumps({'frame': frame, 'segments': segment_metadata, 'coordinateRoundTripChecks': checks}, ensure_ascii=False, indent=2), encoding='utf8')
    return frame

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--times', nargs='*'); args = parser.parse_args()
    start = datetime(2022, 1, 15, 3, 50, tzinfo=timezone.utc)
    expected = [(start + timedelta(minutes=10 * i)).strftime('%H%M') for i in range(25)]
    selected = args.times or expected
    frames, missing = [], []
    for hm in selected:
        if not all((ROOT / 'raw' / f'HS_H08_20220115_{hm}_B13_FLDK_R20_S{segment:02d}10.DAT.bz2').exists() for segment in (7, 8)):
            missing.append(f'2022-01-15T{hm[:2]}:{hm[2:]}:00Z'); continue
        frame = process(hm); frames.append(frame)
        print(json.dumps({'timeUtc': frame['timeUtc'], 'minK': frame['stats']['minK'], 'p10K': frame['stats']['p10K'], 'coldAreaKm2': frame['stats']['coldAreaKm2'], 'missingPixels': frame['stats']['missingPixels']}), flush=True)
    if not frames: raise ValueError('No complete valid frames available')
    series = []
    for field, label, unit, color in [('coldAreaKm2', '300公里内低温区域面积（<220K）', 'km²', '#76dce9'), ('p10K', '300公里内亮温 P10', 'K', '#f5b163')]:
        series.append({'id': field, 'label': label, 'unit': unit, 'color': color, 'maxAgeSeconds': 0,
                       'samples': [{'timeUtc': frame['timeUtc'], 'value': frame['stats'][field]} for frame in frames],
                       'method': '同一帧 uint16 亮温场，在火山目录位置固定300公里邻域内统计；面积按球面网格面积加权，P10为面积加权第10百分位。未识别火山灰或区分气象云。'})
    manifest = {'schemaVersion': 1, 'id': 'hunga-tonga-2022-b13', 'kind': 'volcano', 'title': '汤加喷发云的真实扩展',
                'subtitle': '2022-01-15 · Himawari-8 红外观测 · 每10分钟',
                'description': '连续卫星红外亮温场呈现喷发时段云团形态变化；两条曲线直接统计同一帧的固定区域。不是自制灰柱、喷发高度或火山灰浓度模型。',
                'focus': FOCUS, 'bbox': BBOX, 'projection': 'EPSG:4326', 'longitudeConvention': 'unwrapped east longitude across antimeridian; east=193 means 167W',
                'rowOrder': 'north-to-south', 'pixelConvention': 'bbox outer edges; centers at half-grid offsets', 'width': WIDTH, 'height': HEIGHT,
                'startUtc': frames[0]['timeUtc'], 'endUtc': frames[-1]['timeUtc'], 'cadenceSeconds': 600,
                'coverageStatus': 'sample' if args.times else 'complete' if not missing else 'has-missing-frames',
                'requestedStartUtc': '2022-01-15T03:50:00Z', 'requestedEndUtc': '2022-01-15T07:50:00Z', 'missingTimesUtc': missing,
                'timeMeaning': 'timeUtc is the HSD filename nominal 10-minute timeline; scanStart/end retain actual selected-segment acquisition bounds; regional times are interpolated line-time bounds, not instantaneous exposures',
                'palette': {'whiteK': 180, 'blackK': 310, 'clippedOutsideRange': True, 'alpha': '255 for valid data, 0 for nodata; not a cloud mask'},
                'statisticsRegion': {'center': FOCUS, 'radiusKm': RADIUS_KM, 'coldThresholdK': COLD_K, 'earthRadiusKm': EARTH_KM},
                'frames': frames, 'series': series,
                'sources': [{'name': 'JMA Himawari-8 / NOAA 公开数据及使用条件', 'url': 'https://registry.opendata.aws/noaa-himawari/'},
                            {'name': 'JMA HSD 格式、定标与时间说明', 'url': GUIDE},
                            {'name': 'Smithsonian 火山目录位置', 'url': 'https://volcano.si.edu/volcano.cfm?vn=243040'},
                            {'name': 'NASA 对同次喷发的连续红外及双星测高研究说明', 'url': 'https://science.nasa.gov/earth/earth-observatory/tonga-volcano-plume-reached-the-mesosphere-149474/'}],
                'limitations': ['单通道红外亮温不等于火山灰浓度、喷发高度或地表温度；气象云也可产生低温信号。',
                                '固定300公里邻域限制统计范围，扩展到区域外的云不计入；面积不是整片喷发云的实际面积。',
                                '未修正高空云的视差，表面坐标投影可能偏离云的真实地理位置；不能据此量测精确羽流边界或地面影响。',
                                '图像是实测数据定标、空间最近邻重投影和固定灰阶映射的派生展示；没有时间插值或补帧。',
                                '亮温随高度不总单调，尤其本次穿越平流层/中间层；不能用本图亮温直接推算高度。',
                                '若页面加入立体起伏、边缘淡化或照明，均只是展示增强，不代表实测三维高度。'],
                'processing': {'calibration': 'HSD block5 gain/offset -> spectral radiance -> Planck -> band brightness-temperature polynomial', 'spatialResampling': 'nearest neighbor', 'temporalInterpolation': 'none', 'gsics': 'not additionally applied',
                               'navigationCode': 'research/high-frequency-clouds/process_himawari.py', 'navigationCodeSHA256': sha(PROJECT / 'research/high-frequency-clouds/process_himawari.py'),
                               'processor': 'research/dynamics/volcano/process_volcano.py', 'processorSHA256': sha(Path(__file__))},
                'credit': 'JMA Himawari-8 / NOAA Open Data; 本项目定标、重投影与统计。派生图不是未经修改的原始文件，不暗示 JMA/NOAA 背书。'}
    output = PROJECT / 'app/data/volcano-dynamic.json'
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    (ROOT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    print(json.dumps({'frames': len(frames), 'missing': missing, 'displayBytes': sum(frame['bytes'] for frame in frames), 'numericBytes': sum(frame['numericData']['bytes'] for frame in frames)}))

if __name__ == '__main__':
    main()
