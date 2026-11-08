import test from 'node:test';
import assert from 'node:assert/strict';
import { createNarrationSession } from '../app/narration-session.js';

const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const tour = { label: '测试讲解', steps: [0, 1, 2].map(i => ({ title: '章节' + i, text: '仅供状态机验证的章节文字。', id: 'step-' + i })) };

function harness({ synchronousUpdate = false } = {}) {
  let milliseconds = 0;
  const prepares = [], updates = [], loads = [], calls = [], changes = [];
  const session = createNarrationSession({
    now: () => milliseconds,
    prepare(step, { signal, progress }) { const item = { step, signal, progress, ...deferred() }; prepares.push(item); calls.push('prepare:' + step.id); return item.promise; },
    update(step, progress, { signal }) { const item = { step, progress, signal, ...deferred() }; updates.push(item); calls.push('update:' + step.id); return synchronousUpdate ? true : item.promise; },
    media: {
      stop() { calls.push('stop'); }, pause() { calls.push('pause'); }, play() { calls.push('play'); }, seek(seconds) { calls.push('seek:' + seconds); },
      load(step, key, index, signal) { const item = { step, key, index, signal, ...deferred() }; loads.push(item); calls.push('load:' + step.id); return item.promise; },
    },
    onChange(state) { changes.push(state); },
  });
  return { session, prepares, updates, loads, calls, changes, now(value) { milliseconds = value; },
    async ready(promise, seconds = 15) { prepares.at(-1).resolve(true); await settle(); loads.at(-1).resolve(seconds); return await promise; },
  };
}

test('audio starts only after scene preparation and media loading both succeed', async () => {
  const h = harness(), starting = h.session.start(tour, 'test');
  assert.equal(h.session.snapshot().status, 'loading');
  assert.equal(h.loads.length, 0); assert.equal(h.calls.includes('play'), false);
  h.prepares[0].resolve(true); await settle();
  assert.equal(h.loads.length, 1); assert.equal(h.loads[0].key, 'test');
  assert.equal(h.calls.includes('play'), false);
  h.loads[0].resolve(20); assert.equal(await starting, true);
  assert.equal(h.session.snapshot().status, 'playing');
  assert.equal(h.session.snapshot().duration, 21.2);
  assert.deepEqual(h.calls, ['stop', 'prepare:step-0', 'load:step-0', 'play']);
});

test('direct process narration starts its chosen moving chapter without preparing an earlier frame', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test', 1));
  assert.equal(h.session.snapshot().index, 1);
  assert.deepEqual(h.prepares.map(p=>p.step.id), ['step-1']);
  assert.equal(h.loads[0].index, 1);
  assert.deepEqual(h.calls, ['stop', 'prepare:step-1', 'load:step-1', 'play']);
});

test('failed preparation enters error without loading or playing audio, and retry prepares the same chapter', async () => {
  const h = harness(), starting = h.session.start(tour, 'test');
  h.prepares[0].resolve(false); assert.equal(await starting, false);
  assert.equal(h.session.snapshot().status, 'error');
  assert.match(h.session.snapshot().error, /画面未就绪/);
  assert.equal(h.loads.length, 0); assert.equal(h.calls.includes('play'), false);
  const retry = h.session.resume();
  assert.equal(h.prepares[1].step, tour.steps[0]);
  assert.equal(h.prepares[0].signal.aborted, true);
  assert.equal(await h.ready(retry), true);
  assert.equal(h.session.snapshot().status, 'playing'); assert.equal(h.session.snapshot().error, '');
});

test('pausing during preparation or media load prevents automatic playback until explicitly resumed', async () => {
  for (const phase of ['prepare', 'load']) {
    const h = harness(), starting = h.session.start(tour, 'test');
    if (phase === 'load') { h.prepares[0].resolve(true); await settle(); }
    h.session.pause();
    if (phase === 'prepare') { h.prepares[0].resolve(true); await settle(); }
    h.loads[0].resolve(15); assert.equal(await starting, true);
    assert.equal(h.session.snapshot().status, 'paused');
    assert.equal(h.calls.includes('play'), false);
    h.now(100000); assert.equal(h.session.snapshot().elapsed, 0);
    h.session.resume(); assert.equal(h.session.snapshot().status, 'playing');
    assert.equal(h.calls.filter(c => c === 'play').length, 1);
    h.now(103500); assert.equal(h.session.snapshot().elapsed, 3.5);
  }
});

