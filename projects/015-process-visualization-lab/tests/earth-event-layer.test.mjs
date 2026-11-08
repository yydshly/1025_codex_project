import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../app/vendor/three.module.js';
import { createEarthEventLayer, eventMarkerSize } from '../app/earth-event-layer.js';
import { fitSphereDistance } from '../app/camera-fit.js';
import { fitGuidedCloudDistance, guidedCloudShot, GUIDED_CLOUD_CLEARANCE } from '../app/guided-cloud-shot.js';
import { latLonToVector } from '../app/globe-effects.js';
import { BIG_PINEY_GEOGRAPHY } from '../app/river-big-piney-geography.js';
import { HARBOR_TIDE_IMAGERY } from '../app/harbor-tide-geography.js';
import { createTideTeachingLayer, tideLessonMoonScale, tideLessonDistanceScale } from '../app/tide-teaching-layer.js';

const t = hour => `2026-11-01T${String(hour).padStart(2, '0')}:00:00Z`;
const observation = (hour, lat = 0, lon = 0, extra = {}) => ({ timeUtc: t(hour), lat, lon, ...extra });
const event = (id, kind = 'quake', records = [observation(1)], extra = {}) => ({
  id, kind, title: id, timeUtc: records[0]?.timeUtc ?? t(1), lat: records.at(-1)?.lat ?? 0, lon: records.at(-1)?.lon ?? 0,
  magnitude: null, depthKm: null, observations: records, ...extra,
});
const object = (layer, name) => layer.group.getObjectByName(name);

test('catalogue uses actual latest reports, then UTC filter reveals only records at/before the clock', () => {
  const layer = createEarthEventLayer();
  layer.setEvents([event('early', 'quake', [observation(1, 1, 2)]), event('late', 'quake', [observation(3, 3, 4)]), event('storm', 'storm', [observation(2, 10, 100), observation(4, 12, 110)])]);
  assert.equal(layer.getVisibleRecords().find(row => row.id === 'storm').lon, 110);
  layer.setTime(t(0)); assert.equal(layer.getVisibleRecords().length, 0);
  layer.setTime(t(2)); assert.deepEqual(layer.getVisibleRecords().map(row => row.id), ['early', 'storm']);
  assert.equal(layer.getVisibleRecords().find(row => row.id === 'storm').lon, 100);
  layer.setTime(t(3)); assert.equal(layer.getVisibleRecords().length, 3);
  layer.setTime(null); assert.equal(layer.getVisibleRecords().find(row => row.id === 'storm').lon, 110);
  assert.throws(() => layer.setTime('2026-11-01T03:00:00+08:00'), /UTC/);
});

test('selected storm reveals original positions through the chosen index and no future points', () => {
  const input = [event('storm', 'storm', [observation(1, 0, 0), observation(2, 0, 8), observation(3, 8, 15)])];
  const original = structuredClone(input), layer = createEarthEventLayer(); layer.setEvents(input); layer.selectEvent('storm');
  assert.equal(layer.getSelection().index, 2);
  layer.setObservation(1);
  assert.deepEqual(layer.getSelection().record, input[0].observations[1]);
  const points = object(layer, 'selected-storm-original-observations'), path = object(layer, 'reported-position-connectors-not-reconstructed-track');
  assert.equal(points.geometry.attributes.position.count, 2);
  assert.equal(path.visible, true);
  assert.ok(path.geometry.attributes.position.count > 2, 'spherical connector is tessellated only as geometry');
  assert.equal(layer.getSelection().event.observations.length, 3, 'render vertices never become observations');
  layer.setTime(t(1)); assert.equal(points.geometry.attributes.position.count, 1); assert.equal(path.visible, false);
  assert.equal(layer.getSelection().index, 0);
  layer.setTime(null); assert.equal(layer.getSelection().index, 1, 'removing cutoff preserves chosen original index');
  layer.setObservation(0); assert.equal(points.geometry.attributes.position.count, 1);
  assert.deepEqual(input, original, 'input records are unchanged');
});

