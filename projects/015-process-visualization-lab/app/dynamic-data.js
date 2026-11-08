import {riverSnapshot,validateRiverObservations} from './river-observations.js';
import {validateTideObservations} from './tide-observations.js';
import {batterySnapshot,validateBatteryObservations} from './battery-observations.js';
import {dieselSnapshot,validateDieselObservations} from './diesel-observations.js';

const utc = value => {const time=Date.parse(value);if(typeof value!=='string'||!value.endsWith('Z')||!Number.isFinite(time))throw new TypeError('Valid UTC required.');return time;};
const finite = value => typeof value==='number'&&Number.isFinite(value);
function ordered(items,name){let last=-Infinity;for(const item of items){const t=utc(item.timeUtc);if(t<=last)throw new RangeError(name+' must be strictly ordered.');last=t;}}
export function validateDynamicEvent(data){
 if(!data||data.schemaVersion!==1||!['volcano','storm','wildfire','quake','river','tide','battery','engine'].includes(data.kind)||!data.id||!data.title)throw new TypeError('Invalid observed event.');
 if(!data.sources?.length||data.sources.some(s=>!/^https:\/\//.test(s.url)))throw new TypeError('Official source links required.');
 if(data.kind==='river')return validateRiverObservations(data);
 if(data.kind==='tide')return validateTideObservations(data);
 if(data.kind==='battery')return validateBatteryObservations(data);
 if(data.kind==='engine')return validateDieselObservations(data);
 if(!finite(data.focus?.lat)||!finite(data.focus?.lon)||Math.abs(data.focus.lat)>90||Math.abs(data.focus.lon)>180)throw new RangeError('Invalid focus coordinates.');
 if(utc(data.endUtc)<=utc(data.startUtc))throw new RangeError('Invalid event window.');
 if(data.kind==='quake'){
  if(!data.stations?.length)throw new TypeError('Station waveforms required.');
  for(const station of data.stations){if(!station.id||!finite(station.lat)||!finite(station.lon)||Math.abs(station.lat)>90||Math.abs(station.lon)>180||!station.unit||!station.samples?.length)throw new TypeError('Invalid station.');ordered(station.samples,'Station samples');for(const s of station.samples)if(s.value!==null&&!finite(s.value))throw new TypeError('Invalid waveform value.');}
 }else{
  const b=data.bbox;if(!Array.isArray(b)||b.length!==4||!b.every(finite)||b[2]<=b[0]||b[2]-b[0]>360||b[1]<-90||b[3]>90||b[3]<=b[1])throw new RangeError('Invalid observation bounds.');
  if(!data.frames?.length)throw new TypeError('Observed frames required.');ordered(data.frames,'Frames');
  for(const frame of data.frames){if(!/^assets\/events\//.test(frame.url)||!/^\w{64}$/.test(frame.sha256))throw new TypeError('Local observed image and hash required.');if(utc(frame.timeUtc)<utc(data.startUtc)||utc(frame.timeUtc)>utc(data.endUtc))throw new RangeError('Frame outside window.');}
  if(data.kind==='wildfire'&&data.frames.some((frame,index)=>
   !/^\d{4}-\d\d-\d\d$/.test(frame.archiveDate)||frame.timeUtc!==frame.archiveDate+'T00:00:00Z'||
   !frame.sourceFile?.startsWith(frame.archiveDate.replaceAll('-',''))||!finite(frame.mappedKm2)||frame.mappedKm2<=0||
   !['addedKm2','outsideKm2'].every(key=>index===0?frame[key]===null:finite(frame[key])&&frame[key]>=0)
  ))throw new TypeError('Invalid wildfire archive date or mapped area.');
 }
 for(const series of data.series||[]){ordered(series.samples,'Metric samples');for(const s of series.samples)if(s.value!==null&&!finite(s.value))throw new TypeError('Missing observations must be null.');}
 if(data.track?.length)ordered(data.track,'Best-track records');
 return data;
}
export function dynamicTicks(data){
 if(data.kind==='river')return data.clock.map(tick=>tick.elapsedSeconds);
 if(data.kind==='battery')return data.samples.map(sample=>sample.elapsedSeconds);
 if(data.kind==='engine')return data.samples.map(sample=>sample.t);
 if(data.kind==='tide')return data.clock.map(tick=>tick.timeUtc);
 return data.kind==='quake'?[...new Set(data.stations.flatMap(s=>s.samples.map(p=>p.timeUtc)))].filter(t=>utc(t)>=utc(data.startUtc)&&utc(t)<=utc(data.endUtc)).sort((a,b)=>utc(a)-utc(b)):data.frames.map(f=>f.timeUtc);
}
export function sampleAt(samples,timeUtc,maxAgeSeconds=0){
 const target=utc(timeUtc);let lo=0,hi=samples.length-1,found=-1;
 while(lo<=hi){const mid=(lo+hi)>>1;if(utc(samples[mid].timeUtc)<=target){found=mid;lo=mid+1;}else hi=mid-1;}
 if(found<0)return null;const sample=samples[found];return target-utc(sample.timeUtc)>maxAgeSeconds*1000||sample.value===null?null:sample;
}
export function stationScale(station){return Math.max(1,...station.samples.map(p=>Math.abs(p.value??0)));}
export function dynamicSnapshot(data,timeUtc){
 if(data.kind==='river')return riverSnapshot(data,timeUtc);
 if(data.kind==='battery')return batterySnapshot(data,timeUtc);
 if(data.kind==='engine')return dieselSnapshot(data,timeUtc);
 const time=utc(timeUtc),frame=data.frames?.find(f=>utc(f.timeUtc)===time)??null;
 const metrics=(data.series||[]).map(series=>({id:series.id,label:series.label,unit:series.unit,method:series.method,sample:sampleAt(series.samples,timeUtc,data.kind==='tide'?0:series.maxAgeSeconds??0)}));
 const lunar=data.kind==='tide'?{moon:data.moon.find(item=>utc(item.timeUtc)===time)??null}:{};
 return {eventId:data.id,timeUtc,frame,...lunar,
  metrics,
  stations:(data.stations||[]).map(station=>({id:station.id,lat:station.lat,lon:station.lon,unit:station.unit,sample:sampleAt(station.samples,timeUtc,station.sampleIntervalSeconds?Math.max(0,station.sampleIntervalSeconds-0.001):0),scale:stationScale(station)})),
  track:(data.track||[]).filter(p=>utc(p.timeUtc)<=time).at(-1)??null};
}
export function longitudeRegistration(bbox){const origin=bbox[2]>180?180:bbox[0]<-180?-180:0;return {origin,bounds:[bbox[0]-origin,bbox[1],bbox[2]-origin,bbox[3]]};}
export function waveformSegments(station,timeUtc,windowSeconds=60){const now=utc(timeUtc),interval=station.sampleIntervalSeconds??1,pairs=[];let prior=null;for(const sample of station.samples){const t=utc(sample.timeUtc);if(t<=now-windowSeconds*1000||t>now)continue;if(sample.value===null){prior=null;continue;}if(prior&&t-utc(prior.timeUtc)<=interval*1000+.001)pairs.push([prior,sample]);prior=sample;}return pairs;}
