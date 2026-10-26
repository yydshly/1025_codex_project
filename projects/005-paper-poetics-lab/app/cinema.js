import './cinema.css';

const $=selector=>document.querySelector(selector);
const shell=$('#cinema-shell'),video=$('#cinema-video'),poster=$('#cinema-poster');
const playButton=$('#cinema-play'),replayButton=$('#cinema-replay'),startButton=$('#cinema-start');
const soundButton=$('#cinema-sound'),fillButton=$('#cinema-fill'),fullscreenButton=$('#cinema-fullscreen');
const progress=$('#cinema-progress'),timeOutput=$('#cinema-time'),status=$('#cinema-status');
const caption=$('#cinema-caption'),notes=$('#cinema-notes'),captionToggle=$('#cinema-captions-toggle');
const announcement=$('#cinema-announcement'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const source=video.dataset.src?new URL(video.dataset.src,document.baseURI).href:null;
const sourceStatus=video.dataset.status||'pending',mediaReady=sourceStatus==='ready';
const cues=video.dataset.cues==='rain-study'?[
  {start:4,end:7,text:'灯火，隔着一场雨。'},
  {start:9,end:12,text:'这一刻，只听雨。'},
]:[
  {start:4,end:7,text:'雨，留在窗外。'},
  {start:9,end:12,text:'这一盏，还是温的。'},
];
let state='loading',captionEnabled=true,currentCue=-1,hideTimer=0,frame=0,dragging=false,keyboardMode=false,pendingPlay=null,waitingTimer=0;
const duration=()=>Number.isFinite(video.duration)&&video.duration>0?video.duration:0;
const formatTime=value=>{const seconds=Math.max(0,Math.floor(Number(value)||0));return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;};
function announce(message){announcement.textContent=message;}
function setStatus(message){if(status.textContent!==message)status.textContent=message;}
function setState(next,message=''){
  state=next;shell.dataset.state=next;
  const playing=(next==='playing'||next==='buffering')&&!video.paused;
  playButton.textContent=playing?'暂停':next==='error'?'重试播放':'播放';
  playButton.setAttribute('aria-label',playing?'暂停影片':next==='error'?'重新载入并播放影片':'播放影片');
  if(message)setStatus(message);
  if(!playing)showChrome(false);
}
function updateCaption(){
  const length=duration(),time=video.currentTime;
  const index=captionEnabled&&!video.ended&&length>1&&time<length-1&&state!=='error'&&state!=='pending'?cues.findIndex(cue=>time>=cue.start&&time<cue.end):-1;
  caption.setAttribute('aria-hidden',String(index<0));
  if(index===currentCue)return;
  currentCue=index;
  if(index>=0){caption.textContent=cues[index].text;caption.classList.add('is-visible');}
  else caption.classList.remove('is-visible');
}
function updateClock(){
  const length=duration(),position=length?Math.min(1,Math.max(0,video.currentTime/length)):0;
  if(!dragging)progress.value=String(Math.round(position*1000));
  progress.disabled=!mediaReady||!length;
  soundButton.disabled=!mediaReady||!length||state==='error';
  timeOutput.value=`${formatTime(video.currentTime)} / ${length?formatTime(length):'—:—'}`;
  progress.setAttribute('aria-valuetext',length?`${formatTime(video.currentTime)}，共 ${formatTime(length)}`:'影片尚未载入');
  shell.dataset.time=String(Number(video.currentTime.toFixed(2)));
  updateCaption();
}
function tick(){updateClock();if(!video.paused&&!video.ended&&!document.hidden)frame=requestAnimationFrame(tick);}
function stopClock(){cancelAnimationFrame(frame);frame=0;}
function hideChrome(){
  if(video.paused||video.ended||state!=='playing'||dragging||notes.open)return;
  if(keyboardMode&&shell.contains(document.activeElement)&&document.activeElement.closest('a,button,input,summary'))return;
  shell.dataset.chrome='hidden';
}
function showChrome(schedule=true){
  clearTimeout(hideTimer);shell.dataset.chrome='visible';
  if(schedule&&state==='playing'&&!video.paused)hideTimer=setTimeout(hideChrome,1000);
}
function updateSound(){
  const active=!video.muted;soundButton.textContent=active?'声音 开':'声音 关';
  soundButton.setAttribute('aria-pressed',String(active));soundButton.setAttribute('aria-label',active?'关闭影片声音':'开启影片声音');
  shell.dataset.muted=String(video.muted);
}
function mediaFailed(){
  if(state==='error')return;
  stopClock();clearTimeout(waitingTimer);shell.classList.remove('is-frame-ready');poster.setAttribute('aria-hidden','false');video.setAttribute('aria-hidden','true');
  startButton.hidden=false;startButton.textContent='重新载入';replayButton.textContent='重新载入';
  setState('error','未能加载视频，当前显示首帧预览。');video.pause();soundButton.disabled=true;updateCaption();
}
function prepareSource(){
  if(!mediaReady){
    startButton.hidden=true;playButton.disabled=true;replayButton.disabled=true;soundButton.disabled=true;progress.disabled=true;
    setState(sourceStatus==='failed'?'unavailable':'pending',sourceStatus==='failed'?'视频生成未成功 · 当前为首帧预览':'视频准备中 · 当前为首帧预览');return false;
  }
  if(!source){mediaFailed();return false;}
  playButton.disabled=false;replayButton.disabled=false;
  startButton.hidden=true;replayButton.textContent='重看';setState('loading','视频准备中');
  video.src=source;video.load();return true;
}
async function play({reload=false}={}){
  if(!mediaReady){prepareSource();return;}
  if(pendingPlay)return pendingPlay;
  if((reload||state==='error'||!video.getAttribute('src'))&&!prepareSource())return;
  if(video.ended){video.currentTime=0;updateClock();}
  pendingPlay=(async()=>{
    try{await video.play();}
    catch(error){
      if(error.name==='AbortError')return;
      if(error.name==='NotAllowedError'){
        startButton.hidden=false;startButton.textContent='播放影片';setState('ready','点击播放，进入雨窗。');
      }else mediaFailed();
    }finally{pendingPlay=null;}
  })();
  return pendingPlay;
}
function togglePlayback(){showChrome();if(!mediaReady)return;if(!video.paused&&!video.ended)video.pause();else play();}
function replay(){
  showChrome();if(state==='error'){play({reload:true});return;}
  if(duration()){video.currentTime=0;updateClock();}
  play();
}
function toggleSound(){if(!mediaReady||!duration()||state==='error')return;video.muted=!video.muted;updateSound();showChrome();announce(video.muted?'影片已静音。':'影片声音已开启。');}
function seek(seconds){
  const length=duration();if(!length)return;
  try{video.currentTime=Math.min(length,Math.max(0,seconds));updateClock();showChrome();}catch{setStatus('影片仍在载入，请稍后重试。');}
}
async function toggleFullscreen(){
  showChrome();
  try{
    if(document.fullscreenElement)await document.exitFullscreen();
    else if(shell.requestFullscreen)await shell.requestFullscreen();
    else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();
    else announce('当前浏览器暂不支持全屏，可以使用铺满画面。');
  }catch{announce('暂时未能进入全屏，可以继续在页面中观看。');}
}

video.muted=true;video.defaultMuted=true;video.loop=false;video.volume=.7;video.playsInline=true;video.autoplay=mediaReady&&!reduced.matches&&!document.hidden;
video.addEventListener('loadedmetadata',()=>{
  updateClock();
  if(state==='error')return;
  if((reduced.matches||document.hidden)&&video.paused){startButton.hidden=false;startButton.textContent='播放影片';setState('ready','静止预览 · 点击播放后开始。');}
});
video.addEventListener('playing',()=>{
  clearTimeout(waitingTimer);startButton.hidden=true;shell.classList.add('is-frame-ready');poster.setAttribute('aria-hidden','true');video.setAttribute('aria-hidden','false');
  setStatus('');setState('playing');stopClock();tick();showChrome();
});
video.addEventListener('pause',()=>{
  stopClock();updateClock();if(state==='error'||state==='loading'||video.ended)return;
  startButton.hidden=true;setStatus('');setState('paused');
});
video.addEventListener('ended',()=>{stopClock();updateClock();startButton.hidden=true;setState('ended','已看完 · 可以重看');announce('影片已播放结束。');});
video.addEventListener('error',mediaFailed);
video.addEventListener('timeupdate',updateClock);
video.addEventListener('durationchange',updateClock);
video.addEventListener('seeked',()=>{
  if(state==='ended'&&video.currentTime<duration()){setStatus('');setState('paused');}
  updateClock();
  if(video.readyState>=2&&state!=='error'){shell.classList.add('is-frame-ready');poster.setAttribute('aria-hidden','true');video.setAttribute('aria-hidden','false');}
});
video.addEventListener('volumechange',updateSound);
video.addEventListener('waiting',()=>{clearTimeout(waitingTimer);waitingTimer=setTimeout(()=>{if(!video.paused&&state!=='error'){setState('buffering','正在载入下一段画面…');}},600);});
playButton.addEventListener('click',togglePlayback);startButton.addEventListener('click',()=>play({reload:state==='error'}));
replayButton.addEventListener('click',replay);soundButton.addEventListener('click',toggleSound);fullscreenButton.addEventListener('click',toggleFullscreen);
fillButton.addEventListener('click',()=>{
  const fill=shell.dataset.fit!=='cover';shell.dataset.fit=fill?'cover':'contain';fillButton.textContent=fill?'完整画面':'铺满';fillButton.setAttribute('aria-pressed',String(fill));
  announce(fill?'画面已铺满，边缘会被裁切。':'已恢复完整画面。');showChrome();
});
progress.addEventListener('pointerdown',()=>{dragging=true;showChrome(false);});
progress.addEventListener('input',()=>{if(duration())seek(Number(progress.value)/1000*duration());});
progress.addEventListener('change',()=>{dragging=false;updateClock();showChrome();});
addEventListener('pointerup',()=>{if(dragging){dragging=false;updateClock();showChrome();}});
captionToggle.addEventListener('click',()=>{captionEnabled=!captionEnabled;captionToggle.setAttribute('aria-pressed',String(captionEnabled));captionToggle.textContent=captionEnabled?'字幕 开':'字幕 关';updateCaption();showChrome();});
notes.addEventListener('toggle',()=>showChrome(!notes.open));
shell.addEventListener('pointermove',()=>showChrome(),{passive:true});
shell.addEventListener('pointerdown',()=>{keyboardMode=false;shell.dataset.keyboard='false';showChrome();},{passive:true});
shell.addEventListener('focusin',()=>showChrome(false));
addEventListener('keydown',event=>{
  if(event.key==='Tab'){keyboardMode=true;shell.dataset.keyboard='true';showChrome(false);return;}
  if(event.target.closest('button,a,input,summary,details,[contenteditable="true"]')||event.ctrlKey||event.altKey||event.metaKey)return;
  if(event.code==='Space'){event.preventDefault();togglePlayback();}
  else if(event.key.toLowerCase()==='m'){event.preventDefault();toggleSound();}
  else if(event.key==='ArrowLeft'){event.preventDefault();seek(video.currentTime-2);}
  else if(event.key==='ArrowRight'){event.preventDefault();seek(video.currentTime+2);}
});
document.addEventListener('fullscreenchange',()=>{const active=Boolean(document.fullscreenElement);fullscreenButton.textContent=active?'退出全屏':'全屏';fullscreenButton.setAttribute('aria-pressed',String(active));showChrome();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();stopClock();clearTimeout(hideTimer);}else showChrome(false);});
reduced.addEventListener('change',event=>{if(event.matches){video.autoplay=false;video.pause();showChrome(false);}});
addEventListener('pagehide',()=>{video.pause();stopClock();clearTimeout(hideTimer);clearTimeout(waitingTimer);});

updateSound();updateClock();
if(prepareSource()&&!reduced.matches&&!document.hidden)play();