test('a single source location is shown without manufacturing a timeline or path', () => {
  const layer = createEarthEventLayer(); layer.setEvents([event('empty', 'volcano', [], { lat: 30, lon: 120 })]);
  layer.selectEvent('empty');
  assert.equal(layer.getSelection().observation, null); assert.equal(layer.getSelection().index, -1);
  assert.equal(layer.getVisibleRecords().length, 1);
  assert.equal(object(layer, 'reported-position-connectors-not-reconstructed-track').visible, false);
  layer.setTime(t(0)); assert.equal(layer.getSelection(), null); assert.equal(layer.getSelectedPosition(), null);
  layer.setTime(null); assert.equal(layer.getSelectedPosition().isVector3, true);
  layer.setEvents([event('empty', 'volcano', [observation(2, 30, 120)])]);
  assert.equal(layer.getSelection().index, 0, 'newly provided actual observations become selectable');
});

test('geographic positions use north +Y, Greenwich +X and east −Z; data magnitude is only a symbol class', () => {
  const layer = createEarthEventLayer(); layer.setEvents([event('g', 'quake', [observation(1)]), event('e', 'quake', [observation(1, 0, 90)]), event('n', 'quake', [observation(1, 90, 0)])]);
  const position = id => { layer.selectEvent(id); return layer.getSelectedPosition(); };
  assert.ok(position('g').distanceTo(new THREE.Vector3(2.018, 0, 0)) < 1e-10);
  assert.ok(position('e').distanceTo(new THREE.Vector3(0, 0, -2.018)) < 1e-10);
  assert.ok(position('n').distanceTo(new THREE.Vector3(0, 2.018, 0)) < 1e-10);
  assert.deepEqual([null, 0, 4.5, 5, 6, 7, 9].map(value => eventMarkerSize('quake', value)), [12, 12, 12, 15, 19, 23, 23]);
});

test('volcano pin has fixed symbol length regardless of magnitude/depth and cannot imply plume height', () => {
  const layer = createEarthEventLayer(); layer.setEvents([event('v1', 'volcano', [observation(1, 0, 0)], { magnitude: 1, depthKm: 2 }), event('v2', 'volcano', [observation(1, 40, 100)], { magnitude: 9, depthKm: 500 })]);
  const pins = object(layer, 'volcano-location-pins-not-plume-heights').geometry.attributes.position;
  assert.equal(pins.count, 4);
  for (let i = 0; i < 4; i += 2) {
    const start = new THREE.Vector3().fromBufferAttribute(pins, i), end = new THREE.Vector3().fromBufferAttribute(pins, i + 1);
    assert.ok(Math.abs(end.length() - 2.1) < 2e-7); assert.ok(Math.abs(start.distanceTo(end) - .094) < 2e-7);
  }
  assert.equal(object(layer, 'selected-storm-original-observations').visible, false);
});

test('point picking ignores the far side and hidden mode', () => {
  const layer = createEarthEventLayer(); layer.setEvents([event('back', 'quake', [observation(1, 0, 180)]), event('front', 'quake', [observation(1, 0, 0)])]);
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 100); camera.position.set(8, 0, 0); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  assert.equal(layer.pick(new THREE.Vector2(0, 0), camera), null);
  layer.setVisible(true); assert.equal(layer.pick(new THREE.Vector2(0, 0), camera), 'front');
  layer.setEvents([event('back', 'quake', [observation(1, 0, 180)])]); assert.equal(layer.pick(new THREE.Vector2(0, 0), camera), null);
});

test('bad positions, duplicate IDs, non-UTC and descending source observations are rejected atomically', () => {
  const layer = createEarthEventLayer(); layer.setEvents([event('good')]);
  for (const invalid of [[event('bad', 'quake', [observation(1, 91, 0)])], [event('same'), event('same')], [event('bad', 'storm', [observation(2), observation(1)])], [event('bad', 'quake', [{ ...observation(1), timeUtc: '2026-11-01' }])]]) {
    assert.throws(() => layer.setEvents(invalid)); assert.equal(layer.getVisibleRecords()[0].id, 'good');
  }
  assert.throws(() => layer.selectEvent('missing'), RangeError);
  layer.selectEvent('good'); assert.throws(() => layer.setObservation(.5), TypeError);
});

test('selection is cleared by removed events and disposal releases current GPU resources once', () => {
  const layer = createEarthEventLayer(); layer.setEvents([event('q')]); layer.selectEvent('q'); layer.setEvents([]);
  assert.equal(layer.getSelection(), null); assert.equal(layer.getSelectedPosition(), null); assert.equal(layer.getCount(), 0);
  let disposed = 0; layer.group.traverse(item => { item.geometry?.addEventListener('dispose', () => disposed++); item.material?.addEventListener('dispose', () => disposed++); });
  layer.dispose(); layer.dispose(); layer.setVisible(true); assert.equal(disposed, 8); assert.equal(layer.group.visible, false);
});

