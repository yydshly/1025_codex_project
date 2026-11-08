import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../app/vendor/three.module.js';
import { createSyncChangeLayer } from '../app/sync-change-layer.js';

const bbox = [85, -10, 165, 55];
const frame = (url, minutes = 10) => ({
  url,
  fromTimeUtc: new Date(Date.UTC(2018, 8, 16, 0, minutes - 10)).toISOString(),
  timeUtc: new Date(Date.UTC(2018, 8, 16, 0, minutes)).toISOString(),
});

async function withLoader(run) {
  const original = THREE.TextureLoader.prototype.load, requests = [];
  THREE.TextureLoader.prototype.load = function (url, onLoad, _progress, onError) {
    const texture = new THREE.Texture();
    const entry = { url, texture, onLoad, onError, releases: 0 };
    texture.addEventListener('dispose', () => { entry.releases++; });
    requests.push(entry);
    return texture;
  };
  try { await run({ requests, succeed: entry => entry.onLoad(entry.texture) }); }
  finally { THREE.TextureLoader.prototype.load = original; }
}

test('only exact ten-minute UTC pairs can display; null clears without fetching or requiring bounds', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncChangeLayer();
  const initial = layer.setFrame(frame('valid'), bbox); succeed(requests[0]);
  assert.equal(await initial, true);
  for (const invalid of [
    { ...frame('gap'), fromTimeUtc: '2018-09-15T23:50:00Z' },
    { ...frame('reverse'), fromTimeUtc: '2018-09-16T00:20:00Z' },
    { ...frame('same'), fromTimeUtc: '2018-09-16T00:10:00Z' },
    { ...frame('local'), timeUtc: '2018-09-16T08:10:00+08:00' },
    { ...frame('bad-date'), timeUtc: '2018-02-30T00:10:00Z' },
  ]) {
    await assert.rejects(layer.setFrame(invalid, bbox));
    assert.equal(layer.group.visible, false);
    assert.equal(layer.group.userData.frame, undefined);
  }
  assert.equal(requests.length, 1, 'invalid pairs never reach the image loader');
  await assert.rejects(layer.setFrame(frame('bounds'), [165, -10, 85, 55]), /ordered/);
  assert.equal(await layer.setFrame(frame('valid'), bbox), true);
  assert.equal(await layer.setFrame(null), false);
  assert.equal(layer.group.visible, false);
  assert.equal(layer.group.children[0].material.map, null);
  assert.equal(requests.length, 1);
  layer.dispose();
}));

test('RGBA display preserves nodata alpha and geographic registration without depth-writing or artificial motion', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncChangeLayer(), metadata = frame('rgba');
  const ready = layer.setFrame(metadata, bbox); succeed(requests[0]); await ready;
  const mesh = layer.group.children[0], material = mesh.material;
  assert.equal(material.transparent, true); assert.equal(material.opacity, 1);
  assert.equal(material.alphaTest, 0, 'retain PNG alpha, without thresholding it into a new mask');
  assert.equal(material.depthWrite, false); assert.equal(material.depthTest, true);
  assert.equal(material.toneMapped, false); assert.equal(material.side, THREE.FrontSide);
  assert.equal(material.map.colorSpace, THREE.SRGBColorSpace);
  assert.equal(material.map.flipY, true); assert.equal(material.map.premultiplyAlpha, false);
  assert.equal(material.alphaMap, null); assert.equal(mesh.renderOrder, 2);
  assert.deepEqual(groupRotation(layer.group), [0, 0, 0]);
  assert.deepEqual(layer.group.userData.frame, metadata);
  const p = new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position, 0);
  const lat = 55 * Math.PI / 180, lon = 85 * Math.PI / 180;
  assert.ok(p.distanceTo(new THREE.Vector3(2.008 * Math.cos(lat) * Math.cos(lon), 2.008 * Math.sin(lat), -2.008 * Math.cos(lat) * Math.sin(lon))) < 2e-7);
  assert.equal(mesh.geometry.attributes.uv.getX(0), 0); assert.equal(mesh.geometry.attributes.uv.getY(0), 1);
  layer.dispose();
}));

