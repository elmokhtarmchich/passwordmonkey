# PasswordMonkey Content Plan — Education Hub (T1B–T6)

Planning/review artifact only. No source pages modified.

## 1. Hub Vision & Information Architecture

Mission: (1) help hesitant people adopt random passwords; (2) teach save / reuse / recover; (3) earn links naturally.

Site map:
- Root: index.html (generator), faq.html -> /faq/
- /guides/ hub + 6 guides
- /tools/passphrase-generator/, /tools/recovery-kit/
- /lab/save-test.html (noindex, unlinked)
- /faq/

Tone: warm, plain language ~grade 8, short sentences, empowering, never fear-mongering. English first; one strings file per page/tool for future translation.

## 2. T1B: FAQ Upgrade

Canonical /faq/ page: native <details>/<summary> accordions, stable ids, deep-linkable via URL hash. Category jump links at top. Client-side search (no network, no tracking). "Last reviewed: [date]". Short answers 40-120 words. Each: 1-2 sentence direct answer -> detail -> internal "Learn more" link. Group headings: Using the generator / Saving and reusing / Losing access / After a breach / Beyond passwords / About us. ~20+ questions from FAQ_CHANGELOG (KEEP/REWRITE/DELETE/NEW). FAQPage JSON-LD only if visible text matches exactly. Accessibility: keyboard operable, visible focus, correct heading levels. Homepage: top 5 questions + "See all questions" link; remove duplicate blocks.

## 3. T2: /lab/save-test.html (Save-to-Browser Lab)

Purpose: test navigator.credentials.store across browsers/devices. noindex, nofollow; excluded from sitemap; not linked; no GTM/analytics. Four variants behind separate buttons: (1) navigator.credentials.store(new PasswordCredential({id,password,name})); (2) visible form autocomplete=username/new-password, preventDefault -> history.replaceState -> remove form; (3) same form, same-document fragment navigation as submit signal; (4) same form submitting into hidden about:blank iframe. Banner: detected browser family + window.PasswordCredential support. Results recorder: tester ticks prompt shown / saved / visible in manager / autofilled on revisit. Export results as Markdown table in memory only (no storage). README: how to run each variant. docs/TEST_MATRIX.md template: platforms x browsers x scenarios. Acceptance: DevTools network panel shows zero requests; no password in console/DOM after 1s/storage.

## 4. T3: Tools (client-side, offline)

### 4a. /tools/passphrase-generator/
Word count 4-10 (default 6); separator choice (space, dash, none); optional capitalization and number; entropy readout bits (log2(7776^count) for EFF 7776-word list); copy button; "Works offline" note. EFF long wordlist (7776 words) self-hosted - LICENSE UNCLEAR [NEEDS SOURCE]: EFF site policy says CC BY 4.0; third parties cite CC BY 3.0 US. Attribution: "EFF's Long Wordlist by Joseph Bonneau / Electronic Frontier Foundation" + link https://www.eff.org/dice. Never write wordlist from memory; download from official URL. Unit tests for randomness helper and entropy math. Keyboard + screen-reader checks.

### 4b. /tools/recovery-kit/
Printable one-page checklist, fill BY HAND. Fields: email recovery codes location, 2FA backup codes location, trusted contact, phone carrier PIN, password-manager emergency kit location, device passcodes reminder, date reviewed. Must NOT ask users to type any password or secret - clear warning. Print stylesheet (@media print). No storage.

## 5. T4: Content Hub - /guides/

Hub page /guides/: Title "The Complete Guide to Password Safety"; unique meta description <=155 chars; one H1; short intro; scannable sections; "Last updated"; "Sources"; internal links to hub, generator, two siblings per child; JSON-LD Article + BreadcrumbList; canonical + OG tags.

Six guide pages:
1. /guides/why-use-random-passwords/ - three fears (where does it live / what if hacked / what if lose access); reframe: one strong stored password vs reused weak ones.
2. /guides/where-to-save-passwords/ - comparison: browser/phone built-in vs dedicated manager vs paper vs what NOT to use (notes apps, spreadsheets, email to self, screenshots).
3. /guides/save-password-to-browser/ - per-browser tabs: Chrome, Edge, Firefox, Safari, Samsung, Opera/Brave/Vivaldi; numbered steps; Copy address buttons for internal chrome:///edge:// URLs; honest note prompt may not appear; entries filed under passwordmonkey.org; mark every VERIFY item visibly; live "Save to my browser" panel NOT in this sprint.
4. /guides/lost-password-dont-panic/ - cases: forgot one site password, lost device, forgot manager master password, password in breach; calm step-by-step; link to Recovery Kit.
5. /guides/secure-your-first-5-accounts/ - ladder: email -> bank -> phone carrier -> main cloud -> main social; "Change as you go"; 2FA/passkeys; on-device checklist, tick states in localStorage under clearly named key (no secrets).
6. /guides/password-advice-that-changed/ - plain-language NIST explainer; outbound links ONLY to user-provided URLs [NIST SP 800-63B-4 URL], [NCSC password guidance URL] - leave [NEEDS URL] if not supplied; no statistics beyond fact sheet.

Per-page: unique title/meta desc, H1, intro, sections, Last updated, Sources, internal links (hub + generator + 2 siblings), JSON-LD Article + BreadcrumbList, canonical + OG tags.

## 6. T5: Navigation & Linking

Guides item in header + footer (sidebar active=guides). Breadcrumbs on all new pages. Descriptive anchor text (never "click here"). sitemap.xml + robots.txt updates (lab excluded). "Share or cite this page" box: copyable URL + one-line description, branded anchor text only. FAQ link in header/footer. Generator page links to relevant FAQ entries; each guide links to its FAQ entries.

## 7. T6: docs/LINKBUILDING.md (docs only)

Target categories: libraries, schools, universities, nonprofits, digital-literacy, senior-safety resource pages. Three email templates: resource page, unlinked mention, broken link. Tracking sheet template. "Never do" list: buying links, networks, exchanges at scale, repeated exact-match anchors, keyword press releases, comment/forum drops, expired-domain redirects, fake mentions. rel="sponsored" on affiliate links. Do NOT send outreach.

## 8. Content/Tone Guidelines

Grade 8 plain language, short sentences. Empowering, never fear-mongering. No invented facts/statistics/URLs/quotes - [NEEDS SOURCE] marker. Privacy: nothing leaves browser. Accessibility: WCAG 2.1 AA. Performance: <=5 point Lighthouse regression, lazy-load non-critical JS.

## 9. Implementation Order & Dependencies

Wave 1 (independent): docs/CONTENT_PLAN.md (this doc), docs/OPEN_ITEMS.md
Wave 2 (blocked on changelog approval): T1B site copy changes
Wave 3 (independent of copy): T2 lab page, T3 tools structure
Wave 4: T4 guide pages
Wave 5: T5 navigation/linking
Wave 6: T6 linkbuilding docs

## 10. Open Items / [NEEDS SOURCE] tracking

- EFF wordlist license (CC BY 4.0 vs CC BY 3.0 US)
- NIST SP 800-63B-4 URL (user to supply)
- NCSC password guidance URL (user to supply)
- GTM container details (not repo-accessible)
- Platform-specific password minimums (Facebook 6, etc.)
- FAQ rich results eligibility (Google limits to certain site types - VERIFY)
- Samsung Internet / Firefox / Safari menu names (VERIFY)

This plan is ready for review. No source pages have been modified.
