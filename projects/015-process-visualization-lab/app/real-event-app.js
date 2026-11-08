import {createEventEarth} from './real-event-earth.js';
import {validateEventDataset,recordAtIndex,findRecordIndex,metricSeries,formatTime} from './real-event-data.js';

const $=id=>document.getElementById(id);
const sources={
 jma:'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html',
 nasa:'https://science.nasa.gov/earth/earth-observatory/typhoon-mangkhut-reaches-luzon-92761/',
 hko:'https://www.hko.gov.hk/en/publica/tc/tc2018/section3_5rpt.html'
};
const chapters=[
 {time:'2018-09-12T06:00:00Z',date:'09.12',name:'从哪里来？',kicker:'01 / 太平洋上的发展',title:'沿着档案，找到来路',body:'先看全程路径，再比较风速和气压。此处两条曲线来自同一套 JMA 事后分析；最大风速的10分钟平均口径始终保持一致。',url:sources.jma},
 {time:'2018-09-14T06:00:00Z',date:'09.14',name:'云系有多大？',kicker:'02 / 抵近吕宋',title:'中心是一个点，云系是一大片',body:'9月14日卫星图能看到清晰的台风眼和螺旋云带。金点只代表档案中的中心位置；云图按日合成，不能把整片云区直接当成强风范围。',url:sources.nasa},
 {time:'2018-09-16T06:00:00Z',date:'09.16',name:'香港为什么受影响？',kicker:'03 / 珠江口附近',title:'看外围雨带，也看本地测站',body:'香港天文台记录，中心最接近时仍在香港约100公里外。当地受到的影响需要用雷达、风速站和潮位站核对，不能仅凭台风中心是否经过判断。',url:sources.hko},
 {time:'2018-09-17T06:00:00Z',date:'09.17',name:'后来怎样变化？',kicker:'04 / 向内陆移动',title:'风速减小，记录仍要继续读',body:'对比前后的中心气压与风速，查看台风向内陆移动后的强度变化。档案未报告风速的时段显示“未报告”，不把缺失值画成无风。',url:sources.jma}
];
let dataset,imagery,earth,index=0,playing=false,timer=null,imageRequest=0,activeDate=null,noticeTimer;
const imageFrames=new Map();
function notify(message){$('notice').textContent=message;$('notice').classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').classList.remove('visible'),3500);}
function chart(id,field,min,max,color){
 const series=metricSeries(dataset,field),W=280,H=110,l=29,r=8,t=12,b=21;
 const x=i=>l+i/(series.length-1)*(W-l-r),y=v=>t+(max-v)/(max-min)*(H-t-b);
 let path='',open=false;
 const points=[];
 series.forEach((s,i)=>{if(s.value===null){open=false;return;}path+=(open?' L':' M')+x(i).toFixed(2)+' '+y(s.value).toFixed(2);open=true;points.push('<circle cx="'+x(i)+'" cy="'+y(s.value)+'" r="1.7" fill="'+color+'"/>');});
 const v=series[index].value;
 $(id).innerHTML='<title>'+formatTime(series[index].timeUtc)+' · '+(v===null?'未报告':v)+'</title>'+
 [min,(min+max)/2,max].map(tick=>'<line x1="'+l+'" x2="'+(W-r)+'" y1="'+y(tick)+'" y2="'+y(tick)+'" stroke="#253342" stroke-width=".65"/><text x="'+(l-5)+'" y="'+(y(tick)+3)+'" text-anchor="end" fill="#8294a6" font-size="9">'+tick+'</text>').join('')+
 '<path d="'+path+'" fill="none" stroke="'+color+'" stroke-width="1.5"/>'+points.join('')+
 '<line x1="'+x(index)+'" x2="'+x(index)+'" y1="5" y2="'+(H-b+3)+'" stroke="#f4c681" stroke-width="1" stroke-dasharray="3 3"/>'+
 (v===null?'<text x="'+Math.min(x(index),W-44)+'" y="20" fill="#f4c681" font-size="9">未报告</text>':'<circle cx="'+x(index)+'" cy="'+y(v)+'" r="4" fill="#ffd192" stroke="#152231" stroke-width="2"/>')+
 '<text x="'+l+'" y="106" fill="#8294a6" font-size="9">9/6</text><text x="'+(W-r)+'" y="106" text-anchor="end" fill="#8294a6" font-size="9">9/17 UTC</text>';
}
function renderChapter(){
 const time=Date.parse(recordAtIndex(dataset,index).timeUtc);
 let ci=0;chapters.forEach((c,i)=>{if(time>=Date.parse(c.time))ci=i;});
 const c=chapters[ci];
 document.querySelectorAll('.chapter').forEach((el,i)=>{el.classList.toggle('active',i===ci);el.setAttribute('aria-pressed',String(i===ci));});
 $('chapter-kicker').textContent=c.kicker;$('chapter-title').textContent=c.title;$('chapter-body').textContent=c.body;
 $('chapter-source').href=c.url;$('chapter-source').target='_blank';$('chapter-source').rel='noopener';
}
async function updateImagery(){
 const request=++imageRequest,record=recordAtIndex(dataset,index),date=record.timeUtc.slice(0,10);
 const frame=$('cloud-layer').checked?imageFrames.get(date):null;
 document.querySelectorAll('.day-button').forEach(el=>{el.classList.toggle('active',el.dataset.date===date);el.setAttribute('aria-pressed',String(el.dataset.date===date));});
 if(!frame){
  activeDate=null;await earth.setObservationTexture(null);
  if(request!==imageRequest)return;
  $('imagery-kind').textContent='NASA / 历史地理底图';$('imagery-date').textContent='地理背景 · 非当日天气';
  $('imagery-note').textContent=$('cloud-layer').checked?'此日期尚未收录卫星帧，未补造云系':'已关闭观测云图';return;
 }
 if(activeDate===date)return;
 activeDate=null;
 $('imagery-kind').textContent='NASA GIBS / VIIRS';$('imagery-date').textContent='正在切换 '+date+' 日合成';$('imagery-note').textContent='每日观测拼接 · 非瞬时云图';
 // Clear the previous day's texture before a new day is loaded.
 await earth.setObservationTexture(null);
 if(request!==imageRequest)return;
 const ok=await earth.setObservationTexture(frame.url);
 if(request!==imageRequest)return;
 activeDate=ok?date:null;
 $('imagery-date').textContent=ok?date+' · UTC 日合成':'影像未能加载 · 地理底图';
 $('imagery-note').textContent=ok?'不同过境时刻拼接；与中心点非同一瞬间':'可查看下方原始影像和来源';
}
function selectRecord(next,{pause=true}={}){
 if(!dataset)return;
 if(pause)setPlaying(false);
 index=Math.max(0,Math.min(dataset.records.length-1,Math.trunc(Number(next)||0)));
 const r=recordAtIndex(dataset,index);
 $('event-time').value=index;$('current-time').textContent=formatTime(r.timeUtc);
 $('record-position').textContent='原始记录 '+(index+1)+' / '+dataset.records.length+' · 6小时间隔';
 $('previous').disabled=index===0;$('next').disabled=index===dataset.records.length-1;
 $('readouts').innerHTML='<div class="readout"><span>中心最大持续风速</span><strong>'+(r.windKt===null?'未报告':r.windKt+'<small>kt</small>')+'</strong><small>'+(r.windKt===null?'原始档案无数值，不作补零':'≈ '+(r.windKt*1.852).toFixed(1)+' km/h · 10分钟平均')+'</small></div>'+
 '<div class="readout"><span>中心气压</span><strong>'+(r.pressureHpa===null?'未报告':r.pressureHpa+'<small>hPa</small>')+'</strong><small>海平面中心气压 · 事后分析</small></div>'+
 '<div class="coordinates"><span>中心位置</span><b>'+Math.abs(r.lat).toFixed(1)+'°'+(r.lat>=0?'N':'S')+' / '+Math.abs(r.lon).toFixed(1)+'°'+(r.lon>=0?'E':'W')+'</b></div>';
 chart('wind-chart','windKt',0,120,'#80d7d5');chart('pressure-chart','pressureHpa',900,1020,'#9fb5f2');
 renderChapter();earth.setIndex(index);updateImagery();
}
function setPlaying(value){
 playing=value;clearInterval(timer);timer=null;$('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'暂停真实记录':'播放真实记录');
 if(playing)timer=setInterval(()=>{if(index>=dataset.records.length-1){setPlaying(false);return;}selectRecord(index+1,{pause:false});},1100);
}
function pointLabel(id,lat,lon){
 const p=earth.project(lat,lon),el=$(id);el.hidden=!p.visible;
 if(p.visible){
  const dx=id==='hk-label'?-78:12,dy=id==='hk-label'?-48:-15;
  const w=$('earth-view').clientWidth,h=$('earth-view').clientHeight;
  el.style.transform='translate('+Math.round(Math.max(5,Math.min(w-el.offsetWidth-5,p.x+dx)))+'px,'+Math.round(Math.max(5,Math.min(h-el.offsetHeight-5,p.y+dy)))+'px)';
 }
}
function render(){
 if(earth&&dataset){earth.render();pointLabel('hk-label',22.3019,114.1742);const r=recordAtIndex(dataset,index);pointLabel('storm-label',r.lat,r.lon);}
 requestAnimationFrame(render);
}
async function init(){
 const results=await Promise.all([fetch('data/mangkhut-jma.json'),fetch('data/imagery-manifest.json')]);
 if(results.some(r=>!r.ok))throw new Error('事件资料读取失败，请使用本机预览服务打开页面。');
 dataset=validateEventDataset(await results[0].json());imagery=await results[1].json();
 for(const frame of imagery.frames){if(/^\d{4}-\d{2}-\d{2}$/.test(frame.date)&&frame.url.startsWith('assets/events/'))imageFrames.set(frame.date,frame);}
 $('chapters').innerHTML=chapters.map((c,i)=>'<button class="chapter" data-chapter="'+i+'" aria-pressed="false"><span class="chapter-number">0'+(i+1)+'</span><span class="chapter-text"><b>'+c.name+'</b><small>2018 / '+c.date+'</small></span><span>↗</span></button>').join('');
 document.querySelectorAll('.chapter').forEach(el=>el.addEventListener('click',()=>{selectRecord(findRecordIndex(dataset,chapters[Number(el.dataset.chapter)].time));setFocus('regional');}));
 $('image-days').innerHTML=[...imageFrames.keys()].sort().map(date=>'<button class="day-button" data-date="'+date+'" aria-pressed="false">'+date.slice(5).replace('-','.')+'</button>').join('');
 document.querySelectorAll('.day-button').forEach(el=>el.addEventListener('click',()=>selectRecord(findRecordIndex(dataset,el.dataset.date+'T06:00:00Z'))));
 $('event-time').max=dataset.records.length-1;
 earth=await createEventEarth($('event-earth'),{onSelectRecord:i=>selectRecord(i)});
 const resize=()=>{const box=$('earth-view').getBoundingClientRect();earth.resize(box.width,box.height);};
 resize();earth.setEvent(dataset.records);
 new ResizeObserver(resize).observe($('earth-view'));
 $('event-time').addEventListener('input',e=>selectRecord(e.target.value));
 $('previous').addEventListener('click',()=>selectRecord(index-1));$('next').addEventListener('click',()=>selectRecord(index+1));
 $('play').addEventListener('click',()=>{if(!playing&&index===dataset.records.length-1)selectRecord(0);setPlaying(!playing);});
 $('regional').addEventListener('click',()=>setFocus('regional'));$('global').addEventListener('click',()=>setFocus('global'));
 $('cloud-layer').addEventListener('change',updateImagery);
 $('export-record').addEventListener('click',()=>{
  const payload={eventId:dataset.eventId,name:dataset.name,selectedRecord:recordAtIndex(dataset,index),source:dataset.source,units:dataset.units,interpretation:dataset.interpretation,displayedImageryDate:activeDate,imageryLayerEnabled:$('cloud-layer').checked,availableImagery:imageFrames.get(recordAtIndex(dataset,index).timeUtc.slice(0,10))??null,imageryTimeCaution:'Satellite image is a UTC daily mosaic, not an instantaneous observation at the track record time.'};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download='mangkhut-'+recordAtIndex(dataset,index).timeUtc.replaceAll(':','-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('已下载当前原始记录、单位与来源。');
 });
 $('provenance-status').textContent='源档案修订：'+dataset.source.sourceRevisionDate+'；本地取得：'+dataset.source.downloadedAtUtc.slice(0,10)+'。';
 selectRecord(findRecordIndex(dataset,'2018-09-14T06:00:00Z'));setFocus('regional');$('map-status').hidden=true;
 requestAnimationFrame(render);
}
function setFocus(mode){
 earth.focus(mode);for(const id of ['regional','global']){$(id).classList.toggle('selected',mode===id);$(id).setAttribute('aria-pressed',String(mode===id));}
}
init().catch(error=>{$('map-status').textContent=error.message+' 可先阅读下方来源与观测证据。';$('map-status').classList.add('error');console.error(error);});


