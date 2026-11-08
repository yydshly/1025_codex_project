import * as THREE from './vendor/three.module.js';
import {createDieselChangeOverlay} from './diesel-change-overlay.js';

const TAU = Math.PI * 2;
const SVG_NS = 'http://www.w3.org/2000/svg';
const FRAME = { halfWidth: 1.92, halfHeight: 1.24, depth: .8 };
const MOTION_SCALE = 1 / 120;
const CRANK = { journalY: -.39, throwRadius: .135, rodLength: .52, pistonZ: -.04 };
const CHANNELS = [
  { id: 'rpm', field: 'rpm', name: '转速', source: '实测', unit: 'rpm', digits: 1, color: '#72d9f1' },
  { id: 'torque', field: 'torqueNm', name: '扭矩', source: '实测', unit: 'N·m', digits: 1, color: '#ffc074' },
  { id: 'railPressure', field: 'railPressureMpa', name: '共轨压力', source: '原档 RP', unit: 'MPa', digits: 2, color: '#f3a4ce' },
];

function makeElement(document, parent, tag, style, className) {
  const element = document.createElement(tag);
  Object.assign(element.style, style);
  if (className) element.className = className;
  parent.appendChild(element);
  return element;
}

function makeSvg(document, parent, tag, attributes) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  parent.appendChild(element);
  return element;
}

