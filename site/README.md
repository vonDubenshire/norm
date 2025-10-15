Norm Macdonald static site (built)

What this folder contains:
- A built static site (contents copied from the `norm-macdonald-website-dist/dist` folder).
- `consolidated_youtube_data.json` used by the site (939 videos).

How to serve locally:
- Use any static file server. Example with Node.js:
  npx serve .

Notes and next steps:
- If you want the full React source project added instead of the built `dist`, provide the `norm-macdonald-website` folder (the app source). I can add it to the repository.
- The original TODO suggested building with pnpm; the built `dist` is included here so you can deploy immediately.
