'use strict';

const methodSteps = [
  { kicker: '第一步 / 定下终点', title: '先想清楚，用户最后能做什么。', description: '把主题收窄成一个可以观察的能力：用户体验后，能解释什么、判断什么，或独立完成什么。', example: '主题是“数据筛选”。目标可以是：用户能判断哪些记录会留下，并解释条件改变后的结果。', output: '一句理解目标、一个常见误解、一道换材料的检验题。' },
  { kicker: '第二步 / 找到骨架', title: '把知识拆成可以看懂的关系。', description: '找出对象、条件、变化与结果。先判断内容属于结构、过程、规则、比例还是证据，再选择适合的展示。', example: '筛选的骨架很简单：一组记录，经过同一个条件判断，形成结果。每张卡片的身份与数值都保持可辨认。', output: '一张内容关系表，以及章节之间的理解依赖。' },
  { kicker: '第三步 / 进入情境', title: '让用户在一个连贯的环境里探索。', description: '选一个能自然容纳内容对象和操作的环境。它可以是工作台、档案桌或清晰的图表，让不同场景共享同一种语境。', example: '把筛选放在数据工作台上。左边是原数据，中间是条件，右边是结果；下一章加入组合条件，仍沿用这张工作台。', output: '一句体验环境描述，以及它与主题的对应和边界。' },
  { kicker: '第四步 / 建立语言', title: '为每种颜色、图形和动作约定含义。', description: '统一风格也包括统一意义。同一对象有稳定的名字和形状；颜色、位置、大小与动效各自承担明确的信息。', example: '卡片一直保留 A、B、C、D 编号。满足条件时，背景变绿并显示“已保留”；文字标记保证状态也能被直接读懂。', output: '一套对象、视觉、动作、文案和替代操作规则。' },
  { kicker: '第五步 / 编排过程', title: '把一个概念组织成一次完整探索。', description: '提出具体问题，让用户预测，再看演示、自己操作、获得解释，最后换一组材料作判断。环节可以合并，理解过程要连贯。', example: '先问“18 会留下吗？”；展示 18 ≥ 18；让用户改阈值；解释结果；最后改用库存数据，检查同一条规则能否迁移。', output: '一个含提问、预测、演示、操作、解释和迁移的场景。' },
  { kicker: '第六步 / 指向当下', title: '让讲解始终跟着当前画面走。', description: '先写用户此刻看到什么，再写要说什么。条件、结果、统计和文案一起变化，避免文字与画面处于不同阶段。', example: '阈值从 18 改为 24，卡片 B 不再满足，数量从 3 变成 2；此时的讲解就解释这个具体变化。', output: '一张条件、画面、结果与解释同步的状态表。' },
  { kicker: '第七步 / 让操作有用', title: '每个主要操作，都带来可解释的结果。', description: '说明用户改变什么、哪些条件固定、结果怎样响应。初次探索优先改变一个条件，并提供比较、重试和重置。', example: '先只改变筛选阈值，固定原始数据。阈值为 31 时，说明为什么结果为空，并让用户一键回到初始条件。', output: '一个主要操作，以及结果、边界状态和恢复方式。' },
  { kicker: '第八步 / 验证理解', title: '换一个例子，看看理解能否带走。', description: '观察用户能否说出问题、解释结果，并把规则用到新材料上。根据真实的断点修改，再扩充主题内容。', example: '演示用数值 12、18、24、30，检验题换成库存 0、3、8、10。如果用户能解释“库存 ≥ 3”的结果，理解就有了可观察的证据。', output: '一个迁移任务、一份实际试用记录和下一轮修改依据。' },
];

