# Evidence: authentication presentation (task 6.1)

## What changed
- `/auth/login` and `/auth/register` compose an Astryx `Card` (brand showcase + form panel) with
  Astryx `Heading`, `Text`, `Link` and the shared `Alert` (Banner) for feedback. The brand art
  (wordmark, discs, always-dark `data-toranj-surface="inverse"` showcase) stays Toranj CSS.
  New `app/auth/AuthFrame.tsx` (`AuthFrame`, `AuthPanel`, `AuthStatus`).
- The admin authorization-failure ("دسترسی مجاز نیست", with the logout action) and
  panel-unavailable screens use `AuthStatus`: one level-one heading, one sentence, the existing
  `logoutAction` form. The old `.card`, `.feedback`, `.success`, `.link` hand styles are removed.
- Preserved: Persian copy, server actions, hidden `next` field, generic error messages,
  `noindex` metadata, server-derived role redirect (`loginDestination` untouched), no role
  selector on registration, native `<form action>` posts.

## Verification
- Unit (`auth-pages.test.tsx`, 5 tests): one main, one h1, region name, LTR fields, generic
  alert text, polite success status, hidden `next` value, no role selector, authorization status
  screen; jest-axe clean.
- E2E `auth-presentation.spec.ts` (52 tests over 4 projects): both pages in both themes (one h1,
  noindex, named fields, 44px targets, no element-level overflow, axe serious/critical none, no
  runtime errors); Tab order and visible focus ring; keyboard-only sign-in with Enter; rejected
  credentials (401) and unavailable service (503) show one generic message and make exactly one
  attempt, also after 1.5 s; created-account status; registration failure; the customer-at-admin
  authorization failure in both themes with keyboard logout. The mock gained credential fixtures
  (mobile prefix 0900000 rejected, 0911111 unavailable) and a per-mobile attempt counter.
- Regression: `auth`, `astryx-foundation`, all `admin-*` and `quotations` specs: 128 passed.
  Lint, typecheck and 286 unit tests pass. Screenshots (1280 light with error, 390 dark
  registration) were reviewed in the session and are not committed.

## Not covered
- Real logout request failure and session-expiry mid-form (the mock has no such fixture).
- `no-store` on `/auth` is a backend response header, unchanged here and not asserted in e2e.
