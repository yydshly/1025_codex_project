import {hungaChangeColor,hungaChangeLabel,hungaChangeStops,hungaProfile,hungaSample,hungaSpots,hungaSurveys,hungaVerticalScale,hungaViewLabels} from './hunga-terrain-data.js';

const depth=new Intl.NumberFormat('zh-CN',{maximumFractionDigits:1});
const depthLabel=z=>!Number.isFinite(z)?'无测深':z<=0?depth.format(-z)+' 米':'海拔 '+depth.format(z)+' 米';
const barWidth=z=>Number.isFinite(z)?Math.max(0,Math.min(100,-z/16)):0;
const rgb=channels=>`rgb(${channels.join(',')})`;

function transectChart(data,mode,sample){
 const {cols,stepM}=data.grid;
 const showChange=mode==='change';
 const y=z=>15+(200-z)*.062;
 const x=col=>36+(col+.5)/cols*204;
 const lines=Object.entries(hungaSurveys).map(([key,{color}])=>{
  let pen='M',d='';
  hungaProfile(data,key).forEach((z,col)=>{
   if(!Number.isFinite(z)){pen='M';return;}
   d+=pen+x(col).toFixed(1)+','+y(z).toFixed(1);pen='L';
  });
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${mode===key?2.5:1.6}" opacity="${mode===key||mode==='section'||showChange?1:.57}"/>`;
 }).join('');
 const grid=[0,-500,-1000,-1500].map(z=>`<path d="M36 ${y(z)}H240" stroke="#3c5364" stroke-width=".65"/><text x="32" y="${y(z)+3}" text-anchor="end">${z}</text>`).join('');
 const cx=x(sample.col),dots=Object.entries(hungaSurveys).map(([key,{color}])=>Number.isFinite(sample[key])?`<circle cx="${cx}" cy="${y(sample[key])}" r="3.5" fill="${color}" stroke="#102132"/>`:'').join('');
 let ribbon='';
 if(showChange){
  const cellWidth=204/cols;
  const cells=Array.from(hungaProfile(data,'change'),(value,col)=>{
   const fill=Number.isFinite(value)?rgb(hungaChangeColor(value)):'url(#hunga-profile-gap)';
   return `<rect x="${(x(col)-cellWidth/2).toFixed(3)}" y="133" width="${cellWidth+.02}" height="10" fill="${fill}"/>`;
  }).join('');
  ribbon=`<defs><pattern id="hunga-profile-gap" patternUnits="userSpaceOnUse" width="4" height="4">
   <rect width="4" height="4" fill="#4a5770"/><path d="M0 4L4 0" stroke="#a9b7cc"/></pattern></defs>
   <text x="32" y="141" text-anchor="end">差值</text>${cells}`;
 }
 const base=showChange?163:146;
 return `<svg viewBox="0 0 248 ${base+5}" role="img" aria-label="喷发前后东西向地形剖面${showChange?'和测深差值色带':''}，光标对应三维地形上的测深点">
 <text x="0" y="12">高程 / 米</text>${grid}${lines}${ribbon}<path d="M${cx} 16V${showChange?146:128}" stroke="#e4f0f6" stroke-dasharray="2 3"/>${dots}
 <text x="36" y="${base}">A · 西</text><text x="240" y="${base}" text-anchor="end">东 · A′ / ${cols*stepM/1000} km</text></svg>`;
}

function changeLegend(data){
 const gradient=hungaChangeStops.map(([,color])=>rgb(color)).join(',');
 const labels=hungaChangeStops.map(([value])=>`<span>${value>0?'+':''}${String(value).replace('-','−')}</span>`).join('');
 const cells=data.grid.cols*data.grid.rows;
 return `<div class="hunga-change-scale" aria-label="负值变浅，正值加深，单位米">
  <div class="hunga-change-directions"><b>← 变浅</b><span>水深差 · 米</span><b>加深 →</b></div>
  <div class="hunga-change-gradient" style="background:linear-gradient(90deg,${gradient})"></div>
  <div class="hunga-change-ticks">${labels}</div></div>
  <div class="hunga-change-coverage"><span><i></i> 灰纹 · 任一期缺测</span><small>${(cells-data.paired).toLocaleString('zh-CN')} 格缺测 · 50 米网格</small></div>`;
}

