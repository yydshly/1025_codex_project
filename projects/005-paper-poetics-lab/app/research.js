import {studies, stages, findings, questions} from './research-data.js';
import originalImage from './media/research/original.jpg';
import teaImage from './media/research/tea.jpg';
import moonImage from './media/research/moon.jpg';
import teaFirstImage from './media/research/tea-first.jpg';
import cinemaImage from './media/cinema/rain-window-tea.jpg';
import studyImage from './media/cinema/rain-window-study.jpg';

const $=selector=>document.querySelector(selector);
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const images={original:originalImage,tea:teaImage,moon:moonImage,cinema:cinemaImage,study:studyImage};
const alt={original:'项目002独立重写的水墨叙事封面截图，并非原作截图',tea:'山间茶息v1.1实际页面截图：窗前茶台、茶器和远山',moon:'月下花庭v1.1实际页面截图：月洞门、花枝与池面',cinema:'原创AI样片雨窗茶寮的首帧封面',study:'实拍对照视频的抽帧：玻璃雨滴与虚焦的街道灯光'};

$('#study-grid').innerHTML=studies.map(item=>`<article class="study study--${escape(item.id)}" data-kind="${escape(item.kind)}"><a class="study-cover" href="${escape(item.href)}" aria-label="${escape(item.linkText)}"><img src="${images[item.id]}" width="960" height="600" loading="lazy" alt="${alt[item.id]}" /><span class="study-label">${escape(item.label)}</span></a><div class="study-body"><div class="study-topline"><h3>${escape(item.title)}</h3><p class="study-status">${escape(item.status)}</p></div><p class="study-description">${escape(item.description)}</p><dl class="study-notes"><div><dt>观察</dt><dd>${escape(item.observed)}</dd></div><div><dt>局限</dt><dd>${escape(item.limitation)}</dd></div></dl><a class="study-open" href="${escape(item.href)}">${escape(item.linkText)} <span aria-hidden="true">↗</span></a></div></article>`).join('');
$('#research-timeline').innerHTML=stages.map(item=>`<li><span class="timeline-version">${escape(item.version)}</span><div class="timeline-change"><h3>${escape(item.title)}</h3><p>${escape(item.change)}</p></div><div class="timeline-learned"><span>这一轮的发现</span><p>${escape(item.learned)}</p></div></li>`).join('');
$('#findings-grid').innerHTML=findings.map((item,index)=>`<article class="finding"><span class="finding-number">${String(index+1).padStart(2,'0')}</span><div><h3>${escape(item.title)}</h3><p>${escape(item.body)}</p></div></article>`).join('');
$('#next-questions').innerHTML=questions.map(item=>`<li><div><h3>${escape(item.title)}</h3><p>${escape(item.body)}</p></div></li>`).join('');
$('#tea-first-image').src=teaFirstImage;
$('#tea-space-image').src=teaImage;

document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  let count=0;
  document.querySelectorAll('.study').forEach(item=>{item.hidden=filter!=='all'&&item.dataset.kind!==filter;if(!item.hidden)count++;});
  $('#study-count').textContent=`${count}项记录`;
}));

const video=$('#research-video'),playButton=$('#research-play'),poster=$('#research-poster'),status=$('#research-video-status');
playButton.addEventListener('click',async()=>{
  playButton.disabled=true;
  status.textContent='正在载入本地影片…';
  if(!video.getAttribute('src'))video.src=new URL(video.dataset.src,document.baseURI).href;
  video.hidden=false;poster.hidden=true;
  try{
    await video.play();
    playButton.hidden=true;
    status.textContent='正在播放实际AI成片。默认静音，可通过播放器开启声音。';
  }catch{
    video.hidden=true;poster.hidden=false;
    status.textContent='暂时无法播放，可重试或进入完整观看页。';
  }finally{playButton.disabled=false;}
});
video.addEventListener('ended',()=>{status.textContent='样片已看完，可使用播放器重看或进入完整观看页。';});
video.addEventListener('play',()=>{if(playButton.hidden)status.textContent='正在播放实际AI成片。可使用播放器调整声音与进度。';});
video.addEventListener('pause',()=>{if(!video.ended&&!video.hidden)status.textContent='影片已暂停，可使用播放器继续观看。';});
video.addEventListener('error',()=>{status.textContent='影片载入失败，可进入完整观看页查看。';});
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
