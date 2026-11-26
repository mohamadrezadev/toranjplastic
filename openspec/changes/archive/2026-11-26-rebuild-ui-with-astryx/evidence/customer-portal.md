# Evidence: customer portal (tasks 7.1 to 7.4)

## What changed
- Shell (`CustomerPortalShell`, `PortalNavigation`): the brand link, account identity, helper
  text and destinations are Astryx `Link`, `Avatar` and `Text`; logout stays the shared `Button`.
  The landmarks and the responsive frame (sidebar, sticky phone top bar, fixed bottom bar on
  phones) stay Toranj CSS, because Astryx `AppShell` replaces the bottom bar with a drawer and
  the portal requirements and tests keep the bottom bar (recorded as OD-13 in design.md).
- Pages (`/account`, `/account/inquiries`, `/account/inquiries/[id]`): Astryx `Heading`, `Text`,
  `Card`, `Grid`, `HStack`/`VStack`, `MetadataList`, the shared `Alert` for result banners, the
  shared `Select`/`Textarea`/`Button` fields and the `StatusBadge` adapter (approved status
  labels, tone mapped at the call site). New shared pieces: `PortalHeader`, `PortalPage.module.css`
  and `inquiry-labels.ts` (labels were duplicated). Rows and quick cards are stretched-link Cards
  (short accessible names, focus ring on the card).
- Conversation (7.2): chronological, append-only, each message an Astryx `Card` marked with its
  sender; the composer is a separate muted `Card` with its own heading, a labelled `Textarea`
  and the pending-aware submit button.
- Quotations (7.3, `CustomerQuotations`): the legacy styles used undefined tokens and hard-coded
  colours (no dark theme); they now use Toranj tokens and Astryx roles. Each version is a native
  `<details>` in a `Card`; the status badge is in the summary line so a collapsed (rejected)
  version still shows its state; accepted, rejected, expired and empty states are the shared
  `Alert`; the private PDF is a `Button` link; accept is one deliberate action, reject is a
  separate disclosure with an optional reason.
- States (7.1): `account/error.tsx` (privacy-safe, retry, h1, noindex), `account/not-found.tsx`
  (one message for a missing and a foreign request), `account/loading.tsx` and the layout
  fallback use the shared `LoadingState`.
- Defects found and fixed by the new tests:
  1. Sign-out was `display: none` below 64rem, so phone and tablet customers had no logout in
     the shell; it now sits at the inline end of the top row.
  2. The conflict message told the customer to refresh but offered no refresh action (the
     requirement asks for an explicit one); the alert now carries a refresh link.
  3. An Astryx `Avatar` inside an `aria-hidden` wrapper stayed focusable (tooltip); the tooltip
     is off.
- Preserved: server actions, version/ownership parameters, redirects, generic failure messages,
  no automatic retry, noindex, redaction (the pages render only the customer DTO fields).

## Verification
- Unit: `account-pages.test.tsx` (overview, list with filter and empty state, detail with header,
  data, chronological conversation, composer, closed request, alerts, history, not-found,
  error and not-found screens; jest-axe clean), the shell test and the quotation tests.
- E2E `account-presentation.spec.ts` (23 tests per project): the three routes in both themes
  (noindex, one heading, nav with `aria-current`, element-level overflow, axe, no runtime
  errors); the frame (fixed bottom bar with 44px targets on phones, sidebar on desktop); keyboard
  order and visible ring; the list filter from the keyboard and a clickable row; the
  conversation and composer (empty submit blocked, success banner, one attempt); a failing
  message (503, one generic message, one attempt, none after 1.5 s); the current quotation
  summary before the actions in both themes; accept by keyboard and reject through its
  disclosure (one attempt each); accepted, rejected and expired states without actions; a 409
  conflict and a 500 (one message, refresh link, no retry); ownership-safe not-found; the
  bounded error with retry; an unauthenticated visit redirected without any shell content.
- The mock gained customer failure fixtures (cookies `quotation_mode=expired`,
  `quotation_fail=conflict|error`, `portal_fail=1`, a message holding `FIXTURE_FAIL`) and a
  per-session attempt counter.

## Not covered
- A real second customer (ownership is shown with the mock's 404 for an unknown id only).
- Quotation PDF content, partial-network failure after a successful answer, and a session that
  expires between loading the page and answering.
- `no-store` is a backend header and is not asserted here.

## Final run
- Lint, typecheck, `pnpm check:architecture` clean; unit suite 297 passed (43 files).
- Regression e2e (account, auth, inquiry presentation, quotations, inquiries, foundation, auth):
  239 passed, 5 failed. Four are the known baseline `inquiries.spec.ts:27` (one per project, failing
  before this change). The fifth was the redirect test timing out at 5 s under load
  on desktop; its timeout was raised to 15 s and it then passed alone. Full 4-project
  `account-presentation.spec.ts` earlier: all passed after the robots assertion fix.
