import * as THREE from './vendor/three.module.js';
import { latLonToVector } from './globe-effects.js';
import { layoutObservedCallouts } from './observed-story-layer.js';
import { BIG_PINEY_GEOGRAPHY } from './river-big-piney-geography.js';
import { formatRiverElapsed, RIVER_BANKS as BANKS } from './river-evidence.js';

const METRES_PER_RADIAN = 6371008.8;
const SVG_NS = 'http://www.w3.org/2000/svg';
const format = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });
const text = value => value === null ? '缺测' : format.format(value) + ' ppb';
const signalLabels = {
  missing: '缺测', waiting: '未见持续抬升', arrival: '持续信号到达',
  rising: '峰值前', peak: '本岸峰值', tail: '峰值后', below: '降至阈值以下',
};

// A single fixed display scale keeps amplitudes comparable between all six
// instruments while making the early rise visible. It changes glyph size only.
export function riverDisplayFraction(value) {
  return Number.isFinite(value) ? Math.sqrt(THREE.MathUtils.clamp(value / 250, 0, 1)) : 0;
}

function signalPhase(bank, value, elapsed, data) {
  if (value === null) return 'missing';
  const rule = data.signalRule;
  const arrival = bank.sustainedSignal?.elapsedSeconds;
  if (!rule || !(elapsed >= arrival)) return 'waiting';
  if (value < rule.thresholdPpb) return 'below';
  const peak = bank.peak?.elapsedSeconds;
  if (elapsed === peak) return 'peak';
  if (elapsed < arrival + data.cadenceSeconds * rule.consecutiveSamples) return 'arrival';
  return elapsed < peak ? 'rising' : 'tail';
}

// These arcs are screen-space sensor symbols, with their origin at each
// instrument. They encode concentration, without depicting a river plume.
function sensorArc(radius) {
  const x = (radius * .57).toFixed(1), y = (radius * .82).toFixed(1);
  return `M${x},-${y} A${radius},${radius} 0 0,1 ${x},${y}`;
}

function localFrame(radius, data) {
  const { lat, lon } = data.focus;
  const units = radius / METRES_PER_RADIAN;
  const up = latLonToVector(lat, lon);
  const east = new THREE.Vector3(-Math.sin(THREE.MathUtils.degToRad(lon)), 0, -Math.cos(THREE.MathUtils.degToRad(lon)));
  const north = up.clone().cross(east).normalize();
  const target = up.clone().multiplyScalar(radius + 42 * units);
  const point = (latitude, longitude, heightM = 0) => {
    const offset = latLonToVector(latitude, longitude, radius).sub(target);
    return new THREE.Vector3(offset.dot(east), offset.dot(north), heightM * units);
  };
  const points = data.transects.flatMap(transect => transect.banks.map(bank => point(bank.lat, bank.lon)));
  const halfWidth = Math.max(...points.map(value => Math.abs(value.x)), 350 * units) + 420 * units;
  const halfHeight = Math.max(...points.map(value => Math.abs(value.y)), 450 * units) + 310 * units;
  return { target, up, east, north, point, halfWidth, halfHeight, span: 2 * Math.max(halfWidth, halfHeight), units };
}

function material(color, extras = {}) {
  return new THREE.MeshBasicMaterial({ color, toneMapped: false, ...extras });
}

function centerline(geography, frame) {
  const positions = [];
  for (const line of geography.reach.coordinates) {
    for (let i = 1; i < line.length; i++) {
      const previous = frame.point(line[i - 1][1], line[i - 1][0], 2);
      const current = frame.point(line[i][1], line[i][0], 2);
      positions.push(previous, current);
    }
  }
  return new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(positions),
    new THREE.LineBasicMaterial({ color: '#94c9d7', toneMapped: false, opacity: .57, transparent: true }),
  );
}

