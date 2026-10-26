let groups = [];
let mapping = {};
const order = ['motion-design-showreel', 'typography-motion', 'knowledge-explainer', 'launch-film', 'creative-montage',
  'cinematic-scene', 'data-story', 'white-ui-launch', 'chaos-to-harmony', 'physics-ball-escape', 'story-short',
  'product-showcase', 'software-demo', 'rhythm-dance-video', 'step-tutorial', 'epic-mood-trailer',
  'game-trailer', 'promo-ad', 'event-recap', 'vlog-edit', 'news-explainer', 'ai-news-take',
  'tech-history-explainer', 'talking-head-highlights'];
const featuredIds = ['motion-design-showreel', 'knowledge-explainer', 'launch-film', 'creative-montage', 'cinematic-scene', 'typography-motion'];
const $ = (id) => document.getElementById(id);
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const seconds = (value) => `${Number(value.toFixed(1))} 秒`;
const groupName = (id) => groups.find((group) => group.id === mapping[id])?.title ?? '场景方向';
const outcomeNames = { passed: '通过', pass: '通过', completed: '完成', partial: '部分完成', failed: '未通过', pending: '待验证' };
let catalog;
let implementation;
let guide;
let overview;
let originalPrompts = {};
let scenes = [];
let selectedGroup = 'all';
let selectedMethod = 'all';
let selectedAvailability = 'all';
let currentSceneId;
let currentDialogTab = 'actual';
let currentFeatured;
let resumeFeatured = false;
let previousFocus;

function setFeatured(id) {
  const scene = scenes.find((item) => item.id === id);
  if (!scene?.localPreview) return;
  currentFeatured = scene;
  $('feature-video-error').hidden = true;
  const video = $('feature-video');
  video.pause();
  video.src = scene.localPreview;
  video.poster = scene.localCover;
  video.setAttribute('aria-label', `${scene.title}，官方视频预览`);
  $('featured-title').textContent = scene.title;
  $('featured-summary').textContent = `${scene.summary} · 预览 ${seconds(scene.measuredPreview.durationSeconds)}`;
  $('featured-method').textContent = `实际做法：${routeOf(scene).shortTitle}`;
  $('featured-kind').textContent = groupName(scene.id);
  $('featured-index').textContent = `${String(featuredIds.indexOf(id) + 1).padStart(2, '0')} / 06`;
  document.querySelectorAll('.featured-item').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.id === id)));
}

function card(scene, index) {
  const media = scene.localPreview;
  const duration = media ? seconds(scene.measuredPreview.durationSeconds) : null;
  const art = media ? `<img src="${escape(scene.localCover)}" alt="${escape(scene.title)}官方样片封面" loading="lazy" width="640" height="360"><span class="play-circle" aria-hidden="true">▶</span><span class="preview-duration">${duration} · ${scene.measuredPreview.hasAudio ? '含音轨' : '无音轨'}</span>`
    : `<div class="no-preview-art"><span class="art-label">TEMPLATE / 场景方向</span><strong>${escape(scene.title)}</strong><small>已提供模板说明 · 暂无公开视频</small></div>`;
  const route = routeOf(scene);
  return `<article class="scene-card"><button class="scene-card-button" data-scene="${escape(scene.id)}" aria-label="${media ? '观看' : '了解'}${escape(scene.title)}${media ? '官方预览' : '模板方向'}"><div class="scene-picture">${art}<span class="method-badge route-${route.id}">${escape(route.shortTitle)}</span></div><div class="card-topline"><span>${String(index + 1).padStart(2, '0')} / ${groupName(scene.id)}</span><span>${media ? '官方样片' : '仅模板说明'} ↗</span></div><h3>${escape(scene.title)}</h3><p class="card-description">${escape(scene.summary)}</p><p class="card-implementation">${escape(scene.implementation.headline)}</p><div class="card-tags">${(scene.tags ?? []).filter((tag) => tag !== '视频生成').slice(0, 3).map((tag) => `<span>${escape(tag)}</span>`).join('')}</div></button></article>`;
}

function routeOf(scene) { return implementation.routes.find((route) => route.id === scene.implementation.route); }

