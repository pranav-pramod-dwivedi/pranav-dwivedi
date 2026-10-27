# Pranav Dwivedi — personal site

Blacked-out editorial personal site for **Pranav Dwivedi**: software (Stargaze)
and cricket (Destroyers CC / RDCA). Static HTML/CSS/JS, no framework, no build
step. Production files ready for **Cloudflare Pages** at
`https://pranav-dwivedi.pages.dev`.

## Run locally

```bash
cd ~/pranavdwivedi
python3 -m http.server 8000
```

Open http://localhost:8000/pages (`.html` file names work locally; clean URLs
are rewritten on Cloudflare Pages).

## Pages

```
index.html        home — hero, archive, season stats, about, timeline, gallery, CTA
about.html        about
work.html         selected software / systems index
stargaze.html     Stargaze software branch (cobalt / solar orange / paper)
cricketer.html    cricket record — career, hits, the 216*, seasons, cabinet
network.html      curated backlinks / endpoints
profile.json      machine-readable entity profile (agents / AI)
profile.md        pure-text résumé (humans + grep)
contact.html      contact routes
privacy.html      privacy note
404.html          not found (noindex)
cricket.html      legacy redirect → cricketer (noindex)
engineering.html  legacy redirect → work (noindex)
```

## Deploy (Cloudflare Pages)

1. Cloudflare dashboard → Workers & Pages → Create → Pages → **Upload assets**.
2. Name the project `pranav-dwivedi` (produces pranav-dwivedi.pages.dev).
3. Drag this folder (`~/pranavdwivedi`) — everything needed is here:
   - `_redirects` — clean-URL rewrites (200) + legacy 301s + `/index.html → /`
   - `_headers` — nosniff, referrer policy, X-Robots-Tag, asset caching
   - `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `site.webmanifest`
4. Deploy. Then submit `https://pranav-dwivedi.pages.dev/sitemap.xml` in
   Google Search Console (Add property → URL prefix), Bing Webmaster Tools,
   and request indexing for `/` and `/cricketer`.

Rank strength comes from cross-links: point GitHub profile → site, Destroyers
CC page → site, Instagram bio → site.

## Assets and behaviour

- `assets/css/style.css` — home + cricket base styles, incl. who/journey/closer
- `assets/css/pages.css` — shared inner-page language
- `assets/css/stargaze.css` — Stargaze palette and layout
- `assets/css/motion.css` — scroll reveals, line draws, parallax
- `assets/js/main.js` — loader, menu, reveals, hero effects, h-scroll, counters
- `assets/js/motion.js` — progressive section animations (`prefers-reduced-motion` respected)
- `assets/img/og-card.png` — 1200×630 Open Graph card (all pages)
- `assets/img/favicon.svg` + `icon-32/64/192` + `apple-touch-icon.png`

## SEO / AI visibility

- `llms.txt` (index) + `llms-full.txt` (full entity text) + `profile.json` + `profile.md`
- One JSON-LD `@graph` on every page: shared `Person` (@id) + `WebSite` +
  `BreadcrumbList`; home adds `FAQPage`; cricketer adds `Article`.
- `robots.txt` explicitly allows Googlebot/Bingbot/DuckDuck + GPTBot,
  ClaudeBot, PerplexityBot, CCBot, Google-Extended, Applebot-Extended, meta-externalagent.
- Canonicals: `https://pranav-dwivedi.pages.dev/<page>` (no `.html`), enforced by `_redirects`.

## Palette

- Main site: black `#080808`, cream `#f2f0e9`, acid lime `#d2ff00`
- Stargaze: cobalt `#2846FF`, solar orange `#FF5A2A`, warm paper `#F2EADF`

`?fast` skips the intro loader. All cricket statistics from public RDCA and
Destroyers CC records.
