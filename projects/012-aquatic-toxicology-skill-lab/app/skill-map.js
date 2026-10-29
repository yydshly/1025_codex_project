"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const list = (value) => Array.isArray(value) ? value : [];
  const text = (value, fallback = "本项未记录") => {
    if (value === undefined || value === null || value === "") return fallback;
    if (Array.isArray(value)) return value.map((item) => text(item, "")).filter(Boolean).join("；");
    if (typeof value === "object") return text(value.name || value.title || value.description || value.text || value.label || value.id, fallback);
    return String(value);
  };
  function el(tag, className, value) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (value !== undefined) n.textContent = text(value, "");
    return n;
  }
  function field(label, value, className = "") {
    const n = el("div", `skill-map-field ${className}`.trim());
    n.append(el("h4", "", label));
    if (Array.isArray(value)) {
      const ul = el("ul");
      value.forEach((item) => ul.append(el("li", "", item)));
      n.append(ul);
    } else n.append(el("p", "", value));
    return n;
  }
  function sources(parent, values) {
    const links = el("div", "skill-map-sources");
    list(values).forEach((source) => {
      if (!source || typeof source.url !== "string") return;
      try {
        const url = new URL(source.url, document.baseURI);
        if (!["http:", "https:"].includes(url.protocol)) return;
        const a = el("a", "", text(source.label || source.name || source.title, "核对原始文件"));
        a.href = url.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        links.append(a);
      } catch (_) { /* Invalid links are not promoted to clickable URLs. */ }
    });
    if (links.childElementCount) parent.append(links);
  }
  function badge(value, className = "") { return el("span", `skill-map-badge ${className}`.trim(), value); }
  function heading(parent, title, description) {
    const h = el("div", "skill-map-panel-heading");
    h.append(el("h3", "", title));
    if (description) h.append(el("p", "", description));
    parent.append(h);
  }
  function detail(title, status, index) {
    const d = el("details", "skill-map-detail");
    const summary = el("summary");
    const name = el("span", "skill-map-detail-title");
    if (index !== undefined) name.append(el("span", "skill-map-index", String(index + 1).padStart(2, "0")));
    name.append(el("span", "", title));
    summary.append(name);
    if (status) summary.append(badge(status));
    summary.append(el("span", "skill-map-expand", "+"));
    d.append(summary);
    const body = el("div", "skill-map-detail-body");
    d.append(body);
    return { d, body };
  }
  function renderCatalog(parent, data) {
    const catalog = data.catalog || {};
    heading(parent, "包含哪些Skill？", catalog.note);
    const count = el("p", "skill-map-count");
    count.textContent = `固定版本顶层技能 ${text(catalog.total, "未计数")} 项 · 本轮安装 ${text(catalog.installed, "未记录")} 项`;
    parent.append(count);
    const grid = el("div", "skill-map-catalog");
    list(catalog.items).forEach((item) => {
      const { d, body } = detail(item.name || item.id || item.title, item.installed === true ? "本轮已安装" : item.installed === false ? "本轮未安装" : "安装状态待核对");
      body.append(field("负责什么", item.description), field("本次如何使用", item.usage));
      sources(body, [item.source]);
      grid.append(d);
    });
    parent.append(grid);
  }
  function renderSteps(parent, data) {
    heading(parent, "给它一个主题，搜索怎样发生？", "沿着输入、规则、执行和产物，核对AI在每一步做了什么。展开查看本次例子。 ");
    list(data.searchSteps).forEach((step, i) => {
      const { d, body } = detail(step.title || step.name || step.id, "步骤与实例", i);
      if (i === 0) d.open = true;
      const pair = el("div", "skill-map-pair");
      pair.append(field("输入", step.input), field("原始规则", step.rule));
      body.append(pair, field("实际动作", step.action), field("本次例子", step.example, "skill-map-example"));
      const output = el("div", "skill-map-pair");
      output.append(field("留下什么", step.output), field("仍受什么限制", step.limitation));
      body.append(output);
      sources(body, step.sources);
      parent.append(d);
    });
  }
  function renderSources(parent, data) {
    heading(parent, "搜索的源有哪些？", "逐项区分规范列举的来源、程序能访问的接口，以及本次真正发生的调用。列出一个数据库名称不代表已经搜索了它。 ");
    const cards = el("div", "skill-map-source-grid");
    list(data.sources).forEach((source) => {
      const card = el("article", "skill-map-source");
      const top = el("div", "skill-map-card-top");
      top.append(el("span", "eyebrow", source.category), badge(source.status, "skill-map-status"));
      card.append(top, el("h3", "", source.name || source.title), field("能提供什么", source.capability), field("怎样访问", source.access), field("本次实际情况", source.actual, "skill-map-actual"));
      sources(card, [source.source]);
      cards.append(card);
    });
    parent.append(cards);
  }
  function renderChecks(parent, data) {
    heading(parent, "如何发现遗漏和误读？", "检查机制需要实际执行并留下结果。下面分别列出风险、上游约束、本轮状态和后续验证动作。 ");
    list(data.checks).forEach((check, i) => {
      const { d, body } = detail(check.title || check.name, check.verdict || "状态待核对", i);
      if (i === 0) d.open = true;
      body.append(field("要发现的风险", check.risk));
      const pair = el("div", "skill-map-pair");
      pair.append(field("上游如何规定", check.upstream), field("本轮实际做到", check.actual, "skill-map-actual"));
      body.append(pair, field("下一步怎样验证", check.next));
      sources(body, check.sources);
      parent.append(d);
    });
  }
  function renderScenarios(parent, data) {
    heading(parent, "真实场景怎样选择和使用？", "已执行的水生毒理案例与其他场景的用法示例分别标记。路由说明不代表这些工作都已经运行。 ");
    list(data.scenarios).forEach((scenario, i) => {
      const { d, body } = detail(scenario.title || scenario.name, scenario.status || "用法示例", i);
      if (i === 0) d.open = true;
      body.append(field("研究者给什么", scenario.input));
      const route = el("div", "skill-map-field");
      route.append(el("h4", "", "调用路径"));
      const path = el("div", "skill-map-route");
      list(scenario.route).forEach((item, routeIndex) => {
        if (routeIndex) path.append(el("span", "skill-map-route-arrow", "→"));
        path.append(el("span", "skill-map-route-step", item));
      });
      route.append(path);
      body.append(route, field("会做哪些动作", scenario.actions));
      const pair = el("div", "skill-map-pair");
      pair.append(field("交付什么", scenario.deliverable), field("需要保留的边界", scenario.boundary));
      body.append(pair);
      parent.append(d);
    });
  }
  function boot() {
    const panel = $("skill-map-panel");
    if (!panel) return;
    const data = window.RESEARCH_DATA && window.RESEARCH_DATA.skillBreakdown;
    if (!data || typeof data !== "object") {
      panel.append(el("p", "empty-copy", "拆解数据尚未载入。可先阅读下方真实执行记录，或重新载入页面。"));
      return;
    }
    $("skill-map-intro").textContent = text(data.intro, "");
    $("skill-map-verdict").textContent = text(data.verdict, "");
    $("skill-map-takeaway").textContent = text(data.takeaway, "");
    list(data.layers).forEach((layer, i) => {
      const card = el("article", "skill-map-layer");
      card.append(el("span", "skill-map-layer-index", String(i + 1).padStart(2, "0")), el("h3", "", layer.name || layer.title), el("p", "", layer.description), el("p", "skill-map-layer-actual", layer.actual));
      $("skill-map-layers").append(card);
    });
    const tabs = [
      { label: "技能清单", render: renderCatalog },
      { label: "搜索步骤", render: renderSteps },
      { label: "来源与工具", render: renderSources },
      { label: "遗漏与误读", render: renderChecks },
      { label: "场景应用", render: renderScenarios }
    ];
    const buttons = tabs.map((tab, i) => {
      const button = el("button", "skill-map-tab");
      button.type = "button";
      button.id = `skill-map-tab-${i}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "skill-map-panel");
      button.append(el("span", "skill-map-tab-number", String(i + 1).padStart(2, "0")), el("span", "", tab.label));
      $("skill-map-tabs").append(button);
      button.addEventListener("click", () => select(i));
      button.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          select(next);
          buttons[next].focus();
        }
      });
      return button;
    });
    function select(index) {
      buttons.forEach((button, i) => {
        button.setAttribute("aria-selected", String(i === index));
        button.tabIndex = i === index ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", buttons[index].id);
      panel.replaceChildren();
      tabs[index].render(panel, data);
    }
    select(0);
  }
  boot();
})();
