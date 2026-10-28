# sms-notifications Specification

## Purpose
TBD - created by archiving change inquiry-quotation-sms-notifications. Update Purpose after archive.
## Requirements
### Requirement: Provider-neutral SMS transmission
The notification module SHALL provide a provider-neutral interface for sending transactional SMS notifications using approved message templates. It SHALL support configurable providers including a development/test MockProvider and production gateway adapters.

#### Scenario: Transactional SMS sent successfully
- **WHEN** a valid notification request is dispatched with recipient phone number, template name, and approved parameters
- **THEN** the active SMS provider SHALL transmit the message and return a success receipt

#### Scenario: SMS transmission fails without breaking caller
- **WHEN** the SMS provider encounters a network error, invalid gateway credentials, or upstream failure
- **THEN** the notification module SHALL log an error without throwing an unhandled exception or rolling back the business transaction

### Requirement: Privacy and rate limiting
The notification module SHALL sanitize log outputs to avoid logging sensitive data, PII, or raw passwords. It SHALL validate Persian mobile number format (+98 or 09) before transmission.

#### Scenario: Invalid phone number format
- **WHEN** an inquiry or account has an unparseable or invalid mobile format
- **THEN** the notification module SHALL reject transmission gracefully and log a validation warning

