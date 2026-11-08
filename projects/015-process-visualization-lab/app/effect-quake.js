import * as THREE from './vendor/three.module.js';

export const QUAKE_DISPLAY_SCALE=8;
const EARTH_KM=6371;
const colors=['#39ddea','#a778f3'];

/**
 * Curved wave packets share the exact surface radius from models.js.
 * Only their presentation radius is multiplied by the stated factor of eight.
 * Brightness, fine wave packets and surface stippling are explanatory styling,
 * not measured shaking, an intensity map or a rupture/fault reconstruction.
 */
export function createQuakeLayer(r){
 const group=new THREE.Group();
 const geo=new THREE.PlaneGeometry(r*1.25,r*1.25,112,112),attr=geo.attributes.position;
 for(let i=0;i<attr.count;i++){
  const x=attr.getX(i),y=attr.getY(i),v=new THREE.Vector3(x,y,r).normalize().multiplyScalar(r*1.004);
  attr.setXYZ(i,v.x,v.y,v.z-r);
 }
 geo.computeVertexNormals();

 const waveMat=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,
  uniforms:{r:{value:r},front:{value:new THREE.Vector2()},energy:{value:1},age:{value:0},arrival:{value:4},cP:{value:new THREE.Color(colors[0])},cS:{value:new THREE.Color(colors[1])}},
  vertexShader:`varying vec3 point;
   void main(){point=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`
   varying vec3 point;
   uniform float r,energy,age,arrival;
   uniform vec2 front;
   uniform vec3 cP,cS;
   float gauss(float value,float width){return exp(-value*value/(width*width));}
   // Narrow leading edge; a short, lower-contrast wave train follows it.
   vec2 packet(float radius,float angle,float azimuth,float spacing){
    float arrived=step(.00001,radius);
    float d=radius-angle;
    float behind=step(0.,d);
    float modulation=.9+.10*sin(azimuth*11.+angle*43.);
    float edge=gauss(d,max(.0032,fwidth(angle)*.8));
    float shoulder=gauss(d,.009)*.12;
    // Two bounded echoes, not an indefinitely repeating radar-like pattern.
    float train=(gauss(d-spacing,.0038)*.65+gauss(d-spacing*2.,.0048)*.16)*behind;
    return vec2((edge*.98+shoulder)*arrived,train*modulation*arrived);
   }
   void main(){
    float angle=atan(length(point.xy),point.z+r);
    float azimuth=atan(point.y,point.x);
    vec2 p=packet(front.x,angle,azimuth,.019);
    vec2 s=packet(front.y,angle,azimuth,.025);
    float amp=.53+.39*clamp(log(1.+energy)/3.,0.,1.);
    float falloff=.65+.35*exp(-angle*2.);
    float wp=(p.x+p.y*.18)*amp*falloff;
    float ws=(s.x+s.y*.22)*amp*falloff;

    // Fine marks sit directly on the surface and only respond behind an
    // arrived wavefront. They make the passing packet visible over land and
    // ocean without moving the Earth or implying a mapped shaking intensity.
    vec2 surface=point.xy/r;
    vec2 cell=fract(surface*128.+.5)-.5;
    float stipple=1.-smoothstep(.08,.22,length(cell));
    float behindP=max(front.x-angle,0.);
    float behindS=max(front.y-angle,0.);
    float envelopeP=step(angle,front.x)*step(.00001,front.x)*exp(-behindP/.055)*(1.-exp(-behindP/.005));
    float envelopeS=step(angle,front.y)*step(.00001,front.y)*exp(-behindS/.075)*(1.-exp(-behindS/.005));
    float pulse=.55+.45*sin(angle*310.-age*1.5+sin(azimuth*8.));
    float surfaceP=stipple*envelopeP*.045*pulse*amp;
    float surfaceS=stipple*envelopeS*.075*pulse*amp;
    wp+=surfaceP;ws+=surfaceS;

    // A soft, brief response at the epicenter starts at the P arrival.
    float startGlow=gauss(angle,.018)*step(arrival,age)*exp(-max(age-arrival,0.)*.16)*.25;
    float alpha=clamp(wp+ws+startGlow,0.,.84);
    if(alpha<.001)discard;
    vec3 color=(cP*wp+cS*ws+vec3(1.,.73,.48)*startGlow)/max(.00001,wp+ws+startGlow);
    gl_FragColor=vec4(color,alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`
 });
 const waves=new THREE.Mesh(geo,waveMat);group.add(waves);

 // A small locator denotes the hypothetical epicenter. No invented fault line.
 const center=new THREE.Mesh(new THREE.SphereGeometry(.0075*r,20,12),new THREE.MeshBasicMaterial({color:'#ffe0b1',toneMapped:false}));
 center.position.z=.009*r;group.add(center);
 const marker=new THREE.Mesh(new THREE.RingGeometry(.016*r,.018*r,48),new THREE.MeshBasicMaterial({color:'#ffd4a0',transparent:true,opacity:.46,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
 marker.position.z=.008*r;group.add(marker);
 const ticks=[];
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2;
  ticks.push(new THREE.Vector3(Math.cos(a)*.025*r,Math.sin(a)*.025*r,.009*r),new THREE.Vector3(Math.cos(a)*.034*r,Math.sin(a)*.034*r,.009*r));
 }
 const locator=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ticks),new THREE.LineBasicMaterial({color:'#ffd4a0',transparent:true,opacity:.48,depthWrite:false,toneMapped:false}));group.add(locator);

 return {group,update(d){
  const s=d.scene;
  waveMat.uniforms.front.value.set(s.frontP/EARTH_KM*QUAKE_DISPLAY_SCALE,s.frontS/EARTH_KM*QUAKE_DISPLAY_SCALE);
  waveMat.uniforms.energy.value=s.energy;waveMat.uniforms.age.value=s.waveAge;
  waveMat.uniforms.arrival.value=s.arrivals.p;
  const response=s.waveAge>=s.arrivals.p?Math.exp(-(s.waveAge-s.arrivals.p)*.15):0;
  center.scale.setScalar(.9+.35*response);
  marker.material.opacity=.35+.3*response;
 }};
}
