import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceBase = 'https://github.com/yydshly/1025_codex_project/blob/main/projects/003-unified-learning-design/';
const staticExtensions = new Set(['.html', '.css', '.js', '.svg', '.txt', '.woff2']);
const extraAssets = [
  'assets/images/future-layout-concepts.png',
  'assets/images/optimized-energy-cue.png',
  'assets/images/understanding-atlas.png',
  'assets/images/understanding-atlas.svg',
  'assets/images/reading-v4.4/01-before-reading.png',
  'assets/images/reading-v4.4/07-final-desktop.png',
];

function statOrNull(target) {
  try { return fs.lstatSync(target); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

function sourcePath(root, relative) {
  if (typeof relative !== 'string' || path.isAbsolute(relative) || /[\\:\0]/.test(relative)) throw new Error('非法发布源路径。');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..' || part.startsWith('.'))) throw new Error('发布源包含隐藏或跨界路径。');
  let target = root;
  for (const part of parts) {
    target = path.join(target, part);
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink()) throw new Error('不能发布链接路径。');
  }
  const real = fs.realpathSync(target), difference = path.relative(fs.realpathSync(root), real);
  if (difference.startsWith('..') || path.isAbsolute(difference)) throw new Error('发布源越过项目边界。');
  return target;
}

function collectApp(root) {
  const walk = (directory, relative = '') => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw new Error('不能发布 app 中的链接。');
    if (entry.name.startsWith('.')) return [];
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    // Audio has a separate manifest-based allowlist below, including no old WAVs.
    if (name === 'voice') return [];
    if (entry.isDirectory()) return walk(path.join(directory, entry.name), name);
    return entry.isFile() && staticExtensions.has(path.extname(entry.name).toLowerCase()) ? [`app/${name}`] : [];
  });
  return walk(sourcePath(root, 'app'));
}

function currentVoiceFiles(root) {
  const text = fs.readFileSync(sourcePath(root, 'app/narration-source.js'), 'utf8');
  const match = text.match(/export\s+const\s+narrationSource\s*=\s*Object\.freeze\(\s*(\{[\s\S]*?\})\s*\);/);
  if (!match) throw new Error('缺少可解析的公共音频映射。');
  let metadata;
  try { metadata = JSON.parse(match[1]); }
  catch { throw new Error('公共音频映射不是有效 JSON。'); }
  if (metadata.provider !== 'MiniMax' || !metadata.files || typeof metadata.files !== 'object' || Array.isArray(metadata.files)) throw new Error('公共音频映射格式不正确。');
  const names = Object.values(metadata.files);
  if (!names.length || new Set(names).size !== names.length || names.some(name => typeof name !== 'string' || !/^[a-z0-9][a-z0-9._-]*\.wav$/i.test(name))) throw new Error('公共音频映射包含无效或重复文件。');
  return names.map(name => `app/voice/minimax/${name}`);
}

function localTarget(target, sourceRelative) {
  if (!target || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) return null;
  const match = target.match(/^([^?#]*)([?#][\s\S]*)?$/);
  let pathname;
  try { pathname = decodeURIComponent(match[1]); }
  catch { throw new Error('无效的本地链接编码。'); }
  if (/[\\\0]/.test(pathname)) throw new Error('本地链接包含非法路径。');
  const normalized = path.posix.normalize(pathname.startsWith('/') ? pathname.slice(1) : path.posix.join(path.posix.dirname(sourceRelative), pathname));
  if (normalized === '..' || normalized.startsWith('../') || normalized.split('/').some(part => part.startsWith('.'))) throw new Error('本地链接越过发布边界。');
  return { relative: normalized, suffix: match[2] || '' };
}

function mapAttributes(text, transform) {
  return text.replace(/\b(href|src|data-zoom)\s*=\s*(["'])([^"']*)\2/gi, (original, attribute, quote, target) => {
    const replacement = transform(target);
    return replacement === null ? original : `${attribute}=${quote}${replacement}${quote}`;
  });
}

function rewriteDocuments(text, sourceRelative, root) {
  return mapAttributes(text, target => {
    const resolved = localTarget(target, sourceRelative);
    if (!resolved || !(/\.md$/i.test(resolved.relative) || /^research\/.*\.html$/i.test(resolved.relative))) return null;
    const file = sourcePath(root, resolved.relative);
    if (!fs.statSync(file).isFile()) throw new Error('文档链接未指向文件。');
    return sourceBase + resolved.relative.split('/').map(encodeURIComponent).join('/') + resolved.suffix;
  });
}

function rootSummary(text) {
  return mapAttributes(text, target => {
    const resolved = localTarget(target, 'app/research-summary.html');
    return resolved ? `./${resolved.relative}${resolved.suffix}` : null;
  });
}

export function preparePages(projectRoot = defaultRoot, outputName = 'public') {
  const root = path.resolve(projectRoot);
  const rootStat = fs.lstatSync(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error('项目目录不能是链接或普通文件。');
  if (typeof outputName !== 'string' || !/^public(?:-[a-z0-9][a-z0-9-]*)?$/.test(outputName)) throw new Error('发布目录必须是 public 或 public-小写名称。');
  const output = path.join(root, outputName);
  if (statOrNull(output)) throw new Error('发布目录已存在，请选择新的 --out public-目录。');
  const appFiles = collectApp(root), voices = currentVoiceFiles(root);
  if (!appFiles.includes('app/index.html') || !appFiles.includes('app/research-summary.html')) throw new Error('缺少样章或研究总览入口。');
  const selected = [...appFiles, ...voices, ...extraAssets];
  if (new Set(selected).size !== selected.length) throw new Error('公开文件路径重复。');
  // Complete every read and rewrite before creating output; validation failure
  // never leaves a half-prepared directory that the next run could mistake for a build.
  const files = selected.map(relative => {
    const source = sourcePath(root, relative);
    if (!fs.statSync(source).isFile()) throw new Error('公开资源不是普通文件。');
    const data = /\.(?:html|js)$/i.test(relative) ? Buffer.from(rewriteDocuments(fs.readFileSync(source, 'utf8'), relative, root)) : fs.readFileSync(source);
    return { relative, data };
  });
  const summary = files.find(file => file.relative === 'app/research-summary.html');
  files.push({ relative: 'index.html', data: Buffer.from(rootSummary(summary.data.toString('utf8'))) });
  fs.mkdirSync(output);
  for (const file of files) {
    const destination = path.join(output, file.relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, file.data, { flag: 'wx' });
  }
  return { output, files: files.length, voiceFiles: voices.length, entry: 'index.html', sample: 'app/index.html' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--out')) throw new Error('用法：node scripts/prepare-pages.mjs [--out public-review]');
    console.log(JSON.stringify(preparePages(defaultRoot, args[1] || 'public'), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
