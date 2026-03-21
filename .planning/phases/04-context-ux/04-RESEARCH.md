# Phase 4: Context UX - Research

**Researched:** 2026-03-21
**Domain:** Vanilla JS UI components, accordion patterns, progress stepper, error states
**Confidence:** HIGH

## Summary

Phase 4 is a pure frontend UI phase building five distinct components on top of an existing vanilla JS codebase with IIFE + `window.App` namespace pattern. No new libraries are needed -- all work is CSS + vanilla JS using established project patterns (event delegation, immutable state, i18n via `App.t()`).

The codebase already has all backend capabilities from Phases 1-3: code search (`App.searchBatchContext`), context generation (`App.generateBatchContext`), context-aware translation (`App.callTranslateAPI` with contexts parameter), and a `contextCache` Map storing search results + AI descriptions per key. This phase surfaces that data to the user through mode selection, expandable panels, a progress stepper, incompatibility warnings, and error/retry UI.

**Primary recommendation:** Build each UEXP requirement as an independent UI component, each in its own wave. Mode toggle and DeepL warning are the simplest (state + CSS). The expandable context panel is the most complex (table DOM manipulation, accordion behavior, inline editing). The stepper and error/retry require modifications to `translation.js`'s `startTranslation()` function.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Mode Toggle (Quick / Precise): two pill-style buttons ABOVE the Translate button in sidebar, icons lightning/magnifier, Precise disabled without Bitbucket, persisted to localStorage `translate_mode`, default Quick
- DeepL Incompatibility Notice: inline warning banner in Provider section, yellow/amber, appears when Precise + DeepL, does NOT auto-switch
- Context Expandable Panel: click Key column to expand accordion row beneath, one panel at a time, shows code snippet + AI description + translation fields with Save, reads from contextCache only (no new search on expand)
- Multi-Phase Progress Stepper: three-step stepper above existing progress bar in Precise mode only, steps are Search/Generate/Translate, current step highlighted, progress bar resets per step
- Error States & Retry: failed cells get red background + X icon, context failures are silent, batch retry button "N keys failed - Retry Failed" appears after translation, retries only failed keys

### Claude's Discretion
- Exact CSS styling (colors, spacing, border radius, shadows) for new UI elements
- Animation/transition details for panel expand/collapse
- How to structure the stepper HTML (flexbox, grid, etc.)
- Exact tooltip implementation (CSS-only vs JS)
- Whether retry button disappears after successful retry or stays with "0 failed"
- How to handle key column click visual feedback (cursor, hover state)

### Deferred Ideas (OUT OF SCOPE)
- Translation edit feedback loop (CTXE-01)
- Context confidence indicator (CTXE-02)
- Offline context cache (CTXE-03)
- Context panel inline AI retranslate button
- Keyboard navigation for panel expand/collapse
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UEXP-01 | Mode toggle: Quick (no context) vs Precise (with context) | State field `translate_mode` in localStorage, pill button UI pattern, conditional logic in `startTranslation()` |
| UEXP-02 | Expandable context panel per key row | Accordion row insertion in editor table, contextCache data display, inline translation editing |
| UEXP-03 | DeepL incompatibility notice in Precise mode | Reactive warning banner toggled by mode + provider state changes |
| UEXP-04 | Multi-phase progress stepper (Search/Generate/Translate) | Stepper HTML above progress bar, phase-change hooks in `startTranslation()` |
| UEXP-05 | Per-key error states with batch retry | Failed keys tracking, cell error styling, retry button that re-runs failed keys only |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS | ES5 + async/await | All logic | Project convention -- no frameworks, no npm |
| CSS custom properties | N/A | Theming, dark mode | Already used throughout `styles.css` |

### Supporting
No additional libraries needed. All UI components are achievable with existing CSS + JS patterns in the codebase.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom accordion | details/summary HTML | Not flexible enough for table-row insertion |
| CSS tooltips | JS tooltip library | CSS-only is sufficient for simple hover tooltips |

## Architecture Patterns

