import {guidedCases, mechanisms} from './case-lessons.js';
import {stormPrimerDiagram} from './storm-primer-view.js';
import {quakePrimerDiagram} from './geology-primer-view.js';
import {volcanoPrimerDiagram} from './volcano-primer-view.js';

const clamp = value => Math.min(1, Math.max(0, value));
const label = (x, y, text) => `<text x="${x}" y="${y}">${text}</text>`;
const diagrams = {
 volcano: volcanoPrimerDiagram,
 storm: stormPrimerDiagram,
 quake: quakePrimerDiagram,
 wildfire: {
  art: `<path class="land" d="M0 263L127 259 238 222 353 118 426 136 527 62 640 80V340H0Z"/>
   <path class="lead" d="M0 305L153 290 250 257 360 155 429 171 529 100 640 120"/>
   <g fill="#6cd6ad"><path d="M104 248l15-36 15 36zm44-14 18-44 18 44zm43-13 15-35 15 35zm184-103 17-40 17 40zm38 10 16-37 16 37zm95-57 16-39 16 39z"/></g>
   <path id="fire-edge" fill="#f9814e" fill-opacity=".32" class="accent orange" d="M0 0Q-39-36 0-30T88-39Q122-24 82 4T0 0Z"/>
   <path id="fire-wind" class="accent cyan" d="M186 98L404 45m-22-9 22 9-17 19"/>
   <path id="fire-slope" class="accent pale" d="M306 237l86-72m-23 0h23l-2 22"/>
   ${label(70,175,'可燃植被')}${label(163,77,'风往哪吹')}${label(355,251,'上坡方向')}`,
  update(svg, p) {
   const growth = .32 + p * 1.65;
   svg.querySelector('#fire-edge').setAttribute('transform', `translate(${177 + p * 51} ${256 - p * 38}) rotate(-15) scale(${growth} .8)`);
   svg.querySelector('#fire-wind').style.opacity = clamp((p - .18) * 5);
   svg.querySelector('#fire-slope').style.opacity = clamp((p - .35) * 5);
  },
 },
 river: {
  art: `<path class="accent cyan" opacity=".26" style="stroke-width:63px" d="M-20 120Q151 12 235 136T437 208Q530 155 660 218"/>
   <path id="river-route" class="lead" d="M-20 120Q151 12 235 136T437 208Q530 155 660 218"/>
   <ellipse id="river-dye" fill="#77efc2" rx="13" ry="11" cx="0" cy="0" fill-opacity=".84"/>
   <g class="river-samples">${[[195,92],[330,223],[516,193]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8"/>`).join('')}</g>
   ${label(39,124,'上游释放')}${label(164,54,'断面 1')}${label(301,275,'断面 2')}${label(488,155,'断面 3')}${label(514,275,'往下游 →')}`,
  update(svg, p) {
   const route = svg.querySelector('#river-route'), at = route.getTotalLength() * (.115 + .83 * p);
   const position = route.getPointAtLength(at), ahead = route.getPointAtLength(at + 2);
   const angle = Math.atan2(ahead.y - position.y, ahead.x - position.x) * 180 / Math.PI;
   const dye = svg.querySelector('#river-dye');
   dye.setAttribute('transform', `translate(${position.x} ${position.y}) rotate(${angle})`);
   dye.setAttribute('rx', 13 + 51 * p);
   dye.setAttribute('fill-opacity', .84 - .48 * p);
   [...svg.querySelector('.river-samples').children].forEach((sample, i)=>sample.classList.toggle('arrived', p > [.24,.47,.76][i]));
  },
 },
 battery: {
  art: `<rect class="land" x="83" y="138" width="208" height="103" rx="17"/>
   <path class="accent pale" d="M83 173H65v33h18m208-33h18v33h-18M65 190H37V88h218m52 0h254v102H309"/>
   <path id="battery-flow" class="accent cyan" pathLength="1" d="M309 190H561V88H37V190h28"/>
   <path class="accent orange" d="M255 88l7-16 10 32 10-32 10 32 10-32 5 16"/>
   <path class="lead" d="M288 228H378m-64-38h64"/>
   ${label(235,48,'外部负载')}${label(163,196,'电芯')}${label(386,196,'电流 · 端电压')}${label(386,235,'电芯温度')}`,
  update(svg, p) {
   const flow = svg.querySelector('#battery-flow');
   flow.style.opacity = p > .1 && p < .84 ? 1 : 0;
   flow.style.strokeDasharray = '.035 .045';
   flow.style.strokeDashoffset = -p * 1.5;
  },
 },
 engine: {
  art: `<path class="land" d="M116 52h151v195H116Z"/>
   <circle class="accent cyan" cx="192" cy="224" r="34"/>
   <path id="engine-rod" class="accent pale"/>
   <rect id="engine-piston" x="139" y="91" width="106" height="36" rx="7" fill="#8bcddd"/>
   <path class="accent orange" d="M93 59h272m-173 0v31"/>
   <path class="lead" d="M233 223h98m-56-103h56"/>
   ${label(345,59,'轨压 · 共轨燃油压力')}${label(345,128,'活塞往复')}${label(345,229,'曲轴 · 转速与扭矩')}`,
  update(svg, p) {
   const a = p * Math.PI * 8, y = 224 - 27 * Math.cos(a), x = 192 + 27 * Math.sin(a);
   svg.querySelector('#engine-piston').setAttribute('y', y - 132);
   svg.querySelector('#engine-rod').setAttribute('d', `M192 ${y - 96}L${x} ${y}`);
  },
 },
};

export function createCaseLesson(container, {onSeek} = {}) {
 const panel = document.createElement('section');
 panel.className = 'case-lesson';
 panel.hidden = true;
 panel.setAttribute('aria-labelledby', 'case-lesson-title');
 panel.innerHTML = `<div class="case-lesson-copy">
  <span class="case-lesson-kicker">先看原理 · 教学示意</span>
  <h2 id="case-lesson-title"></h2><ol></ol>
  <button type="button">进入真实记录 →</button>
  <div class="case-lesson-bridge"><strong></strong><p></p><a target="_blank" rel="noopener noreferrer"></a></div>
 </div><div class="case-lesson-visual"><p class="case-lesson-overview" hidden></p>
 <svg class="case-lesson-diagram" viewBox="0 0 640 340" role="img" preserveAspectRatio="xMidYMid meet"></svg>
 <div class="volcano-shot" hidden>
  <canvas role="img" aria-label="从地球定位汤加，沿三维剖面观察俯冲、岩浆和喷发"></canvas>
  <div class="volcano-shot-veil" aria-hidden="true"></div>
  <div class="volcano-shot-header"><span>原理示意</span><strong class="volcano-shot-title"></strong></div>
  <svg class="volcano-shot-leaders" aria-hidden="true">
   <path data-volcano-leader="0"/><path data-volcano-leader="1"/><path data-volcano-leader="2"/>
  </svg>
  ${[0,1,2].map(index=>`<div class="volcano-shot-note" data-note="${index}" hidden><span></span></div>`).join('')}
  <div class="volcano-shot-context" hidden></div>
  <button class="volcano-shot-angle" type="button" aria-pressed="false">侧看剖面</button>
 </div>
 <p class="case-lesson-detail" hidden></p><p>动画用于解释原理，比例与速度为教学示意</p></div>`;
 container.append(panel);
 const [title, phases, heading, note, source, button, svg] = ['h2','ol','strong','.case-lesson-bridge p','a','button','.case-lesson-diagram'].map(selector=>panel.querySelector(selector));
 const detail = panel.querySelector('.case-lesson-detail'), overview = panel.querySelector('.case-lesson-overview');
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 let activeRoute = null, activePhase = -1;
 const volcanoHost = panel.querySelector('.volcano-shot');
 let volcanoView, volcanoPending, volcanoPosition;
 function renderVolcano(){
  if(activeRoute!=='dynamic-volcano'||!volcanoView||!volcanoPosition)return false;
  const visible=volcanoView.update(...volcanoPosition);
  svg.toggleAttribute('hidden',visible);
  return visible;
 }
 return {
  button,
  whenReady:()=>volcanoPending,
  show(route, progress = 0) {
   const scenario = guidedCases[route], lesson = mechanisms[scenario?.kind];
   if (!lesson) {
    if (activeRoute) {
     delete document.body.dataset.caseLesson;
     panel.hidden = true;
     volcanoHost.hidden = true;
     activeRoute = null;
    }
    return;
   }
   if (activeRoute !== route) {
    activeRoute = route;activePhase = -1;
    svg.removeAttribute('hidden');
    volcanoHost.hidden = true;
    volcanoPosition = null;
    if(scenario.kind==='volcano'){
     volcanoView?.reset();
     volcanoPending??=import('./volcano-primer-3d.js').then(({createVolcanoPrimer3D})=>createVolcanoPrimer3D(volcanoHost,()=>{
      if(activeRoute!==route||!volcanoPosition)return;
      svg.removeAttribute('hidden');
      volcanoPrimerDiagram.update(svg,...volcanoPosition);
     })).then(view=>{
      volcanoView=view;
      renderVolcano();
     }).catch(()=>{});
    }
    detail.hidden = !lesson.stages;
    title.textContent = lesson.title;
    overview.hidden = !lesson.summary;
    overview.textContent = lesson.summary ?? '';
    phases.replaceChildren(...lesson.phases.map((phase,index)=>{
     const item = document.createElement('li');
     if (lesson.stages && onSeek) {
      const seek = document.createElement('button');
      seek.type = 'button';seek.textContent = phase;
      seek.addEventListener('click',async()=>{
       await onSeek(lesson.stages[index].from);
       if(activeRoute!==route||scenario.kind!=='volcano')return;
       const controls=document.querySelector('#narration-dock').getBoundingClientRect();
       const frame=panel.getBoundingClientRect();
       if(detail.getBoundingClientRect().bottom>controls.top-10||frame.top<0){
        panel.scrollIntoView({block:'start',behavior:'instant'});
       }
      });
      item.append(seek);
     } else item.textContent = phase;
     return item;
    }));
    heading.textContent = '真实案例 · ' + scenario.name;
    note.textContent = scenario.note;
    [source.textContent, source.href] = lesson.source;
    svg.setAttribute('aria-label', lesson.phases.join('，'));
    svg.innerHTML = diagrams[scenario.kind].art;
    document.body.dataset.caseLesson = scenario.kind;
    panel.hidden = false;
   }
   const stages = lesson.stages;
   const phase = stages ? stages.findLastIndex(stage=>stage.from<=progress) : progress < .24 ? 0 : progress < .64 ? 1 : 2;
   if (activePhase !== phase) {
    activePhase = phase;
    [...phases.children].forEach((item,i)=>(item.firstElementChild??item).setAttribute('aria-current',i===phase?'step':'false'));
    if (stages) detail.textContent = stages[phase].detail;
   }
   if (stages) {
    const start = stages[phase].from, end = stages[phase+1]?.from??1;
    const stepProgress = clamp((progress-start)/(end-start));
    if(scenario.kind==='volcano'){
     volcanoPosition=[phase,stepProgress,reducedMotion.matches];
     if(renderVolcano())return;
    }
    diagrams[scenario.kind].update(svg,phase,stepProgress,reducedMotion.matches);
   } else diagrams[scenario.kind].update(svg,reducedMotion.matches?[.18,.54,.91][phase]:progress);
  },
 };
}

