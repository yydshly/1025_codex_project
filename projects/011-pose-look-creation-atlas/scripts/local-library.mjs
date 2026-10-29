import {readFile,realpath,stat} from 'node:fs/promises';
import path from 'node:path';

export const defaultLibraryRoot='E:/PersonalBackups/PoseLookReferences/pose-db-20261029';
const families={
  '全身1人・標準系':{id:'standard',label:'全身单人 · 标准'},
  '上半身1人':{id:'upper',label:'上半身单人'},
  '全身1人・セクシー系':{id:'expressive',label:'全身单人 · 原站性感系'},
  '2人絡み':{id:'pair',label:'双人 · 原站分类'}
};
const categories={'立ち':'站姿','座り':'坐姿','膝立ち':'跪姿','横座り・女の子座り':'侧坐与屈膝坐','寝そべり':'躺姿','しゃがみ':'蹲姿','前かがみ':'前倾','のけぞり・反り':'后仰与弓身','ひねり':'转体','膝立ち・四つん這い':'跪姿与四点支撑','特殊':'特殊姿势','かわいい系':'手势与表情动作'};
const angles={'正面':'正面','上から':'俯视','下から':'仰视','横':'侧面','斜め':'斜侧'};
const angleOrder=['正面','上から','下から','横','斜め'];
export function within(root,target){const rel=path.relative(root,target);return rel!==''&&!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel);}

export async function loadLocalLibrary(directory=defaultLibraryRoot){
  const root=await realpath(directory);
  const index=JSON.parse(await readFile(path.join(root,'metadata/original-index.json'),'utf8'));
  const manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
  const source=new URL(manifest.source||'https://ai-pose-gallery.pages.dev/').origin;
  const rows=new Map(index.map(row=>[row.id,row]));
  if(rows.size!==index.length)throw new Error('Duplicate source image IDs');
  const images=new Map();const groups=new Map();
  for(const item of manifest.files){
    const row=rows.get(item.id);
    if(!row||!/^[\w-]+$/.test(item.id)||!item.path.startsWith('original-images/')||images.has(item.id))throw new Error('Invalid library manifest');
    const filename=await realpath(path.resolve(root,item.path));
    if(!within(root,filename)||(await stat(filename)).size!==item.bytes)throw new Error('Original image missing or outside library');
    const family=families[row['系統']]||{id:row['系統'],label:row['系統']};
    const key=item.id.replace(/_(front|high|low|side|diag)$/,'');
    const group=groups.get(key)||{id:key,family:family.id,familyLabel:family.label,familyOriginal:row['系統'],number:row['ポーズ番号'],name:row['ポーズ名'],category:categories[row['分類']]||row['分類'],categoryOriginal:row['分類'],views:[]};
    group.views.push({id:item.id,angle:angles[row['アングル']]||row['アングル'],angleOriginal:row['アングル'],url:'/local-media/pose/'+item.id+'.png',sourceUrl:item.url||new URL(row['原寸'],source).href,width:item.width,height:item.height,bytes:item.bytes,sha256:item.sha256});
    groups.set(key,group);images.set(item.id,{filename,bytes:item.bytes,sha256:item.sha256});
  }
  if(images.size!==index.length)throw new Error('Index and original-image counts differ');
  const list=[...groups.values()].sort((a,b)=>a.id.localeCompare(b.id));
  for(const group of list)group.views.sort((a,b)=>angleOrder.indexOf(a.angleOriginal)-angleOrder.indexOf(b.angleOriginal));
  let clothing=null;
  try{const filename=await realpath(path.join(root,'clothing-preview/author-contact-sheet.jpg'));if(within(root,filename))clothing={filename};}catch{}
  return {root,images,clothing,payload:{version:1,mode:'local-private',source,images:images.size,groupCount:list.length,groups:list,families:Object.values(families),clothingPreview:clothing?'/local-media/clothing-preview.jpg':null,licenceUrl:source,notice:'本机原图挂载；原始图片未复制到公开 app 目录。'}};
}
