// Authored teaching scenes. Geometry and textures are procedural, not observed imagery.
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const frac = v => v - Math.floor(v);
const hash = n => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const mix = (a, b, t) => a + (b - a) * t;
const cyan = '#6de1e7', amber = '#ffae6b', violet = '#b7abff';

function line(ctx, points, color, width = 1, dash = []) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
  ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore();
}
function label(ctx, text, x, y, color = '#8ba5b5', size = 11, align = 'left') {
  ctx.save(); ctx.font = `${size}px "Microsoft YaHei",sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, x, y); ctx.restore();
}
function dot(ctx, x, y, r, color, glow = 0) {
  ctx.save(); ctx.fillStyle = color; if (glow) { ctx.shadowBlur = glow; ctx.shadowColor = color; }
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
}
function arrow(ctx, x1, y1, x2, y2, color, size = 5) {
  const a = Math.atan2(y2-y1,x2-x1); line(ctx,[[x1,y1],[x2,y2]],color,1.3);
  line(ctx,[[x2-size*Math.cos(a-.5),y2-size*Math.sin(a-.5)],[x2,y2],[x2-size*Math.cos(a+.5),y2-size*Math.sin(a+.5)]],color,1.3);
}
function poly(ctx, points, fill, stroke) {
  ctx.beginPath(); points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}

let earthAtlas, earthPixels, earthCanvas, earthCtx, earthKey;
let moonCanvas, moonCtx, moonKey;
function initEarth() {
  if (earthAtlas || typeof document === 'undefined') return;
  earthAtlas = document.createElement('canvas'); earthAtlas.width = 720; earthAtlas.height = 360;
  const c = earthAtlas.getContext('2d');
  c.fillStyle='#175774'; c.fillRect(0,0,720,360);
  const continents = [
    [[-168,70],[-135,73],[-119,60],[-98,55],[-82,50],[-55,53],[-63,42],[-78,26],[-97,17],[-109,27],[-123,38],[-132,52],[-154,58]],
    [[-98,19],[-86,20],[-80,11],[-76,8],[-79,6],[-88,14]],
    [[-81,12],[-65,9],[-49,-1],[-35,-8],[-41,-22],[-53,-35],[-68,-55],[-76,-39],[-79,-14]],
    [[-55,60],[-42,62],[-19,80],[-41,84],[-61,76]],
    [[-12,36],[-5,55],[15,72],[38,70],[42,52],[65,58],[82,72],[125,73],[172,60],[153,48],[137,35],[122,24],[108,7],[97,15],[87,21],[76,8],[68,25],[49,30],[35,42],[27,36],[14,40]],
    [[-17,34],[9,38],[33,30],[43,12],[50,0],[40,-18],[25,-35],[11,-34],[-1,-15],[-15,5]],
    [[112,-11],[133,-12],[154,-22],[151,-37],[132,-39],[115,-29]],
    [[46,-13],[51,-16],[48,-26],[44,-21]],
    [[130,32],[143,46],[146,44],[140,33]],
    [[95,5],[111,1],[118,-7],[135,-7],[146,-10],[140,-4],[119,4]],
    [[166,-34],[178,-39],[172,-46],[165,-46]],
    [[-180,-71],[-135,-74],[-90,-70],[-45,-77],[0,-70],[45,-73],[90,-68],[135,-72],[180,-71],[180,-90],[-180,-90]]
  ];
  for (const pts of continents) {
    const points=pts.map(([lon,lat])=>[(lon+180)*2,(90-lat)*2]);
    poly(c,points,'#69998a','#83ad93');
  }
  // A few dry regions and mountain chains keep the planet legible at small scale.
  c.globalAlpha=.65;
  poly(c,[[-12,28],[7,32],[31,28],[34,16],[12,13],[-7,18]].map(([a,b])=>[(a+180)*2,(90-b)*2]),'#c4b792');
  poly(c,[[45,30],[58,27],[55,15],[43,13]].map(([a,b])=>[(a+180)*2,(90-b)*2]),'#c7b493');
  c.globalAlpha=1;
  for(let i=0;i<160;i++){
    const x=hash(i+17)*720,y=hash(i+813)*310+25;
    c.fillStyle=`rgba(224,243,236,${.025+hash(i+19)*.07})`;c.beginPath();c.ellipse(x,y,5+hash(i+181)*24,1+hash(i+65)*3,-.15,0,TAU);c.fill();
  }
  earthPixels=c.getImageData(0,0,720,360).data;
  earthCanvas=document.createElement('canvas');earthCanvas.width=224;earthCanvas.height=224;earthCtx=earthCanvas.getContext('2d');
}
function earthSphere(ctx,x,y,r,rotation,sunAngle=0) {
  initEarth(); if(!earthCanvas)return;
  const turn=Math.round(rotation*75),sun=Math.round(sunAngle*100),key=`${turn}/${sun}`;
  if(key!==earthKey){
    earthKey=key;const n=224,img=earthCtx.createImageData(n,n),d=img.data;
    const lx=Math.cos(sun/100)*.80,ly=Math.sin(sun/100)*.45-.18,lz=.57;
    const ln=Math.hypot(lx,ly,lz);
    for(let py=0;py<n;py++)for(let px=0;px<n;px++){
      const nx=(px+.5-n/2)/(n/2),ny=(py+.5-n/2)/(n/2),rr=nx*nx+ny*ny;if(rr>1)continue;
      const z=Math.sqrt(1-rr),lon=Math.atan2(nx,z)+turn/75,lat=Math.asin(-ny);
      const u=Math.floor(frac(lon/TAU+.5)*720),v=Math.min(359,Math.floor((.5-lat/Math.PI)*360));
      const j=(v*720+u)*4,i=(py*n+px)*4;
      const light=clamp((nx*lx+ny*ly+z*lz)/ln,0,1),shade=.12+light*.90;
      const rim=Math.pow(1-z,3)*.26;
      d[i]=clamp(earthPixels[j]*shade+rim*45,0,255);d[i+1]=clamp(earthPixels[j+1]*shade+rim*122,0,255);d[i+2]=clamp(earthPixels[j+2]*shade+rim*147,0,255);d[i+3]=255;
    }
    earthCtx.putImageData(img,0,0);
  }
  ctx.save();
  const halo=ctx.createRadialGradient(x,y,r*.88,x,y,r*1.19);halo.addColorStop(0,'#55d9ed00');halo.addColorStop(.65,'#55d9ed24');halo.addColorStop(1,'#55d9ed00');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,r*1.2,0,TAU);ctx.fill();
  ctx.drawImage(earthCanvas,x-r,y-r,r*2,r*2);
  ctx.strokeStyle='#91e9f84d';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.restore();
}
function moon(ctx,x,y,r,illumination,phase=0) {
  // The lunar face is an inset Earth-observer view. Its lit area is driven by
  // the same 3-D illumination fraction used in the numeric model, not a loop.
  if(typeof document==='undefined')return;
  if(!moonCanvas){moonCanvas=document.createElement('canvas');moonCanvas.width=96;moonCanvas.height=96;moonCtx=moonCanvas.getContext('2d');}
  const f=clamp(illumination),sign=Math.sin(phase*TAU)>=0?1:-1,key=`${Math.round(f*400)}/${sign}`;
  if(key!==moonKey){
    moonKey=key;const n=96,img=moonCtx.createImageData(n,n),pixels=img.data;
    const lz=2*f-1,lx=sign*Math.sqrt(Math.max(0,1-lz*lz));
    const craters=Array.from({length:22},(_,i)=>({x:(hash(i+31)-.5)*1.7,y:(hash(i+97)-.5)*1.7,r:.025+hash(i+71)*.12}));
    for(let py=0;py<n;py++)for(let px=0;px<n;px++){
      const nx=(px+.5)/n*2-1,ny=(py+.5)/n*2-1,rr=nx*nx+ny*ny;if(rr>1)continue;
      const nz=Math.sqrt(1-rr),light=nx*lx+nz*lz;
      let base=181+hash(Math.floor(px/3)+Math.floor(py/3)*40)*25;
      for(const c of craters){const q=Math.hypot(nx-c.x,ny-c.y)/c.r;if(q<1)base-=24*(1-q);else if(q<1.16)base+=8;}
      const shade=light>0?.18+.82*Math.sqrt(light):.045,i=(py*n+px)*4;
      pixels[i]=base*shade;pixels[i+1]=base*shade*1.04;pixels[i+2]=base*shade*1.07;pixels[i+3]=clamp((1-Math.sqrt(rr))*n)*255;
    }
    moonCtx.putImageData(img,0,0);
  }
  ctx.drawImage(moonCanvas,x-r,y-r,r*2,r*2);
  ctx.save();ctx.strokeStyle='#8bb4c54d';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.restore();
}
function phaseIcon(ctx,x,y,r,phase,illumination){
  dot(ctx,x,y,r,'#152b3a');
  const a=phase*TAU,lz=illumination==null?-Math.cos(a):2*clamp(illumination)-1,lx=(Math.sin(a)>=0?1:-1)*Math.sqrt(Math.max(0,1-lz*lz)),n=18,step=2*r/n;
  ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.clip();
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
    const nx=(i+.5)/n*2-1,ny=(j+.5)/n*2-1,rr=nx*nx+ny*ny;
    if(rr>=1)continue;const z=Math.sqrt(1-rr),lit=nx*lx+z*lz;
    if(lit>0){ctx.fillStyle=`rgba(209,227,224,${.55+.45*lit})`;ctx.fillRect(x-r+i*step,y-r+j*step,step+.3,step+.3);}
  }
  ctx.restore();
}

export function drawOrbital(ctx,w,h,state) {
  const d=state.data.scene,yaw=state.view?.yaw||0,pitch=state.view?.pitch||0;
  const cx=w*.49,cy=h*.49,r=Math.min(w*.205,h*.285),rx=Math.min(w*.35,r*1.8)*(d.distance||1),ry=rx*(.33+Math.sin(d.inclination||0)*.4+Math.sin(pitch)*.08);
  const angle=d.angle||0;
  // Muted star field, all positions deterministic.
  for(let i=0;i<95;i++){const x=hash(i+13)*w,y=hash(i+371)*h;dot(ctx,x,y,.4+hash(i+731)*.8,`rgba(155,199,218,${.15+hash(i+23)*.35})`);}
  const orbit=[];for(let i=0;i<=160;i++){const a=i/160*TAU;orbit.push([cx+Math.cos(a+yaw*.13)*rx,cy+Math.sin(a+yaw*.13)*ry]);}
  line(ctx,orbit,'#6de1e73b',1.2);
  const mx=cx+Math.cos(angle+yaw*.13)*rx,my=cy+Math.sin(angle+yaw*.13)*ry;
  const behind=Math.sin(angle+yaw*.13)<0;
  const mr=r*.22;
  if(behind)moon(ctx,mx,my,mr,d.illumination??0,d.phase??0);
  earthSphere(ctx,cx,cy,r,(d.rotation||0)+yaw*.2,(d.sunAngle??0)+yaw*.13);
  // Two opposite, deliberately exaggerated tidal lobes show orientation, not water height.
  ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.atan2(my-cy,mx-cx));
  ctx.strokeStyle='#6de1e74a';ctx.lineWidth=1;ctx.setLineDash([4,5]);ctx.beginPath();ctx.ellipse(0,0,r*(1.10+clamp(d.tideIndex||0)*.06),r*.96,0,0,TAU);ctx.stroke();ctx.restore();
  if(!behind)moon(ctx,mx,my,mr,d.illumination??0,d.phase??0);
  line(ctx,[[cx,cy],[mx,my]],'#cad9e42a',1,[3,6]);
  const sunAngle=(d.sunAngle??0)+yaw*.13,ux=Math.cos(sunAngle),uy=Math.sin(sunAngle)*.4;
  const sx=cx+ux*(rx+18),sy=cy+uy*(rx+18);
  arrow(ctx,sx,sy,cx+ux*(r+15),cy+uy*(r+15),amber,5);
  label(ctx,'太阳光',sx,sy-13,amber,10,'center');
  label(ctx,'地球',cx,cy+r+25,'#d0e5ed',12,'center');
  label(ctx,'月球 · 地球视角月相',mx,my-mr-13,'#cfdfeb',10,'center');
  const ly=h*.85;line(ctx,[[w*.13,ly],[w*.87,ly]],'#24414e');
  for(let i=0;i<8;i++){
    const active=Math.floor((d.phase||0)*8)%8===i,xx=w*.18+i*w*.091;ctx.save();phaseIcon(ctx,xx,ly+25,7,active?(d.phase??0):i/8,active?d.illumination:undefined);
    if(active){ctx.strokeStyle=cyan;ctx.beginPath();ctx.arc(xx,ly+25,11,0,TAU);ctx.stroke();}ctx.restore();
  }
  label(ctx,'观察月相',w*.13,ly-11,'#638292',10);
  label(ctx,'轨道与天体大小未按同一比例',w*.87,h-16,'#526d7d',9,'right');
}

function riverPoint(t,w,h,yaw=0) {
  const x=mix(w*.13,w*.88,t),y=h*.29+t*h*.35+Math.sin(t*TAU*1.25)*h*.055;
  return [x+(y-h*.5)*yaw*.06,y];
}
export function drawRiver(ctx,w,h,state) {
  const d=state.data.scene,yaw=state.view?.yaw||0;
  const riverWidth=Math.min(h*.095,w*.066),maxX=2000;
  const bank=[];for(let i=0;i<=100;i++){const p=riverPoint(i/100,w,h,yaw);bank.push([p[0],p[1]-riverWidth]);}
  for(let i=100;i>=0;i--){const p=riverPoint(i/100,w,h,yaw);bank.push([p[0],p[1]+riverWidth]);}
  const ground=[[w*.06,h*.21],[w*.75,h*.11],[w*.97,h*.67],[w*.30,h*.86]];
  poly(ctx,ground.map(([x,y])=>[x,y+16]),'#0b2027','#25414a');poly(ctx,ground,'#102e32','#315052');
  // Terrain contours remain structural, not fabricated observations.
  for(let j=0;j<11;j++){const pts=[];for(let i=0;i<=45;i++){const t=i/45;pts.push([w*(.10+t*.77),h*(.21+j*.049)+Math.sin(t*7+j*.5)*h*.025]);}line(ctx,pts,'#7ca09b12',.7);}
  poly(ctx,bank,'#1b6874','#49b0be66');
  const inner=[];for(let i=0;i<=100;i++)inner.push(riverPoint(i/100,w,h,yaw));line(ctx,inner,'#7ed5dd36',riverWidth*.75);
  // Gaussian concentration uses the same centre and spread as the chart model.
  ctx.save();ctx.beginPath();bank.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();
  const spread=Math.max(20,d.spread||20),center=d.center||0;
  for(let i=0;i<170;i++){
    const t=i/169,loc=t*maxX,intensity=Math.exp(-.5*((loc-center)/spread)**2)*Math.sqrt(20/spread);
    if(intensity<.007)continue;
    const [x,y]=riverPoint(t,w,h,yaw),rr=riverWidth*(.45+intensity*.4);
    const g=ctx.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,`rgba(255,183,91,${intensity*.83})`);g.addColorStop(.5,`rgba(245,164,77,${intensity*.36})`);g.addColorStop(1,'rgba(245,164,77,0)');
    ctx.fillStyle=g;ctx.fillRect(x-rr,y-rr,rr*2,rr*2);
  }
  for(let i=0;i<120;i++){
    const u=clamp(hash(i+144),.001,.999),v=hash(i+61),z=Math.sqrt(-2*Math.log(u))*Math.cos(TAU*v),loc=center+z*spread;
    const t=loc/maxX;if(t<0||t>1)continue;
    const p=riverPoint(t,w,h,yaw),off=(hash(i+32)-.5)*riverWidth*1.1;
    dot(ctx,p[0],p[1]+off,1+hash(i+42)*1.3,'#ffca8cbd');
  }
  ctx.restore();
  for(const t of [.22,.53,.82]){const [x,y]=riverPoint(t,w,h,yaw);arrow(ctx,x-14,y+riverWidth*.50,x+13,y+riverWidth*.57,'#9cdee3a0',4);}
  const source=riverPoint((d.source??0)/maxX,w,h,yaw),station=riverPoint((d.station??1000)/maxX,w,h,yaw);
  dot(ctx,...source,5,amber,13);line(ctx,[[source[0],source[1]-9],[source[0],source[1]-40]],'#ffae6b88');label(ctx,'瞬时释放',source[0]-6,source[1]-49,amber,10);
  line(ctx,[[station[0],station[1]-riverWidth*1.2],[station[0],station[1]+riverWidth*1.3]],'#d7f5f3aa',1.3,[3,3]);
  dot(ctx,station[0],station[1]-riverWidth*1.3,4,cyan,10);label(ctx,'下游监测站 · 1 km',station[0]+12,station[1]-riverWidth*1.3-6,'#b5d9de',10);
  const markerT=clamp(center/maxX);if(center<=maxX){const p=riverPoint(markerT,w,h,yaw);line(ctx,[[p[0],p[1]+riverWidth+7],[p[0]+23,p[1]+riverWidth+40],[p[0]+87,p[1]+riverWidth+40]],'#ffbd7b66');label(ctx,'羽流中心',p[0]+27,p[1]+riverWidth+34,'#ffc18c',10);}
  label(ctx,'上游',w*.12,h*.18,'#7b9f9c',10);label(ctx,'下游',w*.89,h*.76,'#7b9f9c',10,'right');
  const bx=w*.15,by=h*.91,bw=w*.66;line(ctx,[[bx,by],[bx+bw,by]],'#5e7d8b',1);
  for(let i=0;i<=4;i++){const x=bx+bw*i/4;line(ctx,[[x,by-3],[x,by+3]],'#6d8995');label(ctx,`${i*.5} km`,x,by+18,'#678391',9,'center');}
  label(ctx,'一维平流—扩散 · 河道形态为教学示意',w*.89,h-12,'#526d7d',9,'right');
}

function batteryProject(x,y,z,cx,cy,s,yaw) {
  return [cx+(x+z*.40)*s+(y-.5)*yaw*s*.045,cy+(y-z*.29)*s];
}
export function drawBattery(ctx,w,h,state) {
  const d=state.data.scene,yaw=state.view?.yaw||0;
  const s=Math.min(w*.54,h*.62),cx=w*.45,cy=h*.25;
  const pr=(x,y,z)=>batteryProject(x,y,z,cx,cy,s,yaw);
  const box=(x0,x1,z0,z1,fill,edge)=>{
    poly(ctx,[pr(x0,0,z1),pr(x1,0,z1),pr(x1,1,z1),pr(x0,1,z1)],fill,edge);
    poly(ctx,[pr(x0,0,z0),pr(x0,0,z1),pr(x1,0,z1),pr(x1,0,z0)],fill,edge);
    poly(ctx,[pr(x1,0,z0),pr(x1,0,z1),pr(x1,1,z1),pr(x1,1,z0)],fill,edge);
  };
  // The cell is opened into an exploded section to expose the two electrodes.
  const layers=[{x0:-.48,x1:-.31,c:'#8c797b36',edge:'#d7aca16b',name:'负极',color:amber},{x0:-.30,x1:-.06,c:'#446e7640',edge:'#70b8bd50',name:'电解液',color:'#8fb9c1'},{x0:-.045,x1:.015,c:'#bdcdb64d',edge:'#dce8c278',name:'隔膜',color:'#d7dfbd'},{x0:.03,x1:.27,c:'#446e7640',edge:'#70b8bd50',name:'电解液',color:'#8fb9c1'},{x0:.28,x1:.46,c:'#567b9160',edge:'#8edce88f',name:'正极',color:cyan}];
  const shadow=ctx.createRadialGradient(cx,cy+s*.8,0,cx,cy+s*.8,s*.75);shadow.addColorStop(0,'#00000070');shadow.addColorStop(1,'#00000000');ctx.fillStyle=shadow;ctx.fillRect(cx-s,cy,2*s,1.6*s);
  for(const l of layers)box(l.x0,l.x1,0,.31,l.c,l.edge);
  // Internal material lattice and its occupancy follow state of charge.
  for(let electrode=0;electrode<2;electrode++){
    const x0=electrode===0?-.475:.295,x1=electrode===0?-.325:.447;
    const occupied=electrode===0?clamp(d.soc):1-clamp(d.soc);
    for(let y=0;y<9;y++)for(let x=0;x<3;x++){
      const p=pr(mix(x0,x1,x/2),.08+y*.102,.315);
      dot(ctx,p[0],p[1],Math.max(1.1,s*.006),electrode===0?'#a8959760':'#85aebe60');
      if(hash(y*3+x+electrode*207)<occupied)dot(ctx,p[0],p[1],Math.max(1.3,s*.007),electrode===0?amber:cyan,4);
    }
  }
  // Ions traverse from anode to cathode, with deterministic spacing along channels.
  const requestedCurrent=Math.max(0,d.requestedCurrent??state.params?.current??d.current??0);
  const elapsed=Number.isFinite(d.elapsedSeconds)?d.elapsedSeconds:state.progress*1800;
  const activeTime=Math.max(0,Math.min(elapsed,Number.isFinite(d.stopTime)?d.stopTime:Infinity));
  const dischargedSeconds=activeTime*requestedCurrent;
  const drift=dischargedSeconds/1800*7;
  for(let i=0;i<19;i++){
    const phase=frac(hash(i+199)+drift),x=mix(-.29,.275,phase),y=.13+hash(i+47)*.73;
    const p=pr(x,y,.30);dot(ctx,p[0],p[1],Math.max(1.9,s*.008),cyan,9);
    if(i%6===0)label(ctx,'+',p[0]+4,p[1]-3,'#c9faf7',8);
  }
  // Open front boundary and top collectors.
  line(ctx,[pr(-.5,1,0),pr(.48,1,0),pr(.48,0,0)],'#a1c5d44a',1.2);
  const anode=pr(-.4,0,.16),cathode=pr(.365,0,.16);
  const wireY=Math.max(42,cy-s*.13),bulbX=cx+s*.08;
  const wire=[[anode[0],anode[1]],[anode[0],wireY],[cathode[0],wireY],[cathode[0],cathode[1]]];line(ctx,wire,'#7a9ca080',2);
  dot(ctx,bulbX,wireY,Math.max(10,s*.047),'#0c202a');
  ctx.strokeStyle=amber;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(bulbX,wireY,Math.max(10,s*.047),0,TAU);ctx.stroke();
  line(ctx,[[bulbX-5,wireY-4],[bulbX+5,wireY+4],[bulbX-5,wireY+4],[bulbX+5,wireY-4]],'#ffbe87',1.2);
  for(let i=0;i<9;i++){
    const f=frac(i/9+dischargedSeconds/1800*4);const x=mix(anode[0],cathode[0],f);
    dot(ctx,x,wireY,2,amber,9);
  }
  label(ctx,'外电路 · 电子流',bulbX,wireY-20,'#d8b99e',10,'center');
  label(ctx,'−',anode[0],anode[1]-9,amber,17,'center');label(ctx,'+',cathode[0],cathode[1]-9,cyan,17,'center');
  for(const l of [layers[0],layers[2],layers[4]]){
    const p=pr((l.x0+l.x1)/2,1,.30);line(ctx,[[p[0],p[1]+6],[p[0],p[1]+27]],l.color+'70');label(ctx,l.name,p[0],p[1]+43,l.color,11,'center');
  }
  const heat=clamp(((d.temp||25)-25)/25);
  if(heat>.015){const x=cx+s*.42,y=cy+s*.48,g=ctx.createRadialGradient(x,y,0,x,y,s*.42);g.addColorStop(0,`rgba(255,135,82,${heat*.15})`);g.addColorStop(1,'#ff875200');ctx.fillStyle=g;ctx.fillRect(x-s*.45,y-s*.45,s*.9,s*.9);}
  const tx=w*.85,ty=h*.40;label(ctx,'Li⁺',tx,ty,cyan,13,'center');arrow(ctx,tx-22,ty+14,tx+21,ty+14,cyan,4);label(ctx,'离子迁移',tx,ty+34,'#7498a7',9,'center');
  label(ctx,'放电过程 · 结构非真实尺寸',w*.88,h-14,'#526d7d',9,'right');
}
