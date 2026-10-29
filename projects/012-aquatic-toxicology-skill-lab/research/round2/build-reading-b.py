from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
APP = ROOT.parent.parent / 'app/data'
trial = json.loads((APP / 'retrieval-trial.json').read_text(encoding='utf-8'))
records = {r['id']: r for r in trial['records']}
DATE = '2026-10-29'
UNKNOWN = '未知：本次可读材料未提供，全文方法未核实。'

def log(url, action, result, parts='', locator=''):
    return dict(url=url, action=action, result=result, readParts=parts, locator=locator, accessedAt=DATE)

def finding(statement, url, locator, strength='作者报告；摘要级，未独立复核原始数据'):
    return dict(statement=statement, sourceUrl=url, locator=locator, strength=strength)

def base(id, prior, kind='journal_article', eligibility='direct'):
    r=records[id]
    return dict(id=id, title=r['title'], doi=r['doi'], priorId=prior, documentType=kind,
        accessLevel='abstract', eligibility=eligibility, independence='',
        design={k:UNKNOWN for k in ['model','stage','particles','chemicals','doses','duration','groups','replication','statistics']},
        findings=[], limitations=[], firstRoundComparison='', readingLog=[], sources=[],
        fullTextAttempt={'status':'not_obtained','reason':''}, decisionRationale='')

def add_journal_access(r, pmid, pii=None, oa=None):
    pub='https://pubmed.ncbi.nlm.nih.gov/'+pmid+'/'
    r['sources'].append({'url':pub,'type':'PubMed记录中的作者摘要','readScope':'abstract'})
    r['readingLog'].append(log(pub,'核对题名、DOI、作者、出版日期，逐句重读摘要','成功；仅摘要，不是全文审读。','Citation / Authors / Affiliations / Abstract / COI','Abstract'))
    if pii:
        url='https://www.sciencedirect.com/science/article/pii/'+pii
        r['sources'].append({'url':url,'type':'出版社原文入口','readScope':'not_accessible'})
        r['readingLog'].append(log('https://doi.org/'+r['doi'],'尝试DOI出版入口','web工具报URL不可访问；未读取正文。'))
        r['readingLog'].append(log(url,'从PubMed全文链接确认PII后尝试ScienceDirect','PubMed linkinghub与ScienceDirect均返回403 Forbidden；未读取正文、图表或补充材料。'))
        r['fullTextAttempt']['reason']='出版社入口在本次环境返回403；未取得正文与补充材料。'
    if oa:
        r['readingLog'].append(log('https://api.openalex.org/works/'+oa,'检查合法开放副本入口','官方API响应：closed，未列开放全文；仅为当次元数据状态，不能证明世界上没有作者稿。','open_access / locations','见 access-b.json 的实际响应状态、时间和哈希'))
    return pub

papers=[]

