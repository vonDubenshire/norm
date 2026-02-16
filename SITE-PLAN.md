# The Norm Macdonald Archive — Full Site Plan

## Current State (What We Have)
- 6 pages: Home, Jokes (76), Videos (939), Transcripts (2), About, Mitt Romney Jokes (28)
- Pure static HTML/CSS/JS, hosted on GitHub Pages
- `images/` folder is empty (hero/about photos fail with fallback)
- Experimental folders cluttering the repo: `old/`, `redesign/`, `codex-design/`, `norm-mitt-jokes/`
- Unlinked content: Epstein article HTML sitting in root
- Data scripts in root that aren't part of the site: `extract_playlist.py`, `merge_playlist_data.py`, etc.
- Missing: articles page, meme/gallery page, quotes page, more transcripts
- No favicon (file exists but may be placeholder)

---

## Phase 1: Clean House & Fix Foundations
**Goal**: Solid base before adding anything new.

### 1A. Repo Cleanup
- [ ] Move dev/reference folders to `_archive/` (or `.gitignore` them): `old/`, `redesign/`, `codex-design/`, `norm-mitt-jokes/`
- [ ] Move utility scripts to `_tools/`: `extract_playlist.py`, `merge_playlist_data.py`, `extract_playlist.html`, `PLAYLIST_EXTRACTION_GUIDE.md`
- [ ] Move the Epstein article to a proper location (Phase 3 articles section or `_content/`)
- [ ] Update `.gitignore` to exclude `_archive/` from Pages deployment (note: GitHub Pages deploys the whole repo, so we may want a `docs/` setup or just accept the extra files)

### 1B. Images
- [ ] Add a proper Norm hero photo to `images/norm-hero.jpg` (needed by `index.html`)
- [ ] Add a proper Norm about photo to `images/norm-about.jpg` (needed by `about.html`)
- [ ] Add Open Graph share image to `images/og-image.jpg` (for social sharing previews)
- [ ] **OWNER ACTION**: Find/provide 2-3 good Norm photos from your Google Drive. Ideal sizes: hero ~1200x800, about ~600x800, OG ~1200x630.

### 1C. Bug Fixes & Polish
- [ ] Fix video metadata: many entries have "N/A" for channel, views, duration — enrich from YouTube data in `old/site-src/NormMacdonald.txt` (731KB of richer metadata)
- [ ] Add missing OG meta tags to `mitt-romney-jokes.html`
- [ ] Update `README.md` to reflect current site (it still describes the old redesign prototype)

---

## Phase 2: Content Enrichment (What We Already Have)
**Goal**: Surface content that's already in the repo but isn't being used.

### 2A. More Jokes
- [ ] The `old/site-src/FullNormJokes.csv` has 685 joke entries vs the 76 currently in `jokes-data.json`
- [ ] Audit the CSV: deduplicate, clean, and merge quality entries into `jokes-data.json`
- [ ] Update joke count in `index.html` stats after merge
- [ ] **DELEGATE TO CODEX**: "Read `old/site-src/FullNormJokes.csv` and `jokes-data.json`. Deduplicate entries, clean formatting, and produce an updated `jokes-data.json` with all unique jokes. Preserve the existing JSON schema: `{id, joke, episode, guest, url, time}`. Output a report of how many were added, removed as dupes, or flagged for review."

### 2B. More Transcripts
- [ ] The PDF `old/site-src/341060525-Norm-Macdonald-Live-Jokes-Transcribed.pdf` has transcribed jokes/bits
- [ ] Extract and convert to `transcripts.json` format: `{title, content: [{speaker, text}]}`
- [ ] **DELEGATE TO CODEX**: "Read the PDF at `old/site-src/341060525-Norm-Macdonald-Live-Jokes-Transcribed.pdf`, extract all transcribed bits/dialogues, and add them to `transcripts.json` following the existing schema. Each bit should be a separate entry with a title and speaker-attributed dialogue lines."

### 2C. Enrich Video Data
- [ ] Cross-reference `consolidated_youtube_data.json` with `old/site-src/NormMacdonald.txt` to fill in missing metadata (views, channel, duration)
- [ ] Add video categories/tags for filtering (SNL, Stand-up, Podcast, Interview, etc.)
- [ ] **DELEGATE TO CODEX**: "Cross-reference `consolidated_youtube_data.json` with `old/site-src/NormMacdonald.txt` and `old/site-src/NormMacdonald.csv`. For any video entry with 'N/A' metadata, fill in the data from the text/CSV sources where a matching YouTube URL exists. Output the updated `consolidated_youtube_data.json`."

