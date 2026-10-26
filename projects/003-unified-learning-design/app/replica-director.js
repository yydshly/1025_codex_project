import {tourSteps} from './replica-script.js';
import {narrationSource,narrationUrl} from './narration-source.js';

const escapeHTML=value=>String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export class BookDirector {
  constructor(api){
    this.api=api;this.panel=document.querySelector('#director');this.audio=document.querySelector('#narration');
    this.visible=true;this.active=false;this.paused=false;this.holdPhysics=false;this.index=-1;this.token=0;this.clipToken=0;this.muted=false;this.balanceClock=0;this.answers={};
    for(const [id,run] of Object.entries({
      'guide-start':()=>this.start(),'guide-explore':()=>this.stop(),'guide-exit':()=>this.stop(),
      'guide-pause':()=>this.togglePause(),'guide-replay':()=>this.enter(this.index),'guide-next':()=>this.next(),
      'guide-back':()=>this.enter(Math.max(0,this.index-1)),
      'guide-mute':()=>{this.muted=!this.muted;this.audio.muted=this.muted;this.render();}
    }))this.panel.querySelector('#'+id).onclick=run;
    this.audio.onerror=()=>this.failAudio(this.clipToken);
    this.render();
  }
  start(fromCurrent=false){
    const entry=fromCurrent?tourSteps.findIndex(s=>s.chapter===this.api.chapter()):0;
    this.active=this.visible=true;this.paused=Boolean(document.hidden);document.body.dataset.guide='active';this.api.layout();return this.enter(Math.max(0,entry));
  }
  stop(){
    this.token++;this.clipToken++;this.api.endInspection?.();this.audio.pause();this.active=this.visible=false;this.paused=false;this.holdPhysics=false;
    document.body.dataset.guide='closed';this.render();this.api.layout();this.api.highlight(null);
  }
  async enter(index){
    if(!this.active||!tourSteps[index])return;
    this.api.beforeStep?.();
    const token=++this.token;this.clipToken++;this.audio.pause();this.index=index;this.step=tourSteps[index];
    this.cues=this.step.cues||[{id:this.step.id,text:this.step.text,shot:this.step.shot,target:this.step.target||this.step.shot}];
    this.cueIndex=0;this.cue=this.cues[0];this.cueDone=false;this.narrated=false;this.audioFailed=false;
    this.checkpointMet=!this.step.checkpoint;this.holdPhysics=false;this.paused=Boolean(document.hidden);this.loading=true;
    if(this.step.question?.resetOnEnter)delete this.answers[this.step.id];
    const details=this.panel.querySelector('#guide-details');if(details)details.open=false;
    this.refreshReady();this.render();
    await this.api.navigate(this.step.chapter,()=>token===this.token&&this.active);if(token!==this.token||!this.active)return;
    this.loading=false;if(document.hidden)this.paused=true;
    this.api.perform(this.step.action);this.challengeBefore=this.step.id==='outro'?this.api.snapshot()?.elastic:undefined;
    this.showCue(0);this.render();
  }
  refreshReady(){this.ready=this.checkpointMet&&(!this.step.question||Number.isInteger(this.answers[this.step.id]));}
  nextCueAllowed(){const next=this.cues?.[this.cueIndex+1];return Boolean(next&&(!next.waitFor||this.checkpointMet));}
  next(){
    if(!this.active||this.loading||!this.ready)return;
    if(this.cueIndex<this.cues.length-1){if(this.nextCueAllowed())this.showCue(this.cueIndex+1);return;}
    if(this.index===tourSteps.length-1){this.stop();return;}
    return this.enter(this.index+1);
  }
  showCue(index){
    if(!this.active||!this.cues[index])return;
    this.audio.pause();this.cueIndex=index;this.cue=this.cues[index];this.cueDone=false;this.narrated=false;this.audioFailed=false;
    const clip=++this.clipToken;this.audio.src=narrationUrl(this.cue.id);this.audio.dataset.provider=narrationSource.provider;this.audio.muted=this.muted;this.audio.currentTime=0;
    this.audio.onended=()=>{if(clip!==this.clipToken||!this.active)return;this.cueDone=true;this.narrated=this.cueIndex===this.cues.length-1;this.render();};
    this.api.highlight(this.cue.target||this.cue.shot||this.step.shot);this.api.shot(this.cue.shot||this.step.shot);
    this.render();if(!this.paused&&!this.loading)this.playClip(clip);
  }
  async playClip(clip=this.clipToken){
    if(this.paused||this.loading||document.hidden||!this.active)return;
    try{await this.audio.play();if(clip!==this.clipToken)return;if(this.paused||!this.active||document.hidden)this.audio.pause();}
    catch{if(clip===this.clipToken&&this.active&&!this.paused)this.failAudio(clip);}
  }
  failAudio(clip){
    if(!this.active||this.loading||clip!==this.clipToken)return;
    this.audioFailed=true;this.cueDone=true;this.narrated=this.cueIndex===this.cues.length-1;this.render();
  }
  setPaused(value=true){
    if(!this.active)return;
    this.paused=Boolean(value);
    if(this.paused)this.audio.pause();
    else if(!this.loading){this.api.resumeView?.();if(!this.cueDone)this.playClip();}
    this.render();
  }
  togglePause(){if(!this.active)return this.start(true);this.setPaused(!this.paused);}
  selectChoice(index){
    const q=this.step?.question;if(!this.active||this.loading||!q||!Number.isInteger(index)||!q.options[index])return;
    this.answers[this.step.id]=index;this.api.recordPrediction?.(this.step.id,index);
    if(q.compareAction)this.api.perform(q.compareAction);
    this.refreshReady();this.render();
  }
  update(dt){
    if(!this.active||this.loading)return;
    if(document.hidden&&!this.paused)this.setPaused(true);
    if(this.paused)return;
    const s=this.api.snapshot();
    if(!this.checkpointMet&&s){
      const met=this.step.checkpoint==='bottom'?s.crossedBottom:this.step.checkpoint==='loss'?s.time>=4:this.step.checkpoint==='apex'?s.atApex:this.step.checkpoint==='landed'?s.phase==='landed':false;
      if(met){this.checkpointMet=true;this.holdPhysics=true;this.refreshReady();this.api.checkpoint(this.step.checkpoint);this.render();}
    }
    this.balanceClock+=dt;
    if(this.balanceClock>.12){this.balanceClock=0;this.renderBalance(s);}
    if(this.cueDone&&this.nextCueAllowed()&&!this.audioFailed){this.showCue(this.cueIndex+1);return;}
    if(this.ready&&this.narrated&&this.step.auto&&!this.audioFailed)this.next();
  }
  feedbackText(){
    if(this.step.id==='ramp-ready'&&Number.isInteger(this.answers['ramp-ready']))return '已记录：'+this.step.question.options[this.answers['ramp-ready']]+'。松开后，再用结果检验。';
    if(this.step.id==='ramp-bottom'&&this.checkpointMet){
      const choice=this.answers['ramp-ready'];if(!Number.isInteger(choice))return '观察结果：最低处动能最大，其中包括平移和转动。';
      return choice===0?'与你的预测一致：最低处动能最大。':'你预测了“'+tourSteps.find(s=>s.id==='ramp-ready').question.options[choice]+'”。实际观察到：最低处动能最大。';
    }
    if(this.step.id==='outro'&&Number.isInteger(this.answers.outro)){
      const after=this.api.snapshot()?.elastic,before=this.challengeBefore;
      const values=Number.isFinite(before)&&Number.isFinite(after)?`${before.toFixed(2)} → ${after.toFixed(2)} J`:'0.23 → 0.91 J';
      return (this.answers.outro===1?'预测正确。':'对照后再修正：')+`压缩量 0.18 → 0.36 m，弹性势能 ${values}，变为 4 倍。`;
    }
    return '';
  }
  renderQuestion(){
    const el=this.panel.querySelector('#guide-question');if(!el)return;
    const q=this.step.question,selected=this.answers[this.step.id];el.hidden=!q;el.dataset.answered=String(Number.isInteger(selected));
    if(!q){el.innerHTML='';return;}
    const focus=document.activeElement?.dataset?.choice;
    el.innerHTML=`<p>${escapeHTML(q.prompt)}</p><div class="guide-choices">${q.options.map((label,i)=>`<button type="button" data-choice="${i}" aria-pressed="${selected===i}" ${this.loading?'disabled':''}>${escapeHTML(label)}</button>`).join('')}</div>`;
    el.querySelectorAll('[data-choice]').forEach(button=>{button.onclick=()=>this.selectChoice(Number(button.dataset.choice));});
    if(focus!==undefined)el.querySelector(`[data-choice="${focus}"]`)?.focus({preventScroll:true});
  }
  renderBalance(s){
    const el=this.panel.querySelector('#guide-balance');el.dataset.focus=this.cue?.target||'';
    if(this.loading){el.innerHTML='<span class="balance-note">翻页后显示这一课的实时能量。</span>';return;}
    if(!s||this.step.chapter===1){el.innerHTML='<span class="balance-note">第一课是类型图例，不标注未经测量的焦耳数。</span>';return;}
    const rows=this.step.chapter===2?[[1,'势能','potential',s.potential],[0,'动能','kinetic',s.kinetic],[3,'内能','thermal',s.thermal]]:[[2,'弹性','elastic',s.elastic],[0,'动能','kinetic',s.kinetic],[1,'势能','potential',s.potential],[3,'内能','thermal',s.thermal]];
    el.innerHTML=rows.map(([color,label,key,v])=>`<div class="energy-item energy-${color}" data-energy="${key}"><span>${label}</span><b>${Math.max(0,v).toFixed(2)} <small>J</small></b><i style="--fill:${Math.min(100,Math.max(0,v)/Math.max(.001,s.initial)*100)}%"></i></div>`).join('')+`<div class="energy-total">总量 ${s.total.toFixed(3)} J <span>${this.step.chapter===2?'动能含平移与转动':'弹簧 + 重力 + 动能 + 内能'}</span></div>`;
  }
  render(){
    this.panel.hidden=!this.visible;this.panel.dataset.state=this.active?(this.paused?'paused':this.loading?'loading':this.ready&&this.narrated?'waiting':'playing'):'intro';
    this.panel.dataset.step=this.step?.id||'intro';this.panel.dataset.cue=this.cue?.id||'';
    this.panel.querySelector('#guide-intro').hidden=this.active;this.panel.querySelector('#guide-story').hidden=!this.active;
    document.querySelector('#watch').setAttribute('aria-label',this.active?(this.paused?'继续有声导览':'暂停有声导览'):'开始有声导览');
    document.querySelector('#watch').setAttribute('aria-pressed',String(this.active&&!this.paused));
    if(!this.active)return;
    this.panel.querySelector('#guide-title').textContent=this.step.title;
    const subtitle=this.panel.querySelector('#guide-subtitle');subtitle.textContent=this.cue.text;subtitle.setAttribute('aria-live',this.muted?'polite':'off');
    const full=this.panel.querySelector('#guide-fulltext');if(full)full.textContent=this.cues.map(c=>c.text).join('\n');
    const cueLabel=this.panel.querySelector('#guide-cue');if(cueLabel){cueLabel.textContent=this.cues.length>1?`${this.cueIndex+1} / ${this.cues.length} 句`:'';cueLabel.hidden=this.cues.length===1;}
    this.renderQuestion();
    const feedback=this.panel.querySelector('#guide-feedback');if(feedback){feedback.textContent=this.feedbackText();feedback.hidden=!feedback.textContent;}
    this.panel.querySelector('#guide-count').textContent=`${String(this.index+1).padStart(2,'0')} / ${String(tourSteps.length).padStart(2,'0')}`;
    this.panel.querySelector('#guide-progress').max=tourSteps.length;this.panel.querySelector('#guide-progress').value=this.index+1;
    this.panel.querySelector('#guide-status').textContent=this.paused?(this.loading?'翻页已暂停 · 继续后再展开':'已暂停 · 可拖动环视、滚轮缩放'):this.loading?'正在翻到这一页':this.audioFailed?'可阅读当前字幕，再点下方继续':this.step.question&&!this.ready?'先选一个预测，没有答题分数':this.holdPhysics?(this.narrated?'可拖动观察，或点下方继续':'停在关键时刻 · 拖动可暂停讲解并观察'):this.narrated?'轮到你了':this.step.chapter>1?'跟随讲解 · 物理慢放 ×0.55':'MiniMax 配音 · 正在讲解';
    const more=this.cueIndex<this.cues.length-1;
    this.panel.querySelector('#guide-next').textContent=!this.ready?(this.step.question?'先选一个预测':'观察中…'):more?(this.cue.nextLabel||'看下一句'):this.step.cta;
    this.panel.querySelector('#guide-next').disabled=!this.ready||this.loading||(more&&!this.nextCueAllowed());
    this.panel.querySelector('#guide-back').disabled=this.index===0||this.loading;
    this.panel.querySelector('#guide-pause').textContent=this.paused?'继续':'暂停';
    this.panel.querySelector('#guide-mute').textContent=this.muted?'开启声音':'静音';
    this.panel.querySelector('#guide-mute').setAttribute('aria-pressed',String(this.muted));
    this.api.syncPlayback?.();this.renderBalance(this.api.snapshot());
  }
}
