import {compute,SCENARIOS} from './models.js';

// Instantaneous views derived only from the model state used by the globe.
// No animation clocks, random data, observations or separate simulations here.
const COLORS={cyan:'#63e4ed',purple:'#bca7ff',orange:'#ffae6b',green:'#56e5d0',gold:'#ffd18b'};
const TAU=Math.PI*2;
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const phaseAngle=x=>((x%TAU)+TAU)%TAU;

function common(id,progress,data){
 const scenario=SCENARIOS.find(s=>s.id===id);
 return {id,title:'',kind:'profile',xLabel:'',yLabel:'',domain:{x:[0,1],y:[0,1]},points:[],marker:null,caption:'',legend:[],phase:data.phase,time:{value:progress*scenario.duration,unit:scenario.unit}};
}

/**
 * A descriptor for the LEFT chart at the exact current globe state.
 * profile: points, marker, optional reference {x,y,label} in data units.
 * bars: rows {key,label,value,max,unit,color}; values retain actual units.
 * wavefront: fronts {label,radius,color,arrived,arrivalSeconds,speedKmS}, depth.
 * phase: illumination [0,1], waxing, elongationDeg and relativeTide.
 */
export function getProcessInsight(id,progress=0,params={}){
 const p=clamp(Number.isFinite(Number(progress))?Number(progress):0,0,1);
 const data=compute(id,p,params),s=data.scene,out=common(id,p,data);
 if(id==='orbital'){
  const relative=phaseAngle(s.angle-s.sunAngle);
  // Illumination comes from full 3D geometry including inclination. The
  // longitude angle below is explanatory, not recomputed as the phase fraction.
  return {...out,kind:'phase',title:'从地球看月相',xLabel:'月相',yLabel:'受光比例',illumination:s.illumination,waxing:relative<Math.PI,elongationDeg:Math.acos(clamp(1-2*s.illumination,-1,1))*180/Math.PI,longitudeAngleDeg:relative*180/Math.PI,relativeTide:s.tideIndex,moonAngle:s.angle,sunAngle:s.sunAngle,legend:[{label:'受光部分',color:'#d9e4ee'},{label:'背光部分',color:'#203342'}],caption:'这里显示地球所见月相；中央地球旁的月球来自太空视角，明暗外观可以不同。潮汐读数为相对幅度。'};
 }
 if(id==='volcano'){
  const rows=[
   {key:'magmaFlow',label:'岩浆喷出',value:s.magmaFlow,max:1,unit:'指数',color:COLORS.orange},
   {key:'plume',label:'烟柱发展',value:s.plume,max:1,unit:'指数',color:'#aebbc7'},
   {key:'ash',label:'火山灰强度',value:s.ash,max:1,unit:'指数',color:'#7d91a7'},
  ];
  return {...out,kind:'bars',title:'喷发结构 · 当前状态',rows,domain:{x:[0,1],y:[0,3]},xLabel:'归一化强度',yLabel:'画面通道',legend:rows.map(r=>({label:r.label,color:r.color})),caption:'三项指数分别对应岩浆喷出、烟柱发展与火山灰强度，不代表实测高度或物质流量。'};
 }
 if(id==='quake'){
  const fronts=[
   {label:'P 波',radius:s.frontP,color:COLORS.cyan,arrived:s.waveAge>=s.arrivals.p,arrivalSeconds:s.arrivals.p,speedKmS:s.vp},
   {label:'S 波',radius:s.frontS,color:COLORS.purple,arrived:s.waveAge>=s.arrivals.s,arrivalSeconds:s.arrivals.s,speedKmS:s.vs},
  ];
  return {...out,kind:'wavefront',title:'地表波前 · 当前范围',fronts,depth:s.depth,elapsedSeconds:s.waveAge,maxRadius:360,domain:{x:[0,360],y:[0,360]},xLabel:'地表半径 / km',yLabel:'',legend:fronts.map(f=>({label:f.label,color:f.color})),caption:`震中 P 波 ${s.arrivals.p.toFixed(1)} s、S 波 ${s.arrivals.s.toFixed(1)} s 到达。这里显示模型公里数，地球上的波环另作可视化放大。`};
 }
 if(id==='typhoon'){
  const maxX=Math.max(3*s.radius,s.stationDistance*1.08,350);
  const at=x=>s.wind*(x<=s.radius?x/s.radius:s.radius/Math.max(1,x));
  // Include the exact peak and station in the samples, avoiding a near-peak
  // underestimate when the uniform sample grid misses the maximum-wind radius.
  const xs=[...Array.from({length:81},(_,i)=>maxX*i/80),s.radius,s.stationDistance];
  const points=[...new Set(xs)].sort((a,b)=>a-b).map(x=>({x,y:at(x)}));
  return {...out,title:'风眼 → 外围风速',points,domain:{x:[0,maxX],y:[0,Math.max(1,s.wind)*1.08]},xLabel:'距风眼 / km',yLabel:'风速 / m/s',marker:{x:s.stationDistance,y:s.localWind,label:'地球上的金色测点',color:COLORS.gold},reference:{x:s.radius,y:s.wind,label:'最大风半径',color:COLORS.cyan},legend:[{label:'理想径向风速',color:COLORS.cyan},{label:'固定测点',color:COLORS.gold}],caption:'曲线是当前时刻的径向风速分布。金点与地球测点对应：随风眼移动，在这条曲线上改变位置。'};
 }
 if(id==='river'){
  const at=x=>s.peakConcentration*Math.exp(-((x-s.center)**2)/(2*s.spread*s.spread));
  const xs=[...Array.from({length:101},(_,i)=>s.domainLength*i/100),s.station];
  if(s.center>=0&&s.center<=s.domainLength)xs.push(s.center);
  const points=[...new Set(xs)].sort((a,b)=>a-b).map(x=>({x,y:at(x)}));
  // Keep the axis above the visible profile even after its peak leaves the
  // displayed reach. Never imply disappearance means chemical removal.
  const visibleMax=Math.max(...points.map(point=>point.y),s.concentration,1e-9);
  return {...out,title:'当前河段的浓度剖面',points,domain:{x:[0,s.domainLength],y:[0,visibleMax*1.12]},xLabel:'下游距离 / m',yLabel:'浓度 / mg/L',marker:{x:s.station,y:s.concentration,label:'1000 m 监测点',color:COLORS.gold},reference:{x:clamp(s.center,0,s.domainLength),y:at(clamp(s.center,0,s.domainLength)),label:s.center>s.domainLength?'羽流中心已离开河段':'羽流中心',color:COLORS.green},legend:[{label:'浓度剖面',color:COLORS.green},{label:'监测点',color:COLORS.gold}],caption:'剖面沿同一条 0–2000 m 假想河段。纵轴随当前范围调整；离开画面域不等于降解或污染物消失。'};
 }
 if(id==='battery'){
  const cooling=Math.max(0,s.cooling*(s.temp-s.ambient));
  const max=Math.max(s.power,s.loss,cooling,1);
  const rows=[
   {key:'power',label:'对外输出',value:s.power,max,unit:'W',color:COLORS.cyan},
   {key:'loss',label:'内阻产热',value:s.loss,max,unit:'W',color:COLORS.orange},
   {key:'cooling',label:'向环境散热',value:cooling,max,unit:'W',color:COLORS.purple},
  ];
  return {...out,kind:'bars',title:'电功率与热流',rows,domain:{x:[0,max],y:[0,3]},xLabel:'功率 / W',yLabel:'',heatStorageRate:s.loss-cooling,legend:rows.map(r=>({label:r.label,color:r.color})),caption:'输出与产热是电功率分配；产热和散热的差决定温升。三条共用瓦特刻度，停止放电后仍可散热。'};
 }
 throw new RangeError(`Unknown scenario: ${String(id)}`);
}
