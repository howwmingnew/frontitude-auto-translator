# Technology Stack

**Project:** Frontitude Context-Aware Translator -- Bitbucket Integration Milestone
**Researched:** 2026-03-20

## Critical Architecture Decision: CORS Proxy Required

**Bitbucket Cloud API does NOT support CORS for authenticated browser requests.** This is the single most important finding. Preflight OPTIONS requests return 401 because they cannot carry auth headers, causing all browser-side `fetch()` calls to `api.bitbucket.org` to fail. This has been a known unresolved issue since 2019.

**Impact:** The app cannot remain a "pure static web app" for Bitbucket features. A lightweight serverless proxy is required. The existing translation features (DeepL, OpenAI, Gemini) are unaffected because those APIs do support CORS.

## Recommended Stack

### CORS Proxy (NEW -- Required)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Cloudflare Workers | Current | Serverless CORS proxy for Bitbucket API | Free tier (100K requests/day) is more than sufficient. Zero cold start. Global edge deployment. Simple JS runtime. No server to maintain. Closest to "no backend" while solving the CORS problem. |

**Why not alternatives:**
- **Vercel Edge Functions**: Requires a Vercel project, adds deployment complexity. Overkill for a simple proxy.
- **Netlify Functions**: Cold starts, less edge coverage. Free tier is adequate but Cloudflare is simpler.
- **AWS Lambda + API Gateway**: Way too heavy for a CORS proxy. Requires AWS account, IAM setup.
- **Self-hosted Nginx/Express**: Defeats the purpose of a static web app. Requires server management.
- **cors-anywhere**: Deprecated public instances. Not suitable for production with auth tokens.

### Bitbucket Cloud REST API v2.0

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Bitbucket Cloud REST API | v2.0 | Code search and file content retrieval | Only API available for Bitbucket Cloud. Base URL: `https://api.bitbucket.org/2.0/` |

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Repository Access Token (Bearer) | N/A | Authenticate Bitbucket API calls | Project requirement (see PROJECT.md). Scoped to a single repository. Simpler than OAuth -- no redirect flow, no client secret. Token stored in proxy env var, NOT in browser. |

**Why NOT OAuth 2.0:**
- Implicit Grant flow is deprecated as of March 14, 2026 (enforced). This is NOW dead.
- Authorization Code flow requires a client secret, which cannot be safely stored in a browser.
- PKCE is NOT supported by Bitbucket Cloud (community requests exist, no official support).
- For this project's use case (single repository, internal team tool), a Repository Access Token is the correct choice. OAuth is for multi-user apps accessing multiple workspaces.

**Why NOT App Passwords:**
- App Passwords are tied to individual Atlassian accounts, not repositories.
- Repository Access Tokens are scoped to exactly one repo, which matches this project's need.

### Core App Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla JS (ES Modules) | ES2020+ | Application code | Existing app is vanilla JS. No reason to add a framework. Allow multi-file architecture via ES Modules (`type="module"` on script tags). |
| Fetch API | Browser native | HTTP client | Already used in the existing app. Works with AbortController for timeouts. |

**Why NOT add a framework (React, Vue, etc.):**
- The app is working. Adding a framework to support ~5 new UI panels is over-engineering.
- Would require a build step, which the project currently avoids.
- The vanilla JS + `setState()` pattern already handles UI updates.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None (vanilla) | N/A | All features | Always. No external JS dependencies is a project principle. |

**Why no libraries:**
- The app has no npm/build step. Adding one for this milestone would be a significant architecture change.
- All required functionality (HTTP requests, DOM manipulation, state management) is available natively.
- The proxy is the only new "infra" -- keep the browser-side code simple.

## API Endpoints Reference

### Code Search

```
GET /2.0/workspaces/{workspace}/search/code?search_query={query}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| workspace | string (path) | Yes | Workspace slug or UUID |
| search_query | string (query) | Yes | Search query with modifiers |
| page | int (query) | No | Page number (default: 1) |
| pagelen | int (query) | No | Results per page (default: 10, max: 100) |

**Query syntax for this project:**
```
"settings.general.title" ext:xaml   -- Search exact key in XAML files
"settings.general.title" ext:cs     -- Search exact key in CS files
"some.key" repo:my-repo ext:xaml    -- Scope to specific repo
```

**Key search modifiers:**
- `repo:<slug>` -- Filter by repository
- `ext:<extension>` -- Filter by file extension (xaml, cs)
- `lang:<language>` -- Filter by language
- `path:<dir>` -- Filter by directory path
- `NOT` -- Exclude term (must be ALL CAPS)

**Limitations (confirmed in official docs):**
- Files larger than 320 KB are NOT indexed
- No regex or wildcard support
- Maximum 9 expressions per query, 250-character limit
- Only the default branch is indexed
- Case-insensitive search

**Response shape (key fields):**
```json
{
  "size": 3,
  "page": 1,
  "pagelen": 10,
  "next": "https://...",
  "values": [
    {
      "type": "code_search_result",
      "content_matches": [
        {
          "lines": [
            {
              "line": 42,
              "segments": [
                { "text": "Key=", "match": false },
                { "text": "settings.general.title", "match": true }
              ]
            }
          ]
        }
      ],
      "path_matches": [],
      "file": {
        "path": "src/Views/SettingsView.xaml",
        "type": "commit_file",
        "commit": {
          "hash": "abc123",
          "repository": {
            "slug": "my-repo",
            "full_name": "workspace/my-repo"
          }
        }
      }
    }
  ]
}
```

### File Content Retrieval

```
GET /2.0/repositories/{workspace}/{repo_slug}/src/{commit}/{path}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| workspace | string (path) | Yes | Workspace slug |
| repo_slug | string (path) | Yes | Repository slug |
| commit | string (path) | Yes | Commit hash or branch name (avoid branch names with `/` chars) |
| path | string (path) | Yes | File path within repo |

