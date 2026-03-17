### Requirement: English source text cells SHALL be editable via the same click-confirm-edit flow
Users SHALL be able to click on English source text cells (en column) to edit them, following the same interaction pattern as editing translated cells: click → confirmation dialog → edit modal.

#### Scenario: User clicks an English source cell with existing text
- **WHEN** user clicks a cell in the English source (en) column that has a non-empty value
- **THEN** a confirmation dialog SHALL appear asking if the user wants to modify the English source text

#### Scenario: User confirms edit of English source cell
- **WHEN** user confirms the modification dialog for an English source cell
- **THEN** an edit modal SHALL open showing:
  - The key name and language code "en"
  - A label "英文原文（目前）" indicating this is the current English source
  - A textarea pre-filled with the current English source text
- **AND** the source reference block (normally showing English source for other languages) SHALL NOT be displayed

#### Scenario: User saves edited English source text
- **WHEN** user modifies the English source text in the modal and clicks save
- **THEN** `state.jsonData.en[key]` SHALL be updated immutably with the new value
- **AND** the editor table SHALL re-render to reflect the change
- **AND** the cell SHALL be marked as manually edited (highlighted per edited-cell-highlight spec)

#### Scenario: User cancels English source edit
- **WHEN** user clicks cancel on the confirmation dialog or the edit modal
- **THEN** the English source text SHALL remain unchanged

#### Scenario: Empty English source cell click behavior
- **WHEN** user clicks an empty English source (en) cell
- **THEN** the edit modal SHALL open directly (no confirmation needed, same as untranslated cells but opening the edit modal instead of triggering translation)
- **AND** the textarea SHALL be empty
