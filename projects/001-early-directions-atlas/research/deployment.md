# 发布记录

## 2026-10-27 发布范围

发布 `001 · 早期方向档案`，说明我们早期思考与尝试留下的十二个方向，以及候选、方案、原型、阶段作品、停止项之间的区别。使用已生成的 `directions-map-v1.png` 作为网页、总索引和站点入口的引导图。

本地发布产物已验证：站点总入口、编号子路径、样式脚本与引导图 HTTP 200；浏览器十二项记录、手机宽度、搜索、详情刷新和完整文字导出通过。发布脚本另在隔离目录验证编号递增、索引生成与公开范围。

## 首次线上结果

- 部署平台：GitHub Pages / GitHub Actions，仓库的发布方式为 `workflow`。
- 源码提交：[5950e83](https://github.com/yydshly/1025_codex_project/commit/5950e83753a061f7dac366a6d7c4eeb1ae461f72)。
- 发布工作流：[40363829975](https://github.com/yydshly/1025_codex_project/actions/runs/40363829975)，结果 `success`。
- 索引校验工作流：[40363829859](https://github.com/yydshly/1025_codex_project/actions/runs/40363829859)，结果 `success`。
- 站点总入口：https://yydshly.github.io/1025_codex_project/
- 项目入口：https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/

2026-10-27 实际请求上述总入口、项目入口、CSS、交互脚本、数据脚本和引导图，全部返回 HTTP 200。线上 PNG 的 SHA256 与保存的生成原图一致。浏览器核对了新标题、摘要、十二个方向和引导图的 1672 像素原始宽度，未发现 error / warn。

上线后才填写 `projects.json` 的 `demoUrl` 并同步总索引。线上截图保存为 `assets/images/published-2026-10-27.jpg`。其他未授权发布的子项目没有加入本次远端提交或 Pages 产物。
