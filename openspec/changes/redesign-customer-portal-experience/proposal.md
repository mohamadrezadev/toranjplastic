## Why

The customer account and inquiry screens are functionally available but visually fragmented, rely on obsolete design tokens, and present long forms as an undifferentiated grid. Customers need a coherent, responsive private workspace that makes request submission and tracking understandable on mobile and desktop.

## What Changes

- Introduce a shared Persian RTL customer-portal shell for account and inquiry routes with clear navigation, account context, safe logout, and responsive mobile/desktop behavior.
- Redesign the account dashboard, inquiry selection, owned-request list, and request detail/history surfaces using the current Toranj design tokens.
- Group inquiry inputs into titled semantic sections, improve optional/required guidance, and keep actions usable at 360, 390, 768, and 1280 pixel widths.
- Add focused component and responsive end-to-end coverage for the redesigned portal and forms.
- Preserve private `noindex`/`no-store`, server-side ownership, session/CSRF behavior, and all existing inquiry contracts.

## Capabilities

### New Capabilities

- `customer-portal-experience`: Responsive visual hierarchy, navigation, form composition, request list/detail presentation, and interaction states for the private customer workspace.

### Modified Capabilities

None.

## Impact

- Frontend account and inquiry layouts, route screens, shared customer-portal components, and CSS modules.
- Frontend component and end-to-end tests for responsive RTL behavior and form structure.
- No backend, API, database, role, pricing, inventory, payment, or quotation changes.
