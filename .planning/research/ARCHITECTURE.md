# Architecture Patterns

**Domain:** Context-aware translation tool with Bitbucket integration
**Researched:** 2026-03-20

## Critical Constraint: CORS

Bitbucket Cloud API does **not** reliably support CORS for browser-based requests. Direct `fetch()` from a static web app to `api.bitbucket.org` will be blocked by the browser.

**Confidence:** HIGH -- Multiple community reports confirm this. Atlassian's official stance is ambiguous but practical evidence is clear.

**Impact:** This is the single most important architectural decision for this milestone. The app currently calls DeepL/OpenAI/Gemini directly from the browser (those APIs return proper CORS headers). Bitbucket does not, so a proxy layer is required.

### Recommended Solution: Cloudflare Worker as CORS Proxy

Use a Cloudflare Worker (free tier: 100K requests/day) as a thin CORS proxy. The Worker forwards requests to `api.bitbucket.org` with the user's Bearer token and adds `Access-Control-Allow-Origin` headers to the response.

**Why Cloudflare Worker over alternatives:**

| Option | Verdict | Reason |
|--------|---------|--------|
| Cloudflare Worker | **USE THIS** | Free tier sufficient, deploys in minutes, no server to maintain, pairs with GitHub Pages |
| Netlify/Vercel serverless function | Viable alternative | Requires migrating off GitHub Pages or running separate deployment |
| Self-hosted proxy server | Overkill | Adds infrastructure burden for what is a header-forwarding task |
| Browser extension to disable CORS | Dev-only | Not a production solution |

The Worker is ~30 lines of code. It validates that requests only go to `api.bitbucket.org`, forwards headers, and adds CORS headers to responses.

**Confidence:** HIGH for the CORS problem. MEDIUM for Cloudflare Worker specifically (it is the most popular free-tier solution but alternatives work too).

## File Split Strategy

The current `index.html` is 3,458 lines (1,566 lines CSS/HTML + 1,892 lines JS in a single IIFE). Adding Bitbucket integration, context extraction, and AI description generation would push it past 5,000+ lines -- unmaintainable.

### Recommended: ES Modules with `<script type="module">`

Split into native ES modules loaded via `<script type="module">`. No build step required. All modern browsers support this natively.

**Why ES modules over alternatives:**

| Option | Verdict | Reason |
|--------|---------|--------|
| ES Modules (native) | **USE THIS** | Zero build step, native browser support, proper dependency graph |
| Multiple `<script>` tags (non-module) | Fragile | Load order dependencies, global scope pollution, no import/export |
| Bundler (Vite/Rollup) | Unnecessary | Adds build step complexity the project explicitly avoids |
| Web Components | Over-engineered | No component reuse need; this is a single-page tool |

### Proposed File Structure

```
index.html                     -- Shell: HTML markup + CSS + <script type="module" src="js/app.js">
css/
  styles.css                   -- Extracted from index.html <style> block
js/
  app.js                       -- Entry point: imports modules, initializes app
  state.js                     -- State object + setState() + event bus
  i18n.js                      -- UI_TRANSLATIONS + t() helper + applyI18n()
  dom.js                       -- DOM ref cache
  ui/
    theme.js                   -- Theme toggle
    toast.js                   -- Toast notifications
    sidebar.js                 -- Sidebar drawer
    editor-table.js            -- Content Preview table rendering
    cell-edit-modal.js         -- Cell edit overlay
    progress.js                -- Progress bar + chips
    upload.js                  -- File upload handling
    language-selector.js       -- Target language grid
    translate-confirm.js       -- Translation confirmation dialog
  providers/
    provider-config.js         -- PROVIDER_CONFIG, model lists
    deepl.js                   -- callDeepL()
    openai.js                  -- callOpenAI()
    gemini.js                  -- callGemini()
    api-helpers.js             -- fetchWithTimeout(), handleAPIError()
  translation/
    translate-engine.js        -- startTranslation(), callTranslateAPI() dispatcher
    prompt-builder.js          -- System prompt construction (existing + context-aware)
  bitbucket/                   -- NEW: all Bitbucket integration
    bitbucket-client.js        -- API client (auth, proxy URL, request helper)
    code-search.js             -- Search for key usage in repo
    context-extractor.js       -- Parse search results, extract surrounding code
    context-cache.js           -- In-memory cache for session (avoid re-querying)
  context/                     -- NEW: context-to-prompt pipeline
    context-describer.js       -- AI call to generate human-readable description
    context-panel.js           -- UI panel showing context + code snippets
    context-prompt-injector.js -- Merge code context into translation prompt
```

