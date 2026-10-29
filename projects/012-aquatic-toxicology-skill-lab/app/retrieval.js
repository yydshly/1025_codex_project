"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const array = (value) => Array.isArray(value) ? value : [];
  const text = (value, fallback = "待完成 / 未记录") => {
    if (value === null || value === undefined || value === "") return fallback;
    if (Array.isArray(value)) return value.map((item) => text(item, "")).filter(Boolean).join("；");
    if (typeof value === "object") {
      if (value.decision !== undefined) return [decisionLabel(value.decision), text(value.reason, "")].filter(Boolean).join("：");
      return text(value.name || value.title || value.description || value.text || value.label || value.result || value.id, fallback);
    }
    return String(value);
  };
  const decisionLabel = (value) => ({ retain: "保留相关线索", exclude: "排除", uncertain: "待全文核实" }[value] || text(value, "待判断"));
  function el(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = text(value, "");
    return node;
  }
  function field(label, value, className = "") {
    const block = el("div", `retrieval-field ${className}`.trim());
    block.append(el("h4", "", label));
    if (Array.isArray(value)) {
      const ul = el("ul");
      value.forEach((item) => ul.append(el("li", "", item)));
      block.append(ul);
    } else block.append(el("p", "", value === undefined || value === null || value === "" ? "待完成 / 未记录" : text(value)));
    return block;
  }
  function safeLink(label, target, download = false) {
    if (typeof target !== "string" || !target.trim()) return el("span", "", label);
    try {
      const url = new URL(target, document.baseURI);
      if (!["http:", "https:"].includes(url.protocol)) return el("span", "", label);
      const link = el("a", "retrieval-link", label);
      link.href = url.href;
      if (download && url.origin === location.origin) link.download = "";
      else if (url.origin !== location.origin) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      return link;
    } catch (_) { return el("span", "", label); }
  }
  function badge(value, className = "") { return el("span", `retrieval-badge ${className}`.trim(), value); }
  function heading(parent, title, description) {
    const block = el("div", "retrieval-panel-heading");
    block.append(el("h3", "", title));
    if (description) block.append(el("p", "", description));
    parent.append(block);
  }
  function details(title, status, open = false) {
    const detail = el("details", "retrieval-detail");
    detail.open = open;
    const summary = el("summary");
    summary.append(el("span", "retrieval-detail-title", title));
    if (status) summary.append(badge(status));
    summary.append(el("span", "retrieval-expand", "+"));
    const body = el("div", "retrieval-detail-body");
    detail.append(summary, body);
    return { detail, body };
  }
  function copyQuery(button, value, status) {
    button.addEventListener("click", async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("clipboard unavailable");
        await navigator.clipboard.writeText(text(value, ""));
        status.textContent = "检索式已复制";
      } catch (_) { status.textContent = "可直接选择下方完整检索式，复制后使用。"; }
    });
  }
  function renderOwnership(parent, data) {
    if (!data) return;
    function evidenceLink(source) {
      if (source.url.startsWith("https://")) return safeLink(source.label, source.url);
      const relative = source.url.split("#")[0];
      const published = {
        "scripts/retrieve-pubmed.py": "retrieve-pubmed.py.txt", "scripts/retrieve-europepmc.py": "retrieve-europepmc.py.txt", "scripts/retrieve-openalex.py": "retrieve-openalex.py.txt", "scripts/verify-citations.py": "verify-citations.py.txt",
        "research/phase2_investigation/citation-verification-combined.json": "citation-verification.json", "research/retrieval-trial/report.md": "retrieval-trial-report.md", "research/retrieval-trial/trial.json": "retrieval-trial.json", "research/upstream-manifest.json": "upstream-manifest.json",
      }[relative];
      return published ? safeLink(source.label, "./data/" + published) : el("p", "retrieval-table-reason", `${source.label}：本地 ${source.url}（未发布）`);
    }
    parent.append(el("span", "eyebrow", "WHAT CAME FROM WHERE"), el("h3", "", "这三个采集脚本，都是本轮新增的"));
    parent.append(el("p", "retrieval-ownership-lead", "retrieve-pubmed.py、retrieve-europepmc.py、retrieve-openalex.py 由我在本案例中编写（含子代理协作）；固定提交的原始源码中没有这三份文件。"));
    const pair = el("div", "retrieval-pair");
    pair.append(field("原库提供", "检索与筛选的流程规范；已有引文核验客户端，以及另一套主题发现代码。规范由AI执行，代码需由宿主接入。"), field("本轮额外补充", "三个API采集器、具体检索词与修订、分页和原始响应留痕、基准漏检测试、去重初筛与网页展示。"));
    parent.append(pair);
    const { detail, body } = details("逐项对照：原库有什么，本次用了什么？", "来源可核对");
    const wrap = el("div", "retrieval-table-wrap"); wrap.tabIndex = 0; wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", "检索能力归属对照，可横向滚动");
    const table = el("table", "retrieval-check-table retrieval-ownership-table");
    const head = el("thead"), hrow = el("tr");
    ["环节", "固定版本原库提供", "本轮新增 / 具体适配", "实际执行状态"].forEach((value) => { const th = el("th", "", value); th.scope = "col"; hrow.append(th); });
    head.append(hrow); const rows = el("tbody");
    array(data.rows).forEach((item) => {
      const row = el("tr"); const topic = el("th", "", item.task); topic.scope = "row";
      const original = el("td", "", item.original), ours = el("td", "", item.ours), status = el("td", "", item.runState);
      const links = el("div"); array(item.sources).forEach((source) => links.append(evidenceLink(source))); original.append(links);
      row.append(topic, original, ours, status); rows.append(row);
    });
    table.append(head, rows); wrap.append(table); body.append(wrap);
    body.append(safeLink("下载完整归属审计 MD ↓", "./data/retrieval-ownership-audit.md", true), el("br"), safeLink("下载结构化归属与文件证据 JSON ↓", "./data/retrieval-ownership-audit.json", true));
    parent.append(detail, el("p", "retrieval-boundary", "因此，984条候选、3/5→5/5是“原库规范＋AI执行＋本轮新增脚本与测试”的组合结果。没有原库单独运行、或有无Skill的对照，不能把这些数字当成原Skill自身的性能成绩。原库另有主题发现模块，本例未调用；它在此场景的表现仍未实测。"));
  }
  function renderQueries(parent, data) {
    heading(parent, "检索词怎样生成，实际去了哪些源？", "先固定概念块与查询，再记录接口返回。检索源之间可能收录同一批论文，来源数量不能直接当覆盖率。");
    const blocks = el("div", "retrieval-term-blocks");
    array(data.termBlocks).forEach((item, i) => {
      const block = el("article", "retrieval-term-block");
      block.append(el("span", "eyebrow", `CONCEPT ${String(i + 1).padStart(2, "0")}`), el("h3", "", item.name), el("p", "", item.why));
      const terms = el("div", "retrieval-terms");
      array(item.terms).forEach((term) => terms.append(el("code", "", term)));
      block.append(terms); blocks.append(block);
    });
    parent.append(blocks);
    const plan = el("div", "retrieval-plan");
    plan.append(field("本轮方案冻结时间", data.meta?.startedAt), field("原始方案 SHA-256", data.meta?.planHash));
    parent.append(plan);
    array(data.queries).forEach((query, i) => {
      const { detail, body } = details(`${text(query.id, String(i + 1))} · ${text(query.source)}`, query.status || "接口状态待记录", i === 0);
      body.append(field("这条检索的用途", query.purpose));
      const metrics = el("dl", "retrieval-query-counts");
      for (const [label, value] of [["接口报告总数", query.total], ["实际取回", query.returned], ["分页完整性", query.complete === true ? "本条已取完" : query.complete === false ? "未完整取回 / 有边界" : "未验证"], ["实际执行时间", query.at]]) {
        const item = el("div"); item.append(el("dt", "", label), el("dd", "", value === null || value === undefined ? "未取得" : value)); metrics.append(item);
      }
      body.append(metrics);
      const copyline = el("div", "retrieval-query-tools");
      const button = el("button", "retrieval-copy", "复制完整检索式"); button.type = "button";
      const status = el("span", "retrieval-copy-status"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
      copyQuery(button, query.query, status);
      copyline.append(button, status);
      body.append(copyline, el("pre", "retrieval-query", query.query));
      if (query.url) body.append(safeLink("打开这条接口查询 ↗", query.url));
      if (query.translation) body.append(field("接口解析 / 转译后的检索式", query.translation));
      body.append(field("实际限制、失败或说明", query.notes));
      parent.append(detail);
    });
    if (!array(data.queries).length) parent.append(el("p", "empty-copy", "查询回执待生成；这里没有预填成功结果。"));
  }
  function renderRecords(parent, data, state) {
    heading(parent, "结果怎样筛选？", "逐条保留判断和理由。这里的保留表示相关文献线索；不表示已完成全文审读或实验质量评价。第二轮AI筛选也不等于独立人工复核。");
    const flow = el("div", "retrieval-flow");
    array(data.flow).forEach((item) => {
      const block = el("div"); block.append(el("strong", "", item.count === null || item.count === undefined ? "—" : item.count), el("span", "", item.label), el("p", "", item.detail)); flow.append(block);
    });
    parent.append(flow);
    const controls = el("div", "retrieval-record-controls");
    const label = el("label", "retrieval-search-label");
    label.append(el("span", "visually-hidden", "搜索本轮检索记录"));
    const input = el("input"); input.type = "search"; input.id = "retrieval-record-search"; input.placeholder = "搜索题名、DOI、记录编号…"; input.value = state.search;
    label.append(input);
    const decision = el("label", "retrieval-decision-label"); decision.append(el("span", "visually-hidden", "筛选决定"));
    const select = el("select"); select.id = "retrieval-decision-filter"; select.setAttribute("aria-label", "筛选决定");
    for (const [value, name] of [["all", "全部决定"], ["retain", "保留相关线索"], ["exclude", "排除"], ["uncertain", "待全文核实"]]) {
      const option = el("option", "", name); option.value = value; select.append(option);
    }
    select.value = state.decision; decision.append(select); controls.append(label, decision);
    const count = el("p", "retrieval-result-count"); count.setAttribute("role", "status"); count.setAttribute("aria-live", "polite");
    const list = el("div", "retrieval-record-list"); list.id = "retrieval-record-list";
    const more = el("button", "retrieval-more", "继续显示记录"); more.type = "button";
    parent.append(controls, count, list, more);
    function paint() {
      const needle = state.search.trim().toLocaleLowerCase();
      const records = array(data.records).filter((record) => (state.decision === "all" || record.decision === state.decision) && (!needle || [record.id, record.title, record.doi, record.reason, text(record.sources, ""), text(record.queries, "")].join(" ").toLocaleLowerCase().includes(needle)));
      list.replaceChildren();
      const visible = records.slice(0, state.limit);
      count.textContent = `匹配 ${records.length} / ${array(data.records).length} 条；当前显示 ${visible.length} 条。`;
      visible.forEach((record) => {
        const { detail, body } = details(`${text(record.id, "记录")} · ${text(record.title)}`, decisionLabel(record.decision));
        const meta = el("div", "retrieval-record-meta");
        meta.append(el("span", "", record.year), el("span", "", text(record.sources, "来源未记录")));
        if (record.isNew === true) meta.append(badge("上一轮未收录"));
        body.append(meta, field("最终筛选理由", record.reason), field("命中的查询 / 检索路径", record.queries), field("本轮实际阅读范围", record.readScope));
        body.append(field("这条记录怎样判断", ({automatic_rule:"程序规则初筛，未逐条阅读摘要",primary_AI:"主代理定点判断",targeted_AI:"新增OpenAlex候选的定点AI筛选",second_AI:"独立于初判的AI复核，非人工审核",primary_AI_adjudication:"主代理根据来源或分歧作出裁决"})[record.screenMethod] || record.screenMethod));
        const pair = el("div", "retrieval-pair"); pair.append(field("初筛 / 定点判断", record.review1), field("独立AI复核（本轮子集）", record.review2));
        body.append(pair, field("分歧、复查与裁决", record.adjudication));
        const link = record.url || (record.doi ? `https://doi.org/${record.doi}` : null);
        if (link) body.append(safeLink(record.doi ? `原始文献 · ${record.doi} ↗` : "打开原始文献 ↗", link));
        list.append(detail);
      });
      if (!records.length) list.append(el("p", "empty-copy", "没有匹配记录。可清除关键词或切换决定筛选。"));
      more.hidden = visible.length >= records.length;
      more.textContent = `继续显示 ${Math.min(30, records.length - visible.length)} 条记录`;
    }
    input.addEventListener("input", () => { state.search = input.value; state.limit = 30; paint(); });
    select.addEventListener("change", () => { state.decision = select.value; state.limit = 30; paint(); });
    more.addEventListener("click", () => { state.limit += 30; paint(); });
    paint();
  }
  function renderChecks(parent, data) {
    heading(parent, "漏检检查实际发现了什么？", "原始查询找回、扩展查询新增和引文追踪新增分别记录。测试集有自己的分母；通过一组测试不表示找到了领域全部论文。");
    array(data.checks).forEach((check, i) => {
      const { detail, body } = details(check.title || check.id, check.status || "验证状态待完成", i === 0);
      const result = el("div", "retrieval-check-result"); result.append(field("检验分母 / 检查范围", check.denominator), field("实际结果", check.result));
      body.append(result, field("怎么检查", check.method), field("这个检查仍不能证明什么", check.limitations));
      if (array(check.rows).length) {
        const wrap = el("div", "retrieval-table-wrap"); wrap.tabIndex = 0; wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", `“${text(check.title)}”逐条找回结果，可横向滚动`);
        const table = el("table", "retrieval-check-table");
        const thead = el("thead"); const tr = el("tr");
        ["核查文献", text(check.statusColumn, "找回状态"), "出现在哪 / 原因"].forEach((label) => { const th = el("th", "", label); th.scope = "col"; tr.append(th); });
        thead.append(tr); const tbody = el("tbody");
        array(check.rows).forEach((row) => {
          const r = el("tr"); const title = el("td"); title.append(el("p", "", row.title));
          if (row.doi) title.append(safeLink(row.doi, `https://doi.org/${row.doi}`));
          const found = row.found === true ? "找到" : row.found === false ? "未找到" : "未核实";
          const status = el("td"); status.append(badge(found, row.found === true ? "retrieval-found" : ""));
          const why = el("td"); why.append(el("p", "", row.where), el("p", "retrieval-table-reason", row.reason));
          r.append(title, status, why); tbody.append(r);
        });
        table.append(thead, tbody); wrap.append(table); body.append(wrap);
      }
      parent.append(detail);
    });
    if (!array(data.checks).length) parent.append(el("p", "empty-copy", "漏检验证结果待生成；暂不显示通过标记。"));
  }
  function renderProcess(parent, data) {
    heading(parent, "过程与可复核文件", "时间线记录实际动作与产物；原始科学结论和本轮检索质量检查分开看。");
    const timeline = el("ol", "retrieval-timeline");
    array(data.timeline).forEach((item) => {
      const row = el("li"); row.append(el("span", "retrieval-time", item.at), el("h4", "", item.action), field("实际产物", item.output), field("对后续的影响", item.impact)); timeline.append(row);
    });
    parent.append(timeline, field("本轮仍存在的盲区", data.gaps, "retrieval-gaps"));
    const downloads = el("div", "retrieval-downloads");
    array(data.downloads).forEach((item) => { const link = safeLink(`${text(item.kind, "文件").toUpperCase()} · ${text(item.label)} ↓`, item.url, true); downloads.append(link); });
    if (!array(data.downloads).length) downloads.append(el("p", "empty-copy", "下载文件待导出。"));
    parent.append(downloads);
  }
  function boot() {
    const panel = $("retrieval-panel"); if (!panel) return;
    const data = window.RESEARCH_DATA?.retrievalTrial;
    if (!data || typeof data !== "object") { panel.append(el("p", "empty-copy", "检索实测数据尚未载入。结果生成后可重新载入页面查看；当前不预填成功计数。")); return; }
    renderOwnership($("retrieval-ownership"), data.ownership);
    if (data.meta?.title) $("retrieval-title").textContent = text(data.meta.title);
    const meta = $("retrieval-meta");
    meta.append(badge(data.meta?.status || "执行状态待记录"), el("span", "", text(data.meta?.startedAt, "执行时间待记录")));
    $("retrieval-lead").textContent = text(data.summary?.lead, "本轮检索概览待完成。");
    $("retrieval-boundary").textContent = text(data.meta?.boundary, "本轮仅检索与筛选；验证边界待记录。");
    array(data.summary?.metrics).forEach((metric) => {
      const item = el("div"); item.append(el("strong", "", metric.value === null || metric.value === undefined ? "—" : metric.value), el("span", "", metric.label), el("p", "", metric.detail)); $("retrieval-metrics").append(item);
    });
    const state = { search: "", decision: "all", limit: 30 };
    const tabs = [{ label: "词与来源", render: renderQueries }, { label: "逐条筛选", render: renderRecords }, { label: "漏检验证", render: renderChecks }, { label: "过程与文件", render: renderProcess }];
    const buttons = tabs.map((item, i) => {
      const button = el("button", "retrieval-tab"); button.type = "button"; button.id = `retrieval-tab-${i}`; button.setAttribute("role", "tab"); button.setAttribute("aria-controls", "retrieval-panel");
      button.append(el("span", "retrieval-tab-number", String(i + 1).padStart(2, "0")), el("span", "", item.label)); $("retrieval-tabs").append(button);
      button.addEventListener("click", () => select(i));
      button.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); select(next); buttons[next].focus(); }
      });
      return button;
    });
    function select(index) {
      buttons.forEach((button, i) => { button.setAttribute("aria-selected", String(index === i)); button.tabIndex = index === i ? 0 : -1; });
      panel.setAttribute("aria-labelledby", buttons[index].id); panel.replaceChildren(); tabs[index].render(panel, data, state);
    }
    select(0);
  }
  boot();
})();
