"""Fetch pinned support files without importing or executing upstream code."""
import hashlib
import io
import json
from pathlib import Path
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SHA = "b8d050f24f2e1c465c4410eace8634ea3af15930"
url = f"https://codeload.github.com/Imbad0202/academic-research-skills/zip/{SHA}"
request = urllib.request.Request(url, headers={"User-Agent": "AquaticToxicologyResearch/1.0"})
with urllib.request.urlopen(request, timeout=90) as response:
    archive = response.read()
archive_path = ROOT / "research" / "upstream-source.zip"
archive_path.write_bytes(archive)
destination = ROOT / "research" / "upstream"
selected = ("scripts/", "shared/", ".claude-plugin/", "docs/")
root_files = {"LICENSE", "NOTICE.md", "POSITIONING.md", "README.md", "README.zh-CN.md", "THIRD_PARTY.md"}
with zipfile.ZipFile(io.BytesIO(archive)) as zf:
    for member in zf.infolist():
        parts = Path(member.filename).parts[1:]
        if not parts or member.is_dir():
            continue
        relative = "/".join(parts)
        if not (relative.startswith(selected) or relative in root_files):
            continue
        if ".." in parts:
            raise ValueError("Unexpected traversal in archive")
        target = destination.joinpath(*parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(zf.read(member))
files = []
for path in sorted(destination.rglob("*")):
    if path.is_file():
        files.append({"path": path.relative_to(destination).as_posix(), "bytes": path.stat().st_size,
                      "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
manifest = {"repository": "https://github.com/Imbad0202/academic-research-skills", "commit": SHA,
            "retrieved_at": "2026-10-29", "archive_sha256": hashlib.sha256(archive).hexdigest(),
            "license": "CC-BY-NC-4.0", "installer": "skill-installer/install-skill-from-github.py",
            "execution": "Original skill instructions executed by Codex tools; Claude plugin hooks are not active.",
            "files": files}
(ROOT / "research" / "upstream-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"commit": SHA, "files": len(files), "archive_bytes": len(archive), "sha256": manifest["archive_sha256"]}))
