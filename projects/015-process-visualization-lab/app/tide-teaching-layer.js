import * as THREE from './vendor/three.module.js';
import {tideTeachingFrame} from './tide-lesson.js';

const north = new THREE.Vector3(0,1,0);
const axisX = new THREE.Vector3(1,0,0);
const polarScale = 1.195, equatorialScale = .982;
export const tideLessonMoonScale = 2;
export const tideLessonDistanceScale = 1.24;

export function createTideTeachingLayer(radius, labelHost, earth) {
 const doc = labelHost.ownerDocument ?? document;
 const group = new THREE.Group();
 group.visible = false;
 const axis = new THREE.Vector3(), equator = new THREE.Vector3(), moon = new THREE.Vector3();
 const anchor = new THREE.Vector3();
 const shell = new THREE.Mesh(new THREE.SphereGeometry(radius,96,64), new THREE.ShaderMaterial({
  transparent:true, depthWrite:false,
  vertexShader:`varying vec3 n;varying vec3 v;varying float pole;
   void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=-p.xyz;pole=abs(normal.x);gl_Position=projectionMatrix*p;}`,
  fragmentShader:`varying vec3 n;varying vec3 v;varying float pole;
   void main(){
    float limb=pow(1.-abs(dot(normalize(n),normalize(v))),2.5);
    float strength=smoothstep(.31,.95,pole);
    gl_FragColor=vec4(mix(vec3(.12,.57,.69),vec3(.58,.99,1.),limb),strength*(.14+limb*.58));
   }`,
 }));
 shell.scale.set(polarScale,equatorialScale,equatorialScale);
 group.add(shell);

 const trace = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(
  Array.from({length:128},(_,i)=>{
   const a = i * Math.PI / 64;
   return new THREE.Vector3(Math.cos(a),0,Math.sin(a)).multiplyScalar(radius*1.008);
  })
 ), new THREE.LineBasicMaterial({color:'#80d8d9',transparent:true,opacity:.39,depthWrite:false,toneMapped:false}));
 group.add(trace);
 const axisGuide = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),
  new THREE.LineDashedMaterial({color:'#9be9e9',transparent:true,opacity:.6,dashSize:.055,gapSize:.045,depthWrite:false,toneMapped:false}));
 axisGuide.frustumCulled = false;
 group.add(axisGuide);
 const pin = new THREE.Mesh(new THREE.SphereGeometry(radius*.024,16,10), new THREE.MeshBasicMaterial({color:'#ffd18f',toneMapped:false}));
 group.add(pin);
 const waterPin = new THREE.Mesh(new THREE.SphereGeometry(radius*.016,14,8),
  new THREE.MeshBasicMaterial({color:'#9df9ed',toneMapped:false}));
 const depthLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),
  new THREE.LineBasicMaterial({color:'#9df9ed',toneMapped:false}));
 depthLine.frustumCulled = false;
 const depthPositions = depthLine.geometry.attributes.position;
 group.add(waterPin,depthLine);
 const labels = Object.fromEntries(Object.entries({moon:'月球',near:'向月侧隆起',far:'背月侧隆起',coast:'示意海岸点'}).map(([key,text])=>{
  const element = doc.createElement('span');
  element.className = 'tide-teaching-label';
  element.dataset.tideLabel = key;
  element.textContent = text;
  element.hidden = true;
  labelHost.append(element);
  return [key,element];
 }));
 const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
 let phase = null, progress = 0, desired = 0, last = 0, start = 0;

 function set(next, fraction, lunarPosition, {instant=false}={}) {
  if (!next || !lunarPosition) {
   if (!phase) return;
   phase = null;
   group.visible = false;
   earth.rotation.y = 0;
   start = 0;
   for (const element of Object.values(labels)) element.hidden = true;
   return;
  }
  if (next !== phase) {
   phase = next;
   group.visible = true;
   moon.copy(lunarPosition);
   axis.copy(moon).normalize();
   equator.copy(axis).setY(0).normalize();
   shell.quaternion.setFromUnitVectors(axisX,axis);
   const guidePositions = axisGuide.geometry.attributes.position;
   const near = axis.clone().multiplyScalar(radius*1.21);
   const end = moon.clone().addScaledVector(axis,-radius*.17);
   guidePositions.setXYZ(0,near.x,near.y,near.z);
   guidePositions.setXYZ(1,end.x,end.y,end.z);
   guidePositions.needsUpdate = true;
   axisGuide.computeLineDistances();
   progress = fraction;
   last = 0;
  }
  desired = fraction;
  if (instant) progress = desired;
 }

 function project(key, point, camera, width, height, visible=true) {
  const label = labels[key];
  const p = point.clone().project(camera);
  const x = (p.x*.5+.5)*width, y = (-p.y*.5+.5)*height;
  label.hidden = !visible || p.z > 1 || x < 8 || x > width-8 || y < 8 || y > height-8;
  if (!label.hidden) {
   label.style.left = `${Math.min(width-46,Math.max(46,x))}px`;
   label.style.top = `${Math.min(height-24,Math.max(24,y))}px`;
  }
 }

 function render(camera, width, height, now) {
  const dt = last ? Math.min(.06,(now-last)/1000) : .016;
  last = now;
  progress = reducedMotion?.matches ? desired : THREE.MathUtils.damp(progress,desired,21,dt);
  if (Math.abs(desired-progress) < .00015) progress = desired;
  const frame = tideTeachingFrame(phase,progress);
  earth.rotation.y = frame.turn;
  if (!start) start = equator.clone().applyAxisAngle(north,Math.PI/2).dot(camera.position) >= 0 ? Math.PI/2 : -Math.PI/2;
  anchor.copy(equator).applyAxisAngle(north,start+frame.turn).multiplyScalar(radius*1.014);
  pin.position.copy(anchor);
  const alongAxis = anchor.dot(axis) / (radius*1.014);
  const polarWeight = alongAxis * alongAxis;
  const seaRadius = radius / Math.sqrt(polarWeight / polarScale**2 + (1-polarWeight) / equatorialScale**2);
  waterPin.visible = depthLine.visible = seaRadius > radius*1.04;
  if (waterPin.visible) {
   waterPin.position.copy(anchor).setLength(seaRadius);
   depthPositions.setXYZ(0,anchor.x,anchor.y,anchor.z);
   depthPositions.setXYZ(1,waterPin.position.x,waterPin.position.y,waterPin.position.z);
   depthPositions.needsUpdate = true;
  }
  const moonRay = moon.clone().sub(camera.position);
  const nearest = THREE.MathUtils.clamp(-camera.position.dot(moonRay) / moonRay.lengthSq(),0,1);
  const moonVisible = camera.position.clone().addScaledVector(moonRay,nearest).lengthSq() > radius*radius;
  project('moon',moon,camera,width,height,moonVisible);
  project('near',axis.clone().multiplyScalar(radius*1.20),camera,width,height);
  project('far',axis.clone().multiplyScalar(-radius*1.20),camera,width,height);
  const behind = anchor.dot(camera.position) <= radius*radius;
  if ((labels.coast.dataset.behind === 'true') !== behind) {
   labels.coast.dataset.behind = String(behind);
   labels.coast.textContent = behind ? '示意海岸点 · 背面' : '示意海岸点';
  }
  project('coast',anchor,camera,width,height);
  return {progress,frame:{...frame,highSide:alongAxis>=0?'向月侧':'背月侧'}};
 }

 return {group,set,render,active:()=>Boolean(phase)};
}

