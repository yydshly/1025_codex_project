import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createTeaScene} from './scenes/tea.js';
import {createMoonScene} from './scenes/moon.js';
import {disposeScene,noiseGLSL} from './scenes/utils.js';
const factories={tea:createTeaScene,moon:createMoonScene};
const clamp=v=>THREE.MathUtils.clamp(Number(v)||0,0,1);
const postFragment=`precision highp float;uniform sampler2D uScene,uDepth;uniform vec2 uSize,uNearFar;uniform float uNight;varying vec2 vUv;${noiseGLSL}
vec3 film(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
vec3 glow(vec2 uv){vec3 c=texture2D(uScene,uv).rgb;return max(c-vec3(1.15),vec3(0.));}
void main(){
 float depth=texture2D(uDepth,vUv).x;
 float distance=uNearFar.x*uNearFar.y/(uNearFar.y-depth*(uNearFar.y-uNearFar.x));
 float haze=smoothstep(15.,44.,distance);vec2 soft=vec2(1.8*haze)/uSize;
 vec3 linear=texture2D(uScene,vUv).rgb*.4;
 linear+=(texture2D(uScene,vUv+soft).rgb+texture2D(uScene,vUv-soft).rgb+texture2D(uScene,vUv+vec2(soft.x,-soft.y)).rgb+texture2D(uScene,vUv+vec2(-soft.x,soft.y)).rgb)*.15;
 linear=max(linear,vec3(0.));
 vec2 d=vec2(2.5)/uSize;vec3 bloom=vec3(0.);
 bloom+=glow(vUv+d)*.125; bloom+=glow(vUv-d)*.125;
 bloom+=glow(vUv+vec2(d.x,-d.y))*.125;bloom+=glow(vUv+vec2(-d.x,d.y))*.125;
 bloom+=glow(vUv+vec2(d.x*3.,0.))*.125;bloom+=glow(vUv-vec2(d.x*3.,0.))*.125;
 bloom+=glow(vUv+vec2(0.,d.y*3.))*.125;bloom+=glow(vUv-vec2(0.,d.y*3.))*.125;
 vec3 color=pow(film(linear+bloom*.075),vec3(1./2.2));
 float grain=hash(floor(vUv*uSize))-.5;
 color+=grain*mix(.009,.005,uNight)+(noise(vUv*260.)-.5)*.003;
 float edge=smoothstep(.35,.86,length((vUv-.5)*vec2(1.,.82)));
 color*=1.-edge*mix(.065,.12,uNight);
 float rim=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));
 float fiberEdge=fbm(vUv*vec2(53.,47.));float intact=smoothstep(.004+fiberEdge*.004,.012+fiberEdge*.005,rim);
 vec3 paper=mix(vec3(.917,.898,.850),vec3(.055,.082,.124),uNight);
 color=mix(paper,color,intact);gl_FragColor=vec4(color,1.);
}`;

