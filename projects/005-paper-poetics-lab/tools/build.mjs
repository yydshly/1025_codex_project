import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url));
const reference=path.resolve(root,'../002-ink-rain-alley');
const npmCli=process.env.npm_execpath;
if(!npmCli)throw new Error('Use npm run build so the npm CLI path is available.');
if(!fs.existsSync(path.join(reference,'node_modules/three/package.json')))throw new Error('先在 projects/002-ink-rain-alley 运行 npm ci，再构建入口。');
execFileSync(process.execPath,[npmCli,'run','build'],{cwd:reference,stdio:'inherit'});
await build({configFile:path.join(root,'vite.config.js')});
const cinemaMedia=path.join(root,'dist/media/cinema');
fs.mkdirSync(cinemaMedia,{recursive:true});
for(const name of ['rain-window-tea.jpg','rain-window-tea.mp4','rain-window-study.jpg','rain-window-study.mp4']){
  const source=path.join(root,'app/media/cinema',name);
  if(fs.existsSync(source))fs.copyFileSync(source,path.join(cinemaMedia,name));
}
const destination=path.resolve(root,'dist/original');
for(const name of ['research-map.svg','research-map.png']){
  const source=path.join(root,'app/media',name);
  if(!fs.existsSync(source))throw new Error(`Missing overview asset: ${name}`);
  fs.copyFileSync(source,path.join(root,'dist/media',name));
}
if(!destination.startsWith(path.resolve(root,'dist')+path.sep))throw new Error('Copy target escaped the project.');
fs.cpSync(path.join(reference,'dist'),destination,{recursive:true,force:true});
console.log('入口、氛围影片、实时场景与原有演示已打包到一个本地站点。');
