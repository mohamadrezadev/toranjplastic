# Evidence: inquiry type chooser and guided form (tasks 6.2 and 6.3)

## What changed
- `/inquiry`: four Astryx `Card`s in a `Grid`; each title is an Astryx `Link` inside the card's
  level-two heading and a stretched pseudo-element makes the whole card the pointer target (four
  keyboard stops, short accessible names, focus ring on the card).
- `/inquiry/[type]`: Astryx `Heading`/`Text` header (`InquiryHeader`), a `Button` link back to the
  chooser, a muted `Card` for the pre-submission note, and the form.
- `InquiryForm`: the progress block uses the Astryx `Stepper` (three or more steps; the one-step
  contact form shows only the live status line), the field grids are Astryx `Grid`, the
  attachment notice and the failure message use the shared `Alert`, and the actions are an
  `HStack` of the shared `Button`. Native `fieldset`/`legend` stay (focus moves to the legend of
  the new step, hidden steps stay mounted so values persist). The layout fallback uses the
  shared `LoadingState`.
- Defect found and fixed by the new tests: after a failed submission React 19 resets uncontrolled
  fields, and the native selects (product, service, material, request kind, condition) lost the
  customer's choice. `RememberedSelect` keeps the value in state.
- Defect found and fixed: the stepper's frame was 439px wide inside a 327px grid track at 390px
  (grid item `min-width`); `.progress` now uses `minmax(0, 1fr)`, so the stepper collapses.
- Preserved: validation per step (first invalid control focused), no automatic retry, server
  action and its generic messages, no file attachment, API payload shape.

## Verification
- Unit: `inquiry-pages.test.tsx` (chooser links and headings, header, back link, stepper of
  three steps, unknown type) and the existing `inquiry-form.test.tsx`; jest-axe clean. Lint,
  typecheck and 289 unit tests pass.
- E2E `inquiry-presentation.spec.ts` (44 tests over 4 projects): chooser in both themes (one h1,
  four links, card targets, overflow, axe, no runtime errors); keyboard order with a visible ring
  and card click; product, injection and contact forms in both themes (stepper steps, status
  line, back link, overflow, axe); required-field blocking with focus on the first invalid
  control and values kept when moving back; the whole product form completed and submitted with
  the keyboard alone; a slow submission disables the action and is sent once; a 400 and a 503
  answer show one generic message, re-enable the action, keep every typed value and are never
  retried (counted per description in the mock).
- Auth (task 6.3, see `auth.md`): 52 e2e tests. Regression: `inquiries.spec.ts` fails only on its
  known baseline (admin-session fixture) in the four projects; the other 124 tests of that run
  passed.
- Screenshots (chooser 1280 light, injection form 390 dark) were reviewed in the session and are
  not committed.

## Not covered
- The material form in a browser: `listMaterials(1)` answers the mock's designed 503 (the
  `/materials` error fixture), so only unit tests render it.
- An expired session during submission and a network drop mid-submission (no fixture).
