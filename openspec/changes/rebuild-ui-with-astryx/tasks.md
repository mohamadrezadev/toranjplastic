## 1. Baseline and adoption inventory

- [x] 1.1 Record the current frontend route and shared-component inventory, primitive usage counts, production build output, and clean quality-gate results before migration.
- [x] 1.2 Capture light/dark screenshots of representative public, auth, inquiry, customer, and admin screens at 360, 390, 768, and 1280 pixels for regression comparison.
- [x] 1.3 Run the current component accessibility tests and critical Playwright flows and record any pre-existing failures separately from Astryx adoption findings.
- [x] 1.4 Use the Astryx CLI documentation/discovery workflow to map each required Toranj primitive and screen pattern to a supported public component, template, Toranj composition, or documented gap.

## 2. Reproducible Astryx setup and agent guidance

- [x] 2.1 Confirm the reviewed published Astryx release and base theme, then add exact matching versions of Core, theme, and CLI to the frontend workspace and lockfile.
- [x] 2.2 Add a deterministic project-local `astryx` package script and verify version, manifest, docs, component, template, search, and build discovery commands from a clean install.
- [x] 2.3 Run `astryx init` at the repository root, review every generated guidance change, and retain only marked content that preserves the Toranj contract and OpenSpec precedence.
- [x] 2.4 Add an automated dependency-alignment or doctor check that fails when installed `@astryxdesign/*` package versions diverge.

## 3. CSS, theme, direction, and provider foundation

- [x] 3.1 Introduce the documented Astryx reset/component/theme CSS layer order without changing the appearance of unmigrated production screens.
- [x] 3.2 Create the Toranj Astryx theme mapping for petroleum-and-stone color roles, Vazirmatn typography, spacing, radius, elevation, motion, focus, status, light mode, and dark mode.
- [x] 3.3 Add a narrow client provider boundary for Astryx theme/link integration while keeping the root layout and route composition server-rendered.
- [x] 3.4 Preserve the existing pre-paint theme resolver as the single preference source and verify that Astryx follows light/dark changes without flash, duplicate storage, or hydration warnings.
- [x] 3.5 Verify `lang="fa"`, `dir="rtl"`, bidi-isolated LTR data, reduced motion, bundled fonts, theme color, and noindex behavior after provider and CSS integration.
- [x] 3.6 Extend frontend architecture checks to reject Astryx source/deep imports, generated-class selectors, product logic in primitive adapters, and unauthorized StyleX/build-plugin adoption.

## 4. Component preview and primitive foundation

- [x] 4.1 Rebuild the existing noindex brand preview as an Astryx component lab using real Persian sample labels and factual non-product placeholder content.
- [x] 4.2 Implement typed Toranj adapters or public exports for Button and action-link behavior, including primary, secondary, ghost, danger, loading, disabled, and mobile target states.
- [x] 4.3 Implement typed adapters or public exports for text input, textarea, select/selector, checkbox, radio, and switch behavior with Persian label/help/error relationships.
- [x] 4.4 Implement shared feedback patterns for alert, loading, empty, error, success, status badge, and pending/disabled submission states.
- [x] 4.5 Implement and verify navigation, breadcrumb, pagination, dialog/layer, responsive collection/table, and directional-data patterns selected from Astryx discovery.
- [x] 4.6 Add component tests covering semantic HTML, accessible names, keyboard activation, focus return/trap where applicable, loading, disabled, validation, and axe results.
- [x] 4.7 Add Playwright coverage for the component lab in Persian RTL and both themes at all required widths, including directional icons, keyboard navigation, overlays, and absence of horizontal overflow.
- [x] 4.8 Run Astryx doctor on the preview source/build and resolve all critical dependency, styling, component-purity, accessibility, RTL, or setup findings before screen migration.

## 5. Public experience migration

- [x] 5.1 Migrate the public header, mobile navigation, breadcrumbs, content container, footer, theme control, and campaign banner as one coherent responsive shell.
- [ ] 5.2 Migrate the public home composition using Astryx-discovered layout, card, typography, action, and media patterns without adding unverified claims or commerce behavior.
- [ ] 5.3 Migrate product, injection-service, material, article, category, and institutional collection/detail surfaces while preserving CMS data, metadata, JSON-LD, pagination, and factual empty/error states.
- [ ] 5.4 Update public component and Playwright tests for keyboard navigation, RTL order, media bounds, theme behavior, and continuous responsive transitions at and around required breakpoints.

## 6. Authentication and inquiry migration

- [ ] 6.1 Migrate registration, login, authorization failure, and secure logout presentation while preserving noindex/no-store and server-derived role behavior.
- [ ] 6.2 Migrate inquiry type selection and the guided multi-step inquiry form with preserved values, validation, pending/disabled behavior, RTL step semantics, and no automatic retry.
- [ ] 6.3 Verify auth and inquiry flows with component and E2E tests in both themes and required widths, including keyboard-only submission and service/validation failures.

## 7. Customer portal migration

- [ ] 7.1 Migrate the customer portal shell, account context, navigation, overview, request list/filter, request detail, history, loading, empty, and error states.
- [ ] 7.2 Migrate customer-visible inquiry messaging with chronological content, distinct composer state, pending/disabled behavior, and ownership-safe failures.
- [ ] 7.3 Migrate quotation display, private PDF action, accept/reject confirmation, conflict, expired, already-answered, and success states without implying automatic pricing or purchase.
- [ ] 7.4 Verify private customer flows retain server ownership, redaction, noindex/no-store, dark/light, Persian RTL, keyboard, and responsive requirements.

## 8. Admin experience migration

- [ ] 8.1 Migrate the admin shell, skip link, identity/account context, capability-aware navigation, secure logout, breadcrumbs, responsive sidebar/menu, and shared page workspace.
- [ ] 8.2 Migrate admin content lists and authoring forms for products, materials, services, articles, categories, and managed pages using shared Astryx-backed patterns.
- [ ] 8.3 Migrate media library, uploader, picker dialog, gallery editor, progress, failure, deletion-blocked, and conflict states with focus trap/return and keyboard coverage.
- [ ] 8.4 Migrate inquiry operations, assignment, status transitions, internal notes, customer messages, timelines, conflict handling, and quotation editor panels without changing backend authorization.
- [ ] 8.5 Migrate staff list/create/detail surfaces with capability-derived UI, validation, forbidden, inactive, and optimistic-conflict states.
- [ ] 8.6 Verify admin E2E flows at all required widths and themes, including keyboard-only operation, responsive table/card transformations, overlay focus, and negative capability paths.

## 9. Cleanup, documentation, and delivery gates

- [ ] 9.1 Remove legacy primitive/style paths only after repository-wide usage checks prove they are unused; remove temporary adapters whose call sites have completed migration.
- [ ] 9.2 Document the Toranj theme mapping, public component entry points, approved Astryx workflow, swizzle exception process, and exact package-upgrade procedure.
- [ ] 9.3 Run package-version alignment, lint, typecheck, unit/component tests, architecture checks, backend/frontend E2E tests, PostgreSQL integration tests where applicable, and the production monorepo build.
- [ ] 9.4 Run final Astryx source and completed-build doctor checks and resolve every critical or unexplained RTL, accessibility, hydration, styling, or dependency finding.
- [ ] 9.5 Re-capture the representative visual matrix, compare it with the baseline, and verify no unintended overflow, mixed visual system, fabricated content, or product-contract regression.
- [ ] 9.6 Review every acceptance scenario in the change specs, record evidence beside the matching task, and leave all unproved tasks unchecked before archive.
