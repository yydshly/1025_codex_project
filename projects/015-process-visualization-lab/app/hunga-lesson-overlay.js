import {hungaProfile,hungaSample,hungaVerticalScale} from './hunga-terrain-data.js';
import * as THREE from './vendor/three.module.js';

const ns='http://www.w3.org/2000/svg';
const gridKm=(i,count,step)=>(i+.5-count/2)*step/1000;

function lessonPoints(terrain,beat){
 const {rows,cols,stepM,transect}=terrain.grid;
 const sample=hungaSample(terrain,beat.spot);
 const point=(col,row,elevation)=>new THREE.Vector3(
  gridKm(col,cols,stepM),elevation*hungaVerticalScale/1000+.055,gridKm(row,rows,stepM));
 if(beat.mark==='span')return [point(sample.col,transect,sample.pre),point(sample.col,transect,sample.post)];
 if(beat.mark==='rim'){
  const profile=hungaProfile(terrain,'pre');
  const highPoint=direction=>{
   let best=null;
   for(let distance=1000;distance<=3800;distance+=stepM){
    const col=sample.col+direction*Math.round(distance/stepM);
    if(Number.isFinite(profile[col])&&(best===null||profile[col]>profile[best]))best=col;
   }
   return best===null?null:point(best,transect,profile[best]);
  };
  return [-1,1].map(highPoint).filter(Boolean);
 }
 if(beat.mark==='gap'){
  const {pre,post}=terrain.levels;
  let nearest=null,minDistance=Infinity;
  for(let row=1;row<rows-1;row++){
   for(let col=1;col<cols-1;col++){
    const i=row*cols+col;
    if(!Number.isFinite(pre[i])||[i,i-1,i+1,i-cols,i+cols].some(j=>Number.isFinite(post[j])))continue;
    const distance=(row-transect)**2+(col-sample.col)**2;
    if(distance<minDistance){minDistance=distance;nearest=point(col,row,pre[i]);}
   }
  }
  return nearest?[nearest]:[];
 }
 const level=beat.mode==='pre'?sample.pre:sample.post;
 return Number.isFinite(level)?[point(sample.col,transect,level)]:[];
}

export function createHungaLessonOverlay(host,group){
 const note=document.createElement('aside');
 note.className='hunga-lesson-note';note.hidden=true;
 note.innerHTML='<span>讲解批注</span><strong></strong><p></p>';
 const title=note.querySelector('strong'),detail=note.querySelector('p');
 const svg=document.createElementNS(ns,'svg');
 svg.classList.add('hunga-lesson-lines');svg.setAttribute('aria-hidden','true');
 const rings=[0,1].map(()=>document.createElementNS(ns,'circle'));
 const bracket=document.createElementNS(ns,'path');
 svg.append(bracket,...rings);host.append(svg,note);
 let beat=null,points=[];
 function set(next,terrain){
  if(next===beat)return;
  beat=next;points=beat&&terrain?lessonPoints(terrain,beat):[];
  note.hidden=true;
  svg.style.visibility='hidden';
  if(beat){
   title.textContent=beat.title;
   detail.textContent=beat.detail;
  }
 }
 function render(camera,width,height,arriving){
  note.hidden=!beat||arriving;
  svg.style.visibility=note.hidden?'hidden':'';
  if(note.hidden)return;
  const projected=points.map(point=>{
   const p=group.localToWorld(point.clone()).project(camera);
   if(Math.abs(p.x)>.96||Math.abs(p.y)>.96||Math.abs(p.z)>1)return null;
   return {x:(p.x*.5+.5)*width,y:(.5-p.y*.5)*height};
  });
  const [a,b]=projected;
  bracket.setAttribute('d','');
  if(beat.mark==='span'&&a&&b){
   const x=(a.x+b.x)/2-13;
   bracket.setAttribute('d',`M${a.x} ${a.y}H${x}V${b.y}H${b.x}`);
  }
  rings.forEach((ring,i)=>{
   const p=projected[i];
   ring.style.visibility=p?'':'hidden';
   if(p){
    ring.setAttribute('cx',p.x);ring.setAttribute('cy',p.y);
    ring.setAttribute('r',beat.mark==='span'?4:beat.mark==='gap'?13:9);
   }
  });
 }
 return {set,render};
}
