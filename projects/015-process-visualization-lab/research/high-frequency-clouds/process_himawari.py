"""Himawari B13 HSD -> georeferenced regional brightness-temperature frames.

Implements JMA HSD v1.3 tables and normalized geostationary navigation.
No temporal interpolation, invented clouds, or RGB reconstruction is performed.
Only the declared regional geographic grid is resampled, by nearest neighbour.
"""
from __future__ import annotations
import argparse
import bz2
import hashlib
import json
import math
import re
import struct
from datetime import datetime, timedelta, timezone
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
MJD_EPOCH = datetime(1858, 11, 17, tzinfo=timezone.utc)
BBOX = [105.0, 5.0, 140.0, 35.0]
WIDTH, HEIGHT = 1024, 878
SOURCE_BASE = 'https://noaa-himawari8.s3.amazonaws.com/'
GUIDE = 'https://www.data.jma.go.jp/mscweb/en/himawari89/space_segment/hsd_sample/HS_D_users_guide_en_v13.pdf'

def iso_mjd(value):
    return (MJD_EPOCH + timedelta(days=float(value))).isoformat(timespec='milliseconds').replace('+00:00', 'Z')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load_hsd(path):
    raw = bz2.decompress(path.read_bytes())
    if raw[5] != 0:
        raise ValueError('Only little-endian HSD is supported; do not silently reinterpret.')
    if raw[78] != 0:
        raise ValueError('Nonzero operational/solar/lunar quality flag requires explicit review, not silent display.')
    blocks, offset = {}, 0
    for number in range(1, 12):
        if raw[offset] != number:
            raise ValueError(f'Wrong block number at {offset}')
        length = struct.unpack_from('<I' if number == 10 else '<H', raw, offset + 1)[0]
        blocks[number] = raw[offset:offset + length]
        offset += length
    start, end, created, header_size, data_size = struct.unpack_from('<3d2I', blocks[1], 46)
    bits, columns, lines, compression = struct.unpack_from('<HHHB', blocks[2], 3)
    if header_size != offset or bits != 16 or compression != 0 or len(raw) != header_size + data_size:
        raise ValueError('Unexpected HSD header/data length or internal compression')
    lon0, cfac, lfac, coff, loff, rs, req, rpol = struct.unpack_from('<dIIff3d', blocks[3], 3)
    band, wavelength, valid_bits, error_value, outside_value, *cal = struct.unpack_from('<HdHHH11d', blocks[5], 3)
    total_segments, segment, first_line = struct.unpack_from('<BBH', blocks[7], 3)
    if band != 13 or total_segments != 1 or segment != 1 or first_line != 1:
        raise ValueError('This pipeline expects an unsegmented B13 frame, not other bands/segments.')
    centre_x, centre_y, rotation, corrections_count = struct.unpack_from('<ffdH', blocks[8], 3)
    corrections = [struct.unpack_from('<Hff', blocks[8], 21 + i * 10) for i in range(corrections_count)]
    if rotation != 0 or any(x != 0 or y != 0 for _, x, y in corrections):
        raise ValueError('Nonzero navigation correction requires an explicitly implemented transform.')
    time_count = struct.unpack_from('<H', blocks[9], 3)[0]
    line_times = [struct.unpack_from('<Hd', blocks[9], 5 + i * 10) for i in range(time_count)]
    error_lines = struct.unpack_from('<H', blocks[10], 5)[0]
    if error_lines:
        raise ValueError('Reported error lines require explicit quality handling.')
    counts = np.frombuffer(raw, dtype='<u2', count=columns * lines, offset=header_size).reshape(lines, columns)
    meta = {
        'satellite': blocks[1][6:22].decode('ascii').strip('\x00 '),
        'formatVersion': blocks[1][82:114].decode('ascii').strip('\x00 '),
        'nativeColumns': columns, 'nativeLines': lines,
        'scanStartUtc': iso_mjd(start), 'scanEndUtc': iso_mjd(end), 'createdAtUtc': iso_mjd(created),
        'qualityFlags': list(blocks[1][78:82]), 'errorLineCount': error_lines,
        'navigationCorrection': {'rotationMicroradians': rotation, 'allShiftsZero': True, 'records': corrections_count},
        'projection': {'name': 'normalized geostationary', 'subLongitude': lon0, 'CFAC': cfac, 'LFAC': lfac,
                       'COFF': coff, 'LOFF': loff, 'satelliteDistanceFromEarthCenterKm': rs,
                       'equatorialRadiusKm': req, 'polarRadiusKm': rpol},
        'calibration': {'band': band, 'wavelengthMicrometers': wavelength, 'validBits': valid_bits,
                        'invalidCountValues': [error_value, outside_value], 'gain': cal[0], 'offset': cal[1],
                        'c0': cal[2], 'c1': cal[3], 'c2': cal[4], 'speedOfLight': cal[8],
                        'planckConstant': cal[9], 'boltzmannConstant': cal[10]},
        'lineTimes': [{'line': n, 'timeUtc': iso_mjd(t)} for n, t in line_times],
    }
    return counts, meta, line_times

