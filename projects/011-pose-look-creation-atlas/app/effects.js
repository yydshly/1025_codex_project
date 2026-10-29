/* Actual, recorded image-generation examples. This page never calls a model. */
const effectData=window.EXPERIMENTS;
const effectAssets=new Map(effectData.assets.map(asset=>[asset.id,asset]));
const effectState={id:'tryon',variant:'studio-a',reveal:50};
const effectRoleLabels={'person':'AI 生成 · 虚构成年人物','dress-a':'AI 生成 · 原创概念服装','dress-b':'AI 生成 · 原创概念服装','studio-a':'本次参考编辑结果','studio-b':'本次参考编辑结果','garden':'本次参考编辑结果','pose':'本次参考编辑结果','pose-guide':'本项目自绘 · 非源图库原图'};
function effectAsset(id){return effectAssets.get(id);}
function currentEffect(){return effectData.cases.find(item=>item.id===effectState.id);}
function currentAfter(){return effectState.id==='tryon'?effectState.variant:currentEffect().after;}
function setReveal(value){
  effectState.reveal=Math.max(0,Math.min(100,Number(value)));
  $('#comparison-frame').style.setProperty('--reveal',`${effectState.reveal}%`);
  $('#compare-range').value=effectState.reveal;
  $('#compare-range').setAttribute('aria-valuetext',`参考图 ${effectState.reveal}%，生成结果 ${100-effectState.reveal}%`);
  $('.before-tag').hidden=effectState.reveal===0;
  $('.after-tag').hidden=effectState.reveal===100;
  $('.comparison-divider').hidden=effectState.reveal===0||effectState.reveal===100;
}
function openEffectImage(id){
  const asset=effectAsset(id);if(!asset)return;
  $('#lightbox-title').textContent=asset.label;
  $('#lightbox-image').src=asset.path;$('#lightbox-image').alt=asset.label;
  $('#lightbox-caption').textContent=`${effectRoleLabels[id]}。点击关闭或按 Esc 返回。`;
  $('#effect-lightbox').showModal();
}
function openProductScenario(id){
  state.scene=id;renderScene();location.hash='scenarios';
}
function renderEffect(){
  const record=currentEffect(),after=effectAsset(currentAfter()),before=effectAsset(record.before);
  const inputs=record.id==='tryon'?['person',effectState.variant==='studio-a'?'dress-a':'dress-b']:record.inputs;
  $$('[data-effect-case]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.effectCase===record.id)));
  $('#effect-title').textContent=record.title;
  $('#effect-variants').hidden=record.id!=='tryon';
  $$('[data-effect-variant]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.effectVariant===effectState.variant)));
  $('#compare-before').src=before.path;$('#compare-before').alt=`对照基准：${before.label}`;
  $('#compare-after').src=after.path;$('#compare-after').alt=`本次实际生成：${after.label}`;
  $('#effect-inputs').innerHTML=inputs.map(id=>{const asset=effectAsset(id);return `<figure class="effect-input-card"><button data-enlarge="${id}" aria-label="放大${escapeHTML(asset.label)}"><img src="${escapeHTML(asset.path)}" alt="${escapeHTML(asset.label)}" width="1024" height="1536" loading="lazy"></button><figcaption><b>${escapeHTML(asset.label)}</b>${escapeHTML(effectRoleLabels[id])}</figcaption></figure>`;}).join('');
  $('#effect-review').innerHTML=`<h3>这次能看出什么？</h3><dl><dt>希望保持</dt><dd>${escapeHTML(record.fixed)}</dd><dt>希望改变</dt><dd>${escapeHTML(record.changed)}</dd></dl><h4>目测观察 · 未做量化评测</h4><ul>${record.observations.map(note=>`<li>${escapeHTML(note)}</li>`).join('')}</ul><p class="effect-boundary">${escapeHTML(record.boundary)}</p><button class="button light" data-open-scenario="${record.scenario}">延伸到产品场景 →</button>`;
  setReveal(50);
}
$$('[data-effect-case]').forEach(button=>button.addEventListener('click',()=>{effectState.id=button.dataset.effectCase;renderEffect();}));
$$('[data-effect-variant]').forEach(button=>button.addEventListener('click',()=>{effectState.variant=button.dataset.effectVariant;renderEffect();}));
$('#compare-range').addEventListener('input',event=>setReveal(event.target.value));
let draggingComparison=false;
function revealAtPointer(event){
  const rect=$('#comparison-frame').getBoundingClientRect();
  setReveal(Math.round((event.clientX-rect.left)/rect.width*100));
}
$('#comparison-frame').addEventListener('pointerdown',event=>{
  if(event.button!==0)return;
  draggingComparison=true;event.currentTarget.setPointerCapture(event.pointerId);revealAtPointer(event);
});
$('#comparison-frame').addEventListener('pointermove',event=>{if(draggingComparison)revealAtPointer(event);});
for(const eventName of ['pointerup','pointercancel'])$('#comparison-frame').addEventListener(eventName,()=>{draggingComparison=false;});
$$('#comparison-frame img').forEach(img=>{img.draggable=false;});
$$('[data-reveal]').forEach(button=>button.addEventListener('click',()=>setReveal(button.dataset.reveal)));
$('#enlarge-effect').addEventListener('click',()=>openEffectImage(currentAfter()));
$('#close-lightbox').addEventListener('click',()=>$('#effect-lightbox').close());
$('#effect-lightbox').addEventListener('click',event=>{if(event.target===$('#effect-lightbox'))$('#effect-lightbox').close();});
$('#effects').addEventListener('click',event=>{
  const imageButton=event.target.closest('[data-enlarge]');
  if(imageButton){openEffectImage(imageButton.dataset.enlarge);return;}
  const scenarioButton=event.target.closest('[data-open-scenario]');
  if(scenarioButton)openProductScenario(scenarioButton.dataset.openScenario);
});
renderEffect();
