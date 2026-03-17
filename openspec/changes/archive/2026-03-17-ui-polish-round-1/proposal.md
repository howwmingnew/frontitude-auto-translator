## Why

Three UX issues emerged from the interactive-table-cell-translation release: (1) the "Test Key" button text gets truncated inside the 400px sidebar drawer because `.provider-row` is a single flex row with too many items, (2) the context prompt textarea starts empty, requiring users to type a value every session even though the primary use case is dental-implant software translation, and (3) the edit modal for translated cells only shows the key name and language code but not the English source text, making it hard to judge whether a translation is correct.

## What Changes

- **Test Key button layout fix**: Move the Test Key button out of the `.provider-row` flex row into its own row (`.api-key-row` area) so it has enough space and is never truncated.
- **Context prompt default value**: Set a default value of "齒科植牙軟體介面多國語系翻譯" when the textarea is empty and no saved value exists in localStorage. Once the user modifies it, persist their value via the existing localStorage mechanism.
- **Edit modal enhancement**: Display the English source text in the edit modal below the key/language metadata, so users can compare their translation against the original. Improve modal UI/UX with better spacing, a read-only source text display, and clearer visual hierarchy.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `cell-interaction`: Edit modal now displays the English source text alongside key and language code
- `test-api-key`: Button layout changes from inline `.provider-row` to its own row to prevent text truncation

## Impact

- `index.html`: CSS layout changes for `.provider-row` / test button area, HTML restructure for button placement, JS changes for default context prompt value and passing source text to edit modal
- No API changes, no new dependencies
