"""Offline, reproducible one-second envelopes of original EarthScope GeoCSV counts.
No response correction, filtering, interpolation, or synthetic wave propagation.
"""
from pathlib import Path
from datetime import datetime, timezone, timedelta
import json, hashlib, math, statistics

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[2]
START = datetime(2011, 3, 11, 5, 45, tzinfo=timezone.utc)
END = datetime(2011, 3, 11, 6, 5, tzinfo=timezone.utc)
BASELINE_END = START + timedelta(seconds=60)
STATIONS = ['MAJO', 'INCN', 'TATO', 'YSS', 'GUMO', 'ULN']

def parse_time(value):
    return datetime.fromisoformat(value.strip().replace('Z', '+00:00'))

def iso(value):
    precision = 'microseconds' if value.microsecond % 1000 else 'milliseconds' if value.microsecond else 'seconds'
    return value.isoformat(timespec=precision).replace('+00:00', 'Z')

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

receipt = json.loads((ROOT / 'fetch-results.json').read_text(encoding='utf-8'))
downloads = {entry['file']: entry for entry in receipt['results'] if entry.get('status') == 200}
for relative, entry in downloads.items():
    assert digest(ROOT / relative) == entry['sha256'], relative
event_raw = json.loads((ROOT / 'raw/event-usgs.geojson').read_text(encoding='utf-8'))
origin = datetime.fromtimestamp(event_raw['properties']['time'] / 1000, timezone.utc)
lon, lat, depth = event_raw['geometry']['coordinates']
assert BASELINE_END < origin

def table(filename):
    return [line.strip().split('|') for line in (ROOT / filename).read_text(encoding='utf-8').splitlines() if line.strip() and not line.startswith('#')]

channels = {row[1]: row for row in table('raw/channels.txt')}
names = {row[1]: row[5] for row in table('raw/stations.txt')}
station_data, verification = [], []

