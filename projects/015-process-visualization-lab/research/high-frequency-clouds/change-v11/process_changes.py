"""Display real fixed-grid B13 brightness-temperature differences; never infer flow."""
from __future__ import annotations
import argparse
import hashlib
import json
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / 'wide-v10'
COOLING_RGB = (76, 220, 238)
WARMING_RGB = (245, 177, 99)
THRESHOLD_CK, SATURATION_CK, COLD_SELECTION_CK = 400, 1200, 26500
ALPHA_SCALE = .65

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def stamp(text):
    return datetime.fromisoformat(text.replace('Z', '+00:00'))

def utc(value):
    return value.isoformat().replace('+00:00', 'Z')

def input_record(frame):
    data = frame['brightnessTemperatureData']
    path = SOURCE / data['url']
    if sha(path) != data['sha256']:
        raise ValueError('Numeric input SHA-256 mismatch: ' + str(path))
    values = np.asarray(Image.open(path))
    if values.shape != (1664, 2048) or values.dtype != np.uint16:
        raise ValueError('Expected the verified 2048 x 1664 uint16 centikelvin source')
    if data['unit'] != 'K' or data['scale'] != .01 or data['nodata'] != 0:
        raise ValueError('Numeric units or nodata changed')
    reference = {
        'timeUtc': frame['timeUtc'], 'numericUrl': '../wide-v10/' + data['url'],
        'numericSHA256': data['sha256'], 'numericBytes': path.stat().st_size,
        'rawSourceSHA256': frame['rawSHA256'], 'sourceUrl': frame['sourceUrl'],
        'scanStartUtc': frame['scanStartUtc'], 'scanEndUtc': frame['scanEndUtc'],
    }
    return values, reference

