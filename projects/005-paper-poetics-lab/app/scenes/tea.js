import * as THREE from 'three';
import { TAU, random, smooth, mesh, matte, basic, canvasTexture, noiseGLSL, disposeScene } from './utils.js';

const clamp=THREE.MathUtils.clamp;

function ceramicTexture(){
  return canvasTexture((c,w,h)=>{
    const rnd=random(2851);c.fillStyle='#edf0e8';c.fillRect(0,0,w,h);
    for(let i=0;i<26000;i++){
      const shade=rnd()>.5?'255,255,246':'91,111,95';c.fillStyle=`rgba(${shade},${.015+rnd()*.027})`;
      c.fillRect(rnd()*w,rnd()*h,.4+rnd()*1.0,.4+rnd()*1.1);
    }
    // Very fine glaze crazing: restrained hairlines, not a mottled plastic skin.
    c.strokeStyle='rgba(98,119,105,.105)';c.lineWidth=.36;
    for(let row=0;row<24;row++)for(let col=0;col<20;col++){
      const x=(col+.25+rnd()*.5)*w/20,y=(row+rnd()*.4)*h/24;
      c.beginPath();c.moveTo(x,y);c.lineTo(x+(rnd()-.5)*16,y+h/24*.55);c.lineTo(x+(rnd()-.5)*20,y+h/24);c.stroke();
    }
  },1024,1024);
}

function lathe(parent,profile,material,segments=96){
  return mesh(parent,new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),segments),material);
}

function taperedTube(parent,points,startRadius,endRadius,material,segments=44){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const geometry=new THREE.TubeGeometry(curve,segments,1,12,false),positions=geometry.attributes.position;
  const center=new THREE.Vector3(),point=new THREE.Vector3();
  for(let i=0;i<=segments;i++){
    curve.getPointAt(i/segments,center);
    const radius=endRadius+(startRadius-endRadius)*Math.pow(1-i/segments,1.25);
    for(let j=0;j<=12;j++){
      const index=i*13+j;point.fromBufferAttribute(positions,index).sub(center).multiplyScalar(radius).add(center);
      positions.setXYZ(index,point.x,point.y,point.z);
    }
  }
  geometry.computeVertexNormals();return {object:mesh(parent,geometry,material),curve};
}

