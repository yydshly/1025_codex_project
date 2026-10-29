"""Copy this research subproject into its dedicated owner-only backup repository.

No repository history, dependencies, model weights or other projects are copied.
Existing files are never deleted. Run checks before snapshotting.
"""
import argparse, hashlib, json, shutil
from datetime import datetime, timezone
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--destination',required=True,type=Path)
a=p.parse_args();source=Path(__file__).resolve().parents[1];root=a.destination.resolve()
if root.name!='pose-db-20261029' or not (root/'.git').is_dir() or source==root or source in root.parents:
    raise SystemExit('Use the dedicated backup repository outside the public research tree.')
target=root/'research-project';target.mkdir(exist_ok=True)
entries=[]
for f in sorted(source.rglob('*')):
    relative=f.relative_to(source)
    if any(part in {'.git','node_modules','__pycache__','.venv'} for part in relative.parts) or f.suffix=='.pyc':continue
    if relative.parts[0]=='.local' and relative.as_posix()!='.local/research-overview-v2/overview.png':continue
    if f.is_symlink() or source not in f.resolve().parents:raise SystemExit('Linked or external path rejected')
    if not f.is_file():continue
    if f.stat().st_size>5_000_000:raise SystemExit('Unexpected large file in research snapshot: '+str(relative))
    output=target/relative;output.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,output)
    data=output.read_bytes();entries.append({'path':relative.as_posix(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
registry=json.loads((source.parents[1]/'projects.json').read_text(encoding='utf-8'))
entry=next(item for item in registry['projects'] if item['id']=='011' and item['slug']=='pose-look-creation-atlas')
(target/'registry-entry.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
data=(target/'registry-entry.json').read_bytes();entries.append({'path':'registry-entry.json','bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
manifest={'createdAt':datetime.now(timezone.utc).isoformat(),'project':'011-pose-look-creation-atlas','files':entries,
          'fileCount':len(entries),'totalBytes':sum(f['bytes'] for f in entries),'scope':'One subproject snapshot only. Original references remain separate in the private repository.'}
(root/'research-project-snapshot.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
readme=root/'README.md';body=readme.read_text(encoding='utf-8')
if '## Research webpage snapshot' not in body:
    readme.write_text(body+'''\n## Research webpage snapshot

- `research-project/`: the Chinese research webpage, notes, evidence, screenshots and scripts.
- `research-project/app/index.html`: read locally in an ordinary browser; no dependency install is required.
- `research-project-snapshot.json`: per-file SHA-256 and size for the research snapshot.
- `research-project/registry-entry.json`: this subproject's entry in the parent research registry.

This is a preservation copy, not a hosted public gallery. The original-image commit linked in the webpage
is a fixed verified version; subsequent research-only commits do not change that evidence.
To serve the page locally with Node.js: enter `research-project` and run `npm.cmd run dev`.
Original-image licences remain unchanged. Keep the whole repository private.
''',encoding='utf-8')
print(json.dumps({'researchFiles':len(entries),'researchBytes':manifest['totalBytes']},ensure_ascii=False))
