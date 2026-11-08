import * as THREE from './vendor/three.module.js';
import {compute} from './models.js';
import {getOverviewStates} from './display-state.js';
import {createVolcanoLayer} from './effect-volcano.js';
import {createQuakeLayer} from './effect-quake.js';
import {createTyphoonLayer} from './effect-typhoon.js';

const EARTH_KM=6371, TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const SITES=[
 {id:'volcano',label:'火山 · 喷发过程',lat:-8.34,lon:116.5,color:'#ff9a64',description:'印尼区域的假想喷发场景',scaleNote:'喷发柱为放大示意，无实测高度'},
 {id:'quake',label:'地震 · 波传播',lat:35.5,lon:142,color:'#b9a8ff',description:'日本以东的假想震源',scaleNote:'波环半径放大 8 倍；色带为振幅示意，读数为原模型值'},
 {id:'typhoon',label:'台风 · 风场演变',lat:22,lon:134,color:'#d8edff',description:'西北太平洋的理想风场',scaleNote:'风场、路径与测点距离统一放大 8 倍；局部平面情景，非真实轨迹'},
 {id:'river',label:'河流 · 污染迁移',lat:30.8,lon:117.2,color:'#56e5d0',description:'中国东部的假想 2 km 河段',scaleNote:'河段长度约放大 1000 倍；颜色表示当前相对浓度，不对应真实河道与污染事件'},
];
export function latLonToVector(lat,lon,r=1){
 const a=lat*Math.PI/180,b=lon*Math.PI/180;
 return new THREE.Vector3(r*Math.cos(a)*Math.cos(b),r*Math.sin(a),-r*Math.cos(a)*Math.sin(b));
}
function frame(lat,lon,r){
 const a=lat*Math.PI/180,b=lon*Math.PI/180;
 const east=new THREE.Vector3(-Math.sin(b),0,-Math.cos(b));
 const north=new THREE.Vector3(-Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b));
 const normal=latLonToVector(lat,lon);
 const group=new THREE.Group();group.position.copy(normal).multiplyScalar(r);
 group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(east,north,normal));return group;
}
function surface(x,y,r,height=0){return new THREE.Vector3(x,y,r).normalize().multiplyScalar(r+height).sub(new THREE.Vector3(0,0,r));}
function mat(color,opacity=1){return new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:false,side:THREE.DoubleSide});}
function line(points,color,opacity=1){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));}
export function cycloneGeo(x,y){return {lat:22+(.5-y)*700*8/111.195,lon:134+(x-.5)*700*8/(111.195*Math.cos(22*Math.PI/180))};}
function riverPoint(u,r,height=.005*r){return surface((u-.5)*(2000/1000)*1000/EARTH_KM*r,Math.sin(u*Math.PI*2.3)*.022*r,r,height);}
function createRiverLayer(r){
 const group=new THREE.Group(),n=96,geo=new THREE.BufferGeometry(),pos=new Float32Array(n*18),colors=new Float32Array(n*18);
 const basePoints=Array.from({length:n+1},(_,i)=>riverPoint(i/n,r));
 group.add(line(basePoints,'#8ef7e2',.75));
 let j=0;
 for(let i=0;i<n;i++){
  const a=riverPoint(i/n,r,.006*r),b=riverPoint((i+1)/n,r,.006*r),w=.003*r;
  const vertices=[new THREE.Vector3(a.x,a.y-w,a.z),new THREE.Vector3(a.x,a.y+w,a.z),new THREE.Vector3(b.x,b.y+w,b.z),new THREE.Vector3(a.x,a.y-w,a.z),new THREE.Vector3(b.x,b.y+w,b.z),new THREE.Vector3(b.x,b.y-w,b.z)];
  for(const v of vertices){pos[j++]=v.x;pos[j++]=v.y;pos[j++]=v.z;}
 }
 geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
 const band=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.95,side:THREE.DoubleSide,depthWrite:false}));group.add(band);
 for(const u of [.05,.5]){const marker=new THREE.Mesh(new THREE.SphereGeometry(.008*r,12,8),mat(u===.05?'#ffd081':'#70f4e0'));marker.position.copy(riverPoint(u,r,.014*r));group.add(marker);}
 const low=new THREE.Color('#198d87'),high=new THREE.Color('#ffd36e'),mix=new THREE.Color();
 return {group,update(d){for(let i=0;i<n;i++){
  const x=(i+.5)/n*d.scene.domainLength,s=d.scene;
  const relative=Math.exp(-Math.pow(x-s.center,2)/(2*s.spread*s.spread));
  // Color is normalized concentration; numerical concentration remains in panel.
  mix.copy(low).lerp(high,clamp(relative));
  for(let k=0;k<6;k++){const a=i*18+k*3;colors[a]=mix.r;colors[a+1]=mix.g;colors[a+2]=mix.b;}
 }geo.attributes.color.needsUpdate=true;}};
}

