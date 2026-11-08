import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {SCENARIOS,compute,sampleSeries} from '../app/models.js';
import {validateEventDataset} from '../app/real-event-data.js';
import {validateSyncBundle,makeClockTicks,selectCloudFrame} from '../app/sync-timeline.js';
import {validateCloudChangeBundle} from '../app/sync-change-data.js';
import {validateEventFeed} from '../app/live-event-data.js';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const file of ['app/typhoon-archive.js','app/archive-globe-layer.js','app/event-comparison.js','app/comparison-report.js','app/comparison-view.js','app/real-motion.js','app/sync-timeline.js','app/sync-observation-view.js','app/sync-cloud-layer.js','app/sync-station-layer.js'])execFileSync(process.execPath,['--check',path.join(root,file)]);
for(const file of ['app/sync-observations.css','app/real-motion.css','app/event-analysis.css','app/archive-mode.css','app/view-navigation.css','app/real-event.html'])assert(fs.statSync(path.join(root,file)).isFile());
for(const file of ['app/real-event-app.js','app/real-event-earth.js','app/real-event-data.js','app/display-state.js','app/effect-volcano.js','app/effect-quake.js','app/effect-typhoon.js','app/process-insights.js','app/insight-view.js','app/globe-app.js','app/globe-engine.js','app/globe-effects.js','app/app.js','app/models.js','app/render-nature.js','app/render-systems.js','app/webgl-engine.js','app/scene-space.js','app/scene-nature.js','app/scene-systems.js','scripts/serve.mjs','research/real-events/parse-mangkhut-jma.mjs'])execFileSync(process.execPath,['--check',path.join(root,file)]);
assert.deepEqual(SCENARIOS.map(s=>s.id),['orbital','volcano','quake','typhoon','river','battery']);
for(const s of SCENARIOS){
 assert.equal(s.params.length,2);assert(s.limitation&&s.sources.length);
 for(const source of s.sources)assert.equal(new URL(source.url).protocol,'https:');
 for(const progress of [0,.21,.5,1])assert(compute(s.id,progress).metrics.every(m=>Number.isFinite(m.value)));
 assert.equal(sampleSeries(s.id).length,3);
}
for(const file of ['app/globe.html','app/globe-polish.css','app/globe.css','app/detail.html','app/assets/earth-blue-marble.png','app/index.html','app/real-event.html','app/view-navigation.css','app/real-event.css','app/styles.css','README.md','research/notes.md','app/vendor/three.module.js','app/vendor/three.core.js','app/assets/earth.glb','app/assets/moon-color.jpg','app/data/mangkhut-jma.json','app/data/imagery-manifest.json','research/real-events/mangkhut-jma.json','research/real-events/mangkhut-jma-source.txt','research/real-events/extension-contract.md'])assert(fs.statSync(path.join(root,file)).isFile());

