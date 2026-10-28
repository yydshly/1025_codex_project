import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import '../app/real-case-data.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=path.join(root,'app');
const data=globalThis.REAL_CASE;
const skills=fs.readdirSync(path.join(root,'research/upstream/skills')).filter(name=>fs.existsSync(path.join(root,'research/upstream/skills',name,'SKILL.md'))).sort();
assert.deepEqual(data.skillCoverage.map(x=>x.slug).sort(),skills,'Coverage must match all source skills exactly');
assert.equal(data.phases.length,6);
assert.equal(new Set(data.phases.map(x=>x.id)).size,6);
const states=new Set(['本轮采用','待验证','未触发']);
assert.ok(data.skillCoverage.every(x=>states.has(x.status)&&x.role&&x.note));
let links=0;
function localLink(value,base=app){
  if(/^(https?:|mailto:|data:)/.test(value))return;
  const [pathname]=value.split(/[?#]/);
  if(!pathname)return;
  const target=path.resolve(base,decodeURIComponent(pathname));
  assert.ok(target.startsWith(root+path.sep),`Link escapes project: ${value}`);
  assert.ok(fs.existsSync(target),`Missing local link: ${value}`);
  links++;
}
for(const phase of data.phases){
  assert.ok(phase.skills.every(slug=>skills.includes(slug)));
  assert.ok(phase.actions.length&&phase.artifacts.length&&phase.reflect.length&&phase.control);
  phase.artifacts.forEach(a=>localLink(a.href));
}
for(const file of ['index.html','real-case.html','recall.html','scenarios.html']){
  const html=fs.readFileSync(path.join(app,file),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`Duplicate IDs in ${file}`);
  for(const [,value]of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(value.startsWith('#'))assert.ok(ids.includes(value.slice(1)),`Broken anchor ${file}${value}`);
    else localLink(value);
  }
}
console.log(JSON.stringify({status:'pass',skills:skills.length,phases:data.phases.length,localLinks:links,htmlPages:4}));
