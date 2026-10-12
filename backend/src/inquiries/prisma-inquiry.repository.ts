import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { InquiryRepository } from './inquiry.repository.js';
import type { CustomerInquiry, InquiryCreateInput, InquiryListQuery } from './inquiry.types.js';

const select = {
  id: true, type: true, status: true, catalogItemName: true, description: true,
  approximateQuantity: true, quantityUnit: true, deliveryCity: true, requestedTiming: true,
  partDescription: true, moldStatus: true, materialName: true, color: true,
  materialRequestKind: true, polymerName: true, grade: true, brand: true,
  materialCondition: true, application: true, specifications: true,
  createdAt: true, updatedAt: true,
  statusHistory: { orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }], select: { id: true, fromStatus: true, toStatus: true, createdAt: true } },
} satisfies Prisma.InquirySelect;

type Row = Prisma.InquiryGetPayload<{ select: typeof select }>;

export function mapCustomerInquiry(row: Row): CustomerInquiry {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    catalogItemName: row.catalogItemName,
    description: row.description,
    approximateQuantity: row.approximateQuantity,
    quantityUnit: row.quantityUnit,
    deliveryCity: row.deliveryCity,
    requestedTiming: row.requestedTiming,
    partDescription: row.partDescription,
    moldStatus: row.moldStatus,
    materialName: row.materialName,
    color: row.color,
    materialRequestKind: row.materialRequestKind,
    polymerName: row.polymerName,
    grade: row.grade,
    brand: row.brand,
    materialCondition: row.materialCondition,
    application: row.application,
    specifications: row.specifications,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    statusHistory: row.statusHistory.map((item) => ({ id: item.id, fromStatus: item.fromStatus, toStatus: item.toStatus, createdAt: item.createdAt.toISOString() })),
  };
}

const eligible = { status: 'PUBLISHED' as const, publishedAt: { lte: new Date() } };
const optional = (value: string | undefined) => value?.trim() || null;

@Injectable()
export class PrismaInquiryRepository implements InquiryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPublishedProduct(id: string) {
    return this.prisma.product.findFirst({ where: { id, ...eligible }, select: { id: true, name: true } });
  }
  findPublishedService(id: string) {
    return this.prisma.injectionService.findFirst({ where: { id, ...eligible }, select: { id: true, name: true } });
  }
  findPublishedMaterial(id: string) {
    return this.prisma.material.findFirst({ where: { id, ...eligible }, select: { id: true, name: true } });
  }

  create(ownerId: string, input: InquiryCreateInput) {
    return this.prisma.$transaction(async (transaction) => {
      const inquiry = await transaction.inquiry.create({
        data: {
          type: input.type,
          status: 'SUBMITTED',
          ownerId,
          productId: input.productId ?? null,
          injectionServiceId: input.injectionServiceId ?? null,
          materialId: input.materialId ?? null,
          catalogItemName: optional(input.catalogItemName),
          description: optional(input.description),
          approximateQuantity: optional(input.approximateQuantity),
          quantityUnit: optional(input.quantityUnit),
          deliveryCity: optional(input.deliveryCity),
          requestedTiming: optional(input.requestedTiming),
          partDescription: optional(input.partDescription),
          moldStatus: optional(input.moldStatus),
          materialName: optional(input.materialName),
          color: optional(input.color),
          materialRequestKind: input.materialRequestKind ?? null,
          polymerName: optional(input.polymerName),
          grade: optional(input.grade),
          brand: optional(input.brand),
          materialCondition: input.materialCondition ?? null,
          application: optional(input.application),
          specifications: optional(input.specifications),
        },
        select: { id: true },
      });
      await transaction.inquiryStatusHistory.create({ data: { inquiryId: inquiry.id, fromStatus: null, toStatus: 'SUBMITTED', actorId: ownerId } });
      const row = await transaction.inquiry.findUniqueOrThrow({ where: { id: inquiry.id }, select });
      return mapCustomerInquiry(row);
    });
  }

  async list(ownerId: string, query: InquiryListQuery) {
    const where: Prisma.InquiryWhereInput = { ownerId, ...(query.type ? { type: query.type } : {}), ...(query.status ? { status: query.status } : {}) };
    const [total, rows] = await Promise.all([
      this.prisma.inquiry.count({ where }),
      this.prisma.inquiry.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select }),
    ]);
    return { items: rows.map(mapCustomerInquiry), page: query.page, pageSize: query.pageSize, total, pageCount: Math.ceil(total / query.pageSize) };
  }

  async getOwned(ownerId: string, id: string) {
    const row = await this.prisma.inquiry.findFirst({ where: { id, ownerId }, select });
    return row ? mapCustomerInquiry(row) : null;
  }
}
