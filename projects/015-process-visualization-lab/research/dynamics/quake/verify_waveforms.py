"""Independent full source-to-envelope checks; no network or writes to application data."""
from pathlib import Path
from datetime import datetime, timezone
import csv, json, hashlib, statistics

ROOT = Path(__file__).resolve().parent
asset = ROOT.parents[2] / 'app/data/quake-dynamic.json'
data = json.loads(asset.read_text(encoding='utf-8'))
parse = lambda s: datetime.fromisoformat(s.replace('Z', '+00:00'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
start, end = parse(data['requestedStartUtc']), parse(data['requestedEndUtc'])
origin = parse(data['originUtc'])
reports = []
for station in data['stations']:
    path = ROOT / 'raw' / (station['id'] + '.geocsv')
    assert sha(path) == station['rawSHA256']
    source, source_lines = [], {}
    for line_no, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        if not line or line.startswith('#') or line.startswith('Time,'): continue
        time_text, value_text = next(csv.reader([line]))
        record = (parse(time_text.strip()), int(value_text.strip()), line_no)
        if start <= record[0] < end:
            source.append(record); source_lines[line_no] = record
    assert len(source) == station['rawSampleCount'] == 24000
    baseline_end = parse(station['baselineWindow']['endUtc'])
    assert baseline_end < origin
    baseline = statistics.median(v for t, v, _ in source if t < baseline_end)
    assert baseline == station['baselineCounts']
    cursor = 0; checked = 0
    for sample in station['samples']:
        left, right = parse(sample['windowStartUtc']), parse(sample['windowEndUtc'])
        assert parse(sample['timeUtc']) == right and (right - left).total_seconds() == 1
        window = []
        while cursor < len(source) and source[cursor][0] < right:
            assert source[cursor][0] >= left
            window.append(source[cursor]); cursor += 1
        assert len(window) == sample['sampleCount']
        if not window:
            assert sample['value'] is sample['min'] is sample['max'] is None
            continue
        values = [r[1] for r in window]
        assert sample['min'] + baseline == min(values)
        assert sample['max'] + baseline == max(values)
        chosen = source_lines[sample['sourceLine']]
        assert chosen in window
        assert parse(sample['peakTimeUtc']) == chosen[0]
        assert sample['rawValue'] == chosen[1]
        assert sample['value'] + baseline == chosen[1]
        assert abs(sample['value']) == max(abs(value - baseline) for value in values)
        assert sample['min'] <= sample['value'] <= sample['max']
        checked += 1
    assert cursor == len(source) and checked == 1200
    assert station['displayScaleMaxAbsCounts'] == max(abs(value - baseline) for _, value, _ in source)
    reports.append({'id': station['id'], 'sourceSamples': len(source), 'verifiedEnvelopeWindows': checked, 'sourceHash': 'matched', 'peakValueAndTimestampAndSourceLine': 'matched', 'minMaxAndSampleCount': 'matched'})
event = json.loads((ROOT / 'raw/event-usgs.geojson').read_text(encoding='utf-8'))
assert sha(ROOT / 'raw/event-usgs.geojson') == data['eventRawSHA256']
assert int(origin.timestamp() * 1000) == event['properties']['time']
assert data['focus'] == {'lat': event['geometry']['coordinates'][1], 'lon': event['geometry']['coordinates'][0]}
assert data['magnitude'] == event['properties']['mag'] and data['depthKm'] == event['geometry']['coordinates'][2]
report = {'status': 'passed', 'verifiedAtUtc': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'), 'assetSHA256': sha(asset), 'stationCount': len(reports), 'totalVerifiedRawSamples': sum(s['sourceSamples'] for s in reports), 'totalVerifiedEnvelopes': sum(s['verifiedEnvelopeWindows'] for s in reports), 'eventMetadata': 'matched official saved USGS GeoJSON', 'stations': reports, 'notVerified': ['Instrument response correction is not applied.', 'No physical-unit calibration or independent phase picking.', 'No professional clipping/response quality assessment or UI/browser verification.']}
(ROOT / 'verification.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))
