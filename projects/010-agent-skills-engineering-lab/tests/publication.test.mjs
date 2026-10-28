import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { buildSite, runtimeFiles, imageFiles } from '../scripts/build-site.mjs';

const fixtures = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-publication-'));
let fixtureNumber = 0;
function put(root, relative, text) {
  const target = path.join(root, ...relative.split('/'));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text);
}
function fixture({ skipApp = false } = {}) {
  const root = path.join(fixtures, String(++fixtureNumber)); fs.mkdirSync(root);
  if (!skipApp) for (const name of runtimeFiles) put(root, `app/${name}`, name.endsWith('.html') ? '<!doctype html><a href="overview.html">map</a>' : '/* runtime */');
  for (const name of imageFiles) put(root, `assets/images/${name}`, Buffer.from(`image:${name}`));
  return root;
}
const read = (root, relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const files = (root, relative = '') => fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap(entry => {
  const name = relative ? `${relative}/${entry.name}` : entry.name;
  return entry.isDirectory() ? files(root, name) : [name];
});
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

test('published root opens the overview and retains runtime paths and exact image bytes', () => {
  const root = fixture(); const result = buildSite({ projectRoot: root }); const out = path.join(root, 'dist/site');
  assert.equal(result.entry, 'app/overview.html'); assert.equal(result.files, 31);
  assert.match(read(out, 'index.html'), /content="0;url=\.\/app\/overview\.html"/);
  assert.match(read(out, 'index.html'), /25项AI工作规程/);
  for (const name of runtimeFiles) assert.ok(fs.statSync(path.join(out, 'app', name)).isFile());
  for (const name of imageFiles) assert.deepEqual(fs.readFileSync(path.join(out, 'assets/images', name)), fs.readFileSync(path.join(root, 'assets/images', name)));
});

test('literal and dynamic source links use the selected ref while image and fixed upstream URLs remain intact', () => {
  const root = fixture(); const ref = '1234567890abcdef';
  put(root, 'app/guide.js', 'const link = `<a href="../research/upstream/${escape(s.sourcePath)}">source</a>`;');
  put(root, 'app/overview.html', '<a href="../README.md#notes">README</a><a href="../research/notes.md">research</a><img src="../assets/images/skills-field-guide.png"><a href="https://github.com/addyosmani/agent-skills/blob/aeac41d4/skills/a/SKILL.md">upstream</a>');
  put(root, 'app/skill-build-data.js', 'const links = [{"href":"../skill/research-recall/SKILL.md"},{href:\'../tests/skill-recall.test.py\'},{"href":"../experiment-batch/research/experiments/a/README.md"}];');
  const out = buildSite({ projectRoot: root, ref }).output;
  const base = `https://github.com/yydshly/1025_codex_project/blob/${ref}/projects/010-agent-skills-engineering-lab/`;
  assert.ok(read(out, 'app/guide.js').includes(base + 'research/upstream/${escape(s.sourcePath)}'));
  const html = read(out, 'app/overview.html');
  assert.ok(html.includes(base + 'README.md#notes')); assert.ok(html.includes(base + 'research/notes.md'));
  assert.ok(html.includes('src="../assets/images/skills-field-guide.png"'));
  assert.ok(html.includes('https://github.com/addyosmani/agent-skills/blob/aeac41d4/skills/a/SKILL.md'));
  const data = read(out, 'app/skill-build-data.js');
  for (const relative of ['skill/research-recall/SKILL.md', 'tests/skill-recall.test.py', 'experiment-batch/research/experiments/a/README.md']) assert.ok(data.includes(base + relative));
});

test('the allowlist excludes source notes, execution logs, hidden files and build inputs', () => {
  const root = fixture();
  for (const name of ['research/private.md', 'research/skill-creation/execution.json', 'app/unlisted.html', 'app/data-build.json', 'app/.hidden', 'assets/images/extra.png']) put(root, name, 'not public');
  const out = buildSite({ projectRoot: root }).output;
  assert.deepEqual(files(out).sort(), ['index.html', ...runtimeFiles.map(name => `app/${name}`), ...imageFiles.map(name => `assets/images/${name}`)].sort());
});

test('published recall snapshot remains byte-for-byte evidence, including quoted non-link text', () => {
  const root = fixture();
  const evidence = 'globalThis.RECALL_CORPUS = {"readmeText":"<a href=\\\"../research/example.md\\\">original</a> D:/sample/root", "sha256":"original-hash"};\n';
  put(root, 'app/recall-data.js', evidence);
  const original = fs.readFileSync(path.join(root, 'app/recall-data.js')); const out = buildSite({ projectRoot: root }).output;
  assert.equal(hash(fs.readFileSync(path.join(out, 'app/recall-data.js'))), hash(original));
  assert.equal(read(root, 'app/recall-data.js'), evidence);
});

test('an existing output is rejected and its prior contents are preserved', () => {
  const root = fixture(); const out = path.join(root, 'dist/site'); fs.mkdirSync(out, { recursive: true }); put(out, 'keep.txt', 'keep');
  assert.throws(() => buildSite({ projectRoot: root }), /already exists/);
  assert.deepEqual(files(out), ['keep.txt']); assert.equal(read(out, 'keep.txt'), 'keep');
});

test('missing allowlisted inputs and unsafe output/ref fail before output creation', () => {
  const root = fixture({ skipApp: true });
  assert.throws(() => buildSite({ projectRoot: root }), /ENOENT/);
  assert.equal(fs.existsSync(path.join(root, 'dist/site')), false);
  assert.throws(() => buildSite({ projectRoot: root, outputDir: '../outside' }), /under project dist/);
  assert.throws(() => buildSite({ projectRoot: root, ref: '../main' }), /plain branch/);
  assert.throws(() => buildSite({ projectRoot: root, ref: 'main\" onclick=bad' }), /plain branch/);
});

test('input links and output ancestor junctions are rejected without following them', t => {
  const root = fixture({ skipApp: true }); const outside = fixture();
  try { fs.symlinkSync(path.join(outside, 'app'), path.join(root, 'app'), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (['EPERM', 'EACCES'].includes(error.code)) return t.skip('This environment cannot create test directory links.'); throw error; }
  assert.throws(() => buildSite({ projectRoot: root }), /links and junctions/);
  assert.equal(fs.existsSync(path.join(root, 'dist/site')), false);
  const root2 = fixture(); const outside2 = fixture();
  fs.symlinkSync(outside2, path.join(root2, 'dist'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => buildSite({ projectRoot: root2 }), /links and junctions/);
  assert.equal(fs.existsSync(path.join(outside2, 'site')), false);
});

console.log(`Publication fixtures retained: ${fixtures}`);
