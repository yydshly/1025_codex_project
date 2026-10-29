"use strict";

(() => {
  const array = (value) => Array.isArray(value) ? value : [];
  const text = (value, fallback = "未记录") => {
    if (value === null || value === undefined || value === "") return fallback;
    if (Array.isArray(value)) return value.map((item) => text(item, "")).filter(Boolean).join("；");
    if (typeof value === "object") return text(value.text || value.description || value.title || value.name || value.label || value.rule || value.id, fallback);
    return String(value);
  };
  function el(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = text(value, "");
    return node;
  }
  function link(label, target, download = false) {
    if (typeof target !== "string" || !target.trim()) return el("span", "", label);
    try {
      const url = new URL(target, document.baseURI);
      if (!["https:", "http:"].includes(url.protocol)) return el("span", "", label);
      const node = el("a", "understanding-link", label);
      node.href = url.href;
      if (download && url.origin === location.origin) node.download = "";
      else if (!target.startsWith("#")) { node.target = "_blank"; node.rel = "noopener noreferrer"; }
      return node;
    } catch (_) { return el("span", "", label); }
  }
  function badge(value, className = "") { return el("span", `understanding-badge ${className}`.trim(), value); }
  function field(label, value, className = "") {
    const node = el("div", `understanding-field ${className}`.trim());
    node.append(el("h5", "", label));
    if (Array.isArray(value)) {
      const list = el("ul"); value.forEach((item) => list.append(el("li", "", item))); node.append(list);
    } else node.append(el("p", "", value));
    return node;
  }
  function heading(parent, title, description, eyebrow) {
    const node = el("div", "understanding-heading");
    if (eyebrow) node.append(el("span", "eyebrow", eyebrow));
    node.append(el("h3", "", title));
    if (description) node.append(el("p", "", description));
    parent.append(node);
    return node;
  }
  function detail(title, state, className = "") {
    const node = el("details", `understanding-detail ${className}`.trim());
    const summary = el("summary");
    summary.append(el("span", "understanding-detail-title", title));
    if (state) summary.append(badge(state));
    const toggle = el("span", "understanding-expand", "+"); toggle.setAttribute("aria-hidden", "true");
    summary.append(toggle);
    const body = el("div", "understanding-detail-body");
    node.append(summary, body);
    return { node, body };
  }
  function renderConclusions(parent, data) {
    if (data.lead) parent.append(el("p", "understanding-lead", data.lead));
    const jumps = el("nav", "understanding-jumps"); jumps.setAttribute("aria-label", "理解总览中的快捷入口");
    jumps.append(link("看总览图 ↓", "#understanding-map"), link("看六步流程 ↓", "#understanding-steps"), link("看来源与获取方式 ↓", "#understanding-sources"));
    parent.append(jumps);
    const grid = el("div", "understanding-conclusions");
    array(data.conclusions).forEach((item, index) => {
      const card = el("article", "understanding-conclusion");
      card.append(el("span", "understanding-number", String(index + 1).padStart(2, "0")), el("h3", "", item.title), el("p", "", item.text));
      grid.append(card);
    });
    parent.append(grid);
    const figure = el("figure", "understanding-figure");
    figure.id = "understanding-map";
    const imageLink = link("", "./assets/understanding-map.png");
    imageLink.className = "understanding-image-link";
    imageLink.setAttribute("aria-label", "打开理解总览信息图原图，新标签页");
    const img = el("img"); img.src = "./assets/understanding-map.png";
    img.width = 1536; img.height = 1024;
    img.alt = "原库规范、AI与工具的分工，以及水生毒理学拆题、检索、筛选、补漏和分析的理解总览。完整说明见本节文字。";
    img.loading = "lazy"; img.decoding = "async";
    imageLink.append(img);
    const caption = el("figcaption");
    caption.append(el("span", "", "理解总览 · AI生成信息图，可点击放大。图中“已实测”指第二轮三个API；原文与OECD资料首轮仅用过部分内容，完整评估仍待进行。PubMed检索步骤为ESearch→EFetch，具体接口、归属与执行状态见下方文字。"));
    const tools = el("div", "understanding-figure-tools");
    tools.append(link("打开原图 ↗", "./assets/understanding-map.png"), link("下载信息图 ↓", "./assets/understanding-map.png", true));
    caption.append(tools); figure.append(imageLink, caption); parent.append(figure);
  }
  function renderPrinciple(parent, data) {
    heading(parent, "原理：谁规定，谁执行，谁提供证据？", "把规则、AI判断、工具调用和来源证据分开，才能看清能力来自哪里。", "HOW IT WORKS");
    const grid = el("div", "understanding-principles");
    array(data.principle).forEach((item, index) => {
      const card = el("article", "understanding-principle");
      card.append(el("span", "understanding-number", String(index + 1).padStart(2, "0")), el("h4", "", item.actor), el("p", "", item.does));
      if (item.boundary) card.append(el("p", "understanding-principle-boundary", item.boundary));
      grid.append(card);
    });
    parent.append(grid);
    const { node, body } = detail("归属对照：原库提供与本轮新增", "可展开核对");
    const wrap = el("div", "understanding-table-wrap"); wrap.tabIndex = 0; wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", "原库与本轮新增归属对照，可横向滚动");
    const table = el("table", "understanding-table");
    const head = el("thead"), headRow = el("tr");
    ["环节", "原库提供", "本轮新增 / 适配", "实际状态"].forEach((name) => { const th = el("th", "", name); th.scope = "col"; headRow.append(th); });
    head.append(headRow); const rows = el("tbody");
    array(data.ownership).forEach((item) => {
      const row = el("tr"), name = el("th", "", item.item); name.scope = "row";
      row.append(name, el("td", "", item.upstream), el("td", "", item.caseAdded), el("td", "", item.status)); rows.append(row);
    });
    table.append(head, rows); wrap.append(table); body.append(wrap); parent.append(node);
  }
  function renderSteps(parent, data) {
    heading(parent, "从一个主题，到可以核对的判断", "每一步都留下输入、动作、产物和检查点。具体领域方案由AI或研究者制定，不能把它误认为原库预置答案。", "FROM TOPIC TO EVIDENCE").id = "understanding-steps";
    const list = el("div", "understanding-steps");
    array(data.steps).forEach((step, index) => {
      const { node, body } = detail(`${String(index + 1).padStart(2, "0")} · ${text(step.title || step.id)}`, step.status);
      const pair = el("div", "understanding-pair"); pair.append(field("输入什么", step.input), field("谁负责", step.owner));
      const end = el("div", "understanding-pair"); end.append(field("留下什么", step.output), field("怎样检查", step.check));
      body.append(pair, field("具体怎么做", step.action, "understanding-action"), end);
      list.append(node);
    });
    parent.append(list);
  }
  function trialKind(source) {
    if (source.usedInTrial === true) return "tested";
    if (source.usedInTrial === false) return "planned";
    const state = text(source.trialStatus, "");
    if (/^(?:建议|未实测|未运行|本例未|本轮未|尚未)/.test(state)) return "planned";
    if (/(?:已实测|本例已|本轮已|已运行|实际调用)/.test(state)) return "tested";
    return "unknown";
  }
  function renderSources(parent, data) {
    heading(parent, "搜哪些源，怎样拿到和处理结果？", "文献索引、引用关系、毒性实验资料和方法指南承担不同工作。列在建议清单里，不代表本例已接通或已检索。", "SOURCES AND ACCESS").id = "understanding-sources";
    const controls = el("div", "understanding-source-controls");
    const group = el("div", "understanding-filter-group"); group.setAttribute("role", "group"); group.setAttribute("aria-label", "按实际使用状态筛选来源");
    const count = el("p", "understanding-source-count"); count.setAttribute("role", "status"); count.setAttribute("aria-live", "polite");
    const grid = el("div", "understanding-sources"); grid.id = "understanding-source-list";
    let selected = "all";
    const buttons = [["all", "全部来源"], ["tested", "本例用过"], ["api", "二轮API实测"], ["planned", "补充建议"]].map(([id, name]) => {
      const button = el("button", "understanding-filter", name); button.type = "button"; button.dataset.sourceFilter = id;
      button.setAttribute("aria-controls", grid.id); button.setAttribute("aria-pressed", String(selected === id));
      button.addEventListener("click", () => { selected = id; paint(); }); group.append(button); return button;
    });
    controls.append(group, count); parent.append(controls, grid);
    function paint() {
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.sourceFilter === selected)));
      grid.replaceChildren();
      const visible = array(data.sources).filter((source) => selected === "all" || (selected === "api" ? source.retrievalTrialTested === true : trialKind(source) === selected));
      count.textContent = `显示 ${visible.length} / ${array(data.sources).length} 项来源；用过的内容范围见各项状态。`;
      visible.forEach((source) => {
        const kind = trialKind(source), card = el("article", "understanding-source");
        const top = el("div", "understanding-source-top");
        top.append(el("span", "eyebrow", source.priority || source.id), badge(source.retrievalTrialTested === true ? "二轮API实测" : kind === "tested" ? "用过部分内容" : kind === "planned" ? "补充建议" : "状态待核对", kind === "tested" ? "understanding-badge-tested" : ""));
        card.append(top, el("h4", "", source.name), el("p", "understanding-source-role", source.role));
        if (source.trialStatus) card.append(el("p", "understanding-source-state", source.trialStatus));
        const { node, body } = detail("获取、处理与限制");
        body.append(field("怎样获取", source.acquisition), field("拿到后怎样处理", source.processing), field("使用边界", source.limitation));
        if (source.url) body.append(link("核对官方来源 ↗", source.url));
        card.append(node); grid.append(card);
      });
      if (!visible.length) grid.append(el("p", "understanding-empty", "此分组没有已记录来源。"));
    }
    paint();
  }
  function renderPipeline(parent, data) {
    heading(parent, "取回以后，也要能追溯回原始记录", "下载成功、筛选相关、原文支持和判断可靠，是分别需要检查的事情。", "PROCESS THE RECORDS");
    const list = el("ol", "understanding-pipeline");
    array(data.pipeline).forEach((item) => {
      const node = el("li"); node.append(el("h4", "", item.title), el("p", "", item.text)); list.append(node);
    });
    parent.append(list);
  }
  function ruleList(values) {
    const list = el("ul", "understanding-rule-list");
    array(values).forEach((item) => {
      const node = el("li");
      if (item && typeof item === "object" && item.title && item.text) node.append(el("strong", "", item.title), el("span", "", item.text));
      else node.textContent = text(item);
      list.append(node);
    });
    return list;
  }
  function renderChecks(parent, data) {
    heading(parent, "什么证据，才支持我们相信这套流程？", "来源数量和流程名称不能代替验证。尤其要区分：发现了一些遗漏，与证明没有遗漏。", "WHAT STILL NEEDS CHECKING");
    const pair = el("div", "understanding-checks");
    const checks = el("article", "understanding-check-block"); checks.append(el("h4", "", "应持续检查"), ruleList(data.validationRules));
    const limits = el("article", "understanding-check-block understanding-limits"); limits.append(el("h4", "", "目前能下多强的结论"), ruleList(data.limits));
    pair.append(checks, limits); parent.append(pair);
    const { node, body } = detail("依据、官方来源与可带走的总结", "原文链接");
    const references = el("ul", "understanding-references");
    array(data.references).forEach((item) => { const row = el("li"); row.append(link(item.label || item.title || item.url, item.url)); references.append(row); });
    body.append(references); parent.append(node);
    const downloads = el("div", "understanding-downloads");
    downloads.append(link("下载理解总结 MD ↓", "./data/understanding-summary.md", true), link("下载结构化总结 JSON ↓", "./data/understanding-summary.json", true), link("下载总览信息图 ↓", "./assets/understanding-map.png", true));
    parent.append(downloads);
  }
  function boot() {
    const root = document.getElementById("understanding-content"); if (!root) return;
    const data = window.RESEARCH_DATA?.understandingSummary;
    if (!data || typeof data !== "object") { root.append(el("p", "understanding-empty", "理解总结尚未载入；此处不预填研究结果。")); return; }
    root.classList.add("understanding-content");
    renderConclusions(root, data); renderPrinciple(root, data); renderSteps(root, data); renderSources(root, data); renderPipeline(root, data); renderChecks(root, data);
  }
  boot();
})();
