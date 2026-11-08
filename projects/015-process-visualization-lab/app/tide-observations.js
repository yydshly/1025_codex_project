const utc = value => typeof value === 'string' && value.endsWith('Z') ? Date.parse(value) : NaN;
const finite = Number.isFinite;
const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const portClock = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short',
});

export const formatTideUtc = time => clock.format(new Date(time));
export function formatPortClock(time) {
  const fields = Object.fromEntries(portClock.formatToParts(new Date(time)).map(({type, value}) => [type, value]));
  return `${fields.month}/${fields.day} ${fields.hour}:${fields.minute} ${fields.timeZoneName}`;
}

export function validateTideObservations(data) {
  const start = utc(data.startUtc), end = utc(data.endUtc);
  if (!finite(start) || !finite(end) || end <= start || data.cadenceSeconds !== 360 ||
      data.datum !== 'MLLW' || data.unit !== 'm' || !data.station?.id ||
      data.station.lat !== data.focus.lat || data.station.lon !== data.focus.lon) {
    throw new TypeError('Invalid tide station, datum or observation period.');
  }
  const count = (end - start) / 360000 + 1;
  if (data.clock?.length !== count || data.clock.some((tick, i) => utc(tick.timeUtc) !== start + i * 360000)) {
    throw new RangeError('Invalid six-minute UTC clock.');
  }
  const ticks = new Set(data.clock.map(tick => utc(tick.timeUtc)));
  function checkRecords(records, valid) {
    if (!Array.isArray(records)) throw new TypeError('Invalid tide records.');
    let previous = -Infinity;
    for (const record of records) {
      const time = utc(record.timeUtc);
      if (!ticks.has(time) || time <= previous || !valid(record)) throw new TypeError('Invalid tide observation record.');
      previous = time;
    }
  }
  checkRecords(data.moon, item => finite(item.azimuthDeg) && item.azimuthDeg >= 0 && item.azimuthDeg < 360 &&
    finite(item.elevationDeg) && Math.abs(item.elevationDeg) <= 90 &&
    finite(item.illuminationPct) && item.illuminationPct >= 0 && item.illuminationPct <= 100 &&
    finite(item.rangeKm) && item.rangeKm > 0);
  if (data.series?.length !== 2 || !['observed', 'predicted'].every(id => data.series.some(series => series.id === id && series.unit === 'm'))) {
    throw new TypeError('Separate measured and predicted tide series required.');
  }
  for (const series of data.series) checkRecords(series.samples, item => item.value === null || finite(item.value));
  return data;
}
