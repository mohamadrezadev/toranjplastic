## Why

Long customer inquiry forms remain difficult to scan and complete on phones even after responsive layout improvements. Customers need a guided sequence that keeps one decision group in focus and makes progress, navigation, and the final submission point obvious.

## What Changes

- Replace the all-sections-at-once inquiry form presentation with a client-side step-by-step flow derived from the approved semantic form sections.
- Show a compact Persian RTL progress indicator with current step, total steps, and step titles.
- Provide explicit previous and next actions with the final submit action available only on the last step.
- Validate required controls in the current step before advancing while preserving the existing server action, submitted field names, backend contract, and native final validation.
- Keep entered values when moving between steps and return focus to the active step heading after navigation.
- Remove the always-fixed submit action and retain mobile-safe spacing above the portal bottom navigation.
- Add component and responsive end-to-end coverage for step navigation, validation, focus, persistence, and submission.

## Capabilities

### New Capabilities

- `guided-inquiry-form`: Accessible multi-step composition and navigation for customer inquiry forms across phone, tablet, and desktop layouts.

### Modified Capabilities

None.

## Impact

- Frontend inquiry form composition, client state, and responsive CSS.
- Frontend component and end-to-end tests for guided form behavior.
- No changes to routes, backend APIs, persistence, authorization, inquiry statuses, ecommerce scope, pricing, inventory, payment, or business claims.
