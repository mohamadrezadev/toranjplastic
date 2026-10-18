import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminManagedImageDto } from '../dto/admin-image.dto.js';
import { isSafeContentImageUrl } from '../dto/admin-image.dto.js';
import type {
  CreateArticleDto,
  UpdateArticleDto,
} from '../dto/admin-article.dto.js';
import {
  recordContentAudit,
  requireFound,
  transitionStatus,
  withConflictHandling,
} from '../shared/mutations.js';
import type { AdminListQuery } from '../shared/types.js';
import {
  ADMIN_CONTENT_UNIT_OF_WORK,
  type AdminContentUnitOfWork,
} from '../unit-of-work.js';
import {
  ADMIN_ARTICLE_REPOSITORY,
  type AdminArticleRepository,
} from './repository.js';
import type { ArticleWriteInput } from './types.js';

function imageValue(image: AdminManagedImageDto) {
  if (!image.url) throw new BadRequestException({ code: 'INVALID_IMAGE_SOURCE' });
  return {
    url: image.url,
    alt: image.alt,
    ...(image.width === undefined ? {} : { width: image.width }),
    ...(image.height === undefined ? {} : { height: image.height }),
  };
}
function assertSafeImage(image: AdminManagedImageDto | null | undefined) {
  if (image?.url && !isSafeContentImageUrl(image.url))
    throw new BadRequestException(
      'آدرس تصویر باید یک مسیر داخلی یا نشانی http/https معتبر باشد.',
    );
}

@Injectable()
export class AdminArticleService {
  constructor(
    @Inject(ADMIN_ARTICLE_REPOSITORY)
    private readonly articles: AdminArticleRepository,
    @Inject(ADMIN_CONTENT_UNIT_OF_WORK)
    private readonly unitOfWork: AdminContentUnitOfWork,
  ) {}
  list(query: AdminListQuery) {
    return this.articles.list(query);
  }
  async get(id: string) {
    return requireFound(await this.articles.get(id));
  }
  create(dto: CreateArticleDto, actorId: string) {
    assertSafeImage(dto.featuredImage);
    const baseInput: ArticleWriteInput = {
      title: dto.title.trim(),
      slug: dto.slug,
      summary: dto.summary?.trim() || null,
      body: dto.body,
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    return this.unitOfWork.run(async ({ articles, audit, media }) => {
      const hasManaged = Boolean(dto.featuredImage?.mediaAssetId);
      const prepared = hasManaged ? await media.prepareArticle(dto.featuredImage ?? null) : null;
      const input: ArticleWriteInput = {
        ...baseInput,
        featuredImage: prepared?.projection ?? (dto.featuredImage ? imageValue(dto.featuredImage) : null),
        ...(hasManaged ? { contentVersion: 1 } : {}),
      };
      const article = await withConflictHandling(() => articles.create(input));
      if (prepared) await media.replaceArticleReference(article.id, prepared.reference);
      await recordContentAudit(audit, 'ARTICLE_CREATED', actorId, article);
      return article;
    });
  }
  update(id: string, dto: UpdateArticleDto, actorId: string) {
    assertSafeImage(dto.featuredImage);
    const input: Partial<ArticleWriteInput> = {
      ...(dto.title === undefined ? {} : { title: dto.title.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.summary === undefined
        ? {}
        : { summary: dto.summary.trim() || null }),
      ...(dto.body === undefined ? {} : { body: dto.body }),
      ...(dto.featuredImage === undefined
        ? {}
        : {}),
      ...(dto.displayOrder === undefined
        ? {}
        : { displayOrder: dto.displayOrder }),
      ...(dto.metaTitle === undefined
        ? {}
        : { metaTitle: dto.metaTitle.trim() || null }),
      ...(dto.metaDescription === undefined
        ? {}
        : { metaDescription: dto.metaDescription.trim() || null }),
    };
    return this.unitOfWork.run(async ({ articles, audit, media }) => {
      let prepared;
      let expectedVersion: number | undefined;
      if (dto.featuredImage !== undefined) {
        const changesManagedMedia = dto.featuredImage === null ||
          Boolean(dto.featuredImage.mediaAssetId) || await media.articleHasReference(id);
        if (changesManagedMedia && dto.expectedVersion === undefined) {
          throw new BadRequestException({ code: 'EXPECTED_VERSION_REQUIRED' });
        }
        prepared = changesManagedMedia ? await media.prepareArticle(dto.featuredImage) : null;
        input.featuredImage = prepared?.projection ??
          (dto.featuredImage ? imageValue(dto.featuredImage) : null);
        expectedVersion = changesManagedMedia ? dto.expectedVersion : undefined;
      }
      const updated = await withConflictHandling(() => expectedVersion === undefined
        ? articles.update(id, input)
        : articles.update(id, input, expectedVersion));
      if (!updated && expectedVersion !== undefined && await articles.get(id)) {
        throw new ConflictException({ code: 'CONTENT_VERSION_CONFLICT' });
      }
      const article = requireFound(updated);
      if (prepared) await media.replaceArticleReference(id, prepared.reference);
      await recordContentAudit(audit, 'ARTICLE_UPDATED', actorId, article);
      return article;
    });
  }
  publish(id: string, actorId: string) {
    return this.unitOfWork.run(async ({ articles, audit, media }) => {
      await media.assertArticlePublishable(id);
      return transitionStatus({
        id,
        actorId,
        audit,
        action: 'ARTICLE_PUBLISHED',
        target: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        get: articles.get.bind(articles),
        setStatus: articles.setStatus.bind(articles),
      });
    });
  }
  archive(id: string, actorId: string) {
    return this.unitOfWork.run(({ articles, audit }) =>
      transitionStatus({
        id,
        actorId,
        audit,
        action: 'ARTICLE_ARCHIVED',
        target: ContentStatus.ARCHIVED,
        publishedAt: null,
        get: articles.get.bind(articles),
        setStatus: articles.setStatus.bind(articles),
      }),
    );
  }
}
