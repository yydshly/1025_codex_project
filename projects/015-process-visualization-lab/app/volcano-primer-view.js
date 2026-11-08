const text = (x,y,value,anchor='start',style='') =>
 `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${style}">${value}</text>`;
const stage = (index,body) => `<g data-volcano-stage="${index}"${index?' style="display:none"':''}>${body}</g>`;
const arrow = (path,color='water') =>
 `<path d="${path}" class="volcano-flow volcano-${color}-flow" marker-end="url(#volcano-arrow-${color})"/>`;
const clamp = value => Math.max(0,Math.min(1,value));

const definitions = `<defs>
 <linearGradient id="volcano-sea" x2="0" y2="1"><stop stop-color="#133c56"/><stop offset="1" stop-color="#164e65"/></linearGradient>
 <linearGradient id="volcano-mantle" x2="0" y2="1"><stop stop-color="#3a3746"/><stop offset="1" stop-color="#452f38"/></linearGradient>
 <linearGradient id="volcano-rock" x2="0" y2="1"><stop stop-color="#546177"/><stop offset="1" stop-color="#353343"/></linearGradient>
 <linearGradient id="volcano-slab" x2="0" y2="1"><stop stop-color="#487695"/><stop offset="1" stop-color="#244360"/></linearGradient>
 <linearGradient id="volcano-magma" x2="0" y2="1"><stop stop-color="#ffc57a"/><stop offset="1" stop-color="#d75234"/></linearGradient>
 <radialGradient id="volcano-melt"><stop stop-color="#ff8956" stop-opacity=".63"/><stop offset="1" stop-color="#ff8956" stop-opacity="0"/></radialGradient>
 <linearGradient id="volcano-cloud" x2="0" y2="1"><stop stop-color="#eadcda"/><stop offset="1" stop-color="#7c7282"/></linearGradient>
 ${[['water','#77dcf7'],['heat','#ffb16c'],['plate','#bed4e9']].map(([kind,color])=>
  `<marker id="volcano-arrow-${kind}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9Z" fill="${color}"/></marker>`).join('')}
 </defs>`;

const slabTrack = 'M615 111H537Q470 112 438 180Q397 246 306 313';
const regionalSection = `
 <path fill="url(#volcano-mantle)" d="M0 109H640V340H0Z"/>
 <path fill="url(#volcano-sea)" d="M0 70H640V122H537Q485 122 456 157Q427 137 374 125H293Q253 123 227 98H207Q181 123 145 123H0Z"/>
 <path fill="url(#volcano-rock)" d="M0 123H145Q182 123 207 98H227Q251 120 293 125H374Q427 137 456 157L408 186Q367 158 310 155H0Z"/>
 <path fill="url(#volcano-slab)" d="M640 122H537Q485 122 456 157Q414 236 294 334L247 340Q378 242 429 169Q466 100 537 100H640Z"/>
 <path class="volcano-seafloor" d="M0 123H145Q182 123 207 98H227Q251 120 293 125H374Q427 137 456 157Q485 122 537 122H640"/>
 <path class="volcano-line" d="M0 70H640M454 80V147M218 51V95"/>
 ${text(20,30,'汤加火山弧 · 区域剖面','start','volcano-caption')}
 ${text(218,45,'洪阿火山','middle')}${text(454,74,'海沟','middle')}
 ${text(616,63,'东 →','end','volcano-caption')}${text(22,63,'← 西','start','volcano-caption')}`;

const localMagma = 'M300 282C283 249 306 218 305 191S298 145 303 103';
const chamber = `<path fill="url(#volcano-melt)" d="M155 340Q157 236 303 225Q440 230 460 340Z"/>
 <path class="volcano-conduit-edge" d="${localMagma}"/><path class="volcano-conduit" d="${localMagma}"/>
 <path class="volcano-reservoir" d="M216 291C227 271 263 265 297 270C331 256 385 273 392 296C401 317 349 327 303 319C252 325 207 314 216 291Z"/>
 <path data-volcano-rise pathLength="1" class="volcano-hot-path" d="${localMagma}"/>`;
