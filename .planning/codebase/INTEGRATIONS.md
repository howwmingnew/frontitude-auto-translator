# External Integrations

**Analysis Date:** 2026-03-20

## APIs & External Services

**Translation Providers (Multi-provider Support):**

- **DeepL Translation API** - Direct translation service
  - SDK/Client: Fetch API (browser native)
  - Auth: API key (stored in `translate_key_deepl`)
  - Endpoints:
    - Free tier: `https://api-free.deepl.com/v2/translate`
    - Pro tier: `https://api.deepl.com/v2/translate`
  - Auth Header: `Authorization: DeepL-Auth-Key {key}`
  - Key URL: `https://www.deepl.com/pro#developer`
  - Implementation: `callDeepL()` function (~line 2980)
  - Auto-detects free vs. pro tier from key suffix (`:fx` = free)

- **OpenAI API** - LLM-based translation
  - SDK/Client: Fetch API (browser native)
  - Auth: API key (stored in `translate_key_openai`)
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Auth Header: `Authorization: Bearer {key}`
  - Key URL: `https://platform.openai.com/api-keys`
  - Supported Models (~line 1935):
    - `gpt-5.4-mini` - Fast, low cost
    - `gpt-5.4` - High quality
    - `gpt-5.4-nano` - Ultra fast
    - `gpt-5-mini` - Economical
  - Model persisted in localStorage: `translate_model_openai`
  - Temperature: 0.3 (except `gpt-5-mini` which has no custom temperature)
  - Implementation: `callOpenAI()` function (~line 3016)

- **Google Gemini API** - LLM-based translation
  - SDK/Client: Fetch API (browser native)
  - Auth: API key passed as URL parameter
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}`
  - Key URL: `https://aistudio.google.com/apikey`
  - Supported Models (~line 1947):
    - `gemini-3-flash` - Fast, low cost
    - `gemini-3.1-flash-lite` - Ultra fast
    - `gemini-2.5-flash` - Balanced
    - `gemini-3.1-pro-preview` - High quality
  - Model persisted in localStorage: `translate_model_gemini`
  - Temperature: 0.3
  - Implementation: `callGemini()` function (~line 3059)

## Data Storage

**Databases:**
- None - No backend database

**File Storage:**
- None - Local filesystem only (browser-based JSON upload/download)
- Uploaded JSON files processed entirely in-memory
- No server-side file storage

**Client-side Persistence:**
- localStorage for configuration persistence (key, model, theme, language)
- sessionStorage for UI state (sidebar collapse/expand state)

**Caching:**
- None explicit - Standard browser HTTP caching for Google Fonts

## Authentication & Identity

**Auth Provider:**
- None - Self-managed via API keys
  - DeepL: Direct API key authentication
  - OpenAI: Bearer token authentication
  - Gemini: API key as URL parameter

**Key Management:**
- Optional localStorage persistence (user opt-in via checkbox)
- Keys never sent to application backend (no backend exists)
- Keys visible in browser Network tab (documented to user)
- User can clear saved keys via "Clear saved key" button

## Monitoring & Observability

**Error Tracking:**
- None - All errors displayed to user in UI (toast notifications, inline error messages)

**Logs:**
- Console logging via browser console (not centralized)
- No analytics or telemetry

**Error Handling:**
- Comprehensive error handling in translation flow:
  - File validation: JSON format, size (<5MB), structure (object with language codes)
  - API errors: Captured from provider response bodies, displayed to user
  - Timeout handling: 90-second AbortController timeout on all fetch requests
  - JSON parsing errors: Detailed error messages from LLM response parsing
  - Implementation: `handleAPIError()` function (~line 2968)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (static hosting only)
- Single HTML file deployment

**CI Pipeline:**
- None configured - Manual deployment

**Deployment Method:**
- Push `index.html` (and markdown README files) to GitHub repository
- GitHub Pages automatically serves from `main` branch

## Environment Configuration

**Required env vars:**
- None - No backend environment variables needed

**API Key Storage:**
- Browser localStorage (client-side opt-in)
- Keys are user-supplied via UI input fields
- No server-side secret management
- Keys visible in browser Network tab (design choice)

**Secrets location:**
- Client-side localStorage only
- Pattern: `translate_key_{provider}` where provider = 'deepl' | 'openai' | 'gemini'

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None - All API calls are request/response (no callbacks or webhooks)

## API Request Patterns

**Timeout & Resilience:**
- Fetch timeout: 90 seconds (`FETCH_TIMEOUT_MS` = 90000)
- No retry logic - Timeouts trigger user-facing error messages
- AbortController used for timeout implementation (~line 2950)

**Batch Processing:**
- Batch size: 50 texts per API call
- All three providers (DeepL, OpenAI, Gemini) use batch translation for efficiency

**Response Parsing:**
- DeepL: Returns `{ translations: [{ text: ... }] }` array
- OpenAI/Gemini: Returns JSON array as string in message content, parsed and validated
- Custom parsing for JSON array extraction with markdown fence removal

**Language Code Mapping:**
- Internal mapping: `LANG_CODE_TO_NAME` object (~line 1956)
- DeepL requires special codes (e.g., `zh` → `ZH-HANS`, `pt` → `PT-PT`)
- OpenAI/Gemini accept ISO language codes directly
- Supported languages: 35+ including major languages, Chinese variants, Portuguese variants

---

*Integration audit: 2026-03-20*
