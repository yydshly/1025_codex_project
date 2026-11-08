import * as THREE from './vendor/three.module.js';

// Authored 3D teaching scenes. Physical quantities and playback come from models.js.
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(x) ? x : a));
const fract = x => x - Math.floor(x);
const hash = n => fract(Math.sin(n * 127.17 + 42.53) * 43758.5453);
const vec = (x, y, z) => new THREE.Vector3(x, y, z);
const dummy = new THREE.Object3D();
const cyan = 0x67e2e8, purple = 0xb49aff, amber = 0xffbf72;

function standard(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: .83, metalness: .03, ...options });
}
function object(geometry, material, parent, position = [0,0,0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh); return mesh;
}
function box(parent, size, color, position, options = {}) {
  return object(new THREE.BoxGeometry(...size),standard(color,options),parent,position);
}
function tube(parent, points, radius, material, segments = 40, radial = 10) {
  const curve = new THREE.CatmullRomCurve3(points.map(p=>vec(...p)));
  const geometry = new THREE.TubeGeometry(curve,segments,radius,radial,false);
  return object(geometry,material,parent);
}
function polyline(parent, points, color, opacity = 1, dashed = false) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p=>p.isVector3?p:vec(...p)));
  const material = dashed ? new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:.07,gapSize:.06}) : new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity});
  const line = new THREE.Line(geometry,material);if(dashed)line.computeLineDistances();parent.add(line);return line;
}
function updateLine(line, points) {
  let attribute=line.geometry.getAttribute('position');
  if(!attribute || attribute.count<points.length){
    line.geometry.dispose();line.geometry=new THREE.BufferGeometry();
    attribute=new THREE.BufferAttribute(new Float32Array(Math.max(26,points.length)*3),3);
    attribute.setUsage(THREE.DynamicDrawUsage);line.geometry.setAttribute('position',attribute);
  }
  points.forEach((p,i)=>attribute.setXYZ(i,p.x,p.y,p.z));attribute.needsUpdate=true;
  line.geometry.setDrawRange(0,points.length);line.geometry.computeBoundingSphere();
  if(line.material.isLineDashedMaterial)line.computeLineDistances();
}
function groundRing(parent, color, radius = 1, opacity = .6) {
  const ring = object(new THREE.RingGeometry(.985,1,128),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity,depthWrite:false}),parent);
  ring.rotation.x = -Math.PI/2;ring.scale.setScalar(radius);return ring;
}
function radialTexture(size = 64) {
  const pixels = new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const dx=(x/(size-1)-.5)*2,dy=(y/(size-1)-.5)*2;
    const r=Math.hypot(dx,dy),noise=.88+.12*Math.sin(x*.63)*Math.sin(y*.47);
    const alpha=Math.pow(Math.max(0,1-r),1.65)*noise;
    const j=(y*size+x)*4;pixels[j]=pixels[j+1]=pixels[j+2]=255;pixels[j+3]=Math.round(alpha*255);
  }
  const texture=new THREE.DataTexture(pixels,size,size,THREE.RGBAFormat);texture.magFilter=texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;return texture;
}
const softTexture=radialTexture();
function roughRockTexture(size=128){
  const pixels=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const g=clamp(.48+.18*Math.sin(x*.21+Math.sin(y*.17)*2)+.12*Math.sin(x*.73-y*.48)+.14*(hash(x+y*size)-.5));
    const i=(y*size+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=Math.round(g*255);pixels[i+3]=255;
  }
  const texture=new THREE.DataTexture(pixels,size,size,THREE.RGBAFormat);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;return texture;
}
const rockTexture=roughRockTexture();