function groupRotation(group) { return [group.rotation.x, group.rotation.y, group.rotation.z]; }

test('out-of-order loads cannot replace the latest pair; cache hits bind synchronously', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncChangeLayer();
  const first = layer.setFrame(frame('one'), bbox); succeed(requests[0]); await first;
  const old = layer.setFrame(frame('slow', 20), bbox);
  assert.equal(layer.group.visible, false); assert.equal(layer.group.userData.frame, undefined);
  const latest = layer.setFrame(frame('latest', 30), bbox);
  succeed(requests[2]); assert.equal(await latest, true);
  succeed(requests[1]); assert.equal(await old, false);
  assert.equal(layer.group.userData.frame.url, 'latest');
  const cached = layer.setFrame(frame('slow', 20), bbox);
  assert.equal(layer.group.visible, true, 'inspect before await: cached binding is synchronous');
  assert.equal(layer.group.children[0].material.map, requests[1].texture);
  assert.equal(layer.group.userData.frame.timeUtc, frame('slow', 20).timeUtc);
  assert.equal(await cached, true); assert.equal(requests.length, 3);
  layer.dispose();
}));

test('clear invalidates an in-flight pair and transport failure leaves no previous overlay', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncChangeLayer();
  const old = layer.setFrame(frame('cleared'), bbox); layer.clear(); succeed(requests[0]);
  assert.equal(await old, false); assert.equal(layer.group.visible, false);
  assert.equal(layer.group.userData.frame, undefined);
  const cached = layer.setFrame(frame('cleared'), bbox);
  assert.equal(layer.group.visible, true); assert.equal(await cached, true);
  const failed = layer.setFrame(frame('failed', 20), bbox); requests[1].onError(new Error('missing'));
  assert.equal(await failed, false); assert.equal(layer.group.visible, false);
  assert.equal(layer.group.children[0].material.map, null); assert.equal(requests[1].releases, 1);
  layer.dispose();
}));

test('switching to raw or disabled mode cancels pending display, does not fetch while hidden, and never revives stale imagery', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncChangeLayer();
  const initial = layer.setFrame(frame('initial'), bbox); succeed(requests[0]); await initial;
  const pending = layer.setFrame(frame('loading', 20), bbox);
  layer.setVisible(false);
  assert.equal(await layer.setFrame(frame('hidden', 30), bbox), false);
  assert.equal(requests.length, 2, 'host mode prevents hidden downloads');
  layer.setVisible(true);
  assert.equal(layer.group.visible, false, 're-enabling needs an explicit current pair');
  succeed(requests[1]); assert.equal(await pending, false);
  assert.equal(layer.group.visible, false); assert.equal(layer.group.userData.frame, undefined);
  const selected = layer.setFrame(frame('loading', 20), bbox);
  assert.equal(layer.group.visible, true); assert.equal(await selected, true);
  layer.setVisible(false); layer.setVisible(true);
  assert.equal(layer.group.visible, false); assert.equal(layer.group.children[0].material.map, null);
  layer.dispose();
}));

test('same-URL requests share transport and freeze the selected pair metadata', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncChangeLayer(), selected = frame('same'), bounds = [...bbox];
  const old = layer.setFrame(frame('same'), bbox), latest = layer.setFrame(selected, bounds);
  selected.timeUtc = 'changed externally'; bounds[0] = 0;
  assert.equal(requests.length, 1); succeed(requests[0]);
  assert.equal(await old, false); assert.equal(await latest, true);
  assert.equal(layer.group.userData.frame.timeUtc, frame('same').timeUtc);
  assert.deepEqual(layer.group.userData.bbox, bbox);
  layer.dispose();
}));

