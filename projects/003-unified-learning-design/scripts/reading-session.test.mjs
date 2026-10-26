import test from 'node:test';
import assert from 'node:assert/strict';
import {ReadingSession} from '../app/replica-reading-session.js';

function harness({paused=false}={}){
  const state={chapter:2,cue:'ramp-bottom-2',camera:[4,6,8],scenePaused:paused,audioPaused:paused,audioTime:3.25};
  const calls={capture:0,pause:0,release:0,restore:0};
  const session=new ReadingSession({
    capture:()=>{calls.capture++;return {...state,camera:[...state.camera]};},
    pause:()=>{calls.pause++;state.scenePaused=state.audioPaused=true;},
    release:context=>{calls.release++;state.scenePaused=context.scenePaused;},
    restore:context=>{calls.restore++;state.camera=[...context.camera];state.audioPaused=context.audioPaused;state.audioTime=context.audioTime;},
    isCurrent:context=>context.chapter===state.chapter&&context.cue===state.cue
  });
  return {state,calls,session};
}

test('paragraph navigation retains the initial camera and playback snapshot',()=>{
  const h=harness(),snapshot=h.session.begin();
  assert.equal(h.state.scenePaused,true);assert.equal(h.state.audioPaused,true);
  h.state.camera=[1,3,5];
  assert.equal(h.session.begin(),snapshot,'a new paragraph must not overwrite the return position');
  assert.deepEqual(h.calls,{capture:1,pause:1,release:0,restore:0});
  assert.deepEqual(snapshot.camera,[4,6,8]);
  assert.equal(h.session.finish({restore:true}),true);
  assert.deepEqual(h.state.camera,[4,6,8]);
  assert.equal(h.state.audioTime,3.25);assert.equal(h.state.audioPaused,false);
  assert.equal(h.state.scenePaused,false);assert.equal(h.session.context,null);
});

test('cancelling reading releases the scene pause without restoring a camera or playing audio',()=>{
  const h=harness();h.session.begin();h.state.camera=[9,9,9];
  assert.equal(h.session.finish(),false);
  assert.equal(h.state.scenePaused,false);assert.equal(h.state.audioPaused,true);
  assert.deepEqual(h.state.camera,[9,9,9]);
  assert.equal(h.calls.release,1);assert.equal(h.calls.restore,0);
});

test('a changed chapter or cue cannot restore the previous reading context',()=>{
  for(const change of [{chapter:3},{cue:'ramp-loss-1'}]){
    const h=harness();h.session.begin();Object.assign(h.state,change);h.state.camera=[7,7,7];
    assert.equal(h.session.finish({restore:true}),false);
    assert.equal(h.state.scenePaused,false);assert.equal(h.state.audioPaused,true);
    assert.deepEqual(h.state.camera,[7,7,7]);assert.equal(h.calls.restore,0);
  }
});

test('release and restore hooks may finish again without a second release or restore',()=>{
  let session,releaseCalls=0,restoreCalls=0;
  session=new ReadingSession({
    capture:()=>({chapter:2}),
    release:()=>{releaseCalls++;assert.equal(session.active,false);assert.equal(session.context,null);assert.equal(session.finish({restore:true}),false);},
    restore:()=>{restoreCalls++;assert.equal(session.finish({restore:true}),false);}
  });
  session.begin();assert.equal(session.finish({restore:true}),true);
  assert.equal(releaseCalls,1);assert.equal(restoreCalls,1);
  assert.equal(session.finish(),false);
});

test('returning to a previously paused experiment preserves its pause state',()=>{
  const h=harness({paused:true});h.session.begin();
  assert.equal(h.session.finish({restore:true}),true);
  assert.equal(h.state.scenePaused,true);assert.equal(h.state.audioPaused,true);
  assert.equal(h.state.audioTime,3.25);
});

test('finishing without a visit does not capture, release or restore anything',()=>{
  const h=harness();assert.equal(h.session.finish({restore:true}),false);
  assert.equal(h.session.active,false);assert.equal(h.session.context,null);
  assert.deepEqual(h.calls,{capture:0,pause:0,release:0,restore:0});
});
