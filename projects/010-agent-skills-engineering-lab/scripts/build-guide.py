"""Validate all 25 skill explanations; generate offline browser data and reading guide."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
groups = {
    '调度': ['using-agent-skills'],
    '需求': ['interview-me', 'idea-refine', 'spec-driven-development', 'constraint-driven-development'],
    '规划': ['planning-and-task-breakdown'],
    '实现': ['incremental-implementation', 'test-driven-development', 'context-engineering', 'source-driven-development', 'doubt-driven-development', 'frontend-ui-engineering', 'api-and-interface-design'],
    '验证': ['browser-testing-with-devtools', 'debugging-and-error-recovery'],
    '审查': ['code-review-and-quality', 'code-simplification', 'security-and-hardening', 'performance-optimization'],
    '维护': ['git-workflow-and-versioning', 'ci-cd-and-automation', 'deprecation-and-migration', 'documentation-and-adrs', 'observability-and-instrumentation', 'shipping-and-launch'],
}
items = []
for name in ('foundations', 'build', 'operations'):
    items.extend(json.loads((root / 'app' / f'data-{name}.json').read_text(encoding='utf-8-sig')))
catalog = {item['slug']: item for item in items}
expected = {p.parent.name for p in (root / 'research/upstream/skills').glob('*/SKILL.md')}
assert len(items) == len(catalog) == len(expected) == 25 and set(catalog) == expected, 'Missing or duplicate skills'
ordered = []
for stage, slugs in groups.items():
    for slug in slugs:
        item = catalog[slug]
        item['stage'] = stage
        assert item['sourcePath'] == f'skills/{slug}/SKILL.md'
        for field in ('name', 'question', 'summary', 'mechanism'):
            assert isinstance(item[field], str) and item[field].strip(), (slug, field)
        for field in ('when', 'notFor', 'inputs', 'steps', 'outputs', 'limits'):
            assert isinstance(item[field], list) and item[field] and all(isinstance(x, str) and x.strip() for x in item[field]), (slug, field)
        assert all(c['slug'] in expected and c['reason'].strip() for c in item['connections']), slug
        for field in ('task', 'before', 'after', 'check'):
            assert isinstance(item['example'][field], str) and item['example'][field].strip(), (slug, field)
        assert item['example']['process'] and all(isinstance(x, str) for x in item['example']['process']), slug
        ordered.append(item)
(root / 'app/catalog.js').write_text('window.AGENT_SKILLS_GUIDE = ' + json.dumps(ordered, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
lines = ['# Agent Skills：从整体到细节', '', '> 固定版本 aeac41d4d005999432bb7312f7ff06383a91d59d。以下为25项技能的原文解读与教学例子，不是25项实测结论。', '',
         '## 先看整体', '', '这个仓库将软件工程经验组织成文本工作流程。技能规定适用场景、步骤、检查点和证据；AI助手结合任务与规则调用实际工具，形成文档、代码或运行结果。安装或阅读文本不自动保证质量。', '',
         '需求 → 规划 → 实现 → 验证 → 审查 → 发布维护，是理解它的主线；调度、上下文、来源、独立质疑、版本、文档和观测可以贯穿其中。分类只是阅读入口，每个任务不必使用全部技能。', '',
         '## 先分清几组概念', '',
         '- 需求访谈问清目标；想法细化比较方案；规格写清要做什么；质量约束确定共同底线；规划安排实现步骤。',
         '- 增量实现控制每次工作的范围；测试驱动明确行为；浏览器验证检查实际体验；调试处理已经出现的异常。',
         '- 来源驱动核对外部技术事实；上下文管理组织任务信息；独立质疑审视重要假设；代码审查检查已有变更。',
         '- 代码简化尽量不改变行为；安全关注信任与权限边界；性能优化依赖瓶颈测量。',
         '- 版本记录变更；持续集成自动运行检查；发布控制交付与回退；观测持续收集诊断信息；文档记录原因；迁移管理旧能力退出。', '',
         '## 用同一个项目贯穿理解', '',
         '教学场景：做一个只使用虚构材料、返回来源的资料检索小工具。先明确关键词/语义、资料范围和来源要求，再写规格与质量标准；拆分读取、搜索、展示等工作，并设计模块与界面。实现时采用小步、测试与版本记录。遇到结果遗漏就调试，需要验证真实操作就检查浏览器。审查、简化、安全和性能按需要加入；文档和观测随开发推进，交付时用自动检查和发布流程，格式升级时再考虑迁移。该完整产品尚未据此实现，所有单项例子均为教学解释。', '',
         '## 学习目录', '']
for i, item in enumerate(ordered, 1):
    lines.append(f"- [{i:02d} · {item['name']}](#{item['slug']})：{item['question']}")
for i, item in enumerate(ordered, 1):
    lines.extend(['', f'<a id="{item["slug"]}"></a>', '', f"## {i:02d} · {item['name']}", '', f"**阶段：** {item['stage']} · **原名：** `{item['slug']}`", '', item['summary'], ''])
    for label, field in [('适用情形', 'when'), ('不必套用的情形', 'notFor'), ('输入', 'inputs'), ('执行步骤', 'steps'), ('产出', 'outputs')]:
        lines.extend([f'### {label}', ''])
        lines.extend(f'{j}. {v}' if field == 'steps' else f'- {v}' for j, v in enumerate(item[field], 1))
        lines.append('')
    lines.extend(['### 原理', '', item['mechanism'], '', '### 教学示例（未执行）', '', '**任务：** ' + item['example']['task'], '', '**起点：** ' + item['example']['before'], ''])
    lines.extend(f'{j}. {v}' for j, v in enumerate(item['example']['process'], 1))
    lines.extend(['', '**预期产物：** ' + item['example']['after'], '', '**验证方法：** ' + item['example']['check'], '', '### 边界与配合', ''])
    lines.extend('- ' + v for v in item['limits'])
    lines.extend(f"- 配合 [{catalog[c['slug']]['name']}](#{c['slug']})：{c['reason']}" for c in item['connections'])
    lines.extend(['', f"[本地原文](upstream/{item['sourcePath']}) · [固定版GitHub原文](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/{item['sourcePath']})", ''])
lines.extend(['## 实验与边界', '', '本轮原文解读覆盖25项；所有单项示例用于解释预期过程。此前仅完成规格结构检查、模拟调试和实际项目的局部代码审查，均无无技能对照。原始实验及命令见[项目说明](../README.md#场景实验)。'])
(root / 'research/learning-guide.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('PASS: 25 unique skills, complete fields, valid source paths and cross-links. Generated catalog.js and learning-guide.md.')
