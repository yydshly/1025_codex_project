import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {createGlobeEffects,SITES,latLonToVector} from './globe-effects.js';
import {createArchiveGlobeLayer} from './archive-globe-layer.js';
import {createSyncCloudLayer} from './sync-cloud-layer.js';
import {createSyncStationLayer} from './sync-station-layer.js';
import {createSyncChangeLayer} from './sync-change-layer.js';
import {createEarthEventLayer} from './earth-event-layer.js';
import {fitSphereDistance} from './camera-fit.js';
import {guidedCloudShot,fitGuidedCloudDistance,GUIDED_CLOUD_CLEARANCE} from './guided-cloud-shot.js';
import {createDynamicGlobeLayer} from './dynamic-globe-layer.js';
import {createObservedStoryLayer} from './observed-story-layer.js';
import {createRiverTracerLayer} from './river-tracer-layer.js';
import {BIG_PINEY_GEOGRAPHY} from './river-big-piney-geography.js';
import {createHarborTideLayer} from './harbor-tide-layer.js';
import {createTideTeachingLayer,tideLessonMoonScale,tideLessonDistanceScale} from './tide-teaching-layer.js';
import {HARBOR_TIDE_IMAGERY} from './harbor-tide-geography.js';
import {createBatteryDischargeLayer} from './battery-discharge-layer.js';
import {createDieselEngineLayer} from './diesel-engine-layer.js';
import {createHungaTerrainLayer} from './hunga-terrain-layer.js';

const R=2,TAU=Math.PI*2;
const tideFlightDuration=3800;
const sourceURL='./assets/earth-blue-marble.png';
const asSites=()=>Array.isArray(SITES)?SITES:Object.values(SITES);
const v3=(p)=>p?.isVector3?p.clone():Array.isArray(p)?new THREE.Vector3(...p):new THREE.Vector3(p?.x||0,p?.y||0,p?.z||0);
const tideEase=value=>THREE.MathUtils.smootherstep(value,0,1);
const recordedDistances={volcano:2.72,storm:3.45,quake:3.75,river:6.1,mangkhut:2.72};

function glowMaterial(){return new THREE.ShaderMaterial({
 uniforms:{tint:{value:new THREE.Color('#328de4')}},
 vertexShader:'varying vec3 n;varying vec3 p;void main(){vec4 w=modelMatrix*vec4(position,1.);p=w.xyz;n=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}',
 fragmentShader:'uniform vec3 tint;varying vec3 n;varying vec3 p;void main(){float facing=abs(dot(normalize(n),normalize(cameraPosition-p)));float f=pow(1.-facing,5.2);gl_FragColor=vec4(tint*1.15,f*.32);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
 transparent:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending
});}
function line(points,color,opacity=.3){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));}
function texture(loader,url){return new Promise((resolve,reject)=>loader.load(url,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;resolve(t);},undefined,reject));}

