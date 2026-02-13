#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, List, Optional, Tuple

BASE_URL = "https://normmacdonaldarchive.com"
SITEMAP_URL = f"{BASE_URL}/sitemap.xml"
UA = "Mozilla/5.0"
RATE_LIMIT_SECONDS = 1.0
OUT_DIR = Path("competitor_data")

CATEGORY_HUB_PATHS = ["/nml", "/standup", "/blue-card-jokes", "/bucket-list", "/the-list"]
_last_request_ts = 0.0


def ensure_out_dir() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)


def polite_sleep() -> None:
    global _last_request_ts
    elapsed = time.time() - _last_request_ts
    if elapsed < RATE_LIMIT_SECONDS:
        time.sleep(RATE_LIMIT_SECONDS - elapsed)


def fetch_url(url: str, retries_403: int = 1) -> Optional[str]:
    global _last_request_ts
    attempts = 0
    while attempts <= retries_403:
        attempts += 1
        polite_sleep()
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                body = resp.read().decode("utf-8", errors="replace")
                _last_request_ts = time.time()
                return body
        except urllib.error.HTTPError as exc:
            _last_request_ts = time.time()
            if exc.code == 403 and attempts <= retries_403:
                print(f"403 for {url}; retrying once after 3s", flush=True)
                time.sleep(3)
                continue
            print(f"HTTP {exc.code} for {url}; skipping", flush=True)
            return None
        except Exception as exc:  # noqa: BLE001
            _last_request_ts = time.time()
            print(f"Request error for {url}: {exc}; skipping", flush=True)
            return None
    return None


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.metas: Dict[str, str] = {}
        self.nav_links: List[Dict[str, str]] = []
        self.links: List[Dict[str, str]] = []
        self.headings: List[Dict[str, str]] = []
        self.paragraphs: List[str] = []

        self._in_title = False
        self._title_parts: List[str] = []
        self._heading_tag: Optional[str] = None
        self._heading_parts: List[str] = []
        self._in_p = False
        self._p_parts: List[str] = []
        self._nav_depth = 0
        self._link_href: Optional[str] = None
        self._link_parts: List[str] = []
        self._link_in_nav = False

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        attr = {k: (v or "") for k, v in attrs}
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            name = attr.get("name") or attr.get("property")
            content = attr.get("content", "")
            if name and content:
                self.metas[name.strip()] = content.strip()
        elif tag == "nav":
            self._nav_depth += 1
        elif tag in {"h1", "h2", "h3"}:
            self._heading_tag = tag
            self._heading_parts = []
        elif tag == "p":
            self._in_p = True
            self._p_parts = []
        elif tag == "a":
            self._link_href = attr.get("href", "").strip()
            self._link_parts = []
            self._link_in_nav = self._nav_depth > 0

    def handle_endtag(self, tag: str) -> None:
        if tag == "title" and self._in_title:
            self._in_title = False
            self.title = normalize_ws(" ".join(self._title_parts))
            self._title_parts = []
        elif tag == "nav" and self._nav_depth > 0:
            self._nav_depth -= 1
        elif tag in {"h1", "h2", "h3"} and self._heading_tag == tag:
            text = normalize_ws(" ".join(self._heading_parts))
            if text:
                self.headings.append({"tag": tag, "text": text})
            self._heading_tag = None
        elif tag == "p" and self._in_p:
            self._in_p = False
            text = normalize_ws(" ".join(self._p_parts))
            if text:
                self.paragraphs.append(text)
        elif tag == "a" and self._link_href is not None:
            text = normalize_ws(" ".join(self._link_parts))
            link = {"href": self._link_href, "text": text}
            self.links.append(link)
            if self._link_in_nav:
                self.nav_links.append(link)
            self._link_href = None
            self._link_parts = []
            self._link_in_nav = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self._title_parts.append(data)
        if self._heading_tag:
            self._heading_parts.append(data)
        if self._in_p:
            self._p_parts.append(data)
        if self._link_href is not None:
            self._link_parts.append(data)


def normalize_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def unescape_js_string(text: str) -> str:
    try:
        text = bytes(text, "utf-8").decode("unicode_escape")
    except Exception:  # noqa: BLE001
        pass
    return html.unescape(text).replace("\\/", "/").strip()


def parse_sitemap(xml_text: str) -> List[str]:
    root = ET.fromstring(xml_text)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [loc.text.strip() for loc in root.findall("sm:url/sm:loc", ns) if loc.text]