function makeEngine(group) {
  const engine = new THREE.Group();
  group.add(engine);
  const material = (color, roughness, metalness, side = THREE.FrontSide) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, side });
  const iron = material('#3a4e62', .53, .32);
  const painted = material('#416d87', .45, .24);
  const edge = material('#7596aa', .36, .36);
  const steel = material('#a0aab4', .32, .4, THREE.DoubleSide);
  const dark = material('#202c36', .53, .27);
  const railMetal = material('#ac8863', .34, .4);
  const amber = material('#ce9c65', .36, .32);

  function add(owner, geometry, surface, x, y, z) {
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.position.set(x, y, z);
    owner.add(mesh);
    return mesh;
  }

  function block(owner, surface, x, y, z, width, height, depth) {
    return add(owner, new THREE.BoxGeometry(width, height, depth), surface, x, y, z);
  }

  function cylinder(owner, surface, x, y, z, radius, length, axis = 'y', segments = 36) {
    const mesh = add(owner, new THREE.CylinderGeometry(radius, radius, length, segments), surface, x, y, z);
    if (axis === 'x') mesh.rotation.z = Math.PI / 2;
    if (axis === 'z') mesh.rotation.x = Math.PI / 2;
    return mesh;
  }

  function link(owner, surface, points, radius) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    return add(owner, new THREE.TubeGeometry(curve, 26, radius, 9), surface, 0, 0, 0);
  }

  block(engine, dark, 0, -.89, 0, 3.02, .09, 1.25);
  for (const x of [-.91, .91]) {
    block(engine, edge, x, -.8, 0, .32, .1, 1.05);
    for (const z of [-.45, .45]) cylinder(engine, steel, x, -.73, z, .056, .055, 'y', 6);
  }
  block(engine, iron, 0, -.69, 0, 2.2, .18, .76);
  for (const y of [-.74, -.67, -.6]) block(engine, painted, 0, y, 0, 2.22, .027, .8);
  block(engine, dark, 0, -.05, -.38, 2.18, 1.12, .18);
  block(engine, iron, -.98, -.05, 0, .26, 1.08, .78);
  block(engine, iron, .98, -.05, 0, .26, 1.08, .78);
  for (const y of [.53, .42]) block(engine, painted, 0, y, 0, 2.26, .11, .83);
  block(engine, edge, 0, .61, -.02, 2.01, .068, .76);
  block(engine, iron, -.11, .69, -.13, 1.79, .116, .49);
  for (const x of [-.9, -.67, .66, .92]) {
    cylinder(engine, steel, x, .625, .32, .039, .034, 'y', 6);
    for (const y of [-.49, -.12, .26]) cylinder(engine, edge, x, y, .404, .028, .028, 'z', 6);
  }
  for (const x of [-.77, -.64, .64, .77]) block(engine, painted, x, -.09, .275, .06, .91, .21);
  block(engine, edge, 0, -.48, .357, 2.23, .072, .1);

  const assembly = new THREE.Group();
  assembly.name = 'schematic-piston-and-crankshaft';
  engine.add(assembly);
  const aperture = 1.02;
  const bore = add(assembly,
    new THREE.CylinderGeometry(.377, .377, .7, 48, 1, true, aperture, TAU - aperture * 2),
    steel, 0, .083, -.04);
  bore.name = 'schematic-cylinder-bore';
  for (const side of [-1, 1]) {
    const x = side * .377 * Math.sin(aperture), z = -.04 + .377 * Math.cos(aperture);
    block(assembly, amber, x, .083, z, .036, .7, .045).rotation.y = side * aperture;
  }
  const piston = new THREE.Group();
  piston.name = 'schematic-piston-slider';
  piston.position.z = CRANK.pistonZ;
  assembly.add(piston);
  cylinder(piston, steel, 0, .036, 0, .329, .204);
  for (const y of [.102, .057, .012]) cylinder(piston, dark, 0, y, 0, .332, .017);
  cylinder(piston, railMetal, 0, 0, 0, .051, .646, 'x');

  const shaft = new THREE.Group();
  shaft.name = 'schematic-crankshaft-rotor';
  shaft.position.y = CRANK.journalY;
  assembly.add(shaft);
  // Split the centre journal so the offset crank pin can pass between its webs.
  for (const x of [-.75, .75]) cylinder(shaft, steel, x, 0, 0, .082, 1.21, 'x');
  for (const x of [-.48, .48]) {
    cylinder(assembly, dark, x, CRANK.journalY, 0, .214, .149, 'x');
    cylinder(assembly, edge, x, CRANK.journalY, 0, .122, .159, 'x');
  }
  cylinder(shaft, steel, 0, CRANK.throwRadius, 0, .052, .29, 'x');
  for (const x of [-.163, .163]) {
    cylinder(shaft, painted, x, -.063, 0, .141, .073, 'x');
    block(shaft, steel, x, CRANK.throwRadius * .4, 0, .065, .176, .101);
    cylinder(shaft, railMetal, x, CRANK.throwRadius, 0, .079, .081, 'x');
  }

  const rod = new THREE.Group();
  rod.name = 'schematic-connecting-rod';
  assembly.add(rod);
  block(rod, steel, 0, CRANK.rodLength * .5, 0, .08, CRANK.rodLength * .91, .096);
  cylinder(rod, railMetal, 0, 0, 0, .073, .125, 'x');
  cylinder(rod, steel, 0, CRANK.rodLength, 0, .05, .111, 'x');

  const wheelX = 1.26;
  cylinder(shaft, dark, wheelX, 0, 0, .375, .163, 'x', 48);
  cylinder(shaft, edge, wheelX + .084, 0, 0, .343, .025, 'x', 48);
  cylinder(shaft, iron, wheelX + .098, 0, 0, .258, .028, 'x');
  cylinder(shaft, steel, wheelX + .119, 0, 0, .105, .07, 'x');
  // One high-contrast mark makes each turn readable on the otherwise symmetric wheel.
  block(shaft, amber, wheelX + .108, .24, 0, .031, .185, .061);
  block(shaft, amber, wheelX + .012, .37, 0, .112, .056, .063);
  const gearTooth = new THREE.BoxGeometry(.13, .067, .037);
  for (let i = 0; i < 30; i++) {
    const angle = i / 30 * TAU;
    add(shaft, gearTooth, edge, wheelX, .37 * Math.cos(angle), .37 * Math.sin(angle)).rotation.x = angle;
  }

  const rail = new THREE.Group();
  rail.name = 'schematic-common-rail';
  engine.add(rail);
  cylinder(rail, railMetal, 0, .77, .335, .069, 2.05, 'x');
  for (const x of [-1.02, -.51, .51, 1.02]) {
    cylinder(rail, amber, x, .77, .335, .086, .082, 'x', 6);
    if (Math.abs(x) < .6) block(rail, iron, x, .699, .255, .085, .105, .128);
  }
  link(rail, amber, [[-.14, .757, .33], [-.14, .684, .417], [-.12, .55, .414], [0, .449, .25], [0, .432, .094]], .021);
  cylinder(rail, dark, 0, .455, .094, .055, .17);
  cylinder(rail, railMetal, 0, .371, .094, .028, .088);

  const cover = new THREE.Group();
  cover.name = 'schematic-cutaway-cover';
  engine.add(cover);
  block(cover, painted, 0, -.03, .393, 1.69, .871, .104);
  for (const y of [-.37, -.244, -.118, .008, .134, .26, .386]) {
    block(cover, edge, 0, y, .452, 1.55, .029, .041);
  }
  for (const x of [-.78, .78]) {
    for (const y of [-.397, .344]) cylinder(cover, steel, x, y, .465, .039, .036, 'z', 6);
  }

  const platform = add(group, new THREE.RingGeometry(1.04, 1.047, 100), new THREE.MeshBasicMaterial({
    color: '#6b9ab2', transparent: true, opacity: .28, side: THREE.DoubleSide,
  }), 0, -.94, 0);
  platform.rotation.x = -Math.PI / 2;
  platform.scale.x = 1.64;
  group.add(new THREE.HemisphereLight('#e9f2ff', '#555c74', 1.42));
  const key = new THREE.DirectionalLight('#f5eddc', 2.75);
  key.position.set(2, 4, 4);
  const rim = new THREE.DirectionalLight('#87bcff', 2.3);
  rim.position.set(-3, 1, -2);
  group.add(key, rim);
  return { engine, assembly, cover, piston, shaft, rod };
}

