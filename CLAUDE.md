# Frontitude One-Click Translator

## Project Overview

A pure static Web App for translating Frontitude-exported `language.json` files via DeepL, OpenAI, or Gemini APIs. Deployed on GitHub Pages -- no backend.

## Architecture

- **Multi-file structure**: HTML skeleton + external CSS + 9 JS files loaded via `<script>` tags
- **Cross-file communication**: `window.App` global namespace -- each IIFE attaches exports to `App.*`
- **No build step**: No npm, no bundler, no framework, no ES Modules
- **No external JS dependencies**: Only Google Fonts (Inter) via CDN
- **State management**: Immutable state object with `App.setState(patch)` pattern -- never mutate state directly. Always read current state via `App.getState()`.
- **API calls**: Direct browser-to-provider fetch calls with AbortController timeout (90s)

### Script Load Order (dependencies flow downward)

1. `js/state.js` -- Creates `window.App`, `App.state`, `App.getState`, `App.setState`
2. `js/constants.js` -- `App.PROVIDER_CONFIG`, `App.LANG_CODE_TO_NAME`, `App.MAX_FILE_BYTES`, `App.FETCH_TIMEOUT_MS`, language helpers
3. `js/i18n.js` -- `App.UI_TRANSLATIONS`, `App.t`, `App.applyI18n`
4. `js/dom.js` -- `App.dom` (all cached DOM element references)
5. `js/ui.js` -- Theme, toast, drawer, collapsible, editor table, language grid, file upload, provider UI
6. `js/providers.js` -- `App.fetchWithTimeout`, `App.callDeepL/OpenAI/Gemini`, `App.callTranslateAPI`, `App.testApiKey`
7. `js/translation.js` -- `App.doTranslate`, `App.showTranslateConfirm`, batch logic, progress
8. `js/cell-edit.js` -- Cell edit modal, single-cell translate
9. `js/bitbucket.js` -- `App.initBitbucket`, `App.testBitbucketConnection`, Bitbucket connection UI logic
10. `js/app.js` -- Entry point: `App.init` (calls all init functions, wires event listeners)

## UI Flow

Two-phase interface -- upload first, then configure and translate:

1. **Upload phase**: Only the Upload JSON card is visible (720px container)
2. **Editor phase** (after upload): Upload card hides, container expands to 95vw. Shows Content Preview table, Translation Provider (with context prompt), Target Languages, Translate button, Download. A "Re-select JSON" button in the Content Preview header resets back to the upload phase.

The Content Preview is a read-only Excel-like table (rows = keys, columns = languages) with sticky header/first-column, search filter, and max-height 60vh scroll. It re-renders after translation completes to show translated values.

## Key Technical Decisions

- **Multi-provider support**: DeepL (direct translation API), OpenAI and Gemini (LLM-based via JSON array prompt)
- **Batch size**: 10 texts per API call
- **File size limit**: 5 MB
- **Context prompt**: Optional user-supplied domain context (e.g. "dental implant software") injected into OpenAI/Gemini system prompts. Not used by DeepL. Persisted in `translate_context_prompt`.
- **localStorage**: Opt-in per-provider key storage (`translate_key_{provider}`, `translate_model_{provider}`, `translate_provider`, `translate_context_prompt`)
- **DeepL endpoint auto-detection**: Free (`:fx` suffix) vs Pro key determines API base URL
- **Language code mapping**: DeepL requires special codes (e.g. `zh` -> `ZH-HANS`, `pt` -> `PT-PT`)

## File Structure

```
index.html          - HTML skeleton (no inline CSS/JS)
css/styles.css      - All styles
js/state.js         - App namespace, state management (getState/setState)
js/constants.js     - PROVIDER_CONFIG, LANG_CODE_TO_NAME, language helpers
js/i18n.js          - UI_TRANSLATIONS, t(), applyI18n()
js/dom.js           - Cached DOM element references
js/ui.js            - Theme, toast, drawer, collapsible, editor table, language grid
js/providers.js     - fetchWithTimeout, callDeepL/OpenAI/Gemini, testApiKey
js/translation.js   - doTranslate, batch logic, progress, download
js/cell-edit.js     - Cell edit modal, single-cell translate
js/bitbucket.js     - Bitbucket connection UI, test connection, localStorage persistence
js/app.js           - Entry point: init sequence, event wiring
proxy/              - Cloudflare Worker CORS proxy for Bitbucket API
README.md           - English README
README.zh-TW.md     - Traditional Chinese README
README.ko.md        - Korean README
```

## Development

Serve via HTTP server for multi-file loading:

```bash
python -m http.server 8080
# or
npx serve .
```

Then open http://localhost:8080 in a browser. The `file://` protocol still works for basic testing but an HTTP server is recommended for full functionality (CORS proxy integration requires it).

## Conventions

- Vanilla JS (ES5-compatible syntax with `async/await` exception for translation flow)
- Each JS file wrapped in IIFE: `(function () { 'use strict'; ... })();`
- Cross-file communication via `window.App` namespace -- attach exports as `App.functionName = functionName`
- Always use `App.getState()` to read current state (never cache `App.state` in a long-lived variable)
- Always use `App.setState(patch)` to update state -- never modify state properties directly
- DOM refs cached in `App.dom` object at startup
- Deep clone JSON data before translation to prevent mutation of original upload
- No ES Module syntax (`import`/`export`) anywhere -- traditional script tags only

## UI/UX

For any UI-related changes (styling, layout, components, interactions, animations, accessibility, responsive design), always use the `ui-ux-pro-max` skill.
