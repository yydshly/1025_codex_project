import * as THREE from './vendor/three.module.js';

const DEG = Math.PI / 180, SVG_NS = 'http://www.w3.org/2000/svg';
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const geo = (lat, lon, radius) => new THREE.Vector3(radius * Math.cos(lat * DEG) * Math.cos(lon * DEG), radius * Math.sin(lat * DEG), -radius * Math.cos(lat * DEG) * Math.sin(lon * DEG));
const intersection = (a, b, gap = 0) => Math.max(0, Math.min(a.x + a.width + gap, b.x + b.width + gap) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height + gap, b.y + b.height + gap) - Math.max(a.y, b.y));
const cloudKinds = new Set(['volcano', 'storm', 'mangkhut']);
const cloudCalloutWidth = 146;
const cloudCalloutHeight = 44;

/** Labels may move; their geographic anchor never does. Lowest-priority labels
 * are hidden when the viewport cannot fit them without covering another label. */
export function layoutObservedCallouts(items, width, height, { padding = 8, gap = 8, anchorClearance = 40, reserved = [] } = {}) {
  const placed = [...reserved], results = [];
  for (const item of items) {
    const w = Math.min(item.width, width - padding * 2), h = item.height;
    if (w <= 0 || h > height - padding * 2) { results.push({ ...item, hidden: true }); continue; }
    const xs = [item.anchorX + anchorClearance, item.anchorX - w - anchorClearance, item.anchorX - w / 2, padding, width - padding - w];
    const ys = [item.anchorY - h / 2, item.anchorY - h - anchorClearance, item.anchorY + anchorClearance, padding, height - padding - h];
    for (const area of reserved) {
      xs.push(area.x + area.width + gap, area.x - w - gap);
      ys.push(area.y + area.height + gap, area.y - h - gap);
    }
    for (let y = padding; y <= height - padding - h; y += h + gap) ys.push(y);
    let best = null, bestScore = Infinity;
    for (const x of xs) for (const y of ys) {
      const candidate = { x: clamp(x, padding, width - padding - w), y: clamp(y, padding, height - padding - h), width: w, height: h };
      if (placed.some(previous => intersection(candidate, previous, gap) > 0)) continue;
      const coversAnchor = items.some(pin => pin.anchorX > candidate.x - anchorClearance && pin.anchorX < candidate.x + w + anchorClearance && pin.anchorY > candidate.y - anchorClearance && pin.anchorY < candidate.y + h + anchorClearance);
      const leaderX = clamp(item.anchorX, candidate.x, candidate.x + w), leaderY = clamp(item.anchorY, candidate.y, candidate.y + h);
      const score = Math.hypot(leaderX - item.anchorX, leaderY - item.anchorY) + (coversAnchor ? 10000 : 0);
      if (score < bestScore) { bestScore = score; best = { ...candidate, leaderX, leaderY }; }
    }
    if (!best || bestScore >= 10000) { results.push({ ...item, hidden: true }); continue; }
    placed.push(best); results.push({ ...item, ...best, hidden: false });
  }
  return results;
}

/** Reserve the central image for observation. The whole stack goes below the
 * viewport when neither side has room, so no box obscures the frame. */
export function layoutCloudCallouts(items, width, height, cloudArea, reserved = []) {
  if (!cloudArea || width < 550) return null;
  const sideInset = 10, gap = 8, top = 54, bottom = height - 40;
  const left = sideInset, right = width - sideInset - cloudCalloutWidth;
  const stack = x => {
    const slots = [];
    let y = top;
    for (const item of items) {
      const box = { x, y, width: cloudCalloutWidth, height: item.height };
      if (y + box.height > bottom || reserved.some(area => intersection(box, area, gap) > 0)) return null;
      const leaderX = x === right ? x : x + box.width;
      const leaderY = clamp(item.anchorY ?? (y + box.height / 2), y + 6, y + box.height - 6);
      slots.push({ ...item, ...box, leaderX, leaderY });
      y += box.height + gap;
    }
    return slots;
  };
  if (right >= cloudArea.x + cloudArea.width + gap) {
    const slots = stack(right);
    if (slots) return slots;
  }
  if (left + cloudCalloutWidth + gap <= cloudArea.x) return stack(left);
  return null;
}

// Trim the line to the callout side of the reserved region. A tiny point still
// shows the actual source position when that position is visible on the globe.
function cloudLeaderStart(item, area) {
  if (!area) return [item.anchorX, item.anchorY];
  const edgeX = item.leaderX === item.x ? area.x + area.width + 5 : area.x - 5;
  const ratio = (edgeX - item.anchorX) / (item.leaderX - item.anchorX);
  if (ratio <= 0 || !Number.isFinite(ratio)) return [item.anchorX, item.anchorY];
  if (ratio >= 1) return null;
  return [edgeX, item.anchorY + (item.leaderY - item.anchorY) * ratio];
}

