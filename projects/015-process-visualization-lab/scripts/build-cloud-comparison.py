"""Build display masks from neighboring registered Himawari B13 scans.

R = earlier cold area edge (up to two pixels inside its original boundary).
G = pixels newly below the display threshold. Both require paired valid data.
B = zero. The browser applies colors and presentation opacity to these channels.
"""

from datetime import datetime
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'app' / 'data'
OUTPUT = ROOT / 'app' / 'assets' / 'events' / 'observed-cloud-comparison'


def load_numeric(frame, kind):
    numeric = frame.get('numericData') or frame['brightnessTemperatureData']
    location = numeric.get('url') or numeric['researchFile']
    source = (DATA if kind == 'mangkhut' else ROOT) / location
    if hashlib.sha256(source.read_bytes()).hexdigest() != numeric['sha256']:
        raise ValueError(f'Source hash mismatch: {source}')
    if (numeric['scale'], numeric['unit'], numeric['nodata']) != (.01, 'K', 0):
        raise ValueError(f'Unsupported brightness encoding: {source}')
    with Image.open(source) as image:
        values = np.array(image)
    if values.shape != (frame['height'], frame['width']) or values.dtype != np.uint16:
        raise ValueError(f'Source grid mismatch: {source}')
    return values


def masks(previous, current, kind):
    valid = (previous != 0) & (current != 0)
    if kind == 'volcano':
        old, new = previous < 22000, current < 22000
    else:
        old, new = previous <= 23500, current <= 23500
    earlier_warm = Image.fromarray((valid & ~old).astype(np.uint8) * 255)
    warm_neighbor = np.array(earlier_warm.filter(ImageFilter.MaxFilter(5))) != 0
    rgb = np.zeros((*current.shape, 3), dtype=np.uint8)
    rgb[:, :, 0] = (valid & old & warm_neighbor) * 255
    rgb[:, :, 1] = (valid & new & ~old) * 255
    return Image.fromarray(rgb)


def build(kind, manifest):
    data = json.loads((DATA / manifest).read_text(encoding='utf-8'))
    frames = data['clouds']['frames'] if kind == 'mangkhut' else data['frames']
    missing = data.get('missingTimesUtc', [item['timeUtc'] for item in data.get('missingOriginalScans', [])])
    missing = [datetime.fromisoformat(value.replace('Z', '+00:00')) for value in missing]
    previous = previous_time = None
    written = 0
    for frame in frames:
        now = datetime.fromisoformat(frame['timeUtc'].replace('Z', '+00:00'))
        current = load_numeric(frame, kind)
        if previous is not None:
            seconds = (now - previous_time).total_seconds()
            if seconds <= 0:
                raise ValueError(f'{kind} frames must be strictly ordered')
            crosses_gap = any(previous_time < gap < now for gap in missing)
            if not crosses_gap and (kind != 'mangkhut' or seconds == 600):
                image = masks(previous, current, kind)
                image.save(OUTPUT / f'{kind}-{now:%Y%m%dT%H%M}Z.png', optimize=True)
                written += 1
        previous, previous_time = current, now
    print(f'{kind}: {written} registered scan pairs')


if __name__ == '__main__':
    OUTPUT.mkdir(parents=True, exist_ok=True)
    build('volcano', 'volcano-dynamic.json')
    build('storm', 'storm-dynamic.json')
    build('mangkhut', 'mangkhut-synchronized.json')
