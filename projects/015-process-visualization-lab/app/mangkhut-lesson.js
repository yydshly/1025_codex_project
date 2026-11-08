import {selectObservation} from './sync-timeline.js';
import {localClock,sampleClock,sampleValue} from './sync-observation-view.js';

const noon='2018-09-16T04:00:00Z';
const reviewTimes=['2018-09-16T05:00:00Z','2018-09-16T06:00:00Z'];
const meters=value=>value.toFixed(2);
const percent=(value,limit)=>100*value/limit;

export function createMangkhutLesson(host,onReview){
 const impact=document.createElement('section');
 impact.className='mangkhut-impact';
 impact.setAttribute('aria-label','山竹 · 香港实测读数示意');
 impact.hidden=true;
 host.after(impact);

 const recap=document.createElement('section');
 recap.className='observation-recap mangkhut-recap';
 recap.setAttribute('aria-labelledby','mangkhut-recap-title');
 recap.hidden=true;
 recap.innerHTML=`<div><span>结论 · 香港时间</span><h2 id="mangkhut-recap-title">风已回落，鲗鱼涌水位仍在上升</h2>
  <p>用两个整点核对同刻云图、机场平均风和验潮记录。</p></div>
  <div class="observation-recap-actions"></div>`;
 host.before(recap);
 const reviewButtons=reviewTimes.map(time=>{
  const button=document.createElement('button');
  button.type='button';
  button.addEventListener('click',()=>onReview(time));
  recap.querySelector('.observation-recap-actions').append(button);
  return button;
 });

 let currentBundle,series,baseline,limits,lastSnapshot,lastTarget;
 function bind(bundle){
  currentBundle=bundle;
  series=Object.fromEntries(bundle.series.map(item=>[item.id,item]));
  baseline=Object.fromEntries(['wind','seaLevel'].map(id=>[id,selectObservation(series[id],noon).sample?.value]));
  const upper=(id,field,step)=>Math.ceil(Math.max(step,...series[id].samples.map(sample=>sample[field]).filter(Number.isFinite))/step)*step;
  limits={wind:upper('wind','value',20),rain:upper('rain','upper',10),seaLevel:upper('seaLevel','value',1)};
  for(const [index,time] of reviewTimes.entries()){
   const wind=selectObservation(series.wind,time),water=selectObservation(series.seaLevel,time);
   reviewButtons[index].textContent=`${localClock(time)} · 风 ${sampleValue(series.wind,wind)} km/h · 水位 ${water.sample?meters(water.sample.value)+' m':'缺测'}`;
  }
 }

 function draw(snapshot,target){
  const {wind,rain,seaLevel}=snapshot.observations;
  const angle=wind.sample?.windDirectionDeg;
  const direction=Number.isFinite(angle)?`来向 ${String(angle).padStart(3,'0')}° · 箭头指吹去方向`:'无有效风向';
  const arrow=Number.isFinite(angle)?`<path d="M25 37V16m-5 6 5-6 5 6" transform="rotate(${(angle+180)%360} 25 25)"/>`:'';
  const bar=(id,value)=>`<div class="mangkhut-bar" aria-hidden="true">
   <i style="width:${percent(value,limits[id])}%"></i>${Number.isFinite(baseline[id])?`<b style="left:${percent(baseline[id],limits[id])}%"></b>`:''}</div>`;
  const rainBar=rain.sample?`<div class="mangkhut-bar mangkhut-rain-range" aria-hidden="true">
   <i style="left:${percent(rain.sample.lower,limits.rain)}%;width:${percent(rain.sample.upper-rain.sample.lower,limits.rain)}%"></i></div>`:'';
  const water=seaLevel.sample?`<div class="mangkhut-water-gauge" aria-hidden="true">
   <i style="height:${percent(seaLevel.sample.value,limits.seaLevel)}%"></i>
   ${Number.isFinite(baseline.seaLevel)?`<b style="bottom:${percent(baseline.seaLevel,limits.seaLevel)}%"></b>`:''}</div>`:'';
  const card=(id,title,value,description,visual)=>`<article data-mangkhut-reading="${id}"${target===id?' data-guide-focus':''}>
   <h3>${title}</h3>${visual}<strong>${value}</strong><small>${sampleClock(series[id],snapshot.observations[id])}</small>
   <small>${description}</small></article>`;
  impact.innerHTML=[
   card('wind','机场 · 十分钟平均风',wind.sample?sampleValue(series.wind,wind)+' km/h':'缺测',direction+(Number.isFinite(baseline.wind)?' · 白刻线为 12:00':''),
    `<svg class="mangkhut-compass" viewBox="0 0 50 50" role="img" aria-label="风箭头指向吹去的方向"><circle cx="25" cy="25" r="22"/><text x="25" y="13">北</text>${arrow}</svg>${wind.sample?bar('wind',wind.sample.value):''}`),
   card('rain','东区 · 各站小时雨量',rain.sample?sampleValue(series.rain,rain)+' mm':'缺测','范围两端是区内各站最小值和最大值',rainBar),
   card('seaLevel','鲗鱼涌 · 海水位',seaLevel.sample?meters(seaLevel.sample.value)+' m':'缺测','相对站点零点'+(Number.isFinite(baseline.seaLevel)?' · 白线为 12:00':''),water),
  ].join('');
  impact.dataset.observedTime=snapshot.timeUtc;
 }
 return {
  render(bundle,snapshot,target,showRecap){
   if(bundle!==currentBundle)bind(bundle);
   const showImpact=Boolean(target)||showRecap;
   if(showImpact&&(snapshot!==lastSnapshot||target!==lastTarget)){
    draw(snapshot,target);
    lastSnapshot=snapshot;lastTarget=target;
   }
   impact.hidden=!showImpact;
   if(showRecap){
    reviewButtons.forEach((button,index)=>button.setAttribute('aria-pressed',String(Date.parse(snapshot.timeUtc)===Date.parse(reviewTimes[index]))));
   }
   if(recap.hidden===showRecap){
    recap.hidden=!showRecap;
    document.body.toggleAttribute('data-mangkhut-recap',showRecap);
    if(showRecap)requestAnimationFrame(()=>{
     if(!recap.hidden)window.scrollTo({top:Math.max(0,scrollY+recap.getBoundingClientRect().top-12),behavior:'instant'});
    });
   }
  },
  hide(){
   impact.hidden=true;
   if(!recap.hidden){
    recap.hidden=true;
    delete document.body.dataset.mangkhutRecap;
   }
  }
 };
}
