import * as THREE from 'three';
import { random } from './paper.js';
import { createSculptedRose, createSculptedLotus } from './botanicals.js';
import { createPainterlySeasons } from './landscape.js';

const TAU=Math.PI*2;
const basic=(color,options={})=>new THREE.MeshBasicMaterial({color,...options});
const shaded=(color,options={})=>new THREE.MeshStandardMaterial({color,roughness:.77,metalness:.015,side:THREE.DoubleSide,...options});
const smooth=(a,b,x)=>{x=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);};
const glslNoise=`
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=noise(p)*a;p=mat2(1.6,1.2,-1.2,1.6)*p+7.1;a*=.5;}return s;}
`;

function world(color='#e9e5d9',orthographic=false) {
  const scene=new THREE.Scene();scene.background=new THREE.Color(color);
  const camera=orthographic?new THREE.OrthographicCamera(-9,9,5.5,-5.5,.1,150):new THREE.PerspectiveCamera(46,1,.1,200);
  camera.position.set(0,0,16);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xf6f1e8,0x8c9080,1.05));
  const key=new THREE.DirectionalLight(0xfff2e3,2.65);key.position.set(-5,9,8);scene.add(key);
  return {scene,camera,resize(aspect){
    if(camera.isOrthographicCamera){camera.left=-5.5*aspect;camera.right=5.5*aspect;camera.top=5.5;camera.bottom=-5.5;}
    else camera.aspect=aspect;
    camera.updateProjectionMatrix();
  }};
}
function mesh(parent,geometry,mat,x=0,y=0,z=0) {const item=new THREE.Mesh(geometry,mat);item.position.set(x,y,z);parent.add(item);return item;}
function box(parent,w,h,d,mat,x=0,y=0,z=0){return mesh(parent,new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
function plane(parent,w,h,mat,x=0,y=0,z=0){return mesh(parent,new THREE.PlaneGeometry(w,h),mat,x,y,z);}
function line(parent,points,color=0x242720,opacity=1) {
  const object=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));parent.add(object);return object;
}
function canvasTexture(draw,w=1024,h=512) {
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;
}
function writing(parent,text,w,h,options={}) {
  const texture=canvasTexture((c,cw,ch)=>{
    c.clearRect(0,0,cw,ch);c.fillStyle=options.color||'#35322c';c.font=`${options.italic?'italic ':''}${options.bold?'bold ':''}${options.size||70}px ${options.sans?'sans-serif':'Georgia, serif'}`;
    c.textAlign='center';c.textBaseline='middle';c.fillText(text,cw/2,ch/2,cw-30);
  },1024,256);
  return plane(parent,w,h,basic(0xffffff,{map:texture,transparent:true,depthWrite:false}));
}
function segmentMatrices(segments) {
  const up=new THREE.Vector3(0,1,0),obj=new THREE.Object3D(),matrices=[];
  for(const [a,b,r] of segments) {const direction=b.clone().sub(a);obj.position.copy(a).add(b).multiplyScalar(.5);obj.quaternion.setFromUnitVectors(up,direction.clone().normalize());obj.scale.set(r,direction.length(),r);obj.updateMatrix();matrices.push(obj.matrix.clone());}
  return matrices;
}
function branches(parent,segments,color) {
  const matrices=segmentMatrices(segments),geometry=new THREE.CylinderGeometry(.68,1,1,5),mat=basic(color);
  const instances=new THREE.InstancedMesh(geometry,mat,matrices.length);matrices.forEach((m,i)=>instances.setMatrixAt(i,m));parent.add(instances);return instances;
}
function petalGeometry(length=2,width=.7,curve=.7) {
  const vertices=[],indices=[],uv=[];const rows=18,columns=8;
  for(let j=0;j<=rows;j++) for(let i=0;i<=columns;i++) {
    const t=j/rows,u=i/columns*2-1;
    vertices.push(u*width*Math.pow(Math.sin(Math.PI*t),.75),length*t,curve*t*t+u*u*.16*Math.sin(Math.PI*t));uv.push(i/columns,t);
    if(j<rows&&i<columns){const k=j*(columns+1)+i;indices.push(k,k+columns+1,k+1,k+1,k+columns+1,k+columns+2);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}

export function makeRose() { return createSculptedRose(); }

export function makeCassette() {
  const group=new THREE.Group();
  const body=shaded(0x252629),edge=shaded(0x14171a),silver=shaded(0xa9a69b);
  box(group,2.45,3.65,.28,body);box(group,2.18,1.73,.13,edge,0,.1,.2);
  const labelTexture=canvasTexture((c,w,h)=>{c.fillStyle='#ddd5bf';c.fillRect(0,0,w,h);c.fillStyle='#6d3436';c.fillRect(0,h*.79,w,9);c.fillStyle='#292c2b';c.font='italic 54px Georgia';c.fillText('Side A — things I carried',30,96);c.font='21px monospace';c.fillText('STEREO   /   90 MIN   /   HOME RECORDING',30,142);},1024,200);
  plane(group,2.05,.40,basic(0xffffff,{map:labelTexture}),0,.76,.285);
  const reels=[];
  for(const x of [-.63,.63]){
    const reel=new THREE.Group();reel.position.set(x,.10,.30);group.add(reel);
    const tape=mesh(reel,new THREE.CylinderGeometry(.38,.38,.04,64),shaded(0x3f2e27));tape.rotation.x=Math.PI/2;
    const hub=mesh(reel,new THREE.TorusGeometry(.14,.055,10,32),silver,0,0,.031);reels.push(reel);
    for(let i=0;i<3;i++){const bar=box(reel,.075,.33,.015,silver,Math.sin(i*TAU/3)*.15,Math.cos(i*TAU/3)*.15,.04);bar.rotation.z=-i*TAU/3;}
    mesh(reel,new THREE.CircleGeometry(.057,20),edge,0,0,.06);
  }
  for(const x of [-.98,.98])for(const y of [-1.52,1.52])mesh(group,new THREE.CircleGeometry(.045,12),silver,x,y,.151);
  const brand=writing(group,'AFTER HOURS',1.9,.35,{size:80,color:'#aba99c'});brand.position.set(0,1.44,.18);
  const bottom=writing(group,'nightwalk',1.65,.38,{size:85,italic:true,color:'#c9c4b5'});bottom.position.set(0,-1.21,.18);
  const tiny=writing(group,'PLAY   ·   PAUSE   ·   REWIND',1.9,.17,{size:35,sans:true,color:'#96978e'});tiny.position.set(0,-1.53,.18);
  const back=new THREE.Group();back.rotation.y=Math.PI;back.position.z=-.17;group.add(back);
  box(back,2.18,1.73,.08,edge,0,.1,.04);
  const sideBTexture=canvasTexture((c,w,h)=>{c.fillStyle='#d1cfc5';c.fillRect(0,0,w,h);c.fillStyle='#3e4e5b';c.font='italic 54px Georgia';c.fillText('Side B — a way back home',30,96);c.font='21px monospace';c.fillText('STEREO   /   SAME HEART, ANOTHER SIDE',30,142);},1024,200);
  plane(back,2.05,.40,basic(0xffffff,{map:sideBTexture}),0,.76,.11);
  const reverseReels=reels.map(reel=>{const reverse=reel.clone(true);reverse.position.z=.12;back.add(reverse);return reverse;});reels.push(...reverseReels);
  const wire=new THREE.CubicBezierCurve3(new THREE.Vector3(.9,1.8,0),new THREE.Vector3(1.9,3.5,0),new THREE.Vector3(-1.5,3,0),new THREE.Vector3(.4,1.8,0));line(group,wire.getPoints(50),0x393d36,.7);
  return {group,reels,update(time,side=0){reels.forEach((reel,i)=>reel.rotation.z=-time*(.8+i*.1));labelTexture.offset.y=0;group.rotation.y=side*Math.PI;}};
}

function tornMaterial(map,tint=0xffffff) {
  return new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,uniforms:{map:{value:map},tint:{value:new THREE.Color(tint)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D map;uniform vec3 tint;varying vec2 vUv;${glslNoise}void main(){float distance=min(vUv.x,1.-vUv.x);float edge=.018+(noise(vec2(vUv.y*90.,3.))-.5)*.022;float alpha=smoothstep(edge,edge+.008,distance);vec3 color=texture2D(map,vUv).rgb*tint;float fiber=1.-smoothstep(edge+.005,edge+.016,distance);color=mix(color,vec3(.77,.74,.65),fiber*.9);float stitch=(1.-smoothstep(.001,.006,abs(fract(vUv.y*43.)-.5)))*smoothstep(.004,.009,distance)*(1.-smoothstep(.043,.052,distance));color=mix(color,vec3(.30,.018,.035),stitch*.82);alpha=max(alpha,stitch*.9);gl_FragColor=vec4(color,alpha);}`});
}

export function createCover(shared) {
  const w=world('#e9e5d9',true),{scene,camera}=w,collage=new THREE.Group();scene.add(collage);
  const rain=plane(collage,3.3,11.8,tornMaterial(shared.rainTexture),-.9,0,-.6);rain.rotation.z=-.13;rain.userData.track=1;
  const forest=plane(collage,2.1,12.1,tornMaterial(shared.forestTexture),2.1,.1,-.3);forest.rotation.z=-.16;forest.userData.track=4;
  const black=plane(collage,5.2,11.8,basic(0x111212),5.7,0,-1);black.rotation.z=-.1;
  const rose=makeRose();rose.group.position.set(-4.8,-1.8,1.1);rose.group.scale.setScalar(.95);rose.group.rotation.y=-.3;collage.add(rose.group);rose.group.userData.track=3;
  const cassette=makeCassette();cassette.group.position.set(.2,-.3,1.5);cassette.group.scale.setScalar(.85);cassette.group.rotation.z=-.20;collage.add(cassette.group);cassette.group.userData.track=2;
  const lotus=makeLotus();lotus.group.position.set(5.4,-2.2,1);lotus.group.rotation.x=-.05;lotus.group.scale.setScalar(.90);collage.add(lotus.group);lotus.group.userData.track=7;
  const moth=butterfly();moth.group.position.set(5.6,2.6,1.1);moth.group.scale.setScalar(1.2);collage.add(moth.group);moth.group.userData.track=7;
  const polaroid=new THREE.Group();polaroid.position.set(-1.9,-3.45,2);polaroid.rotation.z=.14;collage.add(polaroid);
  box(polaroid,1.4,1.72,.03,basic(0xece8dc));plane(polaroid,1.15,1.15,basic(0xffffff,{map:shared.rainTexture}),0,.12,.025);
  const title=writing(polaroid,'keep this moment',1.18,.18,{size:58});title.position.set(0,-.65,.03);
  return {...w,interactive:[rain,forest,rose.group,cassette.group,lotus.group,moth.group],update(time,progress,o){
    const wide=camera.right-camera.left;
      const narrow=wide<8;collage.position.x=narrow?-.1:wide>13?wide*.02:wide*.17;collage.scale.setScalar(narrow?.32:wide<11?.72:1);
      collage.rotation.y=o.pointer.x*.025;collage.position.y=(narrow?-1.45:0)-progress*.5;
    rose.update(time);cassette.reels.forEach((r,i)=>r.rotation.z=-time*(.8+i*.1));
    cassette.group.rotation.x=Math.sin(time*.3)*.035;lotus.update(time,1);moth.update(time);
    camera.position.z=16-progress*2;
  }};
}

export function createScrapbook(shared) {
  const w=world('#e9e5d9',true),{scene,camera}=w,group=new THREE.Group();scene.add(group);
  const photo=new THREE.Group();photo.position.set(-.4,.2,0);photo.rotation.z=-.10;group.add(photo);
  box(photo,3.65,5.85,.06,basic(0xeeeadd));plane(photo,3.22,4.78,basic(0xffffff,{map:shared.rainTexture}),0,.30,.045);
  const caption=writing(photo,'the way home, 2:14',3.12,.38,{italic:true,size:70});caption.position.set(0,-2.38,.055);
  const tape=makeCassette();tape.group.position.set(2.7,-.25,.65);tape.group.rotation.z=-.16;group.add(tape.group);tape.group.userData.action='flip';
  const ticketTexture=canvasTexture((c,cw,ch)=>{c.fillStyle='#d6b7a8';c.fillRect(0,0,cw,ch);c.strokeStyle='#70564e';c.strokeRect(18,18,cw-36,ch-36);c.fillStyle='#544943';c.font='54px SimSun, serif';c.fillText('夜行 — 回家的路',45,100);c.font='28px monospace';c.fillText('ONE WAY     02:14     NO. 0001',45,172);},1024,256);
  const ticket=plane(group,2.6,.85,basic(0xffffff,{map:ticketTexture}),-2.4,-2.75,1);ticket.rotation.z=.14;
  const umbrella=new THREE.Group();umbrella.position.set(-3.5,1.9,.2);umbrella.rotation.z=.5;group.add(umbrella);
  const outline=[];for(let i=0;i<=60;i++){const a=i/60*Math.PI;outline.push(new THREE.Vector3(Math.cos(a)*1.25,Math.sin(a)*.72,0));}line(umbrella,outline,0x7a7b70,.6);line(umbrella,[new THREE.Vector3(-1.25,0,0),new THREE.Vector3(1.25,0,0)],0x7a7b70,.5);line(umbrella,[new THREE.Vector3(0,.72,0),new THREE.Vector3(0,-1.2,0),new THREE.Vector3(.22,-1.45,0),new THREE.Vector3(.4,-1.2,0)],0x777b70,.6);
  for(let i=0;i<5;i++)line(umbrella,[new THREE.Vector3(0,.72,0),new THREE.Vector3(-1.25+i*.625,0,0)],0x7a7b70,.35);
  return {...w,interactive:[tape.group],update(time,p,o){
    const zoom=smooth(.60,1,p),mobile=(camera.right-camera.left)<10,scale=(mobile?.60:1)*(1+zoom*3.8);group.scale.setScalar(scale);group.position.set((mobile?-.45:0)*(1-zoom)-zoom*2.7*scale,(mobile?-.8:0)*(1-zoom)+zoom*.25*scale,0);group.rotation.y=o.pointer.x*.025;
    tape.reels.forEach((r,i)=>r.rotation.z=-time*(.9+i*.2));tape.group.rotation.y=THREE.MathUtils.lerp(tape.group.rotation.y,o.side*Math.PI,.08);
    tape.group.rotation.x=Math.sin(time*.4)*.025;photo.rotation.z=-.10+o.pointer.x*.012;
    camera.position.z=16;
  }};
}

export function createRose() {
  const w=world('#e8e2d3',true),{scene}=w;
  const backing=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float uTime;${glslNoise}void main(){float edge=.58+(fbm(vec2(vUv.y*7.,2.))-.5)*.022;float mask=smoothstep(edge-.001,edge+.004,vUv.x);vec3 paper=vec3(.81,.77,.66)+(fbm(vUv*5.)-.5)*.09;gl_FragColor=vec4(mix(paper,vec3(.005,.006,.008),mask),1.);}`});
  const backdrop=plane(scene,40,12,backing,0,0,-2);
  const rose=makeRose();rose.group.position.set(1.8,-1.5,1);rose.group.scale.setScalar(1.25);scene.add(rose.group);
  const circles=new THREE.Group();scene.add(circles);
  for(let i=0;i<3;i++){const points=[];for(let j=0;j<=100;j++){const a=j/100*TAU;points.push(new THREE.Vector3(Math.cos(a)*(2.4+i*.48),Math.sin(a)*(2.4+i*.48),0));}line(circles,points,0x8a8170,.18);}
  circles.position.set(-3,.1,-.4);
  return {...w,update(time,p,o){rose.update(time,smooth(0,.8,p));rose.group.rotation.y=-.3+o.pointer.x*.15+p*.25;rose.group.position.y=-1.5+p*.25;backdrop.position.x=-.5;circles.rotation.z=time*.01;}};
}

export function createForest() {
  const w=world('#b61445'),{scene,camera}=w;camera.fov=64;
  const sky=mesh(scene,new THREE.SphereGeometry(150,32,24),new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{uSide:{value:0}},vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vP;uniform float uSide;${glslNoise}void main(){vec3 n=normalize(vP);float ink=fbm(n.xz*5.)*.035;vec3 top=mix(vec3(.48,.003,.063),vec3(.015,.027,.052),uSide);vec3 c=mix(vec3(.82,.78,.71),top,smoothstep(-.05,.68,n.y));gl_FragColor=vec4(c+ink,1.);}`}));
  const rnd=random(90482),segments=[],trees=new THREE.Group();scene.add(trees);
  function twig(a,dir,length,radius,depth){
    const b=a.clone().addScaledVector(dir,length);segments.push([a.clone(),b.clone(),radius]);if(depth===0)return;
    const turns=depth>3?3:2;
    for(let k=0;k<turns;k++){
      const angle=(k/(turns-1)-.5)*1.0,turn=new THREE.Vector3((rnd()-.5)*.9,.02+(rnd()-.5)*.24,(rnd()-.5)*.9);
      const d=dir.clone().multiplyScalar(.9).add(turn);d.y=Math.max(.12,d.y);d.normalize();
      twig(b,d,length*(.57+rnd()*.13),radius*.56,depth-1);
    }
  }
  for(let i=0;i<38;i++){
    const angle=i/38*TAU+rnd()*.16,r=3.8+rnd()*18,height=13+rnd()*13;
    const base=new THREE.Vector3(Math.cos(angle)*r,-1,Math.sin(angle)*r);
    const top=new THREE.Vector3(base.x*.73,height,base.z*.73);
    const mid=base.clone().lerp(top,.55).add(new THREE.Vector3((rnd()-.5)*.5,0,(rnd()-.5)*.5));
    segments.push([base,mid,.16+rnd()*.19],[mid,top,.10+rnd()*.12]);
    const inward=new THREE.Vector3(-Math.cos(angle)*.43,.82,-Math.sin(angle)*.43).normalize();
    twig(top,inward,3.2+rnd()*3.2,.075,5);
    for(let j=0;j<3;j++){
      const start=mid.clone().lerp(top,.2+j*.23),dir=inward.clone().add(new THREE.Vector3((rnd()-.5)*1.1,-.18,(rnd()-.5)*1.1)).normalize();
      twig(start,dir,2.9+rnd()*2.5,.055,4);
    }
  }
  branches(trees,segments,0x080509);
  const dustGeo=new THREE.BufferGeometry(),points=[];for(let i=0;i<250;i++)points.push((rnd()-.5)*30,rnd()*35,(rnd()-.5)*30);dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xd9c4b9,size:.017,transparent:true,opacity:.25,depthWrite:false}));scene.add(dust);
  return {...w,update(time,p,o){
    camera.position.set(o.pointer.x*.12,1.7+p*.8,.5-p*.6);camera.lookAt(Math.sin(p*.7)*.7,35,-5.8+p*4.3);camera.rotation.z=-.06+p*.1+Math.sin(time*.09)*.005;
    trees.rotation.y=Math.sin(time*.06)*.004;sky.material.uniforms.uSide.value=o.side;dust.position.y=-time*.025%8;
  }};
}

export function createSeasons() { return createPainterlySeasons(); }

export function createRoots() {
  const w=world('#d5d0c1',true),{scene}=w,rnd=random(871);
  const haze=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float uTime;${glslNoise}void main(){float smoke=fbm(vUv*4.+vec2(uTime*.018,0.));float edge=.71+(fbm(vec2(vUv.y*6.,uTime*.01))-.5)*.035;vec3 c=mix(vec3(.70,.68,.60)+smoke*.18,vec3(.003,.004,.004),smoothstep(edge,edge+.006,vUv.x));gl_FragColor=vec4(c,1.);}`});
  plane(scene,30,12,haze,0,0,-3);
  const ground=new THREE.Group();scene.add(ground);
  const verts=[],indices=[];for(let i=0;i<=150;i++){const x=(i/150-.5)*35,y=-3.9+Math.sin(i*.07)*.7+Math.sin(i*.025)*1.4;verts.push(x,-8,0,x,y,0);if(i<150){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
  const hillGeo=new THREE.BufferGeometry();hillGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));hillGeo.setIndex(indices);mesh(ground,hillGeo,basic(0x0c100e,{side:THREE.DoubleSide}));
  const segments=[];function grow(a,dir,len,r,depth){const b=a.clone().addScaledVector(dir,len);segments.push([a,b,r]);if(depth>0)for(let i=0;i<2;i++)grow(b,new THREE.Vector3(dir.x+(i===0?-1:1)*(.25+rnd()*.65),Math.max(.18,dir.y-.18+rnd()*.22),0).normalize(),len*.66,r*.56,depth-1);}
  grow(new THREE.Vector3(-4,-3.1,.1),new THREE.Vector3(.03,1,0),1.15,.04,5);
  const tree=branches(scene,segments,0x303831);tree.position.x=0;
  const roots=branches(scene,segments.map(([a,b,r])=>[new THREE.Vector3(a.x,-6.2-a.y,.1),new THREE.Vector3(b.x,-6.2-b.y,.1),r*.8]),0x050806);
  return {...w,update(time,p,o){haze.uniforms.uTime.value=time;tree.scale.y=.45+smooth(0,.7,p)*.55;tree.position.y=-3.1*(1-tree.scale.y);tree.position.x=innerWidth<681?3:0;roots.position.x=tree.position.x;roots.scale.y=.5+p*.5;ground.position.x=-p*.9;tree.rotation.z=Math.sin(time*.45)*.012;}};
}

export function makeLotus() { return createSculptedLotus(); }

function butterfly() {
  const group=new THREE.Group(),wings=[];
  mesh(group,new THREE.CylinderGeometry(.024,.045,.75,8),shaded(0x242922)).rotation.z=.02;
  const texture=canvasTexture((c,cw,ch)=>{
    c.fillStyle='#eeede3';c.fillRect(0,0,cw,ch);c.strokeStyle='#777b7260';c.lineWidth=1.4;
    for(let i=0;i<14;i++){c.beginPath();c.moveTo(0,ch*.58);c.quadraticCurveTo(cw*.45,ch*.4,cw*.96,ch*i/14);c.stroke();}
    c.fillStyle='#343d32';c.beginPath();c.ellipse(cw*.70,ch*.27,12,17,-.3,0,TAU);c.fill();
  },256,256);
  for(const side of [-1,1]){
    const pivot=new THREE.Group();group.add(pivot);wings.push({pivot,side});
    const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(side*.3,.8,side*1.45,1.05,side*1.5,.63);shape.bezierCurveTo(side*1.65,.20,side*.6,-.06,0,0);
    shape.moveTo(0,-.1);shape.bezierCurveTo(side*.8,-.15,side*1.05,-.9,side*.52,-.88);shape.bezierCurveTo(side*.10,-.9,0,-.28,0,-.1);
    const geometry=new THREE.ShapeGeometry(shape,30);geometry.computeBoundingBox();const pos=geometry.attributes.position,uv=[];for(let i=0;i<pos.count;i++)uv.push(Math.abs(pos.getX(i))/1.65,(pos.getY(i)+1)/2.1);geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));mesh(pivot,geometry,shaded(0xffffff,{map:texture}));
  }
  for(const side of [-1,1])line(group,[new THREE.Vector3(side*.02,.36,.01),new THREE.Vector3(side*.18,.69,.01),new THREE.Vector3(side*.25,.73,.01)],0x3e473a,.7);
  return {group,update(time){wings.forEach(({pivot,side})=>pivot.rotation.y=side*(.2+Math.sin(time*3.2)*.55));}};
}

