## MODIFIED Requirements

### Requirement: Managed public pages
The frontend SHALL resolve about, contact, privacy, and terms routes from managed-page slugs and SHALL render their approved title, summary, body, and images as safe presentation content. When published records for `/about` and `/contact` are present, the frontend SHALL render structured industrial presentation sections for plant equipment capacity (machine tonnage range 80T to 450T), quality management standards, direct communication channels (sales, engineering, and administrative lines), verified business hours, and location links without inventing unverified claims. It MUST NOT invent contact details, legal language, certifications, addresses, or company claims when managed content is absent.

#### Scenario: Managed contact page is absent
- **WHEN** the public API returns not found for the contact page
- **THEN** the route SHALL return the shared not-found experience and MUST NOT substitute unapproved phone, email, address, or social information

#### Scenario: Published about page is rendered
- **WHEN** the public API returns the published about page
- **THEN** the page SHALL present the corporate industrial overview, manufacturing equipment tonnage scope, quality control commitment, and direct links to inquiry and contact without inventing unverified certifications

#### Scenario: Published contact page is rendered
- **WHEN** the public API returns the published contact page
- **THEN** the page SHALL present verified official contact channels, business hours, factory and office location information, and an accessible link to the inquiry workflow
