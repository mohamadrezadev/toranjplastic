## Why

Toranj now requires both light and dark presentation. Establishing the theme contract before public, customer, and admin screens multiply prevents page-specific dark overrides and keeps future work on the shared semantic design system.

## What Changes

- Add a light/dark theme foundation driven by the existing semantic token registry.
- Follow the operating-system color preference when no explicit user choice exists, while allowing an accessible manual toggle.
- Persist an explicit light or dark choice locally and apply the effective theme before first paint.
- Keep browser `theme-color` synchronized with the effective theme as a PWA prerequisite.
- Verify shared surfaces and current public routes in both themes at 360, 390, 768, and 1280 pixels.
- Keep Manifest, Service Worker, offline behavior, installability, push notification, final logo/PWA icons, ecommerce, payment, inventory, and automatic pricing out of scope.

## Capabilities

### New Capabilities

- `theme-preferences`: Define effective-theme resolution, user control, persistence, first-paint behavior, and browser chrome synchronization.

### Modified Capabilities

- `design-system-core`: Require every supported theme to be expressed through the central semantic token contract with accessible contrast and interaction states.

## Impact

The change affects frontend theme tokens, root document initialization, a small client-side preference control, public navigation, component tests, and Playwright coverage. It does not change backend APIs, persistence, route behavior, approved content, authentication, authorization, inquiry workflows, or the phase-five PWA delivery.
