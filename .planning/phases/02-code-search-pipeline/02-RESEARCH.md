# Phase 2: Code Search Pipeline - Research

**Researched:** 2026-03-21
**Domain:** Bitbucket Code Search API integration, WPF LocExtension parsing, concurrency management
**Confidence:** HIGH

## Summary

Phase 2 builds the Bitbucket code search pipeline as a pure data layer. The pipeline searches for translation key usage in WPF source code (.xaml / .cs files) via the Bitbucket Cloud Code Search API, parses LocExtension patterns from results, aggregates matches per key, caches results in-memory, and reports progress. No result display UI is built -- that is Phase 4.

The most critical finding is that **Bitbucket Cloud code search does NOT support an OR operator**. Multiple terms in a query are implicitly ANDed. This means each translation key must be searched in a separate API call -- OR-based batching (combining multiple keys into one query) is not possible. The pipeline must therefore use single-key queries with concurrency control (max 3 parallel requests as decided in CONTEXT.md) and aggressive caching to stay within rate limits.

The proxy path whitelist (`/bitbucket/2.0/workspaces/*/search/code`) is already configured from Phase 1, so no proxy changes are needed for search. The file content endpoint (`/bitbucket/2.0/repositories/*/*/src/*`) is also whitelisted for fetching additional context lines if the search API's `content_matches` provides insufficient surrounding code.

**Primary recommendation:** Build a `js/search.js` module following the existing IIFE + `window.App` namespace pattern. Implement single-key queries with a concurrency limiter (max 3 parallel), search .xaml first then .cs fallback, in-memory Map cache, and progress callbacks. Expose `App.searchKeyContext(key)` and `App.searchBatchContext(keys, onProgress)` on the App namespace.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Two trigger modes: batch (before translation) AND single-key (right-click context menu)
- Batch mode: triggered when user clicks "Translate" in precise mode, searches all untranslated keys before translating
- Single-key mode: right-click a key row in Content Preview table -> "查詢情境" context menu option
- Both modes use the same underlying search function, just different input (all keys vs one key)
- Phase 2 builds the pipeline only -- integration with translation flow is Phase 3-4
- Batch search shows a progress bar + counter: "Searching context: 15/42 keys"
- Similar style to existing translation progress display
- Single-key search shows a loading indicator on that key's row
- Per-key result object: `{ key, matches: [{ file, line, snippet }], searchedAt }`
- Each match includes: file path, line number, code snippet (surrounding lines from API response)
- All matches for the same key aggregated into one result object
- Results stored in state as a Map: `contextResults: new Map()` (key -> result object)
- Phase 2 does NOT build result display UI -- results stored in memory/state only
- Query order: search .xaml first (`"key" ext:xaml`), if no results then search .cs (`"key" ext:cs`)
- This saves API quota -- most keys will be found in XAML files
- Concurrency: max 3 parallel API calls to avoid Bitbucket rate limits
- Retry: on rate limit (429), back off and retry; on other errors, skip key and continue batch
- In-memory cache (Map) for search results within the session
- Same key queried again -> return cached result, no API call
- Cache cleared on page reload
- No localStorage persistence for search results
- A key is "untranslated" if: it does not exist in the target language, OR its value is empty string ''
- Retranslate mode: when user selects retranslate for an already-translated language, ALL keys are searched
- Keys with cached results skip the API call regardless of translation status

### Claude's Discretion
- Exact batching strategy (single queries vs OR-merged queries)
- Error handling and retry backoff timing
- How to extract and format code snippets from API response
- LocExtension pattern matching implementation details
- Whether to use file content retrieval API for additional context lines beyond what search returns

