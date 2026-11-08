// A route identifies an event; kind only selects a renderer and its units.
export const dynamicEvents = {
  volcano: {
    kind: 'volcano', id: 'hunga-tonga-2022-b13', url: 'data/volcano-dynamic.json', label: '汤加喷发',
    headline: '汤加喷发后，海面上和海面下各变了什么？', location: '洪阿哈阿帕伊火山与周围云区',
    primary: ['coldAreaKm2', 'p10K'],
    moments: [
      ['2022-01-15T03:50:00Z', '早期背景'], ['2022-01-15T04:20:00Z', '参照帧'],
      ['2022-01-15T04:40:00Z', '早段高点'], ['2022-01-15T05:20:00Z', '低温区回落'],
      ['2022-01-15T05:50:00Z', '再度增大'], ['2022-01-15T07:50:00Z', '本段最大'],
    ],
  },
  quake: {
    kind: 'quake', id: 'tohoku-2011-observed-stations', url: 'data/quake-dynamic.json', label: '日本东北地震',
    headline: '日本东北地震在不同台站留下了怎样的记录？', location: '日本东北地震震源与实测台站',
    watch: { from: '2011-03-11T05:47:30Z', to: '2011-03-11T05:50:30Z' },
    moments: [
      ['2011-03-11T05:46:00Z', '震前记录'], ['2011-03-11T05:48:01Z', '松代起伏', 'IU.MAJO.00.BHZ'],
      ['2011-03-11T05:49:20Z', '松代强信号', 'IU.MAJO.00.BHZ'], ['2011-03-11T05:54:31Z', '仁川记录', 'IU.INCN.00.BHZ'],
    ],
  },
  storm: {
    kind: 'storm', id: 'hinnamnor-2022-0905', url: 'data/storm-dynamic.json', label: '轩岚诺台风',
    headline: '轩岚诺的云带怎样向北推进？', location: '轩岚诺 · 东海至朝鲜半岛',
    primary: ['below235KAreaKm2', 'windKt'],
    watch: { from: '2022-09-05T03:00:00Z', to: '2022-09-05T13:30:00Z' },
    moments: [
      ['2022-09-05T03:00:00Z', '较早云系'], ['2022-09-05T06:00:00Z', '中心新分析'],
      ['2022-09-05T09:50:00Z', '缺档前扫描'], ['2022-09-05T10:10:00Z', '缺档后扫描'],
      ['2022-09-05T12:00:00Z', '后期分析'],
      ['2022-09-05T13:30:00Z', '末次扫描'],
    ],
  },
  'wildfire-dixie': {
    kind: 'wildfire', id: 'dixie-2021-airborne-ir', url: 'data/wildfire-dixie-dynamic.json', contextUrl: 'data/dixie-context.json', label: 'Dixie 山火',
    headline: 'Dixie 山火为什么要重点看北侧和东侧？', location: '美国加州北部 · 羽毛河峡谷至阿尔马诺湖一带',
    primary: ['mappedKm2', 'addedKm2'],
    moments: [
      ['2021-07-27T00:00:00Z', '起始范围'], ['2021-08-01T00:00:00Z', '核对边界差异'],
      ['2021-08-04T00:00:00Z', '间隔后记录'], ['2021-08-05T00:00:00Z', '前一期边界'],
      ['2021-08-06T00:00:00Z', '北缘和东缘扩展'],
    ],
    tour: {
      label: 'Dixie 山火 · 读懂扩展证据', captionsOnly: false,
      steps: [
        {title: '先在地图上找到山火', navLabel: '定位火区', text: '把镜头拉到加州北部。先看阿尔马诺湖和羽毛河峡谷，金线圈出七月二十七日档案里的火区。接下来我们用同一张地图找变化，再看测站风、地形和火前植被各能告诉我们什么。', targetSelector: '#earth-view', cue: {route: 'dynamic-wildfire-dixie', view: 'detail', timeUtc: '2021-07-27T00:00:00Z', dixieEvidence: 'location'}},
        {title: '沿着橙色看新增区域', navLabel: '比较边界', text: '金线是这一期的边界，蓝线是上一次可用边界。橙色显示新划入的范围。八月二日和三日缺档，时间轴直接跳到四日。最后两期，北侧新增约二百六十平方公里，东侧约二百三十七平方公里。', targetSelector: '#earth-view', cue: {route: 'dynamic-wildfire-dixie', view: 'detail', timeUtc: '2021-08-01T00:00:00Z', endTimeUtc: '2021-08-06T00:00:00Z', dixieEvidence: 'boundary'}},
        {title: '看测站的风吹向哪边', navLabel: '核对风向', text: '看青蓝色实线，它们从测站出发。八月五日下午四点到五点，三站测得的风都带有向东分量。这与部分东侧新增区域的方位吻合。金色虚线标出新增范围的方位。用左图和风时钟可以核对其他小时。', targetSelector: '#earth-view', cue: {route: 'dynamic-wildfire-dixie', view: 'detail', timeUtc: '2021-08-06T00:00:00Z', dixieEvidence: 'wind'}},
        {title: '在地形图上比较两侧坡度', navLabel: '比较坡度', text: '现在看高程阴影，顺着山脊和峡谷辨认地形。对比画面下方两条坡线。北侧新增区的中位坡度约五度，东侧约十度。这是整片新增区域的统计，可以看出两侧地形不同。', targetSelector: '#earth-view', cue: {route: 'dynamic-wildfire-dixie', view: 'detail', timeUtc: '2021-08-06T00:00:00Z', dixieEvidence: 'slope'}},
        {title: '用火前植被收尾', navLabel: '看植被与结论', text: '保留同一条火区边界，换到火前植被图。北侧最多的是加州红冷杉，东侧最多的是湿润混合针叶林。回看边界，北、东是主要新增区。测站风给了东侧一个线索。要解释两侧为何扩展，还需要火线时刻、近火场风和燃料湿度。', targetSelector: '#earth-view', cue: {route: 'dynamic-wildfire-dixie', view: 'detail', timeUtc: '2021-08-06T00:00:00Z', dixieEvidence: 'fuel'}},
      ],
    },
  },
  'quake-hualien': {
    kind: 'quake', id: 'hualien-2024-observed-stations', url: 'data/quake-hualien-dynamic.json', label: '花莲地震',
    headline: '花莲地震在附近和更远的台站怎样起伏？', location: '花莲地震震源与实测台站',
    watch: { from: '2024-04-02T23:58:00Z', to: '2024-04-02T23:59:50Z' },
    moments: [
      ['2024-04-02T23:58:00Z', '震前记录'],
      ['2024-04-02T23:58:48Z', '台北站峰值', 'IU.TATO.00.BHZ'],
      ['2024-04-03T00:02:59Z', '松代站峰值', 'IU.MAJO.00.BHZ'],
      ['2024-04-03T00:04:37Z', '仁川站峰值', 'IU.INCN.00.BHZ'],
    ],
    tour: {
      label: '花莲地震 · 台站实测',
      captionsOnly: false,
      steps: [
        {
          title: '先定位花莲与台北站', navLabel: '找震中与台北站', text: '从发震前的实测开始。金色标记指向花莲震中，另一处是台北台站。镜头靠近后，先认刻度的零线。台站上的金点和右图的游标都跟着同一个一秒记录窗口。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-quake-hualien', view: 'global', timeUtc: '2024-04-02T23:57:01Z', endTimeUtc: '2024-04-02T23:58:25Z', stationId: 'IU.TATO.00.BHZ' },
        },
        {
          title: '慢看台北的信号从小到大', navLabel: '读台北起伏', text: '看台北站，信号先小幅起伏，接着明显变大。青色是正计数，紫色是负计数。时间停到七点五十八分四十八秒时，金点落在负侧。它标出这一秒内离零最远的一笔。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-quake-hualien', view: 'detail', timeUtc: '2024-04-02T23:58:25Z', endTimeUtc: '2024-04-02T23:59:05Z', stationId: 'IU.TATO.00.BHZ' },
        },
        {
          title: '用同一时钟看日本松代', navLabel: '换到松代', text: '镜头移到日本松代，时钟继续向前。右图和台站刻度换成松代的实测。它在八点零二分五十九秒出现这段记录中最大的窗口。台站各用自己的仪器计数刻度。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-quake-hualien', view: 'detail', timeUtc: '2024-04-02T23:59:05Z', endTimeUtc: '2024-04-03T00:03:14Z', stationId: 'IU.MAJO.00.BHZ' },
        },
        {
          title: '用三个实测时刻收尾', navLabel: '看仁川与三站对照', text: '最后看仁川。三站在这段档案里的最大窗口，依次出现在台北、松代、仁川。点结尾的时刻可以回到各站核对。这里比较的是绝对峰值的时间，地震波初到要从波形中另行识别。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-quake-hualien', view: 'detail', timeUtc: '2024-04-03T00:03:14Z', endTimeUtc: '2024-04-03T00:05:00Z', stationId: 'IU.INCN.00.BHZ', quakeReview: ['IU.TATO.00.BHZ','IU.MAJO.00.BHZ','IU.INCN.00.BHZ'] },
        },
      ],
    },
  },
  'river-big-piney': {
    kind: 'river', id: 'big-piney-2021-tracer', url: 'data/river-big-piney-dynamic.json', label: 'Big Piney 河示踪',
    headline: '一团染料，怎样依次被三个下游断面测到？', location: '美国密苏里州 · Big Piney River',
    watch: { from: -600, to: 21600 },
    moments: [
      [-600, '释放前背景'],
      [3300, '断面 1 右岸首信号', 't1'],
      [7650, '断面 2 左岸信号', 't2'],
      [12870, '断面 3 左岸信号', 't3'],
      [17940, '断面 3 右岸峰值', 't3'],
    ],
    tour: {
      label: 'Big Piney 河 · 实地示踪',
      captionsOnly: false,
      steps: [
        {
          title: '先认河道和两岸的六个测点', navLabel: '找三个断面', text: '先看真实河段。沿下游依次有三个断面，每个断面两岸各有一台仪器。青色标左岸，金色标右岸。时间轴以释放为零点，零点之前的记录是用来对照的背景。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-river-big-piney', view: 'detail', elapsedSeconds: -14820, endElapsedSeconds: 3000, stationId: 't1' },
        },
        {
          title: '断面一，右岸先测到持续信号', navLabel: '断面一 · 右岸先', text: '镜头靠近第一个断面。连续三笔都达到十亿分之三，就把第一笔标成持续信号的起点。金色右岸在释放后五十五分钟先出现，青色左岸晚三分半。接着看右岸柱顶升到峰值。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-river-big-piney', view: 'detail', elapsedSeconds: 3000, endElapsedSeconds: 7200, stationId: 't1' },
        },
        {
          title: '断面二，换成左岸先测到', navLabel: '断面二 · 左岸先', text: '沿河到第二个断面，先看青色左岸。它在释放后两小时七分半出现持续信号，金色右岸再过十分钟才出现。柱顶和曲线使用同一笔观测，换了断面仍能用同一尺度比较。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-river-big-piney', view: 'detail', elapsedSeconds: 7200, endElapsedSeconds: 12000, stationId: 't2' },
        },
        {
          title: '断面三，先看左岸到达，再看右岸峰值', navLabel: '断面三 · 到达与峰值', text: '最后到第三个断面。左岸先出现持续信号。接着让时间向前，等到右岸自己的峰值，再看金色柱顶和右边曲线。到达说的是浓度开始持续抬升，峰值说的是这一岸测到的最高值。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-river-big-piney', view: 'detail', elapsedSeconds: 12000, endElapsedSeconds: 21600, stationId: 't3' },
        },
        {
          title: '回到三个断面的首岸记录', navLabel: '回看先后证据', text: '最后拉远看整段河道。三处断面的首岸记录依次出现，但先测到的岸别会变。点结尾的三个时刻，可以把断面、浓度柱和曲线一起对回去。实验后段的读数也可以沿时间轴继续核对。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-river-big-piney', view: 'detail', elapsedSeconds: 21600, endElapsedSeconds: 95250, stationId: 't3', riverReview: true },
        },
      ],
    },
  },
  'tide-san-francisco': {
    kind: 'tide', id: 'san-francisco-2025-01-15-tide', url: 'data/tide-san-francisco-dynamic.json', label: '旧金山 · 月球与潮位',
    headline: '潮汐怎样涨落？从地月原理到旧金山港', location: '旧金山验潮站 · NOAA 9414290',
    watch: { from: '2025-01-15T00:00:00Z', to: '2025-01-15T23:54:00Z' },
    moments: [
      ['2025-01-15T02:00:00Z', '实测最低'],
      ['2025-01-15T02:18:00Z', '月球已升起'],
      ['2025-01-15T09:36:00Z', '月球最高采样'],
      ['2025-01-15T16:48:00Z', '月球已落下'],
      ['2025-01-15T19:42:00Z', '预报首个最高'],
      ['2025-01-15T19:54:00Z', '实测最高'],
    ],
    tour: {
      label: '旧金山港 · 地月与潮位',
      captionsOnly: false,
      steps: [
        {
          title: '同一片浅滩，为什么一会儿露出、一会儿淹没？', navLabel: '看现象',
          text: '先看同一片浅滩。水退到低潮线，浅滩露出。水升到高潮线，浅滩被淹没。接下来从海岸拉远，看地球和月球怎样帮助我们理解这种周期性的变化。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-tide-san-francisco', view: 'global', timeUtc: '2025-01-15T00:00:00Z', tideLesson: 'intro' },
        },
        {
          title: '潮汐是海水水位的周期性涨落',
          navLabel: '地月原理',
          text: '海水周期性地上涨、回落，就是潮汐。看地球和月球，月球对地球各处的引力不同。在这个简化模型里，青色海面在向月侧和背月侧都隆起。地球自转，金色的示意海岸点依次经过高低水位区，旁边的水位曲线同步起伏。太阳也参与引潮。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-tide-san-francisco', view: 'global', timeUtc: '2025-01-15T00:00:00Z', tideLesson: 'forces' },
        },
        {
          title: '涨落怎样改变海岸', navLabel: '水线对照',
          text: '回到同一片浅滩。沿着金点看水线怎样向岸上移动。水升到高潮线时，浅滩被淹没，航道水深也增加。落潮时，水线退回，浅滩露出。接下来飞到旧金山港，用验潮记录看这里何时涨落。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-tide-san-francisco', view: 'global', timeUtc: '2025-01-15T00:00:00Z', tideLesson: 'impact' },
        },
        {
          title: '到旧金山港，分别看月球和水位', navLabel: '进港口', text: '青色标记是旧金山验潮站。现在从地球靠近港口。月升和月落说的是月球越过地平线。港口是在涨潮还是落潮，要看验潮站的水位变化。接下来看二零二五年一月十五日的两组记录，岸边水线跟着实测涨落，右边另列预报。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-tide-san-francisco', view: 'global', timeUtc: '2025-01-15T00:00:00Z', tideFlight: true },
        },
        {
          title: '月球从地平线下升起', navLabel: '月升', text: '先认准零度地平线。紫色标记从线下向上移动，越过地平线后变成亮色月球。到协调世界时二点十八分这笔星历，月球已经在地平线上方。',
          targetSelector: '#earth-view', cue: {
            route: 'dynamic-tide-san-francisco', view: 'detail',
            timeUtc: '2025-01-15T00:00:00Z', endTimeUtc: '2025-01-15T02:18:00Z', voiceSeconds: 14.5,
            tideBeats: [[4.9, '2025-01-15T02:12:00Z'], [5.36, '2025-01-15T02:18:00Z']],
          },
        },
        {
          title: '从南方高空走向月落', navLabel: '月落', text: '沿紫色轨迹往前看，月球会经过南方高空，高度一度达到约七十二度。接着标记向西下降，到十六点四十八分这笔星历，月球已降到地平线下。',
          targetSelector: '#earth-view', cue: {
            route: 'dynamic-tide-san-francisco', view: 'detail',
            timeUtc: '2025-01-15T02:18:00Z', endTimeUtc: '2025-01-15T16:48:00Z', voiceSeconds: 14.4,
            tideBeats: [[4.68, '2025-01-15T09:36:00Z'], [7.25, '2025-01-15T12:36:00Z'],
              [9.3, '2025-01-15T16:42:00Z'], [12.11, '2025-01-15T16:48:00Z']],
          },
        },
        {
          title: '月落后，港口潮位仍在上涨', navLabel: '验实测', text: '现在月球在地平线下，港口的潮位尺还在上升。青色实线是验潮站实测，金色虚线是调和预报。预报最高点在十九点四十二分，实测最高点在十九点五十四分。',
          targetSelector: '#tide-focus-evidence', cue: {
            route: 'dynamic-tide-san-francisco', view: 'detail',
            timeUtc: '2025-01-15T16:48:00Z', endTimeUtc: '2025-01-15T19:54:00Z', voiceSeconds: 17.1, tideEvidence: true,
            tideBeats: [[10.74, '2025-01-15T19:42:00Z'], [12.95, '2025-01-15T19:42:00Z'],
              [13.59, '2025-01-15T19:54:00Z']],
          },
        },
        {
          title: '月升、月落与港口涨落各怎么看', navLabel: '结论', text: '旧金山这一天，实测最低值早于月升。月球落到地平线以下时，水位仍在上涨。月球和太阳提供引潮作用，海水响应还受海盆和海岸形状影响。要判断这个港口何时涨落，请看右侧同一水位基准下的实测和预报曲线。',
          targetSelector: '#charts', cue: { route: 'dynamic-tide-san-francisco', view: 'detail', timeUtc: '2025-01-15T19:54:00Z', endTimeUtc: '2025-01-15T23:54:00Z', tideRecap: true },
        },
      ],
    },
  },
  'battery-b0005': {
    kind: 'battery', id: 'nasa-b0005-first-discharge', url: 'data/battery-b0005-dynamic.json', label: 'NASA B0005 电池',
    headline: 'B0005 首次放电时，电压、电流和温度怎样变化？', location: 'NASA 电池老化实验档案',
    watch: { from: 0, to: 3690.234 },
    moments: [
      [0, '记录起点'],
      [35.702999999999996, '约 −2 A 首笔'],
      [1852.391, '放电中段'],
      [3346.937, '电压最低采样'],
      [3366.781, '电流回近零'],
      [3690.234, '记录末点'],
    ],
    tour: {
      label: 'NASA B0005 · 首次放电',
      captionsOnly: true,
      steps: [
        {
          title: '看电芯结构和起始读数', text: '镜头切到电芯观察台。剖面用来辨认圆柱电芯的典型卷芯，外部三条读数来自 NASA 的 B0005 档案。实验起点的电压约四点一九伏，输出电流接近零。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-battery-b0005', view: 'detail', elapsedSeconds: 0, endElapsedSeconds: 35.702999999999996 },
        },
        {
          title: '负载期间看温度和端电压', text: '跟着共同时间轴，电池输出电流维持在约负二安。电压逐步下降，温度读数升高。三条曲线分别显示对应采样，剖面用于说明结构。',
          targetSelector: '#charts', cue: { route: 'dynamic-battery-b0005', view: 'detail', elapsedSeconds: 35.702999999999996, endElapsedSeconds: 3346.937 },
        },
        {
          title: '电流回近零后的电压和温度', text: '这一笔采样中，输出电流已回到接近零。往后看，端电压回升，电池温度从接近三十九度降到约三十四度。',
          targetSelector: '#charts', cue: { route: 'dynamic-battery-b0005', view: 'detail', elapsedSeconds: 3366.781, endElapsedSeconds: 3690.234 },
        },
      ],
    },
  },
  'engine-jlu-diesel': {
    kind: 'engine', id: 'jlu-diesel-etc-bench', url: 'data/engine-jlu-diesel-dynamic.local.json',
    localOnly: true, label: '吉林大学 · 柴油机台架',
    publication: 'https://scis.scichina.com/en/2019/077201.pdf',
    headline: '扭矩归零时，柴油机的转速和轨压怎样变？', location: '吉林大学发布 · 柴油机台架档案',
    watch: { from: 30, to: 90 },
    moments: [
      [30, '高扭矩起点'],
      [38.5, '扭矩首笔为零'],
      [45.9, '片段轨压最低'],
      [85.6, '全程转速最低'],
    ],
    tour: {
      label: '吉林大学 · 柴油机台架',
      captionsOnly: true,
      steps: [
        {
          title: '先认清结构运动和台架读数', text: '剖面里的曲轴和活塞跟着实测转速慢放，位置是结构示意。画面上方对比各节点的原档采样，仪表和两侧游标显示当前记录。',
          targetSelector: '#earth-view', cue: { route: 'dynamic-engine-jlu-diesel', view: 'detail', elapsedSeconds: 30 },
        },
        {
          title: '扭矩归零，轨压降到片段低点', text: '三十八点五秒，扭矩首次记为零，轨压已经下降，转速仍接近三千二百转。四十五点九秒，原档轨压降到这一分钟的最低点。',
          targetSelector: '#readouts', cue: { route: 'dynamic-engine-jlu-diesel', view: 'detail', elapsedSeconds: 30, endElapsedSeconds: 45.9 },
        },
        {
          title: '转速随后降到最低', text: '看曲轴和活塞随转速回落而变慢。八十五点六秒，转速降到本次记录的最低点七百五十三转。三条曲线可以核对变化先后，要判断哪个变化引起转速下降，还需要台架的控制指令与负载记录。',
          targetSelector: '#charts', cue: { route: 'dynamic-engine-jlu-diesel', view: 'detail', elapsedSeconds: 45.9, endElapsedSeconds: 85.6 },
        },
      ],
    },
  },
};

export function isDeviceEvent(event) {
  return event?.kind === 'battery' || event?.kind === 'engine';
}

export function getDynamicEvent(slug) {
  return Object.hasOwn(dynamicEvents, slug) ? dynamicEvents[slug] : null;
}
