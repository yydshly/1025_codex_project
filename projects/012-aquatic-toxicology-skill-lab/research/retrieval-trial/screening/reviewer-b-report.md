# 第二AI筛选复核（Reviewer B）

独立于第一轮决定阅读所选题名与全部返回摘要；未读取Reviewer A或基准集。

## 抽样与分母

Europe PMC 580条加PubMed17条，按DOI/PMID合并仍为580个来源记录。全部主检索18条；物种/胚胎/仔体风险词命中的额外31条；其余531条用seed=20261029抽40条，共89条。

这是按风险全查加随机抽样的记录级复核，含尚待题名二次去重的AGR/MED重复候选；不是89项独立实验，更不是580篇全文已审。

## 实际决定

保留13条，排除75条，待定1条。保留中有1对AGR/MED同题记录，不能重复计数。

待定：10.1016/j.jhazmat.2021.125626同时包含斑马鱼、青鳉和多种预吸附污染物；摘要未逐一对应斑马鱼PFOS处理，需全文核实，故保留待定。

## 输入质量发现

During this review, trial adapter v1's HTML stripping was found to remove text between mathematical comparison signs. All 89 records were reviewed against the repaired normalization; original pages and v1 snapshots remain. See europepmc/normalization-repair.json. This was our new adapter's error, not missing original-paper content.

## 局限

89 source records reviewed, not 580 full-text studies. 18 primary + 31 high-risk extra + 40 random remainder. Same AI family, independently assessed decisions, not human domain experts. Reviewer A and independent benchmark were not read. Retain means potentially eligible at title/abstract level; full-text arms, comparators, and methods remain unverified.

逐条决定、短理由、证据位置、source ID、DOI和抽样清单见reviewer-b.json；此时尚未与第一轮决定比较。
