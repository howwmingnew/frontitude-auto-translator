## Context

The app is a single `index.html` static web app. The editor table currently freezes only the Key column (1st column) via `position: sticky; left: 0`. Cell clicks are handled for translated language columns but explicitly skip the `en` (source) and Key columns. A "Download language.json" button appears only after translation completes. There is no tracking of which cells have been manually edited.

## Goals / Non-Goals

**Goals:**
- Visually distinguish manually edited cells from AI-translated or original cells
- Keep both Key and English source columns visible during horizontal scroll
- Provide an always-available export button in the editor phase
- Allow editing English source text via the existing click-confirm-edit flow

**Non-Goals:**
- Changing the existing "Download language.json" post-translation button behavior
- Undo/redo for cell edits
- Tracking edit history beyond visual highlighting

## Decisions

### 1. Edited cell tracking via `state.editedCells` Set

Store edited cell identifiers as `"key::lang"` strings in an immutable Set on state. When a cell is saved via the edit modal, add its identifier. The `renderPreviewTable` function checks membership to apply a CSS class.

**Rationale**: A Set provides O(1) lookup during render. Using `"key::lang"` as a composite key is simple and collision-free since `::` doesn't appear in translation keys or language codes.

**Alternative considered**: Store a boolean flag per cell in `state.jsonData` — rejected because it mixes data with UI state and complicates export.

### 2. Sticky 2nd column via `nth-child(2)` CSS

Apply `position: sticky` with a calculated `left` offset (matching 1st column width) to `th:nth-child(2)` and `td:nth-child(2)`. The Key column has a fixed `max-width: 260px`, so the 2nd column's `left` offset uses this value.

**Rationale**: Pure CSS solution, no JS measurement needed. The Key column already has `max-width: 260px`.

**Alternative considered**: JS-measured dynamic offset — rejected as over-engineering for a fixed-width column.

### 3. New export button as a separate always-visible element

Add an "匯出語言檔" button in the editor toolbar area (near the Translate button). It uses the same download logic as the existing post-translation download button. The existing download button remains unchanged.

**Rationale**: Having two export paths (one contextual post-translation, one always available) gives flexibility without removing familiar UX.

### 4. English source editing reuses existing edit modal with label variant

When clicking an `en` column cell, the same confirmation → edit modal flow is used. The edit modal detects `lang === 'en'` and changes the source text label to "英文原文（目前）" and hides the source reference block (since the user is editing the source itself).

**Rationale**: Maximum code reuse. The only difference is the label text and hiding the self-referential source block.

## Risks / Trade-offs

- **[Risk] Sticky 2nd column z-index conflicts** → Mitigation: Use z-index layering: header row (z-index 2), 1st column (z-index 1), 2nd column (z-index 1), header+1st-col intersection (z-index 3), header+2nd-col intersection (z-index 3).
- **[Risk] Editing English source affects all translations referencing it** → Mitigation: This is intentional behavior. The confirmation dialog serves as a safety gate. Translations are not automatically re-triggered.
- **[Risk] `editedCells` grows unbounded for large files** → Mitigation: Acceptable — even with 10K manual edits, a Set of short strings is negligible in memory.
