import { describe, expect, it } from 'vitest';
import { QuotationPdfService } from './quotation-pdf.service.js';
import type { QuotationRow } from './quotation.mapper.js';

const now = new Date('2026-10-17T00:00:00.000Z');
const row: QuotationRow = {
  id: 'q1',
  inquiryId: 'i1',
  quotationNumber: 'TP-I1',
  version: 1,
  editVersion: 1,
  status: 'SENT',
  subtotalRials: 2500n,
  discountRials: 100n,
  taxRials: 240n,
  additionalCostRials: 60n,
  totalRials: 2700n,
  validUntil: new Date('2026-11-17T00:00:00.000Z'),
  deliveryTerms: 'تحویل پس از تأیید',
  paymentTerms: 'پرداخت طبق توافق',
  notes: 'نمونه فارسی',
  sentAt: now,
  createdAt: now,
  updatedAt: now,
  items: [
    {
      id: 'qi1',
      position: 1,
      description: 'قطعه پلاستیکی',
      quantity: '2.500',
      unit: 'عدد',
      unitPriceRials: 1000n,
      lineTotalRials: 2500n,
    },
  ],
};

describe('QuotationPdfService', () => {
  it('renders a bounded valid PDF from the immutable Persian snapshot', async () => {
    const buffer = await new QuotationPdfService().render(row);
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.length).toBeLessThan(1_000_000);
  });
});
