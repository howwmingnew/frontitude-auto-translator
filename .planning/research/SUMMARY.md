# Project Research Summary

**Project:** Frontitude Context-Aware Translator -- Bitbucket Integration Milestone
**Domain:** Browser-based localization tool with source code context integration
**Researched:** 2026-03-20
**Confidence:** HIGH

## Executive Summary

This milestone adds context-aware translation to an existing static web app that translates Frontitude-exported JSON files. The core idea: search a Bitbucket Cloud repository for where each translation key is used in WPF source code (.xaml/.cs files), extract the surrounding code context, generate AI-powered human-readable descriptions of that context, and inject those descriptions into translation prompts for higher-quality results. Competitors like Crowdin and Lokalise offer similar "context harvesting" features, making this table stakes for serious localization tooling.

The single most important finding across all research is that **Bitbucket Cloud API does not support CORS for authenticated browser requests**. This is a confirmed, long-standing issue (since 2019, unresolved). The app cannot remain a pure static web app for Bitbucket features. A lightweight Cloudflare Workers CORS proxy is required -- approximately 30 lines of code, free-tier sufficient (100K requests/day), and it eliminates the token-in-browser security concern by storing the Repository Access Token server-side. This is the only new infrastructure required; the browser-side code remains vanilla JS with no build step, using ES Modules for the new multi-file architecture.

The key risks are: (1) Bitbucket API rate limits (1,000 req/hr) being exhausted during bulk key searches -- mitigated by batching queries, caching results, and searching only untranslated keys; (2) insufficient code context from the search API for meaningful AI descriptions -- mitigated by follow-up file content fetches and XAML-aware parsing; and (3) breaking existing functionality during the file split from monolithic index.html to ES Modules -- mitigated by building new features as standalone modules first and extracting existing code incrementally.

## Key Findings

### Recommended Stack

The stack stays minimal. No frameworks, no build step, no npm dependencies on the browser side. The only new infrastructure is a Cloudflare Worker CORS proxy.

**Core technologies:**
- **Cloudflare Workers**: CORS proxy for Bitbucket API -- free tier (100K req/day), zero cold start, ~30 lines of code. Stores the Bitbucket token server-side, eliminating browser-side token exposure.
- **Bitbucket Cloud REST API v2.0**: Code search (`/workspaces/{ws}/search/code`) and file content retrieval (`/repositories/{ws}/{repo}/src/{commit}/{path}`). No GraphQL option exists. 1,000 req/hr rate limit.
- **Repository Access Token (Bearer)**: Authentication scoped to a single repository. OAuth is not viable -- Implicit Grant is deprecated (enforced March 2026), Authorization Code requires a client secret, and PKCE is not supported by Bitbucket.
- **ES Modules (native)**: Multi-file architecture via `<script type="module">`. No bundler. Enables clean separation of new Bitbucket/context modules from existing code.
- **Vanilla JS (ES2020+)**: Consistent with existing codebase. No framework justified for ~5 new UI panels.

**Critical version note:** ES Modules over `file://` protocol do not work -- local development will require a simple HTTP server (`python -m http.server` or `npx serve`).

### Expected Features

**Must have (table stakes):**
- Key-to-code search via Bitbucket API (find where keys are used in .xaml/.cs files)
- Code snippet display (filename + surrounding lines for translator context)
- AI-generated human-readable context descriptions (e.g., "Button label on the settings screen")
- Context-enhanced translation prompts (inject discovered context into LLM system prompts)
- Selective context lookup (untranslated keys only -- saves API quota)
- Loading/progress indicators (multi-phase: searching code, generating descriptions, translating)
- Graceful error handling (per-key failures, rate limits, network errors)

**Should have (differentiators):**
- Dual translation modes: Quick (no context, existing flow) vs Precise (with Bitbucket context lookup)
- Expandable context panel per key in the Content Preview table
- WPF/LocExtension-aware code parsing (not just generic string search)
- Multi-file context aggregation (show all locations where a key is used)
- Context confidence indicators (found vs not found in code)

