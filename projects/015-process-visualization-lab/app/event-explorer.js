import {validateEventFeed,filterEvents,buildEventTimeline} from './live-event-data.js';
import {eventFactsMarkup,eventSeriesMarkup} from './live-event-view.js';
import {fetchEarthEvents} from './live-event-feed.js';

const $=selector=>document.querySelector(selector);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={all:'全部事件',quake:'地震',volcano:'火山',storm:'热带气旋'};
const colors={quake:'#aa9bff',volcano:'#ffa76d',storm:'#79dce9'};
const when=value=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
const short=value=>when(value).slice(5);
const byTime=(a,b)=>Date.parse(a.timeUtc)-Date.parse(b.timeUtc);

/** A source-backed catalog and discrete observation player; it does not synthesize hazard fields. */
export function createEventExplorer(engine,{isActive,onPrinciple}){
 let feed=null,kind='all',query='',event=null,index=0,playing=false,elapsed=0,request=0,refreshing=false,receipt='随项目保存的资料',includeOlder=false;
 const subset=key=>feed?filterEvents(feed,key).filter(e=>includeOlder||e.source.id!=='eonet_volcano_open'||Date.parse(e.lastObservedUtc)>=Date.parse(feed.retrievedAtUtc)-90*86400000):[];
 const matching=()=>subset(kind).filter(e=>(e.title+' '+e.id).toLowerCase().includes(query.toLowerCase()));
 const ticks=()=>kind==='quake'?matching().slice().sort(byTime):event?buildEventTimeline(event):[];
 function renderFilters(){
  $('#layers').innerHTML=Object.entries(labels).map(([key,label])=>`<button type="button" data-live-kind="${key}" aria-pressed="${key===kind}"><span class="icon" style="color:${colors[key]||'#c7dce9'}">${key==='all'?'◎':key==='volcano'?'△':key==='quake'?'⌁':'◉'}</span>${label} <small>${subset(key).length}</small></button>`).join('');
 }
 function renderStatus(message=''){
  $('#live-refresh').disabled=refreshing;$('#live-refresh').textContent=refreshing?'正在获取…':'更新官方资料 ↻';
  $('#live-status').textContent=message||(feed?receipt+' · 获取于 '+when(feed.retrievedAtUtc)+' UTC+8':'正在载入事件目录…');
 }
 function renderList(){
  const list=matching().slice().sort((a,b)=>Date.parse(b.lastObservedUtc)-Date.parse(a.lastObservedUtc));
  $('#live-result-count').textContent=list.length+' 条匹配资料';
  $('#current-insight').innerHTML='<div class="panel-label">选择一个事件 <small>按最近记录排序</small></div><div class="live-event-list">'+(list.length?list.map(e=>`<button type="button" class="live-event-item" data-event-id="${escape(e.id)}" aria-pressed="${e.id===event?.id}" style="--event-color:${colors[e.kind]}"><span>${labels[e.kind]}${e.magnitude!=null?' · M '+e.magnitude:''}</span><strong>${escape(e.title)}</strong><small>${short(e.lastObservedUtc)} · ${escape(e.statusLabel)}</small></button>`).join(''):'<p class="live-empty">当前筛选范围没有可用记录。可以换一个类型或更新资料；这里不生成示例事件。</p>')+'</div>';
 }
 function showEmpty(){
  event=null;index=0;playing=false;engine.setLiveEvents([],selectEvent);engine.setLiveTime(null);
  $('#scale-note').textContent='当前筛选没有可用记录';$('#parameters').innerHTML='';$('#param-guide').textContent='调整类型或检索词，选择有原始资料的事件。';$('#scene-caption').textContent='没有匹配记录，地球保留地理底图。';$('#source-links').innerHTML=feed.sources.map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener">${escape(s.name)} ↗</a></li>`).join('');
  $('#readouts').innerHTML='<p class="live-empty">没有匹配事件。此处保留为空。</p>';$('#charts').innerHTML='';$('#location-name').textContent='选择类型或调整检索词';$('#location-coordinates').textContent='无可显示的事件定位';$('#explanation').textContent='资料目录没有返回记录，不等于地球上没有相关活动。';$('#view-label').textContent=labels[kind];$('#view-mode').textContent='无可用记录';$('#stage-steps').innerHTML='';updateControls();
 }
 function setKind(value){
  kind=Object.hasOwn(labels,value)?value:'all';query='';$('#live-search').value='';playing=false;elapsed=0;
  renderFilters();renderList();const events=matching();engine.setLiveEvents(events,selectEvent);engine.setLiveTime(null);
  const chosen=events.slice().sort((a,b)=>Date.parse(b.lastObservedUtc)-Date.parse(a.lastObservedUtc))[0];
  chosen?selectEvent(chosen.id):showEmpty();
 }
 function updateControls(){
  const steps=ticks();$('#timeline').max=Math.max(0,steps.length-1);$('#timeline').step=1;$('#timeline').value=index;$('#timeline').disabled=steps.length<2;
  $('#timeline').setAttribute('aria-label',kind==='quake'?'地震真实发生顺序':'事件原始报告时刻');
  $('#time-label').textContent=kind==='quake'?'按真实发生顺序 · UTC+8':'原始报告时刻 · UTC+8';
  const first=steps[0],last=steps.at(-1);$('#time-start').textContent=first?short(first.timeUtc):'无记录';$('#time-end').textContent=last?short(last.timeUtc):'无记录';
  $('#time-value').textContent=steps[index]?short(steps[index].timeUtc)+' · '+(index+1)+'/'+steps.length:'无记录';
  $('#play').disabled=steps.length<2;$('#restart').disabled=steps.length<2;$('#speed').disabled=steps.length<2;
  $('#play').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',playing?'暂停记录回放':'播放真实记录');
  if(steps.length===1)$('#time-label').textContent='仅一条原始记录 · 无连续回放';
 }
 function renderSelection(){
  if(!event)return;
  const obs=kind==='quake'?event.observations.at(-1):event.observations[index];
  $('#location-name').textContent=event.title;$('#location-coordinates').textContent=`${Math.abs(obs.lat).toFixed(2)}°${obs.lat<0?'S':'N'} · ${Math.abs(obs.lon).toFixed(2)}°${obs.lon<0?'W':'E'} · ${labels[event.kind]}`;
  $('#scale-note').textContent=(event.kind==='volcano'&&/USGS/i.test(event.source.name)?'官方通报发布 ':'来源记录日期 ')+when(obs.timeUtc)+' UTC+8';
  $('#readouts').innerHTML=eventFactsMarkup(event,obs);
  $('#charts').innerHTML=eventSeriesMarkup(event,kind==='quake'?event.observations.length-1:index,feed);
  $('#chart-title').textContent=event.kind==='quake'?'震级、发生时间与深度':'原始报告位置与时间';$('#chart-domain').textContent='对应所选资料';
  $('#view-label').textContent=labels[event.kind]+' · '+short(obs.timeUtc);$('#view-mode').textContent=kind==='quake'?'截至所选发生时刻的目录点':'各事件日期不同 · 选中记录单独回放';
  $('#scene-caption').textContent=event.kind==='quake'?(kind==='quake'?'地震点按真实发生顺序出现，大小表示震级；不是震波、破坏范围或当地震感。':'各目录事件同时定位，日期各异；地震点大小表示震级，不代表震波或破坏范围。'):event.kind==='volcano'?'橙色符号定位火山报告。报告日期和状态在右侧；符号高度不代表灰柱、熔岩或喷发强度。':'青色点与连线对应已报告的位置，逐条回放；不生成报告之间的风场或云系。';
  $('#explanation').textContent=event.description||`${labels[event.kind]}资料回答事件在哪里、记录到何时。影响范围和变化原因需要相应的观测产品，不能由位置符号推出。`;
  const topic=event.kind==='quake'?'quake':event.kind==='volcano'?'volcano':'typhoon';
  $('#parameters').innerHTML=`<div class="live-evidence-actions"><a href="${escape(event.sourceDetailUrl||event.source.url)}" target="_blank" rel="noopener">查看这次事件的官方资料 ↗</a><button type="button" data-live-principle="${topic}">打开${labels[event.kind]}原理动画 →</button></div>`;
  $('#param-guide').textContent='原理动画解释机制，使用假设参数；不会冒充这次事件的实测画面。';
  $('#source-links').innerHTML=`<li><a href="${escape(event.sourceDetailUrl||event.source.url)}" target="_blank" rel="noopener">${escape(event.source.name)} · 当前事件 ↗</a></li>`+feed.sources.map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener">${escape(s.name)} · ${escape(s.coverageLabel)} ↗</a></li>`).join('');
  $('#stage-steps').innerHTML='<button type="button" data-live-step="first">第一条记录</button><button type="button" data-live-step="last">最近一条记录</button>';
  updateControls();renderList();
 }
 function selectEvent(id,pause=true){
  const selected=matching().find(e=>e.id===id);if(!selected)return;
  if(pause){playing=false;elapsed=0;}
  event=selected;index=kind==='quake'?ticks().findIndex(e=>e.id===id):event.observations.length-1;
  engine.setLiveTime(kind==='quake'?event.timeUtc:null);engine.selectLiveEvent(id,{focus:pause});engine.setLiveObservation(event.observations.length-1);renderSelection();
 }
 function selectTick(value,pause=true){
  const steps=ticks();if(!steps.length)return;
  if(pause){playing=false;elapsed=0;}
  index=Math.max(0,Math.min(steps.length-1,Math.trunc(Number(value)||0)));
  if(kind==='quake'){selectEvent(steps[index].id,pause);return;}
  engine.setLiveObservation(index);renderSelection();
 }
 function toggle(){if(ticks().length<2)return;if(index>=ticks().length-1)selectTick(0);playing=!playing;elapsed=0;updateControls();}
 function advance(dt,speed){if(!playing||!isActive())return;elapsed+=dt*speed;if(elapsed<.85)return;elapsed=0;if(index>=ticks().length-1){playing=false;updateControls();}else selectTick(index+1,false);}
 async function load(){
  const token=++request;renderStatus();
  if(feed){setKind(kind);renderStatus();return;}
  try{const response=await fetch('data/earth-events-snapshot.json');if(!response.ok)throw new Error('snapshot unavailable');const data=validateEventFeed(await response.json());if(token!==request)return;feed=data;receipt='已保存的官方资料';if(isActive()){setKind(kind);renderStatus();}}
  catch{if(token===request&&isActive())await refresh();}
 }
 async function refresh(){
  if(refreshing||!isActive())return;const token=++request;refreshing=true;renderStatus('正在向官方来源获取最新目录…');
  try{
   const data=validateEventFeed(await fetchEarthEvents());if(token!==request)return;const failed=data.sources.filter(s=>s.status!=='ok');if(failed.length)throw new Error(failed.map(s=>s.name).join('、')+'未成功返回');
   feed=data;receipt='本次从官方接口获取';if(isActive()){const previous=event?.id;setKind(kind);if(previous&&matching().some(e=>e.id===previous))selectEvent(previous);}
   refreshing=false;if(isActive())renderStatus();
  }catch{if(token!==request)return;refreshing=false;if(isActive())renderStatus(feed?'更新未完成，继续显示上次资料：'+when(feed.retrievedAtUtc)+' UTC+8。可再次重试。':'来源暂不可用，尚无可显示的资料。请稍后更新。');}
 }
 function enter(){
  playing=false;$('#live-toolbar').hidden=false;$('#live-view-tools').hidden=false;
  document.body.dataset.mode='live';document.body.dataset.replay='events';
  $('#header-data-kind').textContent='真实事件目录 · 可更新';$('.title-row .eyebrow').textContent='EARTH OBSERVATORY / EVENTS & EVIDENCE';$('.title-row h1').textContent='地球上发生了什么，依据在哪里？';
  $('#section-index').textContent='EVENTS / 官方资料';$('#topic-title').textContent='从位置进入事件';$('#topic-description').textContent='筛选地震、火山和热带气旋。选一个事件，查看实际时刻、数值与官方报告。';
  $('#readout-title').textContent='当前事件 · 原始记录';$('#conditions-title').textContent='继续了解';$('#reset-conditions').hidden=true;$('#open-local').hidden=true;$('#next-topic').hidden=true;$('#meaning-title').textContent='这些资料能回答什么';
  $('#visual-key').innerHTML='<span><i style="background:#aa9bff"></i>地震 · 大小按震级</span><span><i style="background:#ffa76d"></i>火山报告</span><span><i style="background:#79dce9"></i>气旋报告位置</span>';
  $('#footer-data-kind').textContent='资料：USGS / NASA EONET · 地理底图：NASA';$('#footer-data-scope').textContent='各来源更新时间和覆盖范围不同；缺项不补造';$('#export').textContent='导出当前事件与出处 ↓';
  $('#scope-introduction').innerHTML='<h3>从目录进入观测，再解释机制</h3><p>事件目录提供时间、位置和有出处的指标。点、标记与报告位置连线服务于定位；真实云图、灰柱、震动、污染羽流和设备内部状态需要各自的观测数据。</p><p>山竹案例保留高频真实云图与风雨潮位的同步复盘；过程原理页保留六类交互动画。页面下方列出各主题已经具备的能力与继续接入的条件。</p>';
  $('#limitation').textContent='目录可能修订，获取时间不等于事件发生时间或来源的更新时间。EONET开放状态不保证此刻正在喷发；位置点不代表强度、影响范围或真实风场。这里未提供即时预警。';
  $('.globe-coordinate span').textContent='真实经纬度 · 可旋转查看';$('#sources-panel summary').innerHTML='来源、覆盖范围与扩展条件 <span>＋</span>';
  renderFilters();load();
 }
 function leave(){++request;refreshing=false;playing=false;$('#live-toolbar').hidden=true;$('#live-view-tools').hidden=true;$('#next-topic').hidden=false;for(const id of ['timeline','play','restart','speed'])$('#'+id).disabled=false;}
 function exportCurrent(){if(!event)return;const record={kind:'source-backed-event-catalog',retrievedAtUtc:feed.retrievedAtUtc,event,selectedObservation:kind==='quake'?event.observations.at(-1):event.observations[index],directoryCutoffUtc:kind==='quake'?event.timeUtc:null,sources:feed.sources,presentation:'Location symbols and discrete original reports, not a measured hazard field.'};const link=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'}));link.href=url;link.download='earth-event-'+event.id.replace(/[^a-z0-9_-]/gi,'_')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 $('#layers').addEventListener('click',e=>{const b=e.target.closest('[data-live-kind]');if(b&&isActive()&&feed)setKind(b.dataset.liveKind);});
 $('#current-insight').addEventListener('click',e=>{const b=e.target.closest('[data-event-id]');if(b&&isActive())selectEvent(b.dataset.eventId);});
 $('#parameters').addEventListener('click',e=>{const b=e.target.closest('[data-live-principle]');if(b&&isActive())onPrinciple(b.dataset.livePrinciple);});
 $('#stage-steps').addEventListener('click',e=>{const b=e.target.closest('[data-live-step]');if(b&&isActive())selectTick(b.dataset.liveStep==='first'?0:ticks().length-1);});
 $('#live-search').addEventListener('input',e=>{if(!feed||!isActive())return;query=e.target.value.trim();playing=false;renderList();const events=matching();engine.setLiveEvents(events,selectEvent);events.length?selectEvent(events[0].id):showEmpty();});
 $('#live-refresh').addEventListener('click',refresh);
 $('#live-older').addEventListener('change',e=>{includeOlder=e.target.checked;if(feed&&isActive())setKind(kind);});
 $('#live-whole').addEventListener('click',()=>{engine.setLiveView('global');$('#live-whole').setAttribute('aria-pressed','true');$('#live-detail').setAttribute('aria-pressed','false');});
 $('#live-detail').addEventListener('click',()=>{engine.setLiveView('detail');$('#live-whole').setAttribute('aria-pressed','false');$('#live-detail').setAttribute('aria-pressed','true');});
 return {enter,leave,selectTick,toggle,advance,exportCurrent,setCategory(value){kind=Object.hasOwn(labels,value)?value:'all';if(feed)setKind(kind);},restart(){selectTick(0);playing=ticks().length>1;updateControls();}};
}
