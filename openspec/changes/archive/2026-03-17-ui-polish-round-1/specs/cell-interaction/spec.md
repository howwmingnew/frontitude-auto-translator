## MODIFIED Requirements

### Requirement: Clicking a translated cell SHALL show a confirmation before allowing edit
When a user clicks on a cell that already contains a translated value, the system SHALL prompt the user with a confirmation dialog asking if they want to modify the existing translation. Only if the user confirms, a modal textbox dialog SHALL open for editing. The modal SHALL display the key name, target language code, the English source text as a read-only reference, and a pre-filled textarea with the current translation.

#### Scenario: User clicks translated cell and confirms edit
- **WHEN** user clicks a cell that has a non-empty translation value
- **AND** user confirms the modification dialog
- **THEN** a modal dialog SHALL open showing:
  - The key name and target language code
  - The English source text as a read-only reference block
  - A textarea pre-filled with the current cell value

#### Scenario: Modal displays English source text for reference
- **WHEN** the edit modal is open for a given key
- **THEN** the English source text (`state.jsonData.en[key]`) SHALL be displayed in a visually distinct read-only block above the textarea
- **AND** the source text block SHALL NOT be editable

#### Scenario: User edits and saves in the modal
- **WHEN** the edit modal is open with a textarea
- **AND** user modifies the text and clicks the save/confirm button
- **THEN** the system SHALL update `state.jsonData` immutably with the new value
- **AND** the editor table SHALL re-render to reflect the change

#### Scenario: User closes the edit modal without saving
- **WHEN** the edit modal is open
- **AND** user clicks cancel or closes the modal
- **THEN** the cell value SHALL remain unchanged

## ADDED Requirements

### Requirement: Context prompt SHALL have a default value when no saved value exists
The context prompt textarea SHALL display a default value of "齒科植牙軟體介面多國語系翻譯" when no user-saved value exists in localStorage. This default SHALL be treated as an actual value (not a placeholder) and sent to the translation API.

#### Scenario: Fresh session with no saved context prompt
- **WHEN** `localStorage.getItem('translate_context_prompt')` returns `null`
- **THEN** the context prompt textarea SHALL be populated with "齒科植牙軟體介面多國語系翻譯"
- **AND** `state.contextPrompt` SHALL be set to "齒科植牙軟體介面多國語系翻譯"

#### Scenario: User modifies the default context prompt
- **WHEN** user edits the context prompt textarea
- **THEN** the new value SHALL be persisted to `localStorage` under key `translate_context_prompt`
- **AND** subsequent sessions SHALL use the user's saved value instead of the default

#### Scenario: User has a previously saved context prompt
- **WHEN** `localStorage.getItem('translate_context_prompt')` returns a non-null value
- **THEN** the textarea SHALL display the saved value (even if it is an empty string)
