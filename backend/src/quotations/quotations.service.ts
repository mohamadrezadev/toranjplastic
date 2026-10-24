import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { recordAuditEvent } from '../audit/audit.js';
import { PrismaService } from '../database/prisma.service.js';
import { calculateQuotation } from './quotation.calculation.js';
import type { QuotationDraftInputDto } from './quotation.dto.js';
import {
  mapCustomerQuotation,
  mapQuotation,
  quotationSelect,
  type QuotationRow,
} from './quotation.mapper.js';

const conflict = (code: string, message: string) =>
  new ConflictException({ code, message });
const notFound = () => new NotFoundException('پیشنهاد قیمت پیدا نشد.');
const eligibleInquiryStatuses = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEED_MORE_INFO',
  'QUOTED',
] as const;

function normalizeDraft(input: QuotationDraftInputDto) {
  const calculated = calculateQuotation(input);
  const validUntil = new Date(input.validUntil);
  if (validUntil.getTime() <= Date.now())
    throw new BadRequestException({
      code: 'QUOTATION_INVALID_VALIDITY',
      message: 'تاریخ اعتبار باید در آینده باشد.',
    });
  return {
    calculated,
    validUntil,
    deliveryTerms: input.deliveryTerms.trim(),
    paymentTerms: input.paymentTerms.trim(),
    notes: input.notes?.trim() || null,
  };
}

