import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEventFeed, filterEvents, buildEventTimeline } from '../app/live-event-data.js';
import { eventFactsMarkup, eventSeriesMarkup } from '../app/live-event-view.js';

// Deliberately small validation fixtures, not observations distributed to the product.
const fixture = () => ({
  schemaVersion: 1, retrievedAtUtc: '2026-11-04T12:00:00Z',
  sources: [{ id: 'test', name: '验证用来源', url: 'https://example.org/feed', retrievedAtUtc: '2026-11-04T11:59:00Z', coverageLabel: '验证用时间窗口', status: 'ok' }],
  events: [
    { id: 'quake-a', kind: 'quake', title: '验证用地震 A', timeUtc: '2026-11-04T00:00:00Z', lastObservedUtc: '2026-11-04T00:00:00Z', statusLabel: '目录解', source: { name: '目录来源', url: 'https://example.org/catalog' }, sourceDetailUrl: 'https://example.org/event/a', lat: 22, lon: 114, magnitude: 4.2, depthKm: 12.5, observations: [{ timeUtc: '2026-11-04T00:00:00Z', lat: 22, lon: 114, magnitude: 4.2, depthKm: 12.5 }] },
    { id: 'quake-b', kind: 'quake', title: '验证用地震 B', timeUtc: '2026-11-04T02:00:00Z', lastObservedUtc: '2026-11-04T02:00:00Z', statusLabel: '目录解', source: { name: '目录来源', url: 'https://example.org/catalog' }, sourceDetailUrl: 'https://example.org/event/b', lat: -2, lon: -114, magnitude: null, depthKm: null, observations: [{ timeUtc: '2026-11-04T02:00:00Z', lat: -2, lon: -114, magnitude: null, depthKm: null }] },
    { id: 'storm-a', kind: 'storm', title: '验证用风暴报告', timeUtc: '2026-11-03T21:00:00Z', lastObservedUtc: '2026-11-04T03:00:00Z', statusLabel: '报告定位', source: { name: 'EONET', url: 'https://eonet.gsfc.nasa.gov/docs/v3' }, sourceDetailUrl: 'https://example.org/event/storm', lat: 19, lon: 120, magnitude: null, depthKm: null, observations: [{ timeUtc: '2026-11-03T21:00:00Z', lat: 18, lon: 121, value: 999 }, { timeUtc: '2026-11-04T03:00:00Z', lat: 19, lon: 120, value: 888 }] },
  ],
});

test('validation preserves null and signed source values without filling, sorting or mutating the feed', () => {
  const data = fixture(); data.events[0].magnitude = -.4; data.events[0].depthKm = -1.2;
  data.events[0].observations[0].magnitude = -.4; data.events[0].observations[0].depthKm = -1.2;
  const original = structuredClone(data);
  assert.equal(validateEventFeed(data), data); assert.deepEqual(data, original);
  assert.equal(data.events[1].magnitude, null); assert.equal(data.events[0].depthKm, -1.2);
  assert.deepEqual(filterEvents(data, 'volcano'), []);
  assert.equal(filterEvents(data, 'quake')[0], data.events[0]);
  assert.deepEqual(filterEvents(data), data.events);
  assert.throws(() => filterEvents(data, 'unknown'), /分类/);
  data.events = []; data.sources[0].status = 'error'; assert.equal(validateEventFeed(data), data);
});

test('actual observation ticks keep irregular intervals and object identity, without interpolation', () => {
  const event = fixture().events[2], ticks = buildEventTimeline(event);
  assert.equal(ticks.length, 2); assert.notEqual(ticks, event.observations);
  assert.equal(ticks[0], event.observations[0]); assert.equal(ticks[1], event.observations[1]);
  assert.equal(Date.parse(ticks[1].timeUtc) - Date.parse(ticks[0].timeUtc), 21600000);
  assert.equal(eventSeriesMarkup(event, 100).includes('data-observed-time="2026-11-04T03:00:00Z"'), true);
});

test('bad categories, coordinates, dates, observation order and nonnumeric measurements are rejected', () => {
  for (const mutate of [
    d => { d.events[0].kind = 'earthquake'; }, d => { d.events[0].lat = 91; },
    d => { d.events[0].observations[0].lon = 181; }, d => { d.events[0].magnitude = '4.2'; },
    d => { d.events[0].depthKm = Infinity; }, d => { d.events[0].observations[0].value = NaN; },
    d => { d.events[0].observations[0].timeUtc = '2026-02-30T00:00:00Z'; },
    d => { d.events[0].timeUtc = '2026-11-04T08:00:00+08:00'; },
    d => { d.events[2].observations.reverse(); },
    d => { d.events[2].observations.push({ ...d.events[2].observations.at(-1) }); },
    d => { d.events[2].lastObservedUtc = '2026-11-04T04:00:00Z'; },
    d => { d.events[2].observations = []; },
  ]) { const data = fixture(); mutate(data); assert.throws(() => validateEventFeed(data)); }
});

test('provenance, unique identifiers and acquisition/observation chronology are required', () => {
  for (const mutate of [
    d => { d.events[1].id = d.events[0].id; }, d => { d.sources.push({ ...d.sources[0] }); },
    d => { d.events[0].sourceDetailUrl = 'javascript:alert(1)'; }, d => { d.sources[0].url = 'not-a-url'; },
    d => { d.sources[0].status = ''; }, d => { d.events[0].source.name = ''; },
    d => { d.retrievedAtUtc = '2026-11-03T00:00:00Z'; },
    d => { d.sources[0].retrievedAtUtc = '2026-11-05T00:00:00Z'; },
  ]) { const data = fixture(); mutate(data); assert.throws(() => validateEventFeed(data)); }
});

