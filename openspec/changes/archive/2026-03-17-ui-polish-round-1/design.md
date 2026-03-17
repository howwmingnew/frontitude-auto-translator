## Context

The interactive-table-cell-translation feature was just shipped. Three UX issues need fixing: (1) the Test Key button text is truncated in the 400px sidebar drawer because it shares a single `.provider-row` flex line with the provider select, API key input, and badge, (2) the context prompt textarea starts empty every fresh session despite the primary use case being "齒科植牙軟體介面多國語系翻譯", and (3) the edit modal only shows key name + language code, lacking the English source text needed to evaluate translation quality.

## Goals / Non-Goals

**Goals:**
- Fix Test Key button truncation by giving it its own row
- Provide a sensible default context prompt that persists via localStorage
- Enhance the edit modal to show English source text with improved visual hierarchy

**Non-Goals:**
- Redesigning the entire sidebar layout
- Adding undo/redo to the edit modal
- Changing the context prompt per-language (single global prompt is sufficient)

## Decisions

### 1. Move Test Key button to a dedicated row below the API key input
**Decision**: Create a new `.api-key-actions` row below `.provider-row` containing the Test Key button (and optionally the key badge). This gives the button full width to display its text.
**Rationale**: The current `.provider-row` has 4 flex children (select + input + badge + button) in 400px — not enough space. Moving the button to its own row is the simplest fix.
**Alternative**: Shrink the button font or use an icon-only button — but this hurts discoverability.

### 2. Default context prompt value via placeholder-like pattern
**Decision**: On init, if `localStorage.getItem('translate_context_prompt')` returns `null` (never set), populate the textarea with the default value "齒科植牙軟體介面多國語系翻譯" and set `state.contextPrompt` accordingly. Once the user edits, their value is persisted normally. The default is NOT a placeholder — it's an actual value so it gets sent to the API.
**Rationale**: Using a real value (not just placeholder text) ensures the context is actually used in translation without requiring user action. The existing localStorage persistence already handles user modifications.
**Alternative**: Use placeholder attribute — but placeholders don't get sent as actual values.

### 3. Show English source text in edit modal
**Decision**: Add a read-only block in the edit modal between the meta line and the textarea, displaying the English source text for the key being edited. Style it as a quote/reference block (light background, smaller font) to visually distinguish it from the editable textarea.
**Rationale**: Users need to see the original English text to judge translation quality. A read-only reference block creates clear visual hierarchy: metadata → source reference → editable translation.

## Risks / Trade-offs

- **Default context prompt may not suit all users**: The default "齒科植牙軟體介面多國語系翻譯" is domain-specific.
  → Acceptable: users can immediately edit it, and the value persists. The app is purpose-built for this use case.
- **Edit modal gets taller with source text**: Adding the source reference block increases modal height.
  → The modal already has constrained max-width (480px) and the textarea is resizable. The extra ~40px for the source block is minimal.
