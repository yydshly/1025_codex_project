import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../app/vendor/three.module.js';
import { createObservedStoryLayer, layoutCloudCallouts, layoutObservedCallouts } from '../app/observed-story-layer.js';

class Element {
  constructor(tag, document) { this.tagName = tag; this.ownerDocument = document; this.style = {}; this.children = []; this.dataset = {}; this.attributes = {}; this.listeners = new Map(); this.hidden = false; this.textContent = ''; this.classList = { add() {} }; }
  appendChild(child) { child.remove(); child.parentNode = this; this.children.push(child); return child; }
  after(sibling) {
    sibling.remove(); sibling.parentNode = this.parentNode;
    this.parentNode.children.splice(this.parentNode.children.indexOf(this) + 1, 0, sibling);
  }
  get parentElement() { return this.parentNode; }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.parentNode = null; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  addEventListener(name, callback) { this.listeners.set(name, callback); }
  removeEventListener(name, callback) { if (this.listeners.get(name) === callback) this.listeners.delete(name); }
  click() { if (!this.disabled) this.listeners.get('click')?.(); }
  get offsetHeight() {
    for (let node = this; node; node = node.parentNode) if (node.hidden || node.style.display === 'none') return 0;
    return 84;
  }
}
const pin = (id, lat = 0, lon = 0, extra = {}) => ({ id, lat, lon, title: '观测站', value: '29.4 °C', detail: '真实记录 · UTC 03:10', color: '#79dce9', target: 'temperature-chart', ...extra });
const story = (pins = [pin('main')], lines = []) => ({ id: 'temperature', timeUtc: '2022-09-05T03:10:00Z', pins, lines });
function harness(options = {}) {
  const document = { createElement: tag => new Element(tag, document), createElementNS: (_namespace, tag) => new Element(tag, document) };
  const stage = document.createElement('div'), frame = document.createElement('div'), host = document.createElement('div');
  stage.appendChild(frame); frame.appendChild(host);
  const root = new THREE.Group(), layer = createObservedStoryLayer(2, host, options);
  root.add(layer.group);
  const camera = new THREE.PerspectiveCamera(42, 1.2, .1, 100); camera.position.set(8, 0, 0); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  const project = (width = 600, height = 500, placement) => { camera.aspect = width / height; camera.updateProjectionMatrix(); layer.project(camera, root, width, height, placement); };
  const overlay = host.children[0], leaders = overlay.children[0], buttons = () => overlay.children.filter(child => child.tagName === 'button');
  return { host, root, layer, camera, project, overlay, leaders, buttons, dock: stage.children[1] };
}

test('actual longitude and latitude place fixed symbols at Greenwich, east and north', () => {
  const h = harness(); h.layer.setStory(story([pin('g'), pin('e', 0, 90), pin('n', 90, 0)]));
  const position = id => h.layer.group.getObjectByName('observed-story-pin-' + id).position;
  assert.ok(position('g').distanceTo(new THREE.Vector3(2.014, 0, 0)) < 1e-10);
  assert.ok(position('e').distanceTo(new THREE.Vector3(0, 0, -2.014)) < 1e-10);
  assert.ok(position('n').distanceTo(new THREE.Vector3(0, 2.014, 0)) < 1e-10);
  const marker = h.layer.group.getObjectByName('observed-story-pin-g');
  assert.equal(marker.userData.kind, 'location-symbol-not-physical-extent');
  assert.equal(marker.material.depthTest, true);
});

test('the far hemisphere, perspective horizon and offscreen positions have no DOM callout or floating marker', () => {
  const h = harness(); h.layer.setStory(story([pin('front'), pin('back', 0, 180), pin('horizon', 0, 80)])); h.project();
  assert.equal(h.buttons()[0].hidden, false);
  for (const id of ['back', 'horizon']) { assert.equal(h.buttons().find(button => button.dataset.pinId === id).hidden, true); assert.equal(h.layer.group.getObjectByName('observed-story-pin-' + id).visible, false); }
  h.camera.lookAt(0, 12, 0); h.project();
  assert.ok(h.buttons().every(button => button.hidden));
});

test('projection follows the Earth world transform instead of assuming an unrotated centered sphere', () => {
  const h = harness(); h.layer.setStory(story([pin('g'), pin('e', 0, 90)])); h.project();
  assert.equal(h.buttons()[0].hidden, false); assert.equal(h.buttons()[1].hidden, true);
  h.root.rotation.y = Math.PI; h.project(); assert.ok(h.buttons().every(button => button.hidden));
  h.root.rotation.y = -Math.PI / 2; h.root.position.set(1, 2, 0); h.camera.position.set(9, 2, 0); h.camera.lookAt(1, 2, 0); h.project();
  assert.equal(h.buttons()[1].hidden, false);
  const commands = h.leaders.children[1].attributes.d.split(' ');
  assert.ok(Math.abs(Number(commands[1]) - 300) < .1); assert.ok(Math.abs(Number(commands[2]) - 250) < .1);
});

