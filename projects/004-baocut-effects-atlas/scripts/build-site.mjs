import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const output = path.join(root, 'dist/site');
const prepared = spawnSync(process.execPath, ['scripts/build-data.mjs'], { cwd: root, encoding: 'utf8' });
if (prepared.status !== 0) throw new Error(prepared.stderr || prepared.stdout || 'Research data build failed.');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const catalog = JSON.parse(read('app/catalog.json'));
const repo = 'https://github.com/yydshly/1025_codex_project/blob/main/projects/004-baocut-effects-atlas/';
const upstream = `https://github.com/JimLiu/baocut/blob/${catalog.commit}/templates/`;
const files = new Map();
const assertPlain = (base, relative) => {
  if (path.isAbsolute(relative) || /[\\:]/.test(relative) || relative.split('/').some((part) => !part || part === '.' || part === '..' || part.startsWith('.'))) throw new Error(`Invalid public path: ${relative}`);
  let current = base;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Linked path rejected: ${relative}`);
  }
  return current;
};
const addFile = (relative, content) => {
  assertPlain(output, relative);
  if (files.has(relative)) throw new Error(`Duplicate public file: ${relative}`);
  files.set(relative, content);
};
const publicMediaPath = (source) => {
  if (!source.startsWith('../assets/')) throw new Error(`Unexpected media path: ${source}`);
  const relative = source.slice(3);
  const original = assertPlain(root, relative);
  if (!files.has(relative)) addFile(relative, fs.readFileSync(original));
  return `./${relative}`;
};
const context = { window: {} };
vm.runInNewContext(read('app/data.js'), context);
const data = context.window.BAOCUT_RESEARCH_DATA;
for (const scene of data.catalog.templates) {
  if (scene.localCover) scene.localCover = publicMediaPath(scene.localCover);
  if (scene.localPreview) scene.localPreview = publicMediaPath(scene.localPreview);
}
for (const name of ['capability-map.png', 'capability-map.svg']) {
  const relative = `assets/images/${name}`;
  addFile(relative, fs.readFileSync(assertPlain(root, relative)));
}
addFile('assets/baocut-LICENSE.txt', fs.readFileSync(assertPlain(root, 'research/upstream/LICENSE.txt')));
addFile('assets/NOTICE.txt', fs.readFileSync(assertPlain(root, 'NOTICE.md')));
for (const entry of fs.readdirSync(path.join(root, 'app'), { withFileTypes: true })) {
  if (entry.isSymbolicLink()) throw new Error(`Linked app file rejected: ${entry.name}`);
  if (!entry.isFile() || !/\.(html|css|js|json)$/.test(entry.name)) continue;
  let content;
  if (entry.name === 'data.js') content = `// Public bundle: media URLs adjusted; original prompts preserved.\nwindow.BAOCUT_RESEARCH_DATA = ${JSON.stringify(data).replace(/</g, '\\u003c')};\n`;
  else if (entry.name === 'catalog.json') content = JSON.stringify(data.catalog, null, 2) + '\n';
  else content = read(`app/${entry.name}`).replaceAll('../assets/', './assets/').replaceAll('../research/upstream/templates/', upstream).replaceAll('../README.md', `${repo}README.md`);
  addFile(entry.name, content);
}
for (const [id, prompt] of Object.entries(data.prompts)) {
  if (prompt !== read(`research/upstream/templates/${id}/prompt.md`)) throw new Error(`Original prompt changed: ${id}`);
}
const walk = (directory, prefix = '') => !fs.existsSync(directory) ? [] : fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
  if (entry.isSymbolicLink()) throw new Error(`Linked output rejected: ${relative}`);
  return entry.isDirectory() ? walk(path.join(directory, entry.name), relative) : [relative];
});
assertPlain(root, 'dist/site');
for (const relative of walk(output)) if (!files.has(relative)) throw new Error(`Unexpected existing output: ${relative}; choose a fresh checkout instead of removing files automatically.`);
const html = String(files.get('index.html'));
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const href = match[1].split(/[?#]/)[0];
  if (/^https?:/.test(href)) continue;
  const relative = href.replace(/^\.\//, '');
  if (!files.has(relative)) throw new Error(`Broken public entry link: ${href}`);
}
for (const [relative, content] of files) {
  const target = assertPlain(output, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}
console.log(`Public BaoCut site prepared: ${files.size} files; 24 scenes / 20 preview clips; original prompts preserved.`);
console.log('Output: dist/site; research notes, build tools and local verification files are excluded.');
