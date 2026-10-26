import fs from 'node:fs';
import path from 'node:path';

const xml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

export function validateOverview(overview, catalog, implementation) {
  if (overview.commit !== catalog.commit) throw new Error('Overview and catalog versions differ.');
  const ids = new Set(catalog.templates.map((scene) => scene.id));
  const grouped = overview.groups.flatMap((group) => group.sceneIds);
  if (new Set(overview.groups.map((group) => group.id)).size !== 5 || grouped.length !== ids.size || new Set(grouped).size !== ids.size || grouped.some((id) => !ids.has(id))) throw new Error('Overview groups must cover every scene exactly once.');
  const routes = new Set(implementation.routes.map((route) => route.id));
  if (overview.routes.length !== routes.size || new Set(overview.routes.map((route) => route.id)).size !== routes.size) throw new Error('Overview routes must match the implementation routes.');
  for (const route of overview.routes) {
    if (!routes.has(route.id)) throw new Error(`Unknown overview route: ${route.id}`);
    for (const id of route.exampleIds) {
      if (!catalog.templates.find((scene) => scene.id === id)?.localPreview || implementation.scenes.find((scene) => scene.id === id)?.route !== route.id) throw new Error(`Overview example does not match its route: ${id}`);
    }
  }
  if (overview.sources.some((source) => !source.url.includes(`/${overview.commit}/`))) throw new Error('Overview sources must use the pinned commit.');
}

