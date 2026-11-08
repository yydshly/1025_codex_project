// Adapted from project 003's safe MiniMax generator. Credentials remain in memory.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {tours} from '../app/narration-script.js';
import {dynamicEvents} from '../app/dynamic-events.js';
import {mechanismAudioTours} from '../app/case-lessons.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const outputDir=path.join(root,'app/assets/narration/minimax');
const researchDir=path.join(root,'research/narration');
const registeredTours=Object.fromEntries(Object.values(dynamicEvents)
 .filter(event=>event.tour?.captionsOnly===false).map(event=>[event.id,event.tour]));
const listClips=entries=>Object.entries(entries).flatMap(([tour,entry])=>entry.steps.map((step,index)=>({id:`${tour}-${index}`,tour,text:step.text})));
Object.assign(registeredTours,mechanismAudioTours);
const registeredClips=listClips(registeredTours);
const clips=[...listClips(tours),...registeredClips];
const hash=value=>createHash('sha256').update(value).digest('hex');
const safeError=message=>new Error(message);

export function parseEnv(source){
 const entries={};
 for(const raw of source.replace(/^\uFEFF/,'').split(/\r?\n/)){
  const line=raw.trim();if(!line||line.startsWith('#'))continue;
  const match=line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);if(!match)continue;
  let value=match[2].trim();
  if(value.startsWith('"')||value.startsWith("'")){const quote=value[0],end=value.lastIndexOf(quote);if(end>0)value=value.slice(1,end);}
  else value=value.replace(/\s+#.*$/,'').trim();
  entries[match[1]]=value;
 }
 return entries;
}

export function speechEndpoint(base){
 let url;try{url=new URL(base);}catch{throw safeError('MiniMax base must be a valid HTTPS API URL.');}
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.port)throw safeError('MiniMax base must be a plain HTTPS API URL.');
 if(!['api.minimax.cn','api.minimax.io','api.minimaxi.com'].includes(url.hostname))throw safeError('Credentials may only be sent to an official MiniMax API host.');
 if(!['','/','/v1','/v1/','/v1/t2a_v2','/v1/t2a_v2/'].includes(url.pathname))throw safeError('Unexpected MiniMax API base path.');
 url.pathname='/v1/t2a_v2';return url;
}

