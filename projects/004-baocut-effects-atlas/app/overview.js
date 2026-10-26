function renderCapabilityOverview(data, scenes, actions) {
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const heading = (number, title, label, kind = '') => `<div class="map-layer-heading"><span class="map-step">${number}</span><h4>${title}</h4><span class="map-evidence ${kind}">${label}</span></div>`;
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const stats = (ids) => `${ids.length} 个方向 · ${ids.filter((id) => sceneById.get(id)?.localPreview).length} 段预览`;
  const overview = document.getElementById('capability-map');
  overview.innerHTML = `<div class="map-identity"><p class="map-kicker">BAOCUT / 从用途到方法，再到可编辑工程</p><h3>${esc(data.positioning)}</h3><p>${esc(data.summary)}</p><div class="map-identity-meta"><span>${esc(data.skill)}</span><span>${esc(data.runtime)}</span></div></div>
    <div class="map-body">
      ${heading('01', '先看用途：五类场景，按需制作', '本研究归类')}
      <div class="map-scenes">${data.groups.map((group) => `<button class="map-scene" type="button" data-map-group="${esc(group.id)}" aria-label="浏览${esc(group.title)}的全部效果"><strong>${esc(group.title)} ↗</strong><span>${esc(group.note)}</span><small>${stats(group.sceneIds)}</small></button>`).join('')}</div>
      <div class="map-connector">${esc(data.routeNote)}</div>
      ${heading('02', '再选画面：三条路径，可以组合', '制作记录核实')}
      <div class="map-route-grid">${data.routes.map((route, index) => {
        const ids = scenes.filter((scene) => scene.implementation.route === route.id).map((scene) => scene.id);
        return `<article class="map-route route-${esc(route.id)}"><div class="map-route-top"><span>路径 ${String(index + 1).padStart(2, '0')}</span><span>${stats(ids)}</span></div><h4>${esc(route.title)}</h4><p class="map-actor">${esc(route.actor)}</p><ol class="map-route-flow">${route.flow.map((line) => `<li>${esc(line)}</li>`).join('')}</ol><div class="map-techniques"><strong>具体技巧</strong><ul>${route.techniques.map((line) => `<li>${esc(line)}</li>`).join('')}</ul></div><p class="map-route-limit">${esc(route.limit)}</p><div class="map-examples">${route.exampleIds.map((id) => {
          const scene = sceneById.get(id);
          return `<button class="map-example" type="button" data-map-scene="${esc(id)}" aria-label="观看${esc(scene.title)}并查看实现原理"><img src="${esc(scene.localCover)}" width="320" height="180" loading="lazy" alt="${esc(scene.title)}官方预览封面"><span>▶ ${esc(scene.title)}</span></button>`;
        }).join('')}</div><button class="map-route-more" type="button" data-map-method="${esc(route.id)}">浏览这条路径的全部效果 ↓</button></article>`;
      }).join('')}</div>
      <div class="map-connector">画面按镜头制作；字幕、配音与检索作为共同能力按需使用。</div>
      <div class="map-support-shell">${heading('03', '配套能力：处理内容、声音与输出', '官方文档说明', 'docs')}<p class="map-support-intro">${esc(data.supportNote)}</p><div class="map-supports">${data.supports.map((item) => `<article><h5>${esc(item.title)}</h5><ul>${item.lines.map((line) => `<li>${esc(line)}</li>`).join('')}</ul><p>${esc(item.condition)}</p></article>`).join('')}</div></div>
      <div class="map-connector">画面、文稿和声音汇合，保留对象与编辑状态。</div>
      <div class="map-project">${heading('04', '工程能力：让修改与交接有依托', '官方文档说明', 'docs')}<h4>${esc(data.project.title)}</h4><p class="map-project-objects">${esc(data.project.objects)}</p><div class="map-mechanisms">${data.project.mechanisms.map((line) => `<span>${esc(line)}</span>`).join('')}</div><p class="map-project-caveat">${esc(data.project.caveat)}</p></div>
      <ol class="map-workflow" aria-label="整体制作流程">${data.workflow.map((line) => `<li>${esc(line)}</li>`).join('')}</ol>
    </div>
    <div class="map-values">${heading('05', '对我们的价值：看节省了哪些配套工作', '研究判断 / 尚待实测', 'judgment')}<div class="map-value-grid">${data.values.map((item) => `<article><h5>${esc(item.title)}</h5>${item.lines.map((line) => `<p>${esc(line)}</p>`).join('')}</article>`).join('')}</div><div class="map-boundaries"><strong>能力边界与证据范围</strong><ul>${data.boundaries.map((line) => `<li>${esc(line)}</li>`).join('')}</ul></div></div>
    <figcaption class="map-caption">本图由我们的讨论与固定版本资料整理。分类、比较和价值判断为本研究归纳；样片来自 Jim Liu / BaoCut。研究提交 ${esc(data.commit.slice(0, 12))} · 24 份制作记录 / 20 段约 15 秒的预览节选。点击用途进入筛选，点击封面打开样片及原理。</figcaption>`;
  document.getElementById('overview-sources').innerHTML = `<summary>来源与判断依据 · 如何区分已核实与待验证</summary><ul>${data.sources.map((item) => `<li><a href="${esc(item.url)}" target="_blank" rel="noreferrer">${esc(item.title)} ↗</a> · ${esc(item.label)}</li>`).join('')}</ul><p>样片路径和技巧来自原始制作记录；通用能力依据官方文档，尚未逐项本机验证。相对脚本流程的收益是我们的适用性判断，没有质量、速度或成本对照实验。</p>`;
  overview.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.mapScene) actions.openScene(button.dataset.mapScene);
    else if (button.dataset.mapGroup) actions.browse({ group: button.dataset.mapGroup });
    else if (button.dataset.mapMethod) actions.browse({ method: button.dataset.mapMethod });
  });
}
