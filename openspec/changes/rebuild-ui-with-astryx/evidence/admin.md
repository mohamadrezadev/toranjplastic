# Evidence: admin experience (task 8.x)

## 8.1 Admin shell

### What changed
- `AdminPortalShell`, `AdminNavigation`, `AdminBreadcrumbs`, new `AdminMobileMenu`: brand links, identity,
  helper text and destinations are Astryx `Link`, `Avatar` and `Text`; breadcrumbs are Astryx
  `Breadcrumbs`/`BreadcrumbItem` (label "مسیر صفحه", supporting variant, current page as plain text with
  `aria-current`); logout stays the shared `Button`. The frame stays Toranj CSS (OD-14).
- One `<main id="admin-content">` landmark owned by the shell (it was a `div role="main"` that contained
  each page's own `<main>`). The 23 admin pages that rendered `<main>` now render a `<div>`. The skip link
  targets it.
- Phone/tablet menu: still a native `<details>`; `AdminMobileMenu` closes it on Escape (focus returns to the
  summary), on an outside pointer press and after a route change (state adjusted while rendering; the lint
  rule `react-hooks/set-state-in-effect` forbids the effect form).
- States: `admin/error.tsx` uses the shared `ErrorState` (h1, retry that Next passes in, link back to the
  panel, no error detail; it was a legacy card inside a second `<main>`), new `admin/loading.tsx`, and the
  layout's access-check fallback is the shared `LoadingState`.
- Capability navigation is unchanged in rule (backend-issued capabilities filter the links; hiding is
  presentation only).

### Verification
- Unit `admin-portal.test.tsx` (6 tests): identity and navigation per role, one main with the skip link and
  the breadcrumb trail, Escape closes the menu and returns focus, outside click closes it, jest-axe clean.
- E2E `admin-shell.spec.ts` (per project; 4 projects): two routes in both themes (noindex, one main, h1,
  breadcrumbs, active destination, runtime errors), frame by viewport, skip link, phone menu by keyboard
  (open, Escape, outside press, navigation closes it, logout inside), logout ends the session, Sales and
  Operator navigation, the bounded error for a route without capability, redirect without shell content.
- Existing admin specs (`admin-inquiries`, `admin-content`, `admin-media`, `admin-staff`,
  `admin-content-mutations`) pass with the shell change: 119 passed, 13 skipped (their own conditions).
- Lint, typecheck, `pnpm check:architecture` and `pnpm build` clean; unit suite 300 passed (43 files; the
  architecture test caught the word "backend" in a shared-component comment, which was reworded).

### Found while doing 8.1 (fixed in 8.2)
- `/admin/products` fails axe `color-contrast` on `.astryx-badge` (2.87:1, `admin/content/StatusBadge.tsx`,
  warning tone) and its toolbar overflows horizontally below 400px (360 and 390 projects). Both pre-date
  this change; `admin-shell.spec.ts` checks that route for the shell only and 8.2 turns the checks on.

### Not covered
- Sticky behaviour of the phone bar (OD-5: `body` is the scroll container).
- Real browser forced-colors mode.

## 8.2 Content lists and authoring forms

### What changed
- New shared patterns in `components/admin/AdminContent.tsx` (+ `.module.css`): `AdminPage` (Astryx `Card`,
  the one h1, count, badge, actions), `AdminListPage` (header with the create action, a GET filter form,
  the Astryx `Table` in children mode or the shared `EmptyState`, previous/next as `Button` links that keep the
  filters), `AdminContentRow`, `AdminRowLink`, `AdminStatusFilter`, `ContentStatusBadge`, `AdminForm`,
  `AdminFormRow` (Astryx `Grid`, one column below ~340px), `AdminFieldset`, `AdminFormAlert` (shared `Alert`,
  with a refresh link for a version conflict) and `AdminStatusActions` (publish and archive, or the reached
  state as a badge).
- Products, categories, materials, services, articles and managed pages (lists, `new`, `[id]`) and the
  five `*Fields.tsx` files now use them. The 23 route files lost 856 lines and gained 302; the patterns are 199 lines of
  shared code. Routes keep their data loading, server actions, `expectedVersion` fields, redirects and
  error-code messages unchanged.
- The legacy `admin/content/StatusBadge.tsx` is deleted (no importer left).
- Pagination is a route-aware composition of `Button` links, not Astryx `Pagination`: that component is
  callback-driven (`onChange`), which would make every list client-only and lose the working-without-script
  property of the GET filters and page links.
- The Astryx `Table` scroll region owns narrow screens (a keyboard-focusable region that scrolls inside the card),
  so no list overflows the page at 360px. A card transformation of the rows is not done; see 8.6.
- Contrast fix: solid warning badges used Astryx's dark text on the light-theme warning colour (2.87:1).
  `astryx-theme.css` now sets `--color-on-warning` to white in light (about 6:1) and keeps the dark text in dark.
- Articles list: the Strapi notice is now an Astryx `Card` and `Button` link; its address is still the
  hard-coded `http://localhost:1337/admin` from the original page. That is wrong outside a developer machine and
  is left for an owner decision (it is not product behaviour I can pick).

### Verification
- Unit `admin-content.test.tsx` (6 tests): list, empty state, previous/next at the ends, form with rows and
  fieldset, alert with and without the refresh link, status actions per state; jest-axe clean.
- E2E `admin-content-presentation.spec.ts` (all 4 projects): for each of the six resources in both themes the
  list, create and edit screens (one main, one h1, table, filter form, create link, record link, no overflow, axe,
  no runtime errors); the status filter from the keyboard; a failed save and a version conflict; form focus;
  the status states. `admin-shell.spec.ts` now also checks `/admin/products` fully (axe and overflow).
- Together with the shell spec: 107 passed, 1 skipped. Existing admin specs (content, mutations, inquiries,
  media, staff) and the component lab: 84 passed, 12 skipped (their own conditions).
- Lint, typecheck, `check:architecture`, `pnpm build` clean; unit suite 306 tests, all pass (one
  `inquiry-form` test timed out at 5 s once under load and passed alone and in the next full run).

### Not covered
- Real publish/archive/save round trips are covered by the existing mutations spec only.
- Sorting and bulk selection are not offered (they were not before).
- A list with more than one page in the browser (the mock returns one page); the links are unit-tested.

