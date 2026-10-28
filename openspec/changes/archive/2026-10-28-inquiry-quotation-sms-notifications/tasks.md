## 1. Notification Module & SMS Provider Foundation

- [x] 1.1 Create `backend/src/notifications/sms/sms.types.ts` with template identifiers, recipient validation, and provider contracts
- [x] 1.2 Implement `MockSmsProvider` and configurable provider factory in `backend/src/notifications/sms/`
- [x] 1.3 Implement `NotificationService` in `backend/src/notifications/notifications.service.ts` with error-isolated emission
- [x] 1.4 Wire `NotificationsModule` into `backend/src/app.module.ts` and export `NotificationService`

## 2. Inquiry Events Integration

- [x] 2.1 Inject `NotificationService` into `InquiryService` and dispatch `notifyInquiryCreated` to admin on successful submission
- [x] 2.2 Dispatch `notifyInquiryMessage` when a staff member responds to a customer inquiry
- [x] 2.3 Write unit tests in `backend/src/inquiries/inquiry.service.spec.ts` proving notification dispatch and graceful error isolation

## 3. Quotation Events Integration

- [x] 3.1 Inject `NotificationService` into `QuotationService` and dispatch `notifyQuotationIssued` to customer upon transition to `SENT`
- [x] 3.2 Write unit tests in `backend/src/quotations/` proving customer notification on quotation issuance

## 4. Verification & Environment Documentation

- [x] 4.1 Update `.env.example` with SMS configuration keys (`SMS_PROVIDER`, `ADMIN_NOTIFICATION_MOBILE`, etc.)
- [x] 4.2 Run backend unit/integration tests and verify full pass rate