export function createLotus() {
  const w=world('#e3e2d9',true),{scene,camera}=w;scene.fog=new THREE.FogExp2('#e3e2d9',.025);
  const lotus=makeLotus();lotus.group.position.set(1,-.7,1);scene.add(lotus.group);
  const moth=butterfly();moth.group.position.set(1.2,3.1,1.3);moth.group.scale.setScalar(.9);scene.add(moth.group);
  const blotMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uFade:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uFade;${glslNoise}void main(){vec2 p=vUv-.5;float angle=atan(p.y,p.x),radius=length(p);vec2 curl=vec2(sin(angle*3.+radius*19.+uTime*.10),cos(angle*2.-radius*17.-uTime*.08));float smoke=fbm(vUv*6.+curl*.26+vec2(uTime*.012,0.));float d=length(p*vec2(1.,.9))-.33+(smoke-.5)*.18;float alpha=1.-smoothstep(-.025,.070,d);float fold=pow(.5+.5*sin(smoke*21.+radius*25.),3.);vec3 ink=mix(vec3(.004,.007,.006),vec3(.20,.22,.19),fold*.78);gl_FragColor=vec4(ink,alpha*.92*uFade);}`});
  const blot=plane(scene,6.9,5.5,blotMat,1.3,3.4,-.1);
  const pagoda=new THREE.Group();pagoda.position.set(4.8,-.3,-4);pagoda.scale.setScalar(.72);scene.add(pagoda);
  for(let level=0;level<3;level++){
    const width=1.65-level*.33,y=level*.86;
    const roof=new THREE.CatmullRomCurve3([new THREE.Vector3(-width,y+.50,0),new THREE.Vector3(-width*.65,y+.43,0),new THREE.Vector3(0,y+.73,0),new THREE.Vector3(width*.65,y+.43,0),new THREE.Vector3(width,y+.50,0)]);
    line(pagoda,roof.getPoints(40),0x7d897b,.31);
    line(pagoda,[new THREE.Vector3(-width*.65,y+.40,0),new THREE.Vector3(-width*.65,y-.25,0)],0x7d897b,.24);
    line(pagoda,[new THREE.Vector3(width*.65,y+.40,0),new THREE.Vector3(width*.65,y-.25,0)],0x7d897b,.24);
    line(pagoda,[new THREE.Vector3(-width*.65,y-.25,0),new THREE.Vector3(width*.65,y-.25,0)],0x929d8f,.16);
  }
  line(pagoda,[new THREE.Vector3(0,2.45,0),new THREE.Vector3(0,3.10,0)],0x929d8f,.24);
  const mistMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float uTime;${glslNoise}void main(){float n=fbm(vUv*vec2(4.,2.)+vec2(uTime*.025,0.));float alpha=(1.-smoothstep(.05,.90,vUv.y))*n*.58;gl_FragColor=vec4(.22,.24,.22,alpha);}`});
  plane(scene,35,3.5,mistMat,0,-4.8,2);
  return {...w,update(time,p,o){
    const open=smooth(.05,.85,p);lotus.update(time,o.reduced?1:Math.max(.08,open));lotus.group.rotation.y=Math.sin(time*.15)*.13+o.pointer.x*.10;
    const mobile=innerWidth<681;lotus.group.position.x=mobile?.45:.6;lotus.group.scale.setScalar(mobile?.70:1.22);pagoda.position.x=mobile?1.7:4.8;pagoda.scale.setScalar(mobile?.46:.72);
    moth.update(time);moth.group.scale.setScalar(mobile?.62:.9);moth.group.position.x=(mobile?.6:1.2)+Math.sin(time*.7)*.18+o.pointer.x*.18;moth.group.position.y=3.05+Math.sin(time*1.2)*.12;
    blotMat.uniforms.uTime.value=time;blotMat.uniforms.uFade.value=1-smooth(.36,.84,p);mistMat.uniforms.uTime.value=time;blot.scale.setScalar(1-open*.18);moth.group.traverse(item=>{if(item.isMesh){item.material.transparent=true;item.material.opacity=1-smooth(.42,.94,p)*.88;}});
    lotus.group.position.y=-3.35-open*.10;camera.position.z=16-p*.8;
  }};
}

