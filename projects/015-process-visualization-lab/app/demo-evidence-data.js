/** Read-only comparisons of supplied observations. No fetching, interpolation or rendering. */
export const tasks = {
  volcano: { id: 'volcano', eventId: 'hunga-tonga-2022-b13', title: '汤加：从背景到伞状云', question: '同一范围里的低温区域，四小时里怎样变化？', route: 'dynamic-volcano', fromUtc: '2022-01-15T03:50:00Z', toUtc: '2022-01-15T07:50:00Z', view: 'detail', takeaway: '固定300公里邻域的低温统计可用于前后比较；它不是全部火山灰云面积、云高或地面受灾范围。' },
  quake: { id: 'quake', eventId: 'tohoku-2011-observed-stations', title: '东北地震：震前记录与强信号时段', question: '同一台站的震前记录与强信号时段，有什么变化？', route: 'dynamic-quake', fromUtc: '2011-03-11T05:46:00Z', toUtc: '2011-03-11T05:49:20Z', view: 'detail', stationId: 'IU.MAJO.00.BHZ', takeaway: '前后必须比较同一台站、同一计数口径；符号反转不是强度增幅，counts不是地面位移，也不能据此比较不同台站谁震得更强。' },
  storm: { id: 'storm', eventId: 'hinnamnor-2022-0905', title: '轩岚诺：看云系，也核对强度', question: '北上这段时间，云系和官方风速记录各发生了什么变化？', route: 'dynamic-storm', fromUtc: '2022-09-05T03:00:00Z', toUtc: '2022-09-05T13:30:00Z', view: 'detail', takeaway: '亮温统计来自同一固定窗口；官方风速、气压是另外时刻的事后分析。云更亮或低温面积变化，不等于风速或降雨量同步增减。' },
  mangkhut: { id: 'mangkhut', eventId: 'jma-1822', title: '山竹：香港中午这一小时', question: '香港中午这一小时，机场风、雨量范围与海水位怎样变化？', route: 'typhoon-real', fromUtc: '2018-09-16T04:00:00Z', toUtc: '2018-09-16T05:00:00Z', view: 'detail', takeaway: '各测站的采样口径不同；海水位相对UHSLC站点零点，不是单独风暴潮增水。东区雨量是多测站范围，不能取中点或相减成单站雨量增量。' }
};

const finite = value => typeof value === 'number' && Number.isFinite(value);
const number = value => finite(value) ? value : null;
const copy = value => value == null ? null : structuredClone(value);

function utc(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) throw new TypeError('对照时间必须是明确的UTC时间');
  const time = Date.parse(value), normalized = value.endsWith('.000Z') || /\.\d{3}Z$/.test(value) ? value : value.replace('Z', '.000Z');
  if (!Number.isFinite(time) || new Date(time).toISOString() !== normalized) throw new RangeError('对照日期无效');
  return time;
}

function exact(records, target) {
  const sample = (records || []).find(record => utc(record.timeUtc) === target) || null;
  return { sample, status: sample ? 'exact' : 'missing', ageSeconds: sample ? 0 : null };
}

function latest(records, target, maxAgeSeconds) {
  if (!finite(maxAgeSeconds) || maxAgeSeconds < 0) throw new TypeError('来源必须提供有效的时间容差');
  let sample = null;
  for (const record of records || []) if (utc(record.timeUtc) <= target && (!sample || utc(record.timeUtc) > utc(sample.timeUtc))) sample = record;
  if (!sample) return { sample: null, status: 'missing', ageSeconds: null };
  const ageSeconds = (target - utc(sample.timeUtc)) / 1000;
  return ageSeconds > maxAgeSeconds ? { sample: null, status: 'expired', ageSeconds } : { sample, status: ageSeconds === 0 ? 'exact' : 'latest', ageSeconds };
}

function timeFields(a, b) {
  const result = {};
  for (const [prefix, selection] of [['a', a], ['b', b]]) {
    const record = selection.sample;
    result[prefix + 'TimeUtc'] = record?.timeUtc ?? null;
    result[prefix + 'Status'] = selection.status;
    result[prefix + 'AgeSeconds'] = selection.ageSeconds;
    result[prefix + 'SourceLine'] = record?.sourceLine ?? null;
    result[prefix + 'SourceRecordIndex'] = record?.sourceRecordIndex ?? null;
    result[prefix + 'PeakTimeUtc'] = record?.peakTimeUtc ?? null;
    result[prefix + 'WindowStartUtc'] = record?.windowStartUtc ?? null;
    result[prefix + 'WindowEndUtc'] = record?.windowEndUtc ?? null;
    result[prefix + 'PublishedAtUtc'] = record?.publishedAtUtc ?? null;
    result[prefix + 'SourceUrl'] = record?.sourceUrl ?? null;
  }
  return result;
}

