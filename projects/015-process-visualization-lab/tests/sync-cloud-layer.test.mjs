import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../app/vendor/three.module.js';
import { createSyncCloudLayer, brightnessTemperatureFromGray8, presentationEdgeOpacity, cloudPresentationSample, cloudReliefSample, createObservationPatchGeometry } from '../app/sync-cloud-layer.js';
import { observedCloudComparison } from '../app/observed-cloud-comparison.js';

const bbox = [100, 10, 140, 40];

async function withLoader(run) {
  const original = THREE.TextureLoader.prototype.load;
  const requests = [];
  THREE.TextureLoader.prototype.load = function (url, onLoad, _progress, onError) {
    const texture = new THREE.Texture();
    const entry = { url, texture, releases: 0, onLoad, onError };
    texture.addEventListener('dispose', () => { entry.releases++; });
    requests.push(entry);
    return texture;
  };
  const succeed = entry => entry.onLoad(entry.texture);
  try { await run({ requests, succeed }); }
  finally { THREE.TextureLoader.prototype.load = original; }
}

test('regional UV corners, radius and outward faces match the existing longitude convention', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const ready = layer.setFrame({ url: 'observed.jpg', timeUtc: '2018-09-16T06:00:00Z' }, bbox);
  succeed(requests[0]);
  assert.equal(await ready, true);
  const mesh = layer.group.children[0];
  const { position, uv } = mesh.geometry.attributes;
  const cols = 128, rows = 96;
  const check = (i, lat, lon, u, v) => {
    const a = lat * Math.PI / 180, b = lon * Math.PI / 180;
    const expected = new THREE.Vector3(2.006 * Math.cos(a) * Math.cos(b), 2.006 * Math.sin(a), -2.006 * Math.cos(a) * Math.sin(b));
    assert.ok(new THREE.Vector3().fromBufferAttribute(position, i).distanceTo(expected) < 2e-7);
    assert.equal(uv.getX(i), u); assert.equal(uv.getY(i), v);
  };
  check(0, 40, 100, 0, 1);
  check(cols, 40, 140, 1, 1);
  check(rows * (cols + 1), 10, 100, 0, 0);
  check((rows + 1) * (cols + 1) - 1, 10, 140, 1, 0);
  const idx = mesh.geometry.index;
  for (let i = 0; i < idx.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(position, idx.getX(i));
    const b = new THREE.Vector3().fromBufferAttribute(position, idx.getX(i + 1));
    const c = new THREE.Vector3().fromBufferAttribute(position, idx.getX(i + 2));
    assert.ok(b.sub(a).cross(c.sub(a)).dot(a) > 0, 'each face points outward');
  }
  assert.equal(mesh.material.toneMapped, false);
  assert.equal(mesh.material.transparent, true);
  assert.equal(mesh.material.depthWrite, false);
  assert.equal(mesh.material.depthTest, true);
  assert.equal(mesh.material.side, THREE.FrontSide);
  assert.equal(mesh.material.map.colorSpace, THREE.NoColorSpace);
  assert.equal(mesh.material.map.flipY, true);
  assert.equal(layer.group.rotation.y, 0);
  layer.dispose();
}));

test('palette inversion uses the original encoded byte, preserving endpoints and cold texture variation', () => {
  assert.equal(brightnessTemperatureFromGray8(0), 310);
  assert.equal(brightnessTemperatureFromGray8(255), 180);
  assert.ok(Math.abs(brightnessTemperatureFromGray8(128) - 244.745098) < 1e-6);
  assert.throws(() => brightnessTemperatureFromGray8(NaN), /finite/);
  const sampleAt = kelvin => cloudPresentationSample((310 - kelvin) / 130 * 255);
  assert.equal(sampleAt(285).displayAlpha, 0);
  assert.equal(sampleAt(300).displayAlpha, 0);
  assert.equal(sampleAt(240).displayAlpha, .94);
  assert.ok(Math.abs(sampleAt(262.5).displayAlpha - .47) < 1e-12);
  assert.ok(cloudPresentationSample(128).displayAlpha > .90, 'sRGB-decoding byte128 before the threshold would incorrectly make it nearly transparent');
  assert.ok(sampleAt(210).encodedRgb[0] > sampleAt(240).encodedRgb[0]);
  assert.ok(sampleAt(180).encodedRgb[0] > sampleAt(210).encodedRgb[0]);
  assert.ok(sampleAt(240).encodedRgb[2] > sampleAt(240).encodedRgb[0], 'cold pixels have the declared pale-blue display palette');
});

