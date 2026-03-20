# Codebase Concerns

**Analysis Date:** 2026-03-20

## Tech Debt

**Single-file monolith size and maintainability:**
- Issue: All application code (HTML, CSS, JavaScript) lives in a single `index.html` file (~3,458 lines, 128 KB)
- Files: `index.html`
- Impact: Difficult to navigate, test, and refactor. Makes version control diffs noisy. Harder to maintain as features grow.
- Fix approach: No immediate action needed for deployed state. Consider extracting CSS to separate file and JavaScript to modules if/when codebase exceeds 5,000 lines or new major features added. For now, remains acceptable for a single-purpose tool.

**Deep clone inefficiency for large JSON files:**
- Issue: Uses `JSON.parse(JSON.stringify(...))` for deep cloning at multiple points (lines 2519, 2769, 2837, 3387) instead of structured clone
- Files: `index.html` (lines 2519, 2769, 2837, 3387)
- Impact: Slower performance on large JSON files (edge case, given 5 MB file limit), and creates garbage on each operation. Not critical for typical use but scales poorly.
- Fix approach: Replace with `structuredClone()` where available (modern browsers), with fallback to current approach for older browsers.

**Batch size hardcoded:**
- Issue: Batch size of 10 texts per API call is hardcoded (line 2773)
- Files: `index.html` (line 2773: `var batchSize = 10`)
- Impact: Cannot be tuned by users or configured per provider. OpenAI and Gemini may handle different batch sizes efficiently.
- Fix approach: Make batch size configurable per provider in `PROVIDER_CONFIG`, or expose as advanced setting in UI.

**CLAUDE.md mentions 50 but code uses 10:**
- Issue: Documentation states "Batch size: 50 texts per API call" but actual code uses 10
- Files: `CLAUDE.md` (line 27) vs `index.html` (line 2773)
- Impact: Documentation is outdated. New developers follow wrong assumptions.
- Fix approach: Update CLAUDE.md to reflect actual batch size of 10, or change code to 50 if that was the original intent.

## Known Bugs

**Gemini API URL parameter leaks key visibility:**
- Issue: Gemini API key is exposed in URL as query parameter (line 3065) rather than header
- Files: `index.html` (lines 3064-3065)
- Impact: API key is visible in browser Network tab AND in history/logs. User disclaimers warn about this (line 1792) but it's still a security concern.
- Workaround: Use API key only in session, don't save across browser restarts for Gemini
- Fix approach: Check if Gemini API supports Authorization header like OpenAI; if not, document clearly that Gemini keys are always exposed in URL.

**Timeout hardcoded to 90 seconds:**
- Issue: Fetch timeout is fixed at 90 seconds (line 2948: `FETCH_TIMEOUT_MS = 90000`)
- Files: `index.html` (line 2948)
- Impact: Long translation jobs on slow networks may timeout. Users with slow connections can't extend timeout without modifying code.
- Workaround: None currently
- Fix approach: Make configurable in advanced settings or at least expose as a constant users can modify easily.

**No validation of API key format before sending:**
- Issue: DeepL detects free vs pro key by `:fx` suffix (line 2981), but other providers don't validate key format before API call
- Files: `index.html` (lines 2981, 3016-3044, 3059-3077)
- Impact: Invalid API keys cause errors that are only caught after full request/response. Could improve UX with early validation.
- Workaround: Users see error message from provider
- Fix approach: Add basic validation (non-empty, minimum length) before attempting translation. For format-specific validation, rely on test key button.

**Cell editing doesn't preserve original text after page reload:**
- Issue: When user edits a cell and saves, the original translation is stored in `state.originalTranslations[lang]` but only for re-translate operations. Normal cell edits don't track originals.
- Files: `index.html` (lines 3387-3395)
- Impact: User cannot revert single-cell edits if they reload the page. Only batch re-translate operations preserve originals.
- Fix approach: Extend `originalTranslations` tracking to single-cell edits, or clearly document that cell edits cannot be reverted after page reload.

**Progress bar updates may race with user cancellation:**
- Issue: Translation can be aborted in-flight (via browser back button or modal close) but progress state isn't properly cleaned up
- Files: `index.html` (lines 2827-2903)
- Impact: If user cancels translation mid-flight, UI state may become inconsistent (translating flag still true, chips show error state, etc.)
- Workaround: Reload page to reset
- Fix approach: Add abort signal to all API calls and properly reset state if translation is cancelled.

## Security Considerations

**API keys stored in plaintext localStorage:**
- Risk: User's API keys are stored in browser localStorage without encryption when "Remember key" is checked
- Files: `index.html` (lines 2345, 2351, 2357, 2386-2392)
- Current mitigation: Keys stay in browser only, not sent to backend. Only visible in DevTools if user opens it.
- Recommendations: Add warning in UI that checking "Remember key" stores credentials locally. Consider adding encryption wrapper around localStorage write/read, or use sessionStorage instead (cleared on browser close).

