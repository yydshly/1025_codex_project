import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateDynamicEvent,dynamicTicks,dynamicSnapshot} from '../app/dynamic-data.js';
import {dynamicEvents} from '../app/dynamic-events.js';
import {HARBOR_TIDE_IMAGERY} from '../app/harbor-tide-geography.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const summary=[];
const harborImage=fs.readFileSync(path.join(root,'app',HARBOR_TIDE_IMAGERY.url));
assert.equal(harborImage.length,HARBOR_TIDE_IMAGERY.bytes);
assert.equal(hash(harborImage),HARBOR_TIDE_IMAGERY.sha256);

function checkRiver(data,ticks){
 const sourceFiles=data.sources.filter(source=>source.file);
 const csv=sourceFiles.find(source=>source.file.endsWith('.csv'));
 assert(csv&&sourceFiles.some(source=>source.file.endsWith('.xml')),'River data needs archived observations and metadata.');
 const receipt=JSON.parse(fs.readFileSync(path.join(root,path.dirname(csv.file),'..','source-receipt.json'),'utf8'));
 for(const source of sourceFiles){
  const bytes=fs.readFileSync(path.join(root,source.file));
  assert.equal(bytes.length,source.bytes);
  assert.equal(hash(bytes),source.sha256);
  const entry=Object.values(receipt).find(item=>item.file===source.file);
  assert(entry,'River source must be in the download receipt.');
  const {name,...sourceReceipt}=source;
  assert.deepEqual(sourceReceipt,entry);
 }
 const lines=fs.readFileSync(path.join(root,csv.file),'utf8').trimEnd().split(/\r?\n/);
 assert.equal(lines[0],'date,time,transect_ID,bank_side,easting_m,northing_m,distdnst_m,hrs_pst_rel,rwt_ppb,turb_ntu');
 // The added Z is only for host-timezone-independent subtraction of local clock fields.
 const clockOrigin=Date.parse(data.clockOrigin.localTime+'Z');
 assert.equal(data.clockOrigin.timezone,null);
 for(const tick of data.clock)assert.equal(Date.parse(tick.localTime+'Z')-clockOrigin,tick.elapsedSeconds*1000);
 const samplesByBank=new Map(),usedLines=new Set();
 const {thresholdPpb,consecutiveSamples}=data.signalRule;
 for(const section of data.transects){
  for(const bank of section.banks){
   const samples=new Map();
   for(const sample of bank.samples){
    assert(!usedLines.has(sample.sourceLine),'Each raw observation must have one rendered bank series.');
    usedLines.add(sample.sourceLine);
    const [date,time,sectionId,side,easting,northing,distance,hours,value,turbidity]=lines[sample.sourceLine-1].split(',');
    const [month,day,year]=date.split('/');
    const localTime=year+'-'+month.padStart(2,'0')+'-'+day.padStart(2,'0')+'T'+time.padStart(8,'0');
    assert.equal(+sectionId,section.sourceTransectId);
    assert.equal(side,bank.bank==='left'?'LB':'RB');
    assert.equal(+distance,section.distanceM);
    assert.equal(+easting,bank.eastingM);
    assert.equal(+northing,bank.northingM);
    assert.equal(sample.localTime,localTime);
    assert.equal(sample.elapsedSeconds,(Date.parse(localTime+'Z')-clockOrigin)/1000);
    assert.equal(sample.sourceElapsedHours,+hours);
    assert(Math.abs(+hours*3600-sample.elapsedSeconds)<=18.00001);
    assert.equal(sample.value,+value);
    assert.equal(sample.turbidityNtu,+turbidity);
    samples.set(sample.elapsedSeconds,sample);
   }
   const maximum=bank.samples.reduce((peak,sample)=>sample.value>peak.value?sample:peak);
   const firstSignal=bank.samples.find((sample,index)=>
    sample.elapsedSeconds>=0&&Array.from({length:consecutiveSamples},(_,offset)=>bank.samples[index+offset])
     .every((entry,offset)=>entry?.value>=thresholdPpb&&entry.elapsedSeconds===sample.elapsedSeconds+data.cadenceSeconds*offset));
   assert.deepEqual(bank.peak,maximum);
   assert(firstSignal,'Each monitored bank needs evidence for its sustained-signal marker.');
   assert.deepEqual(bank.sustainedSignal,firstSignal);
   assert.equal(bank.baselineMax,Math.max(...bank.samples.filter(sample=>sample.elapsedSeconds<0).map(sample=>sample.value)));
   assert(bank.baselineMax<thresholdPpb);
   assert.equal(bank.coverage.samples,samples.size);
   assert.equal(bank.coverage.missingTicks,ticks.length-samples.size);
   assert.equal(bank.coverage.startSeconds,bank.samples[0].elapsedSeconds);
   assert.equal(bank.coverage.endSeconds,bank.samples.at(-1).elapsedSeconds);
   samplesByBank.set(bank.id,samples);
  }
 }
 assert.equal(usedLines.size,lines.length-1,'The replay must keep all archived observations.');
 for(const tick of data.clock){
  const snapshot=dynamicSnapshot(data,tick.elapsedSeconds);
  assert.equal(snapshot.elapsedSeconds,tick.elapsedSeconds);
  assert.equal(snapshot.localTime,tick.localTime);
  assert.equal(snapshot.readings.length,samplesByBank.size);
  for(const reading of snapshot.readings){
   const expected=samplesByBank.get(reading.id).get(tick.elapsedSeconds);
   assert.equal(reading.unit,'ppb');
   assert.equal(reading.elapsedSeconds,tick.elapsedSeconds);
   assert.equal(reading.value,expected?.value??null);
   assert.equal(reading.sourceLine,expected?.sourceLine??null);
   assert.equal(reading.localTime,expected?.localTime??null);
  }
 }
}

