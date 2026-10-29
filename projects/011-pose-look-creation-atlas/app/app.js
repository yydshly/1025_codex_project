/* Research UI only: no uploads, model calls or remote tracking. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ext = (url, label, cls = '') => `<a class="${cls}" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} ↗</a>`;
const research = window.RESEARCH;
const archive = window.ARCHIVE_STATUS;
const backup = window.BACKUP_STATUS;
const state = {family:'all', query:'', selected:new Set(), scene:research.scenarios[0].id, look:'studio-a'};
let toastTimer;
function notify(message){const box=$('#toast');box.textContent=message;box.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{box.hidden=true;},3600);}

// Original vector drawings. They are diagrams, not copied source images or AI outputs.
function person(look = 'gown', color = '#ede7dc'){
  const skin = '#c8b6a3', stroke = '#707a6d';
  const head = `<path d="M187 84 Q181 60 193 53 Q211 47 219 65 L217 86" fill="#4e584f"/><ellipse cx="203" cy="73" rx="14" ry="19" fill="${skin}"/><path d="M190 68 Q202 66 210 54 Q221 62 217 77" fill="#4e584f"/><path d="M196 89 L195 103 L211 103 L209 89" fill="${skin}"/>`;
  const arms = `<path d="M181 107 Q172 121 165 154 L176 179 L183 176 L176 152 L186 120 M221 108 Q233 128 237 153 L225 174 L218 172 L227 151 L215 119" fill="none" stroke="${skin}" stroke-width="9" stroke-linecap="round"/>`;
  if(look==='suit')return head+arms+`<path d="M188 170 L180 281 L197 281 L204 205 L211 281 L228 281 L219 170" fill="#4f625b" stroke="${stroke}"/><path d="M180 105 L195 99 L203 113 L211 99 L224 105 L223 177 L182 177 Z" fill="#687c72" stroke="${stroke}"/><path d="M195 100 L202 143 L211 100 L203 110 Z" fill="#f7f2e8"/><path d="M189 104 L187 122 L202 143 M216 104 L219 122 L202 143 L202 177" fill="none" stroke="#394e43" stroke-width="1.2"/><circle cx="206" cy="153" r="1.3" fill="#d9d9cb"/><path d="M179 281 L197 281 L198 288 L175 288 Z M211 281 L228 281 L235 288 L211 288 Z" fill="#53594f"/>`;
  if(look==='qipao')return head+arms+`<path d="M194 97 L211 97 L211 103 L223 108 Q224 125 214 153 Q218 196 229 263 L205 270 L178 265 L187 153 Q178 126 182 109 L194 103 Z" fill="#ab7276" stroke="#85575f"/><path d="M200 100 Q216 117 212 128 L204 132" fill="none" stroke="#e7c9ae" stroke-width="1.3"/><path d="M211 202 L218 266 M187 265 L187 283 L195 283 L200 266 M213 269 L216 283 L224 283 L222 267" fill="none" stroke="${skin}" stroke-width="6"/><path d="M181 286 L195 282 M214 284 L229 287" stroke="#5d5e53" stroke-width="5" stroke-linecap="round"/><g fill="none" stroke="#d9b29e" stroke-width="1"><path d="M192 155 Q211 165 210 182 Q198 172 192 155 M205 188 Q186 193 187 210 Q202 205 205 188 M213 220 Q194 218 197 238 Q209 232 213 220"/><circle cx="209" cy="119" r="2"/><circle cx="211" cy="125" r="2"/></g>`;
  return `<path d="M195 57 Q178 47 168 75 L155 187 L246 187 L228 77 Q223 54 211 55" fill="#faf7ef" opacity=".38" stroke="#c6c6b6"/>`+head+arms+`<path d="M182 106 Q190 101 198 112 Q207 100 219 106 L216 138 L219 158 L235 193 L273 277 Q206 300 134 277 L171 193 L185 157 L188 137 Z" fill="${color}" stroke="${stroke}" stroke-width="1.1"/><path d="M182 106 Q190 120 203 114 Q215 121 219 106 M188 139 Q201 145 216 139 M185 157 Q201 164 219 158" fill="none" stroke="#adb09f" stroke-width="1.1"/><path d="M186 165 Q178 217 153 278 M197 164 L184 287 M207 165 L216 288 M217 165 Q227 216 252 281" fill="none" stroke="#c4c5b5" stroke-width="1.1"/><g fill="none" stroke="#c3c5b2" stroke-width=".8"><path d="M178 179 Q194 188 222 179 M170 200 Q195 210 233 200 M154 243 Q200 259 254 243" stroke-dasharray="2 4"/><path d="M183 123 Q195 130 205 122 Q212 132 216 123"/></g><path d="M191 283 L196 292 M218 285 L225 291" stroke="#6e7467" stroke-width="3" stroke-linecap="round"/>`;
}
function art(look){return `<svg viewBox="0 0 410 320" role="img" aria-label="${{gown:'婚纱',suit:'礼服',qipao:'旗袍'}[look]}造型原创矢量示意"><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#d6d8cb" stroke-width=".6"/></pattern></defs><path d="M67 280 V130 A138 138 0 0 1 276 15 Q344 50 345 128 V280 Z" fill="#e0e4d7"/><circle cx="284" cy="82" r="48" fill="#efede4" opacity=".8"/><path d="M35 281H375 L405 315H5Z" fill="url(#grid)"/><path d="M52 280H359" stroke="#bcc4b2"/><ellipse cx="205" cy="290" rx="91" ry="9" fill="#b1bba5" opacity=".22"/>${person(look)}<g fill="none" stroke="#8e9986" stroke-width=".7"><path d="M47 110H79 M47 110V142 M330 110H362V142 M47 249V270H78 M332 270H362V249"/><path d="M302 123L275 142 M94 196L142 202"/></g><g fill="#7a8571" font-size="7" font-family="sans-serif" letter-spacing="1"><text x="302" y="117">LOOK</text><text x="58" y="191">POSE</text><text x="312" y="254">A + B + C</text></g></svg>`;}
function icon(kind, color = 'rose'){
  const palette={rose:['#a87076','#ecdfdb'],sage:['#698273','#dfe6db'],sand:['#a4906f','#eae2d3']};
  const [line,fill]=palette[color]||palette.rose;
  const paths={
    gown:'M21 12L27 15L33 12L38 21L34 33L48 61Q28 70 8 61L22 33L18 21Z M22 33Q28 36 34 33 M26 38L21 62 M31 38L36 62',
    veil:'M15 23Q14 7 28 6Q42 7 41 23L48 61Q28 69 8 61Z M20 18Q28 10 36 18L34 33Q28 40 22 33Z M25 38L24 45L17 50 M31 38L32 45L39 50',
    frame:'M5 14H51V62H5Z M11 14V8H45V14 M12 55L22 37L29 45L36 31L46 55 M40 22A4 4 0 1 0 40 30A4 4 0 1 0 40 22',
    pair:'M17 22A6 6 0 1 0 17 10A6 6 0 1 0 17 22 M10 27L24 27L27 61L7 61Z M38 22A6 6 0 1 0 38 10A6 6 0 1 0 38 22 M32 27L44 27L48 42L40 42L42 62L32 62L34 42L28 42Z',
    suit:'M18 13L27 20L36 13L44 20L41 43L36 43L39 64L29 64L27 46L25 64L15 64L18 43L13 43L10 20Z M19 15L27 35L35 15 M27 35L27 43',
    qipao:'M23 10H32V15L39 20L36 35L43 63L27 66L13 63L21 35L17 20L23 15Z M27 12L34 23L28 27 M34 47L36 63',
    catalog:'M6 13H43V61H6Z M13 8H50V55 M17 27L23 30L29 27L33 34L30 41L36 53H10L16 41L13 34Z M12 20H35',
    series:'M5 21H34V64H5Z M13 14H42V57 M21 7H50V50 M15 29A5 5 0 1 0 25 29A5 5 0 1 0 15 29 M14 39H26L29 55H11Z'
  };
  return `<svg viewBox="0 0 56 74" aria-hidden="true"><path d="${paths[kind]||paths.gown}" fill="${fill}" stroke="${line}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function setLook(look){
  if(!$('#hero-result')||!window.EXPERIMENTS)return;
  const asset=window.EXPERIMENTS.assets.find(item=>item.id===look);
  if(!asset)return;
  state.look=look;$('#hero-result').src=asset.path;$('#hero-result').alt=asset.label;
  $('#art-caption').textContent=asset.label;
  $$('[data-look]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.look===look)));
}

const branchView=document.body.dataset.view==='branch';
const tabs=branchView?['thinking','effects','scenarios']:['understanding','tools','archive'];
function showTab(name, scroll = false){
  if(!branchView&&['thinking','effects','scenarios'].includes(name)){location.replace('branch.html#'+name);return;}
  if(branchView&&['understanding','tools','archive'].includes(name)){location.replace('index.html#'+name);return;}
  if(!tabs.includes(name))name=tabs[0];
  $$('.panel').forEach(p=>{p.hidden=p.id!==name;});
  $$('[data-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.tab===name));b.tabIndex=b.dataset.tab===name?0:-1;});
  if(scroll)$('#content').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.tab;}));
$('.section-nav').addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();let index=tabs.indexOf(document.activeElement.dataset.tab);
  index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;
  location.hash=tabs[index];$(`#tab-${tabs[index]}`).focus();
});
window.addEventListener('hashchange',()=>showTab(location.hash.slice(1),true));
$$('[data-look]').forEach(b=>b.addEventListener('click',()=>setLook(b.dataset.look)));

function archiveFor(tool){return archive.repositories.find(r=>r.repository===tool.repo);}
function toolHTML(tool, index){
  const pinned=archiveFor(tool);
  const fields=[['输入',tool.input],['输出',tool.output],['实际能力',tool.ability],['机位与相机',tool.camera],['限制与后续工作',tool.limit],['许可边界',tool.license]];
  return `<article class="tool-item"><details data-tool="${tool.id}"><summary><div><span class="tool-badge">${escapeHTML(tool.label)}</span><span class="tool-index">${String(index+1).padStart(2,'0')}</span></div><div><h3>${escapeHTML(tool.name)}</h3><p>${escapeHTML(tool.lead)}</p></div><p class="tool-summary-output">${escapeHTML(tool.output)}</p></summary><div class="tool-details"><dl>${fields.map(([title,value])=>`<div><dt>${title}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}<div class="wide"><dt>查阅 / 验证程度</dt><dd>${escapeHTML(tool.evidence)}</dd></div></dl><div class="wide">${ext(tool.url,'原始项目 / 来源','source-link')}${pinned?` · <a class="source-link" href="#archive">已留存 ${pinned.files.length} 份固定版本资料 →</a>`:''}</div></div></details><div class="tool-subrow"><p class="tool-evidence">${escapeHTML(tool.evidence)}</p><label class="compare-select"><input type="checkbox" data-compare="${tool.id}" ${state.selected.has(tool.id)?'checked':''}>加入对比</label></div></article>`;
}
function renderTools(){
  const filtered=research.tools.filter(t=>(state.family==='all'||t.family===state.family)&&(!state.query||Object.values(t).join(' ').toLowerCase().includes(state.query)));
  $('#tool-count').textContent=`显示 ${filtered.length} / ${research.tools.length} 项 · 可勾选最多 3 项并排对比`;
  $('#tools-list').innerHTML=filtered.length?filtered.map(t=>toolHTML(t,research.tools.indexOf(t))).join(''):'<p class="empty">没有匹配的能力。试试其他关键词，或切回“全部”。</p>';
  $$('[data-compare]').forEach(box=>box.addEventListener('change',()=>{
    if(box.checked&&state.selected.size>=3){box.checked=false;notify('最多同时对比 3 项，请先取消一项。');return;}
    box.checked?state.selected.add(box.dataset.compare):state.selected.delete(box.dataset.compare);renderCompare();
  }));
}
function renderCompare(){
  const chosen=research.tools.filter(t=>state.selected.has(t.id));$('#compare-area').hidden=!chosen.length;
  $('#compare-table').innerHTML=chosen.length?`<table><thead><tr><th scope="col">能力</th>${chosen.map(t=>`<th scope="col">${escapeHTML(t.name)}</th>`).join('')}</tr></thead><tbody>${[['输入','input'],['输出','output'],['相机','camera'],['限制','limit'],['验证','evidence'],['许可','license']].map(([label,key])=>`<tr><th scope="row">${label}</th>${chosen.map(t=>`<td>${escapeHTML(t[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'';
}
$$('[data-family]').forEach(b=>b.addEventListener('click',()=>{state.family=b.dataset.family;$$('[data-family]').forEach(item=>item.setAttribute('aria-pressed',String(item===b)));renderTools();}));
$('#tool-search')?.addEventListener('input',event=>{state.query=event.target.value.trim().toLowerCase();renderTools();});
$('#clear-compare')?.addEventListener('click',()=>{state.selected.clear();renderCompare();$$('[data-compare]').forEach(b=>{b.checked=false;});});

const sceneDrafts=new Map();
function list(items){return `<ul>${items.map(item=>`<li>${escapeHTML(item)}</li>`).join('')}</ul>`;}
function renderScene(){
  const s=research.scenarios.find(item=>item.id===state.scene);
  $$('.scenario-choice').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===s.id)));
  $('#scenario-detail').innerHTML=`<div class="scenario-top">${icon(s.icon,s.color)}<div><p class="eyebrow">${escapeHTML(s.kicker)}</p><h3>${escapeHTML(s.name)}</h3><p>${escapeHTML(s.goal)}</p><p class="audience">适合 ${escapeHTML(s.audience)}</p></div></div><p class="value-line">价值假设：${escapeHTML(s.value)}</p><div class="plan-grid"><div class="wide"><h4>需要准备</h4>${list(s.inputs)}</div><div><h4>保持不变</h4>${list(s.fixed)}</div><div><h4>本轮改变</h4>${list(s.changes)}</div><div class="wide"><h4>交付什么</h4><p>${escapeHTML(s.output)}</p></div><div class="wide"><h4>怎样判断有用</h4>${list(s.criteria)}</div></div><p class="boundary"><b>能力边界</b>${escapeHTML(s.boundary)}</p><div class="prompt-box"><h4><label for="scene-prompt">可编辑的生成指令草稿</label></h4><textarea id="scene-prompt" spellcheck="false">${escapeHTML(sceneDrafts.get(s.id)||s.prompt)}</textarea><p class="small-note">A / B / C 对应自己准备的授权图片。指令需交给支持参考图的外部生成工具；本页不执行生图。</p><div class="plan-actions"><button id="copy-prompt" class="button dark">复制指令 ↗</button><button id="export-plan" class="button light">导出方案 JSON ↓</button></div></div>`;
  $('#scene-prompt').addEventListener('input',event=>sceneDrafts.set(s.id,event.target.value));
  $('#copy-prompt').addEventListener('click',async()=>{
    const value=$('#scene-prompt').value;
    try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(value);notify('指令已复制，可带着参考图到生成工具中使用。');}
    catch{const field=$('#scene-prompt');field.focus();field.select();notify('浏览器未开放剪贴板，请按 Ctrl+C 或长按复制已选指令。');}
  });
  $('#export-plan').addEventListener('click',()=>download(`pose-look-${s.id}.json`,{researchDate:research.date,...s,prompt:$('#scene-prompt').value,status:'Planning template; not a validated generation result.',sourcePage:'011-pose-look-creation-atlas'}));
}
if($('#scenario-list')){
$('#scenario-list').innerHTML=research.scenarios.map(s=>`<button class="scenario-choice" data-scene="${s.id}" aria-pressed="false" aria-controls="scenario-detail">${icon(s.icon,s.color)}<span><b>${escapeHTML(s.name)}</b><small>${escapeHTML(s.kicker)}</small></span></button>`).join('');
$$('[data-scene]').forEach(b=>b.addEventListener('click',()=>{state.scene=b.dataset.scene;renderScene();}));
}

function download(filename,data){
  const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('已准备下载，请在浏览器下载记录中查看。');
}
function renderBackup(){
  if(!backup){$('#backup-panel').innerHTML='<p>备份状态暂不可用，请查看项目研究文档。</p>';return;}
  const mib=(backup.totalBytes/1024**2).toFixed(1);
  const ref=backup.remoteCommit||'main';
  const base=backup.privateRepository;
  const links=ext(`${base}/tree/${ref}/original-images`,'原图目录','source-link')+' · '+ext(`${base}/blob/${ref}/metadata/original-index.json`,'原始索引','source-link')+(backup.clothing==='one-original-preview-only'?' · '+ext(`${base}/blob/${ref}/clothing-preview/author-contact-sheet.jpg`,'服装预告原图','source-link'):'');
  $('#backup-panel').innerHTML=`<div><span class="backup-status">${backup.remoteVerified?'● 原图完整 · 私有远端已核验':'◐ 原图本地已保存 · 远端状态待核验'}</span><h3>原始资源，单独保存。</h3><p>按原站原尺寸 PNG 索引逐张保存；本页不公开转载这些图片。</p>${ext(backup.privateRepository,'打开私有备份仓库','button dark')}<span class="backup-link">需要仓库访问权限。没有权限时 GitHub 可能显示 404。</span><p>${links}</p></div><div><div class="backup-metrics"><div><strong>${backup.verified.toLocaleString('en-US')}</strong><span>原尺寸 PNG / 预期 ${backup.expected.toLocaleString('en-US')}</span></div><div><strong>${backup.poseGroups}</strong><span>姿势组</span></div><div><strong>${mib}</strong><span>MiB · 图片总量</span></div></div><p>逐文件 SHA-256 校验；${backup.remoteVerified?'本地与远端 Git 对象逐项一致。':'远端尚未完成核验。'}</p><p>清单 SHA-256<br><code>${escapeHTML(backup.manifestSha256)}</code></p>${backup.remoteCommit?`<p>原图核验版本 <code>${escapeHTML(backup.remoteCommit.slice(0,12))}</code></p>`:''}<p>服装资料：${backup.clothing==='one-original-preview-only'?'仅保留 1 张原始预告拼图，未取得完整服装库。':'完整图库未确认；预告原图获取状态见私有备份。'}</p><a class="source-link" href="backup-summary.json" target="_blank" rel="noopener">本地备份摘要 ↗</a></div>`;
}
const archiveLicenseLabels={'anhao/ai-pose-gallery-zh':'代码 MIT · 素材排除','makehumancommunity/mpfb2':'代码 GPL · 核心资产 CC0','ekza-space/ekza-studio':'多项许可 · 读原文','zju3dv/GVHMR':'仅教育 / 研究 / 非营利','Tencent-Hunyuan/Hunyuan3D-2.1':'自定义社区许可'};
function renderArchive(){
  $('#sources-list').innerHTML=research.sources.map(s=>`<article><span class="source-kind">${escapeHTML(s.kind)}</span><h3>${ext(s.url,s.title)}</h3><p>${escapeHTML(s.note)}</p><span class="source-url">${escapeHTML(new URL(s.url).hostname+s.url.split(new URL(s.url).host)[1])}</span></article>`).join('');
  $('#archive-caption').textContent=`${archive.repositories.length} 个项目 · ${archive.fileCount} 份文件 · ${(archive.totalBytes/1024).toFixed(1)} KiB\n只存资料，不安装、不运行上游`;
  $('#archives-list').innerHTML=archive.repositories.map(r=>`<details class="archive-item"><summary><span>${escapeHTML(r.repository)}</span><small>${r.files.length} 份文件 · ${escapeHTML(archiveLicenseLabels[r.repository]||r.licenseTag||'按原文适用')}</small></summary><p>固定版本 <code>${escapeHTML(r.commit)}</code> · 分支 ${escapeHTML(r.branch)}</p><ul>${r.files.map(f=>`<li><a href="archive/${escapeHTML(f.path)}" target="_blank" rel="noopener">${escapeHTML(f.upstreamPath)} ↗</a><span>${f.bytes.toLocaleString('en-US')} B · ${ext(f.sourceUrl,'原始位置')}</span></li>`).join('')}</ul><p>文件许可按各自原文适用；快照不合并或扩大任何上游授权。哈希见 <a href="archive/manifest.json">清单</a>。</p></details>`).join('');
}
$('#download-research')?.addEventListener('click',()=>download('pose-look-research-index.json',{...research,archive,backup,experiments:window.EXPERIMENTS,resourceResearch:window.RESOURCE_RESEARCH}));
if($('#tools-list')){renderTools();renderCompare();}
if($('#scenario-list'))renderScene();
if($('#backup-panel'))renderBackup();
if($('#sources-list'))renderArchive();
setLook('studio-a');showTab(location.hash.slice(1));
