import { mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { fetchEarthEvents } from '../app/live-event-feed.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const research = path.join(root, 'research', 'live-events');
const startedAtUtc = new Date().toISOString();
const runId = startedAtUtc.replace(/[-:.]/g, '');
const rawDirectory = path.join(research, 'raw', runId);
const receipts = [];
await mkdir(rawDirectory, { recursive: true });

const feed = await fetchEarthEvents({
  async onRaw({ bytes, data, ...receipt }) {
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const urlHash = createHash('sha256').update(receipt.url).digest('hex').slice(0, 10);
    const filename = `${receipt.sourceId}-${urlHash}.json`;
    await writeFile(path.join(rawDirectory, filename), bytes);
    receipts.push({ ...receipt, sha256, bytes: bytes.byteLength, file: `raw/${runId}/${filename}` });
  }
});

const counts = Object.fromEntries(['quake', 'volcano', 'storm'].map(kind => [kind, feed.events.filter(event => event.kind === kind).length]));
const failed = feed.sources.filter(source => source.status !== 'ok');
const report = {
  schemaVersion: 1, startedAtUtc, completedAtUtc: new Date().toISOString(), snapshotUpdated: failed.length === 0,
  counts, sources: feed.sources, rawResponses: receipts.sort((a, b) => a.url.localeCompare(b.url)),
  notes: [
    '原始文件保存 HTTP JSON 正文字节，SHA256 对原始字节计算；未保存或使用身份凭据。',
    'app 快照仅在全部来源请求和规范化验证成功时原子替换；任一失败保留原快照。',
    'HANS 通报按 vnum 匹配官方火山目录位置；时间为 sent_unixtime 所示发布时间，不是喷发起点。',
    'USGS 与 EONET 可能包含同一座火山的不同来源记录；计数不是去重后的火山数量。'
  ]
};
await writeFile(path.join(rawDirectory, 'receipt.json'), JSON.stringify(report, null, 2) + '\n');
await writeFile(path.join(research, 'latest-attempt.json'), JSON.stringify(report, null, 2) + '\n');

if (failed.length) {
  console.error(JSON.stringify({ snapshotUpdated: false, errors: failed.map(source => ({ source: source.id, error: source.error })), receipt: `research/live-events/raw/${runId}/receipt.json` }, null, 2));
  process.exitCode = 1;
} else {
  feed.provenance = { receipt: `research/live-events/raw/${runId}/receipt.json`, rawResponses: receipts.map(({ sourceId, url, retrievedAtUtc, sha256, file }) => ({ sourceId, url, retrievedAtUtc, sha256, file: `research/live-events/${file}` })) };
  const output = path.join(root, 'app', 'data', 'earth-events-snapshot.json');
  await mkdir(path.dirname(output), { recursive: true });
  const temporary = `${output}.${runId}.tmp`;
  await writeFile(temporary, JSON.stringify(feed, null, 2) + '\n');
  await rename(temporary, output);
  console.log(JSON.stringify({ snapshotUpdated: true, retrievedAtUtc: feed.retrievedAtUtc, counts, total: feed.events.length, sourceCounts: feed.sources.map(source => ({ id: source.id, count: source.diagnostics.includedRecords })), output: 'app/data/earth-events-snapshot.json', receipt: `research/live-events/raw/${runId}/receipt.json` }, null, 2));
}
