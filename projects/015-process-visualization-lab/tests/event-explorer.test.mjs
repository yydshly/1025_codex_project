import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { validateEventFeed, filterEvents, buildEventTimeline } from '../app/live-event-data.js';
import { eventFactsMarkup, eventSeriesMarkup } from '../app/live-event-view.js';

const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const settle = async () => { for (let i = 0; i < 16; i++) await Promise.resolve(); };
const feed = label => ({
  schemaVersion: 1, retrievedAtUtc: '2026-11-04T12:00:00Z',
  sources: [{ id: 'test', name: '验证来源', url: 'https://example.org/catalog', retrievedAtUtc: '2026-11-04T12:00:00Z', coverageLabel: '验证时间窗', status: 'ok' }],
  events: [0, 1].map(i => ({ id: label + '-' + i, kind: 'quake', title: label + ' ' + i, timeUtc: '2026-11-04T0' + i + ':00:00Z', lastObservedUtc: '2026-11-04T0' + i + ':00:00Z', statusLabel: '目录解', source: { name: '验证来源', url: 'https://example.org/catalog' }, sourceDetailUrl: 'https://example.org/event/' + label + i, lat: 20, lon: 120, magnitude: 3 + i, depthKm: 10, observations: [{ timeUtc: '2026-11-04T0' + i + ':00:00Z', lat: 20, lon: 120 }] })),
});

function harness() {
  const nodes = new Map(), saved = deferred(), updates = [], engineCalls = [], operations = [];
  let active = true;
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector, { textContent: '', innerHTML: '', hidden: false, disabled: false, value: '', handlers: new Map(), setAttribute(key, value) { this[key] = value; }, addEventListener(type, fn) { const list = this.handlers.get(type) ?? []; list.push(fn); this.handlers.set(type, list); } });
    return nodes.get(selector);
  };
  const engine = {
    setLiveEvents(events, select) { engineCalls.push(events.map(e => e.id)); this.select = select; },
    setLiveTime(time) { operations.push({ kind: 'time', time }); }, setLiveObservation() {}, setLiveView() {},
    selectLiveEvent(id) { this.selectedId = id; operations.push({ kind: 'selection', id }); },
  };
  const context = { document: { querySelector: node, body: { dataset: {} } }, Intl, Date, Math, Number, String, Object, URL, Promise,
    validateEventFeed, filterEvents, buildEventTimeline, eventFactsMarkup, eventSeriesMarkup,
    fetch: () => saved.promise,
    fetchEarthEvents: () => { const update = deferred(); updates.push(update); return update.promise; },
  };
  const source = fs.readFileSync(new URL('../app/event-explorer.js', import.meta.url), 'utf8').replace(/^import[^\n]*\n/gm, '').replace('export function createEventExplorer', 'function createEventExplorer');
  vm.createContext(context); vm.runInContext(source, context, { filename: 'actual-event-explorer.js' });
  const explorer = context.createEventExplorer(engine, { isActive: () => active, onPrinciple() {} });
  return { explorer, engine, engineCalls, operations, node, updates,
    snapshot(data) { saved.resolve({ ok: true, json: async () => data }); },
    refresh() { return node('#live-refresh').handlers.get('click')[0]({}); },
    leave() { active = false; explorer.leave(); }, enter() { active = true; explorer.enter(); },
  };
}

test('a completed manual refresh cannot be overwritten by a slower initial saved snapshot', async () => {
  const h = harness(); h.enter();
  const refresh = h.refresh(); assert.equal(h.updates.length, 1);
  h.updates[0].resolve(feed('fresh')); await refresh; await settle();
  assert.equal(h.node('#location-name').textContent, 'fresh 1');
  h.snapshot(feed('saved')); await settle();
  assert.equal(h.node('#location-name').textContent, 'fresh 1');
  assert.match(h.node('#live-status').textContent, /本次从官方接口获取/);
});

test('leaving and reentering invalidates an earlier refresh without overriding the new selection', async () => {
  const h = harness(); h.enter(); h.snapshot(feed('saved')); await settle();
  const refresh = h.refresh(); h.leave(); h.enter();
  h.engine.select('saved-0'); assert.equal(h.node('#location-name').textContent, 'saved 0');
  h.updates[0].resolve(feed('old-session')); await refresh; await settle();
  assert.equal(h.node('#location-name').textContent, 'saved 0');
  assert.equal(h.engine.selectedId, 'saved-0');
});

