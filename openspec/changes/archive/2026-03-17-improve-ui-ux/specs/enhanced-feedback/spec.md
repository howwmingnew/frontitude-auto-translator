## ADDED Requirements

### Requirement: Toast notification system
The application SHALL provide a toast notification function that displays non-blocking messages in a fixed container at the bottom-right of the viewport. Each toast SHALL have a type (success, error, info), a text message, and SHALL auto-dismiss after 4 seconds. Toasts SHALL be dismissible by clicking. The toast container SHALL use `role="alert"` and `aria-live="polite"` for screen reader accessibility.

#### Scenario: Success toast on translation complete
- **WHEN** all target languages have been successfully translated
- **THEN** a success toast SHALL appear with the completion message

#### Scenario: Error toast on API failure
- **WHEN** a translation API call fails for a specific language
- **THEN** an error toast SHALL appear with the error details

#### Scenario: Info toast on file upload
- **WHEN** a valid JSON file is successfully loaded
- **THEN** an info toast SHALL appear confirming the file was loaded with the number of keys and languages

#### Scenario: Toast auto-dismiss
- **WHEN** a toast is displayed
- **THEN** it SHALL automatically fade out and be removed after 4 seconds

#### Scenario: Toast manual dismiss
- **WHEN** the user clicks on a toast
- **THEN** the toast SHALL immediately fade out and be removed

#### Scenario: Multiple simultaneous toasts
- **WHEN** multiple toasts are triggered in quick succession
- **THEN** they SHALL stack vertically with the newest at the bottom, each with independent auto-dismiss timers

### Requirement: Per-language progress status chips
During translation, the application SHALL display a grid of status chips below the progress bar. Each chip SHALL represent one target language and show its current status: pending (not started), translating (in progress), done (completed successfully), or error (failed).

#### Scenario: Initial chip state
- **WHEN** the user clicks Translate with 5 target languages selected
- **THEN** 5 status chips SHALL appear, all in "pending" state with the language code label

#### Scenario: Chip updates to translating
- **WHEN** translation begins for a specific language
- **THEN** that language's chip SHALL update to "translating" state with a visual indicator (e.g., pulsing animation)

#### Scenario: Chip updates to done
- **WHEN** translation completes successfully for a language
- **THEN** that language's chip SHALL update to "done" state with a checkmark indicator

#### Scenario: Chip updates to error
- **WHEN** translation fails for a language
- **THEN** that language's chip SHALL update to "error" state with an error indicator and the chip SHALL be visually distinct (e.g., red tint)

### Requirement: Enhanced progress bar animation
The progress bar SHALL display a percentage label inside or near the bar. The bar fill SHALL use a smooth CSS transition when updating width.

#### Scenario: Progress percentage display
- **WHEN** translation is in progress with 2 of 5 languages complete
- **THEN** the progress bar SHALL show 40% fill and display "40%" as text

#### Scenario: Smooth progress updates
- **WHEN** a language translation completes and the progress bar updates
- **THEN** the bar width SHALL animate smoothly to the new percentage over 300ms
