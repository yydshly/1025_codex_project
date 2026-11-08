import {utcMillis,selectObservation} from './sync-timeline.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const localClock=iso=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Hong_Kong',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(iso));
const number=v=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2}).format(v);
const COLORS={wind:'#86ddda',rain:'#93b9ff',seaLevel:'#e6bc80',center:'#d0b1ed'};

export function sampleValue(series,selection){
 if(!selection.sample)return '缺测';
 const s=selection.sample;
 return series.kind==='range'?(s.lower===s.upper?number(s.lower):number(s.lower)+'–'+number(s.upper)):number(s.value);
}
export function sampleClock(series,selection){
 if(!selection.sample){const raw=series.samples[selection.index];if(selection.status==='missing'&&series.id==='rain'&&raw?.windowStartUtc)return localClock(raw.windowStartUtc)+'–'+localClock(raw.timeUtc)+' 原公报未列东区';return selection.status==='before-coverage'?'此时尚无记录':'此时档案缺报，未沿用过时数值';}
 const s=selection.sample;
 if(s.windowStartUtc)return localClock(s.windowStartUtc)+'–'+localClock(s.timeUtc)+' 的累计范围';
 return localClock(s.timeUtc)+' 观测'+(selection.ageMinutes?' · 早于时钟 '+number(selection.ageMinutes)+' 分钟':' · 与时钟同刻');
}

export function observationChart(series,snapshot,bundle){
 const width=290,height=116,left=30,right=9,top=18,bottom=21;
 const start=utcMillis(bundle.startUtc),end=utcMillis(bundle.endUtc),span=end-start;
 const values=series.samples.filter(s=>utcMillis(s.timeUtc)>=start&&utcMillis(s.timeUtc)<=end).flatMap(s=>series.kind==='range'?[s.lower,s.upper]:[s.value]).filter(Number.isFinite);
 const low=series.zeroBaseline?0:Math.floor((Math.min(...values)-.1)*10)/10;
 const high=Math.max(low+1,Math.max(...values)*1.08),X=iso=>left+(utcMillis(iso)-start)/span*(width-left-right),Y=v=>top+(high-v)/(high-low)*(height-top-bottom);
 const selected=selectObservation(series,snapshot.timeUtc),color=COLORS[series.id]??COLORS.center;
 const marks=[],parts=[];let connected=false,previous=null;
 for(const s of series.samples){
  const t=utcMillis(s.timeUtc);if(t<start||t>end)continue;
  const x=X(s.timeUtc),valid=series.kind==='range'?Number.isFinite(s.lower)&&Number.isFinite(s.upper):Number.isFinite(s.value);
  if(!valid){connected=false;previous=null;continue;}
  if(series.kind==='range'){
   const intervalStart=s.windowStartUtc?Math.max(left,X(s.windowStartUtc)):x-3;
   const w=Math.max(3,x-intervalStart),y=Y(s.upper),h=Math.max(2,Y(s.lower)-y);
   marks.push(`<rect x="${intervalStart}" y="${y}" width="${w}" height="${h}" fill="${color}" opacity=".27"/><path d="M${intervalStart} ${y}H${x}M${intervalStart} ${Y(s.lower)}H${x}" stroke="${color}" stroke-width="1.5"/>`);
  }else{
   const y=Y(s.value),gap=previous===null?Infinity:(t-previous)/60000;
   parts.push((connected&&gap<=series.maxAgeMinutes?'L':'M')+x+' '+y);connected=true;previous=t;
   marks.push(`<circle cx="${x}" cy="${y}" r="1.65" fill="${color}"/>`);
  }
 }
 const cursor=X(snapshot.timeUtc),grid=[low,(low+high)/2,high].map(v=>`<path d="M${left} ${Y(v)}H${width-right}" stroke="#294253" stroke-width=".6"/><text x="${left-4}" y="${Y(v)+3}" text-anchor="end" class="chart-axis">${number(v)}</text>`).join('');
 let selectedMark='';
 if(selected.sample){const s=selected.sample,x=X(s.timeUtc);selectedMark=series.kind==='range'?`<path d="M${x} ${Y(s.upper)}V${Y(s.lower)}" stroke="#fff2cf" stroke-width="3"/>`:`<circle cx="${x}" cy="${Y(s.value)}" r="3.8" fill="#fff2cf" stroke="#192d39"/>`;}
 const timeMarks=[0,.25,.5,.75,1].map(f=>`<text x="${left+f*(width-left-right)}" y="${height-3}" text-anchor="${f===0?'start':f===1?'end':'middle'}" class="chart-axis">${localClock(new Date(start+f*span).toISOString())}</text>`).join('');
 return `<section class="sync-chart" data-series="${esc(series.id)}" data-clock="${esc(snapshot.timeUtc)}"><div class="sync-chart-title"><strong>${esc(series.label)}</strong><span style="color:${color}">${sampleValue(series,selected)} ${esc(series.unit)}</span></div><p class="sync-chart-station">${esc(series.station.label)} · ${esc(series.measurementLabel)}</p><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(series.label+'；时钟'+localClock(snapshot.timeUtc)+'；'+sampleClock(series,selected)+'；'+sampleValue(series,selected)+' '+series.unit)}">${grid}<path d="${parts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.2"/>${marks.join('')}<path d="M${cursor} 11V${height-bottom+3}" stroke="#f4d39b" stroke-dasharray="3 2"/>${selectedMark}${timeMarks}</svg><div class="sync-chart-foot"><span>${esc(sampleClock(series,selected))}</span><a href="${esc((selected.sample??series.samples[selected.index])?.sourceUrl??series.source.url)}" target="_blank" rel="noopener">来源 ↗</a></div></section>`;
}

