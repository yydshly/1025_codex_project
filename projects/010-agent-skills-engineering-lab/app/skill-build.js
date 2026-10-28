(() => {
  'use strict';
  const data = globalThis.RESEARCH_RECALL_BUILD;
  const panel = document.getElementById('skill-build-panel');
  const nav = document.getElementById('skill-build-nav');
  const summary = document.getElementById('skill-build-state');
  if (!panel || !nav || !summary) return;
  if (!data || !Array.isArray(data.steps) || data.steps.length !== 6) {
    summary.textContent = '创建过程资料尚未完整加载，请刷新后重试。';
    return;
  }
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const number = index => String(index + 1).padStart(2, '0');
  const itemLinks = items => items.map(item => item.ready
    ? `<a href="${esc(item.href)}">${esc(item.label)} ↗</a>`
    : `<span class="skill-build-pending">${esc(item.label)} <small>待就绪</small></span>`).join('');
  function fromUrl() {
    const value = new URL(location.href).searchParams.get('lesson');
    return /^[1-6]$/.test(value ?? '') ? Number(value) - 1 : 0;
  }
  let current = fromUrl();
  function render(focusHeading = false) {
    const step = data.steps[current];
    summary.innerHTML = `<strong>${esc(data.status)}</strong><span>${esc(data.statusDetail)}</span>`;
    document.getElementById('skill-build-scope').textContent = data.scope;
    nav.innerHTML = data.steps.map((s, i) => `<button type="button" data-lesson="${i + 1}" aria-controls="skill-build-panel"${i === current ? ' aria-current="step"' : ''}><span>${number(i)}</span><strong>${esc(s.short)}</strong><small>${esc(s.status)}</small></button>`).join('');
    panel.innerHTML = `<div class="skill-build-step-heading"><div><p class="eyebrow">STEP ${number(current)} / 06 · ${esc(step.status)}</p><h3 id="skill-build-step-title" tabindex="-1">${number(current)} · ${esc(step.title)}</h3><p>${esc(step.question)}</p></div></div>
      <div class="skill-build-why"><h4>为什么这样设计</h4><p>${esc(step.why)}</p></div>
      <div class="skill-build-design"><h4>这一步的实际设计</h4><dl>${step.design.map(row => `<dt>${esc(row.label)}</dt><dd>${esc(row.text)}</dd>`).join('')}</dl></div>
      <details class="skill-build-example"><summary>展开看具体例子</summary><pre><code>${esc(step.example)}</code></pre></details>
      <div class="skill-build-artifacts"><h4>打开这一步的产物</h4><div>${itemLinks(step.artifacts)}</div></div>
      <div class="skill-build-verify"><h4>怎样验证这一步</h4><ul>${step.verification.expected.map(text => `<li>${esc(text)}</li>`).join('')}</ul><p class="skill-build-result"><strong>实际记录</strong>${esc(step.verification.actual)}</p>${step.verification.evidence.length ? `<div class="skill-build-evidence">${itemLinks(step.verification.evidence)}</div>` : ''}</div>
      <details class="skill-build-reflect"><summary>停一下：用一个问题检查理解</summary><p>${esc(step.reflection)}</p></details>
      <div class="skill-build-pager"><button type="button" data-shift="-1"${current === 0 ? ' disabled' : ''}>← 上一步</button><span>第 ${current + 1} 步，共 6 步</span><button type="button" data-shift="1"${current === data.steps.length - 1 ? ' disabled' : ''}>下一步 →</button></div>`;
    if (focusHeading) document.getElementById('skill-build-step-title').focus({preventScroll:true});
  }
  function select(index) {
    if (!Number.isInteger(index) || index < 0 || index >= data.steps.length) return;
    current = index;
    const url = new URL(location.href);
    url.searchParams.set('lesson', String(index + 1));
    url.hash = 'build-skill';
    history.pushState(null, '', url);
    render(true);
    panel.scrollIntoView({block:'start', behavior:'auto'});
  }
  nav.addEventListener('click', event => {
    const button = event.target.closest('button[data-lesson]');
    if (button) select(Number(button.dataset.lesson) - 1);
  });
  panel.addEventListener('click', event => {
    const button = event.target.closest('button[data-shift]');
    if (button && !button.disabled) select(current + Number(button.dataset.shift));
  });
  window.addEventListener('popstate', () => { current = fromUrl(); render(); });
  render();
})();
