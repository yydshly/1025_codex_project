import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {narrationClips} from '../app/replica-script.js';

const projectRoot=fileURLToPath(new URL('../',import.meta.url));
const outputDir=path.join(projectRoot,'app/voice/minimax');
const hash=value=>createHash('sha256').update(value).digest('hex');

export function parseEnv(source){
  const entries={};
  for(const raw of source.replace(/^\uFEFF/,'').split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith('#'))continue;
    const match=line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if(!match)continue;
    let value=match[2].trim();
    if(value.startsWith('"')||value.startsWith("'")){
      const quote=value[0],end=value.lastIndexOf(quote);
      if(end>0)value=value.slice(1,end);
    }else value=value.replace(/\s+#.*$/,'').trim();
    entries[match[1]]=value;
  }
  return entries;
}

export function speechEndpoint(base){
  const url=new URL(base);
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new Error('MiniMax base must be a plain HTTPS API URL.');
  const official=['api.minimax.cn','api.minimax.io','api.minimaxi.com'];
  if(!official.includes(url.hostname))throw new Error('MiniMax credentials can only be sent to an official MiniMax API host.');
  const prefix=url.pathname.replace(/\/+$/,'').replace(/\/v1(?:\/t2a_v2)?$/,'');
  url.pathname=prefix+'/v1/t2a_v2';
  return url;
}

export function inspectWave(bytes){
  if(bytes.length<44||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')throw new Error('MiniMax did not return a WAV file.');
  let format=null,dataBytes=0;
  for(let at=12;at+8<=bytes.length;){
    const id=bytes.toString('ascii',at,at+4),length=bytes.readUInt32LE(at+4),start=at+8;
    if(start+length>bytes.length)throw new Error('MiniMax WAV file is truncated.');
    if(id==='fmt '&&length>=16)format={codec:bytes.readUInt16LE(start),channels:bytes.readUInt16LE(start+2),sampleRate:bytes.readUInt32LE(start+4),byteRate:bytes.readUInt32LE(start+8),blockAlign:bytes.readUInt16LE(start+12),bits:bytes.readUInt16LE(start+14)};
    if(id==='data')dataBytes+=length;
    at=start+length+(length%2);
  }
  if(!format||format.byteRate<=0||dataBytes<=0)throw new Error('MiniMax WAV contains no decodable audio.');
  if(![1,3,65534].includes(format.codec)||format.channels<1||format.channels>8||format.sampleRate<8000||format.sampleRate>192000||![8,16,24,32,64].includes(format.bits)||format.blockAlign!==format.channels*format.bits/8||format.byteRate!==format.sampleRate*format.blockAlign)throw new Error('MiniMax WAV format is invalid or unsupported.');
  return {...format,durationSeconds:dataBytes/format.byteRate};
}

export function decodeResponse(payload,httpStatus=200){
  if(httpStatus<200||httpStatus>=300){const error=new Error('MiniMax HTTP '+httpStatus);error.retryable=[429,500,502,503,504].includes(httpStatus);throw error;}
  const code=payload?.base_resp?.status_code;
  if(code!==0){const error=new Error('MiniMax provider error '+(Number.isInteger(code)?code:'unknown'));error.retryable=[1001,1002,1039].includes(code);throw error;}
  const hex=payload?.data?.audio;
  if(payload?.data?.status!==2||typeof hex!=='string'||!hex.length||hex.length%2||!/^[0-9a-f]+$/i.test(hex))throw new Error('MiniMax returned incomplete or invalid audio.');
  const bytes=Buffer.from(hex,'hex'),audio=inspectWave(bytes);
  if(audio.channels!==1||audio.sampleRate!==32000)throw new Error('MiniMax audio does not match the requested sample rate or channel count.');
  return {bytes,audio};
}

function options(argv){
  const result={};
  for(let i=0;i<argv.length;i++){
    const [flag,inline]=argv[i].split(/=(.*)/s);
    if(['--force','--dry-run'].includes(flag)){result[flag.slice(2)]=true;continue;}
    if(!['--env-file','--model','--voice','--speed','--clip'].includes(flag))throw new Error('Unknown voice generation option.');
    const value=inline??argv[++i];if(!value||value.startsWith('--'))throw new Error('Missing voice generation option value.');
    result[flag.slice(2)]=value;
  }
  return result;
}
async function readJSON(file){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(error){if(error.code==='ENOENT')return {};throw error;}}
async function writeAtomic(file,value){
  const temporary=file+'.pending';
  await fs.writeFile(temporary,value);
  await fs.rename(temporary,file);
}
async function reusable(entry,inputHash){
  if(!entry||entry.inputHash!==inputHash||!/^[a-z0-9-]+\.wav$/.test(entry.file))return false;
  try{const bytes=await fs.readFile(path.join(outputDir,entry.file));return hash(bytes)===entry.sha256&&inspectWave(bytes).durationSeconds>0;}catch{return false;}
}

async function synthesize(endpoint,key,request){
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(endpoint,{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(120000)});
      if(!response.ok){await response.body?.cancel();decodeResponse(null,response.status);}
      let payload;try{payload=await response.json();}catch{throw new Error('MiniMax returned a non-JSON response (HTTP '+response.status+').');}
      return decodeResponse(payload,response.status);
    }catch(error){
      if(!error.retryable||attempt===2)throw error;
      console.log('Transient MiniMax response; retrying this clip.');
      await new Promise(resolve=>setTimeout(resolve,(attempt+1)*1200));
    }
  }
}