export function observationReadouts(bundle,snapshot){
 return bundle.series.map(series=>{
  const selection=snapshot.observations[series.id];
  return `<article class="sync-readout" data-reading="${esc(series.id)}" data-observed-time="${selection.sample?.timeUtc??''}"><div><span>${esc(series.label)}</span><small>${esc(series.station.label)}</small></div><strong style="color:${COLORS[series.id]}">${sampleValue(series,selection)}<small>${esc(series.unit)}</small></strong><p>${esc(sampleClock(series,selection))}</p></article>`;
 }).join('');
}

export function snapshotReport(bundle,snapshot){
 const statements=bundle.series.map(series=>{
  const selection=snapshot.observations[series.id];
  return `${series.station.label}，${series.label}：${sampleValue(series,selection)} ${series.unit}；${sampleClock(series,selection)}。${series.measurementLabel}。${selection.sample?.publishedAtUtc?'原公报发布时间 '+localClock(selection.sample.publishedAtUtc)+'（UTC+8）。':''}`;
 });
 const cloud=snapshot.cloud.frame;
 const headline='山竹 · 2018年9月16日 '+localClock(snapshot.timeUtc)+' 同步观测';
 const limitations=['时间轴显示香港时间 UTC+8；原始存档使用 UTC。','各曲线保留实际采样时刻，虚线是共同回放时钟；缺测不补零，未报告时不沿用过时数值。','东区降雨是地区内各测站的过去一小时累计范围，不是一个测站的雨量，也不是置信区间。','海水位以 UHSLC 站点零点为基准，未换算为海图基准面，也不是风暴潮增水或街道积水深度。','红外亮温反映云顶及晴空地表、海面的热辐射特征；有效像元不全是云，不直接代表风速或地面降雨。'];
 const sources=[{label:bundle.clouds.label,url:bundle.clouds.source.url},...bundle.series.map(s=>({label:s.station.label+' · '+s.label,url:(snapshot.observations[s.id].sample??s.samples[snapshot.observations[s.id].index])?.sourceUrl??s.source.url}))];
 const cloudText=cloud?`卫星帧名义时刻 ${cloud.timeUtc}；${bundle.clouds.label}。`:'该时刻无可用卫星帧。';
 const text=[headline,'统一时间：'+snapshot.timeUtc,cloudText,...statements,...limitations,...sources.map(s=>s.label+'：'+s.url)].join('\n\n');
 return {headline,statements:[cloudText,...statements],limitations,sources,text};
}
