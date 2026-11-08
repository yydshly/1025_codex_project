// General mechanisms are taught with schematic motion. Case descriptions refer to the local evidence bundles.
// Phase starts follow the pauses in the delivered MiniMax primer.
export const stormPrimerStages = [
 {from:0, label:'暖海给雷雨补充热量和水汽', detail:'海面上先有一团雷雨扰动。暖海不断给近海面的空气补充热量和水汽，暖湿空气在雷雨区上升。'},
 {from:.199, label:'凝结放热，气流向低压汇入', detail:'水汽凝结放热，让上升持续。上升的空气在高空向外流散。流出的空气比低层补进的多时，海面气压就下降，周围空气继续向低压汇入。'},
 {from:.482, label:'地球自转使气流绕着低压转', detail:'地球自转让这股气流在北半球向运动方向的右侧偏。俯视时，气流一边往里走，一边逆时针绕着低压中心转。赤道附近，这种偏转很弱。'},
 {from:.762, label:'合适的环境让气旋继续增强', detail:'高低层的风速或风向差太大，雷雨就难围绕同一个中心组织起来。西北太平洋上的热带气旋达到台风强度，才叫台风。'},
];

const quakePrimerStages = [
 {from:0, label:'板块缓慢移动，断层一段卡住', detail:'板块一直在缓慢移动。断层是岩石中的破裂面。有的断层段被摩擦锁住，暂时滑不动。'},
 {from:.189, label:'周围岩石变形，积累应力', detail:'断层虽然卡住，两边较远的岩石仍在移动。像弯曲的尺子，断层附近的岩石逐渐变形，积累弹性能量。'},
 {from:.435, label:'断层突然滑动，释放能量', detail:'当应力超过断层能承受的阻力，卡住的一段突然滑动，破裂沿断层扩展。释放的一部分能量变成地震波，向外传开。'},
 {from:.759, label:'地震波到达，台站记录摇动', detail:'传播更快的纵波先到，横波随后到。台站把地面的起伏记录成波形。接下来看真实记录，波开始到达和振幅最大是两个时刻。'},
];

const volcanoPrimerStages = [
 {from:0, label:'一块海洋板块沉到另一块下面', detail:'先把镜头拉远。汤加附近，太平洋板块向西沉到另一块板块下面，这叫俯冲。火山位于海沟以西，俯冲板块的上方。'},
 {from:.1445, label:'板块释水，上方的岩石部分熔融', detail:'俯冲到深处时，板块里的含水矿物释放出水。水进入上方炽热的地幔，降低岩石开始熔融所需的温度。同样的温度下，部分岩石就能熔成岩浆。'},
 {from:.3122, label:'岩浆因浮力和压力向上移动', detail:'岩浆通常比周围的岩石轻，会受到向上的浮力。岩浆可以在地下暂时聚集。当压力足以撑开裂隙，就能沿裂隙继续上升。'},
 {from:.4735, label:'越往上压力越低，气泡越大', detail:'越靠近地表，岩浆受到的压力通常越低。原本溶在岩浆里的气体析出，变成气泡。气泡随减压膨胀，也会推动岩浆上升。'},
 {from:.6384, label:'通道连到表面，岩浆和气体喷出', detail:'通道连到地表或海底，岩浆和气体就可能喷出。气体容易逸出时，岩浆可以较平缓地流出。气体难以逸出时，膨胀可能把岩浆打碎，引发爆炸式喷发。'},
 {from:.8239, label:'用汤加的两套记录看喷发留下什么', detail:'这段动画解释汤加所在俯冲带的成因，以及火山喷发的一般过程。接下来，用两期测深找火山口的变化，再用当天的卫星红外图看云团展开。'},
];

