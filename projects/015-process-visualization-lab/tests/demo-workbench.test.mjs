import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { tasks, buildDemoEvidence } from '../app/demo-evidence-data.js';
import { createDemoSession } from '../app/demo-session.js';
import { makeClockTicks } from '../app/sync-timeline.js';
import { observedWavePath } from '../app/demo-workbench.js';

const quake = JSON.parse(fs.readFileSync(new URL('../app/data/quake-dynamic.json', import.meta.url), 'utf8'));
const mangkhut = JSON.parse(fs.readFileSync(new URL('../app/data/mangkhut-synchronized.json', import.meta.url), 'utf8'));

class Element {
  constructor(tagName = 'div') {
    this.tagName = tagName; this.dataset = {}; this.style = { setProperty() {} }; this.children = []; this.attributes = new Map(); this.handlers = new Map();
    this.hidden = false; this._html = ''; this._text = ''; const classes = new Set();
    this.classList = { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name), toggle(name, value) { if (value) classes.add(name); else classes.delete(name); } };
  }
  set innerHTML(value) { this._html = String(value); this._text = ''; this.children = []; }
  get innerHTML() { return this._html || this._text; }
  set textContent(value) { this._text = String(value); this._html = ''; this.children = []; }
  get textContent() { return this._text || this._html.replace(/<[^>]*>/g, ''); }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  append(...items) { for (const item of items) { item.parent = this; this.children.push(item); } }
  appendChild(item) { this.append(item); }
  replaceChildren(...items) { this._html = ''; this._text = ''; this.children = []; this.append(...items); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
  querySelectorAll(selector) { return selector === '.demo-a-marker' ? this.children.filter(child => child.getAttribute('class') === 'demo-a-marker') : []; }
  addEventListener(type, callback) { this.handlers.set(type, callback); }
  closest() { return null; }
  scrollIntoView() {}
  getBoundingClientRect() { return { left: 0, width: 600 }; }
}

function harness(kind = 'quake', { rebuildChartOnPause = false } = {}) {
  const data = kind === 'quake' ? quake : mangkhut, task = tasks[kind], nodes = new Map();
  const node = selector => { if (!nodes.has(selector)) nodes.set(selector, new Element()); return nodes.get(selector); };
  const newChart = () => { const svg = new Element('svg'); svg.setAttribute('viewBox', '0 0 290 116'); return svg; };
  let charts = [newChart()], interval, milliseconds=0;
  const current = { route: task.route, timeUtc: task.fromUtc, stationId: task.stationId, loading: false };
  const document = {
    querySelector: node, body: node('body'), addEventListener() {}, createElementNS: (_namespace, tag) => new Element(tag),
    querySelectorAll(selector) {
      if (selector === '#charts svg,#current-insight .sync-chart svg') return charts;
      if (selector === '.demo-a-marker') return charts.flatMap(svg => svg.querySelectorAll(selector));
      return [];
    },
  };
  const context = vm.createContext({ tasks, buildDemoEvidence, createDemoSession:options=>createDemoSession({...options,now:()=>milliseconds}), document, Intl, Date, Math, Number, String, Object,
    innerWidth: 1000, matchMedia: () => ({ matches: true }), window: { addEventListener() {} },
    setInterval(callback) { interval = callback; return 1; }, clearInterval() {},
  });
  const source = fs.readFileSync(new URL('../app/demo-workbench.js', import.meta.url), 'utf8').replace(/^import[^\n]*\n/gm, '').replaceAll('export function ', 'function ');
  vm.runInContext(source, context, { filename: 'actual-demo-workbench.js' });
  const workbench = context.setupDemoWorkbench({
    prepare: async () => ({ data, ticks: kind === 'quake' ? data.stations[0].samples.map(sample => sample.timeUtc) : makeClockTicks(data) }),
    seek: async timeUtc => { current.timeUtc = timeUtc; return true; },
    pause() { if (rebuildChartOnPause) charts = [newChart()]; },
    context: () => current, narrate() {}, sources() {},
  });
  return { workbench, node, current, chart: () => charts[0], refresh: () => interval(),now:value=>milliseconds=value };
}