function scalarRow(id, label, unit, a, b, getValue, notes) {
  const left = number(a.sample ? getValue(a.sample) : null), right = number(b.sample ? getValue(b.sample) : null);
  return { id, label, unit, valueType: 'scalar', a: left, b: right, delta: left === null || right === null ? null : right - left,
    ...timeFields(a, b), aStatus: left === null && a.status !== 'expired' ? 'missing' : a.status, bStatus: right === null && b.status !== 'expired' ? 'missing' : b.status,
    notes: notes.filter(Boolean) };
}

function image(selection) {
  const frame = selection.sample;
  if (!frame) return null;
  return { url: frame.url, timeUtc: frame.timeUtc, scanStartUtc: frame.scanStartUtc ?? null, scanEndUtc: frame.scanEndUtc ?? null,
    regionalScanStartUtcEstimate: frame.regionalScanStartUtcEstimate ?? null, regionalScanEndUtcEstimate: frame.regionalScanEndUtcEstimate ?? null,
    sha256: frame.sha256, width: frame.width, height: frame.height,
    sourceUrls: frame.sourceUrls ? [...frame.sourceUrls] : frame.sourceSegments ? frame.sourceSegments.map(source => source.sourceUrl) : frame.sourceUrl ? [frame.sourceUrl] : [] };
}

function imageFields(a, b) {
  return { fromImage: image(a), toImage: image(b), fromImageStatus: a.status, toImageStatus: b.status,
    imageTimeMeaning: '图像只取精确匹配的名义扫描时刻；实际扫描起止另列。没有帧时返回null，不沿用上一张图。' };
}

function frameRows(data, a, b, ids) {
  return ids.map(id => {
    const series = data.series?.find(item => item.id === id);
    if (!series) throw new TypeError('缺少同帧统计指标：' + id);
    return scalarRow(id, series.label, series.unit, a, b, frame => frame.stats?.[id], [series.method, '差值为B减A；两帧使用同一统计区域和方法，不从显示颜色反推数值。']);
  });
}

function waveformWindow(samples, target) {
  return (samples || []).filter(sample => utc(sample.timeUtc) > target - 30000 && utc(sample.timeUtc) <= target).map(copy);
}

/** Returns observations and derived differences, never an estimated intermediate measurement.
 * task accepts a task key or the exported descriptor. Overrides select arbitrary covered times.
 * Missing exact image/point -> null. Asynchronous source series may use their explicit max age.
 * Range rows deliberately use aRange/bRange; a/b/delta remain null (no midpoint or range subtraction).
 */
