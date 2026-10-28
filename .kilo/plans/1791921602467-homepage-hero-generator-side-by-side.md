# Homepage: hero + password generator side-by-side (desktop), shorter mobile title

## Goal

On the homepage, stop the hero block (badge + title + paragraph) from pushing the password
generator card below the fold. Desktop (>=1024px): hero on the left, generator card on the
right, side by side. Mobile: shorter title ("Free, strong and secure").

## Current state (verified in the repo, 2026-10-21)

- `index.html:191` — `<main class="w-full max-w-5xl mx-auto px-4 md:px-8 py-8">` (max 1024px;
  usable inner width 960px at >=768px viewport).
- `index.html:193-204` — hero `<div class="text-center max-w-2xl mx-auto mb-10">` containing the
  sky chip, the `h2` and the lead paragraph. Full width, centred, above everything.
- `index.html:198-200` — `h2` = "Free Password Generator - Create Strong, Secure Passwords",
  `text-3xl md:text-4xl`.
- `index.html:206-338` — `<section id="password-generator">` card (`p-6 md:p-8`), password output
  box, then the options block.
- `index.html:257` — options grid `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3` (3x2 at >=768px).
  Each `.pw-tile` (lines 259-322) carries hand-tuned divider classes for the 1/2/3-column regimes.
- `index.html:341-378` — 4 trust badges, `grid-cols-2 md:grid-cols-4` (full-width row).
- Fixed left sidebar = 118px (`sidebar.css:14`) -> content area = viewport - 118px on desktop.
- `script.js` touches only the generator by id (`#password-generator`, `#generate-btn`, ...) — no
  layout coupling. The QR modal is `fixed`. So this is a pure markup/class change; **no JS, no CSS
  or partial edits are required.**

## Decisions (from the user's answers)

1. **Title** — mobile-only short line: phones show "Free, strong and secure", >=640px keeps the
   current full title. `<title>`, meta description, og:title, twitter:title and the JSON-LD are
   untouched, so the keyword set Google actually indexes is unchanged.
2. **Left column** — hero text only (chip + title + paragraph), vertically centred against the
   card. The 4 trust badges stay a full-width row under the generator.
3. **Width / breakpoint** — page widens to `max-w-6xl` (1152px) at >=1280px viewports; the
   side-by-side split starts at 1024px (Tailwind `lg`).

### Derived decision (the one deviation — flag for approval)

The chosen combination (split at 1024px + 3-column options grid) is geometrically impossible to
render well, so the options grid drops to **2 columns (2x3 block) in the side-by-side range**:

- At a 1024px viewport: content = 906px, main inner = 842px. A 40/60 split gives the card
  ~490px; minus `p-8` (64) the options area is ~426px -> 3 tiles of ~142px, and each tile spends
  100px on padding/gap/toggle, leaving ~40px for the title => "Exclude Similar Characters" would
  wrap to 5 lines.
