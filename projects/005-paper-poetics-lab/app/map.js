const $=selector=>document.querySelector(selector);
const viewport=$('#map-viewport'),stage=$('#map-stage'),status=$('#map-status');
const width=2400;
let height=4339,scale=1,mode='width',diagram=null,drag=null;
const sourceUrl=new URL('./media/research-map.svg',document.baseURI);
const pngUrl=new URL('./media/research-map.png',document.baseURI);

function resize(next,center=true){
  const old=scale;
  const bounds=stage.getBoundingClientRect(),view=viewport.getBoundingClientRect();
  const x=view.left+viewport.clientWidth/2,y=view.top+viewport.clientHeight/2;
  const worldX=Math.max(0,Math.min(width,(x-bounds.left)/old));
  const worldY=Math.max(0,Math.min(height,(y-bounds.top)/old));
  scale=Math.min(1.8,Math.max(mode==='all'?.001:.07,next));
  stage.style.width=`${width*scale}px`;
  $('#map-zoom').value=`${Math.round(scale*100)}%`;
  if(center){const nextBounds=stage.getBoundingClientRect();viewport.scrollLeft+=nextBounds.left+worldX*scale-x;viewport.scrollTop+=nextBounds.top+worldY*scale-y;}
  else{viewport.scrollLeft=0;viewport.scrollTop=0;}
  $('#map-zoom-out').disabled=scale<=.071;
  $('#map-zoom-in').disabled=scale>=1.799;
}
function fit(nextMode='width'){
  mode=nextMode;
  const padding=innerWidth<=780?28:48;
  const horizontal=(viewport.clientWidth-padding)/width;
  resize(nextMode==='all'?Math.min(horizontal,(viewport.clientHeight-padding)/height):horizontal,false);
}
$('#map-zoom-in').addEventListener('click',()=>{mode='manual';resize(scale*1.3);});
$('#map-zoom-out').addEventListener('click',()=>{mode='manual';resize(scale/1.3);});
$('#map-fit-width').addEventListener('click',()=>fit('width'));
$('#map-fit-all').addEventListener('click',()=>fit('all'));
$('#map-read').addEventListener('click',()=>{mode='manual';resize(1);});
addEventListener('resize',()=>{if(mode!=='manual')fit(mode);});

viewport.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='mouse'||event.button!==0||event.target.closest('a,button'))return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};
  viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener('pointermove',event=>{
  if(!drag)return;
  viewport.classList.add('is-dragging');
  viewport.scrollLeft=drag.left-(event.clientX-drag.x);
  viewport.scrollTop=drag.top-(event.clientY-drag.y);
});
function endDrag(){drag=null;viewport.classList.remove('is-dragging');}
viewport.addEventListener('pointerup',endDrag);
viewport.addEventListener('pointercancel',endDrag);
viewport.addEventListener('lostpointercapture',endDrag);

function download(url,name){const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();}
$('#map-save-png').addEventListener('click',()=>download(pngUrl.href,'paper-poetics-research-map.png'));
$('#map-save-svg').addEventListener('click',()=>{
  if(!diagram)return;
  const serialized=new XMLSerializer().serializeToString(diagram);
  const url=URL.createObjectURL(new Blob([serialized],{type:'image/svg+xml;charset=utf-8'}));
  download(url,'paper-poetics-research-map.svg');
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});

fit();
try{
  const response=await fetch(sourceUrl);
  if(!response.ok)throw new Error('Map unavailable');
  const parsed=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
  if(parsed.querySelector('parsererror'))throw new Error('Map could not be read');
  diagram=parsed.documentElement;
  height=Number(diagram.getAttribute('height'))||height;
  diagram.querySelectorAll('a[href]').forEach(anchor=>{
    const href=anchor.getAttribute('href');
    if(href.startsWith('../'))anchor.setAttribute('href',new URL('./'+href.slice(3),document.baseURI).href);
    if(anchor.getAttribute('target')==='_blank')anchor.setAttribute('rel','noopener noreferrer');
  });
  stage.replaceChildren(document.importNode(diagram,true));
  diagram=stage.querySelector('svg');
  $('#map-save-svg').disabled=false;
  fit(mode);
  status.textContent='可点击图已载入。PNG便于分享；网页与下载的SVG保留节点链接。';
}catch{
  status.textContent='当前显示静态全图。可下载PNG，或通过右下“效果索引”进入演示。';
}