test('pause freezes chapter time and resume excludes time spent paused', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.now(4500); h.session.pause(); assert.equal(h.session.snapshot().elapsed, 4.5);
  h.now(50000); assert.equal(h.session.snapshot().elapsed, 4.5);
  assert.equal(h.calls.at(-1), 'pause');
  await h.session.tick(); assert.equal(h.updates.length, 0);
  h.session.resume(); h.now(52000); assert.equal(h.session.snapshot().elapsed, 6.5);
});

test('next and previous prepare exactly the requested bounded chapter and abort the old owner', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  const firstSignal = h.prepares[0].signal;
  const next = h.session.next(); assert.equal(firstSignal.aborted, true);
  assert.equal(h.session.snapshot().index, 1); assert.equal(h.session.snapshot().elapsed, 0);
  await h.ready(next); assert.equal(h.loads.at(-1).index, 1);
  await h.ready(h.session.previous()); assert.equal(h.session.snapshot().index, 0);
  await h.ready(h.session.previous()); assert.equal(h.session.snapshot().index, 0);
  await h.ready(h.session.go(100)); assert.equal(h.session.snapshot().index, 2);
  await h.ready(h.session.next()); assert.equal(h.session.snapshot().index, 2);
});

test('late preparation and late media loading cannot revive a stopped session or start audio', async () => {
  for (const phase of ['prepare', 'load']) {
    const h = harness(), starting = h.session.start(tour, 'test');
    if (phase === 'load') { h.prepares[0].resolve(true); await settle(); }
    h.session.stop(); assert.equal(h.prepares[0].signal.aborted, true);
    if (phase === 'prepare') h.prepares[0].resolve(true); else h.loads[0].resolve(15);
    assert.equal(await starting, false);
    assert.equal(h.session.snapshot().active, false); assert.equal(h.session.snapshot().status, 'idle');
    assert.equal(h.calls.includes('play'), false);
    if (phase === 'prepare') assert.equal(h.loads.length, 0);
  }
});

test('a slower old chapter or tour cannot play over the latest requested chapter', async () => {
  for (const phase of ['prepare', 'load']) {
    const h = harness(), old = h.session.start(tour, 'old');
    if (phase === 'load') { h.prepares[0].resolve(true); await settle(); }
    const nextTour = { ...tour, label: '新讲解', steps: [{ id: 'new-step', text: '新章节', title: '新标题' }] };
    const current = h.session.start(nextTour, 'new'); await h.ready(current);
    assert.equal(h.session.snapshot().step.id, 'new-step');
    const playCount = h.calls.filter(c => c === 'play').length;
    if (phase === 'prepare') h.prepares[0].resolve(true); else h.loads[0].resolve(15);
    assert.equal(await old, false);
    assert.equal(h.calls.filter(c => c === 'play').length, playCount);
    assert.equal(h.session.snapshot().key, 'new'); assert.equal(h.session.snapshot().status, 'playing');
  }
});

test('moving to the next chapter while paused preserves the pause until the user resumes', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.session.toggle();
  const playCount = h.calls.filter(c => c === 'play').length;
  await h.ready(h.session.next());
  assert.equal(h.session.snapshot().index, 1);
  assert.equal(h.session.snapshot().status, 'paused');
  assert.equal(h.calls.filter(c => c === 'play').length, playCount);
  h.session.toggle();
  assert.equal(h.session.snapshot().status, 'playing');
  assert.equal(h.calls.filter(c => c === 'play').length, playCount + 1);
});

test('scrubbing overrides a pending frame and aligns voice only after the new frame commits', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.now(2500);
  const olderFrame = h.session.tick();
  const scrub = h.session.seek(0, .5);
  assert.equal(h.updates[0].signal.aborted, true);
  assert.equal(h.updates[1].progress, .5);
  assert.ok(!h.calls.some(call => call.startsWith('seek:')));
  h.updates[1].resolve(true);
  assert.equal(await scrub, true);
  h.updates[0].resolve(false);
  await olderFrame;
  const paused = h.session.snapshot();
  assert.equal(paused.status, 'paused');
  assert.equal(paused.progress, .5);
  assert.equal(h.calls.at(-1), 'seek:' + paused.elapsed);
  h.now(7000);
  h.session.toggle();
  h.now(8000);
  assert.equal(h.session.snapshot().elapsed, paused.elapsed + 1);
});