for code in STATIONS:
    relative = f'raw/IU.{code}.00.BHZ.geocsv'
    rows, blocks, block = [], [], None
    for line_number, line in enumerate((ROOT / relative).read_text(encoding='utf-8').splitlines(), 1):
        if line.startswith('# dataset:'):
            block = {}; blocks.append(block)
        if line.startswith('# '):
            if ':' in line: key, value = line[2:].split(':', 1); block[key.strip()] = value.strip()
            continue
        if not line.strip() or line.startswith('Time,'): continue
        time_text, value_text = line.split(',', 1)
        time = parse_time(time_text); value = int(value_text.strip())
        if START <= time < END: rows.append({'time': time, 'raw': value, 'line': line_number})
    assert rows and all(rows[i]['time'] < rows[i + 1]['time'] for i in range(len(rows) - 1))
    assert all(b['SID'] == f'IU_{code}_00_BHZ' and b['field_unit'] == 'UTC, Counts' for b in blocks)
    rates = sorted({float(b['sample_rate_hz']) for b in blocks})
    assert len(rates) == 1
    rate = rates[0]; channel = channels[code]
    assert float(channel[14]) == rate
    assert all(abs(float(b['latitude_deg']) - float(channel[4])) < 1e-6 and abs(float(b['longitude_deg']) - float(channel[5])) < 1e-6 for b in blocks)
    base_rows = [r['raw'] for r in rows if START <= r['time'] < BASELINE_END]
    baseline = statistics.median(base_rows)
    windows = [[] for _ in range(int((END - START).total_seconds()))]
    for row in rows: windows[math.floor((row['time'] - START).total_seconds())].append(row)
    samples = []
    for i, window in enumerate(windows):
        start = START + timedelta(seconds=i); end = start + timedelta(seconds=1)
        sample = {'timeUtc': iso(end), 'windowStartUtc': iso(start), 'windowEndUtc': iso(end), 'sampleCount': len(window)}
        if not window:
            sample.update(value=None, min=None, max=None, peakTimeUtc=None, rawValue=None, sourceLine=None, status='missing')
        else:
            # The signed value is one actual sample, selected by maximum departure from baseline.
            peak = max(window, key=lambda r: abs(r['raw'] - baseline))
            minimum = min(r['raw'] for r in window); maximum = max(r['raw'] for r in window)
            sample.update(value=peak['raw'] - baseline, min=minimum - baseline, max=maximum - baseline,
                          peakTimeUtc=iso(peak['time']), rawValue=peak['raw'], sourceLine=peak['line'],
                          firstSampleTimeUtc=iso(window[0]['time']), lastSampleTimeUtc=iso(window[-1]['time']),
                          status='complete' if len(window) == round(rate) else 'partial')
        samples.append(sample)
    gaps = []
    for a, b in zip(rows, rows[1:]):
        delta = (b['time'] - a['time']).total_seconds()
        if delta > 1.5 / rate: gaps.append({'afterUtc': iso(a['time']), 'beforeUtc': iso(b['time']), 'durationSeconds': delta - 1 / rate})
    max_abs = max(abs(r['raw'] - baseline) for r in rows)
    station = {
        'id': f'IU.{code}.00.BHZ', 'name': names[code], 'stationCode': code, 'network': 'IU', 'location': '00',
        'lat': float(channel[4]), 'lon': float(channel[5]), 'channel': 'BHZ', 'unit': 'counts',
        'valueMeaning': 'Actual signed sample with greatest absolute baseline-subtracted count in the preceding one-second window.',
        'sampleIntervalSeconds': 1, 'nativeSampleRateHz': rate, 'nativeSampleIntervalSeconds': 1 / rate,
        'baselineCounts': baseline, 'baselineWindow': {'startUtc': iso(START), 'endUtc': iso(BASELINE_END), 'sampleCount': len(base_rows), 'method': 'median of actual raw counts before earthquake origin'},
        'displayScaleMaxAbsCounts': max_abs, 'normalization': 'Independent per-station display scale only. Do not compare counts or normalized amplitudes between instruments.',
        'samples': samples, 'rawSampleCount': len(rows), 'firstRawTimeUtc': iso(rows[0]['time']), 'lastRawTimeUtc': iso(rows[-1]['time']),
        'gaps': gaps, 'partialWindowCount': sum(s['status'] == 'partial' for s in samples), 'emptyWindowCount': sum(s['status'] == 'missing' for s in samples),
        'channelMetadata': {'elevationM': float(channel[6]), 'sensorDepthM': float(channel[7]), 'azimuthDegrees': float(channel[8]), 'dipDegrees': float(channel[9]), 'sensor': channel[10], 'sensitivity': float(channel[11]), 'sensitivityFrequencyHz': float(channel[12]), 'sensitivityInputUnit': channel[13], 'responseCorrectionApplied': False, 'note': 'Sensitivity metadata is retained but not applied; output remains instrument counts.'},
        'sourceUrl': downloads[relative]['url'], 'rawFile': 'research/dynamics/quake/' + relative,
        'rawSHA256': downloads[relative]['sha256'], 'rawBytes': downloads[relative]['bytes'], 'retrievedAtUtc': downloads[relative]['retrievedAtUtc'],
        'stationMetadataUrl': downloads['raw/channels.txt']['url'], 'stationMetadataSHA256': downloads['raw/channels.txt']['sha256'],
    }
    station_data.append(station)
    verification.append({k: station[k] for k in ['id', 'lat', 'lon', 'nativeSampleRateHz', 'rawSampleCount', 'firstRawTimeUtc', 'lastRawTimeUtc', 'baselineCounts', 'displayScaleMaxAbsCounts', 'partialWindowCount', 'emptyWindowCount', 'gaps']})

