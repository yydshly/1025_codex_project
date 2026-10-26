import test from 'node:test';
import assert from 'node:assert/strict';
import {RollingExperiment,SpringExperiment,LAUNCH,G,compressionFor,SPRING_GEOMETRY,springRailClearance} from '../app/replica-physics.js';

test('rolling: 60 s conserves translation + rotation + potential',()=>{
 for(const start of [-2,-.3,1.7]){const model=new RollingExperiment();model.reset(start);let max=0;
  for(let i=0;i<3600;i++){const s=model.step(1/60);max=Math.max(max,Math.abs(s.total-s.initial));assert.ok(s.height>=-1e-8);assert.ok(Math.abs(s.rotational/s.translational-.4)<1e-7||s.kinetic<1e-12);}
  assert.ok(max<2e-5,`energy drift ${max}`);assert.equal(model.snapshot().crossedBottom,true);
 }
});
test('rolling resistance converts mechanical energy to heat without changing total',()=>{
 const model=new RollingExperiment();model.reset(-1.7);for(let i=0;i<1200;i++){if(i===120)model.resistance=true;if(i===900)model.resistance=false;const s=model.step(1/60);assert.ok(Math.abs(s.total-s.initial)<2e-5);assert.ok(s.thermal>=0);}
 assert.ok(model.snapshot().thermal>model.initialEnergy*.8);
});
test('spring: rail force, muzzle velocity, flight and impact use one energy account',()=>{
 for(const amount of [.15,.3,.65,1]){const model=new SpringExperiment();model.reset(amount);let max=0;
  for(let i=0;i<1800;i++){const s=model.step(1/120);max=Math.max(max,Math.abs(s.total-s.initial));assert.ok(s.y>=LAUNCH.floor-1e-8);if(s.phase==='flight')assert.ok(Math.abs(s.vx/model.launchData.vx-1)<1e-10);}
  assert.ok(max<3e-5,`energy drift ${max}`);
  assert.equal(model.phase==='landed',amount>=.65);
  if(model.phase==='landed')assert.ok(Math.abs(model.snapshot().thermal+model.snapshot().potential-model.initialEnergy)<1e-10);
 }
});
test('launch follows barrel direction and 0.18 → 0.36 m gives four times elastic energy',()=>{
 const model=new SpringExperiment();model.reset(.65);const d=model.launchData;
 assert.ok(Math.abs(Math.atan2(d.vy,d.vx)-LAUNCH.theta)<1e-12);
 assert.ok(Math.abs((.5*LAUNCH.k*compressionFor(.8)**2)/(.5*LAUNCH.k*compressionFor(.2)**2)-4)<1e-12);
 const apex=d.y+d.vy*d.apexTime-.5*G*d.apexTime**2;
 assert.ok(apex>d.y);assert.ok(d.vx>0);
});
test('frame partition does not change the physical result materially',()=>{
 for(const C of [RollingExperiment,SpringExperiment]){const a=new C(),b=new C();for(let i=0;i<600;i++)a.step(1/60);for(let i=0;i<1440;i++)b.step(1/144);assert.ok(Math.abs(a.snapshot().total-b.snapshot().total)<3e-5);assert.ok(Math.abs(a.snapshot().x-b.snapshot().x)<1e-3);}
});


test('spring: every integer slider value respects the visible rail and actual landing surface',()=>{
 const shape=SPRING_GEOMETRY;
 for(let percent=15;percent<=100;percent++){
  const model=new SpringExperiment();model.reset(percent/100);let maxError=0;
  for(let frame=0;frame<2400;frame++){
   const s=model.step(1/120);maxError=Math.max(maxError,Math.abs(s.total-s.initial));
   assert.ok(springRailClearance(s.x,s.y)>-2e-7,`${percent}% passes through rail: ${JSON.stringify(s)}`);
   assert.ok(s.y>=LAUNCH.floor-1e-8,`${percent}% passes through base`);
   assert.ok(s.thermal>=-1e-9,`${percent}% has negative dissipated energy`);
   if(s.phase==='landed'){
    const surface=shape[s.contact];assert.ok(surface,`${percent}% unnamed landing surface`);
    assert.ok(s.x>=surface.minX&&s.x<=surface.maxX,`${percent}% lands outside ${s.contact}`);
    assert.ok(Math.abs(s.y-surface.top-shape.ballRadius)<1e-10,`${percent}% floats above landing surface`);
    assert.ok(Math.abs(s.total-s.initial)<1e-10);break;
   }
  }
  assert.ok(maxError<3e-5,`${percent}% energy drift ${maxError}`);
 }
});

