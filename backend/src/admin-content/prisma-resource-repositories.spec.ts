import { describe, expect, it, vi } from 'vitest';
import { PrismaAdminArticleRepository } from './articles/prisma-article.repository.js';
import { PrismaAdminCategoryRepository } from './categories/prisma-category.repository.js';
import { PrismaAdminInjectionServiceRepository } from './injection-services/prisma-injection-service.repository.js';
import { PrismaAdminManagedPageRepository } from './managed-pages/prisma-managed-page.repository.js';
import { PrismaAdminMaterialRepository } from './materials/prisma-material.repository.js';
import { PrismaAdminProductRepository } from './products/prisma-product.repository.js';
import type { AdminContentPrismaClient } from './shared/prisma-repository.js';

type Query = {
  page: number;
  pageSize: number;
  status?: 'DRAFT';
  featured?: boolean;
};
type Input = Record<string, unknown>;
interface TestRepository {
  list(request: Query): Promise<{ items: Input[]; pageInfo: Input }>;
  get(id: string): Promise<Input | null>;
  create(input: Input): Promise<Input>;
  update(id: string, input: Input): Promise<Input | null>;
  setStatus(
    id: string,
    status: 'PUBLISHED' | 'ARCHIVED',
    publishedAt: Date | null,
  ): Promise<Input | null>;
}

const timestamps = {
  publishedAt: null,
  createdAt: new Date('2026-10-01T00:00:00.000Z'),
  updatedAt: new Date('2026-10-02T00:00:00.000Z'),
};

function delegate(row: Input) {
  return {
    count: vi.fn(async () => 1),
    findMany: vi.fn(async () => [row]),
    findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
      where.id === 'missing' ? null : row,
    ),
    create: vi.fn(async ({ data }: { data: Input }) => ({ ...row, ...data })),
    update: vi.fn(
      async ({ where, data }: { where: { id: string }; data: Input }) => {
        if (where.id === 'missing') throw { code: 'P2025' };
        if (where.id === 'conflict') throw { code: 'P2002' };
        return { ...row, ...data };
      },
    ),
  };
}

async function exerciseRepository({
  repository,
  persistence,
  minimalInput,
  fullInput,
  filteredWhere,
}: {
  repository: TestRepository;
  persistence: ReturnType<typeof delegate>;
  minimalInput: Input;
  fullInput: Input;
  filteredWhere: Input;
}) {
  const firstPage = await repository.list({ page: 1, pageSize: 20 });
  expect(firstPage.pageInfo).toMatchObject({
    page: 1,
    pageSize: 20,
    total: 1,
    totalPages: 1,
  });
  expect(persistence.count).toHaveBeenLastCalledWith({ where: {} });
  expect(persistence.findMany).toHaveBeenLastCalledWith(
    expect.objectContaining({ where: {}, skip: 0, take: 20 }),
  );

  await repository.list({
    page: 2,
    pageSize: 10,
    status: 'DRAFT',
    ...filteredWhere,
  });
  expect(persistence.count).toHaveBeenLastCalledWith({
    where: { status: 'DRAFT', ...filteredWhere },
  });
  expect(persistence.findMany).toHaveBeenLastCalledWith(
    expect.objectContaining({ skip: 10, take: 10 }),
  );

  await expect(repository.get('known')).resolves.toMatchObject({
    id: expect.any(String),
  });
  await expect(repository.get('missing')).resolves.toBeNull();

  await repository.create(minimalInput);
  expect(persistence.create).toHaveBeenLastCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ status: 'DRAFT' }),
    }),
  );
  await repository.create(fullInput);
  expect(persistence.create).toHaveBeenLastCalledWith(
    expect.objectContaining({ data: expect.objectContaining(fullInput) }),
  );

  await repository.update('known', {});
  expect(persistence.update).toHaveBeenLastCalledWith(
    expect.objectContaining({ where: { id: 'known' }, data: {} }),
  );
  await repository.update('known', fullInput);
  expect(persistence.update).toHaveBeenLastCalledWith(
    expect.objectContaining({ data: expect.objectContaining(fullInput) }),
  );
  await expect(repository.update('missing', fullInput)).resolves.toBeNull();
  await expect(repository.update('conflict', fullInput)).rejects.toMatchObject({
    code: 'P2002',
  });

  const publishedAt = new Date('2026-10-03T00:00:00.000Z');
  await repository.setStatus('known', 'PUBLISHED', publishedAt);
  expect(persistence.update).toHaveBeenLastCalledWith(
    expect.objectContaining({ data: { status: 'PUBLISHED', publishedAt } }),
  );
  await repository.setStatus('known', 'ARCHIVED', null);
  expect(persistence.update).toHaveBeenLastCalledWith(
    expect.objectContaining({ data: { status: 'ARCHIVED' } }),
  );
}

