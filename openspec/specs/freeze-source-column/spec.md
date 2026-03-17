### Requirement: The English source column (2nd column) SHALL be frozen during horizontal scroll
In addition to the existing frozen Key column (1st column), the English source text column (2nd column) SHALL remain fixed/sticky when the user scrolls horizontally, so that the source text is always visible for reference.

#### Scenario: Horizontal scroll keeps both Key and English columns visible
- **WHEN** user scrolls the editor table horizontally to view target language columns
- **THEN** the Key column (1st) SHALL remain sticky at `left: 0`
- **AND** the English source column (2nd) SHALL remain sticky at a left offset equal to the Key column width
- **AND** both columns SHALL remain fully visible and not overlap

#### Scenario: Frozen columns have proper visual separation
- **WHEN** the English source column is frozen
- **THEN** it SHALL have a visible right border (e.g., `2px solid var(--border)`) to visually separate it from scrollable columns

#### Scenario: Header cells for frozen columns have correct z-index
- **WHEN** the table header row intersects with the frozen 1st and 2nd columns
- **THEN** the header cells for both frozen columns SHALL have a higher z-index than regular header cells to avoid overlap artifacts during scroll
