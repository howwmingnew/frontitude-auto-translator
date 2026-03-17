## 1. Dark Mode Foundation

- [x] 1.1 Audit all hardcoded color values in CSS and replace with CSS custom properties
- [x] 1.2 Define `[data-theme="dark"]` CSS custom property overrides for all color variables
- [x] 1.3 Add dark mode overrides for table styles (editor-table, sticky headers, col-source, hover states)
- [x] 1.4 Add dark mode overrides for badges, dropzone, file-info, progress bar, and error/success states
- [x] 1.5 Add theme toggle button to header (sun/moon icon) with i18n labels (EN/ZH-TW/KO)
- [x] 1.6 Implement theme initialization JS: detect `prefers-color-scheme`, check `localStorage translate_theme`, apply `data-theme` attribute
- [x] 1.7 Implement toggle click handler: switch theme, update `localStorage`, update icon
- [x] 1.8 Add `transition: background-color 200ms, color 200ms` to body and card elements for smooth theme switch

## 2. Responsive Two-Column Layout

- [x] 2.1 Add a CSS Grid wrapper class for editor-phase cards with `grid-template-columns: 1fr 400px` at `min-width: 1200px`
- [x] 2.2 Restructure the editor-phase HTML: wrap content-preview in left grid area, stack provider/language/action/download cards in right grid area
- [x] 2.3 Adjust content preview table max-height to use `calc(100vh - 200px)` in two-column mode instead of fixed 60vh
- [x] 2.4 Add `min-height: 0` on grid items to prevent overflow issues with scrollable table
- [x] 2.5 Ensure single-column fallback at < 1200px (media query override)
- [x] 2.6 Verify upload phase remains unaffected (centered 720px container)

## 3. Mobile Collapsible Sections

- [x] 3.1 Add collapsible toggle markup (chevron icon + click handler) to Provider and Target Languages card headers
- [x] 3.2 Implement JS toggle: animate section body height between 0 and auto, rotate chevron
- [x] 3.3 Apply collapsible behavior only at < 768px via media query (hide chevrons on wider screens)
- [x] 3.4 Default sections to expanded on first visit; persist collapsed state in `sessionStorage`

## 4. Toast Notification System

- [x] 4.1 Add `<div id="toast-container">` to HTML with fixed bottom-right positioning, `role="alert"`, `aria-live="polite"`
- [x] 4.2 Implement `showToast(message, type)` JS function: create toast element, append to container, auto-dismiss after 4s
- [x] 4.3 Add CSS for toast types (success/error/info) with enter/exit animations (slide-in from right, fade-out)
- [x] 4.4 Add click-to-dismiss handler on each toast
- [x] 4.5 Add dark mode CSS overrides for toast styles
- [x] 4.6 Integrate toasts: file upload success → info toast, translation complete → success toast, API errors → error toast
- [x] 4.7 Add toast message strings to UI_TRANSLATIONS (EN/ZH-TW/KO)

## 5. Enhanced Progress Feedback

- [x] 5.1 Add per-language status chip container below the progress bar in the action section
- [x] 5.2 Implement `renderProgressChips(languages)` to create chip elements with pending/translating/done/error states
- [x] 5.3 Add CSS for chip states: pending (gray), translating (blue + pulse animation), done (green + checkmark), error (red + X)
- [x] 5.4 Add dark mode CSS overrides for progress chips
- [x] 5.5 Update translation loop to call chip update function as each language starts/completes/fails
- [x] 5.6 Add percentage label display near/inside the progress bar
- [x] 5.7 Ensure progress bar width transition is smooth (300ms ease)

## 6. Integration & Polish

- [x] 6.1 Verify all new UI strings are in UI_TRANSLATIONS for all 3 languages
- [x] 6.2 Test theme toggle persists across page reload
- [x] 6.3 Test two-column layout at various viewport widths (1200px breakpoint)
- [x] 6.4 Test collapsible sections on mobile viewport (< 768px)
- [x] 6.5 Test full translation workflow end-to-end in both light and dark modes
- [x] 6.6 Verify accessibility: focus states, aria attributes, screen reader announcements for toasts
