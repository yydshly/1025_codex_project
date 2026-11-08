import {formatTideUtc} from './tide-observations.js';

const tau = Math.PI * 2;

export function tideTeachingFrame(phase, progress) {
 const fraction = Math.max(0, Math.min(1, progress));
 // Start at a low point. One rotation visits both idealized high zones.
 const turn = (phase === 'forces' ? tau : Math.PI) * fraction;
 const level = (1 - Math.cos(2 * turn)) / 2;
 return {turn, level, rising: Math.sin(2 * turn) >= 0};
}

export function createTideLesson(host, {onPreview, onSeek}) {
 const shoreStage = document.createElement('figure');
 shoreStage.className = 'tide-shore-stage';
 shoreStage.hidden = true;
 shoreStage.innerHTML = `
  <figcaption><span>同一片浅滩 · 教学剖面</span><strong id="tide-shore-state"></strong></figcaption>
  <svg id="tide-lesson-impact" viewBox="0 0 258 114" role="img" aria-label="海岸剖面，高潮和低潮参考线标出浅滩在两个水位下的淹没范围">
   <defs>
    <linearGradient id="tide-shore-land" x2="0" y2="1">
     <stop stop-color="#bc9b70"/><stop offset="1" stop-color="#544334"/>
    </linearGradient>
    <linearGradient id="tide-shore-water" x2="0" y2="1">
     <stop stop-color="#5bc3cd" stop-opacity=".63"/><stop offset="1" stop-color="#23577c" stop-opacity=".88"/>
    </linearGradient>
   </defs>
   <path d="M0 17H55L108 65L160 72L195 99H258V114H0Z" fill="url(#tide-shore-land)" stroke="#e2bd89" stroke-width=".65"/>
   <path d="M94 52H258M178 86H258" class="tide-lesson-guide"/>
   <rect id="tide-lesson-water" y="86" width="258" height="28" fill="url(#tide-shore-water)"/>
   <line id="tide-lesson-waterline" x2="258" stroke="#aafaf3" stroke-width="1.1"/>
   <circle id="tide-lesson-shore-dot" r="2.2" fill="#ffd79f"/>
   <path d="M130 69L117 91" stroke="#ffe0a9" stroke-width=".5"/>
   <text x="116" y="100" text-anchor="middle">潮间带浅滩</text>
   <text x="239" y="48" text-anchor="end">高潮参考线</text>
   <text x="239" y="83" text-anchor="end">低潮参考线</text>
   <path id="tide-lesson-depth" fill="none" stroke="#ffe3b1" stroke-width=".65"/>
   <text x="250" y="108" text-anchor="end">航道水深</text>
  </svg>`;
 host.append(shoreStage);
 const section = document.createElement('section');
 section.className = 'tide-lesson';
 section.hidden = true;
 section.setAttribute('aria-label', '潮汐原理与沿岸影响');
 section.innerHTML = `
  <div class="tide-lesson-heading"><span id="tide-lesson-stage"></span><h3 id="tide-lesson-title"></h3></div>
  <div class="tide-lesson-reading"><strong id="tide-lesson-reading"></strong><span id="tide-lesson-explain"></span></div>
  <div class="tide-lesson-diagrams">
  <svg id="tide-lesson-curve" viewBox="0 0 258 88" role="img" aria-label="金点是示意海岸的当前水位，两个波峰代表模型中的两次高潮">
   <rect class="tide-lesson-cycle" x="14" y="17" width="116.5" height="49" rx="3" fill="#417c83" opacity=".19"/>
   <path d="M14 22H247M14 61H247" class="tide-lesson-guide"/>
   <path id="tide-lesson-curve-line" fill="none" stroke="#80eae1" stroke-width="2"/>
   <text x="72" y="14" text-anchor="middle">第一次高潮</text><text x="189" y="14" text-anchor="middle">第二次高潮</text>
   <line id="tide-lesson-cursor" y1="13" y2="68" stroke="#ffd79f" stroke-opacity=".45"/>
   <circle id="tide-lesson-curve-dot" r="4" fill="#ffd79f"/>
   <text x="14" y="84">一次示意自转</text><text x="247" y="84" text-anchor="end">相对水位</text>
  </svg>
  </div>
  <div class="tide-lesson-controls">
   <label for="tide-lesson-scrub">拖动对比涨落</label><span class="tide-lesson-scrub-hint">操作时暂停讲解</span>
   <input id="tide-lesson-scrub" type="range" min="0" max="100" step="1" value="0">
   <div class="tide-lesson-compare" role="group" aria-label="比较两个水位">
    <button type="button" id="tide-lesson-low">看低潮</button><button type="button" id="tide-lesson-high">看高潮</button>
   </div>
  </div>
  <p id="tide-lesson-caption"></p>
  <div class="tide-lesson-actions"><button type="button" id="tide-lesson-harbor">去旧金山港看实测 →</button><a href="https://oceanservice.noaa.gov/facts/moon-tide.html" target="_blank" rel="noopener noreferrer">NOAA 原理 ↗</a></div>`;
 host.append(section);
 const get = id => section.querySelector('#tide-lesson-' + id);
 const dot = get('curve-dot'), cursor = get('cursor'), scrub = get('scrub');
 const shoreState = shoreStage.querySelector('#tide-shore-state');
 const [water, line, shoreDot, depth] = ['water','waterline','shore-dot','depth']
  .map(id => shoreStage.querySelector('#tide-lesson-' + id));
 const x = progress => 14 + 233 * progress;
 const y = level => 61 - 39 * level;
 get('curve-line').setAttribute('d', Array.from({length:81}, (_,i)=>
  `${i ? 'L' : 'M'}${x(i / 80).toFixed(2)} ${y(tideTeachingFrame('forces',i / 80).level).toFixed(2)}`).join(' '));
 let active = null;
 let reading = '';
 scrub.addEventListener('input', () => onPreview(Number(scrub.value) / 100));
 scrub.addEventListener('change', () => onSeek(Number(scrub.value) / 100));
 get('low').addEventListener('click', () => onSeek(0));
 get('high').addEventListener('click', () => onSeek(active === 'forces' ? .25 : .5));
 function show(phase) {
  if (active === phase) return false;
  active = phase;
  section.hidden = !phase;
  shoreStage.hidden = !phase || phase === 'forces';
  reading = '';
  if (!phase) {
   delete document.body.dataset.tideLesson;
   return true;
  }
  document.body.dataset.tideLesson = phase;
  const forces = phase === 'forces';
  get('curve').toggleAttribute('hidden', phase === 'intro');
  get('stage').textContent = forces ? '02 / 地月原理 · 教学示意'
   : phase === 'intro' ? '01 / 先看现象 · 教学示意' : '03 / 水线对照 · 教学示意';
  get('title').textContent = forces ? '潮汐是海水周期性涨落'
   : phase === 'intro' ? '同一片浅滩，为什么时隐时现？' : '水线上移，浅滩逐渐被淹没';
  get('explain').textContent = forces ? '金点代表一处海岸，青色标出海面隆起。'
   : '看金点沿岸坡移动，比较同一片浅滩在两条参考线下的样子。';
  get('caption').textContent = forces
   ? '曲线展示理想海面。实际海岸的潮型和高潮时刻随地点而异。海面高差与天体尺度已放大。'
   : phase === 'intro' ? '接下来拉远看地球和月球，找出涨落的周期从哪里来。'
   : '接下来到旧金山港，用当地水位记录核对涨落时刻。';
  return true;
 }
 function update(progress, frame) {
  if (!active) return;
  const state = frame.level > .94 ? '高潮' : frame.level < .06 ? '低潮' : frame.rising ? '涨潮' : '落潮';
  const level = 86 - 34 * frame.level;
  const detail = active === 'forces'
   ? frame.level > .94 && frame.highSide ? state + ' · ' + frame.highSide : state
   : state + ' · ' + (level <= 65 ? '浅滩被淹没' : level >= 72 ? '浅滩露出' : '水线经过浅滩');
  if (reading !== detail) {
   reading = detail;
   get('reading').textContent = detail;
   shoreState.textContent = detail;
   scrub.setAttribute('aria-valuetext', detail);
   section.dataset.waterState = state;
  }
  const percent = Math.round(progress * 100);
  if (scrub.value !== String(percent)) scrub.value = percent;
  const cursorX = x(active === 'forces' ? progress : progress / 2);
  dot.setAttribute('cx', cursorX);
  dot.setAttribute('cy', y(frame.level));
  cursor.setAttribute('x1', cursorX);
  cursor.setAttribute('x2', cursorX);
  if (active === 'forces') return;
  const shore = level < 65 ? 55 + (level - 17) * 53 / 48
   : level <= 72 ? 108 + (level - 65) * 52 / 7
   : 160 + (level - 72) * 35 / 27;
  water.setAttribute('x', shore);
  water.setAttribute('width', 258 - shore);
  water.setAttribute('y', level);
  water.setAttribute('height', 114 - level);
  line.setAttribute('x1', shore);
  line.setAttribute('y1', level);
  line.setAttribute('y2', level);
  shoreDot.setAttribute('cx', shore);
  shoreDot.setAttribute('cy', level);
  depth.setAttribute('d', `M217 ${level}h12m-6 0V98m-6 0h12`);
 }
 return {show, update, harborButton:get('harbor')};
}

