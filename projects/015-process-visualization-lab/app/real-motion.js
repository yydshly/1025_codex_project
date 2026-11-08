const NASA_VIDEO='https://svs.gsfc.nasa.gov/vis/a000000/a004600/a004682/Mangkhut_07_1080p30.mp4';
const NASA_PAGE='https://svs.gsfc.nasa.gov/4682';
const CIRA_PAGE='https://rammb-data.cira.colostate.edu/tc_realtime/archive.asp?product=4kmirimg&storm_identifier=wp262018';
let mounted=null;

/** Mount once. Opening never starts a remote request or playback; Play does. */
export function setupRealMotion(button){
 if(!button||typeof button.addEventListener!=='function')throw new TypeError('真实动态入口需要一个按钮');
 if(!mounted)mounted=createPlayer();
 mounted.attach(button);
 return mounted;
}

function createPlayer(){
 if(!document.querySelector('link[data-real-motion-style]')){
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';
  stylesheet.href=new URL('./real-motion.css',import.meta.url).href;
  stylesheet.dataset.realMotionStyle='';document.head.appendChild(stylesheet);
 }
 const dialog=document.createElement('dialog');dialog.id='real-motion-dialog';dialog.className='real-motion-dialog';
 dialog.setAttribute('aria-labelledby','real-motion-title');dialog.setAttribute('aria-describedby','real-motion-scope');
 dialog.innerHTML=`<div class="real-motion-heading"><div><span class="real-motion-eyebrow">NASA / OFFICIAL DATA VISUALIZATION</span><h2 id="real-motion-title">看见山竹的降水结构</h2></div><button type="button" class="real-motion-close" aria-label="关闭真实动态播放器">关闭 <span aria-hidden="true">×</span></button></div>
 <div class="real-motion-body"><p id="real-motion-scope" class="real-motion-scope">NASA 官方数据可视化 · 2018-09-12—13 · IMERG降水估计 + GPM雷达三维结构</p>
 <div class="real-motion-stage"><video class="real-motion-video" controls playsinline preload="none" aria-label="NASA官方山竹降水估计与雷达三维结构视频"></video><div class="real-motion-overlay"><button type="button" class="real-motion-play"><span class="real-motion-play-icon" aria-hidden="true">▶</span><span class="real-motion-play-label">播放 NASA 官方视频</span><small>点击播放后连接 NASA · 不自动播放</small></button></div></div>
 <div class="real-motion-status" role="status" aria-live="polite">等待播放 · 视频由 NASA 官方地址直接提供</div>
 <div class="real-motion-fallback" hidden><p>当前无法播放官方视频，可在原站继续查看。</p><a href="${NASA_PAGE}" target="_blank" rel="noopener noreferrer">打开 NASA 原始页面 ↗</a><a href="${NASA_VIDEO}" target="_blank" rel="noopener noreferrer">在浏览器打开 NASA 原视频 ↗</a></div>
 <p class="real-motion-time-note">这是9月12—13日的历史资料，不是9月16日或地球当前时刻的瞬时云图；视频与地球时间轴不自动同步。</p>
 <div class="real-motion-notes"><div><span>01 / 看分布</span><p>看外围雨带怎样围绕台风中心分布。</p></div><div><span>02 / 看剖面</span><p>看风眼与雨墙剖面。颜色表达降水估计与雷达结构，不是可见光云图。</p></div></div>
 <div class="real-motion-links"><a href="${NASA_PAGE}" target="_blank" rel="noopener noreferrer">NASA SVS · 原始说明与来源 ↗</a><a href="${CIRA_PAGE}" target="_blank" rel="noopener noreferrer">CIRA · 高频红外图像与 Loop 回放 ↗</a></div>
 <p class="real-motion-credit">可视化：NASA Scientific Visualization Studio · 数据：NASA/JAXA GPM。CIRA 目录可选择 Loop 起止范围，具体时间以原页图像标注为准。</p></div>`;
 document.body.appendChild(dialog);
 const video=dialog.querySelector('video'),overlay=dialog.querySelector('.real-motion-overlay');
 const playButton=dialog.querySelector('.real-motion-play'),playLabel=dialog.querySelector('.real-motion-play-label');
 const status=dialog.querySelector('.real-motion-status'),fallback=dialog.querySelector('.real-motion-fallback');
 const launchers=new Set();let sourceAttached=false,destroyed=false,playRequest=0;

 function showPlay(){overlay.hidden=false;playLabel.textContent=video.ended?'重新播放官方视频':sourceAttached?'继续播放官方视频':'播放 NASA 官方视频';}
 function open(){
  if(destroyed)return;
  if(!dialog.open){dialog.showModal();dialog.dispatchEvent(new CustomEvent('real-motion-open',{bubbles:true}));}
  if(video.paused)showPlay();
 }
 function pause(){++playRequest;video.pause();showPlay();}
 function close(){pause();if(dialog.open)dialog.close();}
 function showError(){
  fallback.hidden=false;status.textContent='官方视频暂时无法播放，请使用下方原始入口。';showPlay();
  playLabel.textContent='重试官方视频';
 }
 async function play(){
  if(destroyed||!dialog.open)return;
  const request=++playRequest;fallback.hidden=true;status.textContent='正在连接 NASA 官方视频…';
  if(!sourceAttached){
   const source=document.createElement('source');source.src=NASA_VIDEO;source.type='video/mp4';
   video.appendChild(source);sourceAttached=true;source.addEventListener('error',showError);video.load();
  }else if(video.error){video.load();}
  try{
   await video.play();
   if(request!==playRequest)return;
   if(!dialog.open){video.pause();return;}
   if(video.paused){status.textContent='视频已暂停 · 可继续播放';return;}
   status.textContent='正在播放 NASA 官方数据可视化 · 2018-09-12—13';
  }catch(error){
   if(request!==playRequest||!dialog.open)return;
   if(error?.name==='NotAllowedError'){status.textContent='浏览器未开始播放，请再次点击播放或使用视频原生控件。';showPlay();}
   else showError();
  }
 }
 playButton.addEventListener('click',play);
 dialog.querySelector('.real-motion-close').addEventListener('click',close);
 dialog.addEventListener('close',()=>{pause();status.textContent='视频已暂停，重新打开后可继续播放。';});
 dialog.addEventListener('cancel',pause);
 video.addEventListener('play',()=>{if(!dialog.open){video.pause();return;}overlay.hidden=true;fallback.hidden=true;status.textContent='正在缓冲 NASA 官方视频…';});
 video.addEventListener('playing',()=>{if(dialog.open)status.textContent='正在播放 NASA 官方数据可视化 · 2018-09-12—13';});
 video.addEventListener('waiting',()=>{if(dialog.open&&!video.paused)status.textContent='正在缓冲 NASA 官方视频…';});
 video.addEventListener('pause',()=>{showPlay();if(dialog.open&&!video.ended)status.textContent='视频已暂停 · 可继续播放';});
 video.addEventListener('ended',()=>{showPlay();status.textContent='官方片段播放完毕 · 点击可重新播放';});
 video.addEventListener('error',showError);
 return {
  dialog,video,open,close,
  attach(launcher){if(!launchers.has(launcher)){launchers.add(launcher);launcher.addEventListener('click',open);}},
  destroy(){if(destroyed)return;destroyed=true;close();for(const launcher of launchers)launcher.removeEventListener('click',open);launchers.clear();dialog.remove();mounted=null;}
 };
}
