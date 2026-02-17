# The Norm Macdonald Archive

## Project Overview
A fan-made tribute website celebrating Norm Macdonald's comedy legacy. Static site hosted on GitHub Pages at `https://vondubenshire.github.io/norm/`. Pure HTML/CSS/JavaScript — no build tools or frameworks.

## Architecture
- **Static site**: All pages are standalone HTML files in the repo root
- **Shared styling**: `styles.css` (CSS custom properties for theming)
- **Shared JS**: `theme.js` (theme toggle, mobile nav, footer quotes — loaded by every page)
- **Page-specific JS**: `script.js` (jokes), `videos.js`, `transcripts.js`, `mitt-jokes.js`, `quotes.js`, `articles.js`, `appearances.js`
- **Data files**: JSON files in root (`jokes-data.json`, `consolidated_youtube_data.json`, `transcripts.json`, `quotes-data.json`, `articles-data.json`)
- **Competitor data**: `competitor_data/` has scraped archive content (695 appearances, NML episodes, blue card jokes, standup specials, bucket list)
- **Deployment**: GitHub Pages via `.github/workflows/static.yml` — deploys on push to `main`

## Key Pages
| File | Purpose |
|------|---------|
| `index.html` | Homepage with featured joke, must-watch clips (lazy-loaded), site stats |
| `jokes.html` | Searchable/filterable joke collection (loads `jokes-data.json`) |
| `videos.html` | 939-video archive with search/pagination (loads `consolidated_youtube_data.json`) |
| `transcripts.html` | Expandable transcript viewer (loads `transcripts.json`) |
| `quotes.html` | Categorized Norm quotes with spotlight feature (loads `quotes-data.json`) |
| `appearances.html` | 695 appearances timeline with search (loads `competitor_data/appearances.json`) |
| `articles.html` | Articles & collected writings (loads `articles-data.json`) |
| `about.html` | Bio, career timeline, about the project |
| `mitt-romney-jokes.html` | Carousel of Mitt Romney jokes (data in `mitt-jokes.js`) |

## Navigation Order
Home > Jokes > Videos > Transcripts > Quotes > Appearances > Articles > About

## Conventions
- Every page loads `theme.js` first, then calls `initTheme()`, `initNav()`, `initFooterQuote()` on init
- Every page has: skip-to-main link, theme toggle button, header with nav, footer with rotating quote
- Nav links use `./` relative paths; active page gets `class="nav-link active" aria-current="page"`
- Data is loaded via `fetch()` from JSON files — no server-side rendering
- XSS safety: Use `textContent` or `createTextNode()` for user/data-driven content. Use `innerHTML` only for static SVG icons
- Mobile: Hamburger nav toggle at 768px breakpoint
- YouTube embeds on homepage use lite-youtube pattern (click thumbnail to load iframe)

## Data Sources
- **Jokes**: `jokes-data.json` — 74 jokes with fields: `id`, `joke`, `episode`, `guest`, `url`, `time`
- **Videos**: `consolidated_youtube_data.json` — 939 entries with fields: `Video url`, `Title`, `Description`, `Channel name`, `Views`, `Likes`, `Duration`, `Thumbnail url`
- **Transcripts**: `transcripts.json` — 24 transcripts, array of `{title, content: [{speaker, text}]}`
- **Quotes**: `quotes-data.json` — quotes with `{id, quote, source, category, year}`
- **Appearances**: `competitor_data/appearances.json` — 695 entries with `{title, date, show, description, media_url, media_type, duration, thumbnail}`
- **Articles corpus**: `articles/ARTICLE COMPILATION COLLECTION - MASSIVE NORM STORIES.txt` — 760 URLs from owner's Google Drive collection, pending processing into `articles-data.json`
- **Source data/scripts**: `_archive/old/site-src/` has CSVs, XLSX, PDFs, Python scripts used to build the JSON files

## Content Pending Integration
- **Google Drive**: Owner has a `Memes\Norm Macdonald` folder with videos, GIFs, documents, jokes (requires local environment)
- **Article links**: 760 URLs in `articles/` need classification, dedup, and metadata extraction into `articles-data.json`
- **Competitor data enrichment**: `competitor_data/` has NML episodes, blue card jokes, standup specials, bucket list data that could become dedicated pages
- **Images**: `images/` is empty. Needs hero photo and about photo from owner.

## Folder Structure Notes
- `_archive/` — Previous React-based site, design mockups, old standalone apps. Reference only.
- `_tools/` — Data extraction & processing scripts (playlist extraction, data merge).
- `competitor_data/` — Scraped content from normmacdonaldarchive.com (appearances, episodes, jokes).
- `articles/` — Article link corpus and guidance notes from owner.
- `images/` — Currently empty. Needs hero photo and about photo.

## Important Rules
- This is a static site. No build step. No npm. No frameworks. Changes go live as-is.
- Keep it vanilla HTML/CSS/JS. The simplicity is a feature.
- Test pages by opening HTML files directly — they should work with relative paths.
- All content belongs to its respective owners. This is a non-commercial fan tribute.
- Deployment only works from `main` branch (GitHub Pages environment protection).
- See `SITE-PLAN.md` for the full development roadmap.
