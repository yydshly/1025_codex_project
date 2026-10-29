"use strict";

(() => {
  const roleLabels = { core: "核心证据", context: "背景文献", method: "研究方法" };
  const scopeLabels = { full_text: "全文阅读", sections: "部分章节", abstract: "摘要阅读", metadata: "题录核验" };
  const scopeLevels = { full_text: 4, sections: 3, abstract: 2, metadata: 1 };
  const state = { data: null, papers: [], paperMap: new Map(), filter: "all", search: "", reading: "all", direction: 0 };
  const $ = (id) => document.getElementById(id);
  const arr = (value) => Array.isArray(value) ? value : [];
  const has = (value) => value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);
  const txt = (value, fallback = "未记录") => {
    if (!has(value)) return fallback;
    if (Array.isArray(value)) return value.map((item) => txt(item, "")).filter(Boolean).join("；");
    if (typeof value === "object") {
      const preferred = value.text || value.name || value.label || value.title || value.description;
      if (has(preferred)) return txt(preferred, fallback);
      return Object.entries(value).map(([key, item]) => `${key}：${txt(item, "—")}`).join("；") || fallback;
    }
    return String(value);
  };
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = txt(text, "");
    return element;
  }
  function setText(id, value, fallback = "") { $(id).textContent = txt(value, fallback); }
  function empty(parent, text = "本次记录未提供这一项。") { parent.append(node("p", "empty-copy", text)); }
  function safeURL(value, source = false) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      if (["https:", "http:"].includes(url.protocol)) return url.href;
      if (!source && url.protocol === "file:" && location.protocol === "file:") return url.href;
    } catch (_) { /* Invalid source values remain plain text. */ }
    return null;
  }
  function link(label, urlValue, { source = false, download = false, className = "" } = {}) {
    const url = safeURL(urlValue, source);
    if (!url) return node("span", className, label);
    const anchor = node("a", className, label);
    anchor.href = url;
    if (download) {
      const resolved = new URL(url);
      if (resolved.origin === location.origin) anchor.download = "";
      else { anchor.target = "_blank"; anchor.rel = "noopener noreferrer"; }
    } else if (source || new URL(url).origin !== location.origin) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    return anchor;
  }
  function content(parent, value, { className = "", fallback = "未记录", list = true } = {}) {
    if (!has(value)) { parent.append(node("p", className || "empty-copy", fallback)); return; }
    if (Array.isArray(value) && list) {
      const ul = node("ul", className);
      value.forEach((item) => ul.append(node("li", "", txt(item))));
      parent.append(ul);
    } else parent.append(node("p", className, txt(value)));
  }
  function field(label, value, className = "") {
    const block = node("div", `scope-item ${className}`.trim());
    block.append(node("span", "definition-label", label));
    content(block, value);
    return block;
  }
  function tag(label, className = "") { return node("span", `tag ${className}`.trim(), label); }
  function evidenceButton(ids, title, extras = {}) {
    const known = arr(ids);
    const button = node("button", "evidence-button", `查看依据 ${known.length} ↗`);
    button.type = "button";
    button.setAttribute("aria-label", `查看“${title}”的 ${known.length} 条文献依据`);
    button.addEventListener("click", () => showEvidence(title, known, extras));
    return button;
  }
  function sourceCitation(paper) {
    return [txt(paper.authors, ""), txt(paper.year, "")].filter(Boolean).join(" · ");
  }
  function normalizeData(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("研究数据格式无效，应为一个 JSON 对象。");
    return {
      ...raw,
      meta: raw.meta || {}, scope: raw.scope || {}, summary: raw.summary || {},
      papers: arr(raw.papers), workflow: arr(raw.workflow), claims: arr(raw.claims),
      directions: arr(raw.directions), review: raw.review || {}, search: raw.search || {}, artifacts: arr(raw.artifacts)
    };
  }

  function renderHeader(data) {
    setText("report-title", data.meta.title, "水生毒理学研究手记");
    document.title = `${txt(data.meta.title, "水生毒理学研究手记")} · 研究记录`;
    setText("report-subtitle", data.meta.subtitle);
    setText("report-date", data.meta.date, "研究日期未记录");
    setText("report-mode", data.meta.mode);
    const meta = $("report-meta");
    meta.replaceChildren();
    if (has(data.meta.skillVersion)) {
      const item = node("span"); item.append(node("span", "", "技能版本"), node("strong", "", data.meta.skillVersion)); meta.append(item);
    }
    if (has(data.meta.upstreamCommit)) {
      const commit = txt(data.meta.upstreamCommit);
      const item = node("span");
      item.append(node("span", "", "上游版本"));
      if (/^[a-f\d]{7,40}$/i.test(commit)) item.append(link(commit.slice(0, 10), `https://github.com/Imbad0202/academic-research-skills/commit/${commit}`, { source: true }));
      else item.append(node("strong", "", commit));
      meta.append(item);
    }
    if (has(data.scope.reviewType)) { const item = node("span"); item.append(node("span", "", "研究类型"), node("strong", "", data.scope.reviewType)); meta.append(item); }
    if (!meta.children.length) meta.append(node("span", "", "版本信息未记录"));
    const stats = [
      [data.workflow.length, "实际执行步骤", "ACTIONS"],
      [data.search.counts?.["正式查询"] ?? "—", "正式网页查询", "SEARCH LOG"],
      [data.papers.filter((paper) => paper.role !== "method").length, "尝试书目核验", "LIVE LOOKUPS"],
      [data.review.findings?.filter((item) => item.status === "resolved_verified").length ?? 0, "修改后定点复查", "REVISIONS"]
    ];
    $("stats-strip").replaceChildren(...stats.map(([value, label, english]) => {
      const block = node("div", "stat");
      const copy = node("span", "stat-text", label); copy.append(node("small", "", english));
      block.append(node("span", "stat-value", value), copy);
      return block;
    }));
  }

  function renderSummary(data) {
    setText("summary-lead", data.summary.lead, "本次研究尚未提供阶段性结论。请先查看纳入文献与实际执行记录。");
    const findings = $("findings-list"); findings.replaceChildren();
    arr(data.summary.findings).forEach((finding, index) => {
      const item = node("article", "finding");
      const copy = node("div");
      copy.append(node("h3", "", finding.title || finding.id || `研究判断 ${index + 1}`));
      content(copy, finding.text);
      if (has(finding.strength)) copy.append(node("span", "strength", `证据强度 · ${txt(finding.strength)}`));
      item.append(node("span", "finding-number", String(index + 1).padStart(2, "0")), copy, evidenceButton(finding.evidenceIds, txt(finding.title, `研究判断 ${index + 1}`), { text: finding.text, strength: finding.strength }));
      findings.append(item);
    });
    if (!findings.children.length) empty(findings, "本次记录未提供独立的阶段性判断。");
    const scope = data.scope;
    const target = $("scope-content"); target.replaceChildren();
    const fields = [
      ["研究问题 / QUESTION", scope.question, "scope-question"],
      ["研究对象 / POPULATION", scope.population], ["暴露因素 / EXPOSURE", scope.exposure],
      ["比较条件 / COMPARISON", scope.comparison], ["结局指标 / OUTCOMES", scope.outcomes],
      ["时间范围 / TIME RANGE", scope.timeRange], ["综述性质 / REVIEW TYPE", scope.reviewType]
    ];
    fields.forEach(([label, value, className]) => target.append(field(label, value, className)));
    if (arr(scope.assumptions).length) target.append(field("研究假设与工作前提 / ASSUMPTIONS", scope.assumptions, "wide"));
  }

  function readingCell(scope) {
    const cell = node("td");
    cell.append(node("span", "scope-name", scopeLabels[scope] || txt(scope, "未记录")));
    const indicator = node("span", "scope-indicator");
    const level = scopeLevels[scope] || 0;
    indicator.dataset.level = String(level);
    indicator.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 4; i += 1) indicator.append(node("i", i < level ? "filled" : ""));
    cell.append(indicator);
    return cell;
  }
  function paperRow(paper) {
    const row = node("tr");
    const titleCell = node("td");
    if (has(paper.id)) titleCell.append(node("span", "paper-id", paper.id));
    const title = node("button", "paper-title", paper.title || "标题未记录"); title.type = "button";
    title.addEventListener("click", () => showPaper(paper));
    titleCell.append(title, node("p", "paper-citation", sourceCitation(paper) || "作者与年份未记录"));
    const organism = node("td", "", paper.organism || "研究对象未记录");
    if (has(paper.stage)) organism.append(node("span", "paper-exposure", paper.stage));
    if (has(paper.exposure)) organism.append(node("span", "paper-exposure", paper.exposure));
    const role = node("td"); role.append(tag(roleLabels[paper.role] || txt(paper.role, "未分类"), `tag-${["core", "context", "method"].includes(paper.role) ? paper.role : "context"}`));
    const arrow = node("td"); arrow.append(node("span", "row-arrow", "↗"));
    row.append(titleCell, organism, role, readingCell(paper.readScope), arrow);
    return row;
  }
  function filterPapers() {
    const query = state.search.trim().toLocaleLowerCase();
    const filtered = state.papers.filter((paper) => {
      if (state.filter !== "all" && paper.role !== state.filter) return false;
      if (state.reading !== "all" && paper.readScope !== state.reading) return false;
      if (!query) return true;
      const haystack = [paper.id, paper.title, paper.authors, paper.year, paper.doi, paper.organism, paper.stage, paper.exposure, paper.endpoints, paper.keywords].map((value) => txt(value, "")).join(" ").toLocaleLowerCase();
      return haystack.includes(query);
    });
    $("papers-body").replaceChildren(...filtered.map(paperRow));
    $("no-results").hidden = filtered.length > 0;
    setText("filter-result-count", `显示 ${filtered.length} / ${state.papers.length} 篇文献`);
    document.querySelectorAll("[data-role-filter]").forEach((button) => {
      const active = button.dataset.roleFilter === state.filter;
      button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active));
    });
  }
  function renderClaims(data) {
    const target = $("claims-list"); target.replaceChildren();
    data.claims.forEach((claim, index) => {
      const item = node("article", "claim");
      const copy = node("div"); copy.append(node("p", "", claim.text || "判断内容未记录"));
      const meta = node("div", "claim-meta");
      if (has(claim.status)) meta.append(node("span", "", claim.status));
      if (has(claim.strength)) meta.append(node("span", "", `证据强度 · ${txt(claim.strength)}`));
      copy.append(meta);
      item.append(node("span", "claim-id", claim.id || `C${index + 1}`), copy, evidenceButton(claim.evidenceIds, txt(claim.id, `判断 ${index + 1}`), claim));
      target.append(item);
    });
    if (!target.children.length) empty(target, "本次记录未提供独立的判断与证据映射。");
  }
  function renderSearch(data) {
    const target = $("search-record"); target.replaceChildren();
    if (data.search.counts && typeof data.search.counts === "object") {
      const labels = { found: "检索命中", retrieved: "获取记录", screened: "筛查记录", included: "纳入文献", excluded: "排除记录", deduplicated: "去重后", unique: "去重后", fullText: "全文获取", full_text: "全文获取", core: "核心证据", context: "背景文献", method: "方法文献" };
      const counts = node("div", "search-counts");
      Object.entries(data.search.counts).forEach(([key, value]) => counts.append(node("span", "", `${labels[key] || key}：${txt(value)}`)));
      if (counts.children.length) target.append(counts);
    }
    const queries = arr(data.search.queries);
    if (queries.length) {
      const list = node("ol", "query-list");
      queries.forEach((query, index) => {
        const item = node("li"); const meta = node("div", "query-meta");
        meta.append(node("span", "", query.id || `Q${index + 1}`));
        if (has(query.source)) meta.append(node("span", "", query.source));
        if (has(query.date)) meta.append(node("span", "", query.date));
        item.append(meta, node("p", "query-text", query.q || "检索式未记录"));
        if (has(query.notes)) item.append(node("p", "query-note", query.notes));
        list.append(item);
      });
      target.append(list);
    } else empty(target, "未提供逐条检索式。");
    const exclusions = arr(data.search.exclusions);
    if (exclusions.length) {
      target.append(node("h4", "exclusions-title", "排除记录"));
      exclusions.forEach((record) => { const item = node("div", "exclusion", record.title || "题名未记录"); item.append(node("p", "", record.reason || "排除原因未记录")); target.append(item); });
    }
  }

  function artifactReferences(parent, value) {
    const files = Array.isArray(value) ? value : has(value) ? [value] : [];
    files.forEach((file) => {
      const item = node("div", "file-ref");
      if (file && typeof file === "object") {
        const filePath = file.url || file.path || file.file;
        item.append(node("span", "", "↳"), link(txt(file.title || file.name || filePath), filePath));
      } else {
        const match = state.data.artifacts.find((artifact) => artifact.url === file || artifact.title === file);
        item.append(node("span", "", "↳"));
        if (match) item.append(link(txt(file), match.url));
        else item.append(node("span", "", file));
      }
      parent.append(item);
    });
  }
  function renderWorkflow(data) {
    const note = $("execution-note");
    note.textContent = txt(data.meta.executionNote, "本节仅展示研究记录中列明的实际执行步骤。");
    const target = $("workflow-list"); target.replaceChildren();
    data.workflow.forEach((step, index) => {
      const details = node("details", "workflow-step"); if (index === 0) details.open = true;
      const summary = node("summary"); const heading = node("div", "step-heading");
      heading.append(node("h3", "", step.title || `步骤 ${index + 1}`));
      if (has(step.role)) heading.append(node("small", "", step.role));
      const sign = node("span", "details-sign", "＋"); sign.setAttribute("aria-hidden", "true");
      summary.append(node("span", "step-number", String(index + 1).padStart(2, "0")), heading, node("span", "step-status", step.status || "状态未记录"), sign);
      const body = node("div", "step-body");
      const input = node("div"); input.append(node("h4", "", "输入 / INPUT")); content(input, step.input);
      const actions = node("div"); actions.append(node("h4", "", "实际动作 / ACTIONS"));
      if (arr(step.actions).length) { const list = node("ol"); step.actions.forEach((action) => list.append(node("li", "", action))); actions.append(list); }
      else content(actions, step.actions);
      const output = node("div", "step-output"); output.append(node("h4", "", "产出 / OUTPUT")); content(output, step.output);
      body.append(input, actions, output);
      if (has(step.artifact)) { const files = node("div", "step-files"); files.append(node("h4", "", "留下的文件 / FILES")); artifactReferences(files, step.artifact); body.append(files); }
      details.append(summary, body); target.append(details);
    });
    if (!target.children.length) empty(target, "本次记录未提供技能执行步骤，不能据此声称技能已完成研究。");
  }

  function processBlock(label, value, className = "") {
    const block = node("div", `process-block ${className}`.trim());
    block.append(node("h4", "", label)); content(block, value); return block;
  }
  function renderWalkthrough(data) {
    const guide = data.walkthrough || {};
    if (has(guide.purpose) && !window.ROUND2_DATA) setText("task-purpose", guide.purpose);
    if (has(guide.currentStage) && !window.ROUND2_DATA) setText("task-stage", guide.currentStage);
    const steps = arr(guide.steps);
    const tabs = $("walkthrough-steps"); tabs.replaceChildren();
    const panel = $("walkthrough-content"); panel.replaceChildren();
    let selected = 0;
    function drawStep(index, focus = false) {
      selected = index; const step = steps[index]; if (!step) return;
      [...tabs.children].forEach((button, i) => { button.setAttribute("aria-selected", String(i === index)); button.tabIndex = i === index ? 0 : -1; });
      panel.setAttribute("aria-labelledby", `walkthrough-tab-${index}`);
      panel.replaceChildren();
      const heading = node("div", "walkthrough-panel-heading");
      heading.append(node("span", "eyebrow", `STEP ${String(index + 1).padStart(2,"0")} · ${txt(step.actor,"执行分工见记录")}`), node("h3", "", step.question || step.title));
      panel.append(heading);
      const intake = node("div", "process-intake");
      intake.append(processBlock("这一轮拿到什么输入", step.input), processBlock("给执行角色的任务", step.assignment));
      panel.append(intake, node("p", "assignment-note", step.assignmentKind || "任务摘要；不冒充逐字提示词记录。"));
      const rule = step.rule || {};
      const ruleBox = processBlock(txt(rule.file,"").startsWith("research/") ? "本轮补充的执行约定" : "采用的原始 Skill 规则（摘要）", rule.text, "process-rule");
      if (has(rule.file)) ruleBox.append(link(txt(rule.file), rule.url, {source:true,className:"rule-source"}));
      if (has(rule.section)) ruleBox.append(node("span", "rule-section", rule.section));
      panel.append(ruleBox, processBlock("实际做了哪些动作", arr(step.actions)));
      const example = step.example || {};
      if (has(example.before) || has(example.after)) {
        const sample = node("section", "process-example");
        sample.append(node("span", "mini-label", example.label || "这一轮的真实例子"));
        const flow = node("div", "process-example-flow");
        flow.append(processBlock("输入 / 起点", example.before), processBlock("具体动作", example.action), processBlock("实际得到", example.after));
        sample.append(flow);
        if (arr(example.evidenceIds).length) sample.append(evidenceButton(example.evidenceIds, `${step.title}：实际例子`, {text:example.after}));
        panel.append(sample);
      }
      const decision = node("div", "process-decision");
      decision.append(processBlock("这一步怎样影响后续", step.decision), processBlock("留下什么产物", step.output));
      panel.append(decision);
      const files = node("div", "process-files"); artifactReferences(files, step.artifacts); panel.append(files);
      panel.append(processBlock("遇到的问题 / 采取的处理", step.friction, "process-friction"), processBlock("我们从这一步学到什么", step.learning, "process-learning"));
      const controls = node("div", "walkthrough-controls");
      if (index > 0) { const prev = node("button", "text-link", "← 上一步"); prev.type="button"; prev.addEventListener("click",()=>drawStep(index-1,true)); controls.append(prev); }
      if (index < steps.length-1) { const next = node("button", "text-link", `下一步：${steps[index+1].title} →`); next.type="button"; next.addEventListener("click",()=>drawStep(index+1,true)); controls.append(next); }
      panel.append(controls); if (focus) tabs.children[index]?.focus();
    }
    steps.forEach((step,index)=>{
      const button=node("button","walkthrough-tab"); button.type="button"; button.id=`walkthrough-tab-${index}`; button.setAttribute("role","tab"); button.setAttribute("aria-controls","walkthrough-content");
      button.append(node("span","walkthrough-tab-number",String(index+1).padStart(2,"0")),node("span","",step.title));
      button.addEventListener("click",()=>drawStep(index));
      button.addEventListener("keydown",event=>{ let next=selected; if(event.key==="ArrowDown"||event.key==="ArrowRight") next=(selected+1)%steps.length; else if(event.key==="ArrowUp"||event.key==="ArrowLeft") next=(selected-1+steps.length)%steps.length; else if(event.key==="Home") next=0; else if(event.key==="End") next=steps.length-1; else return; event.preventDefault(); drawStep(next,true); });
      tabs.append(button);
    });
    if (steps.length) drawStep(0); else empty(panel,"正在整理过程说明；可先核对下方原始阶段记录。");
    const ownership=$("ownership-list"); ownership.replaceChildren();
    arr(guide.ownership).forEach(item=>{ const row=node("article","ownership-row"); row.append(node("h4","",item.owner),node("p","",item.contribution),node("p","ownership-boundary",item.boundary)); ownership.append(row); });
    const turns=$("turning-list"); turns.replaceChildren();
    arr(guide.decisions).forEach((item,index)=>{ const turn=node("article","turning-point"); turn.append(node("span","eyebrow",`TURN ${String(index+1).padStart(2,"0")}`),node("h3","",item.title));
      const flow=node("div","turning-flow"); flow.append(processBlock("当时要检查的起点",item.startingPoint),processBlock("证据带来的修改",item.change),processBlock("因此下一步改变了什么",item.consequence)); turn.append(flow);
      if(arr(item.evidenceIds).length) turn.append(evidenceButton(item.evidenceIds,item.title,{text:item.change}));
      if(has(item.provenance)) turn.append(node("p","assignment-note",item.provenance)); turns.append(turn);
    });
  }

  function renderDirections(data) {
    const tabs = $("directions-tabs"); tabs.replaceChildren();
    const comparison = $("comparison-body"); comparison.replaceChildren();
    $("direction-comparison").hidden = data.directions.length < 2;
    if (!data.directions.length) {
      tabs.hidden = true; $("direction-content").replaceChildren(); empty($("direction-content"), "本次记录尚未形成候选研究方向。"); return;
    }
    tabs.hidden = false;
    data.directions.forEach((direction, index) => {
      const row = node("tr");
      const titleCell = node("td");
      const titleButton = node("button", "comparison-title", direction.title || `候选方向 ${index + 1}`); titleButton.type = "button";
      titleButton.addEventListener("click", () => { selectDirection(index); $("direction-comparison").open = false; $(`direction-tab-${index}`).focus(); });
      titleCell.append(titleButton);
      row.append(titleCell, node("td", "", txt(direction.priority)), node("td", "", txt(direction.increment)), node("td", "", txt(direction.noveltyStatus)));
      comparison.append(row);
      const button = node("button", "direction-tab"); button.type = "button";
      button.id = `direction-tab-${index}`; button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "direction-content");
      button.append(node("span", "tab-number", `DIRECTION ${String(index + 1).padStart(2, "0")}`), node("span", "tab-title", direction.title || `候选方向 ${index + 1}`));
      button.addEventListener("click", () => selectDirection(index));
      button.addEventListener("keydown", (event) => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % data.directions.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + data.directions.length) % data.directions.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = data.directions.length - 1;
        else return;
        event.preventDefault(); selectDirection(next); $(`direction-tab-${next}`).focus();
      });
      tabs.append(button);
    });
    selectDirection(0);
  }
  function selectDirection(index) {
    const direction = state.data.directions[index]; if (!direction) return;
    state.direction = index;
    document.querySelectorAll(".direction-tab").forEach((button, i) => {
      button.setAttribute("aria-selected", String(i === index)); button.tabIndex = i === index ? 0 : -1;
    });
    const target = $("direction-content"); target.replaceChildren(); target.setAttribute("aria-labelledby", `direction-tab-${index}`);
    const meta = node("div", "direction-topline");
    if (has(direction.priority)) meta.append(tag(`优先级 · ${txt(direction.priority)}`, "tag-core"));
    if (has(direction.noveltyStatus)) meta.append(node("span", "", `新颖性 · ${txt(direction.noveltyStatus)}`));
    target.append(meta, node("h3", "direction-question", direction.question || direction.title || "研究问题未记录"));
    if (has(direction.why)) target.append(node("p", "direction-why", direction.why));
    const details = node("div", "direction-detail");
    const increment = node("div"); increment.append(node("h4", "", "与已有工作相比，增加什么")); content(increment, direction.increment);
    const design = node("div"); design.append(node("h4", "", "可执行的研究设计")); content(design, direction.design);
    details.append(increment, design);
    if (arr(direction.priorWorkIds).length) {
      const prior = node("div", "full-width"); prior.append(node("h4", "", "所依据的已有研究"));
      const links = node("div", "prior-papers");
      direction.priorWorkIds.forEach((id) => {
        const paper = state.paperMap.get(String(id));
        const button = node("button", "evidence-button", `${txt(id)} ↗`); button.type = "button";
        button.title = paper ? txt(paper.title) : "此编号未找到对应的文献记录";
        button.addEventListener("click", () => paper ? showPaper(paper) : showEvidence("对应研究", [id]));
        links.append(button);
      });
      prior.append(links); details.append(prior);
    }
    const risks = node("div", "full-width"); risks.append(node("h4", "", "需要先解决的设计风险")); content(risks, direction.risks);
    details.append(risks); target.append(details);
  }

  function renderBoundaries(data) {
    const limits = $("limits-content"); limits.replaceChildren();
    const allLimits = [...arr(data.scope.limits), ...arr(data.review.executionLimits)];
    const unique = [...new Map(allLimits.map((item) => [txt(item), item])).values()];
    if (unique.length) content(limits, unique, { className: "limit-list" });
    else empty(limits, "未提供限制说明；这不代表本次研究没有限制。");
    const review = $("review-content"); review.replaceChildren();
    arr(data.review.findings).forEach((finding) => {
      const block = node("article", "review-item"); const meta = node("div", "review-meta");
      if (has(finding.severity)) meta.append(node("span", "", finding.severity));
      if (has(finding.status)) meta.append(node("span", "", finding.status));
      block.append(meta, node("h4", "", finding.issue || "复核项未命名"));
      if (has(finding.action)) content(block, finding.action);
      review.append(block);
    });
    if (!review.children.length) empty(review, "本次记录未提供独立的复核条目。");
    const artifacts = $("artifacts-list"); artifacts.replaceChildren();
    const items = [...data.artifacts];
    if (!items.some((item) => /(?:^|\/)research\.json(?:[?#]|$)/i.test(txt(item.url, "")))) items.unshift({ title: "结构化研究数据", url: "./data/research.json", kind: "JSON" });
    items.forEach((artifact) => {
      const url = safeURL(artifact.url); if (!url) return;
      const anchor = link("", url, { download: true, className: "artifact-link" });
      const extension = (new URL(url).pathname.match(/\.([a-z\d]{1,6})$/i) || [])[1];
      anchor.append(node("span", "artifact-kind", txt(artifact.kind, extension || "FILE").toUpperCase()), node("span", "artifact-name", artifact.title || "研究文件"), node("span", "artifact-arrow", "↓"));
      artifacts.append(anchor);
    });
    if (!artifacts.children.length) empty(artifacts, "未提供可下载的研究文件。");
  }

  let lastFocus = null;
  function openDialog(title, eyebrow = "RESEARCH DETAIL") {
    const dialog = $("detail-dialog");
    setText("dialog-title", title); setText("dialog-eyebrow", eyebrow);
    const body = $("dialog-body"); body.replaceChildren();
    if (!dialog.open) { lastFocus = document.activeElement; dialog.showModal(); document.body.style.overflow = "hidden"; }
    dialog.scrollTop = 0;
    return body;
  }
  function closeDialog() {
    const dialog = $("detail-dialog"); if (dialog.open) dialog.close();
  }
  function detailSection(title, value, fallback) {
    const section = node("section", "detail-section"); section.append(node("h3", "", title));
    content(section, value, { fallback: fallback || "未记录" }); return section;
  }
  function showEvidence(title, ids, extras = {}) {
    const body = openDialog(title, "CLAIM ↔ EVIDENCE");
    if (has(extras.text)) body.append(node("p", "", extras.text));
    const tags = node("div", "dialog-tags");
    if (has(extras.status)) tags.append(tag(extras.status));
    if (has(extras.strength)) tags.append(tag(`证据强度 · ${txt(extras.strength)}`));
    if (tags.children.length) body.append(tags);
    if (has(extras.reason)) body.append(detailSection("判断依据与边界", extras.reason));
    const section = node("section", "detail-section"); section.append(node("h3", "", `关联文献 / ${ids.length}`));
    if (!ids.length) empty(section, "此条判断未提供文献编号，不能从当前记录追溯到具体文献。");
    else {
      const list = node("ul", "dialog-evidence-list");
      ids.forEach((id) => {
        const paper = state.paperMap.get(String(id)); const item = node("li");
        if (!paper) item.append(node("p", "missing-evidence", `${txt(id)} · 对应文献未在本次记录中找到。`));
        else {
          const button = node("button", "", `${txt(paper.id)} — ${txt(paper.title, "标题未记录")} ↗`); button.type = "button";
          button.addEventListener("click", () => showPaper(paper, () => showEvidence(title, ids, extras)));
          item.append(button, node("small", "", `${sourceCitation(paper)} · ${scopeLabels[paper.readScope] || "阅读范围未记录"}`));
          if (has(paper.findings)) item.append(node("small", "", paper.findings));
        }
        list.append(item);
      });
      section.append(list);
    }
    body.append(section);
  }
  function showPaper(paper, returnTo) {
    const body = openDialog(paper.title || "标题未记录", `LITERATURE RECORD / ${txt(paper.id, "—")}`);
    if (returnTo) {
      const back = node("button", "text-link", "← 返回判断依据"); back.type = "button"; back.addEventListener("click", returnTo); back.style.marginBottom = "18px"; body.append(back);
    }
    body.append(node("p", "detail-citation", sourceCitation(paper) || "作者和年份未记录"));
    const tags = node("div", "dialog-tags");
    tags.append(tag(roleLabels[paper.role] || txt(paper.role, "角色未记录"), `tag-${paper.role || "context"}`), tag(scopeLabels[paper.readScope] || "阅读范围未记录"));
    if (has(paper.status)) tags.append(tag(paper.status));
    body.append(tags);
    const fields = [
      ["研究对象", paper.organism], ["发育阶段", paper.stage], ["暴露因素", paper.exposure],
      ["暴露时长", paper.duration], ["结局指标", paper.endpoints], ["核验记录", paper.verification]
    ];
    const grid = node("dl", "detail-grid");
    fields.forEach(([label, value]) => { const item = node("div"); item.append(node("dt", "", label), node("dd", "", txt(value))); grid.append(item); });
    body.append(grid, detailSection("论文中的发现 / FINDINGS", paper.findings), detailSection("局限与外推边界 / LIMITATIONS", paper.limitations), detailSection("本次阅读定位 / READING LOCATOR", paper.locator, "未记录页码、章节或摘录定位。"));
    if (arr(paper.keywords).length) body.append(detailSection("关键词 / KEYWORDS", paper.keywords.join(" · ")));
    const links = node("div", "source-links");
    const sourceURL = safeURL(paper.url, true);
    if (sourceURL) links.append(link("打开原始来源 ↗", sourceURL, { source: true }));
    const doi = txt(paper.doi, "").replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
    if (/^10\.\d{4,9}\/\S+$/i.test(doi)) links.append(link(`DOI: ${doi} ↗`, `https://doi.org/${encodeURI(doi)}`, { source: true }));
    if (!links.children.length) links.append(node("p", "empty-copy", "未提供可访问的原始来源链接。"));
    body.append(links);
  }

  function observeSections() {
    if (!("IntersectionObserver" in window)) return;
    const links = [...document.querySelectorAll(".section-nav a")];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((item) => {
          const active = item.hash === `#${entry.target.id}`;
          item.classList.toggle("active", active);
          if (active) item.setAttribute("aria-current", "location"); else item.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
    document.querySelectorAll("main .section[id]").forEach((section) => observer.observe(section));
  }
  async function load() {
    $("loading-state").hidden = false; $("error-state").hidden = true; $("app-root").hidden = true;
    try {
      let raw;
      if (location.protocol === "file:" && window.RESEARCH_DATA) {
        raw = window.RESEARCH_DATA;
      } else {
        const response = await fetch("./data/research.json", { cache: "no-cache" });
        if (!response.ok) throw new Error(`数据请求返回 HTTP ${response.status}。`);
        raw = await response.json();
      }
      const data = normalizeData(raw);
      state.data = data; state.papers = data.papers;
      state.paperMap = new Map(data.papers.filter((paper) => has(paper.id)).map((paper) => [String(paper.id), paper]));
      renderHeader(data); renderSummary(data); renderClaims(data); renderSearch(data);
      renderWorkflow(data); renderWalkthrough(data); renderDirections(data); renderBoundaries(data);
      setText("all-count", data.papers.length); filterPapers();
      $("loading-state").hidden = true; $("app-root").hidden = false;
      document.dispatchEvent(new Event("research-ready"));
      observeSections();
    } catch (error) {
      $("loading-state").hidden = true; $("error-state").hidden = false;
      const localNote = location.protocol === "file:" ? " 请通过仓库的本地 HTTP 服务打开此页面，浏览器通常不允许直接读取本地 JSON。" : " 请确认 app/data/research.json 存在且格式正确。";
      setText("error-message", `${error instanceof Error ? error.message : "读取研究数据时发生错误。"}${localNote}`);
    }
  }
  document.querySelectorAll("[data-role-filter]").forEach((button) => button.addEventListener("click", () => { state.filter = button.dataset.roleFilter; filterPapers(); }));
  $("paper-search").addEventListener("input", (event) => { state.search = event.target.value; filterPapers(); });
  $("reading-filter").addEventListener("change", (event) => { state.reading = event.target.value; filterPapers(); });
  $("reset-filters").addEventListener("click", () => {
    state.filter = "all"; state.search = ""; state.reading = "all"; $("paper-search").value = ""; $("reading-filter").value = "all"; filterPapers(); $("paper-search").focus();
  });
  $("retry-button").addEventListener("click", load);
  $("dialog-close").addEventListener("click", closeDialog);
  $("detail-dialog").addEventListener("click", (event) => {
    if (event.target !== $("detail-dialog")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
  });
  $("detail-dialog").addEventListener("close", () => { document.body.style.overflow = ""; if (lastFocus instanceof HTMLElement && lastFocus.isConnected) lastFocus.focus(); });
  const printDetails = new Map();
  window.addEventListener("beforeprint", () => { document.querySelectorAll("details").forEach((detail) => { printDetails.set(detail, detail.open); detail.open = true; }); });
  window.addEventListener("afterprint", () => { printDetails.forEach((open, detail) => { detail.open = open; }); printDetails.clear(); });
  load();
})();
