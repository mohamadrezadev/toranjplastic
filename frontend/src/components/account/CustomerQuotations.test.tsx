import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CustomerQuotations } from "./CustomerQuotations";

const quotation = {
  id: "q1",
  inquiryId: "i1",
  quotationNumber: "TP-I1",
  version: 1,
  status: "SENT" as const,
  items: [
    {
      id: "qi1",
      position: 1,
      description: "قطعه نمونه",
      quantity: "2",
      unit: "عدد",
      unitPriceRials: "1000",
      lineTotalRials: "2000",
    },
  ],
  subtotalRials: "2000",
  discountRials: "0",
  taxRials: "0",
  additionalCostRials: "0",
  totalRials: "2000",
  validUntil: "2026-11-17T00:00:00.000Z",
  deliveryTerms: "تحویل توافقی",
  paymentTerms: "پرداخت توافقی",
  notes: null,
  sentAt: "2026-10-17T00:00:00.000Z",
  createdAt: "2026-10-17T00:00:00.000Z",
  updatedAt: "2026-10-17T00:00:00.000Z",
};

describe("CustomerQuotations", () => {
  it("renders the sent snapshot and authenticated PDF destination without commerce claims", () => {
    render(<CustomerQuotations inquiryId="i1" quotations={[quotation]} />);
    expect(screen.getByText("قطعه نمونه — 2 عدد")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "دریافت PDF خصوصی این نسخه" }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining("/inquiries/i1/quotations/q1/pdf"),
    );
    expect(
      screen.queryByText(/خرید|پرداخت آنلاین|موجودی/),
    ).not.toBeInTheDocument();
  });
  it("renders a neutral no-commitment empty state", () => {
    render(<CustomerQuotations inquiryId="i1" quotations={[]} />);
    expect(
      screen.getByText(/به معنی قیمت، موجودی یا زمان تحویل قطعی نیست/),
    ).toBeInTheDocument();
  });

  it("renders accept and reject actions when quotation is SENT and inquiry is QUOTED", () => {
    const accept = () => {};
    const reject = () => {};
    render(
      <CustomerQuotations
        inquiryId="i1"
        inquiryVersion={1}
        inquiryStatus="QUOTED"
        quotations={[quotation]}
        acceptAction={accept}
        rejectAction={reject}
      />,
    );
    expect(
      screen.getByRole("button", { name: "تأیید و پذیرش پیشنهاد قیمت" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("رد این پیشنهاد و درخواست اصلاح"),
    ).toBeInTheDocument();
  });

  it("renders accepted notice when quotation is ACCEPTED", () => {
    const acceptedQuotation = {
      ...quotation,
      status: "ACCEPTED" as const,
      respondedAt: "2026-10-18T00:00:00.000Z",
    };
    render(
      <CustomerQuotations
        inquiryId="i1"
        inquiryVersion={2}
        inquiryStatus="ACCEPTED"
        quotations={[acceptedQuotation]}
      />,
    );
    expect(
      screen.getByText(/این پیشنهاد قیمت در تاریخ .* توسط شما پذیرفته شد/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "تأیید و پذیرش پیشنهاد قیمت" }),
    ).not.toBeInTheDocument();
  });

  it("renders rejected notice and reason when quotation is REJECTED", () => {
    const rejectedQuotation = {
      ...quotation,
      status: "REJECTED" as const,
      respondedAt: "2026-10-18T00:00:00.000Z",
      rejectionReason: "قیمت مد نظر کمتر بود",
    };
    render(
      <CustomerQuotations
        inquiryId="i1"
        inquiryVersion={2}
        inquiryStatus="UNDER_REVIEW"
        quotations={[rejectedQuotation]}
      />,
    );
    expect(
      screen.getByText(/این پیشنهاد قیمت در تاریخ .* توسط شما رد شد/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("علت: قیمت مد نظر کمتر بود"),
    ).toBeInTheDocument();
  });

  it("renders expired notice when validUntil is in the past", () => {
    const expiredQuotation = {
      ...quotation,
      validUntil: "2020-01-01T00:00:00.000Z",
    };
    render(
      <CustomerQuotations
        inquiryId="i1"
        inquiryVersion={1}
        inquiryStatus="QUOTED"
        quotations={[expiredQuotation]}
        now={Date.parse("2026-10-18T00:00:00.000Z")}
      />,
    );
    expect(
      screen.getByText("مهلت اعتبار این پیشنهاد قیمت به پایان رسیده است."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "تأیید و پذیرش پیشنهاد قیمت" }),
    ).not.toBeInTheDocument();
  });
});
