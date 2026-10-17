"use server";

import { redirect } from "next/navigation";
import { addInquiryMessage } from "@/lib/inquiries";

export async function addCustomerInquiryMessageAction(id: string, form: FormData) {
  const text = String(form.get("text") ?? "").trim();
  try { await addInquiryMessage(id, text); } catch { redirect(`/account/inquiries/${id}?error=message`); }
  redirect(`/account/inquiries/${id}?success=message`);
}
