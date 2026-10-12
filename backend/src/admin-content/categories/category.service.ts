import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminImageDto } from '../dto/admin-image.dto.js';
import { isSafeContentImageUrl } from '../dto/admin-image.dto.js';
import type { CreateCategoryDto, UpdateCategoryDto } from '../dto/admin-category.dto.js';
import { ADMIN_CONTENT_UNIT_OF_WORK, type AdminContentUnitOfWork } from '../unit-of-work.js';
import { recordContentAudit, requireFound, transitionStatus, withConflictHandling } from '../shared/mutations.js';
import { ADMIN_CATEGORY_REPOSITORY, type AdminCategoryRepository } from './repository.js';
import type { AdminListQuery } from '../shared/types.js';
import type { CategoryWriteInput } from './types.js';

function imageValue(image: AdminImageDto) {
  return { url: image.url, alt: image.alt, ...(image.width === undefined ? {} : { width: image.width }), ...(image.height === undefined ? {} : { height: image.height }) };
}

function assertSafeImage(image: AdminImageDto | undefined): void {
  if (image && !isSafeContentImageUrl(image.url)) {
    throw new BadRequestException('آدرس تصویر باید یک مسیر داخلی یا نشانی http/https معتبر باشد.');
  }
}

@Injectable()
export class AdminCategoryService {
  constructor(
    @Inject(ADMIN_CATEGORY_REPOSITORY) private readonly categories: AdminCategoryRepository,
    @Inject(ADMIN_CONTENT_UNIT_OF_WORK) private readonly unitOfWork: AdminContentUnitOfWork,
  ) {}

  list(query: AdminListQuery) { return this.categories.list(query); }
  async get(id: string) { return requireFound(await this.categories.get(id)); }

  create(dto: CreateCategoryDto, actorId: string) {
    assertSafeImage(dto.image);
    const input: CategoryWriteInput = {
      name: dto.name.trim(), slug: dto.slug, description: dto.description?.trim() || null,
      image: dto.image ? imageValue(dto.image) : null, displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null, metaDescription: dto.metaDescription?.trim() || null,
    };
    return this.unitOfWork.run(async ({ categories, audit }) => {
      const category = await withConflictHandling(() => categories.create(input));
      await recordContentAudit(audit, 'CATEGORY_CREATED', actorId, category);
      return category;
    });
  }

  update(id: string, dto: UpdateCategoryDto, actorId: string) {
    assertSafeImage(dto.image);
    const input: Partial<CategoryWriteInput> = {
      ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.description === undefined ? {} : { description: dto.description.trim() || null }),
      ...(dto.image === undefined ? {} : { image: imageValue(dto.image) }),
      ...(dto.displayOrder === undefined ? {} : { displayOrder: dto.displayOrder }),
      ...(dto.metaTitle === undefined ? {} : { metaTitle: dto.metaTitle.trim() || null }),
      ...(dto.metaDescription === undefined ? {} : { metaDescription: dto.metaDescription.trim() || null }),
    };
    return this.unitOfWork.run(async ({ categories, audit }) => {
      const category = requireFound(await withConflictHandling(() => categories.update(id, input)));
      await recordContentAudit(audit, 'CATEGORY_UPDATED', actorId, category);
      return category;
    });
  }

  publish(id: string, actorId: string) {
    return this.unitOfWork.run(({ categories, audit }) => transitionStatus({
      id, actorId, audit, action: 'CATEGORY_PUBLISHED', target: ContentStatus.PUBLISHED,
      publishedAt: new Date(), get: categories.get.bind(categories), setStatus: categories.setStatus.bind(categories),
    }));
  }

  archive(id: string, actorId: string) {
    return this.unitOfWork.run(({ categories, audit }) => transitionStatus({
      id, actorId, audit, action: 'CATEGORY_ARCHIVED', target: ContentStatus.ARCHIVED,
      publishedAt: null, get: categories.get.bind(categories), setStatus: categories.setStatus.bind(categories),
    }));
  }
}
