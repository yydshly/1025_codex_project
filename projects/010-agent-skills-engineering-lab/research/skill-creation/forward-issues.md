# 独立正向试用问题记录

- 试用方式：先读取 SKILL.md 与 references/workflow.md，再实际执行 search/read；授权根为 E:/codex_project/1025_codex_project；不联网、不安装技能、不修改研究资料、不清理目录。
- 实质阻碍：无。两项请求均可从允许范围内的资料形成有出处且有边界的答复。
- read 请求 009 README 的 1–180 行时，脚本以 exit_code 1 返回 INVALID_RANGE（Line range is outside the source.）；缩小至 1–60 行后成功。
- read 请求 experiment-protocol.md 的 1–60 行时，同样以 exit_code 1 返回 INVALID_RANGE；缩小至 1–30 行后成功。
- 可用性观察：read 越界错误不返回来源实际总行数；首次阅读未知长度文档需要缩小范围或另行检查长度。本次有界缩小已恢复。
- 语义核对观察：精确 owner/repo 查询 agent 返回 1 个匹配，原因是允许范围内的测试说明确实含这个 URL。matched / matchKind=repository 本身不能证明对象研究过。实际阅读说明后，把它识别为负向测试提及，并核对登记来源为 agent-skills。
- Graphiti 普通搜索返回 2 个项目；010 的匹配是研究回查功能测试，不是 Graphiti 性能或效果实测。009 的 README 链接引导到 notes.md 后，找到了 Graphiti 的角色与明确未实测声明。
- 非 Skill 问题：首次尝试把全部执行记录内联到一个 PowerShell 命令保存时，exec_command 在进程创建前失败：文件名或扩展名太长（os error 206），无进程退出码。随后改用 Node 文件 API 写入独立临时目录。
- 未使用 skill save 或 search --output 修改授权研究根；本目录仅保存本次独立试用的运行记录与最终答复。

- 非 Skill 问题：第二次保存尝试把完整记录内联进 Node 工具调用，超过 64000 字节自动审查长度限制；随后按文件分段写入，不涉及权限扩大。
