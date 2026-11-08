// A shared historical clock selects original observations; it never fills a gap.
export function utcMillis(iso){
 if(typeof iso!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(iso))throw new TypeError('需要明确的 UTC 时间');
 const value=Date.parse(iso);
 if(!Number.isFinite(value)||new Date(value).toISOString()!==iso.replace(/(?<!\.\d{3})Z$/,'.000Z'))throw new TypeError('无效 UTC 日期');
 return value;
}

export function indexAtOrBefore(records,timeUtc){
 const target=typeof timeUtc==='number'?timeUtc:utcMillis(timeUtc);
 if(!Number.isFinite(target))throw new TypeError('时间必须有限');
 let lo=0,hi=records.length;
 while(lo<hi){const mid=(lo+hi)>>>1;if(utcMillis(records[mid].timeUtc)<=target)lo=mid+1;else hi=mid;}
 return lo-1;
}

export function selectObservation(series,timeUtc){
 const target=utcMillis(timeUtc),i=indexAtOrBefore(series.samples,target);
 if(i<0)return {sample:null,index:-1,ageMinutes:null,status:'before-coverage'};
 const sample=series.samples[i],ageMinutes=(target-utcMillis(sample.timeUtc))/60000;
 if(ageMinutes>series.maxAgeMinutes)return {sample:null,index:i,ageMinutes,status:'gap'};
 const hasRange=Number.isFinite(sample.lower)&&Number.isFinite(sample.upper);
 if(sample.value===null||(!hasRange&&!Number.isFinite(sample.value)))return {sample:null,index:i,ageMinutes,status:'missing'};
 return {sample,index:i,ageMinutes,status:ageMinutes===0?'exact':'latest'};
}

export function selectCloudFrame(clouds,timeUtc){
 const target=utcMillis(timeUtc),index=indexAtOrBefore(clouds.frames,target);
 if(index<0)return {frame:null,index,ageMinutes:null,status:'before-coverage'};
 const frame=clouds.frames[index],ageMinutes=(target-utcMillis(frame.timeUtc))/60000;
 return ageMinutes>clouds.maxAgeMinutes?{frame:null,index,ageMinutes,status:'gap'}:{frame,index,ageMinutes,status:ageMinutes===0?'exact':'latest'};
}

function ordered(items,label){
 if(!Array.isArray(items)||!items.length)throw new TypeError(label+'没有数据');
 let last=-Infinity;
 for(const item of items){const t=utcMillis(item.timeUtc);if(t<=last)throw new RangeError(label+'时间必须递增且不重复');last=t;}
}

export function validateSyncBundle(bundle){
 if(bundle?.schemaVersion!==1||bundle?.eventId!=='jma-1822')throw new TypeError('不是山竹同步资料包');
 if(utcMillis(bundle.endUtc)<=utcMillis(bundle.startUtc))throw new RangeError('时间范围无效');
 ordered(bundle.clouds?.frames,'云图');
 if(bundle.clouds.projection!=='EPSG:4326'||!Number.isFinite(bundle.clouds.maxAgeMinutes)||bundle.clouds.maxAgeMinutes<0)throw new TypeError('云图投影或时间容差无效');
 const bbox=bundle.clouds.bbox;
 if(!Array.isArray(bbox)||bbox.length!==4||!bbox.every(Number.isFinite)||bbox[0]>=bbox[2]||bbox[1]>=bbox[3]||bbox[0]<-180||bbox[2]>180||bbox[1]<-90||bbox[3]>90)throw new TypeError('云图地理范围无效');
 for(const frame of bundle.clouds.frames){if(typeof frame.url!=='string'||!frame.url||typeof frame.sha256!=='string'||!frame.sourceUrl)throw new TypeError('云图缺少来源与校验信息');}
 if(!Array.isArray(bundle.series)||bundle.series.length<3)throw new TypeError('需要风、雨、海水位资料');
 const ids=new Set();
 for(const series of bundle.series){
  if(ids.has(series.id)||!series.id||!series.unit||!series.source?.url||!Number.isFinite(series.maxAgeMinutes)||series.maxAgeMinutes<0)throw new TypeError('观测指标定义不完整');ids.add(series.id);
  ordered(series.samples,series.label);
  for(const sample of series.samples){
   if(series.kind==='range'){
    if(sample.lower===null&&sample.upper===null)continue;
    if(!Number.isFinite(sample.lower)||!Number.isFinite(sample.upper)||sample.lower>sample.upper)throw new TypeError('地区范围值无效');
   }else if(sample.value!==null&&!Number.isFinite(sample.value))throw new TypeError('观测值必须是数值或 null');
   if(sample.windowStartUtc&&utcMillis(sample.windowStartUtc)>utcMillis(sample.timeUtc))throw new TypeError('累计窗口不能倒置');
  }
 }
 for(const id of ['wind','rain','seaLevel'])if(!ids.has(id))throw new TypeError('缺少'+id+'序列');
 return bundle;
}

export function makeClockTicks(bundle,stepMinutes=10){
 if(!Number.isInteger(stepMinutes)||stepMinutes<=0)throw new RangeError('时步必须是正整数分钟');
 const start=utcMillis(bundle.startUtc),end=utcMillis(bundle.endUtc),times=[];
 for(let t=start;t<=end;t+=stepMinutes*60000)times.push(new Date(t).toISOString());
 if(utcMillis(times.at(-1))!==end)times.push(new Date(end).toISOString());
 return times;
}

export function synchronizedSnapshot(bundle,index){
 const ticks=makeClockTicks(bundle),i=Math.max(0,Math.min(ticks.length-1,Math.trunc(index)));
 if(!Number.isFinite(i))throw new TypeError('索引必须有限');
 const timeUtc=ticks[i];
 return {index:i,timeUtc,cloud:selectCloudFrame(bundle.clouds,timeUtc),observations:Object.fromEntries(bundle.series.map(s=>[s.id,selectObservation(s,timeUtc)]))};
}