function brushArc(c,fraction,{cx=512,cy=512,radius=330,start=-Math.PI*.64,sweep=-TAU*.925,seed=719,w0=4,w1=54}={}){
  const rnd=random(seed),steps=Math.max(4,Math.ceil(560*fraction)),outer=[],inner=[],max=sweep*fraction;
  const width=t=>(w0+(w1-w0)*Math.pow(t,.68))*(.91+.09*Math.sin(t*9.));
  for(let i=0;i<=steps;i++){
    const t=i/steps*fraction,a=start+i/steps*max,r=radius+Math.sin(a*7+1)*2.3+Math.sin(a*19)*1.1,rough=Math.sin(a*131)*.8+Math.sin(a*73+1.3)*1.0,w=width(t);
    outer.push([cx+Math.cos(a)*(r+w*.5+rough),cy+Math.sin(a)*(r+w*.5+rough)]);inner.push([cx+Math.cos(a)*(r-w*.5+rough*.6),cy+Math.sin(a)*(r-w*.5+rough*.6)]);
  }
  c.save();c.fillStyle='rgb(8,11,9)';c.shadowColor='rgba(21,22,17,.23)';c.shadowBlur=2.5;c.beginPath();outer.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));inner.reverse().forEach(([x,y])=>c.lineTo(x,y));c.closePath();c.fill();c.shadowBlur=0;
  if(fraction>.995&&Math.abs(sweep)>5){const a=start+sweep,r=radius+Math.sin(a*7+1)*2.3+Math.sin(a*19)*1.1,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;c.beginPath();for(let j=0;j<=36;j++){const angle=j/36*TAU,rr=width(1)*(.43+Math.sin(j*2.7)*.035);const px=x+Math.cos(angle)*rr,py=y+Math.sin(angle)*rr;if(j===0)c.moveTo(px,py);else c.lineTo(px,py);}c.closePath();c.fill();}
  c.globalCompositeOperation='destination-out';
  for(let fiber=0;fiber<18;fiber++){
    const offset=(rnd()-.5)*.91,phase=rnd()*20,begin=rnd()*.22;c.strokeStyle=`rgba(0,0,0,${.025+rnd()*.07})`;c.lineWidth=.3+rnd()*.4;c.beginPath();
    for(let i=0;i<=210;i++){const t=begin+(fraction-begin)*i/210;if(t<0||t>fraction)continue;const a=start+sweep*t,r=radius+offset*width(t)+Math.sin(t*37+phase)*.65+Math.sin(a*7+1)*2.3;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();
  }
  c.globalCompositeOperation='source-over';
  for(let i=0;i<200;i++){const t=rnd()*fraction,a=start+sweep*t,edge=rnd()>.5?1:-1,r=radius+edge*(width(t)*.5+rnd()*2.6);c.fillStyle=`rgba(16,19,14,${.10+rnd()*.27})`;c.beginPath();c.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,.3+rnd()*1.2,0,TAU);c.fill();}
  c.restore();
}