test('three clustered callouts are measured while their overlay is displayed, stay in bounds, and do not overlap', () => {
  const h = harness(); h.layer.setStory(story([pin('one'), pin('two', 1, 1), pin('three', -1, -1)])); h.project(390, 500);
  const bounds = h.buttons().filter(button => !button.hidden).map(button => ({ x: parseFloat(button.style.left), y: parseFloat(button.style.top), w: parseFloat(button.style.width), h: button.offsetHeight }));
  assert.equal(bounds.length, 3);
  for (const a of bounds) { assert.ok(a.x >= 8 && a.y >= 8 && a.x + a.w <= 382.01 && a.y + a.h <= 492.01); for (const b of bounds) if (a !== b) assert.ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y); }
  assert.ok(h.leaders.children.every(leader => /^M .+ L .+$/.test(leader.attributes.d)));
});

test('layout preserves anchors and hides lower priority text when no legible space remains', () => {
  const input = ['a', 'b', 'c'].map(id => ({ id, anchorX: 100, anchorY: 65, width: 150, height: 80 }));
  const copy = structuredClone(input), placed = layoutObservedCallouts(input, 210, 140);
  assert.deepEqual(input, copy);
  assert.ok(placed.some(entry => entry.hidden));
  assert.ok(placed.every(entry => entry.anchorX === 100 && entry.anchorY === 65));
  assert.ok(placed.filter(entry => !entry.hidden).every(entry => entry.x >= 8 && entry.y >= 8 && entry.x + entry.width <= 202 && entry.y + entry.height <= 132));
});

test('station callouts leave the main waveform card readable', () => {
  const card = { x: 12, y: 50, width: 248, height: 138 };
  const [pin] = layoutObservedCallouts([{ id: 'station', anchorX: 375, anchorY: 100, width: 192, height: 56 }], 740, 240, { reserved: [card] });
  assert.equal(pin.hidden, false);
  assert.ok(pin.x >= card.x + card.width + 8 || pin.y + pin.height <= card.y - 8 || pin.y >= card.y + card.height + 8);
  assert.equal(pin.anchorX, 375);
});

test('cloud callouts fit only in an open side rail and trim lines outside the cloud area', () => {
  const area = { x: 164, y: 8, width: 390, height: 214 };
  const h = harness(); h.layer.setStory({ ...story([pin('one'), pin('two', 1, 1)]), kind: 'volcano' });
  h.project(740, 240, { cloudArea: area });
  assert.equal(h.dock.hidden, true);
  for (const button of h.buttons()) {
    assert.equal(button.dataset.calloutPlacement, 'side');
    assert.ok(parseFloat(button.style.left) >= area.x + area.width + 8);
  }
  for (const leader of h.leaders.children) {
    assert.ok(Number(leader.attributes.d.split(' ')[1]) > area.x + area.width);
  }
  assert.equal(layoutCloudCallouts([{ height: 44 }], 740, 240, { ...area, x: 30, width: 685 }), null);
});

test('narrow and manual views move the same clickable cloud buttons below the image', () => {
  const selected = [], h = harness({ onSelect: target => selected.push(target) });
  const cloud = { ...story([pin('cloud'), pin('offscreen', 0, 180)]), kind: 'storm' };
  h.layer.setStory(cloud); h.project(740, 240, { cloudArea: { x: 170, y: 10, width: 378, height: 195 } });
  const original = h.buttons()[0];
  h.project(390, 360, { cloudArea: { x: 12, y: 15, width: 355, height: 270 } });
  assert.equal(h.dock.hidden, false);
  assert.equal(h.buttons().length, 0);
  assert.equal(h.dock.children[0], original);
  assert.ok(h.dock.children.every(button => button.dataset.calloutPlacement === 'dock' && !button.hidden));
  assert.ok(h.leaders.children.every(leader => leader.style.display === 'none'));
  original.click(); assert.deepEqual(selected, ['temperature-chart']);
  h.project(740, 240); assert.equal(h.dock.hidden, false, 'manual camera leaves all label boxes outside the picture');
  h.layer.setStory({ ...cloud, timeUtc: '2022-09-05T03:20:00Z' }); h.layer.setVisible(true);
  assert.equal(h.dock.hidden, false, 'changing scans keeps the dock open');
  h.layer.setStory(null); assert.equal(h.dock.hidden, true);
});

