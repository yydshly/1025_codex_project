import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {dynamicTicks} from '../app/dynamic-data.js';
import {dynamicEvents} from '../app/dynamic-events.js';
import {tours} from '../app/narration-script.js';
import {recordedNarratedTime, recordedNarrationPosition} from '../app/recorded-narration-clock.js';
import {recordedSceneBeats} from '../app/recorded-narration-scenes.js';
import {makeClockTicks, utcMillis} from '../app/sync-timeline.js';

const read = file => JSON.parse(readFileSync(new URL('../app/' + file, import.meta.url), 'utf8'));
const numericTick = tick => typeof tick === 'number' ? tick : utcMillis(tick);

test('every native tick in the six Earth replays and B0005 round-trips through the narration clock', () => {
  const events = ['volcano', 'quake', 'quake-hualien', 'storm', 'river-big-piney', 'battery-b0005'].map(key => {
    const event = dynamicEvents[key];
    return ['dynamic-' + key, event.tour ? event.id : key, (event.tour ?? tours[key]).steps, dynamicTicks(read(event.url))];
  });
  events.push(['typhoon-real', 'mangkhut', tours.mangkhut.steps, makeClockTicks(read('data/mangkhut-synchronized.json'))]);
  for (const [route, key, steps, ticks] of events) {
    assert.ok(ticks.length > 1, route + ' has no observation window');
    const lookup = chapter => recordedSceneBeats(key, chapter);
    const nativeTicks = new Set(ticks.map(numericTick));
    for (const [chapter, {cue}] of steps.entries()) {
      if(cue.terrain){
        assert.equal(route,'dynamic-volcano');
        assert.equal(recordedNarratedTime(cue,.5),null);
        assert.notEqual(recordedNarrationPosition(steps,route,ticks[0],chapter,lookup)?.chapter,chapter);
        continue;
      }
      const beats = lookup(chapter);
      if (route !== 'dynamic-battery-b0005') assert.ok(beats.length, route + ' has an undirected chapter');
      for (const beat of beats) {
        assert.ok(nativeTicks.has(numericTick(beat.tick)), route + ' points to a missing sample');
        assert.equal(recordedNarratedTime(cue, beat.progress, beats), numericTick(beat.tick), route + ' misses an authored beat');
      }
    }
    for (const [index, tick] of ticks.entries()) {
      const match = recordedNarrationPosition(steps, route, tick, -1, lookup);
      assert.ok(match, route + ' has no narration for ' + tick);
      const clock = recordedNarratedTime(steps[match.chapter].cue, match.progress, lookup(match.chapter));
      assert.ok(clock >= numericTick(tick), route + ' skipped backward at ' + tick);
      if (index < ticks.length - 1) assert.ok(clock < numericTick(ticks[index + 1]), route + ' skipped forward at ' + tick);
    }
  }
});

test('shared chapter boundaries preserve active narration and uncovered times stay uncued', () => {
  const route = 'dynamic-example';
  const steps = [
    {cue: {route, elapsedSeconds: -600}},
    {cue: {route, elapsedSeconds: -600, endElapsedSeconds: 0}},
    {cue: {route, elapsedSeconds: 0, endElapsedSeconds: 15}},
    {cue: {route: 'dynamic-another', elapsedSeconds: 15, endElapsedSeconds: 40}},
    {cue: {route, elapsedSeconds: 50}},
  ];
  assert.deepEqual(recordedNarrationPosition(steps, route, -600, 0), {chapter: 0, progress: 0});
  assert.deepEqual(recordedNarrationPosition(steps, route, 0, 1), {chapter: 1, progress: 1});
  assert.deepEqual(recordedNarrationPosition(steps, route, 0), {chapter: 2, progress: 0});
  assert.deepEqual(recordedNarrationPosition(steps, route, 50), {chapter: 4, progress: 0});
  assert.equal(recordedNarrationPosition(steps, route, -601), null);
  assert.equal(recordedNarrationPosition(steps, route, 51), null);
  assert.equal(recordedNarrationPosition(steps, route, 30), null);
  assert.equal(recordedNarrationPosition(steps, 'dynamic-unknown', 0), null);
  assert.equal(recordedNarrationPosition(steps, route, '2025-01-15T00:00:00Z'), null);
  assert.equal(recordedNarrationPosition(steps, route, 'invalid'), null);
});

test('guided cloud sequences give adjacent scans time to be seen and retain a fixed shot', () => {
  const {clips} = read('assets/narration/manifest.json');
  const sequences = [
    ['volcano', 4, ['03:50', '04:00', '04:10', '04:20']],
    ['volcano', 5, ['05:20', '05:30', '05:40', '05:50', '06:00', '06:10']],
    ['storm', 1, ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '09:50']],
    ['mangkhut', 0, ['03:20', '03:30', '03:40', '03:50', '04:00']],
  ];
  for (const [key, chapter, clocks] of sequences) {
    const beats = recordedSceneBeats(key, chapter);
    const matching = beats.filter(beat => beat.slowScan && clocks.includes(beat.tick.slice(11, 16)));
    assert.deepEqual(matching.map(beat => beat.tick.slice(11, 16)), clocks, `${key} must show the selected native scans in order`);
    assert.equal(new Set(matching.map(beat => beat.cloudShot)).size, 1, `${key} must keep a fixed geographic reference`);
    for (const [index, beat] of matching.entries()) {
      const next = matching[index + 1];
      if (!next) break;
      const seconds = (next.progress - beat.progress) * (clips[`${key}-${chapter}`].durationSeconds + 1.2);
      assert.ok(seconds >= 1.3, `${key} scan ${beat.tick} only has ${seconds} seconds`);
    }
  }
});

test('a shared native peak seeks to the spoken beat and stays put during its hold', () => {
  const steps = tours.quake.steps;
  const tick = '2011-03-11T05:49:20Z';
  const lookup = chapter => chapter === 1 ? [{progress: .56, tick}, {progress: .82, tick}] : [];
  const route = 'dynamic-quake';
  assert.deepEqual(recordedNarrationPosition(steps, route, tick, 2, lookup), {chapter: 1, progress: .56});
  for (const progress of [.56, .69, .82, 1]) {
    assert.equal(recordedNarratedTime(steps[1].cue, progress, lookup(1)), utcMillis(tick));
  }
  const earlier = '2011-03-11T05:49:05Z';
  const match = recordedNarrationPosition(steps, route, earlier, 1, lookup);
  assert.ok(match.progress < .56);
  assert.equal(recordedNarratedTime(steps[match.chapter].cue, match.progress, lookup(match.chapter)), utcMillis(earlier));
});

test('piecewise elapsed seeks still floor to their native observations', () => {
  const event = dynamicEvents['river-big-piney'];
  const steps = event.tour.steps;
  const route = 'dynamic-river-big-piney';
  const lookup = chapter => chapter === 1 ? [{progress: .4, tick: 3510}, {progress: .6, tick: 3510}] : [];
  const ticks = dynamicTicks(read(event.url)).filter(tick => tick >= 3000 && tick <= 7200);
  assert.deepEqual(recordedNarrationPosition(steps, route, 3510, 1, lookup), {chapter: 1, progress: .4});
  for (const [index, tick] of ticks.entries()) {
    const match = recordedNarrationPosition(steps, route, tick, 1, lookup);
    const position = recordedNarratedTime(steps[match.chapter].cue, match.progress, lookup(match.chapter));
    assert.ok(position >= tick);
    if (index < ticks.length - 1) assert.ok(position < ticks[index + 1]);
  }
});
