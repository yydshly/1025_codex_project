// Independent teaching visualizations. All process motion comes from model state.
const TAU = Math.PI * 2;
const CYAN = '#6de1e7';
const ORANGE = '#ffae6b';
const PURPLE = '#b7abff';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : a));
const fract = v => v - Math.floor(v);
const hash = i => fract(Math.sin(i * 127.13 + 42.71) * 43758.5453);

function path(ctx, points, close = true) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  if (close) ctx.closePath();
}
function polygon(ctx, points, fill, stroke) {
  path(ctx, points); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}
function ellipse(ctx, x, y, rx, ry, fill, stroke) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), 0, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}
function line(ctx, points, color, width = 1) {
  path(ctx, points, false); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}
function glow(ctx, x, y, r, center, outer = 'rgba(255,120,51,0)') {
  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
  g.addColorStop(0, center); g.addColorStop(1, outer);
  ctx.fillStyle = g; ctx.fillRect(x-r, y-r, r*2, r*2);
}
function label(ctx, x, y, text, scale, color = '#bbced6', align = 'left') {
  ctx.save(); ctx.font = `${Math.max(13, 9.8 / scale)}px "Segoe UI","Microsoft YaHei",sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  ctx.shadowColor = '#07131e'; ctx.shadowBlur = 4; ctx.fillText(text, x, y); ctx.restore();
}
function arrow(ctx, x1, y1, x2, y2, color, width = 1.5, head = 7) {
  const a = Math.atan2(y2-y1, x2-x1);
  line(ctx, [[x1,y1],[x2,y2]], color, width);
  polygon(ctx, [[x2,y2],[x2-head*Math.cos(a-.42),y2-head*Math.sin(a-.42)],[x2-head*Math.cos(a+.42),y2-head*Math.sin(a+.42)]], color);
}
function setup(ctx, w, h, state) {
  ctx.save();
  const scale = Math.min(w / 1000, h / 620);
  ctx.translate(w/2, h/2); ctx.scale(scale,scale);
  const yaw = Number.isFinite(state.view?.yaw) ? state.view.yaw : 0;
  const pitch = Number.isFinite(state.view?.pitch) ? state.view.pitch : 0;
  ctx.transform(1, Math.sin(yaw)*.018, Math.sin(yaw)*.035, 1 + Math.sin(pitch)*.035, 0, 0);
  ctx.lineJoin='round'; ctx.lineCap='round';
  return scale;
}

export function drawVolcano(ctx, w, h, state) {
  const scale = setup(ctx,w,h,state);
  const s = state.data?.scene || {};
  const progress = clamp(state.progress);
  const rise = clamp(s.rise), plume = clamp(s.plume), ash = clamp(s.ash);
  const pressure = clamp(s.pressure,0,1.6), flow = clamp(s.magmaFlow);

  // A broad geological block grounds the cutaway instead of floating an icon.
  ellipse(ctx,0,230,405,42,'rgba(0,0,0,.32)');
  polygon(ctx,[[-395,108],[320,108],[405,150],[-308,150]],'#25363a','#405350');
  polygon(ctx,[[-308,150],[405,150],[405,250],[-308,250]],'#17262d','#344449');
  polygon(ctx,[[-395,108],[-308,150],[-308,250],[-395,205]],'#122129','#293c42');
  for(let i=0;i<5;i++) line(ctx,[[-308,169+i*16],[405,169+i*16]],`rgba(136,160,139,${.07+i*.015})`,1);

  // The far flank and ridge provide the visible depth of the mountain.
  const silhouette=[[-390,107],[-270,31],[-190,-69],[-117,-147],[-62,-188],[-23,-193],[27,-176],[93,-121],[159,-46],[258,38],[355,107]];
  const mountain = ctx.createLinearGradient(-200,-180,240,140);
  mountain.addColorStop(0,'#405454'); mountain.addColorStop(.45,'#233b42'); mountain.addColorStop(1,'#10252e');
  polygon(ctx,silhouette,mountain,'#526568');
  polygon(ctx,[[-62,-188],[-20,-193],[41,-158],[174,-11],[355,107],[283,81],[139,-64],[54,-132]],'#31494e');
  line(ctx,[[-62,-188],[-112,-100],[-181,-13],[-233,58],[-309,108]],'rgba(153,177,166,.32)',2);
  line(ctx,[[27,-176],[59,-85],[113,-18],[185,58],[267,107]],'rgba(108,145,149,.24)',1.5);

  // Exposed strata are clipped into the face of the volcanic cone.
  const cut=[[-300,113],[-143,-83],[-63,-176],[-25,-181],[54,-126],[194,43],[316,113],[316,226],[-300,226]];
  ctx.save(); path(ctx,cut); ctx.clip();
  const rock=ctx.createLinearGradient(0,-180,0,230);
  rock.addColorStop(0,'#34434a');rock.addColorStop(.5,'#4b4540');rock.addColorStop(1,'#302e31');
  ctx.fillStyle=rock;ctx.fillRect(-330,-200,680,450);
  for(let i=0;i<9;i++) {
    const y=-120+i*43;
    polygon(ctx,[[-340,y],[340,y+18],[340,y+40],[-340,y+20]],i%2?'rgba(179,144,106,.12)':'rgba(4,23,32,.23)');
    line(ctx,[[-340,y+19],[340,y+39]],'rgba(193,160,115,.17)',1);
  }
  for(let i=0;i<120;i++) {
    const x=-300+hash(i+11)*640,y=-180+hash(i+300)*440;
    ctx.fillStyle=i%3?'rgba(206,174,126,.11)':'rgba(3,18,25,.3)';
    ctx.fillRect(x,y,.8+hash(i+50)*2,1.2);
  }
  // The hot chamber and conduit share the pressure / rise outputs.
  glow(ctx,-25,162,145,`rgba(255,96,39,${.12+pressure*.13})`);
  const chamber=ctx.createRadialGradient(-48,149,4,-25,162,103);
  chamber.addColorStop(0,'#ffda87');chamber.addColorStop(.3,'#ff9d53');chamber.addColorStop(.72,'#b94b32');chamber.addColorStop(1,'#5c3431');
  ctx.save();ctx.translate(-25,164);ctx.rotate(-.07);ellipse(ctx,0,0,95+pressure*5,40+pressure*3,chamber,'rgba(255,176,100,.6)');ctx.restore();
  const conduit=[[-25,140],[-12,94],[-39,44],[-26,-8],[-40,-60],[-33,-119],[-28,-179]];
  line(ctx,conduit,'#1c252b',29);line(ctx,conduit,'#7c4737',18);
  ctx.save();ctx.beginPath();ctx.rect(-160,160-rise*350,330,410);ctx.clip();
  ctx.shadowColor='#ff824d';ctx.shadowBlur=16;
  line(ctx,conduit,'#e37645',12);line(ctx,conduit,'#ffd07a',4.2);
  line(ctx,[[-25,113],[-89,85],[-113,37],[-105,-18]],'#d76b43',7);
  line(ctx,[[-18,88],[57,61],[96,13]],'#bf5c3e',6);
  for(let i=0;i<10;i++) {
    const u=fract(progress*2.5+i*.111);
    const yy=135-u*315;
    if(yy>=160-rise*350) glow(ctx,-28+Math.sin(yy*.045)*10,yy,7,'rgba(255,226,151,.75)');
  }
  ctx.restore();
  ctx.restore();
  line(ctx,cut.concat([cut[0]]),'rgba(181,152,120,.35)',1);

  // Surface crater and a controlled lava channel are drawn above the cutaway.
  ellipse(ctx,-29,-183,45,13,'#101d23','#59605a');
  if(rise>.78) {
    ellipse(ctx,-29,-183,35,8,`rgba(255,148,73,${.35+(rise-.78)*2})`);
    glow(ctx,-29,-184,54,`rgba(255,112,40,${(rise-.78)*1.5})`);
  }
  if(flow>.08) {
    ctx.save();ctx.globalAlpha=flow;ctx.shadowColor='#ff733d';ctx.shadowBlur=14;
    line(ctx,[[1,-179],[31,-130],[71,-91],[97,-32],[154,21],[190,60]],'#ff8450',5);
    line(ctx,[[1,-179],[31,-130],[71,-91],[97,-32],[154,21],[190,60]],'#ffd49a',1.8);ctx.restore();
  }
  if(plume>.015) {
    // Deterministic particles: scrubbing the timeline reconstructs the same plume.
    for(let i=52;i>=0;i--) {
      const age=fract(progress*1.7+hash(i+29));
      const spread=age*(29+plume*112);
      const x=-29+(hash(i+170)-.5)*spread*2;
      const y=-187-age*(86+plume*175);
      const r=5+age*(13+ash*24);
      const smoke=ctx.createRadialGradient(x-r*.2,y-r*.25,0,x,y,r);
      smoke.addColorStop(0,`rgba(${112+Math.floor(30*ash)},${132+Math.floor(10*ash)},142,${plume*(.13+.22*(1-age))})`);
      smoke.addColorStop(1,'rgba(63,80,96,0)');
      ellipse(ctx,x,y,r,r*.77,smoke);
    }
    for(let i=0;i<38;i++) {
      const u=fract(progress*2+hash(i+701));
      const direction=(hash(i+908)-.5)*2;
      const x=-29+direction*u*(65+plume*75);
      const y=-186-Math.sin(u*Math.PI)*(35+plume*90)+u*u*15;
      const r=(1+hash(i+319)*2.2)*(1-u*.5);
      ctx.globalAlpha=plume*(1-u);ellipse(ctx,x,y,r,r,'#ffbd78');
    }
    ctx.globalAlpha=1;
  }
  line(ctx,[[94,148],[177,148],[214,125]],'rgba(255,174,107,.5)',1);
  label(ctx,222,122,'岩浆房',scale,ORANGE);
  line(ctx,[[-49,-68],[-147,-68],[-183,-89]],'rgba(255,174,107,.5)',1);
  label(ctx,-190,-95,'上升通道',scale,'#bcb6a7','right');
  label(ctx,-364,247,'地下剖面',scale,'#819a9e');
  ctx.restore();
}

export function drawQuake(ctx,w,h,state) {
  const scale=setup(ctx,w,h,state),s=state.data?.scene||{};
  const depth=clamp(s.depth ?? state.params?.depth ?? 20,5,80);
  const age=Math.max(0,Number(s.waveAge)||0);
  const strength=clamp((Math.log10(Math.max(.001,Number(s.energy)||1))+3)/6,.15,1);
  const sourceY=16+depth*2.1,sourceX=-100+sourceY*.66;
  const pSurface=Math.max(0,Number(s.frontP)||0)*.89;
  const sSurface=Math.max(0,Number(s.frontS)||0)*.89;
  const top=[[-360,-23],[-250,-113],[430,-113],[320,-23]];
  const front=[[-360,-23],[320,-23],[320,237],[-360,237]];
  ellipse(ctx,10,259,425,33,'rgba(0,0,0,.3)');
  polygon(ctx,[[320,-23],[430,-113],[430,147],[320,237]],'#152a35','#355361');
  const face=ctx.createLinearGradient(0,-23,0,240);face.addColorStop(0,'#31515a');face.addColorStop(.35,'#233b49');face.addColorStop(1,'#142733');
  polygon(ctx,front,face,'#44626a');
  ctx.save();path(ctx,front);ctx.clip();
  for(let i=0;i<7;i++) {
    const yy=5+i*38;
    polygon(ctx,[[-370,yy],[330,yy+13],[330,yy+30],[-370,yy+19]],i%2?'rgba(102,127,133,.1)':'rgba(5,18,30,.22)');
    line(ctx,[[-370,yy+18],[330,yy+30]],'rgba(130,157,158,.15)',1);
  }
  for(let i=0;i<130;i++) {
    ctx.fillStyle=i%3?'rgba(134,169,173,.1)':'rgba(4,18,30,.25)';
    ctx.fillRect(-360+hash(i+12)*680,-20+hash(i+218)*260,1+hash(i+399)*2,1);
  }
  // Both fronts follow the elapsed model time, not a separate looping effect.
  const bodyWaves=[{r:age*6*.89,color:CYAN},{r:age*3.5*.89,color:PURPLE}];
  for(const wave of bodyWaves) {
    if(wave.r<.4)continue;
    ctx.save();ctx.strokeStyle=wave.color;ctx.shadowColor=wave.color;ctx.shadowBlur=12;
    for(let i=0;i<3;i++) {
      const r=wave.r-i*14;if(r<=0)continue;
      ctx.globalAlpha=(.52-i*.15)*(.45+.55*strength);ctx.lineWidth=i?1:1.4+strength*1.7;
      ellipse(ctx,sourceX,sourceY,r,r,null,wave.color);
    }
    ctx.restore();
  }
  // A narrow inclined fault separates the rock faces.
  polygon(ctx,[[-110,-23],[-91,-23],[83,237],[64,237]],'rgba(7,14,25,.66)');
  line(ctx,[[-101,-23],[74,237]],'rgba(250,177,114,.73)',2);
  if(age>0) {
    const extent=clamp(age/15)*83*(.35+strength*.65);
    line(ctx,[[sourceX-extent*.55,sourceY-extent*.85],[sourceX+extent*.55,sourceY+extent*.85]],ORANGE,3);
  }
  glow(ctx,sourceX,sourceY,28+strength*34,`rgba(255,154,85,${.2+strength*.3})`);
  ellipse(ctx,sourceX,sourceY,4+strength*3,4+strength*3,'#ffe1a5',ORANGE);
  line(ctx,[[sourceX-10,sourceY],[sourceX+10,sourceY]],'#ffe2ba',1);
  line(ctx,[[sourceX,sourceY-10],[sourceX,sourceY+10]],'#ffe2ba',1);
  ctx.restore();

  // The upper plane shows the surface intersections of P and S fronts.
  polygon(ctx,top,'#243f46','#53716c');
  ctx.save();path(ctx,top);ctx.clip();
  for(let i=0;i<8;i++) line(ctx,[[-360+i*100,-22],[-250+i*100,-113]],'rgba(138,166,155,.12)',1);
  for(let i=0;i<5;i++)line(ctx,[[-360+i*27,-23-i*22.5],[320+i*27,-23-i*22.5]],'rgba(138,166,155,.11)',1);
  const epicenterX=sourceX+55,epicenterY=-68;
  for(const [r,color] of [[pSurface,CYAN],[sSurface,PURPLE]]) {
    if(r<1)continue;
    ctx.save();ctx.shadowColor=color;ctx.shadowBlur=8;
    for(let k=0;k<3;k++){
      const rr=r-k*12;if(rr<=0)continue;
      ctx.globalAlpha=.65-k*.17;ctx.lineWidth=k?1:2;
      ellipse(ctx,epicenterX,epicenterY,rr,rr*.24,null,color);
    }
    ctx.restore();
  }
  line(ctx,[[epicenterX,epicenterY],[sourceX,-23]],'rgba(255,178,105,.35)',1);
  ellipse(ctx,epicenterX,epicenterY,5,2.5,'#ffd2a1');
  ctx.restore();

  // Compact urban masses give the scale a recognizable surface reference.
  for(let i=0;i<13;i++) {
    const x=-282+i*44,y=-46-hash(i+71)*42,hh=12+hash(i+52)*30,ww=10+hash(i+54)*8;
    polygon(ctx,[[x,y],[x+ww,y],[x+ww,y-hh],[x,y-hh]],'#537179','#829a9b');
    polygon(ctx,[[x+ww,y],[x+ww+7,y-6],[x+ww+7,y-hh-6],[x+ww,y-hh]],'#314e5d');
    polygon(ctx,[[x,y-hh],[x+7,y-hh-6],[x+ww+7,y-hh-6],[x+ww,y-hh]],'#70918f');
    if(hh>24)line(ctx,[[x+3,y-hh+8],[x+ww-3,y-hh+8]],'rgba(184,211,196,.35)',1);
  }
  // Dashed depth line and focus marker remain legible at all magnitudes.
  ctx.setLineDash([4,5]);line(ctx,[[sourceX,-16],[sourceX,sourceY]],'rgba(255,200,145,.35)',1);ctx.setLineDash([]);
  line(ctx,[[sourceX+11,sourceY],[200,sourceY],[230,sourceY+19]],'rgba(255,174,107,.6)',1);
  label(ctx,240,sourceY+21,'震源',scale,ORANGE);
  label(ctx,-353,266,'均匀介质剖面',scale,'#829da4');
  line(ctx,[[220,-204],[250,-204]],CYAN,2);label(ctx,260,-204,'P 波',scale,CYAN);
  line(ctx,[[220,-174],[250,-174]],PURPLE,2);label(ctx,260,-174,'S 波',scale,PURPLE);
  label(ctx,-343,-178,'地表响应',scale,'#a2bbb8');
  ctx.restore();
}

function land(ctx,points,fill='#173f46') {
  polygon(ctx,points,fill,'rgba(99,163,159,.35)');
  ctx.save();path(ctx,points);ctx.clip();
  for(let i=0;i<15;i++)line(ctx,[[-500,-280+i*40],[500,-180+i*40]],'rgba(119,170,153,.045)',1);
  ctx.restore();
}

export function drawTyphoon(ctx,w,h,state) {
  const scale=setup(ctx,w,h,state),s=state.data?.scene||{};
  const progress=clamp(state.progress);
  const cx=(clamp(s.cx ?? .5)-.5)*600,cy=(clamp(s.cy ?? .5)-.5)*360;
  const wind=clamp(s.wind ?? state.params?.wind ?? 45,20,70);
  const radius=clamp(s.radius ?? state.params?.radius ?? 130,50,200)*1.13;
  const rotation=Number(s.rotation)||0;
  const rain=clamp(Number(s.rain)||0);

  // Abstract coastlines: geographic context, not a claimed real weather basemap.
  const ocean=ctx.createRadialGradient(60,20,20,60,20,470);
  ocean.addColorStop(0,'rgba(28,83,103,.28)');ocean.addColorStop(1,'rgba(4,16,28,0)');
  ctx.fillStyle=ocean;ctx.fillRect(-490,-290,980,580);
  for(let i=0;i<9;i++)line(ctx,[[-450+i*110,-270],[-450+i*110,270]],'rgba(87,140,157,.07)',1);
  for(let i=0;i<6;i++)line(ctx,[[-480,-250+i*100],[480,-250+i*100]],'rgba(87,140,157,.07)',1);
  land(ctx,[[-490,-270],[-210,-270],[-220,-232],[-194,-203],[-231,-159],[-212,-125],[-253,-88],[-246,-52],[-285,-17],[-279,30],[-313,59],[-336,47],[-356,91],[-396,104],[-417,140],[-490,159]]);
  land(ctx,[[-240,118],[-214,132],[-202,177],[-211,212],[-231,201],[-249,159]],'#1b454a');
  land(ctx,[[-171,175],[-156,198],[-142,218],[-148,252],[-168,242],[-180,212]],'#1c454a');
  land(ctx,[[-130,228],[-105,235],[-92,249],[-110,267],[-141,251]],'#1c454a');
  land(ctx,[[-97,-264],[-82,-244],[-64,-230],[-40,-205],[-30,-178],[-46,-174],[-73,-200],[-94,-218],[-110,-251]],'#224b4f');
  for(let i=0;i<11;i++) {
    const x=-300+hash(i+61)*84,y=-175+hash(i+231)*195;
    ellipse(ctx,x,y,2,2,'rgba(139,202,184,.55)');
  }
  label(ctx,-372,185,'海岸示意',scale,'#668e94');

  // A model-supplied path can be scrubbed both forward and backward.
  const track=Array.isArray(s.track)?s.track:[];
  if(track.length>1){
    const pts=track.map(p=>[(clamp(p.x)-.5)*600,(clamp(p.y)-.5)*360]);
    ctx.setLineDash([4,7]);line(ctx,pts,'rgba(160,198,202,.3)',1.3);ctx.setLineDash([]);
    const passed=track.filter(p=>(p.t ?? 0)<=progress).map(p=>[(clamp(p.x)-.5)*600,(clamp(p.y)-.5)*360]);
    if(passed.length>1)line(ctx,passed,'rgba(130,223,220,.75)',1.8);
    const nearest=track.findIndex(p=>(p.t ?? 0)>=progress),next=track[Math.min(track.length-1,Math.max(1,nearest+1))];
    if(next && (next.t ?? 0)>progress){const nx=(clamp(next.x)-.5)*600,ny=(clamp(next.y)-.5)*360;const a=Math.atan2(ny-cy,nx-cx);arrow(ctx,cx+Math.cos(a)*(radius+20),cy+Math.sin(a)*(radius+20),cx+Math.cos(a)*(radius+54),cy+Math.sin(a)*(radius+54),'rgba(139,225,224,.7)',1.5,7);}
  }
  glow(ctx,cx,cy,radius*1.5,'rgba(63,146,180,.16)','rgba(33,98,128,0)');

  // Closed contours and the rain shield sit beneath cloud bands.
  for(let i=4;i>=1;i--){
    ctx.save();ctx.setLineDash(i%2?[4,8]:[]);ctx.lineWidth=1;ctx.globalAlpha=.11+i*.025;
    ellipse(ctx,cx,cy,radius*(.38+i*.2),radius*(.32+i*.17),null,'#8ccbd8');ctx.restore();
  }
  for(let i=0;i<50;i++){
    const a=hash(i+4)*TAU-rotation*.2,r=radius*(.4+hash(i+332)*.8);
    const x=cx+Math.cos(a)*r,y=cy-Math.sin(a)*r*.86;
    const gg=ctx.createRadialGradient(x,y,0,x,y,12+rain*22);
    gg.addColorStop(0,`rgba(71,160,181,${.025+rain*.055})`);gg.addColorStop(1,'rgba(33,124,166,0)');
    ellipse(ctx,x,y,12+rain*22,8+rain*15,gg);
  }

  const eye=Math.max(13,radius*.115);
  // Layered spiral strokes define the coherent storm before fine droplets.
  for(let arm=0;arm<5;arm++){
    for(let layer=0;layer<3;layer++){
      ctx.beginPath();
      for(let j=0;j<=90;j++){
        const u=j/90,r=eye+u*(radius-eye),a=arm*TAU/5-rotation-u*5.1+layer*.08;
        const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.85;
        j?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.lineWidth=5+layer*4;ctx.strokeStyle=`rgba(189,222,231,${.035+(2-layer)*.025})`;ctx.stroke();
    }
  }
  // Seeded cloud volumes remain deterministic at the selected time.
  for(let i=0;i<490;i++){
    const u=Math.pow(hash(i+30),.7),arm=i%5;
    const r=eye+u*(radius-eye);
    const a=arm*TAU/5-rotation-u*5.1+(hash(i+180)-.5)*(.15+u*.45);
    const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.85;
    const rr=(2+hash(i+190)*8)*(1.05-u*.15)*(wind/70*.35+.65);
    const gg=ctx.createRadialGradient(x-rr*.2,y-rr*.3,0,x,y,rr);
    const alpha=.18+hash(i+200)*.34;
    gg.addColorStop(0,`rgba(220,237,244,${alpha})`);gg.addColorStop(.5,`rgba(156,198,216,${alpha*.42})`);gg.addColorStop(1,'rgba(74,139,165,0)');
    ellipse(ctx,x,y,rr,rr*.86,gg);
  }
  // A clean eye and bright eyewall make rotation legible even on small screens.
  const eyeGlow=ctx.createRadialGradient(cx,cy,eye*.4,cx,cy,eye*1.8);
  eyeGlow.addColorStop(0,'rgba(9,31,48,1)');eyeGlow.addColorStop(.45,'rgba(12,37,55,.97)');eyeGlow.addColorStop(.72,'rgba(198,228,237,.4)');eyeGlow.addColorStop(1,'rgba(115,193,214,0)');
  ellipse(ctx,cx,cy,eye*1.8,eye*1.55,eyeGlow);
  ellipse(ctx,cx,cy,eye*.48,eye*.42,'#0c2234');
  for(let i=0;i<3;i++){
    const a=-rotation+i*TAU/3,r=radius*.78;
    const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.85;
    const tangent=a-Math.PI/2;
    arrow(ctx,x-Math.cos(tangent)*9,y-Math.sin(tangent)*9,x+Math.cos(tangent)*9,y+Math.sin(tangent)*9,'rgba(149,231,233,.64)',1.3,5);
  }
  line(ctx,[[cx+eye,cy],[cx+eye+52,cy-18],[cx+eye+83,cy-18]],'rgba(169,216,223,.7)',1);
  label(ctx,cx+eye+91,cy-20,'眼区',scale,'#cee7ed');
  // The fixed model station is the exact point used by the wind readout.
  const station=s.station || {x:.61,y:.41};
  const stationX=(clamp(station.x)-.5)*600,stationY=(clamp(station.y)-.5)*360;
  const markerRadius=Math.max(5,3.8/scale),ringRadius=Math.max(10,7/scale);
  ctx.save();ctx.setLineDash([3,6]);
  line(ctx,[[cx,cy],[stationX,stationY]],'rgba(247,204,127,.35)',1);
  ctx.setLineDash([]);
  glow(ctx,stationX,stationY,ringRadius*2,'rgba(247,204,127,.2)','rgba(247,204,127,0)');
  ellipse(ctx,stationX,stationY,ringRadius,ringRadius,'rgba(13,29,41,.66)','rgba(247,204,127,.85)');
  ellipse(ctx,stationX,stationY,markerRadius,markerRadius,'#f7cc7f');
  line(ctx,[[stationX+ringRadius,stationY+ringRadius*.6],[stationX+ringRadius+10,stationY+ringRadius+12]],'rgba(247,204,127,.7)',1);
  label(ctx,stationX+ringRadius+16,stationY+ringRadius+15,'模型标记点',scale,'#f7cc7f');
  ctx.restore();
  label(ctx,345,251,'理想化环流',scale,'#789da8','right');
  ctx.restore();
}
