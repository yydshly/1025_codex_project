import {readFile,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {within} from './local-library.mjs';
export const defaultCostumeRoot='E:/PersonalBackups/CostumeReferences/costume-db-20261030';
export async function loadCostumeInputs(projectRoot,directory=defaultCostumeRoot){
  try{
    const record=JSON.parse(await readFile(path.join(projectRoot,'app/media/costume-matrix-v1/manifest.json'),'utf8'));
    if(record.id!=='costume-matrix-v1'||record.outfits?.length!==3)return null;
    const root=await realpath(directory);
    const source=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
    const originals=new Map(source.files.filter(item=>item.kind==='original').map(item=>[item.id,item]));
    const images=new Map();
    for(const expected of record.outfits){
      const item=originals.get(expected.id);
      if(!/^[A-Z]+-\d+$/.test(expected.id)||!item||item.path!=='original-images/'+expected.id+'.png'||item.sha256!==expected.sha256||item.bytes!==expected.bytes) return null;
      const filename=await realpath(path.join(root,item.path));if(!within(root,filename))return null;
      const bytes=await readFile(filename);
      if(bytes.length!==expected.bytes||createHash('sha256').update(bytes).digest('hex')!==expected.sha256||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes.readUInt32BE(16)!==expected.width||bytes.readUInt32BE(20)!==expected.height)return null;
      images.set(expected.id,{bytes,sha256:expected.sha256,filename});
    }
    return images;
  }catch{return null;}
}
