import test from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCorpus, serializeCorpus } from '../scripts/build-recall.mjs';
import '../app/recall-data.js';
import '../app/recall-core.js';

const core = globalThis.RecallCore;
const corpus = globalThis.RECALL_CORPUS;
const ids = corpus.projects.map(p => p.id);
const data = notes => ({schemaVersion:1, notes});
const memoryStorage = () => {
  const entries = new Map();
  return {getItem:key => entries.get(key) ?? null, setItem:(key, value) => entries.set(key, value), entries};
};

test('the snapshot covers the actual registered projects and a blank search returns them all', () => {
  const registry = JSON.parse(fs.readFileSync(new URL('../../../projects.json', import.meta.url), 'utf8'));
  const expectedIds = registry.projects.map(p => p.id).toSorted();
  assert.deepEqual(ids.toSorted(), expectedIds);
  assert.deepEqual(core.search(corpus, '  ').map(r => r.project.id), expectedIds);
});
test('the original real question locates agent-skills by GitHub URL', () => {
  assert.equal(core.search(corpus, 'https://github.com/addyosmani/agent-skills')[0]?.project.id, '010');
});
test('repository URL case, .git, trailing slash, query and fragment preserve identity', () => {
  assert.equal(core.normalizeQuery(' HTTPS://WWW.GITHUB.COM/ADDYOSMANI/AGENT-SKILLS.git/?tab=readme#top '), 'github.com/addyosmani/agent-skills');
  assert.equal(core.search(corpus, 'HTTPS://GITHUB.COM/ADDYOSMANI/AGENT-SKILLS.git/?x=1#readme')[0]?.project.id, '010');
});
test('a repository URL prefix is not mistaken for an exact researched repository', () => {
  assert.equal(core.search(corpus, 'https://github.com/addyosmani/agent').length, 0);
});
test('PromptHub name search is case insensitive and ranks its primary project first', () => {
  assert.equal(core.search(corpus, 'pRoMpThUb')[0]?.project.id, '006');
});
test('Graphiti returns a real README passage from project 009', () => {
  const result = core.search(corpus, 'Graphiti').find(r => r.project.id === '009');
  assert.ok(result);
  assert.equal(result.match.kind, 'readme');
  assert.match(result.match.text, /Graphiti/);
  assert.equal(result.match.path, result.project.readmePath);
});
test('the quoted passage is exactly the recorded source line range', () => {
  const result = core.search(corpus, '跨日回顾').find(r => r.project.id === '009');
  assert.ok(result);
  const source = result.project.readmeText.split('\n');
  assert.equal(source.slice(result.match.startLine - 1, result.match.endLine).join('\n'), result.match.text);
});
test('multiple whitespace-separated words are ANDed and unknown text yields no invented result', () => {
  assert.ok(core.search(corpus, 'Graphiti 跨日回顾').some(r => r.project.id === '009'));
  assert.deepEqual(core.search(corpus, 'Graphiti definitely-not-in-this-corpus-72841'), []);
  assert.deepEqual(core.search(corpus, 'library-that-does-not-exist-72841'), []);
});
test('research status filtering agrees with the registry', () => {
  assert.deepEqual(core.search(corpus, '', 'researching').map(r => r.project.id), corpus.projects.filter(p => p.status === 'researching').map(p => p.id).toSorted());
});
test('HTML-looking search input is ordinary text and has no match', () => {
  assert.deepEqual(core.search(corpus, '<img src=x onerror=alert(1)>'), []);
});
test('valid notes round-trip without changing their text', () => {
  const original = data([{projectId:'009', text:'检索成功不等于答案正确。\n保留原文。'}]);
  assert.deepEqual(core.parseNotes(JSON.stringify(original), ids), original);
  const storage = memoryStorage();
  assert.equal(core.saveNotes(storage, original).ok, true);
  assert.deepEqual(core.loadNotes(storage, ids), {ok:true, data:original});
  assert.deepEqual([...storage.entries.keys()], ['agent-skills-recall-notes-v1']);
});
test('invalid imports cannot replace an existing stored note', () => {
  const storage = memoryStorage();
  const original = data([{projectId:'006', text:'已经保存的判断'}]);
  storage.setItem('agent-skills-recall-notes-v1', JSON.stringify(original));
  for (const invalid of [
    {schemaVersion:2, notes:[]}, data([{projectId:'999', text:'未知项目'}]),
    data([{projectId:'006',text:'a'},{projectId:'006',text:'b'}]),
    data([{projectId:'006',text:'x'.repeat(5001)}]),
    {schemaVersion:1,notes:[],extra:true}, data([{projectId:'006',text:'x',html:true}])
  ]) assert.throws(() => core.parseNotes(JSON.stringify(invalid), ids));
  assert.throws(() => core.parseNotes('x'.repeat(100001), ids));
  assert.throws(() => core.parseNotes('{bad json', ids));
  assert.equal(storage.getItem('agent-skills-recall-notes-v1'), JSON.stringify(original));
});
test('merging refuses conflicting nonempty notes and leaves its inputs unchanged', () => {
  const current = data([{projectId:'010',text:'本地结论'}]);
  const incoming = data([{projectId:'010',text:'外部结论'}]);
  const snapshot = JSON.stringify({current,incoming});
  assert.throws(() => core.mergeNotes(current, incoming), /冲突/);
  assert.equal(JSON.stringify({current,incoming}), snapshot);
});
test('merging is idempotent, adds new projects and does not erase nonempty notes', () => {
  const current = data([{projectId:'006',text:'保留'}]);
  assert.deepEqual(core.mergeNotes(current, current), current);
  assert.deepEqual(core.mergeNotes(current, data([{projectId:'006',text:''},{projectId:'009',text:'新增'}])), data([{projectId:'006',text:'保留'},{projectId:'009',text:'新增'}]));
});
test('storage write failure is reported and does not claim success or change existing data', () => {
  const original = JSON.stringify(data([{projectId:'010',text:'旧值'}]));
  const storage = {getItem:() => original, setItem:() => {throw Error('quota exceeded');}};
  assert.equal(core.saveNotes(storage, data([{projectId:'010',text:'新值'}])).ok, false);
  assert.equal(storage.getItem('agent-skills-recall-notes-v1'), original);
});
test('corrupt or inaccessible storage is reported rather than silently reinitialized', () => {
  let writes = 0;
  const storage = {getItem:() => '{broken', setItem:() => writes++};
  assert.equal(core.loadNotes(storage, ids).ok, false);
  assert.equal(writes, 0);
  assert.equal(core.loadNotes({getItem:() => {throw Error('blocked');}}, ids).ok, false);
});
test('every indexed source passage is tied to its real README lines', () => {
  for (const project of corpus.projects) {
    const source = project.readmeText.split('\n');
    for (const passage of project.passages) {
      assert.equal(passage.path, project.readmePath);
      assert.equal(source.slice(passage.startLine - 1, passage.endLine).join('\n'), passage.text);
    }
  }
});
test('corpus generation is deterministic for a fixed timestamp and safely serializes script content', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const first = buildCorpus(root, '2026-10-28T00:00:00.000Z');
  const second = buildCorpus(root, '2026-10-28T00:00:00.000Z');
  assert.equal(serializeCorpus(first), serializeCorpus(second));
  assert.equal(first.registrySha256.length, 64);
  const serialized = serializeCorpus({text:'</script>\u2028\u2029'});
  assert.ok(!serialized.includes('</script>'));
  assert.match(serialized, /\\u2028/);
  assert.match(serialized, /\\u2029/);
});
