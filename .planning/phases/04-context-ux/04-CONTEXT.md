# Phase 4: Context UX - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the complete user-facing interface for context-aware translation: Quick/Precise mode toggle, expandable context panel per key row, three-phase progress stepper, DeepL incompatibility notice, per-key error states with batch retry, and inline translation editing in the context panel. This phase connects Phase 1-3 backend capabilities to the user experience.

</domain>

<decisions>
## Implementation Decisions

### Mode Toggle (Quick / Precise)
- Position: two toggle buttons placed directly ABOVE the Translate button on the main page (not in Sidebar Drawer)
- Style: two pill-style buttons side by side, selected state has distinct background color (accent color)
- Icons: ⚡ Quick, 🔍 Precise (or similar icon that conveys search/context)
- Bitbucket not connected: Precise button is disabled with tooltip "請先連接 Bitbucket" (i18n)
- Persistence: save selected mode to localStorage (`translate_mode`), restore on page load
- Default for first-time users: Quick mode

### DeepL Incompatibility Notice (UEXP-03)
- Trigger: when Precise mode is selected AND provider is DeepL
- Display: inline warning banner inside the Provider section area (yellow/amber background)
- Text: "DeepL 不支援情境感知翻譯。請切換到 OpenAI 或 Gemini。" (i18n all 3 languages)
- Behavior: warning appears/disappears dynamically when mode or provider changes
- Does NOT auto-switch mode or provider — user decides

### Context Expandable Panel (UEXP-02)
- Trigger: click on the Key column (first column) of a row expands/collapses the panel. Clicking translation cells still opens cell-edit modal as before.
- Style: accordion — panel inserts as a full-width row beneath the clicked key row
- Only one panel open at a time — opening another closes the previous
- Panel content (top to bottom):
  1. **Code snippet**: first matching file only (e.g., "📄 LoginView.xaml:42" + code text). If multiple matches, show "+N more" link that expands to show remaining.
  2. **AI description**: the generated context description (💡 icon prefix). Shows "No context available" if search found no matches or context generation failed.
  3. **Translation fields**: one row per target language — language label + input field + Save button. Pre-filled with current translation value. Save updates the in-memory jsonData and re-renders the table cell.
- Empty state (no search results): panel shows "此 key 未找到程式碼使用情境" (i18n)
- Panel only shows data from contextCache — does NOT trigger new search/generation on expand. User must run Precise mode translation first to populate context.

### Multi-Phase Progress Stepper (UEXP-04)
- Only visible in Precise mode translation
- Three-step stepper displayed ABOVE the existing progress bar: "① 搜尋情境 → ② 生成說明 → ③ 翻譯" (i18n)
- Current step: highlighted/bold with ● indicator
- Completed steps: ✓ checkmark
- Pending steps: ○ empty circle
- Progress bar shows progress WITHIN the current step (reuses existing progress bar)
- Progress text below bar shows current step description: "搜尋情境中: 15/42 keys" / "生成說明中: 15/42 keys" / "翻譯 ZH-TW (1/3)..."
- Language chips only become active during step ③ (translation)
- Quick mode: stepper hidden, existing progress display unchanged

### Error States & Retry (UEXP-05)
- **Translation failure per-key**: failed cell gets light red background + ✗ icon with "Failed" text. Hover shows error reason in tooltip.
- **Context search/generation failure**: silent — key translates without context (equivalent to Quick mode). No error UI for context-phase failures.
- **Batch retry**: after translation completes, if any keys failed, show "✗ N keys failed · [Retry Failed]" below the progress bar area. Clicking retries only the failed keys.
- **Retry behavior**: retry button triggers translation for failed keys only, using the same mode/provider. Shows progress during retry. On success, failed cell updates to normal. On repeated failure, error state persists.

