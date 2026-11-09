## ADDED Requirements

### Requirement: Bounded public-read failure transition
Public read-only content routes SHALL terminate loading and render privacy-safe Persian error feedback when the upstream request times out, cannot connect, returns an invalid payload, or responds with a server error. A retry SHALL be offered only for an idempotent read and MUST NOT expose internal service URLs, database state, stack traces, tokens, or private data.

#### Scenario: Public collection request returns a server error
- **WHEN** a products, services, materials, articles, or managed-page read returns a 5xx response
- **THEN** the loading presentation SHALL end and the route SHALL show the shared page-level ErrorState with a safe Persian explanation and read-only retry action

#### Scenario: Public collection response is invalid
- **WHEN** the upstream response cannot be parsed or fails the public DTO validator
- **THEN** the route SHALL show the same non-disclosing error contract and MUST NOT render partial unvalidated content

#### Scenario: Visitor retries a failed read
- **WHEN** the visitor activates the retry action after a recoverable public read failure
- **THEN** the application SHALL perform a new idempotent read, expose a bounded busy state, and render content on success without duplicating a mutation

#### Scenario: Public read remains pending
- **WHEN** a public read exceeds the expected waiting duration
- **THEN** the interface SHALL retain a stable `aria-busy` region with a meaningful Persian label and SHALL transition to recoverable error feedback when the configured request boundary is exceeded