const mainHtml=fs.readFileSync(path.join(root,'app/index.html'),'utf8');
assert.equal(mainHtml,fs.readFileSync(path.join(root,'app/globe.html'),'utf8'),'index与globe应为相同的统一地球入口');
const mainIds=[...mainHtml.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(mainIds.length,new Set(mainIds).size,'统一地球入口不能有重复id');
const legacyIds=['about','layers','section-index','topic-title','topic-description','location-name','location-coordinates','scale-note','current-insight','reset-conditions','parameters','param-guide','open-local','view-label','view-mode','earth-view','earth-canvas','geo-labels','earth-loading','reset-view','rotate','focus','visual-key','scene-caption','stage-steps','play','time-label','time-value','timeline','time-start','time-end','restart','speed','readout-title','readouts','chart-title','chart-domain','charts','explanation','next-topic','export','sources-panel','limitation','source-links','local-dialog','local-title','close-local','local-location','local-frame','notice'];
const archiveIds=['mode-records','open-real-motion','guide-toggle','open-conclusion','comparison-dialog','comparison-title','comparison-report','copy-comparison','download-comparison','close-comparison','open-archive','archive-switch','mode-principle','mode-archive','mode-description','archive-imagery-note','archive-image-type','archive-image-date','archive-image-status','archive-view-tools','archive-regional','archive-global','archive-evidence-dialog','close-archive-evidence'];
for(const id of [...legacyIds,...archiveIds])assert(mainIds.includes(id),`统一地球入口缺少${id}`);
for(const id of ['open-archive','mode-principle','mode-archive'])assert(new RegExp('<button\\b[^>]*\\bid="'+id+'"').test(mainHtml),`${id}应为页内模式切换按钮`);
assert.match(mainHtml,/<script[^>]+src="globe-app\.js"/);
assert.match(mainHtml,/<link[^>]+href="archive-mode\.css"/);

const data=validateEventDataset(JSON.parse(fs.readFileSync(path.join(root,'research/real-events/mangkhut-jma.json'),'utf8')));
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'app/data/mangkhut-jma.json'),'utf8')),data,'应用数据必须与研究原数据完全一致');
const originalBytes=fs.readFileSync(path.join(root,'research/real-events/mangkhut-jma-source.txt'));
const originalLines=originalBytes.toString('utf8').trimEnd().split(/\r?\n/);
assert.equal(data.name,'MANGKHUT');
assert.equal(data.eventId,'jma-1822');
assert.equal(data.records.length,46);
assert.equal(Number(originalLines[0].slice(12,15)),data.records.length);
assert.equal(originalLines.length,data.records.length+1);
assert.equal(crypto.createHash('sha256').update(originalBytes).digest('hex'),data.source.extractedOriginalSha256);
assert.equal(new URL(data.source.downloadUrl).hostname,'www.jma.go.jp');
for(const [index,record] of data.records.entries()){
 const line=originalLines[index+1];
 assert.equal(record.sourceLine,index+2);
 const t=line.slice(0,8);
 assert.equal(record.timeUtc,`20${t.slice(0,2)}-${t.slice(2,4)}-${t.slice(4,6)}T${t.slice(6,8)}:00:00Z`);
 assert.equal(record.lat,Number(line.slice(15,18))/10);
 assert.equal(record.lon,Number(line.slice(19,23))/10);
 assert.equal(record.pressureHpa,Number(line.slice(24,28)));
 const windToken=line.slice(33,36).trim();
 assert.equal(record.rawWindToken,windToken||null);
 assert.equal(record.windKt,windToken===''||windToken==='000'?null:Number(windToken));
}
function jpegDimensions(bytes){
 assert.equal(bytes.readUInt16BE(0),0xffd8,'影像必须为真实JPEG字节');
 const startOfFrame=new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
 let offset=2;
 while(offset<bytes.length){
  assert.equal(bytes[offset++],0xff,'JPEG段边界无效');
  while(bytes[offset]===0xff)offset++;
  const marker=bytes[offset++];
  if(marker===0xd9||marker===0xda)break;
  if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
  assert(offset+2<=bytes.length,'JPEG段头不完整');
  const length=bytes.readUInt16BE(offset);
  assert(length>=2&&offset+length<=bytes.length,'JPEG段长度无效');
  if(startOfFrame.has(marker)){
   assert(length>=8,'JPEG尺寸段无效');
   return {width:bytes.readUInt16BE(offset+5),height:bytes.readUInt16BE(offset+3)};
  }
  offset+=length;
 }
 throw new Error('未找到JPEG实际尺寸');
}
const imagery=JSON.parse(fs.readFileSync(path.join(root,'app/data/imagery-manifest.json'),'utf8'));
assert.equal(imagery.projection,'EPSG:4326');
assert.deepEqual(imagery.bbox,[-180,-90,180,90]);
assert.equal(imagery.layer,'VIIRS_SNPP_CorrectedReflectance_TrueColor');
assert.match(imagery.temporalType,/daily/);
assert.deepEqual(imagery.frames.map(frame=>frame.date).sort(),['2018-09-12','2018-09-13','2018-09-14','2018-09-15','2018-09-16','2018-09-17']);
for(const frame of imagery.frames){
 assert.match(frame.url,/^assets\/events\/mangkhut-earth-\d{8}\.jpg$/);
 const bytes=fs.readFileSync(path.join(root,'app',frame.url));
 assert.equal(bytes.length,frame.bytes,`${frame.date}文件大小不匹配`);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),frame.sha256,`${frame.date}影像SHA-256不匹配`);
 assert.deepEqual(jpegDimensions(bytes),{width:frame.width,height:frame.height});
 assert.equal(frame.width,4096);assert.equal(frame.height,2048);
 const source=new URL(frame.sourceUrl);
 assert.equal(source.hostname,'gibs.earthdata.nasa.gov');
 assert.equal(source.searchParams.get('TIME'),frame.date);
 assert.equal(source.searchParams.get('SRS'),'EPSG:4326');
 assert.equal(source.searchParams.get('BBOX'),'-180,-90,180,90');
 assert.equal(source.searchParams.get('LAYERS'),imagery.layer);
 assert.equal(Number(source.searchParams.get('WIDTH')),frame.width);
 assert.equal(Number(source.searchParams.get('HEIGHT')),frame.height);
}
console.log('通过：同地球双模式入口与50个原有控件保留；真实山竹46条记录与原始行／SHA-256及应用副本对应；6幅真实日合成尺寸与哈希；新旧模块语法；6个教学场景、12个参数、18组模型曲线。');


