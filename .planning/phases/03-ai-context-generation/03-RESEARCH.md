# Phase 3: AI Context Generation - Research

**Researched:** 2026-03-21
**Domain:** LLM prompt engineering for code-to-description generation + translation prompt augmentation
**Confidence:** HIGH

## Summary

Phase 3 bridges the raw code search results from Phase 2 into human-readable context descriptions via OpenAI/Gemini, then injects those descriptions into translation prompts. The technical domain is well-constrained: no new dependencies, no build tools, same IIFE + window.App patterns. The work splits cleanly into (1) a new `js/context.js` module that batch-generates descriptions from code snippets, and (2) modifications to `js/providers.js` to accept per-key context in translation prompts.

The existing codebase provides strong patterns to follow: `searchBatchContext()` in `search.js` demonstrates batch processing with concurrency limiter and progress callbacks; `callOpenAI()`/`callGemini()` in `providers.js` demonstrate LLM API call patterns with error handling. The context generation module needs similar but different prompt structures -- it asks the LLM to describe code usage rather than translate text.

**Primary recommendation:** Create `js/context.js` as an IIFE module exporting `App.generateBatchContext(keys, onProgress)` that reuses the concurrency limiter pattern from `search.js`, calls the same provider API endpoints, and stores descriptions back into the existing `contextCache` Map entries. Modify `callOpenAI()`/`callGemini()` to detect when texts are objects with `context` fields and switch prompt format accordingly.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Timing: batch generation BEFORE translation starts (search all keys -> generate all contexts -> translate all keys, three distinct phases)
- Batching: 10-20 keys per API call, send code snippets in bulk and get back descriptions in bulk
- Output format: 1-2 sentence natural language description per key (e.g., "Button label on the login settings screen")
- Caching: store generated descriptions back into Phase 2's contextCache Map (extend the existing result object with a `description` field), same session = no re-generation
- Language: always generate in English -- context descriptions are primarily for AI translation consumption, not human display
- Translation prompt format change: JSON string array to JSON object array when context is available
  - Without context: `["text1", "text2"]` (existing behavior)
  - With context: `[{"text": "text1", "context": "AI description"}, {"text": "text2", "context": ""}]`
  - Response format unchanged: AI returns `["translated1", "translated2"]`
- No-context keys: use empty string `""` for the context field
- Dual context: global `contextPrompt` stays in system prompt, per-key `context` provides fine-grained usage info
- Only AI descriptions in prompt: do NOT include raw code snippets or file paths
- Context generation uses SAME provider and API key as translation
- DeepL + precise mode: context generation SKIPPED entirely -- translates directly without context
- Error handling: context generation failure skips that key, continues with remaining. Failed keys translate with empty context.
- No quality validation of AI-generated descriptions -- use directly as-is
- Single key failure does NOT block the batch

### Claude's Discretion
- Exact prompt wording for context generation (system prompt that takes code snippets and returns descriptions)
- Batch size optimization within the 10-20 range
- How to structure the context generation API call (format of input/output)
- Error retry strategy for context generation (retry count, backoff timing)
- Whether to add the `description` field to the existing contextCache result object or create a parallel structure

### Deferred Ideas (OUT OF SCOPE)
- Context description in app UI language (EN/zh-TW/ko) -- could be added later
- Quality validation of AI-generated context
- Translation edit feedback loop (CTXE-01) -- v2 requirement
- Context confidence indicator (CTXE-02) -- v2 requirement
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ACTX-01 | Use AI (OpenAI/Gemini) to generate non-engineer-readable context descriptions from code snippets, in the app interface language (EN/zh-TW/ko) | Context generation module (`js/context.js`) with batch LLM calls. NOTE: CONTEXT.md locked decision overrides the requirement's language clause -- always generate in English. The requirement text says "follow app interface language" but the user explicitly decided "always generate in English" |
| ACTX-02 | Inject context information (file name, code snippet, AI description) into translation prompt to improve translation accuracy | Modified `callOpenAI()`/`callGemini()` in `providers.js` to accept JSON object array with per-key context field alongside existing global contextPrompt |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS (IIFE) | ES5 + async/await | All implementation | Project convention -- no npm, no bundler |
| OpenAI Chat API | v1 | Context generation + translation | Already integrated in `providers.js` |
| Gemini generateContent API | v1beta | Context generation + translation | Already integrated in `providers.js` |

