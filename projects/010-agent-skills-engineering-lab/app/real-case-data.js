/* 采用状态表示相关方法进入本轮工作，不等于完整执行上游全部流程。 */
globalThis.REAL_CASE = {
  "title": "把“这个库研究过吗？”变成可追溯的研究回顾入口",
  "need": "最近我们已收录多个研究项目，却仍需要在聊天里追问“以前研究过这个库吗、有什么价值、有哪些结果”。这次直接使用当前研究总库的真实登记与说明，完成“查到项目 → 回到依据 → 记下理解 → 导出并恢复”的使用闭环，再把实际工程过程与 Skill 一一对应。",
  "selectionReasons": [
    "需求直接来自本聊天的起点“我们以前研究过这个库吗”，可以在近期真实工作中反复使用。",
    "009 已提出可追溯阅读、跨日回顾与经验复用；006 已讨论把研究经验沉淀为可复用资产。",
    "当前有 10 个登记项目及其 README，资料来源和验收对象明确，适合从真实数据观察落地过程。",
    "现有 010 导览可以承载操作入口和复盘材料；本轮使用静态页面与浏览器本地笔记，范围可控。"
  ],
  "sourceEvidence": [
    {
      "label": "真实问题：有没有研究过这个库",
      "path": "本聊天开头的用户提问",
      "reason": "用户给出 agent-skills 仓库后，先询问是否以前研究过；本轮将这一重复查找动作做成可用入口。"
    },
    {
      "label": "索引的唯一来源",
      "path": "AGENTS.md:5；projects.json",
      "reason": "总库约定 projects.json 为登记来源；本轮只从登记项构建索引，不维护第二份手工项目清单。"
    },
    {
      "label": "可追溯回顾与经验复用",
      "path": "projects/009-knowledge-processing-atlas/README.md:3、53",
      "reason": "009 已把可追溯阅读、回顾和经验复用列为具体方向；本轮先落实查找和来源核验。"
    },
    {
      "label": "有效经验形成工作资产",
      "path": "projects/006-prompthub-ai-assets/README.md:3、44",
      "reason": "006 讨论减少重复说明和沉淀工作方法；回顾笔记帮助记录本次理解，仍需用户判断。"
    }
  ],
  "acceptance": [
    {
      "id": "A1",
      "text": "登记项目与索引一致，每个结果保留研究说明出处。",
      "verify": "构建快照并执行 --check；核对项目集合、来源路径、README 哈希及段落行号。"
    },
    {
      "id": "A2",
      "text": "仓库链接、名称、关键词和阶段筛选能定位真实资料。",
      "verify": "查询 agent-skills 仓库链接、PromptHub、Graphiti、跨日回顾；比较预期项目和实际命中段落，多关键词按 AND 匹配。"
    },
    {
      "id": "A3",
      "text": "没有命中时说明当前快照未找到，结果不补造历史结论。",
      "verify": "查询不存在的名称；核对空状态。收录日期不改称研究完成日期，已总结不改称已实测。"
    },
    {
      "id": "A4",
      "text": "回顾笔记可保存、重新加载、导出并通过粘贴 JSON 导入合并。",
      "verify": "保存临时演示笔记，重新加载页面，核对内容；导出后在独立验证状态中导入，并检查幂等合并。"
    },
    {
      "id": "A5",
      "text": "非法备份、未知版本和冲突不会覆盖已有笔记。",
      "verify": "运行格式、项目 ID、长度和冲突测试；对失败前后的状态做相等比较，确认成功提示只出现在实际保存后。"
    },
    {
      "id": "A6",
      "text": "用户能从真实场景走到 Skill 原理，再回到产物与验证证据。",
      "verify": "浏览 6 个阶段，核对 25 项覆盖且无重复；检查规格、约束、计划、证据及原技能链接。"
    }
  ],
  "phases": [
    {
      "id": "intent",
      "title": "01 · 从真实困扰提取目标",
      "question": "我们最近反复遇到的查找问题是什么？",
      "goal": "将“以前研究过吗”明确为：查询当前总库，看到研究结论及其出处，并留下本次回顾。",
      "skills": [
        "using-agent-skills",
        "interview-me",
        "idea-refine",
        "context-engineering"
      ],
      "actions": [
        "读取本聊天和现有 006、009、010 说明，提取已有目标与边界；不要求用户重复回答资料里已有的信息。",
        "比较研究回顾入口与 009 检索基线实验，选择能直接服务当前工作、可在现有网页完成的回顾入口。",
        "用户已选择“研究资料回查：跨项目检索、查看出处、保存判断”。据此保存需求与范围；访谈方法采用上下文提取与偏好确认。"
      ],
      "artifacts": [
        {
          "label": "需求与场景规格",
          "href": "../research/real-case/SPEC.md"
        }
      ],
      "control": "目标要能对应用户的实际动作。只有“学习 Skill”还不足以确定产品行为；查询、核对来源、记录理解构成可验收的闭环。",
      "reflect": [
        "这个功能将减少我哪一种重复操作？",
        "搜索没有结果时，页面能否证明我们从未研究过？为什么不能？"
      ]
    },
    {
      "id": "contract",
      "title": "02 · 写清范围、验收与质量底线",
      "question": "怎样才算做对，哪些边界必须一直守住？",
      "goal": "在实现前固定数据来源、查询语义、笔记格式和失败行为。",
      "skills": [
        "spec-driven-development",
        "constraint-driven-development",
        "security-and-hardening"
      ],
      "actions": [
        "把项目登记和 README 定为只读输入；保存来源哈希与段落行号，索引作为可重建的派生产物。",
        "明确多关键词 AND、阶段筛选、GitHub 仓库链接规范化，以及“当前快照未找到”的语义。",
        "约定笔记只在当前浏览器存储；导入需严格验证结构、版本、项目 ID 和长度，冲突不覆盖。",
        "为每个验收条件指定命令或实际浏览器动作；将未运行的检查留为待验证。"
      ],
      "artifacts": [
        {
          "label": "验收条件与接口",
          "href": "../research/real-case/SPEC.md"
        },
        {
          "label": "本轮质量约束",
          "href": "../research/real-case/CONSTRAINTS.md"
        }
      ],
      "control": "规格决定做什么；约束决定每次改动都要守住什么。失败时修复实现或明确讨论规则变化，不能删断言、改空结果含义来制造通过。",
      "reflect": [
        "哪一条验收保护了我的研究结论不被夸大？",
        "笔记冲突时，为什么应保留已有内容并说明原因？"
      ]
    },
    {
      "id": "plan",
      "title": "03 · 拆任务，明确数据交接",
      "question": "怎样让并行工作共享同一份契约？",
      "goal": "先固定索引和笔记的边界，再让数据引擎、页面和教学记录协作。",
      "skills": [
        "planning-and-task-breakdown",
        "api-and-interface-design",
        "source-driven-development",
        "context-engineering"
      ],
      "actions": [
        "按真实用户路径拆成快照查询、出处查看、笔记保存恢复、教学回顾四个切片。",
        "数据构建器提供带来源的快照，查询核心提供确定的匹配规则，页面负责输入、展示和反馈。",
        "笔记接口采用 schemaVersion:1；未知版本明确拒绝，未来迁移需另设方案与证据。",
        "查阅 MDN 的浏览器存储和 URL 文档，记录来源、异常情况与项目内的实现选择。"
      ],
      "artifacts": [
        {
          "label": "任务与依赖计划",
          "href": "../research/real-case/PLAN.md"
        },
        {
          "label": "索引来源清单",
          "href": "../research/real-case/corpus-manifest.json"
        }
      ],
      "control": "这里的接口是浏览器数据和函数契约，不要求新增 HTTP 服务。字段含义、错误结果与交接顺序明确后，界面和核心逻辑才能独立验证。",
      "reflect": [
        "来源行号与哈希分别解决什么问题？",
        "为什么未知版本被拒绝，仍不能算完成了数据迁移？"
      ]
    },
    {
      "id": "build",
      "title": "04 · 完成可运行的小闭环",
      "question": "代码怎样变成我能实际操作的功能？",
      "goal": "让真实查询、出处核对与回顾笔记能够在页面中连贯完成。",
      "skills": [
        "incremental-implementation",
        "test-driven-development",
        "frontend-ui-engineering",
        "browser-testing-with-devtools"
      ],
      "actions": [
        "先让一个真实查询返回正确项目和段落，再扩展筛选、空状态与查询规范化。",
        "先写行为测试与接口骨架，首轮 17 项中 13 项失败；实现后 17 项通过。随后增加真实缺陷的回归测试，修复后共 18 项通过；这些属于核心逻辑与内存存储测试。",
        "连接页面，使查询、查看来源、记笔记和导入导出各自有清楚反馈。",
        "在实际浏览器验证键盘操作、窄屏布局、刷新后笔记恢复和来源查看；浏览器证据与纯函数测试分别记录。"
      ],
      "artifacts": [
        {
          "label": "实际验证与运行记录",
          "href": "../research/real-case/verification.md"
        },
        {
          "label": "核心测试失败与通过记录",
          "href": "../research/real-case/engine-evidence.json"
        }
      ],
      "control": "测试通过只证明所检查的行为；页面运行还要覆盖真实交互与存储。未执行的验证不填成通过，教学预期不替代运行结果。",
      "reflect": [
        "单元测试通过后，浏览器还可能在哪些环节出错？",
        "能否指出一项需求、一段实现与一条验证记录之间的对应关系？"
      ]
    },
    {
      "id": "review",
      "title": "05 · 观察失败，复核控制是否生效",
      "question": "发生错误时，流程会不会保住原有结果？",
      "goal": "用非法输入、冲突和存储失败检查边界，并独立复核证据与结论。",
      "skills": [
        "debugging-and-error-recovery",
        "doubt-driven-development",
        "code-review-and-quality",
        "security-and-hardening",
        "code-simplification",
        "performance-optimization"
      ],
      "actions": [
        "将未知版本、非法项目 ID、重复笔记、冲突文本和存储异常纳入错误路径检查。",
        "复核失败前后已有笔记是否保持一致，页面是否把失败误报为成功。",
        "审查索引是否夸大研究状态、文本是否被安全显示、来源是否可追溯；独立质疑的实际发现写入证据。",
        "实际复查发现仓库链接 agent 被误匹配为 agent-skills：先增加失败回归测试，再改为 owner/repo 精确匹配，最终 18 项测试通过。性能测量不写成优化收益。",
        "独立审查还发现重复打开当前项目会覆盖草稿；在浏览器先复现再修复，并验证旧标签页不会覆盖另一页先保存的新记录。"
      ],
      "artifacts": [
        {
          "label": "问题、修复与边界证据",
          "href": "../research/real-case/verification.md"
        },
        {
          "label": "约束复核",
          "href": "../research/real-case/CONSTRAINTS.md"
        }
      ],
      "control": "预期的非法输入被拒绝，证明的是错误处理；真实实现缺陷的复现和修复才构成调试证据。两者分别记录，避免把设计好的演示当成真实故障。",
      "reflect": [
        "这次看到的失败属于输入被拒绝，还是实现确实有缺陷？",
        "检查是不是通过放宽标准才变绿？怎样从差异中核对？"
      ]
    },
    {
      "id": "handoff",
      "title": "06 · 留下可复查的交付",
      "question": "下次打开网页，我能继续使用和理解吗？",
      "goal": "交付本地可运行入口、可重复检查命令与对应的学习记录。",
      "skills": [
        "git-workflow-and-versioning",
        "ci-cd-and-automation",
        "documentation-and-adrs",
        "observability-and-instrumentation",
        "shipping-and-launch",
        "deprecation-and-migration"
      ],
      "actions": [
        "核对本轮文件范围与工作区差异，保留来源快照和决定；本轮没有提交或推送。",
        "运行可重复的构建一致性、行为测试和总库检查；本地命令不描述为已接入 CI。",
        "以页面反馈、快照信息和验证记录支持诊断；不声称配置了生产监控。",
        "提供本地访问与回顾顺序；发布检查按本地交付范围执行，线上发布和版本迁移仍未发生。"
      ],
      "artifacts": [
        {
          "label": "交付与验证记录",
          "href": "../research/real-case/verification.md"
        },
        {
          "label": "下次继续的任务依据",
          "href": "../research/real-case/PLAN.md"
        }
      ],
      "control": "一次交付必须说明实际完成范围、证据和下一次如何复查。本轮成果是本地研究回顾工具与教学过程，不能因网页可打开就声称已发布或完成生产运维。",
      "reflect": [
        "哪些结论可以由本轮证据支持，哪些仍是待验证？",
        "把这一过程迁移到自己的下一个需求时，哪些规则可以直接复用？"
      ]
    }
  ],
  "skillCoverage": [
    {
      "slug": "using-agent-skills",
      "role": "选择当前环节的方法，并解释各技能如何交接。",
      "status": "本轮采用",
      "note": "覆盖表记录使用理由，不表示执行了全部技能的全部流程。"
    },
    {
      "slug": "interview-me",
      "role": "从用户最近的提问与现有资料提取意图。",
      "status": "本轮采用",
      "note": "采用上下文提取和偏好确认；没有虚构完整访谈或逐阶段人工批准。"
    },
    {
      "slug": "idea-refine",
      "role": "比较可选演练，选择研究回顾入口。",
      "status": "本轮采用",
      "note": "依据真实问题、已有资料、验证成本与使用价值收敛范围。"
    },
    {
      "slug": "spec-driven-development",
      "role": "写出查询、来源与笔记闭环的验收契约。",
      "status": "本轮采用",
      "note": "本轮用户已授权实际演示；规格记录不声称另有未发生的批准。"
    },
    {
      "slug": "constraint-driven-development",
      "role": "把资料保护、语义边界和错误处理对应到检查。",
      "status": "本轮采用",
      "note": "文档与检查命令共同组成约束；是否通过以实际记录为准。"
    },
    {
      "slug": "planning-and-task-breakdown",
      "role": "按可使用的完整行为拆分任务与并行职责。",
      "status": "本轮采用",
      "note": "采用本案例专用 PLAN.md，不覆盖其他项目已有计划。"
    },
    {
      "slug": "incremental-implementation",
      "role": "逐步完成查询、来源和笔记的可验证切片。",
      "status": "本轮采用",
      "note": "按现有授权实施；不把技能建议的频繁提交写成已发生的提交。"
    },
    {
      "slug": "test-driven-development",
      "role": "为匹配与导入行为保存失败到通过的证据。",
      "status": "本轮采用",
      "note": "已保存首轮 17 项中 13 项失败、实现后 17 项通过，以及缺陷回归失败后 18 项通过；仅覆盖核心逻辑与内存存储。"
    },
    {
      "slug": "context-engineering",
      "role": "只加载规则、登记、来源与当前实现所需资料。",
      "status": "本轮采用",
      "note": "项目快照和阶段记录支持回顾与交接，不等于模型永久记忆。"
    },
    {
      "slug": "source-driven-development",
      "role": "核对当前实现所依赖的浏览器和运行时接口。",
      "status": "本轮采用",
      "note": "已核对 MDN 的 localStorage、storage 事件与 URL 接口，记录固定地址、异常反馈和保存前基线检查的选择依据。"
    },
    {
      "slug": "doubt-driven-development",
      "role": "独立质疑目标、错误处理与验证是否足够。",
      "status": "本轮采用",
      "note": "独立复核发现同项目草稿丢失、多标签页覆盖风险和损坏链接问题；修复后分别验证。"
    },
    {
      "slug": "frontend-ui-engineering",
      "role": "把查询、出处、笔记和学习路线组织成可操作页面。",
      "status": "本轮采用",
      "note": "运行效果、响应式与键盘操作以浏览器记录为准。"
    },
    {
      "slug": "api-and-interface-design",
      "role": "确定索引字段、查询语义与版本化笔记契约。",
      "status": "本轮采用",
      "note": "使用浏览器数据和函数接口；没有新增网络 API 服务。"
    },
    {
      "slug": "browser-testing-with-devtools",
      "role": "检查真实页面交互、刷新恢复和窄屏表现。",
      "status": "本轮采用",
      "note": "已操作查询、出处、保存刷新、备份合并、冲突保护、六步导航及320/390像素窄屏；浏览器证据与核心测试分开记录。"
    },
    {
      "slug": "debugging-and-error-recovery",
      "role": "若发现真实缺陷，保留复现、原因、修复与回归证据。",
      "status": "本轮采用",
      "note": "实际发现 agent 仓库链接误命中 agent-skills，保留失败回归测试，改为仓库身份精确匹配后通过。"
    },
    {
      "slug": "code-review-and-quality",
      "role": "复核范围、准确性、可维护性和验证遗漏。",
      "status": "本轮采用",
      "note": "独立审查记录了草稿保护、跨页覆盖、URI解码与来源措辞问题，已有针对处理和验证。"
    },
    {
      "slug": "code-simplification",
      "role": "在行为保持的前提下减少实际发现的复杂度。",
      "status": "未触发",
      "note": "当前没有单独的简化任务；首版保持简单不等于执行了重构简化。"
    },
    {
      "slug": "security-and-hardening",
      "role": "限制资料范围，严格验证导入，安全显示文本。",
      "status": "本轮采用",
      "note": "输入与存储检查覆盖本地场景，不构成全面安全审计。"
    },
    {
      "slug": "performance-optimization",
      "role": "有性能问题时先测量、定位，再比较优化结果。",
      "status": "本轮采用",
      "note": "只采用测量步骤：记录10项目的Node核心查询微基线；未进行性能优化，也没有前后收益对照。"
    },
    {
      "slug": "git-workflow-and-versioning",
      "role": "核对变更范围和来源，避免覆盖其他未提交工作。",
      "status": "本轮采用",
      "note": "采用工作区检查与可追溯差异；本轮不提交、不推送。"
    },
    {
      "slug": "ci-cd-and-automation",
      "role": "提供可重复执行的索引、行为与总库检查。",
      "status": "本轮采用",
      "note": "本轮运行本地自动检查；没有新增线上 CI 或部署流水线。"
    },
    {
      "slug": "deprecation-and-migration",
      "role": "将来格式升级时定义兼容、转换与回退。",
      "status": "未触发",
      "note": "schemaVersion:1 的未知版本拒绝是边界校验，不能视作完成了迁移。"
    },
    {
      "slug": "documentation-and-adrs",
      "role": "保存需求、取舍、任务、证据和回顾指引。",
      "status": "本轮采用",
      "note": "文档随实际结果更新，未执行内容保持清楚标记。"
    },
    {
      "slug": "observability-and-instrumentation",
      "role": "用错误反馈、快照信息和验证记录支持诊断。",
      "status": "本轮采用",
      "note": "覆盖本地工具的必要可观察状态；没有生产日志平台或监控告警。"
    },
    {
      "slug": "shipping-and-launch",
      "role": "核对本地入口、验证范围与交付说明。",
      "status": "本轮采用",
      "note": "已核对本地入口、完整使用路径和交付说明；仅本地交付，未线上部署或分批发布。"
    }
  ]
};
