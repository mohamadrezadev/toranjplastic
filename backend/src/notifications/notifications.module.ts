import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notifications.service.js';
import { SMS_PROVIDER } from './sms/sms.types.js';
import { MockSmsProvider } from './sms/mock-sms.provider.js';
import { HttpSmsProvider } from './sms/http-sms.provider.js';

@Global()
@Module({
  providers: [
    {
      provide: SMS_PROVIDER,
      useFactory: () => {
        const apiKey = process.env.SMS_API_KEY;
        const providerName = process.env.SMS_PROVIDER;

        if (apiKey && providerName && providerName !== 'mock') {
          return new HttpSmsProvider(apiKey, process.env.SMS_SENDER);
        }

        return new MockSmsProvider();
      },
    },
    NotificationService,
  ],
  exports: [NotificationService, SMS_PROVIDER],
})
export class NotificationsModule {}
