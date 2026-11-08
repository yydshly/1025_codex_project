import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadTyphoonArchive,archiveRecordView,ARCHIVE_STAGES,buildArchiveExport} from '../app/typhoon-archive.js';

const dataset=JSON.parse(fs.readFileSync(new URL('../app/data/mangkhut-jma.json',import.meta.url),'utf8'));
const imagery=JSON.parse(fs.readFileSync(new URL('../app/data/imagery-manifest.json',import.meta.url),'utf8'));
const at=time=>dataset.records.findIndex(record=>record.timeUtc===time);

test('local official files load as the same 46-record event and six dated frames',async()=>{
 const requested=[];
 const archive=await loadTyphoonArchive(async url=>{
  requested.push(url);
  return {ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL('../app/'+url,import.meta.url),'utf8'))};
 });
 assert.deepEqual(requested,['data/mangkhut-jma.json','data/imagery-manifest.json']);
 assert.equal(archive.dataset.records.length,46);
 assert.equal(archive.frames.size,6);
 assert.equal(archive.frames.get('2018-09-16').width,4096);
 await assert.rejects(loadTyphoonArchive(async()=>({ok:false})),/不使用模拟/);
 const wrongDate=structuredClone(imagery);wrongDate.frames[0].date='2018-09-13';
 await assert.rejects(loadTyphoonArchive(async url=>({ok:true,json:async()=>url.includes('mangkhut-jma')?dataset:wrongDate})),/卫星帧/);
});

test('Hong Kong chapter keeps JMA center values separate from HKO event peaks',()=>{
 const view=archiveRecordView(dataset,at('2018-09-16T06:00:00Z'));
 assert.equal(view.record,dataset.records[39]);
 assert.equal(view.record.lat,21.7);assert.equal(view.record.lon,113.5);
 assert.equal(view.pressureLabel,'960 hPa');assert.match(view.windLabel,/75 kt/);assert.match(view.windLabel,/138\.9 km\/h/);
 assert.match(view.timeLabel,/9月16日 14:00.*UTC\+8/);
 assert.match(view.chapterTitle,/本地观测/);
 assert.match(view.insightHtml,/事件峰值，非当前时刻/);
 assert.match(view.insightHtml,/60分钟平均风速161 km\/h/);
 assert.match(view.insightHtml,/3\.88 m（海图基准面以上）/);
 assert.match(view.chartsHtml,/JMA事后分析/);
 assert.match(view.chartsHtml,/viewBox="0 0 280 100"/);
 assert.ok(view.sourceLinks.some(source=>new URL(source.url).hostname==='www.jma.go.jp'));
 assert.ok(view.sourceLinks.some(source=>new URL(source.url).hostname==='science.nasa.gov'));
 assert.ok(view.sourceLinks.some(source=>source.url.endsWith('/table352.html')));
});

test('missing winds remain missing and the local date never replaces the UTC imagery date',()=>{
 const first=archiveRecordView(dataset,-5),last=archiveRecordView(dataset,999);
 assert.equal(first.record.windKt,null);assert.equal(first.windLabel,'未报告');
 assert.match(first.readoutsHtml,/原始记录无数值，不补零/);
 assert.doesNotMatch(first.readoutsHtml,/>0<small>kt/);
 assert.match(first.chartsHtml,/data-metric="windKt" data-current="missing"/);
 assert.equal(last.record.windKt,null);assert.equal(last.day,'2018-09-17');
 assert.match(last.timeLabel,/9月18日 02:00.*UTC\+8/);
 assert.match(last.chapterTitle,/空值/);
 assert.equal(ARCHIVE_STAGES.length,4);
 assert.match(archiveRecordView(dataset,at(ARCHIVE_STAGES[1].time)).chapterTitle,/云系/);
});

test('archive export identifies retrospective evidence and actual imagery display separately',()=>{
 const view=archiveRecordView(dataset,at('2018-09-16T06:00:00Z'));
 const frame=imagery.frames.find(frame=>frame.date===view.day);
 const exported=buildArchiveExport(dataset,view,frame,null);
 assert.equal(exported.kind,'historical-event-archive');
 assert.equal(exported.dataType,'official-retrospective-best-track-analysis');
 assert.equal(exported.selectedRecord.windKt,75);
 assert.equal(exported.source.extractedOriginalSha256,dataset.source.extractedOriginalSha256);
 assert.equal(exported.availableImagery.date,'2018-09-16');
 assert.equal(exported.displayedImageryDate,null);
 assert.equal(buildArchiveExport(dataset,view,frame,view.day).displayedImageryDate,'2018-09-16');
 assert.throws(()=>buildArchiveExport(dataset,view,frame,'2018-09-15'),/显示影像日期/);
});

