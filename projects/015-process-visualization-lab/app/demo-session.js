const DEFAULT_DURATION_SECONDS = 16;
const DEFAULT_HOLD_SECONDS = 1;

function milliseconds(value, name) {
  const result = Date.parse(value);
  if (!Number.isFinite(result)) throw new Error(`${name} 必须是有效的 UTC 时间。`);
  return result;
}

function floorIndex(ticks, time) {
  let low = 0, high = ticks.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (ticks[middle].ms <= time) low = middle;
    else high = middle - 1;
  }
  return low;
}

function prepareRange(task, result) {
  if (!Array.isArray(result?.ticks) || result.ticks.length === 0) throw new Error('这个观察区间没有可播放的真实记录。');
  const times = [...new Set(result.ticks.map(value => milliseconds(value, '记录时间')))].sort((a, b) => a - b);
  const ticks = times.map(ms => ({ ms, utc: new Date(ms).toISOString() }));
  const requestedFrom = task.fromUtc == null ? times[0] : milliseconds(task.fromUtc, '起点');
  const requestedTo = task.toUtc == null ? times.at(-1) : milliseconds(task.toUtc, '终点');
  if (requestedTo < requestedFrom) throw new Error('观察区间的终点不能早于起点。');
  if (requestedTo < times[0] || requestedFrom > times.at(-1)) throw new Error('观察区间不在真实记录覆盖范围内。');
  return ticks.slice(floorIndex(ticks, requestedFrom), floorIndex(ticks, requestedTo) + 1);
}

/**
 * Plays only supplied observation times. prepare() must commit the floor-aligned
 * first record before resolving; seek() must commit both globe and charts only
 * while its AbortSignal is current. A cancelled callback cannot revive playback.
 * now() is a monotonic millisecond clock, not an observation timestamp.
 */
