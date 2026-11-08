import {latLonToVector} from './globe-effects.js';
import {toward} from './dixie-evidence.js';

const radians = Math.PI / 180;
const ns = 'http://www.w3.org/2000/svg';

function windEnd(station, mph, from) {
 const angular = (5 + mph * .9) / 6371;
 const lat = station.lat * radians, bearing = toward(from) * radians;
 const endLat = Math.asin(Math.sin(lat) * Math.cos(angular) + Math.cos(lat) * Math.sin(angular) * Math.cos(bearing));
 const deltaLon = Math.atan2(Math.sin(bearing) * Math.sin(angular) * Math.cos(lat), Math.cos(angular) - Math.sin(lat) * Math.sin(endLat));
 return [station.lon + deltaLon / radians, endLat / radians];
}

export function createDixieMapSymbols(host, radius) {
 const svg = document.createElementNS(ns, 'svg');
 svg.classList.add('dixie-map-symbols');
 svg.setAttribute('aria-hidden', 'true');
 host.append(svg);
 let symbols = [];

 function element(tag, values = {}) {
  const node = document.createElementNS(ns, tag);
  for (const [key,value] of Object.entries(values)) node.setAttribute(key, value);
  return node;
 }
 function add(start, end, color, label, dashed) {
  const group = element('g', {color, visibility:'hidden'});
  const line = element('path', {class:dashed?'dixie-map-change':'dixie-map-wind'});
  const head = element('path', {class:'dixie-map-head'});
  const origin = element('circle', {r:3.4, class:'dixie-map-point'});
  const text = element('text');
  text.textContent = label;
  group.append(line, head, origin, text);
  svg.append(group);
  const surface = ([lon,lat]) => latLonToVector(lat, lon, radius + .008);
  symbols.push({group, line, head, origin, text, start:surface(start), end:surface(end), dashed});
 }

 return {
  set(readings, sectors) {
   svg.replaceChildren();
   symbols = [];
   for (const sector of sectors) add(sector.start, sector.end, '#ffd29a', `${sector.name} ${sector.areaKm2} km²`, true);
   for (const station of readings) {
    if (!station.sample) continue;
    const [,mph,from] = station.sample, start = [station.lon, station.lat];
    add(start, mph > 0 ? windEnd(station,mph,from) : start, station.color, station.id + (mph ? '' : ' 静风'), false);
   }
  },
  project(camera, earthRoot, width, height) {
   // Wind and change glyphs stay on their geographic anchors during pan and zoom.
   const distant=camera.position.length()>radius+.25;
   svg.style.display=distant?'none':'';
   if(distant)return;
   const surface = point => {
    const world = earthRoot.localToWorld(point.clone()), p = world.clone().project(camera);
    if (world.clone().normalize().dot(camera.position.clone().sub(world).normalize()) <= 0 || Math.abs(p.z) > 1) return null;
    return {x:(p.x*.5+.5)*width, y:(.5-p.y*.5)*height};
   };
   for (const {group,line,head,origin,text,start,end,dashed} of symbols) {
    const a = surface(start), b = surface(end);
    const visible = a && b && b.x >= 0 && b.x <= width && b.y >= 0 && b.y <= height;
    group.setAttribute('visibility', visible ? 'visible' : 'hidden');
    if (!visible) continue;
    const dx=b.x-a.x, dy=b.y-a.y, length=Math.hypot(dx,dy), arrow=Math.min(10,length*.44);
    const ux=length?dx/length:0, uy=length?dy/length:0;
    line.setAttribute('d',length>4?`M${a.x},${a.y} L${b.x},${b.y}`:'');
    head.setAttribute('d',length>4?`M${b.x},${b.y} l${-ux*arrow-uy*arrow*.48},${-uy*arrow+ux*arrow*.48} l${uy*arrow*.96},${-ux*arrow*.96} Z`:'');
    origin.setAttribute('cx',a.x);origin.setAttribute('cy',a.y);
    origin.style.display=dashed?'none':'';
    const labelPoint = dashed ? b : a;
    text.setAttribute('x',Math.max(8,Math.min(width-(dashed?122:92),labelPoint.x+7)));
    text.setAttribute('y',Math.max(17,Math.min(height-18,labelPoint.y-8)));
   }
  },
 };
}
