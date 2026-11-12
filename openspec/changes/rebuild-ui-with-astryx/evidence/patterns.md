# Navigation, data, and layer pattern evidence

Recorded on 2026-11-12 for tasks 4.5, 4.6, and 4.7.

## Astryx discovery and implementation

- The local locked CLI was used to read the public documentation for
  `Breadcrumbs`, `Pagination`, `Dialog`, `DialogHeader`, `Table`, `TopNav`,
  `TopNavHeading`, and `TopNavItem`, plus the related responsive table,
  navigation, and dialog search results.
- `frontend/src/app/brand-preview/BrandComponentLab.tsx` now demonstrates a
  Persian RTL top navigation, semantic breadcrumb trail, compact pagination,
  responsive table, bidi-isolated directional identifiers, and a controlled
  informational dialog using public Astryx exports only.
- The table uses rows rather than card-wrapped dense data. Pagination keeps its
  logical next/previous placement in RTL, and the dialog has an accessible
  title, explicit close actions, focus entry, Escape dismissal, and focus
  return to its trigger.
- The dialog test keeps Escape dismissal separate from focusing the header
  close button. That button owns an Astryx tooltip layer; when it is focused,
  the shared layer stack correctly dismisses the tooltip before the dialog.
  Testing the dialog while its title owns focus therefore verifies one-layer-
  per-Escape behavior without bypassing the public component contract.

## Component and accessibility coverage

- UI adapter tests cover semantic form controls, Persian accessible names and
  descriptions, native validation relationships, Enter activation, loading,
  disabled actions, controlled/uncontrolled values, and axe results.
- Feedback, theme, content, and navigation component tests add live-region,
  pagination, drawer focus-entry/focus-return, theme-toggle, and axe coverage.
- Native modal focus behavior is verified in Playwright because it depends on
  the browser top layer: the title receives initial focus, Tab reaches the
  close control, Escape closes the dialog, and focus returns to the opener.
- `pnpm test`: 38 files and 204 tests passed.

## Required responsive browser matrix

`pnpm --dir frontend exec playwright test e2e/astryx-component-lab.spec.ts`
passed all 8 combinations:

- light and dark at 360 px;
- light and dark at 390 px;
- light and dark at 768 px;
- light and dark at 1280 px.

The test verifies Persian/RTL document state, logical directional controls,
LTR isolation, keyboard navigation, pagination updates, the dialog overlay,
focus return, switch keyboard activation, no horizontal overflow, no failed
resources, and no runtime console errors. Playwright emitted all 8 passing
results; its Windows web-server teardown wrapper remained open after the two
listeners had already exited and was interrupted only after confirming ports
3100 and 3199 had no listening process.

## Quality gates

- `pnpm astryx doctor --built src/app/brand-preview`: 13 pass, 0 warn, 0 fail;
  23 public Astryx imports and 96 component uses.
- Frontend lint: passed.
- Frontend typecheck: passed.
- Root architecture and Astryx alignment checks: passed for 238 source files;
  10/10 boundary fixtures passed and all three Astryx packages remain at
  0.7.13.
- The production build used by the browser matrix generated all 55 static
  pages successfully.
