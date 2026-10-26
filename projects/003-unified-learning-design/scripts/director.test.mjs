import test from 'node:test';
import assert from 'node:assert/strict';
import {BookDirector} from '../app/replica-director.js';
import {tourSteps} from '../app/replica-script.js';

class Element {
  constructor(id){this.id=id;this.hidden=false;this.dataset={};this.attrs={};this.textContent='';this.choices=[];}
  set innerHTML(value){this.html=value;this.choices=[...value.matchAll(/data-choice="(\d+)"/g)].map(m=>{const e=new Element('choice');e.dataset.choice=m[1];return e;});}
  get innerHTML(){return this.html||'';}
  setAttribute(key,value){this.attrs[key]=String(value);}
  querySelector(selector){if(selector.startsWith('#'))return document.elements.get(selector.slice(1))||null;const m=selector.match(/data-choice="(\d+)"/);return m?this.choices.find(e=>e.dataset.choice===m[1])||null:null;}
  querySelectorAll(selector){return selector==='[data-choice]'?this.choices:[];}
  focus(){document.activeElement=this;}
}
class Audio extends Element {
  constructor(){super('narration');this.currentTime=0;this.paused=true;this.playCalls=0;}
  play(){this.paused=false;this.playCalls++;return Promise.resolve();}
  pause(){this.paused=true;}
  finish(){this.paused=true;this.onended?.();}
}
function harness({chapter=2,navigate=async()=>{}}={}){
  const ids=['director','guide-start','guide-explore','guide-exit','guide-pause','guide-replay','guide-next','guide-back','guide-mute','guide-intro','guide-story','guide-title','guide-subtitle','guide-count','guide-progress','guide-status','guide-balance','guide-question','guide-feedback','guide-cue','guide-fulltext','guide-details','watch'];
  const elements=new Map(ids.map(id=>[id,new Element(id)])),audio=new Audio();elements.set('narration',audio);
  globalThis.document={hidden:false,elements,body:new Element('body'),activeElement:null,querySelector:s=>elements.get(s.slice(1))||null};
  const state={potential:5.45,kinetic:0,thermal:0,elastic:.2268,total:5.45,initial:5.45,time:0,crossedBottom:false,atApex:false,phase:'rail'};
  const actions=[],shots=[],targets=[];
  const api={chapter:()=>chapter,snapshot:()=>({...state}),navigate,perform:name=>{actions.push(name);if(name==='spring-challenge-small')state.elastic=.2268;if(name==='spring-challenge-large')state.elastic=.9072;},shot:shot=>shots.push(shot),highlight:target=>targets.push(target),checkpoint:()=>{},layout:()=>{},resumeView:()=>shots.push('resume'),beforeStep:()=>{},endInspection:()=>{},syncPlayback:()=>{}};
  const director=new BookDirector(api);return {director,audio,state,actions,shots,targets,elements};
}
const index=id=>tourSteps.findIndex(step=>step.id===id);

test('pause requested during navigation survives completion and prevents background narration',async()=>{
  let resolve;const waiting=new Promise(r=>resolve=r);
  const h=harness({chapter:1,navigate:()=>waiting});
  const start=h.director.start();assert.equal(h.director.loading,true);
  h.director.setPaused(true);resolve();await start;
  assert.equal(h.director.paused,true);assert.equal(h.director.loading,false);assert.equal(h.audio.playCalls,0);
  h.director.setPaused(false);assert.equal(h.audio.playCalls,1);assert.equal(h.audio.paused,false);
  h.director.stop();
});

test('a hidden page cannot start its audio after navigation',async()=>{
  let resolve;const waiting=new Promise(r=>resolve=r);const h=harness({navigate:()=>waiting});
  const start=h.director.start(true);document.hidden=true;resolve();await start;
  assert.equal(h.director.paused,true);assert.equal(h.audio.playCalls,0);
  h.director.stop();
});

test('stopping during navigation cancels the incoming action and voice',async()=>{
  let resolve,isCurrent;const waiting=new Promise(r=>resolve=r);const h=harness({navigate:(_chapter,current)=>{isCurrent=current;return waiting;}});
  const start=h.director.start(true);assert.equal(isCurrent(),true);
  h.director.stop();assert.equal(isCurrent(),false,'the app must be able to cancel navigation after an earlier page turn');resolve();await start;
  assert.deepEqual(h.actions,[]);assert.equal(h.audio.playCalls,0);assert.equal(h.director.active,false);
});

