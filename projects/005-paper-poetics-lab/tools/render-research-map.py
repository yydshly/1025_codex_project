"""Render the research overview from reviewed content and existing visual evidence.

Optional authoring dependency: resvg-py and Pillow. npm build uses the committed
SVG/PNG outputs and does not require Python or any generation service.
"""
from pathlib import Path
import base64
import hashlib
import html
import json
import re
import shutil

from PIL import Image, ImageFont
from resvg_py import svg_to_bytes

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / 'app/media'
OUT = ROOT / 'assets/images/v1.4'
OUT.mkdir(parents=True, exist_ok=True)
CONTENT = json.loads((ROOT / 'research/overview-map-content.json').read_text(encoding='utf-8'))
FONT = Path('C:/Windows/Fonts/msyh.ttc')
BOLD = Path('C:/Windows/Fonts/msyhbd.ttc')
SERIF = Path('C:/Windows/Fonts/simsun.ttc')
W = 2400
M = 80
INNER = W - M * 2
C = dict(paper='#eee9da', ink='#29372c', muted='#59634f', line='#bdc2ae',
         rust='#96513a', sage='#e0e7d8', blue='#dfe8e5', darkblue='#3e615e', cream='#f4f0e5')
SVG = []
TEXT_BOXES = []


def esc(value):
    return html.escape(str(value), quote=True)


def text(value, x, y, size=24, color=None, weight='400', serif=False):
    family = 'SimSun,Songti SC,Noto Serif CJK SC,serif' if serif else 'Microsoft YaHei,PingFang SC,Noto Sans CJK SC,sans-serif'
    SVG.append(f'<text x="{x:.1f}" y="{y+size:.1f}" font-size="{size}" font-weight="{weight}" fill="{color or C["ink"]}" font-family="{family}">{esc(value)}</text>')


def lines(value, width, size=22):
    font = ImageFont.truetype(str(FONT), size)
    result, line = [], ''
    for ch in re.findall(r'[A-Za-z0-9]+(?:[./×+_-][A-Za-z0-9]+)*|[^\x00-\x7F]|.', value):
        if ch == '\n':
            result.append(line)
            line = ''
        elif line and font.getlength(line + ch) > width:
            if ch in '，。；：？！、）》”：':
                result.append(line + ch)
                line = ''
            else:
                result.append(line)
                line = ch
        else:
            line += ch
    if line:
        result.append(line)
    return result


def para(value, x, y, width, size=22, leading=32, color=None):
    rows = lines(value, width, size)
    for i, row in enumerate(rows):
        text(row, x, y+i*leading, size, color)
    height = len(rows)*leading
    TEXT_BOXES.append(dict(text=value, x=x, y=y, width=width, height=height))
    return y+height


def rect(x, y, width, height, fill=None, stroke=None, radius=5, cls=''):
    SVG.append(f'<rect class="{cls}" x="{x:.1f}" y="{y:.1f}" width="{width:.1f}" height="{height:.1f}" rx="{radius}" fill="{fill or "none"}" stroke="{stroke or "none"}"/>')


def rule(y):
    SVG.append(f'<path d="M {M} {y} H {W-M}" stroke="{C["line"]}" stroke-width="1.5"/>')


def arrow(x1, y1, x2, y2):
    SVG.append(f'<path d="M {x1} {y1} L {x2} {y2}" fill="none" stroke="{C["line"]}" stroke-width="2" marker-end="url(#arrow)"/>')


def section(number, title, subtitle, y):
    rule(y)
    text(number, M, y+28, 25, C['rust'])
    text(title, M+65, y+23, 36, serif=True)
    if subtitle:
        text(subtitle, M+65, y+79, 21, C['muted'])
    return y+126


def image(path, x, y, width, height):
    data = base64.b64encode(path.read_bytes()).decode('ascii')
    SVG.append(f'<image x="{x:.1f}" y="{y:.1f}" width="{width:.1f}" height="{height:.1f}" preserveAspectRatio="xMidYMid meet" href="data:image/jpeg;base64,{data}"/>')


def link_start(href, label, cls='', external=False):
    target = '_blank' if external else '_top'
    SVG.append(f'<a class="{cls}" href="{esc(href)}" target="{target}" aria-label="{esc(label)}">')