test('spring: low launch energy returns at the rounded lip; direct and deflected shots both reach the real pad',()=>{
 for(const percent of [39,40,41,42,43,44,45,46,47,48,49,50,51,65,100]){
  const model=new SpringExperiment();model.reset(percent/100);let sawRim=false,sawFlight=false;
  for(let i=0;i<3600;i++){const s=model.step(1/240);sawRim ||= s.phase==='rim';sawFlight ||= s.phase==='flight';if(s.phase==='landed')break;}
  const s=model.snapshot();
  if(percent<=42){assert.ok(sawRim,`${percent}% must follow the rounded lip`);assert.equal(s.returnedToRail,true);assert.notEqual(s.phase,'landed');}
  if(percent>=45){assert.ok(sawFlight);assert.equal(s.phase,'landed');assert.equal(s.contact,'pad');}
  if(percent>=65)assert.equal(s.returnedToRail,false,'normal guided launch should not strike rail');
 }
});

test('spring: contact events remain stable across 60 / 144 Hz',()=>{
 for(const amount of [.39,.4,.43,.44,.45,.5,.65,1]){
  const a=new SpringExperiment(),b=new SpringExperiment();a.reset(amount);b.reset(amount);
  for(let i=0;i<600;i++)a.step(1/60);for(let i=0;i<1440;i++)b.step(1/144);
  const p=a.snapshot(),q=b.snapshot();
  assert.equal(p.phase,q.phase,`phase changes with frame rate at ${amount}`);
  assert.equal(p.contact,q.contact);
  assert.ok(Math.abs(p.x-q.x)<.002,`contact trajectory changes with frame rate at ${amount}`);
  assert.ok(Math.abs(p.thermal-q.thermal)<3e-5,`collision loss changes with frame rate at ${amount}`);
 }
});


test('spring: replay reconstructs the canonical apex after another compression has replaced and landed the model',()=>{
 const model=new SpringExperiment();model.reset(.8);
 for(let i=0;i<600;i++)model.step(1/120);
 assert.equal(model.phase,'landed');assert.ok(model.snapshot().thermal>0);
 const restored=model.resetToApex(.65),canonical=new SpringExperiment().resetToApex(.65);
 assert.deepEqual(restored,canonical);
 assert.equal(restored.phase,'flight');assert.equal(restored.atApex,true);assert.equal(restored.contact,null);
 assert.equal(restored.returnedToRail,false);assert.equal(restored.thermal,0);
 assert.ok(restored.vx>0);assert.ok(Math.abs(restored.vy)<1e-12);
 // Check against a separately stepped launch, rather than only the replay method.
 const reference=new SpringExperiment();reference.reset(.65);
 while(!reference.snapshot().atApex)reference.step(1/20000);
 const expected=reference.snapshot();
 assert.ok(Math.abs(restored.x-expected.x)<=Math.abs(restored.vx)/20000+1e-10);
 assert.ok(Math.abs(restored.y-expected.y)<=.5*G/20000**2+1e-10);
 assert.ok(Math.abs(restored.total-restored.initial)<3e-5);
 for(let i=0;i<600&&model.phase!=='landed';i++)model.step(1/120);
 const landed=model.snapshot();assert.equal(landed.phase,'landed');assert.equal(landed.contact,'pad');
 assert.ok(Math.abs(landed.total-canonical.initial)<1e-10);
});

test('spring: apex reconstruction rejects insufficient compression without inventing a flight state',()=>{
 const model=new SpringExperiment();model.resetToApex(.65);
 assert.throws(()=>model.resetToApex(.15),/does not reach a free-flight apex/);
 const s=model.snapshot();assert.equal(s.phase,'rail');assert.equal(s.time,0);assert.equal(s.launched,false);
 assert.equal(s.atApex,false);assert.equal(s.thermal,0);assert.equal(model.amount,.15);
 assert.throws(()=>model.resetToApex(.43),/before a free-flight apex/);
 assert.equal(model.snapshot().atApex,false);
});
