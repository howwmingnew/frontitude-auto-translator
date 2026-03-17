## 1. Edited Cell Highlighting

- [x] 1.1 Add `state.editedCells` (empty Set) to initial state and handle it immutably in `setState`
- [x] 1.2 Add CSS class `.cell-edited` with distinct background color (light amber, e.g. `#fef9c3`)
- [x] 1.3 In the edit modal save handler, add the `"key::lang"` identifier to `state.editedCells` via `setState`
- [x] 1.4 In `renderPreviewTable`, apply `.cell-edited` class to `<td>` elements whose `"key::lang"` is in `state.editedCells`

## 2. Freeze English Source Column

- [x] 2.1 Add CSS for `.editor-table th:nth-child(2)` and `.editor-table td:nth-child(2)` with `position: sticky` and `left: 260px` (matching Key column max-width)
- [x] 2.2 Set z-index for 2nd column cells (z-index 1 for body cells, z-index 3 for header cell)
- [x] 2.3 Add right border (`2px solid var(--border)`) to 2nd column for visual separation
- [x] 2.4 Ensure 2nd column background matches existing col-source styling to avoid transparency during scroll

## 3. Export Language File Button

- [x] 3.1 Add i18n strings for the export button label in all three languages (en: "Export Language File", zh-TW: "匯出語言檔", ko: "언어 파일 내보내기")
- [x] 3.2 Add the export button HTML in the editor phase area (near the Translate button section)
- [x] 3.3 Add CSS styling for the export button (use existing `.btn` class)
- [x] 3.4 Wire up click handler to download `state.jsonData` as `language.json` (reuse existing download logic)
- [x] 3.5 Show/hide the export button based on editor phase visibility (visible after upload, hidden on re-select)

## 4. Edit English Source Text

- [x] 4.1 Remove the guard that skips click handling for `en` column cells (keep Key column guard)
- [x] 4.2 For `en` column cells with non-empty values: show confirmation dialog, then open edit modal on confirm
- [x] 4.3 For empty `en` column cells: open edit modal directly (no confirmation, no AI translation trigger)
- [x] 4.4 In the edit modal, when `lang === 'en'`: display "英文原文（目前）" label and hide the source reference block
- [x] 4.5 Add i18n strings for "英文原文（目前）" label in all three languages

## 5. Modified Cell Interaction Spec

- [x] 5.1 Update cell click handler to route `en` column clicks through the edit-source-text flow (tasks 4.1–4.4)
- [x] 5.2 Verify Key column clicks still produce no action
