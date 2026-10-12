## MODIFIED Requirements

### Requirement: Content mutations are audit-logged
Every successful create, update, publish, and archive action SHALL produce an audit record identifying the acting admin account, the action, and the affected record. The content write and its audit write MUST execute within one database transaction whenever the action changes persisted content; neither write may remain committed if the other fails. A successful idempotent publish or archive request SHALL still produce its required audit record without changing the existing content timestamp or status.

#### Scenario: Admin publishes a record
- **WHEN** a publish request changes a record to `PUBLISHED`
- **THEN** the status change, publish timestamp, and audit event SHALL commit atomically with the acting admin's account id, action, and affected record identifier

#### Scenario: Audit persistence fails
- **WHEN** a valid create, update, publish, or archive request changes content but its audit event cannot be persisted
- **THEN** the transaction SHALL fail, the content write SHALL be rolled back, and the endpoint SHALL NOT report success

#### Scenario: Content persistence fails
- **WHEN** a valid create, update, publish, or archive request cannot persist its content change
- **THEN** no audit event for that failed mutation SHALL be committed

#### Scenario: Admin repeats an idempotent lifecycle action
- **WHEN** an admin publishes an already-published record or archives an already-archived record
- **THEN** the server SHALL preserve the existing lifecycle fields and SHALL record the successful authorized action in the audit log
