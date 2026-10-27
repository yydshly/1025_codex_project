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
  const labels = { all: '全部项目', parse: '文档解析', search: '表示与检索', context: '结构与时间', learning: '学习与研究', evaluate: '评估与验证' };
  const catalogCount = document.getElementById('catalog-count');
  if (catalogCount) catalogCount.textContent = `${cards.length} 个开源项目 · 分层研究`;
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
    status.textContent = `${labels[filter]} · 显示 ${visible} / ${cards.length} 个项目${query ? ` · 搜索“${input.value.trim()}”` : ''} · 基于公开资料，未实测`;
    empty.hidden = visible !== 0;
  }
  controls.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !controls.contains(button)) return;
    filter = button.dataset.filter;
    update();
  });
  input.addEventListener('input', update);
  update();
})();
