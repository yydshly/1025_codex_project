export const hungaSurveys = {
 pre:{label:'喷发前', period:'2015–2017 年资料合成', color:'#83f2e5'},
 post:{label:'喷发后', period:'2022 年 4–5 月、8 月航测', color:'#ffd18a'},
};
export const hungaSpots = {west:'西侧坡面', crater:'火山口底部', east:'东侧坡面'};
export const hungaViewLabels={pre:'喷发前地形',post:'喷发后地形',section:'前后剖面',change:'喷发前后测深差值'};
export const hungaVerticalScale = 2.6;
export const hungaChangeStops = [
 [-100,[19,119,157]],[-25,[62,184,210]],[0,[202,212,216]],
 [25,[248,192,116]],[100,[238,115,66]],[950,[170,35,63]],
];
export const hungaChangeMissing = [74,87,112];
const metres=new Intl.NumberFormat('zh-CN',{maximumFractionDigits:1});
let pending;

export function hungaChangeColor(value){
 if(!Number.isFinite(value))return hungaChangeMissing;
 const next=hungaChangeStops.findIndex(([limit])=>value<limit);
 if(next===0)return hungaChangeStops[0][1];
 if(next===-1)return hungaChangeStops.at(-1)[1];
 const [from,low]=hungaChangeStops[next-1],[to,high]=hungaChangeStops[next];
 const mix=(value-from)/(to-from);
 return low.map((channel,i)=>Math.round(channel+(high[i]-channel)*mix));
}

export function hungaChangeLabel(value){
 if(!Number.isFinite(value))return '任一期缺测';
 if(Math.abs(value)<.05)return '变化 0 米';
 return (value>0?'加深 ':'变浅 ')+metres.format(Math.abs(value))+' 米';
}

// Elevations are signed relative to sea level. A lower post-survey elevation
// produces a positive change in water depth.
export function hungaDepthChanges(pre,post){
 let paired=0;
 const values=pre.map((value,i)=>{
  if(!Number.isFinite(value)||!Number.isFinite(post[i]))return NaN;
  paired++;
  return value-post[i];
 });
 return {values,paired};
}

async function read(url,type){
 const response=await fetch(url);
 if(!response.ok)throw new Error('NIWA 测深资料载入失败');
 return response[type]();
}

export function loadHungaTerrain(){
 pending??=(async()=>{
  const meta=await read('data/hunga-terrain.json','json');
  const {cols,rows}=meta.grid;
  const tiles=await Promise.all(['pre','post'].map(key=>read(meta.surveys[key].url,'json')));
  const levels=Object.fromEntries(tiles.map((encoded,i)=>{
   const raw=atob(encoded);
   if(raw.length!==cols*rows*2)throw new Error('NIWA 测深网格长度不符');
   return [i===0?'pre':'post',new Float32Array(cols*rows).map((_,j)=>{
    const lo=raw.charCodeAt(j*2),hi=raw.charCodeAt(j*2+1);
    const value=lo+hi*256-(hi>=128?65536:0);
    return value===-32768?NaN:value*.1;
   })];
  }));
  const change=hungaDepthChanges(levels.pre,levels.post);
  return {...meta,levels:{...levels,change:change.values},paired:change.paired};
 })().catch(error=>{pending=null;throw error;});
 return pending;
}

export function hungaProfile(data,survey){
 const {cols,transect}=data.grid;
 return data.levels[survey].subarray(transect*cols,(transect+1)*cols);
}

export function hungaSample(data,spot){
 const {col}=data.samples.find(sample=>sample.id===spot);
 const {stepM,cols,transect}=data.grid;
 const index=transect*cols+col;
 return {col,distanceKm:(col+.5)*stepM/1000,pre:data.levels.pre[index],post:data.levels.post[index],change:data.levels.change[index]};
}
