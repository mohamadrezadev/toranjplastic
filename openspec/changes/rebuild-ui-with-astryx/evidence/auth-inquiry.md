# Authentication and inquiry migration evidence

Recorded on 2026-11-12 for tasks 6.1, 6.2 and 6.3.

## Astryx discovery

- `pnpm astryx template`: `login`, `login-card`, `login-split`, `login-sso`,
  `form-wizard`, `form-wizard-inline`, `form-wizard-vertical`.
- `pnpm astryx component`: `Stepper`, `Step`, `ClickableCard`, `Card`,
  `Banner`, `Heading`, `Text`, `VStack`, `Section`, `Link`.
- `login-split` was adopted as the frame. Its cover-image placeholder, SSO
  buttons, remember-me control and simulated `setTimeout` submit were not
  copied. Authentication stays a server action.
- `form-wizard` was adopted for the step indicator only. Its sample data
  (workspaces, pricing plans, seat costs) was not copied. Its "one panel, one
  step" rule is kept, but every step stays mounted as a hidden native
  `<fieldset>` so hidden steps still submit their values.

## Implementation decisions

| Surface | Implementation | Notes |
| --- | --- | --- |
| Login / register frame | `components/auth/AuthLayout`: Astryx `Card` + `VStack`/`Heading`/`Text` | `login-split` layout. The brand panel (`AuthShowcase`) is a Toranj composition on `data-toranj-surface="inverse"` using Astryx `Heading`, `Text` and `Link`. Approved copy unchanged. |
| Feedback | Shared `Alert` (Astryx `Banner`) | Danger → `role="alert"`, success → `role="status"`. Login error stays generic. |
| Submit | `AuthSubmitButton` (`useFormStatus`) on the shared `Button` adapter | Disabled and announced while pending, so a slow response cannot submit twice. No retry. |
| Authorization failure | `app/admin/layout.tsx` 403 and unavailable screens use `AuthLayout hasShowcase={false}` with a warning or danger `Alert` | Server-derived `getAdminAccess()` status is unchanged. Hidden UI is not used as enforcement. |
| Secure logout | `SecureLogoutForm` + `LogoutSubmitButton` | POST server action only, disabled while pending. Used by the forbidden screen and by the customer and admin shells (a one-line swap; the shells themselves are tasks 7.1 and 8.1). |
| Type selection | Astryx `ClickableCard href` in a `<ul>` | Each card renders a real `next/link` anchor named by the card title. |
| Wizard progress | Astryx `Stepper`/`Step` | Only completed steps can be activated. Upcoming steps are `isDisabled`. A horizontal stepper collapses to a bare track (`collapsedVariant: "hiddenLabel"`) below 112px per step. The "مرحله X از Y" live status stays the single polite announcement. The single-step contact form shows no stepper. |
| Wizard panels | Retained Toranj `<fieldset>` panels and per-step native validation | Values survive navigation because panels stay mounted. |
| Intro / notice | Astryx `Card variant="muted"` and `Banner status="info"` | The `Banner` carries no live-region role, so the step status stays unique. |

## Behavior fix: values preserved after a server failure

Before this change the wizard passed the server action through the form
`action` prop. React 19 resets a form after its action completes, so a 400 or
503 response cleared every field. The final submit now calls
`preventDefault()` and dispatches the action manually inside
`startTransition`. The `action` prop remains for the no-JavaScript fallback.
The failure `Alert` states that the values were kept. Nothing is retried
automatically.

## Theme and i18n

- `astryx-i18n.ts`: Persian strings for `@astryx.stepper.*` and
  `@astryx.step.*`. Without them the step buttons were named
  "Go to step ۳: …".
- `Inquiry.module.css`: the progress card is a `minmax(0, 1fr)` grid track.
  Without it the grid item grew to the stepper's content width, and the
  stepper never collapsed at 360px.

## Fixture changes (`e2e/mock-content-server.mjs`)

- **Pre-existing defect fixed (`baseline.md`):** password login always
  created an Admin session. Mobile `09144444444` now signs in as the Customer
  fixture. Every other mobile still gets the Admin fixture.
  `inquiries.spec.ts` uses the customer mobile and now passes in all four
  projects.
- `POST /api/v1/inquiries/injection-service` returns 400, which exercises the
  validation-failure path. `POST /inquiries/contact` has no fixture route and
  returns 404, which exercises the service-failure path.

## Tests

- **Unit (`app/auth/auth-pages.test.tsx`, 9 tests):**
  - landmarks and headings;
  - LTR mobile and email fields;
  - generic login error and registration success/failure feedback;
  - the `next` hidden field;
  - keyboard Enter submission;
  - pending submit disabled;
  - forbidden screen with POST logout and no brand panel;
  - pending logout disabled;
  - axe.
- **Unit (`app/inquiry/inquiry-form.test.tsx`, 8 tests):**
  - stepper rendered as an ordered list with `aria-current="step"`;
  - upcoming steps disabled, completed steps reachable, values kept;
  - no stepper for the contact form;
  - keyboard submit sends one `FormData` and keeps all values after a
    service failure, with no retry;
  - pending submit disabled with the failure announced;
  - axe.
- **E2E (`e2e/auth-inquiry-astryx.spec.ts`, 6 tests × 4 widths, light and
  dark):**
  - auth feedback, RTL, noindex and no overflow, with a submit button at
    least 44px tall;
  - keyboard-only customer login to `/inquiry`;
  - forbidden `/admin` screen: no admin navigation, `no-store`/`private`, and
    keyboard logout to `/auth/login`;
  - keyboard-reachable type-selection cards;
  - injection wizard: per-step validation focus, legend focus, stepper
    `aria-current`, values kept across steps, and a keyboard submit that
    produces one server-action POST and a validation alert with values kept;
  - contact form: keyboard-only submit, one POST, service-failure alert,
    message kept.
- **Updated:**
  - `e2e/inquiries.spec.ts` uses the customer fixture login. The final
    description field is located by role, because the Persian step button
    name also contains "توضیحات تکمیلی".

## Verification

All commands were run in the `feat/astryx-auth-inquiry` worktree.

- `pnpm --filter frontend lint`: passed.
- `pnpm --filter frontend typecheck`: passed.
- `pnpm check:architecture`: passed with 0 failures.
- `pnpm --filter frontend test`: 38 files, 218 tests passed.
- `pnpm --filter frontend build`: passed.
- Full Playwright suite, all four widths, excluding the visual baseline:
  235 passed, 25 skipped, 0 failed. The `inquiries.spec.ts` failure recorded
  in `baseline.md` is resolved by the fixture fix above.
- Not run here: Astryx doctor and the re-baselined visual matrix. Both are
  delivery gates under tasks 9.4 and 9.5.
