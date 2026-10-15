import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { recordAuditEvent } from '../audit/audit.js';
import type { InquiryRepository } from './inquiry.repository.js';
import type {
  AdminInquiry,
  AdminInquiryListItem,
  AdminInquiryListQuery,
  CustomerInquiry,
  InquiryCreateInput,
  InquiryListQuery,
} from './inquiry.types.js';

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

const accountSummarySelect = { id: true, displayName: true, mobile: true } as const;
const adminListSelect = {
  id: true,
  type: true,
  status: true,
  version: true,
  catalogItemName: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { ...accountSummarySelect, companyName: true } },
  assignedAdmin: { select: accountSummarySelect },
} satisfies Prisma.InquirySelect;

const adminSelect = {
  ...select,
  version: true,
  owner: { select: { ...accountSummarySelect, companyName: true } },
  assignedAdmin: { select: accountSummarySelect },
  statusHistory: {
    orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }],
    select: { id: true, fromStatus: true, toStatus: true, createdAt: true, actor: { select: { id: true, displayName: true } } },
  },
  assignmentHistory: {
    orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }],
    select: {
      id: true,
      createdAt: true,
      fromAdmin: { select: { id: true, displayName: true } },
      toAdmin: { select: { id: true, displayName: true } },
      actor: { select: { id: true, displayName: true } },
    },
  },
  internalNotes: {
    orderBy: [{ createdAt: 'desc' as const }, { id: 'desc' as const }],
    select: { id: true, text: true, createdAt: true, author: { select: { id: true, displayName: true } } },
  },
} satisfies Prisma.InquirySelect;

type AdminListRow = Prisma.InquiryGetPayload<{ select: typeof adminListSelect }>;
type AdminRow = Prisma.InquiryGetPayload<{ select: typeof adminSelect }>;

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

function mapAdminListItem(row: AdminListRow): AdminInquiryListItem {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    version: row.version,
    catalogItemName: row.catalogItemName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ownerSummary: row.owner,
    assigneeSummary: row.assignedAdmin,
  };
}

export function mapAdminInquiry(row: AdminRow): AdminInquiry {
  const customer = mapCustomerInquiry(row);
  return {
    ...customer,
    version: row.version,
    ownerSummary: row.owner,
    assigneeSummary: row.assignedAdmin,
    statusHistory: row.statusHistory.map((item) => ({
      id: item.id,
      fromStatus: item.fromStatus,
      toStatus: item.toStatus,
      createdAt: item.createdAt.toISOString(),
      actorSummary: item.actor,
    })),
    assignmentHistory: row.assignmentHistory.map((item) => ({
      id: item.id,
      fromAdminSummary: item.fromAdmin,
      toAdminSummary: item.toAdmin,
      actorSummary: item.actor,
      createdAt: item.createdAt.toISOString(),
    })),
    internalNotes: row.internalNotes.map((item) => ({
      id: item.id,
      text: item.text,
      authorSummary: item.author,
      createdAt: item.createdAt.toISOString(),
    })),
    allowedTransitions: [],
  };
}

const eligible = { status: 'PUBLISHED' as const, publishedAt: { lte: new Date() } };
const optional = (value: string | undefined) => value?.trim() || null;

function normalizedMobile(value: string): string | null {
  const compact = value.trim().replace(/[\s()-]/g, '');
  const local = compact.startsWith('+98') ? compact.slice(3) : compact.startsWith('0098') ? compact.slice(4) : compact.startsWith('98') ? compact.slice(2) : compact.startsWith('0') ? compact.slice(1) : compact;
  return /^9\d{9}$/.test(local) ? `+98${local}` : null;
}

