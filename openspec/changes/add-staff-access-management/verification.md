# Implementation verification

## Final automated gates

- `openspec validate add-staff-access-management --strict`: passed.
- `pnpm check:architecture`: passed; 203 frontend source files and 4 negative boundary fixtures verified.
- `pnpm check`: passed with no errors; lint completed with pre-existing inquiry/quotation warnings, backend and frontend typechecks passed, 163 backend unit tests passed, 135 frontend unit/component tests passed, and both production builds completed.
- `pnpm --filter backend test:e2e`: 8 files and 46 HTTP contract tests passed. This suite does not launch a browser.
- `pnpm test:integration:postgres`: 4 files and 14 tests passed after all 8 migrations were deployed to a disposable PostgreSQL 17 database named `toranj_staff_test`; the disposable container and database were removed afterward.
- `git diff --check`: passed.

## Coverage evidence

Coverage now combines backend unit and HTTP suites through `backend/vitest.config.coverage.ts`, so controllers and services are measured in one report instead of producing misleading isolated results.

| Change-owned executable surface | Lines | Branches | Functions | Evidence |
|---|---:|---:|---:|---|
| Backend staff service | 100% | 97.36% | 100% | Unit plus PostgreSQL atomicity tests |
| Backend staff/admin/inquiry/product controllers | 100% | 100% | 100% | Direct delegation tests plus HTTP contract tests |
| Backend capability policy | 100% | 100% | 100% | Full role/capability matrix |
| Backend identity service | 100% | 97.87% | 92.85% | Registration, login, rate limit, sessions, CSRF, logout and bootstrap tests |
| Backend admin inquiry service | 100% | 100% | 100% | List, assignee, transition, note and message paths |
| Frontend `admin-staff` feature | 100% | 96.92% | 100% | Transport validation, safe errors, CSRF mutations and server actions |
| Frontend authentication actions | 100% | 95% | 100% | Role routing, safe `next`, registration and logout tests |
| Frontend authentication transport | 100% | 100% | 100% | Bounded account/capability and cookie handling tests |

The remaining raw V8 gaps on `auth.guard.ts`, `staff.dto.ts`, and the injectable marker on `identity.service.ts` are decorator/transpiler bookkeeping; their executable guard, validation and service paths are covered by unit and HTTP tests. The legacy `PrismaInquiryRepository` is not claimed as a 95% whole-file unit target: the staff change modifies only Sales eligibility, which is covered at the staff public-contract, inquiry-service and HTTP levels. No production coverage exclusion or ignore annotation was added to hide these lines.

## Acceptance trace

- Fixed role/capability matrix, forged-role denial and server-side enforcement: `auth.guard.spec.ts`, `admin-content.e2e-spec.ts`, `admin-inquiries.e2e-spec.ts`, and `staff.e2e-spec.ts`.
- Staff directory privacy, creation validation, duplicate handling, version conflicts, self-change and last-active-Administrator safety: `staff.service.spec.ts`, `staff.controller.spec.ts`, and `staff.e2e-spec.ts`.
- Concurrent last-Administrator protection plus rollback of account/version/session/audit writes: `staff.postgres.integration.ts` on disposable PostgreSQL.
- Sales inquiry access and eligible assignees, Operator content access, and cross-role denial: `admin-inquiry.service.spec.ts`, `admin-inquiry.controller.spec.ts`, `admin-inquiries.e2e-spec.ts`, and `admin-content.e2e-spec.ts`.
- Capability-aware frontend transport/actions, safe error codes, CSRF attachment and password non-repopulation: `admin-staff/api.test.ts`, `admin-staff/actions.test.ts`, `auth.test.ts`, and `auth/actions.test.ts`.
- RTL responsive staff list/create/detail and cross-role browser journeys: previously recorded Playwright evidence remains 107 passed with 1 expected desktop-only skip at 360, 390, 768 and 1280 pixels. Per the user's explicit request on 2026-10-18, Chrome/Playwright was not launched again during final backend/frontend verification; final manual user-journey acceptance is owned by the user.

## Archive readiness

All implementation tasks and non-browser engineering gates are complete, acceptance scenarios have test evidence, and the change is ready for review and OpenSpec archive. Browser/manual acceptance is intentionally not a blocking automated gate for this handoff because the user elected to run it separately.
