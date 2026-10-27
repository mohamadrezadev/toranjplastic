import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService, type HealthResponse, type ReadyResponse } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }
}

@Controller('ready')
export class ReadyController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getReady(): Promise<ReadyResponse> {
    const readiness = await this.healthService.getReadiness();
    if (readiness.status !== 'ready') {
      throw new HttpException(readiness, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return readiness;
  }
}
