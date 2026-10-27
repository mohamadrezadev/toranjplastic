import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module.js';
import { HealthController, ReadyController } from './health.controller.js';
import { HealthService } from './health.service.js';

@Module({
  imports: [MediaModule],
  controllers: [HealthController, ReadyController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
