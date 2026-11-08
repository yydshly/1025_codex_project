import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { makeClockTicks, synchronizedSnapshot, indexAtOrBefore, utcMillis } from '../app/sync-timeline.js';
import { selectCloudChange } from '../app/sync-change-data.js';
import { observedCloudComparison } from '../app/observed-cloud-comparison.js';

// Execute the production controller functions, not a second implementation of playback.
// The DOM and image transport are stubbed; separate layer tests cover real cache / GPU resources.
const source = fs.readFileSync(new URL('../app/globe-app.js', import.meta.url), 'utf8');
function productionFunction(name) {
  const oneLine = source.match(new RegExp('^(?:async )?function ' + name + '\\([^\\n]*\\)\\{[^\\n]*\\}\\r?$', 'm'));
  if (oneLine) return oneLine[0];
  const multiline = source.match(new RegExp('^(?:async )?function ' + name + '\\([^\\n]*\\)\\{[\\s\\S]*?^\\}', 'm'));
  assert.ok(multiline, 'Production function was not found: ' + name);
  return multiline[0];
}
const functions = ['changesActive', 'selectSyncTime', 'toggleSyncPlayback', 'synchronizedCloudComparison', 'preloadSynchronizedFrames', 'updateSynchronizedImagery', 'updateSynchronizedChanges', 'advanceSynchronizedPlayback'].map(productionFunction).join('\n');
const rawRegistration = source.split(/\r?\n/).find(line => line.startsWith("for(const mode of ['fusion','raw'])$('#cloud-'+mode).addEventListener"));
assert.ok(rawRegistration, 'Production presentation-mode handlers must remain covered.');
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const flush = () => new Promise(resolve => setImmediate(resolve));
const times = Array.from({ length: 5 }, (_, i) => `2018-09-16T00:${String(i * 10).padStart(2, '0')}:00Z`);

function harness(options = {}) {
  const events = [], elements = new Map();
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      hidden: false, open: false, textContent: '', innerHTML: '', handlers: {}, dataset: {},
      addEventListener(type, fn) { this.handlers[type] = fn; },
    });
    return elements.get(selector);
  };
  const cloudFrames = times.filter(time => !options.missingClouds?.includes(time)).map(timeUtc => ({ timeUtc, url: 'cloud-' + timeUtc, scanStartUtc: timeUtc, scanEndUtc: timeUtc }));
  const bundle = { startUtc: times[0], endUtc: times.at(-1), clouds: { bbox: [85, -10, 165, 55], frames: cloudFrames, maxAgeMinutes: 0 }, series: [] };
  const pairs = times.slice(1).filter((time, i) => cloudFrames.some(f => f.timeUtc === time) && cloudFrames.some(f => f.timeUtc === times[i])).map(timeUtc => ({ timeUtc, fromTimeUtc: times[times.indexOf(timeUtc) - 1], url: 'change-' + timeUtc }));
  const manifest = { frames: pairs };
  let context;
  const engine = {
    setArchiveIndex(index) { events.push(['center', index]); },
    setSyncReadings() {},
    setSyncPresentation(mode) { events.push(['presentation', mode]); },
    setSyncChangeEnabled(enabled) { events.push(['change-enabled', enabled]); if (!enabled) this.clearSyncChange(); },
    clearSyncChange() { events.push(['clear-change']); },
    setSyncFrame(frame) {
      events.push(['bind-cloud', frame?.timeUtc ?? null]);
      return options.cloudLoad?.(frame) ?? Promise.resolve(true);
    },
    setSyncChangeFrame(frame) {
      events.push(['bind-change', frame.timeUtc]);
      return options.changeLoad?.(frame) ?? Promise.resolve(true);
    },
    preloadSyncFrames(frames) {
      events.push(['prepare-cloud', frames.map(frame => frame.timeUtc)]);
      return options.prepareCloud?.(frames) ?? Promise.resolve(frames.map(() => true));
    },
    preloadSyncChange(pair) {
      events.push(['prepare-change', pair?.timeUtc ?? null]);
      return options.prepareChange?.(pair) ?? Promise.resolve(Boolean(pair));
    },
  };
  context = vm.createContext({
    Promise, console, engine, $: element, active: true, syncEnabled: true, observedPresentation:null,
    state: { running: true }, syncPresentation: 'fusion', changeEnabled: true,
    syncBundle: bundle, syncIndex: 1, syncSnapshot: synchronizedSnapshot(bundle, 1),
    syncAdvanceToken: 0, syncAdvancePending: false, archiveAccumulator: 0, archiveIndex: 1,
    syncCloudReady: Promise.resolve(), syncImageRequest: 0, syncRenderedFrame: times[1], imageryStatus: 'loaded',
    changeBundle: manifest, changeImageRequest: 0, changeRenderedFrame: times[1], changeStatus: 'loaded',
    archive: { dataset: { records: times.map(timeUtc => ({ timeUtc })) } },
    makeClockTicks, synchronizedSnapshot, indexAtOrBefore, utcMillis, selectCloudChange, observedCloudComparison,
    localClock: time => new Date(time).toISOString().slice(11, 16), sampleValue: () => '',
    syncActive: () => context.active,
    loadCloudChanges: () => (options.manifestLoad?.() ?? Promise.resolve(manifest)).then(data => { context.changeBundle = data; return data; }),
    updateSynchronizedUi: () => events.push(['commit', context.syncIndex, context.syncSnapshot.timeUtc]),
    updateSynchronizedControls: () => {}, updateCloudPresentationUi: () => {},
  });
  vm.runInContext(functions + '\n' + rawRegistration, context, { filename: 'extracted-globe-app-controller.js' });
  return { context, events, engine, element, manifest, bundle, commits: () => events.filter(event => event[0] === 'commit'), binds: () => events.filter(event => event[0] === 'bind-change') };
}

