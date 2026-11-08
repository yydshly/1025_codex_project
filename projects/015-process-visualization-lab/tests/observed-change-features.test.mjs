import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';

const project = new URL('../', import.meta.url);
const file = relative => new URL(relative, project);
const bytes = relative => readFileSync(file(relative));
const json = relative => JSON.parse(bytes(relative));
const features = json('app/data/observed-change-features.json');
const source = { volcano: json('app/data/volcano-dynamic.json'), storm: json('app/data/storm-dynamic.json') };
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const radius = 6371.0088;
function distance(lon, lat, center) {
  const radians = degrees => degrees * Math.PI / 180;
  const a = Math.sin(radians(lat - center.lat) / 2) ** 2 + Math.cos(radians(lat)) * Math.cos(radians(center.lat)) * Math.sin(radians(lon - center.lon) / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))));
}

// Independent minimal PNG reader for archived16-bit grayscale numeric rasters, not display PNGs.
function numericPNG(buffer) {
  assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const width = buffer.readUInt32BE(16), height = buffer.readUInt32BE(20);
  assert.equal(buffer[24], 16); assert.equal(buffer[25], 0); assert.equal(buffer[28], 0);
  const chunks = [];
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset), type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    if (type === 'IDAT') chunks.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const packed = inflateSync(Buffer.concat(chunks)), stride = width * 2;
  assert.equal(packed.length, (stride + 1) * height);
  const decoded = Buffer.alloc(stride * height);
  const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  for (let row = 0; row < height; row++) {
    const start = row * (stride + 1), filter = packed[start];
    assert.ok(filter <= 4);
    for (let column = 0; column < stride; column++) {
      const target = row * stride + column;
      const left = column >= 2 ? decoded[target - 2] : 0, up = row ? decoded[target - stride] : 0, diagonal = row && column >= 2 ? decoded[target - stride - 2] : 0;
      const prediction = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, diagonal);
      decoded[target] = (packed[start + 1 + column] + prediction) & 255;
    }
  }
  return { width, height, at: (row, column) => decoded.readUInt16BE((row * width + column) * 2) };
}

function verifyBoundarySamples(frame, event, numeric, kind) {
  const [west, south, east, north] = event.bbox, step = event.grid.stepSourcePixels;
  const x = Array.from({ length: Math.ceil(numeric.width / step) + 1 }, (_, i) => Math.min(i * step, numeric.width));
  const y = Array.from({ length: Math.ceil(numeric.height / step) + 1 }, (_, i) => Math.min(i * step, numeric.height));
  const dx = (east - west) / numeric.width, dy = (north - south) / numeric.height, cache = new Map();
  function cell(row, column) {
    assert.ok(row >= 0 && row < y.length - 1 && column >= 0 && column < x.length - 1, 'coverage-window edges cannot masquerade as temperature boundaries');
    const key = `${row}:${column}`;
    if (cache.has(key)) return cache.get(key);
    const left = x[column], right = x[column + 1], top = y[row], bottom = y[row + 1];
    for (let r = top; r < bottom; r++) for (let c = left; c < right; c++) assert.ok(numeric.at(r, c) > 0, 'boundary cells must contain real, valid numeric pixels');
    if (kind === 'volcano') for (const r of [top, bottom]) for (const c of [left, right]) assert.ok(distance(west + c * dx, north - r * dy, event.statisticsRegion.center) <= 300.000001, 'analysis-circle clipping may not create a temperature boundary');
    const value = numeric.at(Math.floor((top + bottom - 1) / 2), Math.floor((left + right - 1) / 2));
    const cold = kind === 'volcano' ? value < 22000 : value <= 23500;
    cache.set(key, cold);
    return cold;
  }
  function lattice([lon, lat]) {
    const column = Math.round((lon - west) / dx), row = Math.round((north - lat) / dy);
    assert.ok(Math.abs(lon - (west + column * dx)) <= .0000051);
    assert.ok(Math.abs(lat - (north - row * dy)) <= .0000051);
    const i = x.indexOf(column), j = y.indexOf(row);
    assert.ok(i >= 0 && j >= 0, 'all vertices must lie on the declared coarse grid');
    return [i, j];
  }
  for (const line of frame.lines) {
    for (let index = 1; index < line.coordinates.length; index++) {
      const a = lattice(line.coordinates[index - 1]), b = lattice(line.coordinates[index]);
      if (a[1] === b[1]) {
        for (let c = Math.min(a[0], b[0]); c < Math.max(a[0], b[0]); c++) assert.notEqual(cell(a[1] - 1, c), cell(a[1], c), 'each horizontal boundary separates actual warm/cold source samples');
      } else {
        assert.equal(a[0], b[0]);
        for (let r = Math.min(a[1], b[1]); r < Math.max(a[1], b[1]); r++) assert.notEqual(cell(r, a[0] - 1), cell(r, a[0]), 'each vertical boundary separates actual warm/cold source samples');
      }
    }
  }
}