function renderMethods() {
  $('method-overview').innerHTML = implementation.routes.map((route) => {
    const count = scenes.filter((scene) => scene.implementation.route === route.id).length;
    const examples = route.exampleIds.map((id) => scenes.find((scene) => scene.id === id)?.title).filter(Boolean).join('、');
    return `<article class="method-card route-${route.id}"><div class="method-card-heading"><span>${route.number} / 实际路径</span><strong>${count}<small> 个方向</small></strong></div><h3>${escape(route.title)}</h3><p>${escape(route.summary)}</p><ol class="method-pipeline">${route.pipeline.map((step) => `<li>${escape(step)}</li>`).join('')}</ol><p class="method-principle">${escape(route.principle)}</p><p class="method-boundary">${escape(route.boundary)}</p><p class="method-examples">代表：${escape(examples)}</p><button type="button" class="method-explore" data-method-explore="${route.id}">看这 ${count} 个方向 <span>↓</span></button></article>`;
  }).join('');
  const options = [{ id: 'all', shortTitle: '全部做法' }, ...implementation.routes];
  $('method-filters').innerHTML = options.map((route) => `<button type="button" class="method-filter-button" data-method="${route.id}" aria-pressed="${route.id === selectedMethod}">${escape(route.shortTitle)}<span>${route.id === 'all' ? scenes.length : scenes.filter((scene) => scene.implementation.route === route.id).length}</span></button>`).join('');
  $('production-source').href = implementation.productionSource;
}

function resetFilters() { selectedGroup = 'all'; selectedMethod = 'all'; selectedAvailability = 'all'; $('availability-filter').value = 'all'; $('search').value = ''; renderGrid(); }

