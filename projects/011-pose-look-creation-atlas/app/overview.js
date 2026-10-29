/* One saved research infographic; opening or zooming never calls a model. */
(()=>{
  const dialog=document.querySelector('#overview-dialog');if(!dialog)return;
  const image=document.querySelector('#overview-large-image');
  const publicItem={id:'public-overview',label:'研究总览 · 公开引导图',url:'media/research-overview-v3/overview.png'};
  let mainItem=publicItem,items=[publicItem];
  let zoom=1;
  function setZoom(value){
    zoom=Math.max(1,Math.min(3,value));
    if(dialog.open){
      const viewport=document.querySelector('#overview-viewport'),styles=getComputedStyle(viewport);
      const horizontal=parseFloat(styles.paddingLeft)+parseFloat(styles.paddingRight),vertical=parseFloat(styles.paddingTop)+parseFloat(styles.paddingBottom);
      const fixed=[...dialog.children].filter(child=>child!==viewport&&!child.hidden).reduce((sum,child)=>sum+child.getBoundingClientRect().height,0);
      const availableHeight=Math.max(80,Math.min(innerHeight-24,parseFloat(getComputedStyle(dialog).maxHeight))-fixed-vertical-2);
      const ratio=image.naturalWidth&&image.naturalHeight?image.naturalWidth/image.naturalHeight:4/3;
      const fitWidth=Math.min(viewport.clientWidth-horizontal,availableHeight*ratio);
      image.style.width=`${Math.max(1,Math.round(fitWidth*zoom))}px`;
    }else image.style.width='100%';
    document.querySelector('#overview-zoom-level').textContent=`${Math.round(zoom*100)}%`;
    document.querySelector('#overview-zoom-out').disabled=zoom===1;
    document.querySelector('#overview-zoom-in').disabled=zoom===3;
    if(zoom===1){const viewport=document.querySelector('#overview-viewport');viewport.scrollTop=0;viewport.scrollLeft=0;}
  }
  function selectItem(item){
    image.src=item.url;image.alt=item.label;image.removeAttribute('width');image.removeAttribute('height');
    document.querySelector('#overview-dialog-title').textContent=item.label;
    const download=document.querySelector('#overview-current-download');download.href=item.url;download.download=item.id+'.'+(item.url.endsWith('.jpg')?'jpg':'png');
    document.querySelectorAll('[data-overview-item]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.overviewItem===item.id)));
    setZoom(1);
  }
  function openItem(item){selectItem(item);if(!dialog.open)dialog.showModal();setZoom(1);}
  document.querySelectorAll('[data-open-overview]').forEach(button=>button.addEventListener('click',()=>openItem(mainItem)));
  document.querySelector('#overview-zoom-in').addEventListener('click',()=>setZoom(zoom+0.5));
  document.querySelector('#overview-zoom-out').addEventListener('click',()=>setZoom(zoom-0.5));
  document.querySelector('#overview-fit').addEventListener('click',()=>setZoom(1));
  document.querySelector('#overview-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  image.addEventListener('load',()=>setZoom(zoom));
  window.addEventListener('resize',()=>{if(dialog.open)setZoom(zoom);});
  function renderItems(){
    for(const id of ['overview-source-items','overview-dialog-items']){
      const container=document.querySelector('#'+id);
      container.replaceChildren(...items.map(item=>{const button=document.createElement('button');button.type='button';button.dataset.overviewItem=item.id;button.textContent=item.label;button.setAttribute('aria-pressed',String(item.id===mainItem.id));button.addEventListener('click',()=>openItem(item));return button;}));
      container.hidden=false;
    }
  }
  async function connectPrivateOverview(){
    if(!['127.0.0.1','localhost'].includes(location.hostname)||!location.pathname.startsWith('/app/'))return;
    try{
      const response=await fetch('/api/local-overview');if(!response.ok)return;
      const info=await response.json();if(!info.available)return;
      mainItem={id:info.id,label:'理解总览 · 素材与效果版',url:info.url};items=[mainItem,...info.inputs,publicItem];
      const preview=document.querySelector('.overview-preview img');preview.src=info.url;preview.width=info.width;preview.height=info.height;preview.alt='包含源库扶腰姿势、衣装预告、庭院站姿结果和早期婚纱探索的研究记忆总览图';
      const download=document.querySelector('#overview-main-download');download.href=info.url;download.download='pose-look-memory-overview-v2.png';
      document.querySelector('#overview-record-link').href=info.manifestUrl;
      document.querySelector('#overview-note').textContent='素材与效果版 · 仅本地私人研究。衣装图片来自原作者预告，婚纱属于独立分支；缩略图经 AI 排版，精确内容可在下方回看原始资料与结果。';
      document.querySelector('#overview-source-heading').hidden=false;
      renderItems();
      if(dialog.open)selectItem(mainItem);
    }catch{/* Retain the public text-only overview when the private local service is absent. */}
  }
  connectPrivateOverview();
})();
