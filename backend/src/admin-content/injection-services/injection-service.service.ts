import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type {
  AdminImageDto,
  AdminSpecificationDto,
} from '../dto/admin-image.dto.js';
import { isSafeContentImageUrl } from '../dto/admin-image.dto.js';
import type {
  CreateInjectionServiceDto,
  UpdateInjectionServiceDto,
} from '../dto/admin-injection-service.dto.js';
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
  ADMIN_INJECTION_SERVICE_REPOSITORY,
  type AdminInjectionServiceRepository,
} from './repository.js';
import type { InjectionServiceWriteInput } from './types.js';

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
function assertSafeHref(href: string | undefined) {
  if (href !== undefined && (!href.startsWith('/') || href.startsWith('//')))
    throw new BadRequestException(
      'نشانی فراخوان عمل باید یک مسیر داخلی معتبر باشد.',
    );
}

@Injectable()
export class AdminInjectionServiceService {
  constructor(
    @Inject(ADMIN_INJECTION_SERVICE_REPOSITORY)
    private readonly services: AdminInjectionServiceRepository,
    @Inject(ADMIN_CONTENT_UNIT_OF_WORK)
    private readonly unitOfWork: AdminContentUnitOfWork,
  ) {}

  list(query: AdminListQuery) {
    return this.services.list(query);
  }
  async get(id: string) {
    return requireFound(await this.services.get(id));
  }

  create(dto: CreateInjectionServiceDto, actorId: string) {
    assertSafeImages(dto.images);
    assertSafeHref(dto.ctaHref);
    const input: InjectionServiceWriteInput = {
      name: dto.name.trim(),
      slug: dto.slug,
      summary: dto.summary?.trim() || null,
      description: dto.description?.trim() || null,
      images: dto.images?.map(imageValue) ?? [],
      specifications: specificationValues(dto.specifications) ?? [],
      ctaLabel: dto.ctaLabel?.trim() || null,
      ctaHref: dto.ctaHref?.trim() || null,
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    return this.unitOfWork.run(async ({ injectionServices, audit }) => {
      const service = await withConflictHandling(() =>
        injectionServices.create(input),
      );
      await recordContentAudit(
        audit,
        'INJECTION_SERVICE_CREATED',
        actorId,
        service,
      );
      return service;
    });
  }

  update(id: string, dto: UpdateInjectionServiceDto, actorId: string) {
    assertSafeImages(dto.images);
    assertSafeHref(dto.ctaHref);
    const input: Partial<InjectionServiceWriteInput> = {
      ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
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
      ...(dto.ctaLabel === undefined
        ? {}
        : { ctaLabel: dto.ctaLabel.trim() || null }),
      ...(dto.ctaHref === undefined
        ? {}
        : { ctaHref: dto.ctaHref.trim() || null }),
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
    return this.unitOfWork.run(async ({ injectionServices, audit }) => {
      const service = requireFound(
        await withConflictHandling(() => injectionServices.update(id, input)),
      );
      await recordContentAudit(
        audit,
        'INJECTION_SERVICE_UPDATED',
        actorId,
        service,
      );
      return service;
    });
  }

  publish(id: string, actorId: string) {
    return this.unitOfWork.run(({ injectionServices, audit }) =>
      transitionStatus({
        id,
        actorId,
        audit,
        action: 'INJECTION_SERVICE_PUBLISHED',
        target: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        get: injectionServices.get.bind(injectionServices),
        setStatus: injectionServices.setStatus.bind(injectionServices),
      }),
    );
  }
  archive(id: string, actorId: string) {
    return this.unitOfWork.run(({ injectionServices, audit }) =>
      transitionStatus({
        id,
        actorId,
        audit,
        action: 'INJECTION_SERVICE_ARCHIVED',
        target: ContentStatus.ARCHIVED,
        publishedAt: null,
        get: injectionServices.get.bind(injectionServices),
        setStatus: injectionServices.setStatus.bind(injectionServices),
      }),
    );
  }
}
