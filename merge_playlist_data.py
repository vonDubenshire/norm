#!/usr/bin/env python3
"""
Merge playlist videos into consolidated YouTube data
Run this after extracting playlist_videos.json
"""

import json

def merge_videos():
    """Merge playlist_videos.json into consolidated_youtube_data.json"""

    # Load playlist videos
    try:
        with open('playlist_videos.json', 'r', encoding='utf-8') as f:
            playlist_videos = json.load(f)
        print(f"✅ Loaded {len(playlist_videos)} videos from playlist_videos.json")
    except FileNotFoundError:
        print("❌ Error: playlist_videos.json not found!")
        print("Please run extract_playlist.py or use extract_playlist.html first")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in playlist_videos.json: {e}")
        return

    # Load existing consolidated data
    try:
        with open('consolidated_youtube_data.json', 'r', encoding='utf-8') as f:
            existing_videos = json.load(f)
        print(f"✅ Loaded {len(existing_videos)} existing videos")
    except FileNotFoundError:
        print("❌ Error: consolidated_youtube_data.json not found!")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in consolidated_youtube_data.json: {e}")
        return

    # Extract existing video URLs for deduplication
    existing_urls = {video.get('Video url') for video in existing_videos}
    print(f"📋 Found {len(existing_urls)} unique URLs in existing data")

    # Add only new videos
    new_videos = []
    duplicates = 0

    for video in playlist_videos:
        video_url = video.get('Video url')
        if video_url and video_url not in existing_urls:
            new_videos.append(video)
            existing_urls.add(video_url)
        else:
            duplicates += 1

    if duplicates > 0:
        print(f"⚠️  Skipped {duplicates} duplicate videos")

    if new_videos:
        # Merge new videos
        merged_videos = existing_videos + new_videos

        # Save merged data
        with open('consolidated_youtube_data.json', 'w', encoding='utf-8') as f:
            json.dump(merged_videos, f, indent=2, ensure_ascii=False)

        print(f"✅ Added {len(new_videos)} new videos!")
        print(f"📊 Total videos now: {len(merged_videos)}")
        print(f"💾 Saved to consolidated_youtube_data.json")
    else:
        print("ℹ️  No new videos to add (all were duplicates)")

if __name__ == "__main__":
    merge_videos()
