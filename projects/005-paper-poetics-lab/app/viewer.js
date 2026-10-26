import './styles.css';
import {themes} from './data.js';
import {createExperience} from './engine.js';
import {createAmbience} from './ambience.js';
const $=s=>document.querySelector(s),theme=themes[new URLSearchParams(location.search).get('theme')]||themes.tea;
document.body.dataset.theme=theme.id;document.title=`${theme.name} · 纸间`;$('#theme-name').textContent=theme.name;
if(new URLSearchParams(location.search).get('art')==='1')document.body.classList.add('art-only');
document.querySelector('meta[name=theme-color]').content=theme.paper;
document.querySelectorAll('[data-theme-link]').forEach(link=>{if(link.dataset.themeLink===theme.id)link.setAttribute('aria-current','page');});
let experience,current=-1,busy=false;
const sound=createAmbience(theme.id,state=>{
  $('#sound-toggle').textContent=state.loading?'声音 加载中':state.enabled?'声音 开':'声音 关';$('#sound-toggle').setAttribute('aria-pressed',String(state.enabled));$('#sound-toggle').disabled=state.loading||busy;
  $('#sound-toggle').dataset.context=state.context;$('#sound-toggle').dataset.loaded=String(state.loaded);
});
function copy(progress){
  const index=Math.min(2,Math.floor(progress*3)),chapter=theme.chapters[index];
  if(index!==current){current=index;$('#chapter-kicker').textContent=`${theme.en} / 0${index+1}`;$('#chapter-title').textContent=chapter.title;$('#chapter-poem').textContent=chapter.poem;$('#chapter-note').textContent=chapter.note;document.querySelectorAll('[data-step]').forEach(button=>{const i=Number(button.dataset.step);button.textContent=`${['一','二','三'][i]} · ${theme.chapters[i].title}`;if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});}
  $('#progress').value=Math.round(progress*1000);$('#progress-value').value=`${String(Math.round(progress*100)).padStart(2,'0')}%`;$('#chapter-prev').disabled=index===0;$('#chapter-next').disabled=index===2;
}
function controls(state){
  $('#pause').textContent=state.paused?'继续动态':'暂停动态';$('#pause').setAttribute('aria-pressed',String(state.paused));$('#play-tour').textContent=state.auto?'停止浏览':'自动浏览';$('#play-tour').setAttribute('aria-pressed',String(state.auto));copy(state.progress);sound.update({paused:state.paused,action:state.action});
}
try{
  experience=createExperience($('#experience-canvas'),{theme:theme.id,onProgress:copy,onState:controls,onReady(){ $('#scene-loading').hidden=true; }});
  const requestedProgress=new URLSearchParams(location.search).get('p');if(requestedProgress!==null)experience.setProgress(Number(requestedProgress));
  else if(!document.body.classList.contains('art-only')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)experience.setAuto(true);
  $('#scene-action').textContent=theme.action;
  const step=index=>experience.setProgress([.10,.50,.88][Math.max(0,Math.min(2,index))]);
  document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>step(Number(button.dataset.step))));
  $('#chapter-prev').addEventListener('click',()=>step(current-1));$('#chapter-next').addEventListener('click',()=>step(current+1));
  $('#progress').addEventListener('input',()=>experience.setProgress(Number($('#progress').value)/1000));
  $('#pause').addEventListener('click',()=>experience.setPaused(!experience.state.paused));$('#play-tour').addEventListener('click',()=>experience.setAuto(!experience.state.auto));
  $('#scene-action').addEventListener('click',()=>{experience.trigger();$('#scene-status').textContent=theme.response;sound.update({action:1,paused:false});setTimeout(()=>sound.update({action:0,paused:experience.state.paused}),theme.id==='tea'?3300:4500);});
  $('#sound-toggle').addEventListener('click',async()=>{if(busy)return;busy=true;$('#sound-toggle').disabled=true;try{await sound.toggle();}catch(error){$('#scene-status').textContent='声音暂时无法加载，请稍后重新开启。';console.warn('Theme sound unavailable',error);}finally{busy=false;$('#sound-toggle').disabled=false;}});
  addEventListener('wheel',event=>{if(event.ctrlKey||event.target.closest('input,button,a'))return;event.preventDefault();experience.setProgress(experience.state.progress+event.deltaY*.0005);},{passive:false});
  let touchY=null;addEventListener('touchstart',event=>{touchY=event.target.closest('input,button,a')?null:event.touches[0]?.clientY;},{passive:true});
  addEventListener('touchmove',event=>{if(touchY===null)return;const y=event.touches[0]?.clientY;if(y===undefined)return;event.preventDefault();experience.setProgress(experience.state.progress+(touchY-y)*.0015);touchY=y;},{passive:false});
  addEventListener('keydown',event=>{if(event.target.closest('input,button'))return;if(['ArrowDown','ArrowRight','PageDown'].includes(event.key)){event.preventDefault();step(current+1);}if(['ArrowUp','ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();step(current-1);}if(event.code==='Space'){event.preventDefault();experience.setPaused(!experience.state.paused);}});
  addEventListener('visibilitychange',()=>sound.suspend(document.hidden));
  $('#experience-canvas').addEventListener('art-error',()=>{ $('#scene-loading').hidden=true;$('#scene-fallback').hidden=false; });
}catch(error){console.error('Theme initialization failed',error);$('#scene-loading').hidden=true;$('#scene-fallback').hidden=false;}
