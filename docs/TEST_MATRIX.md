# Test Matrix - Save-to-Browser Lab

## Instructions for Running Tests

For each variant on each browser/platform, follow these steps:

### Variant 1: navigator.credentials.store()
1. Open lab/save-test.html in the target browser.
2. Click "Test Variant 1".
3. Observe if the browser shows a save prompt (if supported).
4. Check password manager for saved entry (	estuser / TestPass123!).
5. Revisit the page/profile to test autofill.

### Variant 2: Form + preventDefault + replaceState + remove
1. Open lab/save-test.html.
2. Submit the Variant 2 form.
3. Observe if save prompt appears before/after form removal.
4. Check password manager and autofill on revisit.

### Variant 3: Form + fragment navigation
1. Open lab/save-test.html.
2. Submit the Variant 3 form (uses fragment navigation).
3. Observe save prompt behavior.
4. Check password manager and autofill on revisit.

### Variant 4: Form into about:blank iframe
1. Open lab/save-test.html.
2. Click "Test Variant 4" to auto-create and submit iframe form.
3. Observe save prompt behavior.
4. Check password manager and autofill on revisit.

**Notes:** Use the Results Recorder checkboxes and "Export as Markdown" to log observations. No data is stored by this page itself.

## Test Matrix

| Platform | Browser | Scenario | Variant 1 | Variant 2 | Variant 3 | Variant 4 | Notes |
|----------|---------|----------|-----------|-----------|-----------|-----------|-------|
| Windows  | Chrome  | First save | [ ] | [ ] | [ ] | [ ] | |
| Windows  | Edge    | First save | [ ] | [ ] | [ ] | [ ] | |
| Windows  | Firefox | First save | [ ] | [ ] | [ ] | [ ] | |
| Windows  | Opera   | First save | [ ] | [ ] | [ ] | [ ] | |
| Windows  | Brave   | First save | [ ] | [ ] | [ ] | [ ] | |
| macOS    | Chrome  | First save | [ ] | [ ] | [ ] | [ ] | |
| macOS    | Safari  | First save | [ ] | [ ] | [ ] | [ ] | |
| macOS    | Edge    | First save | [ ] | [ ] | [ ] | [ ] | |
| macOS    | Firefox | First save | [ ] | [ ] | [ ] | [ ] | |
| macOS    | Brave   | First save | [ ] | [ ] | [ ] | [ ] | |
| Android  | Chrome  | First save | [ ] | [ ] | [ ] | [ ] | |
| Android  | Samsung Internet | First save | [ ] | [ ] | [ ] | [ ] | |
| Android  | Edge    | First save | [ ] | [ ] | [ ] | [ ] | |
| Android  | Brave   | First save | [ ] | [ ] | [ ] | [ ] | |
| Android  | Firefox | First save | [ ] | [ ] | [ ] | [ ] | |
| iPhone   | Safari  | First save | [ ] | [ ] | [ ] | [ ] | |
| iPhone   | Chrome  | First save | [ ] | [ ] | [ ] | [ ] | |
| iPhone   | Edge    | First save | [ ] | [ ] | [ ] | [ ] | |
| iPhone   | Firefox | First save | [ ] | [ ] | [ ] | [ ] | |
| iPhone   | Brave   | First save | [ ] | [ ] | [ ] | [ ] | |
| Linux    | Chrome  | First save | [ ] | [ ] | [ ] | [ ] | |
| Linux    | Firefox | First save | [ ] | [ ] | [ ] | [ ] | |
| Linux    | Edge    | First save | [ ] | [ ] | [ ] | [ ] | |
| Linux    | Opera   | First save | [ ] | [ ] | [ ] | [ ] | |
| Linux    | Brave   | First save | [ ] | [ ] | [ ] | [ ] | |

## Scenarios to Test

| # | Scenario | Description |
|---|----------|-------------|
| 1 | First save | Clean profile, no existing saved credentials for test domain/page. |
| 2 | Manager disabled | Password manager/credential saving disabled in browser settings. |
| 3 | Never-save list | Site/domain added to "Never save passwords" list. |
| 4 | Private window | Test in incognito/private browsing mode. |
| 5 | Signed-out profile | Browser profile signed out / no sync enabled. |
| 6 | Second save with same label | Save again with identical username/label. |
| 7 | Second save with different label | Save with different username/label. |
| 8 | Revisit autofill check | Revisit page and verify if autofill suggests credentials. |
| 9 | Installed PWA | Test from installed PWA if applicable. |
| 10 | In-app browser | Test from in-app browser (e.g., Facebook/Twitter/Instagram webviews). |
| 11 | Enterprise policy | Test with enterprise-managed profile/policies if available. |

*For each scenario, repeat the variant tests and record results using the checkboxes above.*
