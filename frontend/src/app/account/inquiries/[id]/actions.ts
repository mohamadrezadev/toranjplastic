"use server";

import { redirect } from "next/navigation";
import { addInquiryMessage } from "@/lib/inquiries";
import {
  acceptCustomerQuotation,
  CustomerQuotationApiError,
  rejectCustomerQuotation,
} from "@/lib/customer-quotations";

export async function addCustomerInquiryMessageAction(id: string, form: FormData) {
  const text = String(form.get("text") ?? "").trim();
  try { await addInquiryMessage(id, text); } catch { redirect(`/account/inquiries/${id}?error=message`); }
  redirect(`/account/inquiries/${id}?success=message`);
}

export async function acceptCustomerQuotationAction(
  inquiryId: string,
  quotationId: string,
  form: FormData,
) {
  const quotationVersion = Number(form.get("quotationVersion"));
  const inquiryExpectedVersion = Number(form.get("inquiryExpectedVersion"));
  try {
    await acceptCustomerQuotation(
      inquiryId,
      quotationId,
      quotationVersion,
      inquiryExpectedVersion,
    );
  } catch (error) {
    if (error instanceof CustomerQuotationApiError && error.status === 409) {
      redirect(`/account/inquiries/${inquiryId}?conflict=quotation`);
    }
    redirect(`/account/inquiries/${inquiryId}?error=accept`);
  }
  redirect(`/account/inquiries/${inquiryId}?success=accepted`);
}

export async function rejectCustomerQuotationAction(
  inquiryId: string,
  quotationId: string,
  form: FormData,
) {
  const quotationVersion = Number(form.get("quotationVersion"));
  const inquiryExpectedVersion = Number(form.get("inquiryExpectedVersion"));
  const reason = String(form.get("reason") ?? "").trim() || undefined;
  try {
    await rejectCustomerQuotation(
      inquiryId,
      quotationId,
      quotationVersion,
      inquiryExpectedVersion,
      reason,
    );
  } catch (error) {
    if (error instanceof CustomerQuotationApiError && error.status === 409) {
      redirect(`/account/inquiries/${inquiryId}?conflict=quotation`);
    }
    redirect(`/account/inquiries/${inquiryId}?error=reject`);
  }
  redirect(`/account/inquiries/${inquiryId}?success=rejected`);
}
