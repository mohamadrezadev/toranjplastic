import type { InquiryStatus, InquiryType } from '../../generated/prisma/enums.js';

export function allowedInquiryTransitions(type: InquiryType, status: InquiryStatus): InquiryStatus[] {
  if (status === 'SUBMITTED') return ['UNDER_REVIEW', 'REJECTED'];
  if (status === 'UNDER_REVIEW') return type === 'GENERAL_CONTACT' ? ['COMPLETED', 'REJECTED'] : ['REJECTED'];
  return [];
}

export function canTransitionInquiry(type: InquiryType, from: InquiryStatus, to: InquiryStatus): boolean {
  return allowedInquiryTransitions(type, from).includes(to);
}
