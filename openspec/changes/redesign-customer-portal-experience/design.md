## Context

The private customer experience currently spans `/account` and `/inquiry` with two minimal layouts, flat route-level markup, and compressed CSS modules. The portal styles reference obsolete token names that are not defined by Design System v2, so important backgrounds, borders, text colors, and focus styling are dropped by the browser. Inquiry forms place every control in one anonymous two-column grid, which creates poor scanning order and weak mobile hierarchy.

The redesign must stay server-first, keep authentication and private-data reads uncached, and reuse the existing inquiry API and Server Actions. The account and inquiry routes need one visual language without moving routes or weakening security boundaries.

## Goals / Non-Goals

**Goals:**

- Provide one responsive customer-portal shell across account and inquiry routes.
- Establish clear page hierarchy, navigation, account context, request status presentation, and safe logout.
- Group long inquiry forms into meaningful sections with predictable one- and two-column behavior.
- Use only current design-system tokens and preserve light/dark theme behavior.
- Eliminate private-route instant-navigation diagnostics by explicitly treating these uncached routes as blocking.

**Non-Goals:**

- Change routes, backend contracts, persistence, ownership, authentication, or CSRF behavior.
- Add profile editing, notifications, messaging, attachments, quotations, prices, payment, or inventory.
- Introduce a new icon, CSS, or component dependency.

## Decisions

1. **Create a shared domain-level `CustomerPortalShell`.** Both account and inquiry layouts will authenticate on the server and pass the approved public account object to the shell. The shell owns brand treatment, primary navigation, account summary, logout, and responsive chrome; route pages continue to own their content. Duplicating account/inquiry shells was rejected because their visual drift caused the current inconsistency.
2. **Use a desktop sidebar that becomes a compact stacked header and horizontal navigation below 1024px.** This keeps all destinations visible without a client-side hamburger menu and remains keyboard operable. At 360/390px, actions become full-width and content padding contracts without horizontal overflow.
3. **Make form grouping semantic.** Inquiry forms use `fieldset`/`legend` sections for request context, technical details, delivery, and additional notes. Each section contains an auto-fit field grid; textareas and explanatory notices span the section. This preserves DOM/keyboard order while allowing two columns only when space permits.
4. **Use Design System v2 tokens exclusively.** Portal CSS will replace undefined legacy variables with `surface-*`, `border-*`, `text-*`, and `status-*` tokens. Shared input primitives remain unchanged unless a portal-scoped class is necessary.
5. **Treat private routes as blocking.** Account and inquiry layouts will export `instant = false` because session cookies and `no-store` data are intentionally dynamic. Caching private data or weakening `no-store` was rejected.
6. **Test structure and responsive behavior at the UI boundary.** Component tests cover portal landmarks/navigation and grouped form semantics. Existing inquiry e2e coverage is extended with viewport assertions at 360, 390, 768, and 1280 pixels and horizontal-overflow checks.

## Risks / Trade-offs

- [Risk] A persistent sidebar can consume too much tablet space. → Collapse to the stacked shell before tablet width and use a compact navigation row.
- [Risk] Long Persian labels can force grid overflow. → Use `minmax(0, 1fr)`, auto-fit minimums, wrapping labels, and explicit `min-width: 0` throughout.
- [Risk] Shared shell changes affect multiple private routes at once. → Keep route data fetching and business logic untouched and cover all destinations in focused tests.
- [Risk] Browser-assisted visual inspection is unavailable in the current tool session. → Enforce viewport/overflow assertions in repository tests and leave the dev server running for direct user review.

## Migration Plan

No database or API migration is required. Deploy as a frontend-only change. Rollback restores the previous layouts and CSS modules without data impact.

## Open Questions

None.