test('prediction is required, then a physical event gates the blue-bottle explanation',async()=>{
  const h=harness();await h.director.start(true);
  assert.equal(h.director.step.id,'ramp-ready');assert.equal(h.director.ready,false);
  h.director.next();assert.equal(h.director.step.id,'ramp-ready');
  h.director.selectChoice(1);assert.equal(h.director.ready,true);await h.director.next();
  assert.equal(h.actions.at(-1),'ramp-release-clean');assert.equal(h.director.step.id,'ramp-bottom');
  h.audio.finish();h.director.update(.1);assert.equal(h.director.cueIndex,0,'audio end alone must not pretend the ball reached the bottom');
  h.state.crossedBottom=true;h.state.kinetic=5.45;h.state.potential=0;h.director.update(.1);
  assert.equal(h.director.holdPhysics,true);assert.equal(h.director.cueIndex,1);
  assert.equal(h.targets.at(-1),'kinetic');assert.equal(h.shots.at(-1),'ramp-energy');
  assert.match(h.elements.get('guide-feedback').textContent,/完全静止.*实际观察到/);
  h.director.stop();
});

test('rewinding from loss asks for a complete clean release, preserving the prediction',async()=>{
  const h=harness();await h.director.start(true);h.director.selectChoice(0);
  await h.director.enter(index('ramp-loss'));assert.equal(h.actions.at(-1),'ramp-loss');
  await h.director.enter(index('ramp-bottom'));assert.equal(h.actions.at(-1),'ramp-release-clean');
  assert.equal(h.director.answers['ramp-ready'],0);assert.equal(h.director.cueIndex,0);
  h.director.stop();
});

test('paused cue does not auto advance; missing voice still permits complete manual reading',async()=>{
  const h=harness();await h.director.start(true);h.director.selectChoice(0);await h.director.next();
  h.director.setPaused(true);h.audio.finish();h.state.crossedBottom=true;h.director.update(.2);
  assert.equal(h.director.cueIndex,0);assert.equal(h.director.checkpointMet,false);
  h.director.setPaused(false);h.director.update(.2);assert.equal(h.director.cueIndex,1);
  h.audio.onerror();h.director.update(.2);assert.equal(h.director.cueIndex,1,'failure must not skip the explanation');
  h.director.next();assert.equal(h.director.cueIndex,2);assert.equal(h.targets.at(-1),'total');
  h.audio.onerror();h.director.next();await Promise.resolve();assert.equal(h.director.step.id,'ramp-loss');
  h.director.stop();
});

test('final challenge changes the actual apparatus and explains the observed energy ratio',async()=>{
  const h=harness({chapter:3});h.director.active=h.director.visible=true;await h.director.enter(index('outro'));
  assert.equal(h.actions.at(-1),'spring-challenge-small');assert.equal(h.director.ready,false);
  h.director.selectChoice(0);assert.equal(h.actions.at(-1),'spring-challenge-large');assert.equal(h.director.ready,true);
  assert.match(h.elements.get('guide-feedback').textContent,/0\.23 → 0\.91 J.*4 倍/);
  await h.director.enter(index('outro'));assert.equal(h.director.ready,false,'replay restores a new prediction and the smaller compression');
  assert.equal(h.actions.at(-1),'spring-challenge-small');h.director.stop();
});

test('a delayed play promise from an old cue cannot pause the current cue',async()=>{
  const h=harness(),pending=[];h.audio.play=function(){this.paused=false;this.playCalls++;return new Promise(resolve=>pending.push(resolve));};
  await h.director.start(true);assert.equal(pending.length,1);
  h.director.selectChoice(0);await h.director.next();assert.equal(pending.length,2);assert.equal(h.audio.paused,false);
  pending[0]();await Promise.resolve();await Promise.resolve();
  assert.equal(h.audio.paused,false,'stale completion must not affect the new audio');
  pending[1]();await Promise.resolve();h.director.stop();
});
