# Phase 1: Infrastructure - Research

**Researched:** 2026-03-20
**Domain:** Cloudflare Workers CORS proxy, Bitbucket connection UI, vanilla JS file splitting
**Confidence:** HIGH

## Summary

Phase 1 establishes three foundational capabilities: (1) a Cloudflare Worker CORS proxy that forwards Bitbucket API requests from the browser, (2) a Bitbucket connection UI in the sidebar drawer for workspace/repo/token/branch configuration, and (3) splitting the monolithic 3,458-line `index.html` into multiple JS/CSS files loaded via traditional `<script>` tags.

The CORS proxy is the hard blocker -- Bitbucket Cloud has not supported browser CORS for authenticated requests since 2019. The proxy is approximately 50-80 lines of JavaScript, deployed as a Cloudflare Worker (free tier: 100K requests/day). It validates origin, attaches the Bearer token from environment variables, forwards GET requests to whitelisted Bitbucket API paths, and adds CORS headers to responses.

The file split uses traditional `<script src="...">` tags with a global namespace object (`window.App`) for cross-file communication, NOT ES Modules. This is a locked user decision -- ES Modules cannot work over `file://` protocol, and users need to open `index.html` directly for development.

**Primary recommendation:** Build the Cloudflare Worker first (can be validated independently), then split the monolith, then add Bitbucket connection UI into the newly split file structure.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- App includes built-in deployment guide flow (guides user to deploy their own Cloudflare Worker)
- Proxy URL stored in settings, not entered each time
- Origin restriction: only allow requests from specified domain (GitHub Pages URL)
- Proxy only forwards GET requests to Bitbucket API search and file content endpoints
- Bitbucket connection UI goes in sidebar drawer, same area as Provider/Language settings
- Fields: Workspace slug, Repo slug, Access Token, Branch
- Test button validates connection (like existing Test Key functionality)
- All connection info (workspace, repo, token, branch) stored in localStorage
- Full restructure: existing code also gets split out (not just new features)
- CSS split into separate .css file(s)
- Use traditional `<script src="...">` tags loaded in order -- NOT ES Modules
- Reason: ES Modules do not work over `file://` protocol; users need direct `index.html` opening for dev
- `index.html` becomes pure HTML skeleton + script/link references
- Token stored in localStorage for v1 (same pattern as existing API keys)
- Single repo connection, no multi-repo switching

### Claude's Discretion
- JS file split granularity and naming (e.g., state.js, api.js, bitbucket.js)
- CSS file split approach (single file or multiple themed files)
- Cloudflare Worker implementation details
- Bitbucket connection UI specific position and layout within the drawer

### Deferred Ideas (OUT OF SCOPE)
- Token security migration to proxy-side storage -- future version
- Multi-repo switching support -- if demand emerges later
</user_constraints>

## IMPORTANT: Requirement vs Context Conflicts

Two requirement/context conflicts exist that the planner MUST resolve:

### Conflict 1: INFRA-03 vs CONTEXT.md Token Storage
- **INFRA-03** states: "Access Token stored server-side in Cloudflare Worker (not browser localStorage)"
- **CONTEXT.md** states: "First version token in localStorage (same pattern as existing API keys)"
- **Success criteria** states: "Access token is stored server-side in the Cloudflare Worker, not in browser localStorage or sessionStorage"
- **Resolution for planner:** The CONTEXT.md represents the user's latest explicit decision. However, the success criteria contradict it. The planner should implement the **CONTEXT.md approach** (localStorage) since the user explicitly chose it with reasoning, BUT must flag this conflict to the user before implementation begins. The proxy still needs a token mechanism (env var `BITBUCKET_TOKEN`) for the forwarding pattern described in STACK.md.

