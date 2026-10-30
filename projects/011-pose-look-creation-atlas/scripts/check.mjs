import {readFile,stat} from 'node:fs/promises';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
await import('./verify-archive.mjs');
const base=new URL('../app/',import.meta.url);
const context={window:{}};vm.createContext(context);
for(const filename of ['data.js','archive-data.js','backup-data.js','experiments-data.js','resource-data.js','workspace-data.js','pose-pilot-data.js','series-data.js','series-record.js','costume-matrix-data.js'])vm.runInContext(await readFile(new URL(filename,base),'utf8'),context,{filename});
new vm.Script(await readFile(new URL('app.js',base),'utf8'),{filename:'app.js'});
new vm.Script(await readFile(new URL('effects.js',base),'utf8'),{filename:'effects.js'});
new vm.Script(await readFile(new URL('resources.js',base),'utf8'),{filename:'resources.js'});
new vm.Script(await readFile(new URL('gallery.js',base),'utf8'),{filename:'gallery.js'});
new vm.Script(await readFile(new URL('pose-pilot.js',base),'utf8'),{filename:'pose-pilot.js'});
new vm.Script(await readFile(new URL('series.js',base),'utf8'),{filename:'series.js'});
new vm.Script(await readFile(new URL('overview.js',base),'utf8'),{filename:'overview.js'});
new vm.Script(await readFile(new URL('costume-matrix.js',base),'utf8'),{filename:'costume-matrix.js'});
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
const pilot=context.window.POSE_PILOT;
if(pilot.currentVersion!=='v3'||pilot.versions.length!==3||pilot.totalGenerationCalls!==12)throw new Error('Original-pose pilot record incomplete');
for(const version of pilot.versions){
  const saved=JSON.parse(await readFile(new URL(`media/pose-pilot-${version.id}/manifest.json`,base),'utf8'));
  if(JSON.stringify(saved)!==JSON.stringify(version)||version.generationCalls!==4||version.assets.length!==4||version.cases.length!==3||version.realPersonInput!==false)throw new Error('Pilot manifest or scope differs');
  for(const item of version.assets){
    if(!item.path.startsWith(`media/pose-pilot-${version.id}/`)||item.path.includes('..')||item.attempts!==1)throw new Error('Unsafe or incomplete pilot asset');
    const blob=await readFile(new URL(item.path,base));
    if(blob.length!==item.bytes||createHash('sha256').update(blob).digest('hex')!==item.sha256||blob.readUInt32BE(16)!==item.width||blob.readUInt32BE(20)!==item.height)throw new Error('Pilot image bytes or dimensions differ: '+item.id);
  }
  for(const item of version.cases){
    if(!version.assets.some(asset=>asset.id===item.resultId)||item.inputOrder[0]!==version.baseId||item.inputOrder[1]!==item.poseId||!item.localPoseUrl.endsWith('/'+item.poseId+'.png')||!/^[a-f0-9]{64}$/.test(item.poseSha256))throw new Error('Pilot input or result association incomplete');
  }
}
const series=context.window.POSE_SERIES,directions=context.window.SERIES_DIRECTIONS;
const overview=JSON.parse(await readFile(new URL('media/research-overview-v1/manifest.json',base),'utf8'));
if(overview.role!=='research-infographic'||overview.generationCalls!==1||!overview.prompt||overview.asset.path!=='media/research-overview-v1/overview.png')throw new Error('Research overview record incomplete');
const overviewImage=await readFile(new URL(overview.asset.path,base));
if(overviewImage.length!==overview.asset.bytes||createHash('sha256').update(overviewImage).digest('hex')!==overview.asset.sha256||overviewImage.readUInt32BE(16)!==overview.asset.width||overviewImage.readUInt32BE(20)!==overview.asset.height)throw new Error('Research overview image differs');
for(const path of overview.sources)if(!(await stat(new URL('../'+path,base))).isFile())throw new Error('Missing overview source: '+path);
const publicGuide=JSON.parse(await readFile(new URL('media/research-overview-v3/manifest.json',base),'utf8'));
const guideBytes=await readFile(new URL(publicGuide.asset.path,base));
const coverBytes=await readFile(new URL('../'+publicGuide.asset.coverCopy,base));
if(publicGuide.role!=='public-research-infographic'||publicGuide.successfulOutputs!==1||guideBytes.length!==publicGuide.asset.bytes||createHash('sha256').update(guideBytes).digest('hex')!==publicGuide.asset.sha256||!guideBytes.equals(coverBytes))throw new Error('Public guide or exact cover copy differs');
const memory=JSON.parse(await readFile(new URL('media/research-overview-v2/manifest.json',base),'utf8'));
if(memory.role!=='private-research-memory-infographic'||memory.successfulOutputs!==1||memory.generationCalls!==2||memory.asset.private!==true||memory.asset.publicPath!==null||memory.asset.localUrl!=='/local-media/research-overview-v2.png'||memory.inputs.length!==5)throw new Error('Private overview scope incomplete');
for(const input of memory.inputs){
  if(!/^[a-f0-9]{64}$/.test(input.sha256))throw new Error('Private overview input hash missing');
  if(input.path){const bytes=await readFile(new URL(input.path,base));if(createHash('sha256').update(bytes).digest('hex')!==input.sha256)throw new Error('Private overview saved input differs: '+input.id);}
}
const privateMemoryPath=new URL('../.local/research-overview-v2/overview.png',base);
if(await stat(privateMemoryPath).catch(()=>null)){
  const bytes=await readFile(privateMemoryPath),a=memory.asset;
  if(bytes.length!==a.bytes||createHash('sha256').update(bytes).digest('hex')!==a.sha256||bytes.readUInt32BE(16)!==a.width||bytes.readUInt32BE(20)!==a.height)throw new Error('Private overview image differs');
}
if(await stat(new URL('media/research-overview-v2/overview.png',base)).catch(()=>null))throw new Error('Restricted overview must stay outside the public app directory');
const seriesManifest=JSON.parse(await readFile(new URL('media/courtyard-series-v1/manifest.json',base),'utf8'));
if(JSON.stringify(series)!==JSON.stringify(seriesManifest)||series.totalFrames!==6||series.frames.length!==6||series.newGenerationCalls!==3||series.reusedResults!==3||series.realPersonInput!==false)throw new Error('Series record or scope differs');
const phone=pilot.versions.find(v=>v.id==='v3');
if(series.base.sha256!==phone.assets.find(a=>a.id==='character-base').sha256||new Set(series.frames.map(f=>f.id)).size!==6||new Set(series.frames.map(f=>f.asset.path)).size!==6)throw new Error('Series base or frame associations differ');
let newCalls=0,reused=0;
for(const f of series.frames){
  const a=f.asset;
  if(!a.path.startsWith('media/')||a.path.includes('..')||!f.prompt||f.inputOrder[0]!==series.base.id||f.inputOrder[1]!==f.pose.id||f.pose.localUrl!==`/local-media/pose/${f.pose.id}.png`||!/^[a-f0-9]{64}$/.test(f.pose.sha256))throw new Error('Unsafe or incomplete series frame');
  const blob=await readFile(new URL(a.path,base));
  if(blob.length!==a.bytes||createHash('sha256').update(blob).digest('hex')!==a.sha256||blob.readUInt32BE(16)!==a.width||blob.readUInt32BE(20)!==a.height)throw new Error('Series image differs: '+f.id);
  if(f.mode==='new'){
    if(!a.path.startsWith('media/courtyard-series-v1/')||f.generationCalls!==1||f.attempts!==1||f.reusedFrom)throw new Error('Series new-call record differs');
    newCalls+=f.generationCalls;
  }else if(f.mode==='reuse'){
    const original=phone.assets.find(item=>item.id===f.reusedFrom?.assetId),sourceCase=phone.cases.find(item=>item.resultId===original?.id);
    if(!original||original.path!==a.path||original.sha256!==a.sha256||original.prompt!==f.prompt||sourceCase.poseId!==f.pose.id||sourceCase.poseSha256!==f.pose.sha256||f.generationCalls!==0)throw new Error('Reused result provenance differs');
    reused++;
  }else throw new Error('Unknown series frame mode');
}
if(newCalls!==3||reused!==3||directions.length!==5||new Set(directions.map(d=>d.id)).size!==5)throw new Error('Series count or directions incomplete');
for(const d of directions)for(const field of ['name','stage','goal','value','output','inputs','fixed','changes','gap','test','next'])if(!d[field])throw new Error('Direction missing '+field);
const resource=context.window.RESOURCE_RESEARCH;
const resourceFile=JSON.parse(await readFile(new URL('resource-research.json',base),'utf8'));
if(JSON.stringify(resource)!==JSON.stringify(resourceFile))throw new Error('Resource research data differs from record');
if(resource.audit.records!==1439||resource.audit.groups!==288||!resource.audit.localInventoryComplete||resource.audit.groupSizeHistogram['5']!==287||resource.audit.groupSizeHistogram['4']!==1)throw new Error('Resource inventory differs');
if(resource.directions.length!==7||resource.sources.length!==4)throw new Error('Direction research incomplete');
for(const direction of resource.directions)for(const id of direction.sources)if(!resource.sources.some(item=>item.id===id))throw new Error('Missing primary research source');
const html=await readFile(new URL('index.html',base),'utf8');
const matrix=context.window.COSTUME_MATRIX;
const matrixRecord=JSON.parse(await readFile(new URL('media/costume-matrix-v1/manifest.json',base),'utf8'));
if(JSON.stringify(matrix)!==JSON.stringify(matrixRecord)||matrix.frames.length!==9||matrix.outfits.length!==3||matrix.poses.length!==3||matrix.successfulImages!==9||matrix.acceptedRequests!==10||matrix.rejectedOutputs!==1||matrix.realPersonInput!==false)throw new Error('Costume matrix record or scope differs');
if(matrix.person.asset.path!=='media/pose-pilot-v3/character-base.png'||matrix.person.asset.sha256!==series.base.sha256||matrix.clothingLibrary.originals!==1407||matrix.clothingLibrary.categories.reduce((n,c)=>n+c.count,0)!==1407)throw new Error('Costume library or reused person differs');
const combinations=new Set();
for(const frame of matrix.frames){
  const outfit=matrix.outfits.find(item=>item.id===frame.outfitId),pose=matrix.poses.find(item=>item.id===frame.poseId),asset=frame.asset;
  if(!outfit||!pose||JSON.stringify(frame.inputOrder)!==JSON.stringify(['character-base',outfit.id,pose.id])||!frame.prompt||!frame.review||frame.generationCalls!==1||!asset.path.startsWith('media/costume-matrix-v1/')||asset.path.includes('..'))throw new Error('Matrix association incomplete');
  combinations.add(outfit.id+'/'+pose.id);const bytes=await readFile(new URL(asset.path,base));
  if(bytes.length!==asset.bytes||createHash('sha256').update(bytes).digest('hex')!==asset.sha256||bytes.readUInt32BE(16)!==asset.width||bytes.readUInt32BE(20)!==asset.height)throw new Error('Matrix result differs: '+frame.id);
}
if(combinations.size!==9||!html.includes('id="tab-matrix"')||!html.includes('id="matrix-dialog"'))throw new Error('Nine-cell matrix UI missing');
for(const input of [...matrix.outfits,...matrix.poses])if(input.publicPath!==null||!/^[a-f0-9]{64}$/.test(input.sha256))throw new Error('Restricted input is not private or lacks hash');
const branch=await readFile(new URL('branch.html',base),'utf8');
for(const page of [html,branch])for(const match of page.matchAll(/(?:src|href)="([^"#]+)"/g)){
  const relative=match[1];if(/^(?:https?:|data:)/.test(relative))continue;
  const target=new URL(relative,base);target.hash='';target.search='';
  if(!(await stat(target)).isFile())throw new Error(`Missing local asset: ${relative}`);
}
if(/original-images\//.test(html))throw new Error('Public HTML references private originals');
if(!html.includes('data-view="source"')||html.includes('id="effects"')||html.includes('experiment-v1/')||html.includes('src="effects.js"'))throw new Error('The source main page must not present independent experiments');
if(!branch.includes('data-view="branch"')||!branch.includes('id="effects"')||!branch.includes('id="thinking"')||!branch.includes('id="scenarios"')||!branch.includes('非原库验收'))throw new Error('Extension branch incomplete or unlabelled');
if(!html.includes('id="resource-inventory"')||!html.includes('id="direction-research"')||html.includes('file:///'))throw new Error('Resource state or direction research is missing or uses an unusable file link');
if(!html.includes('id="gallery"')||!html.includes('id="creation-plan"')||context.window.POSE_WORKSPACE.products.length!==3)throw new Error('Local workspace is incomplete');
if(!html.includes('id="tab-series"')||!html.includes('id="series-grid"')||!html.includes('id="series-dialog"'))throw new Error('Series workspace is incomplete');
if(!html.includes('id="research-overview"')||!html.includes('id="overview-dialog"'))throw new Error('Research overview UI missing');
console.log(`Research, scripts, local links, ${experiment.assets.length} legacy assets, ${pilot.versions.reduce((sum,version)=>sum+version.assets.length,0)} pose-pilot assets, six series frames (three new, three reused), five product directions, nine costume-pose combinations, public overview, private memory-overview record and backup summary verified.`);