function mountainHeight(r, theta) {
  const f=Math.max(0,1-r/3.12);
  const base=-.78+2.64*Math.pow(f,1.22);
  const rugged=(Math.sin(theta*11+r*2.4)*.12+Math.sin(theta*23-r*5)*.055)*Math.sin(Math.min(1,r/3.12)*Math.PI);
  return base+rugged;
}
function mountainGeometry() {
  const radial=44,angular=112,positions=[],colors=[],uvs=[],indices=[];
  const color=new THREE.Color(),low=new THREE.Color('#292f34'),high=new THREE.Color('#414349');
  // A front-right quarter is removed, exposing the inner section to the camera.
  for(let i=0;i<=radial;i++){
    const r=.30+(3.12-.30)*i/radial;
    for(let j=0;j<=angular;j++){
      const theta=Math.PI/2+j/angular*Math.PI*1.5;
      const h=mountainHeight(r,theta);
      positions.push(Math.cos(theta)*r,h,Math.sin(theta)*r);
      color.copy(low).lerp(high,clamp((h+.78)/2.5));
      color.multiplyScalar(.62+.38*hash(i*400+j));colors.push(color.r,color.g,color.b);uvs.push(j/angular*3,i/radial*3);
      if(i<radial&&j<angular){const a=i*(angular+1)+j,b=a+angular+1;indices.push(a,b,a+1,b,b+1,a+1);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function cutLayer(theta, bottom, top) {
  const p=[],indices=[],steps=72;
  for(let i=0;i<=steps;i++){
    const r=i/steps*3.12,h=mountainHeight(r,theta);
    const a=Math.min(h,top),b=Math.min(h,bottom);
    p.push(Math.cos(theta)*r,b,Math.sin(theta)*r,Math.cos(theta)*r,a,Math.sin(theta)*r);
    if(i<steps){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function createVolcano() {
  const group=new THREE.Group();group.name='Volcanic cutaway';
  const body=object(mountainGeometry(),standard(0xffffff,{vertexColors:true,roughness:1,bumpMap:rockTexture,bumpScale:.12,side:THREE.DoubleSide}),group);
  const layers=[[-2.10,-1.65,0x292b30],[-1.65,-1.20,0x34353a],[-1.20,-.78,0x414044],[-.78,-.35,0x30343a],[-.35,.08,0x434346],[.08,.48,0x36383d],[.48,.88,0x4b4947],[.88,1.30,0x34373c],[1.30,1.88,0x252a30]];
  for(const [bottom,top,color] of layers){
    const mat=standard(color,{side:THREE.DoubleSide,roughness:.99});
    object(cutLayer(0,bottom,top),mat,group);
    object(cutLayer(Math.PI/2,bottom,top),mat,group);
    if(top<=-.78){
      const outer=object(new THREE.CylinderGeometry(3.12,3.12,top-bottom,112,1,true,Math.PI/2,Math.PI*1.5),mat,group,[0,(bottom+top)/2,0]);outer.castShadow=true;
    }
  }
  const base=object(new THREE.CylinderGeometry(3.17,3.22,.16,112,1,false),standard(0x172b34,{roughness:.9}),group,[0,-2.2,0]);
  // A shallow crater rim is an actual open annulus, not a painted glow.
  const rim=object(new THREE.TorusGeometry(.33,.07,10,72,Math.PI*1.5),standard(0x343637),group,[0,1.68,0]);rim.rotation.x=Math.PI/2;rim.rotation.z=Math.PI/2;
  const chamberMat=standard(0xf58b35,{emissive:0xff480b,emissiveIntensity:2.2,emissiveMap:rockTexture,bumpMap:rockTexture,bumpScale:.09,roughness:.58});
  const chamber=object(new THREE.SphereGeometry(.72,32,20),chamberMat,group,[0,-1.28,0]);chamber.scale.set(1.25,.64,1.14);
  const chamberShell=object(new THREE.SphereGeometry(.81,28,18),standard(0x6c3026,{transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide}),group,[0,-1.28,0]);chamberShell.scale.set(1.25,.64,1.14);
  const pipePoints=[[0,-1.28,0],[.08,-.85,.04],[-.06,-.2,.03],[.04,.45,-.02],[0,1.0,0],[0,1.71,0]];
  tube(group,pipePoints,.22,standard(0x743b2a,{transparent:true,opacity:.18,depthWrite:false}),52,12);
  const molten=standard(0xffaa50,{emissive:0xff6622,emissiveIntensity:2.4,roughness:.4});
  const conduit=tube(group,pipePoints,.135,molten,52,12);
  const branches=[tube(group,[[0,-1.03,0],[.49,-.5,.24],[.78,.03,.30]],.065,molten,30,8),tube(group,[[0,-.63,0],[.24,-.25,.53],[.28,.2,.78]],.055,molten,30,8)];
  const light=new THREE.PointLight(0xff6b25,7,5,2);light.position.set(.2,-.75,.4);group.add(light);
  const craterLava=object(new THREE.CircleGeometry(.27,40),new THREE.MeshBasicMaterial({color:0xffb564,side:THREE.DoubleSide}),group,[0,1.72,0]);craterLava.rotation.x=-Math.PI/2;
  const lavaFlows=[];
  for(let i=0;i<3;i++){
    const points=[];for(let j=0;j<32;j++){const r=.34+j/31*2.63,theta=Math.PI/2+.12+i*.33+Math.sin(j*.35+i)*.025;points.push([Math.cos(theta)*r,mountainHeight(r,theta)+.025,Math.sin(theta)*r]);}
    lavaFlows.push(tube(group,points,.026+i*.008,molten,56,7));
  }
  // Small rock instances add readable scale and directional shading.
  const rockGeo=new THREE.DodecahedronGeometry(1,0),rocks=new THREE.InstancedMesh(rockGeo,standard(0x383e41,{roughness:1,bumpMap:rockTexture,bumpScale:.10}),125);
  rocks.castShadow=true;rocks.receiveShadow=true;group.add(rocks);
  for(let i=0;i<125;i++){
    const r=1.1+hash(i+66)*1.92,theta=Math.PI/2+hash(i+7)*Math.PI*1.5,size=.025+hash(i+3)*.07;
    dummy.position.set(Math.cos(theta)*r,mountainHeight(r,theta)+size*.4,Math.sin(theta)*r);dummy.rotation.set(hash(i)*3,hash(i+1)*6,hash(i+2)*3);dummy.scale.set(size,size*.6,size*.8);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
  }
  const smoke=[];
  for(let i=0;i<45;i++){
    const material=new THREE.SpriteMaterial({map:softTexture,color:i%3?0xa7b3bd:0x748795,transparent:true,opacity:0,depthWrite:false});
    const sprite=new THREE.Sprite(material);sprite.renderOrder=2;group.add(sprite);smoke.push(sprite);
  }
  const ashCount=120,ashPositions=new Float32Array(ashCount*3),ashGeo=new THREE.BufferGeometry();ashGeo.setAttribute('position',new THREE.BufferAttribute(ashPositions,3));
  const ashPoints=new THREE.Points(ashGeo,new THREE.PointsMaterial({color:0xffc27c,size:.043,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));group.add(ashPoints);
  const labels=[{text:'岩浆房',position:vec(.9,-1.28,.65),color:'#ffb474'},{text:'上升通道',position:vec(.35,.60,.30),color:'#ffc78d'},{text:'岩层剖面',position:vec(2.1,-.72,.08),color:'#c3c4b3'}];
  return {group,camera:{position:[6.3,4.2,7.2],target:[0,.25,0]},labels,
    update(data,progress){
      const s=data.scene||{},rise=clamp(s.rise),plume=clamp(s.plume),pressure=clamp(s.pressure,0,1.6),flow=clamp(s.magmaFlow);
      conduit.geometry.setDrawRange(0,Math.max(0,Math.floor(rise*52))*12*6);branches.forEach((b,i)=>b.geometry.setDrawRange(0,Math.floor(clamp((rise-.25-i*.08)/.65)*30)*8*6));
      chamberMat.emissiveIntensity=1.2+pressure*2.0;light.intensity=2+pressure*5;chamber.scale.set(1.17+pressure*.08,.59+pressure*.05,1.07+pressure*.07);
      craterLava.visible=rise>.88;lavaFlows.forEach((m,i)=>{m.visible=flow>.03;m.geometry.setDrawRange(0,Math.floor(clamp(flow*(1.3-i*.18))*56)*7*6);});
      for(let i=0;i<smoke.length;i++){
        const age=fract(progress*1.8+hash(i+71));const spread=age*(.35+plume*1.3),size=.16+age*(.35+plume*.8);
        smoke[i].position.set((hash(i+81)-.5)*spread*1.4,1.7+age*(.5+plume*2.1),(hash(i+91)-.5)*spread);
        smoke[i].scale.set(size*1.45,size,1);smoke[i].material.opacity=plume*(.18+.32*(1-age));smoke[i].visible=plume>.02;
      }
      for(let i=0;i<ashCount;i++){
        const age=fract(progress*2.8+hash(i+400)),a=hash(i+20)*TAU,r=age*(.10+plume*.90);
        ashPositions[i*3]=Math.cos(a)*r;ashPositions[i*3+1]=1.72+Math.sin(age*Math.PI)*(.15+plume*1.7)-age*age*.4;ashPositions[i*3+2]=Math.sin(a)*r;
      }
      ashGeo.attributes.position.needsUpdate=true;ashPoints.visible=plume>.08;ashPoints.material.opacity=plume*.85;
    }
  };
}

function waveMaterial(color) {
  return new THREE.ShaderMaterial({uniforms:{color:{value:new THREE.Color(color)},opacity:{value:.45}},vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,fragmentShader:`uniform vec3 color;uniform float opacity;varying vec3 vN;varying vec3 vV;void main(){float rim=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.2);gl_FragColor=vec4(color,(.035+rim*.8)*opacity);}`,side:THREE.DoubleSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
}
function building(parent,x,z,height,width) {
  const body=box(parent,[width,height,width*.72],0x94a8ae,[x,.55+height/2,z],{roughness:.6,metalness:.12});
  const roof=box(parent,[width*1.05,.025,width*.78],0xb4c1c0,[x,.55+height,z],{roughness:.7});
  for(let j=1;j<4;j++)box(parent,[width*.72,.025,.004],0x7ca899,[x,.55+height*j/4,z+width*.365],{emissive:0x355c50,emissiveIntensity:.35});
  return body;
}
export function createQuake() {
  const group=new THREE.Group();group.name='Fault and seismic propagation';
  const widths=7.5,depth=3.55;
  const strata=[[-1.90,-1.45,0x354252],[-1.45,-1.00,0x4b5355],[-1.00,-.60,0x5c655e],[-.60,-.23,0x776f5c],[-.23,.17,0x6a776a],[.17,.48,0x8b8d73]];
  for(const [a,b,color] of strata)box(group,[widths,b-a,depth],color,[0,(a+b)/2,-1.25],{roughness:.98});
  const top=box(group,[widths,.10,depth],0x516f59,[0,.53,-1.25],{roughness:.98});
  box(group,[widths+.12,.16,depth+.12],0x182a36,[0,-1.98,-1.25]);
  // The near side is physically exposed, with the source just in front of it.
  const cutFront=.54;
  for(let i=0;i<35;i++){
    const x=-3.6+hash(i+89)*7.2,y=-1.8+hash(i+80)*2.2;
    const rock=object(new THREE.DodecahedronGeometry(.018+hash(i+78)*.04,0),standard(0x667477,{roughness:1}),group,[x,y,cutFront+.015]);rock.scale.y=.45;
  }
  const faultGeo=new THREE.BufferGeometry();faultGeo.setAttribute('position',new THREE.Float32BufferAttribute([-1,.60,.57,.46,-1.92,.57,-1,.60,-3.0,.46,-1.92,-3.0],3));faultGeo.setIndex([0,1,2,1,3,2]);faultGeo.computeVertexNormals();
  object(faultGeo,standard(0x231e25,{side:THREE.DoubleSide,roughness:1}),group);
  polyline(group,[[-1,.595,-3.02],[-1,.595,.58]],0xb99872,.75);
  const frontFault=polyline(group,[[-1,.60,.58],[.46,-1.92,.58]],amber,.85);
  const sourceMat=new THREE.MeshBasicMaterial({color:0xffd494});
  const source=object(new THREE.SphereGeometry(.075,20,14),sourceMat,group);
  const sourceGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:softTexture,color:0xff9955,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));sourceGlow.scale.set(1.0,1.0,1);group.add(sourceGlow);
  const pMaterial=waveMaterial(cyan),sMaterial=waveMaterial(purple),sphereGeo=new THREE.SphereGeometry(1,56,32);
  const pWave=object(sphereGeo,pMaterial,group),sWave=object(sphereGeo,sMaterial,group);pWave.castShadow=sWave.castShadow=false;pWave.receiveShadow=sWave.receiveShadow=false;
  const pRing=groundRing(group,cyan,1,.84),sRing=groundRing(group,purple,1,.82);
  const grid=new THREE.GridHelper(8,16,0x698379,0x364e48);grid.position.set(0,.59,-1.15);grid.material.transparent=true;grid.material.opacity=.19;group.add(grid);
  for(let i=0;i<15;i++)building(group,-3.10+(i%8)*.72,-.12-Math.floor(i/8)*1.25,.16+hash(i+47)*.52,.19+hash(i+48)*.16);
  const station=box(group,[.24,.20,.20],0xe5bf73,[2.78,.69,-2.30],{metalness:.16,roughness:.5});
  object(new THREE.CylinderGeometry(.014,.014,.65,8),standard(0x9eaba9),group,[2.78,.99,-2.30]);
  object(new THREE.SphereGeometry(.055,12,8),new THREE.MeshBasicMaterial({color:amber}),group,[2.78,1.33,-2.30]);
  const depthLine=polyline(group,[[0,.58,.67],[0,-1,.67]],0xe8bc8a,.65,true);
  const labels=[{text:'震源',position:vec(0,0,.8),color:'#ffd08f'},{text:'P 波',position:vec(-2.9,-.05,1.05),color:'#6de1e7'},{text:'S 波',position:vec(2,-.80,1.2),color:'#b7abff'},{text:'地表标记点',position:vec(2.78,1.6,-2.30),color:'#e6c78f'}];
  return {group,camera:{position:[7.2,5.0,8.7],target:[0,-.10,-.6]},labels,
    update(data){
      const s=data.scene||{},d=clamp(s.depth,5,80),age=Math.max(0,Number(s.waveAge)||0),k=.018;
      const y=.58-d*k,x=-1+(d*k/2.52)*1.46,z=.66;
      source.position.set(x,y,z);sourceGlow.position.copy(source.position);labels[0].position.set(x+.20,y-.10,z+.12);
      const energy=Math.max(.001,Number(s.energy)||1),strength=clamp((Math.log10(energy)+3)/6,.12,1);
      source.scale.setScalar(.7+strength*.6);sourceGlow.scale.setScalar(.55+strength*.8);
      for(const [mesh,radius,material] of [[pWave,age*6*k,pMaterial],[sWave,age*3.5*k,sMaterial]]){
        mesh.position.copy(source.position);mesh.scale.setScalar(Math.max(.001,radius));mesh.visible=radius>.02;
        material.uniforms.opacity.value=(.36+strength*.3)*clamp((6.8-radius)/2.0,.08,1);
      }
      for(const [ring,r] of [[pRing,Math.max(0,Number(s.frontP)||0)*k],[sRing,Math.max(0,Number(s.frontS)||0)*k]]){
        ring.position.set(x,.601,z);ring.scale.setScalar(Math.max(.001,r));ring.visible=r>.025;ring.material.opacity=.7*clamp((6-r)/2,.10,1);
      }
      depthLine.geometry.setFromPoints([vec(x,.60,z+.025),vec(x,y,z+.025)]);depthLine.computeLineDistances();
    }
  };
}

function landGeometry(points,height=.16) {
  const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1,steps:1});geometry.rotateX(-Math.PI/2);return geometry;
}
function markStation(group) {
  const station=new THREE.Group();
  const ring=groundRing(station,0xf7cd83,.10,.95);ring.position.y=.035;
  const foot=object(new THREE.CylinderGeometry(.043,.065,.07,16),standard(0xc89b52,{metalness:.4,roughness:.4}),station,[0,.07,0]);
  object(new THREE.CylinderGeometry(.009,.009,.35,8),standard(0xdcc390,{metalness:.5}),station,[0,.26,0]);
  object(new THREE.SphereGeometry(.048,16,10),new THREE.MeshBasicMaterial({color:0xffd58b}),station,[0,.45,0]);
  group.add(station);return station;
}

function cloudVolumeMaterial(){
  return new THREE.ShaderMaterial({
    uniforms:{uRadius:{value:2.8},uEye:{value:.30},uRotation:{value:0},uRain:{value:.5}},
    vertexShader:`
      varying vec3 vOrigin;
      varying vec3 vDirection;
      void main(){
        vec3 t=(modelViewMatrix*vec4(0.,0.,0.,1.)).xyz;
        mat3 r=mat3(modelViewMatrix);
        vOrigin=vec3(dot(r[0],-t)/dot(r[0],r[0]),dot(r[1],-t)/dot(r[1],r[1]),dot(r[2],-t)/dot(r[2],r[2]));
        vDirection=position-vOrigin;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
      }`,
    fragmentShader:`
      precision highp float;
      uniform float uRadius;
      uniform float uEye;
      uniform float uRotation;
      uniform float uRain;
      varying vec3 vOrigin;
      varying vec3 vDirection;
      float hash3(vec3 p){
        p=fract(p*.1031);
        p+=dot(p,p.yzx+33.33);
        return fract((p.x+p.y)*p.z);
      }
      float noise3(vec3 p){
        vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),
                       mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
                   mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),
                       mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
      }
      float density(vec3 p){
        float r=length(p.xz);
        float u=r/max(.01,uRadius);
        if(u>1.03 || r<uEye*.77 || p.y<-.20 || p.y>1.10)return 0.;
        float c=cos(uRotation),s=sin(uRotation);
        vec3 q=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);
        float n=.68*noise3(q*5.3)+.32*noise3(q*11.1);
        float theta=atan(q.z,q.x);
        float wave=.5+.5*sin(theta*3.+u*13.0);
        float bands=smoothstep(.17,.82,wave+(n-.5)*.48);
        float top=.16+.22*(1.-u)+(n-.5)*.10;
        float thickness=.075+.11*(1.-u);
        float vertical=exp(-pow((p.y-top)/thickness,2.));
        float eyeWall=exp(-pow((r-uEye*1.35)/(.09+uEye*.28),2.))*exp(-pow((p.y-.32)/.20,2.));
        float outside=1.-smoothstep(.75,1.02,u);
        float opening=smoothstep(uEye*.80,uEye*1.12,r);
        return opening*outside*(vertical*(.13+bands*.92)*(.32+n*.95)+eyeWall*.78)*2.5;
      }
      void main(){
        vec3 d=normalize(vDirection),inv=1./d;
        vec3 t0=(vec3(-4.,-.25,-4.)-vOrigin)*inv;
        vec3 t1=(vec3(4.,1.15,4.)-vOrigin)*inv;
        vec3 a=min(t0,t1),b=max(t0,t1);
        float near=max(max(a.x,a.y),a.z),far=min(min(b.x,b.y),b.z);
        if(near>far || far<0.)discard;
        near=max(near,0.);
        float stepSize=(far-near)/44.;
        vec3 p=vOrigin+d*(near+stepSize*.45);
        vec4 accumulated=vec4(0.);
        vec3 light=normalize(vec3(-.42,.84,.34));
        for(int i=0;i<44;i++){
          float den=density(p);
          if(den>.012){
            float lit=exp(-density(p+light*.23)*1.0);
            float high=smoothstep(-.05,.70,p.y);
            vec3 shade=mix(vec3(.28,.38,.45),vec3(.88,.94,.97),clamp(.17+lit*.62+high*.17,0.,1.));
            float alpha=1.-exp(-den*stepSize*3.15);
            accumulated.rgb+=(1.-accumulated.a)*shade*alpha;
            accumulated.a+=(1.-accumulated.a)*alpha;
            if(accumulated.a>.975)break;
          }
          p+=d*stepSize;
        }
        if(accumulated.a<.008)discard;
        gl_FragColor=vec4(accumulated.rgb/max(.001,accumulated.a),accumulated.a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side:THREE.BackSide,transparent:true,depthWrite:false,depthTest:true,
  });
}
export function createTyphoon() {
  const group=new THREE.Group();group.name='Volumetric cyclone field';
  // A faded ocean field avoids the hard plastic slab boundary.
  const oceanGeo=new THREE.PlaneGeometry(11.8,11.8,50,50);oceanGeo.rotateX(-Math.PI/2);
  const ocean=object(oceanGeo,standard(0x0a2a3d,{roughness:.94,metalness:0,transparent:true,opacity:.90,map:softTexture,depthWrite:false}),group,[0,-.68,0]);
  ocean.castShadow=false;
  const coast=[[-5,-4.6],[-2.7,-4.6],[-2.63,-3.7],[-2.95,-3.0],[-2.72,-2.5],[-3.23,-1.8],[-3.08,-1.2],[-3.61,-.4],[-3.50,.2],[-4.02,.82],[-4.3,1.52],[-5.2,1.9]];
  object(landGeometry(coast,.045),standard(0x283d34,{roughness:1,metalness:0}),group,[0,-.67,0]);
  object(landGeometry([[-3.1,2.05],[-2.81,1.87],[-2.57,2.24],[-2.61,2.8],[-2.85,3.12],[-3.12,2.63]],.045),standard(0x30473a,{roughness:1,metalness:0}),group,[0,-.67,0]);
  object(landGeometry([[-2.3,3.22],[-1.88,3.35],[-1.7,3.73],[-2.11,4.02],[-2.39,3.71]],.035),standard(0x2c4336,{roughness:1,metalness:0}),group,[0,-.67,0]);
  polyline(group,coast.map(p=>vec(p[0],-.588,p[1])),0x64816e,.25);
  // Continuous 3D density is ray-marched through the box; there are no cloud balls.
  const cloudGroup=new THREE.Group();group.add(cloudGroup);
  const cloudMat=cloudVolumeMaterial(),cloudGeo=new THREE.BoxGeometry(8,1.4,8);cloudGeo.translate(0,.45,0);
  const clouds=object(cloudGeo,cloudMat,cloudGroup);clouds.castShadow=false;clouds.receiveShadow=false;clouds.renderOrder=3;
  const station=markStation(group),stationLabel={text:'模型标记点',position:vec(.88,.12,-.72),color:'#f7cd83'};
  const centerMark=groundRing(group,cyan,.055,.62);centerMark.position.y=-.62;
  const centerLine=polyline(group,[[0,-.62,0],[1,-.62,1]],0xd6bb86,.24,true);
  const trackPast=polyline(group,[[0,-.62,0],[0,-.62,.01]],0x6fdfe1,.72);
  const trackAll=polyline(group,[[0,-.63,0],[0,-.63,.01]],0x8dadba,.24,true);
  const labels=[{text:'台风眼',position:vec(0,.90,0),color:'#dce9ed'},stationLabel,{text:'海岸示意',position:vec(-4.0,-.18,1.8),color:'#9abda8'}];
  const map=(x,y,height=-.62)=>vec((x-.5)*8,height,(y-.5)*8);
  let lastTrack=null;
  return {group,camera:{position:[5.8,7.2,7.0],target:[0,.0,0]},labels,
    update(data,progress){
      const s=data.scene||{},cx=clamp(s.cx ?? .5),cy=clamp(s.cy ?? .5),rMax=clamp(s.radius ?? 100,50,200)*8/700;
      const radius=Math.min(3.9,rMax*2.45),eye=Math.max(.24,rMax*.40),rotation=Number(s.rotation)||0;
      const center=map(cx,cy,.02);cloudGroup.position.copy(center);centerMark.position.copy(map(cx,cy));labels[0].position.copy(center).add(vec(0,.90,0));
      cloudMat.uniforms.uRadius.value=radius;cloudMat.uniforms.uEye.value=eye;cloudMat.uniforms.uRotation.value=rotation;cloudMat.uniforms.uRain.value=clamp(s.rain);
      const mark=s.station||{x:.61,y:.41},markPos=map(mark.x,mark.y,-.62);station.position.copy(markPos);stationLabel.position.copy(markPos).add(vec(.1,.68,.1));
      updateLine(centerLine,[map(cx,cy),markPos]);
      const track=Array.isArray(s.track)?s.track:[];
      if(track.length>1){
        if(track!==lastTrack){updateLine(trackAll,track.map(p=>map(p.x,p.y,-.625)));lastTrack=track;}
        const past=track.filter(p=>(p.t??0)<=progress).map(p=>map(p.x,p.y,-.62));past.push(map(cx,cy,-.62));if(past.length<2)past.unshift(past[0].clone());updateLine(trackPast,past);
      }
      const attribute=oceanGeo.getAttribute('position');
      for(let i=0;i<attribute.count;i++){const x=attribute.getX(i),z=attribute.getZ(i);attribute.setY(i,Math.sin(x*2.3+z*1.6+progress*TAU)*.008+Math.cos(z*2.1-x+progress*TAU)*.006);}
      attribute.needsUpdate=true;
    }
  };
}