const synchronized=validateSyncBundle(JSON.parse(fs.readFileSync(path.join(root,'app/data/mangkhut-synchronized.json'),'utf8')));
assert.equal(synchronized.clouds.frames.length,72);assert.equal(makeClockTicks(synchronized).length,73);
assert.equal(selectCloudFrame(synchronized.clouds,'2018-09-16T02:40:00Z').frame,null);
assert.deepEqual(synchronized.clouds.bbox,[85,-10,165,55]);
for(const frame of synchronized.clouds.frames){
 assert(new URL(frame.sourceUrl).hostname==='noaa-himawari8.s3.amazonaws.com');
 const bytes=fs.readFileSync(path.join(root,'app',frame.url));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),frame.sha256);
 assert.equal(bytes.readUInt32BE(16),2048);assert.equal(bytes.readUInt32BE(20),1664);
 assert(Date.parse(frame.scanStartUtc)>=Date.parse(frame.timeUtc));
 assert(Date.parse(frame.scanEndUtc)<Date.parse(frame.timeUtc)+600000);
}
assert.equal(synchronized.series.find(s=>s.id==='wind').samples.length,128);
assert.equal(synchronized.series.find(s=>s.id==='rain').samples.length,41);
assert.equal(synchronized.series.find(s=>s.id==='seaLevel').samples.length,271);
console.log('通过：72张真实B13云图SHA/尺寸/扫描时窗；73个统一刻度；10:40真实缺帧；128条METAR/41个雨量窗/271条潮位记录。');

for(const file of ['app/sync-change-layer.js','app/sync-change-data.js'])execFileSync(process.execPath,['--check',path.join(root,file)]);
for(const id of ['archive-detail','cloud-relief','cloud-changes','sync-change-status'])assert(mainIds.includes(id));
const changes=validateCloudChangeBundle(JSON.parse(fs.readFileSync(path.join(root,'app/data/mangkhut-cloud-changes.json'),'utf8')),synchronized.clouds);
assert.equal(changes.frames.length,70);
for(const frame of changes.frames){
 assert.match(frame.url,/^assets\/events\/himawari8-change-v11\/b13-change-\d{8}T\d{4}Z\.png$/);
 const bytes=fs.readFileSync(path.join(root,'app',frame.url));
 assert.equal(bytes.length,frame.bytes);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),frame.sha256);
 assert.equal(bytes.readUInt32BE(16),2048);assert.equal(bytes.readUInt32BE(20),1664);
 assert.equal(bytes[25],6,'变化图必须为RGBA显示图');
}
console.log('通过：70对真实十分钟亮温差、原数值输入SHA/网格/覆盖完整性与派生PNG SHA/尺寸；不跨缺帧。');

