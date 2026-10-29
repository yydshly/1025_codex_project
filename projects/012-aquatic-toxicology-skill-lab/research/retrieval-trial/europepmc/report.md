# Europe PMC冻结查询实测

按原始bibliography_agent的检索参数与逐来源记录要求，执行本项目已经冻结的两条Europe PMC查询。没有修改检索词、读取基准集、进行结果筛选或完成全文审读。

接口：`https://www.ebi.ac.uk/europepmc/webservices/rest/search`；匿名GET；`format=json`、`resultType=core`、`pageSize=1000`、`cursorMark=*`。预先声明的每查询上限1000条，本次未触及。

| 查询 | API命中数 | 实际取回 | 分页完整性 |
|---|---:|---:|---|
| EPMC-PRIMARY | 18 | 18 | True；1页 |
| EPMC-NO-ORGANISM | 580 | 580 | True；1页 |

两查询合并后580个唯一source/id；主检索18条全部位于去掉物种块的580条扩展结果中。576条含返回摘要，561条含DOI。这里没有将缺失摘要猜成无关。

每次请求的URL、参数、开始/完成UTC时刻、HTTP状态及字节数在各查询retrieval.json；每一页的服务器原始JSON与SHA-256一并保存。成功取回全部API报告记录仅说明这两条查询的返回没有截断，不代表检索式能找到全部合格文献。Europe PMC与PubMed大量重叠，不能将其当作完全独立证据库。

本轮保存的原始与规范化摘要供筛选核查，网页应以题录、短转述和原始链接展示，避免批量转载摘要正文。

冻结方案SHA-256：`c8ee855cabc2e8193295d588c939848364d2f2dc3f2e060ddf27841d094252d4`。
