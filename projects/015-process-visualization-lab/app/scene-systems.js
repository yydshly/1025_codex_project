import * as THREE from './vendor/three.module.js';

const TAU = Math.PI * 2;
const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
const frac = v => v-Math.floor(v);
const hash = n => frac(Math.sin(n*127.1+311.7)*43758.5453);
const cyan = 0x75e3e4, orange = 0xffb56e;
const v3 = (x,y,z) => new THREE.Vector3(x,y,z);
function mesh(geometry,material,parent,position){const m=new THREE.Mesh(geometry,material);if(position)m.position.copy(position);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function material(color,roughness=.7,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
function box(parent,size,pos,mat){return mesh(new THREE.BoxGeometry(...size),mat,parent,v3(...pos));}
function tube(parent,points,radius,mat,segments=70){const curve=new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?v3(...p):p));const m=mesh(new THREE.TubeGeometry(curve,segments,radius,8,false),mat,parent);return {mesh:m,curve};}
function cylinderBetween(parent,a,b,r,mat){const start=Array.isArray(a)?v3(...a):a,end=Array.isArray(b)?v3(...b):b;const axis=end.clone().sub(start);const m=mesh(new THREE.CylinderGeometry(r,r,axis.length(),12),mat,parent,start.clone().add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(v3(0,1,0),axis.normalize());return m;}
function roundedShape(w,h,r){const x=-w/2,y=-h/2,s=new THREE.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function roundedBox(parent,w,h,depth,r,mat,pos){const g=new THREE.ExtrudeGeometry(roundedShape(w,h,r),{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:8});g.translate(0,0,-depth/2);return mesh(g,mat,parent,pos? v3(...pos):undefined);}

export function createRiver(){
  const group=new THREE.Group();group.name='river-terrain';
  const length=8.2,domain=2000,waterY=.10;
  const centerLine=z=>.52*Math.sin(z*.78)+.16*Math.sin(z*1.8);
  const widthAt=z=>.68+.07*Math.cos(z*.85);
  const worldZ=metres=>-length/2+metres/domain*length;
  const labels=[];
  // A continuous carved valley: the water occupies a depressed riverbed, while
  // its banks and surrounding hills have real three-dimensional elevation.
  function elevation(x,z){
    const distance=Math.abs(x-centerLine(z)),width=widthAt(z),bank=clamp((distance-width)/.7);
    const hills=.30+.17*Math.sin(z*.82+x*.8)+.14*Math.cos(x*1.7-z*.42);
    const shoulder=.24+bank*bank*(.30+hills);
    const mountains=Math.exp(-((x+3.2)**2/1.7+(z+1.5)**2/11))*1.4+Math.exp(-((x-3.3)**2/1.8+(z-2.3)**2/5))*.8;
    if(distance<width)return -.45+.12*(distance/width)**2;
    return Math.max(.13,shoulder+mountains+.035*Math.sin(x*9+z*4)*bank);
  }
  const groundG=new THREE.PlaneGeometry(8.6,9,124,138);groundG.rotateX(-Math.PI/2);
  const gp=groundG.attributes.position,colors=[];const low=new THREE.Color(0x728b69),high=new THREE.Color(0x8c9774),bed=new THREE.Color(0x555d4a);
  for(let i=0;i<gp.count;i++){
    const x=gp.getX(i),z=gp.getZ(i),y=elevation(x,z);gp.setY(i,y);
    const c=y<.10?bed.clone():low.clone().lerp(high,clamp(y/1.7));c.multiplyScalar(.91+hash(i*.17)*.12);colors.push(c.r,c.g,c.b);
  }
  groundG.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));groundG.computeVertexNormals();
  const terrain=mesh(groundG,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96}),group);terrain.receiveShadow=true;
  const earth=material(0x4b5548,.97);box(group,[8.6,.54,9],[0,-.68,0],earth);
  // Seal the height-field perimeter into the ground mass. The bank terrain
  // must remain a solid land section when the camera orbits to a low angle.
  const edgeP=[],edgeC=[],edgeI=[],edgeSteps=70;
  const edgeFns=[t=>[-4.3+t*8.6,-4.5],t=>[4.3,-4.5+t*9],t=>[4.3-t*8.6,4.5],t=>[-4.3,4.5-t*9]];
  for(const edge of edgeFns){
    const base=edgeP.length/3;
    for(let i=0;i<=edgeSteps;i++){
      const [x,z]=edge(i/edgeSteps),y=elevation(x,z);edgeP.push(x,y,z,x,-.49,z);
      edgeC.push(.39,.43,.33,.27,.29,.23);
      if(i<edgeSteps){const k=base+i*2;edgeI.push(k,k+1,k+2,k+1,k+3,k+2);}
    }
  }
  const edgeG=new THREE.BufferGeometry();edgeG.setAttribute('position',new THREE.Float32BufferAttribute(edgeP,3));edgeG.setAttribute('color',new THREE.Float32BufferAttribute(edgeC,3));edgeG.setIndex(edgeI);edgeG.computeVertexNormals();
  mesh(edgeG,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.98,side:THREE.DoubleSide}),group);
  // Visible sedimentary edges establish a land mass, not a floating water slab.
  for(let layer=0;layer<3;layer++)box(group,[8.64,.035,9.04],[0,-.51-layer*.16,0],material([0x6c7060,0x424d45,0x777968][layer],1));
  const waterP=[],waterI=[],volumeP=[],volumeD=[],volumeSide=[],volumeI=[];
  const n=150,cross=16;
  for(let i=0;i<=n;i++){
    const t=i/n,z=-length/2+t*length,c=centerLine(z),rw=widthAt(z);
    waterP.push(c-rw,waterY,z,c+rw,waterY,z);
    if(i<n){const j=i*2;waterI.push(j,j+2,j+1,j+1,j+2,j+3);}
  }
  const waterG=new THREE.BufferGeometry();waterG.setAttribute('position',new THREE.Float32BufferAttribute(waterP,3));waterG.setIndex(waterI);waterG.computeVertexNormals();
  const waterMat=new THREE.MeshPhysicalMaterial({color:0x3c8583,roughness:.18,metalness:.08,transparent:true,opacity:.69,transmission:.12,thickness:.4,side:THREE.DoubleSide,depthWrite:false});
  const water=mesh(waterG,waterMat,group);water.renderOrder=2;
  // Three continuous depth slices visualise the one-dimensional concentration
  // field through a river volume. Its along-river value comes only from model C.
  for(let level=0;level<3;level++){
    const base=volumeP.length/3;
    for(let i=0;i<=n;i++)for(let j=0;j<=cross;j++){
      const t=i/n,z=-length/2+t*length,s=j/cross*2-1;
      volumeP.push(centerLine(z)+s*widthAt(z)*.96,waterY-.035-level*.12,z);volumeD.push(t*domain);volumeSide.push(s);
      if(i<n&&j<cross){const k=base+i*(cross+1)+j;volumeI.push(k,k+cross+1,k+1,k+1,k+cross+1,k+cross+2);}
    }
  }
  const volumeG=new THREE.BufferGeometry();volumeG.setAttribute('position',new THREE.Float32BufferAttribute(volumeP,3));volumeG.setAttribute('aDistance',new THREE.Float32BufferAttribute(volumeD,1));volumeG.setAttribute('aSide',new THREE.Float32BufferAttribute(volumeSide,1));volumeG.setIndex(volumeI);volumeG.computeVertexNormals();
  const plumeMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uCenter:{value:100},uSigma:{value:20},uPeak:{value:1}},
    vertexShader:'attribute float aDistance; attribute float aSide; varying float vDistance; varying float vSide; void main(){vDistance=aDistance;vSide=aSide;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'precision highp float; varying float vDistance;varying float vSide;uniform float uCenter;uniform float uSigma;uniform float uPeak;void main(){float d=(vDistance-uCenter)/max(1.,uSigma);float c=uPeak*exp(-.5*d*d);float signal=clamp(c/.997,0.,1.);float a=clamp(sqrt(signal)*1.4,0.,.67)*(1.-pow(abs(vSide),6.)*.4);if(a<.006)discard;vec3 col=mix(vec3(.91,.70,.27),vec3(1.,.36,.10),clamp(signal*2.,0.,1.));gl_FragColor=vec4(col,a);}'
  });
  const plume=mesh(volumeG,plumeMat,group);plume.renderOrder=3;
  const count=280,tracerMat=new THREE.MeshStandardMaterial({color:0xe8a44d,roughness:.78,transparent:true,opacity:.68});
  const tracer=new THREE.InstancedMesh(new THREE.SphereGeometry(.027,6,4),tracerMat,count);tracer.frustumCulled=false;tracer.renderOrder=4;group.add(tracer);const dummy=new THREE.Object3D();
  const normal=Array.from({length:count},(_,i)=>Math.sqrt(-2*Math.log(Math.max(.0001,hash(i+71))))*Math.cos(TAU*hash(i+811)));
  // Bank rocks, shrubs and reed clumps sit on sampled terrain elevations.
  const stoneMat=material(0x7c8575,.95),leafMat=material(0x456b50,.95),trunkMat=material(0x655b46,.98);
  for(let i=0;i<110;i++){
    const z=(hash(i+70)-.5)*8.4,side=hash(i+9)>.5?1:-1,x=centerLine(z)+side*(widthAt(z)+.27+hash(i+91)*2.7),y=elevation(x,z);
    if(Math.abs(x)>4.1)continue;
    if(i%3===0){const m=mesh(new THREE.DodecahedronGeometry(.055+hash(i+71)*.12,0),stoneMat,group,v3(x,y+.035,z));m.scale.set(1.5,.6,1);m.rotation.set(hash(i)*2,hash(i+7)*TAU,.2);}
    else if(i%4===0){cylinderBetween(group,[x,y,z],[x,y+.25,z],.025,trunkMat);const m=mesh(new THREE.IcosahedronGeometry(.19+hash(i+6)*.11,1),leafMat,group,v3(x,y+.35,z));m.scale.y=1.45;}
    else {const g=new THREE.ConeGeometry(.05,.20,4);const m=mesh(g,leafMat,group,v3(x,y+.07,z));m.rotation.z=(hash(i+16)-.5)*.35;}
  }
  // Source outfall at exactly 100 m. It is a location marker for one pulse,
  // not an additional continuous mass source.
  const sz=worldZ(100),sc=centerLine(sz),metal=material(0x7f9296,.28,.78),darkMetal=material(0x364b52,.4,.65);
  tube(group,[[sc-2.0,elevation(sc-2,sz)+.10,sz],[sc-1.2,.51,sz],[sc-.5,.37,sz]],.085,metal,30);
  const rim=mesh(new THREE.TorusGeometry(.09,.018,8,22),darkMetal,group,v3(sc-.5,.37,sz));rim.rotation.y=Math.PI/2;
  mesh(new THREE.SphereGeometry(.055,12,8),new THREE.MeshStandardMaterial({color:orange,emissive:0xb05e22,emissiveIntensity:.5}),group,v3(sc,.24,sz));
  labels.push({text:'瞬时释放 · 100 m',position:v3(sc-1.1,1.15,sz),color:'#ffbc79'});
  // A grounded monitoring mast, concrete pad and immersed sampling probe.
  const mz=worldZ(1000),mc=centerLine(mz),mx=mc+1.15,my=elevation(mx,mz);
  box(group,[.65,.13,.62],[mx,my+.06,mz],material(0x9ba49a,.9));
  cylinderBetween(group,[mx,my+.12,mz],[mx,my+1.12,mz],.045,metal);
  box(group,[.33,.38,.20],[mx,my+.82,mz+.04],material(0xd4dbd4,.42,.24));
  box(group,[.22,.12,.016],[mx,my+.87,mz+.15],new THREE.MeshStandardMaterial({color:0x133f46,emissive:cyan,emissiveIntensity:.35}));
  cylinderBetween(group,[mx,my+1.10,mz],[mc,my+1.10,mz],.025,metal);cylinderBetween(group,[mc,my+1.10,mz],[mc,-.15,mz],.018,darkMetal);
  const probe=mesh(new THREE.CylinderGeometry(.04,.04,.20,10),metal.clone(),group,v3(mc,-.11,mz));
  labels.push({text:'浓度监测 · 1000 m',position:v3(mx,my+1.50,mz),color:'#97ece8'});
  const markerMat=new THREE.MeshBasicMaterial({color:0x9cd9d4,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false});
  for(const dist of [400,800,1400,1800]){
    const z=worldZ(dist),x=centerLine(z),shape=new THREE.Shape();shape.moveTo(-.075,-.10);shape.lineTo(0,.10);shape.lineTo(.075,-.10);shape.lineTo(0,-.03);shape.closePath();
    const m=mesh(new THREE.ShapeGeometry(shape),markerMat,group,v3(x,waterY+.017,z));m.rotation.x=Math.PI/2;
  }
  labels.push({text:'上游 · 0 m',position:v3(centerLine(-4.1)-.7,.35,-4.1),color:'#9cb8b6'});
  labels.push({text:'下游 · 2000 m',position:v3(centerLine(4.1)+.7,.32,4.1),color:'#9cb8b6'});
  function update(data){
    const d=data?.scene;if(!d)return;const sig=Math.max(1,d.spread),peak=Math.max(0,d.peakConcentration||0);
    plumeMat.uniforms.uCenter.value=d.center;plumeMat.uniforms.uSigma.value=sig;plumeMat.uniforms.uPeak.value=peak;
    for(let i=0;i<count;i++){
      const metres=d.center+normal[i]*sig,z=worldZ(metres),visible=metres>=0&&metres<=domain;
      dummy.position.set(centerLine(z)+(hash(i+681)-.5)*widthAt(z)*1.65,waterY-.055-hash(i+92)*.25,z);dummy.scale.setScalar(visible?1:0);dummy.updateMatrix();tracer.setMatrixAt(i,dummy.matrix);
    }
    tracer.instanceMatrix.needsUpdate=true;
    const detected=clamp(d.concentration/.997);probe.material.color.setHex(0x7f9296).lerp(new THREE.Color(orange),detected);
  }
  return {group,camera:{position:[8,6.8,8.8],target:[0,.1,0]},labels,update};
}

