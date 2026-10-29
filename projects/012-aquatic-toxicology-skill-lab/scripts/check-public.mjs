import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// This check uses only committed, public artifacts. The original full check
// separately verifies local source snapshots and raw research responses.
const root = fileURLToPath(new URL('../', import.meta.url));
const app = path.resolve(root, 'app');
const pinnedCommit = 'b8d050f24f2e1c465c4410eace8634ea3af15930';
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const read = name => JSON.parse(fs.readFileSync(path.join(app, 'data', name), 'utf8').replace(/^\uFEFF/, ''));
const data = read('research.json');
const embedded = fs.readFileSync(path.join(app, 'data/research-data.js'), 'utf8');
assert(JSON.stringify(JSON.parse(embedded.replace(/^window\.RESEARCH_DATA = /, '').replace(/;\s*$/, ''))) === JSON.stringify(data), 'Embedded and JSON research artifacts differ');

assert(data.meta.upstreamCommit === pinnedCommit, 'Unexpected upstream research version');
assert(data.papers.length === 14 && new Set(data.papers.map(paper => paper.id)).size === 14, 'Source identities changed');
for (const [role, count] of [['core', 10], ['context', 2], ['method', 2]]) assert(data.papers.filter(paper => paper.role === role).length === count, `Unexpected ${role} source count`);
assert(!data.papers.filter(paper => paper.role === 'core').some(paper => paper.readScope === 'full_text'), 'Public artifacts upgrade unread core texts');
const catalog = data.skillBreakdown.catalog;
assert(data.skillBreakdown.commit === pinnedCommit, 'Skill catalog version differs');
assert(catalog.total === 5 && catalog.items.length === 5, 'Keep five top-level skills distinct from roles');
assert(JSON.stringify(catalog.items.map(item => item.id).sort()) === JSON.stringify(['academic-paper', 'academic-paper-reviewer', 'academic-pipeline', 'deep-research', 'sr-screener']), 'Unexpected top-level skill list');
assert(catalog.items.find(item => item.id === 'sr-screener').installed === false, 'Do not claim the uninstalled screener was run');

const understanding = data.understandingSummary;
assert(understanding.upstreamCommit === pinnedCommit && understanding.steps.length === 6, 'Understanding scope or version differs');
assert(JSON.stringify(understanding.sources.filter(source => source.retrievalTrialTested).map(source => source.id).sort()) === JSON.stringify(['EPMC', 'OPENALEX', 'PUBMED']), 'Do not turn suggested sources or partial reading into API tests');
const trial = data.retrievalTrial;
assert(trial.ownership.commit === pinnedCommit, 'Retrieval ownership version differs');
const newCollectors = trial.ownership.script_checks.filter(item => /^scripts\/retrieve-(?:pubmed|europepmc|openalex)\.py$/.test(item.path));
assert(newCollectors.length === 3 && newCollectors.every(item => item.in_archive === false && item.in_manifest === false && item.origin === 'case_added'), 'Case-added collectors are mislabeled as upstream');
assert(trial.records.length === 984 && new Set(trial.records.map(record => record.id)).size === 984, 'Retrieval candidate identities changed');
const expectedCounts = { retain: 17, exclude: 916, uncertain: 51 };
for (const [decision, count] of Object.entries(expectedCounts)) assert(trial.records.filter(record => record.decision === decision).length === count && trial.audit.screenCounts[decision] === count, `Public ${decision} accounting differs`);
const benchmark = read('retrieval-benchmark.json');
assert(benchmark.benchmark_items.length === 5, 'Benchmark denominator changed');
const original = new Set(['PM-PRIMARY', 'EPMC-PRIMARY']);
const supplement = new Set([...original, 'OA-SUPPLEMENT-V2']);
const repaired = new Set(['PM-REPAIRED', 'EPMC-REPAIRED']);
for (const [stage, expected, matches] of [
  ['original', 3, query => original.has(query)],
  ['supplement', 3, query => supplement.has(query)],
  ['graph', 4, query => supplement.has(query) || query.startsWith('CITE-')],
  ['repaired', 5, query => repaired.has(query)],
]) {
  const found = benchmark.benchmark_items.filter(item => trial.records.some(record => record.doi?.toLowerCase() === item.doi.toLowerCase() && record.queries.some(matches))).length;
  assert(found === expected && trial.audit.benchmarkScores[stage] === expected, `${stage} benchmark score must follow query membership, not diagnostic lookups`);
}
for (const query of trial.queries.filter(query => query.complete)) assert(query.total === query.returned, `Incomplete source query: ${query.id}`);
assert(trial.queries.some(query => query.id === 'OA-SUPPLEMENT' && query.complete === false && query.total === null), 'The failed original OpenAlex query must stay visible');

