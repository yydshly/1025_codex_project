import { concepts } from './data/concepts.js';
import { media, keyframes, sourceReference, conceptVisuals } from './data/media.js';
import { execution } from './data/execution.js';
import { conceptGeneration } from './data/concept-generation.js';
import { understanding, principles, conversation, pipeline, standards, promptTemplates, findings, sourceInfo } from './data/research.js';

const $ = (selector, base = document) => base.querySelector(selector);
const $$ = (selector, base = document) => [...base.querySelectorAll(selector)];
const h = (value = '') => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const number = value => String(value).padStart(2, '0');
const asText = value => Array.isArray(value) ? value.join('；') : String(value ?? '');
const list = values => `<ul>${(values || []).map(value => `<li>${h(value)}</li>`).join('')}</ul>`;
const state = { category: '全部', search: '', template: 'image', pipeline: 0, concept: null, detailTab: 'summary', film: 'coastal-scroll-splice-v1' };
let toastTimer;
let lastConceptTrigger;

function notify(message) {
  const toast = $('#toast');
  const host = $('dialog[open]') || document.body;
  if (toast.parentElement !== host) host.append(toast);
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

async function copyText(text) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(text);
    notify('已复制，可以粘贴到你的制作工具。');
  } catch {
    const focused = document.activeElement;
    const temporary = document.createElement('textarea');
    temporary.value = text;
    temporary.style.cssText = 'position:fixed;left:-10000px;top:0';
    ($('dialog[open]') || document.body).append(temporary);
    temporary.select();
    const copied = document.execCommand('copy');
    temporary.remove();
    if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
    notify(copied ? '已复制，可以粘贴到你的制作工具。' : '复制未成功，请选择提示词文本手动复制。');
  }
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const motionTrialFilmIds = ['coastal-scroll-splice-v1', 'coastal-scroll-kling4-v1', 'coastal-scroll-seedance2-v1'];
const filmOrder = [...motionTrialFilmIds, 'coastal-scroll-kling4-b-v1', 'complete-ride', 'motion-native', 'motion-paced', 'static-720', 'static-1080', 'shot-a', 'shot-b'];
const films = filmOrder.map(id => media.find(film => film.id === id)).filter(Boolean);
const requestedFilm = new URLSearchParams(location.search).get('film');
if (films.some(film => film.id === requestedFilm)) state.film = requestedFilm;

function motionTrialFor(concept) {
  const trial = concept?.motionTrial;
  return concept?.id === 'coastal-scroll' && motionTrialFilmIds.includes(trial?.mediaId) && films.some(film => film.id === trial.mediaId) ? trial : null;
}

function motionTrialStatus(trial) {
  if (trial?.multiClip === true) return '已有多段拼接试片 · 完整方案待验证';
  return trial ? '已有5秒短样 · 完整方案待验证' : '目标10秒 · 视频待验证';
}

function renderFilms() {
  $('#film-list').innerHTML = films.map(film => `<button class="film-item" data-film="${h(film.id)}" aria-pressed="${film.id === state.film}"><img src="${h(film.poster)}" alt="" loading="lazy" width="128" height="80"><span><strong>${h(film.title)}</strong><small>${Number(film.duration).toFixed(3)}s · ${film.height}p · ${film.kind === 'editorial-derivative' ? '剪辑派生' : 'AI原片'}</small></span></button>`).join('');
  renderFilmRecord();
}