export function createTideRecap(host, onSelect) {
 const panel = document.createElement('section');
 panel.className = 'observation-recap tide-recap';
 panel.hidden = true;
 panel.setAttribute('aria-label', '潮汐导览结论');
 panel.innerHTML = `
  <div><span>结论 · 旧金山港实测</span><h2>月落时，港口水位仍在上涨</h2>
  <p>月升和月落看地平线。港口的涨落看验潮记录。</p></div>
  <div class="observation-recap-actions"><button type="button"></button><button type="button"></button></div>`;
 host.before(panel);
 const buttons = [...panel.querySelectorAll('button')];
 for (const button of buttons) button.addEventListener('click', () => onSelect(button.dataset.time));
 const select = time => {
  for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.time === time));
 };
 return {
  panel,
  select,
  hide() {
   if (panel.hidden) return;
   panel.hidden = true;
   delete document.body.dataset.tideRecap;
  },
  show(data) {
   if (!panel.hidden) return null;
   const {moonSetBracket,observedMax} = data?.moments ?? {};
   const observed = data?.series.find(series => series.id === 'observed')?.samples ?? [];
   const from = observed.find(sample => sample.timeUtc === moonSetBracket?.fromUtc);
   const to = observed.find(sample => sample.timeUtc === moonSetBracket?.toUtc);
   if (!Number.isFinite(from?.value) || !Number.isFinite(to?.value) || !Number.isFinite(observedMax?.valueM)) return null;
   buttons[0].textContent = `月落 · ${formatTideUtc(from.timeUtc)}–${formatTideUtc(to.timeUtc)} UTC · ${from.value.toFixed(3)} → ${to.value.toFixed(3)} m`;
   buttons[1].textContent = `实测最高 · ${formatTideUtc(observedMax.timeUtc)} UTC · ${observedMax.valueM.toFixed(3)} m`;
   buttons[0].dataset.time = to.timeUtc;
   buttons[1].dataset.time = observedMax.timeUtc;
   select(to.timeUtc);
   panel.hidden = false;
   document.body.dataset.tideRecap = 'true';
   return to.timeUtc;
  },
 };
}

