import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { AdminContentService } from './admin-content.service.js';
import type { AdminContentRepository } from './admin-content.repository.js';
import type { AdminArticle, AdminCategory, AdminInjectionService, AdminManagedPage, AdminMaterial, AdminProduct } from './admin-content.types.js';

const category: AdminCategory = {
  id: 'c1', name: 'دسته', slug: 'cat', description: null, image: null, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const product: AdminProduct = {
  id: 'p1', name: 'محصول', slug: 'prod', summary: null, description: null, categoryId: null, images: [], specifications: [], featured: false, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const injectionService: AdminInjectionService = {
  id: 'is1', name: 'خدمت', slug: 'svc', summary: null, description: null, images: [], specifications: [], ctaLabel: null, ctaHref: null, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const material: AdminMaterial = {
  id: 'm1', name: 'ماده', slug: 'mat', family: null, grade: null, manufacturer: null, summary: null, description: null, images: [], specifications: [], inquiryAvailable: true, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const article: AdminArticle = {
  id: 'a1', title: 'مقاله', slug: 'art', summary: null, body: 'متن', featuredImage: null, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const managedPage: AdminManagedPage = {
  id: 'mp1', title: 'صفحه', slug: 'page', summary: null, body: 'متن', images: [], displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

function emptyRepository(): AdminContentRepository {
  return {
    listCategories: vi.fn(),
    getCategory: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    setCategoryStatus: vi.fn(),
    listProducts: vi.fn(),
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    setProductStatus: vi.fn(),
    listInjectionServices: vi.fn(),
    getInjectionService: vi.fn(),
    createInjectionService: vi.fn(),
    updateInjectionService: vi.fn(),
    setInjectionServiceStatus: vi.fn(),
    listMaterials: vi.fn(),
    getMaterial: vi.fn(),
    createMaterial: vi.fn(),
    updateMaterial: vi.fn(),
    setMaterialStatus: vi.fn(),
    listArticles: vi.fn(),
    getArticle: vi.fn(),
    createArticle: vi.fn(),
    updateArticle: vi.fn(),
    setArticleStatus: vi.fn(),
    listManagedPages: vi.fn(),
    getManagedPage: vi.fn(),
    createManagedPage: vi.fn(),
    updateManagedPage: vi.fn(),
    setManagedPageStatus: vi.fn(),
  };
}

function prismaMock() {
  const create = vi.fn(async () => ({}));
  return { prisma: { securityAuditEvent: { create } } as unknown as PrismaService, create };
}

describe('AdminContentService', () => {
  it('rejects an image with an unsafe URL before touching the repository', async () => {
    const createCategory = vi.fn();
    const repository = { ...emptyRepository(), createCategory };
    const service = new AdminContentService(repository, prismaMock().prisma);

    await expect(
      service.createCategory({ name: 'دسته', slug: 'cat', image: { url: '//evil.example.com/x.png', alt: 'x' } } as never, 'admin-1'),
    ).rejects.toMatchObject({ status: 400 });
    expect(createCategory).not.toHaveBeenCalled();
  });

  it('translates a duplicate slug into a 409 without a generic 500', async () => {
    const createCategory = vi.fn().mockRejectedValue({ code: 'P2002' });
    const repository = { ...emptyRepository(), createCategory };
    const service = new AdminContentService(repository, prismaMock().prisma);

    await expect(service.createCategory({ name: 'دسته', slug: 'cat' } as never, 'admin-1')).rejects.toMatchObject({ status: 409 });
  });

  it('translates duplicate slugs consistently for the other five resources', async () => {
    const duplicate = { code: 'P2002' };

    const productRepository = { ...emptyRepository(), createProduct: vi.fn().mockRejectedValue(duplicate) };
    await expect(
      new AdminContentService(productRepository, prismaMock().prisma)
        .createProduct({ name: 'محصول', slug: 'prod' } as never, 'admin-1'),
    ).rejects.toMatchObject({ status: 409 });

    const serviceRepository = { ...emptyRepository(), createInjectionService: vi.fn().mockRejectedValue(duplicate) };
    await expect(
      new AdminContentService(serviceRepository, prismaMock().prisma)
        .createInjectionService({ name: 'خدمت', slug: 'svc' } as never, 'admin-1'),
    ).rejects.toMatchObject({ status: 409 });

    const materialRepository = { ...emptyRepository(), createMaterial: vi.fn().mockRejectedValue(duplicate) };
    await expect(
      new AdminContentService(materialRepository, prismaMock().prisma)
        .createMaterial({ name: 'ماده', slug: 'mat' } as never, 'admin-1'),
    ).rejects.toMatchObject({ status: 409 });

    const articleRepository = { ...emptyRepository(), createArticle: vi.fn().mockRejectedValue(duplicate) };
    await expect(
      new AdminContentService(articleRepository, prismaMock().prisma)
        .createArticle({ title: 'مقاله', slug: 'art', body: 'متن' } as never, 'admin-1'),
    ).rejects.toMatchObject({ status: 409 });

    const pageRepository = { ...emptyRepository(), createManagedPage: vi.fn().mockRejectedValue(duplicate) };
    await expect(
      new AdminContentService(pageRepository, prismaMock().prisma)
        .createManagedPage({ title: 'صفحه', slug: 'page', body: 'متن' } as never, 'admin-1'),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('throws 404 when updating a category that does not exist', async () => {
    const updateCategory = vi.fn().mockResolvedValue(null);
    const repository = { ...emptyRepository(), updateCategory };
    const service = new AdminContentService(repository, prismaMock().prisma);

    await expect(service.updateCategory('missing', { name: 'New' } as never, 'admin-1')).rejects.toMatchObject({ status: 404 });
  });

  it('publishing an already-published category is a no-op that does not write a new status', async () => {
    const getCategory = vi.fn().mockResolvedValue({ ...category, status: 'PUBLISHED' as never });
    const setCategoryStatus = vi.fn();
    const repository = { ...emptyRepository(), getCategory, setCategoryStatus };
    const { prisma, create } = prismaMock();
    const service = new AdminContentService(repository, prisma);

    const result = await service.publishCategory('c1', 'admin-1');

    expect(result.status).toBe('PUBLISHED');
    expect(setCategoryStatus).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('publishes a draft category and records an audit event with the acting admin', async () => {
    const getCategory = vi.fn().mockResolvedValue(category);
    const setCategoryStatus = vi.fn().mockResolvedValue({ ...category, status: 'PUBLISHED' as never, publishedAt: '2026-02-01T00:00:00.000Z' });
    const repository = { ...emptyRepository(), getCategory, setCategoryStatus };
    const { prisma, create } = prismaMock();
    const service = new AdminContentService(repository, prisma);

    const result = await service.publishCategory('c1', 'admin-1');

    expect(result.status).toBe('PUBLISHED');
    expect(setCategoryStatus).toHaveBeenCalledWith('c1', 'PUBLISHED', expect.any(Date));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'CATEGORY_PUBLISHED', userId: 'admin-1' }) }),
    );
  });

  it('archiving an already-archived product is idempotent', async () => {
    const getProduct = vi.fn().mockResolvedValue({ ...product, status: 'ARCHIVED' as never });
    const setProductStatus = vi.fn();
    const repository = { ...emptyRepository(), getProduct, setProductStatus };
    const service = new AdminContentService(repository, prismaMock().prisma);

    const result = await service.archiveProduct('p1', 'admin-1');

    expect(result.status).toBe('ARCHIVED');
    expect(setProductStatus).not.toHaveBeenCalled();
  });

  it('characterizes idempotent lifecycle calls without rewriting persisted status', async () => {
    const getInjectionService = vi.fn().mockResolvedValue({ ...injectionService, status: 'PUBLISHED' as never });
    const setInjectionServiceStatus = vi.fn();
    const service = new AdminContentService(
      { ...emptyRepository(), getInjectionService, setInjectionServiceStatus },
      prismaMock().prisma,
    );
    expect((await service.publishInjectionService('is1', 'admin-1')).status).toBe('PUBLISHED');
    expect(setInjectionServiceStatus).not.toHaveBeenCalled();

    const getArticle = vi.fn().mockResolvedValue({ ...article, status: 'ARCHIVED' as never });
    const setArticleStatus = vi.fn();
    const articleService = new AdminContentService(
      { ...emptyRepository(), getArticle, setArticleStatus },
      prismaMock().prisma,
    );
    expect((await articleService.archiveArticle('a1', 'admin-1')).status).toBe('ARCHIVED');
    expect(setArticleStatus).not.toHaveBeenCalled();
  });

  it('creates a product in draft status via the repository and audits the action', async () => {
    const createProduct = vi.fn().mockResolvedValue(product);
    const repository = { ...emptyRepository(), createProduct };
    const { prisma, create } = prismaMock();
    const service = new AdminContentService(repository, prisma);

    const result = await service.createProduct({ name: 'محصول', slug: 'prod', images: [{ url: '/catalog/x.webp', alt: 'x' }] } as never, 'admin-1');

    expect(result).toBe(product);
    expect(createProduct).toHaveBeenCalledWith(expect.objectContaining({ name: 'محصول', slug: 'prod' }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'PRODUCT_CREATED', userId: 'admin-1' }) }),
    );
  });

  it('rejects an injection service with an unsafe external ctaHref before touching the repository', async () => {
    const createInjectionService = vi.fn();
    const repository = { ...emptyRepository(), createInjectionService };
    const service = new AdminContentService(repository, prismaMock().prisma);

    await expect(
      service.createInjectionService({ name: 'خدمت', slug: 'svc', ctaHref: 'https://evil.example.com' } as never, 'admin-1'),
    ).rejects.toMatchObject({ status: 400 });
    expect(createInjectionService).not.toHaveBeenCalled();
  });

  it('creates an injection service in draft status via the repository and audits the action', async () => {
    const createInjectionService = vi.fn().mockResolvedValue(injectionService);
    const repository = { ...emptyRepository(), createInjectionService };
    const { prisma, create } = prismaMock();
    const service = new AdminContentService(repository, prisma);

    const result = await service.createInjectionService({ name: 'خدمت', slug: 'svc', ctaHref: '/contact' } as never, 'admin-1');

    expect(result).toBe(injectionService);
    expect(createInjectionService).toHaveBeenCalledWith(expect.objectContaining({ name: 'خدمت', slug: 'svc', ctaHref: '/contact' }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'INJECTION_SERVICE_CREATED', userId: 'admin-1' }) }),
    );
  });

  it('publishing an already-published material is idempotent', async () => {
    const getMaterial = vi.fn().mockResolvedValue({ ...material, status: 'PUBLISHED' as never });
    const setMaterialStatus = vi.fn();
    const repository = { ...emptyRepository(), getMaterial, setMaterialStatus };
    const service = new AdminContentService(repository, prismaMock().prisma);

    const result = await service.publishMaterial('m1', 'admin-1');

    expect(result.status).toBe('PUBLISHED');
    expect(setMaterialStatus).not.toHaveBeenCalled();
  });

  it('creates a material defaulting inquiryAvailable to true and audits the action', async () => {
    const createMaterial = vi.fn().mockResolvedValue(material);
    const repository = { ...emptyRepository(), createMaterial };
    const { prisma, create } = prismaMock();
    const service = new AdminContentService(repository, prisma);

    const result = await service.createMaterial({ name: 'ماده', slug: 'mat' } as never, 'admin-1');

    expect(result).toBe(material);
    expect(createMaterial).toHaveBeenCalledWith(expect.objectContaining({ name: 'ماده', slug: 'mat', inquiryAvailable: true }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'MATERIAL_CREATED', userId: 'admin-1' }) }),
    );
  });

  it('throws 404 when updating an article that does not exist', async () => {
    const updateArticle = vi.fn().mockResolvedValue(null);
    const repository = { ...emptyRepository(), updateArticle };
    const service = new AdminContentService(repository, prismaMock().prisma);

    await expect(service.updateArticle('missing', { title: 'جدید' } as never, 'admin-1')).rejects.toMatchObject({ status: 404 });
  });

  it('creates an article with a required body and audits the action', async () => {
    const createArticle = vi.fn().mockResolvedValue(article);
    const repository = { ...emptyRepository(), createArticle };
    const { prisma, create } = prismaMock();
    const service = new AdminContentService(repository, prisma);

    const result = await service.createArticle({ title: 'مقاله', slug: 'art', body: 'متن' } as never, 'admin-1');

    expect(result).toBe(article);
    expect(createArticle).toHaveBeenCalledWith(expect.objectContaining({ title: 'مقاله', slug: 'art', body: 'متن' }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'ARTICLE_CREATED', userId: 'admin-1' }) }),
    );
  });

  it('archiving an already-archived managed page is idempotent', async () => {
    const getManagedPage = vi.fn().mockResolvedValue({ ...managedPage, status: 'ARCHIVED' as never });
    const setManagedPageStatus = vi.fn();
    const repository = { ...emptyRepository(), getManagedPage, setManagedPageStatus };
    const service = new AdminContentService(repository, prismaMock().prisma);

    const result = await service.archiveManagedPage('mp1', 'admin-1');

    expect(result.status).toBe('ARCHIVED');
    expect(setManagedPageStatus).not.toHaveBeenCalled();
  });

  it('creates a managed page and audits the action', async () => {
    const createManagedPage = vi.fn().mockResolvedValue(managedPage);
    const repository = { ...emptyRepository(), createManagedPage };
    const { prisma, create } = prismaMock();
    const service = new AdminContentService(repository, prisma);

    const result = await service.createManagedPage({ title: 'صفحه', slug: 'page', body: 'متن' } as never, 'admin-1');

    expect(result).toBe(managedPage);
    expect(createManagedPage).toHaveBeenCalledWith(expect.objectContaining({ title: 'صفحه', slug: 'page', body: 'متن' }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'MANAGED_PAGE_CREATED', userId: 'admin-1' }) }),
    );
  });
});
