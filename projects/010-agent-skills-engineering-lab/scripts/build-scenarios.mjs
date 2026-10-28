import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=path.join(root,'app');
const skills=fs.readdirSync(path.join(root,'research/upstream/skills')).filter(s=>fs.existsSync(path.join(root,'research/upstream/skills',s,'SKILL.md'))).sort();
const rows=['scenarios-foundations.json','scenarios-operations.json'].flatMap(name=>JSON.parse(fs.readFileSync(path.join(app,name),'utf8')));
assert.deepEqual(rows.map(r=>r.slug).sort(),skills,'Scenario set must match every upstream skill exactly');
for(const row of rows){
  for(const key of ['trigger','project','situation','request','deliverable','proof','notFor','control','distinction'])assert.ok(typeof row[key]==='string'&&row[key].trim(),`${row.slug}: missing ${key}`);
  assert.ok(Array.isArray(row.handoff)&&row.handoff.length&&row.handoff.every(s=>skills.includes(s)),`Invalid handoff: ${row.slug}`);
}
const output='// Teaching scenarios for every skill; examples are not execution claims.\nglobalThis.SKILL_SCENARIOS = '+JSON.stringify(rows,null,2).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+';\n';
const target=path.join(app,'scenarios-data.js');
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),output,'Generated scenarios are stale');
else fs.writeFileSync(target,output);
console.log(JSON.stringify({status:'pass',scenarios:rows.length,unique:new Set(rows.map(r=>r.slug)).size,requiredFields:9,sourceSkills:skills.length}));
