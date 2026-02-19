#!/usr/bin/env python3
"""
Video metadata enrichment script.
Parses NormMacdonald.txt and fills missing fields in consolidated_youtube_data.json.
"""

import json
import re
import sys

def parse_txt_records(filepath):
    """Parse the ###-delimited records from NormMacdonald.txt"""
    records = {}

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split on ### separator lines
    blocks = re.split(r'\n#{3,}\n', content)

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        record = {}
        lines = block.split('\n')

        # Parse key-value pairs
        current_key = None
        current_value = []

        for line in lines:
            # Check if this line starts a new field
            match = re.match(r'^(Title|Description|Thumbnail url|Channel name|Views|Likes|Comments|Duration in seconds|Duration in timestamp|Duration|Uploaded Time|Video url):\s*(.*)', line)
            if match:
                # Save previous field
                if current_key:
                    record[current_key] = '\n'.join(current_value).strip()
                current_key = match.group(1)
                current_value = [match.group(2)]
            elif current_key:
                # Continuation of multi-line field (like Description)
                current_value.append(line)

        # Save last field
        if current_key:
            record[current_key] = '\n'.join(current_value).strip()

        # Extract video ID from URL
        video_url = record.get('Video url', '')
        vid_match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/)([^&\s]+)', video_url)
        if vid_match:
            video_id = vid_match.group(1)
            records[video_id] = record

    return records


def enrich_videos(json_path, txt_records, output_path):
    """Fill missing metadata in consolidated_youtube_data.json"""

    with open(json_path, 'r', encoding='utf-8') as f:
        videos = json.load(f)

    matched = 0
    views_filled = 0
    channel_filled = 0
    duration_filled = 0
    likes_filled = 0
    thumbnail_filled = 0

    for video in videos:
        # Get video ID from the JSON entry
        video_url = video.get('Video url', '')
        vid_match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/)([^&\s]+)', video_url)
        if not vid_match:
            continue

        video_id = vid_match.group(1)

        if video_id not in txt_records:
            continue

        txt_record = txt_records[video_id]
        matched += 1

        # Fill Views if empty
        current_views = video.get('Views', '')
        if not current_views or current_views in ('', 'N/A', None):
            txt_views = txt_record.get('Views', '')
            if txt_views and txt_views not in ('', 'N/A'):
                video['Views'] = txt_views
                views_filled += 1

        # Fill Channel name if empty
        current_channel = video.get('Channel name', '')
        if not current_channel or current_channel in ('', 'N/A', None):
            txt_channel = txt_record.get('Channel name', '').strip()
            if txt_channel and txt_channel not in ('', 'N/A'):
                video['Channel name'] = txt_channel
                channel_filled += 1

        # Fill Duration if empty
        current_duration = video.get('Duration', '')
        if not current_duration or current_duration in ('', 'N/A', None):
            # Prefer timestamp format
            txt_dur = txt_record.get('Duration in timestamp', '')
            if txt_dur:
                video['Duration'] = txt_dur
                duration_filled += 1
            else:
                txt_dur = txt_record.get('Duration', '')
                if txt_dur and txt_dur not in ('', 'N/A'):
                    video['Duration'] = txt_dur
                    duration_filled += 1

        # Fill Likes if empty
        current_likes = video.get('Likes', '')
        if not current_likes or current_likes in ('', 'N/A', None):
            txt_likes = txt_record.get('Likes', '')
            if txt_likes and txt_likes not in ('', 'N/A'):
                video['Likes'] = txt_likes
                likes_filled += 1

        # Fill Thumbnail url if empty
        current_thumb = video.get('Thumbnail url', '')
        if not current_thumb or current_thumb in ('', 'N/A', None):
            txt_thumb = txt_record.get('Thumbnail url', '')
            if txt_thumb and txt_thumb not in ('', 'N/A'):
                video['Thumbnail url'] = txt_thumb
                thumbnail_filled += 1

    # Write enriched data
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(videos, f, indent=2, ensure_ascii=False)

    return {
        'total_videos': len(videos),
        'txt_records': len(txt_records),
        'matched': matched,
        'views_filled': views_filled,
        'channel_filled': channel_filled,
        'duration_filled': duration_filled,
        'likes_filled': likes_filled,
        'thumbnail_filled': thumbnail_filled
    }


def audit_before(json_path):
    """Count how many videos are missing each field"""
    with open(json_path, 'r', encoding='utf-8') as f:
        videos = json.load(f)

    missing = {'Views': 0, 'Channel name': 0, 'Duration': 0, 'Likes': 0, 'Thumbnail url': 0}

    for video in videos:
        for field in missing:
            val = video.get(field, '')
            if not val or val in ('', 'N/A', None):
                missing[field] += 1

    return len(videos), missing


if __name__ == '__main__':
    json_path = '/home/user/norm/consolidated_youtube_data.json'
    txt_path = '/home/user/norm/_archive/old/site-src/NormMacdonald.txt'
    output_path = '/home/user/norm/consolidated_youtube_data.json'  # overwrite in place

    print("=== BEFORE ENRICHMENT ===")
    total, missing_before = audit_before(json_path)
    print(f"Total videos: {total}")
    for field, count in missing_before.items():
        print(f"  Missing {field}: {count}")

    print("\n=== PARSING TXT FILE ===")
    txt_records = parse_txt_records(txt_path)
    print(f"Parsed {len(txt_records)} records from NormMacdonald.txt")

    print("\n=== ENRICHING ===")
    results = enrich_videos(json_path, txt_records, output_path)
    print(f"Matched {results['matched']} videos by ID")
    print(f"  Views filled: {results['views_filled']}")
    print(f"  Channel name filled: {results['channel_filled']}")
    print(f"  Duration filled: {results['duration_filled']}")
    print(f"  Likes filled: {results['likes_filled']}")
    print(f"  Thumbnail url filled: {results['thumbnail_filled']}")

    print("\n=== AFTER ENRICHMENT ===")
    total_after, missing_after = audit_before(output_path)
    print(f"Total videos: {total_after}")
    for field, count in missing_after.items():
        print(f"  Missing {field}: {count} (was {missing_before[field]}, filled {missing_before[field] - count})")

    print("\nDone! Enriched data written to", output_path)
