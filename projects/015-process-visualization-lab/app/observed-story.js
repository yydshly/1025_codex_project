import { utcMillis, selectObservation } from './sync-timeline.js';
import { getDynamicEvent } from './dynamic-events.js';
import { formatRiverElapsed } from './river-evidence.js';

const finite = Number.isFinite;
const number = (value, digits = 1) => finite(value) ? new Intl.NumberFormat('zh-CN', { maximumFractionDigits: digits }).format(value) : '缺测';
const clock = value => new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(value)) + ' UTC+8';
const exact = (records, time) => (records || []).find(record => utcMillis(record.timeUtc) === time) ?? null;
const coordinate = position => position && finite(position.lat) && Math.abs(position.lat) <= 90 && finite(position.lon);
const wrappedLon = lon => lon >= -180 && lon <= 180 ? lon : ((lon + 180) % 360 + 360) % 360 - 180;
const pin = (id, position, title, value, detail, target, timeUtc, color) => coordinate(position) ? {
  id, lat: position.lat, lon: wrappedLon(position.lon), title, value, detail, target, sourceTimeUtc: timeUtc ?? null, color,
} : null;
const recordValue = sample => finite(sample?.value) ? sample.value : null;

function previousFrame(data, time, previousTimeUtc) {
  if (previousTimeUtc !== undefined && previousTimeUtc !== null) {
    const previous = utcMillis(previousTimeUtc);
    return previous < time ? exact(data.frames, previous) : null;
  }
  return (data.frames || []).filter(frame => utcMillis(frame.timeUtc) < time).at(-1) ?? null;
}

function registeredFeatures(features, kind, time, frame, eventId) {
  if (!frame) return null;
  const event = features?.events?.[kind];
  if (!event || event.projection !== 'EPSG:4326' || event.eventId !== eventId) return null;
  return exact(event.frames, time);
}

function featureLines(feature, color) {
  return (feature?.lines || []).filter(line => typeof line.id === 'string' && Array.isArray(line.coordinates) && line.coordinates.length >= 2 &&
    line.coordinates.every(point => Array.isArray(point) && point.length >= 2 && finite(point[0]) && finite(point[1]) && Math.abs(point[1]) <= 90))
    .map(line => ({ id: line.id, coordinates: line.coordinates.map(point => [point[0], point[1]]), color: line.color || color }));
}

