function utcTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) {
    throw new TypeError('时间必须为明确标注 Z 的 ISO UTC 字符串');
  }
  const time = Date.parse(value);
  const normalized = value.replace(/(?:\.(\d{1,3}))?Z$/, (_, fraction = '') => `.${fraction.padEnd(3, '0')}Z`);
  if (!Number.isFinite(time) || new Date(time).toISOString() !== normalized) {
    throw new TypeError('时间包含无效日期');
  }
  return time;
}

function eventRecords(dataset) {
  if (!Array.isArray(dataset?.records) || dataset.records.length === 0) {
    throw new TypeError('事件必须包含至少一条真实记录');
  }
  return dataset.records;
}

/** Validate without converting units, filling missing values, or changing records. */
export function validateEventDataset(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.name !== 'string' || !raw.name.trim()) {
    throw new TypeError('事件名称不能为空');
  }
  const records = eventRecords(raw);
  let previousTime = -Infinity;
  records.forEach((record, index) => {
    if (!record || typeof record !== 'object') throw new TypeError(`第 ${index + 1} 条记录无效`);
    const time = utcTimestamp(record.timeUtc);
    if (time <= previousTime) throw new RangeError('记录时间必须严格递增且不能重复');
    previousTime = time;
    if (!Number.isFinite(record.lat) || record.lat < -90 || record.lat > 90 ||
        !Number.isFinite(record.lon) || record.lon < -180 || record.lon > 180) {
      throw new RangeError(`第 ${index + 1} 条记录的经纬度无效`);
    }
    if (record.pressureHpa !== null && (!Number.isFinite(record.pressureHpa) || record.pressureHpa <= 0)) {
      throw new RangeError(`第 ${index + 1} 条记录的气压必须为正数或 null`);
    }
    if (record.windKt !== null && (!Number.isFinite(record.windKt) || record.windKt < 0)) {
      throw new RangeError(`第 ${index + 1} 条记录的风速必须为非负数或 null`);
    }
  });
  return raw;
}

/** Return an original record; playback steps never invent intermediate measurements. */
export function recordAtIndex(dataset, index) {
  const records = eventRecords(dataset);
  if (!Number.isFinite(index)) throw new TypeError('记录索引必须为有限数字');
  return records[Math.min(records.length - 1, Math.max(0, Math.trunc(index)))];
}

/** Nearest real analysis time; an exact halfway time selects the earlier record. */
export function findRecordIndex(dataset, iso) {
  const records = eventRecords(dataset);
  const target = utcTimestamp(iso);
  let low = 0;
  let high = records.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (Date.parse(records[middle].timeUtc) < target) low = middle + 1;
    else high = middle;
  }
  if (low === 0) return 0;
  const earlierDistance = Math.abs(target - Date.parse(records[low - 1].timeUtc));
  const laterDistance = Math.abs(Date.parse(records[low].timeUtc) - target);
  return earlierDistance <= laterDistance ? low - 1 : low;
}

/** Preserve nulls so chart renderers can leave gaps instead of plotting zero wind. */
export function metricSeries(dataset, field) {
  return eventRecords(dataset).map(record => {
    const value = record[field];
    if (value !== null && !Number.isFinite(value)) throw new TypeError(`指标 ${String(field)} 必须为数字或 null`);
    return { timeUtc: record.timeUtc, value };
  });
}

const shanghaiFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric', month: 'numeric', day: 'numeric',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function formatTime(timeUtc) {
  const timestamp = utcTimestamp(timeUtc);
  const parts = Object.fromEntries(shanghaiFormatter.formatToParts(timestamp).map(part => [part.type, part.value]));
  return `${parts.year}年${parts.month}月${parts.day}日 ${parts.hour}:${parts.minute}（北京时间 UTC+8）`;
}
