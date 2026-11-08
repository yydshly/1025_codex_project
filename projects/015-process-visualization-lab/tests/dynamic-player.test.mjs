import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { dynamicEvents, getDynamicEvent, isDeviceEvent } from '../app/dynamic-events.js';
import { formatBatteryElapsed } from '../app/battery-observations.js';
import { validateDynamicEvent, dynamicTicks, dynamicSnapshot, sampleAt } from '../app/dynamic-data.js';

const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const settle = async () => { for (let i = 0; i < 18; i++) await Promise.resolve(); };
const quake = JSON.parse(fs.readFileSync(new URL('../app/data/quake-dynamic.json', import.meta.url), 'utf8'));
const smallQuake = () => ({ ...quake, stations: quake.stations.map(s => ({ ...s, samples: s.samples.slice(0, 3) })), endUtc: quake.stations[0].samples[2].timeUtc });
const imagery = kind => ({ schemaVersion: 1, id: dynamicEvents[kind].id, kind, title: '测试' + kind, subtitle: '仅测试夹具', focus: { lat: -20, lon: -175 }, bbox: [174, -29, 193, -12], startUtc: '2022-01-15T04:00:00Z', endUtc: '2022-01-15T04:20:00Z', frames: [0, 10, 20].map(minutes => ({ timeUtc: new Date(Date.UTC(2022, 0, 15, 4, minutes)).toISOString(), url: `assets/events/fixture-${kind}-${minutes}.png`, sha256: 'a'.repeat(64) })), sources: [{ name: '测试来源', url: 'https://www.jma.go.jp/' }], series: [], limitations: ['测试夹具不是发布资料'] });

function harness(options = {}) {
  const nodes = new Map(), downloads = [], selections = [], dataCalls = [], modes = [], views = [], stationChoices = [], updates = [], exportedBlobs = [], exportedLinks = [];
  let active = true;
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector, { textContent: '', innerHTML: '', hidden: false, disabled: false, value: '', dataset: {}, style: { setProperty() {} }, classList: { toggle() {} }, handlers: new Map(), setAttribute(key, value) { this[key] = value; }, addEventListener(type, fn) { this.handlers.set(type, fn); }, querySelectorAll() { return []; } });
    return nodes.get(selector);
  };
  node('#observation-flow-controls').after = () => {};
  node('#observed-story-legend').after = () => {};
  node('#stage-steps').after = () => {};
  const engine = {
    setDynamicData(data) { dataCalls.push(data); }, setDynamicMode(mode) { modes.push(mode); },
    setDynamicSnapshot(snapshot) { const request = deferred(); selections.push({ snapshot, ...request }); return request.promise; },
    preloadDynamicFrames() {}, setDynamicPresentation() {}, setDynamicRelief() {}, setDynamicView(view) { views.push(view); }, selectDynamicStation(id) { stationChoices.push(id); },
  };
  const context = { document: { querySelector: node, body: { dataset: {} }, documentElement: node('html'), createElement(tag) { assert.equal(tag, 'a'); return { click() { exportedLinks.push({ href: this.href, download: this.download }); } }; } }, Intl, Date, Math, Number, String, Object, Promise, Blob, URL: { createObjectURL(blob) { exportedBlobs.push(blob); return 'blob:fixture-' + exportedBlobs.length; }, revokeObjectURL() {} }, setTimeout(fn) { fn(); },
    validateDynamicEvent, dynamicTicks, dynamicSnapshot, sampleAt, dynamicEvents, getDynamicEvent, isDeviceEvent, formatBatteryElapsed, clearTimeout() {},
    createBatteryEvidence: () => ({ render() {}, reset() {} }), matchMedia: () => ({ matches: false }),
    fetch: url => { const request = deferred(); downloads.push({ url, ...request }); return request.promise; },
  };
  const source = fs.readFileSync(new URL('../app/dynamic-player.js', import.meta.url), 'utf8').replace(/^import[^\n]*\n/gm, '').replace('export function createDynamicPlayer', 'function createDynamicPlayer');
  vm.createContext(context); vm.runInContext(source, context, { filename: 'actual-dynamic-player.js' });
  const player = context.createDynamicPlayer(engine, { isActive: () => active, onRoute() {}, getExportContext: options.getExportContext, onUpdate() { updates.push({ ...player.getState(), earthTime: node('#earth-view').dataset.observedTime, chartTime: node('#charts').dataset.observedTime }); } });
  return { node, player, downloads, selections, dataCalls, modes, views, stationChoices, updates, exportedBlobs, exportedLinks,
    respond(i, data) { downloads[i].resolve({ ok: true, json: async () => data }); },
    leave() { active = false; player.leave(); },
  };
}

