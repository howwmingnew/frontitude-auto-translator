# Phase 3: AI Context Generation - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform raw code search results (from Phase 2) into human-readable context descriptions using AI, and inject those descriptions into translation prompts for higher-quality results. This phase delivers the context generation pipeline and prompt modification -- mode toggle UI and context display panels are Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Context Generation Strategy
- Timing: batch generation BEFORE translation starts (search all keys -> generate all contexts -> translate all keys, three distinct phases)
- Batching: 10-20 keys per API call, send code snippets in bulk and get back descriptions in bulk
- Output format: 1-2 sentence natural language description per key (e.g., "Button label on the login settings screen")
- Caching: store generated descriptions back into Phase 2's contextCache Map (extend the existing result object with a `description` field), same session = no re-generation
- Language: generate in the current app UI language (EN/zh-TW/ko) -- context descriptions will be shown to users in Phase 4's context panel, so they must follow the interface language. English-only applies to internal batch translation text the user never sees.

### Translation Prompt Injection
- Format: change from JSON string array to JSON object array when context is available
  - Without context: `["text1", "text2"]` (existing behavior)
  - With context: `[{"text": "text1", "context": "AI description"}, {"text": "text2", "context": ""}]`
  - Response format unchanged: AI returns `["translated1", "translated2"]`
- No-context keys: use empty string `""` for the context field -- no special handling needed
- Dual context: global `contextPrompt` (user-defined domain hint) stays in system prompt, per-key `context` field provides fine-grained usage info. Both coexist.
- Only AI descriptions in prompt: do NOT include raw code snippets or file paths in translation prompt -- the AI-generated description already condenses that information

### Provider Selection
- Context generation uses the SAME provider and API key as translation (follows `s.provider` and `s.apiKey`)
- DeepL + precise mode: allowed but context generation is SKIPPED entirely -- translates directly without context (equivalent to quick mode behavior). The incompatibility notice is Phase 4 UX work (UEXP-03).
- Only OpenAI and Gemini can generate context descriptions and accept per-key context in translation prompts

### Error Handling & Quality
- Context generation failure (API error, timeout): skip that key's context, continue with remaining keys. Failed keys translate with empty context (equivalent to quick mode).
- No quality validation of AI-generated descriptions -- use directly as-is. Context is auxiliary info, not critical to translation correctness.
- Single key failure does NOT block the batch (aligns with UEXP-05 requirement)

### Claude's Discretion
- Exact prompt wording for context generation (system prompt that takes code snippets and returns descriptions)
- Batch size optimization within the 10-20 range
- How to structure the context generation API call (format of input/output)
- Error retry strategy for context generation (retry count, backoff timing)
- Whether to add the `description` field to the existing contextCache result object or create a parallel structure

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 2 Implementation (must read actual code)
- `js/search.js` -- Search pipeline, contextCache Map, result data structure `{ key, matches: [{ file, line, snippet }], searchedAt }`, batch search with concurrency limiter
- `js/providers.js` -- callOpenAI/callGemini prompt structure, fetchWithTimeout, existing contextPrompt injection pattern
- `js/translation.js` -- startTranslation() batch flow, 10-text batches, progress display pattern, callTranslateAPI dispatch

### State & Architecture
- `js/state.js` -- App.getState()/setState() immutable state pattern
- `js/constants.js` -- PROVIDER_CONFIG, language helpers, TRANSLATION_RULES

### Prior Phase Context
- `.planning/phases/01-infrastructure/01-CONTEXT.md` -- IIFE + window.App namespace, localStorage patterns
- `.planning/phases/02-code-search-pipeline/02-CONTEXT.md` -- Search result structure, cache strategy, batch search design

### Requirements
- `.planning/REQUIREMENTS.md` -- ACTX-01 (AI context generation), ACTX-02 (prompt injection)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `App.searchBatchContext(keys, onProgress)`: Batch search with concurrency limiter and progress callback -- context generation can follow the same pattern
- `App.callOpenAI(texts, targetLang)` / `App.callGemini(texts, targetLang)`: Existing LLM API call patterns -- context generation needs similar but different prompt structure
- `App.fetchWithTimeout(url, options)`: HTTP client with timeout for all API calls
- `contextCache` Map in search.js: Already caches search results per key -- extend with `description` field after generation

### Established Patterns
- IIFE + `window.App` namespace: New context generation module follows same pattern (e.g., `js/context.js`)
- Batch processing with progress: `searchBatchContext` and `startTranslation` both use progress callbacks -- context generation should too
- `JSON.parse(JSON.stringify())` for deep clone before mutation
- `App.setState(patch)` for immutable state updates

### Integration Points
- `js/translation.js` startTranslation(): Must be modified to insert context generation phase between search and translate
- `js/providers.js` callOpenAI/callGemini: Must be modified to accept per-key context and switch prompt format (JSON object array vs string array)
- `js/search.js` contextCache: Extended with `description` field after AI generation
- `js/app.js` init(): Wire up context generation module
- `index.html` script tags: Add new `js/context.js` between search.js and translation.js in load order

</code_context>

<specifics>
## Specific Ideas

- Three-phase pipeline in precise mode: search -> generate descriptions -> translate (each with its own progress indicator, but Phase 4 handles progress UI)
- Context generation prompt should emphasize producing descriptions a non-engineer translator can understand -- "Button label" not "UIButton.Content binding"
- The JSON object array prompt format maintains backward compatibility: when no context is available, the prompt falls back to plain JSON string array (existing behavior)
- DeepL precise mode graceful degradation: no error, just silently skips context steps

</specifics>

<deferred>
## Deferred Ideas

- Quality validation of AI-generated context -- could add basic format checking if issues arise
- Translation edit feedback loop (CTXE-01) -- v2 requirement
- Context confidence indicator (CTXE-02) -- v2 requirement

</deferred>

---

*Phase: 03-ai-context-generation*
*Context gathered: 2026-03-21*