**Defer (v2+):**
- Translation edit feedback loop (edited translations fed back into subsequent prompts)
- Offline context caching (explicitly out of scope per PROJECT.md)
- Inline translation editing in context panel (high complexity, ship basic context first)
- Screenshot/visual context capture (impractical for desktop WPF app from a web tool)

### Architecture Approach

The app splits from a monolithic index.html into ES Modules organized by domain: `bitbucket/` (API client, code search, context extraction, session cache), `context/` (AI description generation, prompt injection, UI panel), `providers/` (existing translation providers), and `ui/` (existing UI components). New Bitbucket modules are greenfield and built as standalone ES modules from the start. Existing code is extracted incrementally using a `window.AppState` bridge pattern during migration. The Cloudflare Worker proxy is a separate deployment (~30 LOC) that validates origin, forwards GET requests to `api.bitbucket.org`, and adds CORS headers.

**Major components:**
1. **Cloudflare Worker CORS Proxy** -- Forwards browser requests to Bitbucket API with auth token, adds CORS headers. Origin-validated, path-whitelisted (search + src endpoints only), GET-only.
2. **BitbucketClient + CodeSearch** -- API client layer handling authentication, request construction, rate limit tracking, and code search query building.
3. **ContextExtractor** -- Parses search results into structured context: file path, surrounding code lines, UI element type from XAML hierarchy.
4. **ContextDescriber** -- Sends structured context to OpenAI/Gemini to generate human-readable descriptions. Reuses the user's existing LLM provider and key.
5. **ContextPromptInjector** -- Merges discovered context into translation system prompts alongside the existing user-supplied context prompt.
6. **ContextPanel** -- Expandable UI panel in Content Preview table showing code snippets, AI descriptions, and file references per key.
7. **ContextCache** -- In-memory session cache (Map) to avoid re-querying Bitbucket for the same keys.

### Critical Pitfalls

1. **CORS blocks all authenticated Bitbucket API calls from the browser** -- Resolve in Phase 1 by deploying Cloudflare Worker proxy. Validate with a real API call before building anything else. This is a complete feature blocker if not addressed first.
2. **Rate limits exhausted during bulk key search** -- Batch queries using `"key1" OR "key2"` syntax, search only untranslated keys, cache aggressively, implement concurrency limiter (3-5 parallel requests) with exponential backoff on 429. Show remaining API budget to users.
3. **Access token security in a static web app** -- Best mitigation: store token in the CORS proxy (server-side), never in the browser. If browser-side storage is needed, use sessionStorage + CSP headers + read-only token scope.
4. **Insufficient code context from search API** -- Follow up search results with full file content fetch, extract 20-30 lines around match, parse XAML parent hierarchy. Budget 2 API calls per key.
5. **AI context generation cost/latency** -- Batch 10-20 keys per AI call, use cheaper models (GPT-4o-mini, Gemini Flash), generate descriptions lazily (on panel expand, not upfront for all keys).

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Infrastructure -- CORS Proxy and File Architecture

**Rationale:** Everything depends on Bitbucket API access working, which requires the CORS proxy. The file split is also foundational -- adding 1,500+ lines to a 3,458-line monolith is not viable. These are independent and can be built in parallel.
**Delivers:** Deployed Cloudflare Worker proxy with origin validation, path whitelisting, and server-side token storage. ES Module file structure with bridge pattern for existing code. Simple HTTP dev server setup.
**Addresses features:** None directly (infrastructure only).
**Avoids pitfalls:** Pitfall 1 (CORS blocking), Pitfall 3 (token security -- token stays server-side), Pitfall 7 (proxy security -- origin validation + path whitelist), Pitfall 10 (file migration -- incremental approach).

### Phase 2: Code Search Pipeline

