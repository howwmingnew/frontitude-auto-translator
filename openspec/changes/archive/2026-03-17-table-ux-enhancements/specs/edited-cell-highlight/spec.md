## ADDED Requirements

### Requirement: Manually edited cells SHALL be visually highlighted with a distinct background color
Cells that have been manually edited via the edit modal SHALL display a distinct background color (e.g., light amber/yellow) to differentiate them from AI-translated cells and original values. The highlighting SHALL persist for the duration of the session (not saved to localStorage).

#### Scenario: Cell is edited via modal and becomes highlighted
- **WHEN** user edits a cell value via the edit modal and saves
- **THEN** that cell SHALL display a distinct background color (different from the default cell background)
- **AND** the highlight SHALL be visible immediately after the table re-renders

#### Scenario: Unedited cells do not have the highlight
- **WHEN** the editor table renders
- **THEN** cells that have NOT been manually edited SHALL NOT display the edited-cell highlight color

#### Scenario: AI-translated cells do not receive the edited highlight
- **WHEN** a cell is filled via AI translation (bulk or single-cell click)
- **THEN** that cell SHALL NOT display the edited-cell highlight color

#### Scenario: Edited highlight persists across table re-renders
- **WHEN** a cell has been manually edited
- **AND** the table re-renders (e.g., due to search filter change or another translation)
- **THEN** the edited-cell highlight SHALL still be visible on that cell
