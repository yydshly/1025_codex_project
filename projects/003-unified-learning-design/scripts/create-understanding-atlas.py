#!/usr/bin/env python3
"""Render a self-contained Chinese research atlas as editable SVG and high-res PNG.
Usage: python scripts/create-understanding-atlas.py
No browser or network. Requires Pillow and Microsoft YaHei (Windows).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import base64, html, io, json, math

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/images'
W,H=3200,7450
C={'paper':'#f2f0e5','card':'#fbfaf3','ink':'#284337','muted':'#627267','line':'#c9d1be','green':'#dfe8d7','copper':'#9b6547','lavender':'#78688c','future':'#eae4ef'}
FONTS={'regular':Path('C:/Windows/Fonts/msyh.ttc'),'bold':Path('C:/Windows/Fonts/msyhbd.ttc')}
FONT_CACHE={}
def font(size,bold=False):
    key=(size,bold)
    if key not in FONT_CACHE: FONT_CACHE[key]=ImageFont.truetype(str(FONTS['bold' if bold else 'regular']),size)
    return FONT_CACHE[key]
class Atlas:
    def __init__(self):
        self.im=Image.new('RGB',(W,H),C['paper']); self.d=ImageDraw.Draw(self.im);self.oy=0
        self.svg=[f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><title>连续主题体验：从互动书到实验平台</title><desc>研究思路、真实效果、产品价值、布局扩展、复用方法与验证边界的单张总览图。文字可编辑；嵌入截图为本地样章真实画面。</desc>']
        self.texts=[]; self.rect(0,0,W,H,C['paper'])
    def rect(self,x,y,w,h,fill,stroke=None,r=0,sw=2):
        y+=self.oy
        self.d.rounded_rectangle((x,y,x+w,y+h),radius=r,fill=fill,outline=stroke,width=sw)
        self.svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="{sw}"' if stroke else '')+'/>')
    def line(self,x1,y1,x2,y2,color=None,width=3):
        y1+=self.oy;y2+=self.oy
        color=color or C['line']; self.d.line((x1,y1,x2,y2),fill=color,width=width)
        self.svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"/>')
    def ellipse(self,x,y,w,h,fill,stroke=None,sw=2):
        y+=self.oy
        self.d.ellipse((x,y,x+w,y+h),fill=fill,outline=stroke,width=sw)
        self.svg.append(f'<ellipse cx="{x+w/2}" cy="{y+h/2}" rx="{w/2}" ry="{h/2}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="{sw}"' if stroke else '')+'/>')
    def polygon(self,pts,fill,stroke=None):
        pts=[(x,y+self.oy) for x,y in pts]
        self.d.polygon(pts,fill=fill,outline=stroke)
        self.svg.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in pts)+f'" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="3"' if stroke else '')+'/>')
    def text(self,x,y,text,size=34,color=None,bold=False):
        y+=self.oy
        size=max(28,size);color=color or C['ink']; self.d.text((x,y),text,font=font(size,bold),fill=color,anchor='lt')
        self.svg.append(f'<text x="{x}" y="{y}" dominant-baseline="text-before-edge" fill="{color}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}">{html.escape(text)}</text>')
        self.texts.append(text)
    def wrap(self,x,y,text,maxw,size=34,color=None,bold=False,line=1.55):
        size=max(28,size);cy=y
        for para in text.split('\n'):
            current=''
            for ch in para:
                if current and self.d.textlength(current+ch,font=font(size,bold))>maxw:
                    self.text(x,cy,current,size,color,bold);cy+=round(size*line);current=''
                current+=ch
            if current:self.text(x,cy,current,size,color,bold);cy+=round(size*line)
        return cy
    def img(self,path,x,y,w,h):
        y+=self.oy
        path=OUT/path
        im=Image.open(path).convert('RGB'); im.thumbnail((int(w),int(h)),Image.Resampling.LANCZOS)
        px=int(x+(w-im.width)/2);py=int(y+(h-im.height)/2)
        self.im.paste(im,(px,py))
        raw=base64.b64encode(path.read_bytes()).decode()
        self.svg.append(f'<image x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{raw}"/>')
    def chip(self,x,y,text,future=False):
        size=28; width=int(self.d.textlength(text,font=font(size,True)))+42
        self.rect(x,y,width,44,C['future'] if future else C['green'],r=22)
        self.text(x+21,y+8,text,size,C['lavender'] if future else C['ink'],True)
    def section(self,n,y,title,kicker):
        self.text(120,y,n,30,C['copper'],True);self.text(198,y-6,title,55,bold=True)
        self.text(200,y+65,kicker,29,C['muted']);self.line(120,y+116,3080,y+116)
    def small_label(self,x,y,s):self.text(x,y,s,24,C['muted'])
    def arrow(self,x1,y1,x2,y2,color=None):
        color=color or C['copper'];self.line(x1,y1,x2,y2,color,4)
        a=math.atan2(y2-y1,x2-x1);l=15
        self.polygon([(x2,y2),(x2-l*math.cos(a-.5),y2-l*math.sin(a-.5)),(x2-l*math.cos(a+.5),y2-l*math.sin(a+.5))],color)
    def screen(self,x,y,w,h):
        self.rect(x,y,w,h,'#f7f7ee',C['ink'],r=12,sw=3);self.line(x+12,y+30,x+w-12,y+30)
        for xx in [x+16,x+29,x+42]:self.ellipse(xx,y+11,6,6,C['muted'])
    def diagram(self,kind,x,y,w,h):
        ink=C['ink']; green=C['green']; muted=C['muted'];future=C['future']
        if kind=='book':
            self.polygon([(x+30,y+32),(x+w/2,y+53),(x+w/2,y+h-10),(x+12,y+h-35)],'#e8e4d4',ink)
            self.polygon([(x+w/2,y+53),(x+w-30,y+32),(x+w-12,y+h-35),(x+w/2,y+h-10)],'#f9f6e9',ink)
            self.line(x+w/2,y+53,x+w/2,y+h-10,ink,4)
            for yy in [65,85,105]:self.line(x+48,y+yy,x+w/2-25,y+yy+7,muted,3)
            self.ellipse(x+w*.65,y+45,55,55,green,ink);self.line(x+w*.62,y+108,x+w*.86,y+108,ink,4)
        elif kind=='split':
            self.screen(x+15,y+12,w-30,h-20);self.line(x+w*.42,y+42,x+w*.42,y+h-8)
            for yy in [61,83,105,127]:self.line(x+35,y+yy,x+w*.36,y+yy,muted,3)
            self.line(x+w*.51,y+130,x+w*.89,y+130,ink,4);self.ellipse(x+w*.62,y+58,48,48,green,ink)
            self.arrow(x+w*.4,y+85,x+w*.54,y+85)
        elif kind=='experiment':
            self.screen(x+15,y+12,w-30,h-20);self.line(x+w*.18,y+130,x+w*.75,y+130,ink,4);self.ellipse(x+w*.37,y+60,54,54,green,ink)
            self.rect(x+w*.73,y+54,w*.2,h*.46,future,C['line'],r=8)
            for yy in [73,91,109]:self.line(x+w*.76,y+yy,x+w*.9,y+yy,muted,2)
        elif kind=='dual':
            self.screen(x+12,y+15,w*.42,h-25);self.screen(x+w*.57,y+15,w*.42-12,h-25)
            for yy in [63,86,109]:self.line(x+30,y+yy,x+w*.36,y+yy,muted,3)
            self.ellipse(x+w*.72,y+62,48,48,green,ink);self.arrow(x+w*.45,y+94,x+w*.55,y+94)
        elif kind=='notebook':
            self.screen(x+15,y+12,w-30,h-20)
            for i in range(4):
                xx=x+32+i*(w-64)/4;self.rect(xx,y+54,(w-80)/4,78,green if i==2 else '#eeeadd',C['line'],r=6)
                self.text(xx+8,y+72,['问题','预测','证据','结论'][i],23,bold=True)
        elif kind=='workbench':
            self.screen(x+15,y+12,w-30,h-20)
            for xx,yy,ww,hh in [(35,54,.22,68),(.31*w,51,.33,81),(.68*w,54,.22,68)]:
                self.rect(x+xx,y+yy,w*ww,hh,green if ww==.33 else '#eeeadd',C['line'],r=5)
            self.arrow(x+w*.26,y+93,x+w*.3,y+93);self.arrow(x+w*.65,y+93,x+w*.68,y+93)
        else:
            self.screen(x+18,y+12,w*.3,h-25);self.line(x+w*.43,y+132,x+w*.96,y+132,ink,5)
            self.line(x+w*.51,y+75,x+w*.86,y+118,ink,4);self.ellipse(x+w*.67,y+66,38,38,green,ink)
            self.arrow(x+w*.35,y+89,x+w*.48,y+89);self.rect(x+w*.8,y+38,w*.12,35,future,ink,r=5)

A=Atlas()
# Header
A.text(120,80,'003 / RESEARCH ATLAS',29,C['copper'],True)
A.text(120,150,'连续主题体验',112,bold=True)
A.text(120,294,'从互动书到实验平台',64,bold=True)
A.wrap(120,394,'让同一个主题，在关联章节中持续展开；让内容、展现风格、讲解与操作共同帮助理解。',2860,39,C['muted'])
A.chip(120,512,'阶段收束 · 作为后续产品的可运行样章与方法参考')
A.chip(1575,512,'v4.4 已实现'); A.chip(1858,512,'未来方向为概念设想',True)
A.text(120,590,'研究路径',31,C['copper'],True)
A.text(330,590,'原作观察 → 独立样章 → 理解连续性与共同状态 → 产品复用',32)
# Intended value, deliberately separated from validation claims.
A.text(120,675,'意义与预期价值',48,bold=True)
values=[('对学习者','把抽象关系变成可观察、可操作的变化，帮助形成预测、寻找证据并解释结果。'),('对内容作者','统一对象、状态与讲解规则，让同一内容可跨书页、实验台和工作台持续复用。'),('对教师与展览','围绕同一实验与证据组织讲解、操作和讨论，便于追溯条件、比较结果。')]
for i,(title,body) in enumerate(values):
    x=120+i*1005
    A.rect(x,758,950,294,C['green'],r=20)
    A.text(x+29,788,title,39,bold=True);A.wrap(x+29,856,body,888,32)
A.text(120,1112,'这些是设计价值判断；真实理解提升、迁移效果和教学效率，需要后续受众试用验证。',31,C['muted'])
# Six-part mechanism
A.oy=600
A.section('01',650,'我们理解到的核心','一个主题 · 合适载体 · 关联章节 · 持续风格 · 每章一个新发现')
loop=[('内容','先说清要理解的关系','对象、条件、变化、结果'),('视觉','把关系变成可观察对象','结构、流向、数量、状态'),('讲解','解释此刻正在发生什么','声音、字幕、镜头、圈选'),('操作','让用户改变有关条件','拖动、调参、预测、试验'),('反馈','把结果和原因连起来','数值、对照、状态与证据'),('检验','换个情境检验理解','新问题、新材料与解释')]
for i,(title,l1,l2) in enumerate(loop):
    x=120+i*500
    A.rect(x,806,460,230,C['card'],C['line'],r=20);A.text(x+27,831,f'{i+1:02d}',27,C['copper'],True);A.text(x+27,875,title,46,bold=True)
    A.text(x+27,946,l1,27);A.text(x+27,989,l2,25,C['muted'])
A.wrap(120,1082,'体验流程：提问 → 预测 → 演示 → 操作 → 反馈 → 迁移。六层表达共同服务每一步，前后章节保留可辨认的线索。',2940,34)
# Product model
A.section('02',1210,'产品思路：教材＋实验台＋讲解＋记录','结构思考：教材、实验与讲解已有运行基础；跨次实验记录是后续方向。')
modules=[('教材','提出问题、说明概念','正文／公式／来源／章节'),('实验台','运行规则、观察变化','对象／参数／模型／测量'),('讲解系统','安排节奏、指向对象','语音／镜头／暂停／返回'),('实验记录','留住证据、形成结论','预测／条件／结果／笔记')]
for i,(title,l1,l2) in enumerate(modules):
    x=120+i*755
    A.rect(x,1365,695,235,C['card'],C['line'],r=20);A.text(x+30,1395,title,45,bold=True);A.text(x+30,1472,l1,31);A.text(x+30,1524,l2,27,C['muted'])
    A.chip(x+456,1391,'已有基础' if i<3 else '后续方向',i==3)
    if i<3:
        A.arrow(x+702,1480,x+748,1480);A.arrow(x+748,1510,x+702,1510)
A.rect(120,1643,2960,175,C['green'],r=20)
A.text(150,1669,'真正的关联',32,bold=True)
A.wrap(440,1667,'点段落找器材 → 改参数看公式 → 点结果追溯条件 → 把证据存回对应段落。用户始终知道“在学什么、正在做什么、为什么这样”。',2580,34)
# Actual screenshots
A.section('03',1885,'当前样章：我们已经做到了什么','本地浏览器实拍：目录阅读为v4.4；导演画面保留原型迭代状态。')
shots=[('reading-v4.4/07-final-desktop.png','连续阅读与实验同场','固定当前段落；七段目录；退出恢复上下文。'),('optimized-energy-cue.png','逐句导演与能量反馈','讲解指向小球、能量瓶与总量；在真实事件停下。'),('reading-v4.4/04-mobile-formula.png','手机阅读与讲解切换','阅读时收起导演；正文有空间；返回继续原状态。')]
for i,(path,title,desc) in enumerate(shots):
    x=120+i*1005
    A.rect(x,2040,950,810,C['card'],C['line'],r=20);A.chip(x+24,2062,'v4.4 实拍' if path.startswith('reading-v4.4') else '导演样章实拍')
    A.img(path,x+24,2122,902,535)
    A.text(x+26,2681,title,36,bold=True);A.wrap(x+26,2741,desc,888,27,C['muted'])
A.text(120,2895,'三课',45,bold=True);A.text(310,2906,'能量类型 · 滚动与耗散 · 弹簧发射',31)
A.text(1355,2895,'13 段 MiniMax 配音',40,bold=True);A.text(2270,2906,'9 个导览段落 · 37 项测试',31)
A.wrap(120,2980,'验证：桌面与窄屏主要流程、当前段落保留、连续阅读、暂停与恢复；阅读前后图书区域像素差为 0。',2940,31,C['muted'])
# Presentation extension diagrams
A.section('04',3105,'呈现方式可以怎样扩展','以下为结构示意：保留内容与状态的关联，按具体任务选择布局和媒介。')
layouts=[('book','3D主题书','用打开与翻页建立进入感','已实现'),('split','教材＋实验并排','边读边改条件、核对结果','未来设想'),('experiment','实验优先','操作占主屏，解释按需展开','未来设想'),('dual','双屏协作','一屏教材，一屏操作或演示','未来设想'),('notebook','数字实验记录本','问题—预测—证据—结论','未来设想'),('workbench','主题工作台','教材、实验、图表、笔记同场','未来设想'),('hybrid','虚实结合实验台','实体操作与测量回到教材','未来设想')]
def mini(kind,x,y,w,h):
    ink=C['ink']; green=C['green']; pale='#eceadd'
    def r(a,b,c,d,fill=pale):A.rect(x+a*w,y+b*h,c*w,d*h,fill,ink,r=4,sw=2)
    def l(a,b,c,d):A.line(x+a*w,y+b*h,x+c*w,y+d*h,ink,2)
    if kind=='book':
        A.polygon([(x,y+h*.1),(x+w*.5,y+h*.2),(x+w*.5,y+h*.95),(x,y+h*.8)],pale,ink)
        A.polygon([(x+w*.5,y+h*.2),(x+w,y+h*.1),(x+w,y+h*.8),(x+w*.5,y+h*.95)],C['card'],ink)
        l(.07,.3,.42,.4);l(.07,.5,.42,.6);A.ellipse(x+w*.67,y+h*.3,w*.16,w*.16,green,ink)
    elif kind=='dual':
        r(0,.08,.43,.84);r(.57,.08,.43,.84);l(.07,.3,.35,.3);l(.07,.5,.35,.5);A.arrow(x+w*.45,y+h*.5,x+w*.55,y+h*.5)
    elif kind=='hybrid':
        r(0,.05,.3,.9);l(.4,.9,1,.9);l(.48,.25,.9,.85);A.ellipse(x+w*.7,y+h*.24,w*.14,w*.14,green,ink);A.arrow(x+w*.33,y+h*.5,x+w*.45,y+h*.5)
    else:
        r(0,.05,1,.9,C['card'])
        if kind=='split':r(.05,.15,.32,.7);r(.44,.15,.51,.7,green);A.arrow(x+w*.35,y+h*.5,x+w*.49,y+h*.5)
        elif kind=='experiment':r(.05,.15,.64,.7,green);r(.75,.25,.2,.5)
        elif kind=='notebook':
            for i in range(4):r(.05+i*.23,.2,.2,.6,green if i==2 else pale)
        else:r(.05,.2,.2,.6);r(.31,.15,.38,.7,green);r(.75,.2,.2,.6);A.arrow(x+w*.26,y+h*.5,x+w*.3,y+h*.5)

concept=OUT/'future-layout-concepts.png'
if concept.exists():
    A.rect(120,3255,1700,1240,C['card'],C['line'],r=20)
    A.chip(147,3275,'未来概念画面 · 非已实现功能',True)
    A.img('future-layout-concepts.png',145,3335,1650,1100)
    A.text(147,4453,'上排：并排／实验优先／双屏；下排：记录本／工作台／虚实。',28,C['muted'])
    for i,(kind,title,desc,status) in enumerate(layouts):
        x=1870;y=3255+i*175;cw=1210
        A.rect(x,y,cw,159,C['card'],C['line'],r=15)
        mini(kind,x+20,y+37,220,83)
        A.text(x+270,y+26,title,34,bold=True);A.text(x+270,y+91,desc,28,C['muted'])
        A.chip(x+1010,y+24,status,status!='已实现')
    A.wrap(120,4525,'布局的价值来自关联：段落、器材、变量、结果和记录能互相定位；实体实验台还需验证硬件与测量链路。',2940,29)
else:
    for i,(kind,title,desc,status) in enumerate(layouts):
        if i<4:x=120+i*755;y=3260;cw=695
        else:x=120+(i-4)*1005;y=3650;cw=950
        A.rect(x,y,cw,345,C['card'],C['line'],r=18)
        A.diagram(kind,x+22,y+18,cw-44,150)
        A.text(x+25,y+180,title,35,bold=True)
        A.text(x+25,y+238,desc,28,C['muted']);A.chip(x+25,y+286,status,status!='已实现')
    A.wrap(120,4058,'价值来自段落、器材、变量、结果和记录的互相定位。真实实验台需要另行验证硬件与测量链路。',2940,32)
# Possible products and themes
A.oy=1050
A.section('05',4215,'从一种效果，走向多种用途','产品方向与跨主题迁移均为后续思考；当前没有把这些方向都做成产品。')
products=[('个人学习平台','读教材、做实验、记疑问与进度。'),('教师演示平台','编排过程、收集预测、共同讨论证据。'),('实验记录工具','保存多次条件、图表与自己的结论。'),('互动内容制作工具','作者绑定段落、模型、语音与镜头。'),('产品原理说明','从整体进入部件，操作并理解内部机制。'),('展览与科普装置','主题大屏配可操作工作台，逐步探索。'),('虚实结合实验室','教材引导实物操作，数据回到解释。'),('连续主题体验库','积累成熟场景与主题表达规则，按需求复用。')]
for i,(title,desc) in enumerate(products):
    x=120+(i%2)*1510;y=4368+(i//2)*115
    A.text(x,y,f'{i+1:02d}',27,C['copper'],True);A.text(x+62,y-3,title,34,bold=True);A.text(x+62,y+47,desc,28,C['muted'])
A.line(120,4842,3080,4842)
themes=[('物理／工程','公式、器材、参数、测量'),('编程／算法','代码、数据、执行过程'),('音乐／节奏','乐谱、节拍、声音比较'),('历史／叙事','史料、地图、时间线'),('创作／审美','作品、关系、表达变化'),('流程／决策','输入、规则、约束、路径')]
for i,(title,desc) in enumerate(themes):
    x=120+(i%3)*1005;y=4885+(i//3)*110
    A.text(x,y,title,31,bold=True);A.text(x,y+49,desc,27,C['muted'])
# Reuse
A.section('06',5155,'以后复用什么，怎样重新开始','先有具体用户与真实问题，再从已有成果中挑选适合的部分。')
reuse=[('实现层','三维书页、镜头与导航；实验状态；语音导演；文字放大与连续阅读；暂停和恢复。'),('方法层','明确理解目标；选择合适载体；安排章节依赖；统一表达规则；预测、验证、解释和迁移。'),('产品层','教材与实验联动、双屏协作、实验记录、作者工具和虚实结合等方向，按新需求检验。')]
for i,(title,body) in enumerate(reuse):
    x=120+i*1005
    A.rect(x,5308,950,268,C['card'],C['line'],r=18);A.text(x+28,5335,title,39,bold=True);A.wrap(x+28,5402,body,888,31,C['muted'])
A.text(120,5628,'重新启用的顺序',33,bold=True)
A.wrap(475,5628,'具体场景 → 一个完整理解过程 → 用户试用 → 第二个主题 → 提取真正共用的组件与内容配置。',2580,32)
A.text(120,5710,'可选增强',31,C['copper'],True)
A.wrap(350,5706,'按段点播 · 公式实时代入 · A/B实验对照 · 目标挑战与反馈 · 纸张和动作声音 · 持久进度',2700,31)
# Closure and limits
A.line(120,5836,3080,5836)
A.text(120,5880,'阶段结论：当前样章足够支持本轮研究理解，保留为未来产品的研究基础。',43,bold=True)
A.wrap(120,5964,'已实现与已验证：本地三课独立样章、交互与状态流程；通过测试不等于真实学习效果。未来设想：新布局、新产品、更多主题和可选增强，需要按具体需求另行实现与验证。',2940,31,C['muted'])
A.wrap(120,6086,'边界：使用明确的理想化物理模型；尚未完成真实触屏、手机GPU、完整读屏与受众学习效果试验。未移植原作发布代码、运行素材或配音；实拍均来自本项目样章；未来视觉为AI概念图。',2940,29,C['muted'])
A.text(120,6242,'灵感来源：Techartist · Every Joule   https://iamtechartist.com/every-joule/',27,C['muted'])
A.text(120,6291,'本地独立研究 003 · v4.4 · 2026-10-26      阅读详细网页可查看方法、来源、验证记录与后续方向。',26,C['muted'])
A.svg.append('</svg>')
OUT.mkdir(parents=True,exist_ok=True)
(OUT/'understanding-atlas.svg').write_text('\n'.join(A.svg),encoding='utf-8')
A.im.save(OUT/'understanding-atlas.png',optimize=True)
print(json.dumps({'width':W,'height':H,'png':str(OUT/'understanding-atlas.png'),'svg':str(OUT/'understanding-atlas.svg'),'text_characters':sum(map(len,A.texts)),'font':'Microsoft YaHei','renderer':'Pillow'},ensure_ascii=False))