const localSection = `<path fill="url(#volcano-rock)" d="M0 218Q70 214 155 183L246 111L286 96L303 104L324 96L372 119L475 190Q572 220 640 223V340H0Z"/>
 <path class="volcano-strata" d="M0 246Q120 247 241 168M363 170Q506 253 640 250M0 279Q119 286 207 239M385 239Q522 298 640 279M0 318Q109 319 194 303M404 303Q519 327 640 318"/>
 <path class="volcano-seafloor" d="M0 218Q70 214 155 183L246 111L286 96L303 104L324 96L372 119L475 190Q572 220 640 223"/>
 ${chamber}`;

const particles = (count,css) => Array.from({length:count},(_,i)=>
 `<circle data-volcano-particle="${i}" r="3.8" class="${css}"/>`).join('');
const cloud = `<g data-volcano-cloud fill="url(#volcano-cloud)">
 <path d="M-74 9C-96-8-79-34-54-32C-46-64-6-66 11-43C38-65 73-43 69-23C96-19 103 14 69 21L-68 22Z"/>
 <ellipse cx="-36" cy="-21" rx="30" ry="19" fill="#d5c7ce" opacity=".52"/>
 <ellipse cx="36" cy="-30" rx="23" ry="14" fill="#f0d8cf" opacity=".43"/>
 </g>`;
const paths = {
 water:'M350 267Q331 237 321 203T296 171',
 lava:'M153 211V183L137 187Q110 216 53 244',
 burst:'M477 221V183Q474 145 480 103',
 sea:'M310 315V192Q307 143 309 92',
};
const specimen = (x,y,title,value,active=false) => `<g>
 <rect x="${x}" y="${y}" width="174" height="45" rx="5" class="${active?'volcano-result':'volcano-card'}"/>
 ${text(x+11,y+18,title,'start','volcano-caption')}${text(x+11,y+36,value,'start','volcano-small')}
 </g>`;

const sideBySide = `
 <rect x="18" y="20" width="290" height="298" rx="12" class="volcano-card"/>
 <rect x="332" y="20" width="290" height="298" rx="12" class="volcano-card"/>
 <path fill="url(#volcano-rock)" d="M30 252L75 239L135 181H170L245 235L296 249V268H30Z"/>
 <path fill="url(#volcano-rock)" d="M344 251L404 235L458 182H494L553 235L610 252V268H344Z"/>
 <path class="volcano-conduit-edge" d="M153 218V183M477 221V183"/>
 <path data-volcano-lava pathLength="1" class="volcano-hot-path" d="${paths.lava}"/>
 <path data-volcano-burst pathLength="1" class="volcano-hot-path" d="${paths.burst}"/>
 ${arrow('M144 174L127 144')}${arrow('M162 174L180 143')}
 ${cloud}
 ${text(38,54,'气体较易逸出')}${text(352,54,'气体较难逸出')}
 ${text(38,296,'岩浆可较平缓流出','start','volcano-caption')}${text(352,296,'膨胀可打碎岩浆','start','volcano-caption')}
 ${[0,1,2,3,4].map(i=>`<circle data-volcano-fragment="${i}" r="3" class="volcano-fragment"/>`).join('')}`;

