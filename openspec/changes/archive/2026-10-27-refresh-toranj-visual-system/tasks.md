## 1. Baseline and dependency

- [x] 1.1 Record the current theme/font behavior and available screenshot prerequisites for public, auth, inquiry, account, and admin surfaces at 360, 390, 768, and 1280.
- [x] 1.2 Add `@fontsource-variable/vazirmatn@5.3.0` to the frontend dependency graph and lockfile, switch the root import, and remove Estedad only after repository-wide consumption checks pass.

## 2. Semantic theme foundation

- [x] 2.1 Reconcile and apply the v3 petroleum-and-stone Light/Dark registry in `frontend/src/design-system/tokens.css`, preserving every existing public alias needed by consumers and adding on-action/on-danger/media/hero-link tokens.
- [x] 2.2 Update `frontend/src/design-system/theme.ts` canvas colors while preserving `toranj-theme`, system fallback, pre-paint bootstrap, `data-theme`, and `color-scheme` behavior.
- [x] 2.3 Update typography and theme unit/architecture/E2E assertions, then run the focused design-system and theme tests.

## 3. Shared component migration

- [x] 3.1 Migrate Button primary/danger and Navigation/Content primary actions to `--color-on-action` and `--color-on-danger`, including hover, focus, loading, and disabled behavior.
- [x] 3.2 Replace UI-only hard-coded orange/green/navy colors in Navigation, Footer, Content, and Auth with reviewed semantic tokens while leaving logos and product photography unchanged.
- [x] 3.3 Audit public, auth, inquiry, customer, and admin CSS for foregrounds invalidated by the new global palette; fix only semantically confirmed cases and preserve status meanings.
- [x] 3.4 Run focused component tests for Button, ThemeToggle, navigation/drawer, fields, and feedback states in both themes.

## 4. Repository verification

- [x] 4.1 Run frontend lint, typecheck, unit tests, architecture checks, and production build; record exact results and resolve regressions in scope.
- [x] 4.2 Run the supplied palette contrast check and verify key normal-text/action/danger/focus combinations in Light and Dark meet the documented thresholds.
- [x] 4.3 Run Playwright or the repository's documented visual workflow at 360, 390, 768, and 1280 for public, auth, inquiry, account, and admin surfaces; verify RTL, overflow, typography, drawer, focus, loading, and disabled states.
- [x] 4.4 Verify theme preference persistence/system precedence and confirm no regression to noindex/no-store, authorization boundaries, inquiry semantics, API, backend, or database.

## 5. Handoff

- [x] 5.1 Review the implementation diff against the checked v3 manifest, document completed/blocked verification and rollback, and keep `redesign-public-homepage` separate for owner-reviewed composition work.
- [x] 5.2 Archive `refresh-toranj-visual-system` only after all acceptance checks are evidenced and accepted.
