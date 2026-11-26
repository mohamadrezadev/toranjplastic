# Public shell migration evidence

Recorded on 2026-11-12 for task 5.1.

## Astryx discovery

- `pnpm astryx component`: `TopNav`, `TopNavItem`, `TopNavHeading`,
  `MobileNav`, `SideNavItem`, `IconButton`, `Breadcrumbs`, `Link`,
  `Collapsible`, `CollapsibleGroup`, `Text`, `Heading`.
- `pnpm astryx docs icons available-names`.
- `pnpm astryx template`: `MobileNavBasicMobileNav` and
  `CollapsibleDividedAccordion` blocks.
- `pnpm astryx build` with a footer brief, plus `pnpm astryx search` for a
  site footer, an image banner and a page container. None of the three has
  a matching pattern. The nearest results were `LayoutFooter` (pinned action
  bar), `ClickableCard` and `Layout`/`contentWidth`.

## Implementation decisions

| Shell part | Implementation | Notes |
| --- | --- | --- |
| Header | `TopNav`: Toranj brand link in `heading`, primary destinations in `centerContent`, theme, inquiry and account actions in `endContent` | One landmark, `ناوبری اصلی`. Inline links above 72rem, drawer trigger at or below it. |
| Current page | `isSelected` on `TopNavItem` and `SideNavItem` | Resolved after hydration. Reading `usePathname()` while prerendering blocks the shared layout on dynamic `[slug]` routes under Next.js 16. Every link stays in the prerendered HTML. |
| Mobile navigation | `IconButton` trigger with `MobileNav` (side `end`, native modal dialog) and `SideNavItem` rows | Replaces the hand-written focus trap and `inert` handling. Closes on navigation. Persian open/close strings are in `astryx-i18n.ts`. |
| Breadcrumbs | `Breadcrumbs` (`variant="supporting"`) with `BreadcrumbItem` | `aria-current="page"` on the last item. |
| Theme control | `IconButton` with `Icon` and the Toranj sun/moon SVG components | Preference, storage key and change event unchanged. The control observes `<html data-theme>`. |
| Actions | `ActionLink` uses the shared Astryx-backed `Button` adapter | |
| Footer | Toranj composition on `data-toranj-surface="inverse"`. Astryx `Link` for every link; `CollapsibleGroup`/`Collapsible` replaces native `<details>` below 40rem. | Astryx has no site-footer pattern. Approved copy and contact values are unchanged. |
| Campaign banner | Retained Toranj `CampaignBanner` image link | `ClickableCard` is a padded, bordered card. `next/image` already reserves the artwork ratio, so `AspectRatio` adds nothing. |
| Content container | Retained `.content-container` utility | `Layout` is an app frame with its own scroll regions. Adopting it would change document scrolling, the sticky header and page structure. |

## Theme additions (`astryx-theme.css`)

- `[data-toranj-surface="inverse"]` maps Astryx text, icon and border roles
  to the hero palette and sets `color-scheme: dark`, so hover overlays take
  their dark side.
- **Pre-existing defect fixed:** footer focus was invisible in light mode.
  The global focus outline (`--color-brand-action`, `#244146`) equals the
  light footer background (`#244146`). The inverse surface switches the
  outline and halo to the hero ink.
- `.astryx-collapsible-trigger`, a documented theme target, carries
  `--control-min-height`. Measured Astryx densities: compact 26px, balanced
  34px, spacious 42px. The trigger now measures 44px.

## Test changes

- **Unit (`navigation.test.tsx`):** landmarks, destinations and actions;
  drawer open/close with `aria-expanded`/`aria-controls`; footer contact links;
  keyboard expansion of the collapsible link groups; axe. jsdom lacks the
  modal dialog methods, so the test adds a minimal `showModal`/`close`
  polyfill.
- **E2E (`public-shell.spec.ts`):**
  - drawer keyboard flow, focus containment while open and focus return;
  - current-page marker and breadcrumb semantics, with no runtime errors on a
    dynamic route;
  - 1151/1152/1153px header breakpoint sweep in both themes;
  - footer link groups by keyboard, with the 44px trigger;
  - visible footer focus.
