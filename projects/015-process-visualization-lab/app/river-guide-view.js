import {formatRiverElapsed,RIVER_BANKS} from './river-evidence.js';

export function createRiverGuideView(host,onSeek) {
 const note=document.createElement('aside');
 note.className='river-guide-note';
 note.hidden=true;
 note.innerHTML='<span></span><strong></strong><small></small>';
 host.append(note);
 const [timeLabel,title,method]=note.children;

 const panel=document.createElement('section');
 panel.className='observation-recap river-recap';
 panel.setAttribute('aria-labelledby','river-recap-title');
 panel.hidden=true;
 panel.innerHTML=`<div><span>结论 · 相对释放时间</span><h2 id="river-recap-title">三个断面的首岸记录依次出现</h2>
  <p></p></div><div class="observation-recap-actions"></div>`;
 const explanation=panel.querySelector('p'),actions=panel.querySelector('.observation-recap-actions');
 host.before(panel);
 const ruleText=rule=>`回看判定 · 连续 ${rule.consecutiveSamples} 笔 ≥ ${rule.thresholdPpb} ppb，以首笔计`;
 return {
  setNote(beat,rule) {
   note.hidden=!beat;
   if(!beat)return;
   note.dataset.bank=beat.riverBank??'';
   timeLabel.textContent=beat.riverBank?formatRiverElapsed(beat.tick)+' · 相对释放':'Big Piney 河 · USGS 实测';
   title.textContent=beat.label;
   method.textContent=beat.riverShot==='section'&&rule
    ?'白刻线 '+rule.thresholdPpb+' ppb · 柱高放大小值 · 读数为实测'
    :'青色左岸 · 金色右岸 · 六个测点使用同一浓度尺度';
  },
  show(data) {
   if(!panel.hidden||!data.signalRule)return null;
   const firstSignals=data.transects.map(section=>{
    const bank=section.banks.filter(item=>Number.isFinite(item.sustainedSignal?.elapsedSeconds))
     .sort((a,b)=>a.sustainedSignal.elapsedSeconds-b.sustainedSignal.elapsedSeconds)[0];
    return bank?{section,bank,elapsed:bank.sustainedSignal.elapsedSeconds}:null;
   }).filter(Boolean);
   if(!firstSignals.length)return null;
   explanation.textContent=ruleText(data.signalRule);
   actions.replaceChildren(...firstSignals.map(reading=>{
    const {section,bank,elapsed}=reading,button=document.createElement('button');
    button.type='button';
    button.dataset.riverReviewStation=section.id;
    button.dataset.riverReviewElapsed=String(elapsed);
    button.textContent=`${section.label} · ${RIVER_BANKS[bank.bank].label} ${formatRiverElapsed(elapsed)}`;
    button.addEventListener('click',()=>onSeek(reading,'section'));
    return button;
   }));
   panel.hidden=false;
   document.body.dataset.riverRecap='true';
   return firstSignals.at(-1);
  },
  select(station,elapsed) {
   if(panel.hidden)return;
   for(const button of actions.children)button.setAttribute('aria-pressed',String(
    button.dataset.riverReviewStation===station&&Number(button.dataset.riverReviewElapsed)===elapsed));
  },
  locate() {
   requestAnimationFrame(()=>{
    if(panel.hidden)return;
    const top=Math.min(panel.getBoundingClientRect().top,host.parentElement.querySelector('.timeline').getBoundingClientRect().top);
    window.scrollTo({top:Math.max(0,scrollY+top-12),behavior:'instant'});
   });
  },
  hide() {
   if(panel.hidden)return false;
   panel.hidden=true;
   delete document.body.dataset.riverRecap;
   return true;
  },
 };
}