test('device opening, playback, and camera reset stay in detail with a separate scenario list', async () => {
  const h = harness(), entering = h.player.enter('battery-b0005', { watch: true });
  assert.equal(h.node('#dynamic-full').hidden, true);
  assert.match(h.node('#observation-event-select').innerHTML, /engine-jlu-diesel/);
  assert.doesNotMatch(h.node('#observation-event-select').innerHTML, /tide-san-francisco|volcano/);
  const battery = JSON.parse(fs.readFileSync(new URL('../app/data/battery-b0005-dynamic.json', import.meta.url), 'utf8'));
  h.respond(0, battery); await settle();
  h.selections[0].resolve(true); assert.equal(await entering, true); await settle();
  assert.deepEqual(h.views, ['detail']);
  assert.equal(h.player.getState().playing, true);
  assert.equal(h.node('#earth-view').dataset.observedTime, 0);
  assert.equal(h.node('#charts').dataset.observedTime, 0);
  assert.equal(h.node('#readouts').dataset.observedTime, 0);
  h.player.resetView();
  assert.deepEqual(h.views, ['detail', 'detail']);
  assert.equal(h.node('#dynamic-full')['aria-pressed'], 'false');
  assert.match(h.node('#observation-watch').textContent, /播放实验片段/);

  h.player.leave();
  const switching = h.player.enter('quake');
  assert.equal(h.node('#dynamic-full').hidden, false);
  assert.match(h.node('#observation-event-select').innerHTML, /tide-san-francisco|volcano/);
  assert.doesNotMatch(h.node('#observation-event-select').innerHTML, /battery-b0005|engine-jlu-diesel/);
  h.respond(1, smallQuake()); await settle();
  h.selections.at(-1).resolve(true); assert.equal(await switching, true);
  assert.equal(h.views.at(-1), 'global');
});

test('rapid event switches cannot poison another kind cache with an old download', async () => {
  const h = harness(), old = h.player.enter('quake'), current = h.player.enter('storm');
  assert.equal(h.downloads.length, 2);
  h.respond(1, imagery('storm')); await settle();
  h.selections[0].resolve(true); assert.equal(await current, true);
  assert.equal(h.dataCalls.at(-1).kind, 'storm');
  h.respond(0, smallQuake()); assert.equal(await old, false);
  const again = h.player.enter('storm'); await settle();
  assert.equal(h.downloads.length, 2, 'the selected storm is cached under its own immutable kind');
  assert.equal(h.dataCalls.at(-1).kind, 'storm');
  h.selections.at(-1).resolve(true); assert.equal(await again, true);
  assert.match(h.node('#topic-title').textContent, /storm/);
});

test('an old frame completion cannot overwrite a newer event clock or panels', async () => {
  const h = harness(), old = h.player.enter('quake');
  h.respond(0, smallQuake()); await settle();
  const current = h.player.enter('volcano'); h.respond(1, imagery('volcano')); await settle();
  assert.equal(h.selections.length, 2);
  h.selections[1].resolve(true); await current;
  const currentTime = h.node('#earth-view').dataset.observedTime;
  h.selections[0].resolve(true); assert.equal(await old, false);
  assert.equal(h.node('#earth-view').dataset.observedTime, currentTime);
  assert.equal(h.node('#charts').dataset.observedTime, currentTime);
  assert.equal(h.node('#readouts').dataset.observedTime, currentTime);
  assert.match(h.node('#topic-title').textContent, /volcano/);
  assert.doesNotMatch(h.node('#current-insight').innerHTML, /IU.MAJO/);
});

