import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pipeline} from 'node:stream';
import {createGzip} from 'node:zlib';
const root=fileURLToPath(new URL('../',import.meta.url));
const port=4175;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav','.mp3':'audio/mpeg'};
const compressible=new Set(['.html','.css','.js','.json','.md','.svg']);
http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
 if(pathname==='/'){res.writeHead(302,{Location:'/app/index.html'});return res.end();}
 const file=path.resolve(root,'.'+pathname),relative=path.relative(root,file);
 if(relative.startsWith('..')||path.isAbsolute(relative)||relative.split(path.sep).some(p=>p.startsWith('.'))){res.writeHead(403);return res.end();}
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404);return res.end('Not found');}
  const extension=path.extname(file);
  const canCompress=compressible.has(extension)&&stat.size>=1024;
  const gzip=canCompress&&(req.headers['accept-encoding']||'').split(',').some(entry=>{
   const [name,...params]=entry.trim().toLowerCase().split(';');
   return name==='gzip'&&!params.some(param=>/^\s*q=0(?:\.0*)?\s*$/.test(param));
  });
  const headers={'Content-Type':types[extension]||'application/octet-stream','Cache-Control':'no-store'};
  if(canCompress)headers.Vary='Accept-Encoding';
  if(gzip)headers['Content-Encoding']='gzip';
  else headers['Content-Length']=stat.size;
  res.writeHead(200,headers);
  if(req.method==='HEAD')return res.end();
  const input=fs.createReadStream(file);
  if(gzip)pipeline(input,createGzip({level:4}),res,()=>{});
  else pipeline(input,res,()=>{});
 });
}).listen(port,'127.0.0.1',()=>console.log(`观象 · 过程实验室：http://127.0.0.1:${port}/app/index.html`));
