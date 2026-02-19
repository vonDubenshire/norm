# The Norm Macdonald Archive — Site Plan & Roadmap

## Current State (as of Feb 2026)

### What's Live
- **12 HTML pages**, 10 JS files, 9 JSON data files, 2,600+ lines of CSS
- Homepage with YouTube thumbnail hero, featured joke rotation, must-watch clips, browse grid
- Videos page: 939 videos with 6 category filter chips, sort, search, pagination, Surprise Me, URL state
- NML Episodes page: 39 episodes across 3 seasons with YouTube and archive links
- Jokes page: 74 searchable jokes with timestamp-linked Watch buttons
- Appearances page: 695 entries with sort, search, Surprise Me
- Transcripts (24), Quotes (~50), Articles (40), Mitt Romney jokes (28)
- Dark/light theme, mobile responsive, debounced search, lazy-loaded images
- CSS polish: gradient borders, shimmer animations, hover effects
- SEO: JSON-LD structured data, OG tags, canonical URLs on key pages
- Cross-linking between pages (jokes→videos via timestamps, NML banners, browse grid)

### What's Not Live Yet
- `bucket-list.json` (12 items) — data exists, no page (owner wants "Start Here" approach instead)
- `blue-card-jokes.json` (1 entry) — essentially a stub
- 685 jokes in CSV not yet merged with the 74 live ones
- 760 article URLs not yet processed
- Video metadata still sparse (911/939 missing Views/Channel)
- No sitemap.xml, robots.txt
- No global search
- No favorites/bookmarks system
- `images/` folder empty (using YouTube CDN as workaround)

---

## Next Up: Priority Features

### P1: "Start Here" Page — DONE
`start-here.html` is live with three-path onboarding (newcomer/deep cuts/archive). Path selector with blue/purple/pink color-coded cards, Moth Joke + Letterman lite-youtube embeds, 5 curated "Essential Norm" pick cards, archive links grid, smooth-scroll navigation. Nav updated across all 11 pages.

### P2: Standup Specials Page — DONE
`standup.html` is live with 119 performances (1989–2022). Video thumbnail grid, type filter (Full Sets / Clips & Appearances), year sort, search, Surprise Me. Cross-link banner on Videos page when Standup category is active. Nav updated across all 12 pages.

### P3: Video Metadata Re-enrichment (Codex Task)
The first attempt failed (911/939 still missing Views/Channel). Need a more targeted Codex task:
> "Read `consolidated_youtube_data.json` and `_archive/old/site-src/NormMacdonald.txt`. The .txt file has richer metadata separated by `###` blocks. For each video in the JSON where `Views` is empty or `Channel name` is empty, find the matching entry in the .txt by YouTube video ID. Extract and fill: Views, Likes, Channel name, Duration. Output the updated JSON. This is a LONG task — take your time and be thorough. Log how many entries you matched."

**This is a good Codex 2-hour task.**

### P4: Joke Dedup & Merge (Codex Task)
685 jokes in `_archive/old/site-src/FullNormJokes.csv` vs 74 live. Merge them:
> "Read `_archive/old/site-src/FullNormJokes.csv` and `jokes-data.json`. Deduplicate by fuzzy matching joke text (ignore whitespace, punctuation differences, case). Merge unique jokes into an updated `jokes-data.json` preserving schema `{id, joke, episode, guest, url, time}`. New entries get sequential IDs starting after current max. For entries from CSV that lack video URLs, leave `url` and `time` empty. Output a summary: added, dupes skipped, flagged for review."

**Good Codex task — 30-60 minutes.**

### P5: Article Corpus Processing (Codex Task)
760 URLs in `articles/ARTICLE COMPILATION COLLECTION - MASSIVE NORM STORIES.txt`:
> "Read the article URL corpus at `articles/ARTICLE COMPILATION COLLECTION - MASSIVE NORM STORIES.txt`. For each URL: classify type (interview, profile, tribute, review, opinion, news), extract domain, generate a descriptive title if possible from the URL structure, check for duplicates. Output an updated `articles-data.json` following the existing schema `{id, title, author, date, source, url, excerpt, tags}`. For entries where metadata can't be determined, use reasonable defaults and flag for review. Deduplicate against the existing 40 entries in `articles-data.json`."

**Good Codex long task — 1-2 hours.**

### P6: Global Search
- Search bar in header (all pages) that searches across jokes, videos, quotes, articles
- Dropdown results grouped by type
- Keyboard shortcut: `/` to focus
- Implementation: Load all JSON data, build a lightweight search index in JS

### P7: Favorites / Bookmarks
- Heart/star button on jokes, videos, quotes
- `localStorage` persistence
- "My Favorites" section on homepage or dedicated page
- Export as shareable link

---

## Codex Task Library (Copy-Paste Ready)