export function buildDemoEvidence(task, data, fromUtc, toUtc, stationId) {
  const descriptor = tasks[typeof task === 'string' ? task : task?.id];
  if (!descriptor) throw new TypeError('未知对照任务');
  if (!data || (data.id ?? data.eventId) !== descriptor.eventId) throw new TypeError('任务与事件资料不一致');
  const from = fromUtc ?? descriptor.fromUtc, to = toUtc ?? descriptor.toUtc;
  const aTime = utc(from), bTime = utc(to);
  if (bTime < aTime) throw new RangeError('结束时间不能早于开始时间');
  if (aTime < utc(data.startUtc) || bTime > utc(data.endUtc)) throw new RangeError('对照时间超出事件资料范围');
  const result = { title: descriptor.title, question: descriptor.question, kind: descriptor.id, eventId: descriptor.eventId,
    fromUtc: from, toUtc: to, route: descriptor.route, takeaway: descriptor.takeaway, rows: [],
    limitations: [...(data.limitations || [])], sources: copy(data.sources || []), deltaMeaning: 'B记录减A记录；不表示变化发生原因、增长率或灾害影响。' };

  if (descriptor.id === 'quake') {
    const selectedId = stationId ?? descriptor.stationId;
    const station = data.stations?.find(item => item.id === selectedId);
    if (!station || station.unit !== 'counts') throw new RangeError('需要实际存在、单位为counts的同一台站');
    const a = exact(station.samples, aTime), b = exact(station.samples, bTime);
    const caution = '同一台站、同一震前基线；单位为数字仪器计数，未校正完整仪器响应。不能解释为地面速度、位移、能量或跨站震动强弱。';
    result.rows = [
      scalarRow('peakCounts', '1秒窗内峰值计数偏差（带正负）', 'counts', a, b, sample => sample.value, [caution, '正负反转不是强度增幅；delta只表示两条带符号计数的算术差。']),
      scalarRow('absolutePeakCounts', '1秒窗内最大绝对计数偏差', 'counts', a, b, sample => finite(sample.value) ? Math.abs(sample.value) : null, [caution, '绝对值仅用于描述同站记录大小，不改变原始采样；两张波形采用共同纵轴。'])
    ];
    const aWave = waveformWindow(station.samples, aTime), bWave = waveformWindow(station.samples, bTime);
    const magnitudes = [...aWave, ...bWave].flatMap(sample => [sample.value, sample.min, sample.max].filter(finite).map(Math.abs));
    result.waveforms = { stationId: station.id, unit: 'counts', windowSeconds: 30, a: aWave, b: bWave,
      scale: magnitudes.length ? Math.max(...magnitudes) : null,
      windowMeaning: '(所选时刻−30秒, 所选时刻]中的实际1秒窗记录；缺失值保留null，不补点；共同scale来自两窗所有value/min/max的最大绝对值。' };
    result.station = { id: station.id, name: station.name, lat: station.lat, lon: station.lon, channel: station.channel, unit: station.unit, baselineCounts: station.baselineCounts, baselineWindow: copy(station.baselineWindow), sourceUrl: station.sourceUrl };
    result.originUtc = data.originUtc;
    return result;
  }

  const frames = descriptor.id === 'mangkhut' ? data.clouds?.frames : data.frames;
  const aFrame = exact(frames, aTime), bFrame = exact(frames, bTime);
  Object.assign(result, imageFields(aFrame, bFrame));
  result.bbox = [...(descriptor.id === 'mangkhut' ? data.clouds.bbox : data.bbox)];

  if (descriptor.id === 'volcano' || descriptor.id === 'storm') {
    result.rows = frameRows(data, aFrame, bFrame, descriptor.id === 'volcano' ? ['coldAreaKm2', 'p10K'] : ['below235KAreaKm2', 'p10K']);
    if (descriptor.id === 'volcano') result.statisticsRegion = copy(data.statisticsRegion);
    if (descriptor.id === 'storm') {
      for (const id of ['windKt', 'pressureHpa']) {
        const series = data.series.find(item => item.id === id);
        if (!series) throw new TypeError('缺少官方分析指标：' + id);
        const a = latest(series.samples, aTime, series.maxAgeSeconds), b = latest(series.samples, bTime, series.maxAgeSeconds);
        // Recover the original JMA text line only when both time and value match the track record.
        for (const selection of [a, b]) {
          const original = selection.sample && data.track?.find(record => utc(record.timeUtc) === utc(selection.sample.timeUtc) && record[id] === selection.sample.value);
          if (original?.sourceLine !== undefined) selection.sample = { ...selection.sample, sourceLine: original.sourceLine };
        }
        result.rows.push(scalarRow(id, series.label, series.unit, a, b, sample => sample.value, [series.method, 'A/B时刻分别采用不晚于回放时刻且未超来源时限的最近官方分析；必须同时显示aTimeUtc/bTimeUtc。']));
      }
    }
    return result;
  }

  result.limitations = [descriptor.takeaway, '历史观测时间对齐不等于当时已发布；雨量累计窗口、观测时间和发布时间分别保留。'];
  result.sources = [{ name: data.clouds?.label || '卫星影像', url: data.clouds?.source?.url || data.clouds?.source }, ...data.series.map(series => ({ name: series.source?.label || series.source?.agency || series.label, url: series.source?.url }))].filter(source => typeof source.url === 'string');
  for (const id of ['wind', 'seaLevel', 'rain']) {
    const series = data.series.find(item => item.id === id);
    if (!series) throw new TypeError('缺少地面观测指标：' + id);
    const a = latest(series.samples, aTime, series.maxAgeMinutes * 60), b = latest(series.samples, bTime, series.maxAgeMinutes * 60);
    if (series.kind === 'range') {
      const range = record => record && finite(record.lower) && finite(record.upper) && record.lower <= record.upper ? { lower: record.lower, upper: record.upper } : null;
      const aRange = range(a.sample), bRange = range(b.sample);
      result.rows.push({ id, label: series.label, unit: series.unit, valueType: 'range', a: null, b: null, delta: null, aRange, bRange,
        ...timeFields(a, b), aStatus: aRange ? a.status : a.status === 'expired' ? 'expired' : 'missing', bStatus: bRange ? b.status : b.status === 'expired' ? 'expired' : 'missing',
        station: copy(series.station), notes: [series.measurementNote, '上下限属于地区内不同测站的一小时累计量范围，不取中点，不计算范围差为单站增量。'] });
    } else {
      const row = scalarRow(id, series.label, series.unit, a, b, sample => sample.value, [series.measurementLabel, series.measurementNote,
        id === 'seaLevel' ? '水位与水位差均来自同站同基准；基准为UHSLC站点零点，未转为海图基准，也未扣除天文潮，因此不是单独风暴潮增水。' : '机场平均风，不是台风中心最大风；A/B记录时间与云图名义时刻分别保留。']);
      row.station = copy(series.station);
      if (id === 'seaLevel') row.datum = copy(series.datum);
      result.rows.push(row);
    }
  }
  return result;
}
