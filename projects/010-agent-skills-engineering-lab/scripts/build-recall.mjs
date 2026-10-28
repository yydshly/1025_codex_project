import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const workspaceRoot = path.resolve(projectRoot, '../..');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const within = (base, target) => target.startsWith(base + path.sep);

// Only the registry and each registered project's README are input files.
export function buildCorpus(root = workspaceRoot, generatedAt = new Date().toISOString()) {
  const realRoot = fs.realpathSync(root);
  const registryPath = path.join(realRoot, 'projects.json');
  if (!within(realRoot, fs.realpathSync(registryPath))) throw Error('Registry escapes workspace');
  const registryBytes = fs.readFileSync(registryPath);
  const registryText = registryBytes.toString('utf8').replace(/^\uFEFF/, '');
  const registry = JSON.parse(registryText);
  if (!Array.isArray(registry.projects)) throw Error('Invalid project registry');
  const lines = registryText.split(/\r?\n/);
  const seen = new Set();
  const projects = registry.projects.map(item => {
    if (!/^\d{3}$/.test(item.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || seen.has(item.id)) {
      throw Error('Invalid or duplicate project identity');
    }
    seen.add(item.id);
    const relative = `projects/${item.id}-${item.slug}/README.md`;
    const directory = path.resolve(realRoot, `projects/${item.id}-${item.slug}`);
    const realDirectory = fs.realpathSync(directory);
    const filename = path.resolve(realRoot, relative);
    const realFilename = fs.realpathSync(filename);
    if (realDirectory !== directory || !within(realRoot, realDirectory) || !within(directory, realFilename) || !within(realDirectory, realFilename)) {
      throw Error(`README escapes allowed project: ${item.id}`);
    }
    const bytes = fs.readFileSync(realFilename);
    const readmeText = bytes.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    const readmeLines = readmeText.split('\n');
    const passages = [];
    let start = 0;
    for (let i = 0; i <= readmeLines.length; i++) {
      if (i === readmeLines.length || readmeLines[i].trim() === '' || i - start === 8) {
        if (i > start) passages.push({path: relative, startLine: start + 1, endLine: i, text: readmeLines.slice(start, i).join('\n')});
        start = i === readmeLines.length || readmeLines[i].trim() === '' ? i + 1 : i;
      }
    }
    const idLine = lines.findIndex(line => new RegExp(`^\\s*"id"\\s*:\\s*"${item.id}"`).test(line));
    if (idLine < 1) throw Error(`Cannot locate registry source: ${item.id}`);
    let end = idLine;
    while (end < lines.length && !/^    }[,]?$/.test(lines[end])) end++;
    if (end === lines.length) throw Error(`Cannot locate registry boundary: ${item.id}`);
    return {
      id: item.id, slug: item.slug, name: item.name, summary: item.summary,
      source: item.source, status: item.status, tags: item.tags, createdAt: item.createdAt,
      readmePath: relative, readmeSha256: hash(bytes), readmeText, passages,
      registryPassage: {path:'projects.json', startLine:idLine, endLine:end + 1, text:lines.slice(idLine - 1, end + 1).join('\n')}
    };
  });
  return {schemaVersion:1, generatedAt, registrySha256:hash(registryBytes), projects};
}

export function serializeCorpus(corpus) {
  const json = JSON.stringify(corpus, null, 2).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `// Generated from the project registry and allowlisted README files.\nglobalThis.RECALL_CORPUS = ${json};\n`;
}

function main() {
  const check = process.argv.includes('--check');
  if (process.argv.slice(2).some(arg => arg !== '--check')) throw Error('Usage: node scripts/build-recall.mjs [--check]');
  const dataPath = path.join(projectRoot, 'app/recall-data.js');
  const manifestPath = path.join(projectRoot, 'research/real-case/corpus-manifest.json');
  const previous = check ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
  const corpus = buildCorpus(workspaceRoot, previous?.generatedAt);
  const serialized = serializeCorpus(corpus);
  const manifest = {
    schemaVersion:1, generatedAt:corpus.generatedAt, sourceScope:'projects.json + registered project README.md files only',
    projectCount:corpus.projects.length, passageCount:corpus.projects.reduce((sum, p) => sum + p.passages.length, 0),
    registrySha256:corpus.registrySha256, dataSha256:hash(serialized),
    documents:corpus.projects.map(p => ({projectId:p.id, path:p.readmePath, sha256:p.readmeSha256, passages:p.passages.length}))
  };
  if (check) {
    if (fs.readFileSync(dataPath, 'utf8') !== serialized || JSON.stringify(manifest) !== JSON.stringify(previous)) throw Error('Snapshot is stale; rebuild recall data');
  } else {
    fs.mkdirSync(path.dirname(manifestPath), {recursive:true});
    fs.writeFileSync(dataPath, serialized, 'utf8');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  }
  console.log(JSON.stringify({mode:check?'check':'build', projects:manifest.projectCount, passages:manifest.passageCount, dataBytes:Buffer.byteLength(serialized), status:'pass'}));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
