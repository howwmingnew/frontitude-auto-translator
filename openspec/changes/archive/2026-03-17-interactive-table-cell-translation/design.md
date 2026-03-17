## Context

The Frontitude One-Click Translator is a single-file static web app (`index.html`) that displays uploaded `language.json` data in a read-only Excel-like table. Currently, translation is batch-only (all selected languages at once). Users cannot interact with individual cells, cannot visually distinguish untranslated strings, and have no way to verify their API key before committing to a full translation run.

The app uses an immutable state pattern via `setState(patch)`, vanilla JS (ES5 + async/await), and stores API keys in localStorage per-provider.

## Goals / Non-Goals

**Goals:**
- Provide visual distinction (red border) for untranslated/empty cells in the editor table
- Enable click-to-edit on translated cells via confirmation dialog + modal textbox
- Enable click-to-translate on untranslated cells (single-cell AI translation)
- Add a "Test API Key" button that validates the configured key with a lightweight request
- Maintain immutable state updates throughout

**Non-Goals:**
- Inline editing (contenteditable) — we use a separate modal dialog for clarity
- Bulk row editing or multi-select cell editing
- Undo/redo history for cell edits
- Changing the batch translation flow

## Decisions

### 1. Red border for untranslated cells
**Decision**: Add a CSS class `cell-untranslated` with `border: 2px solid var(--error)` to empty cells in `renderEditorTable()`.
**Rationale**: Pure CSS approach, zero JS overhead. The existing `empty-cell` class already marks these cells; we add the red border styling to it.
**Alternative**: Add a separate class — but `empty-cell` already identifies exactly these cells, so extending its styles is simpler.

### 2. Modal dialog for cell editing (not inline contenteditable)
**Decision**: Use a custom modal overlay with a `<textarea>` for editing translated values, triggered by cell click after confirmation.
**Rationale**: A modal provides a clear editing context, avoids complex inline editing state management, and matches the app's existing UI pattern of simple overlays (sidebar drawer). Using `confirm()` for the "already translated" check keeps it simple.
**Alternative**: Inline `contenteditable` — more complex to manage focus, validation, and escape/save behavior in a static single-file app.

### 3. Single-cell translation reuses existing API functions
**Decision**: When an untranslated cell is clicked, call `callTranslateAPI([text], targetLang)` with just the single source text. Reuse the existing `callDeepL`/`callOpenAI`/`callGemini` functions.
**Rationale**: The existing API functions already handle batches — a batch of 1 is trivially supported. No new API code needed.
**Alternative**: Create a dedicated single-translation function — unnecessary duplication.

### 4. Test API Key sends a minimal translation request
**Decision**: The "Test API Key" button sends a single-word translation request (`["hello"]` → target `de`) to validate the key. On success, show a success toast; on error, show the error in a toast.
**Rationale**: All three providers (DeepL, OpenAI, Gemini) don't have a dedicated "validate key" endpoint. A minimal translation is the simplest universal approach.
**Alternative**: Provider-specific validation endpoints (DeepL has `/v2/usage`) — more complex to maintain per-provider and OpenAI/Gemini don't offer equivalent endpoints.

### 5. Click event delegation on table body
**Decision**: Use a single event listener on `<tbody>` with event delegation rather than attaching listeners to each `<td>`.
**Rationale**: The table re-renders on search filter changes and after translation. Event delegation avoids re-attaching listeners and is more performant.

### 6. Edit modal updates state immutably
**Decision**: When saving an edit, deep-clone the relevant language object and update the key, then call `setState()` and re-render the table.
**Rationale**: Matches the app's existing immutable state pattern. The modal only modifies a copy.

## Risks / Trade-offs

- **Single-cell translation latency**: Each cell click triggers an API call. Users may click multiple cells rapidly.
  → Mitigation: Show a loading indicator on the cell being translated; disable further clicks on that cell until complete.

- **Confirm dialog UX**: Using native `confirm()` is functional but not styled consistently with the app.
  → Acceptable trade-off for a first iteration; can be upgraded to a custom confirmation modal later.

- **Test API Key false positives**: A successful minimal translation doesn't guarantee the key has sufficient quota for a full run.
  → Acceptable — the goal is key validity, not quota checking.
