"""Offline integrity, source-sample radiometry and frame/series agreement checks."""
import bz2
import hashlib
import json
import math
import struct
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[2]
manifest = json.loads((PROJECT / 'app/data/volcano-dynamic.json').read_text(encoding='utf8'))
receipts = json.loads((ROOT / 'download-receipt.json').read_text(encoding='utf-8-sig'))
receipt_by_url = {item['sourceUrl']: item for item in receipts}
assert len(receipts) == 50 and all(item['status'] == 'ok' for item in receipts)
assert len(manifest['frames']) == 25 and manifest['missingTimesUtc'] == []
assert manifest['coverageStatus'] == 'complete'

def hash_file(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()

def independent_decode(file):
    raw = bz2.decompress(file.read_bytes()); blocks = {}; offset = 0
    for n in range(1, 12):
        assert raw[offset] == n
        length = int.from_bytes(raw[offset+1:offset+(5 if n == 10 else 3)], 'little')
        blocks[n] = raw[offset:offset+length]; offset += length
    assert blocks[1][78] == 0
    columns, lines = struct.unpack_from('<HH', blocks[2], 5)
    first = struct.unpack_from('<H', blocks[7], 5)[0]
    proj = struct.unpack_from('<dIIff3d', blocks[3], 3)
    calibration = struct.unpack_from('<HdHHH11d', blocks[5], 3)
    return np.frombuffer(raw, dtype='<u2', offset=offset).reshape(lines, columns), first, proj, calibration

def independent_sample(lon, lat, segment):
    counts, first, projection, calibration = segment
    lon0, cfac, lfac, coff, loff, rs, a, b = projection
    latitude, longitude = math.radians(lat), math.radians(lon-lon0)
    e2 = 1-(b/a)**2
    n = a/math.sqrt(1-e2*math.sin(latitude)**2)
    x, y, z = n*math.cos(latitude)*math.cos(longitude), n*math.cos(latitude)*math.sin(longitude), n*(1-e2)*math.sin(latitude)
    vector_length = math.sqrt((rs-x)**2+y*y+z*z)
    col = round(coff+math.degrees(math.atan2(y,rs-x))*cfac/65536)-1
    global_row = round(loff+math.degrees(math.asin(-z/vector_length))*lfac/65536)
    row = global_row-first
    if not (0 <= row < counts.shape[0]): return None
    band, wavelength_um, bits, error, outside, gain, offset, c0, c1, c2, _, _, _, c, h, k = calibration
    dn = int(counts[row,col]); assert band == 13 and dn not in (error,outside) and dn < 2**bits
    radiance_um = gain*dn+offset
    # Independent micrometre-unit Planck equation (processor converts to SI metre units).
    te = (h*c*1e6/(k*wavelength_um))/math.log1p(2*h*c*c*1e24/(wavelength_um**5*radiance_um))
    tb = c0+c1*te+c2*te*te
    return round(tb*100), dn, global_row, col+1

west,south,east,north = manifest['bbox']; width,height = manifest['width'],manifest['height']
dx,dy = (east-west)/width,(north-south)/height
latitudes = north-(np.arange(height)+.5)*dy
longitudes = west+(np.arange(width)+.5)*dx
lon,lat = np.meshgrid(longitudes,latitudes)
focus = manifest['focus']; radius = manifest['statisticsRegion']['earthRadiusKm']
angular_cos = np.sin(np.deg2rad(lat))*math.sin(math.radians(focus['lat']))+np.cos(np.deg2rad(lat))*math.cos(math.radians(focus['lat']))*np.cos(np.deg2rad(lon-focus['lon']))
neighborhood = np.arccos(np.clip(angular_cos,-1,1))*radius <= 300
row_areas = radius**2*math.radians(dx)*(np.sin(np.deg2rad(latitudes+dy/2))-np.sin(np.deg2rad(latitudes-dy/2)))
areas = np.broadcast_to(row_areas[:,None],(height,width))
previous = None; sampled_pixels = 0; scan_ranges = []
for frame in manifest['frames']:
    time = datetime.fromisoformat(frame['timeUtc'].replace('Z','+00:00'))
    if previous: assert (time-previous).total_seconds() == 600
    previous=time
    image_path=PROJECT/'app'/frame['url']; numeric_path=PROJECT/frame['numericData']['url']
    assert hash_file(image_path)==frame['sha256'] and hash_file(numeric_path)==frame['numericData']['sha256']
    assert image_path.stat().st_size==frame['bytes'] and numeric_path.stat().st_size==frame['numericData']['bytes']
    rgba=np.array(Image.open(image_path)); numeric=np.array(Image.open(numeric_path))
    assert rgba.shape==(height,width,4) and numeric.shape==(height,width)
    assert np.all(numeric>0) and frame['stats']['missingPixels']==0
    gray=np.rint(np.clip((310-numeric.astype(float)/100)/130,0,1)*255).astype(np.uint8)
    assert np.array_equal(rgba[:,:,:3],np.repeat(gray[:,:,None],3,axis=2)) and np.all(rgba[:,:,3]==255)
    # Independent area and percentile calculations from delivered uint16, never display colours.
    tb=numeric.astype(float)/100
    cold_area=float(areas[neighborhood & (tb<220)].sum())
    assert abs(cold_area-frame['stats']['coldAreaKm2'])<1e-7
    values,weights=tb[neighborhood],areas[neighborhood]
    order=np.argsort(values,kind='stable'); cumulative=np.cumsum(weights[order])
    p10=float(values[order][np.searchsorted(cumulative,.1*cumulative[-1])])
    assert abs(p10-frame['stats']['p10K'])<1e-9
    segments=[]
    for source in frame['sourceSegments']:
        path=PROJECT/source['rawFile']; receipt=receipt_by_url[source['sourceUrl']]
        assert path.stat().st_size==source['rawBytes']==receipt['bytes']
        assert hash_file(path)==source['rawSHA256']==receipt['sha256']
        segments.append(independent_decode(path))
    for row,column in [(0,0),(0,1023),(250,250),(460,572),(500,600),(700,100),(915,0),(915,1023)]:
        result=next((value for segment in segments if (value:=independent_sample(float(lon[row,column]),float(lat[row,column]),segment)) is not None),None)
        assert result is not None and result[0]==int(numeric[row,column]), (frame['timeUtc'],row,column,result,numeric[row,column])
        sampled_pixels+=1
    assert time <= datetime.fromisoformat(frame['scanStartUtc'].replace('Z','+00:00'))
    assert frame['scanStartUtc']<=frame['regionalScanStartUtcEstimate']<=frame['regionalScanEndUtcEstimate']<=frame['scanEndUtc']
    scan_ranges.append({'nominal':frame['timeUtc'],'selectedSegmentsStart':frame['scanStartUtc'],'selectedSegmentsEnd':frame['scanEndUtc']})
for series in manifest['series']:
    assert len(series['samples'])==25
    for frame,sample in zip(manifest['frames'],series['samples']):
        assert frame['timeUtc']==sample['timeUtc'] and frame['stats'][series['id']]==sample['value']

report={'passed':True,'checkedAtUtc':datetime.now(timezone.utc).isoformat().replace('+00:00','Z'),
        'frames':25,'rawFiles':50,'missingFrames':0,'independentRawCalibrationSamples':sampled_pixels,
        'checks':['all raw/display/numeric SHA256 and byte lengths','strict 600-second nominal timestamps, actual segment scan bounds retained','full-pixel uint16 to fixed display mapping','independent ECEF navigation and micrometre Planck raw-count checks at 8 pixels/frame','independent spherical-neighborhood threshold area and weighted P10 from uint16','all series values/time exactly equal corresponding frame stats'],
        'visualInspection':['03:50 pre-eruption surroundings','04:20 small new bright eruption cloud','07:50 substantially expanded umbrella cloud; background weather clouds retained'],
        'displayBytes':sum(frame['bytes'] for frame in manifest['frames']),'numericBytes':sum(frame['numericData']['bytes'] for frame in manifest['frames']),
        'rawBytes':sum(item['bytes'] for item in receipts),'firstScan':scan_ranges[0],'lastScan':scan_ranges[-1],
        'limits':'Round-trip/algorithm agreement checks are not external geolocation accuracy claims. Cloud parallax and weather-cloud ambiguity remain.'}
(ROOT/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False,indent=2))
