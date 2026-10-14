import { inquiryStatuses, inquiryTypes, type AdminAccountSummary, type AdminInquiry, type AdminInquiryListItem, type AdminInquiryPage, type AdminInquirySummary, type InquiryStatus, type InquiryType } from "./types";

export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isNullableString = (value: unknown) => value === null || isString(value);
const isAccount = (value: unknown): value is AdminAccountSummary => isRecord(value) && isString(value.id) && isString(value.displayName) && isString(value.mobile);
const isType = (value: unknown): value is InquiryType => inquiryTypes.includes(value as InquiryType);
const isStatus = (value: unknown): value is InquiryStatus => inquiryStatuses.includes(value as InquiryStatus);

export function isAdminInquiryListItem(value: unknown): value is AdminInquiryListItem {
  return isRecord(value) && isString(value.id) && isType(value.type) && isStatus(value.status) && typeof value.version === "number" && isNullableString(value.catalogItemName) && isString(value.createdAt) && isString(value.updatedAt) && isAccount(value.ownerSummary) && isRecord(value.ownerSummary) && isNullableString(value.ownerSummary.companyName) && (value.assigneeSummary === null || isAccount(value.assigneeSummary));
}

export function isAdminInquiryPage(value: unknown): value is AdminInquiryPage {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isAdminInquiryListItem) && [value.page, value.pageSize, value.total, value.pageCount].every((item) => typeof item === "number");
}

export function isAdminInquirySummary(value: unknown): value is AdminInquirySummary {
  return isRecord(value) && [value.total, value.unassigned, value.submitted, value.underReview].every((item) => typeof item === "number");
}

export function isAssignees(value: unknown): value is AdminAccountSummary[] { return Array.isArray(value) && value.every(isAccount); }

export function isAdminInquiry(value: unknown): value is AdminInquiry {
  if (!isAdminInquiryListItem(value) || !isRecord(value)) return false;
  const nullable = ["description", "approximateQuantity", "quantityUnit", "deliveryCity", "requestedTiming", "partDescription", "moldStatus", "materialName", "color", "polymerName", "grade", "brand", "application", "specifications"];
  return nullable.every((key) => isNullableString(value[key])) && Array.isArray(value.allowedTransitions) && value.allowedTransitions.every(isStatus) && Array.isArray(value.statusHistory) && Array.isArray(value.assignmentHistory) && Array.isArray(value.internalNotes);
}
