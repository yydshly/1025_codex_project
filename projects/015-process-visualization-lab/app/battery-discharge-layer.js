import * as THREE from './vendor/three.module.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FULL_TURN = Math.PI * 2;
const FRAME = { halfWidth: 1.95, halfHeight: 1.13, depth: .56 };
const CHANNELS = [
  { id: 'voltage', field: 'voltageV', name: '端电压', unit: 'V', digits: 3, color: '#70dfef', range: [2.5, 4.3] },
  { id: 'current', field: 'currentA', name: '输出电流', unit: 'A', digits: 4, color: '#ffc072', range: [0, 2.2] },
  { id: 'temperature', field: 'temperatureC', name: '电池温度', unit: '°C', digits: 2, color: '#f59484', range: [20, 42] },
];

function makeElement(document, tag, parent, style, className) {
  const element = document.createElement(tag);
  if (style) Object.assign(element.style, style);
  if (className) element.className = className;
  parent.appendChild(element);
  return element;
}

function makeSvg(document, tag, parent, attributes) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  parent.appendChild(element);
  return element;
}

// A cylindrical wall segment with closed cut edges. X is the cell's long axis.
function wallSegment(length, inner, outer, first, sweep) {
  const positions = [];
  const point = (x, radius, angle) => [x, radius * Math.sin(angle), radius * Math.cos(angle)];
  const half = length / 2;
  const segments = Math.ceil(64 * sweep / FULL_TURN);
  function face(a, b, c, d) { positions.push(...a, ...b, ...c, ...a, ...c, ...d); }
  for (let i = 0; i < segments; i++) {
    const a = first + sweep * i / segments, b = first + sweep * (i + 1) / segments;
    const outerStartA = point(-half, outer, a), outerStartB = point(-half, outer, b);
    const outerEndA = point(half, outer, a), outerEndB = point(half, outer, b);
    const innerStartA = point(-half, inner, a), innerStartB = point(-half, inner, b);
    const innerEndA = point(half, inner, a), innerEndB = point(half, inner, b);
    face(outerStartA, outerEndA, outerEndB, outerStartB);
    face(innerStartB, innerEndB, innerEndA, innerStartA);
    face(innerStartA, outerStartA, outerStartB, innerStartB);
    face(innerEndB, outerEndB, outerEndA, innerEndA);
    if (i === 0) face(innerStartA, innerEndA, outerEndA, outerStartA);
    if (i === segments - 1) face(outerStartB, outerEndB, innerEndB, innerStartB);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function makeCell(group) {
  const cell = new THREE.Group();
  cell.rotation.z = .14;
  group.add(cell);
  const metal = (color, roughness, metalness) => new THREE.MeshStandardMaterial({
    color, roughness, metalness, side: THREE.DoubleSide,
  });
  const shell = metal('#47667a', .32, .42);
  const steel = metal('#99adbd', .29, .53);
  const darkSteel = metal('#243344', .47, .35);
  const insulation = metal('#263b40', .71, .12);
  const copper = metal('#c88459', .5, .33);
  const separator = metal('#d9d2ad', .75, .08);
  const cathode = metal('#688e8a', .63, .14);
  const anode = metal('#313c48', .82, .18);
  const aperture = 1.1;
  const add = (owner, geometry, material) => {
    const mesh = new THREE.Mesh(geometry, material);
    owner.add(mesh);
    return mesh;
  };
  const can = add(cell, wallSegment(2.62, .364, .397, aperture, FULL_TURN - 2 * aperture), shell);
  can.name = 'schematic-can';
  const lid = new THREE.Group();
  lid.name = 'schematic-cutaway-lid';
  cell.add(lid);
  add(lid, wallSegment(2.62, .364, .397, -aperture, 2 * aperture), shell);
  for (const x of [-1.22, 1.22]) {
    add(cell, wallSegment(.082, .389, .404, aperture, FULL_TURN - 2 * aperture), steel).position.x = x;
    add(lid, wallSegment(.082, .389, .404, -aperture, 2 * aperture), steel).position.x = x;
  }

  const winding = new THREE.Group();
  winding.name = 'schematic-wound-electrodes';
  cell.add(winding);
  const foils = [copper, separator, cathode, anode];
  // Offset each cut face so the foil layers are individually visible.
  for (let i = 0; i < 12; i++) {
    const outer = .354 - i * .023, angle = .99 - i * .106;
    add(winding, wallSegment(2.4, outer - .019, outer, angle, FULL_TURN - angle - (1.28 - i * .072)), foils[i % foils.length]);
  }
  const core = add(winding, new THREE.CylinderGeometry(.068, .068, 2.43, 24), darkSteel);
  core.rotation.z = -Math.PI / 2;

  function cap(x, radius, length, material) {
    const part = add(cell, new THREE.CylinderGeometry(radius, radius, length, 64), material);
    part.rotation.z = -Math.PI / 2;
    part.position.x = x;
  }
  cap(-1.33, .39, .05, steel);
  cap(-1.365, .31, .018, darkSteel);
  cap(1.33, .39, .05, steel);
  cap(1.366, .289, .029, insulation);
  cap(1.394, .213, .045, steel);
  cap(1.424, .15, .028, steel);

  const wireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.35, -.05, .022), new THREE.Vector3(-1.57, -.37, .022),
    new THREE.Vector3(-1.37, -.68, .045), new THREE.Vector3(-.51, -.7, .055),
    new THREE.Vector3(.5, -.7, .055), new THREE.Vector3(1.35, -.68, .045),
    new THREE.Vector3(1.62, -.37, .022), new THREE.Vector3(1.438, -.04, .022),
  ], false, 'centripetal');
  const wire = new THREE.TubeGeometry(wireCurve, 68, .016, 8, false);
  add(cell, wire, darkSteel);
  const wireSignal = add(cell, new THREE.TubeGeometry(wireCurve, 68, .019, 8, false), new THREE.MeshBasicMaterial({
    color: CHANNELS[1].color, transparent: true, opacity: 0, depthWrite: false, toneMapped: false,
  }));
  wireSignal.name = 'measured-current-indicator';
  const contacts = [new THREE.Vector3(-1.4, -.13, .025), new THREE.Vector3(1.496, -.13, .025)];
  for (const position of contacts) add(cell, new THREE.SphereGeometry(.048, 16, 12), steel).position.copy(position);
  const guide = new THREE.Mesh(new THREE.RingGeometry(1.04, 1.045, 80), new THREE.MeshBasicMaterial({
    color: '#648397', transparent: true, opacity: .31, side: THREE.DoubleSide,
  }));
  guide.rotation.x = -Math.PI / 2;
  guide.scale.x = 1.65;
  guide.position.y = -.75;
  group.add(guide);

  group.add(new THREE.HemisphereLight('#e7f6ff', '#536480', 1.4));
  const key = new THREE.DirectionalLight('#f6f2df', 3.05);
  key.position.set(2.2, 4.4, 3.8);
  group.add(key);
  const rim = new THREE.DirectionalLight('#80c2ff', 1.9);
  rim.position.set(-3, 1, -2);
  group.add(rim);
  return { cell, lid, winding, wireSignal };
}

