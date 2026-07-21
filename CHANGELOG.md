# CHANGELOG — MovingTruth
*Technical changes only. Content additions are tracked in the workspace RELEASE_LOG.*
*All dates Eastern Time.*

---

## 2026-07-21

- `static/images/inner-sign-icon.png` — Replaced the Inner Sign app icon shown on MovingTruth.com with Robin's new gold elemental-circle artwork, exported as a 1024×1024 PNG for consistent app and web use.

## 2026-07-18

Fixes from a full deployment review (storage/cookie state bugs, dead navigation code, memory leaks, minor security/accessibility hardening). Full findings in the review report.

- `themes/temple/assets/js/mt-storage.js` — Added `MT.getValue()/setValue()` (durable string values, e.g. theme/language) and `MT.getSessionValue()/setSessionValue()/removeSessionValue()` (true session-scoped storage: sessionStorage + a session cookie with no `expires`, cleared when the browser session actually ends) alongside the existing boolean `get()/set()/remove()`. Needed because the existing API only stored boolean flags, but theme and language need real values.
- `themes/temple/layouts/_default/baseof.html` — Swapped `mt-storage.js` to load before `mt-theme.js` (was the reverse). `mt-theme.js` reads `MT` at the top level, before `DOMContentLoaded`, to apply the stored theme before first paint — with the old order, `MT` didn't exist yet when that ran.
- `themes/temple/assets/js/mt-theme.js` — Replaced its own local `localStorage`/`sessionStorage` helpers with `MT.getValue/setValue/getSessionValue/setSessionValue/remove/removeSessionValue`, so theme choice gets `MT`'s cookie fallback instead of silently failing to persist when `localStorage` is blocked.
- `themes/temple/assets/js/mt-lang.js` — Replaced direct `localStorage.getItem/setItem('mt_lang', …)` calls with `MT.getValue/setValue`, for the same cookie-fallback reason. This was the most fragile of the stored prefs — it had no fallback at all.
- `themes/temple/assets/js/mt-notice.js` — The "before you begin" notice now uses `MT.getSessionValue/setSessionValue('mt_noticed', …)` instead of the durable `MT.get/set`, so it's genuinely per-session (was persisting via localStorage with no expiry plus a 365-day cookie, contradicting its own "shown once per session" behavior). Also rescoped the global "Reset progress" button (`doReset`) to only remove keys matching `_reflected_`, `_accepted_`, or `_closing`, instead of every `mt_`-prefixed key — it was silently deleting `mt_lang` and `mt_support_prompted` too, resetting a reader's language and re-arming the 3-piece support interrupt every time they reset their reading progress.
- `themes/temple/assets/js/series-progress.js` — Per-series "Reset progress" now also clears `mt_{slug}_accepted_{part}` keys (blessing acceptance), not just `_reflected_`/`_closing`. Previously a reset on the Blessings series left accepted-blessing state behind, so a reset piece still read "Accept this blessing again." Updated the file's header comment to document the `_accepted_` key.
- `themes/temple/assets/js/reflect.js` — Wired the blessing/closing overlay's "I receive this." / "I am free." button to actually navigate to the series page (`seriesPage`, from `data-series-page`) after the fade-out — this was documented behavior (see `single.html`'s template comments) that was never implemented; the overlay just dismissed in place. Added a `pageshow`/`event.persisted` listener that forces a reload on a bfcache restore, since a reflect countdown can't resume from one (`DOMContentLoaded` doesn't fire again). Added a `blessingRunning` guard so rapid re-clicks on the blessing button don't accumulate `pagehide`/click listeners, while still allowing a legitimate re-acceptance after a cycle completes.
- `themes/temple/assets/js/gallery.js` — Added a keyboard focus trap to the lightbox (Tab/Shift+Tab now cycle between its three buttons instead of escaping into the page behind it), matching the pattern already used for the hamburger menu.
- `themes/temple/layouts/series/single.html` — Added `rel="noopener"` to the Substack signup `<form target="_blank">`, which was missing it (every `<a target="_blank">` in the theme already had it).
- `.github/workflows/deploy.yml` — Pinned `hugo-version` to `0.163.1` (was `"latest"`), matching the locally installed version, so deploys are reproducible and don't silently pick up an unreviewed upstream Hugo release.
- `CLAUDE.md` — Updated the `mt-storage.js` module description and the documented JS load order to match the above.

## 2026-07-13

- `CLAUDE.md` — Added the explicit Cowork OS inheritance chain and linked the canonical Moving Truth workspace guide so Claude Code receives the same identity, memory, and Orion context when opened directly in the site repository.
- `AGENTS.md` — Added a concise Codex bridge that loads the Cowork OS and repository-specific site rules without duplicating them.

## 2026-06-23

- `themes/temple/layouts/_default/list.html` — Back to Home on series listing pages (e.g. /blessings/, /moving-truth/) was still pointing to /. Changed to /series/. Missed in the previous navigation pass.

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
