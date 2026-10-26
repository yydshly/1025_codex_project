const formatContent={
  book:{title:'连续主题书',description:'打开载体、按页关联，同一套材质、对象和色彩持续展开。当前三维样章已验证其中的核心机制，完整产品仍可继续完善。',fit:'有章节依赖、需要进入感和持续发现的主题。',link:'每页围绕一个理解目标，讲解、实验和翻页承接同一个对象。',tradeoff:'空间与氛围较强；长文阅读和小屏操作需要专门入口。',labels:['章节与阅读','立体实验','同步讲解','探索记录']},
  split:{title:'教材与实验并排',description:'教材与独立实验台分处同一屏幕的两侧，可以调整比例。文字保留稳定阅读位置，实验随段落或问题切换。',fit:'边读边验证的课程、原理说明与桌面学习。',link:'点击段落定位器材；修改参数同步更新公式、结果和解释。',tradeoff:'关联关系容易对照；小屏需改为切换面板，避免两边同时过窄。',labels:['教材 / 段落 / 公式','独立实验台','当前问题与讲解','实验记录']},
  experiment:{title:'实验优先，解释按需展开',description:'实验占据主要空间，文字以局部说明、侧栏或对象提示展开。用户先提出问题、改变条件，再沿结果查看原因。',fit:'自由探索、复杂装置、结构拆解与产品原理。',link:'器材、变量和观测点各自带出相关段落、公式或讲解。',tradeoff:'操作空间充足；需要明确问题和下一步，帮助用户形成探索路径。',labels:['按需解释','全屏实验环境','当前观察与讲解','结果记录']},
  dual:{title:'双屏协作',description:'一个屏幕显示教材、问题或讲解，另一个屏幕承载实验。两边共享当前章节、参数和操作上下文。',fit:'课堂、展览、桌面伴学与共同讨论。',link:'教材端下发实验条件；实验端将观察结果和进度回传。',tradeoff:'阅读和操作可以独立安排；需要处理配对、同步、断开与不同人的操作权限。',labels:['教材 / 讲解屏','实验 / 操作屏','同一章节与状态同步','共同记录']},
  notebook:{title:'实验记录本',description:'按照问题、预测、实验条件、数据、结论组织内容。探索过程和证据留在同一份记录里，可回看、比较与补充。',fit:'探究式作业、实验报告、个人研究与项目学习。',link:'每次实验保留条件和结果，结论可追溯到当时的测量与截图。',tradeoff:'容易积累证据；记录负担应可控，自动采集与主动解释需要分工。',labels:['问题与预测','条件 / 操作 / 数据','原因解释','结论与对照']},
  workbench:{title:'主题工作台',description:'同一画布并列教材、多个实验、图表与笔记。围绕一个问题组织材料，让不同表示方式互相对照。',fit:'跨章节比较、开放研究、系统思考与创作。',link:'选中同一变量或对象时，各区域显示相应关联和结果。',tradeoff:'组合自由度较高；需要整理、聚焦、缩放与清晰的材料层级。',labels:['教材与材料','实验与图表','讲解与批注','多次实验记录']},
  physical:{title:'虚实结合实验台',description:'屏幕提供教材、步骤和解释，桌面上的实物器材完成操作；真实测量结果再回到图表和讲解中。',fit:'科学实验室、工程训练、科普展台与动手课程。',link:'教材段落关联实体步骤；测量数据关联对应条件、单位和观察问题。',tradeoff:'能接触真实测量与误差；还需校准、器材安全、传感器可靠性和现场维护。',labels:['教材与步骤屏','实体器材与测量','数据回到图表与解释','实验记录']}
};

document.querySelectorAll('[data-format]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.format,data=formatContent[key];if(!data)return;
  document.querySelectorAll('[data-format]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  for(const [id,value] of Object.entries({'format-title':data.title,'format-description':data.description,'format-fit':data.fit,'format-link':data.link,'format-tradeoff':data.tradeoff}))document.getElementById(id).textContent=value;
  const diagram=document.getElementById('format-diagram');diagram.className='format-diagram diagram-'+key;diagram.setAttribute('aria-label',data.title+'布局示意。'+data.labels.join('；'));
  ['layout-text','layout-experiment','layout-guide','layout-record'].forEach((name,index)=>diagram.querySelector('.'+name).textContent=data.labels[index]);
}));

