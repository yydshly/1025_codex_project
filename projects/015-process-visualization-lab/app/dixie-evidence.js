const HOUR = 3600000;
const PDT_OFFSET = 7 * HOUR;
const mphToKmh = 1.609344;
const compass = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
export const toward = from => (from + 180) % 360;
const direction = degrees => compass[Math.round(degrees / 45) % 8];
const localClock = utc => new Date(utc - PDT_OFFSET).toISOString().slice(5, 16).replace('T', ' ');
const localMidnight = date => Date.parse(date + 'T07:00:00Z');
const kmh = mph => (mph * mphToKmh).toFixed(1);
const esc = text => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export const dixieSources = [
 {name:'NWS HADS 地面测站档案 · Iowa Environmental Mesonet',url:'https://mesonet.agron.iastate.edu/DCP/'},
 {name:'USGS 3DEP 高程服务',url:'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer'},
 {name:'LANDFIRE 2016 Remap · 燃料植被原始栅格',url:'https://lfps.usgs.gov/arcgis/rest/services/Landfire_LF2016/LF2016_FVT_CONUS/ImageServer'},
];

export function dixieWeatherWindow(previous, current) {
 const start = localMidnight(previous || current), end = localMidnight(current) + 24 * HOUR;
 return {start, end, lastHour:(end - start) / HOUR - 1};
}

export function dixieWindAt(stations, hourUtc) {
 return stations.map(station => {
  const sample = station.samples.find(row => {
   const time = Date.parse(row[0]);
   return time >= hourUtc && time < hourUtc + HOUR;
  });
  return {...station, sample};
 });
}

function windPlot(readings, start, end, selected) {
 const series = readings.map(station => ({...station, points:station.samples.filter(([stamp]) => {
  const t = Date.parse(stamp);
  return t >= start && t < end;
 })}));
 const max = Math.max(20, Math.ceil(Math.max(...series.flatMap(s => s.points.map(row => row[1] * mphToKmh))) / 10) * 10);
 const x = t => (9 + (t - start) / (end - start) * 212).toFixed(2);
 const y = mph => (65 - mph * mphToKmh / max * 54).toFixed(2);
 const plots = series.map(s => {
  let last = -Infinity;
  const path = s.points.map(([stamp, speed]) => {
   const t = Date.parse(stamp), pen = t - last > HOUR * 1.5 ? 'M' : 'L';
   last = t;
   return pen + x(t) + ',' + y(speed);
  }).join(' ');
  return `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="1.2"/>${s.sample ? `<circle cx="${x(Date.parse(s.sample[0]))}" cy="${y(s.sample[1])}" r="2.9" fill="${s.color}"/>` : ''}`;
 }).join('');
 return `<svg viewBox="0 0 230 84" role="img" aria-label="三个测站的实测风速与所选小时"><path d="M9 65H221 M9 11H221" stroke="#456071" stroke-width=".6"/>
 <rect x="${x(selected)}" y="11" width="${212 * HOUR / (end - start)}" height="54" fill="#f6d5a8" opacity=".32"/>${plots}
 <text x="221" y="9" text-anchor="end">${max} km/h</text><text x="9" y="78">${localClock(start).slice(0,5)}</text><text x="221" y="78" text-anchor="end">${localClock(end - 1).slice(0,5)} PDT</text></svg>`;
}

export function renderDixieWeather(container, context, previous, current, hour) {
 const window = dixieWeatherWindow(previous, current);
 const selected = window.start + hour * HOUR, readings = dixieWindAt(context.stations, selected);
 const clock = localClock(selected);
 container.dataset.windHour = new Date(selected).toISOString();
 container.innerHTML = `<div class="panel-label">附近测站 · 实测风</div>
 <p class="dixie-clock">${clock}–${localClock(selected + HOUR).slice(6)} PDT</p>
 <div class="dynamic-chart dixie-wind-plot">${windPlot(readings, window.start, window.end, selected)}</div>
 <div class="dixie-stations">${readings.map(({id,label,color,sample}) => `<div><b style="color:${color}">${label}</b>
 <small>${id}${sample ? ' · '+localClock(Date.parse(sample[0])).slice(6) : ''}</small>
 <span>${!sample ? '缺测' : !sample[1] ? '静风 · 0 km/h' : `${kmh(sample[1])} km/h · 来自${direction(sample[2])} ${sample[2]}° → 吹向${direction(toward(sample[2]))}`}</span></div>`).join('')}</div>
 <p class="dynamic-frame-note">地图实线箭头起于测站，箭头指向风吹去的方向。各站保留自己的采样时刻。</p>`;
 return readings;
}

