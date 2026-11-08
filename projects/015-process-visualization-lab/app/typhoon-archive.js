import {validateEventDataset,recordAtIndex,metricSeries,formatTime} from './real-event-data.js';

const SOURCES=Object.freeze([
 {label:'JMA · 山竹事后最佳路径原始档案',url:'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html'},
 {label:'NASA · 2018年9月14日山竹真实卫星影像',url:'https://science.nasa.gov/earth/earth-observatory/typhoon-mangkhut-reaches-luzon-92761/'},
 {label:'香港天文台 · 山竹事件报告',url:'https://www.hko.gov.hk/en/publica/tc/tc2018/section3_5rpt.html'},
 {label:'香港天文台 · 60分钟平均风速核对表',url:'https://www.hko.gov.hk/en/publica/tc/tc2018/table352.html'},
 {label:'NASA GIBS · 影像时间与投影说明',url:'https://nasa-gibs.github.io/gibs-api-docs/access-basics/'}
].map(Object.freeze));

export const ARCHIVE_STAGES=Object.freeze([
 {time:'2018-09-12T06:00:00Z',label:'09.12 · 从哪里来'},
 {time:'2018-09-14T06:00:00Z',label:'09.14 · 抵近吕宋'},
 {time:'2018-09-16T06:00:00Z',label:'09.16 · 香港影响'},
 {time:'2018-09-17T06:00:00Z',label:'09.17 · 向内陆减弱'}
].map(Object.freeze));

const CHAPTERS=[
 {title:'沿着真实档案，看它怎样发展',explanation:'地球上的位置、中心气压和中心风速来自同一条 JMA 事后分析记录。逐个时刻比较，可读出山竹的发展；这不是当前天气或当时发布的预报。',evidence:'本档案全程最低中心气压为905 hPa、最大持续风速为110 kt（10分钟平均）。这是全程极值，不是所选时刻读数。',source:0},
 {title:'中心是一个点，云系是一大片',explanation:'抵近吕宋时，真实卫星影像呈现台风眼和外围云带。图像按 UTC 日合成，中心点按六小时档案选取，两者不能当作同一瞬间。云区也不等于强风或降雨范围。',evidence:'NASA 9月14日局部影像由 Suomi NPP / VIIRS 在当地中午过后获取；原文未给出精确 UTC 拍摄时刻，因此作为当日观测证据展示。',source:1},
 {title:'中心未经过，也要看本地观测',explanation:'香港天文台记录，9月16日约13时中心位于天文台总部西南偏南约100公里。强烈外围雨带、所在象限与移动共同影响风势；JMA中心风速不能代替香港测站风速。',evidence:'事件峰值，非当前时刻：横澜岛最高60分钟平均风速161 km/h；鲗鱼涌最高潮位3.88 m（海图基准面以上）。潮位不是街道积水深度，也不等于风暴潮增水。',source:2},
 {title:'向内陆减弱，空值仍要留空',explanation:'对比前后的中心气压与风速，查看山竹向内陆移动后的变化。JMA档案在热带低压阶段未提供数值风速的记录显示“未报告”，不能把它解释成无风。',evidence:'这份原始事件共46条记录，每6小时一条；7条风速保留为空。最后一条为9月17日18:00 UTC，即北京时间9月18日02:00。',source:0}
];
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function validateImagery(imagery){
 if(imagery?.projection!=='EPSG:4326'||imagery?.layer!=='VIIRS_SNPP_CorrectedReflectance_TrueColor'||
    !Array.isArray(imagery.bbox)||imagery.bbox.join(',')!=='-180,-90,180,90'||
    typeof imagery.temporalType!=='string'||!imagery.temporalType.includes('daily')||!Array.isArray(imagery.frames)){
  throw new TypeError('山竹卫星清单的图层、投影或日合成定义无效');
 }
 const frames=new Map();
 for(const frame of imagery.frames){
  const date=frame?.date;
  if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||
     !Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||
     frames.has(date)||frame.url!==`assets/events/mangkhut-earth-${date.replaceAll('-','')}.jpg`||
     !Number.isInteger(frame.width)||!Number.isInteger(frame.height)||frame.height<=0||frame.width!==frame.height*2||
     !Number.isInteger(frame.bytes)||frame.bytes<=0||!/^[a-f0-9]{64}$/.test(frame.sha256)){
   throw new TypeError('山竹卫星帧的日期、尺寸、路径或校验信息无效');
  }
  const source=new URL(frame.sourceUrl);
  if(source.protocol!=='https:'||source.hostname!=='gibs.earthdata.nasa.gov'||
     source.searchParams.get('TIME')!==date||source.searchParams.get('SRS')!=='EPSG:4326'||
     source.searchParams.get('LAYERS')!==imagery.layer||source.searchParams.get('BBOX')!==imagery.bbox.join(',')||
     Number(source.searchParams.get('WIDTH'))!==frame.width||Number(source.searchParams.get('HEIGHT'))!==frame.height){
   throw new TypeError('山竹卫星帧来源与日期／投影不匹配');
  }
  frames.set(date,frame);
 }
 return frames;
}

