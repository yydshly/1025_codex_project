import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { dynamicEvents } from '../app/dynamic-events.js';
import { stormCoastlineSource } from '../app/storm-geography.js';
import { observedStory } from '../app/observed-story.js';
import { observedMoments } from '../app/observed-presentation.js';
import { dynamicSnapshot, dynamicTicks } from '../app/dynamic-data.js';
import { formatRiverElapsed } from '../app/river-evidence.js';
import { makeClockTicks } from '../app/sync-timeline.js';
import { cloudReference, cloudReferenceColor, sceneEvidence, supportsSceneEvidence } from '../app/scene-evidence.js';

const read = filename => JSON.parse(fs.readFileSync(new URL('../app/data/' + filename, import.meta.url), 'utf8'));
const sources = {
  ...Object.fromEntries(Object.entries(dynamicEvents).filter(([, event]) => !event.localOnly || fs.existsSync(new URL('../app/' + event.url, import.meta.url))).map(([slug, event]) => ['dynamic-' + slug, read(event.url.slice(5))])),
  'typhoon-real': read('mangkhut-synchronized.json'),
};
const camel = value => value.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
function deferred() { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; }

class Element {
  constructor(tag = 'div') {
    this.tagName = tag; this.dataset = {}; this.attributes = new Map(); this.children = []; this.handlers = new Map(); this.hidden = false; this.paused = true; this._html = ''; this._text = '';
    const classes = new Set();
    this.classList = { add: (...names) => names.forEach(name => classes.add(name)), remove: (...names) => names.forEach(name => classes.delete(name)), contains: name => classes.has(name), toggle(name, force = !classes.has(name)) { if (force) classes.add(name); else classes.delete(name); return force; } };
  }
  set innerHTML(value) {
    this._html = String(value); this._text = ''; this.children = [];
    for (const match of this._html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
      const button = new Element('button');
      for (const attribute of match[1].matchAll(/([\w:-]+)="([^"]*)"/g)) button.setAttribute(attribute[1], attribute[2]);
      button._html = match[2]; this.append(button);
    }
  }
  get innerHTML() { return this._html; }
  set textContent(value) { this._text = String(value); this._html = ''; this.children = []; }
  get textContent() { return this._text || this._html.replace(/<[^>]*>/g, ''); }
  setAttribute(key, value) { this.attributes.set(key, String(value)); if (key.startsWith('data-')) this.dataset[camel(key.slice(5))] = String(value); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  append(...items) { for (const item of items) { item.parent = this; this.children.push(item); } }
  replaceChildren(...items) { this.children = []; this._html = ''; this._text = ''; this.append(...items); }
  addEventListener(type, callback) { this.handlers.set(type, callback); }
  closest(selector) { const key = /^\[data-([\w-]+)\]$/.exec(selector)?.[1]; if (key && this.dataset[camel(key)] !== undefined) return this; return this.parent?.closest(selector) ?? null; }
}

async function harness(route = 'dynamic-quake', { seek, fetchFeatures } = {}) {
  const nodes = new Map(), stories = [], requests = [], selections = [], order = [], windowEvents = new Map();
  const node = selector => { if (!nodes.has(selector)) nodes.set(selector, new Element()); return nodes.get(selector); };
  let evidenceNodes = [], narrated = 0, interval;
  const data = sources[route], start = observedMoments[route][0][0], river = data.kind === 'river';
  const current = {
    route, data, timeUtc: river ? null : start, elapsedSeconds: river ? start : null,
    snapshot: river ? dynamicSnapshot(data, start) : null,
    stationId: river ? data.transects[0].id : route === 'dynamic-quake' ? 'IU.MAJO.00.BHZ' : null,
    loading: false,
  };
  const walk = element => [element, ...element.children.flatMap(walk)];
  const document = {
    querySelector: node, body: node('body'), createElement: tag => new Element(tag),
    querySelectorAll(selector) {
      if (selector === '.story-evidence-focus,.story-guide-focus') {
        return [...nodes.values(), ...evidenceNodes].flatMap(walk).filter(element =>
          element.classList.contains('story-evidence-focus') || element.classList.contains('story-guide-focus'));
      }
      if (selector.startsWith('[data-story-target]')) return evidenceNodes;
      if (selector === '#readouts,#charts .dynamic-chart') return [node('#readouts'), ...evidenceNodes.filter(element => element.classList.contains('dynamic-chart'))];
      if (selector === '#story-location-list button') return node('#story-location-list').children;
      return [];
    },
  };
  const context = vm.createContext({ observedStory, dynamicEvents, stormCoastlineSource, formatRiverElapsed, document, Intl, Date, Math, Number, String, Object, AbortController,
    cloudReference, cloudReferenceColor, sceneEvidence, supportsSceneEvidence,
    createSceneEvidence: () => ({ show() {}, hide() {}, pending() {} }),
    fetch: fetchFeatures ?? (async () => ({ ok: true, json: async () => ({ schemaVersion: 1, events: {} }) })),
    setInterval(callback) { interval = callback; return 1; }, clearInterval() {},
    window: { addEventListener: (name, callback) => windowEvents.set(name, callback) },
  });
  const source = fs.readFileSync(new URL('../app/observed-presentation.js', import.meta.url), 'utf8').replace(/^import[^\n]*\n/gm, '').replaceAll('export const ', 'const ').replaceAll('export function ', 'function ');
  vm.runInContext(source, context, { filename: 'actual-observed-presentation.js' });
  const controller = context.setupObservedPresentation({
    context: () => current, setStory: value => stories.push(value), narration: () => ({ active: false }),
    async seek(time, options) {
      requests.push({ timeUtc: time, ...options }); order.push('seek:' + time);
      if (seek) return seek(time, options);
      if (options.signal.aborted) return false;
      if (current.data.kind === 'river') {
        current.elapsedSeconds = time; current.snapshot = dynamicSnapshot(current.data, time);
      } else {
        current.timeUtc = time;
      }
      return true;
    },
    selectStation(id) { selections.push(id); order.push('station:' + id); current.stationId = id; }, narrate() { narrated++; },
  });
  // Let the feature request settle before assertions about same-frame refreshes.
  for (let i = 0; i < 10; i++) await Promise.resolve();
  controller.refresh();
  const click = (selector, target = node(selector)) => node(selector).handlers.get('click')?.({ target });
  return { controller, node, current, stories, requests, selections, order, click, refresh: () => interval(), narrated: () => narrated, pagehide: () => windowEvents.get('pagehide')(), setEvidence: values => { evidenceNodes = values; } };
}

test('loading removes annotations once and restores the same committed UTC frame after loading ends', async () => {
  const h = await harness();
  const original = h.stories.at(-1), originalUtc = h.current.timeUtc;
  assert.ok(original); assert.equal(original.timeUtc, originalUtc);
  h.current.loading = true; h.refresh();
  assert.equal(h.stories.at(-1), null); const count = h.stories.length;
  h.refresh(); assert.equal(h.stories.length, count, 'waiting must not rebuild or repeatedly clear the layer');
  assert.match(h.node('#story-sync-status').textContent, /等待/);
  h.current.loading = false; h.refresh();
  assert.equal(h.current.timeUtc, originalUtc); assert.equal(h.stories.length, count + 1);
  assert.equal(h.stories.at(-1).timeUtc, originalUtc);
  assert.equal(h.node('#observed-story-band').dataset.observedTime, originalUtc);
  assert.equal(h.node('#observed-story-band').hidden, false);
  assert.match(h.node('#story-sync-status').textContent, /同刻/);
});

test('scan comparison legend matches the committed time and disappears during a seek or gap', async () => {
  const h = await harness('dynamic-volcano');
  h.current.timeUtc = '2022-01-15T04:20:00.000Z';
  h.current.cloudComparison = { status: 'visible', fromTimeUtc: '2022-01-15T04:10:00Z', timeUtc: '2022-01-15T04:20:00Z', operator: '<', thresholdK: 220 };
  h.refresh();
  assert.equal(h.node('#story-cloud-key').hidden, false);
  assert.match(h.node('#story-geometry-note').textContent, /04:10 → 04:20 UTC · 亮温 < 220 K/);
  assert.equal(h.controller.getExportContext().scanComparison.fromTimeUtc, h.current.cloudComparison.fromTimeUtc);
  h.current.loading = true; h.refresh();
  assert.equal(h.node('#story-cloud-key').hidden, true);
  h.current.loading = false;
  h.current.timeUtc = '2022-01-15T04:30:00Z';
  h.refresh();
  assert.equal(h.node('#story-cloud-key').hidden, true, 'stale graphics must not have a visible comparison key');
  assert.equal(h.controller.getExportContext().scanComparison, null);
  h.current.cloudComparison = { status: 'unavailable', timeUtc: h.current.timeUtc }; h.refresh();
  assert.match(h.node('#story-geometry-note').textContent, /无可用的相邻扫描/);
});

test('annotation toggles and station focus cannot revive old evidence while its replacement is loading', async () => {
  const h = await harness(); h.current.loading = true; h.refresh();
  const count = h.stories.length;
  await h.click('#story-annotations'); await h.click('#story-annotations');
  assert.deepEqual(h.stories.slice(count), [null, null]);
  h.controller.focus('IU.INCN.00.BHZ'); assert.equal(h.selections.length, 0);
  h.current.loading = false; h.refresh(); assert.ok(h.stories.at(-1));
  assert.equal(h.stories.at(-1).timeUtc, h.current.timeUtc);
});

test('a failed displayed frame cannot restore old contours or claim globe/chart synchronization at the retained clock', async () => {
  const h = await harness('dynamic-storm'), committedUtc = h.current.timeUtc;
  assert.ok(h.stories.at(-1));
  h.current.loading = true; h.current.displayReady = false; h.refresh();
  assert.equal(h.stories.at(-1), null);
  h.current.loading = false; h.current.displayFailed = true; h.refresh();
  const count = h.stories.length;
  h.refresh();
  assert.equal(h.stories.length, count, 'failure must not rebuild a story from a retained metadata clock');
  assert.equal(h.stories.at(-1), null);
  assert.equal(h.current.timeUtc, committedUtc, 'the last committed observation clock and readings remain unchanged');
  assert.equal(h.node('#observed-story-band').dataset.observedTime, undefined);
  assert.equal(h.node('#story-location-list').hidden, true);
  assert.match(h.node('#story-headline').textContent, /未能显示/);
  assert.doesNotMatch(h.node('#story-sync-status').textContent, /卫星扫描 \/ 中心分析分列/);
  await h.click('#story-annotations'); await h.click('#story-annotations');
  assert.equal(h.stories.at(-1), null, 'toggling annotations must not bypass failed display readiness');
  h.current.displayReady = true; h.current.displayFailed = false; h.refresh();
  assert.equal(h.stories.at(-1).timeUtc, committedUtc);
  assert.equal(h.node('#story-location-list').hidden, false);
  assert.match(h.node('#story-sync-status').textContent, /卫星扫描 \/ 中心分析分列/);
});

test('Mangkhut cloud gaps and load failures leave ground readings intact without a same-time cloud claim', async () => {
  for (const failed of [false, true]) {
    const h = await harness('typhoon-real'), originalUtc = h.current.timeUtc;
    h.current.displayReady = false; h.current.displayFailed = failed; h.refresh();
    assert.equal(h.stories.at(-1), null);
    assert.equal(h.current.timeUtc, originalUtc);
    assert.equal(h.node('#story-location-list').hidden, true);
    assert.match(h.node('#story-summary').textContent, /地面观测保留各自记录时刻/);
    assert.match(h.node('#story-sync-status').textContent, failed ? /暂不声明同刻联动/ : /云图缺档/);
    assert.equal(h.node('#observed-story-band').dataset.observedTime, undefined);
    h.current.route = 'unknown'; h.current.data = null; h.refresh();
    assert.equal(h.node('#observed-story-band').hidden, true);
  }
});

test('clear, a route change and narration each abort an in-flight key-moment seek before its late completion', async () => {
  for (const action of ['clear', 'route', 'narrate']) {
    const pending = deferred(), h = await harness('typhoon-real', { seek: () => pending.promise });
    const selecting = h.click('#observed-keyframes', h.node('#observed-keyframes').children[1]);
    assert.equal(h.requests.length, 1); const signal = h.requests[0].signal;
    if (action === 'clear') h.controller.clear();
    if (action === 'route') { Object.assign(h.current, { route: 'dynamic-storm', data: sources['dynamic-storm'], timeUtc: observedMoments['dynamic-storm'][0][0], loading: true }); h.refresh(); }
    if (action === 'narrate') await h.click('#story-narrate');
    assert.equal(signal.aborted, true, `${action} must revoke the old key-moment intent immediately`);
    const count = h.stories.length; pending.resolve(true); await selecting;
    assert.equal(h.stories.length, count, 'late completion must not refresh or restore an old annotation set');
    if (action === 'narrate') assert.equal(h.narrated(), 1);
  }
});

test('every key-moment uses an actual source tick, and a station-specific moment selects its real station before seeking', async () => {
  for (const [route, moments] of Object.entries(observedMoments)) {
    const data = sources[route]; if(!data) continue;
    const river = data.kind === 'river', elapsed = ['river','battery','engine'].includes(data.kind);
    const sourceTicks = route === 'typhoon-real' ? makeClockTicks(data) : dynamicTicks(data);
    const ticks = new Set(elapsed ? sourceTicks : sourceTicks.map(Date.parse));
    for (const [time, _label, stationId] of moments) {
      assert.ok(ticks.has(elapsed ? time : Date.parse(time)), `${route} ${time} is not an actual available tick`);
      if (!stationId) continue;
      if (river) {
        const section = data.transects.find(item => item.id === stationId);
        assert.ok(section?.banks.some(bank => bank.samples.some(sample => sample.elapsedSeconds === time)), 'transect moment must point to a real bank sample');
      } else {
        const station = data.stations.find(value => value.id === stationId);
        assert.ok(station?.samples.some(sample => sample.timeUtc === time), 'station moment must point to a real sample window');
      }
    }
  }
  const h = await harness('dynamic-quake');
  await h.click('#observed-keyframes', h.node('#observed-keyframes').children[3]);
  assert.deepEqual(h.order, ['station:IU.INCN.00.BHZ', 'seek:2011-03-11T05:54:31Z']);
  assert.equal(h.current.stationId, 'IU.INCN.00.BHZ');
  assert.equal(h.stories.at(-1).timeUtc, '2011-03-11T05:54:31Z');
  assert.ok(h.stories.at(-1).pins.some(pin => pin.target === 'IU.INCN.00.BHZ'));
});

test('Big Piney key moments select a real transect and commit the exact release-relative reading', async () => {
  const route = 'dynamic-river-big-piney', h = await harness(route);
  const [elapsedSeconds, , stationId] = observedMoments[route][3];
  const chart = new Element();
  chart.dataset.series = stationId;
  h.setEvidence([chart]);
  await h.click('#observed-keyframes', h.node('#observed-keyframes').children[3]);
  assert.deepEqual(h.order, ['station:t3', 'seek:12870']);
  assert.equal(h.requests[0].timeUtc, elapsedSeconds, 'elapsed seconds stay numeric');
  assert.equal(h.current.timeUtc, null);
  assert.equal(h.current.elapsedSeconds, elapsedSeconds);
  assert.equal(h.current.stationId, stationId);
  assert.equal(h.stories.at(-1).elapsedSeconds, elapsedSeconds);
  const bank = sources[route].transects[2].banks.find(item => item.bank === 'left');
  assert.equal(h.current.snapshot.readings.find(item => item.id === bank.id).value, bank.sustainedSignal.value);
  assert.match(h.node('#story-headline').textContent, /断面 3左岸.*持续抬升/);
  assert.match(h.node('#story-sync-status').textContent, /\+03:34:30.*同刻/);
  assert.doesNotMatch(h.node('#story-sync-status').textContent, /UTC/);
  assert.equal(chart.classList.contains('story-evidence-focus'), true);
});

test('a second key-moment cancels the first; the first late result cannot reset annotations or selected time', async () => {
  const first = deferred(), second = deferred(); let calls = 0;
  const h = await harness('dynamic-storm', { seek: () => ++calls === 1 ? first.promise : second.promise });
  const old = h.click('#observed-keyframes', h.node('#observed-keyframes').children[1]);
  const newest = h.click('#observed-keyframes', h.node('#observed-keyframes').children.at(-1));
  assert.equal(h.requests[0].signal.aborted, true); assert.equal(h.requests[1].signal.aborted, false);
  h.current.timeUtc = h.requests[1].timeUtc; second.resolve(true); await newest;
  assert.equal(h.stories.at(-1).timeUtc, '2022-09-05T13:30:00Z');
  const count = h.stories.length; first.resolve(true); await old;
  assert.equal(h.stories.length, count); assert.equal(h.current.timeUtc, '2022-09-05T13:30:00Z');
});

test('selected evidence focus is reapplied to newly rebuilt chart DOM at the same committed time', async () => {
  const h = await harness('dynamic-storm');
  const chart = target => { const element = new Element(); element.dataset.series = target; return element; };
  const old = chart('pressureHpa'); h.setEvidence([old]); h.controller.focus('pressureHpa');
  assert.equal(old.classList.contains('story-evidence-focus'), true);
  const replacement = chart('pressureHpa'), other = chart('windKt'); h.setEvidence([replacement, other]);
  const count = h.stories.length; h.refresh();
  assert.equal(h.stories.length, count, 'same-time chart rebuild should not require a new story or geometry');
  assert.equal(replacement.classList.contains('story-evidence-focus'), true);
  assert.equal(other.classList.contains('story-evidence-focus'), false);
  h.controller.clear(); assert.equal(replacement.classList.contains('story-evidence-focus'), false);
});

test('the committed river station and chart take precedence over a guided focus for another station', async () => {
  const h = await harness('dynamic-river-big-piney');
  const t1 = new Element(), t2 = new Element();
  t1.dataset.series = 't1'; t2.dataset.series = 't2';
  h.setEvidence([t1, t2]);
  h.controller.setNarrationFocus({route:h.current.route,key:'river/2/0',target:'t2',label:'断面二',atAnchor:true});
  assert.equal(t1.classList.contains('story-evidence-focus'), true);
  assert.equal(t2.classList.contains('story-guide-focus'), false);
  h.current.stationId = 't2';
  h.refresh();
  assert.equal(t2.classList.contains('story-guide-focus'), true);
  assert.equal(h.node('#observed-story-band').dataset.narrationTarget, 't2');
  assert.equal(h.node('#observed-story-band').dataset.observedTime, h.current.elapsedSeconds);
});


test('failed contour request exposes a retry and recovers the same actual frame without moving its clock', async () => {
  let calls = 0;
  const features = read('observed-change-features.json');
  const h = await harness('dynamic-volcano', { fetchFeatures: async () => {
    if (++calls === 1) throw new Error('temporary network failure');
    return { ok: true, json: async () => features };
  } });
  h.current.timeUtc = '2022-01-15T07:50:00Z'; h.refresh();
  assert.match(h.node('#story-geometry-note').textContent, /参考轮廓未载入/);
  assert.equal(h.node('#story-feature-retry').hidden, false);
  assert.equal(h.controller.getExportContext().referenceContours.status, 'unavailable');
  assert.equal(h.stories.at(-1).lines.length, 0);
  assert.equal(h.stories.at(-1).pins.length, 1, 'real volcano location and statistics remain available');
  const time = h.current.timeUtc;
  await h.click('#story-feature-retry');
  assert.equal(calls, 2); assert.equal(h.current.timeUtc, time); assert.equal(h.requests.length, 0);
  assert.equal(h.node('#story-feature-retry').hidden, true);
  const exported = h.controller.getExportContext();
  assert.equal(exported.timeUtc, time); assert.equal(exported.referenceContours.status, 'available');
  assert.equal(exported.referenceContours.displayed, true);
  assert.equal(exported.referenceContours.eventId, sources['dynamic-volcano'].id);
  assert.equal(exported.referenceContours.manifest.derivedAtUtc, features.derivedAtUtc);
  assert.equal(exported.referenceContours.sourceNumeric.sha256, features.events.volcano.frames.at(-1).sourceNumeric.sha256);
  assert.ok(h.stories.at(-1).lines.length > 0);
  await h.click('#story-annotations');
  assert.equal(h.controller.getExportContext().referenceContours.displayed, false);
  assert.equal(h.controller.getExportContext().timeUtc, null);
});

test('a missing event or zero threshold area is not reported as a network failure or a visible contour', async () => {
  const features = read('observed-change-features.json');
  const h = await harness('dynamic-volcano', { fetchFeatures: async () => ({ ok: true, json: async () => features }) });
  assert.equal(h.controller.getExportContext().referenceContours.status, 'available');
  assert.equal(h.controller.getExportContext().referenceContours.displayed, false);
  assert.match(h.node('#story-geometry-note').textContent, /本帧无符合阈值/);
  h.current.data = { ...h.current.data, id: 'another-event-at-the-same-time' };
  h.controller.clear(); h.refresh();
  assert.equal(h.controller.getExportContext().referenceContours.status, 'unsupported-event');
  assert.equal(h.stories.at(-1).lines.length, 0);
  assert.equal(h.node('#story-feature-retry').hidden, true);
});

test('contour retries share the pending request and a page exit cancels it without restoring annotations', async () => {
  const pending = deferred(); let calls = 0, signal;
  const h = await harness('dynamic-storm', { fetchFeatures: async (_url, options) => {
    calls++; signal = options.signal; return pending.promise;
  } });
  const first = h.click('#story-feature-retry'), second = h.click('#story-feature-retry');
  assert.equal(calls, 1);
  h.pagehide(); assert.equal(signal.aborted, true); const count = h.stories.length;
  pending.resolve({ ok: true, json: async () => read('observed-change-features.json') });
  await Promise.all([first, second]);
  assert.equal(h.stories.length, count); assert.equal(h.stories.at(-1), null);
});
