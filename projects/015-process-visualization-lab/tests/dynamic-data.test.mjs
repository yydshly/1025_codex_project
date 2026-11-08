import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../app/vendor/three.module.js';
import { validateDynamicEvent, dynamicTicks, dynamicSnapshot, sampleAt, stationScale, longitudeRegistration } from '../app/dynamic-data.js';
import { createObservationPatchGeometry } from '../app/sync-cloud-layer.js';
import { latLonToVector } from '../app/globe-effects.js';
import { dixieWeatherWindow, dixieWindAt, toward } from '../app/dixie-evidence.js';
import { hungaChangeLabel, hungaChangeStops, hungaDepthChanges, hungaSample } from '../app/hunga-terrain-data.js';

const data = JSON.parse(fs.readFileSync(new URL('../app/data/quake-dynamic.json', import.meta.url), 'utf8'));

test('six real stations retain a common 1-second window-end clock and observed counts', () => {
  assert.equal(validateDynamicEvent(data), data);
  const ticks = dynamicTicks(data);
  assert.equal(ticks.length, 1200);
  assert.equal(data.stations.length, 6);
  assert.equal(ticks[0], '2011-03-11T05:45:01Z');
  assert.equal(ticks.at(-1), '2011-03-11T06:05:00Z');
  assert.equal(data.originUtc, '2011-03-11T05:46:24.120Z');
  assert.equal(data.magnitude, 9.1);
  for (const station of data.stations) {
    assert.equal(station.unit, 'counts');
    assert.equal(station.nativeSampleRateHz, 20);
    assert.equal(station.channelMetadata.responseCorrectionApplied, false);
    assert.deepEqual(station.samples.map(s => s.timeUtc), ticks);
    assert.equal(stationScale(station), station.displayScaleMaxAbsCounts);
    for (const sample of station.samples) {
      const end = Date.parse(sample.timeUtc), start = Date.parse(sample.windowStartUtc);
      assert.equal(sample.windowEndUtc, sample.timeUtc);
      assert.equal(end - start, 1000);
      assert.equal(sample.sampleCount, 20);
      assert.ok(Date.parse(sample.firstSampleTimeUtc) >= start);
      assert.ok(Date.parse(sample.lastSampleTimeUtc) < end);
      assert.ok(Date.parse(sample.peakTimeUtc) >= start && Date.parse(sample.peakTimeUtc) < end);
      assert.equal(sample.value, sample.rawValue - station.baselineCounts);
      assert.ok(sample.min <= sample.value && sample.value <= sample.max);
    }
  }
});

test('a displayed MAJO peak is an actual source sample, not a fabricated 1-Hz measurement', () => {
  const station = data.stations.find(s => s.id === 'IU.MAJO.00.BHZ');
  const snapshot = dynamicSnapshot(data, '2011-03-11T05:48:01Z');
  assert.ok(snapshot.stations.every(s => s.sample.timeUtc === snapshot.timeUtc));
  const sample = snapshot.stations.find(s => s.id === station.id).sample;
  assert.equal(sample.value, -8220333);
  assert.equal(sample.rawValue, -8220072);
  assert.equal(sample.peakTimeUtc, '2011-03-11T05:48:00.369538Z');
  const raw = fs.readFileSync(new URL('../' + station.rawFile, import.meta.url), 'utf8').split(/\r?\n/);
  const [time, count] = raw[sample.sourceLine - 1].split(',').map(s => s.trim());
  assert.equal(time, sample.peakTimeUtc);
  assert.equal(Number(count), sample.rawValue);
  assert.ok(dynamicSnapshot(data, '2011-03-11T05:45:00.999Z').stations.every(s => s.sample === null));
});

test('selection never reads a future sample, never replaces missing with zero, and expires stale observations', () => {
  const samples = [
    { timeUtc: '2022-01-01T00:00:01Z', value: -4 },
    { timeUtc: '2022-01-01T00:00:02Z', value: null },
    { timeUtc: '2022-01-01T00:00:03Z', value: 0 },
    { timeUtc: '2022-01-01T00:00:05Z', value: 9 },
  ];
  assert.equal(sampleAt(samples, '2022-01-01T00:00:00.999Z', 10), null);
  assert.equal(sampleAt(samples, '2022-01-01T00:00:01.999Z', .999), samples[0]);
  assert.equal(sampleAt(samples, '2022-01-01T00:00:02Z', 10), null);
  assert.equal(sampleAt(samples, '2022-01-01T00:00:02.999Z', 10), null);
  assert.equal(sampleAt(samples, '2022-01-01T00:00:03Z'), samples[2]);
  assert.equal(sampleAt(samples, '2022-01-01T00:00:04Z', .999), null);
  assert.equal(sampleAt(samples, '2022-01-01T00:00:04.999Z'), null);
});

test('independent station scaling retains signs and empty samples without comparing instrument gains', () => {
  assert.equal(stationScale({ samples: [{ value: null }, { value: 0 }] }), 1);
  assert.equal(stationScale({ samples: [{ value: -12 }, { value: 3 }, { value: null }] }), 12);
  const small = structuredClone(data);
  small.stations = small.stations.slice(0, 2);
  small.stations[0].samples[0].value = null;
  const snap = dynamicSnapshot(small, small.startUtc);
  assert.equal(snap.stations[0].sample, null);
  assert.equal(snap.stations[1].sample, small.stations[1].samples[0]);
  assert.notEqual(snap.stations[0].scale, snap.stations[1].scale);
});