export const mechanisms = {
 volcano: {
  title: '汤加为什么会有火山，岩浆又为什么喷出？',
  summary: '板块带下去的水让上方岩石更容易熔融。岩浆上升，通道打通后才可能喷出。',
  text: volcanoPrimerStages.map(stage=>stage.detail).join(''),
  phases: volcanoPrimerStages.map(stage=>stage.label),
  stages: volcanoPrimerStages,
  source: ['美国国家公园管理局 · 俯冲与岩浆形成', 'https://www.nps.gov/subjects/geology/plate-tectonics-subduction-zones.htm'],
 },
 storm: {
  title: '暖海上的雷雨，怎样变成旋转的台风？',
  text: stormPrimerStages.map(stage=>stage.detail).join(''),
  phases: stormPrimerStages.map(stage=>stage.label),
  stages: stormPrimerStages,
  source: ['NOAA · 热带气旋形成条件', 'https://oceanservice.noaa.gov/facts/how-hurricanes-form.html'],
 },
 quake: {
  title: '板块一直在动，为什么地震却突然发生？',
  text: quakePrimerStages.map(stage=>stage.detail).join(''),
  phases: quakePrimerStages.map(stage=>stage.label),
  stages: quakePrimerStages,
  source: ['USGS · 断层与地震波', 'https://www.usgs.gov/programs/earthquake-hazards/science-earthquakes'],
 },
 wildfire: {
  title: '为什么同一场山火的各个边缘扩展不同？',
  text: '山火沿可燃植被传播，风能把热量带向下风方向，坡面也会影响火如何蔓延。植被的种类和湿度会改变燃烧条件。进入迪克西山火，先找新增边界，再分别核对附近风、坡度与植被。每条线索只说明其中一部分。',
  phases: ['植被为火提供燃料', '风和坡面影响扩展方向', '拿边界变化逐项核对'],
  source: ['NWCG · 山火行为评估', 'https://www.nwcg.gov/publications/pms437/fire-assessment/evaluating-expected-fire-behavior'],
 },
 river: {
  title: '进入河流的物质，什么时候到达下游？',
  text: '水流把物质带向下游，物质也会逐渐分散开。同一时刻，河道不同位置的浓度可能不同。了解信号到达的先后，对下游取水监测很重要。我们用一次受控染料实验来看三个断面，辨认每个断面两岸什么时候测到信号。',
  phases: ['在上游释放示踪染料', '水流输运，染料逐渐分散', '下游断面先后记录浓度'],
  source: ['USGS · 河流示踪与弥散', 'https://water.usgs.gov/osw/pubs/disp/dispersion.html'],
 },
 battery: {
  title: '接上负载后，电芯有哪些变化可测？',
  text: '电芯连接外部负载后，外电路有电流。端电压、输出电流和温度分别回答还能提供多大电压、正在输出多少电流和电芯有多热。回放 NASA 电芯记录时，先看接通负载，再看负载撤去后读数如何变化。',
  phases: ['电芯接上外部负载', '电压、电流和温度各自变化', '对照接通与撤去负载'],
  source: ['NASA · 电池实验档案', 'https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/'],
 },
 engine: {
  title: '发动机在转，为什么台架扭矩还能归零？',
  text: '转速是曲轴转动的快慢，扭矩表示转动作用的大小，轨压是共轨中的燃油压力。台架档案分别记录这三个量，它们可以在不同时刻变化。回放时，注意扭矩归零、轨压下降和转速回落各自发生在什么时候。',
  phases: ['活塞往复带动曲轴转动', '转速、扭矩和轨压分别记录', '沿同一时间轴对照变化顺序'],
  source: ['Bosch · 柴油共轨系统', 'https://www.bosch-mobility.com/en/solutions/powertrain/diesel/common-rail-system-solenoid/'],
 },
};

