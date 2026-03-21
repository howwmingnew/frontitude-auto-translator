---
phase: 2
slug: code-search-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — vanilla JS, no test framework (project principle: no npm/build step) |
| **Config file** | none |
| **Quick run command** | `grep -q` + `test -f` checks on created files |
| **Full suite command** | Shell script verifying file existence, content patterns, and state structure |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run automated verify commands from plan
- **After every plan wave:** Run full file existence + content checks
- **Before `/gsd:verify-work`:** All automated checks must pass
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| Populated during planning | | | SRCH-01..05 | file+grep | Shell commands | TBD | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed — project uses file existence and content pattern checks as automated verification (same as Phase 1).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Search returns real results from Bitbucket | SRCH-01 | Requires deployed proxy + valid Bitbucket credentials + real repo | Deploy proxy, configure connection, search a known key |
| Code snippets show correct context lines | SRCH-04 | Requires visual inspection of snippet quality | Review returned snippets against actual file content |
| Right-click context menu triggers search | SRCH-01 | Browser UI interaction | Right-click a key row, select "查詢情境" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