function leafGeometry(length=.72,width=.22){
  const positions=[],uvs=[],indices=[],rows=22,columns=8;
  for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){
    const t=j/rows,u=i/columns*2-1,profile=Math.pow(Math.sin(t*Math.PI),.70);
    positions.push(u*width*profile,length*t,.16*Math.sin(t*Math.PI)-u*u*.08*profile);
    uvs.push(i/columns,t);
    if(j<rows&&i<columns){const k=j*(columns+1)+i;indices.push(k,k+1,k+columns+1,k+1,k+columns+2,k+columns+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

function makeSteam(parent,{height=3,width=1.3,opacity=.2,seed=1,preview=false}={}){
  const group=new THREE.Group(),materials=[];parent.add(group);
  for(let i=0;i<(preview?2:3);i++){
    const material=new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,side:THREE.DoubleSide,
      uniforms:{uTime:{value:0},uHeat:{value:1},uSeed:{value:seed+i*4.7},uOpacity:{value:opacity*(i===0?1:.62)},uColor:{value:new THREE.Color(i===1?'#94a18c':i===0?'#edf0e1':'#d2dbc7')}},
      vertexShader:`uniform float uTime,uSeed;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;float t=uv.y;p.x+=sin(t*6.8-uTime*.34+uSeed)*(.025+t*.16)+sin(t*14.+uTime*.21)*t*.035;p.z+=sin(t*5.+uSeed+uTime*.2)*t*.08;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader:`uniform float uTime,uHeat,uSeed,uOpacity;uniform vec3 uColor;varying vec2 vUv;${noiseGLSL}void main(){float t=vUv.y;float center=.5+sin(t*8.2-uTime*.33+uSeed)*(.02+t*.13)+sin(t*17.+uTime*.19+uSeed)*.025;float width=.019+t*.063;float plume=exp(-pow(abs(vUv.x-center)/width,2.));float curl=exp(-pow(abs(vUv.x-center-.085*sin(t*15.-uTime*.31))/max(.012,width*.55),2.))*.32;float life=smoothstep(.0,.13,t)*(1.-smoothstep(.55,1.,t));float vapor=.58+.42*fbm(vec2(vUv.x*8.+uSeed,t*6.-uTime*.13));gl_FragColor=vec4(uColor,(plume+curl)*life*vapor*uOpacity*uHeat);}`,
    });
    const ribbon=mesh(group,new THREE.PlaneGeometry(width,height,12,32),material,(i-1)*.035,height*.5,i*.035);
    ribbon.rotation.y=(i-1)*.21;materials.push(material);
  }
  return {group,update(time,heat){for(const material of materials){material.uniforms.uTime.value=time;material.uniforms.uHeat.value=heat;}}};
}

function makeStream(parent){
  const rings=30,sides=7,positions=new Float32Array((rings+1)*(sides+1)*3),uvs=[],indices=[];
  for(let i=0;i<=rings;i++)for(let j=0;j<=sides;j++){
    uvs.push(j/sides,i/rings);
    if(i<rings&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uTime:{value:0},uFlow:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform float uTime,uFlow;varying vec2 vUv;void main(){float highlight=pow(max(0.,cos((vUv.x-.28)*6.283)),9.);float movement=.77+.23*sin(vUv.y*39.-uTime*13.);vec3 amber=mix(vec3(.26,.14,.037),vec3(.80,.62,.25),highlight);gl_FragColor=vec4(amber,uFlow*movement*(.58+highlight*.34));}`});
  const object=mesh(parent,geometry,material);object.frustumCulled=false;object.renderOrder=5;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),point=new THREE.Vector3(),tangent=new THREE.Vector3(),normal=new THREE.Vector3(),binormal=new THREE.Vector3(),up=new THREE.Vector3(0,0,1);
  const curve=new THREE.CubicBezierCurve3(new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3());
  return {update(time,flow,start,end){
    object.visible=flow>.015;material.uniforms.uFlow.value=flow;material.uniforms.uTime.value=time;if(!object.visible)return;
    curve.v0.copy(start);curve.v1.copy(start).add(a.set(.35,-.06,.07));curve.v2.copy(end).add(b.set(-.14,.35,-.03));curve.v3.copy(end);
    for(let i=0;i<=rings;i++){
      const t=i/rings;curve.getPoint(t,point);curve.getTangent(t,tangent);normal.crossVectors(tangent,up).normalize();binormal.crossVectors(tangent,normal).normalize();
      const radius=(.017-t*.006)*(.65+flow*.35);
      for(let j=0;j<=sides;j++){
        const angle=j/sides*TAU,k=(i*(sides+1)+j)*3;
        positions[k]=point.x+radius*(normal.x*Math.cos(angle)+binormal.x*Math.sin(angle));
        positions[k+1]=point.y+radius*(normal.y*Math.cos(angle)+binormal.y*Math.sin(angle));
        positions[k+2]=point.z+radius*(normal.z*Math.cos(angle)+binormal.z*Math.sin(angle));
      }
    }
    geometry.attributes.position.needsUpdate=true;
  }};
}


function woodTexture(){
  return canvasTexture((c,w,h)=>{
    const rnd=random(4841);c.fillStyle='#d5c9ad';c.fillRect(0,0,w,h);
    for(let i=0;i<1100;i++){
      const y=rnd()*h,phase=rnd()*TAU,amp=1+rnd()*9;
      c.strokeStyle=`rgba(99,77,48,${(.025+rnd()*.085)*.70})`;c.lineWidth=.3+rnd()*1.2;
      c.beginPath();
      for(let j=0;j<=64;j++){const x=j/64*w,yy=y+Math.sin(j/64*8+phase)*amp+Math.sin(j*.51+phase)*.6;j?c.lineTo(x,yy):c.moveTo(x,yy);}
      c.stroke();
    }
    for(let j=1;j<5;j++){const y=j*h/5;c.strokeStyle='rgba(75,58,35,.084)';c.lineWidth=1.1;c.beginPath();c.moveTo(0,y);c.lineTo(w,y+1);c.stroke();}
  },1536,768);
}
function stoneTexture(){
  return canvasTexture((c,w,h)=>{
    const rnd=random(7291);c.fillStyle='#e1dccb';c.fillRect(0,0,w,h);
    for(let i=0;i<17000;i++){
      c.fillStyle=`rgba(${rnd()>.6?'255,251,229':'108,109,86'},${.015+rnd()*.065})`;
      c.beginPath();c.ellipse(rnd()*w,rnd()*h,.3+rnd()*2.5,.2+rnd(),rnd()*TAU,0,TAU);c.fill();
    }
    for(let i=0;i<25;i++){c.strokeStyle='rgba(113,108,81,.045)';c.lineWidth=.5+rnd()*2;c.beginPath();c.moveTo(rnd()*w,0);c.bezierCurveTo(rnd()*w,h*.3,rnd()*w,h*.7,rnd()*w,h);c.stroke();}
  },768,512);
}
function paperTexture(){
  return canvasTexture((c,w,h)=>{
    const rnd=random(9301);c.fillStyle='#e8e4d6';c.fillRect(0,0,w,h);
    for(let i=0;i<15000;i++){c.strokeStyle=`rgba(118,115,92,${.012+rnd()*.025})`;c.lineWidth=.3;c.beginPath();const x=rnd()*w,y=rnd()*h;c.moveTo(x,y);c.lineTo(x+(rnd()-.5)*5,y+1+rnd()*5);c.stroke();}
  },768,768);
}
function roundedSlab(parent,w,d,depth,top,side){
  const r=.20,shape=new THREE.Shape();shape.moveTo(-w/2+r,-d/2);shape.lineTo(w/2-r,-d/2);shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);shape.lineTo(w/2,d/2-r);shape.quadraticCurveTo(w/2,d/2,w/2-r,d/2);shape.lineTo(-w/2+r,d/2);shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);shape.lineTo(-w/2,-d/2+r);shape.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
  const item=mesh(parent,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,steps:1,curveSegments:18}),[top,side]);item.rotation.x=-Math.PI/2;return item;
}
function box(parent,w,h,d,material,x,y,z){return mesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z);}

