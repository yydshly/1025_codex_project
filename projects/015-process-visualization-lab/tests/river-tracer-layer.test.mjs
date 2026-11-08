import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from '../app/vendor/three.module.js';
import { latLonToVector } from '../app/globe-effects.js';
import { createRiverTracerLayer, riverDisplayFraction } from '../app/river-tracer-layer.js';

const event = JSON.parse(readFileSync(new URL('../app/data/river-big-piney-dynamic.json', import.meta.url)));
const radius = 2;

function setup(loadTexture, onSelect) {
  function element(tag) {
    const style = { setProperty(name, value) { this[name] = value; } };
    return {
      tag, style, dataset: {}, attrs: {}, children: [], listeners: {},
      appendChild(child) { this.children.push(child); },
      setAttribute(key, value) { this.attrs[key] = value; },
      addEventListener(type, listener) { this.listeners[type] = listener; },
      remove() { this.removed = true; },
    };
  }
  const host = element('div');
  host.ownerDocument = { createElement: element, createElementNS: (_ns, tag) => element(tag) };
  const globe = new THREE.Group();
  const layer = createRiverTracerLayer(radius, host, { loadTexture, onSelect });
  globe.add(layer.group);
  layer.setData(event);
  layer.setVisible(true);
  layer.setView('detail');
  return { layer, globe, overlay: host.children[0] };
}

function recordsAt(elapsedSeconds) {
  return {
    elapsedSeconds,
    readings: event.transects.flatMap(transect => transect.banks.map(bank => ({
      id: bank.id,
      value: bank.samples.find(sample => sample.elapsedSeconds === elapsedSeconds)?.value ?? null,
    }))),
  };
}

test('Big Piney updates six point symbols from their same-frame measurements across the three downstream peaks', async () => {
  const { layer, globe, overlay } = setup(() => Promise.resolve(new THREE.Texture()));
  assert.equal(await layer.whenReady(), true);
  assert.equal(layer.getBasemapStatus(), 'ready');
  for (const transect of event.transects) {
    const elapsed = transect.banks[0].peak.elapsedSeconds;
    const frame = recordsAt(elapsed);
    assert.equal(layer.setSnapshot(frame), true);
    assert.equal(overlay.dataset.observedElapsedSeconds, String(elapsed));
    const actual = event.transects.flatMap(value => value.banks);
    for (const [index, bank] of actual.entries()) {
      const symbol = globe.getObjectByName('river-gauge-' + bank.id);
      const world = symbol.getWorldPosition(new THREE.Vector3());
      assert.ok(world.clone().setLength(radius).distanceTo(latLonToVector(bank.lat, bank.lon, radius)) < 2e-8);
      const value = frame.readings[index].value;
      const expectedHeight = 400 * radius / 6371008.8 * riverDisplayFraction(value);
      const [halo, base, stem, cap] = symbol.children;
      assert.ok(Math.abs(cap.position.z - expectedHeight) < 1e-12);
      assert.equal(stem.visible, value > 0);
      assert.equal(halo.visible, value !== null && value >= event.signalRule.thresholdPpb);
      assert.equal(base.material.color.getHexString(), bank.bank === 'left' ? '65dfce' : 'f0bf70');
    }
  }
  const local = layer.getFrame(), width = 360, height = 530;
  const camera = new THREE.PerspectiveCamera(39, width / height, .000002, .12);
  const distance = Math.max(local.halfHeight, local.halfWidth / camera.aspect) / Math.tan(camera.fov * Math.PI / 360);
  camera.position.copy(local.target).addScaledVector(local.up, distance).addScaledVector(local.north, -.40 * distance);
  camera.up.copy(local.north);
  camera.lookAt(local.target);
  layer.project(camera, globe, width, height);
  assert.deepEqual(layer.getVisibleAnnotations(), ['t1', 't2', 't3']);
  layer.setAnnotations(false);
  layer.project(camera, globe, width, height);
  assert.deepEqual(layer.getVisibleAnnotations(), []);
  assert.equal(globe.getObjectByName('river-gauge-t1-left').visible, true);
  assert.equal(overlay.children.find(node => node.tag === 'a').hidden, false);
  layer.dispose();
});

test('an unavailable basemap preserves the real NHD context and distinguishes missing from measured zero', async () => {
  const { layer, globe, overlay } = setup(() => Promise.reject(new Error('missing')));
  assert.equal(await layer.whenReady(), false);
  assert.equal(layer.getBasemapStatus(), 'fallback');
  assert.ok(globe.getObjectByName('river-nhd-centerline').geometry.attributes.position.count > 10);
  const elapsedSeconds = event.clock.at(-1).elapsedSeconds;
  const snapshot = recordsAt(elapsedSeconds);
  assert.equal(layer.setSnapshot(snapshot), true);
  const missing = snapshot.readings.find(reading => reading.value === null);
  assert.ok(missing);
  assert.equal(globe.getObjectByName('river-gauge-' + missing.id).children[1].material.color.getHexString(), '909da5');
  const labels = overlay.children.filter(node => node.tag === 'button');
  assert.ok(labels.some(node => node.attrs['aria-label']?.includes('缺测')));
  const firstZero = event.transects.flatMap(transect => transect.banks).flatMap(bank => bank.samples).find(sample => sample.value === 0);
  const zero = recordsAt(firstZero.elapsedSeconds);
  assert.equal(layer.setSnapshot(zero), true);
  const observed = zero.readings.find(reading => reading.value === 0);
  assert.ok(observed);
  const zeroGlyph = globe.getObjectByName('river-gauge-' + observed.id);
  assert.notEqual(zeroGlyph.children[1].material.color.getHexString(), '909da5');
  assert.equal(zeroGlyph.children[2].visible, false);
  layer.dispose();
});