export function inspectWave(bytes){
 if(bytes.length<44||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')throw safeError('MiniMax did not return a WAV file.');
 if(bytes.readUInt32LE(4)+8!==bytes.length)throw safeError('MiniMax RIFF length does not match the audio bytes.');
 let format=null,dataBytes=0,sampleCount=0,sumSquares=0,peak=0;
 const chunks=[];
 for(let at=12;at+8<=bytes.length;){
  const id=bytes.toString('ascii',at,at+4),length=bytes.readUInt32LE(at+4),start=at+8;
  if(start+length>bytes.length)throw safeError('MiniMax WAV file is truncated.');
  if(id==='fmt '&&length>=16)format={codec:bytes.readUInt16LE(start),channels:bytes.readUInt16LE(start+2),sampleRate:bytes.readUInt32LE(start+4),byteRate:bytes.readUInt32LE(start+8),blockAlign:bytes.readUInt16LE(start+12),bits:bytes.readUInt16LE(start+14)};
  if(id==='data'){dataBytes+=length;chunks.push([start,length]);}
  at=start+length+(length%2);
 }
 if(!format||format.codec!==1||format.channels!==1||format.sampleRate!==32000||format.bits!==16||format.blockAlign!==2||format.byteRate!==64000||dataBytes<=0||dataBytes%2)throw safeError('Expected nonempty 32-kHz mono 16-bit PCM WAV audio.');
 for(const [start,length]of chunks)for(let at=start;at<start+length;at+=2){const sample=bytes.readInt16LE(at);peak=Math.max(peak,Math.abs(sample));sumSquares+=sample*sample;sampleCount++;}
 const rms=Math.sqrt(sumSquares/sampleCount),durationSeconds=dataBytes/format.byteRate;
 if(durationSeconds<1||peak<500||rms<50)throw safeError('MiniMax audio is empty, near-silent, or implausibly short.');
 return {...format,durationSeconds,peak,rms:Number(rms.toFixed(4))};
}

export function decodeResponse(payload,httpStatus=200){
 if(httpStatus<200||httpStatus>=300){const error=safeError('MiniMax HTTP '+httpStatus);error.retryable=[429,500,502,503,504].includes(httpStatus);throw error;}
 const code=payload?.base_resp?.status_code;
 if(code!==0){const error=safeError('MiniMax provider error '+(Number.isInteger(code)?code:'unknown'));error.retryable=[1001,1002,1024,1033,1041,1045,2045,2064,2066].includes(code);throw error;}
 const hex=payload?.data?.audio;
 if(payload?.data?.status!==2||typeof hex!=='string'||!hex.length||hex.length%2||!/^[0-9a-f]+$/i.test(hex))throw safeError('MiniMax returned incomplete or invalid audio.');
 const bytes=Buffer.from(hex,'hex'),audio=inspectWave(bytes),extra=payload.extra_info||{};
 const provider={statusCode:0,completed:true};
 if(typeof payload.trace_id==='string'&&/^[A-Za-z0-9_-]{8,128}$/.test(payload.trace_id))provider.traceId=payload.trace_id;
 for(const key of ['usage_characters','audio_length','audio_sample_rate','audio_size','word_count','audio_channel'])if(Number.isFinite(extra[key]))provider[key]=extra[key];
 return {bytes,audio,provider};
}

function options(argv){
 const result={};
 for(let i=0;i<argv.length;i++){
  const [flag,inline]=argv[i].split(/=(.*)/s);
  if(['--force','--dry-run'].includes(flag)){result[flag.slice(2)]=true;continue;}
  if(!['--env-file','--model','--voice','--speed','--clip','--tour'].includes(flag))throw safeError('Unknown narration generation option.');
  const value=inline??argv[++i];if(!value||value.startsWith('--'))throw safeError('Missing narration option value.');result[flag.slice(2)]=value;
 }
 if(result.clip&&result.tour)throw safeError('Choose either --clip or --tour.');
 return result;
}
async function readJSON(file){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(error){if(error.code==='ENOENT')return {};throw safeError('A local narration metadata file could not be read.');}}
async function writeAtomic(file,value){const temp=file+'.pending';await fs.writeFile(temp,value);await fs.rename(temp,file);}
async function reusable(entry,inputHash){
 if(!entry||entry.inputHash!==inputHash||!/^[A-Za-z0-9-]+\.wav$/.test(entry.file))return false;
 try{const bytes=await fs.readFile(path.join(outputDir,entry.file));return hash(bytes)===entry.sha256&&inspectWave(bytes).durationSeconds===entry.durationSeconds;}catch{return false;}
}
async function synthesize(endpoint,key,request){
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetch(endpoint,{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(120000)});
   if(!response.ok){await response.body?.cancel();decodeResponse(null,response.status);}
   let payload;try{payload=await response.json();}catch{throw safeError('MiniMax returned a non-JSON response.');}
   return {...decodeResponse(payload,response.status),attempts:attempt+1};
  }catch(error){
   const transportCode=error?.cause?.code;
   if(error.message==='fetch failed'&&typeof transportCode==='string'&&/^[A-Z0-9_]+$/.test(transportCode))throw safeError('MiniMax transport error '+transportCode);
   if(!error.retryable||attempt===2)throw error;
   console.log('Transient MiniMax response; retrying this clip.');await new Promise(resolve=>setTimeout(resolve,(attempt+1)*1600));
  }
 }
}

