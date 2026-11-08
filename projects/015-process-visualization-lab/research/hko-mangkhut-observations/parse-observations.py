"""Decode retained official source files; never interpolate missing observations."""
from pathlib import Path
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
import csv, hashlib, html, json, re, xml.etree.ElementTree as ET

BASE = Path(__file__).resolve().parent
HKT = timezone(timedelta(hours=8))
UTC = timezone.utc
MAIN_START = '2018-09-16T00:00:00Z'
MAIN_END = '2018-09-16T12:00:00Z'
NOAA_URL = 'https://www.ncei.noaa.gov/access/services/data/v1?dataset=global-hourly&stations=45007099999&startDate=2018-09-14T16:00:00Z&endDate=2018-09-17T15:59:59Z&format=json&includeAttributes=true'
RSS_URL = 'https://rss.weather.gov.hk/rss/CurrentWeather.xml'

def iso(d):
    return d.astimezone(UTC).isoformat(timespec='seconds').replace('+00:00', 'Z')

def write(name, obj):
    (BASE / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def archive_url(timestamp):
    return 'https://app.data.gov.hk/v1/historical-archive/get-file?url=https%3A%2F%2Frss.weather.gov.hk%2Frss%2FCurrentWeather.xml&time=' + timestamp

def rain_window(text, published):
    m = re.search(r'Between (\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)? and (\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)', text)
    if not m:
        raise ValueError('Unsupported explicit rainfall window: ' + text[:160])
    h1, m1, mer1, h2, m2, mer2 = m.groups()
    h1, h2 = int(h1) % 12, int(h2) % 12
    if (mer1 or mer2) == 'p.m.': h1 += 12
    if mer2 == 'p.m.': h2 += 12
    local_pub = published.astimezone(HKT)
    end = local_pub.replace(hour=h2, minute=int(m2), second=0, microsecond=0)
    if end > local_pub: end -= timedelta(days=1)
    start = end.replace(hour=h1, minute=int(m1))
    if start >= end: start -= timedelta(days=1)
    assert end - start == timedelta(hours=1), (text, start, end)
    return start, end

rain = {}
no_table = []
for path in sorted((BASE / 'raw-rss').glob('*.xml')):
    root = ET.fromstring(path.read_bytes())
    item = root.find('./channel/item')
    published = parsedate_to_datetime(item.findtext('pubDate'))
    desc = item.findtext('description')
    match = re.search(r'Between.+?rainfall recorded.+?</table>', desc, re.S | re.I)
    if not match:
        no_table.append(path.name)
        continue
    section = match.group()
    clean = ' '.join(html.unescape(re.sub('<[^>]*>', ' ', section)).split())
    start, end = rain_window(clean, published)
    values = {}
    for cells in re.findall(r'<tr>(.*?)</tr>', section, re.S):
        cols = re.findall(r'<td[^>]*>(.*?)</td>', cells, re.S)
        if len(cols) != 2: raise ValueError(path.name + ': unexpected rain table row')
        district, raw_value = [html.unescape(re.sub('<[^>]*>', '', v)).strip() for v in cols]
        v = re.fullmatch(r'(\d+)(?: to (\d+))?\s*mm[;.]?', raw_value)
        if not v: raise ValueError(path.name + ': unsupported rain value ' + raw_value)
        low, high = int(v.group(1)), int(v.group(2) or v.group(1))
        assert low <= high
        values[district] = {'lowerMm': low, 'upperMm': high, 'sourceText': raw_value}
    timestamp = path.name[:13]
    source = {'snapshotTimestampHkt': timestamp, 'publishedAtUtc': iso(published), 'file': 'raw-rss/' + path.name,
              'url': archive_url(timestamp), 'sha256': sha(path)}
    key = iso(end)
    if key in rain:
        assert rain[key]['districts'] == values, 'Revision needs explicit handling: ' + path.name
        rain[key]['sourceSnapshots'].append(source)
    else:
        rain[key] = {'timeUtc': key, 'windowStartUtc': iso(start), 'windowEndUtc': key,
                     'windowMinutes': 60, 'publishedAtUtc': iso(published), 'sourceWindowText': clean.split('rainfall')[0].strip(),
                     'districts': values, 'sourceSnapshots': [source]}

rain_records = []
for r in sorted(rain.values(), key=lambda r:r['timeUtc']):
    value = r['districts'].get('Eastern District')
    rain_records.append({k:v for k,v in r.items() if k != 'districts'} | {
        'area': 'Eastern District', 'areaZh': '东区', 'lowerMm': value['lowerMm'] if value else None,
        'upperMm': value['upperMm'] if value else None, 'sourceText': value['sourceText'] if value else None,
        'status': 'reported' if value else 'district-not-listed',
        'missingReason': None if value else '该原始小时雨表未列出东区；不能据此填为 0。'})

raw = json.loads((BASE / 'noaa-airport-sample.json').read_text(encoding='utf-8'))
wind_records, special_records = [], []
for index, r in enumerate(raw):
    if r['REPORT_TYPE'] not in ('FM-15', 'FM-16'): continue
    metar = re.sub(r'^MET\d{3}', '', r.get('REM', ''))
    m = re.search(r'\b(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT\b', metar)
    if not m: raise ValueError('Missing/unsupported native wind group: ' + str(index))
    direction, speed, gust = m.groups()
    wnd = r['WND'].split(',')
    ms = None if wnd[3] == '9999' else int(wnd[3])/10
    kt = int(speed)
    assert ms is None or abs(kt * 0.5144444444444445 - ms) < 0.11
    record = {'timeUtc': r['DATE'] + 'Z', 'windSpeedKt': kt, 'windSpeedKmh': round(kt*1.852,3),
        'windSpeedMs': ms, 'windDirectionDeg': None if direction == 'VRB' else int(direction),
        'gustSpeedKt': int(gust) if gust else None,
        'gustSpeedKmh': round(int(gust)*1.852,3) if gust else None,
        'meanPeriodMinutes': 10, 'reportType': 'METAR' if r['REPORT_TYPE']=='FM-15' else 'SPECI',
        'isdReportType':r['REPORT_TYPE'], 'qualityCode':wnd[4], 'directionQualityCode':wnd[1],
        'rawWindGroup':m.group(), 'rawWnd':r['WND'], 'rawMetar':metar,
        'sourceRecordIndex':index, 'status':'reported' if wnd[4] in ('0','1','4','5','9') else 'quality-flagged'}
    (wind_records if r['REPORT_TYPE']=='FM-15' else special_records).append(record)
wind_records.sort(key=lambda x:x['timeUtc'])
special_records.sort(key=lambda x:x['timeUtc'])
assert len({r['timeUtc'] for r in wind_records}) == len(wind_records)
known = {r['timeUtc'] for r in wind_records}
missing = []
dt = datetime(2018,9,14,16,tzinfo=UTC)
while dt < datetime(2018,9,17,16,tzinfo=UTC):
    if iso(dt) not in known: missing.append(iso(dt))
    dt += timedelta(minutes=30)

wind = {
  'id':'hko-vhhh-metar-noaa-isd', 'labelZh':'香港国际机场风速', 'kind':'station-observation',
  'station':{'name':'HONG KONG INTERNATIONAL', 'nameZh':'香港国际机场', 'icao':'VHHH', 'isdId':'45007099999',
             'latitude':float(raw[0]['LATITUDE']), 'longitude':float(raw[0]['LONGITUDE']), 'elevationM':float(raw[0]['ELEVATION'])},
  'observationProvider':'Hong Kong Observatory / VHHH', 'archiveProvider':'NOAA NCEI Global Hourly (ISD)',
  'meanPeriodMinutes':10, 'nominalReportIntervalMinutes':30, 'displayUnit':'km/h', 'nativeUnit':'kt',
  'meanPeriodNoteZh':'METAR/SPECI 按 ICAO 标准采用 10 分钟平均风；若期间发生显著不连续变化，平均窗口可缩短。报文名义每半小时一次，不能称为每 10 分钟观测序列。',
  'decodingNoteZh':'windSpeedKt 从原始 METAR 的 KT 风组读取；windSpeedKmh = kt × 1.852。windSpeedMs 是 ISD WND 的 0.1 m/s 编码解码值，存在单位换算取整差异。阵风未报为 null。',
  'gapPolicyZh':'缺失的半小时记录不插值、不前值补齐；图线跨缺报必须断开。机场风代表机场，不能当作鲗鱼涌或全香港风。',
  'sourceUrl':NOAA_URL, 'sourceFile':'noaa-airport-sample.json', 'sourceSha256':sha(BASE/'noaa-airport-sample.json'),
  'records':wind_records, 'specialRecords':special_records, 'missingRoutineTimesUtc':missing,
  'mainWindowMissingRoutineTimesUtc':[x for x in missing if MAIN_START <= x <= MAIN_END],
  'qualityCodeNotes':{'1':'Passed all quality control checks'},
}
rain_data = {
 'id':'hko-eastern-district-hourly-rain-range','labelZh':'东区过去一小时雨量范围','kind':'district-observation-range',
 'area':{'name':'Eastern District','nameZh':'东区','scopeZh':'地区内雨量观测范围，并非鲗鱼涌单站值；原 RSS 不提供本次范围所用站点清单。'},
 'observationProvider':'Hong Kong Observatory','archiveProvider':'DATA.GOV.HK Historical Archive',
 'unit':'mm','accumulationMinutes':60,'nominalWindowEndIntervalMinutes':60,
 'interpretationZh':'lowerMm / upperMm 为原表的下限和上限。单值 3 mm 保留为 3—3；未列东区时为 null，不取区间中点、不补 0。',
 'timeNoteZh':'timeUtc 等于累计窗口结束时间；原报文时间为 HKT（UTC+8）。publishedAtUtc 为发布时间，snapshotTimestampHkt 是政府归档时间，三者不同。用于历史观测时间对照，并不表示当时即时可获得。',
 'sourceUrl':RSS_URL, 'sourceArchiveApi':'https://data.gov.hk/en/help/api-spec',
 'records':rain_records, 'rawSnapshotCount':92, 'distinctRainWindowCount':len(rain_records),
 'snapshotsWithoutRainTable':no_table,
}
output = {
 'schemaVersion':1,'eventId':'2018-mangkhut-hong-kong','generatedAtUtc':iso(datetime.now(UTC)),
 'requestedRangeHkt':{'start':'2018-09-15T00:00:00+08:00','endExclusive':'2018-09-18T00:00:00+08:00'},
 'recommendedReplayRangeUtc':{'start':MAIN_START,'end':MAIN_END},
 'wind':wind,'rain':rain_data,
 'limitationsZh':[
  '各层按实际观测时间/累计窗口对照；高频卫星不能使地面资料具有相同采样频率。',
  '机场 METAR 缺报保留为缺失；主窗 08:00—10:00 HKT 没有这些半小时原始记录。',
  '东区雨是小时地区范围，不是单站瞬时雨强；17:45—18:45 HKT 原表未列东区。',
  'NOAA SYNOP AA1 的部分非零雨量带 condition=3，尚有语义疑点，因此不纳入推荐雨序列。',
  '风、雨、潮位可共享时间轴，但分属不同空间范围，不能据此给出逐点因果或损失推断。'],
 'sources':[
  {'label':'NOAA NCEI Global Hourly','url':'https://www.ncei.noaa.gov/products/land-based-station/integrated-surface-database'},
  {'label':'ISD station history','url':'https://www.ncei.noaa.gov/pub/data/noaa/isd-history.csv'},
  {'label':'HKO METAR/SPECI decoding','url':'https://www.hko.gov.hk/en/aviat/decode_metar.htm'},
  {'label':'ICAO Annex 3 Appendix 3 §4.1.3 averaging period','url':'https://applications.icao.int/tools/ATMiKIT/story_content/external_files/story_content/external_files/Annex%203_cons.pdf'},
  {'label':'Hong Kong AIP GEN 3.5 (current operational context, not 2018 runway metadata)','url':'https://www.ais.gov.hk/eaip_20261001/2026-09-03-000000/html/eAIP/VH-GEN-3.5-en-US.html'},
  {'label':'DATA.GOV.HK Historical Archive API','url':'https://data.gov.hk/en/help/api-spec'},
  {'label':'HKO Mangkhut event report','url':'https://www.hko.gov.hk/en/publica/tc/tc2018/section3_5rpt.html'},
 ]
}
write('hong-kong-wind-rain.json', output)
write('hko-all-district-rain-windows.json', {'records': sorted(rain.values(),key=lambda r:r['timeUtc']), 'notes':'Raw numeric table decoding; do not sum overlapping windows or fill absent districts.'})
station_rows = list(csv.DictReader((BASE/'noaa-isd-history.txt').read_text(encoding='utf-8').splitlines()))
write('noaa-station-metadata.json', {'sourceUrl':'https://www.ncei.noaa.gov/pub/data/noaa/isd-history.csv','sourceFileSha256':sha(BASE/'noaa-isd-history.txt'),'stations':[r for r in station_rows if r['USAF']=='450070' and r['WBAN']=='99999'],'noteZh':'当前站表的坐标为三位小数；2018 各报文坐标另保留。当前站表不能证明所有历史报文均位于现站。'})
write('raw-file-integrity.json',{'files':[{'path':p.relative_to(BASE).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(BASE.glob('raw-rss/*.xml'))] + [{'path':n,'bytes':(BASE/n).stat().st_size,'sha256':sha(BASE/n)} for n in ['noaa-airport-sample.json','noaa-isd-history.txt','isd-format-document.pdf','archive-20180915-17-hko.json','hko-rss-versions.json']]})
print(json.dumps({'windRecords':len(wind_records),'specialRecords':len(special_records),'rainWindows':len(rain_records),'mainWindRecords':len([r for r in wind_records if MAIN_START<=r['timeUtc']<=MAIN_END]),'mainRainRecords':len([r for r in rain_records if MAIN_START<=r['timeUtc']<=MAIN_END]),'missingMainWindTimes':wind['mainWindowMissingRoutineTimesUtc']},ensure_ascii=False))