function localTarget(relative, base = app) {
  const clean = decodeURIComponent(relative.split(/[?#]/, 1)[0]);
  assert(clean && !path.isAbsolute(clean) && !/^[A-Za-z]:/.test(clean) && !clean.includes('\\'), `Invalid public resource path: ${relative}`);
  const target = path.resolve(base, clean);
  assert(target.startsWith(app + path.sep), `Public resource escapes app: ${relative}`);
  assert(fs.existsSync(target), `Missing public resource: ${relative}`);
  return target;
}
assert(data.artifacts.length === 42, 'Public download list changed unexpectedly');
for (const artifact of [...data.artifacts, ...trial.downloads]) localTarget(artifact.url);
for (const source of Object.values(data.skillBreakdown.sourceIndex)) {
  if (source.url.startsWith('./')) localTarget(source.url);
  else assert(source.url.startsWith(`https://github.com/Imbad0202/academic-research-skills/blob/${pinnedCommit}/`), 'Unpinned upstream source link');
}
const publicFiles = [];
function inspect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    assert(!entry.isSymbolicLink(), `Symlink in public tree: ${target}`);
    if (entry.isDirectory()) inspect(target);
    else publicFiles.push(target);
  }
}
inspect(app);
function checkNoAbstractMirror(value, file) {
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (['abstract', 'abstracttext', 'abstract_inverted_index'].includes(key.toLowerCase())) assert(item === null || item === '' || (typeof item === 'object' && Object.keys(item).length === 0), `Full abstract material in public artifact: ${file}`);
    checkNoAbstractMirror(item, file);
  }
}
for (const file of publicFiles) {
  const extension = path.extname(file);
  if (extension === '.json') checkNoAbstractMirror(JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')), path.relative(app, file));
  if (extension === '.html') {
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
      const url = match[1];
      if (url.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith('//')) continue;
      localTarget(url, path.dirname(file));
    }
  }
  if (extension === '.css') {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
      if (match[1].startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(match[1])) continue;
      localTarget(match[1], path.dirname(file));
    }
  }
}
const image = fs.readFileSync(path.join(app, 'assets/understanding-map.png'));
assert(image.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) && image.readUInt32BE(16) === 1536 && image.readUInt32BE(20) === 1024, 'Understanding map PNG dimensions differ');
assert(crypto.createHash('sha256').update(image).digest('hex') === '77db9c8a099aa369a6df5669c17b47c4fcba62dcd56ac6da0b47df8c4919419e', 'Generated guide image bytes changed');
for (const name of ['main.js', 'skill-map.js', 'retrieval.js', 'understanding.js', 'data/research-data.js']) execFileSync(process.execPath, ['--check', path.join(app, name)]);
console.log(JSON.stringify({ result: 'pass', mode: 'public-artifacts-only', sources: 14, skills: 5, apiSources: 3, candidates: 984, downloads: 42, publicFiles: publicFiles.length, boundary: 'Public artifact integrity and publication scope, not scientific reliability or exhaustive retrieval.' }, null, 2));