function renderFilmRecord(changeSource = true) {
  const film = films.find(item => item.id === state.film) || films[0];
  if (!film) return;
  const player = $('#film-player');
  if (changeSource) {
    player.pause();
    player.poster = film.poster;
    player.src = film.src;
    player.load();
  }
  player.setAttribute('aria-label', film.title);
  $('#film-kind').textContent = film.kind === 'editorial-derivative' ? '剪辑派生' : 'AI原片';
  $('#film-meta').textContent = `${Number(film.duration).toFixed(3)}s · ${film.width}×${film.height} · ${film.fps}fps`;
  $('#film-download').href = film.src;
  $('#film-counter').textContent = `${number(films.indexOf(film) + 1)} / ${number(films.length)}`;
  $('#film-observation').innerHTML = `<p><b>实际观察</b>${h(film.observation)}</p><p><b>保留的限制</b>${h(film.limit)}</p>`;
  const actual = execution[film.id];
  const actualInputRole = actual?.inputRole || (actual ? `${actual.firstFrameRole} → ${actual.endFrameRole}` : '');
  const seamTime = Number.isFinite(film.seamTime) ? `<dt>实际拼接点</dt><dd>${film.seamTime.toFixed(3)} 秒 · 多段生成片经剪辑拼接，非原生单镜头</dd>` : '';
  const seamImage = film.seamImage ? `<button type="button" class="text-link image-open" data-image="${h(film.seamImage)}" data-caption="${h(film.title)} · 接缝分析图，用于比较拼接前后画面">查看接缝图 ↗</button>` : '';
  const seamPreview = film.seamPreview ? `<a class="text-link" href="${h(film.seamPreview)}">查看接点前后各1秒（剪辑摘录） ↗</a>` : '';
  $('#film-record-content').innerHTML = `<dl><dt>输入角色</dt><dd>${h(film.actualInputRole)}</dd><dt>任务记录</dt><dd>${h(film.taskId || (film.sourceTaskIds || []).join(' + '))}</dd><dt>实际费用</dt><dd>${film.cost === null ? '未确认 / 派生版不重复计算底片费用' : `${h(film.cost)} 积分（已确认）`}</dd><dt>说明</dt><dd>${h(film.caption)}</dd>${seamTime}</dl>${seamImage}${seamPreview}${actual ? `<details><summary>历史实际提交提示词</summary><p>${h(actual.model)} · ${h(actualInputRole)}</p><pre>${h(actual.prompt)}</pre></details>` : ''}`;
  $$('.film-item').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.film === film.id)));
}

$('#film-list').addEventListener('click', event => {
  const button = event.target.closest('[data-film]');
  if (!button || button.dataset.film === state.film) return;
  state.film = button.dataset.film;
  renderFilmRecord();
});
$('#film-player').addEventListener('error', () => notify('视频暂时无法读取，可以使用下载链接检查原件。'));

function renderConversation() {
  $('#conversation').innerHTML = conversation.map((item, index) => `<article class="conversation-item"><span class="conversation-index">${number(index + 1)}</span><div><h3>${h(item.stage.replace(/^\d+\s*[·.、]\s*/, ''))}</h3><p class="intent">${h(item.userIntent)}</p><p>${h(item.decision)}</p><details><summary>展开当时的证据与判断</summary><p><b>实际证据：</b>${h(item.evidence)}</p><p class="lesson">${h(item.lesson)}</p></details></div></article>`).join('');
  $('#keyframes').innerHTML = keyframes.map(frame => `<figure class="keyframe"><button class="image-open" data-image="${h(frame.src)}" data-caption="${h(frame.caption)}" aria-label="放大查看${h(frame.title)}"><img src="${h(frame.src)}" alt="${h(frame.role)}" loading="lazy" width="1672" height="941"></button><figcaption><b>${h(frame.title)}</b><p>${h(frame.role)}</p></figcaption></figure>`).join('');
}

function renderPipeline() {
  $('#pipeline-tabs').innerHTML = pipeline.map((item, index) => `<button class="pipeline-tab" role="tab" id="pipeline-tab-${index}" aria-controls="pipeline-detail" aria-selected="${index === state.pipeline}" tabindex="${index === state.pipeline ? 0 : -1}" data-pipeline="${index}"><span>${number(index + 1)}</span>${h(item.title.replace(/^\d+\s*[·.、]\s*/, ''))}</button>`).join('');
  updatePipeline();
}

function updatePipeline() {
  const item = pipeline[state.pipeline];
  if (!item) return;
  const panel = $('#pipeline-detail');
  panel.setAttribute('aria-labelledby', `pipeline-tab-${state.pipeline}`);
  panel.innerHTML = `<div><h3>${h(item.title)}</h3><p>${h(item.body)}</p></div><div class="pipeline-output"><p><b>留下什么</b>${h(asText(item.output))}</p><p><b>这一关问自己</b>${h(asText(item.check))}</p></div>`;
  $$('.pipeline-tab').forEach((button, index) => { button.setAttribute('aria-selected', String(index === state.pipeline)); button.tabIndex = index === state.pipeline ? 0 : -1; });
}

$('#pipeline-tabs').addEventListener('click', event => {
  const button = event.target.closest('[data-pipeline]');
  if (!button) return;
  state.pipeline = Number(button.dataset.pipeline);
  updatePipeline();
});

