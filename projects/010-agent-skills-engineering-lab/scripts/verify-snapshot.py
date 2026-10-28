"""Verify the saved snapshot against its manifest (not upstream authenticity)."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'research' / 'upstream'
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
expected = {row['path']: row for row in manifest['files']}
actual = {p.relative_to(root).as_posix() for p in root.rglob('*') if p.is_file()} - {'manifest.json'}
errors = []
if set(expected) != actual:
    errors.append('file set differs from manifest')
for path, item in expected.items():
    file = root / path
    if not file.is_file():
        errors.append(f'missing: {path}')
        continue
    content = file.read_bytes()
    if len(content) != item['bytes'] or hashlib.sha256(content).hexdigest() != item['sha256']:
        errors.append(f'mismatch: {path}')
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f'PASS: {len(expected)} files match the saved manifest; {sum(p.endswith("/SKILL.md") for p in expected)} skills.')