**Rationale:** With the proxy working, build the core value chain: find where translation keys appear in source code. This is the foundation that all context features depend on.
**Delivers:** BitbucketClient, CodeSearch module, ContextExtractor, ContextCache. Settings UI for workspace/repo configuration. Ability to search for any key and get structured results (file path, surrounding code, UI element type).
**Addresses features:** Key-to-code search, code snippet display, selective lookup (untranslated keys only), WPF/LocExtension-aware parsing, multi-file aggregation.
**Avoids pitfalls:** Pitfall 2 (rate limits -- batching + caching + concurrency control), Pitfall 6 (search syntax -- test against real repo early), Pitfall 8 (pagination -- handle `next` field), Pitfall 9 (token expiry -- detect 401 and prompt re-auth).

### Phase 3: AI Context Generation

**Rationale:** With code context available, add the AI layer that transforms raw code snippets into human-readable descriptions and injects them into translation prompts. This is where the feature delivers its core value.
**Delivers:** ContextDescriber module, ContextPromptInjector, enhanced PromptBuilder. AI-generated descriptions like "Button label on the login settings screen." Context injected into translation system prompts for OpenAI/Gemini providers.
**Addresses features:** Human-readable context descriptions, context-enhanced translation prompts.
**Avoids pitfalls:** Pitfall 4 (insufficient context -- uses full file content from Phase 2), Pitfall 5 (AI token budget -- batched calls, lazy generation, cheap models).

### Phase 4: Context UX and Mode Toggle

**Rationale:** With the full pipeline working (search, extract, describe, inject), build the user-facing UX: dual mode toggle, expandable context panel, progress indicators, and confidence scoring.
**Delivers:** Quick/Precise mode toggle in translation UI, expandable ContextPanel per key in Content Preview table, multi-phase progress indicators, context confidence indicators, graceful error states with retry.
**Addresses features:** Dual translation modes, context panel, loading/progress indicators, error handling, context confidence scoring.
**Avoids pitfalls:** Pitfall 2 (rate limit UX -- show remaining budget), Pitfall 9 (token expiry UX -- clear re-auth prompt).

### Phase 5: Polish and Edge Cases

**Rationale:** Harden the feature for real-world usage. Handle edge cases discovered during testing with real data.
**Delivers:** DeepL provider restriction in Precise mode (with clear messaging that context only works with LLM providers), performance optimization for large files (lazy description generation), comprehensive error recovery, rate limit budget display.
**Addresses features:** Anti-feature handling (DeepL context limitation messaging), scalability for large files.

### Phase Ordering Rationale

- Phase 1 must come first because the CORS proxy is a hard blocker -- zero Bitbucket API calls work without it.
- Phase 2 before Phase 3 because AI descriptions require code context as input.
- Phase 3 before Phase 4 because the UX panels need the full pipeline (search + AI) to display meaningful content. Building UI shells without real data leads to rework.
- Phase 4 as the integration phase where all backend pieces come together into a cohesive user experience.
- Phase 5 last because edge cases and polish are only discoverable after real-world testing with the complete pipeline.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** CORS proxy needs a spike to validate the exact Cloudflare Worker config resolves the Bitbucket CORS issue end-to-end. LOW risk but must be validated before proceeding.
- **Phase 2:** Bitbucket code search query syntax (`ext:` modifier support, OR query limits, actual response format for LocExtension patterns) needs validation against the real repository. MEDIUM research risk -- the `ext:xaml` modifier may require `path:*.xaml` syntax instead.
- **Phase 3:** AI description prompt engineering needs iteration. The right prompt to generate useful 1-2 sentence descriptions from XAML code context is not obvious. MEDIUM research risk.

