(() => {
'use strict';
if('scrollRestoration' in history)history.scrollRestoration='manual';
const {meta,items,directions,showcases,shortlist}=window.PRODUCT_REFERENCE_LIBRARY;
const $=selector=>document.querySelector(selector);
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const external=(url,label,cls='')=>`<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
const tag=(label,cls='')=>`<span class="tag ${cls}">${esc(label)}</span>`;
const num=id=>String(id).padStart(2,'0');
const labels={data:'数据与内容',frontend:'前端方案',backend:'后台与运维',rights:'使用与授权',cost:'成本构成',risks:'关键限制',mvp:'最小验证路径'};
const state={category:'',direction:'',showcase:'site-01'};
const searchable=new Map(items.map(item=>[item.id,JSON.stringify({number:num(item.id),item,sourceCases:showcases.filter(s=>s.siteIds.includes(item.id))}).toLocaleLowerCase()]));

const relatedButtons=ids=>ids.map(id=>`<button class="ref-link" type="button" data-reveal="${id}">${num(id)} ${esc(items.find(i=>i.id===id).name)}</button>`).join('');
const siteShowcases=showcases.filter(s=>s.siteIds.length===1).sort((a,b)=>a.siteIds[0]-b.siteIds[0]);
const mediaLabel=source=>source.mediaLabel||(source.preview.type==='none'?'在原站查看':source.preview.type==='video'?'页内可播 · 官方视频':'页内可看 · 官方原图');
const evidenceLink=source=>source.evidenceUrl&&source.evidenceUrl!==source.entryUrl
  ? external(source.evidenceUrl,'原始效果说明','source-direct'):'';
function mediaThumbnail(source,layout){
  if(source.preview.type==='none')return '';
  const isVideo=source.preview.type==='video';
  return `<button class="${layout}-preview" type="button" data-showcase="${esc(source.id)}" aria-label="查看${esc(source.title)}">
    ${isVideo?`<video muted preload="none" aria-hidden="true"><source src="${esc(source.preview.url)}" type="video/mp4"></video>`:`<img src="${esc(source.preview.url)}" alt="" loading="lazy" decoding="async">`}
    <span class="${layout==='card'?'card-preview-caption':''}">${esc(mediaLabel(source))} · 看详情</span></button>`;
}
$('#inline-media').innerHTML=siteShowcases.filter(source=>source.preview.type!=='none').map(source=>{
  const item=items.find(item=>item.id===source.siteIds[0]);
  return `<a href="#showcase-${esc(source.id)}">${num(item.id)} ${esc(item.name)}</a>`;
}).join('');
function renderSourcePicker(){
  $('#source-picker').innerHTML=meta.categories.map(category=>`<optgroup label="${esc(category.name)}">${items.filter(i=>i.category===category.name).map(i=>{const s=siteShowcases.find(s=>s.siteIds[0]===i.id);return `<option value="${esc(s.id)}">${num(i.id)} · ${esc(i.name)}</option>`;}).join('')}</optgroup>`).join('')+'<optgroup label="原始出处"><option value="post">原帖配视频（制作来源未知）</option></optgroup>';
}
const caseForSite=id=>showcases.filter(s=>s.siteIds.includes(id));
function showActual(id,{scroll=false,hash=false}={}){
  const source=showcases.find(s=>s.id===id);if(!source)return;
  state.showcase=id;
  const previous=$('#source-stage video');if(previous)previous.pause();
  $('#source-picker').value=id;
  const index=siteShowcases.findIndex(s=>s.id===id);
  $('#showcase-position').textContent=index<0?'原帖配视频 · 不计入50站':`${num(index+1)} / 50 · ${esc(items.find(i=>i.id===source.siteIds[0]).category)}`;
  $('#source-previous').disabled=index<=0;
  $('#source-next').disabled=index<0||index>=siteShowcases.length-1;
  const label=mediaLabel(source);
  $('#source-stage').innerHTML=`<div class="actual-stage-head"><span>${esc(label)}</span>${external(source.entryUrl,source.entryLabel,'stage-open')}</div>`+
    (source.preview.type==='video'?`<video id="source-video" controls playsinline preload="metadata" aria-label="${esc(source.title)}"><source src="${esc(source.preview.url)}" type="video/mp4"></video><p id="media-status" role="status">点击播放官方视频。</p>`:
     source.preview.type==='image'?`<a class="actual-preview-link" href="${esc(source.entryUrl)}" target="_blank" rel="noopener noreferrer" aria-label="打开原站：${esc(source.title)}"><img src="${esc(source.preview.url)}" alt="${esc(source.title)}的原站画面" referrerpolicy="no-referrer"></a><p class="preview-note">图像用于预览；请通过入口查看原始页面和功能。</p>`:
     `<div class="no-preview"><p>${esc(source.availability||'此条效果在原站运行。通过上方入口查看对应的功能、作品或视频。')}</p>${evidenceLink(source)}</div>`);
  const video=$('#source-video');
  const image=$('#source-stage img');
  if(image)image.addEventListener('error',()=>{
    const note=$('#source-stage .preview-note');
    if(note)note.textContent='画面暂时未能加载，请用上方入口查看原站。';
  });
  if(video){
    const status=$('#media-status'),fail=()=>status.textContent='视频暂时无法加载，请打开来源页观看。';
    video.addEventListener('loadedmetadata',()=>status.textContent='官方视频 · '+Math.round(video.duration)+' 秒 · 点击播放');
    video.addEventListener('playing',()=>status.textContent='正在播放官方视频');
    video.addEventListener('error',fail);video.querySelector('source').addEventListener('error',fail);
  }
  $('#showcase-title').textContent=source.title;
  $('#showcase-summary').textContent=source.summary;
  $('#source-credit').textContent=source.attribution;
  if(source.rights){
    $('#source-credit').insertAdjacentHTML('beforeend',' · '+external(source.rights.url,source.rights.label));
  }
  $('#source-case-info').innerHTML=`<span class="case-kind">${esc(source.kind)}</span><h3>这个来源能给我们什么？</h3>
    <div class="info-step"><span>01</span><div><h4>看的是谁的效果</h4><p>${source.siteIds.length?source.siteIds.map(id=>num(id)+' '+esc(items.find(i=>i.id===id).name)).join('、'):'原帖附带视频；对应网站尚未确认'}</p>${external(source.entryUrl,source.entryLabel,'source-direct')}</div></div>
    <div class="info-step"><span>02</span><div><h4>可以借鉴什么</h4><p>${esc(source.borrow)}</p></div></div>
    <div class="info-step"><span>03</span><div><h4>可以做什么 · 设想</h4><p>${esc(source.use)}</p></div></div>
    <details class="effect-condition"><summary>来源与核实范围</summary><p>${esc(source.verification)}</p>${evidenceLink(source)}</details>
    <div class="references">${relatedButtons(source.siteIds)}</div>`;
  if(hash)history.replaceState(null,'','#showcase-'+id);
  if(scroll)$('#effects').scrollIntoView({behavior:'auto',block:'start'});
}
function renderCategories(){
  $('#category-nav').innerHTML=[{name:'全部网站',count:items.length},...meta.categories].map((c,i)=>`<button class="category-button" data-category="${i?esc(c.name):''}" aria-pressed="${state.category===(i?c.name:'')}"><span>${esc(c.name)}</span><span>${c.count}</span></button>`).join('');
}
function card(item){
  const e=item.experience,cases=caseForSite(item.id),source=cases[0];
  const ideas=item.productIdeas.map(p=>`<div class="idea"><b>${esc(p.name)}</b><p>${esc(p.scenario)}</p><p class="mvp">最小版本：${esc(p.mvp)}</p></div>`).join('');

  return `<article class="reference-card" id="site-${num(item.id)}">
    <div class="card-overview"><div class="card-topline"><span class="card-index">REF / ${num(item.id)}</span><span class="card-category">${esc(item.category)}</span></div>
    <div class="card-title-row"><div><h3 class="card-title">${esc(item.name)}</h3><a class="source-domain" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(new URL(item.url).hostname)} ↗</a></div><span class="source-number">${num(item.id)}</span></div>
    ${mediaThumbnail(source,'card')||'<p class="source-mode">在原站查看实际效果</p>'}
    <div class="source-answer"><span>原站能做什么</span><p>${esc(source.summary)}</p></div>
    <div class="source-answer"><span>可借鉴什么</span><p>${esc(source.borrow)}</p></div>
    <div class="source-answer"><span>来源价值</span><p>${esc(e.value)}</p></div>
    <div class="source-use"><span>可以做什么 · 我们的设想</span><p>${esc(source.use)}</p></div>
    <div class="source-actions">${external(source.entryUrl,source.entryLabel,'button-primary')}${external(e.resource.url,e.resource.label,'button-secondary')}${evidenceLink(source)}<button class="case-link" type="button" data-showcase="${esc(source.id)}">查看效果说明 ↑</button></div></div>
    <details class="research-details"><summary>展开研究条件与证据 <span>＋</span></summary><div class="card-body"><div class="card-identity"><div class="card-tags">${item.capabilities.map(t=>tag(t)).join('')}</div><span>${esc(item.evidence.level)} · ${esc(item.evidence.checkedAt)}</span></div>
    <div class="card-summary-footer"><span>${esc(item.access.join(' · '))}</span><span>原型难度 ${esc(item.difficulty)} / ${esc(item.priority)}</span></div>
    <div class="body-grid"><div class="body-block"><h4>用户与需求</h4><p>${esc(item.audience)}</p><h4>可借鉴机制</h4><ul>${item.mechanisms.map(m=>`<li>${esc(m)}</li>`).join('')}</ul></div><div class="body-block"><h4>产品设想与最小版本</h4>${ideas}</div><div class="body-block full"><h4>实现条件与建议方案</h4><dl class="implementation">${Object.entries(labels).map(([key,label])=>`<dt>${label}</dt><dd>${esc(item.implementation[key])}</dd>`).join('')}</dl></div><div class="body-block full sources"><h4>来源与核查范围</h4><p class="source-scope">${esc(item.evidence.summary)}</p><ul>${item.sources.map(s=>`<li>${external(s.url,s.title)}：${esc(s.supports)}</li>`).join('')}</ul></div></div></div></details></article>`;
}
function render(){
  const query=$('#search').value.trim().toLocaleLowerCase();
  const siteNumber=/^\d{1,2}$/.test(query)?Number(query):null;
  const words=query.split(/\s+/).filter(Boolean);
  const activeDirection=directions.find(d=>d.id===state.direction);
  const shown=items.filter(i=>(!state.category||i.category===state.category)&&(!activeDirection||activeDirection.referenceIds.includes(i.id))&&(!$('#access').value||i.access.includes($('#access').value))&&(!$('#difficulty').value||i.difficulty===$('#difficulty').value)&&(!$('#priority').value||i.priority===$('#priority').value)&&(siteNumber===null?words.every(w=>searchable.get(i.id).includes(w)):i.id===siteNumber));
  $('#cards').innerHTML=shown.map(card).join('');
  $('#result-count').textContent=`显示 ${shown.length} / ${items.length} 个网站 · 保留原帖编号`;
  $('#active-context').textContent=activeDirection?'产品方向：'+activeDirection.name:state.category||'全部来源';
  $('#empty').hidden=shown.length>0;renderCategories();
}
function clearFilters(){state.category='';state.direction='';for(const id of ['search','access','difficulty','priority'])$('#'+id).value='';}
function reveal(id){
  const item=items.find(i=>i.id===Number(id));if(!item)return;
  clearFilters();render();const target=$('#site-'+num(item.id));
  target.classList.add('is-expanded');
  target.querySelector('details').open=true;target.scrollIntoView({behavior:'auto',block:'start'});
  target.querySelector('.button-primary').focus({preventScroll:true});
}

function renderShortlist(id=shortlist.items[0].id){
 const d=shortlist.items.find(candidate=>candidate.id===id);if(!d)return;
 $('#priority-tabs').innerHTML=shortlist.items.map(candidate=>`<button type="button" data-priority="${esc(candidate.id)}" aria-pressed="${candidate.id===d.id}"><span>0${candidate.rank} / ${esc(candidate.decision)}</span><strong>${esc(candidate.name)}</strong><small>${esc(candidate.deliverable)}</small></button>`).join('');
 $('#priority-panel').innerHTML=`<article class="priority-detail" aria-labelledby="priority-title"><div class="priority-title-line"><span class="eyebrow">PRIORITY / 0${d.rank}</span><span class="tag">${esc(d.decision)}</span></div><h3 id="priority-title">${esc(d.name)}</h3><p class="priority-value">${esc(d.value)}</p><div class="priority-context"><div><h4>服务谁 · 什么时刻会用</h4><p>${esc(d.user)}${esc(d.scene)}</p></div><div><h4>为什么进入前5</h4><p>${esc(d.why)}</p></div></div><h4 class="priority-subhead">对应的真实效果与入口</h4><div class="priority-sources">${d.references.map(r=>{const source=siteShowcases.find(s=>s.siteIds[0]===r.siteId);return `<div class="priority-source ${source.preview.type==='none'?'is-external':''}">${mediaThumbnail(source,'priority')}<h5>${num(r.siteId)} ${esc(items.find(i=>i.id===r.siteId).name)}</h5><p>${esc(r.takeaway)}</p><div class="priority-source-scope">${esc(mediaLabel(source))}</div>${external(source.entryUrl,'打开对应原站','priority-origin')}</div>`;}).join('')}</div><div class="priority-borrow"><h4>我们借鉴什么，并增加什么</h4><p>${esc(d.borrow)}</p></div><div class="priority-plan"><div><h4>第一版交付什么</h4><p class="priority-scope">${esc(d.v1Scope)}</p><ol>${d.workflow.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><h4>怎样实现</h4><p>${esc(d.implementation)}</p></div><div><h4>开始前需要什么</h4><ul>${d.conditions.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><h4>怎样判断值得继续</h4><p>${esc(d.acceptance)}</p><p class="priority-effort">${esc(d.effort)}</p></div></div><details class="priority-later"><summary>后续再做什么 · 官方接入依据</summary><p>${esc(d.defer)}</p><ul>${d.evidence.map(e=>`<li>${external(e.url,e.title)}：${esc(e.supports)}</li>`).join('')}</ul></details></article>`;
}

function hashRoute(){
  const priorityMatch=location.hash.match(/^#priority-([\w-]+)$/);if(priorityMatch&&shortlist.items.some(d=>d.id===priorityMatch[1])){renderShortlist(priorityMatch[1]);$('#top-five').scrollIntoView({behavior:'auto',block:'start'});return;}
  let match=location.hash.match(/^#site-(\d+)$/);if(match){reveal(match[1]);return;}
  match=location.hash.match(/^#showcase-([\w-]+)$/);if(match&&showcases.some(s=>s.id===match[1])){showActual(match[1],{scroll:true});return;}
  const legacy={sound:'site-45',moon:'post',quake:'site-06',wind:'site-04',scale:'site-20',data:'site-27',archive:'site-42',pudding:'site-25',listen:'site-45','deep-sea':'site-19','nasa-eyes':'site-21',gapminder:'site-27',met:'site-42'};
  match=location.hash.match(/^#effect-([\w-]+)$/);if(match){showActual(legacy[match[1]]||'site-01',{scroll:true,hash:true});return;}
  match=location.hash.match(/^#showcase-([\w-]+)$/);if(match&&legacy[match[1]])showActual(legacy[match[1]],{scroll:true,hash:true});
}
$('#source-count').textContent=items.reduce((n,i)=>n+i.sources.length,0);
$('#access').insertAdjacentHTML('beforeend',meta.accessNames.map(name=>`<option>${esc(name)}</option>`).join(''));
$('#direction-cards').innerHTML=directions.map((d,index)=>`<details class="direction-card" id="direction-${esc(d.id)}"><summary><div class="direction-number"><span>DIRECTION / ${num(index+1)}</span>${tag(d.priority,'priority')}</div><h3>${esc(d.name)}</h3><p>${esc(d.need)}</p></summary><div class="direction-detail"><h4>组合机制</h4><p>${esc(d.mechanism)}</p><div class="references">${relatedButtons(d.referenceIds)}</div><h4>最小版本</h4><p>${esc(d.mvp)}</p><h4>实现条件</h4><p>${esc(d.conditions)}</p><h4>怎样验收</h4><p>${esc(d.acceptance)}</p><h4>与现有研究的联系</h4><p>${esc(d.connection)}</p><h4>范围边界</h4><p>${esc(d.boundary)}</p><button class="direction-filter" type="button" data-direction="${esc(d.id)}">查看这一方向的 ${d.referenceIds.length} 个参考网站 ↑</button></div></details>`).join('');
$('#category-nav').addEventListener('click',event=>{
  const button=event.target.closest('[data-category]');if(!button)return;
  state.category=button.dataset.category;state.direction='';render();$('#library').scrollIntoView({behavior:'auto'});
});
for(const id of ['search','access','difficulty','priority'])$('#'+id).addEventListener(id==='search'?'input':'change',render);
$('#clear').addEventListener('click',()=>{clearFilters();render();});
document.addEventListener('click',event=>{
  const priority=event.target.closest('button[data-priority]');if(priority){renderShortlist(priority.dataset.priority);$('#priority-tabs button[data-priority="'+priority.dataset.priority+'"]').focus({preventScroll:true});history.replaceState(null,'','#priority-'+priority.dataset.priority);return;}
  const actual=event.target.closest('button[data-showcase]');if(actual){showActual(actual.dataset.showcase,{scroll:true,hash:true});return;}
  const ref=event.target.closest('[data-reveal]');if(ref){reveal(ref.dataset.reveal);history.replaceState(null,'','#site-'+num(Number(ref.dataset.reveal)));return;}
  const direction=event.target.closest('[data-direction]');if(direction){clearFilters();state.direction=direction.dataset.direction;render();$('#library').scrollIntoView({behavior:'auto'});}
});
$('#cards').addEventListener('toggle',event=>{
  if(!event.target.matches('.research-details'))return;
  event.target.closest('.reference-card').classList.toggle('is-expanded',event.target.open);
},true);
window.addEventListener('hashchange',hashRoute);
window.addEventListener('pagehide',()=>{const video=$('#source-video');if(video)video.pause();});
renderSourcePicker();
$('#source-picker').addEventListener('change',event=>showActual(event.target.value,{hash:true}));
for(const [buttonId,step] of [['source-previous',-1],['source-next',1]])$('#'+buttonId).addEventListener('click',()=>{
 const index=siteShowcases.findIndex(s=>s.id===state.showcase),next=siteShowcases[index+step];
 if(next)showActual(next.id,{hash:true});
});
renderShortlist();
$('#priority-assumption').textContent=shortlist.assumption;
$('#priority-recommendation').textContent=shortlist.recommendation;
$('#priority-gaps').innerHTML=shortlist.gaps.map(g=>`<li>${esc(g)}</li>`).join('');
$('#priority-deferred').innerHTML=shortlist.deprioritized.map(d=>`<li><strong>${esc(d.name)} · ${esc(d.decision)}</strong><span>${esc(d.reason)}</span></li>`).join('');
render();showActual('site-01');hashRoute();
})();
