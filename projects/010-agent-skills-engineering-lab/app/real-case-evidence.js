globalThis.REAL_CASE_EVIDENCE = {
  "summary": [
    {
      "title": "10 个真实研究项目",
      "text": "项目登记与 README 构成可重建快照，结果保留原文、行号和哈希。"
    },
    {
      "title": "18 项核心测试通过",
      "text": "保留行为失败到通过；另有浏览器保存、刷新、导入及冲突保护的实际记录。"
    },
    {
      "title": "25 项职责对应",
      "text": "23项采用相关方法，2项未触发。方法采用不等于全部技能完成实测或取得量化收益。"
    }
  ],
  "failures": [
    {
      "title": "真实缺陷 01 · 相似仓库名被误判",
      "symptom": "不存在的 agent 仓库链接，曾错误命中 agent-skills。",
      "cause": "把仓库身份判断当成普通子串匹配。",
      "fix": "规范化链接后比较完整 owner/repo；关键词查询保持原有规则。",
      "proof": "新增回归测试先失败，再修复到18项全过；浏览器再次查询返回0，正确链接仍定位010。",
      "skills": [
        "api-and-interface-design",
        "test-driven-development",
        "debugging-and-error-recovery"
      ]
    },
    {
      "title": "真实缺陷 02 · 再次打开笔记，草稿丢了",
      "symptom": "输入尚未保存的判断，再次点击当前项目的“记录判断”，内容变为空。",
      "cause": "切换保护只判断了不同项目，同项目仍重新加载旧内容。",
      "fix": "同项目草稿只聚焦，不重载；跨项目切换先提示处理未保存内容。",
      "proof": "浏览器复现修复前丢失；修复后重复点击仍保留草稿，保存并刷新后原文恢复。",
      "skills": [
        "doubt-driven-development",
        "code-review-and-quality",
        "browser-testing-with-devtools",
        "debugging-and-error-recovery"
      ]
    },
    {
      "title": "审查加固 · 旧页面不要覆盖新记录",
      "symptom": "审查发现两个标签页保存整份记录时，旧状态有覆盖新判断的风险。",
      "cause": "只相信页面加载时的记录，没有核对存储是否已变化。",
      "fix": "写入前比较最新状态与本页基线；不同就停止覆盖、保留草稿并提示刷新。",
      "proof": "第二页先保存006，旧页写010被拒绝；重新加载后006记录仍在。这不等于跨页原子事务。",
      "skills": [
        "constraint-driven-development",
        "code-review-and-quality",
        "security-and-hardening"
      ]
    }
  ]
};
