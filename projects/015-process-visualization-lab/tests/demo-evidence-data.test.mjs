import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tasks, buildDemoEvidence } from '../app/demo-evidence-data.js';

const read = file => JSON.parse(readFileSync(new URL('../app/data/' + file, import.meta.url), 'utf8'));
const data = { volcano: read('volcano-dynamic.json'), quake: read('quake-dynamic.json'), storm: read('storm-dynamic.json'), mangkhut: read('mangkhut-synchronized.json') };
const row = (evidence, id) => evidence.rows.find(item => item.id === id);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, String(a) + ' != ' + String(b));

test('four task defaults name actual cases, ordered covered endpoints and a real station', () => {
  assert.deepEqual(Object.keys(tasks).sort(), ['mangkhut', 'quake', 'storm', 'volcano']);
  for (const [id, task] of Object.entries(tasks)) {
    assert.ok(task.question && task.title && task.takeaway && task.route);
    assert.equal(task.id, id);
    assert.ok(Date.parse(task.fromUtc) < Date.parse(task.toUtc));
    const result = buildDemoEvidence(task, data[id]);
    assert.equal(result.fromUtc, task.fromUtc);
    assert.equal(result.toUtc, task.toUtc);
    assert.ok(result.rows.length >= 2);
  }
  assert.ok(Date.parse(tasks.quake.fromUtc) < Date.parse(data.quake.originUtc));
});

test('Tonga returns original frame URLs, actual scan bounds and unchanged same-frame statistics', () => {
  const result = buildDemoEvidence('volcano', data.volcano);
  const a = data.volcano.frames[0], b = data.volcano.frames.at(-1);
  assert.equal(result.fromImage.url, a.url); assert.equal(result.toImage.url, b.url);
  assert.equal(result.fromImage.sha256, a.sha256);
  assert.equal(result.fromImage.scanStartUtc, a.scanStartUtc);
  assert.notEqual(result.fromImage.scanStartUtc, result.fromUtc);
  assert.equal(row(result, 'coldAreaKm2').a, 0);
  assert.equal(row(result, 'coldAreaKm2').b, b.stats.coldAreaKm2);
  assert.equal(row(result, 'coldAreaKm2').delta, b.stats.coldAreaKm2);
  near(row(result, 'p10K').delta, 198.41 - 276.72);
  assert.deepEqual(result.bbox, [174, -29, 193, -12]);
});

test('current B can select any real frame; absent exact imagery/metrics are never filled', () => {
  const bTime = '2022-01-15T04:20:00Z';
  const result = buildDemoEvidence('volcano', data.volcano, undefined, bTime);
  const actual = data.volcano.frames.find(frame => frame.timeUtc === bTime);
  assert.equal(result.toImage.url, actual.url);
  assert.equal(row(result, 'coldAreaKm2').b, actual.stats.coldAreaKm2);
  const absent = buildDemoEvidence('volcano', data.volcano, undefined, '2022-01-15T04:25:00Z');
  assert.equal(absent.toImage, null);
  assert.equal(absent.toImageStatus, 'missing');
  assert.equal(row(absent, 'coldAreaKm2').b, null);
  assert.equal(row(absent, 'coldAreaKm2').delta, null);
});

test('quake uses the same selected station and a shared scale including both windows min/max', () => {
  const result = buildDemoEvidence('quake', data.quake);
  const station = data.quake.stations.find(item => item.id === tasks.quake.stationId);
  const a = station.samples.find(sample => sample.timeUtc === tasks.quake.fromUtc);
  const b = station.samples.find(sample => sample.timeUtc === tasks.quake.toUtc);
  assert.equal(row(result, 'peakCounts').a, a.value);
  assert.equal(row(result, 'peakCounts').b, b.value);
  assert.equal(row(result, 'peakCounts').aPeakTimeUtc, a.peakTimeUtc);
  assert.equal(row(result, 'peakCounts').bSourceLine, b.sourceLine);
  assert.equal(row(result, 'absolutePeakCounts').a, Math.abs(a.value));
  assert.equal(result.waveforms.a.length, 30); assert.equal(result.waveforms.b.length, 30);
  assert.ok(result.waveforms.a.every(sample => Date.parse(sample.timeUtc) > Date.parse(tasks.quake.fromUtc) - 30000 && Date.parse(sample.timeUtc) <= Date.parse(tasks.quake.fromUtc)));
  assert.equal(result.waveforms.scale, Math.max(...[...result.waveforms.a, ...result.waveforms.b].flatMap(sample => [sample.value, sample.min, sample.max].map(Math.abs))));
  assert.equal(result.waveforms.unit, 'counts');
  const otherId = 'IU.INCN.00.BHZ';
  const other = buildDemoEvidence('quake', data.quake, undefined, undefined, otherId);
  assert.equal(other.station.id, otherId); assert.equal(other.waveforms.stationId, otherId);
  assert.deepEqual(other.waveforms.a.at(-1), data.quake.stations.find(item => item.id === otherId).samples.find(sample => sample.timeUtc === tasks.quake.fromUtc));
  assert.throws(() => buildDemoEvidence('quake', data.quake, undefined, undefined, 'not-a-station'));
});