**Migration strategy:** Extract incrementally. Start with the new Bitbucket modules (they are greenfield). Then extract existing code module-by-module, testing after each extraction. The IIFE can coexist with ES modules during migration -- expose a global `window.AppState` bridge temporarily.

**Confidence:** HIGH -- ES modules without build step is well-established and used by many static apps.

## Component Architecture

### Component Boundaries

| Component | Responsibility | Inputs | Outputs | Communicates With |
|-----------|---------------|--------|---------|-------------------|
| **BitbucketClient** | HTTP communication with Bitbucket API via CORS proxy | Access token, workspace, repo slug | Raw API responses | CORS Proxy (Cloudflare Worker) |
| **CodeSearch** | Search for i18n key usage in .xaml/.cs files | Key name(s), file extensions filter | Search result objects (file path, matched lines, line numbers) | BitbucketClient |
| **ContextExtractor** | Parse search results into structured context | Raw search results | `{ key, filePath, surroundingCode, uiElementType }` | CodeSearch |
| **ContextDescriber** | Generate human-readable context description via AI | Structured context, app UI language | Natural language description string | OpenAI/Gemini (reuses existing provider) |
| **ContextPanel** | Render expandable panel in Content Preview table | Context data for a key | DOM updates (panel open/close) | ContextExtractor, ContextDescriber |
| **ContextPromptInjector** | Merge code context into translation system prompt | Key contexts, existing prompt | Enhanced system prompt string | PromptBuilder |
| **TranslateEngine** | Orchestrate translation (existing, extended) | Keys, target langs, mode (fast/precise) | Translated texts | ContextPromptInjector, Provider APIs |
| **PromptBuilder** | Construct system/user prompts for LLM providers | Context prompt, key contexts, target lang | Prompt strings | TranslateEngine |
| **ContextCache** | In-memory session cache for fetched contexts | Key lookups | Cached context objects | CodeSearch |

### Component Dependency Graph (Build Order)

```
Layer 0 (no dependencies, build first):
  state.js, dom.js, i18n.js, api-helpers.js

Layer 1 (depends on Layer 0):
  BitbucketClient (depends on: api-helpers, state for token)
  provider-config.js

Layer 2 (depends on Layer 1):
  CodeSearch (depends on: BitbucketClient)
  deepl.js, openai.js, gemini.js (depend on: api-helpers, provider-config)

Layer 3 (depends on Layer 2):
  ContextExtractor (depends on: CodeSearch)
  ContextCache (depends on: CodeSearch)

Layer 4 (depends on Layer 3):
  ContextDescriber (depends on: ContextExtractor, openai/gemini)
  PromptBuilder (depends on: ContextExtractor)

Layer 5 (depends on Layer 4):
  ContextPromptInjector (depends on: PromptBuilder, ContextExtractor)
  ContextPanel (depends on: ContextExtractor, ContextDescriber)

Layer 6 (depends on Layer 5):
  TranslateEngine (depends on: ContextPromptInjector, providers)
  editor-table.js (depends on: ContextPanel for expandable rows)
```

## Data Flow

### Flow 1: Bitbucket Context Fetching (Precise Mode)

