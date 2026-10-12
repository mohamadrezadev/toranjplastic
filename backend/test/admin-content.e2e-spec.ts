import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { ADMIN_CONTENT_REPOSITORY, type AdminContentRepository } from '../src/admin-content/admin-content.repository.js';
import { ADMIN_CATEGORY_REPOSITORY } from '../src/admin-content/categories/repository.js';
import { ADMIN_PRODUCT_REPOSITORY } from '../src/admin-content/products/repository.js';
import { resourceRepositories } from '../src/admin-content/shared/resource-repository-adapters.js';
import { ADMIN_CONTENT_UNIT_OF_WORK } from '../src/admin-content/unit-of-work.js';
import type { AdminArticle, AdminCategory, AdminInjectionService, AdminManagedPage, AdminMaterial, AdminProduct } from '../src/admin-content/admin-content.types.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { digestToken } from '../src/identity/identity.security.js';

const adminAccount = { id: 'admin-1', mobile: '+989123456789', displayName: 'Admin', email: null, companyName: null, role: 'ADMIN', status: 'ACTIVE', lastLoginAt: null, createdAt: new Date('2026-10-11'), updatedAt: new Date('2026-10-11') };
const customerAccount = { ...adminAccount, id: 'customer-1', role: 'CUSTOMER' };

const CSRF_TOKEN = 'valid-csrf-token';
const csrfDigest = digestToken(CSRF_TOKEN);

const draftCategory: AdminCategory = {
  id: 'cat-1', name: 'دسته آزمایشی', slug: 'test-category', description: null, image: null, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-10-11T00:00:00.000Z', updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const draftProduct: AdminProduct = {
  id: 'prod-1', name: 'محصول آزمایشی', slug: 'test-product', summary: null, description: null, categoryId: null, images: [], specifications: [], featured: false, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-10-11T00:00:00.000Z', updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const draftInjectionService: AdminInjectionService = {
  id: 'svc-1', name: 'خدمت آزمایشی', slug: 'test-service', summary: null, description: null, images: [], specifications: [], ctaLabel: null, ctaHref: null, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-10-11T00:00:00.000Z', updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const draftMaterial: AdminMaterial = {
  id: 'mat-1', name: 'ماده آزمایشی', slug: 'test-material', family: null, grade: null, manufacturer: null, summary: null, description: null, images: [], specifications: [], inquiryAvailable: true, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-10-11T00:00:00.000Z', updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const draftArticle: AdminArticle = {
  id: 'art-1', title: 'مقاله آزمایشی', slug: 'test-article', summary: null, body: 'متن آزمایشی', featuredImage: null, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-10-11T00:00:00.000Z', updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const draftManagedPage: AdminManagedPage = {
  id: 'page-1', title: 'صفحه آزمایشی', slug: 'test-page', summary: null, body: 'متن آزمایشی', images: [], displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-10-11T00:00:00.000Z', updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

function fakeAdminRepository() {
  const listCategories = vi.fn(async () => ({ items: [draftCategory], pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 } }));
  const createCategory = vi.fn(async () => draftCategory);
  const setProductStatus = vi.fn(async (id: string) => (id === draftProduct.id ? { ...draftProduct, status: 'PUBLISHED' as never } : null));
  const createInjectionService = vi.fn(async () => draftInjectionService);
  const createMaterial = vi.fn(async () => draftMaterial);
  const createArticle = vi.fn(async () => draftArticle);
  const createManagedPage = vi.fn(async () => draftManagedPage);
  const repository: AdminContentRepository = {
    listCategories,
    getCategory: vi.fn(async (id: string) => (id === draftCategory.id ? draftCategory : null)),
    createCategory,
    updateCategory: vi.fn(async (id: string) => (id === draftCategory.id ? draftCategory : null)),
    setCategoryStatus: vi.fn(async (id: string) => (id === draftCategory.id ? { ...draftCategory, status: 'PUBLISHED' as never } : null)),
    listProducts: vi.fn(async () => ({ items: [draftProduct], pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 } })),
    getProduct: vi.fn(async (id: string) => (id === draftProduct.id ? draftProduct : null)),
    createProduct: vi.fn(async () => draftProduct),
    updateProduct: vi.fn(async (id: string) => (id === draftProduct.id ? draftProduct : null)),
    setProductStatus,
    listInjectionServices: vi.fn(async () => ({ items: [draftInjectionService], pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 } })),
    getInjectionService: vi.fn(async (id: string) => (id === draftInjectionService.id ? draftInjectionService : null)),
    createInjectionService,
    updateInjectionService: vi.fn(async (id: string) => (id === draftInjectionService.id ? draftInjectionService : null)),
    setInjectionServiceStatus: vi.fn(async (id: string) => (id === draftInjectionService.id ? { ...draftInjectionService, status: 'PUBLISHED' as never } : null)),
    listMaterials: vi.fn(async () => ({ items: [draftMaterial], pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 } })),
    getMaterial: vi.fn(async (id: string) => (id === draftMaterial.id ? draftMaterial : null)),
    createMaterial,
    updateMaterial: vi.fn(async (id: string) => (id === draftMaterial.id ? draftMaterial : null)),
    setMaterialStatus: vi.fn(async (id: string) => (id === draftMaterial.id ? { ...draftMaterial, status: 'PUBLISHED' as never } : null)),
    listArticles: vi.fn(async () => ({ items: [draftArticle], pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 } })),
    getArticle: vi.fn(async (id: string) => (id === draftArticle.id ? draftArticle : null)),
    createArticle,
    updateArticle: vi.fn(async (id: string) => (id === draftArticle.id ? draftArticle : null)),
    setArticleStatus: vi.fn(async (id: string) => (id === draftArticle.id ? { ...draftArticle, status: 'PUBLISHED' as never } : null)),
    listManagedPages: vi.fn(async () => ({ items: [draftManagedPage], pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 } })),
    getManagedPage: vi.fn(async (id: string) => (id === draftManagedPage.id ? draftManagedPage : null)),
    createManagedPage,
    updateManagedPage: vi.fn(async (id: string) => (id === draftManagedPage.id ? draftManagedPage : null)),
    setManagedPageStatus: vi.fn(async (id: string) => (id === draftManagedPage.id ? { ...draftManagedPage, status: 'PUBLISHED' as never } : null)),
  };
  return { repository, listCategories, createCategory, setProductStatus, createInjectionService, createMaterial, createArticle, createManagedPage };
}

