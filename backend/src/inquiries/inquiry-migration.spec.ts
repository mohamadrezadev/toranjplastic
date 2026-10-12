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
