# 003 发布记录

## 2026-10-27 发布范围

用户授权整理研究理解、部署网页并提交远端。引导图沿用既有 `assets/images/understanding-atlas.png`，不改动原图。

摘要与首屏按效果、能力、原理、价值组织：三课独立三维物理书；调参、预测、MiniMax导览、阅读和恢复；Three.js与明确假设的物理模型共享状态；为交互教材、原理说明和实验平台提供复用参考。扩展形态仍是设计概念。

发布副本由 `npm run prepare:pages` 准备到 `public/`：根入口是研究总览，`app/`保留完整样章及方法手册；明确列出的自有图片与当前13段配音一并发布。研究文档链接指向同仓库对应文件。构建不访问外部语音API，不读取MiniMax配置。

## 正式地址与远端记录

- [研究总览](https://yydshly.github.io/1025_codex_project/003-unified-learning-design/)：效果、能力、原理、价值、设计方法、当前证据与扩展方向。
- [三维物理样章](https://yydshly.github.io/1025_codex_project/003-unified-learning-design/app/index.html)：三课场景、MiniMax有声导览、预测验证及连续阅读。
- [完整引导图](https://yydshly.github.io/1025_codex_project/003-unified-learning-design/assets/images/understanding-atlas.png)：沿用本阶段生成的3200×7450原图。
- 源码提交：[390b638](https://github.com/yydshly/1025_codex_project/commit/390b63823edbc609c8c79c40874bcc7bc4b1bbe8)，已推送远端`main`。
- [GitHub Pages发布任务40369567113](https://github.com/yydshly/1025_codex_project/actions/runs/40369567113)：2026-10-27构建、部署均成功。

## 本次核验

正式网址打开后，核对了总览的四项说明、引导图原图与放大预览、三维器材和纸页渲染，以及MiniMax逐句导览。实际播放的音频来自本项目Pages路径，播放器就绪状态为4，播放进度从0.06秒推进至7.89秒；暂停后显示可环视、缩放的提示。样章控制台没有警告或错误。

发布前通过总库索引检查、4项发布边界测试、子项目语法检查、37项应用测试及6项发布准备测试。逐项资源HTTP核验见[机器记录](deployment-verification.json)。这些检查证明发布和已测操作可用，不等于教学效果已经证实；真实触屏／笔设备与受众学习验证仍待后续开展。

![正式研究总览页面](../assets/images/published-2026-10-27.png)

![正式三维样章与MiniMax导览](../assets/images/published-book-2026-10-27.png)
