![Repo Study Lab — 阅读、复现、实践、记录](assets/images/repository-banner.svg)

# GitHub 研究总库

记录日常在 GitHub、X 等渠道遇到的优秀开源项目：了解它解决的问题，复现关键能力，再沉淀自己的实践与结论。

这里是研究入口。每个子项目都有固定编号、独立说明、研究记录与图片，也可以拥有自己的 Web 演示。

[项目索引](#项目索引) · [项目速览](#项目速览) · [新增项目](#新增一个研究项目) · [目录与编号约定](docs/CONVENTIONS.md) · [Web 部署约定](docs/DEPLOYMENT.md)

<!-- PROJECTS:START -->

## 项目索引

已收录 **1** 个项目 · 按固定编号升序排列

| 编号 | 项目 | 简介 / 研究重点 | 阶段 | 演示 |
| --- | --- | --- | --- | --- |
| 001 | [早期方向档案](projects/001-early-directions-atlas/README.md) | 我们早期思考与尝试留下的十二个方向：需求与变现、内容获客、轻量产品、价格册、音频局部修改、3D咖啡、共想室、岗位观察、跨设备、论文、艺术短片与AI室友。按候选、方案、原型、阶段作品及停止项保存进展、依据和待验证问题。 | 已总结 | [在线访问](<https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/>) |

## 项目速览

### 001 · 早期方向档案

![早期方向档案 项目配图](projects/001-early-directions-atlas/assets/images/directions-map-v1.png)

我们早期思考与尝试留下的十二个方向：需求与变现、内容获客、轻量产品、价格册、音频局部修改、3D咖啡、共想室、岗位观察、跨设备、论文、艺术短片与AI室友。按候选、方案、原型、阶段作品及停止项保存进展、依据和待验证问题。

[研究说明](projects/001-early-directions-atlas/README.md) · [原始仓库](https://github.com/yydshly/1025_codex_project) · [在线演示](<https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/>)

**阶段：** 已总结 · **标签：** 早期思考 / 遗留方向 / AI产品 / 创作 / 历史回溯

<!-- PROJECTS:END -->

## 新增一个研究项目

需要 Node.js 22 或更高版本。根目录工具无第三方依赖，可直接运行，无需安装依赖。

```powershell
npm run project:new -- --slug repo-name --name "项目名称" --source "https://github.com/owner/repo" --summary "一句话介绍项目能力与研究目标"
```

命令会分配下一个编号、复制模板、登记项目，并更新本页索引。首次创建得到 `projects/001-repo-name/`；上面的名称与链接仅为命令示例。

1. 在子项目 `README.md` 中补充研究目标、原仓库版本与运行方法。
2. 在 `research/notes.md` 中记录复现过程和结论；代码放入 `app/`，按项目需要自行选择技术栈。
3. 将截图放入子项目 `assets/images/`，在 `projects.json` 的 `cover` 中填写相对路径，即可在本页展示。
4. 修改项目摘要、标签、进度或演示地址后，执行以下命令同步并检查索引。

```powershell
npm run index:update
npm run check
```

## 仓库结构

```text
.
├── README.md                 # 总索引、引导与项目图文速览
├── projects.json             # 编号、摘要、状态、配图和演示地址
├── projects/                 # 001-name、002-name……独立研究目录
├── templates/project/        # 子项目模板
├── docs/                     # 组织规则与部署约定
├── assets/images/            # 仓库级图片
├── scripts/                  # 新建项目、索引同步与校验工具
└── .github/workflows/        # 自动校验
```

## 研究方式

**发现 → 阅读 → 复现 → 扩展 → 总结**。先写清楚为什么研究，再记录可重复的操作、验证结果及适用边界。外层 README 保留摘要，详细内容放在各子项目中。

项目按编号升序展示。编号按收录顺序分配，分配后保持不变；归档项目保留编号，避免历史引用与演示链接失效。

## 来源与授权

子项目应注明原仓库、研究时的 commit/tag 和许可证。引入上游代码或素材时，保留原有授权与署名；当前总库尚未选择统一开源许可证，上游内容继续遵循其自身许可证。
