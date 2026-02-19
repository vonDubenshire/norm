# The Norm Macdonald Archive

## Project Overview
A fan-made tribute website celebrating Norm Macdonald's comedy legacy. Static site hosted on GitHub Pages at `https://vondubenshire.github.io/norm/`. Pure HTML/CSS/JavaScript — no build tools or frameworks.

## Architecture
- **Static site**: All pages are standalone HTML files in the repo root
- **Shared styling**: `styles.css` (2,275 lines — CSS custom properties for theming, dark/light mode)
- **Shared JS**: `theme.js` (theme toggle, mobile nav, footer quotes — loaded by every page)
- **Page-specific JS**: `script.js` (jokes), `videos.js`, `transcripts.js`, `mitt-jokes.js`, `quotes.js`, `articles.js`, `appearances.js`, `nml-episodes.js`
- **Data files**: JSON files in root (see Data Sources below)
- **Competitor data**: `competitor_data/` has scraped archive content from normmacdonaldarchive.com
- **Deployment**: GitHub Pages via `.github/workflows/static.yml` — deploys on push to `main`

## Key Pages (11 pages)
| File | Purpose | JS | Data |
|------|---------|-----|------|
| `index.html` (26K) | Homepage with hero image, featured joke, must-watch clips, browse grid, site stats | inline `<script>` | `jokes-data.json` |
| `start-here.html` | Three-path onboarding: newcomer intro + deep cuts + archive links, curated picks, lite-youtube embeds | inline `<script>` | — |
| `jokes.html` (14K) | Searchable/filterable joke collection with Watch buttons (timestamp deep-links) | `script.js` | `jokes-data.json` |
| `videos.html` (12K) | 939-video archive with category filters, sort, search, pagination, Surprise Me | `videos.js` | `consolidated_youtube_data.json` |
| `nml-episodes.html` (6.3K) | NML episode guide: 39 episodes, 3 seasons, season filter chips, YouTube + archive links | `nml-episodes.js` | `nml-episodes-data.json` |
| `transcripts.html` (6.1K) | Expandable transcript viewer | `transcripts.js` | `transcripts.json` |
| `quotes.html` (8.7K) | Categorized Norm quotes with spotlight feature | `quotes.js` | `quotes-data.json` |
| `appearances.html` (8.1K) | 695 appearances timeline with sort, search, Surprise Me | `appearances.js` | `competitor_data/appearances.json` |
| `articles.html` (9.4K) | 40 articles & collected writings with search | `articles.js` | `articles-data.json` |
| `about.html` (16K) | Bio, career timeline, about the project, cross-link to NML | — | — |
| `mitt-romney-jokes.html` (7.8K) | Carousel of Mitt Romney jokes | `mitt-jokes.js` | inline data |

## Navigation Order
Home > Start Here > Jokes > Videos > NML > Transcripts > Quotes > Appearances > Articles > About

## Data Sources
| File | Count | Key Fields |
|------|-------|------------|
| `jokes-data.json` (26K) | 74 jokes | `id`, `joke`, `episode`, `guest`, `url` (YouTube video ID), `time` (e.g. "49m44s") |
| `consolidated_youtube_data.json` (470K) | 939 videos | `Video url`, `Title`, `Description`, `Channel name`, `Views`, `Likes`, `Duration`, `Thumbnail url`, `category` (Late Night Appearance/Standup/NML/Weekend Update/Roast/Other), `tags`, `video_id` |
| `nml-episodes-data.json` (9.9K) | 39 episodes | `id`, `season`, `episode`, `guest`, `slug`, `youtube_url`, `thumbnail`, `archive_url` |
| `transcripts.json` (64K) | 24 transcripts | `title`, `content: [{speaker, text}]` |
| `quotes-data.json` (3.9K) | ~50 quotes | `id`, `quote`, `source`, `category`, `year` |
| `articles-data.json` (20K) | 40 articles | `id`, `title`, `author`, `date`, `source`, `url`, `excerpt`, `tags` |
| `standup-specials.json` (45K) | 119 entries | `id`, `title`, `year`, `venue`, `description`, `duration`, `youtube_url`, `thumbnail`, `type` |
| `bucket-list.json` (3.7K) | 12 items | `id`, `item`, `completed`, `context` (archive.org links) |
| `blue-card-jokes.json` (291B) | 1 entry | `id`, `setup`, `punchline`, `episode`, `guest`, `youtube_url`, `source` — mostly a stub |
| `competitor_data/appearances.json` (352K) | 695 entries | `title`, `date`, `show`, `description`, `media_url`, `media_type`, `duration`, `thumbnail` |

