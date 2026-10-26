import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const extensions = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.webm', '.mp3', '.ogg', '.wav', '.pdf', '.txt']);

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

function collect(directory, relative = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`不能发布链接：${name}`);
    if (entry.name.startsWith('.')) return [];
    if (entry.isDirectory()) return collect(path.join(directory, entry.name), name);
    return entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase()) ? [name] : [];
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
    const directory = plainPath(workspaceRoot, `projects/${entry.directory}`);
    const publicDirectory = plainPath(directory, entry.publicDirectory);
    const files = collect(publicDirectory).map((relative) => ({ source: plainPath(publicDirectory, relative), relative }));
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
    return { project, folder: entry.directory, files };
  });
  fs.mkdirSync(output, { recursive: true });
  for (const publication of publications) {
    for (const file of publication.files) {
      const destination = path.join(output, publication.folder, file.relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(file.source, destination, fs.constants.COPYFILE_EXCL);
    }
  }
  const cards = publications.map(({ project, folder }) => `<article><a href="./${escape(folder)}/">${project.cover ? `<img src="./${escape(folder)}/${escape(project.cover)}" alt="${escape(project.name)}引导图" width="1672" height="941">` : ''}<div><small>${escape(project.id)} · 研究与实践档案</small><h2>${escape(project.name)}</h2><p>${escape(project.summary)}</p><b>查看网页 →</b></div></a></article>`).join('');
  fs.writeFileSync(path.join(output, 'index.html'), `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>研究与实践档案｜GitHub 研究总库</title><meta name="description" content="日常研究、思考与实践的网页入口，保留想法、进展、验证问题和取舍。"><style>*{box-sizing:border-box}body{margin:0;background:#f7f8f4;color:#263a33;font:16px/1.8 system-ui,'Microsoft YaHei',sans-serif}main{max-width:1080px;margin:auto;padding:55px 24px}header{margin-bottom:35px}small{font-size:12px;color:#687b53;letter-spacing:1px}h1{font-size:36px;margin:9px 0 15px}header p{color:#637157;max-width:740px}article{background:white;border:1px solid #dfe5d6;border-radius:10px;overflow:hidden;margin:24px 0}a{color:inherit;text-decoration:none}article img{display:block;width:100%;height:auto}article div{padding:24px 28px}h2{font-size:25px;margin:8px 0}article p{color:#637157}b{display:inline-block;margin-top:12px;color:#536d38;font-size:14px}a:focus-visible{outline:3px solid #7d9857;outline-offset:4px}footer{font-size:12px;color:#77866b;margin-top:35px}@media(max-width:540px){main{padding:30px 18px}h1{font-size:28px}article div{padding:18px}h2{font-size:22px}}</style></head><body><main><header><small>REPO STUDY LAB</small><h1>研究与实践档案</h1><p>把日常发现、思考与尝试留下来：看见原始想法、阶段成果和仍待验证的问题，再决定如何继续。</p></header>${cards}<footer><a href="https://github.com/yydshly/1025_codex_project">查看研究总库源码 ↗</a> · 本入口仅列出已纳入网页发布的子项目。</footer></main></body></html>`, 'utf8');
  fs.writeFileSync(path.join(output, '.nojekyll'), '');
  return { output, projects: publications.map((item) => item.folder), files: publications.reduce((sum, item) => sum + item.files.length, 2) };
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
