const batteryFields = ['voltageV', 'currentA', 'temperatureC'];

export function validateBatteryObservations(data) {
  if (!Array.isArray(data.samples) || data.samples.length < 2 || data.samples[0].elapsedSeconds !== 0) {
    throw new TypeError('Battery discharge requires a native elapsed clock.');
  }
  let previous = -Infinity;
  for (const sample of data.samples) {
    if (!Number.isFinite(sample.elapsedSeconds) || sample.elapsedSeconds <= previous ||
        batteryFields.some(field => sample[field] !== null && !Number.isFinite(sample[field]))) {
      throw new TypeError('Invalid battery measurement.');
    }
    previous = sample.elapsedSeconds;
  }
  return data;
}

export function batterySnapshot(data, elapsedSeconds) {
  const sample = data.samples.find(row => row.elapsedSeconds === elapsedSeconds);
  if (!sample) throw new RangeError('Battery clock must select a recorded sample.');
  return {eventId: data.id, elapsedSeconds, sample};
}

export function formatBatteryElapsed(seconds, {fraction = true} = {}) {
  if (!Number.isFinite(seconds) || seconds < 0) return '缺测';
  const milliseconds = Math.round(seconds * 1000);
  const whole = Math.floor(milliseconds / 1000);
  const parts = [Math.floor(whole / 3600), Math.floor(whole / 60) % 60, whole % 60];
  const clock = parts.map(value => String(value).padStart(2, '0')).join(':');
  return fraction ? clock + '.' + String(milliseconds % 1000).padStart(3, '0') : clock;
}
