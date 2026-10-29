import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8').replace(/^\uFEFF/, ''));
const assert = (test, message) => { if (!test) throw new Error(message); };
const data = read('app/data/research.json');
const raw = read('research/phase2_investigation/papers.json');
const checks = read('app/data/citation-verification.json');
const manifest = read('research/upstream-manifest.json');
const ids = new Set(data.papers.map(p => p.id));
const dois = new Set(data.papers.map(p => p.doi.toLowerCase()));
assert(ids.size === data.papers.length, 'Duplicate source IDs');
assert(dois.size === data.papers.length, 'Duplicate DOI sources');
assert(data.papers.filter(p => p.role === 'core').length === 10, 'Core sample must remain explicit');
assert(data.papers.filter(p => p.role === 'context').length === 2, 'Background sources must remain separate');
assert(data.papers.filter(p => p.role === 'method').length === 2, 'Method sources must remain separate');
for (const p of raw) {
  const exported = data.papers.find(v => v.id === p.id);
  assert(exported && exported.title === p.title && exported.doi === p.doi, `Source identity drift ${p.id}`);
  assert(exported.readScope === p.readScope, `Reading scope upgraded ${p.id}`);
  assert(/^https:\/\//.test(exported.url), `Missing source URL ${p.id}`);
  assert(checks.results.some(v => v.id === p.id), `Missing live verification result ${p.id}`);
}
for (const item of [...data.claims, ...data.summary.findings, ...data.directions]) {
  for (const id of item.evidenceIds || item.priorWorkIds || []) assert(ids.has(id), `Unknown evidence ${id}`);
}
assert(data.directions.every(v => /未验证|未获|待/.test(v.noveltyStatus)), 'Do not silently certify novelty');
assert(!data.papers.filter(p => p.role === 'core').some(p => p.readScope === 'full_text'), 'No full-text attestation exists for core corpus');
assert(data.walkthrough.steps.length === 7, 'Seven actual process steps required');
const breakdown = data.skillBreakdown;
assert(breakdown.commit === data.meta.upstreamCommit, 'Skill audit must use the pinned source version');
assert(breakdown.catalog.total === 5 && breakdown.catalog.items.length === 5, 'Keep the five top-level skills distinct from agent roles');
assert(breakdown.catalog.installed === breakdown.catalog.items.filter(item => item.installed).length, 'Installed skill count must reflect actual files');
for (const item of breakdown.catalog.items) {
  assert(item.installed === fs.existsSync(path.join(root, 'research/upstream', item.id, 'SKILL.md')), `Incorrect installation state ${item.id}`);
  assert(item.source.url.includes(`/blob/${data.meta.upstreamCommit}/`), `Unpinned skill source ${item.id}`);
}
assert(breakdown.searchSteps.length > 0 && breakdown.checks.length > 0, 'Search and validation mechanisms must be explained');
for (const file of ['skill-mechanism-audit.json', 'skill-mechanism-audit.md']) {
  assert(fs.readFileSync(path.join(root, 'research', file), 'utf8') === fs.readFileSync(path.join(root, 'app/data', file), 'utf8'), `Audit export drift ${file}`);
}
for (const source of Object.values(breakdown.sourceIndex)) {
  if (source.url.startsWith('./data/')) assert(fs.existsSync(path.resolve(root, 'app', source.url)), `Missing audit source ${source.url}`);
  else assert(source.url.startsWith(`https://github.com/Imbad0202/academic-research-skills/blob/${data.meta.upstreamCommit}/`), `Unpinned audit source ${source.url}`);
}
assert(fs.readFileSync(path.join(root, 'scripts/verify-citations.py'), 'utf8') === fs.readFileSync(path.join(root, 'app/data/verify-citations.py.txt'), 'utf8'), 'Adapter source export drift');
const trial = data.retrievalTrial;
const understanding = data.understandingSummary;
assert(understanding.upstreamCommit === data.meta.upstreamCommit, 'Understanding summary must refer to the audited version');
assert(understanding.steps.length === 6, 'The understanding summary must explain all six research steps');
const apiSources = understanding.sources.filter(source => source.retrievalTrialTested).map(source => source.id).sort();
assert(JSON.stringify(apiSources) === JSON.stringify(['EPMC', 'OPENALEX', 'PUBMED']), 'Do not upgrade suggested sources or partial reading to API trials');
for (const name of ['understanding-summary.json', 'understanding-summary.md', 'understanding-image-prompt.md']) {
  assert(fs.readFileSync(path.join(root, 'research', name)).equals(fs.readFileSync(path.join(root, 'app/data', name))), `Understanding export drift: ${name}`);
}
const ownership = read('research/retrieval-ownership-audit.json');
assert(ownership.commit === data.meta.upstreamCommit && ownership.rows.length > 0, 'Retrieval ownership must match the audited source version');
assert(JSON.stringify(trial.ownership) === JSON.stringify(ownership), 'Retrieval ownership export drift');
for (const name of ['retrieve-pubmed.py', 'retrieve-europepmc.py', 'retrieve-openalex.py']) {
  assert(!manifest.files.some(file => file.path === `scripts/${name}`), `Case-added collector mislabeled: ${name}`);
  assert(fs.readFileSync(path.join(root, 'scripts', name)).equals(fs.readFileSync(path.join(root, 'app/data', name + '.txt'))), `Collector source export drift: ${name}`);
}
const trialRows = read('research/retrieval-trial/screening/records.json');
assert(trial.records.length === trialRows.length && new Set(trial.records.map(r => r.id)).size === trialRows.length, 'Retrieval screening lost or duplicated a record');
const trialCounts = Object.fromEntries(['retain', 'exclude', 'uncertain'].map(key => [key, trial.records.filter(r => r.decision === key).length]));
assert(JSON.stringify(trialCounts) === JSON.stringify(Object.fromEntries(['retain', 'exclude', 'uncertain'].map(key => [key, trial.audit.screenCounts[key]]))), 'Retrieval decision accounting drift');
const frozenReceipt = read('research/retrieval-trial/query-plan-receipt.json');
assert(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'research/retrieval-trial/query-plan.json'))).digest('hex') === frozenReceipt.sha256, 'Original retrieval plan changed');
const bench = read('research/retrieval-trial/benchmark/benchmark.json');
const nativeQueries = new Set(['PM-PRIMARY', 'EPMC-PRIMARY']);
const repairedQueries = new Set(['PM-REPAIRED', 'EPMC-REPAIRED']);
for (const [stage, allowed] of [['original', nativeQueries], ['repaired', repairedQueries]]) {
  const matched = bench.benchmark_items.filter(item => trial.records.some(r => r.doi === item.doi && r.queries.some(q => allowed.has(q)))).length;
  assert(matched === trial.audit.benchmarkScores[stage], `Benchmark score must come from theme-query memberships: ${stage}`);
}
for (const query of trial.queries.filter(q => q.complete)) assert(query.total === query.returned, `Incomplete source page disguised as complete ${query.id}`);
assert(trial.queries.some(q => q.id === 'OA-SUPPLEMENT' && q.complete === false && q.total === null), 'Preserve failed original OpenAlex query without a fabricated zero denominator');
for (const artifact of trial.downloads) assert(fs.existsSync(path.resolve(root, 'app', artifact.url)), `Missing trial download ${artifact.url}`);
for (const item of read('app/data/retrieval-source-manifest.json').files) {
  assert(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, item.path))).digest('hex') === item.sha256, `Retrieval source drift ${item.path}`);
}
assert(data.walkthrough.steps.every(s => /摘要/.test(s.assignmentKind)), 'Do not relabel reconstructed assignments as verbatim logs');
for (const item of [...data.walkthrough.steps.map(s => s.example), ...data.walkthrough.decisions]) {
  for (const id of item?.evidenceIds || []) assert(ids.has(id), `Unknown process evidence ${id}`);
}
for (const step of data.walkthrough.steps) {
  for (const artifact of step.artifacts) assert(fs.existsSync(path.resolve(root, 'app', artifact.url)), `Missing process artifact ${artifact.url}`);
}
for (const artifact of data.artifacts) {
  const target = path.resolve(root, 'app', artifact.url);
  assert(target.startsWith(path.resolve(root, 'app') + path.sep), 'Artifact escapes public folder');
  assert(fs.existsSync(target), `Missing download ${artifact.url}`);
}
for (const step of data.workflow) {
  for (const relative of Array.isArray(step.artifact) ? step.artifact : []) {
    assert(fs.existsSync(path.resolve(root, 'app', relative)), `Missing workflow artifact ${relative}`);
  }
}
for (const file of manifest.files) {
  const bytes = fs.readFileSync(path.join(root, 'research/upstream', file.path));
  assert(crypto.createHash('sha256').update(bytes).digest('hex') === file.sha256, `Upstream changed ${file.path}`);
}
const embedded = fs.readFileSync(path.join(root, 'app/data/research-data.js'), 'utf8');
assert(JSON.stringify(JSON.parse(embedded.replace(/^window\.RESEARCH_DATA = /, '').replace(/;\s*$/, ''))) === JSON.stringify(data), 'Offline and HTTP data disagree');
for (const file of ['app/main.js', 'app/skill-map.js', 'app/retrieval.js', 'app/understanding.js', 'app/data/research-data.js']) execFileSync(process.execPath, ['--check', path.join(root, file)]);
console.log(JSON.stringify({sources: ids.size, core:10, claims:data.claims.length, queries:data.search.queries.length, liveVerification:checks.counts, upstreamFilesVerified:manifest.files.length, artifacts:data.artifacts.length, result:'pass'}, null, 2));
