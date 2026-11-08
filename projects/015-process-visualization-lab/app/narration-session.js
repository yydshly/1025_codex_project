// One owner for chapter, media and scene timing. Async results cannot revive an exited tour.
export function createNarrationSession({prepare,update,media,onChange=()=>{},now=()=>performance.now()}){
 let tour=null,key='',index=0,status='idle',elapsed=0,duration=0,base=0,token=0,abort=null,busy=false,wantedPlaying=true,error='',queuedSeek=null;
 const active=()=>status!=='idle';
 const clock=()=>status==='playing'?Math.min(duration,elapsed+Math.max(0,now()-base)/1000):elapsed;
 const snapshot=()=>({active:active(),key,index,status,wantedPlaying,elapsed:clock(),duration,progress:duration?clock()/duration:0,error,tour,step:tour?.steps[index]??null});
 const emit=()=>onChange(snapshot());
 const boundedChapter=next=>Math.max(0,Math.min(tour.steps.length-1,next));
 function playWhenReady(){
  status=wantedPlaying?'playing':'paused';
  base=now();
  if(wantedPlaying)media.play();
  emit();
 }
 async function go(next,{play=wantedPlaying,progress=null}={}){
  if(!tour?.steps.length)return false;
  const current=++token;abort?.abort();abort=new AbortController();const signal=abort.signal;
  media.stop();index=boundedChapter(next);status='loading';elapsed=0;duration=0;busy=false;error='';wantedPlaying=play;queuedSeek=progress;emit();
  try{
   const step=tour.steps[index];
   if(await prepare(step,{signal,progress:progress??0,seeking:progress!==null})===false)throw new Error('观测画面未就绪，请重试本章。');
   if(current!==token)return false;
   const seconds=await media.load(step,key,index,signal);
   if(current!==token)return false;
   duration=Math.max(12,Number(seconds)||Math.min(35,step.text.length/4.2))+1.2;
   // While the clip is loading, repeated drags within this chapter coalesce to the latest position.
   while(queuedSeek!==null){
    const target=queuedSeek;queuedSeek=null;
    if(await update(step,target,{signal})===false)throw new Error('无法定位到这个观测时刻，请重试。');
    if(current!==token)return false;
    elapsed=duration*target;
    await media.seek?.(elapsed,signal);
    if(current!==token)return false;
   }
   playWhenReady();return true;
  }catch(e){if(current!==token)return false;status='error';error=e.message||'本章暂时无法载入';media.stop();emit();return false;}
 }
 async function seek(chapter,progress,{play=false}={}){
  if(!active()||!tour?.steps.length||!Number.isFinite(chapter)||!Number.isFinite(progress))return false;
  const next=boundedChapter(Math.trunc(chapter)),target=Math.max(0,Math.min(1,progress));
  if(next!==index||status==='error'||status==='ended')return go(next,{play,progress:target});
  wantedPlaying=play;
  if(status==='loading'){queuedSeek=target;emit();return true;}

  elapsed=clock();status='buffering';busy=true;media.pause();
  const current=++token;abort?.abort();abort=new AbortController();const signal=abort.signal;
  emit();
  try{
   if(await update(tour.steps[index],target,{signal})===false)throw new Error('无法定位到这个观测时刻，请重试。');
   if(current!==token)return false;
   elapsed=duration*target;
   await media.seek?.(elapsed,signal);
   if(current!==token)return false;
   playWhenReady();return true;
  }catch(e){if(current===token){status='error';error=e.message;emit();}return false;}
  finally{if(current===token)busy=false;}
 }
 async function tick(){
  if(status!=='playing'||busy)return;
  const current=token,progress=Math.min(1,clock()/duration);busy=true;
  try{
   const result=update(tour.steps[index],progress,{signal:abort.signal});
   // Freeze narration while a real frame transaction is in flight; cached/no-op updates stay synchronous.
   if(result&&typeof result.then==='function'){elapsed=clock();status='buffering';media.pause();emit();}
   if(await result===false)throw new Error('这一帧未能载入，讲解已暂停；可重试本章。');
   if(current!==token)return;
   if(status==='buffering'){status=wantedPlaying?'playing':'paused';base=now();if(wantedPlaying)media.play();}
   emit();if(progress>=1&&status==='playing'){
    if(index+1<tour.steps.length)await go(index+1);
    else{elapsed=duration;status='ended';media.stop();emit();}
   }
  }catch(e){if(current===token){elapsed=clock();status='error';error=e.message;media.pause();emit();}}
  finally{if(current===token)busy=false;}
 }
 function pause(){wantedPlaying=false;if(status==='playing'){elapsed=clock();status='paused';media.pause();}emit();}
 function holdForExploration(){
  // On routes without a narrated time map, a user's frame request supersedes
  // a buffering frame. Keep the chapter and timestamp for an explicit resume.
  if(status!=='buffering'){pause();return;}
  ++token;abort?.abort();abort=new AbortController();busy=false;status='paused';wantedPlaying=false;media.pause();emit();
 }
 function resume(){if(status==='ended')return go(0,{play:true});if(status==='error')return go(index,{play:true});wantedPlaying=true;if(status==='paused'){base=now();status='playing';media.play();}emit();}
 function toggle(){
  if(!active())return;
  if(status==='playing'||((status==='loading'||status==='buffering')&&wantedPlaying))pause();
  else return resume();
 }
 function stop(){++token;abort?.abort();media.stop();status='idle';busy=false;queuedSeek=null;emit();}
 return {
  start(nextTour,nextKey,startIndex=0,{play=true,progress=null}={}){
   tour=nextTour;key=nextKey;
   return go(startIndex,{play,progress});
  },
  go,seek,tick,pause,holdForExploration,resume,toggle,stop,next(){return go(index+1);},previous(){return go(index-1);},snapshot,
 };
}