### Recommended Project Structure
No new files needed. All changes go into existing files:
```
js/ui.js            # Mode toggle, DeepL warning, stepper, accordion panel rendering
js/cell-edit.js     # Modified click handler to distinguish Key column from translation columns
js/translation.js   # Stepper state updates, per-key error tracking, retry logic
js/state.js         # New state fields: translateMode, failedKeys, expandedPanelKey
js/dom.js           # New DOM references for toggle, stepper, warning, retry elements
js/i18n.js          # New i18n keys for all new UI text (3 languages)
js/app.js           # Init wiring for mode toggle, event listeners for new elements
index.html          # New HTML elements: mode toggle, stepper, warning banner, retry area
css/styles.css      # Styles for all new components
```

### Pattern 1: Reactive State-Driven UI
**What:** Mode and provider changes trigger UI updates through existing `App.setState()` + manual re-render calls
**When to use:** Mode toggle, DeepL warning, stepper visibility
**Example:**
```javascript
// When mode or provider changes, check and show/hide DeepL warning
function updateDeeplWarning() {
  var s = App.getState();
  var show = s.translateMode === 'precise' && s.provider === 'deepl';
  App.dom.deeplWarning.style.display = show ? 'block' : 'none';
}
```

### Pattern 2: Accordion Row via Table DOM Manipulation
**What:** Insert a full-width `<tr>` with a single `<td colspan="N">` below the clicked key row
**When to use:** Context expandable panel (UEXP-02)
**Example:**
```javascript
function expandContextPanel(keyRow, key) {
  // Close any existing panel
  collapseCurrentPanel();

  var s = App.getState();
  var colCount = keyRow.children.length;
  var tr = document.createElement('tr');
  tr.className = 'context-panel-row';
  var td = document.createElement('td');
  td.colSpan = colCount;
  td.className = 'context-panel-cell';

  // Build panel content from contextCache
  var cached = App.getContextCache().get(key);
  td.innerHTML = buildPanelHTML(key, cached);

  tr.appendChild(td);
  keyRow.parentNode.insertBefore(tr, keyRow.nextSibling);
  App.setState({ expandedPanelKey: key });
}
```

### Pattern 3: Failed Keys Tracking for Retry
**What:** Track failed key+lang pairs during translation, render retry button after completion
**When to use:** UEXP-05 per-key error with retry
**Example:**
```javascript
// In translation batch loop, catch per-key errors
var failedKeys = []; // { key, lang, error }

// After all batches complete:
if (failedKeys.length > 0) {
  App.setState({ failedKeys: failedKeys });
  showRetryButton(failedKeys.length);
}
```

### Anti-Patterns to Avoid
- **Mutating contextCache entries directly:** The context.js already mutates `entry.description` in place. For new state like `expandedPanelKey`, use `App.setState()`.
- **Re-rendering entire table on panel toggle:** Only insert/remove the accordion row; do not call `renderEditorTable()` which destroys the panel.
- **Binding events on dynamic panel content:** Use event delegation on the table or panel container, not direct bindings that break on re-render.
- **Storing UI-only state in localStorage:** `expandedPanelKey` is session-only; do not persist it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tooltip on hover | Custom JS tooltip positioning | CSS `title` attribute + `::after` pseudo-element | Simple text tooltips are sufficient; `title` already used in codebase |
| Smooth accordion | Custom height animation JS | CSS `max-height` transition | Already used by `initCollapsible` pattern in ui.js |
| Progress percentage | Custom math | Existing `simulatedPct` / `realPct` pattern | Already handles backslide prevention in translation.js |

**Key insight:** The codebase already has patterns for every UI primitive needed (collapsible, progress, toast, badges, overlay modals). New components should follow these exact patterns, not invent new ones.

## Common Pitfalls