test('two earthquake cases use independent packages and reject a same-kind event mismatch', async () => {
  const h = harness();
  const hualien = JSON.parse(fs.readFileSync(new URL('../app/data/quake-hualien-dynamic.json', import.meta.url), 'utf8'));
  const wrong = h.player.enter('quake-hualien');
  h.respond(0, smallQuake());
  assert.equal(await wrong, false);
  assert.match(h.node('#dynamic-status').textContent, /事件标识与资料不符/);
  const first = h.player.enter('quake-hualien');
  assert.equal(h.downloads[1].url, 'data/quake-hualien-dynamic.json');
  h.respond(1, hualien); await settle();
  h.selections.at(-1).resolve(true); assert.equal(await first, true);
  assert.equal(h.player.getState().eventId, hualien.id);
  assert.equal(h.player.getState().selectedStation, 'IU.TATO.00.BHZ');
  const second = h.player.enter('quake');
  h.respond(2, smallQuake()); await settle();
  h.selections.at(-1).resolve(true); assert.equal(await second, true);
  assert.equal(h.player.getState().eventId, quake.id);
  assert.equal(h.player.getState().selectedStation, 'IU.MAJO.00.BHZ');
  const back = h.player.enter('quake-hualien'); await settle();
  assert.equal(h.downloads.length, 3);
  h.selections.at(-1).resolve(true); assert.equal(await back, true);
  assert.equal(h.player.getState().eventId, hualien.id);
  assert.equal(h.node('#earth-view').dataset.observedTime, h.node('#charts').dataset.observedTime);
});

test('clock and panels wait for frame readiness, and failed frames never substitute another time', async () => {
  const h = harness(), entering = h.player.enter('storm');
  h.respond(0, imagery('storm')); await settle();
  assert.equal(h.node('#earth-view').dataset.observedTime, undefined);
  h.selections[0].resolve(true); await entering;
  const previous = h.node('#earth-view').dataset.observedTime, previousCharts = h.node('#charts').innerHTML;
  assert.equal(h.player.getState().displayReady, true);
  const pending = h.player.select(2);
  assert.equal(h.player.getState().displayReady, false);
  assert.equal(h.player.getState().displayFailed, false);
  assert.equal(h.node('#earth-view').dataset.observedTime, previous);
  assert.equal(h.node('#charts').dataset.observedTime, previous);
  assert.equal(h.node('#charts').innerHTML, previousCharts);
  assert.match(h.node('#dynamic-status').textContent, /等待/);
  h.selections[1].resolve(false); assert.equal(await pending, false);
  assert.equal(h.player.getState().displayReady, false, 'a retained committed clock is not proof its image is still bound');
  assert.equal(h.player.getState().displayFailed, true);
  assert.equal(h.node('#earth-view').dataset.observedTime, previous);
  assert.match(h.node('#dynamic-status').textContent, /未用别的时刻替代/);
  const retryButton = h.node('#observation-data-retry');
  assert.equal(retryButton.hidden, false);
  retryButton.handlers.get('click')();
  assert.equal(h.selections[2].snapshot.timeUtc, '2022-01-15T04:20:00.000Z');
  h.selections[2].resolve(true); await settle();
  assert.equal(retryButton.hidden, true);
  assert.equal(h.player.getState().displayReady, true);
  assert.equal(h.player.getState().displayFailed, false);
  assert.equal(h.node('#earth-view').dataset.observedTime, '2022-01-15T04:20:00.000Z');
  assert.equal(h.node('#charts').dataset.observedTime, h.node('#earth-view').dataset.observedTime);
  assert.equal(h.node('#readouts').dataset.observedTime, h.node('#earth-view').dataset.observedTime);
});

test('leaving a pending frame prevents its completion from restoring dynamic UI', async () => {
  const h = harness(), entering = h.player.enter('quake'); h.respond(0, smallQuake()); await settle();
  h.leave(); h.selections[0].resolve(true); assert.equal(await entering, false);
  assert.equal(h.node('#earth-view').dataset.observedTime, undefined);
  assert.equal(h.node('#dynamic-toolbar').hidden, true);
  assert.equal(h.modes.at(-1), false);
});

test('presentation observers see display readiness in the same transaction as committed clocks and failure', async () => {
  const h = harness(), entering = h.player.enter('storm'); h.respond(0, imagery('storm')); await settle();
  assert.equal(h.updates.at(-1).loading, true); assert.equal(h.updates.at(-1).displayReady, false);
  h.selections[0].resolve(true); await entering;
  const committed = h.updates.at(-1);
  assert.equal(committed.displayReady, true); assert.equal(committed.timeUtc, committed.earthTime); assert.equal(committed.timeUtc, committed.chartTime);
  const pending = h.player.select(2);
  assert.equal(h.updates.at(-1).displayReady, false); assert.equal(h.updates.at(-1).loading, true);
  h.selections[1].resolve(false); await pending;
  assert.equal(h.updates.at(-1).displayReady, false); assert.equal(h.updates.at(-1).displayFailed, true);
  assert.equal(h.updates.at(-1).loading, false); assert.equal(h.updates.at(-1).timeUtc, committed.timeUtc);
});