// Exercise actual engine control flow without a GPU; rendering and unrelated layers are stubs.
function engineHarness(options = {}, performanceClock = performance) {
  const pending = [], effects = { group: new THREE.Group(), updates: 0, update() { this.updates++; }, getAnnotations: () => [] };
  const element = () => ({ style: { setProperty() {} }, children: [], listeners: {}, offsetWidth: 170, offsetHeight: 36, hidden: false,
    append(...items) { this.children.push(...items); }, appendChild(item) { this.children.push(item); }, replaceChildren() { this.children = []; },
    setAttribute() {}, addEventListener(type, listener) { this.listeners[type] = listener; }, classList: { toggle() {} }, dataset: {}, getBoundingClientRect: () => ({ width: 600, height: 500, top: 0, left: 0 }),
  });
  class Renderer {
    setPixelRatio(value) { this.ratio = value; } getPixelRatio() { return this.ratio; }
    setClearColor() {} setSize() {} render(scene, camera) { this.scene = scene; this.camera = camera; }
  }
  class TextureLoader {
    load(url, resolve) {
      if (url.startsWith('./assets/')) resolve(new THREE.Texture({ width: 2048, height: 1024 }));
      else pending.push({ url, resolve });
    }
  }
  class Controls {
    constructor(camera) { this.camera = camera; this.target = new THREE.Vector3(); this.enabled = this.enableZoom = true; }
    addEventListener() {}
    update() { const vector = this.camera.position.clone().sub(this.target); if (vector.length() < this.minDistance) this.camera.position.copy(this.target).add(vector.setLength(this.minDistance)); this.camera.lookAt(this.target); }
  }
  const layer = () => ({ group: new THREE.Group(), setVisible(value) { this.group.visible = value; }, clear() {}, setFrame: async () => true,
    preload: async () => true, setPresentation() {}, setRelief() {}, setLightDirection() {}, setViewDirection() {}, setStations() {}, setReadings() {}, project() {},
    setComparisonSuppressed() {}, getComparison: () => ({ status: 'unavailable' }),
  });
  const archive = { ...layer(), setReferenceVisible() {}, getCount: () => 0, getHongKongPosition: () => new THREE.Vector3(2, 0, 0), getCurrentPosition: () => null,
    getBaselinePosition: () => null, isBaselineCoincident: () => false,
  };
  const dynamic = { ...layer(), setData(data) { this.data = data; }, setSnapshot: async () => true, selectStation() {}, light() {}, getCloudComparison: () => ({ status: 'unavailable' }) };
  dynamic.group.name = 'observed-event-process'; dynamic.group.visible = false;
  const river = { ...layer(), projections: [], setData(data) { this.data = data; }, setView(view) { this.view = view; }, getBasemapStatus: () => 'ready',
    getFrame() {
      if (!this.data) return null;
      const { lat, lon } = this.data.focus;
      const up = latLonToVector(lat, lon), east = new THREE.Vector3(-Math.sin(lon * Math.PI / 180), 0, -Math.cos(lon * Math.PI / 180));
      return { target: up.clone().multiplyScalar(2.000013), up, east, north: up.clone().cross(east), halfWidth: .00027, halfHeight: .00033, span: .00066 };
    },
    project(camera, earthRoot) { this.projections.push({ camera, earthRoot }); },
  };
  river.group.visible = false;
  const harbor = { ...river, group: new THREE.Group(), projections: [], whenReady: async () => true,
    setSnapshot: () => true, setAnnotations() {}, setNarrationFocus(value) { this.focus = value; },
    getVisibleAnnotations: () => ['station', 'moon', 'observed', 'predicted'],
    setTeachingMode(active, _moonScale, distanceScale) { this.lessonDistance = active ? distanceScale : 1; },
    getOverviewMoonPosition() { return this.data?.moonPosition?.clone().multiplyScalar(this.lessonDistance ?? 1) ?? null; },
    setArrivalBlend(value) { this.arrivalBlend = value; },
  };
  harbor.group.visible = false;
  const battery = { ...layer(), setData(data) { this.data = data; }, setView(view) { this.view = view; },
    setSnapshot(snapshot) { this.snapshot = snapshot; return true; }, setAnnotations() {},
    getFrame: () => ({ target: new THREE.Vector3(), halfWidth: 1.95, halfHeight: 1.13, depth: .56 }),
    getVisibleAnnotations: () => ['voltage', 'current', 'temperature'],
  };
  battery.group.name = 'battery-discharge-observatory'; battery.group.visible = false;
  const diesel = {...battery, group: new THREE.Group(), getVisibleAnnotations: () => ['rpm','torque','railPressure']};
  diesel.group.visible = false;
  const story = { ...layer(), value: null, projections: [], setStory(value) { this.value = value; }, project(camera, earthRoot, width, height, options) { this.projections.push({ camera, earthRoot, width, height, options }); } };
  story.group.name = 'observed-story-annotations'; story.group.visible = false;
  const context = vm.createContext({ THREE: { ...THREE, WebGLRenderer: Renderer, TextureLoader }, OrbitControls: Controls, createEarthEventLayer, fitSphereDistance,
    fitGuidedCloudDistance, guidedCloudShot, GUIDED_CLOUD_CLEARANCE,
    createGlobeEffects: () => effects, SITES: [], latLonToVector,
    createArchiveGlobeLayer: () => archive, createSyncCloudLayer: layer, createSyncStationLayer: layer, createSyncChangeLayer: layer, createDynamicGlobeLayer: () => dynamic,
    createRiverTracerLayer: () => river, BIG_PINEY_GEOGRAPHY,
    createHarborTideLayer: () => harbor, HARBOR_TIDE_IMAGERY,
    createTideTeachingLayer, tideLessonMoonScale, tideLessonDistanceScale,
    createBatteryDischargeLayer: () => battery,
    createDieselEngineLayer: () => diesel,
    createObservedStoryLayer: (radius, labelHost, callbacks) => { story.radius = radius; story.labelHost = labelHost; story.callbacks = callbacks; return story; },
    document: { createElement: element, createElementNS: element }, devicePixelRatio: 1, performance: performanceClock, console,
  });
  const source = fs.readFileSync(new URL('../app/globe-engine.js', import.meta.url), 'utf8').replace(/^import .*?;\r?\n/gm, '').replace('export function createGlobeEngine', 'function createGlobeEngine');
  vm.runInContext(source, context);
  const canvas = element();
  const labels = element();
  labels.ownerDocument = {createElement: element};
  const engine = context.createGlobeEngine(canvas, labels, null, options);
  engine.resize(600, 500);
  const frame = () => engine.render('overview', { scene: {} }, { clock: 1 });
  const settle = () => { for (let i = 0; i < 180; i++) frame(); };
  return { engine, canvas, pending, effects, frame, settle, dynamic, archive, story, river, harbor, battery, diesel };
}