test('repeated scrubs in a newly selected chapter coalesce without reloading its clip', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  const scrub = h.session.seek(1, .2);
  assert.equal(h.prepares[1].progress, .2);
  await h.session.seek(1, .8);
  h.prepares[1].resolve(true); await settle();
  h.loads[1].resolve(15); await settle();
  assert.equal(h.prepares.length, 2);
  assert.equal(h.loads.length, 2);
  assert.deepEqual(h.updates.map(item => item.progress), [.8]);
  h.updates[0].resolve(true);
  assert.equal(await scrub, true);
  assert.equal(h.session.snapshot().status, 'paused');
  assert.ok(Math.abs(h.session.snapshot().progress - .8) < 1e-8);
});

test('an active timeline jump continues only after both the target chapter and the matching audio position are ready', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  const jump = h.session.seek(1, .5, {play: true});
  assert.equal(h.session.snapshot().status, 'loading');
  h.prepares[1].resolve(true); await settle();
  h.loads[1].resolve(15); await settle();
  assert.equal(h.calls.filter(call => call === 'play').length, 1);
  h.updates[0].resolve(true);
  assert.equal(await jump, true);
  assert.equal(h.session.snapshot().index, 1);
  assert.equal(h.session.snapshot().status, 'playing');
  assert.deepEqual(h.calls.slice(-2), ['seek:8.1', 'play']);
});

test('manual exploration can supersede a buffered frame without losing the chapter', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.now(2000); const old = h.session.tick();
  assert.equal(h.session.snapshot().status, 'buffering');
  h.session.holdForExploration();
  assert.equal(h.updates[0].signal.aborted, true);
  h.updates[0].resolve(false); await old;
  assert.equal(h.session.snapshot().status, 'paused');
  assert.equal(h.session.snapshot().elapsed, 2);
  h.session.resume();
  assert.equal(h.session.snapshot().status, 'playing');
});

test('a busy tick cannot overlap another update, and an old completed tick cannot skip a newly chosen chapter', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.now(30000); const oldTick = h.session.tick();
  assert.equal(h.updates[0].progress, 1);
  await h.session.tick(); assert.equal(h.updates.length, 1);
  const selected = h.session.go(1); await h.ready(selected);
  assert.equal(h.updates[0].signal.aborted, true);
  h.updates[0].resolve(true); await oldTick;
  assert.equal(h.session.snapshot().index, 1, 'old chapter completion cannot advance to chapter 2');
  assert.equal(h.prepares.length, 2);
  const newTick = h.session.tick(); assert.equal(h.updates.length, 2);
  h.updates[1].resolve(true); await newTick;
});

test('old rejected ticks after exit or chapter replacement cannot change the current state or pause current audio', async () => {
  for (const destination of ['stop', 'chapter']) {
    const h = harness(); await h.ready(h.session.start(tour, 'test'));
    h.now(1000); const old = h.session.tick();
    if (destination === 'stop') h.session.stop(); else await h.ready(h.session.next());
    const pauses = h.calls.filter(c => c === 'pause').length;
    h.updates[0].reject(new Error('old update failure')); await old;
    assert.equal(h.calls.filter(c => c === 'pause').length, pauses);
    assert.equal(h.session.snapshot().status, destination === 'stop' ? 'idle' : 'playing');
    assert.equal(h.session.snapshot().error, '');
  }
});

test('a current tick failure pauses media in error and does not advance to another chapter', async () => {
  for (const failure of ['false', 'throw']) {
    const h = harness(); await h.ready(h.session.start(tour, 'test'));
    h.now(5000); const tick = h.session.tick();
    if (failure === 'false') h.updates[0].resolve(false); else h.updates[0].reject(new Error('frame unavailable'));
    await tick;
    assert.equal(h.session.snapshot().status, 'error'); assert.equal(h.session.snapshot().elapsed, 5);
    assert.equal(h.session.snapshot().index, 0); assert.equal(h.prepares.length, 1);
    assert.equal(h.calls.at(-1), 'pause'); assert.ok(h.session.snapshot().error);
  }
});

test('completion waits for the final scene update, ends once, and explicit resume restarts from chapter zero', async () => {
  const h = harness(), single = { ...tour, steps: [tour.steps[0]] };
  await h.ready(h.session.start(single, 'test'));
  h.now(30000); const tick = h.session.tick();
  assert.equal(h.session.snapshot().status, 'buffering', 'the final observation is still pending, with narration held');
  h.updates[0].resolve(true); await tick;
  assert.equal(h.session.snapshot().status, 'ended');
  assert.equal(h.session.snapshot().elapsed, h.session.snapshot().duration);
  assert.equal(h.session.snapshot().progress, 1); assert.equal(h.calls.at(-1), 'stop');
  const calls = h.calls.length; await h.session.tick(); assert.equal(h.calls.length, calls);
  const restart = h.session.resume(); assert.equal(h.session.snapshot().index, 0);
  assert.equal(h.session.snapshot().status, 'loading'); await h.ready(restart);
  assert.equal(h.session.snapshot().status, 'playing'); assert.equal(h.session.snapshot().elapsed, 0);
});