function applyCutaway(model, progress) {
  const eased = progress * progress * (3 - 2 * progress);
  model.cover.position.set(-eased * 1.07, 0, -eased * .15);
  model.cover.rotation.y = -eased * 1.16;
  model.cover.visible = progress < 1;
  model.assembly.visible = progress > .1;
}

function motionPhases(samples) {
  const phases = new Map();
  const radiansPerRpmSecond = TAU * MOTION_SCALE / 60;
  let phase = 0;
  let previous = null;
  for (const sample of samples) {
    // Integrate neighbouring native samples for a deterministic schematic phase at each record.
    if (previous) phase = (phase + radiansPerRpmSecond * (sample.t - previous.t) * (sample.rpm + previous.rpm) / 2) % TAU;
    phases.set(sample.t, phase);
    previous = sample;
  }
  return phases;
}

function applyMotion(model, phase) {
  const crankY = CRANK.journalY + CRANK.throwRadius * Math.cos(phase);
  const crankZ = CRANK.throwRadius * Math.sin(phase);
  const lateralOffset = CRANK.pistonZ - crankZ;
  const rise = Math.sqrt(CRANK.rodLength ** 2 - lateralOffset ** 2);
  model.shaft.rotation.x = phase;
  model.rod.position.set(0, crankY, crankZ);
  model.rod.rotation.x = Math.atan2(lateralOffset, rise);
  model.piston.position.y = crankY + rise;
}

function rangesFor(data) {
  const ranges = Object.fromEntries(CHANNELS.map(channel => [channel.id, [Infinity, -Infinity]]));
  for (const sample of data?.samples ?? []) {
    for (const { id, field } of CHANNELS) {
      const value = sample[field];
      if (!Number.isFinite(value)) continue;
      const range = ranges[id];
      range[0] = Math.min(range[0], value);
      range[1] = Math.max(range[1], value);
    }
  }
  return ranges;
}

