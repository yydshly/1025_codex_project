/**
 * 观象 · 过程实验室 — independent teaching models, 2026-11-04.
 * No live observations are used. Sources explain the underlying concepts;
 * parameters and reductions below are authored for this prototype.
 */

const TAU = 2 * Math.PI;
const COLORS = ['#6de1e7', '#b7abff', '#ffae6b'];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, value) => {
  const t = clamp((value - a) / Math.max(1e-9, b - a));
  return t * t * (3 - 2 * t);
};
const metric = (label, value, unit) => ({ label, value, unit });
const ORBITAL_PERIOD = 27.321661;
const SOLAR_YEAR = 365.256363;
const SYNODIC_MONTH = 1 / (1 / ORBITAL_PERIOD - 1 / SOLAR_YEAR);

export const SCENARIOS = [
  {
    id: 'orbital', title: '地月与潮汐', eyebrow: '01 / ORBITAL SYSTEM',
    subtitle: '位置、照明与周期，如何共同改变我们看到的月球？',
    duration: SYNODIC_MONTH, unit: '天',
    params: [
      { key: 'distance', label: '月地距离', min: 0.8, max: 1.2, step: 0.01, value: 1, unit: '倍' },
      { key: 'inclination', label: '轨道倾角', min: 0, max: 30, step: 1, value: 5, unit: '°' },
    ],
    sources: [
      { label: 'NASA · 月相与照明', url: 'https://science.nasa.gov/moon/moon-phases/' },
      { label: 'NOAA · 日月位置与潮汐', url: 'https://oceanservice.noaa.gov/education/tutorial_tides/tides06_variations.html' },
    ],
    limitation: '圆轨道教学几何；天体尺寸、距离与倾角可夸张。潮汐值是日月作用的相对幅度指数，不是任一海岸潮位。',
  },
  {
    id: 'volcano', title: '火山内部活动', eyebrow: '02 / VOLCANIC PROCESS',
    subtitle: '从地下积聚、岩浆上升，到喷发与压力释放。',
    duration: 60, unit: '秒',
    params: [
      { key: 'pressure', label: '初始驱动强度', min: 0.3, max: 1.3, step: 0.01, value: 0.9, unit: '指数' },
      { key: 'viscosity', label: '黏度设定', min: 0, max: 1, step: 0.01, value: 0.45, unit: '指数' },
    ],
    sources: [
      { label: 'USGS · 岩浆与地震记录动画', url: 'https://www.usgs.gov/media/videos/volcanic-monitoring-animations-3-earthquakes' },
    ],
    limitation: '归一化的分阶段脚本模型，用于讲解积聚、迁移和释放；没有求解岩浆流体或火山预报。压力与黏度控件不是实测物理量。',
  },
  {
    id: 'quake', title: '地震与波传播', eyebrow: '03 / SEISMIC WAVES',
    subtitle: '从震源到地表，P波与S波怎样先后到达？',
    duration: 60, unit: '秒',
    params: [
      { key: 'magnitude', label: '震级设定', min: 4, max: 8, step: 0.1, value: 6.2, unit: 'Mw' },
      { key: 'depth', label: '震源深度', min: 5, max: 80, step: 1, value: 24, unit: 'km' },
    ],
    sources: [
      { label: 'USGS · 地震波教学', url: 'https://earthquake.usgs.gov/education/shakingsimulations/classroom.php' },
    ],
    limitation: '均匀介质球面波：P波6 km/s、S波3.5 km/s为固定示例值。震级只影响相对能量与振幅，不改变波速。未计算真实场地响应或震害。',
  },
  {
    id: 'typhoon', title: '台风与风场', eyebrow: '04 / CYCLONE FIELD',
    subtitle: '一个移动的理想涡旋，怎样改变某个地点的风？',
    duration: 24, unit: '小时',
    params: [
      { key: 'wind', label: '峰值风速', min: 20, max: 70, step: 1, value: 46, unit: 'm/s' },
      { key: 'radius', label: '最大风半径', min: 50, max: 200, step: 5, value: 100, unit: 'km' },
    ],
    sources: [
      { label: 'NOAA · 热带气旋结构', url: 'https://oceanservice.noaa.gov/facts/cyclone.html' },
    ],
    limitation: '预设路径上的理想Rankine涡旋，气压使用忽略科氏项的旋衡压差简化；云带、雨带为视觉示意，未接入天气观测或预报。',
  },
  {
    id: 'river', title: '河流与污染物', eyebrow: '05 / RIVER TRANSPORT',
    subtitle: '水流带走污染物，混合又怎样改变它的浓度？',
    duration: 2400, unit: '秒',
    params: [
      { key: 'flow', label: '平均流速', min: 0.2, max: 2, step: 0.05, value: 0.8, unit: 'm/s' },
      { key: 'diffusion', label: '纵向弥散系数', min: 5, max: 80, step: 1, value: 25, unit: 'm²/s' },
    ],
    sources: [
      { label: 'USGS · 一维溶质输运原理', url: 'https://water.usgs.gov/software/OTIS/' },
    ],
    limitation: '独立实现的一维高斯平流—弥散解析解，非OTIS程序结果。固定1 kg瞬时源、20 m²截面、初始宽度20 m；不含反应、支流、吸附或治理效果。',
  },
  {
    id: 'battery', title: '电池与能量', eyebrow: '06 / ELECTRO-THERMAL',
    subtitle: '电流带来输出，也带来损耗和温升。',
    duration: 1800, unit: '秒',
    params: [
      { key: 'current', label: '放电电流', min: 0.5, max: 4, step: 0.1, value: 2.4, unit: 'A' },
      { key: 'cooling', label: '等效散热热导', min: 0.1, max: 1, step: 0.05, value: 0.2, unit: 'W/K' },
    ],
    sources: [
      { label: 'SAM · 电压与电池热模型', url: 'https://samrepo.nlr.gov/help/battery_storage_btm.html' },
    ],
    limitation: '假想2 Ah单体：线性开路电压、0.08 Ω内阻、80 J/K热容、25 ℃环境。简化恒流放电与集总散热，不代表某款电芯、内部温度分布或安全验证。',
  },
];