```
User clicks "Translate (Precise)"
  |
  v
TranslateEngine identifies untranslated keys
  |
  v
For each untranslated key, check ContextCache
  |-- Cache hit --> use cached context
  |-- Cache miss:
      |
      v
    CodeSearch calls Bitbucket API via CORS proxy:
      GET /2.0/workspaces/{workspace}/search/code
        ?search_query="{key}"+ext:xaml+ext:cs+repo:{repo}
      (via Cloudflare Worker proxy)
      |
      v
    ContextExtractor parses search results:
      - Extracts file path
      - Extracts matched line + N surrounding lines
      - Identifies UI element type from XAML context
        (Button, Label, TextBlock, MenuItem, etc.)
      |
      v
    ContextCache stores result
      |
      v
    ContextDescriber sends context to AI:
      "Given this code context, describe in {appLang}
       where this UI text appears and what it does.
       Keep it under 2 sentences."
      (Reuses user's existing OpenAI/Gemini key)
      |
      v
    Result: { key, files: [...], uiElement, description }
  |
  v
ContextPromptInjector builds enhanced prompt:
  Existing system prompt +
  "For key '{key}': This text appears on a {uiElement}
   in {filePath}. Context: {description}"
  |
  v
Provider API call with context-enriched prompt
  |
  v
Translation result displayed in Content Preview
```

### Flow 2: Key Context Panel (User Clicks Key)

```
User clicks key name in Content Preview table
  |
  v
ContextPanel opens expandable row below the key
  |
  v
Check ContextCache for this key
  |-- Hit --> render immediately
  |-- Miss --> show loading spinner
      |
      v
    CodeSearch + ContextExtractor + ContextDescriber
    (same pipeline as Flow 1)
      |
      v
    ContextPanel renders:
      - AI-generated description (in app language)
      - Code snippets with syntax highlighting (basic)
      - File path links
      - Editable translation field
```

### Flow 3: Fast Translation (No Context)

```
User clicks "Translate (Fast)"
  |
  v
TranslateEngine skips context fetching entirely
  |
  v
Uses existing prompt (user context prompt only)
  |
  v
Same flow as current app (unchanged)
```

## Bitbucket API Usage Pattern

### Code Search Endpoint

```
GET https://api.bitbucket.org/2.0/workspaces/{workspace}/search/code
  ?search_query={key_name}+ext:xaml+ext:cs+repo:{repo_slug}
  &fields=+values.file.commit.repository,+values.content_matches
Authorization: Bearer {access_token}
```

**Confidence:** MEDIUM -- The endpoint pattern is documented but the exact `ext:` modifier support for Bitbucket Cloud code search needs validation during implementation. The blog post confirms `repo:` modifier works. File extension filtering may need `path:*.xaml` syntax instead.

### File Content Endpoint (Fallback)

If code search does not return enough surrounding context, fetch the full file:

```
GET https://api.bitbucket.org/2.0/repositories/{workspace}/{repo}/src/{branch}/{path}
Authorization: Bearer {access_token}
```

Then extract context client-side by finding the key and capturing surrounding lines.

### Rate Limiting Strategy

Bitbucket Cloud API has rate limits (typically 1,000 requests/hour for authenticated requests).

- **Batch key lookups:** Search for multiple keys in a single query where possible (e.g., `"key1" OR "key2"`)
- **Only query untranslated keys:** Skip keys that already have translations
- **Cache aggressively:** Store results in ContextCache for the session duration
- **Fail gracefully:** If rate limited, fall back to Fast mode for remaining keys

## Cloudflare Worker Proxy Architecture

```
Browser (GitHub Pages)
  |
  | fetch('https://your-proxy.workers.dev/bitbucket/...')
  v
Cloudflare Worker
  |-- Validates: URL must target api.bitbucket.org
  |-- Forwards: Authorization header from request
  |-- Adds: Access-Control-Allow-Origin: *
  |-- Returns: Bitbucket API response with CORS headers
  |
  v
api.bitbucket.org
```

The proxy URL is configurable in the app (stored in localStorage alongside other settings). This keeps the Worker deployment independent of the app.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Fetching Context for All Keys
**What:** Querying Bitbucket for every key in the JSON, including already-translated ones.
**Why bad:** Wastes API quota. A typical language.json has 500+ keys; querying all would hit rate limits.
**Instead:** Only fetch context for untranslated keys (keys where target language value is empty/missing).

### Anti-Pattern 2: Sequential API Calls per Key
**What:** Awaiting each Bitbucket search before starting the next.
**Why bad:** 100 keys x 500ms/request = 50 seconds of serial waiting.
**Instead:** Batch concurrent requests with a concurrency limiter (e.g., 5 parallel requests). Use `Promise.all()` with chunked arrays.