test('feather has a three-degree geographic width, independent of image extent, and raw ignores it', () => {
  assert.equal(presentationEdgeOpacity([0, .5], bbox), 0);
  assert.equal(presentationEdgeOpacity([1, .5], bbox), 0);
  assert.equal(presentationEdgeOpacity([.5, 0], bbox), 0);
  assert.equal(presentationEdgeOpacity([.5, 1], bbox), 0);
  assert.ok(Math.abs(presentationEdgeOpacity([1.5 / 40, .5], bbox) - .5) < 1e-12);
  assert.ok(Math.abs(presentationEdgeOpacity([1.5 / 80, .5], [80, -20, 160, 50]) - .5) < 1e-12);
  assert.equal(presentationEdgeOpacity([3 / 40, .5], bbox), 1);
  assert.equal(presentationEdgeOpacity([.5, 3 / 30], bbox), 1);
  const gray8 = (310 - 220) / 130 * 255;
  assert.equal(cloudPresentationSample(gray8, { bbox, uv: [0, .5] }).displayAlpha, 0);
  assert.equal(cloudPresentationSample(gray8, { mode: 'raw', bbox, uv: [0, .5] }).displayAlpha, 1);
  for (const mode of ['fusion', 'raw']) assert.equal(cloudPresentationSample(gray8, { mode, sourceAlpha: 0 }).displayAlpha, 0, 'missing source pixels remain missing');
  for (let byte = 0; byte <= 255; byte++) {
    const raw = cloudPresentationSample(byte, { mode: 'raw' });
    assert.deepEqual(raw.encodedRgb, [byte / 255, byte / 255, byte / 255]);
    assert.equal(raw.displayAlpha, 1, 'raw valid source pixels remain opaque at every temperature');
  }
});

test('presentation changes only shader display state, never the selected frame, time, geometry or texture', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const ready = layer.setFrame({ url: 'source', timeUtc: '2018-09-16T06:00:00Z' }, bbox);
  succeed(requests[0]); await ready;
  const mesh = layer.group.children[0], geometry = mesh.geometry, texture = mesh.material.map;
  const frame = { ...layer.group.userData.frame };
  const shader = { uniforms: {}, fragmentShader: THREE.ShaderLib.basic.fragmentShader };
  mesh.material.onBeforeCompile(shader);
  assert.equal(layer.group.userData.presentation, 'fusion');
  assert.equal(shader.uniforms.syncFusion.value, 1);
  assert.deepEqual(shader.uniforms.syncSpanDegrees.value.toArray(), [40, 30]);
  assert.match(shader.fragmentShader, /310\.0 - 130\.0 \* clamp\(sourcePixel\.r/);
  assert.match(shader.fragmentShader, /syncDisplayToLinear\(displayRgb\)/);
  assert.match(shader.fragmentShader, /#include <colorspace_fragment>/, 'Three still performs the final linear-to-display conversion');
  assert.doesNotMatch(shader.fragmentShader, /#include <map_fragment>/, 'default color sampling is replaced, not applied twice');
  layer.setPresentation('raw');
  assert.equal(shader.uniforms.syncFusion.value, 0);
  assert.equal(mesh.material.transparent, false); assert.equal(mesh.material.depthWrite, true);
  assert.equal(mesh.material.depthTest, true); assert.equal(mesh.material.side, THREE.FrontSide);
  layer.setPresentation('fusion');
  assert.equal(shader.uniforms.syncFusion.value, 1);
  assert.equal(mesh.material.transparent, true); assert.equal(mesh.material.depthWrite, false);
  assert.equal(mesh.material.alphaTest, .01);
  assert.equal(mesh.material.map, texture); assert.equal(mesh.geometry, geometry);
  assert.deepEqual(layer.group.userData.frame, frame); assert.equal(layer.group.visible, true);
  assert.equal(requests.length, 1, 'mode changes never reload or synthesize an image');
  assert.throws(() => layer.setPresentation('imaginary'), /fusion or raw/);
  assert.equal(layer.group.userData.presentation, 'fusion');
  layer.dispose();
}));

test('a cached next frame binds synchronously without clearing the globe and cancels an older pending selection', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const first = layer.setFrame({ url: 'first' }, bbox); succeed(requests[0]); await first;
  const preloaded = layer.preload([{ url: 'cached' }], bbox); succeed(requests[1]); await preloaded;
  const pending = layer.setFrame({ url: 'slow' }, bbox);
  assert.equal(layer.group.visible, false);
  const cached = layer.setFrame({ url: 'cached', timeUtc: '2018-09-16T06:10:00Z' }, bbox);
  // Deliberately inspect before awaiting: this is what the render loop sees in this task.
  assert.equal(layer.group.visible, true);
  assert.equal(layer.group.children[0].material.map, requests[1].texture);
  assert.equal(layer.group.userData.frame.timeUtc, '2018-09-16T06:10:00Z');
  assert.equal(requests.length, 3);
  succeed(requests[2]); assert.equal(await pending, false); assert.equal(await cached, true);
  assert.equal(layer.group.userData.frame.url, 'cached');
  const repeated = layer.setFrame({ url: 'first' }, bbox);
  assert.equal(layer.group.visible, true); assert.equal(layer.group.children[0].material.map, requests[0].texture);
  assert.equal(await repeated, true);
  layer.dispose();
}));

