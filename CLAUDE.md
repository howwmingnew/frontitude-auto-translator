# Frontitude One-Click Translator

## Project Overview

A pure static Web App (single `index.html`) for translating Frontitude-exported `language.json` files via DeepL, OpenAI, or Gemini APIs. Deployed on GitHub Pages — no backend.

## Architecture

- **Single file**: Everything lives in `index.html` (HTML + CSS + JS)
- **No build step**: No npm, no bundler, no framework
- **No external JS dependencies**: Only Google Fonts (Inter) via CDN
- **State management**: Immutable state object with `setState(patch)` pattern — never mutate state directly
- **API calls**: Direct browser-to-provider fetch calls with AbortController timeout (30s)

## UI Flow

Two-phase interface — upload first, then configure and translate:

1. **Upload phase**: Only the Upload JSON card is visible (720px container)
2. **Editor phase** (after upload): Upload card hides, container expands to 95vw. Shows Content Preview table, Translation Provider (with context prompt), Target Languages, Translate button, Download. A "Re-select JSON" button in the Content Preview header resets back to the upload phase.

The Content Preview is a read-only Excel-like table (rows = keys, columns = languages) with sticky header/first-column, search filter, and max-height 60vh scroll. It re-renders after translation completes to show translated values.

## Key Technical Decisions

- **Multi-provider support**: DeepL (direct translation API), OpenAI and Gemini (LLM-based via JSON array prompt)
- **Batch size**: 50 texts per API call
- **File size limit**: 5 MB
- **Context prompt**: Optional user-supplied domain context (e.g. "dental implant software") injected into OpenAI/Gemini system prompts. Not used by DeepL. Persisted in `translate_context_prompt`.
- **localStorage**: Opt-in per-provider key storage (`translate_key_{provider}`, `translate_model_{provider}`, `translate_provider`, `translate_context_prompt`)
- **DeepL endpoint auto-detection**: Free (`:fx` suffix) vs Pro key determines API base URL
- **Language code mapping**: DeepL requires special codes (e.g. `zh` -> `ZH-HANS`, `pt` -> `PT-PT`)

## File Structure

```
index.html          — The entire application
README.md           — English README
README.zh-TW.md     — Traditional Chinese README
README.ko.md        — Korean README
```

## Development

Open `index.html` directly in a browser. No build or serve step needed.

## Conventions

- Vanilla JS (ES5-compatible syntax with `async/await` exception for translation flow)
- IIFE wrapper to avoid global scope pollution
- DOM refs cached in a `dom` object at startup
- Immutable state updates — always use `setState()`, never modify `state` properties directly
- Deep clone JSON data before translation to prevent mutation of original upload

## UI/UX

For any UI-related changes (styling, layout, components, interactions, animations, accessibility, responsive design), always use the `ui-ux-pro-max` skill.