### Task: Video Metadata Re-enrichment (2 hours)
```
In the repo vonDubenshire/norm on branch main:

Read consolidated_youtube_data.json (939 videos) and _archive/old/site-src/NormMacdonald.txt.

The .txt file contains richer YouTube metadata in blocks separated by "###". Each block has fields like: Title, Video url, Channel name, Views, Likes, Duration, Description.

For each video in the JSON where "Views" is empty/null/"N/A" or "Channel name" is empty/null/"N/A":
1. Extract the YouTube video ID from the JSON entry's "Video url" field
2. Search the .txt file for a matching video ID
3. If found, fill in: Views, Likes, Channel name, Duration from the .txt data

IMPORTANT: Take your time. This is a data processing task, not a quick fix. Log progress as you go. Output the updated consolidated_youtube_data.json. In your commit message, report: total videos processed, matches found, fields updated.
```

### Task: Joke Dedup & Merge (1 hour)
```
In the repo vonDubenshire/norm on branch main:

Read _archive/old/site-src/FullNormJokes.csv (685 entries) and jokes-data.json (74 entries).

Deduplicate by fuzzy matching joke text (ignore whitespace differences, punctuation, case). Merge all unique jokes into an updated jokes-data.json. Schema: {id, joke, episode, guest, url, time}. New entries get sequential IDs starting after the current max ID. For CSV entries without video URLs, leave url and time as empty strings.

Commit with a summary: jokes added, duplicates skipped, entries flagged.
```

### Task: Article Corpus Processing (2 hours)
```
In the repo vonDubenshire/norm on branch main:

Read articles/ARTICLE COMPILATION COLLECTION - MASSIVE NORM STORIES.txt (760 URLs).

For each URL:
1. Classify type: interview, profile, tribute, review, opinion, news
2. Extract domain name as "source"
3. Generate a descriptive title from the URL path/structure
4. Check for duplicates against existing articles-data.json (40 entries)

Output an updated articles-data.json following schema: {id, title, author, date, source, url, excerpt, tags}. Use empty strings for unknown fields. Flag entries needing review.

This is a LONG task. Be thorough. Report total URLs processed, new entries added, dupes found, errors.
```

### Task: Transcript Extraction from PDF (1 hour)
```
In the repo vonDubenshire/norm on branch main:

Read _archive/old/site-src/341060525-Norm-Macdonald-Live-Jokes-Transcribed.pdf.

Extract all transcribed comedy bits/dialogues. Convert each to the transcript format: {title: string, content: [{speaker: string, text: string}]}. Speaker names should be "Norm", "Adam Eget", or the guest's name where identifiable.

Append new transcripts to the existing transcripts.json array (currently 24 entries). Do not duplicate existing entries. Output the updated file.
```

---

## Completed Work (Reference)

### Phase 1: Foundations (DONE)
- [x] Repo cleanup (moved to `_archive/`, `_tools/`)
- [x] Hero and about images (YouTube CDN thumbnails)
- [x] SEO meta tags, JSON-LD, canonical URLs
- [x] Bug fixes, OG tags on all pages
- [x] Favicon working

### Phase 2: Content Enrichment (PARTIAL)
- [x] Video categorization (6 categories on all 939 videos)
- [ ] Video metadata enrichment (FAILED — needs retry, see P3)
- [ ] Joke dedup/merge from CSV (see P4)
- [ ] Transcript extraction from PDF (see Codex task)
- [x] Standup specials data file (119 entries)
- [x] Bucket list data file (12 items)

### Phase 3: New Pages (PARTIAL)
- [x] Articles page (40 articles)
- [x] Quotes page (~50 quotes)
- [x] NML Episodes page (39 episodes, 3 seasons)
- [x] Appearances page (695 entries)
- [ ] Start Here page (see P1)
- [ ] Standup Specials page (see P2)
- [ ] Weekend Update archive
- [ ] Gallery/Memes page (blocked on Google Drive)

### Phase 4: Site-Wide Features (PARTIAL)
- [x] Sort and Surprise Me on Videos + Appearances
- [x] Category filter chips on Videos
- [x] URL state persistence
- [x] Debounced search on all searchable pages
- [x] Cross-linking between pages
- [x] Nav updated on all pages
- [ ] Global search (see P6)
- [ ] Favorites/bookmarks (see P7)
- [ ] Sitemap.xml, robots.txt

---

## Tech Decisions
- **Stay vanilla**: HTML/CSS/JS. No React, no build tools. The simplicity is the point.
- **Data as JSON**: All content in JSON files fetched by the browser. Easy to update, easy to process.
- **GitHub Pages**: Free hosting, deploys from `main`. If media gets too large (>1GB), consider a CDN.
- **YouTube CDN for images**: Using `i.ytimg.com/vi/[ID]/maxresdefault.jpg` URLs instead of local images.
- **Progressive enhancement**: Site works without JS (content is still accessible), JS adds interactivity.