### Conflict 2: INFRA-04 vs CONTEXT.md Module System
- **INFRA-04** states: "Split into ES Modules multi-file structure (no bundler)"
- **CONTEXT.md** states: "Use traditional `<script src>` tags, NOT ES Modules. Reason: file:// protocol."
- **Resolution for planner:** Use CONTEXT.md decision (traditional script tags). The user explicitly chose this with clear rationale. Update the requirement understanding accordingly.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Deploy Cloudflare Workers CORS proxy for Bitbucket API forwarding + CORS headers | Cloudflare Worker CORS proxy pattern documented with full code example; wrangler v4.75.0 for deployment; `wrangler.jsonc` config format; `wrangler secret put` for token storage |
| INFRA-02 | User can input Bitbucket workspace/repo info, connect via Access Token | Sidebar drawer structure analyzed (lines 1443-1521); existing Test Key pattern available for reference; localStorage `translate_` prefix convention established |
| INFRA-03 | Access Token secure storage (CONFLICTED -- see conflicts section above) | localStorage pattern matches existing API key storage; proxy env var pattern also researched |
| INFRA-04 | Split monolithic index.html into multi-file structure (CONFLICTED -- traditional scripts, not ES Modules) | 3,458-line file analyzed; CSS lines 10-1404, JS lines 1567-3456; global namespace pattern (`window.App`) researched for cross-file state sharing |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Cloudflare Workers (Wrangler) | v4.75.0 | CORS proxy deployment CLI | Official Cloudflare tooling; `npm create cloudflare@latest` for project scaffolding |
| Vanilla JS (no framework) | ES5 + async/await | Application code | Existing project convention; no build step |
| Fetch API | Browser native | HTTP client for proxy calls | Already used in app; works with AbortController |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | N/A | No additional libraries | Project principle: zero external JS dependencies |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Traditional `<script>` tags | ES Modules (`type="module"`) | ES Modules cleaner dependency graph but blocked on `file://` protocol -- user explicitly chose script tags |
| Cloudflare Workers | Vercel Edge Functions, Netlify Functions | Alternatives viable but add deployment complexity; CF Workers has best free tier and zero cold start |

**Installation (Cloudflare Worker only):**
```bash
npm create cloudflare@latest -- bitbucket-cors-proxy
cd bitbucket-cors-proxy
# Set secrets
npx wrangler secret put BITBUCKET_TOKEN
npx wrangler secret put ALLOWED_ORIGIN
# Deploy
npx wrangler deploy
```

**Version verification:** Wrangler v4.75.0 confirmed via npm registry (published 2026-03-18).

## Architecture Patterns

### Recommended Project Structure After Split

```
index.html                  # HTML skeleton + <link>/<script> references only
css/
  styles.css                # All CSS extracted from index.html <style> block
js/
  app.js                    # Entry point: init sequence, event wiring
  state.js                  # state object + setState() + window.App namespace setup
  i18n.js                   # UI_TRANSLATIONS + t() + applyI18n()
  dom.js                    # DOM ref cache (dom object)
  constants.js              # PROVIDER_CONFIG, LANG_CODE_TO_NAME, MAX_FILE_BYTES, etc.
  ui.js                     # Theme, toast, drawer, collapsible, upload, editor table
  providers.js              # fetchWithTimeout, callDeepL, callOpenAI, callGemini, callTranslateAPI
  translation.js            # doTranslate, showTranslateConfirm, batch logic, progress
  cell-edit.js              # Cell edit modal, single-cell translate
  bitbucket.js              # Bitbucket connection UI, API client, test connection
proxy/
  wrangler.jsonc            # Cloudflare Worker config
  src/
    index.js                # Worker entry point (~60-80 lines)
  .dev.vars                 # Local dev secrets (gitignored)
```

**Rationale for granularity:** 8-10 JS files is the sweet spot for this codebase size. Fewer files keep load order manageable with `<script>` tags. More files would create excessive global namespace management overhead.

### Pattern 1: Global Namespace for Cross-File Communication

**What:** All JS files share state through a `window.App` namespace object instead of ES Module imports.
**When to use:** Every file that needs to access shared state, DOM refs, or utility functions.

```javascript
// js/state.js -- loaded FIRST
(function () {
  'use strict';

  // Create global namespace
  window.App = window.App || {};

  var state = {
    uiLang: 'en',
    provider: 'deepl',
    model: '',
    apiKey: '',
    jsonData: null,
    languages: [],
    selected: new Set(),
    translating: false,
    contextPrompt: '',
    theme: 'light',
    editedCells: new Map(),
    fullyTranslatedLangs: new Set(),
    aiTranslatedCells: new Set(),
    originalTranslations: {},
    importedJsonData: null,
    // New Bitbucket fields
    bitbucketWorkspace: '',
    bitbucketRepo: '',
    bitbucketToken: '',
    bitbucketBranch: 'main',
    proxyUrl: '',
    bitbucketConnected: false,
  };

  function setState(patch) {
    state = Object.assign({}, state, patch);
  }

  function getState() {
    return state;
  }

  // Expose to other files
  App.state = state;
  App.getState = getState;
  App.setState = function (patch) {
    setState(patch);
    App.state = state; // Update reference after immutable swap
  };
})();
```

