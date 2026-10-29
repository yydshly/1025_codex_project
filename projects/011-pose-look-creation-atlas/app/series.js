/* Saved results and a local selection brief. No generation endpoint is called. */
(()=>{
  const data=window.POSE_SERIES, directions=window.SERIES_DIRECTIONS;
  if(!data||!$('#series'))return;
  const storageKey='pose-look-series-v1';
  const initial=()=>({schemaVersion:1,seriesId:data.id,title:data.title,goal:'同一人物、同一穿搭与庭院，编排六张有远近变化、开场和结尾的手机随拍风格写真候选。',frames:data.frames.map(f=>({id:f.id,selected:true,note:f.revision}))});
  let draft=initial(),currentFrame=0,currentDirection=directions[0].id;
  function validate(value){
    if(value?.schemaVersion!==1||value.seriesId!==data.id||typeof value.title!=='string'||value.title.length>120||typeof value.goal!=='string'||value.goal.length>3000||!Array.isArray(value.frames)||value.frames.length!==data.frames.length)throw new Error('方案格式不匹配');
    const ids=new Set();
    const frames=value.frames.map(f=>{
      if(!data.frames.some(item=>item.id===f.id)||ids.has(f.id)||typeof f.selected!=='boolean'||typeof f.note!=='string'||f.note.length>2000)throw new Error('镜头记录不完整');
      ids.add(f.id);return {id:f.id,selected:f.selected,note:f.note};
    });
    return {schemaVersion:1,seriesId:data.id,title:value.title,goal:value.goal,frames};
  }
  let storageAvailable=true;
  try{const saved=localStorage.getItem(storageKey);if(saved)draft=validate(JSON.parse(saved));}catch{storageAvailable=false;}
  const frameDraft=id=>draft.frames.find(f=>f.id===id);
  const imageHTML=(asset,alt,cls='')=>`<img class="${cls}" src="${escapeHTML(asset.path)}" alt="${escapeHTML(alt)}" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async">`;
  function updateStatus(){
    const selected=draft.frames.filter(f=>f.selected).length;
    $('#series-selection-count').textContent=`已保留 ${selected} / ${data.totalFrames} 张候选`;
    $('#series-storage').textContent=storageAvailable?'选片和备注已保存在本机浏览器；可导出 JSON 备份或导入恢复。保留候选不代表效果已验收。':'浏览器暂时无法保存草稿，请导出 JSON 备份。保留候选不代表效果已验收。';
  }
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(draft));storageAvailable=true;}catch{storageAvailable=false;}updateStatus();}
  function renderDraft(){
    $('#series-project-title').value=draft.title;$('#series-project-goal').value=draft.goal;
    data.frames.forEach(f=>{const item=frameDraft(f.id);$(`[data-series-select="${f.id}"]`).checked=item.selected;$(`[data-series-note="${f.id}"]`).value=item.note;});
    updateStatus();
  }
  function render(){
    $('#series-base').innerHTML=`<figure>${imageHTML(data.base,'这组六张图共同使用的虚构成年亚洲女性基准')}<figcaption>共同人物基准</figcaption></figure><div><p class="eyebrow">COURTYARD AFTERNOON / 01</p><h3>庭院午后</h3><p>${escapeHTML(data.description)}</p><div class="series-fixed">${data.fixed.map(text=>`<span>${escapeHTML(text)}</span>`).join('')}</div><p class="series-meta">本轮新增 3 张 · 复用上一轮 3 张 · 每张新图生成 1 次 · 人物由 AI 生成</p></div>`;
    $('#series-sequence').innerHTML=data.frames.map(f=>`<li><button data-series-open="${f.id}"><span>${String(f.order).padStart(2,'0')}</span>${escapeHTML(f.title)}<small>${escapeHTML(f.shotSize)}</small></button></li>`).join('');
    $('#series-grid').innerHTML=data.frames.map(f=>`<article class="series-card"><button class="series-image-button" data-series-open="${f.id}" aria-label="放大查看${escapeHTML(f.title)}及参考"><span class="series-order">${String(f.order).padStart(2,'0')}</span>${imageHTML(f.asset,f.order+'. '+f.title+'，AI 生成写真候选')}<span class="series-image-hint">查看参考与指令 ↗</span></button><div class="series-card-content"><div class="series-card-heading"><h3>${escapeHTML(f.title)}</h3><span>${f.mode==='new'?'本轮新增':'复用 v3'}</span></div><p class="series-shot-size">计划景别 · ${escapeHTML(f.shotSize)}</p><p class="series-purpose">${escapeHTML(f.purpose)}</p><details class="series-observation"><summary>${f.status==='framing-needs-revision'?'景别待调整':'观察与待核对细节'}</summary><p>${escapeHTML(f.observed)}</p></details><label class="series-select"><input type="checkbox" data-series-select="${f.id}">保留候选</label><label class="series-note">本张调整备注<textarea data-series-note="${f.id}" maxlength="2000" rows="2" aria-label="${escapeHTML(f.title)}调整备注"></textarea></label></div></article>`).join('');
    $('#series-direction-list').innerHTML=directions.map((d,i)=>`<button data-series-direction="${d.id}" aria-pressed="${d.id===currentDirection}" aria-controls="series-direction-detail"><span>${String(i+1).padStart(2,'0')}</span><b>${escapeHTML(d.name)}</b><small>${escapeHTML(d.stage)}</small></button>`).join('');
    renderDirection();renderDraft();
  }
  function renderDirection(){
    const d=directions.find(item=>item.id===currentDirection);
    $$('[data-series-direction]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.seriesDirection===d.id)));
    $('#series-direction-detail').innerHTML=`<div class="series-direction-lead"><div><span class="series-stage">${escapeHTML(d.stage)}</span><h3>${escapeHTML(d.name)}</h3><p>${escapeHTML(d.goal)}</p><small>面向 ${escapeHTML(d.audience)}</small></div><div class="series-value"><b>价值假设</b><p>${escapeHTML(d.value)}</p><small>实际收益尚未通过用户使用测量。</small></div></div><dl>${[['交付什么',d.output],['准备什么',d.inputs],['保持什么',d.fixed],['变化什么',d.changes],['还缺什么',d.gap],['怎样验证',d.test]].map(([title,value])=>`<div><dt>${title}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl><p class="series-next">${escapeHTML(d.next)}</p><div class="series-direction-actions"><button class="button light" id="series-direction-export">导出此方向任务 ↓</button>${d.link?`<a class="text-link" href="${escapeHTML(d.link)}">${escapeHTML(d.linkLabel)} →</a>`:''}</div>`;
    $('#series-direction-export').addEventListener('click',()=>download(`pose-look-direction-${d.id}.json`,{schemaVersion:1,date:data.date,status:'Product hypothesis and validation plan; not a verified production capability.',...d,relatedPilot:'media/courtyard-series-v1/manifest.json',note:'原库对实际人物的用途有限制；实际人物场景应换用适当授权的参考。'}));
  }
  function showFrame(id){
    const index=data.frames.findIndex(f=>f.id===id);if(index<0)return;currentFrame=index;
    const f=data.frames[index];
    $('#series-dialog-title').textContent=`${String(f.order).padStart(2,'0')} / 06 · ${f.title}`;
    $('#series-dialog-body').innerHTML=`<figure class="series-dialog-result">${imageHTML(f.asset,f.title+'的生成结果')}<figcaption>${f.mode==='new'?'本轮新增生成':'复用手机随拍 v3'} · ${f.asset.width} × ${f.asset.height}<a href="${escapeHTML(f.asset.path)}" download>另存这张结果 ↓</a></figcaption></figure><div class="series-dialog-aside"><div class="series-dialog-inputs"><figure>${imageHTML(data.base,'共同人物与服装基准')}<figcaption>输入 A · 人物与场景</figcaption></figure><figure>${localResearchRuntime?`<img class="series-local-pose" src="${escapeHTML(f.pose.localUrl)}" alt="${escapeHTML(f.title)}使用的原库姿势参考" width="${f.pose.width}" height="${f.pose.height}">`:`<div class="series-source-link"><p>本张原库输入：${escapeHTML(f.pose.id)}</p><p>原图在原站或本地私有版查看。</p></div>`}<figcaption>输入 B · ${escapeHTML(f.pose.angle)}姿势<a href="${escapeHTML(f.pose.sourceUrl)}" target="_blank" rel="noopener">原站出处 ↗</a></figcaption></figure></div><p class="series-source-code">${escapeHTML(f.pose.id)}</p><h3>计划与实际</h3><p><b>计划：</b>${escapeHTML(f.shotSize)}。${escapeHTML(f.purpose)}</p><p><b>观察：</b>${escapeHTML(f.observed)}</p>${f.sourceArtifact?`<p><b>原图情况：</b>${escapeHTML(f.sourceArtifact)}</p>`:''}${f.poseOverride?`<p><b>有意调整：</b>${escapeHTML(f.poseOverride)}</p>`:''}<p><b>选片备注：</b>${escapeHTML(frameDraft(f.id).note||'尚未填写')}</p><details class="series-prompt"><summary>完整生成指令</summary><pre>${escapeHTML(f.prompt)}</pre></details><a class="series-manifest-link" href="media/courtyard-series-v1/manifest.json" target="_blank" rel="noopener">完整输入关联与哈希 ↗</a></div>`;
    const raw=$('.series-local-pose',$('#series-dialog-body'));
    raw?.addEventListener('error',()=>{raw.hidden=true;const note=document.createElement('p');note.textContent='原姿势预览需要连接本地图库。';raw.after(note);},{once:true});
    $('#series-dialog-body').scrollTop=0;
    if(!$('#series-dialog').open)$('#series-dialog').showModal();
  }
  function exportPayload(){return {...draft,date:data.date,manifest:'media/courtyard-series-v1/manifest.json',scope:'选片方案与素材引用，不包含图片字节，也不代表效果已验收。',fixed:data.fixed,varying:data.varying,frames:data.frames.map(f=>({...frameDraft(f.id),order:f.order,title:f.title,shotSize:f.shotSize,purpose:f.purpose,mode:f.mode,asset:f.asset,pose:f.pose,observed:f.observed,prompt:f.prompt,inputOrder:f.inputOrder,...(f.reusedFrom?{reusedFrom:f.reusedFrom}:{})}))};}
  function exportMarkdown(){
    const out=exportPayload();
    const lines=[`# ${out.title||data.title}`,'',out.goal,'','共同要求：'+out.fixed.join('；'),'','本轮 3 张新增 + 3 张复用；AI 生成的虚构成年人物，选片状态不等于验收。',''];
    for(const f of out.frames)lines.push(`## ${f.order}. ${f.title} · ${f.selected?'保留候选':'暂不保留'}`,'',`景别：${f.shotSize}。${f.purpose}`,`结果：${f.asset.path}`,`原姿势：${f.pose.id} / ${f.pose.sourceUrl}`,`观察：${f.observed}`,`调整：${f.note||'未填写'}`,'');
    lines.push('完整指令与哈希：media/courtyard-series-v1/manifest.json','');
    const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='courtyard-series-selection.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('选片说明已准备下载。');
  }
  $('#series-project-title').addEventListener('input',e=>{draft.title=e.target.value;save();});
  $('#series-project-goal').addEventListener('input',e=>{draft.goal=e.target.value;save();});
  $('#series-directions-jump').addEventListener('click',()=>$('#series-directions').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  $('#series-grid').addEventListener('change',e=>{if(e.target.matches('[data-series-select]')){frameDraft(e.target.dataset.seriesSelect).selected=e.target.checked;save();}});
  $('#series-grid').addEventListener('input',e=>{if(e.target.matches('[data-series-note]')){frameDraft(e.target.dataset.seriesNote).note=e.target.value;save();}});
  $('#series').addEventListener('click',e=>{
    const open=e.target.closest('[data-series-open]');if(open)showFrame(open.dataset.seriesOpen);
    const direction=e.target.closest('[data-series-direction]');if(direction){currentDirection=direction.dataset.seriesDirection;renderDirection();}
  });
  $('#series-dialog-prev').addEventListener('click',()=>showFrame(data.frames[(currentFrame+data.frames.length-1)%data.frames.length].id));
  $('#series-dialog-next').addEventListener('click',()=>showFrame(data.frames[(currentFrame+1)%data.frames.length].id));
  $('#series-dialog-close').addEventListener('click',()=>$('#series-dialog').close());
  $('#series-dialog').addEventListener('click',e=>{if(e.target===$('#series-dialog'))$('#series-dialog').close();});
  $('#series-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showFrame(data.frames[(currentFrame+(e.key==='ArrowRight'?1:data.frames.length-1))%data.frames.length].id);}});
  $('#series-export-json').addEventListener('click',()=>download('courtyard-series-selection.json',exportPayload()));
  $('#series-export-md').addEventListener('click',exportMarkdown);
  $('#series-import').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    try{if(file.size>1024*1024)throw new Error('文件过大');const restored=validate(JSON.parse(await file.text()));draft=restored;save();renderDraft();notify('系列选片方案已恢复。');}
    catch{notify('无法导入：请选择本组六张镜头导出的完整 JSON。');}
    finally{e.target.value='';}
  });
  render();
  if(location.hash==='#series')requestAnimationFrame(()=>$('#content').scrollIntoView({block:'start',behavior:'instant'}));
})();