for(const file of ['app/camera-fit.js','app/earth-event-layer.js','app/event-explorer.js','app/live-event-data.js','app/live-event-view.js','app/live-event-feed.js','scripts/update-earth-events.mjs'])execFileSync(process.execPath,['--check',path.join(root,file)]);
for(const id of ['open-events','live-toolbar','live-status','live-refresh','live-search','live-older','live-view-tools','live-whole','live-detail','capabilities-panel'])assert(mainIds.includes(id));
assert(fs.statSync(path.join(root,'app/event-explorer.css')).isFile());
const liveFeed=validateEventFeed(JSON.parse(fs.readFileSync(path.join(root,'app/data/earth-events-snapshot.json'),'utf8')));
assert(liveFeed.sources.every(source=>source.status==='ok'),'随项目交付的完整快照必须来自成功请求');
execFileSync(process.execPath,[path.join(root,'research/live-events/verify-live-events.mjs')],{stdio:'inherit'});
console.log('通过：完整地球相机、新事件入口、真实目录与来源离线复现。');

for(const file of ['app/dynamic-data.js','app/dynamic-globe-layer.js','app/dynamic-player.js'])execFileSync(process.execPath,['--check',path.join(root,file)]);
execFileSync(process.execPath,[path.join(root,'scripts/check-dynamics.mjs')],{stdio:'inherit'});

for(const file of ['app/narration-session.js','app/narration-guide.js','app/narration-script.js','scripts/check-narration.mjs'])execFileSync(process.execPath,['--check',path.join(root,file)]);
execFileSync(process.execPath,[path.join(root,'scripts/check-narration.mjs')],{stdio:'inherit'});

for(const file of ['app/demo-session.js','app/demo-evidence-data.js','app/demo-workbench.js'])execFileSync(process.execPath,['--check',path.join(root,file)]);
for(const id of ['demo-catalog','demo-workbench','demo-stage-tabs','demo-compare-view','demo-split','demo-delta-panel','demo-source-evidence','demo-show-a','demo-show-b','demo-mini-play'])assert(mainIds.includes(id),'缺少真实对照演示入口：'+id);
assert(fs.statSync(path.join(root,'app/demo-workbench.css')).isFile());
console.log('通过：四个真实事件配套演示、同一地球入口与A/B对照控件完整。');

for(const file of ['app/observed-story.js','app/observed-story-layer.js','app/observed-presentation.js'])execFileSync(process.execPath,['--check',path.join(root,file)]);
for(const id of ['observed-story-band','observed-locations','observed-keyframes','story-headline','story-location-list','story-narrate','story-annotations','story-feature-retry'])assert(mainIds.includes(id),'缺少球面解读入口：'+id);
const storyFeatures=JSON.parse(fs.readFileSync(path.join(root,'app/data/observed-change-features.json'),'utf8'));
assert.equal(storyFeatures.events.volcano.frames.length,25);assert.equal(storyFeatures.events.storm.frames.length,23);
console.log('通过：48帧真实亮温轮廓、地球标注与同步解读入口齐全。');
const implementationPlan=JSON.parse(fs.readFileSync(path.join(root,'research/implementation-roadmap.json'),'utf8'));
const sceneSpecifications=JSON.parse(fs.readFileSync(path.join(root,'research/scenario-specifications.json'),'utf8'));
const operations=JSON.parse(fs.readFileSync(path.join(root,'research/operating-contracts.json'),'utf8'));
assert.equal(sceneSpecifications.scenarios.length,7);assert.equal(new Set(sceneSpecifications.scenarios.map(s=>s.id)).size,7);
const implementationHtml=fs.readFileSync(path.join(root,'research/implementation-plan.html'),'utf8');
for(const scene of sceneSpecifications.scenarios){assert(scene.primaryIndicators.length<=2);assert(implementationHtml.includes(`id='${scene.id}'`));}
assert(implementationPlan.dependencyPolicy.perScenarioGate.length>0);assert(operations.timeAndSpace&&operations.narration&&operations.dataOperations);
console.log('通过：七方向规格、独立数据准入、运行合同与可读实施页一致。');