test('engine full views and reset fit the sphere after a narrow resize; detail is explicit', async () => {
  const { engine, settle } = engineHarness(); await engine.ready;
  engine.setLiveEvents([event('q')]); engine.setLiveMode(true); engine.selectLiveEvent('q'); settle();
  engine.setLiveView('detail'); settle(); assert.ok(engine.getCamera().position.length() < 4);
  const reset = engine.resetView(); assert.equal(reset.mode, 'events'); assert.equal(reset.view, 'global'); settle();
  assert.ok(engine.getCamera().position.length() >= fitSphereDistance({ radius: 2.12, fovDegrees: 39, width: 600, height: 500 }) - 1e-8);
  engine.resize(250, 800); settle();
  assert.ok(engine.getCamera().position.length() >= fitSphereDistance({ radius: 2.12, fovDegrees: 39, width: 250, height: 800 }) - 1e-8);
  engine.setArchiveMode(true); engine.setSyncMode(true); engine.setArchiveView('detail'); settle();
  engine.setArchiveView('regional'); settle();
  assert.ok(engine.getCamera().position.length() >= fitSphereDistance({ radius: 2.12, fovDegrees: 39, width: 250, height: 800 }) - 1e-8);
});

test('Big Piney flies the same Earth camera to kilometre scale and restores its globe clipping on exit', async () => {
  let now = 0;
  const { engine, river, dynamic, frame } = engineHarness({}, { now: () => now });
  await engine.ready;
  engine.setDynamicMode(true);
  engine.setDynamicData({ kind: 'river', focus: { lat: 37.8177, lon: -92.0723 }, transects: [{ id: 't1' }] });
  engine.setDynamicView('global', { instant: true });
  const camera = engine.getCamera(), target = river.getFrame().target;
  const globeDistance = camera.position.distanceTo(target);
  assert.ok(globeDistance > 1);
  assert.equal(camera.near, .04);
  engine.setDynamicView('detail');
  const finished = engine.whenDynamicViewReady();
  assert.equal(engine.getRiverViewEvidence().view, 'flight');
  now = 1050;
  frame();
  assert.ok(camera.position.distanceTo(target) < globeDistance);
  now = 2400;
  frame();
  assert.equal(await finished, true);
  const closeDistance = camera.position.distanceTo(target);
  assert.ok(closeDistance < .005);
  assert.ok(camera.near < closeDistance && camera.far > closeDistance);
  assert.equal(engine.getRiverViewEvidence().view, 'detail');
  assert.equal(river.projections.at(-1).camera, camera);
  assert.equal(river.projections.at(-1).earthRoot, dynamic.group.parent);
  engine.setDynamicView('global');
  frame();
  assert.ok(camera.position.distanceTo(target) > 1);
  assert.equal(camera.near, .04);
  assert.equal(river.view, 'global');
});

