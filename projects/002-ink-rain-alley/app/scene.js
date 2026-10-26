import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { random } from './paper.js';
import { rainVertex, rainFragment, rippleVertex, rippleFragment } from './shaders.js';

const rand = random(201014);
const material = (color, extra={}) => new THREE.MeshBasicMaterial({ color, ...extra });

function facadeTexture(seed) {
  const rnd=random(seed),canvas=document.createElement('canvas');
  canvas.width=256;canvas.height=512;
  const c=canvas.getContext('2d');
  c.fillStyle='#999a92';c.fillRect(0,0,256,512);
  for(let i=0;i<350;i++) {
    c.fillStyle=`rgba(${rnd()>.5?'22,27,25':'220,218,202'},${rnd()*.10})`;
    c.fillRect(rnd()*256,0,rnd()*4+.4,512);
  }
  for(let y=34;y<485;y+=82) {
    c.strokeStyle='#b7b5a348';c.lineWidth=2;c.beginPath();c.moveTo(0,y-15);c.lineTo(256,y-15);c.stroke();
    for(let x=24;x<235;x+=61) {
      const warm=rnd()>.84;
      c.fillStyle='#b8b7a5';c.fillRect(x-3,y-3,35,57);
      c.fillStyle=warm?'#ac9d75':`rgb(${64+rnd()*30},${70+rnd()*30},${68+rnd()*25})`;
      c.fillRect(x,y,29,51);
      c.fillStyle='#999b8c';c.fillRect(x+13,y,2,51);c.fillRect(x,y+23,29,2);
      c.fillStyle='#444b4366';c.fillRect(x-2,y+52,34,5);
    }
  }
  for(let i=0;i<2200;i++) {c.fillStyle=`rgba(14,24,19,${rnd()*.11})`;c.fillRect(rnd()*256,rnd()*512,rnd()*9+.5,rnd()*27+.5);}
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  return tex;
}

function signTexture(text, light=false) {
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=512;
  const c=canvas.getContext('2d');c.fillStyle=light?'#b5aa8e':'#a24d49';c.fillRect(0,0,128,512);
  const r=random(text.length*73);
  for(let i=0;i<900;i++) {c.fillStyle=`rgba(24,21,17,${r()*.15})`;c.fillRect(r()*128,r()*512,r()*6+.3,r()*26+.5);}
  c.strokeStyle=light?'#575b4f':'#d0bda02e';c.lineWidth=3;c.strokeRect(8,10,112,492);
  c.textAlign='center';c.textBaseline='middle';c.font='51px "Microsoft YaHei", sans-serif';c.fillStyle=light?'#4b4d44':'#c9bc9d';
  [...text].forEach((char,i)=>c.fillText(char,64,73+i*86));
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  return tex;
}

function umbrella() {
  const group=new THREE.Group();
  const rings=12,slices=64,vertices=[],indices=[];
  for(let ring=0;ring<=rings;ring++) for(let i=0;i<=slices;i++) {
    const t=ring/rings,a=i/slices*Math.PI*2;
    const radius=t*1.17;
    const y=.39*Math.cos(t*Math.PI*.5)-Math.pow(t,9)*.037*(.5+.5*Math.cos(a*8));
    vertices.push(Math.cos(a)*radius,y,Math.sin(a)*radius);
    if(ring<rings&&i<slices) {const k=ring*(slices+1)+i;indices.push(k,k+slices+1,k+1,k+1,k+slices+1,k+slices+2);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
  const canopy=new THREE.Mesh(geo,material(0x1c2221,{side:THREE.DoubleSide,fog:false}));group.add(canopy);
  for(let i=0;i<8;i++) {
    const points=[];const a=i/8*Math.PI*2;
    for(let j=0;j<=16;j++){const t=j/16;points.push(new THREE.Vector3(Math.cos(a)*t*1.17,.395*Math.cos(t*Math.PI*.5),Math.sin(a)*t*1.17));}
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x4a504b,transparent:true,opacity:.3})));
  }
  group.position.y=2.74;
  return group;
}

