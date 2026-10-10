## Context

Phase zero provides a Next.js RTL shell, provisional CSS tokens, a small status registry, and a production build pipeline. It does not yet provide reusable primitives, feedback patterns, public navigation, or automated browser verification. This change turns that foundation into a coherent frontend system used later by public, customer, and admin screens.

The implementation must remain independent of backend domain contracts. Brand colors, vector logo, font files, imagery, contact details, and technical/commercial claims are not approved, so the system must distinguish reusable structure from publishable content. The active `initialize-project-foundation` change is a prerequisite and must be completed or reconciled before this change is applied.

## Goals / Non-Goals

**Goals:**

- Define a stable frontend layering model for tokens, primitives, feedback patterns, domain components, and route screens.
- Build accessible, typed primitives for buttons and common form controls with complete interaction states.
- Build consistent loading, empty, success, warning, information, and error patterns.
- Introduce a reusable Persian RTL public shell with desktop navigation, accessible mobile navigation, breadcrumb, and safe footer behavior.
- Make visual and functional verification at 360, 390, 768, and 1280 pixels repeatable in the repository.
- Preserve strict boundaries around provisional brand assets, unverified content, private data, and out-of-scope ecommerce behavior.

**Non-Goals:**

- Implementing CMS data, authentication/OTP, inquiry persistence, customer/admin workflows, quotations, uploads, or backend endpoints.
- Finalizing the logo, palette, typography files, imagery, contact information, legal copy, or industrial claims.
- Implementing service-worker caching, install prompts, PWA icons, analytics, or final SEO publication.
- Introducing cart, checkout, payment, live inventory, or automatic price calculation.
- Building a general-purpose external component package or publishing a package to a registry.

## Decisions

### 1. Keep the design system inside the frontend package

The system will remain in `frontend/src/` because there is currently one web consumer and no proven need for a separately versioned package.

```text
frontend/src/
  design-system/
    tokens.css
    states.ts
  components/
    ui/                 # Button and form primitives
    feedback/           # Alert, LoadingState, EmptyState, ErrorState
    navigation/         # Header, MobileNavigation, Footer, Breadcrumb
  app/
    (public)/           # shared public layout and shell-only routes
```

Primitives may depend on tokens and framework utilities but MUST NOT call APIs or import product-domain modules. Feedback and navigation patterns may compose primitives. Route screens may compose all lower layers.

**Alternative considered:** a separate workspace package such as `packages/ui`. It is rejected for this phase because it adds build, versioning, and import-boundary overhead without a second application consumer. Extraction remains possible after portal/admin usage reveals a stable public API.

### 2. Use CSS custom properties and CSS Modules

Semantic CSS custom properties remain the token transport. Component styles use CSS Modules and logical properties such as `margin-inline`, `padding-inline`, and `inset-inline-start` so RTL behavior is structural rather than duplicated in directional stylesheets.

The token registry will extend the existing palette with semantic typography, elevation, control height, focus ring, motion duration, and container values. Brand values keep an explicit provisional comment and MUST NOT be renamed as approved identity. Status tokens remain independent from industrial and kitchen accents.

**Alternative considered:** adding Tailwind or a runtime CSS-in-JS library. Both are rejected because the current stack already compiles CSS Modules, and another styling runtime or utility configuration is unnecessary for the required component set.

### 3. Prefer native HTML semantics and narrow typed APIs

Button and field primitives wrap native elements instead of recreating their keyboard behavior. Component APIs will extend the appropriate React HTML attribute types and add only design-system properties such as `variant`, `isLoading`, `label`, `helpText`, and `error`.

The Button renders a native `button`; navigation actions render links through the navigation layer rather than polymorphically changing Button semantics. Loading sets disabled behavior, exposes a busy state, and retains text/width. Form fields use stable generated IDs, explicit labels, `aria-describedby`, and `aria-invalid`. Checkbox, Radio, and Switch retain native inputs; Switch uses checked semantics and a visible text label.

**Alternative considered:** a single polymorphic `as` component for buttons and links. It is rejected because it makes invalid prop combinations and accessibility regressions easier. Visual reuse can be achieved through shared classes while semantic components remain distinct.

### 4. Keep Server Components as the default

Static primitives, feedback surfaces, header content, footer, and breadcrumb remain Server Component compatible. A client boundary is introduced only for behavior that requires browser state, primarily the mobile navigation drawer and any future transient announcement controller.

The mobile drawer uses a native button trigger, `aria-expanded`, `aria-controls`, Escape handling, focus entry/return, and background interaction blocking. The implementation will use the platform `inert` capability with an accessible fallback if compatibility requires it.

**Alternative considered:** making the full public shell a Client Component. It is rejected because it increases client JavaScript and weakens the PRD performance goal without improving the static shell.

### 5. Use explicit feedback components instead of a global toast system

This phase introduces `Alert`, `LoadingState`, `EmptyState`, and `ErrorState`. Field errors stay next to their controls. Page and section feedback remain in the relevant content region. Live-region behavior is conservative: errors and time-sensitive failures use an assertive role only when interruption is justified; routine success/information uses polite announcements.

A global toast queue is deferred because no implemented workflow yet needs cross-route transient notifications, and premature toast infrastructure would force timing, stacking, dismissal, and persistence decisions.