test('manual camera handoff unlocks the river closeup immediately during its approach', async () => {
  const { engine, river } = engineHarness({}, { now: () => 0 });
  await engine.ready;
  engine.setDynamicMode(true);
  engine.setDynamicData({ kind: 'river', focus: { lat: 37.8177, lon: -92.0723 }, transects: [{ id: 't1' }] });
  engine.setDynamicView('global', { instant: true });
  engine.setDynamicView('detail');
  const ready = engine.whenDynamicViewReady();
  assert.equal(engine.getRiverViewEvidence().view, 'flight');
  engine.setNarrationCameraManual(true);
  assert.equal(await ready, true);
  assert.equal(engine.getRiverViewEvidence().view, 'detail');
  assert.ok(engine.getCamera().position.distanceTo(river.getFrame().target) < .005);
});

test('manual narration can zoom a geographic overview beyond the default fit without resetting on resize', async () => {
  const { engine, canvas, frame } = engineHarness();
  await engine.ready;
  engine.setDynamicMode(true);
  engine.setDynamicData({ kind: 'quake', focus: { lat: 23.8, lon: 121.6 } });
  engine.setDynamicView('global', { instant: true });
  const camera = engine.getCamera(), initial = camera.position.length();
  engine.setNarrationCameraManual(true);
  let handled = false;
  canvas.listeners.keydown({ key: '+', preventDefault() { handled = true; } });
  const zoomed = camera.position.length();
  assert.equal(handled, true);
  assert.ok(zoomed < initial && zoomed > 2);
  engine.resize(280, 515);
  frame();
  assert.ok(Math.abs(camera.position.length() - zoomed) < 1e-10);
  engine.setNarrationCameraManual(false);
  engine.setDynamicView('global', { instant: true });
  assert.ok(camera.position.length() > initial);
});

test('guided cloud shots fit registered view windows and keep the camera fixed across scans in each burst', async () => {
  for (const [kind, cloudShot, baseline] of [['volcano','volcano-early',2.72],['storm','storm-band',3.45],['mangkhut','mangkhut-band',3.25]]) {
    const { engine, story, settle } = engineHarness();
    await engine.ready;
    engine.resize(742, 240);
    if (kind === 'mangkhut') engine.setSyncMode(true);
    else {
      engine.setDynamicMode(true);
      engine.setDynamicData({kind, focus: { lat: 21, lon: 114 }});
    }
    engine.setRecordedNarrationFocus({kind, target: 'cloud', key: 'scan-a', cloudShot});
    settle();
    const camera = engine.getCamera(), first = camera.position.clone();
    assert.ok(first.length() < baseline);
    const region = story.projections.at(-1).options.cloudArea;
    assert.ok(region.width > 40 && region.height > 40);
    assert.ok(region.y >= 240 * .14 && region.y + region.height <= 240 * .86);
    engine.setRecordedNarrationFocus({kind, target: 'cloud', key: 'scan-b', lat: 0, lon: 0, cloudShot});
    settle();
    assert.ok(camera.position.distanceTo(first) < 1e-9);
  }
});

