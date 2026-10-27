'use strict';

const STORAGE_KEY = 'star-card-club-v1';
const categories = ['奥特曼', '怪兽', '其他'];
const examples = [
  { id: 'example-ultraman', name: '初代奥特曼', category: '奥特曼', number: '', version: '', description: '来自光之国的宇宙英雄，守护地球、与怪兽战斗。', image: '', example: true },
  { id: 'example-tiga', name: '迪迦奥特曼', category: '奥特曼', number: '', version: '', description: '拥有多种形态的光之巨人，是许多人熟悉的奥特英雄。', image: '', example: true },
  { id: 'example-zero', name: '赛罗奥特曼', category: '奥特曼', number: '', version: '', description: '来自光之国的年轻战士，勇敢地迎接各种挑战。', image: '', example: true },
  { id: 'example-baltan', name: '巴尔坦星人', category: '怪兽', number: '', version: '', description: '拥有像钳子一样双手的宇宙人，曾与奥特曼交锋。', image: '', example: true },
  { id: 'example-gomora', name: '哥莫拉', category: '怪兽', number: '', version: '', description: '有着长尾巴和角的古代怪兽，身影出现在奥特曼的故事中。', image: '', example: true },
];
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const cardDetails = (card) => [card.number && `卡号 ${card.number}`, card.version].filter(Boolean).join(' · ');
// The built-in reference catalog is read-only and is never written into the user's collection.
const catalog = [globalThis.CHARACTER_CATALOG, globalThis.EXTRA_HEROES, globalThis.EXTRA_CLASSIC, globalThis.EXTRA_MODERN, globalThis.EXTRA_CLASSIC_2, globalThis.EXTRA_MODERN_2, globalThis.EXTRA_OFFICIAL_3, globalThis.EXTRA_FORMS_3, globalThis.EXTRA_ENEMIES_3, globalThis.EXTRA_HEROES_4, globalThis.EXTRA_KAIJU_4, globalThis.EXTRA_ARCHIVE_4, globalThis.EXTRA_TIGA_5, globalThis.EXTRA_GAIA_5, globalThis.EXTRA_ARCHIVE_5, globalThis.EXTRA_COSMOS_6, globalThis.EXTRA_MAX_6, globalThis.EXTRA_TARO_6]
  .flatMap((items) => Array.isArray(items) ? items : [])
  .filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && categories.includes(item.category) && typeof item.description === 'string')
  .map((item) => ({ ...item, catalog: true }));
// A small set of locally generated fan illustrations is used only as a fallback for the named characters.
const portraitPositions = new Map([
  ['初代奥特曼', [0, 0]], ['迪迦奥特曼', [33.333, 0]], ['赛罗奥特曼', [66.667, 0]], ['泽塔奥特曼', [100, 0]],
  ['哥莫拉', [0, 100]], ['杰顿', [33.333, 100]], ['巴尔坦星人', [66.667, 100]], ['贝利亚奥特曼', [100, 100]],
]);
function safeHttps(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}
let cards;
let storageBlocked = false;
let editingId = null;
let selectedId = null;
let selectedCatalog = false;
let filter = '全部';
let catalogFilter = '全部';
let catalogLimit = 24;
let toastTimer;
let narrationToken = 0;
let actionTimer;