function checkTide(data,ticks){
 const archive='research/dynamics/san-francisco-tide';
 const receipt=JSON.parse(fs.readFileSync(path.join(root,archive,'sources.json'),'utf8'));
 assert.deepEqual(data.sources.map(source=>source.id).sort(),Object.keys(receipt).sort());
 const raw=new Map();
 for(const source of data.sources){
  const {id,name,...sourceReceipt}=source;
  assert.deepEqual(sourceReceipt,receipt[id]);
  assert.equal(source.status,200);
  const bytes=fs.readFileSync(path.join(root,source.file));
  assert.equal(bytes.length,source.bytes);
  assert.equal(hash(bytes),source.sha256);
  raw.set(id,JSON.parse(bytes));
 }
 const station=raw.get('noaa-station').stations[0];
 assert.equal(station.id,data.station.id);
 assert.equal(station.id,raw.get('noaa-observed').metadata.id);
 assert.deepEqual(data.focus,{lat:station.lat,lon:station.lng});
 assert.equal(data.station.lat,station.lat);
 assert.equal(data.station.lon,station.lng);
 assert.equal(data.station.name,station.name);
 assert.equal(data.datum,'MLLW');
 assert.equal(data.unit,'m');
 assert.equal(data.cadenceSeconds,360);
 assert.equal(ticks.length,240);
 const nativeTicks=Array.from({length:240},(_,i)=>new Date(Date.UTC(2025,0,15,0,i*6)).toISOString().replace('.000Z','Z'));
 assert.deepEqual(ticks,nativeTicks);
 assert.deepEqual(ticks,data.clock.map(item=>item.timeUtc));
 assert.equal(data.startUtc,ticks[0]);
 assert.equal(data.endUtc,ticks.at(-1));
 const level=(value)=>value==null||String(value).trim()===''?null:Number(value);
 const utcMinute=time=>time.replace(' ','T')+':00Z';
 for(const [id,source,product,rows] of [
  ['observed','noaa-observed','water_level',raw.get('noaa-observed').data],
  ['predicted','noaa-predicted','predictions',raw.get('noaa-predicted').predictions],
 ]){
  const params=new URL(receipt[source].url).searchParams;
  for(const [key,value] of Object.entries({datum:'MLLW',units:'metric',station:station.id,time_zone:'gmt',product})){
   assert.equal(params.get(key),value);
  }
  if(id==='predicted')assert.equal(params.get('interval'),'6');
  const series=data.series.find(item=>item.id===id);
  assert.equal(series.unit,data.unit);
  assert.equal(series.datum,data.datum);
  assert.equal(rows.length,ticks.length);
  assert.deepEqual(series.samples,rows.map((row,i)=>({
   timeUtc:utcMinute(row.t),value:level(row.v),sourceRow:i+1,
   ...(id==='observed'?{quality:row.q,flags:row.f,sigmaM:level(row.s)}:{}),
  })));
  assert.deepEqual(series.samples.map(sample=>sample.timeUtc),ticks);
  assert(series.samples.every(sample=>Number.isFinite(sample.value)),'No missing NOAA rows in this replay window.');
  if(id==='observed')assert(series.samples.every(sample=>sample.quality==='v'&&sample.flags==='0,0,0,0'&&sample.sigmaM>=0));
  for(const [suffix,moreExtreme] of [['Min',(v,x)=>v<x],['Max',(v,x)=>v>x]]){
   const sample=series.samples.reduce((best,next)=>moreExtreme(next.value,best.value)?next:best);
   assert.deepEqual(data.moments[id+suffix],{timeUtc:sample.timeUtc,valueM:sample.value});
  }
 }
 const horizons=raw.get('jpl-moon');
 assert.equal(horizons.signature.source,'NASA/JPL Horizons API');
 assert.match(horizons.result,/Target body name:\s*Moon \(301\).*\{source: DE441\}/);
 assert.match(horizons.result,/Center geodetic\s*:\s*237\.53411,37\.806305,/);
 assert.match(horizons.result,/Atmos refraction:\s*NO \(AIRLESS\)/);
 const rows=horizons.result.split('$$SOE')[1].split('$$EOE')[0].trim().split(/\r?\n/);
 assert.equal(rows.length,ticks.length);
 assert.equal(data.moon.length,ticks.length);
 rows.forEach((line,i)=>{
  const [time,solarFlag,lunarFlag,azimuth,elevation,illumination,rangeAu,rangeRate]=line.split(',').map(value=>value.trim());
  const sample=data.moon[i];
  assert.equal(sample.timeUtc,ticks[i]);
  assert.equal(sample.timeUtc,utcMinute(time.replace('2025-Jan-15','2025-01-15')));
  assert.deepEqual({...sample,rangeKm:undefined},{
   timeUtc:ticks[i],azimuthDeg:Number(azimuth),elevationDeg:Number(elevation),illuminationPct:Number(illumination),
   rangeAu:Number(rangeAu),rangeRateKmPerSec:Number(rangeRate),solarFlag,lunarFlag,sourceRow:i+1,rangeKm:undefined,
  });
  assert(Math.abs(sample.rangeKm-Number(rangeAu)*149597870.7)<1e-6);
 });
 const highest=data.moon.reduce((best,next)=>next.elevationDeg>best.elevationDeg?next:best);
 assert.deepEqual(data.moments.moonMaxElevation,{timeUtc:highest.timeUtc,elevationDeg:highest.elevationDeg});
 const crosses=(key,crossed)=>{
  const index=data.moon.findIndex((row,i)=>i&&crossed(data.moon[i-1].elevationDeg,row.elevationDeg));
  assert(index>0);
  const before=data.moon[index-1],after=data.moon[index];
  assert.deepEqual(data.moments[key],{fromUtc:before.timeUtc,toUtc:after.timeUtc,
   fromElevationDeg:before.elevationDeg,toElevationDeg:after.elevationDeg});
 };
 crosses('moonRiseBracket',(from,to)=>from<0&&to>=0);
 crosses('moonSetBracket',(from,to)=>from>=0&&to<0);
 ticks.forEach((time,i)=>{
  const snapshot=dynamicSnapshot(data,time);
  assert.equal(snapshot.timeUtc,time);
  assert.equal(snapshot.eventId,data.id);
  assert.equal(snapshot.moon,data.moon[i]);
  assert.deepEqual(snapshot.metrics.map(metric=>[metric.id,metric.unit,metric.sample]),
   data.series.map(series=>[series.id,'m',series.samples[i]]));
 });
 const missingIndex=96,missingTime=ticks[missingIndex];
 const missing={
  ...data,moon:data.moon.filter((_,i)=>i!==missingIndex),
  series:data.series.map(series=>({...series,samples:series.id==='observed'
   ?series.samples.map((row,i)=>i===missingIndex?{...row,value:null}:row)
   :series.samples.filter((_,i)=>i!==missingIndex)})),
 };
 const gap=dynamicSnapshot(missing,missingTime);
 assert.equal(gap.moon,null,'A missing Moon sample must stay missing.');
 assert(gap.metrics.every(metric=>metric.sample===null),'Missing NOAA values must stay missing.');
}

