import { validateEventFeed } from './live-event-data.js';

/** Public official endpoints; no key, cookies, proxy or inferred event geometry. */
export const EARTH_EVENT_SOURCES = Object.freeze([
  { id: 'usgs_quakes', name: 'USGS 地震目录', url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson', coverageLabel: '过去 30 天 · M4.5+ 地震', documentationUrl: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php' },
  { id: 'eonet_recent', name: 'NASA EONET 近期事件', url: 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=90', coverageLabel: '过去 90 天的开放事件 · 仅明确命名的热带气旋及火山', documentationUrl: 'https://eonet.gsfc.nasa.gov/docs/v3' },
  { id: 'eonet_volcano_open', name: 'NASA EONET 开放火山目录', url: 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=volcanoes', coverageLabel: '开放火山事件目录 · 报告时间各异（不限定 90 天）', documentationUrl: 'https://eonet.gsfc.nasa.gov/docs/v3' },
  { id: 'usgs_volcano_status', name: 'USGS 火山状态通报', url: 'https://volcanoes.usgs.gov/hans-public/api/volcano/getElevatedVolcanoes', coordinateUrl: 'https://volcanoes.usgs.gov/vsc/api/volcanoApi/geojson', coverageLabel: 'USGS 当前较高警戒级别目录 · 时间为最近官方通报发布时间', documentationUrl: 'https://volcanoes.usgs.gov/hans-public/api/volcano/' }
]);

const TROPICAL_TITLE = /^(?:(?:Super|Severe)\s+)?(?:Typhoon|Hurricane|Tropical\s+(?:Cyclone|Storm|Depression))\b/i;
const numberOrNull = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
const sourceReference = source => ({ id: source.id, name: source.name, url: source.url });
function httpUrl(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
function utc(value) {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
function point(geometry) {
  const values = geometry?.coordinates;
  if (geometry?.type !== 'Point' || !Array.isArray(values)) return null;
  const [lon, lat] = values;
  return Number.isFinite(lon) && Math.abs(lon) <= 180 && Number.isFinite(lat) && Math.abs(lat) <= 90 ? { lat, lon } : null;
}
function diagnostics(count) { return { inputRecords: count, includedRecords: 0, skippedRecords: 0, unsupportedGeometries: 0, duplicateTimes: 0, conflictingDuplicateTimes: 0 }; }

/** Pure normalizer. An origin time is not a catalogue revision time. */
export function normalizeUSGS(raw, { source = EARTH_EVENT_SOURCES[0] } = {}) {
  if (raw?.type !== 'FeatureCollection' || !Array.isArray(raw.features)) throw new TypeError('USGS GeoJSON 缺少 FeatureCollection');
  const report = diagnostics(raw.features.length), events = [], ids = new Set();
  for (const feature of raw.features) {
    const p = feature?.properties, location = point(feature?.geometry), timeUtc = utc(p?.time), detail = httpUrl(p?.url);
    if (p?.type !== 'earthquake' || !location || !timeUtc || !detail || !feature.id || ids.has(String(feature.id))) { report.skippedRecords++; continue; }
    ids.add(String(feature.id));
    const magnitude = numberOrNull(p.mag), depthKm = numberOrNull(feature.geometry.coordinates[2]);
    events.push({
      id: `usgs-quake:${feature.id}`, kind: 'quake', title: String(p.title || p.place || feature.id), timeUtc, lastObservedUtc: timeUtc,
      statusLabel: p.status === 'reviewed' ? 'USGS 已审核目录记录' : `USGS 目录记录 · ${p.status || '状态未提供'}`,
      source: sourceReference(source), sourceDetailUrl: detail, ...location, depthKm, magnitude,
      observations: [{ timeUtc, ...location, magnitude, depthKm }],
      updatedAtUtc: utc(p.updated), magnitudeType: p.magType || null, recordType: 'earthquake-origin',
      timeMeaning: 'earthquake-origin-time-not-catalog-revision', geometryMeaning: 'catalog-epicenter-with-hypocentral-depth-not-shaking-extent',
      description: '位置、震级和震源深度来自 USGS 目录；目录可能修订。这条记录不提供地表震动范围、震波传播过程或台站波形。'
    });
  }
  report.includedRecords = events.length;
  return { events, diagnostics: report };
}

/** Only valid reported Points survive. Same-time points keep the first valid source-array point. */
export function normalizeEonet(raw, { source = EARTH_EVENT_SOURCES[1], allowedKinds = ['storm', 'volcano'] } = {}) {
  if (!Array.isArray(raw?.events)) throw new TypeError('EONET 缺少 events 数组');
  const report = diagnostics(raw.events.length), events = [];
  for (const record of raw.events) {
    const categories = new Set((record.categories || []).map(category => category.id));
    const kind = categories.has('volcanoes') ? 'volcano' : categories.has('severeStorms') && TROPICAL_TITLE.test(record.title || '') ? 'storm' : null;
    if (!kind || !allowedKinds.includes(kind) || record.closed !== null || !record.id || !Array.isArray(record.geometry)) { report.skippedRecords++; continue; }
    const points = new Map(), notes = [];
    for (const geometry of record.geometry) {
      const location = point(geometry), timeUtc = utc(geometry.date);
      if (!location || !timeUtc) { report.unsupportedGeometries++; continue; }
      if (points.has(timeUtc)) {
        report.duplicateTimes++;
        const previous = points.get(timeUtc);
        if (previous.lat !== location.lat || previous.lon !== location.lon) { report.conflictingDuplicateTimes++; notes.push(`同刻多点 ${timeUtc}：保留来源数组中的首个有效 Point，其余未显示。`); }
        continue;
      }
      const observation = { timeUtc, ...location };
      if (numberOrNull(geometry.magnitudeValue) !== null) {
        observation.value = geometry.magnitudeValue;
        observation.valueUnit = typeof geometry.magnitudeUnit === 'string' ? geometry.magnitudeUnit : null;
        observation.valueDescription = typeof geometry.magnitudeDescription === 'string' ? geometry.magnitudeDescription : '来源报告的事件量值；平均时段未由 EONET 明确提供';
      }
      points.set(timeUtc, observation);
    }
    const observations = [...points.values()].sort((a, b) => a.timeUtc.localeCompare(b.timeUtc));
    const references = (record.sources || []).map(item => ({ name: String(item.id || 'EONET 引用来源'), url: httpUrl(item.url) })).filter(item => item.url);
    const detail = references[0]?.url || httpUrl(record.link);
    if (!observations.length || !detail) { report.skippedRecords++; continue; }
    const first = observations[0], last = observations.at(-1);
    const smithsonian = references.find(item => item.url.includes('volcano.si.edu/'));
    const volcanoNumber = smithsonian ? new URL(smithsonian.url).searchParams.get('vn') : null;
    events.push({
      id: `eonet:${record.id}`, kind, title: String(record.title || record.id), timeUtc: first.timeUtc, lastObservedUtc: last.timeUtc,
      statusLabel: kind === 'volcano' ? 'EONET 开放目录 · 报告日期见记录' : 'EONET 开放事件 · 最近报告见时间轴',
      source: sourceReference(source), sourceDetailUrl: detail, lat: last.lat, lon: last.lon, magnitude: null, depthKm: null,
      observations, references, volcanoNumber, recordType: kind === 'volcano' ? 'catalog-location' : 'reported-cyclone-positions',
      timeMeaning: 'source-reported-geometry-time-may-be-date-only',
      geometryMeaning: kind === 'volcano' ? 'reported-event-location-not-eruption-extent' : 'reported-event-positions-not-wind-field-or-complete-best-track',
      description: kind === 'volcano'
        ? '开放表示 EONET 尚未关闭此条目，不等于此刻正在喷发。点位是来源报告的事件定位，不是喷发或火山灰范围；00:00 UTC 可能仅代表报告日期。'
        : '点位与量值逐条来自 EONET 所引用来源，不代表完整最佳路径或风场。开放状态不保证此刻仍活跃；量值的平均时段未由 EONET 明确提供。',
      normalizationNotes: [...notes, '非 Point 几何不显示；同刻多点保留来源数组中的首个有效点；未补点或插值。']
    });
  }
  report.includedRecords = events.length;
  return { events, diagnostics: report };
}

/** Elevated USGS reports join catalogue volcano locations by exact volcano number. */
export function normalizeVolcanoStatus(notices, catalogue, { source = EARTH_EVENT_SOURCES[3] } = {}) {
  if (!Array.isArray(notices) || catalogue?.type !== 'FeatureCollection' || !Array.isArray(catalogue.features)) throw new TypeError('USGS 火山状态或坐标目录结构无效');
  const byNumber = new Map(catalogue.features.map(feature => [String(feature.properties?.vnum), feature]));
  const report = diagnostics(notices.length), events = [];
  for (const notice of notices) {
    const feature = byNumber.get(String(notice.vnum)), location = point(feature?.geometry);
    const seconds = typeof notice.sent_unixtime === 'number' ? notice.sent_unixtime : /^\d+$/.test(notice.sent_unixtime || '') ? Number(notice.sent_unixtime) : NaN;
    const timeUtc = Number.isFinite(seconds) ? utc(seconds * 1000) : null, detail = httpUrl(notice.notice_url);
    if (!location || !timeUtc || !detail || !notice.vnum) throw new TypeError(`USGS 火山通报 ${notice.vnum || '未知编号'} 无法匹配有效官方坐标或时间`);
    const p = feature.properties;
    const sameNotice = p.noticeId === notice.notice_identifier;
    events.push({
      id: `usgs-volcano:${notice.vnum}`, kind: 'volcano', title: `${notice.volcano_name} · USGS 状态通报`, timeUtc, lastObservedUtc: timeUtc,
      statusLabel: `${notice.alert_level} / ${notice.color_code} · 官方状态通报`,
      source: sourceReference(source), sourceDetailUrl: detail, ...location, magnitude: null, depthKm: null,
      observations: [{ timeUtc, ...location }], alertLevel: notice.alert_level, colorCode: notice.color_code,
      volcanoNumber: String(notice.vnum), observatory: notice.obs_fullname, noticeType: notice.notice_type_cd,
      noticeIdentifier: notice.notice_identifier, recordType: 'official-volcano-status-notice',
      timeMeaning: 'official-status-notice-publication', geometryMeaning: 'volcano-location-from-official-catalog-not-monitoring-station-or-eruption-extent',
      description: `通报时间是 USGS 发布时间，不是喷发开始时间。位置来自官方火山目录，不是监测台站或喷发范围。${sameNotice && p.noticeSynopsis ? ` 官方摘要：${p.noticeSynopsis}` : ''}`,
      references: [{ name: 'USGS 火山目录坐标', url: source.coordinateUrl }, ...(httpUrl(p.volcanoUrl) ? [{ name: 'USGS 火山资料', url: httpUrl(p.volcanoUrl) }] : [])]
    });
  }
  report.includedRecords = events.length;
  return { events, diagnostics: report };
}

async function requestJson(url, sourceId, { fetchImpl, clock, onRaw, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error('官方资料请求超时')), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, credentials: 'omit', mode: 'cors', cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > 25 * 1024 * 1024) throw new RangeError('单个目录超过 25 MB 安全读取上限');
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    const retrievedAtUtc = clock();
    const headers = Object.fromEntries(['content-type', 'date', 'last-modified', 'etag', 'cache-control', 'access-control-allow-origin'].map(name => [name, response.headers.get(name)]).filter(([, value]) => value !== null));
    if (onRaw) await onRaw({ sourceId, url, retrievedAtUtc, httpStatus: response.status, headers, bytes, data });
    return { data, retrievedAtUtc };
  } finally { clearTimeout(timeout); }
}

/**
 * An error source is explicit; callers must retain their previous full snapshot on any error.
 * `now` is optional clock injection for tests. No injected value means actual request completion times.
 * onRaw receives exact response bytes for a Node archival caller; browsers need no filesystem APIs.
 */
export async function fetchEarthEvents({ fetchImpl = globalThis.fetch, now, onRaw, timeoutMs = 30000 } = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('需要 fetch 实现');
  const fixedTime = now === undefined ? null : utc(now);
  if (now !== undefined && !fixedTime) throw new TypeError('now 必须是有效日期');
  const clock = () => fixedTime || new Date().toISOString();
  const context = { fetchImpl, clock, onRaw, timeoutMs };
  const results = await Promise.all(EARTH_EVENT_SOURCES.map(async definition => {
    const attemptedAtUtc = clock();
    try {
      let normalized, retrievedAtUtc;
      if (definition.id === 'usgs_volcano_status') {
        const responses = await Promise.allSettled([requestJson(definition.url, definition.id, context), requestJson(definition.coordinateUrl, definition.id, context)]);
        const failed = responses.find(response => response.status === 'rejected');
        if (failed) throw failed.reason;
        const [notices, catalogue] = responses.map(response => response.value);
        retrievedAtUtc = [notices.retrievedAtUtc, catalogue.retrievedAtUtc].sort().at(-1);
        normalized = normalizeVolcanoStatus(notices.data, catalogue.data, { source: definition });
      } else {
        const response = await requestJson(definition.url, definition.id, context);
        retrievedAtUtc = response.retrievedAtUtc;
        normalized = definition.id === 'usgs_quakes' ? normalizeUSGS(response.data, { source: definition }) : normalizeEonet(response.data, { source: definition, allowedKinds: definition.id === 'eonet_volcano_open' ? ['volcano'] : ['storm', 'volcano'] });
      }
      const source = { ...definition, status: 'ok', attemptedAtUtc, retrievedAtUtc, retrievalSucceeded: true, diagnostics: normalized.diagnostics };
      // A syntactically successful response with impossible dates is still a failed source.
      validateEventFeed({ schemaVersion: 1, retrievedAtUtc: clock(), sources: [source], events: normalized.events });
      return { source, events: normalized.events };
    } catch (error) {
      return { source: { ...definition, status: 'error', attemptedAtUtc, retrievedAtUtc: clock(), retrievalSucceeded: false, error: String(error?.message || error), timestampMeaning: 'failed-attempt-completion-not-successful-retrieval' }, events: [] };
    }
  }));
  const uniqueEvents = new Map();
  for (const result of results) for (const event of result.events) if (!uniqueEvents.has(event.id)) uniqueEvents.set(event.id, event);
  const bundle = { schemaVersion: 1, retrievedAtUtc: clock(), sources: results.map(result => result.source), events: [...uniqueEvents.values()].sort((a, b) => b.lastObservedUtc.localeCompare(a.lastObservedUtc) || a.id.localeCompare(b.id)),
    interpretation: '数量表示来源记录，不保证不同来源对应不同自然事件。EONET 开放状态不是实时活跃判定；历史火山定位与近期 USGS 状态通报分别保留。所有时间均为 UTC，未补点或生成推测范围。' };
  return validateEventFeed(bundle);
}
