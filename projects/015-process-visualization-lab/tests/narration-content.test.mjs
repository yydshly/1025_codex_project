import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tours, chooseTour } from '../app/narration-script.js';
import { guidedCases, withCasePrimer } from '../app/case-lessons.js';
import { getDynamicEvent } from '../app/dynamic-events.js';
import { recordedNarrationPosition } from '../app/recorded-narration-clock.js';

const read = relative => readFileSync(new URL(relative, import.meta.url), 'utf8');
const json = relative => JSON.parse(read(relative));
const volcano = json('../app/data/volcano-dynamic.json');
const quake = json('../app/data/quake-dynamic.json');
const storm = json('../app/data/storm-dynamic.json');
const mangkhut = json('../app/data/mangkhut-synchronized.json');
const steps = Object.entries(tours).flatMap(([tour, value]) => value.steps.map((step, index) => ({ ...step, context: `${tour} step ${index + 1}` })));
const teachingRoutes = new Set(['overview', 'orbital', 'volcano', 'quake', 'typhoon', 'river', 'battery']);
const realData = new Map([
  ['dynamic-volcano', { data: volcano, records: volcano.frames }],
  ['dynamic-quake', { data: quake, records: quake.stations.flatMap(station => station.samples) }],
  ['dynamic-storm', { data: storm, records: storm.frames }],
  ['typhoon-real', { data: mangkhut, records: mangkhut.clouds.frames }]
]);

test('guided cases add teaching time without shifting existing audio or taking over the observation clock', () => {
  const manifest = json('../app/assets/narration/manifest.json');
  for (const route of Object.keys(guidedCases)) {
    const event = getDynamicEvent(route.slice(8));
    const original = event?.tour ?? chooseTour(route);
    const tour = withCasePrimer(route, original);
    if (route === 'dynamic-tide-san-francisco') {
      assert.equal(tour, original);
      continue;
    }
    assert.equal(tour.steps.length, original.steps.length + 1, route);
    const [primer, ...replay] = tour.steps;
    assert.deepEqual(primer.cue, {route, casePrimer:true});
    if (!tour.captionsOnly) assert.equal(manifest.clips[primer.audioId].text, primer.text);
    for (const [index, step] of replay.entries()) {
      assert.equal(step.audioIndex, index);
      assert.equal(step.cue, original.steps[index].cue);
    }
    const firstTimedChapter = tour.steps.findIndex(step=>step.cue.timeUtc||step.cue.elapsedSeconds!=null);
    const cue = tour.steps[firstTimedChapter].cue;
    const position = recordedNarrationPosition(tour.steps, route, cue.elapsedSeconds ?? cue.timeUtc, firstTimedChapter);
    assert.equal(position?.chapter, firstTimedChapter, route);
  }
});

function utcMillis(value, context) {
  assert.equal(typeof value, 'string', `${context}: UTC timestamp is required`);
  assert.match(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/, `${context}: explicit UTC required`);
  const time = Date.parse(value);
  assert.ok(Number.isFinite(time), `${context}: invalid timestamp`);
  assert.equal(new Date(time).toISOString(), value.replace(/(?:\.\d{3})?Z$/, match => match === 'Z' ? '.000Z' : match), `${context}: invalid calendar date`);
  return time;
}

test('narration provides the complete overview, four real-event tours and six teaching tours', () => {
  assert.equal(steps.length, 41);
  assert.equal(tours.overview.steps.length, 8);
  assert.equal(tours.volcano.steps.length, 7);
  for (const key of ['quake', 'storm']) assert.equal(tours[key].steps.length, 4, key);
  assert.equal(tours.mangkhut.steps.length, 6);
  for (const key of ['orbital', 'principleVolcano', 'principleQuake', 'principleTyphoon', 'river', 'battery']) assert.equal(tours[key].steps.length, 2, key);
  for (const [key, tour] of Object.entries(tours)) {
    assert.equal(typeof tour.label, 'string', key);
    assert.ok(tour.label.trim(), `${key}: missing user-facing label`);
  }
  for (const step of steps) {
    assert.ok(typeof step.title === 'string' && step.title.trim(), `${step.context}: missing title`);
    assert.ok(typeof step.text === 'string' && step.text.trim(), `${step.context}: missing narration`);
    assert.ok([...step.text].length >= 60 && [...step.text].length <= 100, `${step.context}: spoken segment should remain 60–100 characters`);
    assert.ok(step.cue && typeof step.cue.route === 'string', `${step.context}: missing cue route`);
  }
});

