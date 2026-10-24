## ADDED Requirements

### Requirement: Customer response and post-acceptance authorization
The backend SHALL reserve quotation accept/reject actions to the owning active Customer account and SHALL reserve `ACCEPTED -> IN_PROGRESS -> COMPLETED` Inquiry transitions to active staff with `INQUIRY_OPERATIONS`. Neither hidden UI, a forged role/capability, nor knowledge of identifiers SHALL grant either operation.

#### Scenario: Sales advances an accepted inquiry
- **WHEN** active Sales with `INQUIRY_OPERATIONS` performs a valid post-acceptance transition
- **THEN** the backend SHALL authorize and attribute the operation to that Sales account

#### Scenario: Admin attempts to accept for the customer
- **WHEN** staff calls a customer acceptance endpoint for an inquiry it does not own
- **THEN** the backend SHALL not create a customer acceptance and SHALL make no state change
