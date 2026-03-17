## Why

The current UI is functional but feels utilitarian. The editor phase crams all configuration (provider, API key, context prompt, target languages, translate button, download) into a long vertical scroll with uniform card styling. Key pain points: (1) no visual hierarchy to guide the user through the workflow steps, (2) the content preview table dominates the screen but provider/language settings feel disconnected below it, (3) progress feedback is minimal — just a thin bar and text, (4) no dark mode support despite being a developer-facing tool, and (5) mobile usability is poor due to the 95vw table layout. Addressing these will make the tool feel more polished and reduce friction for first-time users.

## What Changes

- Add a **step indicator / workflow breadcrumb** in the editor phase so users understand where they are (Preview → Configure → Translate → Download)
- Redesign the **editor phase layout** with a two-column layout on wide screens: content preview table on the left, configuration panel (provider + languages + action) on the right
- Add **dark mode** with system preference detection and a manual toggle
- Improve **progress feedback** with an animated overlay showing per-language status chips (pending → translating → done)
- Add **toast notifications** for key events (file loaded, translation complete, errors) instead of inline messages
- Improve **mobile responsiveness** with a stacked layout and collapsible sections on narrow screens
- Polish micro-interactions: smoother card transitions, subtle entrance animations for sections as they appear, better focus states

## Capabilities

### New Capabilities
- `dark-mode`: System-aware dark/light theme toggle with CSS custom properties and localStorage persistence
- `responsive-layout`: Two-column editor layout on wide screens, collapsible stacked layout on mobile/tablet
- `enhanced-feedback`: Toast notification system and rich progress overlay with per-language status

### Modified Capabilities

## Impact

- **Code**: `index.html` — CSS variables expanded for dark mode, new layout CSS, new JS for theme toggle / toasts / progress overlay
- **No new dependencies**: All changes remain pure CSS + vanilla JS
- **No API changes**: Translation logic untouched
- **localStorage**: New key `translate_theme` for dark/light preference