test('dateline registration maps actual patch vertices to the same geographical longitudes', () => {
  for (const bounds of [[174, -29, 193, -12], [-193, -29, -174, -12], [110, 15, 155, 45]]) {
    const { origin, bounds: registered } = longitudeRegistration(bounds);
    const geometry = createObservationPatchGeometry(registered, 2.006);
    const points = geometry.attributes.position, uv = geometry.attributes.uv;
    const rotation = new THREE.Matrix4().makeRotationY(origin * Math.PI / 180);
    for (let i = 0; i < points.count; i++) {
      const lon = bounds[0] + uv.getX(i) * (bounds[2] - bounds[0]);
      const lat = bounds[1] + uv.getY(i) * (bounds[3] - bounds[1]);
      const actual = new THREE.Vector3().fromBufferAttribute(points, i).applyMatrix4(rotation);
      assert.ok(actual.distanceTo(latLonToVector(lat, lon, 2.006)) < 4e-7, `misregistered ${lat}, ${lon}`);
    }
    geometry.dispose();
  }
});

test('unordered real samples and non-finite counts are rejected before rendering', () => {
  const invalid = structuredClone(data);
  invalid.stations[0].samples[1].timeUtc = invalid.stations[0].samples[0].timeUtc;
  assert.throws(() => validateDynamicEvent(invalid), /ordered/);
  invalid.stations[0].samples[1].timeUtc = data.stations[0].samples[1].timeUtc;
  invalid.stations[0].samples[0].value = NaN;
  assert.throws(() => validateDynamicEvent(invalid), /waveform/);
});

test('Dixie displays actual records in the selected PDT hour and separate archive dates', () => {
  const read = name => JSON.parse(fs.readFileSync(new URL('../app/data/' + name, import.meta.url), 'utf8'));
  const context = read('dixie-context.json');
  const event = read('wildfire-dixie-dynamic.json');
  const window = dixieWeatherWindow('2021-08-05', '2021-08-06');
  assert.equal(window.lastHour, 47);
  assert.equal(new Date(window.start).toISOString(), '2021-08-05T07:00:00.000Z');
  const observations = dixieWindAt(context.stations, Date.parse('2021-08-05T23:00:00Z'));
  assert.deepEqual(observations.map(s => s.sample), [
    ['2021-08-05T23:21:00Z', 12, 242],
    ['2021-08-05T23:00:00Z', 5, 265],
    ['2021-08-05T23:11:00Z', 8, 295],
  ]);
  assert.deepEqual(observations.map(s => toward(s.sample[2])), [62, 85, 115]);
  assert.equal(dixieWindAt(context.stations, Date.parse('2021-08-07T08:00:00Z')).every(s => !s.sample), true);
  for (const frame of event.frames) {
    for (const url of Object.values(context.frames[frame.archiveDate].layers)) {
      assert.ok(fs.statSync(new URL('../app/' + url, import.meta.url)).size > 0);
    }
  }
  const last = event.frames.at(-1), sectors = context.frames[last.archiveDate].sectors;
  assert.deepEqual(sectors.map(s => [s.name, s.areaKm2]), [['北侧',260.3], ['东侧',236.7], ['南侧',0], ['西侧',3.5]]);
  assert.ok(Math.abs(sectors.reduce((sum,s) => sum+s.areaKm2, 0) - last.addedKm2) <= .2);
  assert.match(sectors[0].fuel[0].officialName, /Red Fir Forest/);
  assert.match(sectors[1].fuel[0].officialName, /Mesic Mixed Conifer/);
});

test('Hunga depth differences preserve sign, measured samples and the survey gap', () => {
  const read = path => JSON.parse(fs.readFileSync(new URL('../app/' + path, import.meta.url), 'utf8'));
  const terrain = read('data/hunga-terrain.json');
  const {rows,cols}=terrain.grid;
  const levels = Object.fromEntries(Object.entries(terrain.surveys).map(([key,survey])=>{
    const raw = Buffer.from(read(survey.url),'base64');
    assert.equal(raw.length,rows*cols*2);
    return [key,Float32Array.from({length:rows*cols},(_,i)=>{
      const decimetres=raw.readInt16LE(i*2);
      return decimetres===-32768?NaN:decimetres/10;
    })];
  }));
  const {values,paired} = hungaDepthChanges(levels.pre,levels.post);
  assert.equal(rows*cols-paired,893);
  assert.equal(values.filter(value=>Number.isNaN(value)).length,893);
  const missing = levels.post.findIndex(value=>Number.isNaN(value));
  assert.ok(Number.isFinite(levels.pre[missing])&&Number.isNaN(values[missing]));
  assert.ok(values.every(value=>Number.isNaN(value)||(value>=hungaChangeStops[0][0]&&value<=hungaChangeStops.at(-1)[0])));
  const evidence = {...terrain,levels:{...levels,change:values}};
  assert.deepEqual(['west','crater','east'].map(spot=>hungaChangeLabel(hungaSample(evidence,spot).change)),
    ['变浅 8.1 米','加深 774.4 米','变浅 6.7 米']);
});
