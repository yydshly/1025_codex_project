import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateEventDataset, recordAtIndex, findRecordIndex, metricSeries, formatTime } from '../app/real-event-data.js';

const raw = JSON.parse(fs.readFileSync(new URL('../research/real-events/mangkhut-jma.json', import.meta.url), 'utf8'));

test('the official Mangkhut event retains all 46 original records and missing winds', () => {
  const original = JSON.stringify(raw);
  assert.equal(validateEventDataset(raw), raw);
  assert.equal(raw.records.length, 46);
  assert.equal(raw.records[0].timeUtc, '2018-09-06T12:00:00Z');
  assert.equal(raw.records.at(-1).timeUtc, '2018-09-17T18:00:00Z');
  const winds = metricSeries(raw, 'windKt');
  assert.equal(winds.filter(point => point.value === null).length, 7);
  assert.deepEqual(winds[0], { timeUtc: '2018-09-06T12:00:00Z', value: null });
  assert.equal(JSON.stringify(raw), original);
});

test('playback selects actual records at boundaries and between analysis times', () => {
  assert.equal(recordAtIndex(raw, -10), raw.records[0]);
  assert.equal(recordAtIndex(raw, 1000), raw.records.at(-1));
  const index = findRecordIndex(raw, '2018-09-16T05:00:00Z');
  const record = recordAtIndex(raw, index);
  assert.equal(record, raw.records[index]);
  assert.equal(record.timeUtc, '2018-09-16T06:00:00Z');
  assert.equal(record.pressureHpa, 960);
  assert.equal(record.windKt, 75);
  assert.equal(record.lat, 21.7);
  assert.equal(record.lon, 113.5);
  assert.equal(findRecordIndex(raw, '2018-09-01T00:00:00Z'), 0);
  assert.equal(findRecordIndex(raw, '2018-10-01T00:00:00Z'), 45);
});

test('the event time shown to the user is explicitly Beijing UTC+8, including date rollover', () => {
  const afternoon = formatTime('2018-09-16T06:00:00Z');
  assert.match(afternoon, /9月16日/);
  assert.match(afternoon, /14:00/);
  assert.match(afternoon, /UTC\+8/);
  assert.match(formatTime('2018-09-16T18:00:00Z'), /9月17日 02:00/);
});

test('invalid event input cannot silently become a plausible track or zero-valued curve', () => {
  const reversed = structuredClone(raw);
  reversed.records.reverse();
  assert.throws(() => validateEventDataset(reversed), /递增/);
  const invalidLocation = structuredClone(raw);
  invalidLocation.records[0].lat = 91;
  assert.throws(() => validateEventDataset(invalidLocation), /经纬度/);
  const invalidDate = structuredClone(raw);
  invalidDate.records[0].timeUtc = '2018-02-30T12:00:00Z';
  assert.throws(() => validateEventDataset(invalidDate), /无效日期/);
  assert.throws(() => metricSeries(raw, 'missingMetric'), /数字或 null/);
  const missingPressure = structuredClone(raw);
  missingPressure.records[0].pressureHpa = null;
  assert.equal(validateEventDataset(missingPressure).records[0].pressureHpa, null);
  assert.equal(metricSeries(missingPressure, 'pressureHpa')[0].value, null);
});