/** One georeferenced Earth shared by every thematic layer. Y north, +X 0°E. */
export function createGlobeEngine(canvas,labelHost,loading,options={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor('#030a15',0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(39,1,.04,150);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.06;controls.enablePan=false;controls.minDistance=4.9;controls.maxDistance=14;
 controls.maxDistance=32;controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI-.15;controls.rotateSpeed=.5;controls.zoomSpeed=.65;
 const light=new THREE.DirectionalLight('#fff6e7',3.15);scene.add(light);
 const fill=new THREE.DirectionalLight('#80afd8',.36);scene.add(fill);
 scene.add(new THREE.AmbientLight('#a2c2e7',.24));
 const earthRoot=new THREE.Group();scene.add(earthRoot);
 const earthMaterial=new THREE.MeshStandardMaterial({color:'#a9c7dc',roughness:.94,metalness:0});
 // Subtle ocean grade makes the historical map legible on a dark display;
 // it does not introduce weather or observational data.
 earthMaterial.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat oceanGrade=smoothstep(0.001,0.018,diffuseColor.b-diffuseColor.r)*(1.0-smoothstep(0.035,0.12,diffuseColor.g));\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.008,0.032,0.072),oceanGrade*0.92);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(0.94,0.56,oceanGrade);');
 };
 const earth=new THREE.Mesh(new THREE.SphereGeometry(R,144,96),earthMaterial);earthRoot.add(earth);
 const hungaOcean=new THREE.MeshBasicMaterial({color:'#0d243b',toneMapped:false});
 const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(R*1.014,128,80),glowMaterial());earthRoot.add(atmosphere);
 const grid=new THREE.Group();
 for(let lat=-60;lat<=60;lat+=30){const points=[];for(let lon=-180;lon<=180;lon+=2)points.push(latLonToVector(lat,lon,R*1.0018));grid.add(line(points,'#93c1d1',lat===0?.18:.085));}
 for(let lon=-180;lon<180;lon+=30){const points=[];for(let lat=-89;lat<=89;lat+=2)points.push(latLonToVector(lat,lon,R*1.0018));grid.add(line(points,'#8ab9cd',.075));}
 earthRoot.add(grid);
 const effects=createGlobeEffects(R);earthRoot.add(effects.group);
 const archive=createArchiveGlobeLayer(R);earthRoot.add(archive.group);
 const liveEvents=createEarthEventLayer(R);earthRoot.add(liveEvents.group);liveEvents.setPixelRatio(renderer.getPixelRatio());
 const syncClouds=createSyncCloudLayer(R);earthRoot.add(syncClouds.group);let syncMode=false;
 const syncChanges=createSyncChangeLayer(R);earthRoot.add(syncChanges.group);syncChanges.setVisible(false);let syncChangeEnabled=false;
 // A registered observation image must keep its measured colours and clouds.
 // It bypasses both the historical ocean grade and decorative illumination.
 const archiveMaterial=new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false});
 const syncBaseMaterial=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.88,metalness:0});
 // This is the historical geographic base only; observed IR pixels have a separate material.
 syncBaseMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat geographicOcean=smoothstep(.001,.018,diffuseColor.b-diffuseColor.r)*(1.-smoothstep(.04,.14,diffuseColor.g));\nvec3 geographicLand=mix(vec3(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))),diffuseColor.rgb,.74)*.63;\ndiffuseColor.rgb=mix(geographicLand,vec3(.009,.052,.105),geographicOcean*.96);');};
 // Sparse deterministic stars. They are a framing background, not a star chart.
 const starPositions=[],starColors=[];
 for(let i=0;i<650;i++){const a=i*2.399963,b=Math.acos(1-2*(i+.5)/650),r=35+(i%9);starPositions.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a));const c=.35+(i%5)*.12;starColors.push(c*.82,c*.91,c);}
 const starsGeometry=new THREE.BufferGeometry();starsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));starsGeometry.setAttribute('color',new THREE.Float32BufferAttribute(starColors,3));
 scene.add(new THREE.Points(starsGeometry,new THREE.PointsMaterial({size:.035,vertexColors:true,transparent:true,opacity:.72,depthWrite:false})));

 const orbitalGroup=new THREE.Group();scene.add(orbitalGroup);
 const orbit=new THREE.LineLoop(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:'#779bb8',transparent:true,opacity:.45,depthWrite:false}));orbitalGroup.add(orbit);
 const moon=new THREE.Mesh(new THREE.SphereGeometry(.28,80,56),new THREE.MeshStandardMaterial({color:'#c9cac6',roughness:1,metalness:0}));orbitalGroup.add(moon);
 const tideRing=new THREE.LineLoop(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:'#78e4e9',transparent:true,opacity:.65,depthWrite:false}));orbitalGroup.add(tideRing);
 const tidalA=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(),.32,'#84eff0',.1,.045);
 const tidalB=new THREE.ArrowHelper(new THREE.Vector3(-1,0,0),new THREE.Vector3(),.32,'#84eff0',.1,.045);orbitalGroup.add(tidalA,tidalB);
 const orbitPositions=new Float32Array(181*3),tidePositions=new Float32Array(181*3);
 orbit.geometry.setAttribute('position',new THREE.BufferAttribute(orbitPositions,3));tideRing.geometry.setAttribute('position',new THREE.BufferAttribute(tidePositions,3));
 orbit.frustumCulled=false;tideRing.frustumCulled=false;

 const labels=[];labelHost.replaceChildren();
 const leader=document.createElementNS('http://www.w3.org/2000/svg','svg');leader.setAttribute('aria-hidden','true');leader.setAttribute('width','100%');leader.setAttribute('height','100%');
 Object.assign(leader.style,{position:'absolute',inset:'0',pointerEvents:'none',overflow:'visible'});labelHost.appendChild(leader);
 for(const site of asSites()){
  const button=document.createElement('button');button.type='button';button.className='globe-pin';button.dataset.scene=site.id;button.setAttribute('aria-label',`查看${site.label||site.name||site.id}`);
  const dot=document.createElement('i'),name=document.createElement('span');name.textContent=site.label||site.name||site.id;button.append(dot,name);
  button.style.setProperty('--pin-color',site.color||'#8cdde3');button.style.position='absolute';button.style.pointerEvents='auto';button.addEventListener('click',e=>{e.stopPropagation();options.onSelect?.(site.id);});
  labelHost.appendChild(button);
  const link=document.createElementNS('http://www.w3.org/2000/svg','line');link.setAttribute('stroke',site.color||'#8cdde3');link.setAttribute('stroke-opacity','.55');link.setAttribute('stroke-width','.8');leader.appendChild(link);
  labels.push({site,button,link});
 }
 const annotations=[];for(let i=0;i<3;i++){const el=document.createElement('span');el.className='process-annotation';el.hidden=true;labelHost.appendChild(el);annotations.push(el);}
 const moonLabel=document.createElement('span');moonLabel.className='moon-world-label';moonLabel.textContent='月球 · 尺寸与距离已缩放';Object.assign(moonLabel.style,{position:'absolute',pointerEvents:'none'});labelHost.appendChild(moonLabel);
 const archiveLeader=document.createElementNS('http://www.w3.org/2000/svg','svg');archiveLeader.setAttribute('aria-hidden','true');archiveLeader.setAttribute('width','100%');archiveLeader.setAttribute('height','100%');Object.assign(archiveLeader.style,{position:'absolute',inset:'0',pointerEvents:'none',overflow:'visible',display:'none'});labelHost.appendChild(archiveLeader);
 const archiveLabelColors=['#d8a3ff','#ffd192','#80e2ee'];
 const archiveLinks=archiveLabelColors.map(color=>{const link=document.createElementNS('http://www.w3.org/2000/svg','line');link.setAttribute('stroke',color);link.setAttribute('stroke-opacity','.7');link.setAttribute('stroke-width','.8');archiveLeader.appendChild(link);return link;});
 const archiveLabels=['香港 · 参照位置','山竹 · 档案中心','A · 对照中心'].map((text,i)=>{const el=document.createElement('span');el.className='process-annotation archive-annotation';el.textContent=text;el.hidden=true;Object.assign(el.style,{position:'absolute',pointerEvents:'none',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:archiveLabelColors[i],fontSize:'10px'});labelHost.appendChild(el);return el;});
 const liveLabel=document.createElement('span');liveLabel.className='process-annotation live-event-label';liveLabel.hidden=true;
 Object.assign(liveLabel.style,{position:'absolute',pointerEvents:'none',whiteSpace:'pre-line',maxWidth:'210px',fontSize:'11px',lineHeight:'1.45',color:'#e8f3fb'});labelHost.appendChild(liveLabel);
 let w=1,h=1,current='overview',desiredPosition=null,autoRotate=false,userOrbit=false,previousClock=0,assetLoaded=false,orbitalDistance=1,readoutData=null;
 let archiveEnabled=false,archiveView='global',legacyView=null,archiveLastFrame=0;
 let liveEnabled=false,liveView='global',liveLegacyView=null,liveOnSelect=options.onLiveEvent??null;
 let archiveTexture=null,archiveTextureUrl=null,archiveTextureRequest=0,archiveGeneration=0;
 let archiveBaselineLabel='';
 const focusTarget=new THREE.Vector3();
 const initialLat=24,initialLon=126;
 const scaleDistance=(distance)=>distance*Math.max(1,.88/Math.max(.3,w/h));
 const homePosition=(id)=>{
  const site=asSites().find(s=>s.id===id);
  const pos=site?latLonToVector(site.lat+(id==='volcano'?-40:0),site.lon+(id==='volcano'?12:0),1):latLonToVector(id==='overview'?10:initialLat,initialLon,1);
  const halfVertical=THREE.MathUtils.degToRad(camera.fov/2);
  const halfHorizontal=Math.atan(Math.tan(halfVertical)*Math.max(.1,w/h));
  const orbitExtent=3.15*orbitalDistance+.28;
  const fitOrbit=orbitExtent/Math.sin(Math.min(halfVertical,halfHorizontal))*1.07;
  return pos.normalize().multiplyScalar(id==='orbital'?Math.max(fitOrbit,fullGlobeDistance()):Math.max(fullGlobeDistance(),scaleDistance(id==='volcano'?8.4:id==='overview'?7.4:7.05)));
 };
 camera.position.copy(homePosition('overview'));camera.lookAt(0,0,0);controls.target.set(0,0,0);controls.update();
 function beginManualOrbit(){
  desiredPosition=null;localCameraMove=null;userOrbit=true;autoRotate=false;
  if(narrationCameraManual)updateCameraLimits();
 }
 controls.addEventListener('start',beginManualOrbit);
 const syncStations=createSyncStationLayer(R,labelHost);earthRoot.add(syncStations.group);
 const dynamicLayer=createDynamicGlobeLayer(R,labelHost);earthRoot.add(dynamicLayer.group);
 const riverLayer=createRiverTracerLayer(R,labelHost,{onSelect:id=>options.onStorySelect?.(id)});earthRoot.add(riverLayer.group);
 const tideLayer=createHarborTideLayer(R,labelHost,{onSelect:id=>options.onStorySelect?.(id),onZoom:zoomHarborBy,imagery:HARBOR_TIDE_IMAGERY,moonTexture:()=>moon.material.map});earthRoot.add(tideLayer.group);
 const tideTeaching=createTideTeachingLayer(R,labelHost,earth);
 earthRoot.add(tideTeaching.group);
 const batteryLayer=createBatteryDischargeLayer(labelHost,{onSelect:id=>options.onStorySelect?.(id)});scene.add(batteryLayer.group);
 const dieselLayer=createDieselEngineLayer(labelHost,{onSelect:id=>options.onStorySelect?.(id)});scene.add(dieselLayer.group);
 const storyLayer=createObservedStoryLayer(R,labelHost,{onSelect:(target,pin)=>options.onStorySelect?.(target,pin)});earthRoot.add(storyLayer.group);
 let hungaLayer=null,storyVisible=false;
 let dynamicEnabled=false,dynamicData=null,dynamicView='global',localFlight=null;
 let dynamicViewReady=Promise.resolve(true);
 let tideFocus=null,localCameraMove=null,narrationCameraManual=false,tideArrivalPending=false,recordedFocus=null,manualCloudView=false;
 const localLayer=()=>dynamicData?.kind==='river'?riverLayer:dynamicData?.kind==='tide'?tideLayer:dynamicData?.kind==='battery'?batteryLayer:dynamicData?.kind==='engine'?dieselLayer:null;
 const deviceStage=()=>dynamicData?.kind==='battery'||dynamicData?.kind==='engine';
 const loader=new THREE.TextureLoader();
 if(loading){loading.hidden=false;loading.textContent='正在载入地球底图…';}
 const ready=Promise.all([texture(loader,sourceURL).then(t=>{earthMaterial.map=t;syncBaseMaterial.map=t;syncBaseMaterial.needsUpdate=true;earthMaterial.color.set('#ffffff');earthMaterial.needsUpdate=true;}),texture(loader,'./assets/moon-color.jpg').then(t=>{moon.material.map=t;moon.material.needsUpdate=true;})]).then(()=>{assetLoaded=true;if(loading)loading.hidden=true;}).catch(e=>{if(loading){loading.hidden=false;loading.textContent='地球底图未能载入，请刷新重试。';}console.error('Earth texture failed',e);throw e;});
 // Keep the returned rejection observable without producing an unhandled promise.
 ready.catch(()=>{});

 function archiveHome(){
  if(syncMode&&archiveView==='detail')return latLonToVector(19,115,1).multiplyScalar(3.45*Math.max(1,.72/Math.max(.25,w/h)));
  if(syncMode&&archiveView==='regional')return latLonToVector(20,119,1).multiplyScalar(fullGlobeDistance());
  if(archiveView==='regional'&&archive.getCount())return archive.regionalDirection().multiplyScalar(fullGlobeDistance());
  // Mangkhut's full western-Pacific track remains on the visible hemisphere.
  return latLonToVector(20,128,1).multiplyScalar(fullGlobeDistance());
 }
 function fullGlobeDistance(){return fitSphereDistance({radius:R+.12,fovDegrees:camera.fov,width:w,height:h,padding:.06,zoom:camera.zoom});}
 function liveHome(){const direction=liveEvents.getSelectedPosition()?.normalize()??latLonToVector(18,115,1);return direction.multiplyScalar(liveView==='detail'?3.55*Math.max(1,.82/Math.max(.25,w/h)):fullGlobeDistance());}
 function updateCameraLimits(){
  if(dynamicEnabled&&localLayer()&&dynamicView==='detail')return;
  const detail=dynamicEnabled?dynamicView==='detail':liveEnabled?liveView==='detail':archiveEnabled&&syncMode&&archiveView==='detail';
  const guided=geographicRecordedFocus(),manual=narrationCameraManual&&(userOrbit||manualCloudView);
  const closeCloud=Boolean(guided?.shot)||manualCloudView;
  const fireDetail=dynamicEnabled&&dynamicData?.kind==='wildfire'&&detail;
  const fit=fullGlobeDistance();
  controls.minDistance=fireDetail?R+.025:closeCloud?R+GUIDED_CLOUD_CLEARANCE:detail?(dynamicEnabled?2.15:2.65):manual||guided?R+controls.target.length()+.2:fit;
  controls.maxDistance=Math.max(32,fit*2);
  camera.near=fireDetail?.006:.04;camera.far=Math.max(150,controls.maxDistance*2);camera.updateProjectionMatrix();
  if(!detail&&!manual&&!guided&&camera.position.length()<fit){camera.position.setLength(fit);camera.lookAt(controls.target);}
 }
 function focus(id){if(dynamicEnabled||archiveEnabled||liveEnabled)return;current=id;desiredPosition=homePosition(id);userOrbit=false;readoutData=null;focusTarget.set(0,0,0);updateCameraLimits();}
 function resetView(){if(dynamicEnabled){setDynamicView('global');return {mode:'dynamic',view:'global'};}if(liveEnabled)liveView='global';if(archiveEnabled)archiveView='global';focusTarget.set(0,0,0);controls.target.set(0,0,0);userOrbit=false;updateCameraLimits();desiredPosition=liveEnabled?liveHome():archiveEnabled?archiveHome():homePosition(current);return {mode:liveEnabled?'events':archiveEnabled?'archive':'principle',view:'global'};}
 function resize(width,height){
  w=Math.max(1,width);h=Math.max(1,height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  if(hungaLayer?.active())return;
  updateCameraLimits();
  if(userOrbit||manualCloudView)return;
  if(dynamicEnabled&&localLayer()&&dynamicView==='detail'){
   if(!localFlight){const frame=localLayer().getFrame();positionLocalCamera(frame,riverRecordedPose(frame));}
   return;
  }
  if(geographicRecordedFocus()){applyRecordedFocus();return;}
  if(dynamicEnabled&&dynamicData?.kind==='tide'){if(!narrationCameraManual)positionTideOverview();return;}
  desiredPosition=dynamicEnabled?dynamicHome():liveEnabled?liveHome():archiveEnabled?archiveHome():homePosition(current);
 }
 function hideLegacyLabels(){for(const {button,link}of labels){button.hidden=true;link.style.display='none';}for(const el of annotations)el.hidden=true;moonLabel.hidden=true;leader.style.display='none';}
 let observationView=false,dynamicStationId=null;
 function dynamicHome(){
  const fit=fullGlobeDistance();
  if(dynamicView==='detail'&&dynamicData?.kind==='wildfire'){
   const [west,south,east,north]=dynamicData.viewBounds??dynamicData.bbox;
   const {lat,lon}=dynamicData.focus;
   const radians=Math.PI/180, halfFov=Math.tan(camera.fov*radians/2)/camera.zoom;
   const vertical=(north-south)*radians/2;
   const horizontal=(east-west)*radians/2*Math.cos(lat*radians);
   const distance=R+.008+Math.max(vertical/(halfFov*.83),horizontal/(halfFov*camera.aspect*.9))*R;
   return latLonToVector(lat,lon,distance);
  }
  const regionalDistance=dynamicData?.kind==='quake'?5.65:4.35;
  const detailDistance=observationView?Math.min(fit*.88,regionalDistance*Math.max(1,.82/Math.max(.25,w/h))):2.6*Math.max(1,.7/Math.max(.25,w/h));
  const direction=latLonToVector(dynamicData?.focus?.lat??20,dynamicData?.focus?.lon??120,1);
  const station=observationView&&dynamicView==='detail'&&dynamicData?.stations?.find(item=>item.id===dynamicStationId);
  if(station)direction.lerp(latLonToVector(station.lat,station.lon,1),.42).normalize();
  return direction.multiplyScalar(dynamicView==='detail'?detailDistance:fit);
 }
 function activeRecordedFocus(){
  if(!recordedFocus||narrationCameraManual||userOrbit)return null;
  const {kind}=recordedFocus;
  const matches=kind==='mangkhut'?archiveEnabled&&syncMode:dynamicEnabled&&dynamicData?.kind===kind;
  return matches?recordedFocus:null;
 }
 function geographicRecordedFocus(){
  const focus=activeRecordedFocus();
  return focus?.kind==='river'&&dynamicView==='detail'?null:focus;
 }
 function riverRecordedPose(frame){
  const focus=activeRecordedFocus();
  if(!frame||focus?.kind!=='river'||dynamicView!=='detail')return null;
  if(focus.riverShot==='reach')return {target:frame.target,distance:localCameraDistance(frame)};
  if(focus.riverShot==='section'){
   const banks=dynamicData.transects.find(section=>section.id===focus.target)?.banks;
   if(!banks?.length)return null;
   const [left,right]=banks.map(bank=>latLonToVector(bank.lat,bank.lon,R));
   const midpoint=left.clone().lerp(right,.5).setLength(frame.target.length()+frame.span*.025);
   const look=right.sub(left).cross(frame.up).normalize();
   if(look.dot(localCameraDirection(frame))<0)look.negate();
   return {target:midpoint,distance:localCameraDistance(frame)*.46,
    direction:frame.up.clone().addScaledVector(look,1.05).normalize()};
  }
  const offset=latLonToVector(focus.lat,focus.lon,R).sub(frame.target);
  const target=frame.target.clone()
   .addScaledVector(frame.east,THREE.MathUtils.clamp(offset.dot(frame.east)*.8,-frame.halfWidth*.62,frame.halfWidth*.62))
   .addScaledVector(frame.north,THREE.MathUtils.clamp(offset.dot(frame.north)*.8,-frame.halfHeight*.62,frame.halfHeight*.62));
  return {target,distance:localCameraDistance(frame)*.86};
 }
 function applyRecordedFocus(){
  const focus=activeRecordedFocus();
  if(!focus)return;
  if(focus.kind==='river'&&dynamicView==='detail'){
   if(localFlight)return;
   const frame=riverLayer.getFrame(),pose=riverRecordedPose(frame);
   if(pose)moveLocalCamera(frame,pose);
   return;
  }
  autoRotate=false;focusTarget.set(0,0,0);updateCameraLimits();
  if(focus.shot){
   const distance=fitGuidedCloudDistance(focus.shot,{radius:R,fovDegrees:camera.fov,aspect:w/h,zoom:camera.zoom});
   desiredPosition=latLonToVector(focus.shot.lat,focus.shot.lon,distance);
  }else{
   const preferred=focus.kind==='mangkhut'&&focus.target==='cloud'?3.25:recordedDistances[focus.kind];
   const distance=Math.max(R+.65,Math.min(fullGlobeDistance()*.91,R+scaleDistance(preferred-R)));
   desiredPosition=latLonToVector(focus.lat,focus.lon,distance);
  }
  if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
   camera.position.copy(desiredPosition);controls.target.copy(focusTarget);controls.update();desiredPosition=null;
  }
 }
 function setRecordedNarrationFocus(next){
  if(!next){
   const previous=activeRecordedFocus();
   if(previous){
    if(previous.kind==='river'&&dynamicView==='detail')localCameraMove=null;
    else desiredPosition=null;
   }
   recordedFocus=null;return;
  }
  const {kind,target,key,cloudShot,riverShot}=next;
  if(!Object.hasOwn(recordedDistances,kind))return;
  const shot=guidedCloudShot(cloudShot,kind);
  const banks=kind==='river'?dynamicData?.transects?.find(section=>section.id===target)?.banks:null;
  const lat=shot?.lat??next.lat??(banks?.length?banks.reduce((sum,bank)=>sum+bank.lat,0)/banks.length:undefined);
  const lon=shot?.lon??next.lon??(banks?.length?banks.reduce((sum,bank)=>sum+bank.lon,0)/banks.length:undefined);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return;
  const prior=recordedFocus;
  if(prior?.kind===kind&&prior.target===target&&prior.key===key&&prior.cloudShot===cloudShot){
   const drift=latLonToVector(lat,lon).angleTo(latLonToVector(prior.lat,prior.lon));
   if(drift<THREE.MathUtils.degToRad(kind==='river'?.0001:.35))return;
  }
  recordedFocus={kind,target,key,lat,lon,cloudShot,shot,riverShot};
  applyRecordedFocus();
 }

 function projectedCloudShot(){
  const shot=recordedFocus?.shot;
  if(!shot)return null;
  const cameraPosition=camera.position;
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  for(const {lat,lon} of shot.samples){
   const surface=earthRoot.localToWorld(latLonToVector(lat,lon,R));
   if(surface.dot(cameraPosition.clone().sub(surface))<=0)continue;
   const projected=surface.project(camera);
   if(Math.abs(projected.z)>1)continue;
   const x=(projected.x+1)*w/2,y=(1-projected.y)*h/2;
   left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
  }
  left=Math.max(0,left);top=Math.max(0,top);right=Math.min(w,right);bottom=Math.min(h,bottom);
  return left<right&&top<bottom?{x:left,y:top,width:right-left,height:bottom-top}:null;
 }
 function positionTideOverview(){
  const frame=tideLayer.getFrame();
  if(!frame)return;
  const lunar=tideLayer.getOverviewMoonPosition?.();
  const direction=frame.up.clone(),target=new THREE.Vector3();
  let distance=fullGlobeDistance();
  if(lunar){
   const teaching=tideTeaching.active();
   // Leave the station on the near hemisphere while moving the Moon away from Earth's limb.
   const lunarDirection=lunar.clone().normalize();
   const separation=direction.angleTo(lunarDirection);
   const bearing=teaching?Math.PI/2:THREE.MathUtils.clamp(separation,THREE.MathUtils.degToRad(60),THREE.MathUtils.degToRad(82));
   const axis=direction.clone().cross(lunarDirection);
   if(axis.lengthSq()>1e-8)direction.applyAxisAngle(axis.normalize(),separation-bearing);

   // Fit both silhouettes to the narrower screen dimension, including their different depths.
   const right=new THREE.Vector3(0,1,0).cross(direction).normalize(),up=direction.clone().cross(right);
   const earthRadius=teaching?R*1.14:R+.10,moonRadius=R*.07*(teaching?tideLessonMoonScale:1);
   const span=(axis)=>{
    const offset=lunar.dot(axis);
    return (Math.max(earthRadius,offset+moonRadius)+Math.min(-earthRadius,offset-moonRadius))/2;
   };
   target.addScaledVector(right,span(right)).addScaledVector(up,span(up));
   const vertical=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*.91/camera.zoom;
   const horizontal=vertical*camera.aspect;
   for(const [center,radius] of [[new THREE.Vector3(),earthRadius],[lunar,moonRadius]]){
    const offset=center.clone().sub(target);
    const fit=Math.max((Math.abs(offset.dot(right))+radius)/horizontal,(Math.abs(offset.dot(up))+radius)/vertical);
    distance=Math.max(distance,center.dot(direction)+radius*(teaching?.35:1)+fit);
   }
  }
  desiredPosition=null;
  focusTarget.copy(target);controls.target.copy(target);
  controls.maxDistance=Math.max(controls.maxDistance,distance*1.7);
  camera.position.copy(target).addScaledVector(direction,distance);
  camera.lookAt(target);controls.update();
 }
 function setTideTeaching(phase,progress,options){
  const wasActive=tideTeaching.active();
  const active=Boolean(phase&&tideLayer.getOverviewMoonPosition());
  if(wasActive!==active)tideLayer.setTeachingMode(active,tideLessonMoonScale,tideLessonDistanceScale);
  tideTeaching.set(active?phase:null,progress,active?tideLayer.getOverviewMoonPosition():null,options);
 }
 function localCameraDistance(frame){
  const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  const fit=1.05*Math.max(frame.halfHeight,frame.halfWidth/Math.max(.2,camera.aspect))/tangent;
  if(deviceStage())return Math.max(4.8,fit);
  return dynamicData?.kind==='tide'&&tideFocus?fit*.94:fit;
 }
 function localCameraTarget(frame){
  if(dynamicData?.kind!=='tide')return frame.target;
  const north=tideFocus==='peak' ? .28 : tideFocus ? .66 : .54;
  const east=tideFocus==='rise' ? .1 : tideFocus==='set' ? -.1 : 0;
  return frame.target.clone().addScaledVector(frame.north,north*frame.halfHeight)
   .addScaledVector(frame.east,east*frame.halfWidth);
 }
 function localCameraDirection(frame){
  if(deviceStage())return new THREE.Vector3(.35,.27,1).normalize();
  const harbor=dynamicData?.kind==='tide';
  return frame.up.clone().addScaledVector(frame.east,harbor?.30:.52).addScaledVector(frame.north,harbor?-.30:-.15).normalize();
 }
 function positionLocalCamera(frame,pose){
  if(!frame)return;
  localCameraMove=null;
  const {distance,target}=pose??{distance:localCameraDistance(frame),target:localCameraTarget(frame)};
  camera.position.copy(target).addScaledVector(pose?.direction??localCameraDirection(frame),distance);
  focusTarget.copy(target);controls.target.copy(target);
  const device=deviceStage();
  camera.near=device?.04:.000015;camera.far=device?150:12;camera.updateProjectionMatrix();
  controls.minDistance=distance*.67;controls.maxDistance=distance*2.8;
  controls.enableRotate=device;
  controls.enableZoom=dynamicData?.kind!=='tide';
  atmosphere.visible=false;camera.lookAt(target);controls.update();
 }
 function moveLocalCamera(frame,pose){
  if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches){positionLocalCamera(frame,pose);return;}
  const {target,distance}=pose;
  controls.minDistance=Math.min(controls.minDistance,distance*.67);
  controls.maxDistance=Math.max(controls.maxDistance,distance*2.8);
  localCameraMove={
   start:performance.now(),from:camera.position.clone(),fromTarget:controls.target.clone(),target,distance,
   to:target.clone().addScaledVector(pose.direction??localCameraDirection(frame),distance),
  };
 }
 function stopLocalCamera(){
  localCameraMove=null;
  localFlight?.resolve(false);localFlight=null;
  dynamicViewReady=Promise.resolve(true);
  controls.enabled=true;controls.enableRotate=true;controls.enableZoom=true;atmosphere.visible=true;
  tideArrivalPending=false;
  if(deviceStage()){
   earthRoot.visible=true;
   canvas.style.opacity='';
  }
  if(dynamicData?.kind==='tide')tideLayer.setArrivalBlend?.(0);
  localLayer()?.setView('global');
 }
 function enterLocalCamera(instant,scripted){
  const layer=localLayer(),frame=layer?.getFrame();if(!frame)return;
  const device=deviceStage();
  autoRotate=false;userOrbit=false;desiredPosition=null;
  if(localFlight)localFlight.resolve(false);
  localFlight=null;controls.enableRotate=false;
  const harbor=dynamicData?.kind==='tide';
  if(!device&&(!harbor||instant))layer.setView('detail');
  if(instant||(device&&!earthRoot.visible)||camera.position.distanceTo(frame.target)<.01){
   if(device){earthRoot.visible=false;layer.setView('detail');canvas.style.opacity='';}
   else if(harbor){layer.setView('detail');tideLayer.setArrivalBlend?.(1);}
   controls.enabled=true;positionLocalCamera(frame);dynamicViewReady=Promise.resolve(true);
   if(!harbor)applyRecordedFocus();
   return;
  }
  if(harbor)tideLayer.setArrivalBlend?.(0);
  controls.enabled=false;
  const offset=camera.position.clone().sub(localCameraTarget(frame));
  dynamicViewReady=new Promise(resolve=>{
   localFlight={resolve,start:performance.now(),fromTarget:controls.target.clone(),fromDirection:offset.clone().normalize(),distance:offset.length(),frame,
    scripted:harbor&&scripted,progress:0};
  });
 }
 function setTideFlightProgress(progress){
  if(localFlight?.scripted)localFlight.progress=THREE.MathUtils.clamp(progress,0,1);
 }
 function releaseTideFlight(){
  if(!localFlight?.scripted)return;
  localFlight.scripted=false;
  localFlight.start=performance.now()-localFlight.progress*tideFlightDuration;
 }
 function finishLocalFlight(){
  const {resolve,frame,detailShown}=localFlight;
  const harbor=dynamicData?.kind==='tide';
  localFlight=null;controls.enabled=true;
  if(deviceStage()){
   earthRoot.visible=false;localLayer().setView('detail');canvas.style.opacity='';
  }else if(harbor){
   if(!detailShown)tideLayer.setView('detail');
   tideLayer.setArrivalBlend?.(1);
  }
  positionLocalCamera(frame);resolve(true);
  if(harbor)tideArrivalPending=true;
  else applyRecordedFocus();
 }
 function setNarrationCameraManual(value){
  if(value)hungaLayer?.manual();
  const focus=geographicRecordedFocus();
  if(value&&focus){desiredPosition=null;manualCloudView=Boolean(focus.shot);}
  narrationCameraManual=Boolean(value);
  if(!narrationCameraManual){manualCloudView=false;tideLayer.resetLocalZoom?.();return;}
  localCameraMove=null;
  // Settle the moving target so the same input can immediately use the local controls.
  if(localFlight)finishLocalFlight();
 }
 function zoomHarborBy(multiplier){
  if(!dynamicEnabled||dynamicData?.kind!=='tide'||dynamicView!=='detail'||localFlight)return false;
  tideLayer.zoomLocal?.(multiplier);
  return true;
 }
 canvas.addEventListener('wheel',event=>{
  if(!event.deltaY||event.ctrlKey||event.metaKey)return;
  if(zoomHarborBy(Math.exp(-Math.sign(event.deltaY)*.13)))event.preventDefault();
 },{passive:false});
 canvas.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey||!['+','=','-','_'].includes(event.key))return;
  const factor=event.key==='-'||event.key==='_'?1/1.15:1.15;
  if(hungaLayer?.zoom(factor)){event.preventDefault();return;}
  if(!zoomHarborBy(factor)){
   if(!controls.enabled||!controls.enableZoom)return;
   beginManualOrbit();
   const offset=camera.position.clone().sub(controls.target).multiplyScalar(1/factor);
   camera.position.copy(controls.target).add(offset);
   controls.update();
  }
  event.preventDefault();
 });
 function setTideNarrationFocus(focus){
  if(!dynamicEnabled||dynamicData?.kind!=='tide'||tideFocus===focus)return;
  tideFocus=focus;
  tideLayer.setNarrationFocus(focus);
  if(dynamicView!=='detail'||localFlight||narrationCameraManual)return;
  const frame=tideLayer.getFrame();
  if(!frame)return;
  moveLocalCamera(frame,{target:localCameraTarget(frame),distance:localCameraDistance(frame)});
 }
 function renderLocalCamera(){
  if(!localFlight){
   if(localCameraMove){
    const {start,from,fromTarget,target,to,distance}=localCameraMove;
    const t=Math.min(1,(performance.now()-start)/620);
    const eased=t*t*(3-2*t);
    camera.position.copy(from).lerp(to,eased);
    controls.target.copy(fromTarget).lerp(target,eased);
    focusTarget.copy(controls.target);
    camera.lookAt(controls.target);
    if(t===1){controls.minDistance=distance*.67;controls.maxDistance=distance*2.8;localCameraMove=null;}
   }
   controls.update();return;
  }
  const {start,fromTarget,fromDirection,distance,frame,detailShown,scripted}=localFlight;
  const device=deviceStage();
  const harbor=dynamicData?.kind==='tide';
  const progress=scripted?localFlight.progress:Math.min(1,(performance.now()-start)/(harbor?tideFlightDuration:2100));
  if(progress>=1){finishLocalFlight();return;}
  const eased=harbor?tideEase(progress):progress*progress*(3-2*progress);
  const close=Math.max(0,(progress-.57)/.43);
  const radius=distance*Math.pow(localCameraDistance(frame)/distance,eased);
  const endDirection=localCameraDirection(frame),target=localCameraTarget(frame);
  let direction;
  if(harbor){
   // Turn to the station while still at orbital distance, then tilt into the harbor.
   const turn=new THREE.Quaternion().setFromUnitVectors(fromDirection,frame.up);
   direction=fromDirection.clone().applyQuaternion(new THREE.Quaternion().slerp(turn,tideEase(progress/.39)));
   direction.lerp(endDirection,tideEase((progress-.56)/.44)).normalize();
   if(progress>=.63&&!detailShown){
    tideLayer.setView('detail');
    localFlight.detailShown=true;
   }
   localFlight.arrivalBlend=tideEase((progress-.78)/.22);
   tideLayer.setArrivalBlend?.(localFlight.arrivalBlend);
  }else direction=device?(progress<.5?fromDirection:endDirection):fromDirection.clone().lerp(endDirection,close*close).normalize();
  camera.position.copy(target).addScaledVector(direction,radius);
  controls.target.copy(fromTarget).lerp(target,eased);
  if(device){
   // Swap to the schematic at the darkest point; the archive has no precise bench location.
   canvas.style.opacity=String(1-Math.max(0,1-Math.abs(progress-.5)/.19));
   if(progress>=.5&&earthRoot.visible){earthRoot.visible=false;localLayer().setView('detail');}
  }
  camera.near=device?.04:Math.max(.000015,Math.min(.04,radius*.035));
  camera.updateProjectionMatrix();camera.lookAt(controls.target);
  atmosphere.visible=!device&&camera.position.length()>R+.035;
 }
 function setDynamicData(data){
  setHungaView();
  setRecordedNarrationFocus(null);
  if(localLayer())stopLocalCamera();
  tideFocus=null;localCameraMove=null;
  dynamicData=data;
  dynamicStationId=data?.stations?.[0]?.id??data?.transects?.[0]?.id??null;
  dynamicLayer.setData(localLayer()?null:data);
  riverLayer.setData(data?.kind==='river'?data:null);riverLayer.setVisible(dynamicEnabled&&data?.kind==='river');
  tideLayer.setData(data?.kind==='tide'?data:null);tideLayer.setVisible(dynamicEnabled&&data?.kind==='tide');
  batteryLayer.setData(data?.kind==='battery'?data:null);batteryLayer.setVisible(dynamicEnabled&&data?.kind==='battery');
  dieselLayer.setData(data?.kind==='engine'?data:null);dieselLayer.setVisible(dynamicEnabled&&data?.kind==='engine');
  dynamicView='global';
  if(dynamicEnabled){
   earth.material=['quake','tide'].includes(data?.kind)?earthMaterial:syncBaseMaterial;userOrbit=false;updateCameraLimits();
   if(data?.kind==='tide')positionTideOverview();else desiredPosition=dynamicHome();
  }
 }
 function selectDynamicStation(id){
  if(id===dynamicStationId)return;
  dynamicStationId=id;
  if(dynamicData?.kind==='river'){riverLayer.selectTransect(id);return;}
  dynamicLayer.selectStation(id);
  if(dynamicEnabled&&observationView&&dynamicView==='detail'&&!userOrbit&&!geographicRecordedFocus())desiredPosition=dynamicHome();
 }
 function setDynamicView(view,{observation=false,instant=false,scripted=false}={}){
  const keepingRiver=dynamicView==='detail'&&view==='detail'&&!localFlight&&activeRecordedFocus()?.kind==='river';
  const exitingLocal=localLayer()&&dynamicView==='detail'&&view!=='detail';
  dynamicView=view==='detail'?'detail':'global';observationView=observation;
  if(!dynamicEnabled)return;
  if(keepingRiver){applyRecordedFocus();return;}
  if(localLayer()){
   if(dynamicView==='detail'){enterLocalCamera(instant,scripted);return;}
   stopLocalCamera();
  }
  userOrbit=false;focusTarget.set(0,0,0);controls.target.set(0,0,0);updateCameraLimits();desiredPosition=dynamicHome();
  if(dynamicData?.kind==='tide'){positionTideOverview();return;}
  if(instant||exitingLocal){camera.position.copy(desiredPosition);camera.lookAt(controls.target);controls.update();desiredPosition=null;}
  applyRecordedFocus();
 }
 function setDynamicMode(enabled){
  if(Boolean(enabled)===dynamicEnabled)return;
  if(enabled){setLiveMode(false);setArchiveMode(false);setSyncMode(false);setSyncChangeEnabled(false);dynamicEnabled=true;dynamicLayer.setVisible(!localLayer());localLayer()?.setVisible(true);effects.group.visible=false;orbitalGroup.visible=false;archive.group.visible=false;liveEvents.setVisible(false);hideLegacyLabels();liveLabel.hidden=true;for(const label of archiveLabels)label.hidden=true;archiveLeader.style.display='none';grid.visible=false;earth.material=syncBaseMaterial;autoRotate=false;userOrbit=false;focusTarget.set(0,0,0);controls.target.set(0,0,0);updateCameraLimits();desiredPosition=dynamicHome();}
  else{
   setHungaView();
   setRecordedNarrationFocus(null);
   setTideTeaching(null,0);
   const layer=localLayer();
   if(layer){
    stopLocalCamera();layer.setVisible(false);layer.setData(null);
    focusTarget.set(0,0,0);controls.target.set(0,0,0);
   }
   dynamicEnabled=false;dynamicLayer.setVisible(false);earth.material=earthMaterial;grid.visible=true;updateCameraLimits();
  }
 }
 function setHungaView(terrain,mode,spot,options){
  if(!terrain){
   if(!hungaLayer?.active())return Promise.resolve(true);
   hungaLayer.close();
   earth.material=syncBaseMaterial;
   dynamicLayer.group.visible=dynamicEnabled&&!localLayer();storyLayer.setVisible(storyVisible);atmosphere.visible=true;
   return Promise.resolve(true);
  }
  if(!dynamicEnabled||dynamicData?.kind!=='volcano')return Promise.resolve(false);
  hungaLayer??=createHungaTerrainLayer({radius:R,earthRoot,camera,canvas,labelHost,globalControls:controls});
  desiredPosition=null;autoRotate=false;
  dynamicLayer.group.visible=false;storyLayer.setVisible(false);atmosphere.visible=false;
  return hungaLayer.show(terrain,mode,spot,options);
 }
 function setLiveEvents(events,onSelect){
  if(onSelect!==undefined&&typeof onSelect!=='function')throw new TypeError('The event selection callback must be a function.');
  liveEvents.setEvents(events);if(onSelect!==undefined)liveOnSelect=onSelect;
  return liveEvents.getSelection();
 }
 function selectLiveEvent(id,{focus:shouldFocus=true}={}){
  const selection=liveEvents.selectEvent(id);
  if(liveEnabled&&shouldFocus){userOrbit=false;focusTarget.set(0,0,0);controls.target.set(0,0,0);updateCameraLimits();desiredPosition=liveHome();}
  return selection;
 }
 function setLiveObservation(index){return liveEvents.setObservation(index);}
 function setLiveTime(timeUtc=null){liveEvents.setTime(timeUtc);return liveEvents.getSelection();}
 function setLiveView(view){
  if(!['global','detail'].includes(view))throw new RangeError('Live event view must be global or detail.');
  liveView=view;
  if(liveEnabled){userOrbit=false;focusTarget.set(0,0,0);controls.target.set(0,0,0);updateCameraLimits();desiredPosition=liveHome();}
 }
 function setLiveMode(enabled){
  if(enabled&&dynamicEnabled)setDynamicMode(false);
  const next=Boolean(enabled);if(next===liveEnabled)return;
  if(next){
   if(archiveEnabled)setArchiveMode(false);
   setSyncMode(false);setSyncChangeEnabled(false);++archiveGeneration;++archiveTextureRequest;clearArchiveImagery();
   liveLegacyView={position:camera.position.clone(),target:controls.target.clone(),focus:focusTarget.clone(),desired:desiredPosition?.clone()??null,userOrbit,autoRotate,minPolarAngle:controls.minPolarAngle,maxPolarAngle:controls.maxPolarAngle,gridVisible:grid.visible};
   liveEnabled=true;liveView='global';liveEvents.setVisible(true);archive.group.visible=false;grid.visible=false;
   effects.group.visible=false;orbitalGroup.visible=false;hideLegacyLabels();for(const el of archiveLabels)el.hidden=true;archiveLeader.style.display='none';
   earth.material=earthMaterial;controls.minPolarAngle=.08;controls.maxPolarAngle=Math.PI-.08;
   focusTarget.set(0,0,0);controls.target.set(0,0,0);userOrbit=false;autoRotate=false;updateCameraLimits();desiredPosition=liveHome();
  }else{
   liveEnabled=false;liveEvents.setVisible(false);liveLabel.hidden=true;earth.material=earthMaterial;leader.style.display='';
   if(liveLegacyView){
    const prior=liveLegacyView;camera.position.copy(prior.position);controls.target.copy(prior.target);focusTarget.copy(prior.focus);desiredPosition=prior.desired;userOrbit=prior.userOrbit;autoRotate=prior.autoRotate;
    controls.minPolarAngle=prior.minPolarAngle;controls.maxPolarAngle=prior.maxPolarAngle;grid.visible=prior.gridVisible;liveLegacyView=null;
   }else{focusTarget.set(0,0,0);controls.target.set(0,0,0);desiredPosition=homePosition(current);userOrbit=false;grid.visible=true;}
   effects.group.visible=current!=='orbital';orbitalGroup.visible=current==='orbital';updateCameraLimits();camera.lookAt(controls.target);controls.update();
  }
  archiveLastFrame=0;
 }
 function clearArchiveImagery(){
  archiveMaterial.map=null;archiveMaterial.needsUpdate=true;archiveTexture?.dispose();archiveTexture=null;archiveTextureUrl=null;
  if(archiveEnabled)earth.material=syncMode?syncBaseMaterial:earthMaterial;
 }
 function setArchiveEvent(records){
  syncClouds.clear();archive.setEvent(records);archiveBaselineLabel='';syncArchiveComparisonLabels();++archiveTextureRequest;clearArchiveImagery();
  if(archiveEnabled&&!userOrbit)desiredPosition=archiveHome();
 }
 function setArchiveIndex(index){
  archive.setIndex(index);syncArchiveComparisonLabels();
  if(archiveEnabled&&archiveView==='regional'&&!userOrbit&&!geographicRecordedFocus())desiredPosition=archiveHome();
 }
 function syncArchiveComparisonLabels(){
  const a=archive.getBaselineRecord(),coincident=archive.isBaselineCoincident();
  archiveLabels[1].textContent=!a?'山竹 · 档案中心':coincident?(archive.getBaselineIndex()===archive.getIndex()?'A=B · 当前中心':'A/B · 同位置（不同时刻）'):'B · 当前中心';
  archiveLabels[2].textContent=a?(archiveBaselineLabel||'A · '+a.timeUtc.slice(5,16).replace('T',' ')+' UTC'):'A · 对照中心';
  archiveLabels[2].setAttribute('aria-label',archiveLabels[2].textContent+'；对照位置符号，不表示影响范围');
  if(!a||coincident){archiveLabels[2].hidden=true;archiveLinks[2].style.display='none';}
 }
 function setArchiveBaseline(index,label){
  archive.setBaseline(index);archiveBaselineLabel=typeof label==='string'?label.trim():'';syncArchiveComparisonLabels();
 }
 function setArchiveMode(enabled){
  if(enabled&&dynamicEnabled)setDynamicMode(false);
  if(enabled&&liveEnabled)setLiveMode(false);
  const next=Boolean(enabled);if(next===archiveEnabled)return;
  ++archiveGeneration;++archiveTextureRequest;archiveLastFrame=0;
  if(next){
   legacyView={position:camera.position.clone(),target:controls.target.clone(),focus:focusTarget.clone(),desired:desiredPosition?.clone()??null,userOrbit,autoRotate,minDistance:controls.minDistance,maxDistance:controls.maxDistance,minPolarAngle:controls.minPolarAngle,maxPolarAngle:controls.maxPolarAngle,gridVisible:grid.visible};
   archiveEnabled=true;archive.group.visible=true;effects.group.visible=false;orbitalGroup.visible=false;grid.visible=false;hideLegacyLabels();archiveLeader.style.display='';
   controls.minPolarAngle=.08;controls.maxPolarAngle=Math.PI-.08;
   focusTarget.set(0,0,0);controls.target.set(0,0,0);userOrbit=false;autoRotate=false;desiredPosition=archiveHome();
   updateCameraLimits();
   earth.material=archiveTexture?archiveMaterial:earthMaterial;
  }else{
   setSyncMode(false);archiveEnabled=false;archive.group.visible=false;earth.material=earthMaterial;for(const el of archiveLabels)el.hidden=true;archiveLeader.style.display='none';leader.style.display='';
   if(legacyView){
    const prior=legacyView;controls.minDistance=prior.minDistance;controls.maxDistance=prior.maxDistance;controls.minPolarAngle=prior.minPolarAngle;controls.maxPolarAngle=prior.maxPolarAngle;
    camera.position.copy(prior.position);controls.target.copy(prior.target);focusTarget.copy(prior.focus);desiredPosition=prior.desired;userOrbit=prior.userOrbit;autoRotate=prior.autoRotate;grid.visible=prior.gridVisible;legacyView=null;
   }else{controls.minDistance=4.9;controls.maxDistance=32;focusTarget.set(0,0,0);desiredPosition=homePosition(current);userOrbit=false;grid.visible=true;}
   effects.group.visible=current!=='orbital';orbitalGroup.visible=current==='orbital';
   updateCameraLimits();camera.lookAt(controls.target);controls.update();
   // Labels are projected by the next legacy render, after effects are restored.
  }
 }
 function setArchiveView(view){
  if(!['global','regional','detail'].includes(view)||view==='detail'&&!syncMode)throw new RangeError('Archive view must be global, regional, or synchronized cloud detail.');
  archiveView=view;if(archiveEnabled){userOrbit=false;focusTarget.set(0,0,0);updateCameraLimits();desiredPosition=archiveHome();applyRecordedFocus();}
 }
 async function setArchiveImagery(url){
  const request=++archiveTextureRequest,generation=archiveGeneration;
  if(!url){clearArchiveImagery();return true;}
  if(!archiveEnabled||syncMode)return false;
  if(url===archiveTextureUrl&&archiveTexture){earth.material=archiveMaterial;return true;}
  // Avoid displaying yesterday's clouds against a newly selected date.
  clearArchiveImagery();
  try{
   const loaded=await texture(loader,url);
   if(request!==archiveTextureRequest||generation!==archiveGeneration||!archiveEnabled||syncMode){loaded.dispose();return false;}
   const image=loaded.image;
   if(!image?.width||!image?.height||Math.abs(image.width/image.height-2)>.01){loaded.dispose();throw new Error('Archive imagery must be a registered global 2:1 EPSG:4326 image.');}
   archiveTexture=loaded;archiveTextureUrl=url;archiveMaterial.map=loaded;archiveMaterial.needsUpdate=true;earth.material=archiveMaterial;return true;
  }catch{
   if(request===archiveTextureRequest&&generation===archiveGeneration&&archiveEnabled)clearArchiveImagery();
   return false;
  }
 }
 function setSyncMode(enabled){
  if(enabled&&dynamicEnabled)setDynamicMode(false);
  if(enabled&&liveEnabled)setLiveMode(false);
  if(enabled&&!archiveEnabled)setArchiveMode(true);
  ++archiveTextureRequest;syncMode=Boolean(enabled);syncClouds.setVisible(syncMode);syncStations.setVisible(syncMode);archive.setReferenceVisible(!syncMode);
  syncChanges.setVisible(syncMode&&syncChangeEnabled);
  if(!syncMode){if(recordedFocus?.kind==='mangkhut')setRecordedNarrationFocus(null);syncClouds.clear();if(archiveEnabled)earth.material=earthMaterial;archiveLeader.style.display=archiveEnabled?'':'none';}
  else{clearArchiveImagery();for(const el of archiveLabels)el.hidden=true;archiveLeader.style.display='none';}
  if(archiveEnabled){updateCameraLimits();if(!userOrbit)desiredPosition=archiveHome();}
 }
 function setSyncFrame(frame,bbox,pair){if(!syncMode||!frame){syncClouds.clear();return Promise.resolve(!frame);}return syncClouds.setFrame(frame,bbox,pair);}
 function setSyncChangeEnabled(enabled){syncChangeEnabled=Boolean(enabled);syncChanges.setVisible(syncMode&&syncChangeEnabled);syncClouds.setComparisonSuppressed(syncChangeEnabled);}
 function setSyncChangeFrame(frame,bbox){return syncMode&&syncChangeEnabled?syncChanges.setFrame(frame,bbox):Promise.resolve(false);}
 function preloadSyncChange(frame,bbox){return syncMode&&syncChangeEnabled&&frame?syncChanges.preload(frame,bbox):Promise.resolve(false);}
 function projectArchiveLabels(){
  if(syncMode){for(const el of archiveLabels)el.hidden=true;archiveLeader.style.display='none';return;}

  const positions=[archive.getHongKongPosition(),archive.getCurrentPosition(),archive.isBaselineCoincident()?null:archive.getBaselinePosition()],occupied=[];
  for(let i=0;i<archiveLabels.length;i++){
   const el=archiveLabels[i],link=archiveLinks[i],position=positions[i];if(!position){el.hidden=true;link.style.display='none';continue;}
   const world=earthRoot.localToWorld(position),front=world.clone().normalize().dot(camera.position.clone().sub(world).normalize())>.01,p=world.clone().project(camera);
   const ax=(p.x*.5+.5)*w,ay=(-p.y*.5+.5)*h;
   el.hidden=!front||p.z>1||ax<8||ax>w-8||ay<8||ay>h-8;link.style.display=el.hidden?'none':'';if(el.hidden)continue;
   el.style.maxWidth=Math.max(30,w-16)+'px';
   const bw=Math.min(el.offsetWidth||105,Math.max(30,w-16)),bh=el.offsetHeight||25;
   // Only label boxes move: every leader still starts at its original coordinate.
   const offsets=i===0?[[-bw-12,-48],[-bw-12,12],[12,-48]]:i===1?[[12,12],[12,-bh-12],[-bw-12,12]]:[[12,-bh-16],[-bw-12,-bh-16],[12,12]];
   let best=null;
   for(const [dx,dy]of offsets)for(const shift of [0,-bh-12,bh+12,-2*(bh+12),2*(bh+12)]){
    const cx=Math.max(8,Math.min(w-bw-8,ax+dx)),cy=Math.max(8,Math.min(h-bh-8,ay+dy+shift));
    const overlap=occupied.reduce((sum,box)=>sum+Math.max(0,Math.min(cx+bw+7,box.x+box.w+7)-Math.max(cx,box.x))*Math.max(0,Math.min(cy+bh+7,box.y+box.h+7)-Math.max(cy,box.y)),0);
    const score=overlap*100000+Math.hypot(cx-(ax+offsets[0][0]),cy-(ay+offsets[0][1]));
    if(!best||score<best.score)best={x:cx,y:cy,score};
   }
   const {x,y}=best;
   occupied.push({x,y,w:bw,h:bh});el.style.left=x+'px';el.style.top=y+'px';
   for(const [key,value]of Object.entries({x1:ax,y1:ay,x2:Math.max(x,Math.min(x+bw,ax)),y2:Math.max(y,Math.min(y+bh,ay))}))link.setAttribute(key,value.toFixed(2));
  }
 }
 function renderGeographicCamera(){
  const now=performance.now(),dt=archiveLastFrame?Math.min(.05,(now-archiveLastFrame)/1000):0;archiveLastFrame=now;
  if(!userOrbit)controls.target.lerp(focusTarget,.065);
  if(desiredPosition){
   const from=camera.position.clone().normalize(),to=desiredPosition.clone().normalize(),turn=new THREE.Quaternion().setFromUnitVectors(from,to),step=new THREE.Quaternion().slerp(turn,.065);
   // Capture radius before copy() writes the interpolated unit direction.
   const distance=THREE.MathUtils.lerp(camera.position.length(),desiredPosition.length(),.065);
   camera.position.copy(from.applyQuaternion(step)).multiplyScalar(distance);
   if(camera.position.distanceTo(desiredPosition)<.006){camera.position.copy(desiredPosition);desiredPosition=null;}
   camera.lookAt(controls.target);
  }
  if(autoRotate&&!desiredPosition){camera.position.applyAxisAngle(new THREE.Vector3(0,1,0),dt*.055);camera.lookAt(controls.target);}
  controls.update();
  const cameraDir=camera.position.clone().normalize(),right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
  light.position.copy(cameraDir.clone().multiplyScalar(7).addScaledVector(right,-8).addScaledVector(up,6));fill.position.copy(cameraDir.clone().multiplyScalar(4).addScaledVector(right,6).addScaledVector(up,-2));
  if(syncMode){syncClouds.setLightDirection(earthRoot.worldToLocal(light.position.clone()).normalize());syncClouds.setViewDirection(earthRoot.worldToLocal(camera.position.clone()).normalize());}
 }
 function renderArchive(){
  renderGeographicCamera();liveLabel.hidden=true;
  archive.setCloudDetail?.(syncMode&&(Boolean(recordedFocus?.shot)||camera.position.length()<R+.55));
  // No simulation update: only the original record markers and path are drawn.
  effects.group.visible=false;orbitalGroup.visible=false;hideLegacyLabels();
  scene.updateMatrixWorld();projectArchiveLabels();if(syncMode){syncStations.project(camera,earthRoot,w,h);storyLayer.project(camera,earthRoot,w,h,{cloudArea:projectedCloudShot()});}renderer.render(scene,camera);
 }
 function projectLiveLabel(){
  const selected=liveEvents.getSelection(),position=liveEvents.getSelectedPosition();
  if(!selected||!position){liveLabel.hidden=true;return;}
  const world=earthRoot.localToWorld(position),p=world.clone().project(camera);
  const front=world.clone().normalize().dot(camera.position.clone().sub(world).normalize())>.02;
  const x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;
  liveLabel.hidden=!front||p.z>1||x<8||x>w-8||y<8||y>h-8;if(liveLabel.hidden)return;
  const {event,record}=selected,magnitude=record.magnitude??event.magnitude;
  const title=event.kind==='quake'?('地震'+(Number.isFinite(magnitude)?' · M '+magnitude.toFixed(1):'')):event.kind==='volcano'?'火山 · 报告位置':'风暴 · 报告位置';
  liveLabel.textContent=title+'\n'+record.timeUtc.slice(0,16).replace('T',' ')+' UTC';
  liveLabel.title='来源记录的位置符号；不表示影响范围、喷发柱高度或风场。';
  liveLabel.style.maxWidth=Math.max(30,Math.min(210,w-16))+'px';
  const bw=liveLabel.offsetWidth||175,bh=liveLabel.offsetHeight||36;
  liveLabel.style.left=Math.max(8,Math.min(w-bw-8,x+(x>w*.62?-bw-14:14)))+'px';
  liveLabel.style.top=Math.max(8,Math.min(h-bh-8,y-bh-12))+'px';
 }
 function renderLive(){
  renderGeographicCamera();effects.group.visible=false;orbitalGroup.visible=false;hideLegacyLabels();
  scene.updateMatrixWorld();projectLiveLabel();renderer.render(scene,camera);
 }
 function projectLabels(id,data){
  const worldCamera=camera.position.clone(),occupied=[];
  for(const label of labels){
   const {site,button,link}=label;let anchor=effects.getSitePosition?.(site.id)||latLonToVector(site.lat,site.lon,R+.035);anchor=v3(anchor);earthRoot.localToWorld(anchor);
   const front=anchor.clone().normalize().dot(worldCamera.clone().sub(anchor).normalize())>.045;
   const p=anchor.clone().project(camera),ax=(p.x*.5+.5)*w,ay=(-p.y*.5+.5)*h;
   // The selected process already has a title and its own value annotations.
   // Reserve location callouts for overview so a long leader never crosses it.
   const visible=id==='overview'&&assetLoaded&&front&&p.z<1&&ax>8&&ax<w-8&&ay>12&&ay<h-12;
   button.hidden=!visible;link.style.display=visible?'':'none';if(!visible)continue;
   button.classList.toggle('selected',site.id===id);button.setAttribute('aria-pressed',String(site.id===id));
   button.style.opacity=id==='overview'||site.id===id?'1':'.64';
   const bw=button.offsetWidth||115,bh=button.offsetHeight||30;
   let x=Math.max(8,Math.min(w-bw-8,ax+(ax>w*.53?15:-bw-15))),y=Math.max(12,Math.min(h-bh-20,ay-16));
   if(site.id===id){x=12;y=58;}
   for(let k=0;k<8;k++){if(!occupied.some(b=>x<b.x+b.w+8&&x+bw+8>b.x&&y<b.y+b.h+7&&y+bh+7>b.y))break;y=Math.max(10,Math.min(h-bh-12,y+(k%2===0?-1:1)*(34+k*15)));}
   occupied.push({x,y,w:bw,h:bh});button.style.left=`${x}px`;button.style.top=`${y}px`;
   for(const [key,value]of Object.entries({x1:ax,y1:ay,x2:Math.max(x,Math.min(x+bw,ax)),y2:y+bh/2}))link.setAttribute(key,value.toFixed(2));
  }
  const extra=effects.getAnnotations?.(id,readoutData||data)||[];
  for(let i=0;i<annotations.length;i++){const el=annotations[i],a=extra[i];el.hidden=!a||id==='overview';if(el.hidden)continue;const p=a.position.clone().project(camera);const front=a.position.clone().normalize().dot(camera.position.clone().sub(a.position).normalize())>0;el.hidden=!front||Math.abs(p.x)>.92||Math.abs(p.y)>.85;if(el.hidden)continue;el.textContent=a.text;el.style.color=a.color;el.style.left=Math.max(8,Math.min(w-135,(p.x*.5+.5)*w+8))+'px';el.style.top=Math.max(35,Math.min(h-50,(-p.y*.5+.5)*h-14))+'px';}
  const mp=moon.position.clone().project(camera);
  const moonRay=moon.position.clone().sub(camera.position),moonDistance=moonRay.length();moonRay.normalize();
  const nearest=-camera.position.dot(moonRay);
  const blocked=nearest>0&&nearest<moonDistance&&camera.position.clone().addScaledVector(moonRay,nearest).lengthSq()<R*R;
  moonLabel.hidden=!(orbitalGroup.visible&&!blocked&&mp.z<1&&Math.abs(mp.x)<.91&&Math.abs(mp.y)<.92);
  if(!moonLabel.hidden){moonLabel.style.left=`${Math.max(12,Math.min(w-150,(mp.x*.5+.5)*w-50))}px`;moonLabel.style.top=`${(-mp.y*.5+.5)*h+22}px`;}
 }
 function render(id,data,state){
  if(!dynamicEnabled&&!(archiveEnabled&&syncMode))storyLayer.setVisible(false);
  if(dynamicEnabled){
   if(hungaLayer?.active()){
    hungaLayer.render(w,h);
    earth.material=camera.position.length()<R+.038?hungaOcean:syncBaseMaterial;
    renderer.render(scene,camera);
    return;
   }
   const layer=localLayer();
   if(layer&&dynamicView==='detail')renderLocalCamera();else renderGeographicCamera();
   hideLegacyLabels();liveLabel.hidden=true;scene.updateMatrixWorld();
   if(layer===tideLayer&&tideTeaching.active()){
    const {progress,frame}=tideTeaching.render(camera,w,h,performance.now());
    options.onTideTeachingFrame?.(progress,frame);
   }
   if(layer===riverLayer)riverLayer.project(camera,earthRoot,w,h,{flying:Boolean(localFlight)});
   else if(layer)layer.project(camera,earthRoot,w,h);
   else{
    dynamicLayer.light(light.position,camera.position);
    const viewCard=dynamicLayer.project(camera,earthRoot,w,h);
    storyLayer.project(camera,earthRoot,w,h,{reserved:viewCard?[viewCard]:undefined,cloudArea:projectedCloudShot()});
   }
   renderer.render(scene,camera);
   if(tideArrivalPending){tideArrivalPending=false;options.onTideArrival?.();}
   return;
  }
  if(liveEnabled){renderLive();return;}
  if(archiveEnabled){renderArchive();return;}
  if(id!==current)focus(id);
  if(id==='orbital'&&Math.abs((data.scene.distance??1)-orbitalDistance)>.0001){orbitalDistance=data.scene.distance??1;if(!userOrbit)desiredPosition=homePosition('orbital');}
  const dt=Math.min(.05,Math.max(0,(state.clock||0)-previousClock));previousClock=state.clock||0;
  if(!userOrbit)controls.target.lerp(focusTarget,.065);
  if(desiredPosition){
   const from=camera.position.clone().normalize(),to=desiredPosition.clone().normalize();
   const turn=new THREE.Quaternion().setFromUnitVectors(from,to);
   const step=new THREE.Quaternion().slerp(turn,.065);
   const distance=THREE.MathUtils.lerp(camera.position.length(),desiredPosition.length(),.065);
   camera.position.copy(from.applyQuaternion(step)).multiplyScalar(distance);
   if(camera.position.distanceTo(desiredPosition)<.006){camera.position.copy(desiredPosition);desiredPosition=null;}
   camera.lookAt(controls.target);
  }
  if(autoRotate&&!desiredPosition){camera.position.applyAxisAngle(new THREE.Vector3(0,1,0),dt*.055);camera.lookAt(controls.target);}
  controls.update();
  // Geographic coordinates stay fixed on the Earth; only the observer orbits it.
  effects.group.visible=id!=='orbital';effects.update(id,data,state);
  const cameraDir=camera.position.clone().normalize();
  const cameraRight=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),cameraUp=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
  light.position.copy(cameraDir.clone().multiplyScalar(7).addScaledVector(cameraRight,-8).addScaledVector(cameraUp,6));
  fill.position.copy(cameraDir.clone().multiplyScalar(4).addScaledVector(cameraRight,6).addScaledVector(cameraUp,-2));
  orbitalGroup.visible=id==='orbital';
  if(orbitalGroup.visible){
   const s=id==='orbital'?data.scene:{};
   const angle=s.angle??((state.progress||0)+.2)*TAU,inc=s.inclination??.089,radius=3.15*(s.distance??1);
   // Orbital plane uses Y north, matching the geographic globe. Real distances
   // are intentionally independently scaled to fit this explanatory view.
   const orbitAt=(a,r)=>new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*Math.sin(inc)*r,-Math.sin(a)*Math.cos(inc)*r).applyAxisAngle(new THREE.Vector3(0,1,0),126*Math.PI/180);
   // Solar and lunar directions share the same rotated orbital frame. Earth
   // axes remain fixed here: the geographic view is not a civil-time day map.
   if(id==='orbital')light.position.copy(new THREE.Vector3(Math.cos(s.sunAngle||0)*12,0,-Math.sin(s.sunAngle||0)*12).applyAxisAngle(new THREE.Vector3(0,1,0),126*Math.PI/180));
   moon.position.copy(orbitAt(angle,radius));moon.rotation.y=angle;
   const mdir=moon.position.clone().normalize(),ortho=new THREE.Vector3(0,1,0).cross(mdir).normalize();
   for(let i=0;i<=180;i++){
    const a=i/180*TAU,p=orbitAt(a,radius);orbitPositions.set(p.toArray(),i*3);
    const elongation=.13+.055*(s.tideIndex??1),q=mdir.clone().multiplyScalar(Math.cos(a)*(R+.06+elongation)).addScaledVector(ortho,Math.sin(a)*(R+.04));tidePositions.set(q.toArray(),i*3);
   }
   orbit.geometry.attributes.position.needsUpdate=true;tideRing.geometry.attributes.position.needsUpdate=true;
   tidalA.position.copy(mdir).multiplyScalar(R+.14);tidalB.position.copy(mdir).multiplyScalar(-R-.14);tidalA.setDirection(mdir);tidalB.setDirection(mdir.clone().negate());
   tidalA.visible=tidalB.visible=tideRing.visible=id==='orbital';
  }
  scene.updateMatrixWorld();projectLabels(id,data);renderer.render(scene,camera);
 }
 let archivePointerDown=null;
 canvas.addEventListener('pointerdown',event=>{archivePointerDown=(liveEnabled||archiveEnabled&&!syncMode)&&event.button===0?{x:event.clientX,y:event.clientY,id:event.pointerId}:null;});
 canvas.addEventListener('pointercancel',()=>{archivePointerDown=null;});
 canvas.addEventListener('pointerup',event=>{
  const down=archivePointerDown;archivePointerDown=null;
  if(!(liveEnabled||archiveEnabled&&!syncMode)||!down||event.pointerId!==down.id||Math.hypot(event.clientX-down.x,event.clientY-down.y)>5)return;
  const bounds=canvas.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
  const pointer=new THREE.Vector2((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);
  if(liveEnabled){const id=liveEvents.pick(pointer,camera);if(id!==null){const selection=selectLiveEvent(id);liveOnSelect?.(id,selection);}return;}
  const picked=archive.pick(pointer,camera);
  if(picked===null)return;
  userOrbit=false;setArchiveIndex(picked);options.onArchiveRecord?.(picked);
 });
 return {setObservedStory(story){
  if(localLayer()){localLayer().setAnnotations?.(Boolean(story));return;}
  if(dynamicEnabled)dynamicLayer.setStoryAnnotations?.(Boolean(story));
  if(syncMode)syncStations.setVisible(!story);
  storyVisible=Boolean(story);storyLayer.setStory(story);storyLayer.setVisible(storyVisible&&!hungaLayer?.active());
 },suspendObservedCloudStory(){
  return storyLayer.suspendCloud?.()??false;
 },setDynamicData,setDynamicMode,setDynamicView,setHungaView,setHungaLesson:beat=>hungaLayer?.setLesson(beat),setQuakeGuide:dynamicLayer.setQuakeGuide,setRiverGuide:riverLayer.setGuide,setTideNarrationFocus,setTideTeaching,setTideFlightProgress,releaseTideFlight,setNarrationCameraManual,setRecordedNarrationFocus,
 whenDynamicViewReady:()=>dynamicViewReady,
 getRiverViewEvidence(){
  if(!dynamicEnabled||dynamicData?.kind!=='river')return null;
  const basemapStatus=riverLayer.getBasemapStatus();
  return {view:localFlight?'flight':dynamicView,basemapStatus,basemapDisplayed:!localFlight&&dynamicView==='detail'&&basemapStatus==='ready',
   basemap:BIG_PINEY_GEOGRAPHY.imagery,displayedLabels:riverLayer.getVisibleAnnotations?.()??[]};
 },
 getTideViewEvidence(){
  if(!dynamicEnabled||dynamicData?.kind!=='tide')return null;
  const basemapStatus=tideLayer.getBasemapStatus();
  const basemapDisplayed=basemapStatus==='ready'&&Boolean(localFlight?.detailShown)&&localFlight.arrivalBlend<1;
  return {view:localFlight?'flight':dynamicView,basemapStatus,basemapDisplayed,
   basemap:HARBOR_TIDE_IMAGERY,focus:tideFocus,displayedLabels:tideLayer.getVisibleAnnotations()};
 },
 getBatteryViewEvidence(){
  if(!dynamicEnabled||dynamicData?.kind!=='battery')return null;
  return {view:localFlight?'flight':dynamicView,model:'schematic cylindrical cell',displayedLabels:batteryLayer.getVisibleAnnotations()};
 },
 getDieselViewEvidence(){
  if(!dynamicEnabled||dynamicData?.kind!=='engine')return null;
  return {
   view:localFlight?'flight':dynamicView,
   model:'schematic common-rail diesel cutaway',
   motion:dieselLayer.getMotionEvidence(),
   displayedLabels:dieselLayer.getVisibleAnnotations(),
   displayedChanges:dieselLayer.getVisibleChanges(),
  };
 },
 setDynamicSnapshot(snapshot){
  const result=(localLayer()??dynamicLayer).setSnapshot(snapshot);
  if(result&&dynamicData?.kind==='tide'&&dynamicView==='global'&&!userOrbit&&!narrationCameraManual)positionTideOverview();
  return result;
 },getCloudComparison(){
  if(hungaLayer?.active())return null;
  if(syncMode)return syncClouds.getComparison();
  return dynamicEnabled&&['volcano','storm'].includes(dynamicData?.kind)?dynamicLayer.getCloudComparison():null;
 },setDixieSymbols:dynamicLayer.setFireSymbols,preloadDynamicFrames:frames=>dynamicLayer.preload(frames),setDynamicPresentation:mode=>dynamicLayer.setPresentation(mode),setDynamicRelief:value=>dynamicLayer.setRelief(value),selectDynamicStation,setLiveEvents,setLiveMode,selectLiveEvent,setLiveObservation,setLiveTime,setLiveView,getLiveSelection:()=>liveEvents.getSelection(),setSyncMode,setSyncFrame,setSyncChangeEnabled,setSyncChangeFrame,preloadSyncChange,clearSyncChange(){syncChanges.clear();},setSyncPresentation(mode){syncClouds.setPresentation(mode);},setSyncRelief(enabled){syncClouds.setRelief(enabled);},setSyncStations(stations){syncStations.setStations(stations);syncStations.setVisible(syncMode);},setSyncReadings(readings){syncStations.setReadings(readings);},preloadSyncFrames(frames,bbox,pairs){return syncMode?syncClouds.preload(frames,bbox,pairs).catch(()=>[]):Promise.resolve([]);},ready,resize,render,focus,resetView,setArchiveEvent,setArchiveIndex,setArchiveBaseline,setArchiveMode,setArchiveImagery,setArchiveView,setReadoutData(data){readoutData=data;},setAutoRotate(value){autoRotate=Boolean(value);},getCamera(){return camera;},getRenderer(){return renderer;}};
}
