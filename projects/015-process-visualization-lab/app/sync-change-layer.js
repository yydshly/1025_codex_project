import * as THREE from './vendor/three.module.js';
import { createObservationPatchGeometry } from './sync-cloud-layer.js';
import { utcMillis } from './sync-timeline.js';

const CACHE_LIMIT = 2;

function checkedBounds(bbox) {
  if (!Array.isArray(bbox) || bbox.length !== 4 || !bbox.every(Number.isFinite)) {
    throw new TypeError('Change image bounds must be [west, south, east, north].');
  }
  const [west, south, east, north] = bbox;
  if (west < -180 || east > 180 || west >= east || south < -90 || north > 90 || south >= north) {
    throw new RangeError('Change image bounds must be an ordered EPSG:4326 rectangle.');
  }
  return bbox.slice();
}

function checkedFrame(frame) {
  if (!frame || typeof frame.url !== 'string' || !frame.url.trim()) throw new TypeError('A change frame URL is required.');
  if (utcMillis(frame.timeUtc) - utcMillis(frame.fromTimeUtc) !== 600000) {
    throw new RangeError('Change frames must pair UTC scans exactly 10 minutes apart.');
  }
  return { ...frame };
}

/** Displays an offline-derived RGBA difference image, without computing or animating motion.
 * Frames must identify two UTC nominal scans exactly ten minutes apart.
 * true means this selection was bound; null, hidden, failed or superseded selections return false.
 * Invalid frame metadata rejects after clearing the prior selection. Cached frames bind before await.
 * setVisible(false) cancels selection and retains the two-entry cache; true alone restores no frame.
 * preload prepares one valid pair without changing selection/geometry, protecting current + next.
 * ImageLoader transport is not abortable here: a late callback can only cache or release its texture.
 */
export function createSyncChangeLayer(radius = 2) {
  if (!Number.isFinite(radius) || radius <= 0) throw new RangeError('A positive globe radius is required.');
  const group = new THREE.Group();
  group.name = 'synchronized-derived-brightness-temperature-change';
  group.visible = false;
  const material = new THREE.MeshBasicMaterial({
    color: '#ffffff', transparent: true, opacity: 1, toneMapped: false,
    depthTest: true, depthWrite: false, side: THREE.FrontSide,
  });
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
  mesh.name = 'epsg4326-ten-minute-change-patch';
  mesh.renderOrder = 2;
  group.add(mesh);
  const loader = new THREE.TextureLoader();
  const cache = new Map(), pending = new Map(), released = new WeakSet();
  let disposed = false, requestedVisible = true, requestId = 0;
  let activeUrl = null, requestedUrl = null, preparedUrl = null, geometryKey = '';

  function release(texture) {
    if (texture && !released.has(texture)) {
      released.add(texture);
      texture.dispose();
    }
  }

  function touch(url) {
    const texture = cache.get(url);
    if (!texture) return null;
    cache.delete(url); cache.set(url, texture);
    return texture;
  }

  function trimCache() {
    while (cache.size > CACHE_LIMIT) {
      const url = [...cache.keys()].find(key => key !== activeUrl && key !== requestedUrl && key !== preparedUrl);
      if (url === undefined) break;
      release(cache.get(url)); cache.delete(url);
    }
  }

  function loadTexture(url) {
    const cached = touch(url);
    if (cached) return Promise.resolve(cached);
    if (pending.has(url)) return pending.get(url).promise;
    let resolve;
    const entry = { texture: null, settled: false, promise: new Promise(done => { resolve = done; }) };
    entry.finish = texture => {
      if (entry.settled) return;
      entry.settled = true;
      if (pending.get(url) === entry) pending.delete(url);
      resolve(texture);
    };
    pending.set(url, entry);
    try {
      entry.texture = loader.load(url, texture => {
        if (disposed) { release(texture); entry.finish(null); return; }
        // The offline PNG already contains display colors and source validity in its alpha channel.
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = true;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.needsUpdate = true;
        cache.set(url, texture); trimCache();
        entry.finish(texture);
      }, undefined, () => { release(entry.texture); entry.finish(null); });
    } catch {
      release(entry.texture); entry.finish(null);
    }
    return entry.promise;
  }

  function hideSelection() {
    activeUrl = null;
    group.visible = false;
    if (material.map) { material.map = null; material.needsUpdate = true; }
    delete group.userData.frame; delete group.userData.bbox;
  }

  function clear() {
    ++requestId;
    requestedUrl = null; preparedUrl = null;
    hideSelection();
  }

  function bind(texture, frame, bounds) {
    const key = bounds.join(',');
    if (key !== geometryKey) {
      const next = createObservationPatchGeometry(bounds, radius + .008);
      mesh.geometry.dispose(); mesh.geometry = next; geometryKey = key;
    }
    activeUrl = frame.url; requestedUrl = null; touch(frame.url);
    const hadMap = Boolean(material.map);
    material.map = texture;
    if (!hadMap) material.needsUpdate = true;
    group.userData.frame = frame; group.userData.bbox = bounds;
    group.visible = requestedVisible;
    trimCache();
  }

  async function setFrame(frame, bbox) {
    const token = ++requestId;
    requestedUrl = null; preparedUrl = null;
    if (disposed || !requestedVisible || frame == null) { hideSelection(); return false; }
    let bounds, selected;
    try {
      selected = checkedFrame(frame); bounds = checkedBounds(bbox);
    } catch (error) { hideSelection(); throw error; }
    requestedUrl = selected.url;
    const cached = touch(selected.url);
    if (cached) { bind(cached, selected, bounds); return true; }
    hideSelection();
    const texture = await loadTexture(selected.url);
    if (disposed || token !== requestId || !requestedVisible) return false;
    if (!texture || released.has(texture)) { requestedUrl = null; return false; }
    bind(texture, selected, bounds);
    return true;
  }

  async function preload(frame, bbox) {
    if (disposed || !requestedVisible || frame == null) return false;
    const selected = checkedFrame(frame); checkedBounds(bbox);
    const token = requestId;
    preparedUrl = selected.url;
    const texture = await loadTexture(selected.url);
    if (disposed || !requestedVisible || token !== requestId || preparedUrl !== selected.url) return false;
    if (!texture || released.has(texture) || cache.get(selected.url) !== texture) { preparedUrl = null; return false; }
    return true;
  }

  function setVisible(value) {
    requestedVisible = Boolean(value);
    if (!requestedVisible) clear();
    else group.visible = !disposed && activeUrl !== null;
  }

  function dispose() {
    if (disposed) return;
    disposed = true; clear();
    for (const texture of cache.values()) release(texture);
    cache.clear();
    for (const entry of [...pending.values()]) { release(entry.texture); entry.finish(null); }
    mesh.geometry.dispose(); material.dispose();
  }

  return { group, setFrame, preload, clear, setVisible, dispose };
}
