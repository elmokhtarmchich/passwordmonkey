# Project State

> **ORCHESTRATION PROTOCOL — ACTIVE (established 2026-10-01)**
> 1. This file is the project's persistent memory. READ it at the start of every session.
> 2. UPDATE this file after every completed step. No exceptions.
> 3. Decompose all work into CHUNKS of 5-7 atomic steps max. Present the full chunk plan to the user BEFORE writing any code.
> 4. Execute ONE CHUNK per session. Never continue to the next chunk automatically.
> 5. At the end of every chunk: STOP. Summarize what was completed, what was tested, and what changed in STATE.md. Ask the user for explicit approval and WAIT.

_Last updated: 2026-10-03 — Session 2 complete. OCI deployment kit created, review-hardened, and COMMITTED to main; production workflow canonicalized at automation/oci/workflows/LS41E1sQ0wNfjHYe-workflow_main.json. Active next step: USER-SIDE OCI signup + RUNBOOK.md Part A provisioning (user has no OCI account yet); design-migration chunk plan still SHELVED (reference only)._

## Completed
- [2026-10-01] Session 0: Repository audit. Stack confirmed: static site (plain HTML/CSS/JS, no build step), client-side password generator (Web Crypto API), PWA, WebMCP tools, cybersecurity news section, TencentDB Agent Memory integration (MemoryCore gateway :8420).
- [2026-10-01] Session 0: STATE.md created at repo root. Orchestration protocol active.
- [2026-10-01] Session 0: User request received: **FINISH THE DESIGN MIGRATION** (verify and complete the sidebar layout / dark theme / Maax VIA / JetBrains Mono design system site-wide).
- [2026-10-01] Session 0: Full read-only scope survey completed (via explore agent). Findings recorded under "Design Migration Status" below. No code written yet.
- [2026-10-02] Session 1: Session-start STATE.md read performed (protocol compliance). Awareness audit: AGENTS.md does NOT exist at repo root; STATE.md is untracked in git (invisible to the 3 Agent Manager worktrees under .kilo/worktrees/: alike-kayak, neon-sense, pinto-louse); custom agents exist in .kilo/agent/ (content-agent.md, ui-ux-engineer.md) with no protocol pointer.
- [2026-10-02] Session 1: Awareness proposal made to user: (1) standing rule — the orchestrator injects the relevant STATE.md slice into every delegated task prompt; (2) create AGENTS.md at repo root as the convention entry point pointing to STATE.md; (3) commit STATE.md + AGENTS.md after pulling the 1 upstream commit so worktrees/clones see them. Decision pending.
- [2026-10-02] Session 1: User approved creating AGENTS.md and committing the protocol frame (STATE.md + AGENTS.md + MEMORY.md); chunk plan shelved by user instruction. Executed: upstream pulled (fast-forward), AGENTS.md created, STATE.md updated, protocol files committed to local main.
- [2026-10-03] Session 2: Security audit of the n8n export folder (D:\Website\passwordmonkey\webmediadevaccount-workflows\webmediadevaccount-workflows, 8 JSONs): NO hardcoded secrets — GitHub auth via `$vars.GITHUB_TOKEN` + redacted n8n credential IDs; pinned data harmless. Found 4 near-duplicate production workflows (My_workflow embeds two pipeline copies). User decisions: deploy on Oracle Cloud Always Free Compute VM (Ampere A1, Docker, n8n localhost-only via SSH tunnel, sole open port = 22 restricted to owner IP); production workflow = LS41E1sQ0wNfjHYe-workflow_main.json (import ONLY this one).
- [2026-10-03] Session 2: OCI deployment kit chunk executed (user-approved): created automation/oci/ — docker-compose.yml (n8n bound to 127.0.0.1:5678, named volume n8n_data, task runners on, telemetry off, secure cookie configurable), .env.example, setup-vm.sh (idempotent Ubuntu bootstrap → /opt/passwordmonkey-n8n, auto-generates encryption key), RUNBOOK.md (Parts A-H: provision → deploy → tunnel → variables → credentials → import → verify → cutover, plus maintenance/troubleshooting). Also added `!.env.example` to .gitignore (required: the existing `.env.*` rule would otherwise exclude the committed template). Kit files NOT committed — awaiting user instruction.
- [2026-10-03] Session 2: `/review uncommitted` (security + business-logic + deploy-safety tracks; 9 warnings, 0 criticals) — ALL 9 FIXED: compose now sets N8N_BLOCK_ENV_ACCESS_IN_NODE=true (key unreadable from nodes), interpolates N8N_RUNNERS_ENABLED from .env, and caps json-file logs (10m×3); .env.example documents the runners knob + image pinning; RUNBOOK drops the redundant Header Auth PAT copy, uses `sudo nano` for .env edits, makes the Part B transfer deterministic/re-runnable (`~/kit/oci`), moves old-host deactivation BEFORE new-host activation (Part F step 3; Part H is now post-cutover duplicate cleanup), and rewrites the update procedure as backup → pin tag → pull; setup-vm.sh no longer suggests deleting .env (silent credential destruction).
- [2026-10-03] Session 2 (continuation): user approved (a) committing the kit and (b) canonicalizing the production workflow into the repo. Executed: LS41E1sQ0wNfjHYe-workflow_main.json copied to automation/oci/workflows/ (byte-identical, verified via `git diff --no-index`; parses as valid JSON), RUNBOOK Part F now imports the repo copy, Part A gained an OCI signup preamble (card = verification only; home region is permanent), and the kit (.gitignore + automation/oci/ + STATE.md) was committed to main. User's OCI status: NO account yet — signup + Part A are the active next step.

