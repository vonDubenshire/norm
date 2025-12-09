#!/usr/bin/env python3
"""
YouTube Playlist Extractor
Run this script on your local machine (not in the restricted environment)
"""

import json
import sys

try:
    from pytube import Playlist
except ImportError:
    print("❌ pytube not installed. Installing...")
    print("Run: pip install pytube")
    sys.exit(1)

def extract_playlist(playlist_url):
    """Extract all videos from a YouTube playlist"""
    print(f"📥 Fetching playlist: {playlist_url}")

    try:
        playlist = Playlist(playlist_url)
        videos = []

        print(f"📊 Playlist title: {playlist.title}")
        print(f"🎬 Extracting {len(playlist.video_urls)} videos...\n")

        for i, video in enumerate(playlist.videos, 1):
            video_data = {
                "Video url": f"https://www.youtube.com/watch?v={video.video_id}",
                "Title": video.title,
                "Description": "Video url:",
                "Channel name": video.author if hasattr(video, 'author') else "N/A",
                "Duration": "N/A",
                "Views": "N/A",
                "Thumbnail url": "N/A"
            }
            videos.append(video_data)
            print(f"  {i}. ✓ {video.title}")

        # Save to file
        output_file = 'playlist_videos.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(videos, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Successfully extracted {len(videos)} videos!")
        print(f"💾 Saved to: {output_file}")
        return videos

    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    playlist_url = "https://youtube.com/playlist?list=PLxTIDernmMHuIsNqSMOhKR1jlWimaLklk"

    if len(sys.argv) > 1:
        playlist_url = sys.argv[1]

    extract_playlist(playlist_url)
