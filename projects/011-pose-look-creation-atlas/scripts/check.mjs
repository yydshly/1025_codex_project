import {readFile,stat} from 'node:fs/promises';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
await import('./verify-archive.mjs');
const base=new URL('../app/',import.meta.url);
const context={window:{}};vm.createContext(context);
for(const filename of ['data.js','archive-data.js','backup-data.js','experiments-data.js'])vm.runInContext(await readFile(new URL(filename,base),'utf8'),context,{filename});
new vm.Script(await readFile(new URL('app.js',base),'utf8'),{filename:'app.js'});
new vm.Script(await readFile(new URL('effects.js',base),'utf8'),{filename:'effects.js'});
const {RESEARCH:r,BACKUP_STATUS:b}=context.window;
if(r.tools.length!==12||r.scenarios.length!==8)throw new Error('Research entries incomplete');
for(const list of [r.tools,r.scenarios,r.sources])if(new Set(list.map(item=>item.id)).size!==list.length)throw new Error('Duplicate IDs');
if(b.verified!==1439||b.expected!==1439||b.poseGroups!==288||b.failureCount)throw new Error('Original backup is incomplete');
const experiment=context.window.EXPERIMENTS;
if(experiment.assets.length!==8||experiment.cases.length!==3||experiment.generationCalls!==7)throw new Error('Experiment record incomplete');
for(const asset of experiment.assets){
  if(!asset.path.startsWith('media/experiment-v1/')||asset.path.includes('..'))throw new Error('Unsafe experiment asset path');
  const blob=await readFile(new URL(asset.path,base));
  if(blob.length!==asset.bytes||createHash('sha256').update(blob).digest('hex')!==asset.sha256)throw new Error('Experiment asset differs: '+asset.id);
  if(blob.readUInt32BE(16)!==asset.width||blob.readUInt32BE(20)!==asset.height)throw new Error('Experiment dimensions differ');
  if(asset.sourceVector&&createHash('sha256').update(await readFile(new URL(asset.sourceVector,base))).digest('hex')!==asset.sourceVectorSha256)throw new Error('Pose source differs');
  for(const id of asset.inputs)if(!experiment.assets.some(a=>a.id===id))throw new Error('Missing experiment input: '+id);
}
const manifest=JSON.parse(await readFile(new URL('media/experiment-v1/manifest.json',base),'utf8'));
if(JSON.stringify(manifest)!==JSON.stringify(experiment))throw new Error('Web experiment data differs from manifest');
const html=await readFile(new URL('index.html',base),'utf8');
const branch=await readFile(new URL('branch.html',base),'utf8');
for(const page of [html,branch])for(const match of page.matchAll(/(?:src|href)="([^"#]+)"/g)){
  const relative=match[1];if(/^(?:https?:|data:)/.test(relative))continue;
  const target=new URL(relative,base);target.hash='';target.search='';
  if(!(await stat(target)).isFile())throw new Error(`Missing local asset: ${relative}`);
}
if(/original-images\//.test(html))throw new Error('Public HTML references private originals');
if(!html.includes('data-view="source"')||html.includes('id="effects"')||html.includes('experiment-v1/')||html.includes('src="effects.js"'))throw new Error('The source main page must not present independent experiments');
if(!branch.includes('data-view="branch"')||!branch.includes('id="effects"')||!branch.includes('id="thinking"')||!branch.includes('id="scenarios"')||!branch.includes('非原库验收'))throw new Error('Extension branch incomplete or unlabelled');
console.log('Research, scripts, local links, 8 experiment assets and their input links/hashes, plus original-backup summary verified.');
