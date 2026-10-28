(() => {
  'use strict';
  const map = document.getElementById('overview-map');
  const detail = document.getElementById('overview-detail');
  const data = globalThis.SKILL_OVERVIEW;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const keys = ['purpose', 'when', 'how', 'deliverable', 'connect'];
  const labels = ['做什么', '什么时候用', '怎么做', '交付什么、怎样检查', '怎么配合'];
  if (!map || !detail) return;
  function unavailable() {
    map.innerHTML = '<p class="overview-loading" role="alert">地图数据暂未完整加载。请刷新，或打开<a href="overview-poster.html">完整汇总图</a>。</p>';
    detail.innerHTML = '<p>也可以从<a href="scenarios.html">25 项场景详解</a>继续查阅。</p>';
  }
  if (!data || !Array.isArray(data.skills) || data.skills.length !== 25 || !Array.isArray(data.groups) || data.groups.length !== 7) return unavailable();
  const byId = new Map(data.skills.map((s, index) => [s.id, { ...s, index }]));
  const members = data.groups.flatMap(g => g.ids || []);
  if (byId.size !== 25 || members.length !== 25 || new Set(members).size !== 25 || members.some(id => !byId.has(id)) || data.skills.some(s => !/^[a-z0-9-]+$/.test(s.id) || keys.some(k => typeof s[k] !== 'string' || !s[k].trim()))) return unavailable();
  const groupById = new Map(data.groups.map(g => [g.id, g]));
  const initial = 'using-agent-skills';
  let selected = initial;
  const number = index => String(index + 1).padStart(2, '0');
  map.innerHTML = data.groups.map((group, i) => `<section class="overview-stage" aria-labelledby="stage-${escape(group.id)}"><div class="overview-stage-heading"><p class="overview-stage-kicker">${number(i)} / ${group.ids.length} 项</p><h3 id="stage-${escape(group.id)}">${escape(group.title)}</h3><p class="overview-stage-question">${escape(group.question)}</p></div><div class="overview-nodes">${group.ids.map(id => {
    const skill = byId.get(id);
    return `<button type="button" class="overview-node" data-overview-skill="${escape(id)}" aria-pressed="false" aria-controls="overview-detail"><span class="overview-node-title"><span class="overview-node-number">${number(skill.index)}</span><strong>${escape(skill.name)}</strong></span><span class="overview-node-purpose">${escape(skill.purpose)}</span></button>`;
  }).join('')}</div></section>`).join('');
  function fromHash() {
    const raw = location.hash.startsWith('#skill-') ? location.hash.slice(7) : location.hash.startsWith('#skill=') ? location.hash.slice(7) : '';
    let id;
    try { id = decodeURIComponent(raw); } catch { return initial; }
    return byId.has(id) ? id : initial;
  }
  function select(id, {write = false, move = false} = {}) {
    const skill = byId.get(id);
    if (!skill) return;
    selected = id;
    for (const button of map.querySelectorAll('button[data-overview-skill]')) button.setAttribute('aria-pressed', String(button.dataset.overviewSkill === selected));
    const group = groupById.get(skill.group);
    detail.innerHTML = `<p class="overview-detail-kicker">${number(skill.index)} / 25 · ${escape(group?.title || '能力详解')}</p><h2 id="detail-title" tabindex="-1">${escape(skill.name)}</h2><p class="overview-detail-slug"><code>${escape(skill.id)}</code></p><dl class="overview-detail-fields">${keys.map((key, i) => `<div><dt><span>${number(i)}</span>${labels[i]}</dt><dd>${escape(skill[key])}</dd></div>`).join('')}</dl><div class="overview-detail-links"><a href="scenarios.html#scene-${escape(skill.id)}">看具体场景 ↗</a><a href="index.html#skill=${escape(skill.id)}">看实现原理 ↗</a><a href="../research/upstream/skills/${escape(skill.id)}/SKILL.md">读技能原文 ↗</a></div><a class="overview-detail-return" href="#map-title">返回完整能力地图 ↑</a>`;
    if (write) history.pushState(null, '', `#skill-${encodeURIComponent(id)}`);
    if (move && matchMedia('(max-width: 830px)').matches) {
      document.getElementById('detail-title').focus({preventScroll:true});
      detail.scrollIntoView({block:'start',behavior:'auto'});
    }
  }
  map.addEventListener('click', event => {
    const button = event.target.closest('button[data-overview-skill]');
    if (button) select(button.dataset.overviewSkill, {write:true, move:true});
  });
  window.addEventListener('hashchange', () => select(fromHash()));
  window.addEventListener('popstate', () => select(fromHash()));
  select(fromHash());
})();
