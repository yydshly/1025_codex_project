import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {utcMillis,indexAtOrBefore,selectObservation,selectCloudFrame,validateSyncBundle,makeClockTicks,synchronizedSnapshot} from '../app/sync-timeline.js';
import {observationChart,snapshotReport} from '../app/sync-observation-view.js';
const bundle=JSON.parse(fs.readFileSync(new URL('../app/data/mangkhut-synchronized.json',import.meta.url)));

test('the common clock uses actual UTC boundaries and never selects a future observation',()=>{
 validateSyncBundle(bundle);const ticks=makeClockTicks(bundle);
 assert.equal(ticks.length,73);assert.equal(ticks[0],'2018-09-16T00:00:00.000Z');assert.equal(ticks.at(-1),'2018-09-16T12:00:00.000Z');
 const wind=bundle.series.find(s=>s.id==='wind');
 assert.equal(selectObservation(wind,'2018-09-16T00:00:00Z').sample,null);
 assert.equal(selectObservation(wind,'2018-09-16T02:20:00Z').sample,null);
 const at=selectObservation(wind,'2018-09-16T05:10:00Z');
 assert.equal(at.sample.timeUtc,'2018-09-16T05:00:00Z');assert.equal(at.ageMinutes,10);assert.equal(at.sample.value,111.12);
 assert.equal(indexAtOrBefore(wind.samples,'2018-01-01T00:00:00Z'),-1);
});

test('rain remains an hourly district range, and an omitted district blocks stale-value reuse',()=>{
 const rain=bundle.series.find(s=>s.id==='rain');
 const at=selectObservation(rain,'2018-09-16T05:00:00Z');
 assert.equal(at.sample.lower,2);assert.equal(at.sample.upper,48);assert.equal(at.sample.windowStartUtc,'2018-09-16T03:45:00Z');assert.equal(at.sample.timeUtc,'2018-09-16T04:45:00Z');
 assert.equal(at.sample.publishedAtUtc,'2018-09-16T05:02:00Z');
 const gap=selectObservation(rain,'2018-09-16T10:50:00Z');assert.equal(gap.status,'missing');assert.equal(gap.sample,null);
 assert.equal(selectObservation(rain,'2018-09-16T11:50:00Z').status,'latest');
});

test('hourly sea level keeps its original time, source line and station-zero datum',()=>{
 const sea=bundle.series.find(s=>s.id==='seaLevel');
 const at=selectObservation(sea,'2018-09-16T06:20:00Z');
 assert.equal(at.sample.timeUtc,'2018-09-16T06:00:00Z');assert.equal(at.sample.value,3.73);assert.equal(at.ageMinutes,20);
 assert(Number.isInteger(at.sample.sourceLine));assert.equal(sea.datum.chartDatumConversionApplied,false);
 const report=snapshotReport(bundle,synchronizedSnapshot(bundle,38));assert.match(report.text,/站点零点/);assert.match(report.text,/14:00/);
});

test('cloud gaps stay empty, and every subplot places the same clock at the same x coordinate',()=>{
 const clouds={...bundle.clouds,maxAgeMinutes:0};
 assert.equal(selectCloudFrame(clouds,'2018-09-16T02:40:00Z').frame,null);
 const snapshot=synchronizedSnapshot(bundle,30);
 const charts=bundle.series.map(s=>observationChart(s,snapshot,bundle));
 const cursors=charts.map(html=>html.match(/<path d="M([\d.]+) 11V/)[1]);assert.equal(new Set(cursors).size,1);
 assert(charts.every(html=>html.includes('data-clock="2018-09-16T05:00:00.000Z"')));
 assert.match(charts[1],/2–48/);assert.doesNotMatch(charts[1],/>25</);
});

test('invalid dates, duplicate timestamps and inverted rain intervals cannot silently enter the archive',()=>{
 assert.throws(()=>utcMillis('2018-02-30T00:00:00Z'));assert.throws(()=>utcMillis('2018-09-16 00:00'));
 const duplicate=structuredClone(bundle);duplicate.series[0].samples[1].timeUtc=duplicate.series[0].samples[0].timeUtc;assert.throws(()=>validateSyncBundle(duplicate));
 const inverted=structuredClone(bundle);inverted.series[1].samples[0].lower=1000;assert.throws(()=>validateSyncBundle(inverted));
});
