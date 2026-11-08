import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {latLonToVector} from './globe-effects.js';
import {createHungaLessonOverlay} from './hunga-lesson-overlay.js';
import {hungaChangeColor,hungaChangeLabel,hungaProfile,hungaSample,hungaSpots,hungaSurveys,hungaVerticalScale} from './hunga-terrain-data.js';

const depthRamp=[
 [-1900,'#112e52'],[-1300,'#1c5273'],[-900,'#287b9a'],[-600,'#409fb4'],
 [-300,'#57bdc4'],[-100,'#a1e2c8'],[0,'#cee6ad'],[160,'#d9b787'],
].map(([value,color])=>({value,color:new THREE.Color(color)}));
const vertical=value=>value*hungaVerticalScale/1000;
const ease=value=>value*value*(3-2*value);
const xy=(index,count,step)=>(index+.5-count/2)*step/1000;

function terrainGeometry(data,levels,showChange=false){
 const {cols,rows,stepM,transect}=data.grid;
 const vertices=new Float32Array(cols*rows*3),colors=new Float32Array(vertices.length),indices=[];
 const missingIndices=[];
 const change=showChange?data.levels.change:null;
 const post=data.levels.post;
 let sectionCount=0;
 function appendTriangle(a,b,c){
  if(!Number.isFinite(levels[a])||!Number.isFinite(levels[b])||!Number.isFinite(levels[c]))return;
  if(change){
   // Pre-only patches can show the coverage gap at a known elevation.
   // Keep their edges separate from the post-survey surface.
   const usePost=Number.isFinite(post[a]);
   if(Number.isFinite(post[b])!==usePost||Number.isFinite(post[c])!==usePost)return;
   if(!Number.isFinite(change[a])||!Number.isFinite(change[b])||!Number.isFinite(change[c])){
    missingIndices.push(a,b,c);
    return;
   }
  }
  indices.push(a,b,c);
 }
 for(let row=0;row<rows;row++){
  if(row===transect)sectionCount=indices.length;
  for(let col=0;col<cols;col++){
   const i=row*cols+col,value=levels[i];
   vertices.set([xy(col,cols,stepM),Number.isFinite(value)?vertical(value):0,xy(row,rows,stepM)],i*3);
   if(row===rows-1||col===cols-1)continue;
   const b=i+1,c=i+cols,d=c+1;
   appendTriangle(i,c,b);
   appendTriangle(b,c,d);
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));
 geometry.setIndex(change?indices.concat(missingIndices):indices);
 if(change){
  geometry.addGroup(0,indices.length,0);
  geometry.addGroup(indices.length,missingIndices.length,1);
 }
 geometry.computeVertexNormals();
 const normals=geometry.attributes.normal;
 const light=new THREE.Vector3(-.56,.74,-.37).normalize();
 const tint=new THREE.Color();
 for(let i=0;i<levels.length;i++){
  if(change){
   const [r,g,b]=hungaChangeColor(change[i]);
   tint.setRGB(r/255,g/255,b/255,THREE.SRGBColorSpace);
  }else{
   const z=levels[i];
   const upper=depthRamp.findIndex(stop=>stop.value>z);
   if(upper<=0)tint.copy(depthRamp[upper===0?0:depthRamp.length-1].color);
   else{
    const a=depthRamp[upper-1],b=depthRamp[upper];
    tint.copy(a.color).lerp(b.color,(z-a.value)/(b.value-a.value));
   }
  }
  const incidence=Math.max(0,normals.getX(i)*light.x+normals.getY(i)*light.y+normals.getZ(i)*light.z);
  const shade=change ? .76+.24*incidence : .46+.73*incidence;
  colors.set([tint.r*shade,tint.g*shade,tint.b*shade],i*3);
 }
 geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
 geometry.userData.sectionCount=sectionCount;
 return geometry;
}

