const label = (x,y,text,anchor='start') => `<text x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;
const stage = (index,art) => `<g data-geology-stage="${index}"${index?' style="display:none"':''}>${art}</g>`;
const arrow = (d,color='cyan') => `<path d="${d}" class="accent ${color}" marker-end="url(#geology-arrow-${color})"/>`;
const arrowDefs = `<defs>${[['cyan','#6fe5e0'],['orange','#ffb377']].map(([name,color])=>
 `<marker id="geology-arrow-${name}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M1 1L9 5L1 9Z" fill="${color}"/></marker>`).join('')}</defs>`;
const clamp = value => Math.max(0,Math.min(1,value));
const selectStage = (svg,index) => {
 const stages = svg.querySelectorAll('[data-geology-stage]');
 for(const [i,item] of stages.entries())item.style.display = i===index?'':'none';
 return stages[index];
};
const circle = (x,y,r,css) => `<circle cx="${x}" cy="${y}" r="${r}" class="${css}"/>`;

const fault = 'M280 127L424 340';
const ground = `<path class="geology-rock" d="M0 127H640V340H0Z"/>
 <path class="geology-rock-light" d="M0 127H280L424 340H0Z"/>`;
const layers = [167,206,245,284].map(y=>{
 const end=280+(y-127)*144/213;
 return `<path data-fault-layer="${y}" class="geology-strata" d="M0 ${y}H${end}"/>`;
}).join('');
const eastLayers = [167,206,245,284].map(y=>{
 const start=280+(y-127)*144/213;
 return `<path class="geology-strata" d="M${start} ${y}H640"/>`;
}).join('');
const faultBlocks = `<g data-fault-west><path class="geology-rock-light" d="M0 127H280L424 340H0Z"/>${layers}</g>
 <g data-fault-east><path class="geology-rock" d="M280 127H640V340H424Z"/>${eastLayers}</g>
 <path class="geology-fault" d="${fault}"/>`;
const stress = (path) => `<g>
 <rect x="442" y="19" width="174" height="103" rx="8" class="geology-chart"/>
 ${label(454,42,'断层附近应力 · 示意')}
 <path class="geology-axis" d="M458 52V100H599"/>
 <path data-stress-path class="accent orange" style="stroke-width:2.5" d="${path}"/>
 <circle data-geology-stress r="4.5" class="hot"/>
 </g>`;

const origin={x:298,y:166};
const waves=[{speed:340,color:'geology-p-wave'},{speed:225,color:'geology-s-wave'}];
const stations=[{x:184,label:'近台 A',row:252},{x:480,label:'远台 B',row:296}];
const surfaceY=87, waveStartX=110, waveWidth=500;
const record = (time,station) => {
 const distance=Math.hypot(station.x-origin.x,surfaceY-origin.y);
 const pulse=(elapsed,amplitude,frequency)=>elapsed<0?0:amplitude*Math.exp(-9*elapsed)*Math.sin(frequency*elapsed);
 return pulse(time-distance/waves[0].speed,6,155)+pulse(time-distance/waves[1].speed,13,120);
};
const wavePanel = `<defs><clipPath id="quake-wave-ground"><rect x="0" y="${surfaceY}" width="640" height="133"/></clipPath></defs>
 <path class="geology-rock" d="M0 ${surfaceY}H640V220H0Z"/>
 <path class="geology-fault" d="M255 ${surfaceY}L323 220" opacity=".65"/>
 <g clip-path="url(#quake-wave-ground)">${waves.map(wave=>circle(origin.x,origin.y,0,wave.color)).join('')}</g>
 ${circle(origin.x,origin.y,6,'hot')}${label(316,181,'震源')}
 ${label(26,32,'青线 纵波（P）')}${label(262,32,'紫线 横波（S）')}
 ${stations.map(station=>`${label(station.x,62,station.label,'middle')}<path class="geology-axis" d="M${station.x-7} 84V71H${station.x+7}V84Z"/>${circle(station.x,surfaceY,4,'geology-receiver')}`).join('')}
 <rect x="22" y="226" width="596" height="94" rx="8" class="geology-chart"/>
 ${stations.map(station=>`${label(39,station.row+5,station.label)}<path class="geology-axis" d="M${waveStartX} ${station.row}H610"/><polyline data-lesson-trace class="geology-waveform"/>`).join('')}
 <path data-wave-cursor class="geology-axis" stroke-dasharray="3 3"/>${label(615,337,'示意时间 →','end')}`;

export const quakePrimerDiagram = {
 art: arrowDefs +
  stage(0,`${ground}${eastLayers}${layers}<path class="geology-fault" d="${fault}"/>
   ${arrow('M38 86H177')}${arrow('M407 86H267')}
   <circle cx="336" cy="210" r="11" class="geology-lock"/>${label(354,215,'摩擦锁住这一段')}
   ${label(30,38,'两侧岩体缓慢相对移动')}${label(478,307,'断层面')}`) +
  stage(1,`${faultBlocks}${arrow('M32 92H158')}${arrow('M418 92H296')}
   <circle cx="336" cy="210" r="10" class="geology-lock"/>${label(360,214,'这一段仍锁住')}
   ${label(26,36,'岩层弯曲，储存弹性能量')}
   ${stress('M459 97Q510 94 575 60')}`) +
  stage(2,`${faultBlocks}
   ${arrow('M221 256L172 186','orange')}${arrow('M448 166L495 236','orange')}
   ${circle(336,210,6,'hot')}<path data-rupture class="accent orange" pathLength="1" d="M336 210L405 310"/>
   ${label(28,43,'超过阻力，断层开始滑动')}${label(360,199,'破裂从这里扩展')}
   ${stress('M459 97Q490 87 520 57V87H597')}`) +
  stage(3,wavePanel),
 update(svg,phase,progress,reducedMotion){
  const shown=selectStage(svg,phase), p=reducedMotion?.86:progress;
  if(phase===1){
   for(const layer of shown.querySelectorAll('[data-fault-layer]')){
    const y=Number(layer.dataset.faultLayer), x=280+(y-127)*144/213;
    layer.setAttribute('d',`M0 ${y}H${x-108}Q${x-56} ${y-25*p} ${x} ${y}`);
   }
   const stressPath=shown.querySelector('[data-stress-path]');
   moveAlong(stressPath,shown.querySelector('[data-geology-stress]'),p);
  }
  if(phase===2){
   const slip=clamp(.20+p*2.2);
   shown.querySelector('[data-fault-west]').setAttribute('transform',`translate(${-12*slip} ${-18*slip})`);
   shown.querySelector('[data-fault-east]').setAttribute('transform',`translate(${6*slip} ${9*slip})`);
   shown.querySelector('[data-rupture]').style.strokeDasharray=slip+' 1';
   const stressPath=shown.querySelector('[data-stress-path]');
   moveAlong(stressPath,shown.querySelector('[data-geology-stress]'),.34+.66*p);
  }
  if(phase===3){
   const time=.18+.82*clamp(p*2.4);
   for(const wave of waves)shown.querySelector('.'+wave.color).setAttribute('r',wave.speed*time);
   for(const [index,trace] of shown.querySelectorAll('[data-lesson-trace]').entries()){
    const station=stations[index], points=[];
    for(let tick=0;tick<=180*time;tick++){
     const t=tick/180;
     points.push(`${(waveStartX+t*waveWidth).toFixed(1)},${(station.row-record(t,station)).toFixed(1)}`);
    }
    trace.setAttribute('points',points.join(' '));
   }
   const x=waveStartX+waveWidth*time;
   shown.querySelector('[data-wave-cursor]').setAttribute('d',`M${x} 230V313`);
   for(const [i,dot] of shown.querySelectorAll('.geology-receiver').entries()){
    const s=stations[i],distance=Math.hypot(s.x-origin.x,surfaceY-origin.y);
    dot.setAttribute('fill',time*waves[1].speed>=distance?'#d6b7ff':time*waves[0].speed>=distance?'#6fe5e0':'#8799ad');
   }
  }
 },
};

function moveAlong(path,dot,progress){
 const point=path.getPointAtLength(path.getTotalLength()*progress);
 dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);
}
