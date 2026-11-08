import * as THREE from './vendor/three.module.js';
import {fitSphereDistance} from './camera-fit.js';
import {latLonToVector} from './globe-effects.js';

const v = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = THREE.MathUtils.clamp;
const smooth = THREE.MathUtils.smootherstep;
const front = 2.04;
const focus = latLonToVector(-20.5532, -175.3841, 1.012);
const globeStart = latLonToVector(5, 161);
const globeEnd = focus.clone().normalize();
const vent = v(-2.12, -.16, front);
const chamber = v(-2.36, -1.16, front);
const melt = v(-1.08, -2.03, front + .08);
const trench = v(2.55, -1.1, front + .05);
const blue = '#70e4fc';
const amber = '#ffba72';
const rockProfile = [[-5.2,-.57],[-3.4,-.57],[-2.8,-.46],[-2.12,-.43],[-1.5,-.52],[-.5,-.63],[.65,-.71],[1.5,-.83],[2.55,-1.1]];
const slabTop = [[-1.43,-4.3],[-.6,-3.6],[.45,-2.72],[1.38,-2],[2.55,-1.1],[3.2,-.75],[4.15,-.62],[5.2,-.62]];
const slabBase = [[-.53,-4.3],[.18,-3.83],[1.07,-3.01],[1.93,-2.3],[2.89,-1.56],[3.54,-1.17],[4.2,-1.03],[5.2,-1.03]];
const crustBase = [[-5.2,-1.15],[-3.4,-1.16],[-2.12,-1.27],[-.5,-1.38],[1.5,-1.62],[2.55,-1.1]];

function solidSection(points, face, side) {
 const shape = new THREE.Shape(points.map(([x,y]) => new THREE.Vector2(x,y)));
 const geometry = new THREE.ExtrudeGeometry(shape, {depth:4.45, bevelEnabled:false});
 geometry.translate(0,0,front - 4.45);
 const materials = [face,side].map(color => new THREE.MeshStandardMaterial({color,roughness:.89}));
 return new THREE.Mesh(geometry, materials);
}

function profileLine(points, color, opacity, z = front + .01) {
 const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x,y]) => v(x,y,z)));
 return new THREE.Line(geometry,new THREE.LineBasicMaterial({color,opacity,transparent:true}));
}

function volcanoRelief() {
 // The half caldera opens onto the cut face so the surface and vent are visible together.
 const sectors = 48, rings = 20, extent = 1.66;
 const heights = r => .78*Math.exp(-((r-.38)**2)/.27) - .17*Math.exp(-(r*r)/.058);
 const positions = [], colors = [], indices = [];
 const bottom = new THREE.Color('#284358'), rim = new THREE.Color('#8c9aa2');
 for(let ring=0;ring<=rings;ring++){
  const radius=extent*ring/rings;
  for(let segment=0;segment<=sectors;segment++){
   const angle=Math.PI*segment/sectors;
   const ridge=(.065*Math.sin(angle*11+radius*5)+.038*Math.cos(angle*19))*Math.sin(Math.PI*radius/extent);
   const height= -.45 + heights(radius) + ridge;
   positions.push(vent.x+radius*Math.cos(angle),height,front-radius*Math.sin(angle));
   colors.push(...bottom.clone().lerp(rim,clamp((height+.55)*1.15,0,1)).toArray());
   if(ring&&segment){
    const i=ring*(sectors+1)+segment;
    indices.push(i,i-1,i-sectors-1,i-1,i-sectors-2,i-sectors-1);
   }
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 geometry.setIndex(indices);
 geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.93});
 const group=new THREE.Group();
 group.add(new THREE.Mesh(geometry,material));
 const section=[[-extent,-.59],...Array.from({length:41},(_,i)=>{
  const x=extent*(i/20-1);
  return [x,-.45+heights(Math.abs(x))];
 }),[extent,-.59]].map(([x,y])=>[vent.x+x,y]);
 const shape=new THREE.Shape(section.map(([x,y])=>new THREE.Vector2(x,y)));
 const face=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshStandardMaterial({color:'#567180',side:THREE.DoubleSide}));
 face.position.z=front+.009;
 group.add(face,profileLine(section.slice(1,-1),'#97c3d0',.78,front+.019));
 return group;
}

