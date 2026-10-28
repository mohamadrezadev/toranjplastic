## ADDED Requirements

### Requirement: Admin notification on inquiry creation
Upon successful persistence of a customer inquiry and its initial status history, the backend SHALL emit an inquiry-submitted notification event to alert designated sales administrators.

#### Scenario: Customer creates inquiry and notification dispatches
- **WHEN** an inquiry is successfully persisted in status `Submitted`
- **THEN** the system SHALL dispatch an SMS notification containing the inquiry tracking ID and type to the configured administrator phone number
