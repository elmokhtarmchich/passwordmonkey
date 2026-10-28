# docs/FAQ_AUDIT.md — FAQ inventory & fact-sheet conflict audit (T0)

**Branch:** `feat/password-education-hub` (read-only audit)
**Date:** 2026-10-24
**Fact sheet reference:** FACT SHEET in mission brief (NIST SP 800-63B-4 final Aug 2025: min 15 chars single-factor, allow 64+, no composition rules, no forced periodic change — change on evidence of compromise, screen against common/breached passwords, password managers and paste must be allowed).

## Method

Every question + answer on `index.html` (home page) and `faq.html` was inventoried: visible text, URL, anchor/ID (or `<details>` position), inbound links, and any `FAQPage` JSON-LD structured data. Each answer was checked against the FACT SHEET. Conflicts are marked `CONFLICT` with the fact-sheet basis noted. Items needing a source are marked `[NEEDS SOURCE]`.

## A. Home page FAQ — index.html (visible `<details>` accordions, section "Frequently Asked Questions")

| # | Question | Answer (verbatim, condensed) | Conflict flag | Fact-sheet basis |
|---|----------|------------------------------|---------------|------------------|
| H1 | Is this password generator secure? | "Yes, our password generator is completely secure. All password generation happens in your browser using cryptographically secure random number generation. We never see, store, or transmit your passwords." | None — consistent | Client-side Web Crypto; nothing stored/transmitted |
| H2 | How long should my password be? | "For maximum security, we recommend using passwords that are at least 12 characters long. Longer passwords are exponentially more secure against brute force attacks." | **CONFLICT** | Fact sheet: minimum 15 characters for single-factor; T1 raises default to 16, "16 or more recommended" |
| H3 | Should I use special characters? | "Yes, including special characters (!@#$%^&*) in your passwords significantly increases their strength and makes them harder to crack." | **CONFLICT** | Fact sheet: no composition rules; length and uniqueness matter most; symbols not required |
| H4 | Can I use the same password for multiple accounts? | "No, you should never use the same password for multiple accounts. If one account is compromised, all your other accounts would be at risk. Use unique passwords for each account." | None — consistent | Uniqueness matters |
| H5 | How often should I change my passwords? | "It's recommended to change your passwords every 3-6 months, or immediately if you suspect a security breach. Also change passwords if you've used them on compromised websites." | **CONFLICT (critical)** | Fact sheet: no forced periodic change — change on evidence of compromise only |

**URL:** `https://passwordmonkey.org/`  
**Anchors/IDs:** No stable IDs on the `<details>` elements; questions are the 5 `<summary>` texts in order. Not individually deep-linkable.  
**Inbound links:** Sidebar (`data-pm-nav="home"` is the page itself); footer links Home. Homepage links to `/password-security-guide` in the educational section.  
**Structured data:** `FAQPage` JSON-LD at index.html lines 94-125 with 3 questions: H1, H2, H3 (verbatim match to visible answers H1-H3).

## B. FAQ page — faq.html (~13 visible questions + FAQPage JSON-LD)

### Visible questions (by section)

| # | Section (id) | Question | Answer summary | Conflict flag |
|---|--------------|----------|----------------|---------------|
| F1 | how-to-use | How do I generate a password with PasswordMonkey? | Steps: visit site, set length 4-50, choose types, optionally exclude similar, click Generate, copy | None |
| F2 | how-to-use | What do the password strength indicators mean? | Weak <32 bits, Fair 32-64, Good 64-128, Strong 128+ bits entropy | None |
| F3 | how-to-use | Can I generate QR codes for my passwords? | Yes, click QR code icon after generating; useful for mobile transfer | None |
| F4 | security-privacy | Is PasswordMonkey safe to use? | Yes; Web Crypto API in browser; nothing sent to servers; no storage/logging; no cookies/tracking; open source | **Partial** — "no cookies or tracking technologies" conflicts with GTM + AdSense presence (see AUDIT.md R-03) |
| F5 | security-privacy | How does PasswordMonkey ensure password randomness? | Web Crypto API `crypto.getRandomValues()`; hardware RNG | None — consistent (note: generator itself has modulo bias, see AUDIT.md R-01) |
| F6 | security-privacy | What's the difference between online and offline password generators? | Runs in browser but processes locally; convenience without server-side risk | None |
| F7 | social-media | What are the best password practices for social media accounts? | 16+ chars for high-value; all character types; unique per platform; 2FA; regularly update after incidents | **Soft conflict** — "Include all character types" is composition-rule-ish; "regularly update" OK only if read as after compromise |
| F8 | social-media | Are there specific requirements for different social media platforms? | Facebook min 6 no spaces; Instagram min 6; Twitter min 8; TikTok min 8 | **[NEEDS SOURCE]** — platform minimums not in fact sheet |
| F9 | business-use | How can freelancers and small businesses use PasswordMonkey? | Client accounts, temp credentials, admin accounts, API keys, business social media | None |
| F10 | business-use | What password length should businesses use? | Standard 16-20, Admin 20-25, Financial 25+, API keys 32+ | None (longer is fine; not required by fact sheet) |
| F11 | comparisons | How does PasswordMonkey compare to LastPass, Dashlane, Bitwarden? | Free, no account, no storage vs premium/account/storage | None |
| F12 | memorable-passwords | How can I create memorable but secure passwords? | Passphrase 4-6 random words; Diceware; pattern; acronym; random + manager for max security | None — passphrase consistent with fact sheet |
| F13 | memorable-passwords | Should I use memorable passwords or random passwords? | Random + manager for max security; passphrase 4-6 words if you need to remember | None |