**XSS vulnerability in innerHTML usage:**
- Risk: Some innerHTML assignments receive data from API responses or user input
- Files: `index.html` (lines 1864, 2232, 2240, 2242, 2288, 2293, 2581, 2612, 2668, 2728)
- Current mitigation: Most user-facing content uses `.textContent` instead. i18n HTML elements and progress chips use `.innerHTML` but inject controlled strings and icons only.
- Recommendations: Audit line 2728 (translate confirmation body) to ensure HTML construction doesn't interpolate untrusted data. Use `textContent` + DOM methods instead of `innerHTML` where possible.

**API key exposure in browser Network tab:**
- Risk: All three providers' API keys are visible in Network tab of browser DevTools
- Files: `index.html` (lines 1612, 1614, 1616, 1792)
- Current mitigation: Disclaimers clearly warn users (lines 1612, 1614, 1616)
- Recommendations: Ensure disclaimers are prominently displayed on first provider selection. Consider adding visual indicator that keys are "visible in network tab."

**CORS misconfiguration could leak credentials:**
- Risk: If CORS headers are misconfigured on API calls, credentials could be leaked
- Files: `index.html` (lines 2986-2997, 3037-3044, 3067-3078)
- Current mitigation: Using `fetch()` without `credentials: 'include'`, so no cookies sent. API keys passed in headers/body explicitly.
- Recommendations: Maintain current approach (no credentials in CORS requests). Document that API keys must be treated as secrets.

## Performance Bottlenecks

**Full table re-render on every character input in search:**
- Problem: Search filter (line 2589-2591) calls `renderEditorTable()` on every keystroke
- Files: `index.html` (lines 2589-2591, 2544-2583)
- Cause: No debouncing or memoization. Full table DOM rebuild even for single character changes.
- Improvement path: Add 300ms debounce to search input, or implement virtual scrolling for large translation tables (>1000 keys).

**Language selection grid recreated on every change:**
- Problem: `renderLanguages()` (line 2612) rebuilds entire language grid HTML even when only one language checkbox changes
- Files: `index.html` (lines 2612-2668)
- Cause: No incremental updates. Every language change triggers full DOM rebuild.
- Improvement path: Cache grid HTML structure, only update checkbox states. Or use event delegation instead of per-language event listeners.

**Multiple JSON.parse/stringify calls during translation:**
- Problem: Deep cloning using `JSON.parse(JSON.stringify(...))` happens 3+ times per translation batch
- Files: `index.html` (lines 2769, 2837, 3387)
- Cause: Defensive cloning to prevent mutations, but overdone
- Improvement path: Single deep clone at translation start, use targeted shallow copies for language blocks instead of full document re-clone.

**No pagination or lazy loading for large translation tables:**
- Problem: All keys rendered at once in editor table, even if file has 10,000+ keys
- Files: `index.html` (lines 2544-2583)
- Cause: Single-pass HTML string concatenation
- Improvement path: Implement virtual scrolling (visible rows only) or paginate table display if key count > 1,000.

**SetTimeout in progress simulation:**
- Problem: Progress bar simulation uses setInterval every 300ms (line 2809-2818) to update UI, creating many timers
- Files: `index.html` (lines 2807-2819)
- Cause: Doesn't leverage CSS animations or requestAnimationFrame
- Improvement path: Switch to CSS animation for progress bar with JS providing percentage updates, eliminating timer.

## Fragile Areas

**State management with Sets and Maps:**
- Files: `index.html` (lines 2016-2019, 2012, 2023-2025)
- Why fragile: `state.selected`, `state.editedCells`, `state.aiTranslatedCells`, `state.fullyTranslatedLangs` are Set/Map objects. `Object.assign()` at line 2024 doesn't deep clone these, so mutations to Sets/Maps will leak.
- Safe modification: Always create new Set/Map when updating: `new Set(state.selected)` then add/delete, then `setState({ selected: newSet })`. Current code does this correctly (see lines 2183, 2392) but it's easy to miss.
- Test coverage: Should verify that state mutations don't affect previous state snapshots.

**Cell edit modal state tracking:**
- Files: `index.html` (lines 3174-3404)
- Why fragile: Modal state (which cell is being edited) lives in local variables `currentEditKey`, `currentEditLang` (lines 3174-3175) rather than in main state object. If translation happens while modal is open, modal may reference stale data.
- Safe modification: Move edit context into main state object, or close modal before translation.
- Test coverage: Test editing while translation is in progress.

**Language code mapping for DeepL:**
- Files: `index.html` (lines 2914-2944)
- Why fragile: `mapToDeepLLang()` has hardcoded mappings (e.g., `'pt' -> 'PT-PT'`, `'zh' -> 'ZH-HANS'`). If DeepL adds new languages or changes codes, app breaks silently.
- Safe modification: Validate mapped code exists in provider config, or fetch supported languages from API.
- Test coverage: Add tests for all language code mappings.