### Supporting
No new libraries needed. This phase reuses existing infrastructure:
- `App.fetchWithTimeout()` for HTTP calls
- `App.getState()`/`App.setState()` for state management
- `contextCache` Map from `search.js` for caching descriptions

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Same provider for context gen | Separate cheaper model | Adds complexity of managing two API keys; user decided same provider |
| JSON object array format | Separate system prompt per key | Extremely wasteful API calls; batch approach is 10-20x more efficient |

## Architecture Patterns

### New File Placement
```
js/
  ...
  search.js          # Phase 2 -- code search, contextCache
  context.js          # NEW Phase 3 -- AI context generation (between search.js and app.js)
  ...
  app.js              # Entry point -- add initContext() call
```

Script load order in `index.html` -- `js/context.js` must load AFTER `search.js` (needs contextCache access) and AFTER `providers.js` (needs API helpers), but BEFORE `app.js`:
```html
<script src="js/search.js"></script>
<script src="js/context.js"></script>   <!-- NEW -->
<script src="js/app.js"></script>
```

### Pattern 1: Batch Context Generation
**What:** Send 10-15 keys with their code snippets to LLM, get back structured descriptions
**When to use:** After `searchBatchContext()` completes, before `startTranslation()` begins
**Example:**
```javascript
// context.js -- follows same IIFE pattern as search.js
(function () {
  'use strict';
  var App = window.App;
  var BATCH_SIZE = 15;

  async function generateBatchContext(keys, onProgress) {
    var s = App.getState();
    // Skip for DeepL -- cannot generate context descriptions
    if (s.provider === 'deepl') { return; }

    var cache = App.getContextCache();
    // Filter to keys that have search results but no description yet
    var keysNeedingContext = keys.filter(function (key) {
      var cached = cache.get(key);
      return cached && cached.matches.length > 0 && !cached.description;
    });

    if (keysNeedingContext.length === 0) { return; }

    var completed = 0;
    for (var i = 0; i < keysNeedingContext.length; i += BATCH_SIZE) {
      var batch = keysNeedingContext.slice(i, i + BATCH_SIZE);
      try {
        var descriptions = await callContextGeneration(batch, cache);
        // Store descriptions back into cache
        for (var j = 0; j < batch.length; j++) {
          var entry = cache.get(batch[j]);
          if (entry && descriptions[j]) {
            entry.description = descriptions[j];
          }
        }
      } catch (err) {
        // Skip failed batch -- keys translate without context
      }
      completed += batch.length;
      if (onProgress) {
        onProgress({ completed: completed, total: keysNeedingContext.length });
      }
    }
  }

  App.generateBatchContext = generateBatchContext;
})();
```

### Pattern 2: Translation Prompt Augmentation
**What:** Modify `callOpenAI()`/`callGemini()` to accept texts-with-context
**When to use:** When context descriptions are available for any key in the batch
**Example:**
```javascript
// In providers.js -- modified callOpenAI signature
async function callOpenAI(texts, targetLang, contexts) {
  var s = App.getState();
  var langName = App.langCodeToName(targetLang);
  var contextPrefix = s.contextPrompt.trim()
    ? 'The content is from: ' + s.contextPrompt.trim() + '. '
    : '';

  // Build user content: object array if any context exists, string array otherwise
  var hasAnyContext = contexts && contexts.some(function (c) { return c !== ''; });
  var userContent;
  if (hasAnyContext) {
    userContent = JSON.stringify(texts.map(function (text, idx) {
      return { text: text, context: (contexts && contexts[idx]) || '' };
    }));
  } else {
    userContent = JSON.stringify(texts);
  }
  // ... rest of API call with modified system prompt mentioning context field
}
```

