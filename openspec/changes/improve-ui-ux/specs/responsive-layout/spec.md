## ADDED Requirements

### Requirement: Two-column editor layout on wide screens
On viewports ≥ 1200px, the editor phase SHALL use a two-column CSS Grid layout. The left column SHALL contain the Content Preview card. The right column (fixed 400px width) SHALL stack the Translation Provider card, Target Languages card, Action card, and Download card vertically.

#### Scenario: Wide screen layout
- **WHEN** the viewport is ≥ 1200px and a JSON file has been uploaded
- **THEN** the content preview table SHALL appear in the left column and all configuration/action cards SHALL appear in a right sidebar column

#### Scenario: Content preview table fills available height
- **WHEN** in two-column layout
- **THEN** the content preview table wrapper SHALL expand to fill the available viewport height (minus header and padding) instead of the fixed 60vh max-height

### Requirement: Single-column fallback on narrow screens
On viewports < 1200px, the editor phase SHALL revert to the existing single-column stacked layout with all cards at full width.

#### Scenario: Medium screen layout
- **WHEN** the viewport is between 768px and 1199px
- **THEN** all cards SHALL stack vertically in a single column at full container width

### Requirement: Collapsible sections on mobile
On viewports < 768px, the Translation Provider and Target Languages cards SHALL be collapsible. Each card SHALL have a clickable header that toggles the card body visibility with a smooth height animation.

#### Scenario: Default state on mobile
- **WHEN** the viewport is < 768px and the editor phase is entered
- **THEN** the Translation Provider and Target Languages sections SHALL be expanded by default

#### Scenario: Collapse a section
- **WHEN** the user taps a collapsible section header on mobile
- **THEN** the section body SHALL smoothly animate to hidden (height → 0) and a chevron indicator SHALL rotate to indicate collapsed state

#### Scenario: Expand a collapsed section
- **WHEN** the user taps a collapsed section header on mobile
- **THEN** the section body SHALL smoothly animate to visible and the chevron SHALL rotate back to expanded state

### Requirement: Upload phase remains centered
The upload phase layout SHALL NOT change — it SHALL remain a centered single-column card at max-width 720px on all screen sizes.

#### Scenario: Upload phase on wide screen
- **WHEN** the viewport is ≥ 1200px and no file is uploaded yet
- **THEN** the upload card SHALL be centered with max-width 720px, not affected by the two-column grid
