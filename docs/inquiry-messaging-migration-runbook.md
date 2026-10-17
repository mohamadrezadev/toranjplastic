# Inquiry messaging migration runbook

Before deployment, take a verified PostgreSQL backup and record the current migration state. Apply `20261015143000_inquiry_customer_messages` before deploying the frontend. The migration is additive: existing inquiries remain valid with an empty message thread.

For application rollback, deploy the previous backend/frontend and leave the additive table and enum in place so submitted messages are not destroyed. A destructive schema rollback is permitted only after exporting `InquiryMessage`, verifying the backup, stopping all message writers, dropping the two foreign keys and indexes, dropping the table, and finally dropping `InquiryMessageSender`.
