import {observedStory} from './observed-story.js';
import {dynamicEvents} from './dynamic-events.js';
import {stormCoastlineSource} from './storm-geography.js';
import {formatRiverElapsed} from './river-evidence.js';
import {formatTideUtc} from './tide-observations.js';
import {formatBatteryElapsed} from './battery-observations.js';
import {formatDieselElapsed} from './diesel-observations.js';
import {hungaSpots,hungaViewLabels} from './hunga-terrain-data.js';
import {cloudReference,cloudReferenceColor,createSceneEvidence,sceneEvidence,supportsSceneEvidence} from './scene-evidence.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock=t=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(t));
const scanClock=t=>t?.slice(11,16);
function stormEvidence(data,snapshot,story,phase){
 const frame=snapshot?.frame??data.frames.find(row=>row.timeUtc===story.timeUtc);
 if(!frame)return '';
 const track=data.track??[];
 const analyzedAt=story.pins.find(pin=>pin.id==='jma-current')?.sourceTimeUtc;
 const analysis=track.find(row=>row.timeUtc===analyzedAt);
 const missing=data.missingOriginalScans?.find(row=>row.timeUtc>data.startUtc&&row.timeUtc<data.endUtc);
 const before=missing&&data.frames.findLast(row=>row.timeUtc<missing.timeUtc);
 const after=missing&&data.frames.find(row=>row.timeUtc>missing.timeUtc);
 const gap=before&&after&&[before.timeUtc,after.timeUtc].includes(frame.timeUtc);
 const first=track[0];
 const compare=phase==='review'&&first&&analysis&&first!==analysis;
 return `<div class="storm-clock"><span>葵花八号 · 红外扫描</span><strong>${scanClock(frame.timeUtc)} UTC</strong><small>${frame.scanStartUtc?.slice(11,19)??'—'}–${frame.scanEndUtc?.slice(11,19)??'—'} 实际扫描窗</small></div>
 <div class="storm-clock storm-clock-jma"><span>JMA · 事后中心分析</span><strong>${analysis?scanClock(analysis.timeUtc)+' UTC':'缺有效分析'}</strong><small>${analysis?`${analysis.windKt} kt · ${analysis.pressureHpa} hPa`:'保留卫星扫描'}</small></div>
 ${gap?`<p class="storm-evidence-note storm-gap">${scanClock(before.timeUtc)} → ${scanClock(after.timeUtc)} UTC · ${scanClock(missing.timeUtc)} 缺档 · 仅显示真实扫描</p>`:''}
 ${compare?`<p class="storm-evidence-note">${scanClock(first.timeUtc)} → ${scanClock(analysis.timeUtc)} UTC · 最大持续风速 <b>${first.windKt} → ${analysis.windKt} kt</b> · 中心气压 <b>${first.pressureHpa} → ${analysis.pressureHpa} hPa</b></p>`:''}
 <p class="storm-evidence-note storm-map-key"><span>白线 海岸</span><span>青线 低温参考轮廓</span><span>金线与金点 官方分析位置</span><a href="${stormCoastlineSource.url}" target="_blank" rel="noopener">海岸来源 ↗</a></p>`;
}
function cloudMotionNote(comparison){
 if(!comparison)return null;
 switch(comparison.status){
  case 'visible':return `${scanClock(comparison.fromTimeUtc)} → ${scanClock(comparison.timeUtc)} UTC · 亮温 ${comparison.operator==='<'?'<':'≤'} ${comparison.thresholdK} K`;
  case 'loading':return '正在载入低温区对照 · 当前影像照常显示';
  case 'failed':return '低温区对照未载入 · 保留当前真实影像';
  case 'raw':return '原始亮温模式 · 关闭低温区对照';
  case 'unavailable':return '无可用的相邻扫描 · 有当时影像才显示';
  default:return null;
 }
}
export const observedMoments={
 ...Object.fromEntries(Object.entries(dynamicEvents).map(([slug,event])=>['dynamic-'+slug,event.moments])),
 'typhoon-real':[['2018-09-16T04:00:00Z','香港12时'],['2018-09-16T04:30:00Z','风记录更新'],['2018-09-16T05:00:00Z','香港13时']]
};
export function setupObservedPresentation(driver){
 let features=null,featureStatus='loading',featureRequest=null,featureAbort=null,ended=false,story=null,key='',route='',selected=null,annotations=true,seekController=null,waiting=false;
 let narrationFocus=null,cloudSuspended=false;
 const stormPanel=$('#storm-evidence');
 const framePanel=createSceneEvidence($('#observation-stage'),$('#observed-keyframes'));
 async function loadFeatures(){
  if(ended)return;if(featureRequest)return featureRequest;
  featureStatus='loading';key='';featureAbort=new AbortController();
  featureRequest=(async()=>{
   try{
    const response=await fetch('data/observed-change-features.json',{signal:featureAbort.signal});
    if(!response.ok)throw new Error('Contour request failed');const data=await response.json();
    if(data?.schemaVersion!==1||!data.events||typeof data.events!=='object')throw new Error('Invalid contour manifest');
    if(ended)return;features=data;featureStatus='ready';
   }catch{if(!ended){features=null;featureStatus='unavailable';}}
   finally{featureRequest=null;key='';if(!ended)refresh();}
  })();
  refresh();return featureRequest;
 }
 function getExportContext(){
  const c=driver.context(),kind=c.data?.kind,cloud=['volcano','storm'].includes(kind),candidate=features?.events?.[kind];
  if(kind==='river'){
   const shown=annotations&&!waiting&&c.displayReady!==false&&route===c.route&&story?.elapsedSeconds===c.elapsedSeconds;
   return {enabled:annotations,elapsedSeconds:shown?story.elapsedSeconds:null,displayedTransects:shown?c.riverView?.displayedLabels??[]:[]};
  }
  if(kind==='tide'){
   const shown=annotations&&!waiting&&c.displayReady!==false&&route===c.route&&story?.timeUtc===c.timeUtc;
   return {enabled:annotations,timeUtc:shown?story.timeUtc:null,displayedLabels:shown?c.tideView?.displayedLabels??[]:[]};
  }
  if(kind==='battery'||kind==='engine'){
   const shown=annotations&&!waiting&&c.displayReady!==false&&route===c.route&&story?.elapsedSeconds===c.elapsedSeconds;
   return {enabled:annotations,elapsedSeconds:shown?story.elapsedSeconds:null,displayedLabels:shown?(kind==='engine'?c.dieselView:c.batteryView)?.displayedLabels??[]:[]};
  }
  const event=candidate?.eventId===c.data?.id?candidate:null;
  const frame=event?.frames?.find(f=>Date.parse(f.timeUtc)===Date.parse(c.timeUtc))??null;
  const status=!cloud?'not-applicable':featureStatus!=='ready'?featureStatus:!event?'unsupported-event':!frame?'missing-frame':'available';
  const shown=annotations&&!waiting&&c.displayReady!==false&&route===c.route&&story&&Date.parse(story.timeUtc)===Date.parse(c.timeUtc);
  return {
   enabled:annotations,timeUtc:shown?story.timeUtc:null,displayedPinIds:shown?story.pins.map(p=>p.id):[],
   scanComparison:c.cloudComparison&&Date.parse(c.cloudComparison.timeUtc)===Date.parse(c.timeUtc)&&c.displayReady!==false?c.cloudComparison:null,
   referenceContours:{status,displayed:Boolean(shown&&frame?.lines?.length),lineCount:shown&&frame?frame.lines.length:0,
    manifest:features&&cloud?{schemaVersion:features.schemaVersion,derivedAtUtc:features.derivedAtUtc,method:features.method}:null,
    eventId:event?.eventId??null,sourceManifest:event?.sourceManifest??null,timeUtc:frame?.timeUtc??null,sourceNumeric:frame?.sourceNumeric??null,
    threshold:event?.threshold??null,grid:event?{stepSourcePixels:event.grid?.stepSourcePixels,maximumCellDiagonalKm:event.grid?.maximumCellDiagonalKm,simplification:event.grid?.simplification,errorMeaning:event.grid?.errorMeaning}:null,
    meaning:'Current-frame coarse brightness-temperature threshold references, not measured cloud height, ash concentration or tracked motion.'}
  };
 }
 function clearFocus(){
  document.querySelectorAll('.story-evidence-focus,.story-guide-focus').forEach(el=>el.classList.remove('story-evidence-focus','story-guide-focus'));
 }
 function targetsFor(target,kind){
  const all=[...document.querySelectorAll('[data-story-target],[data-story-focus],[data-series],[data-reading],[data-station],[data-river-transect]')]
   .filter(el=>[el.dataset.storyTarget,el.dataset.storyFocus,el.dataset.series,el.dataset.reading,el.dataset.station,el.dataset.riverTransect].includes(target));
  if(target?.includes('.BHZ'))all.push(...document.querySelectorAll('#readouts,#charts .dynamic-chart'));
  if(kind==='river')all.push($('#readouts'));
  if(['volcano','storm'].includes(kind))all.push($('#current-insight .dynamic-original'));
  if(target==='cloud')all.push($('#view-label'));
  if(target==='origin')all.push($('.context'));
  if(target==='dixie-wind')all.push($('#current-insight'));
  if(target==='dixie-sectors')all.push($('#charts'));
  return all.filter(Boolean);
 }
 function directedFor(c){
  if(narrationFocus?.route!==c.route)return null;
  if(['river','quake'].includes(c.data?.kind)&&c.stationId!==narrationFocus.target&&narrationFocus.target!=='origin')return null;
  return narrationFocus;
 }
 function applyFocus(c=driver.context()){
  clearFocus();
  if(!story)return;
  const kind=c.data?.kind;
  const directed=directedFor(c);
  const target=selected??directed?.target;
  const chosen=target?[target]:story.metricsFocus||[];
  for(const name of chosen)for(const el of targetsFor(name,kind)){
   if(!annotations&&(el.classList.contains('observed-story-pin')||el.classList.contains('river-tracer-label')))continue;
   el.classList.add(directed&&!selected?'story-guide-focus':'story-evidence-focus');
  }
 }
 function focus(target){
  if(!story||waiting)return;
  const kind=driver.context().data?.kind,tide=kind==='tide';
  if(tide&&['observed','predicted'].includes(target))target='tide';
  selected=target;
  driver.onManualFocus?.(target);
  const c=driver.context(),section=c.data?.kind==='river'?c.data.transects.find(item=>item.id===target):null;
  if((target?.includes('.BHZ')||section)&&target!==c.stationId)driver.selectStation(target);
  for(const b of document.querySelectorAll('#story-location-list button'))b.setAttribute('aria-pressed',String(b.dataset.storyFocus===target));
  const label=kind==='engine'?({rpm:'发动机转速',torque:'输出扭矩',railPressure:'原档轨压'})[target]:kind==='battery'?({voltage:'端电压',current:'电池输出电流',temperature:'电池温度'})[target]
   :tide?(target==='moon'?'站点月球星历':'港口潮位对照'):section?.label||story.pins.find(p=>p.target===target)?.title;
  applyFocus();$('#story-focus-hint').textContent='已对应突出：'+(label||'当前观测曲线');
 }
 function clear(){
  seekController?.abort();seekController=null;
  stormPanel.hidden=true;
  framePanel.hide();
  if(!route&&!story&&!waiting)return;route='';story=null;key='';selected=null;narrationFocus=null;waiting=false;cloudSuspended=false;driver.setStory(null);clearFocus();
  for(const id of ['observed-story-band','observed-locations','observed-keyframes','observed-story-legend'])$('#'+id).hidden=true;
  document.body.classList.remove('story-active','story-annotated');
 }
 function refresh(){
  const c=driver.context();
  const river=c.data?.kind==='river',tide=c.data?.kind==='tide',battery=c.data?.kind==='battery',diesel=c.data?.kind==='engine',time=c.timeUtc??c.elapsedSeconds;
  const wildfire=c.data?.kind==='wildfire',storm=c.route==='dynamic-storm';
  const scanUtc=storm||c.route==='dynamic-volcano';
  if(!storm)stormPanel.hidden=true;
  const hunga=c.hunga?.hungaMode;
  const compact=supportsSceneEvidence(c)&&!hunga&&!document.body.dataset.caseLesson&&!document.body.classList.contains('demo-active');
  if(!compact||c.route!==route)framePanel.hide();
  const elapsed=river||battery||diesel;
  const eventClock=wildfire?scan=>scan.slice(0,10):diesel?formatDieselElapsed:battery?formatBatteryElapsed:river?formatRiverElapsed:tide?formatTideUtc:scanUtc?scanClock:clock;
  const motion=c.cloudComparison?.status==='visible'&&Date.parse(c.cloudComparison.timeUtc)!==Date.parse(c.timeUtc)?null:c.cloudComparison;
  const cloudKey=$('#story-cloud-key'),cloudNote=cloudMotionNote(motion);
  cloudKey.hidden=c.loading||c.displayReady===false||motion?.status!=='visible';
  if(!observedMoments[c.route]||!c.data){clear();return;}
  if(c.route!==route){seekController?.abort();seekController=null;}
  if(c.loading||(time==null&&!c.displayFailed)){
   framePanel.pending('正在对齐画面和观测…');
   if(!waiting){
    cloudSuspended=c.route===route&&Boolean(driver.suspendCloudStory?.());
    if(!cloudSuspended)driver.setStory(null);
   }
   waiting=true;delete $('#observed-story-band').dataset.observedTime;$('#story-location-list').hidden=true;$('#story-headline').textContent='正在准备对应时刻的真实观测';$('#story-summary').textContent='画面就绪后，位置标注与曲线一起更新。';$('#story-sync-status').textContent='等待对应真实观测就绪…';if(motion)$('#story-geometry-note').textContent='等待当前扫描…';return;
  }
  if(c.displayReady===false){
   framePanel.pending('这一步的画面未就绪，可切换其他时刻。');
   if(storm)stormPanel.hidden=true;
   if(!waiting||cloudSuspended)driver.setStory(null);waiting=true;cloudSuspended=false;clearFocus();
   delete $('#observed-story-band').dataset.observedTime;$('#observed-story-band').hidden=false;$('#story-location-list').hidden=true;
   document.body.classList.add('story-active','story-annotated');
   const missingCloud=c.route==='typhoon-real'&&!c.displayFailed;
   $('#story-phase').textContent=missingCloud?'云图缺档':'画面未显示';
   $('#story-headline').textContent=missingCloud?'这一时刻没有真实云图':'对应观测画面未能显示';
   $('#story-summary').textContent=c.route==='typhoon-real'?'地面观测保留各自记录时刻；云图与球面标注暂不显示，可换一个真实扫描时刻。':'读数保留已提交的真实时刻；画面重新就绪后，才恢复球面标注与轮廓。';
   $('#story-sync-status').textContent=missingCloud?'云图缺档 · 地面观测另列时刻':'画面未就绪 · 暂不声明同刻联动';
   $('#story-voice-status').textContent='画面就绪后可继续讲解';return;
  }
  const narration=driver.narration(),directed=directedFor(c);
  const stormPhase=storm&&narration?.step?.cue?.stormEvidence;
  const nextKey=[c.route,time,c.stationId,river?c.riverView?.basemapStatus:tide?c.tideView?.basemapStatus:featureStatus,c.tideView?.view,c.tideView?.focus,directed?.key,directed?.atAnchor,cloudNote,hunga,c.hunga?.hungaSpot,stormPhase,compact].join('|');
  if(c.route!==route){seekController?.abort();seekController=null;route=c.route;selected=null;$('#story-focus-hint').textContent=diesel?'点击发动机仪表，核对对应曲线':battery?'点击电芯仪表，核对对应曲线':'点击地球标注，核对对应曲线';$('#observed-keyframes').innerHTML=observedMoments[route].map(([t,label,station],i)=>`<button type="button" data-observed-time="${t}"${station?' data-observed-station="'+station+'"':''}><small>0${i+1}</small><strong>${label}</strong><span>${eventClock(t)}${tide||scanUtc?' UTC':''}</span></button>`).join('');}
  const needsUpdate=key!==nextKey||waiting;waiting=false;cloudSuspended=false;
  if(needsUpdate){
   key=nextKey;
   try{story=observedStory({route:c.route,data:c.data,snapshotTimeUtc:c.timeUtc,snapshot:c.snapshot,stationId:c.stationId,features,narrationCue:narration?.step?.cue});}
   catch{clear();return;}
   if(storm){
    stormPanel.innerHTML=stormEvidence(c.data,c.snapshot,story,stormPhase);
    stormPanel.hidden=!stormPanel.innerHTML;
   }
   const pins=directed&&!selected?[...story.pins].sort((a,b)=>Number(b.target===directed.target)-Number(a.target===directed.target)):story.pins;
   const referenceTime=cloudReference[c.data.kind];
   const referenceEvent=features?.events?.[c.data.kind];
   const referenceFrame=compact&&annotations&&c.snapshot?.frame&&Date.parse(time)>Date.parse(referenceTime)&&
    referenceEvent?.eventId===c.data.id&&referenceEvent.frames.find(frame=>frame.timeUtc===referenceTime);
   const referenceLines=(referenceFrame?.lines??[]).slice().sort((a,b)=>b.coordinates.length-a.coordinates.length).slice(0,4)
    .map(line=>({...line,id:'comparison-'+line.id,color:cloudReferenceColor,dashed:true}));
   story.lines.push(...referenceLines);
   driver.setStory(annotations?{...story,pins}:null);
   $('#story-location-list').hidden=false;
   for(const id of ['observed-story-band','observed-locations','observed-keyframes','observed-story-legend'])$('#'+id).hidden=false;
   $('#observed-locations').hidden=river||tide||battery||diesel||wildfire||Boolean(hunga);
   document.body.classList.add('story-active');document.body.classList.toggle('story-annotated',annotations);
   const tideView=c.tideView?.view;
   $('#story-headline').textContent=tide&&tideView==='global'?'先看月球方向和旧金山验潮站':tide&&tideView==='flight'?'沿着地球表面靠近旧金山港':story.headline;
   $('#story-summary').textContent=tide&&tideView==='global'?'先找月球和青色的验潮站。到港口后，左图读月球高度，右图读当地潮位。':tide&&tideView==='flight'?'镜头向旧金山验潮站靠近。抵达后，岸边水线与左右图表一起推进。':story.summary;
   $('#observed-story-band').dataset.observedTime=time;
   $('#story-sync-status').textContent=eventClock(time)+(elapsed||wildfire?'':tide||scanUtc?' UTC':' UTC+8')+(storm?' · 卫星扫描 / 中心分析分列':wildfire?' · 制图日期 / 测站时钟分列':diesel?' · 台架仪表 / 两侧图表同刻':battery?' · 电芯仪表 / 两侧图表同刻':' · 地球 / 标注 / 曲线同刻');
   const tideFocusLabel=({'rise':'月升特写','set':'月落特写','peak':'潮峰对照'})[c.tideView?.focus];
   $('#story-phase').textContent=(tide&&tideView==='detail'&&tideFocusLabel)||({'mapped-perimeter':'红外边界档案','area-increased':'低温区增加','area-decreased':'低温区减少','area-unchanged':'区域稳定','before-origin':'震前记录','recorded':'实测起伏','missing-frame':'扫描缺档','partial-observations':'部分观测缺报','river-tracer':'实地示踪','harbor-tide':'港口观测','battery-discharge':'放电实测','engine-bench':'台架记录'})[story.phase]||'真实观测';
   $('#story-annotations').hidden=wildfire||Boolean(hunga);
   $('#story-location-list').innerHTML=story.pins.map(p=>`<button type="button" data-story-focus="${esc(p.target)}" style="--pin-accent:${esc(p.color)}"><span>${esc(p.title)}</span><strong>${esc(p.value)}</strong><small>${esc(p.detail)}</small></button>`).join('');
   const contour=getExportContext().referenceContours,kind=c.data.kind,event=features?.events?.[kind],cloud=['volcano','storm'].includes(kind);
   $('#story-feature-retry').hidden=!cloud||featureStatus!=='unavailable';$('#story-feature-retry').disabled=featureStatus==='loading';
   if(wildfire){
    $('#story-geometry-note').textContent='实线为测站实测风 · 虚线指向新划入区域 · 精确制图时刻未核实';
    $('#story-focus-hint').textContent='切换地形和植被，拖动小时核对风向';
   }else if(river){
    const map=c.riverView?.basemapStatus;
    $('#story-geometry-note').textContent=(map==='fallback'?'底图暂缺 · 显示 USGS 河道中心线 · ':'')+'从 01 到 03 看信号先后 · 青色左岸，金色右岸 · 标记大小反映该点浓度';
    const section=c.data.transects.find(item=>item.id===c.stationId);
    $('#story-focus-hint').textContent=section?'当前曲线 · '+section.label:'点击断面，查看两岸曲线';
   }else if(tide){
    const view=c.tideView;
    $('#story-geometry-note').textContent=view?.view==='global'
     ?'紫线连接当天月球地心方向的采样 · 距离与月球尺寸采用显示比例'
     :view?.view==='flight'?'地球 → 旧金山验潮站 · 镜头到达后推进时间'
     :'月球和港口为视角示意 · 水线只随 NOAA 实测升降 · 右图可比对同刻预报';
    $('#story-focus-hint').textContent=view?.view==='detail'?'点击月球或实测读数，核对两侧曲线':'从地球飞到验潮站';
   }else if(diesel){
    $('#story-geometry-note').textContent='结构运动为实测转速驱动的慢放示意 · 读数和变化标注取自原档';
   }else if(battery){
    $('#story-geometry-note').textContent='外部仪表为 NASA 实测 · 电芯剖面为结构示意';
   }else{
    $('#story-geometry-note').textContent=cloudNote??(kind==='quake'?'台站刻线：当前一秒的计数范围 · 震前与当前按同站固定刻度对照':!annotations?'位置标注已关闭 · 真实观测继续播放':c.route==='typhoon-real'?'青色：机场平均风 · 金色：鲗鱼涌海水位':featureStatus==='loading'?'正在准备参考轮廓 · 真实影像继续显示':featureStatus==='unavailable'?'参考轮廓未载入 · 真实影像与已有观测点仍可查看':contour.status!=='available'?'当前事件或时刻暂无对应参考轮廓':!contour.lineCount?'本帧无符合阈值的参考轮廓':kind==='storm'?'青色：低温阈值参考轮廓 · 金色：两次分析位置差':'实线：低温阈值参考轮廓 · 虚线：300公里统计圈');
   }
   if(directed&&!selected){
    $('#observed-story-band').dataset.narrationTarget=directed.target;
    $('#story-phase').textContent=directed.slowScan?'真实扫描慢放':'讲解聚焦';
    const name=story.pins.find(pin=>pin.target===directed.target)?.title||
     (river?c.data.transects.find(section=>section.id===directed.target)?.label:null)||
     ({cloud:'香港附近的红外云图',rain:'东区小时雨量'})[directed.target];
    $('#story-focus-hint').textContent=directed.slowScan||directed.atAnchor||!name?directed.label:'继续看 · '+name;
   }else{
    delete $('#observed-story-band').dataset.narrationTarget;
    if(!selected&&!river&&!tide&&!battery&&!diesel&&!wildfire)$('#story-focus-hint').textContent='点击地球标注，核对对应曲线';
   }
   $('#story-note-list').replaceChildren(...story.notes.map(note=>{const p=document.createElement('p');p.textContent=note;return p;}));
   if(motion){const p=document.createElement('p');p.textContent='云图上的对照只比较两幅相邻真实扫描在同一位置的亮温。青色表示亮温新进入阈值的区域，可能来自云系移动、扩展或亮温变化；不能据此判断单团云的轨迹。';$('#story-note-list').append(p);}
   if(event?.eventId===c.data.id){const p=document.createElement('p');p.textContent='球面轮廓由同帧数值亮温网格提取并简化，用于定位低温区；边线不是精确云边界、灰云浓度或云高。';$('#story-note-list').append(p);}
   if(hunga){
    delete $('#observed-story-band').dataset.observedTime;
    $('#story-phase').textContent='NIWA 海底测绘';
    $('#story-headline').textContent=hungaSpots[c.hunga.hungaSpot]+' · '+hungaViewLabels[hunga];
    $('#story-summary').textContent=hunga==='change'?'橙红表示加深，蓝色表示变浅。两侧图表与三维标记指向同一测点。':'中间是实测高程构成的三维地形，两侧光标和读数指向同一测点。';
    $('#story-sync-status').textContent='喷发前后两期测绘';
    $('#story-geometry-note').textContent=hunga==='change'?'A–A′ 为东西向剖面 · 两期都有数据才计算差值':'A–A′ 为 22 公里东西向剖面 · 颜色从浅到深表示水深增加';
    $('#story-focus-hint').textContent='拖动地形或选测点，核对两侧读数';
    $('#story-feature-retry').hidden=true;
   }else if(c.route==='dynamic-volcano'){const p=document.createElement('p');p.textContent='融合显示突出火山周边600公里：400公里内保留原显示权重，400—600公里渐隐。这是显示聚焦，统计范围仍为300公里；切换原始亮温可核对完整窗口。';$('#story-note-list').append(p);}
   const now=elapsed?time:Date.parse(time),steps=observedMoments[route];let current=0;steps.forEach(([t],i)=>{if((elapsed?t:Date.parse(t))<=now)current=i;});
   [...$('#observed-keyframes').children].forEach((b,i)=>b.setAttribute('aria-current',i===current?'step':'false'));
   if(compact)framePanel.show(sceneEvidence({...c,referenceShown:referenceLines.length>0}));
   for(const b of document.querySelectorAll('#story-location-list button'))b.setAttribute('aria-pressed',String(b.dataset.storyFocus===selected));
  }
  applyFocus(c);
  const captionsOnly=dynamicEvents[c.route.slice(8)]?.tour?.captionsOnly;
  const currentGuide=narration?.active&&narration.step?.cue?.route===c.route;
  const aligning=currentGuide&&['loading','buffering'].includes(narration.status);
  const speaking=currentGuide&&(narration.status==='playing'||(aligning&&narration.wantedPlaying));
  const audible=$('#narration-audio')?.paused===false&&!$('#narration-audio')?.muted;
  $('#story-narrate').textContent=speaking?'Ⅱ 暂停讲解':currentGuide?(narration.status==='ended'?'▶ 从头讲解':narration.status==='error'?'▶ 重试讲解':'▶ 继续讲解'):hunga?'▶ MiniMax 讲解海底地形':tide?'▶ 先懂潮汐，再看港口':river?'▶ 开始河流导览':c.data?.kind==='quake'?'▶ 开始地震导览':c.data?.kind==='wildfire'?'▶ 开始山火导览':storm?'▶ 开始台风导览':captionsOnly?'▶ 跟随字幕观察':'▶ MiniMax 边播边讲';
  $('#story-voice-status').textContent=aligning?'正在对齐观测和讲解':speaking?(audible?'◉ MiniMax · ':'字幕讲解 · ')+narration.step.title:currentGuide?(narration.status==='ended'?'讲解已结束':'讲解已暂停'):captionsOnly?'字幕与实测同步':'可一键边播边讲';
  $('#story-voice-status').classList.toggle('speaking',Boolean(speaking));
 }
 $('#story-annotations').addEventListener('click',()=>{annotations=!annotations;key='';$('#story-annotations').setAttribute('aria-pressed',String(annotations));$('#story-annotations').textContent=annotations?'位置标注 ✓':'位置标注';document.body.classList.toggle('story-annotated',waiting||annotations&&Boolean(story));driver.setStory(annotations&&!waiting?story:null);});
 $('#story-narrate').addEventListener('click',()=>{seekController?.abort();seekController=null;driver.narrate();});
 $('#story-feature-retry').addEventListener('click',()=>loadFeatures());
 $('#story-location-list').addEventListener('click',e=>{const b=e.target.closest('[data-story-focus]');if(b)focus(b.dataset.storyFocus);});
 $('#observed-keyframes').addEventListener('click',async e=>{
  const b=e.target.closest('[data-observed-time]');if(!b)return;
  seekController?.abort();seekController=new AbortController();const signal=seekController.signal;
  $('#story-sync-status').textContent='正在定位关键观测…';
  const kind=driver.context().data?.kind;
  const time=['river','battery','engine'].includes(kind)?Number(b.dataset.observedTime):b.dataset.observedTime;
  if(b.dataset.observedStation)driver.selectStation(b.dataset.observedStation,{fromKeyframe:true});
  const ok=await driver.seek(time,{signal,freeze:supportsSceneEvidence(driver.context()),station:b.dataset.observedStation});
  if(ok&&!signal.aborted&&b.closest('.scene-evidence'))$('#observation-stage').scrollIntoView({block:'start',behavior:'instant'});
  if(!signal.aborted){key='';refresh();}
 });
 const interval=setInterval(refresh,180);window.addEventListener('pagehide',()=>{ended=true;featureAbort?.abort();clearInterval(interval);seekController?.abort();clear();});
 loadFeatures();
 return {
  refresh,focus,clear,getExportContext,
  setNarrationFocus(focus){
   if(narrationFocus?.key===focus?.key&&narrationFocus?.atAnchor===focus?.atAnchor)return;
   narrationFocus=focus;refresh();
  },
  clearManualFocus(){selected=null;key='';refresh();},
  getNarrationAnchor(target){return waiting?null:story?.pins.find(pin=>pin.target===target)??null;},
 };
}
