## ADDED Requirements

### Requirement: Inquiry messaging authorization
The backend SHALL allow an active `ADMIN` or `SALES` account with `INQUIRY_OPERATIONS` to read and append customer-visible inquiry messages. `OPERATOR`, `CUSTOMER` on Admin routes, inactive accounts, forged client capabilities, and UI-only access MUST NOT grant this staff operation; a customer MAY use only owner-scoped customer message routes.

#### Scenario: Sales replies to an inquiry
- **WHEN** an active Sales account with server-derived `INQUIRY_OPERATIONS` sends a valid staff message
- **THEN** the backend SHALL authorize the operation and attribute it to that account

#### Scenario: Operator calls the staff message endpoint
- **WHEN** an active Operator without `INQUIRY_OPERATIONS` calls the endpoint
- **THEN** the backend SHALL return 403 and SHALL make no persistent change
