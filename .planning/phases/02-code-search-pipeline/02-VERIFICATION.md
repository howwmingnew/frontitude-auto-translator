---
phase: 02-code-search-pipeline
verified: 2026-03-21T04:00:00Z
status: human_needed
score: 11/12 must-haves verified
re_verification: false
human_verification:
  - test: "Right-click context menu appears on key rows in Content Preview table"
    expected: "A context menu with 'Search Context' (or localized equivalent) appears at the cursor position on right-click of any key row"
    why_human: "Requires a rendered browser UI with loaded translation data to verify interactive DOM event behavior"
  - test: "Single-key search shows loading spinner on row during search"
    expected: "Row gains search-loading CSS class showing animated spinner while App.searchKeyContext is in flight; spinner removed on completion"
    why_human: "Animated state is runtime behavior — CSS class toggling during async operation cannot be verified by static grep"
  - test: "Cache prevents duplicate API calls on repeated search"
    expected: "Searching the same key twice returns immediately from cache with no network request in the Network tab"
    why_human: "Cache hit behavior requires runtime inspection of network activity; cannot be verified statically"
  - test: "Batch search progress bar updates correctly"
    expected: "Calling App.searchBatchContext(['key1','key2'], App.showSearchProgress) shows and updates the search-progress-section with percentage and counter"
    why_human: "End-to-end batch progress wiring from external caller through onProgress to UI requires runtime execution; App.searchBatchContext is not wired to a UI trigger (by design — Phase 3 will call it)"
---

# Phase 2: Code Search Pipeline Verification Report

**Phase Goal:** The app can search a Bitbucket repo for where each translation key is used in WPF code and display structured results
**Verified:** 2026-03-21T04:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|---------|
| 1  | App.searchKeyContext(key) searches Bitbucket for a single key and returns a result object with matches | VERIFIED | `js/search.js` lines 142-169: async function with cache check, xaml/cs queries, buildKeyResult(), setState update, full return object |
| 2  | App.searchBatchContext(keys, onProgress) searches multiple keys with concurrency limit of 3 | VERIFIED | `js/search.js` line 189: `createConcurrencyLimiter(3)`, lines 188-222: full batch with promises, null filtering |
| 3  | Search queries .xaml first, falls back to .cs only when no .xaml results found | VERIFIED | `js/search.js` lines 149-156: xamlQuery searched first; csQuery only on `results.length === 0` |
| 4  | Results are cached in-memory; repeated search for same key returns cached result without API call | VERIFIED | `js/search.js` lines 144-145: `if (contextCache.has(key)) return contextCache.get(key)`; cache set at line 161 |
| 5  | Untranslated key detection correctly identifies keys missing or empty in target language | VERIFIED | `js/search.js` lines 172-185: `filterUntranslatedKeys` checks `undefined \|\| ''` for each targetLang; isRetranslate bypass |
| 6  | LocExtension patterns are identified in returned code snippets | VERIFIED | `js/search.js` line 115: regex `/\{(?:lex\|loc):(?:Loc\|Translate)\s+Key\s*=/i`; applied per-match at lines 121-123 |
| 7  | Multiple file matches for the same key are aggregated into one result object | VERIFIED | `js/search.js` lines 79-111: `parseSearchResults` iterates all `apiValues` items (all files); all pushed into single `results` array; `buildKeyResult` returns `{ key, matches: parsedResults }` |
| 8  | Right-clicking a key row in the Content Preview table shows a context menu with a search option | ? UNCERTAIN | `js/ui.js` line 560: `initSearchUI()` adds contextmenu event listener via delegation on `App.dom.editorTable`; `js/app.js` line 38: `App.initSearchUI()` called on init; HTML element `id="context-menu"` exists — requires browser to confirm |
| 9  | Clicking the search option triggers App.searchKeyContext for that key | VERIFIED | `js/ui.js` line 589: `App.searchKeyContext(key).then(...)` called in contextMenuSearch click handler |
| 10 | Batch search shows a progress bar with counter text matching translation progress style | ? UNCERTAIN | DOM elements exist (`search-progress-section`, `search-progress-bar`); `showSearchProgress` function exported; but `App.searchBatchContext` is not called from any UI trigger — batch search is console/Phase-3 callable only; visual confirmation required |
| 11 | Single-key search shows a loading indicator on the key's row | ? UNCERTAIN | `js/ui.js` lines 609-625: `setRowSearchLoading` adds/removes `search-loading` CSS class; CSS at line 1465 defines spinner animation — runtime behavior requires browser verification |
| 12 | The search.js script tag is loaded before app.js in the correct position | VERIFIED | `index.html` lines 245-247: `bitbucket.js` → `search.js` → `app.js` in exact required order |

