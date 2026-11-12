## Why

Toranj Plastic already has the required product flows, but its UI primitives and screen-level styling have grown independently across public, authentication, customer, inquiry, and admin surfaces. Adopting Astryx as the shared component foundation, together with its agent-oriented CLI and documentation workflow, provides a consistent accessible system for rebuilding the interface while retaining the approved Persian RTL identity and product constraints.

## What Changes

- Add Astryx Core, a matching Astryx theme package, and the project-local Astryx CLI at one pinned version in the frontend workspace.
- Initialize Astryx's project guidance so human contributors and coding agents use the same template-first, component-doc, doctor, and upgrade workflow without replacing this repository's higher-priority OpenSpec and security rules.
- Create a Toranj Astryx theme that maps the existing petroleum-and-stone semantic roles, Vazirmatn typography, light/dark behavior, focus treatment, spacing, and responsive expectations onto supported Astryx theme targets.
- Rebuild shared primitives and reusable patterns on supported Astryx components, then migrate public, auth, inquiry, customer portal, and admin screens in bounded phases while preserving their existing routes, data contracts, authorization, cache, indexing, and content rules.
- Add component examples and automated accessibility, Persian RTL, interaction, responsive, and visual-regression checks for the adopted component set and required viewports.
- Retain Toranj-owned domain components where they express product behavior; use Astryx composition rather than copying upstream internals, and allow swizzling only through an explicit recorded exception.
- Keep all existing non-commerce constraints: no cart, checkout, online payment, automatic pricing, live inventory, or fabricated business claims.

## Capabilities

### New Capabilities

- `astryx-ui-integration`: Defines the supported Astryx dependency, agent workflow, theme boundary, component adoption rules, verification gates, and upgrade discipline for the Toranj frontend.

### Modified Capabilities

- `design-system-core`: Changes the shared component foundation from Toranj-only primitives to a Toranj-themed Astryx foundation while preserving semantic tokens, Persian RTL behavior, accessibility states, and layered ownership.

## Impact

- `frontend/package.json` and the workspace lockfile gain version-aligned Astryx packages and a deterministic local CLI command.
- Root agent guidance gains an Astryx-managed section whose authority remains below the repository contract, OpenSpec artifacts, and Toranj product/security rules.
- `frontend/src/app`, `frontend/src/design-system`, `frontend/src/components`, and UI-facing feature modules are migrated in phases; backend endpoints, DTOs, Prisma schema, role enforcement, ownership rules, and CMS contracts are not changed.
- CSS imports/layers, root providers, theme bootstrap behavior, component tests, Playwright coverage, and architecture checks are updated.
- Existing internal primitive APIs may need compatibility adapters during migration, but route URLs and user-visible product behavior remain compatible.
