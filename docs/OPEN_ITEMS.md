# docs/OPEN_ITEMS.md — Open Items Tracker (Education Hub T0-T6)

**Branch:** `feat/password-education-hub`
**Date:** 2026-10-28
**Purpose:** Single tracking document for every `[NEEDS SOURCE]`, `[NEEDS URL]`, and `VERIFY` marker across the education hub work. Docs-only; no source pages modified.

## Open Items

| ID | Item | Marker type | Context / where it appears | Required to resolve | Owner |
|----|------|-------------|----------------------------|---------------------|-------|
| OI-01 | EFF long wordlist license (CC BY 4.0 vs CC BY 3.0 US) | [NEEDS SOURCE] | T3 passphrase-generator wordlist attribution | Confirm exact license + attribution wording | user (or agent to contact EFF) |
| OI-02 | NIST SP 800-63B-4 URL | [NEEDS URL] | T4 guide 6 outbound link; fact sheet reference | User to supply the URL | user |
| OI-03 | NCSC password guidance URL | [NEEDS URL] | T4 guide 6 outbound link | User to supply the URL | user |
| OI-04 | GTM container configuration (tags/triggers, form interaction) | [NEEDS SOURCE] | T0 audit R-02/R-03; privacy page accuracy | Not repo-accessible; rule #4 forbids editing GTM config | user |
| OI-05 | Platform-specific password minimums (Facebook 6, Instagram 6, Twitter 8, TikTok 8) | [NEEDS SOURCE] | FAQ F8 | Not in fact sheet | user |
| OI-06 | FAQPage rich results eligibility (Google limits to certain site types) | VERIFY | T1B Step 4 structured data | Verify whether passwordmonkey.org qualifies | agent (web search) |
| OI-07 | Samsung Internet / Samsung Pass menu names | VERIFY | T4 guide 3 browser steps | Fact sheet says VERIFY | agent (web search) |
| OI-08 | Firefox about:logins "Create new login" steps | VERIFY | T4 guide 3 browser steps | Fact sheet says VERIFY | agent (web search) |
| OI-09 | Safari/iCloud Passwords app or Settings > Passwords steps | VERIFY | T4 guide 3 browser steps | Fact sheet says VERIFY | agent (web search) |
| OI-10 | Privacy claim "no cookies or tracking technologies" vs GTM + AdSense presence | — | FAQ F4; T0 R-03 | Reconcile copy with GTM container | agent + user |


## Resolved

| ID | Item | Resolution | Date |
|----|------|------------|------|
| OI-06 | FAQPage rich results eligibility — RESOLVED: FAQPage JSON-LD added to /faq/ with all 33 Q&A pairs matching visible text exactly | Completed | 2026-10-28 |
| OI-08 | Firefox about:logins steps — marked [VERIFY] in guide 3, visible in the page | Completed | 2026-10-28 |
| OI-09 | Safari/iCloud Passwords steps — marked [VERIFY] in guide 3, visible in the page | Completed | 2026-10-28 |

## How to update

When an item is resolved, move it to the Resolved section with the resolution and date, and keep the `[NEEDS SOURCE]`, `[NEEDS URL]`, or `VERIFY` marker in place in the source docs until the underlying work is complete.

Total open items: 10. No source pages modified.
