import * as THREE from './vendor/three.module.js';

// A 3D ruler for station counts. Its dimensions belong to the display, not the ground.
export function createQuakeStationInstrument() {
 const group=new THREE.Group();
 group.name='selected-station-count-ruler';
 group.visible=false;
 const block=(name,w,h,d,color,order)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({
   color,depthTest:false,depthWrite:false,toneMapped:false,
  }));
  mesh.name=name;mesh.renderOrder=order;
  group.add(mesh);
  return mesh;
 };
 const face=block('count-ruler-face',.71,2.25,.07,'#102b40',15);
 face.position.z=-.06;
 for(const y of [-1,-.5,0,.5,1]){
  const line=block('ruler-tick',y===0?.70:.52,.018,.025,y===0?'#ebf4fb':'#507386',16);
  line.position.set(0,y,-.008);
 }
 const positive=block('positive-count-range',.22,1,.17,'#78efdf',17);
 const negative=block('negative-count-range',.22,1,.17,'#b69bff',17);
 const peak=new THREE.Mesh(new THREE.SphereGeometry(.11,16,12),new THREE.MeshBasicMaterial({
  color:'#ffe29f',depthTest:false,depthWrite:false,toneMapped:false,
 }));
 peak.name='signed-peak-count';peak.position.z=.13;peak.renderOrder=18;group.add(peak);
 const worldOrientation=new THREE.Quaternion(),earthOrientation=new THREE.Quaternion(),world=new THREE.Vector3();
 let hasSample=false;
 function segment(mesh,from,to){
  mesh.visible=to>from;
  if(!mesh.visible)return;
  mesh.position.y=(from+to)/2;
  mesh.scale.y=to-from;
 }
 return {
  group,
  setWindow(sample,scale){
   hasSample=Number.isFinite(sample?.value);
   if(!hasSample){group.visible=false;return;}
   const min=(sample.min??sample.value)/scale,max=(sample.max??sample.value)/scale;
   segment(positive,Math.max(0,min),Math.max(0,max));
   segment(negative,Math.min(0,min),Math.min(0,max));
   peak.position.y=sample.value/scale;
  },
  project(anchor,camera,earthRoot,height){
   group.visible=Boolean(anchor)&&hasSample&&height>0;
   if(!group.visible)return;
   group.position.copy(anchor);
   earthRoot.getWorldQuaternion(earthOrientation);
   camera.getWorldQuaternion(worldOrientation);
   group.quaternion.copy(earthOrientation.invert()).multiply(worldOrientation).multiply(tilt);
   earthRoot.localToWorld(world.copy(anchor));
   const viewHeight=2*camera.position.distanceTo(world)*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/camera.zoom;
   group.scale.setScalar(viewHeight*Math.min(.34,136/height)/2.25);
  },
 };
}

const tilt=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-.29);