function coordinate(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90) throw new TypeError('Observed annotations require finite longitude and latitude in −90…90°.');
  return { lat, lon: ((lon + 180) % 360 + 360) % 360 - 180 };
}
function color(value) {
  if (value === undefined) return '#a8e6ed';
  if (typeof value !== 'string' || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) throw new TypeError('Annotation color must be a three- or six-digit hex color.');
  return '#' + new THREE.Color(value).getHexString();
}
function normalizeStory(input) {
  if (input === null) return null;
  if (!input || typeof input.id !== 'string' || !input.id || typeof input.timeUtc !== 'string' || !input.timeUtc.endsWith('Z') || !Number.isFinite(Date.parse(input.timeUtc))) throw new TypeError('Observed story requires an id and a valid UTC time.');
  if (!Array.isArray(input.lines ?? []) || !Array.isArray(input.pins ?? []) || (input.pins?.length ?? 0) > 3) throw new TypeError('Observed story supports at most three pins and an array of lines.');
  const lineIds = new Set(), pinIds = new Set();
  const checkId = (value, ids) => { if (typeof value !== 'string' || !value || ids.has(value)) throw new TypeError('Annotation ids must be unique nonempty strings.'); ids.add(value); };
  const lines = (input.lines ?? []).map(line => {
    checkId(line.id, lineIds);
    if (!Array.isArray(line.coordinates) || line.coordinates.length < 2) throw new TypeError('An observed contour requires at least two coordinates.');
    const coordinates = line.coordinates.map(pair => { if (!Array.isArray(pair) || pair.length < 2) throw new TypeError('Coordinates must be [longitude, latitude].'); const value = coordinate(pair[1], pair[0]); return [value.lon, value.lat]; });
    for (let i = 1; i < coordinates.length; i++) if (geo(coordinates[i - 1][1], coordinates[i - 1][0], 1).dot(geo(coordinates[i][1], coordinates[i][0], 1)) < -.999999) throw new TypeError('Antipodal contour coordinates need an explicit intermediate source vertex.');
    return { id: line.id, coordinates, color: color(line.color), dashed: Boolean(line.dashed) };
  });
  const pins = (input.pins ?? []).map(pin => { checkId(pin.id, pinIds); return { ...pin, ...coordinate(pin.lat, pin.lon), title: String(pin.title ?? ''), value: String(pin.value ?? '—'), detail: String(pin.detail ?? ''), color: color(pin.color), target: typeof pin.target === 'string' ? pin.target : '' }; });
  return { id: input.id, kind: input.kind, timeUtc: input.timeUtc, lines, pins };
}

function contourGeometry(coordinates, radius) {
  const positions = [geo(coordinates[0][1], coordinates[0][0], radius)];
  for (let i = 1; i < coordinates.length; i++) {
    const from = positions.at(-1).clone().normalize(), to = geo(coordinates[i][1], coordinates[i][0], 1);
    const angle = Math.acos(clamp(from.dot(to), -1, 1));
    // Added vertices only keep the supplied line on the sphere. They are not
    // observations, physical motion, a reconstructed footprint, or extra frames.
    const steps = Math.max(1, Math.ceil(angle / DEG)), rotation = new THREE.Quaternion().setFromUnitVectors(from, to);
    for (let step = 1; step <= steps; step++) positions.push(from.clone().applyQuaternion(new THREE.Quaternion().slerp(rotation, step / steps)).multiplyScalar(radius));
  }
  return new THREE.BufferGeometry().setFromPoints(positions);
}

/** Add group to the existing earthRoot; labelHost must cover the same viewport.
 * project() consumes that root's world transform, so Earth rotation remains exact.
 * Optional fourth options argument is accepted for callers reserving argument 3. */