**Confirmation modal language list generation:**
- Files: `index.html` (lines 2707-2729)
- Why fragile: Generates table HTML string via string concatenation (line 2728) without proper escaping. If `langCodeToName` returns HTML-like content, could break layout.
- Safe modification: Use DOM methods (createElement, appendChild) instead of innerHTML, or ensure `escapeHtml()` is applied to all dynamic values.
- Test coverage: Test with language names containing special characters.

**Provider configuration consistency:**
- Files: `index.html` (lines 1890-1954)
- Why fragile: `PROVIDER_CONFIG` defines models and URLs for each provider, but is separate from API call functions. If a provider changes API format, multiple functions must be updated.
- Safe modification: Centralize provider logic (move callDeepL, callOpenAI, callGemini into provider config as methods).
- Test coverage: Test each provider independently.

## Scaling Limits

**File size limit of 5 MB:**
- Current capacity: 5 MB JSON files (hardcoded, line 2451)
- Limit: Browsers may struggle parsing/rendering very large JSON (10,000+ keys)
- Scaling path: Add streaming JSON parser for very large files, or split import into chunks. Alternatively, document that 5 MB is the practical limit and users should pre-split files.

**Single-file app bottleneck:**
- Current capacity: ~3,458 lines / 128 KB single HTML file
- Limit: Beyond 5,000-8,000 lines, single file becomes unmaintainable
- Scaling path: If app grows (new providers, features, UX improvements), split into separate files and add a build step (Webpack/Vite).

**API rate limiting not handled:**
- Current capacity: Batch of 10 texts per call, no retry logic
- Limit: If user translates 1,000 keys × 10 languages = 1,000 API calls in rapid succession, will hit provider rate limits
- Scaling path: Implement exponential backoff retry logic, or add UI warning when batch translation will exceed rate limits.

## Dependencies at Risk

**No external JS dependencies, but reliant on API availability:**
- Risk: DeepL, OpenAI, Gemini API outages completely block app functionality
- Impact: If any provider's API is down, translations fail. No fallback.
- Migration plan: (Not applicable — app is designed as API client.) Suggest users to use offline tools if needed. Could add API health check on app load.

**Google Fonts CDN dependency:**
- Risk: If Google Fonts CDN is blocked (corporate network, offline), fallback fonts apply but layout may shift
- Impact: Cosmetic only
- Migration plan: Bundle Inter font locally if deploying to restricted networks.

## Missing Critical Features

**No translation memory or caching:**
- Problem: Each translation key is fetched and translated fresh every time. No cache of previous translations.
- Blocks: Users cannot reference past translations, must re-translate same keys for different JSON files.
- Impact: Adds cost and time for repeated translations of the same text.

**No support for nested JSON structure:**
- Problem: Only flat key-value pairs supported (e.g., `{ "key": "value" }`). Nested objects like `{ "form": { "name": "Name", "email": "Email" } }` not handled.
- Blocks: Users must flatten JSON before import, complicating workflow.
- Impact: Limits usability for complex translation files.

**No import of partial translations:**
- Problem: Every language upload must include all languages; can't upload just new language codes
- Blocks: Users cannot add a new language to existing JSON without touching existing languages.

**No undo/redo for translations:**
- Problem: Edits are immediately persisted. No undo stack.
- Blocks: Users must manually revert edits if mistake is made during bulk translation.

## Test Coverage Gaps

**API error handling untested:**
- What's not tested: How app handles malformed API responses, unexpected status codes (429, 500), network failures mid-translation
- Files: `index.html` (lines 2968-2976, 3000, 3047, 3081)
- Risk: Silent failures or cryptic error messages in production
- Priority: High — affects user experience when APIs are unstable

**Large file handling untested:**
- What's not tested: Performance and correctness with JSON files near 5 MB limit, with 5,000+ keys
- Files: `index.html` (lines 2451, 2544-2583)
- Risk: App may hang or crash with real-world large files
- Priority: Medium — only affects subset of users with large translation files

**Browser compatibility not tested:**
- What's not tested: Compatibility with older browsers (IE 11, Safari 10). Uses modern features (async/await, Set, Map, fetch, AbortController).
- Files: `index.html` (throughout)
- Risk: App fails silently on unsupported browsers
- Priority: Low — project targets modern browsers, but should document supported versions

**Concurrent cell edits untested:**
- What's not tested: Behavior when user opens cell edit modal, then bulk translation starts, then closes modal
- Files: `index.html` (lines 3174-3404, 2827-2903)
- Risk: UI state inconsistency
- Priority: Medium — edge case but possible user flow

**Language code mapping correctness untested:**
- What's not tested: All DeepL language code mappings (e.g., `pt-br`, `zh-cn`, `pt-pt`) actually work with API
- Files: `index.html` (lines 2914-2944)
- Risk: Specific languages fail silently or return unexpected translations
- Priority: Medium — affects international users

---

*Concerns audit: 2026-03-20*
