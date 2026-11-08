"""Hinnamnor: calibrate only two actual HSD segments, preserve UTC and source pixels.

Reuses the independently round-trip-checked JMA navigation functions from the
existing Mangkhut pipeline. No cloud synthesis or temporal interpolation.
"""
from __future__ import annotations
import argparse, bz2, hashlib, importlib.util, json, math, re, struct, zipfile
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[2]
BASE_PATH = PROJECT / 'research/high-frequency-clouds/wide-v10/process_himawari.py'
spec = importlib.util.spec_from_file_location('verified_hsd_navigation', BASE_PATH)
base = importlib.util.module_from_spec(spec); spec.loader.exec_module(base)
BBOX = [112, 22, 140, 43]
WIDTH, HEIGHT = 1024, 768
START, END = '2022-09-05T03:00:00Z', '2022-09-05T13:30:00Z'
OUT = PROJECT / 'app/assets/events/storm-dynamic'
META = ROOT / 'frames'
SOURCE_BASE = 'https://noaa-himawari8.s3.amazonaws.com/'
JMA_URL = 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/bst_all.zip'
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def write_json(path, value): path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf8')

def load_segment(path):
    raw = bz2.decompress(path.read_bytes())
    if raw[5] != 0 or raw[78] != 0: raise ValueError('Unsupported byte order or nonzero operational quality flag')
    blocks, offset = {}, 0
    for number in range(1, 12):
        if raw[offset] != number: raise ValueError('Wrong HSD block number')
        length = struct.unpack_from('<I' if number == 10 else '<H', raw, offset + 1)[0]
        blocks[number] = raw[offset:offset + length]; offset += length
    start, end, created, header_size, data_size = struct.unpack_from('<3d2I', blocks[1], 46)
    bits, columns, lines, compression = struct.unpack_from('<HHHB', blocks[2], 3)
    if header_size != offset or bits != 16 or compression != 0 or len(raw) != header_size + data_size: raise ValueError('Unexpected HSD length or compression')
    lon0, cfac, lfac, coff, loff, rs, req, rpol = struct.unpack_from('<dIIff3d', blocks[3], 3)
    band, wavelength, valid_bits, error_value, outside_value, *cal = struct.unpack_from('<HdHHH11d', blocks[5], 3)
    total_segments, segment, first_line = struct.unpack_from('<BBH', blocks[7], 3)
    if band != 13 or total_segments != 10 or segment not in (2, 3) or first_line != (segment - 1) * 550 + 1 or lines != 550: raise ValueError('Unexpected band or segment coverage')
    _, _, rotation, correction_count = struct.unpack_from('<ffdH', blocks[8], 3)
    corrections = [struct.unpack_from('<Hff', blocks[8], 21 + i * 10) for i in range(correction_count)]
    if rotation != 0 or any(x != 0 or y != 0 for _, x, y in corrections): raise ValueError('Nonzero navigation correction is not silently ignored')
    time_count = struct.unpack_from('<H', blocks[9], 3)[0]
    line_times = [struct.unpack_from('<Hd', blocks[9], 5 + i * 10) for i in range(time_count)]
    error_lines = struct.unpack_from('<H', blocks[10], 5)[0]
    if error_lines: raise ValueError('HSD reports erroneous scan lines')
    counts = np.frombuffer(raw, dtype='<u2', count=columns * lines, offset=header_size).reshape(lines, columns)
    meta = {
        'satellite': blocks[1][6:22].decode('ascii').strip('\x00 '), 'formatVersion': blocks[1][82:114].decode('ascii').strip('\x00 '),
        'nativeColumns': columns, 'nativeLines': lines, 'segment': segment, 'totalSegments': total_segments, 'firstLine1Based': first_line,
        'scanStartUtc': base.iso_mjd(start), 'scanEndUtc': base.iso_mjd(end), 'createdAtUtc': base.iso_mjd(created),
        'qualityFlags': list(blocks[1][78:82]), 'errorLineCount': error_lines,
        'navigationCorrection': {'rotationMicroradians': rotation, 'allShiftsZero': True, 'recordCount': correction_count},
        'projection': {'name': 'normalized geostationary', 'subLongitude': lon0, 'CFAC': cfac, 'LFAC': lfac, 'COFF': coff, 'LOFF': loff, 'satelliteDistanceFromEarthCenterKm': rs, 'equatorialRadiusKm': req, 'polarRadiusKm': rpol},
        'calibration': {'band': band, 'wavelengthMicrometers': wavelength, 'validBits': valid_bits, 'invalidCountValues': [error_value, outside_value], 'gain': cal[0], 'offset': cal[1], 'c0': cal[2], 'c1': cal[3], 'c2': cal[4], 'speedOfLight': cal[8], 'planckConstant': cal[9], 'boltzmannConstant': cal[10]},
        'lineTimes': [{'line': n, 'timeUtc': base.iso_mjd(t)} for n, t in line_times], 'rawFile': 'raw/' + path.name, 'rawBytes': path.stat().st_size, 'rawSHA256': sha(path),
        'sourceUrl': SOURCE_BASE + 'AHI-L1b-FLDK/2022/09/05/' + path.name.split('_')[3] + '/' + path.name,
    }
    return counts, meta

