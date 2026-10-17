import { describe, expect, it } from "vitest";
import { isCustomerInquiry, isCustomerInquiryDetail } from "./inquiries";

describe("customer inquiry response guard", () => {
  const inquiry = { id: "i1", type: "PRODUCT", status: "SUBMITTED", catalogItemName: "ظرف", description: null, approximateQuantity: null, quantityUnit: null, deliveryCity: null, requestedTiming: null, partDescription: null, moldStatus: null, materialName: null, color: null, materialRequestKind: null, polymerName: null, grade: null, brand: null, materialCondition: null, application: null, specifications: null, createdAt: "2026-10-12T00:00:00.000Z", updatedAt: "2026-10-12T00:00:00.000Z", statusHistory: [{ id: "h1", fromStatus: null, toStatus: "SUBMITTED", createdAt: "2026-10-12T00:00:00.000Z" }] };
  it("accepts the explicit customer DTO", () => expect(isCustomerInquiry(inquiry)).toBe(true));
  it("requires an explicit safe thread for detail", () => {
    expect(isCustomerInquiryDetail({ ...inquiry, messages: [] })).toBe(true);
    expect(isCustomerInquiryDetail({ ...inquiry, messages: [{ id: "m1", senderType: "STAFF", text: "پاسخ", authorDisplayName: "کارشناس", createdAt: inquiry.createdAt }] })).toBe(true);
  });
  it("rejects unknown status and malformed history", () => {
    expect(isCustomerInquiry({ ...inquiry, status: "NEW" })).toBe(false);
    expect(isCustomerInquiry({ ...inquiry, statusHistory: [{ internalNote: "secret" }] })).toBe(false);
  });
});
