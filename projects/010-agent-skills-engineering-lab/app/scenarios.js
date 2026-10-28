(() => {
  'use strict';
  const catalog=globalThis.AGENT_SKILLS_GUIDE || [];
  const scenarios=globalThis.SKILL_SCENARIOS || [];
  const status=document.getElementById('scenario-count');
  if(catalog.length!==25 || scenarios.length!==25){status.textContent='场景资料尚未完整加载，请重新打开或阅读完整文字导览。';return;}
  const bySlug=new Map(catalog.map(s=>[s.slug,s]));
  const sceneBySlug=new Map(scenarios.map(s=>[s.slug,s]));
  const groups=[
    {id:'route',name:'选择工作方法',question:'现在该从哪一步进入？',skills:['using-agent-skills']},
    {id:'define',name:'明确目标与底线',question:'为什么做、做什么、怎样算好？',skills:['interview-me','idea-refine','spec-driven-development','constraint-driven-development']},
    {id:'prepare',name:'准备执行',question:'先后顺序、上下文与依据是否足够？',skills:['planning-and-task-breakdown','context-engineering','source-driven-development']},
    {id:'build',name:'实现功能',question:'怎样逐步做出可用、可测试的东西？',skills:['incremental-implementation','test-driven-development','frontend-ui-engineering','api-and-interface-design']},
    {id:'verify',name:'验证、质疑与纠错',question:'真的能用吗？出问题后怎么办？',skills:['browser-testing-with-devtools','debugging-and-error-recovery','doubt-driven-development']},
    {id:'quality',name:'检查并改善质量',question:'是否正确、安全、易维护、足够快？',skills:['code-review-and-quality','code-simplification','security-and-hardening','performance-optimization']},
    {id:'deliver',name:'交付与持续维护',question:'怎样发布、观察、交接并安全升级？',skills:['git-workflow-and-versioning','ci-cd-and-automation','deprecation-and-migration','documentation-and-adrs','observability-and-instrumentation','shipping-and-launch']}
  ];
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const readable=value=>catalog.reduce((text,skill)=>text.replaceAll(skill.slug,skill.name),String(value));
  const scenarioLink=slug=>`<a href="#scene-${esc(slug)}">${esc(bySlug.get(slug).name)}</a>`;
  document.getElementById('scenario-map').innerHTML=groups.map((g,i)=>`<article class="scenario-map-row"><div><h3><span>0${i+1}</span>${esc(g.name)} · ${g.skills.length} 项</h3><p>${esc(g.question)}</p></div><div class="map-skill-links">${g.skills.map(scenarioLink).join('')}</div></article>`).join('');
  let number=0;
  function card(slug){const s=sceneBySlug.get(slug),skill=bySlug.get(slug);number++;return `<details class="scenario-card" id="scene-${esc(slug)}"><summary><div class="scenario-name"><h4>${esc(skill.name)}</h4><span class="scenario-number">${String(number).padStart(2,'0')} / 25</span></div><p class="scenario-trigger">${esc(s.trigger)}</p><span class="scenario-project">场景举例 · ${esc(s.project)}</span><span class="scenario-expand">展开具体场景、任务说法与预期结果 ↓</span></summary><div class="scenario-body"><h5>结合近期项目看</h5><p>${esc(s.situation)}</p><h5>你可以这样提出任务</h5><blockquote class="scenario-request">${esc(s.request)}</blockquote><dl><dt>应得产物</dt><dd>${esc(s.deliverable)}</dd><dt>怎样验收</dt><dd>${esc(s.proof)}</dd><dt>使用边界</dt><dd>${esc(s.notFor)}</dd></dl><div class="scenario-control"><strong>它控制哪种落地风险</strong><p>${esc(s.control)}</p></div><h5>和相近技能有什么区别</h5><p>${esc(readable(s.distinction))}</p><h5>通常与谁配合</h5><div class="handoff">${s.handoff.map(scenarioLink).join('')}</div><div class="scenario-details-link"><a href="index.html#skill=${esc(slug)}">继续看步骤与实现原理 →</a><a href="../research/upstream/${esc(skill.sourcePath)}">技能原文 ↗</a></div></div></details>`;}
  document.getElementById('scenario-groups').innerHTML=groups.map((g,i)=>`<section class="scenario-group" id="group-${g.id}"><div class="scenario-group-heading"><h3>${i+1}. ${esc(g.name)}</h3><p>${esc(g.question)}</p></div><div class="scenario-cards">${g.skills.map(card).join('')}</div></section>`).join('');
  function update(){status.textContent=`全部 25 项均已列出 · 已展开 ${document.querySelectorAll('.scenario-card[open]').length} 项`;}
  document.getElementById('expand-scenarios').addEventListener('click',()=>{document.querySelectorAll('.scenario-card').forEach(x=>x.open=true);update();});
  document.getElementById('collapse-scenarios').addEventListener('click',()=>{document.querySelectorAll('.scenario-card').forEach(x=>x.open=false);update();});
  document.getElementById('scenario-groups').addEventListener('toggle',update,true);
  document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#scene-"]');if(!link)return;const target=document.getElementById(link.getAttribute('href').slice(1));if(target?.classList.contains('scenario-card'))target.open=true;});
  function follow(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}if(!id.startsWith('scene-'))return;const target=document.getElementById(id);if(target?.classList.contains('scenario-card')){target.open=true;target.scrollIntoView({block:'start'});}}
  window.addEventListener('hashchange',follow);follow();update();
})();