function itemData(
  input: QuotationDraftInputDto,
  calculated: ReturnType<typeof calculateQuotation>,
) {
  return input.items.map((item, index) => ({
    position: index + 1,
    description: item.description.trim(),
    quantity: item.quantity,
    unit: item.unit.trim(),
    unitPriceRials: calculated.items[index].unitPriceRials,
    lineTotalRials: calculated.items[index].lineTotalRials,
  }));
}

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  adminList(inquiryId: string) {
    return this.prisma.quotation
      .findMany({
        where: { inquiryId },
        orderBy: { version: 'desc' },
        select: quotationSelect,
      })
      .then((rows) => rows.map(mapQuotation));
  }

  async adminGet(inquiryId: string, quotationId: string) {
    const row = await this.prisma.quotation.findFirst({
      where: { id: quotationId, inquiryId },
      select: quotationSelect,
    });
    if (!row) throw notFound();
    return mapQuotation(row);
  }

  createDraft(
    inquiryId: string,
    input: QuotationDraftInputDto,
    actorId: string,
  ) {
    const normalized = normalizeDraft(input);
    return this.prisma
      .$transaction(
        async (transaction) => {
          await transaction.$executeRawUnsafe(
            'SELECT pg_advisory_xact_lock(hashtext($1))',
            `quotation:${inquiryId}`,
          );
          const inquiry = await transaction.inquiry.findUnique({
            where: { id: inquiryId },
            select: { id: true, status: true },
          });
          if (!inquiry) throw new NotFoundException('درخواست پیدا نشد.');
          if (
            !(eligibleInquiryStatuses as readonly string[]).includes(
              inquiry.status,
            )
          )
            throw conflict(
              'QUOTATION_INQUIRY_NOT_ELIGIBLE',
              'وضعیت فعلی درخواست برای پیشنهاد قیمت مجاز نیست.',
            );
          const latest = await transaction.quotation.findFirst({
            where: { inquiryId },
            orderBy: { version: 'desc' },
            select: { quotationNumber: true, version: true },
          });
          const row = await transaction.quotation.create({
            data: {
              inquiryId,
              quotationNumber:
                latest?.quotationNumber ?? `TP-${inquiryId.toUpperCase()}`,
              version: (latest?.version ?? 0) + 1,
              createdById: actorId,
              subtotalRials: normalized.calculated.subtotalRials,
              discountRials: normalized.calculated.discountRials,
              taxRials: normalized.calculated.taxRials,
              additionalCostRials: normalized.calculated.additionalCostRials,
              totalRials: normalized.calculated.totalRials,
              validUntil: normalized.validUntil,
              deliveryTerms: normalized.deliveryTerms,
              paymentTerms: normalized.paymentTerms,
              notes: normalized.notes,
              items: { create: itemData(input, normalized.calculated) },
            },
            select: quotationSelect,
          });
          await recordAuditEvent(
            transaction,
            'QUOTATION_DRAFT_CREATED',
            actorId,
            { inquiryId, quotationId: row.id, quotationVersion: row.version },
          );
          return mapQuotation(row);
        },
        { isolationLevel: 'Serializable' },
      )
      .catch((error: unknown) => {
        if (
          typeof error === 'object' &&
          error &&
          'code' in error &&
          error.code === 'P2002'
        )
          throw conflict(
            'QUOTATION_DRAFT_EXISTS',
            'برای این درخواست یک پیش‌نویس فعال وجود دارد.',
          );
        throw error;
      });
  }

  updateDraft(
    inquiryId: string,
    quotationId: string,
    input: QuotationDraftInputDto,
    expectedVersion: number,
    actorId: string,
  ) {
    const normalized = normalizeDraft(input);
    return this.prisma.$transaction(
      async (transaction) => {
        const updated = await transaction.quotation.updateMany({
          where: {
            id: quotationId,
            inquiryId,
            status: 'DRAFT',
            editVersion: expectedVersion,
          },
          data: {
            editVersion: { increment: 1 },
            subtotalRials: normalized.calculated.subtotalRials,
            discountRials: normalized.calculated.discountRials,
            taxRials: normalized.calculated.taxRials,
            additionalCostRials: normalized.calculated.additionalCostRials,
            totalRials: normalized.calculated.totalRials,
            validUntil: normalized.validUntil,
            deliveryTerms: normalized.deliveryTerms,
            paymentTerms: normalized.paymentTerms,
            notes: normalized.notes,
          },
        });
        if (updated.count !== 1) {
          const exists = await transaction.quotation.findFirst({
            where: { id: quotationId, inquiryId },
            select: { id: true },
          });
          if (!exists) throw notFound();
          throw conflict(
            'QUOTATION_VERSION_CONFLICT',
            'این پیش‌نویس توسط شخص دیگری تغییر کرده است.',
          );
        }
        await transaction.quotationItem.deleteMany({ where: { quotationId } });
        await transaction.quotationItem.createMany({
          data: itemData(input, normalized.calculated).map((item) => ({
            ...item,
            quotationId,
          })),
        });
        await recordAuditEvent(
          transaction,
          'QUOTATION_DRAFT_UPDATED',
          actorId,
          {
            inquiryId,
            quotationId,
            fromVersion: expectedVersion,
            toVersion: expectedVersion + 1,
          },
        );
        const row = await transaction.quotation.findUniqueOrThrow({
          where: { id: quotationId },
          select: quotationSelect,
        });
        return mapQuotation(row);
      },
      { isolationLevel: 'Serializable' },
    );
  }

  revise(
    inquiryId: string,
    quotationId: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.prisma
      .$transaction(
        async (transaction) => {
          await transaction.$executeRawUnsafe(
            'SELECT pg_advisory_xact_lock(hashtext($1))',
            `quotation:${inquiryId}`,
          );
          const source = await transaction.quotation.findFirst({
            where: {
              id: quotationId,
              inquiryId,
              status: { in: ['SENT', 'REJECTED'] },
              editVersion: expectedVersion,
            },
            select: quotationSelect,
          });
          if (!source) {
            const exists = await transaction.quotation.findFirst({
              where: { id: quotationId, inquiryId },
              select: { id: true },
            });
            if (!exists) throw notFound();
            throw conflict(
              'QUOTATION_VERSION_CONFLICT',
              'نسخه پیشنهاد قیمت تغییر کرده یا قابل بازبینی نیست.',
            );
          }
          const nextVersion =
            (
              await transaction.quotation.aggregate({
                where: { inquiryId },
                _max: { version: true },
              })
            )._max.version! + 1;
          const row = await transaction.quotation.create({
            data: {
              inquiryId,
              quotationNumber: source.quotationNumber,
              version: nextVersion,
              createdById: actorId,
              subtotalRials: source.subtotalRials,
              discountRials: source.discountRials,
              taxRials: source.taxRials,
              additionalCostRials: source.additionalCostRials,
              totalRials: source.totalRials,
              validUntil: source.validUntil,
              deliveryTerms: source.deliveryTerms,
              paymentTerms: source.paymentTerms,
              notes: source.notes,
              items: {
                create: source.items.map(({ id: _id, ...item }) => item),
              },
            },
            select: quotationSelect,
          });
          await recordAuditEvent(
            transaction,
            'QUOTATION_REVISION_CREATED',
            actorId,
            {
              inquiryId,
              sourceQuotationId: quotationId,
              quotationId: row.id,
              quotationVersion: row.version,
            },
          );
          return mapQuotation(row);
        },
        { isolationLevel: 'Serializable' },
      )
      .catch((error: unknown) => {
        if (
          typeof error === 'object' &&
          error &&
          'code' in error &&
          error.code === 'P2002'
        )
          throw conflict(
            'QUOTATION_DRAFT_EXISTS',
            'برای این درخواست یک پیش‌نویس فعال وجود دارد.',
          );
        throw error;
      });
  }

  send(
    inquiryId: string,
    quotationId: string,
    expectedVersion: number,
    inquiryExpectedVersion: number,
    actorId: string,
  ) {
    return this.prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRawUnsafe(
          'SELECT pg_advisory_xact_lock(hashtext($1))',
          `quotation:${inquiryId}`,
        );
        const inquiry = await transaction.inquiry.findUnique({
          where: { id: inquiryId },
          select: { status: true, version: true },
        });
        if (!inquiry) throw new NotFoundException('درخواست پیدا نشد.');
        if (
          !(eligibleInquiryStatuses as readonly string[]).includes(
            inquiry.status,
          )
        )
          throw conflict(
            'QUOTATION_INQUIRY_NOT_ELIGIBLE',
            'وضعیت فعلی درخواست برای ارسال پیشنهاد قیمت مجاز نیست.',
          );
        const draft = await transaction.quotation.findFirst({
          where: {
            id: quotationId,
            inquiryId,
            status: 'DRAFT',
            editVersion: expectedVersion,
          },
          select: quotationSelect,
        });
        if (!draft) {
          const exists = await transaction.quotation.findFirst({
            where: { id: quotationId, inquiryId },
            select: { id: true },
          });
          if (!exists) throw notFound();
          throw conflict(
            'QUOTATION_VERSION_CONFLICT',
            'نسخه پیش‌نویس تغییر کرده است.',
          );
        }
        if (draft.items.length < 1 || draft.validUntil.getTime() <= Date.now())
          throw new BadRequestException({
            code: 'QUOTATION_INVALID_DRAFT',
            message: 'پیش‌نویس برای ارسال معتبر نیست.',
          });
        const changedInquiry = await transaction.inquiry.updateMany({
          where: {
            id: inquiryId,
            version: inquiryExpectedVersion,
            status: inquiry.status,
          },
          data: { status: 'QUOTED', version: { increment: 1 } },
        });
        if (changedInquiry.count !== 1)
          throw conflict(
            'INQUIRY_VERSION_CONFLICT',
            'درخواست توسط شخص دیگری تغییر کرده است.',
          );
        const now = new Date();
        await transaction.quotation.updateMany({
          where: { inquiryId, status: 'SENT' },
          data: { status: 'SUPERSEDED', supersededAt: now },
        });
        const sent = await transaction.quotation.updateMany({
          where: {
            id: quotationId,
            inquiryId,
            status: 'DRAFT',
            editVersion: expectedVersion,
          },
          data: {
            status: 'SENT',
            sentAt: now,
            sentById: actorId,
            editVersion: { increment: 1 },
          },
        });
        if (sent.count !== 1)
          throw conflict(
            'QUOTATION_VERSION_CONFLICT',
            'نسخه پیش‌نویس تغییر کرده است.',
          );
        if (inquiry.status !== 'QUOTED')
          await transaction.inquiryStatusHistory.create({
            data: {
              inquiryId,
              fromStatus: inquiry.status,
              toStatus: 'QUOTED',
              actorId,
            },
          });
        await recordAuditEvent(transaction, 'QUOTATION_SENT', actorId, {
          inquiryId,
          quotationId,
          quotationVersion: draft.version,
          fromInquiryVersion: inquiryExpectedVersion,
          toInquiryVersion: inquiryExpectedVersion + 1,
        });
        const row = await transaction.quotation.findUniqueOrThrow({
          where: { id: quotationId },
          select: quotationSelect,
        });
        return mapQuotation(row);
      },
      { isolationLevel: 'Serializable' },
    );
  }

  customerList(ownerId: string, inquiryId: string) {
    return this.prisma.quotation
      .findMany({
        where: {
          inquiryId,
          status: { in: ['SENT', 'SUPERSEDED', 'ACCEPTED', 'REJECTED'] },
          inquiry: { ownerId },
        },
        orderBy: { version: 'desc' },
        select: quotationSelect,
      })
      .then((rows) => rows.map(mapCustomerQuotation));
  }

  async customerGet(ownerId: string, inquiryId: string, quotationId: string) {
    const row = await this.prisma.quotation.findFirst({
      where: {
        id: quotationId,
        inquiryId,
        status: { in: ['SENT', 'SUPERSEDED', 'ACCEPTED', 'REJECTED'] },
        inquiry: { ownerId },
      },
      select: quotationSelect,
    });
    if (!row) throw notFound();
    return mapCustomerQuotation(row);
  }

  async customerAccept(
    inquiryId: string,
    quotationId: string,
    quotationVersion: number,
    inquiryExpectedVersion: number,
    customerId: string,
  ) {
    return this.prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRawUnsafe(
          'SELECT pg_advisory_xact_lock(hashtext($1))',
          `quotation:${inquiryId}`,
        );

        const inquiry = await transaction.inquiry.findFirst({
          where: { id: inquiryId, ownerId: customerId },
          select: { id: true, status: true, version: true },
        });
        if (!inquiry) throw notFound();

        const quotation = await transaction.quotation.findFirst({
          where: { id: quotationId, inquiryId },
          select: quotationSelect,
        });
        if (!quotation) throw notFound();

        if (quotation.version !== quotationVersion) {
          throw conflict(
            'QUOTATION_VERSION_CONFLICT',
            'نسخه پیشنهاد قیمت تغییر کرده است.',
          );
        }

        if (quotation.status === 'ACCEPTED') {
          return mapCustomerQuotation(quotation);
        }

        if (quotation.status === 'REJECTED') {
          throw conflict(
            'QUOTATION_ALREADY_ANSWERED',
            'این پیشنهاد قیمت قبلاً پاسخ داده شده است.',
          );
        }

        if (quotation.status !== 'SENT') {
          throw conflict(
            'QUOTATION_NOT_ELIGIBLE',
            'این نسخه پیشنهاد قیمت قابل پاسخ نیست.',
          );
        }

        if (inquiry.status !== 'QUOTED') {
          throw conflict(
            'INQUIRY_NOT_QUOTED',
            'وضعیت درخواست برای پاسخ به پیشنهاد قیمت مناسب نیست.',
          );
        }

        if (inquiry.version !== inquiryExpectedVersion) {
          throw conflict(
            'INQUIRY_VERSION_CONFLICT',
            'درخواست توسط شخص دیگری تغییر کرده است.',
          );
        }

        if (quotation.validUntil.getTime() <= Date.now()) {
          throw conflict(
            'QUOTATION_EXPIRED',
            'مهلت اعتبار این پیشنهاد قیمت به پایان رسیده است.',
          );
        }

        const now = new Date();

        await transaction.quotation.update({
          where: { id: quotationId },
          data: {
            status: 'ACCEPTED',
            respondedById: customerId,
            respondedAt: now,
            editVersion: { increment: 1 },
          },
        });

        await transaction.inquiry.update({
          where: { id: inquiryId },
          data: {
            status: 'ACCEPTED',
            version: { increment: 1 },
          },
        });

        await transaction.inquiryStatusHistory.create({
          data: {
            inquiryId,
            fromStatus: 'QUOTED',
            toStatus: 'ACCEPTED',
            actorId: customerId,
          },
        });

        await recordAuditEvent(transaction, 'QUOTATION_ACCEPTED', customerId, {
          inquiryId,
          quotationId,
          quotationVersion: quotation.version,
          fromInquiryVersion: inquiryExpectedVersion,
          toInquiryVersion: inquiryExpectedVersion + 1,
        });

        const updated = await transaction.quotation.findUniqueOrThrow({
          where: { id: quotationId },
          select: quotationSelect,
        });
        return mapCustomerQuotation(updated);
      },
      { isolationLevel: 'Serializable' },
    );
  }

  async customerReject(
    inquiryId: string,
    quotationId: string,
    quotationVersion: number,
    inquiryExpectedVersion: number,
    reason: string | undefined,
    customerId: string,
  ) {
    return this.prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRawUnsafe(
          'SELECT pg_advisory_xact_lock(hashtext($1))',
          `quotation:${inquiryId}`,
        );

        const inquiry = await transaction.inquiry.findFirst({
          where: { id: inquiryId, ownerId: customerId },
          select: { id: true, status: true, version: true },
        });
        if (!inquiry) throw notFound();

        const quotation = await transaction.quotation.findFirst({
          where: { id: quotationId, inquiryId },
          select: quotationSelect,
        });
        if (!quotation) throw notFound();

        if (quotation.version !== quotationVersion) {
          throw conflict(
            'QUOTATION_VERSION_CONFLICT',
            'نسخه پیشنهاد قیمت تغییر کرده است.',
          );
        }

        if (quotation.status === 'REJECTED') {
          return mapCustomerQuotation(quotation);
        }

        if (quotation.status === 'ACCEPTED') {
          throw conflict(
            'QUOTATION_ALREADY_ANSWERED',
            'این پیشنهاد قیمت قبلاً پاسخ داده شده است.',
          );
        }

        if (quotation.status !== 'SENT') {
          throw conflict(
            'QUOTATION_NOT_ELIGIBLE',
            'این نسخه پیشنهاد قیمت قابل پاسخ نیست.',
          );
        }

        if (inquiry.status !== 'QUOTED') {
          throw conflict(
            'INQUIRY_NOT_QUOTED',
            'وضعیت درخواست برای پاسخ به پیشنهاد قیمت مناسب نیست.',
          );
        }

        if (inquiry.version !== inquiryExpectedVersion) {
          throw conflict(
            'INQUIRY_VERSION_CONFLICT',
            'درخواست توسط شخص دیگری تغییر کرده است.',
          );
        }

        if (quotation.validUntil.getTime() <= Date.now()) {
          throw conflict(
            'QUOTATION_EXPIRED',
            'مهلت اعتبار این پیشنهاد قیمت به پایان رسیده است.',
          );
        }

        const now = new Date();
        const trimmedReason = reason?.trim() ? reason.trim().slice(0, 2000) : null;

        await transaction.quotation.update({
          where: { id: quotationId },
          data: {
            status: 'REJECTED',
            respondedById: customerId,
            respondedAt: now,
            rejectionReason: trimmedReason,
            editVersion: { increment: 1 },
          },
        });

        await transaction.inquiry.update({
          where: { id: inquiryId },
          data: {
            status: 'UNDER_REVIEW',
            version: { increment: 1 },
          },
        });

        await transaction.inquiryStatusHistory.create({
          data: {
            inquiryId,
            fromStatus: 'QUOTED',
            toStatus: 'UNDER_REVIEW',
            actorId: customerId,
          },
        });

        await recordAuditEvent(transaction, 'QUOTATION_REJECTED', customerId, {
          inquiryId,
          quotationId,
          quotationVersion: quotation.version,
          fromInquiryVersion: inquiryExpectedVersion,
          toInquiryVersion: inquiryExpectedVersion + 1,
        });

        const updated = await transaction.quotation.findUniqueOrThrow({
          where: { id: quotationId },
          select: quotationSelect,
        });
        return mapCustomerQuotation(updated);
      },
      { isolationLevel: 'Serializable' },
    );
  }

  async pdfRowForStaff(
    inquiryId: string,
    quotationId: string,
  ): Promise<QuotationRow> {
    const row = await this.prisma.quotation.findFirst({
      where: {
        id: quotationId,
        inquiryId,
        status: { in: ['SENT', 'SUPERSEDED', 'ACCEPTED', 'REJECTED'] },
      },
      select: quotationSelect,
    });
    if (!row) throw notFound();
    return row;
  }

  async pdfRowForCustomer(
    ownerId: string,
    inquiryId: string,
    quotationId: string,
  ): Promise<QuotationRow> {
    const row = await this.prisma.quotation.findFirst({
      where: {
        id: quotationId,
        inquiryId,
        status: { in: ['SENT', 'SUPERSEDED', 'ACCEPTED', 'REJECTED'] },
        inquiry: { ownerId },
      },
      select: quotationSelect,
    });
    if (!row) throw notFound();
    return row;
  }
}
