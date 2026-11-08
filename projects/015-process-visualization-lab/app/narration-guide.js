import {tours,chooseTour} from './narration-script.js';
import {createNarrationSession} from './narration-session.js';
const $=selector=>document.querySelector(selector);
const routeButtons='.brand,.view-switcher a,#open-dynamic,#open-events,#open-archive,#open-lab,#next-topic,[data-scene-route],button[data-topic],button[data-dynamic-kind],button[data-capability-dynamic],button[data-capability-topic],button[data-capability-kind],button[data-capability-archive],#demo-catalog button';
export function narrationInteraction(event,{active,isPlaybackControl=()=>false}={}){
 const target=event.target;
 if(!active||typeof target?.closest!=='function'||target.closest('#narration-dock,#start-narration,#narrate-current'))return 'ignore';
 if(isPlaybackControl(target,event))return 'playback';
 // A select opening or a pressed pointer is not a route change. Let the user inspect it.
 if((event.type==='change'&&target.closest('#observation-event-select'))||
    (event.type==='click'&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&target.closest(routeButtons)))return 'navigate';
 return target.closest('.observatory,#earth-canvas,#earth-view,#observation-details,#story-notes,#story-feature-retry,#about,#sources-panel,#browse-capabilities')?'explore':'ignore';
}
export function setupNarrationGuide({getRoute,getCurrentTour=()=>null,startCurrentByDefault=()=>false,isPlaybackControl=()=>false,onPlaybackChange=()=>{},onExplore=()=>{},onStart=()=>{},onFollowCamera=()=>{},getCaseSequence=()=>null,getCase=()=>null,onChooseCase=()=>{},onBrowse=()=>{},prepare,update,onStop}){
 const dock=$('#narration-dock'),audio=$('#narration-audio');let manifestPromise=null,highlight=null,renderedStep=null,renderedTour=null,opener=null,muted=false,hasAudio=false,mediaToken=0,audioObjectUrl=null,audioFallback='字幕讲解 · 本章暂无语音';
 const finish=$('#narration-finish'),nextGuide=$('#narration-continue'),browse=$('#narration-browse');
 const casePicker=$('#narration-case-picker'),caseSelect=$('#narration-case-select');
 let renderedSequence=null, nextRoute=null;
 const dockSize=typeof ResizeObserver==='function'?new ResizeObserver(()=>{
  if(!dock.hidden)document.body.style.setProperty('--narration-dock-height',dock.offsetHeight+'px');
 }):null;
 dockSize?.observe(dock);
 let locatedRoute=null;
 function audioStatus(message){$('#narration-audio-status').textContent=message;}
 function unavailable(message){hasAudio=false;audioFallback=message;audioStatus(message);}
 function loadManifest(){
  // A successful manifest is shared across chapters. A failed request is not a
  // permanent answer: selecting the chapter again must retry after recovery.
  manifestPromise??=Promise.resolve().then(()=>fetch('assets/narration/manifest.json')).then(response=>{if(!response.ok)throw new Error('Narration manifest unavailable');return response.json();}).then(manifest=>{if(!manifest||typeof manifest.clips!=='object'||manifest.clips===null||Array.isArray(manifest.clips))throw new Error('Invalid narration manifest');return manifest;}).catch(()=>{manifestPromise=null;return null;});
  return manifestPromise;
 }
 function waitForAudio(event,signal,start,timeout,ready){
  if(signal.aborted)return Promise.resolve(false);
  return new Promise(resolve=>{
   const finish=ok=>{clearTimeout(timer);audio.removeEventListener(event,succeed);audio.removeEventListener('error',fail);signal.removeEventListener('abort',fail);resolve(ok);};
   const succeed=()=>{if(!ready||ready())finish(true);},fail=()=>finish(false),timer=setTimeout(fail,timeout);
   audio.addEventListener(event,succeed);audio.addEventListener('error',fail,{once:true});
   signal.addEventListener('abort',fail,{once:true});
   try{start();if(ready)succeed();}catch{fail();}
  });
 }
 const media={
  async load(step,key,index,signal){
   if(renderedTour?.captionsOnly){unavailable('字幕讲解');return 0;}
   const own=++mediaToken;hasAudio=false;audioFallback='正在准备本章语音…';if(signal.aborted)return 0;audioStatus('准备本章语音…');
   const manifest=await loadManifest();if(signal.aborted||own!==mediaToken)return 0;
   if(!manifest){unavailable('语音清单暂未载入 · 字幕继续；重选本章可重试');return 0;}
   const clip=manifest?.clips?.[step.audioId??key+'-'+(step.audioIndex??index)];
   if(!clip||clip.text!==step.text){unavailable('字幕讲解 · 本章暂无匹配语音');return 0;}
   let source=clip.playback?.url??clip.url;
   if(clip.playback||step.cue?.timeUtc!=null||step.cue?.elapsedSeconds!=null){
    // A full local clip remains seekable when static hosting serves WAVs without byte ranges.
    const download=new AbortController(),cancel=()=>download.abort();
    const timer=setTimeout(cancel,8000);
    signal.addEventListener('abort',cancel,{once:true});
    try{
     const response=await fetch(source,{signal:download.signal});
     if(!response.ok)throw new Error('Audio unavailable');
     const wave=await response.blob();
     if(signal.aborted||own!==mediaToken)return 0;
     audioObjectUrl=URL.createObjectURL(clip.playback?wave.slice(0,wave.size,'audio/mpeg'):wave);
     source=audioObjectUrl;
    }catch{
     if(!signal.aborted&&own===mediaToken)unavailable('音频暂不可用 · 字幕继续；重选本章可重试');
     return 0;
    }finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
   }
   const playable=await waitForAudio('canplay',signal,()=>{audio.src=source;audio.load();},8000);
   if(signal.aborted||own!==mediaToken)return 0;
   if(!playable){unavailable('音频暂不可用 · 字幕继续；重选本章可重试');return 0;}
   hasAudio=true;audioStatus(muted?'声音已关闭 · 字幕继续':(manifest.provider==='MiniMax'?'MiniMax 中文语音':'中文语音')+' · 同步字幕');return clip.durationSeconds;
  },
  play(){if(!hasAudio||audio.ended)return;const own=mediaToken;audio.play().catch(error=>{if(own!==mediaToken||error.name==='AbortError')return;unavailable('语音未能播放 · 字幕讲解继续');});},
  async seek(seconds,signal){
   if(!hasAudio||signal.aborted)return;
   const own=mediaToken,target=Math.min(audio.duration,seconds);
   const positioned=()=>!audio.seeking&&Math.abs(audio.currentTime-target)<.08;
   const settled=Number.isFinite(target)&&await waitForAudio('seeked',signal,()=>{audio.currentTime=target;},2000,positioned);
   if(signal.aborted||own!==mediaToken)return;
   if(!settled||!positioned()){audio.pause();unavailable('语音未能定位 · 字幕继续；重选本章可重试');}
  },
  pause(){audio.pause();},
  stop(){
   ++mediaToken;audio.pause();audio.removeAttribute('src');audio.load();hasAudio=false;
   if(audioObjectUrl){URL.revokeObjectURL(audioObjectUrl);audioObjectUrl=null;}
  }
 };
 audio.addEventListener('error',()=>{if(hasAudio)unavailable('音频暂不可用 · 字幕继续；重选本章可重试');});
 function clearHighlight(){highlight?.classList.remove('narration-highlight');highlight=null;}
 function showStep(s){
  if(renderedStep===s.step&&renderedTour===s.tour)return;
  const changedTour=renderedTour!==s.tour;renderedStep=s.step;renderedTour=s.tour;
  $('#narration-title').textContent=s.step.title;$('#narration-text').textContent=s.step.text;
  $('#narration-tour').textContent=s.tour.label;$('#narration-count').textContent=String(s.index+1).padStart(2,'0')+' / '+String(s.tour.steps.length).padStart(2,'0');
  if(changedTour){$('#narration-chapters').replaceChildren(...s.tour.steps.map((step,i)=>{const b=document.createElement('button');b.type='button';b.dataset.chapter=i;b.title=step.title;b.textContent=step.navLabel??String(i+1).padStart(2,'0');b.setAttribute('aria-label','第'+(i+1)+'章：'+step.title);return b;}));}
  for(const b of $('#narration-chapters').children)b.setAttribute('aria-current',Number(b.dataset.chapter)===s.index?'step':'false');
  const chapters=$('#narration-chapters'),current=chapters.children[s.index];
  if(current&&chapters.scrollWidth>chapters.clientWidth){
   const rail=chapters.getBoundingClientRect(),item=current.getBoundingClientRect();
   if(item.left<rail.left||item.right>rail.right)chapters.scrollLeft+=item.left-rail.left;
  }
  clearHighlight();audioStatus('准备本章语音…');$('#narration-status').textContent='正在定位画面与真实时刻…';
 }
 function renderCaseNavigation(s){
  const {sequence,route}=getCaseSequence(s)??{};
  casePicker.hidden=!sequence;
  const position=sequence?.routes.indexOf(route)??-1;
  if(sequence){
   if(renderedSequence!==sequence){
    renderedSequence=sequence;
    $('#narration-case-label').textContent=sequence.label+' · 跳到案例';
    const prompt=document.createElement('option');
    prompt.value='';prompt.textContent='选择案例';prompt.disabled=true;
    caseSelect.replaceChildren(prompt,...sequence.routes.map((target,index)=>{
     const option=document.createElement('option');
     option.value=target;
     option.textContent=String(index+1).padStart(2,'0')+' '+getCase(target).name;
     return option;
    }));
   }
   const selected=sequence.routes[position]??'';
   if(caseSelect.value!==selected)caseSelect.value=selected;
  }
  const ended=s.status==='ended';
  finish.hidden=!ended;
  nextRoute=ended?sequence?.routes[position+1]:null;
  if(!ended)return;
  const currentCase=position>=0?getCase(route):null;
  const nextCase=nextRoute?getCase(nextRoute):null;
  $('#narration-finish-title').textContent=currentCase?currentCase.name+'讲解完毕':'这一段看完了';
  $('#narration-finish-note').textContent=nextCase?nextCase.question:
   sequence?'这是'+sequence.label+'的最后一个案例。可以从列表选一项回看。':'可以回看刚才的画面，也可以挑选其他案例。';
  nextGuide.hidden=!nextCase;
  if(nextCase)nextGuide.textContent='继续：'+nextCase.name+' →';
  browse.textContent='查看'+(sequence?.label??'场景')+'目录 ↓';
  browse.classList.toggle('flow-next',!nextCase);
 }
 function locate(step,{scroll=true}={}){
  clearHighlight();highlight=$(step.targetSelector)||$('#earth-view');
  if(highlight?.tagName==='DETAILS')highlight.open=true;
  highlight?.classList.add('narration-highlight');
  if(!scroll)return;
  const cue=step.cue;
  if(cue?.tideEvidence&&!$('#tide-focus-evidence').hidden){
   $('#observation-stage').scrollIntoView({block:'start',behavior:'instant'});
   return;
  }
  if(innerWidth<=700&&step.targetSelector!=='#sources-panel'&&(cue?.casePrimer||cue?.tideLesson||
     cue?.route?.startsWith('dynamic-')||cue?.route==='typhoon-real')){
   const scene=$('#earth-view').getBoundingClientRect(),timeline=$('.timeline').getBoundingClientRect();
   const trackAbove=timeline.height&&timeline.top<scene.top&&scene.top-timeline.top<155;
   const top=trackAbove?timeline.top:scene.top;
   if(top<10||scene.bottom>dock.getBoundingClientRect().top-8){
    window.scrollTo({top:Math.max(0,scrollY+top-10),behavior:'instant'});
   }
   return;
  }
  // Keep both side panels next to the scene on desktop. On narrow screens the selected panel can sit below the scene.
  if(step.cue?.casePrimer||step.cue?.tideLesson){
   const box=$('#earth-view').getBoundingClientRect();
   if(box.top<12||box.bottom>dock.getBoundingClientRect().top-10)
    window.scrollTo({top:Math.max(0,scrollY+box.top-12),behavior:'instant'});
   return;
  }
  if(step.cue?.terrain&&document.body.dataset.hungaMode){
   const controls=$('.hunga-mode-row').getBoundingClientRect();
   const scene=$('#earth-view').getBoundingClientRect();
   if(controls.top<12||scene.bottom>dock.getBoundingClientRect().top-10)
    window.scrollTo({top:Math.max(0,scrollY+controls.top-12),behavior:'instant'});
   return;
  }
  if(step.navLabel&&/^(typhoon-real|dynamic-quake|dynamic-river)/.test(step.cue?.route)){
   const scene=$('#earth-view').getBoundingClientRect();
   const top=step.cue.route.startsWith('dynamic-river')?Math.min(scene.top,$('.timeline').getBoundingClientRect().top):scene.top;
   window.scrollTo({top:Math.max(0,scrollY+top-14),behavior:'instant'});
   return;
  }
  const tideScene=step.cue?.route==='dynamic-tide-san-francisco'&&step.targetSelector!=='#sources-panel';
  const motionScene=step.targetSelector!=='#sources-panel'&&['dynamic-volcano','dynamic-storm','typhoon-real','dynamic-quake','dynamic-quake-hualien','dynamic-river-big-piney','dynamic-wildfire-dixie'].includes(step.cue?.route);
  if(motionScene){
   const box=$('#earth-view').getBoundingClientRect(),track=$('.timeline').getBoundingClientRect();
   const bottom=dock.getBoundingClientRect().top-10;
   const first=Math.min(box.top,track.top),last=Math.max(box.bottom,track.bottom);
   if(first<12||last>bottom){
    const topPad=Math.max(12,Math.min(96,bottom-(last-first)));
    window.scrollTo({top:Math.max(0,scrollY+first-topPad),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   }
   return;
  }
  const anchor=tideScene?$('#earth-view'):innerWidth>700&&step.targetSelector!=='#sources-panel'?$('.observatory'):highlight;
  const box=anchor?.getBoundingClientRect();const bottom=innerHeight-dock.getBoundingClientRect().height-25;
  const topPad=tideScene&&box?Math.max(14,Math.min(112,bottom-box.height-14)):28;
  if(box&&(box.top<10||box.bottom>bottom))window.scrollTo({top:Math.max(0,scrollY+box.top-topPad),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 const session=createNarrationSession({media,
  async prepare(step,context){
   const ok=await prepare(step,context);
   if(!context.signal.aborted&&ok!==false){
    const route=step.cue?.route??getRoute();
    const namedReplay=/^(typhoon-real|dynamic-quake|dynamic-river|dynamic-wildfire-dixie|dynamic-storm)/.test(route)&&step.navLabel;
    const view=route+(step.cue?.terrain?'/terrain/'+step.cue.terrain+'/'+step.cue.spot:step.cue?.tideLesson?'/'+step.cue.tideLesson:step.cue?.casePrimer?'/lesson':step.cue?.tideEvidence?'/tide-evidence':namedReplay?'/'+step.navLabel:'');
    locate(step,{scroll:!context.seeking&&locatedRoute!==view});locatedRoute=view;
   }
   return ok;
  },update,
  onChange(s){
   dock.hidden=!s.active;document.body.classList.toggle('narration-active',s.active);
   $('#start-narration').setAttribute('aria-expanded',String(s.active));
   onPlaybackChange(s);
   if(!s.active){clearHighlight();renderedStep=null;renderedTour=null;return;}
   showStep(s);dock.dataset.status=s.status;$('#narration-progress').style.width=(s.progress*100)+'%';
   renderCaseNavigation(s);
   const waiting=s.status==='loading'||s.status==='buffering';
   $('.narration-live').textContent=s.status==='playing'?'◉ 讲解播放中':waiting?'◌ 正在定位':s.status==='paused'?'Ⅱ 讲解已暂停':s.status==='ended'?'✓ 讲解已结束':'讲解待重试';
   const pauseLabel=s.status==='playing'?'暂停讲解':waiting&&s.wantedPlaying?'准备好后保持暂停':s.status==='error'?'重试本章':s.status==='ended'?'从头讲解':'继续讲解';
   $('#narration-pause').textContent=s.status==='playing'?'Ⅱ 暂停':waiting?(s.wantedPlaying?'暂停准备':'▶ 准备后继续'):s.status==='paused'?'▶ 继续':pauseLabel;
   $('#narration-pause').setAttribute('aria-label',pauseLabel);
   $('#narration-prev').disabled=s.index===0;$('#narration-next').disabled=s.index===s.tour.steps.length-1;
   $('#narration-status').textContent=s.error||(waiting&&!s.wantedPlaying?'正在定位画面 · 就绪后保持暂停':s.status==='loading'?'正在定位画面与真实时刻…':s.status==='buffering'?'正在载入当前观测 · 语音与画面同步等待':s.status==='paused'?'点「继续」从当前时刻接着听。':s.status==='ended'?'讲解完成，画面可继续操作。':document.body.dataset.narrationCamera==='manual'?'手动看画面 · 讲解和图表继续':'可边听边操作画面、查看图表');
   $('#narration-scene-time').textContent=s.status==='loading'?'定位对应画面…':s.step.cue?.casePrimer||s.step.cue?.tideLesson?'原理示意':s.step.cue?.terrain?'海底测深 · 两期独立测绘':$('#time-value').textContent;
  }
 });
 const interval=setInterval(()=>session.tick(),200);
 function start(current=false,{chapter=0,selection}={}){
  const focused=document.activeElement;
  if(!focused?.closest?.('#narration-dock'))opener=focused;
  if(selection)stop();
  locatedRoute=null;onStart();
  const custom=selection??(current?getCurrentTour():null);
  const tour=custom?.tour??(current?chooseTour(getRoute()):tours.overview);
  const key=custom?.key??Object.keys(tours).find(k=>tours[k]===tour)??'overview';
  session.start(tour,key,chapter);
  $('#narration-pause').focus({preventScroll:true});
 }
 function stop(restoreFocus=false){if(!session.snapshot().active)return;session.stop();onStop();if(restoreFocus)opener?.focus({preventScroll:true});}
 $('#start-narration').addEventListener('click',()=>start(startCurrentByDefault()));$('#narrate-current').addEventListener('click',()=>start(true));
 $('#narration-pause').addEventListener('click',session.toggle);
 nextGuide.addEventListener('click',()=>{if(nextRoute)onChooseCase(nextRoute);});
 caseSelect.addEventListener('change',()=>onChooseCase(caseSelect.value));
 browse.addEventListener('click',onBrowse);
 $('#narration-next').addEventListener('click',()=>session.next());$('#narration-prev').addEventListener('click',()=>session.previous());
 $('#narration-chapters').addEventListener('click',e=>{const b=e.target.closest('[data-chapter]');if(b)session.go(Number(b.dataset.chapter));});
 $('#narration-close').addEventListener('click',()=>stop(true));$('#narration-locate').addEventListener('click',()=>locate(session.snapshot().step));
 $('#narration-follow-camera').addEventListener('click',()=>{const step=session.snapshot().step;if(step){onFollowCamera(step);locate(step);$('#narration-pause').focus({preventScroll:true});}});
 $('#narration-sound').addEventListener('click',()=>{muted=!muted;audio.muted=muted;$('#narration-sound').setAttribute('aria-pressed',String(!muted));$('#narration-sound').textContent=muted?'声音关':'声音开';audioStatus(muted?'声音已关闭 · 字幕继续':hasAudio?'中文语音 · 同步字幕':audioFallback);});
 function handleInteraction(event){
  if(event.type==='keydown'&&event.key==='Escape'){
   if(!event.target?.closest?.('select')&&!document.querySelector('dialog[open]'))stop(true);
   return;
  }
  const action=narrationInteraction(event,{active:session.snapshot().active,isPlaybackControl});
  if(action==='navigate')stop();
  else if(action==='explore')onExplore(event);
 }
 for(const type of ['pointerdown','wheel','keydown','click','input','change'])document.addEventListener(type,handleInteraction,{capture:true,passive:type==='wheel'});
 window.addEventListener('hashchange',()=>stop());
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&session.snapshot().active)session.pause();});
 window.addEventListener('pagehide',()=>{stop();clearInterval(interval);dockSize?.disconnect();});
 return {stop,start,session,toggle:session.toggle,seek:session.seek};
}