### Deferred Ideas (OUT OF SCOPE)
- Result display UI (expandable panels) -- Phase 4
- AI context description generation from code snippets -- Phase 3
- Translation prompt injection with context -- Phase 3
- Quick vs Precise mode toggle -- Phase 4
- localStorage/IndexedDB persistent cache -- v2 (CTXE-03)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRCH-01 | Search for key usage in WPF files (.xaml / .cs) via Bitbucket Code Search API | Bitbucket Code Search API endpoint documented; query syntax `"key" ext:xaml` confirmed; proxy whitelist already configured |
| SRCH-02 | Identify LocExtension markup extension pattern, accurately match key usage | LocExtension syntax researched: `{lex:Loc Key=some.key}` and variants; segment-based parsing from API response enables highlighting |
| SRCH-03 | Only query context for untranslated keys, saving API quota | Untranslated detection logic defined (missing or empty string); cache-first strategy avoids redundant calls |
| SRCH-04 | Extract file name and surrounding code lines as usage context | API `content_matches` returns matched lines with segments; file content endpoint available for fetching additional surrounding lines |
| SRCH-05 | Aggregate same key's usage across multiple files into complete context | Per-key result aggregation with `matches[]` array; pagination `next` field handling for completeness |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS (IIFE) | ES5 + async/await | Search pipeline module | Project convention -- no external dependencies, IIFE + window.App namespace |
| Fetch API | Browser native | HTTP requests to proxy | Already used via `App.fetchWithTimeout()` |
| Bitbucket Code Search API | v2.0 | Search for key usage in code | Only available code search endpoint for Bitbucket Cloud |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| AbortController | Browser native | Request cancellation | Cancel in-flight searches when user navigates away or starts new batch |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single-key queries | OR-merged batch queries | NOT POSSIBLE -- Bitbucket Cloud code search has no OR operator; multiple terms are implicitly ANDed |
| In-memory Map cache | localStorage/sessionStorage | Deferred to v2 (CTXE-03); in-memory avoids stale data and serialization complexity with Map objects |

**Installation:**
```
No installation needed -- vanilla JS, no npm dependencies.
```

## Architecture Patterns

### Recommended Project Structure
```
js/
  search.js            # NEW: Search pipeline (searchKeyContext, searchBatchContext, cache, concurrency)
  state.js             # MODIFY: Add contextResults Map, searchProgress fields
  ui.js                # MODIFY: Add context menu on key rows, progress display for search
  bitbucket.js         # EXISTING: Connection config (no changes needed)
  providers.js         # EXISTING: App.fetchWithTimeout() reused
  translation.js       # EXISTING: No changes in Phase 2 (Phase 3-4 wires search into translation)
proxy/
  src/index.js         # EXISTING: Path whitelist already covers search/code endpoint
```

### Pattern 1: Concurrency Limiter
**What:** A simple semaphore that limits parallel API calls to N concurrent requests.
**When to use:** Batch search of multiple keys -- limits to 3 parallel calls per CONTEXT.md decision.
**Example:**
```javascript
// Source: Standard concurrency pattern for Promise-based workflows
function createConcurrencyLimiter(maxConcurrent) {
  var running = 0;
  var queue = [];

  function tryNext() {
    if (running >= maxConcurrent || queue.length === 0) return;
    running++;
    var task = queue.shift();
    task.fn().then(task.resolve, task.reject).finally(function () {
      running--;
      tryNext();
    });
  }

  return function limit(fn) {
    return new Promise(function (resolve, reject) {
      queue.push({ fn: fn, resolve: resolve, reject: reject });
      tryNext();
    });
  };
}
```

### Pattern 2: Search-Then-Fallback
**What:** Search .xaml first; if zero results, search .cs as fallback.
**When to use:** Every key search -- saves API quota since most WPF keys are in XAML.
**Example:**
```javascript
// Source: CONTEXT.md locked decision
async function searchKey(key) {
  var s = App.getState();
  var baseUrl = s.proxyUrl.replace(/\/+$/, '') + '/bitbucket/2.0/workspaces/'
    + encodeURIComponent(s.bitbucketWorkspace) + '/search/code';

  // Search XAML first
  var xamlQuery = '"' + key + '" ext:xaml repo:' + s.bitbucketRepo;
  var results = await doSearch(baseUrl, xamlQuery);

  // Fallback to CS if no XAML results
  if (results.length === 0) {
    var csQuery = '"' + key + '" ext:cs repo:' + s.bitbucketRepo;
    results = await doSearch(baseUrl, csQuery);
  }

  return results;
}
```