test('automatic playback waits for both real images before committing the next common clock', async () => {
  const cloud = deferred(), change = deferred();
  const h = harness({ prepareCloud: frames => frames.length === 1 ? cloud.promise : Promise.resolve([]), prepareChange: pair => pair?.timeUtc === times[2] ? change.promise : Promise.resolve(true) });
  const work = h.context.advanceSynchronizedPlayback();
  await flush();
  assert.equal(h.context.syncIndex, 1); assert.equal(h.context.syncAdvancePending, true); assert.equal(h.commits().length, 0);
  assert.ok(h.events.some(event => event[0] === 'prepare-cloud'));
  assert.ok(h.events.some(event => event[0] === 'prepare-change' && event[1] === times[2]));
  cloud.resolve([true]); await flush();
  assert.equal(h.commits().length, 0, 'main cloud alone cannot advance the clock');
  change.resolve(true); await work; await flush();
  assert.equal(h.context.syncIndex, 2); assert.equal(h.commits().length, 1);
  assert.equal(h.context.syncSnapshot.timeUtc, '2018-09-16T00:20:00.000Z');
  assert.equal(h.context.syncRenderedFrame, times[2]); assert.equal(h.context.changeRenderedFrame, times[2]);
  assert.equal(h.element('#earth-view').dataset.observedTime, h.context.syncSnapshot.timeUtc);
  assert.equal(h.context.syncAdvancePending, false);
});

test('pause through the actual controller invalidates a prepared-but-uncommitted step', async () => {
  const cloud = deferred(), h = harness({ prepareCloud: () => cloud.promise });
  const work = h.context.advanceSynchronizedPlayback();
  h.context.toggleSyncPlayback();
  assert.equal(h.context.state.running, false);
  cloud.resolve([true]); await work;
  assert.equal(h.commits().length, 0); assert.equal(h.context.syncIndex, 1); assert.equal(h.context.syncAdvancePending, false);
});

test('leaving the mode or opening a report during preparation prevents a late clock commit', async () => {
  for (const mutation of [h => { h.context.active = false; }, h => { h.element('#comparison-dialog').open = true; }]) {
    const cloud = deferred(), h = harness({ prepareCloud: () => cloud.promise });
    const work = h.context.advanceSynchronizedPlayback(); mutation(h);
    cloud.resolve([true]); await work;
    assert.equal(h.commits().length, 0); assert.equal(h.context.syncIndex, 1);
  }
});

test('a manual seek wins over a pending automatic step, even when playback resumes immediately', async () => {
  const cloud = deferred(), h = harness({ prepareCloud: frames => frames.length === 1 && frames[0].timeUtc === times[2] ? cloud.promise : Promise.resolve([]) });
  const work = h.context.advanceSynchronizedPlayback();
  h.context.selectSyncTime(3);
  assert.equal(h.context.state.running, false); assert.equal(h.context.syncIndex, 3);
  h.context.state.running = true;
  cloud.resolve([true]); await work; await flush();
  assert.equal(h.commits().length, 1); assert.equal(h.commits()[0][1], 3);
  assert.equal(h.context.syncIndex, 3); assert.equal(h.context.syncRenderedFrame, times[3]);
});

test('raw presentation handler cancels automatic work and hides changes without changing the clock', async () => {
  const cloud = deferred(), h = harness({ prepareCloud: () => cloud.promise });
  const work = h.context.advanceSynchronizedPlayback();
  h.element('#cloud-raw').handlers.click();
  assert.equal(h.context.syncPresentation, 'raw'); assert.equal(h.context.changeStatus, 'off');
  assert.equal(h.element('#sync-change-status').hidden, true);
  cloud.resolve([true]); await work;
  assert.equal(h.commits().length, 0); assert.equal(h.context.syncIndex, 1);
  assert.ok(h.events.some(event => event[0] === 'change-enabled' && event[1] === false));
});