## In Progress
- NOTHING executing in-repo. The OCI deployment kit is COMPLETE and committed. Active user-side track: (1) Oracle Cloud FREE-TIER SIGNUP (card for verification only; home region is permanent), then (2) RUNBOOK.md Part A provisioning, then Parts B-H (guided by the runbook). User has NO OCI account yet. Design-migration chunk execution remains SHELVED per user decision (2026-10-02); do NOT execute it without a fresh explicit user request.

## Next / TODO
**User decision (2026-10-02): chunk execution SHELVED — the plan below is REFERENCE ONLY.** The design-migration findings and chunk plan are preserved for whenever the user reopens the work; they must not be executed without a fresh, explicit user request. Until then: every session reads AGENTS.md -> STATE.md, then awaits the user's request. Chunk plan as originally presented:

- **Chunk 1 — Baseline sync + new-design footer + subpage normalization** (7 steps)
  1. Pull origin/main (local branch is behind 1); re-grep design markers to confirm baseline unchanged.
  2. Canonicalize the new-design footer (the one currently only in index.html) into templates/footer.html.
  3. Apply the new footer to the 5 root subpages (about.html, faq.html, privacy.html, donate.html, password-security-guide.html); refresh the stale © 2024 year while editing footers.
  4. Apply the new footer to news/index.html and news/article-template.html; remove the inert SSI include comments in news/index.html.
  5. Normalize `<script src="script.js">` defer on about/donate/faq/privacy; fix donate.html preload position.
  6. Verify: old-footer grep count = 0 across user-facing pages; local render spot-check of 3 pages.
  7. Update STATE.md; stop for approval.
- **Chunk 2 — Migrate the 30 stub news articles to the new design** (6 steps)
  1. Build a temporary migration script that wraps each stub's existing content in the final article-template pattern (sidebar + top bar + fonts + new footer). Script is throwaway tooling — delete after verification (do not leave fixN.js-style debris).
  2. Run it on all 30 stubs (authoritative list under "Unmigrated news articles" below).
  3. Spot-check 3-5 migrated articles in a local browser (light + dark).
  4. Grep-verify all 30 are FULL on the design markers (M1-M17 set).
  5. Verify news/index.html links resolve and no regressions on the 43 already-migrated articles.
  6. Update STATE.md; stop for approval.
