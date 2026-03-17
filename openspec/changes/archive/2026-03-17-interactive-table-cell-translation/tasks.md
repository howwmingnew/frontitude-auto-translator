## 1. CSS: Untranslated Cell Highlight & Modal Styles

- [x] 1.1 Add red border style to `.empty-cell` for non-source columns (`.editor-table td.empty-cell:not(.col-source) { border: 2px solid var(--error); }`)
- [x] 1.2 Add CSS for edit modal overlay (`.cell-edit-overlay`) — centered overlay with backdrop, textarea, Save/Cancel buttons
- [x] 1.3 Add CSS for cell loading state (`.cell-loading`) — a subtle animation or dimmed state while single-cell translation is in progress
- [x] 1.4 Add cursor pointer style to clickable cells (non-key, non-source columns)

## 2. HTML: Edit Modal & Test API Key Button

- [x] 2.1 Add edit modal HTML structure to the page body — overlay div with textarea, key/lang display, Save and Cancel buttons
- [x] 2.2 Add "Test API Key" button (`#test-api-key-btn`) in the `.provider-row` or `.api-key-row` area, next to the API key input

## 3. JS: Cell Click Event Delegation

- [x] 3.1 Add click event listener on `#editor-table` `<tbody>` using event delegation
- [x] 3.2 Identify clicked cell's language and key from the row/column position
- [x] 3.3 Ignore clicks on Key column (index 0) and source language (en) column
- [x] 3.4 Guard against text selection — only act on clean clicks (check `window.getSelection()`)

## 4. JS: Click-to-Edit Translated Cells

- [x] 4.1 When a translated cell is clicked, show `confirm()` dialog asking if user wants to modify
- [x] 4.2 If confirmed, open the edit modal pre-filled with the current value, showing the key name and target language
- [x] 4.3 On Save: update `state.jsonData` immutably (deep clone the language object, set the new value, call `setState()`) and re-render table
- [x] 4.4 On Cancel/close: dismiss modal without changes

## 5. JS: Click-to-Translate Untranslated Cells

- [x] 5.1 When an untranslated cell is clicked, validate that API key exists — if not, show error toast
- [x] 5.2 Show loading indicator on the cell (add `.cell-loading` class, update cell text to "...")
- [x] 5.3 Call `callTranslateAPI([sourceText], targetLang)` for the single key's English source text
- [x] 5.4 On success: update `state.jsonData` immutably with the translated value, re-render table, show success toast
- [x] 5.5 On failure: remove loading state, show error toast with error message

## 6. JS: Test API Key Button

- [x] 6.1 Cache the `#test-api-key-btn` DOM reference in the `dom` object
- [x] 6.2 Add `input` event listener on `#api-key` to enable/disable the test button based on key field emptiness
- [x] 6.3 On click: show loading state on button, call `callTranslateAPI(["hello"], "de")` as a minimal test
- [x] 6.4 On success: show success toast ("API key is valid!"), restore button state
- [x] 6.5 On failure: show error toast with error details, restore button state

## 7. i18n: Add Translation Strings

- [x] 7.1 Add new i18n keys for all three UI languages (en, zh-TW, ko): `cellEditConfirm`, `cellEditTitle`, `cellEditSave`, `cellEditCancel`, `testApiKey`, `testApiKeySuccess`, `testApiKeyNoKey`, `cellTranslating`, `cellTranslateSuccess`, `cellTranslateError`

## 8. Verification

- [x] 8.1 Open `index.html` in browser, upload a language.json, verify untranslated cells have red borders
- [x] 8.2 Click a translated cell → confirm dialog appears → modal opens → edit and save → table updates
- [x] 8.3 Click an untranslated cell without API key → error toast shown
- [x] 8.4 Click an untranslated cell with valid API key → cell shows loading → translated value appears
- [x] 8.5 Test API Key button disabled when key empty, enabled when key entered, shows success/error toast on click
- [x] 8.6 Verify dark mode styling for all new elements