r=base('Tca0275c05',None,'doctoral_thesis','thesis_context')
u='https://theses.fr/2020BORD0036'
r['authors']='Bettie Cormier'
r['year']=2020
r['independence']='与2019年Cormier等Frontiers研究同作者、同EPHEMARE相关研究背景；未读到学位论文章节，无法确认哪些数据重叠。既不判定已重复，也不作为额外独立复制计数。'
r['design'].update(model='Danio rerio；论文含多个实验分支',stage='早期、幼鱼及成鱼；部分跟踪F1',particles='不同粒径/聚合物人工微塑料及环境微塑料，具体分支参数未知',chemicals='模型污染物PFOS、BaP、BP3；不是把三者视为一种PFAS',duration='摘要称营养暴露从幼体跟踪至5月龄；各PFOS分支时长未核实',groups='有直接/食物途径、人工吸附/环境颗粒等分支；PFOS专属对照未知')
r['findings']=[finding('官方摘要确认包含PFOS吸附及斑马鱼暴露分支；急性试验与长期食物暴露的结果不同。',u,'Résumé，第3–7句；官方页面原读位置64–67行'),finding('生长、生殖和F1行为是整篇论文汇总结果，摘要未把每项变化单独对应到PFOS组。',u,'Résumé，结果和结尾段；原读位置67–69行','分析判读：汇总摘要不足以完成PFOS特异归因')]
r['limitations']=['实际只读官方法语摘要与学位元数据，未读博士正文或附录。','不能把多化学物、多实验分支的总结果全部归因PFOS；剂量、鱼缸重复和统计模型未知。','与候选Frontiers2019潜在数据重叠未解除，不增加独立实验证据计数。']
r['firstRoundComparison']='第一轮没有此论文。它提示慢性食物途径及早期/长期差异已有前作，须继续查章节与期刊版本；当前只能作为前作和研究设计线索。'
r['readingLog']=[log(u,'从HAL号与NNT核对博士身份并逐句阅读官方摘要','成功：Bettie Cormier，Bordeaux博士，2020-06-08答辩。','身份、学位、Résumé（法语）','Résumé'),log('https://theses.hal.science/tel-03003489','尝试大学论文开放库正文','页面显示Anubis Access Denied；未绕过挑战。'),log('https://api.archives-ouvertes.fr/search/?q=halId_s:tel-03003489&fl=title_s,fileMain_s,uri_s,authFullName_s&wt=json','查询HAL官方元数据的公开下载位置','命令行官方API返回200；作者/题名匹配，fileMain指向HAL document。','元数据，不是正文','response.docs[0]'),log('https://theses.hal.science/tel-03003489/document','尝试元数据提供的公开文件','web工具报不可访问；未取得正文。'),log('https://api.openalex.org/works/W7149268709','查询开放副本位置','显示green，指向theses.fr/2020BORD0036/document；开放标签不等于已读到文件。','open_access / locations','见 access-b.json'),log('https://theses.fr/2020BORD0036/document','尝试OpenAlex列出的官方文件','web工具报不可访问；未读取正文。')]
r['sources']=[{'url':u,'type':'法国官方博士论文目录','readScope':'官方摘要及学位元数据'},{'url':'https://theses.hal.science/tel-03003489','type':'论文开放库','readScope':'access_denied'}]
r['fullTextAttempt']['reason']='HAL正文被Anubis拒绝，官方目录的document入口本次亦不可访问；虽有green OA标签，正文未取得。'
r['decisionRationale']='保留为学位研究/前作背景，等待PFOS章节和与期刊的数据映射；不进入直接PFAS效应的独立重复计数。'
papers.append(r)

r=base('Tf1f8a3ceb',None)
u=add_journal_access(r,'32416398','S0045653520312339','W3025718754')
r['authors']='Huilin Yang et al.';r['year']=2020
r['independence']='与Jian2024部分作者重叠，但阶段、时长及年份不同；没有数据证明同队列。作为另一篇研究报告，不声称独立实验室复制。'
r['design'].update(model='Danio rerio',stage='6 dpf幼鱼开始暴露',particles='PS微塑料；尺寸未知',chemicals='F-53B（6:2 Cl-PFAES）',duration='7天',groups='F-53B、PS-MPs及共暴露；具体对照和浓度矩阵未核实')
r['findings']=[finding('作者报告PS促进F-53B吸附并降低其生物可利用度及鱼体累积，但共暴露仍出现炎症与氧化应激。',u,'Abstract，吸附/累积及SOD/lysozyme句（原读248–251行）'),finding('摘要给出NF-κB及炎症标记共同变化；它是机制线索，不能据此确认阻断或救援验证。',u,'Abstract，NF-κB及结尾句（原读250–251行）','作者报告+分析限定；非已验证因果链')]
r['limitations']=['剂量、粒径、鱼缸/生物学重复、统计模型及补充数据未取得。','MDA/IgM在共暴露显著、单一组不显著，不等于两处理差值或交互项已显著。','未见NF-κB干预方法，不能确认其因果必要性。']
r['firstRoundComparison']='新增直接反例强化第一轮“不能统一写增强”的结论，并把问题细化：低累积不代表低毒性，载体/吸附、体内剂量和终点效应必须分别编码。与P01成鱼累积不变并不直接矛盾。'
r['decisionRationale']='斑马鱼PS与明确PFAS共暴露，保留摘要级直接证据；未完成全文方法质量审查。'
papers.append(r)

r=base('T1afa6b9d1','P08')
u=add_journal_access(r,'41887838','S1001074225006618','W4415043628')
r['authors']='Sijie Tian et al.';r['year']=2026
r['independence']='与第一轮P08相同DOI，是同一报告重读，不是新实验。'
r['design'].update(model='Danio rerio',stage='成鱼（题名）',particles='PS微塑料；粒径未知',chemicals='PFOA',duration='28天',groups='各单独暴露及共暴露；完整对照和剂量矩阵未核实')
r['findings']=[finding('作者报告共暴露较单暴露的肠、肝损伤更重，并伴菌群及脂代谢改变。',u,'Abstract，结果及转录组段（原读241–243行）'),finding('摘要把肠屏障、血LPS和肝脂质紊乱联系起来；本次没有读到干预证据，不能据此确证肠—肝因果链。',u,'Abstract，LPS及讨论结尾句（原读241–243行）','作者解释+分析限定')]
r['limitations']=['未取得剂量、粒径、暴露实测、重复/随机化、方法和补充材料。','比单暴露更严重不自动满足协同判定；未核对正式交互模型。','脂肪肝联系是作者解释，不能外推为人类疾病风险定量。']
r['firstRoundComparison']='第一轮P08判断保持，来源和阅读范围再确认；没有新增全文依据，不上调机制可信度。'
r['decisionRationale']='明确PS/PFOA斑马鱼共暴露；保留直接摘要证据，标记与第一轮重复记录。'
papers.append(r)

