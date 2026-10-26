import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const files=[...walk(path.join(root,'app')),...walk(path.join(root,'tools')),path.join(root,'vite.config.js')].filter(name=>/\.(m?js)$/.test(name));
for(const file of files)execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
const pages=['index.html','research.html','map.html','cinema.html','rain-study.html','theme.html','original.html'];
for(const page of pages)if(!fs.existsSync(path.join(root,'app',page)))throw new Error(`Missing page ${page}`);
console.log(`Syntax checked ${files.length} JavaScript modules and all ${pages.length} entry pages.`);
