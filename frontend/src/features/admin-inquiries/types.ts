export const inquiryTypes = ["PRODUCT", "INJECTION_SERVICE", "MATERIAL", "GENERAL_CONTACT"] as const;
export const inquiryStatuses = ["SUBMITTED", "UNDER_REVIEW", "NEED_MORE_INFO", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"] as const;
export type InquiryType = (typeof inquiryTypes)[number];
export type InquiryStatus = (typeof inquiryStatuses)[number];

export interface AdminAccountSummary { id: string; displayName: string; mobile: string }
export interface AdminInquiryListItem {
  id: string; type: InquiryType; status: InquiryStatus; version: number; catalogItemName: string | null;
  createdAt: string; updatedAt: string;
  ownerSummary: AdminAccountSummary & { companyName: string | null };
  assigneeSummary: AdminAccountSummary | null;
}
export interface AdminInquiryPage { items: AdminInquiryListItem[]; page: number; pageSize: number; total: number; pageCount: number }
export interface AdminInquirySummary { total: number; unassigned: number; submitted: number; underReview: number }
export interface InquiryMessage { id: string; senderType: "CUSTOMER" | "STAFF"; authorDisplayName: string; text: string; createdAt: string }
export interface AdminInquiry extends AdminInquiryListItem {
  description: string | null; approximateQuantity: string | null; quantityUnit: string | null;
  deliveryCity: string | null; requestedTiming: string | null; partDescription: string | null;
  moldStatus: string | null; materialName: string | null; color: string | null;
  materialRequestKind: "PRICE_QUOTE" | "SUPPLY_REQUEST" | "AVAILABILITY_REVIEW" | null;
  polymerName: string | null; grade: string | null; brand: string | null;
  materialCondition: "NEW" | "RECYCLED" | null; application: string | null; specifications: string | null;
  allowedTransitions: InquiryStatus[];
  statusHistory: Array<{ id: string; fromStatus: InquiryStatus | null; toStatus: InquiryStatus; createdAt: string; actorSummary: { id: string; displayName: string } }>;
  assignmentHistory: Array<{ id: string; fromAdminSummary: { id: string; displayName: string } | null; toAdminSummary: { id: string; displayName: string } | null; actorSummary: { id: string; displayName: string }; createdAt: string }>;
  internalNotes: Array<{ id: string; text: string; authorSummary: { id: string; displayName: string }; createdAt: string }>;
  messages: InquiryMessage[];
}
export interface AdminInquiryFilters {
  page?: number; pageSize?: number; type?: string; status?: string; assignedAdminId?: string;
  unassigned?: boolean; from?: string; to?: string; q?: string;
}
