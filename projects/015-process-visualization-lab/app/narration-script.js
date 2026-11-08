/** Chinese narration content only. The driver owns routing, loading, playback and speech.
 * UTC cues select actual observations. endTimeUtc means advance through available real ticks;
 * it never authorizes interpolation, synthetic frames or speaking before the scene is ready.
 */
const step = (title, text, targetSelector, cue, navLabel) => ({ title, text, targetSelector, cue, navLabel });

export const tours = {
  overview: {
    label: '带我认识这个产品',
    steps: [
      step('先读懂这张地球',
        '先看整个地球：中间告诉你事件在哪里，底部时钟决定看到哪一刻，两侧图表用来核对变化。当前概览是教学示意；接下来会切换到真实记录，带你按位置、时间和证据看懂一个过程。',
        '#earth-view', { route: 'overview', view: 'global', progress: 0.35, endProgress: 0.6 }),
      step('汤加：先记住较早的画面',
        '先来到汤加附近，记住较早这一帧的海面和周围云区。左侧小图与地球来自同一次红外扫描，亮处对应更低的亮温。现在先不急着看数字，下一步把真实扫描连起来，观察新云团怎样出现。',
        '#current-insight', { route: 'dynamic-volcano', timeUtc: '2022-01-15T03:50:00Z', view: 'detail' }),
      step('汤加：看四小时里的扩展',
        '现在逐张向后看四小时，喷发附近的小云团逐渐展开成伞状。右侧统计的是固定三百公里邻域内的低温区域，末帧约六点九七万平方公里；它帮助比较变化，不代表火山灰浓度或地面受灾范围。',
        '#charts', { route: 'dynamic-volcano', timeUtc: '2022-01-15T03:50:00Z', endTimeUtc: '2022-01-15T07:50:00Z', view: 'detail' }),
      step('地震：让台站记录自己说话',
        '再看日本东北地震的松代台站。随着这段真实记录向前，针柱和右侧曲线一起进入明显起伏。这里读的是仪器计数，图形为了看清而放大；它不是地面位移，也不能用柱高比较不同台站谁震得更强。',
        '#readouts', { route: 'dynamic-quake', timeUtc: '2011-03-11T05:48:30Z', endTimeUtc: '2011-03-11T05:49:20Z', stationId: 'IU.MAJO.00.BHZ', view: 'detail' }),
      step('台风：先分清云图和分析点',
        '这次看轩岚诺。地球上的云带来自真实红外扫描，路径点另有官方分析依据。先记住这一帧的中心位置和云带形态，再看后面的记录；云的亮暗表示亮温，不能直接当作风速或雨量来读。',
        '#earth-view', { route: 'dynamic-storm', timeUtc: '2022-09-05T03:00:00Z', view: 'detail' }),
      step('台风：看移动，也看各自的时间',
        '继续往后，云系形态和分析中心的位置都发生了变化。结束时采用的最近官方分析风速为七十五节；分析时刻与卫星扫描时刻不同，页面分别标出。比较图表时，要先看清单位和记录时间。',
        '#readouts', { route: 'dynamic-storm', timeUtc: '2022-09-05T03:00:00Z', endTimeUtc: '2022-09-05T13:30:00Z', view: 'detail' }),
      step('山竹：把天空与地面记录放在一起',
        '最后看山竹，从香港时间十二点走到十三点。云图、机场风和鲗鱼涌海水位共用一个回放时钟。十三点海水位记录为三点七米，以站点零点为基准；它不是单独的风暴潮增水，不能直接这样解释。',
        '#charts', { route: 'typhoon-real', timeUtc: '2018-09-16T04:00:00Z', endTimeUtc: '2018-09-16T05:00:00Z', view: 'detail' }),
      step('接下来，按自己的问题探索',
        '现在你可以自己选事件、拖动时钟、切换完整地球与近看视角，再把画面和曲线对照。来源区保留资料入口、时间口径和缺测说明。遇到想追问的变化，先核对证据，再判断这些记录能支持什么结论。',
        '#sources-panel', { route: 'typhoon-real', timeUtc: '2018-09-16T05:00:00Z', view: 'global' })
    ]
  },
  volcano: {
    label: '汤加喷发 · 海底地形与当天云图',
    steps: [
      step('下潜到喷发前的火山口',
        '从地球靠近汤加，再俯身看海底火山。这里是二零一五到二零一七年资料合成的地形。先看环形火山口、岛屿和向外延伸的坡面。青色线划过火山口，光标处的水深约八十二米。',
        '#earth-view', { route: 'dynamic-volcano', terrain: 'pre', spot: 'crater' }, '看火山口'),
      step('看火山口加深了多少',
        '火山口底部的深红色表示加深，蓝色表示变浅。对照左边的两期水深，这个测点加深约七百七十四米。右边剖面下方的色带和三维地形共用色标，灰色斜纹标出有一期缺测的位置。',
        '#earth-view', { route: 'dynamic-volcano', terrain: 'change', spot: 'crater' }, '比测深'),
      step('顺着差值看西坡和东坡',
        '先看西侧坡面，标记处两期记录相差约八米，右侧剖面线在这里靠得很近。再沿剖面移到东侧，测点相差约七米。两侧的小差值还要结合测深和配准误差来读，火山口的落差在图上更明显。',
        '#earth-view', { route: 'dynamic-volcano', terrain: 'change', spot: 'west' }, '看两侧坡面'),
      step('先辨认火山附近的背景',
        '这里是汤加喷发时段的真实红外记录。先看较早的一帧，记住火山附近和周围天气云的位置。画面亮暗对应亮温，左侧小图保留同一帧的完整灰阶，便于和地球上的增强显示互相核对。',
        '#earth-view', { route: 'dynamic-volcano', timeUtc: '2022-01-15T03:50:00Z', view: 'detail' }, '切回当天云图'),
      step('看新的小云团出现',
        '看前三十分钟的连续红外扫描，火山附近出现一片明亮的低温区。可以追踪它出现的位置和时间。要区分火山灰和普通天气云，还要结合其他波段或独立观测。右侧统计的是固定范围内的低温区。',
        '#earth-view', { route: 'dynamic-volcano', timeUtc: '2022-01-15T03:50:00Z', endTimeUtc: '2022-01-15T04:20:00Z', view: 'detail' }, '看新云区'),
      step('看扩展，也读懂统计范围',
        '继续向后，云区逐渐展开。面积曲线只统计火山周围三百公里内、亮温低于指定阈值的位置；另一条曲线反映这个范围的低温变化。它们来自同一帧，但没有把火山灰与所有气象云分开。',
        '#earth-view', { route: 'dynamic-volcano', timeUtc: '2022-01-15T04:20:00Z', endTimeUtc: '2022-01-15T07:50:00Z', view: 'detail' }, '慢看扩展'),
      step('用两种证据回答开场的问题',
        '回到开场的问题。海面下，两期测深显示火山口这个测点显著加深，测绘之间的变化过程没有被连续拍到。海面上，当天的红外扫描记录了低温云区的展开。现在可以分别回看这两条证据。',
        '#earth-view', { route: 'dynamic-volcano', timeUtc: '2022-01-15T07:50:00Z', view: 'detail', hungaRecap: true }, '回看证据')
    ]
  },
  quake: {
    label: '讲解六台站真实地震记录',
    steps: [
      step('先认震中，再看松代的背景记录',
        '先认准金色的震中，再把镜头移到松代台站。发震前，本站只记录到小幅起伏。时钟往前走，留意台站旁的零刻线。右图的游标和这把刻度都指向同一个一秒窗口。',
        '#earth-view', { route: 'dynamic-quake', timeUtc: '2011-03-11T05:45:01Z', endTimeUtc: '2011-03-11T05:48:30Z', stationId: 'IU.MAJO.00.BHZ', view: 'detail' }, '找震中与台站'),
      step('慢看松代台站的正负起伏',
        '现在慢放松代的强起伏。青色表示正计数，紫色表示负计数。金点标出这一秒内离零最远的一笔。到本段最大的窗口时停一下，拿画面上的金点和右边的曲线核对。',
        '#earth-view', { route: 'dynamic-quake', timeUtc: '2011-03-11T05:48:30Z', endTimeUtc: '2011-03-11T05:49:20Z', stationId: 'IU.MAJO.00.BHZ', view: 'detail' }, '读松代起伏'),
      step('沿同一时钟换到仁川台站',
        '现在换到韩国仁川。时钟继续向前走，右边的曲线也换到仁川。台站旁这把刻度采用仁川自己的计数范围。等它到达本段的最大窗口，再比较两个台站的时刻。',
        '#earth-view', { route: 'dynamic-quake', timeUtc: '2011-03-11T05:49:20Z', endTimeUtc: '2011-03-11T05:54:31Z', stationId: 'IU.INCN.00.BHZ', view: 'detail' }, '换到仁川'),
      step('对照两站的最大记录窗',
        '回看这段档案，仁川的最大窗口比松代晚五分十一秒。这里对照的是各站绝对峰值出现的时刻。要判断地震波何时初到，还要从波形里单独识别。结尾可以点回这两笔记录。',
        '#earth-view', { route: 'dynamic-quake', timeUtc: '2011-03-11T05:54:31Z', endTimeUtc: '2011-03-11T06:05:00Z', stationId: 'IU.INCN.00.BHZ', view: 'detail', quakeReview: ['IU.MAJO.00.BHZ','IU.INCN.00.BHZ'] }, '回看两站证据')
    ]
  },
  storm: {
    label: '轩岚诺台风 · 从云带到强度',
    steps: [
      step('先认东海和济州岛',
        '镜头拉近东海。白线是固定的海岸，济州岛在朝鲜半岛南边。看三点的扫描，云系主体还在更南边。葵花八号用红外亮温显示云系，越亮表示亮温越低。金色中心点来自日本气象厅的事后分析。',
        '#earth-view', { route: 'dynamic-storm', timeUtc: '2022-09-05T03:00:00Z', view: 'detail', stormEvidence: 'orient' }, '定位云系'),
      step('以海岸为参照，看云带北移',
        '把济州岛和半岛海岸留在原位。现在逐帧看，较冷的云带向北靠近半岛。青色线框出这一幅的低温区域。金线连接档案中的分析位置，中心点随着新的分析向东北移动。右侧低温面积按同一个窗口统计。',
        '#earth-view', { route: 'dynamic-storm', timeUtc: '2022-09-05T03:00:00Z', endTimeUtc: '2022-09-05T09:50:00Z', view: 'detail', stormEvidence: 'motion' }, '观察北移'),
      step('看清缺档前后的两幅影像',
        '先看九点五十分的扫描。接下来跳到十点十分。这里缺少世界时十点的扫描，两幅都保留原来的记录。画面和右侧亮温读数一起跳。旁边的金色读数仍是九点的中心分析，直到十二点才更新。',
        '#earth-view', { route: 'dynamic-storm', timeUtc: '2022-09-05T09:50:00Z', endTimeUtc: '2022-09-05T13:30:00Z', view: 'detail', stormEvidence: 'gap' }, '辨认缺档'),
      step('对照末帧和最近一次强度分析',
        '这是十三点三十分的扫描。金色读数仍来自十二点分析，风速七十五节，气压九百五十五百帕。和三点相比，中心向东北移，最大持续风速下降了十节。当地受到多少风雨影响，要再看地面的实测。',
        '#earth-view', { route: 'dynamic-storm', timeUtc: '2022-09-05T13:30:00Z', view: 'detail', stormEvidence: 'review' }, '核对强度'),
    ]
  },
  mangkhut: {
    label: '山竹复盘 · 从云带到香港实测',
    steps: [
      step('从珠江口看云带经过香港',
        '从香港时间早上八点开始。先认准珠江口和香港两个实测位置。画面保留同一片海岸作参照，接着慢放中午前的连续红外扫描。看亮色云带怎样改变，再去核对香港的风、雨和水位。',
        '#earth-view', { route: 'typhoon-real', timeUtc: '2018-09-16T00:00:00Z', endTimeUtc: '2018-09-16T04:00:00Z', view: 'detail' }, '看云带'),
      step('在同一幅云图上认两个测站',
        '现在停在香港时间十二点。青色标记是香港国际机场，风来自机场报文。金色标记是鲗鱼涌潮位站，水位来自验潮记录。东区雨量汇总了多个测站，留在范围图里读。',
        '#earth-view', { route: 'typhoon-real', timeUtc: '2018-09-16T04:00:00Z', view: 'detail' }, '认测站'),
      step('对照中午到下午一点的风和水位',
        '从十二点走到十三点。机场十分钟平均风速从约每小时八十公里增到一百一十一公里，风向角读风从哪来。鲗鱼涌的水位也从三点五一米升到三点七米，以该站点零点为基准。',
        '#earth-view', { route: 'typhoon-real', timeUtc: '2018-09-16T04:00:00Z', endTimeUtc: '2018-09-16T05:00:00Z', view: 'detail' }, '看风与水位'),
      step('用一条范围带读东区雨量',
        '现在仍停在十三点。东区最近的雨量窗口是十一点四十五到十二点四十五。把区内各站这一小时的累计量放在一起，最少两毫米，最多四十八毫米。画面中的蓝色范围带保留了这两个端点。',
        '#earth-view', { route: 'typhoon-real', timeUtc: '2018-09-16T05:00:00Z', view: 'detail' }, '读雨量范围'),
      step('沿香港下午的记录看后段',
        '过了下午一点，继续沿时间轴看后面的记录，一直到晚上八点。机场风、小时雨量和验潮站水位有各自的观测时间。拖动时间轴时，留意画面和图表当前采用的是哪一条记录。',
        '#earth-view', { route: 'typhoon-real', timeUtc: '2018-09-16T05:00:00Z', endTimeUtc: '2018-09-16T12:00:00Z', view: 'detail' }, '看下午变化'),
      step('回看十三点和十四点的两笔记录',
        '最后回看两个整点。十三点到十四点，机场平均风速回落，鲗鱼涌水位却从三点七米升到三点七三米。水位还会受潮汐等因素影响。点两个整点，可以把当时云图、机场风和验潮记录重新对齐。',
        '#earth-view', { route: 'typhoon-real', timeUtc: '2018-09-16T05:00:00Z', endTimeUtc: '2018-09-16T06:00:00Z', view: 'detail', mangkhutRecap: true }, '回看证据')
    ]
  },
  orbital: {
    label: '讲解地月潮汐原理',
    steps: [
      step('先看方向关系',
        '这一页是地月潮汐的教学模型。先观察月球在地球旁的方向，再对照月相和潮汐示意。天体大小、距离和形变分别放大过，目的是看清关系；这里不是某个海港此刻的真实潮位预报。',
        '#earth-view', { route: 'orbital', progress: 0 }),
      step('用条件与曲线理解变化',
        '现在换到另一个月相位置，比较画面、读数和曲线怎样一起改变。你还可以调整页面提供的条件，看看模型如何响应。读完原理之后，再回到真实事件里核对观测，两种阅读方式各有用途。',
        '#charts', { route: 'orbital', progress: 0.25, endProgress: 0.5 })
    ]
  },
  principleVolcano: {
    label: '讲解火山原理示意',
    steps: [
      step('认识教学模型',
        '这里用教学示意把火山内部过程分成几个阶段，帮助你认识积聚、上升和释放。地球上的喷发柱经过放大，并不对应某次真实喷发。先看阶段位置，也可以从局部放大入口观察模型内部。',
        '#earth-view', { route: 'volcano', progress: 0.12 }),
      step('从模型转向真实记录',
        '把进度推到释放阶段，对照读数与曲线，再尝试改变一个条件，观察模型反应。想看实际发生了什么，请进入汤加真实回放；那里的云图和统计有原始观测依据，不用这里的示意灰柱代替。',
        '#charts', { route: 'volcano', progress: 0.7, endProgress: 0.96 })
    ]
  },
  principleQuake: {
    label: '讲解地震传播原理',
    steps: [
      step('先看两类波的示意',
        '这页用两种颜色帮助区分模型中的两类震波，并观察它们先后传播的关系。地球上的圆环为了看清而放大，不是某次地震测得的震动范围。先把画面的颜色、阶段和读数对应起来。',
        '#earth-view', { route: 'quake', progress: 0.09 }),
      step('区分模型与台站证据',
        '继续推进模型，两类波的示意位置会随参数变化；曲线负责把这个关系说清楚。要核对真实台站记录，可以进入东北地震回放。那里读取仪器采样，不会把这套教学波环叠上去当作实测结果。',
        '#charts', { route: 'quake', progress: 0.3, endProgress: 0.85 })
    ]
  },
  principleTyphoon: {
    label: '讲解台风风场原理',
    steps: [
      step('先看固定测点',
        '这页是理想化台风风场的教学示意。先找到固定测点，再看风眼、云带和预设路径的相对位置。画面尺度经过放大，适合解释测点与风场之间的关系，不应当作当前台风的实际路径预报。',
        '#earth-view', { route: 'typhoon', progress: 0.08 }),
      step('用曲线读测点变化',
        '把模型推进到风场接近测点的阶段，观察测点读数和曲线如何对应。你可以改变条件来理解这个简化关系；想看真实云系与官方分析，请切换轩岚诺或山竹，那里保留各条资料自己的时间。',
        '#charts', { route: 'typhoon', progress: 0.5, endProgress: 0.88 })
    ]
  },
  river: {
    label: '讲解河流迁移原理',
    steps: [
      step('进入一段假想河流',
        '河流主题用一段假想河段解释污染物随水流移动和扩散的过程。地球上的路径只是进入局部情景的入口，不是实际污染地图。先找出监测点，再观察模型里污染物与这个位置的关系。',
        '#earth-view', { route: 'river', progress: 0.05 }),
      step('看经过测点时的曲线',
        '当模型推进到污染物经过监测点附近，右侧浓度曲线会对应变化。你可以尝试调整流速或其他页面条件，理解到达时间和扩散怎样响应。若要解读真实河流，还需要当地流量、地形与实测浓度资料。',
        '#charts', { route: 'river', progress: 0.45, endProgress: 0.95 })
    ]
  },
  battery: {
    label: '讲解电池放电与散热',
    steps: [
      step('从设施位置进入电芯',
        '电池主题先用设施标记提供空间入口，再把视线引向一个假想电芯。这里的电量和温度来自教学模型，不是某座真实设施的监控。你可以打开局部放大窗，认识放电和散热在模型中的对应位置。',
        '#earth-view', { route: 'battery', progress: 0 }),
      step('一起看电量和温度',
        '把放电过程推进到中段，对照电量、温度和两侧曲线，再尝试改变一个条件。这样能理解模型里输入与结果的关系；如果未来接入真实设备，就需要带时间戳的电流、电压、温度与设备参数。',
        '#charts', { route: 'battery', progress: 0.5, endProgress: 1 })
    ]
  }
};

/** Routes identify real-observation tours separately from similarly named teaching models. */
export function chooseTour(route) {
  const key = String(route ?? '').replace(/^#/, '').split('?')[0];
  const byRoute = {
    overview: 'overview', events: 'overview',
    'dynamic-volcano': 'volcano', 'dynamic-quake': 'quake', 'dynamic-storm': 'storm', 'typhoon-real': 'mangkhut',
    orbital: 'orbital', volcano: 'principleVolcano', quake: 'principleQuake', typhoon: 'principleTyphoon', river: 'river', battery: 'battery'
  };
  return tours[byRoute[key] || 'overview'];
}
