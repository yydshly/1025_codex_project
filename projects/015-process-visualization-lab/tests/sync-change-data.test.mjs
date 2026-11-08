import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateCloudChangeBundle, selectCloudChange } from '../app/sync-change-data.js';

const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const observed = read('../app/data/mangkhut-synchronized.json').clouds;
const wide = read('../research/high-frequency-clouds/wide-v10/himawari-b13-manifest.json');
const changes = read('../research/high-frequency-clouds/change-v11/manifest.json');
const copy = value => structuredClone(value);

function smallFixture() {
  const grid = { projection: 'EPSG:4326', bbox: [110, 10, 130, 30], width: 4, height: 3 };
  const times = ['2018-09-15T23:50:00Z', '2018-09-16T00:00:00Z', '2018-09-16T00:20:00Z', '2018-09-16T00:30:00Z'];
  const clouds = { ...grid, frames: times.map((timeUtc, i) => ({ ...grid, timeUtc, brightnessTemperatureData: { sha256: String(i + 1).repeat(64) } })) };
  const data = { ...grid, schemaVersion: 1, comparisonIntervalSeconds: 600, frames: [[0, 1], [2, 3]].map(([a, b]) => ({
    ...grid, fromTimeUtc: times[a], timeUtc: times[b], intervalSeconds: 600,
    url: 'delta-' + b + '.png', sha256: 'a'.repeat(64),
    sourceDataSHA256: { previous: clouds.frames[a].brightnessTemperatureData.sha256, current: clouds.frames[b].brightnessTemperatureData.sha256 },
  })) };
  return { data, clouds };
}

test('the real archive contains all 70 supported pairs and validates against both runtime and wide source grids without mutation', () => {
  const before = copy(changes);
  assert.equal(observed.frames.length, 72); assert.equal(changes.frames.length, 70);
  assert.equal(validateCloudChangeBundle(changes, observed), changes);
  assert.equal(validateCloudChangeBundle(changes, wide), changes);
  assert.deepEqual(changes, before);
  const at = selectCloudChange(changes, '2018-09-16T05:10:00.000Z');
  assert.equal(at.fromTimeUtc, '2018-09-16T05:00:00Z');
  assert.equal(at.sourceDataSHA256.current, observed.frames.find(f => f.timeUtc === at.timeUtc).brightnessTemperatureData.sha256);
});

test('exact selection returns no pair at start, missing frame, missing predecessor, intermediate seconds or outside coverage', () => {
  for (const time of ['2018-09-16T00:00:00Z', '2018-09-16T02:40:00Z', '2018-09-16T02:50:00Z', '2018-09-16T05:10:01Z', '2018-09-16T12:10:00Z']) {
    assert.equal(selectCloudChange(changes, time), null, time);
  }
  const actual = changes.frames.find(f => f.timeUtc === '2018-09-16T03:00:00Z');
  assert.equal(selectCloudChange(changes, '2018-09-16T03:00:00.000Z'), actual);
  assert.throws(() => selectCloudChange(changes, '2018-09-16T11:00:00+08:00'), /UTC/);
});

test('completeness follows actual source pairs across midnight and gaps rather than a hard-coded count', () => {
  const { data, clouds } = smallFixture();
  assert.equal(validateCloudChangeBundle(data, clouds), data);
  assert.equal(selectCloudChange(data, '2018-09-16T00:00:00Z'), data.frames[0]);
  assert.equal(selectCloudChange(data, '2018-09-16T00:10:00Z'), null);
  assert.equal(selectCloudChange(data, '2018-09-16T00:20:00Z'), null);
});

test('source hash mismatches or contradictory input provenance cannot be accepted', () => {
  for (const role of ['previous', 'current']) {
    const altered = copy(changes); altered.frames[0].sourceDataSHA256[role] = '0'.repeat(64);
    assert.throws(() => validateCloudChangeBundle(altered, observed), /source hash/);
    const conflicting = copy(changes); conflicting.frames[0].inputs[role].numericSHA256 = '0'.repeat(64);
    assert.throws(() => validateCloudChangeBundle(conflicting, observed), /provenance/);
  }
  const missing = copy(observed); delete missing.frames[0].brightnessTemperatureData.sha256;
  assert.throws(() => validateCloudChangeBundle(changes, missing), /SHA-256/);
});

test('twenty-minute bridging, reverse order and invented source scans are rejected', () => {
  const { data, clouds } = smallFixture();
  const gap = copy(data); gap.frames[1].fromTimeUtc = '2018-09-16T00:00:00Z'; gap.frames[1].timeUtc = '2018-09-16T00:20:00Z';
  assert.throws(() => validateCloudChangeBundle(gap, clouds), /exactly 10 minutes/);
  const invented = copy(data); invented.frames[1].fromTimeUtc = '2018-09-16T00:10:00Z'; invented.frames[1].timeUtc = '2018-09-16T00:20:00Z';
  assert.throws(() => validateCloudChangeBundle(invented, clouds), /actual source scans/);
  const reverse = copy(data); reverse.frames[0].fromTimeUtc = '2018-09-16T00:10:00Z';
  assert.throws(() => validateCloudChangeBundle(reverse, clouds), /exactly 10 minutes/);
});

test('previews, missing middle pairs, duplicates and unordered scans cannot masquerade as the complete archive', () => {
  for (const frames of [changes.frames.slice(0, 2), changes.frames.filter((_, i) => i !== 35)]) {
    assert.throws(() => validateCloudChangeBundle({ ...changes, frames }, observed), /Incomplete.*70/);
  }
  const duplicate = copy(changes); duplicate.frames.splice(1, 0, copy(duplicate.frames[0]));
  assert.throws(() => validateCloudChangeBundle(duplicate, observed), /ordered and unique/);
  const reversed = copy(changes); [reversed.frames[0], reversed.frames[1]] = [reversed.frames[1], reversed.frames[0]];
  assert.throws(() => validateCloudChangeBundle(reversed, observed), /ordered and unique/);
  const sourceDuplicate = copy(observed); sourceDuplicate.frames.splice(1, 0, copy(sourceDuplicate.frames[0]));
  assert.throws(() => validateCloudChangeBundle(changes, sourceDuplicate), /ordered and unique/);
});

test('bundle, pair and source geometry must all describe the same numeric raster grid', () => {
  for (const mutate of [
    d => { d.projection = 'EPSG:3857'; }, d => { d.bbox[0] += .01; }, d => { d.width /= 2; },
    d => { d.frames[0].height -= 1; }, d => { d.frames[0].bbox[3] -= .01; },
    d => { d.frames[0].projection = 'EPSG:3857'; }, d => { d.frames[0].width = '2048'; },
  ]) {
    const altered = copy(changes); mutate(altered);
    assert.throws(() => validateCloudChangeBundle(altered, observed), /grid/);
  }
  const source = copy(observed); source.frames[0].width = 1024;
  assert.throws(() => validateCloudChangeBundle(changes, source), /grid/);
  const emptyUrl = copy(changes); emptyUrl.frames[0].url = ' ';
  assert.throws(() => validateCloudChangeBundle(emptyUrl, observed), /URL/);
});
