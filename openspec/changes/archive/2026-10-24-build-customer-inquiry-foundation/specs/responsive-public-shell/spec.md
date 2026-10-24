## ADDED Requirements

### Requirement: Inquiry and account actions use the authenticated customer flow
The public shell's commercial inquiry actions SHALL link to the implemented inquiry selection flow, and the account action SHALL lead to the private customer portal for authenticated accounts or the existing login flow for unauthenticated visitors. These destinations MUST NOT imply checkout, confirmed availability, automatic pricing, or a public account surface.

#### Scenario: Visitor activates an inquiry action
- **WHEN** a visitor activates a public «استعلام قیمت» or eligible catalog inquiry action
- **THEN** the application SHALL route through authentication as needed and continue to the private inquiry flow without exposing private content publicly

#### Scenario: Authenticated customer activates the account action
- **WHEN** an authenticated customer follows the account destination
- **THEN** the application SHALL show the private `noindex` and `no-store` customer portal rather than a provisional page
