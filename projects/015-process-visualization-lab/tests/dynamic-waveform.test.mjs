import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../app/vendor/three.module.js';
import { createDynamicGlobeLayer } from '../app/dynamic-globe-layer.js';
import { dynamicSnapshot } from '../app/dynamic-data.js';
import { latLonToVector } from '../app/globe-effects.js';
import { quakeMotionFrame } from '../app/quake-motion-view.js';

const actual = JSON.parse(fs.readFileSync(new URL('../app/data/quake-dynamic.json', import.meta.url), 'utf8'));
const hualien = JSON.parse(fs.readFileSync(new URL('../app/data/quake-hualien-dynamic.json', import.meta.url), 'utf8'));
async function withLayer(run) {
  const original = globalThis.document, nodes = [], overlays = [];
  const element = tagName => ({ tagName, style: {}, hidden: false, textContent: '', children: [], setAttribute(key, value) { this[key] = value; }, appendChild(child) { this.children.push(child); }, remove() { this.removed = true; } });
  globalThis.document = { createElement: element, createElementNS: (_namespace, tagName) => element(tagName) };
  const host = { appendChild(node) { if (node.tagName === 'span') nodes.push(node); if (node.class === 'quake-motion-overlay') overlays.push(node); } }, layer = createDynamicGlobeLayer(2, host);
  try { await run(layer, nodes, overlays[0]); }
  finally { layer.setVisible(false); globalThis.document = original; }
}
const fixture = samples => ({ ...actual, stations: [{ ...actual.stations[0], samples, sampleIntervalSeconds: 1 }] });
const at = (seconds, value) => ({ timeUtc: new Date(Date.UTC(2022, 0, 1, 0, 0, seconds)).toISOString(), value, min: value, max: value });

test('six real station anchors use their actual coordinates and current records, not a synthetic wavefront', () => withLayer(async (layer, nodes) => {
  layer.setData(actual); layer.setVisible(true);
  const snapshot = dynamicSnapshot(actual, '2011-03-11T05:48:01Z');
  assert.equal(await layer.setSnapshot(snapshot), true);
  const marks = layer.group.children[1];
  assert.equal(nodes.length, 7, 'six stations and the independently located epicenter');
  for (let i = 0; i < actual.stations.length; i++) {
    const station = actual.stations[i], needle = marks.children[i * 3], ring = marks.children[i * 3 + 1];
    const point = new THREE.Vector3().fromBufferAttribute(needle.geometry.attributes.position, 0);
    assert.ok(point.distanceTo(latLonToVector(station.lat, station.lon, 2.018)) < 2e-7);
    assert.ok(ring.position.distanceTo(latLonToVector(station.lat, station.lon, 2.018)) < 1e-12);
    assert.equal(needle.visible, true); assert.equal(ring.visible, true);
    assert.match(nodes[i].textContent, new RegExp(station.stationCode));
    assert.equal(needle.material.color.getHexString(), snapshot.stations[i].sample.value < 0 ? 'b1a1ff' : '7fe7df');
  }
}));

test('missing current measurements hide amplitude glyphs while a measured zero remains visible', () => withLayer(async (layer, nodes) => {
  const data = fixture([at(1, -10), at(2, null), at(3, 0)]);
  layer.setData(data); layer.setVisible(true);
  const [needle, ring] = layer.group.children[1].children;
  await layer.setSnapshot(dynamicSnapshot(data, at(1).timeUtc));
  assert.equal(needle.visible, true);
  await layer.setSnapshot(dynamicSnapshot(data, at(2).timeUtc));
  assert.equal(needle.visible, false); assert.equal(ring.visible, false);
  assert.match(nodes[0].textContent, /缺测/);
  await layer.setSnapshot(dynamicSnapshot(data, at(3).timeUtc));
  assert.equal(needle.visible, true); assert.equal(ring.visible, true);
  assert.doesNotMatch(nodes[0].textContent, /缺测/);
  assert.ok([...needle.geometry.attributes.position.array].every(Number.isFinite));
  layer.setVisible(false);
  assert.equal(layer.group.visible, false);
  assert.ok(nodes.every(node => node.hidden));
}));

test('waveform strips do not draw through explicit nulls, missing seconds, or future windows', () => withLayer(async layer => {
  const data = fixture([at(1, 10), at(2, null), at(3, -7), at(4, 8), at(6, 2), at(7, 100)]);
  layer.setData(data); layer.setVisible(true);
  await layer.setSnapshot(dynamicSnapshot(data, at(6).timeUtc));
  const trail = layer.group.children[1].children[2];
  assert.equal(trail.isLineSegments, true, 'only actual adjacent valid pairs can form a strip segment');
  assert.equal(trail.geometry.attributes.position.count, 2, 'only 3→4 is a valid adjacent pair at time 6; 6→7 is still future');
  await layer.setSnapshot(dynamicSnapshot(data, at(7).timeUtc));
  assert.equal(trail.geometry.attributes.position.count, 4, 'the 6→7 segment appears only when its window has ended');
}));