test('manual handoff preserves a close volcanic view across a wider later shot and resize', async () => {
  const { engine, canvas, settle } = engineHarness();
  await engine.ready;
  engine.setDynamicMode(true);
  engine.setDynamicData({kind: 'volcano', focus: {lat: -20.55, lon: -175.38}});
  engine.resize(740, 240);
  engine.setRecordedNarrationFocus({kind: 'volcano', target: 'coldAreaKm2', key: 'early', cloudShot: 'volcano-early'});
  settle();
  const camera = engine.getCamera(), close = camera.position.length();
  assert.ok(close > 2 && close < 2.3);
  engine.setNarrationCameraManual(true);
  canvas.listeners.keydown({key: '-', preventDefault() {}});
  const inspected = camera.position.clone();
  assert.ok(inspected.length() > close);
  engine.setRecordedNarrationFocus({kind: 'volcano', target: 'coldAreaKm2', key: 'later', cloudShot: 'volcano-late'});
  engine.resize(392, 440);
  settle();
  assert.ok(camera.position.distanceTo(inspected) < 1e-9);
  engine.setNarrationCameraManual(false);
  engine.setDynamicView('detail', { observation: true });
  settle();
  assert.ok(camera.position.distanceTo(inspected) > .05);
});

test('the tide introduction fits both bodies and holds the harbor approach when narration time stops', async () => {
  let now = 0, arrivals = 0, taughtLevel = null;
  const { engine, harbor, frame } = engineHarness({
    onTideArrival: () => arrivals++,
    onTideTeachingFrame: (_progress, teaching) => { taughtLevel = teaching.level; },
  }, { now: () => now });
  await engine.ready;
  engine.setDynamicMode(true);
  const focus = { lat: 37.8063, lon: -122.4659 };
  const up = latLonToVector(focus.lat, focus.lon);
  const east = new THREE.Vector3(-Math.sin(focus.lon * Math.PI / 180), 0, -Math.cos(focus.lon * Math.PI / 180));
  const moonPosition = up.clone().multiplyScalar(-1).addScaledVector(east, 2.91);
  engine.setDynamicData({ kind: 'tide', focus, moonPosition });
  engine.setDynamicView('global', { instant: true });
  engine.setTideTeaching('forces', .25);
  frame();
  assert.equal(taughtLevel, 1);
  assert.ok(harbor.getOverviewMoonPosition().length() > moonPosition.length());
  engine.setTideTeaching(null, 0);
  assert.ok(harbor.getOverviewMoonPosition().equals(moonPosition));
  engine.resize(280, 515);
  frame();
  const camera = engine.getCamera();
  camera.updateMatrixWorld();
  for (const [center, radius] of [[new THREE.Vector3(), 2], [moonPosition, .122]]) {
    const vertices = new THREE.SphereGeometry(radius, 20, 12).getAttribute('position');
    for (let i = 0; i < vertices.count; i++) {
      const projected = new THREE.Vector3().fromBufferAttribute(vertices, i).add(center).project(camera);
      assert.ok(Math.abs(projected.x) < .97 && Math.abs(projected.y) < .97);
    }
  }
  const station = harbor.getFrame().target;
  assert.ok(camera.position.clone().sub(station).dot(up) > 0);
  const moonRay = moonPosition.clone().sub(camera.position).normalize();
  assert.ok(camera.position.clone().addScaledVector(moonRay, -camera.position.dot(moonRay)).length() > 2);

  const overview = camera.position.clone();
  engine.setDynamicView('detail', { scripted: true });
  const finished = engine.whenDynamicViewReady();
  frame();
  assert.ok(camera.position.distanceTo(overview) < 1e-8);
  engine.setTideFlightProgress(.88);
  frame();
  const held = camera.position.clone();
  assert.equal(harbor.view, 'detail');
  assert.ok(harbor.arrivalBlend > 0 && harbor.arrivalBlend < 1);
  assert.equal(engine.getTideViewEvidence().basemapDisplayed, true);
  now = 60_000;
  frame();
  assert.ok(camera.position.distanceTo(held) < 1e-8);
  engine.setTideFlightProgress(1);
  frame();
  assert.equal(await finished, true);
  assert.equal(harbor.arrivalBlend, 1);
  assert.equal(arrivals, 1);
  assert.equal(engine.getTideViewEvidence().basemapDisplayed, false);
  assert.ok(camera.position.distanceTo(station) < .005);
});

