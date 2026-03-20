# Domain Pitfalls

**Domain:** Browser-based Bitbucket Cloud API integration for code search + AI context generation
**Researched:** 2026-03-20

## Critical Pitfalls

Mistakes that cause architectural rewrites or block the feature entirely.

### Pitfall 1: CORS Blocks All Authenticated Bitbucket API Requests from the Browser

**What goes wrong:** The app attempts direct `fetch()` calls from GitHub Pages to `api.bitbucket.org` with a Bearer token. The browser sends a preflight OPTIONS request. Bitbucket Cloud does NOT return proper `Access-Control-Allow-Origin` headers on preflight responses for authenticated endpoints, resulting in every request being blocked by the browser's CORS policy. The feature is completely non-functional.

**Why it happens:** Bitbucket Cloud's CORS support is documented but effectively broken for authenticated browser-side requests. This has been a known unresolved issue since at least 2019 (Atlassian community threads confirm). The OPTIONS preflight does not carry auth cookies/headers, so Bitbucket returns 401 on preflight, which the browser treats as a CORS failure.

**Consequences:** Complete feature blocker. No Bitbucket API call works from the browser. Days wasted debugging what appears to be an auth issue but is actually a CORS issue.

**Prevention:**
- Do NOT attempt direct browser-to-Bitbucket API calls. Plan for a CORS proxy from day one.
- Use a lightweight serverless proxy (Cloudflare Workers, Vercel Edge Functions, or Netlify Functions) that forwards requests to `api.bitbucket.org` and adds CORS headers to the response.
- The proxy is minimal: receive request from browser, forward to Bitbucket with the Bearer token, return response with `Access-Control-Allow-Origin: *`.
- Alternative: If the team insists on zero-backend, explore Bitbucket Connect apps or Atlassian Forge, but these are far more complex and change the deployment model entirely.

**Detection:** First API call from the browser fails with `No 'Access-Control-Allow-Origin' header` error in the console. Test this in the very first spike, not after building the full feature.

**Phase impact:** This must be resolved in Phase 1 (infrastructure/proxy setup). Everything else depends on API access working.

**Confidence:** HIGH -- multiple community reports and direct documentation verification confirm this.

### Pitfall 2: Bitbucket Rate Limits Exhausted During Bulk Key Search

**What goes wrong:** The app searches for hundreds of translation keys in a single Bitbucket workspace. Each key requires a separate code search API call (`GET /workspaces/{workspace}/search/code?search_query={key}`). With 200+ keys, the 1,000 requests/hour rate limit is consumed in a single translation session, especially when combined with follow-up calls to fetch surrounding code context.

**Why it happens:** Bitbucket Cloud enforces a rolling 1-hour window rate limit of 1,000 requests for authenticated users (scaling up to 10,000 for large paid workspaces at 10 extra RPH per paid seat). Each key search is at minimum 1 API call, plus additional calls to fetch file content for context extraction. A file with 300 keys easily generates 600+ API calls.

**Consequences:** Users hit 429 (Too Many Requests) mid-translation. Partial results with no way to resume. Poor UX with cryptic error messages.

