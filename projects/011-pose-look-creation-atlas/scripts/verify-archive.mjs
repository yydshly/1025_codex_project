import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('../app/archive/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
let files=0, bytes=0;
for(const repo of manifest.repositories){
  if(!/^[0-9a-f]{40}$/.test(repo.commit)||repo.errors.length)throw new Error(`Unpinned or incomplete: ${repo.repository}`);
  for(const f of repo.files){
    if(f.path.includes('..')||f.path.startsWith('/'))throw new Error('Unsafe archive path');
    const blob=await readFile(new URL(f.path,base));
    if(blob.length!==f.bytes||createHash('sha256').update(blob).digest('hex')!==f.sha256)throw new Error(`Archive differs: ${f.path}`);
    bytes+=blob.length;files++;
  }
}
if(files!==manifest.fileCount||bytes!==manifest.totalBytes)throw new Error('Manifest totals differ');
console.log(`Verified ${files} pinned files from ${manifest.repositories.length} repositories (${bytes} bytes).`);
