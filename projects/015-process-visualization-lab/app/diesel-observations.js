export function validateDieselObservations(data) {
  if (data.focus !== null || data.clock?.intervalSeconds !== 0.1 || data.samples?.length !== 18000) {
    throw new TypeError('柴油机台架需要完整的 ETC 0.1 秒采样。');
  }
  for (const [index, sample] of data.samples.entries()) {
    if (sample?.t !== index / 10 || ![sample.rpm, sample.torqueNm, sample.railPressureMpa].every(Number.isFinite)) {
      throw new TypeError('柴油机原档时钟或通道不一致。');
    }
  }
  return data;
}

export function dieselSnapshot(data, elapsedSeconds) {
  const sample = data.samples[Math.round(elapsedSeconds * 10)];
  if (!sample || sample.t !== elapsedSeconds) throw new RangeError('必须选择原档采样时刻。');
  return {eventId: data.id, elapsedSeconds, sample};
}

export function formatDieselElapsed(seconds) {
  const tenth = Math.round(seconds * 10);
  return String(Math.floor(tenth / 600)).padStart(2, '0') + ':' +
    String(Math.floor(tenth / 10) % 60).padStart(2, '0') + '.' + tenth % 10;
}