export function createObservedStoryLayer(radius = 2, labelHost, options = {}, fourthOptions) {
  if (!Number.isFinite(radius) || radius <= 0 || !labelHost?.appendChild) throw new TypeError('A positive radius and a label host are required.');
  const { onSelect } = fourthOptions ?? options ?? {};
  const document = labelHost.ownerDocument ?? globalThis.document;
  if (!document?.createElement || !document.createElementNS) throw new TypeError('A DOM document is required for observed annotations.');
  const group = new THREE.Group(); group.name = 'observed-story-annotations'; group.visible = false;
  const overlay = document.createElement('div'); overlay.className = 'observed-story-overlay';
  Object.assign(overlay.style, { position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '6', overflow: 'hidden', display: 'none' });
  const leaders = document.createElementNS(SVG_NS, 'svg'); leaders.setAttribute('aria-hidden', 'true'); leaders.classList?.add('observed-story-leaders');
  Object.assign(leaders.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' });
  overlay.appendChild(leaders); labelHost.appendChild(overlay);
  const points = document.createElementNS(SVG_NS, 'svg'); points.setAttribute('aria-hidden', 'true'); points.classList?.add('observed-story-points');
  Object.assign(points.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' });
  overlay.appendChild(points);
  const dock = document.createElement('div');
  dock.className = 'observed-cloud-callouts'; dock.hidden = true;
  dock.setAttribute('role', 'group'); dock.setAttribute('aria-label', '扫描位置标注');
  labelHost.parentElement?.after(dock);
  const markerGeometry = new THREE.SphereGeometry(radius * .006, 12, 8);
  const lines = new Map(), pins = new Map();
  let story = null, enabled = true, disposed = false, suspended = false;

  function hide(entry) { entry.button.hidden = true; entry.button.style.display = 'none'; entry.leader.style.display = 'none'; entry.point.style.display = 'none'; entry.marker.visible = false; }
  function hideAll() { overlay.style.display = 'none'; dock.hidden = true; for (const entry of pins.values()) hide(entry); }
  function removeLine(entry) { group.remove(entry.line); entry.line.geometry.dispose(); entry.line.material.dispose(); }
  function removePin(entry) { group.remove(entry.marker); entry.marker.material.dispose(); entry.button.removeEventListener('click', entry.click); entry.button.remove(); entry.leader.remove(); entry.point.remove(); }
  function makePin(pin) {
    const marker = new THREE.Mesh(markerGeometry, new THREE.MeshBasicMaterial({ color: pin.color, depthTest: true, depthWrite: false, toneMapped: false }));
    marker.name = 'observed-story-pin-' + pin.id; marker.renderOrder = 12; marker.userData.kind = 'location-symbol-not-physical-extent'; group.add(marker);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'observed-story-pin'; button.dataset.pinId = pin.id;
    Object.assign(button.style, { position: 'absolute', boxSizing: 'border-box', margin: '0', padding: '8px 10px', textAlign: 'left', border: '1px solid rgba(156,207,223,.38)', borderLeft: '2px solid ' + pin.color, borderRadius: '7px', background: 'rgba(5,19,30,.87)', color: '#edf7fa', fontFamily: 'inherit', lineHeight: '1.35', boxShadow: '0 3px 12px rgba(0,0,0,.18)', pointerEvents: 'auto', cursor: 'pointer', overflowWrap: 'anywhere', zIndex: '1', opacity: '1', appearance: 'none' });
    const title = document.createElement('span'); title.className = 'observed-story-title'; Object.assign(title.style, { display: 'block', color: '#b7cdd5', fontSize: '11px' });
    const value = document.createElement('strong'); value.className = 'observed-story-value'; Object.assign(value.style, { display: 'block', marginTop: '2px', fontSize: '16px', fontWeight: '650', fontVariantNumeric: 'tabular-nums' });
    const detail = document.createElement('small'); detail.className = 'observed-story-detail'; Object.assign(detail.style, { display: 'block', marginTop: '3px', fontSize: '10px', color: '#c5d7de' });
    button.appendChild(title); button.appendChild(value); button.appendChild(detail);
    const leader = document.createElementNS(SVG_NS, 'path'); leader.setAttribute('fill', 'none'); leader.setAttribute('stroke-width', '1'); leader.setAttribute('stroke-opacity', '.8'); leader.setAttribute('vector-effect', 'non-scaling-stroke');
    const point = document.createElementNS(SVG_NS, 'circle');
    point.setAttribute('r', '3'); point.setAttribute('fill', '#0a1826'); point.setAttribute('stroke-width', '1.2');
    leaders.appendChild(leader); points.appendChild(point); overlay.appendChild(button);
    const entry = { marker, button, title, value, detail, leader, point, pin, dirty: true, width: 0, height: 0 };
    entry.click = () => { if (!disposed && enabled && group.visible && !entry.button.hidden && entry.pin.target && typeof onSelect === 'function') onSelect(entry.pin.target, { ...entry.pin }); };
    button.addEventListener('click', entry.click); hide(entry); return entry;
  }

  function setStory(input) {
    if (disposed) return;
    const next = normalizeStory(input);
    suspended = false;
    overlay.style.visibility = dock.style.visibility = '';
    const nextLines = new Set(next?.lines.map(line => line.id) ?? []), nextPins = new Set(next?.pins.map(pin => pin.id) ?? []);
    for (const [id, entry] of lines) if (!nextLines.has(id)) { removeLine(entry); lines.delete(id); }
    for (const [id, entry] of pins) if (!nextPins.has(id)) { removePin(entry); pins.delete(id); }
    for (const line of next?.lines ?? []) {
      const signature = JSON.stringify(line.coordinates);
      let entry = lines.get(line.id);
      if (!entry) {
        const appearance = { color: line.color, transparent: true, opacity: .55, depthTest: true, depthWrite: false, toneMapped: false };
        const material = line.dashed
          ? new THREE.LineDashedMaterial({ ...appearance, opacity: .82, dashSize: .009, gapSize: .006 })
          : new THREE.LineBasicMaterial(appearance);
        const mesh = new THREE.Line(contourGeometry(line.coordinates, radius * 1.005), material);
        if (line.dashed) mesh.computeLineDistances();
        mesh.name = 'observed-story-contour-' + line.id; mesh.renderOrder = 11; mesh.userData.kind = 'supplied-geographic-outline'; group.add(mesh);
        entry = { line: mesh, signature }; lines.set(line.id, entry);
      } else if (entry.signature !== signature) {
        entry.line.geometry.dispose();
        entry.line.geometry = contourGeometry(line.coordinates, radius * 1.005);
        if (line.dashed) entry.line.computeLineDistances();
        entry.signature = signature;
      }
      entry.line.material.color.set(line.color);
    }
    for (const pin of next?.pins ?? []) {
      let entry = pins.get(pin.id); if (!entry) { entry = makePin(pin); pins.set(pin.id, entry); }
      if (entry.pin.title !== pin.title || entry.pin.value !== pin.value || entry.pin.detail !== pin.detail) entry.dirty = true;
      entry.pin = pin; entry.marker.position.copy(geo(pin.lat, pin.lon, radius * 1.007)); entry.marker.material.color.set(pin.color);
      entry.title.textContent = pin.title; entry.value.textContent = pin.value; entry.detail.textContent = pin.detail;
      entry.button.title = [pin.title, pin.value, pin.detail].filter(Boolean).join(' · ');
      entry.button.setAttribute('aria-label', entry.button.title); entry.button.style.borderLeftColor = pin.color;
      entry.button.dataset.storyTarget = pin.target;
      entry.button.disabled = !pin.target || typeof onSelect !== 'function'; entry.button.tabIndex = entry.button.disabled ? -1 : 0;
      entry.button.style.pointerEvents = entry.button.disabled ? 'none' : 'auto'; entry.button.style.cursor = entry.button.disabled ? 'default' : 'pointer';
      entry.leader.setAttribute('stroke', pin.color);
      entry.point.setAttribute('stroke', pin.color);
    }
    story = next; group.visible = enabled && Boolean(story);
    // A new native scan updates the same callout buttons in place. Keep the
    // dock's layout stable through playback and while a button has focus.
    if (!group.visible) hideAll();
  }

  function setVisible(value) {
    if (disposed || enabled === Boolean(value)) return;
    enabled = Boolean(value); group.visible = enabled && Boolean(story);
    if (!group.visible) hideAll();
  }

  function suspendCloud() {
    if (disposed || !cloudKinds.has(story?.kind)) return false;
    suspended = true;
    group.visible = false;
    // Keep space for the dock while the next registered scan loads.
    overlay.style.visibility = dock.style.visibility = 'hidden';
    return true;
  }

  function project(camera, earthRoot, width, height, placement) {
    if (suspended) return;
    if (disposed || !group.visible || !story || !earthRoot || earthRoot.visible === false || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) { hideAll(); return; }
    const reserved = Array.isArray(placement) ? placement : placement?.reserved;
    const cloud = cloudKinds.has(story.kind);
    const cloudArea = cloud ? placement?.cloudArea : null;
    earthRoot.updateWorldMatrix(true, false); camera.updateWorldMatrix(true, false);
    const cameraWorld = camera.getWorldPosition(new THREE.Vector3()), normalMatrix = new THREE.Matrix3().getNormalMatrix(earthRoot.matrixWorld), visible = [];
    const viewBox = `0 0 ${width} ${height}`;
    leaders.setAttribute('viewBox', viewBox); points.setAttribute('viewBox', viewBox);
    overlay.style.display = 'block';
    const boxWidth = Math.min(192, width - 16);
    for (const pin of story.pins) {
      const entry = pins.get(pin.id), surface = geo(pin.lat, pin.lon, radius), world = surface.clone().applyMatrix4(earthRoot.matrixWorld);
      const normal = surface.clone().normalize().applyNormalMatrix(normalMatrix), facing = normal.dot(cameraWorld.clone().sub(world));
      const projected = (cloud ? world.clone() : entry.marker.position.clone().applyMatrix4(earthRoot.matrixWorld)).project(camera);
      const x = (projected.x + 1) * width / 2, y = (1 - projected.y) * height / 2;
      const onGlobe = facing > 0 && projected.z >= -1 && projected.z <= 1 && x >= 0 && x <= width && y >= 0 && y <= height;
      if (cloud) {
        entry.marker.visible = false;
        entry.point.style.display = onGlobe ? '' : 'none';
        if (onGlobe) { entry.point.setAttribute('cx', x.toFixed(2)); entry.point.setAttribute('cy', y.toFixed(2)); }
        visible.push({ id: pin.id, anchorX: onGlobe ? x : null, anchorY: onGlobe ? y : null, height: cloudCalloutHeight });
        continue;
      }
      if (!onGlobe) { hide(entry); continue; }
      entry.marker.visible = true;
      if(story.kind==='quake')entry.marker.scale.setScalar(THREE.MathUtils.clamp((cameraWorld.length()-radius)/1.4,.09,1));
      entry.point.style.display = 'none';
      if (entry.button.parentNode !== overlay) overlay.appendChild(entry.button);
      if (entry.button.dataset.calloutPlacement) { delete entry.button.dataset.calloutPlacement; entry.dirty = true; }
      if (entry.width !== boxWidth || entry.dirty) {
        entry.button.style.width = `${Math.max(1, boxWidth)}px`; entry.button.hidden = false; entry.button.style.display = 'block'; entry.button.style.visibility = 'hidden';
        entry.width = boxWidth; entry.height = entry.button.offsetHeight || 78; entry.dirty = false;
      }
      visible.push({ id: pin.id, anchorX: x, anchorY: y, width: entry.width, height: entry.height });
    }
    if (cloud) { placeCloudCallouts(visible, width, height, cloudArea, reserved); return; }
    dock.hidden = true;
    for (const item of layoutObservedCallouts(visible, width, height, {reserved})) {
      const entry = pins.get(item.id);
      if (item.hidden) { entry.button.hidden = true; entry.button.style.display = 'none'; entry.leader.style.display = 'none'; continue; }
      entry.button.hidden = false; entry.button.style.display = 'block'; entry.button.style.visibility = 'visible';
      entry.button.style.left = `${item.x.toFixed(2)}px`; entry.button.style.top = `${item.y.toFixed(2)}px`;
      entry.leader.setAttribute('stroke-dasharray', ''); entry.leader.setAttribute('stroke-opacity', '.8');
      entry.leader.style.display = 'block'; entry.leader.setAttribute('d', `M ${item.anchorX.toFixed(2)} ${item.anchorY.toFixed(2)} L ${item.leaderX.toFixed(2)} ${item.leaderY.toFixed(2)}`);
    }
  }

  function placeCloudCallouts(items, width, height, area, reserved) {
    const slots = layoutCloudCallouts(items, width, height, area, reserved);
    const outside = !slots && Boolean(dock.parentNode);
    dock.hidden = !outside || !items.length;
    for (const item of slots ?? items) {
      const { button, leader } = pins.get(item.id), parent = outside ? dock : overlay;
      if (button.parentNode !== parent) parent.appendChild(button);
      button.hidden = !slots && !outside;
      button.style.display = button.hidden ? 'none' : 'block';
      button.style.visibility = 'visible';
      button.dataset.calloutPlacement = outside ? 'dock' : 'side';
      button.style.width = outside ? '' : `${cloudCalloutWidth}px`;
      const start = slots && item.anchorX !== null ? cloudLeaderStart(item, area) : null;
      leader.setAttribute('stroke-dasharray', '2 3'); leader.setAttribute('stroke-opacity', '.6');
      leader.style.display = start ? 'block' : 'none';
      if (!slots) continue;
      button.style.left = `${item.x}px`; button.style.top = `${item.y}px`;
      if (start) leader.setAttribute('d', `M ${start[0].toFixed(2)} ${start[1].toFixed(2)} L ${item.leaderX.toFixed(2)} ${item.leaderY.toFixed(2)}`);
    }
  }

  function dispose() {
    if (disposed) return;
    setStory(null); markerGeometry.dispose(); dock.remove(); overlay.remove(); group.removeFromParent(); disposed = true; group.visible = false;
  }
  return { group, setStory, setVisible, suspendCloud, project, dispose };
}
