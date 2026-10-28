# FAQ Maintenance

## Purpose

Quarterly review of the FAQ plus after any major browser or NIST change.

## Review cadence checklist

- **Quarterly**:
  - verify all answers still match the FACT SHEET
  - check for new browser behavior (Chrome, Edge, Firefox, Safari, Samsung Internet)
  - verify all internal links resolve
  - check "Last reviewed" date
- **After major browser change**:
  - re-test save-to-browser behavior
  - update `/guides/save-password-to-browser/` steps
- **After NIST change**:
  - update length/composition/change-frequency guidance across all pages

## Checklist for adding a new question

- [ ] Question assigned to one of the 6 headings (Using the generator / Saving and reusing / Losing access / After a breach / Beyond passwords / About us)
- [ ] Answer uses only the FACT SHEET; any unsourced claim marked [NEEDS SOURCE]
- [ ] Answer: 1-2 sentence direct answer → detail → internal "Learn more" link
- [ ] Answer length 40-120 words
- [ ] Plain language (~grade 8), no jargon without definition
- [ ] Stable id assigned (format: `faq-XX-slug`)
- [ ] Added to FAQPage JSON-LD with matching visible text
- [ ] "Last reviewed" date not needed on individual answers (page-level only)
- [ ] Tested: keyboard operable, URL hash deep-linking works, client-side search finds it

## Change log template

| Date | Question | Change | Reason | Reviewer |
|------|----------|--------|--------|----------|
|      |          |        |        |          |

## Fact-sheet anchor points to re-verify each review cycle

- NIST SP 800-63B-4: min 15 chars, no composition rules, no forced periodic change
- Browser credential storage: filed under origin, Chrome/Edge/Firefox/Safari/Samsung behavior
- Recovery: Bitwarden master password unrecoverable, 1Password Emergency Kit, Apple recovery options
- Breach monitoring: Chrome warnings, Edge Password Monitor

## Open items to track

See `docs/OPEN_ITEMS.md`.

FAQ maintenance doc ready. No source pages modified.