---

## Phase 3: New Pages
**Goal**: Expand the site with new sections.

### 3A. Articles Page (`articles.html`)
- [ ] Create `articles.html` with the standard site layout (header, nav, footer)
- [ ] Create `articles-data.json` for article metadata: `{title, author, date, source, url, excerpt, tags}`
- [ ] Article cards in a grid, with search and tag filtering
- [ ] For full articles hosted on-site (like the Epstein piece), link to dedicated HTML pages
- [ ] For external articles, link out with proper attribution
- [ ] Add "Articles" to the nav on all pages
- [ ] **OWNER ACTION**: Provide the "giant list of collected articles" — titles, URLs, and any that you want hosted directly on the site

### 3B. Quotes Page (`quotes.html`)
- [ ] Dedicated page for Norm Macdonald quotes (beyond the jokes)
- [ ] Create `quotes-data.json`: `{quote, source, context, year}`
- [ ] Random quote spotlight + full searchable list
- [ ] Categories: On Comedy, On Life, On Other Comedians, On Current Events
- [ ] Pull initial quotes from the footer rotation list in `theme.js` plus any from the joke data that are more "quote" than "joke"

### 3C. Memes & Gallery Page (`gallery.html`)
- [ ] Image/GIF/meme gallery with lightbox viewer
- [ ] Create `gallery-data.json`: `{filename, caption, tags, type: "image"|"gif"|"video"}`
- [ ] Grid layout with lazy loading
- [ ] Filter by type (images, GIFs, videos)
- [ ] **OWNER ACTION**: This page depends on Google Drive content. When running locally, upload content from `Memes\Norm Macdonald` folder to `images/gallery/` or host on a CDN
- [ ] **BLOCKED UNTIL**: Google Drive access from local environment

### 3D. Podcast Episode Guide (`episodes.html`)
- [ ] Directory of all Norm Macdonald Live episodes
- [ ] Create `episodes-data.json`: `{number, title, guest, date, description, youtubeUrl, jokes: [ids]}`
- [ ] Link episodes to their jokes and video clips
- [ ] Timeline/list view with search
- [ ] Data partially available from joke episode references in `jokes-data.json`

### 3E. Weekend Update Archive (`weekend-update.html`)
- [ ] Dedicated page for Norm's Weekend Update segments
- [ ] Curated collection of his best WU jokes organized by topic/year
- [ ] Embedded video clips where available
- [ ] **OWNER ACTION**: Identify which videos in the archive are Weekend Update clips (or provide a list)

---

## Phase 4: Site-Wide Features
**Goal**: Features that improve the whole site.

### 4A. Global Search
- [ ] Search bar in the header that searches across ALL content (jokes, videos, articles, quotes)
- [ ] Dropdown results showing matches from each section
- [ ] Keyboard shortcut: `/` to focus search

### 4B. Favorites / Bookmarks
- [ ] "Save" button on jokes, videos, quotes
- [ ] Saved items stored in `localStorage`
- [ ] "My Favorites" page or section showing saved content
- [ ] Export favorites as shareable link

