#!/usr/bin/env python3
"""Run delegated archive data tasks:
1) Joke merge + dedupe into jokes-data.json
2) Video metadata enrichment + auto-categorization in consolidated_youtube_data.json
3) Transcript extraction from PDF into transcripts.json
"""
from __future__ import annotations

import csv
import json
import re
from collections import Counter
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parent

JOKES_PATH = ROOT / "jokes-data.json"
FULL_JOKES_CSV = ROOT / "old/site-src/FullNormJokes.csv"
TRANSCRIBED_TXT = ROOT / "old/site-src/NormMacdonald-Live-Jokes-Transcribed.txt"
VIDEOS_PATH = ROOT / "consolidated_youtube_data.json"
TRANSCRIPTS_PATH = ROOT / "transcripts.json"
PDF_PATH = ROOT / "old/site-src/341060525-Norm-Macdonald-Live-Jokes-Transcribed.pdf"


def _normalize_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", (text or "")).strip()
    cleaned = cleaned.strip('"“”')
    return cleaned


def _dedupe_key(text: str) -> str:
    normalized = _normalize_text(text).lower()
    normalized = re.sub(r"[^a-z0-9 ]+", "", normalized)
    return normalized


def load_existing_jokes() -> list[dict]:
    with JOKES_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    out = []
    for row in data:
        out.append(
            {
                "joke": _normalize_text(row.get("joke", "")),
                "episode": row.get("episode", ""),
                "guest": row.get("guest", ""),
                "url": row.get("url", ""),
                "time": row.get("time", ""),
                "source": row.get("source", "legacy-jokes-data"),
            }
        )
    return out


def load_csv_jokes() -> list[dict]:
    jokes: list[dict] = []
    with FULL_JOKES_CSV.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            text = _normalize_text(row.get("Joke", ""))
            if not text:
                continue
            jokes.append(
                {
                    "joke": text,
                    "episode": row.get("Episode", ""),
                    "guest": row.get("Guest", ""),
                    "url": row.get("URL", ""),
                    "time": row.get("Time", ""),
                    "source": "FullNormJokes.csv",
                }
            )
    return jokes


def load_txt_jokes() -> list[dict]:
    content = TRANSCRIBED_TXT.read_text(encoding="utf-8", errors="ignore")
    lines = [line.strip() for line in content.splitlines()]
    current_guest = ""
    jokes: list[dict] = []

    guest_markers = {
        "SUPER DAVE": "Super Dave Osborne",
        "TOM GREEN": "Tom Green",
        "RUSSELL BRAND": "Russell Brand",
        "BOB SAGET": "Bob Saget",
        "DAVID SPADE": "David Spade",
        "TIM ALLEN": "Tim Allen",
        "GILBERT GOTTFRIED": "Gilbert Gottfried",
        "KEVIN NEALON": "Kevin Nealon",
    }

    for line in lines:
        if not line:
            continue
        upper = line.upper()
        if upper in guest_markers:
            current_guest = guest_markers[upper]
            continue
        match = re.match(r"^(\d+)\.(.+)$", line)
        if not match:
            continue
        text = _normalize_text(match.group(2))
        if len(text) < 12:
            continue
        jokes.append(
            {
                "joke": text,
                "episode": "Norm Macdonald Live",
                "guest": current_guest,
                "url": "",
                "time": "",
                "source": "NormMacdonald-Live-Jokes-Transcribed.txt",
            }
        )
    return jokes


def merge_jokes(sources: Iterable[list[dict]]) -> list[dict]:
    merged: list[dict] = []
    seen: set[str] = set()
    for source in sources:
        for joke in source:
            key = _dedupe_key(joke.get("joke", ""))
            if not key or key in seen:
                continue
            seen.add(key)
            merged.append(joke)

    merged.sort(key=lambda j: (j.get("guest", ""), j.get("episode", ""), j.get("joke", "")[:60]))
    for i, row in enumerate(merged):
        row["id"] = i
    return merged


def extract_video_id(url: str) -> str:
    match = re.search(r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/shorts/)([A-Za-z0-9_-]{11})", url or "")
    return match.group(1) if match else ""


