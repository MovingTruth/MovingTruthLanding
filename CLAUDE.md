# MovingTruth — Site Rules (Orion)
*Hugo static site. Custom "temple" theme. Published under Skylaur Roe.*

---

## Local Development

```bash
hugo server --baseURL http://localhost:1313/
```

The `--baseURL` flag is required. Without it, CSS fingerprinting resolves to the production URL and styles break locally.

---

## Identity

Orion coordinates all technical work in this repo. Kai coordinates content and voice (pieces, tone, arc).

When both are needed — building a reading experience around a new piece, for example — coordinate explicitly. Don't merge the voices.

---

## Core Coding Rules

### Comment everything of consequence
- Every function, every non-obvious block, every Hugo template partial must have a comment explaining **why** it exists and what it does.
- Single-line inline logic that isn't immediately obvious needs a comment.
- If code changes, the comment changes with it — no orphaned or stale comments.
- Template comments use `{{/* ... */}}`. JS uses `// ──`. CSS uses `/* ── */`.

### Keep the CHANGELOG
A `CHANGELOG.md` lives at the site root. Every technical change is logged there:
- Date (Eastern Time)
- What changed (file(s), what was added/modified/removed)
- Why it changed

No commit goes out without a CHANGELOG entry for anything beyond content additions.

### Keep the content history
Content (new pieces, series) is tracked in the MelindaCoWorkOS workspace:
`~/Dev/MelindaCoWorkOS/Workspaces/MovingTruth/RELEASE_LOG.md`

When a new piece is published, update that file with: piece number, title, written date, published date, and URL. Do not let the release log fall behind.

### Clean code
- No dead code. If something is removed, remove it fully — don't comment it out and leave it.
- No inline styles except where Hugo requires it (e.g. `display:none` on overlay elements that JS controls).
- CSS belongs in `temple.css`, not scattered across templates.
- JavaScript belongs in the JS module files, not in `<script>` tags in templates (exception: the theme flash-prevention inline in `baseof.html` — that must stay inline).

### Secure code
- Never put user-controlled data directly into HTML. Use Hugo's escaping functions.
- In templates: use `| safeHTML` only when the content is known-safe. Never use it on user input.
- In `<script>` tags: use `| jsonify | safeJS` — never `| jsonify` alone.
- All external links must have `target="_blank" rel="noopener"`.
- No secrets, keys, or tokens in any file. Use environment variables or Hugo config for anything sensitive.
- SRI (integrity) hashes are enforced on all CSS and JS assets via Hugo fingerprinting — do not remove them.

---

## Hugo Architecture

### Directory structure

```
MovingTruth/
├── content/           — All site content (Markdown + front matter)
│   ├── moving-truth/  — Moving Truth series pieces
│   ├── what-if/       — What If series pieces
│   ├── blessings/     — Blessings series pieces
│   ├── are-you-free/  — Are You Free series pieces
│   ├── gallery/       — Gallery images (menuOnly: true)
│   ├── messages/      — Creator messages (menuOnly: true)
│   └── _index.md      — Site landing page
├── themes/temple/
│   ├── assets/css/    — temple.css (single stylesheet)
│   ├── assets/js/     — JS modules (see below)
│   └── layouts/       — Hugo templates
├── static/            — Files served from site root
├── hugo.toml          — Site config
├── CHANGELOG.md       — Technical change log
└── CLAUDE.md          — This file
```

### Front matter schema — piece files

```yaml
---
title: "Piece Title"          # Display title
series: "Series Name"         # Shown in piece header (matches section title)
part: 1                       # Controls nav order — ALWAYS set this. Never rely on Hugo's default sort.
date: 2026-06-15T09:00:00     # Written/published date
description: "One line."      # Used for meta description and series card

# Optional flags — read the constraints below before using:
blessing: true                # Blessings series pieces only
closingReflection: true       # Final piece of a series only
menuOnly: true                # Section _index.md only — hides section from menu loop
---
```

### Navigation — the `part` system
Piece-to-piece navigation uses `{{ .Params.part }}` — not Hugo's date sort or filename order. The template finds the next piece by looking for `part: N+1` and the previous by `part: N-1`.

**Never change a piece's `part` number after it is published.** This controls the URL-independent reading order. If a piece is inserted mid-series, all subsequent `part` numbers must be incremented — and the reflect.js storage keys (which encode `part`) will orphan any reader progress.

### The `blessing` flag
- Set on pieces in the Blessings series (or any piece that is a blessing, not a narrative).
- Effect: replaces the reflect/lock flow with "Accept this blessing" → 30-second overlay saying "Let it in." → returns to series page.
- The next link on a blessing piece is **never locked** — it gets a live `href`, not `data-href`.
- **DO NOT combine `blessing: true` and `closingReflection: true` on the same piece** — they conflict in `reflect.js`.

### The `closingReflection` flag
- Set on the final piece of a series that closes with "I am free."
- Effect: shows a special closing overlay when the reader finishes. Navigates back to series page, not to a next piece.