test('pausing during a final pending tick blocks automatic next-chapter playback', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.now(30000); const tick = h.session.tick(); h.session.pause();
  h.updates[0].resolve(true); await tick;
  assert.equal(h.session.snapshot().status, 'paused'); assert.equal(h.session.snapshot().index, 0);
  assert.equal(h.prepares.length, 1);
});

test('a slow real-frame update freezes both effective chapter time and media, then resumes from that time', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.now(5000); const tick = h.session.tick(), held = h.session.snapshot();
  assert.equal(held.status, 'buffering'); assert.equal(held.elapsed, 5);
  assert.equal(h.calls.at(-1), 'pause');
  h.now(65000);
  assert.equal(h.session.snapshot().elapsed, 5); assert.equal(h.session.snapshot().progress, held.progress);
  await h.session.tick(); assert.equal(h.updates.length, 1, 'buffering cannot request another scene update');
  h.updates[0].resolve(true); await tick;
  assert.equal(h.session.snapshot().status, 'playing'); assert.equal(h.session.snapshot().elapsed, 5);
  assert.equal(h.calls.at(-1), 'play');
  h.now(67000); assert.equal(h.session.snapshot().elapsed, 7, 'the sixty seconds of loading are excluded');
});

test('pausing while buffering prevents media from resuming when the frame finally arrives', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.now(4000); const tick = h.session.tick();
  h.now(8000); h.session.pause();
  const plays = h.calls.filter(c => c === 'play').length;
  h.now(20000); h.updates[0].resolve(true); await tick;
  assert.equal(h.session.snapshot().status, 'paused'); assert.equal(h.session.snapshot().elapsed, 4);
  assert.equal(h.calls.filter(c => c === 'play').length, plays);
  h.now(40000); assert.equal(h.session.snapshot().elapsed, 4);
  h.session.resume(); h.now(41000); assert.equal(h.session.snapshot().elapsed, 5);
});

test('resume requested during buffering waits for frame completion instead of starting audio early', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.now(3000); const tick = h.session.tick();
  h.session.pause(); const plays = h.calls.filter(c => c === 'play').length;
  h.session.resume(); h.now(10000);
  assert.equal(h.session.snapshot().status, 'buffering'); assert.equal(h.session.snapshot().elapsed, 3);
  assert.equal(h.calls.filter(c => c === 'play').length, plays);
  h.updates[0].resolve(true); await tick;
  assert.equal(h.session.snapshot().status, 'playing'); assert.equal(h.session.snapshot().elapsed, 3);
  assert.equal(h.calls.filter(c => c === 'play').length, plays + 1);
});

test('exiting a buffered transaction prevents a late successful frame from restarting narration', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.now(3000); const tick = h.session.tick(); assert.equal(h.session.snapshot().status, 'buffering');
  h.session.stop(); const plays = h.calls.filter(c => c === 'play').length;
  assert.equal(h.updates[0].signal.aborted, true);
  h.now(50000); h.updates[0].resolve(true); await tick;
  assert.equal(h.session.snapshot().status, 'idle'); assert.equal(h.session.snapshot().active, false);
  assert.equal(h.calls.filter(c => c === 'play').length, plays);
  assert.equal(h.calls.at(-1), 'stop');
});

test('a delayed update failure keeps the held timestamp rather than counting the loading wait', async () => {
  const h = harness(); await h.ready(h.session.start(tour, 'test'));
  h.now(2000); const tick = h.session.tick(); h.now(62000);
  h.updates[0].resolve(false); await tick;
  assert.equal(h.session.snapshot().status, 'error'); assert.equal(h.session.snapshot().elapsed, 2);
  assert.equal(h.session.snapshot().index, 0); assert.equal(h.prepares.length, 1);
});

test('synchronous cached or no-op updates do not buffer or interrupt smooth media playback', async () => {
  const h = harness({ synchronousUpdate: true }); await h.ready(h.session.start(tour, 'test'));
  h.now(2000); const before = h.calls.length, tick = h.session.tick();
  assert.equal(h.session.snapshot().status, 'playing');
  assert.deepEqual(h.calls.slice(before), ['update:step-0']);
  await tick; h.now(3000);
  assert.equal(h.session.snapshot().elapsed, 3);
  assert.equal(h.calls.includes('pause'), false);
  assert.equal(h.changes.some(s => s.status === 'buffering'), false);
});
