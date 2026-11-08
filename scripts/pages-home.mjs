const repository = 'https://github.com/yydshly/1025_codex_project';
const pagesBase = new URL('https://yydshly.github.io/1025_codex_project/');
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const folderOf = (project) => project.id + '-' + project.slug;
const projectAnchor = (project) => '#project-' + project.id;
const stages = { planned: '待研究', researching: '研究中', building: '实践中', completed: '已总结', archived: '已归档' };

function httpsLink(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('总入口只接受 HTTPS 来源和演示链接。');
  return url;
}

function publishedDemo(project, files) {
  if (!project.demoUrl) return null;
  const url = httpsLink(project.demoUrl);
  if (url.origin !== pagesBase.origin || !url.pathname.startsWith(pagesBase.pathname)) return url.href;
  const route = url.pathname.slice(pagesBase.pathname.length);
  const file = route.endsWith('/') ? route + 'index.html' : route;
  if (!files.has(file)) throw new Error(project.id + ' 的演示地址未列入发布文件：' + route);
  return './' + route + url.search + url.hash;
}

export function renderPagesHome(registry, publications) {
  const projects = [...registry.projects].sort((a, b) => a.id.localeCompare(b.id));
  const byId = new Map(projects.map((project) => [project.id, project]));
  const publicationsById = new Map(publications.map((entry) => [entry.project.id, entry]));
  const files = new Set(publications.flatMap((entry) => entry.files.map(({ relative }) => entry.folder + '/' + relative)));
  const entries = new Map(projects.map((project) => {
    const publication = publicationsById.get(project.id);
    const demo = publishedDemo(project, files);
    const root = './' + folderOf(project) + '/';
    const action = publication?.action
      ? { label: publication.action.label, href: root + publication.action.path.replace(/^index\.html(?=$|#)/, '') }
      : publication
        ? { label: '打开项目网页', href: root }
        : demo
          ? { label: '打开在线演示', href: demo }
          : null;
    const state = publication ? '可在线体验' : demo ? '有在线入口' : '仅公开研究说明';
    const guide = publication && (publication.guidePage === 'index.html' ? root : root + publication.guidePage);
    return [project.id, { action, state, guide, publication, root }];
  }));

  const assigned = new Set();
  const topicIds = new Set(['other']);
  const topics = (registry.topics ?? []).map((topic) => {
    if (!/^[a-z][a-z-]*$/.test(topic.id) || topicIds.has(topic.id) || !topic.title?.trim() || !topic.summary?.trim()
        || !Array.isArray(topic.projects) || !topic.projects.length) throw new Error('总入口主题配置无效：' + topic.id);
    topicIds.add(topic.id);
    const members = topic.projects.map((id) => {
      if (!byId.has(id) || assigned.has(id)) throw new Error('总入口主题中有未登记或重复项目：' + id);
      assigned.add(id);
      return byId.get(id);
    });
    return { ...topic, members };
  });
  const remaining = projects.filter((project) => !assigned.has(project.id));
  if (remaining.length) topics.push({ id: 'other', title: '其他研究', summary: '按编号查找新收录的项目。', members: remaining });

  const relationships = new Map(projects.map(({ id }) => [id, []]));
  const seenPairs = new Set();
  for (const relation of registry.relationships ?? []) {
    if (!Array.isArray(relation.projects) || relation.projects.length !== 2 || !relation.label?.trim()) throw new Error('总入口关联配置无效。');
    const [from, to] = relation.projects;
    const key = [from, to].sort().join('/');
    if (!byId.has(from) || !byId.has(to) || from === to || seenPairs.has(key)) throw new Error('总入口关联指向未登记、重复或相同的项目：' + key);
    seenPairs.add(key);
    relationships.get(from).push({ project: byId.get(to), label: relation.label });
    relationships.get(to).push({ project: byId.get(from), label: relation.label });
  }

  const card = (project) => {
    const { action, state, guide, publication, root } = entries.get(project.id);
    const readme = repository + '/blob/main/projects/' + folderOf(project) + '/README.md';
    const source = httpsLink(project.source);
    const sourceName = project.sourceName ?? source.pathname.split('/').filter(Boolean).at(-1);
    const related = relationships.get(project.id);
    const image = publication && project.cover
      ? '<a class="guide-image" href="' + escape(guide) + '" aria-label="查看' + escape(project.name) + '引导图"><img src="' + escape(root + project.cover) + '" alt="" loading="lazy" width="' + publication.coverSize.width + '" height="' + publication.coverSize.height + '"></a>'
      : '';
    return [
      '<article id="project-' + project.id + '" tabindex="-1">',
      '<div class="card-body">',
      '<p class="card-meta"><span class="number">' + project.id + '</span><span>' + escape(stages[project.status] ?? project.status) + '</span><span class="state">' + state + '</span></p>',
      '<h3>' + escape(project.name) + '</h3>',
      '<p class="summary">' + escape(project.summary) + '</p>',
      '<div class="actions">',
      action ? '<a class="primary" href="' + escape(action.href) + '">' + escape(action.label) + ' →</a>' : '',
      guide && guide !== action?.href ? '<a href="' + escape(guide) + '">看项目引导 ↗</a>' : '',
      '<a href="' + escape(readme) + '">读研究说明 ↗</a>',
      '</div>',
      image,
      '<p class="source">来源 · ' + (source.href.replace(/\/$/, '') === repository
        ? escape(sourceName)
        : '<a href="' + escape(source.href) + '">' + escape(sourceName) + ' ↗</a>') + '</p>',
      related.length ? '<ul class="related" aria-label="关联项目">' + related.map((item) =>
        '<li><a class="number" aria-label="查看 ' + item.project.id + ' ' + escape(item.project.name) + '" href="' + projectAnchor(item.project) + '">' + item.project.id + ' ↗</a><span>' + escape(item.label) + '</span></li>').join('') + '</ul>' : '',
      '</div></article>',
    ].join('\n');
  };

  const topicLinks = topics.map(({ id, title, summary, members }) =>
    '<a href="#topic-' + id + '"><span>' + escape(title) + '</span><small>' + escape(summary) + '</small><b>' + members.length + ' 项 ↓</b></a>').join('\n');
  const directory = projects.map((project) =>
    '<li><a href="' + projectAnchor(project) + '"><span class="number">' + project.id + '</span>' + escape(project.name) + '</a></li>').join('\n');
  const sections = topics.map(({ id, title, summary, members }) =>
    '<section class="topic" id="topic-' + id + '" aria-labelledby="heading-' + id + '"><header><h2 id="heading-' + id + '">' + escape(title) + '</h2><p>' + escape(summary) + '</p></header><div class="cards">' + members.map(card).join('\n') + '</div></section>').join('\n');
  const online = [...entries.values()].filter(({ action }) => action).length;

  return '<!doctype html>\n<html lang="zh-CN">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>研究与实践档案｜GitHub 研究总库</title><meta name="description" content="按主题或编号查找研究项目、在线体验、原始来源与关联。"><link rel="stylesheet" href="./hub.css"></head>\n' +
    '<body id="top"><a class="skip" href="#topics">跳到主题导航</a><main>\n<header class="hero"><div class="eyebrow">REPO STUDY LAB</div><h1>研究与实践档案</h1>' +
    '<p class="lead">从一个想法或参考出发，查看我们做出了什么、怎样实现，以及哪些研究可以接着读。</p>' +
    '<p class="counts">' + projects.length + ' 个项目 · ' + online + ' 项有在线体验 · ' + (projects.length - online) + ' 项公开研究说明</p>' +
    '<a class="primary" href="#topics">按主题浏览 ↓</a> <a class="secondary" href="#directory">按编号查找 ↓</a></header>\n' +
    '<nav id="topics" aria-labelledby="topics-title"><h2 id="topics-title">按主题浏览</h2><div class="topic-links">' + topicLinks + '</div></nav>\n' +
    '<details class="directory" id="directory"><summary>项目索引 <span>001 起按固定编号排列</span></summary><ul>' + directory + '</ul></details>\n' +
    sections + '\n<footer><a href="#top">回到顶部 ↑</a><a href="' + repository + '">GitHub 研究总库 ↗</a></footer></main>\n' +
    '<script>const directory=document.querySelector("#directory"); for(const link of document.querySelectorAll("a[href=\\"#directory\\"]")) link.addEventListener("click",()=>{directory.open=true;});</script></body></html>\n';
}