test('a mislabeled event response cannot be bound as the requested type', async () => {
  const h = harness(), entering = h.player.enter('storm'); h.respond(0, smallQuake()); assert.equal(await entering, false);
  assert.equal(h.selections.length, 0);
  assert.ok(h.dataCalls.every(d => d === null));
  assert.match(h.node('#dynamic-status').textContent, /类型.*不符/);
});

test('public state exposes only the committed clock and a defensive copy of the actual ticks', async () => {
  const h = harness(), entering = h.player.enter('quake');
  assert.equal(h.player.getState().loading, true);
  assert.equal(h.player.getState().timeUtc, null);
  assert.equal(h.player.getState().selectedStation, null);
  h.respond(0, smallQuake()); await settle();
  const pending = h.player.getState();
  assert.equal(pending.timeUtc, null, 'downloaded metadata alone does not establish a displayed clock');
  assert.equal(pending.loading, true); assert.equal(pending.ticks.length, 3);
  h.selections[0].resolve(true); assert.equal(await entering, true);
  const state = h.player.getState();
  assert.equal(state.kind, 'quake'); assert.equal(state.index, 1);
  assert.equal(state.timeUtc, '2011-03-11T05:45:02Z');
  assert.equal(state.selectedStation, 'IU.MAJO.00.BHZ');
  assert.equal(state.loading, false); assert.equal(state.playing, false);
  assert.equal('data' in state, false); assert.equal('snapshot' in state, false);
  state.ticks.splice(0, state.ticks.length, 'not-an-observation');
  assert.equal(h.player.getState().ticks.length, 3);
  assert.equal(h.player.getState().ticks[0], '2011-03-11T05:45:01Z');
});

test('UTC seeking chooses only an actual tick at or before the target and awaits display readiness', async () => {
  const h = harness(), entering = h.player.enter('storm'); h.respond(0, imagery('storm')); await settle();
  h.selections[0].resolve(true); await entering;
  const between = h.player.seekUtc('2022-01-15T04:19:59.999Z');
  assert.equal(h.selections.at(-1).snapshot.timeUtc, '2022-01-15T04:10:00.000Z');
  assert.equal(h.player.getState().loading, true);
  h.selections.at(-1).resolve(true); assert.equal(await between, true);
  const attempts = h.selections.length;
  for (const invalid of ['2022-01-15T03:59:59Z', '2022-01-15T04:10:00+00:00', '2022-02-30T04:10:00Z', 'not-a-date', null]) {
    assert.equal(await h.player.seekUtc(invalid), false);
  }
  assert.equal(h.selections.length, attempts, 'invalid or too-early targets cannot pick a future fallback');
  const after = h.player.seekUtc('2022-01-16T00:00:00Z');
  assert.equal(h.selections.at(-1).snapshot.timeUtc, '2022-01-15T04:20:00.000Z');
  assert.equal(h.player.getState().timeUtc, '2022-01-15T04:10:00.000Z', 'state remains committed until the requested frame is ready');
  h.selections.at(-1).resolve(true); assert.equal(await after, true);
  assert.equal(h.player.getState().timeUtc, '2022-01-15T04:20:00.000Z');
});

test('pause stops playback and clears accrued elapsed time before a later resume', async () => {
  const h = harness(), entering = h.player.enter('quake'); h.respond(0, smallQuake()); await settle();
  h.selections[0].resolve(true); await entering;
  await h.player.toggle(); assert.equal(h.player.getState().playing, true);
  const before = h.selections.length;
  h.player.advance(.04, 1); assert.equal(h.selections.length, before);
  h.player.pause(); assert.equal(h.player.getState().playing, false);
  assert.equal(h.node('#play')['aria-label'], '播放真实过程');
  h.player.advance(10, 1); assert.equal(h.selections.length, before);
  await h.player.toggle(); h.player.advance(.02, 1);
  assert.equal(h.selections.length, before, 'the pre-pause elapsed fraction is discarded');
  h.player.advance(.04, 1); assert.equal(h.selections.length, before + 1);
  h.selections.at(-1).resolve(true); await settle(); h.player.pause();
});

