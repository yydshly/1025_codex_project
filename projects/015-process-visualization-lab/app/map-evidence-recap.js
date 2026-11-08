import {sampleAt} from './dynamic-data.js';
import {dixieWeatherWindow,dixieWindAt,toward} from './dixie-evidence.js';

const minute = time => time.slice(11,16);
const daylightClock = stamp => new Date(stamp - 7 * 3600000).toISOString().slice(5,16).replace('T',' ');

function stormRecap(data) {
 const frames=data.frames??[], first=frames[0], last=frames.at(-1);
 if(!first||!last)return null;
 const analyses=data.track??[];
 const winds=data.series?.find(series=>series.id==='windKt');
 const analysisAt=frame=>{
  const sample=sampleAt(winds?.samples??[],frame.timeUtc,winds?.maxAgeSeconds??0);
  return analyses.find(row=>row.timeUtc===sample?.timeUtc);
 };
 const start=analysisAt(first), end=analysisAt(last);
 const missing=data.missingOriginalScans?.find(row=>row.timeUtc>first.timeUtc&&row.timeUtc<last.timeUtc);
 const gapStart=missing&&frames.findLast(frame=>frame.timeUtc<missing.timeUtc);
 const gapEnd=missing&&frames.find(frame=>frame.timeUtc>missing.timeUtc);
 const stamp=(frame,analysis)=>'云图 '+minute(frame.timeUtc)+(analysis?' · JMA '+minute(analysis.timeUtc)+' UTC':' UTC');
 const items=[{id:'start',label:'东海起点',detail:stamp(first,start),time:first.timeUtc,shot:'storm-band',target:'below235KAreaKm2'}];
 if(gapStart&&gapEnd){
  items.push(
   {id:'before',label:'缺档前',detail:minute(gapStart.timeUtc)+' UTC · 红外扫描',time:gapStart.timeUtc,shot:'storm-korea',target:'below235KAreaKm2'},
   {id:'after',label:'缺档后',detail:minute(gapEnd.timeUtc)+' UTC · 红外扫描',time:gapEnd.timeUtc,shot:'storm-korea',target:'below235KAreaKm2'},
  );
 }
 items.push({id:'end',label:'末帧与强度',detail:stamp(last,end),time:last.timeUtc,shot:'storm-korea',target:'windKt'});
 return {
  label:'轩岚诺 · 观测回看',
  title:'把云带的位置和台风强度分开看',
  summary:start&&end?`最大持续风速 ${start.windKt} → ${end.windKt} kt，中心气压 ${start.pressureHpa} → ${end.pressureHpa} hPa。金点保留 JMA 分析时刻。`:'用海岸线对照已收录的卫星扫描。',
  items,
 };
}

function dixieRecap(data,context) {
 const last=data.frames?.at(-1), previous=data.frames?.at(-2);
 if(!last||!previous)return null;
 const date=`${previous.archiveDate.slice(5)} → ${last.archiveDate.slice(5)}`;
 const items=[{id:'boundary',label:'新增边界',detail:date+' · 航空红外档案',time:last.timeUtc,phase:'boundary',mode:'terrain',target:'addedKm2'}];
 const sectors=context?.frames[last.archiveDate]?.sectors??[];
 const north=sectors.find(sector=>sector.name==='北侧'),east=sectors.find(sector=>sector.name==='东侧');
 const both=north&&east;
 if(context){
  const hour=16, window=dixieWeatherWindow(previous.archiveDate,last.archiveDate), stamp=window.start+hour*3600000;
  const wind=dixieWindAt(context.stations,stamp).filter(station=>station.sample);
  const eastward=wind.filter(({sample:[,speed,from]})=>speed>0&&toward(from)>0&&toward(from)<180).length;
  const detail=daylightClock(stamp)+' PDT · '+(wind.length?`${eastward}/${wind.length} 站向东分量`:'缺测');
  items.push({id:'wind',label:'测站风',detail,time:last.timeUtc,phase:'wind',mode:'terrain',hour,target:'dixie-wind'});
  if(both&&[north,east].every(sector=>Number.isFinite(sector.medianSlope))){
   items.push({id:'slope',label:'地形与坡度',detail:`北 ${north.medianSlope}° · 东 ${east.medianSlope}°`,time:last.timeUtc,phase:'slope',mode:'terrain',target:'dixie-sectors'});
  }
  if(both&&north.fuel[0]&&east.fuel[0]){
   items.push({id:'fuel',label:'火前植被',detail:`北 ${north.fuel[0].pct}% · 东 ${east.fuel[0].pct}%（各侧首位）`,time:last.timeUtc,phase:'fuel',mode:'fuel',target:'dixie-sectors'});
  }
 }
 return {
  label:'Dixie · 观测回看',
  title:both?'北侧和东侧是主要新增区':'回看航空红外边界',
  summary:both?`最后两期之间北侧新增 ${north.areaKm2} km²，东侧新增 ${east.areaKm2} km²。附近测站风、坡度和植被提供不同线索。`:'沿橙色范围查看两期档案之间的新划入区域。',
  items,
 };
}

export function mapRecapKind(cue) {
 if(cue?.route==='dynamic-storm'&&cue.stormEvidence==='review')return 'storm';
 if(cue?.route==='dynamic-wildfire-dixie'&&cue.dixieEvidence==='fuel')return 'wildfire';
 return null;
}

export function mapRecapPlan(kind,data,context) {
 if(data?.kind!==kind)return null;
 if(kind==='storm')return stormRecap(data);
 if(kind==='wildfire')return dixieRecap(data,context);
 return null;
}

export function createMapRecap(host,onSeek) {
 const panel=document.createElement('section');
 panel.className='observation-recap map-recap';panel.hidden=true;
 panel.setAttribute('aria-labelledby','map-recap-title');
 panel.innerHTML=`<div class="map-recap-copy"><span></span><h2 id="map-recap-title"></h2><p></p></div>
  <div class="observation-recap-actions" role="group" aria-label="回看对应观测"></div><p class="map-recap-status" role="status" hidden></p>`;
 const copy=panel.firstElementChild, actions=panel.querySelector('.observation-recap-actions');
 const status=panel.querySelector('.map-recap-status');
 const [label,title,summary]=copy.children;
 host.before(panel);

 return {
  get visible(){return !panel.hidden;},
  show(plan) {
   label.textContent=plan.label;title.textContent=plan.title;summary.textContent=plan.summary;
   actions.replaceChildren(...plan.items.map(item=>{
    const button=document.createElement('button');
    const name=document.createElement('strong'),detail=document.createElement('small');
    button.type='button';button.dataset.evidence=item.id;button.setAttribute('aria-pressed','false');
    name.textContent=item.label;detail.textContent=item.detail;button.append(name,detail);
    button.addEventListener('click',()=>onSeek(item));
    return button;
   }));
   panel.hidden=false;
   document.body.dataset.mapRecap='true';
  },
  select(id) {
   for(const button of actions.children)button.setAttribute('aria-pressed',String(button.dataset.evidence===id));
  },
  status(message='') {
   status.hidden=!message;status.textContent=message;
  },
  locate() {
   requestAnimationFrame(()=>{
    if(!panel.hidden)panel.scrollIntoView({block:'start',behavior:'instant'});
   });
  },
  hide() {
   if(panel.hidden)return false;
   panel.hidden=true;status.hidden=true;
   delete document.body.dataset.mapRecap;
   return true;
  },
 };
}
