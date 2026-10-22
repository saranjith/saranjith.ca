#!/usr/bin/env python3
"""Validate the static site's report-only CSP against deployed HTML sources."""

import base64
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
PAGES = ("index.html", "humane.html", "404.html")
SCRIPT = re.compile(rb"<script\b([^>]*)>(.*?)</script\s*>", re.I | re.S)


class Resources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.items = []
        self.inline_styles = 0
        self.inline_events = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "style" in attrs:
            self.inline_styles += 1
        self.inline_events.extend(key for key in attrs if key.startswith("on"))
        if tag == "script" and attrs.get("src"):
            self.items.append(("script-src", attrs["src"]))
        elif tag == "link" and attrs.get("href"):
            rel = (attrs.get("rel") or "").lower().split()
            directive = (
                "style-src" if "stylesheet" in rel else
                "img-src" if "icon" in rel or "apple-touch-icon" in rel else
                "manifest-src" if "manifest" in rel else None
            )
            if directive:
                self.items.append((directive, attrs["href"]))
        elif tag in ("img", "source"):
            for key in ("src", "srcset"):
                if attrs.get(key):
                    urls = attrs[key].split(",") if key == "srcset" else (attrs[key],)
                    self.items.extend(("img-src", u.strip().split()[0]) for u in urls)
        elif tag in ("video", "audio") and attrs.get("src"):
            self.items.append(("media-src", attrs["src"]))
        elif tag == "iframe" and attrs.get("src"):
            self.items.append(("frame-src", attrs["src"]))


def allows(sources, url):
    parts = urlsplit(url)
    if parts.scheme == "data":
        return "data:" in sources
    if not parts.netloc:
        return "'self'" in sources
    origin = f"{parts.scheme}://{parts.netloc}"
    return any(
        source == origin or
        (source.startswith("https://*.") and parts.scheme == "https" and
         parts.netloc.endswith(source[len("https://*"):]))
        for source in sources
    )


def main():
    config = json.loads((ROOT / "vercel.json").read_text())
    headers = {entry["key"]: entry["value"] for entry in config["headers"][0]["headers"]}
    assert headers["Permissions-Policy"] == "camera=(), microphone=(), geolocation=()"
    assert "Content-Security-Policy" not in headers
    assert "Access-Control-Allow-Origin" not in headers
    policy = headers["Content-Security-Policy-Report-Only"]
    directives = dict(part.strip().split(" ", 1) for part in policy.split(";"))
    sources = {key: value.split() for key, value in directives.items()}
    assert "'unsafe-inline'" not in sources["script-src"]
    assert "'unsafe-eval'" not in sources["script-src"]
    assert sources["script-src-attr"] == ["'none'"]
    assert "'unsafe-inline'" in sources["style-src"]  # Artwork uses style attributes.

    hashes = set()
    checked = 0
    style_attrs = 0
    for name in PAGES:
        data = (DIST / name).read_bytes()
        page = Resources()
        page.feed(data.decode("utf-8"))
        style_attrs += page.inline_styles
        assert not page.inline_events, (name, page.inline_events)
        for match in SCRIPT.finditer(data):
            if re.search(rb"\bsrc\s*=", match.group(1), re.I):
                continue
            digest = base64.b64encode(hashlib.sha256(match.group(2)).digest()).decode("ascii")
            source = f"'sha256-{digest}'"
            assert source in sources["script-src"], (name, source)
            hashes.add(source)
        for directive, url in page.items:
            if url.startswith("#"):
                continue
            allowed = sources.get(directive, sources["default-src"])
            assert allows(allowed, url), (name, directive, url)
            parts = urlsplit(url)
            if not parts.netloc and not parts.scheme and not parts.path.startswith("/_vercel/"):
                assert (DIST / parts.path.lstrip("/")).is_file(), (name, url)
            checked += 1
    declared_hashes = {source for source in sources["script-src"] if source.startswith("'sha256-")}
    assert hashes == declared_hashes, ("stale or missing hashes", hashes ^ declared_hashes)

    # Dependencies fetched dynamically by Google Analytics and Speed Insights.
    for url in (
        "https://www.google-analytics.com/g/collect",
        "https://region1.google-analytics.com/g/collect",
        "https://www.google.com/pagead/1p-user-list/",
        "https://vitals.vercel-insights.com/v2/vitals",
    ):
        assert allows(sources["connect-src"], url), url
    for url in ("https://www.googletagmanager.com/gtag/js", "https://fonts.googleapis.com/css2"):
        directive = "script-src" if "gtag" in url else "style-src"
        assert allows(sources[directive], url), (directive, url)
    assert allows(sources["font-src"], "https://fonts.gstatic.com/s/dmsans/font.woff2")

    for path in DIST.glob("*.css"):
        for raw in re.findall(r"url\(\s*['\"]?([^)'\"]+)", path.read_text()):
            url = raw.strip()
            assert allows(sources["img-src"], url), (path.name, url)
            if not urlsplit(url).netloc and not url.startswith("data:"):
                assert (path.parent / urlsplit(url).path).is_file(), (path.name, url)
    print(f"OK: {len(PAGES)} pages, {checked} static resources, {len(hashes)} exact inline-script hashes, {style_attrs} inline style attributes")


if __name__ == "__main__":
    main()
