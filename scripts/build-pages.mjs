import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPagesHome } from './pages-home.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const extensions = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.webm', '.mp3', '.ogg', '.wav', '.pdf', '.txt', '.glb']);
const optionalTextExtensions = new Set(['.md', '.csv']);

function plainPath(base, relative) {
  if (typeof relative !== 'string' || path.isAbsolute(relative) || /[\\:]/.test(relative)) throw new Error(`非法相对路径：${relative}`);
  const parts = relative.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..' || part.startsWith('.'))) throw new Error(`非法相对路径：${relative}`);
  let current = base;
  for (const part of parts) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`不能发布链接路径：${relative}`);
  }
  return current;
}

function collect(directory, relative = '', allowedExtensions = extensions) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`不能发布链接：${name}`);
    if (entry.name.startsWith('.')) return [];
    if (entry.isDirectory()) return collect(path.join(directory, entry.name), name, allowedExtensions);
    return entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()) ? [name] : [];
  });
}

export function buildPages(workspaceRoot = root, outputRelative = 'dist/pages') {
  if (!outputRelative.startsWith('dist/')) throw new Error('发布产物必须位于本仓库 dist/ 下。');
  const output = plainPath(workspaceRoot, outputRelative);
  if (fs.existsSync(output)) throw new Error(`产物目录已存在，请使用新的 --out dist/目录：${outputRelative}`);
  const registry = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'projects.json'), 'utf8'));
  const config = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'pages.config.json'), 'utf8'));
  if (config.schemaVersion !== 1 || !Array.isArray(config.projects) || !config.projects.length) throw new Error('发布配置缺少项目。');
  const selected = new Set();
  const publications = config.projects.map((entry) => {
    const project = registry.projects.find((item) => `${item.id}-${item.slug}` === entry.directory);
    if (!project || selected.has(entry.directory)) throw new Error(`项目未登记或重复：${entry.directory}`);
    selected.add(entry.directory);
    const textExtensions = entry.textExtensions === undefined ? [] : entry.textExtensions;
    if (!Array.isArray(textExtensions) || textExtensions.some((extension) => typeof extension !== 'string' || !optionalTextExtensions.has(extension)) || new Set(textExtensions).size !== textExtensions.length) throw new Error('textExtensions 必须为不重复的 .md / .csv 扩展名数组。');
    const allowedExtensions = new Set([...extensions, ...textExtensions]);
    const directory = plainPath(workspaceRoot, `projects/${entry.directory}`);
    const publicDirectory = plainPath(directory, entry.publicDirectory);
    const files = collect(publicDirectory, '', allowedExtensions).map((relative) => ({ source: plainPath(publicDirectory, relative), relative }));
    if (!files.some((file) => file.relative === 'index.html')) throw new Error(`${entry.directory} 缺少 index.html。`);
    if (!Array.isArray(entry.extraAssets)) throw new Error('extraAssets 必须为数组。');
    for (const relative of entry.extraAssets) {
      if (!relative.startsWith('assets/') || !extensions.has(path.extname(relative).toLowerCase())) throw new Error(`不允许的额外资源：${relative}`);
      const source = plainPath(directory, relative);
      if (!fs.statSync(source).isFile()) throw new Error(`额外资源不是文件：${relative}`);
      if (files.some((file) => file.relative === relative)) throw new Error(`资源重名：${relative}`);
      files.push({ source, relative });
    }
    if (project.cover && !files.some((file) => file.relative === project.cover)) throw new Error(`${entry.directory} 的封面未列入公开资源。`);
    const guidePage = entry.guidePage || 'index.html';
    plainPath(publicDirectory, guidePage);
    if (!guidePage.endsWith('.html') || !files.some((file) => file.relative === guidePage)) throw new Error(`${entry.directory} 的引导页未列入公开文件：${guidePage}`);
    let coverSize = { width: 1672, height: 941 };
    if (project.cover?.toLowerCase().endsWith('.png')) {
      const bytes = fs.readFileSync(files.find((file) => file.relative === project.cover).source);
      if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) coverSize = { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
    }
    const action = entry.action;
    if (action !== undefined) {
      if (!action || typeof action.label !== 'string' || !action.label.trim() || typeof action.path !== 'string') {
        throw new Error(entry.directory + ' 的 action 须提供文字和页面路径。');
      }
      const [page, fragment, extra] = action.path.split('#');
      plainPath(publicDirectory, page);
      if (extra !== undefined || (fragment !== undefined && !/^[a-zA-Z0-9_-]+$/.test(fragment))
          || !page.endsWith('.html') || !files.some((file) => file.relative === page)) {
        throw new Error(entry.directory + ' 的 action 未指向已发布页面：' + action.path);
      }
    }
    return { project, folder: entry.directory, files, guidePage, coverSize, action };
  });
  const home = renderPagesHome(registry, publications);
  fs.mkdirSync(output, { recursive: true });
  for (const publication of publications) {
    for (const file of publication.files) {
      const destination = path.join(output, publication.folder, file.relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(file.source, destination, fs.constants.COPYFILE_EXCL);
    }
  }
  fs.writeFileSync(path.join(output, 'index.html'), home, 'utf8');
  fs.copyFileSync(new URL('./pages-home.css', import.meta.url), path.join(output, 'hub.css'));
  fs.writeFileSync(path.join(output, '.nojekyll'), '');
  return { output, projects: publications.map((item) => item.folder), files: publications.reduce((sum, item) => sum + item.files.length, 3) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--out')) throw new Error('用法：node scripts/build-pages.mjs [--out dist/目录]');
    console.log(JSON.stringify(buildPages(root, args[1] || 'dist/pages'), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
