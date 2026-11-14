## MODIFIED Requirements

### Requirement: Managed public pages
The frontend SHALL resolve about, contact, privacy, and terms routes from managed-page slugs and SHALL render their approved title, summary, body, and images as safe presentation content. When published records for `/about` and `/contact` are present, the frontend SHALL render structured industrial presentation sections for plant equipment capacity (machine tonnage range 80T to 450T), quality management standards, direct communication channels (sales, engineering, and administrative lines), verified business hours, and location links without inventing unverified claims; the quality management standards, the quality control commitment, and location links apply only once approved content or a verified location URL exists, and until then those sections SHALL be omitted rather than invented. It MUST NOT invent contact details, legal language, certifications, addresses, or company claims when managed content is absent.

#### Scenario: Managed contact page is absent
- **WHEN** the public API returns not found for the contact page
- **THEN** the route SHALL return the shared not-found experience and MUST NOT substitute unapproved phone, email, address, or social information

#### Scenario: Published about page is rendered
- **WHEN** the public API returns the published about page
- **THEN** the page SHALL present the corporate industrial overview, manufacturing equipment tonnage scope, direct links to inquiry and contact, and, only when approved content exists, the quality control commitment, without inventing unverified certifications

#### Scenario: Published contact page is rendered
- **WHEN** the public API returns the published contact page
- **THEN** the page SHALL present verified official contact channels, business hours, factory and office location information as text, a location link only when a verified location URL exists, and an accessible link to the inquiry workflow

## ADDED Requirements

### Requirement: Unmatched public URLs
The frontend SHALL answer a URL that matches no route with the shared Persian not-found experience inside the public header and footer, with a 404 status and `noindex` metadata.

#### Scenario: Unmatched URL is requested
- **WHEN** a visitor requests a path that matches no public route
- **THEN** the response SHALL have status 404, a Persian level-one heading, the public header and footer, and a `noindex` robots directive