### Pattern 3: Cache-First with Timestamp
**What:** Check in-memory cache before making API calls. Store results with timestamp.
**When to use:** Every search request -- both batch and single-key.
**Example:**
```javascript
// Source: CONTEXT.md locked decision
var contextCache = new Map();

function getCachedResult(key) {
  return contextCache.get(key) || null;
}

function setCachedResult(key, result) {
  contextCache.set(key, Object.assign({}, result, { searchedAt: Date.now() }));
}
```

### Pattern 4: Progress Callback
**What:** Report search progress via callback function, mirroring translation progress pattern.
**When to use:** Batch search mode.
**Example:**
```javascript
// Source: Follows existing pattern from js/translation.js (progressBar + counter)
async function searchBatchContext(keys, onProgress) {
  var total = keys.length;
  var completed = 0;

  // onProgress({ completed: 0, total: total, currentKey: '' });
  // ... for each key, after search completes:
  //   completed++;
  //   onProgress({ completed: completed, total: total, currentKey: key });
}
```

### Anti-Patterns to Avoid
- **Mutating the contextResults Map directly:** Always create a new Map via `App.setState()` pattern. Use `new Map(existingMap)` then `.set()` on the copy, then `setState({ contextResults: newMap })`.
- **Sequential awaits without concurrency:** Do NOT `await searchKey(key)` in a for-loop. Use the concurrency limiter to run 3 searches in parallel.
- **Ignoring rate limit headers:** Always read `X-RateLimit-Remaining` from responses and stop early if budget is low.
- **Building custom context menu from scratch without cleanup:** Always remove the context menu on click-away and on scroll to prevent stale menus.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Concurrency control | Custom counter with callbacks | Promise-based semaphore pattern (see Pattern 1) | Easy to get wrong with race conditions; the semaphore pattern is well-proven |
| Exponential backoff | Manual setTimeout chains | Simple helper function with configurable base delay and max retries | Consistent retry behavior, easy to test |
| URL encoding | String concatenation with manual escaping | `encodeURIComponent()` for path segments, `URLSearchParams` for query params | Edge cases with special characters in keys (dots, colons, brackets) |
| Deep cloning Maps | Manual iteration | `new Map(existingMap)` for shallow clone (sufficient since values are plain objects) | Maps cannot be cloned with `JSON.parse(JSON.stringify())` |

**Key insight:** The search pipeline is mostly about orchestration (concurrency, caching, progress reporting, error handling) rather than complex algorithms. Use simple, well-tested patterns for each concern.

## Common Pitfalls

### Pitfall 1: No OR Operator in Bitbucket Cloud Code Search
**What goes wrong:** Attempting to batch multiple keys into a single query like `"key1" OR "key2"` -- this does NOT work. Bitbucket Cloud code search treats multiple quoted terms as implicit AND, returning only files containing ALL terms.
**Why it happens:** The prior research in PITFALLS.md and STACK.md mentioned OR batching as a possibility, but the official Bitbucket Cloud search syntax documentation confirms no OR operator exists. Only `NOT` (exclusion) is supported as a boolean operator.
**How to avoid:** Each key MUST be searched in its own API call. Use concurrency limiter (max 3 parallel) to manage throughput.
**Warning signs:** Search returns zero results for multi-key queries that should match.

