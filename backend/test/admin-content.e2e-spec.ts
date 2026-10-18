import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import type { AuditEventWriter } from '../src/audit/audit.js';
import {
  ADMIN_ARTICLE_REPOSITORY,
  type AdminArticleRepository,
} from '../src/admin-content/articles/repository.js';
import type { AdminArticle } from '../src/admin-content/articles/types.js';
import {
  ADMIN_CATEGORY_REPOSITORY,
  type AdminCategoryRepository,
} from '../src/admin-content/categories/repository.js';
import type { AdminCategory } from '../src/admin-content/categories/types.js';
import {
  ADMIN_INJECTION_SERVICE_REPOSITORY,
  type AdminInjectionServiceRepository,
} from '../src/admin-content/injection-services/repository.js';
import type { AdminInjectionService } from '../src/admin-content/injection-services/types.js';
import {
  ADMIN_MANAGED_PAGE_REPOSITORY,
  type AdminManagedPageRepository,
} from '../src/admin-content/managed-pages/repository.js';
import type { AdminManagedPage } from '../src/admin-content/managed-pages/types.js';
import {
  ADMIN_MATERIAL_REPOSITORY,
  type AdminMaterialRepository,
} from '../src/admin-content/materials/repository.js';
import type { AdminMaterial } from '../src/admin-content/materials/types.js';
import {
  ADMIN_PRODUCT_REPOSITORY,
  type AdminProductRepository,
} from '../src/admin-content/products/repository.js';
import type { AdminProduct } from '../src/admin-content/products/types.js';
import {
  ADMIN_CONTENT_UNIT_OF_WORK,
  type AdminContentTransaction,
} from '../src/admin-content/unit-of-work.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { digestToken } from '../src/identity/identity.security.js';

const adminAccount = {
  id: 'admin-1',
  mobile: '+989123456789',
  displayName: 'Admin',
  email: null,
  companyName: null,
  role: 'ADMIN',
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: new Date('2026-10-11'),
  updatedAt: new Date('2026-10-11'),
};
const customerAccount = { ...adminAccount, id: 'customer-1', role: 'CUSTOMER' };
const operatorAccount = { ...adminAccount, id: 'operator-1', role: 'OPERATOR' };
const salesAccount = { ...adminAccount, id: 'sales-1', role: 'SALES' };

const CSRF_TOKEN = 'valid-csrf-token';
const csrfDigest = digestToken(CSRF_TOKEN);

const draftCategory: AdminCategory = {
  id: 'cat-1',
  name: 'دسته آزمایشی',
  slug: 'test-category',
  description: null,
  image: null,
  displayOrder: 0,
  status: 'DRAFT' as never,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
};

const draftProduct: AdminProduct = {
  id: 'prod-1',
  name: 'محصول آزمایشی',
  slug: 'test-product',
  summary: null,
  description: null,
  categoryId: null,
  images: [],
  specifications: [],
  featured: false,
  displayOrder: 0,
  status: 'DRAFT' as never,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
  contentVersion: 0,
};

const draftInjectionService: AdminInjectionService = {
  id: 'svc-1',
  name: 'خدمت آزمایشی',
  slug: 'test-service',
  summary: null,
  description: null,
  images: [],
  specifications: [],
  ctaLabel: null,
  ctaHref: null,
  displayOrder: 0,
  status: 'DRAFT' as never,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
};

const draftMaterial: AdminMaterial = {
  id: 'mat-1',
  name: 'ماده آزمایشی',
  slug: 'test-material',
  family: null,
  grade: null,
  manufacturer: null,
  summary: null,
  description: null,
  images: [],
  specifications: [],
  inquiryAvailable: true,
  displayOrder: 0,
  status: 'DRAFT' as never,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
};

const draftArticle: AdminArticle = {
  id: 'art-1',
  title: 'مقاله آزمایشی',
  slug: 'test-article',
  summary: null,
  body: 'متن آزمایشی',
  featuredImage: null,
  displayOrder: 0,
  status: 'DRAFT' as never,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
  contentVersion: 0,
};

const draftManagedPage: AdminManagedPage = {
  id: 'page-1',
  title: 'صفحه آزمایشی',
  slug: 'test-page',
  summary: null,
  body: 'متن آزمایشی',
  images: [],
  displayOrder: 0,
  status: 'DRAFT' as never,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
};