```javascript
// js/bitbucket.js -- loaded AFTER state.js, dom.js, i18n.js
(function () {
  'use strict';
  var App = window.App;

  function testBitbucketConnection() {
    var s = App.getState();
    if (!s.proxyUrl || !s.bitbucketWorkspace || !s.bitbucketRepo) {
      App.showToast(App.t('bbMissingFields'), 'error');
      return Promise.resolve(false);
    }
    var url = s.proxyUrl + '/bitbucket/2.0/repositories/'
      + encodeURIComponent(s.bitbucketWorkspace) + '/'
      + encodeURIComponent(s.bitbucketRepo);
    return App.fetchWithTimeout(url, {
      headers: { 'Authorization': 'Bearer ' + s.bitbucketToken }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      App.setState({ bitbucketConnected: true });
      App.showToast(App.t('bbConnected'), 'success');
      return true;
    })
    .catch(function (err) {
      App.setState({ bitbucketConnected: false });
      App.showToast(App.t('bbConnectFailed', err.message), 'error');
      return false;
    });
  }

  App.testBitbucketConnection = testBitbucketConnection;
})();
```

### Pattern 2: Script Loading Order in index.html

**What:** Explicit `<script>` tag order ensures dependencies are available.
**When to use:** Always -- this is the only module system.

```html
<!-- index.html -->
<link rel="stylesheet" href="css/styles.css">

<!-- JS: Load order matters! -->
<script src="js/state.js"></script>      <!-- App namespace + state -->
<script src="js/constants.js"></script>  <!-- PROVIDER_CONFIG, etc. -->
<script src="js/i18n.js"></script>       <!-- UI_TRANSLATIONS, t() -->
<script src="js/dom.js"></script>        <!-- DOM ref cache -->
<script src="js/ui.js"></script>         <!-- Theme, toast, drawer -->
<script src="js/providers.js"></script>  <!-- API calls -->
<script src="js/translation.js"></script><!-- Translation workflow -->
<script src="js/cell-edit.js"></script>  <!-- Cell edit modal -->
<script src="js/bitbucket.js"></script>  <!-- Bitbucket integration -->
<script src="js/app.js"></script>        <!-- Entry point: init (LAST) -->
```

### Pattern 3: Cloudflare Worker CORS Proxy

**What:** Thin proxy that validates origin, attaches auth, forwards to Bitbucket, adds CORS headers.
**When to use:** All Bitbucket API requests from the browser.

