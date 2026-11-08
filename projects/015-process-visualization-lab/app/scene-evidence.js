import { sampleClock, sampleValue, localClock } from './sync-observation-view.js';
import { formatRiverElapsed } from './river-evidence.js';

const teal = '#82e5dd', gold = '#ffd495';
const clock = value => value.slice(11, 16);
const number = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });
const axisNumber = new Intl.NumberFormat('zh-CN', { notation:'compact', maximumFractionDigits:1 });
const stationClock = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
const stamp = value => typeof value === 'number' ? value : Date.parse(value);
const exact = (samples, tick) => samples.find(sample => stamp(sample.timeUtc ?? sample.elapsedSeconds) === stamp(tick));
const valueText = (value, unit) => Number.isFinite(value) ? number.format(value) + ' ' + unit : '缺测';
const trace = (samples, color = teal, gap = Infinity) => ({ samples, color, gap });
const cloudMetrics = { storm: 'below235KAreaKm2', volcano: 'coldAreaKm2' };
export const cloudReference = {
  storm: '2022-09-05T03:00:00Z',
  volcano: '2022-01-15T04:20:00Z',
};
export const cloudReferenceColor = '#d2b5ff';

export function supportsSceneEvidence(context) {
  return context.route === 'typhoon-real' || ['storm','volcano','quake','river','wildfire'].includes(context.data?.kind);
}

