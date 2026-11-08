import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS,compute} from '../app/models.js';
import {getProcessInsight} from '../app/process-insights.js';

const close=(a,b,tolerance=1e-9)=>assert(Math.abs(a-b)<=tolerance*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);

test('全部当前态图表在参数和时间边界给出有限、可绘制的数值',()=>{
 const numbers=value=>{
  if(typeof value==='number')assert(Number.isFinite(value));
  else if(Array.isArray(value))value.forEach(numbers);
  else if(value&&typeof value==='object')Object.values(value).forEach(numbers);
 };
 for(const scenario of SCENARIOS){
  for(const progress of [0,.15,.5,.9,1]){
   for(const edge of ['min','value','max']){
    const params=Object.fromEntries(scenario.params.map(p=>[p.key,p[edge]]));
    const insight=getProcessInsight(scenario.id,progress,params);numbers(insight);
    assert(insight.title&&insight.caption&&insight.legend.length);
    assert(insight.domain.x[1]>insight.domain.x[0]);
    assert(insight.domain.y[1]>insight.domain.y[0]);
   }
  }
 }
});

test('径向风速剖面最大值与地球测点严格对应同一模型',()=>{
 for(const p of [0,.12,.5,.9,1])for(const radius of [50,100,200]){
  const params={radius,wind:57},data=compute('typhoon',p,params),insight=getProcessInsight('typhoon',p,params);
  close(insight.marker.y,data.metrics[2].value);close(insight.marker.x,data.scene.stationDistance);
  close(Math.max(...insight.points.map(q=>q.y)),data.metrics[0].value);
  close(insight.points.find(q=>q.x===radius).y,data.scene.wind);
  close(insight.points[0].y,0);
 }
});

test('河段浓度剖面监测点与模型单位一致，峰值离开画面后范围仍有效',()=>{
 for(const p of [0,.3,.6,1])for(const flow of [.2,2]){
  const params={flow,diffusion:30},data=compute('river',p,params),insight=getProcessInsight('river',p,params);
  close(insight.marker.x,1000);close(insight.marker.y,data.metrics[1].value);
  close(insight.points.find(q=>q.x===1000).y,data.metrics[1].value);
  assert(insight.domain.y[1]>=Math.max(...insight.points.map(q=>q.y)));
  assert(insight.points.every(q=>q.x>=0&&q.x<=2000&&q.y>=0));
 }
});

test('地震到达前不产生地表半径，P/S前沿与读数同值',()=>{
 const before=getProcessInsight('quake',.01,{depth:80});
 assert(before.fronts.every(front=>!front.arrived&&front.radius===0));
 const during=getProcessInsight('quake',.1,{depth:24});
 assert(during.fronts[0].arrived&&!during.fronts[1].arrived);
 const data=compute('quake',.8,{depth:24}),after=getProcessInsight('quake',.8,{depth:24});
 after.fronts.forEach((front,i)=>close(front.radius,data.metrics[i].value));
 assert(after.fronts[0].radius>after.fronts[1].radius);
});

test('电池功率图满足内阻功率关系，并在耗尽后保留散热',()=>{
 const params={current:4,cooling:.1};
 const data=compute('battery',.4,params),insight=getProcessInsight('battery',.4,params);
 const [output,heat,cooling]=insight.rows;
 close(output.value,data.scene.current*data.scene.voltage);
 close(heat.value,data.scene.current**2*data.scene.resistance);
 close(output.value+heat.value,data.scene.current*data.scene.ocv);
 close(cooling.value,data.scene.cooling*(data.scene.temp-data.scene.ambient));
 assert(insight.rows.every(row=>row.unit==='W'&&row.max===output.max));
 const stopped=getProcessInsight('battery',1,params);
 close(stopped.rows[0].value,0);close(stopped.rows[1].value,0);assert(stopped.rows[2].value>0);
 assert(stopped.heatStorageRate<0);
});

test('月相与喷发视觉驱动均直接采用同一时刻状态',()=>{
 for(const p of [0,.23,.5,.77,1]){
  const moon=compute('orbital',p,{inclination:30}),phase=getProcessInsight('orbital',p,{inclination:30});
  close(phase.illumination*100,moon.metrics[0].value);close(phase.relativeTide,moon.metrics[2].value);
  const magma=compute('volcano',p),bars=getProcessInsight('volcano',p);
  bars.rows.forEach(row=>close(row.value,magma.scene[row.key]));
 }
});