export function createDieselEngineLayer(labelHost, { onSelect } = {}) {
  const document = labelHost.ownerDocument ?? globalThis.document;
  const group = new THREE.Group();
  group.name = 'diesel-engine-observatory';
  group.visible = false;
  const overlay = makeElement(document, labelHost, 'div', {
    position: 'absolute', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '6',
  }, 'diesel-engine-overlay');
  overlay.hidden = true;
  const badge = makeElement(document, overlay, 'div', {
    position: 'absolute', left: '12px', top: '12px', padding: '6px 9px', borderRadius: '5px',
    color: '#f0debe', background: '#1d2633ed', border: '1px solid #b49a7169',
    fontSize: '11px', fontWeight: '600', letterSpacing: '.04em',
  }, 'diesel-schematic-badge');
  badge.textContent = '结构运动示意 · 实测转速驱动';
  badge.title = '通用共轨柴油机单缸示意。以台架时间计，按实测转速的 1/120 转动，起始相位为示意。';
  const changes = createDieselChangeOverlay(overlay, {onSelect});
  const svg = makeSvg(document, overlay, 'svg', { 'aria-hidden': 'true' });
  Object.assign(svg.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });

  const callouts = [
    { text: '共轨管 · 示意', anchor: [.57, .77, .39], side: 1, rise: -49 },
    { text: '活塞与连杆 · 示意', anchor: [.038, .048, .3], side: -1, rise: -18, followsPiston: true },
    { text: '曲轴 · 示意', anchor: [.51, -.39, .16], side: 1, rise: 15 },
  ].map(callout => {
    const tag = makeElement(document, overlay, 'span', {
      position: 'absolute', color: '#e3d5c0', background: '#172231ed', border: '1px solid #9b8a6f71',
      borderRadius: '5px', padding: '4px 6px', whiteSpace: 'nowrap', fontSize: '10px', lineHeight: '1.2',
    }, 'diesel-structure-callout');
    tag.textContent = callout.text;
    tag.hidden = true;
    const path = makeSvg(document, svg, 'path', { stroke: '#d8ccb5a8', 'stroke-width': '1', fill: 'none' });
    const dot = makeSvg(document, svg, 'circle', { r: '2.5', fill: '#e3cfab' });
    return { ...callout, point: new THREE.Vector3(...callout.anchor), tag, path, dot };
  });

  const metrics = makeElement(document, overlay, 'div', {
    position: 'absolute', left: '10px', right: '10px', bottom: '53px', display: 'grid',
    gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '6px', maxWidth: '545px', margin: '0 auto',
  }, 'diesel-observed-metrics');
  const cards = CHANNELS.map(channel => {
    const card = makeElement(document, metrics, 'button', {
      position: 'relative', minWidth: '0', width: '100%', color: '#e6f0f9', background: '#0d1c29f4',
      border: '1px solid #90a9bd61', borderBottom: '2px solid ' + channel.color, borderRadius: '6px',
      fontSize: '10px', textAlign: 'left', padding: '6px 8px', lineHeight: '1.2',
      pointerEvents: 'auto', cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
    }, 'diesel-observed-' + channel.id);
    card.type = 'button';
    card.dataset.dieselMetric = channel.id;
    const label = makeElement(document, card, 'span', { display: 'block', color: '#bed2df' });
    label.textContent = channel.name + ' · ' + channel.source;
    const value = makeElement(document, card, 'strong', {
      display: 'block', fontSize: 'clamp(10px,2vw,17px)', marginTop: '3px', color: channel.color, whiteSpace: 'nowrap',
    });
    const bar = makeElement(document, card, 'span', {
      display: 'block', height: '3px', marginTop: '5px', borderRadius: '2px', overflow: 'hidden', background: '#9bb5c92c',
    });
    const fill = makeElement(document, bar, 'span', {
      display: 'block', height: '100%', width: '0%', background: channel.color,
    });
    const dial = makeSvg(document, card, 'svg', { viewBox: '0 0 40 30', 'aria-hidden': 'true' });
    Object.assign(dial.style, { position: 'absolute', right: '5px', top: '5px', width: '27px', opacity: '.82' });
    makeSvg(document, dial, 'path', { d: 'M6 27a16 16 0 1 1 28 0', fill: 'none', stroke: channel.color, 'stroke-width': '1', opacity: '.58' });
    const needle = makeSvg(document, dial, 'path', { d: 'M20 19V6', stroke: channel.color, 'stroke-width': '1.8', 'stroke-linecap': 'round' });
    makeSvg(document, dial, 'circle', { cx: '20', cy: '19', r: '2.2', fill: channel.color });
    card.addEventListener('click', () => onSelect?.(channel.id));
    return { ...channel, card, value, fill, dial, needle };
  });

  let model = null, data = null, snapshot = null, ranges = null, phases = new Map();
  let enabled = false, detailed = false, annotations = true;
  let revealStart = null, revealProgress = 0;
  const point = new THREE.Vector3();
  const viewer = new THREE.Vector3();

  function updateVisibility() {
    group.visible = enabled && detailed && Boolean(data);
    overlay.hidden = !group.visible;
    metrics.style.display = annotations && snapshot ? 'grid' : 'none';
    changes.setVisible(annotations);
  }

  function setView(view) {
    const next = view === 'detail';
    if (next !== detailed) {
      detailed = next;
      revealStart = null;
      revealProgress = next && globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 1 : 0;
      if (model) applyCutaway(model, revealProgress);
    }
    updateVisibility();
  }

  function setData(next) {
    data = next?.kind === 'engine' ? next : null;
    if (data && !model) model = makeEngine(group);
    if (model) applyMotion(model, 0);
    snapshot = null;
    ranges = rangesFor(data);
    phases = motionPhases(data?.samples ?? []);
    changes.setData(data);
    delete overlay.dataset.elapsedSeconds;
    delete overlay.dataset.sampleSeconds;
    delete overlay.dataset.structure;
    delete overlay.dataset.motionPhase;
    delete overlay.dataset.pistonY;
    for (const card of cards) delete overlay.dataset[card.id];
    setView('global');
  }

  function setSnapshot(next) {
    if (!data || next?.eventId !== data.id || next.sample?.t !== next.elapsedSeconds) return false;
    const phase = phases.get(next.elapsedSeconds);
    if (!Number.isFinite(phase)) return false;
    snapshot = next;
    applyMotion(model, phase);
    overlay.dataset.elapsedSeconds = String(next.elapsedSeconds);
    overlay.dataset.sampleSeconds = Number.isFinite(next.sample?.t) ? String(next.sample.t) : '';
    overlay.dataset.motionPhase = phase.toFixed(6);
    overlay.dataset.pistonY = model.piston.position.y.toFixed(6);
    changes.render(next);
    for (const card of cards) {
      const value = next.sample?.[card.field];
      const measured = Number.isFinite(value);
      const displayed = measured ? value.toFixed(card.digits) + ' ' + card.unit : '缺测';
      const [min, max] = ranges[card.id];
      const validRange = Number.isFinite(min) && Number.isFinite(max) && max > min;
      const ratio = measured && validRange ? THREE.MathUtils.clamp((value - min) / (max - min), 0, 1) : 0;
      card.fill.style.width = (ratio * 100).toFixed(2) + '%';
      card.needle.style.display = measured && validRange ? '' : 'none';
      card.needle.setAttribute('transform', 'rotate(' + (ratio * 240 - 120).toFixed(1) + ' 20 19)');
      card.card.title = validRange ? '指针与色条按回放范围显示 ' + min.toFixed(card.digits) + '–' + max.toFixed(card.digits) + ' ' + card.unit : card.name + '读数';
      card.value.textContent = displayed;
      card.card.setAttribute('aria-label', card.name + ' ' + card.source + ' ' + displayed);
      overlay.dataset[card.id] = measured ? String(value) : '';
    }
    updateVisibility();
    return true;
  }

  function project(camera, earthRoot, width, height) {
    if (!group.visible || width < 1 || height < 1) return;
    if (revealProgress < 1) {
      const now = globalThis.performance.now();
      revealStart ??= now;
      revealProgress = THREE.MathUtils.clamp((now - revealStart - 460) / 820, 0, 1);
      applyCutaway(model, revealProgress);
    }
    overlay.dataset.structure = revealProgress >= 1 ? 'cutaway' : revealProgress === 0 ? 'shell' : 'opening';
    camera.updateMatrixWorld();
    model.engine.updateWorldMatrix(true, false);
    model.engine.worldToLocal(camera.getWorldPosition(viewer));
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    for (const card of cards) card.dial.style.display = width >= 410 ? '' : 'none';
    const show = annotations && revealProgress > .76 && viewer.z > .1 && width >= 320;
    const labelTop = Math.max(50, changes.getBottom() + 6);
    for (const { point: anchor, tag, path, dot, side, rise, followsPiston } of callouts) {
      point.copy(anchor);
      if (followsPiston) point.y += model.piston.position.y;
      model.engine.localToWorld(point).project(camera);
      const x = (point.x + 1) * width / 2, y = (1 - point.y) * height / 2;
      const visible = show && y >= labelTop - 6 && Math.abs(point.x) < .93 && Math.abs(point.y) < .88 && Math.abs(point.z) < 1;
      tag.hidden = !visible;
      path.style.display = dot.style.display = visible ? '' : 'none';
      if (!visible) continue;
      const tagWidth = tag.offsetWidth, tagHeight = tag.offsetHeight;
      const left = THREE.MathUtils.clamp(x + (side > 0 ? 43 : -tagWidth - 43), 8, Math.max(8, width - tagWidth - 8));
      const top = THREE.MathUtils.clamp(y + rise, labelTop, Math.max(labelTop, height - tagHeight - 117));
      tag.style.left = left + 'px';
      tag.style.top = top + 'px';
      const edge = side > 0 ? left : left + tagWidth;
      path.setAttribute('d', 'M' + x + ' ' + y + 'L' + (x + 14 * side) + ' ' + (top + tagHeight / 2) + 'H' + edge);
      dot.setAttribute('cx', x);
      dot.setAttribute('cy', y);
    }
  }

  return {
    group, setData, setSnapshot, setView, project,
    setVisible(value) { enabled = Boolean(value); updateVisibility(); },
    setAnnotations(value) { annotations = Boolean(value); updateVisibility(); },
    getVisibleAnnotations() { return group.visible && annotations && snapshot ? cards.map(card => card.id) : []; },
    getVisibleChanges() { return group.visible && annotations ? changes.getVisibleChanges() : []; },
    getMotionEvidence() { return { basis: 'integrated-measured-rpm', displayRate: MOTION_SCALE, phase: 'schematic-initial-phase' }; },
    getFrame() { return { target: new THREE.Vector3(0, -.14, 0), ...FRAME }; },
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