const directionGroups = {
  topic: {
    intro: '从规则明确、结果可观察的主题开始，再进入材料解释与开放创作。',
    count: '6 个主题方向',
    items: [
      { symbol: '≥', badge: '优先尝试', title: '规律与机制', subtitle: '物理 · 数学 · 编程', description: '改变一个条件，观察同一个对象如何响应。把公式、算法与因果关系变成可以比较的过程。', start: '把本页筛选实验扩为“单条件 → 组合条件 → 新数据判断”三个场景。', deliverable: '一条规则、一个工作台、三段连贯场景。', check: '用户能预测新条件的结果，并解释原因。', boundary: '明确规则和适用范围，展示边界与空结果。' },
      { symbol: '♫', badge: '适合下一主题', title: '技能与练习', subtitle: '节奏 · 摄影 · 工具操作', description: '把知识转成可以反复尝试的动作。让练习、作品变化与反馈在同一个工作台里发生。', start: '做一个四格节奏工作台：开关敲击位置，播放并对照原排列。', deliverable: '一个可重复的练习，配前后比较和独立任务。', check: '用户能独立完成一组新的练习并说明选择。', boundary: '一次先练一个变量；声音、画面和操作保持同步。' },
      { symbol: '↔', badge: '材料先行', title: '历史与叙事', subtitle: '时间线 · 档案 · 多种视角', description: '让用户自己查看、排列与对照材料，逐步形成有依据的解释，理解事件之间的联系。', start: '用三份注明来源的材料，对照一个问题的不同解释。正式制作前核对材料。', deliverable: '可展开的时间线、材料卡与解释对照区。', check: '用户能指出判断依据，以及暂时无法判断的部分。', boundary: '区分记录、解释与推测；先后顺序本身不证明因果。' },
      { symbol: '⊞', badge: '按结构选形式', title: '产品与系统', subtitle: '机械 · 软件 · 工作原理', description: '从整体进入部件，再跟随一次操作，看系统如何协同响应。适合解释复杂工具和产品机制。', start: '选一个产品，做“整体 → 三个关键部件 → 一次运行”的场景。', deliverable: '一个结构图，以及用户操作后的联动演示。', check: '用户能把部件作用和整体结果联系起来。', boundary: '空间结构有助理解时再引入 3D；保留整体定位。' },
      { symbol: '◐', badge: '允许开放答案', title: '创作与审美', subtitle: '配色 · 构图 · 材质 · 写作', description: '让用户重组元素、比较差异，把表达意图和作品变化连起来，形成自己的判断。', start: '固定一张画面，只调整一个构图关系，保留原版与新版并排对照。', deliverable: '一个可编辑的小作品与意图说明。', check: '用户能描述变化，并解释它怎样服务于表达。', boundary: '区分可观察差异与个人偏好，说明评价依据。' },
      { symbol: '⇢', badge: '先做简化模型', title: '流程与决策', subtitle: '协作 · 业务 · 资源安排', description: '把规则、路径和取舍展开，让人尝试不同选择，观察流程如何变化。', start: '选一个熟悉的小流程，改变一项输入，比较两条路径与资源占用。', deliverable: '一个有明确假设的流程模型和对比结果。', check: '用户能解释选择的后果、限制与取舍。', boundary: '标出模型假设，保留真实情境中的例外。' },
    ],
  },
  expression: {
    intro: '根据要解释的关系增加表达能力，让每一种媒介承担明确的任务。',
    count: '3 种表达能力',
    items: [
      { symbol: '◇', badge: '空间关系需要时', title: '从平面到立体', subtitle: '拆解 · 剖面 · 空间联动', description: '当内部结构、方向或空间关系难以用平面说明时，引入旋转、剖切与部件联动。', start: '把一个结构图升级为可查看内部的三部件模型，同时保留二维示意。', deliverable: '一个能解释空间关系的立体场景。', check: '用户能定位部件、解释连接关系，并返回整体。', boundary: '先验证二维是否足够；兼顾设备性能与替代展示。' },
      { symbol: '≋', badge: '先做短循环', title: '声音与时间', subtitle: '节奏 · 过程 · 同步反馈', description: '用声音和时间进程表现变化，让用户暂停、回放、对比，理解一个过程如何展开。', start: '为四格节奏提供同步指针、发声标记与暂停回放。', deliverable: '一段可操控的短过程，多种感官表达一致。', check: '用户能定位变化发生的位置，并比较两次结果。', boundary: '声音由用户启动；静音与减少动态效果时仍能理解。' },
      { symbol: '⌕', badge: '保留来源', title: '材料与多视角', subtitle: '证据 · 时间线 · 注释', description: '把补充材料嵌进当前问题。用户可以深入查看来源，比较几种解释，再回到主线。', start: '在一个场景中加入“查看原材料”和并排对照两种解释的入口。', deliverable: '主线讲解、材料卡与解释之间的可追溯连接。', check: '用户能区分材料所说、作者解释与自己的判断。', boundary: '避免材料层层展开后失去主线，保留上下文。' },
    ],
  },
  system: {
    intro: '在两个真实主题中确认重复需求，再把有效做法沉淀成组件和内容规范。',
    count: '3 个制作方向',
    items: [
      { symbol: '⊡', badge: '第二主题后提取', title: '场景组件库', subtitle: '预测 · 演示 · 对比 · 反馈', description: '复用稳定的交互结构，把预测、条件控制、前后对比和迁移任务做成可组合的组件。', start: '从两个已试用的场景中，提取一项相同交互及其状态约定。', deliverable: '带键盘操作、重置与边界状态的组件。', check: '组件用于另一主题后，仍能支持该主题的理解目标。', boundary: '保留主题差异，避免为了组件方便而改写内容关系。' },
      { symbol: '{ }', badge: '先约定内容结构', title: '内容配置驱动', subtitle: '主题 · 场景 · 规则 · 文案', description: '把可重复的内容结构从界面中分离，让新主题能沿用场景骨架，独立填写材料与规则。', start: '先为目标、对象、条件、文案、反馈和检验任务定义一份场景配置。', deliverable: '一套配置规范，以及两种主题的使用例。', check: '替换内容后，展示与解释仍随同一份状态更新。', boundary: '复杂模拟仍需独立实现；配置校验不能代替事实核对。' },
      { symbol: '✳', badge: '保留人工判断', title: 'AI 辅助编排', subtitle: '拆题 · 草稿 · 原型 · 检查', description: '让 AI 按统一方法拆解主题、草拟场景和检查对应关系，把人的精力放在内容判断与试用反馈上。', start: '用已有提示词为一个新主题生成一场方案，再按验收清单修改。', deliverable: '一份可核对、可编辑的场景方案和修改记录。', check: '能追踪每段内容的来源、设计假设与验证结果。', boundary: '本页仅生成固定格式提纲；接入模型与服务属于后续实现。' },
    ],
  },
};

