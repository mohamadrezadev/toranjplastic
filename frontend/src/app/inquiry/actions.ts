"use server";
import { redirect } from "next/navigation";
import { getAccountAccess } from "@/lib/auth";
import { createInquiry, InquiryApiError } from "@/lib/inquiries";

export interface InquiryFormState { error?: string }
const value = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const optional = (form: FormData, name: string, target: Record<string,string>) => { const current = value(form, name); if (current) target[name] = current; };

export async function createInquiryAction(_state: InquiryFormState, form: FormData): Promise<InquiryFormState> {
  const access = await getAccountAccess();
  if (access.status === 401) redirect("/auth/login?next=/inquiry");
  const kind = value(form, "kind");
  const payload: Record<string,string> = {};
  const allowed: Record<string,string[]> = {
    product: ["productId", "approximateQuantity", "description", "deliveryCity", "requestedTiming"],
    injection: ["injectionServiceId", "partDescription", "approximateQuantity", "moldStatus", "materialName", "color", "deliveryCity", "requestedTiming", "description"],
    material: ["materialId", "materialRequestKind", "polymerName", "grade", "brand", "materialCondition", "approximateQuantity", "quantityUnit", "application", "specifications", "color", "deliveryCity", "requestedTiming", "description"],
    contact: ["description"],
  };
  for (const name of allowed[kind] ?? []) optional(form, name, payload);
  try {
    const created = await createInquiry(kind, payload);
    redirect(`/account/inquiries/${created.id}?created=1`);
  } catch (error) {
    if (error instanceof InquiryApiError) return { error: error.status === 400 ? "اطلاعات فرم کامل یا معتبر نیست. لطفاً فیلدهای ضروری را بررسی کنید." : "ثبت درخواست فعلاً ممکن نیست. کمی بعد دوباره تلاش کنید." };
    throw error;
  }
}
