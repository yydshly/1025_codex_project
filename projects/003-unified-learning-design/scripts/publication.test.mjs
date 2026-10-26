import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { preparePages } from './prepare-pages.mjs';

const sourceBase = 'https://github.com/yydshly/1025_codex_project/blob/main/projects/003-unified-learning-design/';
const assets = [
  'future-layout-concepts.png', 'optimized-energy-cue.png', 'understanding-atlas.png',
  'understanding-atlas.svg', 'reading-v4.4/01-before-reading.png', 'reading-v4.4/07-final-desktop.png',
];
function write(root, relative, value = 'fixture') {
  const target = path.join(root, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, value); return target;
}
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'unified-learning-publication-'));
  const summary = '<link href="./research-summary.css?v=1"><script src="./research-summary.js"></script><a href="#method">method</a><section id="method">summary</section><a href="./index.html">sample</a><img src="../assets/images/understanding-atlas.png"><button data-zoom="../assets/images/understanding-atlas.png">zoom</button><a href="../README.md#effect">docs</a><a href="../research/audit.html">audit</a><a href="https://example.com/source.md">external</a>';
  write(root, 'app/research-summary.html', summary);
  write(root, 'app/index.html', '<script type="module" src="./replica.js"></script>');
  write(root, 'app/research-summary.css', '.poster{color:green}');
  write(root, 'app/research-summary.js', 'console.log("summary");');
  write(root, 'app/replica.js', "export const panel=`<a href='../research/physics-models.md'>model</a>`;");
  write(root, 'app/vendor/three.module.js', 'export const engine=true;');
  write(root, 'app/vendor/THREE-LICENSE.txt', 'MIT fixture');
  write(root, 'app/vendor/serif.woff2', Buffer.from([0, 1, 2, 3]));
  write(root, 'app/.env', 'PRIVATE_FIXTURE_DO_NOT_PUBLISH=true');
  write(root, 'app/.cache/inside.js', 'private fixture');
  write(root, 'app/unlisted.json', '{"privateFixture":true}');
  write(root, 'app/voice/old.wav', 'old fixture audio');
  write(root, 'app/voice/minimax/manifest.json', '{"privateFixture":true}');
  const files = Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`cue-${i}`, `clip-${i}.wav`]));
  write(root, 'app/narration-source.js', `export const narrationSource=Object.freeze(${JSON.stringify({ provider: 'MiniMax', files })});\nexport function narrationUrl(id){return files[id];}`);
  for (const [index, name] of Object.values(files).entries()) write(root, `app/voice/minimax/${name}`, Buffer.from(`RIFF fixture ${index}`));
  for (const asset of assets) write(root, `assets/images/${asset}`, Buffer.from(`asset ${asset}`));
  write(root, 'assets/images/unrelated-research.png', 'unpublished fixture');
  write(root, 'README.md', '# fixture');
  write(root, 'research/physics-models.md', '# model');
  write(root, 'research/audit.html', '<h1>source research</h1>');
  write(root, 'scripts/private-tool.mjs', 'not public');
  return { root, summary, files };
}
function list(root, relative = '') {
  return fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap(entry => {
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    return entry.isDirectory() ? list(root, name) : [name];
  });
}

test('publishes a full root summary with preserved app, hash, assets and only current voice files', () => {
  const { root, summary, files } = fixture(), result = preparePages(root), published = list(result.output);
  assert.equal(result.voiceFiles, 13);
  const home = fs.readFileSync(path.join(result.output, 'index.html'), 'utf8');
  assert.match(home, /<section id="method">summary<\/section>/);
  assert.match(home, /href="#method"/);
  assert.match(home, /href="\.\/app\/research-summary\.css\?v=1"/);
  assert.match(home, /src="\.\/app\/research-summary\.js"/);
  assert.match(home, /href="\.\/app\/index\.html"/);
  assert.match(home, /(?:src|data-zoom)="\.\/assets\/images\/understanding-atlas\.png"/);
  assert.doesNotMatch(home, /http-equiv|location\.(?:href|replace)/);
  assert.ok(published.includes('app/vendor/THREE-LICENSE.txt'));
  assert.ok(published.includes('app/vendor/serif.woff2'));
  assert.equal(published.filter(name => name.endsWith('.wav')).length, 13);
  for (const name of Object.values(files)) assert.deepEqual(fs.readFileSync(path.join(result.output, 'app/voice/minimax', name)), fs.readFileSync(path.join(root, 'app/voice/minimax', name)));
  assert.equal(published.filter(name => name.startsWith('assets/')).length, 6);
  for (const relative of ['app/.env', 'app/.cache/inside.js', 'app/unlisted.json', 'app/voice/old.wav', 'app/voice/minimax/manifest.json', 'scripts/private-tool.mjs', 'research/audit.html', 'README.md', 'assets/images/unrelated-research.png']) assert.equal(fs.existsSync(path.join(result.output, relative)), false, relative);
  assert.equal(fs.readFileSync(path.join(root, 'app/research-summary.html'), 'utf8'), summary);
});

