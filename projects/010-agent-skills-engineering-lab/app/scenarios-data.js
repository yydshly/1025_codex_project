// Teaching scenarios for every skill; examples are not execution claims.
globalThis.SKILL_SCENARIOS = [
  {
    "slug": "using-agent-skills",
    "trigger": "接到跨多个工程阶段的任务，还不确定先做哪一步时。",
    "project": "010 · Agent Skills · 全景理解与实践",
    "situation": "当准备继续完善研究回查，但需求、接口和验收标准还没有对齐时。",
    "request": "先判断这次研究回查改动处于哪个阶段，列出现在需要的技能、触发条件和先后顺序。",
    "deliverable": "一张任务路线：先补清目标，再定行为与验收，最后安排实现和验证；标出暂不需要的技能。",
    "proof": "路线中的每个技能都对应本次任务的一个具体问题，并有进入下一步所需的材料。",
    "notFor": "只改一个已明确的文案时，不必组织完整的工程流程。",
    "control": "避免跳过需求和验证，也避免把 25 个技能全塞进一次任务。",
    "handoff": [
      "interview-me",
      "spec-driven-development",
      "planning-and-task-breakdown"
    ],
    "distinction": "它负责选用和衔接技能；planning-and-task-breakdown 才负责把确定的目标拆成执行任务。"
  },
  {
    "slug": "interview-me",
    "trigger": "说出了愿望，但使用者、真实问题或成功标准仍不清楚时。",
    "project": "009 · 资料理解与检索研究",
    "situation": "如果只提出“让以前看过的资料更有用”，还没决定优先找原文、理解内容还是安排复习。",
    "request": "围绕我最近找资料的经历逐步问清需求，先确认最常见的一次使用过程和成功标准。",
    "deliverable": "一份需求记录：谁在何时找什么、现在卡在哪、找到什么才算成功，以及仍待回答的问题。",
    "proof": "能用一个具体任务复述需求，例如“找到某个判断对应的原文段落”，并由用户确认或纠正。",
    "notFor": "输入、行为和验收已经明确的小改动，不必重新访谈。",
    "control": "避免把“资料更有用”直接误解成要建知识图谱、接模型或做复习系统。",
    "handoff": [
      "idea-refine",
      "spec-driven-development"
    ],
    "distinction": "它先弄清真正要解决的问题；idea-refine 在目标明确后比较用什么方案解决。"
  },
  {
    "slug": "idea-refine",
    "trigger": "目标大致明确，但有多种方案，尚未决定做哪一种和做到多大时。",
    "project": "006 · PromptHub · AI 工作资产与复用",
    "situation": "如果想把验证有效的工作经验变成可复用资产，正犹豫采用手工经验卡、参数化模板还是自动提炼。",
    "request": "用我提供的一段脱敏经验，对比三种复用方案，给出最小起步方案、取舍和待验证假设。",
    "deliverable": "一页方案比较和最小范围：输入示例、复用方式、维护成本、暂缓功能及下一步验证办法。",
    "proof": "同一段经验在三个方案中如何录入和复用都有样例；推荐方案说明为何先做、哪些收益仍未证实。",
    "notFor": "方案已经确定、只需按既定规格实现时，不必重新发散。",
    "control": "避免把想法直接扩大成自动化平台，也避免把预期复用价值当成已验证结果。",
    "handoff": [
      "spec-driven-development",
      "planning-and-task-breakdown"
    ],
    "distinction": "interview-me 发现需求；它比较方案并收敛范围；spec-driven-development 再规定选中方案的行为。"
  },
  {
    "slug": "spec-driven-development",
    "trigger": "准备实现一个功能，需要先把正常、异常和边界行为说清楚时。",
    "project": "010 · Agent Skills · 全景理解与实践",
    "situation": "如果以后希望研究回查支持“只导出当前项目的判断”，而现有备份仍承担完整保存的用途。",
    "request": "先写当前项目判断导出的规格，明确选择范围、无判断时的提示、文件内容和验收条件。",
    "deliverable": "一份行为规格与验收表，包含当前项目、无判断、切换项目、取消操作和导出失败等情况。",
    "proof": "给定两个项目的示例判断，验收表能明确指出导出文件应包含哪些记录，以及原有记录应保持什么状态。",
    "notFor": "行为没有变化的拼写修正，不必建立完整功能规格。",
    "control": "避免做出“按钮能点”但范围、错误处理和数据保护仍含糊的功能。",
    "handoff": [
      "api-and-interface-design",
      "planning-and-task-breakdown",
      "test-driven-development"
    ],
    "distinction": "它规定用户会看到什么行为；constraint-driven-development 规定所有后续改动都要遵守的底线。"
  },
  {
    "slug": "constraint-driven-development",
    "trigger": "项目持续迭代，需要把不可破坏的规则转成可检查的条件时。",
    "project": "010 · Agent Skills · 全景理解与实践",
    "situation": "当研究回查继续修改检索、来源展示或判断保存时，需要持续保护已有数据和出处的可信度。",
    "request": "把这次研究回查迭代必须守住的要求写成约束，逐条注明检查方法、检查时机和失败后的处理。",
    "deliverable": "一份项目约束表：不修改研究原文、来源必须可定位、异常导入不覆盖判断，以及对应检查命令或人工核对步骤。",
    "proof": "每条约束都能找到具体检查；发现失败时应修复原因，不能靠删除断言、降低门槛或隐藏错误通过。",
    "notFor": "尚未确认的功能愿望不能直接写成强制约束，也不应机械套用统一性能或覆盖率数字。",
    "control": "避免后续迭代破坏数据与来源，也避免为通过检查而悄悄放松标准。",
    "handoff": [
      "test-driven-development",
      "code-review-and-quality",
      "ci-cd-and-automation"
    ],
    "distinction": "spec-driven-development 描述本次功能；它保留跨迭代的约束，自动化检查负责实际执行其中可验证的部分。"
  },
  {
    "slug": "planning-and-task-breakdown",
    "trigger": "目标和验收已明确，但任务顺序、依赖和每步完成标志仍不清楚时。",
    "project": "009 · 资料理解与检索研究",
    "situation": "如果决定按现有六个虚构材料问题，先实现关键词检索基线，再评估其他检索方法。",
    "request": "把六题关键词基线拆成可逐步验收的任务，写明每步输入、产物、依赖和失败时先查什么。",
    "deliverable": "一份任务清单：确认样本与预期出处、完成一题检索闭环、扩展六题、汇总命中与遗漏。",
    "proof": "每项任务都能独立判断完成与否；至少先有一条“输入问题→返回段落→核对出处”的完整路径。",
    "notFor": "需求仍在“做个更聪明的知识库”层面时，应先澄清目标。",
    "control": "避免一开始铺开多个框架，直到最后才发现样本、接口和验收对不上。",
    "handoff": [
      "incremental-implementation",
      "api-and-interface-design",
      "test-driven-development"
    ],
    "distinction": "它决定先做什么、如何验收；incremental-implementation 按这些小步实际推进并保持可运行。"
  },
  {
    "slug": "context-engineering",
    "trigger": "任务跨天、跨会话或多人接力，需要恢复准确工作状态时。",
    "project": "010 · Agent Skills · 全景理解与实践",
    "situation": "当几天后继续研究回查，历史对话很多，但本次只准备调整一个已明确的检索行为。",
    "request": "先核对当前代码和未完成事项，为这次改动整理最小上下文包，再说明还缺什么信息。",
    "deliverable": "一份续做摘要：当前目标、有效约束、相关文件、已有验证、未完成问题和下一步入口。",
    "proof": "摘要里的路径能打开，完成状态能在代码或验证记录中找到依据；旧计划与现状不一致处明确标出。",
    "notFor": "不需要把所有聊天、整个仓库或无关私人资料都放入上下文。",
    "control": "避免依据过期总结重复做事、漏掉限制，或在无关材料中丢失真正的任务线索。",
    "handoff": [
      "planning-and-task-breakdown",
      "incremental-implementation",
      "source-driven-development"
    ],
    "distinction": "它选择本次任务需要的材料并恢复状态；source-driven-development 核对技术结论是否有对应版本的权威依据。"
  },
  {
    "slug": "source-driven-development",
    "trigger": "实现依赖某个库或框架的具体版本行为，不能仅凭印象下判断时。",
    "project": "009 · 资料理解与检索研究",
    "situation": "如果下一步选择 SQLite FTS5 作为关键词基线，需要先核对所选版本、可用能力及中文样例的处理方式。",
    "request": "先核对拟用环境与 SQLite 官方文档，列出 FTS5 接入所需依据和未知项，再给出一个最小验证方案。",
    "deliverable": "一份版本与来源记录，包含功能对应的官方文档段落、拟用调用方式、环境前提和仍需实验的中文样例。",
    "proof": "每项技术选择都有可打开的官方出处；无法从文档确认的效果明确留给样例验证，不写成既成结论。",
    "notFor": "纯粹修改本地变量名或处理与版本无关的简单逻辑，不必查整套外部文档。",
    "control": "避免用过时 API、混用版本，或把工具名称当成中文检索效果的证明。",
    "handoff": [
      "api-and-interface-design",
      "incremental-implementation",
      "test-driven-development"
    ],
    "distinction": "它核对技术依据与适用版本；context-engineering 负责把这些依据连同任务状态放在正确的工作上下文里。"
  },
  {
    "slug": "incremental-implementation",
    "trigger": "功能可以拆成几条完整用户路径，希望每一步都有可运行结果时。",
    "project": "009 · 资料理解与检索研究",
    "situation": "如果已决定实施六题关键词基线，可以先打通一个问题与一段出处，再逐步扩展材料和题目。",
    "request": "按计划先做一题检索与出处展示，验证后再扩展六题，每一步留下可运行结果和未解决项。",
    "deliverable": "逐步可体验的版本：一题闭环、六题检索、结果对照；每步附改动范围与验证记录。",
    "proof": "每一步都能实际输入样例问题、查看结果并回到来源；当前一步失败时先定位，不把问题带入下一步。",
    "notFor": "不能把必须同时满足的数据一致性要求拆开上线，也不必为一个小文案改动安排多轮交付。",
    "control": "避免大量代码一次写完后才发现接不上，也限制每次失败时需要排查的改动范围。",
    "handoff": [
      "test-driven-development",
      "browser-testing-with-devtools",
      "code-review-and-quality"
    ],
    "distinction": "planning-and-task-breakdown 给出步骤；它执行步骤，并在每次扩展前确认当前路径可工作。"
  },
  {
    "slug": "test-driven-development",
    "trigger": "要新增或修正可明确描述的行为，需要先让测试暴露缺口时。",
    "project": "008 · 星光卡片基地",
    "situation": "如果以后为 008 · 星光卡片基地新增或修改备份校验规则，先区分新行为与现有的原收藏保护行为。",
    "request": "先核对现有行为，用隔离虚构数据为尚未实现的新规则写测试，确认它因行为缺口失败；已有保护行为保留为通过的回归测试，再实现新规则。",
    "deliverable": "新规则从预期失败到通过的证据、原有保护行为的回归结果，以及必要实现改动。",
    "proof": "失败来自尚未实现的新行为，而不是故意破坏代码或写错测试；实现后新旧测试都通过。若旧实现已满足规则，就保留回归测试，无需制造失败。",
    "notFor": "不应为纯文案或可直接核对的小改动机械补测试，也不能只复制实现细节做自证。",
    "control": "避免先写完实现再用顺着实现编出的断言证明正确，尤其避免异常路径破坏已有数据。",
    "handoff": [
      "incremental-implementation",
      "browser-testing-with-devtools",
      "code-review-and-quality"
    ],
    "distinction": "它用先失败的行为测试引导代码；browser-testing-with-devtools 再核对真实页面操作与提示是否匹配。"
  },
  {
    "slug": "frontend-ui-engineering",
    "trigger": "需要把明确的功能做成可操作、可读、适配不同屏幕的界面时。",
    "project": "003 · 连续主题体验设计",
    "situation": "如果希望手机上调节实验参数时，仍能看清三维模型、当前数值和解释之间的关系。",
    "request": "在现有物理样章上设计并实现手机参数操作布局，保留实验状态联动，并说明加载与失败时的页面表现。",
    "deliverable": "可操作的响应式页面，清楚区分模型、参数和讲解区域，补齐控件标签、焦点和必要状态提示。",
    "proof": "在约定的手机与桌面视口完成一次调参；数值和模型同步，文字可读、控件可达，键盘操作和失败提示可检查。",
    "notFor": "物理计算是否正确、模型资源是否高效，需要相应逻辑验证或性能诊断，不能靠界面好看判断。",
    "control": "避免功能写出来却难以操作、状态互相覆盖，或移动端隐藏了关键解释和反馈。",
    "handoff": [
      "browser-testing-with-devtools",
      "code-review-and-quality",
      "performance-optimization"
    ],
    "distinction": "它设计并实现界面行为；browser-testing-with-devtools 用实际浏览器验证这些行为在目标设备条件下是否成立。"
  },
  {
    "slug": "api-and-interface-design",
    "trigger": "两个模块要协作，或现有调用方需要稳定理解输入、输出和错误时。",
    "project": "010 · Agent Skills · 全景理解与实践",
    "situation": "如果准备让研究回查的另一张页面复用同一检索逻辑，就需要先明确页面与检索模块的约定。",
    "request": "先定义检索模块的查询参数、结果字段、来源标识、排序和错误语义，再给出正常、无结果和失败的调用样例。",
    "deliverable": "一份接口约定及样例：查询与筛选输入、项目与段落结果、可定位来源，以及无结果和读取失败的不同表示。",
    "proof": "两个调用页面按同一份样例展示一致结果；缺字段、非法参数和失败响应都有明确处理，不依赖界面猜测。",
    "notFor": "本地模块接口也适用；不需要为了使用这个技能而新增服务器或强行设计网络 API。",
    "control": "避免前后模块各自猜字段、把错误当成空结果，或修改排序与格式后悄悄破坏已有调用方。",
    "handoff": [
      "test-driven-development",
      "incremental-implementation",
      "documentation-and-adrs"
    ],
    "distinction": "spec-driven-development 描述用户可见的行为；它把行为落实为模块之间可遵守、可检查的输入输出约定。"
  },
  {
    "slug": "browser-testing-with-devtools",
    "trigger": "页面改完，需要确认人在浏览器里真的能完成操作。",
    "project": "003 · 连续主题体验设计",
    "situation": "当三维物理书调整文字放大或连续阅读后，要检查返回实验时，课次、参数和模型状态是否仍一致。",
    "request": "请在实际浏览器中走一遍调参、放大阅读、返回实验，并检查窄屏和键盘操作。",
    "deliverable": "操作步骤、关键状态截图，以及可取得的控制台和网络异常记录。",
    "proof": "按相同步骤可复核参数和模型状态；窄屏按钮可用，键盘焦点能到达并退出阅读层。",
    "notFor": "只有纯数据函数变化、没有浏览器行为时；截图本身也不能证明状态正确。",
    "control": "避免代码能运行、测试通过，却在真实界面里遮挡、失焦或丢失实验上下文。",
    "handoff": [
      "debugging-and-error-recovery",
      "performance-optimization"
    ],
    "distinction": "TDD 检查定义好的行为；浏览器测试检查真实页面的交互、布局和运行证据。"
  },
  {
    "slug": "debugging-and-error-recovery",
    "trigger": "已经出现可描述的错误，需要查清原因并防止复发。",
    "project": "010 · Agent Skills · 研究回查",
    "situation": "如果回查输入某个仓库地址，却返回名称相似的另一个仓库，应沿输入规范化、匹配和结果展示定位原因。",
    "request": "请先复现这个错误匹配，保存输入和结果，再修复根因并补上对应回归检查。",
    "deliverable": "最小复现、原因说明、范围明确的修复，以及修复前失败、修复后通过的检查记录。",
    "proof": "完整仓库地址只命中正确项目；相似前缀不误命中，已有关键词搜索仍正常。",
    "notFor": "尚未观察到错误时凭猜测改代码，或靠屏蔽异常继续开发。",
    "control": "避免把表象修好却留下根因，也避免边查故障边加入新功能使证据混乱。",
    "handoff": [
      "test-driven-development",
      "code-review-and-quality"
    ],
    "distinction": "浏览器测试负责发现和复核现象；调试负责解释为什么错，并验证根因修复。"
  },
  {
    "slug": "doubt-driven-development",
    "trigger": "关键方案、代码决定或正确性判断缺少独立证据时",
    "project": "009 · 资料理解与检索研究",
    "situation": "如果准备根据26个对象的研究，为跨项目回查引入向量检索，需要先质疑“当前问题必须用 RAG 才能解决”。",
    "request": "请让独立审查者只依据需求、候选方案和证据，找出必须上向量检索这个判断的反例。",
    "deliverable": "明确的待验证主张、独立质疑记录，以及逐条采纳或驳回的依据和待验证问题。",
    "proof": "拿同一组有正确出处的问题比较关键词基线和候选方案；区分已经测得的结果与研究推断。",
    "notFor": "机械改名或普通阅读总结；不能把审查者的反对意见自动当成事实。",
    "control": "阻止未经核验的架构假设进入实现，避免研究对象多就默认需要复杂系统。",
    "handoff": [
      "spec-driven-development",
      "documentation-and-adrs"
    ],
    "distinction": "代码审查评估已完成的改动；质疑驱动在决定形成时检验假设，让纠偏更早发生。"
  },
  {
    "slug": "code-review-and-quality",
    "trigger": "一项修改已完成，需要判断它是否符合需求且没有带入问题。",
    "project": "010 · Agent Skills · 研究回查",
    "situation": "当判断保存或备份导入逻辑再次修改后，需要独立检查失败是否会覆盖旧判断，以及多个标签页是否互相覆盖。",
    "request": "请审查这次保存与导入的差异，重点检查覆盖、冲突和异常路径，并给出有位置依据的问题。",
    "deliverable": "按影响程度排列的发现、对应代码位置和触发条件，以及已检查但仍未覆盖的边界。",
    "proof": "每个实质问题能由具体路径或反例支持；修复后重走原场景，不能只看测试数量。",
    "notFor": "以个人格式偏好阻塞工作，或把“没有发现”解释成所有行为均正确。",
    "control": "从正确性、可读性、架构、安全和性能检查实际差异，减少作者视角遗漏。",
    "handoff": [
      "debugging-and-error-recovery",
      "code-simplification",
      "security-and-hardening"
    ],
    "distinction": "审查负责指出改动中的问题；简化负责改善结构，安全技能负责深入检查信任边界。"
  },
  {
    "slug": "code-simplification",
    "trigger": "功能已经正常，但具体代码越来越难读，继续修改容易误伤行为。",
    "project": "008 · 星光卡片基地",
    "situation": "如果卡片展示的角色资料、演出配置和界面更新混在一个长函数中，可先整理职责；是否需要整理须由代码检查确认。",
    "request": "请只简化这段卡片展示逻辑，保持抽取规则、收藏状态、演出顺序和错误提示不变。",
    "deliverable": "小范围重构差异、保留的行为清单，以及为什么更容易理解的说明。",
    "proof": "固定同一角色和输入，比较前后显示及状态；检查缺图和重复操作，原有检查不通过改预期来放行。",
    "notFor": "代码已经清楚、不了解历史原因，或想顺便增加动画、改随机规则时。",
    "control": "用行为不变和小步核验限制重构，避免“整理代码”变成无边界功能改写。",
    "handoff": [
      "code-review-and-quality",
      "browser-testing-with-devtools",
      "git-workflow-and-versioning"
    ],
    "distinction": "性能优化追求可测的速度或资源改善；代码简化追求可理解性，不承诺更快。"
  },
  {
    "slug": "security-and-hardening",
    "trigger": "接收外部文件或文本，且内容可能进入页面或覆盖已有资料。",
    "project": "010 · Agent Skills · 研究回查",
    "situation": "当检查判断备份导入时，要把粘贴的 JSON 当作不可信数据，考虑异常字段、超限文本和脚本样式内容。",
    "request": "请检查判断导入的信任边界，用异常备份验证拒绝规则、安全显示和原记录保护。",
    "deliverable": "输入到保存再到显示的数据流、针对性加固项、异常样例及残余风险说明。",
    "proof": "非法结构被拒绝且原记录不变；脚本样式文本只作为文字显示；诊断输出不包含判断正文。",
    "notFor": "把一次扫描当全面安全认证，或只加提示语而不改变代码中的边界。",
    "control": "防止不可信输入执行脚本、造成异常覆盖，或通过日志暴露个人判断。",
    "handoff": [
      "api-and-interface-design",
      "test-driven-development",
      "code-review-and-quality"
    ],
    "distinction": "接口设计约定允许什么输入；安全加固检查恶意或异常输入能否绕过约定。"
  },
  {
    "slug": "performance-optimization",
    "trigger": "出现卡顿或有明确速度目标，需要先知道慢在哪里。",
    "project": "003 · 连续主题体验设计",
    "situation": "如果物理书在某台设备翻页、运行实验或播放导览时卡顿，应区分模型渲染、资源加载和界面更新的耗时。",
    "request": "请固定设备和同一课次操作，记录性能基线，找到瓶颈后只改一个环节并重复测量。",
    "deliverable": "可复现测量条件、分析轨迹、改动前后原始数据，以及是否保留该优化的理由。",
    "proof": "同条件重复测量的差异超过正常波动，且实验数值、画面和导览仍正确；没有改善就如实记录。",
    "notFor": "没有慢的证据就加缓存，或用一次快跑宣称所有设备体验提升。",
    "control": "避免针对错误环节增加复杂度，也避免牺牲必要功能换取漂亮数据。",
    "handoff": [
      "browser-testing-with-devtools",
      "observability-and-instrumentation"
    ],
    "distinction": "观测提供慢的线索；性能优化通过受控实验判断具体改动是否有效。"
  },
  {
    "slug": "git-workflow-and-versioning",
    "trigger": "多个项目同时有未提交修改，需要明确这次保存哪些变化。",
    "project": "研究总库 · 010 Agent Skills 与其他编号项目",
    "situation": "当准备只保存010学习导览的成果，而003、008、009等项目还有各自工作时，需要先划清差异归属。",
    "request": "请先核对工作区，把010相关变化整理成可审查的提交范围，逐项说明关联的总库索引改动。",
    "deliverable": "按目的划分的变更清单、暂存内容核对结果、验证记录；实际提交按任务授权执行。",
    "proof": "逐文件核对差异，确认只包含本次成果和必要索引更新，其他未提交工作仍保留。",
    "notFor": "用全量暂存混入其他工作，或把 Git 当作浏览器判断与日常数据的完整备份。",
    "control": "让改动边界可审查、可追溯，避免一次保存意外夹带别的项目成果。",
    "handoff": [
      "code-review-and-quality",
      "ci-cd-and-automation",
      "shipping-and-launch"
    ],
    "distinction": "增量实现划分功能步骤；Git 工作流组织这些步骤的差异、历史和版本。"
  },
  {
    "slug": "ci-cd-and-automation",
    "trigger": "同一批检查需要随每次修改重复执行，不能只靠开发者记得运行。",
    "project": "研究总库 · 010 Agent Skills · 研究回查",
    "situation": "如果希望以后修改项目索引或回查逻辑时自动检查编号、数据生成和搜索保存行为，可把现有命令接入流水线。",
    "request": "请把总库检查和010回查检查接入持续集成，保留失败输出，并验证失败是否真正阻止目标合并。",
    "deliverable": "与现有命令一致的流水线配置、实际运行记录，以及平台必需检查是否生效的说明。",
    "proof": "正确版本通过；隔离分支上的已知错误失败；若要求阻断合并，还需核实平台规则实际生效。",
    "notFor": "只写配置就宣称质量门槛已生效，或为绿灯跳过失败项。",
    "control": "减少漏跑和环境不一致，使已明确的规则反复得到执行并留下证据。",
    "handoff": [
      "constraint-driven-development",
      "test-driven-development",
      "shipping-and-launch"
    ],
    "distinction": "约束驱动确定必须守住什么；CI 把可执行的检查重复运行，发布技能核对目标环境交付。"
  },
  {
    "slug": "deprecation-and-migration",
    "trigger": "旧格式已有使用者或数据，而新需求确实需要更换结构。",
    "project": "010 · Agent Skills · 研究回查",
    "situation": "如果未来判断备份需要增加结构化出处字段并升级版本，应先确认旧备份和旧页面的使用情况；当前并未要求升级。",
    "request": "请为判断备份的新旧格式设计兼容迁移，先在隔离副本验证，逐条保留旧判断并说明恢复办法。",
    "deliverable": "版本与消费者清单、兼容读取方案、副本转换工具、逐条核验记录及分阶段切换条件。",
    "proof": "项目编号和判断正文逐条一致；无法推断的出处保留未知；重复转换不重复记录，旧备份可以恢复。",
    "notFor": "仅因格式旧就强制重写，或替代方案未验证便删除旧路径；不涉及日常信息库清理。",
    "control": "把新增、兼容、转换、切换和退役分开，防止新代码可用却使旧资料丢失或无法读取。",
    "handoff": [
      "api-and-interface-design",
      "incremental-implementation",
      "documentation-and-adrs"
    ],
    "distinction": "代码简化保持外部行为；迁移有意改变格式或契约，必须处理兼容和数据恢复，代码回退不足以恢复数据。"
  },
  {
    "slug": "documentation-and-adrs",
    "trigger": "有重要取舍需要保留理由，防止以后的人或 AI 重新猜测。",
    "project": "006 · PromptHub · AI 工作资产与复用",
    "situation": "当继续研究如何复用经验时，需要明确目前只有研究结论，自动从笔记提炼资产和回写仍待独立设计与验证。",
    "request": "请记录PromptHub研究的现有能力、接入设想、替代方案和未验证点，让后续实施能知道为什么这样选。",
    "deliverable": "带来源和状态的使用说明、决策记录，以及什么新证据出现时需要重新评估的条件。",
    "proof": "每项能力能回到原文或实际运行证据；研究结论、候选方案和已经实现的功能清楚分开。",
    "notFor": "把宣传描述写成已经验证的收益，或为一次小改动堆积重复文档。",
    "control": "防止后续实施把设想当成现状，或丢掉隐私、接入成本和维护责任等选择背景。",
    "handoff": [
      "context-engineering",
      "spec-driven-development",
      "doubt-driven-development"
    ],
    "distinction": "规格说明要交付什么；ADR 记录为何这样选、放弃了什么，以及决定何时需要重评。"
  },
  {
    "slug": "observability-and-instrumentation",
    "trigger": "问题只在使用中偶发，现有信息无法判断故障环节。",
    "project": "008 · 星光卡片基地",
    "situation": "如果某些卡片偶发缺图或演出未完成，仅有“没显示”的反馈不够，需要分辨资料缺失、资源加载和渲染失败。",
    "request": "请为卡片展示加上最少必要的诊断事件，让我们能判断失败在哪一步，不记录私人收藏内容。",
    "deliverable": "要回答的问题清单、含角色编号和阶段的事件字段、错误分类，以及查看诊断的方法。",
    "proof": "在测试副本制造一个缺失资源，能够只凭事件定位卡片和失败阶段；核对日志无私人正文。",
    "notFor": "小网页直接照搬复杂监控平台，或日志很多却无法回答具体问题。",
    "control": "让实际运行问题留下足够线索，同时限制诊断成本和信息暴露。",
    "handoff": [
      "debugging-and-error-recovery",
      "performance-optimization",
      "security-and-hardening"
    ],
    "distinction": "调试解决当前具体错误；观测让未来运行中的错误也有证据可查，不能代替根因分析。"
  },
  {
    "slug": "shipping-and-launch",
    "trigger": "准备把已完成的功能交到目标使用环境，而不只是本机可用。",
    "project": "010 · Agent Skills · 全景理解与实践",
    "situation": "如果以后决定把学习导览和回查页发布到总库站点，应检查编号子路径和资源地址；换站点后浏览器判断不会自动迁移。",
    "request": "请按总库部署约定准备这次发布，列出目标地址验收步骤、判断备份办法和可执行回退方案。",
    "deliverable": "明确版本的发布材料、目标环境验收记录、变更说明及暂停或回退条件；是否已发布须据实标注。",
    "proof": "实际目标地址能完成导览、搜索、出处查看和判断保存；导出再导入可恢复样例判断，旧版恢复路径可说明。",
    "notFor": "把本机截图或构建成功当正式上线证据；回退网页不能代替恢复用户判断。",
    "control": "核对交付环境和用户迁移路径，避免发布成功但链接失效、数据误以为丢失或无法恢复。",
    "handoff": [
      "ci-cd-and-automation",
      "browser-testing-with-devtools",
      "deprecation-and-migration"
    ],
    "distinction": "CI 执行重复检查和部署步骤；发布技能确认具体版本在目标环境可用，并准备异常时的处理办法。"
  }
];
