## MODIFIED Requirements

### Requirement: Clicking a translated cell SHALL show a confirmation before allowing edit
When a user clicks on a cell that already contains a translated value, the system SHALL prompt the user with a confirmation dialog asking if they want to modify the existing translation. Only if the user confirms, a modal textbox dialog SHALL open for editing. The modal SHALL display the key name, target language code, the English source text as a read-only reference, and a pre-filled textarea with the current translation. The modal SHALL also display revert and AI translate buttons as defined in cell-revert and edit-modal-ai-translate specs.

#### Scenario: User clicks translated cell and confirms edit
- **WHEN** user clicks a cell that has a non-empty translation value
- **AND** user confirms the modification dialog
- **THEN** a modal dialog SHALL open showing:
  - The key name and target language code
  - The English source text as a read-only reference block
  - A textarea pre-filled with the current cell value
  - A revert button (enabled if cell has been previously edited, disabled otherwise)
  - An AI translate button (visible for non-source languages, hidden for en)

#### Scenario: Modal displays English source text for reference
- **WHEN** the edit modal is open for a given key
- **THEN** the English source text (`state.jsonData.en[key]`) SHALL be displayed in a visually distinct read-only block above the textarea
- **AND** the source text block SHALL NOT be editable

#### Scenario: User clicks translated cell and cancels
- **WHEN** user clicks a cell that has a non-empty translation value
- **AND** user cancels the confirmation dialog
- **THEN** no modal opens and the cell value remains unchanged

#### Scenario: User edits and saves in the modal
- **WHEN** the edit modal is open with a textarea
- **AND** user modifies the text and clicks the save/confirm button
- **THEN** the system SHALL update `state.jsonData` immutably with the new value
- **AND** the system SHALL record the original value in `state.editedCells` Map if not already recorded
- **AND** the editor table SHALL re-render to reflect the change

#### Scenario: User closes the edit modal without saving
- **WHEN** the edit modal is open
- **AND** user clicks cancel or closes the modal
- **THEN** the cell value SHALL remain unchanged
