import * as THREE from './vendor/three.module.js';
import { utcMillis } from './sync-timeline.js';

const DEG = Math.PI / 180;
const COLORS = { quake: '#aa9bff', volcano: '#ffa76d', storm: '#79dce9' };
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const geo = (lat, lon, radius) => new THREE.Vector3(radius * Math.cos(lat * DEG) * Math.cos(lon * DEG), radius * Math.sin(lat * DEG), -radius * Math.cos(lat * DEG) * Math.sin(lon * DEG));

/** Screen-space symbol classes, not an impact radius or intensity field. */
export function eventMarkerSize(kind, magnitude) {
  if (kind !== 'quake') return kind === 'volcano' ? 15 : 14;
  return !Number.isFinite(magnitude) ? 12 : magnitude >= 7 ? 23 : magnitude >= 6 ? 19 : magnitude >= 5 ? 15 : 12;
}

function checkedPosition(record, label) {
  if (!record || !Number.isFinite(record.lat) || !Number.isFinite(record.lon) || Math.abs(record.lat) > 90 || Math.abs(record.lon) > 180) throw new TypeError(label + ' requires reported latitude and longitude.');
  utcMillis(record.timeUtc);
  return { ...record };
}

function pointMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { pixelRatio: { value: 1 } }, transparent: true, depthTest: true, depthWrite: false, toneMapped: false,
    vertexShader: 'attribute float symbolSize;attribute vec3 symbolColor;uniform float pixelRatio;varying vec3 tint;void main(){tint=symbolColor;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_PointSize=symbolSize*pixelRatio;}',
    fragmentShader: 'varying vec3 tint;void main(){float r=length(gl_PointCoord-vec2(.5))*2.;if(r>1.)discard;float core=1.-smoothstep(.24,.40,r);float glow=exp(-5.*r*r)*.45;gl_FragColor=vec4(tint,max(core,glow));\n#include <colorspace_fragment>\n}',
  });
}

