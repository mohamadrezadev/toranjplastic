import type { InquiryStatus, InquiryType, MaterialCondition, MaterialRequestKind } from '../generated/prisma/enums.js';

export interface InquiryHistoryItem {
  id: string;
  fromStatus: InquiryStatus | null;
  toStatus: InquiryStatus;
  createdAt: string;
}

export interface CustomerInquiry {
  id: string;
  type: InquiryType;
  status: InquiryStatus;
  catalogItemName: string | null;
  description: string | null;
  approximateQuantity: string | null;
  quantityUnit: string | null;
  deliveryCity: string | null;
  requestedTiming: string | null;
  partDescription: string | null;
  moldStatus: string | null;
  materialName: string | null;
  color: string | null;
  materialRequestKind: MaterialRequestKind | null;
  polymerName: string | null;
  grade: string | null;
  brand: string | null;
  materialCondition: MaterialCondition | null;
  application: string | null;
  specifications: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: InquiryHistoryItem[];
}

export interface InquiryCreateInput {
  type: InquiryType;
  productId?: string;
  injectionServiceId?: string;
  materialId?: string;
  catalogItemName?: string;
  description?: string;
  approximateQuantity?: string;
  quantityUnit?: string;
  deliveryCity?: string;
  requestedTiming?: string;
  partDescription?: string;
  moldStatus?: string;
  materialName?: string;
  color?: string;
  materialRequestKind?: MaterialRequestKind;
  polymerName?: string;
  grade?: string;
  brand?: string;
  materialCondition?: MaterialCondition;
  application?: string;
  specifications?: string;
}

export interface InquiryListQuery {
  page: number;
  pageSize: number;
  type?: InquiryType;
  status?: InquiryStatus;
}

export interface InquiryPage {
  items: CustomerInquiry[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}
