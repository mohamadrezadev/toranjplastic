import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('customer inquiry migration', () => {
  const migration = readFileSync(
    resolve(process.cwd(), 'prisma/migrations/20261012120000_customer_inquiry_foundation/migration.sql'),
    'utf8',
  );

  it('creates the inquiry aggregate and full approved status vocabulary', () => {
    expect(migration).toContain('CREATE TABLE "Inquiry"');
    expect(migration).toContain('CREATE TABLE "InquiryStatusHistory"');
    for (const status of ['SUBMITTED', 'UNDER_REVIEW', 'NEED_MORE_INFO', 'QUOTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED']) {
      expect(migration).toContain(`'${status}'`);
    }
  });

  it('indexes ownership and history and remains additive', () => {
    expect(migration).toContain('"Inquiry_ownerId_status_createdAt_idx"');
    expect(migration).toContain('"InquiryStatusHistory_inquiryId_createdAt_idx"');
    expect(migration).toContain('FOREIGN KEY ("ownerId")');
    expect(migration).not.toMatch(/^\s*(DROP|TRUNCATE|DELETE|UPDATE|INSERT)\b/im);
  });
});

describe('admin inquiry operations migration', () => {
  const migration = readFileSync(
    resolve(process.cwd(), 'prisma/migrations/20261014110000_admin_inquiry_operations/migration.sql'),
    'utf8',
  );

  it('adds versioning, assignment and append-only operational history', () => {
    expect(migration).toContain('ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0');
    expect(migration).toContain('ADD COLUMN "assignedAdminId" TEXT');
    expect(migration).toContain('CREATE TABLE "InquiryInternalNote"');
    expect(migration).toContain('CREATE TABLE "InquiryAssignmentHistory"');
  });

  it('adds operational indexes and contains no destructive or data-rewrite statement', () => {
    expect(migration).toContain('"Inquiry_status_createdAt_idx"');
    expect(migration).toContain('"Inquiry_assignedAdminId_status_createdAt_idx"');
    expect(migration).not.toMatch(/^\s*(DROP|TRUNCATE|DELETE|UPDATE|INSERT)\b/im);
  });
});

describe('inquiry customer messaging migration', () => {
  const migration = readFileSync(
    resolve(process.cwd(), 'prisma/migrations/20261015143000_inquiry_customer_messages/migration.sql'),
    'utf8',
  );

  it('creates a separate append-only message table and sender enum', () => {
    expect(migration).toContain('CREATE TYPE "InquiryMessageSender"');
    expect(migration).toContain('CREATE TABLE "InquiryMessage"');
    expect(migration).toContain('"InquiryMessage_inquiryId_createdAt_id_idx"');
    expect(migration).not.toContain('InquiryInternalNote" ADD');
  });

  it('is additive and links messages to inquiry and author', () => {
    expect(migration).toContain('REFERENCES "Inquiry"("id") ON DELETE CASCADE');
    expect(migration).toContain('REFERENCES "User"("id") ON DELETE RESTRICT');
    expect(migration).not.toMatch(/^\s*(DROP|TRUNCATE|DELETE|UPDATE|INSERT)\b/im);
  });
});
