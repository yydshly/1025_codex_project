import { botanical, worldScene } from './book-scenes.js';

const chapters = [
  { name: '第一章 · 一颗想法', title: '先种下，<br>一颗想法。', kicker: '01 / 从一个主题开始', figure: '一颗种子，是整本书的起点。' },
  { name: '第二章 · 页与页之间', title: '让上一页，<br>在这一页继续。', kicker: '02 / 让书页彼此关联', figure: '熟悉的对象，长出新的联系。' },
  { name: '第三章 · 亲手改变', title: '亲手改变，<br>看它回应。', kicker: '03 / 让交互推动探索', figure: '你的操作，让同一个主题继续生长。' },
  { name: '第四章 · 新的天地', title: '换一个世界，<br>保留同一条线。', kicker: '04 / 将方法带到新主题', figure: '载体可以变化，探索依然连贯。' },
];
const state = { page: 0, open: false, busy: false, light: 60, world: 'botanical', moving: true };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const narrowScreen = window.matchMedia('(max-width: 640px)');
const stage = document.getElementById('book-stage');
const book = document.getElementById('book');
const spread = document.getElementById('spread');
const leftPage = document.getElementById('page-left');
const rightPage = document.getElementById('page-right');
const leaf = document.getElementById('turning-leaf');
const contents = document.getElementById('contents-dialog');
let turnTimer;

const foot = (number, right = false) => `<div class="page-foot"><span>${right ? '一 个 主 题 · 持 续 展 开' : '知 行 之 间 / 主 题 体 验 手 记'}</span><span class="folio">${String(number).padStart(2, '0')}</span></div>`;
const worldCopy = {
  botanical: { label: '生长手记 / NATURAL STUDY', note: '种子 → 幼芽 → 盛放', feedback: '在生长手记里，同一颗种子连接四个章节。纸张、线描和自然色贯穿整个过程。' },
  mechanical: { label: '机械手稿 / MECHANISM', note: '部件 → 连接 → 运转', feedback: '换成机械手稿，金色的核心成为机芯。沿着部件、连接和运转，逐页理解一个系统。' },
  cosmos: { label: '星图漫游 / CELESTIAL ATLAS', note: '星点 → 星座 → 新的路径', feedback: '换成星图，同一个核心成为星点。先认识星点，再连接星座，逐页探索更大的世界。' },
};

function lightCopy(value) {
  if (value < 34) return `展开程度 ${value}%：枝叶收拢，花苞尚小。画面与讲解，正在回应同一个输入。`;
  if (value < 75) return `展开程度 ${value}%：叶片逐渐舒展，花朵开始展开。那颗种子，依然留在原来的位置。`;
  return `展开程度 ${value}%：叶片与花朵充分展开。你的操作，让这一页有了新的变化。`;
}

function leftContent(page, preview = false) {
  const chapter = chapters[page];
  const head = `<div class="page-running-head"><span>${chapter.name}</span><span>FIELD NOTES / 003</span></div><p class="chapter-kicker">${chapter.kicker}</p><h2 class="chapter-title"${preview ? '' : ' id="chapter-title"'}>${chapter.title}</h2>`;
  let body;
  if (page === 0) body = `<p class="chapter-description">一本书，围绕<strong>一个主题</strong>展开。<br>我们用一颗种子，演示一个想法如何穿过书页，逐渐长成一段完整的体验。</p><div class="margin-quote">先认识它，<br>再跟着它走一段。<small>同一个对象，是每一页之间的线索。</small></div><div class="page-thread"><span class="seed-dot"></span><span class="thread-active">一个主题</span><i></i><span>持续展开</span></div>`;
  if (page === 1) body = `<div class="bridge-note"><span class="seed-dot"></span>上一页的种子，还在这一页。</div><p class="chapter-description">翻页后，熟悉的对象继续生长。<br>这一页新增一层关系，保留上一页的线索。统一的纸张、颜色与线描，让新发现自然地接上来。</p><div class="margin-quote">每一页有新意，<br>每一页也有来处。<small>对象延续 · 内容递进 · 风格一致</small></div><div class="page-thread"><span>种子</span><i></i><span class="thread-active">幼芽</span><i></i><span>新的联系</span></div>`;
  if (page === 2) body = `<p class="chapter-description">让一个动作，推动主题继续展开。<br>试着给它一点光，观察枝叶与花朵，再读读此刻的讲解。</p><div class="interaction-box"><label class="light-label"${preview ? '' : ' for="light-control"'}><span>插画的光照与展开程度</span><strong><output${preview ? '' : ' id="light-value"'}>${state.light}</output><small>%</small></strong></label><input class="light-slider" type="range" min="0" max="100" step="1" value="${state.light}"${preview ? ' tabindex="-1" disabled' : ' id="light-control" aria-describedby="light-feedback model-note"'}><div class="light-presets"><button data-light="20" aria-pressed="${state.light === 20}">初芽</button><button data-light="60" aria-pressed="${state.light === 60}">舒展</button><button data-light="100" aria-pressed="${state.light === 100}">盛放</button></div></div><p class="live-note"${preview ? '' : ' id="light-feedback" aria-live="polite"'}>${lightCopy(state.light)}</p><p class="model-note"${preview ? '' : ' id="model-note"'}>概念演示：光照用于控制插画展开，展示同步反馈，非植物生长模型。</p>`;
  if (page === 3) body = `<p class="chapter-description">一个主题，一个合适的载体，<br>相互关联的章节，持续一致的风格。<br>换一本书，也可以沿用这条探索路径。</p><div class="theme-selector" role="group" aria-label="选择新主题"><button data-world="botanical" aria-pressed="${state.world === 'botanical'}"><span>❧</span>生长手记</button><button data-world="mechanical" aria-pressed="${state.world === 'mechanical'}"><span>⚙</span>机械手稿</button><button data-world="cosmos" aria-pressed="${state.world === 'cosmos'}"><span>✧</span>星图漫游</button></div><p class="theme-feedback"${preview ? '' : ' id="theme-feedback" aria-live="polite"'}>${worldCopy[state.world].feedback}</p><a class="continue-link" href="./handbook.html#expansion">继续探索方法与扩展方向 <span aria-hidden="true">↗</span></a>`;
  return head + body + foot(page * 2 + 1);
}

