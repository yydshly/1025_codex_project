import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const sourceFile = path.join(dir, 'mangkhut-jma-source.txt');
const bytes = fs.readFileSync(sourceFile);
const lines = bytes.toString('utf8').trimEnd().split(/\r?\n/);
const header = lines[0];
const expectedCount = Number(header.slice(12, 15));
const directions = { 0: null, 1: 'NE', 2: 'E', 3: 'SE', 4: 'S', 5: 'SW', 6: 'W', 7: 'NW', 8: 'N', 9: 'symmetric' };
const grades = { 2: 'TD', 3: 'TS', 4: 'STS', 5: 'TY', 6: 'EX', 7: 'entering', 9: 'TS-or-higher' };
const field = (line, start, length) => line.slice(start, start + length).trim();
const num = value => value === '' ? null : Number(value);
function radii(line, start) {
  const token = field(line, start, 10);
  if (!token) return null;
  const directionCode = num(field(line, start, 1));
  return {
    directionCode,
    longestDirection: directions[directionCode],
    longestNm: num(field(line, start + 1, 4)),
    shortestNm: num(field(line, start + 6, 4)),
  };
}
const records = lines.slice(1).map((original, index) => {
  const line = original.padEnd(80, ' ');
  const t = line.slice(0, 8);
  const rawWind = field(line, 33, 3);
  const grade = Number(field(line, 13, 1));
  const windKt = rawWind === '' || rawWind === '000' ? null : Number(rawWind);
  if (line.slice(9, 12) !== '002') throw new Error(`Unexpected data indicator on line ${index + 2}`);
  return {
    timeUtc: `20${t.slice(0, 2)}-${t.slice(2, 4)}-${t.slice(4, 6)}T${t.slice(6, 8)}:00:00Z`,
    lat: Number(field(line, 15, 3)) / 10,
    lon: Number(field(line, 19, 4)) / 10,
    pressureHpa: num(field(line, 24, 4)),
    windKt,
    windKmh: windKt === null ? null : Math.round(windKt * 1.852 * 100) / 100,
    grade,
    gradeLabel: grades[grade],
    radii50kt: radii(line, 41),
    radii30kt: radii(line, 52),
    japaneseLandfallIndicator: field(line, 71, 1) || null,
    rawWindToken: rawWind || null,
    windDataStatus: windKt === null ? 'not-reported-numerically' : 'reported',
    sourceLine: index + 2,
  };
});
if (records.length !== expectedCount) throw new Error(`Expected ${expectedCount} records; found ${records.length}`);
for (let i = 0; i < records.length; i++) {
  const r = records[i];
  if (!Number.isFinite(Date.parse(r.timeUtc)) || r.lat < -90 || r.lat > 90 || r.lon < -180 || r.lon > 180) throw new Error(`Invalid location/time ${i}`);
  if (i && Date.parse(r.timeUtc) - Date.parse(records[i - 1].timeUtc) !== 21600000) throw new Error(`Unexpected spacing ${i}`);
  if (r.pressureHpa < 800 || r.pressureHpa > 1100) throw new Error(`Invalid pressure ${i}`);
  for (const size of [r.radii30kt, r.radii50kt]) if (size && size.longestNm < size.shortestNm) throw new Error(`Invalid radii ${i}`);
}
const data = {
  schemaVersion: 1,
  eventId: 'jma-1822',
  name: 'MANGKHUT',
  nameZh: '山竹',
  year: 2018,
  dataType: 'official-retrospective-best-track-analysis',
  displayLabel: '日本气象厅事后最佳路径分析',
  source: {
    agency: 'Japan Meteorological Agency / RSMC Tokyo - Typhoon Center',
    pageUrl: 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html',
    downloadUrl: 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/bst_all.zip',
    archiveMember: 'bst_all.txt',
    archiveBytesAtDownload: 747389,
    downloadedAtUtc: '2026-11-04T10:49:14.1540844Z',
    sourceRevisionDate: '2018-10-26',
    extractedOriginalFile: 'mangkhut-jma-source.txt',
    extractedOriginalSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    extraction: 'Original fixed-width header and all 46 data rows for international ID 1822 extracted in memory from the official ZIP; only this event was saved. Line endings normalized to LF; no numerical values changed.',
    formatUrl: 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/e_format_bst.html',
    windDefinitionUrl: 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/advisory.html',
    bestTrackNatureUrl: 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/AnnualReport/2022/Text/Text2022.pdf',
    termsUrl: 'https://www.jma.go.jp/jma/en/copyright.html',
    attribution: 'Based on RSMC Tokyo best-track data (Japan Meteorological Agency). Extracted, parsed and visualized by this product; this visualization is not an official JMA product.',
    termsSummary: 'JMA website content is under Public Data License 1.0 unless a specific notice says otherwise. Cite the source and identify edits; do not imply government authorship. Third-party material and specific notices may have other conditions. The terms state compatibility with CC BY 4.0.'
  },
  units: {
    timeUtc: 'UTC; source format yymmddhh',
    lat: 'degrees north; original stored in 0.1 degree',
    lon: 'degrees east; original stored in 0.1 degree',
    pressureHpa: 'hPa; central pressure',
    windKt: 'knot; maximum sustained wind, 10-minute averaging period',
    windKmh: 'km/h; derived conversion only, 1 knot = 1.852 km/h',
    radii: 'nautical mile; longest and shortest radius of winds at least 30/50 kt',
    intervalHours: 6
  },
  interpretation: {
    category: 'Post-event analysis based on meteorological evidence; not a forecast and not direct instrument measurements at every track location.',
    noInterpolation: 'All records are original 6-hour analysis times; no extra points or wind values have been generated.',
    missingPolicy: 'Blank fields become null. Source wind token 000 is conservatively withheld as null rather than displayed as zero wind; in this event all seven such records are grade 2 (tropical depression). The original token is retained. No stronger interpretation of this token is asserted.',
    windRadiiZeroPolicy: 'An explicitly reported direction 0 and radius 0 is retained as 0 per the JMA format. This differs from blank, unavailable wind-radius fields.',
    use: 'Drive actual-time center tracks, center wind and pressure curves, and reported long/short wind-radius summaries.',
    limits: 'Track records do not contain satellite pixels, a full wind field, cloud height, rain distribution, city impacts or station wind measurements. A radius summary is not an observed polygon or a complete spatial wind field. Do not generate cloud spirals and present them as recorded imagery.',
    localTimeDisplay: 'Convert from UTC for display, e.g. Hong Kong/Beijing = UTC+08:00; keep the stored UTC unchanged.',
    agencyComparability: 'Keep JMA 10-minute winds separate from other agency estimates; do not silently mix with JTWC 1-minute wind or HKO best-track values.'
  },
  summary: {
    recordCount: records.length,
    startTimeUtc: records[0].timeUtc,
    endTimeUtc: records.at(-1).timeUtc,
    intervalHours: 6,
    reportedWindCount: records.filter(r => r.windKt !== null).length,
    unreportedWindCount: records.filter(r => r.windKt === null).length,
    peakWindKt: Math.max(...records.filter(r => r.windKt !== null).map(r => r.windKt)),
    minimumCentralPressureHpa: Math.min(...records.map(r => r.pressureHpa))
  },
  records
};
fs.writeFileSync(path.join(dir, 'mangkhut-jma.json'), JSON.stringify(data, null, 2) + '\n');
console.log(JSON.stringify({ file: path.join(dir, 'mangkhut-jma.json'), summary: data.summary, example: records.find(r => r.timeUtc === '2018-09-16T06:00:00Z') }, null, 2));
