import { describe, expect, it, vi } from 'vitest';
import type { AuditEventWriter } from '../../audit/audit.js';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminContentUnitOfWork } from '../unit-of-work.js';
import { AdminArticleService } from './article.service.js';
import type { AdminArticleRepository } from './repository.js';

const record = {
  id: 'article-1',
  title: 'مقاله',
  slug: 'article',
  summary: null,
  body: 'متن',
  featuredImage: null,
  displayOrder: 0,
  status: ContentStatus.DRAFT,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
  contentVersion: 0,
};
function fixture(overrides: Partial<AdminArticleRepository> = {}) {
  const create = vi.fn(async () => record);
  const update = vi.fn(async () => record);
  const repository: AdminArticleRepository = {
    list: vi.fn(),
    get: vi.fn(async () => record),
    create,
    update,
    setStatus: vi.fn(),
    ...overrides,
  };
  const auditCreate = vi.fn(async () => ({}));
  const audit = {
    securityAuditEvent: { create: auditCreate },
  } as AuditEventWriter;
  const media = {
    prepareArticle: vi.fn(async (image: { mediaAssetId?: string; alt?: string } | null) => image ? ({
      projection: { url: 'https://media.example/api/v1/media/public/media-1/detail', alt: image.alt ?? 'تصویر', width: 800, height: 600 },
      reference: { mediaAssetId: image.mediaAssetId ?? 'media-1', alt: image.alt ?? 'تصویر' },
    }) : ({ projection: null, reference: null })),
    replaceArticleReference: vi.fn(async () => undefined),
    articleHasReference: vi.fn(async () => false),
    assertArticlePublishable: vi.fn(async () => undefined),
  };
  const unitOfWork = {
    run: vi.fn(async (work: (context: unknown) => Promise<unknown>) =>
      work({
        articles: repository,
        audit,
        media,
      }),
    ),
  } as unknown as AdminContentUnitOfWork;
  return {
    service: new AdminArticleService(repository, unitOfWork),
    create,
    update,
    auditCreate,
    media,
  };
}

describe('AdminArticleService', () => {
  it('creates an article with explicit body and image mapping', async () => {
    const { service, create, auditCreate } = fixture();
    await service.create(
      {
        title: ' مقاله ',
        slug: 'article',
        body: 'متن',
        featuredImage: { url: '/a.webp', alt: 'a' },
      },
      'admin-1',
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'مقاله',
        body: 'متن',
        featuredImage: { url: '/a.webp', alt: 'a' },
      }),
    );
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'ARTICLE_CREATED' }),
    });
  });
  it('updates article fields and audits', async () => {
    const { service, update, auditCreate } = fixture();
    await service.update(
      record.id,
      { title: ' تازه ', body: 'متن تازه' },
      'admin-1',
    );
    expect(update).toHaveBeenCalledWith(record.id, {
      title: 'تازه',
      body: 'متن تازه',
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'ARTICLE_UPDATED' }),
    });
  });
  it('atomically selects and explicitly clears a managed featured image', async () => {
    const managed = fixture();
    await managed.service.create({
      title: 'مقاله', slug: 'article', body: 'متن',
      featuredImage: { mediaAssetId: 'media-1', alt: 'تصویر' },
    }, 'admin-1');
    expect(managed.create).toHaveBeenCalledWith(expect.objectContaining({ contentVersion: 1 }));
    expect(managed.media.replaceArticleReference).toHaveBeenCalledWith(record.id, {
      mediaAssetId: 'media-1', alt: 'تصویر',
    });

    const clearing = fixture();
    await clearing.service.update(record.id, { expectedVersion: 0, featuredImage: null }, 'admin-1');
    expect(clearing.update).toHaveBeenCalledWith(record.id, { featuredImage: null }, 0);
    expect(clearing.media.replaceArticleReference).toHaveBeenCalledWith(record.id, null);
  });
  it('audits an idempotent publish without writing status', async () => {
    const published = { ...record, status: ContentStatus.PUBLISHED };
    const setStatus = vi.fn();
    const { service, auditCreate } = fixture({
      get: vi.fn(async () => published),
      setStatus,
    });
    await service.publish(record.id, 'admin-1');
    expect(setStatus).not.toHaveBeenCalled();
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'ARTICLE_PUBLISHED' }),
    });
  });
});
