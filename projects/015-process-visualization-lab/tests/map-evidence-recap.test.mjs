import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mapRecapKind,mapRecapPlan} from '../app/map-evidence-recap.js';

const data = name => JSON.parse(readFileSync(new URL('../app/data/'+name+'.json',import.meta.url),'utf8'));

test('storm recap jumps to native scans on each side of the gap and reports analysis time separately', () => {
 const storm=data('storm-dynamic');
 const plan=mapRecapPlan('storm',storm);
 assert.deepEqual(plan.items.map(item=>item.time.slice(11,16)),['03:00','09:50','10:10','13:30']);
 assert.match(plan.items.at(-1).detail,/云图 13:30 · JMA 12:00 UTC/);
 assert.match(plan.summary,/85 → 75 kt/);
 const missing=storm.missingOriginalScans[0].timeUtc;
 assert.ok(plan.items.every(item=>item.time!==missing&&storm.frames.some(frame=>frame.timeUtc===item.time)));
});

test('Dixie review changes layer while holding one archive date, and only offers loaded evidence', () => {
 const fire=data('wildfire-dixie-dynamic'), context=data('dixie-context');
 const plan=mapRecapPlan('wildfire',fire,context);
 assert.ok(plan.items.every(item=>item.time===fire.frames.at(-1).timeUtc));
 assert.deepEqual(plan.items.map(({id,mode})=>[id,mode]),[['boundary','terrain'],['wind','terrain'],['slope','terrain'],['fuel','fuel']]);
 assert.match(plan.items.find(item=>item.id==='wind').detail,/08-05 16:00 PDT/);
 assert.deepEqual(mapRecapPlan('wildfire',fire,null).items.map(item=>item.id),['boundary']);
 assert.equal(mapRecapKind({route:'dynamic-wildfire-dixie',dixieEvidence:'slope'}),null);
 assert.equal(mapRecapKind({route:'dynamic-wildfire-dixie',dixieEvidence:'fuel'}),'wildfire');
});