def classify_urls(urls: List[str]) -> Dict[str, List[str]]:
    hubs = {f"{BASE_URL}{p}" for p in CATEGORY_HUB_PATHS}
    out = {"appearance_pages": [], "category_hubs": [], "other_pages": []}
    for u in urls:
        if "/the-list/appearance-" in u:
            out["appearance_pages"].append(u)
        elif u in hubs:
            out["category_hubs"].append(u)
        else:
            out["other_pages"].append(u)
    for k in out:
        out[k] = sorted(out[k])
    return out


def extract_from_next_payload(html_text: str) -> Dict[str, Optional[str]]:
    data: Dict[str, Optional[str]] = {
        "title": None,
        "date": None,
        "mediaType": None,
        "description": None,
        "url": None,
        "duration": None,
    }
    marker = '"id":"appearance-'
    pos = html_text.find(marker)
    if pos == -1:
        return data
    window = html_text[pos : pos + 7000]
    for key in ["title", "date", "mediaType", "description", "url", "duration"]:
        m = re.search(rf'"{key}":"(.*?)"', window)
        if m:
            data[key] = unescape_js_string(m.group(1))
    return data


def infer_media_type(url: Optional[str], text: Optional[str]) -> Optional[str]:
    s = ((url or "") + " " + (text or "")).lower()
    if "youtube.com" in s or "youtu.be" in s or any(x in s for x in [".mp4", ".m4v", ".mov", ".webm"]):
        return "video"
    if any(x in s for x in [".mp3", ".wav", ".m4a", ".flac"]):
        return "audio"
    if any(x in s for x in [".pdf", ".txt", "article", "interview"]):
        return "article"
    return None


def extract_appearance_payload(html_text: str) -> Dict[str, Optional[str]]:
    parser = PageParser()
    parser.feed(html_text)
    next_data = extract_from_next_payload(html_text)

    title = next_data.get("title") or parser.metas.get("og:title") or parser.title or None
    if title:
        title = title.replace(" | Norm Macdonald Archive", "").strip()

    date = next_data.get("date")
    if not date and title:
        m = re.search(r"(\d{1,2}/\d{1,2}/\d{4})", title)
        if m:
            date = m.group(1)

    description = next_data.get("description") or parser.metas.get("og:description") or parser.metas.get("description") or None
    media_url = next_data.get("url") or parser.metas.get("og:url") or None
    media_type = (next_data.get("mediaType") or "").lower() or infer_media_type(media_url, description)

    return {
        "title": title,
        "date": date,
        "show": title,
        "description": description,
        "media_url": media_url,
        "media_type": media_type,
        "duration": next_data.get("duration"),
        "thumbnail": parser.metas.get("og:image") or parser.metas.get("twitter:image"),
    }


def extract_hub_content(source_url: str, html_text: str) -> Dict[str, object]:
    parser = PageParser()
    parser.feed(html_text)

    links = []
    for link in parser.links:
        href = link.get("href", "")
        if not href:
            continue
        if href.startswith("/"):
            href = f"{BASE_URL}{href}"
        elif not href.startswith("http"):
            continue
        if "/_next/" in href:
            continue
        links.append({"href": href, "text": link.get("text", "")})

    uniq, seen = [], set()
    for link in links:
        key = (link["href"], link["text"])
        if key not in seen:
            seen.add(key)
            uniq.append(link)

    return {
        "source_page_url": source_url,
        "page_title": parser.title,
        "description": parser.metas.get("description") or parser.metas.get("og:description"),
        "headings": parser.headings,
        "navigation": parser.nav_links,
        "appearance_links": [x for x in uniq if "/the-list/appearance-" in x["href"]],
        "all_links": uniq,
    }


def extract_homepage_content(source_url: str, html_text: str) -> Dict[str, object]:
    base = extract_hub_content(source_url, html_text)
    parser = PageParser()
    parser.feed(html_text)
    nav_hrefs = {x.get("href", "") for x in parser.nav_links}
    curated = [x for x in base["all_links"] if x.get("href") not in nav_hrefs and x.get("href", "").startswith(BASE_URL)]
    base["section_headings"] = parser.headings
    base["section_descriptions"] = parser.paragraphs
    base["curated_links"] = curated
    return base


def write_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def parse_date_text(date_text: Optional[str]) -> Optional[datetime]:
    if not date_text:
        return None
    for fmt in ["%m/%d/%Y", "%Y-%m-%d", "%b %d, %Y", "%B %d, %Y"]:
        try:
            return datetime.strptime(date_text.strip(), fmt)
        except ValueError:
            pass
    return None


