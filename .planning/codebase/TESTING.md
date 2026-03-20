# Testing Patterns

**Analysis Date:** 2026-03-20

## Test Framework

**Status:** Not configured

- No test runner detected (no Jest, Vitest, Mocha, or similar)
- No test files present in codebase (no `.test.js`, `.spec.js` files)
- No `package.json` or npm dependencies (single-file static HTML app)
- No test configuration files (`.eslintrc`, `jest.config.js`, etc.)

**Why:** This is a single-file browser application deployed on GitHub Pages with no build step. It has no test infrastructure.

**Run Commands:**
- Manual browser testing only (open `index.html` directly)
- No automated test commands available

## Test File Organization

**Not applicable** - No test files exist.

**Recommendation for future testing:**
- Place tests in a `__tests__` directory at project root: `__tests__/translator.test.js`
- Or co-locate with logic: `translator.test.js` alongside source (requires build step to separate)

## Test Structure

**Not applicable** - No existing test structure.

## Mocking

**Not applicable** - No mocking infrastructure in place.

**If testing were implemented:**
- Mock `fetch` calls to API endpoints (DeepL, OpenAI, Gemini)
- Mock `localStorage` for persistent settings
- Mock `FileReader` for file upload scenarios
- Mock DOM methods for non-visual operations

## Fixtures and Factories

**Not applicable** - No test fixtures present.

**If testing were implemented:**
- Test data fixtures for sample `language.json` structures
- Mock API responses for each provider (DeepL, OpenAI, Gemini)
- Factory functions to create state objects with different configurations

## Coverage

**Requirements:** None enforced

- No coverage tracking enabled
- No minimum coverage targets configured

## Test Types

**Unit Tests:** Not implemented

- Would test pure functions like:
  - `langCodeToName()` - language code to display name mapping
  - `mapToDeepLLang()` - DeepL language code transformation
  - `parseJSONArrayResponse()` - JSON parsing and validation
  - `setState()` - state immutability pattern
  - `t()` - i18n translation helper

**Integration Tests:** Not implemented

- Would test workflows like:
  - File upload → JSON parsing → validation flow (`handleFile()` → `processJson()`)
  - API call with timeout (`fetchWithTimeout()` with AbortController)
  - Translation pipeline (batch processing, progress tracking)
  - Cell editing and state synchronization

**E2E Tests:** Not implemented

- Would test critical user flows:
  - Upload JSON → Configure provider → Translate → Download
  - Individual cell click-to-translate
  - Cell edit modal with revert/AI translate buttons
  - Provider switching and API key persistence
  - Theme toggling and UI language switching

## Coverage Gaps

**High-priority untested areas:**

| Area | What's Not Tested | Risk |
|------|-------------------|------|
| API integration | DeepL/OpenAI/Gemini response handling | Wrong provider could silently fail; malformed responses could crash translator |
| File validation | JSON structure validation in `processJson()` | Invalid JSON could cause crashes; missing "en" key not caught in all cases |
| Language mapping | DeepL language code transformation `mapToDeepLLang()` | Wrong language codes sent to API |
| State immutability | `setState()` pattern enforcement | Mutations could cause hidden bugs and render inconsistencies |
| Cell editing | Modal open/close, save/revert, AI translate button | State could get out of sync; edited cells might not persist correctly |
| Error handling | All error paths in try/catch blocks | Silent failures possible; user feedback missing for some edge cases |
| Translation flow | Progress tracking, batch processing, chip updates | Progress bar could freeze; translation state corruption if async fails |
| localStorage | Persistence of API keys, theme, language | Settings loss; security issues with stored keys not validated |
| Offline behavior | App behavior when network unavailable | No graceful degradation; confusing errors shown to user |

---

## Manual Testing Checklist

Since no automated tests exist, manual testing is the primary validation method:

**File Upload:**
- [ ] Upload valid `language.json` - should parse and display
- [ ] Upload invalid JSON - should show error message
- [ ] Upload file > 5 MB - should reject with file size error
- [ ] Upload non-JSON file - should reject with format error
- [ ] Upload JSON missing "en" key - should reject
- [ ] Upload JSON with non-string values in "en" - should reject and list keys

**Provider Configuration:**
- [ ] Switch between DeepL/OpenAI/Gemini - UI updates correctly
- [ ] DeepL: Free key (ends with `:fx`) vs Pro key - correct endpoint selected
- [ ] OpenAI: Model dropdown shows and persists selection
- [ ] Gemini: Model dropdown shows and persists selection
- [ ] Enter invalid API key - Test Key button shows error

**Translation:**
- [ ] Click Translate - translation flow completes
- [ ] Progress bar advances smoothly
- [ ] Chips update: pending → translating → done/error
- [ ] Empty languages are skipped
- [ ] Fully translated languages show confirmation dialog
- [ ] API timeout (30s) shows error and allows retry
- [ ] Translation error shows detailed message to user

**Cell Editing:**
- [ ] Click untranslated cell (empty) - AI translate modal opens
- [ ] Click translated cell - edit confirmation modal opens
- [ ] Edit and save - state updates, table re-renders
- [ ] Revert button - restores original value from imported JSON
- [ ] AI Translate in modal - calls API and populates field
- [ ] Close modal with Escape key - modal closes without saving

**UI/UX:**
- [ ] Theme toggle - switches light/dark mode
- [ ] Language switcher - UI relocalizes correctly
- [ ] Sidebar drawer - opens/closes, persists settings
- [ ] Re-select JSON button - resets editor, returns to upload phase
- [ ] Export button - downloads JSON with translations
- [ ] Toast notifications appear and auto-dismiss

---

## Current Testing Reality

**Manual Testing Observations:**

The codebase relies entirely on manual testing by:
1. Opening `index.html` in a browser
2. Interacting with UI to verify behavior
3. Checking browser console for errors
4. Verifying API calls in browser Network tab

**No CI/CD testing pipeline exists** - changes are tested manually before committing.

**Code patterns that enable manual testing:**
- Clear error messages shown in UI (not silent failures)
- Toast notifications for all major actions
- Progress indicators for async operations
- Form validation feedback
- localStorage inspection in DevTools

---

*Testing analysis: 2026-03-20*
