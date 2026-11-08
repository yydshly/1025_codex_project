import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const dir = path.dirname(fileURLToPath(import.meta.url));
await fs.mkdir(path.join(dir, 'raw'), { recursive: true });
const stations = ['MAJO', 'INCN', 'TATO', 'YSS', 'GUMO', 'ULN'];
const start = '2011-03-11T05:45:00', end = '2011-03-11T06:05:00';
const base = 'https://service.earthscope.org/fdsnws/';
const query = { net: 'IU', loc: '00', cha: 'BHZ', starttime: start, endtime: end };
const url = (service, params) => base + service + '/1/query?' + new URLSearchParams(params);
const tasks = stations.map(sta => ({ file: 'raw/IU.' + sta + '.00.BHZ.geocsv', url: url('dataselect', { ...query, sta, format: 'geocsv' }) }));
tasks.push({ file: 'raw/channels.txt', url: url('station', { ...query, sta: stations.join(','), level: 'channel', format: 'text' }) });
tasks.push({ file: 'raw/stations.txt', url: url('station', { net: 'IU', sta: stations.join(','), starttime: start, endtime: end, level: 'station', format: 'text' }) });
tasks.push({ file: 'raw/event-usgs.geojson', url: 'https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=usc0001xgp&format=geojson' });
const results = [], queue = [...tasks];
async function worker() {
  while (queue.length) {
    const task = queue.shift();
    let lastError;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(task.url, { signal: AbortSignal.timeout(35000) });
        if (!response.ok || response.status === 204) throw new Error('HTTP ' + response.status);
        const bytes = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(path.join(dir, task.file), bytes);
        const result = { ...task, finalUrl: response.url, status: response.status, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), contentType: response.headers.get('content-type'), retrievedAtUtc: new Date().toISOString() };
        results.push(result); console.log(JSON.stringify(result)); lastError = null; break;
      } catch (error) { lastError = { ...task, error: error.message, cause: error.cause?.code, attempt }; }
    }
    if (lastError) { results.push(lastError); console.log(JSON.stringify(lastError)); }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
await fs.writeFile(path.join(dir, 'fetch-results.json'), JSON.stringify({ retrievedAtUtc: new Date().toISOString(), startUtc: start + 'Z', endUtc: end + 'Z', results }, null, 2) + '\n');