export function createAlley() {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#b0b3aa');scene.fog=new THREE.FogExp2('#b0b3aa',.026);
  const camera=new THREE.PerspectiveCamera(48,1,.1,160);camera.position.set(.1,2.2,12.5);
  const city=new THREE.Group();scene.add(city);
  const box=(w,h,d,mat,x,y,z,parent=city)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
  const textures=Array.from({length:8},(_,i)=>facadeTexture(413+i*38));
  const walls=textures.map((map,i)=>material([0xa4a69a,0x969b93,0xb4b3a3,0x838b85][i%4],{map}));
  const dark=material(0x535d56),ledge=material(0x777e71),pipe=material(0x565e55);
  const names=['旧时书屋','春和茶室','南门旅馆','修理钟表','花间小馆','雨巷'];
  const signs=names.map((n,i)=>material(0xffffff,{map:signTexture(n,i%3===1),side:THREE.DoubleSide}));
  for(let side=-1;side<=1;side+=2) {
    let z=6;
    for(let i=0;i<13;i++) {
      const depth=5.4+rand()*3.5,height=11+rand()*10,width=4+rand()*3;
      const inner=4.6+rand()*.45;
      box(width,height,depth,walls[(i+(side===1?3:0))%walls.length],side*(inner+width/2),height/2,z-depth/2);
      box(.30,.22,depth+.15,ledge,side*(inner-.1),height*.35,z-depth/2);
      box(.24,.18,depth+.2,dark,side*(inner-.13),height*.68,z-depth/2);
      box(.045,height*.87,.07,pipe,side*(inner-.2),height*.46,z-depth*.8);
      box(.16,.09,depth,dark,side*(inner-.21),2.7,z-depth/2);
      // Street-level shop shutters are separate from the upper window grids.
      box(.035,2.4,depth*.7,material(0x657067),side*(inner-.02),1.25,z-depth*.5);
      for(let n=0;n<6;n++) box(.05,.025,depth*.7,ledge,side*(inner-.055),.35+n*.35,z-depth*.5);
      if(i<9&&i%2===(side===1?0:1)) {
        const sign=new THREE.Mesh(new THREE.PlaneGeometry(.81,3.25+rand()*.5),signs[(i+(side===1?1:0))%signs.length]);
        sign.position.set(side*(inner-.52),5.3+rand()*1.8,z-depth*.40);sign.rotation.y=-side*.20;city.add(sign);
        box(.8,.035,.04,pipe,side*(inner-.32),sign.position.y+1.3,sign.position.z-.02);
      }
      if(i<5) {
        box(.65,.10,depth*.9,dark,side*(inner-.34),2.9,z-depth*.5);
        const lamp=new THREE.Mesh(new THREE.SphereGeometry(.095,8,6),material(0xb3a77e));lamp.position.set(side*(inner-.6),2.7,z-depth*.4);city.add(lamp);
      }
      z-=depth+.07;
    }
  }
  for(let i=0;i<5;i++) {
    const z=-12-i*15;
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-5,8+i*.7,z),new THREE.Vector3(0,6.2+i*.7,z-.5),new THREE.Vector3(5,8.5+i*.7,z-1.1));
    city.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)),new THREE.LineBasicMaterial({color:0x4f584e,transparent:true,opacity:.5})));
  }
  const nearSign=new THREE.Mesh(new THREE.PlaneGeometry(.90,4.35),signs[2]);nearSign.position.set(3.97,5.4,-4.5);nearSign.rotation.y=-.15;city.add(nearSign);
  // Receding silhouettes make the vanishing point soft rather than empty.
  for(let i=0;i<8;i++) box(3+rand()*5,9+rand()*8,5,walls[i%walls.length],(rand()-.5)*18,5,-99-rand()*17);

  const reflectionShader={
    ...Reflector.ReflectorShader,
    uniforms:{...Reflector.ReflectorShader.uniforms,uTime:{value:0}},
    fragmentShader:Reflector.ReflectorShader.fragmentShader
      .replace('uniform vec3 color;', 'uniform vec3 color; uniform float uTime;')
      .replace('vec4 base = texture2DProj( tDiffuse, vUv );', `
        vec4 rippleUv = vUv;
        vec2 st = vUv.xy / vUv.w;
        float waves = sin(st.y*155.0+uTime*2.1)*0.0028+sin(st.y*53.0-uTime*1.3)*0.0033;
        rippleUv.x += waves*vUv.w;
        vec2 smear=vec2(.0017,.0037)*vUv.w;
        vec4 base=texture2DProj(tDiffuse,rippleUv)*.38;
        base+=texture2DProj(tDiffuse,rippleUv+vec4(smear,0.,0.))*.17;
        base+=texture2DProj(tDiffuse,rippleUv-vec4(smear,0.,0.))*.17;
        base+=texture2DProj(tDiffuse,rippleUv+vec4(-smear.x,smear.y*1.8,0.,0.))*.14;
        base+=texture2DProj(tDiffuse,rippleUv+vec4(smear.x,-smear.y*1.8,0.,0.))*.14;
        base.rgb = mix(base.rgb,vec3(0.19,0.195,0.19),0.15);
      `),
  };
  const ground=new Reflector(new THREE.PlaneGeometry(150,240),{color:0xa5a4a0,textureWidth:512,textureHeight:768,clipBias:.003,multisample:0,shader:reflectionShader});
  ground.rotation.x=-Math.PI/2;ground.position.set(0,.005,-70);scene.add(ground);
  // Sidewalk edges and broken pavement lines interrupt the mirror surface.
  for(let side=-1;side<=1;side+=2) {
    box(.44,.10,125,material(0x727a70),side*4.35,.055,-51);
    for(let i=0;i<23;i++) box(.47,.012,.024,dark,side*4.35,.111,11-i*5.3);
  }
  const floorMarks=[];
  for(let i=0;i<80;i++){const x=(rand()-.5)*8.1,z=10-rand()*95;floorMarks.push(x,.016,z,x+(rand()-.5)*.8,.016,z+(rand()-.5)*2.7);}
  const markGeo=new THREE.BufferGeometry();markGeo.setAttribute('position',new THREE.Float32BufferAttribute(floorMarks,3));
  scene.add(new THREE.LineSegments(markGeo,new THREE.LineBasicMaterial({color:0x667164,transparent:true,opacity:.18})));

  const person=new THREE.Group();person.position.set(.10,0,0);person.scale.setScalar(1.15);scene.add(person);
  const coat=material(0x212826,{fog:false}),skin=material(0x343d36,{fog:false});
  const addPerson=(geometry,mat,x,y,z=0)=>{const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);person.add(m);return m;};
  addPerson(new THREE.CylinderGeometry(.26,.42,1.25,10),coat,0,1.45);
  const shoulders=addPerson(new THREE.SphereGeometry(.32,12,8),coat,0,2.01);shoulders.scale.set(1.1,.7,.65);
  addPerson(new THREE.SphereGeometry(.18,14,10),skin,0,2.36);
  const leftArm=addPerson(new THREE.CylinderGeometry(.075,.06,.88,8),coat,-.33,1.61);leftArm.rotation.z=-.08;
  const rightArm=addPerson(new THREE.CylinderGeometry(.075,.06,.68,8),coat,.32,1.78);rightArm.rotation.z=.22;
  for(const x of [-.14,.14]) {addPerson(new THREE.CylinderGeometry(.055,.043,.75,7),coat,x,.48);addPerson(new THREE.BoxGeometry(.12,.11,.25),coat,x,.08,-.05);}
  addPerson(new THREE.CylinderGeometry(.012,.012,1.06,6),material(0x7b8276),.10,2.26,.08);
  const parasol=umbrella();parasol.position.x=.10;parasol.rotation.z=-.035;parasol.scale.set(.9,1,.9);person.add(parasol);

  const drops=2400,positions=[],speeds=[],ends=[];
  for(let i=0;i<drops;i++) {
    const x=(rand()-.5)*20,y=rand()*24,z=15-rand()*118,speed=8+rand()*9;
    for(let end=0;end<2;end++){positions.push(x,y,z);speeds.push(speed);ends.push(end);}
  }
  const rainGeometry=new THREE.BufferGeometry();rainGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));rainGeometry.setAttribute('aSpeed',new THREE.Float32BufferAttribute(speeds,1));rainGeometry.setAttribute('aEnd',new THREE.Float32BufferAttribute(ends,1));
  const rainMaterial=new THREE.ShaderMaterial({vertexShader:rainVertex,fragmentShader:rainFragment,uniforms:{uTime:{value:0}},transparent:true,depthWrite:false});
  const rain=new THREE.LineSegments(rainGeometry,rainMaterial);rain.frustumCulled=false;scene.add(rain);

  const splashPositions=[],directions=[],starts=[];
  for(let i=0;i<90;i++) {
    const x=(rand()-.5)*8,z=10-rand()*75,start=rand();
    for(let j=0;j<24;j++) for(let end=0;end<2;end++) {const angle=(j+end)/24*Math.PI*2;splashPositions.push(x,.025,z);directions.push(Math.cos(angle),0,Math.sin(angle));starts.push(start);}
  }
  const splashGeometry=new THREE.BufferGeometry();splashGeometry.setAttribute('position',new THREE.Float32BufferAttribute(splashPositions,3));splashGeometry.setAttribute('normal',new THREE.Float32BufferAttribute(directions,3));splashGeometry.setAttribute('aStart',new THREE.Float32BufferAttribute(starts,1));
  const splashMaterial=new THREE.ShaderMaterial({vertexShader:rippleVertex,fragmentShader:rippleFragment,uniforms:{uTime:{value:0},uAmount:{value:.65}},transparent:true,depthWrite:false});
  const splashes=new THREE.LineSegments(splashGeometry,splashMaterial);splashes.frustumCulled=false;scene.add(splashes);

  const lookAt=new THREE.Vector3(0,1.80,-30);
  function update(time,amount,pointer,delta) {
    rainMaterial.uniforms.uTime.value=time;splashMaterial.uniforms.uTime.value=time;splashMaterial.uniforms.uAmount.value=amount;
    ground.material.uniforms.uTime.value=time;
    rainGeometry.setDrawRange(0,Math.floor(drops*amount)*2);
    const ease=1-Math.exp(-Math.min(delta,.1)*2.8);
    camera.position.x=THREE.MathUtils.lerp(camera.position.x,.12+pointer.x*.40,ease);
    camera.position.y=THREE.MathUtils.lerp(camera.position.y,2.2+pointer.y*.11,ease);
    camera.lookAt(lookAt);
    parasol.rotation.z=-.035+Math.sin(time*.7)*.005;
  }
  update(0,.65,{x:0,y:0},1);
  return {scene,camera,update};
}
