import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoSession } from '../app/demo-session.js';

const times = [0, 10, 30, 40].map(minute => new Date(Date.UTC(2022, 8, 5, 3, minute)).toISOString());
const task = { id: 'storm', fromUtc: times[0], toUtc: times[3], durationSeconds: 16, holdSeconds: 1 };
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function harness(options = {}) {
  let ms = 0, stops = 0;
  const calls = [], changes = [];
  const session = createDemoSession({ now: () => ms, prepare: async () => ({ ticks: times }), seek: async (timeUtc, context) => { calls.push({ timeUtc, ...context }); return true; }, pause: () => { stops++; }, onChange: state => changes.push(state), ...options });
  return { session, calls, changes, at: value => { ms = value; }, advance: value => { ms += value; }, stops: () => stops };
}

test('open commits prepared A, holds it, then selects source times by UTC distance rather than index', async () => {
  const h = harness();
  assert.equal(await h.session.open(task), true);
  assert.equal(h.session.snapshot().timeUtc, times[0]);
  assert.equal(h.session.snapshot().status, 'playing');
  h.at(900); await h.session.tick();
  assert.equal(h.calls.length, 0);
  h.at(5000); await h.session.tick();
  assert.equal(h.calls[0].timeUtc, times[1]);
  assert.equal(h.session.snapshot().progress, .25);
  h.at(9000); await h.session.tick();
  assert.equal(h.calls.length, 1, 'missing 20-minute observation must not be invented');
  h.at(13000); await h.session.tick();
  assert.equal(h.calls[1].timeUtc, times[2]);
  h.at(17000); await h.session.tick();
  assert.equal(h.calls[2].timeUtc, times[3]);
  assert.equal(h.session.snapshot().status, 'complete');
  assert.equal(h.session.snapshot().progress, 1);
  assert.deepEqual(h.calls.map(call => call.timeUtc), times.slice(1));
});

test('a slow frame freezes the demo clock and repeated ticks cannot issue duplicate requests', async () => {
  const frame = deferred(), seeks = [];
  const h = harness({ seek: (utc, context) => { seeks.push({ utc, ...context }); return seeks.length === 1 ? frame.promise : Promise.resolve(true); } });
  await h.session.open(task); h.at(5000);
  const pending = h.session.tick();
  h.at(65000); await h.session.tick();
  assert.equal(seeks.length, 1);
  assert.equal(h.session.snapshot().timeUtc, times[0]);
  frame.resolve(true); await pending;
  assert.equal(h.session.snapshot().timeUtc, times[1]);
  await h.session.tick();
  assert.equal(seeks.length, 1, '60 seconds of loading must not jump to B');
  h.advance(8000); await h.session.tick();
  assert.equal(seeks.at(-1).utc, times[2]);
});

test('pause aborts a pending seek, ignores its late success, and resumes from the committed position', async () => {
  const old = deferred(), seeks = [];
  const h = harness({ seek: (utc, context) => { seeks.push({ utc, ...context }); return seeks.length === 1 ? old.promise : Promise.resolve(true); } });
  await h.session.open(task); h.at(5000); const pending = h.session.tick();
  h.session.pause();
  assert.equal(seeks[0].signal.aborted, true);
  h.at(99000); old.resolve(true); assert.equal(await pending, false);
  assert.equal(h.session.snapshot().status, 'paused');
  assert.equal(h.session.snapshot().timeUtc, times[0]);
  await h.session.play(); h.advance(5000); await h.session.tick();
  assert.equal(h.session.snapshot().timeUtc, times[1]);
  assert.equal(h.session.snapshot().status, 'playing');
});

test('a newer task cannot be replaced by an old prepare completion or rejection', async () => {
  const older = deferred(), newer = deferred(), pending = [];
  const h = harness({ prepare: (item, context) => { pending.push({ item, ...context }); return pending.length === 1 ? older.promise : newer.promise; } });
  const first = h.session.open(task), second = h.session.open({ ...task, id: 'new' });
  assert.equal(pending[0].signal.aborted, true);
  assert.equal(h.changes.at(-1).task.id, 'new', 'switching tasks while loading still notifies the UI');
  newer.resolve({ ticks: times }); assert.equal(await second, true);
  older.reject(new Error('old failure')); assert.equal(await first, false);
  assert.equal(h.session.snapshot().task.id, 'new');
  assert.equal(h.session.snapshot().status, 'playing');
  assert.equal(h.session.snapshot().error, null);
});