test('a failed terminal replay stays paused with a stable failure message until the first frame really retries', async () => {
  const h = harness(), entering = h.player.enter('storm'); h.respond(0, imagery('storm')); await settle(); h.selections[0].resolve(true); await entering;
  const last = h.player.select(2); h.selections[1].resolve(true); await last;
  const replay = h.player.toggle(); assert.equal(h.player.getState().loading, true); assert.equal(h.player.getState().playing, false);
  assert.equal(h.selections[2].snapshot.timeUtc, '2022-01-15T04:00:00.000Z');
  h.selections[2].resolve(false); assert.equal(await replay, false);
  assert.equal(h.player.getState().playing, false); assert.equal(h.player.getState().displayFailed, true);
  assert.equal(h.player.getState().renderedTimeUtc, null); assert.match(h.node('#dynamic-status').textContent, /未能显示/);
  h.player.pause(); assert.match(h.node('#dynamic-status').textContent, /未能显示/, 'controls cannot turn failure into a normal scanning claim');
  const retry = h.player.toggle(); h.selections[3].resolve(true); assert.equal(await retry, true);
  assert.equal(h.player.getState().playing, true); assert.equal(h.player.getState().displayFailed, false);
  assert.equal(h.player.getState().renderedTimeUtc, '2022-01-15T04:00:00.000Z');
});

test('manual pause or an explicit seek cancels a pending replay intent without losing its committed observation', async () => {
  const h = harness(), entering = h.player.enter('storm'); h.respond(0, imagery('storm')); await settle(); h.selections[0].resolve(true); await entering;
  const restart = h.player.restart(); h.player.pause(); h.selections[1].resolve(true);
  assert.equal(await restart, false); assert.equal(h.player.getState().playing, false);
  assert.equal(h.player.getState().timeUtc, '2022-01-15T04:00:00.000Z');
  const replay = h.player.restart(), seek = h.player.select(2);
  h.selections[3].resolve(true); assert.equal(await seek, true); h.selections[2].resolve(true); assert.equal(await replay, false);
  assert.equal(h.player.getState().playing, false); assert.equal(h.player.getState().timeUtc, '2022-01-15T04:20:00.000Z');
});

test('export distinguishes pending and failed imagery from retained real readings, then records successful retry', async () => {
  const observedContexts = [], h = harness({ getExportContext(context) { observedContexts.push(context); return { schemaVersion: 1, featureStatus: context.displayReady ? 'ready' : 'not-displayed', asset: 'data/observed-change-features.json' }; } });
  assert.equal(h.player.exportCurrent(), null); assert.equal(h.exportedBlobs.length, 0);
  const entering = h.player.enter('volcano'); h.respond(0, imagery('volcano')); await settle(); h.selections[0].resolve(true); await entering;
  const committed = h.player.getState().timeUtc, seeking = h.player.select(2);
  h.player.exportCurrent(); const pending = JSON.parse(await h.exportedBlobs.at(-1).text());
  assert.equal(pending.kind, 'synchronized-observed-process', 'legacy kind and snapshot fields remain available');
  assert.equal(pending.snapshot.timeUtc, committed); assert.equal(pending.display.committedTimeUtc, committed);
  assert.equal(pending.display.requestedTimeUtc, '2022-01-15T04:20:00.000Z'); assert.equal(pending.display.status, 'loading');
  assert.equal(pending.display.renderedTimeUtc, null); assert.equal(pending.renderingMethods.visibleObservationTimeUtc, null);
  assert.equal(pending.renderingMethods.annotations.featureStatus, 'not-displayed');
  h.selections[1].resolve(false); await seeking;
  h.player.exportCurrent(); const failed = JSON.parse(await h.exportedBlobs.at(-1).text());
  assert.equal(failed.display.status, 'failed'); assert.equal(failed.display.displayFailed, true); assert.equal(failed.display.loading, false);
  assert.equal(failed.display.renderedTimeUtc, null); assert.equal(failed.snapshot.timeUtc, committed); assert.match(failed.display.message, /未能显示/);
  const retry = h.player.select(2); h.selections[2].resolve(true); await retry; h.player.exportCurrent();
  const displayed = JSON.parse(await h.exportedBlobs.at(-1).text());
  assert.equal(displayed.schemaVersion, 2); assert.equal(displayed.display.status, 'displayed'); assert.equal(displayed.display.displayFailed, false);
  assert.equal(displayed.display.renderedTimeUtc, displayed.snapshot.timeUtc); assert.equal(displayed.renderingMethods.annotations.featureStatus, 'ready');
  assert.equal(displayed.renderingMethods.clouds.spatialFocus.enabled, true); assert.equal(displayed.renderingMethods.clouds.spatialFocus.innerRadiusKm, 400); assert.equal(displayed.renderingMethods.clouds.spatialFocus.outerRadiusKm, 600);
  assert.equal(displayed.renderingMethods.clouds.spatialFocus.statisticsRadiusKm, 300); assert.equal(displayed.snapshot.frame.sha256, 'a'.repeat(64));
  assert.equal(observedContexts.at(-1).eventId, displayed.eventId); assert.equal(observedContexts.at(-1).renderedTimeUtc, displayed.snapshot.timeUtc);
  assert.match(h.exportedLinks.at(-1).download, /hunga-tonga-2022-b13-.*\.json$/);
});