const BY_ID = new Map(SCENARIOS.map(scenario => [scenario.id, scenario]));

function readInputs(id, values = {}) {
  const scenario = BY_ID.get(id);
  if (!scenario) throw new RangeError(`Unknown scenario: ${String(id)}`);
  return Object.fromEntries(scenario.params.map(parameter => {
    const candidate = Number(values?.[parameter.key]);
    const value = values?.[parameter.key] == null || !Number.isFinite(candidate) ? parameter.value : candidate;
    return [parameter.key, clamp(value, parameter.min, parameter.max)];
  }));
}

function orbital(progress, p) {
  const days = progress * SYNODIC_MONTH;
  const angle = TAU * days / ORBITAL_PERIOD;
  const sunAngle = TAU * days / SOLAR_YEAR;
  const inclination = p.inclination * Math.PI / 180;
  const relativeAngle = angle - sunAngle;
  const phase = progress === 1 ? 0 : progress;
  const dot = Math.cos(angle) * Math.cos(sunAngle) + Math.sin(angle) * Math.cos(inclination) * Math.sin(sunAngle);
  const illumination = clamp((1 - dot) / 2);
  const lunar = Math.pow(1 / p.distance, 3);
  const solar = 0.46;
  const tideIndex = Math.sqrt(lunar * lunar + solar * solar + 2 * lunar * solar * Math.cos(2 * relativeAngle));
  const names = ['新月附近', '娥眉月', '上弦附近', '盈凸月', '满月附近', '亏凸月', '下弦附近', '残月'];
  const phaseName = names[Math.floor((phase + 1 / 16) * 8) % 8];
  return {
    metrics: [metric('可见受光比例', illumination * 100, '%'), metric('月地距离', p.distance * 384400, 'km'), metric('相对潮汐幅度', tideIndex, '指数')],
    phase: phaseName,
    explanation: `${phaseName}：当前看到的亮面由太阳照明与观察方向共同决定。相对潮汐指数同时考虑日月方向；它不等于海岸的潮位。`,
    scene: { angle, rotation: days * TAU, phase, illumination, distance: p.distance, inclination, tideIndex, sunAngle, elapsedDays: days },
  };
}

