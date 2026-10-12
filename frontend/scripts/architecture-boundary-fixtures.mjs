import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { featureRoot, inspectSources } from './check-architecture.mjs';

const product = `${featureRoot}/product/index.ts`;
const category = `${featureRoot}/category/index.ts`;

describe('admin content architecture boundary checker', () => {
  it('allows feature imports through another feature public entrypoint', () => {
    assert.deepEqual(inspectSources({ [product]: 'export type { Category } from "@/features/admin-content/category";' }), []);
  });

  it('rejects deep imports into another feature', () => {
    assert.match(inspectSources({ [product]: 'import { parse } from "@/features/admin-content/category/parser";' })[0], /deep import/);
  });

  it('rejects frontend imports from backend source', () => {
    assert.match(inspectSources({ [product]: 'import { PrismaService } from "@/../../backend/src/database/prisma.service";' })[0], /backend source/);
  });

  it('rejects feature cycles through public entrypoints', () => {
    const violations = inspectSources({
      [product]: 'export { listCategories } from "@/features/admin-content/category";',
      [category]: 'export { listProducts } from "@/features/admin-content/product";',
    });
    assert.match(violations[0], /feature cycle/);
  });
});
