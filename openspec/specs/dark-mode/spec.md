## ADDED Requirements

### Requirement: System-aware theme initialization
The application SHALL detect the user's system color scheme preference on load using `prefers-color-scheme` media query and apply the corresponding theme (dark or light). If the user has previously saved a theme preference in `localStorage` key `translate_theme`, that saved preference SHALL take priority over the system preference.

#### Scenario: First visit with dark system preference
- **WHEN** a user visits the app for the first time with their OS set to dark mode
- **THEN** the app SHALL render in dark theme with `data-theme="dark"` on the `<html>` element

#### Scenario: First visit with light system preference
- **WHEN** a user visits the app for the first time with their OS set to light mode
- **THEN** the app SHALL render in light theme (default, no `data-theme` attribute needed)

#### Scenario: Saved preference overrides system
- **WHEN** a user has `translate_theme: "light"` in localStorage but their OS is set to dark mode
- **THEN** the app SHALL render in light theme

### Requirement: Theme toggle control
The application SHALL display a theme toggle button in the header area. Clicking the toggle SHALL switch between dark and light themes immediately. The chosen theme SHALL be persisted to `localStorage` key `translate_theme`.

#### Scenario: Toggle from light to dark
- **WHEN** the user clicks the theme toggle while in light mode
- **THEN** the app SHALL switch to dark theme, set `data-theme="dark"` on `<html>`, and save `"dark"` to `localStorage` key `translate_theme`

#### Scenario: Toggle from dark to light
- **WHEN** the user clicks the theme toggle while in dark mode
- **THEN** the app SHALL switch to light theme, remove `data-theme` from `<html>`, and save `"light"` to `localStorage` key `translate_theme`

### Requirement: Dark theme color definitions
The application SHALL define a complete set of dark theme CSS custom property overrides under `[data-theme="dark"]`. All UI elements — cards, inputs, dropzone, table, badges, buttons, progress bar, and error/success states — MUST be legible and visually coherent in dark mode. No hardcoded color values SHALL remain that bypass the CSS custom property system.

#### Scenario: All colors use custom properties
- **WHEN** the dark theme is active
- **THEN** every visible UI element SHALL use colors defined by CSS custom properties, and no element SHALL display with a hardcoded light-mode color

#### Scenario: Sufficient contrast in dark mode
- **WHEN** the dark theme is active
- **THEN** text-to-background contrast SHALL meet WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)

### Requirement: Theme transition smoothness
The application SHALL apply a CSS transition on `background-color` and `color` properties during theme changes so that the switch is not jarring. The transition duration SHALL be 200ms or less to feel responsive.

#### Scenario: Smooth theme switch
- **WHEN** the user toggles the theme
- **THEN** background and text colors SHALL transition smoothly over ≤200ms without a flash of unstyled content