test('every narration highlight target exists in both delivered HTML entry points', () => {
  for (const file of ['../app/index.html', '../app/globe.html']) {
    const ids = new Set([...read(file).matchAll(/\bid\s*=\s*(["'])(.*?)\1/g)].map(match => match[2]));
    for (const step of steps) {
      assert.match(step.targetSelector, /^#[A-Za-z][\w-]*$/, `${step.context}: highlight contract uses an element ID`);
      assert.ok(ids.has(step.targetSelector.slice(1)), `${file}: ${step.context} targets missing ${step.targetSelector}`);
    }
  }
});

test('real-event cue endpoints are actual supplied observations, not interpolated timestamps', () => {
  for (const step of steps) {
    const source = realData.get(step.cue.route);
    if (!source) {
      assert.ok(teachingRoutes.has(step.cue.route), `${step.context}: unknown route ${step.cue.route}`);
      continue;
    }
    if (step.cue.terrain) {
      assert.equal(step.cue.route, 'dynamic-volcano');
      assert.equal(step.cue.timeUtc, undefined, 'survey chapters have no satellite timestamp');
      assert.equal(step.cue.endTimeUtc, undefined);
      continue;
    }
    const start = utcMillis(step.cue.timeUtc, step.context);
    const ticks = new Set(source.records.map(record => Date.parse(record.timeUtc)));
    assert.ok(ticks.has(start), `${step.context}: start is not a real observation`);
    assert.ok(start >= Date.parse(source.data.startUtc) && start <= Date.parse(source.data.endUtc), `${step.context}: start is outside event coverage`);
    if (step.cue.endTimeUtc !== undefined) {
      const end = utcMillis(step.cue.endTimeUtc, `${step.context} end`);
      assert.ok(end >= start, `${step.context}: playback interval runs backward`);
      assert.ok(ticks.has(end), `${step.context}: end is not a real observation`);
      assert.ok(end <= Date.parse(source.data.endUtc), `${step.context}: end is outside event coverage`);
    }
  }
});

test('station cues select real stations with actual samples at both playback endpoints', () => {
  for (const step of steps) {
    if (step.cue.route !== 'dynamic-quake') {
      assert.equal(step.cue.stationId, undefined, `${step.context}: a station cannot be selected in this route`);
      continue;
    }
    const station = quake.stations.find(item => item.id === step.cue.stationId);
    assert.ok(station, `${step.context}: unknown earthquake station ${step.cue.stationId}`);
    for (const timeUtc of [step.cue.timeUtc, step.cue.endTimeUtc].filter(Boolean)) {
      const sample = station.samples.find(item => Date.parse(item.timeUtc) === Date.parse(timeUtc));
      assert.ok(sample && Number.isFinite(sample.value), `${step.context}: selected station has no actual numeric observation at ${timeUtc}`);
    }
  }
});

test('teaching progress is finite, bounded and advances only within its model', () => {
  for (const step of steps) {
    if (!teachingRoutes.has(step.cue.route)) {
      assert.equal(step.cue.progress, undefined, `${step.context}: real observations must use timestamp cues`);
      assert.equal(step.cue.endProgress, undefined, `${step.context}: real observations must not use teaching progress`);
      continue;
    }
    assert.ok(Number.isFinite(step.cue.progress) && step.cue.progress >= 0 && step.cue.progress <= 1, `${step.context}: invalid teaching progress`);
    if (step.cue.endProgress !== undefined) {
      assert.ok(Number.isFinite(step.cue.endProgress) && step.cue.endProgress >= 0 && step.cue.endProgress <= 1, `${step.context}: invalid end progress`);
      assert.ok(step.cue.endProgress >= step.cue.progress, `${step.context}: teaching interval runs backward`);
    }
    assert.equal(step.cue.timeUtc, undefined, `${step.context}: teaching model must not borrow a real observation timestamp`);
    assert.equal(step.cue.endTimeUtc, undefined, `${step.context}: teaching model must not borrow a real observation interval`);
  }
});

test('route mapping keeps real observations separate from similarly named teaching models', () => {
  const expected = {
    overview: 'overview', events: 'overview',
    'dynamic-volcano': 'volcano', 'dynamic-quake': 'quake', 'dynamic-storm': 'storm', 'typhoon-real': 'mangkhut',
    orbital: 'orbital', volcano: 'principleVolcano', quake: 'principleQuake', typhoon: 'principleTyphoon', river: 'river', battery: 'battery'
  };
  for (const [route, key] of Object.entries(expected)) {
    assert.equal(chooseTour(route), tours[key], route);
    assert.equal(chooseTour(`#${route}`), tours[key], `hash ${route}`);
  }
  assert.notEqual(chooseTour('dynamic-volcano'), chooseTour('volcano'));
  assert.notEqual(chooseTour('dynamic-quake'), chooseTour('quake'));
  assert.notEqual(chooseTour('dynamic-storm'), chooseTour('typhoon'));
  assert.equal(chooseTour('#dynamic-volcano?view=detail'), tours.volcano);
  assert.equal(chooseTour('unknown-route'), tours.overview);
  assert.equal(chooseTour(undefined), tours.overview);
});