test('missing quake samples remain missing and do not become zero or a previous-window peak', () => {
  const changed = structuredClone(data.quake), station = changed.stations[0];
  const target = station.samples.find(sample => sample.timeUtc === tasks.quake.toUtc);
  target.value = target.min = target.max = null;
  const result = buildDemoEvidence('quake', changed);
  assert.equal(row(result, 'peakCounts').b, null); assert.equal(row(result, 'peakCounts').delta, null);
  assert.equal(result.waveforms.b.at(-1).value, null);
});

test('storm keeps satellite and latest valid official analysis times distinct', () => {
  const result = buildDemoEvidence('storm', data.storm);
  assert.equal(result.toImage.timeUtc, '2022-09-05T13:30:00Z');
  const wind = row(result, 'windKt');
  assert.equal(wind.a, 85); assert.equal(wind.b, 75); assert.equal(wind.delta, -10);
  assert.equal(wind.aTimeUtc, '2022-09-05T03:00:00Z');
  assert.equal(wind.bTimeUtc, '2022-09-05T12:00:00Z');
  assert.equal(wind.aSourceLine, 50); assert.equal(wind.bSourceLine, 53);
  assert.equal(wind.bStatus, 'latest'); assert.equal(wind.bAgeSeconds, 5400);
  const absent = buildDemoEvidence('storm', data.storm, undefined, '2022-09-05T10:00:00Z');
  assert.equal(absent.toImage, null); assert.equal(row(absent, 'p10K').b, null);
  assert.equal(row(absent, 'windKt').bTimeUtc, '2022-09-05T09:00:00Z');
  const stale = structuredClone(data.storm); stale.series.find(item => item.id === 'windKt').samples = [stale.series.find(item => item.id === 'windKt').samples[0]];
  const old = row(buildDemoEvidence('storm', stale), 'windKt');
  assert.equal(old.b, null); assert.equal(old.delta, null); assert.equal(old.bStatus, 'expired');
});

test('waveform scale respects envelope extrema, real zero and wholly missing windows', () => {
  const changed = structuredClone(data.quake), station = changed.stations[0];
  const from = Date.parse(tasks.quake.fromUtc), to = Date.parse(tasks.quake.toUtc);
  const inWindows = sample => [from, to].some(end => Date.parse(sample.timeUtc) > end - 30000 && Date.parse(sample.timeUtc) <= end);
  for (const sample of station.samples.filter(inWindows)) sample.value = sample.min = sample.max = 0;
  assert.equal(buildDemoEvidence('quake', changed).waveforms.scale, 0);
  station.samples.find(sample => sample.timeUtc === tasks.quake.toUtc).min = -20;
  assert.equal(buildDemoEvidence('quake', changed).waveforms.scale, 20);
  for (const sample of station.samples.filter(inWindows)) sample.value = sample.min = sample.max = null;
  const missing = buildDemoEvidence('quake', changed);
  assert.equal(missing.waveforms.scale, null);
  assert.equal(row(missing, 'peakCounts').delta, null);
});

test('Mangkhut rain keeps actual ranges, windows and publication times without midpoint/delta', () => {
  const result = buildDemoEvidence('mangkhut', data.mangkhut), rain = row(result, 'rain');
  assert.equal(rain.valueType, 'range');
  assert.deepEqual(rain.aRange, { lower: 7, upper: 42 });
  assert.deepEqual(rain.bRange, { lower: 2, upper: 48 });
  assert.equal(rain.a, null); assert.equal(rain.b, null); assert.equal(rain.delta, null);
  assert.equal(rain.aTimeUtc, '2018-09-16T03:45:00Z');
  assert.equal(rain.bTimeUtc, '2018-09-16T04:45:00Z');
  assert.equal(rain.aWindowStartUtc, '2018-09-16T02:45:00Z');
  assert.equal(rain.bWindowEndUtc, '2018-09-16T04:45:00Z');
  assert.equal(rain.bPublishedAtUtc, '2018-09-16T05:02:00Z');
  const sea = row(result, 'seaLevel');
  assert.equal(sea.a, 3.51); assert.equal(sea.b, 3.7); near(sea.delta, .19);
  assert.equal(sea.datum.sourceName, 'station zero');
  assert.equal(sea.datum.chartDatumConversionApplied, false);
  const wind = row(result, 'wind');
  assert.equal(wind.a, 79.636); assert.equal(wind.b, 111.12); near(wind.delta, 31.484);
  const gap = buildDemoEvidence('mangkhut', data.mangkhut, '2018-09-16T02:40:00Z');
  assert.equal(gap.fromImage, null); assert.equal(gap.fromImageStatus, 'missing');
});

test('comparisons reject wrong cases, invalid dates and reversed/outside windows without mutating data', () => {
  for (const [id, source] of Object.entries(data)) {
    const before = JSON.stringify(source); buildDemoEvidence(id, source); assert.equal(JSON.stringify(source), before);
  }
  assert.throws(() => buildDemoEvidence('unknown', data.volcano));
  assert.throws(() => buildDemoEvidence('volcano', data.storm));
  assert.throws(() => buildDemoEvidence('volcano', data.volcano, tasks.volcano.toUtc, tasks.volcano.fromUtc));
  assert.throws(() => buildDemoEvidence('volcano', data.volcano, '2022-01-15T02:00:00Z'));
  assert.throws(() => buildDemoEvidence('volcano', data.volcano, '2022-02-30T03:50:00Z'));
  assert.throws(() => buildDemoEvidence('volcano', data.volcano, '2022-01-15T03:50:00'));
});