let currentStep = 0;
const stepButtons = [...document.querySelectorAll('[data-step]')];
function renderStep(index) {
  currentStep = index;
  const step = methodSteps[index];
  stepButtons.forEach((button, buttonIndex) => {
    button.classList.toggle('active', buttonIndex === index);
    button.setAttribute('aria-pressed', String(buttonIndex === index));
  });
  document.querySelector('#step-kicker').textContent = step.kicker;
  document.querySelector('#step-counter').textContent = `${String(index + 1).padStart(2, '0')} / 08`;
  document.querySelector('#step-title').textContent = step.title;
  document.querySelector('#step-description').textContent = step.description;
  document.querySelector('#step-example').textContent = step.example;
  document.querySelector('#step-output').textContent = step.output;
  document.querySelector('#next-step').innerHTML = index === 7 ? '回到第一步 <span aria-hidden="true">↺</span>' : '下一步 <span aria-hidden="true">→</span>';
}
stepButtons.forEach(button => button.addEventListener('click', () => renderStep(Number(button.dataset.step))));
document.querySelector('#next-step').addEventListener('click', () => renderStep((currentStep + 1) % methodSteps.length));

const records = [{ id: 'A', value: 12 }, { id: 'B', value: 18 }, { id: 'C', value: 24 }, { id: 'D', value: 30 }];
const thresholdInput = document.querySelector('#threshold');
const thresholdPresets = [...document.querySelectorAll('[data-threshold]')];
function renderFilter(threshold) {
  const kept = records.filter(record => record.value >= threshold);
  thresholdInput.value = String(threshold);
  document.querySelector('#threshold-value').textContent = String(threshold);
  document.querySelector('#result-count').textContent = String(kept.length);
  document.querySelector('#result-records').textContent = kept.length ? kept.map(record => record.id).join('、') : '无记录';
  document.querySelectorAll('[data-record]').forEach(card => {
    const isKept = Number(card.dataset.record) >= threshold;
    card.classList.toggle('kept', isKept);
    card.querySelector('.record-state').textContent = isKept ? '已保留' : '未满足';
  });
  thresholdPresets.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.threshold) === threshold)));
  let explanation;
  if (threshold === 18) explanation = 'B 的数值刚好是 18，也满足“大于或等于 18”。因此 B、C、D 被保留，共 3 条。';
  else if (!kept.length) explanation = `最大的数值是 30，也小于 ${threshold}，因此没有记录满足条件。原始数据仍保留，只是这次的结果为空。`;
  else if (kept.length === records.length) explanation = `最小的数值是 12，也大于或等于 ${threshold}，因此四条记录都满足条件。原始数据没有变化。`;
  else {
    const excluded = records.filter(record => record.value < threshold);
    const equal = kept.find(record => record.value === threshold);
    explanation = `${kept.map(record => record.id).join('、')} 满足“数值 ≥ ${threshold}”，共 ${kept.length} 条；${excluded.map(record => record.id).join('、')} 的数值较小，未被选中。${equal ? `${equal.id} 刚好等于阈值，也会留下。` : ''}`;
  }
  document.querySelector('#filter-explanation').textContent = explanation;
}
thresholdInput.addEventListener('input', () => renderFilter(Number(thresholdInput.value)));
thresholdPresets.forEach(button => button.addEventListener('click', () => renderFilter(Number(button.dataset.threshold))));
document.querySelector('#reset-filter').addEventListener('click', () => renderFilter(18));