test('raw and waveform exports describe the selected presentation without inventing cloud relief or contours', async () => {
  const h = harness(), entering = h.player.enter('volcano'); h.respond(0, imagery('volcano')); await settle(); h.selections[0].resolve(true); await entering;
  h.node('#dynamic-controls').handlers.get('click')({ target: { closest() { return { dataset: { presentation: 'raw' } }; } } });
  h.player.exportCurrent(); const raw = JSON.parse(await h.exportedBlobs.at(-1).text());
  assert.equal(raw.presentation, 'raw'); assert.equal(raw.renderingMethods.clouds.fusion.enabled, false); assert.equal(raw.renderingMethods.clouds.relief.enabled, false); assert.equal(raw.renderingMethods.clouds.spatialFocus.enabled, false);
  assert.equal(raw.renderingMethods.annotations, null, 'only the owning presentation layer can report its actual contour state');
  const quakeEntry = h.player.enter('quake'); h.respond(1, smallQuake()); await settle(); h.selections.at(-1).resolve(true); await quakeEntry;
  h.player.exportCurrent(); const wave = JSON.parse(await h.exportedBlobs.at(-1).text());
  assert.equal(wave.renderingMethods.clouds, null); assert.equal(wave.presentation, 'station-normalized waveform glyphs');
  assert.equal(wave.station, 'IU.MAJO.00.BHZ'); assert.equal(wave.display.renderedTimeUtc, wave.snapshot.timeUtc);
});

test('a failed supplemental export provider is explicit and does not prevent real observations from exporting', async () => {
  const h = harness({ getExportContext() { throw new Error('test unavailable provider'); } }), entering = h.player.enter('quake');
  h.respond(0, smallQuake()); await settle(); h.selections[0].resolve(true); await entering;
  h.player.exportCurrent(); const value = JSON.parse(await h.exportedBlobs.at(-1).text());
  assert.equal(value.display.displayReady, true); assert.equal(value.renderingMethods.annotations.status, 'unavailable');
  assert.equal(value.snapshot.stations.length, 6); assert.equal(h.exportedLinks.length, 1);
});

test('public view changes and existing buttons share one engine and accessible-state update', () => {
  const h = harness();
  assert.equal(h.player.setView('detail'), true);
  assert.equal(h.views.at(-1), 'detail');
  assert.equal(h.node('#dynamic-close')['aria-pressed'], 'true');
  assert.equal(h.node('#dynamic-full')['aria-pressed'], 'false');
  const count = h.views.length;
  assert.equal(h.player.setView('unknown'), false); assert.equal(h.views.length, count);
  h.node('#dynamic-full').handlers.get('click')();
  assert.equal(h.views.at(-1), 'global'); assert.equal(h.node('#dynamic-close')['aria-pressed'], 'false');
  h.node('#dynamic-close').handlers.get('click')();
  assert.equal(h.views.at(-1), 'detail');
  assert.equal(h.player.resetView(), true);
  assert.equal(h.views.at(-1), 'global'); assert.equal(h.node('#dynamic-full')['aria-pressed'], 'true');
});

test('public station selection accepts only source IDs and updates panels without moving the shared clock', async () => {
  const h = harness(), entering = h.player.enter('quake'); h.respond(0, smallQuake()); await settle();
  h.selections[0].resolve(true); await entering;
  const clock = h.player.getState().timeUtc, count = h.selections.length;
  assert.equal(h.player.selectStation('IU.INCN.00.BHZ'), true);
  assert.equal(h.player.getState().selectedStation, 'IU.INCN.00.BHZ');
  assert.equal(h.stationChoices.at(-1), 'IU.INCN.00.BHZ');
  assert.match(h.node('#readouts').innerHTML, /IU.INCN.00.BHZ/);
  assert.equal(h.player.getState().timeUtc, clock); assert.equal(h.selections.length, count);
  const markup = h.node('#readouts').innerHTML;
  assert.equal(h.player.selectStation('<invented-station>'), false);
  assert.equal(h.node('#readouts').innerHTML, markup); assert.equal(h.stationChoices.length, 1);
  const switching = h.player.enter('storm');
  assert.equal(h.player.getState().selectedStation, null);
  assert.equal(h.player.selectStation('IU.INCN.00.BHZ'), false);
  h.respond(1, imagery('storm')); await settle(); h.selections.at(-1).resolve(true); await switching;
  assert.equal(h.player.selectStation('IU.INCN.00.BHZ'), false);
});

