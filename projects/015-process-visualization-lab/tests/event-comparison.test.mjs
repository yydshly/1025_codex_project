import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compareEventRecords,getReferenceApproach} from '../app/event-comparison.js';

const mangkhut=JSON.parse(fs.readFileSync(new URL('../app/data/mangkhut-jma.json',import.meta.url),'utf8'));
const at=time=>mangkhut.records.findIndex(record=>record.timeUtc===time);
const equator={name:'Known equatorial geometry',records:[
 {timeUtc:'2018-09-14T18:00:00Z',lat:0,lon:179.5,windKt:30,pressureHpa:1000},
 {timeUtc:'2018-09-15T00:00:00Z',lat:0,lon:-179.5,windKt:35,pressureHpa:995}
]};

test('one equatorial degree across midnight and the date line is about111.2km',()=>{
 const comparison=compareEventRecords(equator,0,1,{lat:0,lon:180,label:'日期变更线参照点'});
 assert.ok(Math.abs(comparison.centerDisplacementKm-111.19508)<.001);
 assert.equal(comparison.elapsedHours,6);
 assert.ok(Math.abs(comparison.meanTranslationKmh-18.53251)<.001);
 assert.ok(Math.abs(comparison.referenceDistanceAKm-55.59754)<.001);
 assert.ok(Math.abs(comparison.referenceDistanceBKm-55.59754)<.001);
 assert.equal(comparison.windChangeKt,5);assert.equal(comparison.pressureChangeHpa,-5);
});

test('reverse comparisons keep positive speed, signed deltas, and same-record zero',()=>{
 const forward=compareEventRecords(equator,0,1),reverse=compareEventRecords(equator,1,0),same=compareEventRecords(equator,0,0);
 assert.equal(reverse.elapsedHours,-6);
 assert.equal(reverse.windChangeKt,-forward.windChangeKt);
 assert.equal(reverse.pressureChangeHpa,-forward.pressureChangeHpa);
 assert.equal(reverse.referenceDistanceChangeKm,-forward.referenceDistanceChangeKm);
 assert.equal(reverse.meanTranslationKmh,forward.meanTranslationKmh);
 assert.equal(same.elapsedHours,0);assert.equal(same.centerDisplacementKm,0);assert.equal(same.meanTranslationKmh,0);
 assert.match(reverse.deltaLabels.elapsed,/早6小时/);
});

test('Mangkhut14Sep to16Sep compares original analysis and retains source and scope',()=>{
 const result=compareEventRecords(mangkhut,at('2018-09-14T06:00:00Z'),at('2018-09-16T06:00:00Z'));
 assert.equal(result.a.lat,16.7);assert.equal(result.a.lon,125.7);
 assert.equal(result.b.lat,21.7);assert.equal(result.b.lon,113.5);
 assert.equal(result.elapsedHours,48);assert.equal(result.windChangeKt,-35);assert.equal(result.pressureChangeHpa,55);
 assert.ok(result.centerDisplacementKm>1300&&result.centerDisplacementKm<1500);
 assert.ok(result.meanTranslationKmh>27&&result.meanTranslationKmh<32);
 assert.ok(result.referenceDistanceChangeKm<0);
 assert.equal(result.provenance.source,mangkhut.source);
 assert.match(result.methodNote,/不是实际累计路程/);
 assert.match(result.methodNote,/不是中心最大持续风速/);
 assert.match(result.provenance.referenceScope,/不宣称是香港天文台总部精确位置/);
 assert.match(result.deltaLabels.wind,/减少35 kt/);
 assert.match(result.deltaLabels.reference,/更接近香港参照点/);
});

test('unreported measurements remain null and sampled nearest approach is not a precise event time',()=>{
 const result=compareEventRecords(mangkhut,0,at('2018-09-16T06:00:00Z'));
 assert.equal(result.a.windKt,null);assert.equal(result.windChangeKt,null);
 assert.match(result.deltaLabels.wind,/缺少数值/);
 const absentPressure=structuredClone(equator);absentPressure.records[1].pressureHpa=null;
 assert.equal(compareEventRecords(absentPressure,0,1).pressureChangeHpa,null);
 const nearest=getReferenceApproach(mangkhut);
 assert.equal(nearest.index,at('2018-09-16T06:00:00Z'));
 assert.equal(nearest.record,mangkhut.records[nearest.index]);
 assert.equal(nearest.sampleIntervalHours,6);
 assert.ok(nearest.distanceKm>95&&nearest.distanceKm<98);
 assert.match(nearest.methodNote,/每6小时采样/);
 assert.match(nearest.methodNote,/不是官方精确最接近时间/);
 assert.match(nearest.methodNote,/未对采样间位置插值/);
});
