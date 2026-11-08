import {tasks,buildDemoEvidence} from './demo-evidence-data.js';
import {createDemoSession} from './demo-session.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=t=>t?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(t)):'';
const num=n=>Number.isFinite(n)?new Intl.NumberFormat('zh-CN',{maximumFractionDigits:Math.abs(n)<10?2:1}).format(n):'缺测';
const colors={volcano:'#ffbc8c',quake:'#c9b4ff',storm:'#9bdde6',mangkhut:'#e8c78e'};
export function observedWavePath(samples,scale){
 const last=Date.parse(samples.at(-1)?.timeUtc),first=last-30000;let path='',prior=null;
 for(const sample of samples){const t=Date.parse(sample.timeUtc);if(!Number.isFinite(sample.value)||!Number.isFinite(t)){prior=null;continue;}const connected=prior!==null&&t-prior<=1000;path+=(connected?'L':'M')+(25+(t-first)/30000*570).toFixed(2)+','+(74-sample.value/(scale||1)*50).toFixed(2);prior=t;}
 return path;
}
export function setupDemoWorkbench(driver){
 let data=null,task=null,evidence=null,key='',mode='earth',opening=false,split=50,lastView='';
 const catalog=$('#demo-catalog'),bench=$('#demo-workbench');
 catalog.innerHTML=Object.entries(tasks).map(([id,t],i)=>`<button type="button" data-demo="${id}" style="--demo-accent:${colors[id]}"><span class="demo-card-number">0${i+1} / ${esc({volcano:'VOLCANO',quake:'SEISMOGRAM',storm:'TYPHOON',mangkhut:'LOCAL IMPACT'}[id])}</span><strong>${esc(t.question)}</strong><small>${esc(t.title)}</small><span class="demo-card-go">播放地球动态 <b>↗</b></span></button>`).join('');
 function setMode(next){mode=next;$('#demo-compare-view').hidden=next!=='compare';document.body.classList.toggle('demo-compare-mode',next==='compare');for(const b of $('#demo-stage-tabs').querySelectorAll('[data-demo-view]'))b.setAttribute('aria-pressed',String(b.dataset.demoView===next));}
 function setSplit(value){split=Math.round(Math.max(0,Math.min(100,Number(value)||0)));$('#demo-compare-view').style.setProperty('--reveal',split+'%');$('#demo-split').value=split;$('#demo-split-value').textContent=split+'%';}
 const session=createDemoSession({
  async prepare(next,context){const result=await driver.prepare(next,context);if(context.signal.aborted||!result)return false;data=result.data;return result;},
  seek:driver.seek,pause:driver.pause,
  onChange(s){
   if(!s.active)return;
   bench.dataset.status=s.status;$('#demo-run').disabled=s.status==='loading';$('#demo-run').textContent=s.status==='loading'?'准备观测…':s.status==='playing'?'Ⅱ 暂停过程':s.status==='complete'?'↺ 再看一次':'▶ 播放变化';
   for(const b of document.querySelectorAll('#demo-show-a,#demo-show-b,#demo-narrate,#demo-sources,[data-demo-act]'))b.disabled=s.status==='loading';
   $('#demo-mini-play').textContent=s.status==='playing'?'Ⅱ 暂停':'▶ 看变化';
   $('#demo-status').textContent=s.error||(s.status==='loading'?'正在准备真实记录…':s.status==='playing'?'沿实际记录推进 · 地球与图表共用时刻 B':s.status==='complete'?'已到关键时刻 · 在地球上核对标注与曲线':'已暂停 · 可拖动原时间轴继续观察');
   $('#demo-process-progress').style.width=(s.progress*100)+'%';
   $('#demo-continue').hidden=s.status!=='complete';
   if(s.status==='complete'&&lastView!=='complete'){setMode('earth');}
   lastView=s.status;refresh();
  }
 });
 function waveform(waveforms){
  if(!waveforms)return '<p>该时刻没有可比较波形。</p>';
  const scale=waveforms.scale||1;
  const draw=(samples,label,color)=>{
   const points=samples||[],last=Date.parse(points.at(-1)?.timeUtc),first=last-30000;
   const path=observedWavePath(points,scale);
   const envelope=points.filter(p=>Number.isFinite(p.min)&&Number.isFinite(p.max)).map(p=>{const x=25+(Date.parse(p.timeUtc)-first)/30000*570;return `M${x} ${74-p.min/scale*50}V${74-p.max/scale*50}`;}).join(' ');
   return `<div class="demo-wave-block"><span>${label}</span><svg viewBox="0 0 620 150" role="img" aria-label="${esc(label)}，同台站真实30秒波形，共同纵轴正负${num(scale)}counts"><path d="M25 24H595 M25 74H595 M25 124H595" stroke="#36505f" stroke-width=".6"/><path d="${envelope}" stroke="${color}" stroke-width="1" opacity=".4"/><path d="${path}" fill="none" stroke="${color}" stroke-width="1.4"/><text x="25" y="145">此前30秒</text><text x="595" y="145" text-anchor="end">所选窗末</text></svg></div>`;
  };
  return `<div class="demo-wave-title">${esc(waveforms.stationId)} · 相同纵轴 ±${num(scale)} counts</div>${draw(waveforms.a,'A · '+time(evidence.fromUtc),'#95e0df')}${draw(waveforms.b,'B · '+time(evidence.toUtc),'#e4bd86')}<p class="demo-wave-foot">同一台站，分别截止A/B的前30秒。细条保留1秒窗内最小—最大值；缺测不补线。</p>`;
 }
 function frameMeta(frame){if(!frame)return '该时刻缺少有效影像';return [frame.timeUtc&&'名义时刻 '+frame.timeUtc,frame.scanStartUtc&&'实际扫描 '+frame.scanStartUtc+' — '+frame.scanEndUtc].filter(Boolean).join('；');}
 function refresh(){
  const s=session.snapshot();if(!s.active||!data||!task)return;
  const c=driver.context();if(opening)return;
  if(!c.loading&&c.route!==task.route){close();return;}
  if(c.loading||!c.timeUtc)return;
  // Real-event narration keeps the globe in view, including at the final observation.
  const nextKey=[task.id,s.fromUtc,c.timeUtc,c.stationId].join('|');if(nextKey===key){addBaselineMarkers(s.fromUtc,c.timeUtc);return;}key=nextKey;
  try{evidence=buildDemoEvidence(task,data,s.fromUtc,c.timeUtc,c.stationId);}
  catch(error){evidence=null;delete $('#demo-deltas').dataset.observedTime;delete $('#demo-compare-view').dataset.observedTime;$('#demo-clock-b').textContent='B · '+time(c.timeUtc)+' UTC+8';$('#demo-evidence-note').textContent='当前时刻不在本次正向对照范围';$('#demo-source-evidence').textContent='当前B：'+c.timeUtc+'。'+error.message+'，尚未生成这组A/B对照依据。';$('#demo-deltas').innerHTML='<p class="demo-empty">'+esc(error.message)+'。选择“看 A”或重新播放。</p>';$('#demo-compare-content').innerHTML='<p class="demo-empty">当前时间不在本次对照范围。</p>';return;}
  $('#demo-clock-a').textContent='A · '+time(evidence.fromUtc)+' UTC+8';$('#demo-clock-b').textContent='B · '+time(evidence.toUtc)+' UTC+8';
  $('#demo-deltas').dataset.observedTime=evidence.toUtc;$('#demo-compare-view').dataset.observedTime=evidence.toUtc;
  $('#demo-deltas').innerHTML='<div class="demo-table-head"><span>观测量</span><span>A</span><span>当前 B</span><span>B − A</span></div>'+evidence.rows.map(r=>`<div class="demo-delta-row"><div><strong>${esc(r.label)} <small>${esc(r.unit)}</small></strong><p>${r.valueType==='range'?'地区测站范围 · 不计算单站增量':'实际记录 A '+esc(time(r.aTimeUtc))+' / B '+esc(time(r.bTimeUtc))}</p></div><span>${r.valueType==='range'?(r.aRange?num(r.aRange.lower)+'–'+num(r.aRange.upper):'缺测'):num(r.a)}</span><span>${r.valueType==='range'?(r.bRange?num(r.bRange.lower)+'–'+num(r.bRange.upper):'缺测'):num(r.b)}</span><span class="demo-delta">${Number.isFinite(r.delta)?(r.delta>0?'+':'')+num(r.delta):'—'}</span></div>`).join('');
  const from=evidence.fromImage,to=evidence.toImage,a=typeof from==='string'?from:from?.url,b=typeof to==='string'?to:to?.url;
  if(evidence.waveforms){$('#demo-compare-content').innerHTML='<div class="demo-waveforms">'+waveform(evidence.waveforms)+'</div>';$('#demo-split-control').hidden=true;}
  else{
   $('#demo-split-control').hidden=false;
   $('#demo-compare-content').innerHTML=a&&b?`<div class="demo-image-pair"><img class="demo-image-a" src="${esc(a)}" alt="A：${esc(time(evidence.fromUtc))}，真实红外亮温派生图"><div class="demo-image-b"><img src="${esc(b)}" alt="B：${esc(time(evidence.toUtc))}，同区域同映射的真实红外亮温派生图"></div><div class="demo-split-line"><span>↔</span></div><span class="demo-image-tag a">A · ${time(evidence.fromUtc)}</span><span class="demo-image-tag b">B · ${time(evidence.toUtc)}</span></div>`:'<p class="demo-empty">当前时刻云图缺档，保留缺口；没有用其他帧替代。</p>';
   setSplit(split);
  }
  $('#demo-evidence-note').textContent=evidence.waveforms?'实测波形 · 同一仪器 · 共同纵轴':'同一地理窗口 · 固定亮温映射 · 拖动分隔线核对形态';
  $('#demo-compare-caption').textContent=evidence.waveforms?'A / B 使用同一台站、相同纵轴；分别显示截止所选时刻的真实记录。':'两张真实红外亮温派生图，使用相同地理窗口与映射：180 K 白 → 310 K 黑。';
  const detail=(r,prefix)=>[r[prefix+'TimeUtc']&&'记录 '+r[prefix+'TimeUtc'],r[prefix+'SourceLine']&&'源行 '+r[prefix+'SourceLine'],r[prefix+'PeakTimeUtc']&&'峰值采样 '+r[prefix+'PeakTimeUtc'],r[prefix+'WindowStartUtc']&&'累计 '+r[prefix+'WindowStartUtc']+' — '+(r[prefix+'WindowEndUtc']||r[prefix+'TimeUtc'])].filter(Boolean).join('；')||'缺测';
  $('#demo-source-evidence').innerHTML=(evidence.waveforms?'<p>'+esc(evidence.waveforms.stationId)+' · 同仪器30秒波形对照</p>':`<p><b>A影像</b> ${esc(frameMeta(from))}</p><p><b>B影像</b> ${esc(frameMeta(to))}</p>`)+evidence.rows.map(r=>`<p><b>${esc(r.label)}</b><br>A ${esc(detail(r,'a'))}<br>B ${esc(detail(r,'b'))}<br>${esc((r.notes||[]).join(' '))}</p>`).join('');
  addBaselineMarkers(s.fromUtc,c.timeUtc);
 }
 function addBaselineMarkers(a,b){
  for(const svg of document.querySelectorAll('#charts svg,#current-insight .sync-chart svg')){
   svg.querySelectorAll('.demo-a-marker').forEach(n=>n.remove());
   let start=Date.parse(data.startUtc),end=Date.parse(data.endUtc),left=8,width=214,height=Number(svg.getAttribute('viewBox')?.split(' ')[3])||70;
   if(task.id==='mangkhut'){left=30;width=251;}
   else if(task.id==='quake'&&svg.closest('.dynamic-chart')===$('#charts .dynamic-chart')){start=Math.max(start,Math.min(Date.parse(b)-60000,end-120000));end=start+120000;}
   const f=(Date.parse(a)-start)/(end-start);if(f<0||f>1)continue;
   const ns='http://www.w3.org/2000/svg',g=document.createElementNS(ns,'g');g.setAttribute('class','demo-a-marker');
   const path=document.createElementNS(ns,'path');path.setAttribute('d',`M${left+f*width} 8V${height-16}`);path.setAttribute('stroke','#95e0df');path.setAttribute('stroke-dasharray','2 3');path.setAttribute('opacity','.8');g.append(path);
   const label=document.createElementNS(ns,'text');label.setAttribute('x',left+f*width+3);label.setAttribute('y','11');label.setAttribute('fill','#95e0df');label.setAttribute('font-size','8');label.textContent='A';g.append(label);svg.append(g);
  }
 }
 async function open(id){
  if(!tasks[id])return;session.close();task={...tasks[id],id};data=null;evidence=null;key='';opening=true;lastView='';
  document.body.classList.add('demo-active');bench.hidden=false;$('#demo-stage-tabs').hidden=false;$('#demo-delta-panel').hidden=false;setSplit(50);
  $('#demo-question').textContent=task.question;$('#demo-task-name').textContent=task.title;$('#demo-takeaway').textContent=task.takeaway;
  $('#demo-deltas').innerHTML='<p>正在准备同口径观测…</p>';$('#demo-compare-content').replaceChildren();$('#demo-source-evidence').replaceChildren();$('#demo-clock-a').textContent='准备起点 A…';$('#demo-clock-b').textContent='准备时刻 B…';$('#demo-evidence-details').open=false;setMode('earth');
  for(const card of catalog.querySelectorAll('[data-demo]'))card.setAttribute('aria-pressed',String(card.dataset.demo===id));
  await session.open(task);opening=false;refresh();
  if(session.snapshot().active){const anchor=innerWidth>700?$('.observatory'):$('.earth-column');anchor.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
 }
 function close(){if(!session.snapshot().active)return;session.close();task=null;data=null;evidence=null;key='';bench.hidden=true;$('#demo-stage-tabs').hidden=true;$('#demo-delta-panel').hidden=true;setMode('earth');document.body.classList.remove('demo-active');document.querySelectorAll('.demo-a-marker').forEach(n=>n.remove());for(const card of catalog.querySelectorAll('[data-demo]'))card.setAttribute('aria-pressed','false');}
 catalog.addEventListener('click',e=>{const b=e.target.closest('[data-demo]');if(b)open(b.dataset.demo);});
 async function run(){const s=session.snapshot();if(s.status==='playing'){session.pause();return;}setMode('earth');const actual=driver.context().timeUtc;if(actual&&s.timeUtc&&Date.parse(actual)!==Date.parse(s.timeUtc)){if(!await session.jump('a'))return;}await session.play();}
 $('#demo-run').addEventListener('click',run);
 async function jump(edge){if(await session.jump(edge))setMode('earth');}
 $('#demo-show-a').addEventListener('click',()=>jump('a'));$('#demo-show-b').addEventListener('click',()=>jump('b'));$('#demo-close').addEventListener('click',close);
 $('#demo-stage-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-demo-view]');if(b)setMode(b.dataset.demoView);const action=e.target.closest('[data-demo-act]');if(action){if(action.dataset.demoAct==='play')run();else jump(action.dataset.demoAct);}});
 $('#demo-split').addEventListener('input',e=>setSplit(e.target.value));
 const compareHost=$('#demo-compare-content');let dragging=false;
 function dragSplit(e){const box=compareHost.getBoundingClientRect();setSplit((e.clientX-box.left)/box.width*100);}
 compareHost.addEventListener('pointerdown',e=>{if(!e.target.closest('.demo-image-pair'))return;session.pause();dragging=true;compareHost.setPointerCapture(e.pointerId);dragSplit(e);e.preventDefault();});
 compareHost.addEventListener('pointermove',e=>{if(dragging)dragSplit(e);});
 for(const type of ['pointerup','pointercancel'])compareHost.addEventListener(type,()=>dragging=false);
 function narrate(){session.pause();setMode('earth');driver.narrate();}
 $('#demo-narrate').addEventListener('click',narrate);
 $('#demo-continue').addEventListener('click',narrate);
 $('#demo-sources').addEventListener('click',()=>{session.pause();$('#demo-evidence-details').open=true;$('#demo-evidence-details').scrollIntoView({behavior:'smooth',block:'center'});});
 $('#demo-original-sources').addEventListener('click',()=>{session.pause();driver.sources();});
 document.addEventListener('pointerdown',e=>{if(e.target.closest('#demo-workbench,#demo-catalog,#demo-stage-tabs,#demo-compare-view,#demo-delta-panel,#observed-story-band,#observed-locations,#observed-keyframes,#story-feature-retry,.observed-story-pin'))return;if(e.target.closest('button,input,select,canvas,a'))session.pause();},true);
 document.addEventListener('input',e=>{if(e.target.closest('#demo-compare-view,#observed-story-band,#observed-locations'))return;const value=e.target.value;session.pause();e.target.value=value;},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close();else if(e.target.closest('#timeline,#earth-canvas'))session.pause();},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)session.pause();});
 const interval=setInterval(()=>{session.tick();if(!opening)refresh();},180);window.addEventListener('pagehide',()=>{close();clearInterval(interval);});
 return {open,close,session};
}
