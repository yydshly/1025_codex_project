# 实验：跨日记录搜索不到时如何调试

## 场景与范围

假设一个日记应用在跨日后搜索不到旧内容。这里建立的是**人工构造的最小模型**：两条虚构记录、内存索引和字符串搜索，故障也由实验设计者有意植入。它不是真实 ReflectFlow 的代码、数据或故障分析，没有读取任何私人资料。实验体现技能中的调试步骤，不能用来证明安装该技能一定让 AI 更准确或更快。

上游技能：[debugging-and-error-recovery](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/debugging-and-error-recovery/SKILL.md)，固定提交 `aeac41d4d005999432bb7312f7ff06383a91d59d`。本实验读取并参照该文件，没有安装插件或运行独立的技能引擎。

## 实际过程

1. **复现并保留证据**：`before` 版本原始记录含 `old,today`，构建的索引却只有 `today`；搜索旧记录失败，而原始记录仍存在。
2. **定位和缩小问题**：跟踪数据从记录列表到索引再到搜索的路径，发现 `buildBefore` 只保留日期等于当天的记录。最小样例只需前一天和当天各一条。
3. **修复原因**：`buildAfter` 用全部记录重建索引，而不是仅索引当天。保留故障版本以便重现。
4. **回归验证**：同一脚本检查原始记录、当天搜索、跨日搜索、无匹配查询和重新构建索引后的跨日搜索。

## 如何重跑

需要 Node.js（本次使用 v22.15.0），在本目录运行：

```sh
node verify.mjs before
node verify.mjs after
```

`before` 因故障预期退出码为 1；`after` 预期退出码为 0。两次实际输出摘要：

```text
version=before, source=old,today, index=today
PASS source still has previous-day record
PASS search finds current-day record
FAIL search finds previous-day record
PASS search returns no false hit
FAIL fresh index rebuild retains previous-day search
RESULT 3/5 passed

version=after, source=old,today, index=old,today
PASS source still has previous-day record
PASS search finds current-day record
PASS search finds previous-day record
PASS search returns no false hit
PASS fresh index rebuild retains previous-day search
RESULT 5/5 passed
```

## 观察与局限

实验中，有价值的流程是先比较原始记录与索引，再修索引生成环节，并用相同用例观察修复前后的差异。搜索失败并不自动意味着原始内容丢失。

这是同一实验者设计故障并按技能执行的示范，**没有无技能对照组，也没有耗时或质量收益的量化比较**。重新构建是在同一进程中调用函数，并非实际应用重启；没有模拟磁盘持久化、编辑缓存、历史索引、事件日志、恢复快照、并发或实际 UI。两项跨日检查关联同一个故障，不代表发现了两个独立缺陷。真正处理 ReflectFlow 时须遵循其数据保护和完整性核查规则，不能把这个模型的结论套用于正式库。
