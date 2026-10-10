## Why

The current palette and rendered typography feel heavier and less corporate than the desired Toranj identity, and the declared Persian font is not actually loaded so browsers fall back to system fonts. The visual foundation should be revised now, before content and business screens multiply the cost of a later restyle.

## What Changes

- Replace the warm industrial-led presentation with a restrained corporate-minimal system based on neutral surfaces, deep navy text, and a controlled blue accent.
- Load a real Persian webfont through the application instead of relying on an unavailable font name and inconsistent system fallbacks.
- Rebalance typography, spacing, borders, elevation, radii, and interactive states for a lighter, quieter visual hierarchy.
- Apply the revised tokens consistently to navigation, calls to action, cards, feedback states, form controls, footer, and provisional public pages.
- Add repeatable visual and accessibility checks at 360, 390, 768, and 1280 pixels, including font-loading and contrast-sensitive states.
- Preserve the current textual brand mark as provisional; final logo, photography, contact content, commercial claims, ecommerce, payment, inventory, and automatic pricing remain out of scope.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system-core`: Establish the approved corporate-minimal visual direction, require an actually loaded Persian typeface with safe fallbacks, and refine the semantic token contract used by shared components.

## Impact

The change affects frontend design tokens, global font configuration, CSS Modules, shared UI/navigation/feedback components, public-page presentation, component tests, and Playwright visual evidence. It may add a frontend-only font dependency or local font assets. Backend APIs, database schema, route behavior, approved content boundaries, and inquiry workflows are unaffected.
