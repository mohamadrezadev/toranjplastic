export const inquiryStatuses = [
  "Submitted", "UnderReview", "NeedMoreInfo", "Quoted", "Accepted",
  "InProgress", "Completed", "Rejected", "Cancelled",
] as const;

export type InquiryStatus = (typeof inquiryStatuses)[number];

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  Submitted: "ثبت‌شده",
  UnderReview: "در حال بررسی",
  NeedMoreInfo: "نیازمند اطلاعات بیشتر",
  Quoted: "پیشنهاد قیمت ارسال‌شده",
  Accepted: "پذیرفته‌شده",
  InProgress: "در حال انجام",
  Completed: "تکمیل‌شده",
  Rejected: "ردشده",
  Cancelled: "لغوشده",
};
