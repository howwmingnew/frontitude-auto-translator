# Phase 2: Code Search Pipeline - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Bitbucket code search pipeline: search a Bitbucket repo for where each translation key is used in WPF source code (.xaml / .cs), parse LocExtension patterns, aggregate results per key, and cache them in-memory. This phase delivers the search engine and data structures — UI display of results is Phase 4, AI context generation is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Search Triggering
- Two trigger modes: batch (before translation) AND single-key (right-click context menu)
- Batch mode: triggered when user clicks "Translate" in precise mode, searches all untranslated keys before translating
- Single-key mode: right-click a key row in Content Preview table → "查詢情境" context menu option
- Both modes use the same underlying search function, just different input (all keys vs one key)
- Phase 2 builds the pipeline only — integration with translation flow is Phase 3-4

### Progress Display
- Batch search shows a progress bar + counter: "Searching context: 15/42 keys"
- Similar style to existing translation progress display
- Single-key search shows a loading indicator on that key's row

### Results Data Structure
- Per-key result object: `{ key, matches: [{ file, line, snippet }], searchedAt }`
- Each match includes: file path, line number, code snippet (surrounding lines from API response)
- All matches for the same key aggregated into one result object
- Results stored in state as a Map: `contextResults: new Map()` (key → result object)

### Results Display
- Phase 2 does NOT build result display UI — results stored in memory/state only
- Phase 4 builds the expandable panel UI to show results
- Phase 2 outputs: search pipeline functions + data in state, ready for Phase 3-4 consumption

### API Query Strategy
- Query order: search .xaml first (`"key" ext:xaml`), if no results then search .cs (`"key" ext:cs`)
- This saves API quota — most keys will be found in XAML files
- Batching strategy: Claude's discretion (single-key queries or OR-merged based on API limits)
- Concurrency: max 3 parallel API calls to avoid Bitbucket rate limits
- Retry: on rate limit (429), back off and retry; on other errors, skip key and continue batch

### Session Cache
- In-memory cache (Map) for search results within the session
- Same key queried again → return cached result, no API call
- Cache cleared on page reload
- No localStorage persistence for search results (keeps it simple, avoids stale data)

### Untranslated Key Detection
- A key is "untranslated" if: it does not exist in the target language, OR its value is empty string ''
- Retranslate mode: when user selects retranslate for an already-translated language, ALL keys are searched (not just untranslated ones) to provide full context
- Keys with cached results skip the API call regardless of translation status

### Claude's Discretion
- Exact batching strategy (single queries vs OR-merged queries)
- Error handling and retry backoff timing
- How to extract and format code snippets from API response
- LocExtension pattern matching implementation details
- Whether to use file content retrieval API for additional context lines beyond what search returns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Bitbucket API
- `.planning/research/STACK.md` — Bitbucket Cloud REST API v2.0 endpoints, Code Search query syntax, 250-char limit, response shape, file content retrieval endpoint
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, integration points

### Existing Codebase
- `.planning/codebase/CONVENTIONS.md` — Naming conventions, state management patterns, error handling
- `.planning/codebase/ARCHITECTURE.md` — Existing layered architecture, module structure
- `.planning/phases/01-infrastructure/01-CONTEXT.md` — Phase 1 decisions: CORS proxy design, IIFE + window.App namespace, localStorage patterns

### Phase 1 Implementation (must read actual code)
- `js/bitbucket.js` — Existing Bitbucket connection UI, testBitbucketConnection(), state fields
- `js/providers.js` — App.fetchWithTimeout() for API calls with timeout
- `js/state.js` — State management pattern, existing state fields
- `js/translation.js` — Translation flow, batch logic, progress display pattern
- `proxy/src/index.js` — CORS proxy implementation, path whitelist (needs update for search endpoints)

### Research
- `.planning/research/PITFALLS.md` — Known issues: 250-char query limit, OR batch size, rate limits

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `App.fetchWithTimeout(url, options)`: HTTP client with timeout, reuse for all Bitbucket API calls
- `App.showToast(message, type)`: Notification system for search status feedback
- `App.getState() / App.setState(patch)`: Immutable state updates, search results stored here
- `App.dom` object: Cached DOM references, extend with new search-related elements
- Translation progress bar pattern: Reuse for search progress display

### Established Patterns
- IIFE + window.App namespace: New search module follows same pattern as js/bitbucket.js
- localStorage with `translate_` prefix: NOT used for search cache (in-memory only)
- `JSON.parse(JSON.stringify())` for deep clone: Use for immutable state updates of search results
- Batch processing with progress: Translation flow in js/translation.js is the reference pattern

### Integration Points
- `proxy/src/index.js` path whitelist: Must add `/bitbucket/2.0/workspaces/*/search/code` endpoint
- `js/state.js` state object: Add `contextResults: new Map()` field
- `js/app.js` init(): Wire up search module initialization
- Content Preview table (js/ui.js): Add right-click context menu for single-key search
- Translation flow (js/translation.js): Batch search hook point (Phase 3-4 will connect here)

</code_context>

<specifics>
## Specific Ideas

- Search .xaml first, only fall back to .cs if no results — most WPF key usage is in XAML LocExtension markup
- Right-click context menu on key rows for manual single-key search — familiar interaction pattern
- Progress display mirrors existing translation progress — consistent UX
- Pipeline is a pure data layer — no result display UI in this phase, just functions + state

</specifics>

<deferred>
## Deferred Ideas

- Result display UI (expandable panels) — Phase 4
- AI context description generation from code snippets — Phase 3
- Translation prompt injection with context — Phase 3
- Quick vs Precise mode toggle — Phase 4
- localStorage/IndexedDB persistent cache — v2 (CTXE-03)

</deferred>

---

*Phase: 02-code-search-pipeline*
*Context gathered: 2026-03-21*
