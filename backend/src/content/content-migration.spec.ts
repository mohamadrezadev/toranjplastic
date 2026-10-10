import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('content foundation migration', () => {
  const migration = readFileSync(
    resolve(
      process.cwd(),
      'prisma/migrations/20261010143000_content_read_foundation/migration.sql',
    ),
    'utf8',
  );

  it('creates all content families without destructive or seeded SQL', () => {
    for (const table of [
      'Category',
      'Product',
      'InjectionService',
      'Material',
      'Article',
      'ManagedPage',
    ]) {
      expect(migration).toContain(`CREATE TABLE "${table}"`);
    }
    expect(migration).not.toMatch(/^\s*(DROP|TRUNCATE|DELETE|UPDATE|INSERT)\b/im);
  });
});