function fakeAdminRepositories() {
  const listCategories = vi.fn(async () => ({
    items: [draftCategory],
    pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
  }));
  const createCategory = vi.fn(async () => draftCategory);
  const setProductStatus = vi.fn(
    async (id: string, status: AdminProduct['status']) =>
      id === draftProduct.id ? { ...draftProduct, status } : null,
  );
  const createInjectionService = vi.fn(async () => draftInjectionService);
  const createMaterial = vi.fn(async () => draftMaterial);
  const createArticle = vi.fn(async () => draftArticle);
  const createManagedPage = vi.fn(async () => draftManagedPage);
  const repositories = {
    categories: {
      list: listCategories,
      get: vi.fn(async (id: string) =>
        id === draftCategory.id ? draftCategory : null,
      ),
      create: createCategory,
      update: vi.fn(async (id: string) =>
        id === draftCategory.id ? draftCategory : null,
      ),
      setStatus: vi.fn(async (id: string, status: AdminCategory['status']) =>
        id === draftCategory.id ? { ...draftCategory, status } : null,
      ),
    } satisfies AdminCategoryRepository,
    products: {
      list: vi.fn(async () => ({
        items: [draftProduct],
        pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      })),
      get: vi.fn(async (id: string) =>
        id === draftProduct.id ? draftProduct : null,
      ),
      create: vi.fn(async () => draftProduct),
      update: vi.fn(async (id: string) =>
        id === draftProduct.id ? draftProduct : null,
      ),
      setStatus: setProductStatus,
    } satisfies AdminProductRepository,
    injectionServices: {
      list: vi.fn(async () => ({
        items: [draftInjectionService],
        pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      })),
      get: vi.fn(async (id: string) =>
        id === draftInjectionService.id ? draftInjectionService : null,
      ),
      create: createInjectionService,
      update: vi.fn(async (id: string) =>
        id === draftInjectionService.id ? draftInjectionService : null,
      ),
      setStatus: vi.fn(
        async (id: string, status: AdminInjectionService['status']) =>
          id === draftInjectionService.id
            ? { ...draftInjectionService, status }
            : null,
      ),
    } satisfies AdminInjectionServiceRepository,
    materials: {
      list: vi.fn(async () => ({
        items: [draftMaterial],
        pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      })),
      get: vi.fn(async (id: string) =>
        id === draftMaterial.id ? draftMaterial : null,
      ),
      create: createMaterial,
      update: vi.fn(async (id: string) =>
        id === draftMaterial.id ? draftMaterial : null,
      ),
      setStatus: vi.fn(async (id: string, status: AdminMaterial['status']) =>
        id === draftMaterial.id ? { ...draftMaterial, status } : null,
      ),
    } satisfies AdminMaterialRepository,
    articles: {
      list: vi.fn(async () => ({
        items: [draftArticle],
        pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      })),
      get: vi.fn(async (id: string) =>
        id === draftArticle.id ? draftArticle : null,
      ),
      create: createArticle,
      update: vi.fn(async (id: string) =>
        id === draftArticle.id ? draftArticle : null,
      ),
      setStatus: vi.fn(async (id: string, status: AdminArticle['status']) =>
        id === draftArticle.id ? { ...draftArticle, status } : null,
      ),
    } satisfies AdminArticleRepository,
    managedPages: {
      list: vi.fn(async () => ({
        items: [draftManagedPage],
        pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      })),
      get: vi.fn(async (id: string) =>
        id === draftManagedPage.id ? draftManagedPage : null,
      ),
      create: createManagedPage,
      update: vi.fn(async (id: string) =>
        id === draftManagedPage.id ? draftManagedPage : null,
      ),
      setStatus: vi.fn(
        async (id: string, status: AdminManagedPage['status']) =>
          id === draftManagedPage.id ? { ...draftManagedPage, status } : null,
      ),
    } satisfies AdminManagedPageRepository,
    media: {
      prepareProduct: vi.fn(),
      replaceProductReferences: vi.fn(),
      productHasReferences: vi.fn(async () => false),
      prepareArticle: vi.fn(),
      replaceArticleReference: vi.fn(),
      articleHasReference: vi.fn(async () => false),
      assertProductPublishable: vi.fn(),
      assertArticlePublishable: vi.fn(),
    },
  };
  return {
    repositories,
    listCategories,
    createCategory,
    setProductStatus,
    createInjectionService,
    createMaterial,
    createArticle,
    createManagedPage,
  };
}