const statusNames={all:'全部',implemented:'已实现',verified:'已验证',future:'未来设想'};
document.querySelectorAll('[data-status-filter]').forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.statusFilter;let count=0;
  document.querySelectorAll('[data-status-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  document.querySelectorAll('[data-capability]').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.capability!==filter;if(!card.hidden)count++;});
  document.getElementById('capability-count').textContent=statusNames[filter]+' · '+count+' 项。实现状态与验证证据分别标明。';
}));

const dialog=document.getElementById('image-dialog'),dialogImage=document.getElementById('image-dialog-image'),dialogCaption=document.getElementById('image-dialog-caption'),dialogOriginal=document.getElementById('image-dialog-original');
let returnFocus=null,imageZoom='fit';
const dialogScroll=dialog.querySelector('.dialog-scroll'),zoomValue=document.getElementById('image-zoom-value');
function applyImageSize(){
  if(!dialog.open||!dialogImage.naturalWidth)return;
  const natural=dialogImage.naturalWidth,viewport=dialogScroll.clientWidth;
  const width=imageZoom==='fit'?viewport:imageZoom==='read'?Math.min(natural,Math.max(viewport,1400)):Math.max(120,Math.min(natural*4,natural*imageZoom));
  dialogImage.style.minWidth='0';dialogImage.style.width=Math.round(width)+'px';zoomValue.textContent=Math.round(width/natural*100)+'%';
}
function scaleImage(factor){if(!dialogImage.naturalWidth)return;imageZoom=dialogImage.getBoundingClientRect().width*factor/dialogImage.naturalWidth;applyImageSize();}
document.getElementById('image-zoom-in').addEventListener('click',()=>scaleImage(1.5));
document.getElementById('image-zoom-out').addEventListener('click',()=>scaleImage(1/1.5));
document.getElementById('image-zoom-fit').addEventListener('click',()=>{imageZoom='fit';applyImageSize();dialogScroll.scrollLeft=0;});
document.getElementById('image-zoom-native').addEventListener('click',()=>{imageZoom=1;applyImageSize();});
window.addEventListener('resize',applyImageSize);
document.querySelectorAll('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{
  const img=button.querySelector('img');
  returnFocus=button;const tall=img&&(img.hasAttribute('data-poster-image')||img.naturalHeight/img.naturalWidth>1.7);imageZoom=tall?'read':'fit';dialogImage.className=tall?'tall-image':'landscape-image';dialogImage.onload=()=>{dialogImage.className=dialogImage.naturalHeight/dialogImage.naturalWidth>1.7?'tall-image':'landscape-image';applyImageSize();};dialogImage.src=button.dataset.zoom;dialogImage.alt=img?.alt||'放大图片';dialogCaption.textContent=button.dataset.caption||'';dialogOriginal.href=button.dataset.zoom;dialog.showModal();applyImageSize();dialogScroll.scrollTop=0;dialogScroll.scrollLeft=0;document.body.classList.add('no-scroll');document.getElementById('close-image-dialog').focus();
}));
document.getElementById('close-image-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('no-scroll');dialogImage.removeAttribute('src');returnFocus?.focus({preventScroll:true});});

document.querySelectorAll('[data-optional-image],[data-poster-image]').forEach(img=>img.addEventListener('error',()=>{
  const button=img.closest('button');button.disabled=true;img.hidden=true;
  const note=document.createElement('p');note.className='asset-unavailable';note.textContent=img.hasAttribute('data-poster-image')?'总览图暂未加载，请使用下载链接或查看上方完整文字。':'概念图暂未加载，上方布局示意与文字说明可继续查看。';button.append(note);
},{once:true}));

if('IntersectionObserver'in window){
  const links=[...document.querySelectorAll('.section-nav a')],sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)links.forEach(link=>{if(link.getAttribute('href')==='#'+entry.target.id)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});},{rootMargin:'-15% 0px -65% 0px'});sections.forEach(section=>observer.observe(section));
}