test('reentry allows a fresh update and stale completion cannot clear its loading state', async () => {
  const h = harness(); h.enter(); h.snapshot(feed('saved')); await settle();
  const old = h.refresh(); h.leave(); h.enter(); const current = h.refresh();
  assert.equal(h.updates.length, 2, 'an abandoned session does not keep the refresh button locked');
  h.updates[0].resolve(feed('old-session')); await old; await settle();
  assert.equal(h.node('#live-refresh').disabled, true, 'only the current refresh owns its pending indicator');
  assert.equal(h.node('#location-name').textContent, 'saved 1');
  h.updates[1].resolve(feed('new-session')); await current; await settle();
  assert.equal(h.node('#live-refresh').disabled, false);
  assert.equal(h.node('#location-name').textContent, 'new-session 1');
});

test('a late initial snapshot cannot write event markers after leaving the explorer', async () => {
  const h = harness(); h.enter(); h.leave(); const before = h.engineCalls.length;
  h.snapshot(feed('late')); await settle();
  assert.equal(h.engineCalls.length, before);
  assert.equal(h.node('#live-toolbar').hidden, true);
});

test('quake selection updates the directory cutoff before asking the engine to focus its marker', async () => {
  const h = harness(); h.enter(); h.snapshot(feed('saved')); await settle();
  h.explorer.setCategory('quake'); h.operations.length = 0;
  h.engine.select('saved-0');
  assert.deepEqual(h.operations.slice(0, 2), [
    { kind: 'time', time: '2026-11-04T00:00:00Z' },
    { kind: 'selection', id: 'saved-0' },
  ]);
  assert.equal(h.node('#location-name').textContent, 'saved 0');
});

test('older EONET volcano reports reach the globe only after opting in, while the exact ninety-day boundary remains visible', async () => {
  const h = harness(), data = feed('saved');
  const cutoff = new Date(Date.parse(data.retrievedAtUtc) - 90 * 86400000).toISOString();
  const report = (id, timeUtc) => ({
    id, kind: 'volcano', title: id, timeUtc, lastObservedUtc: timeUtc, statusLabel: '开放目录报告',
    source: { id: 'eonet_volcano_open', name: 'EONET验证目录', url: 'https://eonet.gsfc.nasa.gov/' },
    sourceDetailUrl: 'https://example.org/' + id, lat: 20, lon: 120, magnitude: null, depthKm: null,
    observations: [{ timeUtc, lat: 20, lon: 120 }],
  });
  data.events.push(report('older-volcano', '2026-07-01T00:00:00Z'), report('boundary-volcano', cutoff));
  h.enter(); h.snapshot(data); await settle();
  assert.ok(h.engineCalls.length > 0);
  assert.ok(h.engineCalls.every(ids => !ids.includes('older-volcano')), 'old report is never sent to the engine by default');
  assert.ok(h.engineCalls.at(-1).includes('boundary-volcano'), 'exact cutoff is included, using the snapshot date rather than wall-clock time');
  assert.ok(h.engineCalls.at(-1).includes('saved-0'));
  const checkbox = h.node('#live-older');
  checkbox.checked = true; checkbox.handlers.get('change')[0]({ target: checkbox });
  assert.ok(h.engineCalls.at(-1).includes('older-volcano'));
  assert.equal(h.engineCalls.at(-1).length, 4);
  checkbox.checked = false; checkbox.handlers.get('change')[0]({ target: checkbox });
  assert.ok(!h.engineCalls.at(-1).includes('older-volcano'));
  assert.ok(h.engineCalls.at(-1).includes('boundary-volcano'));
});

test('a partial refresh failure preserves the complete saved feed and its acquisition time with an explicit failure state', async () => {
  const h = harness(); h.enter(); h.snapshot(feed('saved')); await settle();
  h.engine.select('saved-0');
  const callsBefore = h.engineCalls.length, update = h.refresh();
  const partial = feed('partial'); partial.retrievedAtUtc = '2026-11-04T13:00:00Z';
  partial.sources[0].retrievedAtUtc = partial.retrievedAtUtc;
  partial.sources.push({ id: 'failed-source', name: '第二来源', url: 'https://example.org/unavailable', retrievedAtUtc: partial.retrievedAtUtc, coverageLabel: '验证失败窗口', status: 'error' });
  h.updates[0].resolve(partial); await update; await settle();
  assert.equal(h.engineCalls.length, callsBefore, 'no partial marker set replaces the complete saved set');
  assert.equal(h.engine.selectedId, 'saved-0'); assert.equal(h.node('#location-name').textContent, 'saved 0');
  assert.match(h.node('#live-status').textContent, /更新未完成.*上次资料/);
  assert.match(h.node('#live-status').textContent, /20:00/); // Saved 12:00 UTC, not failed refresh 13:00 UTC.
  assert.doesNotMatch(h.node('#live-status').textContent, /21:00/);
  assert.equal(h.node('#live-refresh').disabled, false, 'failure allows another explicit refresh');
  h.explorer.setCategory('quake');
  assert.deepEqual(h.engineCalls.at(-1), ['saved-0', 'saved-1']);
  assert.doesNotMatch(h.node('#current-insight').innerHTML, /partial-/);
});
