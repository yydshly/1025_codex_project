export const RIVER_BANKS = {
  left: { label: '左岸', color: '#65dfce' },
  right: { label: '右岸', color: '#f0bf70' },
};

const ppb = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });
const distance = new Intl.NumberFormat('zh-CN');
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function formatRiverElapsed(seconds, { includeSeconds = true } = {}) {
  if (!Number.isFinite(seconds)) return '缺测';
  const value = Math.floor(Math.abs(seconds));
  const parts = [Math.floor(value / 3600), Math.floor(value / 60) % 60, value % 60];
  const clock = parts.slice(0, includeSeconds ? 3 : 2).map(unit => String(unit).padStart(2, '0')).join(':');
  return (seconds < 0 ? '−' : '+') + clock;
}

/** Consecutive valid samples can be joined for reading. A gap opens a new stroke. */
export function riverTrace(samples, { start, end, cadenceSeconds, x, y }) {
  const commands = [];
  let previous = null;
  for (const { elapsedSeconds, value } of samples) {
    if (elapsedSeconds < start) continue;
    if (elapsedSeconds > end) break;
    if (!Number.isFinite(value)) {
      previous = null;
      continue;
    }
    const command = previous !== null && elapsedSeconds - previous === cadenceSeconds ? 'L' : 'M';
    commands.push(command + x(elapsedSeconds).toFixed(2) + ' ' + y(value).toFixed(2));
    previous = elapsedSeconds;
  }
  return commands.join(' ');
}

const chartBox = { left: 30, top: 18, right: 228, bottom: 137 };
const peakLabel = bank => bank.peak ? formatRiverElapsed(bank.peak.elapsedSeconds) : '缺测';
const valueText = value => Number.isFinite(value) ? ppb.format(value) : '缺测';
const bankClass = bank => bank === 'right' ? 'river-bank-right' : 'river-bank-left';

function valueScale(data) {
  let min = 0;
  let max = 1;
  for (const section of data.transects) {
    for (const bank of section.banks) {
      for (const sample of bank.samples) {
        if (!Number.isFinite(sample.value)) continue;
        min = Math.min(min, sample.value);
        max = Math.max(max, sample.value);
      }
    }
  }
  const step = 10 ** Math.floor(Math.log10(max));
  return { min: min < 0 ? Math.floor(min) : 0, max: Math.ceil(max / step * 2) / 2 * step };
}

function plotBounds(data, elapsedSeconds, options) {
  const first = data.clock[0].elapsedSeconds;
  const last = data.clock.at(-1).elapsedSeconds;
  const start = Math.max(first, options?.fromSeconds ?? data.plotRange?.startSeconds ?? first);
  const end = Math.min(last, options?.toSeconds ?? data.plotRange?.endSeconds ?? last);
  return elapsedSeconds >= start && elapsedSeconds <= end && end > start
    ? { start, end, wide: false } : { start: first, end: last, wide: true };
}

function stationMarkup(data) {
  const criterion = data.signalRule;
  return `<div class="panel-label">沿下游看三个断面</div><p class="river-side-note">同一时刻 · 同一浓度尺度</p>
    <div class="river-stations">${data.transects.map(section => `
      <button type="button" class="river-station" data-station="${escapeHtml(section.id)}" aria-pressed="false">
        <span class="river-station-heading"><strong>${escapeHtml(section.label)}</strong><span>${distance.format(section.distanceM)} m</span></span>
        ${criterion ? '<span class="river-station-status" data-river-status>等待同刻观测</span>' : ''}
        ${section.banks.map(bank => `
          <span class="river-station-bank ${bankClass(bank.bank)}" data-river-bank="${escapeHtml(bank.id)}">
            <span class="river-bank-reading"><span>${RIVER_BANKS[bank.bank].label}</span><strong data-river-value>缺测</strong></span>
            <span class="river-station-meter" aria-hidden="true"><span data-river-level></span></span>
            <span class="river-station-peak">峰值时刻 ${peakLabel(bank)}</span>
          </span>`).join('')}
      </button>`).join('')}</div>
    <p class="river-side-note">距离按原档，相对于释放点。${criterion ? `持续抬升取连续 ${criterion.consecutiveSamples} 次 ≥ ${ppb.format(criterion.thresholdPpb)} ppb 的首条记录。` : '两岸峰值取各自实测记录。'}</p>`;
}