Error components accept user-safe messages and recovery callbacks only. They never render raw server exceptions or diagnostic payloads. Retry controls are opt-in so non-idempotent operations cannot accidentally be resubmitted.

### 6. Drive public navigation from one typed route registry

A typed public-route registry will hold the approved Persian label, path, navigation visibility, and implementation state for each route. Header, mobile menu, footer, and breadcrumb consume this registry so destinations cannot drift.

The phase will provide shell-only, explicitly unapproved/noindex route surfaces where needed to make approved navigation destinations valid. These surfaces use a clear «در حال آماده‌سازی» empty state and contain no invented company, product, price, inventory, capacity, certification, or contact data. A route not represented by an implemented surface is excluded from navigation.

**Alternative considered:** rendering all PRD links with `#` or placeholder URLs. It is rejected because it violates the valid-destination requirement and creates misleading navigation.

### 7. Separate shell structure from approved site content

Header labels and route names come from the approved PRD navigation. Footer contact and social data are represented as optional content. Until verified values are supplied, those regions are omitted or display an explicit non-contact placeholder; legacy values are never imported automatically.

The current textual brand mark remains a temporary label, not a claimed final logo. No PWA icon or logo asset is generated during this change. The public shell retains `noindex, nofollow` while its visible content is provisional.

### 8. Test behavior at three levels

1. **Static/type tests:** TypeScript and lint ensure component APIs and layer boundaries remain valid.
2. **Component tests:** Vitest, jsdom, Testing Library, and accessibility assertions verify keyboard activation, labels, described-by relationships, disabled/loading behavior, live regions, and focus management.
3. **Browser tests:** Playwright runs the public shell at 360, 390, 768, and 1280 pixels. It checks absence of page-level horizontal overflow, desktop/mobile navigation visibility, menu keyboard behavior, focus return, valid destinations, `noindex` metadata, and representative long RTL/LTR content. Screenshots provide review evidence but assertions, not screenshots alone, determine pass/fail.

Playwright is selected because phase-zero browser verification could not run reliably through the ambient browser environment; a repository-owned test runner makes the requirement reproducible locally and in CI.

**Alternative considered:** manual screenshots only. They remain useful for review but are insufficient as the sole acceptance evidence because keyboard, focus, overflow, and metadata behavior require assertions.

### 9. API, data, security, and performance boundaries

This change introduces no backend API or database schema. Components receive typed local data and callbacks; they do not fetch. Private-data caching behavior remains outside this public-shell change.

Security-sensitive UI states use generic, non-disclosing messages. Hiding controls is never treated as authorization. No secret, token, OTP, private attachment path, internal note, or raw personal payload appears in fixtures or snapshots.

Performance is protected by keeping the shell server-rendered, limiting client JavaScript to the mobile drawer, avoiding runtime styling libraries, reserving loading-state dimensions, and loading no external font or image assets before approval.

## Risks / Trade-offs

- **[Brand tokens may change after implementation]** → Keep semantic names stable and isolate provisional raw values in the token registry so approval changes values rather than component APIs.
- **[Shell-only routes could be mistaken for launched content]** → Keep them visibly marked as preparing, exclude unverified claims, and retain `noindex, nofollow` until content approval.
- **[Focus trapping and inert behavior vary across browsers]** → Cover the supported browser set with Playwright keyboard tests and keep the interaction implementation small and native-first.
- **[Component APIs may grow before real domain usage]** → Implement only states required by the current specs; add domain-driven variants through later OpenSpec changes.
- **[Playwright increases install and CI cost]** → Install only the required browser in CI, cache browser binaries where supported, and keep the suite limited to high-value viewport/interaction flows.
- **[Persian fallback fonts render differently across systems]** → Test layout with conservative line-height and wrapping; add approved local font files only after product approval.
- **[Automated accessibility checks can miss usability issues]** → Combine semantic assertions with keyboard flows and targeted manual review; do not claim full accessibility certification.

## Migration Plan

1. Complete or reconcile `initialize-project-foundation`, preserving its token and RTL contracts.
2. Extend the semantic token registry without changing approved token meanings.
3. Add primitives and component tests, then replace phase-zero page-specific controls with shared primitives.
4. Add feedback patterns and verify loading/empty/error behavior independently.
5. Add the typed route registry, public layout, navigation, breadcrumb, footer, and shell-only destination surfaces.
6. Add Playwright viewport and keyboard tests, then include them in the root quality/CI workflow.
7. Keep all provisional public surfaces `noindex`; enabling indexing requires a later content/SEO change with approved identity and data.

Rollback is file-level because this phase has no API or database migration. The phase-zero page and tokens remain the fallback until the new public layout passes component and browser tests. No Docker volume, database, or external resource is modified.

## Open Questions

- Which vector logo, color values, font files, and imagery are approved for production?
- Which company phone, email, address, social links, and legal text are approved for the footer?
- Should shell-only routes be visible to stakeholders in production-like environments, or limited to development/staging until content work begins?
- Which browser matrix beyond Chromium is required for release verification?
- Does the team want a component showcase such as Storybook in a later change, or are tests and application fixtures sufficient?
