"""Retrieve B0005.mat from NASA's nested ZIP with bounded public range reads."""
import hashlib
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile

ARCHIVE = "https://phm-datasets.s3.amazonaws.com/NASA/5.+Battery+Data+Set.zip"
MEMBER = "5. Battery Data Set/1. BatteryAgingARC-FY08Q4.zip"
DIRECTORY = Path(__file__).resolve().parent


class RangeArchive:
    def __init__(self, url):
        self.url = url
        self.offset = 0
        self.ranges = []
        with urlopen(Request(url, method="HEAD"), timeout=30) as response:
            self.size = int(response.headers["Content-Length"])
            self.etag = response.headers["ETag"]

    def tell(self):
        return self.offset

    def seek(self, offset, whence=io.SEEK_SET):
        base = {io.SEEK_SET: 0, io.SEEK_CUR: self.offset, io.SEEK_END: self.size}
        self.offset = base[whence] + offset
        if self.offset < 0:
            raise OSError("Archive seek before start")
        return self.offset

    def seekable(self):
        return True

    def read(self, count=-1):
        if self.offset >= self.size or count == 0:
            return b""
        first = self.offset
        last = self.size - 1 if count < 0 else min(first + count - 1, self.size - 1)
        if last - first + 1 > 32 * 1024 * 1024:
            raise OSError("Archive range exceeds the bounded request limit")
        request = Request(self.url, headers={"Range": f"bytes={first}-{last}", "If-Match": self.etag})
        with urlopen(request, timeout=60) as response:
            if response.status != 206 or response.headers["Content-Range"] != f"bytes {first}-{last}/{self.size}":
                raise OSError("Unexpected archive response")
            body = response.read()
        if len(body) != last - first + 1:
            raise OSError("Incomplete archive range")
        self.ranges.append([first, last])
        self.offset += len(body)
        return body


def main():
    remote = RangeArchive(ARCHIVE)
    with ZipFile(remote) as outer:
        nested_info = outer.getinfo(MEMBER)
        with outer.open(nested_info) as member:
            nested = b"".join(iter(lambda: member.read(16 * 1024 * 1024), b""))
    with ZipFile(io.BytesIO(nested)) as inner:
        path = next(name for name in inner.namelist() if Path(name).name == "B0005.mat")
        sample_info = inner.getinfo(path)
        sample = inner.read(sample_info)

    (DIRECTORY / "raw").mkdir(exist_ok=True)
    (DIRECTORY / "raw" / "B0005.mat").write_bytes(sample)
    receipt = {
        "archiveUrl": ARCHIVE,
        "archiveBytes": remote.size,
        "archiveEtag": remote.etag,
        "rangeStatus": 206,
        "ranges": remote.ranges,
        "member": MEMBER,
        "memberCrc32": f"{nested_info.CRC:08x}",
        "memberSha256": hashlib.sha256(nested).hexdigest(),
        "matFile": path,
        "matCrc32": f"{sample_info.CRC:08x}",
        "matSha256": hashlib.sha256(sample).hexdigest(),
        "matBytes": len(sample),
        "retrievedAtUtc": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }
    (DIRECTORY / "source-receipt.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    main()
