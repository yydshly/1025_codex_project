import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createNarrationSession} from '../app/narration-session.js';

const settle=async()=>{for(let i=0;i<40;i++)await Promise.resolve();};
const tour={label:'测试真实事件讲解',steps:[0,1].map(index=>({title:'章节'+index,text:'本章已核对的观测说明'+index,targetSelector:'#earth-view'}))};
const manifest={provider:'MiniMax',clips:Object.fromEntries(tour.steps.map((step,index)=>['overview-'+index,{text:step.text,url:'assets/narration/test-'+index+'.wav',durationSeconds:15}]))};
const response=value=>({ok:true,json:async()=>value});
const deferred=()=>{let resolve;const promise=new Promise(yes=>resolve=yes);return{promise,resolve};};

class Element{
 constructor(tag='DIV'){
  this.tagName=tag;this.dataset={};this.style={};this.children=[];this.attributes=new Map();this.handlers=new Map();this.textContent='';this.hidden=false;
  const classes=new Set();this.classList={add:value=>classes.add(value),remove:value=>classes.delete(value),contains:value=>classes.has(value),toggle(value,on){if(on)classes.add(value);else classes.delete(value);}};
 }
 addEventListener(type,callback,options={}){if(!this.handlers.has(type))this.handlers.set(type,[]);this.handlers.get(type).push({callback,once:options.once});}
 removeEventListener(type,callback){this.handlers.set(type,(this.handlers.get(type)||[]).filter(item=>item.callback!==callback));}
 emit(type,event={}){for(const item of [...(this.handlers.get(type)||[])]){if(item.once)this.removeEventListener(type,item.callback);item.callback(event);}}
 setAttribute(name,value){this.attributes.set(name,String(value));}
 removeAttribute(name){this.attributes.delete(name);if(name==='src')this.src='';}
 replaceChildren(...items){this.children=items;}
 getBoundingClientRect(){return{top:20,bottom:40,height:20};}
 focus(){}
}

