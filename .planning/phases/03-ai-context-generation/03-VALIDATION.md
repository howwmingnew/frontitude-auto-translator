---
phase: 03
slug: ai-context-generation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser testing (no test framework -- pure static web app) |
| **Config file** | none -- no npm, no build step |
| **Quick run command** | Open `http://localhost:8080` in browser, use DevTools console |
| **Full suite command** | Manual verification of all scenarios below |
| **Estimated runtime** | ~5 minutes manual |

---

## Sampling Rate

- **After every task commit:** Manual browser test -- verify changed behavior in DevTools console
- **After every plan wave:** Full flow test -- upload JSON, connect Bitbucket, run precise translation, compare results
- **Before `/gsd:verify-work`:** Full suite must pass all manual verifications
- **Max feedback latency:** ~60 seconds (manual)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | ACTX-01 | manual-only | DevTools: `App.getContextCache()` entries have `description` field | N/A | ⬜ pending |
| 03-01-02 | 01 | 1 | ACTX-01 | manual-only | DevTools: descriptions are 1-2 sentence English text | N/A | ⬜ pending |
| 03-02-01 | 02 | 1 | ACTX-02 | manual-only | DevTools Network: inspect OpenAI/Gemini request payload for `{text, context}` format | N/A | ⬜ pending |
| 03-02-02 | 02 | 1 | ACTX-02 | manual-only | DevTools Network: verify global contextPrompt still in system prompt | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework setup needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Context generation produces descriptions from code snippets | ACTX-01 | Requires real API keys, Bitbucket connection, browser environment | 1. Upload JSON 2. Connect Bitbucket 3. Select OpenAI/Gemini 4. Trigger precise translate 5. Check `App.getContextCache()` in DevTools for `description` fields |
| Translation prompt includes per-key context | ACTX-02 | Requires inspecting network request to OpenAI/Gemini | 1. Open DevTools Network tab 2. Trigger precise translation 3. Inspect request body -- should contain `[{"text":"...", "context":"..."}]` format |
| DeepL skips context generation | ACTX-02 | Requires testing with DeepL provider selected | 1. Select DeepL provider 2. Trigger precise translate 3. Verify no context generation API calls made, translation proceeds normally |
| Context generation failure doesn't block translation | ACTX-01 | Requires simulating API failure | 1. Use invalid API key or disconnect 2. Trigger precise translate 3. Verify translation completes with empty context |

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions
- [ ] Sampling continuity: manual check after each task commit
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