data = {
    'schemaVersion': 1, 'id': 'tohoku-2011-observed-stations', 'kind': 'quake',
    'title': '2011年东北地震 · 六站真实记录', 'subtitle': 'BHZ垂直通道 · 20 Hz原始计数 · 1秒窗包络',
    'description': '沿同一UTC时间窗，查看日本、韩国、台湾、萨哈林、关岛与蒙古六个真实台站记录到的不同波形。信号来自官方档案，未生成理论波纹。',
    'focus': {'lat': lat, 'lon': lon}, 'startUtc': iso(START + timedelta(seconds=1)), 'endUtc': iso(END),
    'requestedStartUtc': iso(START), 'requestedEndUtc': iso(END), 'originUtc': iso(origin),
    'magnitude': event_raw['properties']['mag'], 'magnitudeType': event_raw['properties'].get('magType'), 'depthKm': depth,
    'eventSourceId': event_raw['id'], 'eventSourceUrl': event_raw['properties']['url'],
    'eventMetadataUrl': downloads['raw/event-usgs.geojson']['url'], 'eventRawSHA256': downloads['raw/event-usgs.geojson']['sha256'],
    'eventUpdatedUtc': iso(datetime.fromtimestamp(event_raw['properties']['updated'] / 1000, timezone.utc)),
    'retrievedAtUtc': receipt['retrievedAtUtc'], 'stations': station_data,
    'processing': {'kind': 'derived envelopes from observed digital waveform samples', 'responseCorrectionApplied': False, 'physicalUnitConversionApplied': False, 'temporalInterpolation': False, 'filterApplied': False, 'baseline': 'station-specific median during 05:45:00 <= UTC < 05:46:00, before origin', 'windowSeconds': 1, 'timeUtcMeaning': 'exclusive window end; all source samples precede the displayed clock', 'value': 'signed actual sample with largest absolute baseline-subtracted count; peakTimeUtc/rawValue/sourceLine retain its exact origin', 'minMax': 'actual minimum and maximum native samples in the same one-second window, with the same baseline removed', 'missingPolicy': 'empty window null; partially populated windows retain actual sampleCount/status; no filling or interpolation', 'display': 'normalize each station independently; marker size is an explanatory scale, not geographic displacement, shaking intensity or affected area'},
    'sources': [
        {'name': 'USGS · 2011 Great Tohoku Earthquake', 'url': event_raw['properties']['url']},
        {'name': 'EarthScope · FDSN dataselect原始波形', 'url': 'https://service.earthscope.org/fdsnws/dataselect/1/'},
        {'name': 'EarthScope · FDSN station台站元数据', 'url': 'https://service.earthscope.org/fdsnws/station/1/'},
        {'name': 'FDSN · IU Global Seismograph Network', 'url': 'https://www.fdsn.org/networks/detail/IU/'},
    ],
    'limitations': [
        '数值为数字仪器计数counts，已减去震前一分钟中位数；未校正完整仪器响应，不是cm/s、m/s、加速度或地表位移。',
        '各站仪器灵敏度不同；图形只能按各站独立尺度读取，不能用计数大小或归一化图形比较不同地区的实际震动强弱。',
        '每个时钟点代表刚结束的一秒窗，值为其中一个实际峰值样本，阴影范围为真实最小—最大值；不是1 Hz原始连续采样。',
        '仅BHZ垂直通道、六个选定台站；不是完整观测网或当地烈度图。未自动识别P/S到时，不据波形标签推断相位或震源机制。',
        '仪器可能含基线漂移、长周期响应或削波；本版未完成专业仪器质量评估。负值表示通道计数相对基线的符号，不能直接解释为地表上下位移。',
        '地球上的径向针柱或圈只编码该站该窗信号，视觉大小经过放大，不是实测传播波前、影响范围或地表形变。',
    ],
}
output = PROJECT / 'app/data/quake-dynamic.json'
output.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n', encoding='utf-8')
report = {'generatedAtUtc': iso(datetime.now(timezone.utc)), 'event': {k: data[k] for k in ['eventSourceId', 'originUtc', 'magnitude', 'magnitudeType', 'depthKm']}, 'stations': verification, 'stationCount': len(station_data), 'envelopeCountPerStation': len(station_data[0]['samples']), 'assetBytes': output.stat().st_size, 'assetSHA256': digest(output), 'rawHashesVerified': len(downloads), 'sourceSamplesRetainedWithoutInterpolation': sum(s['rawSampleCount'] for s in station_data)}
(ROOT / 'processing-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=True, indent=2))
