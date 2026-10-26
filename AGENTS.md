# 仓库维护约定

- 本仓库是多个 GitHub 项目的研究总库；外层 README 用于编号索引、简短引导和项目配图，详细研究放在子项目。
- 项目目录采用 `projects/001-slug/`，按收录顺序递增编号。已分配编号不修改、不复用；归档保留目录和登记信息。
- `projects.json` 是索引数据来源。使用 `npm run project:new -- ...` 创建项目；更新信息后运行 `npm run index:update`，不要手动编辑 README 中的生成区块。
- 子项目保留自己的依赖和构建方式。没有具体需求时，不给全部子项目强制统一前端框架，不嵌套提交其他仓库的 `.git`。
- 截图放在对应子项目的 `assets/images/`，配图说明、源仓库、研究版本、许可证及运行步骤写入子项目 README。不得编造研究结论或已上线的演示地址。
- GitHub Pages 的多项目演示使用一个站点下的多个编号子路径。实际部署前阅读 `docs/DEPLOYMENT.md`。
- 提交前运行 `npm run check`；自动化工具有改动时，使用隔离目录验证项目创建、编号递增和索引生成。
- 尊重用户的 ReflectFlow 保护要求。不得因初始化、构建或忽略规则去清理其他数据或程序；任何磁盘清理前先读取 `D:\codex\maintenance\reflectflow-protection\protected-paths.json` 并核对清理路径及重解析点，不能影响保护库、缓存、程序或快捷方式。