test('the guided cross section uses the same threshold for both banks and stays on the selected transect', async () => {
  const {layer,globe}=setup(() => Promise.resolve(new THREE.Texture()));
  await layer.whenReady();
  layer.setGuide('section','right');
  layer.setSnapshot(recordsAt(3300));
  const left=globe.getObjectByName('river-gauge-t1-left');
  const right=globe.getObjectByName('river-gauge-t1-right');
  const ruler=bank=>bank.children.find(child=>child.name.startsWith('river-concentration-reference'));
  const threshold=ruler(right).geometry.attributes.position.getZ(2);
  assert.equal(ruler(left).geometry.attributes.position.getZ(2),threshold);
  assert.ok(left.children[3].position.z<threshold);
  assert.ok(right.children[3].position.z>threshold);
  assert.equal(ruler(left).visible,true);
  assert.equal(ruler(right).visible,true);
  layer.selectTransect('t2');
  assert.equal(ruler(right).visible,false);
  assert.equal(ruler(globe.getObjectByName('river-gauge-t2-right')).visible,true);
  layer.dispose();
});

test('the river scene shows exact bank arrivals, concentrations and recession when seeking in either direction', async () => {
  const { layer, overlay } = setup(() => Promise.resolve(new THREE.Texture()));
  await layer.whenReady();
  const [signals, , sequence] = overlay.children;
  const steps = sequence.children[1].children;
  const sensor = id => signals.children.find(node => node.dataset.riverSensor === id);
  const phases = () => steps.map(step => step.dataset.phase);
  const seek = elapsed => layer.setSnapshot(recordsAt(elapsed));

  seek(3270);
  assert.deepEqual(phases(), ['waiting', 'waiting', 'waiting']);
  seek(3300);
  assert.deepEqual(phases(), ['arrival', 'waiting', 'waiting']);
  assert.equal(sensor('t1-right').dataset.phase, 'arrival');
  assert.equal(sensor('t1-right').dataset.value, '6.93');
  assert.equal(sensor('t1-left').dataset.phase, 'waiting');
  const arrivalRadius = Number(sensor('t1-right').dataset.radius);

  seek(3600);
  assert.equal(sensor('t1-right').dataset.phase, 'peak');
  assert.equal(sensor('t1-right').dataset.value, '213.76');
  assert.ok(Number(sensor('t1-right').dataset.radius) > arrivalRadius);
  seek(7650);
  assert.equal(steps[1].dataset.phase, 'arrival');
  assert.equal(sensor('t2-left').dataset.value, '5.35');
  assert.equal(steps[2].dataset.phase, 'waiting');
  seek(12870);
  assert.deepEqual(phases(), ['below', 'recorded', 'arrival']);
  assert.deepEqual(steps.map(step => step.dataset.firstSignal), ['3300', '7650', '12870']);
  assert.equal(sensor('t3-left').dataset.value, '5');
  assert.equal(sensor('t3-right').dataset.phase, 'waiting');
  assert.equal(sensor('t1-right').dataset.radius, '0');
  seek(3270);
  assert.deepEqual(steps.map(step => step.dataset.arrived), ['0', '0', '0']);
  assert.equal(sensor('t3-left').dataset.radius, '0');
  assert.equal(sensor('t3-left').dataset.elapsed, '3270');
  layer.dispose();
});

test('zoomed-out settled river view keeps transects clickable at the same measured tick', async () => {
  const selected = [];
  const { layer, globe, overlay } = setup(() => Promise.resolve(new THREE.Texture()), id => selected.push(id));
  await layer.whenReady();
  const elapsed = event.transects[1].banks[0].peak.elapsedSeconds;
  layer.setSnapshot(recordsAt(elapsed));
  const local = layer.getFrame(), width = 270, height = 430;
  const camera = new THREE.PerspectiveCamera(39, width / height, .000002, .12);
  camera.position.copy(local.target).addScaledVector(local.up, local.span * 5.1);
  camera.up.copy(local.north);
  camera.lookAt(local.target);
  layer.project(camera, globe, width, height, { flying: true });
  assert.deepEqual(layer.getVisibleAnnotations(), []);
  layer.project(camera, globe, width, height);
  assert.deepEqual(layer.getVisibleAnnotations(), ['t1', 't2', 't3']);
  const second = overlay.children.find(node => node.dataset.riverTransect === 't2');
  assert.equal(second.style.pointerEvents, 'auto');
  second.listeners.click();
  const sequence = overlay.children.find(node => node.className === 'river-sequence');
  sequence.children[1].children[2].listeners.click();
  assert.deepEqual(selected, ['t2', 't3']);
  assert.equal(overlay.dataset.observedElapsedSeconds, String(elapsed));
  layer.dispose();
});
