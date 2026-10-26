"""Fetch the pinned official showcase, retaining provenance and original metadata.

No BaoCut installation, model invocation, or local video reproduction is performed.
Existing identical files are reused; no files are removed.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / 'research/upstream-manifest.json').read_text(encoding='utf-8'))
COMMIT = MANIFEST['commit']
BASE = f'https://raw.githubusercontent.com/JimLiu/baocut/{COMMIT}/'


def fetch(entry):
    source_path = entry['path']
    if source_path == 'LICENSE':
        destination = ROOT / 'research/upstream/LICENSE.txt'
    else:
        _, template_id, filename = source_path.split('/')
        if filename in ('cover.jpg', 'preview.mp4'):
            destination = ROOT / 'assets/official' / template_id / filename
        else:
            destination = ROOT / 'research/upstream/templates' / template_id / filename
    destination.parent.mkdir(parents=True, exist_ok=True)
    data = destination.read_bytes() if destination.exists() else None
    if data is None:
        request = urllib.request.Request(BASE + source_path, headers={'User-Agent': 'BaoCut-Research-Atlas/1.0'})
        with urllib.request.urlopen(request, timeout=45) as response:
            data = response.read()
    blob = hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()
    if len(data) != entry['size'] or blob != entry['sha']:
        raise ValueError(f'Upstream blob mismatch: {source_path}')
    if not destination.exists():
        destination.write_bytes(data)
    return {'sourcePath': source_path, 'localPath': destination.relative_to(ROOT).as_posix(),
            'sourceUrl': BASE + source_path, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
            'gitBlobSha': blob}


def probe(path):
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration:stream=codec_type,codec_name,width,height', '-of', 'json', str(path)],
        check=True, capture_output=True, text=True, encoding='utf-8')
    data = json.loads(result.stdout)
    video = next(x for x in data['streams'] if x['codec_type'] == 'video')
    return {'durationSeconds': round(float(data['format']['duration']), 3),
            'width': video['width'], 'height': video['height'], 'codec': video['codec_name'],
            'hasAudio': any(x['codec_type'] == 'audio' for x in data['streams'])}


def main():
    with ThreadPoolExecutor(max_workers=5) as pool:
        records = list(pool.map(fetch, MANIFEST['files']))
    templates = []
    for item in records:
        if not item['sourcePath'].endswith('/template.json'):
            continue
        raw = json.loads((ROOT / item['localPath']).read_text(encoding='utf-8'))
        template_id = raw['id']
        media = ROOT / 'assets/official' / template_id
        raw['sourceUrl'] = f'https://github.com/JimLiu/baocut/tree/{COMMIT}/templates/{template_id}'
        raw['promptUrl'] = f'https://github.com/JimLiu/baocut/blob/{COMMIT}/templates/{template_id}/prompt.md'
        raw['localPreview'] = f'../assets/official/{template_id}/preview.mp4' if (media / 'preview.mp4').exists() else None
        raw['localCover'] = f'../assets/official/{template_id}/cover.jpg' if (media / 'cover.jpg').exists() else None
        raw['measuredPreview'] = probe(media / 'preview.mp4') if raw['localPreview'] else None
        templates.append(raw)
    result = {'repository': MANIFEST['repository'], 'commit': COMMIT, 'capturedAt': MANIFEST['capturedAt'],
        'attribution': '官方样片与模板：Jim Liu / BaoCut；本研究未在本机复现这些视频。',
        'templates': templates}
    (ROOT / 'app/catalog.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'research/asset-integrity.json').write_text(json.dumps({'commit': COMMIT, 'files': records}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    subprocess.run(['node', str(ROOT / 'scripts/build-data.mjs')], check=True)
    for item in templates:
        print(f"{item['id']}: preview={bool(item['localPreview'])}, verification={item.get('verification', {}).get('outcome', 'not-recorded')}")
    print(f"Verified {len(records)} official files; {len(templates)} templates, {sum(bool(x['localPreview']) for x in templates)} previews.")


if __name__ == '__main__':
    main()