export function renderHungaEvidence($,data,mode,spot){
 const sample=hungaSample(data,spot);
 const survey=hungaViewLabels[mode];
 const showChange=mode==='change';
 $('#topic-title').textContent='洪阿火山 · 海底测绘';
 $('#view-label').textContent='洪阿火山口 · '+survey;
 $('#view-mode').textContent='实测地形 · NIWA · 垂直 '+hungaVerticalScale+'×';
 $('#scale-note').textContent='海底地形 · 两期独立测绘';
 $('#hunga-survey-clock').textContent='喷发前 · '+hungaSurveys.pre.period+' ｜ 喷发后 · '+hungaSurveys.post.period;
 const legend=$('#hunga-change-key');
 legend.hidden=!showChange;
 if(showChange&&!legend.firstElementChild)legend.innerHTML=changeLegend(data);
 $('#current-insight').innerHTML=`<div class="panel-label">同一位置 · 前后测深</div>
 <h3 class="hunga-spot-title">${hungaSpots[spot]}</h3>
 <p class="hunga-point-distance">距剖面西端 ${sample.distanceKm.toFixed(1)} 公里</p>
 ${Object.entries(hungaSurveys).map(([key,s])=>`<div class="hunga-reading${mode===key?' hunga-reading-selected':''}">
  <span>${s.label} · ${s.period}</span><strong style="color:${s.color}">${depthLabel(sample[key])}</strong>
  <div class="hunga-depth-bar"><i style="width:${barWidth(sample[key])}%;background:${s.color}"></i></div></div>`).join('')}`;
 const selectedSurvey=hungaSurveys[mode];
 $('#readout-title').textContent=selectedSurvey?selectedSurvey.label+' · 当前测深':'所选位置的深度变化';
 $('#chart-title').textContent='A–A′ · 同位置剖面';
 $('#chart-domain').textContent='光标＝当前测点';
 const reading=selectedSurvey?depthLabel(sample[mode]):hungaChangeLabel(sample.change);
 const readingContext=selectedSurvey?selectedSurvey.period:'同一格点的两期差值';
 $('#readouts').innerHTML=`<div class="dynamic-metric" data-observation-primary><span>${hungaSpots[spot]}</span><strong>${reading}</strong><small>${readingContext}</small></div>`;
 $('#charts').innerHTML=`<div class="dynamic-chart hunga-chart" data-observation-primary>
  <div class="hunga-profile-legend"><span>喷发前</span><span>喷发后</span></div>${transectChart(data,mode,sample)}</div>`;
 $('#visual-key').innerHTML=showChange
  ?'<span><i style="background:#ffd18a"></i>A–A′ 剖面 · 喷发后地形</span><span>剖面下方的差值色带与三维色标一致</span>'
  :'<span><i style="background:#83f2e5"></i>喷发前剖面</span><span><i style="background:#ffd18a"></i>喷发后剖面</span><span>深色缺口为资料缺失 · 图表保留原值</span>';
 $('#scene-caption').textContent=showChange
  ?'颜色表示同一格点喷发后的水深减去喷发前的水深。点选火山口或坡面，两侧图表会定位到对应测点。'
  :'拖动查看火山坡面，或选一个测点。两侧读数与 A–A′ 剖面会指向同一位置。';
 $('#explanation').textContent=showChange
  ?'以海平面为零，露出海面的格点也按高程计算。色标在零附近加密。两期测绘来源不同，坡面的小差值也可能包含测量或配准差异。'
  :'两期地形是独立测绘成果。前期资料含多波束和卫星测深，后期来自两次航测。底部时间轴对应 2022 年 1 月 15 日的卫星扫描。';
}
