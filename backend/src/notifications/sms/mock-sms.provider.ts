import { Injectable, Logger } from '@nestjs/common';
import { maskPhone, type SmsProvider, type SmsReceipt, type SmsSendPayload } from './sms.types.js';

@Injectable()
export class MockSmsProvider implements SmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);
  public readonly sentMessages: SmsSendPayload[] = [];

  async send(payload: SmsSendPayload): Promise<SmsReceipt> {
    this.sentMessages.push(payload);
    this.logger.log(
      `[MOCK SMS SENT] To: ${maskPhone(payload.to)}, Template: ${payload.template}, Tokens: ${JSON.stringify(payload.tokens)}`
    );
    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
  }
}
