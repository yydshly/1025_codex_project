const SVG_NS = 'http://www.w3.org/2000/svg';
const COLORS = { positive: '#8af2e5', negative: '#d0b9ff', reference: '#b8c8da', cursor: '#ffdf9d', panel: '#081824' };
const counts = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 });
const clock = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const coord = value => value.toFixed(2);

function svg(document, name, attrs, parent) {
  const node = document.createElementNS(SVG_NS, name);
  attributes(node, attrs);
  parent?.appendChild(node);
  return node;
}

function attributes(node, attrs) {
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
}

function extrema(sample) {
  return [sample.min ?? sample.value, sample.max ?? sample.value];
}

/** The source stores observed 1 s peaks and min/max ranges. Only windows that
 * have already ended may draw, with discontinuities retained in the peak trace. */
export function quakeMotionFrame(station, timeUtc, sample) {
  const now = Date.parse(timeUtc), start = now - 60000;
  const interval = (station.sampleIntervalSeconds ?? 1) * 1000;
  const history = [];
  let previousTime = -Infinity;
  for (const window of station.samples) {
    const t = Date.parse(window.timeUtc);
    if (t > now) break;
    if (t <= start) continue;
    if (!Number.isFinite(window.value)) { previousTime = -Infinity; continue; }
    const [min, max] = extrema(window);
    history.push({ x: (t - start) / 60000, value: window.value, min, max, contiguous: t - previousTime <= interval + .001 });
    previousTime = t;
  }
  return { history, current: Number.isFinite(sample?.value) && Date.parse(sample.timeUtc) === now ? sample : null };
}