### Anti-Pattern 3: Mixing Proxy Logic with App Logic
**What:** Putting Bitbucket-specific request transformation in the Cloudflare Worker.
**Why bad:** Couples the proxy to this specific app. Makes the proxy harder to maintain.
**Instead:** Keep the Worker as a dumb CORS proxy. All business logic (query construction, response parsing) stays in the browser app.

### Anti-Pattern 4: Deep Module Coupling During Migration
**What:** Trying to extract all 3,458 lines into modules in one big refactor.
**Why bad:** High risk of breaking existing functionality. No incremental testing possible.
**Instead:** Build new Bitbucket modules as standalone ES modules first. Extract existing code gradually, one concern at a time, with the IIFE bridge pattern.

## Scalability Considerations

| Concern | 50 keys (small file) | 500 keys (typical) | 2000 keys (large) |
|---------|---------------------|--------------------|--------------------|
| Bitbucket queries | ~10 searches (batched) | ~100 searches | ~400 searches (may hit rate limit) |
| Context fetch time | ~5s | ~30s | ~2min (needs progress UI) |
| Memory (cached contexts) | Negligible | ~2MB | ~8MB (fine for browser) |
| AI description calls | ~10 | ~100 | ~400 (costly, consider optional) |

For large files (2000+ keys), consider making AI description generation optional or only generating descriptions for keys the user explicitly expands in the ContextPanel.

## State Management Extension

The existing `state` object needs new fields for Bitbucket integration:

```javascript
// New state fields (added via setState)
{
  // Bitbucket connection
  bitbucketToken: '',        // Repository Access Token
  bitbucketWorkspace: '',    // Workspace slug
  bitbucketRepo: '',         // Repository slug
  bitbucketBranch: 'main',   // Branch to search
  proxyUrl: '',              // Cloudflare Worker URL

  // Context data
  keyContexts: {},           // { [key]: { files, uiElement, description, status } }
  contextFetchProgress: 0,   // 0-100 for progress bar
  translateMode: 'fast',     // 'fast' | 'precise'
}
```

These follow the existing immutable `setState(patch)` pattern. No architectural change to state management needed.

## Build Order Implications for Roadmap

Based on the dependency graph, the recommended build order is:

1. **CORS Proxy (Cloudflare Worker)** -- Must exist before any Bitbucket feature works. Tiny scope, deploy independently.
2. **BitbucketClient + CodeSearch** -- Core API integration. Can be tested independently with manual token input.
3. **ContextExtractor** -- Pure data transformation, easy to unit test.
4. **ContextCache** -- Simple Map wrapper, quick to build.
5. **Bitbucket Settings UI** -- Token input, workspace/repo config fields in sidebar.
6. **ContextPanel UI** -- Expandable rows in Content Preview table.
7. **ContextDescriber** -- AI integration for human-readable descriptions.
8. **ContextPromptInjector + PromptBuilder** -- Wire context into translation prompts.
9. **TranslateEngine extension** -- Add fast/precise mode toggle, integrate context pipeline.
10. **File split migration** -- Extract existing code into ES modules (can happen in parallel with steps 1-5).

Steps 1-4 are pure logic with no UI changes. Steps 5-6 are UI-only. Steps 7-9 wire everything together. Step 10 is an ongoing refactor.

## Sources

- [Bitbucket Cloud REST API - Source endpoints](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/)
- [Bitbucket Code Search API announcement](https://www.atlassian.com/blog/bitbucket/bitbucket-code-search-api-now-available)
- [Bitbucket CORS community discussion](https://community.atlassian.com/forums/Bitbucket-questions/Access-Bitbucket-API-from-Client-Browser-CORS-access-support/qaq-p/1039301)
- [Bitbucket Repository Access Tokens](https://support.atlassian.com/bitbucket-cloud/docs/repository-access-tokens/)
- [Cloudflare Workers CORS proxy docs](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
- [MDN ES Modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Going Buildless with ES Modules](https://modern-web.dev/guides/going-buildless/es-modules/)