const chartByField=(html,field)=>html.match(new RegExp('<div class="chart archive-chart"[^>]*data-metric="'+field+'"[\\s\\S]*?</svg></div>'))?.[0];
const comparisonMarkers=html=>[...html.matchAll(/<g data-comparison-marker="([^"]+)"[^>]*>[\s\S]*?<\/g>/g)].map(match=>({role:match[1],html:match[0]}));
const originalCurve=chart=>chart.match(/<path d="([^"]*)" fill="none" stroke="[^"]+" stroke-width="1\.4"\/>/)?.[1];

test('optional comparison adds two real-time cursors without altering records or metric curves',()=>{
 const before=JSON.stringify(dataset),a=at('2018-09-14T06:00:00Z'),b=at('2018-09-16T06:00:00Z');
 const original=archiveRecordView(dataset,b),compared=archiveRecordView(dataset,b,a);
 assert.equal(original.chartsHtml,archiveRecordView(dataset,b,null).chartsHtml);
 assert.doesNotMatch(original.chartsHtml,/data-comparison-marker/);
 for(const field of ['windKt','pressureHpa']){
  const chart=chartByField(compared.chartsHtml,field),markers=comparisonMarkers(chart);
  assert.deepEqual(markers.map(x=>x.role),['A','B']);
  assert.match(markers[0].html,/data-record-index="31" data-time-utc="2018-09-14T06:00:00Z"/);
  assert.match(markers[1].html,/data-record-index="39" data-time-utc="2018-09-16T06:00:00Z"/);
  assert.match(markers[0].html,/stroke="#80e2ee" stroke-dasharray="3 3"/);
  assert.match(markers[1].html,/stroke="#ffd18b"/);assert.doesNotMatch(markers[1].html,/stroke-dasharray/);
  assert.match(markers[0].html,/<circle/);assert.match(markers[1].html,/<circle/);
  assert.equal(originalCurve(chart),originalCurve(chartByField(original.chartsHtml,field)));
 }
 assert.equal(JSON.stringify(dataset),before);
});

test('comparison x coordinates follow actual UTC intervals instead of record spacing',()=>{
 // These original records are separated by 6 h and then 18 h.
 const sparse={...dataset,records:[dataset.records[31],dataset.records[32],dataset.records[35]]};
 const markers=comparisonMarkers(chartByField(archiveRecordView(sparse,2,1).chartsHtml,'pressureHpa'));
 const first=Date.parse(sparse.records[0].timeUtc),duration=Date.parse(sparse.records[2].timeUtc)-first;
 const expectedA=(29+(Date.parse(sparse.records[1].timeUtc)-first)/duration*243).toFixed(2);
 assert.equal(expectedA,'89.75');
 assert.match(markers[0].html,new RegExp('d="M'+expectedA.replace('.','\\.')+' 5V81"'));
 assert.match(markers[1].html,/d="M272\.00 5V81"/);
});

test('A and B on the same record share exactly one cursor and one value marker',()=>{
 for(const index of [0,31]){
  const view=archiveRecordView(dataset,index,index);
  for(const field of ['windKt','pressureHpa']){
   const markers=comparisonMarkers(chartByField(view.chartsHtml,field));
   assert.equal(markers.length,1);assert.equal(markers[0].role,'A=B');
   assert.equal((markers[0].html.match(/<circle/g)||[]).length,dataset.records[index][field]===null?0:1);
   assert.match(markers[0].html,/>A=B(?: 未报告)?<\/text>/);
  }
 }
});

test('missing A or B wind values retain time cursors but never gain comparison dots',()=>{
 for(const [a,b,missingRole]of [[0,39,'A'],[31,45,'B']]){
  const view=archiveRecordView(dataset,b,a),windMarkers=comparisonMarkers(chartByField(view.chartsHtml,'windKt'));
  const missing=windMarkers.find(marker=>marker.role===missingRole),reported=windMarkers.find(marker=>marker.role!==missingRole);
  assert.match(missing.html,/data-value="missing"/);assert.match(missing.html,/未报告/);assert.doesNotMatch(missing.html,/<circle/);
  assert.match(reported.html,/<circle/);
  for(const marker of comparisonMarkers(chartByField(view.chartsHtml,'pressureHpa')))assert.match(marker.html,/<circle/);
 }
});

test('baseline selection uses the same bounded original-record index rules',()=>{
 const high=comparisonMarkers(chartByField(archiveRecordView(dataset,31,999).chartsHtml,'windKt'))[0];
 const low=comparisonMarkers(chartByField(archiveRecordView(dataset,31,-5).chartsHtml,'windKt'))[0];
 assert.match(high.html,/data-record-index="45"/);assert.match(low.html,/data-record-index="0"/);
 assert.throws(()=>archiveRecordView(dataset,31,NaN),/有限数字/);
});
