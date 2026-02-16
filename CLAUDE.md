# The Norm Macdonald Archive

## Project Overview
A fan-made tribute website celebrating Norm Macdonald's comedy legacy. Static site hosted on GitHub Pages at `https://vondubenshire.github.io/norm/`. Pure HTML/CSS/JavaScript — no build tools or frameworks.

## Architecture
- **Static site**: All pages are standalone HTML files in the repo root
- **Shared styling**: `styles.css` (CSS custom properties for theming)
- **Shared JS**: `theme.js` (theme toggle, mobile nav, footer quotes — loaded by every page)
- **Page-specific JS**: `script.js` (jokes), `videos.js`, `transcripts.js`, `mitt-jokes.js`
- **Data files**: JSON files in root (`jokes-data.json`, `consolidated_youtube_data.json`, `transcripts.json`)
- **Deployment**: GitHub Pages via `.github/workflows/static.yml` — deploys on push to `main`

## Key Pages
| File | Purpose |
|------|---------|
| `index.html` | Homepage with featured joke, must-watch clips, site stats |
| `jokes.html` | Searchable/filterable joke collection (loads `jokes-data.json`) |
| `videos.html` | 939-video archive with search/pagination (loads `consolidated_youtube_data.json`) |
| `transcripts.html` | Expandable transcript viewer (loads `transcripts.json`) |
| `about.html` | Bio, career timeline, about the project |
| `mitt-romney-jokes.html` | Carousel of Mitt Romney jokes (data in `mitt-jokes.js`) |

## Conventions
- Every page loads `theme.js` first, then calls `initTheme()`, `initNav()`, `initFooterQuote()` on init
- Every page has: skip-to-main link, theme toggle button, header with nav, footer with rotating quote
- Nav links use `./` relative paths; active page gets `class="nav-link active" aria-current="page"`
- Data is loaded via `fetch()` from JSON files — no server-side rendering
- XSS safety: Use `textContent` or `createTextNode()` for user/data-driven content. Use `innerHTML` only for static SVG icons
- Mobile: Hamburger nav toggle at 768px breakpoint

## Data Sources
- **Jokes**: `jokes-data.json` — 76 jokes with fields: `id`, `joke`, `episode`, `guest`, `url`, `time`
- **Videos**: `consolidated_youtube_data.json` — 963 entries with fields: `Video url`, `Title`, `Description`, `Channel name`, `Views`, `Likes`, `Duration`, `Thumbnail url`
- **Transcripts**: `transcripts.json` — array of `{title, content: [{speaker, text}]}`
- **Source data/scripts**: `old/site-src/` has CSVs, XLSX, PDFs, Python scripts used to build the JSON files

## Content Pending Integration
- **Google Drive**: Owner has a `Memes\Norm Macdonald` folder with videos, GIFs, documents, jokes (not yet accessible from this environment)
- **Scraped archive content**: Previously scraped by Codex — check `old/` and recent commits
- **Article collection**: Owner has a large list of collected articles to add
- **Epstein article**: `Epstein Files Transparency Act Debate by Michael Tracy.html` is in root, not yet linked from any page

## Folder Structure Notes
- `old/` — Previous React-based site, raw data files, Python processing scripts. Reference only.
- `redesign/` — Design mockups/prototypes. Reference only.
- `codex-design/` — Alternate Codex-designed joke interface. Reference only.
- `norm-mitt-jokes/` — Original Mitt jokes standalone app (superseded by `mitt-romney-jokes.html`)
- `images/` — Currently empty. Needs hero photo and about photo.

## Important Rules
- This is a static site. No build step. No npm. No frameworks. Changes go live as-is.
- Keep it vanilla HTML/CSS/JS. The simplicity is a feature.
- Test pages by opening HTML files directly — they should work with relative paths.
- All content belongs to its respective owners. This is a non-commercial fan tribute.
- Deployment only works from `main` branch (GitHub Pages environment protection).