function updateTemplate() {
  $('#template-text').textContent = promptTemplates[state.template];
  $('#template-content').setAttribute('aria-labelledby', `template-tab-${state.template}`);
  $$('[data-template]').forEach(button => { const selected = button.dataset.template === state.template; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
}
$('.template-tabs').addEventListener('click', event => {
  const button = event.target.closest('[data-template]');
  if (!button) return;
  state.template = button.dataset.template;
  updateTemplate();
});
$('#copy-template').addEventListener('click', () => copyText(promptTemplates[state.template]));

function wireTabKeys(container) {
  container.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const buttons = $$('[role="tab"]', container);
    const index = buttons.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
    buttons[next].click();
  });
}
wireTabKeys($('#pipeline-tabs'));
wireTabKeys($('.template-tabs'));

function renderConceptFilters() {
  const categories = ['全部', ...new Set(concepts.map(concept => concept.category))];
  $('#category-filters').innerHTML = categories.map(category => `<button class="filter-button" data-category="${h(category)}" aria-pressed="${category === state.category}">${h(category)}</button>`).join('');
}

function renderConcepts() {
  const search = state.search.trim().toLocaleLowerCase();
  const selected = concepts.filter(concept => (state.category === '全部' || concept.category === state.category) && (!search || [concept.title, concept.subtitle, concept.premise, concept.worldRule, concept.camera, concept.tone, concept.category, ...concept.acceptance].join(' ').toLocaleLowerCase().includes(search)));
  $('#concept-grid').innerHTML = selected.map(concept => {
    const trial = motionTrialFor(concept);
    const status = motionTrialStatus(trial);
    return `<button class="concept-card" data-concept="${h(concept.id)}" aria-label="打开${h(concept.title)}的基础设计"><div class="image-wrap"><img src="./${h(concept.image.replace(/^\.\//, ''))}" alt="${h(concept.title)}的扩展概念视觉，${h(status)}" loading="lazy" width="1536" height="864"><span class="concept-number">${number(concepts.indexOf(concept) + 1)}</span><span class="concept-category">${h(concept.category)}</span></div><div class="concept-copy"><div class="concept-title-row"><h3>${h(concept.title)}</h3><span aria-hidden="true">↗</span></div><p class="subtitle">${h(concept.subtitle)}</p><p class="premise">${h(concept.premise)}</p><div class="concept-card-footer"><span>${h(status)}</span><span>打开设计档案 →</span></div></div></button>`;
  }).join('');
  $('#concept-count').textContent = `共显示${selected.length}个创作方向`;
  $('#concept-empty').hidden = selected.length !== 0;
  $$('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === state.category)));
}

$('#category-filters').addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (button) { state.category = button.dataset.category; renderConcepts(); } });
$('#concept-search').addEventListener('input', event => { state.search = event.target.value; renderConcepts(); });
$('#concept-grid').addEventListener('click', event => {
  const button = event.target.closest('[data-concept]');
  if (!button) return;
  lastConceptTrigger = button;
  location.hash = `concept/${button.dataset.concept}`;
});

