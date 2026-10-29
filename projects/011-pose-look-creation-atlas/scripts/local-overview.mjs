import {readFile,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {within} from './local-library.mjs';

export const localOverviewUrl='/local-media/research-overview-v2.png';
export async function loadLocalOverview(root){
  try{
    const filename=await realpath(path.join(root,'.local/research-overview-v2/overview.png'));
    if(!within(root,filename))return null;
    const record=JSON.parse(await readFile(path.join(root,'app/media/research-overview-v2/manifest.json'),'utf8'));
    const bytes=await readFile(filename),a=record.asset;
    if(bytes.length<24||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||a.localUrl!==localOverviewUrl||a.private!==true||a.publicPath!==null||bytes.length!==a.bytes||createHash('sha256').update(bytes).digest('hex')!==a.sha256||bytes.readUInt32BE(16)!==a.width||bytes.readUInt32BE(20)!==a.height)return null;
    const inputs=record.inputs.filter(item=>item.role!=='layout-reference').map(item=>({id:item.id,label:item.label,url:item.localUrl||'/app/'+item.path,sha256:item.sha256}));
    return {bytes,info:{available:true,id:record.id,url:localOverviewUrl,width:a.width,height:a.height,bytes:a.bytes,sha256:a.sha256,manifestUrl:'/app/media/research-overview-v2/manifest.json',inputs}};
  }catch{return null;}
}