test('close during prepare leaves the idle snapshot intact after a late result', async () => {
  const preparation = deferred(); let signal;
  const h = harness({ prepare: (_item, context) => { signal = context.signal; return preparation.promise; } });
  const opening = h.session.open(task); h.session.close();
  assert.equal(signal.aborted, true);
  preparation.resolve({ ticks: times }); assert.equal(await opening, false);
  assert.deepEqual(h.session.snapshot(), { active: false, task: null, status: 'idle', timeUtc: null, progress: 0, error: null, fromUtc: null, toUtc: null });
  assert.equal(await h.session.play(), false);
});

test('pause during preparation prevents autoplay and play explicitly retries preparation', async () => {
  const preparation = deferred(); let count = 0;
  const h = harness({ prepare: () => ++count === 1 ? preparation.promise : Promise.resolve({ ticks: times }) });
  const opening = h.session.open(task); h.session.pause();
  preparation.resolve({ ticks: times }); await opening;
  assert.equal(h.session.snapshot().status, 'paused');
  assert.equal(h.session.snapshot().timeUtc, null);
  assert.equal(await h.session.play(), true);
  assert.equal(count, 2);
  assert.equal(h.session.snapshot().timeUtc, times[0]);
});

test('seek false or exception stops playback without falsely committing the requested time', async () => {
  for (const reject of [false, true]) {
    const h = harness({ seek: async () => { if (reject) throw new Error('frame unavailable'); return false; } });
    await h.session.open(task); h.at(5000);
    assert.equal(await h.session.tick(), false);
    assert.equal(h.session.snapshot().status, 'error');
    assert.equal(h.session.snapshot().timeUtc, times[0]);
    assert.equal(h.session.snapshot().progress, 0);
    assert.ok(h.session.snapshot().error);
    h.advance(50000); assert.equal(await h.session.tick(), false);
  }
});

test('jump aborts automatic seek, commits only the requested endpoint, and remains paused', async () => {
  const old = deferred(), seeks = [];
  const h = harness({ seek: (utc, context) => { seeks.push({ utc, ...context }); return seeks.length === 1 ? old.promise : Promise.resolve(true); } });
  await h.session.open(task); h.at(5000); const pending = h.session.tick();
  await h.session.jump('b');
  assert.equal(seeks[0].signal.aborted, true);
  assert.equal(h.session.snapshot().timeUtc, times[3]);
  assert.equal(h.session.snapshot().status, 'paused');
  old.resolve(true); await pending;
  assert.equal(h.session.snapshot().timeUtc, times[3]);
  await h.session.jump('a');
  assert.equal(h.session.snapshot().timeUtc, times[0]);
  const count = seeks.length; await h.session.jump('a');
  assert.equal(seeks.length, count + 1, 'explicit endpoint selection must realign the external timeline');
  assert.equal(seeks.at(-1).utc, times[0]);
});

test('play after B seeks A and restarts its hold, while play from a paused middle continues', async () => {
  const h = harness(); await h.session.open(task);
  h.at(5000); await h.session.tick(); h.session.pause();
  h.at(100000); await h.session.play();
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls.at(-1).timeUtc, times[1]);
  h.advance(8000); await h.session.tick(); assert.equal(h.session.snapshot().timeUtc, times[2]);
  h.advance(4000); await h.session.tick(); assert.equal(h.session.snapshot().status, 'complete');
  await h.session.play(); assert.equal(h.calls.at(-1).timeUtc, times[0]);
  assert.equal(h.session.snapshot().status, 'playing');
  const count = h.calls.length; h.advance(999); await h.session.tick(); assert.equal(h.calls.length, count);
});

test('unsorted duplicate ticks are normalized; requested boundaries use actual floor records', async () => {
  const h = harness({ prepare: async () => ({ ticks: [times[3], times[1], times[2], times[1], times[0]] }) });
  await h.session.open({ ...task, fromUtc: '2022-09-05T03:12:00Z', toUtc: '2022-09-05T03:35:00Z' });
  assert.equal(h.session.snapshot().fromUtc, times[1]);
  assert.equal(h.session.snapshot().toUtc, times[2]);
  h.at(17000); await h.session.tick();
  assert.deepEqual(h.calls.map(call => call.timeUtc), [times[2]]);
});

test('empty data, invalid dates and reversed ranges become visible errors without playback', async () => {
  for (const [values, item] of [[[], task], [['not-a-time'], task], [times, { ...task, fromUtc: times[3], toUtc: times[0] }]]) {
    const h = harness({ prepare: async () => ({ ticks: values }) });
    assert.equal(await h.session.open(item), false);
    assert.equal(h.session.snapshot().status, 'error');
    assert.equal(h.session.snapshot().timeUtc, null);
    assert.ok(h.session.snapshot().error);
    assert.equal(h.calls.length, 0);
  }
});

