import * as THREE from './vendor/three.module.js';

const DEG=Math.PI/180;
export const ARCHIVE_HONG_KONG={lat:22.3019,lon:114.1742};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const geo=(lat,lon,r)=>new THREE.Vector3(r*Math.cos(lat*DEG)*Math.cos(lon*DEG),r*Math.sin(lat*DEG),-r*Math.cos(lat*DEG)*Math.sin(lon*DEG));
const pathLine=(color,opacity)=>new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false,toneMapped:false}));

/** Archived coordinates only. Connecting arcs are visual connectors, not additional records. */
export function createArchiveGlobeLayer(radius=2){
 const group=new THREE.Group();group.name='archived-event-records';group.visible=false;
 const future=pathLine('#b4c4d2',.32),past=pathLine('#7ce1f0',1);
 future.renderOrder=2;past.renderOrder=3;group.add(future,past);
 const pointMaterial=new THREE.PointsMaterial({size:.025,color:'#ffffff',vertexColors:true,transparent:true,opacity:.95,depthWrite:false,toneMapped:false});
 // Round archive symbols; these are location markers, never wind or impact areas.
 pointMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(length(gl_PointCoord-vec2(.5))>.5)discard;');};
 const points=new THREE.Points(new THREE.BufferGeometry(),pointMaterial);points.renderOrder=4;group.add(points);
 const current=new THREE.Mesh(new THREE.SphereGeometry(.022,24,16),new THREE.MeshBasicMaterial({color:'#ffd192',toneMapped:false}));
 current.renderOrder=6;current.visible=false;group.add(current);
 // Fixed-size hollow location symbol, never a physical radius or impact area.
 const baseline=new THREE.Mesh(new THREE.RingGeometry(.0205,.028,40),new THREE.MeshBasicMaterial({color:'#80e2ee',side:THREE.DoubleSide,depthWrite:false,toneMapped:false}));
 baseline.name='archive-baseline-marker';baseline.renderOrder=7;baseline.visible=false;baseline.userData.kind='location-symbol-not-extent';group.add(baseline);
 const hongKong=new THREE.Mesh(new THREE.SphereGeometry(.017,20,12),new THREE.MeshBasicMaterial({color:'#d8a3ff',toneMapped:false}));
 hongKong.position.copy(geo(ARCHIVE_HONG_KONG.lat,ARCHIVE_HONG_KONG.lon,radius+.016));hongKong.renderOrder=5;group.add(hongKong);
 const beforeColor=new THREE.Color('#8ae3eb'),afterColor=new THREE.Color('#8c9eaf'),currentColor=new THREE.Color('#ffd192');
 const raycaster=new THREE.Raycaster();raycaster.params.Points.threshold=.038;
 let records=[],vectors=[],offsets=[],index=-1,baselineIndex=null;
 let cloudDetail=false;

 function setCloudDetail(enabled){
  if(cloudDetail===enabled)return;
  cloudDetail=enabled;
  current.scale.setScalar(enabled?.14:1);
  baseline.scale.setScalar(enabled?.28:1);
  pointMaterial.size=enabled?.007:.025;
  past.material.opacity=enabled?.38:1;
  future.visible=!enabled;
 }

 function setEvent(input){
  if(!Array.isArray(input)||input.length===0)throw new TypeError('Archive event requires at least one original record.');
  let previous=-Infinity;
  const next=input.map((entry,i)=>{
   const timeUtc=entry.timeUtc??entry.time,stamp=Date.parse(timeUtc),lat=Number(entry.lat),lon=Number(entry.lon);
   if(!Number.isFinite(stamp)||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new TypeError('Invalid archive position at record '+i+'.');
   if(stamp<previous)throw new TypeError('Archive records must be in ascending time order.');
   previous=stamp;return {...entry,timeUtc,lat,lon};
  });
  records=next;vectors=records.map(r=>geo(r.lat,r.lon,radius+.012));
  const path=[vectors[0].clone()];offsets=[0];
  for(let i=1;i<vectors.length;i++){
   const a=vectors[i-1].clone().normalize(),b=vectors[i].clone().normalize(),angle=Math.acos(clamp(a.dot(b),-1,1));
   const steps=Math.max(1,Math.ceil(angle/(.7*DEG))),turn=new THREE.Quaternion().setFromUnitVectors(a,b);
   for(let j=1;j<=steps;j++)path.push(a.clone().applyQuaternion(new THREE.Quaternion().slerp(turn,j/steps)).multiplyScalar(radius+.012));
   offsets.push(path.length-1);
  }
  for(const item of [future,past]){item.geometry.dispose();item.geometry=new THREE.BufferGeometry().setFromPoints(path);}
  points.geometry.dispose();points.geometry=new THREE.BufferGeometry().setFromPoints(vectors);
  points.geometry.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(records.length*3),3));
  index=-1;baselineIndex=null;baseline.visible=false;setIndex(0);
 }

 function setIndex(value){
  if(!records.length)return;
  index=clamp(Math.trunc(Number(value)||0),0,records.length-1);
  current.position.copy(vectors[index]).normalize().multiplyScalar(radius+.025);current.visible=true;
  past.geometry.setDrawRange(0,offsets[index]+1);
  const colors=points.geometry.attributes.color;
  for(let i=0;i<records.length;i++){const c=i===index?currentColor:i<index?beforeColor:afterColor;colors.setXYZ(i,c.r,c.g,c.b);}
  colors.needsUpdate=true;
  updateBaseline();
 }

 function baselineCoincident(){return baselineIndex!==null&&index>=0&&vectors[baselineIndex].distanceToSquared(vectors[index])<1e-14;}
 function updateBaseline(){
  baseline.visible=baselineIndex!==null&&!baselineCoincident();
  if(baselineIndex===null)return;
  const normal=vectors[baselineIndex].clone().normalize();
  baseline.position.copy(normal).multiplyScalar(radius+.025);
  baseline.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
 }
 function setBaseline(value){
  if(value===null||value===undefined||!records.length){baselineIndex=null;baseline.visible=false;return;}
  if(!Number.isFinite(value))throw new TypeError('Baseline must be an original record index or null.');
  baselineIndex=clamp(Math.trunc(value),0,records.length-1);updateBaseline();
 }

 function regionalDirection(){
  if(index<0)return geo(20,128,1);
  const selected=vectors[index].clone().normalize(),hk=hongKong.position.clone().normalize();
  return Math.acos(clamp(selected.dot(hk),-1,1))<25*DEG?selected.multiplyScalar(.7).addScaledVector(hk,.3).normalize():selected;
 }

 function pick(pointer,camera){
  if(!group.visible||!records.length)return null;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObject(points).find(entry=>{
   const p=group.localToWorld(vectors[entry.index].clone());
   return p.clone().normalize().dot(camera.position.clone().sub(p).normalize())>0;
  });
  return hit?hit.index:null;
 }

 function dispose(){
  group.traverse(item=>{item.geometry?.dispose();if(item.material)item.material.dispose();});
  group.removeFromParent();
 }
 return {setReferenceVisible(value){hongKong.visible=Boolean(value);},group,setEvent,setIndex,setBaseline,setCloudDetail,regionalDirection,pick,dispose,getRecord:()=>records[index]??null,getIndex:()=>index,getCount:()=>records.length,getCurrentPosition:()=>index<0?null:current.position.clone(),getHongKongPosition:()=>hongKong.position.clone(),getBaselineIndex:()=>baselineIndex,getBaselineRecord:()=>baselineIndex===null?null:records[baselineIndex],getBaselinePosition:()=>baselineIndex===null?null:baseline.position.clone(),isBaselineCoincident:baselineCoincident};
}