function curve(points) {
 return new THREE.CatmullRomCurve3(points);
}

function tube(path, radius, color, emissive = 0) {
 return new THREE.Mesh(new THREE.TubeGeometry(path,56,radius,7,false),
  new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:emissive,roughness:.68}));
}

function spheres(count, color, lit = false) {
 const geometry = new THREE.SphereGeometry(1,12,8);
 const material = lit
  ? new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.28,roughness:.43})
  : new THREE.MeshBasicMaterial({color});
 return Array.from({length:count},()=>new THREE.Mesh(geometry,material));
}

function streak(path, nodes, p, size, grow = 0) {
 for(const [index,node] of nodes.entries()){
  const t = (index/nodes.length + p) % 1;
  path.getPointAt(t,node.position);
  node.scale.setScalar(size+t*grow);
 }
}

function arrow(path, fraction, length, color) {
 const start=path.getPointAt(fraction);
 const direction=path.getTangentAt(fraction).normalize();
 return new THREE.ArrowHelper(direction,start,length,color,length*.34,length*.22);
}

function buildSection() {
 const group=new THREE.Group();
 const rock=solidSection([...rockProfile,...crustBase.toReversed()],'#4a657b','#3b596a');
 const wedge=solidSection([...crustBase,...slabTop.slice(0,4).toReversed(),[-5.2,-4.3]],'#493c48','#4d3d49');
 const base=solidSection([...slabBase,[5.2,-4.3]],'#332d3b','#302c38');
 const slab=solidSection([...slabTop,...slabBase.toReversed()],'#36678b','#4b85a1');
 group.add(base,wedge,rock,slab,volcanoRelief());
 group.add(profileLine(slabTop,'#90cbe4',.75),profileLine(slabBase,'#7aacc2',.52),profileLine(rockProfile,'#9bbcca',.8));
 for(const [index,dy] of [.21,.36,.46].entries()){
  group.add(profileLine(rockProfile.slice(0,-2).map(([x,y],i)=>[x,y-dy+Math.sin(i*2+index)*.04]),'#9cbbcc',.22));
 }
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(10.5,4.56),new THREE.MeshBasicMaterial({
  color:'#359ab8',opacity:.12,transparent:true,side:THREE.DoubleSide,depthWrite:false
 }));
 sea.rotateX(-Math.PI/2);
 sea.position.set(0,.37,-.22);
 group.add(sea,profileLine([[-5.27,.37],[5.27,.37]],'#5c9eba',.47,front+.022));

 const platePath=curve([...slabTop].reverse().map(([x,y])=>v(x+.15,y-.18,front+.055)));
 const plateNodes=spheres(12,'#b3ecff');
 const plate=new THREE.Group();
 plate.add(...plateNodes,...[.12,.37,.62].map(t=>arrow(platePath,t,.66,'#6ec4e9')));
 const fluidPaths=[
  curve([v(.7,-2.6,front+.075),v(.2,-2.45,front+.08),v(-.34,-2.18,front+.09),melt]),
  curve([v(-.27,-3.32,front+.075),v(-.62,-2.92,front+.09),v(-.8,-2.42,front+.09),melt])
 ];
 const water=new THREE.Group();
 const fluid=fluidPaths.map(path=>{
  const nodes=spheres(7,blue);
  water.add(...nodes,arrow(path,.28,.57,blue));
  return {path,nodes};
 });
 const partialMelt=spheres(15,amber,true);
 partialMelt.forEach((node,i)=>{
  const a=i*2.39996;
  node.position.copy(melt).add(v(Math.cos(a)*(.16+i*.023),Math.sin(a)*(.06+i*.016),.025+Math.sin(a*2)*.038));
 });
 const meltGroup=new THREE.Group();
 const heatedRock=new THREE.Mesh(new THREE.PlaneGeometry(1.95,1.14),new THREE.ShaderMaterial({
  uniforms:{strength:{value:0}},
  vertexShader:`varying vec2 surfaceUV;void main(){surfaceUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float strength;varying vec2 surfaceUV;void main(){
   float glow=1.-smoothstep(.08,.52,length(surfaceUV-.5));
   gl_FragColor=vec4(1.,.41,.16,glow*strength*.61);}`,
  transparent:true,depthWrite:false
 }));
 heatedRock.position.copy(melt);
 heatedRock.position.z=front+.035;
 heatedRock.rotation.z=-.24;
 meltGroup.add(heatedRock,...partialMelt);

 const feed=curve([melt,v(-1.52,-1.8,front+.08),v(-1.8,-1.45,front+.09),chamber]);
 const gasPath=curve([chamber,v(-2.28,-.94,front+.12),v(-2.09,-.66,front+.12),v(-2.24,-.36,front+.12),v(-2.11,-.29,front+.115)]);
 const ventPath=curve([gasPath.getPoint(1),v(-2.1,-.21,front+.07),vent]);
 const outPath=curve([vent,v(-2.15,.14,front+.01),v(-2.19,.49,front+.01),v(-2.04,1.02,front-.13)]);
 const calmPath=curve([vent,v(-2.17,-.10,front-.05),v(-2.20,-.05,front-.11),v(-2.23,-.025,front-.14)]);
 const magma=new THREE.Group();
 const reservoir=spheres(1,'#e77749',true)[0];
 reservoir.position.copy(chamber);
 reservoir.scale.set(.47,.215,.22);
 const rupture=tube(gasPath,.046,'#cf9d90',.22);
 const bright=tube(gasPath,.068,'#ff914f',.45);
 const cracks=new THREE.Group();
 cracks.add(
  profileLine([[-2.12,-.61],[-1.93,-.51],[-1.88,-.41],[-1.77,-.37]],'#d9a08a',.74,front+.122),
  profileLine([[-2.23,-.48],[-2.43,-.42],[-2.53,-.32]],'#d9a08a',.7,front+.12)
 );
 const outlet=tube(ventPath,.049,'#f89862',.38);
 magma.add(reservoir,tube(feed,.045,'#df7b54',.31),rupture,bright,cracks,outlet);
 const magmaNodes=spheres(7,'#ffbe72',true);
 const gasNodes=spheres(8,'#ffe2a1',true);
 const lavaNodes=spheres(7,'#ffb071',true);
 const debris=spheres(28,'#ef9c68',true);
 const cloud=spheres(26,'#7d8292',true);
 // Translucent silhouettes keep the vent and rising hot fragments visible.
 const ashMaterial=new THREE.MeshStandardMaterial({color:'#a6a3aa',transparent:true,opacity:.47,depthWrite:false,roughness:1});
 for(const puff of cloud)puff.material=ashMaterial;
 const erupt=new THREE.Group();
 erupt.add(...lavaNodes,...debris,...cloud);
 group.add(plate,water,meltGroup,magma,...magmaNodes,...gasNodes,erupt);
 return {group,plate,plateNodes,platePath,water,fluid,meltGroup,heatedRock,partialMelt,magma,rupture,bright,cracks,outlet,feed,gasPath,
  outPath,calmPath,magmaNodes,gasNodes,erupt,lavaNodes,debris,cloud};
}

