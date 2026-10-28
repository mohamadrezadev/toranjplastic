import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotificationService } from './notifications.service.js';
import { MockSmsProvider } from './sms/mock-sms.provider.js';
import { normalizeIranMobile, maskPhone } from './sms/sms.types.js';

describe('NotificationService & SMS utilities', () => {
  let provider: MockSmsProvider;
  let service: NotificationService;

  beforeEach(() => {
    provider = new MockSmsProvider();
    service = new NotificationService(provider);
  });

  describe('phone normalization and masking', () => {
    it('normalizes various valid Iranian mobile formats to 09XXXXXXXXX', () => {
      expect(normalizeIranMobile('09121234567')).toBe('09121234567');
      expect(normalizeIranMobile('+989121234567')).toBe('09121234567');
      expect(normalizeIranMobile('00989121234567')).toBe('09121234567');
      expect(normalizeIranMobile('989121234567')).toBe('09121234567');
      expect(normalizeIranMobile('9121234567')).toBe('09121234567');
    });

    it('rejects invalid or foreign mobile numbers gracefully', () => {
      expect(normalizeIranMobile('12345')).toBeNull();
      expect(normalizeIranMobile('+12345678901')).toBeNull();
      expect(normalizeIranMobile('02188888888')).toBeNull();
    });

    it('masks phone numbers for audit-safe logging', () => {
      expect(maskPhone('09121234567')).toBe('0912***567');
      expect(maskPhone('0910')).toBe('***');
    });
  });

  describe('inquiry creation notification', () => {
    it('dispatches admin SMS when inquiry is created', async () => {
      await service.notifyInquiryCreated({
        inquiryId: 'inq-123',
        type: 'PRODUCT',
        customerName: 'شرکت پلاستیک پارس',
        customerMobile: '09121112233',
      });

      expect(provider.sentMessages).toHaveLength(1);
      expect(provider.sentMessages[0]).toMatchObject({
        template: 'INQUIRY_CREATED_ADMIN',
        tokens: expect.objectContaining({
          inquiryId: 'inq-123',
          type: 'PRODUCT',
        }),
      });
    });
  });

  describe('quotation issuance notification', () => {
    it('dispatches customer SMS when quotation is issued', async () => {
      await service.notifyQuotationIssued({
        inquiryId: 'inq-456',
        quotationNumber: 1001,
        customerName: 'علی رضایی',
        customerMobile: '09351234567',
      });

      expect(provider.sentMessages).toHaveLength(1);
      expect(provider.sentMessages[0]).toMatchObject({
        to: '09351234567',
        template: 'QUOTATION_ISSUED_CUSTOMER',
        tokens: expect.objectContaining({
          quotationNumber: '1001',
          inquiryId: 'inq-456',
        }),
      });
    });
  });

  describe('inquiry message notification', () => {
    it('dispatches customer SMS when staff posts a message', async () => {
      await service.notifyInquiryMessage({
        inquiryId: 'inq-789',
        customerName: 'محمد احمدی',
        customerMobile: '+989129876543',
        senderRole: 'STAFF',
      });

      expect(provider.sentMessages).toHaveLength(1);
      expect(provider.sentMessages[0]).toMatchObject({
        to: '09129876543',
        template: 'INQUIRY_MESSAGE_CUSTOMER',
        tokens: expect.objectContaining({
          inquiryId: 'inq-789',
        }),
      });
    });
  });

  describe('error isolation', () => {
    it('does not throw when the SMS provider fails', async () => {
      vi.spyOn(provider, 'send').mockRejectedValueOnce(new Error('Upstream SMS gateway timeout'));

      await expect(
        service.notifyInquiryCreated({
          inquiryId: 'inq-999',
          type: 'PRODUCT',
          customerName: 'تست',
          customerMobile: '09120000000',
        }),
      ).resolves.not.toThrow();
    });
  });
});
