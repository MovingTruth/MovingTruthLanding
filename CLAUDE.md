# MovingTruth — Project Rules

Hugo static site. Custom "temple" theme. Run with: `hugo server --baseURL http://localhost:1313/`

---

## Content Rules

### Blessings — non-denominational requirement

**All blessings must be suitable for anyone of any religious denomination, including all indigenous and native traditions worldwide.**

This means:
- No language specific to a single faith (no Jesus, no Allah, no Yahweh, no named deity from any single tradition)
- When naming the sacred, use plurals or universals: "whatever you call that light," "the Great Spirit, the Creator, the Divine, the Ancestors, the Earth Herself" — acknowledge multiple traditions rather than defaulting to any one
- Honor indigenous ways of knowing: reading the land, the water, the animals, ancestral memory, embodied knowing
- Truth and protection should be expressed as something felt and lived, not as doctrine
- The closing "So be it. So it is." is universal — keep it

---

## Technical Notes

- Hugo double-encoding: never use `| jsonify` alone inside `<script>` tags — always `| jsonify | safeJS`
- CSS fingerprinting uses absolute production baseURL locally — fix: `hugo server --baseURL http://localhost:1313/`
- Images: static/ files are served from site root (e.g. `/logo.png`, not `/static/logo.png`)
- Gallery section hidden from series grid via `menuOnly: true` front matter + `{{ if not .Params.menuOnly }}` filter

---

## Commit Rules

- Never push to remote until user has tested and explicitly approved
- Never include Co-Authored-By Claude or session URLs in commit messages
- Commit messages must be detailed: list files changed, what was added/modified/removed, and why
