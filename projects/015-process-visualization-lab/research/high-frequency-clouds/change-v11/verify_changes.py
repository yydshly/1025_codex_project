"""Validate every displayed difference pixel against its two real uint16 inputs."""
import hashlib
import json
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parent
source_root = root.parent / 'wide-v10'
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
parse = lambda text: datetime.fromisoformat(text.replace('Z', '+00:00'))
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
source_manifest = source_root / 'himawari-b13-manifest.json'
source = json.loads(source_manifest.read_text(encoding='utf-8'))
assert sha(source_manifest) == manifest['sourceManifestSHA256']
assert sha(root / 'process_changes.py') == manifest['pipelineSHA256']
by_time = {f['timeUtc']: f for f in source['frames']}
expected = [f['timeUtc'] for f in source['frames']
            if (parse(f['timeUtc']) - timedelta(minutes=10)).isoformat().replace('+00:00', 'Z') in by_time]
assert [f['timeUtc'] for f in manifest['frames']] == expected and len(expected) == 70
assert [f['timeUtc'] for f in manifest['unavailableComparisons']] == ['2018-09-16T00:00:00Z', '2018-09-16T02:50:00Z']
assert manifest['currentFrameMissingTimesUtc'] == ['2018-09-16T02:40:00Z']
sizes = []
maximum_alpha_error = 0
source_hashes = set()
visible_counts = []
for frame in manifest['frames']:
    assert (parse(frame['timeUtc']) - parse(frame['fromTimeUtc'])).total_seconds() == 600
    assert frame['intervalSeconds'] == 600 and frame['bbox'] == [85, -10, 165, 55]
    assert frame['projection'] == 'EPSG:4326' and frame['width'] == 2048 and frame['height'] == 1664
    arrays = []
    for which, when in [('previous', frame['fromTimeUtc']), ('current', frame['timeUtc'])]:
        ref = by_time[when]
        provenance = frame['inputs'][which]
        numeric = source_root / ref['brightnessTemperatureData']['url']
        assert sha(numeric) == provenance['numericSHA256'] == ref['brightnessTemperatureData']['sha256']
        assert provenance['rawSourceSHA256'] == ref['rawSHA256']
        assert provenance['sourceUrl'] == ref['sourceUrl']
        assert provenance['scanStartUtc'] == ref['scanStartUtc'] and provenance['scanEndUtc'] == ref['scanEndUtc']
        source_hashes.add(provenance['numericSHA256'])
        arrays.append(np.asarray(Image.open(numeric)).astype(np.int32))
    before, now = arrays
    delta = now - before
    validity = (before != 0) & (now != 0)
    eligible = validity & ((before < 26500) | (now < 26500))
    overlay_path = root / frame['url']
    assert sha(overlay_path) == frame['sha256'] == frame['displaySHA256']
    assert overlay_path.stat().st_size == frame['bytes']
    overlay = np.asarray(Image.open(overlay_path))
    assert overlay.shape == (1664, 2048, 4)
    alpha = overlay[:, :, 3]
    visible = alpha > 0
    assert not np.any(visible & (~eligible | (np.abs(delta) <= 400)))
    assert np.all(overlay[~visible, :3] == 0)
    assert np.all(overlay[visible & (delta < 0), :3] == [76, 220, 238])
    assert np.all(overlay[visible & (delta > 0), :3] == [245, 177, 99])
    # Independent integer-rational form of 255 * .65 * smoothstep(4,12,abs(delta)).
    u = np.clip(np.abs(delta).astype(np.int64) - 400, 0, 800)
    numerator = 3315 * (2400 * u * u - 2 * u * u * u)
    denominator = 10240000000
    expected_alpha = np.floor_divide(numerator + denominator // 2, denominator)
    expected_alpha[~eligible] = 0
    alpha_error = int(np.abs(alpha.astype(np.int64) - expected_alpha).max())
    assert alpha_error <= 1, 'Display ramp differs from the declared smoothstep mapping'
    maximum_alpha_error = max(maximum_alpha_error, alpha_error)
    stats = frame['statistics']
    assert stats['validPairedPixels'] == int(validity.sum())
    assert stats['coldEligiblePixels'] == int(eligible.sum())
    assert stats['qualifiedCoolingPixelsAtLeast4K'] == int((eligible & (delta <= -400)).sum())
    assert stats['qualifiedWarmingPixelsAtLeast4K'] == int((eligible & (delta >= 400)).sum())
    assert stats['displayedCoolingPixels'] == int((visible & (delta < 0)).sum())
    assert stats['displayedWarmingPixels'] == int((visible & (delta > 0)).sum())
    assert stats['transparentPixels'] == int((~visible).sum())
    assert stats['maxDisplayAlphaByte'] == int(alpha.max()) <= 166
    sizes.append(frame['bytes'])
    visible_counts.append(int(visible.sum()))
report = {
    'passed': True, 'version': 'change-v11', 'pairs': len(expected), 'distinctNumericInputs': len(source_hashes),
    'displayImageBytes': sum(sizes), 'minimumFrameBytes': min(sizes), 'maximumFrameBytes': max(sizes),
    'noComparisonTimesUtc': ['2018-09-16T00:00:00Z', '2018-09-16T02:50:00Z'],
    'currentFrameMissingTimesUtc': ['2018-09-16T02:40:00Z'],
    'maximumAlphaErrorVsIndependentRationalFormulaBytes': maximum_alpha_error,
    'minimumDisplayedPixelCount': min(visible_counts), 'maximumDisplayedPixelCount': max(visible_counts),
    'checks': ['exact 600-second pairing against observed frame registry; no crossing the gap',
               'all numeric-input and output SHA-256 hashes', 'same EPSG:4326 grid',
               'every nontransparent pixel passes validity, cold-region selection and signed-change threshold',
               'every displayed color agrees with the exact signed uint16-derived difference',
               'all alpha values checked against an independent integer-rational expression',
               'all signed and displayed-pixel statistics independently recomputed',
               'source manifest hash unchanged'],
    'scope': 'Validation of a derived visualization, not validation of cloud tracking or wind retrieval.',
}
(root / 'validation-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