def make_pair(previous, current):
    if (stamp(current['timeUtc']) - stamp(previous['timeUtc'])).total_seconds() != 600:
        raise ValueError('Only adjacent real nominal scans exactly 600 seconds apart are comparable')
    if previous['bbox'] != current['bbox'] or previous['projection'] != current['projection']:
        raise ValueError('Input grids differ')
    before, from_source = input_record(previous)
    now, to_source = input_record(current)
    # Signed integer subtraction preserves the 0.01 K source representation and avoids uint16 wrap.
    delta_ck = now.astype(np.int32) - before.astype(np.int32)
    valid = (before != 0) & (now != 0)
    eligible = valid & ((before < COLD_SELECTION_CK) | (now < COLD_SELECTION_CK))
    amplitude = np.abs(delta_ck)
    transition = np.clip((amplitude.astype(np.float64) - THRESHOLD_CK) /
                         (SATURATION_CK - THRESHOLD_CK), 0, 1)
    display_alpha = np.rint(255 * ALPHA_SCALE * transition ** 2 * (3 - 2 * transition)).astype(np.uint8)
    display_alpha[~eligible] = 0
    visible = display_alpha > 0
    cooling, warming = visible & (delta_ck < 0), visible & (delta_ck > 0)
    rgba = np.zeros((*now.shape, 4), dtype=np.uint8)
    rgba[cooling, :3] = COOLING_RGB
    rgba[warming, :3] = WARMING_RGB
    rgba[:, :, 3] = display_alpha
    path = ROOT / 'frames' / ('b13-change-' + stamp(current['timeUtc']).strftime('%Y%m%dT%H%MZ') + '.png')
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba).save(path, optimize=True)
    qualified_cooling = eligible & (delta_ck <= -THRESHOLD_CK)
    qualified_warming = eligible & (delta_ck >= THRESHOLD_CK)
    statistics = {
        'validPairedPixels': int(valid.sum()), 'coldEligiblePixels': int(eligible.sum()),
        'qualifiedCoolingPixelsAtLeast4K': int(qualified_cooling.sum()),
        'qualifiedWarmingPixelsAtLeast4K': int(qualified_warming.sum()),
        'displayedCoolingPixels': int(cooling.sum()), 'displayedWarmingPixels': int(warming.sum()),
        'transparentPixels': int((~visible).sum()), 'maxDisplayAlphaByte': int(display_alpha.max()),
        'minimumDeltaK': float(delta_ck[valid].min() / 100),
        'maximumDeltaK': float(delta_ck[valid].max() / 100),
        'absDeltaPercentilesK': dict(zip(['p50', 'p90', 'p95', 'p99'],
            [round(float(x / 100), 4) for x in np.percentile(amplitude[valid], [50, 90, 95, 99])])),
    }
    image_hash = sha(path)
    return {
        'timeUtc': current['timeUtc'], 'fromTimeUtc': previous['timeUtc'], 'intervalSeconds': 600,
        'url': 'frames/' + path.name, 'width': 2048, 'height': 1664,
        'bbox': current['bbox'], 'projection': current['projection'],
        'sha256': image_hash, 'displaySHA256': image_hash, 'bytes': path.stat().st_size,
        'sourceDataSHA256': {'previous': from_source['numericSHA256'], 'current': to_source['numericSHA256']},
        'inputs': {'previous': from_source, 'current': to_source}, 'statistics': statistics,
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--times', nargs='*', help='Optional nominal UTC times, e.g. 2018-09-16T05:00:00Z')
    args = parser.parse_args()
    source_manifest = SOURCE / 'himawari-b13-manifest.json'
    source = json.loads(source_manifest.read_text(encoding='utf-8'))
    source_by_time = {f['timeUtc']: f for f in source['frames']}
    available_pairs, unavailable = [], []
    for current in source['frames']:
        wanted = utc(stamp(current['timeUtc']) - timedelta(minutes=10))
        previous = source_by_time.get(wanted)
        if previous is None:
            unavailable.append({'timeUtc': current['timeUtc'], 'requiredFromTimeUtc': wanted,
                                'reason': 'No real input frame exactly ten minutes earlier; comparison unavailable.'})
        else:
            available_pairs.append((previous, current))
    if len(available_pairs) != 70 or len(unavailable) != 2:
        raise ValueError('The verified source pair availability has changed; review before generating')
    selected = set(args.times) if args.times else None
    if selected is not None and not selected.issubset({p[1]['timeUtc'] for p in available_pairs}):
        raise ValueError('A requested time has no valid adjacent source pair')
    results = []
    for previous, current in available_pairs:
        if selected is None or current['timeUtc'] in selected:
            record = make_pair(previous, current)
            results.append(record)
            print(json.dumps({'timeUtc': record['timeUtc'], 'fromTimeUtc': record['fromTimeUtc'],
                              'bytes': record['bytes'], 'visiblePixels': record['statistics']['displayedCoolingPixels'] +
                              record['statistics']['displayedWarmingPixels']}), flush=True)
    path = ROOT / 'manifest.json'
    old = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {'frames': []}
    by_time = {f['timeUtc']: f for f in old['frames']}
    by_time.update({f['timeUtc']: f for f in results})
    manifest = {
        'schemaVersion': 1, 'version': 'change-v11',
        'kind': 'derived fixed-grid brightness-temperature difference display',
        'label': '10-minute fixed-grid infrared brightness-temperature change',
        'sourceManifest': '../wide-v10/himawari-b13-manifest.json',
        'sourceManifestSHA256': sha(source_manifest), 'pipelineSHA256': sha(Path(__file__)),
        'formula': 'deltaK = (currentUint16 - previousUint16) * 0.01; signed subtraction before conversion',
        'inputQuantizationStepK': .01, 'comparisonIntervalSeconds': 600,
        'timeMeaning': 'Exactly adjacent nominal scan times; actual scan windows are retained for both inputs.',
        'projection': 'EPSG:4326', 'bbox': [85, -10, 165, 55], 'width': 2048, 'height': 1664,
        'processing': {
            'validity': 'Both source values must be nonzero.',
            'selection': {'description': 'Colder-region display selection, not a cloud mask',
                          'eitherTemperatureBelowK': 265},
            'display': {'coolingRgb': list(COOLING_RGB), 'warmingRgb': list(WARMING_RGB),
                        'transitionStartAbsDeltaK': 4, 'transitionEndAbsDeltaK': 12,
                        'alphaFunction': 'round(255 * 0.65 * smoothstep(4,12,abs(deltaK)))',
                        'maxAlphaByte': 166, 'at4KAlphaIsZero': True,
                        'edgeExtraction': False, 'noiseAdded': False,
                        'spatialFiltering': False, 'temporalInterpolation': False},
            'rawDeltaStorage': 'Not duplicated; exactly reproducible from the two retained uint16 input images.',
        },
        'unavailableComparisons': unavailable,
        'currentFrameMissingTimesUtc': source['missingTimesUtc'],
        'limitations': ['This is a change in brightness temperature at fixed geographic grid cells, not tracking of the same cloud parcel.',
                       'It is not wind, cloud motion velocity, flow direction, cloud growth, rainfall, or cloud optical thickness.',
                       'Changes can include displacement of radiating features, temperature changes and observation/geolocation effects.',
                       'The 265 K selection and 4–12 K opacity ramp are display choices, not cloud detection or confidence values.'],
        'credit': source['credit'], 'source': source['source'],
        'frames': sorted(by_time.values(), key=lambda f: f['timeUtc']),
    }
    temporary = path.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary.replace(path)

if __name__ == '__main__':
    main()