### Pitfall 2: 250-Character Query Length Limit
**What goes wrong:** Translation keys can be long (e.g., `settings.dental.implant.planning.measurement.tooltip.calibration`). Combined with `ext:xaml repo:my-repo-name`, the query exceeds 250 characters and the API rejects it.
**Why it happens:** Bitbucket enforces a hard 250-character limit on search queries.
**How to avoid:** Calculate query length before sending. If key + modifiers exceed 250 chars, search with just the quoted key (no ext: filter) and filter results client-side by file extension. Alternatively, search for the last segment of a very long key.
**Warning signs:** API returns 400 Bad Request for queries near the limit.

### Pitfall 3: Keys with Special Characters Breaking Search
**What goes wrong:** Keys containing dots (common), colons, or brackets may be interpreted as search syntax rather than literal text.
**Why it happens:** The search query parser may treat certain characters specially. Wrapping in double quotes should handle most cases, but edge cases exist.
**How to avoid:** Always wrap the key in double quotes: `"settings.general.title"`. Test with representative keys from the actual repository early in implementation.
**Warning signs:** Search returns unexpected results or zero results for keys known to exist.

### Pitfall 4: Rate Limit Exhaustion Mid-Batch
**What goes wrong:** With 200 keys and no OR batching, that is 200-400 API calls (XAML search + possible CS fallback). At 1,000 requests/hour limit, a large batch combined with file content fetches could exhaust the budget.
**Why it happens:** Each key = 1-2 API calls. No batching means linear API consumption.
**How to avoid:** (1) Cache aggressively -- never re-query a cached key. (2) Monitor `X-RateLimit-Remaining` header on every response. (3) If remaining < 50, pause and warn user. (4) The .xaml-first strategy saves ~40% of calls when keys are found in XAML.
**Warning signs:** 429 responses start appearing mid-batch.

### Pitfall 5: Stale State Reference in Async Callbacks
**What goes wrong:** Capturing `App.getState()` at the start of a batch and using it throughout -- but the user may change settings (workspace, repo) during the search.
**Why it happens:** The search runs async with multiple parallel calls. State can change between when the batch started and when individual calls complete.
**How to avoid:** Read state fresh via `App.getState()` for each individual search call's URL construction, not once at batch start. Cache only the key list at batch start.
**Warning signs:** Searches go to wrong repo/workspace after user changes settings mid-batch.

### Pitfall 6: Context Menu Event Handling on Dynamic Table
**What goes wrong:** Attaching `contextmenu` event listeners to individual table rows. When the table re-renders (after translation, filter change), listeners are lost.
**Why it happens:** `renderEditorTable()` replaces `innerHTML` of the table, destroying all attached event listeners.
**How to avoid:** Use event delegation: attach a single `contextmenu` listener on `App.dom.editorTable` and determine the clicked key from `e.target.closest('tr')`. This survives re-renders.
**Warning signs:** Context menu stops working after table re-render.

## Code Examples

### Bitbucket Code Search API Call
```javascript
// Source: Bitbucket Cloud REST API v2.0 documentation + existing proxy pattern
async function doSearch(baseUrl, query) {
  var s = App.getState();
  var searchUrl = baseUrl + '?search_query=' + encodeURIComponent(query)
    + '&pagelen=20';

  var res = await App.fetchWithTimeout(searchUrl, {
    headers: { 'Authorization': 'Bearer ' + s.bitbucketToken }
  });

  if (res.status === 429) {
    // Rate limited -- extract retry-after or use exponential backoff
    var retryAfter = res.headers.get('Retry-After');
    throw { type: 'rate_limit', retryAfter: retryAfter ? parseInt(retryAfter) : 60 };
  }

  if (!res.ok) {
    throw new Error('Search API error: HTTP ' + res.status);
  }

  var data = await res.json();
  return data.values || [];
}
```

