import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminImageDto } from '../dto/admin-image.dto.js';
import { isSafeContentImageUrl } from '../dto/admin-image.dto.js';
import type {
  CreateManagedPageDto,
  UpdateManagedPageDto,
} from '../dto/admin-managed-page.dto.js';
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
  ADMIN_MANAGED_PAGE_REPOSITORY,
  type AdminManagedPageRepository,
} from './repository.js';
import type { ManagedPageWriteInput } from './types.js';

function imageValue(image: AdminImageDto) {
  return {
    url: image.url,
    alt: image.alt,
    ...(image.width === undefined ? {} : { width: image.width }),
    ...(image.height === undefined ? {} : { height: image.height }),
  };
}
function assertSafeImages(images: AdminImageDto[] | undefined) {
  if (images?.some(({ url }) => !isSafeContentImageUrl(url)))
    throw new BadRequestException(
      'آدرس تصویر باید یک مسیر داخلی یا نشانی http/https معتبر باشد.',
    );
}

@Injectable()
export class AdminManagedPageService {
  constructor(
    @Inject(ADMIN_MANAGED_PAGE_REPOSITORY)
    private readonly pages: AdminManagedPageRepository,
    @Inject(ADMIN_CONTENT_UNIT_OF_WORK)
    private readonly unitOfWork: AdminContentUnitOfWork,
  ) {}
  list(query: AdminListQuery) {
    return this.pages.list(query);
  }
  async get(id: string) {
    return requireFound(await this.pages.get(id));
  }
  create(dto: CreateManagedPageDto, actorId: string) {
    assertSafeImages(dto.images);
    const input: ManagedPageWriteInput = {
      title: dto.title.trim(),
      slug: dto.slug,
      summary: dto.summary?.trim() || null,
      body: dto.body,
      images: dto.images?.map(imageValue) ?? [],
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    return this.unitOfWork.run(async ({ managedPages, audit }) => {
      const page = await withConflictHandling(() => managedPages.create(input));
      await recordContentAudit(audit, 'MANAGED_PAGE_CREATED', actorId, page);
      return page;
    });
  }
  update(id: string, dto: UpdateManagedPageDto, actorId: string) {
    assertSafeImages(dto.images);
    const input: Partial<ManagedPageWriteInput> = {
      ...(dto.title === undefined ? {} : { title: dto.title.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.summary === undefined
        ? {}
        : { summary: dto.summary.trim() || null }),
      ...(dto.body === undefined ? {} : { body: dto.body }),
      ...(dto.images === undefined
        ? {}
        : { images: dto.images.map(imageValue) }),
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
    return this.unitOfWork.run(async ({ managedPages, audit }) => {
      const page = requireFound(
        await withConflictHandling(() => managedPages.update(id, input)),
      );
      await recordContentAudit(audit, 'MANAGED_PAGE_UPDATED', actorId, page);
      return page;
    });
  }
  publish(id: string, actorId: string) {
    return this.unitOfWork.run(({ managedPages, audit }) =>
      transitionStatus({
        id,
        actorId,
        audit,
        action: 'MANAGED_PAGE_PUBLISHED',
        target: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        get: managedPages.get.bind(managedPages),
        setStatus: managedPages.setStatus.bind(managedPages),
      }),
    );
  }
  archive(id: string, actorId: string) {
    return this.unitOfWork.run(({ managedPages, audit }) =>
      transitionStatus({
        id,
        actorId,
        audit,
        action: 'MANAGED_PAGE_ARCHIVED',
        target: ContentStatus.ARCHIVED,
        publishedAt: null,
        get: managedPages.get.bind(managedPages),
        setStatus: managedPages.setStatus.bind(managedPages),
      }),
    );
  }
}
