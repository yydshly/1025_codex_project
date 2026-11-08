import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../app/vendor/three.module.js';
import { createSyncStationLayer } from '../app/sync-station-layer.js';

class Element {
  constructor(tag, ownerDocument) {
    this.tagName = tag; this.ownerDocument = ownerDocument; this.children = []; this.dataset = {}; this.attributes = {};
    this.style = { setProperty(name, value) { this[name] = value; } }; this.hidden = false; this.textContent = '';
  }
  appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
  append(...children) { children.forEach(child => this.appendChild(child)); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  remove() { if (this.parentNode) this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; }
  getBoundingClientRect() { return { width: Math.min(182, Number.parseFloat(this.style.maxWidth) || 182), height: 50 }; }
}
const makeHost = () => {
  const doc = { createElement: tag => new Element(tag, doc), createElementNS: (_,tag) => new Element(tag, doc) };
  return new Element('div', doc);
};
const stations = [
  { id: 'wind', label: '香港国际机场', lat: 22.308919, lon: 113.914603, color: '#79dfed' },
  { id: 'seaLevel', label: '鲗鱼涌', lat: 22.29, lon: 114.21, color: '#ffce83' }
];
const labels = host => host.children.filter(child => child.className === 'sync-station-marker');
const setup = () => {
  const host = makeHost(), layer = createSyncStationLayer(2, host), earth = new THREE.Group();
  earth.add(layer.group); layer.setStations(stations);
  const camera = new THREE.PerspectiveCamera(40, 640/360, .1, 100);
  const lat = 22.3*Math.PI/180, lon = 114.1*Math.PI/180;
  camera.position.set(6*Math.cos(lat)*Math.cos(lon),6*Math.sin(lat),-6*Math.cos(lat)*Math.sin(lon));
  camera.lookAt(0,0,0); camera.updateProjectionMatrix();
  return {host,layer,earth,camera};
};

test('both actual stations project with separate in-bounds labels, and the back hemisphere hides them', () => {
  const {host,layer,earth,camera} = setup();
  layer.setVisible(true); layer.project(camera,earth,640,360);
  const boxes = labels(host).map(label => {
    assert.equal(label.hidden,false);
    const x = parseFloat(label.style.left), y = parseFloat(label.style.top);
    assert.ok(x >= 8 && x+182 <= 632 && y >= 8 && y+50 <= 352);
    return {x,y,w:182,h:50};
  });
  assert.ok(boxes[0].x+182 <= boxes[1].x || boxes[1].x+182 <= boxes[0].x || boxes[0].y+50 <= boxes[1].y || boxes[1].y+50 <= boxes[0].y);
  assert.equal(host.children[0].children.filter(line=>line.style.display==='block').length,2);
  camera.position.multiplyScalar(-1); camera.lookAt(0,0,0);
  layer.project(camera,earth,640,360);
  assert.ok(labels(host).every(label=>label.hidden));
  assert.ok(layer.group.children.every(point=>!point.visible));
  assert.ok(host.children[0].children.every(line=>line.style.display==='none'));
  layer.dispose();
});

test('station replacement disposes geometry, reading text stays literal, hide and dispose clear visibility/DOM', () => {
  const {host,layer,earth,camera} = setup();
  let disposed = 0;
  layer.group.traverse(object=>object.geometry?.addEventListener('dispose',()=>disposed++));
  layer.setReadings([{id:'wind',text:'<img src=x onerror=alert(1)> 60 kt'},{id:'seaLevel',text:null}]);
  assert.equal(labels(host)[0].children[1].textContent,'<img src=x onerror=alert(1)> 60 kt');
  assert.equal(labels(host)[1].children[1].textContent,'未报告');
  assert.equal(labels(host)[0].children.length,2);
  assert.throws(()=>layer.setStations([{id:'rain',label:'地区雨量',lat:22,lon:114}]),/wind/);
  assert.equal(layer.group.children.length,2);
  layer.setStations([stations[0]]);
  assert.equal(disposed,4);
  assert.equal(labels(host).length,1);
  layer.setVisible(true); layer.project(camera,earth,640,360);
  layer.setVisible(false);
  assert.equal(layer.group.visible,false);
  assert.ok(labels(host).every(label=>label.hidden));
  assert.equal(host.children[0].style.display,'none');
  layer.dispose(); layer.dispose();
  assert.equal(host.children.length,0);
  assert.equal(layer.group.children.length,0);
  assert.equal(layer.group.parent,null);
});