**URL:** `https://passwordmonkey.org/faq`  
**Canonical:** `https://passwordmonkey.org/faq` ✓  
**Anchors/IDs:** Sections `#how-to-use`, `#security-privacy`, `#social-media`, `#business-use`, `#comparisons`, `#memorable-passwords`. Individual questions have no IDs — not deep-linkable.  
**Inbound links:** Sidebar (`data-pm-nav="faq"`), footer Resources column links `/faq`.  
**Structured data:** `FAQPage` JSON-LD at faq.html lines 405-460 with 6 questions: "How do I generate a password with PasswordMonkey?", "Is PasswordMonkey safe to use?", "What are the best password practices for social media accounts?", "How can freelancers and small businesses use PasswordMonkey?", "How does PasswordMonkey compare to LastPass, Dashlane, and Bitwarden?", "How can I create memorable but secure passwords?". Text matches visible answers F1, F4, F7, F9, F11, F12.

## C. Duplicated FAQ content

The following appear on BOTH the home page and `/faq/` (visible text, and H1-H3 also in both pages' FAQPage JSON-LD):

| Question | Home page | /faq/ page | JSON-LD on both? |
|----------|-----------|------------|------------------|
| Is this password generator secure? | H1 (visible + JSON-LD) | F4 (visible + JSON-LD) | Yes |
| How long should my password be? | H2 (visible + JSON-LD) | Not asked on /faq/ | Home only |
| Should I use special characters? | H3 (visible + JSON-LD) | Not asked on /faq/ | Home only |

Note: H2 and H3 are home-page-only in visible text but their answers duplicate guidance that conflicts with the fact sheet (see H2/H3 above). No other exact duplicates found between the two pages.

## D. Conflict summary vs FACT SHEET

| # | Location | Question | Conflict | Severity | Fix owner |
|---|----------|----------|----------|----------|-----------|
| C-01 | index.html H5 | How often should I change my passwords? | "every 3-6 months" scheduled change | **Critical** | T1 (replace with change-on-breach-or-suspicion) |
| C-02 | index.html H2 | How long should my password be? | "at least 12 characters" | Critical | T1 (raise to 15 min / 16 recommended) |
| C-03 | index.html H3 | Should I use special characters? | Symbols "significantly increases strength" | Critical | T1 (length + uniqueness, no composition rules) |
| C-04 | faq.html F4 | Is PasswordMonkey safe to use? | "no cookies or tracking technologies" | Soft | Verify vs GTM container; reconcile privacy copy |
| C-05 | faq.html F7 | Social media best practices | "Include all character types" / "regularly update" | Soft | T1B rewrite |

## E. Open items

- [NEEDS SOURCE] F8 platform-specific minimums (Facebook/Instagram/Twitter/TikTok) — not in fact sheet.
- [NEEDS SOURCE] GTM container configuration (what tags/triggers fire; whether forms are touched) — not repo-accessible; rule #4 forbids editing GTM config.
- FAQPage JSON-LD: only valid if visible text matches exactly — to be re-verified after T1B rewrite (Google limits FAQ rich results to certain site types — VERIFY).

**Stop condition:** FAQ inventory complete; awaiting user "go" before T1. Conflicts C-01/C-02/C-03 are the three critical fixes T1 must address.
