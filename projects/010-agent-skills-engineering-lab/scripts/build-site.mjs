import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ownRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectDirectory = '010-agent-skills-engineering-lab';
export const runtimeFiles = Object.freeze([
  'index.html', 'overview.html', 'overview-poster.html', 'scenarios.html', 'real-case.html', 'recall.html',
  'guide.css', 'overview.css', 'scenarios.css', 'real-case.css', 'recall.css', 'skill-build.css',
  'catalog.js', 'guide.js', 'overview.js', 'overview-data.js', 'scenarios.js', 'scenarios-data.js',
  'skill-build.js', 'skill-build-data.js', 'real-case.js', 'real-case-data.js', 'real-case-evidence.js',
  'recall-core.js', 'recall-data.js', 'recall-ui.js'
]);
export const imageFiles = Object.freeze([
  'skills-field-guide.png', 'skills-field-guide.svg', 'skills-overview.png', 'value-and-use.png'
]);

const within = (base, target) => target.startsWith(base + path.sep);
const exists = filename => {
  try { return fs.lstatSync(filename); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
};
function rejectLinkedComponents(root, target) {
  if (target !== root && !within(root, target)) throw new Error('Path escapes the project.');
  let current = root;
  const inspect = filename => { const stat = exists(filename); if (stat?.isSymbolicLink()) throw new Error('Symbolic links and junctions cannot be published.'); return stat; };
  inspect(current);
  for (const part of path.relative(root, target).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    inspect(current);
  }
}
function validateRef(ref) {
  if (typeof ref !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,199}$/.test(ref) || ref.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error('Use a plain branch, tag or commit ref.');
  }
}

// Rewrite actual link values, not prose or source snapshots. Template expressions
// in a href remain expressions after their static prefix becomes absolute.
export function rewriteSourceLinks(text, ref = 'main') {
  validateRef(ref);
  const base = `https://github.com/yydshly/1025_codex_project/blob/${encodeURIComponent(ref)}/projects/${projectDirectory}/`;
  const rewrite = value => {
    if (!value.startsWith('../')) return value;
    const relative = value.slice(3);
    return /^(?:research|skill|tests|experiment-batch)\//.test(relative) || /^README\.md(?:[?#]|$)/.test(relative) ? base + relative : value;
  };
  return text
    .replace(/(\bhref\s*=\s*)(["'])(.*?)\2/g, (_, before, quote, value) => before + quote + rewrite(value) + quote)
    .replace(/((?:"href"|'href'|\bhref)\s*:\s*)(["'])(.*?)\2/g, (_, before, quote, value) => before + quote + rewrite(value) + quote);
}

const description = 'Agent Skills将需求、规格、实现、验证和交付经验写成25项AI工作规程。这里按使用场景解释能力、步骤、产物和协作，帮助我们按真实需求选用，并学习用约束与证据控制落地。';
const entry = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent Skills · 25项能力与使用地图</title><meta name="description" content="${description}"><meta http-equiv="refresh" content="0;url=./app/overview.html"></head><body><main><h1>25项Skill：按真实需求选择工程方法</h1><p>${description}</p><p>覆盖25项用途、场景、步骤、交付检查与配合；逐项完整实测仍待实际需求验证。</p><p><a href="./app/overview.html">打开能力与使用地图 →</a></p></main></body></html>\n`;

export function buildSite({ projectRoot = ownRoot, outputDir = 'dist/site', ref = 'main' } = {}) {
  validateRef(ref);
  const root = path.resolve(projectRoot);
  const rootStat = fs.lstatSync(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error('Project root must be a real directory.');
  const output = path.isAbsolute(outputDir) ? path.resolve(outputDir) : path.resolve(root, outputDir);
  const dist = path.join(root, 'dist');
  if (!within(dist, output)) throw new Error('Output must be a new directory under project dist/.');
  rejectLinkedComponents(root, output);
  if (exists(output)) throw new Error('Output already exists; choose a new --out directory. Nothing is deleted or replaced.');

  // Read and validate the complete allowlist before creating any output.
  const plan = [
    ...runtimeFiles.map(name => ({ relative: `app/${name}`, text: true })),
    ...imageFiles.map(name => ({ relative: `assets/images/${name}`, text: false }))
  ].map(item => {
    const source = path.join(root, ...item.relative.split('/'));
    rejectLinkedComponents(root, source);
    const stat = fs.lstatSync(source);
    if (!stat.isFile()) throw new Error(`Expected a regular publication file: ${item.relative}`);
    const original = fs.readFileSync(source);
    // This corpus contains quoted README text and integrity hashes. Never rewrite
    // its original evidence; root prepares it from the authorized public checkout.
    const bytes = item.text && item.relative !== 'app/recall-data.js'
      ? Buffer.from(rewriteSourceLinks(original.toString('utf8'), ref)) : original;
    return { ...item, bytes };
  });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.mkdirSync(output);
  for (const item of plan) {
    const target = path.join(output, ...item.relative.split('/'));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, item.bytes, { flag: 'wx' });
  }
  fs.writeFileSync(path.join(output, 'index.html'), entry, { flag: 'wx' });
  return { output, files: plan.length + 1, runtimeFiles: runtimeFiles.length, imageFiles: imageFiles.length, entry: 'app/overview.html', sourceRef: ref };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2); let outputDir = 'dist/site', ref = 'main';
    for (let i = 0; i < args.length; i += 2) {
      if (!['--out', '--ref'].includes(args[i]) || !args[i + 1]) throw new Error('Usage: node scripts/build-site.mjs [--out dist/new-directory] [--ref branch-or-commit]');
      if (args[i] === '--out') outputDir = args[i + 1]; else ref = args[i + 1];
    }
    console.log(JSON.stringify(buildSite({ outputDir, ref }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