**Returns:** Raw file content (plain text). Content-Type derived from extension.

**Use case:** After code search finds a match, fetch the full file to extract a larger context window (20-30 lines around the match).

### Directory Listing

```
GET /2.0/repositories/{workspace}/{repo_slug}/src/{commit}/{path}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| max_depth | int (query) | No | Recursion depth for directory listing |
| q | string (query) | No | Filter expression |
| fields | string (query) | No | Limit response fields (e.g., `values.path,values.type`) |

**Note:** Same endpoint as file content -- behavior changes based on whether path points to a file or directory.

**Use case:** NOT needed for this project. Code search API handles finding files. Only use src endpoint for fetching content of found files.

### Rate Limits

| Endpoint Type | Limit | Window | Notes |
|---------------|-------|--------|-------|
| REST API (authenticated) | 1,000 req/hr | Rolling 1-hour | Default for all authenticated users |
| REST API (scaled, paid) | Up to 10,000 req/hr | Rolling 1-hour | +10 RPH per paid user, max 10K |
| REST API (anonymous) | 60 req/hr | Rolling 1-hour | Never use anonymous -- always authenticate |
| Raw file downloads | 5,000 req/hr | Rolling 1-hour | Separate limit for `/src/{commit}/{path}` content |
| Git operations | 60,000 req/hr | Rolling 1-hour | Not relevant for this project |

**Rate limit headers returned by Bitbucket:**
- `X-RateLimit-Limit` -- Maximum requests in window
- `X-RateLimit-Remaining` -- Requests remaining
- `X-RateLimit-Reset` -- Unix timestamp when window resets

**Budget per translation session (estimated):**
- 200 untranslated keys
- 1 search call per key = 200 calls (or batched: ~20-40 calls with OR queries)
- 1 file content call per unique file = ~30-50 calls (many keys share files)
- Total: 230-250 calls per session (well within 1,000/hr limit)
- With batching: ~50-90 calls per session

### Pagination

All list endpoints return paginated responses:

```json
{
  "size": 100,
  "page": 1,
  "pagelen": 10,
  "next": "https://api.bitbucket.org/2.0/...",
  "previous": "https://api.bitbucket.org/2.0/...",
  "values": [...]
}
```

- Follow `next` URL for more results
- Set `pagelen` to reduce total calls (max varies by endpoint)

## CORS Proxy Architecture

### Cloudflare Worker Implementation Pattern

```
Browser (GitHub Pages)
  --> fetch("https://your-proxy.workers.dev/bitbucket/search/code?...")
    --> Cloudflare Worker
      --> fetch("https://api.bitbucket.org/2.0/workspaces/{ws}/search/code?...")
        with Authorization: Bearer {TOKEN_FROM_ENV}
      <-- Bitbucket response
    <-- Response + Access-Control-Allow-Origin: https://your-gh-pages.github.io
  <-- JSON data
```

**Proxy responsibilities:**
1. Validate `Origin` header (only accept requests from your GitHub Pages domain)
2. Attach `Authorization: Bearer {token}` header from environment variable
3. Forward request to `api.bitbucket.org`
4. Pass through response body
5. Add CORS headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`
6. Handle preflight OPTIONS requests
7. Forward rate limit headers to the browser

**Proxy does NOT:**
- Process or transform Bitbucket responses
- Store any data
- Require a database
- Need any framework

**Environment variables on the Worker:**
- `BITBUCKET_TOKEN` -- The Repository Access Token
- `ALLOWED_ORIGIN` -- The GitHub Pages URL (for CORS validation)
- `BITBUCKET_WORKSPACE` -- Workspace slug (optional, for path validation)

### Security Measures