export async function main(argv=process.argv.slice(2)){
 const args=options(argv),envFile=path.resolve(args['env-file']||process.env.MINIMAX_ENV_FILE||'F:/codex_project/.env.minimax');
 let env;try{env=parseEnv(await fs.readFile(envFile,'utf8'));}catch{throw safeError('The external MiniMax configuration could not be read.');}
 const key=env.MINIMAX_API_KEY;if(!key)throw safeError('MINIMAX_API_KEY is missing from the external configuration.');
 const endpoint=speechEndpoint(env.MINIMAX_API_BASE||'https://api.minimax.cn');
 const model=args.model||env.MINIMAX_TTS_MODEL||'speech-2.8-hd',voice=args.voice||env.MINIMAX_VOICE_ID||'Chinese (Mandarin)_Gentle_Senior',speed=Number(args.speed||env.MINIMAX_TTS_SPEED||.95);
 if(!Number.isFinite(speed)||speed<.5||speed>2)throw safeError('Voice speed must be between 0.5 and 2.');
 const selected=args.clip?clips.filter(clip=>clip.id===args.clip):args.tour?clips.filter(clip=>clip.tour===args.tour):clips;
 if(!selected.length)throw safeError('Requested narration clip or tour does not exist.');
 const sourceFile=path.join(root,'app/narration-script.js'),sourceHash=hash(await fs.readFile(sourceFile));
 const registryFile=path.join(root,'app/dynamic-events.js'),registryHash=hash(await fs.readFile(registryFile));
 const sourceReceipt={scriptSha256:sourceHash};
 if(registeredClips.length)sourceReceipt.registeredTourSha256=hash(JSON.stringify(registeredClips));
 const requestFor=clip=>({model,text:clip.text,stream:false,language_boost:'Chinese',output_format:'hex',voice_setting:{voice_id:voice,speed,vol:1,pitch:0,emotion:'calm'},audio_setting:{sample_rate:32000,format:'wav',channel:1},subtitle_enable:false});
 const settings={provider:'MiniMax',endpoint:endpoint.href,model,voice,speed,emotion:'calm',locale:'zh-CN',format:'wav',sampleRate:32000,channels:1};
 console.log(JSON.stringify({...settings,selectedClips:selected.length,characters:selected.reduce((sum,clip)=>sum+clip.text.length,0)}));
 const partialPath=path.join(outputDir,'manifest.partial.json'),previous=await readJSON(partialPath);
 // A chapter can move without changing the approved request or its WAV.
 const cacheByInput=new Map(Object.values(previous.clips??{}).map(entry=>[entry.inputHash,entry]));
 async function cachedClip(clip,inputHash){
  const exact=previous.clips?.[clip.id],moved=cacheByInput.get(inputHash);
  if(await reusable(exact,inputHash))return exact;
  if(moved!==exact&&await reusable(moved,inputHash))return moved;
  return null;
 }
 // An explicitly voiced registered tour extends the active collection. Check
 // all other cache entries first so a mismatched configuration cannot charge
 // for an extension that would fail to publish alongside the current clips.
 if(args.tour&&Object.hasOwn(registeredTours,args.tour)){
  for(const clip of clips.filter(item=>item.tour!==args.tour)){
   if(!await cachedClip(clip,hash(JSON.stringify(requestFor(clip)))))throw safeError('Current collection does not match the validated cache and requested settings. No API request sent.');
  }
  console.log('Existing narration cache verified; only the selected tour is eligible for synthesis.');
 }
 const cachedSelections=new Map();
 if(!args.force)for(const clip of selected){
  const cached=await cachedClip(clip,hash(JSON.stringify(requestFor(clip))));
  if(cached)cachedSelections.set(clip.id,cached);
 }
 if(args['dry-run']){
  console.log(`Dry run: ${cachedSelections.size} cached, ${selected.length-cachedSelections.size} need synthesis. No API request sent.`);return;
 }
 await fs.mkdir(outputDir,{recursive:true});await fs.mkdir(researchDir,{recursive:true});
 const partial={...settings,...sourceReceipt,updatedAt:new Date().toISOString(),complete:false,clips:{...previous.clips,...Object.fromEntries(cachedSelections)}};
 for(const [index,clip]of selected.entries()){
  if(!/^[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*-[0-9]+$/.test(clip.id)||typeof clip.text!=='string'||!clip.text.trim()||clip.text.length>=10000)throw safeError('Invalid narration id or text length.');
  const request=requestFor(clip),inputHash=hash(JSON.stringify(request));
  if(cachedSelections.has(clip.id)){console.log(`[${index+1}/${selected.length}] ${clip.id} cached`);continue;}
  const {bytes,audio,provider,attempts}=await synthesize(endpoint,key,request),sha256=hash(bytes),file=clip.id+'-'+sha256.slice(0,12)+'.wav';
  await writeAtomic(path.join(outputDir,file),bytes);
  partial.clips[clip.id]={file,inputHash,sha256,bytes:bytes.length,text:clip.text,...audio,provider,attempts,generatedAt:new Date().toISOString()};partial.updatedAt=new Date().toISOString();
  await writeAtomic(partialPath,JSON.stringify(partial,null,2)+'\n');
  console.log(`[${index+1}/${selected.length}] ${clip.id} ${audio.durationSeconds.toFixed(2)}s`);
 }
 const results=[];
 for(const clip of clips){
  const entry=partial.clips[clip.id];if(!await reusable(entry,hash(JSON.stringify(requestFor(clip))))){console.log('Preview retained; the active audio manifest has not changed.');return;}
  const bytes=await fs.readFile(path.join(outputDir,entry.file));results.push({id:clip.id,sha256:hash(bytes),bytes:bytes.length,...inspectWave(bytes)});
 }
 if(hash(await fs.readFile(sourceFile))!==sourceHash||(registeredClips.length&&hash(await fs.readFile(registryFile))!==registryHash))throw safeError('Narration source changed during synthesis. The active manifest has not changed.');
 const generatedAt=new Date().toISOString(),manifest={...settings,generatedAt,...sourceReceipt,clips:Object.fromEntries(clips.map(clip=>{const entry=partial.clips[clip.id];return [clip.id,{url:'assets/narration/minimax/'+entry.file,durationSeconds:entry.durationSeconds,text:clip.text,sha256:entry.sha256,inputHash:entry.inputHash,bytes:entry.bytes,sampleRate:entry.sampleRate,channels:entry.channels,bits:entry.bits}];}))};
 const report={passed:true,...settings,generatedAt,...sourceReceipt,clips:results.length,totalDurationSeconds:results.reduce((sum,item)=>sum+item.durationSeconds,0),totalBytes:results.reduce((sum,item)=>sum+item.bytes,0),results};
 await writeAtomic(path.join(researchDir,'minimax-validation-report.json'),JSON.stringify(report,null,2)+'\n');
 await writeAtomic(path.join(researchDir,'minimax-source.json'),JSON.stringify({...settings,generatedAt,...sourceReceipt,sourceScript:'app/narration-script.js',...(registeredClips.length?{registeredSourceScript:'app/dynamic-events.js'}:{}),adaptedFrom:'projects/003-unified-learning-design/scripts/generate-minimax-voice.mjs',documentation:['https://platform.minimax.cn/docs/api-reference/speech-t2a-http','https://platform.minimax.cn/docs/api-reference/errorcode','https://github.com/MiniMax-AI/skills/blob/main/skills/frontend-dev/references/minimax-voice-catalog.md'],feeNote:'Provider usage characters are recorded per successful clip; monetary charges are not returned or estimated.',clips:Object.fromEntries(clips.map(clip=>[clip.id,{inputHash:partial.clips[clip.id].inputHash,provider:partial.clips[clip.id].provider,generatedAt:partial.clips[clip.id].generatedAt}]))},null,2)+'\n');
 const activePath=path.join(root,'app/assets/narration/manifest.json'),active=await readJSON(activePath);
 if(active.voice&&active.provider!=='MiniMax'){
  const backup=path.join(researchDir,'windows-manifest.json');try{await fs.writeFile(backup,JSON.stringify(active,null,2)+'\n',{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}
 }
 partial.complete=true;partial.updatedAt=generatedAt;partial.totalDurationSeconds=report.totalDurationSeconds;
 await writeAtomic(partialPath,JSON.stringify(partial,null,2)+'\n');
 await writeAtomic(activePath,JSON.stringify(manifest,null,2)+'\n');
 console.log(`Ready: ${clips.length} verified MiniMax clips, ${report.totalDurationSeconds.toFixed(2)}s. Active manifest replaced atomically.`);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