function makeChangeSurface(data,material){
 const levels=data.levels.post.map((value,i)=>Number.isFinite(value)?value:data.levels.pre[i]);
 const missing=new THREE.MeshBasicMaterial({color:'#4a5770',toneMapped:false,side:THREE.DoubleSide});
 missing.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec2 surveyGrid;\n'+shader.vertexShader.replace('#include <begin_vertex>',
   '#include <begin_vertex>\nsurveyGrid = position.xz;');
  shader.fragmentShader='varying vec2 surveyGrid;\n'+shader.fragmentShader.replace('#include <color_fragment>',
   '#include <color_fragment>\nfloat hatch = step(0.65, fract((surveyGrid.x + surveyGrid.y) / 0.31));\ndiffuseColor.rgb *= mix(0.7, 1.8, hatch);');
 };
 return new THREE.Mesh(terrainGeometry(data,levels,true),[material,missing]);
}

function makeProfile(data,key){
 const {cols,rows,stepM,transect}=data.grid;
 const profile=hungaProfile(data,key),z=xy(transect,rows,stepM);
 const group=new THREE.Group(),material=new THREE.MeshBasicMaterial({color:hungaSurveys[key].color,toneMapped:false});
 let path=new THREE.CurvePath(),previous=null;
 function finish(){
  if(path.curves.length)group.add(new THREE.Mesh(new THREE.TubeGeometry(path,path.curves.length*2,.037,5,false),material));
  path=new THREE.CurvePath();
 }
 profile.forEach((value,col)=>{
  if(!Number.isFinite(value)){finish();previous=null;return;}
  const point=new THREE.Vector3(xy(col,cols,stepM),vertical(value)+.055,z);
  if(previous)path.add(new THREE.LineCurve3(previous,point));
  previous=point;
 });
 finish();
 return group;
}

function makeSectionFace(data){
 const {cols,rows,stepM,transect}=data.grid;
 const profile=hungaProfile(data,'post'),z=xy(transect,rows,stepM),positions=[],indices=[];
 const floor=vertical(-1700);
 profile.forEach((value,col)=>{
  const x=xy(col,cols,stepM),i=col*2;
  positions.push(x,Number.isFinite(value)?vertical(value):floor,z,x,floor,z);
  if(col&&Number.isFinite(value)&&Number.isFinite(profile[col-1]))indices.push(i-2,i-1,i,i-1,i+1,i);
 });
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);
 return new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:'#173e55',toneMapped:false,side:THREE.DoubleSide}));
}

