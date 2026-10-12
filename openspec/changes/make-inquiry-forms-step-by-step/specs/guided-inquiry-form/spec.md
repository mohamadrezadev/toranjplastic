## ADDED Requirements

### Requirement: Guided inquiry steps
The frontend SHALL present each approved semantic inquiry section as one ordered step and MUST show the current step, total step count, and current step title in Persian RTL. Inactive steps MUST remain out of the visual and keyboard flow while their entered control values remain preserved.

#### Scenario: Customer opens a long inquiry form
- **WHEN** a customer opens an injection-service or material inquiry form
- **THEN** the first semantic section SHALL be visible with progress indicating step 1 of 4 and later sections SHALL not be visually or keyboard accessible

#### Scenario: Customer returns to an earlier step
- **WHEN** a customer enters values, advances, and selects the previous action
- **THEN** the earlier step SHALL regain focus and its entered values SHALL remain unchanged

#### Scenario: Customer opens a contact inquiry
- **WHEN** a customer opens the single-section contact form
- **THEN** progress SHALL indicate step 1 of 1 and the submit action SHALL be available without artificial intermediate steps

### Requirement: Step-boundary validation
The frontend MUST validate required controls in the active step before advancing and SHALL use native accessible validation feedback without inventing default values or weakening final server validation.

#### Scenario: Required active-step value is missing
- **WHEN** a customer selects the next action while a required control in the current step is empty or invalid
- **THEN** the form SHALL remain on the current step and the browser SHALL report validity on the invalid control

#### Scenario: Active step is valid
- **WHEN** all required controls in the current step are valid and the customer selects next
- **THEN** the next semantic section SHALL become active and focus SHALL move to its heading or legend

### Requirement: Final-only submission
The frontend SHALL show previous and next navigation as appropriate and MUST expose the inquiry submit action only on the final step. Submission MUST preserve all existing form field names, Server Action behavior, pending/error feedback, and backend contracts.

#### Scenario: Customer is before the final step
- **WHEN** the active step is not the last step
- **THEN** the form SHALL show a next action and MUST NOT show an inquiry submit action

#### Scenario: Customer submits the final step
- **WHEN** the customer reaches the final step and submits a valid inquiry
- **THEN** the existing Server Action SHALL receive the complete form data and the customer SHALL follow the existing successful redirect flow

#### Scenario: Submission fails
- **WHEN** the existing Server Action returns a customer-visible error
- **THEN** the wizard SHALL remain on the final step and display the error adjacent to the submit action without losing entered values

### Requirement: Responsive wizard interaction
The guided form SHALL remain usable at 360, 390, 768, and 1280 pixel widths. Step navigation MUST preserve RTL order, minimum touch targets, visible focus, safe spacing above portal navigation, and MUST NOT overlap other visible actions or cause horizontal scrolling.

#### Scenario: Customer completes steps on a phone
- **WHEN** the wizard is used at 360 or 390 pixels
- **THEN** the active step SHALL use one readable column, previous/next/submit actions SHALL remain at least 44 by 44 pixels, and the action row SHALL remain in normal document flow above the fixed portal navigation

#### Scenario: Customer uses a wider viewport
- **WHEN** the wizard is used at 768 or 1280 pixels
- **THEN** the active step MAY use the approved multi-column field grid while progress and actions remain visually connected to that step
