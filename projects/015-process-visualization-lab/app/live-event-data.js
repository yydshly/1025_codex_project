const KINDS = new Set(['quake', 'volcano', 'storm']);

function text(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(label + '不能为空');
}
function utc(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) throw new TypeError('时间必须为 ISO UTC，明确标注 Z');
  const time = Date.parse(value), normalized = value.replace(/(?:\.(\d{1,3}))?Z$/, (_, fraction = '') => '.' + fraction.padEnd(3, '0') + 'Z');
  if (!Number.isFinite(time) || new Date(time).toISOString() !== normalized) throw new TypeError('无效 UTC 日期');
  return time;
}
function url(value, label) {
  text(value, label);
  let parsed; try { parsed = new URL(value); } catch { throw new TypeError(label + '必须是完整网页 URL'); }
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new TypeError(label + '只接受 HTTP/HTTPS');
}
function coordinates(record) {
  if (!Number.isFinite(record?.lat) || Math.abs(record.lat) > 90 || !Number.isFinite(record?.lon) || Math.abs(record.lon) > 180) throw new RangeError('事件或观测经纬度无效');
}
function nullableNumber(value, label) {
  if (value !== null && !Number.isFinite(value)) throw new TypeError(label + '必须是有限数值或 null');
}
function observations(event) {
  if (!Array.isArray(event?.observations) || !event.observations.length) throw new TypeError('事件需要至少一条有实际时间和坐标的记录');
  let previous = -Infinity;
  for (const obs of event.observations) {
    const time = utc(obs?.timeUtc);
    if (time <= previous) throw new RangeError('观测时间必须严格递增且不能重复');
    previous = time; coordinates(obs);
    for (const field of ['magnitude', 'depthKm', 'value']) if (obs[field] !== undefined) nullableNumber(obs[field], field);
  }
  return event.observations;
}

/** Source snapshots remain snapshots: no unit conversion, zero-filling, sorting or date substitution. */
export function validateEventFeed(data) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.sources) || !data.sources.length || !Array.isArray(data.events)) throw new TypeError('近期事件资料包结构无效');
  const retrieved = utc(data.retrievedAtUtc), sourceIds = new Set(), eventIds = new Set();
  for (const source of data.sources) {
    for (const field of ['id', 'name', 'coverageLabel', 'status']) text(source?.[field], '来源 ' + field);
    if (sourceIds.has(source.id)) throw new RangeError('来源 id 不能重复');
    sourceIds.add(source.id); url(source.url, '来源 URL');
    if (utc(source.retrievedAtUtc) > retrieved) throw new RangeError('来源获取时间不能晚于资料包获取时间');
  }
  for (const event of data.events) {
    for (const field of ['id', 'title', 'statusLabel']) text(event?.[field], '事件 ' + field);
    if (eventIds.has(event.id)) throw new RangeError('事件 id 不能重复');
    eventIds.add(event.id);
    if (!KINDS.has(event.kind)) throw new TypeError('事件 kind 只接受 quake、volcano、storm');
    coordinates(event); nullableNumber(event.magnitude, 'magnitude'); nullableNumber(event.depthKm, 'depthKm');
    const start = utc(event.timeUtc), end = utc(event.lastObservedUtc), records = observations(event);
    if (end < start || utc(records[0].timeUtc) < start || utc(records.at(-1).timeUtc) !== end) throw new RangeError('事件时间范围必须覆盖观测，末条时间必须等于 lastObservedUtc');
    if (end > retrieved) throw new RangeError('实际观测不能晚于资料包获取时间');
    text(event.source?.name, '事件来源名称'); url(event.source?.url, '事件来源 URL'); url(event.sourceDetailUrl, '事件详情 URL');
    if (event.description !== undefined && event.description !== null && typeof event.description !== 'string') throw new TypeError('事件说明必须为文字');
  }
  return data;
}

/** Filter without reordering or dropping source records. */
export function filterEvents(data, kind = 'all') {
  if (kind !== 'all' && !KINDS.has(kind)) throw new TypeError('不支持的事件分类');
  if (!Array.isArray(data?.events)) throw new TypeError('事件列表无效');
  return data.events.filter(event => kind === 'all' || event.kind === kind);
}

/** Ticks are original observations, not evenly spaced synthetic frames. */
export function buildEventTimeline(event) {
  return observations(event).slice();
}
