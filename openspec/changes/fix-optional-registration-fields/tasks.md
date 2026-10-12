## 1. Registration Payload

- [x] 1.1 Update the frontend registration Server Action to omit blank optional email and company-name fields while preserving trimmed non-empty values.

## 2. Verification

- [x] 2.1 Add a regression test that proves blank optional registration controls are omitted from the backend payload.
- [x] 2.2 Run the focused frontend tests and typecheck, then verify a real registration without optional fields against the local application.
