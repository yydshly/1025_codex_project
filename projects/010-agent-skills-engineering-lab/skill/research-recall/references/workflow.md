# 执行约定与命令

此技能面向一种明确的本地研究总库结构。第一次使用或遇到格式、来源范围问题时阅读本文件。没有这种结构的资料库需要适配，不默认为任意文件搜索器。

## 输入资料

根目录的 `projects.json` 使用 `schemaVersion: 1`、`projects` 数组；每个项目含 `id`、`slug`、`name`、`summary`、`source`、`status`、`tags`。目录是 `projects/{id}-{slug}/`。脚本在读取前验证登记和真实路径，不跟随越界链接。

读取根登记与已登记项目的 `README.md`、`research/**/*.md`。排除隐藏目录、`research/upstream/`、`research/skill-creation/` 和 `research/recall-records/`。PDF、网页、聊天记录、应用存储和 ReflectFlow 不在此范围内。扫描上限及缺失、无法读取的文件会在工具结果中报告；有警告时不能声称完整检索。

## 四个命令

以下 `SKILL_DIR` 指本 `SKILL.md` 所在目录，`ROOT` 指用户的研究总库绝对路径。将示例中的占位值替换为实际路径，不使用 shell 拼接未经处理的用户输入。输出与判断文本路径都在授权总库内；相对路径按 ROOT 解释。

```powershell
python -X utf8 "SKILL_DIR/scripts/recall.py" search --root "ROOT" --query "https://github.com/addyosmani/agent-skills"
python -X utf8 "SKILL_DIR/scripts/recall.py" search --root "ROOT" --query "Graphiti" --limit 5
python -X utf8 "SKILL_DIR/scripts/recall.py" read --root "ROOT" --path "projects/009-knowledge-processing-atlas/README.md" --start 1 --end 60
```

`search` 按项目聚合。关键词不区分大小写，进行 Unicode NFKC 规范化，多个空格分隔词按 AND 匹配；这不是向量或语义检索。同一项目的不同文档可能共同匹配多个词，回答前仍需阅读对应证据。`--project 009` 可收窄到已知项目；默认前若干项不等于全部结果，查看 `totalMatches` 与 `truncated`。

GitHub URL 查询规范化为完整仓库身份，允许 `.git`、大小写及仓库内子路径等表示方式；按登记来源和正文中的仓库 URL 匹配，不能把 `agent` 当成 `agent-skills`。若只有库名，使用普通关键词并核对对象身份。

如用户要求保存，先为本次查询选择尚不存在的文件名。`search --output` 的标准输出只是保存摘要，完整证据包在目标 JSON 中；读取该文件再解释结果：

```powershell
python -X utf8 "SKILL_DIR/scripts/recall.py" search --root "ROOT" --query "Graphiti" --output "ROOT/projects/009-knowledge-processing-atlas/research/recall-records/graphiti-evidence-唯一标识.json"
python -X utf8 "SKILL_DIR/scripts/recall.py" verify --root "ROOT" --report "ROOT/projects/009-knowledge-processing-atlas/research/recall-records/graphiti-evidence-唯一标识.json"
```

用文件写入工具把用户授权的判断保存为 UTF-8 文本，再执行：

```powershell
python -X utf8 "SKILL_DIR/scripts/recall.py" save --root "ROOT" --report "ROOT/projects/009-knowledge-processing-atlas/research/recall-records/graphiti-evidence-唯一标识.json" --judgment-file "ROOT/projects/009-knowledge-processing-atlas/research/recall-records/graphiti-judgment-唯一标识.txt" --output "ROOT/projects/009-knowledge-processing-atlas/research/recall-records/graphiti-record-唯一标识.json"
```

所有写入均拒绝覆盖现有目标。记录与证据包是不同 `kind`，判断与原始证据分开保存。脚本不会更新项目 README、登记信息、已保存笔记或用户浏览器。它也不会检查某个推断是否语义正确；验证通过只证明保存时来源与证据包一致。

## 工具结果如何阅读

`search` 返回 `kind: research-recall`、`schemaVersion: 1`。重要字段：

- `query`、`projectFilter`、`limit`、`generatedAt`：本次检索的输入与时间。
- `registry`：登记文件路径与 SHA-256。
- `scope`、`warnings`：实际扫描范围与遗漏，必须连同结果一起解释。
- `totalMatches`、`truncated`：匹配项目数量与返回是否受限。
- `results`：项目身份、登记状态、匹配类型及 `evidence`。
- 每条 `evidence` 含 `path`、`startLine`、`endLine`、`text`、`sha256`。路径相对根目录；生成答复时可组合为绝对文件链接。

`verify` 重新读取实际来源，拒绝失效或不符合格式的证据。已引用文件变动后即使引用段落看起来没变，也应重新查阅，不把旧验证延续为当前有效。校验还会重放查询比较范围、警告和结果；它没有为所有未引用文件保存完整快照。

错误以 JSON 的 `error.code`、`error.message` 和非零退出码返回。目标冲突、权限、范围、来源缺失或改变时，先读错误，修正实际原因；不得为了显示成功而关闭检查、删除旧记录或篡改证据。

`read` 每次最多读取 200 行，起止行必须落在实际来源中。收到 `INVALID_RANGE` 时，根据错误提示的实际行数收窄范围后重试；读取参数错误不表示资料不存在。

## 回答方式

不强制长模板。通常用一段回答是否找到，再列必要的“原文记录 + 出处”，随后说明用户需要的适用判断与未确认项。不要整段复制无关资料，不把工具返回的所有片段都堆给用户。

遇到含糊问题先利用已有上下文；只有对象、范围或保存目的地确实无法确定时再问。用户的明确范围和授权优先于这里的默认做法。
