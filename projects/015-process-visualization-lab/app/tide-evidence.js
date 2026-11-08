import {formatPortClock, formatTideUtc} from './tide-observations.js';
import {tideSceneFocus} from './tide-narration.js';

const CHANNELS = [
  { id: 'observed', title: '验潮站实测', role: '画面水线', className: 'tide-observed' },
  { id: 'predicted', title: '调和预报', role: '仅作图表对照', className: 'tide-predicted' },
];
const ELEVATION = { id: 'elevation', className: 'tide-elevation' };
const angleFormat = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nearHorizonFormat = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const metreFormat = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const axisFormat = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

const tideValue = value => Number.isFinite(value) ? metreFormat.format(value) + ' m' : '缺测';
const angleValue = value => Number.isFinite(value) ? (Math.abs(value) < 1 ? nearHorizonFormat : angleFormat).format(value) + '°' : '缺测';
const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];

function exactRow(sample, milliseconds) {
  return sample && Date.parse(sample.timeUtc) === milliseconds ? sample : null;
}

export function tideStepChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  return current - previous;
}

function compareTides(observed, predicted) {
  const delta = tideStepChange(observed, predicted);
  if (!Number.isFinite(delta)) return {state: 'missing', value: '缺测', relation: '同刻资料不足'};
  if (delta === 0) return {state: 'equal', value: '0.000 m', relation: '实测与预报相同'};
  const above = delta > 0, magnitude = Math.abs(delta);
  return {
    state: above ? 'above' : 'below',
    value: magnitude < 0.0005 ? '< 0.001 m' : (above ? '+' : '−') + tideValue(magnitude),
    relation: above ? '实测高于预报' : '实测低于预报',
  };
}

function motion(change, rising, falling) {
  if (change === null) return '暂无前一刻对照';
  return change > 0 ? '↗ ' + rising : change < 0 ? '↘ ' + falling : '→ 持平';
}

/** A path moves across an absent or invalid sample. It never bridges a missing tick. */
export function tideTrace(samples, { cadenceMs, x, y, value = row => row.value }) {
  const commands = [];
  let previous = null;
  for (const row of samples) {
    const milliseconds = Date.parse(row.timeUtc), reading = value(row);
    if (!Number.isFinite(milliseconds) || !Number.isFinite(reading)) {
      previous = null;
      continue;
    }
    const point = x(milliseconds).toFixed(2) + ' ' + y(reading).toFixed(2);
    if (previous !== null && milliseconds - previous === cadenceMs) commands.push('L' + point);
    else commands.push('M' + point + 'h.01');
    previous = milliseconds;
  }
  return commands.join(' ');
}

