## ADDED Requirements

### Requirement: Semantic feedback variants
The frontend SHALL provide shared Alert and inline-feedback patterns for information, success, warning, and danger. Each variant SHALL combine Persian text with an appropriate semantic signifier and MUST NOT communicate meaning through color alone.

#### Scenario: Warning feedback is displayed
- **WHEN** the interface needs the user's attention without blocking progress
- **THEN** it SHALL present a warning role with understandable Persian text and a non-color signifier

#### Scenario: Error feedback is displayed
- **WHEN** an operation fails
- **THEN** the interface SHALL state what failed, provide a safe recovery action when one exists, and MUST NOT expose stack traces, secrets, tokens, or private server details

### Requirement: Stable loading presentation
The frontend SHALL provide loading patterns appropriate to controls, content regions, cards, and page transitions. Loading presentation SHALL preserve expected layout dimensions where practical and SHALL expose busy state to assistive technology.

#### Scenario: Content region is loading
- **WHEN** a region is waiting for data
- **THEN** the region SHALL expose `aria-busy`, retain a stable content footprint, and provide a Persian loading label or accessible equivalent

#### Scenario: Loading exceeds the expected duration
- **WHEN** a loading operation takes long enough to require user guidance
- **THEN** the interface SHALL provide a meaningful waiting message and MUST NOT present an indefinite blank surface

### Requirement: Actionable empty states
The frontend SHALL provide an EmptyState pattern with a concise Persian title, explanation, optional illustration, and an optional action only when that action has a valid destination or behavior.

#### Scenario: A list has no records
- **WHEN** a valid query returns no records
- **THEN** the interface SHALL distinguish the empty result from loading and error states and explain the next available action

#### Scenario: No valid action exists
- **WHEN** the product does not define a valid recovery or creation action
- **THEN** the empty state SHALL omit the action control rather than link to a placeholder destination

### Requirement: Recoverable error states
The frontend SHALL provide field, section, and page-level error patterns that preserve safe user input where possible and expose a retry or navigation path only when the action is valid and idempotent.

#### Scenario: Recoverable section request fails
- **WHEN** a content request fails and retry is safe
- **THEN** the section SHALL retain its surrounding layout and offer a clearly labelled retry action

#### Scenario: Retry could duplicate a submission
- **WHEN** an operation may already have been accepted by the server
- **THEN** the interface MUST NOT offer blind resubmission and SHALL instruct the user to verify the result or use an idempotent recovery path

### Requirement: Feedback announcement behavior
Dynamic feedback SHALL use an appropriate live-region strategy so important updates are announced without repeatedly interrupting assistive-technology users.

#### Scenario: Form submission succeeds
- **WHEN** a user-triggered operation completes successfully
- **THEN** the success feedback SHALL be announced once and focus SHALL remain predictable

#### Scenario: Validation returns multiple errors
- **WHEN** submission reveals errors in multiple fields
- **THEN** the interface SHALL provide an error summary or move focus to the first invalid field according to the documented form pattern

### Requirement: Privacy-safe feedback
Feedback shown on public or private surfaces MUST NOT reveal whether an unauthorized resource exists and MUST NOT include raw personal data, OTP values, session identifiers, private attachment paths, or internal admin notes.

#### Scenario: Unauthorized private resource is requested
- **WHEN** a user requests a private resource they do not own or cannot access
- **THEN** the feedback SHALL use a non-disclosing Persian access response and MUST NOT expose resource metadata