test('completed and narrated real processes keep the Earth visible until comparison is explicitly requested', async () => {
  const h=harness();await h.workbench.open('quake');h.now(17000);await h.workbench.session.tick();
  assert.equal(h.workbench.session.snapshot().status,'complete');
  assert.equal(h.node('#demo-compare-view').hidden,true);
  assert.equal(h.node('body').classList.contains('demo-compare-mode'),false);
  h.node('body').classList.add('narration-active');h.refresh();
  assert.equal(h.node('#demo-compare-view').hidden,true);
  assert.equal(h.node('#demo-deltas').dataset.observedTime,h.current.timeUtc);
});

test('manual B before A clears old comparison times and source evidence, then valid B can recover', async () => {
  const h = harness(); await h.workbench.open('quake'); h.workbench.session.pause();
  h.current.timeUtc = tasks.quake.toUtc; h.refresh();
  assert.equal(h.node('#demo-deltas').dataset.observedTime, tasks.quake.toUtc);
  assert.match(h.node('#demo-source-evidence').innerHTML, /源行/);
  h.current.timeUtc = '2011-03-11T05:45:01Z'; h.refresh();
  assert.equal(h.node('#demo-deltas').dataset.observedTime, undefined);
  assert.equal(h.node('#demo-compare-view').dataset.observedTime, undefined);
  assert.match(h.node('#demo-clock-b').textContent, /13:45:01/);
  assert.match(h.node('#demo-source-evidence').textContent, /2011-03-11T05:45:01Z/);
  assert.match(h.node('#demo-source-evidence').textContent, /尚未生成/);
  assert.doesNotMatch(h.node('#demo-source-evidence').innerHTML, /源行|IU\.MAJO|2011-03-11T05:49:20Z/);
  assert.match(h.node('#demo-deltas').innerHTML, /结束时间不能早于开始时间/);
  assert.doesNotMatch(h.node('#demo-compare-content').innerHTML, /<svg/);
  h.current.timeUtc = tasks.quake.toUtc; h.refresh();
  assert.equal(h.node('#demo-deltas').dataset.observedTime, tasks.quake.toUtc);
  assert.match(h.node('#demo-source-evidence').innerHTML, /源行/);
});

test('leaving for a principle route without any observed timestamp closes the old workbench', async () => {
  const h = harness(); await h.workbench.open('quake'); h.workbench.session.pause();
  assert.equal(h.workbench.session.snapshot().active, true);
  h.current.route = 'orbital'; h.current.timeUtc = null; h.current.loading = false; h.refresh();
  assert.equal(h.workbench.session.snapshot().active, false);
  assert.equal(h.node('#demo-workbench').hidden, true);
  assert.equal(h.node('#demo-stage-tabs').hidden, true); assert.equal(h.node('#demo-delta-panel').hidden, true);
  assert.equal(h.node('body').classList.contains('demo-active'), false);
  assert.equal(h.chart().querySelectorAll('.demo-a-marker').length, 0);
});

test('pausing after a same-time chart rebuild restores one A marker without duplicating it', async () => {
  const h = harness('mangkhut', { rebuildChartOnPause: true }); await h.workbench.open('mangkhut');
  const original = h.chart(); assert.equal(original.querySelectorAll('.demo-a-marker').length, 1);
  const time = h.node('#demo-deltas').dataset.observedTime;
  h.workbench.session.pause();
  assert.notEqual(h.chart(), original, 'the real root pause path recreates the observation chart SVG');
  assert.equal(h.chart().querySelectorAll('.demo-a-marker').length, 1);
  assert.equal(h.node('#demo-deltas').dataset.observedTime, time);
  h.refresh(); h.refresh();
  assert.equal(h.chart().querySelectorAll('.demo-a-marker').length, 1);
  const marker = h.chart().querySelectorAll('.demo-a-marker')[0];
  assert.equal(marker.children.find(child => child.tagName === 'text').textContent, 'A');
});

test('observed waveform paths break at nulls and absent seconds while preserving measured zero', () => {
  const sample = (second, value) => ({ timeUtc: new Date(Date.UTC(2011, 2, 11, 5, 46, second)).toISOString(), value });
  const values = [sample(1, 2), sample(2, -3), sample(3, null), sample(4, 5), sample(6, -1), sample(7, 0)];
  const original = structuredClone(values), path = observedWavePath(values, 5);
  assert.deepEqual(path.match(/[ML]/g), ['M', 'L', 'M', 'M', 'L']);
  assert.match(path, /L595\.00,74\.00$/, 'a reported zero remains an actual point on the baseline');
  assert.doesNotMatch(path, /NaN|Infinity/); assert.deepEqual(values, original);
});