test('a slow comparison cannot attach to a different scan, and missing masks preserve the real scan', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const frames = [0, 10, 20, 30].map(minute => ({
    url: `frame-${minute}`,
    timeUtc: `2022-01-15T04:${String(minute).padStart(2, '0')}:00Z`,
  }));
  const pick = index => layer.setFrame(frames[index], bbox, observedCloudComparison(frames, frames[index], 'volcano'));
  const superseded = pick(1);
  requests[0].texture.image = { width: 4, height: 4 };
  requests[1].texture.image = { width: 4, height: 4 };
  succeed(requests[0]);
  assert.equal(layer.getComparison().status, 'loading');
  const selected = pick(2);
  requests[2].texture.image = { width: 4, height: 4 };
  requests[3].texture.image = { width: 4, height: 4 };
  succeed(requests[2]); succeed(requests[3]);
  assert.equal(await selected, true);
  succeed(requests[1]);
  assert.equal(await superseded, false);
  assert.equal(layer.getComparison().status, 'visible');
  assert.equal(layer.getComparison().fromTimeUtc, frames[1].timeUtc);
  assert.equal(layer.group.userData.frame.timeUtc, frames[2].timeUtc);
  const shader = { uniforms: {}, fragmentShader: THREE.ShaderLib.basic.fragmentShader };
  layer.group.children[0].material.onBeforeCompile(shader);
  assert.equal(shader.uniforms.syncComparisonMap.value, requests[3].texture);
  layer.setPresentation('raw');
  assert.equal(layer.getComparison().status, 'raw');
  layer.setPresentation('fusion');
  const absent = pick(3);
  succeed(requests[4]); requests[5].onError();
  assert.equal(await absent, true);
  assert.equal(layer.getComparison().status, 'failed');
  assert.equal(layer.group.userData.frame.timeUtc, frames[3].timeUtc);
  assert.equal(shader.uniforms.syncComparisonMap.value, null);
  layer.dispose();
}));

test('a mode change during loading is honored on completion without extra requests', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const ready = layer.setFrame({ url: 'observed' }, bbox);
  layer.setPresentation('raw');
  succeed(requests[0]); assert.equal(await ready, true);
  const material = layer.group.children[0].material;
  assert.equal(layer.group.userData.presentation, 'raw');
  assert.equal(material.transparent, false); assert.equal(material.map, requests[0].texture);
  assert.equal(material.map.colorSpace, THREE.NoColorSpace); assert.equal(requests.length, 1);
  layer.dispose();
}));

