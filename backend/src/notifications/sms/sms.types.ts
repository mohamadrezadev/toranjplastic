export type SmsTemplateKind =
  | 'INQUIRY_CREATED_ADMIN'
  | 'QUOTATION_ISSUED_CUSTOMER'
  | 'INQUIRY_MESSAGE_CUSTOMER';

export interface SmsSendPayload {
  to: string;
  template: SmsTemplateKind;
  tokens: Record<string, string>;
}

export interface SmsReceipt {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SmsProvider {
  send(payload: SmsSendPayload): Promise<SmsReceipt>;
}

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');

export function normalizeIranMobile(phone: string): string | null {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+989') && cleaned.length === 13) {
    return '0' + cleaned.slice(3);
  }
  if (cleaned.startsWith('00989') && cleaned.length === 14) {
    return '0' + cleaned.slice(4);
  }
  if (cleaned.startsWith('989') && cleaned.length === 12) {
    return '0' + cleaned.slice(2);
  }
  if (cleaned.startsWith('09') && cleaned.length === 11) {
    return cleaned;
  }
  if (cleaned.startsWith('9') && cleaned.length === 10) {
    return '0' + cleaned;
  }
  return null;
}

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return '***';
  return phone.slice(0, 4) + '***' + phone.slice(-3);
}
