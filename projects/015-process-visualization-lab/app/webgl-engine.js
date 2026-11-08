import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/environments/RoomEnvironment.js';
import {createOrbital} from './scene-space.js';
import {createVolcano,createQuake,createTyphoon} from './scene-nature.js';
import {createRiver,createBattery} from './scene-systems.js';

const factories={orbital:createOrbital,volcano:createVolcano,quake:createQuake,typhoon:createTyphoon,river:createRiver,battery:createBattery};
export function createEngine(canvas,labelHost,loading){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0x050c15,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x07121e,.014);
 const camera=new THREE.PerspectiveCamera(42,1,.05,180);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.075;controls.enablePan=false;controls.minDistance=3.4;controls.maxDistance=24;controls.minPolarAngle=.12;controls.maxPolarAngle=Math.PI*.79;
 const key=new THREE.DirectionalLight(0xffe5cc,2.0);key.position.set(6,9,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.normalBias=.025;scene.add(key);
 const fill=new THREE.DirectionalLight(0x88bdff,.45);fill.position.set(-7,4,-3);scene.add(fill);
 const hemi=new THREE.HemisphereLight(0xb9d9ff,0x27362d,.35);scene.add(hemi);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();scene.environmentIntensity=.45;
 const starGeo=new THREE.BufferGeometry(),starPos=[];for(let i=0;i<900;i++){const a=i*2.399963,b=Math.acos(1-2*(i+.5)/900),r=45+(i%13);starPos.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a));}starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xc4d8ed,size:.055,sizeAttenuation:true,transparent:true,opacity:.65,depthWrite:false}));scene.add(stars);
 const inset=document.createElement('div');inset.className='phase-inset';inset.innerHTML='<span>从地球看月相</span><small></small>';inset.hidden=true;canvas.parentElement.appendChild(inset);
 const cache=new Map();let active=null,id='',size={w:1,h:1};
 function resetView(){if(!active)return;const v=active.camera||{position:[8,6,10],target:[0,0,0]};camera.up.fromArray(v.up||[0,1,0]);camera.position.fromArray(v.position);controls.target.fromArray(v.target);camera.position.sub(controls.target).multiplyScalar(Math.max(1,Math.min(2.1,1.5/(size.w/size.h)))).add(controls.target);camera.lookAt(controls.target);controls.update();}
 function activate(next){
  if(next===id)return;id=next;if(active)active.group.visible=false;
  if(!cache.has(next)){
   const entry=factories[next]();entry.group.visible=false;scene.add(entry.group);cache.set(next,entry);
   if(entry.ready){entry.loaded=false;entry.ready.then(()=>{entry.loaded=true;if(id===next)loading.hidden=true;}).catch(error=>{entry.error=error;if(id===next){loading.hidden=false;loading.textContent='场景资源加载失败，请刷新重试。';}console.error('Scene asset failed',next,error);});}
  }
  active=cache.get(next);active.group.visible=true;
  loading.textContent=next==='orbital'?'正在加载 NASA 地球模型与月面纹理…':'正在准备三维场景…';loading.hidden=!active.ready||active.loaded;
  const space=next==='orbital';camera.fov=space?36:42;camera.updateProjectionMatrix();key.visible=!space;fill.visible=!space;hemi.intensity=space?.08:.35;scene.environmentIntensity=space?.05:.25;stars.visible=space;scene.fog.density=space?0:.014;
  labelHost.replaceChildren();const lines=document.createElementNS('http://www.w3.org/2000/svg','svg');lines.classList.add('label-lines');labelHost.appendChild(lines);for(const label of active.labels||[]){const el=document.createElement('span');el.className='world-label';el.textContent=label.text;if(label.color)el.style.setProperty('--label-color',label.color);label.el=el;const link=document.createElementNS('http://www.w3.org/2000/svg','line');link.setAttribute('stroke',label.color||'#92bfc4');link.setAttribute('stroke-opacity','.45');link.setAttribute('stroke-width','.7');lines.appendChild(link);label.link=link;labelHost.appendChild(el);}resetView();
 }
 function resize(w,h){size={w:Math.max(1,w),h:Math.max(1,h)};renderer.setSize(size.w,size.h,false);camera.aspect=size.w/size.h;camera.updateProjectionMatrix();if(active)resetView();}
 const vector=new THREE.Vector3();
 function render(next,data,state){
  activate(next);active.update(data,state.progress,state.params,state.clock);controls.update();scene.updateMatrixWorld();
  const placed=[];
  for(const label of active.labels||[]){
   vector.copy(label.position);active.group.localToWorld(vector);vector.project(camera);
   const ax=(vector.x*.5+.5)*size.w,ay=(-vector.y*.5+.5)*size.h;
   const hidden=vector.z>1||vector.z< -1||ax<0||ax>size.w||ay<0||ay>size.h;
   label.el.hidden=hidden;label.link.style.display=hidden?'none':'';if(hidden)continue;
   const bw=label.el.offsetWidth||85,bh=label.el.offsetHeight||23;
   let x=Math.max(bw/2+8,Math.min(size.w-bw/2-8,ax)),y=Math.max(30,Math.min(size.h-32,ay-15));
   for(let tries=0;tries<8;tries++){
    if(!placed.some(b=>Math.abs(x-b.x)<(bw+b.w)/2+9&&Math.abs(y-b.y)<(bh+b.h)/2+7))break;
    y+=tries%2===0?-31:47;x+=tries%2===0?12:-16;y=Math.max(30,Math.min(size.h-32,y));x=Math.max(bw/2+8,Math.min(size.w-bw/2-8,x));
   }
   placed.push({x,y,w:bw,h:bh});label.el.style.left=`${x}px`;label.el.style.top=`${y}px`;
   for(const [key,value]of Object.entries({x1:ax,y1:ay,x2:x,y2:y+bh/2}))label.link.setAttribute(key,String(value));
  }
  renderer.setViewport(0,0,size.w,size.h);renderer.render(scene,camera);inset.hidden=!active.phaseView||!active.loaded;
  if(!inset.hidden){const pv=active.phaseView;inset.querySelector('small').textContent='受光 '+Math.round(data.scene.illumination*100)+'%';const dim=Math.min(112,Math.round(size.w*.22));inset.style.width=(dim+16)+'px';inset.style.height=(dim+42)+'px';renderer.setScissorTest(true);renderer.setScissor(size.w-dim-20,24,dim,dim);renderer.setViewport(size.w-dim-20,24,dim,dim);renderer.setClearColor(0x06101b,1);renderer.clearDepth();renderer.render(pv.scene,pv.camera);renderer.setScissorTest(false);renderer.setViewport(0,0,size.w,size.h);renderer.setClearColor(0x050c15,0);}
 }

 return {resize,render,resetView,renderer};
}
