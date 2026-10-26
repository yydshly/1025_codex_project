# 多个 Web 项目的部署约定

[返回首页](../README.md)

本库通过 GitHub Actions 构建 GitHub Pages，一个站点下按编号子路径组织多个项目。当前发布清单为 [pages.config.json](../pages.config.json)，首个接入项目是 [001 · 早期方向档案](../projects/001-early-directions-atlas/README.md)。

2026-10-27 首次发布成功，已验证[站点总入口](https://yydshly.github.io/1025_codex_project/)与[001 在线网页](https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/)。具体工作流和验收记录见[项目发布记录](../projects/001-early-directions-atlas/research/deployment.md)。

## 发布范围

站点总入口介绍研究档案，并为每个公开项目提供引导图、摘要与网页链接。

- 公开项目必须先登记在 `projects.json`，再明确列入 `pages.config.json`。
- `publicDirectory` 指定该项目可公开的静态目录；框架项目需要先构建出静态结果。
- `extraAssets` 只复制逐项声明的 `assets/` 资源。001 当前仅额外复制生成的方向引导图。
- 项目名称、摘要及封面来自项目登记。封面也必须存在于公开资源中。
- 构建器拒绝链接、路径跳转和重复产物目录，跳过隐藏文件。没有声明发布的项目、研究笔记和仓库其他文件不进入站点。

源码与网站产物分开管理。公开 GitHub 仓库中提交的源码仍可通过仓库访问；“未进入站点”不等于仓库文件私密。

## 本地构建与验证

需要 Node.js 22+，根目录工具无第三方依赖：

```powershell
npm.cmd run index:update
npm.cmd run check
npm.cmd run check:pages
npm.cmd run build:pages
python -m http.server 4327 --bind 127.0.0.1 --directory dist/pages
```

默认产物为 `dist/pages/`，在本地访问总入口和编号子路径，核对图片、脚本、筛选、详情 hash 与刷新。构建器要求新产物目录；重复构建可指定另一个空目录：

```powershell
node scripts/build-pages.mjs --out dist/pages-review
```

`check:pages` 使用独立临时目录验证项目创建、编号递增、索引生成与发布边界，不修改真实登记。

## GitHub Pages 发布

工作流为 [.github/workflows/pages.yml](../.github/workflows/pages.yml)。

1. 仓库 Pages 的发布方式设为 GitHub Actions（API 中 `build_type: workflow`）。
2. 向 `main` 推送发布范围内的变化，或手动触发工作流。
3. 构建作业检查登记、发布边界和项目脚本，再生成 `dist/pages`，上传 Pages artifact。
4. 部署作业使用 `github-pages` 环境和官方 `actions/deploy-pages` 部署，输出网站地址。
5. 工作流成功后，实际访问根入口、编号子路径、引导图和脚本，检查详情刷新与移动端。
6. 验证通过后，才在 `projects.json` 的 `demoUrl` 登记真实地址，并重新生成 README。

部署只提交本次授权的项目及必要的发布配置。其他正在整理的工作区内容可以保持未提交，不能因部署而一并纳入远端。

## 后续增加项目

`pages.config.json` 中的目录必须是登记的固定编号目录，例如：

```json
{
  "schemaVersion": 1,
  "projects": [
    {
      "directory": "001-early-directions-atlas",
      "publicDirectory": "app",
      "extraAssets": ["assets/images/directions-map-v1.png"]
    }
  ]
}
```

同时更新工作流的 `paths`，让后续项目变动触发站点构建。资源引用采用相对路径；有客户端详情或路由时，优先使用 hash，避免静态托管中的深层路径刷新问题。部署需要的构建步骤随项目添加，不自动运行或上线所有子项目。

## 需要后端的项目

GitHub Pages 只能提供静态内容。模型服务、采集任务、密钥和持久化数据需另行托管；不得把服务端凭据打包到网页。

## 官方参考

- [使用自定义 GitHub Actions 工作流发布 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)
