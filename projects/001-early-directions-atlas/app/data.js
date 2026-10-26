/* 内容依据本次对话的历史回溯；整理日期不代表项目重新验收日期。 */
window.EARLY_DIRECTIONS = {
  title: '早期方向档案',
  compiledAt: '2026-10-26',
  updatedAt: '2026-10-27',
  understanding: '这是我们早期思考与尝试留下的方向档案：主线是用 AI 做有价值的作品、找到真实需求，逐步形成产品和经营能力。遗留包含候选、方案与原型、阶段作品及主动停止的选择，不等同于已承诺的开发任务。',
  historyAsOf: '2026-10-25',
  source: '本次对话中用户提供的早期讨论与后续交付回溯',
  categories: [
    { id: 'business', name: '产品与变现', subtitle: '找到真实需求，练习经营', color: 'olive' },
    { id: 'product', name: '产品与工具', subtitle: '把原型带到真实使用中', color: 'blue' },
    { id: 'creative', name: '创作与表达', subtitle: '用作品建立自己的语言', color: 'clay' }
  ],
  stages: {
    research: { name: '研究探索', description: '已有研究或讨论，尚未形成完整验证循环。' },
    candidate: { name: '候选清单', description: '备选想法，尚未确认立项。' },
    plan: { name: '方案阶段', description: '已有方案页，核心产品能力尚未上线。' },
    prototype: { name: '已有原型', description: '做过局部演示或实际测试，仍需完整使用验证。' },
    work: { name: '阶段作品', description: '有过完整或阶段性交付，不等于当前全面验收。' }
  },
  directions: [
    {
      id: '01', slug: 'real-demand', category: 'business', stage: 'research',
      title: '真实需求研究与商业机会筛选', shortTitle: '从真实问题出发',
      description: '研究用户问题、竞品和实现成本，逐步走完需求到付费的验证循环。',
      goal: '不凭空想点子，通过用户问题、竞品与实现成本判断值不值得做，逐步形成产品和经营能力。',
      tags: ['真实需求', '商业验证', '早期主线'],
      progress: ['做过独立开发者案例、产品研究汇总和经营练习册。', '这是贯穿多个项目的早期主线，不能仅视为某一个工具。'],
      questions: ['尚未形成“找用户验证 → 收到反馈 → 调整产品 → 付费验证”的完整循环。', '需要记录真实使用与实际付费证据，研究材料本身不能替代需求验证。'],
      nextEvidence: '围绕一个实际任务，找到愿意试用的人，记录使用、反馈、调整与付费意愿。',
      boundary: '保留为主线探索；具体产品仍由真实需求决定。',
      links: [{ label: '产品与独立开发研究页', url: 'https://indie-direction-notes.yydshly.chatgpt.site', type: '研究页' }]
    },
    {
      id: '02', slug: 'content-and-distribution', category: 'business', stage: 'research',
      title: '个人 IP、技术内容与 SEO 获客', shortTitle: '让作品遇见用户',
      description: '把真实项目和制作过程变成内容，建立能获得反馈的用户入口。',
      goal: '通过中文平台、GitHub、X 或搜索入口，让真实项目与制作过程触达潜在用户。',
      tags: ['内容实验', 'SEO', '用户反馈'],
      progress: ['讨论过四周内容实验、中文主阵地与英文复用。', '讨论过以搜索需求对应具体工具页的获客方式。'],
      questions: ['未找到持续发布和获客验证已经完成的证据。', '缺口主要是执行与反馈，需要判断哪些内容带来了实际使用者。'],
      nextEvidence: '围绕正在验证的真实项目发布一组内容，记录来源、使用和反馈。',
      boundary: '作为产品验证的配套探索；历史讨论不等于已执行的发布计划。',
      links: []
    },
    {
      id: '03', slug: 'lightweight-candidates', category: 'business', stage: 'candidate',
      title: '四个轻量产品候选', shortTitle: '留在候选架上的想法',
      description: '计算器、资料整理、情绪作品模板、内容研究助手，等待需求证据。',
      goal: '从规模较小的工具或模板切入，探索有明确用户与可验证价值的产品。',
      tags: ['尚未立项', '轻量产品', '差异化'],
      progress: ['曾列出四个轻量候选，尚未完成需求、差异化和盈利验证。'],
      questions: ['目标用户与使用频率是否明确？', '现有替代方案能否满足需求，用户为什么会选择它？'],
      nextEvidence: '先为一个候选找到实际用户问题和替代方案，再决定是否进入开发。',
      boundary: '全部保留为候选，不计为开发欠账。',
      pieces: [
        { name: '价格变动与利润计算器', state: '候选', text: '关注价格变化对利润的影响。' },
        { name: '重复资料整理工具', state: '候选', text: '减少重复资料的整理成本。' },
        { name: '情绪作品制作模板', state: '候选', text: '帮助把情绪意图转成作品。' },
        { name: '账号内容与商业线索研究助手', state: '候选', text: '研究内容账号和潜在商业线索。' }
      ],
      links: []
    },
    {
      id: '04', slug: 'documents-and-pricebooks', category: 'business', stage: 'research',
      title: '小票、PDF 与供应商价格册', shortTitle: '保留问题，也保留停止理由',
      description: '筛掉已有直接替代的通用功能，保留价格册、折扣与生效日期的业务问题。',
      goal: '减少资料整理与核对的手工工作，特别是新旧价格、包装单位及折扣变化。',
      tags: ['业务资料', '部分已停止', '价格核对'],
      progress: ['研究发现小票导入和通用 PDF 功能已有直接替代，部分方向主动淘汰。', '留下“价格册 + 客户折扣 + 生效日期”的业务问题。'],
      questions: ['剩余问题仍需真实业务资料验证。', '需要确认现有工具的缺口、单位换算与折扣生效规则。'],
      nextEvidence: '取得经授权的真实价格册与折扣规则，核对一个完整业务案例。',
      boundary: '部分方向经过研究后停止；不能把停止等同于遗漏。',
      pieces: [
        { name: '小票导入', state: '主动淘汰', text: '研究中发现已有直接替代。' },
        { name: '通用 PDF 功能', state: '主动淘汰', text: '研究中发现已有直接替代。' },
        { name: '价格册 + 折扣 + 生效日期', state: '待资料验证', text: '保留具体业务场景，等待真实资料。' }
      ],
      links: []
    },
    {
      id: '05', slug: 'audio-local-editing', category: 'product', stage: 'prototype',
      title: '音频、音乐的局部修改与交付', shortTitle: '只改一句，不必整段重做',
      description: '做过一句旁白替换演示；自然衔接、定时长字幕和成品交付仍待解决。',
      goal: '只修改一句旁白或一段音乐，进一步处理字幕与最终作品交付。',
      tags: ['音频编辑', '局部修改', '交付流程'],
      progress: ['做过“只改一句旁白”的演示。', '当时使用机械音，音乐局部修改和作品导出更多停留在研究阶段。'],
      questions: ['定时长字幕和语音自然衔接没有解决。', '需要检验从局部修改到字幕、导出成品的完整流程。'],
      nextEvidence: '用一段实际旁白完成一句替换，检查时长、衔接、字幕与最终导出。',
      boundary: '演示覆盖局部能力，不能视为完整的音频与音乐编辑产品。',
      links: [{ label: '只改一句旁白演示', url: 'https://voice-lab-sentence-demo.yydshly.chatgpt.site', type: '演示' }]
    },
    {
      id: '06', slug: 'coffee-journey', category: 'product', stage: 'work',
      title: '咖啡全过程 3D 交互', shortTitle: '从一颗咖啡果到一杯拿铁',
      description: '九阶段连续演示，呈现同一批原料的变化，已有源码与网页交付记录。',
      goal: '让人理解同一批原料如何从咖啡果变成拿铁，形成连续的交互过程。',
      tags: ['3D 交互', '九个阶段', '知识体验'],
      progress: ['有九阶段连续演示，源码与网页已经交付过。', '作为阶段作品保留，是对连续过程的可视化表达。'],
      questions: ['不属于精密仿真，尚无商业需求验证。', '历史交付记录不代表今天的兼容性与完整验收已经完成。'],
      nextEvidence: '观察真实使用者能否理解原料变化，收集交互与理解上的反馈。',
      boundary: '保留为阶段作品；不把精密仿真或商业化列为已承诺功能。',
      links: [{ label: '咖啡全过程交互体验', url: 'https://yydshly.github.io/coffee-origin-journey/', type: '作品' }]
    },
    {
      id: '07', slug: 'decision-room', category: 'product', stage: 'prototype',
      title: '共想室：多角色讨论与决策工作台', shortTitle: '协作，是否让决策更好？',
      description: '原型和模型连接做过；下一步关注依据、纠错与实际决策帮助。',
      goal: '让多个角色围绕问题协作，保留依据、分歧与决策过程，并检验是否优于单个助手。',
      tags: ['多角色协作', '决策质量', '对照验证'],
      progress: ['做过原型与模型连接。', '短测试能够接续讨论与纠错，但仍出现无依据判断。'],
      questions: ['单角色与多角色对比尚未验证完成。', '持续使用是否改善决策质量，仍缺少证据。'],
      nextEvidence: '用真实问题比较单助手与多角色的依据准确性、纠错、使用成本和实际帮助。',
      boundary: '判断标准是决策质量；角色数量不代表协作有效。',
      links: [{ label: '共想室历史入口', url: 'https://expert-decision-room.yydshly.chatgpt.site', type: '原型' }]
    },
    {
      id: '08', slug: 'job-observatory', category: 'product', stage: 'prototype',
      title: '岗位变化观察站', shortTitle: '从岗位变化，看学习方向',
      description: '已落地并积累过快照；采集可靠性和有证据的学习建议仍是重点。',
      goal: '观察真实岗位与技能要求的变化，帮助决定学习方向。',
      tags: ['岗位研究', '数据采集', '历史状态'],
      progress: ['已经落地，并积累过岗位快照。', '2026-10-25 的回溯记录称：来源连续两天返回 403，最后成功采集为 2026-10-23，旧数据仍在。'],
      questions: ['上述故障属于历史记录，2026-10-26 整理时未重新核验实时状态。', '如何提高采集可靠性，并把样本转成有依据的学习建议？'],
      nextEvidence: '先核实当前采集状态，检查恢复采集与数据时效标记，再评估建议的证据。',
      boundary: '维护已有数据与采集可靠性；历史故障不能自动视为今天仍在发生。',
      links: [{ label: '岗位变化观察站', url: 'https://job-change-observatory.yydshly.chatgpt.site', type: '原型' }]
    },
    {
      id: '09', slug: 'device-bridge', category: 'product', stage: 'prototype',
      title: '手机、平板、电脑跨设备互联', shortTitle: '从配对到确认收取',
      description: '浏览器间做过真实传输和校验；实体设备、跨网络与失败恢复待验收。',
      goal: '方便地配对、传文件、确认收取，并清楚处理失败。',
      tags: ['跨设备', '文件传输', '恢复流程'],
      progress: ['做过浏览器之间的真实传输和校验。'],
      questions: ['实体 iPad、跨网络与后台传输尚未完整验收。', '失败后的恢复流程仍有问题。'],
      nextEvidence: '在实体设备上走完配对、传输、校验、确认收取和一次失败恢复。',
      boundary: '浏览器测试不等于实体设备、跨网络和后台能力已经通过。',
      links: [{ label: '跨设备互联实验', url: 'https://device-bridge-lab.yydshly.chatgpt.site', type: '实验' }]
    },
    {
      id: '10', slug: 'paper-workbench', category: 'product', stage: 'plan',
      title: '论文研究工作台', shortTitle: '从找到论文，到真正读懂',
      description: '方案页已上线过；在线检索与 AI 阅读核心功能尚未上线。',
      goal: '检索论文，帮助理解术语、方法与图表，再围绕问题继续查新。',
      tags: ['论文检索', 'AI 阅读', '方案页'],
      progress: ['已经提出明确的使用流程，并上线过方案页。'],
      questions: ['在线检索和 AI 阅读核心功能尚未上线。', '检索、理解与继续研究的产品闭环仍未完成。'],
      nextEvidence: '围绕一个真实研究问题，完成检索、选择论文、理解方法和继续查新的最小流程。',
      boundary: '保留为方案阶段，方案展示不能当成可用的论文研究产品。',
      links: [{ label: '论文研究工作台方案', url: 'https://yydshly.github.io/paper-research-workbench/', type: '方案页' }]
    },
    {
      id: '11', slug: 'art-and-motion', category: 'creative', stage: 'work',
      title: '艺术、审美与动态视觉系列', shortTitle: '用画面、音乐和节奏表达',
      description: '《观看的重量》完整交付过；后续作品有过否定与研究，系列尚未稳定成型。',
      goal: '通过画面、音乐和节奏表现艺术与审美，形成有表达意图的作品。',
      tags: ['艺术短片', '情绪表达', '系列创作'],
      progress: ['《观看的重量》完整交付过。', '后续《暂停的权利》被用户否定；另有研究样段，系列没有稳定成型。'],
      questions: ['需要确认后续作品的艺术方向是否获得认可。', '持续制作的质量、节奏与反馈机制尚未建立。'],
      nextEvidence: '先确定一个被认可的创作方向，再完成一件完整新作并收集反馈。',
      boundary: '保留已完成作品，也保留被否定的创作记录；样段不计作完整新作。',
      pieces: [
        { name: '《观看的重量》', state: '完整交付过', text: '已有完整作品记录。' },
        { name: '《暂停的权利》', state: '被用户否定', text: '保留评价，不视为通过验收。' },
        { name: '其他研究样段', state: '研究素材', text: '用于探索，系列仍待形成。' }
      ],
      links: [{ label: '艺术与动态视觉创作台', url: 'https://weight-of-seeing.yydshly.chatgpt.site/series.html', type: '创作台' }]
    },
    {
      id: '12', slug: 'ai-roommate', category: 'creative', stage: 'work',
      title: '原创 AI 室友短剧', shortTitle: '人与 AI，住在同一个故事里',
      description: '第一集有完整配音片；第二集《大一点》停留在剧本、样段与动态分镜。',
      goal: '通过人与 AI 室友的关系和喜剧，形成可以连续制作的原创角色系列。',
      tags: ['原创角色', 'AI 短剧', '连续制作'],
      progress: ['第一集有完整配音片。', '第二集《大一点》有剧本、样段和动态分镜，未完成整集新对白。'],
      questions: ['第二集从样段到完整配音片的交付流程尚未走完。', '角色与喜剧表达能否支撑连续制作，需要通过作品检验。'],
      nextEvidence: '若选择继续，先明确第二集的完整交付范围，完成对白与成片。',
      boundary: '按每集分别记录交付；第一集完成不代表整个系列完成。',
      pieces: [
        { name: '第一集', state: '完整配音片', text: '历史记录中已有完整交付。' },
        { name: '第二集《大一点》', state: '剧本与样段', text: '动态分镜已有，整集新对白尚未完成。' }
      ],
      links: [{ label: 'AI 室友系列源码仓库', url: 'https://github.com/yydshly/ai-roommate-series', type: '仓库' }]
    }
  ],
  explorations: [
    { title: '3D 世界与知识场景', tags: ['森林', '洞穴', '遗址', '冰雪', '微观生命', '历史建筑', '声音与情绪空间'], note: '曾讨论的场景方向；其中既有作品，也有纯创意，逐项交付状态尚未核实。' },
    { title: '小龙动态形象', tags: ['网站形象', '桌面伴侣'], note: '讨论过将动态形象迁移到网站或桌面，当前记录不足以认定已经立项或完成。' },
    { title: '儿童内容与互动', tags: ['儿童动画', '救援小游戏'], note: '保留创意线索，尚未在本次回溯中逐项区分作品与想法。' }
  ],
  recommendations: [
    { number: '01', title: '一条产品主线', text: '从真实任务出发，获得一次使用、反馈与调整；单独记录付费证据。内容获客围绕实际项目展开。', type: '验证价值' },
    { number: '02', title: '先验证已有原型', text: '共想室可优先做单助手与多角色对照，用决策帮助、依据准确性和使用成本决定后续投入。', type: '建议实验' },
    { number: '03', title: '一条创作支线', text: '艺术短片或 AI 室友一次选择一个，以一件被认可的完整作品为边界。', type: '控制投入' },
    { number: '04', title: '必要维护与排队', text: '观察站先核实采集状态；论文、音频、跨设备保留明确的下一步，按实际任务选择推进。', type: '保留选择' }
  ],
  gameContext: { works: 45, entries: 99, note: '这是 2026-10-25 回溯材料中的登记口径，未在本次整理中重新清点。游戏是后来发展的支线，现有成果保留；本页不展开游戏清单。' }
};
