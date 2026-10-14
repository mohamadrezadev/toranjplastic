import type { InquiryStatus, InquiryType } from "./types";

export const inquiryStatusLabels: Record<InquiryStatus, string> = { SUBMITTED: "ثبت‌شده", UNDER_REVIEW: "در حال بررسی", NEED_MORE_INFO: "نیازمند اطلاعات", QUOTED: "پیشنهاد ارسال‌شده", ACCEPTED: "پذیرفته‌شده", IN_PROGRESS: "در حال انجام", COMPLETED: "تکمیل‌شده", REJECTED: "ردشده", CANCELLED: "لغوشده" };
export const inquiryTypeLabels: Record<InquiryType, string> = { PRODUCT: "محصول", INJECTION_SERVICE: "خدمات تزریق", MATERIAL: "مواد اولیه", GENERAL_CONTACT: "تماس عمومی" };