function openConcept(id) {
  const concept = concepts.find(item => item.id === id);
  if (!concept) { notify('没有找到这个方向，请从提案列表选择。'); return; }
  const dialog = $('#concept-dialog');
  const same = state.concept?.id === id;
  state.concept = concept;
  const visual = conceptVisuals.find(item => item.id === id);
  const generatedVisual = conceptGeneration[id];
  const trial = motionTrialFor(concept);
  const multiClip = trial?.multiClip === true;
  const trialLink = trial ? `<a class="button button-outline" href="./index.html?film=${encodeURIComponent(trial.mediaId)}#screening">${h(trial.label || (multiClip ? '观看两段拼接试片' : '观看5秒运动短样'))} →</a>` : '';
  const trialBoundary = multiClip ? '已有多段生成片经剪辑拼接，非原生单镜头；完整10秒设计与验收条件仍待逐项验证。' : '已有关联5秒运动短样；下方保留完整10秒设计与验收条件，不代表完整方案已通过验收。';
  if (!same) state.detailTab = 'summary';
  $('#concept-dialog-body').innerHTML = `
    <div class="concept-detail-top"><figure><img src="./${h(concept.image.replace(/^\.\//, ''))}" alt="${h(concept.title)}概念视觉" width="1536" height="864"><figcaption>${h(concept.imageCaption)}。${trial ? (multiClip ? '已有多段拼接试片；完整设计仍需验证。' : '已用于关联运动短样；完整10秒设计仍需验证。') : '概念图可以展示高潮；下方首帧要求需另行制作与检查。'}</figcaption></figure><div><span class="small-label">${number(concepts.indexOf(concept) + 1)} / ${h(concept.category)}</span><h2 id="concept-dialog-title">${h(concept.title)}</h2><p class="concept-lead">${h(concept.premise)}</p><div class="detail-tags"><span class="detail-tag">${h(concept.status)}</span><span class="detail-tag">${multiClip ? '多段拼接 / 原10秒设计待验证' : '目标10秒 / 720p短样起步'}</span></div>${trialLink}</div></div>
    <div class="visual-review"><p><b>概念图观察</b>${h(visual?.observation || concept.imageCaption)}</p><p><b>当前边界</b>${h(visual?.limit || '仅为概念视觉，动态关系待验证。')}</p></div>
    <div class="detail-tab-bar" role="tablist" aria-label="方向设计内容"><button role="tab" id="detail-tab-summary" aria-controls="detail-summary" data-detail-tab="summary">艺术方向</button><button role="tab" id="detail-tab-shots" aria-controls="detail-shots" data-detail-tab="shots">动作与摄影</button><button role="tab" id="detail-tab-image" aria-controls="detail-image" data-detail-tab="image">首图提示词</button><button role="tab" id="detail-tab-video" aria-controls="detail-video" data-detail-tab="video">视频与验收</button></div>
    <section class="detail-panel" id="detail-summary" role="tabpanel" aria-labelledby="detail-tab-summary"><div class="world-rule"><span>这个世界的一条规则</span><p>${h(concept.worldRule)}</p></div><div class="detail-two-col"><div><div class="detail-block"><h3>观众会得到什么</h3><p>${h(concept.viewerReward)}</p></div><div class="detail-block"><h3>情绪与表达</h3><p>${h(concept.tone)}</p></div><div class="detail-block"><h3>首先做哪次小试验</h3><p>${h(concept.nextTest)}</p></div></div><div><div class="detail-block"><h3>氛围设计</h3><div class="atmosphere-grid">${Object.entries({ light: '光线', color: '色彩', sound: '声音意图', emotion: '感受走向' }).map(([key, label]) => `<div class="atmosphere-cell"><b>${label}</b><p>${h(concept.atmosphere[key])}</p></div>`).join('')}</div></div><p class="prompt-footnote">制作复杂度：${h(concept.difficulty)}。这是设计判断，不是模型成功率。</p></div></div></section>
    <section class="detail-panel" id="detail-shots" role="tabpanel" aria-labelledby="detail-tab-shots"><div class="detail-two-col"><div class="detail-block"><h3>人物与道具</h3><p>${h(concept.identity)}</p></div><div class="detail-block"><h3>地面路线</h3><p>${h(concept.route)}</p></div></div><div class="detail-block"><h3>摄影总设计</h3><p>${h(concept.camera)}</p></div><div class="beat-list">${concept.actionBeats.map(beat => `<article class="beat"><strong>${h(beat.time)}</strong><div><b>人物行动</b><p>${h(beat.action)}</p></div><div><b>相机怎么走</b><p>${h(beat.camera)}</p></div><div><b>景观如何回应</b><p>${h(beat.environment)}</p></div></article>`).join('')}</div><p class="prompt-footnote" style="margin-top:18px">分秒是设计节奏。实际生成后，按动作和空间是否成立决定剪点。</p></section>
    <section class="detail-panel" id="detail-image" role="tabpanel" aria-labelledby="detail-tab-image"><div class="detail-block"><h3>真正的起始画面</h3><p>${h(concept.firstFrame)}</p></div><p class="prompt-footnote">${trial ? (multiClip ? '上方概念图用于前段生成，后段依据前段真实末帧续接；各段实际输入见影片参数，下方保留完整方案的首帧设计。' : '上方概念图已用于5秒运动短样；下方保留完整方案的首帧设计，实际短样输入见影片参数。') : '上方配图表达概念方向，可能已经展示高潮；这份提示词用于后续单独制作首帧。'}</p><div class="prompt-box"><pre>${h(concept.imagePrompt)}</pre><button class="button button-dark" data-copy-prompt="image">复制首图提示词 <span>⧉</span></button></div><div class="detail-block"><h3>人物控制先固定什么</h3><p>${h(concept.identity)}</p><p>${h(concept.route)}</p></div></section>
    <section class="detail-panel" id="detail-video" role="tabpanel" aria-labelledby="detail-tab-video"><p class="prompt-footnote">${trial ? trialBoundary : '目标为10秒方案，可先做5秒、720p单一假设短样；参考素材职责与实际工具能力需在执行时核对。'}</p><div class="prompt-box"><pre>${h(concept.videoPrompt)}</pre><button class="button button-dark" data-copy-prompt="video">复制视频提示词 <span>⧉</span></button></div><div class="detail-two-col"><div class="detail-block"><h3>怎么判断成立</h3>${list(concept.acceptance)}</div><div class="detail-block"><h3>重点盯住的偏差</h3>${list(concept.risks)}</div></div><div class="world-rule"><span>下一次最小验证</span><p>${h(concept.nextTest)}</p></div></section>
    <div class="detail-panel detail-footer"><span>${trial ? motionTrialStatus(trial) : '扩展提案 / 概念图与脚本 · 视频运动尚未验证'}</span><button class="button button-outline" data-export-concept>导出本方向设计 JSON ↓</button></div>`;
  updateDetailTabs();
  if (generatedVisual) {
    const record = document.createElement('details');
    record.className = 'actual-visual-prompt';
    record.innerHTML = `<summary>查看当前概念图实际生成指令（与后续首帧设计分开）</summary><p>${h(generatedVisual.tool)} · ${h(generatedVisual.referenceRole)}</p><pre>${h(generatedVisual.prompt)}</pre><button class="button button-outline" data-copy-prompt="concept">复制概念图实际指令 ⧉</button>`;
    $('#detail-image').append(record);
  }
  wireTabKeys($('.detail-tab-bar', dialog));
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('modal-open');
  dialog.scrollTop = 0;
}