test('new requests immediately hide old imagery and out-of-order loads cannot replace the latest frame', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const first = layer.setFrame({ url: 'one' }, bbox); succeed(requests[0]); await first;
  assert.equal(layer.group.visible, true);
  const second = layer.setFrame({ url: 'two' }, bbox);
  assert.equal(layer.group.visible, false); assert.equal(layer.group.children[0].material.map, null);
  const third = layer.setFrame({ url: 'three' }, bbox);
  succeed(requests[2]); assert.equal(await third, true);
  succeed(requests[1]); assert.equal(await second, false);
  assert.equal(layer.group.userData.frame.url, 'three');
  assert.equal(layer.group.children[0].material.map, requests[2].texture);
  layer.dispose();
}));

test('clear, visibility and failed loads never leave an old frame masquerading as a new one', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const cancelled = layer.setFrame({ url: 'cancelled' }, bbox);
  layer.clear(); succeed(requests[0]); assert.equal(await cancelled, false);
  assert.equal(layer.group.visible, false); assert.equal(layer.group.userData.frame, undefined);
  layer.setVisible(false);
  const hidden = layer.setFrame({ url: 'hidden' }, bbox); succeed(requests[1]); assert.equal(await hidden, true);
  assert.equal(layer.group.visible, false);
  layer.setVisible(true); assert.equal(layer.group.visible, true);
  const failed = layer.setFrame({ url: 'failed' }, bbox); requests[2].onError(new Error('unavailable'));
  assert.equal(await failed, false); assert.equal(layer.group.visible, false);
  assert.equal(layer.group.userData.frame, undefined); assert.equal(requests[2].releases, 1);
  await assert.rejects(layer.setFrame({ url: 'invalid' }, [140, 10, 100, 40]), /ordered/);
  assert.equal(layer.group.visible, false);
  layer.dispose();
}));

test('preload is limited to three and shares in-flight requests without changing visible data or geometry', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const ready = layer.setFrame({ url: 'current' }, bbox); succeed(requests[0]); await ready;
  const mesh = layer.group.children[0], geometry = mesh.geometry;
  const preloaded = layer.preload([{ url: 'a' }, { url: 'b' }, { url: 'c' }, { url: 'ignored' }], [110, 5, 150, 50]);
  assert.equal(requests.length, 4);
  assert.equal(layer.group.userData.frame.url, 'current'); assert.equal(mesh.geometry, geometry);
  assert.equal(layer.group.visible, true);
  const selected = layer.setFrame({ url: 'a' }, bbox);
  assert.equal(requests.length, 4, 'selection reuses preload request');
  requests.slice(1).forEach(succeed);
  assert.deepEqual(await preloaded, [true, true, true]); assert.equal(await selected, true);
  assert.equal(layer.group.userData.frame.url, 'a'); assert.equal(mesh.geometry, geometry);
  layer.dispose();
}));

test('LRU retains at most four loaded textures, protects the visible one, and releases each once', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const current = layer.setFrame({ url: 'current' }, bbox); succeed(requests[0]); await current;
  for (let batch = 0; batch < 4; batch++) {
    const prior = requests.length;
    const loaded = layer.preload([0, 1, 2].map(i => ({ url: `future-${batch * 3 + i}` })), bbox);
    requests.slice(prior).forEach(succeed); await loaded;
  }
  assert.equal(requests.length, 13);
  assert.equal(requests.filter(request => request.releases === 0).length, 4);
  assert.equal(requests[0].releases, 0, 'visible frame remains cached');
  assert.equal(layer.group.userData.frame.url, 'current');
  const count = requests.length;
  assert.equal(await layer.setFrame({ url: 'future-11' }, bbox), true);
  assert.equal(requests.length, count, 'recent frame is served from cache');
  layer.dispose(); layer.dispose();
  assert.ok(requests.every(request => request.releases === 1));
}));

test('disposal during a load releases resources and prevents resurrection on a late callback', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const ready = layer.setFrame({ url: 'late' }, bbox);
  layer.dispose();
  succeed(requests[0]);
  assert.equal(await ready, false);
  assert.equal(layer.group.visible, false); assert.equal(layer.group.children[0].material.map, null);
  assert.equal(requests[0].releases, 1);
  assert.equal(await layer.setFrame({ url: 'after-dispose' }, bbox), false);
  assert.deepEqual(await layer.preload([{ url: 'after-dispose' }], bbox), []);
  assert.equal(requests.length, 1);
}));