def process(hm):
    west, south, east, north = BBOX
    longitude = west + (np.arange(WIDTH) + .5) * (east - west) / WIDTH
    latitude = north - (np.arange(HEIGHT) + .5) * (north - south) / HEIGHT
    lon, lat = np.meshgrid(longitude, latitude)
    tb = np.full((HEIGHT, WIDTH), np.nan); assigned = np.zeros((HEIGHT, WIDTH), dtype=bool); metadata = []
    for segment in (2, 3):
        path = ROOT / 'raw' / f'HS_H08_20220905_{hm}_B13_FLDK_R20_S{segment:02d}10.DAT.bz2'
        counts, meta = load_segment(path); metadata.append(meta)
        col, row, visible = base.geo_to_native(lon, lat, meta['projection'])
        ci = np.rint(col).astype(int) - 1; ri = np.rint(row).astype(int) - meta['firstLine1Based']
        inside = visible & (ci >= 0) & (ci < counts.shape[1]) & (ri >= 0) & (ri < counts.shape[0])
        if np.any(assigned & inside): raise ValueError('Overlapping source segment rows')
        assigned |= inside
        sample = counts[ri[inside], ci[inside]].astype(np.float64); c = meta['calibration']
        radiance = c['gain'] * sample + c['offset']
        valid = (~np.isin(sample, c['invalidCountValues'])) & (sample < 2 ** c['validBits']) & (radiance > 0)
        wavelength = c['wavelengthMicrometers'] * 1e-6
        with np.errstate(divide='ignore', invalid='ignore'):
            te = (c['planckConstant'] * c['speedOfLight'] / (c['boltzmannConstant'] * wavelength)) / np.log1p(2 * c['planckConstant'] * c['speedOfLight'] ** 2 / (wavelength ** 5 * radiance * 1e6))
        values = c['c0'] + c['c1'] * te + c['c2'] * te ** 2; valid &= np.isfinite(values); values[~valid] = np.nan; tb[inside] = values
    if not assigned.all(): raise ValueError('Requested bbox is not covered by downloaded source segments')
    valid = np.isfinite(tb)
    if not valid.any(): raise ValueError('No valid brightness temperatures')
    gray = np.rint(np.clip((310 - np.nan_to_num(tb, nan=310)) / 130, 0, 1) * 255).astype(np.uint8)
    rgba = np.dstack((gray, gray, gray, valid.astype(np.uint8) * 255))
    stem = f'hinnamnor-b13-20220905T{hm}Z'; OUT.mkdir(parents=True, exist_ok=True); META.mkdir(exist_ok=True)
    image_path = OUT / (stem + '.png'); Image.fromarray(rgba).save(image_path, optimize=True)
    data_path = META / (stem + '-bt-centikelvin.png'); Image.fromarray(np.rint(np.nan_to_num(tb, nan=0) * 100).astype('<u2')).save(data_path, optimize=True)
    # Spherical geographic pixel area, used only for the fixed threshold statistic, not a cloud mask.
    north_edges = np.deg2rad(north - np.arange(HEIGHT) * (north - south) / HEIGHT)
    south_edges = np.deg2rad(north - (np.arange(HEIGHT) + 1) * (north - south) / HEIGHT)
    pixel_area = 6371.0088 ** 2 * math.radians((east - west) / WIDTH) * (np.sin(north_edges) - np.sin(south_edges))
    checks = []
    for x, y in [(west, south), (west, north), (east, south), (east, north), (125.8, 32.3)]:
        c, r, visible = base.geo_to_native(np.array(x), np.array(y), metadata[0]['projection']); ilon, ilat = base.native_to_geo(c, r, metadata[0]['projection'])
        error = float(max(abs(ilon - x), abs(ilat - y)))
        if error > 1e-7 or not visible: raise ValueError('Geographic transform round-trip failure')
        checks.append({'lon': x, 'lat': y, 'roundTripMaxErrorDegrees': error})
    stats = {'minK': float(np.nanmin(tb)), 'maxK': float(np.nanmax(tb)), 'meanK': float(np.nanmean(tb)), 'p10K': float(np.nanpercentile(tb, 10)), 'p50K': float(np.nanpercentile(tb, 50)),
             'below235KAreaKm2': float(np.sum((valid & (tb <= 235)).sum(axis=1) * pixel_area)), 'validPixels': int(valid.sum()), 'missingPixels': int((~valid).sum())}
    frame = {'timeUtc': f'2022-09-05T{hm[:2]}:{hm[2:]}:00Z', 'url': 'assets/events/storm-dynamic/' + image_path.name, 'width': WIDTH, 'height': HEIGHT,
             'scanStartUtc': min(m['scanStartUtc'] for m in metadata), 'scanEndUtc': max(m['scanEndUtc'] for m in metadata), 'sha256': sha(image_path), 'stats': stats,
             'sourceUrls': [m['sourceUrl'] for m in metadata], 'numericData': {'researchFile': 'research/dynamics/storm/frames/' + data_path.name, 'sha256': sha(data_path), 'encoding': 'PNG uint16', 'scale': .01, 'unit': 'K', 'nodata': 0}}
    write_json(META / (stem + '.json'), {'frame': frame, 'sourceSegments': metadata, 'coordinateChecks': checks, 'bbox': BBOX, 'projection': 'EPSG:4326', 'pixelConvention': 'outer edges; pixel centers at half-cell offsets; rows north to south'})
    print(json.dumps({'frame': frame['timeUtc'], 'stats': stats, 'scan': [frame['scanStartUtc'], frame['scanEndUtc']]}), flush=True)
    return frame