### 4C. Improved Navigation
- [ ] Breadcrumbs on sub-pages
- [ ] "Related content" suggestions (e.g., after a joke, show the video it's from)
- [ ] Footer site map with all sections

### 4D. Performance
- [ ] Lazy load YouTube iframes on homepage (use thumbnail + click-to-load)
- [ ] Image lazy loading with `loading="lazy"`
- [ ] Consider splitting large JSON files if they grow (paginated API-style loading)

### 4E. Analytics & SEO
- [ ] Structured data (JSON-LD) for the site — `WebSite`, `Person` (Norm), `VideoObject` schemas
- [ ] Sitemap.xml generation
- [ ] robots.txt

---

## Phase 5: Google Drive Integration
**Goal**: Connect the massive content library.
**BLOCKED**: Requires running from local environment with Google Drive access.

### 5A. Content Inventory
- [ ] **OWNER ACTION (from local)**: Run a script to catalog the entire `Memes\Norm Macdonald` Google Drive folder
- [ ] Categorize content: videos, GIFs, images, documents, articles, jokes
- [ ] Generate manifests/JSON for each content type

### 5B. Media Pipeline
- [ ] Script to optimize images (resize, compress for web)
- [ ] Script to generate thumbnails for gallery
- [ ] Host media in `images/gallery/` or use external CDN if too large for GitHub (GitHub Pages has a 1GB soft limit)
- [ ] For videos: embed from YouTube/Google Drive or host short clips

### 5C. Article Import
- [ ] Parse/convert collected articles to the `articles-data.json` format
- [ ] For articles you want hosted on-site: convert to clean HTML pages
- [ ] **DELEGATE TO CODEX**: Once articles are accessible, "Read each article file, extract title/author/date/content, and generate both `articles-data.json` entries and individual HTML article pages using the site's standard template."

---

## Delegation Guide

### Tasks for Codex/Jules (Long-Running)
These are well-defined data processing tasks perfect for autonomous agents:

1. **Joke Deduplication & Merge** (Phase 2A)
   > "In the repo `vonDubenshire/norm`, read `old/site-src/FullNormJokes.csv` and the current `jokes-data.json`. Deduplicate by matching joke text (fuzzy match, ignore whitespace differences). Merge all unique jokes into an updated `jokes-data.json` preserving the schema `{id, joke, episode, guest, url, time}`. Assign new sequential IDs starting after the current max. Output a summary of: jokes added, duplicates skipped, entries needing review."

2. **Video Metadata Enrichment** (Phase 2C)
   > "In the repo `vonDubenshire/norm`, read `consolidated_youtube_data.json` and `old/site-src/NormMacdonald.txt`. The .txt file has richer metadata (views, likes, comments, duration, channel) separated by `###`. For each video in the JSON that has 'N/A' for Channel name, Views, or Duration, find the matching entry in the .txt by YouTube URL and fill in the data. Output the updated JSON."

3. **Transcript Extraction** (Phase 2B)
   > "In the repo `vonDubenshire/norm`, extract text from `old/site-src/341060525-Norm-Macdonald-Live-Jokes-Transcribed.pdf`. Convert each distinct bit/segment into the transcript JSON format: `{title: string, content: [{speaker: string, text: string}]}`. Append to the existing `transcripts.json` array. Use speaker names where identifiable (Norm, Adam Eget, guest names)."

4. **Video Categorization** (Phase 2C follow-up)
   > "In the repo `vonDubenshire/norm`, read `consolidated_youtube_data.json`. Based on each video's Title, Description, and Channel name, add a `category` field. Categories: 'SNL/Weekend Update', 'Stand-Up', 'Norm Macdonald Live', 'Talk Show', 'Interview', 'Documentary', 'Other'. Also add a `tags` array with relevant keywords. Output the updated JSON."

### Tasks for the Owner
1. **Images**: Provide 2-3 Norm photos for hero, about page, and OG sharing
2. **Articles list**: Share the collected articles list (titles + URLs minimum)
3. **Google Drive access**: When running locally, make the Memes folder accessible
4. **Weekend Update clips**: Identify which videos are WU segments
5. **Content review**: Review any auto-generated/merged data before it goes live

---

## Priority Order (Suggested)

| Priority | Phase | What | Effort | Blocked? |
|----------|-------|------|--------|----------|
| 1 | 1B | Add images (hero, about, OG) | Low | Owner provides photos |
| 2 | 1A | Repo cleanup | Low | No |
| 3 | 1C | Bug fixes, README, meta tags | Low | No |
| 4 | 2A | Merge 685 jokes from CSV | Medium | No (delegate to Codex) |
| 5 | 2C | Enrich video metadata | Medium | No (delegate to Codex) |
| 6 | 2B | Extract more transcripts | Medium | No (delegate to Codex) |
| 7 | 3A | Articles page | Medium | Owner provides article list |
| 8 | 3B | Quotes page | Low-Medium | No |
| 9 | 3D | Podcast episode guide | Medium | No |
| 10 | 4A | Global search | Medium | No |
| 11 | 3E | Weekend Update archive | Medium | Owner identifies clips |
| 12 | 4B | Favorites system | Medium | No |
| 13 | 3C | Gallery/Memes page | High | Google Drive access |
| 14 | 5 | Full Google Drive integration | High | Local environment |
| 15 | 4C-E | Nav, performance, SEO | Low-Medium | No |

---

## Tech Decisions
- **Stay vanilla**: HTML/CSS/JS. No React, no build tools. The simplicity is the point.
- **Data as JSON**: All content in JSON files fetched by the browser. Easy to update, easy to process.
- **GitHub Pages**: Free hosting, deploys from `main`. If media gets too large (>1GB), consider a CDN for images/videos.
- **Progressive enhancement**: Site works without JS (content is still accessible), JS adds interactivity.
