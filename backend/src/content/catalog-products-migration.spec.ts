import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('catalog product migration', () => {
  const migration = readFileSync(
    resolve(process.cwd(), 'prisma/migrations/20261011113000_catalog_products/migration.sql'),
    'utf8',
  );

  it('imports the approved catalog set with stable identifiers and images', () => {
    expect(migration.match(/catalog-product-[a-z-]+'/g)).toHaveLength(9);
    expect(migration).toContain('/catalog/all-purpose-liquid-dispenser.webp');
    expect(migration).toContain('/catalog/pedal-bin.webp');
    expect(migration).toContain('ON CONFLICT ("id") DO NOTHING');
  });

  it('does not import contact values or presentation specifications', () => {
    expect(migration).not.toMatch(/09\d{9}|تهران،|تهران،? کهریزک/);
    expect(migration.match(/'\[\]'::jsonb/g)).toHaveLength(9);
  });
});
