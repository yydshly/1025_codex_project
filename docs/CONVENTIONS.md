# 项目组织与索引约定

[返回首页](../README.md)

## 编号与顺序

- 编号采用三位数字，从 `001` 起，按收录顺序递增；目前支持 `001` 至 `999`。
- 目录名为 `编号-英文短名`，例如 `001-repo-name`。短名仅使用小写字母、数字和单个连字符，以字母开头。
- README 的表格与图文速览按编号升序生成。调整研究优先级可写在研究笔记中，不改变编号。
- 已分配编号永久保留。暂停或不再研究时使用 `archived`，保留已有链接；不要删除登记记录或回退 `nextId`。

## 登记数据

`projects.json` 是总索引的数据来源。顶层 `schemaVersion` 为 `1`，`nextId` 是下一次创建要分配的整数编号，`projects` 保存项目对象。

| 字段 | 含义 | 示例 |
| --- | --- | --- |
| `id` | 固定三位编号 | `001` |
| `slug` | 目录短名 | `repo-name` |
| `name` | 展示名称 | `项目名称` |
| `summary` | 一句话能力说明与研究重点 | `研究它的核心交互与实现方式` |
| `source` | 研究时的原始来源 URL，优先关联原 GitHub 仓库 | `https://github.com/owner/repo` |
| `sourceName` | 可选的来源名称；GitHub 仓库默认从 URL 提取仓库名，其他来源须填写 | `Bee 原演示（未取得源库）` |
| `status` | 当前研究阶段 | `planned` |
| `tags` | 主题标签数组 | `["AI", "Web"]` |
| `cover` | 相对子项目目录的图片路径；无图留空 | `assets/images/cover.png` |
| `demoUrl` | 已可访问的 HTTPS 演示地址；未部署留空 | `""` |
| `createdAt` | 收录日期（北京时间） | `2026-10-26` |

状态依次可用：`planned`（待研究）、`researching`（研究中）、`building`（实践中）、`completed`（已总结）、`archived`（已归档）。研究状态与上线状态分别记录，不能将“已总结”视为“已部署”。

总 README 的“源库”列使用来源名称作为链接文字，关联 `source`，项目速览同步显示。来源应指向研究对象的原仓库；仅有作品、网页或录屏时，登记原始链接并用 `sourceName` 说明来源性质，不以本研究总库或运行依赖代替原作。原创档案明确标注无上游源库。

## 新建与更新

```powershell
npm run project:new -- --slug repo-name --name "项目名称" --source "https://github.com/owner/repo" --summary "研究目标" --tags "AI,Web"
```

来源为网页或演示时，额外传入 `--source-name "原作品名称（未取得源库）"`；`--source` 必须使用无凭据的 HTTPS 链接。

创建后编辑对应 README 和笔记；修改登记数据后运行：

```powershell
npm run index:update
npm run check
```

校验涵盖编号唯一性、登记与目录一致性、关键文件、配图存在性和 README 生成区块是否同步。新建命令会先检查现有索引，发现冲突即停止；命令不覆盖已有目录。

## 图片与说明

- 使用自己复现得到的截图，或确认有权使用的上游素材；注明来源与必要署名。
- 封面建议采用 16:9 或接近的横图，保证正文在 GitHub 页面中清晰可读。
- 图片按内容命名，如 `cover.png`、`workflow.png`、`result-comparison.webp`，避免空格；不要包含账号信息、密钥或私人数据。
- 配图路径限定在该子项目 `assets/images/` 下；填写 `cover` 后，总 README 自动显示图片、摘要和项目入口。
- 子项目 README 的图片需附说明，写清楚展示的是上游效果、个人复现还是改进结果。

## 研究与代码边界

每个子项目独立管理依赖、锁文件和运行方式。先记录上游 commit/tag，再进行复现；引用代码保留许可证与署名。大型数据集、依赖、构建产物和凭据不提交；复现所需下载步骤写入项目说明。

README 中 `PROJECTS:START` 与 `PROJECTS:END` 之间由工具生成，其他区域可手动维护。初始化不预置虚构研究条目，第一个真实项目从 `001` 开始。
