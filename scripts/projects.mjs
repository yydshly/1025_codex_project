import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const registryPath = path.join(root, 'projects.json');
const readmePath = path.join(root, 'README.md');
const startMarker = '<!-- PROJECTS:START -->';
const endMarker = '<!-- PROJECTS:END -->';
const statuses = {
  planned: '待研究',
  researching: '研究中',
  building: '实践中',
  completed: '已总结',
  archived: '已归档',
};
const slugPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const folderOf = (project) => `${project.id}-${project.slug}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function singleLine(value, label, max = 240) {
  assert(typeof value === 'string' && value.trim().length > 0, `${label} 不能为空。`);
  assert(value === value.trim() && value.length <= max && !/[\x00-\x1f\x7f]/.test(value), `${label} 必须是无首尾空格的单行文本，最多 ${max} 个字符。`);
}

function httpsUrl(value, label) {
  singleLine(value, label, 2048);
  const url = new URL(value);
  assert(url.protocol === 'https:' && !url.username && !url.password, `${label} 必须是无凭据的 HTTPS URL。`);
  return url;
}

function validateSource(value) {
  const url = httpsUrl(value, 'source');
  assert(url.hostname === 'github.com' && !url.port && !url.search && !url.hash && /^\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/?$/.test(url.pathname), 'source 必须指向一个 GitHub 仓库，例如 https://github.com/owner/repo。');
}

// Reject linked paths as well as traversal; generated files stay in this repository.
function plainPath(relativePath) {
  assert(!path.isAbsolute(relativePath), `路径必须相对于仓库：${relativePath}`);
  const parts = relativePath.split(/[\\/]/);
  assert(parts.every((part) => part && part !== '.' && part !== '..'), `不允许路径跳转：${relativePath}`);
  let current = root;
  for (const part of parts) {
    current = path.join(current, part);
    assert(fs.existsSync(current), `缺少路径：${relativePath}`);
    assert(!fs.lstatSync(current).isSymbolicLink(), `不允许链接路径：${relativePath}`);
  }
  return current;
}

function requireFile(relativePath) {
  assert(fs.statSync(plainPath(relativePath)).isFile(), `应为文件：${relativePath}`);
}

function loadRegistry() {
  requireFile('projects.json');
  const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  assert(data.schemaVersion === 1 && Array.isArray(data.projects), 'projects.json 必须使用 schemaVersion: 1 和 projects 数组。');
  assert(Number.isInteger(data.nextId) && data.nextId >= 1 && data.nextId <= 1000, 'nextId 必须是 1–1000 的整数。');
  const ids = new Set();
  const slugs = new Set();
  const registered = new Set();
  let maxId = 0;
  for (const project of data.projects) {
    assert(project && typeof project === 'object', '项目登记必须是对象。');
    assert(typeof project.id === 'string' && /^(?!000)\d{3}$/.test(project.id), '项目 id 必须是 001–999 的三位字符串。');
    assert(!ids.has(project.id), `重复编号：${project.id}`);
    assert(typeof project.slug === 'string' && slugPattern.test(project.slug) && project.slug.length <= 64, `${project.id} 的 slug 格式不正确。`);
    assert(!slugs.has(project.slug), `重复短名：${project.slug}`);
    singleLine(project.name, `${project.id} name`, 120);
    singleLine(project.summary, `${project.id} summary`);
    validateSource(project.source);
    assert(Object.hasOwn(statuses, project.status), `${project.id} 的 status 无效。`);
    assert(Array.isArray(project.tags), `${project.id} 的 tags 必须是数组。`);
    for (const tag of project.tags) singleLine(tag, 'tag', 40);
    assert(new Set(project.tags).size === project.tags.length, `${project.id} 的标签重复。`);
    assert(typeof project.cover === 'string' && typeof project.demoUrl === 'string', `${project.id} 的 cover 和 demoUrl 必须是字符串，可留空。`);
    if (project.demoUrl) httpsUrl(project.demoUrl, 'demoUrl');
    assert(typeof project.createdAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(project.createdAt), `${project.id} 的 createdAt 应为 YYYY-MM-DD。`);
    const date = new Date(`${project.createdAt}T00:00:00Z`);
    assert(!Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === project.createdAt, `${project.id} 的收录日期无效。`);
    const directory = `projects/${folderOf(project)}`;
    requireFile(`${directory}/README.md`);
    requireFile(`${directory}/research/notes.md`);
    assert(fs.statSync(plainPath(`${directory}/app`)).isDirectory(), `缺少 ${directory}/app 目录。`);
    assert(fs.statSync(plainPath(`${directory}/assets/images`)).isDirectory(), `缺少 ${directory}/assets/images 目录。`);
    if (project.cover) {
      assert(/^assets\/images\/[A-Za-z0-9_./-]+\.(png|jpe?g|webp|gif|svg)$/i.test(project.cover), `${project.id} 的 cover 必须是 assets/images/ 下无空格的图片路径。`);
      requireFile(`${directory}/${project.cover}`);
    }
    ids.add(project.id);
    slugs.add(project.slug);
    registered.add(folderOf(project));
    maxId = Math.max(maxId, Number(project.id));
  }
  assert(data.nextId > maxId, 'nextId 必须大于已分配的所有编号，不能回退或复用。');
  for (const entry of fs.readdirSync(plainPath('projects'), { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), `projects 下不允许链接：${entry.name}`);
    if (entry.isDirectory()) assert(registered.has(entry.name), `未登记的项目目录：projects/${entry.name}`);
  }
  return data;
}

function markdown(value) {
  return value.replace(/[&\\`*_{}\[\]<>|!#+=().-]/g, (character) => `&#${character.codePointAt(0)};`);
}

