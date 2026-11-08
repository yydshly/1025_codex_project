import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const directory = path.dirname(fileURLToPath(import.meta.url));
const startUtc = '2024-04-02T23:57:00Z';
const endUtc = '2024-04-03T00:05:00Z';
const stationCodes = ['TATO', 'INCN', 'MAJO'];
const base = 'https://service.earthscope.org/fdsnws/';
const query = { net: 'IU', loc: '00', cha: 'BHZ', starttime: startUtc.slice(0, -1), endtime: endUtc.slice(0, -1) };
const url = (service, params) => base + service + '/1/query?' + new URLSearchParams(params);
const tasks = stationCodes.map(station => ({
  file: 'raw/IU.' + station + '.00.BHZ.geocsv',
  url: url('dataselect', { ...query, sta: station, format: 'geocsv' }),
}));
tasks.push(
  { file: 'raw/channels.txt', url: url('station', { ...query, sta: stationCodes.join(','), level: 'channel', format: 'text' }) },
  { file: 'raw/stations.txt', url: url('station', { ...query, sta: stationCodes.join(','), level: 'station', format: 'text' }) },
  { file: 'raw/event-usgs.geojson', url: 'https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=us7000m9g4&format=geojson' },
);

await fs.mkdir(path.join(directory, 'raw'), { recursive: true });
const files = await Promise.all(tasks.map(async task => {
  const response = await fetch(task.url, { signal: AbortSignal.timeout(35000) });
  if (response.status !== 200) throw new Error(task.file + ': HTTP ' + response.status);
  const body = Buffer.from(await response.arrayBuffer());
  if (!body.length) throw new Error(task.file + ': empty response');
  const receipt = {
    ...task,
    finalUrl: response.url,
    status: response.status,
    contentType: response.headers.get('content-type'),
    bytes: body.length,
    sha256: createHash('sha256').update(body).digest('hex'),
    retrievedAtUtc: new Date().toISOString(),
  };
  return { body, receipt };
}));

for (const { body, receipt } of files) {
  await fs.writeFile(path.join(directory, receipt.file), body);
  console.log(receipt.file, receipt.bytes, receipt.sha256);
}
await fs.writeFile(path.join(directory, 'fetch-results.json'), JSON.stringify({
  retrievedAtUtc: new Date().toISOString(),
  startUtc,
  endUtc,
  stationCodes,
  results: files.map(file => file.receipt),
}, null, 2) + '\n');
