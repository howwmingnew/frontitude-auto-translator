---
phase: 04-context-ux
verified: 2026-03-21T09:00:00Z
status: human_needed
score: 9/9 must-haves verified
human_verification:
  - test: "Mode toggle renders and Quick/Precise switch works in browser"
    expected: "Two pill buttons above Translate button; Quick active by default; clicking Precise activates it and stores 'precise' in localStorage; refreshing restores Precise; Precise button is disabled with tooltip when Bitbucket is not connected"
    why_human: "Visual render, localStorage persistence across page reload, and disabled-state tooltip require browser interaction"
  - test: "DeepL warning banner reactivity"
    expected: "Yellow banner appears in provider section immediately when mode is Precise AND provider is DeepL; banner disappears instantly when switching to Quick mode or to OpenAI/Gemini"
    why_human: "Real-time DOM reactivity to two independent state changes requires manual interaction"
  - test: "Context panel accordion in editor table"
    expected: "Clicking any key in the first column expands an accordion row below it; clicking another key closes the previous and opens the new one; clicking the same key collapses it; panel shows 'No code context found' when no cache entry exists; after Precise translation, panel shows code snippet, file path, and AI description"
    why_human: "Accordion show/hide, single-open constraint, and context display require an uploaded JSON file and interaction"
  - test: "Panel inline translation save"
    expected: "Editing a translation in the panel input field enables the Save button; clicking Save updates the table cell in place (no full re-render) and shows a success toast; the panel remains open after save"
    why_human: "DOM mutation verification and panel persistence after save require visual inspection"
  - test: "Precise mode progress stepper during translation"
    expected: "With Bitbucket connected and OpenAI/Gemini selected, initiating Precise translation shows the three-step stepper (Search Context / Generate Descriptions / Translate) with steps advancing from filled circle to checkmark as phases complete; stepper is hidden entirely in Quick mode"
    why_human: "Multi-step async UI state requires a live Bitbucket connection and API key to fully exercise; stepper timing depends on actual API calls"
  - test: "Per-key error handling and retry"
    expected: "When a batch API call fails, affected cells turn red with an X prefix and the error message as tooltip; other languages and keys continue translating; retry button appears showing failure count; clicking retry re-translates only the failed cells and clears error state on success"
    why_human: "Requires inducing an API error (e.g., invalid key mid-translation) to verify per-key isolation and retry flow"
---

# Phase 4: Context UX Verification Report

