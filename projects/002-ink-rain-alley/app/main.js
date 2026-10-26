import './style.css';
import * as THREE from 'three';
import { createAlley } from './scene.js';
import { drawBranch, paperTexture } from './paper.js';
import { fullscreenVertex } from './shaders.js';
import { storyFragment } from './compositor.js';
import { tracks, totalUnits, locate, seasons } from './story-data.js';
import { sceneCreators } from './story-scenes.js';
import { createSoundscape } from './audio.js';
import { createFrameStats } from './frame-stats.js';

// The chapter hash is the bookmark; native scroll restoration must not override it.
history.scrollRestoration='manual';
const $=selector=>document.querySelector(selector);
const shell=$('#story-shell'),canvas=$('#world'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=THREE.MathUtils.clamp;
const smooth=(a,b,value)=>{const t=clamp((value-a)/(b-a),0,1);return t*t*(3-2*t);};
const state={index:0,progress:0,units:0,time:0,paused:reduced.matches,auto:false,autoUnits:0,side:0,rain:.65,season:null,pointer:{x:0,y:0},strokeCycle:0,enteredAt:0,jump:null,dirty:true,hidden:document.hidden,last:performance.now()};
const sound=createSoundscape();
let audioBusy=false,audioFailure='';
function updateAudioControls(audio=sound.state){
  $('#audio').textContent=audio.loading?'声音 加载中':audio.enabled?'声音 开':'声音 关';
  $('#audio').setAttribute('aria-pressed',String(audio.enabled));$('#audio').disabled=audioBusy||audio.loading;
  $('#sound-play').textContent=audio.loading?'正在加载配乐…':audio.enabled?'关闭声音':'开启声音';
  $('#sound-play').setAttribute('aria-pressed',String(audio.enabled));$('#sound-play').disabled=audioBusy||audio.loading;
  document.querySelectorAll('[data-sound-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.soundMode===audio.mode)));
  $('#music-level').disabled=audio.mode==='nature';
  $('#sound-status').textContent=audio.error||audioFailure||(!audio.enabled?'默认静音，点击后播放。':audio.loading?'正在加载本地原创配乐…':audio.paused?'动态已暂停，继续动态后播放。':audio.hidden?'切到后台，声音已暂停。':audio.running?(audio.mode==='nature'?'正在播放环境声。':'正在播放《纸上归途》与环境声。'):'正在恢复声音…');
  $('#sound-status').dataset.context=audio.contextState;$('#sound-status').dataset.mode=audio.mode;$('#sound-status').dataset.scoreReady=String(audio.scoreReady);
}
function updateSound(){
  let season=state.season??clamp(state.progress*4,0,3);if(state.side&&state.season===null)season=3-season;
  sound.update(tracks[state.index].kind,state.rain,state.paused,{season});
}
async function toggleSound(){
  if(audioBusy)return;audioBusy=true;audioFailure='';updateAudioControls();
  try{await sound.toggle();}catch(error){audioFailure='声音暂时无法启用，请检查浏览器权限后重新尝试。';console.warn('Audio initialization failed',error);}
  finally{audioBusy=false;updateAudioControls();}
}

function initializeMarkup(){
  $('#timeline').style.height=`${(totalUnits+1)*100}svh`;
  for(const [index,track] of tracks.entries()){
    const section=document.createElement('section');section.className='scroll-step';section.style.height=`${track.span*100}svh`;section.setAttribute('aria-label',`${track.number} ${track.name}`);section.innerHTML=`<h2 class="sr-only">${track.name}</h2>`;$('#timeline').append(section);
    const nav=document.createElement('button');nav.type='button';nav.dataset.track=index;nav.setAttribute('aria-label',`跳到${track.name}`);nav.innerHTML=`<i></i><span>${track.number} / ${track.name}</span>`;$('#chapter-rail').append(nav);
    const row=document.createElement('button');row.type='button';row.dataset.track=index;row.innerHTML=`<small>${track.number}</small><strong>${track.name}</strong><span>${track.en}</span>`;$('#tracklist').append(row);
  }
}
function updateControls(){
  $('#pause').textContent=state.paused?'继续动态':'暂停动态';$('#pause').setAttribute('aria-pressed',String(state.paused));
  $('#auto-tour').textContent=state.auto?'停止游览':'自动游览';$('#auto-tour').setAttribute('aria-pressed',String(state.auto));
  $('#side-label').textContent=`SIDE ${state.side?'B':'A'}`;$('#end-side').textContent=state.side?'B':'A';$('#tape-flip').textContent=`翻到 ${state.side?'A':'B'} 面`;
  $('#status').textContent=state.paused?'把这一刻，留在纸上。':state.auto?'正在慢慢走过这段故事。':tracks[state.index].name;
  $('#previous').disabled=state.index===0;$('#next').disabled=state.index===tracks.length-1;
  updateSound();
}
function updateCopy(index){
  const track=tracks[index];shell.dataset.scene=track.kind;$('.transport').dataset.scene=track.kind;
  $('#track-number').textContent=`TRACK ${track.number}`;$('#track-name').textContent=track.name;
  $('#eyebrow').textContent=track.en;$('#story-title').innerHTML=track.title;
  $('#story-subtitle').textContent=track.subtitle;$('#story-chinese').innerHTML=track.chinese.replaceAll('\n','<br>');
  $('#cover-actions').hidden=index!==0;$('#season-controls').hidden=index!==5;$('#tape-actions').hidden=index!==2;$('#enso-actions').hidden=index!==8;$('#ending-notes').hidden=index!==9;$('#rain-control').hidden=index!==1;
  $('#botanical').style.opacity=index===1?'1':'0';
  document.querySelectorAll('#chapter-rail button').forEach((button,i)=>{button.classList.toggle('active',i===index);if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  shell.classList.toggle('dark',index===4||index===5);updateControls();
  if(index===8)state.strokeCycle++;
  history.replaceState(null,'',index===0?location.pathname+location.search:`#${track.id}`);
}
function readScroll(){
  if(state.jump)return;
  state.units=clamp(scrollY/innerHeight,0,totalUnits);const position=locate(state.units);
  if(position.index!==state.index){state.index=position.index;state.enteredAt=state.time;updateCopy(state.index);}
  state.progress=position.progress;state.dirty=true;
  const percent=Math.round(state.units/totalUnits*1000);$('#story-progress').value=percent;$('#progress-value').value=`${Math.round(percent/10).toString().padStart(2,'0')}%`;
}
function go(index,instant=false){
  index=clamp(index,0,tracks.length-1);state.auto=false;state.season=null;
  document.querySelectorAll('[data-season]').forEach(button=>button.setAttribute('aria-pressed','false'));$('#season-follow').setAttribute('aria-pressed','true');
  const units=tracks[index].start+(index===0?0:tracks[index].span*.065);
  scrollTo({top:units*innerHeight,behavior:instant||reduced.matches?'instant':'smooth'});updateControls();
}
function flip(restart=false){
  state.auto=false;state.side=1-state.side;state.dirty=true;updateControls();
  if(restart){state.jump={from:state.index,to:1,start:performance.now(),duration:1500};state.paused=false;updateControls();}
}

function boot(){
  initializeMarkup();
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.outputColorSpace=THREE.SRGBColorSpace;
  const frameStats=createFrameStats();
  const renderTarget=(w=1,h=1)=>new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
  const previewRain=renderTarget(320,512),previewForest=renderTarget(256,512);
  const shared={rainTexture:previewRain.texture,forestTexture:previewForest.texture};
  const instances=new Map();
  function ensure(index){
    if(!instances.has(index)){
      if(index===1){
        const alley=createAlley();instances.set(1,{...alley,resize(aspect){alley.camera.aspect=aspect;alley.camera.updateProjectionMatrix();},update(time,p,o,delta){alley.camera.position.z=12.5-p*1.4;alley.update(time,o.rain,o.pointer,delta);}});
      }else instances.set(index,sceneCreators[index](shared));
    }
    return instances.get(index);
  }
  const targetA=renderTarget(),targetB=renderTarget(),paper=paperTexture();
  const uniforms={uA:{value:targetA.texture},uB:{value:targetB.texture},uPaper:{value:paper},uResolution:{value:new THREE.Vector2()},uRainRect:{value:new THREE.Vector4()},uModeA:{value:0},uModeB:{value:0},uStyleA:{value:0},uStyleB:{value:0},uMix:{value:0},uTime:{value:0},uSide:{value:0}};
  const compositeScene=new THREE.Scene(),compositeCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  compositeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms,vertexShader:fullscreenVertex,fragmentShader:storyFragment,depthTest:false,depthWrite:false})));
  let viewportAspect=1,rainAspect=1,lastPreviews=-100,lastSeason=-1,contextLost=false,lastPaint=-Infinity;
  function resize(){
    const ratio=Math.min(devicePixelRatio||1,1.5),w=innerWidth,h=innerHeight;
    renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);targetA.setSize(Math.min(1600,Math.round(w*ratio)),Math.min(1100,Math.round(h*ratio)));targetB.setSize(targetA.width,targetA.height);
    viewportAspect=w/h;uniforms.uResolution.value.set(w,h);
    const rect=$('#rain-aperture').getBoundingClientRect();rainAspect=rect.width/rect.height;
    uniforms.uRainRect.value.set(rect.x/w,1-(rect.y+rect.height)/h,rect.width/w,rect.height/h);drawBranch($('#botanical'),rect);state.dirty=true;readScroll();
  }
  const options=()=>({side:state.side,rain:state.rain,pointer:state.pointer,season:state.season,strokeCycle:state.strokeCycle,enteredAt:state.enteredAt,reduced:reduced.matches,jump:state.jump?clamp((performance.now()-state.jump.start)/state.jump.duration,0,1):0});
  function renderPreview(index,target,progress){const instance=ensure(index);instance.resize(target.width/target.height);instance.update(state.time,progress,options(),.016);renderer.setRenderTarget(target);renderer.render(instance.scene,instance.camera);}
  function updatePreviews(force=false){
    if(!force&&state.time-lastPreviews<.20)return;
    renderPreview(1,previewRain,.25);renderPreview(4,previewForest,.4);lastPreviews=state.time;
  }
  function renderScene(index,progress,target,delta){
    const instance=ensure(index);instance.resize(index===1?rainAspect:viewportAspect);instance.update(state.time,progress,options(),delta);
    renderer.setRenderTarget(target);renderer.render(instance.scene,instance.camera);
  }
  function tick(now){
    // Quiet scenes do not need to render at a 144/240 Hz display's full rate.
    // Gate before advancing simulation time so rain and auto-tour keep real speed.
    if(!state.paused&&!state.hidden&&!contextLost){
      const elapsed=now-lastPaint,interval=1000/60;if(elapsed<interval)return;
      lastPaint=Number.isFinite(elapsed)?now-elapsed%interval:now;
    }
    const delta=Math.min((now-state.last)/1000,.05);state.last=now;
    if(state.hidden||contextLost){frameStats.reset(state.hidden?'Background paused':'WebGL context lost');return;}
    if(state.paused)frameStats.reset('Animation paused');
    if(!state.paused)state.time+=delta;
    if(state.auto&&!state.paused&&!state.jump&&!$('#contents').open){
      const speed=tracks[state.index].kind==='seasons'?.17:.105;state.autoUnits=Math.min(totalUnits,state.autoUnits+delta*speed);scrollTo({top:state.autoUnits*innerHeight,behavior:'instant'});readScroll();
      if(state.units>=totalUnits-.01){state.auto=false;updateControls();}
    }
    if(state.paused&&!state.dirty&&!state.jump)return;
    let index=state.index,progress=state.progress,next=Math.min(index+1,9),blend=smooth(index===5?.96:.87,1,progress);
    if(state.jump){index=state.jump.from;next=state.jump.to;progress=.7;blend=smooth(.1,.95,(now-state.jump.start)/state.jump.duration);}
    const renderStarted=frameStats.enabled?performance.now():0;
    if(index===0||index===2||(blend>0&&(next===0||next===2)))updatePreviews(lastPreviews<0);
    renderScene(index,progress,targetA,delta);
    if(blend>0)renderScene(next,state.jump ? .065 : 0,targetB,delta);
    uniforms.uModeA.value=index===1?1:0;uniforms.uModeB.value=next===1?1:0;uniforms.uStyleA.value=index;uniforms.uStyleB.value=next;uniforms.uMix.value=blend;uniforms.uTime.value=state.time;uniforms.uSide.value=state.side;
    renderer.setRenderTarget(null);renderer.render(compositeScene,compositeCamera);
    if(frameStats.enabled&&!state.paused){
      const cpuMs=performance.now()-renderStarted;
      const season=index===5?` / ${seasons[Math.min(3,Math.round(ensure(5).season))].name}`:'';
      frameStats.sample({now,cpuMs,scene:`${tracks[index].id}${season}${blend>0?` → ${tracks[next].id}`:''} · ${state.side?'B':'A'}`,width:innerWidth,height:innerHeight,pixelRatio:renderer.getPixelRatio(),bufferWidth:canvas.width,bufferHeight:canvas.height,targetWidth:targetA.width,targetHeight:targetA.height});
    }
    $('#story-copy').style.opacity=String(state.index===0?1:(1-blend)*(.35+.65*smooth(0,.07,state.progress)));
    if(state.index===5){
      const value=ensure(5).season,seasonIndex=Math.min(3,Math.round(value));
      if(seasonIndex!==lastSeason||$('#story-title').textContent!==seasons[seasonIndex].name){lastSeason=seasonIndex;$('#story-title').textContent=seasons[seasonIndex].name;$('#story-subtitle').textContent=seasons[seasonIndex].line;$('#story-chinese').textContent=seasons[seasonIndex].cn;shell.dataset.season=seasonIndex;updateSound();}
    }
    canvas.dataset.ready='true';canvas.dataset.scene=tracks[state.index].id;canvas.dataset.side=state.side?'B':'A';canvas.dataset.paused=String(state.paused);canvas.dataset.rain=String(state.rain);canvas.dataset.progress=state.progress.toFixed(3);
    state.dirty=false;
    if(state.jump&&now-state.jump.start>=state.jump.duration){state.jump=null;go(1,true);readScroll();}
  }
  const raycaster=new THREE.Raycaster();
  document.addEventListener('click',event=>{
    if(event.target.closest('button,input,a,dialog,label'))return;
    const instance=instances.get(state.index);if(!instance?.interactive)return;
    raycaster.setFromCamera(new THREE.Vector2(event.clientX/innerWidth*2-1,1-event.clientY/innerHeight*2),instance.camera);
    const hit=raycaster.intersectObjects(instance.interactive,true)[0];if(!hit)return;
    let object=hit.object;while(object&&!object.userData.track&&!object.userData.action)object=object.parent;
    if(object?.userData.action==='flip')flip();else if(object?.userData.track)go(object.userData.track);
  });
  addEventListener('scroll',readScroll,{passive:true});
  addEventListener('resize',resize);document.fonts.ready.then(resize);
  addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;state.pointer.x=(event.clientX/innerWidth-.5)*2;state.pointer.y=(.5-event.clientY/innerHeight)*2;$('#cursor').style.transform=`translate(${event.clientX}px,${event.clientY}px)`;},{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{state.pointer={x:0,y:0};});
  const stopAuto=()=>{if(state.auto){state.auto=false;updateControls();}};
  addEventListener('wheel',stopAuto,{passive:true});addEventListener('touchstart',stopAuto,{passive:true});
  $('#home').addEventListener('click',()=>go(0));$('#enter-story').addEventListener('click',()=>go(1));
  addEventListener('hashchange',()=>{const target=tracks.findIndex(track=>track.id===location.hash.slice(1));go(target<0?0:target,true);readScroll();});
  $('#previous').addEventListener('click',()=>go(state.index-1));$('#next').addEventListener('click',()=>go(state.index+1));
  document.querySelectorAll('[data-track]').forEach(button=>button.addEventListener('click',()=>{$('#contents').close();go(Number(button.dataset.track));}));
  $('#contents-open').addEventListener('click',()=>$('#contents').showModal());$('#contents-close').addEventListener('click',()=>$('#contents').close());
  $('#contents').addEventListener('click',event=>{if(event.target===$('#contents'))$('#contents').close();});
  $('#pause').addEventListener('click',()=>{state.paused=!state.paused;if(state.paused)state.auto=false;state.dirty=true;updateControls();});
  $('#auto-tour').addEventListener('click',()=>{state.auto=!state.auto;if(state.auto){state.paused=false;if(state.index===9)go(0,true);state.autoUnits=scrollY/innerHeight;state.auto=true;}state.dirty=true;updateControls();});
  $('#story-progress').addEventListener('input',()=>{stopAuto();scrollTo({top:Number($('#story-progress').value)/1000*totalUnits*innerHeight,behavior:'instant'});readScroll();});
  $('#rain').addEventListener('input',()=>{state.rain=Number($('#rain').value)/100;$('#rain-value').value=$('#rain').value;state.dirty=true;updateSound();});
  $('#audio').addEventListener('click',toggleSound);$('#sound-play').addEventListener('click',toggleSound);
  $('#audio-settings').addEventListener('click',()=>$('#sound-panel').showModal());$('#sound-close').addEventListener('click',()=>$('#sound-panel').close());
  $('#sound-panel').addEventListener('click',event=>{if(event.target===$('#sound-panel'))$('#sound-panel').close();});
  $('#volume').addEventListener('input',()=>{sound.setVolume(Number($('#volume').value)/100);$('#volume-value').value=`${$('#volume').value}%`;});
  $('#music-level').addEventListener('input',()=>{sound.setMusicLevel(Number($('#music-level').value)/100);$('#music-value').value=`${$('#music-level').value}%`;});
  $('#nature-level').addEventListener('input',()=>{sound.setNatureLevel(Number($('#nature-level').value)/100);$('#nature-value').value=`${$('#nature-level').value}%`;});
  document.querySelectorAll('[data-sound-mode]').forEach(button=>button.addEventListener('click',async()=>{try{await sound.setMode(button.dataset.soundMode);}catch(error){console.warn('Score loading failed',error);}updateAudioControls();}));
  sound.subscribe(updateAudioControls);
  document.querySelectorAll('[data-season]').forEach(button=>button.addEventListener('click',()=>{state.season=Number(button.dataset.season);state.dirty=true;document.querySelectorAll('[data-season]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('#season-follow').setAttribute('aria-pressed','false');}));
  $('#season-follow').addEventListener('click',()=>{state.season=null;state.dirty=true;document.querySelectorAll('[data-season]').forEach(b=>b.setAttribute('aria-pressed','false'));$('#season-follow').setAttribute('aria-pressed','true');});
  $('#redraw').addEventListener('click',()=>{state.strokeCycle++;state.progress=0;state.enteredAt=state.time;state.paused=reduced.matches;state.dirty=true;updateControls();});
  $('#tape-flip').addEventListener('click',()=>flip());$('#flip-tape').addEventListener('click',()=>flip(true));$('#replay').addEventListener('click',()=>go(0));
  addEventListener('keydown',event=>{
    if(event.target.closest('input,dialog'))return;
    if(event.key==='ArrowDown'||event.key==='PageDown'){event.preventDefault();go(state.index+1);}
    if(event.key==='ArrowUp'||event.key==='PageUp'){event.preventDefault();go(state.index-1);}
    if(event.code==='Space'&&!event.target.closest('button')){event.preventDefault();$('#pause').click();}
    if(event.key==='Home'){event.preventDefault();go(0);}
    if(event.key==='End'){event.preventDefault();go(9);}
  });
  document.addEventListener('visibilitychange',()=>{state.hidden=document.hidden;state.last=performance.now();state.dirty=true;frameStats.reset(state.hidden?'Background paused':'Resuming');sound.suspend(state.hidden);});
  reduced.addEventListener('change',event=>{state.paused=event.matches;state.auto=false;state.dirty=true;updateControls();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;frameStats.reset('WebGL context lost');$('#fallback').hidden=false;});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  const hash=location.hash.slice(1),initial=tracks.findIndex(track=>track.id===hash);
  resize();go(initial<0?0:initial,true);readScroll();updateCopy(state.index);updatePreviews(true);
  renderer.setAnimationLoop(tick);
}
try{boot();}catch(error){console.error('Story initialization failed',error);$('#fallback').hidden=false;}