export const volcanoPrimerDiagram = {
 art:definitions+
  stage(0,`${regionalSection}
   ${arrow(slabTrack,'plate')}<path data-volcano-track d="${slabTrack}" fill="none" stroke="none"/>
   ${particles(4,'volcano-plate-particle')}
   ${text(614,178,'太平洋板块','end')}${text(33,156,'上覆板块')}
   ${text(299,315,'海洋板块向西下沉','end','volcano-caption')}`)+
  stage(1,`${regionalSection}
   <ellipse data-volcano-melt cx="298" cy="201" rx="87" ry="64" fill="url(#volcano-melt)"/>
   ${arrow(paths.water)}${arrow('M379 229Q365 192 337 166')}
   <path data-volcano-track d="${paths.water}" fill="none" stroke="none"/>
   ${particles(5,'volcano-water-particle')}
   <g data-volcano-melt>${[[283,201],[314,190],[265,181],[307,223]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" class="volcano-fragment"/>`).join('')}</g>
   ${text(360,275,'含水矿物释水')}${text(226,155,'上方地幔部分熔融')}
   ${specimen(19,198,'同样的高温','加水前 · 岩石仍为固态')}
   ${specimen(19,249,'熔融门槛降低','加水后 · 部分岩石熔融',true)}`)+
  stage(2,`${localSection}
   ${arrow('M235 259Q249 216 278 182','heat')}
   ${text(24,34,'从板块尺度拉近到地下通道','start','volcano-caption')}
   ${text(32,258,'岩浆受到向上的浮力')}${text(330,148,'裂隙向上延伸')}
   ${text(411,303,'岩浆暂时聚集')}`)+
  stage(3,`${localSection}
   <path data-volcano-track d="${localMagma}" fill="none" stroke="none"/>
   ${particles(5,'volcano-gas-particle')}
   ${arrow('M413 271V126')}
   ${text(26,34,'岩浆越往上，周围压力通常越低','start','volcano-caption')}
   ${text(430,134,'浅处 · 压力较低')}${text(430,280,'深处 · 压力较高')}
   ${text(28,205,'溶解气体析出')}${text(325,194,'气泡膨胀')}`)+
  stage(4,sideBySide)+
  stage(5,`<path fill="url(#volcano-sea)" d="M0 136H640V340H0Z"/>
   <path fill="url(#volcano-rock)" d="M0 311L115 288L228 230L276 185L301 194H320L343 185L394 231L534 290L640 311V340H0Z"/>
   <path class="volcano-conduit-edge" d="M310 315V192"/>
   <path data-volcano-burst pathLength="1" class="volcano-hot-path" d="${paths.sea}"/>
   ${cloud}<path class="volcano-seafloor" d="M0 136H640"/>
   <path class="volcano-line" d="M176 237L271 196M438 86L375 77"/>
   ${text(24,121,'海面')}${text(24,237,'海底 · 两期测深')}${text(443,88,'海上 · 当天红外云图')}
   ${text(327,244,'海底喷口')}${text(24,32,'汤加案例看得见的两条证据','start','volcano-caption')}`),
 update(svg,phase,progress,reducedMotion){
  const stages=svg.querySelectorAll('[data-volcano-stage]');
  for(const [index,item] of stages.entries())item.style.display=index===phase?'':'none';
  const active=stages[phase], p=reducedMotion?.88:progress;
  const track=active.querySelector('[data-volcano-track]');
  if(track){
   const length=track.getTotalLength();
   for(const [index,dot] of active.querySelectorAll('[data-volcano-particle]').entries()){
    const along=(.15+index*.17+p*.75)%1;
    const point=track.getPointAtLength(length*along);
    dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);
    if(phase===3)dot.setAttribute('r',(2.2+7.2*along).toFixed(1));
   }
  }
  for(const melt of active.querySelectorAll('[data-volcano-melt]')){
   melt.setAttribute('opacity',.18+.82*clamp((p-.33)*2.6));
  }
  const rise=active.querySelector('[data-volcano-rise]');
  if(rise)rise.style.strokeDasharray=(phase===2?.14+.86*p:1)+' 1';
  const lava=active.querySelector('[data-volcano-lava]');
  if(lava)lava.style.strokeDasharray=(.16+.84*clamp(p*2.4))+' 1';
  const burst=active.querySelector('[data-volcano-burst]');
  if(burst){
   const expansion=phase===4?clamp((p-.61)*3.2):p;
   burst.style.strokeDasharray=(phase===4?.28+.72*expansion:.48+.52*clamp(p*2))+' 1';
   const [x,y]=phase===4?[480,106]:[309,88];
   const plume=active.querySelector('[data-volcano-cloud]');
   plume.setAttribute('transform',`translate(${x} ${y}) scale(${.28+.56*expansion})`);
   plume.setAttribute('opacity',phase===4?expansion:.52+.46*expansion);
   for(const [index,fragment] of active.querySelectorAll('[data-volcano-fragment]').entries()){
    const spread=clamp(expansion*.82+index*.08);
    fragment.setAttribute('cx',x+(index-2)*34*spread);
    fragment.setAttribute('cy',160-(36+index*10)*spread);
    fragment.setAttribute('opacity',expansion);
   }
  }
 },
};
