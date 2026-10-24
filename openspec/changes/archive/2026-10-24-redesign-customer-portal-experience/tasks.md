## 1. Shared Portal Shell

- [x] 1.1 Add a domain-level customer portal shell with Toranj branding, authenticated account context, responsive navigation, and safe logout.
- [x] 1.2 Integrate the shared shell into account and inquiry layouts while preserving server-side guards, private metadata, no-store reads, and blocking private-route behavior.

## 2. Portal Screens

- [x] 2.1 Redesign the customer overview and inquiry chooser with responsive hierarchy, action cards, and current design-system tokens.
- [x] 2.2 Redesign the owned-request list, filters, empty state, detail summary, submitted-data grid, and status timeline for mobile and desktop.

## 3. Structured Inquiry Forms

- [x] 3.1 Recompose each inquiry form into semantic fieldsets for context, technical details, delivery, and additional notes without changing submitted field names or validation behavior.
- [x] 3.2 Replace obsolete inquiry styles with mobile-first section grids, clear action/feedback states, and current light/dark design tokens.

## 4. Verification

- [x] 4.1 Add focused component tests for portal landmarks/navigation and semantic form grouping.
- [x] 4.2 Run architecture, lint, typecheck, focused frontend tests, and production build; validate the OpenSpec change in strict mode.
- [x] 4.3 Verify automated responsive coverage at 360, 390, 768, and 1280 pixels with no unintended horizontal overflow, documenting the unavailable interactive-browser limitation.
- [x] 4.4 Correct the desktop portal sidebar so it remains fixed on the RTL edge, uses a compact visual treatment, and does not displace or vertically offset route content.
- [x] 4.5 Polish the portal theme with a layered workspace background, cohesive card surfaces, restrained Toranj accents, and equivalent light/dark visual hierarchy.
- [x] 4.6 Rework phone interaction around a fixed bottom navigation, compact top identity bar, persistent form action, safe-area spacing, and automated touch-target/scroll checks at 360 and 390 pixels.
- [x] 4.7 Prove visible mobile actions do not overlap each other before or after submission, including the persistent submit action and bottom navigation boundary.