function readoutMarkup(section) {
  return `<section class="river-readout" data-observation-primary data-story-target="${escapeHtml(section.id)}">
    <div class="river-selected-heading"><strong>${escapeHtml(section.label)}</strong><span>下游 ${distance.format(section.distanceM)} m</span></div>
    <div class="river-compare">${section.banks.map(bank => `
      <div class="river-readout-bank ${bankClass(bank.bank)}" data-river-bank="${escapeHtml(bank.id)}">
        <span>${RIVER_BANKS[bank.bank].label}</span>
        <strong data-river-value>缺测</strong>
        <small data-observation-secondary>实测峰值 ${valueText(bank.peak?.value)} ppb<br>${peakLabel(bank)}</small>
      </div>`).join('')}</div>
    <p class="river-side-note" data-river-time></p>
  </section>`;
}

function chartMarkup(data, section, scale, range, x, y) {
  const { left, right, top, bottom } = chartBox;
  const clipId = 'river-chart-played';
  const values = [0, scale.max / 2, scale.max];
  if (scale.min < 0) values.unshift(scale.min);
  const series = section.banks.map(bank => ({
    bank,
    d: riverTrace(bank.samples, { ...range, x, y, cadenceSeconds: data.cadenceSeconds }),
  }));
  const trace = ({ bank, d }) => `<path class="river-trace ${bankClass(bank.bank)}" d="${d}" />`;
  const stations = section.banks.map(bank => `<span class="${bankClass(bank.bank)}"><i></i>${RIVER_BANKS[bank.bank].label}</span>`).join('');
  return `<section class="river-chart" data-observation-primary data-series="${escapeHtml(section.id)}">
    <div class="river-selected-heading"><strong>两岸浓度变化</strong><span>ppb</span></div>
    <div class="river-chart-legend">${stations}</div>
    <svg viewBox="0 0 240 160" role="img" aria-label="${escapeHtml(section.label)}左右岸实测染料浓度">
      <defs><clipPath id="${clipId}"><rect x="${left}" y="${top - 4}" width="0" height="${bottom - top + 8}" data-river-reveal /></clipPath></defs>
      <g class="river-axis">
        ${values.map(value => `<path d="M${left} ${y(value)}H${right}" /><text x="${left - 5}" y="${y(value) + 3}" text-anchor="end">${valueText(value)}</text>`).join('')}
        <text x="${left}" y="153">${formatRiverElapsed(range.start, { includeSeconds: false })}</text>
        <text x="${right}" y="153" text-anchor="end">${formatRiverElapsed(range.end, { includeSeconds: false })}</text>
      </g>
      <g class="river-trace-context">${series.map(trace).join('')}</g>
      <g clip-path="url(#${clipId})">${series.map(trace).join('')}</g>
      ${data.signalRule ? `<line class="river-threshold" x1="${left}" x2="${right}" y1="${y(data.signalRule.thresholdPpb)}" y2="${y(data.signalRule.thresholdPpb)}" aria-label="${data.signalRule.thresholdPpb} ppb 持续抬升判定线" />` : ''}
      <line class="river-cursor" x1="${left}" x2="${left}" y1="${top - 4}" y2="${bottom + 3}" data-river-cursor />
      ${section.banks.map(bank => `<circle class="river-current-dot ${bankClass(bank.bank)}" r="3.5" data-river-dot="${escapeHtml(bank.id)}" visibility="hidden" />`).join('')}
    </svg>
    <p class="river-chart-note">金线是当前时刻。彩线随回放推进，断线表示缺测。</p>
    <p class="river-chart-note" data-observation-secondary>${range.wide ? '完整测站时段' : '围绕染料经过的主要时段'} · 共用 ppb 纵轴，横轴以释放为零点，观测间隔 ${data.cadenceSeconds} 秒。USGS 浓度记录已作背景校正与去尖峰处理。</p>
  </section>`;
}