function rightContent(page) {
  const head = `<div class="page-running-head right-running"><span>图 0${page + 1} · ${['主题的起点', '书页之间的联系', '操作与回应', '新的主题世界'][page]}</span><span>CONTINUITY</span></div>`;
  if (page < 3) return `${head}<div class="illustration" data-scene-stage="${page}">${botanical(page, state.light)}</div><p class="scene-caption">${chapters[page].figure}${page === 2 ? '<small>改变左页的光照，观察插画与文字一起回应。</small>' : ''}</p>${foot(page * 2 + 2, true)}`;
  return `${head}<div class="theme-world${state.moving ? '' : ' paused'}" data-world="${state.world}"><span class="world-label">${worldCopy[state.world].label}</span>${worldScene(state.world)}<span class="world-note">${worldCopy[state.world].note}</span>${state.world === 'botanical' ? '' : `<button class="world-motion" data-motion aria-label="${state.moving ? '暂停场景动效' : '继续场景动效'}">${state.moving ? 'Ⅱ 暂停' : '▷ 继续'}</button>`}</div>${foot(8, true)}`;
}

function updateNavigation() {
  document.querySelectorAll('[data-page]').forEach(button => {
    const selected = Number(button.dataset.page) === state.page;
    if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    button.disabled = state.busy;
  });
  document.getElementById('prev-page').disabled = state.busy || state.page === 0;
  document.getElementById('next-page').disabled = state.busy || state.page === chapters.length - 1;
  document.getElementById('chapter-name').textContent = chapters[state.page].name;
  document.getElementById('page-count').textContent = `${String(state.page * 2 + 1).padStart(2, '0')} — ${String(state.page * 2 + 2).padStart(2, '0')} / 08`;
  document.getElementById('close-book').disabled = state.busy;
  document.getElementById('show-contents').disabled = !state.open || state.busy;
}

function renderSpread() {
  leftPage.dataset.chapter = String(state.page);
  rightPage.dataset.chapter = String(state.page);
  leftPage.innerHTML = leftContent(state.page);
  rightPage.innerHTML = rightContent(state.page);
  spread.setAttribute('aria-label', chapters[state.page].name);
  updateNavigation();
}

function setOpen(open) {
  if (state.busy || state.open === open) return;
  state.open = open;
  state.busy = true;
  if (open) {
    state.page = 0;
    renderSpread();
    spread.inert = false;
    spread.removeAttribute('aria-hidden');
  } else {
    contents.close();
    spread.inert = true;
    spread.setAttribute('aria-hidden', 'true');
  }
  stage.classList.toggle('is-open', open);
  document.getElementById('main').classList.toggle('book-open', open);
  document.getElementById('reading-controls').hidden = !open;
  document.getElementById('chapter-tabs').hidden = !open;
  document.getElementById('close-book').hidden = !open;
  document.getElementById('closed-note').hidden = open;
  document.getElementById('keyboard-hint').textContent = open ? '← → 翻页 · 同一个主题，继续展开' : '纸页承载内容，翻页连接发现。';
  document.getElementById('open-book').tabIndex = open ? -1 : 0;
  document.getElementById('front-cover').inert = open;
  updateNavigation();
  setTimeout(() => {
    state.busy = false;
    updateNavigation();
    document.getElementById('reading-status').textContent = open ? '书已打开。第一章，一颗想法。可以使用下一页按钮或左右方向键翻页。' : '书已合上。';
    if (!open) document.getElementById('open-book').focus({ preventScroll: true });
  }, reducedMotion.matches ? 20 : 1200);
}