def get_track():
    archive_path = ROOT / 'raw/bst_all.zip'
    with zipfile.ZipFile(archive_path) as archive:
        member = next(name for name in archive.namelist() if name.endswith('bst_all.txt')); lines = archive.read(member).decode('ascii').splitlines()
    first = next(i for i, line in enumerate(lines) if line.startswith('66666 2211')); count = int(lines[first][12:15])
    original = '\n'.join(lines[first:first + count + 1]) + '\n'; source = ROOT / 'hinnamnor-jma-source.txt'; source.write_text(original, encoding='ascii')
    records = []
    for index, line in enumerate(lines[first + 1:first + count + 1]):
        line = line.ljust(80); t = line[:8]; wind = line[33:36].strip()
        if line[9:12] != '002': raise ValueError('Invalid JMA data row')
        records.append({'timeUtc': f'20{t[:2]}-{t[2:4]}-{t[4:6]}T{t[6:8]}:00:00Z', 'lat': int(line[15:18]) / 10, 'lon': int(line[19:23]) / 10, 'pressureHpa': int(line[24:28]) if line[24:28].strip() else None, 'windKt': int(wind) if wind not in ('', '000') else None, 'grade': int(line[13]), 'sourceLine': index + 2})
    revision = re.search(r'\b(\d{8})\s*$', lines[first]).group(1)
    write_json(ROOT / 'hinnamnor-jma-full.json', {'records': records, 'sourceUrl': JMA_URL, 'sourceSHA256': sha(source), 'archiveSHA256': sha(archive_path), 'sourceRevisionDate': revision[:4] + '-' + revision[4:6] + '-' + revision[6:], 'dataType': 'official-retrospective-best-track-analysis', 'windDefinition': 'maximum sustained wind, 10-minute averaging, knots; not eye-point wind'})
    return [r for r in records if START <= r['timeUtc'] <= END]

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--sample', action='store_true'); parser.add_argument('--reuse', action='store_true'); args = parser.parse_args()
    frames = []
    for path in sorted((ROOT / 'raw').glob('HS_H08_20220905_*_B13_FLDK_R20_S0210.DAT.bz2')):
        hm = path.name.split('_')[3]
        if not START <= f'2022-09-05T{hm[:2]}:{hm[2:]}:00Z' <= END: continue
        sidecar = META / f'hinnamnor-b13-20220905T{hm}Z.json'
        if (ROOT / 'raw' / path.name.replace('_S0210.', '_S0310.')).exists():
            frames.append(json.loads(sidecar.read_text(encoding='utf8'))['frame'] if args.reuse and sidecar.exists() else process(hm))
        if args.sample: break
    track = get_track(); write_json(ROOT / 'sample-manifest.json', {'frames': frames, 'bbox': BBOX, 'track': track})
    print('track', json.dumps(track), flush=True)
    if not args.sample:
        expected = [f'2022-09-05T{hour:02d}:{minute:02d}:00Z' for hour in range(3, 14) for minute in (0, 30)]
        expected.remove('2022-09-05T10:00:00Z'); expected.extend(['2022-09-05T09:50:00Z', '2022-09-05T10:10:00Z']); expected.sort()
        if [f['timeUtc'] for f in frames] != expected: raise ValueError('The bounded 23-frame window is incomplete; do not publish a misleading continuous manifest.')
        series = []
        for key, label, unit, color, method in [
            ('p10K', '窗口亮温第10百分位', 'K', '#9ddce8', '固定经纬窗口内有效像元亮温的第10百分位，按栅格像元计数；不是云高或风速。'),
            ('below235KAreaKm2', '≤235 K 像元投影面积', 'km²', '#b4a4ee', '在固定窗口逐像元判断亮温≤235 K，按球面经纬网面积求和（半径6371.0088 km）；包含窗口内其他天气系统，不是云掩膜、风暴范围或降雨面积。')]:
            series.append({'id': key, 'label': label, 'unit': unit, 'color': color, 'samples': [{'timeUtc': f['timeUtc'], 'value': f['stats'][key]} for f in frames], 'maxAgeSeconds': 1800, 'method': method, 'dataType': 'derived-from-same-observation-frame'})
        for key, label, unit, color in [('windKt', '最大持续风速 · 10分钟平均', 'kt', '#e8bf84'), ('pressureHpa', '中心气压 · 事后分析', 'hPa', '#83cdb9')]:
            series.append({'id': key, 'label': label, 'unit': unit, 'color': color, 'samples': [{'timeUtc': r['timeUtc'], 'value': r[key]} for r in track], 'maxAgeSeconds': 10800, 'method': 'JMA RSMC Tokyo 原始三小时事后最佳路径分析；仅原始记录，无中间数值插值。当前值只可引用所选时刻之前最近的分析，并同时显示分析时刻。', 'dataType': 'official-retrospective-best-track-analysis'})
        raw = list((ROOT / 'raw').glob('HS_H08_*.bz2'))
        manifest = {
            'schemaVersion': 1, 'id': 'hinnamnor-2022-0905', 'kind': 'storm', 'title': '轩岚诺：北上过程中的云系与强度',
            'subtitle': '2022年9月5日 · 葵花八号真实红外 / JMA事后分析',
            'description': '同一地球时间轴展示轩岚诺在东海北上的23帧原始红外扫描选帧，并对应4条JMA最佳路径记录。云图间隔20–30分钟，风速和中心气压保留三小时原始分析时刻。',
            'focus': {'lat': 32.3, 'lon': 126.6}, 'bbox': BBOX, 'projection': 'EPSG:4326', 'width': WIDTH, 'height': HEIGHT,
            'startUtc': START, 'endUtc': END, 'frameIntervalSeconds': None, 'frameIntervalRangeSeconds': [1200, 1800], 'frames': frames, 'track': track, 'series': series,
            'missingOriginalScans': [{'timeUtc': '2022-09-05T10:00:00Z', 'reason': 'No source objects in official NOAA archive listing; no synthetic replacement.', 'verificationFile': 'research/dynamics/storm/s3-hour-10.xml'}],
            'qualitySelection': 'Final window ends at 13:30 UTC. Preliminary 14:00–15:00 candidate segments have nonzero operation flags 64, 65 or 1 (possible solar degradation and/or solar eclipse) and are excluded. Every delivered source segment has operation flag 0 and no error lines.',
            'retrievedAtUtc': datetime.fromtimestamp(max(p.stat().st_mtime for p in raw), timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z'),
            'timeMeaning': 'timeUtc is the nominal 10-minute scan timeline selected mostly every 30 minutes, with actual 09:50 and 10:10 scans instead of absent 10:00. scanStartUtc/scanEndUtc bound the two downloaded source segments, not an instantaneous exposure or a whole-disk scan.',
            'sources': [
                {'name': 'JMA / NOAA 葵花八号开放数据', 'url': 'https://registry.opendata.aws/noaa-himawari/'},
                {'name': 'NOAA 2022-09-05 原始HSD对象目录', 'url': SOURCE_BASE + '?list-type=2&prefix=AHI-L1b-FLDK/2022/09/05/'},
                {'name': 'JMA HSD v1.3 格式与标定指南', 'url': base.GUIDE},
                {'name': 'JMA RSMC Tokyo 最佳路径档案', 'url': 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html'},
                {'name': 'JMA 最佳路径字段说明', 'url': 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/e_format_bst.html'},
                {'name': 'JMA 最大持续风速定义', 'url': 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/advisory.html'}],
            'processing': {'calibration': 'HSD block 5 counts → radiance → Planck equivalent temperature → c0+c1*Te+c2*Te²; no additional GSICS correction',
                'band': 13, 'wavelengthMicrometers': 10.4073, 'nominalNadirResolutionKm': 2,
                'navigation': 'HSD normalized geostationary / WGS84; require zero navigation corrections; nearest-neighbour spatial resampling',
                'palette': {'blackKelvin': 310, 'whiteKelvin': 180, 'alpha': '255 valid / 0 missing; not a cloud mask'},
                'pixelConvention': 'bbox outer edges; pixel centers at half-cell offsets; rows north-to-south', 'temporalInterpolation': False,
                'numericRetention': 'D research/dynamics/storm/frames contains calibrated uint16 centikelvin PNGs and all original source-segment metadata; raw HSD retained for verification.'},
            'limitations': [
                '红外亮温不是自然色、风速、降雨量、火山灰浓度或精确云高；显示色标截断于180–310 K，数值资料保留范围外温度。',
                '主要按半小时选取真实扫描。官方10:00缺档，另选原始09:50和10:10，实际间隔20–30分钟；没有生成、旋转、形变或插值云图。每组两段扫描历时约两分钟。',
                'JMA风速是最大持续风速的10分钟平均，气压和中心位置为事后最佳路径分析，不能称为每个云图时刻的直接实测。',
                '固定窗口内的亮温统计包含其他天气系统，不是对轩岚诺云体的识别，也不是灾害影响范围；没有据此估计降雨或损失。',
                '经纬网采用空间最近邻采样；云视差、仪器定位误差未经校正。导航往返检验验证数值实现，不等同于绝对地理精度。'],
            'credit': 'JMA Himawari-8 / NOAA Open Data Dissemination；JMA RSMC Tokyo best track。区域裁取、定标、重投影和显示由本项目完成；非未经修改原图，非官方产品。',
        }
        write_json(PROJECT / 'app/data/storm-dynamic.json', manifest)
        used = [ROOT / 'raw' / Path(url).name for frame in frames for url in frame['sourceUrls']]
        write_json(ROOT / 'delivery-summary.json', {'frames': len(frames), 'sourceSegmentsUsed': len(used), 'rawBytesUsed': sum(p.stat().st_size for p in used), 'rawCandidatesRetained': len(raw), 'allRawCandidateBytes': sum(p.stat().st_size for p in raw), 'displayBytes': sum((OUT / Path(f['url']).name).stat().st_size for f in frames), 'bbox': BBOX, 'width': WIDTH, 'height': HEIGHT, 'trackRecords': len(track)})

if __name__ == '__main__': main()
