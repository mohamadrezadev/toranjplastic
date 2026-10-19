import { describe, expect, it } from "vitest";
import {
  formatQuotationDate,
  quotationIsoToTehranLocal,
  quotationTehranLocalToIso,
} from "./quotation-date";

describe("quotation dates", () => {
  it("round-trips an Iran wall-clock value through an explicit UTC instant", () => {
    expect(quotationTehranLocalToIso("2026-10-19T14:30")).toBe(
      "2026-10-19T11:00:00.000Z",
    );
    expect(quotationIsoToTehranLocal("2026-10-19T11:00:00.000Z")).toBe(
      "2026-10-19T14:30",
    );
  });

  it("rejects impossible local values", () => {
    expect(() => quotationTehranLocalToIso("2026-02-30T10:00")).toThrow(
      "QUOTATION_INVALID_VALID_UNTIL",
    );
    expect(() => quotationTehranLocalToIso("not-a-date")).toThrow(
      "QUOTATION_INVALID_VALID_UNTIL",
    );
  });

  it("formats the stored instant as a Persian date in Tehran", () => {
    expect(formatQuotationDate("2026-10-19T21:00:00.000Z")).toContain("۲۸");
  });
});