def create_summary(appearances: List[Dict[str, object]]) -> str:
    show_counter = Counter((a.get("show") or "Unknown") for a in appearances)
    link_counter = Counter()
    no_media = []
    dates = []

    for a in appearances:
        u = (a.get("media_url") or "").lower()
        if not u:
            link_counter["none"] += 1
            no_media.append(a.get("source_page_url"))
        elif "archive.org" in u:
            link_counter["archive.org"] += 1
        elif "youtube.com" in u or "youtu.be" in u:
            link_counter["youtube"] += 1
        else:
            link_counter["other"] += 1

        dt = parse_date_text(a.get("date"))
        if dt:
            dates.append(dt)

    earliest = min(dates).strftime("%Y-%m-%d") if dates else "N/A"
    latest = max(dates).strftime("%Y-%m-%d") if dates else "N/A"

    lines = ["# Competitor Data Summary", "", f"- Total appearances found: **{len(appearances)}**", "", "## Breakdown by category/show", ""]
    lines.extend([f"- {k}: {v}" for k, v in show_counter.most_common()])
    lines.extend(["", "## Unique shows/venues", ""])
    lines.extend([f"- {k}" for k in sorted(show_counter.keys())])
    lines.extend([
        "",
        "## Media link type counts",
        "",
        f"- archive.org: {link_counter.get('archive.org', 0)}",
        f"- YouTube: {link_counter.get('youtube', 0)}",
        f"- Other: {link_counter.get('other', 0)}",
        f"- No media link: {link_counter.get('none', 0)}",
        "",
        "## Entries with no media link",
        "",
    ])
    lines.extend([f"- {u}" for u in no_media])
    lines.extend(["", "## Date range", "", f"- Earliest appearance date: {earliest}", f"- Latest appearance date: {latest}", ""])
    return "\n".join(lines)


def main() -> None:
    ensure_out_dir()

    print("Phase 1: Fetching sitemap...", flush=True)
    sitemap_xml = fetch_url(SITEMAP_URL)
    if not sitemap_xml:
        raise SystemExit("Failed to fetch sitemap.xml")

    urls = parse_sitemap(sitemap_xml)
    (OUT_DIR / "all_urls.txt").write_text("\n".join(urls) + "\n", encoding="utf-8")
    inventory = classify_urls(urls)
    write_json(OUT_DIR / "url_inventory.json", inventory)

    appearance_urls = inventory["appearance_pages"]
    print(f"Phase 2: Scraping {len(appearance_urls)} appearance pages...", flush=True)
    appearances: List[Dict[str, object]] = []
    for i, url in enumerate(appearance_urls, start=1):
        page = fetch_url(url)
        if not page:
            appearances.append({
                "title": None,
                "date": None,
                "show": None,
                "description": None,
                "media_url": None,
                "media_type": None,
                "duration": None,
                "thumbnail": None,
                "source_page_url": url,
                "error": "fetch_failed",
            })
        else:
            item = extract_appearance_payload(page)
            item["source_page_url"] = url
            appearances.append(item)

        if i % 50 == 0:
            print(f"  processed {i}/{len(appearance_urls)}", flush=True)

    write_json(OUT_DIR / "appearances.json", appearances)

    print("Phase 3: Scraping category hubs...", flush=True)
    hub_outputs = {
        f"{BASE_URL}/nml": OUT_DIR / "nml_episodes.json",
        f"{BASE_URL}/standup": OUT_DIR / "standup_specials.json",
        f"{BASE_URL}/blue-card-jokes": OUT_DIR / "blue_card_jokes.json",
        f"{BASE_URL}/bucket-list": OUT_DIR / "bucket_list.json",
        f"{BASE_URL}/the-list": OUT_DIR / "the_list_index.json",
    }
    for hub_url, out_file in hub_outputs.items():
        page = fetch_url(hub_url)
        data: Dict[str, object] = {"source_page_url": hub_url, "error": "fetch_failed"}
        if page:
            data = extract_hub_content(hub_url, page)
        write_json(out_file, data)

    print("Phase 4: Scraping homepage...", flush=True)
    home = fetch_url(f"{BASE_URL}/")
    home_data: Dict[str, object] = {"source_page_url": f"{BASE_URL}/", "error": "fetch_failed"}
    if home:
        home_data = extract_homepage_content(f"{BASE_URL}/", home)
    write_json(OUT_DIR / "homepage_content.json", home_data)

    print("Phase 5: Writing summary report...", flush=True)
    (OUT_DIR / "SUMMARY.md").write_text(create_summary(appearances), encoding="utf-8")
    print("Done.", flush=True)


if __name__ == "__main__":
    main()