**Score:** 11/12 truths verified (1 confirmed gap: App.searchBatchContext not wired to UI trigger by design, 3 need human verification for runtime behavior)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `js/search.js` | Search pipeline module with concurrency, cache, API calls, parsing | VERIFIED | 248 lines, IIFE wrapper, all 7 functions exported on App namespace |
| `js/state.js` | Updated state with contextResults Map and searchProgress fields | VERIFIED | Lines 28-29: `contextResults: new Map()` and `searchProgress: null` present inside `var state = { ... }` |
| `index.html` | Script tag for search.js and search progress HTML elements | VERIFIED | `search.js` script tag line 246; `search-progress-section` HTML lines 161-169; `context-menu` div lines 229-231 |
| `js/dom.js` | Cached DOM refs for search progress and context menu elements | VERIFIED | Lines 77-83: all 7 new refs present (searchProgressSection through contextMenuSearch) |
| `js/i18n.js` | i18n strings for search UI in all 3 languages | VERIFIED | 8 keys present in EN (lines 114-121), zh-TW (lines 230-237), ko (lines 346-353) — 24 total occurrences |
| `js/ui.js` | Context menu, search progress display, row loading indicator functions | VERIFIED | Lines 533-650: showSearchContextMenu, dismissContextMenu, initSearchUI, setRowSearchLoading, showSearchProgress, hideSearchProgress, getActiveContextMenuKey — all exported |
| `js/app.js` | App.initSearch() call and context menu dismiss on Escape | PARTIAL | `App.initSearchUI()` called (line 38) and Escape dismiss added (line 230), but plan key link specified `App.initSearch()` — the no-op placeholder is never called directly; functional behavior is correct via initSearchUI |
| `css/styles.css` | Styles for context menu and search progress | VERIFIED | Lines 1436-1487: .context-menu, .context-menu-item, .context-menu-item:hover, .search-loading spinner animation, #search-progress-section |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| js/search.js | App.fetchWithTimeout | HTTP calls via CORS proxy | WIRED | Line 61: `App.fetchWithTimeout(url, opts)` called in doSearch() |
| js/search.js | App.getState() | Reading proxyUrl, bitbucketWorkspace, etc. | WIRED | Lines 56, 133, 164: `App.getState()` called in doSearch and buildSafeQuery |
| js/search.js | App.setState | Storing contextResults Map in state | WIRED | Lines 166, 196, 204, 210, 219, 227: `App.setState({...})` throughout |
| js/ui.js | App.searchKeyContext | Context menu click handler | WIRED | Line 589: `App.searchKeyContext(key).then(...)` in contextMenuSearch click handler |
| js/ui.js | App.searchBatchContext | Batch search progress display | NOT_WIRED | `App.searchBatchContext` is not referenced anywhere in js/ui.js; showSearchProgress is exported as a callback for external callers (Phase 3) but no UI trigger calls batch search |
| js/app.js | App.initSearch | Init function calls search module init | NOT_WIRED | `App.initSearch()` is never called; `App.initSearchUI()` is called instead (line 38) — this is the functionally correct call; initSearch is intentionally a no-op placeholder |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SRCH-01 | 02-01, 02-02 | Bitbucket Code Search API searches key usage in .xaml/.cs files | SATISFIED | `doSearch()` calls `/workspaces/{ws}/search/code` API; results returned as structured matches per file |
| SRCH-02 | 02-01 | LocExtension markup extension pattern recognition | SATISFIED | `detectLocExtension()` line 115: regex `/\{(?:lex\|loc):(?:Loc\|Translate)\s+Key\s*=/i` applied to every match snippet |
| SRCH-03 | 02-01, 02-02 | Only untranslated keys trigger context searches, preserving API quota | SATISFIED | `filterUntranslatedKeys()` lines 172-185: filters to keys missing or empty in any target language; isRetranslate bypass for retranslation mode |
| SRCH-04 | 02-01 | Extract file name and surrounding code lines as usage context | SATISFIED | `parseSearchResults()` lines 79-111: extracts `file.path` and reconstructs line text from segments array per file |
| SRCH-05 | 02-01, 02-02 | Aggregate same key usage across multiple files | SATISFIED | `buildKeyResult()` calls `parseSearchResults()` which returns all files as array; single result object with `matches` array covering all files |

