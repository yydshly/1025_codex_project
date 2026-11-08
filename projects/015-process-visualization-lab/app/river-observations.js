const coordinate = item => Number.isFinite(item?.lat) && Math.abs(item.lat) <= 90 &&
  Number.isFinite(item?.lon) && Math.abs(item.lon) <= 180;

export function validateRiverObservations(data) {
  if (!Array.isArray(data.clock) || data.clock.length < 2 ||
      !Number.isInteger(data.cadenceSeconds) || data.cadenceSeconds <= 0) throw new TypeError('Invalid river clock.');
  const seconds = new Set();
  for (const [index, tick] of data.clock.entries()) {
    if (!Number.isInteger(tick.elapsedSeconds) ||
        (index > 0 && tick.elapsedSeconds - data.clock[index - 1].elapsedSeconds !== data.cadenceSeconds) ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(tick.localTime)) throw new RangeError('Invalid elapsed observation time.');
    seconds.add(tick.elapsedSeconds);
  }
  if (!Array.isArray(data.transects) || !data.transects.length) throw new TypeError('Observed river transects required.');
  const ids = new Set();
  let distance = -Infinity;
  for (const section of data.transects) {
    if (typeof section.id !== 'string' || !section.id || ids.has(section.id) || !section.label ||
        !Number.isFinite(section.distanceM) || section.distanceM <= distance ||
        section.banks?.length !== 2 || !['left', 'right'].every(side => section.banks.some(bank => bank.bank === side))) {
      throw new TypeError('Invalid river transect.');
    }
    distance = section.distanceM;
    ids.add(section.id);
    for (const bank of section.banks) {
      if (!coordinate(bank) || !bank.id || ids.has(bank.id) || !bank.samples?.length) throw new TypeError('Invalid sampling point.');
      ids.add(bank.id);
      let previous = -Infinity;
      for (const sample of bank.samples) {
        if (!seconds.has(sample.elapsedSeconds) || sample.elapsedSeconds <= previous ||
            (sample.value !== null && !Number.isFinite(sample.value)) ||
            !Number.isInteger(sample.sourceLine) || sample.sourceLine < 2) throw new TypeError('Invalid river measurement.');
        previous = sample.elapsedSeconds;
      }
    }
  }
  return data;
}

function findElapsed(records, seconds) {
  let left = 0, right = records.length - 1;
  while (left <= right) {
    const index = (left + right) >> 1, tick = records[index].elapsedSeconds;
    if (tick === seconds) return records[index];
    if (tick < seconds) left = index + 1;
    else right = index - 1;
  }
  return null;
}

export function riverSnapshot(data, elapsedSeconds) {
  const tick = findElapsed(data.clock, elapsedSeconds);
  if (!tick) throw new RangeError('River clock must select a recorded tick.');
  return {
    eventId: data.id,
    elapsedSeconds,
    localTime: tick.localTime,
    readings: data.transects.flatMap(section => section.banks.map(bank => {
      const sample = findElapsed(bank.samples, elapsedSeconds);
      return {
        id: bank.id, bank: bank.bank, transectId: section.id, lat: bank.lat, lon: bank.lon,
        elapsedSeconds, value: sample?.value ?? null, unit: 'ppb',
        sourceLine: sample?.sourceLine ?? null, localTime: sample ? tick.localTime : null,
      };
    })),
  };
}
