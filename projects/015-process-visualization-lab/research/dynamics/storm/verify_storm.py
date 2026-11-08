"""Audit delivered frames against source HSD counts, UTC and original JMA rows."""
import json, math
from datetime import datetime
from pathlib import Path
import numpy as np
from PIL import Image
import process_storm as p

def stamp(value): return datetime.fromisoformat(value.replace('Z', '+00:00')).timestamp()
data = json.loads((p.PROJECT / 'app/data/storm-dynamic.json').read_text(encoding='utf8'))
assert len(data['frames']) == 23 and len(data['track']) == 4
assert data['frames'][0]['timeUtc'] == p.START and data['frames'][-1]['timeUtc'] == p.END
times = [stamp(f['timeUtc']) for f in data['frames']]
assert all(b - a in (1200, 1800) for a, b in zip(times, times[1:]))
assert '2022-09-05T10:00:00Z' not in [f['timeUtc'] for f in data['frames']]
assert all(s['samples'] == [{'timeUtc': r['timeUtc'], 'value': r[s['id']]} for r in data['track']] for s in data['series'] if s['id'] in ('windKt', 'pressureHpa'))
source_lines = (p.ROOT / 'hinnamnor-jma-source.txt').read_text(encoding='ascii').splitlines()
for record in data['track']:
    line = source_lines[record['sourceLine'] - 1]
    assert record['pressureHpa'] == int(line[24:28]) and record['windKt'] == int(line[33:36])
    assert record['lat'] == int(line[15:18]) / 10 and record['lon'] == int(line[19:23]) / 10

maximum_temperature_error = 0; checked_pixels = 0; hashes = set(); total_missing = 0; coordinate_error = 0
west, south, east, north = p.BBOX
areas = 6371.0088 ** 2 * math.radians((east - west) / p.WIDTH) * (np.sin(np.deg2rad(north - np.arange(p.HEIGHT) * (north - south) / p.HEIGHT)) - np.sin(np.deg2rad(north - (np.arange(p.HEIGHT) + 1) * (north - south) / p.HEIGHT)))
for frame in data['frames']:
    image_path = p.PROJECT / 'app' / frame['url']; assert p.sha(image_path) == frame['sha256']; hashes.add(frame['sha256'])
    rgba = np.asarray(Image.open(image_path)); assert rgba.shape == (p.HEIGHT, p.WIDTH, 4)
    assert np.array_equal(rgba[:, :, 0], rgba[:, :, 1]) and np.array_equal(rgba[:, :, 1], rgba[:, :, 2])
    numeric_path = p.PROJECT / frame['numericData']['researchFile']; assert p.sha(numeric_path) == frame['numericData']['sha256']
    numeric = np.asarray(Image.open(numeric_path)); valid = numeric > 0; tb = numeric.astype(float) * .01
    assert np.array_equal(rgba[:, :, 3] > 0, valid)
    gray = np.rint(np.clip((310 - tb) / 130, 0, 1) * 255).astype(int)
    assert np.max(np.abs(rgba[:, :, 0][valid].astype(int) - gray[valid])) <= 1
    for key, actual in [('minK', tb[valid].min()), ('maxK', tb[valid].max()), ('meanK', tb[valid].mean()), ('p10K', np.percentile(tb[valid], 10)), ('p50K', np.percentile(tb[valid], 50))]:
        assert abs(frame['stats'][key] - actual) <= .00501
    lower = float(np.sum((valid & (tb < 235)).sum(axis=1) * areas)); upper = float(np.sum((valid & (tb <= 235)).sum(axis=1) * areas))
    assert lower - 1e-6 <= frame['stats']['below235KAreaKm2'] <= upper + 1e-6
    nominal = stamp(frame['timeUtc']); assert nominal <= stamp(frame['scanStartUtc']) < stamp(frame['scanEndUtc']) < nominal + 600
    hm = frame['timeUtc'][11:13] + frame['timeUtc'][14:16]
    metadata = json.loads((p.META / f'hinnamnor-b13-20220905T{hm}Z.json').read_text(encoding='utf8'))
    sources = [p.load_segment(p.ROOT / item['rawFile']) for item in metadata['sourceSegments']]
    for (_, source), recorded in zip(sources, metadata['sourceSegments']):
        assert source['rawSHA256'] == recorded['rawSHA256'] and source['errorLineCount'] == 0
    coordinate_error = max(coordinate_error, *(c['roundTripMaxErrorDegrees'] for c in metadata['coordinateChecks']))
    # Scalar Planck formula independently checks geographically selected source counts.
    for row in np.linspace(0, p.HEIGHT - 1, 10).astype(int):
        for column in np.linspace(0, p.WIDTH - 1, 12).astype(int):
            lon = west + (column + .5) * (east - west) / p.WIDTH; lat = north - (row + .5) * (north - south) / p.HEIGHT
            native_column, native_row, seen = p.base.geo_to_native(np.array(lon), np.array(lat), sources[0][1]['projection']); assert seen
            native_column = int(np.rint(native_column)) - 1; native_row = int(np.rint(native_row))
            counts, source = next((counts, source) for counts, source in sources if source['firstLine1Based'] <= native_row < source['firstLine1Based'] + source['nativeLines'])
            count = int(counts[native_row - source['firstLine1Based'], native_column]); calibration = source['calibration']; radiance = count * calibration['gain'] + calibration['offset']
            if count in calibration['invalidCountValues'] or radiance <= 0: assert not valid[row, column]; continue
            wavelength = calibration['wavelengthMicrometers'] * 1e-6
            te = calibration['planckConstant'] * calibration['speedOfLight'] / (calibration['boltzmannConstant'] * wavelength * math.log(1 + 2 * calibration['planckConstant'] * calibration['speedOfLight'] ** 2 / (wavelength ** 5 * radiance * 1e6)))
            expected = calibration['c0'] + calibration['c1'] * te + calibration['c2'] * te * te
            error = abs(expected - tb[row, column]); assert error <= .00501; maximum_temperature_error = max(maximum_temperature_error, error); checked_pixels += 1
    total_missing += int((~valid).sum()); assert frame['stats']['missingPixels'] == int((~valid).sum())

assert len(hashes) == len(data['frames']), 'independent observations must not be duplicated as replacement frames'
report = {'passed': True, 'frames': len(data['frames']), 'sourceSegments': 46, 'originalTrackRecords': len(data['track']), 'independentScalarCalibrationSamples': checked_pixels, 'maximumCentikelvinQuantizationErrorK': maximum_temperature_error, 'maximumCoordinateRoundTripErrorDegrees': coordinate_error, 'totalMissingPixels': total_missing, 'uniqueDisplayHashes': len(hashes), 'actualFrameIntervalSeconds': sorted(set(b - a for a, b in zip(times, times[1:]))), 'checks': ['original HSD SHA256 and segment row ownership', 'scalar source counts → radiance → Planck → corrected brightness temperature', 'geographic forward/inverse navigation', 'uint16 numeric retention and fixed grayscale encoding', 'all frame UTC and source-segment scan intervals', 'same-frame statistics including area quantization bounds', 'JMA original rows and time series without interpolated records']}
p.write_json(p.ROOT / 'validation-report.json', report)
print(json.dumps(report, ensure_ascii=False, indent=2))
