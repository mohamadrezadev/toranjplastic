import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { AuditEventWriter } from '../audit/audit.js';
import { ContentStatus } from '../generated/prisma/enums.js';
import { AdminArticleService } from './articles/article.service.js';
import { AdminCategoryService } from './categories/category.service.js';
import { AdminInjectionServiceService } from './injection-services/injection-service.service.js';
import { AdminManagedPageService } from './managed-pages/managed-page.service.js';
import { AdminMaterialService } from './materials/material.service.js';
import { AdminProductService } from './products/product.service.js';
import { isSafeContentImageUrl } from './dto/admin-image.dto.js';
import { pagination } from './shared/prisma-repository.js';
import type { AdminContentUnitOfWork } from './unit-of-work.js';

type Input = Record<string, unknown>;
type Status = (typeof ContentStatus)[keyof typeof ContentStatus];
interface RecordValue extends Input {
  id: string;
  slug: string;
  status: Status;
}
interface TestRepository {
  list(query: Input): Promise<Input>;
  get(id: string): Promise<RecordValue | null>;
  create(input: Input): Promise<RecordValue>;
  update(id: string, input: Input): Promise<RecordValue | null>;
  setStatus(
    id: string,
    status: Status,
    publishedAt: Date | null,
  ): Promise<RecordValue | null>;
}
interface TestService {
  list(query: Input): Promise<Input>;
  get(id: string): Promise<RecordValue>;
  create(dto: Input, actorId: string): Promise<RecordValue>;
  update(id: string, dto: Input, actorId: string): Promise<RecordValue>;
  publish(id: string, actorId: string): Promise<RecordValue>;
  archive(id: string, actorId: string): Promise<RecordValue>;
}

