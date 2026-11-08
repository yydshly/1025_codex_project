import {formatTime} from './real-event-data.js';

const JMA_URL='https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html';
const JMA_FORMAT='https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/e_format_bst.html';
const HKO_URL='https://www.hko.gov.hk/en/publica/tc/tc2018/section3_5rpt.html';
const number=value=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:1}).format(value);
const signed=value=>value===0?'0':`${value<0?'−':'+'}${number(Math.abs(value))}`;
const wind=value=>value===null?'未报告':`${number(value)} kt（10分钟平均，换算约${number(value*1.852)} km/h）`;
const pressure=value=>value===null?'未报告':`${number(value)} hPa`;
const coordinate=(value,positive,negative)=>`${Math.abs(value)}°${value<0?negative:positive}`;

function headlineFor(comparison,reference){
 if(comparison.elapsedHours===0)return '这是同一条记录，请选择另一个时刻';
 if(comparison.elapsedHours<0)return 'B早于A：仅比较两条记录的数值';
 if(comparison.windChangeKt===null)return '风速资料不完整，不判断中心风速变化';
 const windChange=comparison.windChangeKt,pressureChange=comparison.pressureChangeHpa;
 let strength=windChange<0&&pressureChange>0?'中心减弱':windChange>0&&pressureChange<0?'中心增强':
  windChange<0?'中心风速降低':windChange>0?'中心风速升高':'中心风速未变';
 const place=reference.label==='香港参照点'?'香港':reference.label;
 const distance=comparison.referenceDistanceChangeKm;
 if(Math.abs(distance)<.05)return strength+'，与'+place+'的距离基本相同';
 return strength+(strength==='中心减弱'&&distance<0?'，但离':'，离')+place+(distance<0?'更近':'更远');
}

/** A deterministic evidence summary, without causal or local-impact inference. */
export function buildComparisonReport(dataset,comparison){
 const {a,b}=comparison,reference=comparison.provenance?.reference;
 if(!a||!b||!reference||!Number.isFinite(comparison.elapsedHours))throw new TypeError('比较报告需要有效记录与参照点');
 const headline=headlineFor(comparison,reference);
 const aLine=Number.isInteger(a.sourceLine)?String(a.sourceLine):'未记录';
 const bLine=Number.isInteger(b.sourceLine)?String(b.sourceLine):'未记录';
 const windDifference=comparison.windChangeKt===null?'无法计算（至少一条风速未报告）':`${signed(comparison.windChangeKt)} kt`;
 const pressureDifference=comparison.pressureChangeHpa===null?'无法计算（至少一条气压未报告）':`${signed(comparison.pressureChangeHpa)} hPa`;
 const elapsed=comparison.elapsedHours===0?'A与B为同一时刻':`B比A${comparison.elapsedHours>0?'晚':'早'}${number(Math.abs(comparison.elapsedHours))}小时`;
 const statements=[
  `A：${formatTime(a.timeUtc)}。中心最大持续风速${wind(a.windKt)}；中心气压${pressure(a.pressureHpa)}。`,
  `B：${formatTime(b.timeUtc)}。中心最大持续风速${wind(b.windKt)}；中心气压${pressure(b.pressureHpa)}。`,
  `${elapsed}。仅按B−A计算：风速差${windDifference}；气压差${pressureDifference}。`,
  `根据官方中心坐标计算，A距${reference.label}约${number(comparison.referenceDistanceAKm)}公里，B约${number(comparison.referenceDistanceBKm)}公里；距离差B−A为${signed(comparison.referenceDistanceChangeKm)}公里。`,
  `两条中心位置的大圆位移约${number(comparison.centerDisplacementKm)}公里；${comparison.elapsedHours===0?'同一时刻的平均移动速度记为0':`以绝对时间间隔计算的平均移动速度约${number(comparison.meanTranslationKmh)}公里/小时`}。`,
  `资料：${dataset.eventId??'未记录事件ID'}；JMA源资料修订日${dataset.source?.sourceRevisionDate??'未记录'}；A对应单事件源文件第${aLine}行，B对应第${bLine}行。`,
  `参照点：${reference.label}，${coordinate(reference.lat,'N','S')}，${coordinate(reference.lon,'E','W')}。距离方法为Haversine球面大圆计算，地球半径${comparison.provenance.earthRadiusKm}公里；这些距离和移动速度是坐标推导量，不是测站观测。`
 ];
 const limitations=[
  'JMA最佳路径属于事后分析，不能理解为每个中心位置都有直接仪器测量；风速沿用10分钟平均口径。',
  '大圆位移不是实际累计路程；按位移计算的平均移动速度不等于台风中心最大持续风速，也不代表区间内每一时刻的移动速度。',
  '本报告使用所列参照坐标；默认“香港参照点”不宣称是天文台总部精确位置。上述计算不能用来验证香港天文台报告中的约100公里最接近距离或精确最接近时刻。',
  '中心强度和距离变化不能推出香港当时的测站风速、降雨或灾损。香港天文台报告作为独立影响证据，其中事件峰值没有与B时刻同步。'
 ];
 if(comparison.elapsedHours<0)limitations.push('本次B早于A；上述差值仅比较数值，不表示正时间方向的演变或因果。');
 if(comparison.windChangeKt===null||comparison.pressureChangeHpa===null)limitations.push('缺失值保持“未报告”，对应变化不计算，不补零。');
 if(comparison.elapsedHours===0)limitations.push('同一条记录没有时间变化；请选择另一个时刻再比较。');
 const sources=[
  {label:'JMA官方最佳路径档案',url:JMA_URL},
  {label:'JMA原始字段、单位与UTC格式',url:JMA_FORMAT},
  {label:'香港天文台山竹报告（独立影响证据）',url:HKO_URL}
 ];
 const text=[headline,...statements,...limitations.map(value=>'说明：'+value),...sources.map(source=>source.label+'：'+source.url)].join('\n\n');
 return {headline,statements,limitations,sources,text};
}
