import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';

const R=2;
const DEG=Math.PI/180;
const HONG_KONG={lat:22.3019,lon:114.1742};
const BASE_URL=new URL('./assets/earth-blue-marble.png',import.meta.url).href;
const geo=(lat,lon,r=R)=>new THREE.Vector3(r*Math.cos(lat*DEG)*Math.cos(lon*DEG),r*Math.sin(lat*DEG),-r*Math.cos(lat*DEG)*Math.sin(lon*DEG));
const bound=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));

function atmosphereMaterial(){
 return new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending,
  uniforms:{tint:{value:new THREE.Color('#4298db')}},
  vertexShader:'varying vec3 n;varying vec3 p;void main(){vec4 w=modelMatrix*vec4(position,1.);p=w.xyz;n=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform vec3 tint;varying vec3 n;varying vec3 p;void main(){float edge=pow(1.-abs(dot(normalize(n),normalize(cameraPosition-p))),5.);gl_FragColor=vec4(tint,edge*.32);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'
 });
}

function makeLine(color,opacity){
 return new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false,toneMapped:false}));
}

function loadTexture(url,maxAnisotropy){
 return new Promise((resolve,reject)=>new THREE.TextureLoader().load(url,t=>{
  t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,maxAnisotropy);resolve(t);
 },undefined,reject));
}

/**
 * A geographic renderer for archived records, with no process simulation.
 * The globe is a geographic background; line segments merely join known
 * positions. Current markers only ever occupy a supplied record coordinate.
 * Optional satellite images must already be global EPSG:4326 2:1 textures.
 */
