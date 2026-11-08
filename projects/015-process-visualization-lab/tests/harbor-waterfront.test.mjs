import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {drawHarborWaterfront, harborWaterlineY} from '../app/harbor-waterfront.js';

const dataset = JSON.parse(readFileSync(new URL('../app/data/tide-san-francisco-dynamic.json', import.meta.url)));
const measured = dataset.series.find(series => series.id === 'observed').samples;
const forecast = dataset.series.find(series => series.id === 'predicted').samples;

test('the fixed quay exposes and covers masonry as the measured tide changes', () => {
  const {observedMin, observedMax} = dataset.moments;
  assert.ok((harborWaterlineY(observedMin.valueM) - harborWaterlineY(observedMax.valueM)) * 260 > 60);
  for (let index = 1; index < measured.length; index++) {
    const before = measured[index - 1].value;
    const after = measured[index].value;
    assert.equal(Math.sign(harborWaterlineY(before) - harborWaterlineY(after)), Math.sign(after - before));
  }
});

test('seeking and focus leave the same sample at the same observed shoreline', () => {
  const calls = [];
  const fakeCanvas = Object.fromEntries(['save', 'restore', 'translate', 'beginPath', 'rect', 'clip', 'fillRect',
    'moveTo', 'lineTo', 'quadraticCurveTo', 'closePath', 'fill', 'stroke'].map(method => [method, (...args) => calls.push([method, ...args])]));
  fakeCanvas.createLinearGradient = () => ({addColorStop() {}});
  const {observedMax} = dataset.moments;
  const {value: forecastAtPeak} = forecast.find(sample => sample.timeUtc === observedMax.timeUtc);
  const options = {x: 8, y: 125, width: 350, height: 240, level: observedMax.valueM, timeMinutes: 19 * 60 + 54};
  const first = drawHarborWaterfront(fakeCanvas, options);
  const initialPath = calls.splice(0);
  assert.deepEqual(drawHarborWaterfront(fakeCanvas, options), first);
  assert.deepEqual(calls.splice(0), initialPath);
  assert.deepEqual(drawHarborWaterfront(fakeCanvas, {...options, predictedLevel: forecastAtPeak, focus: 'peak'}), first);
  assert.equal(drawHarborWaterfront(fakeCanvas, {...options, level: null, predictedLevel: forecastAtPeak}), null);
  assert.equal(drawHarborWaterfront(fakeCanvas, {...options, level: Number.NaN}), null);
});
