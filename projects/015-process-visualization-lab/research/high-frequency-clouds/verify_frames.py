"""Check the delivered media/clock/provenance contract against retained real files."""
import hashlib
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'himawari-b13-manifest.json').read_text(encoding='utf-8'))
start = datetime(2018, 9, 16, tzinfo=timezone.utc)
expected = [(start + timedelta(minutes=i * 10)).isoformat().replace('+00:00', 'Z') for i in range(73)]
missing = ['2018-09-16T02:40:00Z']
observed = [f['timeUtc'] for f in manifest['frames']]
assert observed == [x for x in expected if x not in missing]
assert manifest['missingTimesUtc'] == missing
assert len(manifest['frames']) == 72
raw_total = display_total = data_total = 0
previous = None
changed_pixels = []
qualities = set()
for f in manifest['frames']:
    assert f['bbox'] == [105, 5, 140, 35] and f['projection'] == 'EPSG:4326'
    assert f['width'] == 1024 and f['height'] == 878
    raw_path, image_path = root / f['rawFile'], root / f['url']
    value_path = root / f['brightnessTemperatureData']['url']
    assert hashlib.sha256(raw_path.read_bytes()).hexdigest() == f['rawSHA256']
    assert hashlib.sha256(image_path.read_bytes()).hexdigest() == f['sha256']
    assert hashlib.sha256(value_path.read_bytes()).hexdigest() == f['brightnessTemperatureData']['sha256']
    assert raw_path.stat().st_size == f['rawBytes']
    raw_total += raw_path.stat().st_size
    display_total += image_path.stat().st_size
    data_total += value_path.stat().st_size
    nominal = datetime.fromisoformat(f['timeUtc'].replace('Z', '+00:00'))
    scan_start = datetime.fromisoformat(f['scanStartUtc'].replace('Z', '+00:00'))
    scan_end = datetime.fromisoformat(f['scanEndUtc'].replace('Z', '+00:00'))
    assert nominal <= scan_start < scan_end < nominal + timedelta(minutes=10)
    assert nominal.strftime('%Y%m%d_%H%M') in f['sourceUrl']
    image = np.asarray(Image.open(image_path))
    values = np.asarray(Image.open(value_path))
    assert image.shape == (878, 1024, 4) and values.shape == (878, 1024)
    assert np.all(image[:, :, 0] == image[:, :, 1]) and np.all(image[:, :, 1] == image[:, :, 2])
    assert np.all((image[:, :, 3] == 0) == (values == 0))
    assert np.count_nonzero(image[:, :, 3]) == f['statistics']['validPixels']
    assert np.all((values == 0) | ((values > 15000) & (values < 35000)))
    metadata = json.loads((root / 'frames' / (f['id'] + '.json')).read_text(encoding='utf-8'))
    qualities.add(metadata['qualityFlags'][0])
    assert metadata['qualityFlags'][0] == 0
    if previous is not None:
        changed = int(np.any(image != previous, axis=2).sum())
        assert changed > 0, 'Two adjacent delivered frames are identical'
        changed_pixels.append(changed)
    previous = image

report = {'passed': True, 'frames': len(observed), 'missingTimesUtc': missing,
          'startTimeUtc': observed[0], 'endTimeUtc': observed[-1], 'rawBytes': raw_total,
          'displayImageBytes': display_total, 'brightnessTemperatureDataBytes': data_total,
          'operationalQualityFlag1Values': sorted(qualities),
          'minimumAdjacentChangedPixels': min(changed_pixels),
          'checks': ['clock vs actual archive availability', 'all source and output SHA-256 hashes',
                     'frame dimensions/CRS/bbox', 'scan windows inside nominal 10-minute intervals',
                     'numeric nodata matches image alpha', 'valid radiometric range', 'all operation quality flags clear'],
          'independentReview': {'reviewer': 'real_weather_sources agent',
              'method': 'Independent ECEF-to-observation-angle calculation for six locations and independent micron-unit Planck calculation from raw DN for four output pixels.',
              'result': 'No header, unit, indexing or coordinate-transform defect found for the reviewed 00:00 sample.',
              'sampleKelvinNearHongKong': 231.95260, 'sampleQuantizedCentikelvin': 23195,
              'limit': 'Agreement of transform implementations is not measured absolute geolocation accuracy. Cloud parallax and instrument errors remain.'}}
(root / 'validation-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
