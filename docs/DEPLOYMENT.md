# 多个 Web 项目的部署约定

[返回首页](../README.md)

当前仅完成仓库初始化，尚未启用 GitHub Pages，也没有已上线的 Web 演示。此文用于后续接入实际项目。

## 一个站点，多个项目路径

GitHub Pages 每个仓库最多对应一个站点，适合部署静态 HTML、CSS、JavaScript 和可导出的前端应用。本库计划将多个项目的静态构建结果汇总为一个站点，分别挂载在编号子路径：

```text
https://yydshly.github.io/1025_codex_project/
├── 001-repo-name/
├── 002-another-repo/
└── ...
```

以上地址是路径规划，尚不可作为已部署链接。真正上线并验证后，再填写 `projects.json` 的 `demoUrl`。

## 首个 Web 项目接入时

1. 在该项目 `app/` 中确定技术栈，在子项目 README 中记录依赖安装、启动与构建命令。
2. 配置资源基础路径为 `/1025_codex_project/001-repo-name/`（换成实际编号目录）。资源引用、客户端路由和页面刷新都需要按部署子路径验证。
3. 使用 GitHub Actions 分别构建需要上线的子项目，将**可公开的静态产物**放入统一发布目录的编号子文件夹，再一次性发布整个站点。不要直接上传整个研究仓库。
4. 在仓库 **Settings → Pages → Build and deployment** 选择 **GitHub Actions**，按官方文档配置构建与部署作业、`github-pages` 环境以及所需权限。
5. 验证根入口、各项目入口、图片与脚本资源、子路径刷新以及不同项目间的链接；成功后登记真实演示地址并同步 README。

SPA 可以优先使用 hash 路由；若采用 history 路由，需要自行处理静态托管中的深层路径刷新。具体方案随项目确定。

## 需要后端的项目

GitHub Pages 提供静态托管，不能直接运行持续在线的 Node/Python 服务或保存服务端密钥。此类项目另行部署后端，或将整个应用部署到合适的平台，仍在总索引中登记最终演示地址。

## 官方参考

- [GitHub Pages 是什么、站点数量与默认路径](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [使用自定义 GitHub Actions 工作流发布 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
