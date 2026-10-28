(() => {
  'use strict';
  const corpus=globalThis.RECALL_CORPUS, core=globalThis.RecallCore;
  const $=id=>document.getElementById(id);
  if(!corpus || !core){$('snapshot-info').textContent='研究快照未加载，请确认页面文件完整后重试。';return;}
  const projects=new Map(corpus.projects.map(p=>[p.id,p]));
  const ids=[...projects.keys()];
  const stages={researching:'研究中',building:'构建中',completed:'已总结',archived:'已归档'};
  const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const query=$('recall-query'),filter=$('recall-status');
  let results=[], storage, notes={schemaVersion:1,notes:[]}, storageError='', noteId=ids[0], dirty=false, sourceTrigger=null;
  const say=(id,text,error=false)=>{$(id).textContent=text;$(id).dataset.state=error?'error':'ok';};
  try{storage=window.localStorage;const loaded=core.loadNotes(storage,ids);if(loaded.ok)notes=loaded.data;else storageError=loaded.error||'已保存内容无法读取';}catch{storageError='当前浏览器不允许保存。可以编辑并导出备份，关闭页面前请保存备份。';}
  const date=new Date(corpus.generatedAt);const built=Number.isNaN(date.getTime())?corpus.generatedAt:date.toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});
  $('snapshot-info').textContent=`已收录 ${ids.length} 个项目 · 快照生成 ${built}（北京时间） · 查询时不上传内容`;
  function safeUrl(value){try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}}
  function renderSearch(write=true){
    const start=performance.now();results=core.search(corpus,query.value,filter.value);const duration=performance.now()-start;
    $('recall-result-status').textContent=`找到 ${results.length} / ${ids.length} 个项目`;
    $('recall-results').innerHTML=results.map(({project:p,match:m})=>`<article class="recall-result" data-project="${escape(p.id)}"><span class="result-number">${escape(p.id)}</span><div><div class="result-top"><h3>${escape(p.name)}</h3><span class="result-stage">${escape(stages[p.status]||p.status)}</span></div><p class="result-summary">${escape(p.summary)}</p><div class="match-excerpt"><small>${m.kind==='readme'?'README 原文':'项目登记信息'} · ${escape(m.path)} · ${m.startLine}–${m.endLine} 行</small><p>${escape(m.kind==='registry'?p.summary:m.text)}</p></div><div class="result-actions"><button type="button" data-source="${escape(p.id)}">查看出处 · ${escape(p.id)}</button><button type="button" data-note="${escape(p.id)}">记录判断 · ${escape(p.id)}</button>${safeUrl(p.source)?`<a href="${escape(safeUrl(p.source))}" target="_blank" rel="noopener noreferrer">项目登记来源 ↗</a>`:''}<small>收录日期 ${escape(p.createdAt)}</small></div></div></article>`).join('');
    $('recall-empty').hidden=results.length!==0;
    if(write){const params=new URLSearchParams();if(query.value.trim())params.set('q',query.value.trim());if(filter.value!=='all')params.set('status',filter.value);history.replaceState(null,'',`${location.pathname}${params.size?'?'+params:''}${location.hash}`);}
    // 仅记录耗时与结果数，不记录搜索词或个人判断。
    globalThis.RECALL_LAST_METRIC={durationMs:Number(duration.toFixed(3)),resultCount:results.length,projectCount:ids.length};
  }
  function showSource(id,button){const row=results.find(r=>r.project.id===id);if(!row)return;sourceTrigger=button;const {project:p,match:m}=row;$('source-title').textContent=`${p.id} · ${p.name}`;$('source-location').textContent=`${m.path} · 第 ${m.startLine}–${m.endLine} 行 · 保存时的原文快照`;$('source-excerpt').textContent=m.text;$('source-full').textContent=p.readmeText;$('source-hash').textContent=`README SHA-256：${p.readmeSha256}`;$('source-panel').hidden=false;$('source-panel').focus({preventScroll:true});$('source-panel').scrollIntoView({block:'start'});}
  const savedText=id=>notes.notes.find(n=>n.projectId===id)?.text||'';
  function showNote(id,move=true){if(dirty&&id===noteId){say('note-status','保留当前未保存草稿。');if(move){$('notes-area').scrollIntoView({block:'start'});$('note-text').focus({preventScroll:true});}return true;}if(dirty&&id!==noteId){say('note-status','当前判断尚未保存。请先保存，或点击“恢复已保存内容”再切换。',true);$('note-project').value=noteId;$('notes-area').scrollIntoView({block:'start'});return false;}noteId=id;$('note-project').value=id;$('note-text').value=savedText(id);dirty=false;$('note-count').textContent=`${$('note-text').value.length} / 5000`;if(storageError)say('note-status',storageError+' 原记录没有被改写。',true);else say('note-status',savedText(id)?'已读取此项目保存的判断。':'可以开始记录你的判断。');if(move){$('notes-area').scrollIntoView({block:'start'});$('note-text').focus({preventScroll:true});}return true;}
  function persist(next){if(storageError){say('note-status',storageError+' 请先导出当前内容并保留原备份。',true);return false;}try{const latest=core.loadNotes(storage,ids);if(!latest.ok){say('note-status',latest.error+' 本次没有写入，请先导出草稿。',true);return false;}if(JSON.stringify(latest.data)!==JSON.stringify(notes)){say('note-status','另一页面已更新判断，本次未覆盖。请先导出草稿，再刷新读取最新内容。',true);return false;}const result=core.saveNotes(storage,next);if(!result.ok){say('note-status',result.error||'保存失败，请先复制或导出备份。',true);return false;}notes=next;return true;}catch{say('note-status','保存失败。编辑内容仍在页面中，请复制或导出备份。',true);return false;}}
  function withDraft(){const text=$('note-text').value;return{schemaVersion:1,notes:[...notes.notes.filter(n=>n.projectId!==noteId),...(text?[{projectId:noteId,text}]:[])]};}
  function exportText(){const data=dirty?withDraft():notes;const text=JSON.stringify(data,null,2);$('backup-output').value=text;say('backup-status',dirty?'备份已包含当前未保存草稿；请复制文本或下载 JSON。':'备份文本已生成，包含当前浏览器保存的判断。');return text;}
  $('recall-search-form').addEventListener('submit',event=>{event.preventDefault();renderSearch();});
  query.addEventListener('input',()=>renderSearch());filter.addEventListener('change',()=>renderSearch());
  $('recall-reset').addEventListener('click',()=>{query.value='';filter.value='all';renderSearch();query.focus();});
  document.querySelector('.quick-queries').addEventListener('click',event=>{const b=event.target.closest('[data-query]');if(b){query.value=b.dataset.query;filter.value='all';renderSearch();}});
  $('recall-results').addEventListener('click',event=>{const s=event.target.closest('[data-source]'),n=event.target.closest('[data-note]');if(s)showSource(s.dataset.source,s);if(n)showNote(n.dataset.note);});
  $('close-source').addEventListener('click',()=>{$('source-panel').hidden=true;sourceTrigger?.focus();});
  $('note-project').innerHTML=corpus.projects.map(p=>`<option value="${escape(p.id)}">${escape(p.id)} · ${escape(p.name)}</option>`).join('');
  $('note-project').addEventListener('change',()=>showNote($('note-project').value,false));
  $('note-text').addEventListener('input',()=>{dirty=$('note-text').value!==savedText(noteId);$('note-count').textContent=`${$('note-text').value.length} / 5000`;say('note-status',dirty?'有未保存内容。':'内容与已保存记录一致。');});
  $('note-form').addEventListener('submit',event=>{event.preventDefault();const next=withDraft();if(persist(next)){dirty=false;say('note-status','已保存到当前浏览器。刷新后可以继续查看。');}});
  $('discard-draft').addEventListener('click',()=>{dirty=false;showNote(noteId,false);});
  $('export-notes').addEventListener('click',exportText);
  $('download-notes').addEventListener('click',()=>{const blob=new Blob([exportText()],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='research-recall-notes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('import-notes').addEventListener('click',()=>{if(dirty){say('backup-status','当前判断尚未保存。请先保存，或导出草稿后点击“恢复已保存内容”，再合并备份。',true);return;}try{const incoming=core.parseNotes($('backup-input').value,ids);const next=core.mergeNotes(notes,incoming);if(persist(next)){showNote(noteId,false);say('backup-status',`备份已验证并合并，共 ${notes.notes.length} 条判断。`);}else say('backup-status','备份未写入，请查看保存提示；已有记录未被替换。',true);}catch(error){say('backup-status',`${error.message} 已有判断保持不变。`,true);}});
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  const params=new URLSearchParams(location.search);query.value=(params.get('q')||'').slice(0,500);const requestedStatus=params.get('status');if([...filter.options].some(o=>o.value===requestedStatus))filter.value=requestedStatus;
  renderSearch(false);showNote(noteId,false);
})();