### Pitfall 1: Key Column Click Conflicts with Cell Edit
**What goes wrong:** The existing click handler in cell-edit.js (line 199-243) currently ignores Key column clicks (`if (colIndex <= 0) return`). Adding accordion expand on Key column click must not interfere with right-click context menu (search.js) or text selection.
**Why it happens:** Multiple event handlers compete for the same element.
**How to avoid:** Modify the existing `editorTable` click handler to detect `colIndex === 0` and route to accordion logic. Keep the `window.getSelection()` guard. The context menu uses `contextmenu` event (not `click`), so no conflict there.
**Warning signs:** Clicking a key opens both the panel and triggers unexpected behavior.

### Pitfall 2: Accordion Row Breaks Table Re-render
**What goes wrong:** `renderEditorTable()` replaces the entire table innerHTML, destroying any open accordion panel row.
**Why it happens:** The table is fully re-rendered on filter change, translation completion, and cell edit save.
**How to avoid:** After `renderEditorTable()`, if `expandedPanelKey` is set and the key still exists in the table, re-insert the accordion row. Or: close the panel before re-render and let user re-open.
**Warning signs:** Panel disappears unexpectedly after translation or search filter change.

### Pitfall 3: Stepper Progress Bar Reset Confusion
**What goes wrong:** Progress bar shows 100% at end of search phase, then jumps back to 0% for generate phase, confusing users.
**Why it happens:** Each phase has its own total; resetting the bar between phases looks like regression.
**How to avoid:** Use the stepper visually to show overall progress (completed steps get checkmarks), and the progress bar for within-step progress only. Clear text labels explain what the bar represents.
**Warning signs:** Users think translation failed when bar resets.

### Pitfall 4: Failed Keys State Not Cleared on New Translation
**What goes wrong:** Retry button from a previous run shows stale failed keys count.
**Why it happens:** `failedKeys` state not cleared when starting a new translation.
**How to avoid:** Clear `failedKeys` at the beginning of `startTranslation()` and hide the retry button.
**Warning signs:** Retry button shows wrong count or retries wrong keys.

### Pitfall 5: Colspan Mismatch in Accordion Row
**What goes wrong:** Accordion panel doesn't span the full table width.
**Why it happens:** Column count depends on number of languages in the uploaded JSON; hardcoding colspan breaks.
**How to avoid:** Calculate colspan dynamically from the number of `<th>` elements in the table header.
**Warning signs:** Panel appears in wrong width or breaks table layout.

### Pitfall 6: Translation.js Error Handling is All-or-Nothing
**What goes wrong:** Current `startTranslation()` uses `throw langErr` inside the per-language loop (line 218), which aborts the entire translation on first language failure.
**Why it happens:** Error handling wraps the entire language loop, not individual keys.
**How to avoid:** For UEXP-05, refactor the inner batch loop to catch per-batch errors, track failed keys, and continue with remaining keys/languages. The outer try/catch should only handle truly fatal errors (like network down).
**Warning signs:** One failed key kills the entire translation job.

## Code Examples

### Mode Toggle HTML (in action-section, above translate button)
```html
<div class="mode-toggle" id="mode-toggle">
  <button class="mode-btn mode-btn--active" data-mode="quick" id="mode-quick">
    <span class="mode-icon">&#9889;</span>
    <span data-i18n="modeQuick">Quick</span>
  </button>
  <button class="mode-btn" data-mode="precise" id="mode-precise">
    <span class="mode-icon">&#128269;</span>
    <span data-i18n="modePrecise">Precise</span>
  </button>
</div>
```

### Mode Toggle CSS
```css
.mode-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.15s, color 0.15s;
}
.mode-btn--active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### DeepL Warning Banner
```html
<div class="deepl-context-warning" id="deepl-context-warning" style="display:none">
  <span data-i18n="deeplContextWarning"></span>
