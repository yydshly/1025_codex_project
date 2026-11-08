import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compareEventRecords} from '../app/event-comparison.js';
import {buildComparisonReport} from '../app/comparison-report.js';

const dataset=JSON.parse(fs.readFileSync(new URL('../app/data/mangkhut-jma.json',import.meta.url),'utf8'));
const a=dataset.records.findIndex(record=>record.timeUtc==='2018-09-14T06:00:00Z');
const b=dataset.records.findIndex(record=>record.timeUtc==='2018-09-16T06:00:00Z');

test('forward official records explain weaker center and closer reference without claiming local impact',()=>{
 const report=buildComparisonReport(dataset,compareEventRecords(dataset,a,b));
 assert.equal(report.headline,'中心减弱，但离香港更近');
 assert.match(report.text,/2018年9月14日 14:00（北京时间 UTC\+8）/);
 assert.match(report.text,/2018年9月16日 14:00（北京时间 UTC\+8）/);
 assert.match(report.text,/110 kt（10分钟平均/);assert.match(report.text,/75 kt（10分钟平均/);
 assert.match(report.text,/905 hPa/);assert.match(report.text,/960 hPa/);
 assert.match(report.text,/风速差−35 kt/);assert.match(report.text,/气压差\+55 hPa/);
 assert.match(report.text,/1,358\.4公里/);assert.match(report.text,/96\.5公里/);
 assert.match(report.text,/jma-1822/);assert.match(report.text,/2018-10-26/);
 assert.match(report.text,/第33行/);assert.match(report.text,/第41行/);
 assert.match(report.text,/22\.3019°N，114\.1742°E/);
 assert.match(report.text,/Haversine/);assert.match(report.text,/不是测站观测/);
 assert.match(report.text,/事件峰值没有与B时刻同步/);
 assert.ok(report.sources.some(source=>source.url==='https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html'));
});

test('reverse order is a signed numerical comparison instead of a forward evolution headline',()=>{
 const report=buildComparisonReport(dataset,compareEventRecords(dataset,b,a));
 assert.equal(report.headline,'B早于A：仅比较两条记录的数值');
 assert.match(report.text,/B比A早48小时/);
 assert.match(report.text,/风速差\+35 kt/);assert.match(report.text,/气压差−55 hPa/);
 assert.match(report.text,/不表示正时间方向的演变或因果/);
 assert.doesNotMatch(report.headline,/增强|减弱|更近|更远/);
});

test('missing wind produces no wind-change conclusion or substituted zero',()=>{
 const report=buildComparisonReport(dataset,compareEventRecords(dataset,0,b));
 assert.match(report.headline,/风速资料不完整/);
 assert.match(report.text,/中心最大持续风速未报告/);
 assert.match(report.text,/风速差无法计算（至少一条风速未报告）/);
 assert.match(report.text,/缺失值保持“未报告”/);
 assert.doesNotMatch(report.text,/中心最大持续风速0 kt/);
});

test('same record requests another time and reports zero displacement without NaN',()=>{
 const report=buildComparisonReport(dataset,compareEventRecords(dataset,a,a));
 assert.equal(report.headline,'这是同一条记录，请选择另一个时刻');
 assert.match(report.text,/A与B为同一时刻/);
 assert.match(report.text,/大圆位移约0公里/);
 assert.match(report.text,/平均移动速度记为0/);
 assert.doesNotMatch(report.text,/NaN|Infinity/);
});
