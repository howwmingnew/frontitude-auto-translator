## 1. Fix Test Key Button Layout

- [x] 1.1 Move the `#test-api-key-btn` button out of `.provider-row` into a new `.api-key-actions` row below the `.provider-row`
- [x] 1.2 Add CSS for `.api-key-actions` row (flex layout, gap, margin-top)
- [x] 1.3 Optionally move the `#key-badge` span into the new row alongside the button for a cleaner layout

## 2. Context Prompt Default Value

- [x] 2.1 In `initContextPrompt()`, when `localStorage.getItem('translate_context_prompt')` returns `null`, set the textarea value and `state.contextPrompt` to "齒科植牙軟體介面多國語系翻譯"
- [x] 2.2 Ensure the existing `input` event listener on `#context-prompt` persists user changes to localStorage (already works — just verify)

## 3. Edit Modal: Show English Source Text

- [x] 3.1 Add a read-only source text element (`#cell-edit-source`) in the modal HTML between the meta line and the textarea
- [x] 3.2 Add CSS for the source text block (light background, smaller font, border-left or quote style, non-editable)
- [x] 3.3 In `openEditModal()`, accept `sourceText` parameter and populate `#cell-edit-source` with the English source text
- [x] 3.4 Update the call site in `handleCellEdit()` to pass `state.jsonData.en[key]` as the source text
- [x] 3.5 Cache `#cell-edit-source` DOM reference in the `dom` object

## 4. i18n: Update Translation Strings

- [x] 4.1 Add i18n key `cellEditSource` ("Source (EN):" / "原文 (EN)：" / "원문 (EN):") for the source text label in all 3 languages

## 5. Verification

- [x] 5.1 Sidebar drawer: Test Key button text is fully visible, not truncated
- [x] 5.2 Fresh session (clear localStorage): context prompt shows "齒科植牙軟體介面多國語系翻譯"
- [x] 5.3 Edit context prompt → reload → saved value persists
- [x] 5.4 Click translated cell → modal shows key, language, English source text, and current translation
- [x] 5.5 Dark mode: all new/changed elements render correctly