export function sceneEvidence(context) {
  const { data, snapshot, timeUtc, elapsedSeconds, stationId, route, sync } = context;
  if (route === 'typhoon-real' && sync) {
    const wind = data.series.find(series => series.id === 'wind');
    const start = '2018-09-16T04:00:00Z', end = '2018-09-16T06:00:00Z';
    const readings = data.series.map(series => {
      const selection = sync.observations[series.id];
      const label = { wind:'机场风', rain:'东区雨', seaLevel:'鲗鱼涌水位' }[series.id];
      return [label, sampleValue(series, selection) + (selection.sample ? ' ' + series.unit : ''), sampleClock(series, selection)];
    });
    return {
      title:'云带经过香港时，地面怎样变化？', metric:'机场平均风 · km/h', tick:timeUtc,
      start:timeUtc < start || timeUtc > end ? data.startUtc : start,
      end:timeUtc < start || timeUtc > end ? data.endUtc : end,
      time:localClock(timeUtc) + ' 香港时间', format:localClock, traces:[trace(wind.samples, teal, wind.maxAgeMinutes * 60000)],
      dots:[sync.observations.wind.sample], readings,
      note:'以香港海岸和测站为参照。竖线是回放时刻，圆点落在风的实际采样时刻。',
    };
  }
  if (!snapshot) return null;
  if (data.kind === 'quake') {
    const station = data.stations.find(row => row.id === stationId) ?? data.stations[0];
    const before = station.samples.find(row => Number.isFinite(row.value) && row.timeUtc <= data.originUtc);
    const current = snapshot.stations.find(row => row.id === station.id)?.sample;
    const samples = station.samples.map(row => ({...row, value:Number.isFinite(row.value) ? Math.abs(row.value) : null}));
    const format = time => stationClock.format(stamp(time));
    return {
      title:'同一台站，震前与当前对照', metric:(station.stationCode ?? station.id) + ' · 绝对峰值 counts',
      time:format(timeUtc) + ' UTC+8', tick:timeUtc, start:data.startUtc, end:data.endUtc, format,
      traces:[trace(samples, teal, 1000 * (station.sampleIntervalSeconds ?? 1))],
      dots:current ? [{...current, value:Math.abs(current.value)}] : [], baseline:before ? Math.abs(before.value) : null,
      readings:[['震前 ' + (before ? format(before.timeUtc) : ''), valueText(before && Math.abs(before.value), 'counts')],
        ['当前 1 秒', valueText(current && Math.abs(current.value), 'counts')]],
      note:'每站用自己的刻度，金色虚线是本台站的震前记录。峰值时刻和地震波初到需要分别判断。',
    };
  }
  if (data.kind === 'river') {
    const section = data.transects.find(row => row.id === stationId) ?? data.transects[0];
    const end = Math.max(elapsedSeconds, 21600);
    const start = Math.min(elapsedSeconds, -600);
    return {
      title:'三道断面，哪一岸先测到？', metric:section.label + ' · 染料浓度 ppb',
      time:formatRiverElapsed(elapsedSeconds), tick:elapsedSeconds, start, end, format:formatRiverElapsed, sqrt:true, scale:250,
      traces:section.banks.map(bank => trace(bank.samples, bank.bank === 'left' ? teal : gold, data.cadenceSeconds)),
      dots:section.banks.map(bank => exact(bank.samples, elapsedSeconds)),
      baseline:data.signalRule.thresholdPpb,
      readings:section.banks.map(bank => [bank.bank === 'left' ? '左岸' : '右岸', valueText(snapshot.readings.find(row => row.id === bank.id)?.value, 'ppb')]),
      note:'虚线标 3 ppb。连续 3 笔达到阈值才记为持续信号。图表与浓度柱都用平方根刻度。',
    };
  }
  if (data.kind === 'wildfire') {
    const frame = snapshot.frame;
    const previous = data.frames.findLast(row => row.timeUtc < timeUtc);
    const mapped = data.series.find(row => row.id === 'mappedKm2');
    return {
      title:'沿前一期边界看新增范围', metric:'航空红外圈绘面积 · km²',
      time:frame.archiveDate, tick:timeUtc, start:data.startUtc, end:data.endUtc, format:date=>date.slice(5,10),
      traces:[trace(mapped.samples, teal, 86400000)], dots:[exact(mapped.samples, timeUtc)], baseline:previous?.mappedKm2,
      readings:[['本期范围', valueText(frame.mappedKm2, 'km²')], ['新增区', previous ? valueText(frame.addedKm2, 'km²') : '无前期对照']],
      note:previous ? '蓝线为 ' + previous.archiveDate.slice(5) + ' 档案边界。橙色为新划入区域。图表按档案日期。' : '金线圈出第一期范围。切换后续日期查看与前一期的边界差。',
    };
  }
  const metric = data.series.find(row => row.id === cloudMetrics[data.kind]);
  if (!metric) return null;
  const volcanic = data.kind === 'volcano';
  const scan = snapshot.frame;
  const reference = exact(metric.samples, cloudReference[data.kind]) ?? metric.samples[0];
  const current = scan && exact(metric.samples, scan.timeUtc);
  const format = time => clock(time);
  const wind = snapshot.metrics.find(row => row.id === 'windKt')?.sample;
  const delta = Number.isFinite(current?.value) && Number.isFinite(reference?.value)
    ? current.value - reference.value : null;
  const change = delta == null ? null : delta === 0
    ? (current.timeUtc === reference.timeUtc ? '当前就是参照帧' : '与参照帧面积相同')
    : '较参照帧' + (delta > 0 ? '增加 ' : '减少 ') + valueText(Math.abs(delta), metric.unit);
  const readings = [['参照 ' + format(reference.timeUtc), valueText(reference.value, metric.unit)],
    ['当前 ' + format(timeUtc), valueText(current?.value, metric.unit)]];
  if (wind) readings.push(['JMA ' + format(wind.timeUtc), valueText(wind.value, 'kt'), '官方中心分析']);
  return {
    title:volcanic ? '同一火山周围，低温区怎样展开？' : '沿同一段海岸看云带移动',
    metric:volcanic ? '火山周围 300 km · <220 K 面积' : '固定窗口 · ≤235 K 面积',
    time:format(timeUtc) + ' UTC', tick:timeUtc, start:data.startUtc, end:data.endUtc, format,
    change, reference, scanWindow:scan?.scanStartUtc && scan?.scanEndUtc
      ? scan.scanStartUtc.slice(11,19) + '–' + scan.scanEndUtc.slice(11,19) + ' UTC' : null,
    traces:[trace(metric.samples, teal, 1000 * (volcanic ? data.cadenceSeconds : Math.max(...data.frameIntervalRangeSeconds)))],
    missing:(data.missingTimesUtc ?? data.missingOriginalScans?.map(row => row.timeUtc) ?? []).map(stamp),
    dots:[current], baseline:reference.value, baselineColor:cloudReferenceColor, readings,
    note:(context.referenceShown ? '画面紫色虚线为参照帧轮廓。' : '') +
      (volcanic ? '面积按同一 300 km 圆统计，低温区可同时包含喷发云和气象云。'
        : '白线为海岸。低温区面积反映窗口内云区变化，台风强度另看 JMA 分析。'),
  };
}

const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const chartBox = { left:33, right:298, top:7, bottom:58 };

