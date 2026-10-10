## Context

The frontend has one corporate-minimal light palette centralized in `frontend/src/design-system/tokens.css`. Shared UI, feedback, navigation, and public pages already consume semantic tokens, so a second theme can be introduced without changing component APIs or business behavior. The prior visual change explicitly deferred dark mode; the product owner has now required both light and dark modes.

The complete PWA remains scheduled for phase five. This change only exposes a theme-aware browser color so later Manifest work can reuse an established token decision.

## Goals / Non-Goals

**Goals:**

- Support accessible corporate-minimal light and dark palettes through stable semantic roles.
- Resolve the initial effective theme from an explicit saved choice or the operating-system preference.
- Let a keyboard, pointer, or touch user switch themes from desktop and mobile navigation.
- Persist explicit choice and prevent a wrong-theme first frame during navigation or reload.
- Keep `color-scheme` and browser `theme-color` aligned with the effective theme.
- Verify current surfaces in both themes at all four required viewport widths.

**Non-Goals:**

- Implementing Manifest, Service Worker, offline routing, install prompts, cache policy, push notifications, or PWA icons.
- Creating a final logo, brand asset, photography, contact value, or commercial claim.
- Changing routes, backend behavior, stored business data, authentication, inquiry workflows, or authorization.
- Adding more theme families, per-page themes, scheduled themes, accounts-based preference sync, ecommerce, payment, inventory, or automatic pricing.

## Decisions

### 1. Use two effective themes with system-based initialization

The rendered theme is always `light` or `dark`. If local storage contains one of those values, it wins; otherwise `prefers-color-scheme: dark` selects dark and all other environments select light. The toggle records the user's explicit next choice. Clearing or synchronizing preferences across accounts is outside this foundation.

**Alternative considered:** expose a permanent three-state light/dark/system selector. It adds UI and translation complexity that is not required to satisfy the current two-theme request. The no-preference state still respects the system on first use.

### 2. Declare the effective theme on the root element before first paint

A small inline bootstrap runs in the document head, validates local storage defensively, sets `data-theme` and `color-scheme` on `document.documentElement`, and updates the theme-color meta value. It must fail safely to the system/light resolution if storage or media APIs are unavailable.

The React control reads the root state after mount, changes it synchronously, persists the explicit choice, and listens for storage events so same-origin tabs converge. `suppressHydrationWarning` is limited to the root element because the pre-hydration attribute is intentional.

**Trade-off:** the inline bootstrap must later be covered by the deployment CSP nonce or hash. It contains no external input interpolation and no network behavior.

### 3. Extend semantic tokens rather than theme component variants

The existing `:root` values remain the light palette. A `[data-theme="dark"]` block overrides only semantic color, shadow, and focus roles. Components continue consuming the same token names. `color-scheme` is declared per effective theme so native controls match.

Status roles remain distinct from brand/action and business-section accents. Dark surfaces use restrained navy/slate values rather than pure black, preserving the selected corporate-minimal direction.

### 4. Reuse one preference control in desktop and mobile navigation

A client `ThemeToggle` owns preference behavior and is rendered in both navigation contexts. Each instance has an accessible Persian label that describes the action, exposes pressed state for the current dark mode, and meets the existing minimum control target.

### 5. Verify behavior, not screenshot color constants

Unit tests cover resolution, validation, persistence, DOM application, theme-color, and storage synchronization. Navigation tests cover accessible rendering. Playwright exercises system initialization, manual switching, reload persistence, token-driven computed colors, and overflow at 360, 390, 768, and 1280. Screenshots remain review evidence and tests avoid hard-coding every palette value.

## Risks / Trade-offs

- **[Wrong theme flashes before hydration]** → Run the defensive bootstrap in the head and verify the root attribute before asserting visible content.
- **[Storage access throws in restricted browsing contexts]** → Wrap reads and writes, retain in-memory DOM switching, and use system/light fallback.
- **[Dark palette weakens contrast or status distinction]** → Keep semantic roles separate and run component accessibility plus visual review in both themes.
- **[Duplicated toggle instances diverge]** → Use one shared controller component and synchronize root/storage events.
- **[Future CSP blocks inline initialization]** → Register the static bootstrap for the deployment nonce/hash when CSP is introduced; no unsafe dynamic value enters the script.

## Migration Plan

1. Add the preference resolver/bootstrap/controller with unit tests.
2. Add dark semantic token overrides and native color-scheme declarations.
3. Place the shared toggle in desktop and mobile navigation and verify accessibility.
4. Extend Playwright to cover both themes at required widths and review screenshots.
5. Run frontend and repository quality gates plus strict OpenSpec validation.

Rollback removes the frontend-only control, bootstrap, and dark token block. No database, API, or stored business-data migration is involved; an unused local-storage key is harmless and may be removed by the rollback code if desired.