/** A terrain patch attached to the same Earth as the infrared layer. */
export function createHungaTerrainLayer({radius,earthRoot,camera,canvas,labelHost,globalControls}){
 const group=new THREE.Group();group.name='niwa-hunga-survey';group.visible=false;earthRoot.add(group);
 const label=document.createElement('div');label.className='hunga-surface-label';label.hidden=true;labelHost.appendChild(label);
 const lesson=createHungaLessonOverlay(labelHost,group);
 const marker=new THREE.Mesh(new THREE.SphereGeometry(.12,14,10),new THREE.MeshBasicMaterial({color:'#fff4d3',toneMapped:false}));
 group.add(marker);
 const anchor=new THREE.Vector3(),up=new THREE.Vector3(),earthScale=radius/6371.0088;
 let data=null,surfaces=null,profiles=null,sectionFace=null,localControls=null,saved=null,motion=null,mode=null,spot=null,markerVisible=false;
 let changeSurface=null;
 let arriving=false,angle='oblique';

 function init(terrain){
  data=terrain;
  const [lon,lat]=data.anchor,[eastLon,eastLat]=data.east;
  up.copy(latLonToVector(lat,lon,1)).normalize();
  const east=latLonToVector(eastLat,eastLon,1).addScaledVector(up,-up.dot(latLonToVector(eastLat,eastLon,1))).normalize();
  const south=east.clone().cross(up).normalize();
  group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(east,up,south));
  // Lift the datum just enough to expose the relief above the simplified Earth sphere.
  group.position.copy(up).multiplyScalar(radius+earthScale*6.8);
  group.scale.setScalar(earthScale);
  group.updateWorldMatrix(true,false);
  anchor.copy(group.localToWorld(new THREE.Vector3()));
  const material=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false,side:THREE.DoubleSide});
  surfaces={};
  profiles={};
  for(const key of ['pre','post']){
   surfaces[key]=new THREE.Mesh(terrainGeometry(data,data.levels[key]),material);
   profiles[key]=makeProfile(data,key);
   group.add(surfaces[key],profiles[key]);
  }
  sectionFace=makeSectionFace(data);group.add(sectionFace);
 }

 function pose(){
  const sample=hungaSample(data,spot),{cols,rows,stepM,transect}=data.grid;
  const x=xy(sample.col,cols,stepM),z=xy(transect,rows,stepM);
  const target=new THREE.Vector3(mode==='section'?x*.34:x*.67,mode==='pre'?-.55:-1.65,z);
  const offset=angle==='top'?new THREE.Vector3(0,27,4):angle==='side'?new THREE.Vector3(x,5.5,24):mode==='section'?new THREE.Vector3(x,11,23):spot==='crater'
   ?new THREE.Vector3(mode==='pre'?-6:6,18,16)
   :new THREE.Vector3(spot==='west'?-10:10,11,19);
  offset.multiplyScalar(Math.max(1,1.12/camera.aspect));
  return {target:group.localToWorld(target.clone()),position:group.localToWorld(target.add(offset))};
 }
 function finish(){
  if(!motion)return;
  const {target,position,resolve}=motion;
  motion=null;arriving=false;
  camera.up.copy(up);camera.position.copy(position);
  if(!localControls){
   localControls=new OrbitControls(camera,canvas);
   localControls.enableDamping=true;localControls.dampingFactor=.085;
   localControls.enablePan=false;localControls.minDistance=earthScale*8.5;localControls.maxDistance=earthScale*110;
   localControls.minPolarAngle=.13;localControls.maxPolarAngle=1.38;
   localControls.rotateSpeed=.52;localControls.zoomSpeed=.7;
   localControls.addEventListener('start',()=>{if(motion){motion.resolve(true);motion=null;}});
  }
  localControls.target.copy(target);localControls.enabled=true;localControls.update();resolve(true);
 }
 function move(instant,flight){
  motion?.resolve(false);
  const {target,position}=pose();
  const fromTarget=localControls?.target.clone()??saved.target.clone();
  return new Promise(resolve=>{
   motion={target,position,resolve,fromTarget,from:camera.position.clone(),fromUp:camera.up.clone(),
    start:performance.now(),duration:flight?1450:680,flight};
   if(instant||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)finish();
  });
 }

 function show(terrain,nextMode,nextSpot,{instant=false,angle:nextAngle='oblique',reframe=false}={}){
  if(!data)init(terrain);
  if(!reframe&&mode===nextMode&&spot===nextSpot&&angle===nextAngle&&saved){
   if(!motion)return Promise.resolve(true);
  }
  const flight=!saved;
  if(flight){
   saved={position:camera.position.clone(),target:globalControls.target.clone(),up:camera.up.clone(),near:camera.near,
    far:camera.far,enabled:globalControls.enabled,touchAction:canvas.style.touchAction};
   globalControls.enabled=false;camera.near=.000015;camera.far=150;camera.updateProjectionMatrix();arriving=true;
  }
  mode=nextMode;spot=nextSpot;angle=nextAngle;group.visible=true;
  const showChange=mode==='change';
  if(showChange&&!changeSurface){
   changeSurface=makeChangeSurface(data,surfaces.post.material);
   group.add(changeSurface);
  }
  if(changeSurface)changeSurface.visible=showChange;
  const visibleSurvey=mode==='pre'?'pre':'post';
  sectionFace.visible=mode==='section';
  const postGeometry=surfaces.post.geometry;
  postGeometry.setDrawRange(0,mode==='section'?postGeometry.userData.sectionCount:Infinity);
  for(const key of ['pre','post']){
   surfaces[key].visible=!showChange&&key===visibleSurvey;profiles[key].visible=key===visibleSurvey||mode==='section';
  }
  const sample=hungaSample(data,spot),{cols,rows,stepM,transect}=data.grid;
  const height=showChange&&!Number.isFinite(sample.post)?sample.pre:sample[visibleSurvey];
  markerVisible=Number.isFinite(height);
  marker.visible=markerVisible;
  if(markerVisible){
   marker.position.set(xy(sample.col,cols,stepM),vertical(height)+.12,xy(transect,rows,stepM));
   const value=showChange?hungaChangeLabel(sample.change):Math.round(-height)+' 米深';
   label.textContent=hungaSpots[spot]+' · '+value;
  }
  return move(instant,arriving);
 }

 function close(){
  if(!saved)return;
  motion?.resolve(false);motion=null;arriving=false;
  localControls?.dispose();localControls=null;
  canvas.style.touchAction=saved.touchAction;
  camera.position.copy(saved.position);camera.up.copy(saved.up);camera.near=saved.near;camera.far=saved.far;camera.updateProjectionMatrix();
  globalControls.target.copy(saved.target);globalControls.enabled=saved.enabled;globalControls.update();
  lesson.set(null,data);
  saved=null;mode=null;spot=null;group.visible=false;label.hidden=true;
 }
 function render(width,height){
  if(!saved)return;
  if(motion){
   const {from,fromTarget,fromUp,position,target,start,duration,flight}=motion;
   const t=Math.min(1,(performance.now()-start)/duration);
   if(t===1)finish();
   else if(flight){
    const altitude=Math.max(.007,from.length()-radius);
    const direction=from.clone().normalize();
    const rotation=new THREE.Quaternion().setFromUnitVectors(direction,up);
    direction.applyQuaternion(new THREE.Quaternion().slerp(rotation,ease(Math.min(t*1.34,1))));
    const radiusAt=radius+Math.exp(THREE.MathUtils.lerp(Math.log(altitude),Math.log(position.length()-radius),t));
    const approach=ease(THREE.MathUtils.clamp((t-.55)/.45,0,1));
    camera.position.copy(direction.multiplyScalar(radiusAt)).lerp(position,approach);
    camera.up.copy(fromUp).lerp(up,approach).normalize();
    const viewTarget=fromTarget.clone().lerp(anchor,ease(Math.min(t*1.15,1))).lerp(target,approach);
    camera.lookAt(viewTarget);
   }else{
    const blend=ease(t);
    camera.position.copy(from).lerp(position,blend);
    localControls.target.copy(fromTarget).lerp(target,blend);
    camera.lookAt(localControls.target);
   }
  }else localControls?.update();
  camera.updateMatrixWorld();
  lesson.render(camera,width,height,arriving);
  const p=group.localToWorld(marker.position.clone()).project(camera);
  label.hidden=arriving||!markerVisible||Math.abs(p.x)>.9||Math.abs(p.y)>.85||Math.abs(p.z)>1;
  if(!label.hidden){
   const maxLeft=Math.max(8,width-(label.offsetWidth||150)-8);
   label.style.left=Math.max(8,Math.min(maxLeft,(p.x*.5+.5)*width+9))+'px';
   label.style.top=Math.max(8,Math.min(height-36,(.5-p.y*.5)*height-25))+'px';
  }
 }

 function manual(){
  if(arriving)finish();
  else if(motion){motion.resolve(true);motion=null;}
 }
 function zoom(factor){
  if(!saved)return false;
  manual();
  const offset=camera.position.clone().sub(localControls.target);
  camera.position.copy(localControls.target).add(offset.multiplyScalar(1/factor));
  localControls.update();
  return true;
 }
 return {show,close,render,setLesson:beat=>lesson.set(beat,data),active:()=>Boolean(saved),manual,zoom};
}
