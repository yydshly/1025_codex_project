/* Local library browser and creative-plan prototype. No model calls or asset uploads. */
(()=>{
  const editorial=window.POSE_WORKSPACE;
  const storageKey='pose-look-workspace-v1';
  const pageSize=12,maxFrames=12;
  const cardViews=new Map();
  const angleOptions=[['正面','正面'],['上から','俯视'],['下から','仰视'],['横','侧面'],['斜め','斜侧']];
  let library=null,byGroup=new Map(),byImage=new Map(),detailGroup=null,detailView=null,storageAvailable=true;
  let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{storageAvailable=false;}
  const draft={productId:editorial.products.some(p=>p.id===saved.productId)?saved.productId:'reference',title:typeof saved.title==='string'?saved.title.slice(0,120):'',goal:typeof saved.goal==='string'?saved.goal.slice(0,8000):'',frames:Array.isArray(saved.frames)?saved.frames.slice(0,maxFrames).filter(f=>f&&typeof f.viewId==='string').map(f=>({viewId:f.viewId,note:typeof f.note==='string'?f.note.slice(0,8000):''})):[]};
  const favourites=new Set(Array.isArray(saved.favourites)?saved.favourites.filter(id=>typeof id==='string'):[]);
  const filters={family:'standard',category:'all',collection:'all',angle:'正面',query:'',favourites:false,page:1};
  const title=group=>editorial.translations[group.id.replace(/_P\d+$/,'')]?.[group.number]||group.category+' · '+group.number;
  const tags=group=>editorial.tagRules.filter(rule=>new RegExp(rule.pattern).test(group.name)).map(rule=>rule.label);
  const currentProduct=()=>editorial.products.find(p=>p.id===draft.productId)||editorial.products[0];
  const selectedView=group=>group.views.find(view=>view.id===cardViews.get(group.id))||group.views.find(view=>view.angleOriginal===filters.angle)||group.views[0];
  const cardAngleLabel=(group,view)=>view.angle+(!cardViews.has(group.id)&&!group.views.some(item=>item.angleOriginal===filters.angle)?' · 该预览视角缺失':'');
  function cardAngleButtons(group,selected){return angleOptions.map(([original,label])=>{const view=group.views.find(item=>item.angleOriginal===original);return view?`<button data-card-view="${escapeHTML(view.id)}" aria-label="${escapeHTML(title(group)+'：'+label+'预览')}" aria-pressed="${view.id===selected.id}">${label}</button>`:`<button disabled title="原站未提供${label}" aria-label="${label}：原站未提供">${label}</button>`;}).join('');}
  function setCardView(viewId){
    const item=byImage.get(viewId);if(!item)return;
    const {group,view}=item;cardViews.set(group.id,view.id);
    const card=$(`[data-pose-card="${group.id}"]`);if(!card)return;
    const image=$('.pose-card-main img',card);image.src=view.url;image.alt=title(group)+' · '+view.angle;
    $('.pose-card-main',card).setAttribute('aria-label','放大查看'+title(group)+' · '+view.angle);
    $('[data-card-angle-label]',card).textContent=cardAngleLabel(group,view);
    $$('[data-card-view]',card).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cardView===view.id)));
    const add=$('[data-add-pose]',card);add.dataset.addPose=view.id;add.textContent=draft.frames.some(frame=>frame.viewId===view.id)?'已在方案中 ✓':'加入方案 +';
  }
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify({...draft,favourites:[...favourites]}));}catch{storageAvailable=false;}if(!storageAvailable)$('#plan-storage').textContent='当前浏览器未允许保存草稿，请导出方案 JSON 保留。方案不包含原图，也不调用生成模型。';}
  function saveText(filename,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('文件已准备，请在浏览器下载记录中查看。');}
  function setCategories(){
    const categories=[...new Set(library.groups.filter(group=>filters.family==='all'||group.family===filters.family).map(group=>group.category))];
    if(!categories.includes(filters.category))filters.category='all';
    $('#pose-category').innerHTML='<option value="all">全部动作</option>'+categories.map(category=>`<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join('');$('#pose-category').value=filters.category;
  }
  function matching(){const collection=editorial.collections.find(item=>item.id===filters.collection);return library.groups.filter(group=>(filters.family==='all'||group.family===filters.family)&&(filters.category==='all'||group.category===filters.category)&&(!collection||collection.poses.includes(group.id))&&(!filters.favourites||favourites.has(group.id))&&(!filters.query||[title(group),group.name,group.category,group.categoryOriginal,group.id,group.number,...tags(group)].join(' ').toLowerCase().includes(filters.query)));}
  function renderGallery(){
    if(!library)return;
    const groups=matching();const pages=Math.max(1,Math.ceil(groups.length/pageSize));filters.page=Math.min(filters.page,pages);
    $('#pose-count').textContent=`找到 ${groups.length} / ${library.groupCount} 组 · ${groups.reduce((sum,g)=>sum+g.views.length,0).toLocaleString('en-US')} 张原图${filters.collection!=='all'?' · 我们整理的专题':''}`;
    $('#pose-grid').innerHTML=groups.slice((filters.page-1)*pageSize,filters.page*pageSize).map(group=>{
      const view=selectedView(group);const inPlan=draft.frames.some(frame=>frame.viewId===view.id);
      return `<article class="pose-card" data-pose-card="${escapeHTML(group.id)}"><button class="pose-card-main" data-open-pose="${escapeHTML(group.id)}" aria-label="放大查看${escapeHTML(title(group)+' · '+view.angle)}"><img src="${escapeHTML(view.url)}" width="900" height="1200" alt="${escapeHTML(title(group)+' · '+view.angle)}" loading="lazy" decoding="async"><span class="pose-card-view"><span data-card-angle-label>${escapeHTML(cardAngleLabel(group,view))}</span><small>放大查看 ↗</small></span></button><div class="pose-card-angles" role="group" aria-label="${escapeHTML(title(group))}的视角">${cardAngleButtons(group,view)}</div><div class="pose-card-content"><div class="pose-card-kicker"><span>${escapeHTML(group.familyLabel)}</span><span>${escapeHTML(group.number)} / ${escapeHTML(group.category)}</span></div><h3>${escapeHTML(title(group))}</h3><p class="pose-card-original" lang="ja">${escapeHTML(group.name)}</p><div class="pose-tags">${tags(group).slice(0,2).map(tag=>`<span>${escapeHTML(tag)}</span>`).join('')}</div><div class="pose-card-actions"><button data-star-pose="${escapeHTML(group.id)}" aria-pressed="${favourites.has(group.id)}">${favourites.has(group.id)?'★ 已收藏':'☆ 收藏'}</button><button data-add-pose="${escapeHTML(view.id)}">${inPlan?'已在方案中 ✓':'加入方案 +'}</button></div></div></article>`;
    }).join('')||'<p class="plan-empty">没有匹配的姿势。可清空搜索、切换分类或关闭收藏筛选。</p>';
    $('#pose-page').textContent=`${filters.page} / ${pages} 页`;$('#pose-prev').disabled=filters.page<=1;$('#pose-next').disabled=filters.page>=pages;
    $('#pose-favourites').setAttribute('aria-pressed',String(filters.favourites));
    $$('[data-collection]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.collection===filters.collection)));
  }
  function openDetail(id,viewId){
    detailGroup=byGroup.get(id);if(!detailGroup)return;
    detailView=detailGroup.views.find(view=>view.id===viewId)||selectedView(detailGroup);
    $('#pose-detail-title').textContent=title(detailGroup);$('#pose-detail-code').textContent=detailGroup.familyLabel+' / '+detailGroup.number;
    $('#pose-detail-original').textContent='原始名称：'+detailGroup.name;
    if(!$('#pose-dialog').open)$('#pose-dialog').showModal();renderDetail();
  }
  function renderDetail(){
    const image=$('#pose-detail-image');image.src=detailView.url;image.alt=title(detailGroup)+' · '+detailView.angle;
    $('#pose-detail-angles').innerHTML=angleOptions.map(([angle,label])=>{const view=detailGroup.views.find(item=>item.angleOriginal===angle);return view?`<button data-detail-view="${escapeHTML(view.id)}" aria-label="切换到${escapeHTML(view.angle)}" aria-pressed="${view.id===detailView.id}"><img src="${escapeHTML(view.url)}" alt="" width="900" height="1200"><span>${escapeHTML(view.angle)}</span></button>`:`<span class="missing-angle">${label}<br>原站缺项</span>`;}).join('');
    $('#pose-detail-status').textContent=`${detailView.angle} · ${detailView.width} × ${detailView.height} · ${(detailView.bytes/1024).toFixed(0)} KiB · 本地原尺寸 PNG`;
    $('#download-pose').href=detailView.url;$('#download-pose').download=detailView.id+'.png';$('#source-pose').href=detailView.sourceUrl;
    $('#pose-detail-provenance').textContent=`图片 ID：${detailView.id}\nSHA-256：${detailView.sha256}\n来源：${detailView.sourceUrl}`;
    $('#add-detail-plan').textContent=draft.frames.some(frame=>frame.viewId===detailView.id)?'已在创作方案中 ✓':'加入创作方案 +';
  }
  function addFrame(viewId,quiet=false){
    if(!byImage.has(viewId))return false;
    if(draft.frames.some(frame=>frame.viewId===viewId)){if(!quiet)notify('这个姿势视角已经在方案中。');return false;}
    if(draft.frames.length>=maxFrames){if(!quiet)notify('一份方案最多 12 张参考，可先导出当前方案。');return false;}
    draft.frames.push({viewId,note:''});persist();renderPlan();renderGallery();if(detailGroup)renderDetail();if(!quiet)notify('已加入创作方案，可以编排顺序和填写用途。');return true;
  }
  function renderPlan(){
    $('#plan-count').textContent=String(draft.frames.length);
    $('#plan-guidance').textContent='填写时可关注：'+currentProduct().fields.join(' / ')+'。';
    $('#plan-items').innerHTML=draft.frames.length?draft.frames.map((frame,index)=>{const {group,view}=byImage.get(frame.viewId);return `<article class="plan-item"><button data-plan-open="${escapeHTML(frame.viewId)}" aria-label="查看第${index+1}张参考原图"><img src="${escapeHTML(view.url)}" width="900" height="1200" alt="${escapeHTML(title(group)+' · '+view.angle)}" loading="lazy"></button><div><div class="plan-item-head"><h3>${String(index+1).padStart(2,'0')} · ${escapeHTML(title(group))}<small>${escapeHTML(group.number+' / '+view.angle+' / '+group.familyLabel)}</small></h3><div class="plan-item-tools"><button data-move-frame="${index}" data-delta="-1" ${index===0?'disabled':''} aria-label="将第${index+1}张上移">↑</button><button data-move-frame="${index}" data-delta="1" ${index===draft.frames.length-1?'disabled':''} aria-label="将第${index+1}张下移">↓</button><button data-remove-frame="${index}" aria-label="移除第${index+1}张参考">移除</button></div></div><label><span class="mini-label">这张参考在方案中的用途与要求</span><textarea data-frame-note="${index}" maxlength="8000" rows="2" placeholder="例如：选择斜侧角度观察轮廓；本格表现角色回头，保留手臂动作。">${escapeHTML(frame.note)}</textarea></label></div></article>`;}).join(''):'<div class="plan-empty">从上方原图库加入参考，或选择一个产品方向建立示例方案。这里会显示原图、视角、顺序与备注。</div>';
    for(const id of ['export-board','export-brief','copy-brief'])$('#'+id).disabled=!draft.frames.length;
  }
  function selectCollection(id){filters.collection=id;filters.family=id==='all'?'standard':'all';filters.category='all';filters.query='';filters.favourites=false;filters.page=1;$('#pose-family').value=filters.family;$('#pose-search').value='';setCategories();renderGallery();}
  function planPayload(){return {kind:'pose-look-creation-plan',version:1,createdAt:new Date().toISOString(),productId:draft.productId,title:draft.title||currentProduct().defaultTitle,goal:draft.goal,source:library.source,licenceUrl:library.licenceUrl,notice:'Private reference plan. Image data is not embedded. Original-source usage terms still apply.',frames:draft.frames.map((frame,index)=>{const {group,view}=byImage.get(frame.viewId);return {order:index+1,groupId:group.id,viewId:view.id,title:title(group),originalName:group.name,angle:view.angle,note:frame.note,imageFilename:view.id+'.png',sourceUrl:view.sourceUrl,sha256:view.sha256,width:view.width,height:view.height};})};}
  function briefText(){const plan=planPayload();return `# ${plan.title}\n\n产品方向：${currentProduct().name}\n\n## 目标与统一要求\n${plan.goal||'待填写'}\n\n## 参考与逐图任务\n\n`+plan.frames.map(frame=>`### ${frame.order}. ${frame.title}\n\n- 视角：${frame.angle}\n- 原图文件：${frame.imageFilename}\n- 原名：${frame.originalName}\n- 任务与备注：${frame.note||'待填写'}\n- 原始出处：${frame.sourceUrl}\n- SHA-256：${frame.sha256}\n`).join('\n')+`\n## 交付与核对\n${currentProduct().deliverable}\n\n这些是创作计划，尚未执行图像生成、视频制作或 3D 导出。原图可在本地网页详情中按需另存。素材用途遵循 ${plan.licenceUrl} 的条款，方案不扩大原图使用权。\n`;}
  function renderProducts(){
    $('#product-cards').innerHTML=editorial.products.map(product=>`<article class="product-card"><span class="product-card-number">${product.number}</span><h3>${escapeHTML(product.name)}</h3><p class="product-audience">服务：${escapeHTML(product.audience)}</p><dl><dt>解决什么问题</dt><dd>${escapeHTML(product.problem)}</dd><dt>交付什么</dt><dd>${escapeHTML(product.deliverable)}</dd><dt>产品价值在哪里</dt><dd>${escapeHTML(product.value)}</dd></dl><p class="product-stage">● ${escapeHTML(product.stage)} · 本地流程原型</p><button class="button light" data-product-preset="${escapeHTML(product.id)}" disabled>用原图建立这类方案 ↗</button>${product.id==='character'?'<a class="pilot-product-link" href="#pilot">查看本次三姿势生成实测 →</a>':''}</article>`).join('');
    $('#product-further').innerHTML=editorial.further.map(item=>`<article><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.value)}</p><small>继续推进需要：${escapeHTML(item.gap)}</small></article>`).join('');
    $('#plan-product').innerHTML=editorial.products.map(product=>`<option value="${product.id}">${escapeHTML(product.name)}</option>`).join('');$('#plan-product').value=draft.productId;$('#plan-name').value=draft.title;$('#plan-goal').value=draft.goal;
  }
  renderProducts();
  $('#pose-search').addEventListener('input',event=>{filters.query=event.target.value.trim().toLowerCase();filters.page=1;renderGallery();});
  $('#pose-family').addEventListener('change',event=>{filters.family=event.target.value;filters.category='all';filters.collection='all';filters.page=1;setCategories();renderGallery();});
  $('#pose-category').addEventListener('change',event=>{filters.category=event.target.value;filters.page=1;renderGallery();});
  $('#pose-angle').addEventListener('change',event=>{filters.angle=event.target.value;cardViews.clear();renderGallery();});
  $('#pose-favourites').addEventListener('click',()=>{filters.favourites=!filters.favourites;filters.page=1;renderGallery();});
  $('#pose-collections').addEventListener('click',event=>{const button=event.target.closest('[data-collection]');if(button)selectCollection(button.dataset.collection);});
  $('#pose-grid').addEventListener('click',event=>{
    const viewButton=event.target.closest('[data-card-view]');if(viewButton){setCardView(viewButton.dataset.cardView);return;}
    const open=event.target.closest('[data-open-pose]'),star=event.target.closest('[data-star-pose]'),add=event.target.closest('[data-add-pose]');
    if(open)openDetail(open.dataset.openPose);
    if(star){const id=star.dataset.starPose;favourites.has(id)?favourites.delete(id):favourites.add(id);persist();renderGallery();}
    if(add)addFrame(add.dataset.addPose);
  });
  for(const [id,delta] of [['pose-prev',-1],['pose-next',1]])$('#'+id).addEventListener('click',()=>{filters.page+=delta;renderGallery();$('#gallery-workspace').scrollIntoView({block:'start'});});
  $('#close-pose').addEventListener('click',()=>$('#pose-dialog').close());
  $('#pose-dialog').addEventListener('click',event=>{if(event.target===$('#pose-dialog'))$('#pose-dialog').close();});
  $('#pose-detail-angles').addEventListener('click',event=>{const button=event.target.closest('[data-detail-view]');if(button){detailView=detailGroup.views.find(view=>view.id===button.dataset.detailView);setCardView(detailView.id);renderDetail();}});
  $('#add-detail-plan').addEventListener('click',()=>addFrame(detailView.id));
  $('#show-plan').addEventListener('click',()=>$('#creation-plan').scrollIntoView({block:'start'}));
  $('#product-cards').addEventListener('click',event=>{
    const button=event.target.closest('[data-product-preset]');if(!button||!library)return;
    const product=editorial.products.find(item=>item.id===button.dataset.productPreset);draft.productId=product.id;
    if(!draft.title)draft.title=product.defaultTitle;if(!draft.goal)draft.goal=product.defaultGoal;
    $('#plan-product').value=draft.productId;$('#plan-name').value=draft.title;$('#plan-goal').value=draft.goal;
    let count=0;for(const id of product.starter){const group=byGroup.get(id);if(group&&addFrame(group.views[0].id,true))count++;}
    selectCollection(product.collection);persist();renderPlan();$('#creation-plan').scrollIntoView({block:'start'});notify(`已切换到${product.name}，加入 ${count} 张原图参考；原有条目和填写内容保留。`);
  });
  $('#plan-product').addEventListener('change',event=>{draft.productId=event.target.value;persist();if(library)renderPlan();});
  $('#plan-name').addEventListener('input',event=>{draft.title=event.target.value;persist();});
  $('#plan-goal').addEventListener('input',event=>{draft.goal=event.target.value;persist();});
  $('#plan-items').addEventListener('input',event=>{if(event.target.matches('[data-frame-note]')){draft.frames[Number(event.target.dataset.frameNote)].note=event.target.value;persist();}});
  $('#plan-items').addEventListener('click',event=>{
    const open=event.target.closest('[data-plan-open]'),move=event.target.closest('[data-move-frame]'),remove=event.target.closest('[data-remove-frame]');
    if(open){const item=byImage.get(open.dataset.planOpen);openDetail(item.group.id,item.view.id);return;}
    if(move){const index=Number(move.dataset.moveFrame),target=index+Number(move.dataset.delta);if(target>=0&&target<draft.frames.length)[draft.frames[index],draft.frames[target]]=[draft.frames[target],draft.frames[index]];}
    if(remove)draft.frames.splice(Number(remove.dataset.removeFrame),1);
    if(move||remove){persist();renderPlan();renderGallery();}
  });
  $('#export-board').addEventListener('click',()=>download('pose-look-creation-plan.json',planPayload()));
  $('#export-brief').addEventListener('click',()=>saveText('pose-look-creative-brief.md',briefText(),'text/markdown;charset=utf-8'));
  $('#copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(briefText());notify('制作任务已复制，可配合相应的原图交给创作者或外部工具。');}catch{notify('复制未获浏览器允许，请使用“导出创作说明”。');}});
  $('#import-board').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try{
      if(!library||file.size>300000)throw new Error('invalid');const data=JSON.parse(await file.text());
      if(data.kind!=='pose-look-creation-plan'||data.version!==1||!Array.isArray(data.frames)||data.frames.length>maxFrames||data.frames.some(frame=>!frame||!byImage.has(frame.viewId)||(frame.note!=null&&typeof frame.note!=='string')))throw new Error('invalid');
      if(editorial.products.some(p=>p.id===data.productId))draft.productId=data.productId;
      if(!draft.title&&typeof data.title==='string')draft.title=data.title.slice(0,120);if(!draft.goal&&typeof data.goal==='string')draft.goal=data.goal.slice(0,8000);
      let count=0;for(const frame of data.frames){if(draft.frames.length>=maxFrames)break;if(!draft.frames.some(item=>item.viewId===frame.viewId)){draft.frames.push({viewId:frame.viewId,note:(frame.note||'').slice(0,8000)});count++;}}
      $('#plan-product').value=draft.productId;$('#plan-name').value=draft.title;$('#plan-goal').value=draft.goal;persist();renderPlan();renderGallery();notify(`已导入 ${count} 张参考，原有草稿保留；同一视角不会重复添加。`);
    }catch{notify('无法导入：请使用本工作台导出的方案 JSON，并确认其中的原图仍在本地图库。');}event.target.value='';
  });
  async function connect(){
    if(!localResearchRuntime){
      $('.hero-copy>.eyebrow').textContent='参考来源 / 生成作用 / 产品探索';
      $('.brand span').textContent='两个来源 · 实测与产品研究';
      $('.gallery-hero-bottom span').textContent='PUBLIC RESEARCH / 原图入口另列';
      $('#library-badge').textContent='公开研究总览';$('#library-summary').textContent='原图浏览在原站与本地私有版提供';
      $('#gallery-preview').innerHTML='<a class="public-guide-preview" href="#overview"><img src="media/research-overview-v3/overview.png" width="1448" height="1086" alt="两个素材来源、参考生成作用与五个产品目标的研究引导图"></a>';
      $('#gallery-unavailable').hidden=false;$('#gallery-unavailable').innerHTML='<h3>公开版保留研究、实测与创作方案</h3><p>姿势原图可前往<a href="https://ai-pose-gallery.pages.dev/" target="_blank" rel="noopener">原作者图库</a>查看；本地版提供五视角浏览、收藏和参考编排。线上可继续查看六张写真小样、选片备注与产品方向。</p><a class="text-link" href="#series">查看六张写真与选片 →</a>';
      $('#plan-items').innerHTML='<p class="plan-empty">原图编排使用本地图库；线上可在“系列创作”中体验已生成结果的选片与备注。</p>';
      for(const id of ['export-board','export-brief','copy-brief'])$('#'+id).disabled=true;
      return;
    }
    try{
      const response=await fetch('/api/local-library',{cache:'no-store'});const data=await response.json();if(!response.ok||data.mode!=='local-private'||!Array.isArray(data.groups))throw new Error(data.message||'本地图库不可用');library=data;
      byGroup=new Map(data.groups.map(group=>[group.id,group]));for(const group of data.groups)for(const view of group.views)byImage.set(view.id,{group,view});
      const before=draft.frames.length;draft.frames=draft.frames.filter(frame=>byImage.has(frame.viewId));if(before!==draft.frames.length)notify('草稿中未在当前图库找到的参考未载入，请检查原图目录。');
      $('#library-badge').textContent='● 本地原图已连接';$('#library-summary').textContent=`${data.images.toLocaleString('en-US')} 张原图 / ${data.groupCount} 组姿势 · 本机读取`;
      $('#gallery-workspace').hidden=false;$('#gallery-unavailable').hidden=true;
      $('#pose-family').innerHTML='<option value="all">全部分区 · 288 组</option>'+data.families.map(family=>`<option value="${escapeHTML(family.id)}">${escapeHTML(family.label)} · ${data.groups.filter(group=>group.family===family.id).length} 组</option>`).join('');$('#pose-family').value=filters.family;
      $('#pose-collections').innerHTML=[{id:'all',name:'全部专题'},...editorial.collections].map(item=>`<button data-collection="${item.id}" aria-pressed="${item.id===filters.collection}" title="${escapeHTML(item.note||'浏览当前分区全部姿势')}">${escapeHTML(item.name)}</button>`).join('');
      $('#gallery-preview').innerHTML=['full_single_P015','full_single_P017','upper80v2_P001'].map(id=>{const group=byGroup.get(id);if(!group)return '';return `<figure><img src="${escapeHTML(group.views[0].url)}" width="900" height="1200" alt="${escapeHTML(title(group))}"><figcaption>${escapeHTML(title(group))}</figcaption></figure>`;}).join('');
      if(data.clothingPreview)$('#clothing-original').src=data.clothingPreview;
      $$('[data-product-preset]').forEach(button=>button.disabled=false);setCategories();renderGallery();renderPlan();persist();
      if(location.hash==='#products')$('#product-directions').scrollIntoView({block:'start',behavior:'instant'});
      if(location.hash==='#pilot')$('#pose-pilot').scrollIntoView({block:'start',behavior:'instant'});
    }catch(error){$('#library-badge').textContent='本地原图尚未连接';$('#library-summary').textContent='需要本机原图服务';$('#gallery-unavailable').hidden=false;$('#gallery-error').textContent=String(error.message).startsWith('无法读取')?String(error.message).slice(0,200):'未连接到本机图库接口。请运行本地启动命令，并检查原图目录。';$('#plan-items').innerHTML='<p class="plan-empty">连接本地原图库后，可选择参考并建立方案。</p>';for(const id of ['export-board','export-brief','copy-brief'])$('#'+id).disabled=true;}
  }
  connect();
})();