function validCard(card) {
  return card && typeof card === 'object' && typeof card.id === 'string' && card.id.length > 0 && card.id.length <= 100
    && typeof card.name === 'string' && card.name.trim().length > 0 && card.name.length <= 40
    && categories.includes(card.category) && typeof card.number === 'string' && card.number.length <= 60
    && typeof card.version === 'string' && card.version.length <= 60
    && typeof card.description === 'string' && card.description.length <= 500
    && typeof card.image === 'string' && card.image.length <= 1500000
    && (!card.image || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(card.image))
    && typeof card.example === 'boolean';
}
function parseBackup(value) {
  if (!value || value.schemaVersion !== 1 || !Array.isArray(value.cards) || value.cards.length > 2000 || !value.cards.every(validCard)) throw new Error('备份格式不正确，或包含不支持的数据。');
  if (new Set(value.cards.map((card) => card.id)).size !== value.cards.length) throw new Error('备份中有重复的卡片标识。');
  return value.cards.map(({ id, name, category, number, version, description, image, example }) => ({ id, name, category, number, version, description, image, example }));
}
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  cards = saved === null ? examples.map((item) => ({ ...item })) : parseBackup(JSON.parse(saved));
} catch (error) {
  cards = [];
  storageBlocked = true;
  window.setTimeout(() => notify('读取收藏失败。为保护已有数据，暂时不能修改；请检查浏览器存储。', true), 0);
}
function notify(message, long = false) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), long ? 8000 : 3500);
}
function save(next) {
  if (storageBlocked) { notify('当前无法安全读取原有收藏，未进行修改。', true); return false; }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, cards: next }));
    cards = next;
    return true;
  } catch (error) {
    notify('保存失败，原有收藏未改变。浏览器空间可能不足，请导出备份或缩小图片后重试。', true);
    return false;
  }
}
function imageMarkup(card, mini = false) {
  const loading = mini ? 'lazy' : 'eager';
  if (card.image) return `<img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.name)}的卡片图片" loading="${loading}" decoding="async"><span class="character-placeholder" hidden>图片暂不可用</span>`;
  if (card.catalog) {
    const imageUrl = safeHttps(card.imageUrl);
    const position = portraitPositions.get(card.name);
    if (position) {
      const hidden = imageUrl ? ' hidden' : '';
      return `${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(card.name)}人物形象" loading="${loading}" decoding="async" referrerpolicy="no-referrer">` : ''}<span class="character-portrait" role="img" aria-label="${escapeHtml(card.name)}的 AI 风格化插画" style="background-position:${position[0]}% ${position[1]}%"${hidden}></span><span class="portrait-credit portrait-fallback-credit"${hidden}>AI 风格插画</span>`;
    }
    const fallback = `<span class="character-placeholder"${imageUrl ? ' hidden' : ''}>人物图片待补</span>`;
    return `${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(card.name)}人物形象" loading="${loading}" decoding="async" referrerpolicy="no-referrer">` : ''}${fallback}${card.imageLabel ? `<span class="portrait-credit">${escapeHtml(card.imageLabel)}</span>` : ''}`;
  }
  return `<span class="card-symbol ${card.category === '怪兽' ? 'monster' : 'hero-symbol'}" aria-hidden="true">${card.category === '怪兽' ? '✹' : card.category === '其他' ? '✦' : '✧'}</span><span class="art-orbit" aria-hidden="true"></span>${mini ? '' : '<span class="art-caption">A LITTLE UNIVERSE</span>'}`;
}
function stopNarration() {
  narrationToken += 1;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  const button = $('#narrate');
  if (button) {
    button.dataset.speaking = 'false';
    button.setAttribute('aria-pressed', 'false');
    button.textContent = '听人物讲解';
  }
}
function profileFor(card) {
  const source = globalThis.CHARACTER_PROFILES;
  const profile = card.catalog && source && typeof source === 'object' ? source[card.id] : null;
  return profile && typeof profile === 'object' ? profile : {};
}
function localForeground(value) {
  return typeof value === 'string' && /^assets\/[a-z0-9][a-z0-9-]*\.png$/i.test(value) ? value : '';
}
function selectedCard() {
  return (selectedCatalog ? catalog : cards).find((item) => item.id === selectedId);
}
function revealSelectedCard() {
  $('#draw-display .draw-card')?.focus({ preventScroll: true });
  $('.stage').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}
