import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { observedStory } from '../app/observed-story.js';

const read = filename => JSON.parse(fs.readFileSync(new URL('../app/data/' + filename, import.meta.url), 'utf8'));
const volcano = read('volcano-dynamic.json'), storm = read('storm-dynamic.json'), quake = read('quake-dynamic.json'), mangkhut = read('mangkhut-synchronized.json');
const make = (kind, data, time, extra = {}) => observedStory({ route: kind === 'mangkhut' ? 'typhoon-real' : 'dynamic-' + kind, data, snapshotTimeUtc: time, ...extra });

test('volcano story uses the actual same-frame neighborhood metrics and exact-time feature geometry without mutating them', () => {
  const features = { schemaVersion: 1, events: { volcano: { eventId: volcano.id, projection: 'EPSG:4326', frames: [{
    timeUtc: '2022-01-15T07:50:00Z', lines: [{ id: 'fixture-contour', coordinates: [[184, -20], [185, -20], [185, -21], [184, -20]] }],
    anchor: { lon: 185, lat: -20, method: 'actual-cold-pixel-near-largest-grid-component-area-centroid' },
    deltaMetrics: { spansKnownMissing: true, missingTimesUtc: ['2022-01-15T07:30:00Z'] },
  }] } } };
  const original = structuredClone({ data: volcano, features });
  const story = make('volcano', volcano, '2022-01-15T07:50:00.000Z', { features });
  assert.match(story.summary, /69,711\.2 km²/); assert.match(story.summary, /198\.41 K/);
  assert.equal(story.phase, 'area-increased'); assert.equal(story.sourceTime, '2022-01-15T07:50:00Z');
  assert.deepEqual(story.lines[0].coordinates, features.events.volcano.frames[0].lines[0].coordinates);
  assert.equal(story.pins.find(pin => pin.id === 'volcano-cold-pixel').lon, -175);
  assert.match(story.pins.find(pin => pin.id === 'volcano-cold-pixel').value, /区域P10/);
  assert.ok(story.notes.some(note=>note.includes('不是该像元的单点温度')));
  assert.deepEqual([story.pins[0].lat, story.pins[0].lon], [volcano.focus.lat, volcano.focus.lon]);
  assert.match(story.notes.join(' '), /缺档.*真实两端/); assert.match(story.notes.join(' '), /不等于全部火山灰云/);
  story.lines[0].coordinates[0][0] = 0;
  assert.deepEqual({ data: volcano, features }, original);
});

test('missing cloud frames cannot borrow contours or values from another time, and a measured zero remains zero', () => {
  const features = { events: { volcano: { eventId: volcano.id, projection: 'EPSG:4326', frames: [{ timeUtc: '2022-01-15T03:50:00Z', lines: [{ id: 'old', coordinates: [[184, -20], [185, -20]] }], anchor: { lon: 184, lat: -20 } }] } } };
  const first = make('volcano', volcano, '2022-01-15T03:50:00Z');
  assert.match(first.summary, /区域为0 km²/); assert.equal(first.phase, 'observed');
  const missing = make('volcano', volcano, '2022-01-15T03:55:00Z', { features });
  assert.equal(missing.phase, 'missing-frame'); assert.equal(missing.sourceTime, null);
  assert.equal(missing.lines.length, 0); assert.equal(missing.pins.length, 1);
  assert.match(missing.pins[0].value, /缺帧/); assert.doesNotMatch(missing.summary, /276\.72/);
});

test('storm at 13:30 retains the actual 12:00 analysis and only connects its previous actual center', () => {
  const story = make('storm', storm, '2022-09-05T13:30:00Z');
  const current = story.pins.find(pin => pin.id === 'jma-current');
  assert.equal(story.timeUtc, '2022-09-05T13:30:00Z'); assert.equal(story.sourceTime, '2022-09-05T12:00:00Z');
  assert.equal(current.sourceTimeUtc, '2022-09-05T12:00:00Z'); assert.equal(current.value, '75 kt'); assert.match(current.detail, /955 hPa/);
  assert.equal(story.pins.some(pin => pin.id === 'jma-previous'), false);
  assert.deepEqual(story.lines.find(line => line.id === 'jma-center-displacement').coordinates, [[126, 31.6], [126.6, 32.3]]);
  assert.match(story.summary, /移位约96 km（按坐标计算）/);
  assert.match(story.notes.join(' '), /最近两次官方分析位置/);
  assert.ok(story.pins.length <= 3); assert.ok(story.metricsFocus.includes('windKt'));
});

test('no future or expired JMA centers are presented as current analysis', () => {
  const source = structuredClone(storm);
  source.series.find(series => series.id === 'windKt').maxAgeSeconds = 60;
  const story = make('storm', source, '2022-09-05T13:30:00Z');
  assert.equal(story.pins.length, 0); assert.equal(story.lines.length, 0);
  assert.match(story.notes.join(' '), /没有时效内/);
  const first = make('storm', storm, '2022-09-05T03:00:00Z');
  assert.equal(first.pins.length, 1); assert.equal(first.pins[0].sourceTimeUtc, '2022-09-05T03:00:00Z');
  assert.equal(first.lines.length, 0);
});