test('enter returns false for a failed download or a first frame that cannot be displayed', async () => {
  const failedFetch = harness(), downloading = failedFetch.player.enter('quake');
  failedFetch.downloads[0].reject(new Error('offline')); assert.equal(await downloading, false);
  assert.equal(failedFetch.player.getState().loading, false);
  const failedFrame = harness(), displaying = failedFrame.player.enter('storm');
  failedFrame.respond(0, imagery('storm')); await settle(); failedFrame.selections[0].resolve(false);
  assert.equal(await displaying, false);
  assert.equal(failedFrame.player.getState().timeUtc, null);
});

test('evidence access returns the already-loaded source identity for non-mutating snapshot calculations', async () => {
  const h = harness(), source = smallQuake(), original = structuredClone(source);
  assert.equal(h.player.getEvidenceSource(), null);
  const entering = h.player.enter('quake'); h.respond(0, source); await settle(); h.selections[0].resolve(true); await entering;
  assert.equal(h.player.getEvidenceSource(), source);
  const a = dynamicSnapshot(h.player.getEvidenceSource(), source.startUtc);
  const b = dynamicSnapshot(h.player.getEvidenceSource(), source.endUtc);
  assert.notEqual(a.timeUtc, b.timeUtc); assert.equal(a.stations.length, 6);
  assert.deepEqual(source, original, 'A/B evidence calculations do not change source records');
  assert.equal(h.player.getEvidenceSource(), source); assert.equal(h.downloads.length, 1);
});

test('cancelPending invalidates an in-flight seek without replacing the committed clock or panels', async () => {
  const h = harness(), entering = h.player.enter('storm'); h.respond(0, imagery('storm')); await settle(); h.selections[0].resolve(true); await entering;
  const time = h.player.getState().timeUtc, charts = h.node('#charts').innerHTML, source = h.player.getEvidenceSource(), dataCalls = h.dataCalls.length;
  const seeking = h.player.seekUtc('2022-01-15T04:20:00Z'); assert.equal(h.player.getState().loading, true);
  h.player.cancelPending();
  assert.equal(h.player.getState().loading, false); assert.equal(h.player.getState().playing, false);
  assert.equal(h.player.getEvidenceSource(), source, 'a committed event retains its evidence source for restoring the current frame');
  assert.equal(h.dataCalls.length, dataCalls, 'canceling a later seek must not erase already-committed engine data');
  assert.equal(h.player.getState().ticks.length, 3);
  h.selections[1].resolve(true); assert.equal(await seeking, false);
  assert.equal(h.player.getState().timeUtc, time); assert.equal(h.node('#charts').innerHTML, charts);
  assert.equal(h.node('#charts').dataset.observedTime, time);
});

test('canceling before any frame commits clears engine data and ticks, and a late first frame cannot revive UI', async () => {
  const h = harness(), entering = h.player.enter('storm'), source = imagery('storm');
  h.respond(0, source); await settle();
  assert.equal(h.player.getState().loading, true); assert.equal(h.player.getState().timeUtc, null);
  assert.equal(h.player.getEvidenceSource(), source); assert.equal(h.dataCalls.at(-1), source);
  h.player.cancelPending();
  assert.equal(h.dataCalls.at(-1), null, 'setDynamicData(null) also clears the actual layer and invalidates its pending texture request');
  assert.equal(h.player.getEvidenceSource(), null); assert.equal(h.player.getState().ticks.length, 0);
  assert.equal(h.player.getState().loading, false);
  h.selections[0].resolve(true); assert.equal(await entering, false);
  assert.equal(h.player.getState().timeUtc, null); assert.equal(h.node('#earth-view').dataset.observedTime, undefined);
  const reopen = h.player.enter('storm'); await settle();
  assert.equal(h.downloads.length, 1, 'cancellation preserves the reusable fetched cache');
  assert.equal(h.dataCalls.at(-1), source);
  h.selections.at(-1).resolve(true); assert.equal(await reopen, true);
  assert.equal(h.player.getState().ticks.length, 3); assert.ok(h.player.getState().timeUtc);
});

