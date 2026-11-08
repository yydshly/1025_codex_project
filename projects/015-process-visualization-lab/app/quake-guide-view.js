const stationNames={MAJO:'松代',INCN:'仁川',TATO:'台北'};
const localClock=new Intl.DateTimeFormat('zh-CN',{
 timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23',
});

export function createQuakeGuideView(host,onSeek){
 const legend=document.createElement('div');
 legend.className='quake-guide-key';
 legend.innerHTML='<strong>本站仪器计数 · 一秒实测</strong><span>青色正值 · 紫色负值 · 金点为绝对峰值所在的读数</span>';
 host.append(legend);

 const panel=document.createElement('section');
 panel.className='observation-recap quake-recap';
 panel.setAttribute('aria-labelledby','quake-recap-title');
 panel.hidden=true;
 panel.innerHTML=`<div><span>结论 · UTC+8</span><h2 id="quake-recap-title">各台站的绝对峰值出现在不同时间</h2>
  <p>点击窗末时刻核对实测。地震波初到需从波形另行识别。</p></div><div class="observation-recap-actions"></div>`;
 host.before(panel);
 const actions=panel.querySelector('.observation-recap-actions');
 return {
  show(data,stationIds){
   if(!panel.hidden)return null;
   const readings=stationIds.map(id=>{
    const station=data.stations.find(item=>item.id===id);
    const sample=station?.samples.reduce((peak,reading)=>
     Number.isFinite(reading.value)&&(!peak||Math.abs(reading.value)>Math.abs(peak.value))?reading:peak,null);
    return sample?{station,time:sample.timeUtc}:null;
   }).filter(Boolean).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));
   if(!readings.length)return null;
   actions.replaceChildren(...readings.map(reading=>{
    const {station,time}=reading,button=document.createElement('button');
    button.type='button';
    button.dataset.stationId=station.id;button.dataset.timeUtc=time;
    button.textContent=(stationNames[station.stationCode]??station.stationCode??station.id)+' · '+localClock.format(new Date(time));
    button.addEventListener('click',()=>onSeek(reading));
    return button;
   }));
   panel.hidden=false;document.body.dataset.quakeRecap='true';
   return readings.at(-1);
  },
  locate(){
   requestAnimationFrame(()=>{
    if(!panel.hidden)window.scrollTo({top:Math.max(0,scrollY+panel.getBoundingClientRect().top-12),behavior:'instant'});
   });
  },
  select(id,time){
   if(panel.hidden)return;
   for(const button of actions.children){
    button.setAttribute('aria-pressed',String(button.dataset.stationId===id&&Date.parse(button.dataset.timeUtc)===Date.parse(time)));
   }
  },
  hide(){
   if(panel.hidden)return;
   panel.hidden=true;delete document.body.dataset.quakeRecap;
  },
 };
}