```javascript
// proxy/src/index.js
export default {
  async fetch(request, env) {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    // Only allow GET
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Validate origin
    var origin = request.headers.get('Origin') || '';
    if (origin !== env.ALLOWED_ORIGIN) {
      return new Response('Forbidden', { status: 403 });
    }

    // Parse path: /bitbucket/2.0/... -> https://api.bitbucket.org/2.0/...
    var url = new URL(request.url);
    var path = url.pathname;
    if (!path.startsWith('/bitbucket/')) {
      return new Response('Not found', { status: 404 });
    }

    // Whitelist: only search and src endpoints
    var bbPath = path.replace('/bitbucket/', '');
    if (!isAllowedPath(bbPath)) {
      return new Response('Forbidden path', { status: 403 });
    }

    var bbUrl = 'https://api.bitbucket.org/' + bbPath + url.search;

    var bbResponse = await fetch(bbUrl, {
      headers: {
        'Authorization': 'Bearer ' + env.BITBUCKET_TOKEN,
        'Accept': 'application/json',
      },
    });

    // Clone response and add CORS headers
    var response = new Response(bbResponse.body, bbResponse);
    response.headers.set('Access-Control-Allow-Origin', env.ALLOWED_ORIGIN);
    response.headers.set('Vary', 'Origin');

    return response;
  },
};

function isAllowedPath(path) {
  // Allow: /2.0/workspaces/{ws}/search/code
  // Allow: /2.0/repositories/{ws}/{repo}/src/{commit}/{path}
  // Allow: /2.0/repositories/{ws}/{repo} (for connection test)
  return /^2\.0\/(workspaces\/[^/]+\/search\/code|repositories\/[^/]+\/[^/]+(\/src\/.+)?)/.test(path);
}

function handleOptions(request, env) {
  var origin = request.headers.get('Origin') || '';
  if (origin !== env.ALLOWED_ORIGIN) {
    return new Response('Forbidden', { status: 403 });
  }
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

### Anti-Patterns to Avoid

- **Circular script dependencies:** With `<script>` tag loading, file A cannot call file B if B loads after A during initialization. All cross-file calls must happen through event handlers or deferred init functions, not at parse time.
- **Mutating `window.App.state` directly:** Must always go through `App.setState()` to preserve immutability pattern.
- **Fat proxy:** The Cloudflare Worker must remain a dumb forwarder. No business logic, no response transformation, no data storage.
- **Big-bang refactor:** Do NOT try to split all 3,458 lines in one step. Extract one concern at a time, test after each extraction.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CORS proxy | Custom Express/Node server | Cloudflare Workers | Free tier sufficient, zero maintenance, global edge, ~60 lines of code |
| Worker deployment | Manual upload via dashboard | `wrangler` CLI | Reproducible deploys, secret management, local dev server |
| Origin validation | IP-based filtering | `Origin` header check in Worker | Standard CORS pattern, works with CDN/proxy chains |
| Bitbucket auth | OAuth 2.0 flow | Repository Access Token (Bearer) | OAuth implicit deprecated Mar 2026; PKCE not supported by Bitbucket; bearer token is simplest for single-repo |

**Key insight:** The CORS proxy is the only "infrastructure" that requires deployment outside the static web app. Keep it minimal -- every line of logic in the proxy is a line that's harder to debug than browser-side code.

## Common Pitfalls

### Pitfall 1: Script Loading Order Bugs
**What goes wrong:** A file references `App.t()` or `App.dom` before the file defining it has loaded, causing `undefined` errors.
**Why it happens:** Traditional `<script>` tags execute sequentially but developers may not track the dependency graph.
**How to avoid:** Define a strict load order in `index.html` and document which files depend on which. Each IIFE should only reference `window.App` properties set by previously loaded files.
**Warning signs:** `Cannot read property of undefined` errors on page load.

### Pitfall 2: IIFE State Reference Goes Stale
**What goes wrong:** A file captures `var state = App.state` at load time. After `App.setState()` is called, the local `state` variable still points to the old object.
**Why it happens:** `setState()` replaces the state object (immutable pattern). The captured local reference does not update.
**How to avoid:** Always use `App.getState()` when you need current state in event handlers. Never cache `App.state` in a long-lived variable.
**Warning signs:** UI shows stale data after state updates.

### Pitfall 3: Proxy Deployed Without Origin Restriction
**What goes wrong:** The Cloudflare Worker accepts requests from any origin. Anyone who discovers the URL can use it to proxy Bitbucket API requests using the stored token.
**Why it happens:** Developer skips origin validation during development and forgets to add it before deploy.
**How to avoid:** Origin validation is the FIRST check in the Worker, not an afterthought. Use `env.ALLOWED_ORIGIN` from secrets. During local dev, use `.dev.vars` with `ALLOWED_ORIGIN=http://localhost:8080`.
**Warning signs:** Requests from unexpected origins in Worker logs.

### Pitfall 4: CSS Extraction Breaks Theme Variables
**What goes wrong:** After extracting CSS to `styles.css`, the `[data-theme="dark"]` selector or CSS custom properties stop working because of specificity or load order issues.
**Why it happens:** Inline `<style>` blocks have different specificity behavior than external stylesheets in rare edge cases, and the `<link>` must be in `<head>` before body renders.
**How to avoid:** Place `<link rel="stylesheet" href="css/styles.css">` in `<head>` exactly where the old `<style>` block was. Verify both light and dark themes after extraction.
**Warning signs:** Flash of unstyled content, dark mode colors missing.

### Pitfall 5: localStorage Key Collision
**What goes wrong:** New Bitbucket settings keys collide with existing `translate_*` keys or break the loading logic.
**Why it happens:** Not following the established naming convention.
**How to avoid:** Use `translate_bb_workspace`, `translate_bb_repo`, `translate_bb_token`, `translate_bb_branch`, `translate_bb_proxy_url` -- consistent `translate_bb_` prefix for all Bitbucket settings.
**Warning signs:** Existing API keys or provider settings disappear after adding Bitbucket fields.

## Code Examples

### Bitbucket Connection UI in Sidebar Drawer

Following the existing Provider section pattern (lines 1448-1486):

