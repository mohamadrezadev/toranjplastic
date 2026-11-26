# Astryx adoption map

## Reviewed release and discovery commands

- Reviewed release: `0.7.13` for `@astryxdesign/core`, `@astryxdesign/theme-neutral`, and `@astryxdesign/cli`.
- Runtime peer: `@stylexjs/stylex` `0.19.1`, matching Astryx Core's published peer range.
- Local CLI entry point: `pnpm astryx` at repository root, delegated to the frontend-local CLI.
- Verified discovery surfaces: `--version`, `manifest`, `docs`, `component`, `template`, `search`, and `build`.
- Build discovery queries covered the public catalog, authentication, multi-step inquiry, customer portal, and admin content-management surfaces.

The discovery phase did not scaffold production UI. It was used to select public components and identify the composition and adapter work required by Toranj's existing contracts.

## Primitive mapping

| Toranj need | Astryx public component/pattern | Adoption decision |
| --- | --- | --- |
| Primary, secondary, ghost, danger and pending actions | `Button` | Use a typed Toranj adapter. Map Toranj `danger` to Astryx `destructive`; retain application-specific pending labels and action-link semantics. |
| Text input | `TextInput` | Adopt through a typed field adapter that preserves Persian label, help and error relationships. |
| Multiline input | `TextArea` | Adopt through the same field contract. |
| Select | No public component named `Select`; discovery suggested `Selector`, `MultiSelector`, `DropdownMenu`, and `Typeahead` | Documented gap. Keep a semantic native-select adapter for simple single-choice forms; evaluate `Selector` only where its interaction model matches the product. |
| Checkbox | `CheckboxInput` | Adopt with existing form-state and validation ownership. |
| Radio group | `RadioList` | Adopt with RTL ordering and keyboard behavior verified in the component lab. |
| Switch | `Switch` | Use only for immediate boolean settings, not submission choices. |
| Status and inline feedback | `Badge`, `Banner` | Compose Toranj status roles without inventing operational states. |
| Transient feedback | `Toast` | Use only for non-blocking confirmation; errors that require action remain inline. |
| Empty, loading and progress | `EmptyState`, `Skeleton`, `Spinner` | Wrap as shared feedback patterns with factual Persian copy. |
| Breadcrumbs and pagination | `Breadcrumbs`, `Pagination` | Adopt through route-aware Toranj compositions. |
| Modal and responsive layers | `Dialog`, `AlertDialog`, `Drawer`, `BottomSheet` | Choose by task severity and viewport; verify focus trap and focus return. |
| Responsive navigation | `TopNav`, `SideNav`, `MobileNav` | Compose separate public, customer and admin shells; authorization remains server-derived. |
| Responsive collections | `Table`, `List`, `Card`, `Grid` | Use tables for dense desktop data and cards/lists for narrow screens; do not hide required data. |
| App structure and layout | `AppShell`, `Layout`, `Section`, `VStack`, `HStack`, `Grid` | Adopt as layout primitives while route files retain metadata and composition ownership. |
| Type and content | `Text`, `Heading`, `Icon`, `Divider` | Use through the Toranj theme and directional-data helpers. |

## Screen-pattern mapping

| Surface | Closest discovered Astryx pattern | Toranj composition decision |
| --- | --- | --- |
| Public catalog and editorial collections | `library` card-grid template; `documentation` as a secondary reference | Compose a Persian RTL catalog shell from layout/card/navigation primitives. Do not copy template content or introduce commerce behavior. |
| RTL foundation | `InternationalizationProvider03RtlDirection` block | Preserve root `lang="fa"` and `dir="rtl"`; isolate LTR identifiers locally. |
| Login and registration | `login`, `login-card`, `login-split`, plus `FormLayout` blocks | Prefer a compact card composition that preserves noindex/no-store, secure server actions and current role behavior. |
| Inquiry wizard | `form-wizard`, `form-wizard-inline`, `form-wizard-vertical`, `Stepper` | Use an RTL-aware guided form while preserving values, validation, explicit submission and no automatic retry. |
| Customer portal | App shell, list/card, timeline, banner, dialog and form primitives | Compose request details, messages and quotations without changing ownership or pricing contracts. |
| Admin content management | `table-filter`, `Table`, `FormLayoutMixedControls`, `PaginationPageSize` | Recompose within existing feature boundaries. The discovered template is a reference only because it contains StyleX/source assumptions that are outside phase-one policy. |

## Gaps and constraints carried into implementation

- No Astryx `Select` component exists under that exact public name; the adapter decision above is intentional and must remain semantic and keyboard accessible.
- Phase one uses published CSS and public exports only. No Astryx source copy, deep import, generated-class selector, swizzle, or StyleX build plugin is authorized.
- Templates and blocks are references, not product requirements. All Persian copy, CMS data, metadata, security, authorization, request states and backend contracts remain owned by Toranj.
- Existing server-component boundaries remain the default. Client providers are limited to theme/link integration and actual interaction.
- Any future gap that would require swizzling must be documented as a separate reviewed exception before implementation.
