import {defineConfig} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const baseDir=fileURLToPath(new URL('./',import.meta.url));
const original=path.resolve(baseDir,'../002-ink-rain-alley/dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.ogg':'audio/ogg','.woff':'font/woff','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg'};
export default defineConfig({
  root:path.join(baseDir,'app'),base:'./',
  plugins:[{name:'linked-original-preview',configureServer(server){server.middlewares.use((req,res,next)=>{
    if(!req.url?.startsWith('/original/'))return next();
    if(req.method!=='GET'&&req.method!=='HEAD')return next();
    let name;try{name=decodeURIComponent(req.url.slice('/original'.length).split('?')[0]);}catch{res.statusCode=400;res.end();return;}
    const file=path.resolve(original,'.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(original+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;res.end('Original demo build unavailable. Run npm run build first.');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');
    if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file).pipe(res);
  });}}],
  server:{host:'127.0.0.1',port:4176,strictPort:true},preview:{host:'127.0.0.1',port:4176,strictPort:true},
  build:{outDir:path.join(baseDir,'dist'),emptyOutDir:false,chunkSizeWarningLimit:700,
    rollupOptions:{input:{index:path.join(baseDir,'app/index.html'),research:path.join(baseDir,'app/research.html'),map:path.join(baseDir,'app/map.html'),cinema:path.join(baseDir,'app/cinema.html'),rainStudy:path.join(baseDir,'app/rain-study.html'),theme:path.join(baseDir,'app/theme.html'),original:path.join(baseDir,'app/original.html')}}},
});
