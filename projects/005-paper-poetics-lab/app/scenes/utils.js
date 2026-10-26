import * as THREE from 'three';
export const TAU=Math.PI*2;
export function random(seed=72){return()=>{seed|=0;seed=seed+0x6d2b79f5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
export function createWorld(color='#e9e5d9',height=5.5){
  const scene=new THREE.Scene();scene.background=new THREE.Color(color);
  const camera=new THREE.OrthographicCamera(-9,9,height,-height,.1,160);camera.position.set(0,1,18);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xfaf3df,0x5d6859,1.5));
  const key=new THREE.DirectionalLight(0xfff2d9,2.2);key.position.set(-5,9,8);scene.add(key);
  return{scene,camera,resize(aspect){camera.left=-height*aspect;camera.right=height*aspect;camera.top=height;camera.bottom=-height;camera.updateProjectionMatrix();}};
}
export function mesh(parent,geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
export const basic=(color,options={})=>new THREE.MeshBasicMaterial({color,...options});
export const matte=(color,options={})=>new THREE.MeshStandardMaterial({color,roughness:.9,metalness:0,side:THREE.DoubleSide,...options});
export function line(parent,points,color,opacity=1){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));parent.add(l);return l;}
export function canvasTexture(draw,width=512,height=512){const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
export const noiseGLSL=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+12.;a*=.5;}return s;}`;
export function disposeScene(scene){const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.isLight)o.dispose?.();if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))materials.add(m);});for(const m of materials){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);if(m.uniforms)for(const u of Object.values(m.uniforms))if(u.value?.isTexture)textures.add(u.value);m.dispose();}geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());}
