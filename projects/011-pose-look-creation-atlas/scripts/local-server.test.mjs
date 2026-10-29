import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import http from 'node:http';
import vm from 'node:vm';
import path from 'node:path';
import {loadLocalLibrary,defaultLibraryRoot} from './local-library.mjs';
import {createLocalServer} from './local-server.mjs';

test('Private library: complete index, original image bytes, cache and access boundaries',async()=>{
  const library=await loadLocalLibrary(process.env.POSE_LOOK_LIBRARY||defaultLibraryRoot);
  assert.equal(library.payload.images,1439);assert.equal(library.payload.groupCount,288);
  assert.equal(library.payload.groups.filter(group=>group.views.length===4).length,1);
  const ids=new Set(library.payload.groups.flatMap(group=>group.views.map(view=>view.id)));assert.equal(ids.size,1439);
  const groupIds=new Set(library.payload.groups.map(group=>group.id));
  const context={window:{}};vm.createContext(context);vm.runInContext(await readFile(new URL('../app/workspace-data.js',import.meta.url),'utf8'),context);
  const editorial=context.window.POSE_WORKSPACE;
  for(const set of editorial.collections)for(const id of set.poses)assert.ok(groupIds.has(id),'Curated pose must exist: '+id);
  for(const product of editorial.products)for(const id of product.starter)assert.ok(groupIds.has(id),'Product starter must exist: '+id);
  let translated=0;for(const [prefix,entries] of Object.entries(editorial.translations))for(const number of Object.keys(entries)){assert.ok(groupIds.has(prefix+'_'+number));translated++;}assert.equal(translated,98);
  const server=createLocalServer({root:fileURLToPath(new URL('../',import.meta.url)),library});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  try{
    const api=await fetch(base+'/api/local-library');assert.equal(api.status,200);assert.equal((await api.json()).groups.length,288);
    const view=library.payload.groups.find(group=>group.id==='full_single_P015').views[0];
    const response=await fetch(base+view.url);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/png');
    const bytes=Buffer.from(await response.arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),view.sha256);
    assert.deepEqual(bytes,await readFile(library.images.get(view.id).filename));
    assert.equal((await fetch(base+view.url,{headers:{'If-None-Match':response.headers.get('etag')}})).status,304);
    assert.equal((await fetch(base+'/local-media/pose/does-not-exist.png')).status,404);
    assert.equal((await fetch(base+'/local-media/metadata/original-index.json')).status,404);
    assert.equal((await fetch(base+'/local-media/pose/%2e%2e%5cmanifest.json.png')).status,404);
    assert.equal((await fetch(base+'/api/local-library',{headers:{Origin:'https://example.org'}})).status,403);
    const rejectedHost=await new Promise((resolve,reject)=>{http.get(base+'/api/local-library',{headers:{Host:'example.org'}},response=>{response.resume();resolve(response.statusCode);}).on('error',reject);});
    assert.equal(rejectedHost,403);
    assert.equal((await fetch(base+'/api/local-library',{method:'POST'})).status,403);
    assert.equal((await fetch(base+'/%2e%2e%5cprojects.json')).status,403);
    assert.equal((await fetch(base+'/.local/server-state.json')).status,403);
    assert.equal((await fetch(base+'/app/gallery.js')).status,200);
    if(library.clothing)assert.equal((await fetch(base+'/local-media/clothing-preview.jpg')).headers.get('content-type'),'image/jpeg');
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('Missing library produces a useful status and keeps the research page accessible',async()=>{
  const server=createLocalServer({root:fileURLToPath(new URL('../',import.meta.url)),library:null,libraryError:'Configure POSE_LOOK_LIBRARY'});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  try{assert.equal((await fetch(base+'/api/local-library')).status,503);assert.equal((await fetch(base+'/app/')).status,200);assert.equal((await fetch(base+'/local-media/pose/full_single_P015_front.png')).status,503);}finally{await new Promise(resolve=>server.close(resolve));}
});

test('Private overview is served only through its approved route with matching integrity record',async()=>{
  const fixture=fileURLToPath(new URL(`../.local/overview-route-test-${process.pid}/`,import.meta.url));
  const imageDir=path.join(fixture,'.local/research-overview-v2'),recordDir=path.join(fixture,'app/media/research-overview-v2');
  await mkdir(imageDir,{recursive:true});await mkdir(recordDir,{recursive:true});
  const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=','base64');
  const sha256=createHash('sha256').update(bytes).digest('hex');
  await writeFile(path.join(imageDir,'overview.png'),bytes);
  await writeFile(path.join(recordDir,'manifest.json'),JSON.stringify({id:'research-overview-v2',asset:{localUrl:'/local-media/research-overview-v2.png',private:true,publicPath:null,bytes:bytes.length,sha256,width:1,height:1},inputs:[]}));
  const server=createLocalServer({root:fixture,library:null});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  try{
    const info=await (await fetch(base+'/api/local-overview')).json();assert.equal(info.available,true);assert.equal(info.sha256,sha256);
    const image=await fetch(base+info.url);assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await image.arrayBuffer()),bytes);
    assert.equal((await fetch(base+info.url,{headers:{'If-None-Match':image.headers.get('etag')}})).status,304);
    const head=await fetch(base+info.url,{method:'HEAD'});assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);
    assert.equal((await fetch(base+'/.local/research-overview-v2/overview.png')).status,403);
    assert.equal((await fetch(base+'/api/local-overview',{headers:{Origin:'https://example.org'}})).status,403);
    assert.equal((await fetch(base+info.url,{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
    await writeFile(path.join(imageDir,'overview.png'),Buffer.from('not the approved infographic'));
    assert.equal((await (await fetch(base+'/api/local-overview')).json()).available,false);
    assert.equal((await fetch(base+info.url)).status,404);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
