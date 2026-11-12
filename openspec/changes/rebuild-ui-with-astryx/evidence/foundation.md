# Astryx foundation evidence

## Implemented foundation

- Published CSS is loaded in documented order: Core reset, Core component CSS, Neutral built theme CSS, Toranj tokens, then the Toranj theme mapping.
- `AstryxProvider` is the only new root client boundary. The root layout remains a server component and retains metadata, font imports, the pre-paint script, `lang="fa"`, and `dir="rtl"`.
- The provider uses the built Neutral theme, `LinkProvider` with Next Link, and `InternationalizationProvider` with `fa-IR` and RTL.
- `frontend/src/design-system/astryx-theme.css` maps typography, spacing, radii, elevation, motion, focus-related colors, status roles, and light/dark surface roles to the approved Toranj direction.
- The existing `toranj-theme` preference and theme-change event remain authoritative. No second storage key was introduced.
- Architecture checks now reject Astryx source/dist/internal imports, runtime theme source imports, direct StyleX imports, generated StyleX class selectors, product imports in UI adapters, and unauthorized StyleX build plugins.

## Verification

- Provider and existing theme-toggle component tests: 5 passed.
- Foundation E2E on the production build: 3 passed, covering light/dark preference, `fa`/RTL, the built theme boundary, theme color, bundled Vazirmatn, bidi isolation, no horizontal overflow, no hydration errors, reduced motion, private noindex, and private `no-store`.
- Architecture suite: 10 passed; 236 frontend source files checked.
- Frontend lint: passed.
- Frontend typecheck: passed.
- Frontend production build: passed, 55 generated entries.

## Task 3.1 resolution: unmigrated screens keep their appearance

Recorded on 2026-11-12. The first comparison had found a 3px full-page height
difference and 14,397 changed pixels on the desktop public-home light snapshot.
Two causes were identified and removed:

- **Element restyling from the Astryx `reset` layer.** Besides the Core reset,
  the Neutral theme ships prose typography for bare `h1`–`h6`, `p`, `small`,
  `code` and `hr` in the same layer. Legacy CSS Modules never styled those
  elements explicitly, so footer titles, detail headings, admin headings,
  fieldsets, list markers and media alignment shifted. Toggling the `reset`
  layer in a browser showed computed-style differences on public, auth,
  customer and admin pages.
- **Token name collision.** Neutral declares `--color-text-primary` and
  `--color-text-secondary` on its theme wrapper, the same names as two Toranj
  tokens. Every legacy screen below the provider rendered text in pure
  black/white instead of the approved ink.

Fix:

- `src/design-system/legacy-compat.css` adds a `toranj-legacy` layer ordered
  `reset, toranj-legacy, astryx-base, astryx-theme` (declared at the top of
  `globals.css`). It restores the browser defaults those screens were built on
  and is scoped with `@scope (:root) to ([class*="astryx-"])`, so Astryx
  component subtrees keep their own defaults. The former unlayered Toranj
  `*`, `a` and form-font resets moved into it: unlayered, they had zeroed the
  padding and margins of every Astryx component.
- `astryx-theme.css` makes the two colliding properties inherit the Toranj
  root values inside the theme wrapper.

Verification:

- Removing the Astryx `reset` layer at runtime now changes no computed style
  and no document height on `/`, a product detail, `/contact`, `/auth/login`,
  `/inquiry/product`, `/account`, a customer inquiry, `/admin`, an admin
  inquiry, `/admin/products/new` and `/admin/inquiries`. Before the fix it
  changed all of them except the inquiry form.
- Every Toranj token resolves to the same value at the root and inside the
  provider in both themes.
- With the fix and before the public shell migration, the public-home light
  snapshot matched the pre-Astryx baseline at 360, 390, 768 and 1280 pixels.
- `e2e/astryx-foundation.spec.ts` asserts the inherited tokens and the legacy
  element defaults in both themes.

## Provider correction: streamed content hydrates in place

The provider published its resolved mode from a layout effect during
hydration. The Astryx `ThemeContext` changed while streamed Suspense
boundaries were still waiting for their reveal, so React discarded their
server HTML and rendered them again on the client. Product, article, customer
and staff routes briefly held two `<main>` elements and two JSON-LD scripts;
8 of 12 product-detail loads were affected. Several e2e locators failed in
strict mode, and one variant raised React error 419.

`AstryxProvider` now:

- renders `mode="system"` on the server and during hydration;
- restores `<html data-theme>` in the same commit (Astryx's root `Theme`
  clears it in `system` mode);
- publishes the concrete mode inside a transition 500 ms after `load` and the
  next animation frame, past React's 300 ms reveal batching;
- follows later Toranj theme events, cross-tab storage changes and system
  changes, and applies them to the document through the existing
  `applyTheme` helper.

After the change, no load of the four affected routes held duplicate content.
The foundation spec loads a streamed product page six times with a stored dark
preference and a light system preference. It asserts a single `<main>`, an
unchanged document theme and no runtime errors.

`ThemeToggle` also observes `<html data-theme>`. It previously read the
attribute before the provider settled and showed the wrong state when the
stored preference differed from the system preference.

## Component lab

`/brand-preview` is now a noindex Persian RTL Astryx lab rather than an inline-style brand dump. It covers:

- Toranj color roles and bundled type;
- light/dark switching through the existing preference;
- TextInput, TextArea, CheckboxInput, Switch and readonly/disabled/status examples;
- primary, secondary, destructive, ghost/loading actions;
- Banner, Spinner and EmptyState feedback;
- the existing checked-in brand image without generating new claims or assets.

Playwright exercised the lab in light and dark modes at 360, 390, 768 and 1280 pixels. All 8 combinations passed keyboard switch activation, noindex, RTL, LTR directional data, no overflow, resource loading, and runtime-console checks. The test server teardown issue observed in the baseline run was handled by stopping the two exact test-server processes after results were captured; no application service was targeted.