- **Chunk 3 — Fix the news generator + retire stale templates** (6 steps)
  1. Update automation/n8n/passwordmonkey-news-workflow.json (jsCode template) to emit the new design.
  2. Fix scripts/build_news.js stub/template filtering.
  3. Delete stale templates/ files (navigation.html, main_template.html, article_template.html, news_article.html — structurally broken); keep header.html, footer.html, news/article-template.html.
  4. Deduplicate update-manifest.js (scripts/ vs news/ — keep one).
  5. Dry-run: generate a test article from the updated template; grep-verify old anti-markers absent.
  6. Update STATE.md; stop for approval.
- **Chunk 4 — PWA + theme-color consistency** (6 steps)
  1. Refresh service-worker.js precache list (add sidebar.css, faq.html, fonts/maaxvia-*.otf, MatrixtypeDisplay, webmcp-tools.js; remove orphan fonts; decide news-page policy); bump CACHE_NAME pm-cache-v14 -> v15.
  2. Update manifest.json background_color/theme_color to the new palette (#42b8ff primary / dark canvas #181817).
  3. Batch-update `<meta name="theme-color">` stale #2563eb across all pages (46 at survey time; re-grep at execution — includes the 30 articles migrated in Chunk 2) + msapplication-TileColor in index.html.
  4. Verify every precache-listed file exists; service worker loads locally.
  5. PWA smoke test.
  6. Update STATE.md; stop for approval.
- **Chunk 5 — Fonts + debris cleanup + final site-wide verification** (7 steps)
  1. Align sidebar.css font-family stack order with the Tailwind sans stack.
  2. Remove inline JetBrains Mono font-family duplicates in index.html (lines ~283/286) in favor of shared CSS.
  3. Delete orphan font files (Ubuntu-Regular.ttf — no @font-face anywhere; OpenSans.ttf — fallback only, pending reference check).
  4. Delete migration debris: fix5.js, fix6.js, fix7.js, Exclude (all untracked; Exclude is a 0-byte stray).
  5. Full-site Playwright smoke test (light + dark; root pages + sample articles).
  6. Final grep sweeps: zero old anti-markers (bg-gray-800 footer, nav-link, mobile-link, nav-button) on user-facing pages; accessibility spot-check.
  7. Final STATE.md update + completion summary; stop.

## Key Decisions & Architecture
- **Orchestration protocol**: see banner at top. Coherence and persistence over speed; one chunk per session; explicit approval gates between chunks.
- **News automation deployment (2026-10-03)**: production n8n JSON = `workflow_main`, now canonicalized in-repo at automation/oci/workflows/LS41E1sQ0wNfjHYe-workflow_main.json (original export at D:\Website\passwordmonkey\webmediadevaccount-workflows\webmediadevaccount-workflows\ kept as source; older repo copy automation/n8n/passwordmonkey-news-workflow.json is superseded — keep for history). Target: Oracle Cloud Always Free A1.Flex VM (Ubuntu, Docker, n8n at 127.0.0.1:5678 via SSH tunnel only). CAUTION: automation/n8n/environment-variables.txt is STALE (lists the old elmok/passwordmonkey-news repo) — the authoritative variable list is the 5 in automation/oci/RUNBOOK.md Part D. The deployed workflow still emits the OLD article template (see reference Chunk 3) until that fix is executed.
- **User request (2026-10-01)**: Finish the design migration — complete and verify the sidebar layout / dark theme / Maax VIA / JetBrains Mono design system site-wide.
- **Design system markers (compliance checklist)**: sidebar `<aside class="sidebar" aria-label="Navigation">`; `<nav class="sidebar-nav" aria-label="Main navigation">`; `<div class="sidebar-actions">`; `<div class="content-wrapper">`; sidebar.css + style.css links; Tailwind `darkMode: 'class',`; sans stack `['Maax VIA', 'IBM Plex Sans', 'Inter', 'Open Sans', 'sans-serif']`; mono stack `['JetBrains Mono', 'IBM Plex Mono', 'monospace']`; `pm_dark` localStorage init; Google Fonts link (JetBrains Mono + Material Symbols); `fonts/maaxvia-400.otf` preload; body `class="bg-gray-50 dark:bg-canvas min-h-screen font-sans"`; top app bar (`sticky top-0 z-30 h-16 ...`); `data-dark-mode-toggle` / `data-dark-mode-icon`; `title-font ... PasswordMonkey<span` + favicon-96x96.png; `.org` badge (`dark:bg-green-200 dark:text-green-900">.org</span>`).
- **Anti-markers (old design)**: footer `bg-gray-800 text-white py-12 dark:bg-black`; `nav-link`; `mobile-link`; `nav-button`.
- **Design Migration Status (survey 2026-10-01, explore agent, read-only):**
  - Root pages index/about/faq/privacy/donate/password-security-guide: **FULL** (all markers). news/index.html: **FULL**. news/article-template.html: **FULL**.
  - News articles: 73 total; **43 FULL, 30 old-layout stubs** (bare `<body>`, no stylesheets, ~46-55 lines). The stub list below is authoritative.
  - **index.html is the ONLY page with the new footer** (`bg-neutral-100 dark:bg-card`, aria-label="Footer Links"). The other 50 migrated pages still have the old `bg-gray-800` footer. templates/footer.html holds a third variant. Footer © year stale (2024) on all pages.
  - **News generator root cause**: automation/n8n/passwordmonkey-news-workflow.json (jsCode) still embeds the OLD article template — re-running the pipeline would keep emitting stubs.
  - templates/ stale: only header.html is new-design (self-described inert reference); news_article.html is structurally broken (SSI-includes header.html inside `<head>`); navigation.html / main_template.html / article_template.html superseded by the sidebar.
  - service-worker.js (`pm-cache-v14`) precache stale: missing sidebar.css, faq.html, maaxvia-*.otf, MatrixtypeDisplay, webmcp-tools.js, all news pages; precaches unused OpenSans.ttf.
  - manifest.json theme colors stale (`#f9fafb` / `#2563eb` vs new `#42b8ff` / `#181817`); `<meta name="theme-color">` stale `#2563eb` on 46 files.
  - Fonts: Maax VIA = local @font-face (style.css, weights 400/500/700) + per-page preload; JetBrains Mono = CDN-only AND duplicated inline in index.html (~lines 283/286); sidebar.css font stack order differs from Tailwind stack; orphan files: fonts/Ubuntu-Regular.ttf (no @font-face anywhere), fonts/OpenSans.ttf (fallback only, still precached).
  - Misc: script.js missing `defer` on about/donate/faq/privacy; donate.html preload position differs; news/index.html has inert SSI includes (~lines 130, 390); duplicate update-manifest.js (scripts/ + news/); index.html main wrapper class differs from subpages (cosmetic, accepted); faq.html footer has extra `mt-12`.
- **Unmigrated news articles (30, all under news/) — authoritative list for Chunk 2:**
  - 2023-04-04-micron-technology-china-probes-us-chip-maker-for-c-7ffbfa.html
  - 2025-08-10-strong-password-trends-2025.html
  - 2025-08-21-sim-swapper-scattered-spider-hacker-gets-10-years-cc2a9f.html
  - 2025-08-21-why-video-game-anti-cheat-systems-are-a-cybersecur-5af646.html
  - 2025-08-22-large-interpol-cybercrime-crackdown-in-africa-lead-881f95.html
  - 2025-08-22-massive-anti-cybercrime-operation-leads-to-over-12-4cdb7d.html
  - 2025-08-23-ftc-warns-tech-giants-not-to-bow-to-foreign-pressu-ef2d60.html
  - 2025-08-23-geoserver-exploits-polaredge-and-gayfemboy-push-cy-07fd5b.html
  - 2025-08-24-malicious-go-module-poses-as-ssh-brute-force-tool--0b226f.html
  - 2025-08-24-the-best-labor-day-sales-for-2025-get-up-to-50-per-74392a.html
  - 2025-08-25-aspire-rural-health-system-data-breach-impacts-nea-b928b3.html
  - 2025-08-25-auchan-retailer-data-breach-impacts-hundreds-of-th-aaaf69.html
  - 2025-08-25-farmers-insurance-data-breach-impacts-11m-people-a-801242.html
  - 2025-08-25-farmers-insurance-data-breach-impacts-over-1-milli-811ea1.html
  - 2025-08-25-ftc-chair-tells-tech-giants-to-hold-the-line-on-en-3f054c.html
  - 2025-08-25-google-tests-qr-code-verification-for-text-message-78c7de.html
  - 2025-08-25-phishing-campaign-uses-upcrypter-in-fake-voicemail-7b9ebb.html
  - 2025-08-25-the-best-labor-day-sales-for-2025-get-up-to-50-per-74392a.html
  - 2025-08-25-weekly-recap-password-manager-flaws-apple-0-day-hi-558c18.html
  - 2025-08-26-cisa-warns-of-actively-exploited-git-code-executio-3e6df0.html
  - 2025-08-26-dslroot-proxies-and-the-threat-of-legal-botnets-8aab02.html
  - 2025-08-26-ftc-calls-on-tech-firms-to-resist-foreign-anti-enc-09aa79.html
  - 2025-08-26-healthcare-services-group-data-breach-impacts-6240-dd6527.html
  - 2025-08-26-hook-android-trojan-adds-ransomware-overlays-expan-d7fdfb.html
  - 2025-08-26-hundreds-of-thousands-of-affected-by-auchan-data-brea-636c7a.html
  - 2025-08-26-mixshell-malware-delivered-via-contact-forms-targe-2bdef3.html
  - 2025-08-26-nissan-confirms-design-studio-data-breach-claimed--8e36ed.html
  - 2025-08-26-spotify-is-adding-dms-7887fb.html
  - 2025-08-26-the-best-labor-day-sales-for-2025-save-up-to-500-o-1a52a2.html
  - secure-password-strategies-2025.html
- **Migration debris (untracked)**: fix5.js / fix6.js / fix7.js = three redundant one-off index.html dark-mode patchers (delete in Chunk 5); `Exclude` = 0-byte stray file (delete in Chunk 5). yandex_e8438f6f6907ddd1.html = search-engine verification stub, permanently out of scope.
- **Site layout**: static pages at repo root — index.html (generator app), about, faq, privacy, donate, password-security-guide; news/ = 73 articles + index.html + article-template.html; shared style.css, sidebar.css, script.js; js/; fonts/, images/, favicon_io/.
- **Generator app**: ALL password generation is client-side via Web Crypto API (nothing stored/logged/transmitted). PWA: service-worker.js + manifest.json. WebMCP: webmcp-tools.js registers generate_password, copy_password, get_password_strength, generate_qr_code, validate_password_options; docs in webmcp-tools.md; validate-agentic.js validates agent-browsing. Dev server: lite-server via `npm start`.
- **Agent memory**: TencentDB Agent Memory (see MEMORY.md). Standalone MemoryCore gateway :8420, SQLite + BM25; LLM extraction optional (TDAI_LLM_API_KEY). PM_AGENT_ID scopes memory per role (scout/reviewer/builder).
- **News pipeline**: news/ + automation/ + workflows/news-automation.json.
- **SEO/infra**: seo.json, sitemap.xml, robots.txt, llms.txt, .htaccess, .gitleaks.toml, AGENTIC_BROWSING.md.

## Blockers / Questions for User
- None. All decisions resolved (2026-10-02): AGENTS.md created; STATE.md + AGENTS.md committed to local main; MEMORY.md already tracked and unchanged; chunk execution shelved. New work only on a fresh user request.

## Repo Snapshot (2026-10-02, after upstream pull, immediately before the protocol-files commit)
**git status:**
```
## main...origin/main
?? Exclude
?? STATE.md
?? fix5.js
?? fix6.js
?? fix7.js
```

**Recent commits (post-pull):**
```
47e6c24 chore(news): auto-update manifest and XML feeds
cc3aa7f Site consistency: final sweep fixes
c968005 Batch-migrate all news articles to sidebar layout, dark theme, Maax VIA, JetBrains Mono
6097d76 Update templates/header.html to new sidebar + top bar pattern
2b927f5 Migrate news article template to new design system
```

**Protocol frame:** STATE.md + AGENTS.md are committed in the change made right after this snapshot; MEMORY.md was already tracked and unchanged.
