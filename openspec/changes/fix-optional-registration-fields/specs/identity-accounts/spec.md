## MODIFIED Requirements

### Requirement: Customer-by-default account persistence
The backend SHALL persist accounts with a unique normalized Iranian mobile number, display name, optional email and company name, explicit account status, role, creation time, update time, and optional last-login time. New public registrations MUST receive the `CUSTOMER` role and MUST NOT be able to choose or submit a privileged role. Browser registration SHALL treat blank optional email and company-name controls as omitted values rather than invalid profile data.

#### Scenario: Customer registers with a valid mobile number
- **WHEN** a visitor registers with valid profile data and a mobile number in an accepted Iranian representation
- **THEN** the backend SHALL store one account with the canonical `+98` mobile form, an active status, and the `CUSTOMER` role

#### Scenario: Customer leaves optional profile fields blank
- **WHEN** a visitor submits valid required registration fields while leaving email and company name blank
- **THEN** registration SHALL create an active `CUSTOMER` account with null optional profile values

#### Scenario: Registration attempts privilege assignment
- **WHEN** a registration request includes `ADMIN`, `SALES`, `OPERATOR`, or any unknown role field
- **THEN** validation SHALL reject the request and no account SHALL be created
