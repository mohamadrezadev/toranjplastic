## ADDED Requirements

### Requirement: Branded authentication screens
Login and registration SHALL use a coherent visual layout with clear form hierarchy, labels, input help, errors, and links between the flows. Branded copy MUST NOT claim verified services or imply that registration grants privileged access.

#### Scenario: Visitor opens registration
- **WHEN** an unauthenticated visitor opens `/auth/register`
- **THEN** the page SHALL explain the customer account purpose, show the existing form fields, and provide a clear route to login

### Requirement: Private, accessible responsive authentication
Authentication pages SHALL stay `noindex` and `no-store`, support keyboard and focus-visible interaction, remain Persian RTL in light and dark themes, and fit 360, 390, 768, and 1280 pixel widths without unintended horizontal scrolling.

#### Scenario: Login shows a failure
- **WHEN** a password login fails
- **THEN** the generic error SHALL remain clearly visible and understandable without color alone, while private information and account status remain undisclosed