### Pattern 3: Three-Phase Pipeline Integration
**What:** Modify `startTranslation()` to insert context generation between search and translate
**When to use:** In precise mode (when Bitbucket is connected and provider is OpenAI/Gemini)
**Example:**
```javascript
// In translation.js -- modified startTranslation()
async function startTranslation() {
  var s = App.getState();
  // ... existing setup ...

  // Phase A: Search (if precise mode)
  if (s.bitbucketConnected && s.provider !== 'deepl') {
    await App.searchBatchContext(keysToSearch, onSearchProgress);
  }

  // Phase B: Generate context descriptions (if precise mode)
  if (s.bitbucketConnected && s.provider !== 'deepl') {
    await App.generateBatchContext(keysToSearch, onContextProgress);
  }

  // Phase C: Translate (existing logic, modified to pass context)
  // ... existing translation loop, but pass context from cache ...
}
```

### Anti-Patterns to Avoid
- **Mutating contextCache entries directly:** The user decision says to extend cache entries with `description` field. Since these are plain objects inside a Map, direct mutation is acceptable here (they are not part of App.state). Do NOT deep-clone the entire Map just to add a field.
- **Including raw code in translation prompt:** Decision explicitly says only AI-generated descriptions go in the prompt, not raw snippets or file paths.
- **Separate API keys for context gen:** Must use same provider/key as translation.
- **Blocking on context failure:** A failed context generation for one batch must not prevent other batches or translation from proceeding.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP requests with timeout | Custom fetch wrapper | `App.fetchWithTimeout()` | Already handles AbortController, timeout, error messages |
| API response parsing | Custom JSON parser | `parseJSONArrayResponse()` in providers.js | Already strips markdown fences, validates array type |
| Concurrency control | Manual promise queue | `createConcurrencyLimiter()` from search.js | Battle-tested, handles queue draining correctly |
| Retry with backoff | Custom retry loop | `withRetry()` from search.js | Already handles rate limiting with Retry-After headers |

**Key insight:** The search.js module already solved concurrency, retry, and progress reporting patterns. Context generation should reuse these utilities, not rebuild them. Consider exporting `createConcurrencyLimiter` and `withRetry` to `App.*` namespace for reuse.

## Common Pitfalls

### Pitfall 1: LLM returning wrong number of descriptions
**What goes wrong:** When sending 15 keys in a batch, the LLM might return 14 or 16 descriptions, making index-based mapping unreliable.
**Why it happens:** LLMs can merge similar items or split long descriptions.
**How to avoid:** Use a keyed input/output format in the context generation prompt (send `{"key": "...", "snippets": [...]}` objects, expect `{"key": "...", "description": "..."}` back). Alternatively, include explicit count in prompt and validate response length. If mismatch, discard the batch (no context is better than wrong context).
**Warning signs:** Translation results misaligned with keys.

### Pitfall 2: Context generation consuming excessive API quota
**What goes wrong:** For a large JSON file with 500 keys, context generation alone could make 33+ API calls (at 15 keys/batch), doubling the total API cost.
**Why it happens:** Context generation is an additional LLM call on top of translation.
**How to avoid:** The session-level caching (description stored in contextCache) prevents re-generation within the same session. Batch size of 15 is a good balance -- smaller batches increase calls, larger batches risk token limits and quality degradation.
**Warning signs:** Users complaining about API costs or slow precise mode.

### Pitfall 3: Code snippets exceeding token limits
**What goes wrong:** Some keys may have many matches across files, producing very long snippet lists. Sending all of them to the LLM can exceed input token limits.
**Why it happens:** A common key used in 10+ XAML files produces substantial snippet volume.
**How to avoid:** Truncate snippets to a reasonable limit per key (e.g., first 3 matches, max 500 chars per match). The AI description should capture the gist -- it does not need every occurrence.
**Warning signs:** API errors about token limits, or context generation timing out.

### Pitfall 4: Modifying callOpenAI/callGemini signature breaks existing callers
**What goes wrong:** Adding a `contexts` parameter to `callOpenAI(texts, targetLang)` could break `callTranslateAPI()`, `testApiKey()`, and `cell-edit.js` single-cell translate.
**Why it happens:** Multiple call sites depend on the existing 2-parameter signature.
**How to avoid:** Make `contexts` an optional third parameter with default behavior of `undefined`/`null`. When not provided, existing JSON string array behavior is preserved exactly. Test with `testApiKey()` to verify backward compatibility.
**Warning signs:** Test API Key button breaks, single-cell translate breaks.