test('manual tide inspection settles a running flight, preserves the chosen camera, and lets narration keep marking the story', async () => {
  let now = 0, arrivals = 0;
  const { engine, harbor, frame } = engineHarness({ onTideArrival: () => arrivals++ }, { now: () => now });
  await engine.ready;
  engine.setDynamicMode(true);
  engine.setDynamicData({ kind: 'tide', focus: {lat: 37.806305, lon: -122.46589} });
  engine.setDynamicView('detail', { scripted: true });
  const ready = engine.whenDynamicViewReady();
  engine.setTideFlightProgress(.54);
  frame();
  assert.equal(engine.getTideViewEvidence().view, 'flight');

  engine.setNarrationCameraManual(true);
  assert.equal(await ready, true, 'the handoff completes the view needed by a pending narration chapter');
  frame();
  const manual = engine.getCamera().position.clone();
  assert.equal(engine.getTideViewEvidence().view, 'detail');
  assert.equal(harbor.arrivalBlend, 1);
  assert.equal(arrivals, 1);

  engine.setTideNarrationFocus('rise');
  now += 1200;
  frame();
  assert.equal(harbor.focus, 'rise');
  assert.ok(engine.getCamera().position.distanceTo(manual) < 1e-8);

  engine.setNarrationCameraManual(false);
  engine.setTideNarrationFocus('peak');
  now += 1200;
  frame();
  assert.ok(engine.getCamera().position.distanceTo(manual) > 1e-5);
});

for (const kind of ['battery','engine']) test(`leaving a ${kind} inspection mid-flight restores the Earth before the next case`, async () => {
  let now = 0;
  const { engine, battery, diesel, dynamic, frame } = engineHarness({}, { now: () => now });
  const device=kind==='engine'?diesel:battery;
  await engine.ready;
  engine.setDynamicMode(true);
  engine.setDynamicData({ kind, focus: null });
  engine.setDynamicView('global', { instant: true });
  const earthRoot = dynamic.group.parent;
  assert.equal(earthRoot.visible, true);
  engine.setDynamicView('detail');
  const flight = engine.whenDynamicViewReady();
  now = 1200;
  frame();
  assert.equal(earthRoot.visible, false);
  assert.equal(device.view, 'detail');
  engine.setDynamicMode(false);
  assert.equal(await flight, false);
  assert.equal(earthRoot.visible, true);
  engine.setDynamicData({ kind: 'quake', focus: { lat: 38, lon: 142 } });
  engine.setDynamicMode(true);
  now = 3000;
  frame();
  assert.equal(earthRoot.visible, true);
  assert.equal(device.group.visible, false);
});

test('engine automatic selections and observation playback do not fly the camera, and modes are exclusive', async () => {
  const { engine, effects, frame, settle } = engineHarness(); await engine.ready;
  engine.setLiveEvents([event('q'), event('storm', 'storm', [observation(1, 20, 120), observation(2, 40, -70)])]);
  engine.setLiveMode(true); engine.selectLiveEvent('q'); settle(); const initial = engine.getCamera().position.clone();
  engine.selectLiveEvent('storm', { focus: false }); engine.setLiveObservation(0); engine.setLiveTime(t(1)); settle();
  assert.ok(engine.getCamera().position.distanceTo(initial) < 1e-8); assert.equal(effects.updates, 0);
  assert.equal(engine.getLiveSelection().record.lon, 120);
  engine.setArchiveMode(true); frame(); assert.equal(engine.getRenderer().scene.getObjectByName('source-earth-events').visible, false); assert.equal(effects.updates, 0);
  engine.setArchiveMode(false); frame(); assert.equal(effects.updates, 1);
});

test('late archive images are disposed and cannot replace the Earth material after entering live or synchronized mode', async () => {
  for (const destination of ['live', 'sync', 'dynamic']) {
    const { engine, pending, frame } = engineHarness(); await engine.ready;
    engine.setArchiveMode(true); const request = engine.setArchiveImagery('late-observation.jpg');
    if (destination === 'live') engine.setLiveMode(true); else if (destination === 'sync') engine.setSyncMode(true); else engine.setDynamicMode(true);
    frame(); const earth = engine.getRenderer().scene.children.find(item => item.isGroup).children.find(item => item.isMesh);
    const expected = earth.material, loaded = new THREE.Texture({ width: 2048, height: 1024 }); let disposed = false;
    loaded.addEventListener('dispose', () => { disposed = true; }); pending[0].resolve(loaded);
    assert.equal(await request, false); assert.equal(disposed, true); assert.equal(earth.material, expected);
  }
});

