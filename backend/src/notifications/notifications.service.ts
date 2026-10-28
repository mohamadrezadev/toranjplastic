import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SMS_PROVIDER,
  maskPhone,
  normalizeIranMobile,
  type SmsProvider,
} from './sms/sms.types.js';

export interface NotifyInquiryCreatedOptions {
  inquiryId: string;
  trackingNumber?: string;
  type: string;
  customerName: string;
  customerMobile: string;
}

export interface NotifyQuotationIssuedOptions {
  inquiryId: string;
  quotationNumber: string | number;
  customerMobile: string;
  customerName: string;
}

export interface NotifyInquiryMessageOptions {
  inquiryId: string;
  customerMobile: string;
  customerName: string;
  senderRole: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(@Inject(SMS_PROVIDER) private readonly smsProvider: SmsProvider) {}

  /**
   * Alert the administration team that a new inquiry was registered.
   */
  async notifyInquiryCreated(options: NotifyInquiryCreatedOptions): Promise<void> {
    const adminMobileRaw = process.env.ADMIN_NOTIFICATION_MOBILE || process.env.BOOTSTRAP_ADMIN_MOBILE || '09120000000';
    const adminMobile = normalizeIranMobile(adminMobileRaw);

    if (!adminMobile) {
      this.logger.warn(`Could not send inquiry created SMS: admin mobile ${maskPhone(adminMobileRaw)} is invalid.`);
      return;
    }

    try {
      await this.smsProvider.send({
        to: adminMobile,
        template: 'INQUIRY_CREATED_ADMIN',
        tokens: {
          inquiryId: options.inquiryId,
          type: options.type,
          customer: options.customerName || 'کاربر',
          mobile: maskPhone(options.customerMobile),
        },
      });
    } catch (err: any) {
      this.logger.error(`Error sending inquiry created notification: ${err.message}`);
    }
  }

  /**
   * Alert the customer that their official quotation was issued.
   */
  async notifyQuotationIssued(options: NotifyQuotationIssuedOptions): Promise<void> {
    const customerMobile = normalizeIranMobile(options.customerMobile);

    if (!customerMobile) {
      this.logger.warn(`Could not send quotation SMS: customer mobile ${maskPhone(options.customerMobile)} is invalid.`);
      return;
    }

    try {
      await this.smsProvider.send({
        to: customerMobile,
        template: 'QUOTATION_ISSUED_CUSTOMER',
        tokens: {
          customer: options.customerName || 'مشتری گرامی',
          quotationNumber: String(options.quotationNumber),
          inquiryId: options.inquiryId,
        },
      });
    } catch (err: any) {
      this.logger.error(`Error sending quotation issued notification: ${err.message}`);
    }
  }

  /**
   * Alert the customer that a new message was posted by staff on their inquiry.
   */
  async notifyInquiryMessage(options: NotifyInquiryMessageOptions): Promise<void> {
    const customerMobile = normalizeIranMobile(options.customerMobile);

    if (!customerMobile) {
      this.logger.warn(`Could not send message SMS: customer mobile ${maskPhone(options.customerMobile)} is invalid.`);
      return;
    }

    try {
      await this.smsProvider.send({
        to: customerMobile,
        template: 'INQUIRY_MESSAGE_CUSTOMER',
        tokens: {
          customer: options.customerName || 'مشتری گرامی',
          inquiryId: options.inquiryId,
        },
      });
    } catch (err: any) {
      this.logger.error(`Error sending message notification: ${err.message}`);
    }
  }
}
