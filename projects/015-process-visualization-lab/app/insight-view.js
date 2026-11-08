const f=n=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:Math.abs(n)<1?3:1}).format(n);
export function insightMarkup(d){
 let plot='';
 if(d.kind==='profile'){
  const [xmin,xmax]=d.domain.x,[ymin,ymax]=d.domain.y,X=x=>15+(x-xmin)/(xmax-xmin)*165,Y=y=>104-(y-ymin)/(ymax-ymin)*80;
  const curve=d.points.map(p=>`${X(p.x)},${Y(p.y)}`).join(' '),m=d.marker,ref=d.reference;
  plot=`<svg viewBox="0 0 200 138" role="img" aria-label="${d.title}"><text x="15" y="12" class="chart-axis">${d.yLabel}</text><path d="M15 24H180 M15 64H180 M15 104H180" stroke="#294253" stroke-width=".5"/><polyline points="${curve}" fill="none" stroke="${d.legend[0].color}" stroke-width="1.8"/>${ref?`<path d="M${X(ref.x)} 24V104" stroke="${ref.color}" stroke-opacity=".35" stroke-dasharray="2 3"/>`:''}${m?`<path d="M${X(m.x)} ${Y(m.y)}V104" stroke="${m.color}" stroke-dasharray="2 3"/><circle cx="${X(m.x)}" cy="${Y(m.y)}" r="3.7" fill="${m.color}"/>`:''}<text x="15" y="116" class="chart-axis">${f(xmin)}</text><text x="180" y="116" text-anchor="end" class="chart-axis">${f(xmax)}</text><text x="100" y="133" text-anchor="middle" class="chart-axis">${d.xLabel}</text><text x="178" y="20" text-anchor="end" class="chart-axis">${f(ymax)}</text></svg>${m?`<div class="insight-observation"><i style="background:${m.color}"></i>${m.label}<strong>${f(m.x)} ${d.id==='river'?'m':'km'} · ${f(m.y)} ${d.id==='river'?'mg/L':'m/s'}</strong></div>`:''}`;
 } else if(d.kind==='bars'){
  plot=`<div class="insight-bars">${d.rows.map(r=>`<div><label><span>${r.label}</span><strong>${f(r.value)} ${r.unit}</strong></label><div class="insight-bar"><i style="width:${Math.max(0,Math.min(100,r.value/r.max*100))}%;background:${r.color}"></i></div></div>`).join('')}</div>`;
 } else if(d.kind==='wavefront'){
  plot=`<svg viewBox="0 0 200 137" role="img" aria-label="P波和S波当前地表半径"><path d="M15 65H185 M100 10V120" stroke="#294253" stroke-width=".5"/><circle cx="100" cy="65" r="52" stroke="#294253" stroke-width=".5" fill="none"/>${d.fronts.map(w=>`<circle cx="100" cy="65" r="${w.radius/d.maxRadius*52}" fill="${w.color}" fill-opacity=".055" stroke="${w.color}" stroke-width="1.5"/>`).join('')}<circle cx="100" cy="65" r="2" fill="#ffcdab"/><text x="100" y="134" class="chart-axis" text-anchor="middle">外圈参考半径 360 km</text></svg><div class="wave-readings">${d.fronts.map(w=>`<span style="color:${w.color}">${w.label}<b>${w.arrived?f(w.radius)+' km':'尚未到达'}</b></span>`).join('')}</div>`;
 } else if(d.kind==='phase'){
  const rr=36,k=1-2*d.illumination,pts=[],sign=d.waxing?1:-1;
  for(let i=0;i<=60;i++){const y=-rr+i/60*rr*2;pts.push([100+sign*k*Math.sqrt(Math.max(0,rr*rr-y*y)),47+y]);}
  for(let i=60;i>=0;i--){const y=-rr+i/60*rr*2;pts.push([100+sign*Math.sqrt(Math.max(0,rr*rr-y*y)),47+y]);}
  plot=`<svg viewBox="0 0 200 108" role="img" aria-label="从地球所见受光${f(d.illumination*100)}%"><defs><radialGradient id="phaseLight"><stop stop-color="#f3ebdd"/><stop offset="1" stop-color="#a6abb0"/></radialGradient></defs><circle cx="100" cy="47" r="36" fill="#1a2839" stroke="#5e7e93" stroke-width=".5"/><polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="url(#phaseLight)"/><text x="100" y="101" text-anchor="middle" fill="#c9dfeb" font-size="11">受光 ${f(d.illumination*100)}%</text></svg>`;
 }
 return `<div class="panel-label"><span>${d.title}</span><span class="insight-time">${f(d.time.value)} ${d.time.unit}</span></div>${plot}<p class="insight-caption">${d.caption}</p>`;
}