function groundPlane(imagery, frame) {
  const [west, south, east, north] = imagery.bbox;
  const corners = [
    frame.point(south, west), frame.point(south, east),
    frame.point(north, east), frame.point(north, west),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(corners);
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  return new THREE.Mesh(geometry, material('#0d2633', { side: THREE.DoubleSide }));
}

export function createRiverTracerLayer(radius, labelHost, { onSelect, loadTexture } = {}) {
  const doc = labelHost.ownerDocument ?? document;
  const group = new THREE.Group();
  group.name = 'observed-river-tracer';
  group.visible = false;
  const site = new THREE.Group();
  const detail = new THREE.Group();
  const overview = new THREE.Group();
  group.add(site);
  site.add(detail, overview);

  const overlay = doc.createElement('div');
  overlay.className = 'river-tracer-overlay';
  Object.assign(overlay.style, { position: 'absolute', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '5' });
  overlay.hidden = true;
  const mapSvg = className => {
    const svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');
    Object.assign(svg.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
    overlay.appendChild(svg);
    return svg;
  };
  const signals = mapSvg('river-sensor-signals');
  const leaders = mapSvg('river-callout-leaders');
  const sequence = doc.createElement('div');
  sequence.className = 'river-sequence';
  sequence.setAttribute('role', 'group');
  sequence.setAttribute('aria-label', '三个下游断面的实测响应');
  const sequenceLegend = doc.createElement('div');
  sequenceLegend.className = 'river-sequence-legend';
  sequenceLegend.textContent = '下游响应 · 青色左岸 / 金色右岸';
  const sequenceTrack = doc.createElement('div');
  sequenceTrack.className = 'river-sequence-track';
  sequence.appendChild(sequenceLegend);
  sequence.appendChild(sequenceTrack);
  overlay.appendChild(sequence);
  const credit = doc.createElement('a');
  credit.target = '_blank';
  credit.rel = 'noopener';
  Object.assign(credit.style, { position: 'absolute', bottom: '124px', left: '12px', padding: '4px 7px', background: '#071622d9', color: '#e8eff2', borderRadius: '4px', fontSize: '10px', pointerEvents: 'auto' });
  overlay.appendChild(credit);
  labelHost.appendChild(overlay);

  let data = null, frame = null, texture = null, view = 'global', visible = false;
  let textureRequest = 0, textureReady = Promise.resolve(false), snapshot = null, selectedId = null;
  let entries = [], siteLabel = null, basemapStatus = 'unavailable';
  let annotations = true;
  let guideShot = null, guideBank = null;

  function sequenceStep(transect, index) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.dataset.riverSequence = transect.id;
    const heading = doc.createElement('span');
    heading.className = 'river-sequence-heading';
    heading.textContent = '断面 ' + (index + 1);
    const status = doc.createElement('strong');
    status.className = 'river-sequence-status';
    const meters = doc.createElement('span');
    meters.className = 'river-sequence-meters';
    meters.setAttribute('aria-hidden', 'true');
    const bars = new Map(transect.banks.map(bank => {
      const meter = doc.createElement('span'), bar = doc.createElement('i');
      meter.className = 'river-bank-' + bank.bank;
      meter.appendChild(bar);
      meters.appendChild(meter);
      return [bank.id, bar];
    }));
    button.appendChild(heading);
    button.appendChild(status);
    button.appendChild(meters);
    button.addEventListener('click', () => onSelect?.(transect.id));
    sequenceTrack.appendChild(button);
    return { button, status, bars };
  }

  function sensorMarker(bank) {
    const node = doc.createElementNS(SVG_NS, 'g');
    node.dataset.riverSensor = bank.id;
    node.setAttribute('color', BANKS[bank.bank].color);
    node.style.display = 'none';
    const glow = doc.createElementNS(SVG_NS, 'path');
    glow.setAttribute('class', 'river-sensor-glow');
    const arcs = doc.createElementNS(SVG_NS, 'path');
    arcs.setAttribute('class', 'river-sensor-arcs');
    const origin = doc.createElementNS(SVG_NS, 'circle');
    origin.setAttribute('class', 'river-sensor-origin');
    origin.setAttribute('r', '3');
    node.appendChild(glow);
    node.appendChild(arcs);
    node.appendChild(origin);
    signals.appendChild(node);
    return { node, glow, arcs, origin };
  }

  function labelFor(id, heading, anchor) {
    const button = doc.createElement('button');
    button.className = 'river-tracer-label';
    button.type = 'button';
    button.dataset.riverTransect = id ?? '';
    button.hidden = true;
    button.style.setProperty('display', 'none', 'important');
    Object.assign(button.style, {
      position: 'absolute', margin: '0', padding: '6px 7px', boxSizing: 'border-box',
      textAlign: 'left', lineHeight: '1.2', border: '1px solid #b0ccd371', borderRadius: '6px',
      background: '#071622f5', color: '#f1f7fb', fontFamily: 'inherit', fontSize: '10px',
      fontVariantNumeric: 'tabular-nums', boxShadow: '0 3px 10px #0005',
      pointerEvents: id && onSelect ? 'auto' : 'none', whiteSpace: 'nowrap',
    });
    const title = doc.createElement('strong');
    title.textContent = heading;
    title.style.display = 'block';
    button.appendChild(title);
    const bankFields = new Map();
    if (id) {
      for (const [bank, { label, color }] of Object.entries(BANKS)) {
        const row = doc.createElement('span'), value = doc.createElement('strong'), bar = doc.createElement('i'), name = doc.createElement('span');
        name.textContent = label;
        Object.assign(row.style, { display: 'grid', gridTemplateColumns: '22px 1fr', position: 'relative', alignItems: 'center', marginTop: '3px', minHeight: '14px' });
        Object.assign(value.style, { textAlign: 'right', color, whiteSpace: 'nowrap', fontSize: '10px' });
        Object.assign(bar.style, { position: 'absolute', bottom: '0', left: '0', width: '100%', height: '1px', background: color, opacity: '.78', transform: 'scaleX(0)', transformOrigin: 'left center' });
        row.appendChild(name); row.appendChild(value); row.appendChild(bar);
        button.appendChild(row);
        bankFields.set(bank, { value, bar });
      }
      button.addEventListener('click', () => onSelect?.(id));
    } else button.tabIndex = -1;
    overlay.appendChild(button);
    const line = doc.createElementNS(SVG_NS, 'path');
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#c3e1e6');
    line.setAttribute('stroke-width', '1');
    line.style.display = 'none';
    leaders.appendChild(line);
    return { button, line, anchor, heading, bankFields };
  }

  function hideLabel(label) {
    if (!label) return;
    label.button.hidden = true;
    label.button.style.setProperty('display', 'none', 'important');
    label.line.style.display = 'none';
  }

  function removeLabel(label) {
    label?.button.remove();
    label?.line.remove();
  }

  function disposeChildren(parent) {
    for (const child of [...parent.children]) {
      child.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });
      child.removeFromParent();
    }
  }

  function clear() {
    ++textureRequest;
    for (const entry of entries) {
      removeLabel(entry.label);
      entry.step.button.remove();
      for (const gauge of entry.gauges) gauge.marker.node.remove();
    }
    removeLabel(siteLabel);
    disposeChildren(detail);
    disposeChildren(overview);
    texture?.dispose();
    texture = null;
    siteLabel = null;
    snapshot = null;
    selectedId = null;
    entries = [];
    guideShot = guideBank = null;
    basemapStatus = 'unavailable';
    textureReady = Promise.resolve(false);
    overlay.hidden = true;
    delete overlay.dataset.observedElapsedSeconds;
  }

  function glyph(bank) {
    const size = frame.units;
    const color = BANKS[bank.bank].color;
    const node = new THREE.Group();
    node.name = 'river-gauge-' + bank.id;
    node.position.copy(frame.point(bank.lat, bank.lon, 5));
    const base = new THREE.Mesh(new THREE.RingGeometry(8 * size, 14 * size, 32), material(color, { side: THREE.DoubleSide }));
    const halo = new THREE.Mesh(new THREE.RingGeometry(12 * size, 14 * size, 32), material(color, { side: THREE.DoubleSide, transparent: true, opacity: .2, depthWrite: false }));
    halo.position.z = size * 2;
    const stemGeometry = new THREE.CylinderGeometry(6 * size, 6 * size, 1, 10);
    stemGeometry.rotateX(Math.PI / 2);
    const stem = new THREE.Mesh(stemGeometry, material(color, { transparent: true, opacity: .92 }));
    const cap = new THREE.Mesh(new THREE.SphereGeometry(9 * size, 10, 7), material(color));
    const threshold = 400 * size * riverDisplayFraction(data.signalRule?.thresholdPpb);
    const offset = 22 * size;
    const ruler = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(offset, 0, 0), new THREE.Vector3(offset, 0, 400 * size),
      new THREE.Vector3(-offset, 0, threshold), new THREE.Vector3(offset + 8 * size, 0, threshold),
    ]), new THREE.LineBasicMaterial({color:'#ecf4f9',transparent:true,opacity:.84,toneMapped:false}));
    ruler.name = 'river-concentration-reference-' + bank.id;
    ruler.visible = false;
    node.add(halo, base, stem, cap, ruler);
    detail.add(node);
    return { node, base, halo, stem, cap, ruler, marker: sensorMarker(bank) };
  }

  function setData(next) {
    clear();
    data = next?.id === 'big-piney-2021-tracer' && next.transects?.length ? next : null;
    frame = data ? localFrame(radius, data) : null;
    group.visible = visible && Boolean(data);
    if (!data) return;
    site.position.copy(frame.target);
    site.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(frame.east, frame.north, frame.up));
    const geography = data.geography ?? BIG_PINEY_GEOGRAPHY;
    const plane = groundPlane(geography.imagery, frame);
    detail.add(plane);
    const path = centerline(geography, frame);
    path.name = 'river-nhd-centerline';
    detail.add(path);
    const grid = new THREE.GridHelper(frame.units * 6800, 17, '#355765', '#23424f');
    grid.rotation.x = Math.PI / 2;
    grid.position.z = frame.units;
    detail.add(grid);
    const token = textureRequest;
    basemapStatus = 'loading';
    credit.textContent = 'USGS NHD · 河道参考';
    credit.href = geography.reach.sourceUrl.split('/query?')[0];
    textureReady = Promise.resolve().then(() => (loadTexture ?? (url => new THREE.TextureLoader().loadAsync(url)))(geography.imagery.url)).then(image => {
      if (token !== textureRequest) { image.dispose(); return false; }
      texture = image;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      plane.material.map = texture;
      plane.material.color.set('#bfc8cd');
      plane.material.needsUpdate = true;
      grid.visible = false;
      path.material.opacity = .4;
      basemapStatus = 'ready';
      credit.textContent = 'USGS 国家地图影像 · NHD 河道';
      credit.href = geography.imagery.sourceUrl.split('/export?')[0];
      return true;
    }).catch(() => {
      if (token === textureRequest) basemapStatus = 'fallback';
      return false;
    });
    entries = data.transects.map((transect, index) => {
      const positions = transect.banks.map(bank => frame.point(bank.lat, bank.lon, 7));
      const midpoint = positions[0].clone().lerp(positions[1], .5);
      const section = new THREE.Line(new THREE.BufferGeometry().setFromPoints(positions), new THREE.LineBasicMaterial({ color: '#f1f8fb', toneMapped: false }));
      detail.add(section);
      const label = labelFor(transect.id, '断面 ' + String(index + 1).padStart(2, '0') + ' · ' + format.format(transect.distanceM) + ' m', midpoint);
      const gauges = transect.banks.map(bank => ({ bank, ...glyph(bank) }));
      return { id: transect.id, label, section, gauges, step: sequenceStep(transect, index) };
    });
    for (const [inner, outer, opacity] of [[.005, .007, .85], [.01, .011, .4]]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius * inner, radius * outer, 32), material('#65dfce', { side: THREE.DoubleSide, transparent: true, opacity, depthWrite: false }));
      ring.position.z = radius * .006;
      overview.add(ring);
    }
    siteLabel = labelFor(null, 'Big Piney 河 · 示踪河段', new THREE.Vector3(0, 0, radius * .006));
    setView(view);
    selectTransect(entries[0]?.id);
    for (const entry of entries) applyReadings(entry, new Map());
  }

  function applyReadings(entry, readings, elapsed) {
    const labels = [];
    const phases = [];
    let arrived = 0;
    for (const gauge of entry.gauges) {
      const raw = readings.get(gauge.bank.id)?.value;
      const value = Number.isFinite(raw) ? raw : null;
      const amount = riverDisplayFraction(value);
      const height = 400 * frame.units * amount;
      const picked = selectedId === entry.id;
      const near = picked && guideShot === 'section';
      const calledOut = near && guideBank === gauge.bank.bank;
      const aboveThreshold = value !== null && value >= data.signalRule?.thresholdPpb;
      const color = BANKS[gauge.bank.bank].color;
      gauge.base.material.color.set(value === null ? '#909da5' : color);
      gauge.base.scale.setScalar(picked ? 1.2 : 1);
      gauge.stem.visible = height > 0;
      gauge.stem.scale.x = gauge.stem.scale.y = near ? 1.75 : 1;
      gauge.stem.scale.z = height;
      gauge.stem.position.z = height / 2;
      gauge.stem.material.opacity = picked ? 1 : .82;
      gauge.cap.visible = height > 0;
      gauge.cap.position.z = height;
      gauge.cap.scale.setScalar((.65 + amount * .8) * (calledOut ? 1.5 : near ? 1.16 : 1));
      gauge.ruler.visible = Boolean(near && data.signalRule);
      gauge.halo.visible = aboveThreshold;
      gauge.halo.scale.setScalar(1 + amount * 2);
      gauge.halo.material.opacity = .16 + amount * .48;
      const phase = signalPhase(gauge.bank, value, elapsed, data);
      if (elapsed >= gauge.bank.sustainedSignal?.elapsedSeconds) arrived++;
      phases.push(phase);
      const { node, glow, arcs, origin } = gauge.marker;
      const hasArc = ['arrival', 'rising', 'peak', 'tail'].includes(phase);
      const arcRadius = hasArc ? Math.round(11 + 23 * amount) : 0;
      const echoRadius = phase === 'arrival' ? arcRadius + 8 : phase === 'peak' ? arcRadius + 5 : 0;
      node.dataset.phase = phase;
      node.dataset.guided = String(calledOut);
      node.dataset.value = value === null ? '' : String(value);
      node.dataset.elapsed = Number.isFinite(elapsed) ? String(elapsed) : '';
      node.dataset.radius = String(arcRadius);
      glow.setAttribute('d', hasArc ? sensorArc(arcRadius) : '');
      arcs.setAttribute('d', hasArc
        ? [sensorArc(arcRadius), sensorArc(Math.max(6, arcRadius - 6)), echoRadius && sensorArc(echoRadius)].filter(Boolean).join(' ')
        : '');
      origin.setAttribute('r', hasArc ? '4' : '3');
      const field = entry.label.bankFields.get(gauge.bank.bank);
      field.value.textContent = text(value);
      field.bar.style.transform = `scaleX(${amount})`;
      const bar = entry.step.bars.get(gauge.bank.id);
      bar.style.transform = `scaleX(${amount})`;
      bar.dataset.phase = phase;
      labels.push(`${BANKS[gauge.bank.bank].label} ${text(value)} ${signalLabels[phase]}`);
    }
    entry.label.button.setAttribute('aria-label', [entry.label.heading, ...labels].join('，'));
    const first = Math.min(...entry.gauges.map(gauge => gauge.bank.sustainedSignal?.elapsedSeconds ?? Infinity));
    const sequencePhase = phases.includes('peak') ? 'peak' : phases.includes('arrival') ? 'arrival'
      : phases.every(phase => phase === 'missing') ? 'missing'
      : phases.every(phase => phase === 'below') ? 'below' : arrived > 0 ? 'recorded' : 'waiting';
    entry.step.button.dataset.arrived = String(arrived);
    entry.step.button.dataset.phase = sequencePhase;
    entry.step.button.dataset.firstSignal = arrived ? String(first) : '';
    entry.step.status.textContent = ({
      peak: '测得峰值', arrival: arrived === 1 ? '首岸到达' : '第二岸到达',
      missing: '两岸缺测', below: '回到低浓度', recorded: arrived === 1 ? '已达一岸' : '已达两岸', waiting: '等待信号',
    })[sequencePhase];
    const description = [
      entry.label.heading, entry.step.status.textContent,
      ...(arrived ? ['首岸持续抬升 ' + formatRiverElapsed(first)] : []), ...labels,
    ].join('，');
    entry.step.button.setAttribute('aria-label', description);
    entry.step.button.title = description;
  }

  function setSnapshot(next) {
    if (!data || !Number.isFinite(next?.elapsedSeconds) || !Array.isArray(next.readings)) return false;
    snapshot = next;
    const readings = new Map(snapshot.readings.map(reading => [reading.id, reading]));
    for (const entry of entries) applyReadings(entry, readings, snapshot.elapsedSeconds);
    overlay.dataset.observedElapsedSeconds = String(snapshot.elapsedSeconds);
    return true;
  }

  function selectTransect(id) {
    if (!entries.some(entry => entry.id === id)) return false;
    selectedId = id;
    for (const entry of entries) {
      const selected = entry.id === id;
      entry.label.button.setAttribute('aria-pressed', String(selected));
      entry.step.button.setAttribute('aria-pressed', String(selected));
      entry.label.button.style.borderColor = selected ? '#f4f2c9' : '#b0ccd371';
      entry.label.line.setAttribute('stroke', selected ? '#f4f2c9' : '#c3e1e6');
      entry.section.material.color.set(selected ? '#f4f2c9' : '#c9e2eb');
    }
    if (snapshot) setSnapshot(snapshot);
    return true;
  }

  function setGuide(shot, bank) {
    if (guideShot === shot && guideBank === bank) return;
    guideShot = shot;
    guideBank = bank;
    if (snapshot) setSnapshot(snapshot);
  }

  function setVisible(value) {
    visible = Boolean(value);
    group.visible = visible && Boolean(data);
    if (!group.visible) overlay.hidden = true;
  }

  function setView(next) {
    view = next === 'detail' ? 'detail' : 'global';
    detail.visible = view === 'detail';
    overview.visible = !detail.visible;
    credit.hidden = !detail.visible;
    sequence.hidden = !detail.visible;
    signals.style.display = detail.visible ? '' : 'none';
    hideLabel(siteLabel);
    for (const entry of entries) hideLabel(entry.label);
  }

  function setAnnotations(enabled) {
    annotations = Boolean(enabled);
    if (annotations) return;
    hideLabel(siteLabel);
    for (const entry of entries) hideLabel(entry.label);
  }

  function project(camera, earthRoot, width, height, {flying = false} = {}) {
    if (!group.visible || width <= 0 || height <= 0 || !frame || !siteLabel) {
      overlay.hidden = true;
      return;
    }
    site.updateWorldMatrix(true, false);
    camera.updateWorldMatrix(true, false);
    const cameraWorld = camera.getWorldPosition(new THREE.Vector3());
    const world = site.getWorldPosition(new THREE.Vector3());
    if (view === 'detail' && flying && cameraWorld.distanceTo(world) > frame.span * 4.6) {
      for (const entry of entries) hideLabel(entry.label);
      overlay.hidden = true;
      return;
    }
    if (view === 'global') {
      const normal = frame.up.clone().transformDirection(earthRoot.matrixWorld);
      if (normal.dot(cameraWorld.sub(world)) <= 0) { overlay.hidden = true; return; }
    }
    overlay.hidden = false;
    leaders.setAttribute('viewBox', `0 0 ${width} ${height}`);
    if (view === 'detail') {
      signals.setAttribute('viewBox', `0 0 ${width} ${height}`);
      for (const entry of entries) {
        const positions = entry.gauges.map(gauge => site.localToWorld(gauge.node.position.clone()).project(camera));
        for (const [index, gauge] of entry.gauges.entries()) {
          const point = positions[index], other = positions[1 - index], node = gauge.marker.node;
          const inView = [point.x, point.y, point.z].every(value => Math.abs(value) <= 1);
          node.style.display = inView ? '' : 'none';
          if (!inView) continue;
          const x = (point.x + 1) * width / 2, y = (1 - point.y) * height / 2;
          const angle = THREE.MathUtils.radToDeg(Math.atan2((other.y - point.y) * height, (point.x - other.x) * width));
          node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
        }
      }
    }
    if (!annotations) return;
    const activeLabels = view === 'detail' ? entries.map(entry => entry.label) : [siteLabel];
    const anchors = [];
    for (const label of activeLabels) {
      const projected = site.localToWorld(label.anchor.clone()).project(camera);
      if (Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Math.abs(projected.z) > 1) { hideLabel(label); continue; }
      anchors.push({
        id: activeLabels.indexOf(label),
        anchorX: (projected.x + 1) * width / 2,
        anchorY: (1 - projected.y) * height / 2,
        width: view === 'detail' ? (width < 370 ? 106 : 126) : 144,
        height: view === 'detail' ? 63 : 26,
      });
    }
    // Leave the response strip, map credit and view buttons clear.
    const noteWidth = Math.max(0, Math.min(width - 22, 275));
    for (const item of layoutObservedCallouts(anchors, width, height - (view === 'detail' ? 119 : 48), {
      padding: 10, gap: 8, anchorClearance: view === 'detail' ? 31 : 21,
      reserved: view === 'detail' && guideShot ? [{ x: width - noteWidth - 11, y: 10, width: noteWidth, height: 72 }] : undefined,
    })) {
      const { button, line } = activeLabels[item.id];
      if (item.hidden) { hideLabel(activeLabels[item.id]); continue; }
      button.hidden = false;
      button.style.setProperty('display', 'block', 'important');
      button.style.width = `${item.width}px`;
      button.style.left = `${item.x.toFixed(1)}px`;
      button.style.top = `${item.y.toFixed(1)}px`;
      line.style.display = 'block';
      line.setAttribute('d', `M${item.anchorX.toFixed(1)},${item.anchorY.toFixed(1)} L${item.leaderX.toFixed(1)},${item.leaderY.toFixed(1)}`);
    }
  }

  return {
    group, setData, setSnapshot, selectTransect, setVisible, setView, setAnnotations, setGuide, project,
    getVisibleAnnotations() {
      return view === 'detail' && annotations && !overlay.hidden ? entries.filter(entry => !entry.label.button.hidden).map(entry => entry.id) : [];
    },
    whenReady: () => textureReady,
    getBasemapStatus: () => basemapStatus,
    getFrame() {
      if (!frame) return null;
      const { target, up, east, north, span, halfWidth, halfHeight } = frame;
      return { target: target.clone(), up: up.clone(), east: east.clone(), north: north.clone(), span, halfWidth, halfHeight, distance: span * 1.75 };
    },
    dispose() { clear(); overlay.remove(); group.removeFromParent(); },
  };
}
