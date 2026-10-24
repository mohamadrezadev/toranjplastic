## Context

The registration page renders email and company name as optional inputs. HTML form submission still includes those controls as empty strings, and the Server Action currently forwards every field unchanged. Backend DTO validation treats an empty email string as present and invalid, returning a generic `400` that the frontend maps to its safe registration error.

## Goals / Non-Goals

**Goals:**

- Make browser registration without optional profile fields follow the existing account contract.
- Keep non-empty optional values and backend validation unchanged.
- Add a regression test at the frontend-to-backend payload boundary.

**Non-Goals:**

- Change account roles, authentication, session behavior, database schema, or public API routes.
- Relax validation for a non-empty malformed email.
- Add ecommerce or unrelated profile capabilities.

## Decisions

1. **Omit blank optional properties in the frontend Server Action.** Construct the required payload first and conditionally add trimmed `email` and `companyName` only when non-empty. This matches how optional JSON properties are represented and avoids weakening backend validation. The alternative of accepting empty strings in the DTO was rejected because the API should retain a canonical contract independent of browser form serialization.
2. **Test the outgoing registration payload.** Mock the registration transport and redirect boundary, submit a `FormData` instance with blank optional controls, and assert those keys are absent. Existing backend tests continue to cover successful required-field-only registration and validation.
3. **Preserve generic user-facing failures.** This fix does not expose backend validation details or account-existence information.

## Risks / Trade-offs

- [Risk] Another optional form field may later repeat the empty-string mismatch. → Keep normalization explicit at the Server Action boundary and cover each optional registration property in the regression test.
- [Risk] Conditional payload construction can lose its inferred type. → Use a typed payload whose optional properties match the transport contract.

## Migration Plan

No data migration is required. Deploy the frontend change normally; rollback is a source revert, with no persistence changes.

## Open Questions

None.