Phases with standard patterns (skip research-phase):
- **Phase 4:** UI work (expandable panels, toggle buttons, progress bars) follows well-established DOM patterns already used in the existing app. LOW risk.
- **Phase 5:** Error handling and edge cases are straightforward engineering. LOW risk.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations based on official Atlassian docs and Cloudflare docs. CORS issue confirmed by multiple community reports. OAuth deprecation enforced. |
| Features | HIGH | Feature landscape validated against Crowdin, Lokalise, Tolgee, and other competitors. Clear table stakes vs differentiator separation. |
| Architecture | HIGH | ES Modules without build step is well-established. Component boundaries follow clean separation of concerns. Build order derived from dependency analysis. |
| Pitfalls | HIGH | Top pitfalls (CORS, rate limits, token security) are well-documented with official sources. MEDIUM confidence on search syntax specifics (needs real-repo validation). |

**Overall confidence:** HIGH

### Gaps to Address

- **Code search `ext:` modifier for XAML**: Documentation confirms `ext:` syntax but actual behavior for `.xaml` files needs validation. May need `path:*.xaml` or `lang:xml` instead. Test in Phase 2 spike.
- **OR query batch size limits**: Batching keys with `"key1" OR "key2"` is the rate limit strategy, but the 250-character query limit constrains how many keys fit per query. Estimate 3-5 keys per batch query. Needs empirical testing.
- **Code search context window size**: The `content_matches` response returns matched lines but the exact number of surrounding lines is not documented. Determines whether follow-up file content fetch is always needed or only sometimes.
- **ES Module migration bridge**: The `window.AppState` bridge between the existing IIFE and new ES modules needs careful design to avoid race conditions during the transition period.
- **DeepL + Precise mode UX**: DeepL does not accept contextual prompts (not an LLM). Need clear UX design for informing users that Precise mode only works with OpenAI/Gemini.

## Sources

### Primary (HIGH confidence)
- [Bitbucket Cloud REST API Introduction](https://developer.atlassian.com/cloud/bitbucket/rest/intro/)
- [Bitbucket Cloud REST API Source Endpoints](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/)
- [Bitbucket API Rate Limits](https://support.atlassian.com/bitbucket-cloud/docs/api-request-limits/)
- [Bitbucket Repository Access Tokens](https://support.atlassian.com/bitbucket-cloud/docs/using-access-tokens/)
- [Bitbucket Code Search Syntax](https://support.atlassian.com/bitbucket-cloud/docs/search-in-bitbucket-cloud/)
- [Bitbucket OAuth 2.0 Documentation](https://developer.atlassian.com/cloud/bitbucket/oauth-2/)
- [Bitbucket OAuth Implicit Grant Deprecation](https://community.developer.atlassian.com/t/deprecation-notice-oauth-1-0-and-implicit-grant-flows-for-bitbucket-cloud/97520)
- [Cloudflare Workers CORS Proxy Documentation](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
- [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)

### Secondary (MEDIUM confidence)
- [Bitbucket CORS Issue (Community, Unresolved since 2019)](https://community.atlassian.com/forums/Bitbucket-questions/Access-Bitbucket-API-from-Client-Browser-CORS-access-support/qaq-p/1039301)
- [Bitbucket Code Search API Announcement](https://www.atlassian.com/blog/bitbucket/bitbucket-code-search-api-now-available)
- [Bitbucket Scaled Rate Limits Blog](https://www.atlassian.com/blog/bitbucket/introducing-scaled-rate-limits-for-bitbucket-cloud-api)
- [Crowdin Context Harvester CLI (GitHub)](https://github.com/crowdin/context-harvester)
- [Crowdin Context Harvesting Features](https://crowdin.com/features/context-harvesting)
- [MDN ES Modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [WPF Globalization and Localization (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/advanced/wpf-globalization-and-localization-overview)

### Tertiary (needs validation)
- Bitbucket `ext:xaml` search modifier support -- needs real-repo testing
- OR query batching limits -- documented 250-char limit, practical key count per query unknown
- `content_matches` surrounding lines count -- not documented, needs API response inspection

---
*Research completed: 2026-03-20*
*Ready for roadmap: yes*
