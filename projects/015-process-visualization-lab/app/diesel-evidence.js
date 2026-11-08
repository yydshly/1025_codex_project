const channels = [
  { id: 'rpm', field: 'rpm', label: '发动机转速', origin: '实测', unit: 'rpm', digits: 1 },
  { id: 'torque', field: 'torqueNm', label: '输出扭矩', origin: '实测', unit: 'N·m', digits: 1 },
  { id: 'railPressure', field: 'railPressureMpa', label: '共轨燃油压力', origin: '原档 RP', unit: 'MPa', digits: 2 },
];
const box = { left: 35, right: 229, top: 8, bottom: 55 };
const axisNumber = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 3 });
const count = new Intl.NumberFormat('zh-CN');
const localSeconds = 12;
const halfWindowSamples = localSeconds * 10 / 2;

function axisTicks(low, high) {
  if (!Number.isFinite(low)) return [0, 1];
  if (low === high) {
    const step = Math.max(0.1, Math.abs(low) * 0.05);
    return [low - step, low, high + step];
  }
  const spacing = (high - low) / 3;
  const magnitude = 10 ** Math.floor(Math.log10(spacing));
  const step = [1, 2, 2.5, 5, 10].find(value => value >= spacing / magnitude) * magnitude;
  const first = Math.floor(low / step);
  const last = Math.ceil(high / step);
  return Array.from({ length: last - first + 1 }, (_, i) => Number(((first + i) * step).toPrecision(10)));
}

function chartFor(samples, channel, x, timeTicks, showTime) {
  const { left, right, top, bottom } = box;
  const bins = Array.from({ length: right - left + 1 }, () => ({ min: Infinity, max: -Infinity }));
  let low = Infinity;
  let high = -Infinity;
  for (const sample of samples) {
    const value = sample[channel.field];
    if (!Number.isFinite(value)) continue;
    const bin = bins[Math.floor(x(sample.t)) - left];
    bin.min = Math.min(bin.min, value);
    bin.max = Math.max(bin.max, value);
    low = Math.min(low, value);
    high = Math.max(high, value);
  }
  const ticks = axisTicks(low, high);
  low = ticks[0];
  high = ticks.at(-1);
  const y = value => bottom - (value - low) * (bottom - top) / (high - low);
  // One independent min–max stroke per display column. Empty columns stay empty.
  const path = bins.map((bin, i) => Number.isFinite(bin.min)
    ? `M${i + left},${y(bin.max).toFixed(2)}v${Math.max(0.04, y(bin.min) - y(bin.max)).toFixed(2)}`
    : '').join('');
  const clipId = 'diesel-sampled-' + channel.id;
  return { y, markup: `<section class="diesel-chart diesel-${channel.id}" data-observation-primary data-series="${channel.id}">
    <div class="diesel-chart-head"><strong>${channel.label}</strong><span>${channel.origin} · ${channel.unit}</span></div>
    <svg viewBox="0 0 240 ${showTime ? 75 : 60}" role="img" aria-label="${channel.label}台架记录">
      <defs><clipPath id="${clipId}"><rect x="${left - 1}" y="${top - 3}" width="0" height="${bottom - top + 6}" data-diesel-reveal /></clipPath></defs>
      <g class="diesel-grid" aria-hidden="true">
        ${ticks.map(tick => `<path d="M${left} ${y(tick)}H${right}" /><text x="${left - 4}" y="${y(tick) + 2.5}" text-anchor="end">${axisNumber.format(tick)}</text>`).join('')}
        ${timeTicks.map((tick, index) => `<path d="M${x(tick)} ${top}V${bottom}" />${showTime ? `<text x="${x(tick)}" y="69" text-anchor="${index === 0 ? 'start' : index === timeTicks.length - 1 ? 'end' : 'middle'}">${Math.round(tick / 60)}</text>` : ''}`).join('')}
      </g>
      <path class="diesel-range diesel-range-full" d="${path}" />
      <path class="diesel-range" d="${path}" clip-path="url(#${clipId})" />
      <line class="diesel-cursor" y1="${top - 2}" y2="${bottom + 2}" data-diesel-cursor />
      <circle class="diesel-dot" r="3.4" data-diesel-dot visibility="hidden" />
    </svg>
  </section>` };
}

function localTrace(samples, channel, startIndex, endIndex, x, y) {
  const commands = [];
  let previousValid = false;
  for (let i = startIndex; i <= endIndex; i++) {
    const sample = samples[i];
    const value = sample[channel.field];
    const valid = Number.isFinite(value);
    if (valid) commands.push((previousValid ? 'L' : 'M') + x(sample.t).toFixed(2) + ',' + y(value).toFixed(2));
    previousValid = valid;
  }
  return commands.join('');
}

