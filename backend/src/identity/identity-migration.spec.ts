import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(new URL('../../prisma/migrations/20261011100000_secure_identity_foundation/migration.sql', import.meta.url), 'utf8');
const staffMigration = readFileSync(new URL('../../prisma/migrations/20261015100000_staff_access_management/migration.sql', import.meta.url), 'utf8');

describe('identity migration', () => {
  it('is additive and enforces identity boundaries', () => {
    expect(migration).toContain('CREATE UNIQUE INDEX "User_mobile_key"');
    expect(migration).toContain("DEFAULT 'CUSTOMER'");
    expect(migration).toContain('ON DELETE CASCADE');
    expect(migration).not.toMatch(/DROP\s+(TABLE|COLUMN)|TRUNCATE|DELETE\s+FROM/i);
  });
  it('adds staff roles and version without rewriting existing identities', () => {
    expect(staffMigration).toContain("ADD VALUE IF NOT EXISTS 'SALES'");
    expect(staffMigration).toContain("ADD VALUE IF NOT EXISTS 'OPERATOR'");
    expect(staffMigration).toContain('ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0');
    expect(staffMigration).not.toMatch(/DROP\s+(TABLE|COLUMN)|TRUNCATE|DELETE\s+FROM|UPDATE\s+"User"/i);
  });
});
