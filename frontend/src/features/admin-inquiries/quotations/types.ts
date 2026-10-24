export interface QuotationItem {
  id: string;
  position: number;
  description: string;
  quantity: string;
  unit: string;
  unitPriceRials: string;
  lineTotalRials: string;
}
export interface Quotation {
  id: string;
  inquiryId: string;
  quotationNumber: string;
  version: number;
  editVersion: number;
  status: "DRAFT" | "SENT" | "SUPERSEDED" | "ACCEPTED" | "REJECTED";
  items: QuotationItem[];
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
  respondedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface QuotationDraftInput {
  items: Array<Omit<QuotationItem, "id" | "position">>;
  subtotalRials: string;
  discountRials: string;
  taxRials: string;
  additionalCostRials: string;
  totalRials: string;
  validUntil: string;
  deliveryTerms: string;
  paymentTerms: string;
  notes?: string;
}
