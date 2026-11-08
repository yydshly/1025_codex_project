import {utcMillis} from './sync-timeline.js';

// These beats refer to phrase boundaries in the existing WAVs. The player
// leaves 1.2 seconds after each chapter, so the final picture can settle.
function timing(cue) {
  const duration = cue.voiceSeconds + 1.2;
  return [
    [0, utcMillis(cue.timeUtc)],
    ...(cue.tideBeats ?? []).map(([second, time]) => [second / duration, utcMillis(time)]),
    [1, utcMillis(cue.endTimeUtc)],
  ];
}

export function tideNarratedTime(cue, progress) {
  if (!cue.tideBeats) return null;
  const points = timing(cue);
  const end = points.findIndex(([position]) => position >= progress);
  if (end < 0) return points.at(-1)[1];
  if (end === 0) return points[0][1];
  const [a, from] = points[end - 1];
  const [b, to] = points[end];
  return Math.round(from + (to - from) * (progress - a) / (b - a));
}

export function tideNarrationPosition(steps, tick) {
  const time = utcMillis(tick);
  // At chapter boundaries, prefer the chapter that names this key frame.
  const anchor = steps.findIndex(({cue}) => cue.tideBeats?.some(([, observed]) => utcMillis(observed) === time));
  const chapter = anchor >= 0 ? anchor : steps.findLastIndex(({cue}) => cue.endTimeUtc && utcMillis(cue.timeUtc) <= time);
  if (chapter < 0) return null;
  const {cue} = steps[chapter];
  const points = cue.tideBeats ? timing(cue) : [[0, utcMillis(cue.timeUtc)], [1, utcMillis(cue.endTimeUtc)]];
  const end = points.findIndex(([, observed]) => observed >= time);
  if (end <= 0) return {chapter, progress: end === 0 ? 0 : 1};
  const [a, from] = points[end - 1];
  const [b, to] = points[end];
  return {chapter, progress: a + (b - a) * (time - from) / (to - from)};
}

export function tideSceneFocus(moments, timeUtc) {
  if (!moments || !timeUtc) return null;
  const tick = utcMillis(timeUtc);
  const within = (from, to, before, after) => (
    from && to && tick >= utcMillis(from) - before * 60_000 && tick <= utcMillis(to) + after * 60_000
  );
  const {moonRiseBracket:rise, moonSetBracket:set, predictedMax, observedMax} = moments;
  if (within(rise?.fromUtc, rise?.toUtc, 18, 12)) return 'rise';
  if (within(set?.fromUtc, set?.toUtc, 24, 12)) return 'set';
  if (within(predictedMax?.timeUtc, observedMax?.timeUtc, 24, 24)) return 'peak';
  return null;
}
