import type { Prisma } from '../generated/prisma/client.js';
import type { CustomerQuotationDto, QuotationDto } from './quotation.types.js';

export const quotationSelect = {
  id: true,
  inquiryId: true,
  quotationNumber: true,
  version: true,
  editVersion: true,
  status: true,
  subtotalRials: true,
  discountRials: true,
  taxRials: true,
  additionalCostRials: true,
  totalRials: true,
  validUntil: true,
  deliveryTerms: true,
  paymentTerms: true,
  notes: true,
  sentAt: true,
  respondedAt: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
  items: {
    orderBy: { position: 'asc' as const },
    select: {
      id: true,
      position: true,
      description: true,
      quantity: true,
      unit: true,
      unitPriceRials: true,
      lineTotalRials: true,
    },
  },
} satisfies Prisma.QuotationSelect;

export type QuotationRow = Prisma.QuotationGetPayload<{
  select: typeof quotationSelect;
}>;

export function mapQuotation(row: QuotationRow): QuotationDto {
  return {
    id: row.id,
    inquiryId: row.inquiryId,
    quotationNumber: row.quotationNumber,
    version: row.version,
    editVersion: row.editVersion,
    status: row.status,
    items: row.items.map((item) => ({
      ...item,
      unitPriceRials: item.unitPriceRials.toString(),
      lineTotalRials: item.lineTotalRials.toString(),
    })),
    subtotalRials: row.subtotalRials.toString(),
    discountRials: row.discountRials.toString(),
    taxRials: row.taxRials.toString(),
    additionalCostRials: row.additionalCostRials.toString(),
    totalRials: row.totalRials.toString(),
    validUntil: row.validUntil.toISOString(),
    deliveryTerms: row.deliveryTerms,
    paymentTerms: row.paymentTerms,
    notes: row.notes,
    sentAt: row.sentAt?.toISOString() ?? null,
    respondedAt: row.respondedAt?.toISOString() ?? null,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapCustomerQuotation(row: QuotationRow): CustomerQuotationDto {
  const { editVersion: _editVersion, ...safe } = mapQuotation(row);
  return safe;
}
