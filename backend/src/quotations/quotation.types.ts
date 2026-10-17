export type QuotationStatusDto = 'DRAFT' | 'SENT' | 'SUPERSEDED';

export interface QuotationItemDto {
  id: string;
  position: number;
  description: string;
  quantity: string;
  unit: string;
  unitPriceRials: string;
  lineTotalRials: string;
}

export interface QuotationDto {
  id: string;
  inquiryId: string;
  quotationNumber: string;
  version: number;
  editVersion: number;
  status: QuotationStatusDto;
  items: QuotationItemDto[];
  subtotalRials: string;
  discountRials: string;
  taxRials: string;
  additionalCostRials: string;
  totalRials: string;
  validUntil: string;
  deliveryTerms: string;
  paymentTerms: string;
  notes: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CustomerQuotationDto = Omit<QuotationDto, 'editVersion'>;
