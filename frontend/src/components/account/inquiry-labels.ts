import type { StatusBadgeTone } from "@/components/ui";

/* Approved Persian labels for customer-visible inquiry types and statuses. */
export const inquiryTypeLabel: Record<string, string> = {
  PRODUCT: "استعلام محصول",
  INJECTION_SERVICE: "خدمات تزریق",
  MATERIAL: "مواد اولیه",
  GENERAL_CONTACT: "تماس عمومی",
};

export const inquiryStatusLabel: Record<string, string> = {
  SUBMITTED: "ثبت‌شده",
  UNDER_REVIEW: "در حال بررسی",
  NEED_MORE_INFO: "نیازمند اطلاعات",
  QUOTED: "پیشنهاد ارسال‌شده",
  ACCEPTED: "پذیرفته‌شده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل‌شده",
  REJECTED: "ردشده",
  CANCELLED: "لغوشده",
};

/** Status colour roles; the label stays the meaning, so colour is never the only signal. */
export function inquiryStatusTone(status: string): StatusBadgeTone {
  if (status === "COMPLETED" || status === "ACCEPTED") return "success";
  if (status === "NEED_MORE_INFO" || status === "UNDER_REVIEW" || status === "IN_PROGRESS") return "warning";
  if (status === "REJECTED" || status === "CANCELLED") return "error";
  return "info";
}

export const formatInquiryDate = (value: string) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
export const formatInquiryDay = (value: string) => new Intl.DateTimeFormat("fa-IR").format(new Date(value));
