import {validateDynamicEvent,dynamicTicks,dynamicSnapshot,sampleAt} from './dynamic-data.js';
import {dynamicEvents,getDynamicEvent,isDeviceEvent} from './dynamic-events.js';
import {createRiverEvidence,formatRiverElapsed} from './river-evidence.js';
import {createTideEvidence} from './tide-evidence.js';
import {formatTideUtc,formatPortClock} from './tide-observations.js';
import {createBatteryEvidence} from './battery-evidence.js';
import {formatBatteryElapsed} from './battery-observations.js';
import {createDieselEvidence} from './diesel-evidence.js';
import {formatDieselElapsed} from './diesel-observations.js';
import {dixieLayerLegend,renderDixieGuide,dixieSources,dixieWeatherWindow,renderDixieSectors,renderDixieWeather} from './dixie-evidence.js';
import {loadHungaTerrain,hungaSample} from './hunga-terrain-data.js';
import {renderHungaEvidence} from './hunga-terrain-evidence.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const appearances={volcano:['△','#ffb98b'],wildfire:['◇','#ffa266'],quake:['⌁','#b9b0ff'],storm:['◉','#88dce8'],river:['≈','#65dfce'],tide:['☾','#d6c5ff'],battery:['▤','#ffcd7d'],engine:['⚙','#f1b873']};
const localView=kind=>['river','tide','battery','engine'].includes(kind);
const elapsedClock=kind=>['river','battery','engine'].includes(kind);
const tickSeconds=tick=>typeof tick==='number'?tick:Date.parse(tick)/1000;
const integerFormat=new Intl.NumberFormat('zh-CN',{maximumFractionDigits:1});
const decimalFormat=new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2});
const timeFormat=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
const dateFormat=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'});
const number=v=>v==null?'缺测':(Math.abs(v)<10?decimalFormat:integerFormat).format(v);
const time=t=>timeFormat.format(new Date(t));
const short=t=>time(t).slice(6);
const utcClock=t=>t.slice(11,19);
const archiveDate=t=>t.slice(0,10);
function plot(samples,now,{color='#96dfeb',unit='',label='',height=70,window=null,discrete=false,maxAgeSeconds=0,dateOnly=false,clockUtc=false,missingTimes=[]}={}){
 const end=window?.[1]??Date.parse(samples.at(-1)?.timeUtc),start=window?.[0]??Date.parse(samples[0]?.timeUtc),visible=samples.filter(s=>Date.parse(s.timeUtc)>=start&&Date.parse(s.timeUtc)<=end);
 const values=visible.flatMap(p=>p.value==null?[]:[p.min??p.value,p.max??p.value]);let low=unit==='K'?Math.min(...values):Math.min(0,...values),high=Math.max(...values,0);if(!values.length){low=0;high=1;}if(high===low){high=low+1;}
 const pad=(high-low)*.08;low-=pad;high+=pad;
 const X=t=>8+(Date.parse(t)-start)/(end-start||1)*214,Y=v=>8+(high-v)/(high-low)*(height-24);
 // Pixel buckets preserve actual min/max instead of averaging away earthquake peaks.
 const buckets=new Map();for(const s of visible){if(s.value==null)continue;const x=Math.round(X(s.timeUtc));const b=buckets.get(x)||{min:Infinity,max:-Infinity};b.min=Math.min(b.min,s.min??s.value);b.max=Math.max(b.max,s.max??s.value);buckets.set(x,b);}
 const envelope=discrete?'':[...buckets].map(([x,b])=>`M${x} ${Y(b.min).toFixed(1)}V${Y(b.max).toFixed(1)}`).join(' ');
 let path='',prior=null;for(const s of visible){if(s.value==null){prior=null;continue;}
  const stamp=Date.parse(s.timeUtc),gap=prior!=null&&(stamp-prior>Math.max(2000,(end-start)/Math.max(1,visible.length)*2.2)||missingTimes.some(t=>prior<t&&t<stamp));path+=(prior&&!gap?'L':'M')+X(s.timeUtc).toFixed(1)+','+Y(s.value).toFixed(1);prior=stamp;}
 const cursor=X(now),selected=sampleAt(samples,now,discrete?maxAgeSeconds:0),dots=discrete?visible.filter(s=>s.value!==null).map(s=>`<circle cx="${X(s.timeUtc).toFixed(1)}" cy="${Y(s.value).toFixed(1)}" r="3" fill="${color}"/>`).join(''):'';
 const axisTime=value=>{
  const iso=new Date(value).toISOString();
  return dateOnly?iso.slice(5,10):clockUtc?utcClock(iso).slice(0,5):short(iso);
 };
 return `<svg viewBox="0 0 230 ${height}" role="img" aria-label="${esc(label)}，${dateOnly?'档案日期'+archiveDate(now):'同一时刻'+esc(clockUtc?utcClock(now)+' UTC':time(now))}"><path d="M8 ${Y(Math.max(low,Math.min(high,0))).toFixed(1)}H222 M8 8H222" stroke="#314655" stroke-width=".5"/><path d="${envelope}" stroke="${color}" opacity=".5" stroke-width="1"/><path d="${discrete?'':path}" stroke="${color}" opacity=".82" stroke-width="1.1" fill="none"/>${dots}<path d="M${cursor.toFixed(1)} 4V${height-13}" stroke="#fff0cf" stroke-width="1" stroke-dasharray="2 3"/>${selected?`<circle cx="${X(selected.timeUtc).toFixed(1)}" cy="${Y(selected.value).toFixed(1)}" r="2.5" fill="#fff0cf"/>`:''}<text x="8" y="${height-2}">${axisTime(start)}</text><text x="222" y="${height-2}" text-anchor="end">${axisTime(end)}</text><text x="222" y="12" text-anchor="end">${number(high-pad)} ${esc(unit)}</text></svg>`;
}
export function createDynamicPlayer(engine,{isActive,onRoute,onUpdate=()=>{},getExportContext=()=>null,onManualSeek=()=>null,onManualStation=()=>{},onWatch=()=>false}){
 let data=null,ticks=[],index=0,snapshot=null,selectedStation=null,playing=false,elapsed=0,request=0,playbackIntent=0,loading=false,displayReady=false,displayFailed=false,requestedTimeUtc=null,failureMessage='',kind='volcano',presentation='fusion',relief=true;
 let event=dynamicEvents.volcano,slug='volcano',watchPhase='',watchComplete=false,watchRun=0,watchTimer=null,watchObserver=null,stationButtons=new Map();
 let riverEvidence=null,tideEvidence=null,batteryEvidence=null,dieselEvidence=null,requestedElapsedSeconds=null,followRiver=false;
 let fireContext=null,fireMode='terrain',requestedFireMode='terrain',fireHour=16,fireGuide=null,fireWindManual=false;
 const fireGuideNote=$('#dixie-guide-note');
 let hungaMode=null,hungaSpot='crater',hungaData=null,hungaRequest=0;
 let hungaAngle='oblique',hungaLesson=null;
 let hungaWasGlobal=false;
 const cache=new Map();
 function updateDixieWind(){
  if(!snapshot||!fireContext)return;
  const current=snapshot.frame.archiveDate,previous=data.frames[index-1]?.archiveDate;
  const window=dixieWeatherWindow(previous,current),slider=$('#dixie-hour');
  slider.max=window.lastHour;slider.value=fireHour;
  const fireReadings=renderDixieWeather($('#current-insight'),fireContext,previous,current,fireHour);
  const stamp=$('#current-insight').dataset.windHour;
  const local=new Date(Date.parse(stamp)-7*3600000).toISOString().slice(5,16).replace('T',' ');
  $('#dixie-hour-value').textContent=local+' PDT';
  slider.setAttribute('aria-valuetext',local+' PDT');
  const sectors=fireContext.frames[current].sectors.filter(s=>s.areaKm2>=10&&s.start);
  const showWind=!fireGuide||fireGuide==='wind'||fireWindManual;
  engine.setDixieSymbols(showWind?fireReadings:[],sectors);
  fireGuideNote.innerHTML=renderDixieGuide(fireGuide,previous,current,fireContext.frames[current].sectors,fireReadings,local);
  fireGuideNote.hidden=!fireGuideNote.innerHTML;
 }
 function setDixieGuide(phase){
  if(phase===fireGuide)return;
  fireGuide=phase;fireWindManual=false;
  if(fireContext&&snapshot)updateDixieWind();
  else fireGuideNote.hidden=true;
 }
 function controls(){
  $('#hunga-terrain-toggle').disabled=kind!=='volcano'||!snapshot;
  $('#timeline').min=0;$('#timeline').max=Math.max(0,ticks.length-1);$('#timeline').step=1;
  if(!$('#timeline').dataset.touchScrubbing)$('#timeline').value=loading&&pendingSeekIndex!=null?pendingSeekIndex:index;
  $('#timeline').setAttribute('aria-label','真实观测共同时间');$('#timeline').disabled=!ticks.length;
  $('#play').disabled=!ticks.length;$('#restart').disabled=!ticks.length;$('#speed').disabled=!ticks.length;
  $('#observation-data-retry').hidden=!displayFailed||loading;
  if($('#speed').options)for(const option of $('#speed').options){
   const ratio=Number(option.value)*(kind==='engine'?3:1);if(option.textContent!==ratio+'×')option.textContent=ratio+'×';
  }
  const running=playing||Boolean(watchPhase);
  $('#play').textContent=running?'Ⅱ':'▶';$('#play').setAttribute('aria-label',watchPhase==='locating'?'暂停开场':running?'暂停真实过程':'播放真实过程');
  const scanUtc=kind==='storm'||kind==='volcano';
  const clock=kind==='wildfire'?archiveDate:kind==='engine'?formatDieselElapsed:kind==='battery'?formatBatteryElapsed:kind==='river'?formatRiverElapsed:kind==='tide'?formatTideUtc:scanUtc?utcClock:time;
  $('#time-label').textContent=loading?'正在载入观测…':kind==='engine'?'台架经过时间 · 0.1 秒采样':kind==='battery'?'实验共同时间 · 放电经过时间':kind==='tide'?'共同时间 · UTC · 每 6 分钟':kind==='river'?'实验共同时间 · 相对释放 · 每30秒采样':kind==='quake'?'共同时间 · 1秒窗末 · UTC+8':scanUtc?'共同时间 · 名义扫描时刻 · UTC':'共同时间 · 名义扫描时刻 · UTC+8';
  $('#time-value').textContent=snapshot?clock(snapshot.timeUtc??snapshot.elapsedSeconds)+' · '+(index+1)+'/'+ticks.length:'正在读取观测资料';
  $('#time-start').textContent=ticks.length?clock(ticks[0]):'';$('#time-end').textContent=ticks.length?clock(ticks.at(-1)):'';
  $('#dynamic-status').textContent=loading?(localView(kind)?'正在准备对应观测…':'载入观测中 · 时钟等待影像就绪'):displayFailed?failureMessage||'该帧未能显示，请重试；未用别的时刻替代。':snapshot?(kind==='engine'?'原始台架档案 · 18,000 笔采样':kind==='battery'?'NASA 原始采样 · 端电压 / 输出电流 / 电池温度':kind==='tide'?'JPL 星历 · NOAA 实测与预报':kind==='river'?'实地荧光计 · 3 个断面 × 2 岸':kind==='quake'?'原始波形 · 1秒窗峰值与包络':'逐张真实扫描 · 无形变补帧'):'正在读取资料';
  if(kind==='wildfire'){
   $('#time-label').textContent='航空红外档案日期 · 逐期切换';
   if(!loading&&!displayFailed&&snapshot)$('#dynamic-status').textContent='航空红外边界 · 9 期原档';
  }
  if(hungaMode){
   $('#time-label').textContent='拖动切回当天红外扫描 · UTC';
   if(!loading&&!displayFailed)$('#dynamic-status').textContent='NIWA 海底测绘 · 两期独立资料';
  }
  if(kind==='volcano'&&data)$('#dynamic-summary').textContent=hungaMode?'汤加 · 喷发前后两期实测地形':data.subtitle;
  for(const button of $('#dynamic-controls').querySelectorAll('[data-presentation]'))button.setAttribute('aria-pressed',String(presentation===button.dataset.presentation));
  $('#dynamic-relief').setAttribute('aria-pressed',String(relief));
  if(kind==='tide'&&snapshot){
   const overview=$('#dynamic-full').getAttribute('aria-pressed')==='true';
   $('#view-mode').textContent=overview?'地月总览 · 月球大小与距离按显示比例':'港口当地 '+formatPortClock(snapshot.timeUtc);
   if(watchPhase==='locating')$('#dynamic-status').textContent=overview?'先看地球、月球与验潮站 · 画面停在当前时刻':'镜头正靠近旧金山港 · 到达后开始播放';
  }
  $('#observation-followup').hidden=!watchComplete;
  const watch=$('#observation-watch');
  watch.hidden=!event.watch;watch.disabled=!ticks.length;
  watch.setAttribute('aria-pressed',String(Boolean(watchPhase)));
  const device=isDeviceEvent(event);
  if(watchPhase==='locating')watch.textContent=device?'暂停 · 准备回放':'暂停 · 正在定位';
  else if(watchPhase==='playing')watch.textContent=device?'暂停回放':'暂停观察';
  else watch.textContent=device?'▶ 播放实验片段':kind==='tide'?'▶ 重看地球到港口':'▶ 从地球开始观察';
  onUpdate();
 }
 function display(){
  if(!snapshot||!data)return;
  const river=kind==='river',tide=kind==='tide',battery=kind==='battery',diesel=kind==='engine',date=snapshot.timeUtc,tick=date??snapshot.elapsedSeconds;
  const scanUtc=kind==='storm'||kind==='volcano';
  $('#earth-view').dataset.observedTime=tick;
  $('#view-label').textContent=data.title+' · '+(diesel?formatDieselElapsed(tick):battery?formatBatteryElapsed(tick):river?formatRiverElapsed(tick):tide?formatTideUtc(tick)+' UTC':scanUtc?utcClock(date).slice(0,5)+' UTC':short(date));
  $('#view-mode').textContent=diesel?'原档台架记录 · 发动机结构示意':battery?'NASA 实测读数 · 电芯结构示意':river?'2021 年 8 月 · 实地示踪':tide?'港口当地 '+formatPortClock(tick):scanUtc?archiveDate(date):dateFormat.format(new Date(date))+' UTC+8';
  if(kind==='volcano'&&!hungaMode)$('#view-mode').textContent='卫星实测 · '+$('#view-mode').textContent;
  $('#location-name').textContent=event.location;
  $('#location-coordinates').textContent=(battery||diesel)?'':`${Math.abs(data.focus.lat).toFixed(2)}°${data.focus.lat<0?'S':'N'} · ${Math.abs(data.focus.lon).toFixed(2)}°${data.focus.lon<0?'W':'E'}`;
  $('#scale-note').textContent=diesel?'台架经过 '+formatDieselElapsed(tick):battery?'放电经过 '+formatBatteryElapsed(tick):river?'原档本地钟 '+snapshot.localTime.replace('T',' '):date.replace('T',' ').replace('Z',' UTC');
  $('#readouts').dataset.observedTime=tick;$('#charts').dataset.observedTime=tick;$('#current-insight').dataset.observedTime=tick;
  if(kind==='volcano'&&hungaMode){
   for(const id of ['earth-view','readouts','charts','current-insight'])delete $('#'+id).dataset.observedTime;
   renderHungaEvidence($,hungaData,hungaMode,hungaSpot);
  }else if(river){
   riverEvidence.render(data,snapshot,selectedStation);
  }else if(tide){
   tideEvidence.render(data,snapshot);
  }else if(battery){
   batteryEvidence.render(data,snapshot);
  }else if(diesel){
   dieselEvidence.render(data,snapshot);
  }else if(data.kind==='quake'){
   const station=data.stations.find(s=>s.id===selectedStation)||data.stations[0],reading=snapshot.stations.find(s=>s.id===station.id),sample=reading?.sample;
   if(!stationButtons.size){
    $('#current-insight').innerHTML='<div class="panel-label">切换实测台站</div><div class="dynamic-stations">'+data.stations.map(s=>`<button type="button" data-station="${esc(s.id)}"><span>${esc(s.id.split('.').slice(0,2).join('.'))}<small></small></span></button>`).join('')+'</div>';
    stationButtons=new Map([...$('#current-insight').querySelectorAll('[data-station]')].map(button=>[button.dataset.station,button]));
   }
   for(const reading of snapshot.stations){
    const button=stationButtons.get(reading.id);if(!button)continue;
    button.setAttribute('aria-pressed',String(reading.id===station.id));
    button.querySelector('small').textContent=number(reading.sample?.value)+' counts';
   }
   $('#readouts').innerHTML=`<div class="dynamic-kicker">${esc(station.id)}</div><div class="dynamic-value">${number(sample?.value)}<small>counts</small></div><p class="dynamic-value-note">这一秒偏离震前基线最多的采样值，保留正负。</p><div class="dynamic-pair" data-observation-secondary><span>窗内最小<b>${number(sample?.min)}</b></span><span>窗内最大<b>${number(sample?.max)}</b></span></div><div class="dynamic-record-time" data-observation-secondary>窗末 ${time(date)} UTC+8${sample?.peakTimeUtc?'<br>峰值采样 '+sample.peakTimeUtc.replace('T',' ').replace('Z',' UTC'):''}</div>`;
   const ms=Date.parse(date),start=Math.max(Date.parse(data.startUtc),Math.min(ms-60000,Date.parse(data.endUtc)-120000));
   $('#charts').innerHTML=`<div class="dynamic-chart" data-observation-primary><div class="chart-label">${esc(station.id)} · 两分钟局部波形</div>${plot(station.samples,date,{color:'#baaaff',unit:'counts',label:station.id,window:[start,start+120000],height:112})}</div><div class="dynamic-chart" data-observation-secondary><div class="chart-label">完整观测窗 · 同一台站</div>${plot(station.samples,date,{color:'#80dddc',unit:'counts',label:station.id,height:86})}</div><p class="dynamic-chart-note" data-observation-secondary>主画面的测点刻线为当前一秒窗的实测最小和最大计数。与震前首个有效窗对照的是绝对峰值，刻度按本站全段最大绝对计数固定。counts 用于查看本站记录随时间的变化。</p>`;
   $('#scene-caption').textContent='看各台站的真实波形怎样先后起伏。测点青色为正、紫色为负，金点标记当前一秒窗中偏离震前基线最多的采样。';
   $('#explanation').textContent='拖动同一时钟，地球与当前台站的曲线一起变化。选择左侧另一台站，比较波形出现的时刻和形状。counts 是仪器计数。';
  }else if(kind==='wildfire'){
   const frame=snapshot.frame;
   const previous=data.frames[index-1];
   $('#view-label').textContent='Dixie 山火 · '+frame.archiveDate;
   $('#view-mode').textContent='航空红外边界 · '+(fireMode==='fuel'?'LANDFIRE 火前植被':fireMode==='terrain'?'USGS 高程与地形阴影':'USGS 地形地图');
   $('#scale-note').textContent='原档日期 '+frame.archiveDate+' · 具体时刻未核实';
   if(fireContext){
    $('#dixie-controls').hidden=false;
    for(const button of $('#dixie-controls').querySelectorAll('[data-fire-mode]'))button.setAttribute('aria-pressed',String(button.dataset.fireMode===fireMode));
    $('#dixie-layer-key').innerHTML=dixieLayerLegend(fireContext,fireMode);
    updateDixieWind();
   }else $('#current-insight').innerHTML=`<div class="panel-label">同一期航空红外边界</div><figure class="dynamic-original"><img src="${esc(frame.url)}" alt="Dixie 山火制图边界"/><figcaption>${frame.archiveDate} · 测站与地形图层暂未载入</figcaption></figure>`;
   $('#readouts').innerHTML=snapshot.metrics.map(metric=>`<div class="dynamic-metric" data-observation-primary data-story-target="${esc(metric.id)}"><span>${esc(metric.label)}</span><strong style="color:${appearances.wildfire[1]}">${metric.sample?number(metric.sample.value):'无前期对照'}<small>${metric.sample?'km²':''}</small></strong></div>`).join('');
   $('#charts').innerHTML=data.series.map(series=>`<div class="dynamic-chart" data-observation-primary data-series="${esc(series.id)}"><div class="chart-label">${esc(series.label)} <b>km²</b></div>${plot(series.samples,date,{color:series.color,unit:series.unit,label:series.label,height:76,discrete:true,dateOnly:true})}</div>`).join('');
   const sectors=fireContext?.frames[frame.archiveDate].sectors??[];
   $('#charts').innerHTML+=renderDixieSectors(sectors);
   $('#scene-caption').textContent=previous?'橙色为两期之间新划入的范围。实线箭头从测站指向风吹去的方向；虚线指向新划入的区域。测站时钟与制图日期分别标注。':'金线圈出首期制图边界。实线箭头从测站指向风吹去的方向。';
   $('#explanation').textContent=sectors.length?'解释｜北侧与东侧新增范围最大。8 月 5 日下午三个测站多次记录到朝东侧吹的风，与东侧扩展方向相符。北侧和东侧的坡度与植被组成不同，现有记录只能比较这些条件，无法确定各因素对扩展的贡献。':'比较橙色区域和附近测站的风。风记录可逐小时查阅；航空红外档案只提供制图日期。';
  }else{
   const frame=snapshot.frame,metrics=snapshot.metrics;
   const stamp=t=>utcClock(t)+' UTC';
   const missingTimes=(data.missingOriginalScans??[]).map(item=>Date.parse(item.timeUtc));
   $('#current-insight').innerHTML=`<div class="panel-label">与地球完全相同的一帧</div><figure class="dynamic-original"><img src="${esc(frame.url)}" alt="${esc(data.title)}所选UTC时刻的同帧红外亮温派生图"/><figcaption>${stamp(date)}<br>180 K 白 → 310 K 黑 · 非可见光</figcaption></figure><div class="dynamic-frame-note">${frame.scanStartUtc?'扫描 '+frame.scanStartUtc.slice(11,19)+'–'+frame.scanEndUtc.slice(11,19)+' UTC':'观测日期 '+date}</div>`;
   const byPriority=(a,b)=>Number(event.primary.includes(b.id))-Number(event.primary.includes(a.id));
   const evidence=id=>event.primary.includes(id)?'data-observation-primary':'data-observation-secondary';
   $('#readouts').innerHTML=[...metrics].sort(byPriority).map(m=>`<div class="dynamic-metric" ${evidence(m.id)} data-story-target="${esc(m.id)}"><span>${esc(m.label)}</span><strong style="color:${appearances[kind][1]}">${number(m.sample?.value)}<small>${esc(m.unit)}</small></strong><small>${m.sample?stamp(m.sample.timeUtc):'该时刻缺少有效资料'}</small></div>`).join('');
   if(snapshot.track)$('#readouts').innerHTML+=`<div class="dynamic-track-reading" data-observation-secondary>最近官方分析：${snapshot.track.timeUtc.replace('T',' ').replace('Z',' UTC')}<br>中心风 ${number(snapshot.track.windKt)} kt · 气压 ${number(snapshot.track.pressureHpa)} hPa<br><small>事后最佳路径分析；与扫描时间分开标注</small></div>`;
   $('#charts').innerHTML=[...(data.series||[])].sort(byPriority).map(series=>`<div class="dynamic-chart" ${evidence(series.id)} data-series="${esc(series.id)}"><div class="chart-label">${esc(series.label)} <b>${esc(series.unit)}</b></div>${plot(series.samples,date,{color:series.color||appearances[kind][1],label:series.label,unit:series.unit,height:76,window:[Date.parse(data.startUtc),Date.parse(data.endUtc)],discrete:series.id==='windKt'||series.id==='pressureHpa',maxAgeSeconds:series.maxAgeSeconds??0,clockUtc:true,missingTimes})}<p data-observation-secondary>${esc(series.method||'由对应时刻的原始数值资料计算')}</p></div>`).join('');
   $('#scene-caption').textContent=data.kind==='volcano'?'真实红外扫描显示喷发附近低温云区的扩展。纹理光照帮助辨认层次，不表示测得的云高；红外云区也包含气象云。':'真实红外扫描显示云带移动与结构变化。路径点使用最近一次官方分析，时间单独标明；云图不是降雨量或风速场。';
   $('#explanation').textContent=data.kind==='volcano'?'把喷发前后相邻扫描连起来观察，再对照固定统计区域的低温区域面积与亮温变化。低温区不是火山灰浓度，不能仅凭这一通道区分灰云和气象云。':'卫星扫描负责呈现云系，固定区域统计反映这段云图怎样变化；官方路径给出中心位置与强度。它们共享回放时钟，同时保留各自真实观测或分析时刻。';
   $('#chart-domain').textContent='UTC · 虚线为名义扫描时刻';
   if(kind==='volcano'){
    $('#topic-title').textContent=data.title;
    $('#readout-title').textContent='当前时刻 · 真实观测';
    $('#chart-title').textContent='与云图同一时钟';
    $('#visual-key').innerHTML='<span><i style="background:#e6f4ff"></i>较冷区域</span><span><i style="background:#70a7d0"></i>较暖区域</span><span>180–310 K · 固定映射</span>';
   }
  }
  $('#limitation').textContent=(data.limitations||[]).join(' ');controls();
 }
 function indexFor(value){return Math.max(0,Math.min(ticks.length-1,Math.trunc(Number(value)||0)));}
 let pendingSeekIndex=null, failedFrame=null;
 function requestSeek(value){
  const tick=ticks[indexFor(value)];
  const guided=tick==null?null:onManualSeek(tick);
  if(guided)return guided;
  if(hungaMode)setView('detail');
  return select(value);
 }
 async function select(value,{pause=true,dixieMode,dixieHour}={}){
  if(!data||!ticks.length||!isActive())return false;if(pause){watchComplete=false;stopWatch();++playbackIntent;playing=false;elapsed=0;}
  const next=indexFor(value),token=++request;
  pendingSeekIndex=pause?next:null;
  failedFrame=null;
  const nextSnapshot=dynamicSnapshot(data,ticks[next]);requestedTimeUtc=nextSnapshot.timeUtc??null;requestedElapsedSeconds=nextSnapshot.elapsedSeconds??null;
  if(fireContext&&dixieMode)requestedFireMode=dixieMode;
  const mode=requestedFireMode;
  if(fireContext)nextSnapshot.fireLayer=fireContext.frames[nextSnapshot.frame.archiveDate].layers[mode];
  loading=true;displayReady=false;displayFailed=false;failureMessage='';
  if((kind!=='quake'&&!localView(kind))||!snapshot||pause)controls();
  let ok=false;try{ok=await engine.setDynamicSnapshot(nextSnapshot);}catch{}if(token!==request||!isActive())return false;
  loading=false;pendingSeekIndex=null;displayFailed=!ok;if(!ok){
   failedFrame={index:next,mode,dixieHour};
   if(fireContext)requestedFireMode=fireMode;
   stopWatch();playing=false;failureMessage='该帧未能显示，请重试；未用别的时刻替代。';controls();return false;
  }
  if(fireContext){
   if(dixieHour!=null||index!==next||!snapshot)fireHour=dixieHour??16;
   fireMode=mode;
  }
  index=next;snapshot=nextSnapshot;displayReady=true;
  if(kind==='river'&&followRiver&&watchPhase==='playing'){
   const activeSection=event.moments.findLast(([time,,id])=>id&&time<=snapshot.elapsedSeconds)?.[2]??data.transects[0].id;
   if(activeSection!==selectedStation){selectedStation=activeSection;engine.selectDynamicStation(activeSection);}
  }
  display();
  if(data.frames){
   const lookahead=matchMedia('(pointer: coarse)').matches?1:3;
   engine.preloadDynamicFrames(data.frames.slice(next+1,next+1+lookahead));
  }
  return true;
 }
 async function enter(which,{watch=false,openGlobal=false}={}){
  const chosen=getDynamicEvent(which);if(!chosen)return false;
  pendingSeekIndex=null;failedFrame=null;
  stopWatch();watchComplete=false;riverEvidence?.reset();tideEvidence?.reset();batteryEvidence?.reset();dieselEvidence?.reset();event=chosen;slug=which;kind=event.kind;data=null;snapshot=null;ticks=[];index=0;elapsed=0;selectedStation=null;stationButtons=new Map();
  fireContext=null;fireMode=requestedFireMode='terrain';fireHour=16;setDixieGuide(null);
  $('#dixie-controls').hidden=true;
  $('#hunga-terrain-toggle').hidden=kind!=='volcano';
  clearHungaTerrain();
  playing=false;loading=true;displayReady=false;displayFailed=false;requestedTimeUtc=null;requestedElapsedSeconds=null;failureMessage='';++playbackIntent;const token=++request;
  const river=kind==='river',tide=kind==='tide',battery=kind==='battery',diesel=kind==='engine',local=localView(kind);
  const device=isDeviceEvent(chosen);
  if(local){
   const elements={insight:$('#current-insight'),readouts:$('#readouts'),charts:$('#charts')};
   if(river)riverEvidence??=createRiverEvidence(elements);
   else if(tide)tideEvidence??=createTideEvidence({...elements, focus:$('#tide-focus-evidence')});
   else if(battery)batteryEvidence??=createBatteryEvidence(elements);
   else dieselEvidence??=createDieselEvidence(elements);
   if(tide){
    $('#observation-stage').after($('.timeline'),$('#observation-flow-controls'));
    $('#observed-story-legend').after($('#observed-keyframes'));
   }else $('#observation-flow-controls').after($('#observed-keyframes'),$('.timeline'));
  }
  const autoWatch=Boolean(watch&&chosen.watch);
  if(autoWatch)watchPhase='locating';
  const openingWatch=watchRun;
  engine.setDynamicData(null);engine.setDynamicMode(true);delete $('#earth-view').dataset.observedTime;
  document.body.dataset.mode='dynamic';document.body.dataset.replay='dynamic';document.body.dataset.dynamicKind=kind;
  $('#dynamic-toolbar').hidden=false;$('#dynamic-view-tools').hidden=false;$('#dynamic-controls').hidden=false;
  $('#dynamic-full').hidden=device;
  $('#layers').setAttribute('aria-label',device?'实验与设备场景':'地球过程图层');
  const entries=Object.entries(dynamicEvents).filter(([,item])=>isDeviceEvent(item)===device);
  $('#layers').innerHTML='';
  $('#observation-flow-controls').hidden=false;$('#observation-event-picker').hidden=false;
  $('#observation-event-select').innerHTML=entries.map(([id,item])=>`<option value="${id}">${esc(item.label)}</option>`).join('');
  $('#observation-event-select').value=slug;
  document.body.classList?.add('observation-flow-active');
  document.documentElement.style.setProperty('--active',appearances[kind][1]);$('.title-row .eyebrow').textContent='OBSERVED / ONE CLOCK · REAL CHANGE';$('.title-row h1').textContent=event.headline;
  $('#header-data-kind').textContent='真实观测 · 同步回放';$('#section-index').textContent='OBSERVATION / '+kind.toUpperCase();$('#topic-title').textContent=event.label;$('#topic-description').textContent='正在读取事件的原始观测与时间资料。';$('#conditions-title').textContent='核对原始依据';
  $('#reset-conditions').hidden=true;$('#open-local').hidden=true;$('#next-topic').hidden=true;$('#open-conclusion').hidden=true;$('#meaning-title').textContent='把画面与证据对应起来';$('#readout-title').textContent='当前时刻 · 真实观测';$('#chart-title').textContent='与画面同一时钟';$('#chart-domain').textContent='金线 = 当前时刻';
  $('#current-insight').innerHTML='';$('#readouts').innerHTML='';$('#charts').innerHTML='';$('#parameters').innerHTML='';$('#stage-steps').innerHTML='';$('#scene-caption').textContent='正在载入所选事件的真实观测。';$('#explanation').textContent='';$('#source-links').innerHTML='';$('#limitation').textContent='';$('#dynamic-summary').textContent=event.label+' · 读取观测资料';$('#view-label').textContent='读取真实观测中';$('#view-mode').textContent='';$('#scale-note').textContent='';$('#location-name').textContent='';$('#location-coordinates').textContent='';for(const id of ['readouts','charts','current-insight'])delete $('#'+id).dataset.observedTime;
  $('#dynamic-controls').classList.toggle('waveform-mode',kind==='quake'||kind==='wildfire'||local);$('#dynamic-relief').hidden=kind==='quake'||kind==='wildfire'||local;
  $('#dynamic-close').textContent=diesel?'发动机近景':battery?'电芯近景':river?'靠近河段':tide?'港口视角':'过程特写 · 局部';
  $('#visual-key').innerHTML=river?'<span><i style="background:#65dfce"></i>左岸</span><span><i style="background:#f0bf70"></i>右岸</span><span>柱高对应实测浓度 · 共用 ppb 尺度</span>':kind==='quake'?'<span><i style="background:#8af2e5"></i>正计数偏差</span><span><i style="background:#d0b9ff"></i>负计数偏差</span><span><i style="background:#ffdf9d"></i>窗内峰值</span><span><i style="border:1px solid #ffcc87"></i>震中</span>':'<span><i style="background:#e6f4ff"></i>较冷区域</span><span><i style="background:#70a7d0"></i>较暖区域</span><span>180–310 K · 固定映射</span>';
  $('#footer-data-kind').textContent='原始观测：JMA / NOAA / EarthScope / USGS';$('#footer-data-scope').textContent='历史实测事件 · 不补造观测 · 非当前灾害监测';$('#export').textContent='导出此刻观测与来源 ↓';
  $('#param-guide').textContent='每次选择同步更新地球、图表和读数；图像未就绪时，播放时钟等待。';$('.globe-coordinate span').textContent=device?'':'真实观测注册 · 经纬度定位';
  $('#scope-introduction').innerHTML='<h3>从实测记录进入真实过程</h3><p>各事件保留真实UTC时间。卫星画面由标定、重投影后的观测栅格驱动；台站动态由原始波形的1秒窗峰值驱动。没有用独立视频替代地球图层。</p><p>相机和纹理光照改善可读性，不增加测量维度；未经观测的三维灰浓度、地表位移和风场不补造。</p>';
  if(kind==='wildfire'){
   $('#dynamic-close').textContent='山火边界近景';
   $('#readout-title').textContent='本期档案 · 制图面积';
   $('#chart-title').textContent='与地图同一期';
   $('#chart-domain').textContent='圆点 = 一期原档';
   $('#visual-key').innerHTML='<span><i style="background:#ffcf75"></i>本期边界</span><span><i style="background:#7cbded"></i>上一可用边界</span><span><i style="background:#f2551c"></i>本期新划入</span><span><i style="background:#497da9"></i>前期有、本期无</span>';
   $('#scope-introduction').innerHTML='<h3>先看测绘变化，再检验原因</h3><p>边界源于 NIFC 航空红外档案，按原文件名日期排列。右图的圆点各对应一期边界。坡度以 USGS 3DEP 高程栅格计算，植被采用 LANDFIRE 2016 Remap 的火前分类。</p><p>附近 HADS 测站保留各自的原始风速和风向。风的实线箭头只代表站点读数；新增范围的虚线箭头用于指认两期制图差异。精确飞行时间、火线附近阵风、燃料湿度和扑救活动仍需其他记录。</p>';
   $('#footer-data-kind').textContent='NIFC 航空红外 · NWS HADS 测站 · USGS 3DEP · LANDFIRE';
   $('#footer-data-scope').textContent='历史事件 · 档案日期 · 相邻可用边界对比';
   $('#param-guide').textContent='选一期边界，再逐小时查看同一日期区间的测站风。8 月 2 日和 3 日缺少边界原档。';
  }else if(river){
   $('#scope-introduction').innerHTML='<h3>沿原始采样时序回放野外示踪实验</h3><p>相对时间以原表推定的释放参考时刻为零点，另列原档本地钟。底图用于定位，读数来自六台实地荧光计。</p>';
   $('#footer-data-kind').textContent='USGS · Big Piney 实地示踪与 The National Map';
   $('#param-guide').textContent='每个断面两岸各有一个测点，30 秒采样。点击断面切换右侧曲线。';
   $('#scene-caption').textContent='USGS 航拍底图定位河段，青色与金色柱分别对应左岸、右岸实测浓度。';
   $('#explanation').textContent='先看断面 1 的信号抬升，再看更下游的断面 2 和 3。持续信号取连续三次达到 3 ppb 的首个采样点；峰值取各岸记录中的最高值。';
  }else if(tide){
   $('#readout-title').textContent='同刻潮位对照';
   $('#chart-domain').textContent='白色竖线 = 当前时刻';
   $('#visual-key').innerHTML='<span><i style="background:#d6c5ff"></i>JPL 月球星历</span><span><i style="background:#68e0d4"></i>NOAA 实测水线</span><span>港口示意 · 垂直变化放大</span>';
   $('#scope-introduction').innerHTML='<h3>一个港口，三组同刻记录</h3><p>以 2025-01-15 UTC 日期对齐 JPL Horizons 星历与 NOAA CO-OPS 的实测水位、调和预报。港口的当地日期与时间单独列出。</p>';
   $('#footer-data-kind').textContent='NASA/JPL Horizons · NOAA CO-OPS · USGS The National Map';
   $('#footer-data-scope').textContent='历史六分钟刻度 · 月球星历为计算值 · 港口潮位相对 MLLW';
   $('#param-guide').textContent='验潮站 9414290。港口视图用地平线读高度，左右方向用方位角读数。';
   $('#scene-caption').textContent='月球位置来自 JPL 星历，岸边水线由 NOAA 实测驱动。港口为示意，垂直变化已放大。预报见潮位对照。';
   $('#explanation').textContent='月升、月落看左侧星历是否跨过 0°。涨潮、落潮看右侧验潮站水位的变化方向。要解释实测与预报的差值，还需要当地海况资料。';
  }else if(diesel){
   $('#readout-title').textContent='当前时刻 · 台架记录';
   $('#visual-key').innerHTML='<span><i style="background:#72d9f1"></i>实测转速</span><span><i style="background:#ffc074"></i>实测扭矩</span><span><i style="background:#f3a4ce"></i>原档轨压</span><span>发动机剖面 · 结构示意</span>';
   $('#scope-introduction').innerHTML='<h3>在同一台架记录上比较转速、扭矩与轨压</h3><p>吉林大学发布的 ETC 台架原档共 18,000 笔记录。转速、扭矩和轨压使用同一行，经过时间按论文标明的 0.1 秒采样间隔从第 1 行起算。</p>';
   $('#footer-data-kind').textContent='吉林大学 · 柴油机 ETC 台架数据';
   $('#footer-data-scope').textContent='研究回放 · 结构为示意 · 本机数据';
   $('#param-guide').textContent='章节点直达原档采样。点画面上的变化标注，可以突出两侧对应曲线。';
   $('#scene-caption').textContent='曲轴和活塞按实测转速慢放，位置为结构示意。仪表显示当前采样，画面上方的原档标注比较关键采样。';
   $('#explanation').textContent='扭矩归零时，轨压已经下降，转速仍接近 3,200 rpm。轨压在片段内先达到低点，转速随后降至全程最低。论文未注明 RP 是传感器读数还是控制设定。';
  }else if(battery){
   $('#visual-key').innerHTML='<span><i style="background:#74d9ef"></i>端电压</span><span><i style="background:#f4c17d"></i>输出电流</span><span><i style="background:#f5a093"></i>电池温度</span><span>电芯剖面 · 结构示意</span>';
   $('#scope-introduction').innerHTML='<h3>从原始采样看首次放电</h3><p>按 NASA 档案的放电经过时间回放。电压、电流、温度都来自同一笔原始采样。剖面展示典型圆柱电芯结构。</p>';
   $('#footer-data-kind').textContent='NASA Ames PCoE · B0005 首次放电';
   $('#footer-data-scope').textContent='NASA 档案采样 · 剖面为结构示意';
   $('#param-guide').textContent='电流按原档保留正负，温度为实验记录的单点读数。';
   $('#scene-caption').textContent='近景显示典型圆柱电芯剖面，外侧仪表由同一笔 NASA 采样驱动。';
   $('#explanation').textContent='看输出电流进入约 −2 A 后，端电压怎样下降、温度怎样升高。再比较电流回近零后的电压回升与温度回落。';
  }
  $('#sources-panel summary').innerHTML='原始来源、统计方法与缺测说明 <span>＋</span>';controls();
  try{
   let loaded=cache.get(chosen.id);
   if(!loaded){
    const response=await fetch(chosen.url);
    if(!response.ok)throw new Error(chosen.localOnly&&response.status===404?'缺少本机研究数据，请按项目说明从原档导入':'资料未载入');
    loaded=validateDynamicEvent(await response.json());
    if(loaded.kind!==chosen.kind)throw new Error('事件类型与资料不符');
    if(loaded.id!==chosen.id)throw new Error('事件标识与资料不符');
    cache.set(chosen.id,loaded);
   }
   const context=chosen.contextUrl?await fetch(chosen.contextUrl).then(res=>res.ok?res.json():null).catch(()=>null):null;
   if(token!==request||!isActive())return false;
   fireContext=context;
   data=loaded;ticks=dynamicTicks(data);selectedStation=data.stations?.[0]?.id??data.transects?.[0]?.id??null;
   engine.setDynamicData(data);engine.setDynamicMode(true);engine.setDynamicPresentation(presentation);engine.setDynamicRelief(relief);
   $('#topic-title').textContent=data.title;$('#topic-description').textContent=data.description;$('#dynamic-summary').textContent=data.subtitle||chosen.label;
   const extraSources=fireContext?dixieSources:kind==='volcano'?[{name:'NIWA 汤加喷发前后实测测深栅格',url:'https://zenodo.org/records/7456324'}]:[];
   $('#source-links').innerHTML=[...data.sources,...extraSources].map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} ↗</a></li>`).join('');
   const mainSources=kind==='volcano'?[...extraSources,...data.sources.slice(0,1)]:data.sources.slice(0,2);
   $('#parameters').innerHTML=`<div class="dynamic-evidence">${mainSources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} ↗</a>`).join('')}</div>`;
   const middle=kind==='wildfire'?ticks.length-1:local?ticks.indexOf(chosen.watch.from):Math.round((ticks.length-1)*(kind==='quake'?.25:.5));
   $('#stage-steps').innerHTML=`<button type="button" data-dynamic-step="0">起始观测</button><button type="button" data-dynamic-step="${middle}">过程展开</button><button type="button" data-dynamic-step="${ticks.length-1}">最后观测</button>`;
   const start=autoWatch&&openingWatch===watchRun?ticks.findIndex(t=>tickSeconds(t)===tickSeconds(chosen.watch.from)):-1;
   setView(device||((local&&start<0||kind==='wildfire')&&!openGlobal)?'detail':'global',{instant:local||kind==='wildfire'||start>=0});
   const ready=await select(start>=0?start:middle,{pause:false});
   if(ready&&start>=0&&openingWatch===watchRun)void beginWatch(true);
   return ready;
  }catch(error){
   if(token!==request||!isActive())return false;
   stopWatch();loading=false;displayReady=false;displayFailed=true;
   failureMessage='观测资料暂未载入：'+(error instanceof TypeError?'网络请求失败':error.message);
   if(chosen.localOnly)$('#source-links').innerHTML=`<li><a href="${esc(chosen.publication)}" target="_blank" rel="noopener">论文与原档说明 ↗</a></li>`;
   $('#topic-description').textContent=chosen.localOnly?'本案例需要本机研究数据；可在下方资料区查看论文。':'请重新选择事件重试；没有用模拟资料替代。';
   controls();return false;
  }
 }
 function stopWatch(){
  ++watchRun;clearTimeout(watchTimer);watchTimer=null;watchObserver?.disconnect();watchObserver=null;
  if(!watchPhase)return false;
  watchPhase='';++playbackIntent;playing=false;elapsed=0;
  return true;
 }
 function cancelWatch(){if(stopWatch())controls();}
 function leave(){
  stopWatch();riverEvidence?.reset();tideEvidence?.reset();batteryEvidence?.reset();dieselEvidence?.reset();++request;++playbackIntent;playing=false;loading=false;displayReady=false;displayFailed=false;requestedTimeUtc=null;requestedElapsedSeconds=null;failureMessage='';
  engine.setDynamicMode(false);$('#dynamic-toolbar').hidden=true;$('#dynamic-view-tools').hidden=true;$('#dynamic-full').hidden=false;$('#dynamic-controls').hidden=true;$('#next-topic').hidden=false;
  $('#dixie-controls').hidden=true;fireGuideNote.hidden=true;$('#hunga-terrain-toggle').hidden=true;clearHungaTerrain();
  watchComplete=false;$('#observation-followup').hidden=true;
  $('#observation-flow-controls').hidden=true;delete document.body.dataset.dynamicKind;document.body.classList?.remove('observation-flow-active','observation-detail-open');
  $('#observation-data-retry').hidden=true;
  $('#layers').setAttribute('aria-label','地球过程图层');
  if(localView(kind)){
   if(kind==='tide')$('#observed-story-band').after($('#observation-flow-controls'));
   $('#observed-story-legend').after($('#observed-keyframes'));
   $('#stage-steps').after($('.timeline'));
   $('#earth-canvas').setAttribute('aria-label','交互地球，拖动旋转、滚轮缩放，空格播放或暂停');
  }
  $('#observation-details').setAttribute('aria-expanded','false');
  if(kind==='engine'&&$('#speed').options)for(const option of $('#speed').options)option.textContent=option.value+'×';
  for(const id of ['timeline','play','restart','speed'])$('#'+id).disabled=false;delete $('#earth-view').dataset.observedTime;
 }
 function pause(){stopWatch();++playbackIntent;playing=false;elapsed=0;controls();}
 // Without a committed frame, cancel the engine too. Otherwise the owner restores the committed time.
 function cancelPending(){const uncommitted=loading&&!snapshot;stopWatch();++request;++playbackIntent;playing=false;elapsed=0;loading=false;if(uncommitted){data=null;ticks=[];engine.setDynamicData(null);}controls();}
 function getState({includeTicks=true}={}){return {kind,eventId:data?.id??null,slug,index,ticks:includeTicks?[...ticks]:undefined,timeUtc:snapshot?.timeUtc??null,requestedTimeUtc,renderedTimeUtc:displayReady?snapshot?.timeUtc??null:null,elapsedSeconds:snapshot?.elapsedSeconds??null,selectedStation,playing,loading,displayReady,displayFailed,hungaMode,hungaSpot,hungaAngle,fireMode,fireHour,changingFireLayer:Boolean(fireContext&&loading&&snapshot?.timeUtc===requestedTimeUtc)};}
 /** Shared source for read-only UI evidence calculations; callers must not mutate it or its records. */
 function getEvidenceSource(){return data;}
 async function seekUtc(timeUtc,options){
  if(!data||!ticks.length||!isActive()||typeof timeUtc!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(timeUtc))return false;
  const target=Date.parse(timeUtc);if(!Number.isFinite(target)||new Date(target).toISOString().slice(0,19)!==timeUtc.slice(0,19))return false;
  let low=0,high=ticks.length-1,found=-1;while(low<=high){const middle=(low+high)>>1;if(Date.parse(ticks[middle])<=target){found=middle;low=middle+1;}else high=middle-1;}
  return found<0?false:await select(found,options);
 }
 async function seekTick(tick,options){
  if(!elapsedClock(kind))return seekUtc(tick,options);
  const target=ticks.indexOf(tick);
  return target>=0&&await select(target,options);
 }
 function setView(view,options){
  if(!['global','detail'].includes(view))return false;
  if(kind==='volcano'&&clearHungaTerrain())display();
  if(isDeviceEvent(event)){
   view='detail';
   options={...options,instant:true};
  }
  engine.setDynamicView(view,options);
  $('#dynamic-full').setAttribute('aria-pressed',String(view==='global'));
  $('#dynamic-close').setAttribute('aria-pressed',String(view==='detail'));
  if(kind==='tide'&&snapshot)controls();
  if(localView(kind))$('#earth-canvas').setAttribute('aria-label',view==='detail'?(kind==='engine'?'柴油机结构示意，拖动旋转':kind==='battery'?'B0005 电芯结构示意，拖动旋转':kind==='river'?'Big Piney 河段':'旧金山港月球和潮位')+'，滚轮缩放，空格播放或暂停':'交互地球，拖动旋转、滚轮缩放，空格播放或暂停');
  return true;
 }
 function selectStation(id){
  if(!(kind==='river'?data?.transects:data?.stations)?.some(item=>item.id===id))return false;
  if(kind==='river')followRiver=false;
  selectedStation=id;engine.selectDynamicStation(id);display();return true;
 }
 async function startFrom(value){
  watchComplete=false;stopWatch();const intent=++playbackIntent;playing=false;elapsed=0;
  if(!await select(value,{pause:false})||intent!==playbackIntent||!isActive())return false;
  playing=true;controls();return true;
 }
 async function toggle(){
  if(!data||!isActive())return false;
  if(playing||watchPhase){pause();return true;}
  if(loading)return false;
  if(kind==='tide'&&$('#dynamic-full').getAttribute('aria-pressed')==='true'&&displayReady&&
     !matchMedia('(pointer: coarse)').matches){
   void beginWatch(index<ticks.length-1);
   return true;
  }
  if(index>=ticks.length-1||!displayReady)return startFrom(index>=ticks.length-1?0:index);
  if(kind==='tide'&&$('#dynamic-close').getAttribute('aria-pressed')==='true'){
   const intent=++playbackIntent;
   if(await engine.whenDynamicViewReady()===false||intent!==playbackIntent||!isActive())return false;
  }
  watchComplete=false;++playbackIntent;playing=true;elapsed=0;controls();return true;
 }
 async function beginWatch(positioned=false){
  if(!event.watch||!ticks.length||!isActive())return;
  const start=ticks.findIndex(t=>tickSeconds(t)===tickSeconds(event.watch.from));
  if(start<0)return;
  const run=++watchRun;watchComplete=false;watchPhase='locating';++playbackIntent;playing=false;elapsed=0;controls();
  try{
   if(kind==='river'){
    selectedStation=data.transects[0].id;
    engine.selectDynamicStation(selectedStation);
    followRiver=true;
   }
   const device=isDeviceEvent(event);
   if(!positioned){
    if(!device)setView('global',{instant:true});
    if(!await select(start,{pause:false}))return;
   }
   if(!device)await engine.ready;
   if(run!==watchRun||!isActive())return;
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const startPlayback=()=>{
    if(run!==watchRun||!isActive())return;
    watchPhase='playing';playing=true;controls();
   };
   const play=()=>{
    if(device){startPlayback();return;}
    watchTimer=setTimeout(async ()=>{
     if(run!==watchRun||!isActive())return;
     setView('detail',{observation:true,instant:reduced});
     if(localView(kind)&&await engine.whenDynamicViewReady()===false){
      if(run===watchRun)cancelWatch();
      return;
     }
     startPlayback();
    },reduced?0:kind==='tide'?2300:1100);
   };
   if(typeof IntersectionObserver==='function'&&!matchMedia('(pointer: coarse)').matches){
    const earth=$('#earth-view');
    const bounds=earth.getBoundingClientRect();
    const harbor=kind==='tide';
    const threshold=harbor?Math.min(.8,.78*window.innerHeight/Math.max(1,bounds.height)):.35;
    if(harbor&&(bounds.top<0||bounds.bottom>window.innerHeight)){
     earth.scrollIntoView({block:'center',behavior:reduced?'instant':'smooth'});
    }else if(bounds.top>window.innerHeight*.55||bounds.bottom<window.innerHeight*.35||(device&&bounds.bottom>window.innerHeight)){
     $('#observed-story-band').scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'});
    }
    const showAndPlay=()=>{
     if(run!==watchRun||!watchObserver)return;
     clearTimeout(watchTimer);watchTimer=null;
     watchObserver?.disconnect();watchObserver=null;play();
    };
    watchObserver=new IntersectionObserver(([entry])=>{
     if(entry.intersectionRatio+1e-4>=threshold)showAndPlay();
    },{threshold});
    watchObserver.observe(earth);
    // Mobile browser bars and sticky controls can keep the view short of the visibility threshold.
    watchTimer=setTimeout(showAndPlay,900);
   }else play();
  }catch{
   if(run===watchRun)cancelWatch();
  }
 }
 function finishPlayback(){
  watchComplete=watchPhase==='playing';
  stopWatch();playing=false;controls();
 }
 function advance(dt,speed){
  if(!playing||loading||!isActive())return;
  if(kind==='engine'){
   const last=watchPhase==='playing'?Math.round(event.watch.to*10):ticks.length-1;
   if(index>=last){finishPlayback();return;}
   elapsed+=dt*speed*3;
   // Advance on the native 10 Hz grid; visual playback may skip rows but never blends samples.
   const count=Math.floor((elapsed+1e-9)*10);
   if(count<1)return;
   elapsed=Math.max(0,elapsed-count/10);
   void select(Math.min(last,index+count),{pause:false});
   return;
  }
  elapsed+=dt*speed;
  const nextInterval=index<ticks.length-1?tickSeconds(ticks[index+1])-tickSeconds(ticks[index]):1;
  const delay=kind==='wildfire'?1.6:kind==='battery'?Math.max(.06,nextInterval/110):kind==='river'?nextInterval/560:kind==='tide'?.12:kind==='quake'?.055:Math.max(.08,.65*nextInterval/(kind==='volcano'?600:1800));
  if(elapsed<delay)return;
  elapsed=0;
  if(index>=ticks.length-1||(watchPhase==='playing'&&tickSeconds(ticks[index])>=tickSeconds(event.watch.to))){
   finishPlayback();return;
  }
  void select(index+1,{pause:false});
 }
 function exportCurrent(){
  if(!snapshot||!data)return null;
  const displayStatus=loading?'loading':displayFailed?'failed':displayReady?'displayed':'not-displayed';
  if(kind==='wildfire'){
   const {timeUtc: _sortKey, ...frame}=snapshot.frame;
   const context=fireContext?{
    layer:fireMode,windHourUtc:$('#current-insight').dataset.windHour,
    stationRecords:fireReadings.map(({id,label,lat,lon,sample})=>({id,label,lat,lon,observation:sample?{utc:sample[0],speedMph:sample[1],windFromDegrees:sample[2]}:null})),
    mapComparison:fireContext.frames[frame.archiveDate].sectors,inputSha256:fireContext.inputSha256,
   }:null;
   return download({schemaVersion:1,eventId:data.id,clockBasis:data.dateBasis,frame,context,sources:[...data.sources,...(context?dixieSources:[])],archive:data.archive,basemap:data.basemap,limitations:data.limitations,displayStatus},data.id+'-'+frame.archiveDate+'.json');
  }
  if(kind==='engine'){
   const display={status:displayStatus,loading,displayReady,displayFailed,requestedElapsedSeconds,
    committedElapsedSeconds:snapshot.elapsedSeconds,renderedElapsedSeconds:displayReady?snapshot.elapsedSeconds:null};
   return download({
    schemaVersion:2,kind:'synchronized-observed-process',eventId:data.id,title:data.title,
    clock:data.clock,snapshot,channels:data.channels,sources:data.sources,unitNotes:data.limitations,display,
    renderingMethods:{view:engine.getDieselViewEvidence(),annotations:getExportContext()},
   },data.id+'-elapsed-'+String(snapshot.elapsedSeconds).replace('.','-')+'s.json');
  }
  if(kind==='battery'){
   const display={status:displayStatus,loading,displayReady,displayFailed,requestedElapsedSeconds,
    committedElapsedSeconds:snapshot.elapsedSeconds,renderedElapsedSeconds:displayReady?snapshot.elapsedSeconds:null};
   return download({
    schemaVersion:2,kind:'synchronized-observed-process',eventId:data.id,title:data.title,
    clock:{basis:'source-cycle-elapsed-seconds',sourceLocalTime:data.sourceLocalTime},
    snapshot,channels:data.channels,sources:data.sources,unitNotes:data.limitations,display,
    renderingMethods:{view:engine.getBatteryViewEvidence(),annotations:getExportContext()},
   },data.id+'-elapsed-'+String(snapshot.elapsedSeconds).replace('.','-')+'s.json');
  }
  if(kind==='river'){
   const display={
    loading,displayReady,displayFailed,status:displayStatus,requestedElapsedSeconds,
    committedElapsedSeconds:snapshot.elapsedSeconds,renderedElapsedSeconds:displayReady?snapshot.elapsedSeconds:null,
   };
   const value={
    schemaVersion:2,kind:'synchronized-observed-process',eventId:data.id,title:data.title,
    clock:{basis:'seconds-from-release-reference',origin:data.clockOrigin},snapshot,transect:selectedStation,
    sources:data.sources,signalRule:data.signalRule,unitNotes:data.limitations,display,
    renderingMethods:{view:engine.getRiverViewEvidence(),annotations:getExportContext()},
   };
   return download(value,data.id+'-elapsed-'+snapshot.elapsedSeconds+'s.json');
  }
  const display={loading,displayReady,displayFailed,status:displayStatus,requestedTimeUtc,committedTimeUtc:snapshot.timeUtc,renderedTimeUtc:displayReady&&!hungaMode?snapshot.timeUtc:null,message:$('#dynamic-status').textContent};
  if(kind==='tide'){
   return download({
    schemaVersion:2,kind:'synchronized-observed-process',eventId:data.id,title:data.title,
    clock:{basis:'UTC',cadenceSeconds:data.cadenceSeconds},station:data.station,datum:data.datum,unit:data.unit,
    snapshot,sources:data.sources,unitNotes:data.limitations,display,
    renderingMethods:{view:engine.getTideViewEvidence(),annotations:getExportContext()},
   },data.id+'-'+snapshot.timeUtc.replace(/[:.]/g,'-')+'.json');
  }
  let presentationContext=null;
  try{presentationContext=getExportContext({eventId:data.id,kind,timeUtc:snapshot.timeUtc,...display})??null;if(presentationContext&&typeof presentationContext.then==='function')throw new TypeError('Export context must be a synchronous snapshot.');}catch{presentationContext={status:'unavailable',message:'补充显示资料暂不可导出，未推定其已显示。'};}
  const cloudMethods=kind==='quake'?null:{version:1,source:'app/sync-cloud-layer.js',appliedToVisibleObservation:displayReady&&!hungaMode,brightnessTemperatureMap:{coldK:180,warmK:310,coldGray8:255,warmGray8:0},fusion:{enabled:presentation==='fusion',warmFadeK:285,opaqueK:240,coldAlpha:.94,edgeFeatherDegrees:3},relief:{enabled:presentation==='fusion'&&relief,method:'same-frame texture-gradient lighting; not measured cloud height'},spatialFocus:kind==='volcano'?{enabled:presentation==='fusion',center:{...data.focus},innerRadiusKm:400,outerRadiusKm:600,earthRadiusKm:6371.0088,method:'smoothstep(cos(outer/R),cos(inner/R),dot(pixelDirection,centerDirection)); display opacity only',statisticsRadiusKm:300}:null};
  const value={schemaVersion:2,kind:'synchronized-observed-process',eventId:data.id,title:data.title,snapshot,station:selectedStation,presentation:kind==='quake'?'station-normalized waveform glyphs':presentation,relief,unitNotes:data.limitations,sources:data.sources,display,renderingMethods:{clouds:cloudMethods,visibleObservationTimeUtc:display.renderedTimeUtc,annotations:presentationContext}};
  if(hungaMode){
   value.renderingMethods.visibleObservationTimeUtc=null;
   value.renderingMethods.terrain={source:'https://zenodo.org/records/7456324',mode:hungaMode,spot:hungaSpot,
    sampleM:hungaSample(hungaData,hungaSpot),grid:hungaData.grid,surveys:hungaData.surveys};
  }
  return download(value,data.id+'-'+snapshot.timeUtc.replace(/[:.]/g,'-')+'.json');
 }
 function download(value,filename){
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return value;
 }
 $('#layers').addEventListener('click',e=>{const b=e.target.closest('[data-dynamic-kind]');if(b&&isActive())onRoute(b.dataset.dynamicKind);});
 $('#current-insight').addEventListener('click',e=>{const b=e.target.closest('[data-station]');if(b&&isActive()){onManualStation();if(kind!=='river')cancelWatch();selectStation(b.dataset.station);}});
 $('#stage-steps').addEventListener('click',e=>{const b=e.target.closest('[data-dynamic-step]');if(b&&isActive())requestSeek(b.dataset.dynamicStep);});
 $('#dynamic-prev').addEventListener('click',()=>requestSeek(index-1));$('#dynamic-next').addEventListener('click',()=>requestSeek(index+1));
 $('#dynamic-full').addEventListener('click',()=>{cancelWatch();setView('global');});
 $('#dynamic-close').addEventListener('click',()=>{cancelWatch();setView('detail',{observation:Boolean(event.watch),instant:matchMedia('(prefers-reduced-motion: reduce)').matches});});
 function clearHungaTerrain(){
  ++hungaRequest;
  const wasOpen=Boolean(hungaMode);
  if(wasOpen){
   engine.setHungaView();
   $('#dynamic-full').setAttribute('aria-pressed',String(hungaWasGlobal));
   $('#dynamic-close').setAttribute('aria-pressed',String(!hungaWasGlobal));
  }
  setHungaLesson(null);
  hungaMode=null;hungaSpot='crater';hungaAngle='oblique';
  delete document.body.dataset.hungaMode;
  $('#hunga-terrain').hidden=true;
  $('#hunga-change-key').hidden=true;
  $('#hunga-terrain-toggle').setAttribute('aria-pressed','false');
  $('#hunga-terrain-toggle').textContent='下潜到海底 · 看三维火山口';
  return wasOpen;
 }
 function setHungaLesson(beat){
  const next=beat?.mode===hungaMode&&beat.spot===hungaSpot?beat:null;
  if(next===hungaLesson)return;
  hungaLesson=next;
  engine.setHungaLesson(next);
  if(next?.panel)document.body.dataset.hungaLessonPanel=next.panel;
  else delete document.body.dataset.hungaLessonPanel;
 }
 async function showHungaTerrain(mode,spot='crater',options){
  if(!mode){
   if(clearHungaTerrain())display();
   return true;
  }
  if(kind!=='volcano'||!snapshot||!isActive())return false;
  const token=++hungaRequest;
  try{
   hungaData??=await loadHungaTerrain();
   if(token!==hungaRequest||options?.signal?.aborted||!isActive())return false;
   const angle=options?.angle??(mode===hungaMode?hungaAngle:mode==='section'?'side':'oblique');
   const ready=engine.setHungaView(hungaData,mode,spot,{...options,angle});
   if(!hungaMode){
    hungaWasGlobal=$('#dynamic-full').getAttribute('aria-pressed')==='true';
    $('#dynamic-full').setAttribute('aria-pressed','false');
    $('#dynamic-close').setAttribute('aria-pressed','false');
   }
   hungaMode=mode;hungaSpot=spot;hungaAngle=angle;document.body.dataset.hungaMode=mode;
   setHungaLesson(options?.lesson??hungaLesson);
   $('#hunga-terrain-toggle').setAttribute('aria-pressed','true');
   $('#hunga-terrain-toggle').textContent='返回红外云图';
   $('#hunga-terrain').hidden=false;
   for(const b of $('#hunga-terrain').querySelectorAll('[data-hunga-survey]'))b.setAttribute('aria-pressed',String(b.dataset.hungaSurvey===mode));
   for(const b of $('#hunga-terrain').querySelectorAll('[data-hunga-spot]'))b.setAttribute('aria-pressed',String(b.dataset.hungaSpot===spot));
   for(const b of $('#hunga-terrain').querySelectorAll('[data-hunga-angle]'))b.setAttribute('aria-pressed',String(b.dataset.hungaAngle===angle));
   display();
   options?.onReveal?.();
   return await ready&&token===hungaRequest;
  }catch{
   if(token===hungaRequest)$('#hunga-terrain-toggle').textContent='测深资料未载入 · 点击重试';
   return false;
  }
 }
 $('#hunga-terrain-toggle').addEventListener('click',()=>void showHungaTerrain(hungaMode?null:'change'));
 $('#observation-data-retry').addEventListener('click',()=>{
  if(!isActive()||loading||!displayFailed)return;
  if(failedFrame)void select(failedFrame.index,{dixieMode:failedFrame.mode,dixieHour:failedFrame.dixieHour});
  else onRoute(slug);
 });
 $('#hunga-terrain').addEventListener('click',e=>{
  const b=e.target.closest('[data-hunga-survey],[data-hunga-spot],[data-hunga-angle]');
  if(b&&hungaMode)void showHungaTerrain(b.dataset.hungaSurvey??hungaMode,b.dataset.hungaSpot??hungaSpot,
   {angle:b.dataset.hungaAngle,reframe:Boolean(b.dataset.hungaAngle)});
 });
 $('#dixie-controls').addEventListener('click',e=>{
  const button=e.target.closest('[data-fire-mode]');
  if(!button||!snapshot||!fireContext||(button.dataset.fireMode===requestedFireMode&&!displayFailed))return;
  requestedFireMode=button.dataset.fireMode;
  const next=loading?ticks.indexOf(requestedTimeUtc):index;
  void select(next<0?index:next,{pause:false});
 });
 $('#dixie-hour').addEventListener('input',e=>{fireHour=Number(e.target.value);fireWindManual=true;updateDixieWind();onUpdate();});
 $('#dynamic-controls').addEventListener('click',e=>{const b=e.target.closest('[data-presentation]');if(b){presentation=b.dataset.presentation;engine.setDynamicPresentation(presentation);controls();}});
 $('#dynamic-relief').addEventListener('click',()=>{relief=!relief;engine.setDynamicRelief(relief);controls();});
 $('#observation-event-select').addEventListener('change',e=>{if(isActive()&&e.target.value!==slug)onRoute(e.target.value);});
 $('#observation-watch').addEventListener('click',()=>{if(!isActive()||onWatch())return;if(!stopWatch())void beginWatch();else controls();});
 $('#observation-details').addEventListener('click',()=>{
  const expanded=document.body.classList.toggle('observation-detail-open');
  $('#observation-details').setAttribute('aria-expanded',String(expanded));
  if(expanded&&document.body.classList.contains('focus-earth'))$('#focus').click();
 });
 return {enter,leave,cancelWatch,select,requestSeek,pause,cancelPending,getState,getEvidenceSource,getDixieContext:()=>fireContext,getSnapshot:()=>snapshot,seekUtc,seekTick,setDixieGuide,setView,showHungaTerrain,setHungaLesson,selectStation,toggle,advance,exportCurrent,restart(){if(kind==='tide'&&ticks.length){stopWatch();return beginWatch();}return startFrom(kind==='river'?ticks.indexOf(event.watch.from):0);},resetView(){cancelWatch();return setView('global');}};
}