const demoHref = (value) => httpsUrl(value, 'demoUrl').href.replaceAll('|', '%7C');

function renderIndex(data) {
  const projects = [...data.projects].sort((a, b) => Number(a.id) - Number(b.id));
  const lines = [
    '## 项目索引',
    '',
    `已收录 **${projects.length}** 个项目 · 按固定编号升序排列`,
    '',
    '| 编号 | 项目 | 简介 / 研究重点 | 阶段 | 演示 |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const project of projects) {
    const link = `projects/${folderOf(project)}/README.md`;
    const demo = project.demoUrl ? `[在线访问](<${demoHref(project.demoUrl)}>)` : '—';
    lines.push(`| ${project.id} | [${markdown(project.name)}](${link}) | ${markdown(project.summary)} | ${statuses[project.status]} | ${demo} |`);
  }
  if (!projects.length) lines.push('| — | 暂无项目 | 添加第一个真实研究项目后，这里会自动生成索引。 | — | — |');
  lines.push('', '## 项目速览', '');
  if (!projects.length) lines.push('等待第一个研究项目。添加项目并设置封面后，这里会展示项目图片、摘要和入口。');
  for (const project of projects) {
    const directory = `projects/${folderOf(project)}`;
    lines.push(`### ${project.id} · ${markdown(project.name)}`, '');
    if (project.cover) lines.push(`![${markdown(project.name)} 项目配图](${directory}/${project.cover})`, '');
    lines.push(markdown(project.summary), '');
    const links = [`[研究说明](${directory}/README.md)`, `[原始仓库](${project.source})`];
    if (project.demoUrl) links.push(`[在线演示](<${demoHref(project.demoUrl)}>)`);
    lines.push(links.join(' · '), '');
    lines.push(`**阶段：** ${statuses[project.status]}${project.tags.length ? ` · **标签：** ${project.tags.map(markdown).join(' / ')}` : ''}`, '');
  }
  return lines.join('\n').trimEnd();
}

function nextReadme(data) {
  requireFile('README.md');
  const current = fs.readFileSync(readmePath, 'utf8').replace(/\r\n/g, '\n');
  assert(current.split(startMarker).length === 2 && current.split(endMarker).length === 2, 'README 必须恰好包含一对 PROJECTS 标记。');
  const start = current.indexOf(startMarker) + startMarker.length;
  const end = current.indexOf(endMarker);
  assert(start < end, 'README 的 PROJECTS 标记顺序错误。');
  return current.slice(0, start) + '\n\n' + renderIndex(data) + '\n\n' + current.slice(end);
}

