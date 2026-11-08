// Progress includes the player's chapter tail. The anchors mark spoken phrases
// and select native records. Repeated ticks hold a frame for the next phrase.
const beat = (progress, tick, target, label) => ({ progress, tick, target, label });
const cloudBeat = (progress, tick, target, label, cloudShot, slowScan = false) => ({
  ...beat(progress, tick, target, label), cloudShot, slowScan,
});
function scanSequence(day, times, from, to, target, label, shot) {
  return times.map((time, index) => cloudBeat(
    index === 0 ? from : index === times.length - 1 ? to : from + (to - from) * index / (times.length - 1),
    `${day}T${time}:00Z`, target, label, shot, true,
  ));
}
const matsushiro = 'IU.MAJO.00.BHZ';
const incheon = 'IU.INCN.00.BHZ';
const taipei = 'IU.TATO.00.BHZ';
const quakeBeat = (progress, tick, target, label, quakeShot) => ({...beat(progress,tick,target,label),quakeShot});
const riverBeat = (progress, tick, target, label, riverShot, riverBank) => ({...beat(progress,tick,target,label),riverShot,riverBank});

const volcanoEarly = [cloudBeat(0, '2022-01-15T03:50:00Z', 'coldAreaKm2', '汤加火山周围 · 较早红外扫描', 'volcano-early')];
const scenes = {
  'dixie-2021-airborne-ir': [
    [beat(0, '2021-07-27T00:00:00Z', 'mappedKm2', '从首期航空红外边界认准位置')],
    [
      beat(0, '2021-08-01T00:00:00Z', 'addedKm2', '对照本期与前一期的橙色新增区'),
      beat(.47, '2021-08-04T00:00:00Z', 'addedKm2', '跨过缺档日期，只比较两端制图'),
      beat(.69, '2021-08-06T00:00:00Z', 'addedKm2', '北侧和东侧的橙色区域最大'),
    ],
    [beat(0, '2021-08-06T00:00:00Z', 'dixie-wind', '实线看测站风，虚线看新增方位')],
    [beat(0, '2021-08-06T00:00:00Z', 'dixie-sectors', '看山脊与峡谷，对照北、东侧坡度')],
    [beat(0, '2021-08-06T00:00:00Z', 'dixie-sectors', '边界日期保持一致，切到火前植被')],
  ],
  volcano: [
    [], [], [],
    volcanoEarly,
    [
      ...scanSequence('2022-01-15', ['03:50', '04:00', '04:10'], 0, .22, 'coldAreaKm2', '在固定视角辨认较早的云区', 'volcano-early'),
      cloudBeat(.33, '2022-01-15T04:20:00Z', 'coldAreaKm2', '火山附近出现新低温云区', 'volcano-early', true),
      cloudBeat(.59, '2022-01-15T04:20:00Z', 'p10K', '同一幅扫描 · 看右侧低温统计', 'volcano-early'),
    ],
    [
      ...scanSequence('2022-01-15', ['04:20', '04:30', '04:40'], 0, .18, 'coldAreaKm2', '对着前幅边缘看云团展开', 'volcano-expand'),
      cloudBeat(.27, '2022-01-15T04:50:00Z', 'coldAreaKm2', '固定范围内的低温面积也会回落', 'volcano-expand'),
      ...scanSequence('2022-01-15', ['05:20', '05:30', '05:40', '05:50', '06:00', '06:10'], .34, .84, 'coldAreaKm2', '逐帧看低温区再次展开', 'volcano-expand'),
      cloudBeat(.91, '2022-01-15T06:20:00Z', 'p10K', '右侧统计仍使用同一个三百公里范围', 'volcano-late'),
      cloudBeat(.97, '2022-01-15T07:50:00Z', 'p10K', '末次扫描 · 比较同一范围亮温', 'volcano-late'),
    ],
    [beat(0, '2022-01-15T07:50:00Z', 'p10K', '末次扫描 · 核对亮温和扫描时间')],
  ],
  quake: [
    [
      quakeBeat(0, '2011-03-11T05:45:01Z', 'origin', '金色标记 · 日本东北近海震中', 'quake-tohoku-map'),
      quakeBeat(.26, '2011-03-11T05:45:01Z', matsushiro, '松代 · 先认零线和震前计数', 'quake-matsushiro'),
      quakeBeat(.61, '2011-03-11T05:46:25Z', matsushiro, '发震后首个窗末 · 同一把刻度', 'quake-matsushiro'),
    ],
    [
      quakeBeat(0, '2011-03-11T05:48:30Z', matsushiro, '松代 · 紫色显示负计数', 'quake-matsushiro'),
      quakeBeat(.28, '2011-03-11T05:48:45Z', matsushiro, '松代 · 青色显示正计数', 'quake-matsushiro'),
      quakeBeat(.70, '2011-03-11T05:49:20Z', matsushiro, '金点停在松代本段绝对峰值', 'quake-matsushiro'),
    ],
    [
      quakeBeat(0, '2011-03-11T05:49:20Z', incheon, '仁川 · 切换到本站固定刻度', 'quake-incheon'),
      quakeBeat(.69, '2011-03-11T05:54:31Z', incheon, '仁川 · 本段绝对峰值在负侧', 'quake-incheon'),
    ],
    [
      quakeBeat(0, '2011-03-11T05:54:31Z', incheon, '仁川与松代的最大窗相隔 5 分 11 秒', 'quake-incheon'),
      quakeBeat(.84, '2011-03-11T06:05:00Z', incheon, '结尾可跳回两站的最大窗', 'quake-incheon'),
    ],
  ],
  storm: [
    [
      cloudBeat(0, '2022-09-05T03:00:00Z', 'below235KAreaKm2', '东海与济州岛 · 先记住海岸位置', 'storm-band'),
      cloudBeat(.70, '2022-09-05T03:00:00Z', 'windKt', '金色标记 · JMA 03:00 UTC 中心分析', 'storm-band'),
    ],
    [
      cloudBeat(0, '2022-09-05T03:00:00Z', 'below235KAreaKm2', '固定取景 · 海岸线留在原处', 'storm-band'),
      ...scanSequence('2022-09-05', ['05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30'], .18, .77, 'below235KAreaKm2', '用海岸线对照低温云带北移', 'storm-band'),
      cloudBeat(.89, '2022-09-05T09:50:00Z', 'below235KAreaKm2', '停在缺档前最后一幅扫描', 'storm-band', true),
    ],
    [
      cloudBeat(0, '2022-09-05T09:50:00Z', 'below235KAreaKm2', '09:50 UTC · 缺档前扫描', 'storm-korea', true),
      cloudBeat(.26, '2022-09-05T10:10:00Z', 'below235KAreaKm2', '10:10 UTC · 缺档后恢复扫描', 'storm-korea', true),
      cloudBeat(.61, '2022-09-05T10:10:00Z', 'windKt', '此刻仍对照 09:00 UTC 的 JMA 分析', 'storm-korea'),
      cloudBeat(.91, '2022-09-05T12:00:00Z', 'windKt', '12:00 UTC · JMA 风速与气压分析更新', 'storm-korea'),
    ],
    [cloudBeat(0, '2022-09-05T13:30:00Z', 'windKt', '末次扫描 · 对照较早的 12:00 UTC 中心分析', 'storm-korea')],
  ],
  mangkhut: [
    [
      cloudBeat(0, '2018-09-16T00:00:00Z', 'cloud', '香港 08:00 · 先认珠江口', 'mangkhut-band'),
      beat(.23, '2018-09-16T00:00:00Z', 'wind', '青标记 · 香港国际机场'),
      beat(.35, '2018-09-16T01:00:00Z', 'seaLevel', '金标记 · 鲗鱼涌潮位站'),
      ...scanSequence('2018-09-16', ['03:20', '03:30', '03:40', '03:50', '04:00'], .56, .94, 'cloud', '固定取景 · 看珠江口附近的红外云带', 'mangkhut-band'),
    ],
    [
      beat(0, '2018-09-16T04:00:00Z', 'wind', '香港 12:00 · 找机场风测站'),
      beat(.40, '2018-09-16T04:00:00Z', 'seaLevel', '鲗鱼涌验潮站 · 与机场风分别读取'),
      beat(.70, '2018-09-16T04:00:00Z', 'rain', '东区雨量 · 多个测站的范围'),
    ],
    [
      beat(0, '2018-09-16T04:00:00Z', 'wind', '从香港 12:00 开始对照'),
      beat(.17, '2018-09-16T04:30:00Z', 'wind', '香港 12:30 · 机场报文更新'),
      beat(.32, '2018-09-16T05:00:00Z', 'wind', '香港 13:00 · 机场平均风增至 111.12 km/h'),
      beat(.59, '2018-09-16T05:00:00Z', 'seaLevel', '香港 13:00 · 鲗鱼涌海水位升至 3.70 m'),
    ],
    [
      beat(0, '2018-09-16T05:00:00Z', 'rain', '东区各站 · 11:45–12:45 累计 2–48 mm'),
    ],
    [
      beat(0, '2018-09-16T05:00:00Z', 'wind', '香港 13:00 · 继续看下午记录'),
      beat(.22, '2018-09-16T06:00:00Z', 'seaLevel', '香港 14:00 · 风已回落，本站海水位仍上升'),
      beat(.55, '2018-09-16T08:00:00Z', 'rain', '香港 16:00 · 核对小时雨量'),
      beat(.87, '2018-09-16T12:00:00Z', 'seaLevel', '香港 20:00 · 到达档案末点'),
    ],
    [
      beat(0, '2018-09-16T05:00:00Z', 'wind', '香港 13:00 · 机场风速 111.12 km/h'),
      beat(.25, '2018-09-16T06:00:00Z', 'seaLevel', '香港 14:00 · 鲗鱼涌水位升至 3.73 m'),
    ],
  ],
  'hualien-2024-observed-stations': [
    [
      quakeBeat(0, '2024-04-02T23:57:01Z', 'origin', '金色标记 · 花莲近海震中', 'quake-hualien-map'),
      quakeBeat(.33, '2024-04-02T23:57:01Z', taipei, '台北 · 从震前一秒窗认准零线', 'quake-taipei'),
      quakeBeat(.65, '2024-04-02T23:58:13Z', taipei, '发震后首个窗末 · 同一把刻度', 'quake-taipei'),
    ],
    [
      quakeBeat(0, '2024-04-02T23:58:25Z', taipei, '台北 · 起初计数贴近零线', 'quake-taipei'),
      quakeBeat(.23, '2024-04-02T23:58:36Z', taipei, '台北 · 正负两侧开始拉开', 'quake-taipei'),
      quakeBeat(.53, '2024-04-02T23:58:48Z', taipei, '07:58:48 · 金点落在负侧', 'quake-taipei'),
      quakeBeat(.88, '2024-04-02T23:58:48Z', taipei, '核对台北本段绝对峰值', 'quake-taipei'),
    ],
    [
      quakeBeat(0, '2024-04-02T23:59:05Z', matsushiro, '切到日本松代 · 时钟继续', 'quake-matsushiro'),
      quakeBeat(.60, '2024-04-03T00:02:59Z', matsushiro, '08:02:59 · 松代本段绝对峰值', 'quake-matsushiro'),
    ],
    [
      quakeBeat(0, '2024-04-03T00:03:14Z', incheon, '切到韩国仁川 · 采用本站刻度', 'quake-incheon'),
      quakeBeat(.32, '2024-04-03T00:04:37Z', incheon, '08:04:37 · 仁川本段绝对峰值', 'quake-incheon'),
    ],
  ],
  'big-piney-2021-tracer': [
    [
      riverBeat(0, -14820, 't1', '先看整段河道与三个断面', 'reach'),
      riverBeat(.71, 0, 't1', '释放参考时刻 · 开始沿河追踪', 'reach'),
    ],
    [
      riverBeat(0, 3000, 't1', '断面一 · 两岸使用同一把浓度尺', 'section'),
      riverBeat(.43, 3300, 't1', '断面一 · 右岸先测到持续信号', 'section', 'right'),
      riverBeat(.54, 3300, 't1', '断面一 · 右岸先测到持续信号', 'section', 'right'),
      riverBeat(.67, 3510, 't1', '断面一 · 左岸晚三分半', 'section', 'left'),
      riverBeat(.82, 3600, 't1', '断面一 · 右岸实测峰值 213.76 ppb', 'section', 'right'),
      riverBeat(.93, 3600, 't1', '断面一 · 右岸实测峰值 213.76 ppb', 'section', 'right'),
    ],
    [
      riverBeat(0, 7200, 't2', '沿河切到断面二', 'section'),
      riverBeat(.32, 7650, 't2', '断面二 · 左岸先测到持续信号', 'section', 'left'),
      riverBeat(.45, 7650, 't2', '断面二 · 左岸先测到持续信号', 'section', 'left'),
      riverBeat(.65, 8250, 't2', '断面二 · 右岸晚十分钟', 'section', 'right'),
      riverBeat(.82, 8250, 't2', '断面二 · 右岸晚十分钟', 'section', 'right'),
    ],
    [
      riverBeat(0, 12000, 't3', '继续向下游切到断面三', 'section'),
      riverBeat(.23, 12870, 't3', '断面三 · 左岸先测到持续信号', 'section', 'left'),
      riverBeat(.37, 12870, 't3', '断面三 · 左岸先测到持续信号', 'section', 'left'),
      riverBeat(.60, 17940, 't3', '断面三 · 右岸实测峰值 30.58 ppb', 'section', 'right'),
      riverBeat(.90, 17940, 't3', '断面三 · 右岸实测峰值 30.58 ppb', 'section', 'right'),
    ],
    [
      riverBeat(0, 21600, 't3', '拉远看三处断面与实验后段', 'reach'),
      riverBeat(.67, 60000, 't3', '后段各站仍按原始采样显示', 'reach'),
      riverBeat(.9, 95250, 't3', '到达档案最后一笔', 'reach'),
    ],
  ],
};