export function buildCapabilityMap(root, overview, catalog, implementation) {
  validateOverview(overview, catalog, implementation);
  const items = [];
  const ink = '#203d31', muted = '#667365', green = '#376d4a';
  const paper = '#fffefa', line = '#d5dfcf';
  const W = 1200, M = 36, gap = 18, usable = W - M * 2;
  const rect = (x, y, w, h, fill = paper, stroke = line, radius = 10) => items.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`);
  const text = (x, y, value, size = 16, color = ink, weight = 400, anchor = 'start') => items.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${xml(value)}</text>`);
  const wrapped = (x, y, value, width, size = 16, color = muted, leading = 25, weight = 400) => {
    let current = '', units = 0;
    for (const c of String(value).match(/[A-Za-z0-9_.+-]+|[ \t]+|[\s\S]/gu) ?? []) {
      const unit = [...c].reduce((sum, char) => sum + (/[\u0020-\u007e]/.test(char) ? .56 : 1), 0);
      if (units + unit > width / size && current) { text(x, y, current, size, color, weight); y += leading; current = ''; units = 0; }
      current += c; units += unit;
    }
    if (current) text(x, y, current, size, color, weight);
    return y + leading;
  };
  const stage = (y, n, title, evidence, kind = 'record') => {
    rect(M, y - 21, 29, 29, '#f1f5eb', '#bbcfb6', 15);
    text(M + 14.5, y, n, 14, green, 500, 'middle');
    text(M + 42, y, title, 22, ink, 600);
    text(W - M, y, evidence, 14, kind === 'docs' ? '#806b44' : kind === 'judgment' ? '#736184' : green, 400, 'end');
  };
  const connector = (y, label) => {
    items.push(`<path d="M600 ${y}v21" stroke="#8da785" stroke-width="1.5" marker-end="url(#arrow)"/>`);
    text(600, y + 48, label, 15, muted, 400, 'middle');
    return y + 80;
  };
  const sceneMap = new Map(catalog.templates.map((scene) => [scene.id, scene]));
  const stats = (ids) => `${ids.length} 个方向 / ${ids.filter((id) => sceneMap.get(id)?.localPreview).length} 段预览`;
  rect(0, 0, W, 217, '#203f34', '#203f34', 0);
  text(M, 35, 'BAOCUT / 能力、方法、效果与价值', 15, '#b7d8b6', 500);
  text(M, 86, overview.positioning, 36, '#fbfbef', 600);
  text(M, 123, overview.summary, 17, '#d2dfcf');
  text(M, 165, overview.skill, 15, '#cfdfc9');
  text(M, 192, overview.runtime, 15, '#cfdfc9');
  let y = 265;
  stage(y, '01', '用途：五类场景，按需制作', '本研究归类');
  const groupY = y + 22, groupH = 123, groupW = (usable - gap * 4) / 5;
  overview.groups.forEach((group, i) => {
    const x = M + (groupW + gap) * i;
    rect(x, groupY, groupW, groupH, '#f1f5eb');
    text(x + 15, groupY + 29, group.title, 19, ink, 600);
    wrapped(x + 15, groupY + 55, group.note, groupW - 30, 14, muted, 22);
    text(x + 15, groupY + groupH - 15, stats(group.sceneIds), 13, green);
  });
  y = connector(groupY + groupH + 10, '同一用途可以混用多条路径；场景数量不代表独立技术数量。');
  stage(y, '02', '画面：三条制作路径与具体技巧', '24 份制作记录核实');
  const routeY = y + 22, routeH = 510, routeW = (usable - gap * 2) / 3;
  const colors = [{ bg: '#f7faef', border: '#c7d6bc', ink: '#3f724b' }, { bg: '#f9f5fd', border: '#d9cce6', ink: '#7a5e94' }, { bg: '#fdf8ee', border: '#e2d3b9', ink: '#916c3d' }];
  overview.routes.forEach((route, i) => {
    const x = M + (routeW + gap) * i, c = colors[i];
    const ids = implementation.scenes.filter((scene) => scene.route === route.id).map((scene) => scene.id);
    rect(x, routeY, routeW, routeH, c.bg, c.border);
    text(x + 20, routeY + 28, `路径 0${i + 1} · ${stats(ids)}`, 14, c.ink);
    text(x + 20, routeY + 67, route.title, 24, ink, 600);
    let ty = wrapped(x + 20, routeY + 96, route.actor, routeW - 40, 15, muted, 24);
    for (const [j, step] of route.flow.entries()) ty = wrapped(x + 20, ty + 5, `${j + 1}. ${step}`, routeW - 40, 15, c.ink, 23);
    text(x + 20, ty + 18, '具体技巧', 16, c.ink, 600); ty += 45;
    for (const technique of route.techniques) ty = wrapped(x + 20, ty, `· ${technique}`, routeW - 40, 15, muted, 24);
    wrapped(x + 20, ty + 9, route.limit, routeW - 40, 13, muted, 21);
    route.exampleIds.forEach((id, j) => {
      const scene = sceneMap.get(id), imageW = (routeW - 54) / 2;
      const ix = x + 20 + (imageW + 14) * j, iy = routeY + routeH - 118;
      const imagePath = path.resolve(root, 'app', scene.localCover);
      const image = fs.readFileSync(imagePath).toString('base64');
      items.push(`<image x="${ix}" y="${iy}" width="${imageW}" height="${imageW * 9 / 16}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${image}"/>`);
      text(ix, routeY + routeH - 14, scene.title, 13, c.ink);
    });
  });
  y = connector(routeY + routeH + 12, '画面按镜头制作；文稿、声音与检索作为共同能力按需使用。');
  stage(y, '03', '配套能力：内容、声音、素材与输出', '官方文档说明 / 本机未逐项验证', 'docs');
  const supportY = y + 22, supportH = 222, supportW = (usable - gap * 3) / 4;
  overview.supports.forEach((item, i) => {
    const x = M + (supportW + gap) * i;
    rect(x, supportY, supportW, supportH, '#f5f7ef');
    text(x + 16, supportY + 31, item.title, 19, ink, 600);
    let ty = supportY + 63;
    for (const l of item.lines) ty = wrapped(x + 16, ty, l, supportW - 32, 14, '#4e6855', 23);
    wrapped(x + 16, ty + 12, item.condition, supportW - 32, 13, muted, 22);
  });
  y = connector(supportY + supportH + 12, '语义 / 画面检索需模型与索引；生成能力需对应模型或服务。');
  stage(y, '04', '工程：持续修改与人工接手', '官方文档说明', 'docs');
  const projectY = y + 22;
  rect(M, projectY, usable, 178, '#eaf2e2', '#b4c9a9');
  text(M + 22, projectY + 36, overview.project.title, 25, ink, 600);
  text(M + 22, projectY + 68, overview.project.objects, 18, green);
  overview.project.mechanisms.forEach((item, i) => wrapped(M + 22 + i * 363, projectY + 105, item, 330, 15, '#4b6851', 24));
  text(M + 22, projectY + 158, overview.project.caveat, 14, muted);
  text(600, projectY + 216, overview.workflow.join('  →  '), 17, green, 500, 'middle');
  y = projectY + 276;
  stage(y, '05', '价值：减少配套工程，收益需要实测', '我们的适用性判断', 'judgment');
  const valueY = y + 22, valueH = 146;
  overview.values.forEach((item, i) => {
    const x = M + (routeW + gap) * i;
    rect(x, valueY, routeW, valueH, '#f6f0e5', '#e1d7c5');
    text(x + 17, valueY + 32, item.title, 19, '#5d583f', 600);
    let ty = valueY + 62;
    for (const l of item.lines) ty = wrapped(x + 17, ty, l, routeW - 34, 14, '#756d58', 23);
  });
  y = valueY + valueH + 39;
  text(M, y, '能力边界与证据范围', 18, '#7e6745', 600); y += 30;
  for (const l of overview.boundaries) y = wrapped(M, y, `· ${l}`, usable, 15, '#796b53', 25);
  y += 10;
  text(M, y, `研究提交 ${overview.commit.slice(0, 12)} · 2026.10.26 · 本研究未运行 BaoCut / 未做性能或质量对照`, 13, muted); y += 25;
  text(M, y, '样片与封面：Jim Liu / BaoCut；预览为约 15 秒节选。网页支持点击用途筛选、点击封面播放。', 13, muted); y += 28;
  overview.sources.forEach((source, i) => {
    items.push(`<a href="${xml(source.url)}" target="_blank" rel="noreferrer">`);
    text(M, y, `[${i + 1}] ${source.title}（${source.label}） ↗`, 13, green);
    items.push('</a>'); y += 23;
  });
  const height = y + 18;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}" role="img" aria-labelledby="title desc"><title id="title">${xml(overview.title)}</title><desc id="desc">${xml(overview.summary)} 五类用途、三条画面路径、具体技巧、配套能力、可编辑工程与研究判断。</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M1 1L6 4L1 7" fill="none" stroke="#8da785" stroke-width="1.3"/></marker></defs><rect width="100%" height="100%" fill="${paper}"/><g font-family="Arial, Microsoft YaHei, PingFang SC, sans-serif">${items.join('\n')}</g></svg>\n`;
  fs.writeFileSync(path.join(root, 'assets/images/capability-map.svg'), svg, 'utf8');
  const lines = ['# BaoCut 能力与价值总览', '', '> 本研究根据讨论与固定版本资料整理。能力说明与实测结果分开；尚未运行 BaoCut。', '', `固定提交：\`${overview.commit}\`。`, '', `## ${overview.positioning}`, '', overview.summary, '', overview.skill, '', overview.runtime, '', '## 五类用途', ''];
  for (const group of overview.groups) lines.push(`- **${group.title}**：${group.note}；${stats(group.sceneIds)}。`);
  lines.push('', overview.routeNote, '', '## 三条画面制作路径', '');
  for (const route of overview.routes) lines.push(`### ${route.title}`, '', route.actor, '', route.flow.join(' → '), '', ...route.techniques.map((item) => `- ${item}`), '', route.limit, '', `代表样片：${route.exampleIds.map((id) => sceneMap.get(id).title).join('、')}。`, '');
  lines.push('## 配套与工程能力', '', overview.supportNote, '');
  for (const item of overview.supports) lines.push(`### ${item.title}`, '', ...item.lines.map((l) => `- ${l}`), '', item.condition, '');
  lines.push(`### ${overview.project.title}`, '', overview.project.objects, '', ...overview.project.mechanisms.map((l) => `- ${l}`), '', overview.project.caveat, '', overview.workflow.join(' → '), '', '## 对我们的价值判断', '');
  for (const item of overview.values) lines.push(`### ${item.title}`, '', ...item.lines, '');
  lines.push('## 边界', '', ...overview.boundaries.map((l) => `- ${l}`), '', '## 来源', '', ...overview.sources.map((s) => `- [${s.title}](${s.url})：${s.label}`), '');
  fs.writeFileSync(path.join(root, 'research/overview.md'), lines.join('\n'), 'utf8');
  return { width: W, height, bytes: Buffer.byteLength(svg) };
}