export async function loadTyphoonArchive(fetcher=fetch){
 const responses=await Promise.all(['data/mangkhut-jma.json','data/imagery-manifest.json'].map(url=>fetcher(url)));
 if(responses.some(response=>!response.ok))throw new Error('山竹真实档案读取失败；不使用模拟数据替代');
 const [raw,imagery]=await Promise.all(responses.map(response=>response.json()));
 const dataset=validateEventDataset(raw);
 if(dataset.eventId!=='jma-1822'||dataset.name!=='MANGKHUT'||dataset.dataType!=='official-retrospective-best-track-analysis'){
  throw new TypeError('所载资料不是山竹1822的官方事后分析档案');
 }
 return {dataset,imagery,frames:validateImagery(imagery)};
}

function chartHtml(dataset,i,field,title,unit,color,minimum,maximum,baselineIndex=null){
 const series=metricSeries(dataset,field),width=280,height=100,left=29,right=8,top=10,bottom=22;
 const first=Date.parse(series[0].timeUtc),duration=Date.parse(series.at(-1).timeUtc)-first;
 const x=point=>left+(duration?(Date.parse(point.timeUtc)-first)/duration:0)*(width-left-right);
 const y=value=>top+(maximum-value)/(maximum-minimum)*(height-top-bottom);
 let line='',connected=false;
 const dots=[];
 for(const point of series){
  if(point.value===null){connected=false;continue;}
  const px=x(point).toFixed(2),py=y(point.value).toFixed(2);
  line+=(connected?' L':' M')+px+' '+py;connected=true;
  dots.push(`<circle cx="${px}" cy="${py}" r="1.5" fill="${color}"/>`);
 }
 const current=series[i],cursor=x(current).toFixed(2),label=current.value===null?'未报告':`${current.value} ${unit}`;
 const grid=[minimum,(minimum+maximum)/2,maximum].map(value=>`<path d="M${left} ${y(value)}H${width-right}" stroke="#294253" stroke-width=".6"/><text x="${left-4}" y="${y(value)+3}" text-anchor="end" class="chart-axis">${value}</text>`).join('');
 let markers=`<path d="M${cursor} 5V${height-bottom+3}" stroke="#ffd18b" stroke-dasharray="3 3"/>${current.value===null?`<text x="${Math.min(Number(cursor),width-45)}" y="18" fill="#ffd18b" font-size="9">未报告</text>`:`<circle cx="${cursor}" cy="${y(current.value)}" r="3.5" fill="#ffd18b" stroke="#132639" stroke-width="1.5"/>`}`;
 let comparisonDescription='';
 if(baselineIndex!==null){
  const baseline=series[baselineIndex],same=baselineIndex===i,near=Math.abs(x(baseline)-x(current))<50;
  const marker=(point,recordIndex,role,markerColor,dashed,labelY)=>{
   const px=x(point).toFixed(2),missing=point.value===null,caption=role+(missing?' 未报告':''),rightAligned=Number(px)>width-65;
   const tx=(Number(px)+(rightAligned?-4:4)).toFixed(2);
   return `<g data-comparison-marker="${role}" data-record-index="${recordIndex}" data-time-utc="${point.timeUtc}" data-value="${missing?'missing':point.value}"><path d="M${px} 5V${height-bottom+3}" stroke="${markerColor}"${dashed?' stroke-dasharray="3 3"':''}/>${missing?'':`<circle cx="${px}" cy="${y(point.value)}" r="3.5" fill="${markerColor}" stroke="#132639" stroke-width="1.5"/>`}<text x="${tx}" y="${labelY}" text-anchor="${rightAligned?'end':'start'}" fill="${markerColor}" font-size="9">${caption}</text></g>`;
  };
  markers=same?marker(current,i,'A=B','#ffd18b',false,12):marker(baseline,baselineIndex,'A','#80e2ee',true,12)+marker(current,i,'B','#ffd18b',false,near?25:12);
  comparisonDescription='；A 对照 '+formatTime(baseline.timeUtc)+'，'+(baseline.value===null?'未报告':baseline.value+' '+unit)+'；'+(same?'A=B，同一条原始记录':'B 当前 '+formatTime(current.timeUtc));
 }
 return `<div class="chart archive-chart" data-kind="historical-event-archive" data-metric="${field}" data-current="${current.value===null?'missing':current.value}"><div class="chart-label"><span>${title}</span><strong style="color:${color}">${label}</strong></div><svg viewBox="0 0 ${width} ${height}" style="height:100px" role="img" aria-label="${escape(title+'；'+formatTime(current.timeUtc)+'；'+label+'；JMA事后分析'+comparisonDescription)}"><title>${escape('JMA事后分析 · '+title+' · '+formatTime(current.timeUtc)+comparisonDescription)}</title>${grid}<path d="${line}" fill="none" stroke="${color}" stroke-width="1.4"/>${dots.join('')}${markers}<text x="${left}" y="96" class="chart-axis">9/6</text><text x="${width-right}" y="96" text-anchor="end" class="chart-axis">9/17 UTC</text></svg></div>`;
}