test('single-record interval finishes after the initial hold and never invents a second frame', async () => {
  const h = harness({ prepare: async () => ({ ticks: [times[0]] }) });
  await h.session.open({ ...task, toUtc: times[0] });
  h.at(999); await h.session.tick(); assert.equal(h.session.snapshot().status, 'playing');
  h.at(1000); await h.session.tick(); assert.equal(h.session.snapshot().status, 'complete');
  assert.equal(h.calls.length, 0);
  await h.session.play(); assert.equal(h.session.snapshot().status, 'playing');
  assert.equal(h.session.snapshot().progress, 0);
});

test('late automatic seek cannot replace a newly prepared task or close it on failure', async () => {
  const oldFrame = deferred(); let oldSignal;
  const h = harness({ seek: (_utc, context) => { oldSignal = context.signal; return oldFrame.promise; } });
  await h.session.open(task); h.at(5000); const advancing = h.session.tick();
  await h.session.open({ ...task, id: 'replacement', fromUtc: times[2] });
  assert.equal(oldSignal.aborted, true);
  oldFrame.resolve(true); assert.equal(await advancing, false);
  assert.equal(h.session.snapshot().task.id, 'replacement');
  assert.equal(h.session.snapshot().timeUtc, times[2]);
  assert.equal(h.session.snapshot().status, 'playing');
});

test('task boundaries are snapshotted before asynchronous preparation', async () => {
  const ready = deferred(), selected = { ...task };
  const h = harness({ prepare: () => ready.promise });
  const opening = h.session.open(selected);
  selected.fromUtc = times[3]; selected.toUtc = times[0];
  ready.resolve({ ticks: times }); assert.equal(await opening, true);
  assert.equal(h.session.snapshot().fromUtc, times[0]);
  assert.equal(h.session.snapshot().toUtc, times[3]);
});

test('onChange reports state and committed observations, not every presentation timer tick', async () => {
  const h = harness(); await h.session.open(task);
  assert.equal(h.changes.length, 2);
  h.at(100); await h.session.tick(); h.at(200); await h.session.tick();
  assert.equal(h.changes.length, 2);
  h.at(5000); await h.session.tick(); assert.equal(h.changes.length, 3);
  const copy = h.session.snapshot(); copy.task.id = 'outside mutation';
  assert.equal(h.session.snapshot().task.id, 'storm');
});

test('jump A and B force the globe back to the endpoint after the main timeline drifts externally', async () => {
  let displayed = null;
  const seeks = [];
  const h = harness({ prepare: async () => { displayed = times[0]; return { ticks: times }; }, seek: async utc => { seeks.push(utc); displayed = utc; return true; } });
  await h.session.open(task);
  displayed = times[2]; // Simulate a manual drag in the original timeline.
  assert.equal(h.session.snapshot().timeUtc, times[0]);
  await h.session.jump('a');
  assert.equal(displayed, times[0]);
  assert.equal(h.session.snapshot().status, 'paused');
  await h.session.jump('b');
  displayed = times[1];
  assert.equal(h.session.snapshot().timeUtc, times[3]);
  await h.session.jump('b');
  assert.equal(displayed, times[3]);
  assert.equal(h.session.snapshot().status, 'paused');
  assert.deepEqual(seeks, [times[0], times[3], times[3]]);
});

test('paused play awaits forced realignment to its committed time without counting that load as playback', async () => {
  let displayed = times[0];
  const alignment = deferred(), seeks = [];
  const h = harness({ seek: async utc => { seeks.push(utc); if (seeks.length === 2) await alignment.promise; displayed = utc; return true; } });
  await h.session.open(task); h.at(5000); await h.session.tick(); h.session.pause();
  assert.equal(displayed, times[1]);
  displayed = times[3];
  const resuming = h.session.play();
  assert.equal(h.session.snapshot().status, 'loading');
  assert.deepEqual(seeks, [times[1], times[1]]);
  h.at(55000); await h.session.tick();
  assert.equal(displayed, times[3]);
  alignment.resolve(); assert.equal(await resuming, true);
  assert.equal(displayed, times[1]);
  assert.equal(h.session.snapshot().status, 'playing');
  await h.session.tick(); assert.equal(seeks.length, 2);
  h.advance(8000); await h.session.tick();
  assert.equal(displayed, times[2]);
});

test('pause cancels a forced resume alignment and its late completion cannot restart playback', async () => {
  const alignment = deferred(); let signal;
  const h = harness({ seek: (_utc, context) => { signal = context.signal; return alignment.promise; } });
  await h.session.open(task); h.session.pause();
  const resuming = h.session.play();
  assert.equal(h.session.snapshot().status, 'loading');
  h.session.pause(); assert.equal(signal.aborted, true);
  alignment.resolve(true); assert.equal(await resuming, false);
  assert.equal(h.session.snapshot().status, 'paused');
  assert.equal(h.session.snapshot().timeUtc, times[0]);
});