- With 2 columns the same tile is ~213px wide => ~113px for the title => 2 lines. Acceptable.
- 2x3 is also the ORIGINAL prototype shape for this block (STATE.md, Session 12: "compact 2x3
  seamless tiles table"); 3x2 is the shipped variant. Below 1024px (card full width) the grid
  keeps 3 columns, so the current look is untouched there.

Consequence: 3 small divider-class edits (see step 4). If the user prefers 3 columns everywhere,
the alternative is to start the side-by-side split at 1280px instead (one class change) and accept
that 1024-1279px laptops keep the stacked layout.

## Implementation steps (single chunk, `index.html` only unless noted)

1. **Page width** — `index.html:191`
   `w-full max-w-5xl mx-auto px-4 md:px-8 py-8` -> add `xl:max-w-6xl`.

2. **Grid wrapper** — wrap hero + generator card in a grid; trust badges stay outside it.
   ```html
   <div class="lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-8 lg:items-center">
     <div class="text-center lg:text-left max-w-2xl mx-auto lg:mx-0 lg:max-w-none mb-8 lg:mb-0">
       ...hero chip + h2 + paragraph...
     </div>
     <section id="password-generator" ...>...</section>
   </div>
   <section aria-label="Security and Trust Features" class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 lg:mt-10">
   ```
   - 4fr/8fr = 1:2 so the card (not the headline) owns the width.
   - `minmax(0,...)` so the card's min-content width can never force horizontal overflow.
   - Below 1024px the wrapper is a plain block: the current stacked page is preserved exactly.
   - `lg:items-center` vertically centres the short hero text against the taller card (no void
     under the paragraph, no markup duplication).

3. **Hero h2** — `index.html:198-200`
   ```html
   <h2 class="font-bold text-3xl md:text-4xl lg:text-3xl xl:text-4xl text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
     <span class="sm:hidden">Free, strong and secure</span>
     <span class="hidden sm:inline">Free Password Generator - Create Strong, Secure Passwords</span>
   </h2>
   ```
   - `sm:` (640px) switch = "mobile only" short line, as requested.
   - `lg:text-3xl` / `xl:text-4xl`: the headline sits in a 270-350px column in the side-by-side
     band, so 36px would wrap to 4+ lines there; 30px gives 3. The 768-1023px stacked layout keeps
     the current 36px (`md:text-4xl`).
   - Note: the h2's accessible text differs by viewport (hidden spans are not exposed to AT).

4. **Options grid + dividers**
   - `index.html:257`: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` ->
     `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2` (1 / 2 / 3 / 2 columns).
   - Divider classes, so the seams stay correct in all four regimes:
     | tile | line | current | new |
     |---|---|---|---|
     | 1 | 259 | `border-b sm:border-r` | unchanged |
     | 2 | 270 | `border-b md:border-r` | `border-b md:border-r lg:border-r-0` |
     | 3 | 281 | `border-b sm:border-r md:border-r-0` | `border-b sm:border-r md:border-r-0 lg:border-r` |
     | 4 | 292 | `border-b md:border-b-0 md:border-r` | `border-b md:border-b-0 md:border-r lg:border-b lg:border-r-0` |
     | 5 | 303 | `border-b sm:border-b-0 sm:border-r` | unchanged |
     | 6 | 314 | (no borders) | unchanged |
   Rationale: `lg` utilities are emitted after `md` utilities by the Tailwind Play CDN, so the
   `lg:` rules win at >=1024px. Tile order in the 2-column regime is 1,2 / 3,4 / 5,6 -> right
   border on 1,3,5; bottom border on 1,2,3,4. The tile state visuals are pure CSS
   (`.pw-tile:has(:checked)` in `style.css:467-529`) and are NOT touched.

5. **Trust badges** — keep `grid-cols-2 md:grid-cols-4 gap-4`, bump `mt-8` -> `mt-8 lg:mt-10`.
   No other section changes.

6. **Build + verify** — `node scripts/build.mjs` (must stay green: "Built N files -> dist/" and
   the news enrichment counters unchanged), serve `dist/` locally, run the browser checks below.
   Then commit (`fix(ui): ...`), rebase onto `origin/main`, push -> Cloudflare Pages auto-deploys,
   and re-run the same checks against production.

## Validation (Playwright, Edge, dark + light)

- Widths: 390x844, 640x800, 768x1024, 1024x768, 1280x800, 1440x900.
- At >=1024px: hero and `#password-generator` are side by side (hero.right <= card.left, both
  top-aligned within ~8px of each other), the card's top is within the first viewport (the
  generator is no longer pushed below the fold), and `document.scrollWidth <= innerWidth`
  (no horizontal overflow).
- Below 1024px: the stacked order is unchanged (hero above the card).
- Options grid column count by `getComputedStyle(grid).gridTemplateColumns`:
  1 col <640, 2 cols 640-767, 3 cols 768-1023, 2 cols >=1024; no double/seamless-broken borders
  (screenshot each regime).
- Title text: "Free, strong and secure" <640px, full title >=640px.
- Tile titles are not clipped (no `overflow:hidden` cut-off); the longest one
  ("Exclude Similar Characters") wraps to at most 2 lines at 1024px and 1280px.
- The generated password stays on one line at >=1280px (12-char password in the output box).
- Trust badges still 4-across at >=768px.
- 0 console errors; the generator still works (click Generate -> password rendered, Copy, QR).

## Risks / contingencies

- **Tailwind arbitrary value** `lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]` must be emitted by the
  Play CDN. Verify with `getComputedStyle(grid).gridTemplateColumns`; if it is not applied, fall
  back to a small `style.css` block (media query >=1024px) instead — no other file changes.
- `style.css` and `js/news-terms.js` are served with `max-age=14400` (STATE.md note) — a CSS
  fallback edit could take up to 4h to reach browsers; the Tailwind-class route is not affected
  (the page HTML is `max-age=0, must-revalidate`).
- 1024-1279px is the tightest band (hero column ~270-350px, card ~490-600px). If it looks
  cramped in review, the single-line fix is to move the split to `xl` (1280px) and restore
  `md:grid-cols-3` (tiles 3 columns everywhere) — no other change needed.

## Out of scope

- No changes to the generator logic, `script.js`, partials, other pages, the sticky-header fix,
  or the service worker.
- No change to `<title>` / meta / og / twitter / JSON-LD.
- No move of the trust badges into the left column (explicitly declined).
