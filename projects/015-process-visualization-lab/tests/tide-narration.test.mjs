import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {dynamicEvents} from '../app/dynamic-events.js';
import {tideNarratedTime, tideNarrationPosition, tideSceneFocus} from '../app/tide-narration.js';
import {tideTeachingFrame} from '../app/tide-lesson.js';

const event = dynamicEvents['tide-san-francisco'];
const steps = event.tour.steps;
const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const data = read('../app/' + event.url);
const manifest = read('../app/assets/narration/manifest.json');

test('one teaching rotation crosses two high-water zones and the coastal inset uses the same phase', () => {
  for (const [progress,level] of [[0,0],[.25,1],[.5,0],[.75,1],[1,0]]) {
    const global = tideTeachingFrame('forces',progress);
    assert.equal(global.level,level);
    if (progress <= .5) assert.deepEqual(tideTeachingFrame('impact',progress * 2),global);
  }
  assert.equal(tideTeachingFrame('impact',.25).rising,true);
  assert.equal(tideTeachingFrame('impact',.75).rising,false);
});

test('tide chapter cues reference native ticks and the matching MiniMax clips', () => {
  const ticks = new Set(data.clock.map(row => row.timeUtc));
  for (const [chapter, {cue}] of steps.entries()) {
    if (!cue.tideBeats) continue;
    assert.equal(cue.voiceSeconds, manifest.clips[event.id + '-' + chapter].durationSeconds);
    let previousSecond = 0, previousTick = Date.parse(cue.timeUtc);
    for (const [second, tick] of cue.tideBeats) {
      assert.ok(second > previousSecond && second <= cue.voiceSeconds);
      assert.ok(ticks.has(tick) && Date.parse(tick) >= previousTick && Date.parse(tick) <= Date.parse(cue.endTimeUtc));
      previousSecond = second;
      previousTick = Date.parse(tick);
    }
  }
});

test('every native sample round-trips through the same mapping used by scrub and playback', () => {
  for (const {timeUtc} of data.clock) {
    const {chapter, progress} = tideNarrationPosition(steps, timeUtc);
    const {cue} = steps[chapter];
    const target = tideNarratedTime(cue, progress) ??
      Math.round(Date.parse(cue.timeUtc) + (Date.parse(cue.endTimeUtc) - Date.parse(cue.timeUtc)) * progress);
    assert.equal(target, Date.parse(timeUtc), timeUtc);
  }
});

test('keyframes seek to their spoken moment and activate only the matching scene focus', () => {
  assert.deepEqual(steps.slice(0,3).map(step=>step.cue.tideLesson),['intro','forces','impact']);
  const {moonRiseBracket, moonSetBracket, predictedMax, observedMax} = data.moments;
  for (const [tick, chapter, focus] of [
    [moonRiseBracket.toUtc, 4, 'rise'],
    [moonSetBracket.toUtc, 5, 'set'],
    [predictedMax.timeUtc, 6, 'peak'],
    [observedMax.timeUtc, 6, 'peak'],
  ]) {
    assert.equal(tideNarrationPosition(steps, tick).chapter, chapter);
    assert.equal(tideSceneFocus(data.moments, tick), focus);
  }
  assert.equal(tideSceneFocus(data.moments, data.moments.moonMaxElevation.timeUtc), null);
});
