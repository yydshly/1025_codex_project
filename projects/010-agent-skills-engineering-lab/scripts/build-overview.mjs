import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'app/overview-data.js'), 'utf8'), context);
const data = context.SKILL_OVERVIEW;
const catalogContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'app/catalog.js'), 'utf8'), catalogContext);
const ids = catalogContext.window.AGENT_SKILLS_GUIDE.map(s => s.slug).sort();
const all = data.skills.map(s => s.id).sort();
const grouped = data.groups.flatMap(g => g.ids).sort();
if (ids.length !== 25 || JSON.stringify(ids) !== JSON.stringify(all) || JSON.stringify(ids) !== JSON.stringify(grouped)) throw Error('Overview must cover exactly the 25 source skills, once per group.');
for (const s of data.skills) {
  for (const field of ['purpose', 'when', 'how', 'deliverable', 'connect']) if (typeof s[field] !== 'string' || !s[field].trim()) throw Error(`${s.id}: missing ${field}`);
  if (!fs.existsSync(path.join(root, 'research/upstream/skills', s.id, 'SKILL.md'))) throw Error(`Missing source: ${s.id}`);
}
const esc = s => String(s).replace(/[&<>"']/g, x => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[x]));
function wrap(text, width, fontSize) {
  const result = []; let line = '', used = 0;
  for (const ch of String(text)) {
    const weight = /[\u0020-\u007e]/.test(ch) ? .56 : 1;
    if (used + weight > width / fontSize && line) { result.push(line); line = ''; used = 0; }
    line += ch; used += weight;
  }
  if (line) result.push(line);
  return result;
}
const W = 2400, M = 72, inner = W - M * 2;
const widths = [260, 330, 380, 500, 400, 386];
const x = [M]; widths.forEach(w => x.push(x.at(-1) + w));
const parts = [];
const text = (value, px, py, size = 22, options = '') => `<text x="${px}" y="${py}" font-size="${size}" ${options}>${esc(value)}</text>`;
const lines = (items, px, py, size = 22, color = '#263c3b', lineHeight = 32) => items.map((s, i) => text(s, px, py + lineHeight * i, size, `fill="${color}"`)).join('');
const byId = new Map(data.skills.map(s => [s.id, s]));
parts.push(`<rect width="${W}" height="HEIGHT" fill="#f7f6f0"/>`);
parts.push(text('AGENT SKILLS / 25项能力与使用场景', M, 78, 25, 'fill="#8d503a" letter-spacing="2"'));
parts.push(text('从问题到交付，一张图查清该用什么', M, 164, 58, 'font-weight="700" fill="#203a39"'));
parts.push(text('每项都看五件事：做什么 · 什么时候用 · 怎么做 · 交付什么与怎样检查 · 怎么配合', M, 220, 28));
parts.push(text('先按当前问题找到工作阶段，再对照场景选技能；一个任务按需组合，无需每次走完全部25项。', M, 275, 25, 'fill="#526665"'));
const flowY = 320, gap = 20, flowW = (inner - 6 * gap) / 7;
data.groups.forEach((g, i) => {
  const fx = M + i * (flowW + gap);
  parts.push(`<rect x="${fx}" y="${flowY}" width="${flowW}" height="156" rx="14" fill="${i === 0 ? '#203a39' : '#e5ece5'}"/>`);
  const color = i === 0 ? '#ffffff' : '#203a39';
  parts.push(text(`${String(i + 1).padStart(2, '0')} / ${g.ids.length}项`, fx + 20, flowY + 35, 22, `fill="${color}"`));
  parts.push(lines(wrap(g.title, flowW - 40, 26), fx + 20, flowY + 75, 26, color, 32));
  if (i < 6) parts.push(text('→', fx + flowW + 2, flowY + 85, 22, 'fill="#526665"'));
});
parts.push(text('贯穿配合：上下文与来源支撑执行；约束、测试、审查检查质量；出现问题时回到相关步骤；文档、版本与观测持续保留依据。', M, 527, 25, 'fill="#526665"'));
const headings = ['技能 / 对应问题', '做什么', '什么时候用', '怎么做：步骤、判断、约束', '交付什么 / 怎样检查', '怎么配合'];
let y = 570;
parts.push(`<rect x="${M}" y="${y}" width="${inner}" height="70" fill="#203a39"/>`);
headings.forEach((label, i) => parts.push(text(label, x[i] + 18, y + 44, 25, 'fill="#ffffff" font-weight="700"')));
y += 70; let n = 0;
for (let groupIndex = 0; groupIndex < data.groups.length; groupIndex++) {
  const g = data.groups[groupIndex];
  parts.push(`<rect x="${M}" y="${y}" width="${inner}" height="65" fill="#dce6dc"/>`);
  parts.push(text(`${String(groupIndex + 1).padStart(2, '0')}  ${g.title} · ${g.ids.length}项`, M + 20, y + 42, 27, 'font-weight="700"'));
  parts.push(text(g.question, M + 650, y + 42, 24, 'fill="#526665"'));
  y += 65;
  for (const id of g.ids) {
    const s = byId.get(id); n++;
    const values = [s.name, s.purpose, s.when, s.how, s.deliverable, s.connect];
    const wrapped = values.map((v, i) => wrap(v, widths[i] - 36, i === 0 ? 25 : 22));
    const rowH = Math.max(160, ...wrapped.map(a => a.length * 32 + 48));
    parts.push(`<rect x="${M}" y="${y}" width="${inner}" height="${rowH}" fill="${n % 2 ? '#fffefa' : '#f0f2eb'}"/>`);
    parts.push(`<path d="M${M} ${y + rowH}H${W - M}" stroke="#cad3c9"/>`);
    parts.push(text(String(n).padStart(2, '0'), x[0] + 18, y + 34, 19, 'fill="#8d503a"'));
    parts.push(lines(wrapped[0], x[0] + 18, y + 72, 25));
    for (let i = 1; i < 6; i++) parts.push(lines(wrapped[i], x[i] + 18, y + 38));
    y += rowH;
  }
}
parts.push(text('阅读范围：已覆盖25项用途、场景和流程解读；场景是按现有项目构造的条件式示例，不表示25项均已完整实测。', M, y + 58, 23, 'fill="#526665"'));
parts.push(text(`依据：addyosmani/agent-skills · MIT · 固定版本 ${data.sourceRevision} · 可点击入口：app/overview.html`, M, y + 100, 21, 'fill="#526665"'));
const H = y + 145;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc"><title id="title">25个Skill能力与使用场景总览</title><desc id="desc">七类工作，全部25项技能；逐项说明做什么、什么时候用、怎么做、交付与检查、如何配合。可搜索SVG文本，或使用配套可点击入口逐项阅读。</desc><g font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif" fill="#263c3b">${parts.join('\n').replace('HEIGHT', H)}</g></svg>\n`;
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>25个Skill · 完整汇总长图</title><style>body{margin:0;background:#f7f6f0;color:#203a39;font:16px/1.6 system-ui,"Microsoft YaHei",sans-serif}.tools{position:sticky;top:0;padding:12px 20px;display:flex;gap:20px;align-items:center;flex-wrap:wrap;background:#f7f6f0;border-bottom:1px solid #cad3c9}a{color:inherit}button{font:inherit;padding:6px 14px;cursor:pointer}main{overflow:auto}svg{width:100%;height:auto;display:block}.actual svg{width:${W}px;max-width:none}.export .tools{display:none}.export main{overflow:visible}.export svg{width:${W}px;height:${H}px}</style></head><body><nav class="tools" aria-label="长图查看"><a href="overview.html">← 返回可点击总览</a><button id="size" type="button" aria-pressed="false">按原尺寸阅读</button><span>全部25项 × 五个问题；放大后可横向查看</span><a href="../assets/images/skills-field-guide.png" download>下载PNG</a><a href="../assets/images/skills-field-guide.svg" download>下载SVG</a></nav><main aria-label="完整汇总图">${svg}</main><script>if(new URL(location.href).searchParams.get('export')==='1')document.body.classList.add('export');document.getElementById('size').addEventListener('click',e=>{const value=document.body.classList.toggle('actual');e.currentTarget.setAttribute('aria-pressed',String(value));e.currentTarget.textContent=value?'适合窗口宽度':'按原尺寸阅读';});</script></body></html>\n`;
const outputs = [['assets/images/skills-field-guide.svg', svg], ['app/overview-poster.html', html]];
for (const [relative, content] of outputs) {
  const target = path.join(root, relative);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) throw Error(`Stale overview: ${relative}`);
  } else { fs.mkdirSync(path.dirname(target), { recursive:true }); fs.writeFileSync(target, content); }
}
console.log(JSON.stringify({mode:process.argv.includes('--check')?'check':'build',status:'pass',skills:25,groups:data.groups.length,fieldsPerSkill:5,width:W,height:H,outputs:outputs.map(([p])=>p)}));