**Prevention:**
- Batch key searches: combine multiple keys into a single search query using Bitbucket search syntax (e.g., `"key1" OR "key2" OR "key3"`). Test the maximum query length the API accepts.
- Only search for untranslated keys (already planned in PROJECT.md -- enforce this strictly).
- Cache search results in `sessionStorage` so re-running translation for the same file does not re-query.
- Implement request queuing with concurrency limit (max 3-5 parallel requests) and exponential backoff on 429 responses.
- Show remaining API budget to the user (Bitbucket returns rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`).
- Consider a "search phase" that runs once and stores all results, separate from the "translate phase."

**Detection:** Monitor `X-RateLimit-Remaining` header on every response. Warn the user when below 20% of budget. Log 429 responses prominently.

**Phase impact:** Must be designed in Phase 2 (code search implementation). Retrofitting rate limit handling is painful.

**Confidence:** HIGH -- official Atlassian documentation confirms rate limits.

### Pitfall 3: Access Token Exposed via XSS in Static Web App

**What goes wrong:** The Bitbucket Repository Access Token is stored in `localStorage` (matching the existing pattern for API keys). A single XSS vulnerability anywhere in the page allows an attacker to read the token and gain repository access (read code, possibly write depending on token scopes).

**Why it happens:** The app is a single HTML file with no Content Security Policy, no framework-level XSS protection, and user-provided content (translation strings) rendered into the DOM. `localStorage` is fully accessible to any JavaScript running on the same origin. Unlike the existing DeepL/OpenAI keys (which are personal and easily rotated), a Bitbucket Repository Access Token grants access to source code.

**Consequences:** Source code exfiltration. If the token has write scope, code injection is possible. Unlike API keys that cost money, a code repository leak is a security incident.

**Prevention:**
- Scope the Repository Access Token to absolute minimum permissions: `repository:read` only, never write scopes.
- Add a Content Security Policy (CSP) meta tag that blocks inline scripts and restricts script sources. This dramatically reduces XSS attack surface.
- Sanitize all translation strings before DOM insertion (use `textContent`, never `innerHTML` with user data).
- Consider `sessionStorage` instead of `localStorage` so the token is cleared when the tab closes -- users must re-enter it each session, but the exposure window is smaller.
- Warn users clearly that the token is stored in the browser and advise using a dedicated read-only token.
- If using a CORS proxy (see Pitfall 1), the proxy can hold the token server-side, eliminating browser-side token storage entirely. This is the best option.

**Detection:** Security review of all DOM manipulation code. Search for `innerHTML`, `insertAdjacentHTML`, `document.write` usage.

**Phase impact:** Architecture decision in Phase 1. If the CORS proxy holds the token, this pitfall is eliminated.

**Confidence:** HIGH -- well-established web security principle, confirmed by OWASP guidelines.

## Moderate Pitfalls

### Pitfall 4: Code Search Returns Insufficient Context for AI Description

**What goes wrong:** Bitbucket's code search API returns `content_matches` with only the matching lines and immediately adjacent lines. For a WPF LocExtension usage like `{loc:Translate Key=some.key}`, the match shows just the XAML line with the key. The AI needs more context (what UI element it is in, what the surrounding form/dialog looks like) to generate a useful description.

**Prevention:**
- After getting search results, make a follow-up call to fetch the full file content (`GET /repositories/{workspace}/{repo}/src/{commit}/{path}`) and extract a larger window (20-30 lines) around the match.
- Parse XAML structure to find the parent element hierarchy (e.g., the key is inside a `Button` inside a `StackPanel` inside a `SettingsDialog`).
- Budget for 2 API calls per key: one for search, one for file content. Factor this into rate limit calculations.
- Cache file content aggressively -- multiple keys often appear in the same file.

**Detection:** Test with real WPF files early. If AI descriptions say "This key is used in a XAML file" without specifics, the context extraction is too shallow.

**Phase impact:** Phase 2 (code search) and Phase 3 (AI context generation). The context extraction strategy directly affects AI output quality.

**Confidence:** MEDIUM -- based on analysis of the code search API response format. Actual context window size from the API needs verification.

### Pitfall 5: AI Context Generation Consumes Disproportionate Token Budget

**What goes wrong:** Each key gets its own AI call to generate a human-readable context description. With 200 keys, that is 200 separate OpenAI/Gemini API calls just for context generation, before any translation occurs. This is slow (sequential or rate-limited) and expensive.

**Prevention:**
- Batch context generation: send 10-20 keys with their code snippets in a single AI call, asking for descriptions of all keys at once. This reduces calls by 10-20x.
- Use a smaller/cheaper model for context generation (e.g., GPT-4o-mini or Gemini Flash) since descriptions do not require deep reasoning.
- Generate context descriptions lazily: only when the user expands a key's detail panel, not upfront for all keys.
- Cache generated descriptions in `sessionStorage` keyed by file content hash, so re-opening the same key does not re-generate.

**Detection:** Measure total API calls and latency for a realistic 200-key file. If context generation takes more than 30 seconds, the batching strategy needs work.

**Phase impact:** Phase 3 (AI context generation). Batching strategy must be designed before implementation.

**Confidence:** HIGH -- basic arithmetic on API call counts.

### Pitfall 6: Bitbucket Search Query Syntax Mismatches for LocExtension Patterns

**What goes wrong:** Searching for `Key=settings.general.title` in Bitbucket may not find the actual usage if the XAML uses different formatting: `Key = settings.general.title` (spaces), `Key="settings.general.title"` (quotes), or the key is built dynamically. The search may also return false positives from comments, string literals, or unrelated files.

**Prevention:**
- Test search queries against real WPF codebase patterns before building the full feature.
- Use exact string search for the key value itself (e.g., `"settings.general.title"`) rather than trying to match the full LocExtension pattern.
- Filter results by file extension: append `ext:xaml OR ext:cs` to the search query to avoid matches in unrelated files.
- Handle the case where a key is NOT found in code gracefully -- some keys may be legacy or dynamically constructed. Show "No code usage found" rather than failing.

**Detection:** Run test searches against the actual Bitbucket repository with 10-20 representative keys. Check both precision (are results correct?) and recall (are usages found?).

**Phase impact:** Phase 2 (code search). Search query design is foundational.

**Confidence:** MEDIUM -- depends on the specific codebase's coding conventions.

### Pitfall 7: CORS Proxy Becomes a Security and Cost Liability

**What goes wrong:** The CORS proxy (needed per Pitfall 1) is deployed as a public endpoint. Anyone who discovers the URL can use it to proxy arbitrary Bitbucket API requests, potentially exhausting the rate limit or abusing the token if it is stored server-side.

**Prevention:**
- Add origin validation: the proxy should only accept requests from the app's GitHub Pages domain.
- If the token is stored in the proxy, add a simple shared secret (app sends a custom header with a value only it knows) to prevent unauthorized use.
- Set up usage monitoring and alerts on the proxy.
- Use Cloudflare Workers (free tier: 100K requests/day) with origin checking -- this is both free and secure enough for this use case.
- Rate limit the proxy itself (separate from Bitbucket's rate limits).

**Detection:** Monitor proxy access logs for unexpected origins or unusually high request volumes.

**Phase impact:** Phase 1 (proxy setup). Security must be built in from the start, not added later.

**Confidence:** HIGH -- standard concern for any public proxy endpoint.

## Minor Pitfalls

### Pitfall 8: Pagination Overlooked in Code Search Results

**What goes wrong:** A search for a common key pattern returns more results than a single API page. The app only processes the first page (typically 10-25 results) and misses additional file usages.

**Prevention:**
- Always check for the `next` field in the Bitbucket API pagination response.
- For this use case, the first page is likely sufficient (a key typically appears in 1-5 files). Set `pagelen=50` and only paginate if explicitly needed.
- Document the assumption that keys appear in a small number of files and revisit if users report missing results.

**Detection:** Log when pagination `next` URL is present but not followed. Review whether missed results affect context quality.

**Phase impact:** Phase 2 (code search). Low risk but should be handled.

**Confidence:** MEDIUM -- depends on codebase size and key reuse patterns.

### Pitfall 9: Repository Access Token Expiry During Long Sessions

**What goes wrong:** Repository Access Tokens may have expiry policies set by workspace admins. The user starts a translation session, the token expires mid-session, and subsequent API calls fail with 401.

**Prevention:**
- Detect 401 responses and prompt the user to re-enter their token, rather than showing a generic error.
- Display a clear message: "Your Bitbucket token may have expired. Please generate a new one."
- If using OAuth 2.0 instead of Repository Access Tokens, implement token refresh. But for this project, Repository Access Tokens are simpler and do not have automatic refresh -- the user must create a new one.

**Detection:** Any 401 response during an active session where the token was previously working.

**Phase impact:** Phase 2 (error handling). Minor UX consideration.

**Confidence:** MEDIUM -- token expiry behavior depends on workspace configuration.

### Pitfall 10: Multi-File Architecture Migration Breaks Existing Functionality

**What goes wrong:** PROJECT.md mentions splitting from single `index.html` to multiple JS/CSS files. During migration, existing functionality breaks due to incorrect script loading order, missing IIFE scoping, or broken DOM references.

**Prevention:**
- Extract new Bitbucket/AI features into separate files, but do NOT refactor existing working code in the same phase.
- Use a clear module loading pattern (ES modules with `type="module"` on script tags, or a simple concatenation-based approach).
- If using ES modules, note that `file://` protocol does not support ES module imports -- the app will need to be served via HTTP even for local development.
- Test existing functionality after every extraction step.

**Detection:** Regression testing of upload, preview, translation, and download flows after each file split.

**Phase impact:** Phase 1 (architecture). Keep this separate from feature work.

**Confidence:** HIGH -- common issue when refactoring monolithic apps.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| CORS Proxy Setup | Pitfall 1 (CORS blocking), Pitfall 7 (proxy security) | Spike CORS proxy in the first day. Validate with a real Bitbucket API call before building anything else. |
| File Architecture Split | Pitfall 10 (breaking existing features) | Extract only new modules. Do not touch existing `index.html` internals until new features work. |
| Code Search Implementation | Pitfall 2 (rate limits), Pitfall 6 (search syntax), Pitfall 8 (pagination) | Test with real repo + real keys first. Implement request queuing with backoff. Cache aggressively. |
| AI Context Generation | Pitfall 4 (insufficient context), Pitfall 5 (token budget) | Batch AI calls. Fetch full file content for context. Use cheap models for descriptions. |
| Token Security | Pitfall 3 (XSS exposure) | Best: store token in proxy. If browser-side: use sessionStorage + CSP + read-only scope. |
| Error Handling / UX | Pitfall 9 (token expiry), Pitfall 2 (rate limits) | Clear user-facing messages for 401 and 429. Show rate limit budget. Allow retry/resume. |

## Sources

- [Bitbucket Cloud REST API Introduction](https://developer.atlassian.com/cloud/bitbucket/rest/intro/)
- [Bitbucket CORS Community Thread (2019, unresolved)](https://community.atlassian.com/forums/Bitbucket-questions/Access-Bitbucket-API-from-Client-Browser-CORS-access-support/qaq-p/1039301)
- [Bitbucket API Rate Limits](https://support.atlassian.com/bitbucket-cloud/docs/api-request-limits/)
- [Bitbucket Scaled Rate Limits Announcement](https://www.atlassian.com/blog/bitbucket/introducing-scaled-rate-limits-for-bitbucket-cloud-api)
- [Bitbucket Code Search API Announcement](https://www.atlassian.com/blog/bitbucket/bitbucket-code-search-api-now-available)
- [Bitbucket Repository Access Tokens](https://support.atlassian.com/bitbucket-cloud/docs/repository-access-tokens/)
- [Cloudflare Workers CORS Proxy Documentation](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
- [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [localStorage XSS Risks Analysis](https://pragmaticwebsecurity.com/articles/oauthoidc/localstorage-xss.html)
- [Bitbucket Search Syntax](https://support.atlassian.com/bitbucket-cloud/docs/search-in-bitbucket-cloud/)