test('rewrites documentation links in HTML and JavaScript copies without mutating source', () => {
  const { root } = fixture(), before = fs.readFileSync(path.join(root, 'app/replica.js'), 'utf8'), result = preparePages(root, 'public-review');
  const app = fs.readFileSync(path.join(result.output, 'app/research-summary.html'), 'utf8');
  assert.ok(app.includes(`href="${sourceBase}README.md#effect"`));
  assert.ok(app.includes(`href="${sourceBase}research/audit.html"`));
  assert.ok(app.includes('href="https://example.com/source.md"'));
  assert.ok(app.includes('src="../assets/images/understanding-atlas.png"'));
  assert.ok(fs.readFileSync(path.join(result.output, 'app/replica.js'), 'utf8').includes(`href='${sourceBase}research/physics-models.md'`));
  assert.equal(fs.readFileSync(path.join(root, 'app/replica.js'), 'utf8'), before);
});

test('rejects an existing output and traversal names without deleting content', () => {
  const { root } = fixture(); write(root, 'public/keep.txt', 'keep');
  assert.throws(() => preparePages(root), /已存在/);
  assert.equal(fs.readFileSync(path.join(root, 'public/keep.txt'), 'utf8'), 'keep');
  for (const name of ['../outside', '.public', 'app', 'public/child', 'public/../outside', 'public\\outside', path.join(root, 'absolute')]) assert.throws(() => preparePages(root, name), /发布目录/);
});

test('validation failure for missing assets or traversing document links leaves no partial output', () => {
  const missing = fixture();
  fs.renameSync(path.join(missing.root, 'assets/images/understanding-atlas.png'), path.join(missing.root, 'assets/images/not-selected.png'));
  assert.throws(() => preparePages(missing.root), /ENOENT/);
  assert.equal(fs.existsSync(path.join(missing.root, 'public')), false);
  const traversal = fixture(); write(traversal.root, 'app/research-summary.html', '<a href="../../outside.md">escape</a>');
  assert.throws(() => preparePages(traversal.root), /边界/);
  assert.equal(fs.existsSync(path.join(traversal.root, 'public')), false);
});

test('audio paths are validated as data without executing their source', () => {
  const { root } = fixture();
  write(root, 'app/narration-source.js', 'export const narrationSource=Object.freeze({"provider":"MiniMax","files":{"a":"../outside.wav"}});');
  assert.throws(() => preparePages(root), /公共音频映射/);
  assert.equal(fs.existsSync(path.join(root, 'public')), false);
  write(root, 'app/narration-source.js', 'throw new Error("must not execute"); export const narrationSource=Object.freeze({"provider":"MiniMax","files":{"a":"clip-0.wav","b":"clip-0.wav"}});');
  assert.throws(() => preparePages(root), /重复/);
  assert.equal(fs.existsSync(path.join(root, 'public')), false);
});

test('rejects linked app directories before producing public files', t => {
  const { root } = fixture(), outside = fs.mkdtempSync(path.join(os.tmpdir(), 'unified-learning-link-fixture-'));
  write(outside, 'outside.js', 'do not publish');
  try { fs.symlinkSync(outside, path.join(root, 'app/linked'), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return t.skip('Directory link creation is unavailable.'); throw error; }
  assert.throws(() => preparePages(root), /链接/);
  assert.equal(fs.existsSync(path.join(root, 'public')), false);
});