function openPortrait(card) {
  const activeForeground = $('#draw-display .hero-foreground');
  const foreground = activeForeground && !activeForeground.hidden && activeForeground.complete && activeForeground.naturalWidth > 0
    ? localForeground(profileFor(card).foreground) : '';
  const url = foreground || (card.catalog ? safeHttps(card.imageUrl) : card.image);
  if (!url) return;
  stopNarration();
  const image = $('#portrait-image');
  image.hidden = false;
  $('#portrait-error').hidden = true;
  $('#portrait-title').textContent = card.name;
  $('#portrait-caption').textContent = foreground ? '原创风格化演绎' : card.imageLabel || '人物形象';
  image.alt = `${card.name}的完整形象`;
  image.src = url;
  $('#portrait-viewer').showModal();
}
function renderDraw() {
  stopNarration();
  clearTimeout(actionTimer);
  const card = selectedCard();
  const display = $('#draw-display');
  if (!card) {
    display.innerHTML = '<div class="card-empty"><span>✦</span><strong>惊喜正在等你</strong><p>点击“抽一张卡”，<br>看看今天遇见谁！</p></div>';
    return;
  }
  const source = card.catalog && safeHttps(card.sourceUrl);
  const imageSourceUrl = card.catalog && safeHttps(card.imageSourceUrl);
  const imageSource = imageSourceUrl !== source ? imageSourceUrl : '';
  const profile = profileFor(card);
  const foreground = localForeground(profile.foreground);
  const theme = ['blue', 'red', 'gold', 'teal', 'purple'].includes(profile.theme) ? profile.theme : card.category === '怪兽' ? 'red' : 'blue';
  const signature = typeof profile.signature === 'string' ? profile.signature : '';
  const action = typeof profile.action === 'string' ? profile.action : '';
  const label = typeof profile.label === 'string' ? profile.label : card.category === '怪兽' ? '怪兽档案' : card.category === '奥特曼' ? '奥特战士' : '人物档案';
  display.innerHTML = `<article tabindex="-1" class="draw-card theme-${theme} ${card.category === '怪兽' ? 'is-monster' : ''} ${foreground ? 'has-foreground' : ''} ${signature ? 'has-signature' : ''}"><div class="stage-energy" aria-hidden="true"></div><div class="card-art">${imageMarkup(card)}<span class="card-tag">${card.catalog ? '人物主题卡' : card.example ? '角色示例' : '我的收藏'}</span></div>${foreground ? `<img class="hero-foreground" src="${escapeHtml(foreground)}" alt="${escapeHtml(card.name)}的原创风格化演绎" aria-hidden="true"><span class="foreground-credit">原创风格演绎</span>` : ''}<div class="draw-info"><p class="card-kind">${escapeHtml(label)} <span>✦</span> ${escapeHtml(card.category)}</p><h3 class="card-title">${escapeHtml(card.name)}</h3>${cardDetails(card) ? `<p class="card-meta">${escapeHtml(cardDetails(card))}</p>` : ''}${signature ? `<p class="signature"><span>标志招式</span>${escapeHtml(signature)}</p>` : ''}<p class="card-description">${escapeHtml(card.description || '这张卡还没有介绍，可以在收藏中补充它的故事。')}${source ? ` <a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">资料来源 ↗</a>` : ''}${imageSource ? ` <a href="${escapeHtml(imageSource)}" target="_blank" rel="noopener noreferrer">图片来源 ↗</a>` : ''}</p><div class="stage-actions"><button type="button" class="stage-action" id="draw-next">再抽一张</button>${(foreground || card.image || (card.catalog && safeHttps(card.imageUrl))) ? '<button type="button" class="stage-action" id="view-portrait">查看大图</button>' : ''}<button type="button" class="stage-action" id="perform-action"><span aria-hidden="true">✦</span> ${signature ? '展现招式光效' : '点亮星光'}</button><button type="button" class="stage-action stage-listen" id="narrate" aria-pressed="false">听人物讲解</button></div><p class="stage-action-note">${escapeHtml(action || '点击点亮星光，给这次相遇添一点光。')} <span>· 画面为舞台效果</span></p></div></article>`;
  display.classList.remove('reveal');
  void display.offsetWidth;
  display.classList.add('reveal');
}
$('#draw-display').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const card = selectedCard();
  if (!card) return;
  if (button.id === 'draw-next') { if (drawRandomCard()) revealSelectedCard(); return; }
  if (button.id === 'view-portrait') { openPortrait(card); return; }
  if (button.id === 'perform-action') {
    const stageCard = button.closest('.draw-card');
    stageCard.classList.remove('is-performing');
    void stageCard.offsetWidth;
    stageCard.classList.add('is-performing');
    clearTimeout(actionTimer);
    actionTimer = setTimeout(() => stageCard.classList.remove('is-performing'), 1600);
  }
  if (button.id === 'narrate') {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { notify('这台设备暂不支持语音讲解。'); return; }
    if (button.dataset.speaking === 'true') { stopNarration(); return; }
    stopNarration();
    const profile = profileFor(card);
    const content = typeof profile.voiceText === 'string' && profile.voiceText.trim() ? profile.voiceText : card.description;
    if (!content) { notify('这张卡片暂时没有人物介绍。'); return; }
    const utterance = new SpeechSynthesisUtterance(`${card.name}。${content}`);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    const voice = window.speechSynthesis.getVoices().find((item) => /^zh[-_]CN$/i.test(item.lang))
      || window.speechSynthesis.getVoices().find((item) => /^zh/i.test(item.lang));
    if (voice) utterance.voice = voice;
    const token = narrationToken;
    button.dataset.speaking = 'true';
    button.setAttribute('aria-pressed', 'true');
    button.textContent = '停止讲解';
    const finish = () => { if (token === narrationToken && button.isConnected) { button.dataset.speaking = 'false'; button.setAttribute('aria-pressed', 'false'); button.textContent = '听人物讲解'; } };
    utterance.onend = finish;
    utterance.onerror = () => { finish(); if (token === narrationToken) notify('语音讲解暂不可用，可以阅读文字介绍。'); };
    try { window.speechSynthesis.speak(utterance); } catch { finish(); notify('语音讲解暂不可用，可以阅读文字介绍。'); }
  }
});
function renderCatalog() {
  const query = $('#catalog-search').value.trim().toLocaleLowerCase();
  const visible = catalog.filter((card) => (catalogFilter === '全部' || card.category === catalogFilter) && card.name.toLocaleLowerCase().includes(query));
  $('#catalog-count').textContent = catalog.length;
  $('#catalog-grid').innerHTML = visible.slice(0, catalogLimit).map((card) => `<article class="collection-card"><button type="button" class="card-open" data-id="${escapeHtml(card.id)}" aria-label="查看${escapeHtml(card.name)}"><div class="mini-art ${card.category === '怪兽' ? 'is-monster' : ''}">${imageMarkup(card, true)}<span class="mini-tag">人物主题卡</span></div><div class="mini-info"><small>${escapeHtml(card.category)}</small><h3>${escapeHtml(card.name)}</h3><p>${escapeHtml(card.description)}</p></div></button></article>`).join('');
  $('#catalog-empty').hidden = visible.length > 0;
  $('#catalog-more').hidden = visible.length <= catalogLimit;
  $('#catalog-progress').textContent = visible.length ? `已展示 ${Math.min(visible.length, catalogLimit)} / ${visible.length} 位` : '';
}
function renderGrid() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  const visible = cards.filter((card) => (filter === '全部' || card.category === filter) && [card.name, card.number, card.version].some((item) => item.toLocaleLowerCase().includes(query)));
  $('#total-count').textContent = cards.length;
  $('#card-grid').innerHTML = visible.map((card) => `<article class="collection-card"><button type="button" class="card-open" data-action="view" data-id="${escapeHtml(card.id)}" aria-label="查看${escapeHtml(card.name)}"><div class="mini-art ${card.category === '怪兽' ? 'is-monster' : ''}">${imageMarkup(card, true)}<span class="mini-tag">${card.example ? '角色示例' : '我的收藏'}</span></div><div class="mini-info"><small>${escapeHtml(card.category)}</small><h3>${escapeHtml(card.name)}</h3><p>${escapeHtml(cardDetails(card) || '点击查看人物介绍')}</p></div></button><div class="mini-actions"><button type="button" data-action="edit" data-id="${escapeHtml(card.id)}" aria-label="编辑${escapeHtml(card.name)}">编辑</button><button type="button" data-action="delete" data-id="${escapeHtml(card.id)}" aria-label="删除${escapeHtml(card.name)}">删除</button></div></article>`).join('');
  const empty = $('#empty-state');
  empty.hidden = visible.length > 0;
  empty.innerHTML = cards.length === 0 ? '<span>✧</span><strong>收藏还空着呢</strong><p>添加第一张卡片，开始你的宇宙收藏吧。</p>' : '<span>✧</span><strong>没有找到卡片</strong><p>换个关键词或分类再试试。</p>';
}
function render() { renderCatalog(); renderGrid(); renderDraw(); }
function openForm(card) {
  editingId = card?.id ?? null;
  $('#card-form').reset();
  $('#dialog-title').textContent = card ? '编辑卡片' : '添加卡片';
  $('#name').value = card?.name || '';
  $('#category').value = card?.category || '奥特曼';
  $('#number').value = card?.number || '';
  $('#version').value = card?.version || '';
  $('#description').value = card?.description || '';
  $('#remove-image-wrap').hidden = !card?.image;
  $('#image-preview').innerHTML = card?.image ? `<img src="${escapeHtml(card.image)}" alt="当前卡片图片">` : '';
  $('#card-dialog').showModal();
  $('#name').focus();
}
function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { reject(new Error('请选择 JPG、PNG 或 WebP 图片。')); return; }
    if (file.size > 20 * 1024 * 1024) { reject(new Error('图片超过 20 MB，请换一张较小的图片。')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('读取图片失败。'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('图片无法识别。'));
      image.onload = () => {
        const scale = Math.min(1, 900 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) { reject(new Error('图片处理失败。')); return; }
        context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function drawRandomCard() {
  const scope = $('#draw-scope').value;
  const pool = scope === 'catalog' ? catalog : scope === 'mine' ? cards.filter((card) => !card.example) : [...catalog, ...cards.filter((card) => !card.example)];
  if (!pool.length) { notify($('#draw-scope').value === 'mine' ? '还没有自己的卡片，先添加一张吧！' : '还没有卡片，先添加一张吧！'); $('#add').focus(); return; }
  const candidates = pool.length > 1 ? pool.filter((item) => item.id !== selectedId || Boolean(item.catalog) !== selectedCatalog) : pool;
  const choices = candidates.length ? candidates : pool;
  const card = choices[Math.floor(Math.random() * choices.length)]; selectedId = card.id; selectedCatalog = Boolean(card.catalog); renderDraw();
  return true;
}
$('#draw').addEventListener('click', () => { if (drawRandomCard()) revealSelectedCard(); });
$('#add').addEventListener('click', () => openForm());
function prefillDescription() {
  if (editingId !== null || $('#description').value.trim()) return;
  const match = catalog.find((card) => card.name === $('#name').value.trim()) || examples.find((card) => card.name === $('#name').value.trim());
  if (match) $('#description').value = match.description;
}
$('#name').addEventListener('blur', prefillDescription);
$('#cancel').addEventListener('click', () => $('#card-dialog').close());
$('#close-dialog').addEventListener('click', () => $('#card-dialog').close());
$('#search').addEventListener('input', renderGrid);
$('#catalog-search').addEventListener('input', () => { catalogLimit = 24; renderCatalog(); });
document.querySelectorAll('.catalog-filter').forEach((button) => button.addEventListener('click', () => {
  catalogFilter = button.dataset.filter; catalogLimit = 24;
  document.querySelectorAll('.catalog-filter').forEach((item) => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  renderCatalog();
}));
$('#catalog-more').addEventListener('click', () => { catalogLimit += 24; renderCatalog(); });
$('#catalog-grid').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button || !catalog.some((card) => card.id === button.dataset.id)) return;
  selectedId = button.dataset.id; selectedCatalog = true; renderDraw();
  revealSelectedCard();
});
// If a linked reference image is unavailable, leave the character identifiable without a broken icon.
document.addEventListener('error', (event) => {
  if (event.target instanceof HTMLImageElement && event.target.id === 'portrait-image') {
    event.target.hidden = true;
    $('#portrait-error').hidden = false;
    return;
  }
  if (event.target instanceof HTMLImageElement && event.target.classList.contains('hero-foreground')) {
    event.target.closest('.draw-card')?.classList.remove('has-foreground');
    event.target.hidden = true;
    const credit = event.target.parentElement?.querySelector('.foreground-credit');
    if (credit) credit.hidden = true;
    return;
  }
  if (event.target instanceof HTMLImageElement && event.target.parentElement?.querySelector('.character-placeholder, .character-portrait')) {
    event.target.hidden = true;
    event.target.parentElement.querySelector('.character-placeholder, .character-portrait').hidden = false;
    const fallbackCredit = event.target.parentElement.querySelector('.portrait-fallback-credit');
    if (fallbackCredit) fallbackCredit.hidden = false;
  }
}, true);
window.addEventListener('pagehide', stopNarration);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopNarration(); });
$('#close-portrait').addEventListener('click', () => $('#portrait-viewer').close());
$('#portrait-viewer').addEventListener('close', () => { $('#portrait-image').removeAttribute('src'); });
document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach((item) => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  renderGrid();
}));
$('#card-grid').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const card = cards.find((item) => item.id === button.dataset.id);
  if (!card) return;
  if (button.dataset.action === 'view') { selectedId = card.id; selectedCatalog = false; renderDraw(); revealSelectedCard(); }
  if (button.dataset.action === 'edit') openForm(card);
  if (button.dataset.action === 'delete' && confirm(`确定删除“${card.name}”这张卡片吗？建议先导出备份。`)) {
    if (save(cards.filter((item) => item.id !== card.id))) { if (!selectedCatalog && selectedId === card.id) selectedId = null; render(); notify('已删除这张卡片。'); }
  }
});
$('#card-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  prefillDescription();
  const name = $('#name').value.trim();
  if (!name) { $('#name').focus(); return; }
  const old = cards.find((item) => item.id === editingId);
  const submit = event.submitter; if (submit) submit.disabled = true;
  try {
    const file = $('#image').files[0];
    const image = file ? await compressImage(file) : $('#remove-image').checked ? '' : (old?.image || '');
    const card = { id: old?.id || (globalThis.crypto?.randomUUID?.() ?? `card-${Date.now()}-${Math.random().toString(36).slice(2)}`), name, category: $('#category').value, number: $('#number').value.trim(), version: $('#version').value.trim(), description: $('#description').value.trim(), image, example: old?.example ?? false };
    if (!validCard(card)) throw new Error('卡片内容或图片太大，请调整后重试。');
    const next = old ? cards.map((item) => item.id === old.id ? card : item) : [card, ...cards];
    if (save(next)) { $('#card-dialog').close(); render(); notify(old ? '卡片已更新！' : '新卡片已加入收藏！'); }
  } catch (error) { notify(error.message || '卡片保存失败，请重试。', true); }
  finally { if (submit) submit.disabled = false; }
});
$('#export').addEventListener('click', () => {
  if (storageBlocked) { notify('原有收藏读取失败，不能导出当前空列表。', true); return; }
  const blob = new Blob([JSON.stringify({ schemaVersion: 1, cards }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = '星光卡片收藏备份.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('已开始导出备份，请妥善保存文件。');
});
$('#import').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 25 * 1024 * 1024) throw new Error('备份文件超过 25 MB，无法导入。');
    const imported = parseBackup(JSON.parse(await file.text()));
    if (!confirm(`备份中有 ${imported.length} 张卡片。导入会替换当前全部 ${cards.length} 张卡片，不会合并。建议先导出当前收藏。确定继续吗？`)) return;
    if (save(imported)) { selectedId = null; render(); notify(`已导入 ${imported.length} 张卡片。`); }
  } catch (error) { notify(error instanceof SyntaxError ? '备份不是有效的 JSON 文件，现有收藏未改变。' : error.message || '导入失败，现有收藏未改变。', true); }
  finally { event.target.value = ''; }
});
render();
