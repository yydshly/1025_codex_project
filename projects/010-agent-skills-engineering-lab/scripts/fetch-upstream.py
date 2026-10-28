"""Fetch the fixed public upstream skill and reference files without running them."""
import hashlib
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile

COMMIT = 'aeac41d4d005999432bb7312f7ff06383a91d59d'
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'research' / 'upstream'
URL = f'https://codeload.github.com/addyosmani/agent-skills/zip/{COMMIT}'

def main():
    if DEST.exists():
        raise SystemExit('上游快照已存在，拒绝覆盖。')
    request = Request(URL, headers={'User-Agent': 'agent-skills-research-lab'})
    with urlopen(request, timeout=60) as response:
        payload = response.read()
    records = []
    with ZipFile(io.BytesIO(payload)) as archive:
        prefix = f'agent-skills-{COMMIT}/'
        for entry in archive.infolist():
            if entry.is_dir() or not entry.filename.startswith(prefix):
                continue
            rel = entry.filename[len(prefix):]
            if not (rel == 'LICENSE' or rel.startswith('skills/') or rel.startswith('references/')):
                continue
            parts = Path(rel).parts
            if not parts or any(p in ('.', '..') for p in parts) or '\\' in rel:
                raise ValueError('Unsafe archive path')
            content = archive.read(entry)
            target = DEST.joinpath(*parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open('xb') as stream:
                stream.write(content)
            records.append({'path': rel, 'bytes': len(content), 'sha256': hashlib.sha256(content).hexdigest()})
    manifest = {'source': 'https://github.com/addyosmani/agent-skills', 'commit': COMMIT,
                'archive_sha256': hashlib.sha256(payload).hexdigest(), 'files': sorted(records, key=lambda x: x['path'])}
    (DEST / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'已保存 {len(records)} 个上游文件；SKILL.md: {sum(x["path"].endswith("/SKILL.md") for x in records)}。')

if __name__ == '__main__':
    main()
