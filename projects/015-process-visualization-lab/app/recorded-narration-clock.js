import {utcMillis} from './sync-timeline.js';

function utcValue(value) {
  try {
    return utcMillis(value);
  } catch {
    return NaN;
  }
}

function cueRange(cue) {
  const elapsed = cue?.elapsedSeconds != null;
  const from = elapsed ? cue.elapsedSeconds : utcValue(cue?.timeUtc);
  const end = elapsed ? cue?.endElapsedSeconds : cue?.endTimeUtc;
  const to = end == null ? from : elapsed ? end : utcValue(end);
  return Number.isFinite(from) && Number.isFinite(to) && from <= to ? {from, to, elapsed} : null;
}

function cuePoints({from, to, elapsed}, beats) {
  const start = {progress: 0, time: from}, end = {progress: 1, time: to};
  if (!Array.isArray(beats) || !beats.length) return [start, end];
  const points = [];
  for (const beat of beats) {
    const {progress, tick} = beat ?? {};
    const time = elapsed ? tick : utcValue(tick);
    const previous = points.at(-1);
    if (!Number.isFinite(progress) || progress < 0 || progress > 1 ||
        !Number.isFinite(time) || time < from || time > to ||
        (progress === 0 && time !== from) || (progress === 1 && time !== to) ||
        (previous && (progress <= previous.progress || time < previous.time))) return [start, end];
    points.push({progress, time, authored: true});
  }
  if (points[0].progress !== 0) points.unshift(start);
  if (points.at(-1).progress !== 1) points.push(end);
  return points;
}

function timeAtProgress(points, progress) {
  const fraction = Math.max(0, Math.min(1, progress));
  const index = points.findIndex(point => point.progress >= fraction);
  const end = points[index];
  if (index === 0 || end.progress === fraction) return end.time;
  const start = points[index - 1];
  return start.time + (end.time - start.time) * (fraction - start.progress) / (end.progress - start.progress);
}

/** Returns elapsed seconds or UTC milliseconds before choosing a native sample. */
export function recordedNarratedTime(cue, progress, beats = []) {
  const range = cueRange(cue);
  if (!range || !Number.isFinite(progress)) return null;
  const time = timeAtProgress(cuePoints(range, beats), progress);
  return range.elapsed ? time : Math.round(time);
}

/** Gaps between authored cues stay uncovered. Explicit beats match the spoken chapter. */
export function recordedNarrationPosition(steps, route, tick, currentIndex = -1, beatsForChapter = () => []) {
  const elapsed = typeof tick === 'number';
  const target = elapsed ? tick : utcValue(tick);
  if (!Number.isFinite(target)) return null;
  const matches = [];
  for (const [chapter, {cue}] of steps.entries()) {
    if (cue?.route !== route || cue.terrain) continue;
    const range = cueRange(cue);
    if (!range || range.elapsed !== elapsed || target < range.from || target > range.to) continue;
    const points = cuePoints(range, beatsForChapter(chapter));
    const beat = points.find(point => point.authored && point.time === target);
    const endIndex = points.findIndex(point => point.time >= target);
    const end = points[endIndex];
    let progress = beat?.progress ?? end.progress;
    if (!beat && end.time !== target) {
      const start = points[endIndex - 1];
      progress = start.progress + (end.progress - start.progress) * (target - start.time) / (end.time - start.time);
      // Keep elapsed seeks on the selected sample if inverse arithmetic rounds just below it.
      if (elapsed && timeAtProgress(points, progress) < target) progress = Math.min(end.progress, progress + Number.EPSILON);
    }
    matches.push({chapter, progress, moving: range.to > range.from, authored: Boolean(beat)});
  }
  const match = matches.find(item => item.authored && item.chapter === currentIndex) ??
    matches.find(item => item.authored) ??
    matches.find(item => item.chapter === currentIndex) ??
    matches.find(item => item.moving && item.progress === 0) ??
    matches.find(item => !item.moving) ?? matches[0];
  return match ? {chapter: match.chapter, progress: match.progress} : null;
}
