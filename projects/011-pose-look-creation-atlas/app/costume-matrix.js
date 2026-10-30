(()=>{
  const data=window.COSTUME_MATRIX;if(!data)return;
  const $=selector=>document.querySelector(selector);
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const local=['127.0.0.1','localhost'].includes(location.hostname)&&location.pathname.startsWith('/app/');
  const dialog=$('#matrix-dialog');let active=0;let localInputs={costumesAvailable:false,posesAvailable:false};
  $('#matrix-person').src=data.person.asset.path;
  $('#matrix-library').innerHTML=`<strong>两个素材库，怎样参与这次创作？</strong><span>姿势：1,439 张 / 288 组，提供动作与现有视角。</span><span>衣装：1,407 套 / 八类，提供轮廓、主色与搭配目标。</span><span>人物与结果由外部图像模型生成，本页展示已保存的小样。</span>`;
  $('#matrix-grid').innerHTML=data.outfits.map(outfit=>`<section class="matrix-row"><div class="matrix-row-heading"><div><small>${escape(outfit.id)}</small><h3>${escape(outfit.label)}</h3></div><a href="${escape(outfit.sourceUrl)}" target="_blank" rel="noopener">原站衣装参考 ↗</a></div><div class="matrix-results">${data.frames.filter(frame=>frame.outfitId===outfit.id).map(frame=>`<article><button class="matrix-image" data-matrix-open="${escape(frame.id)}" aria-label="放大${escape(frame.label)}"><img src="${escape(frame.asset.path)}" width="${frame.asset.width}" height="${frame.asset.height}" alt="${escape(frame.label)}" loading="lazy" decoding="async"><span>同窗对照 ↗</span></button><div class="matrix-card-copy"><h4>${escape(data.poses.find(pose=>pose.id===frame.poseId).label)}</h4><p>${escape(frame.review)}</p></div></article>`).join('')}</div></section>`).join('');
  function inputCard(input,kind){const available=kind==='costume'?localInputs.costumesAvailable:localInputs.posesAvailable;return `<div class="matrix-input"><b>${kind==='costume'?'衣装参考':'姿势参考'} · ${escape(input.id)}</b>${local&&available?`<img src="${escape(input.localUrl)}" alt="${escape(input.label)}原图" width="${input.width}" height="${input.height}">`:'<p>公开页保留输入编号与出处，原图在原站或私有备份查看。</p>'}<a href="${escape(input.sourceUrl)}" target="_blank" rel="noopener">原站原图 ↗</a><a href="${escape(input.privateUrl)}" target="_blank" rel="noopener">私有备份 ↗</a></div>`;}
  function render(){
    const frame=data.frames[active],outfit=data.outfits.find(item=>item.id===frame.outfitId),pose=data.poses.find(item=>item.id===frame.poseId);
    $('#matrix-detail-title').textContent=frame.label;$('#matrix-output').src=frame.asset.path;$('#matrix-output').alt=frame.label;
    $('#matrix-detail-review').textContent=frame.review;$('#matrix-detail-prompt').textContent=frame.prompt;
    $('#matrix-inputs').innerHTML=`<div class="matrix-input"><b>同一虚构人物基准</b><img src="${escape(data.person.asset.path)}" alt="虚构成年亚洲女性人物基准" width="1086" height="1448"></div>`+inputCard(outfit,'costume')+inputCard(pose,'pose');
    $('#matrix-download').href=frame.asset.path;$('#matrix-download').download=frame.id+'.png';
    $('#matrix-previous').disabled=active===0;$('#matrix-next').disabled=active===data.frames.length-1;
    $('#matrix-position').textContent=(active+1)+' / '+data.frames.length;
    $('#matrix-provenance').textContent=`输入顺序：${frame.inputOrder.join(' → ')}\n结果 SHA-256：${frame.asset.sha256}\n衣装 SHA-256：${outfit.sha256}\n姿势 SHA-256：${pose.sha256}`;
  }
  $('#matrix-grid').addEventListener('click',event=>{const button=event.target.closest('[data-matrix-open]');if(!button)return;active=data.frames.findIndex(frame=>frame.id===button.dataset.matrixOpen);render();dialog.showModal();});
  $('#matrix-close').addEventListener('click',()=>dialog.close());
  $('#matrix-previous').addEventListener('click',()=>{if(active>0){active--;render();}});$('#matrix-next').addEventListener('click',()=>{if(active<data.frames.length-1){active++;render();}});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('keydown',event=>{if(event.target.tagName==='BUTTON')return;if(event.key==='ArrowLeft'&&active>0){event.preventDefault();active--;render();}if(event.key==='ArrowRight'&&active<data.frames.length-1){event.preventDefault();active++;render();}});
  $('#matrix-export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='pose-costume-matrix-v1.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  if(local)fetch('/api/costume-matrix-inputs').then(response=>response.ok?response.json():null).then(info=>{if(info){localInputs=info;if(dialog.open)render();}}).catch(()=>{});
})();
