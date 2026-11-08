import * as THREE from './vendor/three.module.js';

const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));

// This is an enlarged visual encoding of the teaching model, not a plume-height
// or ash-dispersion solver. The entire animation is a function of model progress.
const volumeFragment=`
precision highp float;
varying vec3 vLocal;
uniform vec3 uCamera;
uniform float uTime,uPlume,uAsh,uFlow;
float hash(vec3 p){p=fract(p*.3183099+vec3(.17,.31,.57));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float n=.56*noise(p);p=p*2.03+vec3(7.1,3.7,12.5);n+=.28*noise(p);p=p*2.01+vec3(8.3,11.2,2.4);n+=.16*noise(p);return n;}
float densityAt(vec3 p,bool fine){
 // The rising core and broad umbrella use different advection directions.
 // This gives rising rolls beneath an expanding, wind-sheared ash head.
 float height=.14+.56*uPlume;
 float h=clamp((p.z-.065)/height,0.,1.5);
 vec2 shear=vec2(-.19,.07)*h*h*height;
 vec2 bend=vec2(sin(h*10.5-uTime*.35),cos(h*8.2-uTime*.29))*.010*h;
 vec3 q=vec3(p.xy-shear-bend,p.z);
 vec3 rising=vec3(q.xy*31.,q.z*24.-uTime*1.25);
 float broad=noise(rising*.46+vec3(1.7,3.4,0.));
 float detail=fine?fbm(rising+vec3(broad-.5,broad*.7,0.)*1.5):broad;
 float radius=.017+.034*pow(h,.72);
 radius*=.88+.20*sin(h*21.-uTime*.75);
 float radial=length(q.xy)+(detail-.5)*(.011+.042*h);
 float trunk=1.-smoothstep(radius*.42,radius*1.25,radial);
 trunk*=smoothstep(.065,.095,p.z)*(1.-smoothstep(.72,.94,h));

 vec3 top=vec3(vec2(-.19,.07)*height*.78*.78,.075+height*.78+.04*uPlume);
 vec3 head=(p-top)/vec3(.067+.132*uPlume,.058+.108*uPlume,.047+.027*uPlume);
 vec3 rolling=vec3((p.x+uTime*.006)*30.,(p.y-uTime*.002)*30.,p.z*29.-uTime*.21);
 float billow=fine?fbm(rolling):noise(rolling*.52);
 // A low-frequency curl breaks the outline into distinct cauliflower lobes;
 // finer density remains inside those lobes, not a uniformly blurred sprite.
 float lobe=noise(head*2.35+vec3(uTime*.035,-uTime*.022,.4));
 float headDistance=length(head)+(.49-lobe)*.78+(billow-.5)*.22;
 float umbrella=1.-smoothstep(.73,1.09,headDistance);
 umbrella*=smoothstep(-1.05,-.42,head.z);
 float shape=max(trunk*1.35,umbrella);
 float granulation=mix(detail,billow,smoothstep(.56,.84,h));
 float clumps=.34+.88*smoothstep(.22,.76,granulation);
 return shape*clumps*(.48+.52*uAsh)*uPlume*3.0*(1.-smoothstep(.718,.746,p.z));
}
vec2 boxHit(vec3 ro,vec3 rd){
 vec3 inv=1./(rd+vec3(1e-7));
 vec3 lo=(vec3(-.40,-.30,.035)-ro)*inv;
 vec3 hi=(vec3(.30,.30,.75)-ro)*inv;
 vec3 mn=min(lo,hi),mx=max(lo,hi);
 return vec2(max(max(mn.x,mn.y),mn.z),min(min(mx.x,mx.y),mx.z));
}
void main(){
 vec3 ro=uCamera,rd=normalize(vLocal-ro);
 vec2 hit=boxHit(ro,rd);float begin=max(0.,hit.x),end=hit.y;
 // Analytic depth clipping against the globe, whose center in this local frame
 // is (0,0,-1). This prevents ash rendering through the far side of the Earth.
 vec3 oc=ro-vec3(0,0,-1);float b=dot(oc,rd),c=dot(oc,oc)-1.;float disc=b*b-c;
 if(disc>0.){float earthEntry=-b-sqrt(disc);if(earthEntry>0.)end=min(end,earthEntry);}
 if(end<=begin)discard;
 float stepSize=(end-begin)/52.;vec4 accum=vec4(0.);
 vec3 lightDir=normalize(vec3(-.5,-.35,.82));
 for(int i=0;i<52;i++){
  vec3 p=ro+rd*(begin+(float(i)+.5)*stepSize);
  float d=densityAt(p,true);
  if(d>.012){
   float nearOcclusion=densityAt(p+lightDir*.026,false);
   float farOcclusion=densityAt(p+lightDir*.071,false);
   float shadow=exp(-nearOcclusion*2.2-farOcclusion*1.3);
   float upper=smoothstep(.12,.54,p.z);
   float shade=.13+.87*shadow;
   vec3 smoke=mix(vec3(.038,.046,.058),vec3(.37,.35,.32),shade);
   smoke+=vec3(.025,.033,.045)*upper;
   float hot=exp(-max(0.,p.z-.075)*30.)*uFlow;
   smoke=mix(smoke,vec3(1.25,.25,.018),hot*.62);
   float alpha=1.-exp(-d*stepSize*13.5);
   accum.rgb+=(1.-accum.a)*smoke*alpha;
   accum.a+=(1.-accum.a)*alpha;
   if(accum.a>.97)break;
  }
 }
 if(accum.a<.008)discard;
 gl_FragColor=vec4(accum.rgb/max(accum.a,.001),accum.a);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

function makePointMaterial(color,size,opacity){return new THREE.ShaderMaterial({
 transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 uniforms:{uColor:{value:new THREE.Color(color)},uSize:{value:size},uOpacity:{value:opacity}},
 vertexShader:'uniform float uSize;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(uSize/max(.2,-p.z),1.,5.);}',
 fragmentShader:'uniform vec3 uColor;uniform float uOpacity;void main(){float d=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-d),1.6)*uOpacity;if(a<.01)discard;gl_FragColor=vec4(uColor,a);}'
});}

export function createVolcanoLayer(radius=2){
 const r=Math.max(.01,Number(radius)||2),group=new THREE.Group();group.name='volcano-process';
 const rockGeometry=new THREE.CylinderGeometry(.015*r,.062*r,.082*r,40,9,true);
 const rockPos=rockGeometry.attributes.position;
 for(let i=0;i<rockPos.count;i++){
  const x=rockPos.getX(i),y=rockPos.getY(i),z=rockPos.getZ(i),a=Math.atan2(z,x);
  const ridge=1+.075*Math.sin(a*7+y/r*16)+.035*Math.sin(a*13);
  rockPos.setXYZ(i,x*ridge,y,z*ridge);
 }
 rockGeometry.computeVertexNormals();
 const rock=new THREE.Mesh(rockGeometry,new THREE.MeshStandardMaterial({color:'#373335',roughness:1,metalness:0}));
 rock.rotation.x=Math.PI/2;rock.position.z=.041*r;group.add(rock);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.016*r,.004*r,8,40),new THREE.MeshStandardMaterial({color:'#51413a',roughness:1}));rim.position.z=.082*r;group.add(rim);
 const crater=new THREE.Mesh(new THREE.CircleGeometry(.014*r,32),new THREE.MeshBasicMaterial({color:'#ff953d',transparent:true,opacity:.5,depthWrite:false}));crater.position.z=.083*r;group.add(crater);
 const halo=new THREE.Mesh(new THREE.PlaneGeometry(.19*r,.19*r),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{uPower:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float uPower;void main(){float d=length(vUv-.5)*2.;float a=pow(max(0.,1.-d),4.)*uPower;gl_FragColor=vec4(1.,.24,.025,a);}'
 }));halo.position.z=.084*r;group.add(halo);

 const lava=[];
 for(let j=0;j<3;j++){
  const a=j*TAU/3+.4,points=[];
  for(let i=0;i<=36;i++){
   const t=i/36,rad=.014+.061*t,theta=a+Math.sin(t*8+j*2)*.085*t;
   // Follow the tapered flank first, then a short surface tongue.
   const z=t<.76?.083*(1-t/.81):.004;
   points.push(new THREE.Vector3(Math.cos(theta)*rad*r,Math.sin(theta)*rad*r,z*r));
  }
  const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,.0017*r,5,false),new THREE.MeshBasicMaterial({color:j%2?'#ef4e15':'#ff9a29',transparent:true,opacity:0,depthWrite:false}));
  group.add(tube);lava.push(tube);
 }

 const volumeGeometry=new THREE.BoxGeometry(.70,.60,.715);volumeGeometry.translate(-.05,0,.3925);
 const volumeMaterial=new THREE.ShaderMaterial({
  uniforms:{uCamera:{value:new THREE.Vector3()},uTime:{value:0},uPlume:{value:0},uAsh:{value:0},uFlow:{value:0}},
  vertexShader:'varying vec3 vLocal;void main(){vLocal=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:volumeFragment,transparent:true,depthWrite:false,side:THREE.FrontSide
 });
 const plume=new THREE.Mesh(volumeGeometry,volumeMaterial);plume.scale.setScalar(r);plume.frustumCulled=false;plume.renderOrder=2;group.add(plume);
 const worldCamera=new THREE.Vector3(),inverseWorld=new THREE.Matrix4();
 plume.onBeforeRender=(_renderer,_scene,camera)=>{camera.getWorldPosition(worldCamera);inverseWorld.copy(plume.matrixWorld).invert();volumeMaterial.uniforms.uCamera.value.copy(worldCamera).applyMatrix4(inverseWorld);};

 const emberPositions=new Float32Array(72*3),emberGeometry=new THREE.BufferGeometry();emberGeometry.setAttribute('position',new THREE.BufferAttribute(emberPositions,3));
 const emberMaterial=makePointMaterial('#ffab47',24,.65),embers=new THREE.Points(emberGeometry,emberMaterial);embers.frustumCulled=false;embers.renderOrder=3;group.add(embers);
 const annotations=[
  {id:'volcano-crater',text:'喷发强度',color:'#ffad73',position:new THREE.Vector3(0,0,.084*r)},
   {id:'volcano-plume',text:'灰柱指数',color:'#b8b6ad',position:new THREE.Vector3(0,0,.5*r)}
 ];
 let lastProgress=NaN,lastSignature='';
 function update(data,progress){
  const s=data.scene,p=clamp(progress),signature=[s.plume,s.ash,s.magmaFlow,s.pressure,s.rise].join(',');
  if(p===lastProgress&&signature===lastSignature)return;
  lastProgress=p;lastSignature=signature;
  const flow=clamp(s.magmaFlow),density=clamp(s.plume),ash=clamp(s.ash);
  const height=.14+.56*density;
  annotations[0].text=`喷发强度 ${Math.round(flow*100)}%`;
  annotations[1].text=`灰柱指数 ${density.toFixed(2)}`;
  annotations[1].position.set(-.19*height*.78*.78*r,.07*height*.78*.78*r,(.075+height*.78+.04*density)*r);
  annotations[1].visible=density>.005;
  const flicker=.88+.12*Math.sin(p*730);
  crater.material.opacity=.12+.25*clamp(s.rise)+.63*flow*flicker;
  crater.material.color.setRGB(1,.19+.5*flow,.035+.18*flow);
  halo.material.uniforms.uPower.value=(.07+.65*flow)*clamp(s.rise)*flicker;
  for(let j=0;j<lava.length;j++){
   const tube=lava[j],growth=clamp(flow*1.6-j*.08);
   tube.visible=flow>.001;tube.material.opacity=clamp(flow*1.3)*(.8+.2*Math.sin(p*360-j));
   tube.geometry.setDrawRange(0,Math.floor(tube.geometry.index.count*growth/3)*3);
  }
  plume.visible=density>.005;
  volumeMaterial.uniforms.uTime.value=p*30;
  volumeMaterial.uniforms.uPlume.value=density;
  volumeMaterial.uniforms.uAsh.value=ash;
  volumeMaterial.uniforms.uFlow.value=flow;
  embers.visible=flow>.005;emberMaterial.uniforms.uOpacity.value=.16+.65*flow;
  for(let i=0;i<72;i++){
   const seed=(i*.754877666)%1,t=(p*18+i*.61803398875)%1,a=i*2.399963;
   const spread=(.025+.085*flow)*(.45+.55*seed);
   const z=.086+(.12+.19*flow)*(1+seed*.18)*t-.38*t*t;
   emberPositions[i*3]=Math.cos(a)*t*spread*r;
   emberPositions[i*3+1]=Math.sin(a)*t*spread*r;
   emberPositions[i*3+2]=(z>.012?z:-.01)*r;
  }
  emberGeometry.attributes.position.needsUpdate=true;
 }
 return {group,update,annotations,channels:{crater:'magmaFlow',lava:'magmaFlow',plume:'plume',ash:'ash'},visualScale:'喷发柱和地形均为放大示意；非实测高度或扩散范围'};
}
