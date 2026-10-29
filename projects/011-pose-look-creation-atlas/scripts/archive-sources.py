"""Pin and preserve selected upstream documentation, licences and small implementation files.

Uses authenticated GitHub CLI reads and public raw files. Never clones repositories,
downloads image collections/model checkpoints, installs dependencies, or runs upstream code.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
import hashlib, json, subprocess

ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'app'/'archive'
SPECS=[
 ('anhao/ai-pose-gallery-zh',['README.md','LICENSE']),
 ('ZhUyU1997/open-pose-editor',['README.md','LICENSE']),
 ('boytchev/mannequin.js',['README.md','LICENSE','src/editor/posture-editor.js']),
 ('makehumancommunity/mpfb2',['README.md','LICENSE.md','LICENSE.CODE.md','LICENSE.ASSETS.md','script_samples/10_complete_character_export_fbx.py']),
 ('ekza-space/ekza-studio',['README.md','LICENSE','packages/editor-core/src/workflows/exportRun.ts']),
 ('ketle-man/comfyui-vrm-pose-editor',['README.md','LICENSE','js/pose_vrma_export.js']),
 ('Wan-Video/Wan2.2',['README.md','LICENSE.txt','wan/modules/animate/preprocess/UserGuider.md']),
 ('zju3dv/GVHMR',['README.md','LICENSE']),
 ('VAST-AI-Research/UniRig',['README.md','LICENSE']),
 ('Tencent-Hunyuan/Hunyuan3D-2.1',['README.md','LICENSE','Notice.txt']),
]

def api(endpoint):
    p=subprocess.run(['gh','api',endpoint],capture_output=True,text=True,encoding='utf-8',timeout=80)
    if p.returncode:
        raise RuntimeError(p.stderr[:400])
    return json.loads(p.stdout)

def collect(spec):
    repo,paths=spec
    meta=api('repos/'+repo)
    commit=api('repos/'+repo+'/commits/'+meta['default_branch'])['sha']
    base=DEST/'upstream'/repo.replace('/','--')
    files=[]
    errors=[]
    for relative in paths:
        url=f'https://raw.githubusercontent.com/{repo}/{commit}/{relative}'
        try:
            with urlopen(Request(url,headers={'User-Agent':'PoseLookResearchArchive/1.0'}),timeout=45) as r:
                blob=r.read(2_000_001)
            if len(blob)>2_000_000:
                raise ValueError('Selected source exceeds the 2 MB/file archive limit')
            target=base/(relative+'.txt')
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(blob)
            files.append({'path':target.relative_to(DEST).as_posix(),'upstreamPath':relative,
                          'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest(),
                          'sourceUrl':f'https://github.com/{repo}/blob/{commit}/{relative}'})
        except Exception as error:
            errors.append({'path':relative,'error':str(error)[:300]})
    result={'repository':repo,'commit':commit,'branch':meta['default_branch'],
            'pushedAt':meta['pushed_at'],'licenseTag':(meta.get('license') or {}).get('spdx_id'),
            'archived':meta['archived'],'files':files,'errors':errors,
            'scope':'Selected docs, licences and implementation evidence only; not a complete source distribution.'}
    print(f'{repo}: {len(files)} selected files, {len(errors)} errors',flush=True)
    return result

def main():
    DEST.mkdir(parents=True,exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        results=list(pool.map(collect,SPECS))
    manifest={'schemaVersion':1,'retrievedAt':datetime.now(timezone.utc).isoformat(),'repositories':results,
              'totalBytes':sum(f['bytes'] for r in results for f in r['files']),
              'fileCount':sum(len(r['files']) for r in results),
              'scope':'No original gallery images, model checkpoints, dependencies or full Git histories.'}
    (DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (ROOT/'app'/'archive-data.js').write_text('window.ARCHIVE_STATUS = '+json.dumps(manifest,ensure_ascii=False)+';\n',encoding='utf-8')
    print(json.dumps({'files':manifest['fileCount'],'KiB':round(manifest['totalBytes']/1024,1),
                      'errors':sum(len(r['errors']) for r in results)}),flush=True)
    if any(r['errors'] for r in results):
        raise SystemExit(1)

if __name__=='__main__':main()
