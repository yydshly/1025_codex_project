import {formatBatteryElapsed} from './battery-observations.js';

const channels = [
  { id: 'voltage', field: 'voltageV', label: '端电压', unit: 'V', digits: 3 },
  { id: 'current', field: 'currentA', label: '电池输出电流', unit: 'A', digits: 4 },
  { id: 'temperature', field: 'temperatureC', label: '电池温度', unit: '°C', digits: 2 },
];
const number = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });
const escaped = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const chartBox = { left: 31, right: 227, top: 10, bottom: 61 };
const clipHeight = chartBox.bottom - chartBox.top + 8;

function valueText(channel, value) {
  return Number.isFinite(value) ? value.toFixed(channel.digits) + ' ' + channel.unit : '缺测';
}

function axisValues(samples, channel) {
  const values = samples.map(sample => sample[channel.field]).filter(Number.isFinite);
  if (!values.length) return [0, 1];
  const low = Math.min(...values, ...(channel.id === 'current' ? [0] : []));
  const high = Math.max(...values, ...(channel.id === 'current' ? [0] : []));
  if (low === high) return [low - 0.5, low, low + 0.5];
  const idealStep = (high - low) / 3;
  const order = 10 ** Math.floor(Math.log10(idealStep));
  const step = ([1, 2, 2.5, 5, 10].find(value => value * order >= idealStep) ?? 10) * order;
  const first = Math.floor(low / step), last = Math.ceil(high / step);
  return Array.from({ length: last - first + 1 }, (_, index) => Number(((first + index) * step).toPrecision(8)));
}

function chartFor(data, channel, x, timeTicks, showTime) {
  const { left, right, top, bottom } = chartBox;
  const ticks = axisValues(data.samples, channel);
  const low = ticks[0], high = ticks.at(-1);
  const y = value => bottom - (value - low) * (bottom - top) / (high - low);
  const clipId = 'battery-sampled-' + channel.id;
  // Each short round stroke represents one original sample. Gaps stay empty.
  const points = data.samples.filter(sample => Number.isFinite(sample[channel.field]))
    .map(sample => 'M' + x(sample.elapsedSeconds).toFixed(2) + ',' + y(sample[channel.field]).toFixed(2) + 'h.01').join('');
  const markup = `<section class="battery-chart battery-${channel.id}" data-observation-primary data-series="${channel.id}">
    <div class="battery-chart-heading"><strong>${channel.label}</strong><span>${channel.unit}</span></div>
    <svg viewBox="0 0 240 ${showTime ? 87 : 69}" role="img" aria-label="${channel.label}实测采样">
      <defs><clipPath id="${clipId}"><rect x="${left - 2}" y="${top - 4}" width="0" height="${clipHeight}" data-battery-reveal /></clipPath></defs>
      <g class="battery-axis" aria-hidden="true">
        ${ticks.map(value => `<path class="${channel.id === 'current' && value === 0 ? 'battery-zero-line' : ''}" d="M${left} ${y(value)}H${right}" /><text x="${left - 4}" y="${y(value) + 3}" text-anchor="end">${number.format(value)}</text>`).join('')}
        ${timeTicks.map((value, index) => `<path d="M${x(value)} ${top}V${bottom}" />${showTime ? `<text x="${x(value)}" y="77" text-anchor="${index === 0 ? 'start' : index === timeTicks.length - 1 ? 'end' : 'middle'}">${number.format(value / 60)}</text>` : ''}`).join('')}
      </g>
      <path class="battery-samples battery-sample-history" d="${points}" />
      <path class="battery-samples" clip-path="url(#${clipId})" d="${points}" />
      <line class="battery-cursor" x1="${left}" x2="${left}" y1="${top - 3}" y2="${bottom + 3}" data-battery-cursor />
      <circle class="battery-sample-now" r="3.6" data-battery-dot visibility="hidden" />
    </svg>
  </section>`;
  return { markup, low, high, y };
}