test('quake story uses the selected real station and six records at the same one-second window end', () => {
  const story = make('quake', quake, '2011-03-11T05:49:20Z', { stationId: 'IU.MAJO.00.BHZ', narrationCue: { stationId: 'IU.INCN.00.BHZ', value: 999 } });
  const station = story.pins.find(pin => pin.id === 'quake-selected-station');
  assert.equal(station.target, 'IU.MAJO.00.BHZ'); assert.equal(station.value, '38,690,961 counts');
  assert.deepEqual([station.lat, station.lon], [36.54567, 138.20406]);
  assert.match(story.summary, /6\/6站/); assert.equal(story.lines.length, 0);
  assert.match(story.notes.join(' '), /05:49:19\.769538Z/); assert.match(story.notes.join(' '), /符号反转不能解释为强度增幅/);
  assert.equal(story.sourceTime, '2011-03-11T05:49:20Z');
  const other = make('quake', quake, '2011-03-11T05:49:20Z', { stationId: 'IU.INCN.00.BHZ' });
  assert.equal(other.pins[0].id, station.id, 'DOM identity is stable when selecting a different actual station');
  assert.equal(other.pins[0].target, 'IU.INCN.00.BHZ'); assert.equal(other.pins[0].value, '-3,258 counts');
  assert.notEqual(other.pins[0].lon, station.lon);
});

test('quake missing, unknown and between-window states do not hold or replace another station value', () => {
  const source = structuredClone(quake);
  source.stations[0].samples.find(sample => sample.timeUtc === '2011-03-11T05:49:20Z').value = null;
  const missing = make('quake', source, '2011-03-11T05:49:20Z', { stationId: source.stations[0].id });
  assert.match(missing.pins[0].value, /缺测/); assert.match(missing.summary, /5\/6站/); assert.equal(missing.phase, 'missing-record');
  const between = make('quake', quake, '2011-03-11T05:49:20.500Z');
  assert.match(between.summary, /0\/6站/); assert.equal(between.sourceTime, null);
  const unknown = make('quake', quake, '2011-03-11T05:49:20Z', { stationId: 'invented' });
  assert.equal(unknown.phase, 'unknown-station'); assert.equal(unknown.pins.some(pin => pin.id === 'quake-selected-station'), false);
  assert.equal(make('quake', quake, '2011-03-11T05:46:00Z').phase, 'before-origin');
});

test('Mangkhut uses actual airport and tide-gauge positions and reports record age without a fabricated rain point', () => {
  const story = make('mangkhut', mangkhut, '2018-09-16T05:10:00Z');
  assert.equal(story.pins.length, 2);
  const wind = story.pins.find(pin => pin.target === 'wind'), sea = story.pins.find(pin => pin.target === 'seaLevel');
  assert.equal(wind.value, '111.12 km/h'); assert.equal(sea.value, '3.7 m');
  for (const pin of [wind, sea]) { assert.equal(pin.sourceTimeUtc, '2018-09-16T05:00:00Z'); assert.match(pin.detail, /早10分钟/); }
  assert.deepEqual([wind.lat, wind.lon], [22.308919, 113.914603]);
  assert.deepEqual([sea.lat, sea.lon], [mangkhut.series.find(series => series.id === 'seaLevel').station.lat, mangkhut.series.find(series => series.id === 'seaLevel').station.lon]);
  assert.match(sea.detail, /UHSLC站点零点/); assert.match(story.notes.join(' '), /2—48 mm/);
  assert.equal(story.pins.some(pin => pin.target === 'rain'), false);
  const early = make('mangkhut', mangkhut, '2018-09-16T00:00:00Z');
  assert.match(early.pins.find(pin => pin.target === 'wind').value, /缺测/);
  const cloudGap = make('mangkhut', mangkhut, '2018-09-16T02:40:00Z');
  assert.match(cloudGap.notes.join(' '), /云图缺档/);
});

test('bad route, dates, coverage and absent coordinate metadata cannot produce invented geographic anchors', () => {
  assert.throws(() => make('quake', storm, '2022-09-05T03:00:00Z'), /不一致/);
  assert.throws(() => make('volcano', volcano, '2022-01-15T03:00:00Z'), /超出/);
  assert.throws(() => make('volcano', volcano, '2022-02-30T03:50:00Z'), /日期/);
  const source = structuredClone(volcano); delete source.focus;
  const story = make('volcano', source, '2022-01-15T03:50:00Z');
  assert.equal(story.pins.length, 0); assert.equal(story.lines.length, 0);
});


test('same-kind same-time features from a different event cannot supply a geographic contour or anchor', () => {
  const features = read('observed-change-features.json');
  const source = { ...volcano, id: 'another-volcano-event' };
  const story = make('volcano', source, '2022-01-15T07:50:00Z', { features });
  assert.equal(story.lines.length, 0);
  assert.equal(story.pins.length, 1);
  assert.equal(story.pins[0].id, 'volcano-location');
});