export function createEnso() {
  const w=world('#e9e5d9',true),{scene}=w;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const stroke=plane(scene,7.1,7.1,basic(0xffffff,{map:texture,transparent:true,depthWrite:false}),-.8,.3,0);
  let last=-1,lastCycle=-1,restart=0;
  return {...w,update(time,p,o){
    if(lastCycle!==o.strokeCycle){lastCycle=o.strokeCycle;restart=time;last=-1;}
    const fraction=o.reduced?1:Math.min(1,Math.max(p/.75,(time-restart)/3.4)),tick=Math.floor(fraction*120);
    if(tick!==last){c.clearRect(0,0,1024,1024);brushArc(c,tick/120);texture.needsUpdate=true;last=tick;}
    stroke.position.x=(innerWidth<681?0:-.8)+o.pointer.x*.025;stroke.position.y=innerWidth<681?1:.3;stroke.rotation.z=Math.sin(time*.1)*.002;
  }};
}

export function createEnding() {
  const w=world('#e5dfcf',true),{scene,camera}=w,rnd=random(382);
  const skyMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float uTime;${glslNoise}void main(){float edge=.77+sin(vUv.x*12.+uTime*.1)*.015+(fbm(vUv*8.)-.5)*.02;float m=smoothstep(edge-.003,edge+.003,vUv.y);gl_FragColor=vec4(mix(vec3(.78,.74,.64),vec3(.003,.005,.007),m),1.);}`});plane(scene,40,12,skyMat,0,0,-2);
  const starsGeo=new THREE.BufferGeometry(),stars=[];for(let i=0;i<160;i++)stars.push((rnd()-.5)*32,3.7+rnd()*2,-1);starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xe6e5d9,size:.032,transparent:true,opacity:.7})));
  mesh(scene,new THREE.CircleGeometry(.20,32),basic(0xe8e7dd),5.5,4.3,-.8);
  const smileTex=canvasTexture((c,cw,ch)=>{
    c.clearRect(0,0,cw,ch);brushArc(c,1,{cx:512,cy:400,radius:300,start:.17*Math.PI,sweep:.66*Math.PI,seed:892,w0:43,w1:47});
    for(const x of [380,643]){c.fillStyle='#151813';c.beginPath();c.roundRect(x-15,310,30,95,14);c.fill();}
  },1024,1024);
  const smile=plane(scene,8.2,8.2,basic(0xffffff,{map:smileTex,transparent:true,depthWrite:false}),0,.2,0);
  const tape=makeCassette();tape.group.visible=false;scene.add(tape.group);
  return {...w,update(time,p,o){skyMat.uniforms.uTime.value=time;smile.rotation.z=Math.sin(time*.3)*.025;smile.position.y=.2+Math.sin(time*.5)*.025;tape.group.visible=o.jump>0;tape.group.position.set(0,0,2);tape.group.scale.setScalar(.3+o.jump*4);tape.group.rotation.set(.2,o.jump*Math.PI*2,.1);tape.reels.forEach(r=>r.rotation.z=time);camera.position.z=16;}};
}

export const sceneCreators={0:createCover,2:createScrapbook,3:createRose,4:createForest,5:createSeasons,6:createRoots,7:createLotus,8:createEnso,9:createEnding};
