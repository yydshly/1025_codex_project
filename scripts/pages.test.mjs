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
