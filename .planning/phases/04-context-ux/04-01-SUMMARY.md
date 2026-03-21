---
phase: 04-context-ux
plan: 01
subsystem: ui
tags: [vanilla-js, css, i18n, mode-toggle, deepl-warning]

requires:
  - phase: 03-ai-context
    provides: contextCache, context generation pipeline
provides:
  - Mode toggle UI (Quick/Precise) with localStorage persistence
  - DeepL incompatibility warning banner
  - All Phase 4 HTML scaffolding, state fields, DOM refs, i18n keys, and CSS
affects: [04-02, 04-03]

tech-stack:
  added: []
  patterns:
    - "Reactive UI: state change triggers manual DOM update (updateDeeplWarning pattern)"
    - "Mode persistence via localStorage translate_mode key"

key-files:
  created: []
  modified:
    - index.html
    - css/styles.css
    - js/state.js
    - js/dom.js
    - js/i18n.js
    - js/ui.js
    - js/app.js
    - js/bitbucket.js

key-decisions:
  - "Guard-style check on updatePreciseButtonState in bitbucket.js to avoid load-order issues"

patterns-established:
  - "Mode toggle: pill-style buttons with mode-btn--active class, localStorage persistence"
  - "Cross-component reactivity: provider change handler calls updateDeeplWarning()"

requirements-completed: [UEXP-01, UEXP-03]

duration: 3min
completed: 2026-03-21
---

# Phase 4 Plan 01: Mode Toggle & DeepL Warning Summary

**Quick/Precise mode toggle with pill-style buttons, DeepL incompatibility warning, and all Phase 4 HTML/CSS/state/i18n scaffolding**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-21T07:56:07Z
- **Completed:** 2026-03-21T07:59:43Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Mode toggle UI renders above Translate button with Quick (default) and Precise options
- Mode persists to localStorage and restores on page load
- Precise button disabled when Bitbucket is not connected, with tooltip
- DeepL warning banner appears only when translateMode=precise AND provider=deepl
- All Phase 4 state fields, DOM refs, i18n keys (3 languages), and CSS styles scaffolded for Plans 02 and 03

## Task Commits

Each task was committed atomically:

1. **Task 1: HTML scaffolding, state fields, DOM refs, i18n keys, and CSS** - `7460737` (feat)
2. **Task 2: Mode toggle logic, DeepL warning reactivity, and init wiring** - `c8a78eb` (feat)

## Files Created/Modified
- `js/state.js` - Added translateMode, expandedPanelKey, failedKeys, currentStep state fields
- `index.html` - Added mode toggle, DeepL warning, progress stepper, retry section HTML
- `js/dom.js` - Added 8 new DOM references for Phase 4 elements
- `js/i18n.js` - Added 11 i18n keys in all 3 languages (en, zh-TW, ko)
- `css/styles.css` - Added CSS for mode toggle, DeepL warning, stepper, context panel, error cells, retry, key column hover
- `js/ui.js` - Added initModeToggle, setTranslateMode, updateDeeplWarning, updatePreciseButtonState functions
- `js/app.js` - Wired mode toggle init, click events, DeepL warning on provider change
- `js/bitbucket.js` - Added updatePreciseButtonState calls on connect/disconnect

## Decisions Made
- Used guard-style `if (App.updatePreciseButtonState)` check in bitbucket.js to handle the case where bitbucket.js loads before ui.js defines the function (defensive against load-order edge cases)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 4 HTML, CSS, state, DOM refs, and i18n strings are in place
- Ready for Plan 02 (context panel accordion) and Plan 03 (stepper and retry logic)

---
*Phase: 04-context-ux*
*Completed: 2026-03-21*
