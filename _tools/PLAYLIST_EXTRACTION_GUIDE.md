# YouTube Playlist Extraction Guide

Due to network restrictions in the development environment, I've created tools for you to extract the playlist data locally.

## Playlist to Add
`https://youtube.com/playlist?list=PLxTIDernmMHuIsNqSMOhKR1jlWimaLklk`

---

## 🚀 Quick Start (Choose One Method)

### Method 1: Browser Console (Easiest, No Install Required)

1. **Open the playlist in your browser:**
   ```
   https://youtube.com/playlist?list=PLxTIDernmMHuIsNqSMOhKR1jlWimaLklk
   ```

2. **Scroll down to load ALL videos** in the playlist

3. **Open browser console:**
   - Windows/Linux: `F12` or `Ctrl+Shift+J`
   - Mac: `Cmd+Option+J`

4. **Copy and paste this script into the console:**
   ```javascript
   const videos = [];
   const videoElements = document.querySelectorAll('ytd-playlist-video-renderer');

   videoElements.forEach(video => {
       try {
           const titleElement = video.querySelector('#video-title');
           const linkElement = video.querySelector('a#thumbnail');
           if (titleElement && linkElement) {
               const url = linkElement.href;
               const videoId = new URL(url).searchParams.get('v');
               const title = titleElement.textContent.trim();
               videos.push({
                   "Video url": `https://www.youtube.com/watch?v=${videoId}`,
                   "Title": title,
                   "Description": "Video url:",
                   "Channel name": "N/A",
                   "Duration": "N/A",
                   "Views": "N/A",
                   "Thumbnail url": "N/A"
               });
           }
       } catch (e) { console.error('Error:', e); }
   });

   console.log(JSON.stringify(videos, null, 2));
   console.log(`Extracted ${videos.length} videos`);
   copy(JSON.stringify(videos, null, 2));
   console.log("✅ JSON copied to clipboard!");
   ```

5. **The JSON is now in your clipboard!** Save it to a file named `playlist_videos.json`

---

### Method 2: Python Script (Most Reliable)

1. **Install pytube:**
   ```bash
   pip install pytube
   ```

2. **Run the extraction script:**
   ```bash
   python3 extract_playlist.py
   ```

3. **This creates `playlist_videos.json` automatically**

---

### Method 3: Browser Tool (User-Friendly)

1. **Open `extract_playlist.html` in your browser**

2. **Follow the on-screen instructions** to:
   - Run the extraction script on the YouTube page
   - Paste the output into the tool
   - Download the JSON file

---

## 📦 After Extraction

Once you have `playlist_videos.json`, merge it into the main data:

```bash
cd /home/user/norm
python3 merge_playlist_data.py
```

This will:
- ✅ Load the playlist videos
- ✅ Check for duplicates
- ✅ Add new videos to `consolidated_youtube_data.json`
- ✅ Show you how many videos were added

---

## 🔄 Commit and Deploy

After merging:

```bash
git add consolidated_youtube_data.json
git commit -m "Add videos from playlist PLxTIDernmMHuIsNqSMOhKR1jlWimaLklk"
git push -u origin claude/fix-github-pages-deploy-011CUymEuAC92tJqRNe4TiYV
```

---

## ❓ Troubleshooting

**Q: The console script doesn't find any videos**
- Make sure you've scrolled down to load all videos in the playlist
- Try refreshing the page and scrolling again

**Q: Python script fails with "Tunnel connection failed"**
- This happens in the restricted development environment
- Run the script on your local machine instead

**Q: Videos aren't showing up on the site**
- Make sure you ran `merge_playlist_data.py`
- Check that `consolidated_youtube_data.json` was updated
- Clear your browser cache and refresh the videos page

---

## 📝 Manual Alternative

If all else fails, you can manually create the JSON:

1. Open the playlist
2. Copy each video URL and title
3. Format as JSON following this structure:
   ```json
   [
     {
       "Video url": "https://www.youtube.com/watch?v=VIDEO_ID",
       "Title": "Video Title Here",
       "Description": "Video url:",
       "Channel name": "N/A",
       "Duration": "N/A",
       "Views": "N/A",
       "Thumbnail url": "N/A"
     }
   ]
   ```
4. Save as `playlist_videos.json`
5. Run the merge script
