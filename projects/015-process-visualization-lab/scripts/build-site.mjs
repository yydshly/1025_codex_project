import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const app = path.join(root, 'app');
const output = path.join(root, 'dist', 'site');
const readJson = file => JSON.parse(fs.readFileSync(path.join(app, file), 'utf8'));
const assetPath = relative => {
  assert.match(relative, /^assets\/[a-zA-Z0-9][a-zA-Z0-9_./-]+$/);
  assert(!relative.split('/').some(part => !part || part.startsWith('.')), relative);
  return path.join(app, relative);
};

const { clips } = readJson('assets/narration/manifest.json');
const audio = new Set();
for (const clip of Object.values(clips)) {
  const playback = clip.playback;
  assert(playback && playback.url.endsWith('.mp3'), 'Missing compressed narration');
  const bytes = fs.readFileSync(assetPath(playback.url));
  assert.equal(bytes.length, playback.bytes, playback.url);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), playback.sha256, playback.url);
  audio.add(playback.url);
}

function verifyReferences(value) {
  if (typeof value === 'string' && value.startsWith('assets/')) {
    assert(fs.statSync(assetPath(value)).isFile(), value);
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(verifyReferences);
  }
}
for (const file of fs.readdirSync(path.join(app, 'data'))) {
  if (file.endsWith('.json') && !file.endsWith('.local.json')) verifyReferences(readJson('data/' + file));
}

function copyApp(source, relative = '') {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const name = relative ? relative + '/' + entry.name : entry.name;
    if (entry.name.startsWith('.') || name.endsWith('.local.json')) continue;
    assert(!entry.isSymbolicLink(), 'Publication cannot follow a link: ' + name);
    if (entry.isDirectory()) {
      copyApp(path.join(source, entry.name), name);
    } else if (entry.isFile()) {
      if (name.startsWith('assets/narration/minimax/') && !audio.has(name)) continue;
      const destination = path.join(output, 'app', name);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(source, entry.name), destination, fs.constants.COPYFILE_EXCL);
    }
  }
}

assert(!fs.existsSync(output), 'Build in a fresh checkout or output directory.');
fs.mkdirSync(output, { recursive: true });
fs.copyFileSync(path.join(root, 'publication', 'index.html'), path.join(output, 'index.html'));
copyApp(app);
assert(fs.statSync(path.join(output, 'app', 'index.html')).isFile());
console.log('观象发布包：回放网页、资料与 ' + audio.size + ' 段已校验 MP3。');