export async function createEventEarth(canvas,{onSelectRecord}={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,2));
 renderer.setClearColor('#040c16',0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(38,1,.025,100);
 const controls=new OrbitControls(camera,canvas);
 controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;
 controls.minDistance=2.35;controls.maxDistance=16;controls.rotateSpeed=.48;controls.zoomSpeed=.65;
 controls.minPolarAngle=.08;controls.maxPolarAngle=Math.PI-.08;
 const sun=new THREE.DirectionalLight('#fff7e9',2.7),fill=new THREE.DirectionalLight('#a6c7e6',.44);
 scene.add(sun,fill,new THREE.AmbientLight('#bdd1e3',.4));
 const baseMaterial=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.93,metalness:0});
 // This grade is limited to the historical geographic basemap. Satellite
 // observation textures below bypass both grading and decorative lighting.
 baseMaterial.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat sea=smoothstep(.001,.018,diffuseColor.b-diffuseColor.r)*(1.-smoothstep(.035,.12,diffuseColor.g));\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.008,.029,.064),sea*.80);');
 };
 const observedMaterial=new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false});
 const earth=new THREE.Mesh(new THREE.SphereGeometry(R,144,96),baseMaterial);scene.add(earth);
 const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(R*1.012,112,72),atmosphereMaterial());scene.add(atmosphere);
 const graticule=new THREE.Group();
 for(let lat=-60;lat<=60;lat+=30){const line=makeLine('#a3c9dd',lat===0?.13:.055),positions=[];for(let lon=-180;lon<=180;lon+=2)positions.push(geo(lat,lon,R*1.0008));line.geometry.setFromPoints(positions);graticule.add(line);}
 for(let lon=-180;lon<180;lon+=30){const line=makeLine('#a3c9dd',.055),positions=[];for(let lat=-89;lat<=89;lat+=2)positions.push(geo(lat,lon,R*1.0008));line.geometry.setFromPoints(positions);graticule.add(line);}
 scene.add(graticule);

 const fullTrack=makeLine('#b4c4d2',.25),pastTrack=makeLine('#7ce1f0',.98);
 fullTrack.renderOrder=2;pastTrack.renderOrder=3;scene.add(fullTrack,pastTrack);
 const pointsMaterial=new THREE.PointsMaterial({size:.035,color:'#ffffff',vertexColors:true,transparent:true,opacity:.94,depthWrite:false,toneMapped:false});
 const recordPoints=new THREE.Points(new THREE.BufferGeometry(),pointsMaterial);recordPoints.renderOrder=4;scene.add(recordPoints);
 const markerGeometry=new THREE.SphereGeometry(.022,24,16);
 const currentPoint=new THREE.Mesh(markerGeometry,new THREE.MeshBasicMaterial({color:'#ffd192',toneMapped:false}));currentPoint.visible=false;currentPoint.renderOrder=6;scene.add(currentPoint);
 const hongKong=new THREE.Mesh(new THREE.SphereGeometry(.017,20,12),new THREE.MeshBasicMaterial({color:'#d8a3ff',toneMapped:false}));
 hongKong.position.copy(geo(HONG_KONG.lat,HONG_KONG.lon,R+.016));hongKong.renderOrder=5;scene.add(hongKong);

 let records=[],recordVectors=[],recordOffsets=[],selectedIndex=-1,mode='global',width=1,height=1,disposed=false;
 let eventDirection=geo(18,137,1),desiredPosition=null,manualCamera=false,hasEvent=false;
 let observationTexture=null,observationUrl=null,textureRequest=0;
 const raycaster=new THREE.Raycaster();raycaster.params.Points.threshold=.052;
 const pointer=new THREE.Vector2();let pointerDown=null;
 const nearColor=new THREE.Color('#8ae3eb'),futureColor=new THREE.Color('#8c9eaf'),selectedColor=new THREE.Color('#ffd192');

 function fitCamera(immediate=false){
  const halfV=THREE.MathUtils.degToRad(camera.fov/2),halfH=Math.atan(Math.tan(halfV)*Math.max(.15,width/height));
  let direction=eventDirection.clone(),distance=R/Math.sin(Math.min(halfV,halfH))*1.09;
  if(mode==='regional'&&selectedIndex>=0){
   const selected=recordVectors[selectedIndex].clone().normalize(),hk=hongKong.position.clone().normalize();
   const separation=Math.acos(bound(selected.dot(hk),-1,1));
   // Include Hong Kong as context when it is genuinely nearby. For an earlier
   // Pacific record, stay with that record rather than inventing a local path.
   direction=separation<25*DEG?selected.multiplyScalar(.7).addScaledVector(hk,.3).normalize():selected;
   distance=3.55*Math.max(1,.82/Math.max(.25,width/height));
  }
  desiredPosition=direction.multiplyScalar(distance);manualCamera=false;
  if(immediate){camera.position.copy(desiredPosition);desiredPosition=null;camera.lookAt(0,0,0);controls.target.set(0,0,0);controls.update();}
 }

 function setEvent(input){
  if(disposed)throw new Error('Earth renderer has been disposed.');
  if(!Array.isArray(input)||input.length===0)throw new TypeError('An event needs at least one archived position.');
  let lastTime=-Infinity;
  records=input.map((record,index)=>{
   const lat=Number(record.lat),lon=Number(record.lon),time=record.timeUtc??record.time,stamp=Date.parse(time);
   if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||!Number.isFinite(stamp))throw new TypeError(`Invalid event record ${index}.`);
   if(stamp<lastTime)throw new TypeError('Event records must preserve ascending archive time.');
   lastTime=stamp;return {...record,time,timeUtc:time,lat,lon};
  });
  recordVectors=records.map(r=>geo(r.lat,r.lon,R+.012));
  eventDirection=recordVectors.reduce((sum,p)=>sum.add(p.clone().normalize()),new THREE.Vector3()).normalize();
  if(eventDirection.lengthSq()<.1)eventDirection.copy(recordVectors[0]).normalize();
  const pathPoints=[recordVectors[0].clone()];recordOffsets=[0];
  for(let i=1;i<recordVectors.length;i++){
   const a=recordVectors[i-1].clone().normalize(),b=recordVectors[i].clone().normalize();
   const angle=Math.acos(bound(a.dot(b),-1,1)),steps=Math.max(1,Math.ceil(angle/(.7*DEG)));
   // Spherical connectors render an archived trajectory without adding data
   // records. Neither wind nor pressure is interpolated by this renderer.
   for(let j=1;j<=steps;j++){
    const t=j/steps;
    const p=angle<1e-7?a.clone():a.clone().multiplyScalar(Math.sin((1-t)*angle)).addScaledVector(b,Math.sin(t*angle)).divideScalar(Math.sin(angle));
    pathPoints.push(p.normalize().multiplyScalar(R+.012));
   }
   recordOffsets.push(pathPoints.length-1);
  }
  for(const line of [fullTrack,pastTrack]){line.geometry.dispose();line.geometry=new THREE.BufferGeometry().setFromPoints(pathPoints);}
  recordPoints.geometry.dispose();recordPoints.geometry=new THREE.BufferGeometry().setFromPoints(recordVectors);
  recordPoints.geometry.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(records.length*3),3));
  selectedIndex=-1;setIndex(0);fitCamera(!hasEvent);hasEvent=true;
 }

 function setIndex(index){
  if(!records.length)return;
  const next=bound(Math.trunc(Number(index)||0),0,records.length-1);selectedIndex=next;
  currentPoint.position.copy(recordVectors[next]).normalize().multiplyScalar(R+.025);currentPoint.visible=true;
  pastTrack.geometry.setDrawRange(0,recordOffsets[next]+1);
  const colors=recordPoints.geometry.attributes.color;
  for(let i=0;i<records.length;i++){const color=i===next?selectedColor:i<next?nearColor:futureColor;colors.setXYZ(i,color.r,color.g,color.b);}
  colors.needsUpdate=true;
  if(mode==='regional'&&!manualCamera)fitCamera();
 }

 function focus(nextMode){
  if(!['global','regional'].includes(nextMode))throw new RangeError('View must be global or regional.');
  mode=nextMode;fitCamera();
 }

 function resize(w,h){
  width=Math.max(1,Number(w)||1);height=Math.max(1,Number(h)||1);
  renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
  if(!manualCamera)fitCamera();
 }

 function project(lat,lon){
  const point=geo(lat,lon,R+.025),normal=point.clone().normalize();
  const front=normal.dot(camera.position.clone().sub(point).normalize())>.005;
  const p=point.project(camera),x=(p.x*.5+.5)*width,y=(-p.y*.5+.5)*height;
  return {x,y,visible:front&&p.z<1&&x>=0&&x<=width&&y>=0&&y<=height};
 }

 async function setObservationTexture(url){
  if(disposed)return false;
  const request=++textureRequest;
  if(!url){earth.material=baseMaterial;observedMaterial.map=null;observationTexture?.dispose();observationTexture=null;observationUrl=null;return true;}
  if(url===observationUrl&&observationTexture)return true;
  try{
   const texture=await loadTexture(url,renderer.capabilities.getMaxAnisotropy());
   if(disposed||request!==textureRequest){texture.dispose();return false;}
   const image=texture.image;
   if(!image?.width||!image?.height||Math.abs(image.width/image.height-2)>.01){texture.dispose();throw new Error('Observation texture must be a registered global 2:1 image.');}
   const prior=observationTexture;observationTexture=texture;observationUrl=url;
   observedMaterial.map=texture;observedMaterial.needsUpdate=true;earth.material=observedMaterial;prior?.dispose();return true;
  }catch{
   if(request===textureRequest&&!disposed){earth.material=baseMaterial;observedMaterial.map=null;observationTexture?.dispose();observationTexture=null;observationUrl=null;}
   return false;
  }
 }

 function render(){
  if(disposed)return;
  if(desiredPosition){
   const from=camera.position.clone().normalize(),to=desiredPosition.clone().normalize();
   const turn=new THREE.Quaternion().setFromUnitVectors(from,to),step=new THREE.Quaternion().slerp(turn,.085);
   // Keep radial distance before copy() replaces the position with a unit vector.
   const distance=THREE.MathUtils.lerp(camera.position.length(),desiredPosition.length(),.085);
   camera.position.copy(from.applyQuaternion(step)).multiplyScalar(distance);
   if(camera.position.distanceTo(desiredPosition)<.002){camera.position.copy(desiredPosition);desiredPosition=null;}
  }
  controls.update();
  // Geographic basemap illumination is a viewing aid, not event-time sunlight.
  const direction=camera.position.clone().normalize(),right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
  sun.position.copy(direction.clone().multiplyScalar(8).addScaledVector(right,-6).addScaledVector(up,5));
  fill.position.copy(direction.clone().multiplyScalar(5).addScaledVector(right,5));
  scene.updateMatrixWorld();renderer.render(scene,camera);
 }

 const startOrbit=()=>{manualCamera=true;desiredPosition=null;};
 const down=e=>{pointerDown={x:e.clientX,y:e.clientY};};
 const up=e=>{
  if(!pointerDown||Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>5){pointerDown=null;return;}
  pointerDown=null;if(!records.length||typeof onSelectRecord!=='function')return;
  const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObject(recordPoints).find(h=>{
   const p=recordVectors[h.index];return p.clone().normalize().dot(camera.position.clone().sub(p).normalize())>0;
  });
  if(hit){setIndex(hit.index);onSelectRecord(hit.index);}
 };
 controls.addEventListener('start',startOrbit);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);
 function dispose(){
  if(disposed)return;disposed=true;++textureRequest;controls.dispose();
  canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointerup',up);
  const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});
  for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();
  if(!materials.has(baseMaterial))baseMaterial.dispose();if(!materials.has(observedMaterial))observedMaterial.dispose();
  baseMaterial.map?.dispose();observationTexture?.dispose();renderer.dispose();
 }

 camera.position.copy(geo(18,137,7));camera.lookAt(0,0,0);controls.update();
 resize(canvas.clientWidth||800,canvas.clientHeight||600);
 try{baseMaterial.map=await loadTexture(BASE_URL,renderer.capabilities.getMaxAnisotropy());baseMaterial.needsUpdate=true;}catch(error){dispose();throw error;}
 render();
 return {setEvent,setIndex,focus,resize,render,dispose,project,setObservationTexture};
}