export async function main(argv=process.argv.slice(2)){
  const args=options(argv);
  const envFile=path.resolve(args['env-file']||process.env.MINIMAX_ENV_FILE||'F:/codex_project/.env.minimax');
  const env=parseEnv(await fs.readFile(envFile,'utf8'));
  const key=env.MINIMAX_API_KEY;if(!key)throw new Error('MINIMAX_API_KEY is missing from the selected environment file.');
  const endpoint=speechEndpoint(env.MINIMAX_API_BASE||'https://api.minimax.cn');
  const model=args.model||env.MINIMAX_TTS_MODEL||'speech-2.8-hd';
  const voice=args.voice||env.MINIMAX_VOICE_ID||'Chinese (Mandarin)_Gentle_Senior';
  const speed=Number(args.speed||env.MINIMAX_TTS_SPEED||.95);
  if(!Number.isFinite(speed)||speed<.5||speed>2)throw new Error('Voice speed must be between 0.5 and 2.');
  const selected=args.clip?narrationClips.filter(clip=>clip.id===args.clip):narrationClips;
  if(!selected.length)throw new Error('The selected narration clip does not exist.');
  const requestFor=clip=>({model,text:clip.text,stream:false,language_boost:'Chinese',output_format:'hex',voice_setting:{voice_id:voice,speed,vol:1,pitch:0,emotion:'calm'},audio_setting:{sample_rate:32000,format:'wav',channel:1},subtitle_enable:false});
  console.log('MiniMax '+model+' / '+voice+' / '+selected.length+' clips / '+endpoint.hostname);
  if(args['dry-run']){console.log('Dry run: no request sent.');return;}
  await fs.mkdir(outputDir,{recursive:true});
  const manifestPath=path.join(outputDir,'manifest.json'),previous=await readJSON(manifestPath);
  const manifest={provider:'MiniMax',model,voice,speed,format:'wav',sampleRate:32000,updatedAt:new Date().toISOString(),complete:false,clips:previous.clips||{}};
  for(const [index,clip]of selected.entries()){
    if(!/^[a-z0-9-]+$/.test(clip.id)||clip.text.length>=10000)throw new Error('Narration ID or text exceeds the supported limits.');
    const request=requestFor(clip),inputHash=hash(JSON.stringify(request));
    if(!args.force&&await reusable(manifest.clips[clip.id],inputHash)){
      console.log('['+(index+1)+'/'+selected.length+'] '+clip.id+' cached');continue;
    }
    const {bytes,audio}=await synthesize(endpoint,key,request);
    const sha256=hash(bytes),file=clip.id+'-'+sha256.slice(0,12)+'.wav';
    await fs.writeFile(path.join(outputDir,file),bytes);
    manifest.clips[clip.id]={file,inputHash,sha256,bytes:bytes.length,...audio};
    await writeAtomic(manifestPath,JSON.stringify(manifest,null,2)+'\n');
    console.log('['+(index+1)+'/'+selected.length+'] '+clip.id+' '+audio.durationSeconds.toFixed(2)+'s');
  }
  const ready=await Promise.all(narrationClips.map(clip=>reusable(manifest.clips[clip.id],hash(JSON.stringify(requestFor(clip))))));
  if(!ready.every(Boolean)){console.log('Preview generated. The website has not switched; generate every clip to publish the voice set.');return;}
  manifest.complete=true;
  manifest.totalDurationSeconds=narrationClips.reduce((sum,clip)=>sum+manifest.clips[clip.id].durationSeconds,0);
  await writeAtomic(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  const source={provider:'MiniMax',model,voice,speed,files:Object.fromEntries(narrationClips.map(clip=>[clip.id,manifest.clips[clip.id].file]))};
  const module='// Generated public audio metadata. No API credentials are included.\nexport const narrationSource=Object.freeze('+JSON.stringify(source,null,2)+');\nexport function narrationUrl(id){const file=narrationSource.files[id];if(!file)throw new Error(\"Missing narration clip: \"+id);return new URL(\"./voice/minimax/\"+file,import.meta.url).href;}\n';
  await writeAtomic(path.join(projectRoot,'app/narration-source.js'),module);
  console.log('Ready: '+narrationClips.length+' MiniMax clips ('+manifest.totalDurationSeconds.toFixed(1)+'s).');
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  main().catch(error=>{console.error(error.message);process.exitCode=1;});
}