function harness(replies,options={}){
 const nodes=new Map(),node=selector=>{if(!nodes.has(selector))nodes.set(selector,new Element());return nodes.get(selector);};
 const audio=node('#narration-audio');audio.playCount=0;audio.loadCount=0;audio.outcome='ready';audio.pause=()=>{};audio.play=()=>{audio.playCount++;return Promise.resolve();};
 audio.load=()=>{if(!audio.src)return;audio.loadCount++;queueMicrotask(()=>audio.emit(audio.outcome==='ready'?'canplay':'error'));};
 const fetchCalls=[],objectUrls=[],releasedUrls=[],documentHandlers=new Map(),document={querySelector:node,body:node('body'),activeElement:node('opener'),createElement:tag=>new Element(tag.toUpperCase()),addEventListener(type,callback){documentHandlers.set(type,callback);}};
 const context=vm.createContext({
  tours:{overview:tour},chooseTour:()=>tour,createNarrationSession:options=>createNarrationSession({...options,now:()=>0}),document,
  fetch:async url=>{fetchCalls.push(url);const next=replies.shift();if(next instanceof Error)throw next;return await next;},
  URL:{createObjectURL(value){objectUrls.push(value);return 'blob:clip-'+objectUrls.length;},revokeObjectURL(url){releasedUrls.push(url);}},
  Promise,Array,Error,AbortController,queueMicrotask,setTimeout,clearTimeout,setInterval:()=>1,clearInterval(){},
  innerWidth:1440,innerHeight:1000,scrollY:0,matchMedia:()=>({matches:true}),window:{scrollTo(){},addEventListener(){}}
 });
 const source=fs.readFileSync(new URL('../app/narration-guide.js',import.meta.url),'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export (?=function )/gm,'');
 vm.runInContext(source,context,{filename:'actual-narration-guide.js'});
 const guide=context.setupNarrationGuide({getRoute:()=> 'overview',prepare:async()=>true,update:()=>true,onStop(){},...options});
 function documentEvent(type, selectors, extra={}){
  const path=Array.isArray(selectors)?selectors:[selectors];
  const target={
   closest(query){
    const match=query.split(',').map(part=>part.trim()).find(part=>path.includes(part));
    return match?node(match):null;
   },
  };
  documentHandlers.get(type)?.({type,target,...extra});
 }
 return{guide,node,audio,fetchCalls,objectUrls,releasedUrls,documentEvent};
}

test('temporary manifest failure uses a recoverable subtitle state; reselecting the chapter retries and restores MiniMax',async()=>{
 const h=harness([new Error('network unavailable'),response(manifest)]);
 h.guide.start();await settle();
 assert.equal(h.guide.session.snapshot().status,'playing');
 assert.equal(h.fetchCalls.length,1);assert.equal(h.audio.playCount,0);
 assert.match(h.node('#narration-audio-status').textContent,/清单暂未载入.*重选本章可重试/);
 h.node('#narration-sound').emit('click');h.node('#narration-sound').emit('click');
 assert.match(h.node('#narration-audio-status').textContent,/清单暂未载入/,'sound toggles must not relabel a failed request as a missing clip');
 assert.equal(await h.guide.session.go(0),true);
 assert.equal(h.fetchCalls.length,2);assert.equal(h.audio.playCount,1);assert.equal(h.audio.src,manifest.clips['overview-0'].url);
 assert.match(h.node('#narration-audio-status').textContent,/MiniMax 中文语音/);
});

test('HTTP errors, unreadable JSON and malformed manifests are retried rather than cached as permanent absence',async()=>{
 for(const failure of [{ok:false,json:async()=>manifest},{ok:true,json:async()=>{throw new SyntaxError('broken JSON');}},response({clips:[]})]){
  const h=harness([failure,response(manifest)]);h.guide.start();await settle();
  assert.match(h.node('#narration-audio-status').textContent,/清单暂未载入/);assert.equal(h.audio.playCount,0);
  assert.equal(await h.guide.session.go(0),true);assert.equal(h.fetchCalls.length,2);assert.equal(h.audio.playCount,1);
 }
});

test('a valid manifest is reused across chapters and restarts without refetching',async()=>{
 const h=harness([response(manifest)]);h.guide.start();await settle();
 assert.equal(await h.guide.session.next(),true);assert.equal(h.audio.src,manifest.clips['overview-1'].url);
 h.guide.stop();h.guide.start();await settle();
 assert.equal(h.fetchCalls.length,1);assert.equal(h.audio.src,manifest.clips['overview-0'].url);assert.equal(h.audio.playCount,3);
});

test('a valid manifest with a missing or mismatched clip stays in subtitle mode without retrying the successful manifest',async()=>{
 for(const clips of [{},{'overview-0':{...manifest.clips['overview-0'],text:'an older script'}}]){
  const h=harness([response({provider:'MiniMax',clips})]);h.guide.start();await settle();
  assert.equal(h.guide.session.snapshot().status,'playing');assert.equal(h.audio.playCount,0);
  assert.match(h.node('#narration-audio-status').textContent,/本章暂无匹配语音/);
  assert.doesNotMatch(h.node('#narration-audio-status').textContent,/清单暂未载入/);
  await h.guide.session.go(0);assert.equal(h.fetchCalls.length,1);assert.equal(h.audio.loadCount,0);
 }
});

test('an unavailable clip can be retried from its chapter while keeping the successful manifest cached',async()=>{
 const h=harness([response(manifest)]);h.audio.outcome='error';h.guide.start();await settle();
 assert.match(h.node('#narration-audio-status').textContent,/音频暂不可用.*重选本章可重试/);assert.equal(h.audio.playCount,0);
 h.audio.outcome='ready';await h.guide.session.go(0);
 assert.equal(h.fetchCalls.length,1);assert.equal(h.audio.loadCount,2);assert.equal(h.audio.playCount,1);
});

test('a late shared manifest cannot revive a stopped chapter or replace the current chapter audio',async()=>{
 const wait=deferred(),h=harness([wait.promise]);h.guide.start();await settle();
 const next=h.guide.session.next();await settle();wait.resolve(response(manifest));
 assert.equal(await next,true);await settle();
 assert.equal(h.fetchCalls.length,1);assert.equal(h.audio.playCount,1);assert.equal(h.audio.src,manifest.clips['overview-1'].url);
 const stopped=deferred(),other=harness([stopped.promise]);other.guide.start();await settle();other.guide.stop();
 stopped.resolve(response(manifest));await settle();assert.equal(other.guide.session.snapshot().status,'idle');assert.equal(other.audio.playCount,0);assert.equal(other.audio.loadCount,0);
});

test('retrying a derived contour keeps narration running for both pointer and keyboard activation',async()=>{
 const h=harness([response(manifest)]);h.guide.start();await settle();
 h.documentEvent('pointerdown','#story-feature-retry');
 h.documentEvent('keydown','#story-feature-retry',{key:'Enter'});
 assert.equal(h.guide.session.snapshot().status,'playing');assert.equal(h.audio.playCount,1);
});

test('camera gestures, harbor labels and evidence controls keep the current chapter playing',async()=>{
 const cameraInputs=[];
 const h=harness([response(manifest)],{onExplore:event=>{
  if(event.target.closest('#earth-canvas'))cameraInputs.push(event.type);
 }});
 h.guide.start();await settle();
 const actions=[
  ['pointerdown',['canvas','#earth-canvas','#earth-view']],
  ['wheel',['canvas','#earth-canvas','#earth-view'],{deltaY:160}],
  ['click',['button','#dynamic-full','#dynamic-view-tools','#earth-view']],
  ['pointerdown',['button','.harbor-waterfront-label','#earth-view']],
  ['click',['button','.harbor-waterfront-label','#earth-view']],
  ['keydown',['button','#observation-details'],{key:'Enter'}],
  ['click',['button','#observation-details']],
  ['click',['summary','#story-notes']],
 ];
 for(const [type,path,extra] of actions){
  h.documentEvent(type,[...path,'[data-dynamic-kind]'],extra);
  assert.equal(h.guide.session.snapshot().status,'playing',path.join(' '));
 }
 assert.equal(h.guide.session.snapshot().index,0);
 assert.equal(h.audio.playCount,1,'viewing controls do not restart the voice clip');
 assert.deepEqual(cameraInputs,['pointerdown','wheel'],'camera input reaches the manual view handler');
});

test('the old guide ends when the user switches the event or activates another scene',async()=>{
 const h=harness([response(manifest)]);
 h.guide.start();await settle();
 const picker=['select','#observation-event-select'];
 h.documentEvent('pointerdown',picker);
 h.documentEvent('keydown',picker,{key:'ArrowDown'});
 assert.equal(h.guide.session.snapshot().status,'playing','opening the event picker keeps narration alive');
 h.documentEvent('change',picker);
 assert.equal(h.guide.session.snapshot().status,'idle');

 h.guide.start();await settle();
 const tab=['strong','button','#open-events'];
 h.documentEvent('pointerdown',tab);
 assert.equal(h.guide.session.snapshot().status,'playing','touching a navigation control does not activate it');
 h.documentEvent('click',tab);
 assert.equal(h.guide.session.snapshot().status,'idle');
});

test('registered scene playback controls keep the guide open and seek its loaded audio',async()=>{
 const exploration=[];
 const h=harness([response(manifest)],{
  isPlaybackControl:target=>Boolean(target.closest('#play,#timeline')),
  onExplore:event=>exploration.push(event.type),
 });
 h.audio.duration=15;
 h.guide.start();await settle();
 h.documentEvent('pointerdown','#play');
 h.documentEvent('keydown','#play',{key:' '});
 h.guide.toggle();
 assert.equal(h.guide.session.snapshot().status,'paused');
 h.documentEvent('pointerdown','#timeline');
 h.documentEvent('keydown','#timeline',{key:'ArrowRight'});
 h.documentEvent('input','#timeline');
 assert.equal(await h.guide.seek(0,.5),true);
 assert.equal(h.guide.session.snapshot().progress,.5);
 assert.equal(h.audio.currentTime,8.1);
 h.guide.toggle();
 assert.equal(h.guide.session.snapshot().status,'playing');
 assert.equal(h.guide.session.snapshot().active,true);
 assert.deepEqual(exploration,[],'transport input does not take over the camera');
});

test('Recorded narration waits for the downloaded WAV to reach the new position before resuming',async()=>{
 const timedTour={...tour,steps:tour.steps.map(step=>({...step,cue:{route:'typhoon-real',timeUtc:'2018-09-16T00:00:00Z',endTimeUtc:'2018-09-16T04:00:00Z'}}))};
 const wave=new Blob(['wave bytes'],{type:'audio/wav'});
 const h=harness([response(manifest),{ok:true,blob:async()=>wave}],{getCurrentTour:()=>({key:'overview',tour:timedTour})});
 h.audio.duration=15;
 let target=0,actual=0;
 Object.defineProperty(h.audio,'currentTime',{get:()=>actual,set(value){target=value;h.audio.seeking=true;}});
 h.guide.start(true);await settle();
 assert.deepEqual(h.objectUrls,[wave]);
 assert.equal(h.audio.src,'blob:clip-1');
 const seeking=h.guide.seek(0,.5);await settle();
 h.guide.toggle();
 assert.equal(h.guide.session.snapshot().status,'buffering');
 assert.equal(h.audio.playCount,1);
 assert.equal(target,8.1);
 actual=target;h.audio.seeking=false;h.audio.emit('seeked');
 assert.equal(await seeking,true);
 assert.equal(h.guide.session.snapshot().status,'playing');
 assert.equal(h.audio.playCount,2);
 h.guide.stop();
 assert.deepEqual(h.releasedUrls,['blob:clip-1']);
});
