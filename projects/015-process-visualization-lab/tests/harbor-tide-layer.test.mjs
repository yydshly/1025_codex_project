import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../app/vendor/three.module.js';
import {createHarborTideLayer, harborDirection, harborSkyPath} from '../app/harbor-tide-layer.js';
import {HARBOR_TIDE_IMAGERY} from '../app/harbor-tide-geography.js';

const data = JSON.parse(readFileSync(new URL('../app/data/tide-san-francisco-dynamic.json', import.meta.url)));
const radius = 2;

function element(tag) {
  return {
    tag, style: {}, attrs: {}, dataset: {}, children: [],
    appendChild(child) { this.children.push(child); },
    replaceChildren() { this.children = []; },
    setAttribute(name, value) { this.attrs[name] = String(value); },
    addEventListener() {},
    remove() {},
    ...(tag === 'canvas' ? {getContext: () => ({
      ...Object.fromEntries(['setTransform', 'save', 'restore', 'translate', 'beginPath', 'rect', 'clip', 'fillRect',
        'moveTo', 'lineTo', 'quadraticCurveTo', 'closePath', 'fill', 'stroke'].map(name => [name, () => {}])),
      createLinearGradient: () => ({addColorStop() {}}),
    })} : {}),
  };
}

function setup(loadTexture) {
  const host = element('div');
  host.ownerDocument = {createElement: element, createElementNS: (_ns, tag) => element(tag), createTextNode: () => element('#text')};
  const layer = createHarborTideLayer(radius, host, {imagery: HARBOR_TIDE_IMAGERY, loadTexture});
  const earthRoot = new THREE.Group();
  earthRoot.add(layer.group);
  layer.setData(data);
  layer.setVisible(true);
  return {layer, earthRoot, overlay: host.children[0]};
}

function at(utc) {
  return {
    timeUtc: utc,
    moon: data.moon.find(sample => sample.timeUtc === utc),
    metrics: data.series.map(series => ({id: series.id, sample: series.samples.find(sample => sample.timeUtc === utc)})),
  };
}

test('the observer coordinates use north-clockwise bearings and break the trace at gaps and the panorama seam', () => {
  const [north, east, below] = [harborDirection(0, 0), harborDirection(90, 0), harborDirection(180, -30)];
  assert.ok(north.distanceTo(new THREE.Vector3(0, 1, 0)) < 1e-10);
  assert.ok(east.distanceTo(new THREE.Vector3(1, 0, 0)) < 1e-10);
  assert.ok(Math.abs(below.z + .5) < 1e-10);
  const times = ['00:00', '00:06', '00:12', '00:30'];
  const samples = [358, 359, 1, 4].map((azimuthDeg, index) => ({timeUtc: '2025-01-15T' + times[index] + ':00Z', azimuthDeg, elevationDeg: 0}));
  assert.match(harborSkyPath(samples, {left: 0, right: 360, top: 0, bottom: 180}), /^M358\.00,90\.00L359\.00,90\.00M1\.00,90\.00M4\.00,90\.00$/);
});