test('an obsolete preparation does not reset the pending flag owned by a newer operation', async () => {
  const cloud = deferred(), h = harness({ prepareCloud: () => cloud.promise });
  const work = h.context.advanceSynchronizedPlayback();
  ++h.context.syncAdvanceToken; h.context.syncAdvancePending = true;
  cloud.resolve([true]); await work;
  assert.equal(h.context.syncAdvancePending, true); assert.equal(h.commits().length, 0);
});

test('a slow main cloud clears the old overlay immediately and blocks an already available change image', async () => {
  const cloud = deferred(), h = harness();
  h.context.imageryStatus = 'loading'; h.context.syncCloudReady = cloud.promise;
  const work = h.context.updateSynchronizedChanges();
  await flush();
  assert.ok(h.events.some(event => event[0] === 'clear-change'));
  assert.equal(h.binds().length, 0); assert.equal(h.context.changeStatus, 'loading'); assert.equal(h.context.changeRenderedFrame, null);
  h.context.imageryStatus = 'loaded'; cloud.resolve(); await work;
  assert.equal(h.binds().length, 1); assert.equal(h.binds()[0][1], times[1]);
  assert.equal(h.context.changeStatus, 'loaded'); assert.equal(h.context.changeRenderedFrame, times[1]);
});

test('failed main imagery never binds a change overlay, even when its pair is present', async () => {
  const cloud = deferred(), h = harness();
  h.context.imageryStatus = 'loading'; h.context.syncCloudReady = cloud.promise;
  const work = h.context.updateSynchronizedChanges();
  h.context.imageryStatus = 'failed'; cloud.resolve(); await work;
  assert.equal(h.binds().length, 0); assert.equal(h.context.changeStatus, 'failed'); assert.equal(h.context.changeRenderedFrame, null);
});

test('raw switch during main-cloud loading prevents a late overlay, and fusion reuses the same readiness promise', async () => {
  const cloud = deferred(), h = harness();
  h.context.imageryStatus = 'loading'; h.context.syncCloudReady = cloud.promise;
  const older = h.context.updateSynchronizedChanges();
  h.element('#cloud-raw').handlers.click();
  h.element('#cloud-fusion').handlers.click();
  await flush(); assert.equal(h.binds().length, 0);
  h.context.imageryStatus = 'loaded'; cloud.resolve(); await older; await flush();
  assert.equal(h.binds().length, 1, 'only the newest fusion request may bind');
  assert.equal(h.context.changeStatus, 'loaded'); assert.equal(h.context.changeRenderedFrame, times[1]);
});

test('a seek invalidates a late main-ready callback instead of attaching its prior pair to a new clock', async () => {
  const oldCloud = deferred(), h = harness();
  h.context.imageryStatus = 'loading'; h.context.syncCloudReady = oldCloud.promise;
  const oldWork = h.context.updateSynchronizedChanges();
  h.context.selectSyncTime(3);
  await flush();
  assert.equal(h.context.changeRenderedFrame, times[3]);
  oldCloud.resolve(); await oldWork;
  assert.deepEqual(h.binds().map(event => event[1]), [times[3]]);
  assert.equal(h.context.changeRenderedFrame, times[3]);
});

test('a superseded change-image completion cannot overwrite the newest report time or status', async () => {
  const oldImage = deferred(), h = harness({ changeLoad: pair => pair.timeUtc === times[1] ? oldImage.promise : Promise.resolve(true) });
  const oldWork = h.context.updateSynchronizedChanges(); await flush();
  h.context.selectSyncTime(3); await flush();
  assert.equal(h.context.changeRenderedFrame, times[3]);
  oldImage.resolve(true); await oldWork;
  assert.equal(h.context.changeRenderedFrame, times[3]); assert.equal(h.context.changeStatus, 'loaded');
  assert.match(h.element('#sync-change-status').innerHTML, /00:20 → 00:30/);
});

test('no exact adjacent pair clears the layer at the first frame, the missing frame and the frame following it', async () => {
  for (const index of [0, 2, 3]) {
    const h = harness({ missingClouds: [times[2]] });
    h.context.syncIndex = index; h.context.syncSnapshot = synchronizedSnapshot(h.bundle, index);
    h.context.imageryStatus = index === 2 ? 'unavailable' : 'loaded';
    await h.context.updateSynchronizedChanges();
    assert.equal(h.binds().length, 0); assert.equal(h.context.changeStatus, 'unavailable'); assert.equal(h.context.changeRenderedFrame, null);
    assert.ok(h.events.some(event => event[0] === 'clear-change'));
  }
});

test('late manifest loading cannot re-enable changes after leaving synchronized mode', async () => {
  const manifest = deferred(), h = harness({ manifestLoad: () => manifest.promise });
  h.context.changeBundle = null;
  const work = h.context.updateSynchronizedChanges();
  h.context.active = false;
  await h.context.updateSynchronizedChanges();
  manifest.resolve(h.manifest); await work;
  assert.equal(h.binds().length, 0); assert.equal(h.context.changeStatus, 'off'); assert.equal(h.element('#sync-change-status').hidden, true);
});
