import { utcMillis } from './sync-timeline.js';

const thresholds = {
  volcano: { thresholdK: 220, operator: '<' },
  storm: { thresholdK: 235, operator: '≤' },
  mangkhut: { thresholdK: 235, operator: '≤' },
};

// Compare neighboring supplied scans only. A known missing scan cuts the pair.
// The raster is built from their calibrated centikelvin inputs by build-cloud-comparison.py.
export function observedCloudComparison(frames, frame, kind, missingTimesUtc = []) {
  const threshold = Object.hasOwn(thresholds, kind) ? thresholds[kind] : null;
  if (!frame?.timeUtc || !threshold || !frames?.length) return null;
  const time = utcMillis(frame.timeUtc);
  const index = frames.findIndex(record => utcMillis(record.timeUtc) === time);
  if (index <= 0) return null;
  const fromTimeUtc = frames[index - 1].timeUtc;
  const start = utcMillis(fromTimeUtc);
  if (missingTimesUtc.some(value => start < utcMillis(value) && utcMillis(value) < time)) return null;
  if (kind === 'mangkhut' && time - start !== 600_000) return null;
  const stamp = new Date(time).toISOString().slice(0, 16).replaceAll(/[-:]/g, '');
  return { ...threshold, fromTimeUtc, timeUtc: frame.timeUtc, url: `assets/events/observed-cloud-comparison/${kind}-${stamp}Z.png` };
}