def geo_to_native(lon, lat, p):
    """Geodetic WGS84 coordinates to one-based HSD column/line centers."""
    lam = np.deg2rad(lon - p['subLongitude'])
    phi = np.deg2rad(lat)
    req, rpol, rs = p['equatorialRadiusKm'], p['polarRadiusKm'], p['satelliteDistanceFromEarthCenterKm']
    geocentric = np.arctan((rpol / req) ** 2 * np.tan(phi))
    re = rpol / np.sqrt(1 - (1 - (rpol / req) ** 2) * np.cos(geocentric) ** 2)
    r1 = rs - re * np.cos(geocentric) * np.cos(lam)
    r2 = -re * np.cos(geocentric) * np.sin(lam)
    r3 = re * np.sin(geocentric)
    rn = np.sqrt(r1 * r1 + r2 * r2 + r3 * r3)
    x = np.rad2deg(np.arctan2(-r2, r1))
    y = np.rad2deg(np.arcsin(-r3 / rn))
    visible = r1 * (rs - r1) - r2 * r2 - (req / rpol) ** 2 * r3 * r3 > 0
    return p['COFF'] + x * p['CFAC'] / 65536, p['LOFF'] + y * p['LFAC'] / 65536, visible

def native_to_geo(column, line, p):
    """Independent inverse direction used to check the geographic sampling grid."""
    x = np.deg2rad((column - p['COFF']) * 65536 / p['CFAC'])
    y = np.deg2rad((line - p['LOFF']) * 65536 / p['LFAC'])
    req, rpol, rs = p['equatorialRadiusKm'], p['polarRadiusKm'], p['satelliteDistanceFromEarthCenterKm']
    ratio = (req / rpol) ** 2
    d = np.cos(y) ** 2 + ratio * np.sin(y) ** 2
    sd = np.sqrt((rs * np.cos(x) * np.cos(y)) ** 2 - d * (rs * rs - req * req))
    sn = (rs * np.cos(x) * np.cos(y) - sd) / d
    s1 = rs - sn * np.cos(x) * np.cos(y)
    s2 = sn * np.sin(x) * np.cos(y)
    s3 = -sn * np.sin(y)
    lon = np.rad2deg(np.arctan2(s2, s1)) + p['subLongitude']
    lat = np.rad2deg(np.arctan(ratio * s3 / np.hypot(s1, s2)))
    return lon, lat