describe('focused Prisma admin-content repositories', () => {
  it('persists and maps categories through their focused adapter', async () => {
    const row = {
      id: 'category-1',
      name: 'Category',
      slug: 'category',
      description: null,
      image: null,
      displayOrder: 0,
      status: 'DRAFT',
      metaTitle: null,
      metaDescription: null,
      ...timestamps,
    };
    const category = delegate(row);
    const repository = new PrismaAdminCategoryRepository({
      category,
    } as unknown as AdminContentPrismaClient);
    await exerciseRepository({
      repository: repository as unknown as TestRepository,
      persistence: category,
      minimalInput: { name: 'Category', slug: 'category' },
      fullInput: {
        name: 'Renamed',
        slug: 'renamed',
        description: 'Description',
        image: { url: '/category.webp', alt: 'Category' },
        displayOrder: 2,
        metaTitle: 'Meta',
        metaDescription: 'Meta description',
      },
      filteredWhere: {},
    });
  });

  it('persists and maps products through their focused adapter', async () => {
    const row = {
      id: 'product-1',
      name: 'Product',
      slug: 'product',
      summary: null,
      description: null,
      categoryId: null,
      images: [],
      specifications: [],
      featured: false,
      displayOrder: 0,
      status: 'DRAFT',
      metaTitle: null,
      metaDescription: null,
      ...timestamps,
    };
    const product = delegate(row);
    const repository = new PrismaAdminProductRepository({
      product,
    } as unknown as AdminContentPrismaClient);
    await exerciseRepository({
      repository: repository as unknown as TestRepository,
      persistence: product,
      minimalInput: { name: 'Product', slug: 'product' },
      fullInput: {
        name: 'Renamed',
        slug: 'renamed',
        summary: 'Summary',
        description: 'Description',
        categoryId: 'category-1',
        images: [{ url: '/product.webp', alt: 'Product' }],
        specifications: [{ label: 'Key', value: 'Value' }],
        featured: true,
        displayOrder: 2,
        metaTitle: 'Meta',
        metaDescription: 'Meta description',
      },
      filteredWhere: { featured: true },
    });
  });

  it('persists and maps injection services through their focused adapter', async () => {
    const row = {
      id: 'service-1',
      name: 'Service',
      slug: 'service',
      summary: null,
      description: null,
      images: [],
      specifications: [],
      ctaLabel: null,
      ctaHref: null,
      displayOrder: 0,
      status: 'DRAFT',
      metaTitle: null,
      metaDescription: null,
      ...timestamps,
    };
    const injectionService = delegate(row);
    const repository = new PrismaAdminInjectionServiceRepository({
      injectionService,
    } as unknown as AdminContentPrismaClient);
    await exerciseRepository({
      repository: repository as unknown as TestRepository,
      persistence: injectionService,
      minimalInput: { name: 'Service', slug: 'service' },
      fullInput: {
        name: 'Renamed',
        slug: 'renamed',
        summary: 'Summary',
        description: 'Description',
        images: [{ url: '/service.webp', alt: 'Service' }],
        specifications: [{ label: 'Key', value: 'Value' }],
        ctaLabel: 'Contact',
        ctaHref: '/contact',
        displayOrder: 2,
        metaTitle: 'Meta',
        metaDescription: 'Meta description',
      },
      filteredWhere: {},
    });
  });

  it('persists and maps materials through their focused adapter', async () => {
    const row = {
      id: 'material-1',
      name: 'Material',
      slug: 'material',
      family: null,
      grade: null,
      manufacturer: null,
      summary: null,
      description: null,
      images: [],
      specifications: [],
      inquiryAvailable: true,
      displayOrder: 0,
      status: 'DRAFT',
      metaTitle: null,
      metaDescription: null,
      ...timestamps,
    };
    const material = delegate(row);
    const repository = new PrismaAdminMaterialRepository({
      material,
    } as unknown as AdminContentPrismaClient);
    await exerciseRepository({
      repository: repository as unknown as TestRepository,
      persistence: material,
      minimalInput: { name: 'Material', slug: 'material' },
      fullInput: {
        name: 'Renamed',
        slug: 'renamed',
        family: 'PP',
        grade: 'A',
        manufacturer: 'Maker',
        summary: 'Summary',
        description: 'Description',
        images: [{ url: '/material.webp', alt: 'Material' }],
        specifications: [{ label: 'Key', value: 'Value' }],
        inquiryAvailable: false,
        displayOrder: 2,
        metaTitle: 'Meta',
        metaDescription: 'Meta description',
      },
      filteredWhere: {},
    });
  });

  it('persists and maps articles through their focused adapter', async () => {
    const row = {
      id: 'article-1',
      title: 'Article',
      slug: 'article',
      summary: null,
      body: 'Body',
      featuredImage: null,
      displayOrder: 0,
      status: 'DRAFT',
      metaTitle: null,
      metaDescription: null,
      ...timestamps,
    };
    const article = delegate(row);
    const repository = new PrismaAdminArticleRepository({
      article,
    } as unknown as AdminContentPrismaClient);
    await exerciseRepository({
      repository: repository as unknown as TestRepository,
      persistence: article,
      minimalInput: { title: 'Article', slug: 'article', body: 'Body' },
      fullInput: {
        title: 'Renamed',
        slug: 'renamed',
        summary: 'Summary',
        body: 'New body',
        featuredImage: { url: '/article.webp', alt: 'Article' },
        displayOrder: 2,
        metaTitle: 'Meta',
        metaDescription: 'Meta description',
      },
      filteredWhere: {},
    });
  });

  it('persists and maps managed pages through their focused adapter', async () => {
    const row = {
      id: 'page-1',
      title: 'Page',
      slug: 'page',
      summary: null,
      body: 'Body',
      images: [],
      displayOrder: 0,
      status: 'DRAFT',
      metaTitle: null,
      metaDescription: null,
      ...timestamps,
    };
    const managedPage = delegate(row);
    const repository = new PrismaAdminManagedPageRepository({
      managedPage,
    } as unknown as AdminContentPrismaClient);
    await exerciseRepository({
      repository: repository as unknown as TestRepository,
      persistence: managedPage,
      minimalInput: { title: 'Page', slug: 'page', body: 'Body' },
      fullInput: {
        title: 'Renamed',
        slug: 'renamed',
        summary: 'Summary',
        body: 'New body',
        images: [{ url: '/page.webp', alt: 'Page' }],
        displayOrder: 2,
        metaTitle: 'Meta',
        metaDescription: 'Meta description',
      },
      filteredWhere: {},
    });
  });
});
