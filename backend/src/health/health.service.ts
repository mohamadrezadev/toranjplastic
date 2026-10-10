import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  status: 'ok';
  service: 'toranj-backend';
  version: string;
  timestamp: string;
}

@Injectable()
export class HealthService {
  getHealth(now = new Date()): HealthResponse {
    return {
      status: 'ok',
      service: 'toranj-backend',
      version: process.env.APP_VERSION ?? '0.0.1',
      timestamp: now.toISOString(),
    };
  }
}
