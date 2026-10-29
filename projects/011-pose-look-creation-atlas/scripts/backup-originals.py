"""Preserve the explicitly requested original references in an owner-only directory.

No dependencies, model weights, or upstream programs are installed or executed.
The public research project receives a count/hash summary, never the source images.
"""
from __future__ import annotations
import argparse, concurrent.futures, hashlib, json, re, struct, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

ORIGIN = 'https://ai-pose-gallery.pages.dev/'
PNG = b'\x89PNG\r\n\x1a\n'
PRIVATE_REPO = 'https://github.com/yydshly/pose-look-reference-backup'
PROJECT = Path(__file__).resolve().parents[1]

def get(url):
    req = Request(url, headers={'User-Agent': 'PoseLookPersonalArchive/1.0'})
    with urlopen(req, timeout=50) as response:
        if response.status != 200:
            raise RuntimeError(f'HTTP {response.status}')
        return response.read()

def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--destination', required=True, type=Path)
    parser.add_argument('--workers', type=int, default=8)
    args = parser.parse_args()
    root = args.destination.resolve()
    if PROJECT == root or PROJECT in root.parents:
        raise SystemExit('Originals must be outside the public research checkout.')
    root.mkdir(parents=True, exist_ok=True)
    metadata = root/'metadata'
    metadata.mkdir(exist_ok=True)
    html = get(ORIGIN)
    (metadata/'original-page.html').write_bytes(html)
    match = re.search(r'const D\s*=\s*(\[.*?\]);', html.decode('utf-8'), re.S)
    if not match:
        raise SystemExit('Source index format changed; no image requests were started.')
    records = json.loads(match.group(1))
    if len(records) != 1439 or len({r['id'] for r in records}) != len(records):
        raise SystemExit('Unexpected index count or duplicate IDs; review source before continuing.')
    save_json(metadata/'original-index.json', records)
    image_dir = root/'original-images'
    image_dir.mkdir(exist_ok=True)

    def download(record):
        original = record['原寸']
        if not re.fullmatch(r'img/[A-Za-z0-9_.-]+\.png', original):
            raise ValueError('Unsafe source image path')
        url = urljoin(ORIGIN, original)
        target = image_dir/Path(original).name
        last = None
        for attempt in range(4):
            try:
                blob = target.read_bytes() if target.exists() else get(url)
                if len(blob) < 32 or blob[:8] != PNG:
                    raise ValueError('Not a valid PNG')
                width, height = struct.unpack('>II', blob[16:24])
                if width <= 0 or height <= 0:
                    raise ValueError('Invalid dimensions')
                if not target.exists():
                    partial = target.with_suffix('.png.part')
                    partial.write_bytes(blob)
                    partial.replace(target)
                return {'id':record['id'], 'path':target.relative_to(root).as_posix(), 'url':url,
                        'bytes':len(blob), 'sha256':hashlib.sha256(blob).hexdigest(),
                        'width':width, 'height':height}
            except Exception as error:
                last = str(error)
                if attempt < 3:
                    time.sleep(attempt+1)
        return {'id':record['id'], 'error':last}

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1,min(args.workers,12))) as pool:
        for result in pool.map(download, records):
            results.append(result)
            if len(results)%100 == 0 or len(results)==len(records):
                print(f'Original PNGs: {len(results)}/{len(records)}, failures: {sum("error" in r for r in results)}', flush=True)
    good = sorted((r for r in results if 'error' not in r), key=lambda r:r['path'])
    failed = [r for r in results if 'error' in r]
    manifest = {'schemaVersion':1, 'retrievedAt':datetime.now(timezone.utc).isoformat(), 'source':ORIGIN,
                'expected':len(records), 'verified':len(good), 'poseGroups':len({r['系統']+'|'+r['ポーズ番号'] for r in records}),
                'totalBytes':sum(r['bytes'] for r in good), 'files':good, 'failures':failed,
                'usage':'Private personal preservation only. Original author terms apply. No public redistribution.'}
    save_json(root/'manifest.json', manifest)

    # Preserve the clothing post's original contact sheet, not an invented full clothing database.
    previews = root/'clothing-preview'
    previews.mkdir(exist_ok=True)
    url = 'https://pbs.twimg.com/media/HVuFo8Ua4AAIvUL.jpg?name=orig'
    preview_status = 'unavailable'
    try:
        target = previews/'author-contact-sheet.jpg'
        preview = target.read_bytes() if target.exists() else get(url)
        if preview[:3] != b'\xff\xd8\xff':
            raise ValueError('Clothing preview is not JPEG')
        target.write_bytes(preview)
        save_json(previews/'provenance.json', {'url':url,'post':'https://x.com/giaaibusi/status/2115431641766359244',
            'bytes':len(preview),'sha256':hashlib.sha256(preview).hexdigest(),
            'scope':'One original preview contact sheet only. No full clothing database located; no commercial permission inferred.'})
        preview_status = 'one-original-preview-only'
    except Exception as error:
        save_json(previews/'provenance.json', {'url':url,'status':'unavailable','error':str(error),
            'scope':'No full clothing database located. Preview retrieval failed; no commercial permission inferred.'})
    (root/'.gitignore').write_text('*.part\n__pycache__/\n', encoding='utf-8')
    (root/'README.md').write_text('''# Pose & Look — private reference preservation

This repository is an owner-only personal backup, not a public dataset mirror.
Keep it private. Original author terms remain in force; no new licence is granted here.

- Source: https://ai-pose-gallery.pages.dev/
- Original author: https://x.com/giaaibusi
- Original pose PNGs: 1,439 multi-angle images representing 288 pose groups.
- `manifest.json`: per-file size, dimensions, original URL and SHA-256.
- `metadata/original-index.json`: the original source index, retained without translation.
- `metadata/original-page.html`: source page including its notice, captured at retrieval.
- `clothing-preview/`: the clothing announcement's one contact sheet; NOT the full announced collection.

The pose site permits free creative reference and commercial artwork under its stated conditions,
but prohibits redistributing/reposting/reselling the image data (including modified copies)
and restricts real-person/minor uses. Do not make this repository public or publish these files
through Pages, Releases, public object storage, or a new reference gallery.
The clothing preview has no confirmed commercial/reuse licence.

Verification: run the separately provided standard-library verification script or recompute every
SHA-256 in `manifest.json`. A successful Git push is not proof that all original images were retrieved.
''', encoding='utf-8')
    digest = hashlib.sha256((root/'manifest.json').read_bytes()).hexdigest()
    public = {k:manifest[k] for k in ['schemaVersion','retrievedAt','source','expected','verified','poseGroups','totalBytes']}
    public.update({'manifestSha256':digest,'privateRepository':PRIVATE_REPO,'remoteVerified':False,
                   'status':'complete-local' if not failed else 'incomplete',
                   'clothing':preview_status,'failureCount':len(failed)})
    save_json(PROJECT/'research'/'original-backup-summary.json',public)
    save_json(PROJECT/'app'/'backup-summary.json',public)
    (PROJECT/'app'/'backup-data.js').write_text('window.BACKUP_STATUS = '+json.dumps(public,ensure_ascii=False)+';\n',encoding='utf-8')
    print(json.dumps({'verified':len(good),'failures':len(failed),'MiB':round(manifest['totalBytes']/1024**2,2),'manifestSha256':digest}),flush=True)
    if failed:
        raise SystemExit(1)

if __name__=='__main__':
    main()
