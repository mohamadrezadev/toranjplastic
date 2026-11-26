# Pre-Astryx frontend baseline

Recorded before any Astryx dependency, CSS, provider, component, or screen change.

## Repository baseline

- Git commit: `063aff97a074f5dd36adbd8b15273f81faf38b4b`
- Node: `v24.18.0`
- pnpm: `9.15.9`
- Next.js: `16.4.3`
- React / React DOM: `19.3.0`
- Only the untracked `openspec/changes/rebuild-ui-with-astryx/` planning directory existed when the baseline was taken.

## Route inventory

The frontend contains 47 `page.tsx` source pages. The clean pre-migration production build generated 55 static/partial/dynamic entries.

### Public

- `/`
- `/about`, `/contact`, `/privacy`, `/terms`
- `/products`, `/products/[slug]`
- `/injection-molding`, `/injection-molding/[slug]`
- `/materials`, `/materials/[slug]`
- `/articles`, `/articles/[slug]`, `/articles/category/[slug]`
- `/brand-preview`
- `/robots.txt`, `/sitemap.xml`

### Authentication and inquiry creation

- `/auth/login`, `/auth/register`
- `/inquiry`, `/inquiry/[type]`

### Customer account

- `/account`
- `/account/inquiries`
- `/account/inquiries/[id]`

### Administration

- `/admin`
- `/admin/articles`, `/admin/articles/new`, `/admin/articles/[id]`
- `/admin/categories`, `/admin/categories/new`, `/admin/categories/[id]`
- `/admin/materials`, `/admin/materials/new`, `/admin/materials/[id]`
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]`
- `/admin/services`, `/admin/services/new`, `/admin/services/[id]`
- `/admin/pages`, `/admin/pages/new`, `/admin/pages/[id]`
- `/admin/inquiries`, `/admin/inquiries/[id]`
- `/admin/media`
- `/admin/staff`, `/admin/staff/new`, `/admin/staff/[id]`

### Frontend route handlers and assets

- `/api/admin-media/[id]/preview`
- `/api/revalidate`
- `/apple-icon.png`, `/icon.png`

## Shared component inventory

- 28 non-test shared component files under `frontend/src/components`
- 8 colocated shared component test files
- 19 CSS Module files across `frontend/src`
- 10 Playwright spec files

Component groups and files:

- UI primitives: `Button`, `Choice`, `DirectionalData`, `FieldSupport`, `Input`, `Select`, `Textarea`
- Feedback: `Alert`, `EmptyState`, `ErrorState`, `LoadingState`
- Navigation: `ActionLink`, `Breadcrumb`, `Footer`, `Header`, `MobileNavigation`
- Theme: `ThemeToggle`
- Content: `CampaignBanner`, `ContentPage`, `ManagedPage`
- Customer: `CustomerPortalShell`, `CustomerQuotations`, `CustomerSubmitButton`, `PortalNavigation`
- Admin: `AdminBreadcrumbs`, `AdminNavigation`, `AdminPortalShell`, `AdminSubmitButton`

## Primitive JSX usage

Counted from `.tsx` source before Astryx adoption:

| Primitive | Uses |
| --- | ---: |
| Input | 74 |
| Button | 58 |
| Select | 20 |
| Textarea | 17 |
| Checkbox | 3 |
| Radio | 1 |

These counts justify compatibility adapters and a phased migration instead of a flag-day API replacement.

## Quality and build baseline

### Frontend-scoped gates

- `pnpm --filter frontend lint`: passed with one pre-existing warning in `src/app/(public)/(content)/contact/page.tsx` for unused `PreservedText`.
- `pnpm --filter frontend typecheck`: passed.
- `pnpm --filter frontend test`: passed, 37 files and 198 tests.
- `pnpm --filter frontend build`: passed with Next.js 16.4.3 / Turbopack; compiled in 9.5 seconds, TypeScript in 3.6 seconds, and generated 55 entries.

### Monorepo gate

`pnpm check` did not reach typecheck/test/build because the pre-existing backend lint failed before Astryx changes:

- `backend/src/quotations/quotations.service.ts:446:13`
- rule: `typescript(no-floating-promises)`

Backend lint also reported existing warnings. This failure is outside the UI migration scope and is recorded so it cannot be attributed to Astryx. Final delivery still requires the repository-wide gate to be green or the unrelated backend defect to be resolved through its appropriate scope.

## Visual baseline

`frontend/e2e/astryx-baseline-visual.spec.ts` records five representative surfaces in light and dark themes for every Playwright project (360, 390, 768, and 1280 pixels):

- public home
- authentication login
- product inquiry form with a customer session
- customer inquiry detail
- admin inquiry detail

The four viewport tests passed their assertions and generated 40 checked-in platform-specific PNG references under `frontend/e2e/astryx-baseline-visual.spec.ts-snapshots/`. Each capture asserts Persian RTL, the requested theme, loaded local fonts, and no document-level horizontal overflow before taking the screenshot.

The Playwright command did not terminate its web-server processes after all four tests reported `ok`; it was interrupted after a further 60 seconds. The same teardown hang occurred in the pre-existing critical-flow run and is recorded as a runner issue rather than a visual assertion failure.

## Pre-existing accessibility and critical-flow findings

- Component accessibility coverage ran inside the clean frontend Vitest baseline: all 37 files / 198 tests passed, including the existing `jest-axe` suites for UI primitives, navigation, feedback, content, and theme controls.
- The selected pre-migration Playwright run covered public shell/content, auth, inquiry/customer, and admin/customer quotation flows across all four configured viewports.
- Public, auth, admin quotation, and customer quotation checks passed before teardown; expected material-service error fixtures logged their bounded 503 path.
- `authenticated customer can submit and view a private product inquiry` failed in all four projects before Astryx changes. The password-login fixture creates an Admin session, so the test arrives at the Admin shell while expecting the customer navigation named `بخش‌های پنل مشتری` at `frontend/e2e/inquiries.spec.ts:37`.
- The runner also remained alive during teardown after test execution and required interruption. Both the inquiry fixture mismatch and teardown behavior are baseline defects, not Astryx regressions.
