import * as THREE from 'three';
import { random } from './paper.js';

const TAU=Math.PI*2;
function pigmentTexture(seed,ivory=false){
  const rand=random(seed),canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;
  const c=canvas.getContext('2d'),gradient=c.createLinearGradient(0,512,0,0);
  gradient.addColorStop(0,ivory?'#c8c5b5':'#8c7681');gradient.addColorStop(.45,ivory?'#eeeddf':'#d8bdc9');gradient.addColorStop(1,ivory?'#f6f3e8':'#e7ccd7');
  c.fillStyle=gradient;c.fillRect(0,0,256,512);
  for(let i=0;i<160;i++){
    const x=rand()*256;c.strokeStyle=`rgba(${ivory?'98,100,88':'64,22,42'},${.018+rand()*.045})`;c.lineWidth=.3+rand()*.65;
    c.beginPath();c.moveTo(128+(x-128)*.12,512);c.bezierCurveTo(128+(x-128)*.4,350,x,180,x,0);c.stroke();
  }
  for(let i=0;i<9000;i++){const a=rand()*.055;c.fillStyle=`rgba(65,43,49,${a})`;c.fillRect(rand()*256,rand()*512,.4+rand(),.5+rand()*2);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}

// Each petal has a broad, rolled lip and a curved midrib, rather than a flat fan.
function cupPetal({length,width,spread,rise,curl,phase=0,rolled=false}){
  const positions=[],uvs=[],colors=[],indices=[],rows=34,columns=20;
  for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){
    const t=j/rows,u=i/columns*2-1,profile=Math.pow(Math.sin(Math.PI*t),.58);
    const lip=Math.pow(t,6),side=Math.pow(Math.abs(u),2.6);
    const x=u*width*profile*(1+.04*Math.sin(t*13+phase));
    const y=length*(rise*Math.sin(t*1.32)-curl*lip)+side*length*.12*Math.sin(t*Math.PI)+Math.sin(u*7+phase)*lip*.018*Math.sin(t*Math.PI);
    const radial=rolled?spread*Math.sin(t*Math.PI*.82):spread*t*t;
    const z=length*(.07*t+radial)-side*length*.10*Math.sin(t*Math.PI)+lip*.055*Math.cos(u*2.4)*Math.sin(t*Math.PI);
    positions.push(x,y,z);uvs.push(i/columns,t);
    const shade=.43+.57*Math.pow(t,.36);colors.push(shade,shade,shade);
    if(j<rows&&i<columns){const k=j*(columns+1)+i;indices.push(k,k+columns+1,k+1,k+1,k+columns+1,k+columns+2);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function material(color,map){return new THREE.MeshStandardMaterial({color,map,vertexColors:true,roughness:.79,metalness:0,side:THREE.DoubleSide});}
function stem(parent,points,radius,color){const curve=new THREE.CatmullRomCurve3(points);const item=new THREE.Mesh(new THREE.TubeGeometry(curve,44,radius,10,false),new THREE.MeshStandardMaterial({color,roughness:.9}));parent.add(item);return item;}

// A continuous spiral surface gives the rose overlapping, curled folds.
// Mathematical construction reference: Zhaoxu Liu / slandarer, MATLAB Central,
// https://www.mathworks.com/matlabcentral/discussions/tips/847771
function roseSurface(){
  const positions=[],uvs=[],colors=[],indices=[],turns=1100,radial=34;
  for(let j=0;j<=turns;j++)for(let i=0;i<=radial;i++){
    const v=i/radial,theta=j/turns*20*Math.PI,phi=Math.PI/2*Math.exp(-theta/(8*Math.PI));
    const scallop=1-.5*Math.pow(1-((3.6*theta)%TAU)/Math.PI,4)+Math.sin(theta*15)/150;
    const fold=2*Math.pow(v*v-v,2)*Math.sin(phi);
    const radius=scallop*(v*Math.sin(phi)+fold*Math.cos(phi));
    const height=scallop*(v*Math.cos(phi)-fold*Math.sin(phi));
    const warp=1+Math.sin(theta*1.7)*.022;
    positions.push(Math.cos(theta)*radius*1.74*warp,height*1.74,Math.sin(theta)*radius*1.74);
    uvs.push((theta/TAU)%1,v);
    const edge=.48+.52*Math.pow(v,1.3),variation=.95+.05*Math.sin(theta*.7);
    colors.push(edge*variation,edge*variation,edge*variation);
    if(j<turns&&i<radial){const k=j*(radial+1)+i;indices.push(k,k+1,k+radial+1,k+1,k+radial+2,k+radial+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
export function createSculptedRose(){
  const group=new THREE.Group(),flower=new THREE.Group();group.add(flower);flower.position.y=1.35;flower.rotation.set(1.0,0,-.15);
  const bloom=new THREE.Mesh(roseSurface(),material(0x65112a,pigmentTexture(140)));flower.add(bloom);
  stem(group,[new THREE.Vector3(-.10,-4.1,.04),new THREE.Vector3(.12,-2.1,-.06),new THREE.Vector3(-.05,-.2,0),new THREE.Vector3(0,1.40,0)],.042,0x263629);
  const leafGeo=cupPetal({length:.87,width:.22,spread:1,rise:.10,curl:.02}),leafMat=new THREE.MeshStandardMaterial({color:0x23382b,roughness:.95,side:THREE.DoubleSide});
  for(let i=0;i<3;i++){const leaf=new THREE.Mesh(leafGeo,leafMat);leaf.position.set(0,-2.3+i*.86,0);leaf.rotation.set(.85,(i%2?1:-1)*1.10,(i%2?1:-1)*.24);group.add(leaf);}
  return {group,flower,update(time,open=1){group.rotation.z=Math.sin(time*.32)*.012;bloom.scale.set(1, .92+open*.08,1);}};
}

// Lotus petals interpolate from an upright bud to a cupped, layered bloom.
// Kept separate from the rose construction so its established silhouette is unchanged.
function lotusPetalGeometry({length,width,rise,phase}){
  const positions=[],closed=[],uvs=[],indices=[],rows=32,columns=18;
  for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){
    const t=j/rows,u=i/columns*2-1,sine=Math.sin(Math.PI*t),profile=Math.pow(sine,.70);
    const edge=Math.pow(Math.abs(u),2.7),tip=Math.pow(t,5);
    const asymmetry=1+.055*Math.sin(t*5.8+phase)+u*.035*Math.sin(phase);
    const x=u*width*profile*asymmetry;
    const radial=length*(.055*t+.96*Math.pow(t,1.22))-edge*.075*sine;
    const y=rise*t+.27*sine-.13*tip+edge*.20*sine
      +Math.sin(u*3.4+phase)*sine*tip*.035;
    positions.push(x,y,radial);
    const budRadius=.035+.24*Math.sin(t*Math.PI*.80)+.035*t;
    closed.push(u*width*profile*.22,2.54*t+edge*.05*sine,budRadius-edge*.018*sine);
    uvs.push(i/columns,t);
    if(j<rows&&i<columns){const k=j*(columns+1)+i;indices.push(k,k+columns+1,k+1,k+1,k+columns+1,k+columns+2);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const bud=new THREE.BufferGeometry();bud.setAttribute('position',new THREE.Float32BufferAttribute(closed,3));bud.setIndex(indices);bud.computeVertexNormals();
  geometry.setAttribute('aClosedPosition',bud.attributes.position.clone());geometry.setAttribute('aClosedNormal',bud.attributes.normal.clone());bud.dispose();return geometry;
}
function lotusMaterial(texture,color,ring){
  return new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{uPigment:{value:texture},uIvory:{value:new THREE.Color(color)},uOpen:{value:1},uRing:{value:ring}},vertexShader:`
    uniform float uOpen;attribute vec3 aClosedPosition;attribute vec3 aClosedNormal;
    varying vec2 vUv;varying vec3 vNormal;
    void main(){vUv=uv;vec3 p=mix(aClosedPosition,position,uOpen);vec3 n=normalize(mix(aClosedNormal,normal,uOpen));vNormal=normalize(normalMatrix*n);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}
  `,fragmentShader:`
    uniform sampler2D uPigment;uniform vec3 uIvory;uniform float uRing;
    varying vec2 vUv;varying vec3 vNormal;
    void main(){
      vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;
      float diffuse=max(0.,dot(n,normalize(vec3(-.42,.72,1.))));
      float softBack=.08*max(0.,dot(-n,normalize(vec3(.20,.60,1.))));
      float lighting=.40+.54*diffuse+softBack;
      float root=.64+.36*smoothstep(.02,.74,vUv.y);
      float rib=pow(max(0.,1.-abs(vUv.x-.5)*2.),3.)*.025;
      float rim=pow(1.-abs(n.z),3.)*.045;
      vec3 pigment=texture2D(uPigment,vUv).rgb;
      vec3 color=uIvory*(lighting*root+rib+rim)*mix(vec3(1.),pigment,.15);
      gl_FragColor=vec4(color,1.);
    }
  `});
}
export function createSculptedLotus(){
  const group=new THREE.Group(),flower=new THREE.Group(),petals=[],texture=pigmentTexture(442,true),rnd=random(78141);group.add(flower);flower.position.y=.7;flower.rotation.x=.34;
  const rings=[{count:8,length:2.34,width:.66,rise:1.26},{count:9,length:1.74,width:.55,rise:1.93},{count:6,length:1.03,width:.40,rise:2.43}];
  for(let ring=0;ring<rings.length;ring++){
    const settings=rings[ring],mat=lotusMaterial(texture,[0xe2dfd0,0xece8d9,0xf0ecdd][ring],ring);
    for(let i=0;i<settings.count;i++){
      const phase=rnd()*TAU,variation=.94+rnd()*.12,geometry=lotusPetalGeometry({length:settings.length*variation,width:settings.width*(.94+rnd()*.12),rise:settings.rise*(.97+rnd()*.06),phase});
      const pivot=new THREE.Group(),angle=i/settings.count*TAU+ring*.39+(rnd()-.5)*.10;
      pivot.position.y=ring*.095;pivot.rotation.y=angle;flower.add(pivot);
      const petal=new THREE.Mesh(geometry,mat);petal.rotation.z=(rnd()-.5)*.035;pivot.add(petal);petals.push({mat,ring});
    }
  }
  stem(group,[new THREE.Vector3(.10,-4.2,-.04),new THREE.Vector3(-.08,-2.1,0),new THREE.Vector3(0,.7,0)],.029,0x333c2a);
  const heart=new THREE.Mesh(new THREE.SphereGeometry(.20,24,14),new THREE.MeshStandardMaterial({color:0x9f9a69,roughness:.95}));heart.scale.y=.48;heart.position.y=.46;flower.add(heart);
  return {group,flower,update(time,open=1){const amount=THREE.MathUtils.clamp(open,0,1);for(const {mat,ring}of petals)mat.uniforms.uOpen.value=THREE.MathUtils.smoothstep(amount,ring*.065,.92+ring*.025);heart.visible=amount>.6;group.rotation.z=Math.sin(time*.38)*.007;}};
}