export function createBattery(){
  const group=new THREE.Group();group.name='prismatic-cell-cutaway';const labels=[];
  const aluminium=material(0xa8b8c0,.27,.88),darkMetal=material(0x334b59,.32,.78),copper=material(0xbf8663,.24,.80),graphite=material(0x263a43,.86,.10),cathodeBase=material(0x698f98,.7,.16),separator=material(0xd9dfc9,.72,.03);
  // An assembled industrial prismatic shell with its front face removed.
  // Walls, rolled lip, terminals, collector rails and close-packed laminations
  // are connected; the cutaway is not a collection of floating panels.
  roundedBox(group,5.05,.28,2.12,.13,aluminium,[0,-1.50,0]);
  roundedBox(group,5.05,3.02,.12,.20,aluminium,[0,0,-1.04]);
  roundedBox(group,.18,2.90,2.08,.08,aluminium,[-2.44,-.04,0]);
  roundedBox(group,.18,2.90,2.08,.08,aluminium,[2.44,-.04,0]);
  roundedBox(group,5.05,.23,2.12,.10,aluminium,[0,1.48,0]);
  roundedBox(group,5.05,.30,.11,.10,aluminium,[0,-1.35,1.04]);
  // Machined front rim, lower corner screws and an insulated internal base.
  for(const x of [-2.44,2.44])box(group,[.07,2.8,.07],[x,-.03,1.07],darkMetal);
  box(group,[4.55,.08,1.85],[0,-1.27,0],material(0x172a33,.8));
  for(const x of [-2.20,2.20])for(const y of [-1.39,1.47]){const bolt=mesh(new THREE.CylinderGeometry(.055,.055,.06,6),darkMetal,group,v3(x,y,1.11));bolt.rotation.x=Math.PI/2;}
  const pack=new THREE.Group();group.add(pack);
  const repeat=13,pitch=.323,start=-2.10,negativeLayers=[],positiveLayers=[];
  const cathodeMats=[];
  for(let i=0;i<repeat;i++){
    const x=start+i*pitch;
    box(pack,[.015,2.25,1.78],[x,-.06,0],copper);
    const nm=graphite.clone();negativeLayers.push(box(pack,[.083,2.22,1.76],[x+.051,-.06,0],nm));
    box(pack,[.028,2.27,1.80],[x+.108,-.06,0],separator);
    const cm=cathodeBase.clone();cathodeMats.push(cm);positiveLayers.push(box(pack,[.115,2.22,1.76],[x+.179,-.06,0],cm));
    box(pack,[.016,2.25,1.78],[x+.247,-.06,0],aluminium);
    // Foil tabs rise from the coating stack into their current collector rails.
    box(pack,[.04,.20,.16],[x,1.15,-.48],copper);box(pack,[.04,.20,.16],[x+.247,1.15,.48],aluminium);
  }
  box(group,[4.30,.07,.22],[0,1.28,-.48],copper);box(group,[4.30,.07,.22],[0,1.28,.48],aluminium);
  const electrolyte=new THREE.MeshPhysicalMaterial({color:0x8ed7da,transparent:true,opacity:.055,transmission:.25,roughness:.1,depthWrite:false});
  const fluid=box(group,[4.38,2.35,1.86],[0,-.06,0],electrolyte);fluid.renderOrder=2;fluid.castShadow=false;
  // Narrow transparent inspection cover and warm metal cut edges.
  const frontWindow=box(group,[4.60,2.45,.018],[0,-.02,1.095],new THREE.MeshPhysicalMaterial({color:0xc5e3e1,transparent:true,opacity:.045,roughness:.08,transmission:.35,depthWrite:false}));frontWindow.renderOrder=3;frontWindow.castShadow=false;
  const neg=v3(-1.58,1.72,-.35),pos=v3(1.58,1.72,.35);
  for(const [p,mat] of [[neg,copper],[pos,aluminium]]){
    mesh(new THREE.CylinderGeometry(.15,.18,.31,20),mat,group,p);mesh(new THREE.CylinderGeometry(.23,.23,.04,24),darkMetal,group,p.clone().setY(1.57));
    const cap=mesh(new THREE.TorusGeometry(.125,.018,7,24),mat,group,p.clone().setY(1.89));cap.rotation.x=Math.PI/2;
  }
  cylinderBetween(group,[-1.58,1.28,-.48],[-1.58,1.72,-.35],.075,copper);cylinderBetween(group,[1.58,1.28,.48],[1.58,1.72,.35],.075,aluminium);
  labels.push({text:'− 负极端子',position:v3(-1.70,2.13,-.35),color:'#f2bd93'});
  labels.push({text:'+ 正极端子',position:v3(1.75,2.13,.35),color:'#a1e2e7'});
  labels.push({text:'多层电极与隔膜',position:v3(.25,-.15,1.42),color:'#d1ddd8'});
  labels.push({text:'切开外壳 · 内部结构示意',position:v3(-1.5,-1.85,1.05),color:'#90a7b2'});
  // External circuit: negative terminal -> load -> positive terminal.
  const wirePoints=[neg.clone().setY(1.90),v3(-2.95,2.0,-.35),v3(-3.05,2.9,-.2),v3(-1.2,3.02,0),v3(0,3.02,0),v3(1.2,3.02,0),v3(3.05,2.9,.2),v3(2.95,2.0,.35),pos.clone().setY(1.90)];
  const circuit=tube(group,wirePoints,.043,material(0x263a43,.62,.12),100);
  // Compact load body and glass bulb make delivered energy visible.
  const load=new THREE.Group();load.position.set(0,3.02,0);group.add(load);
  mesh(new THREE.CylinderGeometry(.24,.26,.20,24),darkMetal,load,v3(0,.02,0));
  for(let i=0;i<3;i++)mesh(new THREE.TorusGeometry(.245,.018,6,24),aluminium,load,v3(0,-.04+i*.05,0)).rotation.x=Math.PI/2;
  const bulbMat=new THREE.MeshPhysicalMaterial({color:0xf3dfbd,roughness:.12,transmission:.55,thickness:.10,transparent:true,opacity:.32,depthWrite:false});
  const bulb=mesh(new THREE.SphereGeometry(.34,28,20),bulbMat,load,v3(0,.42,0));bulb.scale.y=1.12;bulb.castShadow=false;
  const filamentMat=new THREE.MeshStandardMaterial({color:0x6c4e2b,emissive:orange,emissiveIntensity:.0});
  const filament=mesh(new THREE.TorusGeometry(.105,.014,6,22),filamentMat,load,v3(0,.40,0));filament.rotation.x=.35;
  cylinderBetween(load,[-.08,.13,0],[-.08,.39,0],.009,darkMetal);cylinderBetween(load,[.08,.13,0],[.08,.39,0],.009,darkMetal);
  const bulbLight=new THREE.PointLight(0xffc889,0,3,2);bulbLight.position.set(0,.4,.15);load.add(bulbLight);
  labels.push({text:'外电路负载 · 电子 − → +',position:v3(0,3.95,0),color:'#ffcb91'});
  // Particle positions are state-driven and retain their final phase after SOC
  // reaches zero. Coating occupancy follows SOC, not arbitrary animation time.
  const ionCount=104,ionMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.024,8,6),new THREE.MeshStandardMaterial({color:cyan,emissive:0x28565a,emissiveIntensity:.25,roughness:.35}),ionCount);ionMesh.frustumCulled=false;group.add(ionMesh);
  const electronCount=22,electrons=new THREE.InstancedMesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshStandardMaterial({color:orange,emissive:0xb05b20,emissiveIntensity:.6,roughness:.35}),electronCount);electrons.frustumCulled=false;group.add(electrons);
  const occupiedCount=208,occupancy=new THREE.InstancedMesh(new THREE.SphereGeometry(.027,7,5),new THREE.MeshStandardMaterial({color:orange,roughness:.6}),occupiedCount);occupancy.frustumCulled=false;group.add(occupancy);
  const chargeBars=[],barBack=material(0x18353a,.55,.1),barOn=new THREE.MeshStandardMaterial({color:0x88dcb7,emissive:0x285c49,emissiveIntensity:.3,roughness:.5});
  for(let i=0;i<10;i++){const m=box(group,[.10,.17,.025],[2.34,-.9+i*.21,1.17],barOn.clone());chargeBars.push(m);}
  const heatMaterial=new THREE.MeshBasicMaterial({color:0xff8d51,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
  const heat=box(group,[5.12,3.08,2.19],[0,0,0],heatMaterial);heat.renderOrder=4;heat.castShadow=false;
  const dummy=new THREE.Object3D(),baseCathode=new THREE.Color(0x698f98),filledCathode=new THREE.Color(0x83b9ae),baseGraphite=new THREE.Color(0x263a43),filledGraphite=new THREE.Color(0x716655);
  function update(data,progress,params){
    const d=data?.scene;if(!d)return;const soc=clamp(d.soc),requested=Math.max(0,d.requestedCurrent??params?.current??d.current??0),elapsed=Math.max(0,d.elapsedSeconds??progress*1800),active=Math.min(elapsed,d.stopTime??Infinity),charge=active*requested;
    const ionPhase=charge/1800*7;
    for(let i=0;i<ionCount;i++){
      const layer=i%repeat,local=frac(hash(i+121)+ionPhase),x=start+layer*pitch+.045+local*.14;
      dummy.position.set(x,-1.02+hash(i+69)*1.90,.93);dummy.scale.setScalar(1);dummy.updateMatrix();ionMesh.setMatrixAt(i,dummy.matrix);
    }
    ionMesh.instanceMatrix.needsUpdate=true;
    for(let i=0;i<electronCount;i++){
      const t=frac(i/electronCount+charge/1800*2);dummy.position.copy(circuit.curve.getPoint(t));dummy.scale.setScalar(1);dummy.updateMatrix();electrons.setMatrixAt(i,dummy.matrix);
    }
    electrons.instanceMatrix.needsUpdate=true;
    for(let i=0;i<occupiedCount;i++){
      const positive=i>=occupiedCount/2,j=i%(occupiedCount/2),layer=j%repeat,filled=positive?1-soc:soc,visible=hash(j+73)<filled;
      dummy.position.set(start+layer*pitch+(positive?.18:.055),-.99+Math.floor(j/repeat)*.26,.95);dummy.scale.setScalar(visible?1:0);dummy.updateMatrix();occupancy.setMatrixAt(i,dummy.matrix);
    }
    occupancy.instanceMatrix.needsUpdate=true;
    negativeLayers.forEach(m=>m.material.color.copy(baseGraphite).lerp(filledGraphite,soc*.5));cathodeMats.forEach(m=>m.color.copy(baseCathode).lerp(filledCathode,1-soc));
    chargeBars.forEach((m,i)=>{const active=i<Math.round(soc*10);m.material.color.setHex(active?0x88dcb7:0x17393e);m.material.emissive.setHex(active?0x285c49:0x000000);});
    const delivered=Math.max(0,d.power||0);filamentMat.emissiveIntensity=clamp(delivered/10)*3.5;bulbLight.intensity=clamp(delivered/12)*2.5;
    heatMaterial.opacity=clamp(((d.temp??25)-(d.ambient??25))/20)*.10;
  }
  return {group,camera:{position:[7.8,5.7,8.8],target:[0,.8,0]},labels,update};
}
