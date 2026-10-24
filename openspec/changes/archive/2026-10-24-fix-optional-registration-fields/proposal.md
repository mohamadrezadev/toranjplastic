## Why

Public registration currently rejects submissions when optional email or company fields are left blank because the frontend forwards empty strings that fail backend validation. This blocks the normal customer-registration path even though those fields are optional in the approved account contract.

## What Changes

- Normalize empty optional registration fields to omission before calling the backend.
- Add regression coverage proving that registration succeeds without email and company name.
- Preserve existing validation for non-empty email values and all required fields.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `identity-accounts`: Clarify that a valid public customer registration succeeds when optional email and company name are omitted or submitted empty by the browser form.

## Impact

- Frontend registration Server Action payload construction.
- Registration-focused frontend tests and existing backend identity contract.
- No API route, database schema, role, authorization, or ecommerce behavior changes.