function checkBattery(data,ticks){
 const archive='research/dynamics/b0005';
 const receipt=JSON.parse(fs.readFileSync(path.join(root,archive,'source-receipt.json'),'utf8'));
 const source=data.sources.find(item=>item.id==='nasa-mat');
 const raw=fs.readFileSync(path.join(root,source.file));
 assert.equal(source.url,receipt.archiveUrl);
 assert.equal(source.member,receipt.member);
 assert.equal(source.matFile,receipt.matFile);
 assert.equal(raw.length,receipt.matBytes);
 assert.equal(raw.length,source.bytes);
 assert.equal(hash(raw),receipt.matSha256);
 assert.equal(hash(raw),source.sha256);
 assert.match(raw.toString('ascii',0,40),/^MATLAB 5\.0 MAT-file/);
 assert.equal(data.sampleId,'B0005');
 assert.equal(data.sourceCycleIndex,1);
 assert.equal(data.sourceCycleType,'discharge');
 assert.equal(data.focus,null);
 assert.equal(data.sourceLocalTime,'2008-04-02T15:25:41.593');
 assert.equal(data.ambientTemperatureC,24);
 assert.deepEqual(data.channels.map(channel=>[channel.id,channel.field,channel.sourceField,channel.unit]),[
  ['voltage','voltageV','Voltage_measured','V'],
  ['current','currentA','Current_measured','A'],
  ['temperature','temperatureC','Temperature_measured','°C'],
 ]);
 assert.equal(ticks.length,197);
 assert.equal(ticks[0],0);
 assert.equal(ticks.at(-1),3690.234);
 assert.deepEqual(ticks,data.samples.map(row=>row.elapsedSeconds));
 assert(new Set(ticks.slice(1).map((time,i)=>(time-ticks[i]).toFixed(3))).size>1,
  'The elapsed clock must keep native irregular sampling.');
 data.samples.forEach((row,i)=>{
  assert.equal(row.sourceRow,i+1);
  assert(Object.values(row).every(Number.isFinite));
  const snapshot=dynamicSnapshot(data,ticks[i]);
  assert.equal(snapshot.eventId,data.id);
  assert.equal(snapshot.elapsedSeconds,ticks[i]);
  assert.equal(snapshot.sample,row);
 });
 assert.throws(()=>dynamicSnapshot(data,(ticks[0]+ticks[1])/2),RangeError,
  'The cell view must receive only native observation rows.');
 const lowest=data.samples.reduce((best,row)=>row.voltageV<best.voltageV?row:best);
 const hottest=data.samples.reduce((best,row)=>row.temperatureC>best.temperatureC?row:best);
 assert.equal(data.moments.minVoltage,lowest.elapsedSeconds);
 assert.equal(data.moments.maxTemperature,hottest.elapsedSeconds);
 const loaded=data.samples.find(row=>row.currentA<=-1);
 assert.equal(data.moments.firstUnderLoad,loaded.elapsedSeconds);
 assert.notEqual(loaded.currentA,loaded.loadCurrentA,'Battery output and load readings are separate channels.');
}