const answerButtons = [...document.querySelectorAll('[data-answer]')];
answerButtons.forEach(button => button.addEventListener('click', () => {
  answerButtons.forEach(answer => answer.setAttribute('aria-pressed', String(answer === button)));
  document.querySelector('#quiz-feedback').textContent = Number(button.dataset.answer) === 3
    ? '判断正确。3、8、10 都满足“库存 ≥ 3”，共 3 条；恰好等于 3 也会留下。'
    : '再比较一次：0 不满足；3、8、10 都满足。注意“大于或等于”包含恰好等于 3，所以结果是 3 条。';
}));

const categoryTabs = [...document.querySelectorAll('[data-category]')];
function renderDirections(category, moveFocus = false) {
  const group = directionGroups[category];
  categoryTabs.forEach(tab => {
    const selected = tab.dataset.category === category;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && moveFocus) tab.focus();
  });
  document.querySelector('#direction-panel').setAttribute('aria-labelledby', `tab-${category}`);
  document.querySelector('#direction-intro').textContent = group.intro;
  document.querySelector('#direction-count').textContent = group.count;
  const grid = document.querySelector('#direction-grid');
  grid.replaceChildren();
  group.items.forEach(item => {
    const article = document.createElement('article');
    article.className = 'direction-card';
    // Direction entries are authored constants; user-provided text never enters this markup.
    article.innerHTML = `<div class="direction-card-head"><span class="direction-icon" aria-hidden="true">${item.symbol}</span><span class="direction-badge">${item.badge}</span></div><h3>${item.title}</h3><p class="direction-subtitle">${item.subtitle}</p><p class="direction-description">${item.description}</p><details><summary>查看起步方案 <span aria-hidden="true">＋</span></summary><dl class="direction-plan"><dt>先做什么</dt><dd>${item.start}</dd><dt>最小交付</dt><dd>${item.deliverable}</dd><dt>怎样检验</dt><dd>${item.check}</dd><dt>需要留意</dt><dd>${item.boundary}</dd></dl></details>`;
    grid.append(article);
  });
}
categoryTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => renderDirections(tab.dataset.category));
  tab.addEventListener('keydown', event => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % categoryTabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index + categoryTabs.length - 1) % categoryTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = categoryTabs.length - 1;
    else return;
    event.preventDefault();
    renderDirections(categoryTabs[nextIndex].dataset.category, true);
  });
});

