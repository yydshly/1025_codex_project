"""Render the checked-in implementation specifications as a readable local report."""
import html
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
read = lambda name: json.loads((HERE / name).read_text(encoding="utf-8"))
esc = lambda value: html.escape(str(value), quote=True)


def items(values):
    return "<ul>" + "".join("<li>" + esc(v) + "</li>" for v in values) + "</ul>"


def document():
    plan = read("implementation-roadmap.json")
    specifications = read("scenario-specifications.json")
    contracts = read("operating-contracts.json")
    packages = []
    for package in plan["workPackages"]:
        ready = package["status"] == "verified-local"
        status = "本批已修复并验证" if ready else "规格已写 · 实现待完成"
        names={"FIX-PLAYBACK-EXPORT":"播放与证据导出","CORE-PRESENTATION":"共用呈现","TIME-SPACE":"时间与空间","EVENT-REGISTRY":"真实事件注册","SOURCE-OPERATIONS":"数据持续更新","NARRATION-PIPELINE":"MiniMax讲解","DEVICE-ADAPTER":"设备日志接入"}
        packages.append("<tr><td>" + esc(names[package["id"]]) + "</td><td class='" + ("ready" if ready else "pending") + "'>" + status + "</td><td>" + esc(package["output"]) + "</td></tr>")
    cards = []
    for index, scene in enumerate(specifications["scenarios"], 1):
        sources = "".join("<li><a href='" + esc(source["url"]) + "' target='_blank' rel='noopener'>" + esc(source["name"]) + " ↗</a><small>候选来源 · 具体新样本待核实</small></li>" for source in scene["sourceCandidates"])
        indicators = " / ".join(indicator["name"] for indicator in scene["primaryIndicators"])
        scope = items(scene["firstVersionScope"].values())
        cards.append("<article id='" + esc(scene["id"]) + "'><div class='card-head'><span>" + str(index).zfill(2) + "</span><h2>" + esc(scene["name"]) + "</h2><b class='pending'>新增能力待接入</b></div><p class='question'>" + esc(scene["question"]) + "</p><p><strong>当前：</strong>" + esc(scene["currentState"]["existing"]) + "</p><p><strong>面向：</strong>" + esc(scene["primaryUser"]) + "</p><div class='columns'><section><h3>要看见的动态</h3>" + items(scene["visibleObjects"]) + "<h3>镜头怎样带着看</h3>" + items(scene["cameraSequence"]) + "</section><section><h3>首版范围</h3>" + scope + "<h3>主要指标</h3><p>" + esc(indicators) + "</p><h3>用户带走什么</h3>" + items(scene["explanationResult"]["content"]) + "</section></div><details><summary>查看数据门槛、来源与完成分级</summary><h3>接入前必须具备</h3>" + items(scene["admissionConditions"]) + "<h3>来源入口</h3><ul class='sources'>" + sources + "</ul><h3>完成分级</h3><pre>" + esc(json.dumps(scene["completionByCapability"], ensure_ascii=False, indent=2)) + "</pre></details></article>")
    dependencies = items([plan["dependencyPolicy"]["principle"], plan["dependencyPolicy"]["blockedBehavior"], plan["dependencyPolicy"]["candidatePolicy"]])
    return """<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>真实场景实施与进度</title><style>
*{box-sizing:border-box}body{margin:0;background:#09131d;color:#d6e4ec;font:15px/1.8 system-ui,'Microsoft YaHei',sans-serif}main{max-width:1160px;margin:auto;padding:40px 28px 80px}a{color:#a4dfe6;text-underline-offset:4px}h1{font-size:32px;margin:12px 0}h2{font-size:23px;margin:0}h3{font-size:15px;color:#b1c8d6;margin:22px 0 6px}p{margin:10px 0}.eyebrow{color:#97b8ca;font-size:12px;letter-spacing:2px}.intro{font-size:17px;max-width:900px}.notice{border-left:3px solid #dcc28e;background:#1c2a35;padding:14px 20px;margin:24px 0}.ready{color:#9fe2c8}.pending{color:#e5c68d}.label{color:#a4baca;font-size:13px}nav{display:flex;flex-wrap:wrap;gap:10px;margin:25px 0}nav a{border:1px solid #3c5667;border-radius:6px;padding:7px 12px;text-decoration:none}table{width:100%;border-collapse:collapse;font-size:14px}td,th{padding:13px 14px;border-bottom:1px solid #334754;text-align:left;vertical-align:top}th{color:#9fb9c9}td:first-child{white-space:nowrap}.table-wrap{overflow:auto;border:1px solid #334754;border-radius:8px;margin:20px 0}article{border:1px solid #334c5d;background:#101f2b;border-radius:10px;padding:24px;margin:24px 0;scroll-margin-top:20px}.card-head{display:flex;gap:13px;align-items:center}.card-head>span{color:#81abba;font:16px monospace}.card-head>b{font-size:12px;font-weight:400;margin-left:auto}.question{font-size:18px;color:#eef6fa}.columns{display:grid;grid-template-columns:1fr 1fr;gap:32px}ul{padding-left:21px;margin:8px 0}li{margin:5px 0}details{border-top:1px solid #344957;margin-top:20px;padding-top:15px}summary{cursor:pointer;color:#b8dce2}.sources small{display:block;color:#94aab9}pre{white-space:pre-wrap;overflow-wrap:anywhere;color:#afc7d4;font:12px/1.7 monospace}code{font-size:12px}footer{margin-top:30px;color:#9db3c2;font-size:13px}@media(max-width:700px){main{padding:24px 16px 50px}h1{font-size:26px}.columns{grid-template-columns:1fr;gap:0}.card-head{flex-wrap:wrap}.card-head>b{margin-left:0}article{padding:18px}.intro{font-size:15px}td,th{padding:10px}table{min-width:650px}}
</style></head><body><main><div class="eyebrow">IMPLEMENTATION / 2026-11-05</div><h1>真实场景实施与进度</h1><p class="intro">保留已有地球与实测资料，先修共用问题，再逐项补全真实场景。每个方向分别核实数据、动态呈现、解释与更新能力。</p><div class="notice"><strong>本批完成：</strong>播放失败状态、实际所见导出、语音清单重试和参考轮廓重试。<br><strong>以下七类是交付规格：</strong>写好规格不等于接通新资料，也不等于场景已完成。</div><p><a href="../app/index.html#dynamic-storm">打开现有地球产品 ↗</a>　<a href="implementation-roadmap.json">结构化规划</a>　<a href="operating-contracts.json">数据与讲解合同</a></p><h2>共用工作包</h2><div class="table-wrap"><table><thead><tr><th>工作包</th><th>实际状态</th><th>交付结果</th></tr></thead><tbody>""" + "".join(packages) + "</tbody></table></div><h3>依赖和阻塞怎样处理</h3>" + dependencies + "<h2>七方向交付规格</h2><nav>" + "".join("<a href='#" + esc(scene["id"]) + "'>" + esc(scene["name"]) + "</a>" for scene in specifications["scenarios"]) + "</nav>" + "".join(cards) + "<article><h2>共同运行和验收要求</h2><p>绝对时间、实验时长与循环编号分别表达；地理、天体与设备局部坐标分别注册。资料按来源更新、保留版本和过期状态；讲解以有依据的章节生成，音轨绑定资料与脚本版本。</p><details><summary>展开完整运行合同</summary><pre>" + esc(json.dumps(contracts, ensure_ascii=False, indent=2)) + "</pre></details></article><footer>本地实施规划 · 候选来源的具体时窗、文件覆盖与可用条件在接入时逐项验证。</footer></main></body></html>"


if __name__ == "__main__":
    (HERE / "implementation-plan.html").write_text(document(), encoding="utf-8")
    print("Rendered research/implementation-plan.html")
