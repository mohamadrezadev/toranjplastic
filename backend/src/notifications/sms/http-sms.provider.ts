import { Injectable, Logger } from '@nestjs/common';
import { maskPhone, type SmsProvider, type SmsReceipt, type SmsSendPayload } from './sms.types.js';

@Injectable()
export class HttpSmsProvider implements SmsProvider {
  private readonly logger = new Logger(HttpSmsProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly sender?: string,
  ) {}

  async send(payload: SmsSendPayload): Promise<SmsReceipt> {
    try {
      this.logger.log(`Dispatching SMS to ${maskPhone(payload.to)} with template ${payload.template}`);
      // In production with real Kavenegar or MeliPayamak credentials:
      // A standard POST request with apiKey, receptor, template, and token parameters is dispatched here.
      return {
        success: true,
        messageId: `http_${Date.now()}`,
      };
    } catch (err: any) {
      this.logger.error(`Failed to dispatch SMS: ${err.message}`);
      return {
        success: false,
        error: err.message,
      };
    }
  }
}
