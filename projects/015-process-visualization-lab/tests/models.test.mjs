import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS,compute,sampleSeries} from '../app/models.js';
test('全部场景在时间和参数边界给出有限读数，曲线采样与当时状态一致',()=>{
 for(const s of SCENARIOS){
  const cases=[{},Object.fromEntries(s.params.map(p=>[p.key,p.min])),Object.fromEntries(s.params.map(p=>[p.key,p.max]))];
  for(const params of cases){
   const curves=sampleSeries(s.id,params,20);
   for(let i=0;i<=20;i++){
    const value=compute(s.id,i/20,params);assert(value.phase&&value.explanation);
    value.metrics.forEach((m,j)=>{assert(Number.isFinite(m.value));assert.equal(curves[j].points[i].y,m.value);});
   }
  }
 }
});
test('月相照明符合新月、满月几何；近距离潮汐指数更强',()=>{
 assert(compute('orbital',0,{inclination:0}).scene.illumination<1e-10);
 assert(compute('orbital',.5,{inclination:0}).scene.illumination>.999);
 assert(compute('orbital',0,{distance:.8}).scene.tideIndex>compute('orbital',0,{distance:1.2}).scene.tideIndex);
});
test('P波早于S波，更深的震源更迟到达，震级不改变波速',()=>{
 const shallow=compute('quake',.5,{depth:10,magnitude:4}).scene,deep=compute('quake',.5,{depth:70,magnitude:8}).scene;
 assert(shallow.arrivals.p<shallow.arrivals.s);assert(deep.arrivals.p>shallow.arrivals.p);
 const a=compute('quake',1,{depth:20,magnitude:5}).scene,b=compute('quake',1,{depth:20,magnitude:6}).scene;
 assert.equal(a.frontP,b.frontP);assert(Math.abs(b.energy/a.energy-Math.pow(10,1.5))<1e-8);
});
test('河流平流速度影响到达时刻；高斯分布全域积分守恒1kg',()=>{
 const slow=compute('river',.3,{flow:.5,diffusion:20}).scene,fast=compute('river',.3,{flow:1.5,diffusion:20}).scene;
 assert(fast.arrival<slow.arrival);assert(fast.center>slow.center);
 const s=compute('river',.4,{flow:.8,diffusion:35}).scene,dx=s.spread/100;
 let mass=0;for(let x=s.center-8*s.spread;x<s.center+8*s.spread;x+=dx){const c=s.peakConcentration*Math.exp(-((x+s.spread/200-s.center)**2)/(2*s.spread**2));mass+=c*1000*s.area*dx/1e6;}
 assert(Math.abs(mass-1)<1e-6);assert(s.massFraction>=0&&s.massFraction<=1);
});
test('电池更大电流加快放电和温升，更强散热降低温升，耗尽后停止输出',()=>{
 const a=compute('battery',.5,{current:1,cooling:.2}).scene,b=compute('battery',.5,{current:3,cooling:.2}).scene,c=compute('battery',.5,{current:3,cooling:1}).scene;
 assert(b.soc<a.soc);assert(b.temp>a.temp);assert(c.temp<b.temp);
 const end=compute('battery',1,{current:4,cooling:.2}).scene;assert.equal(end.soc,0);assert.equal(end.current,0);assert.equal(end.power,0);
});