test('preload preserves current frame and geometry, shares selection transport, and enables synchronous cached commits', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncChangeLayer();
  const first = layer.setFrame(frame('current'), bbox); succeed(requests[0]); await first;
  const mesh = layer.group.children[0], geometry = mesh.geometry, current = layer.group.userData.frame;
  const prepared = layer.preload(frame('next', 20), bbox);
  assert.equal(layer.group.visible, true); assert.equal(layer.group.userData.frame, current);
  assert.equal(mesh.geometry, geometry); assert.equal(mesh.material.map, requests[0].texture);
  succeed(requests[1]); assert.equal(await prepared, true);
  assert.equal(layer.group.userData.frame, current); assert.equal(mesh.geometry, geometry);
  const commit = layer.setFrame(frame('next', 20), bbox);
  assert.equal(layer.group.visible, true); assert.equal(layer.group.userData.frame.url, 'next');
  assert.equal(mesh.material.map, requests[1].texture); assert.equal(await commit, true);
  const inFlight = layer.preload(frame('shared', 30), bbox);
  const manual = layer.setFrame(frame('shared', 30), bbox);
  assert.equal(requests.length, 3); succeed(requests[2]);
  assert.equal(await inFlight, false, 'manual selection supersedes the prepare token');
  assert.equal(await manual, true); assert.equal(layer.group.userData.frame.url, 'shared');
  layer.dispose();
}));

test('preload validates pairs, protects current plus next, and cannot revive after hide/clear', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncChangeLayer();
  const first = layer.setFrame(frame('current'), bbox); succeed(requests[0]); await first;
  await assert.rejects(layer.preload({ ...frame('bad'), fromTimeUtc: '2018-09-15T23:50:00Z' }, bbox), /10 minutes/);
  assert.equal(layer.group.visible, true); assert.equal(layer.group.userData.frame.url, 'current');
  const stale = layer.preload(frame('stale', 20), bbox);
  const next = layer.preload(frame('next', 30), bbox);
  succeed(requests[2]); assert.equal(await next, true);
  succeed(requests[1]); assert.equal(await stale, false);
  assert.equal(requests[0].releases, 0); assert.equal(requests[2].releases, 0);
  assert.equal(requests[1].releases, 1, 'a stale completion cannot evict the protected prepared frame');
  assert.equal(requests.filter(r => r.releases === 0).length, 2);
  assert.equal(layer.group.userData.frame.url, 'current');
  const loading = layer.preload(frame('cancelled', 40), bbox); layer.setVisible(false);
  succeed(requests[3]); assert.equal(await loading, false);
  assert.equal(await layer.preload(frame('hidden', 50), bbox), false); assert.equal(requests.length, 4);
  layer.setVisible(true); assert.equal(layer.group.visible, false);
  assert.equal(await layer.preload(null), false);
  layer.dispose();
}));

test('two-entry cache protects the displayed pair against multiple stale completions and releases each texture once', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncChangeLayer();
  const old = [10, 20, 30, 40].map(t => layer.setFrame(frame('old-' + t, t), bbox));
  const current = layer.setFrame(frame('current', 50), bbox); succeed(requests[4]); await current;
  for (let i = 0; i < 4; i++) { succeed(requests[i]); assert.equal(await old[i], false); }
  assert.equal(layer.group.userData.frame.url, 'current');
  assert.equal(requests[4].releases, 0, 'active texture survives stale cache insertions');
  assert.equal(requests.filter(r => r.releases === 0).length, 2);
  assert.equal(await layer.setFrame(frame('current', 50), bbox), true);
  assert.equal(requests.length, 5);
  layer.dispose(); layer.dispose();
  assert.ok(requests.every(r => r.releases === 1));
}));

test('dispose resolves pending selections and late callbacks cannot resurrect or double-release resources', () => withLoader(async ({ requests, succeed }) => {
  const layer = createSyncChangeLayer(), mesh = layer.group.children[0];
  let geometryReleases = 0, materialReleases = 0;
  mesh.geometry.addEventListener('dispose', () => { geometryReleases++; });
  mesh.material.addEventListener('dispose', () => { materialReleases++; });
  const pending = layer.setFrame(frame('late'), bbox); layer.dispose(); layer.dispose();
  assert.equal(await pending, false, 'disposal does not await a transport callback');
  succeed(requests[0]);
  assert.equal(layer.group.visible, false); assert.equal(layer.group.userData.frame, undefined);
  assert.equal(requests[0].releases, 1); assert.equal(geometryReleases, 1); assert.equal(materialReleases, 1);
  layer.setVisible(true);
  assert.equal(await layer.setFrame(frame('after-dispose'), bbox), false);
  assert.equal(requests.length, 1);
}));
