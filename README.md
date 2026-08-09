# PINCO Random Draw — Red & Gold

Static open-source random ID draw for GitHub Pages.

## Features

- Up to 1000 unique participant IDs
- IDs are treated as text, so leading zeroes are preserved
- Winner count selector
- Secure browser randomness via `crypto.getRandomValues()`
- Rejection sampling to avoid modulo bias
- Draw without replacement
- SHA-256 participant list hash
- Results copied one ID per line for Google Sheets
- No server and no participant data upload

## Upload to GitHub

Replace the old project files with:

- `index.html`
- `styles.css`
- `app.js`
- `pinco-logo.png`
- `README.md`

If GitHub Pages is already enabled, the public website will update after the new commit is deployed.

## Important

The logo is stored locally as `pinco-logo.png`, so the site does not depend on an external image URL.