test('canceling the initial metadata download cannot let it install data after cancellation', async () => {
  const h = harness(), entering = h.player.enter('quake');
  h.player.cancelPending(); const dataCalls = h.dataCalls.length;
  h.respond(0, smallQuake()); assert.equal(await entering, false);
  assert.equal(h.dataCalls.length, dataCalls); assert.equal(h.dataCalls.at(-1), null);
  assert.equal(h.selections.length, 0); assert.equal(h.player.getEvidenceSource(), null);
  assert.equal(h.player.getState().ticks.length, 0); assert.equal(h.player.getState().loading, false);
});

test('a canceled seek cannot release the loading state or overwrite a newer selection', async () => {
  const h = harness(), entering = h.player.enter('quake'); h.respond(0, smallQuake()); await settle(); h.selections[0].resolve(true); await entering;
  const old = h.player.select(2); h.player.cancelPending(); const current = h.player.select(0);
  h.selections[1].resolve(true); assert.equal(await old, false);
  assert.equal(h.player.getState().loading, true);
  h.selections[2].resolve(true); assert.equal(await current, true);
  assert.equal(h.player.getState().timeUtc, '2011-03-11T05:45:01Z');
  assert.equal(h.node('#readouts').dataset.observedTime, '2011-03-11T05:45:01Z');
});

const analysisSvg = (markup, label = '最大持续风速') => [...markup.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(match => match[0]).find(svg => svg.includes(label));
const highlightX = svg => svg.match(/<circle cx="([\d.-]+)"[^>]*r="2\.5" fill="#fff0cf"/);

test('13:30 storm playback highlights its actual 12:00 JMA analysis while the clock stays at 13:30', async () => {
  const source = JSON.parse(fs.readFileSync(new URL('../app/data/storm-dynamic.json', import.meta.url), 'utf8'));
  const original = structuredClone(source), h = harness(), entering = h.player.enter('storm');
  h.respond(0, source); await settle(); h.selections[0].resolve(true); await entering;
  const seeking = h.player.seekUtc('2022-09-05T13:30:00Z'); h.selections.at(-1).resolve(true); await seeking;
  const svg = analysisSvg(h.node('#charts').innerHTML);
  assert.ok(svg); assert.ok(highlightX(svg), 'latest valid official analysis remains visibly selected between analysis times');
  assert.equal(Number(highlightX(svg)[1]), 191.4, '12:00 analysis occupies 9 of the 10.5 displayed hours');
  assert.match(svg, /M222\.0 4V63[^>]*stroke="#fff0cf"/, 'the current clock is still at the 13:30 end of the chart');
  const wind = dynamicSnapshot(source, h.player.getState().timeUtc).metrics.find(m => m.id === 'windKt').sample;
  assert.equal(wind.timeUtc, '2022-09-05T12:00:00Z'); assert.equal(wind.value, 75);
  assert.deepEqual(source, original);
});

test('sparse analysis highlights honor each series age limit, explicit missing values and measured zero', async () => {
  const cases = [
    { name: 'future', samples: [{ timeUtc: '2022-01-15T04:20:00Z', value: 20 }], visible: false },
    { name: 'expired', samples: [{ timeUtc: '2022-01-15T04:00:00Z', value: 20 }], visible: false },
    { name: 'missing', samples: [{ timeUtc: '2022-01-15T04:05:00Z', value: 20 }, { timeUtc: '2022-01-15T04:10:00Z', value: null }], visible: false },
    { name: 'zero-at-age-boundary', samples: [{ timeUtc: '2022-01-15T04:05:00Z', value: 0 }], visible: true },
  ];
  for (const item of cases) {
    const source = imagery('storm');
    source.series = [{ id: 'windKt', label: '最大持续风速', unit: 'kt', maxAgeSeconds: 300, samples: item.samples }];
    const h = harness(), entering = h.player.enter('storm'); h.respond(0, source); await settle(); h.selections[0].resolve(true); await entering;
    const svg = analysisSvg(h.node('#charts').innerHTML);
    assert.equal(Boolean(highlightX(svg)), item.visible, item.name);
    if (item.visible) assert.equal(Number(highlightX(svg)[1]), 61.5, 'the measured zero is marked at 04:05 rather than the 04:10 clock');
  }
});