- **E2E (`astryx-foundation.spec.ts`):**
  - token inheritance and legacy element defaults;
  - six streamed loads without duplicated content;
  - theme control with differing stored and system preferences.
- **Existing specs:** `getByRole("status")` is now filtered to non-empty
  regions. Every Astryx `Button` renders an empty polite live region for its
  loading announcement, which made the unfiltered locator ambiguous. The
  asserted messages are unchanged.
- **`astryx-baseline-visual.spec.ts`:** uses `expect.soft`, so one run
  compares every surface instead of stopping at the first difference.

## Verification

- `pnpm --filter frontend lint`: passed with no warnings.
- `pnpm --filter frontend typecheck`: passed.
- `pnpm check:architecture`: Astryx alignment verified (3 packages at
  0.7.13), 239 source files, 10/10 boundary fixtures.
- `pnpm --filter frontend test`: 38 files, 207 tests passed.
- `pnpm --filter frontend build`: passed, 55 generated pages.
- **Full Playwright suite**, all four widths, excluding the visual baseline:
  - Run on the build before the final one, which differs only by removing an
    unused `ThemeToggle` prop.
  - 207 passed, 25 skipped, 4 failed. The four failures are
    `inquiries.spec.ts:27`, one per project. This is the pre-existing fixture
    defect recorded in `baseline.md`: password login creates an Admin session.
- **Final build, public suites** (public shell, foundation, component lab,
  articles): 107 passed, 13 skipped.
- **Astryx doctor:**
  - `pnpm astryx doctor --built .next`: 12 pass, 0 warn, 0 fail.
  - `--built src/components/navigation`: 12 pass, 1 warn. The purity findings
    are the CSS Module, `className` and raw-element use of the Toranj brand
    and footer composition, which design decision 2 permits.
  - `--built src/components/theme`: the warnings are the custom SVG
    components passed to `Icon`, the documented custom-icon path.

## Visual matrix against the pre-Astryx baseline

Final build, serial run. Each cell gives the changed pixels and, where the
page height changed, the old and new heights.

| Surface | 360 | 390 | 768 | 1280 |
| --- | --- | --- | --- | --- |
| public-home-light | 31395px, h 6599→6520 | 33479px, h 6671→6592 | 1048px | 3305px |
| public-home-dark | 31529px, h 6599→6520 | 33636px, h 6671→6592 | 1092px | 3501px |
| auth-login-light | 16303px | 17213px | 33744px | 13707px |
| auth-login-dark | 13195px | 13844px | 20712px | 13814px |
| inquiry-product-light | 29px | 32px | 80px | 1289px |
| inquiry-product-dark | 3px | 3px | 79px | 1411px |
| customer-inquiry-light | 2618px, h 2589→2593 | 2734px, h 2536→2540 | 4118px, h 2252→2256 | 6241px, h 2126→2130 |
| customer-inquiry-dark | 4001px, h 2589→2593 | 4178px, h 2536→2540 | 6947px, h 2252→2256 | 11190px, h 2126→2130 |
| admin-inquiry-light | 71033px, h 5218→5246 | 76495px, h 5157→5185 | 99803px, h 4243→4267 | 62652px, h 3698→3714 |
| admin-inquiry-dark | 80636px, h 5218→5246 | 86870px, h 5157→5185 | 115737px, h 4243→4267 | 80786px, h 3698→3714 |

Classification:

- **public-home at 768 and 1280:** the header and footer moved to Astryx with
  near-identical appearance. At most 3.5k pixels changed and the height is
  unchanged.
- **public-home at 360 and 390:** the page is 79px shorter. The mobile
  footer link groups are now 44px Collapsible rows instead of padded native
  disclosures.
- **Auth, inquiry, customer and admin surfaces:** the differences come from
  the phase-4 adapters (Astryx `TextInput`, `TextArea`, `Button`) inside
  layouts that have not been migrated. Part of the shift is the corrected
  cascade: the former unlayered `*` reset zeroed Astryx component padding,
  and those components now keep it. These surfaces are re-baselined when
  phases 6–8 migrate them.
