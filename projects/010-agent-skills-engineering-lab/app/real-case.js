(() => {
  'use strict';
  const data = globalThis.REAL_CASE;
  if (!data) return;
  const skills = globalThis.AGENT_SKILLS_GUIDE || [];
  const catalog = Array.isArray(skills) ? skills : skills.skills || [];
  const names = new Map(catalog.map(s => [s.slug, s.name]));
  const e = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const skillLink = slug => `<a href="index.html#skill=${encodeURIComponent(slug)}">${e(names.get(slug) || slug)}</a>`;
  const nav = document.getElementById('phase-nav');
  const content = document.getElementById('phase-content');
  let current = 0;
  document.getElementById('case-reasons').innerHTML = data.selectionReasons.map((x,i) => `<p><b>0${i+1}</b>${e(x)}</p>`).join('');
  document.getElementById('need-evidence').innerHTML = data.sourceEvidence.map(x=>`<p><strong>${e(x.label)}</strong><br>${e(x.reason)}<br><small>${e(x.path)}</small></p>`).join('');
  nav.innerHTML = data.phases.map((x,i) => `<button type="button" data-phase="${i}"><span>0${i+1}</span>${e(x.title.replace(/^\d+\s*·\s*/,''))}</button>`).join('');
  function openPhase(index, move = true, write = true) {
    const phase = data.phases[index];
    if (!phase) return;
    current = index;
    nav.querySelectorAll('button').forEach((button,i) => {if(i === index) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');});
    content.innerHTML = `<p class="eyebrow">STEP 0${index+1} / 0${data.phases.length}</p><h3>${e(phase.title)}</h3><p class="phase-question">${e(phase.question)}</p><p class="phase-goal">${e(phase.goal)}</p><div class="skill-pills">${phase.skills.map(skillLink).join('')}</div><h4>这一步具体怎么做</h4><ol>${phase.actions.map(x=>`<li>${e(x)}</li>`).join('')}</ol><div class="control-note"><strong>它怎样控制落地</strong>${e(phase.control)}</div><h4>打开产物与证据</h4><div class="artifact-list">${phase.artifacts.map(x=>`<a href="${e(x.href)}">${e(x.label)} ↗</a>`).join('')}</div><details class="reflect-box"><summary>停一下，用这几个问题回顾</summary><ul>${phase.reflect.map(x=>`<li>${e(x)}</li>`).join('')}</ul></details><div class="phase-pager"><button type="button" data-step="-1" ${index===0?'disabled':''}>← 上一步</button><button type="button" data-step="1" ${index===data.phases.length-1?'disabled':''}>下一步 →</button></div>`;
    if (write) history.pushState(null, '', `#step=${encodeURIComponent(phase.id)}`);
    if (move) {content.focus({preventScroll:true});content.scrollIntoView({block:'start',behavior:'auto'});}
  }
  nav.addEventListener('click', event => {const b=event.target.closest('[data-phase]');if(b)openPhase(Number(b.dataset.phase));});
  content.addEventListener('click', event=>{const b=event.target.closest('[data-step]');if(b)openPhase(current+Number(b.dataset.step));});
  function followHash(initial=false){let id='';try{id=location.hash.startsWith('#step=')?decodeURIComponent(location.hash.slice(6)):'';}catch{id='';}const i=data.phases.findIndex(x=>x.id===id);if(i>=0)openPhase(i,!initial,false);else if(initial)openPhase(0,false,false);}
  window.addEventListener('hashchange',()=>followHash());followHash(true);
  document.getElementById('acceptance-list').innerHTML=data.acceptance.map(x=>`<article class="acceptance-item"><strong>${e(x.text)}</strong><p>${e(x.verify)}</p></article>`).join('');
  function coverage(){const filter=document.getElementById('coverage-filter').value;const rows=data.skillCoverage.filter(x=>filter==='all'||x.status===filter);document.getElementById('coverage-list').innerHTML=rows.map(x=>`<article class="coverage-row">${skillLink(x.slug)}<span class="state-badge ${x.status==='未触发'?'inactive':x.status==='待验证'?'pending':''}">${e(x.status)}</span><p><strong>${e(x.role)}</strong>${e(x.note)}</p></article>`).join('');document.getElementById('coverage-count').textContent=`显示 ${rows.length} / ${data.skillCoverage.length} 项`;}
  document.getElementById('coverage-filter').addEventListener('change',coverage);coverage();
  const evidence=globalThis.REAL_CASE_EVIDENCE;
  document.getElementById('evidence-summary').innerHTML = evidence ? evidence.summary.map(x=>`<article class="evidence-stat"><strong>${e(x.title)}</strong><p>${e(x.text)}</p></article>`).join('') : '<p>验证进行中，完成后记录实际结果。</p>';
  document.getElementById('failure-list').innerHTML = (evidence?.failures||[]).map(x=>`<details><summary>${e(x.title)}</summary><dl><dt>观察到什么</dt><dd>${e(x.symptom)}</dd><dt>为什么发生</dt><dd>${e(x.cause)}</dd><dt>怎样修复</dt><dd>${e(x.fix)}</dd><dt>用什么证明</dt><dd>${e(x.proof)}</dd></dl><div class="skill-pills">${x.skills.map(skillLink).join('')}</div></details>`).join('');
})();
