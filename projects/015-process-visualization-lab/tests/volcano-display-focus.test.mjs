import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from '../app/vendor/three.module.js';
import { cloudPresentationSample, presentationFocusOpacity, createSyncCloudLayer } from '../app/sync-cloud-layer.js';
import { createDynamicGlobeLayer } from '../app/dynamic-globe-layer.js';
import { dynamicSnapshot, longitudeRegistration } from '../app/dynamic-data.js';
import { latLonToVector } from '../app/globe-effects.js';

const root = new URL('../', import.meta.url), read = path => readFileSync(new URL(path, root));
const volcano = JSON.parse(read('app/data/volcano-dynamic.json'));
const storm = JSON.parse(read('app/data/storm-dynamic.json'));
const registration = longitudeRegistration(volcano.bbox);
const focus = { lat: volcano.focus.lat, lon: volcano.focus.lon - registration.origin, innerKm: 400, outerKm: 600 };
const radiusKm = 6371.0088, radians = degrees => degrees * Math.PI / 180;
const sha = input => createHash('sha256').update(input).digest('hex');
const uvAt = (lat, lon) => [(lon - registration.bounds[0]) / (registration.bounds[2] - registration.bounds[0]), (lat - registration.bounds[1]) / (registration.bounds[3] - registration.bounds[1])];
function pointAt(km, bearingDegrees) {
  const a = radians(focus.lat), b = radians(focus.lon), distance = km / radiusKm, bearing = radians(bearingDegrees);
  const lat = Math.asin(Math.sin(a) * Math.cos(distance) + Math.cos(a) * Math.sin(distance) * Math.cos(bearing));
  const lon = b + Math.atan2(Math.sin(bearing) * Math.sin(distance) * Math.cos(a), Math.cos(distance) - Math.sin(a) * Math.sin(lat));
  return { lat: lat * 180 / Math.PI, lon: ((lon * 180 / Math.PI + 180) % 360 + 360) % 360 - 180 };
}
const opacityAt = (km, bearing = 0) => { const point = pointAt(km, bearing); return presentationFocusOpacity(uvAt(point.lat, point.lon), registration.bounds, focus); };

test('spherical focus preserves all pixels through400km and monotonically fades to zero at600km', () => {
  for (const bearing of [0, 45, 90, 180, 225, 270]) {
    for (const km of [0, 100, 300, 399, 400]) assert.ok(Math.abs(opacityAt(km, bearing) - 1) < 1e-12);
    let previous = 1;
    for (let km = 400; km <= 600; km += 5) { const value = opacityAt(km, bearing); assert.ok(value >= 0 && value <= previous + 1e-12); previous = value; }
    for (const km of [600.001, 650, 700]) assert.equal(opacityAt(km, bearing), 0);
  }
  assert.equal(presentationFocusOpacity([.5, .5], registration.bounds, null), 1);
  assert.throws(() => presentationFocusOpacity([.5, .5], registration.bounds, { ...focus, innerKm: 600 }), /radii/);
  assert.throws(() => presentationFocusOpacity([.5, .5], registration.bounds, { ...focus, lat: 91 }), /latitude/);
});

test('focus only multiplies fusion opacity; raw bytes, source alpha and display color stay unchanged', () => {
  for (const km of [0, 300, 400, 500, 650]) {
    const point = pointAt(km, 90), options = { bbox: registration.bounds, uv: uvAt(point.lat, point.lon), sourceAlpha: .75 };
    for (const gray8 of [0, 80, 128, 192, 255]) {
      const plain = cloudPresentationSample(gray8, options), focused = cloudPresentationSample(gray8, { ...options, focusRegion: focus });
      assert.equal(plain.kelvin, focused.kelvin); assert.deepEqual(plain.encodedRgb, focused.encodedRgb);
      assert.ok(Math.abs(focused.displayAlpha - plain.displayAlpha * opacityAt(km, 90)) < 1e-12);
      assert.deepEqual(cloudPresentationSample(gray8, { ...options, mode: 'raw', focusRegion: focus }), cloudPresentationSample(gray8, { ...options, mode: 'raw' }));
    }
  }
  const forbidden = new Proxy({}, { get() { throw new Error('Raw must not inspect focus'); } });
  assert.equal(cloudPresentationSample(192, { mode: 'raw', focusRegion: forbidden }).displayAlpha, 1);
  assert.equal(cloudPresentationSample(192, { focusRegion: focus, sourceAlpha: 0 }).displayAlpha, 0);
});

function compiled(mesh) {
  const shader = { uniforms: {}, fragmentShader: THREE.ShaderLib.basic.fragmentShader };
  mesh.material.onBeforeCompile(shader);
  return shader;
}
function assertFocusInsideFusion(shader) {
  const source = shader.fragmentShader, start = source.indexOf('if (syncFusion > 0.5) {');
  assert.ok(start > 0);
  let depth = 1, end = source.indexOf('{', start) + 1;
  for (; depth && end < source.length; end++) { if (source[end] === '{') depth++; if (source[end] === '}') depth--; }
  const inside = source.slice(start, end), outside = source.slice(0, start) + source.slice(end);
  assert.match(inside, /displayAlpha \*= syncFocusOpacity\(vMapUv\)/);
  assert.doesNotMatch(outside, /displayAlpha \*= syncFocusOpacity/);
  assert.match(source, /smoothstep\(syncFocusCosRadii.x, syncFocusCosRadii.y, cosine\)/);
  assert.match(source, /dot\(radial, syncFocusCenter\)/);
}

