---
phase: 1
slug: infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser testing (no automated test framework) |
| **Config file** | None — project has zero test infrastructure |
| **Quick run command** | Open `index.html` in browser, verify no console errors |
| **Full suite command** | Manual checklist (see Manual-Only Verifications) |
| **Estimated runtime** | ~2-5 minutes manual verification per task |

---

## Sampling Rate

- **After every task commit:** Open in browser, verify no console errors, test affected feature
- **After every plan wave:** Full manual checklist: upload JSON, select provider, enter key, test key, translate, download, verify Bitbucket connection
- **Before `/gsd:verify-work`:** All 4 success criteria verified manually
- **Max feedback latency:** ~120 seconds (manual)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | INFRA-01 | smoke | `curl -H "Origin: {ALLOWED_ORIGIN}" https://{proxy}/bitbucket/2.0/repositories/{ws}/{repo}` | N/A | ⬜ pending |
| TBD | 01 | 1 | INFRA-02 | manual-only | Open browser, fill fields, click Test Connection | N/A | ⬜ pending |
| TBD | 01 | 1 | INFRA-03 | manual-only | Dev Tools > Application > localStorage > verify keys | N/A | ⬜ pending |
| TBD | 02 | 1 | INFRA-04 | manual-only | Open via HTTP server, test upload/translate/download | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Simple HTTP server for local dev testing (`python -m http.server 8080` or `npx serve`)
- [ ] curl-based smoke test script for CORS proxy validation

*No automated test framework — project principle prohibits build steps. Validation is manual + curl.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CORS proxy forwards Bitbucket API request | INFRA-01 | Requires deployed Worker + real Bitbucket repo | Deploy proxy, run `curl -H "Origin: https://yoursite.github.io" https://proxy.workers.dev/bitbucket/2.0/repositories/{ws}/{repo}`, verify 200 + JSON response |
| User enters workspace/repo/token, clicks Test, sees badge update | INFRA-02 | Requires browser UI interaction | Open app, go to sidebar, fill Bitbucket fields, click Test Connection, verify badge changes to "Connected" |
| Token stored in localStorage (v1 decision) | INFRA-03 | Requires browser dev tools inspection | Open DevTools > Application > Local Storage, verify `translate_bb_*` keys present after filling fields |
| App loads as multi-file, existing features work | INFRA-04 | Requires full user flow walkthrough | Serve via HTTP server, upload a JSON file, select provider, enter API key, translate, download result, verify all features identical to monolith version |

---

## Validation Sign-Off

- [ ] All tasks have manual verification steps documented
- [ ] Sampling continuity: each task commit gets browser verification
- [ ] Wave 0 covers HTTP server + curl smoke test setup
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