const briefForm = document.querySelector('#brief-form');
const briefOutput = document.querySelector('#brief-output');
let generatedTopic = '';
function createBrief(topic, audience, goal) {
  return `# ${topic}互动体验规划

## 理解目标
- 主题：${topic}
- 目标用户：${audience}
- 体验后能做到：${goal}
- 一个常见误解：【补充】
- 换材料后的检验任务：【补充】

## 内容与统一表达
- 事实、规则与材料来源：【补充并核对】
- 需要看懂的对象与关系：【补充】
- 统一体验环境：【选择适合主题的工作台、图表或叙事情境】
- 对象身份、颜色、图形和动作约定：【补充】
- 模型假设与表达边界：【补充】

## 第一个完整场景
1. 提问：围绕“${goal}”提出一个具体问题。
2. 预测：让${audience}先判断，也可以跳过。
3. 演示：展示一个关键变化，标出固定条件。
4. 操作：先只改变一个与理解目标相关的条件。
5. 反馈：让对象、结果与讲解同步更新，并解释原因。
6. 迁移：更换材料，检验能否独立判断。
- 初始画面与默认条件：【补充】
- 实际文案与结果规则：【补充】
- 空结果、边界和重置：【补充】
- 键盘、窄屏及声音或动态效果的替代方式：【补充】

## 扩展方向
- 下一场景只新增哪一个关系：【补充】
- 沿用哪些对象与表达规则：【补充】
- 先完成一个主题，再按实际重复需求提取组件。

## 验收记录
- 用户能说出场景的问题：【待试用】
- 能操作并解释结果：【待试用】
- 能在新例子中应用理解：【待试用】
- 最需要修改的一个地方：【待试用】

此提纲按研究 003 的方法在本页面生成，具体知识、规则和材料需要继续补充。
`;
}
briefForm.addEventListener('submit', event => {
  event.preventDefault();
  const fields = ['brief-topic', 'brief-audience', 'brief-goal'].map(id => document.getElementById(id));
  fields.forEach(field => field.setCustomValidity(field.value.trim() ? '' : '请填写具体内容。'));
  if (!briefForm.reportValidity()) return;
  const [topic, audience, goal] = fields.map(field => field.value.trim());
  generatedTopic = topic;
  briefOutput.value = createBrief(topic, audience, goal);
  document.querySelector('#brief-result').hidden = false;
  document.querySelector('#brief-feedback').textContent = '提纲已生成。补齐具体场景、规则和来源后，就可以开始原型。';
});
briefForm.addEventListener('input', event => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) event.target.setCustomValidity('');
});
document.querySelector('#copy-brief').addEventListener('click', async () => {
  const status = document.querySelector('#brief-feedback');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(briefOutput.value);
    status.textContent = '已复制主题提纲，可以粘贴到文档或新的对话中。';
  } catch {
    briefOutput.focus();
    briefOutput.select();
    status.textContent = '当前浏览器未能直接复制。内容已选中，可手动复制或下载。';
  }
});
document.querySelector('#download-brief').addEventListener('click', () => {
  const blob = new Blob([briefOutput.value], { type: 'text/markdown;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = `${generatedTopic.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').slice(0, 80) || '新主题'}-互动体验提纲.md`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10000);
  document.querySelector('#brief-feedback').textContent = '已发起 Markdown 下载，请在浏览器下载列表中查看。';
});

renderDirections('topic');
renderFilter(18);
