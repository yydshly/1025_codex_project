'use strict';
(() => {
  const skills = window.AGENT_SKILLS_GUIDE;
  if (!Array.isArray(skills) || skills.length !== 25) {
    document.getElementById('result-count').textContent = '目录数据未加载，请使用完整文字版或先运行构建命令。';
    return;
  }
  const bySlug = new Map(skills.map((item, i) => [item.slug, { ...item, index: i }]));
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ul = values => `<ul>${values.map(x => `<li>${escape(x)}</li>`).join('')}</ul>`;
  const linkButton = (slug, extra = '') => `<button type="button" data-skill="${escape(slug)}">${escape(bySlug.get(slug).name)}${extra}</button>`;
  const search = document.getElementById('search');
  const stage = document.getElementById('stage');
  const list = document.getElementById('skill-list');
  const detail = document.getElementById('skill-detail');
  let selected = 'using-agent-skills';
  const phases = [
    ['需求','要做什么？','从想法、目标到验收标准'],
    ['规划','怎样推进？','拆成有顺序、可检查的任务'],
    ['实现','怎样做出来？','小步编码，结合界面与接口'],
    ['验证','真的有效吗？','检查运行表现，定位故障'],
    ['审查','还有什么问题？','审阅质量、安全和性能'],
    ['维护','怎样持续使用？','版本、发布、观测与迁移']
  ];
  document.getElementById('lifecycle').innerHTML = phases.map(([name, question, note], i) => `<button type="button" class="phase" data-stage="${name}"><span class="phase-no">0${i + 1} / ${name}</span><strong>${question}</strong><p>${note}</p><small>${skills.filter(x => x.stage === name).length} 项 · 查看目录 →</small></button>`).join('');
  function renderList() {
    const needle = search.value.trim().toLocaleLowerCase();
    const filtered = skills.filter(s => (stage.value === '全部' || s.stage === stage.value) && JSON.stringify(s).toLocaleLowerCase().includes(needle));
    list.innerHTML = filtered.map(s => `<button class="skill-card${selected === s.slug ? ' active' : ''}" type="button" data-skill="${escape(s.slug)}" aria-label="了解${escape(s.name)}" aria-pressed="${selected === s.slug}"><span class="num">${String(bySlug.get(s.slug).index + 1).padStart(2, '0')}</span><span><span class="tag">${escape(s.stage)}</span><h3>${escape(s.name)}</h3><p>${escape(s.question)}</p></span></button>`).join('');
    document.getElementById('result-count').textContent = `显示 ${filtered.length} / 25 项`;
    document.getElementById('empty').hidden = filtered.length !== 0;
  }
  function openSkill(slug, move = true, writeHash = true) {
    const s = bySlug.get(slug);
    if (!s) return;
    selected = slug;
    const example = s.example;
    detail.innerHTML = `<div class="detail-heading"><div><p class="eyebrow">单项详解 · ${escape(s.stage)} <span class="detail-count">${String(s.index + 1).padStart(2, '0')} / 25</span></p><h2>${escape(s.name)}</h2></div><a href="#catalog">返回完整目录 ↑</a></div><p class="detail-summary">${escape(s.summary)}</p><div class="detail-grid">
      <section class="detail-box"><h3>什么情况下用</h3>${ul(s.when)}<h4>这些情况不必套用</h4>${ul(s.notFor)}</section>
      <section class="detail-box"><h3>开始前要提供什么</h3>${ul(s.inputs)}<h4>完成后留下什么</h4>${ul(s.outputs)}</section>
      <section class="detail-box wide"><h3>具体怎么做</h3><ol class="method-steps">${s.steps.map(x => `<li>${escape(x)}</li>`).join('')}</ol></section>
      <section class="detail-box wide mechanism"><h3>为什么这样安排</h3><p>${escape(s.mechanism)}</p></section>
      <section class="detail-box wide worked-example"><span class="label">教学示例 · 不是本轮实测</span><h3>${escape(example.task)}</h3><dl><dt>起初的问题</dt><dd>${escape(example.before)}</dd><dt>应用这项方法</dt><dd><ol>${example.process.map(x => `<li>${escape(x)}</li>`).join('')}</ol></dd><dt>预期形成的产物</dt><dd>${escape(example.after)}</dd><dt>还要怎样验证</dt><dd>${escape(example.check)}</dd></dl></section>
      <section class="detail-box"><h3>它不能单独解决什么</h3>${ul(s.limits)}</section>
      <section class="detail-box"><h3>和哪些技能配合</h3><div class="connected">${s.connections.map(c => linkButton(c.slug, `<small>${escape(c.reason)}</small>`)).join('')}</div></section></div>
      <div class="reference-row"><a href="../research/upstream/${escape(s.sourcePath)}">本地技能原文 ↗</a><a href="https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/${escape(s.sourcePath)}" target="_blank" rel="noopener">固定版 GitHub 原文 ↗</a><code>${escape(slug)}</code></div>
      <div class="pager"><button type="button" ${s.index === 0 ? 'disabled' : `data-skill="${skills[s.index - 1]?.slug}"`}>← 上一项</button><span>${s.index + 1} / 25 · 按目录顺序阅读</span><button type="button" ${s.index === skills.length - 1 ? 'disabled' : `data-skill="${skills[s.index + 1]?.slug}"`}>下一项 →</button></div>`;
    renderList();
    if (writeHash) history.pushState(null, '', `#skill=${encodeURIComponent(slug)}`);
    if (move) {
      detail.focus({ preventScroll: true });
      detail.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }
  const distinctions = [
    {title:'需求访谈与想法细化', items:[['interview-me','把用户真正需要什么问清楚，解决目标含糊。'],['idea-refine','围绕已有想法展开多个方向，再比较与收敛。']]},
    {title:'规格、质量标准与计划', items:[['spec-driven-development','描述要做的功能、范围和验收行为。'],['constraint-driven-development','确定项目普遍遵守的质量底线，考虑可执行检查。'],['planning-and-task-breakdown','把已明确的工作安排成可逐步完成的任务。']]},
    {title:'测试、浏览器检查与调试', items:[['test-driven-development','开发时用失败测试定义期望，再写实现。'],['browser-testing-with-devtools','在真实浏览器观察页面、请求与运行状态。'],['debugging-and-error-recovery','已经出现错误时，找出原因并防止复发。']]},
    {title:'独立质疑与代码审查', items:[['doubt-driven-development','重要决定仍在形成时，让独立视角寻找反例。'],['code-review-and-quality','围绕已有代码或变更，系统提出具体问题。'],['security-and-hardening','深入输入、权限、数据和依赖等安全边界。']]},
    {title:'小步开发、版本与自动检查', items:[['incremental-implementation','决定一次实现多大范围的完整功能。'],['git-workflow-and-versioning','把变更记录成可追溯、可回退的版本。'],['ci-cd-and-automation','让既定检查在变更与交付过程中自动运行。']]},
    {title:'性能、观测与发布', items:[['performance-optimization','测量用户或系统的瓶颈，再做针对性改进。'],['observability-and-instrumentation','建立持续可见的日志、指标和追踪。'],['shipping-and-launch','在实际交付前确认就绪、分步发布和回退准备。']]},
    {title:'上下文与来源', items:[['context-engineering','组织当前任务需要的信息，并控制载入范围。'],['source-driven-development','核对技术决策是否有对应版本的权威资料支持。']]},
    {title:'简化与迁移', items:[['code-simplification','行为尽量保持不变，让实现更容易理解。'],['deprecation-and-migration','旧能力要退出或被替代时，管理用户、依赖和数据过渡。']]}
  ];
  document.getElementById('distinction-list').innerHTML = distinctions.map(d => `<article class="distinction"><h3>${d.title}</h3><dl>${d.items.map(([slug, text]) => `<dt><button type="button" class="text-button" data-skill="${slug}">${escape(bySlug.get(slug).name)}</button></dt><dd>${text}</dd>`).join('')}</dl></article>`).join('');
  const journey = [
    ['先定位任务与所需信息','判断是在探索想法、做功能还是处理故障；读取适用的项目规则，核对用到的技术资料。','using-agent-skills','context-engineering','source-driven-development'],
    ['把“想查资料”说清楚','弄清查谁的资料、怎样匹配、如何返回出处；比较可选方向，再形成需求与质量标准。','interview-me','idea-refine','spec-driven-development','constraint-driven-development'],
    ['安排实现方式与接口','拆分资料读取、搜索、结果展示等任务；规定输入输出与错误，再组织可操作的界面。','planning-and-task-breakdown','api-and-interface-design','frontend-ui-engineering'],
    ['逐步实现并检查关键判断','先完成最小搜索切片；用测试明确结果，保留版本记录，遇到重要假设时进行独立质疑。','incremental-implementation','test-driven-development','doubt-driven-development','git-workflow-and-versioning'],
    ['看真实运行，也处理失败','在浏览器输入、清空、切换和模拟异常；若“明明有资料却搜不到”，保留证据再定位。','browser-testing-with-devtools','debugging-and-error-recovery'],
    ['检查质量，再考虑改进','审查变更和边界；简化难懂实现；检查输入和权限；有测量证据后再优化速度。','code-review-and-quality','code-simplification','security-and-hardening','performance-optimization'],
    ['准备交付与持续维护','把检查放进自动化流程，记录关键决定，建立运行观测；交付前验证回退，未来升级时规划旧格式退出。文档和观测应随开发开始，而非最后补做。','ci-cd-and-automation','documentation-and-adrs','observability-and-instrumentation','shipping-and-launch','deprecation-and-migration']
  ];
  document.getElementById('journey-list').innerHTML = journey.map(([title, text, ...slugs], i) => `<article class="journey-step"><h3>${i + 1}. ${title}</h3><p>${text}</p><div class="journey-links">${slugs.map(slug => linkButton(slug)).join('')}</div></article>`).join('');
  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-skill],button[data-stage]');
    if (!button) return;
    if (button.dataset.skill) openSkill(button.dataset.skill);
    else {
      stage.value = button.dataset.stage;
      search.value = '';
      renderList();
      document.getElementById('catalog').scrollIntoView({block:'start'});
      stage.focus({preventScroll:true});
    }
  });
  search.addEventListener('input', renderList);
  stage.addEventListener('change', renderList);
  document.getElementById('reset').addEventListener('click', () => { search.value = ''; stage.value = '全部'; renderList(); });
  function followHash(initial = false) {
    if (location.hash.startsWith('#skill=')) {
      let slug;
      try { slug = decodeURIComponent(location.hash.slice(7)); } catch { return; }
      if (bySlug.has(slug)) openSkill(slug, true, false);
    } else if (initial) openSkill(selected, false, false);
  }
  window.addEventListener('hashchange', () => followHash());
  followHash(true);
})();
