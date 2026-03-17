## ADDED Requirements

### Requirement: Untranslated cells SHALL be visually highlighted with a red border
The editor table SHALL render cells that have no translation (empty or undefined value) with a red border (`2px solid var(--error)`) so users can quickly identify missing translations at a glance.

#### Scenario: Empty cell displays red border
- **WHEN** the editor table renders and a cell has no value (undefined or empty string) for a non-source language
- **THEN** that cell SHALL have a visible red border

#### Scenario: Translated cell does not display red border
- **WHEN** the editor table renders and a cell has a non-empty translation value
- **THEN** that cell SHALL NOT have a red border

#### Scenario: Source language (en) cells never show red border
- **WHEN** the editor table renders source language (en) column cells
- **THEN** those cells SHALL NOT have a red border regardless of value

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

#### Scenario: User clicks translated cell and cancels
- **WHEN** user clicks a cell that has a non-empty translation value
- **AND** user cancels the confirmation dialog
- **THEN** no modal opens and the cell value remains unchanged

#### Scenario: User edits and saves in the modal
- **WHEN** the edit modal is open with a textarea
- **AND** user modifies the text and clicks the save/confirm button
- **THEN** the system SHALL update `state.jsonData` immutably with the new value
- **AND** the editor table SHALL re-render to reflect the change

#### Scenario: User closes the edit modal without saving
- **WHEN** the edit modal is open
- **AND** user clicks cancel or closes the modal
- **THEN** the cell value SHALL remain unchanged

### Requirement: Clicking an untranslated cell SHALL trigger single-cell AI translation
When a user clicks on an empty/untranslated cell, the system SHALL automatically trigger an AI translation for that specific key and target language using the currently configured provider and API key.

#### Scenario: User clicks untranslated cell with valid API key
- **WHEN** user clicks an untranslated (empty) cell for a non-source language
- **AND** an API key is configured for the current provider
- **THEN** the system SHALL call the translation API with the English source text for that key
- **AND** the cell SHALL show a loading indicator during translation
- **AND** upon success, the translated value SHALL be saved to `state.jsonData` immutably
- **AND** the table SHALL re-render to show the translated value (red border removed)

#### Scenario: User clicks untranslated cell without API key
- **WHEN** user clicks an untranslated cell
- **AND** no API key is configured
- **THEN** the system SHALL display an error message (toast) indicating an API key is required

#### Scenario: Translation API call fails
- **WHEN** user clicks an untranslated cell and the API call fails
- **THEN** the system SHALL display the error message in a toast notification
- **AND** the cell SHALL return to its untranslated state (red border)

#### Scenario: Clicking Key column cells has no effect
- **WHEN** user clicks a cell in the "Key" column
- **THEN** no action SHALL be taken

#### Scenario: Clicking English source (en) column cells triggers edit flow
- **WHEN** user clicks a cell in the "en" (source) column
- **THEN** the edit-source-text interaction flow SHALL be triggered (confirmation dialog for non-empty cells, direct edit modal for empty cells)

### Requirement: Cell click interaction SHALL not interfere with table scrolling or text selection
The cell click behavior SHALL only trigger on clean left-clicks, not during text selection or scrolling.

#### Scenario: User selects text in a cell
- **WHEN** user performs a mousedown-drag-mouseup to select text within a cell
- **THEN** no click action SHALL be triggered

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
