### Requirement: An "匯出語言檔" button SHALL be available at all times in the editor phase
A persistent export button SHALL be displayed in the editor phase UI, allowing users to download the current `language.json` at any time — not only after translation is complete.

#### Scenario: Export button is visible after file upload
- **WHEN** user uploads a valid `language.json` file and enters the editor phase
- **THEN** an "匯出語言檔" button SHALL be visible in the UI
- **AND** the button SHALL remain visible regardless of whether translation has been performed

#### Scenario: Export button downloads current state of jsonData
- **WHEN** user clicks the "匯出語言檔" button
- **THEN** the system SHALL download a `language.json` file containing the current `state.jsonData`
- **AND** the downloaded file SHALL include any manual edits and translations made during the session

#### Scenario: Export button works before any translation
- **WHEN** user has uploaded a file but has NOT yet performed any translation
- **AND** user clicks the "匯出語言檔" button
- **THEN** the system SHALL download the original uploaded data as `language.json`

#### Scenario: Export button label follows current UI language
- **WHEN** the UI language is set to any supported language (en, zh-TW, ko)
- **THEN** the export button label SHALL display in the current UI language
