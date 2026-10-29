"""Check owner-only remote Git blobs against local archive bytes; no full clone."""
import argparse, hashlib, json, subprocess, time
from datetime import datetime, timezone
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);p.add_argument('directory',type=Path)
p.add_argument('--repository',default='yydshly/pose-look-reference-backup');p.add_argument('--publish-summary',action='store_true')
a=p.parse_args();root=a.directory.resolve()
def api(endpoint):
    for attempt in range(3):
        try:return json.loads(subprocess.check_output(['gh','api',endpoint],timeout=70))
        except (subprocess.SubprocessError,ValueError):
            if attempt==2:raise
            time.sleep(2)
repo=api('repos/'+a.repository)
if not repo['private']:raise SystemExit('Backup must remain private')
commit=api('repos/'+a.repository+'/commits/main')['sha']
tree=api('repos/'+a.repository+'/git/trees/'+commit+'?recursive=1')
if tree.get('truncated'):raise SystemExit('Incomplete remote tree response')
files={f['path']:f for f in tree['tree'] if f['type']=='blob'}
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
fail=[]
for relative,f in files.items():
    local=(root/relative).resolve()
    if root not in local.parents or not local.is_file():fail.append(relative+': absent locally');continue
    blob=local.read_bytes(); digest=hashlib.sha1(b'blob '+str(len(blob)).encode()+b'\0'+blob).hexdigest()
    if digest!=f['sha']:fail.append(relative+': remote blob differs')
originals=[f for f in files if f.startswith('original-images/')]
if len(originals)!=1439:fail.append('Remote original PNG count differs')
for f in manifest['files']:
    if f['path'] not in files:fail.append(f['path']+': missing remotely')
for required in ['manifest.json','metadata/original-index.json','metadata/original-page.html',
                 'clothing-preview/author-contact-sheet.jpg','clothing-preview/provenance.json']:
    if required not in files:fail.append(required+': missing remotely')
snapshot_file=root/'research-project-snapshot.json'
snapshot_count=0
if snapshot_file.exists():
    snapshot=json.loads(snapshot_file.read_text(encoding='utf-8'))
    if 'research-project-snapshot.json' not in files:fail.append('Research snapshot manifest missing remotely')
    for entry in snapshot['files']:
        relative='research-project/'+entry['path'];local=(root/relative).resolve()
        if root not in local.parents or relative not in files:fail.append(relative+': snapshot entry missing');continue
        blob=local.read_bytes()
        if len(blob)!=entry['bytes'] or hashlib.sha256(blob).hexdigest()!=entry['sha256']:
            fail.append(relative+': snapshot SHA-256 differs')
        snapshot_count+=1
    if snapshot_count!=snapshot['fileCount']:fail.append('Snapshot count differs')
result={'private':True,'remoteCommit':commit,'remoteFiles':len(files),'remoteOriginals':len(originals),
        'researchSnapshotFiles':snapshot_count,'remoteVerified':not fail,'verifiedAt':datetime.now(timezone.utc).isoformat(),'failures':fail}
print(json.dumps(result,ensure_ascii=False))
if fail:raise SystemExit(1)
if a.publish_summary:
    project=Path(__file__).resolve().parents[1]
    public=json.loads((project/'research'/'original-backup-summary.json').read_text(encoding='utf-8'))
    public.update({k:v for k,v in result.items() if k!='failures'});public['status']='complete-private-remote'
    integrity=project/'research'/'png-integrity.json'
    if integrity.exists():public['pngIntegrityVerified']=json.loads(integrity.read_text(encoding='utf-8'))['pngIntegrityVerified']
    content=json.dumps(public,ensure_ascii=False,indent=2)+'\n'
    (project/'research'/'original-backup-summary.json').write_text(content,encoding='utf-8')
    (project/'app'/'backup-summary.json').write_text(content,encoding='utf-8')
    (project/'app'/'backup-data.js').write_text('window.BACKUP_STATUS = '+json.dumps(public,ensure_ascii=False)+';\n',encoding='utf-8')