// The product overview reuses the same evidence while introducing the scenes.
scenes.overview = [
  [],
  volcanoEarly,
  [
    cloudBeat(0, '2022-01-15T03:50:00Z', 'coldAreaKm2', '汤加火山周围 · 较早扫描', 'volcano-early'),
    ...scanSequence('2022-01-15', ['04:10', '04:20', '04:30', '04:40'], .13, .43, 'coldAreaKm2', '火山附近的新云团逐帧展开', 'volcano-early'),
    ...scanSequence('2022-01-15', ['05:30', '05:40', '05:50', '06:00'], .51, .75, 'coldAreaKm2', '对照上幅边缘看低温区扩展', 'volcano-expand'),
    cloudBeat(.92, '2022-01-15T07:50:00Z', 'p10K', '末次扫描 · 对照同刻低温统计', 'volcano-late'),
  ],
  scenes.quake[1],
  scenes.storm[0],
  [
    cloudBeat(0, '2022-09-05T03:00:00Z', 'below235KAreaKm2', '以固定海岸线为参照', 'storm-band'),
    ...scanSequence('2022-09-05', ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00'], .16, .70, 'below235KAreaKm2', '对照相邻红外扫描的云带', 'storm-band'),
    cloudBeat(.91, '2022-09-05T13:30:00Z', 'windKt', '末次扫描 · 最近官方分析风速 75 节', 'storm-band'),
  ],
  [
    ...scanSequence('2018-09-16', ['04:00', '04:10', '04:20', '04:30', '04:40', '04:50'], 0, .40, 'cloud', '固定取景 · 看珠江口附近的红外云带', 'mangkhut-band'),
    beat(.57, '2018-09-16T05:00:00Z', 'seaLevel', '香港 13:00 · 鲗鱼涌海水位 3.7 m'),
  ],
  [beat(0, '2018-09-16T05:00:00Z', 'seaLevel', '核对测站读数与原始来源')],
];

export function recordedSceneBeats(key, index) {
  return Object.hasOwn(scenes, key) ? scenes[key][index] ?? [] : [];
}