function updateDetailTabs() {
  const dialog = $('#concept-dialog');
  $$('[data-detail-tab]', dialog).forEach(button => { const selected = button.dataset.detailTab === state.detailTab; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
  $$('.detail-panel[role="tabpanel"]', dialog).forEach(panel => { panel.hidden = panel.id !== `detail-${state.detailTab}`; });
}

$('#concept-dialog').addEventListener('click', event => {
  const tab = event.target.closest('[data-detail-tab]');
  if (tab) { state.detailTab = tab.dataset.detailTab; updateDetailTabs(); }
  const copy = event.target.closest('[data-copy-prompt]');
  if (copy && state.concept) copyText(copy.dataset.copyPrompt === 'image' ? state.concept.imagePrompt : copy.dataset.copyPrompt === 'concept' ? conceptGeneration[state.concept.id].prompt : state.concept.videoPrompt);
  if (event.target.closest('[data-export-concept]') && state.concept) {
    const trial = motionTrialFor(state.concept);
    const recordType = trial?.multiClip === true ? 'Concept design with archived multi-clip editorial trial; full design not verified; not a native single take' : trial ? 'Concept design with archived 5s motion trial; full 10s sequence not verified' : 'Concept design; video not verified';
    downloadJson(`${state.concept.id}-design.json`, { ...state.concept, conceptVisual: conceptVisuals.find(item => item.id === state.concept.id), conceptImageGeneration: conceptGeneration[state.concept.id], recordType, exportedAt: new Date().toISOString() });
  }
});

function syncHash() {
  const match = location.hash.match(/^#concept\/([a-z0-9-]+)$/);
  if (match) openConcept(match[1]);
  else if ($('#concept-dialog').open) $('#concept-dialog').close();
}
window.addEventListener('hashchange', syncHash);
$('#concept-dialog').addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (location.hash.startsWith('#concept/')) history.replaceState(null, '', `${location.pathname}${location.search}#concepts`);
  const fromCard = lastConceptTrigger?.isConnected;
  const target = fromCard ? lastConceptTrigger : $(`[data-concept="${state.concept?.id}"]`);
  if (target) {
    target.focus({ preventScroll: true });
    if (!fromCard) target.scrollIntoView({ block: 'center' });
  } else $('#concept-search').focus();
  lastConceptTrigger = null;
});

document.addEventListener('click', event => {
  const close = event.target.closest('[data-close-dialog]');
  if (close) document.getElementById(close.dataset.closeDialog)?.close();
  const trigger = event.target.closest('[data-image]');
  if (trigger) {
    const image = $('#expanded-image');
    image.src = trigger.dataset.image;
    image.alt = trigger.dataset.caption || trigger.getAttribute('aria-label') || '研究图片';
    $('#expanded-caption').textContent = trigger.dataset.caption || '';
    $('#image-dialog').showModal();
    document.body.classList.add('modal-open');
  }
});
$('#image-dialog').addEventListener('close', () => { if (!$('#concept-dialog').open) document.body.classList.remove('modal-open'); });
for (const dialog of $$('dialog')) dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});