const flatStencil = gray8 => ({ east: gray8, west: gray8, north: gray8, south: gray8 });

test('a flat observation patch has no invented bumps or cavities, with only gentle spherical diffuse light', () => {
  const lat = 22, lon = 114, a = lat * Math.PI / 180, b = lon * Math.PI / 180;
  const radial = [Math.cos(a) * Math.cos(b), Math.sin(a), -Math.cos(a) * Math.sin(b)];
  const relief = cloudReliefSample(192, { near: flatStencil(192), far: flatStencil(192), lat, lon, lightDirection: radial });
  assert.deepEqual(relief.gradient, [0, 0]); assert.equal(relief.cavity, 0);
  relief.normal.forEach((component, i) => assert.ok(Math.abs(component - radial[i]) < 1e-12));
  assert.ok(Math.abs(relief.gain - 1.06) < 1e-12); assert.equal(relief.rim, 0);
  assert.equal(relief.bypass, false);
});

test('reversing source gradients reverses the display normal and directional contrast', () => {
  const near = { east: 212, west: 172, north: 192, south: 192 };
  const far = { east: 230, west: 154, north: 192, south: 192 };
  const options = { near, far, lat: 0, lon: 0, lightDirection: [0, 0, -1] };
  const forward = cloudReliefSample(192, options);
  const reverse = cloudReliefSample(192, { ...options, near: { ...near, east: near.west, west: near.east }, far: { ...far, east: far.west, west: far.east } });
  assert.ok(forward.gradient[0] > 0); assert.equal(forward.gradient[0], -reverse.gradient[0]);
  assert.equal(forward.gradient[1], 0); assert.equal(reverse.gradient[1], 0);
  assert.ok(forward.normal[2] > 0); assert.equal(forward.normal[2], -reverse.normal[2]);
  assert.ok(forward.gain < reverse.gain, 'eastward source contrast shades oppositely under the same eastward art light');
});

test('multi-scale relief and cool rim remain bounded for extreme observed contrasts and light directions', () => {
  const directions = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  for (const gray8 of [80, 128, 192, 255]) for (const sign of [false, true]) for (const lightDirection of directions) {
    const near = { east: sign ? 255 : 0, west: sign ? 0 : 255, north: 255, south: 0 };
    const far = { east: 255, west: 0, north: sign ? 255 : 0, south: sign ? 0 : 255 };
    const result = cloudReliefSample(gray8, { near, far, lat: 30, lon: 114, lightDirection, viewDirection: [-.4, .3, -.8] });
    assert.ok(result.gain >= .64 && result.gain <= 1.2);
    assert.ok(result.rim >= 0 && result.rim <= .055);
    assert.ok(result.cavity >= 0 && result.cavity <= .2);
    assert.ok(result.gradient.every(component => Math.abs(component) <= .75));
    assert.ok(Math.abs(Math.hypot(...result.normal) - 1) < 1e-12);
  }
  const valley = cloudReliefSample(128, { near: flatStencil(180), far: flatStencil(180) });
  assert.ok(valley.cavity > 0, 'a darker source center adds only bounded local display contrast');
});

test('nodata and partially valid neighbors cannot manufacture a relief edge', () => {
  const plain = cloudReliefSample(192, { near: flatStencil(192), far: flatStencil(192) });
  const absent = cloudReliefSample(192, {
    near: { east: { gray8: 0, alpha: 0 }, west: 192, north: { gray8: 255, alpha: .5 }, south: 192 },
    far: { east: null, west: { gray8: NaN, alpha: 1 }, north: 192, south: { gray8: 0, alpha: 0 } },
  });
  assert.deepEqual(absent, plain);
  const invalidCenter = cloudReliefSample(192, { sourceAlpha: 0, near: flatStencil(0), far: flatStencil(255) });
  assert.equal(invalidCenter.bypass, true); assert.equal(invalidCenter.gain, 1); assert.equal(invalidCenter.rim, 0);
});