### Parsing content_matches into Structured Results
```javascript
// Source: Bitbucket Code Search API response shape (STACK.md)
function parseSearchResults(apiValues) {
  return apiValues.map(function (item) {
    var filePath = item.file ? item.file.path : 'unknown';
    var matches = [];

    if (item.content_matches) {
      item.content_matches.forEach(function (cm) {
        if (cm.lines) {
          cm.lines.forEach(function (lineObj) {
            // Reconstruct full line text from segments
            var lineText = lineObj.segments
              ? lineObj.segments.map(function (seg) { return seg.text; }).join('')
              : '';
            matches.push({
              line: lineObj.line,
              text: lineText,
              hasMatch: lineObj.segments
                ? lineObj.segments.some(function (seg) { return seg.match === true; })
                : false
            });
          });
        }
      });
    }

    return {
      file: filePath,
      line: matches.length > 0 ? matches[0].line : 0,
      snippet: matches.map(function (m) { return m.text; }).join('\n')
    };
  });
}
```

### Aggregating Results Per Key
```javascript
// Source: CONTEXT.md locked decision on result structure
function buildKeyResult(key, searchResults) {
  var parsed = parseSearchResults(searchResults);
  return {
    key: key,
    matches: parsed,
    searchedAt: Date.now()
  };
}
```

### Immutable State Update for Map
```javascript
// Source: Project convention -- immutable setState with Map
function addContextResult(key, result) {
  var s = App.getState();
  var newMap = new Map(s.contextResults);
  newMap.set(key, result);
  App.setState({ contextResults: newMap });
}
```

### Exponential Backoff Helper
```javascript
// Source: Standard retry pattern
function wait(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

async function withRetry(fn, maxRetries, baseDelay) {
  maxRetries = maxRetries || 3;
  baseDelay = baseDelay || 1000;
  for (var attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err.type === 'rate_limit' && attempt < maxRetries) {
        var delay = err.retryAfter ? err.retryAfter * 1000 : baseDelay * Math.pow(2, attempt);
        await wait(delay);
        continue;
      }
      throw err;
    }
  }
}
```