function buildGlobe() {
 const group=new THREE.Group();
 const material=new THREE.MeshBasicMaterial({color:'#c7e4f1'});
 const sphere=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),material);
 const rim=new THREE.Mesh(new THREE.SphereGeometry(1.013,80,52),new THREE.ShaderMaterial({
  vertexShader:`varying vec3 normalView;varying vec3 viewDirection;
   void main(){vec4 p=modelViewMatrix*vec4(position,1.);normalView=normalize(normalMatrix*normal);viewDirection=-p.xyz;gl_Position=projectionMatrix*p;}`,
  fragmentShader:`varying vec3 normalView;varying vec3 viewDirection;
   void main(){float rim=pow(1.-max(0.,dot(normalize(normalView),normalize(viewDirection))),2.7);gl_FragColor=vec4(.22,.64,.95,rim*.66);}`,
  transparent:true,depthWrite:false
 }));
 const pin=new THREE.Mesh(new THREE.RingGeometry(.023,.027,52),new THREE.MeshBasicMaterial({color:amber,side:THREE.DoubleSide,depthTest:false}));
 pin.position.copy(focus);
 pin.quaternion.setFromUnitVectors(v(0,0,1),globeEnd);
 group.add(sphere,rim,pin);
 return {group,material,pin};
}

// Pose targets are in the same teaching model from the wide cut to the vent.
// Each move is a pure function of the spoken chapter time, including seeks.
const shots=[
 {target:v(0,-1.72,.08),offset:v(7.3,6.1,13.9)},
 {target:v(-.25,-1.66,1.0),offset:v(6.4,5.8,11.4)},
 {target:v(-2.07,-.84,1.55),offset:v(2.25,3.1,6.0)},
 {target:v(-2.17,-.53,1.7),offset:v(1.9,2.25,5.6)},
 {target:v(-2.13,.38,1.24),offset:v(2.9,3.7,7.4)},
 {target:v(-2.09,.12,.89),offset:v(-2.6,7.2,7.8)}
];