```html
<!-- Bitbucket Connection Section (added before Provider section in drawer) -->
<div class="card bitbucket-section" id="bitbucket-section">
  <div class="card-title-collapsible" id="bb-collapsible">
    <div class="card-title" data-i18n="bbTitle">Bitbucket Connection</div>
    <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </div>
  <div class="collapsible-body" id="bb-collapsible-body">
    <div class="bb-field-group">
      <label for="bb-proxy-url" data-i18n="bbProxyUrl">Proxy URL</label>
      <input type="url" id="bb-proxy-url" placeholder="https://your-proxy.workers.dev" />
    </div>
    <div class="bb-field-group">
      <label for="bb-workspace" data-i18n="bbWorkspace">Workspace</label>
      <input type="text" id="bb-workspace" placeholder="my-workspace" />
    </div>
    <div class="bb-field-group">
      <label for="bb-repo" data-i18n="bbRepo">Repository</label>
      <input type="text" id="bb-repo" placeholder="my-repo" />
    </div>
    <div class="bb-field-group">
      <label for="bb-branch" data-i18n="bbBranch">Branch</label>
      <input type="text" id="bb-branch" placeholder="main" value="main" />
    </div>
    <div class="bb-field-group">
      <label for="bb-token" data-i18n="bbToken">Access Token</label>
      <input type="password" id="bb-token" placeholder="Bitbucket Repository Access Token" />
    </div>
    <div class="bb-actions">
      <span class="badge badge-none" id="bb-badge" data-i18n="bbNotConnected">Not Connected</span>
      <button class="btn-test-key" id="bb-test-btn" data-i18n="bbTestConnection">Test Connection</button>
    </div>
  </div>
</div>
```

### localStorage Persistence Pattern (Matching Existing Convention)

```javascript
// Loading Bitbucket settings on startup (in bitbucket.js init)
function initBitbucket() {
  var proxyUrl = localStorage.getItem('translate_bb_proxy_url') || '';
  var workspace = localStorage.getItem('translate_bb_workspace') || '';
  var repo = localStorage.getItem('translate_bb_repo') || '';
  var branch = localStorage.getItem('translate_bb_branch') || 'main';
  var token = localStorage.getItem('translate_bb_token') || '';

  App.setState({
    proxyUrl: proxyUrl,
    bitbucketWorkspace: workspace,
    bitbucketRepo: repo,
    bitbucketBranch: branch,
    bitbucketToken: token,
  });

  // Populate UI fields
  App.dom.bbProxyUrl.value = proxyUrl;
  App.dom.bbWorkspace.value = workspace;
  App.dom.bbRepo.value = repo;
  App.dom.bbBranch.value = branch;
  App.dom.bbToken.value = token;
}

// Saving on input change (debounced)
function saveBitbucketSetting(key, value) {
  localStorage.setItem('translate_bb_' + key, value);
}
```

### Wrangler Configuration

```jsonc
// proxy/wrangler.jsonc
{
  "name": "bitbucket-cors-proxy",
  "main": "src/index.js",
  "compatibility_date": "2026-03-20"
}
```

```bash
# .dev.vars (gitignored, for local development)
BITBUCKET_TOKEN=your-repo-access-token-here
ALLOWED_ORIGIN=http://localhost:8080
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `wrangler init` | `npm create cloudflare@latest` | Wrangler v3+ | New project scaffolding command |
| `wrangler.toml` | `wrangler.jsonc` | Wrangler v3.91.0 | JSONC now recommended; new features JSONC-first |
| Bitbucket OAuth Implicit Grant | Repository Access Token (Bearer) | March 14, 2026 (enforced) | Implicit grant is DEAD -- all tokens return 401 |
| Single IIFE monolith | Multi-file IIFEs with global namespace | This phase | Enables maintainable codebase for new features |

**Deprecated/outdated:**
- `wrangler init` -- replaced by `npm create cloudflare@latest` (C3 CLI)
- Bitbucket OAuth Implicit Grant -- enforced dead as of March 14, 2026
- Bitbucket `/teams/` endpoints -- removed, use `/workspaces/` instead

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual browser testing (no automated test framework in project) |
| Config file | None -- project has zero test infrastructure |
| Quick run command | Open `index.html` in browser, verify UI |
| Full suite command | Manual checklist (see below) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | CORS proxy forwards Bitbucket API request and returns valid data | smoke | `curl -H "Origin: {ALLOWED_ORIGIN}" https://{proxy}/bitbucket/2.0/repositories/{ws}/{repo}` | N/A -- manual curl |
| INFRA-02 | User enters workspace/repo/token, clicks Test, sees success/failure | manual-only | Open browser, fill fields, click Test Connection | N/A |
| INFRA-03 | Token storage location (localStorage per CONTEXT.md decision) | manual-only | Dev Tools > Application > localStorage > verify `translate_bb_token` key | N/A |
| INFRA-04 | App loads as multi-file, existing translation features work identically | manual-only | Open `index.html` via HTTP server, test upload/translate/download flow | N/A |

