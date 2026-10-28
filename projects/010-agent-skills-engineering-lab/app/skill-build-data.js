// Actual creation walkthrough; statuses follow recorded evidence.
globalThis.RESEARCH_RECALL_BUILD = {
  "status": "首版已安装，受测场景验证通过",
  "statusDetail": "实现已完成，学习从第1步开始。每步说明为什么这样设计、实际产物、怎样验证；22项行为测试、2项独立请求及安装后调用留有记录。",
  "scope": "这一轮创建一项研究回查 Skill；不表示原库的 25 项技能均完成实测。",
  "steps": [
    {
      "id": "contract",
      "title": "定义能力契约",
      "short": "说清完成标准",
      "status": "契约已完成",
      "question": "用户交给它什么，最后应该拿到什么？",
      "why": "先确定完成标准，才能判断后面的规则和工具有没有用。否则“帮我回查”很容易滑成重新上网研究，或给出没有出处的总结。",
      "design": [
        {
          "label": "何时使用",
          "text": "用户想找回已有研究，例如“Agent Skills 以前研究过吗”“当时为什么选择它”。"
        },
        {
          "label": "输入与范围",
          "text": "明确的研究库根目录，加库名、仓库链接或关键词。读取登记项目的 README 与研究 Markdown；排除上游快照和本轮生成的评估、记录材料。"
        },
        {
          "label": "应该交付",
          "text": "匹配项目、相关原文、文件路径与行号，以及有依据的解释。分清记录事实、我们的判断与尚未确认的内容。"
        },
        {
          "label": "关键边界",
          "text": "仓库链接按完整 owner/repo 识别；没有匹配只表示已查范围未找到。保存判断另存新记录，不改原资料，也不覆盖网页里的笔记。"
        }
      ],
      "example": "输入：https://github.com/addyosmani/agent-skills\n输出目标：找到研究记录，附原文位置；说明已研究哪些内容、哪些仍待实测。",
      "artifacts": [
        {
          "label": "输入、输出、边界与验收契约",
          "href": "../research/skill-creation/contract.md",
          "ready": true
        }
      ],
      "verification": {
        "expected": [
          "正常查询有真实出处；无匹配时说明检索范围。",
          "不会把相似仓库名当成同一仓库，也不会把研究记录写成实测结果。"
        ],
        "actual": "已保存能力契约，明确了输入、来源、出处、无匹配、来源变化与保存冲突的完成条件。",
        "evidence": [
          {
            "label": "实际验证总记录",
            "href": "../research/skill-creation/verification.json",
            "ready": true
          }
        ]
      },
      "reflection": "如果你只说“结果要准确”，另一个执行者能知道怎样检查吗？试着把“准确”拆成身份匹配、引用一致与结论有据三件事。"
    },
    {
      "id": "workflow",
      "title": "设计执行流程",
      "short": "安排动作与分支",
      "status": "流程已完成",
      "question": "哪一步需要判断，失败后该到哪里？",
      "why": "好的流程说明如何做决定，并让每一步留下下一步需要的材料。异常分支提前明确，执行者就不必靠猜测补齐结果。",
      "design": [
        {
          "label": "定位目标",
          "text": "先利用现有上下文确定要查什么；只有歧义影响结果时才澄清。明确资料根目录，不搜索整块磁盘。"
        },
        {
          "label": "检索与阅读",
          "text": "search 查找允许范围内的材料；read 按返回的文件和行号阅读上下文。关键词命中只表示相关，解释仍需核对原文。"
        },
        {
          "label": "核对证据",
          "text": "verify 重新检查记录中的来源、哈希和引用。原文已变或不存在时，重新获取证据或报告未核实。"
        },
        {
          "label": "可选保存",
          "text": "用户需要保留判断时，再调用 save。先验证证据，再独占创建新文件；冲突或写入失败就报告失败，保留已有内容。"
        }
      ],
      "example": "明确目标 → search → read → 解释与出处核对 → verify\n                                            ↓\n                                 用户要求保存 → save\n无匹配：交代范围；证据失效：重新取证或报告未核实。",
      "artifacts": [
        {
          "label": "正式流程与命令约定",
          "href": "../skill/research-recall/references/workflow.md",
          "ready": true
        },
        {
          "label": "创建过程记录",
          "href": "../research/skill-creation/walkthrough.md",
          "ready": true
        }
      ],
      "verification": {
        "expected": [
          "正常、无匹配、来源变化、保存冲突都有明确去处。",
          "每个交付结论能找到支撑材料；保存成功必须来自实际写入结果。"
        ],
        "actual": "search、read、verify、save 已实际执行；来源变化和冲突分支由隔离测试验证，真实安装版另存判断后读回复核成功。",
        "evidence": [
          {
            "label": "安装后真实调用",
            "href": "../research/skill-creation/cli-acceptance.json",
            "ready": true
          }
        ]
      },
      "reflection": "“查到一段文字”和“已经证明结论”之间还缺什么？这里保留阅读和解释核对，是为了避免把命中结果直接当成答案。"
    },
    {
      "id": "skill",
      "title": "写成 Skill 规程",
      "short": "说明触发与做法",
      "status": "结构已通过",
      "question": "怎样让新的执行者也知道何时用、怎么做？",
      "why": "description 帮助选择技能，正文指导当前任务，参考文件提供按需细节。把职责分开，入口可以保持简短，又能在执行时找到必要信息。",
      "design": [
        {
          "label": "名称与触发",
          "text": "使用 research-recall 作为稳定名称。description 聚焦已有研究的回查，避免把普通写作或所有外部调研都吸入这个流程。"
        },
        {
          "label": "正文",
          "text": "写清资料范围、读取和验证顺序、无匹配的表述，以及保存判断的边界。只保留会改变执行决策的规则。"
        },
        {
          "label": "辅助资料",
          "text": "命令参数、证据格式和错误处理放在 references/workflow.md，正文说明执行时何时查阅。脚本作为包内资源随 Skill 一起提供。"
        },
        {
          "label": "现实限制",
          "text": "Skill 给模型工作指导，不能凭空增加工具和权限。结构校验通过也不证明触发和判断正确，后面还要独立试用。"
        }
      ],
      "example": "research-recall/\n├── SKILL.md                  触发、目标、关键步骤与边界\n├── references/workflow.md    执行时读取的命令与证据约定\n├── scripts/recall.py          检索、阅读、验证与另存\n└── agents/openai.yaml         界面名称和默认提示",
      "artifacts": [
        {
          "label": "正式 Skill 入口",
          "href": "../skill/research-recall/SKILL.md",
          "ready": true
        },
        {
          "label": "命令与证据参考",
          "href": "../skill/research-recall/references/workflow.md",
          "ready": true
        }
      ],
      "verification": {
        "expected": [
          "元数据、命名和引用文件有效，没有未完成的占位说明。",
          "另一个执行者只拿到 Skill 与必要资料，也能按范围完成任务。"
        ],
        "actual": "结构校验通过。独立执行者读取 Skill 与参考资料后，完成两项真实请求；试用后补充提及性质规则，并改善工具的越界提示。自动触发的界面表现没有据此宣称已验证。",
        "evidence": [
          {
            "label": "结构校验输出",
            "href": "../research/skill-creation/structure-check.json",
            "ready": true
          },
          {
            "label": "独立试用记录",
            "href": "../research/skill-creation/forward-test.json",
            "ready": true
          }
        ]
      },
      "reflection": "一条规则如果删掉，执行决策会有什么变化？回答不出来时，应考虑它是否只是泛泛建议。"
    },
    {
      "id": "tools",
      "title": "实现可检查的工具",
      "short": "把要求变成程序",
      "status": "22项测试通过",
      "question": "哪些要求能由程序稳定检查，哪些仍需要判断？",
      "why": "路径范围、仓库身份、文件哈希、引用行和文件是否已存在都可以确定性处理。把这些放进脚本，能减少反复手工操作带来的差异。",
      "design": [
        {
          "label": "search / read",
          "text": "search 返回候选与原文证据；read 按允许路径读取行范围。脚本使用 Python 标准库，并在读取前核对实际路径。"
        },
        {
          "label": "verify",
          "text": "重新比较登记身份、来源哈希、引用行和文本。检查失败返回非零状态，供执行者识别未完成。"
        },
        {
          "label": "save",
          "text": "保存前调用同一验证逻辑；验证失败不继续保存。新文件采用独占创建，不覆盖已有文件。"
        },
        {
          "label": "判断仍有边界",
          "text": "脚本可以证明引用与文件一致，不能自动证明解释合理。Skill 要求模型对照原文，并把推断与记录分开。"
        }
      ],
      "example": "文字规则：“保存前核实出处。”\n程序行为：save 内部先 verify；失败即返回错误，不创建记录。\n验证方式：在隔离样本中改动来源，检查保存被拒绝且原记录未变。",
      "artifacts": [
        {
          "label": "真实 CLI 实现",
          "href": "../skill/research-recall/scripts/recall.py",
          "ready": true
        },
        {
          "label": "行为测试",
          "href": "../tests/skill-recall.test.py",
          "ready": true
        }
      ],
      "verification": {
        "expected": [
          "正常查询、相似名称、中文关键词与来源读取按约定工作。",
          "越界路径、失效证据和写入冲突被明确拒绝，原内容保持不变。"
        ],
        "actual": "22项行为测试通过，覆盖中文关键词、精确身份、研究文档、路径边界、来源变化、伪造证据、写入失败及不覆盖。安装版真实查询扫描10个项目、59份资料，无警告；保存后复核成功。",
        "evidence": [
          {
            "label": "22项测试输出",
            "href": "../research/skill-creation/behavior-tests.json",
            "ready": true
          },
          {
            "label": "实际证据包",
            "href": "../research/skill-creation/agent-skills-evidence.json",
            "ready": true
          },
          {
            "label": "演示判断记录",
            "href": "../research/skill-creation/demo-record.json",
            "ready": true
          }
        ]
      },
      "reflection": "如果模型忘了显式执行 verify，save 仍会拒绝失效证据吗？这正是把关键检查放入保存动作内部的理由。"
    },
    {
      "id": "evaluation",
      "title": "独立实测并修正",
      "short": "用真实任务检验",
      "status": "2项独立请求完成",
      "question": "文件写好了，新的执行者真的会用吗？",
      "why": "编写者知道答案，容易把隐含知识带进操作。独立试用让不依赖本次对话的执行者拿 Skill 完成请求，才能暴露漏写的步骤与歧义。",
      "design": [
        {
          "label": "工具测试",
          "text": "在隔离、虚构资料中验证匹配、引用、错误返回和不覆盖行为。不会为了制造失败而改坏真实研究资料。"
        },
        {
          "label": "任务试用",
          "text": "给独立执行者真实请求、Skill 和必要原始资料。不给预期答案，再核对它的工具使用、来源与解释。"
        },
        {
          "label": "失败归因",
          "text": "分清问题来自 description、正文、工具实现还是验收方法，只修改已有证据支持的部分。"
        },
        {
          "label": "结论范围",
          "text": "报告实际覆盖的任务和环境。少量试用通过不等于所有场景稳定，也不等于已证明相对无 Skill 的效率收益。"
        }
      ],
      "example": "独立请求1：Graphiti适合做什么，有没有实测证据？\n实际结果：找到用途说明，并指出现有资料明确未实测。\n独立请求2：addyosmani/agent以前研究过吗？\n实际结果：URL只命中测试说明；没有当成已研究的正向证据。\n观察到的失败：两次read越界，收窄范围后恢复。\n修正：错误提示返回实际行数；补回归测试，并用安装版验证恢复。",
      "artifacts": [
        {
          "label": "本轮验证总记录",
          "href": "../research/skill-creation/verification.json",
          "ready": true
        },
        {
          "label": "独立执行者的最终答复",
          "href": "../research/skill-creation/forward-answer.md",
          "ready": true
        }
      ],
      "verification": {
        "expected": [
          "行为测试确实执行，失败与修正有原始结果。",
          "独立试用能交付有出处的答案，并正确处理无匹配或边界请求。"
        ],
        "actual": "两项独立请求完成，有来源与边界说明。保留了两次初始范围错误；修订后新增回归测试，安装版实际返回“来源59行”，按提示调整后读取成功。未做有／无Skill对照，不声称收益提升。",
        "evidence": [
          {
            "label": "独立试用与问题归因",
            "href": "../research/skill-creation/forward-test.json",
            "ready": true
          },
          {
            "label": "原始执行记录",
            "href": "../research/skill-creation/forward-execution.json",
            "ready": true
          },
          {
            "label": "修订后实际调用",
            "href": "../research/skill-creation/cli-acceptance.json",
            "ready": true
          }
        ]
      },
      "reflection": "一次正确答案可能来自模型本来的能力。要证明 Skill 带来稳定改进，还需要相同任务条件下的多次有／无 Skill 对照。"
    },
    {
      "id": "installation",
      "title": "安装与日常调用",
      "short": "把成果接入工作",
      "status": "已安装并核对",
      "question": "下一次需要回查时，怎样使用和检查它？",
      "why": "保存在研究目录的代码包，还需要进入当前环境可发现的技能位置。安装时核对完整文件，调用时给出清楚的资料范围，能力才可以被重复使用。",
      "design": [
        {
          "label": "保留可回顾版本",
          "text": "项目内保存 Skill 及创建证据；安装副本与项目版本逐文件核对，避免运行的内容与学习材料不同。"
        },
        {
          "label": "明确调用",
          "text": "用 $research-recall 提出目标，并指定或沿用明确的研究库根目录。若环境尚未发现新技能，按安装记录的说明重新载入。"
        },
        {
          "label": "保存判断",
          "text": "需要记录时，明确判断内容与目标文件。另存记录会保留证据，不与原网页浏览器笔记互相覆盖。"
        },
        {
          "label": "持续维护",
          "text": "资料变化时重新查询与验证。新增资料类型或搜索范围要先明确约定，再扩展工具与对应测试。"
        }
      ],
      "example": "$research-recall 在 E:/codex_project/1025_codex_project 回查 Agent Skills，给出用途、适用场景与原文依据，说明哪些结论仍未实测。\n\n需要保存时再补充：把这次判断另存为可复核的记录。",
      "artifacts": [
        {
          "label": "安装位置与4个文件哈希",
          "href": "../research/skill-creation/installation.json",
          "ready": true
        },
        {
          "label": "可维护的项目内 Skill",
          "href": "../skill/research-recall/SKILL.md",
          "ready": true
        }
      ],
      "verification": {
        "expected": [
          "安装副本完整，内容与项目内版本一致。",
          "从安装位置运行真实命令，能够完成查询、核对及经授权的保存。"
        ],
        "actual": "已安装到 D:/codex/home/skills/research-recall，4个文件与项目源包逐一哈希一致。安装版8条实际命令完成查找、阅读、复核、另存及错误恢复；重复保存被拒绝，原记录哈希未变。界面是否热发现尚未验证。",
        "evidence": [
          {
            "label": "安装后调用与写入核验",
            "href": "../research/skill-creation/cli-acceptance.json",
            "ready": true
          },
          {
            "label": "已保存的演示判断",
            "href": "../research/skill-creation/demo-record.json",
            "ready": true
          }
        ]
      },
      "reflection": "学会的标志是：你能拿另一项真实工作，重复“契约—流程—Skill—工具—验证—调用”这条路径，并说明每个步骤的依据。"
    }
  ]
};
