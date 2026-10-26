import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildPages } from './build-pages.mjs';

const source = fileURLToPath(new URL('../', import.meta.url));
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'early-directions-pages-'));
  for (const file of ['scripts/projects.mjs', 'README.md', 'projects/README.md']) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.copyFileSync(path.join(source, file), path.join(root, file));
  }
  fs.cpSync(path.join(source, 'templates'), path.join(root, 'templates'), { recursive: true });
  fs.writeFileSync(path.join(root, 'projects.json'), JSON.stringify({ schemaVersion: 1, nextId: 1, projects: [] }));
  const run = (...args) => {
    const result = spawnSync(process.execPath, ['scripts/projects.mjs', ...args], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  };
  run('update');
  for (const slug of ['first', 'second']) run('new', '--slug', slug, '--name', slug === 'first' ? '早期 <思考>' : '未发布研究', '--summary', '保留原始想法与验证问题', '--source', 'https://github.com/yydshly/1025_codex_project');
  run('check');
  const project = path.join(root, 'projects/001-first');
  fs.writeFileSync(path.join(project, 'app/index.html'), '<img src="./assets/images/map.svg"><script src="./main.js"></script>');
  fs.writeFileSync(path.join(project, 'app/main.js'), 'console.log("public");');
  fs.writeFileSync(path.join(project, 'app/.env'), 'PRIVATE_FIXTURE=true');
  fs.writeFileSync(path.join(project, 'assets/images/map.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  fs.writeFileSync(path.join(root, 'pages.config.json'), JSON.stringify({ schemaVersion: 1, projects: [{ directory: '001-first', publicDirectory: 'app', extraAssets: ['assets/images/map.svg'] }] }));
  return { root, run };
}

test('隔离目录中创建递增编号、同步索引，只发布选定项目和资源', () => {
  const { root } = fixture();
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'projects.json'), 'utf8'));
  assert.deepEqual(registry.projects.map((project) => project.id), ['001', '002']);
  assert.equal(registry.nextId, 3);
  const result = buildPages(root);
  assert.deepEqual(result.projects, ['001-first']);
  const home = fs.readFileSync(path.join(result.output, 'index.html'), 'utf8');
  assert.match(home, /早期 &lt;思考&gt;/);
  assert.doesNotMatch(home, /未发布研究/);
  assert.equal(fs.readFileSync(path.join(result.output, '001-first/assets/images/map.svg'), 'utf8').startsWith('<svg'), true);
  assert.equal(fs.existsSync(path.join(result.output, '001-first/.env')), false);
  assert.equal(fs.existsSync(path.join(result.output, '001-first/research')), false);
  assert.equal(fs.existsSync(path.join(result.output, '002-second')), false);
  assert.throws(() => buildPages(root), /产物目录已存在/);
});

test('拒绝跳出资源目录的路径，不产生公开产物', () => {
  const { root } = fixture();
  fs.writeFileSync(path.join(root, 'pages.config.json'), JSON.stringify({ schemaVersion: 1, projects: [{ directory: '001-first', publicDirectory: 'app', extraAssets: ['assets/../../projects.json'] }] }));
  assert.throws(() => buildPages(root), /非法相对路径|不允许的额外资源/);
  assert.equal(fs.existsSync(path.join(root, 'dist/pages')), false);
  assert.throws(() => buildPages(root, '../outside'), /dist/);
});

test('构建后的嵌套演示、视频和完整引导图按声明发布，引导图进入图解页', () => {
  const { root, run } = fixture();
  const project = path.join(root, 'projects/001-first');
  fs.mkdirSync(path.join(project, 'dist/original'), { recursive: true });
  fs.mkdirSync(path.join(project, 'dist/media'), { recursive: true });
  fs.writeFileSync(path.join(project, 'dist/index.html'), '<a href="./map.html">图解</a>');
  fs.writeFileSync(path.join(project, 'dist/map.html'), '<a href="./original/#lotus">莲花</a>');
  fs.writeFileSync(path.join(project, 'dist/original/index.html'), '<h1>独立重写</h1>');
  fs.writeFileSync(path.join(project, 'dist/media/scene.mp4'), Buffer.from('fixture-video'));
  fs.writeFileSync(path.join(project, 'research/not-public.json'), '{"fixture":"research-only"}');
  fs.writeFileSync(path.join(project, 'assets/images/guide.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', 'base64'));
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'projects.json'), 'utf8'));
  registry.projects[0].cover = 'assets/images/guide.png';
  fs.writeFileSync(path.join(root, 'projects.json'), JSON.stringify(registry));
  run('update');
  run('check');
  fs.writeFileSync(path.join(root, 'pages.config.json'), JSON.stringify({ schemaVersion: 1, projects: [{ directory: '001-first', publicDirectory: 'dist', extraAssets: ['assets/images/guide.png'], guidePage: 'map.html' }] }));
  const result = buildPages(root);
  const home = fs.readFileSync(path.join(result.output, 'index.html'), 'utf8');
  assert.match(home, /class="guide-image" href="\.\/001-first\/map.html"/);
  assert.match(home, /放大阅读引导图/);
  assert.match(home, /width="1" height="1"/);
  assert.equal(fs.readFileSync(path.join(result.output, '001-first/original/index.html'), 'utf8'), '<h1>独立重写</h1>');
  assert.equal(fs.readFileSync(path.join(result.output, '001-first/media/scene.mp4'), 'utf8'), 'fixture-video');
  assert.equal(fs.existsSync(path.join(result.output, '001-first/research')), false);
  assert.equal(fs.existsSync(path.join(result.output, '002-second')), false);
});

test('引导页只能指向当前项目已公开的HTML文件', () => {
  const { root } = fixture();
  const config = { schemaVersion: 1, projects: [{ directory: '001-first', publicDirectory: 'app', extraAssets: [], guidePage: '../private.html' }] };
  fs.writeFileSync(path.join(root, 'pages.config.json'), JSON.stringify(config));
  assert.throws(() => buildPages(root), /非法相对路径/);
  config.projects[0].guidePage = 'missing.html';
  fs.writeFileSync(path.join(root, 'pages.config.json'), JSON.stringify(config));
  assert.throws(() => buildPages(root), /引导页未列入公开文件/);
  assert.equal(fs.existsSync(path.join(root, 'dist/pages')), false);
});
