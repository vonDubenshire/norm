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
