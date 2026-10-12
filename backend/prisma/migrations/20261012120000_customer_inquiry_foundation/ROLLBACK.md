# Customer inquiry foundation rollback

This migration is additive. The preferred application rollback is to deploy the previous frontend/backend and leave the new tables and enums dormant.

Before any destructive rollback, stop inquiry writes and create and verify a PostgreSQL backup containing `Inquiry` and `InquiryStatusHistory`. Export any production inquiry data required by the business. Then, in a controlled maintenance window, drop foreign keys, the two tables, and the four inquiry enums in reverse dependency order.

Never run destructive rollback against development, staging, or production without a verified backup and explicit operator approval.