function displacementKm(a, b) {
  const rad = Math.PI / 180, latitude = (b.lat - a.lat) * rad, longitude = (b.lon - a.lon) * rad;
  const value = Math.sin(latitude / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(longitude / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(Math.max(0, Math.min(1, value))), Math.sqrt(Math.max(0, 1 - value)));
}

function base(data, kind, timeUtc) {
  return { id: (data.id ?? data.eventId) + '-story', kind, timeUtc, headline: '', summary: '', notes: [], lines: [], pins: [], metricsFocus: [], phase: 'observed', sourceTime: null };
}

function cloudStory(kind, input, time) {
  const { data, snapshotTimeUtc: timeUtc, features, previousTimeUtc } = input;
  const result = base(data, kind, timeUtc), frame = exact(data.frames, time), previous = previousFrame(data, time, previousTimeUtc);
  const feature = registeredFeatures(features, kind, time, frame, data.id), volcano = kind === 'volcano';
  const scanTime = value => value.slice(11, 16) + ' UTC';
  const areaId = volcano ? 'coldAreaKm2' : 'below235KAreaKm2', area = frame?.stats?.[areaId], p10 = frame?.stats?.p10K;
  const before = previous?.stats?.[areaId], delta = finite(area) && finite(before) ? area - before : null;
  result.metricsFocus = volcano ? [areaId, 'p10K'] : [areaId]; result.sourceTime = frame?.timeUtc ?? null;
  result.lines = featureLines(feature, volcano ? '#ffb98b' : '#91dfe8');
  result.phase = !frame ? 'missing-frame' : delta === null ? 'observed' : delta > 0 ? 'area-increased' : delta < 0 ? 'area-decreased' : 'area-unchanged';
  if (volcano) {
    result.headline = !frame ? '这个时刻缺少真实扫描' : delta === null ? '先看汤加附近的低温区域' : delta > 0 ? '同一范围内，低温区域比前一幅更大' : delta < 0 ? '同一范围内，低温区域比前一幅更小' : '低温区域面积与前一幅相同';
    result.summary = frame ? `固定300公里邻域内，低于220 K的区域为${number(area)} km²；亮温P10为${number(p10, 2)} K。` : '没有沿用别的时刻，也没有补造云团。';
    result.pins.push(pin('volcano-location', data.focus, '汤加火山位置', frame ? `低温区域 ${number(area)} km²` : '本时刻缺帧', '统计固定300公里邻域\n不是火山灰浓度或喷发高度', areaId, frame?.timeUtc, '#ffb98b'));
    result.notes.push('位置来自火山目录；低温统计可能包含气象云，不等于全部火山灰云。');
  } else {
    result.headline = !frame ? '云图缺帧，中心分析另列时间' : delta === null ? '先分开看云系与官方中心分析' : `固定窗口内的低温像元面积${delta > 0 ? '增加' : delta < 0 ? '减少' : '不变'}`;
    result.summary = frame ? `≤235 K像元面积${number(area)} km²，亮温P10为${number(p10, 2)} K。` : '未补造云图；有时效内的官方分析仍按原时间标明。';
    const track = (data.track || []).filter(record => utcMillis(record.timeUtc) <= time), latest = track.at(-1);
    const maxAge = data.series?.find(series => series.id === 'windKt')?.maxAgeSeconds;
    const current = latest && finite(maxAge) && (time - utcMillis(latest.timeUtc)) / 1000 <= maxAge ? latest : null;
    const previousAnalysis = current ? track.at(-2) : null;
    if (current && coordinate(current)) {
      result.pins.push(pin('jma-current', current, 'JMA 中心分析', `${number(current.windKt)} kt`, `${scanTime(current.timeUtc)} 分析\n10分钟平均风 · 中心气压 ${number(current.pressureHpa)} hPa`, 'windKt', current.timeUtc, '#efc588'));
      result.sourceTime = current.timeUtc; result.metricsFocus.push('windKt');
      if (previousAnalysis && coordinate(previousAnalysis)) {
        const distance = displacementKm(previousAnalysis, current);
        result.summary += ` 相比${scanTime(previousAnalysis.timeUtc)}，分析中心移位约${number(distance, 0)} km（按坐标计算）。`;
        result.notes.push('金色线段比较最近两次官方分析位置。');
        if (distance > 0) result.lines.push({ id: 'jma-center-displacement', coordinates: [[previousAnalysis.lon, previousAnalysis.lat], [current.lon, current.lat]], color: '#efc588' });
      }
    } else result.notes.push('这个时刻没有时效内的JMA中心分析，未使用未来记录或过期中心。');
    result.notes.push('固定窗口还包含其他天气系统；低温像元面积不是台风大小、降雨面积或风速场。');
  }
  if (frame && coordinate(feature?.anchor)) {
    const value = volcano ? `区域P10 ${number(p10, 2)} K` : `${number(area, 0)} km²`;
    result.pins.push(pin(kind + '-cold-pixel', feature.anchor, '低温区域统计', value, '读数为固定窗口统计\n位置指向本帧实际低温像元', volcano ? 'p10K' : areaId, frame.timeUtc, volcano ? '#ffe0bd' : '#a6e7f4'));
    result.notes.push('P10为统计范围内亮温第10百分位；此标注位置来自实测低温像元，读数是区域统计，不是该像元的单点温度，也不是灰云中心或台风眼。');
  }
  if (delta !== null) {
    result.summary += ` 较上一幅（${scanTime(previous.timeUtc)}）${delta > 0 ? '增加' : delta < 0 ? '减少' : '变化'}${number(Math.abs(delta))} km²。`;
    result.notes.push(`名义扫描时刻 ${scanTime(previous.timeUtc)} → ${scanTime(frame.timeUtc)}：同范围面积变化${delta > 0 ? '+' : ''}${number(delta)} km²。`);
  }
  if (feature?.deltaMetrics?.spansKnownMissing) result.notes.push('相邻可用扫描之间有源资料缺档；这里只比较真实两端，不推断缺档期间怎样变化。');
  if (frame) result.notes.push(`名义扫描时刻 ${frame.timeUtc}${frame.scanStartUtc && frame.scanEndUtc ? `；实际扫描 ${frame.scanStartUtc} — ${frame.scanEndUtc}` : ''}。`);
  result.pins = result.pins.filter(Boolean).slice(0, 3);
  return result;
}

function quakeStory(input, time) {
  const { data, snapshotTimeUtc: timeUtc, stationId } = input, result = base(data, 'quake', timeUtc);
  const selected = stationId === undefined ? data.stations?.[0] : data.stations?.find(station => station.id === stationId);
  const states = (data.stations || []).map(station => ({ station, sample: exact(station.samples, time) }));
  const reading = states.find(entry => entry.station === selected), sample = reading?.sample, value = recordValue(sample);
  const valid = states.filter(entry => finite(recordValue(entry.sample))).length;
  result.phase = !selected ? 'unknown-station' : value === null ? 'missing-record' : time < utcMillis(data.originUtc) ? 'before-origin' : 'recorded';
  result.headline = !selected ? '所选台站不在这份实测资料中' : value === null ? `${selected.stationCode || selected.id}此刻缺少有效记录` : `${selected.stationCode || selected.id}：看这一秒的真实起伏`;
  result.summary = selected ? `所选站峰值计数偏差${number(value, 1)} counts；同一窗末${valid}/${states.length}站有有效记录。` : `可用台站${valid}/${states.length}；未替换成其他台站的读数。`;
  result.sourceTime = sample?.timeUtc ?? null; result.metricsFocus = selected ? [selected.id] : [];
  if (selected) result.pins.push(pin('quake-selected-station', selected, `${selected.stationCode || selected.id} · 所选实测站`, `${number(value, 1)} counts`, `1秒窗末 ${clock(timeUtc)}\n正负是计数符号，不是震动强度排名`, selected.id, sample?.timeUtc, '#c5afff'));
  result.pins.push(pin('quake-origin', data.focus, '震中', `M ${number(data.magnitude, 1)}`, `${clock(data.originUtc)}发震\n定位符号，不生成理论震波`, 'origin', data.originUtc, '#efc588'));
  result.notes.push(states.map(({ station, sample: item }) => `${station.stationCode || station.id} ${number(recordValue(item), 1)} counts`).join('；'));
  if (sample) result.notes.push(`当前值取自 ${sample.windowStartUtc} — ${sample.windowEndUtc} 的真实1秒窗${sample.peakTimeUtc ? `，峰值采样 ${sample.peakTimeUtc}` : ''}。`);
  result.notes.push('各站仪器响应和显示尺度不同；counts未转换为速度、加速度或位移。符号反转不能解释为强度增幅，也没有自动标注P/S到时。');
  result.pins = result.pins.filter(Boolean).slice(0, 3);
  return result;
}

function mangkhutStory(input, time) {
  const { data, snapshotTimeUtc: timeUtc } = input, result = base(data, 'mangkhut', timeUtc);
  const selections = new Map((data.series || []).map(series => [series.id, { series, selection: selectObservation(series, timeUtc) }]));
  result.headline = '同一时钟，对照机场风与鲗鱼涌水位';
  const summaries = [];
  for (const id of ['wind', 'seaLevel']) {
    const item = selections.get(id); if (!item) continue;
    const { series, selection } = item, sample = selection.sample, age = selection.ageMinutes;
    const label = id === 'wind' ? '香港机场平均风' : '鲗鱼涌海水位';
    const sourceClock = sample ? `${clock(sample.timeUtc)}记录${age ? ` · 早${number(age, 0)}分钟` : ' · 同刻'}` : '此刻档案缺报，未补零';
    summaries.push(`${label}${number(recordValue(sample), 2)} ${series.unit}`);
    result.pins.push(pin('mangkhut-' + id, series.station, label, `${number(recordValue(sample), 2)} ${series.unit}`, sourceClock + '\n' + (id === 'wind' ? '10分钟平均风 · 半小时报文' : 'UHSLC站点零点 · 非风暴潮增水'), id, sample?.timeUtc, id === 'wind' ? '#86ddda' : '#e6bc80'));
    result.notes.push(`${label}：${sourceClock}。`);
  }
  const rain = selections.get('rain'), rainSample = rain?.selection.sample;
  if (rain) result.notes.push(rainSample ? `东区雨量为${number(rainSample.lower)}—${number(rainSample.upper)} mm的地区范围，累计窗 ${rainSample.windowStartUtc} — ${rainSample.timeUtc}；不是一个站点，不设虚假雨量位置。` : '东区雨量此刻缺少有效公报范围，未取中点或补零。');
  const cloud = exact(data.clouds?.frames, time);
  result.summary = summaries.join('；') + '。各项保留自己的记录时间。';
  result.phase = selections.get('wind')?.selection.sample && selections.get('seaLevel')?.selection.sample ? 'observed' : 'partial-observations';
  result.sourceTime = selections.get('seaLevel')?.selection.sample?.timeUtc ?? selections.get('wind')?.selection.sample?.timeUtc ?? null;
  result.metricsFocus = ['wind', 'seaLevel'];
  if (!cloud) result.notes.push('当前名义时刻云图缺档；地面观测仍独立保留，未拿另一时刻的云图替代。');
  result.pins = result.pins.filter(Boolean).slice(0, 3);
  return result;
}

function riverStory(data, snapshot, selectedTransect) {
  const result = {
    id: data.id + '-story', elapsedSeconds: snapshot.elapsedSeconds, pins: [], lines: [],
    metricsFocus: [selectedTransect], notes: [], phase: 'river-tracer',
  };
  const valid = snapshot.readings.filter(reading => Number.isFinite(reading.value));
  const highest = valid.reduce((best, reading) => !best || reading.value > best.value ? reading : best, null);
  const section = data.transects.find(item => item.id === highest?.transectId);
  const crossed = data.transects.filter(item => item.banks.some(bank => bank.bank === 'left' &&
    bank.sustainedSignal?.elapsedSeconds <= snapshot.elapsedSeconds));
  result.headline = snapshot.elapsedSeconds < 0 ? '释放前，先看各断面的背景浓度'
    : crossed.length ? `${crossed.at(-1).label}左岸已经测到持续抬升`
    : '染料投放后，等待下游记录持续抬升';
  result.summary = highest
    ? `${section.label}${highest.bank === 'left' ? '左岸' : '右岸'}此刻为 ${number(highest.value, 2)} ppb，为六个测点中当前有效读数最高。有效测点 ${valid.length}/6。`
    : '这一时刻没有有效浓度读数。';
  result.notes.push('持续抬升取连续三次达到 3 ppb 的第一笔记录。章节点用左岸作同口径比较，右岸实测值和各自峰值同步可查。');
  result.notes.push('到达时刻按本次试验的判定规则读取。其他河况或物质的输运时间需要对应的观测或模型。');
  result.notes.push('六个荧光计每 30 秒采样。柱高用同一平方根尺度放大低浓度差异，标注及曲线按原始 ppb 数值显示。');
  result.notes.push(`相对时间 ${formatRiverElapsed(snapshot.elapsedSeconds)}。原档本地钟 ${snapshot.localTime.replace('T',' ')}。`);
  return result;
}

function tideStory(data, snapshot) {
  const moon = snapshot.moon;
  const observed = snapshot.metrics.find(metric => metric.id === 'observed')?.sample;
  const predicted = snapshot.metrics.find(metric => metric.id === 'predicted')?.sample;
  const elevation = moon?.elevationDeg;
  const level = sample => Number.isFinite(sample?.value) ? sample.value.toFixed(3) + ' m' : '缺测';
  const sky = moon ? `方位 ${number(moon.azimuthDeg, 2)}°，高度 ${number(elevation, 2)}°` : '月球星历缺档';
  const {moonRiseBracket,moonSetBracket,moonMaxElevation,observedMax,predictedMax}=data.moments??{};
  const time=snapshot.timeUtc;
  let headline=!moon?'当前时刻没有月球星历':elevation<0?'月球在港口地平线下方':'月球在港口地平线上方';
  if(time===moonRiseBracket?.toUtc)headline='月球刚越过旧金山港的地平线';
  else if(time===moonMaxElevation?.timeUtc)headline='月球升到当天的最高采样位置';
  else if(time===moonSetBracket?.toUtc)headline='月球刚落到地平线下方';
  else if(time===observedMax?.timeUtc)headline='月落后，实测潮位达到当日最高采样';
  else if(time===predictedMax?.timeUtc)headline='调和预报先达到当天最高采样';
  return {
    id: data.id + '-story', timeUtc: time, pins: [], lines: [], metricsFocus: [], phase: 'harbor-tide',
    headline,
    summary: `${sky}。NOAA 实测 ${level(observed)}，调和预报 ${level(predicted)}。水位共用 MLLW 基准。`,
    notes: [
      'JPL Horizons 为验潮站位置计算视方位、视高度和受光比例，高度按无大气折射的几何地平线读取。',
      '港口是示意画面，水线的垂直变化已放大，只使用 NOAA 验潮站的实测值。实测和图表中的调和预报都以 MLLW 为基准，单位为米。',
      '越过地平线的章节点使用六分钟采样中越界后第一笔记录。当天的高低值取存档采样。',
    ],
  };
}

function batteryStory(data, snapshot) {
  const {elapsedSeconds, sample} = snapshot;
  const {firstUnderLoad, minVoltage, maxTemperature} = data.moments;
  const value = (field, digits, unit) => Number.isFinite(sample[field]) ? sample[field].toFixed(digits) + ' ' + unit : '缺测';
  let headline = '放电初段，输出电流接近零';
  if (elapsedSeconds === minVoltage) headline = '端电压达到本次采样最低值';
  else if (elapsedSeconds === maxTemperature) headline = '电流回近零，温度达到本次采样最高值';
  else if (elapsedSeconds > maxTemperature) headline = '电流回近零后，电压回升、温度回落';
  else if (elapsedSeconds >= firstUnderLoad) headline = '约 −2 A 放电阶段，电压下降、温度上升';
  return {
    id: data.id + '-story', elapsedSeconds, headline,
    summary: `同一笔实测 · 端电压 ${value('voltageV',3,'V')} · 输出电流 ${value('currentA',4,'A')} · 电池温度 ${value('temperatureC',2,'°C')}`,
    pins: [], lines: [], metricsFocus: [], phase: 'battery-discharge',
    notes: [
      '三项仪表和曲线使用 NASA 的端电压、电池输出电流和电池温度原始通道。电流方向保留原始符号。',
      '模型展示典型圆柱电芯的卷绕结构。温度是记录中的单点数值，剖面用于理解部件位置。',
      '这段记录展示一次放电的端电压、电流和温度。评估老化需比较多个循环的容量与测试条件。',
      '实验时钟为原档的经过时间，章节落在实际采样点。外部电流指示的亮度随实测电流幅值变化。',
    ],
  };
}

function dieselStory(data, {elapsedSeconds, sample}) {
  const highlights = {
    30: '扭矩下降前：转速仍在 3,200 rpm',
    38.5: '扭矩首笔为零，转速仍为 3,197 rpm',
    45.9: '这一分钟内的轨压通道最低值',
    85.6: '转速降到本次记录的最低值',
  };
  const headline = highlights[elapsedSeconds] ?? '同一台架、同一时刻：比较三个通道';
  return {
    id:data.id+'-story', elapsedSeconds, headline,
    summary:`转速 ${sample.rpm} rpm · 扭矩 ${sample.torqueNm} N·m · 原档轨压 ${sample.railPressureMpa.toFixed(2)} MPa`,
    pins:[], lines:[], metricsFocus:[], phase:'engine-bench',
    notes:[
      '实验经过时间由原档行号和 0.1 秒采样间隔得到；曲线游标与仪表共用同一条记录。',
      '转速和扭矩为台架实测。轨压取原档 RP 通道，单位按论文从 hPa 换算为 MPa，论文未说明 RP 是传感器读数还是设定值。',
      '曲轴和活塞按实测转速慢放，用通用曲柄连杆几何演示运动。画面中的轴角和活塞位置为示意。',
      '画面上方每条变化取两个标注时刻的原档采样。仪表和图表游标显示当前时刻的记录。',
    ],
  };
}

/** Pure, read-only story for an already committed observation clock.
 * Geographic lines are source-feature contours or connectors between actual JMA analyses.
 * Text lives in notes; pins never invent a location. narrationCue cannot override observations.
 */
export function observedStory({ route, data, snapshotTimeUtc, snapshot, stationId, features, previousTimeUtc, narrationCue } = {}) {
  const event = route?.startsWith('dynamic-') ? getDynamicEvent(route.slice(8)) : null;
  const kind = route === 'typhoon-real' ? 'mangkhut' : event?.kind;
  if (!kind || !data) throw new TypeError('需要受支持的真实观测路线和资料');
  if(kind==='wildfire'){
    const frame=snapshot?.frame;
    if(data.kind!==kind||snapshot?.eventId!==data.id||!frame||frame.timeUtc!==snapshotTimeUtc)throw new TypeError('山火边界与当前档案日期不一致');
    const previous=data.frames[data.frames.indexOf(frame)-1];
    const result=base(data,kind,frame.timeUtc);
    result.phase='mapped-perimeter';
    result.headline=previous?`${frame.archiveDate} · 沿金线看这一期边界`:'先在地形上辨认首期测绘边界';
    result.summary=previous
      ?`与 ${previous.archiveDate} 比较，本期多划入 ${number(frame.addedKm2,2)} km²，前期划入、本期未划入 ${number(frame.outsideKm2,2)} km²。`
      :`当前制图范围 ${number(frame.mappedKm2,2)} km²，作为这段回放的起点。`;
    result.notes=[`档案文件 ${frame.sourceFile}`,data.dateBasis,...data.limitations];
    result.metricsFocus=previous?['mappedKm2','addedKm2']:['mappedKm2'];
    return result;
  }
  if(kind==='river'){
    if(data.kind!=='river'||snapshot?.eventId!==data.id)throw new TypeError('河段观测与事件资料不一致');
    return riverStory(data,snapshot,stationId);
  }
  if(kind==='tide'){
    if(data.kind!=='tide'||snapshot?.eventId!==data.id)throw new TypeError('港口观测与事件资料不一致');
    return tideStory(data,snapshot);
  }
  if(kind==='engine'){
    if(data.kind!=='engine'||snapshot?.eventId!==data.id)throw new TypeError('台架观测与事件资料不一致');
    return dieselStory(data,snapshot);
  }
  if(kind==='battery'){
    if(data.kind!=='battery'||snapshot?.eventId!==data.id)throw new TypeError('电池观测与事件资料不一致');
    return batteryStory(data,snapshot);
  }
  const time = utcMillis(snapshotTimeUtc);
  if (time < utcMillis(data.startUtc) || time > utcMillis(data.endUtc)) throw new RangeError('共同时间超出这份观测资料');
  if (kind === 'mangkhut' ? data.eventId !== 'jma-1822' : data.kind !== kind) throw new TypeError('路线与事件资料不一致');
  const input = { data, snapshotTimeUtc, stationId, features, previousTimeUtc };
  const result = kind === 'quake' ? quakeStory(input, time) : kind === 'mangkhut' ? mangkhutStory(input, time) : cloudStory(kind, input, time);
  if (narrationCue?.stationId && narrationCue.stationId !== stationId) result.notes.push('提示以当前已选台站为准，讲解线索不会替换实测读数。');
  return result;
}