function mountains(parent){
  const colors=['#d0d8c8','#bdcbb4','#a7bca0','#91ab8c'],layers=[];
  const ridgeKnots=[[-36,2],[-31,4.5],[-26,3.6],[-22,8.1],[-18,5.3],[-13,9.1],[-9,6.4],[-5,10.6],[-1,6.0],[4,8.4],[8,5.2],[13,9.3],[17,5.1],[22,6.5],[27,3.5],[32,5.8],[36,3.5]];
  for(let layer=0;layer<4;layer++){
    const top=[],bottom=-5;
    for(let j=0;j<=260;j++){
      const x=-35+j/260*70,offset=(layer-1.5)*1.75,xx=x+offset;
      let k=0;while(k<ridgeKnots.length-2&&ridgeKnots[k+1][0]<xx)k++;
      const a=ridgeKnots[k],b=ridgeKnots[k+1],f=clamp((xx-a[0])/(b[0]-a[0]),0,1);
      let y=a[1]+(b[1]-a[1])*f;
      y=y*(.46+layer*.02)-layer*.38+Math.sin(x*2.4+layer*2)*.11+Math.sin(x*5.8+layer*4)*.035;
      top.push([x,y]);
    }
    const positions=[],colorsArray=[],indices=[],peak=new THREE.Color(colors[layer]),fog=new THREE.Color('#dce1d1');
    for(let i=0;i<top.length;i++){
      const [x,y]=top[i];positions.push(x,bottom,0,x,y,0);
      const low=fog.clone().lerp(peak,.12);colorsArray.push(low.r,low.g,low.b,peak.r,peak.g,peak.b);
      if(i<top.length-1){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colorsArray,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const material=basic('#ffffff',{vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.78});
    const item=mesh(parent,geometry,material,0,-.25,-35+layer*4.4);layers.push(item);
  }
  const mistUniforms=[];
  for(let i=0;i<3;i++){
    const uniforms={uTime:{value:0},uDensity:{value:1},uColor:{value:new THREE.Color('#e0e4d5')},uSeed:{value:i*6.3}};
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float uTime,uDensity,uSeed;uniform vec3 uColor;${noiseGLSL}void main(){float drift=fbm(vec2(vUv.x*5.+uTime*.007+uSeed,vUv.y*3.));float band=exp(-pow(abs(vUv.y-.48-drift*.07)/.22,2.));gl_FragColor=vec4(uColor,band*(.23+drift*.20)*uDensity);}`});
    mesh(parent,new THREE.PlaneGeometry(66,6),material,0,1.0+i*.25,-31+i*4.5);mistUniforms.push(uniforms);
  }
  return {update(time,progress){for(const uniforms of mistUniforms){uniforms.uTime.value=time;uniforms.uDensity.value=.75+smooth(.58,1,progress)*.7;}layers.forEach((item,i)=>{item.position.x=Math.sin(time*.018+i)*.03;item.material.opacity=.78-smooth(.66,.90,progress)*.24;});}};
}

export function createTeaScene({preview=false}={}){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e4e4d7');scene.environmentIntensity=.30;
  const camera=new THREE.PerspectiveCamera(39,1,.1,90);
  const fill=new THREE.HemisphereLight('#f4f0df','#6c715b',.90);scene.add(fill);
  const key=new THREE.DirectionalLight('#fff2d6',2.85);key.position.set(-1.8,10,-2.5);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=10;key.shadow.camera.bottom=-6;key.shadow.camera.near=.5;key.shadow.camera.far=30;key.shadow.normalBias=.025;key.shadow.bias=-.00015;key.shadow.radius=8;key.shadow.intensity=.62;key.target.position.set(1,0,1);scene.add(key,key.target);
  const softbox=new THREE.DirectionalLight('#e5eee9',1.30);softbox.position.set(2,4,7);scene.add(softbox);
  const warmKey=new THREE.Color('#ffe0aa'),coolKey=new THREE.Color('#eef2e4');

  // The room is real geometry. The opening, sill, table and distant ridges
  // retain their parallax as the viewpoint moves through the three chapters.
  const plaster=paperTexture();plaster.wrapS=plaster.wrapT=THREE.RepeatWrapping;plaster.repeat.set(2,2);
  const wall=matte('#e9e4d4',{map:plaster,bumpMap:plaster,bumpScale:.005,roughness:1});
  const leftWall=box(scene,18,17,.28,wall,-10.8,5,-3.65);leftWall.receiveShadow=true;
  const rightWall=box(scene,14,17,.28,wall,14,5,-3.65);rightWall.receiveShadow=true;
  const upperWall=box(scene,8.8,6,.28,wall,2.6,10,-3.65);upperWall.receiveShadow=true;
  const lowerWall=box(scene,8.8,3,.28,wall,2.6,-.9,-3.65);lowerWall.receiveShadow=true;
  const outside=new THREE.Group();scene.add(outside);
  mesh(outside,new THREE.PlaneGeometry(100,50),basic('#e0e5d9'),0,7,-40);
  const landscape=mountains(outside);
  const windowFrame=new THREE.Group();scene.add(windowFrame);const frameMat=matte('#777b61',{roughness:.92});
  for(const x of[-1.8,7.0])box(windowFrame,.115,6.45,.34,frameMat,x,3.84,-3.36);
  for(const y of[.65,7.02])box(windowFrame,8.93,.13,.34,frameMat,2.6,y,-3.36);
  box(windowFrame,.068,6.25,.16,frameMat,3.2,3.84,-3.37);
  box(windowFrame,8.70,.065,.16,frameMat,2.6,4.88,-3.37);
  box(windowFrame,9.10,.14,.76,matte('#b5b29a'),2.6,.59,-3.17);
  windowFrame.traverse(object=>{if(object.isMesh){object.castShadow=true;object.receiveShadow=true;}});

  const wood=woodTexture();wood.wrapS=wood.wrapT=THREE.RepeatWrapping;wood.repeat.set(.18,.19);
  const tableMat=new THREE.MeshPhysicalMaterial({color:'#b3a38a',map:wood,bumpMap:wood,bumpScale:.013,roughness:.76,clearcoat:.045,clearcoatRoughness:.75});
  const table=box(scene,25,.38,10.4,tableMat,0,-.48,1.95);table.receiveShadow=true;
  const tableFront=box(scene,25,.54,.11,matte('#837354'),0,-.62,7.13);tableFront.receiveShadow=true;

  const tea=new THREE.Group();scene.add(tea);
  const stoneMap=stoneTexture();stoneMap.wrapS=stoneMap.wrapT=THREE.RepeatWrapping;stoneMap.repeat.set(.17,.30);
  const slabTop=matte('#c4c3ad',{map:stoneMap,bumpMap:stoneMap,bumpScale:.013,roughness:.89}),slabSide=matte('#aaa992',{roughness:.97});
  const slab=roundedSlab(tea,6.25,2.85,.13,slabTop,slabSide);slab.position.set(.12,-.265,.35);slab.receiveShadow=true;
  const glaze=ceramicTexture();
  const porcelain=new THREE.MeshPhysicalMaterial({color:'#8fa99c',map:glaze,bumpMap:glaze,bumpScale:.005,roughness:.39,metalness:0,clearcoat:.16,clearcoatRoughness:.34,ior:1.48,specularIntensity:.52,side:THREE.DoubleSide});
  const porcelainLight=new THREE.MeshPhysicalMaterial({color:'#b3c4b5',map:glaze,bumpMap:glaze,bumpScale:.004,roughness:.36,clearcoat:.14,clearcoatRoughness:.36,ior:1.48,specularIntensity:.52,side:THREE.DoubleSide});
  const clayFoot=matte('#aca88d',{roughness:.93}),innerDark=matte('#718975',{roughness:.43});

  // A small pear-shaped celadon pot: defined foot, shoulder, collar and lid.
  const pot=new THREE.Group();tea.add(pot);
  lathe(pot,[[0,.07],[.40,.07],[.51,.11],[.65,.24],[.80,.46],[.89,.72],[.875,.96],[.76,1.17],[.59,1.31],[.48,1.345],[.48,1.40],[.435,1.40],[.435,1.30],[0,1.16]],porcelain,128);
  lathe(pot,[[.36,.025],[.44,.025],[.48,.06],[.47,.105],[.40,.12]],clayFoot,80);
  lathe(pot,[[0,1.515],[.22,1.51],[.38,1.477],[.48,1.425],[.515,1.405],[.51,1.385],[.45,1.38],[0,1.43]],porcelainLight,112);
  lathe(pot,[[0,1.505],[.075,1.505],[.105,1.56],[.09,1.635],[.045,1.665],[0,1.665]],porcelainLight,64);
  const seam=mesh(pot,new THREE.TorusGeometry(.478,.009,8,100),innerDark,0,1.395,0);seam.rotation.x=Math.PI/2;
  mesh(pot,new THREE.SphereGeometry(.015,12,8),basic('#596e59'),.21,1.492,.11);
  taperedTube(pot,[[-.65,1.18,-.02],[-1.22,1.25,-.05],[-1.48,.94,-.02],[-1.38,.55,.01],[-.70,.46,.015]],.070,.063,porcelain,54);
  const spout=taperedTube(pot,[[.64,.54,.01],[.96,.68,.015],[1.19,.96,.045],[1.40,1.25,.12],[1.57,1.29,.23]],.205,.079,porcelain,58);
  const spoutTip=spout.curve.getPointAt(1),mouthDirection=spout.curve.getTangentAt(1),mouthInside=spoutTip.clone().addScaledVector(mouthDirection,-.20);
  taperedTube(pot,[mouthInside.toArray(),spoutTip.toArray()],.058,.065,innerDark,12);
  const lip=mesh(pot,new THREE.TorusGeometry(.074,.010,12,52),porcelainLight,spoutTip.x,spoutTip.y,spoutTip.z);lip.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),mouthDirection);
  const mouth=mesh(pot,new THREE.CircleGeometry(.057,40),matte('#334d3a',{side:THREE.DoubleSide}),mouthInside.x,mouthInside.y,mouthInside.z);mouth.quaternion.copy(lip.quaternion);

  const bowl=new THREE.Group();tea.add(bowl);
  lathe(bowl,[[0,.03],[.31,.03],[.43,.06],[.58,.16],[.74,.32],[.86,.52],[.883,.583],[.875,.615],[.854,.617],[.831,.565],[.705,.35],[.53,.19],[.34,.12],[0,.12]],porcelainLight,128);
  lathe(bowl,[[.29,.005],[.35,.005],[.38,.03],[.365,.065],[.31,.075]],clayFoot,80);
  const rim=mesh(bowl,new THREE.TorusGeometry(.865,.008,8,112),porcelainLight,0,.607,0);rim.rotation.x=Math.PI/2;
  const waterUniforms={uTime:{value:0},uHeat:{value:0},uProgress:{value:0}};
  const water=mesh(bowl,new THREE.CircleGeometry(.792,100),new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:waterUniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform float uTime,uHeat,uProgress;varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p);float ripple=sin(r*85.-uTime*(2.2+uHeat*3.));float rings=pow(max(0.,ripple),12.)*exp(-r*3.)*(.009+uHeat*.075);float reflection=exp(-pow(abs(p.x+p.y*.8+.12)/.055,2.))*.20;vec3 tea=mix(vec3(.175,.095,.025),vec3(.40,.235,.062),smoothstep(.25,.75,uProgress));tea+=vec3(1.,.83,.48)*(rings+reflection);tea=mix(tea,vec3(.45,.33,.13),smoothstep(.42,.5,r)*.45);gl_FragColor=vec4(tea,1.);}`}),0,.43,0);water.rotation.x=-Math.PI/2;
  const stream=makeStream(tea),streamStart=new THREE.Vector3(),streamEnd=new THREE.Vector3();
  const bowlSteam=makeSteam(tea,{height:3.15,width:1.18,opacity:.46,seed:2.9,preview}),potSteam=makeSteam(tea,{height:2.35,width:.91,opacity:.28,seed:11.5,preview});
  const lidPoint=new THREE.Vector3(0,1.63,0);

  // A woven cloth and one loose tea sprig supply scale without decorating
  // every empty area. They sit on the same lit tabletop and receive shadows.
  const clothMap=canvasTexture((c,w,h)=>{c.fillStyle='#e8dfc7';c.fillRect(0,0,w,h);c.strokeStyle='rgba(111,100,72,.14)';c.lineWidth=.6;for(let i=0;i<130;i++){const q=i*w/130;c.beginPath();c.moveTo(q,0);c.lineTo(q,h);c.stroke();c.beginPath();c.moveTo(0,q);c.lineTo(w,q);c.stroke();}},512,512);
  const clothGeo=new THREE.PlaneGeometry(1.55,1.05,24,18),clothPos=clothGeo.attributes.position;
  for(let i=0;i<clothPos.count;i++){const x=clothPos.getX(i),y=clothPos.getY(i);clothPos.setZ(i,.025*Math.sin(x*15+y*2)+.012*Math.sin(y*24)+.008*Math.sin(x*33));}clothGeo.computeVertexNormals();
  const cloth=mesh(tea,clothGeo,matte('#e3d7bc',{map:clothMap,bumpMap:clothMap,bumpScale:.007,roughness:1}),-1.75,-.065,.91);cloth.rotation.set(-Math.PI/2,0,.11);
  const sprig=new THREE.Group();sprig.position.y=-.045;tea.add(sprig);taperedTube(sprig,[[.65,-.055,-.80],[1.25,-.04,-.68],[1.85,-.02,-.40]],.012,.004,matte('#687155'),25);
  const leafGeo=leafGeometry(.58,.145),leafMat=matte('#687b52',{roughness:.72});
  for(let i=0;i<5;i++){const leaf=mesh(sprig,leafGeo,leafMat,.82+i*.20,-.025,-.76+i*.07);leaf.rotation.set(-1.30,0,i%2?.8:-1.9);leaf.scale.setScalar(.72+i*.04);}
  tea.traverse(object=>{if(object.isMesh){object.castShadow=true;object.receiveShadow=true;}});
  // Transparent vapor and the thin stream must never cast a solid billboard.
  for(const group of[bowlSteam.group,potSteam.group])group.traverse(object=>object.castShadow=false);
  water.castShadow=false;
  const contactMap=canvasTexture((c,w,h)=>{const g=c.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,w*.48);g.addColorStop(0,'rgba(24,35,25,.40)');g.addColorStop(.36,'rgba(24,35,25,.24)');g.addColorStop(1,'rgba(24,35,25,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},256,256);
  const potContact=mesh(tea,new THREE.PlaneGeometry(1.55,1.20),basic('#344333',{map:contactMap,transparent:true,depthWrite:false,opacity:.66}),-.8,-.106,-.13);potContact.rotation.x=-Math.PI/2;
  const bowlContact=mesh(tea,new THREE.PlaneGeometry(1.25,.98),basic('#344333',{map:contactMap,transparent:true,depthWrite:false,opacity:.58}),1.95,-.106,.91);bowlContact.rotation.x=-Math.PI/2;
  const beamDustGeometry=new THREE.BufferGeometry(),dust=[],rnd=random(7331);
  for(let i=0;i<(preview?35:90);i++)dust.push(-1+rnd()*6,.8+rnd()*4.7,-2.6+rnd()*3.4);beamDustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));
  const motes=new THREE.Points(beamDustGeometry,new THREE.PointsMaterial({color:'#f6edd5',size:.012,transparent:true,opacity:.34,depthWrite:false}));scene.add(motes);

  let aspect=1,lastTime=null,heat=0,fillLevel=0;
  function resize(nextAspect){aspect=nextAspect;camera.aspect=aspect;camera.updateProjectionMatrix();}
  function update({time=0,progress=0,pointer={x:0,y:0},reduced=false,action=0}={}){
    const p=clamp(progress,0,1),t=reduced?0:time,delta=lastTime===null?0:clamp(time-lastTime,0,.05);lastTime=time;
    const approach=smooth(.10,.47,p),aftertaste=smooth(.65,1,p),cupView=smooth(.66,.90,p);
    const chapterPour=smooth(.34,.44,p)*(1-smooth(.55,.64,p));
    const gesture=Math.max(clamp(action,0,1),chapterPour*.97),flow=smooth(.27,.61,gesture);
    heat=Math.max(flow,heat*Math.exp(-delta*.42));fillLevel=Math.min(.035,fillLevel+delta*flow*.012);
    const mobile=aspect<.9,compact=aspect<1.2;
    tea.position.set(mobile?-.20:preview?-.15:compact?.25:1.65,0,0);
    pot.position.set(-.80-aftertaste*.07,-.135+gesture*.54,-.13-aftertaste*.12);pot.rotation.set(0,-.13,-gesture*.44);
    bowl.position.set(mobile?1.01:1.95-aftertaste*.14,-.115,.91+aftertaste*.18);
    slab.scale.x=mobile?.87:1;cloth.position.x=mobile?-1.57:-1.75;
    potContact.position.x=pot.position.x;potContact.material.opacity=.66-gesture*.39;potContact.scale.setScalar(1+gesture*.15);bowlContact.position.x=bowl.position.x;bowlContact.position.z=bowl.position.z;
    water.position.y=.43+fillLevel;waterUniforms.uTime.value=t;waterUniforms.uHeat.value=heat;waterUniforms.uProgress.value=p;
    pot.updateMatrix();streamStart.copy(spoutTip).applyMatrix4(pot.matrix);streamEnd.copy(bowl.position);streamEnd.x+=mobile?.28:-.12;streamEnd.y+=water.position.y;streamEnd.z-=.025;stream.update(t,flow,streamStart,streamEnd);
    bowlSteam.group.position.copy(bowl.position);bowlSteam.group.position.y+=.47;bowlSteam.group.scale.y=.80+approach*.14+heat*.12;
    potSteam.group.position.copy(lidPoint).applyMatrix4(pot.matrix);potSteam.group.scale.y=1-gesture*.13;
    bowlSteam.update(t,.45+approach*.25+aftertaste*.15+heat*.44);potSteam.update(t,.65+approach*.20-gesture*.22);
    landscape.update(t,p);motes.position.y=Math.sin(t*.16)*.025;motes.rotation.y=Math.sin(t*.025)*.008;
    key.color.copy(coolKey).lerp(warmKey,smooth(.28,1,p)*.82);key.intensity=2.85+approach*.30+aftertaste*.45;softbox.intensity=1.30-aftertaste*.10;
    key.position.set(-1.8+aftertaste*.6,10,-2.5);key.target.position.set(1.0,0,1.0);
    const px=clamp(pointer.x||0,-1,1),py=clamp(pointer.y||0,-1,1);
    const lerp=THREE.MathUtils.lerp;
    // The last chapter changes the subject of attention: a cup-level view of
    // amber tea and its vapor, with the pot deliberately receding to the left.
    if(mobile){
      const cupX=tea.position.x+bowl.position.x-.06;
      camera.fov=41;
      camera.position.set(lerp(.00,cupX+.75,cupView)+px*.035,lerp(5.65-aftertaste*.28,3.80,cupView),lerp(14.05-approach*.60-aftertaste*.30,8.10,cupView));
      camera.lookAt(lerp(-.40,cupX,cupView),lerp(.78-aftertaste*.10,.90,cupView),lerp(.05,1.05,cupView));
    }else if(preview){
      const cupX=tea.position.x+bowl.position.x-.20;
      camera.fov=39;
      camera.position.set(lerp(-.25+approach*.45,cupX+1.05,cupView),lerp(4.65-aftertaste*.25,3.45,cupView),lerp(11.05-approach*.50,6.45,cupView));
      camera.lookAt(lerp(.10,cupX,cupView),lerp(.90,.98,cupView),lerp(.0,1.08,cupView));
    }else{
      const cupX=tea.position.x+bowl.position.x-.20;
      camera.fov=compact?40:39;
      camera.position.set(lerp(-.25+approach*.60+aftertaste*.45,cupX+1.05,cupView)+px*.055,lerp(4.70-approach*.30-aftertaste*.18,3.45,cupView)+py*.02,lerp((compact?11.90:11.10)-approach*.85-aftertaste*.40,compact?8.10:6.45,cupView));
      camera.lookAt(lerp(compact?0:.25+aftertaste*.28,cupX-(compact?.55:1.40),cupView),lerp(1.05-aftertaste*.14,compact?1.10:.98,cupView),lerp(.02+aftertaste*.18,1.08,cupView));
    }
    camera.updateProjectionMatrix();
  }
  resize(1);update();
  return {scene,camera,resize,update,dispose(){disposeScene(scene);}};
}
