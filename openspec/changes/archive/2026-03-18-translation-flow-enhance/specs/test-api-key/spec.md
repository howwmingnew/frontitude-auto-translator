## MODIFIED Requirements

### Requirement: A "Test API Key" button SHALL be displayed near the API key input
The system SHALL render a "Test API Key" button on its own row below the provider/API key row, so that the button text is never truncated regardless of sidebar width.

#### Scenario: Button is visible when provider section is displayed
- **WHEN** the provider section is visible (sidebar drawer is open or editor phase is active)
- **THEN** a "Test API Key" button SHALL be visible on a dedicated row below the API key input
- **AND** the button text SHALL NOT be truncated

#### Scenario: Button displays full text at narrow widths
- **WHEN** the sidebar drawer is at its minimum width (400px or 85vw on mobile)
- **THEN** the Test Key button text SHALL be fully visible without ellipsis or overflow

### Requirement: Test API Key button SHALL be disabled when key field is empty
The button SHALL be disabled (greyed out, not clickable) whenever the API key input field is empty.

#### Scenario: API key field is empty
- **WHEN** the API key input field contains no text
- **THEN** the "Test API Key" button SHALL be disabled

#### Scenario: API key field has content
- **WHEN** the API key input field contains any text
- **THEN** the "Test API Key" button SHALL be enabled

#### Scenario: User clears the API key field
- **WHEN** the API key input field had content and user clears it
- **THEN** the "Test API Key" button SHALL become disabled immediately

### Requirement: Clicking the Test API Key button SHALL validate the key with the provider
When clicked, the button SHALL send a minimal test request to the selected translation provider to verify the API key is valid.

#### Scenario: Test succeeds with valid key
- **WHEN** user clicks "Test API Key" with a valid API key
- **THEN** a success toast SHALL be shown (e.g., "API key is valid!")
- **AND** the button SHALL show a loading state during the test

#### Scenario: Test fails with invalid key
- **WHEN** user clicks "Test API Key" with an invalid API key
- **THEN** an error toast SHALL be shown with the error details

#### Scenario: Test fails due to network error
- **WHEN** user clicks "Test API Key" and the network request fails
- **THEN** an error toast SHALL be shown indicating the connection failed

### Requirement: PROVIDER_CONFIG models SHALL reflect latest available API models with annotations
The model dropdown SHALL display up-to-date model IDs with human-readable annotations describing each model's characteristics.

#### Scenario: OpenAI model list
- **WHEN** provider is set to OpenAI
- **THEN** the model dropdown SHALL show: `gpt-5.4-mini`, `gpt-5.4`, `gpt-5.3-instant`, `gpt-5-mini`
- **AND** each option SHALL display a descriptive annotation after the model name (e.g., speed, quality characteristics)

#### Scenario: Gemini model list
- **WHEN** provider is set to Gemini
- **THEN** the model dropdown SHALL show: `gemini-3-flash`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`, `gemini-3.1-pro-preview`
- **AND** each option SHALL display a descriptive annotation after the model name

#### Scenario: Model annotations follow UI language
- **WHEN** the UI language changes
- **THEN** model annotations SHALL update to display in the current UI language

#### Scenario: Previously saved model fallback
- **WHEN** a user has a previously saved model in localStorage that is no longer in the list
- **THEN** the system SHALL fall back to the first model in the updated list
