# Architecture

**Analysis Date:** 2026-03-20

## Pattern Overview

**Overall:** Single-file IIFE (Immediately Invoked Function Expression) monolithic app with immutable state management

**Key Characteristics:**
- Pure static HTML/CSS/JavaScript in one file (`index.html`)
- No build step, no dependencies, no framework
- Immutable state via `setState(patch)` pattern using `Object.assign()`
- Event-driven UI updates with direct DOM manipulation
- Browser-based API calls with 90-second fetch timeout
- localStorage for persistent user preferences and API keys

## Layers

**UI Layer (HTML/CSS):**
- Purpose: Render user interface with theme support (light/dark)
- Location: `index.html` lines 10-1550 (styles) and HTML elements
- Contains: CSS variables, responsive grid, modals, cards, animations
- Depends on: State for visibility and data rendering
- Used by: Event handlers that read/write DOM

**State Layer (JavaScript):**
- Purpose: Single source of truth for application data
- Location: `index.html` lines 2005-2020 (state object) and line 2023-2025 (setState function)
- Contains: Loaded JSON data, selected languages, API configuration, UI preferences, translation tracking
- Depends on: Nothing (pure data)
- Used by: All event handlers and rendering functions

**Event Handler Layer:**
- Purpose: Listen for user interactions and trigger state/UI updates
- Location: `index.html` lines 2100+ (various event listeners)
- Contains: File upload, provider selection, language selection, translate button, cell editing
- Depends on: State, DOM references, API functions
- Used by: Browser DOM events

**API Integration Layer:**
- Purpose: Handle communication with external translation providers
- Location: `index.html` lines 2900-3100+ (callTranslateAPI, callDeepL, callOpenAI, callGemini)
- Contains: API endpoint construction, request/response handling, error handling
- Depends on: State (provider config, API key), language mapping
- Used by: Translation workflow (doTranslate, cell editing translation)

**Utility Layer:**
- Purpose: Helper functions for common operations
- Location: `index.html` lines 2200-2950 (renderEditorTable, renderLanguageGrid, getFullyTranslatedLanguages, etc.)
- Contains: Rendering functions, validation, language code conversion, batch logic
- Depends on: State, DOM references
- Used by: Event handlers and API layer

## Data Flow

**File Upload → Translation → Export:**

1. User drops/selects JSON file via dropzone
2. `handleFileSelect` event → validate JSON structure, parse, detect fully-translated languages
3. `setState()` updates with parsed jsonData, detected languages, selection defaults
4. UI transitions: hide upload-card, show editor-section with preview table
5. User selects languages and clicks Translate
6. `showTranslateConfirm()` calculates summary: which languages to translate, how many texts
7. Confirm click → `doTranslate()` starts async translation loop:
   - Iterate through selected languages and missing keys
   - Batch texts (10 per call for LLMs, 50 per call concept)
   - For each batch: call `callTranslateAPI(batch, lang)` → provider dispatch
   - Update progress bar and chips in real-time
   - Build immutable result object: deep clone → update cells → setState
8. After completion: render updated editor table, show success toast
9. User clicks Export → `downloadLanguageFile()` creates blob and downloads JSON

**Cell Editing Flow:**

1. Click on editor table cell → `openCellEditModal()`
2. Populate textarea with current value or empty for new translation
3. User can: Save (updates editedCells map), Revert (restores original), AI Translate (calls single-text API)
4. On save → updateEditedCell() → setState with new cell value and mark as edited (visual highlight)
5. Edited values persist until Export is clicked

**State Management Pattern:**

```javascript
// IMMUTABLE updates only:
function setState(patch) {
  state = Object.assign({}, state, patch);  // creates new state object
}

// When updating nested structures (jsonData, editedCells):
var newJsonData = JSON.parse(JSON.stringify(state.jsonData));  // deep clone
newJsonData[lang][key] = newValue;  // mutate the clone
setState({ jsonData: newJsonData });  // replace with new object

// Never do:
state.jsonData[lang][key] = value;  // WRONG - mutates original
```

## Key Abstractions

