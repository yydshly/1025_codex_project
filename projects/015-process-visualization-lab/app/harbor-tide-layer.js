import * as THREE from './vendor/three.module.js';
import {latLonToVector} from './globe-effects.js';
import {drawHarborWaterfront} from './harbor-waterfront.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const radians = Math.PI / 180;
const earthMetres = 6371008.8;
const overviewMoonDistanceScale = 1.54;
const overviewMoonSizeScale = .061;
const colors = {moon: '#d6c5ff', observed: '#68e0d4', predicted: '#f5ba70'};
const digits = new Intl.NumberFormat('zh-CN', {minimumFractionDigits: 1, maximumFractionDigits: 1});
const smallAngle = new Intl.NumberFormat('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const metres = new Intl.NumberFormat('zh-CN', {minimumFractionDigits: 3, maximumFractionDigits: 3});
let layerSequence = 0;

// A level, rotating observer view. The narrow crossing shot exaggerates elevation
// around the horizon; its sign and the current sample never change.
function shorelineMoonPoint(moon, plot) {
  const offset = ((moon.azimuthDeg - plot.bearing + 540) % 360) - 180;
  const elevation = Math.min(85, Math.max(-85, moon.elevationDeg));
  const crossingScale = plot.crossingScale ?? 4;
  return [
    plot.mid + offset * plot.degreesToX,
    plot.horizon - (plot.close ? Math.asinh(elevation / crossingScale) / Math.asinh(30 / crossingScale) : elevation / 85) * plot.skyHeight,
  ];
}

/** Topocentric bearing, clockwise from north. Altitude is signed. */
export function harborDirection(azimuthDeg, elevationDeg) {
  const az = azimuthDeg * radians, el = elevationDeg * radians, horizontal = Math.cos(el);
  return new THREE.Vector3(Math.sin(az) * horizontal, Math.cos(az) * horizontal, Math.sin(el));
}

function panoramaPoint(sample, plot) {
  const az = ((sample.azimuthDeg % 360) + 360) % 360;
  const {azimuthMin = 0, azimuthMax = 360, altitudeMin = -90, altitudeMax = 90} = plot;
  return [plot.left + (az - azimuthMin) / (azimuthMax - azimuthMin) * (plot.right - plot.left),
    plot.top + (altitudeMax - sample.elevationDeg) / (altitudeMax - altitudeMin) * (plot.bottom - plot.top)];
}

/** Join neighbouring samples only. A line must not cross the 0° / 360° seam. */
export function harborSkyPath(samples, plot, endTimeUtc = null, cadenceMinutes = 6) {
  const cutoff = endTimeUtc == null ? Infinity : Date.parse(endTimeUtc);
  let path = '', previous = null, previousTime = null;
  for (const sample of samples) {
    const time = Date.parse(sample.timeUtc);
    if (time > cutoff) break;
    if (!validMoon(sample) || !Number.isFinite(time)) { previous = null; continue; }
    const [x, y] = panoramaPoint(sample, plot);
    const contiguous = previous && time - previousTime <= cadenceMinutes * 60000 &&
      Math.abs(sample.azimuthDeg - previous.azimuthDeg) < 180;
    path += (contiguous ? 'L' : 'M') + x.toFixed(2) + ',' + y.toFixed(2);
    previous = sample;
    previousTime = time;
  }
  return path;
}

function validMoon(sample) {
  return Number.isFinite(sample?.azimuthDeg) && Number.isFinite(sample?.elevationDeg);
}

function scaledMoonPosition(radius, sample) {
  const position = harborDirection(sample.azimuthDeg, sample.elevationDeg);
  position.multiplyScalar(sample.rangeKm * radius * 1000 / earthMetres);
  position.z += radius;
  return position.normalize().multiplyScalar(radius * overviewMoonDistanceScale);
}

function lunarDirectionGuide(radius, data, frame) {
  const coordinates = [];
  let previous = null;
  for (const sample of data.moon ?? []) {
    if (!validMoon(sample) || !Number.isFinite(sample.rangeKm) || sample.rangeKm <= 0) { previous = null; continue; }
    const point = scaledMoonPosition(radius, sample);
    point.z -= frame.target.length();
    if (previous && Date.parse(sample.timeUtc) - previous.time <= 360000) coordinates.push(previous.point, point);
    previous = {point, time: Date.parse(sample.timeUtc)};
  }
  const material = new THREE.LineBasicMaterial({color: colors.moon, toneMapped: false, transparent: true, opacity: .53, depthWrite: false});
  const guide = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(coordinates), material);
  guide.name = 'scaled-lunar-direction-guide';
  return guide;
}

function layerFrame(radius, {lat, lon}) {
  const units = radius / earthMetres;
  const up = latLonToVector(lat, lon);
  const east = new THREE.Vector3(-Math.sin(lon * radians), 0, -Math.cos(lon * radians));
  const north = up.clone().cross(east).normalize();
  const target = up.clone().multiplyScalar(radius + 38 * units);
  const point = (latitude, longitude) => {
    const offset = latLonToVector(latitude, longitude, radius).sub(target);
    return new THREE.Vector3(offset.dot(east), offset.dot(north), 0);
  };
  return {target, up, east, north, units, point, halfWidth: 2100 * units, halfHeight: 1800 * units,
    span: 4200 * units, distance: 7800 * units};
}

