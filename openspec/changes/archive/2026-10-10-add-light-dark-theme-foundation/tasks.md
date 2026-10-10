## 1. Preference foundation

- [x] 1.1 Add typed theme constants, effective-theme resolution, safe storage handling, DOM application, and unit tests in the frontend design-system layer.
- [x] 1.2 Add a pre-paint root bootstrap that sets `data-theme`, native `color-scheme`, and `theme-color`; verify safe behavior for missing, invalid, or inaccessible preferences.

## 2. Semantic themes

- [x] 2.1 Extend `frontend/src/design-system/tokens.css` with an accessible corporate-minimal dark palette while preserving the existing light semantic roles and independent action/status/section meanings.
- [x] 2.2 Update global theme declarations and architecture tests to prove both theme contracts, reduced-motion behavior, and absence of component-local theme variants.

## 3. Accessible theme control

- [x] 3.1 Implement one reusable client `ThemeToggle` with Persian action labels, pressed state, persistence, storage-event synchronization, and minimum 44-pixel target.
- [x] 3.2 Integrate the shared control into desktop and mobile navigation without regressing drawer focus, inert background, RTL order, or responsive behavior.
- [x] 3.3 Extend component tests for keyboard/pointer switching, labels, persistence failures, and synchronization.

## 4. Responsive verification and delivery

- [x] 4.1 Extend Playwright coverage for system initialization, manual switching, reload persistence, `theme-color`, and token-driven computed surfaces in both themes.
- [x] 4.2 Capture and review home and inner-page screenshots in light and dark at 360, 390, 768, and 1280 pixels; resolve contrast, clipping, wrapping, and overflow regressions.
- [x] 4.3 Run lint, typecheck, unit/component tests, production build, Playwright, and strict OpenSpec validation; record that full PWA delivery remains in phase five.