function heightTicks(series, includeZero = true) {
  let min = includeZero ? 0 : Infinity, max = includeZero ? 0 : -Infinity;
  for (const { samples } of series) {
    for (const { value } of samples) {
      if (!Number.isFinite(value)) continue;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  if (!Number.isFinite(min)) return [0, 1];
  const span = max - min || 1;
  const order = 10 ** Math.floor(Math.log10(span / 3));
  const step = ([1, 2, 2.5, 5, 10].find(scale => scale * order >= span / 3) ?? 10) * order;
  const first = Math.floor(min / step), last = Math.max(Math.ceil(max / step), first + 1);
  return Array.from({ length: last - first + 1 }, (_, index) => Number(((first + index) * step).toPrecision(8)));
}

function chartTimeTicks(start, end) {
  const sixHours = 6 * 60 * 60 * 1000;
  const ticks = [start];
  for (let tick = Math.ceil(start / sixHours) * sixHours; tick < end; tick += sixHours) {
    if (tick - start >= 0.12 * (end - start) && end - tick >= 0.12 * (end - start)) ticks.push(tick);
  }
  return ticks.concat(end);
}

function makeChart(channels, { start, end, cadenceMs, ticks, elevation = false, peaks = [], moonSet = null }) {
  const zoom = peaks.length > 0;
  const width = moonSet ? 340 : 240, left = elevation ? 35 : zoom ? 34 : 28, right = width - 11;
  const top = 12, bottom = elevation ? 72 : zoom ? 82 : 126;
  const height = bottom + 25, low = ticks[0], high = ticks.at(-1);
  const x = milliseconds => left + (milliseconds - start) * (right - left) / (end - start);
  const y = value => bottom - (value - low) * (bottom - top) / (high - low);
  const clipId = moonSet ? 'tide-played-moon-set' : elevation ? 'tide-played-moon' : zoom ? 'tide-played-peak' : 'tide-played-water';
  // The wider dashed prediction stays visible underneath the measured trace,
  // even when both values occupy nearly the same pixels on the shared scale.
  const paths = [...channels].reverse().map(channel => {
    const path = tideTrace(channel.samples, { cadenceMs, x, y, value: channel.value });
    return `<path class="tide-trace ${channel.className}" d="${path}" />`;
  }).join('');
  const firstPeaks = peaks.filter((peak, index) => peaks.findIndex(item => item.id === peak.id) === index);
  const midpoint = start + Math.round((end - start) / cadenceMs / 2) * cadenceMs;
  const timeLabels = moonSet ? [start, midpoint, end] : zoom ? [...new Set([start, ...firstPeaks.map(peak => peak.time), end])].sort((a, b) => a - b) : chartTimeTicks(start, end);
  const label = elevation ? '港口所见月球高度' : 'NOAA 实测与调和预报潮位';
  const html = `<svg class="tide-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
    <defs><clipPath id="${clipId}"><rect x="${left - 2}" y="${top - 4}" width="0" height="${bottom - top + 8}" data-tide-reveal /></clipPath></defs>
    ${elevation ? `<rect class="tide-below-area" x="${left}" y="${y(0)}" width="${right - left}" height="${bottom - y(0)}" />` : ''}
    ${ticks.map(value => `<path class="${value === 0 ? 'tide-horizon' : 'tide-grid'}" d="M${left} ${y(value)}H${right}" /><text x="${left - 5}" y="${y(value) + 3}" text-anchor="end">${axisFormat.format(value)}${elevation ? '°' : ''}</text>`).join('')}
    ${timeLabels.map((milliseconds, index) => `<text x="${x(milliseconds)}" y="${bottom + 16}" text-anchor="${index === 0 ? 'start' : index === timeLabels.length - 1 ? 'end' : 'middle'}">${formatTideUtc(milliseconds)}</text>`).join('')}
    ${moonSet ? `<rect class="tide-set-band" x="${x(moonSet.from)}" y="${top}" width="${x(moonSet.to) - x(moonSet.from)}" height="${bottom - top}"><title>月落时窗</title></rect>` : ''}
    <g class="tide-chart-history">${paths}</g>
    <g clip-path="url(#${clipId})">${paths}</g>
    ${peaks.map(peak => `<circle class="tide-peak-mark ${peak.className}" cx="${x(peak.time)}" cy="${y(peak.value)}" r="4" data-tide-peak-mark="${peak.id}"><title>${peak.title} ${formatTideUtc(peak.time)} UTC，${tideValue(peak.value)}</title></circle>`).join('')}
    <line class="tide-now-line" x1="${left}" x2="${left}" y1="${top - 3}" y2="${bottom + 2}" data-tide-cursor />
    ${channels.map(channel => channel.id === 'predicted'
      ? '<path class="tide-now-dot tide-predicted" d="M0 -5.4 5.4 0 0 5.4 -5.4 0Z" data-tide-dot="predicted" visibility="hidden" />'
      : `<circle class="tide-now-dot ${channel.className}" r="3.1" data-tide-dot="${channel.id}" visibility="hidden" />`).join('')}
  </svg>`;
  return { html, x, y, left, start, end };
}

function cacheChart(root, chart) {
  const svg = root.querySelector('.tide-chart');
  return {
    ...chart, svg, cursor: svg.querySelector('[data-tide-cursor]'), reveal: svg.querySelector('[data-tide-reveal]'),
    dots: [...svg.querySelectorAll('[data-tide-dot]')],
  };
}

function updateChart(chart, milliseconds, readings, label) {
  const inside = milliseconds >= chart.start && milliseconds <= chart.end;
  const x = chart.x(inside ? milliseconds : chart.start).toFixed(2);
  chart.cursor.setAttribute('visibility', inside ? 'visible' : 'hidden');
  chart.cursor.setAttribute('x1', x);
  chart.cursor.setAttribute('x2', x);
  chart.reveal.setAttribute('width', inside ? String(Math.max(0, Number(x) - chart.left + 2)) : '0');
  for (const dot of chart.dots) {
    const value = readings[dot.dataset.tideDot];
    const present = inside && Number.isFinite(value);
    dot.setAttribute('visibility', present ? 'visible' : 'hidden');
    if (!present) continue;
    dot.setAttribute('transform', `translate(${x} ${chart.y(value).toFixed(2)})`);
  }
  chart.svg.setAttribute('aria-label', label);
}

function compassMarkup() {
  return `<svg class="tide-compass" viewBox="0 0 154 124" role="img" aria-label="月球方位">
    <circle class="tide-compass-ring" cx="77" cy="62" r="46" />
    <circle class="tide-compass-grid" cx="77" cy="62" r="30" fill="none" stroke-dasharray="1 2" />
    <path class="tide-compass-grid" d="M31 62H123 M77 16V108 M44.5 29.5L109.5 94.5 M44.5 94.5L109.5 29.5" />
    <text x="77" y="11" text-anchor="middle">北 N</text><text x="77" y="119" text-anchor="middle">南 S</text>
    <text x="25" y="65" text-anchor="end">西 W</text><text x="129" y="65">东 E</text>
    <circle cx="77" cy="62" r="1.65" fill="#d6c5ff" />
    <g data-tide-compass-needle visibility="hidden">
      <line class="tide-compass-bearing" x1="77" x2="77" y1="62" y2="16" />
      <circle class="tide-compass-dot" cx="77" cy="16" r="4" />
    </g>
  </svg>`;
}

function moonPanel(chart, moments, observedSamples) {
  const waterByTime = new Map(observedSamples.map(sample => [sample.timeUtc, sample.value]));
  const crossings = [['rise', '月升', moments?.moonRiseBracket], ['set', '月落', moments?.moonSetBracket]]
    .filter(([, , bracket]) => bracket?.fromUtc && bracket?.toUtc);
  return `<section class="tide-panel tide-moon-panel" data-story-target="moon">
    <div class="tide-kicker"><span>JPL 星历计算</span><time data-tide-moon-utc></time></div>
    <div class="tide-heading"><strong>从港口看月球</strong></div>
    <span class="tide-status" data-tide-moon-state></span>
    ${compassMarkup()}
    <div class="tide-measures">
      <div class="tide-measure"><span>朝向</span><strong data-tide-direction></strong><small data-tide-bearing></small></div>
      <div class="tide-measure"><span>相对地平线</span><strong data-tide-altitude></strong><small data-tide-moon-motion></small></div>
    </div>
    <div class="tide-elevation-evidence">
      <div class="tide-heading tide-chart-heading"><strong>月球升落</strong><span>高度角 · UTC</span></div>
      ${chart.html}
      ${crossings.length ? `<div class="tide-crossings" aria-label="月球跨越几何地平线的 UTC 区间">${crossings.map(([id, label, bracket]) =>
        `<div data-tide-crossing="${id}"><span>${label}</span><strong>${formatTideUtc(bracket.fromUtc)}–${formatTideUtc(bracket.toUtc)}</strong><small>实测潮位 ${tideValue(waterByTime.get(bracket.fromUtc))} → ${tideValue(waterByTime.get(bracket.toUtc))}</small></div>`).join('')}</div>
        <p class="tide-footnote">区间夹住月球跨过 0° 的时刻。水位来自区间两端的验潮采样。当地涨落请读潮位曲线。</p>` : '<p class="tide-footnote">0° 为几何地平线。</p>'}
    </div>
    <p class="tide-footnote" data-observation-secondary>星历采用验潮站坐标，按海平面与无大气折射条件计算。<span data-tide-illumination></span></p>
  </section>`;
}

function readoutPanel(data) {
  return `<section class="tide-panel tide-now-panel" data-observation-primary data-story-target="tide">
    <div class="tide-kicker"><span>NOAA ${esc(data.station.id)}</span><time data-tide-utc></time></div>
    <div class="tide-heading"><strong>此刻港口潮位</strong><span>${esc(data.datum)} 基准</span></div>
    <div class="tide-measures tide-water-measures">${CHANNELS.map(channel => `
      <div class="tide-measure ${channel.className}">
        <span>${channel.title}</span><small class="tide-measure-role">${channel.role}</small>
        <strong data-tide-value="${channel.id}"></strong>
        <small data-tide-trend="${channel.id}"></small>
        <small data-observation-secondary data-tide-source="${channel.id}"></small>
      </div>`).join('')}
    </div>
    <div class="tide-delta" data-tide-comparison="missing">
      <span class="tide-delta-label">同刻差值 · 实测减预报</span>
      <strong data-tide-difference></strong>
      <span data-tide-difference-relation></span>
    </div>
    <p class="tide-footnote" data-tide-local></p>
    <p class="tide-footnote" data-observation-secondary>箭头比较前一条 6 分钟记录。</p>
  </section>`;
}

function waterPanel(chart, channels, moments, zoom) {
  const peaks = channels.map(channel => {
    const value = (channel.id === 'observed' ? moments?.observedMax : moments?.predictedMax)?.valueM;
    const times = Number.isFinite(value)
      ? channel.samples.filter(sample => sample.value === value).map(sample => sample.timeUtc)
      : [];
    return { ...channel, times, value };
  }).filter(peak => peak.times.length > 0);
  return `<section class="tide-panel tide-water-panel" data-observation-primary data-series="tide">
    <div class="tide-heading"><strong>实测与预报潮位</strong><span>m · UTC</span></div>
    <div class="tide-legend">${CHANNELS.map(channel => `<span class="${channel.className}"><i></i>${channel.title}</span>`).join('')}</div>
    ${chart.html}
    ${zoom ? `<section class="tide-peak-zoom" aria-label="潮峰近看">
      <div class="tide-heading"><strong>潮峰近看</strong><span>局部纵轴 · m · UTC</span></div>
      ${zoom.chart.html}
      ${zoom.forecastPeaks.length > 1 ? `<p class="tide-footnote">预报 ${zoom.forecastPeaks.map(peak => formatTideUtc(peak.time)).join('、')} 并列最高。</p>` : ''}
    </section>` : ''}
    ${peaks.length ? `<div class="tide-peaks">
      <div class="tide-heading"><strong>各自最高采样点</strong><span>UTC</span></div>
      <div class="tide-peak-times">${peaks.map(peak =>
        `<div class="${peak.className}"><span>${peak.title}</span>
          <span class="tide-peak-clocks">${peak.times.map(time => `<time datetime="${esc(time)}">${formatTideUtc(time)}</time>`).join(' ')}</span>
          <strong>${tideValue(peak.value)}</strong>
        </div>`).join('')}</div>
    </div>` : ''}
    <p class="tide-footnote" data-observation-secondary>预报由潮汐分量计算，曲线空白处表示缺测。两条曲线各自使用同刻原值。</p>
  </section>`;
}

function makePeakZoom(data, channels, cadenceMs) {
  const window = data.clock.filter(({timeUtc}) => tideSceneFocus(data.moments, timeUtc) === 'peak');
  if (window.length < 2) return null;
  const start = Date.parse(window[0].timeUtc), end = Date.parse(window.at(-1).timeUtc);
  const local = channels.map(channel => ({
    ...channel, samples: channel.samples.filter(sample => {
      const time = Date.parse(sample.timeUtc);
      return time >= start && time <= end;
    }),
  }));
  const peaks = local.flatMap(({samples, ...channel}) => {
    const highest = channel.id === 'observed' ? data.moments.observedMax : data.moments.predictedMax;
    return samples.filter(sample => Number.isFinite(sample.value) && sample.value === highest?.valueM)
      .map(sample => ({...channel, time: Date.parse(sample.timeUtc), value: sample.value}));
  });
  if (!peaks.length) return null;
  return {
    chart: makeChart(local, {start, end, cadenceMs, ticks: heightTicks(local, false), peaks}),
    forecastPeaks: peaks.filter(peak => peak.id === 'predicted'),
  };
}

function mountMoonSetEvidence(panel, data, channels, cadenceMs) {
  const bracket = data.moments?.moonSetBracket;
  const observedPeak = data.moments?.observedMax;
  const predictedPeak = data.moments?.predictedMax;
  if (!panel || !bracket || !observedPeak || !predictedPeak) return null;
  const from = Date.parse(bracket.fromUtc), to = Date.parse(bracket.toUtc);
  const start = Math.max(Date.parse(data.startUtc), from - 4 * cadenceMs);
  const end = Math.min(Date.parse(data.endUtc), Math.max(Date.parse(observedPeak.timeUtc), Date.parse(predictedPeak.timeUtc)) + 3 * cadenceMs);
  if (!(start < from && from < to && to < end)) return null;

  const local = channels.map(channel => ({
    ...channel,
    samples: channel.samples.filter(sample => {
      const time = Date.parse(sample.timeUtc);
      return time >= start && time <= end;
    }),
  }));
  const peaks = local.flatMap(({samples, ...channel}) => {
    const peak = channel.id === 'observed' ? observedPeak : predictedPeak;
    return samples.filter(sample => Number.isFinite(sample.value) && sample.value === peak.valueM)
      .map(sample => ({...channel, time: Date.parse(sample.timeUtc), value: sample.value}));
  });
  const chart = makeChart(local, {start, end, cadenceMs, ticks: heightTicks(local, false), peaks, moonSet: {from, to}});
  panel.dataset.windowStart = new Date(start).toISOString();
  panel.dataset.windowEnd = new Date(end).toISOString();
  const frames = [
    ['月落前', bracket.fromUtc],
    ['月落后', bracket.toUtc],
    ['实测潮峰', observedPeak.timeUtc],
  ];
  panel.innerHTML = `
    <div class="tide-focus-heading"><strong>潮位证据</strong><span>m · MLLW / <time data-tide-focus-clock></time></span></div>
    <div class="tide-legend tide-focus-legend">
      <span class="tide-observed"><i></i>验潮站实测</span>
      <span class="tide-predicted"><i></i>调和预报</span>
      <span><i class="tide-set-key"></i>月落区间</span>
    </div>
    ${chart.html}
    <div class="tide-focus-frames" role="group" aria-label="定格关键时刻">
      ${frames.map(([label, time]) => `<button type="button" data-tide-focus-frame="${esc(time)}" aria-pressed="false">
        <time datetime="${esc(time)}">${formatTideUtc(time)}</time><span>${label}</span>
      </button>`).join('')}
    </div>
    <p>月球降到地平线下，日月仍在引潮。港口涨落还受海盆和岸线影响。</p>`;
  return {
    clock: panel.querySelector('[data-tide-focus-clock]'),
    frames: [...panel.querySelectorAll('[data-tide-focus-frame]')],
    chart: cacheChart(panel, chart),
  };
}

export function createTideEvidence({ insight, readouts, charts, focus }) {
  let activeData = null;
  let nodes = null;

  function reset() {
    activeData = null;
    nodes = null;
    if (focus) delete focus.dataset.observedTime;
  }

  function mount(data) {
    const start = Date.parse(data.startUtc), end = Date.parse(data.endUtc);
    const cadenceMs = (data.cadenceSeconds ?? 360) * 1000;
    const moonChart = makeChart([{ ...ELEVATION, samples: data.moon, value: row => row.elevationDeg }], {
      start, end, cadenceMs, ticks: [-90, 0, 90], elevation: true,
    });
    const channels = CHANNELS.map(channel => ({
      ...channel, samples: data.series.find(series => series.id === channel.id)?.samples ?? [],
    }));
    const waterChart = makeChart(channels, { start, end, cadenceMs, ticks: heightTicks(channels) });
    const peakZoom = makePeakZoom(data, channels, cadenceMs);
    insight.innerHTML = moonPanel(moonChart, data.moments, channels.find(channel => channel.id === 'observed').samples);
    readouts.innerHTML = readoutPanel(data);
    charts.innerHTML = waterPanel(waterChart, channels, data.moments, peakZoom);
    nodes = {
      cadenceMs,
      focus: mountMoonSetEvidence(focus, data, channels, cadenceMs),
      previousElevation: new Map(data.moon.map(row => [Date.parse(row.timeUtc), row.elevationDeg])),
      previousWater: Object.fromEntries(channels.map(channel => [channel.id, new Map(channel.samples.map(row => [Date.parse(row.timeUtc), row.value]))])),
      state: insight.querySelector('[data-tide-moon-state]'),
      moonUtc: insight.querySelector('[data-tide-moon-utc]'),
      compass: insight.querySelector('.tide-compass'),
      needle: insight.querySelector('[data-tide-compass-needle]'),
      direction: insight.querySelector('[data-tide-direction]'),
      bearing: insight.querySelector('[data-tide-bearing]'),
      altitude: insight.querySelector('[data-tide-altitude]'),
      moonMotion: insight.querySelector('[data-tide-moon-motion]'),
      illumination: insight.querySelector('[data-tide-illumination]'),
      utc: readouts.querySelector('[data-tide-utc]'),
      local: readouts.querySelector('[data-tide-local]'),
      comparison: readouts.querySelector('[data-tide-comparison]'),
      difference: readouts.querySelector('[data-tide-difference]'),
      relation: readouts.querySelector('[data-tide-difference-relation]'),
      water: CHANNELS.map(channel => ({
        id: channel.id,
        value: readouts.querySelector(`[data-tide-value="${channel.id}"]`),
        trend: readouts.querySelector(`[data-tide-trend="${channel.id}"]`),
        source: readouts.querySelector(`[data-tide-source="${channel.id}"]`),
      })),
      moonChart: cacheChart(insight, moonChart),
      waterChart: cacheChart(charts, waterChart),
      peakChart: peakZoom ? cacheChart(charts.querySelector('.tide-peak-zoom'), peakZoom.chart) : null,
    };
  }

  function render(data, snapshot) {
    if (activeData !== data) {
      mount(data);
      activeData = data;
    }
    const milliseconds = Date.parse(snapshot.timeUtc);
    const moon = exactRow(snapshot.moon, milliseconds);
    const bearing = moon?.azimuthDeg, elevation = moon?.elevationDeg, illumination = moon?.illuminationPct;
    const above = Number.isFinite(elevation) && elevation >= 0;
    const state = above ? 'above' : Number.isFinite(elevation) ? 'below' : 'missing';
    const stateText = elevation === 0 ? '位于几何地平线' : above ? '位于地平线上方' : state === 'below' ? '位于地平线下方' : '此刻缺少星历';
    const clock = formatTideUtc(milliseconds) + ' UTC', previous = milliseconds - nodes.cadenceMs;
    const direction = Number.isFinite(bearing) ? directions[Math.round(bearing / 45) % directions.length] : '缺测';
    nodes.moonUtc.textContent = clock;
    nodes.moonUtc.setAttribute('datetime', snapshot.timeUtc);
    nodes.state.dataset.state = state;
    nodes.state.textContent = stateText;
    nodes.compass.dataset.state = state;
    nodes.compass.setAttribute('aria-label', `${clock} 月球方位 ${angleValue(bearing)}，${stateText}`);
    nodes.needle.setAttribute('visibility', Number.isFinite(bearing) ? 'visible' : 'hidden');
    if (Number.isFinite(bearing)) nodes.needle.setAttribute('transform', `rotate(${bearing} 77 62)`);
    nodes.direction.textContent = direction;
    nodes.bearing.textContent = Number.isFinite(bearing) ? angleValue(bearing) + ' 方位角' : '';
    nodes.altitude.textContent = (elevation > 0 ? '+' : '') + angleValue(elevation);
    nodes.moonMotion.textContent = Number.isFinite(elevation) ? motion(tideStepChange(elevation, nodes.previousElevation.get(previous)), '升高', '降低') : '当前缺少高度角';
    nodes.illumination.textContent = Number.isFinite(illumination) ? ` 此刻所见月面受光 ${angleFormat.format(illumination)}%。` : '';
    updateChart(nodes.moonChart, milliseconds, { elevation }, `${clock} 月球高度 ${angleValue(elevation)}，${stateText}`);

    const samples = Object.fromEntries(snapshot.metrics.map(metric => [metric.id, exactRow(metric.sample, milliseconds)]));
    const observed = samples.observed?.value, predicted = samples.predicted?.value;
    for (const channel of nodes.water) {
      const sample = samples[channel.id];
      channel.value.textContent = tideValue(sample?.value);
      channel.trend.textContent = Number.isFinite(sample?.value)
        ? motion(tideStepChange(sample.value, nodes.previousWater[channel.id].get(previous)), '上涨', '回落')
        : '此刻缺测';
      channel.source.textContent = !Number.isFinite(sample?.value) ? '此刻缺测' :
        channel.id === 'observed' ? (sample.quality === 'v' ? 'NOAA 已核验' : '站点记录') : 'NOAA 计算值';
    }
    nodes.utc.textContent = clock;
    nodes.utc.setAttribute('datetime', snapshot.timeUtc);
    nodes.local.textContent = '港口当地 ' + formatPortClock(milliseconds);
    const comparison = compareTides(observed, predicted);
    nodes.comparison.dataset.tideComparison = comparison.state;
    nodes.difference.textContent = comparison.value;
    nodes.relation.textContent = comparison.relation;
    const waterLabel = `${clock}，NOAA 实测 ${tideValue(observed)}，调和预报 ${tideValue(predicted)}，基准 ${data.datum}`;
    updateChart(nodes.waterChart, milliseconds, { observed, predicted }, waterLabel);
    if (nodes.peakChart) updateChart(nodes.peakChart, milliseconds, { observed, predicted }, '潮峰近看，' + waterLabel);
    if (nodes.focus) {
      focus.dataset.observedTime = snapshot.timeUtc;
      nodes.focus.clock.textContent = clock;
      nodes.focus.clock.dateTime = snapshot.timeUtc;
      for (const button of nodes.focus.frames) {
        button.setAttribute('aria-pressed', String(button.dataset.tideFocusFrame === snapshot.timeUtc));
      }
      updateChart(nodes.focus.chart, milliseconds, { observed, predicted }, '月落至潮峰，' + waterLabel);
    }
  }
  return { render, reset };
}