test('engine dynamic, live, archive and synchronized modes are exclusive in both directions', async () => {
  for (const destination of ['live', 'archive', 'sync']) {
    const { engine, effects, frame, dynamic, archive } = engineHarness(); await engine.ready;
    engine.setDynamicData({ kind: 'quake', focus: { lat: 38.297, lon: 142.373 } });
    engine.setDynamicMode(true); frame();
    assert.equal(dynamic.group.visible, true);
    assert.equal(archive.group.visible, false);
    assert.equal(effects.updates, 0);
    if (destination === 'live') engine.setLiveMode(true);
    else if (destination === 'archive') engine.setArchiveMode(true);
    else engine.setSyncMode(true);
    frame();
    assert.equal(dynamic.group.visible, false, `${destination} must hide the prior dynamic layer`);
    assert.equal(engine.resetView().mode, destination === 'live' ? 'events' : 'archive');
    assert.equal(archive.group.visible, destination !== 'live');
    engine.setDynamicMode(true); frame();
    assert.equal(dynamic.group.visible, true);
    assert.equal(archive.group.visible, false);
    assert.equal(engine.getRenderer().scene.getObjectByName('source-earth-events').visible, false);
    assert.equal(engine.resetView().mode, 'dynamic');
    assert.equal(effects.updates, 0, 'no simulated effect update runs during these observed modes');
  }
});

test('engine projects observed annotations through the same Earth root and camera as the active real process', async () => {
  const selected = [], { engine, story, dynamic, frame } = engineHarness({ onStorySelect: (target, pin) => selected.push({ target, pin }) });
  await engine.ready;
  const payload = { id: 'station-reading', timeUtc: t(1), lines: [], pins: [{ id: 'sample', lat: 38, lon: 142, target: 'station-chart' }] };
  engine.setDynamicData({ kind: 'quake', focus: { lat: 38, lon: 142 } }); engine.setDynamicMode(true); engine.setObservedStory(payload); frame();
  assert.equal(story.radius, 2); assert.equal(story.value, payload); assert.equal(story.group.visible, true);
  assert.equal(story.group.parent, dynamic.group.parent, 'annotations must share the process Earth, not a second coordinate root');
  assert.equal(story.projections.length, 1);
  const first = story.projections[0]; assert.equal(first.earthRoot, story.group.parent); assert.equal(first.camera, engine.getCamera()); assert.deepEqual([first.width, first.height], [600, 500]);
  story.callbacks.onSelect('station-chart', payload.pins[0]); assert.deepEqual(selected, [{ target: 'station-chart', pin: payload.pins[0] }]);
  engine.resize(280, 700); frame();
  assert.deepEqual([story.projections.at(-1).width, story.projections.at(-1).height], [280, 700]);
  engine.setObservedStory(null); assert.equal(story.value, null); assert.equal(story.group.visible, false);
});

test('observed annotations are only projected for dynamic or synchronized evidence, and other modes hide them', async () => {
  const { engine, story, frame } = engineHarness(); await engine.ready;
  const payload = { id: 'same-clock', timeUtc: t(1), lines: [], pins: [] };
  engine.setDynamicData({ kind: 'quake', focus: { lat: 38, lon: 142 } }); engine.setDynamicMode(true); engine.setObservedStory(payload); frame();
  assert.equal(story.group.visible, true); assert.equal(story.projections.length, 1);
  engine.setLiveMode(true); frame();
  assert.equal(story.group.visible, false); assert.equal(story.projections.length, 1, 'live catalogue must not project prior process evidence');
  engine.setArchiveMode(true); engine.setObservedStory(payload); frame();
  assert.equal(story.group.visible, false); assert.equal(story.projections.length, 1, 'best-track-only mode must not retain synchronous cloud annotations');
  engine.setSyncMode(true); engine.setObservedStory(payload); frame();
  assert.equal(story.group.visible, true); assert.equal(story.projections.length, 2); assert.equal(story.projections.at(-1).earthRoot, story.group.parent);
  engine.setArchiveMode(false); frame();
  assert.equal(story.group.visible, false); assert.equal(story.projections.length, 2, 'principle mode must not display observed callouts');
});