function turnTo(target) {
  if (!state.open || state.busy || target < 0 || target >= chapters.length) return;
  contents.close();
  if (target === state.page) return;
  state.busy = true;
  const previous = state.page;
  const forward = target > previous;
  leaf.classList.remove('forward', 'backward');
  document.getElementById('leaf-front').innerHTML = `<div class="page page-right" data-chapter="${forward ? previous : target}">${rightContent(forward ? previous : target)}</div>`;
  document.getElementById('leaf-back').innerHTML = `<div class="page page-left" data-chapter="${forward ? target : previous}">${leftContent(forward ? target : previous, true)}</div>`;
  if (forward) {
    rightPage.innerHTML = rightContent(target);
    rightPage.dataset.chapter = String(target);
  } else {
    leftPage.innerHTML = leftContent(target);
    leftPage.dataset.chapter = String(target);
  }
  if (narrowScreen.matches) {
    leftPage.innerHTML = leftContent(target);
    rightPage.innerHTML = rightContent(target);
  }
  leaf.hidden = false;
  // Layout establishes the starting face before the physical page rotation begins.
  void leaf.offsetWidth;
  leaf.classList.add(forward ? 'forward' : 'backward');
  book.classList.add('is-turning');
  spread.inert = true;
  state.page = target;
  updateNavigation();
  const finish = () => {
    clearTimeout(turnTimer);
    leaf.onanimationend = null;
    leaf.hidden = true;
    leaf.classList.remove('forward', 'backward');
    book.classList.remove('is-turning');
    state.busy = false;
    renderSpread();
    spread.inert = false;
    document.getElementById('reading-status').textContent = `${chapters[target].name}，第 ${target * 2 + 1} 至 ${target * 2 + 2} 页。`;
    if (narrowScreen.matches) stage.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  leaf.onanimationend = event => { if (event.target === leaf) finish(); };
  turnTimer = setTimeout(finish, reducedMotion.matches ? 30 : 880);
}

function updateLight(value) {
  state.light = value;
  const control = document.getElementById('light-control');
  if (control) control.value = String(value);
  document.getElementById('light-value').textContent = String(value);
  document.getElementById('light-feedback').textContent = lightCopy(value);
  leftPage.querySelectorAll('[data-light]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.light) === value)));
  const plant = rightPage.querySelector('.botanical-stem');
  plant.style.setProperty('--stem', String(.42 + value / 100 * .58));
  plant.style.setProperty('--bloom', String(.12 + value / 100 * .88));
  plant.style.setProperty('--leaf', String(.52 + value / 100 * .48));
  const svg = rightPage.querySelector('.botanical-scene');
  svg.setAttribute('aria-label', `同一株植物随光照 ${value}% 展开叶片和花朵`);
  const lightLabel = [...svg.querySelectorAll('text')].find(text => text.textContent.startsWith('光照'));
  if (lightLabel) lightLabel.textContent = `光照 · ${value}%`;
}

document.getElementById('open-book').addEventListener('click', () => setOpen(true));
book.addEventListener('click', () => { if (!state.open && !state.busy) setOpen(true); });
document.getElementById('close-book').addEventListener('click', () => setOpen(false));
document.getElementById('prev-page').addEventListener('click', () => turnTo(state.page - 1));
document.getElementById('next-page').addEventListener('click', () => turnTo(state.page + 1));
document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => turnTo(Number(button.dataset.page))));
document.getElementById('show-contents').addEventListener('click', () => contents.showModal());
document.getElementById('close-contents').addEventListener('click', () => contents.close());
contents.addEventListener('click', event => { if (event.target === contents) { const rect = contents.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) contents.close(); } });
spread.addEventListener('input', event => {
  if (event.target.id === 'light-control') updateLight(Number(event.target.value));
});
spread.addEventListener('click', event => {
  const lightButton = event.target.closest('[data-light]');
  if (lightButton) updateLight(Number(lightButton.dataset.light));
  const worldButton = event.target.closest('[data-world]');
  if (worldButton?.tagName === 'BUTTON' && Object.hasOwn(worldCopy, worldButton.dataset.world)) {
    state.world = worldButton.dataset.world;
    leftPage.querySelectorAll('[data-world]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.world === state.world)));
    document.getElementById('theme-feedback').textContent = worldCopy[state.world].feedback;
    rightPage.innerHTML = rightContent(3);
  }
  if (event.target.closest('[data-motion]')) {
    state.moving = !state.moving;
    rightPage.querySelector('.theme-world').classList.toggle('paused', !state.moving);
    const motionButton = rightPage.querySelector('[data-motion]');
    motionButton.textContent = state.moving ? 'Ⅱ 暂停' : '▷ 继续';
    motionButton.setAttribute('aria-label', state.moving ? '暂停场景动效' : '继续场景动效');
  }
});
document.addEventListener('keydown', event => {
  if (contents.open || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (state.open && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    turnTo(state.page + (event.key === 'ArrowRight' ? 1 : -1));
  }
});

renderSpread();