test('quake charts use independent catalog events, preserve actual depth, and never manufacture a waveform', () => {
  const data = fixture(); data.events[1].magnitude = 2.8;
  const html = eventSeriesMarkup(data.events[0], 0, data);
  assert.equal((html.match(/class="live-event-quake-point"/g) ?? []).length, 2);
  assert.match(html, /data-magnitude="4.2"/); assert.match(html, /data-magnitude="2.8"/);
  assert.match(html, /data-depth-km="12.5"/); assert.match(html, /每点是一场地震/); assert.match(html, /没有实测波形/);
  assert.doesNotMatch(html, /<polyline/);
  const missing = eventSeriesMarkup(fixture().events[1], 0, fixture());
  assert.match(missing, /未报告深度，不绘制为零/); assert.doesNotMatch(missing, /data-depth-km="0"/);
});

test('report-only storm/volcano views show actual times and coordinates, never generic value as intensity', () => {
  for (const kind of ['storm', 'volcano']) {
    const event = fixture().events[2]; event.kind = kind;
    const html = eventSeriesMarkup(event, 1), facts = eventFactsMarkup(event);
    assert.equal((html.match(/class="live-event-report-point"/g) ?? []).length, 2);
    assert.match(html, /报告定位时间轴，非强度图/); assert.match(html, /19°N · 120°E/);
    assert.doesNotMatch(html, /999|888|data-magnitude|data-depth-km/);
    assert.match(facts, /不是完整风场、喷发高度或连续运动轨迹/);
  }
});

test('explicit observation null is not replaced by event summary and UTC+8 labeling is explicit', () => {
  const event = fixture().events[0]; event.observations[0].magnitude = null; event.observations[0].depthKm = null;
  const html = eventFactsMarkup(event, event.observations[0]);
  assert.match(html, /08:00/); assert.match(html, /UTC\+8/);
  assert.equal((html.replace(/<[^>]*>/g, ' ').match(/未报告/g) ?? []).length, 2);
  assert.doesNotMatch(html, /4\.2 M|12\.5 km/);
});

test('primary quake values retain zero, signed depth and units before the dated source context', () => {
  const event = fixture().events[0]; event.observations[0].magnitude = 0; event.observations[0].depthKm = -1.2;
  const html = eventFactsMarkup(event), text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  assert.match(text, /震级 0 M/); assert.match(text, /目录深度 -1\.2 km/);
  assert.ok(text.indexOf('目录深度') < text.indexOf('目录记录时间'));
  assert.match(text, /2026年11月4日 08:00/); assert.match(text, /22°N · 114°E/); assert.match(text, /来源状态 目录解/);
  assert.doesNotMatch(html, /<dt>资料类型<\/dt>/);
  const notice = fixture().events[2]; notice.kind = 'volcano'; notice.source.name = 'USGS 火山状态通报';
  notice.alertLevel = null; notice.colorCode = 'ORANGE';
  const noticeText = eventFactsMarkup(notice).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  assert.match(noticeText, /告警等级（源值） 未报告/); assert.match(noticeText, /航空颜色代码（源值） ORANGE/);
});

test('USGS volcano notices distinguish publication time and catalog position from EONET geometry or instrument observations', () => {
  const event = fixture().events[2]; event.kind = 'volcano';
  event.source = { id: 'usgs_volcano_status', name: 'USGS 火山状态通报', url: 'https://volcanoes.usgs.gov/' };
  event.timeMeaning = 'official-status-notice-publication'; event.alertLevel = 'WATCH'; event.colorCode = 'ORANGE';
  const facts = eventFactsMarkup(event), chart = eventSeriesMarkup(event, 0);
  assert.match(facts, /官方通报时间/); assert.match(facts, /火山位置（官方目录）/);
  assert.match(facts, /WATCH/); assert.match(facts, /ORANGE/); assert.doesNotMatch(facts, /EONET|当前报告定位时间/);
  assert.match(chart, /官方通报发布时间轴/); assert.match(chart, /不等于喷发时间或监测台站/);
});

test('source text is escaped and non-web links cannot become executable markup', () => {
  const event = fixture().events[0];
  event.title = '<img src=x onerror=alert(1)>'; event.description = '<script>boom</script>';
  event.source.name = 'source <b>'; event.sourceDetailUrl = 'javascript:alert(1)';
  const html = eventFactsMarkup(event), chart = eventSeriesMarkup(event, 0, [event]);
  assert.doesNotMatch(html + chart, /<img|<script>|href="javascript:/);
  assert.match(html, /&lt;img/); assert.match(html, /&lt;script&gt;/); assert.match(chart, /&lt;img/);
});

test('long methodology and report lists start collapsed without removing the original records', () => {
  const event = fixture().events[2]; event.description = 'A source report';
  const facts = eventFactsMarkup(event);
  assert.match(facts, /<details class="live-event-method"><summary>资料含义与边界/);
  assert.doesNotMatch(facts, /<details[^>]*\sopen/);
  event.observations = Array.from({ length: 9 }, (_, i) => ({ lat: 20, lon: 120, timeUtc: new Date(Date.UTC(2026, 10, 4, i)).toISOString() }));
  const chart = eventSeriesMarkup(event, 4);
  assert.match(chart, /<details class="live-event-method live-event-report-list"><summary>查看9条/);
  assert.equal((chart.match(/<li data-observation-index=/g) ?? []).length, 9);
  assert.doesNotMatch(chart, /<details[^>]*\sopen/);
});