## Video Category Distribution
| Category | Count |
|----------|-------|
| Other | 773 |
| Late Night Appearance | 72 |
| Standup | 43 |
| NML | 32 |
| Weekend Update | 13 |
| Roast | 6 |

## Cross-Linking Matrix
| From | To | How |
|------|----|-----|
| Jokes → Videos | 57/74 jokes have YouTube video IDs + timestamps | Watch button with `&t=` param |
| Videos → NML Episodes | Category filter "NML" shows callout banner | Links to nml-episodes.html |
| About → NML Episodes | "Browse all 39 NML episodes" link | Inline link in NML section |
| Homepage → All pages | "Browse the Archive" grid | 7 link cards (Jokes, Videos, NML, Transcripts, Quotes, Appearances, Articles) |
| Appearances → Videos | 141/695 have YouTube URLs | Direct links |
| Appearances → archive.org | 483/695 have archive.org URLs | Direct links |

## Conventions
- Every page loads `theme.js` first, then calls `initTheme()`, `initNav()`, `initFooterQuote()` on init
- Every page has: skip-to-main link, theme toggle button, header with nav, footer with rotating quote
- Nav links use `./` relative paths; active page gets `class="nav-link active" aria-current="page"`
- Data is loaded via `fetch()` from JSON files — no server-side rendering
- XSS safety: Use `textContent` or `createTextNode()` for user/data-driven content. Use `innerHTML` only for static SVG icons
- Mobile: Hamburger nav toggle at 768px breakpoint
- YouTube embeds on homepage use lite-youtube pattern (click thumbnail to load iframe)
- Search inputs use `debounce()` (250ms) across all pages
- Videos and Appearances pages use `DocumentFragment` for batch DOM insertion
- Sort/filter/search state persists in URL via `URLSearchParams` + `history.replaceState()`
- Hero and about images load from YouTube thumbnail CDN with `onerror` fallback to text

## CSS Architecture
- Custom properties for theming (`--studio-*` dark, `--light-*` light mode)
- Gradient border reveal on `.joke-card` hover via `::before` + `mask-composite: exclude`
- Shimmer animation on `.section-title` and `.page-title` underlines
- Category filter chips: `.chip` / `.chip.active` with pill shape
- Cross-link banner: `.crosslink-banner` with left accent border
- NML episode cards: `.nml-card` / `.nml-episode-grid`
- Small button variant: `.btn-sm`
- Start Here path cards: `.path-card` / `.path-card--blue/purple/pink` with color-coded borders and gradient tints
- Curated pick cards: `.pick-grid` / `.pick-card` with thumbnails and play overlays

## Folder Structure
- `_archive/` — Previous React-based site, design mockups, old standalone apps. Reference only.
- `_tools/` — Data extraction & processing scripts (playlist extraction, data merge).
- `competitor_data/` — Scraped content from normmacdonaldarchive.com (appearances, episodes, jokes, standup, bucket list).
- `articles/` — Article link corpus (760 URLs) and guidance notes from owner.
- `images/` — Currently empty. Hero and about images load from YouTube CDN instead.
- `.github/workflows/static.yml` — GitHub Pages deployment (push to `main` triggers deploy).