**Provider Configuration:**
- Purpose: Centralize provider-specific settings (API endpoints, models, authentication)
- Examples: `index.html` lines 1922-1954 (PROVIDER_CONFIG)
- Pattern: Configuration object with provider name, models array, endpoint patterns

**Language Code Mapping:**
- Purpose: Convert between ISO 639-1 codes and provider-specific codes (e.g., DeepL uses `ZH-HANS`)
- Examples: `index.html` lines 1956-2001 (LANG_CODE_TO_NAME) and lines 2916-2941 (language conversion functions)
- Pattern: Lookup dictionaries with fallback logic for unknown codes

**Batch Translation:**
- Purpose: Split large translation jobs into smaller API calls to avoid timeouts
- Examples: `index.html` lines 2773-2860 (doTranslate loop with batchSize)
- Pattern: Group keys by language, split each group into batches, await each batch sequentially

**UI Translations (i18n):**
- Purpose: Support multilingual UI (English, Traditional Chinese, Korean)
- Examples: `index.html` lines 1572-1840 (UI_TRANSLATIONS object and t() function)
- Pattern: Key-based translations with sprintf-style argument interpolation

**Cell Tracking:**
- Purpose: Remember which cells were edited or AI-translated for visual highlighting
- Examples: `index.html` lines 2016, 2018 (state.editedCells as Map, state.aiTranslatedCells as Set)
- Pattern: Store cell identifiers (`key::lang` or `lang:key`) in collections for lookup

## Entry Points

**Browser Load:**
- Location: `index.html` lines 3417-3455 (init functions at IIFE bottom)
- Triggers: Page loads in browser
- Responsibilities: Initialize theme (light/dark), UI language, context prompt, provider configuration

**File Upload:**
- Location: `index.html` lines 2439-2540 (dropzone and file input events)
- Triggers: User drags/drops JSON or clicks file input
- Responsibilities: Validate file, parse JSON, detect structure errors, transition to editor phase

**Translate Button:**
- Location: `index.html` lines 2680-2730 (event listener on #translate-btn)
- Triggers: User clicks Translate after selecting languages
- Responsibilities: Build confirmation modal, wait for user confirmation, start translation batch loop

**Provider Selection:**
- Location: `index.html` lines 2256-2280 (event listener on #provider-select)
- Triggers: User changes provider dropdown
- Responsibilities: Update model select options, update API key placeholder, persist preference to localStorage

## Error Handling

**Strategy:** Try-catch with user-friendly toast notifications for translation API errors; validation errors shown inline

**Patterns:**

1. **File Validation:**
   - Lines 2451-2512: Check file type, size, JSON parsability, required fields (en key), non-string values
   - Display error inline in upload-error element

2. **API Errors:**
   - Lines 2969-2979: Catch fetch/parse errors, log response body
   - Lines 3050-3088: Catch LLM response errors (invalid JSON, missing fields)
   - Show user-facing error toast: "API error 401: Unauthorized" with details

3. **Translation Logic Errors:**
   - Lines 2857-2862: Catch errors during batch translation, log provider and language
   - If batch fails: show error toast, continue to next batch (partial success)

4. **Cell Editing Errors:**
   - Lines 3350-3370: Catch AI translate errors on single cell
   - Display error toast without blocking other operations

## Cross-Cutting Concerns

**Logging:** Browser console only (no server-side analytics)
- Log API responses, errors, batch completion
- No PII logging (don't log actual translations)

**Validation:**
- File upload: JSON structure, required fields, value types
- API keys: length check (placeholder), provider-specific format hints
- Language codes: ISO 639-1 validation before API calls

**Authentication:**
- API keys stored in state.apiKey (in-memory only by default)
- Optional persistence via localStorage (user opt-in via "Remember key" checkbox)
- Key sent directly in API request headers (Authorization: Bearer or query param)

**Rate Limiting:**
- No client-side rate limiting; rely on provider quotas
- 90-second fetch timeout to prevent hung requests
- Batch size limits (10 items) to stay under provider rate limits

**Responsive Design:**
- CSS media queries for mobile (<768px): sidebar collapses, container width adjusts
- Collapsible sections on mobile via initCollapsible() for provider and language sections
- Table scrolls horizontally on small screens

---

*Architecture analysis: 2026-03-20*
