import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type {
  AdminImageDto,
  AdminSpecificationDto,
} from '../dto/admin-image.dto.js';
import { isSafeContentImageUrl } from '../dto/admin-image.dto.js';
import type {
  CreateMaterialDto,
  UpdateMaterialDto,
} from '../dto/admin-material.dto.js';
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
  ADMIN_MATERIAL_REPOSITORY,
  type AdminMaterialRepository,
} from './repository.js';
import type { MaterialWriteInput } from './types.js';

function imageValue(image: AdminImageDto) {
  return {
    url: image.url,
    alt: image.alt,
    ...(image.width === undefined ? {} : { width: image.width }),
    ...(image.height === undefined ? {} : { height: image.height }),
  };
}
function specificationValues(items: AdminSpecificationDto[] | undefined) {
  return items?.map(({ label, value }) => ({ label, value }));
}
function assertSafeImages(images: AdminImageDto[] | undefined) {
  if (images?.some(({ url }) => !isSafeContentImageUrl(url)))
    throw new BadRequestException(
      'آدرس تصویر باید یک مسیر داخلی یا نشانی http/https معتبر باشد.',
    );
}

@Injectable()
export class AdminMaterialService {
  constructor(
    @Inject(ADMIN_MATERIAL_REPOSITORY)
    private readonly materials: AdminMaterialRepository,
    @Inject(ADMIN_CONTENT_UNIT_OF_WORK)
    private readonly unitOfWork: AdminContentUnitOfWork,
  ) {}
  list(query: AdminListQuery) {
    return this.materials.list(query);
  }
  async get(id: string) {
    return requireFound(await this.materials.get(id));
  }
  create(dto: CreateMaterialDto, actorId: string) {
    assertSafeImages(dto.images);
    const input: MaterialWriteInput = {
      name: dto.name.trim(),
      slug: dto.slug,
      family: dto.family?.trim() || null,
      grade: dto.grade?.trim() || null,
      manufacturer: dto.manufacturer?.trim() || null,
      summary: dto.summary?.trim() || null,
      description: dto.description?.trim() || null,
      images: dto.images?.map(imageValue) ?? [],
      specifications: specificationValues(dto.specifications) ?? [],
      inquiryAvailable: dto.inquiryAvailable ?? true,
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    return this.unitOfWork.run(async ({ materials, audit }) => {
      const material = await withConflictHandling(() =>
        materials.create(input),
      );
      await recordContentAudit(audit, 'MATERIAL_CREATED', actorId, material);
      return material;
    });
  }
  update(id: string, dto: UpdateMaterialDto, actorId: string) {
    assertSafeImages(dto.images);
    const input: Partial<MaterialWriteInput> = {
      ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.family === undefined
        ? {}
        : { family: dto.family.trim() || null }),
      ...(dto.grade === undefined ? {} : { grade: dto.grade.trim() || null }),
      ...(dto.manufacturer === undefined
        ? {}
        : { manufacturer: dto.manufacturer.trim() || null }),
      ...(dto.summary === undefined
        ? {}
        : { summary: dto.summary.trim() || null }),
      ...(dto.description === undefined
        ? {}
        : { description: dto.description.trim() || null }),
      ...(dto.images === undefined
        ? {}
        : { images: dto.images.map(imageValue) }),
      ...(dto.specifications === undefined
        ? {}
        : { specifications: specificationValues(dto.specifications) }),
      ...(dto.inquiryAvailable === undefined
        ? {}
        : { inquiryAvailable: dto.inquiryAvailable }),
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
    return this.unitOfWork.run(async ({ materials, audit }) => {
      const material = requireFound(
        await withConflictHandling(() => materials.update(id, input)),
      );
      await recordContentAudit(audit, 'MATERIAL_UPDATED', actorId, material);
      return material;
    });
  }
  publish(id: string, actorId: string) {
    return this.unitOfWork.run(({ materials, audit }) =>
      transitionStatus({
        id,
        actorId,
        audit,
        action: 'MATERIAL_PUBLISHED',
        target: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        get: materials.get.bind(materials),
        setStatus: materials.setStatus.bind(materials),
      }),
    );
  }
  archive(id: string, actorId: string) {
    return this.unitOfWork.run(({ materials, audit }) =>
      transitionStatus({
        id,
        actorId,
        audit,
        action: 'MATERIAL_ARCHIVED',
        target: ContentStatus.ARCHIVED,
        publishedAt: null,
        get: materials.get.bind(materials),
        setStatus: materials.setStatus.bind(materials),
      }),
    );
  }
}
