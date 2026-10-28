## ADDED Requirements

### Requirement: Customer notification on official quotation issuance
When an authorized sales representative or administrator transitions a quotation to `SENT` status, the backend SHALL dispatch an SMS notification to the inquiry owner's mobile number.

#### Scenario: Quotation issued and customer notified
- **WHEN** a quotation is successfully marked as `SENT`
- **THEN** an SMS notification containing the inquiry ID, quotation number, and a link to the customer account portal SHALL be dispatched to the customer's verified mobile number