export function createDemoSession({ prepare, seek, pause: pauseSource = () => {}, onChange = () => {}, now = () => performance.now() } = {}) {
  if (typeof prepare !== 'function' || typeof seek !== 'function') throw new TypeError('prepare 和 seek 回调为必填项。');

  let state = { active: false, task: null, status: 'idle', timeUtc: null, progress: 0, error: null, fromUtc: null, toUtc: null };
  let ticks = [], index = -1, durationMs = DEFAULT_DURATION_SECONDS * 1000, holdMs = DEFAULT_HOLD_SECONDS * 1000;
  let elapsedMs = 0, lastClock = null, version = 0, operation = null;

  const snapshot = () => ({ ...state, task: state.task ? { ...state.task } : null });
  const clock = () => { const value = Number(now()); return Number.isFinite(value) ? value : 0; };
  function publish(changes) {
    const changed = Object.entries(changes).some(([key, value]) => state[key] !== value);
    state = { ...state, ...changes };
    if (changed) onChange(snapshot());
  }
  function cancel() {
    version++;
    if (operation) {
      // An unfinished frame never advances the committed clock on pause/resume.
      elapsedMs = operation.rollbackElapsed;
      operation.controller.abort();
    }
    operation = null;
    lastClock = null;
  }
  function begin(rollbackElapsed = elapsedMs) {
    cancel();
    const current = { version, controller: new AbortController(), rollbackElapsed };
    operation = current;
    return current;
  }
  const current = request => operation === request && version === request.version && !request.controller.signal.aborted;
  function stopSource() { pauseSource(); }
  function fail(error, request) {
    if (!current(request)) return false;
    elapsedMs = request.rollbackElapsed;
    operation = null;
    lastClock = null;
    publish({ status: 'error', error: error instanceof Error ? error.message : String(error || '无法载入真实记录。') });
    stopSource();
    return false;
  }
  function commit(nextIndex) {
    index = nextIndex;
    const span = ticks.at(-1).ms - ticks[0].ms;
    return { timeUtc: ticks[index].utc, progress: span ? (ticks[index].ms - ticks[0].ms) / span : 0 };
  }
  function finish() {
    lastClock = null;
    publish({ status: 'complete', progress: 1, error: null });
    stopSource();
  }

  async function requestSeek(nextIndex, { status, nextElapsed, rollbackElapsed = elapsedMs, completed = false, force = false }) {
    if (nextIndex === index && !force) {
      elapsedMs = nextElapsed;
      lastClock = status === 'playing' ? clock() : null;
      publish({ ...commit(nextIndex), status, error: null });
      if (completed) finish();
      return true;
    }
    const request = begin(rollbackElapsed);
    try {
      const accepted = await seek(ticks[nextIndex].utc, { signal: request.controller.signal });
      if (!current(request)) return false;
      if (accepted !== true) throw new Error('该时刻的真实记录未成功提交，播放已停止。');
      operation = null;
      elapsedMs = nextElapsed;
      lastClock = status === 'playing' ? clock() : null;
      publish({ ...commit(nextIndex), status, error: null });
      if (completed) finish();
      return true;
    } catch (error) { return fail(error, request); }
  }

  async function open(task) {
    cancel();
    stopSource();
    ticks = []; index = -1; elapsedMs = 0;
    const selectedTask = task && typeof task === 'object' ? { ...task } : null;
    publish({ active: true, task: selectedTask, status: 'loading', timeUtc: null, progress: 0, error: null, fromUtc: null, toUtc: null });
    const request = begin(0);
    try {
      if (!selectedTask) throw new Error('缺少观察任务。');
      const seconds = Number(selectedTask.durationSeconds ?? DEFAULT_DURATION_SECONDS), hold = Number(selectedTask.holdSeconds ?? DEFAULT_HOLD_SECONDS);
      if (!Number.isFinite(seconds) || seconds <= 0 || !Number.isFinite(hold) || hold < 0) throw new Error('播放时长必须大于零，起点停留时间不能为负。');
      const prepared = await prepare({ ...selectedTask }, { signal: request.controller.signal });
      if (!current(request)) return false;
      ticks = prepareRange(selectedTask, prepared);
      durationMs = seconds * 1000; holdMs = hold * 1000; elapsedMs = 0;
      operation = null; lastClock = clock();
      publish({ ...commit(0), fromUtc: ticks[0].utc, toUtc: ticks.at(-1).utc, status: 'playing', error: null });
      return true;
    } catch (error) { return fail(error, request); }
  }

  function pause() {
    if (!state.active) return;
    cancel();
    stopSource();
    publish({ status: 'paused' });
  }

  async function play() {
    if (!state.active) return false;
    if (state.status === 'playing') return true;
    if (operation) return false;
    if (!ticks.length) return open(state.task);
    stopSource();
    if (index === ticks.length - 1 || state.status === 'complete') {
      publish({ status: 'loading', error: null });
      return requestSeek(0, { status: 'playing', nextElapsed: 0, force: true });
    }
    // The main timeline may have moved while this session was paused. Recommit
    // the stored observation before resuming; loading time does not advance it.
    publish({ status: 'loading', error: null });
    return requestSeek(index, { status: 'playing', nextElapsed: elapsedMs, force: true });
  }

  async function jump(edge) {
    if (edge !== 'a' && edge !== 'b') throw new TypeError('jump 只接受 a 或 b。');
    if (!state.active || !ticks.length) return false;
    cancel(); stopSource();
    const target = edge === 'a' ? 0 : ticks.length - 1;
    publish({ status: 'loading', error: null });
    return requestSeek(target, { status: 'paused', nextElapsed: edge === 'a' ? 0 : holdMs + durationMs, force: true });
  }

  function close() {
    cancel(); stopSource();
    ticks = []; index = -1; elapsedMs = 0;
    publish({ active: false, task: null, status: 'idle', timeUtc: null, progress: 0, error: null, fromUtc: null, toUtc: null });
  }

  async function tick() {
    if (!state.active || state.status !== 'playing' || operation) return false;
    const at = clock(), previousElapsed = elapsedMs;
    const delta = lastClock == null ? 0 : Math.max(0, at - lastClock);
    lastClock = at;
    elapsedMs = Math.min(holdMs + durationMs, elapsedMs + delta);
    const fraction = ticks.length === 1 ? (elapsedMs >= holdMs ? 1 : 0) : Math.max(0, Math.min(1, (elapsedMs - holdMs) / durationMs));
    const targetTime = ticks[0].ms + (ticks.at(-1).ms - ticks[0].ms) * fraction;
    const target = floorIndex(ticks, targetTime);
    if (target === index) {
      if (fraction >= 1) { finish(); return true; }
      return false;
    }
    return requestSeek(target, { status: 'playing', nextElapsed: elapsedMs, rollbackElapsed: previousElapsed, completed: fraction >= 1 });
  }

  return { open, play, pause, jump, close, tick, snapshot };
}
