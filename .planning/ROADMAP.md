# Roadmap: Frontitude Context-Aware Translator

## Overview

This milestone adds context-aware translation to the existing Frontitude translator. The journey: deploy a CORS proxy and restructure the codebase (Phase 1), build the Bitbucket code search pipeline (Phase 2), add AI-powered context generation and prompt injection (Phase 3), then deliver the complete user experience with mode toggle, context panels, and error handling (Phase 4). Each phase delivers a testable capability that the next phase builds on.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Infrastructure** - CORS proxy deployment, Bitbucket connection UI, token storage, and multi-file restructure
- [ ] **Phase 2: Code Search Pipeline** - Search Bitbucket for key usage in WPF source code with LocExtension-aware parsing
- [ ] **Phase 3: AI Context Generation** - Generate human-readable context descriptions and inject them into translation prompts
- [ ] **Phase 4: Context UX** - Mode toggle, expandable context panel, progress indicators, and error handling

## Phase Details

### Phase 1: Infrastructure
**Goal**: The app has a working Bitbucket API connection through a secure CORS proxy and a modular file architecture ready for new feature development
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. A Cloudflare Worker CORS proxy is deployed and successfully forwards a Bitbucket API request from the browser, returning valid data
  2. User can enter Bitbucket workspace, repo slug, and access token in the app UI and the connection is validated with a test API call
  3. The access token is stored server-side in the Cloudflare Worker, not in browser localStorage or sessionStorage
  4. The app loads as ES Modules served from a local HTTP server, with existing translation functionality (upload, translate, download) still working identically
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md -- Cloudflare Worker CORS proxy for Bitbucket API forwarding
- [ ] 01-02-PLAN.md -- Split monolithic index.html into multi-file structure (CSS + 9 JS files)
- [ ] 01-03-PLAN.md -- Bitbucket connection UI in sidebar drawer with Test Connection

### Phase 2: Code Search Pipeline
**Goal**: The app can search a Bitbucket repo for where each translation key is used in WPF code and display structured results
**Depends on**: Phase 1
**Requirements**: SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05
**Success Criteria** (what must be TRUE):
  1. Given a translation key, the app finds all .xaml and .cs files in the Bitbucket repo where that key appears (via LocExtension pattern matching)
  2. For each match, the app displays the file path and surrounding code lines (context window) as structured results
  3. When multiple files reference the same key, all locations are aggregated and shown together
  4. Only keys that lack translations in the target language trigger Bitbucket searches, preserving API quota for already-translated keys
  5. Search results are cached in-memory for the session so repeated lookups for the same key do not re-query the API
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: AI Context Generation
**Goal**: Raw code context is transformed into human-readable descriptions and injected into translation prompts for higher-quality results
**Depends on**: Phase 2
**Requirements**: ACTX-01, ACTX-02
**Success Criteria** (what must be TRUE):
  1. Given code snippets from Phase 2, the app generates a 1-2 sentence natural language description of where and how the key is used (e.g., "Button label on the login settings screen"), in the current app interface language (EN/zh-TW/ko)
  2. When translating with context, the translation prompt sent to OpenAI/Gemini includes both the user's custom context prompt and the per-key AI-generated context description
  3. Translations produced with context injection are observably different from (and more contextually appropriate than) translations without context for UI-specific terms
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Context UX
**Goal**: Users have a complete, polished interface for context-aware translation with clear mode selection, visual context display, and graceful error handling
**Depends on**: Phase 3
**Requirements**: UEXP-01, UEXP-02, UEXP-03, UEXP-04, UEXP-05
**Success Criteria** (what must be TRUE):
  1. User can toggle between Quick mode (existing translation flow, no Bitbucket lookup) and Precise mode (context-enhanced translation), and the UI clearly indicates which mode is active
  2. In the Content Preview table, clicking a key row expands a panel showing code snippets, AI-generated context description, and inline-editable translation fields per target language
  3. When Precise mode is selected with DeepL as provider, the app displays an incompatibility notice explaining that context-enhanced translation requires OpenAI or Gemini
  4. During Precise mode translation, a progress indicator shows distinct phases (searching code, generating descriptions, translating) so the user understands what is happening
  5. If a single key's context lookup or translation fails, the rest of the batch continues unblocked, and the failed key shows an error state with a retry button
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure | 0/3 | Planning complete | - |
| 2. Code Search Pipeline | 0/? | Not started | - |
| 3. AI Context Generation | 0/? | Not started | - |
| 4. Context UX | 0/? | Not started | - |