r=base('T38e5785cf','P09')
u=add_journal_access(r,'40795757','S0166445X2500298X','W4413113461')
r['authors']='Wei Wu; Ruixuan Li; Zhiqiang Zhang; Gang Liu; Yingxue Sun; Chun Wang';r['year']=2025
r['independence']='与第一轮P09同一DOI。与P05共享Ruixuan Li、Yingxue Sun、Chun Wang及机构和PE/PFOA主题；无队列/数据标识可比，不能认定两次独立复制，也不能直接判定重复发表。'
r['design'].update(model='Danio rerio；模拟循环水养殖的aquatic microcosm',stage='成鱼',particles='PE微塑料及PE纳米塑料；尺寸未知',chemicals='PFOA',duration='摘要比较第7天及第28天',groups='PE-MPs/PFOA、PE-NPs/PFOA及单独暴露；完整组表未知')
r['findings']=[finding('摘要称鳃和肝的综合毒性从第7天协同转为第28天拮抗；此处保留作者标签，参考模型未核实。',u,'Abstract，time-dependent句（原读242行）'),finding('肠病理可同时加重；它与鳃/肝综合指标的交互标签属于不同终点，不能相互替代。',u,'Abstract，villi/goblet cell句（原读243行）','作者报告+跨终点分析限定')]
r['limitations']=['全文未取得；浓度、粒径、鱼缸重复、IBR或其他交互方法均未核实。','“环境相关浓度”是作者表述，本次没有暴露实测或现场分布检验。','不能把菌属变化直接解释成已验证感染率增加；摘要未给感染挑战方法。','与P05的队列独立性仍未知，不能增加重复计数。']
r['firstRoundComparison']='维持第一轮时间/组织条件性；进一步标出与P05的作者重叠和不可直接对比的终点边界，未形成新的矛盾解决或因果证明。'
r['decisionRationale']='直接PE/PFOA斑马鱼研究；只纳入作者摘要报告，原始方法和数据待核。'
papers.append(r)

r=base('T401389cfc','P06')
u=add_journal_access(r,'41706329',None,'W7130384165')
spring='https://link.springer.com/article/10.1007/s10646-025-03017-0'
r['authors']='Santhanam Sanjai Dharshan et al.';r['year']=2026
r['independence']='与第一轮P06同DOI，不增加新研究；其他研究的数据独立性未单独核验。'
r['design'].update(model='Danio rerio',stage='幼鱼',particles='PET微/纳塑料；实际粒径分布未知',chemicals='PFOA',doses='PET 250 μg/L或2.5 mg/L；PFOA 20或200 μg/L（作者摘要）',groups='摘要说明高/低剂量共暴露；单暴露和对照完整分组表未取得')
r['findings']=[finding('作者报告共暴露涉及氧化应激、炎症、凋亡及低活动等终点，并使用additive toxicity表述。',spring,'Abstract，中段至结尾；原读41–44行'),finding('PET颗粒分布与PFOA内剂量不是同一测量；摘要不足以确认颗粒提高体内PFOA或逐终点相对单暴露的幅度。',spring,'Abstract，PET-MNP buildup及总体解释','分析限定：摘要没有PFOA内剂量和正式加和模型')]
r['readingLog'].append(log(spring,'检查出版社摘要与全文可用性','成功读取摘要、数据可用性和参考文献；页面明确标为subscription preview，有购买/机构登录入口。未读取方法、正文结果或补充材料。','Abstract / Access this article / Data availability / References','Abstract 39–45行；Access this article 46–68行'))
r['sources'].append({'url':spring,'type':'Springer出版社','readScope':'摘要及书目信息；订阅正文不可读'})
r['fullTextAttempt']['reason']='Springer明确为订阅内容预览；本次无机构全文权限，未取得正文或补充材料。'
r['limitations']=['粒径、暴露时长、完整分组、重复、实际PFOA内剂量和统计模型未知。','环境相关剂量及“载体”解释属于作者表述，本次未独立验证。','未核实正式加和模型，不把摘要的additive升级为协同。']
r['firstRoundComparison']='第一轮P06结论不变，新增明确的出版社订阅限制和未提取项目；不会因读到参考文献而升格为部分方法/全文审读。'
r['decisionRationale']='PET/PFOA幼鱼共暴露符合直接范围，保留摘要级；全文方法质量未评估。'
papers.append(r)