test('main view station gauge follows committed quake windows at one fixed scale through rewind and station changes', () => withLayer(async (layer, _labels, overlay) => {
  for (const data of [actual, hualien]) {
    layer.setData(data); layer.setVisible(true);
    const [station, other] = data.stations;
    const first = station.samples[0], largest = station.samples.find(sample => Math.abs(sample.value) === station.displayScaleMaxAbsCounts);
    const gauge = overlay.children.at(-1).children.at(-1);
    await layer.setSnapshot(dynamicSnapshot(data, first.timeUtc));
    const firstWidth = Number(gauge.width);
    assert.ok(firstWidth < 1);
    assert.equal(overlay['data-station'], station.id);
    assert.equal(overlay['data-observed-time'], first.timeUtc);
    await layer.setSnapshot(dynamicSnapshot(data, largest.timeUtc));
    assert.equal(Number(gauge.width), 226, 'full bar corresponds to the maximum absolute measured count of this station');
    assert.equal(overlay['data-observed-time'], largest.timeUtc);
    assert.match(overlay['aria-label'], /绝对峰值/);
    layer.selectStation(other.id);
    assert.equal(overlay['data-station'], other.id);
    assert.equal(overlay['data-observed-time'], largest.timeUtc, 'changing station keeps the current clock');
    layer.selectStation(station.id);
    await layer.setSnapshot(dynamicSnapshot(data, first.timeUtc));
    assert.equal(Number(gauge.width), firstWidth, 'rewinding restores the measurement, with its original scale');
  }
  const earth = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(38, 640 / 400, .1, 100);
  const selected = hualien.stations[0];
  camera.position.copy(latLonToVector(selected.lat, selected.lon, 6));
  camera.lookAt(earth.position); camera.updateMatrixWorld();
  assert.equal(layer.project(camera, earth, 640, 400).width, 248);
  assert.equal(overlay.children[1].style.display, '', 'the observed range glyph is projected at the selected station');
  camera.position.negate();
  camera.lookAt(earth.position); camera.updateMatrixWorld();
  assert.equal(layer.project(camera, earth, 640, 400).width, 248, 'manual rotation keeps the selected station waveform readable');
  assert.equal(overlay.children[1].style.display, 'none', 'the geographic glyph does not project through Earth');
  layer.setVisible(false);
  assert.equal(overlay.style.display, 'none');
}));

test('main view uses real min/max envelopes and breaks its trace at an absent sample', () => {
  const samples = [at(1, 10), at(2, null), {...at(3, -7), min: -7, max: 3}, at(4, 8), at(6, 2), at(7, 100)];
  const station = fixture(samples).stations[0];
  const result = quakeMotionFrame(station, samples[4].timeUtc, samples[4]);
  assert.deepEqual(result.history.map(({value, min, max, contiguous}) => [value, min, max, contiguous]), [
    [10, 10, 10, false], [-7, -7, 3, false], [8, 8, 8, true], [2, 2, 2, false],
  ]);
  assert.equal(result.current, samples[4]);
  assert.equal(quakeMotionFrame(station, samples[1].timeUtc, samples[1]).current, null);
});

test('guided three-dimensional ruler uses the signed native peak and disappears for a missing window', () => withLayer(async layer => {
  const data=fixture([{...at(1,-8),min:-8,max:5},at(2,null)]);
  const [station]=data.stations;
  const earth=new THREE.Group();
  const camera=new THREE.PerspectiveCamera(38,640/400,.1,100);
  camera.position.copy(latLonToVector(station.lat,station.lon,6));
  camera.lookAt(earth.position);
  camera.updateMatrixWorld();
  layer.setData(data);
  layer.setVisible(true);
  layer.setQuakeGuide(true);
  const ruler=layer.group.getObjectByName('selected-station-count-ruler');
  await layer.setSnapshot(dynamicSnapshot(data,at(1).timeUtc));
  layer.project(camera,earth,640,400);
  assert.equal(ruler.visible,true);
  assert.ok(ruler.position.distanceTo(latLonToVector(station.lat,station.lon,2.018))<1e-12);
  assert.equal(ruler.getObjectByName('signed-peak-count').position.y,-1);
  assert.equal(ruler.getObjectByName('positive-count-range').scale.y,5/8);
  assert.equal(ruler.getObjectByName('negative-count-range').scale.y,1);
  await layer.setSnapshot(dynamicSnapshot(data,at(2).timeUtc));
  layer.project(camera,earth,640,400);
  assert.equal(ruler.visible,false);
}));

test('replacing an event removes its previous station labels and graphics', () => withLayer(async (layer, nodes) => {
  layer.setData(actual);
  const old = [...nodes];
  layer.setData(fixture([at(1, 2), at(2, -3)]));
  assert.ok(old.every(node => node.removed));
  assert.equal(layer.group.children[1].children.length, 4, 'one station with three glyphs plus the epicenter');
}));

test('an already-resolved cached image cannot resume into a cleared or different event', async () => {
  const original = THREE.TextureLoader.prototype.load, requests = [];
  THREE.TextureLoader.prototype.load = function (url, onLoad) { const texture = new THREE.Texture(); requests.push(() => onLoad(texture)); return texture; };
  try {
    await withLayer(async layer => {
      const data = { kind: 'volcano', bbox: [174, -29, 193, -12], focus: { lat: -20.536, lon: -175.382 } };
      const snapshot = { timeUtc: '2022-01-15T04:20:00Z', frame: { url: 'cached-fixture', timeUtc: '2022-01-15T04:20:00Z' } };
      layer.setData(data); layer.setVisible(true);
      const initial = layer.setSnapshot(snapshot); requests[0](); assert.equal(await initial, true);
      const lateCached = layer.setSnapshot(snapshot);
      layer.setData(null);
      assert.equal(await lateCached, false, 'cached success is invalidated before the parent async continuation');
      assert.equal(layer.group.children[1].children.length, 0);
      layer.setData(data);
      const lateEvent = layer.setSnapshot(snapshot);
      layer.setData(fixture([at(1, 2), at(2, -3)]));
      assert.equal(await lateEvent, false);
      assert.equal(layer.group.children[1].children.length, 4);
    });
  } finally { THREE.TextureLoader.prototype.load = original; }
});
