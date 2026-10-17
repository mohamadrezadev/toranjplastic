import { describe, expect, it } from "vitest";
import { isAdminInquiry, isAdminInquiryPage, isAdminInquirySummary } from "./contracts";
import { assignmentInputFromForm, noteInputFromForm, statusInputFromForm } from "./form-mapping";
import { inquiryQuery } from "./query";

const listItem = { id: "i1", type: "PRODUCT", status: "SUBMITTED", version: 0, catalogItemName: "محصول", createdAt: "2026-10-14T00:00:00.000Z", updatedAt: "2026-10-14T00:00:00.000Z", ownerSummary: { id: "c1", displayName: "مشتری", mobile: "+989121234567", companyName: null }, assigneeSummary: null };

describe("admin inquiry contracts", () => {
  it("accepts explicit list/summary/detail shapes and rejects missing operational arrays", () => {
    expect(isAdminInquiryPage({ items: [listItem], page: 1, pageSize: 20, total: 1, pageCount: 1 })).toBe(true);
    expect(isAdminInquirySummary({ total: 1, unassigned: 1, submitted: 1, underReview: 0 })).toBe(true);
    const detail = { ...listItem, description: null, approximateQuantity: null, quantityUnit: null, deliveryCity: null, requestedTiming: null, partDescription: null, moldStatus: null, materialName: null, color: null, polymerName: null, grade: null, brand: null, application: null, specifications: null, allowedTransitions: ["UNDER_REVIEW"], statusHistory: [], assignmentHistory: [], internalNotes: [], messages: [] };
    expect(isAdminInquiry(detail)).toBe(true);
    expect(isAdminInquiry({ ...detail, internalNotes: undefined })).toBe(false);
  });

  it("serializes bounded URL filters", () => {
    const query = inquiryQuery({ page: 2, q: "TRJ", status: "SUBMITTED", unassigned: true, from: "2026-10-01", to: "2026-11-01" });
    expect(query.get("page")).toBe("2");
    expect(query.get("pageSize")).toBe("20");
    expect(query.get("unassigned")).toBe("true");
    expect(query.get("q")).toBe("TRJ");
  });
});

describe("admin inquiry form mapping", () => {
  it("trims note and maps versioned status and assignment inputs", () => {
    const status = new FormData(); status.set("toStatus", "UNDER_REVIEW"); status.set("expectedVersion", "3");
    expect(statusInputFromForm(status)).toEqual({ toStatus: "UNDER_REVIEW", expectedVersion: 3 });
    const assignment = new FormData(); assignment.set("assignedAdminId", ""); assignment.set("expectedVersion", "4");
    expect(assignmentInputFromForm(assignment)).toEqual({ assignedAdminId: null, expectedVersion: 4 });
    const note = new FormData(); note.set("text", "  محرمانه  ");
    expect(noteInputFromForm(note)).toEqual({ text: "محرمانه" });
  });
});