function renderResearch() {
  $('#understanding-content').innerHTML = `
    <div class="understanding-intro"><div><span class="small-label">价值：景观探索体验 × 可复用导演方法</span><p class="understanding-value">${h(understanding.value)}</p><p class="understanding-mechanism">${h(understanding.mechanism)}</p></div><a class="overview-card" href="./overview.html"><img src="./assets/images/overview-v1.png" alt="专门生成的景观奇旅研究总览长图，涵盖原理、试验与产品方向" width="1024" height="1536" loading="lazy"><span>查看生成总览图 ↗<small>原图保留为首轮研究快照</small></span></a></div>
    <ol class="understanding-chain" aria-label="六个共同构成动态影像的环节">${understanding.stages.map((item, index) => `<li><span>${number(index + 1)}</span><h3>${h(item.title)}</h3><p>${h(item.body)}</p></li>`).join('')}</ol>
    <div class="capability-grid"><article><span class="small-label">本轮已经做到</span><h3>从首图到真实多段成片</h3><p>${h(understanding.achieved)}</p><a class="text-link" href="./index.html?film=coastal-scroll-splice-v1#screening">看11.04秒拼接与审片记录 ↓</a></article><article><span class="small-label">仍需人工判断</span><h3>约束意图，不等于精确控制</h3><p>${h(understanding.limits)}</p></article></div>
    <div class="summary-subheading"><h3>这些方法，可以往哪里长。</h3><p>近期可试验的内容，与尚待建设的产品。以下均不构成商业成品或收益承诺。</p></div>
    <div class="product-directions">${understanding.products.map(item => `<article><span class="small-label">${h(item.maturity)}</span><h4>${h(item.title)}</h4><p>${h(item.value)}</p><p class="direction-test">${h(item.test)}</p></article>`).join('')}</div>
    <details class="summary-practice"><summary>实用检查：怎样接续，什么信号说明要返修？</summary><div class="continuity-grid">${understanding.continuity.map(item => `<article><h4>${h(item.title)}</h4><p>${h(item.method)}</p><p class="failure-signal">${h(item.failure)}</p></article>`).join('')}</div></details>
    <details class="summary-practice"><summary>提示词骨架：一张首图与一段视频各写什么？</summary><div class="prompt-framework">${understanding.prompts.map(item => `<article><h4>${h(item.title)}</h4><p>${h(item.fields)}</p><p class="direction-test">${h(item.example)}</p></article>`).join('')}</div><a class="text-link" href="#method">进入完整流程与可复制模板 ↓</a></details>`;
  $('#principles').innerHTML = principles.map((item, index) => `<article class="principle"><span>${number(index + 1)}</span><h3>${h(item.title)}</h3><p>${h(item.body)}</p></article>`).join('');
  $('#standards-body').innerHTML = standards.map(item => `<tr><td>${h(item.title)}</td><td>${h(item.pass)}</td><td>${h(item.fail)}</td></tr>`).join('');
  const finding = item => `<article class="finding"><span>${h(item.status)}</span><h3>${h(item.title)}</h3><p>${h(item.evidence)}</p><p class="finding-limit">${h(item.limit)}</p></article>`;
  $('#findings').innerHTML = findings.slice(0, 6).map(finding).join('') + (findings.length > 6 ? `<details class="more-findings"><summary>展开另外 ${findings.length - 6} 项研究结论与未知项 ↓</summary><div class="findings-grid">${findings.slice(6).map(finding).join('')}</div></details>` : '');
}

$('#download-research').addEventListener('click', () => downloadJson('scenic-motion-research.json', {
  title: '景观奇旅 · AI影像创作实验室', publication: 'research-display', sourceInfo, sourceReference,
  understanding, principles, conversation, pipeline, standards, findings, promptTemplates, concepts, media, execution, conceptVisuals, conceptGeneration,
  note: 'Full concept designs remain unverified; archived motion trials are linked by concept.motionTrial. multiClip identifies an editorial splice of separate generated clips, not a native single take. Actual source clip was used for human analysis, not as a video-model input.'
}));

renderFilms();
renderConversation();
renderResearch();
renderPipeline();
updateTemplate();
renderConceptFilters();
renderConcepts();
syncHash();
