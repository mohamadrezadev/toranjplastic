import { describe, expect, it } from "vitest";
import { inquiryStatuses, inquiryStatusLabels } from "./states";

describe("inquiry status registry", () => {
  it("keeps the nine PRD-approved statuses and a Persian label for each", () => {
    expect(inquiryStatuses).toHaveLength(9);
    expect(Object.keys(inquiryStatusLabels)).toEqual([...inquiryStatuses]);
    expect(Object.values(inquiryStatusLabels).every(Boolean)).toBe(true);
  });
});