**Justification for manual-only:** This is a zero-dependency static web app with no test framework. Adding a test framework (Jest/Vitest) would require npm and a build step, which violates the project's "no build step" principle. The Cloudflare Worker can be validated via `curl` commands. Browser UI validation requires manual interaction.

### Sampling Rate
- **Per task commit:** Open in browser, verify no console errors, test affected feature
- **Per wave merge:** Full manual checklist: upload JSON, select provider, enter key, test key, translate, download, verify Bitbucket connection
- **Phase gate:** All 4 success criteria verified manually before completion

### Wave 0 Gaps
- [ ] No automated test infrastructure -- all validation is manual
- [ ] Need a simple HTTP server for local dev testing (`python -m http.server` or `npx serve`)
- [ ] Need a curl-based smoke test script for the CORS proxy

## Open Questions

1. **Token storage conflict between INFRA-03 and CONTEXT.md**
   - What we know: INFRA-03 says server-side, CONTEXT.md says localStorage, success criteria says server-side
   - What's unclear: Which one the user actually wants for v1
   - Recommendation: Follow CONTEXT.md (localStorage) as it represents the most recent explicit user decision with rationale. Flag this to user before implementation.

2. **Proxy URL discovery for end users**
   - What we know: App will include a deployment guide flow; proxy URL stored in settings
   - What's unclear: How much in-app guidance is needed vs. a README section
   - Recommendation: Minimal in-app guidance (a help link next to the Proxy URL field pointing to a setup guide section in README). Keep Phase 1 scope tight.

3. **Token forwarding architecture**
   - What we know: If token is in localStorage (CONTEXT.md), browser sends it to proxy; if server-side (INFRA-03), proxy reads from env var
   - What's unclear: With localStorage approach, does browser send token to proxy which forwards it? Or does proxy have its own token?
   - Recommendation: Hybrid -- proxy stores a shared token in env var (for the team's repo), browser does NOT send tokens to proxy. This aligns with the proxy architecture in STACK.md and is more secure than browser-to-proxy token forwarding. localStorage stores workspace/repo/branch/proxyUrl only, NOT the token.

## Sources

### Primary (HIGH confidence)
- [Cloudflare Workers CORS Proxy Example](https://developers.cloudflare.com/workers/examples/cors-header-proxy/) -- full Worker code pattern
- [Cloudflare Workers Get Started Guide](https://developers.cloudflare.com/workers/get-started/guide/) -- C3 scaffolding, wrangler deploy
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/) -- `wrangler secret put` for token storage
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) -- `wrangler.jsonc` format (recommended over TOML)
- `.planning/research/STACK.md` -- Bitbucket API endpoints, rate limits, auth patterns
- `.planning/research/ARCHITECTURE.md` -- component boundaries, data flow, file split strategy
- `.planning/research/PITFALLS.md` -- CORS blocking, rate limits, XSS, proxy security
- `.planning/codebase/STRUCTURE.md` -- index.html internal structure (line ranges)
- `.planning/codebase/CONVENTIONS.md` -- naming, state management, error handling patterns

### Secondary (MEDIUM confidence)
- [npm wrangler package](https://www.npmjs.com/package/wrangler) -- v4.75.0 confirmed (published 2026-03-18)
- [Cloudflare Workers Wrangler JSONC Discussion](https://github.com/cloudflare/workers-sdk/discussions/1951) -- JSONC now preferred over TOML

### Tertiary (LOW confidence)
- [rednafi/cors-proxy GitHub](https://github.com/rednafi/cors-proxy) -- community CORS proxy implementation (reference only)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Cloudflare Workers well-documented, vanilla JS is existing project
- Architecture: HIGH -- file split pattern well-understood, global namespace is established JS pattern
- Pitfalls: HIGH -- CORS blocking confirmed by multiple sources, script loading order is a known concern
- Token storage: LOW -- conflicting requirements need user resolution

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable domain, 30-day validity)
