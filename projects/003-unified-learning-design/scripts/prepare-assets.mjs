import fs from 'node:fs/promises';
const target=new URL('../app/vendor/',import.meta.url);
await fs.mkdir(target,{recursive:true});
for(const [source,name] of [
 ['three/build/three.module.js','three.module.js'],['three/build/three.core.js','three.core.js'],['three/LICENSE','THREE-LICENSE.txt'],
 ['@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2','serif.woff2'],['@fontsource-variable/source-serif-4/LICENSE','SERIF-LICENSE.txt'],
 ['@fontsource-variable/caveat/files/caveat-latin-wght-normal.woff2','hand.woff2'],['@fontsource-variable/caveat/LICENSE','HAND-LICENSE.txt']
]) await fs.copyFile(new URL('../node_modules/'+source,import.meta.url),new URL(name,target));
console.log('Local Three.js and licensed font assets ready.');

