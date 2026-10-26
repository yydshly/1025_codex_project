// SI units. One scene unit represents one metre in the diagrams, not book scale.
export const G = 9.81;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function rk4(state, dt, derivative) {
  const a = derivative(state), b = derivative(state.map((x,i)=>x+a[i]*dt/2));
  const c = derivative(state.map((x,i)=>x+b[i]*dt/2)), d = derivative(state.map((x,i)=>x+c[i]*dt));
  return state.map((x,i)=>x+dt*(a[i]+2*b[i]+2*c[i]+d[i])/6);
}

export const BALL_RADIUS = .24;
export function trackPoint(u) {
  const slope=.84*u, norm=Math.hypot(1,slope);
  return {x:u-BALL_RADIUS*slope/norm,y:.18+.42*u*u+BALL_RADIUS/norm,sin:slope/norm};
}
// Arc length of the sphere's centre path, offset along the surface normal.
const arcTable=[];
let arc=0,last=trackPoint(-2.1);
for(let i=0;i<=8400;i++){
  const u=-2.1+i*.0005,p=trackPoint(u);
  if(i)arc+=Math.hypot(p.x-last.x,p.y-last.y);
  arcTable.push({u,arc,...p});last=p;
}
const middle=arcTable[4200].arc;
function arcAt(u){const f=clamp((u+2.1)/.0005,0,8400),i=Math.min(8399,Math.floor(f));return arcTable[i].arc+(arcTable[i+1].arc-arcTable[i].arc)*(f-i)-middle;}
function pointAt(s){
  const target=s+middle;let lo=0,hi=8400;
  while(hi-lo>1){const mid=(hi+lo)>>1;if(arcTable[mid].arc<target)lo=mid;else hi=mid;}
  const t=clamp((target-arcTable[lo].arc)/(arcTable[hi].arc-arcTable[lo].arc),0,1);
  const u=arcTable[lo].u+t*.0005;return {u,...trackPoint(u)};
}
export function contactForCenterX(x){let lo=-2,hi=2;for(let i=0;i<35;i++){const mid=(lo+hi)/2;if(trackPoint(mid).x<x)lo=mid;else hi=mid;}return (lo+hi)/2;}

export class RollingExperiment {
  constructor(){this.mass=.5;this.radius=BALL_RADIUS;this.inertiaRatio=2/5;this.reset(-1.7);}
  reset(u=-1.7,resistance=false){
    this.resistance=resistance;this.time=0;this.s=arcAt(clamp(u,-2,2));this.startS=this.s;
    this.speed=0;this.heat=0;this.crossedBottom=false;this.initialEnergy=this.mass*G*(pointAt(this.s).y-trackPoint(0).y);
  }
  step(dt){
    let remaining=dt;
    while(remaining>1e-10){
      const h=Math.min(remaining,1/480),previous=this.s,b=this.resistance?.18:0;
      const next=rk4([this.s,this.speed,this.heat],h,([s,v])=>[v,(-this.mass*G*pointAt(s).sin-b*v)/(this.mass*(1+this.inertiaRatio)),b*v*v]);
      [this.s,this.speed,this.heat]=next;this.time+=h;remaining-=h;
      if(previous*this.s<=0&&this.time>.01)this.crossedBottom=true;
    }
    return this.snapshot();
  }
  snapshot(){
    const p=pointAt(this.s),height=p.y-trackPoint(0).y;
    const translational=.5*this.mass*this.speed*this.speed,rotational=this.inertiaRatio*translational;
    const potential=this.mass*G*height,kinetic=translational+rotational;
    return {...p,height,initialHeight:this.initialEnergy/(this.mass*G),speed:Math.abs(this.speed),signedSpeed:this.speed,angle:-(this.s-this.startS)/this.radius,potential,translational,rotational,kinetic,thermal:this.heat,total:potential+kinetic+this.heat,initial:this.initialEnergy,time:this.time,crossedBottom:this.crossedBottom,phase:'rolling'};
  }
}

