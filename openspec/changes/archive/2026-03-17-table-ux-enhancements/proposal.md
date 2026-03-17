## Why

The editor table needs several usability improvements: edited cells lack visual distinction from unedited ones, users can't edit English source text directly, the English source column scrolls out of view making cross-referencing difficult, and the download button only appears after translation — users need a way to export at any time.

## What Changes

- **Edited cell highlighting**: Cells that have been manually edited (via the edit modal) SHALL be visually distinguished with a different background color so users can quickly identify manual changes vs. AI translations.
- **Freeze English source column**: In addition to the existing frozen Key column (1st column), the English source text column (2nd column) SHALL also be frozen/sticky so it remains visible during horizontal scrolling.
- **Export language file button**: A persistent "匯出語言檔" (Export Language File) button SHALL be added to the page, available at all times in the editor phase (not only after translation).
- **Editable English source text**: English source cells SHALL be clickable with the same interaction flow as translated cells: click → confirmation dialog → edit modal. The edit modal SHALL show "英文原文（目前）" as the source text label instead of the standard source reference.

## Capabilities

### New Capabilities
- `edited-cell-highlight`: Visual highlighting of manually edited cells with a distinct background color
- `freeze-source-column`: Sticky positioning for the English source (2nd) column in addition to the Key column
- `export-language-file`: Persistent export/download button available throughout the editor phase
- `edit-source-text`: Allow editing English source text cells via the same click-confirm-edit flow

### Modified Capabilities
- `cell-interaction`: Extending click behavior to include English source (en) column cells, which currently are explicitly excluded from click actions

## Impact

- **Code**: `index.html` — CSS for sticky columns and edited-cell styling, JS for cell click handler (remove en-column exclusion), edit modal (source text label variant), state tracking for edited cells, new export button wiring
- **State**: Need to track which cells have been manually edited (e.g., `state.editedCells` set)
- **Existing behavior**: The current "Download language.json" button (post-translation only) remains; the new export button is an always-available alternative
