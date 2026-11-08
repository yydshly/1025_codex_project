import * as THREE from './vendor/three.module.js';

const DEG = Math.PI / 180;
const SVG_NS = 'http://www.w3.org/2000/svg';
const STATION_IDS = new Set(['wind', 'seaLevel']);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const geo = (lat, lon, radius) => new THREE.Vector3(
  radius * Math.cos(lat * DEG) * Math.cos(lon * DEG),
  radius * Math.sin(lat * DEG),
  -radius * Math.cos(lat * DEG) * Math.sin(lon * DEG)
);
const overlaps = (a, b, gap = 10) => a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;

/** Actual station positions only: wind = VHHH; seaLevel = Quarry Bay. No extent or field is inferred. */
export function createSyncStationLayer(radius = 2, labelHost) {
  if (!Number.isFinite(radius) || radius <= 0) throw new TypeError('A positive globe radius is required.');
  const doc = labelHost?.ownerDocument;
  if (!doc || typeof labelHost.appendChild !== 'function') throw new TypeError('A station label host is required.');
  const group = new THREE.Group();
  group.name = 'sync-observation-stations';
  group.visible = false;
  const leaders = doc.createElementNS(SVG_NS, 'svg');
  leaders.setAttribute('class', 'sync-station-leaders');
  leaders.setAttribute('aria-hidden', 'true');
  Object.assign(leaders.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', display: 'none' });
  labelHost.appendChild(leaders);
  let entries = [], visible = false, disposed = false;

  function hide(entry) {
    entry.object.visible = false;
    entry.label.hidden = true;
    entry.line.style.display = 'none';
  }

  function clear() {
    for (const entry of entries) {
      entry.object.traverse(item => { item.geometry?.dispose(); item.material?.dispose(); });
      group.remove(entry.object);
      entry.label.remove();
      entry.line.remove();
    }
    entries = [];
  }

  function setStations(stations) {
    if (disposed) return;
    if (!Array.isArray(stations) || stations.length > 2) throw new TypeError('Only wind and seaLevel station markers are supported.');
    const ids = new Set();
    const next = stations.map(station => {
      if (!station || !STATION_IDS.has(station.id) || ids.has(station.id)) throw new TypeError('Station ids must be unique wind / seaLevel values.');
      if (!Number.isFinite(station.lat) || !Number.isFinite(station.lon) || Math.abs(station.lat) > 90 || Math.abs(station.lon) > 180) throw new TypeError('Invalid station coordinates.');
      ids.add(station.id);
      return { ...station, label: String(station.label ?? station.id), color: new THREE.Color(station.color ?? (station.id === 'wind' ? '#79dfed' : '#ffce83')) };
    });
    clear();
    for (const station of next) {
      const normal = geo(station.lat, station.lon, 1);
      const anchor = normal.clone().multiplyScalar(radius * 1.014);
      const object = new THREE.Group();
      object.name = `sync-station-${station.id}`;
      object.userData = { kind: 'station-location-not-extent', id: station.id, lat: station.lat, lon: station.lon };
      const pin = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([normal.clone().multiplyScalar(radius * 1.002), anchor]),
        new THREE.LineBasicMaterial({ color: station.color, toneMapped: false })
      );
      const point = new THREE.Mesh(new THREE.SphereGeometry(radius * .005, 14, 10), new THREE.MeshBasicMaterial({ color: station.color, toneMapped: false }));
      point.position.copy(anchor);
      object.add(pin, point);
      group.add(object);
      const label = doc.createElement('div');
      label.className = 'sync-station-marker';
      label.dataset.stationId = station.id;
      Object.assign(label.style, { position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box', overflowWrap: 'anywhere' });
      label.style.setProperty('--station-color', '#' + station.color.getHexString());
      const name = doc.createElement('strong');
      name.className = 'sync-station-name';
      name.textContent = station.label;
      const reading = doc.createElement('span');
      reading.className = 'sync-station-reading';
      reading.textContent = '等待观测';
      label.append(name, reading);
      labelHost.appendChild(label);
      const leader = doc.createElementNS(SVG_NS, 'line');
      leader.setAttribute('class', 'sync-station-leader');
      leader.setAttribute('stroke', '#' + station.color.getHexString());
      leader.setAttribute('stroke-width', '1.2');
      leader.setAttribute('stroke-opacity', '.8');
      leader.setAttribute('vector-effect', 'non-scaling-stroke');
      leaders.appendChild(leader);
      const entry = { station, object, normal, anchor, label, reading, line: leader };
      entries.push(entry);
      hide(entry);
    }
  }

  function setReadings(readings) {
    if (disposed || !Array.isArray(readings)) return;
    const byId = new Map(readings.map(reading => [reading.id, reading.text]));
    for (const entry of entries) {
      if (byId.has(entry.station.id)) entry.reading.textContent = byId.get(entry.station.id) == null ? '未报告' : String(byId.get(entry.station.id));
    }
  }

  function setVisible(value) {
    visible = !disposed && Boolean(value);
    group.visible = visible;
    leaders.style.display = visible ? 'block' : 'none';
    // A fresh projection decides front-facing visibility when re-enabled.
    for (const entry of entries) hide(entry);
  }

  function project(camera, earthRoot, width, height) {
    if (disposed || !visible) return;
    if (!camera || !earthRoot || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      for (const entry of entries) hide(entry);
      return;
    }
    camera.updateWorldMatrix(true, false);
    earthRoot.updateWorldMatrix(true, false);
    const localCamera = earthRoot.worldToLocal(camera.getWorldPosition(new THREE.Vector3()));
    leaders.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const placed = [], margin = 8;
    for (const entry of entries) {
      hide(entry);
      const front = entry.normal.dot(localCamera.clone().sub(entry.normal.clone().multiplyScalar(radius))) > 0;
      const projected = earthRoot.localToWorld(entry.anchor.clone()).project(camera);
      if (!front || projected.z < -1 || projected.z > 1 || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1) continue;
      entry.object.visible = true;
      const ax = (projected.x * .5 + .5) * width, ay = (-projected.y * .5 + .5) * height;
      entry.label.style.maxWidth = Math.max(0, Math.min(220, width - margin * 2)) + 'px';
      entry.label.hidden = false;
      entry.label.style.visibility = 'hidden';
      const bounds = entry.label.getBoundingClientRect();
      const w = bounds.width || entry.label.offsetWidth || Math.min(190, width - margin * 2);
      const h = bounds.height || entry.label.offsetHeight || 48;
      if (w <= 0 || h <= 0 || w > width - margin * 2 || h > height - margin * 2) { entry.label.hidden = true; continue; }
      const left = ax - w - 32, right = ax + 32, above = ay - h - 26, below = ay + 26;
      const candidates = entry.station.id === 'wind'
        ? [[left, above], [left, below], [right, above], [right, below]]
        : [[right, below], [right, above], [left, below], [left, above]];
      // If preferred positions collide after clamping, try explicit rows around existing labels.
      for (const box of placed) candidates.push([right, box.y + box.h + 12], [left, box.y - h - 12], [box.x + box.w + 12, above], [box.x - w - 12, below]);
      const boxes = candidates.map(([x,y]) => ({ x: clamp(x, margin, width - w - margin), y: clamp(y, margin, height - h - margin), w, h }));
      const box = boxes.find(candidate => placed.every(other => !overlaps(candidate, other)));
      if (!box) { entry.label.hidden = true; continue; }
      placed.push(box);
      entry.label.style.left = box.x + 'px';
      entry.label.style.top = box.y + 'px';
      entry.label.style.visibility = 'visible';
      // The line starts at the true projected station, ends at the closest point on its label.
      const bx = clamp(ax, box.x, box.x + box.w), by = clamp(ay, box.y, box.y + box.h);
      for (const [key, value] of Object.entries({ x1: ax, y1: ay, x2: bx, y2: by })) entry.line.setAttribute(key, value.toFixed(2));
      entry.line.style.display = 'block';
    }
  }

  function dispose() {
    if (disposed) return;
    setVisible(false);
    clear();
    leaders.remove();
    group.removeFromParent();
    disposed = true;
  }
  return { group, setStations, setReadings, setVisible, project, dispose };
}
