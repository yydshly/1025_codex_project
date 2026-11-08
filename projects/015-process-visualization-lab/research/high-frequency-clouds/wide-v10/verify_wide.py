"""Validate the wider rasters against the preserved source and original event clock."""
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parent
base = root.parent
manifest = json.loads((root / 'himawari-b13-manifest.json').read_text(encoding='utf-8'))
original = json.loads((base / 'himawari-b13-manifest.json').read_text(encoding='utf-8'))
config = json.loads((root / 'processing-config.json').read_text(encoding='utf-8'))
digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
assert digest(base / 'process_himawari.py') == config['basePipelineSha256']
assert digest(root / 'process_himawari.py') == config['pipelineSha256']
assert manifest['missingTimesUtc'] == original['missingTimesUtc'] == ['2018-09-16T02:40:00Z']
assert len(manifest['frames']) == len(original['frames']) == 72
assert [f['timeUtc'] for f in manifest['frames']] == [f['timeUtc'] for f in original['frames']]
reference = {f['timeUtc']: f for f in original['frames']}
display_bytes = data_bytes = missing_pixels = 0
previous = None
changes = []
for frame in manifest['frames']:
    ref = reference[frame['timeUtc']]
    for key in ('sourceUrl', 'rawSHA256', 'rawBytes', 'scanStartUtc', 'scanEndUtc'):
        assert frame[key] == ref[key], (key, frame['timeUtc'])
    assert frame['bbox'] == [85, -10, 165, 55] and frame['projection'] == 'EPSG:4326'
    assert frame['width'] == 2048 and frame['height'] == 1664
    assert digest(root / frame['rawFile']) == ref['rawSHA256']
    picture = root / frame['url']
    numeric = root / frame['brightnessTemperatureData']['url']
    assert digest(picture) == frame['sha256']
    assert digest(numeric) == frame['brightnessTemperatureData']['sha256']
    rgba = np.asarray(Image.open(picture))
    values = np.asarray(Image.open(numeric))
    assert rgba.shape == (1664, 2048, 4) and values.shape == (1664, 2048)
    assert np.array_equal(rgba[:, :, 0], rgba[:, :, 1]) and np.array_equal(rgba[:, :, 0], rgba[:, :, 2])
    assert np.all((rgba[:, :, 3] == 0) == (values == 0))
    assert np.count_nonzero(rgba[:, :, 3]) == frame['statistics']['validPixels']
    assert np.all((values == 0) | ((values > 15000) & (values < 35000)))
    metadata = json.loads((root / 'frames' / (frame['id'] + '.json')).read_text(encoding='utf-8'))
    assert metadata['qualityFlags'][0] == 0
    assert metadata['navigationCorrection']['allShiftsZero']
    assert all(c['roundTripMaxErrorDegrees'] < 1e-7 for c in frame['coordinateChecks'])
    if previous is not None:
        changed = int(np.any(previous != rgba, axis=2).sum())
        assert changed > 0
        changes.append(changed)
    previous = rgba
    display_bytes += picture.stat().st_size
    data_bytes += numeric.stat().st_size
    missing_pixels += frame['statistics']['missingPixels']
report = {
    'passed': True, 'version': 'wide-v10', 'frames': 72,
    'bbox': [85, -10, 165, 55], 'width': 2048, 'height': 1664,
    'startTimeUtc': manifest['frames'][0]['timeUtc'], 'endTimeUtc': manifest['frames'][-1]['timeUtc'],
    'missingTimesUtc': manifest['missingTimesUtc'], 'newDownloads': 0,
    'displayImageBytes': display_bytes, 'brightnessTemperatureDataBytes': data_bytes,
    'totalMissingSpatialPixelsAcrossFrames': missing_pixels,
    'minimumAdjacentChangedPixels': min(changes),
    'sourceIdentity': 'Every source SHA-256, source URL, nominal time and full-scan start/end equals the original 72-frame package.',
    'originalPipelineUnchanged': True,
    'checks': ['all source and output SHA-256 hashes', 'same real clock and missing time',
               'fixed wider geographic extent and image dimensions', 'nodata and alpha consistency',
               'temperature range and unchanged operation quality', 'all corners pass numerical transform checks'],
    'limitations': ['Transform consistency is not a claim of absolute geolocation precision.',
                    'Cloud parallax remains uncorrected.',
                    'No feathering or brightness-to-opacity mapping is baked into the scientific rasters.'],
}
(root / 'validation-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
