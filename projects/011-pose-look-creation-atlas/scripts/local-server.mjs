import http from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import path from 'node:path';
import {within} from './local-library.mjs';
import {loadLocalOverview,localOverviewUrl} from './local-overview.mjs';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};

export function createLocalServer({root,library,libraryError=null}){
  return http.createServer(async(req,res)=>{
    const reply=(code,type,body,extra={})=>{res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin',...extra});res.end(req.method==='HEAD'?undefined:body);};
    try{
      const host=req.headers.host||'';
      if(!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)||!['GET','HEAD'].includes(req.method))return reply(403,'text/plain','Forbidden');
      if(req.headers['sec-fetch-site']==='cross-site'||(req.headers.origin&&req.headers.origin!=='http://'+host))return reply(403,'text/plain','Cross-origin request blocked');
      const url=new URL(req.url,'http://'+host);const pathname=decodeURIComponent(url.pathname);
      if(pathname==='/api/local-overview'||pathname===localOverviewUrl){
        const overview=await loadLocalOverview(root);
        if(pathname==='/api/local-overview')return reply(200,'application/json; charset=utf-8',JSON.stringify(overview?.info||{available:false}));
        if(!overview)return reply(404,'text/plain','Private overview unavailable');
        const etag='"'+overview.info.sha256+'"';
        if(req.headers['if-none-match']===etag){res.writeHead(304,{'ETag':etag,'Cache-Control':'private, max-age=3600','Cross-Origin-Resource-Policy':'same-origin'});return res.end();}
        return reply(200,'image/png',overview.bytes,{'ETag':etag,'Cache-Control':'private, max-age=3600','Content-Disposition':'inline; filename="pose-look-memory-overview-v2.png"'});
      }
      if(pathname==='/api/local-library')return reply(library?200:503,'application/json; charset=utf-8',JSON.stringify(library?library.payload:{mode:'unavailable',message:libraryError||'Local image library is not configured.'}));
      if(pathname.startsWith('/local-media/')){
        if(!library)return reply(503,'text/plain','Local library unavailable');
        const match=pathname.match(/^\/local-media\/pose\/([\w-]+)\.png$/);
        const item=match?library.images.get(match[1]):pathname==='/local-media/clothing-preview.jpg'?library.clothing:null;
        if(!item)return reply(404,'text/plain','Image not found');
        const etag=item.sha256?'"'+item.sha256+'"':null;
        if(etag&&req.headers['if-none-match']===etag){res.writeHead(304,{'ETag':etag,'Cache-Control':'private, max-age=3600','Cross-Origin-Resource-Policy':'same-origin'});return res.end();}
        return reply(200,match?'image/png':'image/jpeg',await readFile(item.filename),{'Cache-Control':'private, max-age=3600',...(etag?{'ETag':etag}:{}),'Content-Disposition':'inline; filename="'+path.basename(item.filename)+'"'});
      }
      const relative=pathname==='/'?'app/index.html':pathname.replace(/^\//,'');
      let filename=path.resolve(root,relative);
      if(!within(root,filename)||relative.split(/[\\/]/).some(part=>part.startsWith('.')))return reply(403,'text/plain','Forbidden');
      if((await stat(filename)).isDirectory())filename=path.join(filename,'index.html');
      filename=await realpath(filename);
      if(!within(root,filename))return reply(403,'text/plain','Forbidden');
      return reply(200,mime[path.extname(filename).toLowerCase()]||'application/octet-stream',await readFile(filename));
    }catch{return reply(404,'text/plain; charset=utf-8','Not found');}
  });
}