function readingMarkup(data) {
  return `<section class="battery-evidence">
    <div class="panel-label battery-evidence-heading">台架实测 <span>NASA B0005</span></div>
    <div class="battery-readings">${channels.map(channel => {
      const metadata = data.channels?.find(item => item.id === channel.id);
      return `<div class="battery-reading battery-${channel.id}" data-story-target="${channel.id}">
        <span class="battery-reading-label">${channel.label}</span>
        <strong data-battery-value="${channel.id}">缺测</strong>
        <span class="battery-meter" aria-hidden="true"><span data-battery-meter="${channel.id}"></span></span>
        ${metadata?.sourceField ? `<small data-observation-secondary>${escaped(metadata.sourceField)}</small>` : ''}
      </div>`;
    }).join('')}</div>
    <p class="battery-note">电流保留仪器记录的正负号。</p>
  </section>`;
}

export function createBatteryEvidence({ insight, readouts, charts }) {
  let activeData = null;
  let elements = null;

  function reset() {
    activeData = null;
    elements = null;
  }

  function mount(data) {
    const start = data.samples[0].elapsedSeconds, end = data.samples.at(-1).elapsedSeconds;
    const duration = end - start || 1;
    const x = elapsed => chartBox.left + (elapsed - start) * (chartBox.right - chartBox.left) / duration;
    const timeTicks = [start];
    for (let tick = Math.ceil(start / 900) * 900; tick < end; tick += 900) {
      if (tick - start >= 0.12 * duration && end - tick >= 0.12 * duration) timeTicks.push(tick);
    }
    timeTicks.push(end);
    const chartData = channels.map((channel, index) => chartFor(data, channel, x, timeTicks, index === channels.length - 1));
    insight.innerHTML = readingMarkup(data);
    readouts.innerHTML = `<div class="battery-evidence-clock" data-observation-primary>
      <strong data-battery-clock></strong><span data-battery-record></span>
      <p class="battery-note" data-observation-secondary>环境设定 ${Number.isFinite(data.ambientTemperatureC) ? number.format(data.ambientTemperatureC) + ' °C' : '缺测'}</p>
    </div>`;
    charts.innerHTML = chartData.map(chart => chart.markup).join('') +
      '<p class="battery-note">横轴为放电经过时间（分钟）。每个点对应一笔原始采样，金线表示当前时刻。</p>';
    elements = {
      x,
      sampleIndex: new Map(data.samples.map((sample, index) => [sample.elapsedSeconds, index])),
      clock: readouts.querySelector('[data-battery-clock]'),
      record: readouts.querySelector('[data-battery-record]'),
      channels: channels.map((channel, index) => {
        const section = charts.querySelector('[data-series="' + channel.id + '"]');
        return {
          channel,
          value: insight.querySelector('[data-battery-value="' + channel.id + '"]'),
          meter: insight.querySelector('[data-battery-meter="' + channel.id + '"]'),
          svg: section.querySelector('svg'),
          cursor: section.querySelector('[data-battery-cursor]'),
          dot: section.querySelector('[data-battery-dot]'),
          reveal: section.querySelector('[data-battery-reveal]'),
          plot: chartData[index],
        };
      }),
    };
  }

  function render(data, snapshot) {
    if (activeData !== data) {
      mount(data);
      activeData = data;
    }
    const elapsed = snapshot.elapsedSeconds;
    const index = elements.sampleIndex.get(elapsed);
    const sample = snapshot.sample?.elapsedSeconds === elapsed ? snapshot.sample : null;
    const time = formatBatteryElapsed(elapsed);
    elements.clock.textContent = time;
    elements.record.textContent = index == null ? '此刻缺少采样' : `采样 ${index + 1} / ${data.samples.length}`;
    const cursorX = elements.x(elapsed).toFixed(2);
    for (const { channel, value, meter, svg, cursor, dot, reveal, plot } of elements.channels) {
      const reading = sample?.[channel.field];
      const valid = Number.isFinite(reading);
      const text = valueText(channel, reading);
      value.textContent = text;
      meter.style.transform = 'scaleX(' + (valid ? Math.min(1, Math.max(0, (reading - plot.low) / (plot.high - plot.low))) : 0) + ')';
      cursor.setAttribute('x1', cursorX);
      cursor.setAttribute('x2', cursorX);
      reveal.setAttribute('width', String(Math.max(0, Number(cursorX) - chartBox.left + 2)));
      dot.setAttribute('visibility', valid ? 'visible' : 'hidden');
      if (valid) {
        dot.setAttribute('cx', cursorX);
        dot.setAttribute('cy', plot.y(reading).toFixed(2));
      }
      svg.setAttribute('aria-label', `放电经过 ${time}，实测${channel.label} ${text}`);
    }
  }

  return { render, reset };
}