function replacePoints(object, records, positions, selectedId = null, fixedSize = null) {
  const geometry = new THREE.BufferGeometry().setFromPoints(positions), sizes = [], colors = [];
  for (const record of records) {
    sizes.push(fixedSize ?? eventMarkerSize(record.kind, record.magnitude) + (record.id === selectedId ? 5 : 0));
    new THREE.Color(COLORS[record.kind]).toArray(colors, colors.length);
  }
  geometry.setAttribute('symbolSize', new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('symbolColor', new THREE.Float32BufferAttribute(colors, 3));
  object.geometry.dispose(); object.geometry = geometry;
}

/** Source positions only. Quake dots, fixed-length volcano pins and reported storm positions.
 * setTime(null) is a catalogue of each event's latest report, not simultaneous observations.
 * A finite time filters every marker to source records at/before that UTC instant.
 * Selecting an event reveals only its actual observations through the selected index.
 */
export function createEarthEventLayer(radius = 2) {
  if (!Number.isFinite(radius) || radius <= 0) throw new RangeError('A positive globe radius is required.');
  const group = new THREE.Group(); group.name = 'source-earth-events'; group.visible = false;
  const markers = new THREE.Points(new THREE.BufferGeometry(), pointMaterial()); markers.name = 'reported-event-locations'; markers.renderOrder = 5;
  const pins = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: COLORS.volcano, toneMapped: false, transparent: true, opacity: .9, depthWrite: false }));
  pins.name = 'volcano-location-pins-not-plume-heights'; pins.renderOrder = 4;
  const reported = new THREE.Points(new THREE.BufferGeometry(), pointMaterial()); reported.name = 'selected-storm-original-observations'; reported.renderOrder = 6;
  const path = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: COLORS.storm, transparent: true, opacity: .65, depthWrite: false, toneMapped: false }));
  path.name = 'reported-position-connectors-not-reconstructed-track'; path.renderOrder = 3;
  group.add(markers, pins, path, reported);
  const raycaster = new THREE.Raycaster(); raycaster.params.Points.threshold = .05;
  let events = [], selectedId = null, observationIndex = -1, cutoff = null, visibleRecords = [], vectors = [], disposed = false;

  function setEvents(input) {
    if (!Array.isArray(input)) throw new TypeError('An event array is required.');
    const ids = new Set();
    const next = input.map(event => {
      if (!event || !Object.hasOwn(COLORS, event.kind) || typeof event.id !== 'string' || !event.id || ids.has(event.id)) throw new TypeError('Events require unique ids and a supported kind.');
      ids.add(event.id); checkedPosition(event, event.id);
      if (!Array.isArray(event.observations)) throw new TypeError('An original observation array is required.');
      let previous = -Infinity;
      const observations = event.observations.map(observation => {
        const record = checkedPosition(observation, event.id), stamp = utcMillis(record.timeUtc);
        if (stamp < previous) throw new RangeError('Original observations must be in ascending time order.');
        previous = stamp; return record;
      });
      return { ...event, observations };
    });
    events = next;
    const selected = events.find(event => event.id === selectedId);
    if (!selected) { selectedId = null; observationIndex = -1; }
    else observationIndex = observationIndex < 0 ? selected.observations.length - 1 : Math.min(observationIndex, selected.observations.length - 1);
    rebuild();
  }

  function recordFor(event) {
    let index = event.id === selectedId ? observationIndex : event.observations.length - 1;
    if (!event.observations.length) return cutoff === null || utcMillis(event.timeUtc) <= cutoff ? { event, observation: null, index: -1, record: event } : null;
    while (index >= 0 && cutoff !== null && utcMillis(event.observations[index].timeUtc) > cutoff) --index;
    return index >= 0 ? { event, observation: event.observations[index], index, record: event.observations[index] } : null;
  }

  function rebuild() {
    if (disposed) return;
    const rows = events.map(recordFor).filter(Boolean);
    visibleRecords = rows.map(({ event, record, index }) => ({ ...record, id: event.id, kind: event.kind, observationIndex: index, magnitude: record.magnitude ?? event.magnitude ?? null }));
    vectors = visibleRecords.map(record => geo(record.lat, record.lon, radius + (record.kind === 'volcano' ? .10 : .018)));
    replacePoints(markers, visibleRecords, vectors, selectedId);
    const pinPoints = [];
    for (const record of visibleRecords) if (record.kind === 'volcano') pinPoints.push(geo(record.lat, record.lon, radius + .006), geo(record.lat, record.lon, radius + .10));
    pins.geometry.dispose(); pins.geometry = new THREE.BufferGeometry().setFromPoints(pinPoints);
    const selection = getSelection();
    const observed = selection?.event.kind === 'storm' ? selection.event.observations.slice(0, selection.index + 1).filter(record => cutoff === null || utcMillis(record.timeUtc) <= cutoff) : [];
    const points = observed.map(record => geo(record.lat, record.lon, radius + .014));
    replacePoints(reported, observed.map(record => ({ ...record, kind: 'storm' })), points, null, 8);
    // Geometric connector vertices are never returned as observations or used for time/values.
    const arc = [];
    for (let i = 0; i < points.length; i++) {
      if (!i) { arc.push(points[i].clone()); continue; }
      const a = points[i - 1].clone().normalize(), b = points[i].clone().normalize();
      const angle = Math.acos(clamp(a.dot(b), -1, 1)), segments = Math.max(1, Math.ceil(angle / DEG));
      const turn = new THREE.Quaternion().setFromUnitVectors(a, b);
      for (let j = 1; j <= segments; j++) arc.push(a.clone().applyQuaternion(new THREE.Quaternion().slerp(turn, j / segments)).multiplyScalar(radius + .014));
    }
    path.geometry.dispose(); path.geometry = new THREE.BufferGeometry().setFromPoints(arc);
    path.visible = points.length > 1; reported.visible = points.length > 0;
  }

  function selectEvent(id) {
    if (id === null) { selectedId = null; observationIndex = -1; rebuild(); return null; }
    const event = events.find(item => item.id === id);
    if (!event) throw new RangeError('Unknown source event: ' + id);
    selectedId = id; observationIndex = event.observations.length - 1; rebuild(); return getSelection();
  }

  function setObservation(index) {
    const event = events.find(item => item.id === selectedId);
    if (!event) return null;
    if (!Number.isInteger(index)) throw new TypeError('Choose an original observation index.');
    observationIndex = event.observations.length ? clamp(index, 0, event.observations.length - 1) : -1;
    rebuild(); return getSelection();
  }

  function setTime(timeUtc = null) { cutoff = timeUtc === null ? null : utcMillis(timeUtc); rebuild(); }
  function getSelection() { const event = events.find(item => item.id === selectedId); return event ? recordFor(event) : null; }
  function getSelectedPosition() { const index = visibleRecords.findIndex(record => record.id === selectedId); return index >= 0 ? vectors[index].clone() : null; }
  function pick(pointer, camera) {
    if (!group.visible || !visibleRecords.length) return null;
    group.updateWorldMatrix(true, true); camera.updateWorldMatrix(true, false); raycaster.setFromCamera(pointer, camera);
    const cameraPosition = camera.getWorldPosition(new THREE.Vector3()), earthCenter = group.getWorldPosition(new THREE.Vector3());
    const hit = raycaster.intersectObject(markers).find(entry => {
      const world = group.localToWorld(vectors[entry.index].clone());
      return world.clone().sub(earthCenter).normalize().dot(cameraPosition.clone().sub(world)) > 0;
    });
    return hit ? visibleRecords[hit.index].id : null;
  }
  function dispose() { if (disposed) return; disposed = true; group.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); }); group.removeFromParent(); }
  return { group, setEvents, selectEvent, setObservation, setTime, getSelection, getSelectedPosition, pick, dispose,
    setVisible(value) { group.visible = !disposed && Boolean(value); },
    setPixelRatio(value) { if (Number.isFinite(value) && value > 0) for (const object of [markers, reported]) object.material.uniforms.pixelRatio.value = value; },
    getVisibleRecords: () => visibleRecords.map(record => ({ ...record })), getCount: () => events.length,
  };
}
