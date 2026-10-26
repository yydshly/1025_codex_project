# 多个 Web 项目的部署约定

[返回首页](../README.md)

本库通过 GitHub Actions 构建 GitHub Pages，一个站点下按编号子路径组织多个项目。当前发布清单为 [pages.config.json](../pages.config.json)，首个接入项目是 [001 · 早期方向档案](../projects/001-early-directions-atlas/README.md)。

2026-10-27 首次发布成功，已验证[站点总入口](https://yydshly.github.io/1025_codex_project/)与[001 在线网页](https://yydshly.github.io/1025_codex_project/001-early-directions-atlas/)。具体工作流和验收记录见[项目发布记录](../projects/001-early-directions-atlas/research/deployment.md)。

## 发布范围

站点总入口介绍研究档案，并为每个公开项目提供引导图、摘要与网页链接。

- 公开项目必须先登记在 `projects.json`，再明确列入 `pages.config.json`。
- `publicDirectory` 指定该项目可公开的静态目录；框架项目需要先构建出静态结果。
- `extraAssets` 只复制逐项声明的 `assets/` 资源。001 额外复制生成的方向引导图；004 先生成 `dist/site`，其公开素材随该目录发布。
- 项目名称、摘要及封面来自项目登记。封面也必须存在于公开资源中。
- 构建器拒绝链接、路径跳转和重复产物目录，跳过隐藏文件。没有声明发布的项目、研究笔记和仓库其他文件不进入站点。

源码与网站产物分开管理。公开 GitHub 仓库中提交的源码仍可通过仓库访问；“未进入站点”不等于仓库文件私密。

## 本地构建与验证

需要 Node.js 22+，根目录工具无第三方依赖：

```powershell
npm.cmd run index:update
npm.cmd run check
npm.cmd run check:pages
npm.cmd --prefix projects/004-baocut-effects-atlas run build:site
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

### 005 · 纸间：纸墨叙事与氛围网页研究

005使用 `dist/` 作为公开目录，002作为构建依赖，其完整产物复制在005的 `original/` 子目录，不另建公开站点。005的工作流步骤安装并构建002／005；其他项目仍以发布清单逐项声明，不自动上线未声明的本地研究。

站点总入口的引导图使用用户确认的 `assets/images/v1.4/research-map.png`，完整保留纵向图解；`guidePage: "map.html"` 让点图与“放大阅读引导图”进入可交互版本，项目名称及“查看网页”进入005首页。原图作为逐项声明的 `extraAssets` 公开，源稿、生成任务记录与原始下载不因发布目录而自动进入网站。

新增发布项需要先安装依赖，再执行 `npm --prefix projects/005-paper-poetics-lab run build`。该步骤自行构建002，随后根目录 `build:pages` 复制005的静态产物和声明的引导图。子路径链接、iframe章节hash及SVG导出地址需要在最终Pages地址复核，验证通过后再登记 `demoUrl`。

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

## 004 · BaoCut 研究页

004 的本地页面位于 `app/`，媒体位于同级的 `assets/`。`npm --prefix projects/004-baocut-effects-atlas run build:site` 会校验研究数据与 24 份原始提示，将媒体地址改为编号子路径内的相对地址，生成 `dist/site/`。原始提示文本保持不变；研究说明和原始文件入口改为固定版本或本库的 GitHub 链接。

该目录只包含静态界面、目录数据、20 组官方预览与封面、我们的 PNG / SVG 能力总览图、署名与许可证。构建器不复制研究笔记、验收文件或运行脚本，也不自动清理既有目录。总库封面使用 `assets/images/capability-map.png`。

## 需要后端的项目

GitHub Pages 只能提供静态内容。模型服务、采集任务、密钥和持久化数据需另行托管；不得把服务端凭据打包到网页。

## 官方参考

- [使用自定义 GitHub Actions 工作流发布 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)
