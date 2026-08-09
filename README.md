# Random Pinco

Open-source static random ID draw for a live broadcast.

## What it does

- Accepts up to 1000 unique IDs.
- IDs can be pasted one per line, separated by spaces, commas or semicolons.
- Preserves leading zeroes because IDs are treated as text.
- Lets the operator choose how many unique IDs to draw.
- Uses `window.crypto.getRandomValues()` with rejection sampling to avoid modulo bias.
- Draws without replacement, so the same ID cannot win twice in one draw.
- Computes a SHA-256 hash of the canonical participant list before the draw.
- Copies winners as one ID per line, ready to paste into a single Google Sheets column.
- Sends no participant data to a server.

## Files

- `index.html` — page markup
- `styles.css` — visual design
- `app.js` — complete draw logic

Because the project is static, anyone can inspect the exact production source in the public GitHub repository.

## Publish free on GitHub Pages

1. Create a **public** GitHub repository, for example `random-pinco`.
2. Upload `index.html`, `styles.css`, `app.js`, and this `README.md` to the repository root.
3. Open the repository: **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then save.
6. GitHub Pages will show the public site URL.

Typical URL:

`https://YOUR-GITHUB-USERNAME.github.io/random-pinco/`

## Transparency note for the broadcast

Before START, show the participant count and the SHA-256 list hash on screen.
After the draw, the same hash appears with the results.

A technically inclined viewer can inspect `app.js` in GitHub and verify:

1. The site uses the browser Web Crypto API.
2. Selection is made without replacement.
3. No specific ID is hard-coded as a winner.
4. The participant list is never sent to a backend.

## Google Sheets

Press **COPY FOR GOOGLE SHEETS** after the draw.

The clipboard will contain:

```text
12345678
87654321
10492837
```

Pasting this into Google Sheets puts each ID on a separate row in one column.

## Important limitation

Open source lets viewers audit the algorithm, but a static site alone does not create a third-party notarized record of a past draw. For stronger public verification, archive the livestream and keep the exact Git commit used for the event.
