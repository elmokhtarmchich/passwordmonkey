# docs/AUDIT.md — PasswordMonkey read-only audit (T0)

**Branch:** `feat/password-education-hub` (read-only audit; no source changes)
**Date:** 2026-10-24
**Source of truth:** repository files inspected at working tree; no live production probing performed by this agent.

## 1. Stack, build & deploy

- **Stack:** Static HTML/CSS/JS site. No framework, no build step for news articles except the deploy-time include expander. Styling via Tailwind (loaded from CDN script `https://cdn.tailwindcss.com` on every page) with an inline `tailwind.config`. Fonts from Google Fonts CDN (`fonts.googleapis.com`); Font Awesome from `cdnjs.cloudflare.com`.
- **Build step (since 2026-10-11):** `scripts/build.mjs` (Node stdlib only) expands `<!--@include partials/X.html key=value -->` markers in source pages into `dist/`. Shared chrome lives in `partials/`. Deploy allowlist copies root pages/assets + `favicon_io/`, `fonts/`, `images/`, `js/`, `news/` to `dist/`. Repo-root files NOT copied to dist.
- **Hosting/deploy:** Cloudflare Pages. Build command `node scripts/build.mjs`, output dir `dist`. Production serves `dist/` only.
- **CI:** GitHub Actions `.github/workflows/news-pipeline.yml` — cron `0 */6 * * *` + `workflow_dispatch`. Runs on `ubuntu-latest`, Node 20, `npm ci`, then `node automation/actions/news-pipeline.mjs`, then manifests/XML, then commits and pushes to branch it runs on (Risk R-05).
- **Staging:** None; use Cloudflare Pages preview deployments.
- **Local preview:** `npm start` = `node scripts/build.mjs && node scripts/serve.mjs`.
- **URL hygiene:** root `_redirects` (301s) and root `404.html` (auto-heals truncated news URLs via `news-manifest.json`).

## 2. Page & template inventory

**Root source pages:** `index.html`, `about.html`, `faq.html`, `privacy.html`, `donate.html`, `password-security-guide.html`, `404.html`.
**News:** `news/index.html`, `news/article-template.html`, ~153 articles.
**Shared chrome (partials/):** `head-assets.html`, `head-scripts.html`, `theme-init.html`, `gtm-noscript.html`, `sidebar.html`, `topbar.html`, `footer.html`. Styles: `style.css`, `sidebar.css`, `kilo-typography.css`. App logic: `script.js`, `webmcp-tools.js`, `validate-agentic.js`.
**Build scripts:** `scripts/build.mjs`, `scripts/serve.mjs`, `scripts/test-local.mjs`.

## 3. Generator code & randomness — CRITICAL FINDING

- **Location:** `script.js`, function `generatePassword()` (~line 156).
- **Randomness source:** `window.crypto.getRandomValues(new Uint32Array(length))` — correct, Web Crypto API.
- **CRITICAL BUG:** line 178: `password += charset[randomValues[i] % charset.length];` — modulo bias; must use rejection sampling.
- **Default length:** slider `min="4" max="50" value="12"` (T1 raises default to 16).
- **Entropy/strength:** `calculateStrength(password)` = `length * log2(charsetSize)`. Tiers: <32 weak, <64 fair, <128 good, >=128 strong.
- **Privacy invariant:** all generation client-side (Web Crypto API). Nothing stored/logged/transmitted.
- **Offline:** works offline once assets cached (PWA + service worker `pm-cache-v17`).

## 4. Security headers & CSP

- `.htaccess` (inert in prod) sets: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **No CSP header found in repo.** CSP lives in Cloudflare dashboard.

## 5. Google Tag Manager (GTM-TXRRC7RB)

- Loads on `index.html`, `faq.html`, `404.html` via head script + `partials/gtm-noscript.html`. **News pages do NOT carry GTM.**
- No consent banner; fires unconditionally including previews.
- `privacy.html` claims no tracking/analytics while GTM + AdSense exist.

## 6. Analytics

- **AdSense:** `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9540362101494663` loads on `index.html` only.
- GTM implies GA4; container config not repo-accessible.

## 7. robots.txt & sitemap.xml

