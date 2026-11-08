import { utcMillis } from './sync-timeline.js';

const INTERVAL_MS = 600000;
const HASH = /^[a-f0-9]{64}$/i;

function hash(value, label) {
  if (typeof value !== 'string' || !HASH.test(value)) throw new TypeError(label + ' requires a SHA-256 digest.');
  return value.toLowerCase();
}

function bounds(value) {
  if (!Array.isArray(value) || value.length !== 4 || !value.every(Number.isFinite)) throw new TypeError('Invalid geographic bounds.');
  const [w, s, e, n] = value;
  if (w < -180 || e > 180 || w >= e || s < -90 || n > 90 || s >= n) throw new RangeError('Invalid geographic bounds.');
  return value;
}

function sameGrid(item, grid, label) {
  if (item?.projection !== 'EPSG:4326' || item.projection !== grid.projection ||
      !bounds(item.bbox).every((value, i) => value === grid.bbox[i]) ||
      !Number.isInteger(item.width) || !Number.isInteger(item.height) ||
      item.width <= 0 || item.height <= 0 || item.width !== grid.width || item.height !== grid.height) {
    throw new RangeError(label + ' grid must match the observed cloud projection, bounds and dimensions.');
  }
}

/** Validates metadata correspondence, not remote PNG bytes. The archive build verifies file hashes.
 * Completeness is derived from every pair of actual source scans exactly ten minutes apart;
 * this is 70 pairs in the full Mangkhut archive, with no comparison across its missing scan.
 * The object is returned unchanged, preserving provenance fields and original UTC spelling.
 */
export function validateCloudChangeBundle(data, clouds) {
  if (data?.schemaVersion !== 1 || data.comparisonIntervalSeconds !== 600 || !Array.isArray(data.frames)) {
    throw new TypeError('Expected a ten-minute cloud-change bundle, schema version 1.');
  }
  if (clouds?.projection !== 'EPSG:4326' || !Array.isArray(clouds.frames) || !clouds.frames.length) {
    throw new TypeError('Observed cloud frames are required.');
  }
  const grid = { projection: clouds.projection, bbox: bounds(clouds.bbox),
    width: clouds.width ?? clouds.frames[0].width, height: clouds.height ?? clouds.frames[0].height };
  sameGrid(data, grid, 'Change bundle');
  const source = new Map();
  let last = -Infinity;
  for (const frame of clouds.frames) {
    const time = utcMillis(frame.timeUtc);
    if (time <= last) throw new RangeError('Observed cloud frames must be ordered and unique.');
    last = time;
    sameGrid(frame, grid, 'Observed cloud frame');
    hash(frame.brightnessTemperatureData?.sha256, 'Numeric source');
    source.set(time, frame);
  }
  const expected = new Set([...source.keys()].filter(time => source.has(time - INTERVAL_MS)));
  last = -Infinity;
  for (const frame of data.frames) {
    const time = utcMillis(frame.timeUtc), from = utcMillis(frame.fromTimeUtc);
    if (time <= last) throw new RangeError('Change frames must be ordered and unique.');
    last = time;
    if (time - from !== INTERVAL_MS || frame.intervalSeconds !== 600) {
      throw new RangeError('A change pair must span exactly 10 minutes; gaps cannot be bridged.');
    }
    const previous = source.get(from), current = source.get(time);
    if (!previous || !current || !expected.has(time)) throw new RangeError('Both actual source scans must exist for each change pair.');
    sameGrid(frame, grid, 'Change frame');
    if (typeof frame.url !== 'string' || !frame.url.trim()) throw new TypeError('Change image URL is required.');
    const displayHash = hash(frame.sha256, 'Change image');
    if (frame.displaySHA256 !== undefined && hash(frame.displaySHA256, 'Display image') !== displayHash) {
      throw new TypeError('Display image hashes disagree.');
    }
    for (const [role, observed, timeValue] of [['previous', previous, from], ['current', current, time]]) {
      const expectedHash = hash(observed.brightnessTemperatureData.sha256, 'Numeric source');
      if (hash(frame.sourceDataSHA256?.[role], role + ' source') !== expectedHash) {
        throw new TypeError(role + ' source hash does not match the original brightness-temperature data.');
      }
      if (frame.inputs !== undefined) {
        const input = frame.inputs?.[role];
        if (utcMillis(input?.timeUtc) !== timeValue || hash(input?.numericSHA256, role + ' input') !== expectedHash) {
          throw new TypeError(role + ' input provenance disagrees with the paired source.');
        }
      }
    }
  }
  if (data.frames.length !== expected.size) {
    throw new RangeError('Incomplete cloud-change bundle: expected all ' + expected.size + ' valid pairs, received ' + data.frames.length + '.');
  }
  return data;
}

/** Exact UTC instant only. No nearest-neighbor selection, persistence or gap filling. */
export function selectCloudChange(data, timeUtc) {
  const target = utcMillis(timeUtc), frames = data.frames;
  let lo = 0, hi = frames.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (utcMillis(frames[mid].timeUtc) < target) lo = mid + 1;
    else hi = mid;
  }
  return lo < frames.length && utcMillis(frames[lo].timeUtc) === target ? frames[lo] : null;
}
