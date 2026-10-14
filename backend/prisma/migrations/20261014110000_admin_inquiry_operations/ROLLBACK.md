# Admin inquiry operations rollback

This migration is additive. The normal application rollback is to deploy the previous frontend and backend while leaving `Inquiry.version`, `Inquiry.assignedAdminId`, `InquiryInternalNote`, and `InquiryAssignmentHistory` dormant.

Before destructive rollback, stop all inquiry writes and create and verify a PostgreSQL backup that includes `Inquiry`, `InquiryStatusHistory`, `InquiryInternalNote`, `InquiryAssignmentHistory`, and `SecurityAuditEvent`. Export operational history required by the business. In a controlled maintenance window, remove the new foreign keys and indexes, drop the two new history tables, and only then remove the two new `Inquiry` columns.

Never execute destructive rollback in development, staging, or production without a verified backup and explicit operator approval. Deploy order is migration, backend, then frontend; application rollback order is frontend, backend, while retaining the additive schema.