### Pitfall 5: Gemini prompt structure differs from OpenAI
**What goes wrong:** Context generation prompt works for OpenAI but fails for Gemini because Gemini uses `contents[].parts[].text` format, not `messages[].content`.
**Why it happens:** Different API structures between providers.
**How to avoid:** Create provider-specific context generation functions (or a dispatcher) that mirrors the existing `callOpenAI()`/`callGemini()` pattern. Do not assume a single prompt format works for both.
**Warning signs:** Context generation works with one provider but returns errors with the other.

## Code Examples

### Context Generation Prompt Design
```javascript
// Recommended prompt for context generation
// Input: batch of keys with their code snippets
// Output: JSON array of descriptions

var systemPrompt = 'You are a UI context analyzer. '
  + 'Given translation keys and code snippets showing where each key is used in a WPF desktop application, '
  + 'generate a brief 1-2 sentence description of HOW and WHERE each key is used in the UI. '
  + 'Describe in terms a non-engineer translator would understand '
  + '(e.g., "Button label on the login screen", "Error message shown when file upload fails", '
  + '"Column header in the patient list table"). '
  + 'Return ONLY a JSON array of strings in the same order as the input keys. '
  + 'If a snippet is unclear, provide your best guess based on the key name and surrounding code.';

// User content format -- array of objects
var userContent = JSON.stringify(batchKeys.map(function (key) {
  var cached = cache.get(key);
  var snippetText = cached.matches.slice(0, 3).map(function (m) {
    return m.file + ': ' + m.snippet.substring(0, 300);
  }).join('\n---\n');
  return { key: key, snippets: snippetText };
}));
```

### Translation Prompt Modification (OpenAI)
```javascript
// Modified system prompt when context is available
var systemContent = 'You are a professional translator. ' + contextPrefix
  + 'Translate the following items from English to ' + langName + '. '
  + 'Each item has a "text" to translate and optionally a "context" describing where it appears in the UI. '
  + 'Use the context to choose the most appropriate translation for the usage scenario. '
  + 'Return ONLY a JSON array of translated strings in the same order. '
  + 'Do not add explanations.' + App.TRANSLATION_RULES;

// User content: array of {text, context} objects
var userContent = JSON.stringify(texts.map(function (text, idx) {
  return { text: text, context: contexts[idx] || '' };
}));
```

### Translation Prompt Modification (Gemini)
```javascript
// Gemini uses single-part text format -- combine system + user
var fullPrompt = 'You are a professional translator. ' + contextPrefix
  + 'Translate the following items from English to ' + langName + '. '
  + 'Each item has a "text" to translate and optionally a "context" describing where it appears in the UI. '
  + 'Use the context to choose the most appropriate translation for the usage scenario. '
  + 'Return ONLY a JSON array of translated strings in the same order. '
  + 'Do not add explanations.' + App.TRANSLATION_RULES
  + '\n\n' + JSON.stringify(texts.map(function (text, idx) {
    return { text: text, context: contexts[idx] || '' };
  }));
```

### Reusable Utilities Export Pattern
```javascript
// In search.js -- export utilities for reuse by context.js
App._createConcurrencyLimiter = createConcurrencyLimiter;
App._withRetry = withRetry;
```