const baseRecord: RecordValue = {
  id: 'resource-1',
  slug: 'resource',
  status: ContentStatus.DRAFT,
  publishedAt: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

function fixture(
  key: string,
  makeService: (
    repository: TestRepository,
    unitOfWork: AdminContentUnitOfWork,
  ) => TestService,
) {
  const get = vi.fn(async (id: string) =>
    id === 'missing' ? null : baseRecord,
  );
  const create = vi.fn(async () => baseRecord);
  const update = vi.fn(async (id: string) =>
    id === 'missing' ? null : baseRecord,
  );
  const repository: TestRepository = {
    list: vi.fn(async () => ({ items: [baseRecord] })),
    get,
    create,
    update,
    setStatus: vi.fn(
      async (_id: string, status: Status, publishedAt: Date | null) => ({
        ...baseRecord,
        status,
        publishedAt: publishedAt?.toISOString() ?? null,
      }),
    ),
  };
  const auditCreate = vi.fn(async () => ({}));
  const audit = {
    securityAuditEvent: { create: auditCreate },
  } as AuditEventWriter;
  const unitOfWork = {
    run: vi.fn(async (work: (context: Input) => Promise<unknown>) =>
      work({ [key]: repository, audit }),
    ),
  } as unknown as AdminContentUnitOfWork;
  return {
    service: makeService(repository, unitOfWork),
    repository,
    get,
    create,
    update,
    auditCreate,
  };
}

const image = { url: '/image.webp', alt: 'Image', width: 800, height: 600 };
const unsafeImage = { url: '//evil.example/image.webp', alt: 'Unsafe' };
const specification = { label: 'Key', value: 'Value' };

const cases: Array<{
  name: string;
  key: string;
  makeService: (
    repository: TestRepository,
    unitOfWork: AdminContentUnitOfWork,
  ) => TestService;
  minimal: Input;
  full: Input;
  unsafe: Input;
  unsafeHref?: Input;
}> = [
  {
    name: 'category',
    key: 'categories',
    makeService: (repository, unitOfWork) =>
      new AdminCategoryService(
        repository as never,
        unitOfWork,
      ) as unknown as TestService,
    minimal: { name: ' Category ', slug: 'category' },
    full: {
      name: ' Category ',
      slug: 'category',
      description: ' Description ',
      image,
      displayOrder: 2,
      metaTitle: ' Meta ',
      metaDescription: ' Meta description ',
    },
    unsafe: { name: 'Category', slug: 'category', image: unsafeImage },
  },
  {
    name: 'product',
    key: 'products',
    makeService: (repository, unitOfWork) =>
      new AdminProductService(
        repository as never,
        unitOfWork,
      ) as unknown as TestService,
    minimal: { name: ' Product ', slug: 'product' },
    full: {
      name: ' Product ',
      slug: 'product',
      summary: ' Summary ',
      description: ' Description ',
      categoryId: 'category-1',
      images: [image],
      specifications: [specification],
      featured: true,
      displayOrder: 2,
      metaTitle: ' Meta ',
      metaDescription: ' Meta description ',
    },
    unsafe: { name: 'Product', slug: 'product', images: [unsafeImage] },
  },
  {
    name: 'injection service',
    key: 'injectionServices',
    makeService: (repository, unitOfWork) =>
      new AdminInjectionServiceService(
        repository as never,
        unitOfWork,
      ) as unknown as TestService,
    minimal: { name: ' Service ', slug: 'service' },
    full: {
      name: ' Service ',
      slug: 'service',
      summary: ' Summary ',
      description: ' Description ',
      images: [image],
      specifications: [specification],
      ctaLabel: ' Contact ',
      ctaHref: '/contact',
      displayOrder: 2,
      metaTitle: ' Meta ',
      metaDescription: ' Meta description ',
    },
    unsafe: { name: 'Service', slug: 'service', images: [unsafeImage] },
    unsafeHref: { name: 'Service', slug: 'service', ctaHref: '//evil.example' },
  },
  {
    name: 'material',
    key: 'materials',
    makeService: (repository, unitOfWork) =>
      new AdminMaterialService(
        repository as never,
        unitOfWork,
      ) as unknown as TestService,
    minimal: { name: ' Material ', slug: 'material' },
    full: {
      name: ' Material ',
      slug: 'material',
      family: ' PP ',
      grade: ' A ',
      manufacturer: ' Maker ',
      summary: ' Summary ',
      description: ' Description ',
      images: [image],
      specifications: [specification],
      inquiryAvailable: false,
      displayOrder: 2,
      metaTitle: ' Meta ',
      metaDescription: ' Meta description ',
    },
    unsafe: { name: 'Material', slug: 'material', images: [unsafeImage] },
  },
  {
    name: 'article',
    key: 'articles',
    makeService: (repository, unitOfWork) =>
      new AdminArticleService(
        repository as never,
        unitOfWork,
      ) as unknown as TestService,
    minimal: { title: ' Article ', slug: 'article', body: 'Body' },
    full: {
      title: ' Article ',
      slug: 'article',
      summary: ' Summary ',
      body: 'Body',
      featuredImage: image,
      displayOrder: 2,
      metaTitle: ' Meta ',
      metaDescription: ' Meta description ',
    },
    unsafe: {
      title: 'Article',
      slug: 'article',
      body: 'Body',
      featuredImage: unsafeImage,
    },
  },
  {
    name: 'managed page',
    key: 'managedPages',
    makeService: (repository, unitOfWork) =>
      new AdminManagedPageService(
        repository as never,
        unitOfWork,
      ) as unknown as TestService,
    minimal: { title: ' Page ', slug: 'page', body: 'Body' },
    full: {
      title: ' Page ',
      slug: 'page',
      summary: ' Summary ',
      body: 'Body',
      images: [image],
      displayOrder: 2,
      metaTitle: ' Meta ',
      metaDescription: ' Meta description ',
    },
    unsafe: {
      title: 'Page',
      slug: 'page',
      body: 'Body',
      images: [unsafeImage],
    },
  },
];

describe.each(cases)(
  '$name focused service contract',
  ({ key, makeService, minimal, full, unsafe, unsafeHref }) => {
    it('covers list, detail, create, update, lifecycle, validation, and missing records', async () => {
      const { service, create, update, get, auditCreate } = fixture(
        key,
        makeService,
      );

      await expect(service.list({ page: 1, pageSize: 20 })).resolves.toEqual({
        items: [baseRecord],
      });
      await expect(service.get(baseRecord.id)).resolves.toBe(baseRecord);
      await expect(service.get('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      await expect(service.create(minimal, 'admin-1')).resolves.toBe(
        baseRecord,
      );
      await expect(service.create(full, 'admin-1')).resolves.toBe(baseRecord);
      expect(create).toHaveBeenLastCalledWith(
        expect.objectContaining({ slug: full.slug }),
      );

      await expect(service.update(baseRecord.id, {}, 'admin-1')).resolves.toBe(
        baseRecord,
      );
      expect(update).toHaveBeenLastCalledWith(baseRecord.id, {});
      await expect(
        service.update(baseRecord.id, full, 'admin-1'),
      ).resolves.toBe(baseRecord);
      const blankUpdate: Input = {
        ...full,
        description: ' ',
        summary: ' ',
        family: ' ',
        grade: ' ',
        manufacturer: ' ',
        ctaLabel: ' ',
        metaTitle: ' ',
        metaDescription: ' ',
        ...(full.image ? { image: { url: '/image.webp', alt: 'Image' } } : {}),
        ...(full.featuredImage
          ? { featuredImage: { url: '/image.webp', alt: 'Image' } }
          : {}),
        ...(full.images
          ? { images: [{ url: '/image.webp', alt: 'Image' }] }
          : {}),
      };
      await expect(
        service.update(baseRecord.id, blankUpdate, 'admin-1'),
      ).resolves.toBe(baseRecord);
      await expect(
        service.update('missing', full, 'admin-1'),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(() => service.create(unsafe, 'admin-1')).toThrow(
        BadRequestException,
      );
      if (unsafeHref)
        expect(() => service.create(unsafeHref, 'admin-1')).toThrow(
          BadRequestException,
        );

      await expect(
        service.publish(baseRecord.id, 'admin-1'),
      ).resolves.toMatchObject({ status: ContentStatus.PUBLISHED });
      await expect(
        service.archive(baseRecord.id, 'admin-1'),
      ).resolves.toMatchObject({ status: ContentStatus.ARCHIVED });

      get.mockResolvedValueOnce({
        ...baseRecord,
        status: ContentStatus.PUBLISHED,
      });
      await service.publish(baseRecord.id, 'admin-1');
      get.mockResolvedValueOnce({
        ...baseRecord,
        status: ContentStatus.ARCHIVED,
      });
      await service.archive(baseRecord.id, 'admin-1');

      expect(auditCreate).toHaveBeenCalled();
    });
  },
);

describe('admin-content shared branch contracts', () => {
  it('accepts both HTTP protocols, rejects other protocols, and handles empty pagination', () => {
    expect(isSafeContentImageUrl('https://cdn.example/image.webp')).toBe(true);
    expect(isSafeContentImageUrl('http://cdn.example/image.webp')).toBe(true);
    expect(isSafeContentImageUrl('ftp://cdn.example/image.webp')).toBe(false);
    expect(
      pagination([], { page: 1, pageSize: 20 }, 0).pageInfo.totalPages,
    ).toBe(0);
  });
});
