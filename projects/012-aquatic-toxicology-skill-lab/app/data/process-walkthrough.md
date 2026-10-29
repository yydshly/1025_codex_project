# 这次研究实际怎样推进

这份导览依据已有文件补写，未新增检索、未重跑API、未改科学数据。委派内容是任务摘要，不是原始逐字提示词或完整聊天日志。机器可读版本见 [process-walkthrough.json](process-walkthrough.json)。

1. **获取固定版本。** 主会话通过系统安装脚本下载四项技能，固定 `b8d050f24f2e1c465c4410eace8634ea3af15930`，留下1106份文件哈希。实际由Codex主会话和子代理读规则、按阶段手动编排，Claude专属hooks及完整原生闸门没有启动。证据：[清单](upstream-manifest.json)、[执行约定](execution-contract.md)。
2. **收窄问题。** 用户给的是水生毒理学方向。代理提出三个候选，选择PFAS×微/纳塑料×斑马鱼的条件比较，状态仍为 `provisional` / `human_confirmed:false`。原始技能要求范围、候选、FINER和交接；毒理学提取字段由本轮适配。范围审查要求写明停止边界，并使“新颖性未验证”先于分数。证据：[问题简报](rq-brief.md)、[方法](methodology.md)、[范围审查](checkpoint1-review.md)。
3. **真实检索与筛选。** 正式日志37条网页查询，主会话另做3条定向补查和2条OECD方法定位；下载前还有两条单列的探索查询。Q01宽检，Q08裸PMID产生噪声，Q24用DOI加PubMed域名定位P09，Q28取P10官方摘要。按DOI/题名去重后保留10篇核心、2篇背景，记录15项实际遇到的排除；没有完整数据库命中总数，也没有检索饱和结论。证据：[查询与排除](search-log.json)、[书目](bibliography.md)。
4. **按实际可读层级提取。** 核心8篇完整摘要、2篇摘要加指定片段、0篇全文审读。P03/P09/P10和P04全文入口403或不可达，未绕过。P06相对PFOA单暴露的逐终点方向仍为 `not_resolvable`；未知方法不写成作者没有做。证据：[逐篇记录](papers.json)、[来源核验](source-verification.md)。
5. **运行真实程序。** 本地 `verify-citations.py` 导入固定版本原始客户端，不使用答案桩。Crossref最终12/12匹配；S2仅P03/P09匹配，另10条HTTP429。P03原始返回 `paperId=ea8691e32b89822f7fa7ea200222548d72f9d261`；P04原始错误为 `S2 API HTTP 429 after 3 retries`。匹配只支持文献身份，限流不代表假论文。证据：[首批原始请求](https://github.com/yydshly/1025_codex_project/blob/13c81cc0dedb1386fa231549b560a3fae8ef23f3/projects/012-aquatic-toxicology-skill-lab/research/phase2_investigation/citation-verification.json)、[补批](https://github.com/yydshly/1025_codex_project/blob/13c81cc0dedb1386fa231549b560a3fae8ef23f3/projects/012-aquatic-toxicology-skill-lab/research/phase2_investigation/citation-verification-additional.json)、[最终合并](citation-verification.json)、[程序](verify-citations.py.txt)。
6. **因前作改变说法。** P03胚胎与仔鱼窗口不同方向，使“一律增强”和“阶段/TK–TD尚未研究”不能成立；P09已有7/28天标签转换，时间差异不能直接当创新；P10有PINK1功能救援线索，机制不能概括为全部仅相关，但鱼/细胞归属仍待核。**这些起点是代理构造的证据探针，不是用户原始信念。** 综合角色产出矩阵与待确认张力，主会话按原始编写规范只用既有材料写报告。证据：[综合](synthesis.md)、[已有过程中的判断变化](process.md)、[最终报告](report.md)。
7. **修订并回查。** R01–R05分别修正P06未决、核心与方法/背景关联、首屏阅读分母、10篇关联只连6篇、决定性标题。审查代理重读实际修改后的文件，逐项记 `resolved_verified`。这是同一AI链的角色检查，收据只覆盖所列问题；软件/浏览器验证也不能代表科学验证。证据：[审查详情](review.md)、[状态记录](https://github.com/yydshly/1025_codex_project/blob/13c81cc0dedb1386fa231549b560a3fae8ef23f3/projects/012-aquatic-toxicology-skill-lab/research/phase5_review/review.json)。

本次能复查的价值是检索记录、阅读边界、真实API成败、因前作缩小的主张和修订收据。尚未完成的是作者选题确认、关键全文、正式相互作用和机制归属核对。没有独立专家认证、完整原生全流程PASS或技能效率增益的证据。