## Content Pending Integration
- **Google Drive**: Owner has a `Memes\Norm Macdonald` folder with videos, GIFs, documents, jokes (requires local environment — Claude cannot access Google Drive)
- **Article links**: 760 URLs in `articles/` need classification, dedup, and metadata extraction into `articles-data.json`
- **More jokes**: `_archive/old/site-src/FullNormJokes.csv` has 685 entries vs 74 currently live — needs dedup and merge
- **More transcripts**: `_archive/old/site-src/341060525-Norm-Macdonald-Live-Jokes-Transcribed.pdf` has additional transcripts
- **Video metadata gaps**: 911/939 videos still missing Views and Channel name (Codex's enrichment mostly failed)

## Important Rules
- This is a static site. No build step. No npm. No frameworks. Changes go live as-is.
- Keep it vanilla HTML/CSS/JS. The simplicity is a feature.
- Test pages by opening HTML files directly — they should work with relative paths.
- All content belongs to its respective owners. This is a non-commercial fan tribute.
- Deployment only works from `main` branch (GitHub Pages environment protection).
- See `SITE-PLAN.md` for the full development roadmap and next steps.

## Session Handoff Notes

### What Was Done (Previous Sessions)
1. CSS visual polish: Gradient border reveals, shimmer animations, hover effects, `fadeOut` keyframe
2. Performance: Debounced search (250ms), `DocumentFragment` rendering, lazy-loaded thumbnails
3. Sort & Random: Sort dropdowns and "Surprise Me" buttons on Videos and Appearances pages
4. Codex PR review & fixes: Merged PR #28 (standup-specials, bucket-list, blue-card-jokes, video categories, SEO)
5. NML Episodes page: 39 episodes, 3 seasons, season filter chips, YouTube + archive links
6. Video category filters: 6 chips with counts and URL state
7. Hero & about images: YouTube CDN thumbnail URLs
8. Joke timestamps: Watch buttons deep-link with `&t=` parameter
9. Cross-linking: NML banners, nav updates across all pages
10. Competitive analysis: normmacdonaldarchive.com UX review

### What Was Done (Current Session)
11. **Start Here page**: Three-path onboarding page (`start-here.html`) with:
    - Path selector: 3 color-coded cards (blue/purple/pink) with smooth-scroll navigation
    - "Never Heard of Him": Editorial intro, Moth Joke lite-youtube embed, cancer/draw quote, CTAs to About + Videos
    - "I've Seen a Few Clips": 5 curated "Essential Norm" pick cards (Professor of Logic, Most Convoluted Joke, WHCD, NML Bob Einstein, NML Jerry Seinfeld) with YouTube thumbnails, Letterman lite-youtube embed, CTAs to Videos + NML
    - "I'm Already a Fan": Archive stats intro, full 7-card links grid (same as homepage Browse), CTA to Appearances
    - New CSS: `.path-selector`, `.path-card` (3 color variants), `.pick-grid`, `.pick-card`, `.start-section`, `.start-actions` + responsive breakpoints
    - Nav updated across all 11 pages: "Start Here" added between Home and Jokes

### Known Issues / Data Gaps
- `blue-card-jokes.json` is essentially a stub (1 entry) — needs real joke data
- `standup-specials.json` has 119 entries but no dedicated page yet
- Video metadata enrichment largely failed (911/939 still missing Views/Channel) — Codex didn't cross-reference effectively with archive sources
- `images/` folder is still empty (using YouTube CDN URLs as workaround)
- Article corpus (760 URLs) still unprocessed
- No sitemap.xml or robots.txt yet

### Code Review Bots on Repo
Three bots are active on PRs — **keep all three** (they caught real issues):
- **gemini-code-assist[bot]**: Best signal-to-noise, caught 7 valid issues on PR #28
- **cubic-dev-ai[bot]**: Caught 1 valid issue (data enrichment gaps)
- **chatgpt-codex-connector[bot]**: Codex's own summary bot, useful for context

### Codex Delegation Strategy
The owner has ChatGPT Codex available (top-tier model, can run for up to 2 hours). Best used for:
- **Long data processing**: Joke dedup/merge from CSV (685 entries), article corpus processing (760 URLs), transcript extraction from PDF
- **Scraping tasks**: The original competitor data scraping was done by Codex and worked well
- **NOT for**: Quick tasks that require judgment calls or architectural decisions — Codex completed PR #28 in 4 minutes and the quality showed (placeholders, failed enrichment, minor bugs)

### Session Management Advice
Start a new Claude Code session when:
- After 2-3 context compressions (performance degrades)
- After ~15-20 heavy editing turns
- At natural phase transitions (finishing a feature set → starting the next)
- When you notice repetition or confusion in responses