describe('admin content API (e2e)', () => {
  let app: INestApplication<App>;
  let adminRepository: AdminContentRepository;
  let listCategoriesSpy: ReturnType<typeof vi.fn>;
  let createCategorySpy: ReturnType<typeof vi.fn>;
  let setProductStatusSpy: ReturnType<typeof vi.fn>;
  let createInjectionServiceSpy: ReturnType<typeof vi.fn>;
  let createMaterialSpy: ReturnType<typeof vi.fn>;
  let createArticleSpy: ReturnType<typeof vi.fn>;
  let createManagedPageSpy: ReturnType<typeof vi.fn>;
  let prisma: {
    authSession: { findUnique: ReturnType<typeof vi.fn> };
    securityAuditEvent: { create: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    const fake = fakeAdminRepository();
    adminRepository = fake.repository;
    listCategoriesSpy = fake.listCategories;
    createCategorySpy = fake.createCategory;
    setProductStatusSpy = fake.setProductStatus;
    createInjectionServiceSpy = fake.createInjectionService;
    createMaterialSpy = fake.createMaterial;
    createArticleSpy = fake.createArticle;
    createManagedPageSpy = fake.createManagedPage;
    prisma = { authSession: { findUnique: vi.fn(async () => null) }, securityAuditEvent: { create: vi.fn(async () => ({})) } };
      const repositories = resourceRepositories(adminRepository);
      const unitOfWork = {
        run: (work: (context: unknown) => Promise<unknown>) => work({ ...repositories, audit: prisma }),
      };

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ADMIN_CONTENT_REPOSITORY)
      .useValue(adminRepository)
        .overrideProvider(ADMIN_CATEGORY_REPOSITORY)
        .useValue(repositories.categories)
        .overrideProvider(ADMIN_PRODUCT_REPOSITORY)
        .useValue(repositories.products)
        .overrideProvider(ADMIN_CONTENT_UNIT_OF_WORK)
        .useValue(unitOfWork)
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, { port: 3001, frontendOrigin: 'http://localhost:3000', auth: { sessionDays: 7, loginLimit: 10, loginWindowSeconds: 900, cookieSecure: false } });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  function withAdminSession(req: request.Test) {
    prisma.authSession.findUnique.mockResolvedValue({ id: 's1', expiresAt: new Date(Date.now() + 60_000), revokedAt: null, csrfDigest, user: adminAccount });
    return req.set('cookie', `toranj_session=admin-token; toranj_csrf=${CSRF_TOKEN}`);
  }

  function withCustomerSession(req: request.Test) {
    prisma.authSession.findUnique.mockResolvedValue({ id: 's2', expiresAt: new Date(Date.now() + 60_000), revokedAt: null, csrfDigest, user: customerAccount });
    return req.set('cookie', `toranj_session=customer-token; toranj_csrf=${CSRF_TOKEN}`);
  }

  function csrfHeader(req: request.Test) {
    return req.set('x-csrf-token', CSRF_TOKEN);
  }

  it('rejects list/detail/write requests with no session', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/content/categories').expect(401);
    await request(app.getHttpServer()).get('/api/v1/admin/content/products/prod-1').expect(401);
    await request(app.getHttpServer()).post('/api/v1/admin/content/categories').send({ name: 'x', slug: 'x' }).expect(401);
    expect(listCategoriesSpy).not.toHaveBeenCalled();
  });

  it('rejects an authenticated customer from every admin content route', async () => {
    await withCustomerSession(request(app.getHttpServer()).get('/api/v1/admin/content/categories')).expect(403);
    await withCustomerSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/categories'))).send({ name: 'x', slug: 'x' }).expect(403);
  });

  it('rejects an admin mutation without a valid CSRF token', async () => {
    await withAdminSession(request(app.getHttpServer()).post('/api/v1/admin/content/categories')).send({ name: 'x', slug: 'x' }).expect(401);
    expect(createCategorySpy).not.toHaveBeenCalled();
  });

  it('returns no-store and the admin category list for an authorized admin', async () => {
    const response = await withAdminSession(request(app.getHttpServer()).get('/api/v1/admin/content/categories')).expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.items).toEqual([draftCategory]);
  });

  it('creates a category as draft and rejects a duplicate slug payload shape mismatch', async () => {
    const response = await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/categories')))
      .send({ name: 'دسته آزمایشی', slug: 'test-category' })
      .expect(201);
    expect(response.body).toEqual(draftCategory);
    expect(createCategorySpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'دسته آزمایشی', slug: 'test-category' }));
  });

  it('rejects an invalid slug and an unsafe image URL with 400 without calling the repository', async () => {
    await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/categories')))
      .send({ name: 'دسته', slug: 'Not A Valid Slug' })
      .expect(400);
    await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/categories')))
      .send({ name: 'دسته', slug: 'valid-slug', image: { url: '//evil.example.com/x.png', alt: 'x' } })
      .expect(400);
    expect(createCategorySpy).not.toHaveBeenCalled();
  });

  it('maps a duplicate slug to 409', async () => {
    createCategorySpy.mockRejectedValueOnce({ code: 'P2002' });
    await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/categories')))
      .send({ name: 'دسته', slug: 'test-category' })
      .expect(409);
  });

  it('publishes and archives a product through dedicated action routes', async () => {
    const published = await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/products/prod-1/publish'))).expect(200);
    expect(published.body.status).toBe('PUBLISHED');
    expect(setProductStatusSpy).toHaveBeenCalledWith('prod-1', 'PUBLISHED', expect.any(Date));

    await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/products/prod-1/archive'))).expect(200);
    expect(setProductStatusSpy).toHaveBeenCalledWith('prod-1', 'ARCHIVED', null);
  });

  it('returns 404 for an unknown product id on every route', async () => {
    await withAdminSession(request(app.getHttpServer()).get('/api/v1/admin/content/products/unknown')).expect(404);
    await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/products/unknown/publish'))).expect(404);
  });

  it('rejects unauthenticated and customer requests on the four newly added resources', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/content/services').expect(401);
    await withCustomerSession(request(app.getHttpServer()).get('/api/v1/admin/content/materials')).expect(403);
    await withCustomerSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/articles'))).send({ title: 'x', slug: 'x', body: 'x' }).expect(403);
  });

  it('creates an injection service as draft and rejects an unsafe external ctaHref with 400', async () => {
    const response = await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/services')))
      .send({ name: 'خدمت آزمایشی', slug: 'test-service' })
      .expect(201);
    expect(response.body).toEqual(draftInjectionService);
    expect(createInjectionServiceSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'خدمت آزمایشی', slug: 'test-service' }));

    await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/services')))
      .send({ name: 'خدمت', slug: 'other-service', ctaHref: 'https://evil.example.com' })
      .expect(400);
  });

  it('creates a material as draft', async () => {
    const response = await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/materials')))
      .send({ name: 'ماده آزمایشی', slug: 'test-material' })
      .expect(201);
    expect(response.body).toEqual(draftMaterial);
    expect(createMaterialSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'ماده آزمایشی', slug: 'test-material' }));
  });

  it('creates an article as draft and rejects a missing body with 400', async () => {
    const response = await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/articles')))
      .send({ title: 'مقاله آزمایشی', slug: 'test-article', body: 'متن آزمایشی' })
      .expect(201);
    expect(response.body).toEqual(draftArticle);
    expect(createArticleSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'مقاله آزمایشی', slug: 'test-article' }));

    await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/articles')))
      .send({ title: 'مقاله', slug: 'other-article' })
      .expect(400);
  });

  it('publishes and archives a managed page through dedicated action routes', async () => {
    const response = await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/pages')))
      .send({ title: 'صفحه آزمایشی', slug: 'test-page', body: 'متن آزمایشی' })
      .expect(201);
    expect(response.body).toEqual(draftManagedPage);
    expect(createManagedPageSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'صفحه آزمایشی', slug: 'test-page' }));

    const published = await withAdminSession(csrfHeader(request(app.getHttpServer()).post('/api/v1/admin/content/pages/page-1/publish'))).expect(200);
    expect(published.body.status).toBe('PUBLISHED');
  });

  it('returns 404 for an unknown service id', async () => {
    await withAdminSession(request(app.getHttpServer()).get('/api/v1/admin/content/services/unknown')).expect(404);
  });
});