const labelSets=[
 [{position:trench,text:'汤加海沟',slot:'upper-right'},{position:v(.57,-2.84,front+.09),text:'太平洋板块向西下沉',slot:'lower-right'},
  {position:vent,text:'洪阿火山在海沟以西',slot:'upper-left'}],
 [{position:v(.08,-2.89,front+.09),text:'板块中的含水矿物释水',slot:'lower-right'},
  {position:melt,text:'水让上方岩石更易熔融',slot:'upper-left',tone:'warm',at:.32}],
 [{position:chamber,text:'岩浆上升，可在这里暂时聚集',slot:'lower-left',tone:'warm'},
  {position:v(-2.18,-.46,front+.14),text:'压力足够时，裂隙可被撑开',slot:'upper-right',at:.53}],
 [{position:v(-2.28,-.91,front+.14),text:'深处压力高，气体多溶在岩浆里',slot:'lower-left'},
  {position:v(-2.14,-.23,front+.17),text:'浅处压力低，析出的气泡变大',slot:'upper-right',tone:'warm',at:.32}],
 [{position:vent,text:'岩浆沿连通的裂隙喷出',slot:'lower-right',tone:'warm'}],
 [{position:v(vent.x,-.14,front-.38),text:'海底 · 比较喷发前后测深',slot:'lower-left'},
  {position:v(vent.x,1.06,front-.25),text:'海上 · 看卫星红外云图',slot:'upper-right',at:.48}]
];

const narrationFocus=[
 '西南太平洋 · 定位洪阿火山',
 '从海沟向西，追踪板块和水',
 '拉近地下裂隙与岩浆聚集区',
 '沿通道看压力与气泡的变化',
 '跟着岩浆穿过喷口',
 '从原理切换到两类真实记录'
];

