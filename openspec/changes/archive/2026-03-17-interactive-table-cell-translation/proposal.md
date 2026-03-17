## Why

The Content Preview table is currently read-only and only supports batch translation of entire languages. Users need the ability to (1) visually identify untranslated strings at a glance, (2) edit individual translated values without re-translating everything, (3) trigger AI translation for a single untranslated cell on-click, and (4) verify their API key works before starting a full translation run.

## What Changes

- **Red border highlight**: Untranslated (empty) cells in the editor table are visually marked with a red border so users can quickly spot missing translations.
- **Click-to-edit translated cells**: Clicking a translated cell shows a confirmation dialog ("This is already translated. Are you sure you want to modify it?"). If confirmed, a modal textbox dialog opens for editing. The edited value is saved back to `state.jsonData` immutably.
- **Click-to-translate untranslated cells**: Clicking an untranslated cell triggers a single-cell AI translation using the currently configured provider and API key. If no API key is set or translation fails, an error message is shown to the user.
- **Test API Key button**: A "Test API Key" button is added near the API key input field. The button is disabled when the key field is empty. Clicking it sends a lightweight test request to the selected provider to verify the key is valid.

## Capabilities

### New Capabilities
- `cell-interaction`: Handles click events on table cells — distinguishes translated vs untranslated, opens edit modal or triggers single-cell translation, validates API key presence before translation.
- `test-api-key`: Adds a "Test API Key" button near the API key input, disabled when empty, sends a minimal test request to verify key validity.

### Modified Capabilities
<!-- No existing spec-level requirement changes -->

## Impact

- **`index.html`**: All changes are within the single file — new CSS for red borders, modal dialog styles; new JS for cell click handlers, edit modal, single-cell translation, and test API key button logic.
- **State**: `state.jsonData` will be updated immutably when individual cells are edited or translated.
- **API calls**: New lightweight API calls for single-cell translation (reuses existing `callTranslateAPI`) and API key validation test requests.
