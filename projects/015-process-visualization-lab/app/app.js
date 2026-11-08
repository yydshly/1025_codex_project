import {SCENARIOS,compute,sampleSeries} from './models.js';
import {createEngine} from './webgl-engine.js';

const $=s=>document.querySelector(s);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors=['#83e0d9','#efb27b','#b9b0ee'];
const names={orbital:['天体与潮汐','ORBITAL SYSTEM'],volcano:['火山内部','VOLCANIC PROCESS'],quake:['地震传播','SEISMIC WAVES'],typhoon:['台风演变','TROPICAL CYCLONE'],river:['河流与污染物','RIVER TRANSPORT'],battery:['电池与能量','BATTERY SYSTEM']};
const paths={orbital:'M4 16a12 6 0 1 0 24 0 12 6 0 1 0-24 0M16 11a5 5 0 1 0 0 10 5 5 0 1 0 0-10M27 12h.1',volcano:'M3 27 13 8h6l10 19ZM12 10l4 6 4-6M15 5l-2-3m6 3 2-3M8 27l4-7m10 7-3-7',quake:'M2 17h6l3-9 5 17 4-14 3 6h7M4 28h10l4-5 3 5h7',typhoon:'M24 7c-9-6-20 0-19 9M8 25c9 6 20 0 19-9M16 11a5 5 0 1 0 0 10 5 5 0 1 0 0-10',river:'M3 5c17 0-2 9 15 12s-5 9 11 10M2 12c10 0-2 7 8 10M24 3v10m-3-3 3 3 3-3',battery:'M7 6h18v23H7ZM12 3h8M11 11h10m-5-3v6m-5 9h10M9 17h14'};
const questions={orbital:'把轨道距离调大：相对潮汐指数如何变化？这与月相的明暗变化是同一件事吗？',volcano:'同一时刻，提高驱动压力，岩浆上升与喷出活动怎样变化？再调黏滞程度比较。',quake:'把震源调深，第一道波到地表的时刻会怎样变化？P波和S波谁先到？',typhoon:'保持最大风速，改变涡旋尺度，影响范围如何变化？再比较风速与中心压差。',river:'分别提高流速和扩散系数：污染峰是更早到达，还是被摊得更宽？',battery:'把放电电流加倍，再增加散热系数：电量、电压和温升分别如何变化？'};
const scales={orbital:'天体尺寸与距离分别缩放',volcano:'橙：岩浆 · 灰：喷出物',quake:'青：P波 · 紫：S波',typhoon:'示意云体 · 金点为模型测点',river:'颜色强度表示相对浓度',battery:'青：锂离子 · 金：电子'};