### Context Menu via Event Delegation
```javascript
// Source: Standard DOM event delegation pattern
function initContextMenu() {
  App.dom.editorTable.addEventListener('contextmenu', function (e) {
    var row = e.target.closest('tr');
    if (!row || !row.parentElement || row.parentElement.tagName === 'THEAD') return;

    var keyCell = row.querySelector('td:first-child');
    if (!keyCell) return;

    var key = keyCell.getAttribute('title') || keyCell.textContent;
    e.preventDefault();
    showSearchContextMenu(e.clientX, e.clientY, key);
  });

  // Dismiss on click anywhere
  document.addEventListener('click', dismissContextMenu);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| OR-batched queries | Single-key queries with concurrency | N/A (OR never supported in Cloud) | Each key = 1-2 API calls; must use concurrency limiter |
| `GET /teams/*/search/code` | `GET /workspaces/*/search/code` | 2020 (teams deprecated) | Use workspaces endpoint only |
| Bitbucket OAuth Implicit Grant | Repository Access Token (Bearer) | March 2026 (enforced) | Bearer token via localStorage, passed in Authorization header |

**Deprecated/outdated:**
- `/teams/` endpoints: Removed. Use `/workspaces/` only.
- OAuth Implicit Grant: Dead as of March 14, 2026. The project uses Repository Access Tokens.
- OR query batching: Was documented in prior research as a possibility, but Bitbucket Cloud search has NO OR operator. This is corrected here.

## Open Questions

1. **Content match context window size**
   - What we know: API returns `content_matches` with `lines` array containing matched and adjacent lines
   - What's unclear: Exactly how many surrounding lines the API returns (is it 1-2 lines or more?)
   - Recommendation: Test with real repository. If context is too shallow (only the matched line), use the file content retrieval endpoint to fetch 10-15 lines around the match. Budget 1 extra API call per unique file.

2. **LocExtension variant patterns in target codebase**
   - What we know: WPFLocalizeExtension uses `{lex:Loc Key=some.key}` pattern. Other projects use `{loc:Translate Key=some.key}` or custom variants.
   - What's unclear: Which exact LocExtension prefix the target WPF codebase uses
   - Recommendation: For Phase 2, searching for the bare key string in quotes (`"settings.general.title"`) is sufficient to find usage. LocExtension pattern identification (recognizing `lex:Loc`, `loc:Translate`, etc.) is used for snippet formatting/highlighting, not for search queries. Implement a simple regex check on returned snippets to identify if the match is in a LocExtension context.

3. **`ext:xaml` modifier behavior verification**
   - What we know: `ext:` modifier is documented in Bitbucket Cloud search syntax
   - What's unclear: Whether `ext:xaml` works reliably for `.xaml` files (some reports suggest `lang:` may be needed instead)
   - Recommendation: Test with the actual repository in early implementation. Fallback: use `path:*.xaml` if `ext:xaml` does not work.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual browser testing (no automated test framework in project) |
| Config file | none -- see Wave 0 |
| Quick run command | Open browser console, call `App.searchKeyContext('test.key')` |
| Full suite command | Manual: run batch search on real data, verify results in console |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRCH-01 | Search returns results from Bitbucket for known key | manual/smoke | Console: `App.searchKeyContext('known.key').then(console.log)` | N/A |
| SRCH-02 | LocExtension pattern detected in snippet | manual | Inspect returned snippet for LocExtension markers | N/A |
| SRCH-03 | Untranslated-only filtering + cache hit skips API | manual | Console: search twice, verify no network call on second | N/A |
| SRCH-04 | Result includes file path and code snippet | manual | Console: inspect returned `matches[].file` and `matches[].snippet` | N/A |
| SRCH-05 | Multiple file matches aggregated in one result | manual | Console: search key used in multiple files, verify `matches.length > 1` | N/A |

### Sampling Rate
- **Per task commit:** Manual smoke test -- search a known key, verify result structure
- **Per wave merge:** Test batch search with 5-10 keys, verify progress callback fires, cache works
- **Phase gate:** Full batch search on real untranslated keys, verify rate limit handling, verify all results cached

### Wave 0 Gaps
- No automated test infrastructure exists in this project. All testing is manual via browser console.
- This is acceptable for the project scope (static web app, no npm/build step).

## Sources

### Primary (HIGH confidence)
- [Bitbucket Cloud Search Syntax](https://support.atlassian.com/bitbucket-cloud/docs/search-in-bitbucket-cloud/) -- Confirmed NO OR operator, 250-char limit, `ext:` modifier syntax
- [Bitbucket Cloud REST API](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-other-operations/) -- Code search endpoint, response shape with content_matches
- [Bitbucket Code Search API Announcement](https://www.atlassian.com/blog/bitbucket/bitbucket-code-search-api-now-available) -- API availability confirmation
- [Bitbucket API Rate Limits](https://support.atlassian.com/bitbucket-cloud/docs/api-request-limits/) -- 1,000 req/hr authenticated limit, rate limit headers

### Secondary (MEDIUM confidence)
- [WPFLocalizeExtension GitHub](https://github.com/XAMLMarkupExtensions/WPFLocalizeExtension/blob/master/docs/Localize.md) -- LocExtension syntax patterns (`{lex:Loc Key=...}`)
- [bitbucket-go-client SearchApi](https://github.com/DrFaust92/bitbucket-go-client/blob/main/docs/SearchApi.md) -- Endpoint reference confirmation

### Tertiary (LOW confidence)
- `ext:xaml` modifier reliability for XAML files -- needs validation with target repository

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- vanilla JS, existing patterns, well-documented API
- Architecture: HIGH -- follows established project patterns (IIFE, App namespace, fetchWithTimeout)
- Pitfalls: HIGH -- OR operator absence confirmed via official docs; rate limits well-documented
- LocExtension parsing: MEDIUM -- depends on target codebase's specific syntax variant

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (Bitbucket API is stable; LocExtension patterns are static)
