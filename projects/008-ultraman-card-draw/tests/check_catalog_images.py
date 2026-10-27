"""Read-only audit of catalog image links; no user collection data is read."""
from __future__ import annotations

import concurrent.futures
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

APP = pathlib.Path(__file__).resolve().parents[1] / "app"


def catalog():
    for path in sorted(APP.glob("characters*.js")):
        text = path.read_text(encoding="utf-8")
        match = re.search(r"globalThis\.\w+\s*=\s*(\[[\s\S]*\])\s*;\s*$", text)
        if not match:
            raise ValueError(f"Cannot parse {path.name}")
        for card in json.loads(match.group(1)):
            yield {"file": path.name, "id": card["id"], "name": card["name"], "url": card.get("imageUrl", "")}


def check(item):
    if not item["url"].startswith("https://"):
        return {**item, "status": "invalid_url"}
    parts = urllib.parse.urlsplit(item["url"])
    request_url = urllib.parse.urlunsplit((parts.scheme, parts.netloc, urllib.parse.quote(parts.path, safe="/%:@"), parts.query, parts.fragment))
    last = "unknown"
    for attempt in range(3):
        try:
            req = urllib.request.Request(request_url, headers={"User-Agent": "Mozilla/5.0", "Range": "bytes=0-63", "Accept": "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8"})
            with urllib.request.urlopen(req, timeout=20) as response:
                content_type = response.headers.get_content_type()
                if 200 <= response.status < 300 and content_type.startswith("image/"):
                    return {**item, "status": "ok"}
                last = f"http_{response.status}_{content_type}"
        except urllib.error.HTTPError as error:
            last = f"http_{error.code}"
        except Exception as error:
            last = f"network_{type(error).__name__}"
        if attempt < 2:
            time.sleep(0.5 * (attempt + 1))
    return {**item, "status": last}


def main():
    items = list(catalog())
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(check, items))
    failures = [item for item in results if item["status"] != "ok"]
    print(json.dumps({"total": len(results), "ok": len(results) - len(failures), "failures": failures}, ensure_ascii=False, indent=2))
    return bool(failures)


if __name__ == "__main__":
    sys.exit(main())