export function createExperience(canvas,{theme='tea',preview=false,onProgress=()=>{},onState=()=>{},onReady=()=>{}}={}){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'default'});renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.045);room.dispose();pmrem.dispose();
  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,samples:preview?0:2});
  target.depthTexture=new THREE.DepthTexture(1,1);
  const uniforms={uScene:{value:target.texture},uDepth:{value:target.depthTexture},uNearFar:{value:new THREE.Vector2(.1,160)},uSize:{value:new THREE.Vector2(1,1)},uNight:{value:theme==='moon'?1:0}};
  const composite=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:postFragment,depthTest:false,depthWrite:false}));composite.add(quad);
  const state={theme,progress:preview?.42:.06,paused:reduced.matches,auto:false,time:0,action:0};
  let instance,width=1,height=1,last=performance.now(),lastDraw=-Infinity,raf,disposed=false,dirty=true,active=true,actionStart=-100,readyNotified=false,lost=false;
  const pointer={x:0,y:0};
  function notify(){onState({...state});}
  function resize(){
    const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    const ratio=Math.min(devicePixelRatio||1,preview?1.25:1.5),scale=Math.min(1,1600/(width*ratio),1100/(height*ratio));
    renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);target.setSize(Math.max(1,Math.round(width*ratio*scale)),Math.max(1,Math.round(height*ratio*scale)));uniforms.uSize.value.set(width,height);instance?.resize(width/height);dirty=true;
  }
  function setTheme(value){
    value=factories[value]?value:'tea';
    if(instance&&state.theme===value)return;
    if(instance){if(instance.dispose)instance.dispose();else disposeScene(instance.scene);}
    state.theme=value;uniforms.uNight.value=value==='moon'?1:0;instance=factories[value]({preview});instance.scene.environment=environment.texture;if(instance.scene.environmentIntensity===1)instance.scene.environmentIntensity=value==='moon'?.12:.4;instance.resize(width/height);dirty=true;readyNotified=false;canvas.dataset.ready='false';canvas.dataset.theme=value;notify();
  }
  function setProgress(value,manual=true){state.progress=clamp(value);if(manual)state.auto=false;dirty=true;onProgress(state.progress);notify();}
  function tick(now){
    if(disposed)return;raf=requestAnimationFrame(tick);
    if(document.hidden||!active||lost){last=now;return;}
    const interval=1000/(preview?30:60),elapsed=now-lastDraw;if(!dirty&&elapsed<interval)return;
    const delta=Math.min(.05,(now-last)/1000);last=now;lastDraw=Number.isFinite(elapsed)?now-elapsed%interval:now;
    if(state.paused&&!dirty)return;
    if(!state.paused){state.time+=delta;
      if(state.auto){state.progress=Math.min(1,state.progress+delta*.034);onProgress(state.progress);if(state.progress>=1){state.auto=false;notify();}}
    }
    let progress=state.progress;
    if(preview)progress=.43+Math.sin(state.time*.075)*.12;
    const phase=(state.time-actionStart)/(state.theme==='tea'?3.6:4.8);
    state.action=phase>=0&&phase<1?Math.sin(phase*Math.PI):0;
    if(reduced.matches&&phase>=0&&phase<1)state.action=1;
    instance.update({time:state.time,progress,pointer,reduced:reduced.matches,action:state.action});
    uniforms.uNearFar.value.set(instance.camera.near,instance.camera.far);
    renderer.setRenderTarget(target);renderer.render(instance.scene,instance.camera);renderer.setRenderTarget(null);renderer.render(composite,camera);
    canvas.dataset.ready='true';canvas.dataset.progress=progress.toFixed(3);canvas.dataset.paused=String(state.paused);canvas.dataset.action=state.action.toFixed(2);dirty=false;
    if(!readyNotified){readyNotified=true;onReady(state.theme);}
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const intersection=preview?new IntersectionObserver(entries=>{active=entries[0].isIntersecting;dirty=true;last=performance.now();}):null;intersection?.observe(canvas);
  const move=event=>{if(event.pointerType==='touch')return;const r=canvas.getBoundingClientRect();pointer.x=(event.clientX-r.left)/r.width*2-1;pointer.y=1-(event.clientY-r.top)/r.height*2;};canvas.addEventListener('pointermove',move,{passive:true});
  const onVisibility=()=>{last=performance.now();dirty=true;};document.addEventListener('visibilitychange',onVisibility);
  const onContextLost=event=>{event.preventDefault();lost=true;canvas.dispatchEvent(new Event('art-error'));},onContextRestored=()=>location.reload();
  canvas.addEventListener('webglcontextlost',onContextLost);canvas.addEventListener('webglcontextrestored',onContextRestored);
  resize();setTheme(theme);raf=requestAnimationFrame(tick);
  return{
    setTheme,setProgress,
    setPaused(value){state.paused=!!value;last=performance.now();dirty=true;notify();},
    setAuto(value){state.auto=!!value;if(state.auto){state.paused=false;if(state.progress>=1)state.progress=0;}dirty=true;notify();},
    trigger(){actionStart=state.time;state.paused=false;dirty=true;notify();},
    get state(){return{...state};},
    dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();intersection?.disconnect();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('webglcontextlost',onContextLost);canvas.removeEventListener('webglcontextrestored',onContextRestored);document.removeEventListener('visibilitychange',onVisibility);if(instance?.dispose)instance.dispose();else if(instance)disposeScene(instance.scene);environment.dispose();target.dispose();quad.geometry.dispose();quad.material.dispose();renderer.dispose();},
  };
}