test('same-id labels reuse their DOM and click the newest target, with plain text rather than HTML injection', () => {
  const selected = [], h = harness({ onSelect: (target, entry) => selected.push({ target, entry }) });
  h.layer.setStory(story()); h.project(); const button = h.buttons()[0]; button.click();
  h.layer.setStory(story([pin('main', 5, 4, { title: '<img src=x>', value: '0', detail: '<script>bad</script>', target: 'pressure-chart' })])); h.project();
  assert.equal(h.buttons()[0], button); assert.equal(button.children[0].textContent, '<img src=x>'); assert.equal(button.children[1].textContent, '0');
  button.click(); assert.deepEqual(selected.map(entry => entry.target), ['temperature-chart', 'pressure-chart']);
  assert.equal(selected[1].entry.lat, 5);
  h.layer.setVisible(false); button.click(); assert.equal(selected.length, 2);
});

test('geographic contours cross the date line on the sphere and never create source observations or motion', () => {
  const h = harness(), input = story([], [{ id: 'cold-contour', coordinates: [[170, 10], [-170, 10]], color: '#a9deed' }]), copy = structuredClone(input);
  h.layer.setStory(input); const line = h.layer.group.getObjectByName('observed-story-contour-cold-contour'), attribute = line.geometry.attributes.position;
  assert.ok(attribute.count > 2);
  for (let i = 0; i < attribute.count; i++) { const position = new THREE.Vector3().fromBufferAttribute(attribute, i); assert.ok(Math.abs(position.length() - 2.01) < 2e-7); assert.ok(position.x < -1.8, 'connector must cross the nearby date line rather than Greenwich'); }
  assert.equal(line.material.depthTest, true); assert.equal(line.material.depthWrite, false); assert.deepEqual(input, copy);
  const geometry = line.geometry; h.project(); h.project(); assert.equal(line.geometry, geometry, 'project never rebuilds geometry');
});

test('same contours reuse geometry; changed/removed geometry and materials are released exactly once', () => {
  const h = harness(), base = story([], [{ id: 'contour', coordinates: [[0, 0], [10, 10]] }]); h.layer.setStory(base);
  const line = h.layer.group.getObjectByName('observed-story-contour-contour'), original = line.geometry; let oldDisposals = 0, currentDisposals = 0, materialDisposals = 0;
  original.addEventListener('dispose', () => oldDisposals++); line.material.addEventListener('dispose', () => materialDisposals++);
  h.layer.setStory({ ...base, timeUtc: '2022-09-05T03:20:00Z' }); assert.equal(line.geometry, original); assert.equal(oldDisposals, 0);
  h.layer.setStory(story([], [{ id: 'contour', coordinates: [[0, 0], [20, 10]] }])); assert.equal(oldDisposals, 1);
  line.geometry.addEventListener('dispose', () => currentDisposals++);
  h.layer.setStory(null); assert.equal(currentDisposals, 1); assert.equal(materialDisposals, 1); assert.equal(h.layer.group.children.length, 0);
  h.layer.dispose(); h.layer.dispose(); assert.equal(oldDisposals, 1); assert.equal(currentDisposals, 1); assert.equal(materialDisposals, 1);
});

test('null, hidden mode and disposal leave no active labels, leaders or retained click handlers', () => {
  const h = harness(); h.layer.setStory(story()); h.project(); const button = h.buttons()[0], marker = h.layer.group.children[0]; let geometryDisposals = 0, materialDisposals = 0;
  marker.geometry.addEventListener('dispose', () => geometryDisposals++); marker.material.addEventListener('dispose', () => materialDisposals++);
  h.layer.setVisible(false); assert.equal(h.layer.group.visible, false); assert.equal(button.hidden, true); assert.equal(h.overlay.style.display, 'none');
  h.layer.setStory(story([pin('main', 0, 5)])); h.project(); assert.equal(button.hidden, true);
  h.layer.setVisible(true); h.project(); assert.equal(button.hidden, false);
  h.layer.setStory(null); assert.equal(h.layer.group.visible, false); assert.equal(h.buttons().length, 0); assert.equal(h.leaders.children.length, 0); assert.equal(button.listeners.size, 0); assert.equal(materialDisposals, 1);
  h.layer.dispose(); h.layer.dispose(); h.layer.setVisible(true); h.layer.setStory(story());
  assert.equal(h.host.children.length, 0); assert.equal(h.layer.group.parent, null); assert.equal(geometryDisposals, 1); assert.equal(h.layer.group.visible, false);
});

test('invalid locations, excessive pins and ambiguous antipodal contours are rejected before replacing a valid story', () => {
  const h = harness(); h.layer.setStory(story()); const button = h.buttons()[0];
  for (const invalid of [story([pin('bad', 91)]), story([pin('same'), pin('same')]), story([pin('1'), pin('2'), pin('3'), pin('4')]), story([], [{ id: 'bad', coordinates: [[0, 0], [180, 0]] }]), { ...story(), timeUtc: 'not-utc' }]) assert.throws(() => h.layer.setStory(invalid));
  assert.equal(h.buttons()[0], button); assert.equal(h.layer.group.children.length, 1);
  h.project(); assert.equal(button.hidden, false);
});