def link_end():
    SVG.append('</a>')


thumbs = {}
sources = []
for key, name in dict(original='research/original.jpg', tea='research/tea.jpg', moon='research/moon.jpg',
                      cinema='cinema/rain-window-tea.jpg', study='cinema/rain-window-study.jpg').items():
    source = MEDIA / name
    destination = MEDIA / 'map' / f'effect-{key}.jpg'
    im = Image.open(source).convert('RGB')
    im.thumbnail((600, 400), Image.Resampling.LANCZOS)
    im.save(destination, quality=85)
    thumbs[key] = destination
    sources.append(dict(output=str(destination.relative_to(ROOT)).replace('\\', '/'),
                        source=str(source.relative_to(ROOT)).replace('\\', '/'),
                        operation='proportional thumbnail, no visual generation',
                        sha256=hashlib.sha256(destination.read_bytes()).hexdigest()))

text('纸间研究总览', M, 56, 67, serif=True)
text('源效果 × 氛围理解 × 技术路径 × 我们的价值', M, 148, 30)
text('参考演示 → 拆解关系 → 本地实践 → 复核差距 → 沉淀方法', M, 204, 23, C['muted'])
text('2026.10.26 / 项目 002 + 005', 1825, 71, 22, C['muted'])
rect(1825, 124, 495, 104, C['sage'])
text('可参考氛围，也可参考技术。', 1845, 137, 25)
text('先区分：看到的、做过的、还待验证的。', 1845, 180, 20, C['muted'])

y = section('01', CONTENT['source']['title'], '录屏可见事实。原作内部技术与触发方式未知；下图中的技术均为我们的本地实现或复现路径。', 281)
source_cards = [
    ('rain', '纸墨雨巷', '不规则窗口、落雨与倒影，先把环境安放在纸面中。', 1.8),
    ('landscape', '满屏湖景', '近草、水面与远山分层活动，观看距离随章节改变。', 15.2),
    ('lotus', '莲花展开', '花、蝶、墨雾共同变化；主体事件具有发展过程。', 21.4),
    ('enso', '墨圈与留白', '内容退出后再画圈，停顿与空白组织章节关系。', 24.0),
]
gap = 24
cardw = (INNER-gap*3)/4
source_url = 'https://x.com/thtbee_/status/2114030630887641448'
for i, (key, title, description, sec) in enumerate(source_cards):
    x = M+i*(cardw+gap)
    link_start(source_url, f'查看Bee原始演示：{title}', 'source-card', True)
    image(MEDIA / 'map' / f'source-{key}.jpg', x, y, cardw, 305)
    text(title, x, y+324, 29, serif=True)
    para(description, x, y+372, cardw-10, 22, 32, C['muted'])
    link_end()
    sources.append(dict(output=f'app/media/map/source-{key}.jpg', source='cached original demonstration recording',
                        seconds=sec, attribution='Bee / thtbee_', source_url=source_url,
                        operation='single-frame extract with ffmpeg, scaled to 480px wide'))
y += 476
rect(M, y, INNER, 67, C['cream'])
text('源效果的设计价值（研究判断）', M+20, y+16, 24, C['rust'])
text('用画幅、事件与停顿，把网页组织成一段可进入的观看过程。', M+415, y+17, 24)
y += 110

y = section('02', '两条线一起理解：感受怎样成立，制作怎样落地', '左侧是氛围判断；右侧是已研究的本地技术。连线表示服务关系，并非原作实现鉴定。', y)
colw = (INNER-100)/2
text('氛围线 / 观看目标', M, y, 28, C['rust'])
text('技术线 / 本地实现', M+colw+100, y, 28, C['darkblue'])
y += 57
for index, (a, tech) in enumerate(zip(CONTENT['atmosphere'], CONTENT['technology'])):
    rowh = max(145, 70+max(len(lines(a['body'], colw-104, 22)), len(lines(tech['body'], colw-104, 22)))*32)
    right = M+colw+100
    rect(M, y, colw, rowh, C['sage'])
    rect(right, y, colw, rowh, C['blue'])
    text(f'{index+1:02}', M+22, y+24, 22, C['rust'])
    text(a['title'], M+75, y+19, 29, serif=True)
    para(a['body'], M+75, y+68, colw-104, 22, 32, C['muted'])
    text(tech['title'], right+26, y+20, 28, serif=True)
    para(tech['body'], right+26, y+68, colw-52, 22, 32, C['muted'])
    arrow(M+colw+20, y+rowh/2, right-20, y+rowh/2)
    y += rowh+18