export function archiveRecordView(dataset,index,baselineIndex=null){
 validateEventDataset(dataset);
 const record=recordAtIndex(dataset,index),i=dataset.records.indexOf(record),timeUtc=record.timeUtc,timeLabel=formatTime(timeUtc);
 const baseline=baselineIndex===null?null:dataset.records.indexOf(recordAtIndex(dataset,baselineIndex));
 let chapterIndex=0;
 ARCHIVE_STAGES.forEach((stage,n)=>{if(Date.parse(timeUtc)>=Date.parse(stage.time))chapterIndex=n;});
 const chapter=CHAPTERS[chapterIndex],source=SOURCES[chapter.source];
 const windLabel=record.windKt===null?'未报告':`${record.windKt} kt · 10分钟平均（≈ ${(record.windKt*1.852).toFixed(1)} km/h）`;
 const pressureLabel=record.pressureHpa===null?'未报告':`${record.pressureHpa} hPa`;
 const coordinates=`${Math.abs(record.lat).toFixed(1)}°${record.lat<0?'S':'N'} / ${Math.abs(record.lon).toFixed(1)}°${record.lon<0?'W':'E'}`;
 const insightHtml=`<div class="panel-label"><span>真实事件 · 此刻怎样理解</span><span class="insight-time">JMA / 档案</span></div><h3>${chapter.title}</h3><p class="insight-caption">${chapter.explanation}</p><div class="insight-observation"><strong>对应真实证据</strong><p>${chapter.evidence}</p><a href="${source.url}" target="_blank" rel="noopener">核对${chapter.source===2?'香港天文台':chapter.source===1?'NASA':'JMA'}原始资料 ↗</a></div>`;
 const readoutsHtml=`<div class="readout"><div class="readout-label">中心最大持续风速 · JMA</div><div class="readout-value" style="--metric:#80d7d5">${record.windKt===null?'未报告':record.windKt+'<small>kt</small>'}</div><p class="insight-caption">${record.windKt===null?'原始记录无数值，不补零':'10分钟平均 · ≈ '+(record.windKt*1.852).toFixed(1)+' km/h'}</p></div><div class="readout"><div class="readout-label">中心气压 · JMA</div><div class="readout-value" style="--metric:#9fb5f2">${record.pressureHpa===null?'未报告':record.pressureHpa+'<small>hPa</small>'}</div><p class="insight-caption">官方事后分析 · 中心强度并非当地测站读数</p></div>`;
 const chartsHtml=chartHtml(dataset,i,'windKt','风速 · 10分钟平均','kt','#80d7d5',0,120,baseline)+chartHtml(dataset,i,'pressureHpa','中心气压','hPa','#9fb5f2',900,1020,baseline)+'<p class="insight-caption">JMA事后分析 · 点为真实记录，连线辅助阅读；缺测不补零。'+(baseline===null?'金色游标与地球选中记录同步。':'青色 A 为对照记录，金色 B 为当前记录；A=B 时合并标注。')+'</p>';
 return {i,record,timeLabel,timeShort:timeLabel.replace(/^\d+年/,'').replace('（北京时间 UTC+8）',' UTC+8'),timeUtc,windLabel,pressureLabel,coordinates,chapterTitle:chapter.title,explanation:chapter.explanation,day:timeUtc.slice(0,10),sourceLinks:SOURCES,insightHtml,readoutsHtml,chartsHtml};
}

export function buildArchiveExport(dataset,view,imageryFrame=null,displayedDate=null){
 const record=recordAtIndex(dataset,view.i);
 if(record.timeUtc!==view.timeUtc)throw new TypeError('导出视图与真实记录时间不一致');
 if(imageryFrame!==null&&imageryFrame.date!==record.timeUtc.slice(0,10))throw new TypeError('导出可用影像的UTC日期与记录不一致');
 if(displayedDate!==null&&(!imageryFrame||displayedDate!==imageryFrame.date))throw new TypeError('导出显示影像日期与实际影像不一致');
 return {schemaVersion:1,kind:'historical-event-archive',dataType:dataset.dataType,eventId:dataset.eventId,name:dataset.name,recordIndex:view.i,selectedRecord:record,timeLabel:formatTime(record.timeUtc),source:dataset.source,units:dataset.units,interpretation:dataset.interpretation,availableImagery:imageryFrame,displayedImageryDate:displayedDate,imageryTimeCaution:'影像为UTC日合成，不是所选六小时路径时刻的瞬时观测；空日期表示当前未显示该观测影像。',sourceLinks:SOURCES};
}

