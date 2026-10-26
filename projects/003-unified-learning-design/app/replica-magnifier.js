const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const overlap=(a,b)=>a.left<b.right&&a.right>b.left;

// The semantic card uses our lesson content. The circle samples our rendered book.
export class ReadingMagnifier {
  constructor({source,onClose=()=>{},onNavigate=()=>{},onSelect=()=>{},getAvoidRects=()=>[]}={}){
    if(!source)throw new Error('ReadingMagnifier requires a source canvas.');
    this.source=source;this.onClose=onClose;this.onNavigate=onNavigate;this.onSelect=onSelect;this.getAvoidRects=getAvoidRects;
    this.visible=false;this.pinned=false;this.signature='';this.x=0;this.y=0;this.drawFailed=false;this.navigation=null;this.navigationSignature='';this.docked=false;
    this.root=document.createElement('div');this.root.id='text-lens-root';this.root.hidden=true;
    this.circle=document.createElement('div');this.circle.id='text-lens-circle';this.circle.setAttribute('aria-hidden','true');
    this.canvas=document.createElement('canvas');this.canvas.id='text-lens-canvas';this.circle.append(this.canvas);
    this.card=document.createElement('aside');this.card.id='text-lens-card';this.card.setAttribute('role','note');this.card.setAttribute('aria-label','文字放大阅读');this.card.setAttribute('aria-live','off');
    this.header=document.createElement('div');this.header.id='text-lens-header';this.header.hidden=true;
    this.readerLabel=document.createElement('span');this.readerLabel.id='text-lens-reader-label';this.readerLabel.textContent='书页阅读';
    this.closeButton=document.createElement('button');this.closeButton.id='text-lens-close';this.closeButton.type='button';this.closeButton.textContent='返回实验';this.closeButton.setAttribute('aria-label','返回实验，关闭文字放大阅读');
    this.header.append(this.readerLabel,this.closeButton);
    this.body=document.createElement('div');this.body.id='text-lens-body';
    this.nav=document.createElement('nav');this.nav.id='text-lens-navigation';this.nav.setAttribute('aria-label','书页段落导航');this.nav.hidden=true;
    const button=(id,label)=>{const node=document.createElement('button');node.id=id;node.type='button';node.textContent=label;return node;};
    this.previousButton=button('text-lens-previous','上一段');this.nextButton=button('text-lens-next','下一段');
    this.progress=document.createElement('span');this.progress.id='text-lens-progress';this.progress.setAttribute('role','status');this.progress.setAttribute('aria-live','polite');this.progress.setAttribute('aria-atomic','true');this.progress.hidden=true;this.header.insertBefore(this.progress,this.closeButton);
    this.directoryLabel=document.createElement('label');this.directoryLabel.id='text-lens-directory-label';this.directoryLabel.htmlFor='text-lens-directory';this.directoryLabel.textContent='段落目录';
    this.directory=document.createElement('select');this.directory.id='text-lens-directory';this.directory.setAttribute('aria-label','段落目录');
    this.nav.append(this.previousButton,this.directoryLabel,this.directory,this.nextButton);
    this.card.append(this.header,this.body,this.nav);this.root.append(this.circle,this.card);document.body.append(this.root);
    this.context=this.canvas.getContext('2d');
    this.closeButton.addEventListener('click',event=>{event.stopPropagation();this.close();});
    this.previousButton.addEventListener('click',()=>this.navigate(-1));this.nextButton.addEventListener('click',()=>this.navigate(1));
    this.directory.addEventListener('change',()=>{if(this.pinned)this.onSelect(this.directory.value);});
    this.card.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();this.close();return;}
      if(!this.pinned||!['ArrowLeft','ArrowRight','PageUp','PageDown'].includes(event.key))return;
      // Native controls keep their own keyboard behavior; the book must not turn.
      event.stopPropagation();
      if(event.target.closest('input,select,textarea,[contenteditable]:not([contenteditable="false"])'))return;
      event.preventDefault();this.navigate(['ArrowLeft','PageUp'].includes(event.key)?-1:1);
    });
    this.restoreDrawing=()=>{this.drawFailed=false;};source.addEventListener('webglcontextrestored',this.restoreDrawing);
  }
  containsTarget(target){return Boolean(target&&this.root.contains(target));}
  show({x,y,region,pin=false,navigation,returnLabel='返回实验'}={}){
    if(!region){this.hide();return;}
    if(this.pinned&&!pin)return;
    if(!Number.isFinite(x)||!Number.isFinite(y))return;
    const wasPinned=this.pinned,wasVisible=this.visible,signature=JSON.stringify(region);
    const contentChanged=signature!==this.signature;
    this.visible=true;this.pinned=Boolean(pin);this.x=x;this.y=y;
    this.root.hidden=false;this.root.dataset.mode=this.pinned?'pinned':'hover';
    this.card.setAttribute('aria-hidden','false');this.card.setAttribute('role',this.pinned?'dialog':'note');
    if(this.pinned)this.card.setAttribute('aria-modal','false');else this.card.removeAttribute('aria-modal');
    this.body.tabIndex=this.pinned?0:-1;
    if(this.pinned)this.body.setAttribute('aria-label','本段正文，可上下滚动');else this.body.removeAttribute('aria-label');
    this.header.hidden=!this.pinned;
    const label=String(returnLabel||'返回实验');this.closeButton.textContent=label;this.closeButton.setAttribute('aria-label',label+'，关闭文字放大阅读');
    this.updateNavigation(navigation,region.key);
    if(contentChanged){this.signature=signature;this.fill(region);this.drawFailed=false;this.body.scrollTop=0;}
    this.layout();
    if(this.pinned&&(!wasPinned||!wasVisible))this.closeButton.focus({preventScroll:true});
  }
  updateNavigation(navigation,key){
    const total=Math.max(0,Math.trunc(Number(navigation?.total)||navigation?.items?.length||0));
    const index=clamp(Math.trunc(Number(navigation?.index)||0),0,Math.max(0,total-1));
    this.navigation=navigation&&total?{index,total}:null;this.nav.hidden=this.progress.hidden=!this.pinned||!this.navigation;
    if(!this.navigation)return;
    this.previousButton.disabled=index===0;this.nextButton.disabled=index>=total-1;
    const progress=(index+1)+' / '+total;
    if(this.progress.textContent!==progress)this.progress.textContent=progress;
    this.progress.setAttribute('aria-label','第 '+(index+1)+' 段，共 '+total+' 段');
    const items=Array.isArray(navigation.items)?navigation.items:[],signature=JSON.stringify(items);
    if(signature!==this.navigationSignature){
      this.navigationSignature=signature;this.directory.replaceChildren();
      items.forEach((item,itemIndex)=>{const option=document.createElement('option');option.value=String(item.key);option.textContent=(itemIndex+1)+' · '+String(item.label||'正文');this.directory.append(option);});
    }
    this.directory.disabled=!items.length;
    this.directory.value=String(key??items[index]?.key??'');
  }
  navigate(delta){
    if(!this.pinned||!this.navigation)return;
    const {index,total}=this.navigation;
    if(index+delta>=0&&index+delta<total)this.onNavigate(delta);
  }
  fill(region){
    this.body.replaceChildren();
    const add=(tag,text,className)=>{
      if(text===undefined||text===null||text==='')return null;
      const node=document.createElement(tag);node.textContent=String(text);
      if(className)node.className=className;this.body.append(node);return node;
    };
    add('div',region.eyebrow,'text-lens-eyebrow');
    const title=add('h3',region.title);if(title){title.id='text-lens-title';this.card.setAttribute('aria-labelledby',title.id);}else this.card.removeAttribute('aria-labelledby');
    if(region.formula)add('div',region.formula,'text-lens-formula');
    for(const paragraph of region.paragraphs||[])add('p',paragraph);
    if(region.options?.length){
      const list=document.createElement('ol');list.className='text-lens-options';
      region.options.forEach((option,index)=>{
        const item=document.createElement('li');item.textContent=typeof option==='string'?option:option?.label||'';
        const selected=region.selected===index||Boolean(option&&typeof option==='object'&&option.selected);
        if(selected){item.dataset.selected='true';item.setAttribute('aria-label','已选择：'+item.textContent);}
        list.append(item);
      });this.body.append(list);
    }
    const paragraphs=region.paragraphs||[];
    if(region.answer&&!paragraphs.includes(region.answer)&&paragraphs.join('')!==region.answer)add('p',region.answer,'text-lens-answer');
  }
  layout(){
    if(!this.visible)return;
    const width=window.innerWidth,height=window.innerHeight,margin=12,gap=10;
    this.root.dataset.constrained='false';
    this.diameter=width<=650?114:136;this.zoom=2.15;
    const radius=this.diameter/2;
    const lensX=clamp(this.x-radius,8,Math.max(8,width-this.diameter-8));
    const lensY=clamp(this.y-radius,8,Math.max(8,height-this.diameter-8));
    this.circle.style.width=this.circle.style.height=this.diameter+'px';
    this.circle.style.left=lensX+'px';this.circle.style.top=lensY+'px';
    const resolution=Math.max(1,Math.min(window.devicePixelRatio||1,2));
    const bitmap=Math.round((this.diameter-4)*resolution);
    if(this.canvas.width!==bitmap||this.canvas.height!==bitmap){this.canvas.width=bitmap;this.canvas.height=bitmap;}
    const circleRect={left:lensX-6,right:lensX+this.diameter+6,top:lensY-6,bottom:lensY+this.diameter+6};
    const obstacles=[];
    for(const value of this.getAvoidRects()||[]){
      if(!value)continue;
      const left=value.left??value.x,top=value.top??value.y;
      const rect={left,right:value.right??left+value.width,top,bottom:value.bottom??top+value.height};
      if(Object.values(rect).every(Number.isFinite)&&rect.right>rect.left&&rect.bottom>rect.top)obstacles.push(rect);
    }
    const intervalsFor=(left,cardWidth,blocks)=>{
      const horizontal={left,right:left+cardWidth};
      let intervals=[[margin,Math.max(margin,height-margin)]];
      for(const block of blocks){
        if(!overlap(horizontal,block))continue;
        const top=block.top-gap,bottom=block.bottom+gap;
        intervals=intervals.flatMap(([a,b])=>bottom<=a||top>=b?[[a,b]]:[[a,Math.max(a,Math.min(b,top))],[Math.min(b,Math.max(a,bottom)),b]]).filter(([a,b])=>b>a);
      }
      return intervals;
    };
    const measure=(cardWidth,panel)=>{
      this.root.dataset.layout=panel?'panel':'floating';
      this.card.style.width=cardWidth+'px';this.card.style.height='auto';this.card.style.maxHeight='none';
      this.body.style.minHeight=this.pinned?'140px':'';
      const naturalHeight=Math.ceil(this.card.getBoundingClientRect().height);
      const chrome=this.pinned?Math.ceil(this.header.getBoundingClientRect().height+(this.nav.hidden?0:this.nav.getBoundingClientRect().height)+2):0;
      return {naturalHeight,chrome};
    };
    let cardWidth=Math.max(60,Math.min(this.pinned?400:width<=650?366:360,width-margin*2));
    let panel=this.pinned&&(width<=650||height<=600),place;
    let {naturalHeight,chrome}=measure(cardWidth,panel);
    if(!panel){
      const raw=[
        {left:this.x-cardWidth/2,top:this.y-radius-gap-naturalHeight,priority:0},
        {left:this.x+radius+gap,top:this.y-naturalHeight/2,priority:12},
        {left:this.x-radius-gap-cardWidth,top:this.y-naturalHeight/2,priority:12},
        {left:this.x-cardWidth/2,top:this.y+radius+gap,priority:20}
      ];
      const candidates=[],minimum=this.pinned?Math.min(naturalHeight,chrome+140):78;
      for(const desired of raw){
        const left=clamp(desired.left,margin,Math.max(margin,width-cardWidth-margin));
        for(const [a,b] of intervalsFor(left,cardWidth,[circleRect,...obstacles])){
          if(b-a<minimum)continue;
          const cardHeight=Math.min(naturalHeight,b-a),top=clamp(desired.top,a,b-cardHeight);
          const score=(naturalHeight-cardHeight)*3+Math.abs(top-desired.top)+Math.abs(left-desired.left)*.3+desired.priority;
          candidates.push({left,top,height:cardHeight,score});
        }
      }
      place=candidates.sort((a,b)=>a.score-b.score)[0];
      // A pinned reader needs enough room for its controls and 140px of text.
      if(this.pinned&&!place)panel=true;
    }
    if(panel){
      cardWidth=Math.max(60,Math.min(640,width-margin*2));
      ({naturalHeight,chrome}=measure(cardWidth,true));
      const left=(width-cardWidth)/2;
      const intervals=intervalsFor(left,cardWidth,obstacles).sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]));
      const [a,b]=intervals[0]||[margin,Math.max(margin,height-margin)];
      const cardHeight=Math.min(naturalHeight,b-a);
      place={left,top:a+(b-a-cardHeight)/2,height:cardHeight};
    }
    if(!place){
      const above=this.y-radius-gap-margin,below=height-margin-(this.y+radius+gap);
      const useAbove=above>=below,space=Math.max(78,useAbove?above:below);
      const cardHeight=Math.min(naturalHeight,space,height-margin*2);
      place={left:clamp(this.x-cardWidth/2,margin,Math.max(margin,width-cardWidth-margin)),top:useAbove?Math.max(margin,this.y-radius-gap-cardHeight):Math.min(height-margin-cardHeight,this.y+radius+gap),height:cardHeight};
    }
    // If the physical viewport cannot fit 140px plus the controls, scroll the
    // entire panel instead of clipping its text or navigation out of reach.
    this.root.dataset.constrained=String(panel&&place.height<chrome+140);
    this.docked=panel;this.card.style.left=place.left+'px';this.card.style.top=place.top+'px';this.card.style.maxHeight=place.height+'px';
    this.card.style.height=this.pinned?place.height+'px':'auto';
    this.circle.hidden=panel||!this.context||this.drawFailed;
  }
  resize(){this.layout();}
  draw(){
    if(!this.visible||this.docked||this.drawFailed||!this.context)return;
    const bounds=this.source.getBoundingClientRect();
    if(bounds.width<=0||bounds.height<=0||this.source.width<=0||this.source.height<=0){this.circle.hidden=true;return;}
    const scaleX=this.source.width/bounds.width,scaleY=this.source.height/bounds.height;
    const cropCSS=(this.diameter-4)/this.zoom;
    const sx=(this.x-bounds.left-cropCSS/2)*scaleX,sy=(this.y-bounds.top-cropCSS/2)*scaleY;
    const sw=cropCSS*scaleX,sh=cropCSS*scaleY;
    const x=Math.max(0,sx),y=Math.max(0,sy),right=Math.min(this.source.width,sx+sw),bottom=Math.min(this.source.height,sy+sh);
    const size=this.canvas.width,ctx=this.context;
    try{
      ctx.clearRect(0,0,size,size);ctx.fillStyle='#f7f2e7';ctx.fillRect(0,0,size,size);
      if(right>x&&bottom>y)ctx.drawImage(this.source,x,y,right-x,bottom-y,(x-sx)/sw*size,(y-sy)/sh*size,(right-x)/sw*size,(bottom-y)/sh*size);
      this.circle.hidden=false;
    }catch{this.drawFailed=true;this.circle.hidden=true;}
  }
  hide({force=false}={}){
    if(this.pinned&&!force)return;
    this.visible=false;this.pinned=false;this.root.hidden=true;this.card.setAttribute('aria-hidden','true');
  }
  close(){const wasVisible=this.visible;this.hide({force:true});if(wasVisible)this.onClose();}
  destroy(){this.hide({force:true});this.source.removeEventListener('webglcontextrestored',this.restoreDrawing);this.root.remove();}
}