</div>
```
```css
.deepl-context-warning {
  background: #fef3cd;
  color: #856404;
  border: 1px solid #ffc107;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}
[data-theme="dark"] .deepl-context-warning {
  background: #332d1a;
  color: #ffda6a;
  border-color: #665d2b;
}
```

### Stepper HTML (in progress-section, above progress bar)
```html
<div class="progress-stepper" id="progress-stepper" style="display:none">
  <div class="stepper-step" data-step="search">
    <span class="stepper-indicator">&#9675;</span>
    <span data-i18n="stepSearch">Search Context</span>
  </div>
  <div class="stepper-divider"></div>
  <div class="stepper-step" data-step="generate">
    <span class="stepper-indicator">&#9675;</span>
    <span data-i18n="stepGenerate">Generate Descriptions</span>
  </div>
  <div class="stepper-divider"></div>
  <div class="stepper-step" data-step="translate">
    <span class="stepper-indicator">&#9675;</span>
    <span data-i18n="stepTranslate">Translate</span>
  </div>
</div>
```

### Accordion Panel Content Structure
```javascript
function buildPanelHTML(key, cached) {
  var html = '<div class="context-panel">';

  if (!cached || !cached.matches || cached.matches.length === 0) {
    html += '<div class="context-panel-empty">' + App.t('contextPanelEmpty') + '</div>';
    html += '</div>';
    return html;
  }

  // Code snippet (first match)
  var first = cached.matches[0];
  html += '<div class="context-panel-snippet">';
  html += '<div class="context-panel-file">&#128196; ' + App.escapeHtml(first.file) + ':' + first.line + '</div>';
  html += '<pre class="context-panel-code">' + App.escapeHtml(first.snippet) + '</pre>';
  if (cached.matches.length > 1) {
    html += '<button class="context-panel-more">' + App.t('contextPanelMore', cached.matches.length - 1) + '</button>';
  }
  html += '</div>';

  // AI description
  html += '<div class="context-panel-description">';
  if (cached.description) {
    html += '<span class="context-panel-desc-icon">&#128161;</span> ' + App.escapeHtml(cached.description);
  } else {
    html += '<span class="context-panel-no-desc">' + App.t('contextPanelNoDesc') + '</span>';
  }
  html += '</div>';

  // Translation fields
  var s = App.getState();
  var targetLangs = Object.keys(s.jsonData).filter(function (k) { return k !== 'en'; }).sort();
  html += '<div class="context-panel-translations">';
  targetLangs.forEach(function (lang) {
    var val = s.jsonData[lang] ? (s.jsonData[lang][key] || '') : '';
    html += '<div class="context-panel-lang-row">';
    html += '<label>' + lang.toUpperCase() + '</label>';
    html += '<input type="text" class="context-panel-input" data-lang="' + lang + '" data-key="' + key + '" value="' + App.escapeHtml(val).replace(/"/g, '&quot;') + '" />';
    html += '<button class="context-panel-save" data-lang="' + lang + '" data-key="' + key + '">' + App.t('cellEditSave') + '</button>';
    html += '</div>';
  });
  html += '</div>';

  html += '</div>';
  return html;
}
```

### Per-Key Error Cell Styling
```css
.editor-table td.cell-error {
  background: #fff0f0;
  color: #c53030;
  position: relative;
}
[data-theme="dark"] .editor-table td.cell-error {
  background: #2d1b1b;
  color: #feb2b2;
}
.editor-table td.cell-error::before {
  content: '\2717 ';
}
```

### Retry Button
```html
<div class="retry-section" id="retry-section" style="display:none">
  <span class="retry-count" id="retry-count"></span>
  <button class="btn-retry" id="retry-btn" data-i18n="retryFailed">Retry Failed</button>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single translation mode | Quick/Precise toggle | This phase | Users choose speed vs accuracy |
| No context visibility | Expandable panel per key | This phase | Translators see code context |
| All-or-nothing errors | Per-key error tracking | This phase | Failed keys don't block others |
| Single progress bar | Three-phase stepper | This phase | Users understand what's happening |

## Integration Points (Critical)

### 1. cell-edit.js Click Handler (line 199-243)
The `colIndex <= 0` guard on line 213 must change to route Key column clicks to the accordion panel:
```javascript
if (colIndex === 0) {
  // Expand/collapse context panel for this key
  App.toggleContextPanel(tr, key);
  return;
}
```

### 2. translation.js startTranslation() (line 54-237)
Major refactoring needed:
- Add stepper state updates at Phase A (search), Phase B (generate), Phase C (translate) transitions
- Wrap per-batch translation in try/catch to track failures without aborting
- Collect `failedKeys` array with `{ key, lang, error }` entries
- After completion, display retry button if failures exist
- The current `throw langErr` on line 218 must become per-key error collection

### 3. New State Fields (state.js)
```javascript
translateMode: 'quick',     // 'quick' | 'precise'
expandedPanelKey: null,     // string | null
failedKeys: [],             // [{ key, lang, error }]
currentStep: null,          // 'search' | 'generate' | 'translate' | null
```

### 4. New i18n Keys Needed (all 3 languages)
```
modeQuick, modePrecise, modePreciseDisabled,
deeplContextWarning,
stepSearch, stepGenerate, stepTranslate,
contextPanelEmpty, contextPanelNoDesc, contextPanelMore,
retryFailed, retryCount,
cellFailed, cellFailedTooltip
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual browser testing (no automated test framework in project) |
| Config file | none |
| Quick run command | `python -m http.server 8080` then browser test |
| Full suite command | Manual walkthrough of all 5 UEXP requirements |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UEXP-01 | Mode toggle Quick/Precise with persistence | manual-only | N/A - browser interaction | N/A |
| UEXP-02 | Key click expands context panel accordion | manual-only | N/A - requires uploaded JSON + Bitbucket context | N/A |
| UEXP-03 | DeepL warning shows in Precise mode | manual-only | N/A - browser interaction | N/A |
| UEXP-04 | Three-phase stepper during Precise translation | manual-only | N/A - requires live API calls | N/A |
| UEXP-05 | Failed cells marked, retry button works | manual-only | N/A - requires simulated API failure | N/A |

**Manual-only justification:** This is a pure static web app with no build step, no npm, no test runner. All components are DOM-interactive and require browser rendering with real user interaction. The project has zero test infrastructure.

### Sampling Rate
- **Per task commit:** Visual verification in browser at `localhost:8080`
- **Per wave merge:** Full walkthrough of affected UEXP requirement
- **Phase gate:** Complete walkthrough of all 5 UEXP requirements with both Quick and Precise modes

### Wave 0 Gaps
None -- no automated test infrastructure exists or is expected for this project. All validation is manual browser testing per project conventions.

## Open Questions

1. **Accordion panel survival across table re-renders**
   - What we know: `renderEditorTable()` replaces full innerHTML, destroying accordion rows
   - What's unclear: Whether to re-open the panel after re-render or just close it
   - Recommendation: Close the panel on re-render (simplest, least error-prone). User re-opens if needed. Track `expandedPanelKey` in state for potential future re-open.

2. **Per-key vs per-batch error granularity**
   - What we know: Current batching sends 10 texts at once; API returns all-or-nothing per batch
   - What's unclear: Whether a batch failure should mark all 10 keys as failed or just show a batch error
   - Recommendation: Mark all keys in the failed batch as failed (the API call failed for the whole batch). Retry sends the same batch.

3. **Retry button after successful retry**
   - What we know: Claude's discretion per CONTEXT.md
   - Recommendation: Hide the retry section entirely when all retries succeed (0 remaining failures). Show success toast.

## Sources

### Primary (HIGH confidence)
- Direct code analysis of all JS/HTML/CSS files in the project repository
- `.planning/phases/04-context-ux/04-CONTEXT.md` -- locked user decisions
- `.planning/REQUIREMENTS.md` -- UEXP-01 through UEXP-05 definitions

### Secondary (MEDIUM confidence)
- Prior phase CONTEXT.md files (01, 02, 03) for architectural decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all vanilla JS/CSS
- Architecture: HIGH -- patterns derived from reading actual codebase
- Pitfalls: HIGH -- identified from actual code analysis (specific line numbers, concrete conflicts)

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable -- no external dependencies to go stale)
