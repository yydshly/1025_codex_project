import * as T from './vendor/three.module.js';
import {lessons,pageTexture,flapTexture,makeSurface,paperCanvas,tex} from './replica-pages.js';
import {mesh,box,wire,storesScene,rampScene,springScene,storeNames} from './replica-models.js';
import {frameBounds,viewPreset} from './replica-camera.js';
import {BookDirector} from './replica-director.js';
import {storeDescriptions} from './replica-script.js';
import {compressionFor} from './replica-physics.js';
import {readingRegion,readingSections} from './replica-reading.js';
import {ReadingSession} from './replica-reading-session.js';
import {ReadingMagnifier} from './replica-magnifier.js';

const $=s=>document.querySelector(s),canvas=$('#stage'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer,director=null,magnifier=null;const turnWaiters=[];let focusTarget=null,lastContactNotice='';
let magnifierEnabled=true,readingPointer=null,readingPress=null,readingHeld=null,pinnedReading=null,readingCheckTime=0,lastReadingInfo=null,readingSession=null,readingRestoredPanelSize=null;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}catch(error){$('#loading').classList.add('error');$('#loading').innerHTML='<strong>当前环境未能启动 3D 画面</strong><span>请在支持 WebGL 的浏览器中打开。</span><a href="./handbook.html">阅读方法总览</a>';throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.VSMShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
const scene=new T.Scene();scene.background=new T.Color(0xbdb8aa);scene.fog=new T.Fog(0xbdb8aa,35,90);
const camera=new T.PerspectiveCamera(38,1,.1,100),look=new T.Vector3(0,.6,0),goalLook=look.clone(),goalPos=new T.Vector3(0,11.8,13.6);
camera.position.copy(goalPos);camera.lookAt(look);
scene.add(new T.HemisphereLight(0xfffef9,0x737a6f,1.6));
const light=new T.DirectionalLight(0xfffcf5,2.5);light.position.set(-6,11,-5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-11,right:11,top:10,bottom:-10,near:.5,far:35});light.shadow.bias=-.00035;light.shadow.normalBias=.018;light.shadow.radius=4;light.shadow.blurSamples=8;scene.add(light);
const fill=new T.DirectionalLight(0xe7f0ff,.45);fill.position.set(8,6,7);scene.add(fill);
const wood=makeSurface('wood'),cloth=makeSurface('cloth');const floor=mesh(new T.PlaneGeometry(90,90),scene,[0,-.5,0],new T.MeshStandardMaterial({map:wood,bumpMap:wood,bumpScale:.007,roughness:1,color:0xd0d1c9}),false);floor.rotation.x=-Math.PI/2;floor.castShadow=false;wood.repeat.set(7,7);
function roundedSlab(width,depth,height,radius,material,parent,y,z=0){const s=new T.Shape(),x=-width/2,d=-depth/2,r=radius;s.moveTo(x+r,d);s.lineTo(x+width-r,d);s.quadraticCurveTo(x+width,d,x+width,d+r);s.lineTo(x+width,d+depth-r);s.quadraticCurveTo(x+width,d+depth,x+width-r,d+depth);s.lineTo(x+r,d+depth);s.quadraticCurveTo(x,d+depth,x,d+depth-r);s.lineTo(x,d+r);s.quadraticCurveTo(x,d,x+r,d);const g=new T.ExtrudeGeometry(s,{depth:height,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.014,bevelThickness:.012,curveSegments:8});const m=mesh(g,parent,[0,y,z],material,false);m.rotation.x=-Math.PI/2;return m;}
cloth.repeat.set(.19,.26);
const mat=roundedSlab(16.8,11.7,.055,.3,new T.MeshStandardMaterial({map:cloth,bumpMap:cloth,bumpScale:.025,roughness:1,color:0xe1e7e5}),scene,-.46,.2);
const book=new T.Group();book.position.y=-.12;scene.add(book);
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=512;shadowCanvas.height=512;const sc=shadowCanvas.getContext('2d');sc.shadowColor='#000';sc.shadowBlur=28;sc.fillStyle='#0008';sc.fillRect(60,80,390,350);const contact=new T.Mesh(new T.PlaneGeometry(14,10.3),new T.MeshBasicMaterial({map:tex(shadowCanvas),transparent:true,opacity:.32,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.set(.2,-.386,.2);scene.add(contact);
roundedSlab(12.12,8.15,.12,.09,new T.MeshStandardMaterial({color:0xb4a34a,roughness:.88}),book,-.21);
box(book,[.28,.27,8.1],[0,-.07,0],new T.MeshStandardMaterial({color:0x8e8357,roughness:1}));
const paperMat=new T.MeshStandardMaterial({color:0xf3f0df,roughness:1});
const ribbonGeometry=new T.PlaneGeometry(.16,8.7,2,70);ribbonGeometry.rotateX(-Math.PI/2);const ribbonPositions=ribbonGeometry.attributes.position;for(let i=0;i<ribbonPositions.count;i++){const z=ribbonPositions.getZ(i);ribbonPositions.setY(i,.34-.53*T.MathUtils.smoothstep(z,3.76,4.22));}ribbonGeometry.computeVertexNormals();const ribbon=mesh(ribbonGeometry,book,[0,0,.04],new T.MeshStandardMaterial({color:0x233750,roughness:.86,side:T.DoubleSide}),false);
const W=5.8,D=7.8,baseY=.22;
function pageHeight(x,z){const u=x<0?(x+W)/(W-.075):(x-.075)/(W-.075),v=z/D+.5;return baseY+.17*Math.sin(u*Math.PI)+.15*Math.exp(-Math.abs(x)*5)+.03*Math.cos(v*Math.PI*2)+.13*Math.pow(Math.abs(x)/W,12)*Math.pow(Math.abs(z)/(D/2),8);}
function paperPatch(cx,cz,lift,anchor=0){const g=new T.PlaneGeometry(3.65,1.05,32,10);g.rotateX(-Math.PI/2);const a=g.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,pageHeight(cx+a.getX(i),cz+a.getZ(i))+lift-anchor);g.computeVertexNormals();return g;}
function pageGeometry(side){const n=64,m=24,positions=[],uvs=[],indices=[];for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){const u=i/n,v=j/m,x=(side==='left'?-W:.075)+u*(W-.075),z=(v-.5)*D;const y=pageHeight(x,z);positions.push(x,y,z);uvs.push(u,1-v);if(i<n&&j<m){const a=j*(n+1)+i;indices.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;}
// The complete page block follows the upper sheet, including its outer and back edges.
const edgeCanvas=document.createElement('canvas');edgeCanvas.width=512;edgeCanvas.height=512;const edgeContext=edgeCanvas.getContext('2d');edgeContext.fillStyle='#eee9d9';edgeContext.fillRect(0,0,512,512);for(let i=0;i<32;i++){edgeContext.strokeStyle=i%3?'#a39c8166':'#a0977d88';edgeContext.lineWidth=i%4===0?1.3:.65;edgeContext.beginPath();edgeContext.moveTo(0,i*16);for(let x=0;x<=512;x+=16)edgeContext.lineTo(x,i*16+Math.sin(x*.017+i*1.7)*.8);edgeContext.stroke();}const edgeTexture=tex(edgeCanvas);edgeTexture.wrapS=T.RepeatWrapping;edgeTexture.repeat.x=3;
for(const side of ['left','right']){
 const surface=pageGeometry(side),a=surface.attributes.position,points=[],indices=[],uvs=[],perimeter=[];
 for(let i=0;i<=64;i++)perimeter.push(i);for(let j=1;j<=24;j++)perimeter.push(j*65+64);for(let i=63;i>=0;i--)perimeter.push(24*65+i);for(let j=23;j>=0;j--)perimeter.push(j*65);
 perimeter.forEach((k,i)=>{const x=a.getX(k),y=a.getY(k)-.009,z=a.getZ(k);points.push(x*.998,-.08,z*.998,x,y,z);uvs.push(i/perimeter.length,0,i/perimeter.length,1);if(i<perimeter.length-1){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}});
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();mesh(geometry,book,[0,0,0],new T.MeshStandardMaterial({map:edgeTexture,roughness:1,side:T.DoubleSide}),false);
 for(let layer=1;layer<18;layer++){const edge=wire(book,perimeter.map(k=>[a.getX(k)*1.0002,-.08+(a.getY(k)+.072)*layer/18,a.getZ(k)*1.0002]),0xa4a08f);edge.material.opacity=.3;}
 surface.dispose();
}
let current=1,turn=null,flapOpen=false,flapAngle=0,paused=reduced,watching=false,watchTime=0,clockTime=0,active=null,hovered=null,drag=null;
let viewMode=innerWidth<650?'experiment':'overview',turnView=viewMode,watchReturn=viewMode,viewOffset=0,goalViewOffset=0,viewOffsetX=0,goalViewOffsetX=0;
const state=Array.from({length:4},()=>({prediction:-1,complete:false,seen:new Set()})),textures=new Map();
function getPage(i,side,force=false){const key=i+'-'+side;if(force&&textures.has(key)){textures.get(key).dispose();textures.delete(key);}if(!textures.has(key))textures.set(key,pageTexture(i,side,state[i]));return textures.get(key);}
await Promise.all([document.fonts.load('400 32px SourceSerif'),document.fonts.load('400 32px Caveat')]);
const left=mesh(pageGeometry('left'),book,[0,0,0],new T.MeshStandardMaterial({map:getPage(1,'left'),roughness:1,side:T.DoubleSide}),false),right=mesh(pageGeometry('right'),book,[0,0,0],new T.MeshStandardMaterial({map:getPage(1,'right'),roughness:1,side:T.DoubleSide}),false);left.position.set(0,0,0);right.position.set(0,0,0);left.castShadow=right.castShadow=false;
const pop=new T.Group();pop.position.y=.3;book.add(pop);const models=[null,storesScene(pop,action),rampScene(pop,action),springScene(pop,action)];models.forEach((m,i)=>{if(m)m.root.visible=i===current;});models[1].root.position.z=.7;active=models[current];
const flap=new T.Group();flap.position.set(-4.15,.38,2.35);book.add(flap);const flapSheet=mesh(paperPatch(-2.325,2.875,.022,.38),flap,[1.825,0,.525],new T.MeshStandardMaterial({map:flapTexture(false),side:T.FrontSide,roughness:1}),false);const flapBack=new T.Mesh(flapSheet.geometry,new T.MeshStandardMaterial({color:0xf0ead6,side:T.BackSide,roughness:1}));flapSheet.add(flapBack);
const answer=mesh(paperPatch(-2.325,2.875,.006),book,[-2.325,0,2.875],new T.MeshStandardMaterial({map:flapTexture(true,1),roughness:1}),false);answer.castShadow=false;flap.userData={label:'掀开纸片，查看解释',action:()=>toggleFlap()};
const leaf=new T.Group();book.add(leaf);leaf.visible=false;const leafGeo=pageGeometry('right'),leafOriginal=leafGeo.attributes.position.array.slice();const leafFront=mesh(leafGeo,leaf,[0,0,0],new T.MeshStandardMaterial({map:getPage(1,'right'),side:T.FrontSide,roughness:1}),false);leafFront.position.set(0,0,0);const leafBack=new T.Mesh(leafGeo,new T.MeshStandardMaterial({side:T.BackSide,roughness:1}));leaf.add(leafBack);
// The reverse face has its own UVs so printed text is not mirrored after landing.
leafBack.geometry=leafGeo.clone();const backUv=leafBack.geometry.attributes.uv;for(let i=0;i<backUv.count;i++)backUv.setX(i,1-backUv.getX(i));leafBack.castShadow=true;
function setLeaf(p,forward=true){const a=leafGeo.attributes.position,b=leafBack.geometry.attributes.position;const progress=forward?p:1-p,bend=Math.sin(Math.PI*progress),k=1.2*bend/W;for(let i=0;i<a.count;i++){const x=leafOriginal[i*3],z=leafOriginal[i*3+2],u=x/W;const angle=Math.PI*progress-k*W*.5+z*.018*bend;const along=k>.0001?Math.sin(k*x)/k:x,lift=k>.0001?(1-Math.cos(k*x))/k:0;const xx=along*Math.cos(angle)-lift*Math.sin(angle),yy=baseY+.08+along*Math.sin(angle)+lift*Math.cos(angle)+.035*bend*Math.sin(z*1.2)*u;const zz=z+bend*.065*Math.sin(z)*u;a.setXYZ(i,xx,yy,zz);b.setXYZ(i,xx,yy-.006,zz);}a.needsUpdate=b.needsUpdate=true;leafGeo.computeVertexNormals();leafBack.geometry.computeVertexNormals();}
function updatePages(i){left.material.map=getPage(i,'left');right.material.map=getPage(i,'right');flap.visible=answer.visible=i>0;answer.material.map.dispose();answer.material.map=flapTexture(true,Math.max(1,i));flapOpen=false;flapAngle=0;flap.rotation.x=0;}
function go(i,internal=false){if(turn||i<0||i>3||i===current)return;hideReading();if(!internal&&director?.visible)director.stop();$('#tooltip').classList.remove('visible');$('#context-hint').hidden=true;watching=false;watchTime=0;turnView=viewMode==='detail'?'experiment':viewMode;applyFrame(frameBounds(camera,[-6.15,-.32,-4.15],[6.15,5.9,4.22],[-.4,1.02,1.38],{width:innerWidth,height:innerHeight},{top:55,bottom:88,side:30,...guideMargins()}));const from=current,forward=i>from;turn={from,to:i,time:0,forward,swapped:false};leafFront.material.map=getPage(forward?from:i,'right');leafBack.material.map=getPage(forward?i:from,'left');leaf.visible=false;$('#stage').dataset.turning='true';syncControls(true);}
function completeTurn(){current=turn.to;models.forEach((m,i)=>{if(m){m.root.visible=i===current;m.root.scale.set(1,1,1);}});active=models[current];updatePages(current);leaf.visible=false;turn=null;canvas.dataset.turnPhase='idle';setView(current===0?'overview':turnView);$('#stage').dataset.turning='false';syncControls();turnWaiters.splice(0).forEach(resolve=>resolve());}
function toggleFlap(){if(!current||turn)return;hideReading();flapOpen=!flapOpen;$('#stage').dataset.flap=String(flapOpen);announce(flapOpen?lessons[current].answer:'已合上解释纸片');syncRead();}
function action(type,index,internal=false){if(turn)return;watching=false;if(type==='store'){state[1].seen.add(index);state[1].complete=state[1].seen.size===8;active.pour(index);active.jars[index].set(.55,'已识别');if(!director?.active){$('#context-hint').hidden=false;$('#context-hint').textContent=storeNames[index]+' · '+storeDescriptions[index];}left.material.map=getPage(1,'left',true);announce(storeNames[index]+'能量瓶已点亮。'+state[1].seen.size+'/8');syncRead();}if(type==='release'&&current>1){lastContactNotice='';active.release();paused=false;$('#still').setAttribute('aria-pressed','false');$('#still').setAttribute('aria-label','暂停场景运动');announce('实验开始');if(current===3&&!director?.active){$('#context-hint').hidden=false;$('#context-hint').textContent=active.snapshot().canLaunch?'弹簧先在槽内推球，离口后按抛体轨迹运动。':'这次压缩不足以直接离口飞出。小球会在导槽或槽口往返；增大压缩量，再比较。';}}}
function announce(s){$('#sr-status').textContent=s;}
function applyFrame(view){goalLook.copy(view.target);goalPos.copy(view.position);goalViewOffset=view.offsetY;goalViewOffsetX=view.offsetX||0;}
function syncViews(){canvas.dataset.view=viewMode;document.querySelectorAll('[data-view]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.view===viewMode));b.disabled=!!turn||!!director?.active||(b.dataset.view==='experiment'&&!current);});}
function composeView(mode){applyFrame(viewPreset(mode,current,camera,innerWidth,innerHeight,guideMargins()));syncViews();}
function setView(mode){if(turn)return;hideReading();$('#tooltip').classList.remove('visible');viewMode=mode;watching=false;watchTime=0;composeView(mode);syncExperiment();syncWatch();if(current!==undefined)$('#where').innerHTML=`<b>${current||''}</b>${lessons[current].en}`;}
function resetView(){if(director?.active){guideShot(director.cue?.shot||director.step.shot);return;}setView('overview');}
function focusAt(p,type=0){const extent=current===1?new T.Vector3(1.25,.15,1.05):new T.Vector3(2.3,.6,1.5);const min=p.clone().sub(extent),max=p.clone().add(new T.Vector3(extent.x,current===1?1.35:1.65,extent.z));applyFrame(frameBounds(camera,min.toArray(),max.toArray(),type===1?[.5,.75,1.35]:[.1,1,1.35],{width:innerWidth,height:innerHeight},{top:70,bottom:innerWidth<650?170:145,side:innerWidth<650?30:110}));}
function syncWatch(){syncInteractionMode();$('#where').innerHTML=`<b>${current||''}</b>${lessons[current].en}`;const playing=director?.active&&!director?.paused;$('#watch').setAttribute('aria-label',director?.active?(playing?'暂停有声导览':'继续有声导览'):'开始有声导览');$('#watch').setAttribute('title','有声导览');$('#watch').setAttribute('aria-pressed',String(playing));$('#watch').innerHTML=playing?'<svg viewBox="0 0 24 24"><path d="M8 6v12M16 6v12"/></svg>':'<svg viewBox="0 0 24 24"><path d="m8 5 10 7-10 7Z"/></svg>';}

function syncControls(busy=false){$('#text-zoom').disabled=busy||current===0;syncTextZoom();$('#where').innerHTML=`<b>${current||''}</b>${lessons[current].en}`;$('#previous').disabled=busy||current===0;$('#next').disabled=busy||current===3;$('#contents').disabled=busy;$('#watch').disabled=busy||current===0;$('#stage').dataset.chapter=String(current);$('#mobile-read').textContent=current?`${current}. ${lessons[current].title}　▴`:'目录与阅读　▴';syncWatch();syncViews();syncRead();syncExperiment();}
function syncExperiment(){const el=$('#experiment');el.hidden=current<2||!!turn||viewMode==='reading'||!!director?.active;if(el.hidden)return;const v=Math.round(current===2?active.start/2*100:active.start*100);el.innerHTML=`<label>${current===2?'起始高度':'压缩量'} <input id="amount" aria-label="${current===2?'起始高度':'压缩量'}" type="range" min="15" max="100" value="${v}"></label><output id="amount-value">${current===2?(active.snapshot().initialHeight.toFixed(2)+' m'):(compressionFor(active.start).toFixed(3)+' m')}</output>${current===2?`<label><input id="friction" type="checkbox" ${active.friction?'checked':''}>滚动耗散</label>`:''}<button id="release">松开</button>`;
 $('#amount').oninput=e=>{const n=Number(e.target.value);active.start=current===2?n/50:n/100;active.running=false;active.elapsed=0;active.prepare();lastContactNotice='';$('#context-hint').hidden=true;$('#amount-value').textContent=current===2?active.snapshot().initialHeight.toFixed(2)+' m':compressionFor(active.start).toFixed(3)+' m';watching=false;syncWatch();};$('#release').onclick=()=>action('release');if(current===2)$('#friction').onchange=e=>{active.friction=e.target.checked;};}
function syncRead(){const panel=$('#read-panel'),d=lessons[current];panel.innerHTML=current===0?`<h2>能量之书</h2><p>三维书页与实验装置，按顺序逐页展开。</p>${lessons.slice(1).map((l,i)=>`<button data-page="${i+1}">${i+1}. ${l.title}</button>`).join('')}`:`<h2>${current}. ${d.title}</h2><p>${d.intro.join('')}</p><p><strong>${d.formula}</strong><br>${d.sub}</p><p>${d.question}</p>${d.options.map((s,i)=>`<button data-predict="${i}" class="${state[current].prediction===i?'active':''}">${s}</button>`).join('')}<p><button id="read-flap">${flapOpen?'合上解释':'掀开解释'}</button></p>${flapOpen?`<p>${d.answer}</p>`:''}<p>${d.instruction}</p>${current===1?storeNames.map((s,i)=>`<button data-store="${i}" class="${state[1].seen.has(i)?'active':''}">${s}</button>`).join(''):''}`;
 panel.insertAdjacentHTML('beforeend',`<p class="note">${current===1?'静态物品是能量类型图例，未测量的物品不填写焦耳数。':current===2?'模型：0.50 kg 均匀实心球，无滑动滚动；动能包含转动。耗散开关施加速度正比阻力，不把理想静摩擦当作损失。重力势能零点取球心最低处。':current===3?'模型：0.060 kg 质点、14 N/m 理想弹簧、无摩擦导槽，离口后忽略空气阻力；接触导槽、底座和软垫分别判定。势能零点取球静置在底座时，软垫接触后仍保留高度势能；接触法向速度损失转内能，声音未单独建模。':'三个场景：类型、滚动、弹簧发射。'}</p><p class="note"><a href="../research/physics-models.md" target="_blank">模型与物理依据</a></p><p class="note"><a href="./seed-book.html">之前的主题书</a> · <a href="./handbook.html">方法总览</a></p>`);panel.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>go(Number(b.dataset.page)));panel.querySelectorAll('[data-predict]').forEach(b=>b.onclick=()=>predict(Number(b.dataset.predict)));panel.querySelectorAll('[data-store]').forEach(b=>b.onclick=()=>action('store',Number(b.dataset.store)));if($('#read-flap'))$('#read-flap').onclick=toggleFlap;
}
function predict(i){if(!lessons[current]?.options?.[i])return;state[current].prediction=i;left.material.map=getPage(current,'left',true);syncRead();announce('已记录预测：'+lessons[current].options[i]);}
function closeReadPanel(){$('#read-panel').hidden=true;$('#read').setAttribute('aria-expanded','false');}
function toggleRead(){hideReading();if(director?.visible)director.stop();const panel=$('#read-panel');panel.hidden=!panel.hidden;$('#read').setAttribute('aria-expanded',String(!panel.hidden));document.body.dataset.mode=panel.hidden?'explore':'reading';}
$('#contents').onclick=()=>go(0);$('#previous').onclick=()=>go(current-1);$('#next').onclick=()=>go(current+1);$('#reset-view').onclick=resetView;$('#read').onclick=toggleRead;$('#mobile-read').onclick=toggleRead;
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('#still').onclick=()=>{if(readingSession?.active){magnifier.close();return;}if(director?.active){director.togglePause();return;}paused=!paused;$('#still').setAttribute('aria-pressed',String(paused));$('#still').setAttribute('aria-label',paused?'继续场景运动':'暂停场景运动');};
$('#watch').onclick=()=>{if(readingSession?.active){magnifier.close();return;}if(director.active)director.togglePause();else director.start(true);};
$('#text-zoom').onclick=()=>toggleTextZoom(true);

document.addEventListener('keydown',e=>{if(magnifier?.containsTarget(e.target))return;if(e.key==='Escape'&&magnifier?.visible){e.preventDefault();magnifier.close();return;}if(e.target.matches('input,textarea,select')||(!$('#read-panel').hidden&&$('#read-panel').contains(e.target)))return;if(e.key.toLowerCase()==='m'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();toggleTextZoom(true);return;}if(e.key==='ArrowRight'){e.preventDefault();go(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(current-1);}if(e.key==='Escape'){resetView();$('#read-panel').hidden=true;$('#read').setAttribute('aria-expanded','false');}if(e.code==='Space'&&e.target===canvas){e.preventDefault();$('#watch').click();}});
const ray=new T.Raycaster(),pointer=new T.Vector2(),touches=new Map();let pinch=null;
function cameraInputAllowed(){return !turn&&(!director?.active||(!director.loading&&(director.paused||director.holdPhysics)));}
function syncInteractionMode(){const allowed=cameraInputAllowed();document.body.dataset.camera=allowed?'free':'guided';canvas.style.cursor=allowed?'grab':'default';$('#tooltip').classList.remove('visible');}
function clearPointerGesture(){hideReading();for(const id of touches.keys())if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);touches.clear();drag=null;pinch=null;canvas.classList.remove('dragging');$('#tooltip').classList.remove('visible');}
function beginCameraInput(){if(!cameraInputAllowed())return false;if(director?.active&&director.holdPhysics&&!director.paused)director.togglePause();return true;}

function syncTextZoom(){const held=Boolean(readingSession?.active);$('#watch').disabled=held||Boolean(turn)||current===0;$('#still').disabled=held;const button=$('#text-zoom');button.setAttribute('aria-pressed',String(held));button.setAttribute('aria-expanded',String(Boolean(readingSession?.active)));button.setAttribute('title',readingSession?.active?'返回刚才的讲解或实验（Esc）':'固定当前文字并连续阅读（M）；移到文字可局部放大');}
function cancelReadingPress(){if(readingPress?.timer)clearTimeout(readingPress.timer);readingPress=null;}
function syncStill(){const frozen=director?.active?director.paused:paused;$('#still').setAttribute('aria-pressed',String(frozen));$('#still').setAttribute('aria-label',frozen?'继续场景运动':'暂停场景运动');}
readingSession=new ReadingSession({
 capture:()=>({chapter:current,paused,watching,watchTime,guideActive:Boolean(director?.active),guidePaused:Boolean(director?.paused),token:director?.token,clip:director?.clipToken,viewMode,position:camera.position.clone(),look:look.clone(),goalPosition:goalPos.clone(),goalLook:goalLook.clone(),offset:viewOffset,offsetX:viewOffsetX,goalOffset:goalViewOffset,goalOffsetX:goalViewOffsetX,width:innerWidth,height:innerHeight,focus:document.activeElement,panelSize:{width:$('#director').getBoundingClientRect().width,height:$('#director').getBoundingClientRect().height}}),
 pause:()=>{paused=true;watching=false;if(director?.active&&!director.paused)director.setPaused(true);goalPos.copy(camera.position);goalLook.copy(look);goalViewOffset=viewOffset;goalViewOffsetX=viewOffsetX;document.body.dataset.reading='pinned';closeReadPanel();document.body.dataset.mode=director?.active?'guide':'explore';$('#tooltip').classList.remove('visible');syncStill();syncExperiment();},
 release:context=>{paused=context.paused;readingRestoredPanelSize=context.panelSize;delete document.body.dataset.reading;syncStill();syncExperiment();},
 isCurrent:context=>context.chapter===current&&context.guideActive===Boolean(director?.active)&&(!context.guideActive||(context.token===director.token&&context.clip===director.clipToken)),
 restore:context=>{
  if(context.guideActive)director.setPaused(context.guidePaused||document.hidden);
  watching=context.watching;watchTime=context.watchTime;viewMode=context.viewMode;
  if(context.width===innerWidth&&context.height===innerHeight){camera.position.copy(context.position);look.copy(context.look);goalPos.copy(context.goalPosition);goalLook.copy(context.goalLook);viewOffset=context.offset;viewOffsetX=context.offsetX;goalViewOffset=context.goalOffset;goalViewOffsetX=context.goalOffsetX;}
  else if(director?.active)guideShot(director.cue?.shot||director.step.shot);else composeView(viewMode==='detail'?'experiment':viewMode);
  syncViews();syncExperiment();syncWatch();syncStill();
 }
});
function hideReading({restore=false,focus=false}={}){
 const context=readingSession?.context;
 cancelReadingPress();readingHeld=null;readingPointer=null;pinnedReading=null;lastReadingInfo=null;magnifier?.hide({force:true});
 readingSession?.finish({restore});delete document.body.dataset.reading;syncTextZoom();
 if(focus){const target=context?.focus;const visible=target?.isConnected&&target.getClientRects().length;((visible&&target!==document.body)?target:$('#text-zoom')).focus({preventScroll:true});}
}
function readingInfo(e){
 pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);ray.setFromCamera(pointer,camera);
 const hits=ray.intersectObjects([left,right,...(flap.visible?[flap]:[]),...(active?[active.root]:[])],true);
 const hit=hits.find(({object})=>{for(let node=object;node;node=node.parent)if(!node.visible)return false;return true;});
 if(!hit?.uv)return null;
 let target=hit.object;for(let node=target;node;node=node.parent)if(node===flap){target=flap;break;}
 const surface=target===flap?'flap':target===left||target===right?'page':'object';
 const side=target===right?'right':'left';
 const region=readingRegion({chapter:current,side,u:hit.uv.x,v:hit.uv.y,lesson:lessons[current],surface,flapOpen,prediction:state[current].prediction,complete:state[current].complete});
 return region?{region,point:hit.point.clone(),chapter:current}:null;
}
function readingAllowed(){return magnifierEnabled&&current>0&&!turn&&cameraInputAllowed()&&$('#read-panel').hidden;}
function readingList(){return readingSections({chapter:current,lesson:lessons[current],flapOpen,prediction:state[current].prediction,complete:state[current].complete});}
function sectionInfo(section){const x=(section.side==='right'?.075:-W)+section.u*(W-.075),z=(.5-section.v)*D;return {region:section.region,point:book.localToWorld(new T.Vector3(x,pageHeight(x,z),z)),chapter:current};}
function renderPinnedReading(){
 if(!pinnedReading)return;
 const list=readingList(),matched=list.findIndex(item=>item.region.key===pinnedReading.region.key),explanation=pinnedReading.region.region.startsWith('explanation')?list.findIndex(item=>item.label==='解释'):-1,index=Math.max(0,matched<0?explanation:matched),entry=list[index];if(!entry)return;
 pinnedReading.region=entry.region;
 const p=pinnedReading.point.clone().project(camera),context=readingSession.context;
 const returnLabel=context?.guideActive?(context.guidePaused?'返回已暂停的讲解':'继续刚才的讲解'):(context?.paused?'返回已暂停的实验':'返回实验');
 magnifier.show({x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight,region:entry.region,pin:true,navigation:{index,total:list.length,items:list.map(item=>({key:item.region.key,label:item.label}))},returnLabel});
 syncTextZoom();
}
function pinReading(info){
 if(!info||turn||director?.loading)return false;
 readingSession.begin();magnifierEnabled=true;readingPointer=null;pinnedReading=info;renderPinnedReading();return true;
}
function selectReadingSection(key){if(!readingSession.active)return;const section=readingList().find(item=>item.region.key===key);if(section){pinnedReading=sectionInfo(section);renderPinnedReading();}}
function navigateReading(delta){const list=readingList(),index=list.findIndex(item=>item.region.key===pinnedReading?.region.key),next=list[index+delta];if(next)selectReadingSection(next.region.key);}
function showReadingAt(e,pin=false){
 if(!readingAllowed()){if(!magnifier?.pinned)hideReading();return false;}
 if(magnifier?.pinned&&!pin)return false;
 const info=readingInfo(e);if(!info){magnifier?.hide();readingPointer=null;return false;}
 lastReadingInfo=info;
 if(pin)return pinReading(info);
 readingPointer={clientX:e.clientX,clientY:e.clientY};magnifier.show({x:e.clientX,y:e.clientY,region:info.region});$('#tooltip').classList.remove('visible');canvas.style.cursor='zoom-in';return true;
}
function beginReadingPress(e){
 hideReading();if(!readingAllowed()||!['touch','pen'].includes(e.pointerType)||touches.size!==1||!readingInfo(e))return;
 const press={id:e.pointerId,x:e.clientX,y:e.clientY};
 press.timer=setTimeout(()=>{if(readingPress!==press||touches.size!==1||!readingAllowed())return;if(showReadingAt({clientX:press.x,clientY:press.y},true)){readingHeld=press.id;drag=null;pinch=null;canvas.classList.remove('dragging');}},460);
 readingPress=press;
}
function moveReadingPress(e){
 if(readingHeld===e.pointerId){e.preventDefault();showReadingAt(e,true);return true;}
 if(readingPress?.id===e.pointerId&&Math.hypot(e.clientX-readingPress.x,e.clientY-readingPress.y)>8)cancelReadingPress();
 return false;
}
function finishReadingPress(e){const consumed=readingHeld===e.pointerId;cancelReadingPress();readingHeld=null;return consumed;}
function toggleTextZoom(pin=false){
 if(turn||!current||director?.loading)return;
 if(magnifier.pinned){magnifier.close();return;}
 if(!pin){magnifierEnabled=!magnifierEnabled;hideReading();syncTextZoom();announce(magnifierEnabled?'文字放大镜已开启，移到书页文字即可查看。':'文字放大镜已关闭');return;}
 const first=readingList()[0];if(!first)return;const info=lastReadingInfo?.chapter===current?lastReadingInfo:sectionInfo(first);
 pinReading(info);announce('已固定当前段落。可切换上一段、下一段，Esc返回刚才的讲解或实验。');
}
function refreshReading(now){
 if(!magnifier?.visible||now-readingCheckTime<90)return;readingCheckTime=now;
 if(!readingAllowed()){hideReading();return;}
 if(magnifier.pinned)renderPinnedReading();else if(readingPointer)showReadingAt(readingPointer);
}
magnifier=new ReadingMagnifier({source:canvas,getAvoidRects:()=>['#toolbar','#view-presets','#director','#read-panel','#experiment','#mobile-read'].map(selector=>$(selector)).filter(el=>el&&!el.hidden&&getComputedStyle(el).display!=='none').map(el=>el.getBoundingClientRect()),onNavigate:navigateReading,onSelect:selectReadingSection,onClose:()=>hideReading({restore:true,focus:true})});
function pick(e){pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);ray.setFromCamera(pointer,camera);const roots=[left,right,...(flap.visible?[flap]:[]),...(active?[active.root]:[])];const hits=ray.intersectObjects(roots,true);for(const hit of hits){let obj=hit.object;while(obj){if(obj.userData.action)return{...hit,target:obj};obj=obj.parent;}if(hit.object===left||hit.object===right)return{...hit,target:hit.object};}return null;}
function pageHit(hit){if(hit.target===right&&current===0){const y=(1-hit.uv.y)*1500;const page=Math.round((y-415)/170)+1;if(page>=1&&page<=3)go(page);}else if(hit.target===left&&current>0){const y=(1-hit.uv.y)*1500,x=hit.uv.x*1100;if(x>310&&y>1048&&y<1200)predict(Math.floor((y-1050)/48));}}
canvas.addEventListener('pointerdown',e=>{if(e.button>0||!beginCameraInput())return;canvas.setPointerCapture(e.pointerId);touches.set(e.pointerId,new T.Vector2(e.clientX,e.clientY));beginReadingPress(e);if(touches.size===2){hideReading();const [a,b]=[...touches.values()];pinch={distance:a.distanceTo(b),length:goalPos.distanceTo(goalLook)};drag=null;watching=false;syncWatch();return;}const hit=paused||director?.active?null:pick(e);drag={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false,hit,model:hit?.target.userData.draggable,start:active?.start};watching=false;syncWatch();});
canvas.addEventListener('pointermove',e=>{if(!cameraInputAllowed()){clearPointerGesture();return;}if(touches.has(e.pointerId))touches.set(e.pointerId,new T.Vector2(e.clientX,e.clientY));if(moveReadingPress(e))return;if(pinch&&touches.size===2){const [a,b]=[...touches.values()],distance=Math.max(1,a.distanceTo(b)),offset=goalPos.clone().sub(goalLook);offset.setLength(T.MathUtils.clamp(pinch.length*pinch.distance/distance,4.5,42));goalPos.copy(goalLook).add(offset);viewMode='detail';syncViews();return;}if(drag){if(paused||director?.active){drag.model=null;drag.hit=null;}const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;drag.lastX=e.clientX;drag.lastY=e.clientY;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5){drag.moved=true;hideReading();canvas.classList.add('dragging');}if(drag.model&&active){if(current===2){pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);ray.setFromCamera(pointer,camera);const point=ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,0,1),-1.25),new T.Vector3());if(point){const x=T.MathUtils.clamp(point.x-3.05,-2,2);active.setFromCenterX(x);}}else active.start=T.MathUtils.clamp(drag.start-(e.clientX-drag.x)*.004+(e.clientY-drag.y)*.006,.15,1);active.running=false;active.elapsed=0;}else if(drag.moved){const offset=goalPos.clone().sub(goalLook),s=new T.Spherical().setFromVector3(offset);s.theta=T.MathUtils.clamp(s.theta-dx*.004,-.68,.68);s.phi=T.MathUtils.clamp(s.phi+dy*.003,viewMode==='reading'?.24:.43,1.15);goalPos.copy(goalLook).add(new T.Vector3().setFromSpherical(s));}return;}if(paused||director?.active){if(showReadingAt(e))return;$('#tooltip').classList.remove('visible');canvas.style.cursor='grab';return;}const h=pick(e);if(showReadingAt(e))return;hovered=h?.target;const label=hovered?.userData.label;$('#tooltip').classList.toggle('visible',!!label);if(label){$('#tooltip').textContent=label;$('#tooltip').style.left=Math.min(e.clientX+14,innerWidth-210)+'px';$('#tooltip').style.top=Math.max(10,e.clientY-35)+'px';}canvas.style.cursor=label?'pointer':'grab';});
canvas.addEventListener('pointerup',e=>{touches.delete(e.pointerId);canvas.classList.remove('dragging');if(finishReadingPress(e)){drag=null;pinch=null;return;}if(pinch){pinch=null;drag=null;return;}if(!drag)return;const inspect=e.pointerType==='mouse'&&!drag.moved;if(!paused&&!director?.active){if(drag.model&&drag.moved){action('release');syncExperiment();}else if(!drag.moved&&drag.hit){if(drag.hit.target.userData.action)drag.hit.target.userData.action();else pageHit(drag.hit);}}drag=null;if(inspect)showReadingAt(e);});canvas.addEventListener('pointercancel',()=>{hideReading();drag=null;pinch=null;touches.clear();canvas.classList.remove('dragging');});canvas.addEventListener('pointerleave',()=>{$('#tooltip').classList.remove('visible');readingPointer=null;cancelReadingPress();magnifier?.hide();});
canvas.addEventListener('contextmenu',e=>{if(magnifier?.pinned||readingPress)e.preventDefault();});
canvas.addEventListener('wheel',e=>{e.preventDefault();hideReading();if(!beginCameraInput())return;watching=false;const offset=goalPos.clone().sub(goalLook),length=T.MathUtils.clamp(offset.length()*Math.exp(e.deltaY*.0008),4.5,42);if(e.deltaY<0){const hit=pick(e);if(hit){const shift=hit.point.clone().sub(goalLook).multiplyScalar(Math.min(.14,Math.abs(e.deltaY)*.001));goalLook.add(shift);}}offset.setLength(length);goalPos.copy(goalLook).add(offset);viewMode='detail';syncViews();syncWatch();},{passive:false});
canvas.addEventListener('dblclick',e=>{if(turn||director?.active)return;hideReading();$('#tooltip').classList.remove('visible');const hit=pick(e);if(!hit)return;if(hit.target===left){setView('reading');return;}if(hit.target===right){setView('experiment');return;}watching=false;viewMode='detail';const bounds=new T.Box3().setFromObject(hit.target).expandByScalar(.6);applyFrame(frameBounds(camera,bounds.min.toArray(),bounds.max.toArray(),[.2,.85,1.4],{width:innerWidth,height:innerHeight},{top:80,bottom:innerWidth<650?175:145,side:innerWidth<650?50:150}));syncViews();syncWatch();});
function resize(){magnifier?.resize();renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.fov=36;camera.updateProjectionMatrix();if(readingSession?.active)return;if(director?.active){if(!director.loading)guideShot(director.cue?.shot||director.step.shot);return;}if(viewMode==='detail')viewMode=innerWidth<650?'experiment':'overview';composeView(viewMode);}
function guideMargins(){
 if(!director?.visible)return {};
 const bounds=$('#director').getBoundingClientRect();
 return innerWidth>980?{left:bounds.right+26,right:28,top:64,bottom:82}:{left:18,right:18,top:72,bottom:innerHeight-bounds.top+22};
}
function guideShot(kind){
 viewMode='experiment';syncViews();syncExperiment();
 const margins={top:70,bottom:100,side:28,...guideMargins()},viewport={width:innerWidth,height:innerHeight};
 if(kind==='ramp-ball'){applyFrame(frameBounds(camera,[.8,.25,.65],[5.35,2.7,1.9],[-.48,.68,1.45],viewport,margins));
 }else if(kind==='ramp-energy'){applyFrame(frameBounds(camera,[1.1,.8,-2.4],[4.8,2.5,-.95],[-.18,.65,1.5],viewport,margins));
 }else if(kind==='cup'){
  const p=active.focus(3);applyFrame(frameBounds(camera,p.clone().add(new T.Vector3(-1.15,-.15,-1.05)).toArray(),p.clone().add(new T.Vector3(1.3,1.4,1.1)).toArray(),[-.48,.85,1.4],viewport,margins));
 }else if(kind==='jars')applyFrame(frameBounds(camera,[.6,.4,-1.75],[5.65,3.65,-.2],[-.2,.72,1.5],viewport,margins));
 else composeView('experiment');
}
function updateFocus(){
 const marker=$('#focus-marker');if(!director?.active||!focusTarget||turn){marker.hidden=true;return;}
 const p=new T.Vector3();let label;
 if(focusTarget==='cup'){active.objects[3].getWorldPosition(p);p.y+=.4;label='热饮与内能';}
 else if(focusTarget==='jars'){active.jars[0].group.getWorldPosition(p);p.y+=.5;label='能量类型图例';}
 else if(focusTarget==='total'){marker.hidden=true;return;}
 else if(['kinetic','potential','thermal','elastic'].includes(focusTarget)){const store={kinetic:0,potential:1,elastic:2,thermal:3}[focusTarget],jar=active.jars.find(j=>j.store===store);if(!jar){marker.hidden=true;return;}jar.group.getWorldPosition(p);p.y+=.55;label={kinetic:current===2?'动能：平移 + 转动':'平移动能',potential:'重力势能',thermal:'转入内能',elastic:'弹性势能'}[focusTarget];}
 else if(active.ball){active.ball.getWorldPosition(p);label=current===2?'观察小球与能量瓶':director.step.id==='spring-land'?'观察落地与内能':director.step.id==='outro'?'改变压缩量，再观察':director.holdPhysics&&director.step.id==='spring-apex'?`水平速度 ${Math.abs(active.snapshot().vx).toFixed(2)} m/s`:'观察发射与最高点';}
 else {marker.hidden=true;return;}
 p.project(camera);marker.hidden=Math.abs(p.x)>1||Math.abs(p.y)>1||p.z>1;if(marker.hidden)return;
 marker.style.left=(p.x*.5+.5)*innerWidth+'px';marker.style.top=(-p.y*.5+.5)*innerHeight+'px';marker.querySelector('b').textContent=label;
}
function updateContactNotice(){
 if(current!==3||turn||director?.active||!active?.snapshot)return;
 const s=active.snapshot(),notice=s.phase==='landed'?(s.contact==='pad'?'pad':'base'):s.returnedToRail?'return':'';
 if(!notice||notice===lastContactNotice)return;lastContactNotice=notice;
 $('#context-hint').hidden=false;$('#context-hint').textContent=notice==='pad'?'小球接触软垫，着地动能转入内能；垫面高度仍对应一小部分势能。':notice==='base'?'这次小球接触的是底座。接触位置和内能变化由实际表面决定。':'小球返回导槽，尚未落到软垫。可以增大压缩量，再比较运动结果。';
}
function waitForTurn(){return turn?new Promise(resolve=>turnWaiters.push(resolve)):Promise.resolve();}
function guidePerform(name){
 paused=false;$('#still').setAttribute('aria-pressed','false');$('#still').setAttribute('aria-label','暂停场景运动');
 if(name==='cup')action('store',3,true);
 if(name==='ramp-clean'||name==='ramp-loss'){active.start=1.7;active.side=-1;active.friction=name==='ramp-loss';active.prepare();if(name==='ramp-loss')active.release();}
 if(name==='spring-ready'){active.start=.65;active.apexState=null;active.prepare();}
 if(name==='ramp-release-clean'){active.start=1.7;active.side=-1;active.friction=false;active.prepare();active.release();}
 if(name==='spring-release'){active.start=.65;active.apexState=null;active.prepare();active.release();}
 if(name==='spring-challenge-small'||name==='spring-challenge-large'){active.start=name==='spring-challenge-small'?.2:.8;active.apexState=null;active.prepare();}
 if(name==='release')active.release();
 if(name==='resume'){active.start=.65;active.prepare();active.physics.resetToApex(.65);active.elapsed=active.physics.time;active.running=true;}
 syncExperiment();
}
const directorResizeObserver=new ResizeObserver(()=>{if(readingSession?.active)return;const restored=readingRestoredPanelSize;readingRestoredPanelSize=null;if(restored){const bounds=$('#director').getBoundingClientRect();if(Math.abs(bounds.width-restored.width)<.5&&Math.abs(bounds.height-restored.height)<.5)return;}if(director?.visible){if(director.active){if(!director.loading&&!director.paused)guideShot(director.cue?.shot||director.step.shot);}else composeView(viewMode);}});
document.body.dataset.guide='intro';
director=new BookDirector({
 chapter:()=>current,
 snapshot:()=>active?.snapshot?.()||null,
 navigate:async(i,isCurrent=()=>director.active)=>{await waitForTurn();if(!isCurrent())return;if(i!==current){go(i,true);await waitForTurn();}},
 perform:guidePerform,shot:guideShot,
 recordPrediction:(stepId,index)=>{if(stepId==='ramp-ready')predict(index);},
 beforeStep:clearPointerGesture,
 resumeView:()=>{clearPointerGesture();guideShot(director.cue?.shot||director.step.shot);},
 endInspection:clearPointerGesture,
 highlight:kind=>{focusTarget=kind;document.body.dataset.focus=kind||'';},
 checkpoint:kind=>{if(!director?.cue?.target){focusTarget=kind==='bottom'||kind==='apex'?'ball':null;document.body.dataset.focus=focusTarget||'';}if(kind==='apex')active.apexState={phase:active.physics.phase,q:active.physics.q,v:active.physics.v,time:active.physics.time,airTime:active.physics.airTime,thermal:active.physics.thermal,contact:active.physics.contact,returnedToRail:active.physics.returnedToRail,phi:active.physics.phi};},
 syncPlayback:()=>syncWatch(),
 layout:()=>{if(director.active)closeReadPanel();document.body.dataset.mode=director.active?'guide':'explore';$('#context-hint').hidden=true;syncViews();syncExperiment();syncWatch();composeView(viewMode==='detail'?'experiment':viewMode);}
});
directorResizeObserver.observe($('#director'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){hideReading();if(director.active)director.setPaused(true);}});
addEventListener('resize',resize);resize();camera.position.copy(goalPos);look.copy(goalLook);viewOffset=goalViewOffset;viewOffsetX=goalViewOffsetX;$('#still').setAttribute('aria-pressed',String(paused));$('#still').setAttribute('aria-label',paused?'继续场景运动':'暂停场景运动');syncControls();
canvas.dataset.ready='true';canvas.dataset.turning='false';$('#loading').classList.add('done');$('#loading').setAttribute('aria-hidden','true');
let last=performance.now(),intro=reduced?1:0;
function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;if(!paused&&!director?.paused&&!director?.holdPhysics)clockTime+=dt;intro=Math.min(1,intro+dt*.7);
 if(turn){if(!director?.paused)turn.time+=dt;const dur=reduced?.08:2.25,p=Math.min(1,turn.time/dur);const phase=p<.22?'folding':p<.45?'lifting':p<.65?'crest':p<.82?'landing':'opening';if(canvas.dataset.turnPhase!==phase)canvas.dataset.turnPhase=phase;if(p<.22){const fold=1-T.MathUtils.smoothstep(p,0,.22);if(active)active.root.scale.y=Math.max(.005,fold);flap.scale.y=Math.max(.005,fold);}else{if(!turn.swapped){turn.swapped=true;leaf.visible=true;models.forEach(m=>{if(m)m.root.visible=false;});flap.visible=answer.visible=false;if(turn.forward)right.material.map=getPage(turn.to,'right');else left.material.map=getPage(turn.to,'left');}const t=T.MathUtils.clamp((p-.22)/.60,0,1),smooth=t*t*(3-2*t);setLeaf(smooth,turn.forward);if(p>.82){if(turn.forward)left.material.map=getPage(turn.to,'left');else right.material.map=getPage(turn.to,'right');leaf.visible=false;const incoming=models[turn.to];if(incoming){incoming.root.visible=true;incoming.root.scale.y=Math.max(.005,T.MathUtils.smoothstep(p,.82,1));}}}if(p===1){flap.scale.y=1;completeTurn();}}
 else if(active){active.root.scale.y=reduced?1:1-Math.pow(1-intro,3);active.update(clockTime,dt*(director?.active ? .55 : 1),!paused&&!director?.paused&&!director?.holdPhysics);}
 director?.update(dt);updateContactNotice();

 const targetFlap=flapOpen?-2.6:0;flapAngle+=(targetFlap-flapAngle)*(reduced?1:1-Math.exp(-dt*6));flap.rotation.x=flapAngle;
 const smooth=reduced?1:1-Math.exp(-dt*(drag||pinch?11:4.2));camera.position.lerp(goalPos,smooth);look.lerp(goalLook,smooth);viewOffset+=(goalViewOffset-viewOffset)*smooth;viewOffsetX+=(goalViewOffsetX-viewOffsetX)*smooth;camera.setViewOffset(innerWidth,innerHeight,viewOffsetX,viewOffset,innerWidth,innerHeight);camera.lookAt(look);updateFocus();renderer.render(scene,camera);refreshReading(now);magnifier?.draw();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

