## ADDED Requirements

### Requirement: Reproducible Astryx dependency set
The frontend SHALL consume only published stable Astryx packages needed by Toranj, and `@astryxdesign/core`, the selected Astryx theme, and `@astryxdesign/cli` MUST use one identical exact version recorded in the lockfile. The repository SHALL expose a project-local CLI command that does not depend on a globally installed Astryx executable.

#### Scenario: Contributor invokes Astryx tooling
- **WHEN** a contributor or coding agent runs the repository's Astryx command after a clean dependency install
- **THEN** the command SHALL execute the lockfile-pinned CLI and report the same package version used by Core and the selected theme

#### Scenario: Astryx packages are upgraded
- **WHEN** the project upgrades any published Astryx package
- **THEN** all installed `@astryxdesign/*` packages SHALL be reviewed for version alignment and the supported upgrade workflow, diagnostics, tests, and production build SHALL pass before delivery

### Requirement: Authoritative agent workflow integration
The repository SHALL initialize and maintain Astryx's project guidance for supported coding agents while preserving the Toranj repository contract and OpenSpec artifacts as higher authority. Astryx guidance MUST NOT weaken Persian RTL, security, privacy, architecture, verified-content, or non-commerce rules.

#### Scenario: Astryx initialization updates agent guidance
- **WHEN** `astryx init` creates or refreshes a marked guidance block
- **THEN** the resulting diff SHALL be reviewed and SHALL retain the complete Toranj contract, its source-of-truth order, and its spec-driven lifecycle

#### Scenario: Generated guidance conflicts with a Toranj rule
- **WHEN** an Astryx instruction or generated example conflicts with an approved Toranj spec, ADR, security boundary, or product rule
- **THEN** the Toranj authority SHALL win and the conflicting example MUST NOT be implemented

### Requirement: Template-first component discovery
Each migrated screen SHALL use the project-local Astryx build, search, component, docs, and template discovery surfaces before composition. Implementations SHALL use documented public imports and SHALL reconcile any returned template or example with current Toranj specs and real approved data.

#### Scenario: A screen migration begins
- **WHEN** an implementer starts a public, auth, customer, inquiry, or admin screen migration
- **THEN** the implementation evidence SHALL identify the Astryx template, pattern, or documented components evaluated and explain any Toranj-owned composition used for gaps

#### Scenario: A template contains unsupported product behavior
- **WHEN** an Astryx template includes commerce, automatic pricing, sample metrics, unverified claims, or behavior outside the relevant Toranj spec
- **THEN** that content or behavior SHALL be removed rather than copied, and the screen SHALL use only approved API data or a factual empty fallback

### Requirement: Toranj theme and document integration
Astryx components SHALL render through a Toranj-owned theme mapping that preserves the approved semantic petroleum-and-stone roles, bundled Vazirmatn typography, light/dark preference, visible focus, reduced motion, and Persian document direction. The root document MUST remain `lang="fa"` and `dir="rtl"`, and LTR identifiers MUST remain locally isolated.

#### Scenario: Astryx component renders in either theme
- **WHEN** an adopted component is rendered in light or dark mode
- **THEN** its text, surfaces, borders, actions, statuses, focus, and disabled states SHALL use mapped semantic roles with readable contrast and without introducing an unrelated default brand identity

#### Scenario: Direction-sensitive component is used in Persian
- **WHEN** navigation, pagination, a layer, a selection control, or another directional component is rendered under the Persian root
- **THEN** layout, directional icons, keyboard behavior, focus order, and open/close placement SHALL follow RTL semantics while local phone, email, URL, code, and identifier values remain bidi-isolated LTR

### Requirement: Public component boundary and swizzle control
Toranj screens and feature modules SHALL consume shared Toranj entry points or documented Astryx public exports and MUST NOT import Astryx source internals. Swizzled source MUST NOT enter the repository unless a recorded exception proves that a current spec-backed requirement cannot be met through composition, theme targets, documented props, or supported style extension points.

#### Scenario: Astryx component needs customization
- **WHEN** a component's default presentation does not match Toranj's theme
- **THEN** the implementation SHALL first use supported theme variables, theme targets, composition, or public style props and SHALL retain upstream ownership

#### Scenario: Swizzle is proposed
- **WHEN** public extension mechanisms cannot satisfy a required behavior
- **THEN** the exception SHALL record the requirement, upstream version, copied files, Toranj owner, tests, divergence risk, and upgrade plan before the source is copied

### Requirement: Phased surface migration without contract drift
The UI SHALL be migrated in bounded, coherent surfaces and MUST preserve route URLs, server/client data boundaries, backend-derived capabilities, ownership checks, private `noindex` and `no-store` behavior, failure semantics, and approved content. A user flow MUST NOT ship with an incoherent mixture of legacy and Astryx visual systems.

#### Scenario: Private surface is migrated
- **WHEN** an account, inquiry, quotation, messaging, media, staff, or admin surface adopts Astryx components
- **THEN** its existing server authorization, resource ownership, cache, indexing, data-redaction, and explicit failure-state requirements SHALL continue to pass without relying on hidden UI as enforcement

#### Scenario: Migration phase is incomplete
- **WHEN** a bounded screen or user flow has not met its RTL, theme, interaction, responsive, and regression criteria
- **THEN** that phase SHALL remain undistributed or be rolled back as a unit while completed unaffected surfaces continue to operate

### Requirement: Astryx verification gates
Every adopted component set and migrated surface SHALL be verified with typed builds, architecture checks, component semantics, keyboard behavior, automated accessibility checks, Persian RTL behavior, light/dark themes, and responsive layouts at 360, 390, 768, and 1280 pixels. Delivery SHALL also run Astryx diagnostics against the project and completed build when supported by the installed CLI.

#### Scenario: Representative component set is accepted
- **WHEN** actions, fields, selection, feedback, navigation, modal/layer, pagination, or data-display components are adopted
- **THEN** tests SHALL cover accessible names, focus, keyboard activation, loading, disabled, help/error relationships, direction-sensitive behavior, and no unintended horizontal page scrolling

#### Scenario: Completed frontend build is delivered
- **WHEN** all migration tasks are ready for delivery
- **THEN** lint, typecheck, unit tests, architecture tests, applicable E2E tests, production build, visual verification, and supported Astryx doctor checks SHALL pass with no unresolved critical accessibility, RTL, hydration, or dependency-version finding
