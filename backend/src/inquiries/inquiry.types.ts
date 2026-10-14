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

export interface AdminAccountSummary {
  id: string;
  displayName: string;
  mobile: string;
}

export interface AdminInquiryListItem {
  id: string;
  type: InquiryType;
  status: InquiryStatus;
  version: number;
  catalogItemName: string | null;
  createdAt: string;
  updatedAt: string;
  ownerSummary: AdminAccountSummary & { companyName: string | null };
  assigneeSummary: AdminAccountSummary | null;
}

export interface AdminInquiryHistoryItem extends InquiryHistoryItem {
  actorSummary: Pick<AdminAccountSummary, 'id' | 'displayName'>;
}

export interface AdminInquiryAssignmentItem {
  id: string;
  fromAdminSummary: Pick<AdminAccountSummary, 'id' | 'displayName'> | null;
  toAdminSummary: Pick<AdminAccountSummary, 'id' | 'displayName'> | null;
  actorSummary: Pick<AdminAccountSummary, 'id' | 'displayName'>;
  createdAt: string;
}

export interface AdminInquiryNote {
  id: string;
  text: string;
  authorSummary: Pick<AdminAccountSummary, 'id' | 'displayName'>;
  createdAt: string;
}

export interface AdminInquiry extends Omit<CustomerInquiry, 'statusHistory'> {
  version: number;
  ownerSummary: AdminAccountSummary & { companyName: string | null };
  assigneeSummary: AdminAccountSummary | null;
  statusHistory: AdminInquiryHistoryItem[];
  assignmentHistory: AdminInquiryAssignmentItem[];
  internalNotes: AdminInquiryNote[];
  allowedTransitions: InquiryStatus[];
}

export interface AdminInquiryListQuery {
  page: number;
  pageSize: number;
  type?: InquiryType;
  status?: InquiryStatus;
  assignedAdminId?: string;
  unassigned?: boolean;
  from?: Date;
  to?: Date;
  q?: string;
}

export interface AdminInquiryPage {
  items: AdminInquiryListItem[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface AdminInquirySummary {
  total: number;
  unassigned: number;
  submitted: number;
  underReview: number;
}

export type AdminMutationResult =
  | { kind: 'ok'; inquiry: AdminInquiry }
  | { kind: 'not_found' }
  | { kind: 'version_conflict' }
  | { kind: 'invalid_assignee' };