export function createQuakeMotionView(labelHost) {
  const document = labelHost.ownerDocument ?? globalThis.document;
  const overlay = svg(document, 'svg', { class: 'quake-motion-overlay', role: 'img', width: '100%', height: '100%' }, labelHost);
  Object.assign(overlay.style, { position: 'absolute', inset: '0', pointerEvents: 'none', overflow: 'hidden', display: 'none' });
  const leader = svg(document, 'path', { fill: 'none', stroke: COLORS.reference, 'stroke-opacity': '.55', 'stroke-dasharray': '3 4' }, overlay);
  const probe = svg(document, 'g', { 'aria-hidden': 'true' }, overlay);
  svg(document, 'circle', { r: 7, fill: COLORS.panel, stroke: COLORS.reference, 'stroke-width': '1.3' }, probe);
  const axis = svg(document, 'path', { fill: 'none', stroke: COLORS.reference, 'stroke-width': '1', opacity: '.6' }, probe);
  const extent = svg(document, 'path', { fill: 'none', stroke: COLORS.reference, 'stroke-width': '1.1', opacity: '.8' }, probe);
  const positive = svg(document, 'path', { fill: 'none', stroke: COLORS.positive, 'stroke-width': '5', 'stroke-linecap': 'round' }, probe);
  const negative = svg(document, 'path', { fill: 'none', stroke: COLORS.negative, 'stroke-width': '5', 'stroke-linecap': 'round' }, probe);
  const peak = svg(document, 'circle', { r: 3, fill: COLORS.cursor, stroke: COLORS.panel, 'stroke-width': '1' }, probe);

  const panel = svg(document, 'g', { class: 'quake-motion-card', 'aria-hidden': 'true' }, overlay);
  svg(document, 'rect', { x: 0, y: 0, width: 248, height: 138, rx: 6, fill: COLORS.panel, 'fill-opacity': '.94', stroke: '#557184', 'stroke-opacity': '.75' }, panel);
  const text = (x, y, size, fill, anchor) => svg(document, 'text', { x, y, fill, 'font-size': size, 'text-anchor': anchor ?? 'start' }, panel);
  const title = text(11, 18, 12, '#ebf5fa');
  title.setAttribute('font-weight', '600');
  const subtitle = text(237, 18, 9, COLORS.reference, 'end');
  subtitle.textContent = '近 60 秒 · 同站固定刻度';
  svg(document, 'path', { d: 'M11 32H237 M11 58H237 M11 84H237', stroke: '#2c465b', 'stroke-width': '1', fill: 'none' }, panel);
  const envelope = svg(document, 'path', { stroke: COLORS.positive, opacity: '.42', fill: 'none', 'stroke-width': '2' }, panel);
  const trace = svg(document, 'path', { stroke: COLORS.negative, fill: 'none', 'stroke-width': '1.65', 'stroke-linejoin': 'round' }, panel);
  svg(document, 'path', { d: 'M237 32V84', stroke: COLORS.cursor, 'stroke-dasharray': '2 2', opacity: '.55' }, panel);
  const chartPoint = svg(document, 'circle', { cx: '237', r: '2.6', fill: COLORS.cursor }, panel);
  const referenceLabel = text(11, 100, 10, COLORS.reference);
  const referenceValue = text(237, 100, 10, COLORS.reference, 'end');
  const currentLabel = text(11, 123, 10, '#f1e1b6');
  const currentValue = text(237, 123, 10, '#f1e1b6', 'end');
  svg(document, 'path', { d: 'M11 106H237 M11 130H237', stroke: '#2c465b', 'stroke-width': '2.5' }, panel);
  const referenceBar = svg(document, 'rect', { x: '11', y: '105', height: '2.5', fill: COLORS.reference }, panel);
  const currentBar = svg(document, 'rect', { x: '11', y: '128', height: '3.5', fill: COLORS.cursor }, panel);
  const probes = [axis, extent, positive, negative, peak];

  let station = null, scale = 1, reference = null, frame = null, shown = false, cardTransform = '';
  const fixedRatio = value => value / scale;

  function setStation(next, originUtc, stationScale = 1) {
    if (next === station) return;
    station = next;
    frame = null;
    overlay.style.display = 'none';
    if (!station) return;
    scale = stationScale;
    const origin = Date.parse(originUtc);
    reference = station.samples.find(sample => Number.isFinite(sample.value) && Date.parse(sample.timeUtc) <= origin) ?? null;
    title.textContent = `${station.stationCode ?? station.id} · 台站记录`;
    referenceLabel.textContent = reference ? `震前 ${clock.format(Date.parse(reference.timeUtc))} 绝对峰值` : '震前参照缺测';
    referenceValue.textContent = reference ? `${counts.format(Math.abs(reference.value))} counts` : '—';
    referenceBar.setAttribute('width', reference ? coord(226 * fixedRatio(Math.abs(reference.value))) : '0');
  }

  function setSnapshot(timeUtc, sample) {
    if (!station) return;
    frame = quakeMotionFrame(station, timeUtc, sample);
    const { history, current } = frame;
    const y = value => coord(58 - fixedRatio(value) * 25);
    let tracePath = '', envelopePath = '';
    for (const point of history) {
      const x = coord(11 + 226 * point.x);
      envelopePath += `M${x} ${y(point.min)}V${y(point.max)}`;
      tracePath += `${point.contiguous ? 'L' : 'M'}${x} ${y(point.value)}`;
    }
    trace.setAttribute('d', tracePath);
    envelope.setAttribute('d', envelopePath);
    chartPoint.style.display = current ? '' : 'none';
    if (current) chartPoint.setAttribute('cy', y(current.value));
    currentLabel.textContent = `当前 ${clock.format(Date.parse(timeUtc))} 绝对峰值`;
    currentValue.textContent = current ? `${counts.format(Math.abs(current.value))} counts` : '缺测';
    currentBar.setAttribute('width', current ? coord(226 * fixedRatio(Math.abs(current.value))) : '0');
    for (const glyph of probes) glyph.style.display = current ? '' : 'none';
    if (current) {
      const [min, max] = extrema(current);
      const delta = value => coord(-62 * fixedRatio(value));
      axis.setAttribute('d', 'M-5 0H5 M-3 -62H3 M-3 62H3');
      extent.setAttribute('d', `M0 ${delta(Math.min(min, 0))}V${delta(Math.max(max, 0))}`);
      positive.setAttribute('d', max > 0 ? `M0 ${delta(Math.max(0, min))}V${delta(max)}` : '');
      negative.setAttribute('d', min < 0 ? `M0 ${delta(min)}V${delta(Math.min(0, max))}` : '');
      peak.setAttribute('cy', delta(current.value));
    }
    attributes(overlay, {
      'data-station': station.id,
      'data-observed-time': timeUtc,
      'aria-label': `${station.stationCode ?? station.id} 最近60秒的台站记录。${referenceLabel.textContent} ${referenceValue.textContent}。${currentLabel.textContent} ${currentValue.textContent}。显示尺度固定用于同一台站，峰值取绝对值。`,
    });
  }

  function project(anchor, width, height, spatial = false) {
    const active = shown && frame && width > 0 && height > 0;
    overlay.style.display = active ? '' : 'none';
    if (!active) return null;
    const size = Math.min(1, width * .64 / 248), cardWidth = 248 * size, cardHeight = 138 * size;
    let x = 12, y = 50;
    if (anchor && anchor.x < x + cardWidth + 12 && anchor.y > y - 68 && anchor.y < y + cardHeight + 68) {
      const right = width - cardWidth - 12;
      if (anchor.x < right - 12) x = right;
      else if (anchor.y < height - cardHeight - 115) y = height - cardHeight - 48;
    }
    const bounds = { x, y, width: cardWidth, height: cardHeight };
    const transform = `translate(${x} ${y}) scale(${size})`;
    if (transform !== cardTransform) {
      panel.setAttribute('transform', transform);
      cardTransform = transform;
    }
    leader.style.display = anchor ? '' : 'none';
    probe.style.display = anchor && !spatial ? '' : 'none';
    if (!anchor) return bounds;
    probe.setAttribute('transform', `translate(${coord(anchor.x)} ${coord(anchor.y)})`);
    const endX = Math.min(x + cardWidth, Math.max(x, anchor.x));
    const endY = Math.min(y + cardHeight, Math.max(y, anchor.y));
    leader.setAttribute('d', `M${coord(anchor.x)} ${coord(anchor.y)}L${coord(endX)} ${coord(endY)}`);
    return bounds;
  }

  return { setStation, setSnapshot, project, setVisible(value) {
    shown = Boolean(value);
    if (!shown) overlay.style.display = 'none';
  } };
}
