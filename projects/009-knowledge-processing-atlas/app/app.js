(() => {
  const grid = document.getElementById('project-grid');
  const controls = document.getElementById('filters');
  const input = document.getElementById('project-search');
  const status = document.getElementById('filter-status');
  const empty = document.getElementById('empty-state');
  if (!grid || !controls || !input || !status || !empty) return;
  document.documentElement.classList.add('js-ready');
  const cards = [...grid.querySelectorAll('.tool')];
  const buttons = [...controls.querySelectorAll('button[data-filter]')];
  const labels = { all: '全部对象', parse: '文档解析', search: '表示与检索', context: '结构与时间', learning: '学习与研究', evaluate: '评估与验证', system: '应用与框架' };
  const catalogCount = document.getElementById('catalog-count');
  if (catalogCount) catalogCount.textContent = `${cards.length} 个研究对象 · 19项重点 + 7项关联`;
  const selected = new Set();
  const compareStatus = document.getElementById('compare-status');
  const comparePanel = document.getElementById('selected-comparison');
  const compareTable = document.getElementById('comparison-table');
  const compareOpen = document.getElementById('compare-open');
  const toolbar = document.getElementById('compare-toolbar');
  const jump = document.getElementById('catalog-jump');
  let filter = 'all';
  function update() {
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const card of cards) {
      const matchesCategory = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      const matchesText = !query || card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !(matchesCategory && matchesText);
      if (!card.hidden) visible++;
    }
    for (const button of buttons) {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
    status.textContent = `${labels[filter]} · 显示 ${visible} / ${cards.length} 项${query ? ` · 搜索“${input.value.trim()}”` : ''} · 资料整理，未实测`;
    empty.hidden = visible !== 0;
  }
  const title = (card) => card.querySelector('h3').textContent.replace('↗', '').trim();
  function description(card, label) {
    const row = [...card.querySelectorAll(':scope > dl > div')].find((item) => item.querySelector('dt').textContent === label);
    return row?.querySelector('dd').textContent || '待补充';
  }
  function renderComparison() {
    if (!compareTable || !comparePanel || !compareStatus || !compareOpen) return;
    const chosen = cards.filter((card) => selected.has(card.id));
    compareStatus.textContent = chosen.length ? `已选 ${chosen.length} / 3 项：${chosen.map(title).join('、')}` : '勾选2–3项并排比较';
    comparePanel.hidden = chosen.length < 2;
    compareOpen.hidden = chosen.length < 2;
    compareTable.replaceChildren();
    if (chosen.length < 2) return;
    const caption = document.createElement('caption');
    caption.textContent = `对比 ${chosen.map(title).join('、')} · 描述依据公开资料，效果待验证`;
    const head = document.createElement('thead');
    const headingRow = document.createElement('tr');
    for (const name of ['比较维度', ...chosen.map(title)]) {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = name;
      headingRow.append(cell);
    }
    head.append(headingRow);
    const body = document.createElement('tbody');
    const fields = [
      ['角色', (card) => card.dataset.role],
      ['机制', (card) => card.querySelector(':scope > p:not(.tool-deck)').textContent],
      ['对我们的价值', (card) => description(card, '价值')],
      ['边界与代价', (card) => description(card, '边界')],
      ['依赖', (card) => description(card, '依赖')],
      ['验证任务', (card) => {
        const item = [...card.querySelectorAll('.tool-detail dl > div')].find((row) => row.querySelector('dt').textContent === '具体研究任务');
        return item?.querySelector('dd').textContent || '待制定';
      }]
    ];
    for (const [label, getValue] of fields) {
      const row = document.createElement('tr');
      const heading = document.createElement('th');
      heading.scope = 'row';
      heading.textContent = label;
      row.append(heading);
      for (const card of chosen) {
        const cell = document.createElement('td');
        cell.textContent = getValue(card);
        row.append(cell);
      }
      body.append(row);
    }
    compareTable.append(caption, head, body);
  }
  function revealHashTarget() {
    const target = cards.find((card) => `#${card.id}` === location.hash);
    if (!target) return;
    if (target.hidden) {
      filter = 'all';
      input.value = '';
      update();
    }
    if (jump) jump.value = target.id;
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  controls.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !controls.contains(button)) return;
    filter = button.dataset.filter;
    update();
  });
  input.addEventListener('input', update);
  grid.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[data-compare]');
    if (!checkbox) return;
    const card = checkbox.closest('.tool');
    if (checkbox.checked && selected.size === 3) {
      checkbox.checked = false;
      if (compareStatus) compareStatus.textContent = '最多对比3项；请先取消一项，再选择其他对象。';
      return;
    }
    if (checkbox.checked) selected.add(card.id);
    else selected.delete(card.id);
    renderComparison();
  });
  document.getElementById('compare-clear')?.addEventListener('click', () => {
    selected.clear();
    for (const checkbox of grid.querySelectorAll('input[data-compare]')) checkbox.checked = false;
    renderComparison();
  });
  jump?.addEventListener('change', () => {
    if (!jump.value) return;
    const hash = `#${jump.value}`;
    if (location.hash === hash) revealHashTarget();
    else location.hash = hash;
  });
  window.addEventListener('hashchange', revealHashTarget);
  if (toolbar) toolbar.hidden = false;
  // Browsers may restore checked inputs on reload; selection starts afresh.
  for (const checkbox of grid.querySelectorAll('input[data-compare]')) checkbox.checked = false;
  update();
  renderComparison();
  revealHashTarget();
})();