export function createDieselEvidence({ insight, readouts, charts }) {
  let activeData = null;
  let elements = null;

  function reset() {
    activeData = null;
    elements = null;
  }

  function mount(data) {
    const start = data.samples[0].t;
    const end = data.samples.at(-1).t;
    const x = seconds => box.left + (box.right - box.left) * Math.max(0, Math.min(1, (seconds - start) / (end - start)));
    const timeTicks = [start];
    const interval = (end - start) >= 1200 ? 600 : 60;
    for (let tick = Math.ceil(start / interval) * interval; tick < end; tick += interval) {
      if (tick - start >= (end - start) / 8 && end - tick >= (end - start) / 8) timeTicks.push(tick);
    }
    timeTicks.push(end);
    const plots = channels.map((channel, index) => chartFor(data.samples, channel, x, timeTicks, index === channels.length - 1));
    insight.innerHTML = `<section class="diesel-evidence">
      <div class="panel-label diesel-evidence-head">台架记录 <span>吉林大学 · ETC</span></div>
      <div class="diesel-local-range" data-diesel-local-range></div>
      <div class="diesel-readings">${channels.map(channel => `
        <div class="diesel-reading diesel-${channel.id}" data-story-target="${channel.id}">
          <div class="diesel-reading-head"><span>${channel.label}</span><span>${channel.origin}</span></div>
          <div><strong data-diesel-value="${channel.id}">—</strong> <small>${channel.unit}</small></div>
          <svg viewBox="0 0 120 26" preserveAspectRatio="none" aria-hidden="true">
            <path class="diesel-local-midline" d="M0 13H120" />
            <path class="diesel-local-trace" data-diesel-trace />
            <line class="diesel-cursor" y1="1" y2="25" data-diesel-local-cursor />
            <circle class="diesel-dot" r="1.9" data-diesel-local-dot visibility="hidden" />
          </svg>
        </div>`).join('')}</div>
      <p class="diesel-note">局部曲线沿用右侧量程。RP 为原档轨压通道，来源未注明是传感器读数还是控制设定。中央剖面为结构示意。</p>
    </section>`;
    readouts.innerHTML = `<div class="diesel-clock" data-observation-primary>
      <div><span>台架经过时间</span><strong data-diesel-clock>—</strong></div>
      <span data-diesel-record></span>
    </div>`;
    charts.innerHTML = plots.map(plot => plot.markup).join('') +
      '<p class="diesel-note">横轴为台架经过时间（分钟）。每列保留该时间段的最小值与最大值。金线和圆点对应当前采样。</p>';
    elements = {
      x,
      sampleIndices: new Map(data.samples.map((sample, index) => [sample.t, index])),
      clock: readouts.querySelector('[data-diesel-clock]'),
      record: readouts.querySelector('[data-diesel-record]'),
      localRange: insight.querySelector('[data-diesel-local-range]'),
      channels: channels.map((channel, index) => {
        const reading = insight.querySelector(`[data-story-target="${channel.id}"]`);
        const section = charts.querySelector(`[data-series="${channel.id}"]`);
        return {
          channel,
          value: reading.querySelector('[data-diesel-value]'),
          trace: reading.querySelector('[data-diesel-trace]'),
          localCursor: reading.querySelector('[data-diesel-local-cursor]'),
          localDot: reading.querySelector('[data-diesel-local-dot]'),
          svg: section.querySelector('svg'),
          reveal: section.querySelector('[data-diesel-reveal]'),
          cursor: section.querySelector('[data-diesel-cursor]'),
          dot: section.querySelector('[data-diesel-dot]'),
          y: plots[index].y,
        };
      }),
    };
  }

  function render(data, { sample }) {
    if (activeData !== data) {
      mount(data);
      activeData = data;
    }
    const index = elements.sampleIndices.get(sample.t);
    const time = sample.t.toFixed(1) + ' s';
    const last = data.samples.length - 1;
    const startIndex = Math.max(0, Math.min(index - halfWindowSamples, last - 2 * halfWindowSamples));
    const endIndex = Math.min(last, startIndex + 2 * halfWindowSamples);
    const localStart = data.samples[startIndex].t;
    const localEnd = data.samples[endIndex].t;
    const localX = seconds => 1 + 118 * (seconds - localStart) / (localEnd - localStart);
    const localCursorX = localX(sample.t).toFixed(2);
    elements.localRange.textContent = `局部 ${localStart.toFixed(1)}–${localEnd.toFixed(1)} s`;
    elements.clock.textContent = time;
    elements.record.textContent = `采样 ${count.format(index + 1)} / ${count.format(data.samples.length)}`;
    const x = elements.x(sample.t).toFixed(2);
    for (const { channel, value, svg, reveal, cursor, dot, y, trace, localCursor, localDot } of elements.channels) {
      const reading = sample[channel.field];
      const valid = Number.isFinite(reading);
      const localY = measurement => 2 + 22 * (y(measurement) - box.top) / (box.bottom - box.top);
      value.textContent = valid ? reading.toFixed(channel.digits) : '缺测';
      value.title = valid ? reading + ' ' + channel.unit : '';
      trace.setAttribute('d', localTrace(data.samples, channel, startIndex, endIndex, localX, localY));
      localCursor.setAttribute('x1', localCursorX);
      localCursor.setAttribute('x2', localCursorX);
      reveal.setAttribute('width', (Number(x) - box.left + 1).toFixed(2));
      cursor.setAttribute('x1', x);
      cursor.setAttribute('x2', x);
      dot.setAttribute('visibility', valid ? 'visible' : 'hidden');
      localDot.setAttribute('visibility', valid ? 'visible' : 'hidden');
      if (valid) {
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y(reading).toFixed(2));
        localDot.setAttribute('cx', localCursorX);
        localDot.setAttribute('cy', localY(reading).toFixed(2));
      }
      svg.setAttribute('aria-label', `台架经过 ${time}，${channel.label}（${channel.origin}）${valid ? value.textContent + ' ' + channel.unit : '缺测'}`);
    }
  }

  return { render, reset };
}
