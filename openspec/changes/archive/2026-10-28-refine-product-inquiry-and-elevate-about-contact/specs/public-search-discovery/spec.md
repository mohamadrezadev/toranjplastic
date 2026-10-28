## ADDED Requirements

### Requirement: Institutional and contact structured data
The application SHALL provide valid Schema.org JSON-LD structured data on institutional pages to enhance search engine understanding. The `/about` page SHALL emit `AboutPage` and `Organization` / `LocalBusiness` structured data describing company identity, manufacturing scope, and canonical URL. The `/contact` page SHALL emit `ContactPage` and `Organization` structured data with verified `ContactPoint` channels (sales, technical consultation, administration) and business hours.

#### Scenario: About page structured data is parsed
- **WHEN** the published `/about` page is rendered
- **THEN** valid JSON-LD SHALL identify Toranj Plastic as an industrial organization with name, canonical URL, and description without unverified financial or certification claims

#### Scenario: Contact page structured data is parsed
- **WHEN** the published `/contact` page is rendered
- **THEN** valid JSON-LD SHALL identify the ContactPage and provide verified ContactPoint entries with official communication channels and business hours