const state={id:'orbital',progress:.21,running:!matchMedia('(prefers-reduced-motion: reduce)').matches,speed:1,params:{},view:{yaw:0,pitch:0},clock:0};
const baselines=new Map();
let scenario,series=[],last=0,uiTime=0,chartSize={w:0,h:0},stageSize={w:0,h:0};
const canvas=$('#scene-canvas'),chart=$('#chart-canvas'),chartCtx=chart.getContext('2d');
const engine=createEngine(canvas,$('#scene-labels'),$('#scene-loading'));
if(!chartCtx)throw new Error('浏览器未提供图表绘制功能。');
const format=(v,precision)=>{
 if(!Number.isFinite(v))return '—';
 if(Math.abs(v)>=10000000)return v.toExponential(2);
 return new Intl.NumberFormat('zh-CN',{maximumFractionDigits:precision??(Math.abs(v)<1?3:Math.abs(v)<10?2:1)}).format(v);
};
function modelTime(p){return `${format(p*scenario.duration,scenario.duration<40?2:1)} ${scenario.unit}`;}
function route(id,updateHash=true){
 scenario=SCENARIOS.find(s=>s.id===id)||SCENARIOS[0];state.id=scenario.id;
 state.params=Object.fromEntries(scenario.params.map(p=>[p.key,p.value]));state.progress=({orbital:.21,volcano:.72,quake:.16,typhoon:.5,river:.46,battery:.32})[scenario.id];state.view={yaw:0,pitch:0};
 $('#scenario-nav').innerHTML=SCENARIOS.map((s,i)=>`<button class="scenario-button" type="button" data-scene="${esc(s.id)}" aria-pressed="${state.id===s.id}"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="${paths[s.id]}"/></svg><span><strong>${names[s.id][0]}</strong><small>${String(i+1).padStart(2,'0')} / ${names[s.id][1]}</small></span></button>`).join('');
 $('#scene-eyebrow').textContent=`EXPERIMENT ${String(SCENARIOS.indexOf(scenario)+1).padStart(2,'0')} / ${names[state.id][1]}`;
 $('#scene-title').textContent=scenario.title;
 $('#scene-subtitle').textContent=scenario.subtitle;
 $('#model-kind').textContent=({orbital:'几何模型',volcano:'过程示意',quake:'波传播模型',typhoon:'理想风场',river:'解析输运模型',battery:'简化电热模型'})[state.id];
 $('#time-kind').textContent=state.id==='volcano'?'演示时间':'模型时间';
 $('#question').textContent=questions[state.id];$('#scene-scale').textContent=scales[state.id];
 $('#limitation').textContent=scenario.limitation;
 $('#sources').innerHTML=scenario.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a></li>`).join('');
 $('#params').innerHTML=scenario.params.map(p=>`<div class="parameter"><label for="param-${p.key}">${esc(p.label)}<output id="output-${p.key}" for="param-${p.key}">${format(p.value)} ${esc(p.unit)}</output></label><input id="param-${p.key}" data-param="${p.key}" aria-label="${esc(p.label)}" type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}"></div>`).join('');
 $('#notice').textContent='';series=sampleSeries(state.id,state.params);if(updateHash)history.replaceState(null,'','#'+state.id);updateUi();resize();
}
function updateUi(){
 const data=compute(state.id,state.progress,state.params),baseline=baselines.get(state.id);
 $('#metrics').innerHTML=data.metrics.map((m,i)=>{const delta=baseline?m.value-baseline.metrics[i].value:null;return `<div class="metric" style="--metric-color:${series[i]?.color||colors[i]}"><div class="metric-label">${esc(m.label)}</div><div class="metric-value">${format(m.value)}<small>${esc(m.unit)}</small></div>${delta===null?'':`<div class="metric-delta">相对记录 ${delta>0?'+':''}${format(delta)} ${esc(m.unit)}</div>`}</div>`;}).join('');
 $('#phase-label').textContent=data.phase;$('#explanation').textContent=data.explanation;$('#scene-coordinate').textContent=`T ${format(state.progress*100,1)}% / ${data.phase}`;
 $('#time-slider').value=Math.round(state.progress*1000);$('#time-current').textContent=modelTime(state.progress);$('#time-total').textContent='总长 '+modelTime(1);
 $('#chart-domain').textContent=`0 — ${modelTime(1)}`;
 $('#play').textContent=state.running?'Ⅱ':'▶';$('#play').setAttribute('aria-label',state.running?'暂停过程':'播放过程');
 $('#baseline-note').hidden=!baseline;if(baseline)$('#baseline-note').textContent=`已记录 ${modelTime(baseline.progress)} · 调参后查看读数差值`;
 if(new URLSearchParams(location.search).has('embedded')&&parent!==window)parent.postMessage({type:'process-state',id:state.id,progress:state.progress,params:state.params,running:state.running},location.origin); return data;
}
function setupCanvas(el,size){
 const b=el.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);size.w=b.width;size.h=b.height;
 if(el.width!==Math.round(b.width*dpr)||el.height!==Math.round(b.height*dpr)){el.width=Math.round(b.width*dpr);el.height=Math.round(b.height*dpr);}
 const c=el.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
}
function resize(){const b=canvas.getBoundingClientRect();stageSize={w:b.width,h:b.height};engine.resize(b.width,b.height);setupCanvas(chart,chartSize);renderFrame();}
function renderChart(){
 const c=chartCtx,{w,h}=chartSize;if(w<10||h<10)return;c.clearRect(0,0,w,h);
 const left=5,right=w-37,plotLeft=5,plotRight=w-38,rowH=(h-10)/3;
 series.forEach((s,index)=>{
  const top=index*rowH+4,points=s.points.filter(p=>Number.isFinite(p.y));if(!points.length)return;
  let min=Math.min(...points.map(p=>p.y)),max=Math.max(...points.map(p=>p.y));if(max-min<1e-8){min-=.5;max+=.5;}const pad=(max-min)*.12;min=Math.max(0,min-pad);max+=pad;if(s.unit==='%')max=Math.min(100,max);
  const y0=top+23,y1=top+rowH-10,X=x=>plotLeft+x*(plotRight-plotLeft),Y=y=>y1-(y-min)/(max-min)*(y1-y0);
  c.font='9px "Segoe UI","Microsoft YaHei",sans-serif';c.fillStyle='#829eae';c.fillText(`${s.label} / ${s.unit}`,left,top+9);
  c.strokeStyle='#29414d';c.lineWidth=.7;for(let k=0;k<2;k++){let y=y0+k*(y1-y0);c.beginPath();c.moveTo(plotLeft,y);c.lineTo(plotRight,y);c.stroke();}
  c.font='8px ui-monospace,monospace';c.fillStyle='#526f80';c.fillText(format(max),right+6,y0+3);c.fillText(format(min),right+6,y1+3);
  c.beginPath();points.forEach((p,i)=>i?c.lineTo(X(p.x),Y(p.y)):c.moveTo(X(p.x),Y(p.y)));c.strokeStyle=s.color||colors[index];c.lineWidth=1.5;c.stroke();
  const val=compute(state.id,state.progress,state.params).metrics[index].value,px=X(state.progress),py=Y(val);
  c.save();c.strokeStyle='#e0f4ee55';c.setLineDash([2,3]);c.beginPath();c.moveTo(px,y0-3);c.lineTo(px,y1+3);c.stroke();c.restore();
  c.fillStyle=s.color||colors[index];c.beginPath();c.arc(px,py,3,0,Math.PI*2);c.fill();
 });
}
function renderFrame(){
 const data=compute(state.id,state.progress,state.params),{w,h}=stageSize;if(w>0&&h>0)engine.render(state.id,data,state);renderChart();
}
function animate(timestamp){
 const dt=last?Math.min((timestamp-last)/1000,.1):0;last=timestamp;state.clock=timestamp/1000;
 if(state.running){state.progress+=dt/40*state.speed;if(state.progress>=1){state.progress=1;state.running=false;}}
 renderFrame();if(timestamp-uiTime>110){updateUi();uiTime=timestamp;}requestAnimationFrame(animate);
}
$('#scenario-nav').addEventListener('click',e=>{const b=e.target.closest('[data-scene]');if(!b)return;route(b.dataset.scene);$(`#scenario-nav [data-scene="${state.id}"]`).focus({preventScroll:true});});
$('#params').addEventListener('input',e=>{const key=e.target.dataset.param;if(!key)return;state.params[key]=Number(e.target.value);const p=scenario.params.find(p=>p.key===key);$('#output-'+key).textContent=`${format(state.params[key])} ${p.unit}`;series=sampleSeries(state.id,state.params);updateUi();renderFrame();});
$('#play').addEventListener('click',()=>{if(state.progress>=1)state.progress=0;state.running=!state.running;updateUi();});
$('#restart').addEventListener('click',()=>{state.progress=0;state.running=true;updateUi();renderFrame();});
$('#time-slider').addEventListener('input',e=>{state.progress=Number(e.target.value)/1000;state.running=false;updateUi();renderFrame();});
$('#speed').addEventListener('change',e=>state.speed=Number(e.target.value));
$('#reset-params').addEventListener('click',()=>{const progress=state.progress,running=state.running;route(state.id);state.progress=progress;state.running=running;updateUi();renderFrame();});
$('#focus-view').addEventListener('click',()=>{const on=document.body.classList.toggle('focus-view');$('#focus-view').textContent=on?'返回实验 ↙':'专注观看 ⤢';resize();});
$('#view-reset').addEventListener('click',()=>{state.view={yaw:0,pitch:0};engine.resetView();renderFrame();});
$('#record').addEventListener('click',()=>{const data=compute(state.id,state.progress,state.params);baselines.set(state.id,{progress:state.progress,params:{...state.params},metrics:data.metrics});$('#notice').textContent='已记录当前读数。改变参数或时间，查看相对差值。';updateUi();});
$('#alternate').addEventListener('click',()=>{state.running=false;for(const p of scenario.params){const current=state.params[p.key],target=current>(p.min+p.max)/2?p.min+(p.max-p.min)*.25:p.min+(p.max-p.min)*.8;const val=Math.round(target/p.step)*p.step;state.params[p.key]=Math.max(p.min,Math.min(p.max,Number(val.toFixed(5))));const input=$('#param-'+p.key);input.value=state.params[p.key];$('#output-'+p.key).textContent=`${format(state.params[p.key])} ${p.unit}`;}series=sampleSeries(state.id,state.params);updateUi();renderFrame();$('#notice').textContent='已切换一组条件。时间保持不变，便于比较。';});
$('#export').addEventListener('click',()=>{const observation={product:'观象·过程实验室',version:'2.0',scenario:state.id,title:scenario.title,modelType:'教学模型，非实时观测',progress:state.progress,modelTime:modelTime(state.progress),parameters:{...state.params},result:compute(state.id,state.progress,state.params),baseline:baselines.get(state.id)||null,limitation:scenario.limitation,sources:scenario.sources,createdAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(observation,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`process-atlas-${state.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#notice').textContent='观察记录已导出，包含参数、读数、模型范围与来源。';});
$('#about-open').addEventListener('click',()=>{$('#model-details').open=true;$('#model-details').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});});
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key===' '){state.running=!state.running;if(state.progress>=1)state.progress=0;}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){state.running=false;state.progress=Math.max(0,Math.min(1,state.progress+(e.key==='ArrowRight'?.02:-.02)));}updateUi();renderFrame();});
document.addEventListener('visibilitychange',()=>last=0);
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(SCENARIOS.some(s=>s.id===id)&&id!==state.id)route(id,false);});
new ResizeObserver(resize).observe($('#stage'));new ResizeObserver(()=>{setupCanvas(chart,chartSize);renderChart();}).observe(chart);
route(location.hash.slice(1)||'orbital'); const initialQuery=new URLSearchParams(location.search); if(initialQuery.has('embedded')){state.running=false;state.progress=Math.max(0,Math.min(1,Number(initialQuery.get('progress'))||0));try{const incoming=JSON.parse(initialQuery.get('params')||'{}');for(const p of scenario.params){const n=Number(incoming[p.key]);if(Number.isFinite(n)){state.params[p.key]=Math.max(p.min,Math.min(p.max,n));$('#param-'+p.key).value=state.params[p.key];$('#output-'+p.key).textContent=format(state.params[p.key])+' '+p.unit;}}}catch{}series=sampleSeries(state.id,state.params);updateUi();renderFrame();}requestAnimationFrame(animate);
