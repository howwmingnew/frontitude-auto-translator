# Technology Stack

**Analysis Date:** 2026-03-20

## Languages

**Primary:**
- HTML5 - Application markup and structure
- CSS3 - Styling with CSS custom properties (variables) for theming
- JavaScript (ES5) - Core application logic with async/await support

**Secondary:**
- JSON - Configuration and translation data format

## Runtime

**Environment:**
- Browser (client-side only) - No server component

**Package Manager:**
- None - No build step or npm dependencies
- Single-file deployment: `index.html`

## Frameworks

**Core:**
- Vanilla JavaScript - No framework dependencies
- Custom IIFE-wrapped state management with immutable patterns (`setState()` function)

**Styling:**
- Plain CSS3 - No CSS-in-JS or preprocessors
- CSS custom properties for theme switching (light/dark mode)
- CSS Grid and Flexbox for layout

**Build/Dev:**
- No build tooling required
- Direct browser execution from `index.html`
- No bundler, transpiler, or minification

## Key Dependencies

**Critical (External):**
- Google Fonts (Inter typeface) - CDN-loaded via `https://fonts.googleapis.com`
- Browser Fetch API (native) - For API calls to translation providers
- Browser FileReader API (native) - For JSON file upload handling
- Browser localStorage/sessionStorage (native) - For key and state persistence

**None from npm/package registries** - Application is dependency-free

## Configuration

**Environment:**
- API keys managed via browser input fields
- localStorage for opt-in key persistence:
  - `translate_key_{provider}` - Per-provider API keys (DeepL, OpenAI, Gemini)
  - `translate_model_{provider}` - Per-provider model selection
  - `translate_provider` - Selected translation provider
  - `translate_context_prompt` - User-supplied domain context
  - `translate_theme` - Light/dark theme preference
  - `ui_lang` - UI language selection (en, zh-TW, ko)
- No `.env` file required - All configuration is client-side

**Theme:**
- CSS custom properties for light and dark modes
- `[data-theme="dark"]` attribute on `<html>` element toggles theme
- 60+ CSS variables for comprehensive theming

## Platform Requirements

**Development:**
- Any modern browser with ES6 support (Chrome, Firefox, Safari, Edge)
- No local development server required - open `index.html` directly in browser
- Optional: simple HTTP server for testing (security policies in some browsers)

**Production:**
- Deployment target: GitHub Pages (static hosting)
- Requires only HTTP serving of single `index.html` file
- No backend, database, or server-side processing
- CORS handled directly between browser and translation provider APIs

## File Size & Constraints

**File Limit:**
- Maximum 5 MB for uploaded JSON language files (enforced in JavaScript)

**API Rate Limits:**
- Batch translation: 50 texts per API call
- Request timeout: 90 seconds (AbortController with timeout)

---

*Stack analysis: 2026-03-20*