test('raw or disabled relief bypasses neighbor reads and every new shading adjustment', () => {
  const forbidden = new Proxy({}, { get() { throw new Error('source neighbors must not be sampled'); } });
  for (const options of [{ mode: 'raw' }, { enabled: false }, { sourceAlpha: 0 }]) {
    const result = cloudReliefSample(192, { ...options, near: forbidden, far: forbidden, lightDirection: [0, 0, 0] });
    assert.equal(result.bypass, true); assert.equal(result.gain, 1); assert.equal(result.rim, 0);
    assert.deepEqual(result.gradient, [0, 0]);
  }
  assert.equal(cloudReliefSample(0, { near: forbidden }).bypass, true, 'fully faded warm display pixels need no relief sampling');
});

test('relief APIs update local-Earth uniforms without moving UVs, geometry, source frame or clock', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncCloudLayer();
  const frame = { url: 'actual-frame', timeUtc: '2018-09-16T05:00:00Z', width: 1024, height: 878 };
  const ready = layer.setFrame(frame, [85, -10, 165, 55]);
  requests[0].texture.image = { width: 2048, height: 1664 };
  succeed(requests[0]); await ready;
  const mesh = layer.group.children[0], geometry = mesh.geometry, map = mesh.material.map;
  const position = geometry.attributes.position.array.slice(), uv = geometry.attributes.uv.array.slice();
  const shader = { uniforms: {}, fragmentShader: THREE.ShaderLib.basic.fragmentShader };
  mesh.material.onBeforeCompile(shader);
  assert.equal(layer.group.userData.relief, true); assert.equal(shader.uniforms.syncRelief.value, 1);
  assert.deepEqual(shader.uniforms.syncWestSouthDegrees.value.toArray(), [85, -10]);
  assert.deepEqual(shader.uniforms.syncSourceTexel.value.toArray(), [1 / 2048, 1 / 1664], 'sample offsets use actual texture dimensions');
  assert.match(shader.fragmentShader, /syncFusion > 0\.5 && syncRelief > 0\.5/);
  assert.match(shader.fragmentShader, /2\.0 \* syncSourceTexel/); assert.match(shader.fragmentShader, /7\.0 \* syncSourceTexel/);
  assert.match(shader.fragmentShader, /samplePixel\.a >= 0\.999/);
  layer.setLightDirection(new THREE.Vector3(0, 6, 8));
  assert.deepEqual(shader.uniforms.syncLightDirection.value.toArray(), [0, .6, .8]);
  layer.setViewDirection([-3, 0, 4]);
  assert.deepEqual(shader.uniforms.syncViewDirection.value.toArray(), [-.6, 0, .8]);
  assert.equal(shader.uniforms.syncHasView.value, 1);
  layer.setRelief(false); assert.equal(shader.uniforms.syncRelief.value, 0);
  layer.setPresentation('raw'); layer.setRelief(true);
  assert.equal(shader.uniforms.syncFusion.value, 0, 'raw bypass is independent of the stored relief preference');
  layer.setViewDirection(); assert.equal(shader.uniforms.syncHasView.value, 0);
  assert.throws(() => layer.setLightDirection([0, 0, 0]), /nonzero/);
  assert.throws(() => layer.setViewDirection([NaN, 0, 1]), /finite/);
  assert.equal(requests.length, 1); assert.equal(mesh.material.map, map); assert.equal(mesh.geometry, geometry);
  assert.deepEqual(geometry.attributes.position.array, position); assert.deepEqual(geometry.attributes.uv.array, uv);
  assert.deepEqual(layer.group.userData.frame, frame);
  layer.dispose();
}));

test('shared observation patch uses the explicitly requested surface radius without adding an offset', () => {
  const radius = 2.012, geometry = createObservationPatchGeometry([85, -10, 165, 55], radius);
  const position = geometry.attributes.position;
  for (const index of [0, 128, 96 * 129, position.count - 1]) {
    assert.ok(Math.abs(new THREE.Vector3().fromBufferAttribute(position, index).length() - radius) < 2e-7);
  }
  assert.equal(geometry.attributes.uv.getY(0), 1);
  assert.equal(geometry.attributes.uv.getY(position.count - 1), 0);
  geometry.dispose();
  assert.throws(() => createObservationPatchGeometry([85, -10, 165, 55], 0), /positive/);
  assert.throws(() => createObservationPatchGeometry([165, -10, 85, 55], 2), /ordered/);
});
