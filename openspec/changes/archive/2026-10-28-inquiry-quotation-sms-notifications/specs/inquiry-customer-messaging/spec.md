## ADDED Requirements

### Requirement: Notification on new inquiry message
When a staff member sends a new message to the customer regarding an inquiry, the backend SHALL emit an SMS notification alerting the customer that an update is awaiting their attention.

#### Scenario: Staff sends message and customer is alerted
- **WHEN** a staff user posts a message to an inquiry discussion
- **THEN** an SMS notification alert SHALL be dispatched to the inquiry owner's mobile number
