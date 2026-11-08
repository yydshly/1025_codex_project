import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { fetchEarthEvents, normalizeEonet, normalizeUSGS, normalizeVolcanoStatus, EARTH_EVENT_SOURCES } from '../../app/live-event-feed.js';
import { validateEventFeed } from '../../app/live-event-data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const feedBytes = await readFile(path.join(root, 'app/data/earth-events-snapshot.json'));
const feed = validateEventFeed(JSON.parse(feedBytes));
const receipt = JSON.parse(await readFile(path.join(root, feed.provenance.receipt), 'utf8'));
const archived = new Map();
for (const response of receipt.rawResponses) {
  const bytes = await readFile(path.join(root, 'research/live-events', response.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), response.sha256);
  assert.equal(bytes.byteLength, response.bytes);
  assert.equal(response.headers['access-control-allow-origin'], '*');
  assert.equal(response.httpStatus, 200);
  archived.set(response.url, bytes);
}
assert.equal(archived.size, 5);
const mockFetch = async url => {
  assert(archived.has(url), `Unexpected URL ${url}`);
  return new Response(archived.get(url), { status: 200, headers: { 'content-type': 'application/json' } });
};
const replayed = await fetchEarthEvents({ fetchImpl: mockFetch, now: new Date(feed.retrievedAtUtc) });
assert(replayed.sources.every(source => source.status === 'ok'));
assert.deepEqual(replayed.events, feed.events);

// Independently compare every normalized USGS coordinate, origin, magnitude and depth to raw values.
const rawQuakes = JSON.parse(archived.get(EARTH_EVENT_SOURCES[0].url));
const byQuakeId = new Map(rawQuakes.features.map(item => [`usgs-quake:${item.id}`, item]));
for (const event of feed.events.filter(item => item.kind === 'quake')) {
  const raw = byQuakeId.get(event.id);
  assert.equal(raw.properties.type, 'earthquake');
  assert.deepEqual([event.lon, event.lat, event.depthKm], raw.geometry.coordinates);
  assert.equal(event.timeUtc, new Date(raw.properties.time).toISOString());
  assert.equal(event.magnitude, raw.properties.mag);
  assert.equal(event.updatedAtUtc, new Date(raw.properties.updated).toISOString());
}

// No invented polygon centre, no generic winter storm, no extra same-time path point.
const geometry = (date, coordinates, extra = {}) => ({ date, type: 'Point', coordinates, ...extra });
const fixture = { id: 'fixture', title: 'Tropical Cyclone Fixture', closed: null, categories: [{ id: 'severeStorms' }], sources: [{ id: 'TEST', url: 'https://example.org/source' }], geometry: [
  geometry('2026-01-01T01:00:00Z', [120, 20]),
  geometry('2026-01-01T00:00:00Z', [119, 19]),
  geometry('2026-01-01T01:00:00Z', [121, 21]),
  { date: '2026-01-01T02:00:00Z', type: 'Polygon', coordinates: [[[0, 0], [1, 0], [0, 0]]] }
] };
const result = normalizeEonet({ events: [fixture, { ...fixture, id: 'winter', title: 'Winter Storm Fixture' }] });
assert.equal(result.events.length, 1);
assert.equal(result.events[0].observations.length, 2);
assert.equal(result.events[0].observations[1].lon, 120);
assert.equal(result.diagnostics.conflictingDuplicateTimes, 1);
assert.equal(result.diagnostics.unsupportedGeometries, 1);
const negativeDepth = normalizeUSGS({ type: 'FeatureCollection', features: [{ id: 'negative', properties: { type: 'earthquake', time: 0, updated: 1000, mag: 0, url: 'https://example.org/quake' }, geometry: { type: 'Point', coordinates: [0, 0, -0.5] } }] });
assert.equal(negativeDepth.events[0].depthKm, -0.5);
assert.equal(negativeDepth.events[0].magnitude, 0);
assert.throws(() => normalizeVolcanoStatus([{ vnum: 'missing' }], { type: 'FeatureCollection', features: [] }));

const failed = await fetchEarthEvents({ fetchImpl: async url => url === EARTH_EVENT_SOURCES[0].url ? new Response('unavailable', { status: 503 }) : mockFetch(url), now: new Date(feed.retrievedAtUtc) });
assert.equal(failed.sources[0].status, 'error');
assert.equal(failed.sources[0].retrievalSucceeded, false);
assert(failed.sources.slice(1).every(source => source.status === 'ok'));
assert.equal(failed.events.filter(event => event.kind === 'quake').length, 0);
assert.deepEqual(await readFile(path.join(root, 'app/data/earth-events-snapshot.json')), feedBytes);

const report = { checkedAtUtc: new Date().toISOString(), passed: true, checks: [
  'schema / finite legal coordinates / strict UTC ordered observations / real observation time <= retrieval',
  'all 5 raw HTTP bodies SHA256 + bytes + public CORS headers',
  'offline raw-response replay exactly reproduces all normalized events',
  'all quake coordinates / depth / magnitude / origin / updated time match raw fields',
  'tropical category + title filter; Polygon rejected; same-time conflicting Point stable deduplication',
  'negative earthquake depth and zero magnitude preserved',
  'missing volcano coordinate join rejected',
  'failed source explicitly error; successful sources remain ok; saved snapshot untouched'
], eventCounts: Object.fromEntries(['quake', 'volcano', 'storm'].map(kind => [kind, feed.events.filter(event => event.kind === kind).length])), rawResponses: archived.size, snapshotRetrievedAtUtc: feed.retrievedAtUtc };
await writeFile(path.join(root, 'research/live-events/validation-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