function checkEngine(data,ticks,bytes){
 const archive='research/dynamics/jlu-diesel';
 const receipt=JSON.parse(fs.readFileSync(path.join(root,archive,'source-receipt.json'),'utf8'));
 assert.equal(hash(bytes),receipt.replaySha256);
 assert.equal(data.archive.url,receipt.archiveUrl);
 assert.equal(data.archive.member,receipt.member);
 assert.equal(data.archive.sha256,receipt.matSha256);
 const zip=path.join(root,archive,'datafile.zip');
 if(fs.existsSync(zip)){
  const source=fs.readFileSync(zip);
  assert.equal(source.length,receipt.archiveBytes);
  assert.equal(hash(source),receipt.archiveSha256);
 }
 assert.deepEqual(data.channels.map(channel=>[channel.id,channel.field,channel.sourceField,channel.sourceUnit,channel.unit]),[
  ['rpm','rpm','speed','r/min','rpm'],['torque','torqueNm','torque','N·m','N·m'],
  ['railPressure','railPressureMpa','RP','hPa','MPa'],
 ]);
 assert.equal(data.clock.intervalSeconds,0.1);
 assert.equal(ticks.length,18000);
 assert.equal(ticks[0],0);
 assert.equal(ticks.at(-1),1799.9);
 assert.deepEqual(data.phases.map(phase=>[phase.id,phase.from,phase.toExclusive]),[
  ['urban',0,600],['suburban',600,1200],['highway',1200,1800],
 ]);
 ticks.forEach((time,i)=>{
  assert.equal(time,i/10);
  const snapshot=dynamicSnapshot(data,time);
  assert.equal(snapshot.eventId,data.id);
  assert.equal(snapshot.elapsedSeconds,time);
  assert.equal(snapshot.sample,data.samples[i]);
 });
 assert.throws(()=>dynamicSnapshot(data,0.05),RangeError);
 assert.deepEqual([0,385,459,856,17999].map(index=>data.samples[index]),[
  {t:0,rpm:3199,torqueNm:350,railPressureMpa:159.82},
  {t:38.5,rpm:3197,torqueNm:0,railPressureMpa:85.04},
  {t:45.9,rpm:3203.5,torqueNm:0,railPressureMpa:24.33},
  {t:85.6,rpm:753,torqueNm:0,railPressureMpa:50.07},
  {t:1799.9,rpm:2221,torqueNm:57.5,railPressureMpa:93.84},
 ]);
}