export function renderDixieSectors(sectors) {
 if (!sectors.length) return '';
 const largest = Math.max(...sectors.map(s => s.areaKm2));
 return `<section class="dixie-sectors"><h3>地图计算 · 新划入范围</h3>
 <p>以上期边界中心划分四个方位。中位坡度来自 USGS 高程，植被来自火前分类。</p>
 ${sectors.map(s => `<div class="dixie-sector"><b>${s.name} <span>${s.areaKm2} km²</span></b>
 <div class="dixie-bar"><i style="width:${s.areaKm2 / largest * 100}%"></i></div>
 ${s.fuel.length ? `<small title="${esc(s.fuel[0].officialName)}">中位坡度 ${s.medianSlope}° · ${esc(s.fuel[0].label)} ${s.fuel[0].pct}%</small>` : ''}</div>`).join('')}</section>`;
}

export function renderDixieGuide(phase, previous, current, sectors, readings, local) {
 if (!phase) return '';
 const date = previous && phase !== 'location' ? previous + ' → ' + current : current;
 const header = (kind, title) => `<div class="dixie-guide-meta">${kind} <span>${date}</span></div><strong>${title}</strong>`;
 const compared = sectors.filter(s => s.name === '北侧' || s.name === '东侧');
 if (phase === 'location') return header('航空红外制图', '沿金线找到这一期火区');
 if (phase === 'boundary') {
  const gap = (Date.parse(current) - Date.parse(previous)) / 86400000 - 1;
  return header('边界对照', '橙色是新划入的区域') +
   (gap > 0 ? `<p>相邻档案相隔 ${gap + 1} 天，中间缺 ${gap} 天。</p>` : '');
 }
 if (phase === 'wind') {
  const samples = readings.flatMap(s => s.sample ? [s.sample] : []);
  const eastward = samples.filter(([, speed, from]) => speed > 0 && toward(from) > 0 && toward(from) < 180).length;
  return header('附近测站 · 实测', '青蓝实线显示风吹去的方向') +
   `<p>${local} PDT 起一小时 · ${samples.length ? `${samples.length} 站有记录，${eastward} 站有向东分量。` : '该小时缺测。'}</p>`;
 }
 if (compared.length !== 2) return header('地形与植被', '这两期没有分区对照');
 if (phase === 'slope') {
  return header('高程计算 · 中位坡度示意', '东侧新增区的坡度中位数更大') + `<div class="dixie-slope-pair">${compared.map(s => {
   const y = (25 - 100 * Math.tan(s.medianSlope * Math.PI / 180)).toFixed(2);
   return `<div><b>${s.name} ${s.medianSlope}°</b><svg viewBox="0 0 104 28" aria-hidden="true"><path d="M2 25H102" stroke="#78939c" stroke-dasharray="3 3"/><path d="M2 25L102 ${y}" stroke="#ffd29a" stroke-width="2"/></svg></div>`;
  }).join('')}</div>`;
 }
 return header('火前植被分类 · 分区面积占比', '北、东新增区的主要植被不同') +
  `<div class="dixie-fuel-pair">${compared.map(s => `<span>${s.name} ${esc(s.fuel[0].label)} <b>${s.fuel[0].pct}%</b></span>`).join('')}</div><p>这些条件帮助比较两侧，现有记录无法量化各自的贡献。</p>`;
}

export function dixieLayerLegend(context, mode) {
 if (mode === 'terrain') return '<span class="dixie-elevation-key"><i></i>高程 500 → 2,300 米</span><span>阴影突出山脊、坡地与谷地</span>';
 if (mode === 'fuel') return '<span>火前植被</span>' +
  context.fuelKey.map(({code,color,label,officialName}) => `<span title="${code} · ${esc(officialName)}"><i style="background:${color}"></i>${esc(label)}</span>`).join('') +
  `<span><i style="background:${context.fuelOther}"></i>其他类别</span>`;
 return '';
}