function syncIndex(data) {
  fs.writeFileSync(readmePath, nextReadme(data), 'utf8');
}

function check(data) {
  const current = fs.readFileSync(readmePath, 'utf8').replace(/\r\n/g, '\n');
  assert(current === nextReadme(data), 'README 索引未同步，请运行 npm run index:update。');
}

function parseOptions(args) {
  const options = {};
  const allowed = new Set(['slug', 'name', 'source', 'summary', 'tags']);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].startsWith('--') ? args[i].slice(2) : '';
    assert(allowed.has(key) && args[i + 1] !== undefined && !args[i + 1].startsWith('--'), `参数无效：${args[i]}。参数格式为 --name "值"。`);
    assert(!Object.hasOwn(options, key), `参数重复：--${key}`);
    options[key] = args[i + 1];
  }
  for (const key of ['slug', 'name', 'source', 'summary']) singleLine(options[key], `--${key}`, key === 'source' ? 2048 : key === 'name' ? 120 : 240);
  assert(slugPattern.test(options.slug) && options.slug.length <= 64, '--slug 仅可使用小写字母、数字和单个连字符，以字母开头，最多 64 个字符。');
  validateSource(options.source);
  options.tags = options.tags === undefined ? [] : options.tags.split(',').map((tag) => tag.trim());
  for (const tag of options.tags) singleLine(tag, '--tags 中的标签', 40);
  assert(new Set(options.tags).size === options.tags.length, '--tags 中不能有重复标签。');
  return options;
}

function templateFiles(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    assert(!entry.isSymbolicLink(), `模板中不允许链接：${entry.name}`);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? templateFiles(path.join(directory, entry.name), relative) : [relative];
  });
}

function createProject(data, args) {
  const options = parseOptions(args);
  check(data);
  assert(data.nextId <= 999, '三位编号已用完，请先升级编号规则。');
  assert(!data.projects.some((project) => project.slug === options.slug), `已存在短名：${options.slug}`);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const datePart = (type) => parts.find((part) => part.type === type).value;
  const project = {
    id: String(data.nextId).padStart(3, '0'),
    slug: options.slug,
    name: options.name,
    summary: options.summary,
    source: options.source.replace(/\/$/, '').replace(/\.git$/, ''),
    status: 'planned',
    tags: options.tags,
    cover: '',
    demoUrl: '',
    createdAt: `${datePart('year')}-${datePart('month')}-${datePart('day')}`,
  };
  const destination = path.join(root, 'projects', folderOf(project));
  assert(!fs.existsSync(destination), `目录已存在，不覆盖：${destination}`);
  const template = plainPath('templates/project');
  const values = { ID: project.id, NAME: markdown(project.name), SUMMARY: markdown(project.summary), SOURCE: project.source, DATE: project.createdAt };
  const files = templateFiles(template).map((relative) => ({
    relative,
    content: fs.readFileSync(path.join(template, relative), 'utf8').replace(/\{\{(ID|NAME|SUMMARY|SOURCE|DATE)\}\}/g, (_, key) => values[key]),
  }));
  // Read and validate all inputs before creating anything; never overwrite an existing project.
  fs.mkdirSync(destination);
  for (const file of files) {
    const target = path.join(destination, file.relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.content, { encoding: 'utf8', flag: 'wx' });
  }
  data.projects.push(project);
  data.nextId += 1;
  fs.writeFileSync(registryPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  syncIndex(loadRegistry());
  console.log(`已创建 projects/${folderOf(project)}/，总索引已更新。`);
}

try {
  const [command, ...args] = process.argv.slice(2);
  assert(['new', 'update', 'check'].includes(command), '用法：node scripts/projects.mjs <new|update|check> [参数]');
  assert(command === 'new' || args.length === 0, `${command} 不接受额外参数。`);
  const data = loadRegistry();
  if (command === 'new') createProject(data, args);
  if (command === 'update') {
    syncIndex(data);
    console.log('README 项目索引已更新。');
  }
  if (command === 'check') {
    check(data);
    console.log(`校验通过：${data.projects.length} 个项目，编号、目录、配图与 README 索引一致。`);
  }
} catch (error) {
  console.error(`错误：${error.message}`);
  process.exitCode = 1;
}