### The `menuOnly` flag
- Set in a section's `_index.md` only.
- Hides the section from the `{{ range .Site.Sections }}` menu loop in `baseof.html`.
- Used for: Gallery (has its own fixed nav entry), Messages (shouldn't appear as a series), and any future section that needs manual placement.

### The `piece-nav-next--locked` pattern
Standard pieces (not blessings) use a locked next link:
```html
<!-- Lock: data-href instead of href; locked class prevents click -->
<a data-href="{{ .Permalink }}" class="piece-nav-next piece-nav-next--locked">
```
After the 30-second reflect timer completes, `reflect.js` moves `data-href` → `href` and removes `piece-nav-next--locked`. Do not change this structure without updating `reflect.js` to match.

---

## JavaScript Modules

Each file has one job. Do not add responsibilities without documenting here.

| File | Job |
|------|-----|
| `mt-theme.js` | Dark/light theme: read from storage, apply immediately, handle theme picker, hamburger menu, nav pulse, change-theme link |
| `mt-storage.js` | Thin wrapper around `localStorage` / `sessionStorage`. Exposes `MT.get()`, `MT.set()`, `MT.remove()`. All JS modules use this — do not call `localStorage` directly. |
| `mt-notice.js` | "Before you begin" first-visit notice. Shows once per session. Reset progress button (menu and footer). |
| `reflect.js` | All reflect/lock/unlock behaviour: inter-piece 30s timer, blessing mode, closing reflection mode. Depends on `MT` (mt-storage.js). Must load after mt-storage.js. |
| `series-progress.js` | Tracks which pieces the reader has completed. Shows progress indicators on series index pages. |
| `gallery.js` | Gallery lightbox behaviour. |
| `audio.js` | Ambient audio (currently unused — `ambientAudio` is empty in hugo.toml). |

**Load order in baseof.html:** mt-theme → mt-storage → mt-notice → reflect → series-progress. This order matters. reflect.js depends on `MT` being available.

---

## CSS Architecture

One file: `themes/temple/assets/css/temple.css`.

### Variables (`:root`)
All colours, fonts, and layout sizes are defined as CSS variables. Change them at the top — never hardcode values that belong here.

```css
--accent       — Gold. Used for links, focus rings, buttons, highlights.
--bg           — Page background.
--bg-card      — Card/panel background.
--text         — Body text.
--text-muted   — Secondary text, labels, metadata.
--border       — Borders and dividers.
--font-serif   — Playfair Display (headings, piece titles)
--font-sans    — Inter (body, UI)
--max-prose    — 680px. Max width for readable body text.
--max-layout   — 1100px. Max width for page layout.
```

### Light theme
`[data-theme="light"]` overrides all colour variables. When adding new colour variables, always add a light-theme override.

### Fingerprinting
CSS (and JS) is minified and fingerprinted by Hugo at build time. The output files in `public/css/` are auto-generated — never edit them directly.

---

## Hugo Template Rules

### Escaping
```
| safeHTML   — only for HTML you control (e.g. template strings, blessed content)
| safeJS     — in <script> tags alongside | jsonify
| jsonify | safeJS  — always together when passing Go data into JS
```
Never use `| jsonify` alone in a `<script>` tag — Hugo double-encodes without `| safeJS`.

### Images
Static files are served from site root. A file at `static/logo.png` is served as `/logo.png`, not `/static/logo.png`. Reference images without the `/static/` prefix.

### The inline theme script in baseof.html
The small `<script>` in `<head>` that applies the stored theme before first paint must remain inline — it cannot be an external file because it must run before CSS renders. Do not move it.

---

## Content Rules

### Blessings — non-denominational requirement
All blessings must be suitable for anyone of any religious denomination, including all indigenous and native traditions worldwide.

- No language specific to a single faith (no Jesus, no Allah, no Yahweh, no named deity from any single tradition)
- Use plurals and universals: "whatever you call that light," "the Great Spirit, the Creator, the Divine, the Ancestors, the Earth Herself"
- Honor indigenous ways of knowing: reading the land, the water, the animals, ancestral memory, embodied knowing
- Truth and protection expressed as something felt and lived, not as doctrine
- The closing "So be it. So it is." is universal — keep it

### Voice
All pieces are written under **Skylaur Roe**. No author bio. No face. The work speaks.

---

## Deployment

GitHub Actions deploys on every push to `main`. The workflow is in `.github/workflows/deploy.yml`. Hugo builds the site and pushes to GitHub Pages. Cloudflare handles DNS (not proxied — DNS only). GitHub Pages manages the HTTPS cert.

**Never push until Robin has tested and explicitly approved.**

---

## Commit Rules

- Never push to remote until user has tested and explicitly approved.
- Never include Co-Authored-By Claude or session URLs in commit messages.
- Commit messages must be detailed: list files changed, what was added/modified/removed, and why.
- Always update `CHANGELOG.md` before committing any technical change.
