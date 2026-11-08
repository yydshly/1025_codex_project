# 吉林大学柴油机 ETC 台架回放

Zhao 等在吉林大学与长春一汽四环发动机制造有限公司合作试验中，使用瞬态电力测功机在台架上复现欧洲瞬态循环（ETC），记录一台 2.7 L 四缸柴油机。原始 MAT 由作者在吉林大学页面公开，论文图 1 给出了各通道单位及工况分界。[论文及图 1](https://scis.scichina.com/en/2019/077201.pdf) · [作者的数据说明](http://www.ascl.jlu.edu.cn/vci/info/1010/1082.htm) · [原始 ZIP](http://www.ascl.jlu.edu.cn/vci/datafile.zip)

## 原档和显示口径

| 显示通道 | MAT 变量 | 原单位 | 显示单位 | 依据 |
| --- | --- | --- | --- | --- |
| 转速 | `speed` | r/min | rpm | 论文列为实时测量，图 1(b) |
| 扭矩 | `torque` | N·m | N·m | 论文列为实时测量，图 1(a) |
| 燃油轨压 | `RP` | hPa | MPa，原值除以 10,000 | 台架原档通道，图 1(g)。论文在建模例中将 RP 列为模型输入，未交代该量来自传感器反馈或控制器目标值。 |

压缩包内只有 `dataset_for_engine.mat`。文件含 `speed`、`torque`、`APS`、`FIR`、`SOI`、`AIM`、`RP` 七个 18,000×1 向量。按论文的 0.1 秒采样周期，以首行为零、行号顺序重建经过时间，末行为 1799.9 秒。两侧图表、读数和标注只对应原档行。图 1 的台架阶段界线分别为 600 秒和 1200 秒，对应城区、郊区和高速工况。原档未提供绝对试验时间和测试台坐标，剖面是通用结构示意。

30–90 秒为播放器的首段导读。该段在每隔 10 秒候选起点的 60 秒窗口中，三通道相对全程的极差乘积最大。38.5 秒扭矩首次到 0 N·m，同时转速为 3197 rpm；45.9 秒轨压达到窗口内最低 24.33 MPa；85.6 秒转速降至全程最低 753 rpm。完整 18,000 条仍可回放。

## 本地复现

需要 Python 3.10+、SciPy 和 NumPy。在项目目录执行以下命令。若网络限制直接下载，可从作者页面取原 ZIP，再用 `--zip 路径` 指定文件。原链接使用 HTTP，按 `source-receipt.json` 固定的 SHA-256 验证 ZIP 和内部 MAT 后才处理数据。

```powershell
python research/dynamics/jlu-diesel/process_engine.py --download
python research/dynamics/jlu-diesel/process_engine.py --check
npm run check:dynamics
```

论文说明数据对学术研究开放。原始压缩包、论文及作者页面未列出明确的公开再分发或商用授权。ZIP 和 `app/data/engine-jlu-diesel-dynamic.local.json` 留在本地供研究预览，生成脚本和下载凭证可随项目保留。部署版本在缺少数据时显示来源及本地回放说明。
