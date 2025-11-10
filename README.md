# Jokes Section Redesign Prototype

This is a redesigned prototype of the Jokes section for The Norm Macdonald Archive.

## Features

✨ **New Design**
- Clean, modern aesthetic inspired by Norm Macdonald Live
- Light/dark theme toggle (respects system preference)
- Improved typography and spacing
- Smooth animations and transitions

🎲 **Random Joke Generator**
- Prominent button for getting random jokes
- Beautiful modal with quote styling
- Share functionality

🔍 **Enhanced Search & Filter**
- Real-time search through jokes
- Filter by guest
- Clear results counter

📄 **Better UX**
- Pagination (10 jokes per page)
- Share individual jokes
- Watch video links (when available)
- Keyboard shortcuts (R for random, ESC to close modal)

## Files

- `index.html` - Main HTML structure
- `styles.css` - All styling with theme system
- `script.js` - Interactive functionality
- `jokes-data.json` - Jokes database (76 jokes)

## How to View

Visit: `https://vondubenshire.github.io/norm/redesign/`

## Tech Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- CSS Custom Properties for theming
- Modern ES6+ JavaScript
- Mobile-first responsive design

## Next Steps

If approved, this design can be:
1. Expanded to include all sections (Home, Videos, etc.)
2. Enhanced with more jokes data
3. Integrated with the main site navigation
4. Optimized further for performance
# norm

Static Norm Macdonald site originally built by magus.

## `site/`

The `site/` directory contains the generated static assets copied from the
local `norm-macdonald-website-dist/dist` build.

- Serve `site/` with any static server (for example: `npx serve site`).
- `site/consolidated_youtube_data.json` is included for data-driven pages.

## `codex-design/`

`codex-design/` hosts an alternate Codex-inspired interface for exploring the
Norm Macdonald joke archive. When the repository is published via GitHub Pages,
you can open the experience at `https://<username>.github.io/<repo>/codex-design/`.

Features:

- Spotlight area that can be shuffled to surface a random joke.
- Search bar plus guest and source drop-down filters that work together to
  refine the results list.
- Light/dark theme toggle that persists your preference and respects system
  defaults.

All functionality is implemented with vanilla HTML, CSS, and JavaScript so the
page can be served statically without additional build tooling.
