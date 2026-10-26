"""Render this project's original ambient composition, with no external samples.

Requires Python + NumPy. Encoding the browser OGG is a separate ffmpeg step.
The tail wraps into the next phrase so the 64-beat master is a continuous loop.
"""
from pathlib import Path
import json
import wave
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'audio'
SCORE = json.loads((OUT / 'score.json').read_text(encoding='utf-8'))
RATE = 32000
BEAT = 60 / SCORE['bpm']
LENGTH = round(SCORE['beats'] * BEAT * RATE)
rng = np.random.default_rng(SCORE['seed'])
mix = np.zeros((LENGTH, 2), dtype=np.float64)


def add(signal, start, pan=0):
    indices = (round(start * RATE) + np.arange(len(signal))) % LENGTH
    angle = (pan + 1) * np.pi / 4
    np.add.at(mix[:, 0], indices, signal * np.cos(angle))
    np.add.at(mix[:, 1], indices, signal * np.sin(angle))


def frequency(note):
    return 440 * 2 ** ((note - 69) / 12)


def piano(note, velocity, start, pan):
    t = np.arange(round(RATE * 7.5)) / RATE
    signal = np.zeros_like(t)
    hz = frequency(note)
    for partial, amplitude, decay in [(1, 1, 2.5), (2.001, .25, 1.5), (3.004, .10, .85), (4.009, .032, .6), (5.014, .009, .35)]:
        wavelet = np.sin(2 * np.pi * hz * partial * t)
        signal += amplitude * wavelet * np.exp(-t / decay)
    # A gentle two-string beating, rather than a bright electronic bell.
    signal += .17 * np.sin(2 * np.pi * hz * 1.0012 * t) * np.exp(-t / 2.3)
    attack = 1 - np.exp(-t / .014)
    release = np.minimum(1, np.maximum(0, (7.5 - t) / .6))
    signal *= attack * release * velocity * .24
    add(signal, start, pan)


for chord in SCORE['chords']:
    start = chord['beat'] * BEAT
    t = np.arange(round(RATE * (8 * BEAT + 4))) / RATE
    attack = 1 - np.exp(-t / 2.4)
    release = np.exp(-np.maximum(0, t - 7 * BEAT) / 1.8)
    tail = np.minimum(1, np.maximum(0, (t[-1] - t) / .8))
    for j, note in enumerate(chord['notes']):
        hz = frequency(note)
        signal = np.sin(2 * np.pi * hz * t + .12 * np.sin(t * .37 + j))
        signal += .16 * np.sin(2 * np.pi * hz * 2.0006 * t)
        add(signal * attack * release * tail * .027, start, (j / 3 - .5) * .6)
    piano(chord['notes'][0] - 12, .29, start + .12, -.15)

for beat, note, velocity in SCORE['melody']:
    piano(note, velocity, beat * BEAT + rng.uniform(-.018, .018), rng.uniform(-.28, .28))

# Dark diffuse room reflections: low-passed, gently decorrelated stereo taps.
dry = mix.copy()
for delay, gain, cross in [(.137, .16, True), (.283, .12, False), (.461, .10, True), (.719, .07, False), (1.131, .045, True), (1.729, .026, False), (2.371, .015, True)]:
    shifted = np.roll(dry[:, ::-1] if cross else dry, round(delay * RATE), axis=0)
    smoothed = sum(np.roll(shifted, offset, axis=0) for offset in range(7)) / 7
    mix += smoothed * gain

# Remove DC and normalize to a restrained but audible master.
mix -= mix.mean(axis=0)
mix *= .72 / max(float(np.abs(mix).max()), 1e-9)
pcm = np.round(np.clip(mix, -1, 1) * 32767).astype('<i2')
OUT.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUT / 'paper-home-master.wav'), 'wb') as file:
    file.setnchannels(2)
    file.setsampwidth(2)
    file.setframerate(RATE)
    file.writeframes(pcm.tobytes())

# A faded 36-second listening sample; the runtime uses the full seamless loop.
preview = mix[:36 * RATE].copy()
preview[:RATE] *= np.linspace(0, 1, RATE)[:, None]
preview[-2 * RATE:] *= np.linspace(1, 0, 2 * RATE)[:, None]
with wave.open(str(OUT / 'paper-home-preview.wav'), 'wb') as file:
    file.setnchannels(2)
    file.setsampwidth(2)
    file.setframerate(RATE)
    file.writeframes(np.round(preview * 32767).astype('<i2').tobytes())

metrics = {'title': SCORE['title'], 'bpm': SCORE['bpm'], 'durationSeconds': LENGTH / RATE,
           'sampleRate': RATE, 'channels': 2, 'peak': float(np.abs(mix).max()),
           'rms': float(np.sqrt(np.mean(mix ** 2))), 'loopBoundaryDelta': float(np.max(np.abs(mix[0] - mix[-1]))),
           'melodyNotes': len(SCORE['melody']), 'chords': len(SCORE['chords']),
           'source': 'Original note sequence and additive synthesis; no recordings, external music or AI audio service.'}
(OUT / 'render-metrics.json').write_text(json.dumps(metrics, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(metrics, ensure_ascii=False))