def process(path):
    name = re.fullmatch(r'HS_H08_(\d{8})_(\d{4})_B13_FLDK_R20_S0101.DAT.bz2', path.name)
    if not name:
        raise ValueError('Unexpected source name')
    date, hm = name.groups()
    nominal = datetime.strptime(date + hm, '%Y%m%d%H%M').replace(tzinfo=timezone.utc)
    counts, meta, line_times = load_hsd(path)
    west, south, east, north = BBOX
    longitude = west + (np.arange(WIDTH) + .5) * (east - west) / WIDTH
    latitude = north - (np.arange(HEIGHT) + .5) * (north - south) / HEIGHT
    lon, lat = np.meshgrid(longitude, latitude)
    col, row, visible = geo_to_native(lon, lat, meta['projection'])
    ci, ri = np.rint(col).astype(int) - 1, np.rint(row).astype(int) - 1
    inside = visible & (ci >= 0) & (ci < counts.shape[1]) & (ri >= 0) & (ri < counts.shape[0])
    if not np.all(inside):
        raise ValueError('Requested regional grid exceeds the source coverage.')
    sample = counts[ri, ci].astype(np.float64)
    c = meta['calibration']
    radiance = c['gain'] * sample + c['offset']
    valid = (~np.isin(sample, c['invalidCountValues'])) & (sample < 2 ** c['validBits']) & (radiance > 0)
    wavelength = c['wavelengthMicrometers'] * 1e-6
    with np.errstate(divide='ignore', invalid='ignore'):
        te = (c['planckConstant'] * c['speedOfLight'] / (c['boltzmannConstant'] * wavelength)) / np.log1p(
            2 * c['planckConstant'] * c['speedOfLight'] ** 2 / (wavelength ** 5 * radiance * 1e6))
    tb = c['c0'] + c['c1'] * te + c['c2'] * te ** 2
    valid &= np.isfinite(tb)
    tb[~valid] = np.nan
    # A fixed scale for the whole sequence; cold = white, warm = black.
    gray = np.rint(np.clip((310 - np.nan_to_num(tb, nan=310)) / 130, 0, 1) * 255).astype(np.uint8)
    rgba = np.dstack((gray, gray, gray, valid.astype(np.uint8) * 255))
    output = ROOT / 'frames'
    output.mkdir(exist_ok=True)
    stem = f'himawari-b13-{date}T{hm}Z'
    png_path = output / f'{stem}.png'
    Image.fromarray(rgba).save(png_path, optimize=True)
    quantized = np.rint(np.nan_to_num(tb, nan=0) * 100).astype('<u2')
    data_path = output / f'{stem}-bt-centikelvin.png'
    Image.fromarray(quantized).save(data_path, optimize=True)
    # Verify the coordinate transform at corners and Hong Kong independently of raster indexing.
    check_points = [(west, south), (west, north), (east, south), (east, north), (114.1742, 22.3019)]
    checks = []
    for xlon, ylat in check_points:
        xcol, yrow, seen = geo_to_native(np.array(xlon), np.array(ylat), meta['projection'])
        ilon, ilat = native_to_geo(xcol, yrow, meta['projection'])
        err = float(max(abs(ilon - xlon), abs(ilat - ylat)))
        if err > 1e-7 or not seen:
            raise ValueError('Geographic coordinate round trip failed')
        checks.append({'lon': xlon, 'lat': ylat, 'nativeColumn1Based': float(xcol),
                       'nativeLine1Based': float(yrow), 'roundTripMaxErrorDegrees': err})
    ordered = sorted(line_times)
    line_ids = np.array([r[0] for r in ordered])
    mjds = np.array([r[1] for r in ordered])
    region_start = np.interp(float(row.min()), line_ids, mjds)
    region_end = np.interp(float(row.max()), line_ids, mjds)
    source_key = f'AHI-L1b-FLDK/{date[:4]}/{date[4:6]}/{date[6:8]}/{hm}/{path.name}'
    frame = {
        'id': stem, 'timeUtc': nominal.isoformat().replace('+00:00', 'Z'),
        'timeMeaning': 'nominal observation timeline start; each scan spans minutes, not an instantaneous exposure',
        'scanStartUtc': meta['scanStartUtc'], 'scanEndUtc': meta['scanEndUtc'],
        'regionalScanStartUtcEstimate': iso_mjd(region_start), 'regionalScanEndUtcEstimate': iso_mjd(region_end),
        'regionalTimeMethod': 'linear interpolation of HSD block 9 line observation timestamps; estimated bounds only',
        'url': 'frames/' + png_path.name, 'width': WIDTH, 'height': HEIGHT,
        'bbox': BBOX, 'projection': 'EPSG:4326', 'rowOrder': 'north-to-south',
        'pixelConvention': 'bbox gives outer pixel edges; pixel centers at half-cell offsets',
        'sourceUrl': SOURCE_BASE + source_key, 'rawFile': 'raw/' + path.name,
        'rawBytes': path.stat().st_size, 'rawSHA256': sha(path), 'sha256': sha(png_path),
        'retrievedAtUtc': datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z'),
        'brightnessTemperatureData': {'url': 'frames/' + data_path.name, 'sha256': sha(data_path),
                                     'encoding': 'PNG uint16', 'scale': .01, 'unit': 'K', 'nodata': 0},
        'statistics': {'minK': float(np.nanmin(tb)), 'maxK': float(np.nanmax(tb)),
                       'validPixels': int(valid.sum()), 'missingPixels': int((~valid).sum())},
        'coordinateChecks': checks,
    }
    meta['frame'] = frame
    (output / f'{stem}.json').write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding='utf-8')
    return frame

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('files', nargs='*')
    args = parser.parse_args()
    paths = [Path(p) for p in args.files] if args.files else sorted((ROOT / 'raw').glob('*.bz2'))
    results = []
    for path in paths:
        frame = process(path)
        results.append(frame)
        print(json.dumps({'frame': frame['timeUtc'], 'minK': frame['statistics']['minK'], 'maxK': frame['statistics']['maxK'], 'path': frame['url']}), flush=True)
    manifest_path = ROOT / 'himawari-b13-manifest.json'
    # Incremental generation retains previously verified frames, then sorts by nominal UTC.
    old = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {'frames': []}
    by_time = {f['timeUtc']: f for f in old['frames']}
    by_time.update({f['timeUtc']: f for f in results})
    manifest = {
        'schemaVersion': 1, 'eventId': 'mangkhut-2018', 'layer': 'Himawari-8 AHI B13 brightness temperature',
        'kind': 'calibrated satellite observation, reprojected regional raster',
        'temporalType': 'nominal 10-minute scans, actual scan start/end retained per frame',
        'projection': 'EPSG:4326', 'bbox': BBOX, 'width': WIDTH, 'height': HEIGHT,
        'credit': 'JMA Himawari-8 / NOAA Open Data Dissemination; regional calibration, reprojection and grayscale visualization by this project',
        'source': 'https://registry.opendata.aws/noaa-himawari/', 'formatGuide': GUIDE,
        'licenseNote': 'NOAA is authorized to distribute JMA data freely and openly; attribute JMA/NOAA and do not imply endorsement. These processed images are not unaltered originals.',
        'processing': {'resampling': 'nearest-neighbor in space; no temporal interpolation',
                       'calibration': 'HSD header block 5 count-to-radiance then Planck brightness-temperature correction',
                       'gsics': 'not additionally applied', 'navigation': 'HSD block 3 normalized geostationary/WGS84; requires zero block 8 correction',
                       'palette': {'kind': 'grayscale', 'blackKelvin': 310, 'whiteKelvin': 180, 'clippedOutsideRange': True},
                       'alpha': '255 for valid pixels, 0 for missing; not a cloud mask',
                       'limitations': ['Infrared brightness temperature is not visible natural color, rainfall, wind speed, or exact cloud height.',
                                       'Cloud parallax is not corrected; high clouds may appear displaced from their surface position.',
                                       'Nearest-neighbor resampling and 8-bit display compress radiometric detail; uint16 centikelvin data is supplied separately.']},
        'frames': sorted(by_time.values(), key=lambda x: x['timeUtc']),
    }
    if (ROOT / 'missing-observations.json').exists():
        manifest['missingObservations'] = [json.loads((ROOT / 'missing-observations.json').read_text(encoding='utf-8-sig'))]
        manifest['missingTimesUtc'] = [x['timeUtc'] for x in manifest['missingObservations']]
    temporary_manifest = manifest_path.with_suffix('.json.tmp')
    temporary_manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary_manifest.replace(manifest_path)

if __name__ == '__main__':
    main()