**Phase Goal:** Users have a complete, polished interface for context-aware translation with clear mode selection, visual context display, and graceful error handling
**Verified:** 2026-03-21T09:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Two pill-style mode buttons (Quick/Precise) appear above the Translate button | ✓ VERIFIED | `index.html` lines 163-173 contain `id="mode-toggle"` with `id="mode-quick"` and `id="mode-precise"` inside `action-section`; CSS `.mode-toggle`, `.mode-btn`, `.mode-btn--active` exist at `css/styles.css` lines 1491-1524 |
| 2 | Quick mode is selected by default; Precise is disabled when Bitbucket is not connected | ✓ VERIFIED | `js/ui.js` `initModeToggle()` (line 653) reads localStorage, defaults to `'quick'`, sets `modePrecise.disabled = true` when `!bitbucketConnected`; `setTranslateMode()` guards against selecting Precise without Bitbucket |
| 3 | Selected mode persists to localStorage as `translate_mode` and restores on page load | ✓ VERIFIED | `setTranslateMode()` calls `localStorage.setItem('translate_mode', mode)`; `initModeToggle()` reads `localStorage.getItem('translate_mode')` on init; `App.initModeToggle()` called in `app.js` line 39 |
| 4 | When Precise mode is active AND provider is DeepL, a yellow warning banner appears in the provider section | ✓ VERIFIED | `updateDeeplWarning()` in `js/ui.js` line 675 checks `translateMode === 'precise' && provider === 'deepl'` and toggles `deeplWarning.style.display`; `index.html` line 140 contains the warning `div` with `style="display:none"` inside `provider-collapsible-body` |
| 5 | Warning disappears when mode changes to Quick OR provider changes away from DeepL | ✓ VERIFIED | `setTranslateMode()` calls `updateDeeplWarning()`; `app.js` line 85 calls `App.updateDeeplWarning()` inside the `providerSelect` change handler |
| 6 | Clicking a key cell in the first column expands an accordion panel below that row | ✓ VERIFIED | `js/cell-edit.js` lines 216-221 route `colIndex === 0` clicks to `App.toggleContextPanel(tr, key)`; `js/ui.js` `expandContextPanel()` (line 862) inserts a `tr.context-panel-row` after the key row |
| 7 | Only one accordion panel is open at a time; opening another closes the previous | ✓ VERIFIED | `toggleContextPanel()` calls `collapseCurrentPanel()` first before expanding; `collapseCurrentPanel()` queries for `.context-panel-row` and removes it, setting `expandedPanelKey: null` |
| 8 | During Precise mode translation, a three-step stepper shows Search/Generate/Translate phases | ✓ VERIFIED | `js/translation.js` calls `App.showStepper()` + `App.updateStepper('search')` (lines 134-135), `App.updateStepper('generate')` (line 159), `App.updateStepper('translate')` (line 169); stepper step functions in `js/ui.js` lines 691-738 update CSS classes and indicator characters |
| 9 | Failed cells display error styling; retry button shows failure count and retries only failed keys | ✓ VERIFIED | `markFailedCells()` adds `cell-error` class and tooltip (lines 740-764); `showRetryButton(count)` displays retry section (lines 766-769); `retryFailedKeys()` groups by language and re-translates only failed keys (lines 293-369); `app.js` line 215 wires `retryBtn` click to `App.retryFailedKeys()` |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `js/state.js` | translateMode, expandedPanelKey, failedKeys, currentStep fields | ✓ VERIFIED | Lines 30-33: all four fields present with correct defaults |
| `index.html` | mode-toggle div, deepl-context-warning, progress-stepper, retry-section | ✓ VERIFIED | Lines 140, 163, 185, 210: all four elements with correct IDs and `style="display:none"` where applicable |
| `js/dom.js` | 8 new DOM refs for phase 4 elements | ✓ VERIFIED | Lines 84-91: modeToggle, modeQuick, modePrecise, deeplWarning, progressStepper, retrySection, retryCount, retryBtn |
| `js/i18n.js` | 11 i18n keys in en, zh-TW, ko blocks | ✓ VERIFIED | modeQuick, deeplContextWarning, stepSearch, contextPanelEmpty, retryFailed, cellFailed confirmed in all three language blocks |
| `css/styles.css` | Mode toggle, warning, stepper, context panel, cell-error, retry CSS | ✓ VERIFIED | `.mode-toggle` (1491), `.mode-btn` (1496), `.deepl-context-warning` (1526), `.progress-stepper` (1542), `.stepper-step` (1550), `.context-panel` (1606), `.cell-error` (1774), `.retry-section` (1788), `.btn-retry` (1799) |
| `js/ui.js` | initModeToggle, setTranslateMode, updateDeeplWarning, updatePreciseButtonState, showStepper, updateStepper, completeStepper, markFailedCells, showRetryButton, buildPanelHTML, expandContextPanel, toggleContextPanel | ✓ VERIFIED | All functions present and exported via `App.*` at lines 775-787, 1180-1182 |
| `js/cell-edit.js` | Key column click routed to accordion; context-panel-row guard | ✓ VERIFIED | Lines 201 (panel-row guard) and 216-221 (colIndex 0 routing); old `colIndex <= 0` guard removed |
| `js/translation.js` | Stepper integration, per-batch error collection, retryFailedKeys | ✓ VERIFIED | `isPrecise` check at line 61; stepper calls at 134-135, 159, 169; per-batch try/catch at 208-226; `retryFailedKeys` at line 293; `App.retryFailedKeys` exported at 375 |
| `js/app.js` | initModeToggle call, mode button event listeners, provider change handler, retry button listener | ✓ VERIFIED | Lines 39 (initModeToggle), 49-50 (click events), 85 (updateDeeplWarning on provider change), 215 (retryBtn click) |
| `js/bitbucket.js` | updatePreciseButtonState calls on connect/disconnect | ✓ VERIFIED | Lines 127, 133: guarded calls `if (App.updatePreciseButtonState) App.updatePreciseButtonState()` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `js/ui.js` | `js/state.js` | `App.setState({ translateMode: mode })` | ✓ WIRED | `setTranslateMode()` line 668 |
| `js/ui.js` | `index.html` | `App.dom.deeplWarning.style.display` toggle | ✓ WIRED | `updateDeeplWarning()` line 678 |
| `js/app.js` | `js/ui.js` | `App.initModeToggle()` call in `init()` | ✓ WIRED | `app.js` line 39 |
| `js/app.js` | `js/ui.js` | `App.setTranslateMode('quick'/'precise')` on click | ✓ WIRED | `app.js` lines 49-50 |
| `js/app.js` | `js/ui.js` | `App.updateDeeplWarning()` on provider change | ✓ WIRED | `app.js` line 85 |
| `js/cell-edit.js` | `js/ui.js` | `App.toggleContextPanel(tr, key)` on colIndex 0 | ✓ WIRED | `cell-edit.js` line 220 |
| `js/ui.js` | `js/state.js` | `App.setState({ expandedPanelKey: key })` | ✓ WIRED | `expandContextPanel()` line 906; `collapseCurrentPanel()` line 924 |
| `js/ui.js` | `js/search.js` | `App.getContextCache().get(key)` for panel data | ✓ WIRED | `buildPanelHTML()` uses `App.getContextCache()`; `getContextCache` exported from `search.js` line 245 |
| `js/translation.js` | `js/ui.js` | `App.updateStepper(step)` at phase transitions | ✓ WIRED | `translation.js` lines 135, 159, 169 |
| `js/translation.js` | `js/state.js` | `App.setState({ failedKeys: failedKeys })` | ✓ WIRED | `translation.js` line 263 |
| `js/app.js` | `js/translation.js` | `App.retryFailedKeys()` on retryBtn click | ✓ WIRED | `app.js` line 215 |
| `js/bitbucket.js` | `js/ui.js` | `App.updatePreciseButtonState()` on connect/disconnect | ✓ WIRED | `bitbucket.js` lines 127, 133 (guarded) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| UEXP-01 | 04-01 | Users can switch between Quick (no context) and Precise (context-enhanced) translation modes | ✓ SATISFIED | Mode toggle UI in `index.html`; `initModeToggle`, `setTranslateMode` in `js/ui.js`; localStorage persistence; Precise disabled without Bitbucket |
| UEXP-02 | 04-02 | Clicking a key row expands a context panel showing code snippet, AI description, and inline translation editing | ✓ SATISFIED | `toggleContextPanel`, `buildPanelHTML`, `expandContextPanel` in `js/ui.js`; key column routing in `js/cell-edit.js`; panel save handler updates state immutably |
| UEXP-03 | 04-01 | Precise mode + DeepL shows an incompatibility warning directing users to OpenAI/Gemini | ✓ SATISFIED | `updateDeeplWarning()` in `js/ui.js`; warning banner in `index.html`; reactive to both mode and provider changes |
| UEXP-04 | 04-03 | Context search process shows progress indicator distinguishing search/generate/translate phases | ✓ SATISFIED | `showStepper`, `updateStepper`, `completeStepper`, `hideStepper` in `js/ui.js`; stepper HTML in `index.html`; integration in `js/translation.js` phases A/B/C |
| UEXP-05 | 04-03 | Single-key API failure does not abort entire batch; individual error states shown; retry available | ✓ SATISFIED | Per-batch try/catch in `translation.js` lines 208-226 collects errors without throwing; `markFailedCells` adds `cell-error` class; `retryFailedKeys` retries only failed keys |