function ground(imagery, frame) {
  const [west, south, east, north] = imagery.bbox;
  const geometry = new THREE.BufferGeometry().setFromPoints([
    frame.point(south, west), frame.point(south, east), frame.point(north, east), frame.point(north, west),
  ]);
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: '#17394b', toneMapped: false, side: THREE.DoubleSide}));
}

function ring(inner, outer, color, opacity = 1) {
  const material = new THREE.MeshBasicMaterial({color, opacity, transparent: opacity < 1, side: THREE.DoubleSide, toneMapped: false});
  return new THREE.Mesh(new THREE.RingGeometry(inner, outer, 64), material);
}

function disposeGroup(parent) {
  for (const child of [...parent.children]) {
    child.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });
    parent.remove(child);
  }
}

const defaultTexture = url => new THREE.TextureLoader().loadAsync(url);

export function createHarborTideLayer(radius, labelHost, {onSelect, onZoom, loadTexture = defaultTexture, imagery, moonTexture} = {}) {
  const doc = labelHost.ownerDocument ?? document;
  const uid = 'harbor-observer-' + ++layerSequence;
  const group = new THREE.Group(), site = new THREE.Group(), overview = new THREE.Group(), detail = new THREE.Group();
  group.name = 'observed-harbor-tide';
  group.visible = false;
  group.add(site);
  site.add(overview, detail);

  function html(tag, parent, className, style) {
    const el = doc.createElement(tag);
    if (className) el.className = className;
    if (style) Object.assign(el.style, style);
    parent.appendChild(el);
    return el;
  }

  function svg(tag, parent, attrs) {
    const el = doc.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
    parent.appendChild(el);
    return el;
  }

  const overlay = html('div', labelHost, 'harbor-tide-overlay', {
    position: 'absolute', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '6',
  });
  overlay.hidden = true;
  const lines = svg('svg', overlay, {'aria-hidden': 'true'});
  Object.assign(lines.style, {position: 'absolute', inset: '0', width: '100%', height: '100%'});
  const stationLine = svg('path', lines, {stroke: colors.observed, 'stroke-width': '1', fill: 'none', 'stroke-opacity': '.8'});
  const moonHalo = html('div', overlay, 'harbor-global-halo', {
    position: 'absolute', width: '62px', height: '62px', transform: 'translate(-50%, -50%)',
    background: 'radial-gradient(circle,transparent 22%,#a9b9fd38 29%,#a9b9fd19 47%,transparent 70%)',
  });
  moonHalo.hidden = true;
  const station = html('button', overlay, 'harbor-tide-station', {
    padding: '5px 8px', margin: '0', position: 'absolute', transform: 'translate(11px, -50%)', borderRadius: '5px',
    border: '1px solid #a3ede073', background: '#071922ed', color: '#ecfffa', fontSize: '10px', pointerEvents: 'auto',
  });
  station.type = 'button';
  station.textContent = '旧金山验潮站 · NOAA 9414290';
  station.addEventListener('click', () => onSelect?.('observed'));
  const moonTag = html('button', overlay, 'harbor-global-moon', {
    padding: '5px 8px', margin: '0', position: 'absolute', borderRadius: '5px', fontSize: '10px',
    border: '1px solid #bdabf36b', background: '#0d172af2', color: colors.moon, pointerEvents: 'auto',
  });
  moonTag.type = 'button';
  moonTag.textContent = '月球 · 示意比例';
  moonTag.title = '细线连接本日六分钟星历的地心方向，距离与月球尺寸均为显示比例';
  moonTag.addEventListener('click', () => onSelect?.('moon'));
  const local = html('div', overlay, 'harbor-observer', {position: 'absolute', inset: '0', background: '#142a3b'});
  const shot = html('div', local, 'harbor-observer-shot', {
    position: 'absolute', inset: '0', transformOrigin: '53% 49%',
  });
  const sky = html('div', shot, 'harbor-observer-sky', {
    position: 'absolute', inset: '0 0 auto', color: '#eff6ff',
    background: 'linear-gradient(180deg,#071124,#1b344c 66%,#375466)',
  });
  const waterfront = html('canvas', shot, 'harbor-waterfront-canvas', {
    position: 'absolute', left: 0, width: '100%', display: 'block',
  });
  waterfront.setAttribute('aria-hidden', 'true');
  const waterCtx = waterfront.getContext?.('2d');
  const skyLabel = html('button', local, 'harbor-sky-label', {
    position: 'absolute', left: '14px', top: '14px', color: '#e9e7ff', fontSize: '11px',
    lineHeight: '1.4', letterSpacing: '.035em', pointerEvents: 'auto',
    background: '#091727eb', border: '1px solid #c5b3f660', borderRadius: '7px', padding: '6px 9px', textAlign: 'left',
  });
  skyLabel.textContent = '港口视角 · JPL 星历';
  skyLabel.type = 'button';
  skyLabel.addEventListener('click', () => onSelect?.('moon'));
  const skyStatus = html('div', local, 'harbor-sky-status', {
    position: 'absolute', right: '14px', top: '14px', textAlign: 'right', fontSize: '10px', color: '#e1ebff',
    lineHeight: '1.5', fontVariantNumeric: 'tabular-nums', background: '#0a1829db',
    padding: '5px 8px', borderRadius: '6px', border: '1px solid #9fb6ce40',
  });
  const skySvg = svg('svg', shot, {role: 'img', 'aria-label': '月球地平方位与高度'});
  Object.assign(skySvg.style, {display: 'block', position: 'absolute', inset: '0', width: '100%', height: '100%', overflow: 'hidden'});
  const defs = svg('defs', skySvg, {});
  const clipAbove = svg('clipPath', defs, {id: uid + '-above'});
  const aboveRect = svg('rect', clipAbove, {});
  const moonClip = svg('clipPath', defs, {id: uid + '-moon'});
  svg('circle', moonClip, {r: 20, cx: 0, cy: 0});
  const halo = svg('radialGradient', defs, {id: uid + '-halo'});
  svg('stop', halo, {offset: '25%', 'stop-color': '#e6e8ff', 'stop-opacity': '.38'});
  svg('stop', halo, {offset: '100%', 'stop-color': '#c0d8ff', 'stop-opacity': '0'});
  const stars = svg('g', skySvg, {'aria-hidden': 'true'});
  const horizonGuide = svg('line', skySvg, {x1: 0, 'stroke-width': '1', stroke: '#c7dcec', 'stroke-opacity': '.47'});
  const horizonLabel = svg('text', skySvg, {fill: '#deedf8', 'font-size': '10', stroke: '#1f3446', 'stroke-width': '3', 'paint-order': 'stroke'});
  horizonLabel.textContent = '0° 地平线';
  const skyClip = svg('g', skySvg, {'clip-path': 'url(#' + uid + '-above)'});
  const observedAbove = svg('path', skyClip, {fill: 'none', stroke: colors.moon, 'stroke-width': '1.2', 'stroke-dasharray': '2 5', 'stroke-opacity': '.5'});
  const beforeMoon = svg('circle', skySvg, {r: '9', fill: 'none', stroke: '#d6c5ff', 'stroke-width': '1.5', 'stroke-dasharray': '3 2', visibility:'hidden'});
  const moonFall = svg('path', skySvg, {fill:'none', stroke:'#d6c5ff', 'stroke-width':'1.4', 'stroke-linecap':'round'});
  const moonAbove = svg('g', skyClip, {class:'tide-moon-disc'});
  svg('circle', moonAbove, {r: 57, fill: 'url(#' + uid + '-halo)'});
  svg('circle', moonAbove, {r: 20, fill: '#e9ecf8'});
  svg('image', moonAbove, {href: 'assets/moon-color.jpg', x: -37, y: -20, width: 74, height: 40, opacity: '.79', 'clip-path': 'url(#' + uid + '-moon)'});
  svg('circle', moonAbove, {r: 20, fill: '#bdd0f1', 'fill-opacity': '.17', stroke: '#eaf3ff', 'stroke-width': '.7'});
  const altitudeLine = svg('path', skySvg, {fill: 'none', stroke: '#d0e5ff', 'stroke-width': '.85', 'stroke-dasharray': '2 4', 'stroke-opacity': '.65'});
  const moonBelow = svg('g', skySvg, {class:'tide-moon-below-marker'});
  svg('circle', moonBelow, {r: 8, fill: '#142438', stroke: colors.moon, 'stroke-width': '1.3', 'stroke-dasharray': '2 2'});
  svg('circle', moonBelow, {r: 2, fill: colors.moon});
  const crossingLabel = svg('text', skySvg, {fill: '#ece6ff', 'font-size': '11', stroke: '#102337', 'stroke-width': '3.5', 'paint-order': 'stroke'});
  const waterPin = svg('circle', skySvg, {r: '4', fill: '#cdfdf4', stroke: '#1e625c', 'stroke-width': '1.2'});
  const waterLabel = html('button', local, 'harbor-waterfront-label', {
    position: 'absolute', left: '14px', bottom: '18px', padding: '8px 10px', borderRadius: '7px',
    background: '#071b27ed', border: '1px solid #66d9cb70', textAlign: 'left', color: '#ddf3f4',
    lineHeight: '1.45', fontSize: '10px', pointerEvents: 'auto', fontVariantNumeric: 'tabular-nums',
  });
  waterLabel.type = 'button';
  waterLabel.addEventListener('click', () => onSelect?.('observed'));
  const waterHeading = html('span', waterLabel, '', {display: 'block', color: '#d5e8ee'});
  waterHeading.textContent = '岸边水位示意 · NOAA 实测';
  const waterValue = html('strong', waterLabel, '', {display: 'inline-block', fontSize: '19px', color: colors.observed, marginRight: '7px'});
  const waterTrend = html('span', waterLabel, '', {color: '#defaf6'});
  const waterScale = html('small', waterLabel, '', {display: 'block', fontSize: '10px', color: '#bdd5dc'});
  waterScale.textContent = '垂直变化放大 · 基准 MLLW';
  const zoomControls = html('div', local, 'harbor-zoom-controls', {
    display: 'flex', gap: '5px', position: 'absolute', right: '12px', bottom: '49px',
  });
  zoomControls.setAttribute('role', 'group');
  zoomControls.setAttribute('aria-label', '港口画面缩放');
  const makeZoomButton = (label, text, multiplier) => {
    const button = html('button', zoomControls, 'harbor-zoom', {
      position: 'static', transform: 'none', flexShrink: '0',
      width: '29px', height: '30px', padding: '0', border: '1px solid #9fb6ce65',
      borderRadius: '6px', background: '#091a28ec', color: '#e4f2ff', fontSize: '16px', pointerEvents: 'auto',
    });
    button.type = 'button';
    button.textContent = text;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.addEventListener('click', () => onZoom?.(multiplier));
    return button;
  };
  const zoomOut = makeZoomButton('缩小港口画面', '−', 1 / 1.15);
  const zoomIn = makeZoomButton('放大港口画面', '+', 1.15);
  zoomControls.hidden = !onZoom;
  zoomOut.disabled = true;

  const mapCredit = html('a', overlay, 'harbor-map-credit', {
    position: 'absolute', bottom: '55px', left: '10px', padding: '4px 6px', borderRadius: '4px',
    background: '#071924e3', color: '#d1e0ec', fontSize: '9px', pointerEvents: 'auto',
  });
  mapCredit.rel = 'noopener';
  mapCredit.target = '_blank';
  let frame = null, data = null, snapshot = null, view = 'global', enabled = false, annotations = true;
  let status = 'unavailable', texture = null, globalMoon = null, load = Promise.resolve(false), generation = 0;
  let width = 0, height = 0, skyCutoff = 0, detailShown = false;
  let crossings = [], measuredByTime = new Map(), peakTimeUtc = null, moonSetBefore = null;
  let narrationFocus = null, arrivalBlend = 1;
  let reflectedMoonX = null;
  let localZoom = 1;

  function setLocalZoom(value) {
    localZoom = Math.max(1, Math.min(1.55, value));
    shot.style.transform = localZoom === 1 ? '' : 'scale(' + localZoom + ')';
    // Keep the fixed horizon caption inside the cropped frame.
    if (width) horizonLabel.setAttribute('x', (15 + .53 * width * (localZoom - 1)) / localZoom);
    zoomOut.disabled = localZoom <= 1;
    zoomIn.disabled = localZoom >= 1.55;
    overlay.dataset.localZoom = String(localZoom);
  }

  function updateVisible() {
    group.visible = enabled && Boolean(data);
    overlay.hidden = !group.visible;
    if (!group.visible) { detailShown = false; station.hidden = true; moonTag.hidden = true; moonHalo.hidden = true; }
  }

  function clear() {
    ++generation;
    disposeGroup(overview);
    disposeGroup(detail);
    texture?.dispose();
    texture = null;
    globalMoon = null;
    snapshot = null;
    width = height = 0;
    setLocalZoom(1);
    status = 'unavailable';
    load = Promise.resolve(false);
    overlay.hidden = true;
    station.hidden = true;
    moonTag.hidden = true;
    moonHalo.hidden = true;
    crossings = [];
    measuredByTime.clear();
    peakTimeUtc = null;
    moonSetBefore = null;
    reflectedMoonX = null;
    narrationFocus = null;
    delete overlay.dataset.narrationFocus;
    delete overlay.dataset.skyFraming;
    delete overlay.dataset.tideDelta;
    stationLine.setAttribute('d', '');
    delete overlay.dataset.observedTime;
    delete overlay.dataset.moonHorizon;
    delete overlay.dataset.observedLevel;
    delete overlay.dataset.predictedLevel;
    delete overlay.dataset.waterfrontLevel;
    delete overlay.dataset.waterlineY;
  }

  function setData(next) {
    clear();
    data = next;
    const location = data?.station ?? data?.focus;
    frame = location ? layerFrame(radius, location) : null;
    if (!frame) { updateVisible(); return; }
    site.position.copy(frame.target);
    site.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(frame.east, frame.north, frame.up));
    const globalRing = ring(radius * .009, radius * .012, colors.observed, .88);
    globalRing.position.z = radius * .003;
    overview.add(globalRing);
    globalMoon = new THREE.Mesh(new THREE.SphereGeometry(radius * overviewMoonSizeScale, 36, 24),
      new THREE.MeshBasicMaterial({color: '#dce6ff', map: moonTexture?.() ?? null, toneMapped: false}));
    globalMoon.name = 'scaled-lunar-direction';
    globalMoon.visible = false;
    overview.add(lunarDirectionGuide(radius, data, frame), globalMoon);
    const innerRing = ring(frame.units * 44, frame.units * 67, colors.observed, .92);
    innerRing.position.z = frame.units * 12;
    detail.add(innerRing);
    const outRing = ring(frame.units * 116, frame.units * 127, colors.observed, .50);
    outRing.position.z = frame.units * 10;
    detail.add(outRing);
    const measuredSamples = data.series?.find(series => series.id === 'observed')?.samples ?? [];
    measuredByTime = new Map(measuredSamples.map(sample => [Date.parse(sample.timeUtc), sample.value]));
    moonSetBefore = data.moon?.find(sample => sample.timeUtc === data.moments?.moonSetBracket?.fromUtc) ?? null;
    let peakLevel = -Infinity;
    for (const sample of measuredSamples) {
      if (!Number.isFinite(sample.value) || sample.value <= peakLevel) continue;
      peakLevel = sample.value;
      peakTimeUtc = sample.timeUtc;
    }
    for (let i = 1; i < (data.moon?.length ?? 0); i++) {
      const previous = data.moon[i - 1], current = data.moon[i];
      if (!validMoon(previous) || !validMoon(current) || Date.parse(current.timeUtc) - Date.parse(previous.timeUtc) !== 360000) continue;
      if ((previous.elevationDeg >= 0) !== (current.elevationDeg >= 0)) crossings.push(current);
    }
    const map = data.geography?.imagery ?? imagery;
    mapCredit.hidden = !map;
    if (map?.url && map.bbox?.length === 4) {
      const plate = ground(map, frame);
      detail.add(plate);
      status = 'loading';
      const token = generation;
      mapCredit.textContent = 'USGS 国家地图影像';
      mapCredit.title = map.name ?? 'USGS The National Map';
      mapCredit.href = map.sourceUrl;
      load = Promise.resolve().then(() => loadTexture(map.url)).then(image => {
        if (token !== generation) { image.dispose(); return false; }
        texture = image;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        plate.material.map = texture;
        plate.material.color.set('#adb9c5');
        plate.material.needsUpdate = true;
        status = 'ready';
        return true;
      }).catch(() => {
        if (token === generation) { status = 'unavailable'; plate.visible = false; mapCredit.hidden = true; }
        return false;
      });
    }
    setView(view);
    updateVisible();
  }

  function focusedCrossing() {
    if (narrationFocus === 'rise') return crossings.find(sample => sample.elevationDeg >= 0);
    if (narrationFocus === 'set') return crossings.find(sample => sample.elevationDeg < 0);
    return null;
  }

  function placeSky(w, h) {
    width = w;
    height = h;
    skyCutoff = Math.round(h * .53);
    sky.style.height = (skyCutoff + 1) + 'px';
    waterfront.style.top = skyCutoff + 'px';
    waterfront.style.height = (h - skyCutoff) + 'px';
    if (waterCtx) {
      const dpr = Math.min(doc.defaultView?.devicePixelRatio || 1, 2);
      waterfront.width = Math.round(w * dpr);
      waterfront.height = Math.round((h - skyCutoff) * dpr);
      waterCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    skyLabel.style.maxWidth = w < 460 ? '46%' : 'none';
    skyStatus.style.maxWidth = w < 460 ? '44%' : 'none';
    waterLabel.style.bottom = (w < 430 ? 60 : 48) + 'px';
    skySvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    for (const [key, value] of Object.entries({x: 0, y: 0, width: w, height: skyCutoff})) aboveRect.setAttribute(key, value);
    horizonGuide.setAttribute('x2', w);
    horizonGuide.setAttribute('y1', skyCutoff);
    horizonGuide.setAttribute('y2', skyCutoff);
    horizonLabel.setAttribute('x', (15 + .53 * w * (localZoom - 1)) / localZoom);
    horizonLabel.setAttribute('y', skyCutoff - 7);
    stars.replaceChildren();
    for (let i = 1; i <= 46; i++) {
      const unit = (i, a, b) => ((i * a + b) % 233) / 233;
      svg('circle', stars, {cx: unit(i, 89, 13) * w, cy: (unit(i, 97, 3) * .84 + .04) * skyCutoff,
        r: .5 + unit(i, 43, 31) * .58, fill: '#c4d9ff', opacity: .16 + unit(i, 59, 17) * .46});
    }
    if (snapshot) {
      updateSky();
      updateTide(snapshot);
    }
  }

  function isMoonSetComparison(timeUtc) {
    return Boolean(moonSetBefore && peakTimeUtc && timeUtc >= moonSetBefore.timeUtc && timeUtc <= peakTimeUtc);
  }

  function updateSky() {
    if (!width || !height || !snapshot) return;
    const moon = snapshot.moon, valid = validMoon(moon);
    const above = valid && moon.elevationDeg >= 0;
    const comparing = isMoonSetComparison(snapshot.timeUtc);
    const crossing = focusedCrossing();
    const close = Boolean(crossing && valid &&
      Math.abs(((moon.azimuthDeg - crossing.azimuthDeg + 540) % 360) - 180) <= 40 &&
      Math.abs(moon.elevationDeg) <= 30);
    overlay.dataset.skyFraming = close ? 'horizon' : 'panorama';
    reflectedMoonX = null;
    overlay.dataset.moonHorizon = valid ? above ? 'above' : 'below' : 'unknown';
    skyLabel.textContent = close ? (narrationFocus === 'rise' ? '月升' : '月落') + ' · 港口视角示意' : '港口视角示意 · JPL 星历';
    const daylight = moon?.solarFlag === '*';
    const twilight = !daylight && /^(C|N|A)$/.test(moon?.solarFlag ?? '');
    sky.style.background = daylight ? 'linear-gradient(180deg,#203d5c,#40687f 70%,#557582 97%,#375466)' :
      twilight ? 'linear-gradient(180deg,#0c1831,#273c55 66%,#695d71 94%,#375466)' :
        'linear-gradient(180deg,#050d20,#14283f 68%,#375466)';
    stars.setAttribute('opacity', daylight ? '0' : twilight ? '.48' : '.88');
    altitudeLine.setAttribute('d', '');
    observedAbove.setAttribute('d', '');
    crossingLabel.textContent = '';
    beforeMoon.setAttribute('visibility', 'hidden');
    moonFall.setAttribute('d', '');
    moonAbove.style.display = above ? '' : 'none';
    moonBelow.style.display = valid && !above && (comparing || close || moon.elevationDeg >= -12) ? '' : 'none';
    if (!valid) {
      skyStatus.textContent = '本时刻缺少 JPL 星历';
      skyStatus.title = '';
      skySvg.setAttribute('aria-label', '本时刻无 JPL 星历');
      return;
    }
    const degreesToX = width / (close ? 112 : 142);
    const bearing = close ? crossing.azimuthDeg : Math.round(moon.azimuthDeg / 36) * 36;
    const plot = {bearing, mid: width * .51, degreesToX, horizon: skyCutoff, skyHeight: Math.max(38, skyCutoff - 73), close, crossingScale: comparing ? .55 : 4};
    const [x, y] = shorelineMoonPoint(moon, plot);
    if (comparing && annotations && !above && close && validMoon(moonSetBefore)) {
      const [beforeX, beforeY] = shorelineMoonPoint(moonSetBefore, plot);
      beforeMoon.setAttribute('cx', beforeX);
      beforeMoon.setAttribute('cy', beforeY);
      beforeMoon.setAttribute('visibility', 'visible');
      // Keep the direction mark separate from the fixed horizon and from the sampled Moon marker.
      const arrowX = x + 15, tip = y + 11;
      moonFall.setAttribute('d', 'M' + arrowX + ' ' + (beforeY - 15) + 'V' + tip +
        'm-4 -5l4 5 4 -5');
    }
    if (above && !daylight && moon.elevationDeg <= 12) reflectedMoonX = x / width;
    const transform = 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')';
    moonAbove.setAttribute('transform', transform);
    moonBelow.setAttribute('transform', transform);
    if (close) {
      altitudeLine.setAttribute('d', 'M' + x.toFixed(2) + ' ' + y.toFixed(2) + 'V' + skyCutoff);
      const time = Date.parse(snapshot.timeUtc);
      const before = (data.moon ?? []).filter(sample => {
        const elapsed = time - Date.parse(sample.timeUtc);
        return elapsed >= 0 && elapsed <= 30 * 60_000 && validMoon(sample);
      });
      let path = '', previousTime = null;
      for (const sample of before) {
        const currentTime = Date.parse(sample.timeUtc);
        const point = shorelineMoonPoint(sample, plot);
        path += (currentTime - previousTime === 360000 ? 'L' : 'M') + point.map(coord => coord.toFixed(2)).join(',');
        previousTime = currentTime;
      }
      observedAbove.setAttribute('d', path);
      const [eventX] = shorelineMoonPoint(crossing, plot);
      crossingLabel.setAttribute('x', Math.min(width - 112, Math.max(100, eventX + 21)));
      crossingLabel.setAttribute('y', skyCutoff + 19);
      crossingLabel.textContent = (narrationFocus === 'rise' ? '月升方向 ' : '月落方向 ') + digits.format(crossing.azimuthDeg) + '°';
    }
    const elevation = (Math.abs(moon.elevationDeg) < 1 ? smallAngle : digits).format(moon.elevationDeg);
    const horizonStatus = crossings.some(sample => sample.timeUtc === snapshot.timeUtc) ?
      (above ? '月心已升出地平线' : '月心已落到地平线下') : above ? '月球在地平线上方' : '月球在地平线下方';
    skyStatus.textContent = horizonStatus + ' · ' + elevation + '°';
    skyStatus.style.color = above ? '#f0e9ff' : '#d8e7f7';
    skyStatus.title = '方位 ' + digits.format(moon.azimuthDeg) + '°；月球图像与仰角变化按画面放大';
    skySvg.setAttribute('aria-label', 'JPL 星历：方位 ' + digits.format(moon.azimuthDeg) + ' 度，高度 ' + elevation + ' 度。' + horizonStatus + '。月球和近地平线仰角变化按画面放大。');
  }

  function tideValue(id, next) {
    const value = next[id] ?? next.metrics?.find(metric => metric.id === id)?.sample;
    if (Number.isFinite(value)) return value;
    return Number.isFinite(value?.value) ? value.value : null;
  }

  function updateTide(next) {
    const level = tideValue('observed', next);
    const predicted = tideValue('predicted', next);
    const reference = isMoonSetComparison(next.timeUtc) && annotations
      ? measuredByTime.get(Date.parse(moonSetBefore.timeUtc)) : null;
    overlay.dataset.observedLevel = level == null ? '' : String(level);
    overlay.dataset.predictedLevel = predicted == null ? '' : String(predicted);
    overlay.dataset.waterfrontLevel = overlay.dataset.observedLevel;
    delete overlay.dataset.waterlineY;
    delete overlay.dataset.tideDelta;
    if (narrationFocus === 'peak' && level != null && predicted != null) {
      overlay.dataset.tideDelta = String(Math.round((level - predicted) * 1000) / 1000);
    }
    const peak = level != null && next.timeUtc === peakTimeUtc;
    waterHeading.textContent = peak ? '当日实测最高 · 岸边水位示意' : '岸边水位示意 · NOAA 实测';
    const previousLevel = measuredByTime.get(Date.parse(next.timeUtc) - 360000);
    const delta = level != null && Number.isFinite(previousLevel) ? level - previousLevel : null;
    waterValue.textContent = level == null ? '实测缺测' : metres.format(level) + ' m';
    waterTrend.textContent = delta == null ? '' : Math.abs(delta) < .0005 ? '持平' : delta > 0 ? '↑ 上涨' : '↓ 回落';
    waterTrend.title = delta == null ? '' : '相比前 6 分钟实测 ' + (delta >= 0 ? '+' : '−') + metres.format(Math.abs(delta)) + ' m';
    const riseCm = Number.isFinite(reference) && level != null ? (level - reference) * 100 : null;
    if (riseCm == null) waterScale.textContent = '垂直变化放大 · 基准 MLLW';
    else {
      const difference = Math.abs(riseCm) < .05 ? '当前为参考水线' :
        (riseCm > 0 ? '比参考上涨 ' : '比参考回落 ') + digits.format(Math.abs(riseCm)) + ' cm';
      waterScale.textContent = moonSetBefore.timeUtc.slice(11, 16) + ' 虚线 · ' + difference;
    }
    waterPin.style.display = 'none';
    if (!waterCtx || !width || !height || !detailShown) return;
    const utc = new Date(next.timeUtc);
    const point = drawHarborWaterfront(waterCtx, {
      x: 0, y: 0, width, height: height - skyCutoff, level, referenceLevel: reference,
      timeMinutes: utc.getUTCHours() * 60 + utc.getUTCMinutes(), focus: narrationFocus, reflectedMoonX,
    });
    if (point) {
      const markerY = point.y + skyCutoff;
      overlay.dataset.waterlineY = markerY.toFixed(1);
      waterPin.style.display = annotations ? '' : 'none';
      waterPin.setAttribute('cx', point.x);
      waterPin.setAttribute('cy', markerY);
    }
  }

  let teachingDistance = 1;
  function updateOverviewMoon() {
    if (!globalMoon || !snapshot) return;
    globalMoon.visible = validMoon(snapshot.moon) && Number.isFinite(snapshot.moon.rangeKm) && snapshot.moon.rangeKm > 0;
    if (globalMoon.visible) {
      globalMoon.position.copy(scaledMoonPosition(radius, snapshot.moon)).multiplyScalar(teachingDistance);
      globalMoon.position.z -= frame.target.length();
    }
  }

  function setSnapshot(next) {
    if (!globalMoon || !Number.isFinite(Date.parse(next?.timeUtc))) return false;
    snapshot = next;
    overlay.dataset.observedTime = next.timeUtc;
    updateOverviewMoon();
    updateSky();
    updateTide(next);
    return true;
  }

  function setNarrationFocus(next) {
    const focus = ['rise', 'set', 'peak'].includes(next) ? next : null;
    if (focus === narrationFocus) return;
    narrationFocus = focus;
    if (focus) overlay.dataset.narrationFocus = focus;
    else delete overlay.dataset.narrationFocus;
    updateSky();
    if (snapshot) updateTide(snapshot);
  }

  function setArrivalBlend(progress) {
    arrivalBlend = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 1;
    local.style.opacity = String(arrivalBlend);
    local.inert = arrivalBlend < .65;
    overlay.dataset.arrivalBlend = arrivalBlend.toFixed(3);
  }

  function setView(next) {
    view = next === 'detail' ? 'detail' : 'global';
    overview.visible = view === 'global';
    detail.visible = view === 'detail';
    local.hidden = true;
    station.hidden = true;
    moonTag.hidden = true;
    moonHalo.hidden = true;
    stationLine.setAttribute('d', '');
    detailShown = false;
  }

  function project(camera, earthRoot, w, h) {
    if (!group.visible || !frame || w < 1 || h < 1) return;
    if (view === 'global' && !globalMoon.material.map) {
      const moonMap = moonTexture?.();
      if (moonMap) {
        globalMoon.material.map = moonMap;
        globalMoon.material.needsUpdate = true;
      }
    }
    site.updateWorldMatrix(true, false);
    camera.updateMatrixWorld();
    const cameraWorld = camera.getWorldPosition(new THREE.Vector3());
    const stationWorld = site.getWorldPosition(new THREE.Vector3());
    const towardEye = cameraWorld.clone().sub(stationWorld);
    const normal = frame.up.clone().transformDirection(earthRoot.matrixWorld);
    const front = normal.dot(towardEye) > 0;
    const wasShown = detailShown;
    detailShown = view === 'detail' && front && towardEye.length() < frame.span * 4.6 && arrivalBlend > 0;
    local.hidden = !detailShown;
    if (detailShown && (!wasShown || w !== width || h !== height)) placeSky(w, h);
    mapCredit.hidden = view !== 'detail' || status !== 'ready' || arrivalBlend > .68;
    const anchor = stationWorld.clone().project(camera);
    station.hidden = !annotations || !front || !snapshot || (detailShown && arrivalBlend >= .68) ||
      Math.abs(anchor.x) > 1 || Math.abs(anchor.y) > 1 || Math.abs(anchor.z) > 1;
    if (!station.hidden) {
      const x = (anchor.x + 1) * w / 2;
      const y = (1 - anchor.y) * h / 2;
      const left = Math.max(5, Math.min(w - 169, x > w - 175 ? x - 162 : x));
      const top = Math.max(12, Math.min(h - 16, y));
      station.style.left = left + 'px';
      station.style.top = top + 'px';
      stationLine.setAttribute('d', 'M' + x + ' ' + y + 'L' + (left + 11) + ' ' + top);
    } else stationLine.setAttribute('d', '');
    moonTag.hidden = true;
    moonHalo.hidden = true;
    if (view === 'global' && globalMoon.visible) {
      const world = globalMoon.getWorldPosition(new THREE.Vector3());
      const ray = world.clone().sub(cameraWorld), distance = ray.length();
      ray.divideScalar(distance);
      const origin = earthRoot.getWorldPosition(new THREE.Vector3());
      const relative = cameraWorld.clone().sub(origin), nearest = -relative.dot(ray);
      const blocked = nearest > 0 && nearest < distance && relative.addScaledVector(ray, nearest).lengthSq() < radius * radius;
      const projected = world.project(camera);
      if (!blocked && Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1 && Math.abs(projected.z) < 1) {
        const x = (projected.x + 1) * w / 2, y = (1 - projected.y) * h / 2;
        moonHalo.hidden = false;
        moonHalo.style.left = x + 'px';
        moonHalo.style.top = y + 'px';
        if (annotations) {
          moonTag.hidden = false;
          const left = x + 110 < w ? x + 18 : x - 108;
          moonTag.style.left = Math.max(4, Math.min(w - 105, left)) + 'px';
          moonTag.style.top = Math.max(4, Math.min(h - 28, y - 11)) + 'px';
        }
      }
    }
  }

  return {
    group, setData, setSnapshot, setView, setNarrationFocus, setArrivalBlend, project,
    zoomLocal(multiplier) {
      if (Number.isFinite(multiplier) && multiplier > 0) setLocalZoom(localZoom * multiplier);
    },
    resetLocalZoom() { setLocalZoom(1); },
    setVisible(value) { enabled = Boolean(value); updateVisible(); },
    setTeachingMode(active, moonScale, distanceScale) {
      teachingDistance = active ? distanceScale : 1;
      for (const object of overview.children) {
        if (object === globalMoon) object.scale.setScalar(active ? moonScale : 1);
        else object.visible = !active;
      }
      updateOverviewMoon();
    },
    setAnnotations(value) {
      annotations = Boolean(value);
      if (!annotations) { station.hidden = true; moonTag.hidden = true; stationLine.setAttribute('d', ''); }
      crossingLabel.style.display = annotations ? '' : 'none';
      if (snapshot) { updateSky(); updateTide(snapshot); }
    },
    whenReady: () => load,
    getBasemapStatus: () => status,
    getVisibleAnnotations() {
      if (!group.visible || !snapshot) return [];
      return [...(station.hidden ? [] : ['station']), ...(detailShown && arrivalBlend >= .65 ? ['moon', 'observed'] : moonTag.hidden ? [] : ['moon'])];
    },
    getOverviewMoonPosition(sample = snapshot?.moon ?? data?.moon?.[0]) {
      if (!frame || !validMoon(sample) || !Number.isFinite(sample.rangeKm) || sample.rangeKm <= 0) return null;
      return scaledMoonPosition(radius, sample).multiplyScalar(teachingDistance).applyQuaternion(site.quaternion);
    },
    getFrame() {
      if (!frame) return null;
      const {target, up, east, north, span, halfWidth, halfHeight, distance} = frame;
      return {target: target.clone(), up: up.clone(), east: east.clone(), north: north.clone(), span, halfWidth, halfHeight, distance};
    },
    dispose() { setData(null); overlay.remove(); group.removeFromParent(); },
  };
}
