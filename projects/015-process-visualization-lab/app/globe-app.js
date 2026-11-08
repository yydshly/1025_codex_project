import {SCENARIOS,compute,sampleSeries} from './models.js';
import {createGlobeEngine} from './globe-engine.js';
import {SITES,cycloneGeo} from './globe-effects.js';
import {getOverviewStates} from './display-state.js';
import {getProcessInsight} from './process-insights.js';
import {insightMarkup} from './insight-view.js';
import {loadTyphoonArchive,archiveRecordView,ARCHIVE_STAGES,buildArchiveExport} from './typhoon-archive.js';
import {findRecordIndex,formatTime} from './real-event-data.js';
import {compareEventRecords} from './event-comparison.js';
import {buildComparisonReport} from './comparison-report.js';
import {comparisonMarkup} from './comparison-view.js';
import {setupRealMotion} from './real-motion.js';
import {validateSyncBundle,makeClockTicks,synchronizedSnapshot,indexAtOrBefore,utcMillis} from './sync-timeline.js';
import {observationChart,observationReadouts,snapshotReport,localClock,sampleValue} from './sync-observation-view.js';
import {validateCloudChangeBundle,selectCloudChange} from './sync-change-data.js';
import {observedCloudComparison} from './observed-cloud-comparison.js';
import {createEventExplorer} from './event-explorer.js';
import {createDynamicPlayer} from './dynamic-player.js';
import {getDynamicEvent,isDeviceEvent} from './dynamic-events.js';
import {setupNarrationGuide} from './narration-guide.js';
import {tideNarratedTime,tideNarrationPosition,tideSceneFocus} from './tide-narration.js';
import {recordedNarratedTime,recordedNarrationPosition} from './recorded-narration-clock.js';
import {recordedSceneBeats} from './recorded-narration-scenes.js';
import {tours} from './narration-script.js';
import {setupDemoWorkbench} from './demo-workbench.js';
import {setupObservedPresentation} from './observed-presentation.js';
import {hungaLessonBeat} from './hunga-lesson.js';
import {createTideLesson,createTideRecap} from './tide-lesson.js';
import {createMangkhutLesson} from './mangkhut-lesson.js';
import {createQuakeGuideView} from './quake-guide-view.js';
import {createRiverGuideView} from './river-guide-view.js';
import {createMapRecap,mapRecapKind,mapRecapPlan} from './map-evidence-recap.js';
import {guidedCases,withCasePrimer} from './case-lessons.js';
import {createCaseLesson} from './case-lesson-view.js';
import {loadHungaTerrain} from './hunga-terrain-data.js';

