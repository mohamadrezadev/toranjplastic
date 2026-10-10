## 1. Typography and semantic tokens

- [x] 1.1 Add `@fontsource-variable/estedad` to the frontend workspace, import the bundled font at the root, and verify that no runtime third-party font request is introduced.
- [x] 1.2 Replace the provisional raw palette in `frontend/src/design-system/tokens.css` with neutral canvas/surfaces, deep navy hierarchy, a controlled corporate-blue action accent, and independent status/section colors.
- [x] 1.3 Refine semantic typography, spacing, radius, border, elevation, focus, and motion tokens for the corporate-minimal density without renaming stable token roles unnecessarily.
- [x] 1.4 Extend design-system tests to prove the delivered Persian font family is referenced, brand/action/status roles remain separate, and reduced-motion/LTR contracts are preserved.

## 2. Shared component restyle

- [x] 2.1 Update Button and form-control CSS Modules to use the revised tokens with quiet borders, restrained radii, clear focus, and complete hover/loading/disabled/error states.
- [x] 2.2 Update Alert, LoadingState, EmptyState, and ErrorState presentation so status meaning remains accessible without high visual noise or reliance on the brand accent.
- [x] 2.3 Update Header, desktop navigation, mobile drawer, Breadcrumb, and Footer to the corporate-minimal hierarchy while preserving existing server/client boundaries and keyboard behavior.
- [x] 2.4 Run component and accessibility tests after the shared restyle and resolve any contrast, accessible-name, focus, or target-size regression.

## 3. Public surfaces

- [x] 3.1 Restyle the public home hero, CTA, cards, badges, and foundation section; remove decorative industrial treatments that conflict with the selected direction without changing approved copy meaning.
- [x] 3.2 Restyle provisional inner pages and shared content containers consistently while preserving `noindex`, valid destinations, RTL order, and the explicit unapproved-content boundary.
- [x] 3.3 Review the textual Toranj monogram treatment and ensure it remains clearly provisional without adding a logo, image, contact value, or unsupported brand claim.

## 4. Visual verification and delivery

- [x] 4.1 Extend Playwright assertions to verify the computed Estedad font stack and retain overflow, navigation, keyboard, route-status, and `noindex` coverage.
- [x] 4.2 Capture and manually review home and inner-page screenshots at 360, 390, 768, and 1280 pixels for hierarchy, wrapping, mixed RTL/LTR content, interaction states, and visual consistency.
- [x] 4.3 Run lint, typecheck, unit/component tests, production builds, Playwright, and strict OpenSpec validation; record font/package impact and unresolved logo/content decisions in the handoff.
