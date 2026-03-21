---
phase: 04-context-ux
plan: 03
subsystem: ui
tags: [stepper, progress, error-handling, retry, vanilla-js]

requires:
  - phase: 04-context-ux plan 01
    provides: HTML scaffolding (stepper DOM, retry section), state fields (failedKeys, currentStep, translateMode), CSS classes (stepper-step--active, stepper-step--done, cell-error), i18n keys
  - phase: 04-context-ux plan 02
    provides: Context panel accordion, inline translation editing
provides:
  - Three-phase progress stepper UI (Search/Generate/Translate) for Precise mode
  - Per-key error tracking without batch abort
  - Failed cell visual marking with error tooltips
  - Retry button for re-translating only failed keys
affects: []

tech-stack:
  added: []
  patterns:
    - "Per-batch try/catch error collection instead of throw-abort"
    - "Stepper state machine with ordered step transitions"

key-files:
  created: []
  modified:
    - js/ui.js
    - js/translation.js
    - js/app.js

key-decisions:
  - "Per-batch error collection fills empty strings for failed keys to maintain array alignment"
  - "Retry groups failures by language for efficient batch re-translation"

patterns-established:
  - "Stepper UI pattern: showStepper/updateStepper(step)/completeStepper/hideStepper lifecycle"
  - "Error cell marking via cell-error CSS class with title attribute for tooltip"

requirements-completed: [UEXP-04, UEXP-05]

duration: 5min
completed: 2026-03-21
---

# Phase 4 Plan 3: Progress Stepper and Error Retry Summary

**Three-phase stepper for Precise mode translation, per-key error tracking without batch abort, and retry button for failed keys**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-21T08:00:00Z
- **Completed:** 2026-03-21T08:39:08Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 3

## Accomplishments
- Stepper UI shows Search/Generate/Translate phase indicators during Precise mode translation
- Batch translation errors are collected per-key without aborting the entire translation run
- Failed cells display red background with error tooltip after translation
- Retry button appears with failure count and re-translates only failed keys

## Task Commits

Each task was committed atomically:

1. **Task 1: Stepper UI functions and error cell marking in ui.js** - `9b16510` (feat)
2. **Task 2: Refactor startTranslation for stepper, per-key errors, and retry** - `e3667bf` (feat)
3. **Task 3: Full Phase 4 verification** - checkpoint (human-verify, approved)

## Files Created/Modified
- `js/ui.js` - Added showStepper, hideStepper, updateStepper, completeStepper, markFailedCells, showRetryButton, hideRetryButton functions
- `js/translation.js` - Refactored startTranslation with stepper integration, per-batch error collection, failedKeys state, and retryFailedKeys function
- `js/app.js` - Wired retry button click event to App.retryFailedKeys

## Decisions Made
- Per-batch error collection fills empty strings for failed keys to maintain array index alignment with keysToTranslate
- Retry function groups failures by language for efficient batch re-translation rather than retrying one key at a time

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 5 UEXP requirements (01-05) are now complete
- Phase 4 (Context UX) is the final phase -- milestone v1.0 is complete
- All 16 v1 requirements across 4 phases are implemented

## Self-Check: PASSED

- All 3 modified files exist on disk (js/ui.js, js/translation.js, js/app.js)
- Both task commits verified in git history (9b16510, e3667bf)

---
*Phase: 04-context-ux*
*Completed: 2026-03-21*
