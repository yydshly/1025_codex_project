/* Saved original-library generation pilot. This page does not invoke a model. */
(()=>{
  const data=window.POSE_PILOT;
  let current=data.versions.find(version=>version.id===data.currentVersion)||data.versions[0];
  const versionLabel=version=>data.displayLabels?.[version.id]||version.label;
  const asset=(version,id)=>version.assets.find(item=>item.id===id);
  const picture=(item,label)=>`<img src="${escapeHTML(item.path)}" alt="${escapeHTML(label)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async">`;
  function posePicture(item){return localResearchRuntime?`<img class="pilot-local-pose" src="${escapeHTML(item.localPoseUrl)}" alt="原库姿势：${escapeHTML(item.label)} · 正面" width="${item.poseWidth}" height="${item.poseHeight}" loading="lazy" decoding="async">`:`<a class="pilot-pose-unavailable" href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noopener">本项输入：${escapeHTML(item.poseId)}<br>去原站查看姿势原图 ↗</a>`;}
  function handleUnavailablePoses(root){$$('.pilot-local-pose',root).forEach(image=>image.addEventListener('error',()=>{image.hidden=true;const note=document.createElement('span');note.className='pilot-pose-unavailable';note.textContent='原姿势预览需要连接本地原图库。';image.after(note);},{once:true}));}
  function render(){
    const base=asset(current,current.baseId);
    $('#pilot-versions').innerHTML=data.versions.map(version=>`<button data-pilot-version="${version.id}" aria-pressed="${version.id===current.id}">${escapeHTML(versionLabel(version))}</button>`).join('');
    $('#pilot-record-link').href=`media/pose-pilot-${current.id}/manifest.json`;
    const phone=current.photographyStyle==='phone-snapshot';
    const intro=phone?'成年亚洲女性，日常手机随手拍的观感。':current.style==='photographic'?'先固定人物，再用原库姿势改变动作。':'旧版插画试验，保留作风格对照。';
    const feedback=current.userFeedback||data.versionFeedback?.[current.id];
    $('#pilot-base').innerHTML=`<figure>${picture(base,phone?'手机随拍风格的虚构成年亚洲女性基准':current.style==='photographic'?'摄影质感的虚构成年人物基准':'旧版插画人物基准')}<figcaption>人物与服装基准</figcaption></figure><div><h3>${intro}</h3><p>${phone?'这组改用日常庭院、白 T 恤和牛仔裤，保留自然光、手持构图与生活背景。':''}每张结果都使用同一张人物基准，加上一张原库姿势图；细节仍需逐张检查。</p><p class="pilot-metadata">本版 ${current.generationCalls} 次生成：1 张基准 + ${current.cases.length} 张姿势结果；每项生成一次。人物为 AI 生成，未使用真人照片。</p>${feedback?`<p>${escapeHTML(feedback)}</p>`:''}</div>`;
    $('#pilot-cases').innerHTML=current.cases.map((item,index)=>{const result=asset(current,item.resultId);return `<article class="pilot-case"><h3>${index+1}. ${escapeHTML(item.label)}<small>${escapeHTML(item.poseId)} / ${escapeHTML(item.angle)}</small></h3><button class="pilot-result-button" data-pilot-zoom="${item.id}" aria-label="放大对照${escapeHTML(item.label)}的生成结果">${picture(result,'生成结果：'+item.label+' · '+versionLabel(current))}<span>放大对照人物、原姿势与结果 ↗</span></button><div class="pilot-case-source"><figure>${posePicture(item)}<figcaption>原库输入姿势</figcaption></figure><p>${escapeHTML(item.follows)}</p></div><p class="pilot-difference"><b>仍有偏差：</b>${escapeHTML(item.differences)}</p></article>`;}).join('');
    $('#pilot-record').innerHTML=`<summary>输入关联、完整指令与实验范围</summary><ul><li>三项输入分别为 P015、P019、P012 的正面原图。来源、原图哈希、结果哈希和完整指令保存在<a href="media/pose-pilot-${current.id}/manifest.json" target="_blank" rel="noopener">本版实验记录</a>。</li><li>同一版的三个结果分别从同一张基准人物出发，没有把上一张结果继续改姿势。</li><li>本次使用内置 ImageGen；没有原库图片与纯文字的严格对照，也没有多次重复、固定种子或数值相似度评测。</li><li>网页展示已保存的实验结果，点击查看不会实时生成图片。</li></ul>`;
    handleUnavailablePoses($('#pose-pilot'));
  }
  function zoom(id){
    const item=current.cases.find(entry=>entry.id===id);if(!item)return;
    const base=asset(current,current.baseId),result=asset(current,item.resultId);
    $('#pilot-dialog-title').textContent=item.label+' · '+versionLabel(current);
    $('#pilot-dialog-content').innerHTML=`<figure><figcaption>输入 A · 人物与服装基准</figcaption>${picture(base,'人物基准')}<a href="${escapeHTML(base.path)}" target="_blank" rel="noopener">查看原尺寸 ↗</a></figure><figure><figcaption>输入 B · 原库姿势</figcaption>${posePicture(item)}<a href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noopener">原站出处 ↗</a></figure><figure><figcaption>生成结果 · ${escapeHTML(item.label)}</figcaption>${picture(result,'生成结果：'+item.label)}<a href="${escapeHTML(result.path)}" target="_blank" rel="noopener">查看原尺寸 ↗</a></figure>`;
    $('#pilot-dialog-note').textContent=item.follows+' '+item.differences;
    handleUnavailablePoses($('#pilot-dialog'));$('#pilot-dialog').showModal();
  }
  $('#pilot-versions').addEventListener('click',event=>{const button=event.target.closest('[data-pilot-version]');if(button){current=data.versions.find(version=>version.id===button.dataset.pilotVersion);render();}});
  $('#pilot-cases').addEventListener('click',event=>{const button=event.target.closest('[data-pilot-zoom]');if(button)zoom(button.dataset.pilotZoom);});
  $('#close-pilot').addEventListener('click',()=>$('#pilot-dialog').close());
  $('#pilot-dialog').addEventListener('click',event=>{if(event.target===$('#pilot-dialog'))$('#pilot-dialog').close();});
  render();
  if(location.hash==='#pilot')requestAnimationFrame(()=>$('#pose-pilot').scrollIntoView({block:'start',behavior:'instant'}));
})();