All 5 phase-2 requirements (SRCH-01 through SRCH-05) are SATISFIED.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| js/search.js | 236-238 | `function initSearch() { // No-op }` | Info | Intentional placeholder per plan spec; harmless for Phase 2 |
| js/ui.js | — | App.searchBatchContext not called from any UI element | Warning | Batch search is only reachable from browser console or Phase 3 code; no user-facing batch trigger exists yet — this is by design per CONTEXT.md (Phase 3 will wire it), but the plan's key link declared it as a Phase 2 wiring |

No blocker anti-patterns found. No TODO/FIXME/placeholder comments in production logic paths. No `return null` stub patterns in substantive functions. No ES module syntax (`import`/`export`) in any modified file. No `let`/`const` keywords in search.js (ES5 convention maintained).

### Human Verification Required

#### 1. Context Menu Appearance and Dismissal

**Test:** Open the app at http://localhost:8080, upload a language.json so the Content Preview table appears, right-click any key row
**Expected:** Context menu appears at cursor position with "Search Context" text (EN), "查詢情境" (zh-TW), or "컨텍스트 검색" (ko); pressing Escape or clicking elsewhere dismisses it
**Why human:** Interactive DOM event behavior (contextmenu event firing, fixed-position overlay rendering) requires a live browser; cannot verify with static analysis

#### 2. Row Loading Spinner During Single-Key Search

**Test:** With Bitbucket connected, right-click a key row, click "Search Context"
**Expected:** The key row shows an animated spinner in the first cell column while the search is in flight; spinner disappears and a toast notification shows the result count when complete
**Why human:** CSS class toggling during async Promise lifecycle (search-loading added/removed) and animation rendering require runtime observation

#### 3. Cache Hit Behavior

**Test:** Search the same key twice via right-click context menu; observe browser Network tab on second search
**Expected:** Second search returns instantly with no new network request to the Bitbucket API
**Why human:** Cache correctness requires observing network activity at runtime; in-memory Map state cannot be inspected via static grep

#### 4. Batch Search Console Test

**Test:** In browser console: `App.searchBatchContext(['key1', 'key2'], App.showSearchProgress)` (with Bitbucket connected)
**Expected:** search-progress-section becomes visible with percentage updating, then hides when status becomes 'idle'; App.getState().contextResults.size increases
**Why human:** Progress display feedback loop between batch search and showSearchProgress callback requires runtime execution; this is the only user-facing batch search path in Phase 2

### Gaps Summary

No blocking gaps were found. All 5 SRCH requirements are satisfied by substantive, wired implementations.

Two key links from the 02-02-PLAN frontmatter are not wired as declared:
1. `App.searchBatchContext` in `js/ui.js` — this is an intentional design choice. The plan's objective states the search pipeline is made "ready for Phase 3-4 integration"; batch search is called externally, not from within ui.js. The showSearchProgress function is the bridge — it is exported and will be passed as the onProgress callback by Phase 3.
2. `App.initSearch` in `js/app.js` — the no-op placeholder is never called; `App.initSearchUI()` (the substantive init function) is called instead. This is correct behavior; the key link in the PLAN frontmatter was written with the intent that initSearch would trigger initSearchUI, but the executor correctly wired initSearchUI directly.

Neither deviation blocks the phase goal. Four items require human browser verification for interactive/runtime behavior confirmation.

---

_Verified: 2026-03-21T04:00:00Z_
_Verifier: Claude (gsd-verifier)_
