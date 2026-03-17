## Context

Frontitude One-Click Translator is a single `index.html` static web app that translates Frontitude-exported JSON files via DeepL, OpenAI, or Gemini. The current UI uses a single-column card layout at 720px (upload phase) expanding to 95vw (editor phase). All styling is inline in a `<style>` block using CSS custom properties. State is managed via an immutable `setState(patch)` pattern inside an IIFE. There are no external JS dependencies — only Google Fonts (Inter).

The app already has:
- CSS custom properties for colors/spacing
- A two-phase UI flow (upload → editor)
- Responsive grid for language checkboxes
- i18n support (EN, ZH-TW, KO)

Constraints: everything must remain in a single `index.html`, no build tools, no external JS.

## Goals / Non-Goals

**Goals:**
- Add dark mode with system preference detection and manual toggle
- Redesign editor phase with a two-column layout (preview left, config right) on screens ≥ 1200px
- Add toast notification system replacing inline error/success messages
- Enhance progress feedback with per-language status chips
- Improve mobile experience with collapsible sections

**Non-Goals:**
- Rewriting the translation logic or API integration
- Adding new translation providers
- Breaking out of single-file architecture
- Adding a CSS framework or JS library
- Supporting IE11 or legacy browsers without CSS custom properties

## Decisions

### 1. Dark mode via CSS custom properties overlay

**Decision**: Define a `[data-theme="dark"]` selector on `<html>` that overrides all `--` variables. Toggle via a button in the header. Persist choice in `localStorage` key `translate_theme`.

**Rationale**: The app already uses CSS custom properties extensively. Overriding at the root is the simplest approach — no class toggling on individual elements. System preference detection via `prefers-color-scheme` media query sets the initial default, but user choice overrides it.

**Alternative considered**: Separate dark stylesheet — rejected because it duplicates selectors and adds maintenance burden in a single-file app.

### 2. Two-column layout via CSS Grid

**Decision**: Wrap the editor-phase cards in a CSS Grid container with `grid-template-columns: 1fr 400px` at `min-width: 1200px`. Content preview spans the left column; provider, languages, action, and download stack in the right column. Below 1200px, fall back to single column.

**Rationale**: CSS Grid is the simplest way to achieve this without restructuring the HTML significantly. The 400px right column provides enough space for configuration while giving the table maximum room.

**Alternative considered**: Flexbox with sidebar — works but Grid gives cleaner control over column sizing and is more semantic for this two-region layout.

### 3. Toast notifications via a fixed container

**Decision**: Add a `<div id="toast-container">` fixed to bottom-right. Toast function creates a child div with message, type (success/error/info), and auto-dismiss after 4s. Toasts replace some inline error messages but critical errors (upload validation) remain inline near the relevant control.

**Rationale**: Toasts provide non-blocking feedback that doesn't push layout around. Keeping critical validation errors inline preserves proximity to the problem. No external library needed — a simple `createElement` + `setTimeout` + CSS animation.

### 4. Enhanced progress with status chips

**Decision**: During translation, show a grid of language chips below the progress bar. Each chip shows the language code and a status icon (pending ○ → translating ◉ → done ✓ → error ✗). Update chips as each language completes.

**Rationale**: The current progress bar + text gives overall progress but no per-language visibility. Status chips let users see which languages are done and which failed, useful when translating 10+ languages.

### 5. Collapsible sections on mobile

**Decision**: On screens < 768px, wrap provider and language sections in `<details><summary>` style collapsibles (implemented via JS toggle + CSS, not native `<details>`, for consistent cross-browser animation). Default open on first visit, remember collapsed state in session.

**Rationale**: On mobile, the long configuration scroll is the main usability problem. Collapsibles let users focus on one section at a time. Using JS rather than `<details>` element allows smooth height animation.

## Risks / Trade-offs

- **Single-file size growth** → The index.html is already large. Adding dark mode variables, new CSS, and toast JS will increase it further. Mitigation: keep new code minimal and reuse existing patterns.
- **CSS specificity conflicts with dark mode** → Some current styles use hardcoded colors (e.g., `background: #f0fdf4`). Mitigation: audit all hardcoded colors and replace with CSS variables before adding dark theme.
- **Two-column layout breaks content preview table scroll** → The table uses `max-height: 60vh` with overflow scroll. In a grid cell, this needs careful height management. Mitigation: use `min-height: 0` on grid items and test thoroughly.
- **Toast accessibility** → Toasts must announce to screen readers. Mitigation: use `role="alert"` and `aria-live="polite"` on the toast container.
- **i18n for new UI strings** → New strings (theme toggle label, toast messages) need EN/ZH-TW/KO translations. Mitigation: add to existing `UI_TRANSLATIONS` object.