export const guidedCases = {
 'dynamic-tide-san-francisco': {name: '旧金山港潮汐', question: '能从月升、月落判断港口涨落吗？', evidence: '港口实测潮位 · 调和预报 · 月球星历'},
 'dynamic-volcano': {kind: 'volcano', name: '汤加火山', question: '喷发怎样改变海上云团和海底地形？', evidence: 'Himawari-8 红外扫描 · 喷发前后两期测深', note: '接下来用两期测深和当天红外云图分别核对地形与云团的变化。'},
 'typhoon-real': {kind: 'storm', name: '山竹台风', question: '云带扫过香港时，风、雨、水位怎样变？', evidence: '卫星扫描 · 香港风、雨、海水位实测', note: '接着看已成形的云带如何靠近香港，再用地面记录核对风、雨和水位。'},
 'dynamic-storm': {kind: 'storm', name: '轩岚诺台风', question: '从连续扫描里，怎样辨认云带移动？', evidence: 'Himawari-8 红外扫描', note: '接着看已经成形的云带怎样北移，并分开核对卫星扫描与官方中心分析。'},
 'dynamic-quake': {kind: 'quake', name: '日本东北地震', question: '同一次地震怎样被六个台站记录？', evidence: '六站地震仪记录', note: '接着看松代和仁川各自的真实波形，用同一时钟比较各站的记录。'},
 'dynamic-quake-hualien': {kind: 'quake', name: '花莲地震', question: '台北、松代、仁川的波形哪里不同？', evidence: '三站地震仪记录', note: '接着沿同一时钟看台北、松代和仁川。曲线采用各站的仪器计数。'},
 'dynamic-wildfire-dixie': {kind: 'wildfire', name: 'Dixie 山火', question: '北侧、东侧的新增火区能用哪些线索解释？', evidence: '航空红外边界 · 测站风 · 地形与火前植被', note: '边界变化和附近测站风分别有自己的时标。风、坡面和植被是解释线索。'},
 'dynamic-river-big-piney': {kind: 'river', name: 'Big Piney 河', question: '染料信号怎样依次到达三个下游断面？', evidence: '三个断面两岸的染料浓度实测', note: '画面上的标记对应六处实测，断面之间的浓度分布仅在原理图里示意。'},
 'dynamic-battery-b0005': {kind: 'battery', name: 'NASA B0005 电芯', question: '接上和撤去负载时，三项读数怎样变化？', evidence: '首次放电实验 · 电压、电流、温度', note: '电芯剖面是结构示意，仪表和曲线来自首次放电记录。'},
 'dynamic-engine-jlu-diesel': {kind: 'engine', name: '吉林大学柴油机台架', question: '扭矩归零后，转速何时开始回落？', evidence: '本地台架原档 · 转速、扭矩、轨压', note: '剖面由实测转速驱动示意运动。轨压取自原档 RP，其记录类型未注明。'},
};

export const mechanismAudioTours = Object.fromEntries(
 Object.entries(mechanisms).filter(([kind])=>kind!=='battery'&&kind!=='engine')
  .map(([kind, lesson])=>['primer-'+kind, {steps:[{text:lesson.text}]}])
);

const composedTours = new WeakMap();

export function withCasePrimer(route, tour) {
 const scenario = guidedCases[route], lesson = mechanisms[scenario?.kind];
 if (!lesson) return tour;
 let byRoute = composedTours.get(tour);
 if (!byRoute) composedTours.set(tour, byRoute = new Map());
 if (!byRoute.has(route)) {
  const primer = {
   title: lesson.title, text: lesson.text, targetSelector: '#earth-view',
   ...(scenario.kind==='volcano'?{navLabel:'从火山成因说起'}:scenario.kind==='storm'?{navLabel:'台风形成'}:scenario.kind==='quake'?{navLabel:'地震原理'}:scenario.kind==='river'?{navLabel:'示踪原理'}:scenario.kind==='wildfire'?{navLabel:'山火线索'}:{}),
   audioId: 'primer-'+scenario.kind+'-0', cue: {route, casePrimer: true},
  };
  byRoute.set(route, {...tour, steps:[primer, ...tour.steps.map((step, audioIndex)=>({...step, audioIndex}))]});
 }
 return byRoute.get(route);
}