y += 8
rect(M, y, INNER, 99, C['cream'])
text('风格还可参考', M+20, y+17, 24, C['rust'])
para('底材与不规则边缘 · 冷暖和明暗关系 · 主体尺度与留白 · 运动密度。它们随主题调整；当前写实电影感与纸墨语言尚未统一。', M+230, y+18, INNER-260, 23, 34, C['muted'])
y += 139

y = section('03', '我们探索过的五项效果 · 点击卡片进入演示', '可运行路径、实时场景、AI成片与实拍对照分别提供证据，不能彼此替代。', y)
gap = 24
cardw = (INNER-gap*4)/5
bodyw = cardw-40
cardh = max(600, max(440+len(lines(item['learned'], bodyw, 21))*30+len(lines('仍缺：'+item['limit'], bodyw, 20))*29 for item in CONTENT['studies']))
for i, item in enumerate(CONTENT['studies']):
    x = M+i*(cardw+gap)
    link_start(item['href'], f'进入{item["title"]}，{item["medium"]}', 'effect-card')
    rect(x, y, cardw, cardh, C['cream'], C['line'], cls='node-border')
    image(thumbs[item['id']], x+12, y+12, cardw-24, 205)
    text(item['title'], x+20, y+237, 29, serif=True)
    para(item['medium'], x+20, y+283, bodyw, 18, 25, C['rust'])
    cy = y+336
    cy = para(item['learned'], x+20, cy, bodyw, 21, 30)
    cy = para('仍缺：'+item['limit'], x+20, cy+14, bodyw, 20, 29, C['muted'])
    text('进入效果页  ↗', x+20, y+cardh-50, 22, C['darkblue'])
    link_end()
y += cardh+34
text('原有九章入口 / 本地独立重写', M, y, 25, C['rust'])
y += 50
chipw = (INNER-8*14)/9
for i, chapter in enumerate(CONTENT['chapters']):
    x = M+i*(chipw+14)
    link_start(chapter['href'], f'进入本地重写章节：{chapter["label"]}', 'chapter-link')
    rect(x, y, chipw, 62, C['cream'], C['line'], cls='node-border')
    text(f'{i+1:02}', x+12, y+17, 19, C['rust'])
    text(chapter['label'], x+49, y+15, 22)
    link_end()
y += 96
link_start('../research.html#journey', '查看四轮探索的实际截图与研究过程', 'journey-link')
rect(M, y, INNER, 99, C['blue'])
text('四轮探索的转向', M+20, y+15, 24, C['darkblue'])
text('002 参考重写 → v1.0 新主题 → v1.1 空间改进 → v1.2 视频主导', M+300, y+15, 25)
text('从用户反馈中学到：操作、模型和光照可以逐项增加，观看感受仍需单独检验。点击查看各轮实景。', M+300, y+57, 22, C['muted'])
link_end()
y += 131
text('制作分工：视频承载连续环境细节 ｜ 网页组织观看、字幕与声音 ｜ 实时场景回应操作。三者融合的完整叙事尚未完成。', M, y, 23, C['muted'])
y += 79

y = section('04', '对我们的价值：共同判断、工程资产与下一轮创作依据', '已有的方法与资产可以继续使用；用户停留、传播与商业效果仍属于待验证的应用潜力。', y)
valuew = (INNER-90)/4
valueh = max(228, max(98+len(lines(item['body'], valuew-36, 22))*32 for item in CONTENT['value']))
for i, item in enumerate(CONTENT['value']):
    x = M+i*(valuew+30)
    text(f'{i+1:02}', x, y, 26, C['rust'])
    text(item['title'], x, y+48, 28, serif=True)
    para(item['body'], x, y+102, valuew-20, 22, 32, C['muted'])
