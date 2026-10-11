import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import type {
  PageResult,
  PublicArticle,
  PublicCategory,
  PublicInjectionService,
  PublicMaterial,
  PublicProduct,
  ProductPageRequest,
} from '../src/content/content.types.js';
import {
  PUBLIC_CONTENT_REPOSITORY,
  type PublicContentRepository,
} from '../src/content/public-content.repository.js';

const publishedProduct: PublicProduct = {
  id: 'product-1',
  name: 'محصول منتشرشده',
  slug: 'published-product',
  summary: 'خلاصه تأییدشده',
  description: null,
  category: null,
  images: [],
  specifications: [],
  featured: true,
  metaTitle: null,
  metaDescription: null,
  publishedAt: '2026-10-10T10:00:00.000Z',
};

function emptyPage<T>(page = 1, pageSize = 12): PageResult<T> {
  return { items: [], pageInfo: { page, pageSize, total: 0, totalPages: 0 } };
}

function fakeRepository(): PublicContentRepository {
  const listProducts = vi.fn(async ({ page, pageSize }: ProductPageRequest) => ({
    items: [publishedProduct],
    pageInfo: { page, pageSize, total: 1, totalPages: 1 },
  }));
  const repository: PublicContentRepository = {
    listCategories: vi.fn(async ({ page, pageSize }) =>
      emptyPage<PublicCategory>(page, pageSize),
    ),
    listProducts,
    findProduct: vi.fn(async (slug) =>
      slug === publishedProduct.slug ? publishedProduct : null,
    ),
    listServices: vi.fn(async ({ page, pageSize }) =>
      emptyPage<PublicInjectionService>(page, pageSize),
    ),
    findService: vi.fn(async () => null),
    listMaterials: vi.fn(async ({ page, pageSize }) =>
      emptyPage<PublicMaterial>(page, pageSize),
    ),
    findMaterial: vi.fn(async () => null),
    listArticles: vi.fn(async ({ page, pageSize }) =>
      emptyPage<PublicArticle>(page, pageSize),
    ),
    findArticle: vi.fn(async () => null),
    findPage: vi.fn(async () => null),
  };
  return Object.assign(repository, { listProductsSpy: listProducts });
}

describe('public content API (e2e)', () => {
  let app: INestApplication<App>;
  let contentRepository: PublicContentRepository;
  let listProductsSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const fake = fakeRepository() as PublicContentRepository & {
      listProductsSpy: ReturnType<typeof vi.fn>;
    };
    contentRepository = fake;
    listProductsSpy = fake.listProductsSpy;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PUBLIC_CONTENT_REPOSITORY)
      .useValue(contentRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, {
      port: 3001,
      frontendOrigin: 'http://localhost:3000',
      auth: { sessionDays: 7, loginLimit: 10, loginWindowSeconds: 900, cookieSecure: false },
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns a bounded product collection with a public cache contract', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/public/content/products?featured=true')
      .expect(200)
      .expect('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

    expect(response.body).toEqual({
      items: [publishedProduct],
      pageInfo: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
    });
    expect(listProductsSpy).toHaveBeenCalledWith({
      page: 1,
      pageSize: 12,
      featured: true,
    });
    expect(response.body.items[0]).not.toHaveProperty('status');
    expect(response.body.items[0]).not.toHaveProperty('price');
    expect(response.body.items[0]).not.toHaveProperty('inventory');
  });

  it('returns empty successful collections for every supported content family', async () => {
    for (const path of ['categories', 'services', 'materials', 'articles']) {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/public/content/${path}`)
        .expect(200);
      expect(response.body).toEqual({
        items: [],
        pageInfo: { page: 1, pageSize: 12, total: 0, totalPages: 0 },
      });
    }
  });

  it('returns published detail and identical 404 policy for hidden or unknown content', async () => {
    const published = await request(app.getHttpServer())
      .get('/api/v1/public/content/products/published-product')
      .expect(200);
    expect(published.body).toEqual(publishedProduct);

    const hidden = await request(app.getHttpServer())
      .get('/api/v1/public/content/products/draft-product')
      .expect(404);
    const unknown = await request(app.getHttpServer())
      .get('/api/v1/public/content/products/unknown-product')
      .expect(404);
    expect(hidden.body).toEqual(unknown.body);
    expect(hidden.body.message).toBe('محتوا یافت نشد.');
  });

  it.each([
    '/api/v1/public/content/products?page=0',
    '/api/v1/public/content/products?pageSize=51',
    '/api/v1/public/content/products?featured=maybe',
    '/api/v1/public/content/products?unknown=true',
  ])('rejects invalid or unbounded query %s', async (path) => {
    await request(app.getHttpServer()).get(path).expect(400);
    expect(listProductsSpy).not.toHaveBeenCalled();
  });

  it('has no public mutation handler and preserves health', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/public/content/products')
      .send({ name: 'نباید ساخته شود' })
      .expect(404);
    await request(app.getHttpServer()).get('/api/v1/health').expect(200);
  });
});