- `robots.txt`: Allow all, `Sitemap: https://passwordmonkey.org/sitemap.xml`, Crawl-delay 1, disallows `/admin/ /private/ /temp/ /cache/`. Does **not** disallow `/lab/`.
- `sitemap.xml`: 7 URLs, all `lastmod 2026-09-19`. News articles not in root sitemap.

## 8. Canonical tags

- `index.html`: canonical `https://passwordmonkey.org/` ?
- `faq.html`: canonical `https://passwordmonkey.org/faq` ?
- `about.html`, `donate.html`: **no canonical/og/twitter**
- `password-security-guide.html`: canonical present ?
- News: `og:url`/`twitter:url` on `.html` form

## 9. Affiliate link attributes

- `index.html` NordVPN/NordPass use `rel="noopener noreferrer"` — **missing `rel="sponsored"`**. T1 requires `rel="sponsored noopener"`.
- Security-scan links not affiliate.

## 10. FAQ duplication

- Homepage FAQ (5 questions) duplicates 3 questions from `/faq/` page.

## 11. Baselines (Lighthouse / axe) — not yet established

- `lighthouse` and `axe-core` not in `node_modules`. Must establish baseline before T1/T1B merge.

## 12. Console errors (pre-existing)

- AdSense report-only CSP notice on index.html; `script.js` logs QRCode error only if library missing.

## 13. Risks & recommended plan

| ID | Risk | Severity | Recommended action |
|----|------|----------|--------------------|
| R-01 | Modulo bias in `generatePassword()` (`script.js:178`) | **Critical** | Replace `%` with rejection sampling before T1. |
| R-02 | GTM fires on preview URLs; no consent | High | Propose build-time GTM skip for previews. |
| R-03 | `privacy.html` claims no tracking while GTM+AdSense exist | Medium | Reconcile privacy copy. |
| R-04 | Missing `rel="sponsored"` on NordVPN/NordPass | Medium | T1: add `rel="sponsored noopener"` + label. |
| R-05 | News pipeline commits/pushes to branch it runs on | Medium | Coordinate timing on feature branch. |
| R-06 | Missing canonicals on about.html/donate.html | Low | Add later. |
| R-07 | `.htaccess` inert, no CSP in repo | Low | Verify headers; propose CSP. |
| R-08 | FAQ advice conflicts with FACT SHEET | **Critical** | T1 fixes 3 critical answers; T1B full upgrade. |

**Recommended plan:** Fix R-01 first, then T1, then T1B (needs changelog approval), T2-T6.

## 14. Items deferred to user

- News pipeline behavior on feature branches (confirm).
- GTM on previews (confirm).
- Cloudflare Access for previews (user action).
- New routes under `/guides/` and `/tools/` (pending approval).
- Outreach contact email (out of scope).

**Stop condition:** T0 complete; awaiting user "go" before T1.

## 15. Baselines captured (T0)

- **Build:** `node scripts/build.mjs` succeeded — "Built 255 files -> dist/ (194 pages transformed, 978 includes resolved, 61 copied byte-identical); news articles enriched: 183 (share: 549, related: 183, prevnext: 183, cta: 81, terms: 183)". dist/ is gitignored.
- **Local server:** `scripts/serve.mjs` on port 3000 (zero-dependency static dist server emulating Cloudflare Pages clean-URL routing).
- **Static presence checks (HTTP fetch against http://localhost:3000):**
  - `/`: `#generated-password` present ✓; GTM script `googletagmanager.com/gtm.js?id=GTM-TXRRC7RB` present (2 matches: head script + gtm-noscript iframe) ✓
  - `/faq`: GTM script present (2 matches) ✓; `<details>` count 0 (faq.html uses border-l-4 sections, not details — the details accordions live on the homepage) ✓
- **Browser console errors:** NOT captured — Playwright is not installed (`node_modules/playwright` absent). Console.error/warn capture via browser unavailable.
- **Lighthouse / axe baselines:** NOT established — `lighthouse` and `axe-core` are not in `node_modules` and were not installed (no new deps added without asking).
- **Steps to complete baselines later:** `npm i -D @playwright/test playwright` + `npx playwright install chromium`, then launch Chromium, goto `/` and `/faq`, capture console events, run Lighthouse and axe, record scores. Record final scores here before T1/T1B merge. DoD: Lighthouse performance within 5 points of baseline; axe clean (no critical issues).

**Stop condition:** T0 complete; awaiting user "go" before T1.

