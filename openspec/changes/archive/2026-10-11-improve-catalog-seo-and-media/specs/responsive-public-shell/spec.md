## MODIFIED Requirements

### Requirement: Public-shell indexing boundary
The shell SHALL provide indexable metadata for approved public home, collection, detail, article, and managed-content routes and `noindex` metadata for unapproved placeholders, errors, not-found pages, authentication, account, inquiry, customer portal, and admin surfaces. Metadata MUST NOT be used as an access-control mechanism.

#### Scenario: Approved public route is active
- **WHEN** approved public content and route metadata are available
- **THEN** the page SHALL allow indexing and following and SHALL expose its canonical route

#### Scenario: Placeholder foundation page is active
- **WHEN** a public route remains a placeholder or its content is not approved
- **THEN** the page SHALL remain `noindex` and `nofollow`

#### Scenario: Private surface later adopts shared primitives
- **WHEN** an authentication, account, inquiry, portal, or admin route uses the shared design system
- **THEN** that route SHALL remain `noindex` and protected by server-side authorization independently of UI visibility