def categorize_video(title: str, description: str) -> tuple[str, list[str]]:
    hay = f"{title} {description}".lower()
    rules = [
        ("SNL", ["snl", "weekend update", "saturday night live"]),
        ("Norm Macdonald Live", ["norm macdonald live", "nml", "adam eget"]),
        ("Podcast", ["podcast", "joe rogan", "conan o'brien needs a friend"]),
        ("Stand-Up", ["stand up", "stand-up", "special", "set at", "comedy central"]),
        ("Talk Show", ["letterman", "conan", "late night", "tonight show", "seth meyers"]),
        ("Interview", ["interview", "speaks with", "talks with"]),
        ("Compilation", ["best of", "compilation", "funniest", "moments"]),
        ("Tribute", ["tribute", "remembering", "in memory", "rip norm"]),
    ]
    for label, needles in rules:
        if any(n in hay for n in needles):
            tags = [label.lower().replace(" ", "-")]
            if "norm" in hay:
                tags.append("norm-macdonald")
            return label, tags
    return "Other", ["other"]


def enrich_videos() -> tuple[list[dict], Counter]:
    data = json.loads(VIDEOS_PATH.read_text(encoding="utf-8"))
    counts: Counter = Counter()
    for row in data:
        title = row.get("Title", "")
        description = row.get("Description", "")
        video_url = row.get("Video url", "")
        video_id = extract_video_id(video_url)
        category, tags = categorize_video(title, description)

        row["video_id"] = video_id
        row["normalized_url"] = f"https://www.youtube.com/watch?v={video_id}" if video_id else video_url
        row["category"] = category
        row["tags"] = tags
        row["source_type"] = "youtube"

        uploaded = row.get("Uploaded Time", "")
        year_match = re.search(r"(19|20)\d{2}", f"{uploaded} {title} {description}")
        row["publish_year_guess"] = year_match.group(0) if year_match else ""
        counts[category] += 1
    return data, counts


def extract_pdf_text() -> str:
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception:
        return ""

    reader = PdfReader(str(PDF_PATH))
    chunks: list[str] = []
    for page in reader.pages:
        chunks.append(page.extract_text() or "")
    text = _normalize_text("\n".join(chunks))
    return text


def transcript_from_extracted_text(text: str) -> dict:
    raw_segments = re.split(r"(?<=\.)\s+(?=[A-Z][a-z])", text)
    content = []
    for seg in raw_segments[:220]:
        seg = _normalize_text(seg)
        if len(seg) < 20:
            continue
        content.append({"speaker": "Norm Macdonald", "text": seg})
    return {
        "id": "nml-jokes-transcribed-pdf",
        "title": "Norm Macdonald Live Jokes (PDF Extraction)",
        "type": "transcript",
        "content": content,
        "source": "341060525-Norm-Macdonald-Live-Jokes-Transcribed.pdf",
    }


def upsert_transcript(entry: dict) -> list[dict]:
    current = json.loads(TRANSCRIPTS_PATH.read_text(encoding="utf-8"))
    filtered = [item for item in current if item.get("id") != entry["id"]]
    filtered.append(entry)
    return filtered


def main() -> None:
    merged = merge_jokes([load_existing_jokes(), load_csv_jokes(), load_txt_jokes()])
    JOKES_PATH.write_text(json.dumps(merged, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    videos, category_counts = enrich_videos()
    VIDEOS_PATH.write_text(json.dumps(videos, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    pdf_text = extract_pdf_text()
    if pdf_text:
        transcript_entry = transcript_from_extracted_text(pdf_text)
        transcripts = upsert_transcript(transcript_entry)
        TRANSCRIPTS_PATH.write_text(json.dumps(transcripts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Jokes merged: {len(merged)}")
    print("Video categories:")
    for cat, n in category_counts.most_common():
        print(f"  - {cat}: {n}")
    print(f"PDF transcript extracted: {'yes' if pdf_text else 'no (pypdf unavailable)'}")


if __name__ == "__main__":
    main()
