# 第二轮综合 · 定点证据审查

审查代理：round2_reading_a。非独立专家评阅；A组提取为本代理先前撰写，回查A来源不计独立复现。

## 检查范围

- synthesis.json：六条结论、首轮对照、五对tensions、边界及下一步的逐项措辞审查。
- reading-c.json：P10（Taa939a1c2）完整条目； independently reopened ZFIN Fig6/7和PubMed41616538作者摘要，以核对模型定位和证据边界。
- retrieval-trial retain及research.json core DOI重新计算：17唯一候选、9首轮重合、8新增，P04不在17内；17选2=136。
- Frontiers2019关键段重开：Results的急性/畸形、cyp1a、EROD及Larval Behavior。该文提取由本审查代理先前参与，属于对主会话综合的回查，不是独立复现A组提取。

## 已核对相符的部分

- V01：P10 Fig6明确为SH-SY5Y细胞PINK1过表达，Fig7为斑马鱼MTK458处理；综合没有把它改写为整鱼PINK1遗传救援。
  - https://zfin.org/ZDB-FIG-260402-6
  - https://zfin.org/ZDB-FIG-260402-7
- V02：PubMed作者摘要报告PINK1过表达及药理激活；综合将其与模型定位并列，同时保留剂量、特异性和完整方法未知，未认证完整因果链。
  - https://pubmed.ncbi.nlm.nih.gov/41616538/
- V03：Fig6/7图注多个量化面板写n=3。C组明确未获实验单位和批次定义，没有把它写成3条鱼/3缸。
  - https://zfin.org/ZDB-FIG-260402-6
  - https://zfin.org/ZDB-FIG-260402-7
- V04：17/9/8计数及P04不在候选的说法吻合本地DOI对照。5对是选定比较，综合没有假称完成136对或再次查全。
  - app/data/retrieval-trial.json
  - app/data/research.json
  - research/round2/synthesis.json
- V05：R2C03新增F53B累积下降仍伴炎症的表述与该原始作者摘要吻合；不能据此归因统一载体机制，综合保留跨条件限制。
  - https://pubmed.ncbi.nlm.nih.gov/32416398/
  - https://www.sciencedirect.com/science/article/abs/pii/S0045653520312339

## 需要修订的项

### A-REV01 · medium

综合lead使用“不增强/不显著”，R2C02标题使用“反证”；尽管后文保留限制，单看这些醒目词仍可能把未检出显著差异读成证明无效应或等效。

依据：synthesis.lead；conclusions.R2C02.title；Frontiers Results及Lau相关章节均没有本轮核查过的等效性/功效分析。

建议：改为“未检出显著变化/未见进一步放大的条件限定结果”；标题可写“更多端点与条件限制了统一增强的表述”，继续保留null≠zero限制。

### A-REV02 · medium

C组P10第二条finding同时陈述细胞过表达与整鱼药理处理，但单个sourceUrl只链接Fig7；点击该条直接来源无法核对前半句Fig6细胞结论。

依据：reading-c.json，Taa939a1c2.findings[1]；Fig6图注明确SH-SY5Y，Fig7只讲MTK458斑马鱼。sources虽列Fig6，定位还可更直接。

建议：将finding拆成Fig6细胞过表达、Fig7斑马鱼MTK458两条，分别sourceUrl=...-6和...-7；不升级为全文或整鱼遗传因果验证。

### A-REV03 · low

tensions中R02—R13的locators写“Results Acute toxicity/Behavioral responses”，不是该Frontiers主文实际节名，降低复核定位精度。

依据：实际节名为Embryotoxic and Teratogenic Effects和Larval Behavior。

建议：使用实际节名，并可附图1/2及图5。

## 局限

- 这是同一模型家族子代理的定点审查，不是独立领域专家双人评阅或方法质量认证。
- A组提取由本代理撰写；对A来源和主会话综合关系的核对不自称独立审读。P10来源与模型定位是本次新开原始图注的单独核对。
- 没有读取P10完整方法、原始图像定量或SI，没有验证MTK458特异性、重算交互模型或定义n的实验单位。
- 未完成17篇完整方法风险偏倚审查、136对全比较或领域查全。本审查只依据文件当前可见版本提出修订，修复与最终回执由主会话完成。
