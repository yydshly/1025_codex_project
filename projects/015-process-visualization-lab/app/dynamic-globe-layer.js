import * as THREE from './vendor/three.module.js';
import {stormCoastline} from './storm-geography.js';
import {createSyncCloudLayer} from './sync-cloud-layer.js';
import {observedCloudComparison} from './observed-cloud-comparison.js';
import {latLonToVector} from './globe-effects.js';
import {longitudeRegistration,stationScale,waveformSegments} from './dynamic-data.js';
import {createQuakeMotionView} from './quake-motion-view.js';
import {createQuakeStationInstrument} from './quake-station-instrument.js';
import {createDixieMapSymbols} from './dixie-map-symbols.js';

/** Measured imagery and station waveform glyphs. No simulated propagation field. */
export function createDynamicGlobeLayer(radius,labelHost){
 const group=new THREE.Group();group.visible=false;group.name='observed-event-process';
 const leaders=document.createElementNS('http://www.w3.org/2000/svg','svg');leaders.setAttribute('class','dynamic-geo-leaders');leaders.setAttribute('width','100%');leaders.setAttribute('height','100%');leaders.setAttribute('aria-hidden','true');Object.assign(leaders.style,{position:'absolute',inset:'0',pointerEvents:'none',overflow:'visible'});labelHost.appendChild(leaders);
 const quakeMotion=createQuakeMotionView(labelHost);
 let fireSymbols=null;
 const clouds=createSyncCloudLayer(radius+.002);group.add(clouds.group);
 const marks=new THREE.Group();group.add(marks);let data=null,registration=null,shown=false,labels=[],stations=[],snapshotRequest=0;
 const instrument=createQuakeStationInstrument();group.add(instrument.group);
 let quakeGuide=false;
 const pathMaterial=new THREE.LineBasicMaterial({color:'#ffd29a',transparent:true,opacity:.9,depthWrite:false,toneMapped:false});
 const compactCounts=new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1});
 let path=null,center=null,stormCoast=null,stormTrail=null,quakeEpicenter=null,selectedStation=null,lastQuakeSnapshot=null;
 function configureCloudFocus(){
  // The patch is rotated by registration.origin: focus must use the SAME local coordinates.
  clouds.setFocusRegion(data?.kind==='volcano'&&registration?{lat:data.focus.lat,lon:data.focus.lon-registration.origin,innerKm:400,outerKm:600}:null);
 }
 function compareCloud(frame){
  const missing=data.missingTimesUtc??data.missingOriginalScans?.map(record=>record.timeUtc);
  return observedCloudComparison(data.frames,frame,data.kind,missing);
 }
 function release(){for(const object of [...marks.children]){object.geometry?.dispose();if(object.material!==pathMaterial)object.material?.dispose();marks.remove(object);}for(const item of labels){item.el.remove();item.link.remove();}labels=[];stations=[];path=null;center=null;stormCoast=null;stormTrail=null;quakeEpicenter=null;clouds.clear();quakeMotion.setStation(null);fireSymbols?.set([],[]);}
 function label(text,position,color,geography=false){const el=document.createElement('span');el.className=geography?'dynamic-geo-label storm-geography-label':'dynamic-geo-label';el.textContent=text;el.style.color=color;el.hidden=true;labelHost.appendChild(el);const link=document.createElementNS('http://www.w3.org/2000/svg','line');link.setAttribute('stroke',color);link.setAttribute('stroke-width','.7');link.setAttribute('stroke-opacity','.5');link.style.display='none';leaders.appendChild(link);const item={el,position,link,geography};labels.push(item);return item;}
 function setData(next){++snapshotRequest;release();instrument.setWindow(null);registration=null;data=next;lastQuakeSnapshot=null;if(!next)return;selectedStation=next.stations?.[0]?.id??null;
  if(next.kind!=='quake'){
   registration=longitudeRegistration(next.bbox);clouds.group.rotation.y=registration.origin*Math.PI/180;configureCloudFocus();
   if(next.kind==='wildfire'){clouds.setPresentation('raw');return;}
   center=new THREE.Mesh(new THREE.SphereGeometry(.005,12,8),new THREE.MeshBasicMaterial({color:next.kind==='volcano'?'#ffba82':'#8fe2ef',depthTest:true}));
   center.position.copy(latLonToVector(next.focus.lat,next.focus.lon,radius+.02));marks.add(center);
   label(next.kind==='volcano'?'汤加 · 喷发位置':'轩岚诺 · 官方分析中心',center.position.clone(),next.kind==='volcano'?'#ffba82':'#8fe2ef');
   path=new THREE.Line(new THREE.BufferGeometry(),pathMaterial);marks.add(path);path.frustumCulled=false;path.renderOrder=10;
   if(next.kind==='storm'){
    const segments=stormCoastline.flatMap(line=>line.slice(1).flatMap((point,i)=>[line[i],point]))
     .map(([lon,lat])=>latLonToVector(lat,lon,radius+.011));
    stormCoast=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segments),
     new THREE.LineBasicMaterial({color:'#e7ede9',transparent:true,opacity:.84,depthWrite:false,toneMapped:false}));
    stormCoast.name='natural-earth-coastline';stormCoast.renderOrder=9;marks.add(stormCoast);
    stormTrail=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:'#ffd29a',size:7,sizeAttenuation:false,depthWrite:false,toneMapped:false,transparent:true}));
    stormTrail.name='jma-analysis-positions';stormTrail.frustumCulled=false;stormTrail.renderOrder=11;marks.add(stormTrail);
    label('济州岛',latLonToVector(33.39,126.55,radius+.014),'#e7ede9',true);
    label('朝鲜半岛南岸',latLonToVector(34.82,127.87,radius+.014),'#e7ede9',true);
   }
   if(next.kind==='volcano'){
    const lat=next.focus.lat*Math.PI/180,lon=next.focus.lon*Math.PI/180,distance=300/6371.0088,points=[];
    for(let i=0;i<=144;i++){const bearing=i/144*Math.PI*2,a=Math.asin(Math.sin(lat)*Math.cos(distance)+Math.cos(lat)*Math.sin(distance)*Math.cos(bearing)),b=lon+Math.atan2(Math.sin(bearing)*Math.sin(distance)*Math.cos(lat),Math.cos(distance)-Math.sin(lat)*Math.sin(a));points.push(latLonToVector(a*180/Math.PI,b*180/Math.PI,radius+.017));}
    const boundary=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:'#e9cb97',transparent:true,opacity:.7,dashSize:.012,gapSize:.008,depthWrite:false}));boundary.computeLineDistances();marks.add(boundary);label('300 km · 固定统计范围',points[24].clone(),'#e9cb97');
   }
  }else{
   for(const station of next.stations){
    const base=latLonToVector(station.lat,station.lon,radius+.018),normal=base.clone().normalize();
    const needle=new THREE.Line(new THREE.BufferGeometry().setFromPoints([base,base.clone()]),new THREE.LineBasicMaterial({color:'#9ee7ed',transparent:true,opacity:1}));marks.add(needle);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.019,.026,32),new THREE.MeshBasicMaterial({color:'#9ee7ed',transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));ring.position.copy(base);ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);marks.add(ring);
    const trail=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:'#8ebee5',transparent:true,opacity:.8}));trail.frustumCulled=false;marks.add(trail);
    const tag=label(station.id.split('.').slice(0,2).join('.')+' · 波形',base.clone(),'#c8e7fa');
    stations.push({station,base,normal,needle,ring,trail,tag,scale:stationScale(station)});
   }
   quakeEpicenter=new THREE.Mesh(new THREE.RingGeometry(.018,.024,32),new THREE.MeshBasicMaterial({color:'#ffcc87',side:THREE.DoubleSide}));quakeEpicenter.position.copy(latLonToVector(next.focus.lat,next.focus.lon,radius+.012));quakeEpicenter.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),quakeEpicenter.position.clone().normalize());marks.add(quakeEpicenter);label('震中 · M '+next.magnitude,quakeEpicenter.position.clone(),'#ffcc87');
  }
 }
 async function setSnapshot(snapshot){
  if(!data)return false;const token=++snapshotRequest,selectedData=data;
  if(data.kind!=='quake'){
   if(!snapshot.frame){clouds.clear();return false;}configureCloudFocus();
   const frame=snapshot.fireLayer?{...snapshot.frame,url:snapshot.fireLayer}:snapshot.frame;
   const ok=await clouds.setFrame(frame,registration.bounds,data.kind==='wildfire'?null:compareCloud(frame));if(!ok||token!==snapshotRequest||data!==selectedData)return false;
   if(data.kind==='wildfire')return true;
   const record=snapshot.track;center.position.copy(latLonToVector(record?.lat??data.focus.lat,record?.lon??data.focus.lon,radius+.02));labels[0].position.copy(center.position);
   const records=(data.track||[]).filter(r=>Date.parse(r.timeUtc)<=Date.parse(snapshot.timeUtc));path.geometry.dispose();const positions=records.map(r=>latLonToVector(r.lat,r.lon,radius+.014));
   path.geometry=new THREE.BufferGeometry().setFromPoints(positions);
   if(stormTrail){
    stormTrail.geometry.dispose();
    stormTrail.geometry=new THREE.BufferGeometry().setFromPoints(positions);
   }
  }else{
   lastQuakeSnapshot=snapshot;
   const now=Date.parse(snapshot.timeUtc);
   for(const entry of stations){const record=snapshot.stations.find(s=>s.id===entry.station.id)?.sample;const ratio=record?record.value/entry.scale:0;
    const selected=entry.station.id===selectedStation;
    entry.needle.visible=entry.ring.visible=Boolean(record);
    const color=ratio<0?'#b1a1ff':'#7fe7df';entry.needle.material.color.set(color);entry.ring.material.color.set(color);
    const points=[entry.base,entry.base.clone().addScaledVector(entry.normal,Math.abs(ratio)*.22)];entry.needle.geometry.setFromPoints(points);
    entry.needle.material.opacity=selected?0:.8;
    // A 60-second waveform strip beside each station: layout length is not a geographic wavefront.
    const history=waveformSegments(entry.station,snapshot.timeUtc).flat();
    const tangent=new THREE.Vector3(-Math.sin(entry.station.lon*Math.PI/180),0,-Math.cos(entry.station.lon*Math.PI/180)).normalize();
    const north=entry.normal.clone().cross(tangent).normalize();
    const strip=history.map(s=>entry.base.clone()
     .addScaledVector(tangent,(Date.parse(s.timeUtc)-now)/60000*(selected?.58:.32))
     .addScaledVector(north,s.value/entry.scale*(selected?.27:.12))
     .normalize().multiplyScalar(radius+.025));
    entry.trail.geometry.dispose();entry.trail.geometry=new THREE.BufferGeometry().setFromPoints(strip);entry.trail.visible=strip.length>1;
    entry.trail.material.color.set('#8ebee5');entry.trail.material.opacity=selected?0:.30;
    entry.tag.el.textContent=entry.station.id.split('.').slice(0,2).join('.')+(record?' · '+compactCounts.format(record.value):' · 缺测');entry.tag.el.title=record?record.value+' counts · '+snapshot.timeUtc:'缺测';entry.tag.el.style.opacity=selected?'1':'.82';
    if(selected){quakeMotion.setStation(entry.station,data.originUtc,entry.scale);quakeMotion.setSnapshot(snapshot.timeUtc,record);instrument.setWindow(record,entry.scale);}
   }
  }
  return true;
 }
 function project(camera,earthRoot,width,height){
  let quakeCard=null;
  const nearStorm=camera.position.length()<radius+2;
  if(stormCoast)stormCoast.visible=nearStorm;
  if(shown&&data?.kind==='wildfire')fireSymbols?.project(camera,earthRoot,width,height);
  if(data?.kind==='quake'){
   // Location glyphs stay small at the close camera distance and never scale with the measurement.
   const markScale=THREE.MathUtils.clamp((camera.position.length()-radius)/1.4,.09,1);
   for(const entry of stations)entry.ring.scale.setScalar(.62*markScale);
   quakeEpicenter.scale.setScalar(markScale);
   const selected=stations.find(entry=>entry.station.id===selectedStation);
   const world=selected&&earthRoot.localToWorld(selected.base.clone()), projected=world?.clone().project(camera);
   const front=world&&world.clone().normalize().dot(camera.position.clone().sub(world).normalize())>0;
   const onScreen=front&&Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1&&Math.abs(projected.z)<=1;
   instrument.project(shown&&quakeGuide&&onScreen?selected.base:null,camera,earthRoot,height);
   quakeCard=quakeMotion.project(onScreen?{x:(projected.x*.5+.5)*width,y:(.5-projected.y*.5)*height}:null,width,height,quakeGuide);
  }
  const occupied=[];for(const item of labels){const world=earthRoot.localToWorld(item.position.clone()),p=world.clone().project(camera),front=world.clone().normalize().dot(camera.position.clone().sub(world).normalize())>.03;const x=(p.x*.5+.5)*width,y=(-p.y*.5+.5)*height;item.el.hidden=!shown||(item.geography&&!nearStorm)||!front||p.z>1||x<12||x>width-12||y<18||y>height-25;item.link.style.display=item.el.hidden?'none':'';if(item.el.hidden)continue;const bw=item.el.offsetWidth||110,bh=item.el.offsetHeight||24;let lx=Math.max(8,Math.min(width-bw-8,x+10)),ly=Math.max(16,Math.min(height-bh-20,y-18));for(let n=0;n<7&&occupied.some(b=>lx<b.x+b.w+4&&lx+bw+4>b.x&&ly<b.y+b.h+4&&ly+bh+4>b.y);n++)ly=Math.max(16,Math.min(height-bh-20,ly+bh+5));occupied.push({x:lx,y:ly,w:bw,h:bh});item.el.style.left=lx+'px';item.el.style.top=ly+'px';for(const [key,value]of Object.entries({x1:x,y1:y,x2:Math.max(lx,Math.min(lx+bw,x)),y2:Math.max(ly,Math.min(ly+bh,y))}))item.link.setAttribute(key,value.toFixed(2));}
  return quakeCard;
 }
 return {group,setData,setSnapshot,project,setQuakeGuide(value){quakeGuide=value;if(!value)instrument.group.visible=false;},setFireSymbols(readings,sectors){if(data?.kind==='wildfire'){fireSymbols??=createDixieMapSymbols(labelHost,radius);fireSymbols.set(readings,sectors);}},setStoryAnnotations(visible){if(center)center.visible=!visible;},selectStation(id){
  if(selectedStation===id)return;
  selectedStation=id;if(!stations.some(entry=>entry.station.id===id)){quakeMotion.setStation(null);instrument.setWindow(null);}if(lastQuakeSnapshot)void setSnapshot(lastQuakeSnapshot);
 },setVisible(value){shown=Boolean(value);group.visible=shown;clouds.setVisible(shown);quakeMotion.setVisible(shown);leaders.style.display=shown?'':'none';if(!shown){++snapshotRequest;clouds.clear();fireSymbols?.set([],[]);for(const item of labels)item.el.hidden=true;}},preload(frames){return registration?clouds.preload(frames,registration.bounds,data.kind==='wildfire'?[]:frames.map(compareCloud)):Promise.resolve([]);},getCloudComparison:clouds.getComparison,setPresentation(mode){clouds.setPresentation(data?.kind==='wildfire'?'raw':mode);},setRelief(value){clouds.setRelief(value);},light(light,camera){clouds.setLightDirection(clouds.group.worldToLocal(light.clone()).normalize());clouds.setViewDirection(clouds.group.worldToLocal(camera.clone()).normalize());}};
}
