import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  adminMediaRoot,
  featureRoot,
  inspectBuildConfiguration,
  inspectSources,
  inspectStyles,
  sourceRoot,
  uiRoot,
} from './check-architecture.mjs';

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

  it('allows only the public admin-media entrypoint outside that feature', () => {
    const route = `${sourceRoot}/app/admin/media/page.tsx`;
    assert.deepEqual(inspectSources({ [route]: 'import { listMedia } from "@/features/admin-media";' }), []);
    assert.match(inspectSources({
      [route]: 'import { listMedia } from "@/features/admin-media/api";',
      [`${adminMediaRoot}/index.ts`]: '',
    })[0], /admin-media feature deep import/);
  });
});

describe('Astryx adoption boundaries', () => {
  const adapter = `${uiRoot}/Button.tsx`;

  it('allows public Astryx package exports', () => {
    assert.deepEqual(inspectSources({ [adapter]: 'import { Button } from "@astryxdesign/core/Button";' }), []);
  });

  it('rejects Astryx source, dist, internal and runtime-theme source imports', () => {
    assert.match(inspectSources({ [adapter]: 'import { x } from "@astryxdesign/core/src/Button";' })[0], /source\/deep import/);
    assert.match(inspectSources({ [adapter]: 'import { x } from "@astryxdesign/core/internal/touch";' })[0], /source\/deep import/);
    assert.match(inspectSources({ [adapter]: 'import { neutralTheme } from "@astryxdesign/theme-neutral";' })[0], /runtime theme source/);
  });

  it('rejects product logic in UI primitive adapters', () => {
    assert.match(inspectSources({ [adapter]: 'import { createInquiry } from "@/lib/inquiries";' })[0], /product logic/);
  });

  it('rejects direct StyleX imports and generated class selectors', () => {
    assert.match(inspectSources({ [adapter]: 'import stylex from "@stylexjs/stylex";' })[0], /direct StyleX/);
    assert.match(inspectStyles({ [`${uiRoot}/Button.module.css`]: '.x1abcde { color: red; }' })[0], /generated Astryx\/StyleX class/);
  });

  it('rejects an unauthorized StyleX build plugin', () => {
    assert.match(inspectBuildConfiguration({ [`${sourceRoot}/../next.config.ts`]: 'import stylexPlugin from "@stylexjs/nextjs-plugin";' })[0], /build plugin/);
  });
});