function drawChart(plan) {
  const { left, right, top, bottom } = chartBox;
  const start = stamp(plan.start), end = stamp(plan.end);
  const timeOf = sample => stamp(sample.timeUtc ?? sample.elapsedSeconds);
  const inside = time => time >= start && time <= end;
  const traces = plan.traces.map(series => ({...series, samples:series.samples.filter(sample => inside(timeOf(sample)))}));
  const values = traces.flatMap(series => series.samples.map(sample => sample.value)).filter(Number.isFinite);
  const high = plan.scale ?? Math.max(1, ...values, plan.baseline ?? 0);
  const x = time => left + (right - left) * (time - start) / (end - start);
  const y = value => bottom - (bottom - top) * (plan.sqrt ? Math.sqrt(Math.max(0, Math.min(1, value / high))) : value / high);
  const paths = traces.map(series => {
    let prior = -Infinity;
    const path = series.samples.map(sample => {
      if (!Number.isFinite(sample.value)) { prior = -Infinity; return ''; }
      const time = timeOf(sample);
      const uninterrupted = Number.isFinite(prior) && time - prior <= series.gap &&
        !plan.missing?.some(missing => missing > prior && missing < time);
      const command = uninterrupted ? 'L' : 'M';
      prior = time;
      return command + x(time).toFixed(1) + ' ' + y(sample.value).toFixed(1);
    }).join(' ');
    const markers = series.samples.length <= 50 ? series.samples.filter(sample => Number.isFinite(sample.value))
      .map(sample => '<circle cx="' + x(timeOf(sample)) + '" cy="' + y(sample.value) + '" r="1.5" fill="' + series.color + '"/>').join('') : '';
    return '<path d="' + path + '" fill="none" stroke="' + series.color + '" stroke-width="1.4"/>' + markers;
  }).join('');
  const dots = plan.dots.flatMap((sample, index) => sample && inside(timeOf(sample)) && Number.isFinite(sample.value)
    ? ['<circle cx="' + x(timeOf(sample)) + '" cy="' + y(sample.value) + '" r="3.4" fill="' + traces[index].color + '" stroke="#eef5fc"/>'] : []).join('');
  const cursor = x(stamp(plan.tick));
  const baseline = Number.isFinite(plan.baseline) ? '<path d="M'+left+' '+y(plan.baseline)+'H'+right+'" stroke="'+(plan.baselineColor ?? '#e8b875')+'" stroke-dasharray="4 3"/>' : '';
  const reference = plan.reference;
  const dot = plan.dots[0];
  const hasReference = reference && inside(timeOf(reference)) && Number.isFinite(reference.value);
  const referenceDot = hasReference ? '<circle cx="'+x(timeOf(reference))+'" cy="'+y(reference.value)+'" r="3.5" fill="#0e2032" stroke="'+plan.baselineColor+'" stroke-width="1.5"/>' : '';
  const difference = hasReference && dot && inside(timeOf(dot)) && Number.isFinite(dot.value) && reference.value !== dot.value
    ? '<path d="M'+cursor+' '+y(reference.value)+'V'+y(dot.value)+'" stroke="'+plan.baselineColor+'" stroke-width="2"/>'
    : '';
  return '<svg viewBox="0 0 306 73" role="img" aria-label="' + escape(plan.metric + ' · ' + plan.time) + '">' +
    '<path d="M'+left+' '+top+'V'+bottom+'H'+right+' M'+left+' '+top+'H'+right+'" stroke="#385365" fill="none"/>' +
    '<text x="29" y="12" text-anchor="end">' + escape(axisNumber.format(high)) + '</text><text x="29" y="'+bottom+'" text-anchor="end">0</text>' +
    baseline + paths + '<path d="M'+cursor+' '+top+'V'+bottom+'" stroke="#dbe8fa" stroke-dasharray="2 3"/>' + difference + referenceDot + dots +
    '<text x="'+left+'" y="70">' + escape(plan.format(plan.start)) + '</text><text x="'+right+'" y="70" text-anchor="end">' +
    escape(plan.format(plan.end)) + '</text></svg>';
}

export function createSceneEvidence(host, keyframes) {
  const panel = document.createElement('section');
  panel.className = 'scene-evidence';
  panel.setAttribute('aria-label', '画面同刻证据');
  panel.hidden = true;
  const readout = document.createElement('div');
  readout.className = 'scene-evidence-content';
  const note = document.createElement('p');
  note.className = 'scene-evidence-note';
  const home = document.createComment('shared observation keyframes');
  keyframes.before(home);
  panel.append(readout, note);
  host.append(panel);
  new ResizeObserver(entries => {
    const height = entries[0].target.offsetHeight;
    if (height) host.style.setProperty('--scene-evidence-height', height + 'px');
  }).observe(panel);
  return {
    show(plan) {
      if (!plan) return;
      if (keyframes.parentElement !== panel) note.before(keyframes);
      panel.hidden = false;
      panel.dataset.state = 'ready';
      panel.dataset.observedTime = plan.tick;
      readout.innerHTML = '<header><strong>'+escape(plan.title)+'</strong><span>'+escape(plan.time)+'</span></header>'+
        '<div class="scene-evidence-metric">'+escape(plan.metric)+'</div>'+drawChart(plan)+
        '<dl>'+plan.readings.map(([label, value, detail]) => '<div><dt>'+escape(label)+'</dt><dd>'+escape(value)+
          (detail ? '<small>'+escape(detail)+'</small>' : '')+'</dd></div>').join('')+'</dl>'+
        (plan.change ? '<p class="scene-evidence-change">'+escape(plan.change)+'</p>' : '')+
        (plan.scanWindow ? '<div class="scene-evidence-scan">实际扫描 '+escape(plan.scanWindow)+'</div>' : '');
      note.textContent = plan.note;
    },
    pending(message) {
      if (panel.hidden) return;
      delete panel.dataset.observedTime;
      if (panel.dataset.state === message) return;
      panel.dataset.state = message;
      readout.innerHTML = '<p role="status">'+escape(message)+'</p>';
      note.textContent = '';
    },
    hide() {
      if (keyframes.parentElement === panel) home.after(keyframes);
      panel.hidden = true;
      delete panel.dataset.observedTime;
    },
  };
}

