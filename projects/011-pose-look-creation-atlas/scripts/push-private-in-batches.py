"""Push a new, owner-only preservation repository in bounded Git packs.

Only for the dedicated backup directory, never the research repository. Existing
working files are not moved, removed or rewritten. A separate temporary Git index
builds cumulative trees from already indexed blobs. No force pushes are used.
"""
import argparse, json, os, subprocess, time
from pathlib import Path

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('directory',type=Path)
p.add_argument('--repository',default='yydshly/pose-look-reference-backup')
args=p.parse_args(); root=args.directory.resolve()

def git(*argv,input=None,env=None):
    process=subprocess.Popen(['git','-C',str(root),*argv],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=env)
    try:
        out,err=process.communicate(input,timeout=180)
    except subprocess.TimeoutExpired:
        if os.name=='nt':subprocess.run(['taskkill','/PID',str(process.pid),'/T','/F'],capture_output=True)
        else:process.kill()
        process.communicate()
        raise RuntimeError('Git operation timed out; working files are intact and remote progress can be resumed.')
    result=subprocess.CompletedProcess(process.args,process.returncode,out,err)
    if result.returncode:
        raise RuntimeError(result.stderr.decode('utf-8',errors='replace')[-1500:])
    return result.stdout

meta=json.loads(subprocess.check_output(['gh','api','repos/'+args.repository],timeout=80))
if not meta['private'] or root.name!='pose-db-20261029' or (root/'.git').is_dir() is False:
    raise SystemExit('Dedicated private backup repository required.')
remote=git('remote','get-url','origin').decode().strip()
if remote!='https://github.com/'+args.repository+'.git':
    raise SystemExit('Unexpected remote URL')
remote_refs=git('ls-remote','--heads','origin').decode().strip().splitlines()
if any(not line.endswith('refs/heads/main') for line in remote_refs):
    raise SystemExit('Unexpected remote branches')
previous=remote_refs[0].split()[0] if remote_refs else None
if git('status','--porcelain').strip():
    raise SystemExit('Commit the dedicated backup contents before batching.')

entries=git('ls-files','-s','-z').split(b'\0')
entries=[e for e in entries if e]
entries.sort(key=lambda e:(b'\toriginal-images/' in e,e))
env=dict(os.environ,GIT_INDEX_FILE=str(root/'.git'/'preservation-stream-index'))
already={}
if previous:
    for e in git('ls-tree','-r','-z',previous).split(b'\0'):
        if e:
            info,name=e.split(b'\t',1);already[name]=info.split()[2]
    staged={e.split(b'\t',1)[1]:e.split()[1] for e in entries}
    if any(staged.get(name)!=sha for name,sha in already.items()):
        raise SystemExit('Existing remote is not an exact subset of these archive blobs; refusing to replace it.')
    git('read-tree',previous,env=env)
    entries=[e for e in entries if e.split(b'\t',1)[1] not in already]
else:git('read-tree','--empty',env=env)
git('config','http.version','HTTP/1.1')
git('config','http.postBuffer','67108864')
git('config','http.lowSpeedLimit','1024');git('config','http.lowSpeedTime','40')
parent=previous; current=[]; total=0; batch=0
for index,entry in enumerate(entries):
    relative=entry.split(b'\t',1)[1].decode('utf-8')
    current.append(entry); total+=(root/relative).stat().st_size
    if total<32*1024**2 and index<len(entries)-1: continue
    batch+=1
    git('update-index','-z','--index-info',input=b'\0'.join(current)+b'\0',env=env)
    tree=git('write-tree',env=env).decode().strip()
    commit_args=['commit-tree',tree]
    if parent: commit_args+=['-p',parent]
    commit=git(*commit_args,input=f'Preserve references: batch {batch}, {index+1}/{len(entries)} files\n'.encode()).decode().strip()
    for attempt in range(3):
        try:
            git('push','--quiet','origin',commit+':refs/heads/main');break
        except RuntimeError as error:
            if attempt==2:raise
            print(f'Batch {batch} retry {attempt+1}: {str(error)[:180]}',flush=True);time.sleep(3)
    print(f'Pushed batch {batch}: {index+1+len(already)}/{len(entries)+len(already)} files ({total/1024**2:.1f} MiB in batch)',flush=True)
    parent=commit;current=[];total=0
git('update-ref','refs/heads/main',parent)
git('config','branch.main.remote','origin');git('config','branch.main.merge','refs/heads/main')
print(json.dumps({'remoteCommit':parent,'files':len(entries)+len(already),'batches':batch}),flush=True)