function updateURL() {
  const url = new URL(location.href);
  const state = { group: selectedGroup, method: selectedMethod, availability: selectedAvailability, q: $('search').value.trim(), scene: currentSceneId, tab: currentSceneId ? currentDialogTab : null };
  for (const [key, value] of Object.entries(state)) {
    if (value && value !== 'all' && !(key === 'tab' && value === 'actual')) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  history.replaceState(null, '', url);
}

function setDialogTab(tab, { focus = false } = {}) {
  currentDialogTab = ['actual', 'guide', 'source'].includes(tab) ? tab : 'actual';
  for (const id of ['actual', 'guide', 'source']) {
    const active = id === currentDialogTab;
    $(`panel-${id}`).hidden = !active;
    $(`tab-${id}`).setAttribute('aria-selected', String(active));
    $(`tab-${id}`).tabIndex = active ? 0 : -1;
  }
  if (focus) $(`tab-${currentDialogTab}`).focus({ preventScroll: true });
  updateURL();
}

function renderGuide(scene) {
  const profile = guide.routes[scene.implementation.route];
  const list = (items) => items.map((text) => `<li>${escape(text)}</li>`).join('');
  $('guide-scene-note').textContent = guide.sceneNotes[scene.id];
  $('guide-can-change').innerHTML = list(profile.canChange);
  $('guide-edit-location').textContent = profile.whereToChange;
  $('guide-prepare').innerHTML = list(profile.prepare);
  $('guide-first-test').innerHTML = list(profile.tryFirst);
  $('guide-check').innerHTML = list(profile.check);
  $('guide-effort').textContent = profile.effort;
  $('dialog-original-prompt').textContent = originalPrompts[scene.id] || '暂未载入原始提示，请使用下方原始文件入口。';
}

function navigationScenes() {
  const filtered = visibleScenes();
  return filtered.some((scene) => scene.id === currentSceneId) ? filtered : scenes;
}

function navigateScene(delta) {
  const list = navigationScenes();
  const index = list.findIndex((scene) => scene.id === currentSceneId) + delta;
  if (index >= 0 && index < list.length) openScene(list[index].id, { tab: currentDialogTab });
}

function renderImplementation(scene) {
  const entry = scene.implementation;
  const route = routeOf(scene);
  $('dialog-route-summary').innerHTML = `<span class="inline-method route-${route.id}">${escape(route.shortTitle)}</span><h3>${escape(entry.headline)}</h3><p>画面来源和动作来源分别核对；声音另行制作。</p>`;
  $('dialog-pipeline').innerHTML = entry.steps.map((step) => `<li>${escape(step)}</li>`).join('');
  $('dialog-mechanism').innerHTML = [['画面从哪来', entry.visual], ['动作怎么来', entry.motion], ['AI 做了什么', entry.aiRole], ['声音怎么来', entry.audio], ['怎样组合', entry.assembly]].map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('');
  $('dialog-limits').textContent = entry.limits;
  $('dialog-evidence').textContent = `官方记录摘录：“${entry.evidence}”`;
  $('dialog-evidence-source').href = `${scene.sourceUrl.replace('/tree/', '/blob/')}/template.json`;
}

function visibleScenes() {
  const query = $('search').value.trim().toLocaleLowerCase();
  return scenes.filter((scene) => (selectedGroup === 'all' || mapping[scene.id] === selectedGroup)
    && (selectedMethod === 'all' || scene.implementation.route === selectedMethod)
    && (selectedAvailability === 'all' || (selectedAvailability === 'video' && scene.localPreview) || (selectedAvailability === 'audio' && scene.measuredPreview?.hasAudio) || (selectedAvailability === 'notes' && !scene.localPreview))
    && `${scene.title} ${scene.summary} ${scene.description} ${(scene.tags ?? []).join(' ')} ${groupName(scene.id)} ${routeOf(scene).title} ${scene.implementation.headline} ${scene.implementation.motion} ${scene.implementation.aiRole} ${scene.implementation.audio}`.toLocaleLowerCase().includes(query));
}

function renderGrid() {
  const filtered = visibleScenes();
  $('scene-grid').innerHTML = filtered.map((scene) => card(scene, scenes.indexOf(scene))).join('');
  $('empty-state').hidden = filtered.length !== 0;
  const previews = filtered.filter((scene) => scene.localPreview).length;
  $('result-count').textContent = `${filtered.length} 个场景 · ${previews} 段官方预览${filtered.length > previews ? ` · ${filtered.length - previews} 个仅有模板` : ''}`;
  document.querySelectorAll('.filter-button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.group === selectedGroup)));
  document.querySelectorAll('.method-filter-button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.method === selectedMethod)));
  updateURL();
}

function openScene(id, { tab = 'actual', autoplay = true } = {}) {
  const scene = scenes.find((item) => item.id === id);
  if (!scene) return;
  if (!$('scene-dialog').open) {
    previousFocus = document.activeElement;
    resumeFeatured = !$('feature-video').paused;
  }
  currentSceneId = id;
  $('feature-video').pause();
  const media = Boolean(scene.localPreview);
  const video = $('dialog-video');
  video.pause();
  video.hidden = !media;
  if (media) { video.src = scene.localPreview; video.poster = scene.localCover; }
  else { video.removeAttribute('src'); video.removeAttribute('poster'); video.load(); }
  $('dialog-no-preview').hidden = media;
  $('dialog-preview-meta').textContent = media
    ? `官方预览节选 · ${seconds(scene.measuredPreview.durationSeconds)} · ${scene.measuredPreview.width} × ${scene.measuredPreview.height} · ${scene.measuredPreview.hasAudio ? '文件含音轨，可开启声音试听' : '此预览不含音轨'}。模板默认时长见右侧。`
    : '没有附带视频文件；这里展示的是模板方向，不代表已完成样片。';
  $('dialog-category').textContent = groupName(scene.id);
  $('dialog-kind').textContent = scene.kind === 'example' ? '作品示例 / 带有具体风格的创作提示' : '场景模板 / 根据你的内容确定方案';
  $('dialog-title').textContent = scene.title;
  $('dialog-description').textContent = scene.description || scene.summary;
  renderImplementation(scene);
  renderGuide(scene);
  const beats = scene.preview?.beats?.length ? scene.preview.beats : [scene.summary];
  $('dialog-beats').innerHTML = beats.map((beat) => `<li>${escape(beat)}</li>`).join('');
  $('dialog-inputs').innerHTML = (scene.fields?.length ? scene.fields.map((field) => field.label) : ['主题与创作要求']).map((field) => `<span>${escape(field)}</span>`).join('');
  $('dialog-defaults').textContent = `模板默认：${scene.ratio ?? '按需求'}${scene.durationSeconds ? ` / ${scene.durationSeconds} 秒` : ''}。实际时长与画幅按任务调整。`;
  const verification = scene.verification;
  const state = verification?.outcome;
  $('verification-title').textContent = verification ? `官方制作记录：${outcomeNames[state] ?? state ?? '已记录'} · ${verification.date ?? '日期未记录'}` : '官方制作记录：未附完整验收记录';
  $('verification-notes').textContent = verification?.notes || '该模板在当前固定版本没有附完整的制作验收记录。公开样片与实际可重复性需要分开判断。';
  document.querySelector('.original-prompt').open = false;
  $('dialog-prompt').href = `../research/upstream/templates/${scene.id}/prompt.md`;
  $('dialog-source').href = scene.sourceUrl;
  const list = navigationScenes();
  const index = list.findIndex((item) => item.id === id);
  $('dialog-position').textContent = `${index + 1} / ${list.length}`;
  $('dialog-prev').disabled = index <= 0;
  $('dialog-next').disabled = index >= list.length - 1;
  $('share-status').textContent = '';
  $('share-fallback').hidden = true;
  setDialogTab(tab);
  if (!$('scene-dialog').open) $('scene-dialog').showModal();
  $('scene-dialog').scrollTop = 0;
  document.body.classList.add('modal-open');
  if (media && autoplay) video.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
}

function closeScene() { $('scene-dialog').close(); }

async function init() {
  if (window.BAOCUT_RESEARCH_DATA) {
    ({ catalog, implementation, guide, overview, prompts: originalPrompts } = window.BAOCUT_RESEARCH_DATA);
  } else {
    const responses = await Promise.all([fetch('./catalog.json'), fetch('./implementation.json'), fetch('./guide.json'), fetch('./overview.json')]);
    for (const response of responses) if (!response.ok) throw new Error(`data: ${response.status}`);
    [catalog, implementation, guide, overview] = await Promise.all(responses.map((response) => response.json()));
  }
  if (new Set([catalog.commit, implementation.commit, guide.commit, overview.commit]).size !== 1) throw new Error('Source versions do not match');
  groups = [{ id: 'all', title: '全部效果' }, ...overview.groups.map(({ id, title }) => ({ id, title }))];
  mapping = Object.fromEntries(overview.groups.flatMap((group) => group.sceneIds.map((id) => [id, group.id])));
  const entries = new Map(implementation.scenes.map((entry) => [entry.id, entry]));
  scenes = catalog.templates.map((scene) => {
    if (!entries.has(scene.id)) throw new Error(`Missing implementation: ${scene.id}`);
    return { ...scene, implementation: entries.get(scene.id) };
  }).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const params = new URLSearchParams(location.search);
  if (groups.some((group) => group.id === params.get('group'))) selectedGroup = params.get('group');
  if (implementation.routes.some((route) => route.id === params.get('method'))) selectedMethod = params.get('method');
  if (['all', 'video', 'audio', 'notes'].includes(params.get('availability'))) selectedAvailability = params.get('availability');
  $('search').value = params.get('q') || '';
  $('availability-filter').value = selectedAvailability;
  renderMethods();
  renderCapabilityOverview(overview, scenes, {
    openScene,
    browse({ group = 'all', method = 'all' }) {
      resetFilters();
      selectedGroup = group;
      selectedMethod = method;
      renderGrid();
      location.hash = 'gallery';
      $('gallery-title').tabIndex = -1;
      $('gallery-title').focus({ preventScroll: true });
      $('gallery').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  });
  $('preview-count').textContent = scenes.filter((scene) => scene.localPreview).length;
  $('template-count').textContent = scenes.length;
  $('template-source').href = `https://github.com/JimLiu/baocut/tree/${catalog.commit}/templates`;
  $('featured-strip').innerHTML = featuredIds.map((id) => scenes.find((scene) => scene.id === id)).filter(Boolean).map((scene) => `<button class="featured-item" data-id="${escape(scene.id)}" aria-pressed="false" aria-label="切换到${escape(scene.title)}"><img src="${escape(scene.localCover)}" alt="" width="160" height="90"><span>${escape(scene.title)}</span></button>`).join('');
  $('category-filters').innerHTML = groups.map((group) => `<button class="filter-button" data-group="${group.id}" aria-pressed="${group.id === 'all'}">${group.title}<span>${group.id === 'all' ? scenes.length : scenes.filter((scene) => mapping[scene.id] === group.id).length}</span></button>`).join('');
  $('featured-strip').addEventListener('click', (event) => { const button = event.target.closest('[data-id]'); if (button) setFeatured(button.dataset.id); });
  $('feature-details').addEventListener('click', () => openScene(currentFeatured.id));
  $('category-filters').addEventListener('click', (event) => { const button = event.target.closest('[data-group]'); if (button) { selectedGroup = button.dataset.group; renderGrid(); } });
  $('method-filters').addEventListener('click', (event) => { const button = event.target.closest('[data-method]'); if (button) { selectedMethod = button.dataset.method; renderGrid(); } });
  $('method-overview').addEventListener('click', (event) => { const button = event.target.closest('[data-method-explore]'); if (button) { resetFilters(); selectedMethod = button.dataset.methodExplore; renderGrid(); $('gallery').scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
  $('reset-filters').addEventListener('click', resetFilters);
  $('availability-filter').addEventListener('change', () => { selectedAvailability = $('availability-filter').value; renderGrid(); });
  $('search').addEventListener('input', renderGrid);
  $('scene-grid').addEventListener('click', (event) => { const button = event.target.closest('[data-scene]'); if (button) openScene(button.dataset.scene); });
  $('dialog-close').addEventListener('click', closeScene);
  $('scene-dialog').addEventListener('click', (event) => { if (event.target === $('scene-dialog')) { const rect = $('scene-dialog').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeScene(); } });
  $('scene-dialog').addEventListener('close', () => { $('dialog-video').pause(); currentSceneId = undefined; document.body.classList.remove('modal-open'); if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); updateURL(); if (resumeFeatured) $('feature-video').play().catch(() => {}); });
  $('dialog-prev').addEventListener('click', () => navigateScene(-1));
  $('dialog-next').addEventListener('click', () => navigateScene(1));
  document.querySelector('.dialog-tabs').addEventListener('click', (event) => { const button = event.target.closest('[data-tab]'); if (button) setDialogTab(button.dataset.tab); });
  document.querySelector('.dialog-tabs').addEventListener('keydown', (event) => {
    const tabs = ['actual', 'guide', 'source'];
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.indexOf(currentDialogTab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
    setDialogTab(tabs[next], { focus: true });
  });
  $('copy-scene-link').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); $('share-status').textContent = '已复制当前页面链接'; }
    catch { $('share-fallback').value = location.href; $('share-fallback').hidden = false; $('share-fallback').focus(); $('share-fallback').select(); $('share-status').textContent = '请手动复制下方链接'; }
  });
  $('feature-video').addEventListener('error', () => { $('feature-video-error').hidden = false; });
  $('preparation-grid').innerHTML = guide.commonPreparation.map((item, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><h4>${escape(item.title)}</h4><p>${escape(item.text)}</p></article>`).join('');
  document.querySelectorAll('[data-open-scene]').forEach((button) => button.addEventListener('click', () => openScene(button.dataset.openScene)));
  initTeachingDemo();
  setFeatured(featuredIds[0]);
  renderGrid();
  const requested = params.get('scene');
  if (requested && scenes.some((scene) => scene.id === requested)) openScene(requested, { tab: params.get('tab') || 'actual', autoplay: false });
}

function initTeachingDemo() {
  const slider = $('demo-time');
  let frame;
  let playing = false;
  let lastTime;
  let playbackTime = 0;
  const render = () => {
    const milliseconds = Number(slider.value);
    const p = milliseconds / 6000;
    $('demo-output').value = `${(milliseconds / 1000).toFixed(1)} / 6.0 秒`;
    slider.setAttribute('aria-valuetext', `${(milliseconds / 1000).toFixed(1)} 秒，共 6 秒`);
    $('demo-ball').setAttribute('cx', String(40 + 220 * p));
    $('demo-ball').setAttribute('cy', String(100 - 45 * Math.abs(Math.sin(p * Math.PI * 2))));
    $('demo-code-value').textContent = `x = 40 + 220 × ${p.toFixed(2)}`;
    $('demo-image').style.transform = `translateX(${-6 * p}%) scale(${1 + .2 * p})`;
    $('demo-image-value').textContent = `缩放 ${(1 + .2 * p).toFixed(2)}× · 平移 ${(-6 * p).toFixed(1)}%`;
    const clip = Math.min(2, Math.floor(p * 3));
    $('demo-shot-name').textContent = `镜头 ${'ABC'[clip]}`;
    $('demo-cut-value').textContent = `${clip * 2}–${clip * 2 + 2} 秒：镜头 ${'ABC'[clip]}`;
    $('demo-playhead').style.left = `${p * 100}%`;
    document.querySelectorAll('[data-demo-clip]').forEach((node) => node.classList.toggle('active', Number(node.dataset.demoClip) === clip));
  };
  const pause = () => { playing = false; cancelAnimationFrame(frame); $('demo-play').textContent = '播放示意 ▶'; $('demo-play').setAttribute('aria-pressed', 'false'); };
  const tick = (now) => {
    if (!playing) return;
    playbackTime = Math.min(6000, playbackTime + now - lastTime);
    slider.value = String(playbackTime);
    lastTime = now;
    render();
    if (Number(slider.value) >= 6000) pause();
    else frame = requestAnimationFrame(tick);
  };
  slider.addEventListener('input', () => { pause(); render(); });
  $('demo-play').addEventListener('click', () => { if (playing) pause(); else { if (Number(slider.value) >= 6000) slider.value = '0'; playbackTime = Number(slider.value); playing = true; lastTime = performance.now(); $('demo-play').textContent = '暂停示意 Ⅱ'; $('demo-play').setAttribute('aria-pressed', 'true'); frame = requestAnimationFrame(tick); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); }).observe($('learn'));
  render();
}

init().catch((error) => { $('result-count').textContent = '样片目录加载失败，请检查本地 data.js 文件是否完整，或访问下方官方效果页。'; $('featured-summary').textContent = '目录暂时不可用'; console.error(error); });