function adminWhere(query: AdminInquiryListQuery): Prisma.InquiryWhereInput {
  const q = query.q?.trim();
  const mobile = q ? normalizedMobile(q) : null;
  return {
    ...(query.type ? { type: query.type } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.assignedAdminId ? { assignedAdminId: query.assignedAdminId } : query.unassigned === true ? { assignedAdminId: null } : query.unassigned === false ? { assignedAdminId: { not: null } } : {}),
    ...(query.from || query.to ? { createdAt: { ...(query.from ? { gte: query.from } : {}), ...(query.to ? { lt: query.to } : {}) } } : {}),
    ...(q ? {
      OR: [
        { id: { startsWith: q } },
        { catalogItemName: { contains: q, mode: 'insensitive' } },
        ...(mobile ? [{ owner: { is: { mobile } } } satisfies Prisma.InquiryWhereInput] : []),
      ],
    } : {}),
  };
}

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

  async adminList(query: AdminInquiryListQuery) {
    const where = adminWhere(query);
    const [total, rows] = await Promise.all([
      this.prisma.inquiry.count({ where }),
      this.prisma.inquiry.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: adminListSelect }),
    ]);
    return { items: rows.map(mapAdminListItem), page: query.page, pageSize: query.pageSize, total, pageCount: Math.ceil(total / query.pageSize) };
  }

  async adminSummary() {
    const [total, unassigned, submitted, underReview] = await Promise.all([
      this.prisma.inquiry.count(),
      this.prisma.inquiry.count({ where: { assignedAdminId: null } }),
      this.prisma.inquiry.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.inquiry.count({ where: { status: 'UNDER_REVIEW' } }),
    ]);
    return { total, unassigned, submitted, underReview };
  }

  adminAssignees() {
    return this.prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SALES'] }, status: 'ACTIVE' }, orderBy: [{ displayName: 'asc' }, { id: 'asc' }], select: accountSummarySelect });
  }

  async getAdmin(id: string) {
    const row = await this.prisma.inquiry.findUnique({ where: { id }, select: adminSelect });
    return row ? mapAdminInquiry(row) : null;
  }

  adminTransitionStatus(id: string, expectedVersion: number, toStatus: AdminRow['status'], actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.inquiry.findUnique({ where: { id }, select: { status: true } });
      if (!current) return { kind: 'not_found' as const };
      const updated = await transaction.inquiry.updateMany({ where: { id, version: expectedVersion }, data: { status: toStatus, version: { increment: 1 } } });
      if (updated.count !== 1) return { kind: 'version_conflict' as const };
      await transaction.inquiryStatusHistory.create({ data: { inquiryId: id, fromStatus: current.status, toStatus, actorId } });
      await recordAuditEvent(transaction, 'INQUIRY_STATUS_CHANGED', actorId, { inquiryId: id, fromStatus: current.status, toStatus, fromVersion: expectedVersion, toVersion: expectedVersion + 1 });
      const row = await transaction.inquiry.findUniqueOrThrow({ where: { id }, select: adminSelect });
      return { kind: 'ok' as const, inquiry: mapAdminInquiry(row) };
    });
  }

  adminAssign(id: string, expectedVersion: number, assignedAdminId: string | null, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.inquiry.findUnique({ where: { id }, select: { assignedAdminId: true } });
      if (!current) return { kind: 'not_found' as const };
      if (assignedAdminId) {
        const eligibleAssignee = await transaction.user.findFirst({ where: { id: assignedAdminId, role: { in: ['ADMIN', 'SALES'] }, status: 'ACTIVE' }, select: { id: true } });
        if (!eligibleAssignee) return { kind: 'invalid_assignee' as const };
      }
      const updated = await transaction.inquiry.updateMany({ where: { id, version: expectedVersion }, data: { assignedAdminId, version: { increment: 1 } } });
      if (updated.count !== 1) return { kind: 'version_conflict' as const };
      await transaction.inquiryAssignmentHistory.create({ data: { inquiryId: id, fromAdminId: current.assignedAdminId, toAdminId: assignedAdminId, actorId } });
      await recordAuditEvent(transaction, 'INQUIRY_ASSIGNED', actorId, { inquiryId: id, fromAdminId: current.assignedAdminId, toAdminId: assignedAdminId, fromVersion: expectedVersion, toVersion: expectedVersion + 1 });
      const row = await transaction.inquiry.findUniqueOrThrow({ where: { id }, select: adminSelect });
      return { kind: 'ok' as const, inquiry: mapAdminInquiry(row) };
    });
  }

  adminAddNote(id: string, text: string, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const exists = await transaction.inquiry.findUnique({ where: { id }, select: { id: true } });
      if (!exists) return { kind: 'not_found' as const };
      const note = await transaction.inquiryInternalNote.create({ data: { inquiryId: id, authorId: actorId, text }, select: { id: true } });
      await recordAuditEvent(transaction, 'INQUIRY_NOTE_ADDED', actorId, { inquiryId: id, noteId: note.id });
      const row = await transaction.inquiry.findUniqueOrThrow({ where: { id }, select: adminSelect });
      return { kind: 'ok' as const, inquiry: mapAdminInquiry(row) };
    });
  }
}