export async function createVolcanoPrimer3D(host,onUnavailable) {
 const image = await new THREE.TextureLoader().loadAsync(new URL('./assets/earth-blue-marble.png',import.meta.url).href);
 image.colorSpace=THREE.SRGBColorSpace;
 const canvas=host.querySelector('canvas');
 let renderer;
 try {
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 } catch(error) {
  image.dispose();
  throw error;
 }
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
 renderer.setClearColor('#071422',0);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(38,1,.015,60);
 const light=new THREE.DirectionalLight('#e5f4ff',2.4);
 light.position.set(-3,7,8);
 const fill=new THREE.DirectionalLight('#86bbf4',1.1);
 fill.position.set(6,2,-3);
 scene.add(light,fill,new THREE.HemisphereLight('#c1e0f5','#6d4a48',1.1));
 const globe=buildGlobe();
 globe.material.map=image;
 const section=buildSection();
 scene.add(globe.group,section.group);

 const title=host.querySelector('.volcano-shot-title');
 const veil=host.querySelector('.volcano-shot-veil');
 const notes=[...host.querySelectorAll('.volcano-shot-note')].map(element=>({
  element,
  text:element.querySelector('span'),
  line:host.querySelector(`[data-volcano-leader="${element.dataset.note}"]`)
 }));
 const story=host.querySelector('.volcano-shot-context');
 const toggle=host.querySelector('.volcano-shot-angle');
 const aim=new THREE.Vector3(), offset=new THREE.Vector3(), projected=new THREE.Vector3();
 const up=v(0,1,0);
 let phase=0,progress=0,reduced=false,side=false,failed=false,width=0,height=0;

 function placeNotes(labels) {
  for(const [i,note] of notes.entries()){
   const cue=labels[i];
   const point=cue&&projected.copy(cue.position).project(camera);
   const visible=cue&&point.z>=-1&&point.z<=1&&Math.abs(point.x)<1&&Math.abs(point.y)<1;
   note.element.hidden=!visible;
   note.line.style.display=visible?'':'none';
   if(!visible)continue;
   note.element.dataset.slot=cue.slot;
   note.element.dataset.tone=cue.tone??'cool';
   if(note.text.textContent!==cue.text)note.text.textContent=cue.text;
   const x=(point.x*.5+.5)*width, y=(.5-point.y*.5)*height;
   const right=cue.slot.endsWith('right'), top=cue.slot.startsWith('upper');
   const edgeX=right?width-16:16, edgeY=top?height*.22:height*.76;
   note.element.style.top=edgeY+'px';
   note.line.style.color=cue.tone==='warm'?amber:blue;
   note.line.setAttribute('d',`M${edgeX} ${edgeY}H${edgeX+(right?-19:19)}L${x} ${y}m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0`);
  }
 }

 function animateRock(p) {
  const model=section;
  model.plate.visible=phase===0;
  if(model.plate.visible)streak(model.platePath,model.plateNodes,p*1.8,.041);
  model.water.visible=phase===1;
  if(model.water.visible){
   for(const {path,nodes} of model.fluid)streak(path,nodes,p*1.35,.037);
  }
  model.meltGroup.visible=phase===1&&p>.3;
  if(model.meltGroup.visible){
   const warming=smooth(p,.3,.86);
   model.heatedRock.material.uniforms.strength.value=warming;
   for(const [i,spot] of model.partialMelt.entries()){
    const size=warming*(.038+(i%4)*.012);
    spot.scale.set(size*1.36,size,size*.72);
   }
  }
  model.magma.visible=phase>=2&&phase<=4;
  model.rupture.visible=phase>2||p>.53;
  model.bright.visible=phase>2;
  model.cracks.visible=phase>2||p>.64;
  model.outlet.visible=phase===4;
  for(const particle of model.magmaNodes)particle.visible=phase===2;
  if(phase===2){
   const crack=smooth(p,.53,1);
   const elements=model.rupture.geometry.index.count;
   model.rupture.geometry.setDrawRange(0,6*Math.floor(elements*crack/6));
   streak(p<.53?model.feed:model.gasPath,model.magmaNodes,p*1.8,.054);
  }else model.rupture.geometry.setDrawRange(0,Infinity);
  for(const particle of model.gasNodes)particle.visible=phase===3&&p>.28;
  if(phase===3){
   streak(model.gasPath,model.gasNodes,p*1.1,.031,.082*smooth(p,.26,.82));
   for(const bubble of model.gasNodes)bubble.position.z+=.10;
  }
  model.erupt.visible=phase===4;
  if(!model.erupt.visible)return;
  const blast=smooth(p,.6,.91);
  streak(blast>0?model.outPath:model.calmPath,model.lavaNodes,p*2.8,.059);
  for(const [i,fragment] of model.debris.entries()){
   fragment.visible=blast>0;
   const a=i*2.39996, rise=(i/28+.85*blast)%1;
   fragment.position.copy(vent).add(v(Math.cos(a)*rise*blast*.88,rise*(.38+blast*1.8),Math.sin(a)*rise*blast*.84));
   fragment.scale.setScalar((.035+(i%4)*.008)*blast);
  }
  for(const [i,puff] of model.cloud.entries()){
   puff.visible=blast>.04;
   const a=i*2.39996, lift=(i+1)/26;
   puff.position.copy(vent).add(v(Math.cos(a)*lift*blast*.96,.32+lift*1.63*blast,Math.sin(a)*lift*blast*.82));
   puff.scale.setScalar((.12+lift*.37)*blast);
  }
 }

 function render() {
  if(failed||!host.isConnected||!host.clientWidth||!host.clientHeight)return;
  if(width!==host.clientWidth||height!==host.clientHeight){
   width=host.clientWidth;
   height=host.clientHeight;
   renderer.setSize(width,height,false);
   camera.aspect=width/height;
   camera.updateProjectionMatrix();
  }
  const p=reduced?(phase===0?.62:.92):progress;
  const flying=phase===0&&p<.26;
  globe.group.visible=flying;
  section.group.visible=!flying;
  host.dataset.volcanoView=flying?'earth':String(phase);
  veil.style.opacity=phase===0&&!reduced?String(smooth(p,.20,.26)*(1-smooth(p,.26,.34))):'0';
  toggle.hidden=flying;
  toggle.setAttribute('aria-pressed',String(side));
  if(flying){
   const zoom=smooth(p,.06,.26);
   const distance=fitSphereDistance({radius:1.025,fovDegrees:camera.fov,width,height,padding:.10});
   camera.position.copy(globeStart).lerp(globeEnd,zoom).normalize().multiplyScalar(THREE.MathUtils.lerp(distance,1.4,zoom));
   aim.set(0,0,0).lerp(focus,zoom*.44);
   globe.pin.scale.setScalar(1+Math.sin(p*45)*.11-zoom*.45);
  }else{
   const current=shots[phase],next=shots[phase+1]??current;
   const travel=reduced?0:smooth(p,.83,1);
   aim.copy(current.target).lerp(next.target,travel);
   offset.copy(current.offset).lerp(next.offset,travel);
   if(side)offset.applyAxisAngle(up,-.40);
   camera.position.copy(aim).addScaledVector(offset,Math.max(1,1.3/camera.aspect));
   animateRock(p);
  }
  camera.lookAt(aim);
  camera.updateMatrixWorld();
  renderer.render(scene,camera);
  const labels=flying?[{position:focus,text:'汤加 · 洪阿火山',slot:'upper-right',tone:'warm'}]
   :labelSets[phase].filter(cue=>(cue.at??0)<=p);
  placeNotes(labels);
  const caption=flying?narrationFocus[0]:phase===0?'汤加火山弧 · 东西向剖面':narrationFocus[phase];
  if(title.textContent!==caption)title.textContent=caption;
  const context=phase===1&&p>=.53?'同样的温度 · 释出的水降低岩石熔融所需的温度'
   :phase===4?p<.60?'气体较易逸出 · 岩浆可较平缓流出':'气体难以逸出 · 膨胀可打碎岩浆':'';
  if(story.textContent!==context)story.textContent=context;
  story.hidden=!context;
 }

 toggle.addEventListener('click',()=>{side=!side;render();});
 canvas.addEventListener('webglcontextlost',()=>{
  failed=true;
  host.hidden=true;
  onUnavailable();
 });
 new ResizeObserver(render).observe(host);
 return {
  reset(){side=false;},
  update(nextPhase,p,reducedMotion){
   phase=nextPhase;
   progress=p;
   reduced=reducedMotion;
   if(failed)return false;
   host.hidden=false;
   render();
   return true;
  }
 };
}
