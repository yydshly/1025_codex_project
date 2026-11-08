"""Process only completed verified downloads, one source file at a time."""
import json
import subprocess
import sys
import time
from pathlib import Path

root = Path(__file__).resolve().parent
listing = json.loads((root / 'half-day-objects.json').read_text(encoding='utf-8-sig'))
expected = {Path(x['Key']).name: int(x['Size']) for x in listing}
deadline = time.monotonic() + 2400
done = set()
while time.monotonic() < deadline:
    ready = [p for p in sorted((root / 'raw').glob('*.bz2'))
             if p.name in expected and p.name not in done and p.stat().st_size == expected[p.name]]
    if ready:
        subprocess.run([sys.executable, str(root / 'process_himawari.py'), *map(str, ready)], check=True)
        done.update(p.name for p in ready)
        print(f'Processed {len(done)}/{len(expected)} verified raw frames.', flush=True)
    if len(done) == len(expected):
        break
    time.sleep(8)
else:
    raise TimeoutError(f'Only {len(done)} of {len(expected)} raw files arrived within 40 minutes')
print('All available half-day frames processed; archive gap remains unfilled.', flush=True)
