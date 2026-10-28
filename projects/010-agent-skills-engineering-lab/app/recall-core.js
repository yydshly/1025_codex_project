(() => {
  'use strict';
  const STORAGE_KEY = 'agent-skills-recall-notes-v1';
  const indexes = new WeakMap();
  const fold = value => String(value ?? '').normalize('NFKC').toLowerCase();

  function normalizeQuery(value) {
    const text = fold(value).trim().replace(/\s+/g, ' ');
    if (/^(https?:\/\/)?(www\.)?github\.com\//.test(text)) {
      try {
        const url = new URL(text.startsWith('http') ? text : `https://${text}`);
        const parts = url.pathname.split('/').filter(Boolean);
        if (url.hostname.replace(/^www\./, '') === 'github.com' && parts.length >= 2) {
          return `github.com/${parts[0]}/${parts[1].replace(/\.git$/, '')}`;
        }
      } catch { return text; }
    }
    return text;
  }

  function getIndex(corpus) {
    if (!indexes.has(corpus)) {
      indexes.set(corpus, corpus.projects.map(project => {
        const metadata = fold([project.id, project.name, project.slug, project.summary, project.source, ...(project.tags ?? [])].join('\n'));
        return {project, metadata, name:fold(project.name), source:normalizeQuery(project.source),
          repositories:repositoryLinks(project.source + '\n' + project.readmeText),
          all:metadata + '\n' + fold(project.readmeText),
          passages:project.passages.map(passage => ({passage, text:fold(passage.text), repositories:repositoryLinks(passage.text)}))};
      }));
    }
    return indexes.get(corpus);
  }

  function repositoryLinks(text) {
    return new Set((fold(text).match(/https?:\/\/(?:www\.)?github\.com\/[a-z0-9_.-]+\/[a-z0-9_.-]+/g) ?? []).map(normalizeQuery));
  }

  function search(corpus, query, status = 'all') {
    const normalized = normalizeQuery(query);
    const terms = normalized.split(' ').filter(Boolean);
    const repositoryQuery = /^github\.com\/[^/\s]+\/[^/\s]+$/.test(normalized);
    const results = [];
    for (const record of getIndex(corpus)) {
      const project = record.project;
      if (status !== 'all' && project.status !== status) continue;
      if (repositoryQuery ? !record.repositories.has(normalized) : terms.some(term => !record.all.includes(term))) continue;
      const exactRepository = repositoryQuery && record.source === normalized;
      let selected = null, count = 0;
      if (!exactRepository) {
        for (const entry of record.passages) {
          const hits = repositoryQuery ? Number(entry.repositories.has(normalized)) : terms.filter(term => entry.text.includes(term)).length;
          if (hits > count) { selected = entry.passage; count = hits; }
        }
      }
      const match = selected
        ? {...selected, kind:'readme'}
        : {...project.registryPassage, kind:'registry'};
      const score = (exactRepository ? 1000 : 0) +
        terms.filter(term => record.name.includes(term)).length * 100 +
        terms.filter(term => record.metadata.includes(term)).length * 10 + count;
      results.push({project, score, match});
    }
    return results.sort((a, b) => b.score - a.score || a.project.id.localeCompare(b.project.id));
  }

  function exactKeys(value, expected) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const keys = Object.keys(value);
    return keys.length === expected.length && expected.every(key => Object.hasOwn(value, key));
  }

  function validateNotes(value, knownIds) {
    if (!exactKeys(value, ['schemaVersion','notes']) || value.schemaVersion !== 1 || !Array.isArray(value.notes)) {
      throw Error('记录格式不正确：只支持 schemaVersion 1。');
    }
    const known = new Set(knownIds);
    const seen = new Set();
    const notes = value.notes.map(note => {
      if (!exactKeys(note, ['projectId','text']) || typeof note.projectId !== 'string' ||
          !/^\d{3}$/.test(note.projectId) || !known.has(note.projectId) || seen.has(note.projectId) ||
          typeof note.text !== 'string' || note.text.length > 5000) {
        throw Error('记录包含未知或重复的项目、额外字段，或超过 5000 字符的内容。');
      }
      seen.add(note.projectId);
      return {projectId:note.projectId, text:note.text};
    });
    return {schemaVersion:1, notes};
  }

  function parseNotes(text, knownIds) {
    if (typeof text !== 'string' || text.length > 100000) throw Error('备份须为不超过 100000 字符的 JSON 文本。');
    let parsed;
    try { parsed = JSON.parse(text); } catch { throw Error('备份不是有效的 JSON 文本。'); }
    return validateNotes(parsed, knownIds);
  }

  function mergeNotes(current, incoming) {
    const knownIds = [...current.notes, ...incoming.notes].map(note => note.projectId);
    const existing = validateNotes(current, knownIds);
    const additions = validateNotes(incoming, knownIds);
    const merged = new Map(existing.notes.map(note => [note.projectId, {...note}]));
    for (const note of additions.notes) {
      const prior = merged.get(note.projectId);
      if (prior?.text && note.text && prior.text !== note.text) throw Error(`项目 ${note.projectId} 的记录冲突，未覆盖本地内容。`);
      if (!prior || !prior.text) merged.set(note.projectId, {...note});
    }
    return {schemaVersion:1, notes:[...merged.values()].sort((a,b) => a.projectId.localeCompare(b.projectId))};
  }

  function saveNotes(storage, data) {
    try {
      const text = JSON.stringify(data);
      parseNotes(text, data.notes.map(note => note.projectId));
      storage.setItem(STORAGE_KEY, text);
      return {ok:true};
    } catch {
      return {ok:false, error:'保存未完成：记录格式无效，或浏览器存储不可用、容量不足。请保留输入并导出备份。'};
    }
  }

  function loadNotes(storage, knownIds) {
    try {
      const text = storage.getItem(STORAGE_KEY);
      return {ok:true, data:text === null ? {schemaVersion:1,notes:[]} : parseNotes(text, knownIds)};
    } catch {
      return {ok:false, error:'已有记录无法读取或格式不正确，已保留原存储。请先恢复可读备份。'};
    }
  }

  globalThis.RecallCore = Object.freeze({normalizeQuery, search, parseNotes, mergeNotes, saveNotes, loadNotes});
})();