test('one committed clock supplies the directional marker, sky altitude and distinct NOAA gauge values', async () => {
  const {layer, earthRoot, overlay} = setup(() => Promise.resolve(new THREE.Texture()));
  assert.equal(await layer.whenReady(), true);
  assert.equal(layer.getBasemapStatus(), 'ready');
  layer.setView('detail');
  const local = layer.getFrame(), w = 360, h = 530;
  const camera = new THREE.PerspectiveCamera(39, w / h, .000015, 12);
  camera.position.copy(local.target).addScaledVector(local.up, .003).addScaledVector(local.north, -.001);
  camera.up.copy(local.north);
  camera.lookAt(local.target);
  for (const [timeUtc, horizon] of [['2025-01-15T00:00:00Z', 'below'], ['2025-01-15T09:36:00Z', 'above'], ['2025-01-15T16:48:00Z', 'below']]) {
    const sample = at(timeUtc);
    assert.equal(layer.setSnapshot(sample), true);
    layer.project(camera, earthRoot, w, h);
    assert.equal(overlay.dataset.observedTime, timeUtc);
    assert.equal(overlay.dataset.moonHorizon, horizon);
    assert.equal(overlay.dataset.observedLevel, String(sample.metrics[0].sample.value));
    assert.equal(overlay.dataset.predictedLevel, String(sample.metrics[1].sample.value));
    const moon = earthRoot.getObjectByName('scaled-lunar-direction').getWorldPosition(new THREE.Vector3());
    assert.ok(Math.abs(moon.length() - radius * 1.54) < 1e-8);
    assert.ok(moon.distanceTo(layer.getOverviewMoonPosition(sample.moon)) < 1e-8);
  }
  assert.ok(earthRoot.getObjectByName('scaled-lunar-direction-guide').geometry.attributes.position.count > 200);
  layer.setNarrationFocus('set');
  assert.equal(overlay.dataset.observedTime, '2025-01-15T16:48:00Z', 'framing must not seek');
  assert.equal(overlay.dataset.skyFraming, 'horizon');
  layer.setNarrationFocus(null);
  layer.setSnapshot(at('2025-01-15T17:06:00Z'));
  const findSky = (node, name) => node.attrs.class === name
    ? node : node.children.map(child => findSky(child, name)).find(Boolean);
  assert.equal(findSky(overlay, 'tide-moon-disc').style.display, 'none');
  assert.equal(findSky(overlay, 'tide-moon-below-marker').style.display, '');
  layer.setNarrationFocus('set');
  layer.setSnapshot(at('2025-01-15T09:36:00Z'));
  assert.equal(overlay.dataset.skyFraming, 'panorama', 'a distant Moon remains in view');
  layer.setNarrationFocus('peak');
  layer.setSnapshot(at('2025-01-15T19:54:00Z'));
  assert.equal(overlay.dataset.tideDelta, '0.059');
  const sample = at('2025-01-15T09:36:00Z');
  layer.setSnapshot({...sample, metrics: [{id: 'observed', sample: {value: 0}}, {id: 'predicted', sample: null}]});
  assert.equal(overlay.dataset.tideDelta, undefined, 'missing forecast must clear prior comparison');
  layer.setNarrationFocus(null);
  assert.equal(overlay.dataset.narrationFocus, undefined);
  assert.equal(overlay.dataset.observedLevel, '0');
  assert.equal(overlay.dataset.predictedLevel, '');
  assert.deepEqual(layer.getVisibleAnnotations(), ['moon', 'observed']);
  const {observedMin, observedMax} = data.moments;
  layer.setSnapshot(at(observedMin.timeUtc));
  const low = Number(overlay.dataset.waterlineY);
  const highSample = at(observedMax.timeUtc);
  layer.setSnapshot(highSample);
  const high = overlay.dataset.waterlineY;
  assert.ok(low - Number(high) > 55, 'the rising water covers the fixed shoreline');
  layer.zoomLocal(3);
  assert.equal(overlay.dataset.localZoom, '1.55');
  layer.setSnapshot({...highSample, predicted: -8});
  assert.equal(overlay.dataset.waterlineY, high, 'the forecast cannot move the shoreline');
  assert.equal(overlay.dataset.localZoom, '1.55', 'timeline updates preserve the chosen zoom');
  layer.resetLocalZoom();
  assert.equal(overlay.dataset.localZoom, '1');
  layer.setSnapshot({...highSample, metrics: [{id: 'observed', sample: null}, highSample.metrics[1]]});
  assert.equal(overlay.dataset.waterlineY, undefined, 'no waterline is inferred when a measurement is missing');
  layer.setVisible(false);
  assert.equal(overlay.hidden, true);
  assert.deepEqual(layer.getVisibleAnnotations(), []);
  layer.dispose();
});