1. **Origin validation**: Reject requests from non-whitelisted origins
2. **Path whitelist**: Only proxy to `/2.0/workspaces/*/search/code` and `/2.0/repositories/*/src/*` -- block all other Bitbucket endpoints
3. **Method whitelist**: Only allow GET requests (no POST/PUT/DELETE)
4. **Token never reaches browser**: Stored as Cloudflare Worker secret
5. **Rate limiting on proxy**: Cloudflare Workers supports rate limiting via bindings

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Bitbucket OAuth 2.0 Implicit Grant | Deprecated and enforced dead as of March 14, 2026. All tokens fail with 401. |
| Bitbucket OAuth 2.0 Authorization Code | Requires client secret (cannot store in browser). Requires redirect flow. Over-engineered for single-repo access. |
| PKCE (Proof Key for Code Exchange) | NOT supported by Bitbucket Cloud. Community has requested it but no official support exists. |
| Bitbucket Connect / Atlassian Forge | Completely different deployment model (app runs inside Bitbucket UI). Wrong architecture for this project. |
| cors-anywhere (public instance) | Deprecated. Public instances are abused and unreliable. Never for production with auth tokens. |
| Bitbucket Data Center/Server API | Different API surface. Project explicitly only supports Cloud. |
| `GET /teams/{username}/search/code` | Deprecated. Use `/workspaces/{workspace}/search/code` instead. Teams endpoints are removed. |
| App Passwords | Tied to personal Atlassian accounts, not repository-scoped. Wrong granularity. |
| GraphQL API | Bitbucket Cloud does not have a GraphQL API. REST v2.0 is the only option. |
| Direct browser-to-Bitbucket fetch | CORS blocked for authenticated requests. Confirmed broken via community reports and testing. |

## Installation / Setup

### Browser App (No installation)

```
No changes -- vanilla JS, no npm, no build step.
New feature modules added as separate .js files loaded via <script type="module">.
```

### Cloudflare Worker (CORS Proxy)

```bash
# Install Wrangler CLI (Cloudflare Workers tooling)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create Worker project
wrangler init bitbucket-cors-proxy

# Set secrets
wrangler secret put BITBUCKET_TOKEN
wrangler secret put ALLOWED_ORIGIN

# Deploy
wrangler deploy
```

## Version Compatibility Notes

- **Bitbucket API v2.0**: Stable, no known deprecation timeline. Use `/2.0/` prefix on all endpoints.
- **Cloudflare Workers**: Uses V8 runtime, supports standard Web APIs (fetch, Response, Request). No Node.js-specific APIs.
- **ES Modules**: Supported in all modern browsers. `type="module"` scripts are deferred by default. Note: `file://` protocol does NOT support ES module imports -- local development requires a simple HTTP server (`python -m http.server` or `npx serve`).

## Sources

- [Bitbucket Cloud REST API Introduction](https://developer.atlassian.com/cloud/bitbucket/rest/intro/) -- HIGH confidence
- [Bitbucket Cloud REST API Source Endpoints](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/) -- HIGH confidence
- [Bitbucket API Rate Limits](https://support.atlassian.com/bitbucket-cloud/docs/api-request-limits/) -- HIGH confidence
- [Bitbucket Repository Access Tokens](https://support.atlassian.com/bitbucket-cloud/docs/using-access-tokens/) -- HIGH confidence
- [Bitbucket Code Search API Announcement](https://www.atlassian.com/blog/bitbucket/bitbucket-code-search-api-now-available) -- HIGH confidence
- [Bitbucket Code Search Syntax](https://support.atlassian.com/bitbucket-cloud/docs/search-in-bitbucket-cloud/) -- HIGH confidence
- [Bitbucket CORS Issue (Community, Unresolved)](https://community.atlassian.com/forums/Bitbucket-questions/Access-Bitbucket-API-from-Client-Browser-CORS-access-support/qaq-p/1039301) -- HIGH confidence
- [Bitbucket CORS Enable Thread](https://community.atlassian.com/forums/Bitbucket-questions/Enable-CORS-in-Bitbucket-REST-API/qaq-p/637021) -- HIGH confidence
- [Bitbucket OAuth Implicit Grant Deprecation](https://community.developer.atlassian.com/t/deprecation-notice-oauth-1-0-and-implicit-grant-flows-for-bitbucket-cloud/97520) -- HIGH confidence
- [Bitbucket OAuth 2.0 Documentation](https://developer.atlassian.com/cloud/bitbucket/oauth-2/) -- HIGH confidence
- [Cloudflare Workers CORS Proxy Example](https://developers.cloudflare.com/workers/examples/cors-header-proxy/) -- HIGH confidence
- [Bitbucket Search API Go Client (endpoint reference)](https://github.com/DrFaust92/bitbucket-go-client/blob/main/docs/SearchApi.md) -- MEDIUM confidence
- [Bitbucket Scaled Rate Limits Blog](https://www.atlassian.com/blog/bitbucket/introducing-scaled-rate-limits-for-bitbucket-cloud-api) -- HIGH confidence
