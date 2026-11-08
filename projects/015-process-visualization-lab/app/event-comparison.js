import {validateEventDataset,recordAtIndex} from './real-event-data.js';

const EARTH_RADIUS_KM=6371.0088;
const DEFAULT_REFERENCE=Object.freeze({lat:22.3019,lon:114.1742,label:'香港参照点'});
const radians=degrees=>degrees*Math.PI/180;
const number=value=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:1}).format(value);

function referencePoint(reference){
 if(!reference||!Number.isFinite(reference.lat)||Math.abs(reference.lat)>90||
    !Number.isFinite(reference.lon)||Math.abs(reference.lon)>180){
  throw new RangeError('参照点必须提供合法经纬度');
 }
 return {lat:reference.lat,lon:reference.lon,label:typeof reference.label==='string'&&reference.label.trim()?reference.label:'所选参照点'};
}

function greatCircleKm(a,b){
 const halfLatitude=radians(b.lat-a.lat)/2,halfLongitude=radians(b.lon-a.lon)/2;
 const haversine=Math.sin(halfLatitude)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(halfLongitude)**2;
 return 2*EARTH_RADIUS_KM*Math.asin(Math.sqrt(Math.max(0,Math.min(1,haversine))));
}

const change=(a,b)=>a===null||b===null?null:b-a;
function differenceLabel(value,unit,increase,decrease){
 if(value===null)return '任一时刻缺少数值，无法比较';
 return value===0?'两条记录相同':`${value>0?increase:decrease}${number(Math.abs(value))} ${unit}`;
}

function provenance(dataset,reference){
 return {
  kind:'derived-from-official-center-coordinates',
  label:'根据官方中心坐标计算',
  eventId:dataset.eventId??null,
  source:dataset.source??null,
  sourceDataType:dataset.dataType??null,
  coordinateMethod:'haversine great-circle distance on a sphere',
  earthRadiusKm:EARTH_RADIUS_KM,
  reference,
  referenceScope:'此坐标仅为展示参照点，不宣称是香港天文台总部精确位置；计算距离不能用于验证官方约100公里的最接近距离结论。'
 };
}

/** B minus A for signed changes; positions and measurements remain original records. */
export function compareEventRecords(dataset,aIndex,bIndex,reference=DEFAULT_REFERENCE){
 validateEventDataset(dataset);
 const point=referencePoint(reference),a=recordAtIndex(dataset,aIndex),b=recordAtIndex(dataset,bIndex);
 const elapsedHours=(Date.parse(b.timeUtc)-Date.parse(a.timeUtc))/3600000;
 const windChangeKt=change(a.windKt,b.windKt),pressureChangeHpa=change(a.pressureHpa,b.pressureHpa);
 const centerDisplacementKm=greatCircleKm(a,b);
 const meanTranslationKmh=elapsedHours===0?0:centerDisplacementKm/Math.abs(elapsedHours);
 const referenceDistanceAKm=greatCircleKm(a,point),referenceDistanceBKm=greatCircleKm(b,point);
 const referenceDistanceChangeKm=referenceDistanceBKm-referenceDistanceAKm;
 return {
  a,b,elapsedHours,windChangeKt,pressureChangeHpa,centerDisplacementKm,meanTranslationKmh,
  referenceDistanceAKm,referenceDistanceBKm,referenceDistanceChangeKm,
  provenance:provenance(dataset,point),
  methodNote:'差值按B−A，交换时刻会改变时间和差值的符号。根据官方中心坐标计算球面大圆位移，并以绝对时间间隔计算平均移动速度；位移不是实际累计路程，移动速度不是中心最大持续风速。同一记录的位移和移动速度均为0，缺测不补零。',
  deltaLabels:{
   elapsed:elapsedHours===0?'同一条记录':`B 比 A ${elapsedHours>0?'晚':'早'}${number(Math.abs(elapsedHours))}小时`,
   wind:differenceLabel(windChangeKt,'kt','中心最大持续风速增加','中心最大持续风速减少'),
   pressure:differenceLabel(pressureChangeHpa,'hPa','中心气压升高','中心气压降低'),
   displacement:`两条中心位置相距约${number(centerDisplacementKm)}公里（大圆位移）`,
   translation:elapsedHours===0?'同一时刻，平均移动速度记为0':`按位移与时间间隔估算，平均移动速度约${number(meanTranslationKmh)}公里/小时`,
   reference:referenceDistanceChangeKm===0?`与${point.label}的距离相同`:`B 比 A ${referenceDistanceChangeKm<0?'更接近':'更远离'}${point.label}约${number(Math.abs(referenceDistanceChangeKm))}公里`
  }
 };
}

/** Nearest sampled position, never an interpolated or official closest-approach time. */
export function getReferenceApproach(dataset,reference=DEFAULT_REFERENCE){
 validateEventDataset(dataset);
 const point=referencePoint(reference);
 let index=0,distanceKm=Infinity;
 dataset.records.forEach((record,i)=>{
  const distance=greatCircleKm(record,point);
  if(distance<distanceKm){distanceKm=distance;index=i;}
 });
 const intervals=dataset.records.slice(1).map((record,i)=>(Date.parse(record.timeUtc)-Date.parse(dataset.records[i].timeUtc))/3600000);
 const sampleIntervalHours=intervals.length&&intervals.every(interval=>interval===intervals[0])?intervals[0]:null;
 const sampling=sampleIntervalHours===null?'原始记录':`每${number(sampleIntervalHours)}小时采样的原始记录`;
 return {
  index,record:dataset.records[index],timeUtc:dataset.records[index].timeUtc,distanceKm,sampleIntervalHours,
  provenance:provenance(dataset,point),
  methodNote:`根据官方中心坐标计算：这是${sampling}中距${point.label}最近的一条，不是官方精确最接近时间；未对采样间位置插值。实际最接近可能发生在记录之间，不能据此验证香港天文台约100公里的结论。`,
  label:`已收录记录中最近：距${point.label}约${number(distanceKm)}公里`
 };
}
