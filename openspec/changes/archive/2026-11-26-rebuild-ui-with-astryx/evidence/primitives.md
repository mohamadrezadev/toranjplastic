# Primitive and feedback foundation evidence

Recorded on 2026-11-12 for tasks 4.2, 4.3, 4.4, and 4.8.

## Public adapters and intentional gaps

- `frontend/src/components/ui/Button.tsx` maps Toranj primary, secondary, ghost,
  danger, loading, disabled, and link-action behavior to the public Astryx
  `Button` export while retaining native `disabled` and existing click semantics.
- `Input`, `Textarea`, `Checkbox`, and `Switch` use public Astryx exports and
  preserve controlled/uncontrolled values, native names, required state,
  `FormData`, and native change events. File inputs retain the existing semantic
  native fallback because Astryx `TextInput` does not represent file selection.
- `Select` and single `Radio` intentionally remain the typed native Toranj
  exports. Astryx discovery found collection-oriented Selector/RadioList APIs,
  not drop-in equivalents for the existing single-control contracts. Replacing
  them here would change form and keyboard semantics.
- `Alert`, `LoadingState`, `EmptyState`, and `ErrorState` use public Astryx
  Banner, Spinner, EmptyState, Stack, and Button behavior. Success is provided
  through the shared Alert variant; pending/disabled submission is covered by
  the shared Button adapter.
- `frontend/src/components/ui/StatusBadge.tsx` is a domain-neutral Astryx Badge
  adapter. Content-status labels and tone mapping stay in the admin-content
  domain; published/archived states remain neutral instead of turning every
  normal row into a high-emphasis success badge.
- The Astryx provider now supplies sparse `fa-IR` overrides for all currently
  adopted form, banner, dialog, breadcrumb, spinner, and pagination strings, so
  the shipped English fallback does not append `Required` to Persian labels.

## Component and regression verification

- `pnpm test`: 38 files, 204 tests passed.
- UI/provider/feedback tests cover native form serialization, controlled and
  uncontrolled changes, accessible Persian labels/descriptions/errors, loading,
  disabled actions, safe links, live regions, status emphasis, and axe checks.
- `pnpm run lint`: passed.
- `pnpm exec tsc --noEmit`: passed.
- `pnpm run check:architecture`: passed for 238 source files.
- `pnpm run test:architecture`: 10/10 boundary fixtures passed.
- `pnpm run build`: production build passed and generated all 55 static pages.
- `pnpm exec playwright test e2e/astryx-component-lab.spec.ts --reporter=line`:
  8/8 passed across 360, 390, 768, and 1280 widths in light and dark modes.

The wider keyboard/focus-trap and directional-icon matrix remains open under
tasks 4.5-4.7; it is not claimed by this evidence.

## Astryx doctor

- `pnpm astryx doctor --built src/app/brand-preview`: 13 pass, 0 warn, 0 fail.
  The preview has no raw element for which Astryx has a component, no custom
  styling, and no unsupported icon source.
- `pnpm astryx doctor --built .next`: 12 pass, 0 warn, 0 fail after a fresh
  production build. Astryx styles and runtime usage were found in 647 output
  files.
- CLI informational notes about optional generated themes/integrations are not
  findings and do not apply: Toranj deliberately uses the reviewed published
  neutral theme plus the project-owned token mapping.
