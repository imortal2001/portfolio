# Portfolio — Louie Jay

A fast, hand-built portfolio site: plain HTML, CSS and JavaScript, served and bundled by Vite. No framework, no CMS, so it loads instantly and is easy to edit.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (the Games launch config uses port 5190)
npm run build      # outputs the static site to dist/
```

## Editing content

Everything visible lives in **`index.html`**:

| What | Where in `index.html` |
|---|---|
| Name, headline, intro, stats | `HERO` section |
| Project cards | `WORK` section, one `<article class="project">` each. `data-kind` is `app` or `game` (used by the filter tabs); the card colours are the `--p-bg / --p-ink / --p-accent` values in its `style` |
| Case study dialogs | `<template id="case-…">` blocks near the end; the card's `data-case` button opens the matching one |
| Skills | `SKILLS` section |
| Problem-solving stories | `PROBLEMS SOLVED` section |
| About, experience timeline | `ABOUT` section. There's a commented example `<li>` for adding earlier roles |
| Email and links | `CONTACT` section (the email appears in the link, the copy button's `data-copy`, and is read by the form) |

Styles are in `src/styles.css` (colour tokens at the top, light and dark), behaviour in `src/main.js`.

## Images

Screenshots live in `public/images/` as WebP.

- `npm run capture` re-captures KusinaLink, Jammr and Adrift from their live sites or local dev servers into `raw/` (see `scripts/capture*.mjs`; the Jammr script stages a demo chat on the local server).
- `npm run images` converts `raw/` plus Isla Lola's store captures into `public/images/` (needs `cwebp`: `brew install webp`).
- `npm run og` renders the 1200×630 social preview to `public/og.png`.

## Deploy

Live at **https://louiejay.pages.dev** (Cloudflare Pages project `louiejay`, same account as Isla Lola). To publish changes:

```bash
npm run deploy
```

If you move to a custom domain, update the `og:url`, `og:image` and `canonical` URLs at the top of `index.html`.
