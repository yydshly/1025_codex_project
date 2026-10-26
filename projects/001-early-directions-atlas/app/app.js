'use strict';
(() => {
  const data = window.EARLY_DIRECTIONS;
  const $ = (selector) => document.querySelector(selector);
  const state = { category: 'all', stage: 'all', search: '', hasLink: false };
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const categoryOf = (direction) => data.categories.find((category) => category.id === direction.category);
  const stageBadge = (direction) => `<span class="stage-badge" data-stage="${direction.stage}">${escape(data.stages[direction.stage].name)}</span>`;
  const searchable = (direction) => [direction.title, direction.shortTitle, direction.description, direction.goal, direction.boundary, direction.nextEvidence, ...direction.tags, ...direction.progress, ...direction.questions, ...(direction.pieces || []).flatMap((piece) => [piece.name, piece.text, piece.state]), categoryOf(direction).name, data.stages[direction.stage].name].join(' ').toLocaleLowerCase('zh-CN');
  const searchIndex = new Map(data.directions.map((direction) => [direction.slug, searchable(direction)]));

  $('#total-stat').textContent = String(data.directions.length).padStart(2, '0');
  $('#link-stat').textContent = String(data.directions.reduce((sum, direction) => sum + direction.links.length, 0)).padStart(2, '0');
  $('#category-tabs').innerHTML = [{ id: 'all', name: '全部方向' }, ...data.categories].map((category) => `<button class="category-tab" data-category="${category.id}" aria-pressed="${category.id === 'all'}">${escape(category.name)}<span>${data.directions.filter((direction) => category.id === 'all' || direction.category === category.id).length}</span></button>`).join('');
  Object.entries(data.stages).forEach(([key, stage]) => {
    const option = new Option(`${stage.name} · ${data.directions.filter((direction) => direction.stage === key).length}`, key);
    $('#stage-select').add(option);
  });

  function render() {
    const terms = state.search.trim().toLocaleLowerCase('zh-CN').split(/\s+/).filter(Boolean);
    const results = data.directions.filter((direction) =>
      (state.category === 'all' || direction.category === state.category) &&
      (state.stage === 'all' || direction.stage === state.stage) &&
      (!state.hasLink || direction.links.length > 0) &&
      terms.every((term) => searchIndex.get(direction.slug).includes(term))
    );
    $('#direction-grid').innerHTML = results.map((direction) => {
      const category = categoryOf(direction);
      const link = direction.links[0];
      return `<article class="direction-card" data-category="${direction.category}">
        <div class="card-top"><span class="card-number">${direction.id}</span>${stageBadge(direction)}</div>
        <div class="card-body"><div class="card-category">${escape(category.name)}</div><h3 class="card-title"><button data-direction="${direction.slug}">${escape(direction.title)}</button></h3><p class="card-description">${escape(direction.description)}</p><div class="card-insight"><span>待验证</span><p>${escape(direction.questions[0])}</p></div><div class="card-tags">${direction.tags.map((tag) => `<span>${escape(tag)}</span>`).join('')}</div></div>
        <div class="card-footer"><button class="text-button" data-direction="${direction.slug}" aria-label="查看${escape(direction.title)}的完整记录">查看完整记录 <span aria-hidden="true">↗</span></button>${link ? `<a class="card-link" href="${escape(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(link.label)}（新窗口打开，当前未验收）">${escape(link.type)}入口 <span aria-hidden="true">↗</span></a>` : '<span class="no-link">暂无历史入口</span>'}</div>
      </article>`;
    }).join('');
    $('#result-count').textContent = `显示 ${results.length} / ${data.directions.length} 个方向`;
    $('#empty-state').hidden = results.length > 0;
    $('#direction-grid').hidden = results.length === 0;
    $('#clear-filters').hidden = state.category === 'all' && state.stage === 'all' && !state.search.trim() && !state.hasLink;
    document.querySelectorAll('.category-tab').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.category === state.category)));
  }

  function resetFilters() {
    Object.assign(state, { category: 'all', stage: 'all', search: '', hasLink: false });
    $('#search').value = '';
    $('#stage-select').value = 'all';
    $('#has-link').checked = false;
    render();
  }

  $('#category-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    render();
  });
  $('#search').addEventListener('input', (event) => { state.search = event.target.value; render(); });
  $('#stage-select').addEventListener('change', (event) => { state.stage = event.target.value; render(); });
  $('#has-link').addEventListener('change', (event) => { state.hasLink = event.target.checked; render(); });
  $('#clear-filters').addEventListener('click', resetFilters);
  $('#empty-reset').addEventListener('click', resetFilters);

  $('#exploration-grid').innerHTML = data.explorations.map((exploration, index) => `<article class="exploration-card"><span class="exploration-icon" aria-hidden="true">${['♧', '✧', '◒'][index]}</span><h3>${escape(exploration.title)}</h3><div class="exploration-tags">${exploration.tags.map((tag) => `<span>${escape(tag)}</span>`).join('')}</div><p>${escape(exploration.note)}</p></article>`).join('');
  $('#next-grid').innerHTML = data.recommendations.map((recommendation) => `<article class="next-card"><span>${recommendation.number}</span><h3>${escape(recommendation.title)}</h3><p>${escape(recommendation.text)}</p><small>${escape(recommendation.type)}</small></article>`).join('');

  const dialog = $('#direction-dialog');
  let trigger = null;
  let previousHash = '#catalog';
  function openDirection(slug, updateUrl = true) {
    const direction = data.directions.find((item) => item.slug === slug);
    if (!direction) return false;
    if (!dialog.open) {
      trigger = document.activeElement;
      previousHash = location.hash.startsWith('#direction/') ? '#catalog' : location.hash || '#catalog';
    }
    const category = categoryOf(direction);
    $('#detail-content').innerHTML = `<div class="detail-meta"><span class="detail-number">${direction.id}</span><span>${escape(category.name)}</span>${stageBadge(direction)}</div>
      <h2 class="detail-title" id="detail-title">${escape(direction.title)}</h2><p class="detail-goal">${escape(direction.goal)}</p>
      <div class="detail-boundary">${escape(direction.boundary)}</div>
      <div class="detail-columns"><section><h3 class="detail-heading"><span>01</span> 已知进展</h3><ul>${direction.progress.map((text) => `<li>${escape(text)}</li>`).join('')}</ul></section><section><h3 class="detail-heading"><span>02</span> 尚未验证</h3><ul>${direction.questions.map((text) => `<li>${escape(text)}</li>`).join('')}</ul></section></div>
      ${direction.pieces ? `<section class="detail-pieces"><h3 class="detail-heading">分项记录</h3>${direction.pieces.map((piece) => `<div class="piece"><strong>${escape(piece.name)}</strong><span>${escape(piece.state)}</span><p>${escape(piece.text)}</p></div>`).join('')}</section>` : ''}
      <section class="detail-next"><h3 class="detail-heading">下一份值得获得的证据 <small>整理建议</small></h3><p>${escape(direction.nextEvidence)}</p></section>
      <div class="detail-links">${direction.links.length ? direction.links.map((link) => `<a class="button button-primary" href="${escape(link.url)}" target="_blank" rel="noopener noreferrer">${escape(link.label)} <span aria-hidden="true">↗</span></a>`).join('') : '<span class="detail-no-link">本次回溯未提供此方向的独立入口。</span>'}<button class="button button-quiet" id="copy-direction">复制本条记录</button></div>
      <div class="detail-source">来源：${escape(data.source)}。<span>历史口径 ${data.historyAsOf} · 整理于 ${data.compiledAt} · 历史入口未作当前可用性验收</span></div>`;
    $('#copy-direction').addEventListener('click', () => copyRecord(direction));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    if (updateUrl) history.pushState(null, '', `#direction/${direction.slug}`);
    return true;
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-direction]');
    if (button) openDirection(button.dataset.direction);
  });
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (location.hash.startsWith('#direction/')) history.replaceState(null, '', previousHash);
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  });
  function syncHash() {
    if (location.hash.startsWith('#direction/')) {
      const slug = location.hash.slice('#direction/'.length);
      if (!openDirection(slug, false)) toast('未找到该方向，可在目录中搜索。');
    } else if (dialog.open) dialog.close();
  }
  window.addEventListener('hashchange', syncHash);

  let toastTimer;
  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3500);
  }
  function recordMarkdown(direction) {
    return [
      `## ${direction.id} · ${direction.title}`, '',
      `- 分类：${categoryOf(direction).name}`, `- 阶段：${data.stages[direction.stage].name}`, `- 标签：${direction.tags.join('、')}`, '',
      `目标：${direction.goal}`, '', `记录边界：${direction.boundary}`, '',
      '### 已知进展', '', ...direction.progress.map((text) => `- ${text}`), '',
      '### 尚未验证', '', ...direction.questions.map((text) => `- ${text}`), '',
      ...(direction.pieces ? ['### 分项记录', '', ...direction.pieces.map((piece) => `- ${piece.name}｜${piece.state}：${piece.text}`), ''] : []),
      '### 下一份证据（整理建议，尚未确认立项）', '', direction.nextEvidence, '',
      '### 历史入口（未作当前验收）', '',
      ...(direction.links.length ? direction.links.map((link) => `- [${link.label}](${link.url})`) : ['本次回溯未提供独立入口。']), ''
    ].join('\n');
  }
  function allMarkdown() {
    return [
      `# ${data.title}`, '', '用 AI 做有价值的作品，找到真实需求，逐步形成产品和经营能力。', '', data.understanding, '',
      `整理日期：${data.compiledAt}；历史状态口径：${data.historyAsOf} 的回溯材料。`,
      `来源：${data.source}。未重新读取完整历史对话或验收旧项目。`,
      '“做过”表示历史交付或测试记录，不等于今天已全面验收。候选、停止项、阶段作品分别保留。下一步属于建议，不构成立项承诺。', '',
      ...data.directions.map(recordMarkdown),
      '# 补充探索线索', '', ...data.explorations.flatMap((exploration) => [`## ${exploration.title}`, '', exploration.tags.join('、'), '', exploration.note, '']),
      '# 游戏支线', '', `${data.gameContext.works} 款作品、${data.gameContext.entries} 个登记入口。${data.gameContext.note}`, '',
      '# 下一步（上一轮讨论建议，尚未确认立项）', '', ...data.recommendations.flatMap((recommendation) => [`## ${recommendation.number} · ${recommendation.title}`, '', recommendation.text, ''])
    ].join('\n');
  }
  function download(filename, content, mime) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  async function copyRecord(direction) {
    const content = recordMarkdown(direction);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(content);
      toast('本条记录已复制，含来源与阶段说明。');
    } catch {
      download(`${direction.id}-${direction.slug}.md`, '\ufeff' + content, 'text/markdown;charset=utf-8');
      toast('剪贴板不可用，已改为下载本条 Markdown。');
    }
  }
  $('#export-markdown').addEventListener('click', () => {
    download(`早期方向档案-${data.compiledAt}.md`, '\ufeff' + allMarkdown(), 'text/markdown;charset=utf-8');
    toast('已生成完整档案，包含全部方向与来源说明。');
  });
  $('#export-json').addEventListener('click', () => {
    download(`early-directions-${data.compiledAt}.json`, JSON.stringify(data, null, 2) + '\n', 'application/json;charset=utf-8');
    toast('已生成完整结构化资料。');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !dialog.open && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) && !document.activeElement?.isContentEditable && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      $('#search').focus();
      $('#catalog').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  });
  if ('IntersectionObserver' in window) {
    const visible = new Set();
    const sections = [...document.querySelectorAll('main>section[id]')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id));
      const active = sections.find((section) => visible.has(section.id));
      if (active) document.querySelectorAll('.nav-link').forEach((link) => {
        const selected = link.hash === `#${active.id}`;
        link.classList.toggle('active', selected);
        selected ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-130px 0px -35% 0px', threshold: 0 });
    sections.forEach((section) => observer.observe(section));
  }
  render();
  syncHash();
})();