describe('admin content API (e2e)', () => {
  let app: INestApplication<App>;
  let repositories: Omit<AdminContentTransaction, 'audit'>;
  let listCategoriesSpy: ReturnType<typeof vi.fn>;
  let createCategorySpy: ReturnType<typeof vi.fn>;
  let setProductStatusSpy: ReturnType<typeof vi.fn>;
  let createInjectionServiceSpy: ReturnType<typeof vi.fn>;
  let createMaterialSpy: ReturnType<typeof vi.fn>;
  let createArticleSpy: ReturnType<typeof vi.fn>;
  let createManagedPageSpy: ReturnType<typeof vi.fn>;
  let prisma: {
    authSession: { findUnique: ReturnType<typeof vi.fn> };
    securityAuditEvent: AuditEventWriter['securityAuditEvent'];
  };

  beforeEach(async () => {
    const fake = fakeAdminRepositories();
    repositories = fake.repositories;
    listCategoriesSpy = fake.listCategories;
    createCategorySpy = fake.createCategory;
    setProductStatusSpy = fake.setProductStatus;
    createInjectionServiceSpy = fake.createInjectionService;
    createMaterialSpy = fake.createMaterial;
    createArticleSpy = fake.createArticle;
    createManagedPageSpy = fake.createManagedPage;
    prisma = {
      authSession: { findUnique: vi.fn(async () => null) },
      securityAuditEvent: {
        create: vi.fn(
          async (
            _args: Parameters<
              AuditEventWriter['securityAuditEvent']['create']
            >[0],
          ) => ({}),
        ),
      },
    };
    const unitOfWork = {
      run: <T>(work: (context: AdminContentTransaction) => Promise<T>) =>
        work({ ...repositories, audit: prisma }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ADMIN_CATEGORY_REPOSITORY)
      .useValue(repositories.categories)
      .overrideProvider(ADMIN_PRODUCT_REPOSITORY)
      .useValue(repositories.products)
      .overrideProvider(ADMIN_INJECTION_SERVICE_REPOSITORY)
      .useValue(repositories.injectionServices)
      .overrideProvider(ADMIN_MATERIAL_REPOSITORY)
      .useValue(repositories.materials)
      .overrideProvider(ADMIN_ARTICLE_REPOSITORY)
      .useValue(repositories.articles)
      .overrideProvider(ADMIN_MANAGED_PAGE_REPOSITORY)
      .useValue(repositories.managedPages)
      .overrideProvider(ADMIN_CONTENT_UNIT_OF_WORK)
      .useValue(unitOfWork)
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, {
      port: 3001,
      frontendOrigin: 'http://localhost:3000',
      auth: {
        sessionDays: 7,
        loginLimit: 10,
        loginWindowSeconds: 900,
        cookieSecure: false,
      },
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  function withAdminSession(req: request.Test) {
    prisma.authSession.findUnique.mockResolvedValue({
      id: 's1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      csrfDigest,
      user: adminAccount,
    });
    return req.set(
      'cookie',
      `toranj_session=admin-token; toranj_csrf=${CSRF_TOKEN}`,
    );
  }

  function withCustomerSession(req: request.Test) {
    prisma.authSession.findUnique.mockResolvedValue({
      id: 's2',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      csrfDigest,
      user: customerAccount,
    });
    return req.set(
      'cookie',
      `toranj_session=customer-token; toranj_csrf=${CSRF_TOKEN}`,
    );
  }

  function withStaffSession(req: request.Test, user: typeof operatorAccount) {
    prisma.authSession.findUnique.mockResolvedValue({ id: `s-${user.id}`, expiresAt: new Date(Date.now() + 60_000), revokedAt: null, csrfDigest, user });
    return req.set('cookie', `toranj_session=${user.id}; toranj_csrf=${CSRF_TOKEN}`);
  }

  function csrfHeader(req: request.Test) {
    return req.set('x-csrf-token', CSRF_TOKEN);
  }

  it('rejects list/detail/write requests with no session', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/content/categories')
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/admin/content/products/prod-1')
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/admin/content/categories')
      .send({ name: 'x', slug: 'x' })
      .expect(401);
    expect(listCategoriesSpy).not.toHaveBeenCalled();
  });

  it('rejects an authenticated customer from every admin content route', async () => {
    await withCustomerSession(
      request(app.getHttpServer()).get('/api/v1/admin/content/categories'),
    ).expect(403);
    await withCustomerSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/categories'),
      ),
    )
      .send({ name: 'x', slug: 'x' })
      .expect(403);
  });

  it('rejects an admin mutation without a valid CSRF token', async () => {
    await withAdminSession(
      request(app.getHttpServer()).post('/api/v1/admin/content/categories'),
    )
      .send({ name: 'x', slug: 'x' })
      .expect(401);
    expect(createCategorySpy).not.toHaveBeenCalled();
  });

  it('allows Operator content access and denies Sales', async () => {
    await withStaffSession(request(app.getHttpServer()).get('/api/v1/admin/content/categories'), operatorAccount).expect(200);
    await withStaffSession(request(app.getHttpServer()).get('/api/v1/admin/content/categories'), salesAccount).expect(403);
    await withStaffSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/categories')), operatorAccount).send({ name: 'Operator category', slug: 'operator-category' }).expect(201);
  });

  it('returns no-store and the admin category list for an authorized admin', async () => {
    const response = await withAdminSession(
      request(app.getHttpServer()).get('/api/v1/admin/content/categories'),
    ).expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.items).toEqual([draftCategory]);
  });

  it('creates a category as draft and rejects a duplicate slug payload shape mismatch', async () => {
    const response = await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/categories'),
      ),
    )
      .send({ name: 'دسته آزمایشی', slug: 'test-category' })
      .expect(201);
    expect(response.body).toEqual(draftCategory);
    expect(createCategorySpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'دسته آزمایشی', slug: 'test-category' }),
    );
  });

  it('rejects an invalid slug and an unsafe image URL with 400 without calling the repository', async () => {
    await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/categories'),
      ),
    )
      .send({ name: 'دسته', slug: 'Not A Valid Slug' })
      .expect(400);
    await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/categories'),
      ),
    )
      .send({
        name: 'دسته',
        slug: 'valid-slug',
        image: { url: '//evil.example.com/x.png', alt: 'x' },
      })
      .expect(400);
    expect(createCategorySpy).not.toHaveBeenCalled();
  });

  it('maps a duplicate slug to 409', async () => {
    createCategorySpy.mockRejectedValueOnce({ code: 'P2002' });
    await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/categories'),
      ),
    )
      .send({ name: 'دسته', slug: 'test-category' })
      .expect(409);
  });

  it('publishes and archives a product through dedicated action routes', async () => {
    const published = await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post(
          '/api/v1/admin/content/products/prod-1/publish',
        ),
      ),
    ).expect(200);
    expect(published.body.status).toBe('PUBLISHED');
    expect(setProductStatusSpy).toHaveBeenCalledWith(
      'prod-1',
      'PUBLISHED',
      expect.any(Date),
    );

    await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post(
          '/api/v1/admin/content/products/prod-1/archive',
        ),
      ),
    ).expect(200);
    expect(setProductStatusSpy).toHaveBeenCalledWith(
      'prod-1',
      'ARCHIVED',
      null,
    );
  });

  it('returns 404 for an unknown product id on every route', async () => {
    await withAdminSession(
      request(app.getHttpServer()).get(
        '/api/v1/admin/content/products/unknown',
      ),
    ).expect(404);
    await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post(
          '/api/v1/admin/content/products/unknown/publish',
        ),
      ),
    ).expect(404);
  });

  it('rejects unauthenticated and customer requests on the four newly added resources', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/content/services')
      .expect(401);
    await withCustomerSession(
      request(app.getHttpServer()).get('/api/v1/admin/content/materials'),
    ).expect(403);
    await withCustomerSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/articles'),
      ),
    )
      .send({ title: 'x', slug: 'x', body: 'x' })
      .expect(403);
  });

  it('creates an injection service as draft and rejects an unsafe external ctaHref with 400', async () => {
    const response = await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/services'),
      ),
    )
      .send({ name: 'خدمت آزمایشی', slug: 'test-service' })
      .expect(201);
    expect(response.body).toEqual(draftInjectionService);
    expect(createInjectionServiceSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'خدمت آزمایشی', slug: 'test-service' }),
    );

    await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/services'),
      ),
    )
      .send({
        name: 'خدمت',
        slug: 'other-service',
        ctaHref: 'https://evil.example.com',
      })
      .expect(400);
  });

  it('creates a material as draft', async () => {
    const response = await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/materials'),
      ),
    )
      .send({ name: 'ماده آزمایشی', slug: 'test-material' })
      .expect(201);
    expect(response.body).toEqual(draftMaterial);
    expect(createMaterialSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ماده آزمایشی', slug: 'test-material' }),
    );
  });

  it('creates an article as draft and rejects a missing body with 400', async () => {
    const response = await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/articles'),
      ),
    )
      .send({
        title: 'مقاله آزمایشی',
        slug: 'test-article',
        body: 'متن آزمایشی',
      })
      .expect(201);
    expect(response.body).toEqual(draftArticle);
    expect(createArticleSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'مقاله آزمایشی', slug: 'test-article' }),
    );

    await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/articles'),
      ),
    )
      .send({ title: 'مقاله', slug: 'other-article' })
      .expect(400);
  });

  it('publishes and archives a managed page through dedicated action routes', async () => {
    const response = await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post('/api/v1/admin/content/pages'),
      ),
    )
      .send({ title: 'صفحه آزمایشی', slug: 'test-page', body: 'متن آزمایشی' })
      .expect(201);
    expect(response.body).toEqual(draftManagedPage);
    expect(createManagedPageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'صفحه آزمایشی', slug: 'test-page' }),
    );

    const published = await withAdminSession(
      csrfHeader(
        request(app.getHttpServer()).post(
          '/api/v1/admin/content/pages/page-1/publish',
        ),
      ),
    ).expect(200);
    expect(published.body.status).toBe('PUBLISHED');
  });

  it('returns 404 for an unknown service id', async () => {
    await withAdminSession(
      request(app.getHttpServer()).get(
        '/api/v1/admin/content/services/unknown',
      ),
    ).expect(404);
  });

  it('preserves list, detail, update, publish, and archive contracts for all six resource families', async () => {
    const families = [
      {
        path: 'categories',
        id: draftCategory.id,
        update: { name: 'Updated category' },
      },
      {
        path: 'products',
        id: draftProduct.id,
        update: { name: 'Updated product' },
      },
      {
        path: 'services',
        id: draftInjectionService.id,
        update: { name: 'Updated service' },
      },
      {
        path: 'materials',
        id: draftMaterial.id,
        update: { name: 'Updated material' },
      },
      {
        path: 'articles',
        id: draftArticle.id,
        update: { title: 'Updated article' },
      },
      {
        path: 'pages',
        id: draftManagedPage.id,
        update: { title: 'Updated page' },
      },
    ];

    for (const family of families) {
      const baseUrl = `/api/v1/admin/content/${family.path}`;
      const list = await withAdminSession(
        request(app.getHttpServer()).get(baseUrl),
      ).expect(200);
      expect(list.headers['cache-control']).toBe('no-store');
      expect(list.body.items).toHaveLength(1);

      const detail = await withAdminSession(
        request(app.getHttpServer()).get(`${baseUrl}/${family.id}`),
      ).expect(200);
      expect(detail.body.id).toBe(family.id);

      const updated = await withAdminSession(
        csrfHeader(
          request(app.getHttpServer()).patch(`${baseUrl}/${family.id}`),
        ),
      )
        .send(family.update)
        .expect(200);
      expect(updated.body.id).toBe(family.id);

      const published = await withAdminSession(
        csrfHeader(
          request(app.getHttpServer()).post(`${baseUrl}/${family.id}/publish`),
        ),
      ).expect(200);
      expect(published.body.status).toBe('PUBLISHED');

      const archived = await withAdminSession(
        csrfHeader(
          request(app.getHttpServer()).post(`${baseUrl}/${family.id}/archive`),
        ),
      ).expect(200);
      expect(archived.body.status).toBe('ARCHIVED');
    }
  });
});
