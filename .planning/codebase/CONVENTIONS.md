# Coding Conventions

**Analysis Date:** 2026-03-20

## Naming Patterns

**Files:**
- Single HTML file: `index.html` contains all HTML, CSS, and JavaScript
- No separate module files (single-file architecture)
- README files follow language convention: `README.md`, `README.zh-TW.md`, `README.ko.md`

**Functions:**
- camelCase for all functions: `setState()`, `openDrawer()`, `callTranslateAPI()`, `handleCellEdit()`
- Action-based names with verb-noun pattern: `showToast()`, `hideError()`, `updateProgress()`
- Getter functions use `get` prefix: `getPreferredTheme()`, `getFullyTranslatedLanguages()`
- Underscore-separated for storage key helper functions: `storageKeyForProvider()`, `storageKeyForModel()`
- Event handlers prefix with handler name: `handleFile()`, `handleCellEdit()`, `handleCellTranslate()`

**Variables:**
- camelCase for all variables and state properties: `simulatedPct`, `completedBatches`, `newJsonData`
- Const-style UPPERCASE for configuration objects and constants: `MAX_FILE_BYTES`, `FETCH_TIMEOUT_MS`, `PROVIDER_CONFIG`, `LANG_CODE_TO_NAME`, `UI_TRANSLATIONS`, `TRANSLATION_RULES`
- State properties are camelCase: `uiLang`, `apiKey`, `jsonData`, `translating`
- DOM element references prefixed with `dom.`: `dom.apiKey`, `dom.uploadCard`, `dom.progressBar`
- Private/module-local tracking objects: `cellTranslatingKeys` (object for tracking), `editModalState` (object)

**Types:**
- No TypeScript; vanilla JavaScript with ES5 syntax except async/await
- Type hints appear only in comments where needed (rare)
- Objects use lowercase keys for data structure (e.g., `state.uiLang`, `state.jsonData`)

## Code Style

**Formatting:**
- No build-time formatter detected
- Manual consistency observed:
  - 2-space indentation throughout
  - Semicolons used consistently on all statements
  - Braces follow Allman style on same line: `if (condition) {`
  - Line length varies; no enforced limit observed

**Linting:**
- No ESLint or Prettier config detected
- No automated linting in place
- Code style is maintained manually

## Import Organization

**Not applicable** - Single-file architecture with no imports. All code lives in one `index.html` file within a single IIFE (Immediately Invoked Function Expression).

## Error Handling

**Patterns:**
- Try/catch blocks for async operations and file parsing
- Errors are caught and displayed to user via `showError()` and `showToast()` functions
- Detailed error messages provided to UI with i18n support: `t('errJsonParse', err.message)`
- API errors handled via `handleAPIError()` helper that extracts error message from response body
- Long-running operations (translation) use try/catch/finally to ensure cleanup (clearing timers, resetting UI state)

**Example error flow** (`/Users/liuhaoming/frontitude-auto-translator/index.html:2472-2478`):
```javascript
reader.onload = function (e) {
  try {
    var parsed = JSON.parse(e.target.result);
    processJson(parsed);
  } catch (err) {
    showError(dom.uploadError, t('errJsonParse', err.message));
    showToast(t('toastError', t('errJsonParse', err.message)), 'error');
  }
};
```

**Timeout handling** (`/Users/liuhaoming/frontitude-auto-translator/index.html:2950-2966`):
```javascript
function fetchWithTimeout(url, options) {
  var controller = new AbortController();
  var timeoutId = setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);
  var opts = Object.assign({}, options, { signal: controller.signal });
  return fetch(url, opts)
    .then(function (response) {
      clearTimeout(timeoutId);
      return response;
    })
    .catch(function (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(t('errTimeout', FETCH_TIMEOUT_MS / 1000));
      }
      throw err;
    });
}
```

## Logging

**Framework:** Native `console` (no external logging library)

**Patterns:**
- No explicit logging observed in production code
- Error messages are user-facing via toast notifications and error display elements
- Detailed error context is displayed to user rather than logged

## Comments

**When to Comment:**
- Sparse use of comments; code is largely self-documenting
- Comments used for non-obvious logic or rules (e.g., translation rules)
- Section headers use decorative dashes: `// ── Provider + API Key ──`
- Inline comments explain special cases: `// -1 because column 0 is Key`

**Example** (`/Users/liuhaoming/frontitude-auto-translator/index.html:3010-3011`):
```javascript
// ── Translation prompt rules (English for best LLM performance) ──
var TRANSLATION_RULES = '\n\nRULES:\n1. Preserve all placeholders...';
```

## Function Design

**Size:** Generally small, 10-50 lines typical. Longer functions are translation pipelines where complexity is inherent (e.g., `performTranslation`, `callOpenAI`).

**Parameters:**
- Functions accept 1-3 parameters
- Complex state passed via global `state` object rather than multiple parameters
- Event handlers receive event object and extract data from `e.target`

**Return Values:**
- Async functions return Promises (via `async/await`)
- Synchronous functions return values or void (side effects on DOM/state)
- No null safety checks; errors thrown on invalid data

**Example function** (`/Users/liuhaoming/frontitude-auto-translator/index.html:2094-2101`):
```javascript
function getPreferredTheme() {
  var saved = localStorage.getItem('translate_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}
```

## Module Design

**Exports:** Not applicable (single-file IIFE pattern)

**Barrel Files:** Not applicable

**IIFE Pattern** (`/Users/liuhaoming/frontitude-auto-translator/index.html:1590+`):
- Entire application wrapped in a single IIFE to avoid global namespace pollution
- All functions and variables are local to this scope
- Only DOM is accessed globally; no global exports

**State Management:**
- Immutable state updates via `setState(patch)` pattern: `setState({ jsonData: newJsonData })`
- State object contains all application state: `var state = { uiLang, provider, apiKey, jsonData, ... }`
- Never mutate state directly; always use `setState()` to update
- Deep cloning used for complex updates: `JSON.parse(JSON.stringify(state.jsonData))`

**DOM Caching:**
- All DOM element references cached at startup in `dom` object
- Example: `var dom = { providerSection: document.getElementById(...), ... }`
- Enables quick access and avoids repeated querySelector calls

---

*Convention analysis: 2026-03-20*