test('real material uniforms enable focus without changing frame, texture, geometry or timing and clear resets it', async () => {
  const original = THREE.TextureLoader.prototype.load;
  let calls = 0;
  THREE.TextureLoader.prototype.load = function (_url, onLoad) { calls++; const texture = new THREE.Texture(); queueMicrotask(() => onLoad(texture)); return texture; };
  const layer = createSyncCloudLayer();
  try {
    const frame = volcano.frames[6];
    assert.equal(await layer.setFrame(frame, registration.bounds), true);
    const mesh = layer.group.children[0], shader = compiled(mesh), texture = mesh.material.map, geometry = mesh.geometry;
    assert.equal(shader.uniforms.syncFocusEnabled.value, 0);
    layer.setFocusRegion(focus);
    assert.equal(shader.uniforms.syncFocusEnabled.value, 1);
    assert.deepEqual(shader.uniforms.syncFocusCosRadii.value.toArray(), [Math.cos(600 / radiusKm), Math.cos(400 / radiusKm)]);
    assertFocusInsideFusion(shader);
    for (const mode of ['raw', 'fusion']) {
      layer.setPresentation(mode);
      assert.equal(shader.uniforms.syncFusion.value, mode === 'fusion' ? 1 : 0);
      assert.deepEqual(layer.group.userData.frame, frame);
      assert.equal(mesh.material.map, texture); assert.equal(mesh.geometry, geometry);
    }
    assert.equal(calls, 1);
    layer.clear(); assert.equal(shader.uniforms.syncFocusEnabled.value, 0); assert.equal(layer.group.userData.focusRegion, null);
    layer.setFocusRegion(focus); layer.dispose(); assert.equal(shader.uniforms.syncFocusEnabled.value, 0);
  } finally { layer.dispose(); THREE.TextureLoader.prototype.load = original; }
});

test('Tonga focus shares the dateline registration, restores after hidden/missing frames and never leaks into storm', async () => {
  const originalDocument = globalThis.document, originalLoader = THREE.TextureLoader.prototype.load;
  const element = tagName => ({ tagName, style: {}, hidden: false, textContent: '', children: [], setAttribute(key, value) { this[key] = value; }, appendChild(child) { this.children.push(child); }, remove() {} });
  globalThis.document = { createElement: element, createElementNS: (_ns, name) => element(name) };
  THREE.TextureLoader.prototype.load = function (_url, onLoad) { const texture = new THREE.Texture(); queueMicrotask(() => onLoad(texture)); return texture; };
  const layer = createDynamicGlobeLayer(2, element('host')), cloudGroup = layer.group.children[0], shader = compiled(cloudGroup.children[0]);
  const before = { volcano: JSON.stringify(volcano), storm: JSON.stringify(storm) };
  const fileHashes = Object.fromEntries(['volcano', 'storm'].map(kind => [kind, sha(read(`app/data/${kind}-dynamic.json`))]));
  const imageHashes = [volcano.frames[6], storm.frames[0]].map(frame => ({ url: frame.url, sha: sha(read(`app/${frame.url}`)) }));
  try {
    layer.setData(volcano); layer.setVisible(true);
    assert.equal(registration.origin, 180);
    assert.ok(Math.abs(cloudGroup.userData.focusRegion.lon - 4.6159) < 1e-10);
    assert.equal(cloudGroup.rotation.y, Math.PI);
    cloudGroup.updateMatrixWorld(true);
    const local = shader.uniforms.syncFocusCenter.value.clone(), world = cloudGroup.localToWorld(local);
    assert.ok(world.distanceTo(latLonToVector(volcano.focus.lat, volcano.focus.lon, 1)) < 1e-12);
    assert.equal(await layer.setSnapshot(dynamicSnapshot(volcano, volcano.frames[6].timeUtc)), true);
    layer.setVisible(false); assert.equal(shader.uniforms.syncFocusEnabled.value, 0);
    layer.setVisible(true); await layer.setSnapshot(dynamicSnapshot(volcano, volcano.frames[6].timeUtc)); assert.equal(shader.uniforms.syncFocusEnabled.value, 1);
    await layer.setSnapshot({ timeUtc: volcano.frames[6].timeUtc, frame: null }); assert.equal(shader.uniforms.syncFocusEnabled.value, 0);
    await layer.setSnapshot(dynamicSnapshot(volcano, volcano.frames[7].timeUtc)); assert.equal(shader.uniforms.syncFocusEnabled.value, 1);
    layer.setPresentation('raw'); assert.equal(shader.uniforms.syncFusion.value, 0);
    layer.setData(storm); assert.equal(shader.uniforms.syncFocusEnabled.value, 0); assert.equal(cloudGroup.userData.focusRegion, null);
    await layer.setSnapshot(dynamicSnapshot(storm, storm.frames[0].timeUtc)); assert.equal(shader.uniforms.syncFocusEnabled.value, 0);
    assert.equal(JSON.stringify(volcano), before.volcano); assert.equal(JSON.stringify(storm), before.storm);
    for (const kind of ['volcano', 'storm']) assert.equal(sha(read(`app/data/${kind}-dynamic.json`)), fileHashes[kind], 'frame metadata, hashes and scientific series stay byte-identical');
    for (const frame of imageHashes) assert.equal(sha(read(`app/${frame.url}`)), frame.sha, 'the original observed image is never rewritten');
    layer.setData(null); assert.equal(shader.uniforms.syncFocusEnabled.value, 0);
  } finally { layer.setVisible(false); layer.setData(null); globalThis.document = originalDocument; THREE.TextureLoader.prototype.load = originalLoader; }
});
