import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ContentService } from './content.service.js';
import type {
  PageResult,
  PublicArticle,
  PublicCategory,
  PublicInjectionService,
  PublicMaterial,
  PublicProduct,
} from './content.types.js';
import type { PublicContentRepository } from './public-content.repository.js';

function repository(overrides: Partial<PublicContentRepository> = {}): PublicContentRepository {
  const empty = <T>(): PageResult<T> => ({
    items: [],
    pageInfo: { page: 1, pageSize: 12, total: 0, totalPages: 0 },
  });
  return {
    listCategories: vi.fn(async () => empty<PublicCategory>()),
    listProducts: vi.fn(async () => empty<PublicProduct>()),
    findProduct: vi.fn(async () => null),
    listServices: vi.fn(async () => empty<PublicInjectionService>()),
    findService: vi.fn(async () => null),
    listMaterials: vi.fn(async () => empty<PublicMaterial>()),
    findMaterial: vi.fn(async () => null),
    listArticles: vi.fn(async () => empty<PublicArticle>()),
    findArticle: vi.fn(async () => null),
    findPage: vi.fn(async () => null),
    ...overrides,
  };
}

describe('ContentService', () => {
  it('delegates bounded pagination to the public repository', async () => {
    const listProducts = vi.fn<PublicContentRepository['listProducts']>(async () =>
      ({ items: [], pageInfo: { page: 2, pageSize: 12, total: 0, totalPages: 0 } }),
    );
    const contentRepository = repository({ listProducts });
    const service = new ContentService(contentRepository);
    await service.listProducts({ page: 2, pageSize: 12, featured: true });
    expect(listProducts).toHaveBeenCalledWith({
      page: 2,
      pageSize: 12,
      featured: true,
    });
  });

  it.each([
    ['product', (service: ContentService) => service.getProduct({ slug: 'hidden' })],
    ['service', (service: ContentService) => service.getService({ slug: 'hidden' })],
    ['material', (service: ContentService) => service.getMaterial({ slug: 'hidden' })],
    ['article', (service: ContentService) => service.getArticle({ slug: 'hidden' })],
    ['page', (service: ContentService) => service.getPage({ slug: 'hidden' })],
  ])('returns the same not-found policy for a missing or hidden %s', async (_type, action) => {
    const service = new ContentService(repository());
    await expect(action(service)).rejects.toEqual(
      new NotFoundException('محتوا یافت نشد.'),
    );
  });
});