test('feature bundle is small and exactly follows the supplied real frame timestamps', () => {
  assert.equal(features.schemaVersion, 1);
  assert.ok(bytes('app/data/observed-change-features.json').length < 2_000_000);
  for (const kind of ['volcano', 'storm']) {
    const event = features.events[kind], data = source[kind];
    assert.equal(event.projection, 'EPSG:4326');
    assert.deepEqual(event.bbox, data.bbox);
    assert.equal(event.sourceManifest.sha256, hash(bytes(event.sourceManifest.path)));
    assert.deepEqual(event.frames.map(frame => frame.timeUtc), data.frames.map(frame => frame.timeUtc));
    event.frames.forEach((frame, index) => {
      const original = data.frames[index], numeric = original.numericData;
      assert.equal(frame.scanStartUtc, original.scanStartUtc);
      assert.equal(frame.scanEndUtc, original.scanEndUtc);
      assert.equal(frame.sourceNumeric.sha256, numeric.sha256);
      assert.equal(frame.sourceNumeric.path, numeric.url || numeric.researchFile);
    });
  }
});

test('all contour lines have real geographic coordinates, minimum3 vertices and no analysis-circle edge invented', () => {
  for (const kind of ['volcano', 'storm']) {
    const event = features.events[kind], [west, south, east, north] = event.bbox;
    const ids = new Set();
    for (const frame of event.frames) for (const line of frame.lines) {
      assert.ok(!ids.has(line.id)); ids.add(line.id);
      assert.ok(line.coordinates.length >= 3);
      assert.equal(line.color, undefined);
      for (const [lon, lat] of line.coordinates) {
        assert.ok(Number.isFinite(lon) && Number.isFinite(lat));
        assert.ok(lon >= west - .00001 && lon <= east + .00001 && lat >= south - .00001 && lat <= north + .00001);
        if (kind === 'volcano') assert.ok(distance(lon, lat, event.statisticsRegion.center) <= 300.002);
      }
      for (let i = 1; i < line.coordinates.length; i++) {
        const a = line.coordinates[i - 1], b = line.coordinates[i];
        assert.ok(a[0] === b[0] || a[1] === b[1], 'collinear simplification may not create diagonal shortcut boundaries');
      }
    }
  }
  assert.ok(features.events.volcano.frames.some(frame => frame.lines.some(line => line.coordinates.some(([lon]) => lon > 180))), 'Tonga longitude must remain unwrapped across180');
  for (const frame of features.events.volcano.frames.slice(0, 2)) {
    assert.equal(frame.counts.fullThresholdPixelsInRegion, 0); assert.equal(frame.anchor, null); assert.deepEqual(frame.lines, []);
  }
});

test('metric deltas use only adjacent actual source records and label known missing scans', () => {
  for (const kind of ['volcano', 'storm']) {
    const event = features.events[kind];
    assert.equal(event.frames[0].deltaMetrics, null);
    event.frames.slice(1).forEach((frame, index) => {
      const previous = event.frames[index], delta = frame.deltaMetrics;
      assert.equal(delta.fromTimeUtc, previous.timeUtc);
      assert.equal(delta.intervalSeconds, (Date.parse(frame.timeUtc) - Date.parse(previous.timeUtc)) / 1000);
      for (const metric of delta.values) {
        const series = source[kind].series.find(item => item.id === metric.id);
        const a = series.samples.find(item => item.timeUtc === previous.timeUtc).value;
        const b = series.samples.find(item => item.timeUtc === frame.timeUtc).value;
        assert.equal(metric.a, a); assert.equal(metric.b, b); assert.equal(metric.delta, b - a);
      }
    });
  }
  const afterGap = features.events.storm.frames.find(frame => frame.timeUtc === '2022-09-05T10:10:00Z');
  assert.equal(afterGap.deltaMetrics.fromTimeUtc, '2022-09-05T09:50:00Z');
  assert.equal(afterGap.deltaMetrics.intervalSeconds, 1200);
  assert.equal(afterGap.deltaMetrics.spansKnownMissing, true);
  assert.deepEqual(afterGap.deltaMetrics.missingTimesUtc, ['2022-09-05T10:00:00Z']);
  assert.ok(!features.events.storm.frames.some(frame => frame.timeUtc === '2022-09-05T10:00:00Z'));
});

test('independent numeric PNG decoding verifies every contour edge and actual anchor pixel', t => {
  const allFrames = Object.values(features.events).flatMap(event => event.frames);
  if (allFrames.some(frame => !existsSync(file(frame.sourceNumeric.path)))) {
    t.skip('Research numeric PNGs are retained in D staging; run this source-integrity test there. App contract tests above remain active.');
    return;
  }
  for (const kind of ['volcano', 'storm']) {
    const event = features.events[kind], [west, south, east, north] = event.bbox;
    for (const frame of event.frames) {
      const buffer = bytes(frame.sourceNumeric.path);
      assert.equal(hash(buffer), frame.sourceNumeric.sha256);
      const numeric = numericPNG(buffer);
      assert.equal(numeric.width, frame.sourceNumeric.width); assert.equal(numeric.height, frame.sourceNumeric.height);
      verifyBoundarySamples(frame, event, numeric, kind);
      const anchor = frame.anchor;
      if (!anchor) continue;
      const { row, column } = anchor.pixel, value = numeric.at(row, column);
      assert.ok(value > 0 && (kind === 'volcano' ? value < 22000 : value <= 23500));
      assert.equal(anchor.temperatureK, value * .01);
      assert.ok(Math.abs(anchor.lon - (west + (column + .5) * (east - west) / numeric.width)) < .000001);
      assert.ok(Math.abs(anchor.lat - (north - (row + .5) * (north - south) / numeric.height)) < .000001);
      if (kind === 'volcano') assert.ok(distance(anchor.lon, anchor.lat, event.statisticsRegion.center) <= 300.001);
    }
  }
});