// All contact dimensions are also used to build the visible apparatus.
export const SPRING_GEOMETRY = Object.freeze({
  ballRadius:.16,
  base:Object.freeze({minX:-2.55,maxX:2.55,top:.05,thickness:.10,depth:1.5}),
  pad:Object.freeze({minX:-.95,maxX:2.50,top:.095,thickness:.045,depth:1.32}),
  rail:Object.freeze({length:1.96,radius:.064,width:.728,scale:1.4}),
  origin:Object.freeze({x:-1.95,y:.2}),
});
export const LAUNCH = Object.freeze({mass:.06,k:14,theta:1,originX:SPRING_GEOMETRY.origin.x,originY:SPRING_GEOMETRY.origin.y,normal:SPRING_GEOMETRY.rail.radius+SPRING_GEOMETRY.ballRadius,freeQ:1.42,muzzle:SPRING_GEOMETRY.rail.length,floor:SPRING_GEOMETRY.base.top+SPRING_GEOMETRY.ballRadius});
export const compressionFor = amount => .12+.30*clamp(amount,.15,1);
const C=Math.cos(LAUNCH.theta),S=Math.sin(LAUNCH.theta),R=LAUNCH.normal;
function railPoint(q,n=R){return {x:LAUNCH.originX+q*C-n*S,y:LAUNCH.originY+q*S+n*C};}
function railCoordinates(x,y){const dx=x-LAUNCH.originX,dy=y-LAUNCH.originY;return {q:dx*C+dy*S,n:-dx*S+dy*C};}
export function springRailClearance(x,y){const p=railCoordinates(x,y);return Math.hypot(p.q-clamp(p.q,0,LAUNCH.muzzle),p.n)-R;}
function ballistic(d,t){return {x:d.x+d.vx*t,y:d.y+d.vy*t-.5*G*t*t,vx:d.vx,vy:d.vy-G*t};}
function descendingTime(d,y){const disc=d.vy*d.vy+2*G*(d.y-y);return disc<0?Infinity:(d.vy+Math.sqrt(disc))/G;}
function flightEvent(d){
  const surfaces=[['pad',SPRING_GEOMETRY.pad],['base',SPRING_GEOMETRY.base]];
  let event={time:Infinity,kind:null};
  for(const [kind,g]of surfaces){const time=descendingTime(d,g.top+SPRING_GEOMETRY.ballRadius),p=ballistic(d,time);if(time>1e-8&&p.x>=g.minX&&p.x<=g.maxX&&time<event.time)event={time,kind};}
  // The two-dimensional rail is a capsule. Its rounded end is visible, too.
  // Locate the first return contact, including the very short flights at the lip.
  const end=Math.min(event.time,3),count=Math.max(1,Math.ceil(end*2400));
  let previous=0;
  for(let i=1;i<=count;i++){
    const t=end*i/count,p=ballistic(d,t);
    if(springRailClearance(p.x,p.y)<-1e-10){
      let lo=previous,hi=t;
      for(let j=0;j<38;j++){const mid=(lo+hi)/2,p=ballistic(d,mid);if(springRailClearance(p.x,p.y)<0)hi=mid;else lo=mid;}
      const time=(lo+hi)/2;if(time<event.time)event={time,kind:'rail'};break;
    }
    previous=t;
  }
  return event;
}
export class SpringExperiment {
  constructor(){this.reset(.65);}
  reset(amount=.65){
    this.amount=amount;this.compression=compressionFor(amount);this.q=LAUNCH.freeQ-this.compression;
    this.v=0;this.phi=0;this.time=0;this.phase='rail';this.airTime=0;this.launched=false;this.thermal=0;this.contact=null;this.returnedToRail=false;
    const p=railPoint(this.q);this.x=p.x;this.y=p.y;
    this.initialEnergy=.5*LAUNCH.k*this.compression**2+LAUNCH.mass*G*(p.y-LAUNCH.floor);
    this.launchData=this.prediction();this.canLaunch=!!this.launchData;this.initial=this.snapshot();
  }
  // Reconstruct the first physically reachable free-flight apex from a full reset.
  // This is used by director replay after another experiment has replaced the state.
  resetToApex(amount=.65){
    this.reset(amount);
    if(!this.canLaunch)throw new RangeError('This compression does not reach a free-flight apex.');
    const limit=3;
    while(this.time<limit&&this.phase!=='landed'){
      if(this.phase==='flight'){
        const d=this.launchData;
        if(d.apexTime>=this.airTime&&d.apexTime<d.event.time-1e-10){
          // Free flight is analytic; no contact lies between this state and the apex.
          this.time+=d.apexTime-this.airTime;this.airTime=d.apexTime;
          return this.snapshot();
        }
      }
      this.step(1/600);
    }
    throw new RangeError('The ball contacts the apparatus before a free-flight apex is reached.');
  }
  prediction(){
    const p=railPoint(LAUNCH.muzzle),ke=this.initialEnergy-this.thermal-LAUNCH.mass*G*(p.y-LAUNCH.floor);
    if(ke<=0)return null;
    const speed=Math.sqrt(2*ke/LAUNCH.mass);
    // At a rounded lip a slow ball remains in contact, turns, and slides back.
    if(speed*speed/R<=G*C)return null;
    const d={...p,speed,vx:speed*C,vy:speed*S,apexTime:speed*S/G};
    d.event=flightEvent(d);d.duration=d.event.time;return d;
  }
  _rimPoint(phi=this.phi){return railPoint(LAUNCH.muzzle+R*Math.sin(phi),R*Math.cos(phi));}
  _availableSpeed(p,elastic=0){return Math.sqrt(Math.max(0,2*(this.initialEnergy-this.thermal-LAUNCH.mass*G*(p.y-LAUNCH.floor)-elastic)/LAUNCH.mass));}
  _startFlight(p,vx,vy){
    const d={...p,vx,vy,speed:Math.hypot(vx,vy),apexTime:vy/G};d.event=flightEvent(d);d.duration=d.event.time;
    this.launchData=d;this.airTime=0;this.phase='flight';this.contact=null;this.launched=true;
  }
  _railState(q,v,t,compressed){
    if(!compressed)return [q+v*t-.5*G*S*t*t,v-G*S*t];
    const omega=Math.sqrt(LAUNCH.k/LAUNCH.mass),equilibrium=LAUNCH.freeQ-LAUNCH.mass*G*S/LAUNCH.k;
    const a=q-equilibrium,c=Math.cos(omega*t),n=Math.sin(omega*t);
    return [equilibrium+a*c+v/omega*n,-a*omega*n+v*c];
  }
  _advanceRail(h){
    const before=[this.q,this.v],compressed=this.q<LAUNCH.freeQ-1e-11||(this.q<=LAUNCH.freeQ+1e-11&&this.v<=0);
    const next=this._railState(...before,h,compressed);
    if((compressed&&next[0]>LAUNCH.freeQ+1e-11)||(!compressed&&next[0]<LAUNCH.freeQ-1e-11)){
      let lo=0,hi=h;
      for(let i=0;i<36;i++){const mid=(lo+hi)/2,q=this._railState(...before,mid,compressed)[0];if(compressed?q>LAUNCH.freeQ:q<LAUNCH.freeQ)hi=mid;else lo=mid;}
      const used=(lo+hi)/2;this.v=this._railState(...before,used,compressed)[1];this.q=LAUNCH.freeQ;
      const rest=h-used;if(rest>1e-10)this._advanceRail(rest);return;
    }
    [this.q,this.v]=next;
    if(this.q>=LAUNCH.muzzle&&this.v>0){
      let lo=0,hi=h;
      for(let i=0;i<36;i++){const mid=(lo+hi)/2;if(this._railState(...before,mid,compressed)[0]>=LAUNCH.muzzle)hi=mid;else lo=mid;}
      const used=(lo+hi)/2;this.q=LAUNCH.muzzle;
      const p=railPoint(this.q);this.v=this._availableSpeed(p);
      if(this.v*this.v/R>G*C+1e-9)this._startFlight(p,this.v*C,this.v*S);
      else {this.phase='rim';this.phi=0;this.contact='rail';}
      const rest=h-used;if(rest>1e-10)this._advance(rest);
    }
  }
  _advanceRim(h){
    const derivative=([phi,v])=>[v/R,G*Math.sin(phi-LAUNCH.theta)];
    const previous=[this.phi,this.v],next=rk4(previous,h,derivative);
    const normal=([phi,v])=>G*Math.cos(LAUNCH.theta-phi)-v*v/R;
    const returns=next[0]<=0&&next[1]<0,detaches=normal(next)<-1e-9;
    if(returns||detaches){
      let lo=0,hi=h;
      for(let i=0;i<32;i++){const mid=(lo+hi)/2,p=rk4(previous,mid,derivative);if(returns?p[0]<=0:normal(p)<0)hi=mid;else lo=mid;}
      const used=(lo+hi)/2;[this.phi,this.v]=rk4(previous,used,derivative);
      if(returns){this.phi=0;this.q=LAUNCH.muzzle;this.v=-this._availableSpeed(railPoint(this.q));this.phase='rail';this.returnedToRail=true;this.contact='rail';}
      else {const p=this._rimPoint(),speed=this._availableSpeed(p)*Math.sign(this.v);this._startFlight(p,speed*Math.cos(LAUNCH.theta-this.phi),speed*Math.sin(LAUNCH.theta-this.phi));}
      const rest=h-used;if(rest>1e-10)this._advance(rest);
    }else [this.phi,this.v]=next;
  }
  _hitRail(p){
    const a=railCoordinates(p.x,p.y),closest=clamp(a.q,0,LAUNCH.muzzle),dq=a.q-closest;
    const distance=Math.hypot(dq,a.n),nq=dq/distance,nn=a.n/distance;
    const vq=p.vx*C+p.vy*S,vn=-p.vx*S+p.vy*C,normalV=vq*nq+vn*nn;
    this.thermal+=.5*LAUNCH.mass*normalV*normalV;
    this.returnedToRail=true;this.contact='rail';
    if(a.q>=LAUNCH.muzzle-1e-8){
      this.phi=Math.atan2(dq,a.n);if(this.phi<0)this.phi+=Math.PI*2;
      this.v=vq*Math.cos(this.phi)-vn*Math.sin(this.phi);this.phase='rim';
      const point=this._rimPoint();this.v=Math.sign(this.v)*this._availableSpeed(point);
      if(G*Math.cos(LAUNCH.theta-this.phi)-this.v*this.v/R<-1e-8)this._startFlight(point,this.v*Math.cos(LAUNCH.theta-this.phi),this.v*Math.sin(LAUNCH.theta-this.phi));
    }else if(a.n>=0){
      this.q=closest;this.v=vq;this.phase='rail';
      const elastic=.5*LAUNCH.k*Math.max(0,LAUNCH.freeQ-this.q)**2;
      this.v=Math.sign(this.v)*this._availableSpeed(railPoint(this.q),elastic);
    }else {
      const point=railPoint(closest,-R);this._startFlight(point,vq*C,vq*S);
    }
  }
  _advanceFlight(h){
    const d=this.launchData,event=d.event,until=event.time-this.airTime;
    if(until>h){this.airTime+=h;return;}
    this.airTime=event.time;const p=ballistic(d,this.airTime);
    if(event.kind==='rail')this._hitRail(p);
    else {
      this.phase='landed';this.contact=event.kind;this.x=p.x;
      const surface=SPRING_GEOMETRY[event.kind];this.y=surface.top+SPRING_GEOMETRY.ballRadius;
      this.thermal=this.initialEnergy-LAUNCH.mass*G*(this.y-LAUNCH.floor);
    }
    const rest=h-Math.max(0,until);if(rest>1e-9&&this.phase!=='landed')this._advance(rest);
  }
  _advance(h){if(this.phase==='rail')this._advanceRail(h);else if(this.phase==='rim')this._advanceRim(h);else if(this.phase==='flight')this._advanceFlight(h);}
  step(dt){
    let remaining=dt;
    while(remaining>1e-10&&this.phase!=='landed'){
      const h=Math.min(remaining,1/600);remaining-=h;this.time+=h;this._advance(h);
    }
    return this.snapshot();
  }
  snapshot(){
    const c=LAUNCH;let x,y,vx=0,vy=0,elastic=0;
    if(this.phase==='rail'){
      ({x,y}=railPoint(this.q));vx=this.v*C;vy=this.v*S;elastic=.5*c.k*Math.max(0,c.freeQ-this.q)**2;
    }else if(this.phase==='rim'){
      ({x,y}=this._rimPoint());vx=this.v*Math.cos(c.theta-this.phi);vy=this.v*Math.sin(c.theta-this.phi);
    }else if(this.phase==='flight')({x,y,vx,vy}=ballistic(this.launchData,this.airTime));
    else {x=this.x;y=this.y;}
    const potential=c.mass*G*(y-c.floor),kinetic=.5*c.mass*(vx*vx+vy*vy);
    return {x,y,vx,vy,speed:Math.hypot(vx,vy),q:this.q,compression:Math.max(0,c.freeQ-this.q),potential,kinetic,elastic,thermal:this.thermal,total:potential+kinetic+elastic+this.thermal,initial:this.initialEnergy,time:this.time,phase:this.phase,launched:this.launched,atApex:this.phase==='flight'&&this.airTime>=this.launchData.apexTime,canLaunch:this.canLaunch,contact:this.phase==='flight'?null:this.contact,returnedToRail:this.returnedToRail};
  }
  trajectory(){const d=this.launchData;return d?Array.from({length:81},(_,i)=>{const p=ballistic(d,i/80*d.duration);return[p.x,p.y,.02];}):[];}
}
