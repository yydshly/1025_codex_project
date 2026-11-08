const text = (x,y,label,anchor='start') => `<text x="${x}" y="${y}" text-anchor="${anchor}">${label}</text>`;
const flow = (d,color) => `<path class="accent ${color}" d="${d}" marker-end="url(#storm-arrow-${color})"/>`;
const cloud = (x,y) => `<g class="storm-primer-cloud" transform="translate(${x} ${y})"><path d="M-61 13a19 19 0 0 1 12-32 29 29 0 0 1 54-8 23 23 0 0 1 37 12 16 16 0 0 1 9 29H-61Z"/></g>`;
const ocean = `<path class="storm-primer-water" d="M0 258H640V340H0Z"/>
 <path class="accent cyan" opacity=".68" d="M0 258H640"/>${text(28,306,'暖海')}`;
const spiral = 'M82 169C145 166 199 175 230 213S289 253 320 245';
const currentBands = `<circle cx="320" cy="163" r="84" class="lead"/>
 <circle cx="320" cy="163" r="32" class="storm-primer-low"/>${text(320,169,'低压','middle')}`;
const movingFlow = (d,color,angle=0) => `<g transform="rotate(${angle} 320 163)">${flow(d,color)}<circle r="4.5" class="storm-primer-particle"/></g>`;
const spirals = [0,90,180,270].map(angle=>movingFlow(spiral,'cyan',angle)).join('');

export const stormPrimerDiagram = {
 art: `<defs>
  <linearGradient id="storm-warm-water" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#197c88"/><stop offset="1" stop-color="#113748"/></linearGradient>
  <marker id="storm-arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M1 1l8 4-8 4z" fill="#6fe5e0"/></marker>
  <marker id="storm-arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M1 1l8 4-8 4z" fill="#ffb377"/></marker>
 </defs>
 <g data-storm-stage="0">
  ${ocean}${text(28,40,'侧看 · 雷雨扰动上方')}
  ${cloud(289,106)}${cloud(363,115)}
  ${movingFlow('M212 249Q225 208 272 146','orange')}${movingFlow('M320 249V142','orange')}${movingFlow('M428 249Q410 205 366 146','orange')}
  ${text(410,105,'雷雨云团')}${text(335,205,'暖湿空气上升')}${text(255,306,'海面供给热量和水汽')}
 </g>
 <g data-storm-stage="1" style="display:none">
  ${ocean}${text(28,40,'侧看 · 上升和低层汇入')}
  ${cloud(320,107)}
  ${movingFlow('M124 232H276','cyan')}${movingFlow('M516 232H364','cyan')}${movingFlow('M320 207V138','orange')}
  ${flow('M271 94Q217 66 172 79','cyan')}${flow('M369 94Q423 66 468 79','cyan')}
  <circle cx="320" cy="232" r="30" class="storm-primer-low"/>${text(320,238,'低压','middle')}
  ${text(394,118,'凝结放热')}${text(320,66,'高空向外流散','middle')}${text(320,185,'持续上升','middle')}${text(320,305,'低层空气从周围向中心汇入','middle')}
 </g>
 <g data-storm-stage="2" style="display:none">
  <path class="water" d="M0 0H640V340H0Z"/>
  ${text(28,40,'俯看 · 北半球')}
  ${currentBands}${spirals}
  ${text(28,143,'空气向低压流动')}${text(612,285,'向运动方向右侧偏','end')}
  ${text(320,323,'向内旋入 · 逆时针环流','middle')}
 </g>
 <g data-storm-stage="3" style="display:none">
  <path class="storm-primer-water" d="M0 257H640V340H0Z"/>
  <path class="lead" d="M320 35V251"/>
  ${text(160,45,'弱风切变','middle')}${text(480,45,'强风切变','middle')}
  ${text(160,230,'上下较易对齐','middle')}${text(480,230,'上下气流容易错开','middle')}
  ${cloud(160,117)}
  <g data-tilted-cloud>${cloud(480,117)}</g>
  ${flow('M160 202V150','orange')}${flow('M480 202Q486 167 509 151','orange')}
  ${flow('M67 80H119','cyan')}${flow('M67 181H107','cyan')}
  ${flow('M373 80H470','cyan')}${flow('M373 181H410','cyan')}
  ${text(320,287,'有利条件','middle')}${text(320,318,'暖海 · 湿空气 · 初始扰动 · 足够的自转偏转 · 弱风切变','middle')}
 </g>`,
 update(svg, phase, progress, reducedMotion) {
  const stages = svg.querySelectorAll('[data-storm-stage]');
  for (const [index, stage] of stages.entries()) stage.style.display = index === phase ? '' : 'none';
  const active = stages[phase];
  for (const [index, dot] of active.querySelectorAll('.storm-primer-particle').entries()) {
   const path = dot.previousElementSibling;
   const fraction = reducedMotion ? .53 : (.17 + progress * 1.5 + index * .19) % 1;
   const point = path.getPointAtLength(path.getTotalLength() * fraction);
   dot.setAttribute('cx', point.x);dot.setAttribute('cy', point.y);
  }
  if (phase === 3) active.querySelector('[data-tilted-cloud]').setAttribute('transform', `translate(${reducedMotion ? 40 : 18 + progress * 35} 0)`);
 },
};