export function createGlobeEffects(radius=2){
 const group=new THREE.Group(),entries=new Map(),positions=new Map();
 const builders={volcano:createVolcanoLayer,quake:createQuakeLayer,typhoon:createTyphoonLayer,river:createRiverLayer};
 for(const site of SITES){
  const anchor=frame(site.lat,site.lon,radius),effect=builders[site.id](radius);
  anchor.add(effect.group);group.add(anchor);entries.set(site.id,{anchor,effect,site});positions.set(site.id,latLonToVector(site.lat,site.lon,radius*1.025));
 }
 // Both the path and the model station use the exact same plane-to-globe map.
 const cycloneDefault=compute('typhoon',.5),track=cycloneDefault.scene.track;
 const trackLine=line(track.map(p=>{const c=cycloneGeo(p.x,p.y);return latLonToVector(c.lat,c.lon,radius*1.012);}), '#a9d5ed',.5);group.add(trackLine);
 const stationGeo=cycloneGeo(cycloneDefault.scene.station.x,cycloneDefault.scene.station.y);
 const station=new THREE.Mesh(new THREE.SphereGeometry(.006*radius,12,8),mat('#ffd18b'));station.position.copy(latLonToVector(stationGeo.lat,stationGeo.lon,radius*1.018));group.add(station);
 function update(id,data,state={}){
  const p=clamp(Number(state.progress)||0),overview=id==='overview',overviewStates=overview?getOverviewStates(p):null;
  for(const [key,e] of entries){
   // Independent loops share only the playback cursor, never a physical clock.
   // No wall-clock value is used: pausing the cursor freezes every process.
   // These are not simultaneous observations on a shared calendar.
   const active=id===key,visible=active||overview;
   e.anchor.visible=visible;if(!visible)continue;
   const t=active?p:overviewStates[key].progress;
   const d=active?data:overviewStates[key].data;
   e.effect.update(d,t);
   if(key==='typhoon'){
    const c=cycloneGeo(d.scene.cx,d.scene.cy),f=frame(c.lat,c.lon,radius);
    e.anchor.position.copy(f.position);e.anchor.quaternion.copy(f.quaternion);
    positions.set('typhoon',latLonToVector(c.lat,c.lon,radius*1.045));
   }
  }
  trackLine.visible=station.visible=id==='typhoon'||id==='overview';
 }
 function getAnnotations(id,d){
  const e=entries.get(id);if(!e||!d)return [];
  const world=(v)=>e.anchor.localToWorld(v.clone());
  if(id==='volcano')return (e.effect.annotations||[]).filter(a=>a.visible!==false).map(a=>({...a,text:a.id==='volcano-crater'?'喷发强度 '+Math.round(d.scene.magmaFlow*100)+'%':'灰柱指数 '+d.scene.plume.toFixed(2),position:world(a.position)}));
  if(id==='quake')return [['P 波',d.scene.frontP,'#63e4ed',-.1],['S 波',d.scene.frontS,'#bca7ff',Math.PI*.65]].filter(a=>a[1]>0).map(([name,km,color,b])=>{const a=km/6371*8;return {text:name+' · '+km.toFixed(1)+' km',color,position:world(new THREE.Vector3(Math.sin(a)*Math.cos(b)*radius,Math.sin(a)*Math.sin(b)*radius,Math.cos(a)*radius-radius+.018))};});
  if(id==='typhoon')return [{text:'金色测点 · '+d.scene.localWind.toFixed(1)+' m/s',color:'#ffd18b',position:station.position.clone()}];
  return [];
 }
 return {group,update,getAnnotations,getSitePosition:id=>(positions.get(id)||new THREE.Vector3()).clone(),stationPosition:station.position.clone()};
}