y += valueh+12
rect(M, y, INNER, 112, C['sage'])
text('已经留下的工程资产', M+24, y+18, 27, serif=True)
text('章节进度与场景接口 · 程序纸墨与多层运动 · 实时场景与声音控制 · 原生播放器 · 提示词与素材来源 · 成本及验证记录', M+24, y+66, 23)
y += 155

y = section('05', '从这张图带走的制作流程', '先让一幕成立，再检验它能否迁移到第二幕。当前写实电影感与纸墨语言仍未统一。', y)
stepw = (INNER-160)/5
steph = max(145, max(47+len(lines(item, stepw-36, 22))*32 for item in CONTENT['recipe']))
for i, item in enumerate(CONTENT['recipe']):
    x = M+i*(stepw+40)
    rect(x, y, stepw, steph, C['cream'], C['line'])
    text(f'{i+1:02}', x+18, y+14, 22, C['rust'])
    para(item, x+18, y+53, stepw-36, 22, 32)
    if i<4:
        arrow(x+stepw+8, y+steph/2, x+stepw+32, y+steph/2)
y += steph+50
rule(y)
text('证据与边界', M, y+28, 30, serif=True)
by = y+86
for i, item in enumerate(CONTENT['boundaries']):
    x = M+(i%2)*(INNER/2+20)
    top = by+(i//2)*92
    text(f'•', x, top, 24, C['rust'])
    para(item, x+28, top, INNER/2-65, 21, 31, C['muted'])
y = by+200
link_start(source_url, '查看Bee原始演示录屏', external=True)
text('源录屏：Bee / thtbee_ ↗', M, y+5, 21, C['darkblue'])
link_end()
link_start('../research.html#evidence', '查看研究证据、成本和素材许可', 'evidence-link')
text('完整证据、许可与研究回顾 ↗', M+590, y+5, 21, C['darkblue'])
link_end()
text('本地研究 · 图中链接需通过网页或SVG使用；PNG保留静态全图。', M, y+55, 19, C['muted'])
H = int(y+120)

body = '\n'.join(SVG)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="group" aria-labelledby="overview-title overview-desc">
<title id="overview-title">纸间研究总览：源效果、氛围理解、技术路径、五项演示与我们的价值</title>
<desc id="overview-desc">从可见原参考效果，经氛围与技术两条线，连接五项本地实践，再归纳可复用价值、制作流程和验证边界。五张效果卡可点击进入相应演示。原作源码未知，技术说明属于本地实现。</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{C['line']}"/></marker></defs>
<style>a{{cursor:pointer}}a:hover .node-border,a:focus-visible .node-border{{stroke:{C['rust']};stroke-width:4}}a:focus-visible{{outline:3px solid {C['rust']};outline-offset:5px}}</style>
<rect width="{W}" height="{H}" fill="{C['paper']}"/>
{body}
</svg>'''
svg_path = MEDIA / 'research-map.svg'
svg_path.write_text(svg, encoding='utf-8')
png = svg_to_bytes(svg_path=str(svg_path), resources_dir=str(MEDIA), width=W,
                   skip_system_fonts=True, font_files=[str(FONT), str(BOLD), str(SERIF)],
                   font_family='Microsoft YaHei', sans_serif_family='Microsoft YaHei', serif_family='SimSun')
(MEDIA / 'research-map.png').write_bytes(png)
preview = Image.open(MEDIA / 'research-map.png').convert('RGB')
preview.thumbnail((720, 1400), Image.Resampling.LANCZOS)
preview.save(MEDIA / 'research-map-preview.jpg', quality=88, progressive=True)
shutil.copyfile(svg_path, OUT / 'research-map.svg')
shutil.copyfile(MEDIA / 'research-map.png', OUT / 'research-map.png')
manifest = dict(width=W, height=H, source_record='research/overview-map-content.json',
                renderer='resvg-py', new_ai_generation=False, sources=sources,
                original_recording='https://x.com/thtbee_/status/2114030630887641448')
(ROOT / 'research/overview-map-sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'Rendered research overview: {W} x {H}; SVG {len(svg.encode("utf-8")):,} bytes; PNG {len(png):,} bytes.')
