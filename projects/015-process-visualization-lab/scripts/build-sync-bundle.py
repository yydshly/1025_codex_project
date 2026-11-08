"""Package original observations and calibrated satellite frames without time interpolation."""
from pathlib import Path
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))

weather = read('research/hko-mangkhut-observations/hong-kong-wind-rain.json')
tide = read('research/real-events/hong-kong-sea-level/quarry-bay-mangkhut-2018-hourly.json')
cloud_directory = ROOT / 'research/high-frequency-clouds/wide-v10'
cloud = json.loads((cloud_directory / 'himawari-b13-manifest.json').read_text(encoding='utf-8'))
assert len(cloud['frames']) == 72, 'Do not package a partially processed observation sequence.'
wind = weather['wind']
rain = weather['rain']
frames = []
image_directory = ROOT / 'app/assets/events/himawari8-b13-wide'
image_directory.mkdir(parents=True, exist_ok=True)
for original in cloud['frames']:
    source = cloud_directory / original['url']
    target = image_directory / source.name
    if not source.exists():
        source = target
    if source.resolve() != target.resolve():
        shutil.copyfile(source, target)
    frame = dict(original)
    frame['url'] = 'assets/events/himawari8-b13-wide/' + source.name
    frame['brightnessTemperatureData']['url'] = '../../research/high-frequency-clouds/wide-v10/' + original['brightnessTemperatureData']['url']
    frames.append(frame)

bundle = {
    'schemaVersion': 1, 'eventId': 'jma-1822',
    'startUtc': '2018-09-16T00:00:00Z', 'endUtc': '2018-09-16T12:00:00Z',
    'clockStepMinutes': 10,
    'timeNote': 'Historical observation-time alignment, not simultaneous acquisition or original publication availability.',
    'clouds': {
        'label': 'JMA/NOAA 葵花八号 AHI B13 红外亮温', 'projection': cloud['projection'],
        'bbox': cloud['bbox'], 'maxAgeMinutes': 0, 'frames': frames, 'missingTimesUtc': cloud.get('missingTimesUtc', []),
        'source': {'url': cloud['source'], 'credit': cloud['credit'], 'licenseNote': cloud['licenseNote'], 'formatGuide': cloud['formatGuide']},
        'processing': cloud['processing'], 'temporalType': cloud['temporalType']
    },
    'series': [
        {'id': 'wind', 'label': '机场平均风速', 'kind': 'scalar', 'unit': 'km/h', 'zeroBaseline': True,
         'station': {'label': '香港国际机场', 'id': 'VHHH', 'lat': wind['station']['latitude'], 'lon': wind['station']['longitude']},
         'measurementLabel': '10分钟平均风 · 每半小时报文', 'measurementNote': wind['meanPeriodNoteZh'], 'maxAgeMinutes': 30,
         'source': {'url': wind['sourceUrl'], 'sha256': wind['sourceSha256'], 'label': 'HKO机场报文 / NOAA NCEI存档'},
         'samples': [dict(r, value=r['windSpeedKmh']) for r in wind['records']]},
        {'id': 'rain', 'label': '东区一小时雨量', 'kind': 'range', 'unit': 'mm', 'zeroBaseline': True,
         'station': {'label': '东区 · 地区内测站范围', 'id': 'Eastern District'},
         'measurementLabel': '上下限范围 · 不取中点', 'measurementNote': rain['timeNoteZh'], 'maxAgeMinutes': 60,
         'source': {'url': 'https://data.gov.hk/en/help/api-spec', 'label': '香港天文台 / DATA.GOV.HK历史RSS'},
         'samples': [dict(r, lower=r['lowerMm'], upper=r['upperMm'], sourceUrl=r['sourceSnapshots'][0]['url']) for r in rain['records']]},
        {'id': 'seaLevel', 'label': '鲗鱼涌海水位', 'kind': 'scalar', 'unit': 'm', 'zeroBaseline': False,
         'station': dict(tide['station'], label='鲗鱼涌潮位站'),
         'measurementLabel': '整点观测 · UHSLC站点零点', 'measurementNote': tide['measurement']['aggregationZh'], 'maxAgeMinutes': 60,
         'datum': tide['measurement']['verticalDatum'],
         'source': dict(tide['source'], url=tide['source']['downloadUrl']),
         'samples': [dict(r, value=r['seaLevelM']) for r in tide['records']]}
    ]
}
target = ROOT / 'app/data/mangkhut-synchronized.json'
target.write_text(json.dumps(bundle, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'frames': len(frames), 'series': {s['id']: len(s['samples']) for s in bundle['series']}, 'output': str(target)}, ensure_ascii=False))
