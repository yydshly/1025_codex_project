import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const app = fileURLToPath(new URL('../app/',import.meta.url));
const manifestFile = path.join(app,'assets/narration/manifest.json');
const original = fs.readFileSync(manifestFile,'utf8');
const manifest = JSON.parse(original);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
let originalBytes = 0;
let playbackBytes = 0;

for(const clip of Object.values(manifest.clips)){
 const wave = path.join(app,clip.url);
 const bytes = fs.readFileSync(wave);
 if(sha256(bytes)!==clip.sha256)throw new Error(`Source WAV changed: ${clip.url}`);
 const url = clip.url.replace(/\.wav$/,'.mp3');
 if(url===clip.url)throw new Error(`Expected a WAV: ${clip.url}`);
 const output = path.join(app,url);
 const temp = output+`.${process.pid}.tmp`;
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',wave,'-map_metadata','-1',
  '-c:a','libmp3lame','-b:a','48k','-f','mp3',temp]);
 const mp3 = fs.readFileSync(temp);
 if(!mp3.length||mp3.length>=bytes.length)throw new Error(`Invalid compressed audio: ${url}`);
 fs.renameSync(temp,output);
 clip.playback = {url,bytes:mp3.length,sha256:sha256(mp3)};
 originalBytes+=bytes.length;
 playbackBytes+=mp3.length;
}
if(fs.readFileSync(manifestFile,'utf8')!==original)throw new Error('Narration manifest changed during encoding.');
const nextManifest = manifestFile+`.${process.pid}.tmp`;
fs.writeFileSync(nextManifest,JSON.stringify(manifest,null,2)+'\n');
fs.renameSync(nextManifest,manifestFile);
console.log(`Compressed ${Object.keys(manifest.clips).length} clips: ${originalBytes} → ${playbackBytes} bytes.`);
