import * as THREE from 'three';
import { random } from './paper.js';

const TAU=Math.PI*2;
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.9999,1.);}`;
const noise=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n2(p);p=mat2(1.6,1.2,-1.2,1.6)*p+12.;a*=.5;}return s;}`;
const landscapeFragment=/*glsl*/`
precision highp float;
varying vec2 vUv;
uniform float uTime,uAspect,uWinter,uAutumn;
uniform vec3 uSky,uHorizon,uWater,uMountain,uLight;
${noise}
void main(){
  vec2 uv=vUv;float horizon=.465;
  float skyHeight=clamp((uv.y-horizon)/(1.-horizon),0.,1.);
  vec3 color=mix(uHorizon,uSky,pow(skyHeight,.64));
  float clouds=fbm(vec2(uv.x*4.7,uv.y*9.)+vec2(uTime*.004,0.));
  color+=vec3(.045,.031,.025)*(clouds-.47)*(1.-uWinter*.65);
  vec2 lightPos=mix(vec2(.515,horizon+.025),vec2(.19,.77),uWinter);
  vec2 q=(uv-lightPos)*vec2(uAspect,1.);float d=length(q);
  vec3 aura=uLight*exp(-d*d/0.012)*(1.-uWinter)*.65;
  color+=aura;
  float disc=1.-smoothstep(.0235,.0255,d);
  if(uWinter>.5){float cut=1.-smoothstep(.020,.022,length(q-vec2(.012,.008)));disc*=1.-cut;}
  color=mix(color,uLight*1.35,disc);
  if(uv.y<horizon){
    float depth=clamp((horizon-uv.y)/horizon,0.,1.);
    float x=uv.x+sin(uv.y*53.+uTime*.42)*.0008;
    vec3 water=mix(uHorizon*.37,uWater,pow(depth,.35));
    float phase=uv.y*640./(.27+depth)+uTime*.62;
    float broken=n2(vec2(x*530./(.35+depth),phase*.24));
    float glint=pow(max(0.,sin(phase+broken*3.)),5.)*smoothstep(.40,.83,broken);
    float width=.006+.080*pow(depth,.82);
    float path=exp(-pow(abs(x-lightPos.x)/width,1.65));
    water+=uLight*path*(.13+glint*(.75+depth*.65))*(1.-uWinter*.45);
    water+=(n2(vec2(x*850.,uv.y*1100.-uTime*.14))-.5)*.012;
    float shoreline=.32+.22*depth+fbm(vec2(uv.y*10.,uv.x*9.))*.035;
    float bank=smoothstep(shoreline,shoreline+.012,abs(uv.x-.5))*smoothstep(.08,.88,depth);
    vec3 bankColor=mix(vec3(.055,.045,.029),vec3(.024,.011,.019),uAutumn);bankColor=mix(bankColor,vec3(.25,.31,.40),uWinter);
    float autumnHill=(1.-smoothstep(-.006,.006,uv.y-(.45-.91*pow(uv.x,1.6))))*uAutumn;bank=max(bank,autumnHill);float snowFloor=(1.-smoothstep(.08,.16,uv.y+n2(vec2(uv.x*9.,3.))*.025))*uWinter;bank=max(bank,snowFloor);color=mix(water,bankColor,bank);
  }else{
    float valley=exp(-pow((uv.x-.515)/.12,2.));
    for(int i=0;i<4;i++){
      float layer=float(i),shape=fbm(vec2(uv.x*5.5+layer*13.,layer*5.+1.));
      shape+=n2(vec2(uv.x*39.+layer*4.,layer+3.))*.15;
      float ridge=horizon+(.035+shape*(.125-layer*.020))*(1.-valley*.88);
      float edge=1.-smoothstep(ridge-.001,ridge+.002,uv.y);
      vec3 mountain=mix(uMountain,uHorizon,.31-layer*.075);
      color=mix(color,mountain,edge);
    }
  }
  // A soft atmospheric veil binds the far shore and sunset together.
  color=mix(color,uHorizon,exp(-abs(uv.y-horizon)*115.)*.10*(1.-uWinter));
  if(uWinter>.01&&uv.y>horizon){vec2 cells=uv*vec2(180.,110.);float star=step(.995,hash(floor(cells)))*(1.-smoothstep(.02,.13,length(fract(cells)-.5)));color+=star*uWinter*.42;}
  gl_FragColor=vec4(color,1.);
}`;

