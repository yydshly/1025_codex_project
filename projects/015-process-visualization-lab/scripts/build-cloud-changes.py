"""Package the validated real 10-minute B13 difference overlays for the local app."""
from __future__ import annotations
import copy
import hashlib
import json
import re
import shutil
import struct
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / 'research/high-frequency-clouds/change-v11'
WIDE = ROOT / 'research/high-frequency-clouds/wide-v10'
ASSETS = ROOT / 'app/assets/events/himawari8-change-v11'
OUTPUT = ROOT / 'app/data/mangkhut-cloud-changes.json'

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def require(condition, message):
    if not condition:
        raise ValueError(message)

def timestamp(value):
    require(isinstance(value, str) and value.endswith('Z'), 'An explicit UTC timestamp is required')
    return datetime.fromisoformat(value.replace('Z', '+00:00'))

def main():
    manifest_path = RESEARCH / 'manifest.json'
    report_path = RESEARCH / 'validation-report.json'
    manifest, report = read(manifest_path), read(report_path)
    source_path = WIDE / 'himawari-b13-manifest.json'
    wide = read(source_path)
    require(report.get('passed') is True and report.get('pairs') == 70, 'A passed full 70-pair validation report is required')
    require(len(manifest.get('frames', [])) == 70, 'Do not package a preview or incomplete comparison sequence')
    require(sha(source_path) == manifest['sourceManifestSHA256'], 'The numeric source manifest changed after derivation')
    require(sha(RESEARCH / 'process_changes.py') == manifest['pipelineSHA256'], 'The recorded derivation script hash changed')
    require(manifest['bbox'] == [85, -10, 165, 55] and manifest['projection'] == 'EPSG:4326', 'Unexpected geographic grid')
    require((manifest['width'], manifest['height']) == (2048, 1664), 'Unexpected display dimensions')
    require(manifest['currentFrameMissingTimesUtc'] == ['2018-09-16T02:40:00Z'], 'The real source gap must be retained')
    require([r['timeUtc'] for r in manifest['unavailableComparisons']] ==
            ['2018-09-16T00:00:00Z', '2018-09-16T02:50:00Z'], 'Unavailable comparisons changed')
    observed = {f['timeUtc']: f for f in wide['frames']}
    plan, verified_numeric, seen = [], set(), set()
    previous_stamp = None
    for frame in manifest['frames']:
        current, before = timestamp(frame['timeUtc']), timestamp(frame['fromTimeUtc'])
        require((current - before).total_seconds() == 600 and frame['intervalSeconds'] == 600, 'Comparison bridges a gap or uses the wrong interval')
        require(previous_stamp is None or current > previous_stamp, 'Comparisons must be ordered and unique')
        previous_stamp = current
        require(frame['timeUtc'] in observed and frame['fromTimeUtc'] in observed, 'A comparison references an invented source scan')
        require(frame['timeUtc'] not in seen, 'Duplicate comparison')
        seen.add(frame['timeUtc'])
        require(frame['bbox'] == manifest['bbox'] and frame['projection'] == manifest['projection'] and
                (frame['width'], frame['height']) == (2048, 1664), 'Pair grid differs from manifest grid')
        for role, when in [('previous', frame['fromTimeUtc']), ('current', frame['timeUtc'])]:
            source, provenance = observed[when], frame['inputs'][role]
            numeric = source['brightnessTemperatureData']
            require(frame['sourceDataSHA256'][role] == provenance['numericSHA256'] == numeric['sha256'], 'Numeric source provenance mismatch')
            require(provenance['rawSourceSHA256'] == source['rawSHA256'] and provenance['sourceUrl'] == source['sourceUrl'], 'Raw source provenance mismatch')
            require(provenance['scanStartUtc'] == source['scanStartUtc'] and provenance['scanEndUtc'] == source['scanEndUtc'], 'Actual scan windows changed')
            if numeric['sha256'] not in verified_numeric:
                require(sha(WIDE / numeric['url']) == numeric['sha256'], 'Numeric input file hash mismatch')
                verified_numeric.add(numeric['sha256'])
        require(re.fullmatch(r'frames/b13-change-20180916T\d{4}Z\.png', frame['url']) is not None, 'Unexpected asset path')
        source = RESEARCH / frame['url']
        target = ASSETS / Path(frame['url']).name
        # A compact delivered project may retain the already packaged asset instead of two copies.
        if not source.exists():
            source = target
        require(source.exists(), 'Required derived display asset is missing: ' + frame['url'])
        require(sha(source) == frame['displaySHA256'] == frame['sha256'], 'Derived display hash mismatch')
        require(source.stat().st_size == frame['bytes'], 'Derived display byte count mismatch')
        with source.open('rb') as handle:
            header = handle.read(26)
        require(header[:8] == b'\x89PNG\r\n\x1a\n' and header[12:16] == b'IHDR', 'Invalid PNG header')
        require(struct.unpack('>II', header[16:24]) == (2048, 1664) and header[24:26] == bytes([8, 6]), 'Expected 8-bit RGBA PNG')
        plan.append((frame, source, target))
    require(len(verified_numeric) == 72, 'Expected all 72 original numeric inputs')
    total_bytes = sum(frame['bytes'] for frame, _, _ in plan)
    require(total_bytes == report['displayImageBytes'], 'The validated output byte total changed')

    ASSETS.mkdir(parents=True, exist_ok=True)
    copied = 0
    bundle = copy.deepcopy(manifest)
    for packaged, (original, source, target) in zip(bundle['frames'], plan):
        if not target.exists() or sha(target) != original['sha256']:
            shutil.copyfile(source, target)
            copied += 1
        require(sha(target) == original['sha256'], 'Packaged asset failed checksum verification')
        packaged['url'] = 'assets/events/himawari8-change-v11/' + target.name
    bundle['provenanceRoot'] = 'research/high-frequency-clouds/change-v11/'
    bundle['packaging'] = {
        'frameUrlRoot': 'app/',
        'relativeProvenancePaths': 'Resolve sourceManifest and inputs.*.numericUrl against provenanceRoot, relative to the project root.',
        'researchManifestPath': 'research/high-frequency-clouds/change-v11/manifest.json',
        'researchManifestSHA256': sha(manifest_path),
        'validationReportPath': 'research/high-frequency-clouds/change-v11/validation-report.json',
        'validationReportSHA256': sha(report_path),
        'verifiedPairs': 70, 'verifiedNumericInputs': 72, 'displayImageBytes': total_bytes,
        'displayColorSpace': 'sRGB RGB with independent alpha; not a brightness-temperature encoding',
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temporary = OUTPUT.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(OUTPUT)
    print(json.dumps({'frames': 70, 'verifiedNumericInputs': 72, 'copiedAssets': copied,
                      'verifiedAssetBytes': total_bytes, 'output': str(OUTPUT)}, ensure_ascii=False))

if __name__ == '__main__':
    main()