### Integration in startTranslation()
```javascript
// In translation.js -- pass context to callTranslateAPI
function callTranslateAPI(texts, targetLang, contexts) {
  var s = App.getState();
  switch (s.provider) {
    case 'openai': return callOpenAI(texts, targetLang, contexts);
    case 'gemini': return callGemini(texts, targetLang, contexts);
    default:       return callDeepL(texts, App.mapToDeepLLang(targetLang));
    // DeepL ignores contexts entirely
  }
}

// In translation loop -- extract contexts from cache for each batch
var batchContexts = batchKeys.map(function (key) {
  var cached = App.getContextCache().get(key);
  return (cached && cached.description) || '';
});
var translated = await App.callTranslateAPI(batch, lang, batchContexts);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Plain text array to LLM | Structured object array with context | This phase | Better translation quality for UI-specific terms |
| Global context only | Global + per-key context | This phase | Fine-grained translation control |
| Direct translation | Search -> Describe -> Translate pipeline | This phase | Three-phase flow in precise mode |

## Open Questions

1. **Batch size optimization (10 vs 15 vs 20)**
   - What we know: Decision allows 10-20 range. Smaller = more API calls, larger = risk of token limits and quality degradation.
   - What's unclear: Optimal size depends on average snippet length, which varies per project.
   - Recommendation: Start with 15. Each key contributes roughly key name (30 chars) + 3 snippets * 300 chars = ~930 chars. At 15 keys, that is ~14K chars input, well within token limits for both OpenAI and Gemini models.

2. **Should `createConcurrencyLimiter` and `withRetry` be exported from search.js?**
   - What we know: Context.js needs the same utilities. They are currently scoped inside search.js IIFE.
   - What's unclear: Whether to export them as `App._createConcurrencyLimiter` (underscore = internal) or duplicate them.
   - Recommendation: Export them. Duplication creates maintenance burden. Use underscore prefix convention to signal internal-use helpers.

3. **Retry strategy for context generation**
   - What we know: search.js uses `withRetry(fn, 3, 1000)` with exponential backoff for rate limits.
   - What's unclear: Whether context generation should be more aggressive with retries (AI calls are expensive) or less (fail fast is OK since context is auxiliary).
   - Recommendation: Use 2 retries (lower than search's 3) since context is auxiliary and failure just means translating without context. Base delay 1000ms, exponential.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual browser testing (no test framework detected) |
| Config file | none -- pure static web app with no npm |
| Quick run command | Open `http://localhost:8080` in browser, use DevTools console |
| Full suite command | Manual verification of all scenarios below |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACTX-01 | Given code snippets, generates 1-2 sentence English descriptions via LLM | manual-only | Open DevTools, trigger precise translate, inspect `App.getContextCache()` entries for `description` field | N/A |
| ACTX-02 | Translation prompt includes per-key context as JSON object array | manual-only | Open DevTools Network tab, inspect request payload to OpenAI/Gemini during translation with context | N/A |

**Manual-only justification:** This is a pure static web app with no npm, no test runner, no build step. All testing requires a browser with real API keys and a connected Bitbucket workspace. Automated testing would require introducing a test framework, which is out of scope for this phase.

### Sampling Rate
- **Per task commit:** Manual browser test -- trigger context generation, verify descriptions in console
- **Per wave merge:** Full flow test -- upload JSON, connect Bitbucket, run precise translation, compare results with/without context
- **Phase gate:** Verify both ACTX-01 and ACTX-02 via DevTools inspection

### Wave 0 Gaps
None -- no test infrastructure to set up (manual testing only per project conventions).

## Sources

### Primary (HIGH confidence)
- `js/providers.js` -- Existing OpenAI/Gemini API call patterns, prompt structure, error handling
- `js/search.js` -- contextCache Map structure, concurrency limiter, batch search with progress, retry logic
- `js/translation.js` -- startTranslation() flow, batch loop, progress reporting
- `js/constants.js` -- TRANSLATION_RULES, PROVIDER_CONFIG, model lists
- `js/state.js` -- State shape, getState/setState pattern
- `03-CONTEXT.md` -- All locked decisions from user discussion

### Secondary (MEDIUM confidence)
- OpenAI Chat Completions API documentation -- message format, system/user roles (verified against existing `callOpenAI()` implementation)
- Gemini generateContent API documentation -- contents/parts format (verified against existing `callGemini()` implementation)

### Tertiary (LOW confidence)
- Optimal batch size of 15 -- based on token estimation, needs real-world validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, reuses existing patterns entirely
- Architecture: HIGH - Follows established IIFE + App namespace patterns, clear integration points identified
- Pitfalls: HIGH - Based on direct code analysis of existing codebase and known LLM behavior patterns
- Prompt design: MEDIUM - Prompt wording is reasonable but optimal phrasing requires real-world testing

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable -- no external dependencies to change)
