import { buildEventTimeline } from './live-event-data.js';
import { formatTime } from './real-event-data.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const number = value => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 3 }).format(value);
const shortTime = iso => new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
const kindLabel = { quake: '地震目录事件', volcano: '火山报告定位', storm: '风暴报告定位' };
const isVolcanoNotice = event => event.kind === 'volcano' && (event.timeMeaning === 'official-status-notice-publication' || /USGS|HANS/i.test([event.source?.id, event.source?.name].join(' ')));
const valueAt = (event, obs, key) => obs[key] !== undefined ? obs[key] : event[key];
const coord = obs => `${number(Math.abs(obs.lat))}°${obs.lat < 0 ? 'S' : 'N'} · ${number(Math.abs(obs.lon))}°${obs.lon < 0 ? 'W' : 'E'}`;
function link(url, label, escape = esc) {
  try { if (!['https:', 'http:'].includes(new URL(url).protocol)) return ''; } catch { return ''; }
  return `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`;
}
function selected(event, index) {
  const records = buildEventTimeline(event);
  if (!Number.isFinite(index)) throw new TypeError('观测索引必须为有限数字');
  const i = Math.max(0, Math.min(records.length - 1, Math.trunc(index)));
  return { records, i, obs: records[i] };
}

/** Trusted markup structure; every source string is escaped and links are HTTP(S)-only. */
export function eventFactsMarkup(event, obs = event.observations.at(-1), escapeFn = esc) {
  const e = escapeFn, quake = event.kind === 'quake', notice = isVolcanoNotice(event);
  const label = notice ? '火山官方通报' : kindLabel[event.kind] ?? '事件记录';
  const magnitude = valueAt(event, obs, 'magnitude'), depth = valueAt(event, obs, 'depthKm');
  const facts = [
    [quake ? '目录记录时间' : notice ? '官方通报时间' : '当前报告定位时间', formatTime(obs.timeUtc)],
    [quake ? '震中坐标' : notice ? '火山位置（官方目录）' : '报告坐标', coord(obs)],
    ['来源状态', event.statusLabel],
  ];
  const primary = quake ? [
    ['magnitude', '震级', Number.isFinite(magnitude) ? number(magnitude) : '未报告', Number.isFinite(magnitude) ? 'M' : '', '类型见来源'],
    ['depth', '目录深度', Number.isFinite(depth) ? number(depth) : '未报告', Number.isFinite(depth) ? 'km' : '', ''],
  ] : notice ? [
    ['alert', '告警等级（源值）', event.alertLevel || '未报告', '', ''],
    ['color', '航空颜色代码（源值）', event.colorCode || '未报告', '', ''],
  ] : [];
  const primaryMarkup = primary.length ? `<div class="live-primary-values">${primary.map(([key, label, value, unit, caption]) => `<div class="live-primary-value" data-metric="${key}"><span>${e(label)}</span><strong>${e(value)}${unit ? `<small>${e(unit)}</small>` : ''}</strong>${caption ? `<small>${e(caption)}</small>` : ''}</div>`).join('')}</div>` : '';
  const note = quake ? '震级描述事件规模，不等于所在地震感。本页未接入测站波形、实时波前或当地烈度。' : notice ? '这里的时间是官方状态通报发布时间，不是喷发起点或仪器采样时刻。坐标来自火山目录，不是监测台站或喷发范围；告警字段保留本次通报原值，不生成喷发高度或强度曲线。' : 'EONET 等事件目录提供带日期的报告位置；这些坐标不是完整风场、喷发高度或连续运动轨迹。来源只给日期时，目录可能以00:00 UTC记时，不应视作精确采样时刻。当前没有可用于绘制强度曲线的统一观测序列。';
  return `<section class="live-event-facts" data-event-id="${e(event.id)}" data-observed-time="${e(obs.timeUtc)}"><div class="live-event-heading"><span>${e(label)}</span><h3>${e(event.title)}</h3></div>${primaryMarkup}<dl class="live-event-fact-list">${facts.map(([label, value]) => `<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl><details class="live-event-method"><summary>资料含义与边界</summary>${event.description ? `<p class="live-event-description">${e(event.description)}</p>` : ''}<p class="live-event-boundary">${e(note)}</p></details><p class="live-event-sources">${link(event.sourceDetailUrl, '查看原始事件详情', e)} ${link(event.source.url, event.source.name, e)}</p></section>`;
}

function depthChart(event, obs) {
  const depth = valueAt(event, obs, 'depthKm');
  if (!Number.isFinite(depth)) return '<section class="live-event-chart live-event-depth"><h4>目录深度</h4><p class="live-event-empty">未报告深度，不绘制为零。</p><p class="live-event-boundary">尚未接入该事件的实测波形。</p></section>';
  const low = Math.min(0, depth * 1.15), high = Math.max(1, depth * 1.15), Y = value => 24 + (value - low) / (high - low) * 82;
  const zero = Y(0), end = Y(depth);
  return `<section class="live-event-chart live-event-depth" data-depth-km="${depth}"><h4>这条记录的目录深度 · ${number(depth)} km</h4><svg viewBox="0 0 300 136" role="img" aria-label="目录深度${number(depth)}公里，单条目录解，非波形"><path d="M42 ${zero}H260" stroke="#76919e" stroke-dasharray="3 3"/><rect x="136" y="${Math.min(zero, end)}" width="28" height="${Math.abs(end - zero)}" fill="#bca7ff" opacity=".65"/><circle cx="150" cy="${end}" r="4" fill="#efddff"/><text x="42" y="16" fill="#b8cbd3" font-size="10">0 km · 目录参考面</text><text x="175" y="${Math.max(31, Math.min(110, end + 4))}" fill="#efddff" font-size="12">${number(depth)} km</text><text x="150" y="129" text-anchor="middle" fill="#9cb0bc" font-size="10">${esc(shortTime(obs.timeUtc))} UTC+8</text></svg><p class="live-event-boundary">单条目录深度，保留源值与符号；参考面以来源说明为准。没有实测波形，不生成震动振幅或传播动画。</p></section>`;
}

function quakeScatter(event, feedOrEvents) {
  const list = Array.isArray(feedOrEvents) ? feedOrEvents : feedOrEvents?.events ?? [];
  const points = list.filter(item => item.kind === 'quake' && Number.isFinite(item.magnitude)).slice().sort((a, b) => Date.parse(a.timeUtc) - Date.parse(b.timeUtc));
  if (!points.length) return '<p class="live-event-empty">当前未提供可比较的地震列表；不生成震级随时间的曲线。</p>';
  const start = Date.parse(points[0].timeUtc), end = Date.parse(points.at(-1).timeUtc), magnitudes = points.map(p => p.magnitude);
  const low = Math.min(...magnitudes) - .5, high = Math.max(...magnitudes) + .5;
  const X = time => end === start ? 160 : 34 + (Date.parse(time) - start) / (end - start) * 252;
  const Y = m => 104 - (m - low) / (high - low) * 82;
  const marks = points.map(p => `<circle class="live-event-quake-point" data-event-id="${esc(p.id)}" data-time="${esc(p.timeUtc)}" data-magnitude="${p.magnitude}" cx="${X(p.timeUtc)}" cy="${Y(p.magnitude)}" r="${p.id === event.id ? 4.5 : 2.8}" fill="${p.id === event.id ? '#f1c47c' : '#8ed7e5'}"><title>${esc(p.title)} · ${esc(shortTime(p.timeUtc))} UTC+8 · M ${number(p.magnitude)}</title></circle>`).join('');
  const grid = [low, (low + high) / 2, high].map(value => `<path d="M34 ${Y(value)}H286" stroke="#294253"/><text x="29" y="${Y(value) + 3}" text-anchor="end" fill="#9cb0bc" font-size="9">${number(value)}</text>`).join('');
  return `<section class="live-event-chart live-event-quakes"><h4>当前资料包 · 地震震级与发生时间</h4><svg viewBox="0 0 320 148" role="img" aria-label="${points.length}条有震级的独立地震目录事件，震级与时间散点图">${grid}${marks}<text x="34" y="126" fill="#9cb0bc" font-size="9">${esc(shortTime(points[0].timeUtc))}</text><text x="286" y="140" text-anchor="end" fill="#9cb0bc" font-size="9">${esc(shortTime(points.at(-1).timeUtc))} UTC+8</text></svg><p class="live-event-boundary">${points.length}条有震级的目录事件，每点是一场地震；不是同一地震的振幅曲线，也不表示该区域的全部地震。缺少震级的事件不画为零；震级类型以各事件来源为准。</p></section>`;
}

function reportTimeline(event, records, i) {
  const notice = isVolcanoNotice(event), heading = notice ? '火山官方通报' : event.kind === 'storm' ? '风暴报告定位' : '火山报告定位';
  const start = Date.parse(records[0].timeUtc), end = Date.parse(records.at(-1).timeUtc);
  const X = obs => end === start ? 160 : 24 + (Date.parse(obs.timeUtc) - start) / (end - start) * 272;
  const marks = records.map((obs, n) => `<circle class="live-event-report-point" data-observation-index="${n}" data-time="${esc(obs.timeUtc)}" cx="${X(obs)}" cy="34" r="${n === i ? 5 : 3}" fill="${n === i ? '#f1c47c' : '#8ed7e5'}"><title>${esc(formatTime(obs.timeUtc))} · ${esc(coord(obs))}</title></circle>`).join('');
  const list = `<ol class="live-event-observations">${records.map((obs, n) => `<li data-observation-index="${n}"${n === i ? ' aria-current="true"' : ''}><time datetime="${esc(obs.timeUtc)}">${esc(shortTime(obs.timeUtc))} UTC+8</time><span>${esc(coord(obs))}</span></li>`).join('')}</ol>`;
  const rows = records.length > 8 ? `<details class="live-event-method live-event-report-list"><summary>查看${records.length}条原始报告定位</summary>${list}</details>` : list;
  return `<section class="live-event-chart live-event-report-timeline"><h4>${heading} · ${records.length}条实际记录</h4><svg viewBox="0 0 320 88" role="img" aria-label="${notice ? '官方通报发布时间轴' : '报告定位时间轴'}，非强度图"><path d="M24 34H296" stroke="#49606d"/>${marks}<text x="24" y="63" fill="#9cb0bc" font-size="9">${esc(shortTime(records[0].timeUtc))}</text><text x="296" y="79" text-anchor="end" fill="#9cb0bc" font-size="9">${esc(shortTime(records.at(-1).timeUtc))} UTC+8</text></svg><p class="live-event-boundary">${notice ? '圆点表示官方状态通报发布时间，坐标表示火山目录位置；不等于喷发时间或监测台站。' : '圆点只表示资料包含的报告时刻；横轴不是连续观测，点间不补位置或强度。'}</p>${rows}</section>`;
}

/** feedOrEvents supplies distinct quake events for a real magnitude/time scatter, not a waveform. */
export function eventSeriesMarkup(event, index = 0, feedOrEvents = null) {
  const { records, i, obs } = selected(event, index);
  return `<div class="live-event-series" data-event-id="${esc(event.id)}" data-observed-time="${esc(obs.timeUtc)}">${event.kind === 'quake' ? quakeScatter(event, feedOrEvents) + depthChart(event, obs) : reportTimeline(event, records, i)}</div>`;
}