const $=s=>document.querySelector(s);
const tideLesson=createTideLesson($('#earth-view'),{
 onPreview:progress=>seekTideLesson(progress,false),
 onSeek:progress=>seekTideLesson(progress,true)
});
const tideRecap=createTideRecap($('#earth-view'),seekTideRecap);
const hungaRecap=$('#hunga-recap');
const mangkhutLesson=createMangkhutLesson($('#earth-view'),seekMangkhutReview);
const quakeGuideView=createQuakeGuideView($('#earth-view'),seekQuakeReview);
const riverGuideView=createRiverGuideView($('#earth-view'),seekRiverReview);
const mapRecap=createMapRecap($('#earth-view'),seekMapRecap);
let mapReviewPlan=null,mapReviewChoice=null,mapReviewFocus=null,mapReviewRequest=0;
let mangkhutReviewRequest=null;
const caseLesson=createCaseLesson($('#earth-view'),{onSeek(progress){
 const guide=narrationGuide.session.snapshot();
 if(guide.active&&guide.step?.cue.casePrimer)return narrationGuide.seek(guide.index,progress,{play:guide.wantedPlaying});
}});
const config={
 overview:{name:'全球总览',icon:'◎',color:'#85d8eb',title:'一个地球，多种过程',description:'从太空俯瞰地表，再沿着一个位置走进过程内部。选择图层或地球上的标记开始探索。',place:'东亚与西太平洋',coordinates:'初始观察角度 · 可拖动旋转',scale:'多过程合成演示 · 各自独立时间',caption:'火山、震波、云系与设施，共享同一个地理空间。选择一个过程，两侧面板随之联动。'},
 orbital:{name:'地月潮汐',icon:'☾',color:'#8ddbec',title:'地月与潮汐',description:'在地球旁观察月球轨道，对照月相、日月位置与相对潮汐幅度。',place:'地球—月球系统',coordinates:'圆轨道教学几何',scale:'天体大小、距离与潮汐形变分别缩放',caption:'轨道中的月球与潮汐方向示意随同一模型变化。月相读数表示从地球所见的受光比例。'},
 volcano:{name:'火山',icon:'△',color:'#ff9a64',title:'火山活动',description:'沿地表喷发点观察喷发柱，打开局部放大窗，追踪岩浆积聚、上升与释放。',caption:'地球上展示喷发位置与烟柱；地下岩浆通道在局部放大窗中查看。'},
 quake:{name:'地震',icon:'⌁',color:'#b9a8ff',title:'地震传播',description:'从同一震源出发，观察两道波前怎样先后抵达地表、沿震中向外扩展。',caption:'青色为 P 波，紫色为 S 波。波环半径放大 8 倍便于观看；读数仍为模型中的公里数。'},
 typhoon:{name:'台风',icon:'◉',color:'#d8edff',title:'台风风场',description:'在西北太平洋观察旋转云带、风眼与预设路径，对照测点风速随距离的变化。',caption:'云团随风场旋转、移动。青圈是最大风半径，金点是固定测点；风场、路径和距离统一放大 8 倍。'},
 river:{name:'河流污染',icon:'≈',color:'#56e5d0',title:'河流污染迁移',description:'以地球上的区域为入口，沿假想河段观察污染物向下游输运、弥散与经过监测点。',caption:'青色路径用于区域导览，河段已放大。打开局部窗查看 0–2000 m 河段与浓度变化。'}
};
const visualKeys={overview:[['#ffae6b','喷发与灰柱'],['#63e4ed','P 波'],['#bca7ff','S 波'],['#dce7ec','旋转云系']],orbital:[['#dce7ec','月球与轨道'],['#83e7e7','潮汐方向示意']],volcano:[['#ffae6b','岩浆喷出'],['#c2c3c1','体积灰柱'],['#8294a6','飘移火山灰']],quake:[['#63e4ed','P 波 · 6 km/s'],['#bca7ff','S 波 · 3.5 km/s']],typhoon:[['#dce7ec','云团与风迹'],['#63e4ed','最大风半径'],['#ffd18b','固定测点']],river:[['#56e5d0','假想河段'],['#ffd36e','当前浓度较高处']]};
const stages={orbital:[[0,'新月'],[.25,'上弦'],[.5,'满月'],[.75,'下弦']],volcano:[[.12,'积聚'],[.4,'上升'],[.7,'喷发'],[.96,'减弱']],quake:[[0,'震源启动'],[.09,'P 波先到'],[.3,'双波扩展'],[.85,'远场传播']],typhoon:[[.08,'风场接近'],[.5,'测点附近'],[.88,'逐渐远离']],river:[[.05,'进入河段'],[.45,'经过测点'],[.95,'向下游迁移']]};
const ids=Object.keys(config),defaults={orbital:.21,volcano:.72,quake:.48,typhoon:.5,river:.46};
const state={id:'overview',progress:.35,params:{},running:!matchMedia('(prefers-reduced-motion: reduce)').matches,speed:1,clock:0};
state.mode='principle';
let archive=null,archivePromise=null,archiveIndex=0,archiveAccumulator=0,archiveView='global';
let modeRequest=0,imageryRequest=0,displayedImageryDate=null,requestedImageryDate=null,imageryStatus='';
let savedTyphoon=null;
let syncBundle=null,syncPromise=null,syncIndex=30,syncSnapshot=null,syncEnabled=false,syncImageRequest=0,syncRenderedFrame=null;
let syncPresentation='fusion',syncRelief=true,syncAdvancePending=false,syncAdvanceToken=0;
let changeBundle=null,changePromise=null,changeEnabled=false,changeImageRequest=0,changeStatus='off',changeRenderedFrame=null;
let syncCloudReady=Promise.resolve(),dynamicReady=Promise.resolve();
const syncActive=()=>archiveActive()&&syncEnabled;
let baselineIndex=null,comparison=null,comparisonReport=null;
const guide={active:false,segment:0,atStop:false};
const guideSegments=[
 {from:'2018-09-12T06:00:00Z',to:'2018-09-14T06:00:00Z',question:'01 / 抵近吕宋：位置和中心强度怎样变化？',next:'靠近香港'},
 {from:'2018-09-14T06:00:00Z',to:'2018-09-16T06:00:00Z',question:'02 / 中心减弱，为什么仍要关注香港？',next:'向内陆减弱'},
 {from:'2018-09-16T06:00:00Z',to:'2018-09-17T06:00:00Z',question:'03 / 向内陆移动后，中心强度怎样变化？',next:null}
];
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let legacyRotate=false;
const simulationScope=$('#scope-introduction').innerHTML;
const archiveActive=()=>state.mode==='archive';
const labActive=()=>state.mode==='dynamic'&&isDeviceEvent(getDynamicEvent(state.id.slice(8)));
const earthHomeReplay='tide-san-francisco';
const publicEdition=document.documentElement.hasAttribute('data-publication');
const sceneLinks=[...document.querySelectorAll('[data-scene-route]')];
function sceneKind(){
 if(archiveActive())return 'storm';
 if(state.mode==='dynamic')return getDynamicEvent(state.id.slice(8))?.kind;
 return {orbital:'tide',typhoon:'storm',volcano:'volcano',quake:'quake',river:'river'}[state.id];
}
const earthGuideSequence={label:'地球过程',routes:[
 'dynamic-'+earthHomeReplay,'typhoon-real','dynamic-storm','dynamic-quake',
 'dynamic-quake-hualien','dynamic-volcano','dynamic-wildfire-dixie','dynamic-river-big-piney',
]};
const labGuideSequence={label:'实验与设备',routes:publicEdition?['dynamic-battery-b0005']:['dynamic-battery-b0005','dynamic-engine-jlu-diesel']};
function guideSequence(route){
 return labGuideSequence.routes.includes(route)?labGuideSequence:earthGuideSequence;
}
function browseScenes(){
 narrationGuide?.stop();
 const heading=$(labActive()?'#lab-capabilities-title':'#capabilities-title');
 heading.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 heading.focus({preventScroll:true});
}
const tideActive=()=>state.mode==='dynamic'&&state.id==='dynamic-'+earthHomeReplay;
let observedPresentation=null,observedSeekVersion=0,narrationGuide=null,visibleTideFocus=null,narrationCameraManual=false,recordedScrub=null,narrationSpeedLocked=false;
let narrationStationManual=false;
let scenario=null,series=[],last=0,uiTime=0,noticeTimer,localWasRunning=false;
const format=(v)=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:Math.abs(v)<1?3:Math.abs(v)<10?2:1}).format(v);
const engine=createGlobeEngine($('#earth-canvas'),$('#geo-labels'),$('#earth-loading'),{onSelect:id=>route(id),onArchiveRecord:i=>selectArchiveRecord(i),onStorySelect:target=>observedPresentation?.focus(target),onTideArrival:()=>observedPresentation?.refresh(),onTideTeachingFrame:tideLesson.update});
const eventExplorer=createEventExplorer(engine,{isActive:()=>state.mode==='live',onPrinciple:id=>{route(id);state.running=!matchMedia('(prefers-reduced-motion: reduce)').matches;updateUi();}});
const dynamicPlayer=createDynamicPlayer(engine,{publicEdition,isActive:()=>state.mode==='dynamic',onRoute:kind=>route('dynamic-'+kind),onUpdate:()=>{syncTideSceneFocus();syncHungaRecapSelection();syncQuakeReviewSelection();syncRiverReviewSelection();syncMapRecapSelection();observedPresentation?.refresh();syncNarrationControls(narrationGuide?.session.snapshot());},getExportContext:()=>observedPresentation?.getExportContext()??null,onManualSeek:seekManualScene,onManualStation:takeNarrationStation,onWatch:()=>{if(restartRecordedGuide())return true;narrationGuide?.stop();return false;}});
engine.ready?.catch(()=>{state.running=false;$('#earth-loading').hidden=false;$('#earth-loading').textContent='地球资源加载失败，请刷新重试。';});
function renderStages(){
 let entries=stages[state.id]||[];
 if(state.id==='quake'){const d=compute('quake',0,state.params).scene;entries=[[0,'震源启动'],[(d.arrivals.p+d.arrivals.s)/120,'P 波先到'],[Math.min(.8,d.arrivals.s/60+.18),'双波扩展'],[.9,'远场传播']];}
 if(state.id==='volcano'){const onset=compute('volcano',0,state.params).scene.onset;entries=[[.12,'积聚'],[onset*.65,'上升'],[Math.min(.85,onset+.14),'喷发'],[.96,'减弱']];}
 if(state.id==='river'){const arrival=compute('river',0,state.params).scene.arrival/2400;entries=[[.05,'进入河段'],[Math.min(1,arrival),arrival<=1?'经过测点':'结束·未到测点'],[.95,'向下游迁移']];}
 $('#stage-steps').innerHTML=entries.map(([p,label])=>'<button type="button" data-progress="'+p+'">'+label+'</button>').join('');
}
function route(id,hash=true,{observe=true}={}){
 if(id===''||id==='home')return activateDynamic(earthHomeReplay,hash,observe);
 if(id==='lab')return route(labGuideSequence.routes[0],hash,{observe});
 if(publicEdition&&id==='dynamic-engine-jlu-diesel')return route('lab',true,{observe:false});
 if(id==='battery')return activateDynamic('battery-b0005',hash,observe);
 if(id.startsWith('dynamic-')&&getDynamicEvent(id.slice(8)))return activateDynamic(id.slice(8),hash,observe);
 if(state.mode==='dynamic')dynamicPlayer.leave();
 if(id==='events'){activateLiveEvents(hash);return;}
 if(state.mode==='live'){eventExplorer.leave();engine.setLiveMode(false);}
 if(id==='typhoon-real')return activateArchive(hash);
 syncEnabled=false;++syncImageRequest;++changeImageRequest;engine.setSyncChangeEnabled(false);engine.setSyncMode(false);$('#sync-change-status').hidden=true;document.body.dataset.replay='records';
 guide.active=false;guide.atStop=false;engine.setArchiveBaseline(null);$('#guide-toggle').hidden=true;$('#open-real-motion').hidden=true;$('#open-conclusion').hidden=true;$('#meaning-title').textContent='此刻看什么';
 ++modeRequest;++imageryRequest;if(state.mode==='loading')$('#earth-loading').hidden=true;if(archiveActive())$('#rotate').setAttribute('aria-pressed',String(legacyRotate));state.mode='principle';engine.setArchiveMode(false);displayedImageryDate=null;requestedImageryDate=null;imageryStatus='';
 document.body.dataset.mode='principle';$('.title-row h1').textContent='在同一个地球上，看见变化。';$('.title-row .eyebrow').textContent='ONE EARTH. MANY PROCESSES.';
 state.id=ids.includes(id)?id:'overview';const c=config[state.id];scenario=SCENARIOS.find(s=>s.id===state.id)||null;
 state.params=scenario?Object.fromEntries(scenario.params.map(p=>[p.key,p.value])):{};state.progress=defaults[state.id]??0;
 document.documentElement.style.setProperty('--active',c.color);
 $('#layers').innerHTML=ids.map(key=>`<button data-topic="${key}" type="button" aria-pressed="${key===state.id}" style="--layer:${config[key].color}"><span class="icon" aria-hidden="true">${config[key].icon}</span>${config[key].name}</button>`).join('');
 $('#section-index').textContent=String(ids.indexOf(state.id)).padStart(2,'0')+' / '+state.id.toUpperCase();$('#topic-title').textContent=c.title;$('#topic-description').textContent=c.description;
 const site=SITES.find(s=>s.id===state.id);$('#location-name').textContent=site?.description||c.place;
 $('#location-coordinates').textContent=site?`${Math.abs(site.lat).toFixed(2)}°${site.lat<0?'S':'N'} · ${Math.abs(site.lon).toFixed(2)}°${site.lon<0?'W':'E'} · 示意位置`:c.coordinates;
 $('#scale-note').textContent=site?.scaleNote||c.scale;$('#scene-caption').textContent=c.caption;
 $('#view-label').textContent=c.name;$('#view-mode').textContent=scenario?'教学情景 · 可交互':'多过程合成 · 独立时标';
 $('#visual-key').innerHTML=(visualKeys[state.id]||visualKeys.overview).map(([color,label])=>'<span><i style="background:'+color+'"></i>'+label+'</span>').join('');
 renderStages();
 $('#parameters').innerHTML=scenario?scenario.params.map(p=>`<div class="parameter"><label for="param-${p.key}">${p.label}<output id="value-${p.key}">${format(p.value)} ${p.unit}</output></label><input type="range" id="param-${p.key}" data-param="${p.key}" aria-label="${p.label}" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}"></div>`).join(''):'<div class="overview-steps"><span><b>01</b>选择一个过程图层</span><span><b>02</b>地球定位到示意区域</span><span><b>03</b>拖动时间，改变条件</span></div>';
 $('#reset-conditions').hidden=!scenario;$('#param-guide').textContent=scenario?'画面、读数和曲线使用同一模型状态。':'点击地球上的标记，也可以进入对应过程。';
 $('#open-local').hidden=!scenario;$('#readout-title').textContent=scenario?c.name+' · 同步读数':'三个地表过程 · 当前读数';$('#chart-title').textContent=scenario?c.name+' · 时间曲线':'对应过程 · 独立时间曲线';
 $('#chart-domain').textContent=scenario?`0–${format(scenario.duration)} ${scenario.unit}`:'';
 $('#time-label').textContent=!scenario?'合成演示进度':state.id==='volcano'?'演示时间':'模型时间';$('#time-start').textContent='0';$('#time-end').textContent=scenario?`${format(scenario.duration)} ${scenario.unit}`:'100% · 各过程独立时标';
 $('#limitation').textContent=scenario?.limitation||'概览只用于认识不同过程的空间关系。选择主题后，查看该主题自己的时间、参数和模型范围。';
 const sources=[...(scenario?.sources||[]),{label:'NASA · Blue Marble 全球表面影像',url:'https://svs.gsfc.nasa.gov/2915/'},{label:'NASA · Moon Kit 月面纹理',url:'https://svs.gsfc.nasa.gov/4720/'}];
 $('#source-links').innerHTML=sources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener">${s.label} ↗</a></li>`).join('');
 $('#timeline').max=1000;$('#timeline').step=1;$('#timeline').setAttribute('aria-label','过程时间');
 $('#conditions-title').textContent='改变条件';$('#reset-conditions').textContent='重置';
 $('#open-local strong').textContent='打开局部放大窗';$('#open-local small').textContent='地球上的位置 → 内部过程';
 $('#archive-imagery-note').hidden=true;$('#archive-view-tools').hidden=true;
 $('#scope-introduction').innerHTML=simulationScope;
 $('#header-data-kind').textContent='交互地球 · 情景演示';
 $('#footer-data-kind').textContent='地球影像：NASA · 过程：独立教学模型';
 $('#footer-data-scope').textContent='地理位置用于情景定位，非当前灾害或监测数据';
 $('#sources-panel summary').innerHTML='模型范围、空间尺度与资料来源 <span>＋</span>';$('#export').textContent='导出当前观察 ↓';
 $('.globe-coordinate span').textContent='经纬度 · 示意定位';
 syncModeControls();
 series=scenario?sampleSeries(state.id,state.params):[];engine.focus(state.id);if(hash)history.replaceState(null,'','#'+state.id);updateUi();render();
}
function timeChart(s,progress,value,title,duration,unit){
 let low=Math.min(...s.points.map(p=>p.y)),high=Math.max(...s.points.map(p=>p.y));if(high-low<.00001){const delta=Math.max(Math.abs(low)*.02,1);low-=delta;high+=delta;}const pad=(high-low)*.08;low=Math.max(0,low-pad);high+=pad;if(s.unit==='%')high=Math.min(100,high);
 const X=x=>x*160,Y=y=>44-(y-low)/(high-low)*35,points=s.points.map(p=>`${X(p.x).toFixed(2)},${Y(p.y).toFixed(2)}`).join(' '),x=X(progress),y=Y(value),axis=v=>Math.abs(v)>=10000?(v/1000).toFixed(1)+'k':format(v);
 return `<div class="chart" data-process="${title}" data-current="${value}"><div class="chart-label"><span>${title}</span><strong style="color:${s.color}">${format(value)} ${s.unit}</strong></div><svg viewBox="0 0 193 60" role="img" aria-label="${title}，当前${format(value)}${s.unit}，时间${format(progress*duration)}${unit}"><path d="M0 9H160 M0 44H160" stroke="#294253" stroke-width=".6"/><polyline points="${points}" stroke="${s.color}" fill="none" stroke-width="1.2" stroke-opacity=".35"/><path d="M0 44 L${s.points.filter(p=>p.x<=progress).map(p=>`${X(p.x).toFixed(2)},${Y(p.y).toFixed(2)}`).join(" L")} L${x},${y} L${x},44 Z" fill="${s.color}" fill-opacity=".07"/><polyline points="${s.points.filter(p=>p.x<progress).map(p=>`${X(p.x).toFixed(2)},${Y(p.y).toFixed(2)}`).concat(`${x},${y}`).join(" ")}" stroke="${s.color}" fill="none" stroke-width="1.65"/><path d="M${x} 7V46" stroke="#cee8ef" stroke-opacity=".6" stroke-dasharray="2 3"/><circle cx="${x}" cy="${y}" r="3" fill="${s.color}"/><text x="164" y="12" class="chart-axis">${axis(high)}</text><text x="164" y="46" class="chart-axis">${axis(low)}</text><text x="0" y="58" class="chart-axis">0</text><text x="160" y="58" text-anchor="end" class="chart-axis">${format(duration)} ${unit}</text></svg></div>`;
}
const overviewSeries=Object.fromEntries(['volcano','quake','typhoon'].map(id=>[id,sampleSeries(id)]));
function charts(data){
 if(!scenario){const states=getOverviewStates(state.progress);$('#charts').innerHTML=['volcano','quake','typhoon'].map(id=>{const entry=states[id],s=SCENARIOS.find(s=>s.id===id),i=id==='volcano'?2:0;return timeChart(overviewSeries[id][i],entry.progress,entry.data.metrics[i].value,config[id].name+' · '+entry.data.metrics[i].label,s.duration,s.unit);}).join('');return;}
 $('#charts').innerHTML=series.map((s,i)=>timeChart(s,state.progress,data.metrics[i].value,s.label,scenario.duration,scenario.unit)).join('');
}
function updateUi(){
 if(state.mode==='live'||state.mode==='dynamic')return;
 if(archiveActive()){updateArchiveUi();return;}
 if(state.mode==='loading')return;
 const data=scenario?compute(state.id,state.progress,state.params):null;
 engine.setReadoutData(data);
 if(state.id==='typhoon'&&data){const geo=cycloneGeo(data.scene.cx,data.scene.cy);$('#location-coordinates').textContent='风眼 '+geo.lat.toFixed(2)+'°N · '+geo.lon.toFixed(2)+'°E（放大示意）';} const overview=state.id==='overview'?getOverviewStates(state.progress):null;
 $('#readouts').innerHTML=data?data.metrics.map((m,i)=>'<div class="readout"><div class="readout-label">'+m.label+'</div><div class="readout-value" style="--metric:'+series[i].color+'">'+format(m.value)+'<small>'+m.unit+'</small></div></div>').join(''):['volcano','quake','typhoon'].map(id=>{const entry=overview[id],i=id==='volcano'?2:0,m=entry.data.metrics[i],s=SCENARIOS.find(s=>s.id===id);return '<button class="overview-readout enriched" data-topic="'+id+'"><span style="color:'+config[id].color+'">'+config[id].name+' · '+m.label+'</span><strong>'+format(m.value)+'<small>'+m.unit+'</small></strong><em>独立时间 '+format(entry.progress*s.duration)+' '+s.unit+'</em></button>';}).join('');
 if(scenario){const insight=getProcessInsight(state.id,state.progress,state.params);$('#current-insight').innerHTML=insightMarkup(insight);}else{$('#current-insight').innerHTML='<div class="panel-label">画面与曲线如何对应</div><div class="overview-steps"><span><i style="color:#ffae6b">●</i> 火山：岩浆喷出与灰柱发展</span><span><i style="color:#63e4ed">●</i> 地震：P 波 / S 波传播</span><span><i style="color:#ffd18b">●</i> 台风：旋转风场与固定测点</span></div><p class="insight-caption">右侧每条曲线使用该过程自己的时间。点击名称进入对应实验。</p>';}
 for(const b of $('#stage-steps').querySelectorAll('button'))b.setAttribute('aria-pressed',String(Math.abs(Number(b.dataset.progress)-state.progress)<.06));
 $('#explanation').textContent=data?.explanation||'先看地球上的相对位置，再选择一个过程，查看对应的参数和曲线。概览中的过程各自演进，不表示真实事件同时发生。';
 $('#time-value').textContent=scenario?`${format(state.progress*scenario.duration)} ${scenario.unit}`:`${Math.round(state.progress*100)}%`;
 $('#timeline').value=Math.round(state.progress*1000);$('#play').textContent=state.running?'Ⅱ':'▶';$('#play').setAttribute('aria-label',state.running?'暂停演示':'播放演示');charts(data);syncNarrationControls(narrationGuide?.session.snapshot());
}
function render(){engine.render(state.id,archiveActive()?null:scenario?compute(state.id,state.progress,state.params):null,state);}
function animate(t){const dt=last?Math.min((t-last)/1000,.1):0;last=t;
 if(document.body.dataset.caseLesson==='volcano'){
  const lesson=narrationGuide?.session.snapshot();
  if(lesson?.status==='playing'&&lesson.step?.cue.casePrimer)caseLesson.show(lesson.step.cue.route,lesson.progress);
  requestAnimationFrame(animate);
  return;
 }
 if(state.mode==='dynamic'){if(tideActive())advanceTideIntroduction();dynamicPlayer.advance(dt,state.speed);engine.render('overview',null,state);requestAnimationFrame(animate);return;}
 if(state.mode==='live'){eventExplorer.advance(dt,state.speed);engine.render('overview',null,state);requestAnimationFrame(animate);return;}
 if(archiveActive()){
  if(syncActive()){
   if(state.running&&imageryStatus!=='loading'&&!$('#comparison-dialog').open){
    archiveAccumulator+=dt*state.speed;
    if(archiveAccumulator>=.32&&!syncAdvancePending){archiveAccumulator=0;const lastTick=makeClockTicks(syncBundle).length-1;
     if(syncIndex>=lastTick){state.running=false;updateSynchronizedUi();}else advanceSynchronizedPlayback();
    }
   }
   render();requestAnimationFrame(animate);return;
  }
  if(state.running&&!$('#archive-evidence-dialog').open&&!$('#comparison-dialog').open&&(!guide.active||imageryStatus!=='loading')){
   archiveAccumulator+=dt*state.speed;
   if(archiveAccumulator>=1.1){
    archiveAccumulator-=1.1;
    const end=guide.active?findRecordIndex(archive.dataset,guideSegments[guide.segment].to):archive.dataset.records.length-1;
    if(archiveIndex<end)selectArchiveRecord(archiveIndex+1,false);
    if(archiveIndex>=end){state.running=false;if(guide.active)guide.atStop=true;updateArchiveUi();}
   }
  }
  render();requestAnimationFrame(animate);return;
 }
 if(state.mode==='loading'){render();requestAnimationFrame(animate);return;}
 if(state.running&&!$('#local-dialog').open){state.clock+=dt;state.progress+=dt/({overview:36,orbital:45,volcano:30,quake:28,typhoon:40,river:36}[state.id])*state.speed;if(state.progress>=1){if(state.id==='overview')state.progress=0;else{state.progress=1;state.running=false;}}}if(t-uiTime>150){updateUi();uiTime=t;}render();requestAnimationFrame(animate);
}
function resize(){const box=$(document.body.dataset.tideLesson?'#earth-canvas':'#earth-view').getBoundingClientRect();engine.resize(box.width,box.height);render();}
function showTideLesson(phase,progress=0,options){
 const changed=tideLesson.show(phase);
 engine.setTideTeaching(phase,progress,options);
 if(changed)resize();
}
function seekTideLesson(progress,commit){
 const guide=activeTideNarration();
 const phase=guide?.step?.cue.tideLesson;
 if(!phase)return;
 if(guide.wantedPlaying||guide.status==='buffering')narrationGuide.session.holdForExploration();
 showTideLesson(phase,progress,{instant:true});
 if(commit)void narrationGuide.seek(guide.index,progress);
}
async function seekTideRecap(time){
 if(!time||tideRecap.panel.hidden||!tideActive())return;
 if(await dynamicPlayer.seekTick(time) && !tideRecap.panel.hidden &&
    dynamicPlayer.getSnapshot()?.timeUtc===time)tideRecap.select(time);
}
function syncTideRecap(guide){
 if(!tideActive()||guide.status!=='ended'||!guide.step?.cue.tideRecap){tideRecap.hide();return;}
 const time=tideRecap.show(dynamicPlayer.getEvidenceSource());
 if(!time)return;
 setNarrationCameraManual(false);
 dynamicPlayer.setView('detail',{observation:true,instant:true});
 void seekTideRecap(time);
 tideRecap.panel.scrollIntoView({block:'start',behavior:'instant'});
}
function syncHungaRecapSelection(){
 if(hungaRecap.hidden)return;
 const evidence=dynamicPlayer.getState({includeTicks:false}).hungaMode?'terrain':'cloud';
 for(const button of hungaRecap.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.hungaEvidence===evidence));
}
function syncHungaRecap(guide){
 const show=state.mode==='dynamic'&&state.id==='dynamic-volcano'&&guide.status==='ended'&&Boolean(guide.step?.cue.hungaRecap);
 if(show===!hungaRecap.hidden)return;
 hungaRecap.hidden=!show;
 document.body.toggleAttribute('data-hunga-recap',show);
 if(show){
  syncHungaRecapSelection();
  hungaRecap.scrollIntoView({block:'start',behavior:'instant'});
 }
}
hungaRecap.addEventListener('click',event=>{
 const button=event.target.closest('[data-hunga-evidence]');
 if(!button||hungaRecap.hidden)return;
 setNarrationCameraManual(false);
 if(button.dataset.hungaEvidence==='terrain'){
  void dynamicPlayer.showHungaTerrain('change','crater',{angle:'oblique'});
 }else{
  dynamicPlayer.setView('detail',{instant:true});
  void dynamicPlayer.seekTick('2022-01-15T05:50:00Z');
 }
});
for(const sel of ['#layers','#readouts'])$(sel).addEventListener('click',e=>{const b=e.target.closest('[data-topic]');if(b){if(b.dataset.topic==='typhoon'&&archiveActive())leaveArchiveForPrinciple();else route(b.dataset.topic);}});
$('#parameters').addEventListener('input',e=>{if(state.mode!=='principle')return;const key=e.target.dataset.param;if(!key)return;state.params[key]=Number(e.target.value);const p=scenario.params.find(p=>p.key===key);$('#value-'+key).textContent=`${format(state.params[key])} ${p.unit}`;series=sampleSeries(state.id,state.params);renderStages();updateUi();render();});
$('#reset-conditions').addEventListener('click',()=>{if(syncActive()){requestSyncTime(30);return;}if(archiveActive()){selectArchiveRecord(findRecordIndex(archive.dataset,'2018-09-14T06:00:00Z'));return;}if(state.mode==='loading')return;const progress=state.progress;route(state.id);state.progress=progress;updateUi();});
$('#stage-steps').addEventListener('click',e=>{if(syncActive()){const b=e.target.closest('[data-sync-index]');if(b)requestSyncTime(Number(b.dataset.syncIndex));return;}if(archiveActive()){const record=e.target.closest('[data-archive-index]');if(record){pauseGuideForManualTime();selectArchiveRecord(record.dataset.archiveIndex);}return;}if(state.mode==='loading')return;const b=e.target.closest('[data-progress]');if(!b)return;pauseGuideForManualTime();state.progress=Number(b.dataset.progress);state.running=false;updateUi();render();});
const observationTimeline=$('#timeline');
const mobileGuideScreen=matchMedia('(max-width:700px)');
const mobileGuideRoutes=new Set(['dynamic-'+earthHomeReplay,'typhoon-real','dynamic-volcano']);
let guideTimelineHome=null;
function syncMobileGuideTimeline(guide){
 const timeline=observationTimeline.closest('.timeline'),stage=$('#observation-stage');
 const nearStage=timeline.nextElementSibling===stage;
 const move=mobileGuideScreen.matches&&guide?.active&&mobileGuideRoutes.has(guide.step?.cue?.route);
 if(move&&!nearStage){
  guideTimelineHome?.remove();
  guideTimelineHome=document.createComment('timeline position before mobile guide');
  timeline.before(guideTimelineHome);
  stage.before(timeline);
 }else if(!move&&guideTimelineHome){
  if(nearStage)guideTimelineHome.replaceWith(timeline);
  else guideTimelineHome.remove();
  guideTimelineHome=null;
 }
}
mobileGuideScreen.addEventListener('change',()=>syncMobileGuideTimeline(narrationGuide?.session.snapshot()));
let touchTimeline=null;
function previewTouchTime(event){
 const gesture=touchTimeline;
 if(!gesture||gesture.pointer!==event.pointerId||gesture.route!==state.id)return;
 const {left,width}=observationTimeline.getBoundingClientRect();
 const min=Number(observationTimeline.min),max=Number(observationTimeline.max);
 const fraction=Math.max(0,Math.min(1,(event.clientX-left-8)/Math.max(1,width-16)));
 const value=Math.round(min+(max-min)*fraction);
 if(!gesture.changed&&value===gesture.start)return;
 if(!gesture.changed){
  gesture.changed=true;
  if(recordedScrub)narrationGuide.session.pause();
  else if(state.mode==='dynamic')dynamicPlayer.pause();
  else {++syncAdvanceToken;syncAdvancePending=false;state.running=false;updateSynchronizedControls();}
 }
 observationTimeline.value=value;
}
observationTimeline.addEventListener('pointerdown',event=>{
 if(event.button!==0||!event.isPrimary)return;
 const narration=activeRecordedNarration();
 if(narration&&!mapRecap.visible){
  recordedScrub={pointer:event.pointerId,resume:narration.wantedPlaying&&!['error','ended'].includes(narration.status),matched:false};
 }
 if(event.pointerType==='touch'&&(state.mode==='dynamic'||syncActive())){
  // Commit the touch position even when the native slider swallows a short drag.
  event.preventDefault();
  observationTimeline.setPointerCapture(event.pointerId);
  touchTimeline={pointer:event.pointerId,route:state.id,start:Number(observationTimeline.value),changed:false};
  observationTimeline.dataset.touchScrubbing='true';
  previewTouchTime(event);
 }
});
observationTimeline.addEventListener('pointermove',previewTouchTime);
function finishRecordedScrub(event,cancelledTouch){
 if(recordedScrub?.pointer!==event.pointerId)return;
 const {resume,matched}=recordedScrub;recordedScrub=null;
 const narration=activeRecordedNarration();
 if(((event.type==='pointerup'&&matched)||cancelledTouch)&&!document.hidden&&resume&&narration&&narration.status!=='error'){
  narrationGuide.session.resume();
 }
}
for(const type of ['pointerup','pointercancel'])window.addEventListener(type,event=>{
 let cancelledTouch=false;
 if(touchTimeline?.pointer===event.pointerId){
  if(event.type==='pointerup')previewTouchTime(event);
  const {route,changed}=touchTimeline;
  const value=Number(observationTimeline.value);
  touchTimeline=null;
  delete observationTimeline.dataset.touchScrubbing;
  if(route===state.id&&changed){
   if(event.type==='pointerup')seekTimeline(value);
   else{
    observationTimeline.value=state.mode==='dynamic'?dynamicPlayer.getState({includeTicks:false}).index:syncIndex;
    cancelledTouch=true;
   }
  }
 }
 finishRecordedScrub(event,cancelledTouch);
});
observationTimeline.addEventListener('input',event=>{
 if(!touchTimeline)seekTimeline(Number(event.target.value));
});
function seekTimeline(index){
 if(state.mode==='dynamic'){dynamicPlayer.requestSeek(index);return;}
 if(syncActive()){requestSyncTime(index);return;}
 pauseGuideForManualTime();
 if(state.mode==='live'){eventExplorer.selectTick(index);return;}
 if(archiveActive()){selectArchiveRecord(index);return;}
 if(state.mode==='loading')return;
 state.progress=index/1000;state.running=false;updateUi();render();
}
$('#play').addEventListener('click',()=>{if(toggleActiveGuide())return;if(state.mode==='dynamic'){dynamicPlayer.toggle();return;}if(state.mode==='live'){eventExplorer.toggle();return;}if(syncActive()){toggleSyncPlayback();return;}if(archiveActive()){guide.active=false;guide.atStop=false;if(archiveIndex>=archive.dataset.records.length-1)selectArchiveRecord(0);state.running=!state.running;archiveAccumulator=0;updateArchiveUi();return;}if(state.mode==='loading')return;if(state.progress>=1)state.progress=0;state.running=!state.running;updateUi();});
$('#restart').addEventListener('click',()=>{if(restartRecordedGuide())return;if(narrationGuide?.session.snapshot().active){narrationGuide.session.go(0,{play:true});return;}if(state.mode==='dynamic'){dynamicPlayer.restart();return;}if(state.mode==='live'){eventExplorer.restart();return;}if(syncActive()){selectSyncTime(0);state.running=true;updateSynchronizedUi();return;}if(archiveActive()){selectArchiveRecord(0);state.running=true;updateArchiveUi();return;}if(state.mode==='loading')return;state.progress=0;state.running=true;updateUi();});$('#speed').addEventListener('change',e=>state.speed=Number(e.target.value));
$('#reset-view').addEventListener('click',()=>{
 if(state.mode==='dynamic'){dynamicPlayer.resetView();return;}
 engine.resetView();
 if(state.mode==='live'){$('#live-whole').setAttribute('aria-pressed','true');$('#live-detail').setAttribute('aria-pressed','false');}
 else if(archiveActive()){archiveView='global';syncArchiveViewButtons();}
});
$('#rotate').addEventListener('click',()=>{const on=$('#rotate').getAttribute('aria-pressed')!=='true';$('#rotate').setAttribute('aria-pressed',String(on));engine.setAutoRotate(on);});
$('#focus').addEventListener('click',()=>{const on=document.body.classList.toggle('focus-earth');$('#focus').setAttribute('aria-pressed',String(on));$('#focus').textContent=on?'退出放大 ↙':'放大观看 ⤢';resize();});
$('#next-topic').addEventListener('click',()=>route(ids[(ids.indexOf(state.id)+1)%ids.length]));
$('#about').addEventListener('click',()=>{$('#sources-panel').open=true;$('#sources-panel').scrollIntoView({behavior:'smooth',block:'start'});});
$('#open-local').addEventListener('click',()=>{if(archiveActive()){state.running=false;updateArchiveUi();$('#archive-evidence-dialog').showModal();return;}if(state.mode==='loading')return;localWasRunning=state.running;state.running=false;$('#local-title').textContent=config[state.id].title;$('#local-location').textContent=$('#location-name').textContent+' · 当前模型的局部放大；参数与时间同步到地球';const query=new URLSearchParams({embedded:'1',progress:String(state.progress),params:JSON.stringify(state.params)});$('#local-frame').src=`detail.html?${query}#${state.id}`;$('#local-dialog').showModal();updateUi();});
$('#close-local').addEventListener('click',()=>$('#local-dialog').close());$('#local-dialog').addEventListener('close',()=>{$('#local-frame').src='about:blank';updateUi();});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==$('#local-frame').contentWindow||e.data?.type!=='process-state'||!$('#local-dialog').open||e.data.id!==state.id)return;state.progress=Math.max(0,Math.min(1,Number(e.data.progress)||0));state.running=Boolean(e.data.running);state.params={...e.data.params};for(const p of scenario.params){$('#param-'+p.key).value=state.params[p.key];$('#value-'+p.key).textContent=`${format(state.params[p.key])} ${p.unit}`;}series=sampleSeries(state.id,state.params);renderStages();updateUi();});
$('#export').addEventListener('click',()=>{if(state.mode==='dynamic'){dynamicPlayer.exportCurrent();return;}if(state.mode==='live'){eventExplorer.exportCurrent();return;}if(syncActive()){exportSynchronized();return;}if(archiveActive()){exportArchive();return;}if(state.mode==='loading')return;const record={product:'观象 · 地球过程图谱',version:5,theme:state.id,kind:'教学情景，非实时观测',location:SITES.find(s=>s.id===state.id)||null,progress:state.progress,modelTime:scenario?{value:state.progress*scenario.duration,unit:scenario.unit}:null,parameters:state.params,result:scenario?compute(state.id,state.progress,state.params):null,scope:$('#scale-note').textContent};const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`earth-atlas-${state.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#notice').textContent='观察已导出，包含位置、模型参数与显示尺度。';$('#notice').classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').classList.remove('visible'),3500);});
$('#earth-canvas').addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();if(toggleActiveGuide())return;if(state.mode==='dynamic'){dynamicPlayer.toggle();return;}if(state.mode==='live'){eventExplorer.toggle();return;}if(state.mode==='loading')return;if(syncActive()){toggleSyncPlayback();return;}if(archiveActive()){guide.active=false;guide.atStop=false;}state.running=!state.running;updateUi();}});
$('.brand').addEventListener('click',event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 route('home');
});
$('.skip').addEventListener('click',event=>{
 event.preventDefault();
 $('#earth-view').scrollIntoView({block:'start'});
 $('#earth-canvas').focus({preventScroll:true});
});
window.addEventListener('hashchange',()=>{if(location.hash.slice(1)!==(archiveActive()?'typhoon-real':state.id))route(location.hash.slice(1),false);});document.addEventListener('visibilitychange',()=>last=0);
new ResizeObserver(resize).observe($('#earth-view'));
const tideFocusPanel=$('#tide-focus-evidence');
tideFocusPanel.addEventListener('click',event=>{
 const time=event.target.closest('[data-tide-focus-frame]')?.dataset.tideFocusFrame;
 if(!time||!tideActive())return;
 if(!tideRecap.panel.hidden){void seekTideRecap(time);return;}
 const guide=activeTideNarration();
 const position=guide&&tideNarrationPosition(guide.tour.steps,time);
 if(position)void narrationGuide.seek(position.chapter,position.progress,{play:false});
 else void dynamicPlayer.seekTick(time);
});
new ResizeObserver(()=>{
 const height=tideFocusPanel.offsetHeight;
 if(height)document.body.style.setProperty('--tide-evidence-height',height+'px');
}).observe(tideFocusPanel);
route(location.hash.slice(1)||'home');requestAnimationFrame(animate);

function syncModeControls(){
 if(!tideActive())syncTideSceneFocus();
 if(state.mode!=='dynamic'&&!syncActive())for(const id of ['earth-view','charts','readouts','current-insight'])delete $('#'+id).dataset.observedTime;
 const lab=labActive();
 document.body.dataset.domain=lab?'lab':'earth';
 document.title=lab?'观象 · 实验与设备':'观象 · 地球过程图谱';
 $('.brand-en').textContent=lab?'LAB / DEVICES':'EARTH / PROCESS ATLAS';
 $('#open-dynamic').setAttribute('aria-pressed',String(!lab));
 const selected=sceneKind();
 for(const button of sceneLinks)button.setAttribute('aria-pressed',String(button.dataset.sceneKind===selected));
 $('#open-lab').setAttribute('aria-pressed',String(lab));
 $('#capabilities-panel').hidden=lab;
 $('#lab-capabilities-panel').hidden=!lab;
 $('#start-narration').textContent=lab?'▶ 设备讲解':'▶ 场景讲解';
 $('#open-events').setAttribute('aria-pressed',String(state.mode==='live'));
 $('#sync-presentation-tools').hidden=!syncActive();$('#archive-detail').hidden=!syncActive();
 $('#archive-global').textContent=syncActive()?'完整地球':'全球路径';$('#archive-regional').textContent=syncActive()?'完整地球 · 山竹居中':'完整地球 · 区域居中';$('#archive-detail').textContent='云带特写 · 局部';
 const active=archiveActive(),loading=state.mode==='loading';
 $('#guide-toggle').hidden=!active;$('#open-real-motion').hidden=!active||syncEnabled;$('#open-conclusion').hidden=!active;
 $('#archive-switch').hidden=state.id!=='typhoon';
 $('#mode-principle').setAttribute('aria-pressed',String(!active&&!loading));
 $('#mode-archive').setAttribute('aria-pressed',String(active&&syncEnabled));$('#mode-records').setAttribute('aria-pressed',String(active&&!syncEnabled));$('#mode-records').disabled=loading;
 $('#mode-archive').disabled=loading;$('#open-archive').disabled=loading;
 $('#open-archive').setAttribute('aria-pressed',String(active));
 $('#mode-description').textContent=loading?'正在载入官方路径与卫星资料…':active?(syncEnabled?'同一时钟驱动云图、风、雨与海水位；各条资料保留实际观测时间。':'固定A，移动时间轴选择B；或开始分段解读，逐段看变化。'):'原理演示 · 参数可调。切换「真实山竹」可在当前地球查看官方资料。';
}
async function activateArchive(hash=true,replay='observations'){
 if(archiveActive()){setArchiveReplay(replay);return;}
 const before=state.id==='typhoon'&&state.mode==='principle'?{progress:state.progress,params:{...state.params},running:state.running}:null;
 route('typhoon',false);
 savedTyphoon=before??{progress:state.progress,params:{...state.params},running:state.running};
 const request=++modeRequest;state.running=false;state.mode='loading';syncModeControls();
 $('#earth-loading').hidden=false;$('#earth-loading').textContent='正在载入山竹的真实档案…';
 try{
  archivePromise??=loadTyphoonArchive().catch(error=>{archivePromise=null;throw error;});
  const loaded=await archivePromise;
  syncPromise??=fetch('data/mangkhut-synchronized.json').then(r=>{if(!r.ok)throw new Error('同步资料包未载入');return r.json();}).then(validateSyncBundle).catch(e=>{syncPromise=null;throw e;});
  const observations=await syncPromise;await engine.ready;
  if(request!==modeRequest)return;
  const first=!archive;archive=loaded;syncBundle=observations;
  if(first)archiveIndex=findRecordIndex(archive.dataset,'2018-09-16T06:00:00Z');
  baselineIndex??=findRecordIndex(archive.dataset,'2018-09-14T06:00:00Z');
  legacyRotate=$('#rotate').getAttribute('aria-pressed')==='true';$('#rotate').setAttribute('aria-pressed','false');
  state.mode='archive';state.id='typhoon';state.running=false;archiveAccumulator=0;
  displayedImageryDate=null;requestedImageryDate=null;
  engine.setArchiveEvent(archive.dataset.records);engine.setArchiveIndex(archiveIndex);engine.setArchiveMode(true);engine.setArchiveView(archiveView);setComparisonBaseline(baselineIndex);
  document.body.dataset.mode='archive';document.documentElement.style.setProperty('--active','#efc88b');
  $('#earth-loading').hidden=true;
  setArchiveReplay(replay);
  if(hash)history.replaceState(null,'','#typhoon-real');
  syncModeControls();
 }catch(error){
  if(request!==modeRequest)return;
  route('typhoon',hash);restoreTyphoonSnapshot();state.running=false;updateUi();
  $('#notice').textContent='真实档案暂未载入，已保留原理演示。'+error.message;
  $('#notice').classList.add('visible');
  clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').classList.remove('visible'),6000);
 }
}
function setupArchiveUi(){
 $('.title-row h1').textContent='山竹：中心减弱，影响为何仍然强烈？';$('.title-row .eyebrow').textContent='MANGKHUT / 2018 · EVENT EXPLAINER';
 $('#section-index').textContent='04 / EVENT ARCHIVE';$('#topic-title').textContent='山竹 · 真实事件';
 $('#topic-description').textContent='从太平洋到华南，沿真实路径理解云系、强度与当地影响。';
 $('#scale-note').textContent='历史事件 · JMA事后分析 · 实际地理坐标';
 $('#view-label').textContent='台风山竹 · 2018';$('#view-mode').textContent='真实资料 · 非实时监测';
 $('#conditions-title').textContent='选择真实卫星日期';$('#reset-conditions').hidden=false;$('#reset-conditions').textContent='回到9月14日';
 $('#parameters').innerHTML='<div class="archive-day-list">'+[...archive.frames.keys()].sort().map(day=>'<button type="button" data-archive-day="'+day+'" aria-pressed="false">'+day.slice(5).replace('-','.')+'</button>').join('')+'</div>';
 $('#param-guide').textContent='云图按UTC日期拼接；路径每6小时一条。不同时间精度分别标注，不补造观测。';
 $('#open-local').hidden=false;$('#open-local strong').textContent='查看真实影像与影响证据';$('#open-local small').textContent='NASA原图 · 香港风速与潮位 · 官方雷达回放';
 $('#stage-steps').innerHTML=ARCHIVE_STAGES.map(s=>'<button type="button" data-archive-index="'+findRecordIndex(archive.dataset,s.time)+'">'+s.label+'</button>').join('');
 $('#readout-title').textContent='前后对比 · A → B';$('#meaning-title').textContent='这段变化说明什么';$('#chart-title').textContent='中心强度 · 官方档案';$('#chart-domain').textContent='2018/09/06—17 UTC';
 $('#time-label').textContent='官方记录回放 · 北京时间';$('#time-start').textContent='9/6 20:00';$('#time-end').textContent='9/18 02:00 · UTC+8';
 $('#timeline').max=archive.dataset.records.length-1;$('#timeline').step=1;$('#timeline').setAttribute('aria-label','选择真实事件记录');
 $('#scene-caption').textContent='青环A是对比起点，金点B是所选六小时时刻的中心；真实云图是当天多次卫星过境的日合成，两者不代表同一瞬间。路径连线仅辅助读图。';
 $('#visual-key').innerHTML='<span><i style="background:#ffd192"></i>B · 所选中心</span><span><i style="background:#7ce1f0"></i>A · 对比起点</span><span><i style="background:#7ce1f0"></i>已发生路径</span><span><i style="background:#8c9eaf"></i>后续路径</span><span><i style="background:#d8a3ff"></i>香港参照</span>';
 $('#archive-imagery-note').hidden=false;$('#archive-view-tools').hidden=false;
 $('#scope-introduction').innerHTML='<h3>怎样读真实事件</h3><p>当前地球展示2018山竹档案。路径和中心强度为日本气象厅事后最佳路径分析，云图为NASA GIBS日合成观测。没有对应日期影像时使用历史地理底图。</p><p>其他五类过程及台风原理演示仍是独立教学情景；它们没有被当作同一时刻的真实灾害叠加。</p>';
 $('#limitation').textContent='JMA风速为10分钟平均，单位kt；7条缺失风速保持为空。香港站点峰值属于事件总结，不随中心时间轴变化。日合成影像按UTC日期，路径显示北京时间UTC+8。';
 $('#header-data-kind').textContent='交互地球 · 真实事件';$('#footer-data-kind').textContent='路径与强度：JMA事后分析 · 云图：NASA GIBS / VIIRS';
 $('#footer-data-scope').textContent='2018山竹历史档案 · 影像日合成，非小时实况';$('.globe-coordinate span').textContent='实际地理坐标 · 官方档案';
 $('#sources-panel summary').innerHTML='资料来源、时间口径与范围说明 <span>＋</span>';$('#export').textContent='导出真实记录与出处 ↓';
 syncArchiveViewButtons();
}
function selectArchiveRecord(next,pause=true){
 if(!archiveActive()||!archive)return;
 if(syncActive()){setArchiveReplay('records');}
 if(pause){state.running=false;archiveAccumulator=0;guide.active=false;guide.atStop=false;}
 archiveIndex=Math.max(0,Math.min(archive.dataset.records.length-1,Math.trunc(Number(next)||0)));
 state.progress=archiveIndex/(archive.dataset.records.length-1);
 engine.setArchiveIndex(archiveIndex);updateArchiveUi();updateArchiveImagery();
}
function updateArchiveUi(){
 if(!archiveActive()||!archive)return;
 if(syncActive()){updateSynchronizedUi();return;}
 const view=archiveRecordView(archive.dataset,archiveIndex,baselineIndex);
 // Stage buttons name UTC dates; their 06:00 records are jump targets, not chapter boundaries.
 const stage=ARCHIVE_STAGES.reduce((current,item,i)=>view.day>=item.time.slice(0,10)?i:current,0);
 const story=archiveRecordView(archive.dataset,findRecordIndex(archive.dataset,ARCHIVE_STAGES[stage].time));
 comparison=compareEventRecords(archive.dataset,baselineIndex,archiveIndex);comparisonReport=buildComparisonReport(archive.dataset,comparison);
 $('#view-label').textContent=comparisonReport.headline;
 $('#location-name').textContent='台风中心 · 官方分析位置';$('#location-coordinates').textContent=view.coordinates;
 $('#readouts').innerHTML=comparisonMarkup(comparison);$('#charts').innerHTML=view.chartsHtml;
 $('#current-insight').innerHTML=story.insightHtml.replace('真实事件 · 此刻怎样理解','真实事件 · 阶段背景');$('#explanation').textContent=comparisonReport.headline+'。'+(comparison.elapsedHours===0?'先移动时间轴，选择另一个B时刻。':'对照A/B读数理解变化；中心强度不能代替香港本地观测。');
 updateGuideControls();
 $('#source-links').innerHTML=view.sourceLinks.map(s=>'<li><a href="'+(s.url??s.href)+'" target="_blank" rel="noopener">'+(s.label??s.title)+' ↗</a></li>').join('');
 $('#time-value').textContent=view.timeShort+' · '+(archiveIndex+1)+'/'+archive.dataset.records.length;
 $('#timeline').value=archiveIndex;$('#play').textContent=state.running?'Ⅱ':'▶';$('#play').setAttribute('aria-label',state.running?'暂停真实记录':'播放真实记录');
 syncNarrationControls(narrationGuide?.session.snapshot());
 for(const button of $('#parameters').querySelectorAll('[data-archive-day]'))button.setAttribute('aria-pressed',String(button.dataset.archiveDay===view.day));
 for(const [i,button] of [...$('#stage-steps').querySelectorAll('[data-archive-index]')].entries())button.setAttribute('aria-pressed',String(i===stage));
}
async function updateArchiveImagery(){
 if(!archiveActive())return;
 const date=archive.dataset.records[archiveIndex].timeUtc.slice(0,10),frame=archive.frames.get(date);
 if(requestedImageryDate===date&&imageryStatus!=='failed')return;
 requestedImageryDate=date;displayedImageryDate=null;imageryStatus=frame?'loading':'unavailable';const request=++imageryRequest;
 $('#archive-image-date').textContent=date+' · UTC';
 $('#archive-image-type').textContent=frame?'NASA / VIIRS · 真实日合成':'历史地理底图';
 $('#archive-image-status').textContent=frame?'影像载入中；非瞬时云图':'该日期未收录云图，未补造观测';
 await engine.setArchiveImagery(null);
 if(request!==imageryRequest||!archiveActive())return;
 if(!frame){imageryStatus='unavailable';return;}
 const ok=await engine.setArchiveImagery(frame.url);
 if(request!==imageryRequest||!archiveActive())return;
 displayedImageryDate=ok?date:null;imageryStatus=ok?'loaded':'failed';
 $('#archive-image-type').textContent=ok?'NASA / VIIRS · 真实日合成':'历史地理底图';
 $('#archive-image-status').textContent=ok?'一天内多次过境拼接；与中心点非同一瞬间':'观测影像载入失败，可查看原始影像入口';
}
function setArchiveView(view){if(!archiveActive())return;archiveView=view;engine.setArchiveView(view);syncArchiveViewButtons();}
function syncArchiveViewButtons(){for(const v of ['global','regional','detail'])$('#archive-'+v).setAttribute('aria-pressed',String(v===archiveView));}
function leaveArchiveForPrinciple(){
 if(state.mode==='principle')return;
 route('typhoon');restoreTyphoonSnapshot();
}
function restoreTyphoonSnapshot(){
 if(savedTyphoon){state.progress=savedTyphoon.progress;state.params={...savedTyphoon.params};state.running=savedTyphoon.running;
  for(const p of scenario.params){$('#param-'+p.key).value=state.params[p.key];$('#value-'+p.key).textContent=format(state.params[p.key])+' '+p.unit;}
  series=sampleSeries('typhoon',state.params);renderStages();updateUi();render();
 }
}
function exportArchive(){
 const view=archiveRecordView(archive.dataset,archiveIndex),frame=archive.frames.get(view.day)??null;
 const record=buildArchiveExport(archive.dataset,view,frame,displayedImageryDate);
 record.imageryLoadState=imageryStatus;record.comparison=comparison;record.comparisonReport=buildComparisonReport(archive.dataset,comparison);
 const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'})),a=document.createElement('a');
 a.href=url;a.download='mangkhut-'+view.record.timeUtc.replaceAll(':','-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('#notice').textContent='已导出真实记录、时间口径、影像状态和出处。';$('#notice').classList.add('visible');
 clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').classList.remove('visible'),3500);
}
$('#mode-archive').addEventListener('click',()=>{if(!syncActive())activateArchive();});
$('#mode-records').addEventListener('click',()=>{narrationGuide?.stop();activateArchive(true,'records');});
$('#mode-principle').addEventListener('click',()=>{narrationGuide?.stop();leaveArchiveForPrinciple();});
$('#archive-global').addEventListener('click',()=>setArchiveView('global'));
$('#archive-regional').addEventListener('click',()=>setArchiveView('regional'));
$('#parameters').addEventListener('click',event=>{const b=event.target.closest('[data-sync-index]');if(b&&syncActive()){requestSyncTime(Number(b.dataset.syncIndex));return;}const button=event.target.closest('[data-archive-day]');if(button&&archiveActive())selectArchiveRecord(findRecordIndex(archive.dataset,button.dataset.archiveDay+'T06:00:00Z'));});
$('#close-archive-evidence').addEventListener('click',()=>$('#archive-evidence-dialog').close());



function shortRecordTime(record){return formatTime(record.timeUtc).replace(/^\d+年/,'').replace('（北京时间 UTC+8）','');}
function setComparisonBaseline(index){
 baselineIndex=index;
 engine.setArchiveBaseline(index,'A · '+shortRecordTime(archive.dataset.records[index]));
}
function updateGuideControls(){
 if(syncActive()){updateSynchronizedControls();return;}
 const button=$('#guide-toggle');
 if(!archiveActive()){button.hidden=true;return;}
 button.hidden=false;button.disabled=false;
 if(!guide.active){button.textContent='▶ 开始事件解读';$('#mode-description').textContent='固定A，移动时间轴选择B；或开始分段解读，逐段看变化。';return;}
 const segment=guideSegments[guide.segment];
 $('#mode-description').textContent=segment.question+(guide.atStop?' · 已停在关键时刻，查看右侧对比。':' · 逐条回放官方记录');
 button.textContent=guide.atStop?(segment.next?'继续：'+segment.next+' →':'↺ 重新解读'):state.running?'Ⅱ 暂停解读':'▶ 继续解读';
}
function startGuideSegment(index){
 guide.active=true;guide.atStop=false;guide.segment=index;archiveAccumulator=0;
 const segment=guideSegments[index];
 setComparisonBaseline(findRecordIndex(archive.dataset,segment.from));
 selectArchiveRecord(baselineIndex,false);state.running=true;updateArchiveUi();
}
$('#guide-toggle').addEventListener('click',()=>{
 if(!archiveActive())return;
 if(syncActive()){if(!toggleActiveGuide())toggleSyncPlayback();return;}
 if(!guide.active){startGuideSegment(0);return;}
 if(guide.atStop){startGuideSegment((guide.segment+1)%guideSegments.length);return;}
 state.running=!state.running;archiveAccumulator=0;updateArchiveUi();
});
$('#readouts').addEventListener('click',event=>{
 const button=event.target.closest('[data-compare-action]');if(!button||!archiveActive())return;
 guide.active=false;guide.atStop=false;
 if(button.dataset.compareAction==='pin'){setComparisonBaseline(archiveIndex);selectArchiveRecord(archiveIndex);}
 if(button.dataset.compareAction==='preset'){setComparisonBaseline(findRecordIndex(archive.dataset,'2018-09-14T06:00:00Z'));selectArchiveRecord(findRecordIndex(archive.dataset,'2018-09-16T06:00:00Z'));}
});
$('#open-conclusion').addEventListener('click',()=>{
 if(!archiveActive())return;
 state.running=false;updateArchiveUi();
 const report=comparisonReport;
 $('#comparison-title').textContent=report.headline;
 $('#comparison-report').innerHTML='<ul>'+report.statements.slice(0,4).map(t=>'<li>'+escapeHtml(t)+'</li>').join('')+'</ul><details><summary>查看计算方法与资料边界</summary><ul>'+report.statements.slice(4).map(t=>'<li>'+escapeHtml(t)+'</li>').join('')+'</ul><ul class="report-limits">'+report.limitations.map(t=>'<li>'+escapeHtml(t)+'</li>').join('')+'</ul></details><h3>核对官方来源</h3><ul>'+report.sources.map(s=>'<li><a target="_blank" rel="noopener" href="'+escapeHtml(s.url)+'">'+escapeHtml(s.label)+' ↗</a></li>').join('')+'</ul><p class="report-method">复制或下载会附带完整A/B时刻、原始行号、档案修订日期、参照坐标和计算方法，便于再次核对。</p>';
 if(syncActive())$('#comparison-report .report-method').textContent='复制将保留共同回放时间、各项实际观测时刻、采样口径和来源；完整原始字段可用页面底部JSON导出。';
 $('#copy-result').textContent='';$('#comparison-dialog').showModal();
});
$('#close-comparison').addEventListener('click',()=>$('#comparison-dialog').close());
$('#copy-comparison').addEventListener('click',async()=>{
 if(!comparisonReport)return;
 try{await navigator.clipboard.writeText(comparisonReport.text);$('#copy-result').textContent='已复制结论与出处。';}
 catch{$('#copy-result').textContent='当前浏览器未允许复制，请用右侧按钮下载结论。';}
});
$('#download-comparison').addEventListener('click',()=>{
 if(!comparisonReport)return;
 const url=URL.createObjectURL(new Blob(['\ufeff'+comparisonReport.text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');
 link.href=url;link.download=syncActive()?'mangkhut-synchronized-'+syncSnapshot.timeUtc.replaceAll(':','-')+'.txt':'mangkhut-comparison-'+comparison.b.timeUtc.slice(0,10)+'.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('#copy-result').textContent='已下载结论，包含数据口径与可核对出处。';
});

$('#open-real-motion').addEventListener('click',()=>{state.running=false;updateUi();});
setupRealMotion($('#open-real-motion'));

function setArchiveReplay(replay){
 if(!archive||!archiveActive())return;
 ++syncAdvanceToken;syncAdvancePending=false;
 state.running=false;archiveAccumulator=0;guide.active=false;guide.atStop=false;
 ++imageryRequest;++syncImageRequest;++changeImageRequest;engine.setSyncChangeEnabled(false);$('#sync-change-status').hidden=true;requestedImageryDate=null;displayedImageryDate=null;syncRenderedFrame=null;
 syncEnabled=replay==='observations';document.body.dataset.replay=syncEnabled?'observations':'records';
 engine.setSyncMode(syncEnabled);
 if(syncEnabled){
  engine.setArchiveBaseline(null);engine.setArchiveImagery(null);engine.setSyncStations(syncBundle.series.filter(s=>Number.isFinite(s.station.lat)).map(s=>({id:s.id,label:s.station.label,lat:s.station.lat,lon:s.station.lon,color:s.id==='wind'?'#86ddda':'#e6bc80'})));
  setupSynchronizedUi();archiveView='regional';setArchiveView('regional');selectSyncTime(syncIndex);
 }else{
  archiveView='regional';setArchiveView('regional');setupArchiveUi();setComparisonBaseline(baselineIndex);$('#open-conclusion').textContent='整理这段对比 · 带出处的结论 ↗';selectArchiveRecord(archiveIndex);
 }
 syncModeControls();if(syncEnabled)updateSynchronizedControls();
}
function setupSynchronizedUi(){
 setupArchiveUi();engine.setSyncPresentation(syncPresentation);engine.setSyncRelief(syncRelief);
 $('.title-row h1').textContent='山竹靠近香港时，云、风、雨和潮怎样变化？';
 $('.title-row .eyebrow').textContent='MANGKHUT / 16 SEP 2018 · SYNCHRONIZED OBSERVATIONS';
 $('#topic-title').textContent='香港 · 影响的12小时';
 $('#topic-description').textContent='2018年9月16日 08:00—20:00。拖动同一时间轴，看卫星云系与不同地点的观测怎样变化。';
 $('#location-name').textContent='机场风 · 东区雨 · 鲗鱼涌海水位';
 $('#location-coordinates').textContent='不同观测地点，各有真实采样时间';
 $('#scale-note').textContent='官方历史观测 · 按观测时间对齐，非同时发布';
 $('#readout-title').textContent='截至时钟 · 最近有效观测';$('#chart-title').textContent='海水位与台风中心';$('#chart-domain').textContent='共同时间范围 · UTC+8';
 $('#conditions-title').textContent='统一观测时间';$('#reset-conditions').textContent='回到13:00';
 $('#parameters').innerHTML='<div class="sync-time-picks">'+[0,12,24,36,48,60,72].map(i=>'<button type="button" data-sync-index="'+i+'">'+localClock(makeClockTicks(syncBundle)[i])+'</button>').join('')+'</div><p class="sync-registration">云图：每10分钟扫描；机场风：半小时报文；东区雨：一小时范围；海水位：逐整点记录。</p>';
 $('#param-guide').textContent='08—10时机场风缺报；18:45结束的东区雨窗缺项；10:40云图缺档。缺测保留为空。';
 $('#time-label').textContent='统一时间轴 · 2018/09/16 · 香港时间 UTC+8';$('#time-start').textContent='08:00';$('#time-end').textContent='20:00';$('#timeline').max=makeClockTicks(syncBundle).length-1;$('#timeline').step=1;$('#timeline').setAttribute('aria-label','山竹同步观测时间');
 $('#stage-steps').innerHTML=[[0,'08:00 · 上午'],[24,'12:00 · 中午'],[36,'14:00 · 午后'],[72,'20:00 · 晚间']].map(([i,t])=>'<button type="button" data-sync-index="'+i+'">'+t+'</button>').join('');
 $('#view-mode').textContent='红外实测 · 同一历史时钟';
 updateCloudPresentationUi();
 $('#meaning-title').textContent='怎样对应这些变化';$('#open-conclusion').textContent='带走此刻观测 · 含时间与出处 ↗';$('#export').textContent='导出同步观测与出处 ↓';
 $('#scope-introduction').innerHTML='<h3>同一时钟，不同观测窗口</h3><p>云图是JMA葵花八号原始B13数据经标定、区域重投影后的红外亮温图。风来自香港机场METAR报文，雨来自香港天文台原始RSS中的东区小时范围，海水位来自HKO提供给UHSLC的研究质量整点记录。</p><p>各图的金色竖线是共同回放时钟，亮点对应实际观测时刻。两者不同会显示时间差；未在此刻采样不生成新数值。雨量按观测窗口结束对齐，发布时间另存于导出资料中。</p>';
 $('#limitation').textContent='云系融合按固定亮温映射透明度并柔化覆盖边缘，仅用于突出冷区，不是云分类、自然色或云高反演。暖云可能被弱化，冷地表也可能显现；原始亮温视图可核对完整有效像元。云图每次扫描跨越数分钟；高云视差未校正。机场风不代表全香港风，东区雨量是地区范围而非单站；鲗鱼涌海水位使用UHSLC站点零点，未转换为海图基准面，不是风暴潮增水或积水深度。';
 $('#footer-data-kind').textContent='云图 JMA/NOAA · 风 HKO/NOAA · 雨 HKO · 海水位 HKO/UHSLC';$('#footer-data-scope').textContent='2018/09/16 历史观测 · 保留实际时间、范围与缺测';
}
function selectSyncTime(next,pause=true){
 if(!syncActive()||!syncBundle)return;
 ++syncAdvanceToken;syncAdvancePending=false;
 if(pause){state.running=false;archiveAccumulator=0;}
 const count=makeClockTicks(syncBundle).length;syncIndex=Math.max(0,Math.min(count-1,Math.trunc(Number(next)||0)));
 syncSnapshot=synchronizedSnapshot(syncBundle,syncIndex);archiveIndex=Math.max(0,indexAtOrBefore(archive.dataset.records,syncSnapshot.timeUtc));
 engine.setArchiveIndex(archiveIndex);engine.setSyncReadings(syncBundle.series.filter(s=>s.id!=='rain').map(s=>({id:s.id,text:sampleValue(s,syncSnapshot.observations[s.id])+' '+s.unit+' · '+(syncSnapshot.observations[s.id].sample?localClock(syncSnapshot.observations[s.id].sample.timeUtc):'此刻缺测')})));
 updateSynchronizedUi();syncCloudReady=updateSynchronizedImagery();updateSynchronizedChanges(syncCloudReady);
}
function requestSyncTime(index){
 const tick=makeClockTicks(syncBundle)[index];
 if(!tick||seekRecordedNarration(tick))return;
 pauseGuideForManualTime();
 selectSyncTime(index);
}
function updateSynchronizedUi(){
 if(!syncActive()||!syncSnapshot)return;
 const snapshot=syncSnapshot,bundle=syncBundle;
 for(const id of ['charts','readouts','current-insight'])$('#'+id).dataset.observedTime=snapshot.timeUtc;
 $('#view-label').textContent=localClock(snapshot.timeUtc)+' · 香港观测联动';
 $('#view-mode').textContent='金点：JMA中心分析 '+localClock(archive.dataset.records[archiveIndex].timeUtc);

 $('#readouts').innerHTML=observationReadouts(bundle,snapshot);
 $('#current-insight').innerHTML='<div class="panel-label">风与雨 · 同一时钟</div>'+bundle.series.filter(s=>s.id!=='seaLevel').map(s=>observationChart(s,snapshot,bundle)).join('')+'<p class="sync-legend"><b>金色虚线</b>：回放时钟；亮点：实际记录。雨图竖向范围是东区测站的最小—最大累计量，不是单站曲线。</p>';
 const centerSeries={id:'center',label:'台风中心风速',kind:'scalar',unit:'kt',zeroBaseline:true,station:{label:'JMA最近分析位置'},measurementLabel:'10分钟平均 · 每6小时分析',maxAgeMinutes:360,source:{url:'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html'},samples:archive.dataset.records.map(r=>({timeUtc:r.timeUtc,value:r.windKt}))};
 $('#charts').innerHTML=observationChart(bundle.series.find(s=>s.id==='seaLevel'),snapshot,bundle)+observationChart(centerSeries,snapshot,bundle)+'<p class="sync-legend">海水位为整点1分钟平均，以UHSLC站点零点为基准。中心风速与机场风速位置、单位不同，分别读取。</p>';
 const missing=bundle.series.filter(s=>!snapshot.observations[s.id].sample).map(s=>s.label);
 $('#explanation').textContent=missing.length?'这一时刻，'+missing.join('、')+'缺少有效记录。其他观测仍按各自原始时刻显示，空白不表示风雨为零。':'云系与本地观测可以按时序对照；风、雨、海水位来自不同位置，不能只凭云的亮度推断当地影响。';
 comparisonReport=snapshotReport(bundle,snapshot);
 $('#source-links').innerHTML=comparisonReport.sources.map(s=>'<li><a href="'+escapeHtml(s.url)+'" target="_blank" rel="noopener">'+escapeHtml(s.label)+' ↗</a></li>').join('');
 $('#time-value').textContent=localClock(snapshot.timeUtc)+' UTC+8 · '+(syncIndex+1)+'/'+makeClockTicks(bundle).length;
 if(!observationTimeline.dataset.touchScrubbing)observationTimeline.value=syncIndex;
 for(const b of document.querySelectorAll('[data-sync-index]'))b.setAttribute('aria-pressed',String(Number(b.dataset.syncIndex)===syncIndex));
 updateSynchronizedControls();
 syncNarrationControls(narrationGuide?.session.snapshot());
}
function updateSynchronizedControls(){
 $('#play').textContent=state.running?'Ⅱ':'▶';$('#play').setAttribute('aria-label',state.running?'暂停同步观测':'播放同步观测');
 $('#guide-toggle').hidden=false;$('#guide-toggle').textContent=state.running?'Ⅱ 暂停同步回放':'▶ 播放同步观测';
 $('#open-real-motion').hidden=true;
 $('#mode-description').textContent='同一时钟驱动真实云图、风、雨与海水位；每次前进10分钟，各项保留实际采样时间。';
 $('#sync-prev').disabled=syncIndex<=0;$('#sync-next').disabled=syncIndex>=makeClockTicks(syncBundle).length-1;
}
function toggleSyncPlayback(){
 ++syncAdvanceToken;syncAdvancePending=false;
 if(syncIndex>=makeClockTicks(syncBundle).length-1)selectSyncTime(0);
 state.running=!state.running;archiveAccumulator=0;updateSynchronizedControls();
}
function synchronizedCloudComparison(frame){
 return observedCloudComparison(syncBundle.clouds.frames,frame,'mangkhut');
}
function preloadSynchronizedFrames(frames){
 return engine.preloadSyncFrames(frames,syncBundle.clouds.bbox,frames.map(synchronizedCloudComparison));
}
async function updateSynchronizedImagery(){
 const snapshot=syncSnapshot,frame=snapshot.cloud.frame,request=++syncImageRequest;syncRenderedFrame=null;
 const stage=$('#earth-view');
 delete stage.dataset.observedTime;
 stage.dataset.syncCloud=frame?'loading':'missing';
 imageryStatus=frame?'loading':'unavailable';$('#archive-image-type').textContent=frame?(syncPresentation==='fusion'?'葵花八号 · 真实红外融合':'葵花八号 / B13 · 原始亮温'):'本时刻云图缺档 · 历史地理底图';
 observedPresentation?.refresh();
 $('#archive-image-date').innerHTML='<strong>'+localClock(snapshot.timeUtc)+'</strong><small>2018.09.16 · UTC+8</small>';
 $('#archive-image-status').textContent=frame?'正在载入对应扫描…':'没有该名义时刻原始帧，不补造云图';
 const loaded=await engine.setSyncFrame(frame,syncBundle.clouds.bbox,synchronizedCloudComparison(frame));
 if(request!==syncImageRequest||!syncActive())return;
 if(frame&&loaded){syncRenderedFrame=frame.timeUtc;imageryStatus='loaded';stage.dataset.syncCloud='ready';stage.dataset.observedTime=snapshot.timeUtc;$('#archive-image-status').textContent='全盘扫描 '+localClock(frame.scanStartUtc)+'–'+localClock(frame.scanEndUtc)+' · 非瞬时曝光';
  const lookahead=globalThis.matchMedia?.('(pointer: coarse)').matches?1:3;
  preloadSynchronizedFrames(syncBundle.clouds.frames.slice(snapshot.cloud.index+1,snapshot.cloud.index+1+lookahead));
 }else if(frame){imageryStatus='failed';stage.dataset.syncCloud='failed';$('#archive-image-type').textContent='对应云图加载失败';$('#archive-image-status').textContent='已隐藏云图；观测曲线仍保留原始时间';}
 else if(loaded){stage.dataset.observedTime=snapshot.timeUtc;}
 observedPresentation?.refresh();
}
function exportSynchronized(){
 const snapshot=syncSnapshot;
 const output={schemaVersion:1,kind:'synchronized-historical-observations',eventId:'jma-1822',clockTimeUtc:snapshot.timeUtc,selectedCloud:snapshot.cloud.frame,renderedCloudTimeUtc:syncRenderedFrame,cloudLoadState:imageryStatus,cloudPresentation:{mode:syncPresentation,relief:syncRelief&&syncPresentation==='fusion',reliefMeaning:'Display-only shading from same-frame spatial gradients; not cloud height, observed shadow or optical depth.',method:'Fixed brightness-temperature visualization; no time interpolation or cloud classification; raw source frames retained.',coverage:syncBundle.clouds.bbox,lowTemperatureComparison:engine.getCloudComparison()},brightnessTemperatureChange:{enabled:changesActive(),status:changeStatus,renderedTimeUtc:changeRenderedFrame,selectedPair:changeBundle?selectCloudChange(changeBundle,snapshot.timeUtc):null,method:changeBundle?.processing??null,limitations:changeBundle?.limitations??null},observations:syncBundle.series.map(s=>({definition:{...s,samples:undefined},selection:snapshot.observations[s.id],latestSourceRecord:s.samples[snapshot.observations[s.id].index]??null})),lastJmaAnalysis:archive.dataset.records[archiveIndex],report:snapshotReport(syncBundle,snapshot)};
 const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='mangkhut-synchronized-'+snapshot.timeUtc.replaceAll(':','-')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('#notice').textContent='已导出共同时间、各项原始观测时刻、卫星显示状态与来源。';$('#notice').classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').classList.remove('visible'),4000);
}

function updateCloudPresentationUi(){
 const fusion=syncPresentation==='fusion';
 $('#cloud-relief').disabled=!fusion;$('#cloud-relief').setAttribute('aria-pressed',String(fusion&&syncRelief));
 $('#cloud-changes').disabled=!fusion;$('#cloud-changes').setAttribute('aria-pressed',String(fusion&&changeEnabled));
 for(const mode of ['fusion','raw'])$('#cloud-'+mode).setAttribute('aria-pressed',String(mode===syncPresentation));
 document.body.dataset.cloudPresentation=syncPresentation;
 $('#sync-cloud-mode-hint').textContent=fusion?(syncRelief?'同帧纹理光照 · 非实测云高':'真实红外 · 冷区突出显示'):'完整亮温 · 保留观测覆盖边界';
 $('#scene-caption').textContent=fusion?'浅色突出真实红外冷区；立体光照增强同帧纹理层次，不代表实测云高。透明不等于无云，海陆为历史底图。':'原始红外亮温：310 K为黑、180 K为白，矩形边界表示真实资料覆盖；未做云分类或透明度强调。';
 $('#visual-key').innerHTML='<span class="sync-cloud-key"><i></i>'+(fusion?'285 K 渐隐 → 240 K 冷区突出':'310 K 暖 → 180 K 冷')+'</span><span><i style="background:#86ddda"></i>机场风</span><span><i style="background:#e6bc80"></i>鲗鱼涌海水位</span><span>JMA / NOAA · 真实十分钟帧</span>';
 if(syncSnapshot?.cloud.frame&&imageryStatus==='loaded')$('#archive-image-type').textContent=fusion?'葵花八号 · 真实红外融合':'葵花八号 / B13 · 原始亮温';
}
for(const mode of ['fusion','raw'])$('#cloud-'+mode).addEventListener('click',()=>{if(!syncActive())return;++syncAdvanceToken;syncAdvancePending=false;syncPresentation=mode;engine.setSyncPresentation(mode);updateCloudPresentationUi();updateSynchronizedChanges();});
$('#sync-prev').addEventListener('click',()=>{if(syncActive())requestSyncTime(syncIndex-1);});
$('#sync-next').addEventListener('click',()=>{if(syncActive())requestSyncTime(syncIndex+1);});
async function advanceSynchronizedPlayback(){
 if(!syncActive()||!state.running||syncAdvancePending)return;
 const token=syncAdvanceToken,index=syncIndex,next=synchronizedSnapshot(syncBundle,index+1);
 syncAdvancePending=true;
 // Keep the visible frame, clock and every reading unchanged until the next real frame is ready.
 // Cached setFrame commits synchronously, so the next render observes one consistent time.
 try{
  await Promise.all([
   next.cloud.frame?preloadSynchronizedFrames([next.cloud.frame]):Promise.resolve(),
   changesActive()?loadCloudChanges().then(data=>engine.preloadSyncChange(selectCloudChange(data,next.timeUtc),syncBundle.clouds.bbox)).catch(()=>false):Promise.resolve()
  ]);
  if(token!==syncAdvanceToken||!syncActive()||!state.running||$('#comparison-dialog').open||syncIndex!==index)return;
  selectSyncTime(index+1,false);
 }finally{if(token===syncAdvanceToken)syncAdvancePending=false;}
}

$('#cloud-relief').addEventListener('click',()=>{if(!syncActive()||syncPresentation!=='fusion')return;syncRelief=!syncRelief;engine.setSyncRelief(syncRelief);updateCloudPresentationUi();});
$('#archive-detail').addEventListener('click',()=>{if(syncActive())setArchiveView('detail');});

function changesActive(){return syncActive()&&syncPresentation==='fusion'&&changeEnabled;}
async function loadCloudChanges(){
 if(changeBundle)return changeBundle;
 if(!changePromise)changePromise=fetch('data/mangkhut-cloud-changes.json').then(response=>{if(!response.ok)throw new Error('Change manifest unavailable');return response.json();}).then(data=>{changeBundle=validateCloudChangeBundle(data,syncBundle.clouds);return changeBundle;}).catch(error=>{changePromise=null;throw error;});
 return changePromise;
}
async function updateSynchronizedChanges(cloudReady=syncCloudReady){
 const request=++changeImageRequest,time=syncSnapshot?.timeUtc,status=$('#sync-change-status');
 changeRenderedFrame=null;
 engine.setSyncChangeEnabled(changesActive());status.hidden=!changesActive();
 observedPresentation?.refresh();
 if(!changesActive()){changeStatus='off';return;}
 engine.clearSyncChange();
 changeStatus='loading';status.textContent='正在准备同一位置的十分钟亮温变化…';
 const current=()=>request===changeImageRequest&&changesActive()&&syncSnapshot?.timeUtc===time;
 try{
  // Cached layers rebind within microtasks, before the next render. A slow cloud load leaves no stale overlay.
  if(!changeBundle){engine.clearSyncChange();await loadCloudChanges();}
  if(!current())return;
  const pair=selectCloudChange(changeBundle,time);
  if(!pair){engine.clearSyncChange();changeStatus='unavailable';status.textContent=syncSnapshot.cloud.frame?'此刻缺少前十分钟的原始帧，无法比较；保留当前真实云图。':'此刻云图缺档，无法比较；不跨过缺帧生成变化。';return;}
  await cloudReady;
  if(!current())return;
  const loaded=imageryStatus==='loaded'&&await engine.setSyncChangeFrame(pair,syncBundle.clouds.bbox);
  if(!current())return;
  if(!loaded||imageryStatus!=='loaded'){engine.clearSyncChange();changeStatus='failed';status.textContent='当前云图或变化层未加载成功，已隐藏变化；其他观测按原始时刻显示。';return;}
  changeStatus='loaded';changeRenderedFrame=pair.timeUtc;
  status.innerHTML='<strong>'+localClock(pair.fromTimeUtc)+' → '+localClock(pair.timeUtc)+'</strong> · 同一位置的亮温变化 <span class="sync-change-key"><i style="background:#4cdcee"></i>降低</span> <span class="sync-change-key"><i style="background:#f5b163"></i>升高</span><br><small>超过4 K逐渐显色；筛选任一帧低于265 K的位置。不是风向、风速或云高。</small>';
  const next=changeBundle.frames.find(frame=>utcMillis(frame.timeUtc)===utcMillis(time)+600000);
  if(next)engine.preloadSyncChange(next,syncBundle.clouds.bbox).catch(()=>false);
 }catch{
  if(!current())return;
  engine.clearSyncChange();changeStatus='failed';status.textContent='变化资料加载失败；真实云图与观测曲线继续保留。关闭后再开启可重试。';
 }
}
$('#cloud-changes').addEventListener('click',()=>{if(!syncActive()||syncPresentation!=='fusion')return;++syncAdvanceToken;syncAdvancePending=false;changeEnabled=!changeEnabled;updateCloudPresentationUi();updateSynchronizedChanges();});


function activateLiveEvents(hash=true){
 if(state.mode==='dynamic')dynamicPlayer.leave();
 if(state.mode==='live'){if(hash)history.replaceState(null,'','#events');return;}
 ++modeRequest;++imageryRequest;++syncImageRequest;++changeImageRequest;++syncAdvanceToken;
 syncAdvancePending=false;syncEnabled=false;state.running=false;guide.active=false;
 engine.setSyncChangeEnabled(false);engine.setSyncMode(false);engine.setArchiveMode(false);
 state.mode='live';state.id='events';scenario=null;series=[];
 engine.setLiveMode(true);$('#archive-imagery-note').hidden=true;$('#archive-view-tools').hidden=true;$('#sync-change-status').hidden=true;
 $('#rotate').setAttribute('aria-pressed','false');engine.setAutoRotate(false);
 syncModeControls();eventExplorer.enter();if(hash)history.replaceState(null,'','#events');
}
$('#open-events').addEventListener('click',()=>activateLiveEvents());
$('#browse-capabilities').addEventListener('click',browseScenes);
for(const button of sceneLinks)button.addEventListener('click',()=>{void route(button.dataset.sceneRoute);});
$('#capabilities-panel').addEventListener('click',event=>{
 const topic=event.target.closest('[data-capability-topic]'),category=event.target.closest('[data-capability-kind]'),archiveButton=event.target.closest('[data-capability-archive]');
 if(topic){route(topic.dataset.capabilityTopic);state.running=!matchMedia('(prefers-reduced-motion: reduce)').matches;updateUi();$('#earth-view').scrollIntoView({behavior:'smooth',block:'center'});}
 if(category){activateLiveEvents();eventExplorer.setCategory(category.dataset.capabilityKind);$('#earth-view').scrollIntoView({behavior:'smooth',block:'center'});}
 if(archiveButton){activateArchive();$('#earth-view').scrollIntoView({behavior:'smooth',block:'center'});}
});

function activateDynamic(slug=earthHomeReplay,hash=true,observe=true){
 if(state.mode==='dynamic')dynamicPlayer.leave();if(state.mode==='live')eventExplorer.leave();
 ++modeRequest;++imageryRequest;++syncImageRequest;++changeImageRequest;++syncAdvanceToken;
 syncAdvancePending=false;syncEnabled=false;state.running=false;guide.active=false;
 engine.setLiveMode(false);engine.setSyncChangeEnabled(false);engine.setSyncMode(false);engine.setArchiveMode(false);
 state.mode='dynamic';state.id='dynamic-'+slug;scenario=null;series=[];
 for(const id of ['archive-imagery-note','archive-view-tools','sync-change-status','archive-switch','sync-presentation-tools','live-toolbar','live-view-tools','guide-toggle','open-real-motion','open-conclusion'])$('#'+id).hidden=true;
 $('#rotate').setAttribute('aria-pressed','false');engine.setAutoRotate(false);syncModeControls();
 const watch=observe&&!tideActive()&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&
  !matchMedia('(pointer: coarse)').matches;
 dynamicReady=dynamicPlayer.enter(slug,{watch,openGlobal:observe&&tideActive()});
 if(hash)history.replaceState(null,'','#dynamic-'+slug);
 return dynamicReady;
}
$('#open-dynamic').addEventListener('click',()=>activateDynamic(earthHomeReplay));
$('#open-lab').addEventListener('click',()=>{if(!labActive())route('lab');});
document.querySelectorAll('[data-capability-dynamic]').forEach(button=>button.addEventListener('click',()=>{activateDynamic(button.dataset.capabilityDynamic);$('#earth-view').scrollIntoView({behavior:'smooth',block:'center'});}));


// The tour drives the existing controllers. It never owns a second earth or data clock.
let narrationCue=null,narrationTicks=[],narrationBeats=[],directedScene=null;
// The existing introduction says “接着，我们靠近验潮站” around 11.9 s, followed by the harbor cue.
const tideIntroductionApproach=.22;
const tideIntroductionArrival=.55;
const recordedTourKeys={
 'dynamic-volcano':'volcano','dynamic-quake':'quake','dynamic-storm':'storm','typhoon-real':'mangkhut',
};
function currentNarrationTour(route=archiveActive()?'typhoon-real':state.id){
 const event=route.startsWith('dynamic-')?getDynamicEvent(route.slice(8)):null;
 const key=event?.tour?event.id:recordedTourKeys[route];
 return key?{key,tour:withCasePrimer(route,event?.tour??tours[key])}:null;
}
function sceneBeats(guide,chapter=guide.index){
 const step=guide.tour.steps[chapter];
 return step?.cue?.casePrimer?[]:recordedSceneBeats(guide.key,step?.audioIndex??chapter);
}
function recordedRoute(){
 if(syncActive())return 'typhoon-real';
 return state.mode==='dynamic'&&guidedCases[state.id]?state.id:null;
}
function activeRecordedNarration(guide=narrationGuide?.session.snapshot()){
 const route=recordedRoute();
 return route&&guide?.active&&guide.step?.cue?.route===route?guide:null;
}

function activeTideNarration(state=narrationGuide?.session.snapshot()){
 return tideActive()&&state?.active&&state.key===getDynamicEvent(earthHomeReplay).id?state:null;
}
function toggleActiveGuide(){
 if(!narrationGuide?.session.snapshot().active)return false;
 narrationGuide.toggle();return true;
}
function pauseGuideForManualTime(){
 if(mapRecap.visible)return;
 if(narrationGuide?.session.snapshot().active)narrationGuide.session.holdForExploration();
}
function seekManualScene(tick){
 if(mapRecap.visible){++mapReviewRequest;mapRecap.status();return null;}
 const narrated=seekRecordedNarration(tick);
 if(narrated)return narrated;
 pauseGuideForManualTime();return null;
}
function restartRecordedGuide(){
 if(!activeRecordedNarration())return false;
 narrationGuide.start(true,{chapter:0});return true;
}
function takeNarrationStation(){
 if(!activeRecordedNarration())return;
 narrationStationManual=true;
 setNarrationCameraManual(true);
 if(dynamicPlayer.getEvidenceSource()?.kind==='river'){
  riverGuideView.setNote(null);
  engine.setRiverGuide(null,null);
 }
}
function setNarrationCameraManual(manual){
 if(manual===narrationCameraManual)return;
 narrationCameraManual=manual;
 engine.setNarrationCameraManual(manual);
 $('#narration-follow-camera').hidden=!manual;
 if(manual)document.body.dataset.narrationCamera='manual';
 else delete document.body.dataset.narrationCamera;
}
function followNarrationCamera({cue}){
 narrationStationManual=false;
 setNarrationCameraManual(false);
 if(!cue||cue.casePrimer)return;
 observedPresentation?.clearManualFocus();
 engine.setRecordedNarrationFocus(null);
 if(state.mode==='dynamic'){
  if(cue.tideLesson){dynamicPlayer.setView('global',{instant:true});return;}
  if(cue.terrain){
   void presentHungaLesson(cue,narrationGuide.session.snapshot().progress,{reframe:true});
   return;
  }
  if(cue.stationId)dynamicPlayer.selectStation(cue.stationId);
  if(tideActive()&&cue.view==='global'&&activeTideNarration()?.progress>=tideIntroductionApproach){
   dynamicPlayer.setView('detail',{observation:true,instant:matchMedia('(prefers-reduced-motion: reduce)').matches});
  }else dynamicPlayer.setView(cue.view||'global',{observation:Boolean(getDynamicEvent(state.id.slice(8))?.watch),instant:matchMedia('(prefers-reduced-motion: reduce)').matches});
 }else if(archiveActive())setArchiveView(cue.view||'global');
 else engine.resetView();
 syncRecordedSceneFocus(narrationGuide.session.snapshot());
 if(dynamicPlayer.getEvidenceSource()?.kind==='river')syncRiverGuide(narrationGuide.session.snapshot());
}
function advanceTideIntroduction(){
 if(narrationCameraManual)return;
 const guide=activeTideNarration();
 if(!guide?.step?.cue?.tideFlight||guide.progress<tideIntroductionApproach)return;
 if($('#dynamic-full').getAttribute('aria-pressed')==='true'){
  dynamicPlayer.setView('detail',{observation:true,scripted:true,instant:matchMedia('(prefers-reduced-motion: reduce)').matches});
 }
 engine.setTideFlightProgress((guide.progress-tideIntroductionApproach)/(tideIntroductionArrival-tideIntroductionApproach));
}
function syncNarrationControls(state){
 const guide=state?.active?state:null;
 const speed=$('#speed');
 if(!guide){
  if(narrationSpeedLocked){narrationSpeedLocked=false;speed.disabled=false;speed.removeAttribute('title');}
  return;
 }
 const running=guide.status==='playing'||(['loading','buffering'].includes(guide.status)&&guide.wantedPlaying);
 $('#play').textContent=running?'Ⅱ':'▶';
 $('#play').setAttribute('aria-label',running?'暂停讲解':guide.status==='ended'?'从头讲解':guide.status==='error'?'重试讲解':'继续讲解');
 if(syncActive())$('#guide-toggle').textContent=running?'Ⅱ 暂停讲解':'▶ 继续讲解';
 narrationSpeedLocked=true;speed.disabled=true;speed.title='讲解使用原速；可用时间轴快进或回退';
}
function syncTideSceneFocus(guide=narrationGuide?.session.snapshot()){
 const inHarbor=tideActive()&&$('#dynamic-close').getAttribute('aria-pressed')==='true';
 const focus=inHarbor?tideSceneFocus(dynamicPlayer.getEvidenceSource()?.moments,dynamicPlayer.getSnapshot()?.timeUtc):null;
 const panel=$('#tide-focus-evidence');
 const {observedTime,windowStart,windowEnd}=panel.dataset;
 const cue=guide?.active?guide.step?.cue:null;
 const inWindow=observedTime>=windowStart&&observedTime<=windowEnd;
 const showEvidence=Boolean(inHarbor&&inWindow&&(!cue||focus==='set'||cue.tideEvidence||cue.tideRecap));
 const revealed=showEvidence&&panel.hidden;
 panel.hidden=!showEvidence;
 if(revealed&&cue&&guide.status!=='ended'){
  requestAnimationFrame(()=>{
   if(panel.hidden)return;
   const stage=$('#observation-stage'),timeline=observationTimeline.closest('.timeline');
   (timeline.nextElementSibling===stage?timeline:stage).scrollIntoView({block:'start',behavior:'instant'});
  });
 }
 if(visibleTideFocus===focus)return;
 visibleTideFocus=focus;
 if(focus)document.body.dataset.tideFocus=focus;
 else delete document.body.dataset.tideFocus;
 engine.setTideNarrationFocus(focus);
}
const recordedTickValue=tick=>typeof tick==='number'?tick:utcMillis(tick);
function clearRecordedSceneFocus(){
 if(!directedScene)return;
 directedScene=null;
 observedPresentation?.setNarrationFocus(null);
 engine.setRecordedNarrationFocus(null);
}
function syncRecordedSceneFocus(narration){
 const guide=activeRecordedNarration(narration);
 const beats=guide?sceneBeats(guide):[];
 const route=recordedRoute();
 if(!beats.length||guide.status==='error'||(guide.status==='ended'&&(guide.step.cue.hungaRecap||guide.step.cue.mangkhutRecap||guide.step.cue.quakeReview||guide.step.cue.riverReview||mapRecapKind(guide.step.cue)))){clearRecordedSceneFocus();return;}
 if(directedScene&&directedScene.route!==route)clearRecordedSceneFocus();
 if(guide.status==='loading'||guide.status==='buffering')return;

 const archive=route==='typhoon-real';
 const snapshot=archive?syncSnapshot:dynamicPlayer.getSnapshot();
 const current=snapshot?.elapsedSeconds??snapshot?.timeUtc;
 if(current==null||!atNarrationTick(current))return;
 const currentValue=recordedTickValue(current);
 const beat=beats.findLast(candidate=>candidate.progress<=guide.progress+1e-9&&recordedTickValue(candidate.tick)<=currentValue);
 if(!beat){clearRecordedSceneFocus();return;}

 const data=archive?syncBundle:dynamicPlayer.getEvidenceSource();
 const kind=archive?'mangkhut':data?.kind;
 if(!narrationStationManual&&beat.target!=='origin'&&(kind==='quake'||kind==='river')&&
    dynamicPlayer.getState({includeTicks:false}).selectedStation!==beat.target){
  dynamicPlayer.selectStation(beat.target);
 }
 directedScene={
  ...beat, route, key:[guide.key,guide.index,beat.tick,beat.target,beat.label].join('/'),
  atAnchor:recordedTickValue(beat.tick)===currentValue,
 };
 observedPresentation?.setNarrationFocus(directedScene);
 if(narrationCameraManual&&!beat.cloudShot)return;
 const shot=beat.quakeShot??beat.cloudShot??(kind==='mangkhut'&&['wind','rain','seaLevel'].includes(beat.target)?'mangkhut-harbor':null);
 // Use the registered pin from this observation. Hong Kong cloud framing
 // uses the known Hong Kong station area while a real scan is visible.
 const anchor=observedPresentation?.getNarrationAnchor(beat.target)??
  (kind==='mangkhut'&&beat.target==='cloud'&&snapshot.cloud.frame
   ?data.series.find(series=>series.id==='wind')?.station
   :['volcano','storm'].includes(kind)?data.focus:null);
 if(anchor||kind==='river'||shot)engine.setRecordedNarrationFocus({
  kind,target:beat.target,key:beat.riverShot?beat.riverShot+'/'+beat.target:shot??directedScene.key,
  lat:anchor?.lat,lon:anchor?.lon,cloudShot:shot,riverShot:beat.riverShot,
 });
 else engine.setRecordedNarrationFocus(null);
}
function seekRecordedNarration(tick,{freeze=false}={}){
 const guide=activeRecordedNarration();
 if(!guide)return null;
 const route=recordedRoute();
 const position=tideActive()
  ?tideNarrationPosition(guide.tour.steps,tick)
  :recordedNarrationPosition(guide.tour.steps,route,tick,guide.index,chapter=>sceneBeats(guide,chapter));
 const play=!freeze&&!recordedScrub&&guide.wantedPlaying&&!['ended','error'].includes(guide.status);
 if(position){
  if(recordedScrub)recordedScrub.matched=true;
  return narrationGuide.seek(position.chapter,position.progress,{play});
 }
 const scene=currentNarrationTour();
 const match=scene&&scene.tour!==guide.tour&&recordedNarrationPosition(scene.tour.steps,route,tick,-1,chapter=>sceneBeats(scene,chapter));
 if(match){
  if(recordedScrub)recordedScrub.matched=true;
  return narrationGuide.session.start(scene.tour,scene.key,match.chapter,{play,progress:match.progress});
 }
 if(recordedScrub)recordedScrub.matched=false;
 const notice=$('#notice');notice.textContent='该时刻暂无对应讲解，画面和图表仍可查看。';
 notice.classList.add('visible');clearTimeout(noticeTimer);
 noticeTimer=setTimeout(()=>notice.classList.remove('visible'),3000);
 return null;
}
function narrationTickAt(cue,progress){
 if(!narrationTicks.length)return cue.elapsedSeconds??cue.timeUtc;
 const target=tideNarratedTime(cue,progress)??recordedNarratedTime(cue,progress,narrationBeats);
 if(target==null)return undefined;
 return narrationTicks.findLast(tick=>(typeof tick==='number'?tick:utcMillis(tick))<=target);
}
function presentHungaLesson(cue,progress,options={}){
 const beat=hungaLessonBeat(cue,progress);
 const {hungaMode,hungaSpot,hungaAngle}=dynamicPlayer.getState({includeTicks:false});
 if((narrationCameraManual&&hungaMode)||(!options.reframe&&hungaMode===beat.mode&&hungaSpot===beat.spot&&hungaAngle===beat.angle)){
  dynamicPlayer.setHungaLesson(beat);
  return true;
 }
 return dynamicPlayer.showHungaTerrain(beat.mode,beat.spot,{...options,angle:beat.angle,lesson:beat});
}
function stopNarrationPlayback(){state.running=false;guide.active=false;if(!narrationCameraManual)engine.setAutoRotate(false);if(state.mode==='dynamic')dynamicPlayer.pause();else updateUi();}
function syncObservationReady(){
 return syncActive()&&syncSnapshot&&$('#earth-view').dataset.observedTime===syncSnapshot.timeUtc;
}
function syncMangkhutLesson(guide){
 const cue=guide?.step?.cue;
 if(!syncActive()||!guide?.active||cue?.route!=='typhoon-real'||cue.casePrimer||guide.status==='error'){
  mangkhutReviewRequest?.abort();
  mangkhutLesson.hide();
  return;
 }
 const showRecap=guide.status==='ended'&&Boolean(cue.mangkhutRecap);
 if(!showRecap)mangkhutReviewRequest?.abort();
 if(!syncObservationReady())return;
 const target=directedScene?.route==='typhoon-real'?directedScene.target:null;
 mangkhutLesson.render(syncBundle,syncSnapshot,target==='cloud'?null:target,showRecap);
}
function syncQuakeReviewSelection(){
 if(!document.body.dataset.quakeRecap)return;
 const {selectedStation,timeUtc}=dynamicPlayer.getState({includeTicks:false});
 quakeGuideView.select(selectedStation,timeUtc);
}
async function seekQuakeReview({station,time}){
 if(!document.body.dataset.quakeRecap||dynamicPlayer.getEvidenceSource()?.kind!=='quake')return;
 setNarrationCameraManual(false);
 dynamicPlayer.selectStation(station.id);
 dynamicPlayer.setView('detail',{observation:true,instant:true});
 if(await dynamicPlayer.seekTick(time))quakeGuideView.locate();
}
function syncQuakeGuide(guide){
 const cue=guide.step?.cue;
 const data=state.mode==='dynamic'?dynamicPlayer.getEvidenceSource():null;
 const active=guide.active&&data?.kind==='quake'&&cue?.route===state.id&&!cue.casePrimer;
 const showRuler=Boolean(active&&directedScene?.target!=='origin');
 engine.setQuakeGuide(showRuler);
 document.body.toggleAttribute('data-quake-guide',showRuler);
 if(!active||guide.status!=='ended'||!cue.quakeReview){quakeGuideView.hide();return;}
 const reading=quakeGuideView.show(data,cue.quakeReview);
 if(reading)seekQuakeReview(reading);
}
function syncRiverReviewSelection(){
 if(!document.body.dataset.riverRecap)return;
 const {selectedStation,elapsedSeconds}=dynamicPlayer.getState({includeTicks:false});
 riverGuideView.select(selectedStation,elapsedSeconds);
}
async function seekRiverReview({section,bank,elapsed},riverShot='reach'){
 const data=dynamicPlayer.getEvidenceSource();
 if(!document.body.dataset.riverRecap||data?.kind!=='river')return;
 setNarrationCameraManual(false);
 dynamicPlayer.selectStation(section.id);
 if($('#dynamic-close').getAttribute('aria-pressed')!=='true')dynamicPlayer.setView('detail',{instant:true});
 if(!await dynamicPlayer.seekTick(elapsed)||!document.body.dataset.riverRecap)return;
 engine.setRecordedNarrationFocus({kind:'river',target:section.id,key:riverShot+'/'+section.id,riverShot});
 engine.setRiverGuide(riverShot,bank.bank);
 riverGuideView.setNote({
  tick:elapsed,riverShot,riverBank:bank.bank,
  label:section.label+' · '+(bank.bank==='left'?'左岸':'右岸')+'先测到持续信号',
 },data.signalRule);
 riverGuideView.locate();
}
function syncRiverGuide(guide){
 const data=state.mode==='dynamic'?dynamicPlayer.getEvidenceSource():null;
 const cue=guide.step?.cue;
 const active=guide.active&&data?.kind==='river'&&cue?.route===state.id&&!cue.casePrimer&&guide.status!=='error';
 if(active&&guide.status==='ended'&&cue.riverReview){
  const reading=riverGuideView.show(data);
  if(reading)void seekRiverReview(reading);
  return;
 }
 if(riverGuideView.hide())engine.setRecordedNarrationFocus(null);
 const beat=active&&directedScene?.route===state.id&&
  (!narrationStationManual||dynamicPlayer.getState({includeTicks:false}).selectedStation===directedScene.target)?directedScene:null;
 engine.setRiverGuide(beat?.riverShot??null,beat?.riverBank??null);
 riverGuideView.setNote(beat,data?.signalRule);
}
function syncMapRecapSelection(){
 if(!mapReviewPlan)return;
 const player=dynamicPlayer.getState({includeTicks:false});
 if(player.eventId!==mapReviewPlan.eventId){hideMapRecap();return;}
 const selected=player.displayReady&&mapReviewPlan.items.find(item=>item.time===player.timeUtc&&
  (!item.phase||(mapReviewChoice===item&&(!dynamicPlayer.getDixieContext()||item.mode===player.fireMode)&&
   (item.hour==null||item.hour===player.fireHour))));
 mapRecap.select(selected?.id);
 if(player.kind==='wildfire'&&player.displayReady)dynamicPlayer.setDixieGuide(selected?.phase??null);
 const focus=selected||null;
 if(focus===mapReviewFocus)return;
 mapReviewFocus=focus;
 observedPresentation?.setNarrationFocus(focus?{
  route:state.id,key:'recap/'+focus.id,atAnchor:true,target:focus.target,label:focus.label,
 }:null);
}
function hideMapRecap(){
 if(!mapRecap.hide())return;
 if(mapReviewPlan?.kind==='storm')engine.setRecordedNarrationFocus(null);
 if(mapReviewFocus)observedPresentation?.setNarrationFocus(null);
 ++mapReviewRequest;mapReviewPlan=null;mapReviewChoice=null;mapReviewFocus=null;
}
function syncMapRecap(guide){
 const cue=activeRecordedNarration(guide)?.step.cue;
 const kind=guide.status==='ended'?mapRecapKind(cue):null;
 if(!kind){
  hideMapRecap();
  if(guide.status!=='loading')dynamicPlayer.setDixieGuide(guide.status==='error'?null:cue?.dixieEvidence??null);
  return;
 }
 if(mapRecap.visible)return;
 const data=dynamicPlayer.getEvidenceSource();
 const plan=mapRecapPlan(kind,data,dynamicPlayer.getDixieContext());
 if(!plan)return;
 mapReviewPlan={...plan,eventId:data.id,kind};
 mapReviewChoice=plan.items.at(-1);
 mapRecap.show(plan);syncMapRecapSelection();mapRecap.locate();
}
async function seekMapRecap(item){
 if(!mapReviewPlan?.items.includes(item))return;
 const request=++mapReviewRequest,plan=mapReviewPlan;
 mapReviewChoice=item;
 observedPresentation?.clearManualFocus();
 mapRecap.status('正在定位对应的真实记录…');
 const ok=await dynamicPlayer.seekTick(item.time,{dixieMode:item.mode,dixieHour:item.hour});
 if(request!==mapReviewRequest||mapReviewPlan!==plan)return;
 if(!ok){
  mapRecap.status('这一帧未能显示。点击卡片重试。');
  return;
 }
 mapRecap.status();
 setNarrationCameraManual(false);
 dynamicPlayer.setView('detail',{observation:true,instant:true});
 if(item.shot)engine.setRecordedNarrationFocus({
  kind:'storm',target:item.target,key:'recap/'+item.id,cloudShot:item.shot,
 });
 mapRecap.locate();
}
async function seekMangkhutReview(time){
 if(!syncActive()||narrationGuide.session.snapshot().status!=='ended')return;
 mangkhutReviewRequest?.abort();
 mangkhutReviewRequest=new AbortController();
 if(await seekDemo(time,{signal:mangkhutReviewRequest.signal})){
  syncMangkhutLesson(narrationGuide.session.snapshot());
 }
}
function atNarrationTick(tick){
 if(state.mode==='dynamic'&&!dynamicPlayer.getState({includeTicks:false}).displayReady)return false;
 const snapshot=state.mode==='dynamic'?dynamicPlayer.getSnapshot():syncObservationReady()?syncSnapshot:null;
 const current=snapshot?.elapsedSeconds??snapshot?.timeUtc;
 return typeof tick==='string'&&typeof current==='string'?utcMillis(tick)===utcMillis(current):current===tick;
}
async function seekNarrationTick(tick,signal,options){
 if(signal.aborted)return false;
 if(!options&&atNarrationTick(tick))return true;
 if(state.mode==='dynamic'){
  const ok=await dynamicPlayer.seekTick(tick,options);return !signal.aborted&&ok;
 }
 if(syncActive()){
  const i=makeClockTicks(syncBundle).findIndex(t=>utcMillis(t)===utcMillis(tick));if(i<0)return false;
  const next=synchronizedSnapshot(syncBundle,i);
  if(next.cloud.frame)await preloadSynchronizedFrames([next.cloud.frame]);
  if(signal.aborted||!syncActive())return false;
  selectSyncTime(i);await syncCloudReady;
  return !signal.aborted&&atNarrationTick(tick);
 }
 return true;
}
async function prepareNarration(step,{signal,progress=0,seeking=false}){
 ++observedSeekVersion;
 dynamicPlayer.setHungaLesson(null);
 if(!step.cue?.tideLesson)showTideLesson(null);
 const hungaHandoff=step.cue?.terrain&&document.body.dataset.caseLesson==='volcano';
 if(!hungaHandoff)caseLesson.show(null);
 stopNarrationPlayback();narrationCue=step.cue;narrationTicks=[];
 const narration=narrationGuide.session.snapshot();
 narrationBeats=sceneBeats(narration);
 const cue=step.cue;if(!cue)return false;
 const current=archiveActive()?'typhoon-real':state.id;
 if(current!==cue.route){narrationStationManual=false;setNarrationCameraManual(false);await route(cue.route,true,{observe:false});}else if(cue.route==='typhoon-real'&&!syncActive())setArchiveReplay('observations');
 if(signal.aborted||(archiveActive()?'typhoon-real':state.id)!==cue.route)return false;
 if(state.mode==='dynamic'&&!dynamicPlayer.getState().ticks.length)await dynamicReady;
 if(!labActive())await engine.ready;
 if(signal.aborted)return false;
 syncMobileGuideTimeline(narration);
 stopNarrationPlayback();
 if(cue.casePrimer){
  if(cue.route==='typhoon-real'?!syncActive():!dynamicPlayer.getState().ticks.length)return false;
  if(cue.route==='dynamic-volcano'){
   if(dynamicPlayer.getState({includeTicks:false}).hungaMode)await dynamicPlayer.showHungaTerrain(null);
   if(signal.aborted)return false;
   void loadHungaTerrain().catch(()=>{});
  }
  caseLesson.show(cue.route,progress);
  if(cue.route==='dynamic-volcano')await caseLesson.whenReady();
  return !signal.aborted;
 }
 if(cue.route.startsWith('dynamic-')){
  const playerState=dynamicPlayer.getState();if(!playerState.ticks.length)return false;
  narrationTicks=playerState.ticks;
  if(cue.tideLesson){
   if(!document.body.dataset.tideLesson)dynamicPlayer.setView('global',{instant:true});
   showTideLesson(cue.tideLesson,progress);
   return !signal.aborted;
  }
  if(cue.terrain){
   if(!playerState.hungaMode)setNarrationCameraManual(false);
   const onReveal=hungaHandoff?()=>{
    caseLesson.show(null);
    resize();
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
     $('#earth-canvas').animate([{opacity:.25},{opacity:1}],{duration:360,easing:'ease-out'});
    }
   }:undefined;
   return await presentHungaLesson(cue,progress,{instant:seeking||hungaHandoff,signal,onReveal})&&!signal.aborted;
  }
  if(playerState.hungaMode){
   await dynamicPlayer.showHungaTerrain(null);
   setNarrationCameraManual(false);
  }
  if(tideActive()){
   const tick=narrationTickAt(cue,progress);
   if(!await seekNarrationTick(tick,signal))return false;
   if(narrationCameraManual)return !signal.aborted;
   const instant=cue.view==='global'||seeking||matchMedia('(prefers-reduced-motion: reduce)').matches;
   if(!instant&&$('#dynamic-close').getAttribute('aria-pressed')==='true'){
    engine.setTideFlightProgress(1);
   }else dynamicPlayer.setView(cue.view||'detail',{observation:true,instant});
   return await engine.whenDynamicViewReady()!==false&&!signal.aborted;
  }
  if(!narrationCameraManual)dynamicPlayer.setView(cue.view||'global',{observation:Boolean(getDynamicEvent(cue.route.slice(8))?.watch),instant:seeking});
  if(cue.stationId&&!narrationStationManual&&!dynamicPlayer.selectStation(cue.stationId))return false;
 }else if(cue.route==='typhoon-real'){
  if(!syncActive())return false;if(!narrationCameraManual)setArchiveView(cue.view||'global');narrationTicks=makeClockTicks(syncBundle);await syncCloudReady;
 }else{state.progress=cue.progress??.35;state.running=false;updateUi();render();}
 if(signal.aborted)return false;
 const start=narrationTickAt(cue,progress);
 const dixie=cue.dixieEvidence;
 const options=dixie?{dixieMode:dixie==='location'?'topo':dixie==='fuel'?'fuel':'terrain',dixieHour:dixie==='wind'?16:undefined}:undefined;
 if(start!=null&&!await seekNarrationTick(start,signal,options))return false;
 if(cue.route.startsWith('dynamic-')&&!narrationCameraManual&&await engine.whenDynamicViewReady()===false)return false;
 return !signal.aborted;
}
function updateNarration(step,progress,{signal}){
 if(signal.aborted||narrationCue!==step.cue)return false;
 const cue=step.cue;
 if(cue.casePrimer){caseLesson.show(cue.route,progress);return true;}
 if(cue.tideLesson){showTideLesson(cue.tideLesson,progress);return true;}
 if(cue.terrain){
  void presentHungaLesson(cue,progress,{signal});
  return true;
 }
 if((cue.elapsedSeconds??cue.timeUtc)!=null&&narrationTicks.length){
  const tick=narrationTickAt(cue,progress);
  if(tick==null)return false;
  if(cue.dixieEvidence){
   const player=dynamicPlayer.getState({includeTicks:false});
   if(player.changingFireLayer&&utcMillis(player.timeUtc)===utcMillis(tick))return true;
  }
  return atNarrationTick(tick)?true:seekNarrationTick(tick,signal);
 }
 if(Number.isFinite(cue.progress)&&state.mode==='principle'){
  const target=cue.progress+((cue.endProgress??cue.progress)-cue.progress)*progress;
  if(target!==state.progress){state.progress=target;updateUi();render();}
 }
 return true;
}
narrationGuide=setupNarrationGuide({
 getRoute:()=>archiveActive()?'typhoon-real':state.id,
 startCurrentByDefault:()=>Boolean(currentNarrationTour()),
 onPlaybackChange(guide){
  syncMobileGuideTimeline(guide);
  syncNarrationControls(guide);
  syncRecordedSceneFocus(guide);
  if(guide.status==='ended'||guide.status==='error'){
   dynamicPlayer.setHungaLesson(null);
   showTideLesson(null);
   caseLesson.show(null);
  }
  syncTideRecap(guide);
  syncTideSceneFocus(guide);
  syncHungaRecap(guide);
  syncMangkhutLesson(guide);
  syncQuakeGuide(guide);
  syncRiverGuide(guide);
  syncMapRecap(guide);
 },
 onStart:()=>{recordedScrub=null;narrationStationManual=false;setNarrationCameraManual(false);clearRecordedSceneFocus();observedPresentation?.clearManualFocus();},
 onFollowCamera:followNarrationCamera,
 onExplore(event){
  const target=event.target;
  if((event.type==='pointerdown'&&target.closest('#earth-canvas'))||
     (event.type==='wheel'&&target.closest('#earth-canvas'))||
     (event.type==='keydown'&&['+','=','-','_'].includes(event.key)&&target.closest('#earth-canvas'))||
     (event.type==='click'&&target.closest('#dynamic-view-tools,#archive-view-tools,#live-view-tools,#reset-view,#rotate,.harbor-zoom,#hunga-terrain-toggle,#hunga-terrain button'))){
   setNarrationCameraManual(true);
  }
 },
 isPlaybackControl:(target,event)=>Boolean(
  target.closest('#play,#timeline,#dynamic-prev,#dynamic-next,#sync-prev,#sync-next,[data-sync-index],#restart,#observed-keyframes,#story-narrate,#observation-watch')||
  (event.type==='keydown'&&event.code==='Space'&&target.closest('#earth-canvas'))
 ),
 getCurrentTour:currentNarrationTour,
 getCaseSequence(guide){
  const route=guide.key==='overview'?null:guide.step?.cue?.route;
  return {sequence:guideSequence(route),route};
 },
 getCase:route=>guidedCases[route],
 onChooseCase:openCaseGuide,
 onBrowse:browseScenes,
 prepare:prepareNarration,update:updateNarration,onStop:()=>{recordedScrub=null;narrationStationManual=false;setNarrationCameraManual(false);dynamicPlayer.setHungaLesson(null);showTideLesson(null);caseLesson.show(null);engine.releaseTideFlight();stopNarrationPlayback();}
});

caseLesson.button.addEventListener('click',()=>{
 const guide=narrationGuide.session.snapshot();
 if(!guide.step?.cue.casePrimer)return;
 narrationGuide.session.go(guide.index+1,{play:guide.wantedPlaying});
 $('#narration-pause').focus({preventScroll:true});
});
$('#observation-continue').addEventListener('click',()=>narrationGuide.start(true));
$('#tide-learn').addEventListener('click',()=>{if(tideActive())narrationGuide.start(true,{chapter:0});});
$('#hunga-learn').addEventListener('click',()=>{if(state.mode==='dynamic'&&state.id==='dynamic-volcano')narrationGuide.start(true);});
$('#mangkhut-learn').addEventListener('click',()=>{if(syncActive())void openCaseGuide('typhoon-real');});
$('#tide-watch-harbor').addEventListener('click',()=>{
 if(!tideActive())return;
 const chapter=currentNarrationTour()?.tour.steps.findIndex(step=>step.cue.tideFlight);
 if(chapter>=0)narrationGuide.start(true,{chapter});
});
tideLesson.harborButton.addEventListener('click',()=>{
 const steps=currentNarrationTour()?.tour.steps??[];
 const chapter=steps.findIndex(step=>step.cue.tideFlight);
 if(chapter<0)return;
 setNarrationCameraManual(false);narrationGuide.session.go(chapter,{play:true});
 $('#narration-pause').focus({preventScroll:true});
});

function demoContext(){
 const dynamic=state.mode==='dynamic'?dynamicPlayer.getState({includeTicks:false}):null;
 return {route:archiveActive()?'typhoon-real':state.id,timeUtc:dynamic?.timeUtc??(syncActive()?syncSnapshot?.timeUtc:null),elapsedSeconds:dynamic?.elapsedSeconds??null,stationId:dynamic?.selectedStation,loading:state.mode==='loading'||Boolean(dynamic?.loading)||(syncActive()&&imageryStatus==='loading'),displayReady:dynamic?.displayReady??Boolean(syncObservationReady()),displayFailed:dynamic?.displayFailed??(syncActive()&&imageryStatus==='failed')};
}
function pauseDemo(){
 const dynamic=state.mode==='dynamic'?dynamicPlayer.getState({includeTicks:false}):null;
 state.running=false;guide.active=false;engine.setAutoRotate(false);
 if(dynamic){const tick=dynamic.timeUtc??dynamic.elapsedSeconds;dynamicPlayer.cancelPending();if(dynamic.loading&&tick!=null)dynamicPlayer.seekTick(tick);}
 else updateUi();
}
async function seekDemo(timeUtc,{signal}){
 const version=observedSeekVersion,mode=modeRequest;
 if(signal.aborted)return false;
 if(state.mode==='dynamic'){
  const result=await dynamicPlayer.seekTick(timeUtc);return !signal.aborted&&result;
 }
 if(syncActive()){
  const i=makeClockTicks(syncBundle).findIndex(t=>utcMillis(t)===utcMillis(timeUtc));if(i<0)return false;
  const frame=synchronizedSnapshot(syncBundle,i).cloud.frame;if(!frame)return false;
  await preloadSynchronizedFrames([frame]);if(signal.aborted||version!==observedSeekVersion||mode!==modeRequest||!syncActive())return false;
  selectSyncTime(i);await syncCloudReady;
  return !signal.aborted&&imageryStatus==='loaded'&&utcMillis(syncRenderedFrame)===utcMillis(timeUtc);
 }
 return false;
}
async function prepareDemo(task,{signal}){
 narrationGuide.stop();pauseDemo();await route(task.route,true,{observe:false});await engine.ready;if(signal.aborted)return false;
 state.running=false;
 let ticks,data;
 if(state.mode==='dynamic'){
  dynamicPlayer.pause();dynamicPlayer.setView(task.view||'detail');
  if(task.stationId&&!dynamicPlayer.selectStation(task.stationId))return false;
  ticks=dynamicPlayer.getState().ticks;data=dynamicPlayer.getEvidenceSource();
 }else if(syncActive()){
  setArchiveView(task.view||'detail');ticks=makeClockTicks(syncBundle);data=syncBundle;
 }else return false;
 if(!await seekDemo(task.fromUtc,{signal}))return false;
 return {ticks,data};
}
const demoWorkbench=setupDemoWorkbench({prepare:prepareDemo,seek:seekDemo,pause:pauseDemo,context:demoContext,narrate:()=>{
 const steps=currentNarrationTour()?.tour.steps;
 narrationGuide.start(true,{chapter:steps?.[0]?.cue.casePrimer?2:1});
},sources:()=>{$('#sources-panel').open=true;$('#sources-panel').scrollIntoView({behavior:'smooth',block:'start'});}});


observedPresentation=setupObservedPresentation({
 onManualFocus(target){
  if(!activeRecordedNarration()||tideActive())return;
  if(target.endsWith('.BHZ')||/^t[123]$/.test(target))takeNarrationStation();
  else setNarrationCameraManual(true);
 },
 context(){return {
  ...demoContext(),data:state.mode==='dynamic'?dynamicPlayer.getEvidenceSource():syncActive()?syncBundle:null,
  hunga:state.mode==='dynamic'&&state.id==='dynamic-volcano'?dynamicPlayer.getState({includeTicks:false}):null,
  snapshot:state.mode==='dynamic'?dynamicPlayer.getSnapshot():null,
  sync:syncActive()?syncSnapshot:null,
  cloudComparison:engine.getCloudComparison?.()??null,
  riverView:engine.getRiverViewEvidence(),
  tideView:engine.getTideViewEvidence(),
  batteryView:engine.getBatteryViewEvidence(),
  dieselView:engine.getDieselViewEvidence(),
 };},
 setStory:story=>engine.setObservedStory(story),suspendCloudStory:()=>engine.suspendObservedCloudStory(),
 narration:()=>narrationGuide.session.snapshot(),
 async seek(time,context){
  if(mapRecap.visible){
   ++mapReviewRequest;mapRecap.status();
   return seekDemo(time,context);
  }
  const narrated=seekRecordedNarration(time,{freeze:context.freeze});
  if(narrated){
   if(!await narrated||context.signal.aborted)return false;
   if(context.station&&dynamicPlayer.getState({includeTicks:false}).selectedStation!==context.station){
    narrationStationManual=true;
    dynamicPlayer.selectStation(context.station);
   }
   return true;
  }
  pauseGuideForManualTime();demoWorkbench.session.pause();pauseDemo();
  if(context.freeze&&state.mode==='dynamic'&&$('#dynamic-full').getAttribute('aria-pressed')==='true'){
   dynamicPlayer.setView('detail',{observation:true,instant:true});
  }
  if(context.freeze){
   const kind=syncActive()?'mangkhut':dynamicPlayer.getEvidenceSource()?.kind;
   const shot={volcano:'volcano-late',storm:'storm-band',mangkhut:'mangkhut-band'}[kind];
   if(kind==='mangkhut'&&archiveView!=='detail')setArchiveView('detail');
   if(shot)engine.setRecordedNarrationFocus({kind,key:'keyframes/'+kind,target:'cloud',cloudShot:shot});
   if(kind==='river'&&context.station){
    engine.setRecordedNarrationFocus({kind,key:'keyframes/'+context.station,target:context.station,riverShot:'section'});
    engine.setRiverGuide('section',null);
   }
  }
  if(['river','tide','battery','engine'].includes(dynamicPlayer.getEvidenceSource()?.kind)&&$('#dynamic-full').getAttribute('aria-pressed')==='true')dynamicPlayer.setView('detail');
  return seekDemo(time,context);
 },
 selectStation(id,{fromKeyframe=false}={}){
  if(!fromKeyframe)takeNarrationStation();
  demoWorkbench.session.pause();
  if(dynamicPlayer.getEvidenceSource()?.kind!=='river')dynamicPlayer.cancelWatch();
  dynamicPlayer.selectStation(id);
 },
 narrate(){
  if(narrationGuide.session.snapshot().step?.cue?.route===demoContext().route&&toggleActiveGuide())return;
  const mode=state.id==='dynamic-volcano'?dynamicPlayer.getState({includeTicks:false}).hungaMode:null;
  const terrainChapter=mode?currentNarrationTour().tour.steps.findIndex(step=>step.cue.terrain===(mode==='pre'?'pre':'change')):-1;
  demoWorkbench.session.pause();dynamicPlayer.cancelWatch();narrationGuide.start(true,{chapter:Math.max(0,terrainChapter)});
 }
});
$('#earth-canvas').addEventListener('pointerdown',()=>dynamicPlayer.cancelWatch());
$('#earth-canvas').addEventListener('wheel',()=>dynamicPlayer.cancelWatch(),{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)dynamicPlayer.cancelWatch();});

function openCaseGuide(target){
 const selection=currentNarrationTour(target);
 if(!selection)return;
 demoWorkbench.session.pause();
 narrationGuide.start(true,{selection});
}
function guidedCaseButton(route,label){
 const button=document.createElement('button');
 button.type='button';
 button.className='case-guided-button';
 button.textContent=label;
 button.addEventListener('click',()=>void openCaseGuide(route));
 return button;
}
for(const button of document.querySelectorAll('[data-capability-dynamic],[data-capability-archive]')){
 if(publicEdition&&button.hasAttribute('data-local-only'))continue;
 const route=button.hasAttribute('data-capability-archive')?'typhoon-real':'dynamic-'+button.dataset.capabilityDynamic;
 const scenario=guidedCases[route];
 if(!scenario)continue;
 const guided=guidedCaseButton(route,'▶ '+scenario.name+' · 引导讲解');
 guided.title=scenario.question;
 button.before(guided);
}
const featured=document.createElement('section');
featured.className='case-featured';
featured.setAttribute('aria-labelledby','featured-guides-title');
featured.innerHTML='<h2 id="featured-guides-title">从一个问题开始</h2><div class="case-featured-list"></div>';
const featuredPreviews={
 'dynamic-tide-san-francisco':['assets/events/san-francisco-usgs-ortho.jpg','港口航拍底图'],
 'dynamic-volcano':['assets/events/volcano-dynamic/tonga-b13-20220115T0520Z.png','真实红外扫描'],
 'typhoon-real':['assets/events/himawari8-b13/himawari-b13-20180916T0400Z.png','真实红外扫描'],
};
for(const [route,[url,description]] of Object.entries(featuredPreviews)){
 const scenario=guidedCases[route];
 const button=guidedCaseButton(route,'');
 const img=document.createElement('img'), copy=document.createElement('div');
 img.src=url;img.alt='';img.title=description;img.decoding='async';img.loading='lazy';
 const label=document.createElement('strong'),question=document.createElement('span'),evidence=document.createElement('small');
 label.textContent='▶ '+scenario.name;question.textContent=scenario.question;evidence.textContent=scenario.evidence;
 copy.append(label,question,evidence);
 button.append(img,copy);
 featured.querySelector('.case-featured-list').append(button);
}
$('.observatory').after(featured);
