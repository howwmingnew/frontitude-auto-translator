## MODIFIED Requirements

### Requirement: Clicking source language (en) or key column cells has no effect
The Key column cells SHALL still have no click action. However, English source (en) column cells SHALL now be clickable and follow the edit flow defined in the `edit-source-text` capability.

#### Scenario: Clicking Key column cells has no effect
- **WHEN** user clicks a cell in the "Key" column
- **THEN** no action SHALL be taken

#### Scenario: Clicking English source (en) column cells triggers edit flow
- **WHEN** user clicks a cell in the "en" (source) column
- **THEN** the edit-source-text interaction flow SHALL be triggered (confirmation dialog for non-empty cells, direct edit modal for empty cells)