assert.equal(new Set(Object.values(dynamicEvents).map(event=>event.id)).size,Object.keys(dynamicEvents).length);
for(const [slug,event] of Object.entries(dynamicEvents)){
 const file=path.join(root,'app',event.url);
 if(event.kind==='engine'&&!fs.existsSync(file)){
  summary.push({eventId:event.id,kind:event.kind,status:'local research data absent'});
  continue;
 }
 const bytes=fs.readFileSync(file);
 const data=validateDynamicEvent(JSON.parse(bytes));
 const river=data.kind==='river';
 const elapsed=river||data.kind==='battery'||data.kind==='engine';
 const tickValue=elapsed?value=>value:Date.parse;
 const ticks=dynamicTicks(data),times=new Set(ticks.map(tickValue));
 const observedStation=id=>(river?data.transects:data.stations)?.some(entry=>entry.id===id);
 assert.equal(data.kind,event.kind);
 assert.equal(data.id,event.id);
 assert(ticks.length>1);
 for(const [time,,station] of event.moments){
  assert(times.has(tickValue(time)),slug+' 的章节需要对应真实观测');
  if(station)assert(observedStation(station));
 }
 if(event.watch){
  const from=tickValue(event.watch.from),to=tickValue(event.watch.to);
  assert(times.has(from)&&times.has(to)&&from<to);
 }
 for(const {cue} of event.tour?.steps??[]){
  assert.equal(cue.route,'dynamic-'+slug);
  const time=tickValue(elapsed?cue.elapsedSeconds:cue.timeUtc);
  const end=elapsed?cue.endElapsedSeconds:cue.endTimeUtc;
  assert(times.has(time));
  if(end!=null)assert(times.has(tickValue(end))&&time<tickValue(end));
  if(cue.stationId)assert(observedStation(cue.stationId));
 }
 for(const id of event.primary??[])assert((data.series??data.channels)?.some(series=>series.id===id));
 if(river){
  checkRiver(data,ticks);
  summary.push({eventId:data.id,kind:data.kind,ticks:ticks.length,transects:data.transects.length,
   fromSeconds:ticks[0],toSeconds:ticks.at(-1)});
  continue;
 }else if(data.kind==='tide'){
  checkTide(data,ticks);
  summary.push({eventId:data.id,kind:data.kind,ticks:ticks.length,station:data.station.id,startUtc:data.startUtc,endUtc:data.endUtc});
  continue;
 }else if(data.kind==='battery'){
  checkBattery(data,ticks);
  summary.push({eventId:data.id,kind:data.kind,ticks:ticks.length,cell:data.sampleId,fromSeconds:ticks[0],toSeconds:ticks.at(-1)});
  continue;
 }else if(data.kind==='engine'){
  checkEngine(data,ticks,bytes);
  summary.push({eventId:data.id,kind:data.kind,ticks:ticks.length,fromSeconds:ticks[0],toSeconds:ticks.at(-1)});
  continue;
 }else if(data.kind==='wildfire'){
  assert.equal(data.frames.length,9);
  assert.equal(data.archive.md5,'098c12989f93d3c5f3f4c9edb3832bab');
  assert(!data.frames.some(frame=>['2021-08-02','2021-08-03'].includes(frame.archiveDate)),'Missing dates must stay absent.');
  for(const [index,frame] of data.frames.entries()){
   const image=fs.readFileSync(path.join(root,'app',frame.url));
   assert.equal(image.readUInt16BE(0),0xffd8);
   assert.equal(hash(image),frame.sha256);
   assert.match(frame.sourceGeometrySha256,/^[a-f0-9]{64}$/);
   const snapshot=dynamicSnapshot(data,frame.timeUtc);
   assert.equal(snapshot.frame,frame);
   for(const metric of snapshot.metrics)assert.equal(metric.sample?.value??null,frame[metric.id]);
   if(index){
    const net=frame.mappedKm2-data.frames[index-1].mappedKm2;
    assert(Math.abs(net-(frame.addedKm2-frame.outsideKm2))<=.021,'Two-way polygon difference must reconcile with total mapped area.');
   }
  }
  summary.push({eventId:data.id,kind:data.kind,archiveDates:data.frames.map(frame=>frame.archiveDate)});
  continue;
 }else if(data.frames){
  assert.equal(new Set(data.frames.map(f=>f.sha256)).size,data.frames.length,'Frames must contain distinct observations.');
  for(const frame of data.frames){
   const image=fs.readFileSync(path.join(root,'app',frame.url));assert.equal(hash(image),frame.sha256);assert.equal(image.readUInt32BE(16),frame.width);assert.equal(image.readUInt32BE(20),frame.height);
   assert(Date.parse(frame.scanEndUtc)>Date.parse(frame.scanStartUtc));assert(Date.parse(frame.scanStartUtc)>=Date.parse(frame.timeUtc));assert(Date.parse(frame.scanEndUtc)<Date.parse(frame.timeUtc)+600000);
   const numeric=frame.numericData;assert.equal(hash(fs.readFileSync(path.join(root,numeric.url??numeric.researchFile))),numeric.sha256);
   const snapshot=dynamicSnapshot(data,frame.timeUtc);assert.equal(snapshot.frame,frame);
   for(const metric of snapshot.metrics){if(Object.hasOwn(frame.stats,metric.id)){assert.equal(metric.sample.timeUtc,frame.timeUtc);assert.equal(metric.sample.value,frame.stats[metric.id]);}else if(metric.sample)assert(Date.parse(metric.sample.timeUtc)<=Date.parse(frame.timeUtc));}
  }
 }else{
  for(const t of ticks){const snapshot=dynamicSnapshot(data,t);for(const station of snapshot.stations){assert.equal(station.sample.timeUtc,t);assert(Date.parse(station.sample.peakTimeUtc)<Date.parse(station.sample.windowEndUtc));assert(Date.parse(station.sample.peakTimeUtc)>=Date.parse(station.sample.windowStartUtc));assert.equal(station.unit,'counts');}}
 }
 summary.push({eventId:data.id,kind:data.kind,observations:ticks.length,stations:data.stations?.length??0,startUtc:data.startUtc,endUtc:data.endUtc});
}
const html=fs.readFileSync(path.join(root,'app/index.html'),'utf8');for(const id of ['open-dynamic','dynamic-toolbar','dynamic-controls','dynamic-full','dynamic-close'])assert(html.includes('id="'+id+'"'));
console.log('Passed: event registry, image and waveform windows, river observations, tide and Moon sources, battery discharge, optional local ETC replay, synchronized cues, hashes and UI entries.');console.log(JSON.stringify(summary));