function applyCutaway(model, progress) {
  const eased = progress * progress * (3 - 2 * progress);
  model.lid.position.set(0, eased * .54, eased * .58);
  model.lid.rotation.x = -eased * .33;
  model.winding.visible = progress > 0;
}

export function createBatteryDischargeLayer(labelHost, { onSelect } = {}) {
  const document = labelHost.ownerDocument ?? globalThis.document;
  const group = new THREE.Group();
  group.name = 'battery-discharge-observatory';
  group.visible = false;
  const overlay = makeElement(document, 'div', labelHost, {
    position: 'absolute', inset: '0', pointerEvents: 'none', overflow: 'hidden', zIndex: '6',
  }, 'battery-discharge-overlay');
  overlay.hidden = true;
  const header = makeElement(document, 'div', overlay, {
    position: 'absolute', left: '12px', top: '12px', padding: '7px 9px', borderRadius: '6px',
    color: '#e0deee', background: '#151b2ce8', border: '1px solid #8b81a660',
    fontSize: '11px', fontWeight: '600', letterSpacing: '.04em',
  }, 'battery-schematic-badge');
  header.textContent = 'B0005 · 电芯结构示意';
  const svg = makeSvg(document, 'svg', overlay, { 'aria-hidden': 'true' });
  Object.assign(svg.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
  const windingLine = makeSvg(document, 'path', svg, {
    stroke: '#d8ccb58a', 'stroke-width': '.9', fill: 'none',
  });
  const windingPoint = makeSvg(document, 'circle', svg, { r: '2.5', fill: '#e3cfab' });
  const windingTag = makeElement(document, 'div', overlay, {
    position: 'absolute', color: '#e3d5c0', background: '#172231ed', border: '1px solid #9b8a6f71',
    borderRadius: '5px', padding: '4px 6px', whiteSpace: 'nowrap', fontSize: '10px', lineHeight: '1.2',
  }, 'battery-winding-callout');
  windingTag.textContent = '卷绕电极与隔膜 · 示意';
  const metrics = makeElement(document, 'div', overlay, {
    position: 'absolute', left: '12px', right: '12px', bottom: '53px', display: 'grid',
    gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '7px', maxWidth: '550px', margin: '0 auto',
  }, 'battery-observed-metrics');
  const cards = CHANNELS.map(channel => {
    const card = makeElement(document, 'button', metrics, {
      position: 'static', width: '100%', minWidth: '0', color: '#e6f0f9', background: '#0d1c29f0',
      border: '1px solid #90a9bd61', borderBottom: '2px solid ' + channel.color, borderRadius: '6px',
      fontSize: '10px', textAlign: 'left', padding: '6px 8px', lineHeight: '1.22',
      pointerEvents: 'auto', fontVariantNumeric: 'tabular-nums',
    }, 'battery-observed-' + channel.id);
    card.type = 'button';
    card.dataset.batteryMetric = channel.id;
    const [min, max] = channel.range;
    card.title = (channel.id === 'current' ? '色条按电流幅值显示，读数保留符号。显示范围 ' : '色条显示范围 ') + min + '–' + max + ' ' + channel.unit;
    const label = makeElement(document, 'span', card, { display: 'block', color: '#bed2df', whiteSpace: 'normal' });
    label.textContent = channel.name + ' · 实测';
    const value = makeElement(document, 'strong', card, {
      display: 'block', fontSize: 'clamp(11px,2vw,17px)', marginTop: '3px', color: channel.color,
      whiteSpace: 'nowrap',
    });
    const bar = makeElement(document, 'span', card, {
      display: 'block', height: '2px', marginTop: '4px', borderRadius: '1px', overflow: 'hidden', background: '#9bb5c928',
    });
    const fill = makeElement(document, 'span', bar, {
      display: 'block', height: '100%', width: '0%', background: channel.color,
    });
    card.addEventListener('click', () => onSelect?.(channel.id));
    return { ...channel, card, value, fill };
  });

  let model = null, enabled = false, detailed = false, data = null, snapshot = null, annotations = true;
  let revealStart = null, revealProgress = 0;
  const prefersReducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  function updateVisibility() {
    group.visible = enabled && detailed && Boolean(data);
    overlay.hidden = !group.visible;
    metrics.hidden = !annotations || !snapshot;
    metrics.style.display = metrics.hidden ? 'none' : 'grid';
  }

  function setData(next) {
    data = next?.kind === 'battery' ? next : null;
    if (data && !model) model = makeCell(group);
    if (model) model.wireSignal.material.opacity = 0;
    snapshot = null;
    delete overlay.dataset.elapsedSeconds;
    for (const card of cards) delete overlay.dataset[card.id];
    setView('global');
  }

  function setView(view) {
    const next = view === 'detail';
    if (next !== detailed) {
      detailed = next;
      revealStart = null;
      revealProgress = next && prefersReducedMotion() ? 1 : 0;
      if (model) applyCutaway(model, revealProgress);
    }
    updateVisibility();
  }

  function setSnapshot(next) {
    if (!data || !Number.isFinite(next?.elapsedSeconds) || next.eventId !== data.id) return false;
    snapshot = next;
    overlay.dataset.elapsedSeconds = String(next.elapsedSeconds);
    let currentMagnitude = 0;
    for (const card of cards) {
      const value = next.sample?.[card.field];
      const measured = Number.isFinite(value);
      const displayed = measured ? value.toFixed(card.digits) + ' ' + card.unit : '缺测';
      const [min, max] = card.range;
      const amount = card.id === 'current' ? Math.abs(value) : value;
      const ratio = measured ? THREE.MathUtils.clamp((amount - min) / (max - min), 0, 1) : 0;
      card.fill.style.width = (ratio * 100).toFixed(2) + '%';
      card.value.textContent = displayed;
      card.card.setAttribute('aria-label', card.name + '实测 ' + displayed);
      overlay.dataset[card.id] = measured ? String(value) : '';
      if (card.id === 'current') currentMagnitude = ratio;
    }
    model.wireSignal.material.opacity = currentMagnitude * .95;
    updateVisibility();
    return true;
  }

  function project(camera, earthRoot, width, height) {
    if (!group.visible || width < 1 || height < 1) return;
    if (revealProgress < 1) {
      const now = globalThis.performance.now();
      revealStart ??= now;
      revealProgress = THREE.MathUtils.clamp((now - revealStart - 210) / 930, 0, 1);
      applyCutaway(model, revealProgress);
    }
    overlay.dataset.structure = revealProgress >= 1 ? 'cutaway' : revealProgress === 0 ? 'shell' : 'opening';
    camera.updateMatrixWorld();
    model.cell.updateWorldMatrix(true, false);
    const viewer = model.cell.worldToLocal(camera.getWorldPosition(new THREE.Vector3()));
    const showWinding = annotations && revealProgress > .62 && viewer.z > .1;
    windingTag.hidden = !showWinding;
    windingLine.style.display = windingPoint.style.display = showWinding ? '' : 'none';
    if (!showWinding) return;
    const point = model.cell.localToWorld(new THREE.Vector3(-.44, .025, .28)).project(camera);
    const x = (point.x + 1) * width / 2, y = (1 - point.y) * height / 2;
    if (Math.abs(point.x) > .96 || Math.abs(point.y) > .96 || Math.abs(point.z) > 1) {
      windingTag.hidden = true;
      windingLine.style.display = windingPoint.style.display = 'none';
      return;
    }
    const left = THREE.MathUtils.clamp(x - 103, 9, Math.max(9, width - 131));
    const top = Math.max(47, y - 77);
    windingTag.style.left = left.toFixed(1) + 'px';
    windingTag.style.top = top.toFixed(1) + 'px';
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    windingPoint.setAttribute('cx', x.toFixed(1));
    windingPoint.setAttribute('cy', y.toFixed(1));
    windingLine.setAttribute('d', 'M' + (left + 78).toFixed(1) + ' ' + (top + 19).toFixed(1) + 'L' + x.toFixed(1) + ' ' + y.toFixed(1));
  }

  return {
    group, setData, setSnapshot, setView, project,
    setVisible(value) { enabled = Boolean(value); updateVisibility(); },
    setAnnotations(value) { annotations = Boolean(value); updateVisibility(); },
    getVisibleAnnotations() { return group.visible && annotations && snapshot ? cards.map(card => card.id) : []; },
    getFrame() { return { target: new THREE.Vector3(), ...FRAME }; },
    dispose() {
      const geometries = new Set(), materials = new Set();
      group.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materials.add(object.material);
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      overlay.remove();
    },
  };
}
