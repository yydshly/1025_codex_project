"""Download one bounded official IR sample and one original JMA event section."""
import io
import json
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent
RAW = ROOT / 'raw'
RAW.mkdir(parents=True, exist_ok=True)
BASE = 'https://noaa-himawari8.s3.amazonaws.com/'
TRACK_URL = 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/bst_all.zip'

def download(url, path):
    if not path.exists():
        data = urllib.request.urlopen(url, timeout=90).read()
        path.write_bytes(data)
    print(path.name, path.stat().st_size, flush=True)

def track():
    data = urllib.request.urlopen(TRACK_URL, timeout=90).read()
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        name = next(name for name in archive.namelist() if name.endswith('bst_all.txt'))
        lines = archive.read(name).decode('ascii').splitlines()
    start = next(i for i, line in enumerate(lines) if line.startswith('66666 2211'))
    count = int(lines[start][12:15])
    original = '\n'.join(lines[start:start + count + 1]) + '\n'
    (ROOT / 'hinnamnor-jma-source.txt').write_text(original, encoding='ascii')
    (ROOT / 'jma-retrieval.json').write_text(json.dumps({'sourceUrl': TRACK_URL, 'archiveBytes': len(data), 'member': name, 'retrievedAtUtc': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'), 'eventId': '2211', 'records': count}, indent=2), encoding='utf8')
    print(original, flush=True)

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = [pool.submit(track)]
        for segment in (2, 3):
            key = f'AHI-L1b-FLDK/2022/09/05/0600/HS_H08_20220905_0600_B13_FLDK_R20_S{segment:02d}10.DAT.bz2'
            futures.append(pool.submit(download, BASE + key, RAW / Path(key).name))
        for future in futures:
            future.result()