function volcano(progress, p) {
  const onset = clamp(0.5 + 0.17 * p.viscosity - 0.1 * (p.pressure - 0.8), 0.3, 0.8);
  const ascent = smooth(0.06, onset, progress);
  const released = smooth(onset, onset + 0.14, progress);
  const ending = 1 - smooth(0.86, 1, progress);
  const pressure = Math.max(0, (0.16 + p.pressure * 0.86 * ascent) * (1 - released * 0.66));
  const rise = clamp(ascent * (0.85 + 0.15 * released));
  const magmaFlow = clamp(released * (1 - 0.55 * p.viscosity) * (0.45 + p.pressure * 0.45) * ending);
  const plume = clamp(released * (0.35 + p.pressure * 0.5) * (0.7 + p.viscosity * 0.3) * (0.5 + ending * 0.5));
  const ash = clamp(plume * (0.35 + p.viscosity * 0.65));
  const phase = progress < 0.18 ? '地下积聚' : progress < onset ? '岩浆上升' : progress < 0.86 ? '喷发与释放' : '活动减弱';
  return {
    metrics: [metric('积聚程度', pressure, '指数'), metric('上升进度', rise * 100, '%'), metric('喷发强度', magmaFlow * 100, '%')],
    phase,
    explanation: `${phase}。改变驱动强度或黏度会改变脚本模型的上升、释放时机和表现强度；这些归一化参数不用于判断真实火山是否喷发。`,
    scene: { pressure, rise, plume, ash, magmaFlow, onset, released },
  };
}

function quake(progress, p) {
  const waveAge = progress * 60;
  const vp = 6;
  const vs = 3.5;
  const frontP = Math.sqrt(Math.max(0, Math.pow(vp * waveAge, 2) - p.depth * p.depth));
  const frontS = Math.sqrt(Math.max(0, Math.pow(vs * waveAge, 2) - p.depth * p.depth));
  const ruptureDuration = 2.5 * Math.pow(10, 0.3 * (p.magnitude - 5));
  const release = smooth(0, ruptureDuration, waveAge);
  const energy = Math.pow(10, 1.5 * (p.magnitude - 6)) * release;
  const slip = Math.pow(10, 0.5 * (p.magnitude - 6)) * release;
  const arrivals = { p: p.depth / vp, s: p.depth / vs };
  const phase = waveAge === 0 ? '震源启动' : waveAge < arrivals.p ? '波在地下传播' : waveAge < arrivals.s ? 'P波先到地表' : 'P波与S波扩展';
  return {
    metrics: [metric('P波地表半径', frontP, 'km'), metric('S波地表半径', frontS, 'km'), metric('相对释放能量', energy, '倍')],
    phase,
    explanation: `${phase}。在这个均匀介质模型中，震中P波约${arrivals.p.toFixed(1)}秒到达、S波约${arrivals.s.toFixed(1)}秒到达；能量以Mw6为1。更深震源会推迟到达，震级不会改变设定波速。`,
    scene: { frontP, frontS, slip, energy, depth: p.depth, waveAge, arrivals, vp, vs, ruptureDuration, magnitude: p.magnitude },
  };
}

const cycloneTrack = t => ({ x: 0.17 + 0.68 * t, y: 0.72 - 0.46 * t + 0.08 * Math.sin(Math.PI * t), t });
const TRACK = Array.from({ length: 25 }, (_, index) => cycloneTrack(index / 24));

function typhoon(progress, p) {
  const position = cycloneTrack(progress);
  const intensity = 0.68 + 0.32 * Math.sin(Math.PI * progress);
  const wind = p.wind * intensity;
  // Ideal Rankine vortex, constant air density; not a weather solver.
  const pressure = 1010 - 1.15 * wind * wind / 100;
  const station = { x: 0.61, y: 0.41 };
  const stationDistance = Math.hypot(position.x - station.x, position.y - station.y) * 700;
  const radialFactor = stationDistance <= p.radius ? stationDistance / p.radius : p.radius / Math.max(1, stationDistance);
  const localWind = wind * radialFactor;
  const rain = clamp(localWind / Math.max(1, p.wind));
  const phase = progress < 0.3 ? '风场接近' : progress < 0.72 ? '观测点附近经过' : '风场逐渐远离';
  return {
    metrics: [metric('当前最大风速', wind, 'm/s'), metric('理想中心气压', pressure, 'hPa'), metric('标记点风速', localWind, 'm/s')],
    phase,
    explanation: `${phase}。标记点风速随它与移动风眼的距离变化，最大风不在风眼中心。路径、涡旋和云带均为理想设定，不是实际台风。`,
    scene: { cx: position.x, cy: position.y, radius: p.radius, wind, pressure, rain, rotation: TAU * 4 * progress, track: TRACK, station, localWind, stationDistance },
  };
}

// Abramowitz–Stegun approximation, sufficient for the illustrative finite-domain integral.
function erf(value) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  const t = 1 / (1 + 0.3275911 * x);
  const polynomial = (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  return sign * (1 - polynomial * Math.exp(-x * x));
}