r=base('T4c4da766f','P01')
u=add_journal_access(r,'38365036','S0048969724010878','W4391850196')
r['authors']='Minfei Jian et al.';r['year']=2024
r['independence']='与第一轮P01同一DOI，不增加新实验；与Yang2020有部分作者重叠，不能标为独立实验室复制。'
r['design'].update(model='Danio rerio',stage='雌性成鱼',particles='微塑料；摘要未给聚合物/粒径',chemicals='PFOS或F-53B',doses='PFOS或F-53B各10 μg/L；MPs 50 μg/L（作者摘要）',duration='14天',groups='各单独暴露及共暴露；完整对照/重复结构未知')
r['findings']=[finding('作者报告水中游离PFOS/F-53B下降，肝/肠累积未改变；共暴露仍使部分肝免疫和能量代谢终点更差。',u,'Abstract，暴露与结果前半段（原读245–246行）'),finding('菌群关联和功能预测支撑机制假说；未从本次可读材料确认菌群移植、去除或救援实验。',u,'Abstract，16S、功能富集及相关性段（原读246–247行）','作者报告+机制证据分层')]
r['limitations']=['未取得粒径/聚合物、鱼缸重复、暴露实测方法、随机化和交互模型。','功能预测及相关性不是菌群介导的因果证明。','成鱼器官与Yang2020幼鱼整体累积不是同一种比较，不能归因于年龄一个因素。']
r['firstRoundComparison']='P01摘要判断保留。新增Yang2020对照后，结论更明确：游离浓度、器官/整鱼内剂量和生物效应可能不同步，不能画成已确证的统一“载体→升累积→升毒性”链条。'
r['decisionRationale']='直接PFOS/F-53B共暴露研究；作为首轮同一研究重读，不升级全文或独立复制计数。'
papers.append(r)

result={'schemaVersion':1,'reviewDate':DATE,'batch':'B','assignment':'第二轮保留清单原排序7–12','method':'逐条身份核验→合法全文尝试→按实际可读范围提取→与首轮/相关研究对照；这是有界叙述分析，不是meta-analysis。','skillUse':'原库 source_verification_agent 和 synthesis_agent 的核验/条件对照原则经Codex人工适配；未声称运行原生hooks或完整PASS。','accessPolicy':'所有字段仅来自实际可读材料。abstract表示未审读全文方法；未知不是否定原论文做过。OpenAlex开放性只作获取线索，不是第二份独立实验证据。','papers':papers}
(ROOT/'reading-b.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lines=['# 第二轮逐条阅读 B：第7–12条','',f'日期：{DATE}。6条全部核对，但正文获取未成功，阅读范围均为摘要。限制已逐项列出，不把“候选已检查”等同“全文通过”。','',result['method'],'','## 本组对综合的影响','','- Yang2020新增直接证据：累积降低仍可伴炎症，把吸附/内剂量/效应拆开。','- Cormier2020仅作学位背景，汇总摘要不能给PFOS专属因果结论；与2019文章是否同章仍待核。','- P01/P06/P08/P09是首轮同DOI重读；访问和方法限制仍在，不增加新实验数。','- P05/P09部分作者与机构重叠，独立性未知；器官/时间/综合指标不混成单一“协同”。','']
for p in papers:
    lines += [f"## {p['id']} · {p['title']}",'',f"DOI：{p['doi']}；首轮：{p['priorId'] or '新增'}；类型：{p['documentType']}；阅读深度：{p['accessLevel']}；资格：{p['eligibility']}",'',p['decisionRationale'],'','### 设计与比较','']
    lines += [f'- {k}：{v}' for k,v in p['design'].items()]
    lines += ['','### 可追溯证据','']
    for f in p['findings']:lines += [f"- {f['statement']} [{f['locator']}]({f['sourceUrl']})。证据层级：{f['strength']}。"]
    lines += ['','### 局限与首轮对照','']+[f'- {v}' for v in p['limitations']]+['',p['independence'],'',p['firstRoundComparison'],'','### 实际阅读/获取记录','']
    for x in p['readingLog']:lines += [f"- {x['accessedAt']} · [{x['action']}]({x['url']})：{x['result']} 阅读范围：{x['readParts'] or '无正文'}。"]
    lines += ['']
(ROOT/'reading-b.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('Wrote 6 records:', ', '.join(p['id'] for p in papers))