### Claude's Discretion
- Exact CSS styling (colors, spacing, border radius, shadows) for new UI elements
- Animation/transition details for panel expand/collapse
- How to structure the stepper HTML (flexbox, grid, etc.)
- Exact tooltip implementation (CSS-only vs JS)
- Whether retry button disappears after successful retry or stays with "0 failed"
- How to handle key column click visual feedback (cursor, hover state)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1-3 Implementation (must read actual code)
- `js/ui.js` — Editor table rendering, collapsible sections, progress chips, context menu, toast system
- `js/cell-edit.js` — Cell edit modal lifecycle, click handling on table cells, editModalState tracking
- `js/translation.js` — startTranslation() three-phase pipeline, progress bar updates, batch loop
- `js/providers.js` — callTranslateAPI(texts, lang, contexts) with optional contexts parameter
- `js/search.js` — contextCache Map, getContextCache(), searchBatchContext()
- `js/context.js` — generateBatchContext(), LANG_INSTRUCTIONS for UI language
- `js/constants.js` — PROVIDER_CONFIG, language helpers
- `js/state.js` — getState()/setState() immutable state pattern
- `js/i18n.js` — UI_TRANSLATIONS with en/zh-TW/ko, t() function with {N} placeholders
- `js/dom.js` — Cached DOM references (App.dom)
- `js/app.js` — Init sequence, event wiring, Escape key handler
- `css/styles.css` — Existing patterns: collapsible sections, progress chips, cell-edit modal, toast, badges
- `index.html` — HTML structure: progress section, editor table, sidebar drawer, modal overlays

### Prior Phase Context
- `.planning/phases/01-infrastructure/01-CONTEXT.md` — IIFE + window.App namespace, localStorage patterns, Sidebar Drawer design
- `.planning/phases/02-code-search-pipeline/02-CONTEXT.md` — Search result structure, contextCache design, right-click context menu
- `.planning/phases/03-ai-context-generation/03-CONTEXT.md` — Three-phase pipeline, context description format, DeepL skip behavior, language-aware descriptions

### Requirements
- `.planning/REQUIREMENTS.md` — UEXP-01 through UEXP-05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `initCollapsible(headerEl, bodyEl, storageKey)`: Existing collapsible pattern with max-height animation — can inform panel expand/collapse
- Progress chips (`renderProgressChips`, `updateProgressChip`): 4 states (pending/translating/done/error) — reuse for language status during translation
- `showToast(message, type)`: Toast notifications for retry success/failure feedback
- Cell edit modal (`openEditModal`): Existing modal overlay pattern — context panel uses different approach (inline accordion) but modal CSS is reference
- `App.fetchWithTimeout`: HTTP client for retry API calls
- `App.getContextCache()`: Direct access to context data for panel display

### Established Patterns
- Event delegation on editorTable: Table events survive re-renders. Context panel click handler should use same pattern.
- `classList.add/remove('active')`: Toggle visibility pattern used by overlays and modals
- Simulated progress + real progress: `Math.max(simulatedPct, realPct)` prevents backsliding — reuse for stepper progress
- `JSON.parse(JSON.stringify())`: Deep clone before mutation for state updates
- `sessionStorage` for collapsible state: Context panel open/closed state could use similar approach

### Integration Points
- Cell click handler (cell-edit.js:199-243): Must be modified to distinguish Key column click (expand panel) from translation column click (open edit modal)
- startTranslation() (translation.js): Must emit phase-change events or update stepper state at each pipeline phase transition
- Progress section (index.html): Add stepper HTML above existing progress bar
- Translate button area (index.html): Add mode toggle buttons above Translate button
- Provider section (index.html/ui.js): Add DeepL incompatibility warning element
- Editor table rendering (ui.js): Must insert accordion row after key row when expanded

</code_context>

<specifics>
## Specific Ideas

- Key column click vs translation column click is the critical interaction design — must be intuitive without explanation
- Accordion panel should have a subtle left border accent color to visually connect to the key row
- The stepper should feel like a progress indicator, not a navigation element — users don't click steps
- "Retry Failed" button should use the existing button styling but in a warning/error color
- Context panel's code snippet should use monospace font and a light background (like a code block)
- AI description should be visually distinct from code — use normal font with a 💡 icon prefix

</specifics>

<deferred>
## Deferred Ideas

- Translation edit feedback loop (CTXE-01) — v2 requirement: manual translation edits fed back into subsequent prompts
- Context confidence indicator (CTXE-02) — v2 requirement: show match count/confidence per key
- Offline context cache (CTXE-03) — v2 requirement: IndexedDB persistence for search results
- Context panel inline AI retranslate button — could add "Re-translate with context" for individual keys
- Keyboard navigation for panel expand/collapse — could add arrow key support later

</deferred>

---

*Phase: 04-context-ux*
*Context gathered: 2026-03-21*
