# CHANGELOG — MovingTruth
*Technical changes only. Content additions are tracked in the workspace RELEASE_LOG.*
*All dates Eastern Time.*

---

## 2026-06-22

- `themes/temple/layouts/_default/baseof.html` — Menu "Home" link changed from `/` to `/series/`. Added `.mt-menu-header` block at top of menu panel containing a brand link (logo + "MovingTruth.com") that navigates to the doorway page — the only remaining in-menu path to `/`. Close button moved inside the header row.
- `themes/temple/assets/css/temple.css` — Added `.mt-menu-header`, `.mt-menu-brand`, `.mt-menu-brand-logo` styles. Removed `align-self: flex-end` and `margin-bottom` from `.mt-menu-close` (now handled by the header wrapper).

---

## 2026-06-22

- `themes/temple/layouts/_default/single.html` — "Back to Home" now links to `/series/` (the main Series hub) instead of `.Parent.Permalink` (the specific series). `data-series-page` updated to match — reflect.js completion flow (closing, blessing, final piece) now also lands on `/series/`. The logo remains the only path back to the landing/doorway page. Updated comments to match.

---

## 2026-06-22

- `CLAUDE.md` — Rewrote with full coding rules: comment standards, changelog requirement, Hugo architecture, JS module map, CSS architecture, escaping rules, security requirements, deployment notes.
- `CHANGELOG.md` — Created. Backfilled from release log history.

---

## 2026-06-22

- `themes/temple/layouts/_default/single.html` — Renamed "Back to Main" button to "Back to Home". Changed link target from site root (`/`) to series index page (e.g. `/moving-truth/`) so readers return to the series they came from, not the landing page.

---

## 2026-06-17

- `themes/temple/layouts/_default/single.html` — Rewrote piece navigation to use `part` front matter instead of Hugo's default section sort order. Navigation now always flows 1→2→3→4 regardless of file date or filename.

---

## 2026-06-16

- **Site released** — GitHub repo created (`MovingTruth/MovingTruthLanding`), GitHub Pages enabled, custom domain `movingtruth.com` wired via Cloudflare DNS (DNS only, not proxied), HTTPS enforced via GitHub Pages managed cert.
- GitHub Actions deploy workflow added (`.github/workflows/deploy.yml`).

---

## 2026-06-15

- **Site built** — Hugo site created with custom Temple theme. Dark/light theme system, reflect/lock reader flow, series navigation. Two pieces written and added.

---