function texture(draw,w=512,h=512){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
function dandelion(){return texture((c,w,h)=>{
  const rnd=random(731);c.clearRect(0,0,w,h);const cx=w*.49,cy=h*.53;
  // Leave missing seeds and uneven radii, rather than drawing luminous discs.
  for(let i=0;i<64;i++){
    if(rnd()<.17)continue;
    const a=i/64*TAU+(rnd()-.5)*.12,r=w*(.20+rnd()*.21),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
    c.strokeStyle=`rgba(239,233,212,${.22+rnd()*.40})`;c.lineWidth=.65+rnd()*.8;
    c.beginPath();c.moveTo(cx,cy);c.quadraticCurveTo((cx+x)/2+3,(cy+y)/2-4,x,y);c.stroke();
    for(let j=0;j<4;j++){const b=a+(j-1.5)*.57;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(b)*(4+rnd()*5),y+Math.sin(b)*(4+rnd()*5));c.stroke();}
  }
  c.fillStyle='rgba(167,141,76,.7)';c.beginPath();c.ellipse(cx,cy,w*.018,h*.027,-.2,0,TAU);c.fill();
},384,384);}
function lavender(){return texture((c,w,h)=>{const rnd=random(419);c.clearRect(0,0,w,h);c.strokeStyle='#66684f';c.lineWidth=3;c.beginPath();c.moveTo(w*.5,h);c.bezierCurveTo(w*.45,h*.65,w*.55,h*.35,w*.5,h*.1);c.stroke();for(let j=0;j<14;j++)for(let side of[-1,1]){const y=h*(.10+j*.038),x=w*.5+side*(.1+Math.sin(j*.7)*.015)*w;c.fillStyle=`rgba(${111+rnd()*24},${80+rnd()*18},${151+rnd()*32},${.65+rnd()*.3})`;c.beginPath();c.ellipse(x,y,w*(.055+rnd()*.03),h*.025,side*.7,0,TAU);c.fill();}},256,768);}
function pine(seed){return texture((c,w,h)=>{
  const rnd=random(seed),lean=(rnd()-.5)*w*.10;
  const center=t=>w*.50+lean*t+Math.sin(t*7+seed)*w*.009;
  const envelope=t=>w*(.018+.40*Math.pow(t,.88))*(.90+.10*Math.sin(t*15+seed));
  c.clearRect(0,0,w,h);
  // The crown is a connected dark mass with a ragged, asymmetric outline.
  // Individual needles sit on that body; they do not form evenly spaced rails.
  const outline=[];
  for(const side of[-1,1]){
    const edge=[];
    for(let j=0;j<=38;j++){
      const t=j/38,y=h*(.045+t*.87),reach=envelope(t)*(.66+rnd()*.43);
      edge.push([center(t)+side*reach,y+h*(rnd()-.5)*.015]);
      if(j>3&&rnd()>.45)edge.push([center(t)+side*reach*(.64+rnd()*.20),y+h*.012]);
    }
    outline.push(...(side<0?edge:edge.reverse()));
  }
  c.fillStyle='#122334';c.beginPath();outline.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
  c.strokeStyle='#182a37';c.lineWidth=w*.009;c.beginPath();c.moveTo(center(1),h*.99);c.bezierCurveTo(center(.7),h*.74,center(.3),h*.27,center(0),h*.035);c.stroke();
  const clusters=[];
  for(let i=0;i<165;i++){
    const t=.025+rnd()*.90,side=rnd()>.5?1:-1,reach=envelope(t),u=Math.pow(rnd(),.7);
    const x=center(t)+side*reach*u,y=h*(.045+t*.87)+reach*u*.13;
    const rx=w*(.013+t*.026)*(.65+rnd()*.85),ry=h*(.005+t*.011)*(.6+rnd()*.85);
    clusters.push({x,y,rx,ry,side,t});
  }
  clusters.sort((a,b)=>a.y-b.y);
  for(const q of clusters){
    const {x,y,rx,ry,side,t}=q;
    c.fillStyle=rnd()>.48?'#172c3c':'#1d3341';
    c.beginPath();c.ellipse(x,y,rx*1.4,ry*1.1,side*.25,0,TAU);c.fill();
    // Short, downward sprays break the silhouette into organic needle tufts.
    c.strokeStyle=rnd()>.5?'rgba(34,59,69,.82)':'rgba(13,30,43,.9)';c.lineWidth=.6+rnd()*1.0;
    for(let n=0;n<9;n++){
      const a=side*.45+(rnd()-.5)*2.3,len=(5+rnd()*13)*(1+t*.45);
      c.beginPath();c.moveTo(x+(rnd()-.5)*rx,y+(rnd()-.5)*ry);c.lineTo(x+Math.sin(a)*len,y+Math.cos(a)*len);c.stroke();
    }
    if(rnd()<.47){
      // Broken snow cushions follow selected branch tops, leaving dark gaps.
      const pieces=2+Math.floor(rnd()*3),snowWidth=rx*(.75+rnd()*.65),snowY=y-ry*.75;
      c.fillStyle=`rgba(207,222,229,${.37+rnd()*.36})`;
      for(let k=0;k<pieces;k++){
        const sx=x-snowWidth*.5+k/pieces*snowWidth,sw=snowWidth/pieces*(.62+rnd()*.38),sh=ry*(.26+rnd()*.44);
        c.beginPath();c.moveTo(sx,snowY+sh*.45);c.bezierCurveTo(sx+sw*.05,snowY-sh*.8,sx+sw*.5,snowY-sh,sx+sw*.76,snowY-sh*.1);c.lineTo(sx+sw,snowY+sh*.45);c.quadraticCurveTo(sx+sw*.4,snowY+sh,sx,snowY+sh*.45);c.fill();
      }
    }
  }
},384,768);}

