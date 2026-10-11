import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(new URL('../../prisma/migrations/20261011100000_secure_identity_foundation/migration.sql', import.meta.url), 'utf8');

describe('identity migration', () => {
  it('is additive and enforces identity boundaries', () => {
    expect(migration).toContain('CREATE UNIQUE INDEX "User_mobile_key"');
    expect(migration).toContain("DEFAULT 'CUSTOMER'");
    expect(migration).toContain('ON DELETE CASCADE');
    expect(migration).not.toMatch(/DROP\s+(TABLE|COLUMN)|TRUNCATE|DELETE\s+FROM/i);
  });
});
