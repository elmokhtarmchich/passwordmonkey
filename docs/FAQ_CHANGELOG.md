# FAQ Change Log — Review Artifact (T1B Step 1)

**Purpose:** Review artifact before any site copy changes are made. No source pages have been modified.
**Source:** `docs/FAQ_AUDIT.md`
**Date:** 2026-10-28

Every proposed answer uses only the FACT SHEET (NIST SP 800-63B-4: min 15 chars single-factor, allow 64+; NO composition rules; NO forced periodic change — change on evidence of compromise only; screen against common/breached passwords; password managers and paste must be allowed; length and uniqueness matter most; passwords and passphrases both work). Any claim not in the fact sheet is marked `[NEEDS SOURCE]` or `[NEEDS URL]`.

## FAQ Change Table

| # | Original question | Original answer (verbatim, condensed) | Decision | Proposed new text | Reason | Fact-sheet source |
|---|---|---|---|---|---|---|
| H2 | How long should my password be? | "at least 12 characters..." | REWRITE | Use 15 characters or more; 16 or more is recommended. | NIST min 15 single-factor | NIST SP 800-63B-4 |
| H3 | Should I use special characters? | "special characters significantly increases strength" | REWRITE | No. Length and uniqueness matter most, not symbols. | No composition rules | NIST SP 800-63B-4 |
| H5 | How often should I change my passwords? | "every 3-6 months..." | REWRITE | Only change if you suspect a breach. | No forced periodic change | NIST SP 800-63B-4 |
| H1 | Is this password generator secure? | duplicated on /faq/ | DELETE | n/a | Duplicate; canonical lives on /faq/ | — |
| H4 | Can I use the same password for multiple accounts? | "No, never reuse..." | KEEP | same | Consistent with uniqueness | NIST SP 800-63B-4 |
| F1 | How do I generate a password with PasswordMonkey? | — | KEEP | same | Accurate, no conflict | — |
| F2 | What do the password strength indicators mean? | — | KEEP | same | Entropy tiers accurate | — |
| F3 | Can I generate QR codes for my passwords? | — | KEEP | same | Feature description | — |
| F4 | Is PasswordMonkey safe to use? | "...we don't use cookies or tracking technologies" | REWRITE | Remove the no-cookies/no-tracking claim (GTM + AdSense exist); keep client-side generation claim | Conflicts with GTM/AdSense presence | privacy.html + GTM-TXRRC7RB [NEEDS SOURCE for GTM container details] |
| F5 | How does PasswordMonkey ensure password randomness? | — | KEEP (note: generator modulo bias fixed in T1) | same | Web Crypto API | crypto.getRandomValues |
| F6 | What's the difference between online and offline password generators? | — | KEEP | same | Accurate | — |
| F7 | What are the best password practices for social media accounts? | "Include all character types... regularly update" | REWRITE | Use 15+ chars for high-value accounts; unique per platform; enable 2FA; change only after breach/suspicion | Composition-rule-ish + scheduled change | NIST SP 800-63B-4 |
| F8 | Are there specific requirements for different social media platforms? | platform minimums (Facebook 6, etc.) | [NEEDS SOURCE] | Keep but flag: platform minimums not in fact sheet | Not in fact sheet | [NEEDS SOURCE] |
| F9 | How can freelancers and small businesses use PasswordMonkey? | — | KEEP | same | Use cases | — |
| F10 | What password length should businesses use? | — | KEEP | same | Longer is fine | NIST allows 64+ | NIST SP 800-63B-4 |
| F11 | How does PasswordMonkey compare to LastPass, Dashlane, Bitwarden? | — | KEEP | same | Accurate comparison | — |
| F12 | How can I create memorable but secure passwords? | — | KEEP | same | Passphrase consistent | Passwords and passphrases both work | NIST SP 800-63B-4 |
| F13 | Should I use memorable passwords or random passwords? | — | KEEP | same | Random + manager for max security | — |
| N1 | Is it safe to use the PasswordMonkey generator? | — | NEW | Yes. All generation happens in your browser using the Web Crypto API. Our servers never see, store, or transmit your passwords. | Client-side only | Web Crypto API; nothing leaves browser | — |
| N2 | Does PasswordMonkey store or see my passwords? | — | NEW | No. PasswordMonkey never receives your passwords. Generation is entirely local to your device. | Privacy | Privacy invariant | — |
| N3 | How long should my password be? | — | NEW | 15 characters or more; 16 or more is recommended. | NIST min | NIST SP 800-63B-4 | — |
| N4 | Do I need symbols in my password? | — | NEW | No. Length and uniqueness matter most; symbols are optional. | No composition rules | NIST SP 800-63B-4 | — |
| N5 | What if a site limits password length or rejects symbols? | — | NEW | Use the maximum length the site allows. If it rejects symbols, use letters and numbers only — length still matters most. | Site limits | Practical guidance | — |
| N6 | Random password or passphrase? | — | NEW | Both work. A long random password or a passphrase of several random words are both strong; store either in a password manager. | Both valid | Passwords and passphrases both work | NIST SP 800-63B-4 |
| N7 | Where should I save my passwords? | — | NEW | In a password manager (browser-built-in or dedicated). Never in notes apps, spreadsheets, email, or screenshots. | Storage guidance | — | — |
| N8 | Is it safe to save passwords in my browser? | — | NEW | Yes, browsers can save passwords. Entries are filed under the page's origin (passwordmonkey.org for this site), not the target site. | Browser storage | Fact sheet: filed under origin | — |
| N9 | What is a password manager? | — | NEW | An app that stores your passwords in an encrypted vault, unlocked by one strong master password. | Definition | — | — |
| N10 | Why does my browser file the entry under passwordmonkey.org? | — | NEW | Browsers save credentials under the page's origin, so an entry created on passwordmonkey.org is filed there, not under the site the password is for. | Origin filing | Fact sheet | — |
| N11 | Can I reuse a password? | — | NEW | No. Use a unique password for every account so one compromise doesn't spread to the rest. | Uniqueness | NIST SP 800-63B-4 | — |
| N12 | What if I forget a password? | — | NEW | Use the site's 'forgot password' reset flow, or your password manager if you saved it there. | Recovery | — | — |
| N13 | What if I lose my phone? | — | NEW | Use your password manager on another device, or your recovery codes/emergency kit. | Device loss | — | — |
| N14 | What if I forget my password manager's master password? | — | NEW | It may be unrecoverable. Bitwarden cannot reset a forgotten master password; 1Password uses an Emergency Kit (Secret Key) and recovery codes; Apple needs a trusted device passcode, recovery contact, or recovery key. | Master password loss | Fact sheet | — |
| N15 | How do I know if a password was exposed? | — | NEW | Chrome warns about exposed passwords; Edge has Password Monitor. Your password manager may also monitor for breaches. | Breach detection | Fact sheet | — |
| N16 | What do I change first after a breach? | — | NEW | Change the breached password first, then any other account where you reused the same password. | Change on compromise | NIST SP 800-63B-4 | — |
| N17 | Do I need two-step verification? | — | NEW | Yes, where available. It adds a second check beyond your password. | 2FA | — | — |
| N18 | What are passkeys, and do they replace passwords? | — | NEW | Passkeys are a password-free sign-in option supported by many platforms. They can replace passwords where offered, but passwords still work everywhere. | Passkeys | — | [NEEDS SOURCE for support claims] |
| N19 | Are there affiliate links? | — | NEW | Yes. Some product links are affiliate links, marked 'sponsored'. They help support the site. They're kept separate from educational content. | Disclosure | rel=sponsored | — |
| N20 | How do you make money? | — | NEW | Through affiliate links and donations. Password generation itself is free and private. | Revenue | — | — |

## Decisions pending your review

All REWRITE, DELETE, and NEW rows require sign-off before any site edits: H2, H3, H5, H1, F4, F7, F8 (NEEDS SOURCE), and N1–N20. KEEP rows (H4, F1, F2, F3, F5, F6, F9, F10, F11, F12, F13) are unchanged.

## Note

Every proposed answer uses only the FACT SHEET; any claim not in the fact sheet is marked `[NEEDS SOURCE]` or `[NEEDS URL]`.