All 5 requirements (UEXP-01 through UEXP-05) are claimed by the plans and have implementation evidence. No orphaned requirements found for Phase 4 in REQUIREMENTS.md.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `js/translation.js` | 133-136 | Redundant `if (isPrecise)` guard inside outer `if (isPrecise && ...)` block (same for Phase B at 158-160) | ℹ️ Info | No functional impact; stepper is safely hidden when guard condition is false; dead code only reachable if outer condition is true |
| `js/translation.js` | 168-169 | `App.updateStepper('translate')` called unconditionally when `isPrecise`, but `App.showStepper()` is only called inside the `isPrecise && bitbucketConnected && provider !== 'deepl'` guard | ⚠️ Warning | If Precise+DeepL combination reaches translation (despite warning banner), stepper DOM is manipulated while hidden — no visual breakage but logically inconsistent; mitigated by DeepL warning and Precise requiring Bitbucket connection |

### Human Verification Required

Automated checks verify existence, substance, and wiring of all phase 4 artifacts. The following require browser interaction to confirm goal achievement:

#### 1. Mode Toggle Visual and Persistence

**Test:** Open http://localhost:8080. Without connecting Bitbucket, verify the Quick/Precise pill buttons appear above the Translate button. Confirm Quick is active by default and Precise is grayed out with a tooltip. Connect Bitbucket, then click Precise to activate it. Refresh the page.
**Expected:** Precise remains selected after refresh; localStorage key `translate_mode` is set to `'precise'`
**Why human:** Visual pill button appearance, disabled state tooltip text, and localStorage persistence across page reload cannot be verified programmatically