export function createRiverEvidence({ insight, readouts, charts }) {
  let activeData = null;
  let activeSection = null;
  let activeRange = null;
  let scale = null;
  let plot = null;
  let stationNodes = [];
  let cardBanks = [];
  let readoutBanks = [];

  function reset() {
    activeData = activeSection = activeRange = scale = plot = null;
    stationNodes = [];
    cardBanks = [];
    readoutBanks = [];
  }

  function render(data, snapshot, selectedTransect, options) {
    const section = data.transects.find(item => item.id === selectedTransect) ?? data.transects[0];
    const changedData = data !== activeData;
    if (changedData) {
      activeData = data;
      scale = valueScale(data);
      insight.innerHTML = stationMarkup(data);
      stationNodes = [...insight.querySelectorAll('[data-station]')].map(button => ({
        button, status: button.querySelector('[data-river-status]'),
      }));
      cardBanks = [...insight.querySelectorAll('[data-river-bank]')].map(node => ({
        id: node.dataset.riverBank,
        value: node.querySelector('[data-river-value]'),
        meter: node.querySelector('[data-river-level]'),
      }));
    }
    if (changedData || section !== activeSection) {
      readouts.innerHTML = readoutMarkup(section);
      readoutBanks = [...readouts.querySelectorAll('[data-river-bank]')].map(node => ({
        id: node.dataset.riverBank, value: node.querySelector('[data-river-value]'),
      }));
      for (const { button } of stationNodes) button.setAttribute('aria-pressed', String(button.dataset.station === section.id));
    }

    const range = plotBounds(data, snapshot.elapsedSeconds, options);
    if (changedData || section !== activeSection || range.start !== activeRange?.start || range.end !== activeRange?.end) {
      const { left, right, top, bottom } = chartBox;
      const x = value => left + (value - range.start) * (right - left) / (range.end - range.start);
      const y = value => bottom - (value - scale.min) * (bottom - top) / (scale.max - scale.min);
      charts.innerHTML = chartMarkup(data, section, scale, range, x, y);
      plot = {
        x, y,
        svg: charts.querySelector('svg'),
        cursor: charts.querySelector('[data-river-cursor]'),
        reveal: charts.querySelector('[data-river-reveal]'),
        dots: [...charts.querySelectorAll('[data-river-dot]')],
      };
    }
    activeSection = section;
    activeRange = range;

    const readings = new Map(snapshot.readings.map(reading => [reading.id, reading.value]));
    for (const [index, { status }] of stationNodes.entries()) {
      if (!status) continue;
      const reached = data.transects[index].banks.filter(bank => bank.sustainedSignal && snapshot.elapsedSeconds >= bank.sustainedSignal.elapsedSeconds).length;
      status.textContent = reached === 0 ? '尚未持续抬升' : reached === 1 ? '一岸已持续抬升' : '两岸已持续抬升';
      status.dataset.reached = String(reached > 0);
    }
    for (const bank of [...cardBanks, ...readoutBanks]) {
      const value = readings.get(bank.id);
      bank.value.textContent = Number.isFinite(value) ? ppb.format(value) + ' ppb' : '缺测';
      if (bank.meter) bank.meter.style.transform = `scaleX(${Number.isFinite(value) ? Math.max(0, value) / scale.max : 0})`;
    }
    const time = formatRiverElapsed(snapshot.elapsedSeconds);
    readouts.querySelector('[data-river-time]').textContent = '释放相对时间 ' + time;
    const cursor = plot.x(snapshot.elapsedSeconds).toFixed(2);
    plot.cursor.setAttribute('x1', cursor);
    plot.cursor.setAttribute('x2', cursor);
    plot.reveal.setAttribute('width', String(Math.max(0, Number(cursor) - chartBox.left)));
    for (const dot of plot.dots) {
      const value = readings.get(dot.dataset.riverDot);
      dot.setAttribute('visibility', Number.isFinite(value) ? 'visible' : 'hidden');
      if (!Number.isFinite(value)) continue;
      dot.setAttribute('cx', cursor);
      dot.setAttribute('cy', plot.y(value).toFixed(2));
    }
    const accessibleValues = section.banks.map(bank => {
      const value = readings.get(bank.id);
      return RIVER_BANKS[bank.bank].label + ' ' + (Number.isFinite(value) ? ppb.format(value) + ' ppb' : '缺测');
    });
    plot.svg.setAttribute('aria-label', `${section.label}，释放相对时间 ${time}，${accessibleValues.join('，')}`);
  }
  return { render, reset };
}
