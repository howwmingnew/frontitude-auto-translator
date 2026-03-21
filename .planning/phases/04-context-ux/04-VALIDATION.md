---
phase: 04
slug: context-ux
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — pure static web app, no test runner |
| **Config file** | none |
| **Quick run command** | `grep -c` verification commands in plan tasks |
| **Full suite command** | Manual browser testing |
| **Estimated runtime** | ~5 seconds (grep), ~60 seconds (manual) |

---

## Sampling Rate

- **After every task commit:** Run grep-based automated verify from plan task
- **After every plan wave:** Visual browser inspection
- **Before `/gsd:verify-work`:** Full manual browser testing
- **Max feedback latency:** 5 seconds (grep), 60 seconds (browser)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 04-01-01 | 01 | 1 | UEXP-01 | grep | `grep -c "translateMode" js/ui.js` | ⬜ pending |
| 04-01-02 | 01 | 1 | UEXP-03 | grep | `grep -c "deepl-warning" index.html` | ⬜ pending |
| 04-02-01 | 02 | 2 | UEXP-02 | grep | `grep -c "context-panel" js/ui.js` | ⬜ pending |
| 04-03-01 | 03 | 2 | UEXP-04 | grep | `grep -c "stepper" js/translation.js` | ⬜ pending |
| 04-04-01 | 04 | 2 | UEXP-05 | grep | `grep -c "failedKeys" js/translation.js` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — this is a pure static web app with grep-based verification and manual browser testing.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mode toggle visual feedback | UEXP-01 | Visual CSS state | Click Quick/Precise, verify selected state styling |
| Accordion expand/collapse | UEXP-02 | DOM insertion animation | Click Key column, verify panel appears below row |
| DeepL warning visibility | UEXP-03 | Conditional DOM display | Select Precise + DeepL, verify warning appears |
| Stepper phase transitions | UEXP-04 | Async UI updates | Run Precise translation, observe stepper progression |
| Error cell styling + retry | UEXP-05 | API failure simulation | Trigger translation with invalid API key, verify error cells + retry |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
