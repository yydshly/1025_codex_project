import * as T from './vendor/three.module.js';
import {labelTexture,tex} from './replica-pages.js';
import {RollingExperiment,SpringExperiment,trackPoint,contactForCenterX,LAUNCH,SPRING_GEOMETRY} from './replica-physics.js';

const ink=new T.LineBasicMaterial({color:0x303830,transparent:true,opacity:.88});
const hatchCanvas=document.createElement('canvas');hatchCanvas.width=256;hatchCanvas.height=256;
const ctx=hatchCanvas.getContext('2d');ctx.fillStyle='#f8f5e9';ctx.fillRect(0,0,256,256);ctx.strokeStyle='#6d7064';ctx.lineWidth=.55;
for(let i=-256;i<512;i+=13){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i-80,256);ctx.stroke();}ctx.globalAlpha=.25;for(let i=0;i<256;i+=43){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(256,i+70);ctx.stroke();}
const hatch=tex(hatchCanvas);hatch.wrapS=hatch.wrapT=T.RepeatWrapping;
const paper=new T.MeshStandardMaterial({color:0xfffdf2,map:hatch,roughness:.95});
const plain=new T.MeshStandardMaterial({color:0xfffbef,roughness:.92});
export const colors=[0x4879ed,0x9251df,0xd65ca6,0xe99740,0x59aa72,0xd35b65,0x65bbcf,0xdcc450];
export const storeNames=['动能','重力势能','弹性势能','内能','化学能','磁场能','静电能','核能'];
export function mesh(geometry,parent,position=[0,0,0],material=paper,outline=true){const m=new T.Mesh(geometry,material);m.position.set(...position);m.castShadow=true;m.receiveShadow=true;if(outline){const e=new T.LineSegments(new T.EdgesGeometry(geometry,27),ink);m.add(e);}parent.add(m);return m;}
export function box(parent,size,pos,mat=paper){return mesh(new T.BoxGeometry(...size),parent,pos,mat);}
export function wire(parent,points,color=0x343b39,closed=false){const geometry=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const l=new (closed?T.LineLoop:T.Line)(geometry,new T.LineBasicMaterial({color,transparent:true,opacity:.9}));parent.add(l);return l;}
export function rod(parent,a,b,r=.025,mat=paper){const av=new T.Vector3(...a),bv=new T.Vector3(...b),mid=av.clone().add(bv).multiplyScalar(.5);const m=mesh(new T.CylinderGeometry(r,r,av.distanceTo(bv),8),parent,mid.toArray(),mat);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return m;}
function torus(parent,r,t,pos,rot=[Math.PI/2,0,0],mat=plain){const m=mesh(new T.TorusGeometry(r,t,6,48),parent,pos,mat,false);m.rotation.set(...rot);return m;}
function ring(parent,r,pos,rot=[Math.PI/2,0,0]){const pts=Array.from({length:73},(_,i)=>new T.Vector3(Math.cos(i/72*Math.PI*2)*r,Math.sin(i/72*Math.PI*2)*r,0));const l=new T.Line(new T.BufferGeometry().setFromPoints(pts),ink);l.position.set(...pos);l.rotation.set(...rot);parent.add(l);return l;}
function sphere(parent,r,pos){const m=mesh(new T.SphereGeometry(r,40,28),parent,pos,plain,false);const silhouette=new T.Mesh(m.geometry,new T.MeshBasicMaterial({color:0x42483e,side:T.BackSide}));silhouette.scale.setScalar(1.009);m.add(silhouette);for(let j=0;j<13;j++){const a=.25+j*.115;const points=Array.from({length:31},(_,i)=>{const t=.38+i/30*2.35,rr=r*1.004;return[rr*Math.sin(t)*Math.cos(a),rr*Math.cos(t),rr*Math.sin(t)*Math.sin(a)];});const l=wire(m,points,0x6a7060);l.material.opacity=.5;}return m;}
function interactive(group,label,action){group.userData.label=label;group.userData.action=action;return group;}
function groupAt(parent,pos=[0,0,0]){const g=new T.Group();g.position.set(...pos);parent.add(g);return g;}
export function makeJar(parent,pos,store,scale=1){const group=groupAt(parent,pos);group.scale.setScalar(scale);const r=.34,h=.98;const glass=new T.MeshPhysicalMaterial({color:0xfafdf6,transparent:true,opacity:.07,roughness:.12,clearcoat:1,clearcoatRoughness:.08,side:T.DoubleSide,depthWrite:false});mesh(new T.CylinderGeometry(r,r,h,48,1,true),group,[0,h/2,0],glass,false).castShadow=false;
 for(const y of [.035,h-.025,h+.025])ring(group,r,[0,y,0]);for(const a of [0,Math.PI])wire(group,[[Math.cos(a)*r,0,Math.sin(a)*r],[Math.cos(a)*r,h,Math.sin(a)*r]]);
 const fill=mesh(new T.CylinderGeometry(r*.92,r*.92,1,48),group,[0,.03,0],new T.MeshStandardMaterial({color:colors[store],emissive:colors[store],emissiveIntensity:.23,roughness:.4,transparent:true,opacity:.9}),false);fill.scale.y=.006;fill.castShadow=false;
 const rim=torus(group,r,.012,[0,h+.012,0],[Math.PI/2,0,0],new T.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.5,roughness:.12,depthWrite:false}));rim.castShadow=false;
 const sheen=wire(group,[[-.2,.18,.274],[-.2,.78,.274],[-.19,.88,.28]],0xffffff);sheen.material.opacity=.65;
 for(let i=1;i<=4;i++){const tick=wire(group,[[.21,i*.19,.267],[.27,i*.19,.211]],0x626d61);tick.material.opacity=.4;}
 const meniscus=torus(group,r*.92,.008,[0,.03,0],[Math.PI/2,0,0],new T.MeshBasicMaterial({color:colors[store],transparent:true,opacity:.6}));meniscus.castShadow=false;
 const tag=mesh(new T.PlaneGeometry(.83,.39),group,[0,.16,.56],new T.MeshBasicMaterial({map:labelTexture(storeNames[store],'0 J'),side:T.DoubleSide}),false);tag.rotation.x=-.4;tag.castShadow=false;
 const glow=new T.PointLight(colors[store],0,2);glow.position.set(0,.25,0);group.add(glow);
 return{group,fill,tag,glow,store,level:0,target:0,labelAge:.1,pending:'0 J',set(level,value){this.target=Math.max(.005,Math.min(.96,level));if(value!==undefined)this.pending=value;},update(dt){this.level=this.instant?this.target:this.level+(this.target-this.level)*(1-Math.exp(-dt*6));this.fill.visible=this.level>.008;this.fill.scale.y=Math.max(.006,this.level);this.fill.position.y=this.level/2+.025;meniscus.visible=this.fill.visible;meniscus.position.y=this.level+.026;this.glow.intensity=this.level*.22;this.labelAge+=dt;if(this.labelAge>.1&&this.value!==this.pending){this.labelAge=0;this.value=this.pending;this.tag.material.map.dispose();this.tag.material.map=labelTexture(storeNames[store],this.value);}}};
}
function shelf(parent,count=3,stores=[1,0,3],eight=false){const jars=[];const x0=eight?1.3:1.65,dx=1.15,top=eight?1.75:(count===4?1.4:.9),z=-1.85;const width=eight?4.5:count*1.15+.1;
 box(parent,[width+.2,.13,.96],[x0+(count-1)*dx/2,top-.13,z]);
 for(const x of [x0-.5,x0+(count-1)*dx+.5])box(parent,[.09,top+(eight?1.35:.95),.92],[x,(top+(eight?1.35:.95))/2-.15,z]);
 stores.forEach((s,i)=>jars.push(makeJar(parent,[x0+i*dx,top-.02,z],s,.9)));
 if(eight){box(parent,[width+.2,.11,.96],[x0+(count-1)*dx/2,.44,z]);for(let i=0;i<4;i++)jars.push(makeJar(parent,[x0+i*dx,.51,z],i+4,.9));}
 return jars;
}
function bicycle(parent,pos){const g=groupAt(parent,pos);const r=.38;for(const x of [-.55,.55]){torus(g,r,.022,[x,r,0],[0,0,0]);ring(g,r*.9,[x,r,.005],[0,0,0]);for(let i=0;i<18;i++){const a=i/18*Math.PI*2;wire(g,[[x,r,0],[x+Math.cos(a)*r,r+Math.sin(a)*r,0]]);}}
 const a=[-.55,r,0],b=[-.18,.86,0],c=[.03,.4,0],d=[.44,.88,0],e=[.55,r,0];for(const[p,q]of [[a,b],[b,c],[c,a],[b,d],[c,d],[d,e]])rod(g,p,q,.018);rod(g,[-.18,.82,0],[-.18,1,0],.018);box(g,[.28,.045,.12],[-.2,1,0]);rod(g,[.44,.85,0],[.4,1.08,0],.02);rod(g,[.4,1.08,-.13],[.4,1.08,.13],.02);for(const z of [-.045,.045]){rod(g,[.44,.88,z],[.55,r,z],.012);rod(g,[-.18,.86,z],[-.55,r,z],.011);}for(const x of [-.55,.55])rod(g,[x,r,-.055],[x,r,.055],.04,plain);torus(g,.1,.009,[.03,.4,.045],[0,0,0]);rod(g,[.03,.4,.07],[.16,.34,.07],.015);box(g,[.1,.025,.1],[.18,.34,.07],plain);wire(g,[[-.55,.38,.05],[.03,.3,.05],[.14,.4,.05],[.03,.5,.05],[-.55,.42,.05]],0x646c60);return g;
}
function mug(parent,pos){const g=groupAt(parent,pos);mesh(new T.CylinderGeometry(.31,.26,.58,32,1,true),g,[0,.32,0],paper,false);mesh(new T.CylinderGeometry(.28,.28,.018,32),g,[0,.56,0],new T.MeshStandardMaterial({color:0xbdb393,roughness:1}),false);for(let i=0;i<12;i++){const a=.18+i/12*Math.PI*.85;wire(g,[[Math.cos(a)*.26,.03,Math.sin(a)*.26],[Math.cos(a)*.31,.6,Math.sin(a)*.31]]);}ring(g,.31,[0,.61,0]);ring(g,.29,[0,.6,0]);torus(g,.2,.035,[.32,.33,0],[0,0,0]);const steam=[];for(let j=0;j<3;j++){const p=Array.from({length:16},(_,i)=>[j*.11-.11+Math.sin(i*.5+j)*.04,.63+i*.027,0]);const l=wire(g,p,0x888c80);l.material.transparent=true;l.material.opacity=.45;steam.push(l);}return{group:g,steam};}
function battery(parent,pos){const g=groupAt(parent,pos);mesh(new T.CylinderGeometry(.19,.19,.73,24),g,[0,.37,0]);mesh(new T.CylinderGeometry(.1,.1,.07,16),g,[0,.77,0]);ring(g,.19,[0,.63,0]);return g;}
function coilLine(parent,points){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,points.length-1,.012,6,false),parent,[0,0,0],new T.MeshStandardMaterial({color:0x525b50,roughness:.75}),false);}
function spring(parent,pos,length=1.05){const g=groupAt(parent,pos);box(g,[length+.35,.08,.42],[length/2,.04,0]);for(const x of [-.08,length+.08])box(g,[.09,.44,.38],[x,.28,0]);const pts=Array.from({length:241},(_,i)=>[i/240*length,.28+Math.sin(i/240*Math.PI*24)*.13,Math.cos(i/240*Math.PI*24)*.13]);const coil=coilLine(g,pts);for(const x of [-.08,length+.08]){const screw=mesh(new T.CylinderGeometry(.025,.025,.015,12),g,[x,.505,0],plain,false);wire(screw,[[-.016,.009,0],[.016,.009,0]],0x4a5147);}return{group:g,coil};}
function magnet(parent,pos){const g=groupAt(parent,pos);box(g,[.45,.12,.18],[-.24,.07,0]);box(g,[.45,.12,.18],[.34,.07,0]);wire(g,[[-.15,.08,-.18],[.05,.12,-.36],[.25,.08,-.18]],0x8a736e);return g;}
export function storesScene(parent,onAction){const root=groupAt(parent),jars=shelf(root,4,[0,1,2,3],true),objects=[];const select=(g,i)=>{interactive(g,storeNames[i],()=>onAction('store',i));objects[i]=g;};
 const bike=bicycle(root,[1.27,0,1.6]);bike.rotation.y=-.17;select(bike,0);
 const stand=groupAt(root,[.55,0,-.45]);box(stand,[.62,.09,.6],[0,.05,0]);box(stand,[.07,1.25,.17],[.22,.67,0]);box(stand,[.68,.07,.55],[0,1.2,0]);box(stand,[.49,.025,.39],[-.05,1.25,0],plain);box(stand,[.46,.08,.35],[-.05,1.3,0],plain);box(stand,[.49,.025,.39],[-.05,1.35,0],plain);for(let j=0;j<4;j++)wire(stand,[[-.28,1.268+j*.018,.178],[.18,1.268+j*.018,.178]],0xa09c89);select(stand,1);
 const sp=spring(root,[1.8,0,-.05],1.05);select(sp.group,2);const cup=mug(root,[2.75,0,1.6]);select(cup.group,3);const cell=battery(root,[3.74,0,1.4]);cell.rotation.z=-.1;select(cell,4);select(magnet(root,[4.25,0,-.02]),5);
 const balloon=groupAt(root,[4.95,0,1.6]);sphere(balloon,.31,[0,.75,0]).scale.y=1.18;wire(balloon,[[0,.4,0],[.04,.23,.02],[0,.1,0]]);box(balloon,[.18,.12,.17],[0,.06,0]);select(balloon,6);
 const sun=groupAt(root,[5.2,2.86,-2.45]);sphere(sun,.28,[0,0,0]);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;wire(sun,[[Math.cos(a)*.35,Math.sin(a)*.35,0],[Math.cos(a)*.5,Math.sin(a)*.5,0]]);}select(sun,7);
 jars.forEach(j=>j.set(0,'图例'));
 const stream=new T.Group();root.add(stream);let streamAge=9,streamCurve=null,streamLine=null;const dots=Array.from({length:10},()=>{const d=new T.Mesh(new T.SphereGeometry(.035,8,6),new T.MeshBasicMaterial({color:0xffbd55}));stream.add(d);return d;});stream.visible=false;
 return{root,jars,objects,pour(i){streamAge=0;stream.visible=true;const from=objects[i].position.clone().add(new T.Vector3(0,.4,0)),to=jars[i].group.position.clone().add(new T.Vector3(0,.85,0));streamCurve=new T.CatmullRomCurve3([from,from.clone().lerp(to,.3).add(new T.Vector3(0,1.2,0)),to.clone().add(new T.Vector3(0,.3,0)),to]);if(streamLine){stream.remove(streamLine);streamLine.geometry.dispose();streamLine.material.dispose();}streamLine=new T.Mesh(new T.TubeGeometry(streamCurve,60,.018,6,false),new T.MeshBasicMaterial({color:colors[i],transparent:true,opacity:.65}));stream.add(streamLine);dots.forEach(d=>d.material.color.set(colors[i]));},update(t,dt,motion=true){jars.forEach(j=>j.update(dt));cup.steam.forEach((l,i)=>{l.rotation.y=Math.sin(t*.5+i)*.3;l.material.opacity=.3+Math.sin(t+i)*.1;});if(motion)streamAge+=dt;stream.visible=streamAge<4;if(stream.visible&&streamCurve)dots.forEach((d,i)=>d.position.copy(streamCurve.getPoint((streamAge*.55+i/10)%1)));},focus(i){const p=new T.Vector3();objects[i].getWorldPosition(p);return p;}};
}
function trackY(x){return .18+.42*x*x;}
export function rampScene(parent,onAction){const root=groupAt(parent),jars=shelf(root),deck=groupAt(root,[3.05,0,1.25]);box(deck,[4.5,.11,1.55],[0,.055,0]);
 const verts=[],idx=[];for(let i=0;i<=80;i++){const x=-2+i/80*4,y=trackY(x);verts.push(x,y,-.48,x,y,.48);if(i<80){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();mesh(geo,deck,[0,0,0],new T.MeshStandardMaterial({map:hatch,roughness:1,side:T.DoubleSide}),false);
 for(const z of [-.48,.48]){wire(deck,Array.from({length:81},(_,i)=>{const x=-2+i/80*4;return[x,trackY(x),z];}));wire(deck,Array.from({length:81},(_,i)=>{const x=-2+i/80*4;return[x,trackY(x)+.26,z];}));for(let i=0;i<=20;i++){const x=-2+i/20*4;rod(deck,[x,trackY(x),z],[x,trackY(x)+.26,z],.006);}}
 for(const x of [-1.8,-1.15,1.15,1.8])for(const z of [-.42,.42])box(deck,[.06,trackY(x),.06],[x,trackY(x)/2,z]);for(let i=0;i<=16;i++){const x=-2+i/16*4;wire(deck,[[x,trackY(x)+.004,-.48],[x,trackY(x)+.004,.48]],0x95998c);}
 const ball=sphere(deck,.24,[-1.7,trackY(-1.7)+.24,0]);interactive(ball,'拖动小球，松开后滚动',()=>onAction('release'));ball.userData.draggable='ramp';
 const physics=new RollingExperiment();jars.forEach(j=>j.instant=true);
 return{root,jars,ball,deck,physics,start:1.7,side:-1,elapsed:0,running:false,friction:false,
 prepare(){physics.reset(this.side*this.start,this.friction);this._key=this.start+'/'+this.side;this.elapsed=0;this.running=false;},
 release(){this.prepare();this.running=true;},
 setFromCenterX(x){const u=contactForCenterX(x);this.side=Math.sign(u)||-1;this.start=Math.max(.3,Math.abs(u));this.prepare();},
 snapshot(){return physics.snapshot();},
 update(t,dt,motion=true){if(!this.running&&this.elapsed===0&&(this._key!==this.start+'/'+this.side||physics.time>0))this.prepare();physics.resistance=this.friction;if(this.running&&motion){physics.step(dt);this.elapsed=physics.time;}const s=physics.snapshot();ball.position.set(s.x,s.y,0);ball.rotation.z=s.angle;[s.potential,s.kinetic,s.thermal].forEach((v,i)=>jars[i].set(v/8,`${v.toFixed(2)} J`));jars.forEach(j=>j.update(dt));},
 focus(){return new T.Vector3(3.05,1.2,.7);}};

}
export function springScene(parent,onAction){const root=groupAt(parent),jars=shelf(root,4,[0,1,2,3]),base=groupAt(root,[3,.05,1.5]);const shape=SPRING_GEOMETRY,rail=shape.rail,pad=shape.pad,baseShape=shape.base;box(base,[baseShape.maxX-baseShape.minX,baseShape.thickness,baseShape.depth],[(baseShape.minX+baseShape.maxX)/2,baseShape.top-baseShape.thickness/2,0]);const barrel=groupAt(base,[LAUNCH.originX,LAUNCH.originY,0]);barrel.rotation.z=LAUNCH.theta;barrel.scale.setScalar(rail.scale);
 box(barrel,[rail.length/rail.scale,rail.radius*2/rail.scale,rail.width/rail.scale],[rail.length/rail.scale/2,0,0]);for(const q of [0,rail.length]){const cap=mesh(new T.CylinderGeometry(rail.radius/rail.scale,rail.radius/rail.scale,rail.width/rail.scale,32),barrel,[q/rail.scale,0,0]);cap.rotation.x=Math.PI/2;}for(const z of [-rail.width/rail.scale/2,rail.width/rail.scale/2])box(barrel,[rail.length/rail.scale,.09,.045],[rail.length/rail.scale/2,.08,z]);box(base,[.16,.65,.4],[-1.1,.31,0]);
 const coil=coilLine(barrel,Array.from({length:241},(_,i)=>[i/240*.9,.16+Math.sin(i/240*Math.PI*28)*.12,Math.cos(i/240*Math.PI*28)*.12]));const ball=sphere(base,shape.ballRadius,[-.7,1,0]);interactive(ball,'压缩弹簧，再松开',()=>onAction('release'));ball.userData.draggable='spring';
 const post=groupAt(base,[.65,0,-.63]);rod(post,[0,0,0],[0,2.5,0],.023);box(post,[.25,.06,.23],[0,.01,0]);
 for(let i=1;i<=4;i++){const h=LAUNCH.floor+i*.5;rod(post,[-.065,h,0],[.065,h,0],.009);const tag=mesh(new T.PlaneGeometry(.35,.14),post,[.27,h,.01],new T.MeshBasicMaterial({map:labelTexture('m',(i*.5).toFixed(1)),side:T.DoubleSide}),false);tag.castShadow=false;}
 box(base,[pad.maxX-pad.minX,pad.thickness,pad.depth],[(pad.minX+pad.maxX)/2,pad.top-pad.thickness/2,0],new T.MeshStandardMaterial({color:0xb5bda7,roughness:1}));
 const velocityArrow=new T.ArrowHelper(new T.Vector3(1,0,0),new T.Vector3(),1,0x5577b2,.13,.07);base.add(velocityArrow);velocityArrow.visible=false;
 let path=null;const physics=new SpringExperiment();jars.forEach(j=>j.instant=true);
 return{root,jars,ball,coil,post,base,physics,start:.65,elapsed:0,running:false,
 prepare(){physics.reset(this.start);this._key=this.start;this.elapsed=0;this.running=false;if(path){path.geometry.dispose();path.material.dispose();base.remove(path);}const points=physics.trajectory();path=points.length?wire(base,points,0x969780):null;if(path){path.material.opacity=.3;path.material.depthWrite=false;}},
 release(){this.prepare();this.running=true;},
 snapshot(){return physics.snapshot();},
 update(t,dt,motion=true){if(!this.running&&this.elapsed===0&&(this._key!==this.start||physics.time>0))this.prepare();if(this.running&&motion){physics.step(dt);this.elapsed=physics.time;}const s=physics.snapshot();ball.position.set(s.x,s.y,0);velocityArrow.visible=s.phase==='flight';if(velocityArrow.visible){velocityArrow.position.set(s.x,s.y+.05,.2);velocityArrow.setLength(Math.abs(s.vx)*.35,.13,.07);}coil.scale.x=s.phase==='rail'?Math.max(.08,Math.min(1,(s.q-.16)/1.26)):1;[s.kinetic,s.potential,s.elastic,s.thermal].forEach((v,i)=>jars[i].set(v/2,`${v.toFixed(2)} J`));jars.forEach(j=>j.update(dt));if(s.phase==='landed')this.running=false;},
 focus(){return new T.Vector3(3,1.3,.8);}};
}
