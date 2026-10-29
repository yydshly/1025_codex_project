"""Verify a private original-image archive against its per-file manifest. Read-only."""
import argparse, hashlib, json
from pathlib import Path
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('directory',type=Path)
args=parser.parse_args()
root=args.directory.resolve()
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
failures=[]
for entry in manifest['files']:
    path=(root/entry['path']).resolve()
    if root not in path.parents:
        failures.append(entry['path']+': unsafe path')
        continue
    if not path.is_file():
        failures.append(entry['path']+': missing')
        continue
    digest=hashlib.sha256(path.read_bytes()).hexdigest()
    if path.stat().st_size!=entry['bytes'] or digest!=entry['sha256']:
        failures.append(entry['path']+': mismatch')
result={'expected':manifest['expected'],'manifestEntries':len(manifest['files']),'failures':failures,
        'complete':len(manifest['files'])==manifest['expected'] and not manifest['failures'] and not failures}
print(json.dumps(result,ensure_ascii=False))
raise SystemExit(0 if result['complete'] else 1)