#### 2. DeepL Warning Banner Reactivity

**Test:** With Bitbucket connected, select Precise mode. Switch the provider dropdown to DeepL.
**Expected:** Yellow warning banner appears immediately below the provider section. Switch to OpenAI — banner disappears. Switch back to DeepL — banner reappears. Switch mode to Quick — banner disappears even with DeepL selected.
**Why human:** Real-time DOM visibility changes in response to two independent state changes require manual interaction

#### 3. Context Panel Accordion Behavior

**Test:** Upload a language.json file. Click any key text in the first column of the editor table.
**Expected:** An accordion panel expands below that row showing "No code context found for this key." plus translation input fields for each language. Click a different key — previous panel closes, new one opens. Click the same key — panel collapses.
**Why human:** Accordion DOM insertion and single-open constraint require visual inspection with an uploaded file

#### 4. Context Panel Inline Save

**Test:** With the context panel open, edit a translation value in one of the language input fields.
**Expected:** Save button becomes enabled. Clicking Save updates the corresponding table cell directly without the panel closing, and a success toast appears.
**Why human:** DOM mutation of a specific table cell while preserving open panel state requires visual inspection

#### 5. Precise Mode Progress Stepper

**Test:** With Bitbucket connected and OpenAI or Gemini selected, upload a file, select Precise mode, pick at least one target language, and click Translate.
**Expected:** Stepper appears showing three steps. "Search Context" step activates with filled circle. After context search, "Generate Descriptions" activates. After generation, "Translate" activates. After completion, all steps show checkmarks, then stepper hides after 2 seconds.
**Why human:** Multi-phase async UI transitions require live API calls and timing observation

#### 6. Per-Key Error States and Retry

**Test:** Induce a translation API failure mid-batch (e.g., use an invalid API key that returns an error). Observe the result.
**Expected:** Other keys/languages that were not in the failed batch complete successfully. Failed cells display red background with "Failed" text and an error tooltip. A "Retry Failed" button appears with the count of failed keys. Clicking Retry re-translates only the failed cells.
**Why human:** Requires engineering an API error condition during translation; error cell visual appearance and retry isolation require browser verification

### Gaps Summary

No automated gaps found. All 9 observable truths are verified at all three levels (exists, substantive, wired). All 5 UEXP requirements have implementation evidence. The two anti-patterns noted are informational/warning severity and do not block goal achievement.

The 6 human verification items are standard for a UI-heavy phase: visual appearance, real-time reactivity, async flows, and error injection all require browser interaction to confirm the user-facing goal is fully achieved.

---

_Verified: 2026-03-21T09:00:00Z_
_Verifier: Claude (gsd-verifier)_