function river(progress, p) {
  const seconds = progress * 2400;
  const source = 100;
  const domainLength = 2000;
  const station = 1000;
  const area = 20;
  const massMg = 1e6;
  const center = source + p.flow * seconds;
  const spread = Math.sqrt(20 * 20 + 2 * p.diffusion * seconds);
  // mg/(m²*m) -> mg/m³; divide by 1000 L/m³ to obtain mg/L.
  const peakConcentration = massMg / (area * Math.sqrt(TAU) * spread * 1000);
  const concentration = peakConcentration * Math.exp(-Math.pow(station - center, 2) / (2 * spread * spread));
  const cdf = x => 0.5 * (1 + erf((x - center) / (Math.SQRT2 * spread)));
  const massFraction = clamp(cdf(domainLength) - cdf(0));
  const arrival = (station - source) / p.flow;
  const phase = seconds < arrival * 0.75 ? '羽流向下游移动' : seconds < arrival * 1.25 ? '主体经过监测点' : center < domainLength ? '监测点浓度回落' : '部分质量离开画面';
  return {
    metrics: [metric('羽流中心位置', center, 'm'), metric('1000m处浓度', concentration, 'mg/L'), metric('画面域内质量', massFraction * 100, '%')],
    phase,
    explanation: `${phase}。本模型不发生化学降解：浓度降低可来自弥散或向下游输运；画面只覆盖0–2000m，质量离开画面不等于被消除。`,
    scene: { center, spread, massFraction, concentration, arrival, velocity: p.flow, diffusion: p.diffusion, source, station, domainLength, peakConcentration, elapsedSeconds: seconds, massMg, area },
  };
}

function battery(progress, p) {
  const seconds = progress * 1800;
  const capacityAh = 2;
  const initialSoc = 0.95;
  const resistance = 0.08;
  const thermalCapacity = 80;
  const ambient = 25;
  const stopTime = initialSoc * capacityAh * 3600 / p.current;
  const activeTime = Math.min(seconds, stopTime);
  const soc = clamp(initialSoc - p.current * activeTime / (capacityAh * 3600));
  const exhausted = seconds >= stopTime;
  const current = exhausted ? 0 : p.current;
  const ocv = 3 + 1.2 * soc;
  const voltage = Math.max(0, ocv - current * resistance);
  const heatingAtStop = p.current * p.current * resistance / p.cooling * (1 - Math.exp(-p.cooling * activeTime / thermalCapacity));
  const excessTemperature = heatingAtStop * Math.exp(-p.cooling * Math.max(0, seconds - stopTime) / thermalCapacity);
  const temp = ambient + excessTemperature;
  const loss = current * current * resistance;
  const power = voltage * current;
  const phase = exhausted ? '电量耗尽，停止放电' : seconds < 120 ? '恒流放电启动' : soc < 0.2 ? '剩余电量较低' : '放电与散热同时进行';
  return {
    metrics: [metric('剩余电量', soc * 100, '%'), metric('端电压', voltage, 'V'), metric('集总温度', temp, '℃')],
    phase,
    explanation: `${phase}。输出功率${power.toFixed(1)}W，内阻损耗${loss.toFixed(2)}W；增强散热可降低模型温升，不能据此评估真实电芯的安全状态。`,
    scene: { soc, current, voltage, temp, ocv, power, loss, requestedCurrent: p.current, cooling: p.cooling, exhausted, elapsedSeconds: seconds, stopTime, ambient, capacityAh, resistance, thermalCapacity },
  };
}

const MODELS = { orbital, volcano, quake, typhoon, river, battery };

export function compute(id, progress = 0, values = {}) {
  const inputs = readInputs(id, values);
  const numeric = Number(progress);
  const t = clamp(Number.isFinite(numeric) ? numeric : 0);
  return MODELS[id](t, inputs);
}

export function sampleSeries(id, values = {}, steps = 80) {
  const count = Math.round(clamp(Number.isFinite(Number(steps)) ? Number(steps) : 80, 2, 512));
  const samples = Array.from({ length: count + 1 }, (_, index) => ({ x: index / count, data: compute(id, index / count, values) }));
  return samples[0].data.metrics.map((item, metricIndex) => ({
    label: item.label,
    unit: item.unit,
    color: COLORS[metricIndex],
    points: samples.map(sample => ({ x: sample.x, y: sample.data.metrics[metricIndex].value })),
  }));
}