export function createPainterlySeasons(){
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-9,9,5.5,-5.5,.1,100);camera.position.set(0,0,16);camera.lookAt(0,0,0);
  const uniform={uTime:{value:0},uAspect:{value:1},uWinter:{value:0},uAutumn:{value:0},uSky:{value:new THREE.Color()},uHorizon:{value:new THREE.Color()},uWater:{value:new THREE.Color()},uMountain:{value:new THREE.Color()},uLight:{value:new THREE.Color()}};
  const background=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:uniform,vertexShader:vertex,fragmentShader:landscapeFragment,depthWrite:false,depthTest:false}));background.frustumCulled=false;background.renderOrder=-100;scene.add(background);
  const palettes=[['#79618d','#ffd4a9','#94757c','#5c4566','#ffdfa1'],['#79618b','#ffc274','#89625e','#5d425e','#ffe298'],['#63324e','#ff9657','#683c4a','#4f344c','#ffb97d'],['#071329','#233957','#101c35','#12213c','#b8cce7']].map(row=>row.map(hex=>new THREE.Color(hex)));
  const rnd=random(82241),dummy=new THREE.Object3D(),seedBlades=[];
  const grassClumps=[];
  for(let i=0;i<42;i++){
    const side=rnd()<.54?-1:1,depth=Math.pow(rnd(),1.5),gap=.23+(1-depth)*.10;
    const x=side*(gap+rnd()*(1.06-gap)),spread=.012+rnd()*.033;
    const clump={x,depth,spread,height:.62+rnd()*.70};grassClumps.push(clump);
    const count=8+Math.floor(rnd()*10);
    for(let j=0;j<count;j++){
      const bladeDepth=THREE.MathUtils.clamp(depth+(rnd()-.5)*.07,0,1);
      seedBlades.push({x:x+(rnd()+rnd()-1)*spread,depth:bladeDepth,height:(.24+Math.pow(1-bladeDepth,1.3)*3.7)*clump.height*(.40+rnd()*.90),width:.55+rnd()*.8,lean:(rnd()-.5)*.72,phase:rnd()*TAU});
    }
  }
  // A few isolated stems keep the gaps from reading as repeated clump stamps.
  for(let i=0;i<60;i++){
    const side=rnd()<.5?-1:1,depth=rnd();seedBlades.push({x:side*(.30+rnd()*.73),depth,height:(.22+Math.pow(1-depth,1.2)*3.5)*(.45+rnd()*.6),width:.5+rnd()*.8,lean:(rnd()-.5)*.8,phase:rnd()*TAU});
  }
  const bladePositions=[],bladeUvs=[],bladeIndices=[];
  for(let j=0;j<=14;j++)for(let side=0;side<2;side++){const t=j/14;bladePositions.push((side-.5)*.026*Math.pow(1-t,.8)+Math.sin(t*1.8)*.09,t,0);bladeUvs.push(side,t);if(j<14&&side===0){const k=j*2;bladeIndices.push(k,k+2,k+1,k+1,k+2,k+3);}}
  const bladeGeo=new THREE.BufferGeometry();bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute(bladePositions,3));bladeGeo.setAttribute('uv',new THREE.Float32BufferAttribute(bladeUvs,2));bladeGeo.setIndex(bladeIndices);
  const grassUniforms={uTime:uniform.uTime,uColorA:{value:new THREE.Color()},uColorB:{value:new THREE.Color()}};
  const grassMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:grassUniforms,vertexShader:`uniform float uTime;varying vec2 vUv;varying float vSeed,vNear;void main(){vUv=uv;vec4 p=instanceMatrix*vec4(position,1.);vNear=clamp((instanceMatrix[3].z-.25)/.45,0.,1.);vSeed=fract(sin(dot(instanceMatrix[3].xy,vec2(31.7,17.1)))*4783.);p.x+=sin(uTime*.65+vSeed*8.+p.y*.6)*pow(uv.y,1.8)*(.04+vSeed*.07);gl_Position=projectionMatrix*modelViewMatrix*p;}`,fragmentShader:`uniform vec3 uColorA,uColorB;varying vec2 vUv;varying float vSeed,vNear;void main(){vec3 c=mix(uColorA,uColorB,.18+vSeed*.38+vUv.y*.26);float alpha=(1.-smoothstep(.38,.51,abs(vUv.x-.5)))*(.30+vSeed*.40)*(.65+vNear*.35);gl_FragColor=vec4(c,alpha);}`});
  const grass=new THREE.InstancedMesh(bladeGeo,grassMat,seedBlades.length);scene.add(grass);
  const fluffMat=new THREE.MeshBasicMaterial({map:dandelion(),transparent:true,depthWrite:false,side:THREE.DoubleSide,color:0xe0d5b9,opacity:.83});
  const flowers=new THREE.InstancedMesh(new THREE.PlaneGeometry(.62,.62),fluffMat,28),stemPositions=[];scene.add(flowers);
  const lavenderMat=new THREE.MeshBasicMaterial({map:lavender(),transparent:true,depthWrite:false,side:THREE.DoubleSide});const lavenders=new THREE.InstancedMesh(new THREE.PlaneGeometry(.28,1.20),lavenderMat,210);scene.add(lavenders);
  const flowerSeeds=Array.from({length:28},(_,i)=>{
    const clump=grassClumps[(i*11+3)%grassClumps.length],depth=THREE.MathUtils.clamp(clump.depth+(rnd()-.5)*.12,0,1);
    return {x:clump.x+(rnd()-.5)*.055,depth,y:-5.75+depth*4.5,h:(.65+(1-depth)*3.1)*(.72+rnd()*.48),scale:(.35+(1-depth)*.52)*(.65+rnd()*.5),lean:(rnd()-.5)*.26};
  });
  const lavenderSeeds=Array.from({length:210},(_,i)=>({side:i%2?1:-1,x:.18+rnd()*.76,y:-5.6+rnd()*3.3,h:.9+rnd()*1.9}));
  const pineMaps=[971,1104,2116,4105,5307,6982].map(pine),pines=new THREE.Group();scene.add(pines);const treeItems=[];
  const groves=[
    {x:-.83,count:5,near:false},{x:-.48,count:4,near:false},{x:.58,count:5,near:false},{x:.94,count:4,near:false},
    {x:-1.03,count:3,near:true},{x:-.72,count:3,near:true},{x:.79,count:4,near:true},{x:1.10,count:2,near:true},
  ];
  let treeIndex=0;
  for(const grove of groves)for(let j=0;j<grove.count;j++){
    const near=grove.near,x=grove.x+(rnd()+rnd()-1)*(near?.18:.22),height=near?2.8+rnd()*2.8:1.05+rnd()*1.35;
    const mat=new THREE.MeshBasicMaterial({map:pineMaps[treeIndex%pineMaps.length],transparent:true,depthWrite:false,color:near?0xd1d8df:0x6f8298,opacity:near?.96:.68+rnd()*.15});
    const item=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat);item.rotation.z=(rnd()-.5)*.045;
    treeItems.push({item,x,height,width:height*(.35+rnd()*.18),base:near?-5.9+rnd()*.75:-.50+rnd()*.14,z:near?1.05+rnd()*.20:.15+rnd()*.10});pines.add(item);treeIndex++;
  }
  const leafTexture=texture((c,w,h)=>{const r=random(432);c.clearRect(0,0,w,h);for(let i=0;i<12000;i++){const a=r()*TAU,rr=Math.sqrt(r()),x=w*.5+Math.cos(a)*rr*w*.4,y=h*.5+Math.sin(a)*rr*h*.45;c.fillStyle=`rgba(${145+r()*75},${20+r()*28},${23+r()*26},${.65+r()*.35})`;c.beginPath();c.ellipse(x,y,1+r()*4,1+r()*3,r()*4,0,TAU);c.fill();}},512,512);
  const autumnTree=new THREE.Group();scene.add(autumnTree);const crown=new THREE.Mesh(new THREE.PlaneGeometry(2.75,2.4),new THREE.MeshBasicMaterial({map:leafTexture,transparent:true,depthWrite:false}));crown.position.set(.38,3.18,.4);crown.rotation.z=.45;autumnTree.add(crown);
  const stem=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(-.12,1.1,0),new THREE.Vector3(.2,2.4,0),new THREE.Vector3(.48,3.35,0)]);autumnTree.add(new THREE.Mesh(new THREE.TubeGeometry(stem,28,.075,7,false),new THREE.MeshBasicMaterial({color:0x281b23})));
  const snowGeometry=new THREE.BufferGeometry(),snowPositions=[];for(let i=0;i<450;i++)snowPositions.push((rnd()-.5)*25,(rnd()-.5)*16,rnd()*5+1);snowGeometry.setAttribute('position',new THREE.Float32BufferAttribute(snowPositions,3));const snow=new THREE.Points(snowGeometry,new THREE.PointsMaterial({color:0xe2e8ef,size:1.65,sizeAttenuation:false,transparent:true,opacity:.52,depthWrite:false}));scene.add(snow);
  let aspect=1,current=0,lastAspect=0,stems;
  function resize(next){
    aspect=next;uniform.uAspect.value=aspect;camera.left=-5.5*aspect;camera.right=5.5*aspect;camera.updateProjectionMatrix();
    if(Math.abs(aspect-lastAspect)<.002)return;lastAspect=aspect;
    for(let i=0;i<seedBlades.length;i++){const s=seedBlades[i];dummy.position.set(s.x*5.5*aspect,-5.7+s.depth*4.75,.70-s.depth*.45);dummy.rotation.set(0,0,s.lean);dummy.scale.set(s.width,s.height,1);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);}grass.instanceMatrix.needsUpdate=true;grass.computeBoundingSphere();
    stemPositions.length=0;
    flowerSeeds.forEach((s,i)=>{
      const x=s.x*5.5*aspect,headX=x+s.lean,headY=s.y+s.h,z=.76-s.depth*.37;
      dummy.position.set(headX,headY,z);dummy.rotation.set(0,0,s.lean*.6);dummy.scale.setScalar(s.scale);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);
      for(let k=0;k<7;k++){const a=k/7,b=(k+1)/7;stemPositions.push(x+s.lean*a*a,s.y+s.h*a,z-.02,x+s.lean*b*b,s.y+s.h*b,z-.02);}
    });flowers.instanceMatrix.needsUpdate=true;flowers.computeBoundingSphere();
    if(stems){scene.remove(stems);stems.geometry.dispose();stems.material.dispose();}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(stemPositions,3));stems=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0x827b59,transparent:true,opacity:.29}));scene.add(stems);
    lavenderSeeds.forEach((s,i)=>{dummy.position.set(s.side*s.x*5.5*aspect,s.y+s.h*.55,.9);dummy.rotation.set(0,0,(i%9-4)*.025);dummy.scale.set(1,s.h,1);dummy.updateMatrix();lavenders.setMatrixAt(i,dummy.matrix);});lavenders.instanceMatrix.needsUpdate=true;lavenders.computeBoundingSphere();
    for(const t of treeItems){t.item.position.set(t.x*5.5*aspect,t.base+t.height*.5,t.z);t.item.scale.set(t.width,t.height,1);}
    autumnTree.position.set(-aspect*4.05,-1.3,1.3);
  }
  return {scene,camera,resize,get season(){return current;},update(time,progress,o){
    let target=o.season===null?THREE.MathUtils.clamp(progress*4,0,3):o.season;if(o.side&&o.season===null)target=3-target;current=target;
    const a=Math.floor(target),b=Math.min(3,a+1),t=target-a;['uSky','uHorizon','uWater','uMountain','uLight'].forEach((key,i)=>uniform[key].value.copy(palettes[a][i]).lerp(palettes[b][i],t));
    uniform.uTime.value=time;const winter=THREE.MathUtils.smoothstep(target,2.3,3);uniform.uWinter.value=winter;uniform.uAutumn.value=Math.max(0,1-Math.abs(target-2));
    grass.visible=target<1.75;flowers.visible=target>.5&&target<1.8;stems.visible=flowers.visible;lavenders.visible=target<.85;pines.visible=winter>.04;autumnTree.visible=target>1.5&&target<2.6;
    grassUniforms.uColorA.value.set(target<.6?0x595a43:target<1.65?0x6a6637:0x4c232b);grassUniforms.uColorB.value.set(target<.6?0xaaa286:target<1.65?0xc9b974:0xa55c48);
    flowers.rotation.z=Math.sin(time*.23)*.004;lavenders.rotation.z=Math.sin(time*.3)*.007;autumnTree.rotation.z=Math.sin(time*.4)*.008;
    snow.visible=winter>.4;snow.position.y=-(time*.25)%6;snow.position.x=Math.sin(time*.15)*.25;
    camera.position.x=o.pointer.x*.035;camera.position.y=o.pointer.y*.02;
  }};
}
