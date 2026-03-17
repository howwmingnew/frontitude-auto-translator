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
