import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCapabilityMap, validateOverview } from './build-capability-map.mjs';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, 'app', name), 'utf8'));
const catalog = read('catalog.json');
const implementation = read('implementation.json');
const guide = read('guide.json');
const overview = read('overview.json');
if (new Set([catalog.commit, implementation.commit, guide.commit, overview.commit]).size !== 1) throw new Error('Research source versions must match.');
const annotations = new Map(implementation.scenes.map((scene) => [scene.id, scene]));
const prompts = {};
for (const scene of catalog.templates) {
  const entry = annotations.get(scene.id);
  if (!entry || !scene.verification.notes.includes(entry.evidence)) throw new Error(`Missing or mismatched evidence: ${scene.id}`);
  if (!guide.routes[entry.route] || !guide.sceneNotes[scene.id]) throw new Error(`Missing preparation guidance: ${scene.id}`);
  prompts[scene.id] = fs.readFileSync(path.join(root, 'research/upstream/templates', scene.id, 'prompt.md'), 'utf8');
}
if (catalog.templates.length !== annotations.size) throw new Error('Catalog and implementation coverage differ.');
validateOverview(overview, catalog, implementation);
const diagram = buildCapabilityMap(root, overview, catalog, implementation);
const data = { catalog, implementation, guide, overview, prompts };
const serialized = JSON.stringify(data).replace(/</g, '\\u003c');
fs.writeFileSync(path.join(root, 'app/data.js'), `// Generated from the pinned catalog, authored annotations and original prompts.\nwindow.BAOCUT_RESEARCH_DATA = ${serialized};\n`, 'utf8');
const lines = ['# BaoCut 修改与复现建议', '', '本研究按已记录的制作路径整理，尚未本机试做；不是新增官方验收结果。耗时、费用与成功率均未实测。', '', '固定提交：`' + catalog.commit + '`。原始做法、提示与证据见 implementation.md 和 upstream/templates。', '', '## 开始之前', ''];
for (const item of guide.commonPreparation) lines.push(`- **${item.title}**：${item.text}`);
for (const route of implementation.routes) {
  const profile = guide.routes[route.id];
  lines.push('', `## ${route.title}`, '', '### 可以改变什么', '', ...profile.canChange.map((text) => `- ${text}`), '', profile.whereToChange, '', '### 准备材料', '', ...profile.prepare.map((text) => `- ${text}`), '', '### 先做一个小样', '', ...profile.tryFirst.map((text, index) => `${index + 1}. ${text}`), '', '### 检查点', '', ...profile.check.map((text) => `- ${text}`), '', profile.effort);
}
lines.push('', '## 逐条先注意什么', '');
for (const scene of catalog.templates) lines.push(`### ${scene.title}`, '', guide.sceneNotes[scene.id], '');
fs.writeFileSync(path.join(root, 'research/guide.md'), lines.join('\n').trimEnd() + '\n', 'utf8');
console.log(`Built offline data: ${catalog.templates.length} scenes, ${Object.keys(prompts).length} prompts, ${Buffer.byteLength(serialized)} bytes.`);
console.log(`Built capability diagram: ${diagram.width} × ${diagram.height}, ${diagram.bytes} bytes, 5 purpose groups and 3 production routes.`);
